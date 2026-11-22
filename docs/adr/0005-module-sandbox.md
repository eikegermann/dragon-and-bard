# 5. A sandbox to develop and judge modules before they go on the map

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

New puzzles need trying out at different settings, with honest numbers on how a child does, without risking the real save.

## Decision

`sandbox.html` runs any module with any preset or custom parameters and party, then shows a results screen: outcome, rewards, first-try rate, typical answer time, every attempt, a thumbs up or down, notes and a copyable report. It never writes the real save. New modules are built and judged here first, and only then put on the map.

## Consequences

A safe place for parents and testers too. The sandbox becomes the basis of Practice mode (ADR 0016) and the placement check (#49).
