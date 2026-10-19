"""#17 Everything that goes into one, motion test (2026-10-18). Built the #04-#13 round 3 way (play_extra: locked
type, palette, reading-time holds). World: the flat lay: a real walnut serving tray from above on light-blue marble.
The materials are the buyer's OWN photos (works for any maker: no stand-in objects that only fit one product), landing
on the tray one at a time like photo cards, each with its label. Palette: light blue + butter (ink outlines). No tech.
Story (5 beats): hook "everything that goes into one [product]" / problem: a price tag hides what's inside / product:
each material, placed / proof: it all adds up to one [product] / CTA: comment [KEYWORD].
Scenes (graphics-only: 2, 5):
 1 0.0  the tray slides in from above; the empty-table clip plays INSIDE the tray; "everything that goes" / "into one"
 2 1.8  TRAY, no video: material photos land one at a time, each with its label on a box
 3 3.8  placing a material, full frame (the camera dives out of card 1); [what it is]; one arrow up to the centre
 4 5.4  card 2 flips over on the tray and becomes the next placing clip, full frame
 5 7.0  TRAY: the materials slide to the corners; the finished one drops into the middle; "= one [smoothie]" + a single
        underline
 6 8.6  the finished one, close, full frame; [made fresh, to order] with one burst behind the box
 7 10.2 CTA: Comment / [KEYWORD] / [Product name]
Usage: python build/motion_17.py [seconds ...]  ->  17-everything-that-goes-into-one/preview/motion-test.mp4 (or a test sheet)
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

INK, CRM = (24, 23, 22), (246, 241, 232); BLUE, BUTTER = X.BABY, X.BUTTER          # her palette: light blue + butter
X.use_type(BUTTER, INK); X.enable_holds()
DIR = '17-everything-that-goes-into-one'
TRAY_C = (540, 1010); TRAY_IN = (0.09, 0.06, 0.91, 0.94)
SLOTS = [(320, 640), (770, 760), (400, 1300)]; NAMES = ('[watermelon]', '[oat milk]', '[a little honey]')
HOLDS = [(1.75, 0.6), (3.35, 1.5), (5.1, 0.4), (8.3, 1.1), (9.9, 1.1), (12.45, 0.3)]   # just before each transition

def setup():
    g = {'c': {'empty': Clip('IMG_1386', 0.5), 'place1': Clip('IMG_1387', 1.5), 'place2': Clip('IMG_1389', 2.5), 'done': Clip('IMG_1391', 0.0, 1.5),
               'close': Clip('IMG_1393', 3.0), 'cta': Clip('IMG_1395', 0.5)}}
    m = ImageOps.grayscale(S.raw('images', 'Soft veined white marble texture-1.png'))
    g['bg'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(m), (214, 160, 182), X.PINK), (W, H)).convert('RGBA')   # off blue (her note): pink marble
    tray = Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Empty walnut serving tray-59.png').convert('RGBA').rotate(90, expand=True)
    tray = S.fith(tray, 1520); g['tray'] = C.shadow(tray, (12, 22), 18, 120); g['tw'], g['th'] = tray.size
    g['stills'] = [S.footage(c, (420, 520)) for c in (('IMG_1388', 1.0), ('IMG_1389', 3.0), ('IMG_1387', 5.0))]
    g['cards'] = [X.clip_card(s, 360, 445, 14, r) for s, r in zip(g['stills'], (-6, 5, -3))]
    g['labels'] = [X.hl(n, 54, (BUTTER, WHITE, BUTTER)[i]) for i, n in enumerate(NAMES)]
    g['every'] = P.caption('everything that', 140, INK); g['into'] = P.caption('goes into one', 175, INK)
    g['prod'] = X.hl('[smoothie]', 70, BUTTER)
    g['what'] = X.hl('[fresh watermelon]', 60, WHITE); g['arrow'] = doodle('arrow', 0, 190, WHITE)
    g['equals'] = P.caption('= one', 190, INK); g['under'] = doodle('under', 0, 520, BUTTER)
    g['fresh'] = X.hl('[made fresh, to order]', 60, BUTTER); g['burst'] = doodle('burst', 2, 560, WHITE)
    g['comment'] = P.caption('Comment', 190, INK); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['name'] = X.hl('[Product name]', 56, BLUE)
    return g

def tray(g, t, clip_im=None, y=None):
    im = g['bg'].copy(); c = (TRAY_C[0], TRAY_C[1] if y is None else y); put(im, g['tray'], c)
    if clip_im is not None:
        x0, y0, x1, y1 = TRAY_IN; w, h = int(g['tw'] * (x1 - x0)), int(g['th'] * (y1 - y0))
        v = ImageOps.fit(clip_im, (w, h)).convert('RGBA'); im.alpha_composite(v, (int(c[0] - g['tw'] / 2 + g['tw'] * x0), int(c[1] - g['th'] / 2 + g['th'] * y0)))
    return im

def stage2(g, t, flip=None):
    im = tray(g, t)
    for i, (cd, xy) in enumerate(zip(g['cards'], SLOTS)):
        t0 = 1.9 + i * 0.45; k = back_out(seg(t, t0, t0 + 0.3), 1.5)
        if k <= 0: continue
        if flip is not None and i == 1:                              # card 2 flips over (squash) and becomes the clip
            u = seg(t, flip, flip + 0.3); sx = abs(math.cos(math.pi * u)); it = cd if u < 0.5 else X.clip_card(g['c']['place2'].at(t - flip, (360, 445)), 360, 445, 14, 5)
            it = it.resize((max(2, int(it.width * sx)), it.height)); put(im, it, xy); continue
        put(im, cd, (xy[0], lerp(-400, xy[1], k)), 1)
        P.say(im, g['labels'][i], t, t0 + 0.25, (xy[0], xy[1] + 270), (-3, 3, -2)[i])
    return im

def stage5(g, t):
    im = tray(g, t); u = ease(seg(t, 7.1, 7.5))
    for i, (cd, xy, to) in enumerate(zip(g['cards'], SLOTS, ((250, 520), (830, 620), (270, 1520)))):
        put(im, cd, lerp2(xy, to, u), lerp(1, 0.62, u))
    k = back_out(seg(t, 7.4, 7.75), 1.5)
    if k > 0: put(im, X.clip_card(g['c']['done'].at(t - 7.4, (430, 560)), 430, 560, 16, 2), (600, lerp(-500, 1040, k)))
    P.say(im, g['equals'], t, 7.75, (540, 300), -3); P.say(im, g['prod'], t, 7.95, (540, 440), 2)
    return im

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the empty-table clip inside the tray
        k = ease(seg(t, 0.0, 0.35)); im = tray(g, t, c['empty'].at(t), lerp(-900, TRAY_C[1], k))
        P.say(im, g['every'], t, 0.05, (540, 300), -2); P.say(im, g['into'], t, 0.3, (540, 470), -3); X.sparkles(im, t, 0.4, [(110, 250), (980, 330), (90, 1250), (990, 1350)], X.WINE, 150); doodle_on(im, t, 0.9, g['under'], (540, 590), -2)
        return im
    if t < 3.8:
        im = stage2(g, t)
        if t > 3.4: im = camera(im, SLOTS[0], lerp(1, 4.2, ease(seg(t, 3.4, 3.8)) ** 2))
        return im
    if t < 5.4:                                                    # 3: placing a material, full frame
        im = camera(c['place1'].at(t - 3.8), (540, 960), lerp(1.4, 1, ease(seg(t, 3.8, 4.1))))
        P.say(im, g['what'], t, 4.0, (540, 1380), -2); doodle_on(im, t, 4.3, g['arrow'], (540, 1215), 90)
        if t > 5.15: im = swipe(im, stage2(g, 5.4), seg(t, 5.15, 5.4), -1)
        return im
    if t < 7.0:                                                    # 4: card 2 flips over and becomes the clip
        if t < 6.0: return stage2(g, t, flip=5.45)
        im = camera(stage2(g, t, flip=5.45), SLOTS[1], lerp(4.2, 1, 1 - ease(seg(t, 6.0, 6.4)) ** 0.5)) if t < 6.4 else c['place2'].at(t - 5.45)
        if t > 6.75: im = diagonal(im, stage5(g, t), seg(t, 6.75, 7.0))
        return im
    if t < 8.6: return stage5(g, t) if t < 8.35 else swipe(stage5(g, t), c['close'].at(0), seg(t, 8.35, 8.6))
    if t < 10.2:                                                   # 6: the finished one, close
        im = c['close'].at(t - 8.6); doodle_on(im, t, 8.8, g['burst'], (540, 1380), 0); P.say(im, g['fresh'], t, 8.85, (540, 1380), -2)
        if t > 9.95: im = swipe(im, c['cta'].at(0), seg(t, 9.95, 10.2), -1)
        return im
    im = c['cta'].at(t - 10.2)                                       # 7: CTA
    P.say(im, g['comment'], t, 10.3, (540, 1000), -3); P.say(im, g['kw'], t, 10.55, (540, 1220), 2); P.say(im, g['name'], t, 10.75, (540, 1360), -2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 12.5 + sum(h for _, h in HOLDS); render('17', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
