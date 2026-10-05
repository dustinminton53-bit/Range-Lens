const assert=require('node:assert/strict');const {fixture,analyze,setups,guardrail}=require('./engine');const c=fixture(),base=analyze(c,1.5),flat={direction:'SIDEWAYS'};
const at=p=>({...base,valid:true,pos:p,price:base.floor+p*base.width});
assert(setups(at(.57),flat,flat).every(s=>s.status==='Wait'));assert.match(guardrail(at(.57),flat,flat).title,/Middle|Momentum conflict/);
assert.equal(setups(at(.9),flat,flat)[0].status,'Wait');assert.equal(setups(at(.1),flat,flat)[1].status,'Wait');
assert.notEqual(guardrail(at(.1),flat,flat).tone,'short');assert.notEqual(guardrail(at(.9),flat,flat).tone,'long');
assert.equal(guardrail(at(.1),{direction:'FALLING'},flat).tone,'wait');assert.equal(guardrail(at(.9),flat,{direction:'RISING'}).tone,'wait');
assert.equal(guardrail(null,flat,flat).tone,'wait');assert.equal(guardrail({...at(.1),valid:false},flat,flat).tone,'wait');
assert(setups(at(1.1),flat,flat).every(s=>s.status==='Wait'));
console.log('PASS: no long at top, no short at bottom, both wait in middle, invalid/trend-opposed vetoes');
