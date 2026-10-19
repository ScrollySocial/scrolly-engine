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
LW = 900; LC = (540, 1080)
OVALS = [((0.247, 0.615), (0.18, 0.315)), ((0.75, 0.615), (0.183, 0.315))]     # the locket's two halves (centre, radii)
HOLDS = [(1.5, 1.1), (3.3, 1.35), (4.9, 1.15), (6.5, 0.6), (8.1, 1.2), (9.7, 1.4), (12.45, 0.3)]   # just before each transition

def setup():
    g = {'c': {'main': Clip('IMG_1464', 2.0), 'p1': Clip('IMG_1422', 7.0), 'p2': Clip('IMG_1439', 0.5), 'p3': Clip('IMG_1436', 2.0), 'cta': Clip('IMG_1423', 2.0)}}
    tis = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))      # a calm pink paper stage (her note: no busy patterns)
    g['stripes'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tis), (214, 150, 178), PINK), (W, H)).convert('RGBA')
    lk = Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Open vintage gold locket, blank inside.png').convert('RGBA'); lk = P.style_object(S.fitw(lk, LW), 'smalldots', PINK, scale=0.3, strength=0.35, edge=8); g['locket'] = S.fitw(lk, LW); g['lh'] = g['locket'].height   # play on the object
    HQ = S.E.PACK / 'build' / '.cache' / 'hq'
    def fr_(name, w): return C.shadow(S.fitw(Image.open(HQ / (name + '.png')).convert('RGBA'), w), (10, 18), 14, 110)
    # her real frames (2026-10-18): each with its opening as (x0, y0, x1, y1) shares of the frame; 'top' = the clip goes ON the backing
    g['frames'] = {'gold': (fr_('Empty ornate antique gold frame-3', 680), (0.18, 0.145, 0.83, 0.84), False),
                   'pink': (fr_('Blush pink scalloped portrait frame-5', 470), (0.22, 0.175, 0.80, 0.82), True),
                   'oval': (fr_('Vintage oval brass frame with floral crest-4', 480), (0.10, 0.20, 0.90, 0.89), False),
                   'walnut': (fr_('Empty walnut picture frame-2', 720), (0.086, 0.12, 0.914, 0.88), False)}
    g['tea'] = P.thing('Vintage Rose Porcelain Tea Set.png', 820, 'smalldots', WINE, scale=0.3, strength=0.35)
    g['what'] = P.caption('what to', 190, INK); g['pairw'] = P.caption('pair', 300, INK); g['with'] = X.hl('with [my steam mop]', 60, WHITE)
    g['plus'] = [X.hl(t, 62, (PINK, WHITE, PINK)[i]) for i, t in enumerate(('+ [the stick vacuum]', '+ [the odor spray]', '+ [the litter]'))]
    g['under'] = doodle('under', 0, 560, WHITE); g['plusbig'] = P.sticker('+', 150, WINE, WHITE, 'circle'); g['arrow'] = doodle('arrow', 0, 160, WHITE); g['pair1'] = P.caption('pair it with', 130, INK)
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
    (fx, fy), _ = OVALS[i]; return (LC[0] - LW / 2 + fx * LW, (LC[1] if y is None else y) - 0 - 0 + (fy - 0.5) * 715)

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the locket slides in; product left, pink right
        k = back_out(seg(t, 0.0, 0.4), 1.3); y = lerp(-700, LC[1], k)
        im = locket(g, t, c['main'].at(t), PINK, y)
        P.say(im, g['what'], t, 0.05, (500, 300), -3); P.say(im, g['pairw'], t, 0.25, (560, 500), -2); P.say(im, g['with'], t, 0.55, (540, 680), 2)
        X.sparkles(im, t, 0.3, [(130, 250), (930, 330), (150, 600), (960, 640), (880, 1600), (180, 1620)], WINE, 170)
        return im
    if t < 3.6:                                                    # 2: the gallery wall: the product in the gold frame, pairing 1 in the pink one
        im = gallery(g, t, 0, 1.0, {'gold': c['main'].at(t), 'pink': c['p1'].at(t - 1.8)}, pink_in=1.9)
        P.say(im, g['pair1'], t, 1.95, (540, 300), -2); P.say(im, g['plus'][0], t, 2.3, (640, 1400), -2)
        if t < 1.95: im = diagonal(locket(g, t, c['main'].at(t), PINK), im, seg(t, 1.8, 1.95))
        if t > 3.35: im = swipe(im, close3(g, 3.6), seg(t, 3.35, 3.6), -1)
        return im
    if t < 5.2:                                                    # 3: the locket up close; its right half flips to pairing 2
        im = close3(g, t)
        if t > 4.95: im = diagonal(im, c['p2'].at(t - 3.8), seg(t, 4.95, 5.2))
        return im
    if t < 6.8:                                                    # 4: pairing 2, full frame
        im = c['p2'].at(t - 3.8); P.say(im, g['plus'][1], t, 5.25, (540, 1380), 2); doodle_on(im, t, 5.6, g['under'], (540, 1460), -2)
        if t > 6.55: im = swipe(im, diag5(g, 6.8), seg(t, 6.55, 6.8))
        return im
    if t < 8.4:                                                    # 5: the camera pans down the wall: pairing 3 in the oval frame
        y = lerp(400, 980, ease(seg(t, 6.8, 7.4)))
        im = gallery(g, t, y, 1.0, {'gold': c['main'].at(t), 'pink': c['p1'].at(t - 1.8), 'walnut': c['p2'].at(t - 3.8), 'oval': c['p3'].at(t - 6.8)})
        P.say(im, g['plus'][2], t, 7.45, (760, 1060), 2)
        if t > 8.15: im = diagonal(im, stage6(g, t), seg(t, 8.15, 8.4))
        return im
    if t < 10.0:
        im = stage6(g, t)
        if t > 9.75: im = swipe(im, cta(g, 10.0), seg(t, 9.75, 10.0), -1)
        return im
    return cta(g, t)

