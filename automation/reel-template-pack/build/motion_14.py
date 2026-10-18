"""#14 The annoying moment, motion test round 2 (2026-10-18). Her notes on round 1: the copy came from the stand-in
clip ("2am") and didn't sell a physical product; she hated the scribble swarm. Round 2: generic copy any seller can
use, and one literal main move: the annoying moment plays in black and white on a real vintage TV, the channel
flips (static) and the fix comes on in colour. A few crumpled paper balls stand for the frustration and get swept
away. Calm butter stage (soft concrete), like the approved #08/#09. Palette: butter + wine. Built the #04-#13 round 3
way (play_extra: locked type, palette, reading-time holds). No tech moment.
Story (5 beats): hook "[when your ___ ] ... again." / problem: every single time / product: the fix / proof: no more
[annoyance] / CTA: comment [KEYWORD].
Scenes (graphics-only: 2):
 1 0.0  the annoying moment, B&W, full frame; [when your cord tangles] + "again."
 2 1.8  STAGE, no video: crumpled paper balls drop onto the butter concrete one by one; "we've all been there"
 3 3.4  STAGE: the real TV rolls in, playing the moment in B&W; "every single time"
 4 5.0  the channel flips: static, then the fix in colour fills the TV and grows to full frame; "fixed." + one underline
 5 6.6  STAGE: the TV now in colour; the paper balls are swept off one by one; [no more tangles] (one burst behind the TV)
 6 8.2  the fix in use, full frame; [how it fixes it] + one arrow up to the centre
 7 9.8  CTA: the product on its own; Comment / [KEYWORD] / [Product name]
Usage: python build/motion_14.py [seconds ...]  ->  14-the-annoying-moment/preview/motion-test.mp4 (or a test sheet)
"""
import math, random, sys
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

INK, CRM = (24, 23, 22), (246, 241, 232); DARK, LIGHT = X.WINE, X.BUTTER           # her palette: wine + butter
X.use_type(LIGHT, DARK); X.enable_holds()
DIR = '14-the-annoying-moment'
TV_W = 880; TV_C = (540, 940)
HOLDS = [(1.55, 1.0), (3.15, 1.1), (4.75, 1.0), (6.35, 1.0), (7.95, 1.0), (9.55, 1.0), (12.45, 0.4)]

def gray(im): return ImageOps.grayscale(im.convert('RGB')).convert('RGBA')

