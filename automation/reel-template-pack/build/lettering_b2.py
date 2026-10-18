"""Built-in lettering for batch 2 after her notes (2026-10-17): #07's Coiny banana letters and #20's Sigmar were
rejected ("terrible", "hate this font"), #11's DynaPuff was "a tad girly". She loved #03's pattern-filled letters in
the hero prop's colour, and the framework asks for magazine cut-out letters and real paper. Two kinds here:
  dotted(): a bold font filled with HER hand-painted dots (the real doodle sheet, recoloured to the prop), black edge;
  magazine(): each letter cut from a different real paper (card, kraft, gold foil, black, marble), in a different font.
Fonts are SIL OFL ones from CapCut's own text cache (artwork only, never editable text).
Usage: python build/lettering_b2.py  ->  11-.../preview/font-options.jpg, 20-.../preview/font-options.jpg
"""
import random, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
from storyboard_b2 import W, H, INK, CREAM, F

R = S._RES
FONT = dict(S.FONTS, anton=str(R / '571127391353382505' / 'Anton-Regular.ttf'), corben=str(S.E.BUNDLED_FONTS['corben']),
            montserrat=str(R / '16318125380063669143' / 'Montserrat-Bold.otf'))
BRASS, BRASS_DK, GOLD = (196, 150, 74), (120, 84, 36), (214, 172, 70)

_dots = None
def dots_fill(base, dot, scale=0.75):
    """Her hand-painted polka dots (black on cream), recoloured: the cream becomes `base`, the dots become `dot`."""
    global _dots
    if _dots is None: _dots = ImageOps.grayscale(S.raw('doodles', 'Playful hand-painted black polka dots-12.png'))
    def f(size, i):
        g = _dots.resize((int(_dots.width * scale), int(_dots.height * scale)), Image.LANCZOS)
        x, y = (i * 173) % max(1, g.width - size[0]), (i * 97) % max(1, g.height - size[1]); g = g.crop((x, y, x + size[0], y + size[1]))
        return Image.composite(Image.new('RGBA', size, base + (255,)), Image.new('RGBA', size, dot + (255,)), g.point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.GaussianBlur(0.7)))
    return f

def photo_fill(im):
    def f(size, i):
        return ImageOps.fit(im, (size[0] * 2, size[1] * 2), Image.LANCZOS).crop((i * 41 % size[0], i * 29 % size[1], i * 41 % size[0] + size[0], i * 29 % size[1] + size[1])).convert('RGBA')
    return f

def gold_foil(): return photo_fill(S.raw('images', 'Blank gold foil seal sticker-175.png').crop((327, 327, 927, 927)))

# ---- magazine cut-out letters on real paper ------------------------------------------------------------------------
def papers(kind):
    """Crops of her real paper and surfaces, each with the ink colour that reads on it."""
    raw = S.raw
    out = {'cream': (S.card('images', 'Blank cream index card on white-24.png', 600), INK),
           'kraft': (raw('fall', 'Blank kraft gift tag with twine-34.png').crop((520, 620, 980, 960)).convert('RGBA'), INK),
           'gold': (raw('images', 'Blank gold foil seal sticker-175.png').crop((380, 380, 880, 880)).convert('RGBA'), INK),
           'black': (raw('images', 'Soft White Spotlight Beam on Black-70.png').crop((1100, 600, 1500, 1000)).convert('RGBA'), CREAM),
           'marble': (raw('images', 'Soft veined white marble texture-1.png').crop((200, 200, 700, 700)).convert('RGBA'), INK),
           'butter': (raw('doodles', 'Butter Yellow Watercolor Wash-23.png').crop((300, 300, 800, 800)).convert('RGBA'), INK),
           'brass': (raw('fall', 'Handless vintage brass wall clock-24.png').crop((420, 300, 800, 560)).convert('RGBA'), INK)}
    return [out[k] for k in kind]

