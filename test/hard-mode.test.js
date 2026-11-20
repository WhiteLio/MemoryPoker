import test from 'node:test';
import assert from 'node:assert/strict';
import {newAttempt,ready,advance,generateRounds,roundShareText} from '../src/rounds.js';
import {handGroups} from '../src/poker.js';

test('hard memory expires at exactly twenty seconds and preserves a full recall clock',()=>{
  const s=newAttempt(1,100,true);
  advance(s,20099);assert.equal(s.phase,'memorize');
  advance(s,20100);assert.equal(s.phase,'conceal');
  assert.equal(s.memorizedAt,20100);assert.equal(s.roundStartedAt,21100);
  advance(s,21100);assert.equal(s.phase,'select');assert.equal(s.answers.length,0);
});
test('hard memory can finish early and normal or older attempts remain unlimited',()=>{
  const hard=newAttempt(1,100,true);ready(hard,5100);assert.equal(hard.memorizedAt,5100);
  const normal=newAttempt(1,100);advance(normal,180100);assert.equal(normal.phase,'memorize');
  delete normal.hardMode;advance(normal,300100);assert.equal(normal.phase,'memorize');
  const late=newAttempt(1,100,true);ready(late,30000);assert.equal(late.memorizedAt,20100);
});
test('hidden and restored hard memory conceals expired cards and waits for return',()=>{
  for(const option of [{away:true},{restoring:true}]) {
    const s=newAttempt(1,0,true);advance(s,60000,option);
    assert.equal(s.phase,'conceal');assert.equal(s.memorizedAt,20000);
    assert.equal(s.roundStartedAt,null);assert.equal(s.answers.length,0);
    advance(s,90000,{away:true});assert.equal(s.roundStartedAt,null);
    advance(s,100000);assert.equal(s.roundStartedAt,101000);assert.equal(s.answers.length,0);
  }
});
test('hard shares mark the timing and award a coin only for five gold answers',()=>{
  const deal=generateRounds(1),s=newAttempt(1,0,true);ready(s,20000);
  s.answers=deal.communities.map(c=>({selected:handGroups(deal.board,c)[0].pairs[0]}));
  assert.equal(roundShareText('Memory Poker #1',s,deal,'https://example.com/'),'Memory Poker #1\n🥇🥇🥇🥇🥇 · 0:20* 🪙\nhttps://example.com/');
  s.answers[4]={selected:[]};assert.match(roundShareText('Game',s,deal),/🥇🥇🥇🥇— · 0:20\*$/);
  s.answers.pop();assert.ok(!roundShareText('Game',s,deal).includes('🪙'));
  s.hardMode=false;assert.match(roundShareText('Game',s,deal),/0:20$/);
});
