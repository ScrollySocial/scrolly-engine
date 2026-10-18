"""#24 Make it last, motion test (2026-10-18). Built the #04-#13 round 3 way (play_extra: locked type, palette,
reading-time holds). World: a note to future you: a real bundle of cream envelopes tied with twine on pink concrete;
the twine comes undone and a real open card holds the one small habit (left panel words, right panel the tip clip).
Tech: the result plays on a real smartwatch standing on the concrete (its whole screen is the video slot): the weekly
reminder. Palette: pink + butter (ink outlines).
Story (5 beats): hook "make your [product] last longer" / problem: it wears out sooner than it should / product: the
care habit, in two parts / proof: the result, still like new / CTA: comment [KEYWORD].
Scenes (graphics-only: 2; tech: 6):
 1 0.0  the product, full frame; "make it" / "last longer" + [your steam mop] with a single underline
 2 1.8  CONCRETE, no video: the tied envelopes drop in; the bundle slides off and the open card slides out:
        "one small habit" written on its left panel
 3 3.4  the camera dives into the card's right panel: tip part 1, full frame; [rinse after each use] + one arrow up
 4 5.0  CONCRETE: the card again; its right panel now plays tip part 2 ([store it upright] on the left panel)
 5 6.6  tip part 2, full frame
 6 8.2  CONCRETE: a smartwatch stands on the concrete playing the result; [every Sunday] + "still like new"
 7 9.8  CTA: the product at its best; Comment / [KEYWORD] / [Product name] with one burst behind the name
Usage: python build/motion_24.py [seconds ...]  ->  24-make-it-last/preview/motion-test.mp4 (or a test sheet)
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

INK, CRM = (24, 23, 22), (246, 241, 232); PINK, BUTTER = X.PINK, X.BUTTER          # her palette: pink + butter
X.use_type(BUTTER, INK); X.enable_holds()
DIR = '24-make-it-last'
WATCH = 'Graphite smartwatch with green display-47.png'
CARD_W = 1000; CARD_C = (540, 1020); PANEL = 0.06            # inner margin of each card panel
HOLDS = [(1.55, 0.9), (3.0, 1.6), (4.75, 1.0), (6.35, 1.0), (8.0, 0.6), (9.55, 1.0), (12.45, 0.4)]   # just before each transition

def setup():
    g = {'c': {'prod': Clip('IMG_1464', 0.5), 'tip1': Clip('IMG_1430', 0.5), 'tip2': Clip('IMG_1432', 0.0), 'result': Clip('IMG_1463', 1.0), 'best': Clip('IMG_1464', 2.0)}}
    cc = ImageOps.grayscale(S.raw('images', 'Light gray concrete mineral texture-4.png'))
    g['bg'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(cc), (196, 128, 160), PINK), (W, H)).convert('RGBA')
    dots = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', 'Hand-painted polka dots on black-15.png')), BUTTER, (226, 200, 118)).convert('RGBA')
    pass                                   # calm stage: no pattern band (her batch-3 note)
    env = S.fitw(S.cut('images', 'Cream envelopes tied with a string bow-21.png', tol=10), 760)
    g['env'] = P.style_object(env, None, None, label=P.sticker('OPEN ME', 40, INK), label_at=(0.3, 0.7), edge=8)
    card = S.card('images', 'Open blank cream thank-you card-37.png', CARD_W); g['card'] = card
    g['hab'] = P.caption('one small habit', 96, INK)
    g['make'] = P.caption('make it', 150, INK); g['last'] = P.caption('last longer', 180, INK); g['prodname'] = X.hl('[your steam mop]', 60, BUTTER)
    g['under'] = doodle('under', 0, 600, BUTTER)
    g['tip1'] = X.hl('[rinse after each use]', 60, WHITE); g['arrow'] = doodle('arrow', 0, 190, WHITE)
    g['tip2'] = X.hl('[store it upright]', 60, BUTTER); g['tip2w'] = X.hl('[store it\nupright]', 52, BUTTER, rot=0)
    g['tip1w'] = X.hl('[rinse after\neach use]', 52, WHITE, rot=0)
    g['sunday'] = X.hl('[every Sunday]', 64, WHITE); g['still'] = P.caption('still like new', 140, INK)
    g['comment'] = P.caption('Comment', 190, INK); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['name'] = X.hl('[Product name]', 56, BUTTER)
    g['burst'] = doodle('burst', 2, 480, INK)
    return g

def card_scene(g, t, t_in, left_words, right_clip, y=None):
    """The open card on the concrete: words on the left panel, a clip in the right panel."""
    im = g['bg'].copy(); k = back_out(seg(t, t_in, t_in + 0.35), 1.3) if t_in is not None else 1
    cy = lerp(2600, CARD_C[1], k) if y is None else y; cd = g['card']; x0, y0 = CARD_C[0] - cd.width / 2, cy - cd.height / 2
    im.alpha_composite(C.shadow(cd, (10, 18), 16, 110), (int(x0) - 16, int(y0) - 16))
    pw, ph = int(cd.width * (0.5 - 2 * PANEL)), int(cd.height * (1 - 2 * PANEL)); rx, ry = int(x0 + cd.width * (0.5 + PANEL)), int(y0 + cd.height * PANEL)
    if right_clip is not None: im.alpha_composite(ImageOps.fit(right_clip, (pw, ph)).convert('RGBA'), (rx, ry))
    if left_words is not None:
        for i, w_ in enumerate(left_words): P.say(im, w_, t, (t_in or 0) + 0.35 + i * 0.2, (x0 + cd.width * 0.25, cy - 40 + i * 140), -2)
    return im, (rx + pw / 2, ry + ph / 2)

def stage2(g, t):
    im, _ = card_scene(g, t, 2.35, [g['tip1w']], g['c']['tip1'].at(max(0, t - 2.35)))
    k = back_out(seg(t, 1.8, 2.1), 1.4); off = ease(seg(t, 2.3, 2.6))
    if off < 1: put(im, g['env'], (540 + 1200 * off, lerp(-500, 1000, k)), 1, -6 + 20 * off)
    P.say(im, g['hab'], t, 2.6, (540, 330), -2)
    return im

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the product; make it last longer
        im = c['prod'].at(t); P.say(im, g['make'], t, 0.05, (540, 300), -3); P.say(im, g['last'], t, 0.3, (540, 500), -2)
        doodle_on(im, t, 0.7, g['under'], (540, 640), -2); P.say(im, g['prodname'], t, 0.6, (540, 1420), 2)
        if t > 1.6: im = swipe(im, stage2(g, t), seg(t, 1.6, 1.8))
        return im
    if t < 3.4:                                                    # 2: the envelopes; the card slides out
        im = stage2(g, t)
        if t > 3.05:
            im2, rc = card_scene(g, t, None, [g['tip1w']], c['tip1'].at(t - 2.35)); im = camera(im2, rc, lerp(1, 3.0, ease(seg(t, 3.05, 3.4)) ** 2))
        return im
    if t < 5.0:                                                    # 3: tip part 1
        im = camera(c['tip1'].at(t - 3.4), (540, 960), lerp(1.3, 1, ease(seg(t, 3.4, 3.7))))
        P.say(im, g['tip1'], t, 3.6, (540, 1380), -2); doodle_on(im, t, 3.9, g['arrow'], (540, 1215), 90)
        if t > 4.8: im = swipe(im, card_scene(g, 5.6, None, [g['tip1w'], g['tip2w']], c['tip2'].at(0))[0], seg(t, 4.8, 5.0), -1)
        return im
    if t < 6.6:                                                    # 4: the card: tip 2 in its right panel
        im, rc = card_scene(g, t, None, [g['tip1w'], g['tip2w']], c['tip2'].at(t - 5.0))
        if t < 5.3: pass
        if t > 6.4: im = camera(im, rc, lerp(1, 3.0, ease(seg(t, 6.4, 6.6)) ** 2))
        return im
    if t < 8.2:                                                    # 5: tip part 2, full frame
        im = camera(c['tip2'].at(t - 5.0), (540, 960), lerp(1.3, 1, ease(seg(t, 6.6, 6.9)))); P.say(im, g['tip2'], t, 6.8, (540, 1380), 2)
        if t > 8.05: im = diagonal(im, stage6(g, t), seg(t, 8.05, 8.2))
        return im
    if t < 9.8:
        im = stage6(g, t)
        if t > 9.6: im = swipe(im, c['best'].at(0), seg(t, 9.6, 9.8), -1)
        return im
    im = c['best'].at(t - 9.8)                                       # 7: CTA
    doodle_on(im, t, 10.3, g['burst'], (540, 1380), 0)
    P.say(im, g['comment'], t, 9.9, (540, 1000), -3); P.say(im, g['kw'], t, 10.15, (540, 1220), 2); P.say(im, g['name'], t, 10.35, (540, 1380), -2)
    return im

def stage6(g, t):
    """The smartwatch stands on the concrete; its whole screen is the result clip: the weekly reminder."""
    im = g['bg'].copy(); k = back_out(seg(t, 8.2, 8.5), 1.3)
    put(im, P.on_screen(WATCH, 560, g['c']['result'].at(t - 8.2)), (540, lerp(2400, 1050, k)), 1, -4)
    P.say(im, g['still'], t, 8.45, (540, 330), -3); P.say(im, g['sunday'], t, 8.7, (540, 1600 - 140), 2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 12.5 + sum(h for _, h in HOLDS); render('24', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
