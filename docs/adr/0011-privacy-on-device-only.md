# 11. Children's data stays on the device

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

The players are young children. Some planned features (speech input, progress data, multiplayer) could send personal data elsewhere.

## Decision

Nothing about the player leaves the device: no analytics, no accounts, no server. Speech input, if ever built (#48), uses on-device recognition only, with no stored recordings. Any future multiplayer allows no free chat with strangers. The public repo and issues contain no personal details about the child.

## Consequences

Rules out cloud speech services and remote analytics. Syncing saves between devices would need a new, careful decision.
