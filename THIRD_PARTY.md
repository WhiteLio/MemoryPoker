# Third-party artwork

## Vector Playing Cards

- Original artwork: Byron Knoll.
- Source repository: https://github.com/notpeter/Vector-Playing-Cards
- Revision: `861b338eb931d635c442b568071e3829e552f383`.
- Files: 52 adapted card-face SVGs in `assets/cards/`.
- License: public domain, or optionally WTFPL where public domain is not recognized, according to the upstream notice.
- Full upstream notice and contributors are preserved in `assets/cards/UPSTREAM-README.md` and `assets/cards/UPSTREAM-CONTRIBUTORS.md`.

Adaptations: serif rank lettering, flat fills in place of gradients and gloss, and near-white paper. CSS adds margins and reduces the artwork size. The repeatable adaptation script is `scripts/restyle-cards.js`. Card backs and interface styling are original to this project.

The displayed faces in `assets/cards/classic/` are composed by `scripts/compose-classic-cards.py` from these source outlines and court illustrations. They use 250x350 (5:7) poker-card proportions, larger corner indices, reduced edge margins, and independently positioned pips. CSS no longer adds face padding.

## Cinzel

Cinzel by The Cinzel Project Authors, downloaded from Google Fonts: https://fonts.google.com/specimen/Cinzel and https://github.com/google/fonts/tree/main/ofl/cinzel. Locally hosted variable font in `assets/fonts/Cinzel-Variable.ttf`. SIL Open Font License 1.1, preserved in `assets/fonts/Cinzel-OFL.txt`.

## Cinzel derivatives

FontTools is a build-time dependency for outlined card values and the timer subset, not a game dependency.

Memory Poker Timer is a renamed derivative of Cinzel at weight 500, subset to timer characters and adjusted to equal advance widths while retaining the original outlines. It is distributed under the same SIL Open Font License 1.1, with the original copyright retained. Build script: scripts/build-timer-font.py. The bundled Cinzel-OFL.txt covers both derivatives.

No Card Characters font software, outline artwork, or raster index images are shipped.

## Besley card values

Besley from Google Fonts, https://github.com/google/fonts/tree/main/ofl/besley. Source font assets/fonts/Besley-Variable.ttf and SIL Open Font License 1.1 in assets/fonts/Besley-OFL.txt. Card values use SVG outlines derived at weight 500 by scripts/compose-classic-cards.py. These fixed vector paths avoid bitmap blur and require no font loading inside the card images.

## Noto Serif KR

A Google Fonts subset for the Korean labels is hosted in assets/fonts/NotoSerifKR-Labels.ttf. SIL Open Font License 1.1, preserved in assets/fonts/NotoSerifKR-OFL.txt. Source: https://github.com/google/fonts/tree/main/ofl/notoserifkr.

## Concrete background

Concrete Wall 008 by Charlotte Baglioni (photography) and Dario Barresi (processing), from https://polyhaven.com/a/concrete_wall_008 under CC0 (https://polyhaven.com/license). The 2K diffuse photograph is bundled as `assets/textures/concrete.jpg`, displayed once with cover sizing and a subdued overlay. It is not mirrored or repeated.

## Earlier stone surface, unused

Patterned Slate Tiles by Dimitrios Savva, downloaded from https://polyhaven.com/a/patterned_slate_tiles under CC0 (https://polyhaven.com/license). A cropped stone section from the 4K diffuse map is mirrored for tiling and colored blue-gray, bundled in `assets/textures/stone-wall.jpg`. Source details are preserved in `assets/textures/SOURCE.md`.
