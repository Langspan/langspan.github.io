# Motion and visual content playbook

This playbook is the reference for the
[LangSpan motion standard](../.agents/skills/langspan-motion/SKILL.md).
Read the standard first. This file explains its rules and adds the brief
template, the QA method and fixes for common failures. If the two disagree,
the standard wins.

[AGENTS.md](../AGENTS.md) and the [maintenance guide](website-maintenance.md)
own the brand, the product claims and the review process.

## The site's tools

Build with what the site already has. Add a tool only when the brief needs
it, and record its provenance as the existing components do.

| Need | Use |
| --- | --- |
| A scene with windows, prompts and code | The vendored scene kit in `demo-src/` ([guide](../demo-src/README.md)), built to `assets/coordination-demo.js` |
| Short state transitions on the page | The vendored animation library in `assets/vendor/`; content is never hidden by default |
| Drawn or diagram motion | Plain HTML, CSS and JavaScript in `assets/`, with a seek function |
| README cards | `motion/cards/build.mjs` ([guide](../motion/cards/README.md)) |
| The hero loop's phone cut | `marketing/scripts/render-hero-loop.py` and `check-hero-loop.py` ([render the phone cut](#render-the-phone-cut)) |
| Other films and social cuts | `marketing/scripts/` ([guide](../marketing/README.md)) |

GitHub Pages serves committed static files. `demo-src/` is the only build
step; commit its generated bundle with its source.

## Before you start

- **Match effort to the stage.** Plan, storyboard and iterate on stills at a
  medium reasoning effort. Switch to high for the long build. Avoid the
  maximum effort level for visual work: it costs about three times as much,
  isn't reliably better and can spend a turn thinking without output.
- **Pin the model.** Name the model in every script and batch command, so no
  run bills on a model nobody chose.
- **Fix on stills first.** A still costs seconds and a full render costs
  minutes. Give one round of notes on stills before any render.
- **Keep the session stable.** Keep the same conversation and project files
  through a piece of work, so cached context stays valid.

## The brief

### Numbers, not adjectives

Every adjective in a brief becomes the model's default. Replace each one
with a number or a named value.

| Instead of | Write |
| --- | --- |
| smooth | entrance `cubic-bezier(0.16, 1, 0.3, 1)`, 280 ms |
| snappy, fast | feedback, 150 ms; exit `cubic-bezier(0.7, 0, 0.84, 0)`, 160 ms |
| bouncy | don't; state changes settle with no overshoot |
| big enough | text at least 28 px in a 1080 px wide frame; hero at least 160 px tall at 390 px width |
| clean | brand colors only; at most 0 extra colors |
| subtle | opacity 0 to 1 and 8 px of travel, nothing else |

A beat grid has `fps * 60 / BPM` frames per beat. At 30 fps and 120 BPM a
beat is 15 frames.

### Ban the defaults by name

Defaults leave only when you name them. Start every brief with this list and
add to it:

- Purple or rainbow gradients, glow, lens flares, particles.
- Camera drift or zooms that add energy without explaining anything.
- A fake cursor, typing or clicking: requests come from agent sessions.
- Labels, subheads or badges that the brief doesn't ask for.
- Off-brand color: use warm white `#F4F3EF`, near-black `#151513`, slate
  `#3F3E44` and coral `#D87859`, with the darker text variants in `assets/`.

### Timing comes first

Write the clock before any motion: a list of events with their times, or a
beat grid. One timing file drives picture, captions and sound, so they can't
drift. Land a sound hit one frame after its picture event.

| Piece | Timing file |
| --- | --- |
| Hero loop and its phone cut | `marketing/motion/hero-loop/timing.json` |
| Scene kit demo and the older films | `marketing/story.json` (scene offsets and `motion`) |
| Scale and semantic stories | `marketing/parallel-story.json` |

The hero loop's file holds the 10-second clock at 30 fps, every event with
its target, motion and text, the declared reading holds and the phone cut's
size. The site publishes only `assets/`, so the hero script carries the same
values; the phone cut's renderer fails if they differ.

### The `renderAt(t)` contract

Expose one function that draws any frame from a time, with no other input.
An agent can then render, check and fix any frame on its own, and the film
scripts can capture it. The site's contracts:

- `window.LangSpanHero = { element, timing, renderAt(seconds) }` for the
  hero loop. Until the hero exposes it, the phone cut drives the current
  coordination panel by step.
- `window.LangSpanCanvas.render(seconds)`,
  `window.LangSpanParallel.seek(seconds, count)`,
  `window.LangSpanBenchmark.seek(seconds)` and
  `window.LangSpanProduct.seek(seconds)`.
- The `controlled` state prop on the scene kit's `Stage`.

Seeking pauses playback. The same `t` draws the same pixels whether you
reach it by playing or by jumping.

## Motion values

