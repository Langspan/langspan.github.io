# Marketing page: shared awareness in motion

Reviewed November 25, 2026.

## Design decision

The previous page had a sound mission but asked visitors to read several
explanations before seeing the useful coordination behavior. This redesign
leads with a visible shared-work story, follows it with one substantial
interactive example, and then explains where LangSpan fits and how to try it.

The page keeps the approved headline, **Your agents. On the same page.**
The primary audience is a team building connected parts of a project with
coding agents. One person running several agents remains a useful entry point.

The sequence is:

1. A split hero: product promise beside three agent sessions and the local
   LangSpan hub. A file update reaches another session's next prompt.
2. The recognizable team problem: “I'll take that.” / “It's already done.”
3. A dark, focused Stageshow demonstration: A holds a file, B's overlapping
   request is refused, B chooses a different test file, and separate work can
   continue. A is still working in the final frame.
4. Three scopes: one checkout, separate worktrees, and opt-in updates between
   machines. These are different coordination boundaries.
5. The mission: keep people contributing expertise and review while their
   agents write more code.
6. Source setup, evidence, practical questions, and a clear next action.

The supplied logo paths and outlined wordmark remain unchanged. The palette
uses warm white `#F4F3EF`, near-black `#151513`, slate `#3F3E44` and coral
`#D87859`. Darker coral text and muted text variants preserve readability.
Typography, spacing and motion follow the installed Impeccable guidance.

## Motion sources and implementation

### Stageshow

