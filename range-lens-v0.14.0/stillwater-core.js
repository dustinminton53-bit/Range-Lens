(function(root){
 const fish=[
 {id:'sunny',name:'Sunlit Minnow',color:'#e9c775',rarity:'Common',value:8,size:[8,17],strength:.65,weights:[45,22,9]},
 {id:'perch',name:'Moss Perch',color:'#9abf88',rarity:'Common',value:13,size:[16,32],strength:.8,weights:[30,30,14]},
 {id:'carp',name:'Copper Carp',color:'#ce9370',rarity:'Uncommon',value:24,size:[25,54],strength:1,weights:[15,24,22]},
 {id:'trout',name:'Glassfin Trout',color:'#9dd1d9',rarity:'Uncommon',value:35,size:[24,48],strength:1.1,weights:[8,18,28]},
 {id:'koi',name:'Moonblush Koi',color:'#dfaec4',rarity:'Rare',value:65,size:[32,65],strength:1.3,weights:[2,5,20]},
 {id:'eel',name:'Starfall Eel',color:'#b6abed',rarity:'Legendary',value:125,size:[55,105],strength:1.6,weights:[0,1,7]}
 ];
 const rods=[{id:'reed',name:'Reed rod',price:0,reach:.65,control:1,desc:'A gentle start. Shorter casts.'},{id:'willow',name:'Willow rod',price:90,reach:.85,control:1.25,desc:'Longer casts. Softer tension.'},{id:'moon',name:'Moonwood rod',price:260,reach:1,control:1.6,desc:'Reach deep water. Tame strong pulls.'}];
 const baits=[{id:'worm',name:'Earthworm',price:0,pack:0,desc:'Unlimited. Familiar pond fish.'},{id:'bug',name:'River insect',price:8,pack:5,desc:'Five casts. More trout and koi.'},{id:'glow',name:'Glow lure',price:25,pack:5,desc:'Five casts. Best chance of rare fish.'}];
 const fresh=()=>({version:1,username:'Angler',coins:0,rod:'reed',owned:['reed'],bait:'worm',stock:{bug:0,glow:0},bag:[],book:{},caught:0});
 function restore(raw){const p=fresh();if(!raw||raw.version!==1)return p;const int=n=>Number.isSafeInteger(n)&&n>=0&&n<=1e8;
 p.username=typeof raw.username==='string'&&raw.username.trim()?raw.username.trim().slice(0,24):'Angler';p.coins=int(raw.coins)?raw.coins:0;p.owned=rods.filter(r=>r.id==='reed'||raw.owned?.includes(r.id)).map(r=>r.id);p.rod=p.owned.includes(raw.rod)?raw.rod:'reed';for(const id of ['bug','glow'])p.stock[id]=int(raw.stock?.[id])?raw.stock[id]:0;p.bait=baits.some(b=>b.id===raw.bait)&&(raw.bait==='worm'||p.stock[raw.bait]>0)?raw.bait:'worm';p.bag=(Array.isArray(raw.bag)?raw.bag:[]).filter(c=>fish.some(f=>f.id===c.id)&&int(c.value)&&Number.isFinite(c.size)&&c.size>0).slice(-500);for(const f of fish)if(Number.isFinite(raw.book?.[f.id])&&raw.book[f.id]>0)p.book[f.id]=raw.book[f.id];p.caught=int(raw.caught)?raw.caught:0;if(raw.online&&typeof raw.online==='object')p.online=raw.online;if(raw.blackjack&&typeof raw.blackjack==='object')p.blackjack=raw.blackjack;return p;
 }
 function buyRod(p,id){const r=rods.find(r=>r.id===id);if(!r||p.owned.includes(id)||p.coins<r.price)return false;p.coins-=r.price;p.owned.push(id);p.rod=id;return true}
 function buyBait(p,id){const b=baits.find(b=>b.id===id);if(!b||!b.price||p.coins<b.price)return false;p.coins-=b.price;p.stock[id]+=b.pack;p.bait=id;return true}
 function consume(p){const used=p.bait;if(used!=='worm'){if(p.stock[used]<=0){p.bait='worm';return 'worm'}p.stock[used]--;if(!p.stock[used])p.bait='worm'}return used}
 function roll(depth,bait,rng=Math.random){const weights=fish.map((f,i)=>f.weights[depth]*(bait==='bug'?(i===3?2.5:i===4?1.7:1):bait==='glow'?(i>=4?3:i===3?1.5:1):1));let pick=rng()*weights.reduce((a,b)=>a+b,0),f=fish[0];for(let i=0;i<fish.length;i++){pick-=weights[i];if(pick<0){f=fish[i];break}}const size=Math.round((f.size[0]+rng()*(f.size[1]-f.size[0]))*10)/10;return {...f,size,value:Math.round(f.value*(.75+size/f.size[1]*.65))}}
 function land(p,f){p.bag.push({id:f.id,size:f.size,value:f.value});p.caught++;const record=!p.book[f.id]||f.size>p.book[f.id];p.book[f.id]=Math.max(p.book[f.id]||0,f.size);return record}
 function sell(p){const amount=p.bag.reduce((n,c)=>n+c.value,0);p.coins+=amount;p.bag=[];return amount}
 root.Stillwater={fish,rods,baits,fresh,restore,buyRod,buyBait,consume,roll,land,sell};if(typeof module!=='undefined')module.exports=root.Stillwater;
})(globalThis);
