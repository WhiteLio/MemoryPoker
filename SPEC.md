# Memory Poker specification

Status: first playable implementation. This document separates agreed behavior from provisional design choices and future work.

Interface refinement: keep gameplay copy minimal, using short phase labels and Play, Ready, Submit, Share, and Records. Keep detailed rules in collapsed Help sections and technical transparency in this documentation. The footer shows difficulty and time until the next UTC deal. See LAUNCH.md for the current release checklist.

## Product

A mobile-first, centered, single-player daily browser game. The player memorizes a card grid, then recalls two positions to make the strongest five-card hand with three newly revealed shared cards. Shareable results emphasize individual achievement. Only hands are ranked; players are not ranked against each other.

Hosting is fully static on GitHub Pages. No server-side services, analytics, accounts, multiplayer, player percentiles, score submissions, or distribution charts are required. Challenge generation is entirely automatic and public.

## Rules

- Use a standard 52-card deck without jokers. Each deal has distinct cards, with no overlap between grid and shared cards.
- The grid uses four columns and 8, 12, or 16 cards. Sixteen is the maximum.
- A pregame screen explains the day's card count and arrangement. Cards are not exposed until Start.
- Start reveals the grid and starts the memorization clock. Memorization has no time limit.
- Ready freezes memorization time and immediately conceals the grid. Lettered backs A through P identify positions. Shared cards are absent during memorization and the one-second conceal phase.
- After exactly one second of elapsed time, the three shared cards appear above the grid. The 20-second selection period begins at that moment.
- Tap an unselected card to append it to the selection. Keep only the two most recently tapped unselected cards. Tapping a selected card deselects it. Submission requires two selected positions.
- Submit explicitly at any point during selection, including overtime.
- When the deadline passes with the document visible and two cards selected, automatically submit that pair.
- With fewer than two cards selected, enter overtime. Once overtime starts, never automatically submit. The player presses Submit even after selecting their second card.
- If the deadline passes while the document is hidden or the page is closed/reloading, enter overtime regardless of selection. Do not submit on the player's behalf while away.
- Overtime does not affect hand rank. Show the overtime label on the result and share text. Completed overtime attempts count toward play streaks.
- One attempt per challenge in this browser. Completed challenges cannot be restarted through the interface.

## Poker evaluation and hand groups

Evaluate all N*(N-1)/2 grid pairs combined with the same three shared cards. There are 120 pairs for a 16-card grid.

Compare standard five-card hand category, then all relevant ranks and kickers. Category order, strongest first: straight flush, four of a kind, full house, flush, straight, three of a kind, two pair, one pair, high card. A royal flush is an ace-high straight flush. A-2-3-4-5 is a five-high straight. Other wrapping straights are invalid. Suits have equal strength.

Group pairs with identical poker strength. Sort distinct groups descending and assign dense ranks 1, 2, 3, etc. Multiple pairs can share rank 1. The existence of many optimal pairs is acceptable and contributes to difficulty analysis.

Gold means group 1, silver group 2, bronze group 3. Lower groups display a joker and the exact hand-group rank. No numerical composite score or player ranking is introduced. Memorization time is an individual result metric.

## Results and sharing

Reveal the full board and shared cards after completion. Highlight the player's two selected positions and show their resulting hand name and achievable rank. Show the top three distinct hand groups with all position pairs in expandable details, including the actual card symbols for each pair. If a deal has fewer than three groups, show the available groups.

Share format starts with two lines with no space between badge and time. Append the site's root URL on a third line by default. An Include link checkbox beneath Share is checked by default and persisted independently of attempts. Turning it off restores the two-line format. The root URL preserves the GitHub Pages repository path and excludes development query parameters.

```text
Memory Poker #123
🥇0:42
```

For lower hands use `12🃏0:42`. Append ` · Overtime` when applicable. Time is memorization duration floored to whole seconds. Native sharing may be used where supported; a copy control and manual-copy fallback must remain available. No cards, solution positions, or player percentiles appear in the share text.

## Daily generation v1

All dates use UTC, independent of device timezone. Challenge #1 is provisionally November 16, 2026. Do not change the epoch after public launch without an explicit migration plan. New daily numbers become available at 00:00 UTC. Device clock is trusted.

Seed string: `memory-poker:v1:{challengeNumber}`. A fixed string hash initializes a deterministic integer PRNG; Fisher-Yates performs shuffles. Avoid Math.random and locale-dependent sorting. The same number and generator version must produce identical card identities, positions, and shared cards across browsers.

Provisional weekly profiles, to be tuned through playtesting before launch:

| Day | Cards | Arrangement |
| --- | --- | --- |
| Monday | 8 | One suit per column |
| Tuesday | 12 | One suit per column |
| Wednesday | 12 | Suits on wrapping diagonals |
| Thursday | 12 | Random with pattern rejection |
| Friday | 16 | Random with pattern rejection |
| Saturday | 16 | Random with stricter pattern rejection |
| Sunday | 16 | Seed chooses columns or wrapping diagonals |

