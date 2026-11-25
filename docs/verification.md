# Product presentation verification

## Writing-skills follow-up

The follow-up applies the current core `brand-voice`, `anti-slop-writing` and
`readme-glow-up` skills. Product claims were checked against core commit
`86279ce57a1e05000459db453042d74d70e8c54f`, including the remote briefing and
check-and-landing implementations. Copy, scenario text and documentation change;
layout, styles, brand assets and interaction logic are unchanged.

- `node --check assets/site.js` passed.
- `git diff --check` passed.
- The existing DOM harness passed all 89 assertions across the twelve scenes,
  playback, replay, keyboard controls, visibility pause, setup variants and
  clipboard success, denial and timeout.
- An independent copy review checked the wording against the new skills; a
  separate source review checked current capabilities and limits.
- No new browser inspection or native-agent acceptance run was performed.
  The earlier browser-controller failure is recorded below. DOM checks do not
  establish browser layout or native-host behavior.
- No Rust source or dependencies changed. The local Rust suite was not rerun
  for this copy-only update.

## Original presentation pass

This refresh changes the product site and documentation. It does not change the
LangSpan engine. Product claims were reconciled with core main `47ed6c55`,
including automatic local briefings and the source-version work merged in
PRs 12 and 13.

| Check | Result |
| --- | --- |
| `node --check assets/site.js` | Passed |
| `git diff --check` | Passed |
| HTML IDs, local targets and controls | 48 unique IDs, 21 link/asset targets and 16 control references checked |
| Supplied and created SVGs | XML parse passed; original brand SVGs unchanged |
| Interaction checks | 89 assertions passed using the real authored script with a temporary LinkeDOM DOM and controlled platform APIs |
| Stories | All 12 scenes, direct selection, next-step wrap, conflict-state reset and replay |
| Playback | Explicit start, pause, stop at end, restart, story-change cancellation and hidden-document pause |
| Accessibility controls | Keyboard tab navigation and selected/current ARIA state checked; reduced-motion CSS present |
| Setup and copy | Agent command switching, clipboard success, rejection and 1.2-second timeout fallback |
| Product artwork | SVGs rendered; social PNG and organization-avatar PNG visually inspected |
| Independent source review | Links, IDs, interaction state bounds, copy and contrast reviewed; found issues corrected |
| Live browser / responsive visual inspection | Not completed: the browser controller failed navigation with `Browser Use could not read requirements.` |
| Rust check suite | Not run for this presentation-only change; no Rust source or dependency changes |

The temporary DOM harness and its package installation are outside this
repository and add no production dependency. Those checks establish interaction
logic, not browser layout, clipboard permissions or native-agent behavior.
The page labels its walkthrough as an illustration and keeps implementation
availability separate from the product direction.

The prepared `assets/brand/langspan-avatar.png` is a raster export of the supplied
icon, with padding for a circular crop. Applying it to the organization profile
requires the GitHub settings UI; the same browser failure prevented that action
in this session.
