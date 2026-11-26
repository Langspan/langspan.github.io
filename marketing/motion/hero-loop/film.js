/* Phone cut of the hero loop. One clock: marketing/motion/hero-loop/timing.json.
   It frames the page's own component; it does not redraw a copy of it. */
(() => {
  'use strict';
  const spec = window.FILM_SPEC, cut = spec.phone_cut, D = spec.duration_s;
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
  for (const [name, value] of Object.entries(spec.easing)) curve[name] = bezier(value.curve);
  const progress = (event, t) => Math.max(0, Math.min(1, (t - event.at) * 1000 / spec.easing[event.motion].ms));

  const hero = window.LangSpanHero;
  if (hero && JSON.stringify(hero.timing && hero.timing.events) !== JSON.stringify(spec.events)) {
    throw Error('The hero loop timing differs from marketing/motion/hero-loop/timing.json');
  }
  const panel = hero ? hero.element : document.querySelector('[data-coordination-event]');
  if (!panel || (!hero && !window.LangSpanProduct)) throw Error('The home page coordination component is unavailable');

  const logo = document.querySelector('.top-header .brand img').cloneNode(true);
  const film = document.createElement('main');
  film.id = 'film';
  film.innerHTML = '<header class="film-header"><div data-film-logo></div><span class="film-context">Coordination for coding agents</span></header>'
    + '<div class="film-stage" data-film-panel></div>'
    + '<footer class="film-footer"><strong>Your agents. On the same page.</strong><span>Recorded messages · illustrated continuation</span></footer>';
  film.querySelector('[data-film-logo]').append(logo);
  film.querySelector('[data-film-panel]').append(panel);
  document.body.append(film);
  document.body.classList.add('film-mode');

  const card = panel.querySelector('.inspector');
  const rows = { 'row-a': panel.querySelector('[data-inspect="a"] .status'), 'row-b': panel.querySelector('[data-inspect="b"] .status') };
  const list = panel.querySelector('.session-list');
  const handled = new Set(['scene', 'card', 'row-a', 'row-b', 'rows']);
  const ignored = [...new Set(spec.events.map(e => e.target).filter(x => !handled.has(x)))];
  const lastOf = (events, test) => { for (let i = events.length - 1; i >= 0; i--) if (test(events[i])) return events[i]; return undefined; };

  function drivePanel(t) {
    const past = spec.events.filter(e => e.at <= t);
    const c = lastOf(past, e => e.target === 'card');
    // The panel draws the card and the rows from one step, so the step
    // changes only after an exiting card has left.
    const exiting = c && c.motion === 'exit' && progress(c, t) < 1;
    const stepEvent = lastOf(past, e => e.step !== undefined && !(exiting && e.at >= c.at));
    const step = stepEvent.step;
    const state = window.LangSpanProduct.snapshot();
    if (state.step !== step || state.selected !== 'b') panel.querySelector('[data-step="' + step + '"]').click();

    let opacity = 0, y = 0;
    if (c && c.motion === 'entrance') {
      const k = curve.entrance(progress(c, t));
      opacity = k; y = (c.travel_px || 0) * (1 - k);
    } else if (c && c.motion === 'exit') {
      opacity = 1 - curve.exit(progress(c, t));
    }
    card.style.opacity = opacity.toFixed(4);
    card.style.transform = 'translateY(' + y.toFixed(3) + 'px)';

    for (const [target, node] of Object.entries(rows)) {
      const f = lastOf(past, e => e.target === target && e.at >= stepEvent.at);
      node.style.color = f ? 'color-mix(in srgb, var(--coral) ' + (100 * curve.feedback(progress(f, t))).toFixed(2) + '%, var(--dm))' : '';
    }
    // Cross-fade: the old rows fade out, the new rows fade in.
    const r = lastOf(past, e => e.target === 'rows');
    list.style.opacity = r ? Math.abs(1 - 2 * progress(r, t)).toFixed(4) : '1';
    return { t, step, mode: 'current panel', ignored_targets: ignored };
  }

  window.renderAt = seconds => {
    const t = ((seconds % D) + D) % D;
    if (hero) { hero.renderAt(t); return { t, mode: 'hero contract', ignored_targets: [] }; }
    return drivePanel(t);
  };

  window.measureFilm = () => {
    const box = film.getBoundingClientRect(), errors = [];
    let minText = Infinity;
    for (const n of film.querySelectorAll('*')) {
      const style = getComputedStyle(n), r = n.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || r.width === 0 || r.height === 0) continue;
      const text = [...n.childNodes].some(x => x.nodeType === 3 && x.textContent.trim());
      if (text) minText = Math.min(minText, parseFloat(style.fontSize) * cut.scale);
      if (r.left < box.left - .5 || r.top < box.top - .5 || r.right > box.right + .5 || r.bottom > box.bottom + .5) errors.push('outside the frame: ' + n.className + ' ' + n.textContent.slice(0, 24));
      if (text && (n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 1) && style.overflow !== 'visible') errors.push('clipped: ' + n.className + ' ' + n.textContent.slice(0, 24));
    }
    if (minText < cut.min_text_px) errors.push('text under ' + cut.min_text_px + ' px: ' + minText);
    const p = panel.getBoundingClientRect();
    return { errors, min_text_px: minText, panel_width_px: p.width * cut.scale };
  };

  window.renderAt(0);
})();
