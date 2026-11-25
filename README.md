<img src="assets/brand/langspan-lockup-light.svg" alt="LangSpan" width="288" height="80">

# Your agents. On the same page.

The [LangSpan product website](https://langspan.dev/). LangSpan gives a
team's coding agents a shared view of work in progress. The goal is to help
people build connected parts of a project with less avoidable repair and less
manual relay between their sessions.

<a href="https://langspan.dev/#demo">
  <picture>
    <source media="(max-width: 600px)" srcset="assets/product/langspan-overview-compact.svg">
    <img src="assets/product/langspan-overview.svg" alt="LangSpan holds a file for Agent A, denies Agent B’s overlapping edit, and leaves an unrelated test file available." width="1400">
  </picture>
</a>

*An authored illustration of local coordination. The brief animation settles into
the complete picture; reduced motion shows that picture immediately.
[Explore each step](https://langspan.dev/#demo) with Play, Pause and Replay.*

## Follow the team story

The page makes shared awareness visible before introducing the machinery:

1. **Shared work.** The hero shows work moving between agent sessions through
   an original canvas illustration informed by living-canvas. Its labels and
   meaning remain in ordinary HTML.
2. **A familiar problem.** One person's swarm moves ahead of the team's
   awareness, and teammates step aside to avoid interference.
3. **A concrete interaction.** A Stageshow demonstration follows two agents in
   one checkout. Agent A holds `src/auth/session.ts`; Agent B's overlapping
   request is refused. B independently chooses `tests/session.test.ts`, and
   that request can proceed.
4. **Where it fits.** One checkout, linked worktrees and other machines each
   have a different coordination scope. Local edit checks and opt-in remote
   awareness are explained separately.
5. **Why it matters.** The mission is to keep people contributing to connected
   work as their agents write more code.
6. **A useful next step.** Source-preview setup and the FAQ explain how to
   connect existing sessions and what the current coverage includes.

The primary demonstration uses a selectively vendored Stageshow React kit,
including `Stage`, `Window`, `Prompt`, `Code`, `Roll` and `Collapse`. It is an
authored product illustration, not a session recording, literal CLI output or
measured result. Its generic Agent A/B labels do not imply a verified
simultaneous Claude Code/Codex conflict. LangSpan does not choose B's next task.

The hero and demonstration run entirely in the browser without contacting
agents or a coordinator. Playback has a useful final frame, visible controls,
reduced-motion behavior and a static fallback. The mission describes the team
outcomes we intend to test; it does not claim those gains are already measured.

## Work on the site

GitHub Pages serves static HTML, CSS and JavaScript. The generated demonstration
bundle is committed, so previewing or deploying the site needs no package
installation or whole-site build. Serve the repository root, for example:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/`. The animation code and Motion mini are local
assets. JavaScript enhances the story; the page's copy, setup instructions and
static demonstration remain available without it. Reduced-motion preferences
and `?motion=static` present the stories without animated playback.

When changing the Stageshow demonstration source, rebuild that one asset:

```sh
cd demo-src
npm ci --ignore-scripts
npm run build
```

This runs the pinned esbuild tool through `demo-src/build.mjs`, producing
`assets/coordination-demo.js`. Commit source and generated output together.
There is no React application build for the rest of the site. The
[demo guide](demo-src/README.md) describes mounting, playback, fallback and
the shared pause control; its [source manifest](demo-src/UPSTREAM.json)
records the pinned upstream files and the one local `Stage` extension.

| File | Purpose |
| --- | --- |
| `index.html` | Shared-awareness hero, team problem, demonstration, scope, mission, setup and FAQ |
| `assets/site.css` | Responsive layout, focus states and reduced-motion support |
| `assets/site.js` | Page interactions, setup choices, copy controls and motion coordination |
| `assets/shared-work-canvas.js` | Original hero connection animation informed by living-canvas |
| `demo-src/` | React demonstration source, selected Stageshow kit, pinned dependencies and build script |
| `assets/coordination-demo.js` | Generated, self-contained Stageshow demonstration bundle |
| `assets/motion-enhancements.js` | Optional page transitions using locally included Motion mini |
| `assets/vendor/motion-14.14.0/` | Pinned Motion mini build, license and provenance |
| `assets/brand/` | Exact approved SVG kit, reference image and organization avatar |
| `assets/product/` | Existing animated README illustrations and social preview card |
| `docs/marketing-overhaul.md` | Redesign decisions, source provenance and recorded verification |
| `docs/readme-animation.md` | Card storyboard, source references, embedding and verification |

Earlier refresh and validation documents record earlier versions of the site;
they do not establish that this redesign passed those checks. Record new
verification in `docs/marketing-overhaul.md`, and distinguish source inspection
from rendered browser checks.

## Brand and product basis

The updated supplied “Swarm Weave” kit anchors the site: warm white `#F4F3EF`,
near-black `#151513`, slate `#3F3E44` and coral `#D87859`.
The [brand assets](assets/brand/README.md) use the updated supplied SVG kit
verbatim, including its outlined lettering and palette. `langspan-avatar.png`
is a padded export of that mark for GitHub.
Keep the supplied mark and wordmark intact. The page's composition, copy and
product scenarios were created for LangSpan. Stageshow supplies selected scene
components; living-canvas informs the hero's visual storytelling rather than
supplying a copied runtime. Their provenance and licences are recorded with
the implementation.

The core repository is [Langspan/LangSpan.dev](https://github.com/Langspan/LangSpan.dev).
The source is public and installation is currently a source build. Release
archives and Homebrew have not been published. The page shows single-project
hook setup.
The [core setup guide](https://github.com/Langspan/LangSpan.dev/blob/main/docs/usage.md#connect-a-native-agent)
also covers user-level hooks and MCP registration across Git repositories.
Both setup paths use the same product and supported-tool limits.
[Implementation status](https://github.com/Langspan/LangSpan.dev/blob/main/docs/IMPLEMENTATION_STATUS.md)
holds the recorded evidence and remaining verification work.
[The mission](https://github.com/Langspan/LangSpan.dev/blob/main/docs/mission.md)
owns the problem, product hypothesis and success measures. Teams are the main
audience; one developer running several agents is also a useful entry point.
The page focuses on shared awareness and supported edits, with an optional
read-only dashboard for people. Briefings can connect related worktrees;
physical edit holds stay within each checkout. Remote sharing is opt-in and
uses the Git remote. Remote activity informs agents and never denies a local
edit. The setup guide carries the fuller check-and-landing, source-index and
adapter details.

One [retained native run](https://github.com/Langspan/LangSpan.dev/blob/main/docs/evidence/mixed-hosts/README.md)
records Claude Code and Codex taking sequential turns in one shared checkout:
Codex completed an edit, Claude preserved its change, and Codex later declined
to edit without rereading the file. A [Mac/cloud run](https://github.com/Langspan/LangSpan.dev/blob/main/docs/evidence/two-machine/README.md)
also records briefings reaching real sessions in both directions, without a
change to an agent's edit because of the briefing. The implementation status
also reports Claude Code linked-worktree briefings in a later launch
validation, whose evidence files were not published. Simultaneous mixed-host
conflicts and comparative reductions in team rework or manual relay remain
unverified. Cursor and Gemini CLI adapters are built from documentation and
have no verified live session. The page's authored illustrations are separate
from these evidence records.

Supported edit checks do not cover every filesystem write. Writes outside the
hooks and edits approved after a hold expires can proceed; shell coverage is
partial. The host's own permissions still decide what can run. Keep those
limits and current availability near setup without making the product story
an engineering manual.

Copy follows the canonical mission, approved brand and Impeccable guidance:
one clear headline, then sentences that name the agent, file and action.
Derive current behavior from implementation and evidence rather than assuming
older documentation or a passing parser test proves a live-host outcome.

## Review changes

Page and UI work uses [Impeccable](https://github.com/pbakaus/impeccable)
for design critique, focused refinement and final review alongside the existing
brand and product evidence. [AGENTS.md](AGENTS.md) records the workflow for
contributors and coding agents.

Check the hero and every demonstration step, Play/Pause, Replay, keyboard
controls, copy fallback and setup choices. Inspect desktop and narrow layouts,
normal and reduced motion, JavaScript disabled, and behavior when the page or
demonstration is offscreen. Keep availability beside setup. Report only checks
actually performed, with the source revision and remaining limitations.
Publish through a feature branch and pull request to this GitHub Pages repo.
