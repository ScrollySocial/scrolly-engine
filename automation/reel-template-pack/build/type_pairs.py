"""Her three font pairings (2026-10-18) in the type system she agreed on (highlight boxes for small lines, serif key
words with a thin outline, no static glow), in her colours #F7E6A9 butter, #7A1732 wine, #F9C9DF pink, on two clips.
Fonts: assets/fonts (Google Fonts, SIL OFL) + Bodoni Moda from CapCut's library.
Usage: python build/type_pairs.py  ->  type-pairings.jpg
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
sys.path.insert(0, str(Path(__file__).resolve().parent))
import storyboard_b2 as S
FD = S.E.PACK / 'assets' / 'fonts'
BUTTER, WINE, PINK, WHITE, INK = (247, 230, 169), (122, 23, 50), (249, 201, 223), (255, 255, 255), (24, 23, 22)

def font(name, px, wght=None):
    f = ImageFont.truetype(str(name), px)
    if wght:
        try: f.set_variation_by_axes([wght] if 'Manrope' in str(name) else [14, wght])
        except Exception: pass
    return f

PAIRS = [('Instrument Serif + DM Sans', FD / 'instrumentserif-InstrumentSerif-Regular.ttf', FD / 'instrumentserif-InstrumentSerif-Italic.ttf', FD / 'dmsans-DMSans[opsz,wght].ttf'),
         ('Bodoni Moda + Manrope', S.E.font_file('7580184437816675601'), S.E.font_file('7580184437816675601'), FD / 'manrope-Manrope[wght].ttf'),
         ('DM Serif Display + Manrope', FD / 'dmserifdisplay-DMSerifDisplay-Regular.ttf', FD / 'dmserifdisplay-DMSerifDisplay-Italic.ttf', FD / 'manrope-Manrope[wght].ttf')]

def highlight(lines, f, bg, fg):
    boxes = []
    for l in lines:
        a, t, b, bt = f.getbbox(l); px = f.size; w, h = int(b - a + px * 0.4), int(px * 1.25)
        im = Image.new('RGBA', (w, h), bg + (255,)); ImageDraw.Draw(im).text((w / 2, h / 2), l, font=f, fill=fg, anchor='mm'); boxes.append(im)
    out = Image.new('RGBA', (max(b.width for b in boxes), sum(b.height for b in boxes)), (0, 0, 0, 0)); y = 0
    for b in boxes: out.alpha_composite(b, (0, y)); y += b.height
    return out.rotate(-2, expand=True, resample=3)

def key(text, f, fill, edge, ew=4):
    l, t, r, b = f.getbbox(text); pad = 50; w, h = r - l + 2 * pad, b - t + 2 * pad
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((pad - l, pad - t), text, font=f, fill=255); out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sh = Image.new('RGBA', (w, h), (0, 0, 0, 0)); sh.putalpha(m.filter(ImageFilter.MaxFilter(2 * ew + 1)).filter(ImageFilter.GaussianBlur(12)).point(lambda v: int(v * 0.55))); out.alpha_composite(sh, (0, 8))
    e = Image.new('RGBA', (w, h), edge + (255,)); e.putalpha(m.filter(ImageFilter.MaxFilter(2 * ew + 1))); out.alpha_composite(e)
    fl = Image.new('RGBA', (w, h), fill + (255,)); fl.putalpha(m); out.alpha_composite(fl); return out

def put(img, it, c): img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def frame(clip, pair):
    _, reg, ital, sans = pair; im = S.footage(clip); body = font(sans, 72, 500)
    put(im, highlight(['what my', 'buyers'], body, BUTTER, INK), (330, 400))
    put(im, key('actually', font(reg, 190), WHITE, WINE), (520, 600)); put(im, key('said', font(ital, 230), PINK, WINE), (700, 790))
    put(im, highlight(['comment'], body, WINE, WHITE), (350, 1200)); put(im, key('[keyword]', font(ital, 190), WHITE, WINE), (590, 1370))
    return im

def main():
    clips = [('IMG_1469', 1.0), ('IMG_1388', 0.5)]
    sheet = Image.new('RGB', (3 * 540 + 40, 2 * 960 + 100), 'white'); d = ImageDraw.Draw(sheet); f = S.F('C:/Windows/Fonts/segoeuib.ttf', 28)
    for c, pair in enumerate(PAIRS):
        d.text((c * 560 + 6, 20), pair[0], font=f, fill=INK)
        for r, cl in enumerate(clips): sheet.paste(frame(cl, pair).convert('RGB').resize((540, 960)), (c * 560, 70 + r * 970))
    out = S.E.PACK / 'type-pairings.jpg'; sheet.save(out, quality=88); print(out)

if __name__ == '__main__':
    main()
