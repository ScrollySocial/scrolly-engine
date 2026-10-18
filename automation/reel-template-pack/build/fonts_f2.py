"""Four hero-word options for f2 "The fall drop" (Mercedes: the postcard and Alfa Slab looked homemade, 2026-10-17),
each rendered on the real screen-1 collage. All fonts are from CapCut's own library.
Usage: python build/fonts_f2.py  ->  fall/f2-fall-drop/font-options.jpg
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import motion_f2 as M
B = M.B

R = E.LOCAL / 'CapCut' / 'User Data' / 'Cache' / 'AITextTemplate' / 'Resource'
def ff(name): return str(next(R.glob(f'*/{name}')))
SERIF = E.font_file('7580184437816675601')
ANTON, ETERNITY, SILH = ff('Anton-Regular.ttf'), ff('ZY Eternity.ttf'), ff('ZYSilhouette.ttf')
W, H = M.W, M.H

def base():
    """Screen 1 at 1.6 s without the postcard."""
    t = 1.6; im = Image.new('RGBA', (W, H), M.CREAM + (255,))
    M.tile(im, 'a', t, (0, 0, 640, 820)); M.tile(im, 'plaid', t, (640, 0, 1080, 430)); M.tile(im, 'c', t, (640, 430, 1080, 820))
    M.tile(im, 'wheat', t, (0, 820, 440, 1380)); M.tile(im, 'b', t, (440, 820, 1080, 1380)); M.tile(im, 'leaves', t, (0, 1380, 1080, 1920))
    M.put(im, M.cut('Large open pinecone on white-68.png', 230, seed=2), (640, 830), 1, -12)
    for i, (n, c, r) in enumerate((('Plump Chestnut Acorn Study-66.png', (150, 1720), 18), ('Golden acorn on white-65.png', (330, 1800), -10),
                                   ('Elongated dark brown acorn-69.png', (850, 1760), 30))):
        M.put(im, M.cut(n, 170, seed=10 + i), c, 1, r)                 # a set of acorns along the bottom, in IG's area
    return im

def text_img(lines, pad=30):
    """lines = [(text, font, px, fill, stroke, stroke_fill)] stacked and centred."""
    fs = [(t, ImageFont.truetype(f, px), fill, sw, sf) for t, f, px, fill, sw, sf in lines]
    ws = [f.getbbox(t, stroke_width=sw) for t, f, _, sw, _ in fs]
    w = max(b[2] - b[0] for b in ws) + 2 * pad; h = sum(b[3] - b[1] for b in ws) + pad * (len(fs) + 1)
    im = Image.new('RGBA', (int(w), int(h)), (0, 0, 0, 0)); d = ImageDraw.Draw(im); y = pad
    for (t, f, fill, sw, sf), b in zip(fs, ws):
        d.text((w / 2, y - b[1]), t, font=f, fill=fill + (255,), anchor='ma', stroke_width=sw, stroke_fill=(sf or fill) + (255,)); y += b[3] - b[1] + pad
    return im

def on(paper_name, w, txt, tol=6):
    p = B.fit_w(B.cut(paper_name, tol), w).copy(); p.alpha_composite(txt, ((p.width - txt.width) // 2, (p.height - txt.height) // 2)); return B.shadowed(p, (8, 14), 10, 90)

def options():
    BUR, RUST, CREAM = M.BURGUNDY, M.RUST, M.CREAM
    o = []
    # 1 elegant tall serif on a torn white paper strip
    im = base(); t = text_img([('THE FALL', SERIF, 120, BUR, 0, None), ('DROP', SERIF, 230, RUST, 0, None)], 10)
    M.put(im, on('Torn White Paper on White Background.png', 900, t), (520, 1130), 1, -3); o.append(('1 tall serif on torn paper', im))
    # 2 magazine cover: huge condensed caps straight on the collage, cream with a burgundy edge
    im = base(); t = text_img([('THE FALL', ANTON, 170, CREAM, 8, BUR), ('DROP', ANTON, 380, CREAM, 10, BUR)], 0)
    M.put(im, B.shadowed(t, (6, 10), 10, 120), (540, 1080), 1, 0); o.append(('2 magazine caps on the collage', im))
    # 3 playful fall serif on the ivory note card
    im = base(); t = text_img([('the fall', ETERNITY, 100, RUST, 0, None), ('Drop', ETERNITY, 190, BUR, 0, None)], 10)
    M.put(im, on('Blank ivory note card-121.png', 820, t), (520, 1130), 1, 3); o.append(('3 playful serif on a note card', im))
    # 4 thin serif + big caps filled with the plaid photo
    im = base(); small = text_img([('the fall', SILH, 120, CREAM, 3, BUR)], 0)
    big = text_img([('DROP', ANTON, 400, (255, 255, 255), 0, None)], 0); plaid = ImageOps.fit(M.TEX['plaid'], big.size)
    fill = Image.new('RGBA', big.size, (0, 0, 0, 0)); fill.paste(plaid, (0, 0), big.split()[3])
    edge = Image.new('RGBA', big.size, CREAM + (255,)); edge.putalpha(big.split()[3].filter(__import__('PIL.ImageFilter', fromlist=['x']).MaxFilter(15)))
    edge.alpha_composite(fill); M.put(im, B.shadowed(edge, (6, 10), 10, 120), (540, 1150), 1, 0); M.put(im, small, (540, 860), 1, -3)
    o.append(('4 thin serif + plaid-filled caps', im))
    return o

if __name__ == '__main__' and 'r1' in sys.argv:
    o = options(); sheet = Image.new('RGB', (4 * 540 + 3 * 20, 960 + 90), (255, 255, 255)); d = ImageDraw.Draw(sheet)
    for i, (n, im) in enumerate(o):
        sheet.paste(im.convert('RGB').resize((540, 960)), (i * 560, 90)); d.text((i * 560 + 10, 25), n, font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 30), fill=(20, 20, 20))
    out = E.PACK / 'fall' / 'f2-fall-drop' / 'font-options.jpg'; sheet.save(out, quality=90); print('saved', out)

# ---- round 2 (her picks: plaid-filled DROP from 4 + "the fall" in the serif from 1, made readable; acorns need contrast;
# her idea: move the leaves up behind the words) -------------------------------------------------------------------------
from PIL import ImageFilter
def hero2():
    """'the fall' in the tall serif (burgundy, thick cream edge) over DROP filled with the plaid photo (cream edge)."""
    small = text_img([('the fall', SERIF, 150, M.BURGUNDY, 9, M.CREAM)], 6)
    big = text_img([('DROP', ANTON, 400, (255, 255, 255), 0, None)], 0); plaid = ImageOps.fit(M.TEX['plaid'], big.size)
    fill = Image.new('RGBA', big.size, (0, 0, 0, 0)); fill.paste(plaid, (0, 0), big.split()[3])
    edge = Image.new('RGBA', big.size, M.CREAM + (255,)); edge.putalpha(big.split()[3].filter(ImageFilter.MaxFilter(17))); edge.alpha_composite(fill)
    out = Image.new('RGBA', (max(small.width, edge.width), small.height + edge.height - 40), (0, 0, 0, 0))
    out.alpha_composite(B.shadowed(edge, (6, 10), 10, 120), ((out.width - edge.width) // 2, small.height - 50)); out.alpha_composite(small, ((out.width - small.width) // 2, 0))
    return out

def base2(layout):
    t = 1.6; im = Image.new('RGBA', (W, H), M.CREAM + (255,))
    M.tile(im, 'a', t, (0, 0, 640, 820)); M.tile(im, 'plaid', t, (640, 0, 1080, 430)); M.tile(im, 'c', t, (640, 430, 1080, 820))
    behind = {'leaves': 'leaves', 'knit': 'knit', 'wheat': 'wheat'}[layout]
    M.tile(im, behind, t, (0, 820, 1080, 1400))                          # the calm (or her leaves) tile behind the words
    M.tile(im, 'b', t, (0, 1400, 600, 1920)); M.tile(im, 'knit' if layout != 'knit' else 'wool', t, (600, 1400, 1080, 1920))
    M.put(im, M.cut('Large open pinecone on white-68.png', 200, seed=2), (1000, 440), 1, -12)
    for i, (n, c, r) in enumerate((('Plump Chestnut Acorn Study-66.png', (700, 1640), 18), ('Golden acorn on white-65.png', (860, 1760), -10),
                                   ('Elongated dark brown acorn-69.png', (1000, 1600), 30))):
        M.put(im, M.cut(n, 170, seed=10 + i), c, 1, r)                 # the set of acorns on the cream knit tile: contrast
    M.put(im, hero2(), (540, 1110), 1, -2)
    return im

def round2():
    o = [('A  leaves behind (your idea)', base2('leaves')), ('B  cream knit behind', base2('knit')),
         ('C  wheat field behind', base2('wheat'))]
    sheet = Image.new('RGB', (3 * 540 + 2 * 20, 960 + 90), (255, 255, 255)); d = ImageDraw.Draw(sheet)
    for i, (n, im) in enumerate(o):
        sheet.paste(im.convert('RGB').resize((540, 960)), (i * 560, 90)); d.text((i * 560 + 10, 25), n, font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 26), fill=(20, 20, 20))
    out = E.PACK / 'fall' / 'f2-fall-drop' / 'font-options-2.jpg'; sheet.save(out, quality=90); print('saved', out)

if __name__ == '__main__' and 'r1' not in sys.argv:
    round2()
