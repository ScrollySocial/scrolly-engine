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
from PIL import Image, ImageChops, ImageDraw, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
from PIL import ImageFilter
import storyboard_b2 as S
import play as P
import play_extra as X
from story4 import swipe, diagonal, roundwin
from collage_kit import doodle, doodle_on
from motion_b2 import Clip, put, render, camera, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (24, 23, 22), (246, 241, 232); WINE, PINK = X.WINE, X.PINK             # her palette: wine + pink
X.use_type(PINK, WINE); X.enable_holds()
DIR = '19-pair-it-with'
LW = 980; LC = (540, 1100)
OVALS = [((0.245, 0.594), (0.163, 0.297)), ((0.743, 0.591), (0.163, 0.31))]   # the two openings (centre, radii) as shares of the RAW photo
PAD = 54                                                                       # die-cut (12) + shadow (42) pad around the raw photo
HOLDS = [(1.75, 0.7), (2.9, 1.3), (4.5, 1.5), (6.1, 1.3), (8.1, 0.8), (9.7, 1.4), (12.45, 0.3)]   # just before each transition

def setup():
    g = {'c': {'main': Clip('IMG_1464', 2.0), 'p1': X.Window(Clip('IMG_1422', 0.0), 7.5, 10.5), 'p2': Clip('IMG_1439', 0.5), 'p3': Clip('IMG_1436', 2.0), 'cta': Clip('IMG_1423', 2.0)}}
    tis = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))      # a calm pink paper stage (her note: no busy patterns)
    g['stripes'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tis), (214, 150, 178), PINK), (W, H)).convert('RGBA')
    lk = Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Open vintage gold locket, blank inside.png').convert('RGBA'); g['locket'] = P.style_object(S.fitw(lk, LW), None, None, edge=8); g['lh'] = g['locket'].height   # play on the object
    HQ = S.E.PACK / 'build' / '.cache' / 'hq'
    def fr_(name, w): return C.shadow(S.fitw(Image.open(HQ / (name + '.png')).convert('RGBA'), w), (10, 18), 14, 110)
    # her real frames (2026-10-18): each with its opening as (x0, y0, x1, y1) shares of the frame; 'top' = the clip goes ON the backing
    g['frames'] = {'gold': (fr_('Empty ornate antique gold frame-3', 680), (0.18, 0.145, 0.83, 0.84), False),
                   'pink': (fr_('Blush pink scalloped portrait frame-5', 470), (0.22, 0.175, 0.80, 0.82), True),
                   'oval': (fr_('Vintage oval brass frame with floral crest-4', 480), (0.10, 0.20, 0.90, 0.89), False),
                   'walnut': (fr_('Empty walnut picture frame-2', 720), (0.086, 0.12, 0.914, 0.88), False)}
    # things that come in pairs (her note): a torn paper heart's two halves, glasses' two lenses
    h = S.fitw(S.cut('images', 'Torn red paper heart halves-91.png', tol=18), 820); hm = h.split()[3].point(lambda v: 255 if v > 100 else 0)
    left = hm.copy(); ImageDraw.floodfill(left, (int(h.width * 0.22), int(h.height * 0.4)), 128); left = left.point(lambda v: 255 if v == 128 else 0)
    right = ImageChops.subtract(hm, left); g['heart'] = (h, left, right)
    gl = S.fitw(S.cut('fall', 'Bold black acetate eyeglass front frame-4.png', tol=18, holes=((0.27, 0.5), (0.73, 0.5))), 1000)
    lens = []
    for fx in (0.27, 0.73):
        m = Image.new('L', gl.size, 0); a = gl.split()[3].point(lambda v: 0 if v > 60 else 255); ImageDraw.floodfill(a, (int(gl.width * fx), int(gl.height * 0.5)), 128)
        lens.append(a.point(lambda v: 255 if v == 128 else 0))
    g['glasses'] = (gl, lens)
    g['tea'] = P.thing('Vintage Rose Porcelain Tea Set.png', 820, 'smalldots', WINE, scale=0.3, strength=0.35)
    g['what'] = P.caption('what to', 190, WHITE); g['pairw'] = P.caption('pair?', 300, WHITE); g['q'] = X.key('?', 330, WINE, (246, 241, 232)); g['why'] = X.hl('[why they go together]', 60, PINK); g['with'] = X.hl('with [my steam mop]', 60, WHITE)
    g['plus'] = [X.hl(t, 62, (PINK, WHITE, PINK)[i]) for i, t in enumerate(('+ [the stick vacuum]', '+ [the odor spray]', '+ [the litter]'))]
    g['under'] = doodle('under', 0, 560, WHITE); g['plusbig'] = P.sticker('+', 150, WINE, WHITE, 'circle'); g['arrow'] = doodle('arrow', 0, 160, WHITE); g['pair1'] = P.caption('pair it with', 130, INK)
    g['perfect'] = P.caption('a perfect pair', 140, WINE); g['bundle'] = X.hl('[ask about the bundle]', 60, WINE); g['hearts'] = [P.die_cut(doodle('icon', 2 + i % 2, 150, WINE), 5, False) for i in range(3)]; g['burst'] = doodle('burst', 2, 640, CRM)
    g['comment'] = P.caption('Comment', 190, WINE); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['bname'] = X.hl('[the clean-home bundle]', 60, PINK)
    return g

