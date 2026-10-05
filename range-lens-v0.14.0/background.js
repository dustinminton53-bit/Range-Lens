chrome.action.onClicked.addListener(async tab=>{
 if(!tab.id||!/^https?:/.test(tab.url||''))return;
 try{await chrome.scripting.executeScript({target:{tabId:tab.id},files:['engine.js','ui.js','chart-sync.js','market-sync.js','content.js']})}catch(e){console.warn('Range Lens:',e.message)}
});
const cache=new Map(),pending=new Map(),failures=new Map();
let queue=Promise.resolve();
function queuedFetch(url){const task=queue.then(async()=>{const r=await fetch(url,{signal:AbortSignal.timeout(10000),cache:'no-store'});if(!r.ok)throw Error('Market feed HTTP '+r.status);let data;try{data=await r.json()}catch{throw Error('Feed returned non-JSON. Check network access.')}if(data.error?.length)throw Error(data.error.join('; '));return data});queue=task.catch(()=>{});return task;}
function validate(candles){
 if(candles.length<80)throw Error('Not enough closed candles: '+candles.length+' of 80 required');
 if(candles.some((c,i)=>!['t','o','h','l','c'].every(k=>Number.isFinite(c[k]))||c.l<=0||c.h<Math.max(c.o,c.c,c.l)||c.l>Math.min(c.o,c.c)||(i&&c.t<=candles[i-1].t)))throw Error('Invalid candle history');
}
function aggregate4h(candles){
 const groups=new Map();for(const c of candles){const t=Math.floor(c.t/14400)*14400;if(!groups.has(t))groups.set(t,[]);groups.get(t).push(c)}
 const result=[];for(const [t,b] of groups){b.sort((a,b)=>a.t-b.t);if(b.length!==4||!b.every((c,i)=>c.t===t+i*3600)||t+14400>Date.now()/1000)continue;result.push({t,o:b[0].o,h:Math.max(...b.map(c=>c.h)),l:Math.min(...b.map(c=>c.l)),c:b[3].c,v:b.reduce((s,c)=>s+(c.v||0),0)})}return result.sort((a,b)=>a.t-b.t);
}
function aggregate12h(candles){
 const groups=new Map();for(const c of candles){const t=Math.floor(c.t/43200)*43200;if(!groups.has(t))groups.set(t,[]);groups.get(t).push(c)}
 const out=[];for(const [t,b] of groups){b.sort((a,b)=>a.t-b.t);if(b.length!==3||!b.every((c,i)=>c.t===t+i*14400)||t+43200>Date.now()/1000)continue;out.push({t,o:b[0].o,h:Math.max(...b.map(c=>c.h)),l:Math.min(...b.map(c=>c.l)),c:b[2].c,v:b.reduce((s,c)=>s+(c.v||0),0)})}return out.sort((a,b)=>a.t-b.t);
}
function aggregate10m(candles){
 const groups=new Map();for(const c of candles){const t=Math.floor(c.t/600)*600;if(!groups.has(t))groups.set(t,[]);groups.get(t).push(c)}
 return [...groups].flatMap(([t,b])=>{b.sort((a,b)=>a.t-b.t);return b.length===2&&b[0].t===t&&b[1].t===t+300&&t+600<=Date.now()/1000?[{t,o:b[0].o,h:Math.max(...b.map(c=>c.h)),l:Math.min(...b.map(c=>c.l)),c:b[1].c,v:b.reduce((n,c)=>n+(c.v||0),0)}]:[]}).sort((a,b)=>a.t-b.t);
}
async function market(pair,interval,force=false){
 const key=pair+':'+interval,old=cache.get(key),failure=failures.get(key);
 if(!force&&old&&Date.now()-old.fetchedAt<12000)return old;
 if(pending.has(key))return pending.get(key);
 if(!force&&failure&&Date.now()<failure.retryAt)throw Error(failure.message+' · retry in '+Math.ceil((failure.retryAt-Date.now())/1000)+'s');
 const task=(async()=>{
  try{
   let result;
   if(interval===10){const five=await market(pair,5,force);const candles=aggregate10m(five.candles);validate(candles);if(Date.now()/1000-candles.at(-1).t>1290)throw Error('10m candles are stale');result={candles,price:five.price,candleTime:five.candleTime,fetchedAt:five.fetchedAt,interval:10,source:'10m built from complete UTC-aligned 5m candles',warning:five.warning};cache.set(key,result);failures.delete(key);return result;}
   if(interval===720){const four=await market(pair,240,force);const candles=aggregate12h(four.candles);validate(candles);if(Date.now()/1000-candles.at(-1).t>86490)throw Error('12h candles are stale');result={candles,price:four.price,candleTime:four.candleTime,fetchedAt:four.fetchedAt,interval:720,source:'12h built from complete 4h candles',warning:four.warning};cache.set(key,result);failures.delete(key);return result;}

   try{
    const data=await queuedFetch('https://api.kraken.com/0/public/OHLC?pair='+pair+'&interval='+interval);
    const rows=Object.entries(data.result||{}).find(([k,v])=>k!=='last'&&Array.isArray(v))?.[1];if(!rows)throw Error('No candle history returned');
    const candles=rows.map(r=>({t:+r[0],o:+r[1],h:+r[2],l:+r[3],c:+r[4],v:+r[6]}));const current=candles.pop();validate(candles);
    if(!current||!Number.isFinite(current.t)||!Number.isFinite(current.c)||current.c<=0||current.t>Date.now()/1000+60||Date.now()/1000-current.t>interval*60+90)throw Error('Feed candles are stale or invalid');
    result={candles,price:current.c,candleTime:current.t,fetchedAt:Date.now(),source:'Kraken spot',interval};
   }catch(e){
    if(interval!==240)throw e;
    // Genuine 4h candles from complete UTC-aligned 1h groups, never a substituted 1h signal.
    try{const hourly=await market(pair,60,force);const candles=aggregate4h(hourly.candles);validate(candles);if(Date.now()/1000-candles.at(-1).t>28890)throw Error('Derived 4h candles are stale');result={candles,price:hourly.price,candleTime:hourly.candleTime,fetchedAt:hourly.fetchedAt,source:'4h built from 1h candles',interval:240,warning:'Direct 4h feed: '+e.message};}
    catch(fallback){throw Error('4h feed: '+e.message+'; hourly fallback: '+fallback.message)}
   }
   cache.set(key,result);failures.delete(key);return result;
  }catch(e){const attempts=(failure?.attempts||0)+1;failures.set(key,{attempts,message:e.message,retryAt:Date.now()+Math.min(120000,15000*2**(attempts-1))});throw e;}
 })();pending.set(key,task);try{return await task}finally{pending.delete(key)}
}

