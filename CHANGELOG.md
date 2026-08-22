# Changelog

All notable changes to this project are documented here, newest first.

**Versioning:** [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`.

- **MAJOR** — a breaking redesign (rare): e.g. restructuring how progress
  or high scores are stored, or a fundamental change to the engine.
- **MINOR** — a new module, a new game/tab, or a genuinely new feature
  added to an existing game.
- **PATCH** — fixes, tuning, and polish to something that already exists.

Each version bump gets an entry here and a matching `git tag` (e.g. `v1.0.0`).

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
