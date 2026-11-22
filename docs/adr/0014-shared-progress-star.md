# 14. A shared progress star for encounter goals

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

Encounters showed progress with rows of faces and stars, which was busy on the page.

## Decision

`starMeter(el, {got, need, extra, style})` in `js/core.js` draws a star with a counter inside that turns gold when enough is done to win, plus one ring (or music note, for songs) per possible extra success, lighting up gold as they come. Used by rhymes, word search and clocks.

## Consequences

One clear "enough to win" moment, then extras on top. Lighter on the page. Themed counters for each encounter (an arpeggio on a stave for songs, a pie-chart clock face) are planned (#54) and can replace the star per module without touching the module's logic.
