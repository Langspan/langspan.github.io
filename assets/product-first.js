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
    "final_s": 10,
    "tolerance_ms": 50,
    "easing": {"entrance": {"curve": [0.16, 1, 0.3, 1], "ms": 200}, "draw": {"curve": [0.16, 1, 0.3, 1], "ms": 600}, "emphasis": {"curve": [0.37, 0, 0.63, 1], "ms": 150}, "tint": {"curve": [0.16, 1, 0.3, 1], "ms": 300}, "crossfade": {"curve": [0.16, 1, 0.3, 1], "ms": 600}, "feedback": {"curve": [0.16, 1, 0.3, 1], "ms": 150}},
    "events": [
      {"at": 0, "target": "scene", "motion": "none", "seq": [28584], "text": "Three lanes, no cards yet. 1 write held in the last 10 min."},
      {"at": 0.2, "target": "card-hook", "motion": "entrance", "travel_px": 8, "seq": [29128, 29129, 29140, 29141, 29145, 29146], "text": "Agent #29 edits src/hook.rs (3 edits)."},
      {"at": 0.5, "target": "card-observer", "motion": "entrance", "travel_px": 8, "seq": [29134, 29135, 29150, 29151, 29157, 29158, 29161, 29162], "text": "The worktree agent edits src/observer.rs (4 edits)."},
      {"at": 0.8, "target": "card-dash", "motion": "entrance", "travel_px": 8, "seq": [29172, 29173, 29212], "text": "Agent #29 edits 1 file and runs 1 command."},
      {"at": 1.1, "target": "card-graph-c7", "motion": "entrance", "travel_px": 8, "seq": [29189, 29190, 29198, 29199, 29207, 29208, 29225, 29226, 29232, 29233, 29237, 29238], "text": "The worktree agent edits src/graph.rs (6 edits)."},
      {"at": 1.25, "target": "status", "motion": "feedback", "seq": [29204], "text": "2 writes held in the last 10 min"},
      {"at": 1.4, "target": "card-tests", "motion": "entrance", "travel_px": 8, "seq": [29243, 29244], "text": "Agent #28 edits tests/break_alerts.rs."},
      {"at": 3.5, "target": "card-held", "motion": "entrance", "travel_px": 8, "seq": [29255, 29256], "text": "Agent #28's write of src/hook.rs is held: the file changed since it read it."},
      {"at": 3.5, "target": "status", "motion": "feedback", "seq": [29256], "text": "3 writes held in the last 10 min"},
      {"at": 3.7, "target": "wire", "motion": "draw", "seq": [29256], "text": "The Held wire draws from #29's edits of src/hook.rs to #28's held write."},
      {"at": 4.5, "target": "card-held", "motion": "emphasis", "scale": 1.03, "text": "One emphasis on the held card: scale 1 to 1.03 and back."},
      {"at": 5.0, "target": "card-graph-late", "motion": "entrance", "travel_px": 8, "seq": [29258, 29259], "text": "The worktree agent edits src/graph.rs again."},
      {"at": 5.25, "target": "card-graph", "motion": "entrance", "travel_px": 8, "seq": [29267, 29268, 29277, 29278], "text": "Agent #29 edits src/graph.rs and src/breaks.rs."},
      {"at": 5.6, "target": "card-read", "motion": "entrance", "travel_px": 8, "seq": [29274], "text": "Agent #28 reads src/hook.rs again."},
      {"at": 7.0, "target": "card-saved", "motion": "entrance", "travel_px": 8, "seq": [29284, 29285], "text": "Agent #28 saves its edit, made against the current file."},
      {"at": 7.2, "target": "card-saved", "motion": "tint", "text": "The saved card's border and fill turn green."},
      {"at": 11.0, "target": "scene", "motion": "crossfade", "text": "Cards and the wire fade back to the empty lanes."},
      {"at": 11.0, "target": "status", "motion": "feedback", "seq": [28584], "text": "1 write held in the last 10 min"}
    ],
    "holds_s": [[0, 0.2], [0.4, 0.5], [0.7, 0.8], [1.0, 1.1], [1.3, 1.4], [1.6, 3.5], [4.3, 4.5], [4.65, 5.0], [5.2, 5.25], [5.45, 5.6], [5.8, 7.0], [7.5, 11.0], [11.6, 12]]
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
  const CARDS = TIMING.events.filter(e => e.motion === 'entrance' && e.target.startsWith('card-'));
  const WIRE = TIMING.events.find(e => e.target === 'wire');
  const EMPHASIS = TIMING.events.find(e => e.motion === 'emphasis');
  const TINT = TIMING.events.find(e => e.motion === 'tint');
  const LEAVE = TIMING.events.find(e => e.motion === 'crossfade');
  const STATUS = TIMING.events.filter(e => e.target === 'status');
  const held = text => text.match(/\d+ writes? held/)[0];
  const START_STATUS = held(TIMING.events[0].text);
  // Linear 0..1 over an event, for the emphasis's up-and-back shape.
  const linear = (e, t) => Math.max(0, Math.min(1, (t - e.at) * 1000 / TIMING.easing[e.motion].ms));

  function frameState(seconds) {
    const t = ((seconds % LOOP) + LOOP) % LOOP;
    const stay = 1 - progress(LEAVE, t);
    const cards = {};
    let newest = null;
    for (const e of CARDS) {
      const k = progress(e, t);
      cards[e.target] = [k * stay, e.travel_px * (1 - k), 1];
      if (t >= e.at && stay > 0) newest = e.target;
    }
    // One emphasis: scale rises to EMPHASIS.scale and returns, eased, then rests at 1.
    const lift = curve.emphasis(Math.sin(Math.PI * linear(EMPHASIS, t)));
    cards[EMPHASIS.target][2] = 1 + (EMPHASIS.scale - 1) * lift;
    const status = [...STATUS].reverse().find(e => t >= e.at);
    return {
      t, frame: Math.floor(t * TIMING.fps + 1e-6), cards, newest,
      wire: progress(WIRE, t) * stay, wireLabel: progress(WIRE, t) * stay,
      saved: progress(TINT, t),
      status: status ? [held(status.text), 0.35 + 0.65 * progress(status, t)] : [START_STATUS, 1]
    };
  }

  const hero = $('[data-hero-loop]');
  if (hero) {
    const canvas = $('[data-canvas]', hero), world = $('[data-world]', hero);
    const cardEls = {};
    all('[data-card]', hero).forEach(el => { cardEls[el.dataset.card] = el; });
    const savedCard = cardEls['card-saved'];
    const wires = all('[data-wire] .wire-line', hero), wireGlows = all('[data-wire] .wire-glow', hero);
    const wireLabel = $('[data-wire-label]', hero);
    const count = $('[data-status-count]', hero);
    const playBtn = $('[data-hero-play]', hero);
    const pop = $('[data-pop]', hero), popBody = $('[data-pop-body]', hero);
    let lastNewest = null;
    const show = (el, o) => { el.style.opacity = o.toFixed(4); el.style.visibility = o < 0.001 ? 'hidden' : 'visible'; };

    function renderAt(seconds) {
      const s = frameState(seconds);
      for (const [id, [o, y, k]] of Object.entries(s.cards)) {
        const el = cardEls[id];
        show(el, o);
        const move = (y > 0.001 ? 'translateY(' + y.toFixed(2) + 'px)' : '') + (k > 1.0001 ? ' scale(' + k.toFixed(4) + ')' : '');
        el.style.transform = move || 'none';
      }
      wires.forEach(p => { p.style.strokeDashoffset = (1 - s.wire).toFixed(4); p.style.visibility = s.wire < 0.001 ? 'hidden' : 'visible'; });
      wireGlows.forEach(p => show(p, s.wire));
      show(wireLabel, s.wireLabel);
      savedCard.style.setProperty('--ok', s.saved.toFixed(4));
      if (count.textContent !== s.status[0]) count.textContent = s.status[0];
      count.style.opacity = s.status[1].toFixed(4);
      if (s.newest !== lastNewest) { lastNewest = s.newest; if (camera.follow) camera.followNewest(); }
      return s;
    }

    /* Camera: buttons, Ctrl or pinch wheel, two-finger pinch, drag, and keys
       (arrows pan 48 px, + and - zoom by 1.25, 0 fits, L follows the newest
       work). Wide layouts fit the cards to the canvas; narrow layouts fit at 1. */
    const wide = matchMedia('(min-width: 1280px)');
    const camera = {
      s: 1, x: 0, y: 0, bx: 0, by: 0, fitted: true, follow: true,
      fitScale() { return wide.matches ? Math.min(1, (canvas.clientWidth - 24) / 950) : 1; },
      // Follow newest pans from the visitor's own view (bx, by), so the view at a
      // given t is the same however the clock reached it.
      base() { this.bx = this.x; this.by = this.y; },
      apply() { world.style.transform = 'translate(' + this.x.toFixed(1) + 'px,' + this.y.toFixed(1) + 'px) scale(' + this.s.toFixed(4) + ')'; },
      fit() { this.s = this.fitScale(); this.x = 0; this.y = 0; this.base(); this.fitted = true; drawWire(); this.apply(); if (this.follow) this.followNewest(); },
      zoomAt(f, cx = canvas.clientWidth / 2, cy = canvas.clientHeight / 2) {
        const s = Math.max(0.5, Math.min(2.5, this.s * f));
        this.x = cx - (cx - this.x) * s / this.s; this.y = cy - (cy - this.y) * s / this.s; this.s = s; this.base(); this.fitted = false; this.apply();
        if (this.follow) this.followNewest();
      },
      pan(dx, dy) { this.x += dx; this.y += dy; this.base(); this.fitted = false; this.follow = false; this.apply(); syncFollow(); },
      followNewest() {
        this.x = this.bx; this.y = this.by;
        const el = cardEls[lastNewest];
        if (!el) { this.apply(); return; }
        const room = canvas.clientWidth, m = 4;
        const l = el.offsetLeft * this.s + this.x, r = (el.offsetLeft + el.offsetWidth) * this.s + this.x;
        const top = el.offsetTop * this.s + this.y, bottom = (el.offsetTop + el.offsetHeight) * this.s + this.y;
        if (r > room - m) this.x -= r - (room - m); else if (l < m) this.x += m - l;
        if (bottom > canvas.clientHeight - m) this.y -= bottom - (canvas.clientHeight - m); else if (top < m) this.y += m - top;
        this.apply();
      }
    };
    // In the narrow layout the card heights follow the text, so the wire and its
    // label are placed from the cards it joins: #29's edits of src/hook.rs and
    // #28's held write. The markup's path is the fallback without JavaScript.
    const wireV = $('.wire-v', hero), fromCard = cardEls['card-hook'], toCard = cardEls['card-held'], nextRow = cardEls['card-dash'];
    function drawWire() {
      if (getComputedStyle(wireV).display === 'none') { wireLabel.style.left = ''; wireLabel.style.top = ''; return; }
      const w = world.clientWidth, h = world.clientHeight;
      const x1 = fromCard.offsetLeft + fromCard.offsetWidth, y1 = fromCard.offsetTop + fromCard.offsetHeight / 2;
      const x2 = toCard.offsetLeft, y2 = toCard.offsetTop + toCard.offsetHeight / 2;
      wireV.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      const d = 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + 14) + ' ' + y1 + ', ' + (x2 - 14) + ' ' + y2 + ', ' + x2 + ' ' + y2;
      wireV.querySelectorAll('path').forEach(p => p.setAttribute('d', d));
      wireLabel.style.left = ((x1 + x2) / 2) + 'px';
      wireLabel.style.top = ((fromCard.offsetTop + fromCard.offsetHeight + nextRow.offsetTop) / 2) + 'px';
    }
    const followBtn = $('[data-cam="follow"]', hero);
    const syncFollow = () => followBtn.setAttribute('aria-pressed', String(camera.follow));

    /* The clock. Left alone, the view loops. Any interaction pauses it, and it
       resumes from the current beat after IDLE_MS without interaction, or at
       once on Play or Follow newest. Pause by the visitor stays paused. */
    const IDLE_MS = 8000;
    let elapsed = 0, playing = !isStatic(), held = false, visible = !('IntersectionObserver' in window), last = 0, raf = 0, idle = 0;
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
    function stop() { playing = false; if (raf) cancelAnimationFrame(raf); raf = 0; sync(); }
    function resume() { clearTimeout(idle); idle = 0; held = false; closePop(); playing = true; sync(); start(); }
    // An interaction pauses the loop; reduced motion and a visitor's Pause stay paused.
    function touched() {
      if (isStatic() || held) return;
      if (playing) stop();
      clearTimeout(idle);
      idle = setTimeout(() => { if (!held && !isStatic()) resume(); }, IDLE_MS);
    }
    playBtn.addEventListener('click', () => { if (playing) { held = true; clearTimeout(idle); stop(); } else resume(); });

    $('[data-camera]', hero).hidden = false;
    $('[data-camera]', hero).addEventListener('click', e => {
      const b = e.target.closest('[data-cam]');
      if (!b) return;
      const kind = b.dataset.cam;
      if (kind === 'follow') { camera.follow = !camera.follow; syncFollow(); if (camera.follow) { camera.followNewest(); if (!held && !isStatic()) resume(); } return; }
      touched();
      if (kind === 'in') camera.zoomAt(1.25);
      else if (kind === 'out') camera.zoomAt(1 / 1.25);
      else { camera.follow = false; syncFollow(); camera.fit(); }
    });
    canvas.addEventListener('wheel', e => {
      if (!e.ctrlKey && !e.metaKey) return; // A plain wheel scrolls the page.
      e.preventDefault(); touched();
      const r = canvas.getBoundingClientRect();
      camera.zoomAt(Math.exp(-e.deltaY / 300), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    const pointers = new Map();
    let drag = null, pinch = null;
    canvas.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('[data-pop]')) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1 }; drag = null;
      } else if (!e.target.closest('button')) drag = { x: e.clientX, y: e.clientY, moved: false };
    });
    canvas.addEventListener('pointermove', e => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()], d = Math.hypot(a.x - b.x, a.y - b.y) || 1, r = canvas.getBoundingClientRect();
        touched(); camera.zoomAt(d / pinch.d, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top); pinch.d = d; return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      if (!drag.moved) { drag.moved = true; canvas.classList.add('panning'); canvas.setPointerCapture(e.pointerId); }
      touched(); camera.pan(dx, dy); drag.x = e.clientX; drag.y = e.clientY;
    });
    const endPointer = e => { pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null; if (!pointers.size) { drag = null; canvas.classList.remove('panning'); } };
    canvas.addEventListener('pointerup', endPointer); canvas.addEventListener('pointercancel', endPointer);
    canvas.addEventListener('keydown', e => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const step = 48, keys = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
      if (keys[e.key]) { e.preventDefault(); touched(); camera.pan(...keys[e.key]); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); touched(); camera.zoomAt(1.25); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); touched(); camera.zoomAt(1 / 1.25); }
      else if (e.key === '0') { e.preventDefault(); touched(); camera.follow = false; syncFollow(); camera.fit(); }
      else if (e.key === 'l' || e.key === 'L') { e.preventDefault(); camera.follow = true; syncFollow(); camera.followNewest(); if (!held && !isStatic()) resume(); }
    });
    canvas.addEventListener('focusin', touched);
    const refit = () => { if (camera.fitted) camera.fit(); };
    if ('ResizeObserver' in window) new ResizeObserver(refit).observe(canvas); else addEventListener('resize', refit);
    wide.addEventListener('change', () => camera.fit());
    camera.fit();

    /* Details: a click on a card or on the Held wire opens a small popover
       anchored to it, inside the canvas. It never opens on its own. */
    let opener = null;
    function placePop(anchor) {
      const c = canvas.getBoundingClientRect(), a = anchor.getBoundingClientRect(), m = 8;
      pop.style.left = '0px'; pop.style.top = '0px';
      pop.style.maxHeight = (c.height - 2 * m) + 'px';
      const w = pop.offsetWidth, h = pop.offsetHeight;
      let x = a.left - c.left + a.width / 2 - w / 2;
      let y = a.bottom - c.top + 8;
      if (y + h > c.height - m) y = a.top - c.top - 8 - h;
      if (y < m) y = Math.max(m, Math.min(c.height - h - m, a.top - c.top));
      x = Math.max(m, Math.min(c.width - w - m, x));
      pop.style.left = x.toFixed(0) + 'px'; pop.style.top = y.toFixed(0) + 'px';
    }
    function openPop(button) {
      const key = button.dataset.detailOpen, tpl = $('template[data-detail="' + key + '"]', hero);
      if (!tpl) return;
      if (opener) opener.setAttribute('aria-expanded', 'false');
      popBody.replaceChildren(tpl.content.cloneNode(true));
      pop.setAttribute('aria-label', 'Details: ' + button.textContent.replace(/\s+/g, ' ').trim());
      pop.hidden = false; opener = button; button.setAttribute('aria-expanded', 'true');
      placePop(button);
      $('[data-pop-close]', pop).focus({ preventScroll: true });
    }
    function closePop(refocus) {
      if (pop.hidden) return;
      pop.hidden = true;
      if (opener) { opener.setAttribute('aria-expanded', 'false'); if (refocus) opener.focus({ preventScroll: true }); }
      opener = null;
    }
    hero.addEventListener('click', e => {
      const b = e.target.closest('[data-detail-open]');
      if (b) { touched(); if (opener === b && !pop.hidden) closePop(true); else openPop(b); }
    });
    $('[data-pop-close]', pop).addEventListener('click', () => { touched(); closePop(true); });
    document.addEventListener('pointerdown', e => { if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('[data-detail-open]')) closePop(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !pop.hidden) { e.preventDefault(); closePop(true); } });

    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { threshold: 0.2 }).observe(hero);
    document.addEventListener('visibilitychange', start);
    reduce.addEventListener('change', () => { if (isStatic()) { stop(); renderAt(FINAL_T); elapsed = FINAL_T; } });

    if (isStatic()) { renderAt(FINAL_T); elapsed = FINAL_T; } else renderAt(0);
    sync(); start();

    // The phone cut in marketing/motion/hero-loop renders this element and
    // fails if timing.events differs from timing.json.
    window.LangSpanHero = {
      element: hero, timing: TIMING, renderAt, frameState,
      clock: () => ({ elapsed, playing, held, visible, running: !!raf, resumeScheduled: !!idle })
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
