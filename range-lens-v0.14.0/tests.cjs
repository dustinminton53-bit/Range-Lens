const assert=require('node:assert/strict');const {analyze,fixture}=require('./engine.js');
const range=fixture();const a=analyze(range,range.at(-1).c);assert.equal(a.status,'RANGE HOLDING');assert(a.floor<a.ceiling);assert(a.bottomTouches>=2&&a.topTouches>=2);
const trend=fixture('trend');assert.notEqual(analyze(trend,trend.at(-1).c).status,'RANGE HOLDING');
const breakout=fixture('breakout');assert.equal(analyze(breakout,breakout.at(-1).c).status,'BREAKOUT UP');
assert.equal(analyze(range,1.6).status,'OUTSIDE RANGE');assert.throws(()=>analyze([],1.5));assert.throws(()=>analyze(range,NaN));assert.throws(()=>analyze([...range].reverse(),1.5));
const bad=range.map(x=>({...x}));bad[20].h=0;assert.throws(()=>analyze(bad,1.5));
// Last-three-bar breakout does not change baseline boundaries.
assert.equal(analyze(breakout,1.54).floor,a.floor);assert.equal(analyze(breakout,1.54).ceiling,a.ceiling);
console.log('PASS: range, trend, breakout, outside-range, invalid data and causal boundaries');
const lower=analyze(range,a.floor+a.width*.23);assert.equal(lower.context,'Lower part of range');
// A continuous flat contact is not a string of independent swing reactions.
const flat=range.map(c=>({...c,o:1.5,h:1.502,l:1.498,c:1.5}));const f=analyze(flat,1.5);assert.equal(f.bottomTouches,0);assert.equal(f.topTouches,0);assert.equal(f.status,'UNCLEAR');
console.log('PASS: lower-range labeling and rejection of repeated flat-contact counts');
