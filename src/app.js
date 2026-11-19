import {preloadMenu} from './loading.js';
import {mergeProgress,storedProgress,resetProgress} from './persistence.js';
import {PATTERNS,CLARITIES,PRESETS,practiceSettings,practiceKey} from './practice.js';
import {difficultyMetrics} from './difficulty.js';
import {DIFFICULTIES,MAX_SEED,endlessNumber,endlessSettings} from './endless.js';
import {challengeNumber} from './generator.js';
import {generateRounds,ROUND_COUNT,SELECTION_TIME,newAttempt,ready,advance,submit,deadline} from './rounds.js';
import {face, suit, SUITS, cardText, evaluate, handGroups, handLabels} from './poker.js';
import {selectCard, formatTime, shareText, shouldReplaceDeal, formatNextDeal} from './state.js';
import {cardPath,preloadCards} from './cards.js';
import {helpHTML} from './help.js';
import {EASE_OUT_QUAD,newAttemptAfterIntro} from './intro.js';

const $=id=>document.getElementById(id);
const localDevelopment=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
const testMode=localDevelopment&&new URLSearchParams(location.search).get('test')==='16';
const endlessMode=new URLSearchParams(location.search).get('mode')==='endless';
const endless=endlessSettings(location.search);
const chosenLab=endlessMode?practiceSettings(location.search):null;
const lab=chosenLab?{...chosenLab,count:16}:null;
const clearMode=endlessMode&&new URLSearchParams(location.search).get('answers')==='clear';
const generate=number=>generateRounds(number);
const practiceGenerate=number=>generateRounds(number,lab);
const LEGACY_KEY=lab?`memory-poker:lab:v1:${practiceKey(lab)}`:endlessMode?(clearMode?'memory-poker:clear-attempts:v1':'memory-poker:endless-attempts:v1'):testMode?'memory-poker:test-attempts:v1':'memory-poker:attempts:v1';
const KEY=`memory-poker:five-rounds:v1:${LEGACY_KEY}`;
let reviewRound=0;
const PREFERENCES_KEY='memory-poker:preferences:v1';
let includeLink=true;
try {includeLink=JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}').includeLink!==false;} catch { /* Defaults remain usable without storage. */ }
let attempts={}, storageOK=true, storageWarning='';
function validAttempt(s,key) {
  if(s?.phase==='reset') return s.number===Number(key)&&Number.isInteger(s.number)&&s.number>0&&s.number<=(testMode||endlessMode?1000000:Math.max(1,challengeNumber()))&&Number.isFinite(s.generation)&&s.generation>0&&Array.isArray(s.selected)&&s.selected.length===0;
  return s && s.number===Number(key) && Number.isInteger(s.number) && s.number>0 && s.number<=(testMode||endlessMode?1000000:challengeNumber()) && s.version===2 &&
    Number.isInteger(s.roundIndex)&&s.roundIndex>=0&&s.roundIndex<ROUND_COUNT&&Array.isArray(s.answers)&&s.answers.length===(s.phase==='complete'?ROUND_COUNT:s.roundIndex)&&
    s.answers.every(a=>Array.isArray(a.selected)&&a.selected.length<=2&&new Set(a.selected).size===a.selected.length&&a.selected.every(i=>Number.isInteger(i)&&i>=0&&i<16)&&typeof a.timedOut==='boolean'&&Number.isFinite(a.answeredAt))&&
    (s.roundStartedAt===null||Number.isFinite(s.roundStartedAt))&&
    ['memorize','conceal','select','complete'].includes(s.phase) && Number.isFinite(s.startedAt) &&
    (s.phase==='memorize' || Number.isFinite(s.memorizedAt)) &&
    Array.isArray(s.selected) && s.selected.length<=2 && new Set(s.selected).size===s.selected.length &&
    s.selected.every(i=>Number.isInteger(i) && i>=0 && i<16) &&
    (s.phase!=='complete' || Number.isFinite(s.completedAt)) &&
    (s.generation===undefined||Number.isFinite(s.generation)) && (s.updatedAt===undefined||Number.isFinite(s.updatedAt)) && typeof s.overtime==='boolean' && (s.hiddenSince===null || Number.isFinite(s.hiddenSince));
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
if(!testMode&&!endlessMode) for(const [number,attempt] of Object.entries(attempts)) {
  if(Number(number)!==observedDay&&attempt.phase!=='complete') delete attempts[number];
}
let activeNumber=endlessMode?endlessNumber(lab?0:endless.profile,endless.seed):testMode?6:observedDay, deal=practiceGenerate(activeNumber), state=attemptFor(activeNumber);
let assetsReady=false;
let playing=false;
let introRunning=false;
let groups=handGroups(deal.board,deal.community), lastPhase='', includeOvertime=null,announcementKey='';
if(state) {advance(state,Date.now(),{restoring:true}); state.hiddenSince=document.hidden?Date.now():null;}
function attemptFor(number) {return attempts[number]?.phase==='reset'?null:attempts[number]||null;}
function readProgress() {
  const parsed=JSON.parse(localStorage.getItem(KEY)||'{}');
  if(!parsed||typeof parsed!=='object'||Array.isArray(parsed)||Object.entries(parsed).some(([k,v])=>!validAttempt(v,k))) throw new Error('Invalid saved data');
  return parsed;
}
function syncProgress() {
  if(!storageOK) return false;
  const before=state?`${state.phase}:${state.roundIndex}:${state.roundStartedAt}:${state.overtime}:${state.selected.join(',')}`:'';
  try {
    const hiddenSince=state?.hiddenSince??null;
    attempts=mergeProgress(attempts,readProgress());
    state=attemptFor(activeNumber);
    if(state) state.hiddenSince=hiddenSince;
    return before!==(state?`${state.phase}:${state.roundIndex}:${state.roundStartedAt}:${state.overtime}:${state.selected.join(',')}`:'');
  } catch {storageOK=false;storageWarning='Progress cannot be saved in this browser.';return true;}
}
function save({changed=false,remove=null}={}) {
  if(!storageOK) return;
  try {
    if(changed&&state) state.updatedAt=Math.max(Date.now(),(state.updatedAt||0)+1);
    syncProgress();
    if(!storageOK) return;
    if(remove!==null) {attempts[remove]=resetProgress(remove,attempts[remove]);if(remove===activeNumber) state=null;}
    if(!testMode&&!endlessMode) for(const [number,attempt] of Object.entries(attempts)) {
      if(Number(number)!==activeNumber&&Number(number)!==Math.max(1,challengeNumber())&&attempt.phase!=='complete') delete attempts[number];
    }
    localStorage.setItem(KEY,JSON.stringify(storedProgress(attempts)));
  } catch {storageOK=false;storageWarning='Progress cannot be saved in this browser.';}
}
function cardHTML(card, position, {hidden=false,selected=false,interactive=false}={}) {
  const letter=position>=0?String.fromCharCode(65+position):'';
  const red=!hidden && [1,2].includes(suit(card));
  const label=hidden?(position>=0?`Position ${letter}`:'Face-down shared card'):`${face(card)} of ${SUITS[suit(card)]}${position>=0?`, position ${letter}`:''}`;
  const contents=`<span class="card-inner" aria-hidden="true"><span class="card-side card-front"><img src="${cardPath(card)}" alt="" draggable="false"></span><span class="card-side card-reverse"><span class="back-letter">${letter}</span></span></span>`;
  const classes=`card ${hidden?'card-back':'card-face'} ${red?'red':''} ${selected?'selected':''}`;
  return interactive?`<button class="${classes}" data-position="${position}" aria-label="${label}" aria-pressed="${selected}">${contents}</button>`:`<div class="${classes}" role="img" aria-label="${label}">${contents}</div>`;
}
function resultInfo(s=state,d=deal,g=groups) {
  const selected=s.answers?.[reviewRound]?.selected||s.selected;
  const hand=selected.length===2?evaluate([...d.community,...selected.map(i=>d.board[i])]):null;
  return {hand,place:hand?g.findIndex(group=>group.score===hand.score)+1:0,ms:s.memorizedAt-s.startedAt};
}
function badge(place) {if(!place)return '—';return ['🥇','🥈','🥉'][place-1] || '🃏';}
function render() {
  const currentRound=state?.phase==='complete'?reviewRound:state?.roundIndex||0;
  deal.community=deal.communities[currentRound];
  groups=handGroups(deal.board,deal.community);
  const visibleSelection=state?.phase==='complete'?state.answers[reviewRound].selected:state?.selected||[];
  const previousScreen=document.body.dataset.screen;
  const hadGameFocus=document.querySelector('.game').contains(document.activeElement);
  const phase=introRunning?'opening':state?.phase || 'intro';
  const previousPhase=lastPhase;
  const movingToRecall=playing&&previousPhase==='memorize'&&phase==='conceal'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const recallPositions=movingToRecall?[$('board'),document.querySelector('.stage-heading > div:first-child')].map(element=>({element,rect:element.getBoundingClientRect()})):null;
  const leavingControls=movingToRecall?[$('ready'),document.querySelector('.clock')].filter(Boolean).map(element=>({clone:element.cloneNode(true),rect:element.getBoundingClientRect()})):[];
  const oldFocus=document.activeElement?.dataset.position;
  $('edition').textContent=`#${activeNumber} · ${new Date(deal.date+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})}`;
  if(endlessMode) $('edition').textContent=`${lab?CLARITIES[lab.clarity]:clearMode?'Obvious answer':'Endless'}`;
  $('next-deal').hidden=endlessMode;
  $('records').hidden=endlessMode;
  $('puzzle-records').hidden=endlessMode;
  $('endless-entry').textContent=endlessMode?'Change difficulty':'Endless';
  $('daily-entry').hidden=!endlessMode;
  $('endless-tools').hidden=!endlessMode;
  document.querySelector('.game').setAttribute('aria-label',endlessMode?'Endless challenge':'Daily challenge');
  $('welcome').hidden=playing&&!introRunning;
  document.querySelector('.game').hidden=false;
  document.querySelector('.game').inert=!playing||introRunning;
  document.querySelector('.game').setAttribute('aria-hidden',String(!playing));
  $('puzzle-nav').hidden=!playing;
  $('puzzle-nav').inert=introRunning;
  $('menu-nav').hidden=playing&&!introRunning;
  document.body.dataset.screen=introRunning?'opening':playing?(phase==='complete'?'result':'puzzle'):'welcome';
  $('enter-game').innerHTML=state?(phase==='complete'?'View result':'<span>Continue</span><span aria-hidden="true">·</span><span id="continue-clock" class="timer-readout"></span>'):'Start Timer';
  $('enter-game').disabled=!assetsReady||introRunning;
  $('difficulty').textContent=`${new Date(deal.date+'T12:00:00Z').toLocaleDateString('en',{weekday:'long',timeZone:'UTC'})} · ${deal.board.length} cards`;
  if(endlessMode) $('difficulty').textContent=lab?`${lab.count} cards · ${PATTERNS[lab.pattern]} · ${CLARITIES[lab.clarity]}`:DIFFICULTIES[endless.profile].replace(/\d+ cards/,'16 cards');
  const text={intro:['','Memorise',''],opening:['','Memorise',''],memorize:['','Memorise',''],conceal:['','Choose 2',''],select:['','Choose 2',''],complete:['','Results','']}[phase];
  $('phase-label').textContent=text[0]; $('instruction').textContent=text[1]; $('detail').textContent=text[2];
  $('phase-label').hidden=!text[0]; $('detail').hidden=!text[2];
  if(endlessMode) {$('phase-label').textContent=`${lab?`${lab.count} cards · ${PATTERNS[lab.pattern]}`:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][endless.profile]}`;$('phase-label').hidden=false;}
  if(['conceal','select'].includes(phase)) { $('phase-label').textContent=`Question ${(state?.roundIndex||0)+1} of ${ROUND_COUNT}`;$('phase-label').hidden=false; }
  if(phase==='memorize') {$('phase-label').textContent='16 cards';$('phase-label').hidden=false;}
  $('community').hidden=!playing||!['conceal','select','complete'].includes(phase);
  const sharedKey=`${currentRound}:${phase==='conceal'?'back':'face'}`;
  if($('community-cards').dataset.renderKey!==sharedKey) {
    $('community-cards').innerHTML=['conceal','select','complete'].includes(phase)?deal.community.map(c=>cardHTML(c,-1,{hidden:phase==='conceal'})).join(''):'';
    $('community-cards').dataset.renderKey=sharedKey;
  }
  const concealed=!playing||['conceal','select','intro'].includes(phase);
  $('board').innerHTML=deal.board.map((c,i)=>cardHTML(c,i,{hidden:concealed,selected:visibleSelection.includes(i),interactive:phase==='select'})).join('');
  $('board').classList.toggle('preview',phase==='intro');
  $('board').classList.toggle('full-board',deal.board.length===16);
  $('board').classList.toggle('pair-chosen',['select','complete'].includes(phase)&&visibleSelection.length===2);
  document.querySelector('.game').dataset.phase=phase;
  $('action-area').innerHTML=phase==='intro'?`<p class="deal-note">${deal.modifier==='columns'?'Suits in columns':deal.modifier==='diagonals'?'Suits on diagonals':'Shuffled'}</p><button class="primary" id="start">Start Timer <span>♠</span></button><p class="fine-print">Study as long as you like. Choose in 20 seconds.</p>`:phase==='memorize'?'<button class="primary" id="ready">Ready <span>→</span></button>':[ 'conceal','select'].includes(phase)?`<div class="selection-summary">${state.selected.length?state.selected.map(i=>String.fromCharCode(65+i)).join(' + '):'Choose two'}<span>${state.selected.length}/2</span></div><button class="primary" id="submit" ${phase==='conceal'||state.selected.length!==2?'disabled':''}>${state.roundIndex===ROUND_COUNT-1?'Finish':'Next question'} <span>→</span></button>`:'';
  $('results').hidden=!playing||phase!=='complete';
  if(phase==='complete') renderResults();
  $('status').textContent=storageWarning;
  $('status').hidden=!$('status').textContent;
  $('status').classList.toggle('warning',!storageOK);
  if(phase!==lastPhase) {animatePhase(phase,lastPhase);lastPhase=phase;if(playing&&['conceal','complete'].includes(phase))window.scrollTo({top:0,behavior:'instant'});}
  if($('start')) { $('start').disabled=!assetsReady; if(!assetsReady) $('start').firstChild.textContent='Loading cards '; }
  renderUnfinished(); updateClock();
  if(oldFocus!==undefined&&phase==='select') $('board').querySelector(`[data-position="${oldFocus}"]`)?.focus({preventScroll:true});
  if(playing&&!introRunning&&phase!=='conceal'&&(phase!==previousPhase||previousScreen==='welcome'||previousScreen==='opening')) $('instruction').focus({preventScroll:true});
  if(!playing&&hadGameFocus) $('enter-game').focus({preventScroll:true});
  const nextAnnouncementKey=`${playing&&!introRunning}:${phase}:${state?.roundIndex}:${state?.overtime}:${state?.selected.join(',')}`;
  if(nextAnnouncementKey!==announcementKey) {
    const selection=state?.selected.map(i=>String.fromCharCode(65+i)).join(' and ');
    const choosing=phase!==previousPhase||previousScreen==='welcome'||previousScreen==='opening';
    const announcement=playing&&!introRunning?(phase==='memorize'?'Memorise the cards. Take as long as you need.':phase==='conceal'?'Cards concealed.':phase==='select'?`${choosing?`Question ${state.roundIndex+1} of ${ROUND_COUNT}. Choose two cards. You have 20 seconds.`:''} ${selection?`Selected ${selection}.`:''} ${state.selected.length} of 2 selected.`:phase==='complete'?`All five questions complete. Memorized in ${formatTime(resultInfo().ms)}.`:''):'';
    $('announcements').textContent=announcement.trim();
    announcementKey=nextAnnouncementKey;
  }
  fitLayout();
  if(recallPositions) {
    const options={duration:440,easing:EASE_OUT_QUAD};
    recallPositions.forEach(({element,rect})=>{
      const target=element.getBoundingClientRect();
      element.style.transformOrigin='top left';
      element.animate([{transform:`translate(${rect.left-target.left}px,${rect.top-target.top}px) scale(${element.id==='board'?rect.width/target.width:1},${element.id==='board'?rect.height/target.height:1})`},{transform:'none'}],{...options,composite:'replace'});
    });
    leavingControls.forEach(({clone,rect})=>{
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach(element=>element.removeAttribute('id'));
      clone.setAttribute('aria-hidden','true');
      clone.inert=true;
      Object.assign(clone.style,{position:'fixed',left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:'0',pointerEvents:'none',zIndex:'5'});
      document.body.append(clone);
      clone.animate([{opacity:1},{opacity:0,transform:'translateY(8px)'}],{duration:180,easing:EASE_OUT_QUAD,fill:'forwards'}).finished.finally(()=>clone.remove());
    });
    $('community').animate([{opacity:0},{opacity:1}],{duration:240,easing:EASE_OUT_QUAD});
  }
  const screen=document.body.dataset.screen;
  if(!document.documentElement.hasAttribute('data-loading')&&screen!==previousScreen&&screen!=='opening'&&previousScreen!=='opening') {
    animateSurface(screen==='welcome'?$('welcome'):document.querySelector('.game'));
  }

}
function fitLayout() {
  const width=window.visualViewport?.width||innerWidth;
  const height=window.visualViewport?.height||innerHeight;
  const memorising=(playing||introRunning)&&['intro','opening','memorize'].includes(document.querySelector('.game').dataset.phase);
  const table=document.querySelector('.table');
  const tableStyle=getComputedStyle(table);
  const contentWidth=table.clientWidth-parseFloat(tableStyle.paddingLeft)-parseFloat(tableStyle.paddingRight);
  const rows=deal.board.length/4, gap=height<700?6:8;
  const plaqueExtra=Math.max(0,document.querySelector('.plaque').getBoundingClientRect().height-26);
  document.documentElement.style.setProperty('--plaque-extra',`${plaqueExtra}px`);
  const gameStyle=getComputedStyle(document.querySelector('.game'));
  const memoryChrome=$('puzzle-nav').getBoundingClientRect().height
    +document.querySelector('.stage-heading').getBoundingClientRect().height
    +Math.max(68,$('action-area').getBoundingClientRect().height)
    +parseFloat(gameStyle.paddingTop)+parseFloat(gameStyle.paddingBottom)+2*gap+16;
  const communityStyle=getComputedStyle($('community'));
  const trayChrome=['paddingTop','paddingBottom','borderTopWidth','borderBottomWidth','marginTop','marginBottom'].reduce((total,key)=>total+parseFloat(communityStyle[key]||0),0);
  const recalling=playing&&['conceal','select'].includes(document.querySelector('.game').dataset.phase);
  const recallChrome=$('puzzle-nav').getBoundingClientRect().height
    +document.querySelector('.stage-heading').getBoundingClientRect().height
    +Math.max(76,$('action-area').getBoundingClientRect().height)
    +parseFloat(gameStyle.paddingTop)+parseFloat(gameStyle.paddingBottom)+3*gap+trayChrome+16;
  const availableHeight=height-(memorising?memoryChrome:recalling?recallChrome:height<700?230:266);
  const cardHeight=(availableHeight-(rows-1)*gap)/(memorising?rows:rows+1);
  const cardWidth=Math.max(24,Math.min(78,cardHeight/1.4,(contentWidth-3*gap)/4));
  document.documentElement.style.setProperty('--card-width',`${cardWidth}px`);
  document.documentElement.style.setProperty('--grid-gap',`${gap}px`);
  document.documentElement.style.setProperty('--viewport-height',`${height}px`);
}
window.addEventListener('resize',fitLayout);
window.visualViewport?.addEventListener('resize',fitLayout);
function animatePhase(phase,previous) {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards=[...$('board').querySelectorAll('.card')];
  if(phase==='conceal'&&previous==='memorize') cards.forEach((card,i)=>card.querySelector('.card-inner').animate([{transform:'rotateY(0deg)'},{transform:'rotateY(180deg)'}],{duration:440,delay:i*16,easing:EASE_OUT_QUAD,fill:'backwards'}));
  if(phase==='complete'&&previous==='select') cards.forEach((card,i)=>card.querySelector('.card-inner').animate([{transform:'rotateY(180deg)'},{transform:'rotateY(0deg)'}],{duration:440,delay:i*16,easing:EASE_OUT_QUAD,fill:'backwards'}));
  if(phase==='conceal') $('community-cards').querySelectorAll('.card').forEach((card,i)=>card.animate([{opacity:0,transform:'translateY(-32px)'},{opacity:1,transform:'none'}],{duration:320,delay:i*165,easing:EASE_OUT_QUAD,fill:'backwards'}));
  if(phase==='select'&&previous==='conceal') $('recall-progress').animate([{filter:'brightness(1)'},{filter:'brightness(2.5)',offset:.4},{filter:'brightness(1)'}],{duration:500,easing:EASE_OUT_QUAD});
  if(phase==='select'&&previous==='conceal') $('community-cards').querySelectorAll('.card-inner').forEach(card=>card.animate([{transform:'rotateY(180deg)'},{transform:'rotateY(0deg)'}],{duration:440,easing:EASE_OUT_QUAD,fill:'backwards'}));
}
async function enterGame() {
  if(introRunning||!assetsReady) return;
  if(state) {reconcile({restoring:true});playing=true;state.hiddenSince=null;save();render();window.scrollTo({top:0,behavior:'instant'});return;}
  const number=activeNumber;
  reviewRound=0;
  introRunning=true;playing=true;render();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animations=[];
  const options={duration:reduced?0:480,easing:EASE_OUT_QUAD,fill:'both'};
  animations.push($('welcome').animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-8px)'}],options));
  animations.push(document.querySelector('.game').animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{...options,duration:reduced?0:200}));
  animations.push($('menu-nav').animate([{opacity:1},{opacity:0}],options));
  animations.push($('board').animate([{opacity:.13},{opacity:1}],options));
  animations.push($('puzzle-nav').animate([{opacity:0},{opacity:1}],options));
  animations.push(document.querySelector('.stage-heading').animate([{opacity:0},{opacity:1}],options));
  for(const [i,card] of [...$('board').querySelectorAll('.card-inner')].entries()) {
    animations.push(card.animate([{transform:'rotateY(180deg)'},{transform:'rotateY(0deg)'}],{...options,delay:reduced?0:i*10}));
  }
  const introAttempt=await newAttemptAfterIntro(number,animations);
  const freshAttempt=newAttempt(number,introAttempt.startedAt);
  animations.forEach(animation=>animation.cancel());
  introRunning=false;
  if(activeNumber!==number) {playing=false;render();return;}
  // Start the scored clock only once every card has finished revealing.
  freshAttempt.generation=attempts[number]?.generation||0;
  state=attemptFor(number)||freshAttempt;
  state.hiddenSince=document.hidden?Date.now():null;
  attempts[number]=state;save({changed:true});render();
}
function updateClock() {
  const now=Date.now(), phase=state?.phase;
  $('clock').setAttribute('aria-label',phase==='select'?'Selection time remaining':phase==='conceal'?'Preparing next question':'Elapsed memorisation time');
  const clockTime=ms=>formatTime(ms).padStart(5,'0');
  $('clock').textContent=!state?'00:00':phase==='memorize'?clockTime(now-state.startedAt):phase==='select'?clockTime(Math.ceil(Math.max(0,deadline(state)-now)/1000)*1000):phase==='conceal'?'00:01':clockTime(state.memorizedAt-state.startedAt);
  $('clock').classList.toggle('overtime',!!state?.overtime);
  const progress=$('recall-progress');
  progress.hidden=!['conceal','select'].includes(phase)||!playing;
  const remaining=state?.roundStartedAt===null?SELECTION_TIME:Math.max(0,(state?deadline(state):0)-now);
  progress.style.setProperty('--remaining',Math.min(1,remaining/SELECTION_TIME));
  progress.setAttribute('aria-valuenow',String(Math.ceil(remaining/1000)));
  const elapsed=1-Math.min(1,remaining/SELECTION_TIME);
  progress.style.setProperty('--bar-color',`rgb(${[74,49,99].map((v,i)=>Math.round(v+([206,178,235][i]-v)*elapsed)).join(' ')})`);
  progress.classList.toggle('is-urgent',phase==='select'&&remaining<=3000);
  if($('continue-clock')) $('continue-clock').textContent=$('clock').textContent;
  const untilReset=86400000-((now%86400000)+86400000)%86400000;
  const resetText=formatNextDeal(untilReset);
  if($('next-deal').dataset.time!==resetText) {
    $('next-deal').innerHTML=`Next deal in <span>${resetText}</span>`;
    $('next-deal').dataset.time=resetText;
  }
}
function renderResults() {
  const {hand,place,ms}=resultInfo();
  const labels=handLabels(groups.slice(0,3));
  const resultLabel=hand?handLabels([hand])[0]:'No answer';
  const metrics=endlessMode?difficultyMetrics(deal.board,deal.community):null;
  const review=metrics?`<details class="difficulty-review" open><summary>Difficulty review</summary><dl><dt>Best → second</dt><dd>${metrics.best} → ${metrics.second}</dd><dt>Category gap</dt><dd>${metrics.categoryGap} ${metrics.categoryGap===1?'tier':'tiers'}</dd><dt>Winning pairs</dt><dd>${metrics.winningPairs} / ${metrics.totalPairs}</dd><dt>Same-category rivals</dt><dd>${metrics.sameCategoryPairs} pairs</dd><dt>Shared cards in combination</dt><dd>${metrics.sharedContributors} / 3</dd></dl><p>A larger category gap is a clarity signal, not a measured difficulty score.</p></details>`:'';
  const placing=!place?'Missed question':place===1?'Best hand':`${place===2?'2nd':place===3?'3rd':`#${place}`} best hand`;
  const roundPlaces=state.answers.map((answer,i)=>{if(answer.selected.length!==2)return 0;const gs=handGroups(deal.board,deal.communities[i]);const h=evaluate([...deal.communities[i],...answer.selected.map(p=>deal.board[p])]);return gs.findIndex(g=>g.score===h.score)+1;});
  const roundHeader=`<div class="round-score"><strong>${roundPlaces.filter(p=>p===1).length} / ${ROUND_COUNT} best hands</strong></div><nav class="round-tabs" aria-label="Review each question">${roundPlaces.map((p,i)=>`<button class="secondary" data-review-round="${i}" aria-pressed="${i===reviewRound}">${i+1} ${badge(p)}</button>`).join('')}</nav>`;
  $('results').innerHTML=`${roundHeader}${endlessMode?'<div class="endless-result-actions"><button class="primary" id="endless-next">Next deal</button><button class="secondary" id="endless-replay">Replay deal</button><button class="text-button" id="endless-config">Change difficulty</button></div>':''}<div class="result-card"><div class="result-medal">${badge(place)}</div><div><p class="eyebrow">${placing}${state.overtime?' · OVERTIME':''}</p><h2>${resultLabel}</h2><p class="memorized-time">memorized in ${formatTime(ms)}</p></div></div><div class="result-actions"><button id="copy-result" class="secondary">Copy result</button><button id="share" class="primary">Share <svg class="share-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 10H5v11h14V10h-3M12 15V3m-4 4 4-4 4 4"/></svg></button></div><label class="checkbox-label share-link-option"><input id="include-link" type="checkbox" ${includeLink?'checked':''}> Include link</label><div class="section-divider"><span>BEST HANDS</span></div><div class="best-hands">${groups.slice(0,3).map((g,i)=>`<details ${i===0?'open':''}><summary><span>${badge(i+1)} ${labels[i]}</span><span>${g.pairs.length} ${g.pairs.length===1?'pair':'pairs'} <svg class="pairs-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span></summary><div class="pair-list">${g.pairs.map(pair=>`<div class="pair"><b>${pair.map(p=>String.fromCharCode(65+p)).join(' + ')}</b><span>${pair.map(p=>`<span class="${[1,2].includes(suit(deal.board[p]))?'red':''}">${cardText(deal.board[p])}</span>`).join(' ')}</span></div>`).join('')}</div></details>`).join('')}</div>${review}`;
}
function renderUnfinished() {$('unfinished').hidden=true;}
function reconcile(options={}) {
  if(!state) return;
  const before=`${state.phase}:${state.roundIndex}:${state.roundStartedAt}`;
  advance(state,Date.now(),{away:document.hidden||!playing||$('modal').open,...options});
  if(before!==`${state.phase}:${state.roundIndex}:${state.roundStartedAt}`) {save({changed:true});render();}
}
function switchDeal(number) {
  activeNumber=number; deal=generate(number); groups=handGroups(deal.board,deal.community); state=attemptFor(number);
  if(state) {advance(state,Date.now(),{restoring:true});state.hiddenSince=document.hidden?Date.now():null;}
  save();render();window.scrollTo({top:0,behavior:'instant'});
}
function refreshDaily({away=false}={}) {
  if(testMode||endlessMode) return false;
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
  if(syncProgress()) render();
  reconcile();
  if(['endless-entry','endless-config','endless-toolbar'].includes(button.id)) openEndless();
  if(button.id==='daily-entry') location.href='./';
  if(button.id==='endless-next'||button.id==='endless-skip') goEndless(endless.profile,endless.seed===MAX_SEED?1:endless.seed+1);
  if(button.id==='endless-replay') {save({remove:activeNumber});state=null;playing=false;lastPhase='';render();void enterGame();}
  if(button.id==='enter-game') {
    void enterGame();
  }
  if(button.id==='home') {playing=false;if(state)state.hiddenSince=Date.now();save();render();}
  if(button.id==='start' && !state) {state=newAttempt(activeNumber);attempts[activeNumber]=state;save({changed:true});render();}
  if(button.dataset.reviewRound!==undefined) {reviewRound=Number(button.dataset.reviewRound);render();return;}
  if(button.id==='ready'&&state?.phase==='memorize') {ready(state,Date.now());save({changed:true});render();}
  if(button.dataset.position!==undefined&&state?.phase==='select') {selectCard(state,Number(button.dataset.position));save({changed:true});render();}
  if(button.id==='submit' && state && submit(state,Date.now())) {save({changed:true});render();}
  if(button.dataset.resume) switchDeal(Number(button.dataset.resume));
  if(button.id==='help'||button.id==='puzzle-help') openHelp();
  if(button.id==='records'||button.id==='puzzle-records'||button.id==='view-records') openRecords();
  if(button.id==='close-modal') void closeModal();
  if(button.id==='share') void share(true);
  if(button.id==='copy-result') void share(false);
  if(button.id==='reset-test') {save({remove:activeNumber});state=null;playing=false;lastPhase='';$('modal').close();render();}
});
const handAnimations=new WeakMap();
document.addEventListener('click',event=>{
  const summary=event.target.closest('details > summary');
  if(!summary) return;
  event.preventDefault();
  const details=summary.parentElement;
  let list=details.querySelector(':scope > .disclosure-content');
  if(!list) {
    list=document.createElement('div');
    list.className='disclosure-content';
    while(summary.nextSibling) list.append(summary.nextSibling);
    details.append(list);
  }
  const previous=handAnimations.get(details);
  const expand=previous?!previous.expand:!details.open;
  const from=details.getBoundingClientRect().height;
  previous?.animation.cancel();
  handAnimations.delete(details);
  delete details.dataset.animating;
  delete details.dataset.closing;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) {details.open=expand;return;}
  details.open=true;
  const to=expand?details.getBoundingClientRect().height:summary.getBoundingClientRect().height+parseFloat(getComputedStyle(details).borderBottomWidth);
  details.dataset.animating='';
  if(!expand) details.dataset.closing='';
  const animation=details.animate([{height:`${from}px`},{height:`${to}px`}],{duration:200,easing:EASE_OUT_QUAD});
  const entry={animation,expand};
  handAnimations.set(details,entry);
  list.getAnimations().forEach(a=>a.cancel());
  list.animate(expand?[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}]:[{opacity:1},{opacity:0}],{duration:expand?200:120,easing:EASE_OUT_QUAD});
  animation.finished.then(()=>{
    if(handAnimations.get(details)!==entry) return;
    details.open=expand;
    delete details.dataset.animating;
    delete details.dataset.closing;
    handAnimations.delete(details);
  }).catch(()=>{});
});
const surfaceAnimations=new WeakMap();
function animateSurface(element,closing=false) {
  const current=closing?getComputedStyle(element):null;
  const from=closing?{opacity:current.opacity,transform:current.transform}:{opacity:0,transform:'translateY(12px)'};
  surfaceAnimations.get(element)?.cancel();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const animation=element.animate([from,closing?{opacity:0,transform:'translateY(8px)'}:{opacity:1,transform:'none'}],{
    duration:closing?120:200,easing:EASE_OUT_QUAD,fill:closing?'forwards':'none'
  });
  surfaceAnimations.set(element,animation);
  return animation;
}
let closingModal=false,modalOpener=null;
$('modal').addEventListener('close',()=>{
  if(modalOpener?.isConnected&&!modalOpener.closest('[hidden], [inert]')) modalOpener.focus({preventScroll:true});
});
async function closeModal() {
  const modal=$('modal');
  if(closingModal||!modal.open) return;
  closingModal=true;
  modal.dataset.closing='';
  const animation=animateSurface(modal,true);
  if(animation) await animation.finished.catch(()=>{});
  modal.close();
  animation?.cancel();
  delete modal.dataset.closing;
  closingModal=false;
}
$('modal').addEventListener('cancel',event=>{event.preventDefault();void closeModal();});
let backdropPointerDown=false;
function isBackdrop(event) {
  if(event.target!==$('modal')) return false;
  const rect=$('modal').getBoundingClientRect();
  return event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom;
}
$('modal').addEventListener('pointerdown',event=>{backdropPointerDown=isBackdrop(event);});
$('modal').addEventListener('click',event=>{
  if(backdropPointerDown&&isBackdrop(event)) void closeModal();
  backdropPointerDown=false;
});
function openModal(title,html,{fullScreen=false}={}) {
  modalOpener=document.activeElement;
  $('modal').setAttribute('aria-label',title);
  $('modal-title').textContent=title;
  $('modal-title').hidden=title==='Records';
  $('modal').classList.toggle('records-dialog',title==='Records');
  $('modal-body').innerHTML=html;
  $('modal').classList.toggle('help-dialog',fullScreen);
  $('modal').showModal();
  $('modal').scrollTop=0;
  animateSurface($('modal'));
}
function openHelp() {
  openModal("How to play",helpHTML()+(localDevelopment?`<details class="help-development"><summary>Development</summary><button id="reset-test" class="secondary">Reset this attempt</button><p><a href="${testMode?"./":"?test=16"}">${testMode?"Daily game":"Try 16 cards"}</a></p></details>`:""),{fullScreen:true});
}
function goEndless(profile,seed,answers=clearMode?'clear':'standard',settings=lab) {
  if(settings) profile=0;
  endlessNumber(profile,seed);
  const params=new URLSearchParams({mode:'endless',difficulty:String(profile),seed:String(seed),answers,play:'1'});
  if(settings) {params.set('cards',settings.count);params.set('pattern',settings.pattern);params.set('clarity',settings.clarity);}
  if(endlessMode&&((lab&&settings&&practiceKey(lab)===practiceKey(settings))||(!lab&&!settings&&answers===(clearMode?'clear':'standard')))) {save({remove:endlessNumber(profile,seed)});}
  location.href=`?${params}`;
}
function openEndless() {
  const current={...PRESETS[0],count:16};
  const options=(items,value)=>Object.entries(items).map(([key,label])=>`<option value="${key}" ${String(key)===String(value)?'selected':''}>${label}</option>`).join('');
  openModal('Endless',`<form id="endless-form" class="endless-form"><p>Mix memory load, suit patterns, and answer clarity. Daily records stay separate.</p><label for="practice-preset">Preset</label><select id="practice-preset" aria-describedby="preset-help"><option value="custom">Custom</option>${[0,1,2,3,6,4,5].map(i=>`<option value="${i}" ${i===0?'selected':''}>${PRESETS[i].name}</option>`).join('')}<option value="legacy">Original daily / early experiment</option></select><p id="preset-help" class="fine-print">Choose a difficulty, or Custom to set cards, arrangement, and answer clarity. Each game starts with a random deal.</p><div id="lab-fields" hidden><label for="practice-count">Cards</label><select id="practice-count">${options({16:'16 cards'},16)}</select><label for="practice-pattern">Arrangement</label><select id="practice-pattern">${options(PATTERNS,current.pattern)}</select><label for="practice-clarity">Answer clarity</label><select id="practice-clarity">${options(CLARITIES,current.clarity)}</select></div><div id="legacy-fields" hidden><label for="endless-difficulty">Difficulty</label><select id="endless-difficulty">${DIFFICULTIES.map((label,i)=>`<option value="${i}" ${i===endless.profile?'selected':''}>${label}</option>`).join('')}</select><label for="endless-answers">Answer style</label><select id="endless-answers"><option value="clear" ${clearMode?'selected':''}>Original obvious-answer experiment</option><option value="standard" ${!clearMode?'selected':''}>Original daily deals</option></select></div><button type="submit" class="primary">Start Timer</button></form>`);
  $('practice-preset').addEventListener('change',()=>{
    const value=$('practice-preset').value,legacy=value==='legacy';
    $('lab-fields').hidden=value!=='custom';$('legacy-fields').hidden=!legacy;
    if(PRESETS[value]) {const p=PRESETS[value];$('practice-count').value=16;$('practice-pattern').value=p.pattern;$('practice-clarity').value=p.clarity;}
  });
  for(const id of ['practice-count','practice-pattern','practice-clarity']) $(id).addEventListener('change',()=>{$('practice-preset').value='custom';});
  $('endless-form').addEventListener('submit',event=>{
    event.preventDefault();
    const settings=$('practice-preset').value==='legacy'?null:{count:Number($('practice-count').value),pattern:$('practice-pattern').value,clarity:$('practice-clarity').value};
    const profile=Number($('endless-difficulty').value),seed=1+Math.floor(Math.random()*MAX_SEED),answers=$('endless-answers').value;
    if(endlessMode&&profile===endless.profile&&seed===endless.seed&&((lab&&settings&&practiceKey(lab)===practiceKey(settings))||(!lab&&!settings&&answers===(clearMode?'clear':'standard')))) {
      save({remove:activeNumber});state=null;playing=false;lastPhase='';$('modal').close();render();void enterGame();
    } else goEndless(profile,seed,answers,settings);
  });
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
    const d=generate(s.number);
    for(const [i,answer] of s.answers.entries()) {
      if(answer.selected.length!==2) {medals[3]++;continue;}
      const gs=handGroups(d.board,d.communities[i]);
      const hand=evaluate([...d.communities[i],...answer.selected.map(p=>d.board[p])]);
      const place=gs.findIndex(group=>group.score===hand.score)+1;
      medals[Math.min(place-1,3)]++;
    }
  }
  return {completed:completed.length,current,best,medals,hasOvertime:completed.some(s=>s.overtime)};
}
function openRecords() {
  includeOvertime=!!(state?.phase==='complete'&&state.overtime);
  openModal('Records',''); renderRecords();
}
function renderRecords() {
  const r=recordSummary();
  $('modal-body').innerHTML=`<div class="record-grid"><div><strong>${r.completed}</strong><span>Played</span></div><div><strong>${r.current}</strong><span>Play streak</span></div><div><strong>${r.best}</strong><span>Best streak</span></div></div><div class="section-divider"><span>YOUR HANDS</span></div><div class="record-grid medals">${r.medals.map((n,i)=>`<div><span>${['🥇','🥈','🥉','🃏'][i]}</span><strong>${n}</strong></div>`).join('')}</div>${r.hasOvertime?`<label class="checkbox-label"><input id="include-overtime" type="checkbox" ${includeOvertime?'checked':''}> Include overtime</label>`:''}`;
  $('include-overtime')?.addEventListener('change',e=>{includeOvertime=e.target.checked;renderRecords();$('include-overtime').focus();});
}
const copyFeedback=new WeakMap();
async function share(useNative=true) {
  const button=$(useNative?'share':'copy-result');
  const shareURL=new URL('./',location.href);
  if(endlessMode) shareURL.search=new URLSearchParams({mode:'endless',difficulty:String(endless.profile),seed:String(endless.seed),answers:clearMode?'clear':'standard'}).toString();
  if(lab) {shareURL.searchParams.set('cards',lab.count);shareURL.searchParams.set('pattern',lab.pattern);shareURL.searchParams.set('clarity',lab.clarity);}
  const url=includeLink?shareURL.href:'';
  const {place,ms}=resultInfo();
  let text=shareText(activeNumber,place,ms,state.overtime,url);
  if(endlessMode) text=text.replace(`Memory Poker #${activeNumber}`,`Memory Poker · Endless · ${lab?`${lab.count} cards · ${PATTERNS[lab.pattern]} · ${CLARITIES[lab.clarity]}`:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][endless.profile]}`);
  const roundBadges=state.answers.map((a,i)=>{if(a.selected.length!==2)return '—';const gs=handGroups(deal.board,deal.communities[i]);const h=evaluate([...deal.communities[i],...a.selected.map(p=>deal.board[p])]);return badge(gs.findIndex(g=>g.score===h.score)+1);}).join('');
  text=`Memory Poker\n${roundBadges} · ${formatTime(ms)}${url?'\n'+url:''}`;
  if(testMode) text=text.replace(`Memory Poker #${activeNumber}`,'Memory Poker · Test');
  if(useNative) {
    if(!navigator.share) {
      resultFeedback(button,'Use Copy result','Native sharing is unavailable in this browser. Use Copy result instead.');
      return;
    }
    try {
      await navigator.share({text});
    } catch(error) {
      if(error.name!=='AbortError') resultFeedback(button,'Share failed','Sharing failed. Please try again or use Copy result.');
    }
    return;
  }
  let copied=false;
  try {
    await navigator.clipboard.writeText(text);
    copied=true;
  } catch {
    const focused=document.activeElement;
    const field=document.createElement('textarea');
    field.value=text;
    field.readOnly=true;
    field.setAttribute('aria-label','Copy result');
    Object.assign(field.style,{position:'fixed',top:'0',left:'-9999px',opacity:'0',fontSize:'16px'});
    document.body.append(field);
    field.select();
    try {copied=document.execCommand('copy');} catch {copied=false;}
    field.remove();
    focused?.focus({preventScroll:true});
  }
  resultFeedback(button,copied?'Copied!':'Copy failed',copied?'Result copied.':'Clipboard access failed. Please try again.');
}
function resultFeedback(button,label,announcement) {
  const previous=copyFeedback.get(button);
  clearTimeout(previous?.timer);
  const html=previous?.html ?? button.innerHTML;
  button.textContent=label;
  $('announcements').textContent=announcement;
  const timer=setTimeout(()=>{button.innerHTML=html;copyFeedback.delete(button);},label==='Copied!'?1000:2000);
  copyFeedback.set(button,{html,timer});
}
document.addEventListener('visibilitychange',()=>{
  if(syncProgress()) render();
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
    const hiddenSince=state?.hiddenSince??null;
    attempts=mergeProgress(attempts,updated);
    if(!updated[activeNumber]&&!(playing&&state&&!testMode&&!endlessMode&&activeNumber!==Math.max(1,challengeNumber()))) delete attempts[activeNumber];
    state=attemptFor(activeNumber);
    if(state) {state.hiddenSince=hiddenSince;advance(state,Date.now(),{away:document.hidden||!playing||$('modal').open,restoring:true});}
    render();
  } catch { /* Leave the current attempt intact if another tab writes invalid data. */ }
});
setInterval(()=>{
  if(refreshDaily({away:document.hidden})) return;
  reconcile();updateClock();
},100);
save();render();
void Promise.all([preloadMenu(),preloadCards([...deal.board,...deal.communities.flat()])]).then(([,cardsReady])=>{
  if(!cardsReady) throw new Error('Card assets unavailable');
  assetsReady=true;
  render();
  window.dispatchEvent(new Event('memory-poker:ready'));
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.animate([{opacity:0},{opacity:1}],{duration:200,easing:EASE_OUT_QUAD});
  }
  if(endlessMode&&new URLSearchParams(location.search).get('play')==='1') void enterGame();
  else animateSurface($('welcome'));
}).catch(()=>window.dispatchEvent(new Event('memory-poker:load-error')));
