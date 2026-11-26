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

From the site root, install the browser tools in `review/` and rebuild the existing demo:

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
