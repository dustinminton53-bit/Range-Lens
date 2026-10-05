(()=>{
 if(globalThis.__rangeLens){globalThis.__rangeLens.destroy();globalThis.__rangeLens=null;return;}
 const host=document.createElement('div');host.id='range-lens-overlay';host.style.cssText='position:fixed;right:24px;top:70px;z-index:2147483647;';document.documentElement.append(host);
 const api=mountRangeLens(host,{
 load:(pair,interval,force)=>chrome.runtime.sendMessage({force,type:'RANGE_LENS_DATA',pair,interval}),
 onClose:()=>{api.destroy();globalThis.__rangeLens=null;},
 onDrag:header=>{let drag;header.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const r=host.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top};header.setPointerCapture(e.pointerId)});header.addEventListener('pointermove',e=>{if(!drag)return;host.style.left=Math.max(0,Math.min(innerWidth-host.offsetWidth,e.clientX-drag.x))+'px';host.style.top=Math.max(0,Math.min(innerHeight-55,e.clientY-drag.y))+'px';host.style.right='auto'});header.addEventListener('pointerup',()=>drag=null);header.addEventListener('lostpointercapture',()=>drag=null);}
 });const stopSync=RangeLensChartSync.watch(document,(interval,message)=>api.setChartInterval(interval,message));
 let marketEpoch=0,marketTimer,closed=false;
 const stopMarket=RangeLensMarketSync.watch(document,async detected=>{
  const epoch=++marketEpoch;clearTimeout(marketTimer);api.setMarket(null,detected?'Loading '+detected.key+'…':'Chart market not detected or ambiguous');
  if(!detected)return;
  const resolve=async()=>{try{const m=await chrome.runtime.sendMessage({type:'RANGE_LENS_RESOLVE',base:detected.base,quote:detected.quote});if(closed||epoch!==marketEpoch)return;if(!m||m.error)throw Error(m?.error||'Market lookup failed');api.setMarket(m)}catch(e){if(closed||epoch!==marketEpoch)return;api.setMarket(null,e.message);marketTimer=setTimeout(resolve,30000)}};await resolve();
 });
 const originalDestroy=api.destroy;api.destroy=()=>{closed=true;marketEpoch++;clearTimeout(marketTimer);stopMarket();stopSync();originalDestroy()};globalThis.__rangeLens=api;
})();
