# Five-question rules

Each game has one memorisation stage followed by five timed recall questions.

- Every daily and Endless board has 16 cards.
- Memorise the board once, then answer five questions. Each uses three different shared cards; none overlap the board, and all 15 shared cards are distinct.
- Select two positions per question. Positions may be reused in later questions. The board and all answers stay hidden until question five is finished.
- Each question has its own 20-second timer and a bar that burns away from left to right. Memorisation has no countdown bar.
- At expiry, the current selection locks. Fewer than two cards counts as unanswered. If expiry happens away from the game, the next question waits until the game is visible again.
- Results show best hands found out of five, with per-question review. Saves use a separate namespace and do not alter existing single-question progress.
- Weekday suit arrangements are retained. Endless settings choose the board and initial hand; the following four questions use varied shared cards, so old clarity labels do not guarantee the same clarity for every question.
- The frozen v1 generator and single-question state engine remain available for compatibility and regression checks. `src/rounds.js` owns the current generation and timing.

Run `npm start` and open <http://127.0.0.1:4173/>. `npm test` checks both the legacy rules and current round progression.

---

# Memory Poker

Remember the cards. Find your best hand.

A daily, single-player memory game inspired by Memory Poker from *The Devil's Plan: Dead Again*. Everyone gets the same deal, with one attempt each day and a fresh challenge at midnight UTC.

## How to play

1. Start the daily challenge. Study the face-up grid for as long as you like. Your memorization clock is running.
2. Press **Ready** to turn the grid face down.
3. Three shared cards arrive face down, then flip together after one second. You have 20 seconds to select two cards from memory, making a five-card poker hand.
4. Submit when ready. Tapping a third card replaces your oldest selection. Tap a selected card to deselect it.
5. Repeat for five questions, then review each hand, its rank among all achievable hands, and the three best hand groups.

The strongest achievable hand earns gold, the second silver, and the third bronze. Equivalent hands share a rank, including hands made using different pairs. Standard five-card poker rules apply, including kickers; suits do not break ties. Aces can be low in A-2-3-4-5 straights.

At 20 seconds, the current selection submits automatically. Fewer than two selected cards counts as unanswered. If a question expires while you are away, it is recorded, and the next question waits until you return.

Share a spoiler-free result:

```text
Memory Poker
🥇🥈🥇🥉🥇 · 0:42
```

The time is how long you spent memorizing, rounded down to whole seconds.

Copy result writes directly to the clipboard and briefly shows Copied! Share opens the native share sheet on supported browsers; cancelling does nothing. Unsupported browsers direct players to Copy result, without silently copying. Both buttons link to the current game site.

Shares include a link to the game by default. Uncheck **Include link** below Share to leave it out. Your choice is remembered in this browser.

## A different challenge every day

Every day uses 16 cards, with weekday suit patterns ranging from deliberately patterned to shuffled boards. Sunday is a patterned 16-card special. All deals and arrangements are generated automatically. No puzzle is handcrafted.

Progress saves in your browser, including timers and selections. Continue shows the running timer. After the daily reset, reopening or returning to the tab starts the new day's puzzle. A session that stays visible can finish the previous deal. Records and streaks belong to this browser and do not sync between devices. Clearing site data clears them. There are no accounts, analytics, player leaderboards, or result uploads in this version.

## Run locally

Use Node.js 20 or newer. There are no dependencies to install.

```sh
npm start
```

Open <http://127.0.0.1:4173>. ES modules need an HTTP server; opening `index.html` directly from disk is not supported.

For local testing, open <http://127.0.0.1:4173/?test=16> for a repeatable 16-card board with separate progress. Local-only controls let you reset the test or reset today's daily attempt. They do not appear on the published site.

Run the automated checks:

```sh
npm test
```

## Publish on GitHub Pages

Push to `main` to run tests, build the static site, and deploy through the Deploy Pages GitHub Actions workflow. GitHub Pages must use GitHub Actions as its source.

`npm run build` creates `dist/` with runtime files and asset/license notices. QA fixtures and project tooling are excluded. There is no backend, database, API key, or scheduled task. Relative asset paths support repository sites and custom domains.

## Public generation, friendly competition

The challenge number, generator version, and a seeded pseudorandom generator determine the deal. Future challenges can be derived from this public code. Today's hidden cards can also be inspected. This is a friendly game, with no anti-cheat claim and no screenshot blocking.

Generator v1 starts with challenge #1 on November 16, 2026, at 00:00 UTC. This is a provisional prelaunch epoch. Changing it after launch changes challenge numbering. Keep existing generator versions available when introducing future versions so historical deals remain stable.

