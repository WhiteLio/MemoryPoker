# Current release audit — November 17, 2026

The Endless difficulty lab was committed as `01b7d23` before this audit. The current automated suite has 27 passing tests, including four new persistence cases covering completion absorbing stale saves, preserving other days, same-phase selection freshness, sticky overtime, visibility isolation, and replay/reset generations. Syntax and whitespace checks pass.

Browser checks ran against the actual app through the separate localhost QA server (port 4174), with storage isolated from the player's port-4173 data. The harness controls the clock and visibility; these are simulated lifecycle checks, not physical app-switch tests.

Verified:
- Keyboard Enter starts play; focus moves to the stage heading, Tab reaches Ready, and Space toggles cards while preserving their focus through rendering.
- Foreground expiry submits a selected pair. A last-second reload preserves both selections and enters overtime when the deadline is crossed on the cover. Restoring an overtime attempt retains the pair; submitting and reloading retains the result.
- Simulated background expiry preserves selections and enters overtime without submitting.
- A visible old daily session survives rollover; a return from simulated background opens the next day's deal. Two completed consecutive days produce Played 2, Play streak 2, Best streak 2.
- Two real browser tabs share selections. A stale tab with deliberately suspended storage events cannot overwrite another tab's completed result when saving on background/return, and its UI catches up. A fresh replay survives the stale tab's old completed save.
- Records and Help have accessible dialog names; Escape closes them and returns focus to the opener. Help's expandable sections are reachable by keyboard. Phase, selection, result, and copy messages have a dedicated polite live region; timers are not live-announced every tick.
- Blocked or malformed storage leaves play available and shows the save warning. Expiry with no selected pair enters overtime.
- 320px-wide iframe checks with doubled interface text covered memorisation, selection, results, and Help with no horizontal overflow. Enlarged results also reflowed at 844×390. The normal 16-card short-phone selection controls remain reachable.
- The fixture's JavaScript reduced-motion branch recorded zero moving Web Animations. CSS reduced-motion rules were reviewed; native OS media preference behavior and spoken screen-reader output are not claimed as tested.

Fixes include merge-on-save, per-tab visibility markers, reset generations, stale-action guards, phase focus/announcements, and content-sized rows and labels for enlarged text. Enlarged text may scroll vertically instead of shrinking the card artwork. Physical Android Chrome / iOS Safari, VoiceOver/TalkBack/NVDA, native sharing, and actual storage eviction remain pending.

---

# Verification notes

## Proportional card values and copy feedback, November 17, 2026

Confirmed the old generator independently scaled value width and height. All 52 classic SVGs now use one uniform scale based on the 10’s 32-unit width; maximum value height is 27.20 units, with an 8-unit top margin and 10-unit minimum gap above corner suit pips. The existing card-asset regression now checks both corners on all 52 faces for equal X/Y scale magnitudes and a shared font size. Browser inspection confirmed Copy result temporarily becomes Copied! and restores, with the action row staying at the same position and height and no feedback row. Pair symbols have no ampersand; pair counts use Cinzel with SVG disclosure chevrons.

## Violet interface refinement, November 17, 2026

All 15 automated tests pass, including new concise hand-label coverage for pair ranks, necessary kickers, and royal flushes. `node --check src/app.js` and `git diff --check` pass.

In-app browser checks confirmed welcome copy, weekday/card count, full date, sans-serif HH:MM countdown, continuous pointed plaque borders, visible darkened concrete, result action buttons, rank-specific best-hand labels, and violet Records/Help dialogs with icon-only close controls. Records correctly omitted Include overtime with no overtime completions. At 320x568, the 16-card selection screen measured 320px wide and 568px tall, with Submit ending at y=553; selected cards had black shadows and no pseudo-element checkmark. The same test run completed through foreground deadline auto-submission. The temporary test attempt was reset; the daily result was preserved. The 390px results layout had no horizontal overflow and retained vertical scrolling. Physical device checks remain pending.


## Current card-value font

