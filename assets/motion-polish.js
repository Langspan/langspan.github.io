/* Connect SVG routes to the measured cards, never to guessed coordinates. */
(() => {
  'use strict';
  const $=(s,el=document)=>el.querySelector(s), $$=(s,el=document)=>[...el.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const staticMode=()=>reduced.matches||new URLSearchParams(location.search).get('motion')==='static';
  const center=(el,svg,w)=>{const r=el.getBoundingClientRect(),b=svg.getBoundingClientRect();return b.width?Math.round((r.left+r.width/2-b.left)/b.width*w*100)/100:w/2;};
  const assign=(svg,d)=>$$('path',svg).forEach(path=>path.setAttribute('d',d));
  function forkIn(svg,cards,target,w,h){
    if(!svg||!svg.getBoundingClientRect().width||!cards.length||!target)return;
    const xs=cards.map(x=>center(x,svg,w)),to=center(target,svg,w),mid=h/2;
    assign(svg,xs.map(x=>'M'+x+' 0V'+mid+'H'+to).join('')+'M'+to+' '+mid+'V'+h);
  }
  function forkOut(svg,source,cards,w,h){
    if(!svg||!svg.getBoundingClientRect().width||!source||!cards.length)return;
    const from=center(source,svg,w),xs=cards.map(x=>center(x,svg,w)),mid=h/2;
    assign(svg,'M'+from+' 0V'+mid+xs.map(x=>'M'+from+' '+mid+'H'+x+'V'+h).join(''));
  }
  function layout(){
    $$('.sem-beat:not([hidden])').forEach(beat=>forkIn($('.sem-join',beat),$$('.sem-code',beat),$('.sem-result',beat),600,50));
    $$('.source-map').forEach(map=>{const svg=$('.source-join',map),cards=$$('.source-file',map),target=$('.source-index-node',map);if(!svg||cards.length!==2||!svg.getBoundingClientRect().width||!target)return;
      const x1=center(cards[0],svg,600),x2=center(cards[1],svg,600),to=center(target,svg,600);
      const a='M'+x1+' 0V23H'+to+'V46',b='M'+x2+' 0V23H'+to;
      $('.source-path-base',svg).setAttribute('d',a+b);$('.source-path-active:not(.source-path-peer)',svg).setAttribute('d',a);$('.source-path-peer',svg).setAttribute('d',b);
    });
    $$('.mp-topology:not([hidden])').forEach(top=>{const cards=$$('.arch-machine',top);forkIn($('.arch-lines',top),cards.length?cards:$$('.arch-agents code',top),$('.arch-git',top)||$('.arch-core',top),400,60)});
    const scope=$('.lx-code-scene');if(scope)forkIn($('.lx-connector svg',scope),$$('.lx-code-pair>div',scope),$('.lx-notice',scope),300,32);
    const exp=$('[data-lx-experiment]');if(exp)forkOut($('.lx-distribute',exp),$('.lx-seed',exp),$$('.lx-lane',exp),600,34);
  }
  let frame=0;
  function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;layout()})}
  if('ResizeObserver'in window){const ro=new ResizeObserver(schedule);$$('.sem-pair,.sem-result,.source-map,.lx-code-scene,.arch-diagram,.lx-experiment,.lx-lanes').forEach(el=>ro.observe(el))}
  const arch=$('[data-lx-architecture]');if(arch)new MutationObserver(schedule).observe(arch,{attributes:true,subtree:true,attributeFilter:['hidden','data-scope']});
  const sem=$('[data-semantic-story]');if(sem)new MutationObserver(schedule).observe(sem,{attributes:true,attributeFilter:['data-phase']});
  addEventListener('resize',schedule);schedule();
  const source=$('[data-source-awareness]');
  if(source){
    let visible=false;
    function sync(){source.dataset.mpRunning=String(visible&&!document.hidden&&!staticMode()&&document.documentElement.dataset.motionPaused!=='true')}
    if('IntersectionObserver'in window)new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()}).observe(source);else{visible=true;sync()}
    addEventListener('langspan:motion',sync);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  }
})();
