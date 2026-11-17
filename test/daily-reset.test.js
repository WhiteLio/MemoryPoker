import test from 'node:test';
import assert from 'node:assert/strict';
import {shouldReplaceDeal} from '../src/state.js';

test('daily reset preserves the visible session but replaces it after leaving',()=>{
  assert.equal(shouldReplaceDeal(5,6,{activeSession:true}),false);
  assert.equal(shouldReplaceDeal(5,6,{activeSession:true,away:true}),true);
  assert.equal(shouldReplaceDeal(5,6,{activeSession:false}),true);
  assert.equal(shouldReplaceDeal(6,6,{activeSession:true,away:true}),false);
});
