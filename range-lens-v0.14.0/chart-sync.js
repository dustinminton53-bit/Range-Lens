/* Reads visible chart controls only. No screenshots, accounts, network interception or page scripts. */
(function(root){
 const supported=[1,5,10,15,30,60,240,720,1440];
 function parseTimeframe(text){const s=String(text||'').trim();if(/M$/.test(s))return null;const m=s.match(/^(\d+)\s*(m|min|h|hr|d|w)$/i);if(!m)return null;return +m[1]*(/^h/i.test(m[2])?60:/^d/i.test(m[2])?1440:/^w/i.test(m[2])?10080:1)}
 function choose(candidates){
  const ranked=candidates.filter(c=>c.score>0).sort((a,b)=>b.score-a.score);if(!ranked.length)return {interval:null,message:'Chart timeframe not detected'};
  const top=ranked.filter(c=>c.score===ranked[0].score),values=[...new Set(top.map(c=>c.interval))];if(values.length!==1)return {interval:null,message:'Multiple chart selections — cannot choose safely'};
  const interval=values[0];return supported.includes(interval)?{interval,message:'Following chart'}:{interval:null,message:'Chart timeframe is not supported ('+top[0].text+')'};
 }
 function detect(doc){
  const win=doc.defaultView;if(!win)return {interval:null,message:'Chart not accessible'};
  const elements=[...doc.querySelectorAll('button,[role="tab"],[role="button"],a,span,div')].filter(el=>{
   if(el.childElementCount>2||el.closest('#range-lens-overlay'))return false;
   if(parseTimeframe(el.textContent)===null)return false;
   const r=el.getBoundingClientRect(),s=win.getComputedStyle(el);return r.width>0&&r.height>0&&r.width<150&&s.display!=='none'&&s.visibility!=='hidden';
  });
  // Collapse nested labels into the control carrying the selected style.
  const candidates=[];
  for(const el of elements){
   let group=el.parentElement;for(let n=0;group&&n<4;n++,group=group.parentElement){
    if(group===doc.body||group===doc.documentElement)break;
    const peers=elements.filter(e=>group.contains(e));if(new Set(peers.map(e=>parseTimeframe(e.textContent))).size<3)continue;
    const rect=group.getBoundingClientRect();if(rect.height>160)break;
    let score=0,current=el;
    while(current&&current!==group){
     const cl=String(current.className||'');
     if(current.getAttribute('aria-selected')==='true'||current.getAttribute('aria-pressed')==='true'||current.getAttribute('data-state')==='active'||current.getAttribute('data-selected')==='true')score=Math.max(score,100);
     if(/(?:^|[\s_-])(active|selected|checked)(?:[\s_-]|$)/i.test(cl))score=Math.max(score,80);
     const style=win.getComputedStyle(current),border=parseFloat(style.borderTopWidth);
     if(border>0&&style.borderTopStyle!=='none'&&style.borderTopColor!=='transparent'&&style.borderTopColor!=='rgba(0, 0, 0, 0)')score=Math.max(score,20);
     current=current.parentElement;
    }
    candidates.push({interval:parseTimeframe(el.textContent),text:el.textContent.trim(),score});break;
   }
  }
  return choose(candidates);
 }
 function watch(doc,onChange){let last='',stopped=false;function scan(){if(stopped)return;const results=[detect(doc)];for(const frame of doc.querySelectorAll('iframe')){try{if(frame.contentDocument)results.push(detect(frame.contentDocument))}catch{}}
 const selected=results.filter(x=>x.interval!==null),unique=[...new Set(selected.map(x=>x.interval))];const result=unique.length>1?{interval:null,message:'Multiple visible charts — timeframe ambiguous'}:selected[0]||results.find(x=>x.message.includes('not supported'))||results[0];const key=JSON.stringify(result);if(key!==last){last=key;onChange(result.interval,result.message)}}
 const timer=setInterval(scan,1200);scan();return ()=>{stopped=true;clearInterval(timer)};
 }
 root.RangeLensChartSync={parseTimeframe,choose,detect,watch};if(typeof module!=='undefined')module.exports=root.RangeLensChartSync;
})(globalThis);
