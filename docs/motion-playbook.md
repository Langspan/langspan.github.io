# Motion and visual content playbook

Use this playbook when you produce an animation, demo, loop, film or still
for the site or the README cards. Its rules come from practitioner
experience with making short animated work with an AI model.

[AGENTS.md](../AGENTS.md) and the [maintenance guide](website-maintenance.md)
still own the brand, the product claims and the review process. Where this
file and those documents disagree, they win.

## The site's tools

Build with what the site already has. Add a tool only when the brief needs
it, and record its provenance as the existing components do.

| Need | Use |
| --- | --- |
| Scene with windows, prompts and code | The vendored Stageshow kit in `demo-src/` ([guide](../demo-src/README.md)), built to `assets/coordination-demo.js` |
| Short state transitions on the page | The local Motion mini; elements are never hidden by default |
| Drawn or diagram motion | Plain HTML, CSS and JavaScript in `assets/`, with a seek function |
| README cards | `motion/cards/build.mjs` ([guide](../motion/cards/README.md)) |
| Films and social cuts | `marketing/scripts/` and FFmpeg ([guide](../marketing/README.md)) |

GitHub Pages serves committed static files. `demo-src/` is the only build
step; commit its generated bundle with its source.

Copy, scene offsets and motion values live in `marketing/story.json` and
`marketing/parallel-story.json`. Read them before you write a brief, and
change them there rather than in a single renderer.

## Before you start

- **Match effort to the stage.** Plan, storyboard and iterate on stills at a
  medium reasoning effort. Switch to high for the long build. Avoid the
  maximum effort level for visual work: it costs about three times as much,
  is not reliably better, and can spend a turn thinking without output.
- **Pin the model.** Name the model explicitly in every script and batch
  command, so no run bills on a model nobody chose.
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
| smooth | `cubic-bezier(.2,0,0,1)`, 300 ms |
| bouncy | spring, damping ratio 0.8 (one overshoot) |
| fast | 150 ms feedback; cuts on a beat grid |
| big enough | hero at least 160 px tall at 390 px width |
| clean | at most 2 colors outside the brand palette (target: 0) |
| subtle | opacity 0 to 1 and 8 px of travel, nothing else |

A beat grid has `fps * 60 / BPM` frames per beat. At 24 fps and 120 BPM a
beat is 12 frames.

### Ban the defaults by name

Defaults leave only when you name them. Start every brief with this list and
add to it:

- Purple or rainbow gradients, glow orbs, lens flares, particles.
- Camera drift or zooms that add energy without explaining anything.
- A fake cursor, typing or clicking: requests come from agent sessions.
- Labels, subheads or badges that the brief does not ask for.
- Off-brand color: use warm white `#F4F3EF`, near-black `#151513`, slate
  `#3F3E44` and coral `#D87859`, with the darker text variants in `assets/`.

### Timing comes first

Write the clock before any motion: a list of events with their times in
milliseconds or frames, or a beat grid. One timing source drives picture,
captions and sound, so they cannot drift. Land a sound hit one frame after
its picture event. On this site the timing source is the story file, for
example `stageshow.offsetsMs` in `marketing/story.json`.

### The `renderAt(t)` contract

Expose one function that draws any frame from a time, with no other input.
An agent can then render, check and fix any frame on its own, and the film
scripts can capture it. Follow the existing contracts:
`window.LangSpanCanvas.render(seconds)`, `window.LangSpanParallel.seek(seconds, count)`,
`window.LangSpanBenchmark.seek(seconds)`, `window.LangSpanProduct.seek(seconds)`
and the `controlled` state prop on the Stageshow `Stage`.

Seeking pauses playback. The same `t` draws the same pixels whether you
reach it by playing or by jumping.

## Motion defaults

Use the values in `marketing/story.json` first (`enterMs` 300,
`feedbackMs` 150, curve `cubic-bezier(.2,0,0,1)`, 24 fps, 2x capture).
For motion those values do not cover, start here:

| Motion | Value |
| --- | --- |
| Entrance | `cubic-bezier(0.16, 1, 0.3, 1)` |
| Exit | `cubic-bezier(0.7, 0, 0.84, 0)`, 40 to 50 percent shorter than the entrance |
| Pop, used rarely | `cubic-bezier(0.34, 1.56, 0.64, 1)` |
| Interface feedback | 100 to 200 ms |
| Section or hero reveal | 600 to 900 ms |
| Stagger | letters 1 frame, words 60 to 120 ms, list items 40 to 80 ms |
| Overlap | the next move starts at 30 to 50 percent of the previous one |

**Springs as damping ratios.** State the ratio, not a feel: 1.0 settles with
no bounce, 0.8 overshoots once, 0.5 overshoots twice. Most state changes on
this site use 1.0.

**Closed-form motion.** Write every position, opacity and spring as a
function of `t`. Carry no state between frames. A physics step that
accumulates per frame breaks seeking and makes captures differ from
playback.

**Motion explains state.** Each move shows a hold, a request, a refusal, a
notice or a choice; remove a move that explains nothing. Motion never fakes
an agent action and never shows an outcome LangSpan has not measured. Label
a simulation as simulated, on the visual and in its caption, and keep an
authored illustration, observed behavior and a measured outcome distinct.

## QA that measures motion

A reviewer that checks only stills passes a frozen animation. Measure the
motion as well:

1. **Freeze detection.** Run FFmpeg's `freezedetect` filter on a draft render.
   Every freeze that the brief does not call for is a bug.
2. **Change per second.** Plot the mean pixel change per second across the
   render. Compare it with the timing list: peaks sit on events, and holds
   are flat only where the brief says to hold.
