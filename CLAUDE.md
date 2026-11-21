# Dragon & Bard: handover notes

Read this first. It holds what a new conversation needs to pick up the project: the vision, the decisions
already made, how we work, and how the code fits together. The repo is public, so this file contains no
personal details about the player (see Privacy).

## What this is

A learning adventure game for young children (first player: the owner's young son, who calls it
"Dragonbard"). You are a young dragon travelling with a bard who can't read dragon runes. Encounters on a
world map teach maths, reading and phonics, handwriting and probability: dice duels, word searches, rhymes,
clocks, mysteries, counting games. Played as a web game, mainly on an older iPad in Safari ("Add to Home Screen").

- **Play:** https://eikegermann.github.io/dragon-and-bard/
- **Module sandbox:** https://eikegermann.github.io/dragon-and-bard/sandbox.html
- **Owner:** Eike (eikegermann). Builds this with Claude and playtests at home.

### Long-term vision
Prototype → testers (families, homeschoolers) → Kickstarter to pay **human** artists (visual designer first),
then a composer, voice actors and translators. AI-generated art is controversial, so current visuals are
placeholders (emoji, simple SVG) on purpose. Keep the game honest: one-off purchase in future, **no ads, no
upsell, no manipulative rewards**. The gap it aims at: learning that *is* the game mechanic, evidence-aligned
(systematic phonics, explicit handwriting), Australian-curriculum compatible, with transparent parent tools.

## Where things live

- **GitHub Issues are the single planning tool.** Ideas, decisions and plans go there (labels: `next`,
  `backlog`, `later`, `maths`, `reading`, `story`, `world`, `tech`, `polish`, `accessibility`).
  `next` = agreed upcoming work. Comment on an issue when something gets built or decided.
- **Design doc** (Claude Docs, id `VFNen1Fj9CdUrxNMQTvjbD`): pitch, characters, regions, rewards, voice
  recording list. The recording list is out of date: line ids in `js/core.js` `LINES` are the truth.
- **Phonics Ladder doc:** https://claude.ai/artifact/Swq5Hojg7LfLGicfutQg3G
  (Literacy Hub 24-phase progression, Australian English notes, how the game uses it).
- **World map whiteboard:** https://claude.ai/artifact/4d14e569-82e2-4412-b152-8be2811c35cb
- These artifact links are private to the owner.

## Standing decisions (don't relitigate without asking)

