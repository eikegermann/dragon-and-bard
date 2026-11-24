# Architecture decision records

Short records of significant decisions about how Dragon & Bard is built, and why (see [ADR 0001](0001-record-architecture-decisions.md)).

**When to write one:** when a decision about how the game works will matter later: a technical approach, a data format, a rule every module follows, a choice between real alternatives. Plans and ideas stay in GitHub Issues; an ADR records the outcome and links back.

**How:** copy [template.md](template.md) to the next number (`0017-short-title.md`), fill it in, and add it to the table below. Never rewrite an accepted ADR's decision: write a new one that supersedes it, and set the old one's status to "Superseded by NNNN".

| ADR | Decision | Status |
|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-plain-web-game-no-build-step.md) | Plain HTML, CSS and JavaScript with no build step | Accepted |
| [0003](0003-github-pages-and-local-save.md) | Host on GitHub Pages and save in the browser | Accepted |
| [0004](0004-pluggable-encounter-modules.md) | Encounters are pluggable modules with a shared contract | Accepted |
| [0005](0005-module-sandbox.md) | A sandbox to develop and judge modules before they go on the map | Accepted |
| [0006](0006-literacy-hub-phonics-progression.md) | Follow the Literacy Hub phonics progression | Accepted |
| [0007](0007-on-device-handwriting-recognition.md) | The quill recognises handwriting itself, finger first | Accepted |
| [0008](0008-formation-paths-single-source.md) | One set of formation paths for guides, animation and recognition | Accepted |
| [0009](0009-versioned-world-in-place-upgrades.md) | Versioned world map, saves upgraded in place | Accepted |
| [0010](0010-silent-timing-and-attempt-logging.md) | Answer timing is recorded silently, never shown or rewarded | Accepted |
| [0011](0011-privacy-on-device-only.md) | Children's data stays on the device | Accepted |
| [0012](0012-placeholder-art.md) | Placeholder art until human artists are hired | Accepted |
| [0013](0013-bard-lines-with-audio-ids.md) | Every spoken line has an id that names its future audio file | Accepted |
| [0014](0014-shared-progress-star.md) | A shared progress star for encounter goals | Accepted |
| [0015](0015-github-issues-for-planning.md) | GitHub Issues are the single planning tool | Accepted |
| [0016](0016-three-ways-to-play.md) | Three ways to play: Story, Explore and Practice | Accepted (not yet built) |
| [0017](0017-hotseat-players-active-swap.md) | Hotseat players: shared map, own profiles, active player swapped in | Accepted |
