import test from 'node:test';
import assert from 'node:assert/strict';
import {examples} from '../src/help.js';
import {evaluate} from '../src/poker.js';

test('illustrated help shows valid poker categories in descending order',()=>{
  assert.equal(examples.length,9);
  examples.forEach(([, ,cards],i)=>assert.equal(evaluate(cards).category,8-i));
});
