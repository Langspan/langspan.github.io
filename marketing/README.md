# LangSpan marketing production

This directory is the shared demonstration source, not a second product UI. The narrative is one supported local hold, one refused overlapping request, one independently chosen test edit, and both edits proceeding within their scopes. The Stageshow story and ChanMeng card are authored illustrations. The released dashboard is a separate controlled run with real coordinator behavior and constructed hook events. No live-model outcome or time saving is claimed.

- `story.json`: canonical copy, illustrative fixture paths, four scene offsets, approved brand palette, evidence hash and crop geometry, export plans and motion values.
- `demo-src/CoordinationDemo.tsx`: actual Stageshow vendored component kit; imports the canonical story and timeline.
- `motion/cards/build.mjs`: actual ChanMeng kit, same story and format-specific timing.
- `assets/shared-work-canvas.js`: existing Living Canvas-informed connection animation; original site code.
- `film/beats.html`: deterministic HTML composition from actual rendered Stageshow components and pixel-preserving released dashboard excerpts. Uses an editorial, silent, restrained cut rather than a fake UI cursor, camera drift or decorative particles.
- `scripts/`: prepare the upstream Product-film walkthrough folder, capture the actual components, render using its unmodified renderer, review frame bounds and seek determinism, encode and inspect output.
- `skills.lock.json`: pinned upstream references and chosen role. Use project-local exact fetches rather than installing every skill globally. The production product gets no new dependencies.

## Build

From the site root, install FFmpeg and the browser tools in `review/` and rebuild the existing demo:

```sh
(cd demo-src && npm ci --ignore-scripts && npm run build)
npm install --prefix review --no-save --ignore-scripts playwright@1.65.1
npx --prefix review playwright install chromium
git clone https://github.com/display-dev/product-film.git /tmp/langspan-product-film
git -C /tmp/langspan-product-film checkout fd9db88a76945bbd1d678739cad411c1a61bce1e
export PLAYWRIGHT_DIR="$PWD/review"
bash /tmp/langspan-product-film/skills/product-film/templates/new-film.sh walkthrough "$PWD/marketing/.work"
node marketing/scripts/prepare.mjs
python3 -m http.server 8123 --bind 127.0.0.1 &
node marketing/scripts/capture.mjs
node marketing/scripts/spot-check.mjs launch
bash marketing/scripts/render.sh launch
```

For the other formats use teaser, square, vertical and walkthrough. Film outputs are 1920×1080, 1080×1080 or 1080×1920 at 24 fps from 2× capture. The launch is 33 seconds, teasers 18 seconds, the website walkthrough is 14.3 seconds. Captions are burned into the composition and exported as VTT. No soundtrack was supplied; all cuts are silent. Do not publish to display.dev or another external review service. Use GitHub Actions artifacts and the review frames. Keep the .work and raw frame folders out of Git.

The exact Product-film template engine, helper and audit are initialized from its pinned upstream; the HTML timeline and encode step are LangSpan's, to remove unsupported flourishes and preserve full 2× capture resolution. The skill's MIT licence is retained in its generated workspace and the repository's source notice. The optional brag/Showreel/GSAP alternatives are reviewed, not run. No invented cursor: requests originate from agent sessions, not human mouse clicks.

## Distribution

Website: existing Living Canvas hero and original interactive Stageshow tour; proof excerpts; optional user-triggered launch film and lightweight short version. GitHub: existing four ChanMeng variants and explicit static alternatives. Social: landscape/square/vertical MP4s, preview artwork, and draft launch copy. Preserve existing README and brand assets until the new outputs pass actual visual inspection. No posting to social accounts is authorized by this asset-production assignment.

## Review

Every render must decode, fit its format, seek independently of prior frames and be inspected at each beat. Check exact claims, clarity at phone widths, no clipped evidence, no invented interface actions, no ornamental zoom, and deliberate scene boundaries. Browser and GitHub rendering are separate gates. Impeccable/Hallmark findings are advisory where legacy styling conflicts with the approved brand; report remaining findings rather than claim certification. A passing render does not establish comparative product outcomes.