let catalogCache=null,catalogPending=null;
const canonical=s=>s==='XBT'?'BTC':s==='XDG'?'DOGE':s;
async function catalog(){
 if(catalogCache&&Date.now()-catalogCache.time<3600000)return catalogCache.rows;
 if(catalogPending)return catalogPending;
 catalogPending=queuedFetch('https://api.kraken.com/0/public/AssetPairs').then(d=>{const rows=Object.values(d.result||{}).filter(p=>p.wsname&&p.altname&&p.status==='online').map(p=>{const [base,quote]=p.wsname.split('/');return {pair:p.altname,base:canonical(base),quote,label:p.wsname}});catalogCache={time:Date.now(),rows};return rows}).finally(()=>catalogPending=null);return catalogPending;
}
async function resolveMarket(base,quote){
 if(!/^[A-Z0-9]{2,20}$/.test(base||'')||!['USD','USDT','USDC'].includes(quote))throw Error('Unsupported chart market or quote');
 const rows=await catalog(),matches=rows.filter(p=>p.base===canonical(base));
 const m=matches.find(p=>p.quote===quote)||matches.find(p=>p.quote==='USD');
 if(!m)throw Error('Unsupported market: '+base+'/'+quote+' — no Kraken reference');return {...m,chartLabel:base+'/'+quote};
}
chrome.runtime.onMessage.addListener((m,sender,reply)=>{
 if(m?.type==='RANGE_LENS_GAME'){if(!sender.tab){reply({error:'A chart tab is required'});return}chrome.tabs.create({url:chrome.runtime.getURL('stillwater.html')}).then(()=>reply({ok:true})).catch(e=>reply({error:e.message}));return true}
 if(!['RANGE_LENS_DATA','RANGE_LENS_RESOLVE'].includes(m?.type))return;
 if(!sender.tab){reply({error:'A chart tab is required'});return;}
 const task=m.type==='RANGE_LENS_RESOLVE'?resolveMarket(m.base,m.quote):(async()=>{if(![1,5,10,15,30,60,240,720,1440].includes(m.interval))throw Error('Unsupported timeframe');const rows=await catalog();if(!rows.some(p=>p.pair===m.pair))throw Error('Unsupported market');return market(m.pair,m.interval,m.force===true)})();
 task.then(reply).catch(e=>reply({error:e.message||'Feed unavailable'}));return true;
});
