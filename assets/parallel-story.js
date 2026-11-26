/* LangSpan parallel-work story. Original, deterministic, locally rendered.
 * Inspired by the existing Living Canvas approach: concrete transformation,
 * fixed still frame, meaningful paths. No network access or agent execution.
 */
(() => {
  'use strict';
  const scale=document.querySelector('[data-parallel-scale]'),sem=document.querySelector('[data-semantic-story]');
  if(!scale||!sem)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const forced=new URLSearchParams(location.search).get('motion')==='static';
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const durations=[0,4000,8000,12000];
  const phases=[{"label":"Record","title":"Local work is recorded.","body":"L1 reports activity in billing.mjs. Local sessions keep their own host permissions."},{"label":"Publish","title":"Share metadata through Git.","body":"With remote sharing enabled, LangSpan publishes branch and file activity, not source contents."},{"label":"Brief","title":"Related work reaches the next prompt.","body":"C1 can receive relevant peer context. Its own coordinator handles local work; remote awareness does not lock its files."}];
  const visible=(el)=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;};
  const state={scale:{el:scale,time:0,phase:-1,started:false,paused:false,finished:false,visible:false},semantic:{el:sem,time:0,phase:-1,started:false,paused:false,finished:false,visible:false}};
  let count=10,globalPaused=document.documentElement.dataset.motionPaused==='true',raf=0,last=null;
  const staticMode=()=>forced||reduced.matches;
  const setPressed=(els,index,key)=>els.forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset[key])===index)));
  function paths(n){
    const xs=Array.from({length:n},(_,i)=>(i+.5)*500/n);
    const a=xs[0],z=xs[n-1];
    const baseUp='M'+a+' 13H'+z+xs.map(x=>'M'+x+' 0V13').join('')+'M250 13V26';
    const baseDown='M250 0V13M'+a+' 13H'+z+xs.map(x=>'M'+x+' 13V26').join('');
    scale.querySelector('[data-wire-base=up]').setAttribute('d',baseUp);
    scale.querySelector('[data-wire-base=down]').setAttribute('d',baseDown);
    scale.querySelector('[data-wire-active=up]').setAttribute('d','M'+a+' 0V13H250V26');
    scale.querySelector('[data-wire-active=down]').setAttribute('d','M250 0V13H'+a+'V26');
  }
  function setCount(value){
    if(![2,6,10].includes(value))return;
    count=value;scale.dataset.count=String(count);
    const n=count/2;
    scale.style.setProperty('--scale-cols',n);
    scale.querySelectorAll('[data-scale-slot]').forEach(el=>el.hidden=Number(el.dataset.scaleSlot)>n);
    scale.querySelector('[data-scale-total]').textContent=count;
    scale.querySelector('[data-local-total]').textContent=n;
    scale.querySelector('[data-cloud-total]').textContent=n;
    setPressed(scale.querySelectorAll('[data-scale-count]'),count,'scaleCount');
    paths(n);
  }
  function buttonState(s,button){
    if(staticMode()){button.hidden=true;return}
    button.hidden=false;button.disabled=globalPaused;
    const running=s.started&&!s.paused&&!s.finished&&!globalPaused;
    button.textContent=s.finished?'Replay':running?'Pause':'Play';
    button.setAttribute('aria-label',(s.finished?'Replay':running?'Pause':'Play')+' '+(s===state.scale?'parallel-work illustration':'semantic conflict illustration'));
  }
  function renderScale(ms,announce=false){
    const s=state.scale;const t=clamp(ms,0,12000);
    const phase=Math.min(2,Math.floor(t/4000));
    if(s.phase!==phase){
      s.phase=phase;scale.dataset.phase=String(phase);
      scale.querySelector('[data-scale-title]').textContent=phases[phase].title;
      scale.querySelector('[data-scale-description]').textContent=phases[phase].body;
      setPressed(scale.querySelectorAll('[data-scale-step]'),phase,'scaleStep');
    }
    const up=staticMode()||t>=4000?1:clamp(t/1300,0,1);
    const down=staticMode()?1:clamp((t-4000)/1800,0,1);
    scale.querySelector('[data-wire-active=up]').style.strokeDashoffset=String(1-up);
    scale.querySelector('[data-wire-active=down]').style.strokeDashoffset=String(1-down);
    if(announce)scale.querySelector('[data-scale-announcement]').textContent=phases[phase].title+' '+phases[phase].body;
    buttonState(s,scale.querySelector('[data-scale-play]'));
  }
  function renderSem(ms,announce=false,animate=false){
    const s=state.semantic,t=clamp(ms,0,12000),phase=Math.min(2,Math.floor(t/4000));
    if(s.phase!==phase){
      s.phase=phase;sem.dataset.phase=String(phase);
      sem.querySelectorAll('[data-semantic-beat]').forEach(el=>{
        const current=Number(el.dataset.semanticBeat)===phase;
        el.hidden=!current;
        el.dataset.enter=String(current&&animate&&!globalPaused&&!staticMode());
      });
      setPressed(sem.querySelectorAll('[data-sem-step]'),phase,'semStep');
    }
    if(announce){
      const el=sem.querySelector('[data-semantic-beat="'+phase+'"]');
      sem.querySelector('[data-sem-announcement]').textContent=el.querySelector('h3').textContent+' '+el.querySelector('.sem-result strong').textContent;
    }
    buttonState(s,sem.querySelector('[data-sem-play]'));
  }
  function paint(s,announce=false,animate=false){if(s===state.scale)renderScale(s.time,announce);else renderSem(s.time,announce,animate);}
  function running(s){return !staticMode()&&!globalPaused&&!document.hidden&&s.visible&&s.started&&!s.paused&&!s.finished;}
  function reconcile(){
    const any=Object.values(state).some(running);
    if(any&&!raf){last=null;raf=requestAnimationFrame(tick);}
    else if(!any&&raf){cancelAnimationFrame(raf);raf=0;last=null;}
  }
  function tick(now){
    raf=0;const delta=last===null?0:clamp(now-last,0,100);last=now;
    for(const s of Object.values(state)){
      if(!running(s))continue;
      s.time=clamp(s.time+delta,0,12000);
      if(s.time>=12000)s.finished=true;
      paint(s,false,true);
    }
    // Continue the same clock across frames. Only an external start/resume
    // resets last; resetting it here would leave every delta at zero.
    if(Object.values(state).some(running))raf=requestAnimationFrame(tick);
    else last=null;
  }
  function seek(s,step){s.time=durations[step];s.started=true;s.paused=true;s.finished=false;paint(s,true,false);reconcile();}
  function play(s){if(staticMode()||globalPaused)return;if(s.finished){s.time=0;s.finished=false;s.phase=-1;s.paused=false;s.started=true;}else if(s.started&&!s.paused){s.paused=true;}else{s.started=true;s.paused=false;}paint(s,true,false);reconcile();}
  function poster(s){s.started=true;s.paused=true;s.finished=true;s.time=s===state.scale?12000:4000;s.phase=-1;paint(s,false,false);}
  setCount(count);
  scale.querySelectorAll('[data-scale-controls]').forEach(el=>el.hidden=false);
  sem.querySelectorAll('[data-semantic-controls]').forEach(el=>el.hidden=false);
  scale.querySelectorAll('[data-scale-count]').forEach(el=>el.addEventListener('click',()=>{setCount(Number(el.dataset.scaleCount));state.scale.time=12000;state.scale.finished=true;state.scale.paused=true;paint(state.scale,true,false);reconcile();}));
  scale.querySelectorAll('[data-scale-step]').forEach(el=>el.addEventListener('click',()=>seek(state.scale,Number(el.dataset.scaleStep))));
  sem.querySelectorAll('[data-sem-step]').forEach(el=>el.addEventListener('click',()=>seek(state.semantic,Number(el.dataset.semStep))));
  scale.querySelector('[data-scale-play]').addEventListener('click',()=>play(state.scale));
  sem.querySelector('[data-sem-play]').addEventListener('click',()=>play(state.semantic));
  for(const s of Object.values(state)){
    s.visible=visible(s.el);
    if(staticMode())poster(s);else{if(s.visible)s.started=true;paint(s);}
  }
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{for(const e of entries){const s=e.target===scale?state.scale:state.semantic;s.visible=e.isIntersecting;if(e.isIntersecting&&!s.started){s.started=true;paint(s);} }reconcile();},{threshold:0});
    observer.observe(scale);observer.observe(sem);
  }else window.addEventListener('scroll',()=>{for(const s of Object.values(state)){s.visible=visible(s.el);if(s.visible&&!s.started){s.started=true;paint(s);}}reconcile();},{passive:true});
  window.addEventListener('langspan:motion',e=>{globalPaused=Boolean(e.detail?.paused);for(const s of Object.values(state))paint(s);reconcile();});
  document.addEventListener('visibilitychange',reconcile);
  reduced.addEventListener('change',()=>{if(staticMode())for(const s of Object.values(state))poster(s);else for(const s of Object.values(state))paint(s);reconcile();});
  // A deterministic render contract for capture; manual seeking stops playback.
  window.LangSpanParallel=Object.freeze({
    duration:12,
    snapshot(){return Object.fromEntries(Object.entries(state).map(([name,s])=>[name,{elapsedMs:s.time,phase:s.phase,running:running(s),count:name==='scale'?count:undefined}]))},
    seek(seconds,n=10){setCount(n);state.scale.paused=true;state.scale.started=true;state.scale.finished=seconds>=12;state.scale.time=clamp(seconds*1000,0,12000);paint(state.scale);reconcile();},
    semantic(seconds){state.semantic.paused=true;state.semantic.started=true;state.semantic.finished=seconds>=12;state.semantic.time=clamp(seconds*1000,0,12000);paint(state.semantic);reconcile();}
  });
  reconcile();
})();