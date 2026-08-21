# Workbench

Free, interactive mini-games for the Cambridge Primary curriculum.
Static site. No accounts, no analytics, no data leaves the device.

## Running it

It is a plain static site — no build step, no dependencies to install.

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

It must be served over http(s), not opened as a `file://` path: ES modules are
blocked on `file://` for security reasons. GitHub Pages serves it as-is.

## Layout

```
index.html                  markup shell only
engine/                     shared, loaded once
  main.js                   boot + routing; fetches modules on demand
  catalogue.js              what exists: subject, stage, objectives, loader
  i18n.js                   core strings + addStrings() for module strings
  dom.js                    h(), timers, resize observer, shared utilities
  ui.js                     HUD, celebration overlay
  arcade.js                 arcade shell: clock, score, combo, difficulty
  audio.js                  synthesised chimes (no audio files)
  store.js                  localStorage: high scores and difficulty, nothing else
games/                      reusable game mechanics
  spawner.js                slot-grid spawner for tap-the-shape arcades
subjects/<subject>/stage<N>/
  <module>.js               the module: its games and their logic
  <module>.strings.js       its text, one block per language
styles/                     base, games, responsive
sw.js                       service worker: offline + installable
```

## Adding a module

1. Write `subjects/<subject>/stage<N>/<name>.js` exporting
   `default { games:[{id,name,blurb,render,full,rainbow}] }`.
2. Write `<name>.strings.js` exporting `{ en:{...}, vi:{...} }` and call
   `addStrings()` at the top of the module.
3. Add an entry to `engine/catalogue.js` with its stage, objectives and a
   `load:()=>import(...)`.

Nothing else changes. Only the modules a visitor opens are ever downloaded.

## Adding a language

Add a block to `engine/i18n.js` and to each `*.strings.js`. No game code
changes. Every string a module needs lives beside it.

## Curriculum coverage

Each catalogue entry lists the Cambridge objective codes it covers, so gaps are
visible and a teacher can find the game for a given objective. Stage 4
Mathematics (0096) has 46 objectives; see the coverage map in the project notes.

Built: 4Nf.01–.07 (Fraction Lab), 4Gg.05–.06 (Solid Lab), 4Gg.08–.09 (Angle Lab).

Objective codes are referenced for navigation. The framework text itself is
Cambridge's copyright and is not reproduced here.

## Verifying a change

`node verify.js` bundles the module graph, loads it in a headless DOM, opens
every tab of every module and reports any runtime error.
