# 15. GitHub Issues are the single planning tool

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

Ideas come fast during play and conversation. A kanban board wasn't usable from Claude's side, and plans scattered over chats get lost.

## Decision

All ideas, plans and decisions in progress go into GitHub Issues with labels (`next` = agreed upcoming work). When something is built or decided, the issue gets a comment. Lasting technical decisions also get an ADR.

## Consequences

One place to look. Issues are created through the REST API from Claude's side (`gh issue create` is blocked).
