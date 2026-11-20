import {generate as generateV1,seededRandom} from './generator.js';
import {generatePractice} from './practice.js';
import {evaluate,handGroups} from './poker.js';
import {formatTime,REVEAL_DELAY,SELECTION_TIME} from './state.js';
export const ROUND_COUNT=5;
export const MEMORIZATION_TIME=20000;
export {SELECTION_TIME};

export function generateRounds(number,settings=null) {
  const original=generateV1(number);
  const pattern=settings?.pattern||(original.modifier==='random'?'shuffled':original.modifier);
  const base=generatePractice(number,{count:16,pattern,clarity:settings?.clarity||'open'});
  const random=seededRandom(`memory-poker:five-rounds:v1:${number}:${pattern}:${settings?.clarity||'open'}`);
  const shuffle=items=>{
    const out=[...items];
    for(let i=out.length-1;i>0;i--) {const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
    return out;
  };
  const remaining=Array.from({length:52},(_,i)=>i).filter(c=>!base.board.includes(c));
  const communities=[base.community];
  const used=new Set(base.community);
  const winners=new Set([handGroups(base.board,base.community)[0].pairs.map(p=>p.join(',')).sort().join('|')]);
  for(let round=1;round<ROUND_COUNT;round++) {
    let community,key;
    for(let attempt=0;attempt<100;attempt++) {
      community=shuffle(remaining.filter(c=>!used.has(c))).slice(0,3);
      key=handGroups(base.board,community)[0].pairs.map(p=>p.join(',')).sort().join('|');
      if(!winners.has(key)) break;
    }
    communities.push(community);community.forEach(c=>used.add(c));winners.add(key);
  }
  return {...original,version:2,modifier:pattern,board:base.board,community:communities[0],communities};
}

export function newAttempt(number,now=Date.now(),hardMode=false) {
  return {number,version:2,hardMode,phase:'memorize',startedAt:now,memorizedAt:null,selected:[],overtime:false,completedAt:null,hiddenSince:null,roundIndex:0,roundStartedAt:null,answers:[]};
}
export function ready(state,now) {
  if(state.phase!=='memorize') return;
  state.memorizedAt=state.hardMode?Math.min(now,state.startedAt+MEMORIZATION_TIME):now;
  state.roundStartedAt=state.memorizedAt+REVEAL_DELAY;state.phase='conceal';
}
export const deadline=state=>state.roundStartedAt===null?null:state.roundStartedAt+SELECTION_TIME;
function finishRound(state,now,{timedOut=false,away=false}={}) {
  state.answers.push({selected:[...state.selected],timedOut,answeredAt:now});
  if(state.answers.length===ROUND_COUNT) {state.phase='complete';state.completedAt=now;return;}
  state.roundIndex=state.answers.length;state.selected=[];state.phase='conceal';
  state.roundStartedAt=away?null:now+REVEAL_DELAY;
}
export function submit(state,now) {
  if(state.phase!=='select'||state.selected.length!==2) return false;
  finishRound(state,now);return true;
}
export function advance(state,now,{away=false,restoring=false}={}) {
  if(state.phase==='memorize'&&state.hardMode&&now>=state.startedAt+MEMORIZATION_TIME) {
    ready(state,state.startedAt+MEMORIZATION_TIME);
    // An expired memory stage starts the first question when the player returns.
    if(away||restoring) {state.roundStartedAt=null;return;}
  }
  if(!['conceal','select'].includes(state.phase)) return;
  if(state.roundStartedAt===null) {
    if(away) return;
    state.roundStartedAt=now+REVEAL_DELAY;
  }
  if(now>=state.roundStartedAt) state.phase='select';
  if(now>=deadline(state)) finishRound(state,now,{timedOut:true,away:away||restoring});
}

export function roundShareText(title,state,deal,url='') {
  const places=state.answers.map((answer,i)=>{
    if(answer.selected.length!==2) return 0;
    const groups=handGroups(deal.board,deal.communities[i]);
    const hand=evaluate([...deal.communities[i],...answer.selected.map(p=>deal.board[p])]);
    return groups.findIndex(g=>g.score===hand.score)+1;
  });
  const badges=places.map(place=>place?(['🥇','🥈','🥉'][place-1]||'🃏'):'—').join('');
  const token=state.hardMode&&places.length===ROUND_COUNT&&places.every(place=>place===1)?' 🪙':'';
  return `${title}\n${badges} · ${formatTime(state.memorizedAt-state.startedAt)}${state.hardMode?'*':''}${token}${url?'\n'+url:''}`;
}
