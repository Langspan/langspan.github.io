"use strict";

(function () {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const parameters = new URLSearchParams(window.location.search);
  const forcedStatic = parameters.get("motion") === "static" ||
    document.documentElement.dataset.motion === "static";

  document.querySelectorAll("[data-team-story]").forEach(function (root) {
    const controls = root.querySelector("[data-motion-controls]");
    const status = root.querySelector("[data-motion-status]");
    const progress = root.querySelector("[data-team-story-progress]");
    const play = root.querySelector('[data-team-story-action="toggle"]');
    const playLabel = root.querySelector("[data-team-story-play-label]");
    const previous = root.querySelector('[data-team-story-action="prev"]');
    const next = root.querySelector('[data-team-story-action="next"]');
    const replay = root.querySelector('[data-team-story-action="replay"]');
    const items = Array.from(root.querySelectorAll("[data-motion-item]"));
    const count = Number(root.dataset.teamStoryStepCount);
    const labels = Array.from({ length: count }, function (_, index) {
      const item = items.find(function (entry) {
        return Number(entry.dataset.teamStoryStep) === index + 1 && entry.dataset.motionLabel;
      });
      return item ? item.dataset.motionLabel : "";
    });
    if (!controls || !status || !progress || !play || !playLabel ||
        !previous || !next || !replay || !Number.isInteger(count) ||
        count < 1 || count > 8 || labels.some(function (label) { return !label; })) return;

    const configuredHold = parseFloat(getComputedStyle(root).getPropertyValue("--motion-hold"));
    const hold = Number.isFinite(configuredHold) ? Math.max(400, Math.min(1200, configuredHold)) : 1200;
    const buttons = [play, previous, next, replay];
    let step = count;
    let frame = "static";
    let playing = false;
    let timer = null;

    function unavailable() {
      return forcedStatic || reducedMotion.matches || root.dataset.motionMode === "none";
    }

    function clearTimer() {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
    }

    function announce(message) {
      status.textContent = message;
    }

    function stepMessage() {
      return step === 0 ? "Ready: Alice and Bob have separate tasks in the project." :
        "Step " + step + " of " + count + ": " + labels[step - 1];
    }

    function render() {
      const staticMode = unavailable();
      const complete = frame === "static" || frame === "end";
      root.dataset.teamStoryCurrentStep = String(step);
      root.dataset.frame = frame;
      root.dataset.motionState = reducedMotion.matches ? "reduced" :
        staticMode ? "static" : playing ? "playing" : frame === "end" ? "complete" : "paused";
      const entering = [];
      items.forEach(function (item) {
        const itemStep = Number(item.dataset.teamStoryStep);
        const visible = complete || itemStep <= step;
        if (visible && !item.classList.contains("is-visible")) entering.push(item);
        item.classList.toggle("is-visible", visible);
        item.classList.toggle("is-current", !complete && itemStep === step);
      });
      if (frame !== "static" && window.LangSpanMotion) {
        entering.forEach(function (item) {
          window.LangSpanMotion.enter(item, {
            distance: item.classList.contains("team-story__connection") ? 0 : 6,
            duration: 0.32
          });
        });
      }
      controls.hidden = staticMode;
      play.disabled = staticMode;
      replay.disabled = staticMode;
      previous.disabled = staticMode || step === 0;
      next.disabled = staticMode || step >= count;
      play.setAttribute("aria-pressed", String(playing));
      play.setAttribute("aria-label", playing ? "Pause the team story" : "Play the team story");
      playLabel.textContent = playing ? "Pause" : "Play";
      progress.textContent = complete ? "Complete story" : "Step " + step + " of " + count;
    }

    function stop(shouldAnnounce) {
      clearTimer();
      if (window.LangSpanMotion) window.LangSpanMotion.settle(root);
      playing = false;
      render();
      if (shouldAnnounce) announce("Paused. " + stepMessage());
    }

    function showComplete(message) {
      clearTimer();
      if (window.LangSpanMotion) window.LangSpanMotion.settle(root);
      playing = false;
      step = count;
      frame = "static";
      render();
      if (message) announce(message);
    }

    function schedule() {
      clearTimer();
      timer = window.setTimeout(function () {
        timer = null;
        if (unavailable()) {
          showComplete(reducedMotion.matches
            ? "Complete story shown. Playback is unavailable with reduced motion."
            : "Complete static story shown.");
          return;
        }
        if (document.hidden || !playing) {
          stop(false);
          return;
        }
        step = Math.min(count, step + 1);
        if (step === count) {
          playing = false;
          frame = "end";
          render();
          announce("Story complete. Bob’s illustrated response reads the session file before editing login.");
          return;
        }
        frame = "step";
        render();
        schedule();
      }, hold);
    }

    function start(reset) {
      if (unavailable() || document.hidden) return;
      clearTimer();
      if (window.LangSpanMotion) window.LangSpanMotion.settle(root);
      if (reset || frame === "static" || frame === "end" || step >= count) step = 0;
      frame = "step";
      playing = true;
      render();
      announce("Playing the team story.");
      schedule();
    }

    function select(nextStep) {
      if (unavailable()) return;
      clearTimer();
      if (window.LangSpanMotion) window.LangSpanMotion.settle(root);
      playing = false;
      step = Math.max(0, Math.min(count, nextStep));
      frame = step === count ? "end" : "step";
      render();
      announce(stepMessage());
    }

    play.addEventListener("click", function () {
      if (playing) stop(true);
      else start(false);
    });
    previous.addEventListener("click", function () { select(step - 1); });
    next.addEventListener("click", function () { select(step + 1); });
    replay.addEventListener("click", function () { start(true); });

    root.addEventListener("keydown", function (event) {
      if (event.defaultPrevented || unavailable() || event.ctrlKey || event.metaKey || event.altKey ||
          event.target.closest("input, textarea, select, a, [contenteditable]")) return;
      if (event.key === "ArrowRight") select(step + 1);
      else if (event.key === "ArrowLeft") select(step - 1);
      else if (event.key === "Home") select(0);
      else if (event.key === "End") select(count);
      else if (event.key.toLowerCase() === "r") start(true);
      else if (event.key === " " && !event.target.closest("button")) {
        if (playing) stop(true);
        else start(false);
      } else return;
      event.preventDefault();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden && playing) stop(true);
    });
    window.addEventListener("pagehide", function () {
      if (playing) stop(false);
      else clearTimer();
    });
    reducedMotion.addEventListener("change", function () {
      if (reducedMotion.matches) {
        showComplete("Complete story shown. Playback is unavailable with reduced motion.");
      } else {
        showComplete(forcedStatic ? "Complete static story shown." : "Complete story shown. Play to follow the update.");
      }
    });

    try {
      if (unavailable()) {
        buttons.forEach(function (button) { button.disabled = true; });
        showComplete(reducedMotion.matches
          ? "Complete story shown. Playback is unavailable with reduced motion."
          : "Complete static story shown.");
      } else {
        const requestedStep = parameters.get("step");
        if (parameters.get("motion") === "step" && requestedStep !== null &&
            /^(0|[1-9][0-9]*)$/.test(requestedStep) && Number(requestedStep) <= count) {
          step = Number(requestedStep);
          frame = step === count ? "end" : "step";
        }
        render();
        announce(frame === "static" ? "Complete story shown. Play to follow the update." : stepMessage());
      }
      root.classList.add("motion-ready");
    } catch (_) {
      clearTimer();
      root.classList.remove("motion-ready");
      root.dataset.frame = "static";
      root.dataset.motionState = "static";
      controls.hidden = true;
      items.forEach(function (item) { item.classList.remove("is-visible", "is-current"); });
      announce("The complete story is shown.");
    }
  });
})();

