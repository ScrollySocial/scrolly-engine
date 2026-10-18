"""#07 How big is it really? Fresh take (2026-10-18; the banana / ruler-split / giant-mug version was rejected).
Built the #09/#10/#12 round 3 way (story5.py). World: a measuring grid (white pegboard) with a torn strip of her
checks down one side; real everyday things you own arrive as size references (a phone, a mug), her double-headed
marker arrows measure the product, one accent buyers change: forest green.
Home bases: the buyer's clips + the grid stage (a new setup each visit).

Story (5 beats): hook: "how big is it really?" while the product window keeps changing size / problem: photos lie
about size / product: in my hand, next to a phone, in use / proof: the exact size, measured / CTA: comment [SIZE].
Scenes (12 s; graphics-only: 2, 6; tech: 4):
 1 0.0  the product clip in a window that jumps size (small, huge, medium) under "how big" / "is it really?"
 2 1.7  GRID, no video: "next to things you own": a phone and a mug drop onto the grid, each with its size pill
 3 3.1  in my hand, full frame; double-headed arrows measure it (width, height); pill [fits in one hand]
 4 4.6  GRID, tech: on the left the phone shows the shop photo ("on screen"), on the right the real clip
        ("in real life") at the same height; marker arrow between them
 5 6.1  in use, full frame; the arrows carried in; pill [the size of a water bottle]
 6 7.6  GRID, no video: the product still on the grid, the ruler slides under it, the size stamps in: [9 x 4 in]
 7 9.0  the camera dives into the still: the set clip full frame; the size carried as a pill
 8 10.2 CTA: Comment / "[SIZE]" / [exact size + where to buy]
Usage: python build/motion_07.py [seconds ...]  ->  07-how-big-is-it/preview/motion-test.mp4 (or a test sheet)
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
from motion_b2 import Clip, put, render, camera, torn_band, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (28, 27, 26), (246, 241, 232); FOREST = (58, 90, 68)          # FOREST = the accent buyers change
PHONE = 'Graphite Smartphone With Green Screen-38.png'
DIR = '07-how-big-is-it'

def setup():
    g = {'c': {'alone': Clip('IMG_1471', 0.5), 'hand': Clip('IMG_1471', 6.0), 'use': Clip('IMG_1474', 2.0), 'set': Clip('IMG_1522', 0.0, 4.0)}}
    grid = ImageOps.fit(S.raw('images', 'White pegboard grid texture-5.png'), (W, H)).convert('RGBA')
    checks = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', 'Wobbly hand-drawn black and white checkerboard-24.png')), FOREST, CRM).convert('RGBA')
    grid.alpha_composite(torn_band(checks, (240, H + 40), 9, 'l', 18), (W - 190, -20)); g['grid'] = grid
    g['phone_b'] = P.thing('Graphite smartphone back view-41.png', 300, 'smalldots', FOREST, scale=0.25, strength=0.5)
    g['mug'] = P.thing('Warm white ceramic coffee mug-140.png', 360, 'stripes', FOREST, scale=0.35, strength=0.7)
    g['ruler'] = P.thing('Pale wooden ruler on white-153.png', 900, None, None, label=P.sticker('INCHES', 34, INK), label_at=(0.82, 0.5))
    still = S.footage(('IMG_1471', 0.5)); g['still'] = X.clip_card(still.crop((0, 500, W, 1500)), 620, 574, 14)
    g['shopshot'] = P.on_screen(PHONE, 340, P.feed([(still, '[Product]', '[$59]')], w=P.screen_size(PHONE, 340)[0], accent=FOREST)[0].crop((0, 0) + P.screen_size(PHONE, 340)))
    g['howbig'] = P.caption('how big', 200, FOREST); g['really'] = P.caption('is it really?', 130, INK)
    g['sizes'] = [P.pill_m(t, 54, INK, CRM) for t in ('this big?', 'this big?', 'this big?')]
    g['next'] = P.caption('next to', 150, FOREST); g['own'] = P.pill_m('things you own', 56, INK, CRM)
    g['phone_p'] = P.pill_m('[6 in phone]', 44, CRM, INK); g['mug_p'] = P.pill_m('[mug]', 44, CRM, INK)
    g['inhand'] = P.caption('in my hand', 125, FOREST); g['fits'] = P.pill_m('[fits in one hand]', 56, INK, CRM)
    g['onscreen'] = P.pill_m('on screen', 50, INK, CRM); g['irl'] = P.pill_m('in real life', 50, FOREST, CRM)
    g['inuse'] = P.pill_m('[the size of a water bottle]', 52, INK, CRM)
    g['exact'] = P.caption('exactly', 170, FOREST); g['dims'] = P.big_text('[9 x 4 in]', 150, FOREST)
    g['dims_s'] = P.pill_m('[9 x 4 in]', 60, FOREST, CRM)
    g['comment'] = P.caption('Comment', 180, FOREST, 'stripes'); g['kw'] = P.pill_m('"[SIZE]"', 64, CRM, INK); g['buy'] = P.pill_m('[for every size + the shop link]', 44, INK, CRM)
    g['mw'] = doodle('arrow', 5, 560, WHITE); g['mh'] = doodle('arrow', 6, 150, WHITE); g['mwI'] = doodle('arrow', 5, 520, INK)
    g['curve'] = doodle('arrow', 2, 230, INK); g['under'] = doodle('under', 4, 560, FOREST)
    return g

def window(img, clip_im, w, h, c, rot=0):
    put(img, X.clip_card(clip_im, int(w), int(h), 14), c, 1, rot)

def frame(g, t):
    c = g['c']
    if t < 1.7:                                                    # 1: the window jumps size: this big? this big?
        im = g['grid'].copy(); sizes = [(300, 420), (860, 1150), (520, 720)]; i = min(2, int(t / 0.45)); prev = sizes[max(0, i - 1)]
        k = back_out(seg(t, i * 0.45, i * 0.45 + 0.25), 1.6); w, h = lerp2(prev, sizes[i], k) if i else sizes[0]
        window(im, c['alone'].at(t, (max(40, w), max(40, h))), max(40, w), max(40, h), (520, 980), (-3, 2, -2)[i])
        P.say(im, g['sizes'][i], t, i * 0.45 + 0.1, (820, 560 + i * 140), (6, -5, 4)[i], out=(i + 1) * 0.45 if i < 2 else 1.45)
        P.say(im, g['howbig'], t, 0.0, (500, 330), -3); P.say(im, g['really'], t, 0.3, (520, 1440), 2)
        if t > 1.45: im = swipe(im, stage2(g, t), seg(t, 1.45, 1.7))
        return im
    if t < 3.1:
        im = stage2(g, t)
        if t > 2.85: im = diagonal(im, c['hand'].at(t - 2.85), seg(t, 2.85, 3.1))
        return im
    if t < 4.6:                                                    # 3: in my hand, measured
        im = c['hand'].at(t - 2.85); P.say(im, g['inhand'], t, 3.2, (520, 330), -3)
        doodle_on(im, t, 3.5, g['mw'], (520, 1160), 0); doodle_on(im, t, 3.7, g['mh'], (150, 1030), 0)
        P.say(im, g['fits'], t, 3.9, (520, 1360), -2)
        if t > 4.35: im = X.slice_h(im, stage4(g, t), seg(t, 4.35, 4.6), (FOREST, INK))
        return im
    if t < 6.1:
        im = stage4(g, t)
        if t > 5.85: im = swipe(im, c['use'].at(t - 5.85), seg(t, 5.85, 6.1))
        return im
    if t < 7.6:                                                    # 5: in use; the measuring arrows carried in
        im = c['use'].at(t - 5.85); doodle_on(im, t, 6.2, g['mh'], (460, 1150), 0); P.say(im, g['inuse'], t, 6.4, (520, 380), -2)
        if t > 7.35: im = X.slice_v(im, stage6(g, t), seg(t, 7.35, 7.6), (INK, FOREST))
        return im
    if t < 9.0: return stage6(g, t)
    if t < 10.2:                                                   # 7: the set, the size carried
        im = camera(c['set'].at(t - 9.0), (540, 960), lerp(1.5, 1, ease(seg(t, 9.0, 9.4))))
        put(im, g['dims_s'], (540, 380), back_out(seg(t, 9.1, 9.4)), -3); doodle_on(im, t, 9.4, g['mwI'], (540, 1300), 0)
        return im
    im = c['set'].at(t - 9.0); put(im, g['dims_s'], (540, 380), 1, -3)          # 8: CTA
    P.say(im, g['comment'], t, 10.3, (520, 1060), -3); P.say(im, g['kw'], t, 10.55, (520, 1220), 2); P.say(im, g['buy'], t, 10.75, (500, 1340), -2)
    return im

def stage2(g, t):
    im = g['grid'].copy(); P.say(im, g['next'], t, 1.75, (480, 330), -3); P.say(im, g['own'], t, 1.95, (480, 470), 2)
    for obj, pl, xy, t0, r in ((g['phone_b'], g['phone_p'], (300, 1000), 2.1, -6), (g['mug'], g['mug_p'], (720, 1050), 2.35, 5)):
        k = back_out(seg(t, t0, t0 + 0.3), 1.5)
        if k > 0: put(im, obj, (xy[0], lerp(-400, xy[1], k)), 1, r)
        P.say(im, pl, t, t0 + 0.3, (xy[0], xy[1] + 300), r / 2)
    return im

def stage4(g, t):
    """On screen (the shop photo on a phone) vs in real life (the clip at the same height)."""
    c = g['c']; im = g['grid'].copy(); k = back_out(seg(t, 4.6, 4.9), 1.5)
    put(im, g['shopshot'], (270, lerp(2400, 960, k)), 1, -3)
    k2 = back_out(seg(t, 4.75, 5.05), 1.5)
    if k2 > 0: window(im, c['alone'].at(t - 4.6, (380, 680)), 380, 680, (lerp(1500, 740, k2), 960), 3)
    P.say(im, g['onscreen'], t, 5.0, (270, 1420), -3); P.say(im, g['irl'], t, 5.15, (720, 1420), 3)
    doodle_on(im, t, 5.35, g['curve'], (500, 620), 0)
    return im

def stage6(g, t):
    """The still on the grid; the ruler slides under it; the size stamps in; the camera dives into the still."""
    im = g['grid'].copy(); put(im, g['still'], (540, 900), back_out(seg(t, 7.6, 7.9), 1.4), -2)
    put(im, g['ruler'], (lerp(-600, 520, ease(seg(t, 7.8, 8.2))), 1290), 1, 0)
    P.say(im, g['exact'], t, 7.9, (480, 330), -3); put(im, g['dims'], (520, 1450), back_out(seg(t, 8.3, 8.5), 2.2) if t >= 8.3 else 0, -4)
    doodle_on(im, t, 8.2, g['mwI'], (540, 560), 0)
    if t > 8.65: im = camera(im, (540, 900), lerp(1, 2.2, ease(seg(t, 8.65, 9.0)) ** 2))
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render('07', fr, 12.0, out); X.strip_sheet(DIR, 12)

if __name__ == '__main__':
    main()
