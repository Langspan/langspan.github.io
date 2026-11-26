/*
 * LangSpan: one local work record, carried into the next prompt.
 * Original implementation, informed by living-canvas's one-transformation,
 * still-frame and deterministic render(t) guidance (MIT):
 * https://github.com/shouvik12/living-canvas/tree/14a4a4f160d951d9745090a8c7f4822edd32bb18
 * No upstream runtime code is incorporated. All labels and the approved logo
 * remain in the page's accessible HTML; this canvas draws connections only.
 */
(() => {
  "use strict";

  const DURATION = 15;
  const SAMPLES = 96;
  const CORAL = "#D87859";
  const INK = "#3F3E44";
  const PAPER = "#F4F3EF";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const forceStatic = new URLSearchParams(window.location.search).get("motion") === "static";
  const instances = [];
  let globallyPaused = document.documentElement.dataset.motionPaused === "true";
  let pageSuspended = false;

  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Attach to the face looking toward the other card. Geometry is measured
  // from DOM bounds, so the same paths work in the stacked mobile composition.
  function port(box, other) {
    const dx = other.x + other.width / 2 - box.x - box.width / 2;
    const dy = other.y + other.height / 2 - box.y - box.height / 2;
    const gap = -1;
    if (Math.abs(dx) / (box.width + other.width) > Math.abs(dy) / (box.height + other.height)) {
      const direction = dx >= 0 ? 1 : -1;
      return { x: box.x + box.width / 2 + direction * (box.width / 2 + gap), y: box.y + box.height / 2, nx: direction, ny: 0 };
    }
    const direction = dy >= 0 ? 1 : -1;
    return { x: box.x + box.width / 2, y: box.y + box.height / 2 + direction * (box.height / 2 + gap), nx: 0, ny: direction };
  }

  function makeRoute(from, to) {
    const a = port(from, to);
    const b = port(to, from);
    const bend = Math.min(110, Math.max(24, Math.hypot(b.x - a.x, b.y - a.y) * 0.44));
    const x1 = a.x + a.nx * bend;
    const y1 = a.y + a.ny * bend;
    const x2 = b.x + b.nx * bend;
    const y2 = b.y + b.ny * bend;
    const path = new Path2D();
    path.moveTo(a.x, a.y);
    path.bezierCurveTo(x1, y1, x2, y2, b.x, b.y);
    const xs = new Float32Array(SAMPLES + 1);
    const ys = new Float32Array(SAMPLES + 1);
    for (let i = 0; i <= SAMPLES; i++) {
      const t = i / SAMPLES;
      const u = 1 - t;
      xs[i] = u * u * u * a.x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * b.x;
      ys[i] = u * u * u * a.y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * b.y;
    }
    return { path, xs, ys, a, b, angle: Math.atan2(ys[SAMPLES] - ys[SAMPLES - 2], xs[SAMPLES] - xs[SAMPLES - 2]) };
  }

  class SharedWorkCanvas {
    constructor(stage) {
      this.stage = stage;
      this.canvas = stage.querySelector("canvas[data-shared-canvas]");
      this.anchors = ["a", "hub", "b", "c"].map(name => stage.querySelector(`[data-flow-anchor="${name}"]`));
      this.ctx = this.canvas?.getContext("2d", { alpha: true });
      this.ready = Boolean(this.ctx && this.anchors.every(Boolean));
      if (!this.ready) return;
      this.toggle = stage.querySelector("[data-shared-canvas-toggle]");
      this.status = stage.querySelector("[data-shared-canvas-status]")
        || stage.closest("figure")?.querySelector("[data-shared-canvas-status]");
      this.canvas.setAttribute("aria-hidden", "true");
      this.canvas.style.pointerEvents = "none";
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.routes = [];
      this.elapsed = 0;
      this.startedAt = null;
      this.raf = 0;
      this.lastPhase = "";
      this.manual = false;
      this.manualTime = 0;
      this.manualPoster = false;
      this.localPaused = false;
      this.visible = !("IntersectionObserver" in window);
      this.frame = this.frame.bind(this);
      this.measure = this.measure.bind(this);
      this.toggleMotion = () => {
        this.localPaused = !this.localPaused;
        this.reconcile();
      };
      this.toggle?.addEventListener("click", this.toggleMotion);
      this.measure();
      this.resize = new ResizeObserver(this.measure);
      this.resize.observe(stage);
      for (const anchor of this.anchors) this.resize.observe(anchor);
      if ("IntersectionObserver" in window) {
        this.intersection = new IntersectionObserver(entries => {
          this.visible = entries[0].isIntersecting;
          this.reconcile();
        }, { threshold: 0.05 });
        this.intersection.observe(stage);
      }
      stage.dataset.canvasReady = "true";
      this.reconcile();
    }

    get static() {
      return forceStatic || reducedMotion.matches || this.stage.dataset.flowAutoplay === "false";
    }

    measure() {
      const bounds = this.canvas.getBoundingClientRect();
      this.width = bounds.width;
      this.height = bounds.height;
      if (!this.width || !this.height) return;
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      const boxes = this.anchors.map(element => {
        const box = element.getBoundingClientRect();
        return { x: box.left - bounds.left, y: box.top - bounds.top, width: box.width, height: box.height };
      });
      this.routes = [makeRoute(boxes[0], boxes[1]), makeRoute(boxes[1], boxes[2]), makeRoute(boxes[3], boxes[1])];
      this.draw(this.manual ? this.manualTime : this.elapsed / 1000, this.manual ? this.manualPoster : this.static);
    }

    stop() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
      if (this.startedAt !== null) this.elapsed = performance.now() - this.startedAt;
      this.startedAt = null;
    }

    reconcile() {
      const paused = globallyPaused || this.localPaused;
      if (this.static || paused || this.manual || !this.visible || document.hidden || pageSuspended) {
        this.stop();
        if (this.static && !this.manual) this.draw(0, true);
      } else if (!this.raf) {
        this.startedAt = performance.now() - this.elapsed;
        this.raf = requestAnimationFrame(this.frame);
      }
      if (this.toggle) {
        const label = this.toggle.querySelector("[data-shared-canvas-label]") || this.toggle;
        const text = this.static ? "Motion reduced" : paused ? "Play motion" : "Pause motion";
        if (label.textContent !== text) label.textContent = text;
        this.toggle.setAttribute("aria-label", text);
        this.toggle.setAttribute("aria-pressed", String(paused));
        this.toggle.disabled = this.static || globallyPaused;
      }
    }

    frame(timestamp) {
      this.elapsed = timestamp - this.startedAt;
      this.draw(this.elapsed / 1000, false);
      this.raf = requestAnimationFrame(this.frame);
    }

    drawRoute(route, color, alpha, width) {
      const ctx = this.ctx;
      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = width;
      ctx.stroke(route.path);
      // A small directional head keeps the complete still frame legible.
      ctx.save();
      ctx.translate(route.b.x, route.b.y);
      ctx.rotate(route.angle);
      ctx.beginPath();
      ctx.moveTo(-5, -3);
      ctx.lineTo(0, 0);
      ctx.lineTo(-5, 3);
      ctx.stroke();
      ctx.restore();
    }

    drawNotice(route, progress, alpha) {
      if (alpha <= 0) return;
      const ctx = this.ctx;
      const position = clamp(progress) * SAMPLES;
      const index = Math.min(SAMPLES - 1, Math.floor(position));
      const fraction = position - index;
      const x = route.xs[index] + (route.xs[index + 1] - route.xs[index]) * fraction;
      const y = route.ys[index] + (route.ys[index + 1] - route.ys[index]) * fraction;
      const tail = Math.max(0, index - 15);
      ctx.globalAlpha = alpha * 0.7;
      ctx.strokeStyle = CORAL;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(route.xs[tail], route.ys[tail]);
      for (let i = tail + 1; i <= index; i++) ctx.lineTo(route.xs[i], route.ys[i]);
      ctx.lineTo(x, y);
      ctx.stroke();

      // A file notice, not an abstract particle. Its orientation stays upright.
      ctx.globalAlpha = alpha;
      roundRect(ctx, x - 9, y - 11, 18, 22, 4);
      ctx.fillStyle = PAPER;
      ctx.fill();
      ctx.strokeStyle = CORAL;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 3);
      ctx.lineTo(x + 3, y - 3);
      ctx.moveTo(x - 4, y + 1);
      ctx.lineTo(x + 4, y + 1);
      ctx.moveTo(x - 4, y + 5);
      ctx.lineTo(x + 1, y + 5);
      ctx.stroke();
    }

    phase(name, text) {
      if (this.lastPhase === name) return;
      this.lastPhase = name;
      this.stage.dataset.flowPhase = name;
      if (this.status) this.status.textContent = text;
    }

    // Drawing depends only on time and the measured geometry. There is no
    // frame-carried particle state or randomness, so capture can seek exactly.
    draw(seconds, poster) {
      if (this.routes.length !== 3 || !this.width || !this.height) return;
      const ctx = this.ctx;
      ctx.globalAlpha = 1;
      ctx.fillStyle = PAPER;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 0; i < 3; i++) this.drawRoute(this.routes[i], INK, 0.2, 1.4);
      if (poster) {
        this.drawRoute(this.routes[0], CORAL, 0.65, 1.6);
        this.drawRoute(this.routes[1], CORAL, 0.65, 1.6);
        this.drawNotice(this.routes[0], 0.52, 1);
        this.drawNotice(this.routes[1], 0.56, 1);
        this.phase("complete", "A local work record carries related changes into the next prompt.");
      } else {
        const t = ((seconds % DURATION) + DURATION) % DURATION;
        const ending = 1 - ease((t - 13.4) / 1.6);
        if (t >= 0.6) this.drawRoute(this.routes[0], CORAL, 0.37 * ending, 1.6);
        if (t >= 4.5) this.drawRoute(this.routes[1], CORAL, 0.37 * ending, 1.6);
        if (t >= 9.6) this.drawRoute(this.routes[2], CORAL, 0.24 * ending, 1.6);
        if (t >= 0.6 && t < 3.6) {
          const p = (t - 0.6) / 3;
          this.drawNotice(this.routes[0], ease(p), ease(p / 0.12) * (1 - ease((p - 0.88) / 0.12)));
        }
        if (t >= 4.5 && t < 7.7) {
          const p = (t - 4.5) / 3.2;
          this.drawNotice(this.routes[1], ease(p), ease(p / 0.12) * (1 - ease((p - 0.88) / 0.12)));
        }
        if (t >= 9.6 && t < 12.3) {
          const p = (t - 9.6) / 2.7;
          this.drawNotice(this.routes[2], ease(p), ease(p / 0.12) * (1 - ease((p - 0.88) / 0.12)));
        }
        if (t < 3.6) this.phase("notice", "A file update enters shared context.");
        else if (t < 4.5) this.phase("shared", "LangSpan keeps the local work record.");
        else if (t < 9.6) this.phase("prompt", "The next prompt receives related work.");
        else if (t < 12.3) this.phase("related", "Other sessions keep moving.");
        else this.phase("complete", "Your tools. A shared view of the work.");
      }
      ctx.globalAlpha = 1;
    }

    destroy() {
      this.stop();
      this.resize?.disconnect();
      this.intersection?.disconnect();
      this.toggle?.removeEventListener("click", this.toggleMotion);
    }
  }

  for (const stage of document.querySelectorAll("[data-shared-canvas-stage]")) {
    const instance = new SharedWorkCanvas(stage);
    if (instance.ready) instances.push(instance);
  }
  if (!instances.length) return;

  function reconcileAll() {
    for (const instance of instances) instance.reconcile();
  }
  function onMotion(event) {
    if (typeof event.detail?.paused !== "boolean") return;
    globallyPaused = event.detail.paused;
    reconcileAll();
  }
  function onPageHide() { pageSuspended = true; reconcileAll(); }
  function onPageShow() { pageSuspended = false; reconcileAll(); }
  window.addEventListener("langspan:motion", onMotion);
  window.addEventListener("pagehide", onPageHide);
  window.addEventListener("pageshow", onPageShow);
  document.addEventListener("visibilitychange", reconcileAll);
  reducedMotion.addEventListener("change", reconcileAll);

  window.LangSpanCanvas = Object.freeze({
    duration: DURATION,
    // Seconds, not milliseconds. Seeking pauses live animation until resume().
    render(seconds) {
      if (!Number.isFinite(seconds)) return;
      for (const instance of instances) {
        instance.stop();
        instance.manual = true;
        instance.manualTime = seconds;
        instance.manualPoster = false;
        instance.draw(seconds, false);
      }
    },
    poster() {
      for (const instance of instances) {
        instance.stop();
        instance.manual = true;
        instance.manualPoster = true;
        instance.draw(0, true);
      }
    },
    pause() {
      globallyPaused = true;
      reconcileAll();
    },
    resume() {
      globallyPaused = false;
      for (const instance of instances) instance.manual = false;
      reconcileAll();
    },
    destroy() {
      for (const instance of instances) instance.destroy();
      window.removeEventListener("langspan:motion", onMotion);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", reconcileAll);
      reducedMotion.removeEventListener("change", reconcileAll);
      delete window.LangSpanCanvas;
    }
  });
})();
