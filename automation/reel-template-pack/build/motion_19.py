"""#19 Pair it with, motion test (2026-10-18). Keeps the wireframe's locket idea (her idea bank): a real open gold
locket on her burgundy-and-blush stripes, the main product in the left half and the pairing in the right half; the
right half flips like a coin to the next pairing. Built the #04-#13 round 3 way (play_extra: locked type, palette,
reading-time holds). Palette: wine + pink. No tech moment in this one.
Story (5 beats): hook "what to pair with [product]" / problem: it's even better with a partner / product: pairing 1, 2,
3 / proof: a perfect pair (the bundle) / CTA: comment [KEYWORD].
Scenes (graphics-only: 6):
 1 0.0  the open locket slides in: the product plays in the left half, the right half waits in pink; "what to pair" /
        "with" + [my steam mop]
 2 1.8  the right half fills with pairing 1; the camera dives into it: pairing 1 full frame; "+ [the stick vacuum]"
 3 3.6  LOCKET: the right half flips like a coin to pairing 2; "+ [the odor spray]" (one main action)
 4 5.2  pairing 2 full frame; a single underline under its name
 5 6.8  LOCKET: the right half flips to pairing 3; "+ [the litter]"
 6 8.4  STRIPES, no video: the real rose tea set, teapot and cup, "a perfect pair" + [ask about the bundle] with one
        burst behind the box
 7 10.0 CTA: all of them together (a 2x2 of the four clips stands in for the buyer's one "all together" clip);
        Comment / [KEYWORD] / [bundle name]
Usage: python build/motion_19.py [seconds ...]  ->  19-pair-it-with/preview/motion-test.mp4 (or a test sheet)
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

INK, CRM = (24, 23, 22), (246, 241, 232); WINE, PINK = X.WINE, X.PINK             # her palette: wine + pink
X.use_type(PINK, WINE); X.enable_holds()
DIR = '19-pair-it-with'
LW = 1040; LC = (540, 1000)
OVALS = [((0.247, 0.615), (0.18, 0.315)), ((0.75, 0.615), (0.183, 0.315))]     # the locket's two halves (centre, radii)
HOLDS = [(1.5, 1.1), (3.3, 1.35), (4.9, 1.15), (6.5, 0.6), (8.1, 1.2), (9.7, 1.4), (12.45, 0.3)]   # just before each transition

def setup():
    g = {'c': {'main': Clip('IMG_1464', 2.0), 'p1': Clip('IMG_1422', 7.0), 'p2': Clip('IMG_1439', 0.5), 'p3': Clip('IMG_1436', 2.0), 'cta': Clip('IMG_1423', 2.0)}}
    g['stripes'] = ImageOps.fit(S.raw('images', 'Vintage Burgundy and Blush Stripes.png'), (W, H)).convert('RGBA')
    lk = Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Open vintage gold locket, blank inside.png').convert('RGBA'); lk = P.style_object(S.fitw(lk, LW), 'smalldots', PINK, scale=0.3, strength=0.35, edge=8); g['locket'] = S.fitw(lk, LW); g['lh'] = g['locket'].height   # play on the object
    g['tea'] = P.thing('Vintage Rose Porcelain Tea Set.png', 820, 'smalldots', WINE, scale=0.3, strength=0.35)
    g['what'] = P.caption('what to pair', 150, WINE); g['with'] = X.hl('with [my steam mop]', 60, WHITE)
    g['plus'] = [X.hl(t, 62, (PINK, WHITE, PINK)[i]) for i, t in enumerate(('+ [the stick vacuum]', '+ [the odor spray]', '+ [the litter]'))]
    g['under'] = doodle('under', 0, 560, WHITE); g['arrow'] = doodle('arrow', 0, 170, WHITE)
    g['perfect'] = P.caption('a perfect pair', 140, WINE); g['bundle'] = X.hl('[ask about the bundle]', 60, WINE); g['burst'] = doodle('burst', 2, 640, CRM)
    g['comment'] = P.caption('Comment', 190, WINE); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['bname'] = X.hl('[the clean-home bundle]', 56, PINK)
    return g

def oval_mask(size):
    m = Image.new('L', size, 0); ImageDraw.Draw(m).ellipse((0, 0, size[0] - 1, size[1] - 1), fill=255); return m

def locket(g, t, left, right, y=None, flip=None, right_next=None, scale=1.0):
    """The locket on the stripes; `left`/`right` are clip frames (or a colour) shown inside the two halves; `flip`=(t0)
    flips the right half like a coin from `right` to `right_next`."""
    im = g['stripes'].copy(); cy = LC[1] if y is None else y; lk = g['locket'] if scale == 1 else g['locket'].resize((int(LW * scale), int(g['lh'] * scale)))
    x0, y0 = LC[0] - lk.width / 2, cy - lk.height / 2; im.alpha_composite(C.shadow(lk, (10, 18), 16, 110), (int(x0) - 16, int(y0) - 16))
    for i, ((fx, fy), (rx, ry)) in enumerate(OVALS):
        w, h = int(2 * rx * lk.width), int(2 * ry * lk.height); content = left if i == 0 else right; sx = 1.0
        if i == 1 and flip is not None:
            u = seg(t, flip, flip + 0.4); sx = abs(math.cos(math.pi * u)); content = right if u < 0.5 else right_next
        ww = max(2, int(w * sx))
        v = Image.new('RGBA', (w, h), content + (255,)) if isinstance(content, tuple) else ImageOps.fit(content, (w, h)).convert('RGBA')
        v = v.resize((ww, h)); v.putalpha(oval_mask((ww, h)))
        im.alpha_composite(v, (int(x0 + fx * lk.width - ww / 2), int(y0 + fy * lk.height - h / 2)))
    return im

def oval_centre(i, y=None):
    (fx, fy), _ = OVALS[i]; return (LC[0] - LW / 2 + fx * LW, (LC[1] if y is None else y) - 0 - 0 + (fy - 0.5) * 827)

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the locket slides in; product left, pink right
        k = back_out(seg(t, 0.0, 0.4), 1.3); y = lerp(-700, LC[1], k)
        im = locket(g, t, c['main'].at(t), PINK, y)
        P.say(im, g['what'], t, 0.1, (540, 330), -3); P.say(im, g['with'], t, 0.4, (540, 480), 2)
        return im
    if t < 3.6:                                                    # 2: pairing 1 fills the right half; dive into it
        if t < 2.6:
            im = locket(g, t, c['main'].at(t), c['p1'].at(t - 1.8), flip=1.8, right_next=c['p1'].at(t - 1.8))
            if t > 2.2: im = camera(im, oval_centre(1), lerp(1, 3.0, ease(seg(t, 2.2, 2.6)) ** 2))
            return im
        im = camera(c['p1'].at(t - 1.8), (540, 960), lerp(1.4, 1, ease(seg(t, 2.6, 2.9)))); P.say(im, g['plus'][0], t, 2.8, (540, 1380), -2)
        if t > 3.35: im = swipe(im, locket(g, 3.6, c['main'].at(3.6), c['p1'].at(1.8)), seg(t, 3.35, 3.6), -1)
        return im
    if t < 5.2:                                                    # 3: the right half flips to pairing 2
        im = locket(g, t, c['main'].at(t), c['p1'].at(t - 1.8), flip=3.8, right_next=c['p2'].at(t - 3.8))
        P.say(im, g['plus'][1], t, 4.25, (540, 1460), 2); doodle_on(im, t, 4.5, g['arrow'], (800, 1340), 75)   # up to the right half
        if t > 4.95: im = diagonal(im, c['p2'].at(t - 3.8), seg(t, 4.95, 5.2))
        return im
    if t < 6.8:                                                    # 4: pairing 2, full frame
        im = c['p2'].at(t - 3.8); P.say(im, g['plus'][1], t, 5.25, (540, 1380), 2); doodle_on(im, t, 5.6, g['under'], (540, 1460), -2)
        if t > 6.55: im = swipe(im, locket(g, 6.8, c['main'].at(6.8), c['p2'].at(3.0)), seg(t, 6.55, 6.8))
        return im
    if t < 8.4:                                                    # 5: the right half flips to pairing 3
        im = locket(g, t, c['main'].at(t), c['p2'].at(t - 3.8), flip=7.0, right_next=c['p3'].at(t - 7.0))
        P.say(im, g['plus'][2], t, 7.45, (540, 1460), -2)
        if t > 8.15: im = diagonal(im, stage6(g, t), seg(t, 8.15, 8.4))
        return im
    if t < 10.0:
        im = stage6(g, t)
        if t > 9.75: im = swipe(im, cta(g, 10.0), seg(t, 9.75, 10.0), -1)
        return im
    return cta(g, t)

def stage6(g, t):
    im = g['stripes'].copy(); put(im, g['tea'], (540, lerp(2400, 1000, back_out(seg(t, 8.4, 8.75), 1.3))), 1, -3)
    P.say(im, g['perfect'], t, 8.6, (540, 380), -3)
    doodle_on(im, t, 8.85, g['burst'], (540, 1460), 0); P.say(im, g['bundle'], t, 8.9, (540, 1460), 2)
    return im

def cta(g, t):
    c = g['c']; im = Image.new('RGBA', (W, H), CRM + (255,)); half = (W // 2, H // 2)
    for i, (cl, t0) in enumerate(((c['main'], 0), (c['p1'], 1.8), (c['p2'], 3.8), (c['p3'], 7.0))):
        im.alpha_composite(ImageOps.fit(cl.at(t - t0), (half[0] - 6, half[1] - 6)).convert('RGBA'), ((i % 2) * half[0] + 3, (i // 2) * half[1] + 3))
    P.say(im, g['comment'], t, 10.2, (540, 900), -3); P.say(im, g['kw'], t, 10.45, (540, 1080), 2); P.say(im, g['bname'], t, 10.65, (540, 1210), -2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 12.5 + sum(h for _, h in HOLDS); render('19', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