See [SPEC.md](SPEC.md) for the detailed rules, assumptions, architecture, and implementation status.
See [LAUNCH.md](LAUNCH.md) for the remaining release work.

## Design and attribution

Concrete, violet accents, Korean plaques, near-white cards, and dotted backs draw on the supplied show references. Cinzel and a small Noto Serif KR subset are hosted locally. Card faces reuse Byron Knoll's public-domain vector artwork, with sharp Besley vector outlines for the card values. See [THIRD_PARTY.md](THIRD_PARTY.md) for notices and [DESIGN.md](DESIGN.md) for visual direction. No show screenshots or Netflix artwork are included.

This is an independent fan project, not affiliated with or endorsed by Netflix or the show's creators. Original source code is licensed under [MIT](LICENSE). Third-party artwork and fonts retain their existing licenses; see [THIRD_PARTY.md](THIRD_PARTY.md).

## Endless difficulty review

Choose Endless on the cover and select a difficulty preset or Custom. Start Timer begins memorization immediately with a random deal. Next deal keeps the settings; Replay deal repeats the same board. Change difficulty reopens the picker. Daily game returns to the daily challenge.

Endless uses separate saved progress and does not affect daily records or streaks. Shared URLs retain the settings and internal seed for reproducible comparisons.

### Experimental obvious answers

Endless has an Answer style picker: Original daily deals or Obvious answer (experimental). The latter constructs a royal flush or four of a kind with exactly one winning selection and at least a two-category gap above the next distinct hand group. It preserves grid size and suit layout, including strict-shuffle restrictions. The style is encoded in the URL and uses separate progress. Daily v1 generation is unchanged. This intentionally narrow prototype tests whether clear high-tier combinations feel easier; it is not a final difficulty curve.

After each endless round, Difficulty review shows the best and second-best categories, category gap, number of winning selections, losing pairs in the best category, and shared cards contributing to one best combination (excluding kickers). These are diagnostic signals, not a validated difficulty score. No answers or metrics appear before the result.

### Independent practice controls

Custom exposes independent controls on a fixed 16-card board: columns, rows, diagonals, blocks, mirrored pairs, rings, spiral, or shuffled arrangement; and Very clear, Clear, Competing, or Unrestricted answer clarity. Beginner is the default preset. Difficulty presets set these controls without changing the daily schedule; choose Custom to reveal and adjust them. Each new game picks a random seed internally; the picker does not expose it. Shared URLs retain the seed for reproducibility. Start Timer begins memorization immediately. Original daily profiles and the earlier royal-flush/quads experiment remain available under Original daily / early experiment.

Very clear requires a unique winning pair, trips or better, and a category gap of at least two. Clear requires trips or better and a category gap of at least one. Competing requires at least two distinct hand strengths in the winning category. Unrestricted has no clarity filter. Candidate targets include royal flushes, quads, full houses, flushes, straights, trips, and random hands. Actual distributions depend on card count and suit pattern; these controls are experimental constraints, not validated difficulty ratings or a promise of equal hand-category frequency.

Practice deals use their own deterministic generator and storage keyed by the complete settings. Suit identities are shuffled per seed. Rank positions are shuffled within each suit, so the winning cards do not occupy a fixed point in a pattern. Next deal retains all controls. Shares include the controls and seed.

## Browser reliability checks

`npm run qa` starts a separate loopback server on port 4174. It injects a test fixture into the existing game with namespaced storage, a controlled clock, simulated visibility, and optional blocked/corrupt storage. Normal `npm start` and the published entry point never load the fixture.

Use `http://127.0.0.1:4174/?test=16&qa=example` for an isolated repeatable scenario; changing `qa` creates separate progress. The clock advances only with its buttons and is shared across tabs with the same namespace. Suspend sync simulates delayed storage events. `motion=reduce` exercises the JavaScript reduced-motion path. `storage=blocked` disables game storage; `storage=corrupt` seeds malformed test progress once.

`http://127.0.0.1:4174/test/browser/mobile.html?qa=mobile-example` embeds the game at 320×568, 384×824, or 844×390. Large text doubles interface text, including newly rendered controls; this is a text-sizing simulation, not native browser zoom. The QA toolbar follows the game in document flow so it does not obscure controls. OS screen-reader output, native reduced-motion preferences, storage eviction, and mobile background suspension still require physical-device checks.

## Startup loading

A centred violet spinner stays visible while the initial fonts, background and card images load. Individual assets have a six-second deadline. Optional artwork/fonts can fall back; missing card faces show a Retry screen instead of starting an unreadable game. An independent twelve-second watchdog also covers failed application startup. Static deployments version the page's stylesheets and complete JavaScript module graph together to prevent cached startup-code mismatches.