def oval_mask(size):
    m = Image.new('L', size, 0); ImageDraw.Draw(m).ellipse((0, 0, size[0] - 1, size[1] - 1), fill=255); return m

def locket(g, t, left, right, y=None, flip=None, right_next=None, scale=1.0, bg=True):
    """The locket; `left`/`right` are clip frames (or a colour) inside its two openings. `flip`=t0 turns the right half
    like a scrapbook page on the hinge (old page folds onto the hinge, the new one opens out) to `right_next`."""
    im = g['stripes'].copy() if bg else Image.new('RGBA', (W, H), (0, 0, 0, 0)); cy = LC[1] if y is None else y; lk = g['locket']
    x0, y0 = LC[0] - lk.width / 2, cy - lk.height / 2; im.alpha_composite(lk, (int(x0), int(y0)))
    rx0, ry0, rw, rh = x0 + PAD, y0 + PAD, lk.width - 2 * PAD, lk.height - 2 * PAD
    for i, ((fx, fy), (ax, ay)) in enumerate(OVALS):
        w, h = int(2 * ax * rw), int(2 * ay * rh); content = left if i == 0 else right; sx = 1.0; anchor = None
        if i == 1 and flip is not None:
            u = seg(t, flip, flip + 0.5); sx = abs(math.cos(math.pi * u)); content = right if u < 0.5 else right_next; anchor = rx0 + (fx - ax) * rw
        if content is None: continue
        ww = max(2, int(w * sx))
        v = Image.new('RGBA', (w, h), content + (255,)) if isinstance(content, tuple) else ImageOps.fit(content, (w, h), centering=(0.5, 0.45)).convert('RGBA')
        v.putalpha(oval_mask((w, h))); v = v.resize((ww, h))
        cxp = rx0 + fx * rw; x = cxp - ww / 2 if anchor is None else anchor
        if anchor is not None and sx < 0.97: ImageDraw.Draw(v).line((ww - 3, 0, ww - 3, h), fill=(255, 255, 255, 200), width=4)   # page edge
        im.alpha_composite(v, (int(x), int(ry0 + fy * rh - h / 2)))
    return im

def oval_centre(i, y=None):
    (fx, fy), _ = OVALS[i]; return (LC[0] - LW / 2 + fx * LW, (LC[1] if y is None else y) + (fy - 0.5) * LW * 812 / 1021)

def ask_marks(im, g, t, t0, gone=None):
    """Big '?'s floating up out of the empty half (wine, cream edge), wobbling; they fly off at `gone`."""
    (fx, fy), _ = OVALS[1]; cx, cy = oval_centre(1)
    for i, (dx, dy, sz) in enumerate(((-60, -520, 1.0), (170, -380, 0.8), (-200, -300, 0.65), (230, -620, 0.7), (40, -760, 0.55))):
        u = ease(seg(t, t0 + i * 0.15, t0 + i * 0.15 + 0.6))
        if u <= 0: continue
        x, y = cx + dx * u + 14 * math.sin(t * 3 + i), cy + dy * u + 10 * math.sin(t * 4 + i)
        if gone is not None:
            v = ease(seg(t, gone, gone + 0.3)); x += (1 if i % 2 else -1) * 900 * v; y -= 300 * v
        put(im, g['q'], (x, y), sz * min(1, u * 1.5), (i * 23) % 30 - 15)

