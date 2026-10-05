const assert=require('node:assert/strict'),{takeProfits}=require('./engine');
const a={atr:2,price:100,history:[],fvgs:[],levels:[110,110.4,110.9,111.3,115,120].map(price=>({price,count:2,points:[{confirmedAt:1}]}))};
const long=takeProfits(a,99,'long').targets;
assert.deepEqual(long.map(z=>[z.lo,z.hi]),[[110,110.9],[111.3,111.3],[115,115]]);
assert.equal(long[0].sources.length,3);assert.equal(long[0].price,110);
const short=takeProfits({...a,price:125},126,'short').targets;
assert.deepEqual(short.map(z=>z.price),[120,115,111.3]);
assert(long.every(z=>z.hi-z.lo<=a.atr*.5));
console.log('PASS: nearby sources merge, bounded spans prevent chained zones, distinct directional ordering');