**Learning design**
- Phonics follows the **Literacy Hub** progression (compatible with any future school or homeschooling).
- Handwriting follows **Victorian Modern Cursive** foundation shapes. Digit paths in `js/glyphs.js` still
  need checking against an official chart (or the child's OT).
- Quill = **finger first**; any stylus or Apple Pencil also works. Recognition runs on the device.
  Three levels: Trace → Remember (fades) → Free (asks "7 or 1?" when unsure, "Show me how" always available).
  Research basis: numbered arrows plus writing from memory (Berninger et al. 1997).
- Comprehension: answer by *doing* (choose where to search), questions paraphrase the text, one "why"
  question per story. Difficulty dial: picture → word choice → fill the gap → written answer.
- Adaptive difficulty plan (#42): ~85% first-try success target, Elo-style per skill, spaced review.
  **Timing is recorded silently, never shown or rewarded** (no speed pressure).
- Speech input (#48), if ever built: **on-device only**, nothing sent off the device.
- Placement check for parents (#49): story moment, not a test.
- **Three ways to play** (#31): **Story** (linear route, one exit per region, regions follow the word-bag
  clusters in the Phonics Ladder doc), **Explore** (open map, next phase once the current one is practised
  enough, spaced review brings old phases back) and **Practice** (sandbox: pick module and phase).

**Game rules agreed with the owner**
- Farming (replaying encounters) is fine.
- Comrades **rest** instead of disappearing. Skipping an encounter rests a shield guard for longer.
- Party: max 6 shield guards, 3 archers, 3 ghosts. Archers help only when the rival picks the duel.
  Bandits can't read clocks; ghosts help only with clocks.
- Losing a boss or gate has a consequence: it rests for a few adventures. Infinite tries otherwise.
- Map: fog of war, fixed regions, sightings of the next step, under-construction signs for future exits.
- Retreat button top-left, title centred. Duels say "heat", not "stone".
- Default 24-hour clock is the owner's preference for later levels (early levels use 12-hour).

**Privacy and safety**
- **Never put personal details about the child** (name, age, school, health, support team) in the public
  repo, issues or commits. "The player" or "the first player" is fine.
- Never share the owner's email address.
- Any future multiplayer: no free chat with strangers.

## How we work

- Develop modules in the **sandbox** first, give them a thumbs up or down, then put them on the map.
- Run the tests before every push:
  - `CHROME_PATH=/usr/bin/google-chrome python3 tests/smoke.py` plays every sandbox preset (all quill
    levels for Milestones), a game run with retreat, every new stop inside the game, and a save upgrade.
  - `node tests/quill_accuracy.js` checks the handwriting recogniser on distorted digits.
- Look at screenshots at iPad size (1112×834) for anything visual.
- Commit messages: what changed and why, ending with the session's attribution lines.
  Push with `git -c push.negotiate=true push`.
- Issues: `gh api repos/eikegermann/dragon-and-bard/issues --input file.json` (REST; `gh issue create`
  uses GraphQL, which is blocked here). Repo settings can't be changed from Claude's side; ask the owner.
- `python3 tools/bundle.py` makes a single offline HTML file in `dist/` (add `sandbox` for the sandbox).
- Talk to the owner plainly; he prefers results to narration. He's a quick, playful ideas person:
  capture ideas in issues, build when asked.

## Code map

Plain HTML/CSS/JS, no build step, no dependencies.

- `index.html` (game) and `sandbox.html` (module player) load the same scripts.
- `css/game.css`: all styles, grouped by screen.
- `js/core.js`: save/load (`dragonBardSave_v1` in localStorage), bard `LINES` (each line's id is its
  future audio file `audio/<id>.mp3`), `say()`, `hear()` (device text-to-speech), dragon and bard SVG,
  `overlay()`, helpers, and the **module runner** `Modules`.
- `js/glyphs.js`: character formation paths (100×140 box, strokes in taught order) and the $P point-cloud
  recogniser. The same paths draw the guides and act as templates. Digits only so far.
- `starMeter(el,{got,need,extra,style})` in `js/core.js`: the shared progress star (gold at `need`, one
  ring, or music note for songs, per extra success). Used by rhymes, word search and clocks.
- `js/quill.js`: the writing card. `Quill.open({count, prompt, note, onDone, onCancel})`; level in `S.quillLevel`.
- `js/game.js`: world map (regions, generation, fog, signs), party, encounters → modules, rewards, wardrobe.
- `js/sandbox.js`: sandbox setup and results (stats, attempts table, verdict, copyable report).
  It never writes the real save.
- `js/modules/*.js`: one file per encounter type.

### The module contract
A module registers `{id, name, screen, defaults, presets, html, bind(), start(params, run), abort()}`.
`run` gives it `party` (host adapters), `asked()`, `answered(correct, itemText)`, `reward(kind, n)`
(`wiz`, `sch`, `quill`, `guards`, `ghosts`), `flag(name)`, `skip()`, `retreat()` and `finish('win'|'lose')`.
Answer timing and first-try stats come from `asked`/`answered` automatically. The host (game or sandbox)
decides what rewards and outcomes mean. Presets show up in the sandbox automatically. Add a player for
new modules in `tests/smoke.py`.

Modules: `duel` (heat/cold dice duels, bosses), `wordsearch`, `rhyme`, `clock` (stopped clocks, ghost
hints), `scribe` (Milestones: quill practice), `mystery` (ghost dog, ghost hunter), `lilypad` (skip
counting with Old Burble), `addigator` (comparing, place value), `mozzies` (tens and ones).

### World
`S.run.world` is the map version (now 3). Regions: Whispering Forest → Frostpeaks (boss gate) and
Forest → Haunted Hollow (ends with the ghost dog mystery) → Croakmire Swamp (ends at the addigators).
Older saves are upgraded in place (`migrateRun`), keeping progress. When adding a region, write an upgrade
step like `addHollowAndSwamp`, never wipe a save.

## Current state and next steps (Nov 2026)

Open `next` issues: #51 quill (lowercase letters next, then "teach the quill my handwriting"), #50 Haunted
Hollow (ghost hunter story to the tundra later), #47 Listen and spell, #4 sturdier save, #5 tester link.
Other agreed ideas: Wyrms & Vines (snakes-and-ladders game, later an Inn tournament), the Inn, gibberish
(the bard translates gibberish literally), parent settings, adaptive difficulty (#42), placement check (#49).
