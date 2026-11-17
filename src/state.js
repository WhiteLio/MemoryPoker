export const REVEAL_DELAY = 1000;
export const SELECTION_TIME = 20000;
export function shouldReplaceDeal(activeNumber,today,{away=false,activeSession=false}={}) {
  return activeNumber!==today && (away || !activeSession);
}
export function newAttempt(number, now=Date.now()) {
  return {number,version:1,phase:'memorize',startedAt:now,memorizedAt:null,selected:[],overtime:false,completedAt:null,hiddenSince:null};
}
export function ready(state, now) {
  if(state.phase!=='memorize') return;
  state.memorizedAt=now;
  state.phase='conceal';
}
export const deadline = state => state.memorizedAt+REVEAL_DELAY+SELECTION_TIME;
export function submit(state, now) {
  if(state.phase!=='select' || state.selected.length!==2) return false;
  state.completedAt=now;
  state.phase='complete';
  return true;
}
export function advance(state, now, {away=false,restoring=false}={}) {
  if(state.phase!=='conceal' && state.phase!=='select') return;
  if(now>=state.memorizedAt+REVEAL_DELAY) state.phase='select';
  if(now>=deadline(state) && !state.overtime) {
    const expiredAway=away || restoring || (state.hiddenSince!==null && state.hiddenSince<=deadline(state));
    if(!expiredAway && state.selected.length===2) submit(state,now);
    else state.overtime=true;
  }
}
export function selectCard(state, index) {
  if(state.phase!=='select') return;
  if(state.selected.includes(index)) state.selected=state.selected.filter(i=>i!==index);
  else state.selected=[...state.selected,index].slice(-2);
}
export function formatTime(ms) {
  const seconds=Math.max(0,Math.floor(ms/1000));
  return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
}
export function shareText(number, handRank, memorizationMs, overtime, url='') {
  const badge=handRank===1?'🥇':handRank===2?'🥈':handRank===3?'🥉':`${handRank}🃏`;
  return `Memory Poker #${number}\n${badge}${formatTime(memorizationMs)}${overtime?' · Overtime':''}${url?'\n'+url:''}`;
}

export function formatNextDeal(ms) {
  const hours=Math.floor(ms/3600000);
  if(hours>=1) return `${hours}hr${hours===1?'':'s'}`;
  const minutes=Math.max(1,Math.floor(ms/60000));
  return `${minutes}min${minutes===1?'':'s'}`;
}
