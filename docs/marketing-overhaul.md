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
  conflicts and comparative team outcomes remain unverified. Cursor and
  Gemini CLI live-host verification remains open.
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
