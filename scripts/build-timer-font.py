"""Build an OFL timer subset retaining Cinzel's outlines with fixed advances.

Build dependency: fonttools. No dependency is needed by the browser.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.subset import Subsetter, Options
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen

root = Path(__file__).resolve().parents[1]
font = instantiateVariableFont(TTFont(root/'assets/fonts/Cinzel-Variable.ttf'),{'wght':500},inplace=True)
subset = Subsetter(options=Options())
subset.populate(text='0123456789:+-shm ')
subset.subset(font)
cmap = font.getBestCmap()
cell = max(font['hmtx'][cmap[ord(d)]][0] for d in '0123456789')
glyphs = font.getGlyphSet()
replacements = {}
for name in set(cmap.values()):
    advance,bearing = font['hmtx'][name]
    dx = round((cell-advance)/2)
    pen = TTGlyphPen(glyphs)
    glyphs[name].draw(TransformPen(pen,(1,0,0,1,dx,0)))
    replacements[name] = pen.glyph()
    font['hmtx'][name] = (cell,bearing+dx)
for name,glyph in replacements.items():
    font['glyf'][name] = glyph
for table in ['GPOS','GSUB','kern']:
    if table in font:
        del font[table]
font['post'].isFixedPitch = 1
font['OS/2'].panose.bProportion = 9
# Rename the derivative while retaining the original OFL copyright notice.
for name_id,value in {1:'Memory Poker Timer',2:'Medium',3:'MemoryPokerTimer-Medium-1.0',
                      4:'Memory Poker Timer Medium',6:'MemoryPokerTimer-Medium'}.items():
    font['name'].setName(value,name_id,3,1,0x409)
    font['name'].setName(value,name_id,1,0,0)
path = root/'assets/fonts/MemoryPokerTimer.ttf'
font.save(path)
verified = TTFont(path)
assert {verified['hmtx'][g][0] for g in verified.getBestCmap().values()} == {cell}
print(f'Built Cinzel-based timer subset. Every character advances {cell} units.')
