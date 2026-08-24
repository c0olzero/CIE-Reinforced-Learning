# Changelog

All notable changes to this project are documented here, newest first.

**Versioning:** [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`.

- **MAJOR** — a breaking redesign (rare): e.g. restructuring how progress
  or high scores are stored, or a fundamental change to the engine.
- **MINOR** — a new module, a new game/tab, or a genuinely new feature
  added to an existing game.
- **PATCH** — fixes, tuning, and polish to something that already exists.

Each version bump gets an entry here and a matching `git tag` (e.g. `v1.0.0`).

## [1.4.0] - 2026-08-24

### Added
- **Times Table Lab**: a Venn Sort quiz tab. Two overlapping circles are
  each labelled "Divisible by N" for a random pair of numbers 2-9; of
  three number tiles, exactly one truly belongs somewhere in the
  diagram (the other two divide evenly by neither circle's number, so no
  drop zone will ever accept them). Correctness is checked live against
  wherever the tile is actually dropped, not a pre-picked "intended"
  answer. The zone under the tile lights up while dragging, and the
  celebration screen always shows the real division facts either way.

### Changed
- **Times Table Lab**: removed the "Shift by 10 & 100" tab — every one of
  its questions could be answered by moving the decimal point without
  ever reasoning about the multiplication, which taught pattern-matching
  rather than the objective. The Arcade tab's Normal/Hard picker now
  explains that Normal is whole numbers only and Hard mixes in decimals.
- The on-screen question prompt (`hud-q`) now sits centred partway down
  the stage instead of pinned to the top-left corner.

### Fixed
- **Telling Time**: Convert It could still ask to convert a unit *into*
  days from anything smaller than an hour (e.g. "86,400 seconds = ? days")
  — the exclusion only checked the "from" unit, not the "to" unit.
- Every quiz and arcade game now avoids repeating the exact same question
  twice in a row (audited across all 7 modules).

## [1.3.1] - 2026-08-23

### Fixed
- **Fraction Lab**: Add & take away's explanation now shows the real
  stacked numerator/line/denominator glyph used everywhere else, not a
  "1/10" slash string.
- **Place Value Lab**: renamed the mislabelled "Fraction Bench" tab to
  "Number Bench", and fixed Compare & Order sometimes showing an empty
  stage above the answer buttons for one of its two question shapes.
- **Times Table Lab**: renamed the mislabelled "Fraction Bench" tab to
  "Multiplication Bench".
- Four cross-module string-key collisions, all from the shared i18n table
  merging same-named keys from different modules so whichever loaded last
  silently won for all of them: `gBench`/`benchHelp` (Fraction, Place
  Value and Times Table Lab all used the same generic keys) and `yes`/`no`
  (Solid Lab and Symmetry Lab). Every module now uses its own prefixed key.
- The dev server (`python -m http.server`) sent no cache headers at all,
  letting browsers heuristically cache edited files and serve them stale
  on a plain reload — independent of, and able to undermine, the service
  worker's own caching. `devserver.py` wraps it to add
  `Cache-Control: no-store` on every response. Also had the page call
  `registration.update()` after registering the service worker (and again
  on regaining focus), since the browser's own automatic update check is
  throttled to roughly once per day per registration and could otherwise
  leave a stale worker running for hours after a fix landed.

## [1.3.0] - 2026-08-23

### Changed
- **Telling Time** — Clock Bench: the 24-hour readout now sits beside the
  12-hour AM/PM readout instead of below it, and dragging the minute hand
  past the 12 correctly rolls the hour forward/back instead of snapping
  back. Convert It's "12-Hour or 24-Hour?" tab is now a Conversion Quiz
  aimed at time-unit conversion (minutes/hours/days) instead of notation,
  and no longer offers converting days into anything smaller than hours.
  The Unit Converter shows a thousand separator, and its slider's minimum
  and step size scale to the bigger unit when converting up (e.g.
  hours→days steps in half-days). Elapsed Time's three question types
  share one font size and are colour-coded only on the equation itself
  (gold for addition, blue for subtraction, green for a plain duration);
  its answer screen now shows a line-graph timeline with hour marks
  instead of bare numbers.

## [1.2.0] - 2026-08-23

### Added
- **Times Table Lab**: an Arcade tab. A 4x4 grid — random row and column
  headers around a 3x3 play area — where you drag a number tile onto the
  cell whose row and column multiply to match it. Filling a whole row or
  column clears it for points (more for clearing both at once); a wrong
  placement costs points. Hard mode's row headers can be decimals. This is
  the project's first drag-and-drop interaction (tap-to-place still works
  as the keyboard-accessible path).

## [1.1.0] - 2026-08-23

### Added
- **Telling Time** (Geometry & Measure, 4Gt.01–.04): Clock Bench (drag hour
  and minute hands, watch the 12-hour and 24-hour digital readouts update
  live), a Calendar & Units bench (days-in-month, the leap-year rule, and
  live weeks-to-days / hours-to-minutes-to-seconds conversions), and three
  quizzes — Read the Clock (nearest-minute reading, with distractors built
  from the real ways a kid misreads a clock, not random numbers),
  12-Hour or 24-Hour? (notation conversion both directions), and Elapsed
  Time (duration or end-time, shown on a timeline rather than bare numbers).

## [1.0.1] - 2026-08-22

### Fixed
- **Mirror It**: the seed shape's own edges could pass exactly through a
  background grid dot (a straight line between two lattice points crosses
  a third whenever their row/column offsets share a common factor), which
  read as a spare, ambiguous vertex. Edges are now checked for this and
  regenerated until every one is clean. This also caught a second bug it
  exposed: the previous constraint checked every pair of vertices instead
  of just the polygon's edges, which is mathematically impossible to
  satisfy for 5+ points — so 5- and 6-point shapes silently always fell
  back to the same hardcoded triangle. Shapes are now capped at 5 points
  (6 didn't leave enough room to reliably avoid the bug) and randomize
  properly again. A related case slipped through the first pass: three of
  the shape's *own* vertices could land exactly in a straight line, which
  looks identical to a stray dot sitting in the middle of an edge even
  though no background dot was involved — candidates with a collinear
  triple are now rejected too.

## [1.0.0] - 2026-08-22

Versioning starts here. This entry covers everything the project could do
as of this date, most recently:

### Added
- **Symmetry Lab** (Geometry & Measure, 4Gg.07 + 4Gp.03): Line Lab (regular
  polygons with their own lines of symmetry highlighted), Mirror It (an
  11x11-point grid mirrored across two dividing lines), a "Symmetrical or
  not?" quiz that randomizes between block shapes, line-art polygons and
  multi-colour patterns, and an Arcade with two modes — Sweeper (the line
  spins) and Revolver (the shape spins, the marker stays still).
- `engine/arcade.js`: an optional `modePicker` hook so an arcade game can
  add its own mode choice to the ready screen.

### Changed
- **Fraction Lab** — Bench: numeral pinned to the top of the stage, bar on
  its own row with pie and grid balanced below it at matching size,
  numerator and denominator both sliders (denominator up to 20). Compare
  it / Add & take away: each question now randomizes between numbers, a
  vertical bar, or a pie, sized off the actual stage rather than a fixed
  guess; Add & take away's second shape turns blue for subtraction.
- Enlarged Place Value, Fraction Lab and Times Table Lab bench content so
  the stage isn't mostly empty space around a small centred picture.
- Times Table Lab: the bench grid is interactive — click a chip or a
  column to preview that fact.
- Added Place Value Lab; gated the app to desktop and tablet-landscape.
- Added Times Table Lab and strand-based hub navigation.

### Baseline (pre-versioning)
- Solid Lab, Angle Lab, Fraction Lab and the core hub/engine — the
  original set of modules the project launched with.
