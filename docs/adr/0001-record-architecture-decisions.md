# 1. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-11-22

## Context

The game is built over many conversations with Claude, whose memory of a long chat is a compressed summary. Decisions and the reasons behind them get lost, and later work can undo them by accident. GitHub Issues hold plans and ideas, and CLAUDE.md holds the rules, but neither keeps the reasoning behind a technical choice in one place.

## Decision

We keep Architecture Decision Records (ADRs) in `docs/adr/`, one short Markdown file per decision, numbered in order (`0001-…`). Each has a status (Proposed, Accepted, Superseded by NNNN), the context, the decision and its consequences. A decision is never edited away: when it changes, a new ADR supersedes the old one, and the old one's status says so. Decisions made before this ADR were written up retroactively on 2026-11-22.

## Consequences

Anyone (a new conversation, a future collaborator) can see what was decided and why. Writing an ADR adds a small step to each significant decision. Issues stay the planning tool; an ADR is written when an issue's discussion turns into a lasting decision, and links back to it.
