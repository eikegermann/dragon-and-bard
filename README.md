# Dragon & Bard

A learning adventure for kids: a young dragon travels with a nervous bard, solving maths, reading and chance puzzles dressed up as duels, ambushes and quests.

Built first for one young dragon fan, played on an iPad. Prototype stage: simple placeholder art, no sound yet.

## Play

Play online at **https://eikegermann.github.io/dragon-and-bard/** (once GitHub Pages is on). On an iPad, open it in Safari and use **Share → Add to Home Screen** for full-screen play.

Progress is saved in the browser on that device.

To share a single offline file, run `python tools/bundle.py` and hand out `dist/dragon-and-bard.html`.

## What's in the prototype

- **World map:** two regions so far, the **Whispering Forest** (about 20 stops) and the **Frostpeaks**, discovered through fog. Spotted stops stay visible; you can walk back. Other exits show "closed for construction" signs.
- **Bosses gate regions:** beat Elder Emberclaw to open the Frostpeaks. Losing costs nothing but time: the boss rests for a couple of adventures, then you can try again.
- **Encounters refresh through play:** finishing an encounter brings the oldest cleared stop in that region back with a new puzzle (✨).
- **Heat duels (Forest, 🔥):** dice-adding race. **Cold duels (Frostpeaks, ❄️):** start high, subtract to reach 0 first. Answer by number pad or the quill 🪶. Some stops let you choose your flame/frost (dice size).
- **Rhyme rescue (🎵):** finish the bard's song by picking the rhyming word. Pictures help at first; later verses are words only. 🔊 reads the verse aloud.
- **Bandit ambush (📜):** word search, themed per region; extra words win over bandits who join as shield guards 🛡️.
- **Comrades:** shield guards scout words or skip a challenge; three train into an archer 🏹. Helpers rest ⛺ after helping.
- **Wardrobe:** badges and quill points unlock dragon colours and bard hats.
- **Retreat** from any puzzle; **⟲** on the map starts over.

## Module sandbox

`sandbox.html` (online: `/sandbox.html`) plays any encounter module on its own: pick a module and preset, edit the parameters, set the party, play, and get the results (outcome, rewards, first-try rate, time per answer). Give it a 👍/👎 with notes and copy the report into an issue. It never touches the game's save.

## Code layout

- `index.html`, `css/game.css`
- `js/core.js`: save, bard lines, art, overlays, and the **module runner** (the interface every encounter uses)
- `js/modules/*.js`: one file per encounter type (`duel`, `wordsearch`, `rhyme`, `clock`). Each module takes parameters, uses the party through a small interface, logs every attempt with timing, and reports outcome and rewards.
- `js/game.js`: world map, party, wardrobe, and the bridge between the game and the modules
- `js/sandbox.js`: the sandbox
- `tests/smoke.py`: plays every preset of every module to the end, plus a short game run (`pip install playwright && playwright install chromium`, then `python tests/smoke.py`)
- `tools/bundle.py`: single-file build

## Design

The full design (world map plans, encounter backlog, recording list) lives in a separate design doc.

All rights reserved.
