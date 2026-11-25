# 19. Proper writing by default; "chaos crush" allows scribbling

- **Status:** Accepted (supersedes the settings in ADR 0018)
- **Date:** 2026-11-25
- **Issue:** #51

## Context

ADR 0018 added a tidiness check with a "normal" (fairly lenient) setting and an opt-in strict "chaos-proof" setting. That was the wrong way round. Normal play should require proper writing. The first player simply loves scribbling all over his numbers after writing them, and that should be a choice, not the default.

## Decision

- **Normal (default):** the tidiness check uses the strict thresholds (`TIDY` in `js/glyphs.js`). Scribbles and decorations over a number aren't accepted, and "I wrote…" isn't offered for an unreadable box.
- **🖍️ Chaos crush** (per player in 👥, field `quillChaos`; a checkbox in the sandbox): the tidiness check is skipped. A recognisable number counts even with teeth and flags added, and "I wrote…" is available.
- The lenient middle setting is dropped.

## Consequences

On distorted synthetic digits about 80% of clean numbers pass in normal play, while decorated ones mostly fail (at most about 20%). Very wobbly honest writing will sometimes be asked to try again; retune `TIDY` with real samples (the Milestones report counts "too messy"). The `quillStrict` field from ADR 0018 is unused.
