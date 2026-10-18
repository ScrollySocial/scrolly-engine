"""Type options (2026-10-18): after three rounds of rejected fonts, four options built ONLY from type she has approved,
each ONE type family (no two fonts fighting), shown on a real clip. She picks one; every template is then rebuilt with it.
  1 Corben (her #3 pick): letters filled with hand-painted polka dots in the accent, black edge; small words Corben plain
  2 Anton (her f2 pick): caps filled with a real photo texture, thick cream edge; small words Anton plain with a shadow
  3 Lisa (her reference Reels): one bold sans, white, word by word; the key word bigger in the accent; no pills
  4 Editorial serif: one serif family, lower case, white with a soft shadow; the key word in its italic, larger
Usage: python build/type_options.py  ->  type-options.jpg
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import lettering_b2 as LB

W, H = 1080, 1920; INK, CRM, WHITE = (28, 27, 26), (246, 241, 232), (255, 255, 255); ACC = (190, 150, 70)
CORBEN, ANTON, MONT = str(S.E.BUNDLED_FONTS['corben']), LB.FONT['anton'], LB.FONT['montserrat']
BOD, BODI = 'C:/Windows/Fonts/BOD_R.TTF', 'C:/Windows/Fonts/BOD_I.TTF'

def layer(text, font, px, fill_img=None, color=WHITE, edge=None, ew=0, shadow=True):
    f = S.F(font, px); l, t, r, b = f.getbbox(text); pad = ew * 2 + 30; w, h = r - l + 2 * pad, b - t + 2 * pad
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((pad - l, pad - t), text, font=f, fill=255)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    if shadow:
        sh = Image.new('RGBA', (w, h), (0, 0, 0, 0)); sh.putalpha(m.filter(ImageFilter.MaxFilter(2 * ew + 1) if ew else ImageFilter.GaussianBlur(0)).filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.6)))
        out.alpha_composite(sh, (4, 8))
    if edge:
        e = Image.new('RGBA', (w, h), edge + (255,)); e.putalpha(m.filter(ImageFilter.MaxFilter(2 * ew + 1))); out.alpha_composite(e)
    fl = ImageOps.fit(fill_img, (w, h)).convert('RGBA') if fill_img is not None else Image.new('RGBA', (w, h), color + (255,))
    fl.putalpha(m); out.alpha_composite(fl); return out

def put(img, it, c): img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def option(n, base):
    im = base.copy()
    if n == 1:
        dots = LB.dots_fill(ACC, CRM, 0.6)
        big = lambda w_, px: layer(w_, CORBEN, px, dots((1400, 500), 3), edge=INK, ew=9)
        put(im, layer('what', CORBEN, 70, color=WHITE, edge=INK, ew=6), (540, 520)); put(im, big('buyers', 200), (540, 700)); put(im, layer('said', CORBEN, 70, color=WHITE, edge=INK, ew=6), (540, 880))
        put(im, big('Comment', 150), (540, 1250)); put(im, layer('"[KEYWORD]"', CORBEN, 74, color=WHITE, edge=INK, ew=6), (540, 1400))
    if n == 2:
        tex = S.raw('fall', 'Rust-red and cream plaid blanket texture-7.png')
        big = lambda w_, px: layer(w_, ANTON, px, tex, edge=CRM, ew=10)
        put(im, layer('WHAT', ANTON, 90, color=WHITE), (540, 500)); put(im, big('BUYERS', 260), (540, 700)); put(im, layer('SAID', ANTON, 90, color=WHITE), (540, 900))
        put(im, big('COMMENT', 200), (540, 1250)); put(im, layer('"[KEYWORD]"', ANTON, 90, color=WHITE), (540, 1420))
    if n == 3:
        put(im, layer('what', MONT, 78, color=WHITE), (360, 560)); put(im, layer('buyers', MONT, 170, color=ACC), (560, 720)); put(im, layer('said', MONT, 78, color=WHITE), (760, 880))
        put(im, layer('comment', MONT, 78, color=WHITE), (540, 1200)); put(im, layer('[KEYWORD]', MONT, 150, color=ACC), (540, 1340))
    if n == 4:
        put(im, layer('what', BOD, 96, color=WHITE), (360, 560)); put(im, layer('buyers', BODI, 210, color=WHITE), (560, 730)); put(im, layer('said', BOD, 96, color=WHITE), (760, 900))
        put(im, layer('comment', BOD, 96, color=WHITE), (540, 1200)); put(im, layer('[keyword]', BODI, 170, color=WHITE), (540, 1360))
    return im

def main():
    base = S.footage(('IMG_1388', 0.5)); names = ['1  Corben + polka dots (your #3 pick)', '2  Anton + real textile fill (your f2 pick)',
                                                  '3  One bold sans, key word bigger (Lisa)', '4  One editorial serif, key word italic']
    sheet = Image.new('RGB', (4 * 540 + 60, 960 + 70), 'white'); d = ImageDraw.Draw(sheet); f = S.F('C:/Windows/Fonts/arialbd.ttf', 24)
    for i in range(4):
        sheet.paste(option(i + 1, base).convert('RGB').resize((540, 960)), (i * 560, 70)); d.text((i * 560 + 6, 22), names[i], font=f, fill=INK)
    out = S.E.PACK / 'type-options.jpg'; sheet.save(out, quality=90); print(out)

if __name__ == '__main__':
    main()
