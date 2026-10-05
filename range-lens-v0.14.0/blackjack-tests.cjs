const assert=require('node:assert/strict'),B=require('./blackjack-core'),C=require('./stillwater-core');
const c=(r,s=0)=>({r,s}),deck=(...cards)=>cards.reverse();const start=(cards,coins=100,bet=10)=>{const g=B.fresh(coins);assert(B.deal(g,bet,deck(...cards.map(r=>c(r)))));return g};
let g=start([1,9,13,7]);assert.equal(g.phase,'done');assert.equal(g.coins,115);assert.equal(g.hands[0].result,'Blackjack · pays 3:2');
g=start([1,1,13,13]);assert.equal(g.coins,100);g=start([10,1,8,13]);assert.equal(g.coins,90);
g=start([10,1,7,6]);B.act(g,'stand');assert.equal(g.dealer.length,2);assert.equal(g.coins,100); // soft 17 stands
g=start([5,10,6,7,10]);assert(B.legal(g).double);B.act(g,'double');assert.equal(g.hands[0].cards.length,3);assert.equal(g.hands[0].bet,20);assert.equal(g.coins,120);
g=start([8,10,8,7,3,2,10]);assert(B.act(g,'split'));assert.equal(g.hands.length,2);assert.equal(g.coins,80);assert(B.legal(g).double);B.act(g,'double');assert.equal(g.active,1);B.act(g,'stand');assert.equal(g.phase,'done');assert.equal(g.coins,110);
g=start([8,10,8,7,3,2,10,10]);B.act(g,'split');B.act(g,'double');assert(B.legal(g).double);B.act(g,'double');assert.equal(g.coins,140);assert(g.hands.every(h=>h.bet===20&&h.doubled));
g=start([1,10,1,7,13,9]);B.act(g,'split');assert.equal(g.phase,'done');assert(g.hands.every(h=>h.cards.length===2));assert.equal(g.coins,120);assert(!g.hands.some(h=>h.result.includes('Blackjack')));
g=start([8,10,8,7,8,8,8,8,8,8]);B.act(g,'split');B.act(g,'split');B.act(g,'split');assert.equal(g.hands.length,4);assert(!B.legal(g).split);
g=start([10,10,13,7]);assert(!B.legal(g).split);g=start([8,10,8,7],10);assert(!B.legal(g).split);assert(!B.legal(g).double);assert.equal(B.act(g,'split'),false);
g=start([10,10,6,7,10]);B.act(g,'hit');assert.equal(g.hands[0].result,'Bust');assert.equal(g.coins,90);
g=start([5,10,6,7,2]);B.act(g,'hit');assert(!B.legal(g).double);assert(!B.legal(g).split);assert.deepEqual(B.restore(JSON.parse(JSON.stringify(g)),g.coins),g);
const p=C.fresh();p.blackjack=g;assert(C.restore(JSON.parse(JSON.stringify(p))).blackjack);assert.equal(B.restore({version:1,phase:'play'},20).phase,'bet');assert.equal(B.shoe().length,312);const bad=B.fresh(5);assert(!B.deal(bad,3));assert(!B.deal(bad,6));assert.equal(bad.coins,5);
console.log('PASS: natural 3:2, dealer peek, natural push, S17, doubling, DAS, split aces, split 21 payout, four-hand cap, same-rank/coin restrictions, bust, round persistence and invalid bets');
