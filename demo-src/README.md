# LangSpan coordination illustration

A small React island for the otherwise static marketing site. It uses actual
vendored Stageshow components, with a locally controlled timeline, and compiles
to the single browser asset `assets/coordination-demo.js`.

## Story

Two independent agent sessions share one checkout. Agent A has an active
admission for `src/auth/session.ts`. B requests that file and receives a denial.
B independently chooses `tests/session.test.ts`; the new request is admitted.
The final frame leaves both pieces of work visible.

This is an authored illustration, not a recording or literal CLI output.
The scene does not imply automatic replanning, remote enforcement, a filesystem
lock, or a guarantee that every write is coordinated. The agents' hosts still
control permissions and execution.

## Build

```sh
cd demo-src
npm ci --ignore-scripts
npm run build
```

The lockfile pins React, ReactDOM and esbuild. No remote script, font, analytics,
image service or CDN is used by the component. Production needs only the built
bundle and the existing `assets/brand/langspan-icon-dark.svg` brand asset.
Use `demo-src/preview.html` from the site root's local HTTP server for an isolated
preview. A modern browser is required for the enhancement; the HTML fallback is
left visible if required observers are unavailable or rendering fails.

## Mount and host contract

- Add an element with ID `coordination-demo`, containing a useful static HTML
  fallback. The bundle appends a React mount beside it. Only a successful mount
  hides the fallback. An error restores it.
- Load `assets/coordination-demo.js` with `defer`, or lazily as the demo approaches
  the viewport. All CSS is contained in the bundle and scoped to the demo or the
  vendored kit's `ss-` classes.
- Use the page's dark `#151513` background. The demo is at most 1100px wide.
  The wide edit stage is 1100×550px; below 840px it changes to a stacked
  layout, 286–620px wide and 710px high. The capability stages are 1100×465px
  or 680px high in compact mode. Host framing is in assets/motion-polish.css. Controls and captions sit outside the
  scale-to-fit stage. Reserve room for the fallback before lazy loading.
- Playback begins at 35% visibility and repeats the four beats over
  14.3 seconds, holding the last beat before restarting. It pauses when hidden or offscreen.
  Play/Pause, Replay and manual step buttons remain visible. Manual selection
  pauses autoplay.
- `?motion=static` and `prefers-reduced-motion: reduce` show the completed poster.
  Manual steps still work without animation.
- To pause from a page control, dispatch
  `window.dispatchEvent(new CustomEvent('langspan:motion', {detail: {paused}}))`.
  Also set `document.documentElement.dataset.motionPaused = String(paused)`
  before loading the bundle, so it receives the initial page state.

## Stageshow provenance

Source: [benjitaylor/skills, Stageshow](https://github.com/benjitaylor/skills/tree/299140fafd08df55a9c234e610c3f64af3f45531/stageshow),
pinned to `299140fafd08df55a9c234e610c3f64af3f45531`.

The implementation uses `Stage`, `Window`, `Prompt`, `Code`, `Roll` and
`Collapse`, and their source dependencies. Their original MIT license is in
`vendor/stageshow/LICENSE`; upstream artwork notices are preserved in
`vendor/stageshow/NOTICE.md`. No upstream product logos, photographs or brand
registry artwork are bundled. The generated JS carries the Stageshow, React,
ReactDOM and Scheduler license notices.

`vendor/stageshow/kit/stage.tsx` has one documented local extension: the
`controlled` state prop. It lets the host own an accessible, seekable timeline
while the kit retains responsive composition, chrome and motion primitives.
The remaining vendored files match the pinned upstream source. The full source
manifest and hashes are in `UPSTREAM.json`.

Closest gold references studied: `examples/subscriptions` for a causal system
story without a cursor, `examples/presence` for persistent actor identity, and
the terminal `Window` recipe. LangSpan's content, composition, brand, controls
and responsive scene are original to this implementation.

See `REHEARSAL.md` for the verification status and the remaining visual checks.
