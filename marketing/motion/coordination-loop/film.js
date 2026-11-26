/* One clock. Render the existing product panel, not another replica of it. */
(() => {
  const spec = window.FILM_SPEC;
  const panel = document.querySelector('[data-coordination-event]');
  if (!panel || !window.LangSpanProduct) throw Error('Homepage coordination component unavailable');
  const logo = document.querySelector('.top-header .brand img').cloneNode(true);
  const film = document.createElement('main');
  film.id = 'film';
  film.innerHTML = '<header class="film-header"><div data-film-logo></div><span class="film-context">Open-source coordination for coding agents</span></header><div class="film-stage"><div class="film-copy"><div class="film-kicker" data-film-label>Briefing</div><h1 class="film-title" data-film-title></h1><p class="film-caption" data-film-body></p><span class="film-cta">langspan.dev</span></div><div data-film-panel></div></div><footer class="film-footer"><strong>Run agents in parallel. Build as a team.</strong><span>Illustrated workflow · recorded refusal excerpt</span></footer>';
  film.querySelector('[data-film-logo]').append(logo);
  film.querySelector('[data-film-panel]').append(panel);
  document.body.append(film);document.body.classList.add('film-mode');
  const nodes = {label:film.querySelector('[data-film-label]'),title:film.querySelector('[data-film-title]'),body:film.querySelector('[data-film-body]')};
  const dynamic = [nodes.label,nodes.title,nodes.body,...panel.querySelectorAll('.inspector > *')];
  const inspector=panel.querySelector('.inspector');
  const ease=x=>1-Math.pow(1-Math.max(0,Math.min(1,x)),3);
  let lastStep = -1;
  window.renderAt = seconds => {
    const t=((seconds % spec.duration_s)+spec.duration_s)%spec.duration_s;
    let i=spec.beats.length-1;while(i>0&&spec.beats[i].at>t)i--;
    const beat=spec.beats[i];
    // A real button action exercises the same state path as the public UI.
    // The state has no dependence on intervening frames or wall-clock time.
    if(lastStep!==beat.step||window.LangSpanProduct.snapshot().step!==beat.step||window.LangSpanProduct.snapshot().selected!=='b'){
      panel.querySelector('[data-step="'+beat.step+'"]').click();lastStep=beat.step;
    }
    for(const key of ['label','title','body'])nodes[key].textContent=beat[key];
    let entrance=1;
    if(i>0)entrance=ease((t-beat.at)/spec.transition_s);
    const next=spec.beats[i+1]?.at;
    const exit=next===undefined?1:Math.max(0,Math.min(1,(next-t)/.15));
    // Leave text fully in frame and readable throughout. The emphasis follows
    // the event; there are no decorative background animations or camera zooms.
    for(const n of dynamic){n.style.opacity=String(.74+.26*Math.min(entrance,exit));n.style.transform='translateY('+((1-entrance)*3).toFixed(3)+'px)';}
    const pulse=i>0?1-entrance:0;
    inspector.style.boxShadow='inset 0 0 0 '+(pulse*1.5).toFixed(3)+'px rgba(216,120,89,'+(pulse*.7).toFixed(3)+')';
    return {t,step:beat.step,label:beat.label};
  };
  window.measureFilm = () => {
    const box=film.getBoundingClientRect(), errors=[];
    const important=[...film.querySelectorAll('.film-header,.film-copy,.film-title,.film-caption,.film-footer,.demo,.demo-head,.timeline,.session,.inspector,.inspector > *,.session code,.session .status')];
    for(const n of important){const r=n.getBoundingClientRect();if(r.width<=0||r.height<=0||r.left<box.left-.5||r.top<box.top-.5||r.right>box.right+.5||r.bottom>box.bottom+.5)errors.push('bounds: '+n.className+' '+n.textContent.slice(0,24));if(n.scrollWidth>n.clientWidth+1||n.scrollHeight>n.clientHeight+1)errors.push('overflow: '+n.className+' '+n.textContent.slice(0,24));}
    const a=film.querySelector('.film-copy').getBoundingClientRect(),b=panel.getBoundingClientRect(),head=film.querySelector('.film-header').getBoundingClientRect(),foot=film.querySelector('.film-footer').getBoundingClientRect();
    if(a.right>b.left||b.top<head.bottom||b.bottom>foot.top)errors.push('composition overlaps');
    return {errors,panel_width:b.width,panel_height:b.height};
  };
  window.renderAt(0);
})();
