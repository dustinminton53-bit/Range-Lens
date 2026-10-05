const assert=require('node:assert/strict'),E=require('./engine');
const flat={direction:'SIDEWAYS'},mixed={direction:'MIXED',components:['RISING','SIDEWAYS']};
const a=E.analyze(E.fixture(),1.5);a.price=a.ceiling-.0001;a.pos=.99;a.valid=true;
assert.equal(E.setups(a,mixed,flat)[1].status,'Wait');
// Live acceleration must veto a short even when BOTH combined trends are mixed.
a.price=a.candles.at(-1).c+a.atr*1.2;
assert.equal(E.setups(a,{direction:'MIXED'},{direction:'MIXED'})[1].status,'Wait');
assert.match(E.guardrail(a,flat,flat).title,/Upward momentum|Momentum conflict/);
a.price=a.candles.at(-1).c-a.atr*1.2;
assert.equal(E.setups(a,flat,flat)[0].status,'Wait');
assert.match(E.guardrail(a,flat,flat).title,/Downward momentum|Momentum conflict/);
console.log('PASS: mixed aggregate cannot hide rising component; live pump/dump blocks countertrend entries');
