/* Home page interactions. No agent or daemon runs in the browser. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const all = (s, r = document) => [...r.querySelectorAll(s)];
  document.documentElement.classList.remove('no-js');

  // Old home-page anchors whose sections now live on the technical guide.
  const legacy = new Set(['scale','why','research','workflow','capabilities','evidence','benchmark','film','team-story','peer-briefings','source-awareness','commit-ownership','team-awareness','integration-checks','coordination-demo','planned-setup','manual-setup','mission','hosts','semantic-awareness','langspan-live','demo']);
  function followLegacy() { if (legacy.has(location.hash.slice(1))) { location.replace('technical.html' + location.search + location.hash); return true; } return false; }
  if (followLegacy()) return;
  addEventListener('hashchange', followLegacy);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const forcedStatic = new URLSearchParams(location.search).get('motion') === 'static';
  const isStatic = () => reduce.matches || forcedStatic;

  /* ---------- Hero: LangSpan Live "Now" view, replaying a recorded slice ----------
     One clock. TIMING is an equal copy of marketing/motion/hero-loop/timing.json
     (the site publishes only assets/, so the page cannot read that file). Each
     event names the event seq numbers in assets/evidence/hero-slice-2026-11-25.json
     that it draws. renderAt(t) draws a frame from t alone; nothing carries over
     between frames. The camera (zoom, Fit, Follow newest) is the visitor's view
     and is separate from the clock. */
  const TIMING = {
    "name": "hero-loop",
    "fps": 30,
    "duration_s": 12,
    "frames": 360,
    "loops_before_stop": null,
    "stop_state": null,
    "reduced_motion_state": "final",
    "final_s": 9,
    "easing": {"entrance": {"curve": [0.16, 1, 0.3, 1], "ms": 280}, "exit": {"curve": [0.7, 0, 0.84, 0], "ms": 160}, "feedback": {"curve": [0.16, 1, 0.3, 1], "ms": 150}, "state": {"curve": [0.16, 1, 0.3, 1], "ms": 280}},
    "events": [
      {"at": 0, "target": "scene", "motion": "none", "text": "Two agents in one checkout. 1 write held in the last 10 min.", "seq": [28584]},
      {"at": 0.5, "target": "card-hook", "motion": "entrance", "travel_px": 8, "text": "Edited src/hook.rs · 3 edits", "seq": [29128, 29129, 29140, 29141, 29145, 29146]},
      {"at": 1.5, "target": "card-dash", "motion": "entrance", "travel_px": 8, "text": "Edited 1 file and ran 1 command", "seq": [29172, 29173, 29212]},
      {"at": 2.3, "target": "status", "motion": "feedback", "text": "2 writes held in the last 10 min", "seq": [29204]},
      {"at": 2.7, "target": "card-tests", "motion": "entrance", "travel_px": 8, "text": "Edited tests/break_alerts.rs", "seq": [29243, 29244]},
      {"at": 3.7, "target": "card-held", "motion": "entrance", "travel_px": 8, "text": "Write held src/hook.rs · changed since this agent read it", "seq": [29255, 29256]},
      {"at": 3.7, "target": "wire", "motion": "state", "text": "The Held wire draws from #29's edits of src/hook.rs to #28's held write.", "seq": [29256]},
      {"at": 3.7, "target": "status", "motion": "feedback", "text": "3 writes held in the last 10 min", "seq": [29256]},
      {"at": 5, "target": "card-graph", "motion": "entrance", "travel_px": 8, "text": "Edited 2 files graph.rs, breaks.rs", "seq": [29267, 29268, 29277, 29278]},
      {"at": 5.8, "target": "card-read", "motion": "entrance", "travel_px": 8, "text": "Read src/hook.rs", "seq": [29274]},
      {"at": 6.6, "target": "card-saved", "motion": "entrance", "travel_px": 8, "text": "Saved after re-reading src/hook.rs", "seq": [29284, 29285]},
      {"at": 7.6, "target": "inspector", "motion": "entrance", "travel_px": 8, "text": "The inspector opens on the held write."},
      {"at": 11.4, "target": "scene", "motion": "exit", "text": "Cards, the wire and the inspector leave together."},
      {"at": 11.4, "target": "status", "motion": "feedback", "text": "1 write held in the last 10 min", "seq": [28584]}
    ],
    "holds_s": [[0, 0.5], [0.78, 1.5], [1.78, 2.7], [2.98, 3.7], [3.98, 5], [5.28, 5.8], [6.08, 6.6], [6.88, 7.6], [7.88, 11.4], [11.56, 12]]
  };
  const LOOP = TIMING.duration_s, FINAL_T = TIMING.final_s;
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
  const progress = (e, t) => curve[e.motion](Math.max(0, Math.min(1, (t - e.at) * 1000 / TIMING.easing[e.motion].ms)));
  const ENTER = TIMING.events.filter(e => e.motion === 'entrance');
  const CARDS = ENTER.filter(e => e.target.startsWith('card-'));
  const WIRE = TIMING.events.find(e => e.target === 'wire');
  const INSPECT = TIMING.events.find(e => e.target === 'inspector');
  const LEAVE = TIMING.events.find(e => e.target === 'scene' && e.motion === 'exit');
  const STATUS = TIMING.events.filter(e => e.target === 'status');
  const held = text => text.match(/\d+ writes? held/)[0];
  const START_STATUS = held(TIMING.events[0].text);

  function frameState(seconds) {
    const t = ((seconds % LOOP) + LOOP) % LOOP;
    const stay = 1 - progress(LEAVE, t);
    const cards = {};
    let newest = null;
    for (const e of CARDS) {
      const k = progress(e, t);
      cards[e.target] = [k * stay, e.travel_px * (1 - k)];
      if (t >= e.at && stay > 0) newest = e.target;
    }
    const k = progress(INSPECT, t);
    const status = [...STATUS].reverse().find(e => t >= e.at);
    return {
      t, frame: Math.floor(t * TIMING.fps + 1e-6), cards, newest,
      wire: progress(WIRE, t) * stay, wireLabel: progress(WIRE, t) * stay,
      inspector: [k * stay, INSPECT.travel_px * (1 - k)],
      status: status ? [held(status.text), 0.35 + 0.65 * progress(status, t)] : [START_STATUS, 1]
    };
  }

  const hero = $('[data-hero-loop]');
  if (hero) {
    const canvas = $('[data-canvas]', hero), world = $('[data-world]', hero);
    const cardEls = {};
    all('[data-card]', hero).forEach(el => { cardEls[el.dataset.card] = el; });
    const heldCard = cardEls['card-held'];
    const wires = all('[data-wire] .wire-line', hero), wireGlows = all('[data-wire] .wire-glow', hero);
    const wireLabel = $('[data-wire-label]', hero);
    const inspector = $('[data-inspector]', hero);
    const count = $('[data-status-count]', hero);
    const openBtn = $('[data-open-inspector]', hero), closeBtn = $('[data-close-inspector]', hero);
    const playBtn = $('[data-hero-play]', hero);
    let lastNewest = null;
    const show = (el, o) => { el.style.opacity = o.toFixed(4); el.style.visibility = o < 0.001 ? 'hidden' : 'visible'; };

    function renderAt(seconds) {
      const s = frameState(seconds);
      for (const [id, [o, y]] of Object.entries(s.cards)) {
        const el = cardEls[id];
        show(el, o);
        el.style.transform = y > 0.001 ? 'translateY(' + y.toFixed(2) + 'px)' : 'none';
      }
      wires.forEach(p => { p.style.strokeDashoffset = (1 - s.wire).toFixed(4); p.style.visibility = s.wire < 0.001 ? 'hidden' : 'visible'; });
      wireGlows.forEach(p => show(p, s.wire));
      show(wireLabel, s.wireLabel);
      show(inspector, s.inspector[0]);
      inspector.style.transform = s.inspector[1] > 0.001 ? 'translateY(' + s.inspector[1].toFixed(2) + 'px)' : 'none';
      const shown = s.inspector[0] > 0.5 && !inspector.classList.contains('closed');
      heldCard.classList.toggle('selected', shown);
      openBtn.setAttribute('aria-expanded', String(shown));
      if (count.textContent !== s.status[0]) count.textContent = s.status[0];
      count.style.opacity = s.status[1].toFixed(4);
      if (s.newest !== lastNewest) { lastNewest = s.newest; if (camera.follow) camera.followNewest(); }
      return s;
    }

    /* Camera: zoom, Fit, Follow newest and drag to pan. Wide layouts fit the
       cards to the room left of the inspector; narrow layouts fit at 1. */
    const wide = matchMedia('(min-width: 1280px)');
    const camera = {
      s: 1, x: 0, y: 0, bx: 0, by: 0, fitted: true, follow: true,
      fitScale() { return wide.matches ? Math.min(1, (canvas.clientWidth - (inspector.classList.contains('closed') ? 24 : 396)) / 950) : 1; },
      // Follow newest pans from the visitor's own view (bx, by), so the view at a
      // given t is the same however the clock reached it.
      base() { this.bx = this.x; this.by = this.y; },
      apply() { world.style.transform = 'translate(' + this.x.toFixed(1) + 'px,' + this.y.toFixed(1) + 'px) scale(' + this.s.toFixed(4) + ')'; },
      fit() { this.s = this.fitScale(); this.x = 0; this.y = 0; this.base(); this.fitted = true; this.apply(); if (this.follow) this.followNewest(); },
      zoom(f) {
        const s = Math.max(0.5, Math.min(2.5, this.s * f)), cx = canvas.clientWidth / 2, cy = canvas.clientHeight / 2;
        this.x = cx - (cx - this.x) * s / this.s; this.y = cy - (cy - this.y) * s / this.s; this.s = s; this.base(); this.fitted = false; this.apply();
        if (this.follow) this.followNewest();
      },
      followNewest() {
        this.x = this.bx; this.y = this.by;
        const el = cardEls[lastNewest];
        if (!el) { this.apply(); return; }
        const room = canvas.clientWidth - (wide.matches && !inspector.classList.contains('closed') ? 396 : 0), m = 4;
        const l = el.offsetLeft * this.s + this.x, r = (el.offsetLeft + el.offsetWidth) * this.s + this.x;
        const top = el.offsetTop * this.s + this.y, bottom = (el.offsetTop + el.offsetHeight) * this.s + this.y;
        if (r > room - m) this.x -= r - (room - m); else if (l < m) this.x += m - l;
        if (bottom > canvas.clientHeight - m) this.y -= bottom - (canvas.clientHeight - m); else if (top < m) this.y += m - top;
        this.apply();
      }
    };
    const camBtns = $('[data-camera]', hero);
    camBtns.hidden = false;
    const followBtn = $('[data-cam="follow"]', hero);
    camBtns.addEventListener('click', e => {
      const b = e.target.closest('[data-cam]');
      if (!b) return;
      const kind = b.dataset.cam;
      if (kind === 'in') camera.zoom(1.25);
      else if (kind === 'out') camera.zoom(1 / 1.25);
      else if (kind === 'fit') { camera.follow = false; camera.fit(); }
      else { camera.follow = !camera.follow; if (camera.follow) camera.followNewest(); }
      followBtn.setAttribute('aria-pressed', String(camera.follow));
    });
    let drag = null;
    canvas.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button')) return;
      drag = { x: e.clientX, y: e.clientY, cx: camera.x, cy: camera.y, id: e.pointerId };
    });
    canvas.addEventListener('pointermove', e => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!canvas.classList.contains('panning') && Math.hypot(dx, dy) < 4) return;
      if (!canvas.classList.contains('panning')) { canvas.classList.add('panning'); canvas.setPointerCapture(e.pointerId); }
      camera.x = drag.cx + dx; camera.y = drag.cy + dy; camera.base(); camera.fitted = false; camera.follow = false;
      followBtn.setAttribute('aria-pressed', 'false'); camera.apply();
    });
    const endDrag = () => { drag = null; canvas.classList.remove('panning'); };
    canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
    const refit = () => { if (camera.fitted) camera.fit(); };
    if ('ResizeObserver' in window) new ResizeObserver(refit).observe(canvas); else addEventListener('resize', refit);
    wide.addEventListener('change', () => camera.fit());
    camera.fit();

    // The inspector opens on the held write; a visitor can close it and open it again.
    closeBtn.hidden = false;
    const setInspector = open => {
      inspector.classList.toggle('closed', !open);
      openBtn.setAttribute('aria-expanded', String(open));
      heldCard.classList.toggle('selected', open && parseFloat(inspector.style.opacity || '1') > 0.5);
      refit();
    };
    closeBtn.addEventListener('click', () => { setInspector(false); openBtn.focus(); });
    openBtn.addEventListener('click', () => setInspector(inspector.classList.contains('closed')));

    // Loops while visible. The Pause control in the canvas controls stops it (WCAG 2.2.2).
    let elapsed = 0, playing = !isStatic(), visible = !('IntersectionObserver' in window), last = 0, raf = 0;
    const sync = () => { playBtn.textContent = playing ? 'Pause' : 'Play'; playBtn.setAttribute('aria-label', playing ? 'Pause the view' : 'Play the view'); };
    function tick(now) {
      raf = 0;
      if (!playing || !visible || document.hidden) return;
      if (last) elapsed += Math.min(0.1, (now - last) / 1000);
      last = now;
      elapsed %= LOOP;
      renderAt(elapsed);
      raf = requestAnimationFrame(tick);
    }
    function start() { if (!raf && playing && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } }
    function stopAt(t) { playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; renderAt(t); elapsed = t; sync(); }
    playBtn.addEventListener('click', () => { playing = !playing; sync(); start(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { threshold: 0.2 }).observe(hero);
    document.addEventListener('visibilitychange', start);
    reduce.addEventListener('change', () => { if (isStatic()) stopAt(FINAL_T); });

    if (isStatic()) { renderAt(FINAL_T); elapsed = FINAL_T; } else renderAt(0);
    sync(); start();

    // The phone cut in marketing/motion/hero-loop renders this element and
    // fails if timing.events differs from timing.json.
    window.LangSpanHero = {
      element: hero, timing: TIMING, renderAt, frameState,
      clock: () => ({ elapsed, playing, visible, running: !!raf })
    };
  }

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
