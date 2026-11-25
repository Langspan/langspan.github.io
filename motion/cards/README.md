# README product card

Stage: the existing illustrated Stageshow local-checkout story (A holds a file; B receives an overlap refusal and independently chooses a test file).

Still: both distinct files are admitted, with the overlap recorded in the explanatory line. The card is illustrative, not a real recording, literal CLI output, remote edit enforcement, or measured outcome. The website's interactive story and its evidence links remain unchanged.

Actual upstream: [ChanMeng SVG product card](https://github.com/ChanMeng666/chanmeng-svg-animation-studio/tree/539208618e6ca68963474f77921f62e39713bb0e/skills/chanmeng-svg-product-card), MIT license, kit initialized by its own init-kit.mjs from that exact revision. The builder uses card, panel, createTimeline, createGlyphSet and original check-card and capture-frames. It follows the existing source in demo-src/README.md and the fallback HTML; source changes fail the build until reviewed. The approved lockups are embedded unchanged. Inter static font instances and IBM Plex Mono (open substitute for the site's system monospace) are outlined. No external resources or foreignObject. 12-second loop, 300ms reveals, light/dark and motionless alternatives. SVG files must pass the original sandbox and browser gates, then human frame review before merging; live GitHub rendering needs independent verification after publication.

For local regeneration follow the readme-cards workflow, then run node motion/cards/build.mjs. The generated files are committed to the feature branch only after CI succeeds. No external review service or production APIs are used.
