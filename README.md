# LangSpan website

The product website for [LangSpan](https://langspan.github.io/), built as static
HTML, CSS, and JavaScript for the existing GitHub Pages repository. No build step
or package installation is required.

## Files

- `index.html`: product narrative, illustrative two-agent workflow, integrations,
  and practical source-build setup.
- `assets/site.css`: responsive layout and the supplied brand palette.
- `assets/site.js`: three selectable demo scenarios and command-copy controls.
- `assets/brand/`: the owner-supplied SVG kit and `COLORS.txt`, copied unchanged.

## Preview

Serve the repository root with any static server. For example:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/`. The page does not use remote fonts, trackers,
analytics, cookies, external scripts, or a backend. The demo is a local
illustration; it does not launch agents or contact a coordinator.

## Brand and source notes

The final supplied kit is Variation B, “Swarm Weave.” Its palette is warm white
`#F7F6F2`, near-black `#141413`, slate `#3F3F46` (dark mode `#A1A1AA`), and coral
`#D97757`. The supplied lockups, icons, badges, and favicon are original assets
provided by the owner. Their SVG content has not been edited, traced, or rebuilt.
The earlier PNG has been superseded by this kit and is not used.

The page uses system sans-serif and monospace stacks, with no downloaded font
dependency. Composition, copy, and demo interface were created for this site;
no third-party brand assets, testimonials, or performance figures are included.
Future brand updates should replace the original files in `assets/brand/` and
update the CSS tokens together.

## Claims and evidence

The terminal-style example is explicitly labelled **Illustrative demo**, including
its native-host responses. It is not a recording or acceptance result. The page
separately identifies supported-operation coverage, cooperative/local limits, and
the Codex adapter's pending native-host acceptance. Actual build instructions and
available commands are checked against the core CLI source.

The core repository is [Langspan/Langspan](https://github.com/Langspan/Langspan).
Repository and documentation links may require access; the public page does not
claim an anonymously downloadable release or a selected software licence.
[Implementation status](https://github.com/Langspan/Langspan/blob/main/docs/IMPLEMENTATION_STATUS.md)
is the detailed authority for delivery and validation. No platform, Pages
configuration, publication, or repository visibility change is part of these
website source files.

## Review before publication

Check desktop and narrow mobile layouts, keyboard focus, all three demo states,
copy controls and their fallback, in-page navigation, and the repository-access
wording. Review product claims against the corresponding core commit. JavaScript
is optional: the initial conflict example, product explanation, and setup
instructions remain readable without it.
