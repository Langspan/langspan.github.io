---
name: langspan-motion
description: Plan, build and check LangSpan motion and media, such as the hero loop, page transitions, README cards, films and stills. Use before you add or change anything that moves or any video, GIF or poster on the site or in a README.
---

# LangSpan motion standard

This file is the standard. The [motion playbook](../../../docs/motion-playbook.md)
is its reference: it explains each rule and holds the brief template, the
QA method and a table of common failures. If the two disagree, this file wins.

## Rules

1. Motion explains state: a hold, a briefing, a refusal, a notice or a
   choice. It never fakes an agent action, a cursor or an outcome LangSpan
   hasn't measured. Label each piece **Recorded**, **Simulated** or
   **Illustration**.
2. Write the clock before any motion. One timing file drives the picture,
   the captions and the cuts. The hero loop's clock is
   [`marketing/motion/hero-loop/timing.json`](../../../marketing/motion/hero-loop/timing.json).
3. Expose one `renderAt(t)` that draws any frame from `t` alone. Write every
   value as a closed-form function of `t`, with no state carried between frames.
4. Put each number in the brief. An adjective such as "smooth" or "subtle"
   becomes a default you didn't choose.

## Easing and duration

| Use | Curve | Duration |
| --- | --- | --- |
| Entrance | `cubic-bezier(0.16, 1, 0.3, 1)` | 280 ms |
| Exit | `cubic-bezier(0.7, 0, 0.84, 0)` | 160 ms |
| Feedback: a text or color change | Entrance curve | 150 ms |
| State change | Entrance curve | 280 ms |

`cubic-bezier(.2, 0, 0, 1)` at 300 ms is retired. An entrance travels at
most 8 px. Don't use zooms, glow, particles, typing effects or gradients.

## The phone cut

The hero loop's film is a 1080 × 1350 phone cut, rendered from the same
timing file as the hero, so the two can't drift. All text in the frame is at
least 28 px tall, which is about 10 px on a 390 px phone. To render it and
check it, run the commands in
[Render the phone cut](../../../docs/motion-playbook.md#render-the-phone-cut).

## Media delivery

- Don't put a GIF on the site.
- Ship each film as WebM, then MP4, with `muted playsinline`, a `poster`
  and `preload="none"`. Load it only when its panel opens.
- Give every image below the first screen a width, a height and
  `loading="lazy"`. Never lazy-load the largest first-screen element.
- Give anything that moves for more than 5 seconds a visible pause control
  (WCAG 2.2.2). With reduced motion, nothing plays on its own.
- The README keeps one short animated SVG or GIF of the same loop, under
  2 MB, because GitHub plays README video only on click.

## Done when

- The output decodes at the stated size, frame rate and frame count.
- The render covers frames 0 to N - 1, and frame N - 1 flows into frame 0.
- A freeze detector finds no hold that the timing file doesn't declare.
- Four seeks redraw identical pixels.
- Reduced motion, `?motion=static` and a page without JavaScript show the
  complete static state.
- A reviewer who didn't build the piece checks it, and a person presses
  play on a phone. Record each check with its value in the pull request.
