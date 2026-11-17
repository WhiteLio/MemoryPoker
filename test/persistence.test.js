import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeProgress,storedProgress,resetProgress} from '../src/persistence.js';
import {newAttempt,ready,advance,selectCard,submit} from '../src/state.js';
const clone=s=>structuredClone(s);
test('stale lifecycle saves cannot undo completion or remove records from another tab',()=>{
  const old=newAttempt(1,1000);ready(old,2000);advance(old,3000);selectCard(old,0);selectCard(old,1);
  const completed=clone(old);submit(completed,4000);completed.updatedAt=4000;
  const stale=clone(old);stale.hiddenSince=5000;stale.updatedAt=9999;
  const other={...completed,number:2};
  const merged=mergeProgress({1:stale},{1:completed,2:other});
  assert.deepEqual(merged[1],completed);assert.deepEqual(merged[2],other);
  stale.overtime=true;
  assert.equal(mergeProgress({1:stale},{1:completed})[1].overtime,false);
});
test('newer selections win while phase transitions and overtime cannot roll backward',()=>{
  const base=newAttempt(1,1000),later={...base,phase:'select',memorizedAt:2000,selected:[1,2],updatedAt:5000};
  const stale={...later,selected:[0,1],updatedAt:4000};
  assert.deepEqual(mergeProgress({1:stale},{1:later})[1].selected,[1,2]);
  assert.equal(mergeProgress({1:{...base,updatedAt:10000}},{1:later})[1].phase,'select');
  const overtime={...later,overtime:true,updatedAt:4000};
  assert.equal(mergeProgress({1:later},{1:overtime})[1].overtime,true);
});
test('tab visibility is excluded from shared storage without mutating the live state',()=>{
  const state={...newAttempt(1,1000),hiddenSince:2000};
  assert.equal(storedProgress({1:state})[1].hiddenSince,null);
  assert.equal(state.hiddenSince,2000);
});

test('reset generations defeat stale completed saves while fresh replays can complete normally',()=>{
  const completed={...newAttempt(1,1000),phase:'complete',memorizedAt:1500,selected:[0,1],completedAt:2000};
  const reset=resetProgress(1,completed,3000);
  assert.equal(mergeProgress({1:completed},{1:reset})[1].phase,'reset');
  const replay={...newAttempt(1,4000),generation:reset.generation};
  assert.equal(mergeProgress({1:replay},{1:reset})[1].phase,'memorize');
  assert.equal(mergeProgress({1:completed},{1:replay})[1].startedAt,4000);
});
