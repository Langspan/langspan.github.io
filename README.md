<img src="assets/brand/langspan-lockup-light.svg" alt="LangSpan" width="320" height="80">

# Your agents. On the same page.

The [LangSpan product website](https://langspan.github.io/): shared context and
coordination for the coding agents you already use.

[![LangSpan illustrated workflow](assets/product/langspan-overview.svg)](https://langspan.github.io/#demo)

## The experience

Three guided, interactive stories explain what LangSpan brings to independent
agent sessions. Visitors can play a story, pause, select any step, replay, or
switch scenarios:

- **Catch an overlap:** a current file claim surfaces an overlapping edit while
  unrelated work stays available.
- **Share the context:** relevant peer work reaches another agent's session and
  prompt context.
- **See the changes:** complete Git scans provide observations separate from
  host-reported tool results.

The walkthrough is explicitly an **interactive illustration**, not a recording
or an acceptance result. It runs in the browser and contacts no agent or daemon.

## Work on the site

This is buildless HTML, CSS and JavaScript for **GitHub Pages**. Serve the
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
It currently requires access. Setup commands match the source CLI; the page does
not advertise an anonymous release download or an unselected licence.
[Implementation status](https://github.com/Langspan/Langspan/blob/main/docs/IMPLEMENTATION_STATUS.md)
holds the retained evidence and remaining acceptance work. The public story is
agent-first: one developer running several agents is the starting use case;
teams and cross-machine coordination extend the product direction.

## Review changes

Check every story and step, Play/Pause, replay, keyboard tabs, copy fallback and
both setup variants. Inspect desktop and narrow layouts with normal and reduced
motion. Keep current availability beside setup and future capabilities labelled.
Publish through a feature branch and pull request to this GitHub Pages repo.
