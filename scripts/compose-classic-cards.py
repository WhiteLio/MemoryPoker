"""Compose poker-size faces using the bundled public-domain vector artwork."""
from pathlib import Path
import xml.etree.ElementTree as ET
import re
from html import escape
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/cards'
OUTPUT = SOURCE / 'classic'
OUTPUT.mkdir(exist_ok=True)
NS = '{http://www.w3.org/2000/svg}'
ET.register_namespace('', NS[1:-1])
font = TTFont(ROOT / 'assets/fonts/Besley-Variable.ttf')
glyphs = font.getGlyphSet(location={'wght':500})
cmap = font.getBestCmap()

def value_art(rank):
    pen = SVGPathPen(glyphs)
    bounds = BoundsPen(glyphs)
    offset = 0
    for character in rank:
        glyph = glyphs[cmap[ord(character)]]
        transform = (1,0,0,1,offset,0)
        glyph.draw(TransformPen(pen,transform))
        glyph.draw(TransformPen(bounds,transform))
        offset += glyph.width
    x0,y0,x1,y1 = bounds.bounds
    sx = (32 if rank=='10' else 30)/(x1-x0)
    sy = 42/(y1-y0)
    return (f'<g data-card-value="Besley" transform="translate({7-x0*sx} {8+y1*sy}) '
            f'scale({sx} {-sy})"><path d="{pen.getCommands()}"/></g>')

# Reuse the source suit outlines, independently of their original placement.
boxes = {'C': '38 14 20 21', 'D': '-8 -10.5 16 21',
         'H': '-8 -10.5 16 21', 'S': '-8 -10.5 16 21'}
prefixes = {'C': 'cl', 'D': 'dl', 'H': 'hl', 'S': 'sl'}
outlines = {}
for suit in boxes:
    tree = ET.parse(SOURCE / f'2{suit}.svg')
    outlines[suit] = next(p.attrib['d'] for p in tree.iter(NS+'path')
                          if p.attrib.get('id', '').startswith(prefixes[suit]))

def pip(suit, x, y, width=54, height=58, inverted=False):
    rotation = f' transform="rotate(180 {x} {y})"' if inverted else ''
    return (f'<g{rotation}><svg x="{x-width/2}" y="{y-height/2}" '
            f'width="{width}" height="{height}" viewBox="{boxes[suit]}">'
            f'<path d="{outlines[suit]}"/></svg></g>')

def positions(rank):
    if rank == 1: return [(125,175)]
    if rank == 2: return [(125,62),(125,288)]
    if rank == 3: return [(125,62),(125,175),(125,288)]
    rows = [62,288] if rank <= 5 else [62,175,288] if rank <= 8 else [62,137,213,288]
    result = [(x,y) for x in [73,177] for y in rows]
    if rank in [5,9]: result += [(125,175)]
    if rank in [7,8,10]: result += [(125,118)]
    if rank in [8,10]: result += [(125,232)]
    return result

for source in SOURCE.glob('*.svg'):
    rank, suit = source.stem[:-1], source.stem[-1]
    color = '#b3232b' if suit in 'DH' else '#17191c'
    # Corner indices are larger and closer to the edge than the original art.
    index = value_art(rank)+pip(suit,22,81,25,27)
    body = ''
    if rank in ['J','Q','K'] or source.stem == 'AS':
        original = ET.parse(source).getroot()
        # Remove only the old corner indices. Preserve every court illustration path.
        for child in list(original):
            if child.tag == NS+'text':
                original.remove(child)
                continue
            paths = list(child.iter(NS+'path'))
            matrix = re.match(r'matrix\(([-\d.]+)',child.get('transform',''))
            if (len(paths)==1 and paths[0].get('id','').startswith(prefixes[suit])
                    and matrix and abs(float(matrix[1])) < 2):
                original.remove(child)
        contents = ''.join(ET.tostring(child,encoding='unicode') for child in original
                           if child.tag not in [NS+'metadata'])
        body = ('<svg x="20" y="28" width="210" height="294" '
                'viewBox="0 0 167.0869141 242.6669922" preserveAspectRatio="none">'
                +contents+'</svg>')
    else:
        number = 1 if rank == 'A' else int(rank)
        body = ''.join(pip(suit,x,y,82 if number==1 else 58,88 if number==1 else 62,y>175)
                       for x,y in positions(number))
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="250" height="350" viewBox="0 0 250 350">'
           f'<title>{escape(rank+suit)}</title><rect width="250" height="350" rx="10" fill="#f8f7f2"/>'
           f'<g fill="{color}">{body}{index}<g transform="rotate(180 125 175)">{index}</g></g></svg>')
    (OUTPUT/source.name).write_text(svg,encoding='utf-8')
print('Composed 52 faces with 5:7 proportions, larger indices, and spaced pips.')
