/* Phone cut of the hero loop. One clock: marketing/motion/hero-loop/timing.json.
   It frames the page's own hero (window.LangSpanHero); it does not redraw a copy of it. */
(() => {
  'use strict';
  const spec = window.FILM_SPEC, cut = spec.phone_cut, D = spec.duration_s;
  const hero = window.LangSpanHero;
  if (!hero) throw Error('The home page hero is unavailable: window.LangSpanHero is missing');
  if (JSON.stringify(hero.timing.events) !== JSON.stringify(spec.events) ||
      JSON.stringify(hero.timing.holds_s) !== JSON.stringify(spec.holds_s) ||
      JSON.stringify(hero.timing.easing) !== JSON.stringify(spec.easing) || hero.timing.duration_s !== D) {
    throw Error('The hero loop timing differs from marketing/motion/hero-loop/timing.json');
  }
  const panel = hero.element;
  const logo = document.querySelector('.top-header .brand img').cloneNode(true);
  const film = document.createElement('main');
  film.id = 'film';
  film.innerHTML = '<header class="film-header"><div data-film-logo></div><span class="film-context">Coordination for coding agents</span></header>'
    + '<div class="film-stage" data-film-panel></div>'
    + '<footer class="film-footer"><strong>Your agents. On the same page.</strong><span>LangSpan’s own agents at work</span></footer>';
  film.querySelector('[data-film-logo]').append(logo);
  film.querySelector('[data-film-panel]').append(panel);
  document.body.append(film);
  document.body.classList.add('film-mode');

  window.renderAt = seconds => {
    const t = ((seconds % D) + D) % D;
    hero.renderAt(t);
    return { t, mode: 'hero contract', ignored_targets: [] };
  };

  window.measureFilm = () => {
    const box = film.getBoundingClientRect(), errors = [];
    let minText = Infinity;
    for (const n of film.querySelectorAll('*')) {
      const style = getComputedStyle(n), r = n.getBoundingClientRect();
      if (style.display === 'none' || style.visibility === 'hidden' || r.width === 0 || r.height === 0) continue;
      if (n instanceof SVGElement && n.tagName !== 'svg') continue;
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
