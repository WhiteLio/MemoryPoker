import test from 'node:test';
import assert from 'node:assert/strict';
import {generatePractice,PATTERNS,CLARITIES,patternSlots,practiceSettings,PRESETS} from '../src/practice.js';
import {difficultyMetrics} from '../src/difficulty.js';
import {suit} from '../src/poker.js';

test('practice settings are validated and every pattern/clarity combination generates valid deals',()=>{
  const categories=new Set();
  for(const count of [8,12,16]) for(const pattern of Object.keys(PATTERNS)) for(const clarity of Object.keys(CLARITIES)) {
    const settings={count,pattern,clarity},deal=generatePractice(1,settings),metrics=difficultyMetrics(deal.board,deal.community);
    assert.equal(deal.board.length,count);assert.equal(new Set([...deal.board,...deal.community]).size,count+3);
    assert.ok([...deal.board,...deal.community].every(c=>Number.isInteger(c)&&c>=0&&c<52));
    assert.deepEqual(generatePractice(1,settings),deal);
    if(clarity==='obvious') {assert.ok(metrics.categoryGap>=2);assert.equal(metrics.winningPairs,1);}
    if(clarity==='clear') assert.ok(metrics.categoryGap>=1);
    if(clarity==='competing') assert.equal(metrics.categoryGap,0);
    const slots=patternSlots(count,pattern);
    if(slots) for(let a=0;a<count;a++) for(let b=0;b<count;b++) assert.equal(suit(deal.board[a])===suit(deal.board[b]),slots[a]===slots[b]);
    categories.add(metrics.best);
  }
  assert.ok(categories.size>=5);
  assert.equal(practiceSettings('?cards=7&pattern=columns&clarity=clear'),null);
  assert.equal(practiceSettings('?cards=8&pattern=bad&clarity=clear'),null);
  assert.deepEqual(practiceSettings('?cards=8&pattern=mirror&clarity=clear'),{count:8,pattern:'mirror',clarity:'clear'});
});
test('weekly starting points remain reproducible over several seeds',()=>{
  for(const settings of PRESETS) for(let number=2;number<=8;number++) {
    const deal=generatePractice(number,settings),metrics=difficultyMetrics(deal.board,deal.community);
    assert.ok(metrics.categoryGap>=(settings.clarity==='obvious'?2:1));
  }
});
