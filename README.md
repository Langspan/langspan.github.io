<img src="assets/brand/langspan-lockup-light.svg" alt="LangSpan" width="320" height="80">

# Your agents. On the same page.

The [LangSpan product website](https://langspan.github.io/). LangSpan tells your
coding agents what the others are working on and flags overlapping edits.

[![LangSpan illustrated workflow](assets/product/langspan-overview.svg)](https://langspan.github.io/#demo)

## Follow two agents at work

Three interactive stories show agents receiving briefings, trying overlapping
edits and inspecting changes. Visitors can play, pause, select a step or replay:

- Catch an overlap: Agent B tries to edit a file Agent A currently holds, then
  moves to an unclaimed test file.
- Share the context: Agent B receives Agent A's task and recent file paths at
  session start, followed by an updated briefing on its next prompt.
- See the changes: a Git scan finds a shell edit and records it without
  assigning an author.

The walkthrough is labelled as an interactive illustration. It runs in the
browser without contacting an agent or daemon; it is not a recording or test
evidence.

## Work on the site

This is buildless HTML, CSS and JavaScript for GitHub Pages. Serve the
repository root with your usual static server; no package installation or build
step is needed. For example:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/`. The page uses no remote fonts, analytics, cookies,
external scripts or backend. JavaScript is optional for reading the product
story, initial example and setup instructions.

| File | Purpose |
| --- | --- |
| `index.html` | Agent-focused story, walkthrough shell, setup and availability |
| `assets/site.css` | Responsive layout, focus states and reduced-motion support |
| `assets/site.js` | Walkthrough playback, step selection, setup tabs and copy controls |
| `assets/brand/` | Original supplied brand kit and rasterized organization avatar |
| `assets/product/` | Original product illustration and social preview card |
| `docs/marketing-refresh-plan.md` | Scope, product basis and validation plan |

## Brand and product basis

The supplied “Swarm Weave” kit anchors the site: warm white `#F7F6F2`, near-black
`#141413`, slate `#3F3F46` and coral `#D97757`. Original SVGs remain unchanged.
`langspan-avatar.png` is a padded raster export of the supplied icon for GitHub.
The product illustrations use the same original vector paths. Composition, copy
and walkthrough code were created for LangSpan.

The core repository is [Langspan/Langspan](https://github.com/Langspan/Langspan).
It currently requires access. Setup commands match the source CLI.
[Implementation status](https://github.com/Langspan/Langspan/blob/main/docs/IMPLEMENTATION_STATUS.md)
holds the recorded evidence and remaining verification work. The page starts
with one developer running several agents. It also describes the opt-in remote
briefing and check-and-landing commands now in the source preview. The code graph
remains planned.

Copy follows the core repository's `brand-voice`, `anti-slop-writing` and
`readme-glow-up` skills: one headline, then sentences that name the agent, file
and action. Product behavior comes from the implementation and its evidence.

## Review changes

Check every story and step, Play/Pause, replay, keyboard tabs, copy fallback and
both setup variants. Inspect desktop and narrow layouts with normal and reduced
motion when changing layout. Keep availability beside setup and planned features
labelled.
Publish through a feature branch and pull request to this GitHub Pages repo.
