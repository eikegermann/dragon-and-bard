# 3. Host on GitHub Pages and save in the browser

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

Testers need a simple link, and the game must work without accounts or servers. Children's data should not leave the device.

## Decision

The game is served by GitHub Pages from the public repo. Progress is saved in the browser's localStorage under `dragonBardSave_v1`. There is no server, no account and no analytics.

## Consequences

No hosting cost and nothing to run. Saves are per device and per browser (a home-screen icon has its own save, separate from a Safari tab), and clearing website data loses them. Syncing between devices and a sturdier save (#4) are open problems.
