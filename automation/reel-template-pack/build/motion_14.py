"""#14 The annoying moment, motion test (2026-10-18). Built the way #04-#13 round 3 were (play_extra: locked type, palette,
reading-time holds). World: the junk drawer: a real messy wooden drawer (the annoyance), her black scribble patches
crowding the problem, black-and-white for the problem and colour for the fix, on butter tissue paper. Palette: butter +
wine. No tech moment in this one (most templates, not all).
Story (5 beats): hook "[the annoying moment]... again." / problem: every single time / product: the fix, in colour /
proof: no more [annoyance] / CTA: comment [KEYWORD].
Scenes (graphics-only: 2, 5):
 1 0.0  the annoying moment in B&W, full frame; her scribbles crowd in round the edges; [the annoying moment] + "again."
 2 1.8  STAGE, no video: the junk drawer slides up onto the butter paper; the tangled cord, plasters and paper ball drop
        into it one by one; "we've all been there"
 3 3.4  the camera dives into the drawer: the moment again, B&W, inside the drawer; the scribbles carried back in
 4 5.0  THE SWITCH (one main action): the scribbles take over the screen, then wipe away one by one to the fix in colour;
        "fixed." with a single underline
 5 6.6  STAGE: the drawer drops away, the clutter tumbles out after it; the fix stays as a photo card; [no more ...]
 6 8.2  the fix in use, full frame; [how it fixes it] + one arrow up to the centre
 7 9.8  CTA: the product on its own; Comment / [KEYWORD] / [Product name] with one burst behind the name
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
DRAWER_IN = (0.075, 0.06, 0.925, 0.89)          # the drawer's inside, as shares of the cropped photo
HOLDS = [(1.5, 1.1), (2.95, 1.6), (4.95, 0.8), (6.3, 1.1), (7.9, 1.3), (9.5, 1.0), (11.95, 0.4)]   # just before each transition

def gray(im): return ImageOps.grayscale(im.convert('RGB')).convert('RGBA')

def setup():
    g = {'c': {'prob': Clip('IMG_1451', 0.0), 'prob2': Clip('IMG_1448', 0.0), 'fix': None, 'fix2': None, 'cta': None}}
    lamp = Clip('IMG_1449', 0.0); g['c']['fix'] = g['c']['fix2'] = g['c']['cta'] = X.Window(lamp, 3.3, 5.8)   # the stand-in lamp is lit only 3.3-5.8 s
    tis = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))
    g['paper'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tis), (226, 205, 140), LIGHT), (W, H)).convert('RGBA')
    raw = S.raw('images', 'Messy wooden junk drawer-66.png'); bb = (38, 84, 1275, 1151); d = raw.crop(bb); d = d.crop((0, 0, d.width, int(d.height * 0.948)))
    g['drawer'] = C.shadow(S.fitw(d.convert('RGBA'), 960), (10, 18), 16, 110)
    g['dw'], g['dh'] = 960, int(960 * d.height / d.width)
    g['clutter'] = [P.thing('Compact tangled black cord knot-54.png', 300, 'smalldots', LIGHT, scale=0.3, strength=0.7),
                    P.thing('Crossed beige adhesive plasters-63.png', 280, 'stripes', DARK, scale=0.3, strength=0.5),
                    P.thing('Crumpled cream paper ball-58.png', 220, 'dots', DARK, scale=0.35, strength=0.6)]
    r = random.Random(4); g['scrib'] = [P.die_cut(doodle('scribble', i % 8, r.randint(260, 380), DARK), 5, False) for i in range(10)]   # wine + cream edge: reads on any clip
    g['spots'] = [(120, 420), (950, 380), (90, 1050), (980, 980), (200, 1520), (900, 1600), (540, 250), (520, 1700), (330, 760), (760, 1300)]
    g['annoy'] = X.hl('[2am. can\'t see a thing.]', 58, WHITE); g['again'] = P.caption('again.', 230, DARK)
    g['been'] = P.caption("we've all been there", 120, INK)
    g['every'] = P.caption('every single time', 120, INK)
    g['fixed'] = P.caption('fixed.', 260, DARK); g['under'] = doodle('under', 0, 560, LIGHT)
    g['nomore'] = X.hl('[no more fumbling]', 60, DARK)
    g['how'] = X.hl('[one tap. soft light.]', 58, WHITE); g['arrow'] = doodle('arrow', 0, 190, WHITE)
    g['comment'] = P.caption('Comment', 190, DARK); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['name'] = X.hl('[Product name]', 56, DARK)
    g['burst'] = doodle('burst', 2, 480, LIGHT)
    return g

def scribbles(im, g, t, t0, n=6, grow=0.0, gone=None):
    """Her scribbles crowd in round the edges (drawn on one by one); `grow` takes them over the screen; `gone` wipes them."""
    for i in range(n):
        ti = t0 + i * 0.12
        if t < ti: continue
        x, y = g['spots'][i]; xy = lerp2((x, y), (540 + (x - 540) * 0.35, 960 + (y - 960) * 0.35), grow); s = 1 + 1.6 * grow
        if gone is not None:
            k = 1 - ease(seg(t, gone + i * 0.06, gone + i * 0.06 + 0.2))
            if k <= 0: continue
            s *= k
        if s < 0.04: continue
        it = g['scrib'][i] if s == 1 else g['scrib'][i].resize((int(g['scrib'][i].width * s), int(g['scrib'][i].height * s)))
        if gone is None and grow == 0: doodle_on(im, t, ti, it, xy, (i * 37) % 30 - 15)
        else: put(im, it, xy, 1, (i * 37) % 30 - 15)

def drawer_scene(g, t, y, clip_im=None):
    """The drawer at height y (centre); optionally a clip inside it (replacing the clutter)."""
    im = g['paper'].copy(); put(im, g['drawer'], (540, y))
    if clip_im is not None:
        x0, y0, x1, y1 = DRAWER_IN; w, h = int(g['dw'] * (x1 - x0)), int(g['dh'] * (y1 - y0))
        v = ImageOps.fit(clip_im, (w, h)).convert('RGBA'); im.alpha_composite(C.shadow(v, (0, 10), 14, 120), (int(540 - g['dw'] / 2 + g['dw'] * x0) - 14, int(y - g['dh'] / 2 + g['dh'] * y0) - 14))
    return im

def stage2(g, t):
    k = back_out(seg(t, 1.8, 2.15), 1.3); im = drawer_scene(g, t, lerp(2600, 1000, k))
    for i, (it, xy, r) in enumerate(zip(g['clutter'], ((360, 880), (730, 980), (560, 1120)), (-10, 14, 0))):
        d = back_out(seg(t, 2.3 + i * 0.2, 2.6 + i * 0.2), 1.6)
        if d > 0: put(im, it, (xy[0], lerp(-300, xy[1], d)), 1, r)
    P.say(im, g['been'], t, 2.2, (540, 330), -2)
    return im

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the moment in B&W; scribbles crowd in
        im = gray(c['prob'].at(t)); scribbles(im, g, t, 0.0, 6)
        P.say(im, g['annoy'], t, 0.05, (540, 400), -2); P.say(im, g['again'], t, 0.45, (540, 1250), -4)
        if t > 1.55: im = swipe(im, stage2(g, t), seg(t, 1.55, 1.8))
        return im
    if t < 3.4: return stage2(g, t) if t < 3.0 else camera(stage2(g, t), (540, 1000), lerp(1, 2.6, ease(seg(t, 3.0, 3.4)) ** 2))
    if t < 5.0:                                                    # 3: the moment again, inside the drawer
        z = lerp(2.6, 1.0, ease(seg(t, 3.4, 3.8))); im = camera(drawer_scene(g, t, 1000, gray(c['prob2'].at(t - 3.4))), (540, 1000), z)
        scribbles(im, g, t, 3.6, 4); P.say(im, g['every'], t, 3.8, (540, 330), -2)
        return im
    if t < 6.6:                                                    # 4: scribbles take over, then wipe away to the fix
        if t < 5.35: im = drawer_scene(g, t, 1000, gray(c['prob2'].at(t - 3.4))); scribbles(im, g, t, 3.0, 10, grow=ease(seg(t, 5.0, 5.35)))
        else: im = c['fix'].at(t - 5.35); scribbles(im, g, t, 3.0, 10, grow=1.0, gone=5.35)
        if t > 5.9: doodle_on(im, t, 6.05, g['under'], (540, 1090), -2); P.say(im, g['fixed'], t, 5.9, (540, 960), -4)
        if t > 6.35: im = diagonal(im, stage5(g, t), seg(t, 6.35, 6.6))
        return im
    if t < 8.2: return stage5(g, t) if t < 7.95 else swipe(stage5(g, t), c['fix2'].at(t - 7.95), seg(t, 7.95, 8.2))
    if t < 9.8:                                                    # 6: the fix in use; one arrow up to the centre
        im = c['fix2'].at(t - 7.95); P.say(im, g['how'], t, 8.35, (540, 1380), -2); doodle_on(im, t, 8.7, g['arrow'], (540, 1215), 90)
        if t > 9.55: im = X.slice_h(im, c['cta'].at(t - 9.55), seg(t, 9.55, 9.8), (DARK, LIGHT)) if False else swipe(im, c['cta'].at(t - 12.05), seg(t, 9.55, 9.8), -1)
        return im
    im = c['cta'].at(t - 12.05)                                     # 7: CTA (clip offset so the lamp is lit)
    doodle_on(im, t, 10.35, g['burst'], (540, 1400), 0)                 # one burst, behind the name box
    P.say(im, g['comment'], t, 9.9, (540, 980), -3); P.say(im, g['kw'], t, 10.15, (540, 1220), 2); P.say(im, g['name'], t, 10.4, (540, 1400), -2)
    return im

def stage5(g, t):
    """5: the drawer drops away and the clutter tumbles after it; the fix stays as a photo card."""
    c = g['c']; drop = ease(seg(t, 6.7, 7.1)) ** 2; im = drawer_scene(g, t, lerp(1000, 2900, drop))
    for i, (it, xy, r) in enumerate(zip(g['clutter'], ((360, 880), (730, 980), (560, 1120)), (-10, 14, 0))):
        f = ease(seg(t, 6.75 + i * 0.08, 7.25 + i * 0.08)) ** 2; put(im, it, (xy[0] + (i - 1) * 300 * f, xy[1] + 1900 * f), 1, r + 200 * f)
    k = back_out(seg(t, 7.0, 7.35), 1.5)
    if k > 0: put(im, X.clip_card(c['fix'].at(t - 6.6, (560, 760)), 560, 760, 16, -3), (540, 900), k)
    P.say(im, g['nomore'], t, 7.3, (540, 1420), 2)
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
