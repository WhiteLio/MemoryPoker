import {cardPath} from './cards.js';
import {cardText,evaluate,rank} from './poker.js';
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
// Highlight the named combination; remaining cards still act as tie-breaking kickers.
export function contributingIndices(cards) {
  const {category}=evaluate(cards);
  if(category>=4 && category!==7) return cards.map((_,i)=>i);
  const counts=new Map();
  for(const card of cards) counts.set(rank(card),(counts.get(rank(card))||0)+1);
  const highest=Math.max(...cards.map(rank));
  return cards.flatMap((card,i)=>{
    const count=counts.get(rank(card));
    const contributes=category===7?count===4:category===3?count===3:
      category===2||category===1?count===2:rank(card)===highest;
    return contributes?[i]:[];
  });
}
export function helpHTML() {
  return `<p class="help-intro">Memorise 16 cards once. Answer five questions from memory.</p>
    <ol class="help-steps">
      <li><h3>Memorise</h3><p>Study the 16-card face-up grid. Take your time, or enable Hard Mode before starting for a 20-second limit, just like the show. Tap <strong>Ready</strong> to hide the cards sooner.</p></li>
      <li><h3>Choose</h3><p>Answer five questions in a row, each with three different shared cards. Pick two cards from memory to make your strongest five-card hand. You have <strong>20 seconds per question</strong>. The countdown bar burns away beneath the timer. All answers are revealed after question five.</p></li>
    </ol>
    <div class="help-details">
      <details><summary>Selection & timing</summary><p>Tap a selected card to deselect it. A third card replaces your oldest selection.</p><p>Tap Next question to lock your pair, or Finish on question five. At 20 seconds, your selected cards submit automatically; fewer than two counts as unanswered. A question that expires while you are away is recorded, but the next timer waits until you return.</p><p>The same grid stays hidden across all five questions. You may reuse a position in different questions.</p></details>
      <details><summary>Your result</summary><p>After question five, see how many best hands you found. Tap a question to review your pair, its rank, and the best possible hands. Equal hands share a rank.</p><p>The time on your result is how long you spent memorising. Hard Mode adds *; five gold answers in Hard Mode earn 🪙.</p></details>
    </div>
    <section class="poker-reference" aria-labelledby="poker-guide-title">
      <h3 id="poker-guide-title">Poker hands</h3>
      <p class="help-caption">Strongest to weakest. Dimmed cards are outside the named combination, but can still break ties.</p>
      <ol class="hand-guide">${examples.map(([name,description,cards])=>{
        const contributing=new Set(contributingIndices(cards));
        return `<li><h4>${name}</h4><div class="example-hand" aria-label="${cards.map(cardText).join(', ')}">${cards.map((card,i)=>`<img class="example-card${contributing.has(i)?'':' is-muted'}" src="${cardPath(card)}" alt="${cardText(card)}${contributing.has(i)?'':', kicker'}" loading="lazy">`).join('')}</div><p class="hand-description">${description}</p></li>`;
      }).join('')}</ol>
      <p class="help-note">A royal flush is the highest straight flush. Aces can also be low in A-2-3-4-5. Higher cards break ties; suits never do.</p>
    </section>
    <details class="help-about"><summary>About</summary><p>A new deal daily at 00:00 UTC. Progress saves in this browser.</p><p>Inspired by <em>The Devil’s Plan: Dead Again.</em> An independent fan game.</p></details>`;
}