Card values now use Besley Medium 500 from Google Fonts, converted to self-contained SVG paths on all 52 faces. Cinzel remains the interface/back font; the renamed fixed-width Cinzel derivative remains the timer font. Besley and its OFL notice are bundled. All 14 tests pass with Besley outlines and no embedded bitmap lettering.

## Toolbar and Cinzel lettering correction

Replaced Card Characters raster values with Cinzel 600 SVG outlines on all 52 faces. Removed the unused raster images and their generator. The new Memory Poker Timer font retains Cinzel 500's outlines with equal advance widths for all supported timer characters, verified by the build script. The derivative is locally hosted with the Cinzel OFL notice. Continue and the next-deal countdown use the same timer font.

Wordle-inspired original SVG Help and Records icons now appear in a top bar on both screens. Date and puzzle number appear between difficulty and next-deal countdown. Browser checks confirmed the Records icon opens the records dialog, the Help icon opens Help, and the 320x568 selection view has a 568px document height and Submit ending at y=553. The Cinzel countdown and heading do not overlap. All 14 tests pass.

## Menu scene, font artwork, and reset update

Card Characters values are fixed PNG artwork embedded in self-contained card SVGs. The desktop font is not shipped. Korean title and tray plaques use a locally hosted Noto Serif KR subset. Violet is the primary accent.

Continue displays a ticking phase timer, confirmed in both memorization and overtime. Expired unfinished attempts are discarded on reload or return after UTC midnight; a visible session can finish and review its result. The reset policy has a dedicated unit test.

Menu cards are dimmed backs at the actual grid position. At 390x844, both the preview and memorization grid start at y=200.4. At 320x568, the preview grid spans y=149 to y=423 and the document remains 568px tall. Browser inspection immediately after Play confirmed phase=opening, clock=0:00, and the menu still visible during its fade. After the opening, the memorization clock runs. An async regression test verifies the clock starts at the final animation's completion, rather than at Play or the first flip. All 14 tests pass. Reduced-motion handling uses zero-duration reveals. Physical device validation remains pending.

## Artwork spacing and grid centering correction

Increased separation below corner values and restored uncropped court illustrations. Heart outlines now share the spade coordinate scale instead of being enlarged to fill the spade's height. At 390x844, the memorization grid spans y=200 to y=668, then moves to y=284 after the flip when shared cards appear. The conceal phase keeps its original y=200 position. Shared-card selection still fits at 320x568, with document height 568 and Submit ending at y=553. All 12 tests pass. Card Characters remains unbundled; playing-card values use Georgia.

## Card proportions and typography

All 52 faces recomposed at a 5:7 ratio using the bundled vector outlines and illustrated courts. Larger corner indices, smaller outside margins, pip positions independent of pip sizes. Cinzel is hosted locally with its OFL notice. Browser computed style confirmed Cinzel 500 on card backs. Titles, faces, shared cards, and backs were visually checked at 390x844. At 320x568, document height remained 568, card width was 45.7px, and Submit ended at y=553. All 12 tests pass. Local test attempt reset after verification.

## Mobile screen redesign, November 17, 2026

Separate welcome and puzzle views. Reference review covered Wordle's welcome screen, Krillion's landing page and rules, and Minute Cryptic's dedicated puzzle view. The active 16-card puzzle was measured at 390x844, 320x568, and 844x390: document height matched viewport height with all controls visible. At 320x568, cards measured 44px wide and Submit ended at y=553. Landscape uses two columns. Welcome and Help hold the secondary content. Results and the illustrated hand guide may scroll.

Replaced repeating slate with a single CC0 concrete photograph. Removed decorative title shadow, page borders, and visible test toolbar. Help illustrates all nine hand categories with local card assets. Saved games return through Continue; the memorization clock remains based on its original timestamp.

## Card artwork and sharing update

