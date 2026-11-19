import test from 'node:test';
import assert from 'node:assert/strict';
import {generateRounds,newAttempt,ready,advance,submit,deadline,ROUND_COUNT} from '../src/rounds.js';
import {mergeProgress} from '../src/persistence.js';

test('five-question deals always have sixteen cards and fifteen distinct non-board shared cards',()=>{
  for(let number=1;number<=21;number++) {
    const deal=generateRounds(number);
    assert.equal(deal.board.length,16);
    assert.equal(new Set(deal.board).size,16);
    assert.equal(deal.communities.length,5);
    assert.equal(new Set(deal.communities.flat()).size,15);
    assert.ok(deal.communities.flat().every(c=>!deal.board.includes(c)));
    assert.deepEqual(generateRounds(number),deal);
  }
});

test('five questions keep the same memorisation time and only finish after the fifth answer',()=>{
  const state=newAttempt(1,100);
  ready(state,1000);
  for(let round=0;round<ROUND_COUNT;round++) {
    assert.equal(state.phase,'conceal');
    assert.equal(state.roundIndex,round);
    const start=state.roundStartedAt;
    advance(state,start);
    assert.equal(state.phase,'select');
    assert.equal(deadline(state)-start,20000);
    state.selected=[round,round+1];
    assert.equal(submit(state,start+100),true);
    assert.equal(state.answers.length,round+1);
    assert.equal(state.memorizedAt,1000);
    assert.equal(state.phase,round===4?'complete':'conceal');
    if(round<4) assert.deepEqual(state.selected,[]);
  }
});

test('timeouts record partial answers and start a fresh twenty seconds without revealing the board',()=>{
  const state=newAttempt(1,0);ready(state,100);
  advance(state,state.roundStartedAt);
  state.selected=[3];
  const end=deadline(state);
  advance(state,end);
  assert.deepEqual(state.answers[0].selected,[3]);
  assert.equal(state.answers[0].timedOut,true);
  assert.equal(state.phase,'conceal');
  assert.equal(state.roundStartedAt,end+1000);
  assert.equal(deadline(state),end+21000);
});

test('background expiration does not consume subsequent questions until the player returns',()=>{
  const state=newAttempt(1,0);ready(state,100);
  advance(state,100000,{away:true});
  assert.equal(state.answers.length,1);
  assert.equal(state.roundStartedAt,null);
  advance(state,200000,{away:true});
  assert.equal(state.answers.length,1);
  advance(state,300000);
  assert.equal(state.answers.length,1);
  assert.equal(state.roundStartedAt,301000);
  assert.equal(deadline(state),321000);
});

test('a restored expired question advances once and a stale previous question cannot overwrite it',()=>{
  const state=newAttempt(1,0);ready(state,100);advance(state,1100);
  const stale=structuredClone(state);
  advance(state,40000,{restoring:true});
  assert.equal(state.roundIndex,1);
  assert.equal(state.roundStartedAt,null);
  assert.equal(mergeProgress({1:state},{1:stale})[1].roundIndex,1);
  assert.equal(mergeProgress({1:stale},{1:state})[1].roundIndex,1);
});
