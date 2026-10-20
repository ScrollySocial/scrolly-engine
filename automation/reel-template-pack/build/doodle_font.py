"""Scrolly Doodles: her marker doodle sheets (assets/props/source/doodles) traced into one font, so every doodle in a
CapCut template is a TEXT layer the buyer recolours like a word (fill, outline, shadow, opacity: CapCut's colour
pickers), instead of a picture CapCut can't recolour (Mercedes, 2026-10-20: "the customer [must] be able to change the
color of the overlays like they do in canva").

Each doodle is one letter. Glyphs are traced with potrace (cubic curves, CFF/OTF), scaled so the doodle's longest side
is one em, and centred on the line box (ascender 800, descender -200), so a one-letter CapCut text layer at size s
shows the doodle about s * 6.1 px across, centred on the layer's spot.

Usage: python build/doodle_font.py   ->  assets/fonts/ScrollyDoodles.otf, scrolly-doodles-map.json, scrolly-doodles-sheet.png
In templates: import doodle_font as DF; DF.char('burst', 2) is the letter for burst piece 2.
"""
import json, string, sys
from pathlib import Path
import numpy as np
import potrace
from PIL import Image, ImageDraw, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import storyboard_b2 as S

FONTS = Path(__file__).resolve().parent.parent / 'assets' / 'fonts'
OTF, MAP, SHEET = FONTS / 'ScrollyDoodles.otf', FONTS / 'scrolly-doodles-map.json', FONTS / 'scrolly-doodles-sheet.png'
# the sheets the templates draw from (collage_kit.SHEETS + the glyph sheet), with the join used to find their pieces
SHEETS = {'arrow': ('Hand-drawn arrow doodle sheet-1.png', 9), 'burst': ('Playful hand-drawn burst asset sheet-2.png', 9),
          'icon': ('Playful black doodle icon sheet-6.png', 9), 'under': ('Hand-Drawn Underline Asset Sheet-5.png', 9),
          'bubble': ('Eight playful speech and thought bubbles-3.png', 3), 'frame': ('Ten hand-drawn doodle frames-4.png', 3),
          'tick': ('Hand-drawn checks, Xs, and tick boxes-8.png', 9), 'path': ('Eight playful marker doodle paths-10.png', 9),
          'glyph': ('Playful Marker Glyphs Asset Sheet-11.png', 9)}
UPM, ASC, DESC, TRACE = 1000, 800, -200, 520      # TRACE: longest side traced at this many px
CHARS = string.ascii_uppercase + string.ascii_lowercase + string.digits + ''.join(chr(c) for c in range(0xC0, 0x17F))

def _mask(sheet, box):
    im = S.raw('doodles', sheet); x0, y0, x1, y1 = box
    a = S.ink_cut(im.crop((max(0, x0 - 8), max(0, y0 - 8), x1 + 8, y1 + 8))).split()[3]
    k = TRACE / max(a.size); a = a.resize((max(1, int(a.width * k)), max(1, int(a.height * k))), Image.LANCZOS)
    return np.array(a) > 110

def _glyph(mask):
    """potrace the mask -> a T2 charstring, the doodle's longest side = 1 em, centred on the line box."""
    from fontTools.pens.t2CharStringPen import T2CharStringPen
    h, w = mask.shape; k = UPM / max(w, h); cy = (ASC + DESC) / 2; adv = int(w * k) + 40
    def P(p): return (round(20 + p.x * k, 1), round(cy + (h / 2 - p.y) * k, 1))   # y up, centred vertically
    pen = T2CharStringPen(adv, None)
    for curve in potrace.Bitmap(~mask).trace(turdsize=60, alphamax=1.0, opticurve=True, opttolerance=0.3):
        pen.moveTo(P(curve.start_point))
        for s in curve.segments:
            if s.is_corner: pen.lineTo(P(s.c)); pen.lineTo(P(s.end_point))
            else: pen.curveTo(P(s.c1), P(s.c2), P(s.end_point))
        pen.closePath()
    return pen.getCharString(), adv

def build():
    from fontTools.fontBuilder import FontBuilder
    names, cmap, chars, mapping = ['.notdef', 'space'], {32: 'space'}, iter(CHARS), {}
    from fontTools.pens.t2CharStringPen import T2CharStringPen
    nd = T2CharStringPen(500, None); nd.moveTo((50, 0)); nd.lineTo((450, 0)); nd.lineTo((450, 700)); nd.lineTo((50, 700)); nd.closePath()
    sp = T2CharStringPen(300, None)
    cs, metrics = {'.notdef': nd.getCharString(), 'space': sp.getCharString()}, {'.notdef': (500, 50), 'space': (300, 0)}
    for kind, (sheet, join) in SHEETS.items():
        S._PIECES.pop(sheet, None); mapping[kind] = []
        for i, box in enumerate(S.pieces(sheet, join)):
            ch = next(chars); g = f'{kind}{i:02d}'; c, adv = _glyph(_mask(sheet, box))
            names.append(g); cmap[ord(ch)] = g; cs[g] = c; metrics[g] = (adv, 20); mapping[kind].append(ch)
            print(kind, i, ch)
    fb = FontBuilder(UPM, isTTF=False); fb.setupGlyphOrder(names); fb.setupCharacterMap(cmap)
    fb.setupCFF('ScrollyDoodles-Regular', {'FullName': 'Scrolly Doodles'}, cs, {})
    fb.setupHorizontalMetrics(metrics); fb.setupHorizontalHeader(ascent=ASC, descent=DESC)
    fb.setupNameTable({'familyName': 'Scrolly Doodles', 'styleName': 'Regular'})
    fb.setupOS2(sTypoAscender=ASC, sTypoDescender=DESC, sTypoLineGap=0, usWinAscent=ASC, usWinDescent=-DESC, fsType=0)
    fb.setupPost(); fb.save(str(OTF)); MAP.write_text(json.dumps(mapping, indent=1), encoding='utf-8')
    sheet_png(mapping); print('font:', OTF)

def sheet_png(mapping):
    """A reference sheet for buyers and for us: every doodle with the letter that types it."""
    f = ImageFont.truetype(str(OTF), 110); lab = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 26)
    allc = [(k, i, c) for k, cs in mapping.items() for i, c in enumerate(cs)]; cols = 10; cw, chh = 170, 190
    im = Image.new('RGB', (cols * cw, (len(allc) + cols - 1) // cols * chh), (250, 246, 236)); d = ImageDraw.Draw(im)
    for n, (k, i, c) in enumerate(allc):
        x, y = n % cols * cw, n // cols * chh
        d.text((x + cw / 2, y + 85), c, font=f, fill=(122, 23, 50), anchor='mm'); d.text((x + cw / 2, y + 168), f'{c}  {k} {i}', font=lab, fill=(24, 23, 22), anchor='mm')
    im.save(SHEET)

_map = None
def char(kind, i):
    global _map
    if _map is None: _map = json.loads(MAP.read_text(encoding='utf-8'))
    return _map[kind][i]

if __name__ == '__main__':
    build()
