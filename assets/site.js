/* LangSpan page controls. Visuals enhance readable, static HTML. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedStatic = new URLSearchParams(location.search).get('motion') === 'static';
  let savedPause = false;
  try { savedPause = sessionStorage.getItem('langspan-motion-paused') === 'true'; } catch (_) {}
  let paused = forcedStatic || reduced.matches || savedPause;
  const motionButton = document.querySelector('[data-motion-toggle]');
  const animations = new Set();
  function finishAnimations() {
    for (const item of animations) { try { item.controls.finish(); } catch (_) {} item.element.style.removeProperty('opacity'); item.element.style.removeProperty('transform'); }
    animations.clear();
  }
  function applyMotion() {
    root.dataset.motionPaused = String(paused);
    if (motionButton) {
      motionButton.hidden = false;
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.disabled = forcedStatic || reduced.matches;
      motionButton.setAttribute('aria-label', forcedStatic || reduced.matches ? 'Page motion reduced' : paused ? 'Resume page motion' : 'Pause page motion');
      motionButton.querySelector('[data-motion-label]').textContent = forcedStatic || reduced.matches ? 'Motion reduced' : paused ? 'Resume motion' : 'Pause motion';
      motionButton.querySelector('[data-motion-symbol]').textContent = '';
      motionButton.querySelector('[data-motion-symbol]').dataset.play = String(paused);
    }
    if (paused) finishAnimations();
    dispatchEvent(new CustomEvent('langspan:motion', { detail: { paused } }));
  }
  applyMotion();
  motionButton?.addEventListener('click', () => {
    paused = !paused;
    savedPause = paused;
    try { sessionStorage.setItem('langspan-motion-paused', String(paused)); } catch (_) {}
    applyMotion();
  });
  reduced.addEventListener('change', () => { paused = reduced.matches || forcedStatic || savedPause; applyMotion(); });
  function reveal(element, delay = 0) {
    if (paused || document.hidden || !window.Motion?.animate) return;
    let item;
    try {
      const controls = window.Motion.animate(element, { opacity: [.65, 1], transform: ['translateY(8px)', 'translateY(0)'] }, { duration: .3, delay, ease: [.2, 0, 0, 1] });
      item = { element, controls }; animations.add(item);
      Promise.resolve(controls).finally(() => { animations.delete(item); element.style.removeProperty('opacity'); element.style.removeProperty('transform'); });
    } catch (_) { element.style.removeProperty('opacity'); element.style.removeProperty('transform'); }
  }
  document.querySelectorAll('[data-intro]').forEach((element, index) => reveal(element, Math.min(index * .065, .3)));
  if ('IntersectionObserver' in window) {
    const reveals = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { reveal(entry.target); reveals.unobserve(entry.target); } }); }, { threshold: .14 });
    document.querySelectorAll('[data-reveal]').forEach(element => reveals.observe(element));
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAnimations(); });
  const explorer = document.querySelector('[data-capability-explorer]');
  const demo = explorer || document.getElementById('coordination-demo');
  let demoRequested = false;
  function loadDemo() {
    if (demoRequested || !demo) return;
    demoRequested = true;
    const script = document.createElement('script');
    script.src = 'assets/coordination-demo.js'; script.defer = true;
    script.onload = () => { demo.dataset.loadState = 'ready'; };
    script.onerror = () => { demo.dataset.loadState = 'fallback'; demoRequested = false; script.remove(); };
    document.body.appendChild(script);
  }

  if (explorer) {
    const capTabs = [...explorer.querySelectorAll('[data-cap-tab]')];
    const capPanels = [...explorer.querySelectorAll('[data-cap-panel]')];
    const list = explorer.querySelector('.cap-tabs');
    const choose = (id, focus = false, updateHash = false) => {
      if (!capTabs.some(t => t.dataset.capTab === id)) return;
      capTabs.forEach(t => {
        const active = t.dataset.capTab === id;
        t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1;
        if (active && focus) t.focus({preventScroll:true});
      });
      capPanels.forEach(p => {
        p.hidden = p.dataset.capPanel !== id;
        p.setAttribute('role','tabpanel');
        p.setAttribute('aria-labelledby','cap-tab-'+p.dataset.capPanel);
        p.removeAttribute('aria-label');
      });
      explorer.dataset.active = id;
      if (updateHash) { history.replaceState(history.state, '', '#'+id); loadDemo(); }
      dispatchEvent(new CustomEvent('langspan:capability', {detail:{id}}));
    };
    const fromHash = () => {
      const id = location.hash.slice(1);
      const target = id === 'coordination-demo' ? 'edit-coordination' : id;
      if (capTabs.some(t => t.dataset.capTab === target)) {
        choose(target); loadDemo();
        requestAnimationFrame(() => document.getElementById('demo')?.scrollIntoView({block:'start',behavior:paused?'instant':'smooth'}));
      }
    };
    list.hidden = false; choose('peer-briefings'); fromHash();
    capTabs.forEach((tab, i) => {
      tab.addEventListener('click', () => choose(tab.dataset.capTab, false, true));
      tab.addEventListener('keydown', e => {
        let next;
        if(e.key==='ArrowRight')next=(i+1)%capTabs.length;
        else if(e.key==='ArrowLeft')next=(i+capTabs.length-1)%capTabs.length;
        else if(e.key==='Home')next=0;
        else if(e.key==='End')next=capTabs.length-1;
        if(next!==undefined){e.preventDefault();choose(capTabs[next].dataset.capTab,true,true);}
      });
    });
    addEventListener('hashchange', fromHash);
  }
  if ('IntersectionObserver' in window) {
    const storyMotion = new IntersectionObserver(entries => {
      for(const entry of entries) if(entry.isIntersecting){
        if(!paused && !document.hidden) entry.target.dataset.rehearsed='true';
        storyMotion.unobserve(entry.target);
      }
    },{threshold:.25});
    document.querySelectorAll('[data-story-motion]').forEach(e=>storyMotion.observe(e));
  }
  if (demo && 'IntersectionObserver' in window) {
    const preload = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { loadDemo(); preload.disconnect(); } }, { rootMargin: '650px 0px' });
    preload.observe(demo);
  } else loadDemo();
  const tabs = [...document.querySelectorAll('[data-setup-tab]')];
  const panels = [...document.querySelectorAll('[data-setup-panel]')];
  const tabList = document.querySelector('.setup-tabs');
  function selectTab(name, focus = false) {
    tabs.forEach(tab => { const active = tab.dataset.setupTab === name; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; if (active && focus) tab.focus(); });
    panels.forEach(panel => { panel.hidden = panel.dataset.setupPanel !== name; panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', 'tab-' + panel.dataset.setupPanel); });
  }
  if (tabList) { tabList.hidden = false; selectTab('claude'); }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab.dataset.setupTab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectTab(tabs[next].dataset.setupTab, true); }
    });
  });
  const copyStatus = document.querySelector('[data-copy-status]');
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const code = document.getElementById(button.dataset.copy);
      if (!code) return;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(code.textContent.trim());
        button.textContent = 'Copied';
        if (copyStatus) copyStatus.textContent = 'Command copied.';
        setTimeout(() => { button.textContent = 'Copy'; }, 1800);
      } catch (_) {
        const selection = getSelection(); const range = document.createRange();
        range.selectNodeContents(code); selection?.removeAllRanges(); selection?.addRange(range);
        if (copyStatus) copyStatus.textContent = 'Command selected. Use your keyboard to copy it.';
        button.textContent = 'Selected'; setTimeout(() => { button.textContent = 'Copy'; }, 2200);
      }
    });
  });
})();