Patterned boards assign shuffled suits to columns or diagonal classes and draw shuffled, distinct ranks from each suit. For diagonals, the seed also chooses direction. Random boards reject complete suit-column, suit-row, and both wrapping suit-diagonal organizations. Saturday additionally rejects any complete monochromatic row or column and any row of four matching ranks. These are explicit heuristics, not a guarantee of subjective difficulty or absence of every memorable pattern. Fail explicitly if the bounded rejection loop cannot produce a board.

Draw the three shared cards from the shuffled remaining deck. Do not require one uniquely winning pair and do not reject deals for having many top-ranked pairs.

Freeze v1 once released. A future version needs its own retained implementation and an activation challenge number. Stored attempts include a generator version; unsupported versions must not be silently regenerated using a different algorithm.

## Persistence and time

Use localStorage with a versioned storage key. Persist each meaningful transition and each selection synchronously. Store absolute timestamps for start and Ready; derive display timers from elapsed wall-clock time, not interval ticks. Persist hidden-since on visibility loss and pagehide. Reconcile elapsed time before processing input, when restoring, and when visibility returns.

Refresh during memorization preserves the original start time. Refresh during conceal/selection preserves the Ready timestamp and selection. Restoring beyond the deadline always enters overtime. Resuming before the deadline can continue normal selection; returning after the deadline enters overtime. Browser timer throttling must not grant extra timed selection time.

At the UTC reset, a visible active session may finish its current deal and review its result. Returning after tabbing away, or reopening/reloading, switches to today's puzzle and discards expired unfinished attempts. There is no earlier-deal resume list. Completion counts on the challenge date. A completed consecutive run ending today or yesterday is the current play streak; missing earlier challenges breaks it. Compute longest streak from all completed challenge dates. Record gold, silver, bronze, and other completions separately. An Include overtime checkbox affects medal counts, not streaks. Initially unchecked, but initially checked when the current displayed completed attempt is overtime. Continue displays the live phase timer, including overtime.

If storage is unavailable, keep the game playable in memory and show a persistent warning that refresh recovery and records are unavailable. Do not claim server-side uniqueness or cross-device persistence. Corrupt storage should not crash the page or be silently overwritten.

## Visual and accessibility direction

Follow the supplied reference with a blue-gray textured table, fine inset frame, ivory cards, black serif lettering, ornamental corner details, lettered crosshatched backs, and a violet frame around shared cards. Keep the primary game centered, with a maximum width suitable for four cards. Mobile takes priority. Hide the entire shared-card frame until reveal to reduce clutter.

Use locally hosted Cinzel for the title and backs, Noto Serif KR for the Korean plaques, and system sans-serif for utility text. Violet is the main accent, with a navy tray interior. Card values use Besley vector outlines at weight 500, avoiding bitmap lettering. Preserve source and license notices in THIRD_PARTY.md and assets/cards/. Keep the full court illustrations, near-white paper, and a single concrete photograph without monitor-pixel artifacts. The welcome screen shows the current grid face-down, dimmed behind the menu at its memorization position. Play fades out the menu and reveals the grid in place with staggered flips. Create the attempt and start its clock only after all opening animations finish. Continue preserves the existing attempt and elapsed time. All animations use ease-out quad and respect reduced motion. During memorization the grid is centered; after concealment it moves to reveal the shared tray. Card dimensions remain fixed between phases, shared cards match grid cards, and selection does not move cards. Position letters appear on backs only.

Card buttons support keyboard activation and expose selection state. Concealed cards expose only position letters in accessible names, never identities. Timers must not be live-announced every tick. Phase changes and overtime are announced. Respect reduced-motion preferences. Dialogs support Escape. Use at least 44px interactive targets and maintain readable contrast. Verify 320px and 390px widths without horizontal scrolling.

## Implementation structure

- `src/generator.js`: stable seeded generation, UTC numbering, profiles, pattern filters.
- `src/poker.js`: pure poker evaluator and achievable hand grouping.
- `src/state.js`: pure transition rules, selection behavior, elapsed-time reconciliation, share formatting.
- `src/app.js`: rendering, local persistence, visibility handling, records, dialogs, sharing.
- `styles.css`: responsive reference-inspired presentation.
- `scripts/serve.js`: dependency-free local development server.
- `test/`: meaningful core regression tests and generation checks.

## Verification and known limits

Test category ordering, kickers, wheel straights, equivalent pairs, deterministic generation, unique cards, weekly profiles, pattern filters, exact deadline transitions, away/restore overtime, last-two selection, and share formatting. Use browser checks for the complete game flow, persistence, dialogs, sharing fallback, and mobile layout.

Future deals are discoverable. Screenshots cannot be reliably blocked. Players can edit local storage and device time. No trusted competitive records are promised. Hosting still has bandwidth and request limits despite requiring no application backend. Local browser data can be lost or evicted.

## Deferred work

Unlimited practice is a previously discussed follow-up, not part of the first daily-only playable build. Also deferred: analytics, cloud sync, public statistics, PWA/offline caching, bespoke court illustrations, production font licensing, and a generator-version migration mechanism. Before public release, review the epoch, tune the weekly curve, choose a source license, and validate on physical mobile devices.
