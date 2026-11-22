# 13. Every spoken line has an id that names its future audio file

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

The bard talks a lot. Lines will be recorded by a voice actor later, and text-to-speech is only a stand-in.

## Decision

All bard lines live in `LINES` in `js/core.js`, grouped by moment, each with an `id` that will be its audio file name (`audio/<id>.mp3`). `say(group)` picks one. `hear(text)` reads other text aloud with the device's own voice.

## Consequences

The recording list can be generated from the code, and swapping in recordings won't touch the modules. The list in the design doc is out of date; `LINES` is the truth.
