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
