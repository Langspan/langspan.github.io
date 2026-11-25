# Product story and interactive walkthrough

## Mission and team-story update

This section is the current direction. The earlier presentation work below is
history, including its former audience emphasis and feature status.

Owner direction: the product should help teams keep building together as their
agents write more code. Capture the problem, hypothesis and success measures in
the core mission document and reference it from the brand voice. Public copy
uses ordinary language and a concrete team story; internal user-story templates
stay in product notes.

The owner's examples include a swarm completing work before teammates can
coordinate, teammates choosing unrelated tasks to avoid collisions, and isolated
worktrees discovering conflicts at integration. These motivate the product;
they are not testimonials or evidence of a measured benefit. Use anonymous
examples, with no employer or project details.

Page sequence: product introduction, the coordination problem, one complete
team-story illustration, the mission, supported behaviors, optional detailed
walkthrough, setup and current availability. The new illustration keeps Alice's
edit visible while a task-and-path notice reaches Bob's next prompt, followed by
an illustrative inspection of the changed file. This example uses a shared
checkout where both sessions can read the file; metadata does not synchronize
unpublished source across machines. Provide a complete static view,
explicit playback and a reduced-motion view.

Use core main `b7442fd5d687729a650a6d865ee7aad5d054d0b4` as the initial fact basis.
Source context and interface notices are now implemented with name matching and
workspace limits. Publication must preserve concurrent engine changes.

Validation: meaningful playback/static/reduced-motion checks, existing detailed
walkthrough checks, local links and browser review of desktop and narrow layouts.
No engine or native-agent behavior changes.

[Validation results](team-story-validation.md) record the completed review and
the limits of this authored illustration.

## Earlier presentation work

Scope: refresh the public GitHub Pages site and the core repository's README while engine development continues independently.

Positioning: Your agents. On the same page. Start with one developer running several coding agents. Explain what LangSpan brings into those sessions: other agents' tasks, edited paths and notices of overlapping edits. The developer can inspect the same records from the terminal.

Deliverables:

- A responsive, product-led landing page using the supplied LangSpan SVG kit and palette.
- Three user-controlled, clearly illustrated walkthroughs: an overlapping edit, local peer briefing, and observed checkout changes. Include chapter navigation, play/pause, replay, and reduced-motion support.
- Reusable SVG overview and social artwork, plus a strong linked visual in the core README.
- A concise source-build entry point, current availability, and a separate detailed usage reference.

The original presentation pass used core main at `47ed6c55`. The writing-skills follow-up uses `86279ce57a1e05000459db453042d74d70e8c54f`. Automatic briefings, recorded-source checks, remote briefings, check records and landing commands are implemented. Claude startup briefing receipt is recorded. Native LangSpan stale-denial, Codex delivery, mixed-host, hosted-remote and two-machine evidence remain open. The code graph remains planned. Walkthroughs are illustrations, not host recordings or performance evidence. Source access is required while the core repository remains private.

The follow-up applies the newly merged `brand-voice`, `anti-slop-writing` and `readme-glow-up` skills. Keep the main headline, replace repeated slogan fragments with descriptions of actions, and update availability from current code. Preserve the existing layout, brand assets and interaction controls. The skill index also names `writing-guidelines`, but that directory is absent from the pinned tree; use the available writing skills without claiming to have read it.

Keep static HTML/CSS/JavaScript and existing GitHub Pages hosting. Use no trackers, accounts, external scripts or additional runtime dependencies. Preserve original brand assets. Publish only this presentation work; do not alter the coordination engine or the implementation agent's branch.

Validation: JavaScript syntax, local links/assets, keyboard controls, all scenario/step states and publication readback. The original pass could not complete browser inspection because the browser controller failed navigation; the copy follow-up keeps layout and styles unchanged. No Rust source is changed.
