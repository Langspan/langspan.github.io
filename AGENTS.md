# LangSpan website context

Read [docs/launch-readiness.md](docs/launch-readiness.md) and [website maintenance](docs/website-maintenance.md) for the product story, current claims,
implementation evidence, local preview and review process.
The current redesign's rationale, provenance and verification belong in
[docs/marketing-overhaul.md](docs/marketing-overhaul.md).

## Design workflow

Use Impeccable for page and UI work alongside LangSpan's brand voice.
Use the installed `impeccable-product-pages` guidance or an available
`impeccable` skill. If neither is available, read the
[pinned upstream skill](https://github.com/pbakaus/impeccable/blob/b49177d32788f2dc585c42831d845dacf1ebed2c/.agents/skills/impeccable/SKILL.md)
and the relevant playbook in its `reference/` directory.
Use existing project context when optional tooling cannot run.

Treat the marketing page as a Persuade surface: explain the coordination
problem, show a useful example and help visitors choose their next step.

For a substantial change, critique the section being changed, then refine
the relevant layout, typography, copy or interaction. Use audit and adapt
checks for accessibility, performance and screen sizes. Finish with polish
and inspect the rendered result at desktop and narrow sizes. Scale the
review to the change and report only checks actually performed.

## Brand and product basis

The maintenance guide's “Brand and product basis” section supplies the existing direction.
Use the [approved brand assets](assets/brand/README.md) without redrawing them.
Keep the warm-white, near-black, slate and coral identity.
The mission is to help teams keep building together as their agents write more code.
Distinguish authored illustrations, observed behavior and outcomes
the product still needs to demonstrate.
Use the core repository's current mission, implementation status and retained
evidence for product claims. Its published binary availability and live-host verification are
different statements; local edit checks and remote awareness have different
scope. Older status notes do not override newer retained evidence.

The product-first homepage leads with an inspectable local refusal, verbatim agent messages, a signature-change example, the released dashboard and setup. The original technical guide at technical.html retains the topology, research, six-capability explorer, architecture, recorded evidence and benchmark. `marketing/parallel-story.json` is the canonical scale/semantic/source-awareness/research narrative. `review/source-awareness-proof.mjs` verifies the local argument-count alert path on the released binary with synthetic events. Do not conflate name matching with resolved dependencies, the advisory alert with refusal, or the rename roadmap with the released capability. `assets/parallel-story.js` exposes a deterministic seek contract, and `review/semantic-git-example.mjs` reproduces a clean Git merge with failing combined tests. Do not represent the scale illustration or the hypothetical briefing-assisted recovery as a measured LangSpan outcome. The original collision demonstration is retained inside the edit tab. The expanded scenes are owned by marketing/story.json and rendered by demo-src/CapabilityExplorer.tsx using the same vendored Stageshow kit. Keep static fallbacks and per-capability evidence synchronized. Motion explains work and context, not fake agent actions.

## Source and delivery

GitHub Pages serves static HTML, CSS and JavaScript; the whole site has no
build step. The Stageshow demonstration is a React island built separately
from `demo-src/` into the committed `assets/coordination-demo.js`. Read its
[guide](demo-src/README.md) before changing that component. Rebuild with
`npm ci --ignore-scripts` and `npm run build` inside `demo-src`, and keep its
source, generated asset and dependency provenance together.

The hero's `assets/shared-work-canvas.js` is original code informed by
living-canvas. Page transitions use the locally included Motion mini. Preserve
upstream licences and distinguish actual vendored components from design
guidance. Edit the source files identified in the maintenance guide.
Keep content readable without JavaScript, with keyboard controls and reduced motion.
Check visible playback and pause behavior as well as static screenshots.
Earlier validation documents describe earlier page versions; record the
checks actually run for this revision in `docs/marketing-overhaul.md`.
Use the existing preview and pull-request workflow.
A design refinement follows the established identity and requested scope.
