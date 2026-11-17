import test from 'node:test';
import assert from 'node:assert/strict';
import {endlessNumber,endlessSettings,MAX_SEED} from '../src/endless.js';
import {generate,PROFILES} from '../src/generator.js';
test('endless seeds preserve the daily generator and requested weekly profile',()=>{
  for(const seed of [1,2,100,MAX_SEED]) for(let profile=0;profile<7;profile++) {
    const n=endlessNumber(profile,seed),deal=generate(n);
    assert.equal(deal.profile,PROFILES[profile].name);
    assert.equal(deal.board.length,PROFILES[profile].count);
    assert.deepEqual(generate(endlessNumber(profile,seed)),deal);
    assert.notDeepEqual(generate(endlessNumber(profile,seed===MAX_SEED?1:seed+1)).board,deal.board);
  }
});
test('invalid endless links safely fall back and invalid deal requests are rejected',()=>{
  for(const query of ['?difficulty=7&seed=1','?difficulty=2&seed=-1','?seed=NaN','?seed=1.5']) assert.deepEqual(endlessSettings(query),{profile:0,seed:1});
  assert.deepEqual(endlessSettings('?difficulty=5&seed=42'),{profile:5,seed:42});
  assert.throws(()=>endlessNumber(7,1));assert.throws(()=>endlessNumber(0,MAX_SEED+1));
});
