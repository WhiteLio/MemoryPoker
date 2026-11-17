import { rank, suit } from './poker.js';

// Keep this implementation frozen for v1. Future algorithms get a new version.
export const VERSION = 1;
export const EPOCH = '2026-11-16';
export const DAY = 86400000;
export function challengeNumber(now=Date.now()) { return Math.floor((now-Date.parse(EPOCH+'T00:00:00Z'))/DAY)+1; }
export function challengeDate(number) { return new Date(Date.parse(EPOCH+'T00:00:00Z')+(number-1)*DAY).toISOString().slice(0,10); }
export function seededRandom(seed) {
  let h=2166136261;
  for (let i=0;i<seed.length;i++) h=Math.imul(h^seed.charCodeAt(i),16777619);
  return () => { h+=0x6D2B79F5; let t=h; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
}
function shuffle(items, random) {
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--) { const j=Math.floor(random()*(i+1)); [copy[i],copy[j]]=[copy[j],copy[i]]; }
  return copy;
}
// Monday to Sunday. Sunday is a patterned 16-card special.
export const PROFILES = [
  {name:'Gentle Monday', count:8, modifiers:['columns']},
  {name:'Tuesday Recall', count:12, modifiers:['columns']},
  {name:'Wednesday Weave', count:12, modifiers:['diagonals']},
  {name:'Thursday Shuffle', count:12, modifiers:['random']},
  {name:'Friday Challenge', count:16, modifiers:['random']},
  {name:'Saturday Expert', count:16, modifiers:['random'], strict:true},
  {name:'Sunday Special', count:16, modifiers:['columns','diagonals']}
];
export function hasEasyPattern(board, strict=false) {
  const rows=board.length/4;
  const allSame = cells => cells.length>1 && cells.every(c=>suit(c)===suit(cells[0]));
  if ([0,1,2,3].every(col=>allSame(Array.from({length:rows},(_,row)=>board[row*4+col])))) return true;
  if (Array.from({length:rows},(_,row)=>board.slice(row*4,row*4+4)).every(allSame)) return true;
  if ([0,1,2,3].every(offset=>allSame(Array.from({length:rows},(_,row)=>board[row*4+(row+offset)%4])))) return true;
  if ([0,1,2,3].every(offset=>allSame(Array.from({length:rows},(_,row)=>board[row*4+((offset-row+4)%4)])))) return true;
  if (strict) {
    for(let row=0;row<rows;row++) {
      const cells=board.slice(row*4,row*4+4);
      if(allSame(cells) || new Set(cells.map(rank)).size===1) return true;
    }
    for(let col=0;col<4;col++) if(allSame(Array.from({length:rows},(_,row)=>board[row*4+col]))) return true;
  }
  return false;
}
export function generate(number) {
  if (!Number.isInteger(number) || number<1 || number>1000000) throw new Error('Invalid challenge number');
  const day=(new Date(challengeDate(number)+'T00:00:00Z').getUTCDay()+6)%7;
  const profile=PROFILES[day];
  const random=seededRandom(`memory-poker:v${VERSION}:${number}`);
  const modifier=profile.modifiers[Math.floor(random()*profile.modifiers.length)];
  let board;
  if(modifier==='random') {
    let attempts=0;
    do { board=shuffle(Array.from({length:52},(_,i)=>i),random).slice(0,profile.count); attempts++; }
    while(hasEasyPattern(board,profile.strict) && attempts<10000);
    if(hasEasyPattern(board,profile.strict)) throw new Error('Could not generate an unpatterned board');
  } else {
    const suits=shuffle([0,1,2,3],random);
    const piles=suits.map(s=>shuffle(Array.from({length:13},(_,i)=>s*13+i),random));
    const direction=random()<0.5 ? 1 : -1;
    board=Array.from({length:profile.count},(_,i)=> {
      const row=Math.floor(i/4), col=i%4;
      const pile=modifier==='columns' ? col : (col+direction*row+8)%4;
      return piles[pile].pop();
    });
  }
  const community=shuffle(Array.from({length:52},(_,i)=>i).filter(c=>!board.includes(c)),random).slice(0,3);
  return {number,version:VERSION,date:challengeDate(number),profile:profile.name,modifier,board,community};
}