The primary demonstration uses actual selectively vendored React components
from [benjitaylor/skills](https://github.com/benjitaylor/skills/tree/299140fafd08df55a9c234e610c3f64af3f45531/stageshow),
pinned to `299140fafd08df55a9c234e610c3f64af3f45531`.

`Stage`, `Window`, `Prompt`, `Code`, `Roll` and `Collapse` supply the scene
composition and motion primitives. A documented controlled-state extension
lets the LangSpan scene own its playback clock. Source, licenses, hashes and
build instructions are in [demo-src](../demo-src/README.md).
No third-party product logos or upstream example artwork are included.

The built `assets/coordination-demo.js` is self-contained and loaded only as
the section approaches the viewport. Its current gzip size is approximately
102 KB. React, ReactDOM and esbuild are pinned in the lockfile. The source
build is isolated to this component; GitHub Pages serves committed static
files without a build step.

The demonstration plays once over 14.3 seconds and ends on the complete
outcome. Play/Pause, Replay and four manual scene buttons remain available.
Reduced motion and `?motion=static` show the complete poster with manual steps.
A separate compact composition stacks the actors instead of shrinking the
wide scene into an unreadable miniature.

### living-canvas

The hero is an original implementation informed by the
[living-canvas skill](https://github.com/shouvik12/living-canvas/tree/14a4a4f160d951d9745090a8c7f4822edd32bb18),
pinned to `14a4a4f160d951d9745090a8c7f4822edd32bb18`.
It follows the skill's one-transformation story, readable-still-frame and
deterministic-render guidance. No upstream runtime code is copied.

`assets/shared-work-canvas.js` draws paths and moving file notices between
measured DOM anchors. The labels and approved artwork remain in HTML. The
15-second sequence shows a local work update, its delivery at another
session's next prompt, and independent activity in the same project.

The renderer caps device pixel ratio at 2, caches geometry, pauses offscreen
or when the document is hidden, and renders a complete static state for
reduced motion. It exposes `window.LangSpanCanvas.render(seconds)` for
deterministic future captures; no video export is included in this change.

### Motion

The existing locally vendored Motion mini 14.14.0 adds restrained section
entrances. Elements are never hidden by default. The persistent header control
pauses the canvas, demonstration and active entrance effects together. The
choice is remembered for the browser tab's session. Reduced-motion preference
and the explicit static URL take precedence over automatic playback.

## Product truth

Copy was checked against core commit
[`0cc300b9ba8d6be5662205b4a8415812b90fe958`](https://github.com/Langspan/LangSpan.dev/tree/0cc300b9ba8d6be5662205b4a8415812b90fe958),
especially [mission](https://github.com/Langspan/LangSpan.dev/blob/0cc300b9ba8d6be5662205b4a8415812b90fe958/docs/mission.md),
[implementation status](https://github.com/Langspan/LangSpan.dev/blob/0cc300b9ba8d6be5662205b4a8415812b90fe958/docs/IMPLEMENTATION_STATUS.md),
[usage](https://github.com/Langspan/LangSpan.dev/blob/0cc300b9ba8d6be5662205b4a8415812b90fe958/docs/usage.md),
and the CLI definitions. The release list was empty during the audit.

- Both major visuals are authored illustrations, not recordings or evidence
  of measured productivity gains. They do not contact agents or a daemon.
- The refusal example is a supported edit in one checkout while a valid hold
  exists. Host permissions remain in charge of execution.
- The agent chooses a different task. LangSpan does not invent or assign it.
- Arbitrary shell writes and edits approved after expiry can still proceed.
- Remote Git-ref sharing is opt-in and advisory. It never supplies a local
  denial. The page does not imply a streaming cross-machine lock service.
- Native Claude Code and Codex evidence exists, but simultaneous mixed-host
  conflicts and comparative team outcomes remain unverified. Cursor
  live-host verification and a repeat Antigravity run remain open.
- Current status reports additional linked-worktree behavior; the website
  no longer repeats the older blanket statement that all live worktree use
  is unverified. The implementation status holds the evidence distinctions.
- The installation path is a Linux/macOS source build. There is no invented
  binary download or Homebrew command.

## Verification performed

- Production Stageshow bundle rebuilt successfully with the pinned source
  dependencies; all three new/updated JavaScript entry points pass syntax
  checks.
- Local asset targets and fragment links resolve; one H1 and no duplicate
  IDs were found. The approved brand directory matches the baseline Git blob
  hashes byte-for-byte.
- Browser review covered the desktop layout and 390px, 320px and 768px frame
  layouts. The narrow frames include browser scrollbars and are layout
  emulations, not claims of physical iPhone or Android testing.
- The 320px and 768px frame checks found no horizontal document overflow.
- Tested manual scene selection, replay, local pause, global pause and resume.
  The header pause set `data-motion-paused=true` and stopped the demo clock.
- Tested the source setup tabs with mouse and ArrowLeft keyboard navigation.
  Copied the daemon command and read back the exact clipboard value.
- Verified `?motion=static` shows the completed scene and keeps manual scene
  selection available. A sandboxed iframe with scripts disallowed retained
  readable product copy, the complete static coordination example, both
  setup commands and native disclosures.
- Fixed an observed compact-scene clipping issue. The host-permission note
  now ends approximately 9px inside Agent A's terminal at the reviewed 390px
  frame size.
- An independent source review found and resolved stale fallback wording and
  insufficient contrast in informative notes and controls.

The operating system's reduced-motion setting and physical mobile devices
were not changed or tested. The explicit static route, source logic and
canvas lifecycle harness cover the fallback path. The upstream Stageshow
Playwright film script was not run; browser inspection used the environment's
approved browser tool. Browser extension metadata errors were present in the
review environment and are separate from page code.

## Maintenance

Edit the page in `index.html`, layout in `assets/site.css`, and page controls
in `assets/site.js`. Rebuild the demonstration after editing `demo-src`:

```sh
cd demo-src
npm ci --ignore-scripts
npm run build
```

Commit the generated bundle alongside its source. Do not publish development
dependencies, local preview wrappers or baseline snapshots. The older
team-story assets remain in repository history/context but are no longer
loaded by the page. CNAME and the existing Pages hosting remain unchanged.

## Semantic awareness refinement

Add a source-aware coordination section between the clean-merge problem and external research. The original semantic-conflict repair remains a hypothetical illustration. Use a same-checkout TypeScript signature change with a mismatched argument count, grounded in v0.1.0 ADRs 0008 and 0029 and the tagged break-alert tests. The HTML/SVG illustration is a finite one-shot reveal using existing visibility and motion controls; all labels and conclusions remain present without scripts. The source index matches names, not resolved dependencies; the resulting alert is advisory. The four-part architecture groups semantic awareness and coordination inside LangSpan, leaving execution and verification in the existing workflow. The six existing Stageshow scenes, hero, media, release downloads and real dashboard evidence are preserved. The release-binary review exercises the new illustrated signature change in an isolated temporary Git project with constructed hook events. It checks admission, real advisory context, once-per-notice behavior and a compatible call that does not alert. No model runs; the script does not execute or repair the proposed caller. Validate the canonical story, five widths, accessibility, global/reduced motion, no-script fallback, binary scenario and production deployment. Do not claim a live-host rename or cross-worktree symbol demonstration.

## Experience refinement — November 25, 2026

The approved preview extends the existing homepage rather than replacing the
production Stageshow island. The brand SVGs, 2/6/10 topology, original semantic
Git reproduction, six capability scenes, dashboard evidence, film, release
archives and current installation steps remain intact.

- The hero names the engineering outcome and uses concrete developer language.
- Semantic scope controls distinguish released local argument-count notices,
  proposed linked-worktree signatures (#44), and exploratory cross-machine
  semantic metadata (not included in #44).
- Architecture scope and evidence selection expose the boundaries of each
  implementation and observation.
- The benchmark explorer models the proposed K1 protocol (#172): 2, 5, 10
  sessions, five task families, three comparison arms, one integration oracle,
  a seekable 12-second protocol, selectable metric definitions, and an
  illustrative manifest with null results. No benchmark runs in the browser.
- The planned setup preview (#159) only illustrates the proposed workflow. The
  existing released setup remains the only installation instructions.

The new enhancements live in assets/experience.css and assets/experience.js.
They use the existing brand tokens and locally vendored Motion mini for
short state transitions, plus deterministic browser playback for the protocol.
Stageshow's generated bundle and vendored source are unchanged. The benchmark
scene is original browser code informed by the previously reviewed Stageshow,
Living Canvas, Better Motion and Impeccable guidance, not a new Stageshow React
component. No new external dependencies or remote scripts are introduced.

The review suite now exercises the new selectors, unmeasured outcomes, scope
changes, manifest, setup, reduced motion and no-JavaScript fallback. Repository
CI is the required rendered-browser validation; the implementation environment
cannot clone GitHub or retrieve the production bundle over its network. Do not
claim a fresh passing production build until the branch checks complete.

## Source-build copy refresh — November 26, 2026

Compared website commit 0f4e1788 with core commit efa5f8b7.
The latest published binary remains v0.1.0. Update the existing semantic
scope, dashboard proof, benchmark, verification and setup copy without
changing styling, layout, animation clocks or the generated Stageshow bundle.
Preserve released evidence and distinguish implementation on main from a
released capability. K1's implemented task families are rename_vs_new_caller
and contradictory_defaults; the worktrees arm now uses isolated clones.
The first 12-trial pilot did not establish efficacy, and dry runs are not
model evidence. No results are invented. The setup preview no longer shows
the unpublished Homebrew tap as an installation step. Keep the v0.1.0
installation path unchanged. Sources: core PRs #178, #179, #180, #184,
#197, #190, #192, #199 and #183; benchmark README, tasks.py and ADR 0035.

## Checklist Design refinement — November 26, 2026

Reviewed the current deployed design using PR #27's retained desktop and mobile
browser captures and the pinned Checklist Design landing page, tabs,
accordion, spacing/grid and accessibility checklists. Preserve the established
hero, brand, real product evidence and primary installation action.

Three narrow changes: a native compact navigation disclosure restores links
at tablet and mobile widths; the benchmark heading explicitly describes the
experiment rather than implying established results; stacked semantic and
benchmark illustrations use readable relation labels in place of orphaned
horizontal connectors. Desktop animation layouts and clocks are untouched.

Existing raw evidence, release labels, canonical story and generated Stageshow
bundle are unchanged. Source-level checks passed on the local prototype.
This environment blocked both localhost and file URL navigation in Chromium,
so fresh candidate visual and browser validation has not completed. The
existing browser suite now checks navigation availability, target size,
keyboard dismissal, viewport geometry and compact diagram states.
Do not claim the new page has passed rendered review before the checks run.

## v0.2.0 release refresh

The release tag dc6df450f44b9146f0156563bd658c69ab4be5d4 publishes the four supported binary archives, SBOMs, checksums and provenance. Keep historical v0.1.0 recordings unchanged. Present released semantic awareness, baseline-aware checks, LangSpan Live and one-command setup. The K1 comparison has three families; its LangSpan condition uses linked worktrees and one local coordinator. Neither the pilots nor dry runs establish comparative effectiveness. The newest fixture hardening and hookless check-write command are on main only.

The new demo asset is assembled using exactly the v0.2.0 dashboard page, built-in demo-scenes file and official SVG lockups according to dashboard.rs. The release verification job compares those bytes against the actual published binary's response, runs the real demo renderer, and saves captures. The iframe is sandboxed and the demo never polls the coordinator; its data is fictional and labeled. Actual v0.1.0 hook evidence remains separately available.

## Live release metadata

The permanent release CTA follows `/releases/latest`. An unauthenticated, bounded request to the public GitHub API updates the displayed tag and the complete platform/checksum link set, with a validated stable SemVer tag and uploaded assets. No token, new server, duplicate archives or cross-repository workflow is required. The static HTML retains the last reviewed v0.2.0 downloads, including matching checksums, for offline, rate-limited and no-JavaScript visits. Do not replace versioned evidence or product feature claims automatically. Browser regression tests simulate a new stable release, invalid/incomplete releases and rate limits.

## Product-first homepage

The approved shorter preview becomes the main page: inspect a local refusal, read the exact agent messages, try a signature change, explore the released dashboard, and install. The original full technical walkthrough and Stageshow bundle remain unchanged in substance; old technical hashes route to technical.html. The screenshot is the published v0.2.0 binary's labeled simulated demo, with its hash recorded in the media manifest. The website README is a public pointer; maintenance guidance is in docs/website-maintenance.md. No product performance results or unpublished installer claims.

## First-run and inspector refinement

The approved product-first layout remains. The original two recorded messages move into a single selectable hero disclosure, with byte-identical source text and a no-JavaScript fallback. The existing signature example adds the documented v0.2.0 linked-worktree rename notice, explicitly illustrative. The platform downloads and combined binary-install/setup command are visible immediately after the hero; verification remains linked, not omitted. Research and benchmark details stay in technical.html. No unpublished installer or comparative efficacy claim. Browser tests check the new inspector selection, original hashes, both semantic examples and direct release links; retain existing technical checks.

## Trust fixes and social card — 26 November 2026

Section E and C4 of the site review. What changed:

- Hosts. Every page names the same four hosts: Claude Code, Codex, Cursor and
  Antigravity. `technical.html#hosts` holds the evidence level for each, and
  the home page links to it. Gemini CLI no longer appears in public copy.
- Proof chips. One chip style with three words: **Recorded** (verbatim text
  from a real session, linked to its evidence file), **Simulated** (LangSpan
  Live's built-in demo data) and **Illustration** (authored, not a run).
  `assets/proof.css` owns the style. The home page hero switches between
  Recorded and Illustration with its step.
- Social card. `assets/product/social-card.png` is 1280×640 and shows the
  tagline, the recorded refusal line and the lockup, with no version number.
  `og:image` and `twitter:image` both name it.
- Versions. Version text on a page is marked `data-release-version` or
  `data-release-number`, so `assets/latest-release.js` keeps it current.
- Anchors. Markdown links to `langspan.dev/#…` sections that live on the
  technical guide now point to `technical.html#…`.
- Wording. "Local by default" replaces "Local-first"; dates read
  25 November 2026; the benchmark heading says "No published result yet";
  visible copy no longer names the animation kit.
- Legibility. No visible text is smaller than 11 px at 390 or 1440 px. The
  phone menu stays on screen at 358 px.

`review/link-check.mjs` checks anchors, version text, hosts and the card's
declared size, with no dependencies. The launch review workflow runs it.

Checks run on this revision, locally with Playwright 1.65.1 and Chromium:
`node review/link-check.mjs`, `node review/site-check.mjs` (all passes),
`node review/check-parallel-story.mjs`, `node review/semantic-git-example.mjs`,
`sh tools/assemble-site.sh`, `node marketing/scripts/social-card.mjs`, and a
render of `index.html` and `technical.html` at 390 and 1440 px in light and
dark color schemes: no horizontal scroll, no console errors, no text under
11 px and no unresolved in-page anchor.

## Layered home page — 26 November 2026

Sections A, B, C1 to C3 of the site review, with the owner's decisions 1 to 9.

- Order: hero, the problem, what each agent sees, get started, LangSpan Live,
  what runs where and what's verified, questions, go deeper. Get started comes
  before LangSpan Live. The page stops at eight sections and hands off to
  `technical.html` by name.
- Hero: the tagline is the H1. A facts row (runs on your machine, no account,
  Apache-2.0, version and platforms) and the four hosts sit under the
  buttons. Until an install script exists, the hero shows the button and no
  command.
- Hero loop: HTML, CSS and JavaScript. `assets/product-first.js` holds an
  equal copy of `marketing/motion/hero-loop/timing.json` and draws every frame
  from one `renderAt(t)`. It plays three 10-second loops, then holds on the
  recorded refusal with Replay. The step buttons seek and pause; reduced
  motion and `?motion=static` show the refusal frame; without JavaScript the
  refusal frame is the markup's default. `window.LangSpanHero` exposes
  `element`, `timing` and `renderAt` for the phone cut.
- Under 480 px the message card leads the loop, three dots replace the step
  tabs, and the interface example stacks with 13 px code. Under 600 px the
  dashboard shows two 1:1 crops of the v0.2.0 capture (the counts and the
  Refused edits block) instead of the shrunken screenshot.
- Questions: six collapsed answers that state the limits once. The evidence
  section shows "Local by default" and the host table.

Checks run on this revision, locally with Playwright 1.65.1 and Chromium:
`node review/link-check.mjs`, `node review/site-check.mjs` (release links,
the home page at five widths in light and dark, the technical page), and a
render of `index.html` and `technical.html` at 390 and 1440 px in light and
dark: no horizontal scroll, no console errors, no text under 11 px, no
unresolved anchor. At 390 × 844 the hero panel is 370 px tall and the recorded
refusal line starts at y = 636. The hero's `timing.events`, `easing` and
`holds_s` equal those in the timing file from pull request #35. Not checked:
playback on a real phone, and the phone cut's own render and freeze checks.

## Home page, revision 2 — 27 November 2026

Implements the owner-approved wireframe for langspan.github.io#39 and fixes
#40, with the owner's later direction on tone: no hedging in body copy, every
limit stated once in the questions, no placeholders and no dates on the page.

- Sections: hero, thesis and stages, what Git doesn't see (four scenes and
  Try it), how it works, across computers, works with, get started, open
  source, questions, for agents, closing.
- The proof section stays in `index.html` inside a comment until the
  benchmark publishes real numbers (LangSpan.dev #495, results from #172).
  The scenes that have no real recording (heard a change, rename held,
  checked before merging) are left out.
- Hero: LangSpan Live's "Now" view loops a slice of LangSpan's own agents:
  two Claude Code sessions in one checkout and a third in its own worktree
  (a quiet lane, word cards only). There is no caption, label or date; the
  real repository, branch and file paths show that it is a real session
  (owner decision, 27 November 2026, recorded in the motion standard). The slice is
  `assets/evidence/hero-slice-2026-11-25.json`, exported read-only from the
  dogfood coordinator's event log on 25 November 2026, 19:56:19 to 19:57:53
  (seq 29121 to 29290, plus 28584). It keeps seq, type, time, paths, lane
  labels, the tool of an observed operation, the origin of a source
  observation, the other lane of a held write or a message, and the
  repository, and each lane's branch and checkout kind. It drops prompts, message text, digests, session,
  lease, operation and workspace IDs, symbols and line ranges, workspace
  roots and home paths, events of other sessions, and events that name no
  session. Each card cites its seq numbers in `data-seq`; the timing file
  cites them per event.
- The hero is hand-built HTML and SVG with no new dependency. At 1280 px and
  wider, time runs left to right and the inspector sits over the right of
  the canvas; below that, time runs top to bottom in three lane columns, with
  the inspector beside the canvas or, under 760 px, under it. The canvas
  controls are Pause, zoom in, zoom out, Fit and Follow newest (on by
  default); dragging pans. Reduced motion, `?motion=static` and a page
  without JavaScript show the final frame.
- Timing: `marketing/motion/hero-loop/timing.json` is a 12-second clock at
  30 fps (360 frames) that loops while the hero is on screen.
- #40: the version shows the latest release (v0.8.0 until
  `assets/latest-release.js` reads a newer one), and the host table and the
  technical guide's host states match the product README.
- The phone-cut check treats a small card entrance like a feedback change:
  when no frame-to-frame change reaches the freeze detector's floor, a
  declared hold may run through it, and the entrance must still change the
  decoded pixels.
