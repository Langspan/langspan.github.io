# Motion refresh validation

## Scope

This refresh keeps the static GitHub Pages site, supplied LangSpan identity and authored product stories. It adds the official vanilla Motion library as a local, optional presentation dependency. There is no React migration, build step, runtime CDN request or new service.

The layout changes are visible without JavaScript: a compact sticky navigation bar, a single-color headline, clearer integration labels, a framed team exchange, a four-part progress indicator, neutral demo surfaces and more readable setup controls. The original coral work update remains the main accent.

The authoritative updated brand kit supplies Warm White `#F4F3EF`, Near-Black `#151513`, Slate `#3F3E44` and Coral `#D87859`. The CSS tokens, their direct alpha variants and browser theme color use these values. Derived status colors remain in place for contrast. Header and footer lockups reserve 172 × 48 and 148 × 41 pixels respectively; CSS keeps their height automatic to preserve the supplied artwork’s proportions.

The user-level `langspan install` link and project-level setup examples remain in the page. Product copy, illustration disclosures, preview labels and all twelve detailed walkthrough scenes are unchanged by this refresh.

## Dependency and provenance

The vendored library is Motion 14.14.0, using the official standalone mini build. The `motion/mini` entry point re-exports `framer-motion/dom/mini`; the equivalent standalone file is distributed in the `framer-motion` npm package.

| Item | Recorded value |
| --- | --- |
| Source package | `framer-motion@14.14.0` |
| Archive member | `package/dist/dom-mini.js` |
| Local file | `assets/vendor/motion-14.14.0/motion-mini.js` |
| Unmodified size | 12,974 bytes |
| Gzip size | 5,083 bytes |
| SHA-256 | `06288f406545ed432bbed4b4e60ab72095fd5d8b6423ae453111b69b58bc0009` |
| License | Upstream MIT license, retained alongside the bundle |

The downloaded npm tarball's published SHA-512 integrity was verified before extraction. `provenance.json` records the archive URL, integrity and output hash. The bundle and license are unmodified upstream files.

Primary references:

- [Motion quick start](https://motion.dev/docs/quick-start)
- [Motion animate](https://motion.dev/docs/animate)
- [Motion package metadata, pinned version](https://registry.npmjs.org/motion/14.14.0)
- [Framer Motion package metadata, pinned version](https://registry.npmjs.org/framer-motion/14.14.0)
- [Official source repository](https://github.com/motiondivision/motion)

## Motion behavior

`assets/motion-enhancements.js` owns presentation only. The existing story controllers retain their timing, state, keyboard controls and semantic content.

- The headline, supporting paragraph and actions enter once with a short stagger. They are never hidden in the source or default CSS.
- Two sections—the team exchange and mission—receive a restrained entrance when they first intersect the viewport. Other content is immediately readable.
- Explicit team-story playback reveals the same four phases in the same order. The update and next action receive short transitions. The story still requires Play, holds its final state and never loops.
- The detailed walkthrough animates the active agent's changed content. Its existing controls and five-second playback cadence remain intact.
- Opening an example or FAQ, or changing the setup host, gets a short content transition. Closed detail sections do not animate in the background.
- A pause, page exit or hidden tab settles the active presentation. Existing playback pauses without catching up when the tab becomes visible.
- `prefers-reduced-motion: reduce` and `?motion=static` disable the new Motion effects. The team story displays its complete source frame.
- Motion completion, rejection, cancellation and a bounded timeout all restore the original CSS styles. If the library or Web Animations API is unavailable, the existing controllers and complete source story remain usable.

Only opacity and small transforms animate; layout dimensions do not. The four progress marks reflect the existing four story steps and are hidden from assistive technology. The existing live status and button labels remain the accessible progress source.

## Checks performed

| Check | Result |
| --- | --- |
| `node --check` for vendor bundle and all three site scripts | Passed |
| Existing team-story DOM/controller checks against the staged site | 10 cases, 236 assertions passed |
| Existing detailed walkthrough and setup/clipboard checks against the staged site | 92 assertions passed |
| Targeted Motion integration, fallback and provenance checks | 8 cases, 86 assertions passed |
| HTML ID uniqueness | 57 IDs, no duplicates |
| Local references and in-page anchors | 22 local references checked, no missing targets |
| Authored walkthrough data compared with the prior source | Identical |

The targeted checks cover the pinned bundle hash and global export; absent library and absent animation API; synchronous animation failure, rejected completion and timeout cleanup; reduced/static mode; all four team-story phases; manual steps, pause and replay; hidden-tab behavior; separation of the two players; and detail/setup transitions. The official UMD bundle was loaded in a Node VM to verify its exported API. DOM tests use a controlled animation double to verify lifecycle behavior.

Those controller checks do not establish browser rendering or native-agent behavior. The browser observations below cover the presentation. No benchmark or product acceptance result is added by this refresh.

## Browser observations — November 24, 2026

The combined page was reviewed in Chromium with the owner's updated SVG kit
and palette in place. At a 1348 CSS-pixel viewport, the navigation, hero and
framed agent exchange were readable and aligned. Motion loaded locally; the
four-step story completed, pause held the current state, and Next advanced the
illustration manually.

At a 449 CSS-pixel viewport, produced with 300% desktop zoom, the agent cards
stacked and the page's scroll width matched its viewport width. This was a
narrow-layout check, not a mobile-device test. The `?motion=static` page showed
the complete story and its disclosure. All page images loaded. Switching setup
to Codex displayed the corresponding hook command. Browser zoom was restored.

No application console errors were observed; browser-extension metadata errors
were separate from the page. The operating system's reduced-motion setting and
a missing vendor file were covered by the controller checks, not separately
toggled or blocked in this browser review.

## Preview and review

Serve the site root with a static server, for example:

```sh
python -m http.server 8080 --directory .
```

Review the normal page and `/?motion=static` at desktop and narrow mobile widths. Check the hero, team notice, actor filenames, controls and disclosure; use Play, Pause, Replay and arrow-key steps; hide and restore the tab during playback; open the detailed examples; switch setup hosts; and test with the operating system's reduced-motion preference. Disable the vendor script once to verify the fallback remains readable and usable.

The source continues to work as a buildless GitHub Pages site. The locally vendored dependency should be upgraded deliberately by replacing the official bundle and license, recording new provenance, and rerunning these checks.
