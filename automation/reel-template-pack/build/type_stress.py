"""Stress test (her point: we don't know the buyer's brand colour or clips): one type system shown on four very
different clips (bright white wall, dark, busy, colourful) in three brand colours. Rules that make it work anywhere:
every key word sits on its own surface (a pill in the brand colour; its text switches to white or ink by brightness),
small words are white with a thin dark edge + soft shadow (readable on light and dark). One sans throughout.
Usage: python build/type_stress.py  ->  type-stress-test.jpg
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, str(Path(__file__).resolve().parent))
import storyboard_b2 as S
SANS, SANSB = 'C:/Windows/Fonts/segoeui.ttf', 'C:/Windows/Fonts/segoeuib.ttf'
WHITE, INK = (255, 255, 255), (24, 23, 22)

def on(c): return INK if (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) > 160 else WHITE

def small(text, px):
    f = S.F(SANSB, px); l, t, r, b = f.getbbox(text); w, h = r - l + 80, b - t + 80; im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((40 - l, 40 - t), text, font=f, fill=255)
    sh = Image.new('RGBA', (w, h), (0, 0, 0, 0)); sh.putalpha(m.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(12)).point(lambda v: int(v * 0.7))); im.alpha_composite(sh, (0, 5))
    e = Image.new('RGBA', (w, h), INK + (255,)); e.putalpha(m.filter(ImageFilter.MaxFilter(5))); im.alpha_composite(e)
    fl = Image.new('RGBA', (w, h), WHITE + (255,)); fl.putalpha(m); im.alpha_composite(fl); return im

def pill(text, px, bg, rot=-3):
    f = S.F(SANSB, px); l, t, r, b = f.getbbox(text); w, h = r - l + px, b - t + int(px * 0.75)
    im = Image.new('RGBA', (w + 40, h + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    sh = Image.new('L', im.size, 0); ImageDraw.Draw(sh).rounded_rectangle((20, 26, 20 + w, 26 + h), h // 2, fill=120)
    s = Image.new('RGBA', im.size, (0, 0, 0, 0)); s.putalpha(sh.filter(ImageFilter.GaussianBlur(10))); im.alpha_composite(s)
    d.rounded_rectangle((20, 20, 20 + w, 20 + h), h // 2, fill=bg + (255,), outline=WHITE, width=5)
    d.text((20 + w / 2, 20 + h / 2), text, font=f, fill=on(bg), anchor='mm'); return im.rotate(rot, expand=True, resample=3)

def put(img, it, c): img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def frame(clip, brand):
    im = S.footage(clip); put(im, small('what', 70), (330, 430)); put(im, pill('buyers', 190, brand), (560, 640)); put(im, small('said', 70), (820, 850))
    put(im, small('comment', 70), (420, 1220)); put(im, pill('[keyword]', 120, brand, 3), (600, 1380)); return im

def main():
    clips = [('IMG_1469', 1.0), ('IMG_1448', 1.0), ('IMG_1430', 1.0), ('IMG_1388', 0.5)]
    brands = [(232, 190, 205), (24, 56, 110), (240, 200, 60)]
    sheet = Image.new('RGB', (4 * 290 + 30, 3 * 515 + 20), 'white')
    for r, bc in enumerate(brands):
        for c, cl in enumerate(clips): sheet.paste(frame(cl, bc).convert('RGB').resize((280, 498)), (c * 290 + 10, r * 515 + 10))
    out = S.E.PACK / 'type-stress-test.jpg'; sheet.save(out, quality=88); print(out)

if __name__ == '__main__':
    main()
