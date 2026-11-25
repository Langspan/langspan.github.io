# Coordination illustration rehearsal

## Intent

- **Place:** the marketing page's full-width dark local-coordination section.
- **Focal object:** Agent B's denied same-file request, followed by its distinct
  test-file request. A stays visible to explain the denial.
- **Payoff:** both agents continue on separate work; the shared work strip keeps
  the admitted files and ownership visible.
- **Omitted:** fake telemetry, unrelated app chrome, decorative particles,
  remote locking, automatically generated plans, and competitor identity.
- **Closest golds read:** Stageshow `subscriptions` and `presence`, pinned at
  `299140fafd08df55a9c234e610c3f64af3f45531`.

## Verification

- The pinned production build completes; compiled JavaScript passes Node's
  syntax check. The browser bundle makes no external network requests.
- The actual Stageshow components and license are vendored. Unused kit modules,
  CSS and third-party artwork were removed from the source closure.
- Source review covers pause/resume, one-time visibility trigger, hidden-tab
  pause, manual step selection, explicit replay, static URL and reduced-motion
  initial state, and preservation of the HTML fallback.
- Desktop and compact compositions are separately authored; the compact scene
  stacks Agent A, shared work, then Agent B and shortens supporting code.

## Browser review handoff

Review `demo-src/preview.html` and the finished host page in the approved
browser at desktop and 390px widths. Check all four steps, the final frame,
reverse/manual selection, pause mid-beat, replay, hidden/offscreen pause and
`?motion=static`. Check console errors, clipped text and keyboard controls.

The integrating review is now recorded in
[marketing-overhaul.md](../docs/marketing-overhaul.md), including the observed
mobile clipping fix, desktop/compact rendering and playback checks.

The upstream `film.mjs`/Playwright gate was **not run**: this environment
requires browser interaction through its approved computer-use tool. This
document does not claim that an upstream rehearsal gate passed. Browser QA of
the final host belongs to the integrating agent's visual review.