Subsequent visual revision: near-white paper (#f8f7f2), serif ranks, removal of SVG gloss/filter paths, dotted SVG backs, photographic stone texture, and a darker cobalt-rimmed shared tray. DOM geometry checks showed equal 64px card widths in the 390px test viewport and no position change across all 16 cards after selecting a pair. Face-side position labels have been removed. Grid dimensions no longer shrink during recall; the shared-card region reserves its space while hidden.

The updated suite has 11 passing tests, including all 52 local card assets, correct rank/suit filenames, absence of active or remote SVG content, and share text with and without a game URL. The source deck is pinned and its notices are bundled.

Browser checks confirmed the daily reset control returns the daily to its unstarted state. The separate local 16-card test displays all 16 downloaded card images and illustrated courts. The memorization grid and Ready control fit at 390px wide. The flip, shared-card reveal, selection, and overtime result flows were visually inspected. Include link was toggled off, restored unchecked after reload, then toggled on and restored checked. Local test results are labeled as tests and use separate attempt storage.

The following notes describe the earlier baseline verification and remain useful for core rules.

Checked November 16, 2026, using Node.js 22 and the Chromium-based in-app browser.

## Automated checks

`npm test`: 10 passing tests. Coverage includes all poker categories, kicker comparisons, wheel straights, equal-strength suit variants, the specified one-royal-flush/fifteen-straights example, UTC reset boundaries, a stable seed fixture, 730 generated daily deals, unique card identities, arrangement constraints, pair coverage, one-second reveal, last-two selection, exact deadline behavior, away and restoration overtime, and compact share text.

`node --check src/app.js`: passed.

## Browser checks

- Daily pregame conceals all card identities and omits shared cards.
- Start reveals the generated board and starts the memorization timer.
- Refresh preserves the board and original memorization start time.
- Ready conceals the board before shared cards appear.
- Selecting A, B, C leaves B and C selected.
- Leaving the page before expiry and returning after expiry preserves B and C, enters overtime, and does not auto-submit.
- Explicit overtime submission reveals the full board and top three hand groups.
- Record book counts the completed overtime attempt toward the play streak and initially checks Include overtime.
- Unchecking Include overtime removes the attempt from hand totals while preserving played and streak totals.
- Share action reaches the copied confirmation. Exact result string is separately checked in unit tests.
- Rendered mobile layouts inspected at 390x844 and 320x740. Document width remains within the viewport; card targets remain wider than 44 CSS pixels.

## Remaining validation before release

The compact interface revision was checked against the live Wordle landing screen and Krillion landing screen. Help now keeps extra rules collapsed; technical generation notes remain in README.md. The next-deal countdown follows UTC. Native sharing has been implemented, with physical device validation pending.

- Physical iOS Safari and Android Chrome testing, including app switching and storage eviction behavior.
- Full visual inspection of 16-card boards on mobile and playtesting of the weekly difficulty curve.
- Background deadline auto-submission is covered by pure transition tests; end-to-end browser testing exercised the away-to-overtime path.
- No public repository or GitHub Pages deployment has been created. The local preview is a development server.
- The launch epoch, license, and any future generator version activation policy remain release decisions.

## Independent difficulty lab

23 automated tests pass. Practice coverage exercises all 96 card-count/pattern/clarity combinations for validity, deterministic generation, exact suit-pattern grouping, and requested category gaps; seven suggested presets are additionally exercised across seven seeds. Daily generator code is unchanged. Browser verification checks are recorded separately from these generation tests.

## Hard Mode — November 20, 2026

All 38 Node tests pass, including exact memorisation expiry, early Ready, legacy unlimited attempts, hidden/restored memory expiry, and share markers/coin eligibility. The static production build succeeds. In-app browser checks using the isolated QA server verified the main-menu switch and purple flames, preference persistence across reload, the 20-second memory bar, reload at one second remaining, automatic concealment at zero, the first question receiving its full 20 seconds, and the main-menu toggle locking the mode during play. QA uses a controlled clock; physical-device suspension and native screen-reader output were not tested.

Final interface checks verified the seven-preset Practice picker and footer placement. A live-clock Practice game counted down normally. The Hard Mode bar has its own heading row; measured clearance above the cards was 12px on desktop and 6px at 320×568. The settings button was removed; Hard Mode is selected on the main menu. The final 38-test suite and static build pass.
