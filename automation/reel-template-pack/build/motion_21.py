"""#21 Small batch, motion test (2026-10-18). Built the #04-#13 round 3 way (play_extra: locked type, palette,
reading-time holds). World: the bakery table: a real silver wire cooling rack laid over the footage like a grid,
real kraft hang tags that count the batch out (the REAL count only: no fake "almost gone"), on a butter gingham cloth.
Palette: butter + ink. Tech: a phone standing on the cloth (whole screen = one video slot) for the "one picked up".
Story (5 beats): hook "this week's batch: [24] [sets]" / problem: made in small batches, not a factory / product: the
batch, one up close / proof: [one detail about this batch] / CTA: comment [KEYWORD].
Scenes (graphics-only: 2, 5; tech: 4):
 1 0.0  the whole batch from above, seen through the cooling rack; "this week's batch" + [24 dumbbell sets]
 2 1.8  CLOTH, no video: kraft tags drop in a row, numbered 1 2 3 ... then the big tag: [24] made
 3 3.6  the slow pass along the batch in a wide window on the cloth that pans; the rack slides off to the side
 4 5.2  one picked up, on a phone standing on the cloth; [each one checked by hand] + one arrow up
 5 6.8  CLOTH, no video: a big kraft tag: "batch no. [07]" and [next batch: Oct 30] with one burst behind the tag
 6 8.4  one being held / packed, full frame; [yours ships Friday] with a single underline
 7 10.0 CTA: Comment / [KEYWORD] / [Product name]
Usage: python build/motion_21.py [seconds ...]  ->  21-small-batch/preview/motion-test.mp4 (or a test sheet)
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

INK, CRM = (24, 23, 22), (246, 241, 232); BUTTER = X.BUTTER                       # her palette: butter (+ ink)
X.use_type(BUTTER, INK); X.enable_holds()
DIR = '21-small-batch'
PHONE = 'Graphite Smartphone With Green Screen-38.png'
HOLDS = [(1.55, 1.0), (3.35, 1.0), (4.95, 0.3), (6.55, 1.0), (8.15, 1.5), (9.75, 1.0), (12.45, 0.4)]

def tag_with(text, w, px, font=None, color=INK):
    t = P.raw_cut('Blank kraft hang tag with twine-116.png', w).copy(); f = S.F(font or X.SERIF, px)
    ImageDraw.Draw(t).multiline_text((t.width / 2, t.height * 0.66), text, font=f, fill=color, anchor='mm', align='center'); return P.die_cut(t, 6)

def setup():
    g = {'c': {'batch': Clip('IMG_1522', 0.0, 4.0), 'pass': Clip('IMG_1522', 0.0, 4.0), 'pick': Clip('IMG_1471', 5.5), 'held': Clip('IMG_1474', 10.0), 'cta': Clip('IMG_1472', 1.0)}}
    gi = ImageOps.grayscale(S.raw('images', 'Red gingham cotton tablecloth texture-6.png'))
    g['cloth'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(gi), (214, 190, 110), BUTTER), (W, H)).convert('RGBA')
    rack = Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Silver wire baking cooling rack-113.png').convert('RGBA').rotate(90, expand=True)
    g['rack'] = C.shadow(S.fith(rack, int(H * 1.12)), (8, 14), 10, 110)
    g['tags'] = [tag_with(str(i + 1), 170, 70) for i in range(6)]
    g['bigtag'] = tag_with('[24]\nmade', 460, 120)
    g['batchtag'] = tag_with('batch no.\n[07]', 520, 96)
    g['week'] = P.caption("this week's batch", 120, INK); g['count'] = X.hl('[24 dumbbell sets]', 64, BUTTER)
    g['small'] = P.caption('small batch', 150, INK)
    g['checked'] = X.hl('[each one checked by hand]', 56, WHITE); g['arrow'] = doodle('arrow', 0, 130, INK)
    g['next'] = X.hl('[next batch: Oct 30]', 60, WHITE); g['burst'] = doodle('burst', 2, 760, INK)
    g['ships'] = X.hl('[yours ships Friday]', 62, BUTTER); g['under'] = doodle('under', 0, 520, WHITE)
    g['comment'] = P.caption('Comment', 190, INK); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['name'] = X.hl('[Product name]', 56, BUTTER)
    return g

def stage2(g, t):
    im = g['cloth'].copy()
    for i, tg in enumerate(g['tags']):
        t0 = 1.9 + i * 0.12; k = back_out(seg(t, t0, t0 + 0.25), 1.6)
        if k > 0: put(im, tg, (130 + i * 165, lerp(-300, 560 + 30 * (i % 2), k)), 1, (-6, 4, -3, 7, -5, 3)[i])
    k = back_out(seg(t, 2.7, 3.0), 1.5)
    if k > 0: put(im, g['bigtag'], (540, lerp(2400, 1180, k)), 1, -4)
    P.say(im, g['small'], t, 2.0, (540, 300), -2)
    return im

def stage3(g, t):
    """The slow pass in a wide window on the cloth, panning; the rack slides away to the right."""
    im = g['cloth'].copy(); ww, wh = 980, 760; v = g['c']['pass'].at(t - 3.6, (ww, int(ww * 16 / 9)))
    pan = ease(seg(t, 3.6, 5.0)); y = int(pan * (v.height - wh)); win = v.crop((0, y, ww, y + wh))
    put(im, X.clip_card(win, ww, wh, 16, -2), (540, 1000))
    put(im, g['rack'], (lerp(540, 1700, ease(seg(t, 3.6, 4.1))), 960), 1, 0)
    return im

def stage5(g, t):
    im = g['cloth'].copy(); doodle_on(im, t, 7.05, g['burst'], (540, 1000), 0)
    put(im, g['batchtag'], (540, lerp(-700, 1000, back_out(seg(t, 6.8, 7.15), 1.4))), 1, 4 * math.sin(t * 2))
    P.say(im, g['next'], t, 7.3, (540, 1560 - 100), -2)
    return im

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the batch through the cooling rack
        im = c['batch'].at(t); put(im, g['rack'], (540, 960), 1, 0)
        P.say(im, g['week'], t, 0.05, (540, 330), -2); P.say(im, g['count'], t, 0.35, (540, 480), 2)
        if t > 1.6: im = swipe(im, stage2(g, t), seg(t, 1.6, 1.8))
        return im
    if t < 3.6:
        im = stage2(g, t)
        if t > 3.4: im = diagonal(im, stage3(g, t), seg(t, 3.4, 3.6))
        return im
    if t < 5.2:
        im = stage3(g, t)
        if t > 5.0: im = swipe(im, stage4(g, t), seg(t, 5.0, 5.2), -1)
        return im
    if t < 6.8:
        im = stage4(g, t)
        if t > 6.6: im = diagonal(im, stage5(g, t), seg(t, 6.6, 6.8))
        return im
    if t < 8.4:
        im = stage5(g, t)
        if t > 8.2: im = swipe(im, c['held'].at(0), seg(t, 8.2, 8.4))
        return im
    if t < 10.0:                                                   # 6: one being held
        im = c['held'].at(t - 8.4); P.say(im, g['ships'], t, 8.55, (540, 1380), -2); doodle_on(im, t, 8.9, g['under'], (540, 1470), -2)
        if t > 9.8: im = swipe(im, c['cta'].at(0), seg(t, 9.8, 10.0), -1)
        return im
    im = c['cta'].at(t - 10.0)                                       # 7: CTA
    P.say(im, g['comment'], t, 10.1, (540, 1000), -3); P.say(im, g['kw'], t, 10.35, (540, 1220), 2); P.say(im, g['name'], t, 10.55, (540, 1360), -2)
    return im

def stage4(g, t):
    """One picked up, playing on a phone standing on the cloth (the whole screen is the video slot)."""
    im = g['cloth'].copy(); k = ease(seg(t, 5.2, 5.5))
    put(im, P.on_screen(PHONE, 480, g['c']['pick'].at(t - 5.2)), (540, lerp(2400, 800, k)), 1, -3)
    P.say(im, g['checked'], t, 5.5, (540, 1460), -2); doodle_on(im, t, 5.8, g['arrow'], (540, 1350), 90)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 12.5 + sum(h for _, h in HOLDS); render('21', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
