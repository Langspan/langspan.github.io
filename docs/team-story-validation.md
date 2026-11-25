# Mission and team-story validation

Reviewed November 24, 2026. The product fact basis is core commit
`b7442fd5d687729a650a6d865ee7aad5d054d0b4`; the mission and supporting copy are
in [core PR 24](https://github.com/Langspan/Langspan/pull/24).

## What the illustration establishes

This is an authored example of two developers' sessions in a shared checkout.
Alice's reported edit enters the work record, a task-and-path update appears in
Bob's next prompt, and Bob reads the changed file before editing the login flow.
The changed file is available to both sessions in this example. Publishing
activity metadata does not copy unpublished source between machines.

The sequence explains the intended workflow. It is not a native-host recording,
an observed agent response or evidence of reduced repair. The core mission
defines the outcome comparison still needed.

## Checks completed

| Check | Result |
| --- | --- |
| JavaScript syntax | Both controllers pass `node --check`. |
| Existing detailed walkthrough | 92 DOM assertions pass across all 12 scenes, playback, replay, keyboard navigation, hidden-tab pause, setup variants and copy success/failure/timeout. Opening a detail link reveals its section; closing it pauses playback. |
| Team story | 10 cases and 236 DOM assertions pass for the complete default/no-JavaScript source, ordered playback, pause/resume/replay, final stop, manual controls, hidden-tab/page-exit pause, static overrides and reduced motion. |
| Controller coexistence | Both script orders and simultaneous playback preserve each controller's state and timers. The new component does not share the older walkthrough's step selectors. |
| Desktop browser | Hero, team story, mission, detailed-story expansion and step controls inspected in the managed preview. Text and controls fit the layout. |
| Narrow browser | Browser zoom produced a 454 CSS-pixel viewport. The actor cards stack, controls wrap, and the document has no horizontal overflow. This is responsive-layout inspection, not a physical mobile-device test. |
| Editorial review | Team and solo use, human review, uncommitted-work awareness, current source-index limits and the distinction between a goal and measured evidence are checked. |

The DOM harness uses a temporary development installation of `linkedom`; no
dependency is loaded by or added to the website. Those checks exercise the real
page and controllers but do not establish CSS rendering. Reduced motion and
JavaScript-disabled behavior were checked at the DOM/source level; a native OS
reduced-motion setting was not exercised.

The page uses the supplied brand assets. The illustration's composition and
code are original. No engine code, host settings or data-sharing controls change.
