export const SUITS = ['clubs', 'diamonds', 'hearts', 'spades'];
export const SYMBOLS = ['♣', '♦', '♥', '♠'];
export const NAMES = ['High card', 'One pair', 'Two pair', 'Three of a kind', 'Straight', 'Flush', 'Full house', 'Four of a kind', 'Straight flush'];
export const rank = card => card % 13 + 2;
export const suit = card => Math.floor(card / 13);
export const face = card => ({11:'J',12:'Q',13:'K',14:'A'}[rank(card)] || String(rank(card)));
export const cardText = card => `${face(card)}${SYMBOLS[suit(card)]}`;

// Base 15 preserves lexicographic poker ordering, including every kicker.
export function evaluate(cards) {
  if (cards.length !== 5 || new Set(cards).size !== 5 || cards.some(c => !Number.isInteger(c) || c < 0 || c > 51)) throw new Error('Expected five distinct cards');
  const values = cards.map(rank).sort((a,b) => b-a);
  const counts = new Map();
  for (const r of values) counts.set(r, (counts.get(r) || 0) + 1);
  const groups = [...counts].sort((a,b) => b[1]-a[1] || b[0]-a[0]);
  const flush = cards.every(c => suit(c) === suit(cards[0]));
  const unique = [...new Set(values)];
  let straight = unique.length === 5 && unique[0]-unique[4] === 4 ? unique[0] : 0;
  if (unique.join(',') === '14,5,4,3,2') straight = 5;
  let category, kickers;
  if (flush && straight) { category=8; kickers=[straight]; }
  else if (groups[0][1] === 4) { category=7; kickers=groups.map(g=>g[0]); }
  else if (groups[0][1] === 3 && groups[1][1] === 2) { category=6; kickers=groups.map(g=>g[0]); }
  else if (flush) { category=5; kickers=values; }
  else if (straight) { category=4; kickers=[straight]; }
  else if (groups[0][1] === 3) { category=3; kickers=groups.map(g=>g[0]); }
  else if (groups[0][1] === 2 && groups[1][1] === 2) { category=2; kickers=groups.map(g=>g[0]); }
  else if (groups[0][1] === 2) { category=1; kickers=groups.map(g=>g[0]); }
  else { category=0; kickers=values; }
  const score = [category, ...Array.from({length:5}, (_,i)=>kickers[i] || 0)].reduce((a,b)=>a*15+b,0);
  return { score, category, name: category===8 && straight===14 ? 'Royal flush' : NAMES[category] };
}

export function handGroups(board, community) {
  const groups = new Map();
  for (let a=0; a<board.length; a++) for (let b=a+1; b<board.length; b++) {
    const hand = evaluate([...community, board[a], board[b]]);
    if (!groups.has(hand.score)) groups.set(hand.score, {...hand, pairs:[]});
    groups.get(hand.score).pairs.push([a,b]);
  }
  return [...groups.values()].sort((a,b)=>b.score-a.score);
}
