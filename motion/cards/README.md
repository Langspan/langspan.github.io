# README product cards

One builder, `build.mjs`, makes two cards from one story and one set of words
(`COPY` in the builder):

| Card | Size | Files in `assets/product/` |
| --- | --- | --- |
| Wide | 1300 × 360 | `langspan-card-light.svg`, `langspan-card-dark.svg` and their `-still` versions |
| Compact, for phone-width READMEs | 520 × 640 | `langspan-card-compact-light.svg`, `langspan-card-compact-dark.svg` and their `-still` versions |

`langspan-overview-compact.svg` is a copy of the light compact card, kept for
links that already name it.

Stage: the Stageshow local-checkout story. Agent A holds `src/auth/session.ts`;
Agent B's request for the same file is refused, and B independently chooses
`tests/session.test.ts`. The still frame is the end of that story: both files
admitted, with the overlap stated underneath. The cards are illustrations, not
recordings, literal CLI output, remote edit enforcement or measured outcomes.
The builder stops when the words it uses no longer appear in the Stageshow
source (`demo-src/CoordinationDemo.tsx`, `demo-src/README.md`) or the page's
no-JavaScript fallback.

Actual upstream: [ChanMeng SVG product card](https://github.com/ChanMeng666/chanmeng-svg-animation-studio/tree/539208618e6ca68963474f77921f62e39713bb0e/skills/chanmeng-svg-product-card),
MIT licence, kit copied by its own `init-kit.mjs` from that exact revision. The
builder uses `card`, `panel`, `createTimeline` and `createGlyphSet`, and the
kit's `check-card` and `capture-frames`. The approved lockups are embedded
unchanged. Inter static instances and IBM Plex Mono (an open substitute for the
site's system monospace) are outlined. No external resources or
`foreignObject`. 12-second loop, 300 ms reveals, light and dark, motionless
alternatives that `prefers-reduced-motion` selects.

Regenerate locally (the kit, fonts and renderer stay out of Git):

```sh
node <chanmeng-checkout>/skills/chanmeng-svg-product-card/scripts/init-kit.mjs --dest=motion/cards
(cd motion/cards && npm install --no-save --ignore-scripts opentype.js@1.3.4 playwright-core@1.65.1 @fontsource/inter@5.2.5 @fontsource/ibm-plex-mono@5.2.5)
node motion/cards/build.mjs
node motion/cards/lib/check-card.mjs assets/product/langspan-card-*.svg --max-kb=300
node motion/cards/lib/capture-frames.mjs assets/product/langspan-card-compact-dark.svg --at=1.2,4.5,8,11 --out=motion/frames
```

The `readme-cards` workflow does the same on every pull request that touches
the cards, and fails if the committed SVGs differ from a fresh build. Look at
the captured frames before merging; a passing gate does not show clipping or
overlap.
