(function(root){
 const parse=text=>{const m=String(text).trim().toUpperCase().match(/^([A-Z0-9]{2,20})\s*[/_\-]?\s*(USDT|USDC|USD)$/);return m?{base:m[1],quote:m[2],key:m[1]+'/'+m[2]}:null};
 function detect(doc){
  const candidates=[];
  for(const e of doc.querySelectorAll('span,a,button,h1,h2,div')){
   if(e.closest('#range-lens-overlay')||e.children.length>2)continue;
   const text=e.textContent?.trim();if(!text||text.length>32)continue;
   const p=parse(text);if(!p)continue;
   const r=e.getBoundingClientRect();if(r.width<=0||r.height<=0||r.top<0||r.top>220||r.left<0||r.left>innerWidth*.55||r.width>350)continue;
   candidates.push(p);
  }
  const unique=[...new Map(candidates.map(p=>[p.key,p])).values()];
  if(unique.length===1)return unique[0];if(unique.length>1)return null;
  const url=new URL(doc.location.href), hints=[];
  for(const k of ['symbol','pair','market']){const p=parse(url.searchParams.get(k));if(p)hints.push(p)}
  for(const part of url.pathname.split('/')){const p=parse(part);if(p)hints.push(p)}
  const title=doc.title.toUpperCase().match(/\b[A-Z0-9]{2,20}\s*[/_\-]?\s*(?:USDT|USDC|USD)\b/g)||[];
  for(const t of title){const p=parse(t);if(p)hints.push(p)}
  const result=[...new Map(hints.map(p=>[p.key,p])).values()];return result.length===1?result[0]:null;
 }
 function watch(doc,callback){let previous;const tick=()=>{const p=detect(doc),key=p?.key||'';if(key!==previous){previous=key;callback(p)}};tick();const timer=setInterval(tick,1000);return ()=>clearInterval(timer)}
 root.RangeLensMarketSync={parse,detect,watch};if(typeof module!=='undefined')module.exports=root.RangeLensMarketSync;
})(globalThis);
