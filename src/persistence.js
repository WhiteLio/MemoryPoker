const phases={reset:-1,memorize:0,conceal:1,select:2,complete:3};
export function mergeProgress(local,remote) {
  const merged={...remote};
  for(const [key,attempt] of Object.entries(local)) {
    const other=merged[key];
    if(!other) {merged[key]=attempt;continue;}
    let chosen;
    if((attempt.generation||0)!==(other.generation||0)) chosen=(attempt.generation||0)>(other.generation||0)?attempt:other;
    else if(attempt.phase==='complete'&&other.phase==='complete') chosen=attempt.completedAt<other.completedAt?attempt:other;
    else if(phases[attempt.phase]!==phases[other.phase]) chosen=phases[attempt.phase]>phases[other.phase]?attempt:other;
    else chosen=(attempt.updatedAt||attempt.startedAt)>(other.updatedAt||other.startedAt)?attempt:other;
    merged[key]={...chosen,overtime:chosen.overtime||(chosen.phase!=='complete'&&(attempt.generation||0)===(other.generation||0)&&attempt.startedAt===other.startedAt&&(attempt.overtime||other.overtime))};
  }
  return merged;
}
// Visibility belongs to the current tab, not to the shared saved attempt.
export function storedProgress(attempts) {
  return Object.fromEntries(Object.entries(attempts).map(([key,state])=>[key,{...state,hiddenSince:null}]));
}

export function resetProgress(number,previous,now=Date.now()) {
  const generation=Math.max(now,(previous?.generation||0)+1);
  return {number,version:1,phase:'reset',generation,updatedAt:generation,startedAt:generation,memorizedAt:null,selected:[],overtime:false,completedAt:null,hiddenSince:null};
}
