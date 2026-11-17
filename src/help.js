import {cardPath} from './cards.js';
import {cardText} from './poker.js';
const c=(rank,suit)=>suit*13+rank-2;
export const examples=[
  ['Straight flush','Five in sequence, all one suit.',[c(14,3),c(13,3),c(12,3),c(11,3),c(10,3)]],
  ['Four of a kind','Four cards of the same rank.',[c(9,0),c(9,1),c(9,2),c(9,3),c(13,0)]],
  ['Full house','Three of one rank and two of another.',[c(12,0),c(12,1),c(12,2),c(5,0),c(5,3)]],
  ['Flush','Five of one suit.',[c(14,2),c(11,2),c(8,2),c(6,2),c(2,2)]],
  ['Straight','Five in sequence, in mixed suits.',[c(10,0),c(9,2),c(8,1),c(7,3),c(6,0)]],
  ['Three of a kind','Three cards of the same rank.',[c(7,0),c(7,1),c(7,2),c(14,3),c(4,0)]],
  ['Two pair','Two different pairs.',[c(11,0),c(11,1),c(4,2),c(4,3),c(14,0)]],
  ['One pair','Two cards of the same rank.',[c(10,0),c(10,1),c(14,2),c(8,3),c(3,0)]],
  ['High card','When no other hand applies.',[c(14,0),c(11,1),c(8,2),c(6,3),c(3,0)]]
];
export function helpHTML(){return `<ol class="steps"><li><strong>Memorize.</strong> Take your time, then tap Ready.</li><li><strong>Choose.</strong> Remember two cards to combine with the three shared cards. You have 20 seconds.</li><li><strong>Reveal.</strong> See your hand and the best possible hands.</li></ol><p>🥇 Best · 🥈 Second · 🥉 Third<br>Your time is spent memorizing. Equal hands share a rank.</p><details><summary>Selection & overtime</summary><p>A third card replaces your oldest selection. Tap a selected card to deselect it.</p><p>At 20 seconds, your selected pair submits. If fewer than two are selected, or time expires while you are away, you enter overtime. Submit whenever you are ready. Overtime still counts toward your streak.</p></details><h3>Poker hands</h3><p class="help-caption">Strongest to weakest</p><ol class="hand-guide">${examples.map(([name,description,cards])=>`<li><strong>${name}</strong><div class="example-hand" aria-label="${cards.map(cardText).join(', ')}">${cards.map(card=>`<img src="${cardPath(card)}" alt="${cardText(card)}" loading="lazy">`).join('')}</div><span>${description}</span></li>`).join('')}</ol><p>A royal flush is the highest straight flush. Aces can also be low in A-2-3-4-5. Higher cards break ties; suits never do.</p><details><summary>About</summary><p>A new deal daily at 00:00 UTC. Progress saves in this browser.</p><p>Inspired by <em>The Devil’s Plan: Dead Again.</em> An independent fan game.</p></details>`;}
