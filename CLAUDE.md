# Workbench

Free interactive mini-games that reinforce the Cambridge Primary (CIE) curriculum.
Built for one Grade 4 learner first, but published for any kid following CIE.
Static site on GitHub Pages. Long-run project — expect it to grow to many
subjects across Stages 1–12.

## Non-negotiables

- **No tracking of any kind.** No analytics, no accounts, no progress records, no
  data leaving the device. Only two things persist, both in `localStorage`:
  arcade high scores and the Normal/Hard preference. Do not add more without
  asking. Never suggest cookies for this — a cookie is sent with every request,
  which is strictly worse for privacy than `localStorage`.
- **Bilingual EN + VI, always.** Every user-facing string ships in both. A new
  language must be addable without touching game code.
- **No build step.** Native ES modules served as-is. `esbuild` and `jsdom` are
  dev-only, for verification.
- **Free and accessible.** Every game playable with a keyboard, text contrast
  ≥ 4.5:1, honour `prefers-reduced-motion`, never encode an answer in colour alone.
- **Desktop and tablet-landscape only.** A phone-sized viewport gets the
  blocking message in `index.html`'s `.phoneblock`, not a squeezed layout —
  the arcade roads and side panels genuinely don't fit. The gate is pure CSS
  (`styles/responsive.css`, keyed off the viewport's shorter side) so it
  shows instantly with no flash of the real app first. Don't reintroduce a
  cramped phone layout to "fix" this; the fix was deciding phones aren't a
  target, not squeezing harder.

## Rules that are easy to get wrong

- **Anything the hub displays must live in `engine/catalogue.js`** — card titles
  and blurbs as inline `{en,vi}` text. The hub draws every card before any module
  is fetched. Putting a card title in a module's strings file makes it render
  blank until that module is opened. This has already happened once.
- **Every catalogue entry needs a `strand`** (`number` / `geometry` / `stats`,
  matching `STRANDS` in the same file). The hub's first screen is a strand
  picker; a module without one is unreachable from it, not just uncategorised.
- **A module's own strings live beside it** in `<module>.strings.js`, registered
  with `addStrings()`. Only strings shared across modules go in `engine/i18n.js`.
- **Relative paths only.** The site is served from a repository subpath
  (`/CIE-Reinforced-Learning/`), so a leading `/` breaks everything. Filenames are
  lowercase; GitHub Pages is case-sensitive even when your computer is not.
- **The service worker must stay network-first.** Cache-first serves stale code
  after every deploy and makes iteration miserable.
- **Must be served over http, not opened as a file.** `python3 -m http.server 8000`.

## Verify before pushing

    node verify.js

Bundles the module graph, runs it in a headless DOM, opens every tab of every
module and reports runtime errors. It has caught real bugs the eye missed. If a
change touches game logic, also write a throwaway simulation of the maths and run
it — most bugs in this project were found that way, not by reading.

## Curriculum stance

- Content is aligned to the Cambridge framework and tagged with objective codes
  (`4Nf.03`) in the catalogue, so gaps are visible and a teacher can find the game
  for an objective.
- **Stay inside the stage.** Reflex angles are Stage 5, not 4 — they were removed
  for this reason. Improper fractions and mixed numbers are Stage 5. Percentages
  are new at Stage 4 and deserve real space. There is no Money strand at Stage 4.
- Reference objective codes; do not reproduce Cambridge's framework text. It is
  their copyright.

## Design rules learned from playtesting

- **Pacing is the difficulty, not the maths.** A kid who answers nine questions
  and understood them all had a better session than one who saw twenty and
  guessed. When something feels too hard, slow it down before simplifying it.
- **Randomise orientation in quizzes.** Angles are drawn at a random rotation so
  the answer can't be read off "is the arm above the horizon".
- **Never let colour leak the answer.** The angle wedge stays neutral amber until
  answered; colouring it by type let a kid learn six colours instead of angles.
- **Compare like with like.** Two fractions being compared must be drawn on
  identical-length strips, or the picture teaches the opposite of the point.
- **Distractors must be plausible.** Near-misses and the classic error (counting
  unshaded parts, adding denominators), never a random number.
- **Show the proof with the verdict.** Explanations ride inside the celebration
  overlay so the picture that proves the answer isn't hidden behind it.

## Traps already hit — do not reintroduce

- **Unbounded generation loops.** `while (options.size < 4)` froze the tab
  permanently when fewer than four valid values existed. Use `pickOptions()`,
  which draws from a real pool and returns fewer buttons rather than hanging.
- **`hidden` does nothing against `display:flex`.** Any element you hide with the
  `hidden` attribute needs an explicit `[hidden]{display:none}` rule.
- **`:hover` matches ancestors.** Elements nested inside each other (cube faces)
  all match, lighting up the whole chain. Track hover from `pointermove` instead.
- **`setPointerCapture` retargets the subsequent `click`** to the capturing
  element, so clicks on children never arrive. Resolve taps on `pointerup` from
  the element recorded at `pointerdown`.
- **SVG strokes straddle the path.** Outlining a shape bleeds half the stroke onto
  its neighbour and z-fights in 3D. Draw highlights as a separate inset shape.
- **Don't stamp layout onto a caller's element.** A shared class that sets
  `display` will override the layout of whatever it's applied to.
- **Cancel in-flight animations when dealing a new question**, or the old
  animation keeps driving the new one.
- **Disconnect `ResizeObserver`s.** Use `observeSize()`, which debounces to one
  callback per frame and unregisters on navigation.
- **Measure a tap by distance from the press point**, not accumulated path length
  — hand tremor accumulates and swallows legitimate taps.

## Tuning constants

Grouped at the top of their section, all named:

- Arcade pacing: `TM_HARD` / `TM_NORMAL` in `engine/arcade.js`. Every duration in
  every arcade is a base value times `tm`, so difficulty is one number.
- Runner: `RUN_GATE_SECS` (seconds per gate on Normal), `RUN_HARD`, `RUN_BOOST`,
  `RUN_STEP`, `RUN_CAP`, `RUN_POINTS`.
- Shape arcade: `ARC_LIFE`, `ARC_FADE`.

Speed is expressed as a cadence and converted to pixels from the actual play area,
so the game runs at the same difficulty on a phone and a wide monitor.

## Adding a module

1. `subjects/<subject>/stage<N>/<name>.js` exporting
   `default { games:[{id,name,blurb,render,full,rainbow}] }`.
2. `<name>.strings.js` with `{en:{...},vi:{...}}`, registered via `addStrings()`.
3. An entry in `engine/catalogue.js` with stage, `strand`, objective codes,
   inline `title`/`blurb`, and `load:()=>import(...)`.

Nothing else changes. Only opened modules are ever downloaded.

## Working style

Explain the reasoning behind non-obvious changes. Say when a request has a
problem rather than implementing it silently — several of the best decisions here
came from pushing back. Verify claims by running something, not by reading.
