---
name: langspan-motion
description: Plan, produce and verify LangSpan product motion, web demos, README animation and launch films using one deterministic timeline and measurable visual gates.
---

# LangSpan motion standard

Use this skill with the repository's brand, product-marketing and Impeccable guidance. Keep the actual existing Stageshow, Living Canvas-informed, ChanMeng and Product-film toolchains when they already fit. Do not introduce a new runtime just to animate a composition.

## Before rendering

1. Choose one product event and the viewer's next action. Use the actual product component where possible. Separate recorded evidence, authored demonstrations and hypothetical outcomes. Never label an illustration a live model run.
2. Author a timing specification first: dimensions, frame rate, duration, named beats with offsets, intended reading holds, transition duration and provenance. The timeline is the single clock for the UI, captions and any audio; do not use wall-clock sleeps to decide frame state. Sound is optional; prefer silence to unrelated music.
3. Use the approved identity. Establish the scene at the first frame. Keep the focal UI at least 50% of frame width in a landscape cut, readable at phone scale, and within its designated panel. Prefer a fixed camera. Avoid particles, gratuitous pans and cursor choreography for autonomous-agent actions.
4. For each time t, compute the full visual state independently of prior renders. Use explicit seek/renderAt functions. Derive connector endpoints from actual layout; use named anchors and test their attachment throughout each transition. Do not manually position a path that can detach when panels resize.

## Motion values and acceptance

- Product loops: target 8–12 seconds. Render frames 0 through N−1; do not add the duplicated endpoint. Keep an intentional return to the opening composition. Reading holds are allowed and must be declared, not treated as missing animation.
- Interaction feedback: about 150 ms. State transitions: 220–300 ms. Default entrance curve: cubic-bezier(0.16, 1, 0.3, 1). Stagger only if it clarifies sequence, about 60 ms. Keep visual state stable after settling; avoid decorative continuous motion.
- Keep meaningful UI content in frame, without overlapping panels, unintended clipping or truncation. Connector error must be at most 1 CSS px when connectors are used. Check actual browser geometry across states and motion timestamps, including mobile/narrow and reduced-motion views for website motion.
- Before expensive rendering, capture representative stills and inspect them. Seek away and back to the same timestamp; compare decoded pixels, not merely text or DOM state. Use the actual component and brand assets, not a parallel mock that silently diverges.
- Render at intended physical resolution from the deterministic timeline; prefer 2× logical capture for crisp UI. Verify exact frame count, dimensions, rate, duration and complete decode of the encoded output. Inspect frame differences around transitions and loop seam. Run FFmpeg freezedetect, comparing detected holds with the declared plan. Reject unexpected frozen periods and beats that never materially change. Use tolerances for lossy encodes; do not claim exact encoded pixel equality when the tolerance merely passes.
- Inspect representative frames and transition contact sheets independently of the state machine. When a true independent human/agent playback review is available, record it; otherwise explicitly identify that limitation. Do not claim a human played back a film or that a second reviewer approved it without evidence.

## Reproduce the coordination-loop reference

From the website root, install FFmpeg/ffprobe, Python and Playwright with Chromium. Run:

```sh
python marketing/scripts/render-coordination-loop.py --out marketing/exports/coordination-loop
python marketing/scripts/check-coordination-loop.py marketing/exports/coordination-loop
```

Use `--stills` for framing iteration. Set `CHROMIUM_PATH` only for an explicitly supplied local Chromium binary. The example reuses the homepage's actual coordination component, with one recorded refusal excerpt and an illustrative continuation. It does not run agents or the daemon. The QA report records 360 checked timestamps, pixel-identical sample seeks, output format, measured changes and seam, and freeze intervals against the timing file. Keep the report with the exported media. Do not publish raw frames or regenerate unrelated marketing assets.
