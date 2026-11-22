# 4. Encounters are pluggable modules with a shared contract

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

Encounters were first written inside the game code. New puzzle types kept coming (phonics, clocks, counting), and each needed testing on its own and reuse in different places.

## Decision

Each encounter type is a module in `js/modules/` that registers `{id, name, screen, defaults, presets, html, bind(), start(params, run), abort()}` with the runner in `js/core.js`. The runner hands the module a `run` object: `party` (host adapters), `asked()`, `answered(correct, item)`, `reward(kind, n)`, `flag(name)`, `skip()`, `retreat()` and `finish(outcome)`. The host (the game or the sandbox) decides what rewards and outcomes mean.

## Consequences

Modules don't know about the map, the save or each other, so they can be tested alone and placed anywhere. Answer timing and first-try statistics come from the runner for free. Every new module needs presets and a player in `tests/smoke.py`.
