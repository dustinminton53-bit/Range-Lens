/* Range Lens: deterministic, causal range analysis. No prediction probabilities. */
(function(root){
 const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
 function validateCandles(c){
  if(!Array.isArray(c)||c.length<3||c.some((x,i)=>!['t','o','h','l','c'].every(k=>Number.isFinite(x[k]))||x.l<=0||x.h<Math.max(x.o,x.c,x.l)||x.l>Math.min(x.o,x.c)||(i&&x.t<=c[i-1].t)))throw Error('Invalid or unordered candle history.');
 }
 function atrAt(c,i){const start=Math.max(1,i-13);return mean(c.slice(start,i+1).map((x,j)=>{const p=c[start+j-1];return Math.max(x.h-x.l,Math.abs(x.h-p.c),Math.abs(x.l-p.c))}))||c[i].c*.000001;}
 function swings(c){const out=[];for(let i=2;i<c.length-2;i++){const n=[c[i-2],c[i-1],c[i+1],c[i+2]];for(const side of ['high','low']){const k=side==='high'?'h':'l',v=c[i][k];if(n.every(x=>side==='high'?v>=x[k]:v<=x[k])&&n.some(x=>v!==x[k])){const prior=out.filter(p=>p.side===side).at(-1);if(!prior||i-prior.index>2||v!==prior.price)out.push({side,price:v,index:i,time:c[i].t,confirmedAt:c[i+2].t,confirmedIndex:i+2})}}}return out;}
 function clusters(points,tolerance){const groups=[];for(const p of [...points].sort((a,b)=>a.price-b.price)){let g=groups.at(-1);if(!g||p.price-g.min>tolerance){g={min:p.price,max:p.price,points:[],price:0};groups.push(g)}g.points.push(p);g.max=p.price;g.price=mean(g.points.map(x=>x.price));}return groups.map(g=>({...g,count:g.points.length}));}
 function detectFVGs(c){
  const gaps=[];for(let i=2;i<c.length;i++){const a=c[i-2],b=c[i-1],d=c[i];if(b.t-a.t!==d.t-b.t)continue;const atr=atrAt(c,i-1);if(Math.abs(b.c-b.o)<atr*.5)continue;
   let side,lo,hi;if(d.l>a.h&&b.c>b.o){side='bullish';lo=a.h;hi=d.l}else if(d.h<a.l&&b.c<b.o){side='bearish';lo=d.h;hi=a.l}else continue;
   if(hi-lo<atr*.15)continue;
   let status='untouched',filledAt=null,firstTouch=null,invalidatedAt=null,remainingLo=lo,remainingHi=hi;
   for(let j=i+1;j<c.length;j++){const x=c[j],touch=x.l<=hi&&x.h>=lo;
    if(touch&&firstTouch===null)firstTouch=x.t;
    if(touch&&status!=='filled'){status='partial';if(side==='bullish')remainingHi=Math.min(remainingHi,Math.max(lo,x.l));else remainingLo=Math.max(remainingLo,Math.min(hi,x.h));}
    if(status!=='filled'&&touch&&(side==='bullish'?x.l<=lo:x.h>=hi)){status='filled';filledAt=x.t;remainingLo=remainingHi=side==='bullish'?lo:hi;}
    if(invalidatedAt===null&&(side==='bullish'?x.c<lo:x.c>hi))invalidatedAt=x.t;
   }
   gaps.push({side,lo,hi,formedAt:d.t,formedIndex:i,status,firstTouch,filledAt,invalidatedAt,remainingLo,remainingHi});
  }return gaps;
 }
 function structuralHistory(c,pivots){
  const history=[];let active=null,since=0;
  for(let end=23;end<c.length;end++){
   if(active){const now=c[end],prev=c[end-1];let dir=now.c>active.ceiling+active.pad&&prev.c>active.ceiling+active.pad?'up':now.c<active.floor-active.pad&&prev.c<active.floor-active.pad?'down':null;if(dir){active.brokenAt=now.t;active.brokenIndex=end;active.breakDirection=dir;active=null;since=end;} }
   for(const r of history){if(r.brokenIndex===undefined||end<=r.brokenIndex||r.retestAt)continue;const edge=r.breakDirection==='up'?r.ceiling:r.floor,x=c[end];if(x.l<=edge+r.pad&&x.h>=edge-r.pad){r.retestAt=x.t;r.retestHeld=r.breakDirection==='up'?x.c>=edge:x.c<=edge;}}
   if(active)continue;
   for(const size of [24,48,72]){
    const start=end-size+1;if(start<since||start<0)continue;
    const atr=atrAt(c,end),points=pivots.filter(p=>p.index>=start&&p.confirmedIndex<=end);
    const highs=clusters(points.filter(p=>p.side==='high'),atr*.7).filter(g=>g.count>=2).sort((a,b)=>b.count-a.count||b.price-a.price);
    const lows=clusters(points.filter(p=>p.side==='low'),atr*.7).filter(g=>g.count>=2).sort((a,b)=>b.count-a.count||a.price-b.price);
    let found=null;
    for(const h of highs)for(const l of lows){const floor=l.price,ceiling=h.price,width=ceiling-floor;if(width<atr*2||width>atr*14)continue;const pad=Math.min(width*.1,atr*.4),bars=c.slice(start,end+1);const containment=bars.filter(x=>x.c>=floor-pad&&x.c<=ceiling+pad).length/bars.length;const net=Math.abs(bars.at(-1).c-bars[0].c);if(containment<.8||net>width*.65||bars.slice(-2).some(x=>x.c<floor-pad||x.c>ceiling+pad))continue;const score=h.count+l.count+containment;if(!found||score>found.score)found={id:c[end].t,floor,ceiling,width,pad,startTime:c[start].t,establishedAt:c[end].t,establishedIndex:end,topTouches:h.count,bottomTouches:l.count,containment,score};}
    if(found){active=found;history.push(active);break;}
   }
  }return {active,history};
 }
 function analyze(input,price){
  if(!Array.isArray(input)||input.length<60)throw Error('At least 60 closed candles are required.');const c=input.slice(-720);validateCandles(c);if(!Number.isFinite(price)||price<=0)throw Error('Invalid price');
  const atr=atrAt(c,c.length-1),pivots=swings(c),{active,history}=structuralHistory(c,pivots),fvgs=detectFVGs(c),r=active||history.at(-1)||null;
  const floor=r?.floor??null,ceiling=r?.ceiling??null,pad=r?.pad??0,width=r?.width??0,pos=width?(price-floor)/width:null;
  const outside=active&&(price<floor-pad||price>ceiling+pad);
  const status=active?(outside?'OUTSIDE RANGE':'RANGE HOLDING'):r?(r.breakDirection==='up'?'BREAKOUT UP':'BREAKDOWN'):'UNCLEAR';
  const valid=!!active&&!outside;
  const reason=active?`Range formed ${new Date(active.establishedAt*1000).toISOString().slice(0,16).replace('T',' ')} UTC from ${active.bottomTouches} clustered swing lows and ${active.topTouches} swing highs. Boundaries stay pinned until two closes break them.`:r?'The latest confirmed consolidation broke. Its old boundaries are shown for context, not as an active range.':'No consolidation with repeated swing highs and lows meets the rules. No range is invented.';
  return {floor,ceiling,pad,width,pos,atr,status,valid,reason,context:!valid?'Wait · no confirmed range':pos<.4?'Lower part of range':pos>.6?'Upper part of range':'Middle of range',bottomTouches:r?.bottomTouches||0,topTouches:r?.topTouches||0,price,candles:c,history,activeRange:active,fvgs,swings:pivots,levels:clusters(pivots,atr*.5).filter(g=>g.count>=2)};
 }
 function fixture(kind='range',interval=15){
  const end=Math.floor(Date.now()/60000/interval)*interval*60000;
  return Array.from({length:100},(_,i)=>{const p=kind==='trend'?1.42+i*.0015:1.50+Math.sin(i*Math.PI/10)*.014;const close=kind==='breakout'&&i>96?1.54:p;return {t:end/1000-(100-i)*interval*60,o:close-.001*Math.cos(i),h:close+.002,l:close-.002,c:close,v:1000+i*7}});
 }

 function trend(input){
  if(!Array.isArray(input)||input.length<80)throw Error('Trend needs 80 closed candles.');
  const c=input.slice(-240);validateCandles(c);
  if(c.some((x,i)=>!['t','o','h','l','c'].every(k=>Number.isFinite(x[k]))||(i&&x.t<=c[i-1].t)))throw Error('Invalid trend history');
  const ema=n=>{let v=c[0].c;return c.map(x=>(v+=2/(n+1)*(x.c-v)))};
  const fast=ema(20),slow=ema(50),price=c.at(-1).c;
  const atr=mean(c.slice(-14).map((x,j)=>{const prev=c[c.length-15+j];return Math.max(x.h-x.l,Math.abs(x.h-prev.c),Math.abs(x.l-prev.c))}));
  const scale=Math.max(atr,price*.000001),gap=(fast.at(-1)-slow.at(-1))/scale,slope=(fast.at(-1)-fast.at(-6))/scale;
  const direction=price>fast.at(-1)&&gap>.2&&slope>.15?'RISING':price<fast.at(-1)&&gap<-.2&&slope<-.15?'FALLING':Math.abs(gap)<.35&&Math.abs(slope)<.2?'SIDEWAYS':'MIXED';
  return {direction,gap,slope,barTime:c.at(-1).t,reason:direction==='RISING'?'Close above EMA20 > EMA50; EMA20 rising.':direction==='FALLING'?'Close below EMA20 < EMA50; EMA20 falling.':direction==='SIDEWAYS'?'Moving averages are close and momentum is flat.':'Price, moving averages and momentum disagree.'};
 }
 function combineTrends(a,b){
  if(!a||!b)return {direction:'UNAVAILABLE',reason:'Both timeframe feeds are required.'};
  return {direction:a.direction===b.direction?a.direction:'MIXED',reason:a.direction===b.direction?`Both timeframes ${a.direction.toLowerCase()}.`:'Timeframes disagree; no aligned direction.'};
 }
 function alignment(short,long){
  if(!short||!long||[short.direction,long.direction].includes('UNAVAILABLE'))return 'Trend context unavailable — wait for both feeds.';
  if(short.direction==='RISING'&&long.direction==='RISING')return 'Both trends rising · ceiling alone is not a short signal.';
  if(short.direction==='FALLING'&&long.direction==='FALLING')return 'Both trends falling · floor alone is not a long signal.';
  if(short.direction==='FALLING'&&long.direction==='RISING')return 'Short-term decline within a broader uptrend · reversal unconfirmed.';
  if(short.direction==='RISING'&&long.direction==='FALLING')return 'Short-term rally within a broader downtrend · reversal unconfirmed.';
  return 'Trends are sideways or mixed · no aligned directional signal.';
 }

 function momentum(a){
  const c=a.candles, last=c.at(-1), base=c.at(-4), atr=a.atr;
  const move=(a.price-base.c)/atr, live=(a.price-last.c)/atr;
  const local=c.length>=80?trend(c).direction:'MIXED';
  return {up:local==='RISING'||move>=1||live>=.7,down:local==='FALLING'||move<=-1||live<=-.7};
 }
 function setups(a,short,long){
  const missing=!short||!long||['UNAVAILABLE','PARTIAL'].includes(short.direction)||['UNAVAILABLE','PARTIAL'].includes(long.direction);
  return ['long','short'].map(side=>{
   const buy=side==='long',lo=buy?a.floor-a.pad:a.ceiling-a.pad,hi=buy?a.floor+a.pad:a.ceiling+a.pad;
   const entry=buy?hi+a.atr*.5:lo-a.atr*.5; // conservative end of confirmation band
   const invalidation=buy?lo-a.atr*.5:hi+a.atr*.5,target=buy?a.ceiling-a.pad:a.floor+a.pad;
   const risk=Math.abs(entry-invalidation),reward=buy?target-entry:entry-target,rr=risk>0?reward/risk:0;
   const opposing=buy?'FALLING':'RISING', impulse=momentum(a);
   const opposition=[short,long].some(t=>t?.direction===opposing||t?.components?.includes(opposing));
   let blocked=(buy?impulse.down:impulse.up)?(buy?'Downward momentum — long blocked.':'Upward momentum — short blocked.'):opposition?'A timeframe opposes this range setup.':!a.valid?'No reliable sideways range.':(a.pos<0||a.pos>1)?'Price has left the range.':buy&&a.pos>.25?'Wait for the lower quarter; do not chase a long here.':!buy&&a.pos<.75?'Wait for the upper quarter; do not chase a short here.':missing?'Trend data incomplete.':rr<1.5?'Potential reward is too small for the invalidation distance.':null;
   const bars=a.candles,last=bars.at(-1),prev=bars.at(-2);
   const touched=buy?Math.min(last.l,prev.l)<=hi&&Math.min(last.l,prev.l)>=invalidation:Math.max(last.h,prev.h)>=lo&&Math.max(last.h,prev.h)<=invalidation;
   const confirmed=touched&&(buy?last.c>hi&&last.c>last.o&&a.price>=hi&&a.price<=entry:last.c<lo&&last.c<last.o&&a.price<=lo&&a.price>=entry);
   return {side,lo,hi,entry,invalidation,target,rr,status:blocked?'Wait':confirmed?'Reaction observed':'Watch zone',reason:blocked||(buy?'Wait for a closed candle back above the lower zone.':'Wait for a closed candle back below the upper zone.'),confirmed:!blocked&&confirmed};
  });
 }

 function guardrail(a,short,long){
  if(a){const m=momentum(a);if(m.up&&m.down)return {tone:'wait',title:'Momentum conflict. Both entries blocked.',detail:'Live movement and closed-candle trend disagree. Wait for a clearer structure.',long:'Blocked',short:'Blocked'};if(m.up&&!m.down)return {tone:'wait',title:'Upward momentum. Short blocked.',detail:'An old ceiling is not a reversal signal. Wait for momentum to settle and reassess; do not chase the move.',long:'Wait',short:'Blocked'};if(m.down&&!m.up)return {tone:'wait',title:'Downward momentum. Long blocked.',detail:'An old floor is not a reversal signal. Wait for momentum to settle and reassess; do not chase the move.',long:'Blocked',short:'Wait'};if(a.pos>1||a.pos<0)return {tone:'wait',title:a.pos>1?'Above range. Breakout possible.':'Below range. Breakdown possible.',detail:'Range entries suspended. Wait for closed-candle confirmation and a retest.',long:'Wait',short:'Wait'};}
  if(!a||!a.valid||a.pos<0||a.pos>1)return {tone:'wait',title:'Range unclear. Sit this one out.',detail:'Wait for a stable range before looking for an edge.',long:'Wait',short:'Wait'};
  const plans=setups(a,short,long);
  if(a.pos>.25&&a.pos<.75)return {tone:'wait',title:'Middle of the range? Wait.',detail:'Let price come to an edge. Neither side has a range entry here.',long:'Wait for lower zone',short:'Wait for upper zone'};
  const side=a.pos<=.25?'long':'short',plan=plans.find(p=>p.side===side);
  if(plan.status==='Wait')return {tone:'wait',title:'At the edge. Still wait.',detail:plan.reason,long:'Wait',short:'Wait'};
  return {tone:side,title:side==='long'?'Lower edge. Watch for a bounce.':'Upper edge. Watch for a rejection.',detail:plan.confirmed?'A closed-bar reaction appeared. Recheck price and risk; this is not an order signal.':'Touching the zone is not confirmation. Wait for a closed-candle reaction.',long:side==='long'?plan.status:'Avoid chasing a long',short:side==='short'?plan.status:'Avoid chasing a short'};
 }

 function takeProfits(a,entry,side){
  if(!Number.isFinite(entry)||entry<=0)return {targets:[],message:'Enter a positive entry price.'};
  if(!['long','short'].includes(side))return {targets:[],message:'Choose Long or Short.'};
  if(!a)return {targets:[],message:'Waiting for fresh structure data.'};
  const buy=side==='long',candidates=[];
  for(const r of a.history||[]){candidates.push({price:r.floor,label:(r.brokenAt?'Prior':'Confirmed')+' range floor',time:r.establishedAt});candidates.push({price:r.ceiling,label:(r.brokenAt?'Prior':'Confirmed')+' range ceiling',time:r.establishedAt});}
  for(const l of a.levels||[])candidates.push({price:l.price,label:l.count+' clustered swing reactions',time:Math.max(...l.points.map(p=>p.confirmedAt))});
  for(const g of a.fvgs||[]){if(g.status==='filled'||g.invalidatedAt)continue;const near=buy?g.remainingLo:g.remainingHi;candidates.push({price:near,label:g.side+' FVG · '+g.status+' · near edge',time:g.formedAt});}
  const tolerance=Math.max(0,a.atr*.5),zones=[];
  const ahead=candidates.filter(t=>Number.isFinite(t.price)&&(buy?t.price>entry&&t.price>a.price:t.price<entry&&t.price<a.price)).sort((x,y)=>x.price-y.price);
  for(const t of ahead){let zone=zones.at(-1);if(!zone||t.price-zone.lo>tolerance){zone={lo:t.price,hi:t.price,sources:[]};zones.push(zone)}zone.hi=t.price;zone.sources.push(t);}
  const targets=(buy?zones:zones.reverse()).slice(0,3).map(z=>{const price=buy?z.lo:z.hi;return {...z,price,label:[...new Set(z.sources.map(t=>t.label))].join(' + '),time:Math.max(...z.sources.map(t=>t.time)),percent:100*(buy?price-entry:entry-price)/entry,farPercent:100*(buy?z.hi-entry:entry-z.lo)/entry,beyond:false}});
  return {targets,message:targets.length?'Nearest distinct target zones on the chart timeframe. Nearby structures within 0.5 ATR are merged; each zone spans at most 0.5 ATR. Candidates, not predictions or saved orders.':'No qualifying structural target ahead. No midpoint or percentage target is invented.'};
 }
 root.RangeLens={analyze,fixture,trend,combineTrends,alignment,momentum,setups,guardrail,takeProfits,swings,detectFVGs,structuralHistory};if(typeof module!=='undefined')module.exports=root.RangeLens;
})(globalThis);
