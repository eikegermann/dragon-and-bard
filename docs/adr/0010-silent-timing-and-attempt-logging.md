# 10. Answer timing is recorded silently, never shown or rewarded

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

Adaptive difficulty (#42) needs to know how a child is doing: right or wrong, first try or not, quick or slow. Speed pressure, though, harms young learners and encourages rushing.

## Decision

Modules call `run.asked()` when a question appears and `run.answered(correct, item)` for every attempt. The runner records time per attempt (capped at 60 seconds for the typical-time figure) and first-try success. Timing is never shown to the child or used for rewards.

## Consequences

The data for adaptive levels, spaced review and the placement check is already being collected. Parents can see it in the sandbox report; a progress view in the game is still to come.