3. **Times from a tool.** Read frame times and durations from `ffprobe`, the
   seek function or the timing file. Never accept a time a model typed.
4. **An independent reviewer.** The agent that built the piece does not
   review it. The reviewer gets the brief and the output, and tries to break
   it: clipped text, wrong claims, seams, reduced motion, no JavaScript.
5. **Press play.** A person watches anything that moves or makes sound, in
   the browser and, for README cards, in GitHub's image view, before it
   ships. Screenshots are not playback.

Design collisions out rather than fixing them later: give each actor its own
lane, and put moving objects behind text, never across it.

Record the checks you actually ran, with their values, in
`docs/marketing-overhaul.md` or the pull request.

## Framing at phone size

- Judge at the size people see it: 390 px and 320 px wide, as well as
  desktop. A wide scene shrunk to a phone is not a compact layout; build a
  separate composition, as the Stageshow demo and the compact card do.
- Set a minimum size in pixels for the hero of each shot, and have the agent
  measure and report it. First drafts frame too wide.
- Cut on the beat instead of zooming to add energy.
- Keep text fully in frame or fully out. Never crop a disclosure or evidence
  label.

## Define done

Tell the agent what finished means, with numbers. A long run without a
definition ends early with a list of what is left. A typical definition:

- Renders and decodes without errors, at the stated size and frame rate.
- Every QA check passes and is reported with its value.
- The loop seam is clean (see [loops and export](#loops-and-export)).
- Reduced motion and `?motion=static` show the complete final state.
- The content reads without JavaScript.
- Every visual is labeled as an authored illustration, a simulation, observed
  behavior or a measured outcome, and matches its evidence.

On a long run, commit as you go. Lock the style with one approved still or
clip before the full build. Models tend to add things, such as labels and
subheads, rather than remove them, so say what to remove.

## Prompt style

- Write fewer, better rules. A model follows strict rules to the letter, old
  "never" lines pile up and conflict, and capitals or "you MUST" do not help.
- Name exactly what is approved, instead of "use your judgment" or "act
  freely".
- If you want short notes back, ask for them. Effort level does not change
  reply length.

## Agent teams

- Give each agent a different brief, not the same brief under another name.
- Write limits as numbers: "at most 2 render processes", "at most 3 stills
  per round".
- Keep the shared rulebook short. A growing process document slows output.

## Loops and export

- **Loops render frames 0 to N-1.** Never render frame N: it duplicates frame
  0 and the loop stutters. Frame N-1 flows into frame 0 in position,
  velocity, color and light.
- **Render frame by frame.** Capture headless from the seek function, not by
  recording the screen. For motion blur, average sub-frames.
- **Video.** H.264 High profile, `yuv420p`, at most 60 fps (the site uses 24),
  `-movflags +faststart`. With sound: AAC, -14 LUFS integrated, true peak at
  or below -2 dBTP, measured after the AAC encode. The current films are
  silent.
- **GIF and social.** Check the target platform's current limits on file
  size, dimensions and frame count before you render, and write them into
  the brief as numbers.
- **README cards.** Finite or short loops, a motionless still for each
  variant, no scripts or external resources, as
  [the card guide](../motion/cards/README.md) describes.

## When it goes wrong

| Symptom | Fix |
| --- | --- |
| Looks generic, like every other demo | Replace each adjective in the brief with a number; name the banned defaults. |
| Reviewer passed it, but nothing moves | Run `freezedetect` and the change-per-second plot; review motion, not stills. |
| Captured frames differ from playback | Remove per-frame state; make motion a closed-form function of `t`. |
| Loop stutters at the seam | Render frames 0 to N-1; match frame N-1 to frame 0 in pose and velocity. |
| Unreadable on a phone | Judge at 390 px; set a minimum hero size; build a compact layout. |
| Text clipped at an edge | Keep text fully in or out of frame; give it its own lane. |
| Elements collide or overlap | Separate lanes, or put the object behind the text. |
| Sound drifts from picture | Drive both from one timing file; hit one frame after the event. |
| Run ends early with a to-do list | Define done with numbers; commit as you go. |
| Extra labels and subheads appear | Lock the style with an approved example; list what to remove. |
| Costs rise without better output | Drop to medium effort for stills; pin the model; fix on stills first. |
| Parallel agents return the same thing | Give each a different brief and numeric limits. |
| Shows a result nobody measured | Relabel as illustration or scenario, or remove it. |

## Brief template

Fill in every line with a number or a named value. A line you cannot fill
is a question for the owner.

```text
Piece:        <name> for <surface: page section | README card | film | still>
Claim type:   <authored illustration | simulation | observed behavior | measured outcome>
Evidence:     <link, or "none: illustration only">
Story:        <one sentence of state change, for example hold -> refusal -> new choice>
Tool:         <Stageshow | Motion mini | plain HTML/CSS/JS | card builder | film scripts>
Clock:        <events with ms or frames; total duration; fps>
Seek:         <function name, for example window.LangSpanX.seek(seconds)>
Size:         <desktop px>; compact <px>; hero at least <px> at 390 px width
Motion:       easing <cubic-bezier>; durations <ms>; springs <damping ratio>
Palette:      brand tokens only; extra colors <list or none>
Banned:       <defaults list, plus additions>
Loop:         <none | frames 0 to N-1, N = ...>
Reduced:      <what the static state shows>
No JS:        <what the fallback shows>
Done when:    <checks with thresholds: freezes, decode, sizes, seam, playback by a person>
Model:        <pinned model>; effort <medium for stills, high for build>
Limits:       <at most N processes, N stills per round>
```
