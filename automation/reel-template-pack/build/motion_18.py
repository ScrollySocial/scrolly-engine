"""#18 Check this before you buy, motion test (2026-10-18). Built the #04-#13 round 3 way (play_extra: locked type,
palette, reading-time holds). World: the inspection desk: a real brown clipboard on light-blue terrazzo; the buyer's
clip IS the sheet under the clamp (the home base), the checklist written on the sheet, her tick marks, a real gold foil
seal for the pass. Palette: light blue + wine. Tech: the CTA plays on a laptop standing on the desk (whole screen = one
video slot).
Story (5 beats): hook "3 things to check before you buy a [product type]" / problem: not all [product type]s are made
the same / product: check 1, 2, 3 on yours / proof: yours passes all three / CTA: comment [KEYWORD].
Scenes (graphics-only: 2, 6; tech: 7):
 1 0.0  the clipboard slides up with the product clip as its sheet; "3 things to check" / [before you buy a ...]
 2 1.8  CLIPBOARD, no video: the sheet is the checklist: 1. 2. 3. written in on boxes
 3 3.6  check 1, full frame; 1. [check] + one arrow up to the centre; a tick lands beside the words
 4 5.2  CLIPBOARD: line 1 ticked; the sheet turns into check 2 and the camera dives into it
 5 6.8  check 3, full frame; 3. [check]; a tick
 6 8.4  CLIPBOARD, no video: all three ticked; the gold seal slaps on (one burst behind it); "mine passes"
 7 10.0 CTA: a laptop on the desk plays the product; Comment / [KEYWORD] / [mine checks all 3]
Usage: python build/motion_18.py [seconds ...]  ->  18-check-this-before-you-buy/preview/motion-test.mp4 (or a test sheet)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
import play_extra as X
from story4 import swipe, diagonal
from collage_kit import doodle, doodle_on
from motion_b2 import Clip, put, render, camera, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (24, 23, 22), (246, 241, 232); BLUE, WINE = X.BABY, X.WINE             # her palette: light blue + wine
X.use_type(BLUE, WINE); X.enable_holds()
DIR = '18-check-this-before-you-buy'
LAPTOP = 'Open Silver Laptop with Green Screen-34.png'
CB_W = 820; CB_C = (540, 1140); SHEET = (0.045, 0.135, 0.955, 0.94)      # the clipboard's sheet (see-through in the cut-out)
LINES = ('1. [check the bristles]', '2. [check the cord]', '3. [check the heat]')
HOLDS = [(1.5, 0.7), (3.35, 1.3), (4.95, 0.6), (6.3, 0.5), (8.15, 0.6), (9.75, 1.0), (12.45, 0.6)]

def setup():
    brush = X.Window(Clip('IMG_1381', 0.0), 0.5, 3.2)                  # the stand-in brush is in frame only 0.5-3.2 s
    g = {'c': {'hook': brush, 'c1': brush, 'c2': Clip('IMG_1378', 0.5), 'c3': Clip('IMG_1377', 0.5), 'cta': brush}}
    cc = ImageOps.grayscale(S.raw('images', 'Light gray concrete mineral texture-4.png'))       # a calm desk (no busy terrazzo)
    g['desk'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(cc), (205, 196, 182), (246, 241, 232)), (W, H)).convert('RGBA')
    cb = S.fitw(Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Brown clipboard with blank white paper-65.png').convert('RGBA'), CB_W)
    g['cb'] = cb; g['cbh'] = cb.height
    x0, y0, x1, y1 = SHEET; g['sw'], g['sh'] = int(CB_W * (x1 - x0)), int(cb.height * (y1 - y0))
    g['paper'] = ImageOps.fit(S.raw('physical', 'Blank Ruled Notebook Paper.png'), (g['sw'], g['sh'])).convert('RGBA')
    g['lines'] = [X.hl(l, 50, (BLUE, WHITE, BLUE)[i], rot=0) for i, l in enumerate(LINES)]
    g['ticks'] = [doodle('tick', i, 120, WINE) for i in range(3)]; g['nums'] = [P.sticker(n, 130, WINE, WHITE, 'circle') for n in ('1', '2', '3')]   # bold number sticker on the video (her note: no arrow + tick)
    g['three'] = P.caption('3 things', 200, INK); g['tocheck'] = P.caption('to check', 150, INK); g['before'] = X.hl('before you buy a [hair tool]', 56, WINE)
    g['checklist'] = P.caption('the checklist', 130, INK)
    g['big'] = [X.hl(l, 60, WHITE) for l in LINES]; g['arrow'] = doodle('arrow', 0, 190, WHITE)
    seal = P.raw_cut('Blank gold foil seal sticker-175.png', 330).copy(); ImageDraw.Draw(seal).text((seal.width / 2, seal.height / 2), '3/3', font=S.F(X.SERIF, 120), fill=WINE, anchor='mm')
    g['seal'] = P.die_cut(seal, 8); g['burst'] = doodle('burst', 2, 620, WINE)
    g['passes'] = P.caption('mine passes', 150, INK)
    g['comment'] = P.caption('Comment', 190, INK); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['all3'] = X.hl('[mine checks all 3]', 56, WINE)
    return g

def board(g, t, y=None, clip_im=None, written=0, ticked=0, tick_t=None, write_t=1.9):
    """The clipboard on the desk; its sheet is the clip, or the paper checklist (written lines, ticked boxes)."""
    im = g['desk'].copy(); cy = CB_C[1] if y is None else y; x0, y0 = CB_C[0] - CB_W / 2, cy - g['cbh'] / 2
    sx, sy = int(x0 + CB_W * SHEET[0]), int(y0 + g['cbh'] * SHEET[1])
    im.alpha_composite(C.shadow(Image.new('RGBA', (g['sw'], g['sh']), WHITE + (255,)), (10, 18), 16, 110), (sx - 16, sy - 16))
    if clip_im is not None: im.alpha_composite(ImageOps.fit(clip_im, (g['sw'], g['sh'])).convert('RGBA'), (sx, sy))
    else:
        im.alpha_composite(g['paper'], (sx, sy))
        for i in range(written):
            k = back_out(seg(t, write_t + i * 0.25, write_t + i * 0.25 + 0.3), 1.6) if write_t is not None else 1
            if k > 0: put(im, g['lines'][i], (sx + g['sw'] * 0.45, sy + g['sh'] * (0.3 + 0.2 * i)), k)
        for i in range(ticked):
            u = seg(t, tick_t, tick_t + 0.25) if (tick_t is not None and i == ticked - 1) else 1
            from motion_b2 import draw_on
            draw_on(im, g['ticks'][i], (sx + g['sw'] * 0.88, sy + g['sh'] * (0.3 + 0.2 * i) - 10), u)
    im.alpha_composite(g['cb'], (int(x0), int(y0)))
    return im

def stage6(g, t):
    im = board(g, t, written=3, ticked=3, tick_t=8.5, write_t=None)
    doodle_on(im, t, 8.9, g['burst'], (790, 1580), 0)
    k = back_out(seg(t, 8.85, 9.1), 2.0)
    if k > 0: put(im, g['seal'], (790, 1580), lerp(2.2, 1, k), -12)
    P.say(im, g['passes'], t, 9.1, (540, 300), -3)
    return im

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the clipboard with the product as its sheet
        k = ease(seg(t, 0.0, 0.35)); im = board(g, t, lerp(2600, CB_C[1], k), c['hook'].at(t))
        P.say(im, g['three'], t, 0.05, (540, 290), -3); P.say(im, g['tocheck'], t, 0.3, (560, 450), 2); X.sparkles(im, t, 0.4, [(120, 300), (960, 260), (980, 560)], WINE, 140); P.say(im, g['before'], t, 0.4, (540, 1440), 2)
        if t > 1.55: im = swipe(im, board(g, t, written=3), seg(t, 1.55, 1.8))
        return im
    if t < 3.6:                                                    # 2: the checklist on the sheet
        im = board(g, t, written=3, write_t=1.9); P.say(im, g['checklist'], t, 2.0, (540, 300), -2)
        if t > 3.4: im = diagonal(im, c['c1'].at(t - 3.4), seg(t, 3.4, 3.65)) if t < 3.65 else im
        return im
    if t < 5.2:                                                    # 3: check 1
        im = c['c1'].at(t - 3.4); P.say(im, g['big'][0], t, 3.75, (600, 330), -2); put(im, g['nums'][0], (130, 330), back_out(seg(t, 3.6, 3.9), 2.0), -8)   # at the top (her note)
        if t > 5.0: im = swipe(im, board(g, t, written=3, ticked=1, tick_t=5.3, write_t=None), seg(t, 5.0, 5.2), -1)
        return im
    if t < 6.8:                                                    # 4: line 1 ticked; the sheet becomes check 2; dive in
        if t < 5.9: return board(g, t, written=3, ticked=1, tick_t=5.3, write_t=None)
        im = board(g, t, clip_im=c['c2'].at(t - 5.9)); P.say(im, g['big'][1], t, 6.0, (540, 300), -2)
        if t > 6.35: im = camera(im, (540, CB_C[1] + 40), lerp(1, 2.2, ease(seg(t, 6.35, 6.8)) ** 2))
        return im
    if t < 8.4:                                                    # 5: check 3
        im = c['c3'].at(t - 6.8); P.say(im, g['big'][2], t, 6.95, (600, 330), 2); put(im, g['nums'][2], (130, 330), back_out(seg(t, 6.8, 7.1), 2.0), 8)
        if t > 8.2: im = diagonal(im, stage6(g, t), seg(t, 8.2, 8.4))
        return im
    if t < 10.0:
        im = stage6(g, t)
        if t > 9.8: im = swipe(im, cta(g, 10.0), seg(t, 9.8, 10.0), -1)
        return im
    return cta(g, t)

def cta(g, t):
    im = g['desk'].copy(); k = ease(seg(t, 10.0, 10.3))
    put(im, P.on_screen(LAPTOP, 1000, g['c']['cta'].at(t - 10.0)), (540, lerp(2400, 1020, k)), 1, 0)   # the laptop's whole screen is the video slot
    P.say(im, g['comment'], t, 10.2, (540, 330), -3); P.say(im, g['kw'], t, 10.45, (540, 500), 2); P.say(im, g['all3'], t, 10.65, (540, 1440), -2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 12.5 + sum(h for _, h in HOLDS); render('18', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
