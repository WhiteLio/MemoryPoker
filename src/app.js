import {generate, challengeNumber} from './generator.js';
import {face, suit, SUITS, cardText, evaluate, handGroups} from './poker.js';
import {newAttempt, ready, advance, selectCard, submit, deadline, formatTime, shareText, shouldReplaceDeal} from './state.js';
import {cardPath,preloadCards} from './cards.js';
import {helpHTML} from './help.js';
import {EASE_OUT_QUAD,newAttemptAfterIntro} from './intro.js';

const $=id=>document.getElementById(id);
const localDevelopment=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
const testMode=localDevelopment&&new URLSearchParams(location.search).get('test')==='16';
const KEY=testMode?'memory-poker:test-attempts:v1':'memory-poker:attempts:v1';
const PREFERENCES_KEY='memory-poker:preferences:v1';
let includeLink=true;
try {includeLink=JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}').includeLink!==false;} catch { /* Defaults remain usable without storage. */ }
let attempts={}, storageOK=true, storageWarning='';
function validAttempt(s,key) {
  return s && s.number===Number(key) && Number.isInteger(s.number) && s.number>0 && s.number<=(testMode?1000000:challengeNumber()) && s.version===1 &&
    ['memorize','conceal','select','complete'].includes(s.phase) && Number.isFinite(s.startedAt) &&
    (s.phase==='memorize' || Number.isFinite(s.memorizedAt)) &&
    Array.isArray(s.selected) && s.selected.length<=2 && new Set(s.selected).size===s.selected.length &&
    s.selected.every(i=>Number.isInteger(i) && i>=0 && i<generate(s.number).board.length) &&
    (s.phase!=='complete' || (s.selected.length===2 && Number.isFinite(s.completedAt))) &&
    typeof s.overtime==='boolean' && (s.hiddenSince===null || Number.isFinite(s.hiddenSince));
}
try {
  const raw=localStorage.getItem(KEY);
  if(raw) {
    const parsed=JSON.parse(raw);
    if(!parsed || typeof parsed!=='object' || Array.isArray(parsed) || Object.entries(parsed).some(([k,v])=>!validAttempt(v,k))) throw new Error('Invalid saved data');
    attempts=parsed;
  }
  localStorage.setItem(KEY,JSON.stringify(attempts));
} catch {
  storageOK=false;
  storageWarning='Progress cannot be saved in this browser.';
}
let observedDay=Math.max(1,challengeNumber());
if(!testMode) for(const [number,attempt] of Object.entries(attempts)) {
  if(Number(number)!==observedDay&&attempt.phase!=='complete') delete attempts[number];
}
let activeNumber=testMode?6:observedDay, deal=generate(activeNumber), state=attempts[activeNumber] || null;
let assetsReady=false;
let playing=false;
let introRunning=false;
let groups=handGroups(deal.board,deal.community), lastPhase='', includeOvertime=null;
if(state) {advance(state,Date.now(),{restoring:true}); state.hiddenSince=document.hidden?Date.now():null;}
function save() {
  if(!storageOK) return;
  try {localStorage.setItem(KEY,JSON.stringify(attempts));}
  catch {storageOK=false; storageWarning='Progress cannot be saved in this browser.';}
}
function cardHTML(card, position, {hidden=false,selected=false,interactive=false}={}) {
  const letter=position>=0?String.fromCharCode(65+position):'';
  const red=!hidden && [1,2].includes(suit(card));
  const label=hidden?`Position ${letter}`:`${face(card)} of ${SUITS[suit(card)]}${position>=0?`, position ${letter}`:''}`;
  const contents=`<span class="card-inner" aria-hidden="true"><span class="card-side card-front"><img src="${cardPath(card)}" alt="" draggable="false"></span><span class="card-side card-reverse"><span class="back-letter">${letter}</span></span></span>`;
  const classes=`card ${hidden?'card-back':'card-face'} ${red?'red':''} ${selected?'selected':''}`;
  return interactive?`<button class="${classes}" data-position="${position}" aria-label="${label}" aria-pressed="${selected}">${contents}</button>`:`<div class="${classes}" role="img" aria-label="${label}">${contents}</div>`;
}
function resultInfo(s=state,d=deal,g=groups) {
  const hand=evaluate([...d.community,...s.selected.map(i=>d.board[i])]);
  return {hand,place:g.findIndex(group=>group.score===hand.score)+1,ms:s.memorizedAt-s.startedAt};
}
function badge(place) {return ['🥇','🥈','🥉'][place-1] || '🃏';}
function ordinal(n) {return `${n}${n%100>=11&&n%100<=13?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th')}`;}
function render() {
  const phase=introRunning?'opening':state?.phase || 'intro';
  const previousPhase=lastPhase;
  const previousBoardTop=$('board').getBoundingClientRect().top;
  const oldFocus=document.activeElement?.dataset.position;
  $('edition').textContent=`No. ${activeNumber} · ${new Date(deal.date+'T12:00:00Z').toLocaleDateString('en',{month:'short',day:'numeric',timeZone:'UTC'})}`;
  $('welcome').hidden=playing&&!introRunning;
  document.querySelector('.game').hidden=false;
  document.querySelector('.game').inert=!playing||introRunning;
  document.querySelector('.game').setAttribute('aria-hidden',String(!playing));
  $('puzzle-nav').hidden=!playing;
  $('menu-nav').hidden=playing&&!introRunning;
  document.body.dataset.screen=introRunning?'opening':playing?(phase==='complete'?'result':'puzzle'):'welcome';
  $('enter-game').innerHTML=state?(phase==='complete'?'View result':'<span>Continue</span><span aria-hidden="true">·</span><span id="continue-clock" class="timer-readout"></span>'):'Play';
  $('enter-game').disabled=!assetsReady||introRunning;
  $('difficulty').textContent=`${deal.profile} · ${deal.board.length} cards`;
  const text={intro:['','Memorize',''],opening:['','Memorize',''],memorize:['','Memorize',''],conceal:['','Ready?',''],select:['',state?.overtime?'Overtime':'Pick two cards',''],complete:['','Your hand','']}[phase];
  $('phase-label').textContent=text[0]; $('instruction').textContent=text[1]; $('detail').textContent=text[2];
  $('phase-label').hidden=!text[0]; $('detail').hidden=!text[2];
  $('community').hidden=!playing||!['select','complete'].includes(phase);
  $('community-cards').innerHTML=['select','complete'].includes(phase)?deal.community.map(c=>cardHTML(c,-1)).join(''):'';
  const concealed=!playing||['conceal','select','intro'].includes(phase);
  $('board').innerHTML=deal.board.map((c,i)=>cardHTML(c,i,{hidden:concealed,selected:state?.selected.includes(i),interactive:phase==='select'})).join('');
  $('board').classList.toggle('preview',phase==='intro');
  $('board').classList.toggle('full-board',deal.board.length===16);
  document.querySelector('.game').dataset.phase=phase;
  $('action-area').innerHTML=phase==='intro'?`<p class="deal-note">${deal.modifier==='columns'?'Suits in columns':deal.modifier==='diagonals'?'Suits on diagonals':'Shuffled'}</p><button class="primary" id="start">Play <span>♠</span></button><p class="fine-print">Study as long as you like. Choose in 20 seconds.</p>`:phase==='memorize'?'<button class="primary" id="ready">Ready <span>→</span></button>':phase==='select'?`<div class="selection-summary">${state.selected.length?state.selected.map(i=>String.fromCharCode(65+i)).join(' + '):'Choose two'}<span>${state.selected.length}/2</span></div><button class="primary" id="submit" ${state.selected.length!==2?'disabled':''}>Submit <span>♠</span></button>`:'';
  $('results').hidden=!playing||phase!=='complete';
  if(phase==='complete') {
    renderResults();
    if(navigator.share) $('share-feedback').insertAdjacentHTML('beforebegin','<button id="copy-result" class="text-button copy-result">Copy result</button>');
    $('share-feedback').insertAdjacentHTML('beforebegin',`<label class="checkbox-label share-link-option"><input id="include-link" type="checkbox" ${includeLink?'checked':''}> Include link</label>`);
  }
  $('status').textContent=storageWarning;
  $('status').hidden=!$('status').textContent;
  $('status').classList.toggle('warning',!storageOK);
  if(phase!==lastPhase) {animatePhase(phase,lastPhase);lastPhase=phase;}
  if($('start')) { $('start').disabled=!assetsReady; if(!assetsReady) $('start').firstChild.textContent='Loading cards '; }
  renderUnfinished(); updateClock();
  if(oldFocus!==undefined) $('board').querySelector(`[data-position="${oldFocus}"]`)?.focus({preventScroll:true});
  fitLayout();
  if(phase==='select'&&previousPhase==='conceal'&&!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const offset=previousBoardTop-$('board').getBoundingClientRect().top;
    $('board').animate([{transform:`translateY(${offset}px)`},{transform:'none'}],{duration:320,easing:EASE_OUT_QUAD});
  }
}
function fitLayout() {
  const width=window.visualViewport?.width||innerWidth;
  const height=window.visualViewport?.height||innerHeight;
  const landscape=width>height&&height<600;
  const rows=deal.board.length/4, gap=height<700?6:8;
  const availableHeight=height-(landscape?92:height<700?230:266);
  const cardHeight=(availableHeight-(rows-1)*gap)/(landscape?rows:rows+1);
  const cardWidth=Math.max(24,Math.min(84,cardHeight/1.4,((landscape?width*.56:width)-40-3*gap)/4));
  document.documentElement.style.setProperty('--card-width',`${cardWidth}px`);
  document.documentElement.style.setProperty('--grid-gap',`${gap}px`);
  document.documentElement.style.setProperty('--viewport-height',`${height}px`);
}
window.addEventListener('resize',fitLayout);
window.visualViewport?.addEventListener('resize',fitLayout);
function animatePhase(phase,previous) {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards=[...$('board').querySelectorAll('.card')];
  if(phase==='conceal') cards.forEach((card,i)=>card.querySelector('.card-inner').animate([{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],{duration:440,delay:i*16,easing:EASE_OUT_QUAD,fill:'backwards'}));
  if(phase==='complete'&&previous==='select') cards.forEach((card,i)=>card.querySelector('.card-inner').animate([{transform:'rotateY(180deg)'},{transform:'rotateY(0deg)'}],{duration:440,delay:i*16,easing:EASE_OUT_QUAD,fill:'backwards'}));
  if(phase==='select'&&previous==='conceal') $('community').animate([{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'none'}],{duration:280,easing:EASE_OUT_QUAD});
}
async function enterGame() {
  if(introRunning||!assetsReady) return;
  if(state) {playing=true;state.hiddenSince=null;save();render();return;}
  const number=activeNumber;
  introRunning=true;playing=true;render();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animations=[];
  const options={duration:reduced?0:480,easing:EASE_OUT_QUAD,fill:'both'};
  animations.push($('welcome').animate([{opacity:1},{opacity:0}],options));
  animations.push($('menu-nav').animate([{opacity:1},{opacity:0}],options));
  animations.push($('board').animate([{opacity:.13},{opacity:1}],options));
  animations.push($('puzzle-nav').animate([{opacity:0},{opacity:1}],options));
  animations.push(document.querySelector('.stage-heading').animate([{opacity:0},{opacity:1}],options));
  for(const [i,card] of [...$('board').querySelectorAll('.card-inner')].entries()) {
    animations.push(card.animate([{transform:'rotateY(180deg)'},{transform:'rotateY(0deg)'}],{...options,delay:reduced?0:i*10}));
  }
  const freshAttempt=await newAttemptAfterIntro(number,animations);
  animations.forEach(animation=>animation.cancel());
  introRunning=false;
  if(activeNumber!==number) {playing=false;render();return;}
  // Start the scored clock only once every card has finished revealing.
  state=attempts[number]||freshAttempt;
  state.hiddenSince=document.hidden?Date.now():null;
  attempts[number]=state;save();render();
}
function updateClock() {
  const now=Date.now(), phase=state?.phase;
  $('clock-label').textContent=phase==='select'?(state.overtime?'OVERTIME':'CHOOSE'):phase==='conceal'?'RECALL':'MEMORIZE';
  $('clock').textContent=!state?'0:00':phase==='memorize'?formatTime(now-state.startedAt):phase==='select'?(state.overtime?'+'+formatTime(now-deadline(state)):String(Math.max(0,Math.ceil((deadline(state)-now)/1000)))+'s'):phase==='conceal'?'1s':formatTime(state.memorizedAt-state.startedAt);
  $('clock').classList.toggle('overtime',!!state?.overtime);
  if($('continue-clock')) $('continue-clock').textContent=$('clock').textContent;
  const untilReset=86400000-((now%86400000)+86400000)%86400000;
  const hours=Math.floor(untilReset/3600000),minutes=Math.floor(untilReset%3600000/60000);
  const resetText=`${hours}h ${String(minutes).padStart(2,'0')}m`;
  if($('next-deal').dataset.time!==resetText) {
    $('next-deal').innerHTML=`Next deal <span class="timer-readout">${resetText}</span>`;
    $('next-deal').dataset.time=resetText;
  }
}
function renderResults() {
  const {hand,place,ms}=resultInfo();
  $('results').innerHTML=`<div class="result-card"><div class="result-medal">${badge(place)}</div><div><p class="eyebrow">${ordinal(place).toUpperCase()} BEST HAND${state.overtime?' · OVERTIME':''}</p><h2>${hand.name}</h2><p><strong>${formatTime(ms)}</strong> memorizing</p></div></div><button id="share" class="primary">Share <span>↗</span></button><div id="share-feedback" role="status"></div><div class="section-divider"><span>BEST HANDS</span></div><div class="best-hands">${groups.slice(0,3).map((g,i)=>`<details ${i===0?'open':''}><summary><span>${badge(i+1)} ${g.name}</span><span>${g.pairs.length} ${g.pairs.length===1?'pair':'pairs'} <span aria-hidden="true">⌄</span></span></summary><div class="pair-list">${g.pairs.map(pair=>`<div class="pair"><b>${pair.map(p=>String.fromCharCode(65+p)).join(' + ')}</b><span>${pair.map(p=>`<span class="${[1,2].includes(suit(deal.board[p]))?'red':''}">${cardText(deal.board[p])}</span>`).join(' & ')}</span></div>`).join('')}</div></details>`).join('')}</div><button class="secondary" id="view-records">Records</button>`;
}
function renderUnfinished() {$('unfinished').hidden=true;}
function reconcile(options={}) {
  if(!state) return;
  const before=state.phase+state.overtime;
  advance(state,Date.now(),{away:document.hidden||!playing||$('modal').open,...options});
  if(before!==state.phase+state.overtime) {save();render();}
}
function switchDeal(number) {
  activeNumber=number; deal=generate(number); groups=handGroups(deal.board,deal.community); state=attempts[number]||null;
  if(state) {advance(state,Date.now(),{restoring:true});state.hiddenSince=document.hidden?Date.now():null;}
  save();render();window.scrollTo({top:0,behavior:'instant'});
}
function refreshDaily({away=false}={}) {
  if(testMode) return false;
  const today=Math.max(1,challengeNumber());
  if(!shouldReplaceDeal(activeNumber,today,{away,activeSession:playing&&!!state})) return false;
  for(const [number,attempt] of Object.entries(attempts)) {
    if(Number(number)!==today&&attempt.phase!=='complete') delete attempts[number];
  }
  playing=false;observedDay=today;switchDeal(today);
  return true;
}
document.addEventListener('change',event=>{
  if(event.target.id!=='include-link') return;
  includeLink=event.target.checked;
  try {localStorage.setItem(PREFERENCES_KEY,JSON.stringify({includeLink}));} catch { /* Keep this choice for the current session. */ }
});
document.addEventListener('click',event=>{
  const button=event.target.closest('button'); if(!button) return;
  if(introRunning) return;
  reconcile();
  if(button.id==='enter-game') {
    void enterGame();
  }
  if(button.id==='home') {playing=false;if(state)state.hiddenSince=Date.now();save();render();}
  if(button.id==='start' && !state) {state=newAttempt(activeNumber);attempts[activeNumber]=state;save();render();}
  if(button.id==='ready') {ready(state,Date.now());save();render();}
  if(button.dataset.position!==undefined) {selectCard(state,Number(button.dataset.position));save();render();}
  if(button.id==='submit' && submit(state,Date.now())) {save();render();}
  if(button.dataset.resume) switchDeal(Number(button.dataset.resume));
  if(button.id==='help'||button.id==='puzzle-help') openHelp();
  if(button.id==='records'||button.id==='puzzle-records'||button.id==='view-records') openRecords();
  if(button.id==='close-modal') $('modal').close();
  if(button.id==='share') void share(true);
  if(button.id==='copy-result') void share(false);
  if(button.id==='reset-test') {delete attempts[activeNumber];state=null;playing=false;save();lastPhase='';$('modal').close();render();}
});
function openModal(title,html) {$('modal-title').textContent=title;$('modal-body').innerHTML=html;$('modal').showModal();}
function openHelp() {
  openModal("How to play",helpHTML()+(localDevelopment?`<details><summary>Development</summary><button id="reset-test" class="secondary">Reset this attempt</button><p><a href="${testMode?"./":"?test=16"}">${testMode?"Daily game":"Try 16 cards"}</a></p></details>`:""));
}
function recordSummary() {
  const completed=Object.values(attempts).filter(s=>s.phase==='complete');
  const days=completed.map(s=>s.number).sort((a,b)=>a-b);
  let best=0,run=0,previous=-2;
  for(const n of days) {run=n===previous+1?run+1:1;best=Math.max(best,run);previous=n;}
  const set=new Set(days),today=challengeNumber();let current=0,n=set.has(today)?today:today-1;
  while(set.has(n)) {current++;n--;}
  const medals=[0,0,0,0];
  for(const s of completed) {
    if(s.overtime&&!includeOvertime) continue;
    const d=generate(s.number),g=handGroups(d.board,d.community),{place}=resultInfo(s,d,g);
    medals[Math.min(place-1,3)]++;
  }
  return {completed:completed.length,current,best,medals};
}
function openRecords() {
  includeOvertime=!!(state?.phase==='complete'&&state.overtime);
  openModal('Records',''); renderRecords();
}
function renderRecords() {
  const r=recordSummary();
  $('modal-body').innerHTML=`<div class="record-grid"><div><strong>${r.completed}</strong><span>Played</span></div><div><strong>${r.current}</strong><span>Play streak</span></div><div><strong>${r.best}</strong><span>Best streak</span></div></div><div class="section-divider"><span>YOUR HANDS</span></div><div class="record-grid medals">${r.medals.map((n,i)=>`<div><span>${['🥇','🥈','🥉','🃏'][i]}</span><strong>${n}</strong></div>`).join('')}</div><label class="checkbox-label"><input id="include-overtime" type="checkbox" ${includeOvertime?'checked':''}> Include overtime</label>`;
  $('include-overtime').addEventListener('change',e=>{includeOvertime=e.target.checked;renderRecords();$('include-overtime').focus();});
}
async function share(useNative=true) {
  const url=includeLink?new URL('./',location.href).href:'';
  const {place,ms}=resultInfo();
  let text=shareText(activeNumber,place,ms,state.overtime,url);
  if(testMode) text=text.replace(`Memory Poker #${activeNumber}`,'Memory Poker · Test');
  if(useNative && navigator.share) {
    try {
      await navigator.share({text});
      return;
    } catch(error) {
      if(error.name==='AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    $('share-feedback').textContent='Copied!';
  } catch {
    openModal('Share','<textarea id="share-copy" readonly rows="3" aria-label="Share result"></textarea>');
    $('share-copy').value=text;$('share-copy').select();
  }
}
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&refreshDaily({away:true})) return;
  if(state) {
    if(document.hidden) {state.hiddenSince=Date.now();save();}
    else {reconcile();state.hiddenSince=null;save();}
  }
});
window.addEventListener('pagehide',()=>{if(state) {state.hiddenSince=Date.now();save();}});
window.addEventListener('pageshow',event=>{if(refreshDaily({away:true})) return;if(event.persisted&&state) {reconcile({restoring:true});state.hiddenSince=null;save();render();}});
// Apply other tabs' updates without reloads or write-back loops.
window.addEventListener('storage',event=>{
  if(event.key!==KEY) return;
  try {
    const updated=JSON.parse(event.newValue || '{}');
    if(!updated || typeof updated!=='object' || Array.isArray(updated) || Object.entries(updated).some(([k,v])=>!validAttempt(v,k))) return;
    if(playing&&state&&activeNumber!==Math.max(1,challengeNumber())&&!updated[activeNumber]) updated[activeNumber]=state;
    attempts=updated;state=attempts[activeNumber]||null;
    if(state) advance(state,Date.now(),{away:document.hidden});
    render();
  } catch { /* Leave the current attempt intact if another tab writes invalid data. */ }
});
setInterval(()=>{
  if(refreshDaily({away:document.hidden})) return;
  reconcile();updateClock();
},100);
save();render();
void preloadCards([...deal.board,...deal.community]).then(()=>{assetsReady=true;render();});