def magazine(word, px, kinds, fonts=('alfa', 'anton', 'corben', 'sigmar', 'montserrat'), seed=1):
    """One image per letter: the letter in its own font, on its own scrap of real paper, slightly turned.
    Returns [(image, x offset of its centre from the word's centre)] like storyboard_b2.letters."""
    r = random.Random(seed); ps = papers(kinds); out = []; x = 0; items = []
    for i, ch in enumerate(word):
        if ch == ' ': x += px * 0.35; continue
        f = F(FONT[fonts[(i + seed) % len(fonts)]], int(px * r.uniform(0.86, 1.05)))
        l, t, rr, b = f.getbbox(ch); w, h = rr - l, b - t; pad = int(px * 0.13)
        paper, ink = ps[(i * 3 + seed) % len(ps)]
        sw, shh = w + 2 * pad, int(px * 1.05) + 2 * pad
        scrap = ImageOps.fit(paper, (sw, shh), Image.LANCZOS).convert('RGBA')
        ImageDraw.Draw(scrap).text((sw / 2 - l - w / 2, shh / 2 - t - h / 2), ch, font=f, fill=ink)
        m = Image.new('L', scrap.size, 0); j = [r.uniform(-4, 4) for _ in range(8)]   # scissor-cut edges, not quite square
        ImageDraw.Draw(m).polygon([(j[0], j[1]), (sw + j[2], j[3]), (sw + j[4], shh + j[5]), (j[6], shh + j[7])], fill=255); scrap.putalpha(m)
        items.append((C.shadow(scrap, (5, 8), 6, 80), x + sw / 2)); x += sw * 0.94
    total = x
    return [(im, cx - total / 2) for im, cx in items]

def options(opts, bg, path):
    """The same words in each lettering option (two lines each), one option per band, on the template's background."""
    band = 470; im = ImageOps.fit(bg, (W, band * len(opts) + 40), Image.LANCZOS).convert('RGBA'); d = ImageDraw.Draw(im)
    for k, (label, lines) in enumerate(opts):
        for j, ls in enumerate(lines):
            y = 40 + k * band + 150 + j * 190
            for i, (it, dx) in enumerate(ls): S.place(im, it, (W / 2 + dx, y), S.TILTS[(i + j) % len(S.TILTS)] * 0.8)
        d.text((24, 40 + k * band + 6), f'{k + 1}  {label}', font=F(S.BOLD, 30), fill=INK, stroke_width=3, stroke_fill=(255, 255, 255))
    im.convert('RGB').save(path, quality=90); print('saved', path)

def two(fn, a, b): return [fn(a), fn(b)]

def main():
    ow = S.raw('doodles', 'Butter Yellow Watercolor Wash-23.png'); face = S.raw('fall', 'Handless vintage brass wall clock-24.png').crop((260, 330, 560, 560))
    options([
        ('Alfa Slab One, brass with her painted dots (my pick)', two(lambda w: S.letters(w, FONT['alfa'], 170, dots_fill(BRASS, CREAM), 9), 'A DAY', 'WITH MY')),
        ('Anton, filled with the real clock face', two(lambda w: S.letters(w, FONT['anton'], 200, photo_fill(face), 9), 'A DAY', 'WITH MY')),
        ('Corben, cream with brass painted dots', two(lambda w: S.letters(w, FONT['corben'], 160, dots_fill(CREAM, BRASS), 9), 'A DAY', 'WITH MY')),
        ('Magazine cut-outs on real paper', two(lambda w: magazine(w, 150, ('cream', 'kraft', 'brass', 'butter'), seed=len(w)), 'A DAY', 'WITH MY'))],
        ow, S.E.PACK / S.DIRS['11'] / 'preview' / 'font-options.jpg')
    mb = S.raw('images', 'Soft veined white marble texture-1.png')
    options([
        ('Magazine cut-outs on real paper (my pick)', two(lambda w: magazine(w, 104, ('gold', 'black', 'cream', 'kraft', 'marble'), seed=len(w)), 'WHAT BUYERS', 'SAID')),
        ('Alfa Slab One in gold foil', two(lambda w: S.letters(w, FONT['alfa'], 112, gold_foil(), 9), 'WHAT BUYERS', 'SAID')),
        ('Anton, cream with gold painted dots', two(lambda w: S.letters(w, FONT['anton'], 170, dots_fill(CREAM, GOLD), 9), 'WHAT BUYERS', 'SAID')),
        ('Corben, gold with black painted dots', two(lambda w: S.letters(w, FONT['corben'], 100, dots_fill(GOLD, INK), 9), 'WHAT BUYERS', 'SAID'))],
        mb, S.E.PACK / S.DIRS['20'] / 'preview' / 'font-options.jpg')

if __name__ == '__main__':
    main()
