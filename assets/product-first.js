/* Home page interactions. No agent or daemon runs in the browser. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const all = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.remove('no-js');

  // Old home-page anchors whose sections now live on the technical guide.
  const legacy = new Set(['scale','why','research','workflow','capabilities','evidence','benchmark','film','team-story','peer-briefings','source-awareness','commit-ownership','team-awareness','integration-checks','coordination-demo','planned-setup','manual-setup','mission','hosts']);
  function followLegacy() { if (legacy.has(location.hash.slice(1))) { location.replace('technical.html' + location.search + location.hash); return true; } return false; }
  if (followLegacy()) return;
  addEventListener('hashchange', followLegacy);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedStatic = new URLSearchParams(location.search).get('motion') === 'static';
  const isStatic = () => reduce.matches || forcedStatic;

  /* ---------- Hero loop ----------
     One clock. TIMING is an equal copy of marketing/motion/hero-loop/timing.json
     (the site publishes only assets/, so the page cannot read that file).
     renderAt(t) draws a frame from t alone; nothing carries over between frames. */
  const TIMING = {
    name: 'hero-loop', fps: 30, duration_s: 10, frames: 300, loops_before_stop: 3,
    stop_state: 'refusal', reduced_motion_state: 'refusal',
    easing: {
      entrance: { curve: [0.16, 1, 0.3, 1], ms: 280 },
      exit: { curve: [0.7, 0, 0.84, 0], ms: 160 },
      feedback: { curve: [0.16, 1, 0.3, 1], ms: 150 },
      state: { curve: [0.16, 1, 0.3, 1], ms: 280 }
    },
    events: [
      { at: 0, step: 0, target: 'scene', motion: 'none', text: 'Agent A holds src/gate.rs · name(). Agent B has a new prompt.' },
      { at: 1, target: 'card', motion: 'entrance', travel_px: 8, text: 'editing now: "src/gate.rs"', provenance: 'recorded' },
      { at: 3.6, target: 'row-b', motion: 'feedback', text: 'edits src/gate.rs · name()' },
      { at: 4, target: 'card', motion: 'exit' },
      { at: 4.08, step: 1, target: 'card', motion: 'entrance', travel_px: 8, text: 'Command blocked by PreToolUse hook: LangSpan coordination conflict.', provenance: 'recorded' },
      { at: 4.08, target: 'refusal-rule', motion: 'state', text: 'Coral left rule grows from 0 to 100% height.' },
      { at: 7, step: 2, target: 'card', motion: 'entrance', travel_px: 8, text: 'Codex picks a different file.', provenance: 'illustration' },
      { at: 9.2, target: 'row-a', motion: 'feedback', text: 'Hold released' },
      { at: 9.4, target: 'card', motion: 'exit' },
      { at: 9.4, step: 0, target: 'rows', motion: 'state', text: 'Rows return to the frame 0 state.' }
    ],
    holds_s: [[0, 1], [1.28, 3.6], [4.36, 7], [7.28, 9.2], [9.68, 10]]
  };
  const LOOP = TIMING.duration_s;
  const bezier = ([x1, y1, x2, y2]) => p => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let lo = 0, hi = 1, u = p;
    for (let i = 0; i < 40; i++) {
      u = (lo + hi) / 2;
      const x = 3 * (1 - u) ** 2 * u * x1 + 3 * (1 - u) * u * u * x2 + u ** 3;
      if (x < p) lo = u; else hi = u;
    }
    return 3 * (1 - u) ** 2 * u * y1 + 3 * (1 - u) * u * u * y2 + u ** 3;
  };
  const curve = {};
  for (const [name, value] of Object.entries(TIMING.easing)) curve[name] = bezier(value.curve);
  const event = (target, at) => TIMING.events.find(e => e.target === target && e.at === at);
  const progress = (e, t) => curve[e.motion](Math.max(0, Math.min(1, (t - e.at) * 1000 / TIMING.easing[e.motion].ms)));
  const E = {
    in1: event('card', 1), out1: event('card', 4), in2: event('card', 4.08), in3: event('card', 7), out3: event('card', 9.4),
    edits: event('row-b', 3.6), rule: event('refusal-rule', 4.08), released: event('row-a', 9.2), back: event('rows', 9.4)
  };
  const STEPS = TIMING.events.filter(e => e.step !== undefined);
  const mix = (a, b, k) => a + (b - a) * k;
  const FRAME0 = { aHold: 1, aRel: 0, b0: 1, b1: 0, b2: 0, bRef: 0, bDiff: 0 };

  function frameState(seconds) {
    const t = ((seconds % LOOP) + LOOP) % LOOP;
    const c1i = progress(E.in1, t), c1o = progress(E.out1, t);
    const c2i = progress(E.in2, t), c3i = progress(E.in3, t), c3o = progress(E.out3, t);
    const c2o = c3i; // the refusal card cross-fades into the next one
    const edits = progress(E.edits, t), refused = progress(E.rule, t), released = progress(E.released, t), back = progress(E.back, t);
    const before = { aHold: 1 - released, aRel: released, b0: 1 - edits, b1: edits * (1 - c3i), b2: c3i, bRef: refused * (1 - c3i), bDiff: c3i };
    const layers = {};
    for (const k in before) layers[k] = mix(before[k], FRAME0[k], back);
    layers.bTint = layers.bRef;
    layers.rule = refused * (1 - c2o);
    let step = 0;
    for (const e of STEPS) if (t >= e.at) step = e.step;
    return {
      t, frame: Math.floor(t * TIMING.fps + 1e-6), step, layers,
      cards: [[c1i * (1 - c1o), 8 * (1 - c1i)], [c2i * (1 - c2o), 8 * (1 - c2i)], [c3i * (1 - c3o), 8 * (1 - c3i)]]
    };
  }

  const hl = $('[data-hero-loop]');
  if (hl) {
    const layerEls = {};
    all('[data-l]', hl).forEach(el => { layerEls[el.dataset.l] = el; });
    const cardEls = all('[data-card]', hl);
    const stepBtns = all('[data-seek]', hl);
    const playBtn = $('[data-hero-play]', hl);
    let lastStep = -1;

    function renderAt(seconds) {
      const s = frameState(seconds);
      for (const k in s.layers) {
        const el = layerEls[k], v = s.layers[k];
        if (!el) continue;
        if (k === 'rule') el.style.transform = 'scaleY(' + v.toFixed(4) + ')';
        else { el.style.opacity = v.toFixed(4); el.style.visibility = v < 0.001 ? 'hidden' : 'visible'; }
      }
      s.cards.forEach(([o, y], i) => {
        const el = cardEls[i];
        el.style.opacity = o.toFixed(4);
        el.style.transform = y > 0.001 ? 'translateY(' + y.toFixed(2) + 'px)' : 'none';
        el.style.visibility = o < 0.001 ? 'hidden' : 'visible';
        el.setAttribute('aria-hidden', o < 0.5 ? 'true' : 'false');
      });
      if (s.step !== lastStep) {
        stepBtns.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.seek === s.step)));
        lastStep = s.step;
      }
      return s;
    }

    // Plays only while visible. Three loops, then on to the refusal frame and hold.
    const LOOPS = TIMING.loops_before_stop, REFUSAL_T = TIMING.holds_s[2][0], STOP_AT = LOOPS * LOOP + REFUSAL_T;
    const STEP_T = [TIMING.holds_s[1][0], TIMING.holds_s[2][0], TIMING.holds_s[3][0]];
    let elapsed = 0, playing = !isStatic(), finished = false, visible = !('IntersectionObserver' in window), last = 0, raf = 0;

    const sync = () => {
      playBtn.textContent = finished ? 'Replay' : playing ? 'Pause loop' : 'Play loop';
      playBtn.setAttribute('aria-pressed', String(playing));
    };
    function tick(now) {
      raf = 0;
      if (!playing || !visible || document.hidden) return;
      if (last) elapsed += Math.min(0.1, (now - last) / 1000);
      last = now;
      if (elapsed >= STOP_AT) { elapsed = STOP_AT; renderAt(REFUSAL_T); playing = false; finished = true; sync(); return; }
      renderAt(elapsed < LOOPS * LOOP ? elapsed % LOOP : elapsed - LOOPS * LOOP);
      raf = requestAnimationFrame(tick);
    }
    function start() { if (!raf && playing && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } }
    function pauseAt(t) { playing = false; finished = false; if (raf) cancelAnimationFrame(raf); raf = 0; renderAt(t); elapsed = t; sync(); }

    playBtn.addEventListener('click', () => {
      if (finished) { finished = false; elapsed = 0; playing = true; }
      else if (playing) playing = false;
      else { playing = true; elapsed %= LOOP; }
      sync(); start();
    });
    stepBtns.forEach(b => b.addEventListener('click', () => pauseAt(STEP_T[+b.dataset.seek])));
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { threshold: 0.2 }).observe(hl);
    document.addEventListener('visibilitychange', start);
    reduce.addEventListener('change', () => { if (isStatic()) pauseAt(REFUSAL_T); });

    if (isStatic()) { renderAt(REFUSAL_T); elapsed = REFUSAL_T; } else renderAt(0);
    sync(); start();

    // The phone cut in marketing/motion/hero-loop renders this element and
    // fails if timing.events differs from timing.json.
    window.LangSpanHero = {
      element: hl, timing: TIMING, renderAt, frameState,
      clock: () => ({ elapsed, playing, finished, visible, running: !!raf })
    };
  }

  /* ---------- Interface-change example ---------- */
  const sig = {
    old: { caller: 'priceWithTax(100)', title: 'Potential call break', kind: 'Advisory notice', msg: 'priceWithTax now takes 2 arguments. This call supplies 1.', note: 'Inspect billing.ts before continuing.' },
    new: { caller: 'priceWithTax(100, 0.08)', title: 'Argument count matches', kind: 'Illustrated retry', msg: 'priceWithTax(100, 0.08)', note: 'Run the combined checks to verify behavior.' }
  };
  all('[data-signature]').forEach(b => {
    b.disabled = false;
    b.addEventListener('click', () => {
      const k = b.dataset.signature, s = sig[k];
      all('[data-signature]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      $('[data-caller]').textContent = s.caller; $('[data-sig-title]').textContent = s.title; $('[data-sig-kind]').textContent = s.kind;
      $('[data-sig-msg]').textContent = s.msg; $('[data-sig-note]').textContent = s.note;
      $('[data-sig-result]').classList.toggle('ok', k === 'new');
    });
  });

  /* ---------- Walkthrough: loaded only when its panel opens ---------- */
  const tour = $('#demo'), tourHost = $('#tour-embed');
  function mountTour() {
    if (!tour.open) { tourHost.replaceChildren(); return; }
    if (tourHost.firstChild) return;
    const frame = document.createElement('iframe');
    frame.title = 'Coordination walkthrough, an illustration you can step through or play';
    frame.referrerPolicy = 'no-referrer';
    frame.src = 'walkthrough.html' + (isStatic() ? '?motion=static' : '') + '#edit-coordination';
    tourHost.appendChild(frame);
  }
  tour.addEventListener('toggle', mountTour);
  function openHash() { if (location.hash === '#demo') { tour.open = true; mountTour(); } }
  addEventListener('hashchange', openHash); openHash();

  /* ---------- Phone menu and copy buttons ---------- */
  const menu = $('.mobile-nav');
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('pointerdown', e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  menu.addEventListener('keydown', e => { if (e.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); } });
  all('[data-copy]').forEach(b => {
    b.hidden = false;
    b.addEventListener('click', async () => {
      const value = document.getElementById(b.dataset.copy), status = $('[data-copy-status]');
      try { await navigator.clipboard.writeText(value.textContent.trim()); b.textContent = 'Copied'; status.textContent = 'Command copied.'; }
      catch { const r = document.createRange(); r.selectNodeContents(value); getSelection().removeAllRanges(); getSelection().addRange(r); b.textContent = 'Selected'; status.textContent = 'Command selected. Copy it with your keyboard.'; }
      setTimeout(() => { b.textContent = 'Copy'; }, 1600);
    });
  });
})();
