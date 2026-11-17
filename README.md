# Memory Poker

Remember the cards. Find your best hand.

A daily, single-player memory game inspired by Memory Poker from *The Devil's Plan: Dead Again*. Everyone gets the same deal, with one attempt each day and a fresh challenge at midnight UTC.

## How to play

1. Start the daily challenge. Study the face-up grid for as long as you like. Your memorization clock is running.
2. Press **Ready** to turn the grid face down.
3. After one second, three shared cards appear. You have 20 seconds to select two cards from memory, making a five-card poker hand.
4. Submit when ready. Tapping a third card replaces your oldest selection. Tap a selected card to deselect it.
5. See your hand, its rank among all achievable hands, and the three best hand groups.

The strongest achievable hand earns gold, the second silver, and the third bronze. Equivalent hands share a rank, including hands made using different pairs. Standard five-card poker rules apply, including kickers; suits do not break ties. Aces can be low in A-2-3-4-5 straights.

If time runs out while you are viewing the game and two cards are selected, those cards are submitted. Otherwise you enter **overtime**, with unlimited time to choose and submit. If the deadline passes while you are away from the page, you enter overtime without automatic submission. Overtime marks your result but does not change your hand rank, and completed overtime games count toward your play streak.

Share a spoiler-free result:

```text
Memory Poker #123
🥈0:42
```

```text
Memory Poker #123
12🃏0:42 · Overtime
```

The time is how long you spent memorizing, rounded down to whole seconds.

Shares include a link to the game by default. Uncheck **Include link** below Share to leave it out. Your choice is remembered in this browser.

## A different challenge every day

The week moves from smaller, deliberately patterned grids toward random 16-card boards. Sunday is a patterned 16-card special. All deals and arrangements are generated automatically. No puzzle is handcrafted.

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

1. Create a GitHub repository and put the contents of this directory at its root.
2. Push to the `main` branch.
3. In the repository's **Settings > Pages**, select **Deploy from a branch**, then `main` and `/ (root)`.
4. Open the Pages URL provided by GitHub.

There is no build step, backend, database, API key, or scheduled task. Relative asset paths support both repository sites and custom domains. Hosting remains subject to GitHub Pages usage limits.

## Public generation, friendly competition

The challenge number, generator version, and a seeded pseudorandom generator determine the deal. Future challenges can be derived from this public code. Today's hidden cards can also be inspected. This is a friendly game, with no anti-cheat claim and no screenshot blocking.

Generator v1 starts with challenge #1 on November 16, 2026, at 00:00 UTC. This is a provisional prelaunch epoch. Changing it after launch changes challenge numbering. Keep existing generator versions available when introducing future versions so historical deals remain stable.

See [SPEC.md](SPEC.md) for the detailed rules, assumptions, architecture, and implementation status.
See [LAUNCH.md](LAUNCH.md) for the remaining release work.

## Design and attribution

Concrete, violet accents, Korean plaques, near-white cards, and dotted backs draw on the supplied show references. Cinzel and a small Noto Serif KR subset are hosted locally. Card faces reuse Byron Knoll's public-domain vector artwork, with sharp Besley vector outlines for the card values. See [THIRD_PARTY.md](THIRD_PARTY.md) for notices and [DESIGN.md](DESIGN.md) for visual direction. No show screenshots or Netflix artwork are included.

This is an independent fan project, not affiliated with or endorsed by Netflix or the show's creators. A source-code license has not yet been selected.
