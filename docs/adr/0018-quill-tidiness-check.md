# 18. The quill also checks tidiness, with a chaos-proof setting

- **Status:** Accepted; settings superseded by [0019](0019-proper-writing-default-chaos-crush.md)
- **Date:** 2026-11-25
- **Issue:** #51

## Context

Playtesting showed the recogniser (ADR 0007) was too forgiving: a number traced correctly and then decorated with flags, teeth, scratches or "bird droppings" was still accepted, because the recogniser only asks which character the ink is *most like*. A determined tester can game that, and handwriting practice should reward clear writing.

## Decision

After recognition, `Glyphs.tidyEnough(strokes, ch, inPlace, strict)` compares the ink with the recognised character's shape (the same formation paths, ADR 0008):

- **precision:** the share of the child's ink that lies near the character (decorations lower it),
- **recall:** the share of the character covered by ink (missing parts lower it),
- **ink:** how much longer the child's lines are than the character (extra strokes raise it).

When tracing over the guide the comparison is in place; otherwise both shapes are normalised first. If the ink isn't tidy enough, the quill says "I'm sorry, I can't read that. Could you write it more clearly?" and offers Try again or Show me how; "I wrote…" isn't offered for messy ink in chaos-proof mode.

There are two settings per player, in 👥: **normal** (rejects most scribbled-over numbers) and **🧹 chaos-proof** (rejects nearly all decorations). Thresholds are in `TIDY` in `js/glyphs.js`.

## Consequences

`node tests/quill_accuracy.js` checks it: with distorted synthetic digits, about 90% of clean numbers pass in normal mode and about 80% in chaos-proof mode, while decorated ones mostly fail (chaos-proof lets through under 20%). Some very wobbly but honest writing will be asked to try again, so thresholds should be retuned with real children's samples; the Milestones report counts "too messy" per number to help with that.
