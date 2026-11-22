# 2. Plain HTML, CSS and JavaScript with no build step

- **Status:** Accepted
- **Date:** November 2026 (recorded 2026-11-22)

## Context

The first player uses an older iPad Pro in Safari. The project is built in short sessions, often by a new conversation, and should be easy for anyone to open, read and run. Testers need a link or a single file.

## Decision

The game is plain HTML, CSS and JavaScript: no framework, no bundler, no dependencies, no build step. Scripts are loaded in order by `index.html` and `sandbox.html`. `tools/bundle.py` can inline everything into one offline HTML file for testers without internet.

## Consequences

Opening a file in a browser is all it takes to run it. Code relies on globals and load order (core before modules), and element ids become global variables, so names must not clash (one bug came from exactly that). If the game grows much larger, a light module system may be worth a new ADR.
