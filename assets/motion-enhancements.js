"use strict";

/*
 * Motion is optional presentation. Semantic state and accessible controls belong
 * to the existing controllers; this file never changes their clocks or content.
 */
(function () {
  const api = window.Motion;
  if (!api || typeof api.animate !== "function" ||
      !window.Element || typeof window.Element.prototype.animate !== "function") return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const forcedStatic = document.documentElement.dataset.motion === "static" ||
    new URLSearchParams(window.location.search).get("motion") === "static";
  const active = new Map();
  const ease = [0.22, 1, 0.36, 1];

  function allowed() {
    return !forcedStatic && !reduced.matches && !document.hidden;
  }

  function restore(record) {
    if (record.done) return;
    record.done = true;
    window.clearTimeout(record.timeout);
    try { record.controls.cancel(); } catch (_) {}
    for (const name of ["opacity", "transform"]) {
      if (record.original[name]) record.element.style.setProperty(name, record.original[name]);
      else record.element.style.removeProperty(name);
    }
    if (active.get(record.element) === record) active.delete(record.element);
  }

  function settle(scope) {
    for (const record of Array.from(active.values())) {
      if (!scope || record.element === scope || scope.contains(record.element)) restore(record);
    }
  }

  function enter(element, options) {
    if (!element || !allowed()) return false;
    const disclosure = element.closest("details");
    if (disclosure && !disclosure.open) return false;
    const settings = options || {};
    const duration = settings.duration === undefined ? 0.36 : settings.duration;
    const distance = settings.distance === undefined ? 8 : settings.distance;
    const delay = settings.delay || 0;
    settle(element);
    const record = {
      element,
      controls: null,
      timeout: null,
      done: false,
      original: {
        opacity: element.style.getPropertyValue("opacity"),
        transform: element.style.getPropertyValue("transform")
      }
    };
    try {
      record.controls = api.animate(element, {
        opacity: [0.72, 1],
        transform: ["translateY(" + distance + "px)", "translateY(0px)"]
      }, { duration, delay, ease });
      active.set(element, record);
      // A bounded fallback restores the CSS state even if a browser drops the
      // animation's completion callback. No element is pre-hidden by this code.
      record.timeout = window.setTimeout(function () { restore(record); },
        Math.ceil((duration + delay) * 1000) + 180);
      Promise.resolve(record.controls).then(
        function () { restore(record); },
        function () { restore(record); }
      );
      return true;
    } catch (_) {
      for (const name of ["opacity", "transform"]) {
        if (record.original[name]) element.style.setProperty(name, record.original[name]);
        else element.style.removeProperty(name);
      }
      return false;
    }
  }

  window.LangSpanMotion = Object.freeze({ enter, settle, allowed });
  document.documentElement.classList.add("motion-enabled");

  // One introductory composition; subsequent motion answers an action or
  // introduces one of the two marked sections, rather than animating every card.
  const intro = Array.from(document.querySelectorAll("[data-motion-intro]"));
  if (allowed()) {
    intro.forEach(function (element, index) {
      enter(element, { distance: 8, duration: 0.48, delay: index * 0.065 });
    });
  }

  let revealObserver;
  if (typeof window.IntersectionObserver === "function") {
    revealObserver = new window.IntersectionObserver(function (entries) {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        revealObserver.unobserve(entry.target);
        enter(entry.target, { distance: 10, duration: 0.48 });
      }
    }, { threshold: 0.14 });
    document.querySelectorAll("[data-motion-reveal]").forEach(function (element) {
      revealObserver.observe(element);
    });
  }

  document.querySelectorAll(".faq-list details, #detail-examples").forEach(function (details) {
    details.addEventListener("toggle", function () {
      settle(details);
      if (!details.open) return;
      const content = details.querySelector(".demo-section") || details.querySelector("p");
      enter(content, { distance: 6, duration: 0.28 });
    });
  });

  document.addEventListener("click", function (event) {
    const target = event.target.closest && event.target.closest("[data-vendor]");
    if (target) enter(document.querySelector("#hooks-command"), { distance: 4, duration: 0.24 });
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) settle();
  });
  window.addEventListener("pagehide", function () { settle(); });
  reduced.addEventListener("change", function () {
    if (reduced.matches) {
      settle();
      if (revealObserver) revealObserver.disconnect();
    }
  });
})();