GALLERY = {'gold': (540, 760), 'pink': (270, 1500), 'walnut': (540, 2380), 'oval': (820, 1680)}
GH = 2900

def gallery(g, t, view_y, zoom, clips, pink_in=None):
    """Her real frames hung on the calm pink paper wall (a tall stage); each frame shows its clip. The view is the part
    of the wall from view_y down, at `zoom` (zoom < 1 pulls back to show more of the wall)."""
    wall = Image.new('RGBA', (W, GH)); wall.alpha_composite(g['stripes'], (0, 0)); wall.alpha_composite(g['stripes'], (0, H))
    for name, (fim, (x0, y0, x1, y1), top) in g['frames'].items():
        if name not in clips: continue
        cx, cy = GALLERY[name]
        if name == 'pink' and pink_in is not None: cy = lerp(-600, cy, back_out(seg(t, pink_in, pink_in + 0.35), 1.3))
        fx, fy = int(cx - fim.width / 2), int(cy - fim.height / 2); ow, oh = int(fim.width * (x1 - x0)), int(fim.height * (y1 - y0))
        v = ImageOps.fit(clips[name], (ow + 8, oh + 8)).convert('RGBA')
        if name == 'oval': v.putalpha(oval_mask(v.size))
        if top: wall.alpha_composite(fim, (fx, fy)); wall.alpha_composite(v, (fx + int(fim.width * x0) - 4, fy + int(fim.height * y0) - 4))
        else: wall.alpha_composite(v, (fx + int(fim.width * x0) - 4, fy + int(fim.height * y0) - 4)); wall.alpha_composite(fim, (fx, fy))
    vh = int(H / zoom); y = int(max(0, min(GH - vh, view_y))); vw = int(W / zoom); x = int((W - vw) / 2)
    if zoom >= 1: return wall.crop((0, y, W, y + H))
    view = Image.new('RGBA', (vw, vh)); view.alpha_composite(g['stripes'].resize((vw, vh)), (0, 0)); view.alpha_composite(wall.crop((0, y, W, min(GH, y + vh))), (-x, 0))
    return view.resize((W, H), Image.BILINEAR)

def split2(g, t, a, b):
    im = g['stripes'].copy(); w, h = 500, 1180
    put(im, X.clip_card(a, w, h, 14, -2), (290, 980)); put(im, X.clip_card(b, w, h, 14, 2), (790, 1000))
    P.say(im, g['plusbig'], t, 1.95, (540, 980), 0); P.say(im, g['pair1'], t, 2.0, (540, 300), -2)
    return im

def close3(g, t):
    c = g['c']; im = locket(g, t, c['main'].at(t), c['p1'].at(t - 1.8), flip=3.9, right_next=c['p2'].at(t - 3.8))
    X.sparkles(im, t, 4.25, [(860, 560), (990, 800), (900, 1500)], WINE, 150)   # the whole locket stays in view (her note)
    P.say(im, g['plus'][1], t, 4.3, (540, 1450), 2); doodle_on(im, t, 4.6, g['arrow'], (540, 1330), 90)
    return im

def diag5(g, t):
    c = g['c']; im = c['p3'].at(t - 6.8).copy(); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W, 0), (W, 700), (0, 1220)], fill=255)
    im.paste(c['main'].at(t), (0, 0), m); ImageDraw.Draw(im).line([(0, 1220), (W, 700)], fill=PINK + (255,), width=16)
    P.say(im, g['plusbig'], t, 6.85, (540, 960), 0); P.say(im, g['plus'][2], t, 7.1, (600, 1420), -2)
    return im

def stage6(g, t):
    im = g['stripes'].copy(); put(im, g['tea'], (540, lerp(2400, 1000, back_out(seg(t, 8.4, 8.75), 1.3))), 1, -3)
    P.say(im, g['perfect'], t, 8.6, (540, 380), -3)
    doodle_on(im, t, 8.85, g['burst'], (540, 1460), 0); P.say(im, g['bundle'], t, 8.9, (540, 1460), 2)
    return im

def cta(g, t):
    """All of them together: the camera pulls back to the whole gallery wall."""
    c = g['c']; z = lerp(1.0, 0.66, ease(seg(t, 10.0, 10.6)))
    im = gallery(g, t, lerp(400, 0, ease(seg(t, 10.0, 10.6))), z, {'gold': c['main'].at(t), 'pink': c['p1'].at(t - 1.8), 'walnut': c['p2'].at(t - 3.8), 'oval': c['p3'].at(t - 6.8)})
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
