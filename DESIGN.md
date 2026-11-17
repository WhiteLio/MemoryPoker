# Visual direction

## Current direction

- Reference: the user's screenshots of Memory Poker from The Devil's Plan: Dead Again, including the close-ups of the N card back and blue shared-card tray.
- Background: a single full-screen concrete photograph, subdued blue-gray, with brutalist prison character. Cover sizing, no repetition or mirroring. The monitor-pixel grid is not part of the design.
- Cards: near-white paper (#f8f7f2), 5:7 poker proportions, narrow outer margins, larger serif indices, and widely spaced pips. Central symbols and court artwork retain approximately their previous visual size. Flat fills, no gloss or artificial gradients.
- Typography: locally hosted Cinzel variable font. Title and card backs use Medium 500; buttons and tray labels use 600. Small labels and Help prose use Arial/Helvetica for contrast. Playing-card values use crisp Besley vector outlines at 500. Timers use a locally built Cinzel 500 derivative with fixed character advances, retaining the Cinzel shapes. Noto Serif KR supplies the Korean title and shared-card labels.
- Primary accent: violet, with a navy tray interior and fine double frame. Korean welcome plaque reads 기억 포커 (Memory Poker); tray label reads 공유 카드 (Shared cards), alongside a small English translation. Ignore camera moire, monitor pixels, video subtitles, and broadcaster overlays in the reference photographs.
- Face sides show only playing-card artwork, with no grid-position letters.
- Backs: fine dotted ornament, double dark border, corner ornaments, and a large black serif position letter.
- Shared tray: near-black interior, violet frame, raised label, and offset drop shadow. Shared cards have the same dimensions as grid cards.
- Cards stay at their grid positions when selected. Selection uses an outline and check marker. Hover and deal/flip animations may move cards temporarily.
- Card dimensions remain stable across phases at a given viewport. During memorization and flipping, the grid is centered with no reserved shared-card space. After flipping it moves down smoothly to make room for the three shared cards.
- Corner suits have a clear gap below the values, including descending letters. Hearts use the same outline scale as spades, with the shorter height expected from omitting the stalk. Court illustration paths are preserved in full, without a central crop.
- A top icon bar provides Records and How to play on both screens. Welcome holds the title and Play/Continue, followed by difficulty, date/puzzle number, and the next-deal countdown in that order. The puzzle contains only navigation, stage/timer, shared tray, grid, and action.
- Welcome shows the actual daily card count as dimmed lettered backs behind the menu, at the memorization grid's exact position. Play crossfades the menu and flips the cards in place, with a slight stagger. All animation curves use ease-out quad. The memorization clock starts only after the final opening flip; Continue preserves its original running clock.
- Fit cards to viewport height as well as width. Short landscape viewports place controls beside the grid. Active play must fit without scrolling; Help and results can scroll.
- No title shadow, decorative page borders, or visible development toolbar. Development controls are tucked inside local-only Help.
- Keep text minimal. Help includes short instructions and nine illustrated poker-hand examples. Implementation details belong in project documentation.

## Current artwork

Byron Knoll's public-domain SVG card faces, adapted locally. The concrete surface is Concrete Wall 008 from Poly Haven, CC0. See THIRD_PARTY.md for notices.

## Alternative to keep in mind

[Kenney Playing Cards Pack](https://kenney.nl/assets/playing-cards-pack)

The user likes this pack's design but noted pixelation. Keep it as a possible future alternative; it has not been downloaded or integrated. Inspect its original formats and resolution before reconsidering it.

## Interface refinement — November 17, 2026

Keep the concrete photograph visible beneath an 85% black overlay. Welcome copy is “Remember the cards. Pick the best hand.” Metadata uses the weekday and card count, `#2 · 17 Nov 2026`, and a sans-serif `HH:MM` next-deal countdown. Pointed violet plaques have continuous inset borders, including the cover title and bilingual shared-card label. Both shared-card labels use 12px type, with Cinzel for English.

Gameplay has an icon-only back button, no repeated title, and a single heading beside the timer: Memorise, Choose 2, Results. Selected cards use violet outlines with black shadows and no checkmark. Results pair Copy result and Share, keep Include link close, and separate best hands with horizontal rules. Hand summaries show ranks and only necessary distinguishing kickers. Records omit the overtime filter when no completed attempt used overtime. Dialogs use dark violet surfaces and an icon-only close button.

Card values preserve Besley's original proportions with one shared scale, sized to the 10's 32-unit width. Values are centered at x=23 with an 8-unit top margin; corner suit pips start 10 units below the tallest value. Copy confirmation temporarily replaces the clicked button label for one second without adding a status row. Best-hand pair counts use Cinzel and an SVG disclosure chevron. Pair card symbols are separated by a space.

The result heading uses uppercase placement text and a compact 42-unit three-line block aligned with the 42-unit medal. Share uses a stroked SVG upload/share icon.

Latest refinements: placement and Include link use 60% text brightness; Include link uses Cinzel. Add 4px below placement, keep the memorized line tight, and raise the SVG share icon 2px. Once two cards are selected, dim other grid cards to 70%. The shared tray has subdued violet borders. Results flow from the top below navigation without vertically centering the whole result page. Next-deal text uses whole hours, then whole minutes below an hour, with a minimum 1min.

Card values are doubled uniformly, with a 64-unit 10 and the wider index centered at x=39. Corner suits move down to retain a 10-unit gap below the tallest value. Number-card center artwork scales uniformly to 80% around the card center to leave clearance for the enlarged 10; court artwork is preserved.

Follow-up: unselected cards use 60% brightness after a pair is chosen. The medal summary has 18px above and 24px below. The concrete overlay is eased from 85% to 80% black to meet the request for a lighter background. Rank lettering is 80% of the previous enlarged size, proportional throughout; all values now share a 7-unit left edge, with suit pips centered beneath each value. The 10 is 51.2 units wide.

Dimming remains active on the result board: unselected cards stay at 60% brightness. A–9 corner indices and their suit marks move inward by 4 SVG units; J, Q, K, and 10 retain their existing positions and size.

A–9 indices receive a further 3-unit diagonal inset, moving both the value and corner suit toward the center in each mirrored corner. J, Q, K, and 10 remain unchanged.

The result summary uses the specific rank description (for example Ace Pair), matching the best-hand list. The memorized-time line has a 4px top margin.

Screen changes and popup entrances fade upward from a 12px offset over 200ms with the card-flip ease-out quad curve. Popups exit downward 8px over 120ms, including Escape dismissal, with matching backdrop fades. Reduced motion removes these transitions. The opening deal keeps its existing staggered flips and starts the memorization clock after all opening animations finish. Selection clicks and ticking timers do not restart screen animations.

## Mobile typography and spacing system

Shared font families, caption/body styles, spacing steps, and 24px page gutters live in `styles/tokens.css`; cover rules live together in `styles/welcome.css`, replacing scattered cover overrides in the main stylesheet. At the S24 preview's 384px width, the title uses approximately 31px Cinzel 600 and the description approximately 17px Cinzel 400, with reduced contrast. The Korean plaque is 14px. Sections use 24px gaps (16px on short screens), the plaque/title use 12px, and the three metadata lines use 8px. Every metadata line and nested span inherits the same 12px Arial 400 style and color. Buttons remain at least 44px high; icon hit targets stay 44px while icons reduce to 21px.

Game card fitting reads the actual content width after the shared gutters rather than assuming 20px margins. Card width caps at 78px. Dialogs share the 24px outer gutters. The opening animation uses the same cover geometry as the resting screen.

## How to play panel

How to play is a full-screen violet dialog with a sticky close header, 24px gutters, a centered 560px reading column, and styles in `styles/help.css` using shared font/color/spacing tokens. The essential instructions are Memorise and Choose; selection/overtime and result details are expandable. Remove the medal shorthand and redundant Reveal step. Poker examples use the gameplay `cardPath` helper and current classic SVG deck. Dim cards outside the named combination to 60%, explaining their tie-breaking role. Compact dialogs support backdrop dismissal only when a pointer begins and ends outside the dialog bounds; content taps and drags from inside do not dismiss. All dismissal paths retain the existing exit animation.
