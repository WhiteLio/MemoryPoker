import {generate,seededRandom,hasEasyPattern,PROFILES} from './generator.js';
import {handGroups,rank,suit} from './poker.js';

export function difficultyMetrics(board,community) {
  const groups=handGroups(board,community),best=groups[0],second=groups[1];
  const cards=[...community,...best.pairs[0].map(i=>board[i])];
  const counts=new Map();
  cards.forEach(c=>counts.set(rank(c),(counts.get(rank(c))||0)+1));
  const contributes=c=>best.category>=4&&best.category!==7?true:best.category===7?counts.get(rank(c))===4:best.category===3?counts.get(rank(c))===3:best.category===2||best.category===1?counts.get(rank(c))===2:rank(c)===Math.max(...cards.map(rank));
  return {best:best.name,second:second?.name??'None',categoryGap:second?best.category-second.category:0,
    winningPairs:best.pairs.length,sameCategoryPairs:groups.slice(1).filter(g=>g.category===best.category).reduce((n,g)=>n+g.pairs.length,0),
    sharedContributors:community.filter(contributes).length,totalPairs:board.length*(board.length-1)/2};
}

// Experimental practice-only deals; daily v1 remains frozen.
export function generateClear(number) {
  const base=generate(number),random=seededRandom(`memory-poker:clear:v1:${number}`);
  const shuffle=items=>{
    const copy=[...items];
    for(let i=copy.length-1;i>0;i--) {const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
    return copy;
  };
  for(let attempt=0;attempt<500;attempt++) {
    const targetSuit=Math.floor(random()*4),r=2+Math.floor(random()*13);
    const royal=random()<.5;
    const target=royal?[8,9,10,11,12].map(v=>targetSuit*13+v):[0,1,2,3].map(s=>s*13+r-2);
    const ordered=shuffle(target);
    const community=ordered.slice(0,royal?3:2);
    if(!royal) community.push(shuffle(Array.from({length:52},(_,i)=>i).filter(c=>rank(c)!==r))[0]);
    const required=ordered.slice(royal?3:2);
    const remaining=shuffle(Array.from({length:52},(_,i)=>i).filter(c=>!community.includes(c)&&!required.includes(c)));
    let board;
    if(base.modifier==='random') board=shuffle([...required,...remaining.slice(0,base.board.length-2)]);
    else {
      const pools=[0,1,2,3].map(s=>[...required.filter(c=>suit(c)===s),...remaining.filter(c=>suit(c)===s)]);
      board=base.board.map(c=>pools[suit(c)].shift());
      if(!required.every(c=>board.includes(c))) continue;
      // Shuffle within each suit so target cards do not occupy predictable positions.
      const shuffled=[0,1,2,3].map(s=>shuffle(board.filter(c=>suit(c)===s)));
      board=board.map(c=>shuffled[suit(c)].pop());
    }
    if(base.modifier==='random'&&hasEasyPattern(board,PROFILES[(number-1)%7].strict)) continue;
    const metrics=difficultyMetrics(board,community);
    if(metrics.categoryGap>=2&&metrics.winningPairs===1) return {...base,board,community,variant:'clear-v1'};
  }
  throw new Error('Could not generate a clear practice deal');
}
