import test from 'node:test';
import assert from 'node:assert/strict';
import {generate,hasEasyPattern,PROFILES} from '../src/generator.js';
import {generateClear,difficultyMetrics} from '../src/difficulty.js';
import {endlessNumber} from '../src/endless.js';
import {suit} from '../src/poker.js';
test('clear practice deals are deterministic, retain weekly layouts, and have a distinct winning combination',()=>{
  const types=new Set();
  for(let seed=1;seed<=20;seed++) for(let profile=0;profile<7;profile++) {
    const n=endlessNumber(profile,seed),original=generate(n),deal=generateClear(n);
    assert.deepEqual(generateClear(n),deal);
    assert.equal(deal.board.length,original.board.length);
    assert.equal(new Set([...deal.board,...deal.community]).size,deal.board.length+3);
    assert.ok([...deal.board,...deal.community].every(c=>Number.isInteger(c)&&c>=0&&c<52));
    if(deal.modifier!=='random') assert.deepEqual(deal.board.map(suit),original.board.map(suit));
    if(deal.modifier==='random') assert.equal(hasEasyPattern(deal.board,PROFILES[profile].strict),false);
    const m=difficultyMetrics(deal.board,deal.community);
    assert.ok(m.categoryGap>=2);assert.equal(m.winningPairs,1);assert.equal(m.sameCategoryPairs,0);
    assert.ok(m.best==='Royal flush'||m.best==='Four of a kind');
    assert.ok(m.sharedContributors>=2);types.add(m.best);
    assert.deepEqual(generate(n),original);
  }
  assert.equal(types.size,2);
});
test('metrics report same-category competition rather than treating a kicker win as a category gap',()=>{
  const c=(r,s=0)=>s*13+r-2;
  const m=difficultyMetrics([c(14),c(14,1),c(13),c(13,1)],[c(2),c(5,1),c(9,2)]);
  assert.equal(m.categoryGap,0);assert.equal(m.best,'One pair');assert.equal(m.sameCategoryPairs,1);
  assert.equal(m.sharedContributors,0);
});
