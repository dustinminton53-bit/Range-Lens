const assert=require('node:assert/strict'),{parseTimeframe,choose}=require('./chart-sync');
assert.equal(parseTimeframe('5m'),5);assert.equal(parseTimeframe('4H'),240);assert.equal(parseTimeframe('1D'),1440);assert.equal(parseTimeframe('1M'),null);assert.equal(parseTimeframe('150'),null);assert.equal(parseTimeframe('15 min'),15);
assert.equal(choose([{interval:5,score:100,text:'5m'},{interval:15,score:20,text:'15m'}]).interval,5);
assert.equal(choose([{interval:5,score:100,text:'5m'},{interval:15,score:100,text:'15m'}]).interval,null);
assert.equal(choose([]).interval,null);assert.match(choose([{interval:120,score:100,text:'2h'}]).message,/not supported/);
console.log('PASS: timeframe labels, selected-state priority, ambiguous/missing/unsupported fail closed');
