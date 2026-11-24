# 17. Hotseat players: shared map, own profiles, active player swapped in

- **Status:** Accepted
- **Date:** 2026-11-25
- **Issue:** #55

## Context

Two children playing on one tablet couldn't agree on how to take turns. The game should run the turns for up to four players on one device, with a shared map but each child's own dragon, bard, badges, comrades and level. The existing game and all modules read the player's state straight from `S` (`S.name`, `S.wiz`, `S.run.pos`, `S.run.prot`, …).

## Decision

- Each player's own data lives in `S.players[i]`: profile fields (name, signature, badges, quill points and level, colours, hats, own dice) and their place in the world under `r` (position, where they came from, shield guards, archers, ghosts, resting comrades).
- The **active player is swapped in**: `activate(i)` stores the current player's fields back into their profile and copies player *i*'s into `S` and `S.run`. Everything else keeps reading `S` as before. `save()` calls a `beforeSave` hook so the profile is always up to date.
- **Shared:** the map, what's discovered (`visited`, `seen`), cleared and resting stops. Anyone can move to any discovered place.
- **Turns:** one encounter per turn; finishing an encounter (win, lose or skip) passes the turn with a "pass the tablet" card. Moving around, retreating and the wardrobe don't.
- **The shared world moves on once per round** (encounter refresh and resting bosses), so more players don't make stops come back faster. Each player's own comrades rest by their own encounters.
- **Boss fights can be played together:** the player who reaches a boss invites the others. The duel module takes a `team` parameter; the game swaps in each member as their duel turn comes (`host.coopTurn`), so archers and quill points are their own. Shared rewards go to every member; `run.reward(kind, n, who)` gives one member their own. After a team win, everyone can travel on together.
- **Kindred fire / kindred frost:** in a team duel the boss's dice set the bar. A player with smaller dice can step up to the boss's dice or stay with their own; staying, the game adds a bonus after each right answer (roll × (boss average ÷ own average − 1), rounded), so every child does maths at their own level and counts the same.
- An older one-player save becomes player 1, keeping everything.

## Consequences

Modules needed almost no changes. Any new per-player field must be added to `PFIELDS` or `RFIELDS` in `js/game.js`, or it will leak between players. A single player is just the one-player case of the same code. Co-op versions of the other gate encounters (addigators, ghost mystery) are still to come, one at a time.
