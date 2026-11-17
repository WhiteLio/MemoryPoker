// Loaded only by the separate loopback QA server; never by the game entry point.
(()=>{
  const params=new URLSearchParams(location.search),ns=params.get('qa')||'audit';
  const RealDate=Date, nativeStorage=window.localStorage,prefix=`qa:${ns}:`;
  const clockKey=`${prefix}clock`,baseKey=`${prefix}clock-base`;
  if(!nativeStorage.getItem(baseKey)) nativeStorage.setItem(baseKey,String(RealDate.now()));
  const clockBase=Number(nativeStorage.getItem(baseKey));
  let hidden=false,suspended=false;
  class TestDate extends RealDate {
    constructor(...args) {super(...(args.length?args:[TestDate.now()]));}
    static now() {return clockBase+Number(nativeStorage.getItem(clockKey)||0);}
  }
  window.Date=TestDate;
  const blocked=params.get('storage')==='blocked';
  if(params.get('storage')==='corrupt'&&!nativeStorage.getItem(prefix+'corrupted')) {
    nativeStorage.setItem(prefix+'memory-poker:test-attempts:v1','{');nativeStorage.setItem(prefix+'corrupted','1');
  }
  Object.defineProperty(window,'localStorage',{value:{
    getItem:key=>{if(blocked) throw new Error('QA storage disabled');return nativeStorage.getItem(prefix+key);},
    setItem:(key,value)=>{if(blocked) throw new Error('QA storage disabled');nativeStorage.setItem(prefix+key,value);},
    removeItem:key=>nativeStorage.removeItem(prefix+key)
  }});
  addEventListener('storage',event=>{
    if(!event.isTrusted) return;
    event.stopImmediatePropagation();
    if(suspended) return;
    if(event.key?.startsWith(prefix)&&event.key.slice(prefix.length).startsWith('memory-poker:')) dispatchEvent(new StorageEvent('storage',{key:event.key.slice(prefix.length),oldValue:event.oldValue,newValue:event.newValue}));
  },true);
  Object.defineProperty(document,'hidden',{get:()=>hidden});
  Object.defineProperty(document,'visibilityState',{get:()=>hidden?'hidden':'visible'});
  if(params.get('motion')==='reduce') {
    const media=matchMedia.bind(window);
    window.matchMedia=query=>query==='(prefers-reduced-motion: reduce)'?{matches:true,media:query,addEventListener(){},removeEventListener(){}}:media(query);
  }
  const durations=[];
  const originalAnimate=Element.prototype.animate;
  Element.prototype.animate=function(frames,options) {durations.push(typeof options==='number'?options:options?.duration||0);return originalAnimate.call(this,frames,options);};
  addEventListener('DOMContentLoaded',()=>{
    const panel=document.createElement('aside');panel.id='qa-controls';panel.setAttribute('aria-label','QA controls');
    panel.style.cssText='position:relative;z-index:99999;background:#fff;color:#111;padding:4px;max-width:100%;font:12px Arial';
    panel.innerHTML='<strong>Isolated QA</strong> <button data-ms="1000">+1 second</button> <button data-ms="19000">+19 seconds</button> <button data-ms="86400000">+1 day</button> <button id="qa-background">Background</button> <button id="qa-foreground">Foreground</button> <button id="qa-sync">Suspend sync</button> <button id="qa-large">Large text</button> <output></output>';
    const report=()=>panel.querySelector('output').textContent=`${new Date().toISOString()} · ${hidden?'hidden':'visible'} · ${ns}`;
    panel.addEventListener('click',event=>{
      event.stopPropagation();
      if(event.target.dataset.ms) nativeStorage.setItem(clockKey,Number(nativeStorage.getItem(clockKey)||0)+Number(event.target.dataset.ms));
      if(event.target.id==='qa-background') {hidden=true;document.dispatchEvent(new Event('visibilitychange'));}
      if(event.target.id==='qa-foreground') {hidden=false;document.dispatchEvent(new Event('visibilitychange'));}
      if(event.target.id==='qa-sync') {suspended=!suspended;event.target.textContent=suspended?'Resume sync':'Suspend sync';}
      if(event.target.id==='qa-large') {
        const selectors='body,.stage-heading h2,.clock strong,.eyebrow,.primary,.secondary,.secondary span,.text-button,.plaque,.plaque [lang=ko],.plaque-translation,.selection-summary,.selection-summary span,.status,.result-card h2,.result-card .eyebrow,.result-card .memorized-time,.result-medal,.best-hands summary,.best-hands summary>span+span,.pair,.checkbox-label,.masthead h1,.welcome-description,.welcome footer,.modal-top h2,#modal-body,.help-dialog h3,.help-dialog h4,.help-dialog summary,.help-dialog .help-caption,.help-dialog .hand-description,.help-dialog .help-note,.endless-form,.endless-form input,.endless-form select,.record-grid strong,.record-grid span,.medals span,.section-divider';
        const apply=()=>{
          const targets=[...document.querySelectorAll(selectors)].filter(el=>!panel.contains(el)&&!el.dataset.qaEnlarged);
          const sizes=targets.map(el=>{const css=getComputedStyle(el);return [el,parseFloat(css.fontSize)*2,parseFloat(css.lineHeight)*2];});
          sizes.forEach(([el,size,line])=>{el.dataset.qaEnlarged='true';el.style.fontSize=`${size}px`;if(Number.isFinite(line)) el.style.lineHeight=`${line}px`;});
          if(sizes.length) dispatchEvent(new Event('resize'));
        };
        apply();new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
        dispatchEvent(new Event('resize'));event.target.disabled=true;
      }
      report();
    });
    document.body.append(panel);report();
    setInterval(()=>{panel.dataset.motion=String(matchMedia('(prefers-reduced-motion: reduce)').matches);panel.dataset.movingAnimations=String(durations.filter(n=>n>0).length);},100);
  });
})();
