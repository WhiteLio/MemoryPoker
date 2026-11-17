import {seededRandom,hasEasyPattern} from './generator.js';
import {handGroups,rank,suit} from './poker.js';
export const PATTERNS={columns:'Columns',rows:'Rows',diagonals:'Diagonals',blocks:'Blocks',mirror:'Mirrored pairs',rings:'Rings',spiral:'Spiral',shuffled:'Shuffled'};
export const CLARITIES={obvious:'Very clear · gap 2+',clear:'Clear · gap 1+',competing:'Competing · same category',open:'Unrestricted'};
export const PRESETS=[
  {name:'Monday',count:8,pattern:'columns',clarity:'obvious'},
  {name:'Tuesday',count:8,pattern:'mirror',clarity:'clear'},
  {name:'Wednesday',count:12,pattern:'diagonals',clarity:'obvious'},
  {name:'Thursday',count:12,pattern:'blocks',clarity:'clear'},
  {name:'Friday',count:12,pattern:'shuffled',clarity:'clear'},
  {name:'Saturday',count:16,pattern:'shuffled',clarity:'clear'},
  {name:'Sunday',count:16,pattern:'spiral',clarity:'obvious'}
];
export function practiceSettings(search) {
  const p=new URLSearchParams(search),count=Number(p.get('cards')),pattern=p.get('pattern'),clarity=p.get('clarity');
  return [8,12,16].includes(count)&&Object.hasOwn(PATTERNS,pattern)&&Object.hasOwn(CLARITIES,clarity)?{count,pattern,clarity}:null;
}
export function practiceKey(settings) {return `${settings.count}:${settings.pattern}:${settings.clarity}`;}
export function patternSlots(count,pattern) {
  const rows=count/4;
  if(pattern==='shuffled') return null;
  const spiral=[];
  let top=0,bottom=rows-1,left=0,right=3;
  while(top<=bottom&&left<=right) {
    for(let c=left;c<=right;c++) spiral.push(top*4+c);top++;
    for(let r=top;r<=bottom;r++) spiral.push(r*4+right);right--;
    if(top<=bottom) {for(let c=right;c>=left;c--) spiral.push(bottom*4+c);bottom--;}
    if(left<=right) {for(let r=bottom;r>=top;r--) spiral.push(r*4+left);left++;}
  }
  return Array.from({length:count},(_,i)=>{
    const r=Math.floor(i/4),c=i%4;
    return pattern==='columns'?c:pattern==='rows'?r%4:pattern==='diagonals'?(r+c)%4:
      pattern==='blocks'?(Math.floor(r/2)*2+Math.floor(c/2))%4:
      pattern==='mirror'?(r*2+Math.min(c,3-c))%4:
      pattern==='spiral'?Math.floor(spiral.indexOf(i)/(count/4)):
      (Math.min(r,rows-1-r,c,3-c)*2+(r+c)%2)%4;
  });
}
export function generatePractice(number,settings) {
  const {count,pattern,clarity}=settings;
  if(![8,12,16].includes(count)||!Object.hasOwn(PATTERNS,pattern)||!Object.hasOwn(CLARITIES,clarity)) throw new Error('Invalid practice settings');
  const random=seededRandom(`memory-poker:lab:v1:${number}:${practiceKey(settings)}`);
  const shuffle=items=>{
    const out=[...items];for(let i=out.length-1;i>0;i--) {const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;
  };
  const suits=shuffle([0,1,2,3]),slots=patternSlots(count,pattern)?.map(s=>suits[s]);
  const card=(r,s)=>s*13+r-2;
  const deck=Array.from({length:52},(_,i)=>i);
  for(let attempt=0;attempt<4000;attempt++) {
    const rs=shuffle(Array.from({length:13},(_,i)=>i+2)),ss=shuffle([0,1,2,3]);
    const kind=Math.floor(random()*7),hi=6+Math.floor(random()*9);
    const target=kind===0?[10,11,12,13,14].map(r=>card(r,ss[0])):
      kind===1?[...ss.map(s=>card(rs[0],s)),card(rs[1],ss[0])]:
      kind===2?[card(rs[0],ss[0]),card(rs[0],ss[1]),card(rs[0],ss[2]),card(rs[1],ss[0]),card(rs[1],ss[1])]:
      kind===3?rs.slice(0,5).map(r=>card(r,ss[0])):
      kind===4?Array.from({length:5},(_,i)=>card(hi-i,Math.floor(random()*4))):
      kind===5?[card(rs[0],ss[0]),card(rs[0],ss[1]),card(rs[0],ss[2]),card(rs[1],ss[0]),card(rs[2],ss[1])]:shuffle(deck).slice(0,5);
    const split=shuffle(target),community=split.slice(0,3),required=split.slice(3);
    const rest=shuffle(deck.filter(c=>!target.includes(c)));
    let board;
    if(slots) {
      const pools=[0,1,2,3].map(s=>[...required.filter(c=>suit(c)===s),...rest.filter(c=>suit(c)===s)]);
      board=slots.map(s=>pools[s].shift());
      if(board.some(c=>c===undefined)||!required.every(c=>board.includes(c))) continue;
      const pools2=[0,1,2,3].map(s=>shuffle(board.filter(c=>suit(c)===s)));
      board=slots.map(s=>pools2[s].pop());
    } else {
      board=shuffle([...required,...rest.slice(0,count-2)]);
      if(hasEasyPattern(board,true)) continue;
    }
    const groups=handGroups(board,community),best=groups[0],gap=best.category-groups[1].category;
    if(clarity==='obvious'&&(gap<2||best.category<3||best.pairs.length!==1)) continue;
    if(clarity==='clear'&&(gap<1||best.category<3)) continue;
    if(clarity==='competing'&&(gap!==0||best.category<1)) continue;
    return {number,version:1,date:'2026-11-16',profile:'Practice lab',modifier:pattern,board,community,variant:'lab-v1'};
  }
  throw new Error('No practice deal found for these settings');
}