The initial production run built the Stageshow bundle but stopped because FFmpeg was absent from the runner. Install it explicitly; no alternative renderer was substituted. The render script checks actual output dimensions, frame rate, silent single-stream encoding, duration and complete decode. The launch review also captures a separately composed 1200×630 social preview from the same released evidence.

## First film review and refinement

The first render's upstream audit was clean for the completed landscape, square, vertical and short walkthrough cuts. Visual inspection found that the portrait layout gave the single terminal too much empty space, and the short clip lost the relationship between the two actors. Portrait now uses the existing compact Stageshow component capture rather than cropping the desktop shot. The short walkthrough now keeps both actors, their shared work strip and the exact sequence together on a dark stage; caption changes remain readable outside the UI. Contact sheets use the actual number of rows. The launch and square cuts retain their closer framing. No decorative motion, fake cursor or new product claim was added.

The film pipeline's social preview is an independently composed 1200×630 frame, not a crop of the launch video, and is no longer the published card. The full asset production workflow is manual (`workflow_dispatch`) to avoid regenerating all five videos on unrelated documentation edits.

## Reviewed publication

[Final film production run 45726965079](https://github.com/Langspan/langspan.github.io/actions/runs/45726965079) passed all five upstream Product-film audits, deterministic spot checks, 2× resolution/duration/24fps checks and FFmpeg decoding. The revised vertical cut and short dark walkthrough use the two-agent Stageshow composition, with focused close-ups in landscape and square. [Social preview review 45727089617](https://github.com/Langspan/langspan.github.io/actions/runs/45727089617) passed after fixing its cropped disclosure. Impeccable 4.11.0 actually ran: its 25 initial findings concern mostly existing small labels, contrast and static CSS detection, plus source typography preferences. Fix actionable label sizes and decorative contrast; retain the approved typeface, full-bleed sections with nested gutters, and physical 2× output sizes. Do not describe the remaining style warnings as a clean Impeccable certification. The reviewed publication manifest pins exact SHA-256 bytes; [published assets](published-assets.json) records both run revisions. The site's social card, `assets/product/social-card.png`, is a 1280×640 frame rendered from `marketing/film/social-card.html` by `marketing/scripts/social-card.mjs`. It shows no version number, so a release does not make it stale. Only lightweight finals are committed, not raw frames.

## Parallel development story

`parallel-story.json` records the approved positioning, the ten-session topology, the three semantic-conflict beats, and independent research sources. `assets/parallel-story.js` is original, using the prior Living Canvas-informed deterministic drawing approach. It exposes `window.LangSpanParallel.seek(seconds, count)` for the 12-second scale story and `.semantic(seconds)` for the semantic story. The original hero now supports the execution/coordination/integration stack explanation. `review/check-parallel-story.mjs` checks source alignment and `review/semantic-git-example.mjs` executes the actual Git fixture. The six Stageshow capabilities, ChanMeng cards, dashboard proof and previously published films remain unchanged; the new page identifies the older film as the local-coordination film. Use the seek contract for future scale-specific captures rather than simulating a live run. No new runtime dependency.

## Hero loop phone cut

`motion/hero-loop/timing.json` is the hero loop's clock: 10 seconds at 30 fps, each event with its target, motion and text, the declared reading holds and the phone cut's size. `scripts/render-hero-loop.py` frames the home page's own coordination component at 1080×1350 with `motion/hero-loop/film.css`, drives it from the timing file with `film.js`, and writes WebM, MP4, a poster and a render report. `scripts/check-hero-loop.py` decodes both files and checks size, frame count, seam, beat changes and freezes against the declared holds. The briefing and refusal lines are recorded; the continuation is an illustration. No agent or daemon runs. The `Hero loop motion QA` workflow runs both scripts and uploads the outputs. See the [motion standard](../.agents/skills/langspan-motion/SKILL.md) and the [playbook](../docs/motion-playbook.md#render-the-phone-cut).
