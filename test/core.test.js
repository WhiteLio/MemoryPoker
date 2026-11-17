import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate, handGroups, handLabels, suit} from '../src/poker.js';
import {generate, challengeNumber, hasEasyPattern, PROFILES} from '../src/generator.js';
import {newAttempt,ready,advance,selectCard,submit,deadline,shareText,formatNextDeal} from '../src/state.js';
import {cardPath} from '../src/cards.js';
import {readFile} from 'node:fs/promises';

const c=(r,s=0)=>s*13+r-2;
test('all poker categories order correctly',()=>{
  const hands=[
    [c(14),c(11,1),c(9,2),c(6),c(3)],
    [c(2),c(2,1),c(14),c(9),c(5)],
    [c(2),c(2,1),c(3),c(3,1),c(14)],
    [c(2),c(2,1),c(2,2),c(14),c(5)],
    [c(6),c(5),c(4,1),c(3),c(2)],
    [c(14),c(11),c(9),c(6),c(3)],
    [c(2),c(2,1),c(2,2),c(3),c(3,1)],
    [c(2),c(2,1),c(2,2),c(2,3),c(14)],
    [c(6),c(5),c(4),c(3),c(2)]
  ].map(evaluate);
  hands.forEach((h,i)=>assert.equal(h.category,i));
  for(let i=1;i<hands.length;i++) assert.ok(hands[i].score>hands[i-1].score);
});
test('wheel, kickers, and suit ties follow standard poker',()=>{
  const wheel=evaluate([c(14),c(2,1),c(3),c(4),c(5)]);
  assert.equal(wheel.category,4);
  assert.ok(wheel.score<evaluate([c(2),c(3),c(4),c(5),c(6,1)]).score);
  assert.equal(evaluate([c(14),c(2),c(3),c(4),c(5)]).category,8);
  assert.equal(evaluate([c(12),c(13),c(14),c(2),c(3,1)]).category,0);
  assert.ok(evaluate([c(8),c(8,1),c(14),c(10),c(5)]).score>evaluate([c(8),c(8,1),c(14),c(9),c(7)]).score);
  assert.equal(evaluate([c(14),c(13,1),c(12),c(11),c(10)]).score,evaluate([c(14,1),c(13),c(12,1),c(11,1),c(10,1)]).score);
  assert.throws(()=>evaluate([1,1,2,3,4]));
});
test('user example yields one royal flush and fifteen tied straights',()=>{
  const board=[0,1,2,3].flatMap(s=>[c(14,s),c(13,s)]);
  const community=[c(12,3),c(11,3),c(10,3)];
  const g=handGroups(board,community);
  assert.equal(g[0].name,'Royal flush');assert.equal(g[0].pairs.length,1);
  assert.equal(g[1].name,'Straight');assert.equal(g[1].pairs.length,15);
  assert.equal(g.reduce((n,h)=>n+h.pairs.length,0),28);
});
test('UTC numbering and weekly profiles are stable',()=>{
  assert.equal(challengeNumber(Date.parse('2026-11-16T23:59:59.999Z')),1);
  assert.equal(challengeNumber(Date.parse('2026-11-17T00:00:00Z')),2);
  for(let n=1;n<=7;n++) assert.equal(generate(n).profile,PROFILES[n-1].name);
  assert.deepEqual(generate(123),generate(123));
  assert.deepEqual(generate(1).board,[37,3,45,14,35,6,40,20]);
});
test('generated deals use unique cards, expected patterns, and complete pair coverage',()=>{
  for(let number=1;number<=730;number++) {
    const d=generate(number),all=[...d.board,...d.community];
    assert.equal(new Set(all).size,all.length);
    assert.ok(all.every(c=>c>=0&&c<52));
    assert.ok([8,12,16].includes(d.board.length));
    if(d.modifier==='random') assert.equal(hasEasyPattern(d.board,d.profile==='Saturday Expert'),false);
    if(d.modifier==='columns') for(let col=0;col<4;col++) assert.equal(new Set(d.board.filter((_,i)=>i%4===col).map(suit)).size,1);
    const groups=handGroups(d.board,d.community);
    assert.equal(groups.reduce((total,g)=>total+g.pairs.length,0),d.board.length*(d.board.length-1)/2);
  }
});
function choosing() {const s=newAttempt(1,1000);ready(s,11000);advance(s,12000);return s;}
test('reveal waits one second and deadline follows reveal',()=>{
  const s=newAttempt(1,1000);ready(s,11000);advance(s,11999);assert.equal(s.phase,'conceal');
  advance(s,12000);assert.equal(s.phase,'select');assert.equal(deadline(s),32000);
});
test('selection retains last two and supports deselection',()=>{
  const s=choosing();[0,1,2,3].forEach(i=>selectCard(s,i));assert.deepEqual(s.selected,[2,3]);
  selectCard(s,2);assert.deepEqual(s.selected,[3]);selectCard(s,2);assert.deepEqual(s.selected,[3,2]);
});
test('visible deadline submits pair but incomplete selection enters unlimited overtime',()=>{
  const s=choosing();selectCard(s,0);selectCard(s,1);advance(s,31999);assert.equal(s.phase,'select');
  advance(s,32000);assert.equal(s.phase,'complete');assert.equal(s.overtime,false);
  const t=choosing();selectCard(t,0);advance(t,32000);assert.equal(t.overtime,true);
  selectCard(t,1);advance(t,1000000);assert.equal(t.phase,'select');assert.equal(submit(t,1000000),true);
});
test('away, hidden intervals, and restoring never auto-submit overdue pairs',()=>{
  for(const options of [{away:true},{restoring:true},{}]) {
    const s=choosing();selectCard(s,0);selectCard(s,1);if(!Object.keys(options).length) s.hiddenSince=20000;
    advance(s,33000,options);assert.equal(s.phase,'select');assert.equal(s.overtime,true);assert.equal(s.completedAt,null);
  }
  const s=choosing();advance(s,20000,{restoring:true});assert.equal(s.overtime,false);
});
test('share formatting is spoiler-free and uses memorization time',()=>{
  assert.equal(shareText(123,12,42999,false),'Memory Poker #123\n12🃏0:42');
  assert.equal(shareText(123,2,42000,true),'Memory Poker #123\n🥈0:42 · Overtime');
  assert.equal(shareText(123,2,42000,false,'https://example.com/poker/'),'Memory Poker #123\n🥈0:42\nhttps://example.com/poker/');
  assert.equal(shareText(123,12,42000,false,''),'Memory Poker #123\n12🃏0:42');
});
test('all 52 downloaded card faces map correctly and contain no active or external content',async()=>{
  const paths=Array.from({length:52},(_,i)=>cardPath(i));
  assert.equal(new Set(paths).size,52);
  assert.equal(cardPath(c(14,3)),'./assets/cards/classic/AS.svg');
  assert.equal(cardPath(c(12,1)),'./assets/cards/classic/QD.svg');
  let valueScale;
  for(const path of paths) {
    const svg=await readFile(new URL('../'+path,import.meta.url),'utf8');
    assert.match(svg,/<svg/);
    assert.doesNotMatch(svg,/<script\b|<foreignObject\b|\bon\w+\s*=/i);
    assert.doesNotMatch(svg,/(?:href|src)\s*=\s*["'](?:https?:|\/\/|data:)/i);
    assert.doesNotMatch(svg,/<(?:linear|radial)Gradient\b/);
    assert.doesNotMatch(svg,/<filter\b|filter:url\(/);
    assert.match(svg,/data-card-value="Besley"/);
    const values=[...svg.matchAll(/data-card-value="Besley" transform="translate\([^)]+\) scale\(([-\d.eE]+) ([-\d.eE]+)\)"/g)];
    assert.equal(values.length,2,'both corners retain vector values');
    for(const value of values) {
      const sx=Number(value[1]),sy=Number(value[2]);
      assert.ok(sx>0 && sy<0 && Math.abs(sx+sy)<1e-12,'value proportions are preserved');
      valueScale ??= sx;
      assert.equal(sx,valueScale,'all ranks use the same font size');
    }
  }
});

test('hand summaries identify pairs and add only distinguishing kickers',()=>{
  const hands=[
    [c(14),c(14,1),c(13),c(11),c(6)],
    [c(7),c(7,1),c(13),c(11),c(6)],
    [c(5),c(5,1),c(13),c(11),c(6)]
  ];
  assert.deepEqual(handLabels(hands.map(evaluate)),['Ace Pair','7 Pair','5 Pair']);
  const tiedPair=[
    [c(7),c(7,1),c(14),c(13),c(6)],
    [c(7),c(7,1),c(14),c(12),c(6)],
    [c(7),c(7,1),c(14),c(12),c(5)]
  ].map(evaluate);
  const labels=handLabels(tiedPair);
  assert.deepEqual(labels,['7 Pair + King Kicker','7 Pair + Queen, 6 Kickers','7 Pair + Queen, 5 Kickers']);
  assert.equal(new Set(labels).size,3);
  assert.deepEqual(handLabels([evaluate([c(14),c(13),c(12),c(11),c(10)])]),['Royal flush']);
});

test('next-deal copy uses whole hours, then minutes, with a one-minute minimum',()=>{
  assert.equal(formatNextDeal(21*3600000+59*60000),'21hrs');
  assert.equal(formatNextDeal(3600000),'1hr');
  assert.equal(formatNextDeal(3599999),'59mins');
  assert.equal(formatNextDeal(60000),'1min');
  assert.equal(formatNextDeal(1),'1min');
});