The [standard](../.agents/skills/langspan-motion/SKILL.md#easing-and-duration)
holds the one easing table: entrance, exit, feedback and state change. For
motion the table doesn't cover:

- **Stagger** only when it clarifies a sequence: list items 40 to 80 ms
  apart, words 60 ms apart.
- **Overlap.** The next move starts at 30 to 50 percent of the previous one.
- **Springs.** State the damping ratio, not a feel. State changes on this
  site use 1.0, which settles with no overshoot.
- **Closed-form motion.** Write every position, opacity and color as a
  function of `t`. A physics step that accumulates per frame breaks seeking
  and makes captures differ from playback.
- **Motion explains state.** Each move shows a hold, a briefing, a refusal,
  a notice or a choice. Remove a move that explains nothing.

### Surfaces not yet on the standard

These still use the retired curve or older values. Move each one to the
table when its surface is next rebuilt, and check it again at that time.

| Surface | Current values |
| --- | --- |
| `marketing/story.json` `motion` (scene kit demo, older films) | `cubic-bezier(.2,0,0,1)`, 300 ms enter, 24 fps |
| `assets/site.css` `--action-ease` | `cubic-bezier(.2,0,0,1)` |
| `demo-src/capability-explorer.css` | `cubic-bezier(.2,0,0,1)` at 270 and 620 ms |
| `demo-src/coordination-demo.css` | `ease` and `cubic-bezier(.25,.8,.25,1)`, 220 to 480 ms |

## Provenance

Label every visual as **Recorded** (verbatim from a real session, with a
link to it), **Simulated** (a controlled run with constructed input) or
**Illustration** (authored). Put the label on the visual and in its
caption. Never show an outcome LangSpan hasn't measured. A film made from
the page's own component carries the page's labels; the phone cut's footer
reads "Recorded messages · illustrated continuation".

## QA that measures motion

A reviewer that checks only stills passes a frozen animation. Measure the
motion as well:

1. **Freeze detection.** Run a freeze detector on the decoded draft. Every
   freeze that the timing file doesn't declare is a bug. A 150 ms feedback
   change to one word sits below a detector's noise floor, so a declared
   hold may run on through it; check instead that each feedback event
   changes the decoded pixels.
2. **Change per second.** Plot the mean pixel change per second across the
   render. Peaks sit on events, and holds are flat only where the timing
   file says to hold.
3. **Times from a tool.** Read frame times and durations from the decoder,
   the seek function or the timing file. Never accept a time a model typed.
4. **Seek parity.** Seek to four timestamps, away and back, and compare the
   pixels.
5. **An independent reviewer.** The agent that built the piece doesn't
   review it. The reviewer gets the brief and the output and tries to break
   it: clipped text, wrong claims, seams, reduced motion, no JavaScript.
6. **Press play.** A person watches anything that moves or makes sound, on
   a phone and in the browser, and for README cards in GitHub's image view,
   before it ships. Screenshots aren't playback.

Design collisions out rather than fixing them later: give each actor its own
lane, and put moving objects behind text, never across it.

Record the checks you ran, with their values, in
`docs/marketing-overhaul.md` or the pull request.

## Framing at phone size

- Judge at the size people see it: 390 px and 320 px wide, as well as
  desktop. A wide scene shrunk to a phone isn't a compact layout; build a
  separate composition.
- Set a minimum size in pixels for the hero of each shot, and have the agent
  measure and report it. First drafts frame too wide.
- Cut on the beat instead of zooming to add energy.
- Keep text fully in frame or fully out. Never crop a provenance label.

### Render the phone cut

The phone cut is 540 × 675 CSS px captured at 2x, which gives 1080 × 1350.
At that size, 14 CSS px of text is 28 px in the frame and about 10 px on a
390 px phone. A 1920 × 1080 film shown on that phone shrinks its panel to
about 195 px, and its text can't be read.

Install the tools that the
[Hero loop motion QA workflow](../.github/workflows/hero-loop-motion-qa.yml)
installs, then run from the site root:

```sh
python marketing/scripts/render-hero-loop.py --out marketing/exports/hero-loop
python marketing/scripts/check-hero-loop.py marketing/exports/hero-loop
```

Use `--stills` to write only the four seek samples and the poster while you
iterate. Set `CHROMIUM_PATH` only for a browser binary you supply yourself.

The renderer frames the home page's own component with `film.css` and
drives it with `film.js`; it doesn't redraw a copy. It blocks every network
request and runs no agent or daemon. On every frame it checks that all
text is inside the frame, unclipped and at least 28 px. It writes
`hero-loop-phone.webm`, `hero-loop-phone.mp4`, a poster at the refusal
frame and `render-report.json`. The check decodes both files and writes
`motion-qa.json`: size, frame rate, frame count, seam, beat changes,
feedback changes and freezes against the declared holds. `exports/` stays
out of Git; the workflow uploads the outputs for review.

## Media delivery

The goal is a largest first-screen element that renders in 2.5 seconds or
less on a mid-range phone. The hero loop stays HTML and CSS, so that
element is the headline text, not an image or a video.

- **No GIFs on the site.** A video of the same loop is several times
  smaller.
- **Films.** List a WebM source, then an MP4 source. Use
  `muted playsinline`, a `poster` and `preload="none"`, and set the source
  only when the visitor opens the film's panel.
- **Images.** Every image below the first screen has `width`, `height` and
  `loading="lazy"`. A first-screen image never has `loading="lazy"`.
- **Pause.** Anything that moves for more than 5 seconds, starts on its own
  and sits beside other content has a visible pause control (WCAG 2.2.2).
  Starting on scroll counts as starting on its own. The hero loop stops
  after 3 loops on the refusal frame.
- **Reduced motion.** Animate only under
  `prefers-reduced-motion: no-preference`, and listen for changes. With
  reduced motion, nothing plays on its own and the static state is
  complete.
- **README.** GitHub plays a README video only on click. The README keeps
  one short animated SVG or GIF of the same loop, under 2 MB, with a
  motionless variant for reduced motion.

## Define done

Tell the agent what finished means, with numbers. A long run without a
definition ends early with a list of what is left. Start from the standard's
[done list](../.agents/skills/langspan-motion/SKILL.md#done-when) and add
the piece's own sizes and thresholds.

On a long run, commit as you go. Lock the style with one approved still or
clip before the full build. Models tend to add things, such as labels and
subheads, rather than remove them, so say what to remove.

## Prompt style

- Write fewer, better rules. A model follows strict rules to the letter, old
  "never" lines pile up and conflict, and capitals or "you MUST" don't help.
- Name exactly what is approved, instead of "use your judgment".
- If you want short notes back, ask for them. Effort level doesn't change
  reply length.

## Agent teams

- Give each agent a different brief, not the same brief under another name.
- Write limits as numbers: "at most 2 render processes", "at most 3 stills
  per round".
- Keep the shared rulebook short. A growing process document slows output.

## Loops and export

- **Loops render frames 0 to N - 1.** Never render frame N: it duplicates
  frame 0 and the loop stutters. Frame N - 1 flows into frame 0 in position,
  color and light.
- **Render frame by frame.** Capture headless from the seek function, not by
  recording the screen. For motion blur, average sub-frames.
- **Video.** MP4: H.264 High profile, `yuv420p`, fast start (the index at
  the front of the file). WebM: VP9, `yuv420p`. At most 60 fps; the hero
  loop uses 30. With sound: AAC, -14 LUFS integrated and a true peak at or
  below -2 dBTP, measured after the encode. The current films are silent.
- **Social.** Check the target platform's current limits on file size,
  dimensions and frame count before you render, and write them into the
  brief as numbers.
- **README cards.** Finite or short loops, a motionless still for each
  variant, no scripts or external resources, as
  [the card guide](../motion/cards/README.md) describes.

## When it goes wrong

| Symptom | Fix |
| --- | --- |
| Looks generic, like every other demo | Replace each adjective in the brief with a number; name the banned defaults. |
| Reviewer passed it, but nothing moves | Run freeze detection and the change-per-second plot; review motion, not stills. |
| A feedback beat merges two holds | Expected below the detector's noise floor; check that the feedback changes the decoded pixels. |
| Captured frames differ from playback | Remove per-frame state; make motion a closed-form function of `t`. |
| Loop stutters at the seam | Render frames 0 to N - 1; match frame N - 1 to frame 0. |
| Unreadable on a phone | Use the 1080 × 1350 cut; keep text at least 28 px in the frame. |
| Film and page tell different stories | Drive both from one timing file; fail the render when they differ. |
| Text clipped at an edge | Keep text fully in or out of frame; give it its own lane. |
| Elements collide or overlap | Separate lanes, or put the object behind the text. |
| Run ends early with a to-do list | Define done with numbers; commit as you go. |
| Extra labels and subheads appear | Lock the style with an approved example; list what to remove. |
| Costs rise without better output | Drop to medium effort for stills; pin the model; fix on stills first. |
| Parallel agents return the same thing | Give each a different brief and numeric limits. |
| Shows a result nobody measured | Relabel as Illustration or Simulated, or remove it. |

## Brief template

Fill in every line with a number or a named value. A line you can't fill is
a question for the owner.

```text
Piece:        <name> for <surface: page section | README card | film | still>
Provenance:   <Recorded | Simulated | Illustration>
Evidence:     <link, or "none: illustration only">
Story:        <one sentence of state change, for example hold -> refusal -> new choice>
Tool:         <scene kit | animation library | plain HTML/CSS/JS | card builder | film scripts>
Clock:        <timing file; events with times; total duration; fps>
Seek:         <function name, for example window.LangSpanHero.renderAt(seconds)>
Size:         <desktop px>; phone cut 1080 x 1350; text at least 28 px in frame
Motion:       entrance, exit, feedback and state values from the standard; exceptions <list or none>
Palette:      brand tokens only; extra colors <list or none>
Banned:       <defaults list, plus additions>
Loop:         <none | frames 0 to N - 1, N = ...>; stops after <n> loops
Reduced:      <what the static state shows>
No JS:        <what the fallback shows>
Delivery:     <WebM then MP4, poster, preload none | inline HTML | SVG card>
Done when:    <checks with thresholds: freezes, decode, sizes, seam, seeks, playback by a person>
Model:        <pinned model>; effort <medium for stills, high for build>
Limits:       <at most N processes, N stills per round>
```