def frame(g, t):
    c = g['c']; rc = oval_centre(1); lc = oval_centre(0)
    if t < 1.8:                                                    # 1: the hero video full frame zooms out into the locket's oval
        z = lerp(4.8, 1.0, ease(seg(t, 0.35, 1.25)))                 # (her IG-friendly intro: frame 1 is the product, moving)
        im = camera(locket(g, t, c['main'].at(t), PINK), lc, z)
        ask_marks(im, g, t, 1.15)
        P.say(im, g['what'], t, 0.05, (500, 300), -3); P.say(im, g['pairw'], t, 0.25, (560, 500), -2)
        return im
    if t < 3.0:                                                    # 2: the empty half fills with a great pair
        k = back_out(seg(t, 1.9, 2.3), 1.4); im = locket(g, t, c['main'].at(t), None)
        if k > 0:
            (fx, fy), (ax, ay) = OVALS[1]; lk = g['locket']; rw, rh = lk.width - 2 * PAD, lk.height - 2 * PAD
            w, h = int(2 * ax * rw * k), int(2 * ay * rh * k)
            if w > 4: v = ImageOps.fit(c['p1'].at(t - 1.8), (w, h), centering=(0.5, 0.45)).convert('RGBA'); v.putalpha(oval_mask((w, h))); put(im, v, rc)
        if k < 0.5:
            pk = locket(g, t, None, PINK, bg=False); im.alpha_composite(pk) if False else None
        ask_marks(im, g, t, 1.15, gone=1.9)
        P.say(im, g['plus'][0], t, 2.3, (540, 1600 - 130), -2); X.sparkles(im, t, 2.3, [(880, 640), (990, 900)], WINE, 140)
        return im
    if t < 4.6:                                                    # 3: the camera dives into the right half: pairing 1 full frame
        z = lerp(1.0, 4.8, ease(seg(t, 3.0, 3.5)) ** 2)
        im = camera(locket(g, t, c['main'].at(t), c['p1'].at(t - 1.8)), rc, z) if t < 3.5 else c['p1'].at(t - 1.8)
        P.say(im, g['why'], t, 3.6, (540, 1380), -2)
        return im
    if t < 6.2:                                                    # 4: back out to the locket; the scrapbook page turns to pairing 2
        z = lerp(4.8, 1.0, ease(seg(t, 4.6, 5.0)))
        im = camera(locket(g, t, c['main'].at(t), c['p1'].at(t - 1.8), flip=5.1, right_next=c['p2'].at(t - 5.1)), rc, z)
        P.say(im, g['plus'][1], t, 5.5, (540, 1470), 2)
        return im
    if t < 8.4:                                                    # 5: the page turns again: pairing 3
        im = locket(g, t, c['main'].at(t), c['p2'].at(t - 5.1), flip=6.5, right_next=c['p3'].at(t - 6.5))
        P.say(im, g['plus'][2], t, 6.9, (540, 1470), -2); X.sparkles(im, t, 7.0, [(140, 700), (960, 640), (930, 1350)], WINE, 140)
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
        v = ImageOps.fit(clips[name], (ow + 8, oh + 8), centering=(0.5, 0.35)).convert('RGBA')   # keep the product, not the hand
        if name == 'oval': v.putalpha(oval_mask(v.size))
        if top: wall.alpha_composite(fim, (fx, fy)); wall.alpha_composite(v, (fx + int(fim.width * x0) - 4, fy + int(fim.height * y0) - 4))
        else: wall.alpha_composite(v, (fx + int(fim.width * x0) - 4, fy + int(fim.height * y0) - 4)); wall.alpha_composite(fim, (fx, fy))
    vh = int(H / zoom); y = int(max(0, min(GH - vh, view_y))); vw = int(W / zoom); x = int((W - vw) / 2)
    if zoom >= 1: return wall.crop((0, y, W, y + H))
    view = Image.new('RGBA', (vw, vh)); view.alpha_composite(g['stripes'].resize((vw, vh)), (0, 0)); view.alpha_composite(wall.crop((0, y, W, min(GH, y + vh))), (-x, 0))
    return view.resize((W, H), Image.BILINEAR)

