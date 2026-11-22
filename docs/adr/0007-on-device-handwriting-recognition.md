# 7. The quill recognises handwriting itself, finger first

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

The quill first relied on Apple Pencil Scribble, which turns handwriting into text only with an Apple Pencil on an iPad. Not every family has one (a broken Pencil stopped the quill working in playtesting), and testers will have all kinds of devices.

## Decision

The quill has its own recogniser: the $P point-cloud recogniser (Vatavu, Anthony and Wobbrock 2012), written from the paper, running on the device. Finger drawing is the default; any stylus or Pencil works too. Three levels: Trace (pick, watch, follow arrows), Remember (the guide fades) and Free (asks "7 or 1?" when unsure, "Show me how" always available). When the answer is known, the picked number is checked before tracing so a wrong answer isn't traced in vain.

## Consequences

Works on any touch device, offline, with no data sent anywhere. Recognition is good but imperfect (tuned on distorted synthetic digits; real children's writing will differ), so asking when unsure is part of the design. Because strokes are recorded, the game can check where a character was started and which way it went, which Scribble never could. Digits only so far (#51).
