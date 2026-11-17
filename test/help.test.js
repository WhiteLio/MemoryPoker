import test from 'node:test';
import assert from 'node:assert/strict';
import {examples,contributingIndices,helpHTML} from '../src/help.js';
import {evaluate} from '../src/poker.js';

test('illustrated help shows valid poker categories in descending order',()=>{
  assert.equal(examples.length,9);
  examples.forEach(([, ,cards],i)=>assert.equal(evaluate(cards).category,8-i));
});

test('hand examples highlight the named combination and retain gameplay card paths',()=>{
  assert.deepEqual(examples.map(([, ,cards])=>contributingIndices(cards).length),[5,4,5,5,5,3,4,2,1]);
  assert.deepEqual(contributingIndices(examples[7][2]),[0,1]);
  const html=helpHTML();
  assert.equal((html.match(/class="example-card is-muted"/g)||[]).length,11);
  assert.equal((html.match(/src="\.\/assets\/cards\/classic\//g)||[]).length,45);
});