def heart(g, t, a, b):
    """The two torn halves of a real paper heart slide together; the product plays in the left half, the pairing in the
    right (the torn white edge stays)."""
    h, left, right = g['heart']; im = g['stripes'].copy(); u = back_out(seg(t, 1.9, 2.5), 1.2); gap = lerp(300, 0, u)
    for side, (m, cl) in enumerate(((left, a), (right, b))):
        half = Image.new('RGBA', h.size, (0, 0, 0, 0)); half.alpha_composite(h); half.putalpha(m)
        bb = m.getbbox(); v = Image.new('RGBA', h.size, (0, 0, 0, 0)); v.paste(ImageOps.fit(cl, (bb[2] - bb[0], bb[3] - bb[1]), centering=(0.5, 0.45)).convert('RGBA'), bb[:2])
        v.putalpha(m.filter(ImageFilter.MinFilter(17))); half.alpha_composite(v); x = 540 + (-gap if side == 0 else gap); put(im, C.shadow(half, (8, 14), 14, 110), (x, 980), 1, (-6, 6)[side] * (1 - u))
    if u >= 0.98: X.sparkles(im, t, 2.55, [(160, 600), (930, 640), (900, 1350)], WINE, 140)
    return im

def glasses(g, t, a, b):
    """Glasses: colour inside the lenses, greyscale outside (her idea bank): the product in the left lens, the pairing in
    the right, the pairing's clip in grey behind."""
    gl, lens = g['glasses']; im = ImageOps.grayscale(b.convert('RGB')).convert('RGBA'); k = back_out(seg(t, 6.8, 7.2), 1.3)
    for m, cl in zip(lens, (a, b)):
        bb = m.getbbox(); v = Image.new('RGBA', gl.size, (0, 0, 0, 0)); v.paste(ImageOps.fit(cl, (bb[2] - bb[0], bb[3] - bb[1]), centering=(0.5, 0.45)).convert('RGBA'), bb[:2]); v.putalpha(m); im.alpha_composite(v, (int(540 - gl.width / 2), int(lerp(-400, 900, k) - gl.height / 2)))
    put(im, gl, (540, lerp(-400, 900, k)))
    return im

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
    """'a perfect pair': the locket itself, the product in one half and pairing 1 in the other; hearts + sparkles."""
    c = g['c']; k = back_out(seg(t, 8.4, 8.75), 1.3)
    im = locket(g, t, c['main'].at(t), c['p1'].at(t - 1.8), lerp(2400, LC[1], k))
    P.say(im, g['perfect'], t, 8.6, (540, 380), -3)
    for i, (xy, r) in enumerate((((150, 640), -15), ((930, 600), 12), ((880, 1560), -8))):
        put(im, g['hearts'][i], xy, back_out(seg(t, 8.8 + i * 0.12, 9.05 + i * 0.12), 2.0), r + 6 * math.sin(t * 3 + i))
    X.sparkles(im, t, 8.9, [(250, 1500), (980, 900), (100, 1000)], WINE, 140)
    return im

def cta(g, t):
    """CTA (a new scene, her note): the product full frame, the three pairings in their real frames pinned along the top;
    the bundle name on its own at the top, the keyword on its own in the middle (they no longer compete)."""
    c = g['c']; im = c['main'].at(t).copy()
    for i, (cl, t0, x) in enumerate(((c['p1'], 1.8, 200), (c['p3'], 6.8, 540), (c['p2'], 3.8, 880))):   # the pairings in round windows
        put(im, roundwin(cl.at(t - t0, (280, 280)), 280), (x, lerp(-300, 470, back_out(seg(t, 10.0 + i * 0.12, 10.35 + i * 0.12), 1.4))), 1)
    P.say(im, g['bname'], t, 10.3, (540, 860), -2)
    P.say(im, g['comment'], t, 10.6, (540, 1150), -3); P.say(im, g['kw'], t, 10.85, (540, 1330), 2)
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
