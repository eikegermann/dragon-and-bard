# 9. Versioned world map, saves upgraded in place

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

The world grows region by region, and the first player has progress he must not lose.

## Decision

The save records the map version in `S.run.world` (3 at the time of writing). When regions are added, an upgrade step adds them to an existing save, keeping visited places, party and rewards (for example `addHollowAndSwamp`, run by `migrateRun`). A save is never wiped to add content.

## Consequences

Every new region needs its own upgrade step, and the smoke test checks the upgrade. Story mode (ADR 0016) will need a decision on how it relates to the current generated map.
