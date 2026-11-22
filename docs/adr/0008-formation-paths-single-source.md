# 8. One set of formation paths for guides, animation and recognition

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

Guided writing needs arrows and an animation showing how each character is formed, and the recogniser needs examples of each character.

## Decision

`js/glyphs.js` holds each character as strokes in a 100 × 140 box, in the taught order and direction (Victorian Modern Cursive foundation shapes). The same paths draw the dashed guides and numbered arrows, animate the model, check start point and direction, and serve as recognition templates (with a few variants and stretched copies).

## Consequences

Change a shape once and everything follows. The paths still need checking against an official Victorian Modern Cursive chart or by an occupational therapist. Other states' styles could be added later as other path sets.