def setup():
    brush = X.Window(Clip('IMG_1381', 0.0), 0.5, 3.2)                 # stand-in: the hair tool (in frame 0.5-3.2 s)
    g = {'c': {'prob': Clip('IMG_1378', 0.5), 'prob2': Clip('IMG_1377', 0.5), 'fix': brush, 'use': X.Window(Clip('IMG_1377', 0.0), 0.5, 3.0), 'cta': brush}}
    cc = ImageOps.grayscale(S.raw('images', 'Light gray concrete mineral texture-4.png'))
    g['bg'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(cc), (214, 192, 120), LIGHT), (W, H)).convert('RGBA')
    g['balls'] = [P.thing(n, w, p, col, scale=0.3, strength=0.55, seed=i) for i, (n, w, p, col) in enumerate((
        ('Crumpled cream paper ball-58.png', 330, 'stripes', DARK), ('Crumpled cream paper ball-58.png', 290, 'dots', DARK),
        ('Crumpled cream paper ball-58.png', 310, 'smalldots', DARK)))]
    g['spots'] = [(230, 1600), (840, 1560), (540, 1680)]
    g['static'] = [Image.effect_noise((TV_W // 3, TV_W // 4), 90 + 20 * i).convert('RGBA').resize((TV_W, int(TV_W * 0.75))) for i in range(3)]
    g['annoy'] = X.hl('[when your cord tangles]', 60, WHITE); g['again'] = P.caption('again.', 230, DARK)
    g['been'] = P.caption("we've all been there", 116, INK)
    g['every'] = P.caption('every single time', 116, INK)
    g['fixed'] = P.caption('fixed.', 260, DARK); g['under'] = doodle('under', 0, 560, LIGHT)
    g['nomore'] = X.hl('[no more tangles]', 62, DARK); g['burst'] = doodle('burst', 2, 1150, DARK)
    g['how'] = X.hl('[one smooth pass]', 60, WHITE); g['arrow'] = doodle('arrow', 0, 190, WHITE)
    g['comment'] = P.caption('Comment', 190, DARK); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['name'] = X.hl('[Product name]', 56, DARK)
    return g

def tv(g, im, t, screen, y=None, k=1.0):
    put(im, P.tv_with(screen, TV_W), (TV_C[0], TV_C[1] if y is None else y), k, -2)

def balls(im, g, t, t0=None, gone=None):
    for i, (b, xy) in enumerate(zip(g['balls'], g['spots'])):
        d = 1 if t0 is None else back_out(seg(t, t0 + i * 0.25, t0 + i * 0.25 + 0.3), 1.6)
        if d <= 0: continue
        x, y = xy[0], lerp(-300, xy[1], d)
        if gone is not None:
            u = ease(seg(t, gone + i * 0.2, gone + i * 0.2 + 0.35)); x += (1 if i % 2 else -1) * 900 * u; y -= 200 * u
        put(im, b, (x, y), 1, (i * 47) % 40 - 20)

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the annoying moment in B&W
        im = gray(c['prob'].at(t)); P.say(im, g['annoy'], t, 0.05, (540, 380), -2); P.say(im, g['again'], t, 0.4, (540, 1250), -4)
        if t > 1.6: im = swipe(im, stage2(g, t), seg(t, 1.6, 1.8))
        return im
    if t < 3.4: return stage2(g, t) if t < 3.2 else diagonal(stage2(g, t), stage3(g, t), seg(t, 3.2, 3.4))
    if t < 5.0: return stage3(g, t)
    if t < 6.6:                                                    # 4: the channel flips; the fix grows out of the TV
        if t < 5.5:
            im = g['bg'].copy(); balls(im, g, t); n = g['static'][int(t * 20) % 3]
            scr = n if t < 5.25 else c['fix'].at(t - 5.25); tv(g, im, t, scr); return im
        u = ease(seg(t, 5.5, 5.9)); im = c['fix'].at(t - 5.25)
        if u < 1:
            base = g['bg'].copy(); balls(base, g, t); tv(g, base, t, c['fix'].at(t - 5.25)); im = Image.blend(base, im, u) if u > 0 else base
        P.say(im, g['fixed'], t, 5.9, (540, 960), -4); doodle_on(im, t, 6.05, g['under'], (540, 1090), -2)
        if t > 6.4: im = diagonal(im, stage5(g, t), seg(t, 6.4, 6.6))
        return im
    if t < 8.2: return stage5(g, t) if t < 8.0 else swipe(stage5(g, t), c['use'].at(0), seg(t, 8.0, 8.2))
    if t < 9.8:                                                    # 6: the fix in use; one arrow up to the centre
        im = c['use'].at(t - 8.2); P.say(im, g['how'], t, 8.35, (540, 1380), -2); doodle_on(im, t, 8.7, g['arrow'], (540, 1215), 90)
        if t > 9.6: im = swipe(im, c['cta'].at(0), seg(t, 9.6, 9.8), -1)
        return im
    im = c['cta'].at(t - 9.8)                                        # 7: CTA
    P.say(im, g['comment'], t, 9.9, (540, 980), -3); P.say(im, g['kw'], t, 10.15, (540, 1200), 2); P.say(im, g['name'], t, 10.4, (540, 1340), -2)
    return im

def stage2(g, t):
    im = g['bg'].copy(); balls(im, g, t, 1.8); P.say(im, g['been'], t, 2.3, (540, 900), -2); return im

def stage3(g, t):
    im = g['bg'].copy(); balls(im, g, t); k = back_out(seg(t, 3.4, 3.75), 1.3)
    tv(g, im, t, gray(g['c']['prob2'].at(t - 3.4)), lerp(2600, TV_C[1], k))
    P.say(im, g['every'], t, 3.7, (540, 330), -2)
    return im

def stage5(g, t):
    im = g['bg'].copy(); doodle_on(im, t, 6.75, g['burst'], TV_C, 0); balls(im, g, t, gone=6.9)
    tv(g, im, t, g['c']['fix'].at(t - 5.25)); P.say(im, g['nomore'], t, 7.2, (540, 1380), 2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 12.0 + sum(h for _, h in HOLDS); render('14', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
