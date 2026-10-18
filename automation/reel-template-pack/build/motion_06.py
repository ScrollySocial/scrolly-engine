"""#06 Start to finish, motion test round 2 (2026-10-18). Her notes on round 1: the checklist read like a tutorial and
wrote in too fast to read; measuring spoons + twine made no sense together and no buyer could tell what they'd be for
their business. Round 2 is a "watch it get made" Reel any maker can use: the only props are the buyer's own clips, a
loading bar that fills from 0% to 100% across the whole Reel (the carried element), and a real hourglass (time, which
every maker spends). Built the #09/#10/#12 round 3 way (story5.py). Accent buyers change: muted ochre. Home bases: the
buyer's making clips + the workbench (worn wood).

Story (5 beats): hook: fast cuts of the whole make under "start to finish" / problem: a photo hides the hours in one
[product] / product: every stage of the make / proof: 100%, the finished one / CTA: comment [KEYWORD].
Scenes (15 s; graphics-only: 4, 7; tech: 9, a phone standing on the bench, no hand):
 1 0.0  fast cuts (4 clips in 2 s) under "making one [product]" / "start to finish"; the loading bar appears at 0%
 2 2.0  BENCH: the raw materials as a photo card; the hourglass lands, full on top; "it starts as" + [a pile of fruit]
 3 3.6  stage 1 full frame; the bar fills to 25%; [stage one] pill; arrow AT the work
 4 5.2  BENCH, no video: the hourglass flips and runs; a sticky note [20 minutes later]
 5 6.6  stage 2 full frame, sped up (>> 2x sticker); bar 50%
 6 8.2  stage 3 in an arch window on the bench growing to full frame; bar 75%
 7 9.8  BENCH, no video: the bar alone, big, fills 75 to 100%; "almost..."; a tick at 100%; the camera dives in
 8 11.2 the finished one, full frame; "finished." with one burst behind it
 9 13.0 CTA: a phone stands on the bench, the shop scrolls and stops on it; Comment / [KEYWORD] / [made by hand in]
Usage: python build/motion_06.py [seconds ...]  ->  06-start-to-finish/preview/motion-test.mp4 (or a test sheet)
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

INK, CRM = (28, 27, 26), (246, 241, 232); OCHRE = X.WINE; LIGHT = X.BUTTER   # her palette: wine + butter (buyers change them)
X.use_type(LIGHT, OCHRE); X.enable_holds()
HOLDS = [(1.7, 0.35), (3.3, 1.35), (4.9, 0.6), (6.3, 1.25), (7.9, 0.65), (9.5, 0.6), (10.75, 0.75), (14.9, 0.6)]   # reading time
PHONE = 'Graphite Smartphone With Green Screen-38.png'
DIR = '06-start-to-finish'
BAR_Y = 300                                                             # just under Instagram's top bar

def bar(p, w=760, h=84):
    """The loading bar: a cream track with an ink edge, ochre fill, the percent in the track."""
    im = Image.new('RGBA', (w + 16, h + 16), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((8, 8, w + 8, h + 8), h // 2, fill=LIGHT + (255,), outline=INK + (255,), width=6)
    fw = max(h, (w - 12) * p) if p > 0.01 else 0
    if fw: d.rounded_rectangle((14, 14, 14 + fw, h + 2), (h - 12) // 2, fill=OCHRE + (255,))
    d.text((w / 2 + 8, h / 2 + 8), f'{int(round(p * 100))}%', font=S.F(P.MONT, int(h * 0.55)), fill=INK, anchor='mm', stroke_width=3, stroke_fill=CRM)
    return C.shadow(im, (4, 8), 8, 90)

def progress(t):
    """Bar fill over the Reel: 0 -> 25 -> 50 -> 75 -> 100, each step filling as its stage starts."""
    p = 0.0
    for t0, v in ((3.7, 0.25), (6.7, 0.5), (8.3, 0.75), (10.1, 1.0)): p = lerp(p, v, ease(seg(t, t0, t0 + (0.5 if v < 1 else 0.7))))
    return p

def setup():
    g = {'c': {'raw': Clip('IMG_1393', 0.5), 's1': Clip('IMG_1387', 1.5), 's2': Clip('IMG_1389', 2.5), 's3': Clip('IMG_1390', 2.0),
               'done': Clip('IMG_1391', 0.0, 1.5), 'done2': Clip('IMG_1394', 1.0)}}
    g['bench'] = ImageOps.fit(S.raw('images', 'Warm worn workshop wood texture-15.png'), (W, H)).convert('RGBA')
    g['glass'] = P.thing('Classic wooden hourglass with flowing sand-238.png', 420, 'smalldots', OCHRE, scale=0.3, strength=0.6)
    g['making'] = P.pill_m('making one [smoothie]', 58, INK, CRM); g['start'] = P.caption('start to', 170, OCHRE); g['finish'] = P.caption('finish', 230, INK)
    g['starts'] = P.caption('it starts as', 140, INK); g['pile'] = P.pill_m('[a pile of fruit]', 58, INK, CRM)
    g['sp'] = [P.pill_m(t, 56, INK, CRM) for t in ('[stage one: prep]', '[stage two: mix]', '[stage three: blend]')]
    g['later'] = P.sticky('[20 minutes\nlater]', 440, pin='pin-head-black'); g['speed'] = P.sticker('>> 2x', 70, INK, WHITE)
    g['almost'] = P.caption('almost...', 160, INK); g['fin'] = P.caption('finished.', 190, OCHRE)
    g['comment'] = P.caption('Comment', 180, OCHRE, 'stripes'); g['kw'] = P.pill_m('"[KEYWORD]"', 64, CRM, INK); g['town'] = P.pill_m('[handmade in Austin]', 50, INK, CRM)
    g['d_under'] = doodle('under', 0, 600, OCHRE); g['d_arrow'] = doodle('arrow', 9, 250, WHITE); g['d_burst'] = doodle('burst', 2, 1250, OCHRE)
    g['d_tick'] = doodle('tick', 0, 240, INK)
    sw, sh = P.screen_size(PHONE, 640); g['sw'], g['sh'] = sw, sh
    g['feed'] = P.feed([(S.footage(cl), nm, pr) for cl, nm, pr in ((('IMG_1388', 2.0), '[Product 1]', '[$8]'), (('IMG_1395', 0.5), '[Product 2]', '[$9]'),
                         (('IMG_1390', 8.0), '[Product 3]', '[$8]'), (('IMG_1391', 0.5), '[THE ONE]', '[$9]'))], w=sw, accent=OCHRE)
    return g

def with_bar(im, t, k=1.0):
    put(im, bar(progress(t)), (540, BAR_Y), k); return im

def bench2(g, t):
    c = g['c']; im = g['bench'].copy()
    put(im, X.clip_card(c['raw'].at(t - 2.0, (560, 700)), 560, 700, 16, -4), (440, 1000), back_out(seg(t, 2.0, 2.3), 1.4))
    k = back_out(seg(t, 2.3, 2.6), 1.5)
    if k > 0: put(im, g['glass'], (840, lerp(-400, 1260, k)), 1, 6)
    P.say(im, g['starts'], t, 2.2, (540, 470), -3); P.say(im, g['pile'], t, 2.5, (440, 1430), 2)
    return with_bar(im, t)

def bench4(g, t):
    im = g['bench'].copy(); fl = ease(seg(t, 5.4, 5.8)); put(im, g['glass'], (540, 1000), 1.3, 180 * fl)
    P.say(im, g['later'], t, 5.7, (770, 660), 6)
    return with_bar(im, t)

def bench7(g, t):
    im = g['bench'].copy(); k = ease(seg(t, 9.8, 10.1)); y = lerp(BAR_Y, 960, k); s = lerp(1, 1.35, k)
    put(im, bar(progress(t)), (540, y), s); P.say(im, g['almost'], t, 10.0, (540, 700), -3)
    for i, (cl, x, r) in enumerate(((g['c']['s1'], 230, -7), (g['c']['s2'], 520, 4), (g['c']['s3'], 810, -3))):    # every stage, as photos
        put(im, X.clip_card(cl.at(1.0, (250, 320)), 250, 320, 12, r), (x, 1330), back_out(seg(t, 9.9 + i * 0.12, 10.2 + i * 0.12), 1.5))
    if t > 10.8: doodle_on(im, t, 10.8, g['d_tick'], (900, 820), 0)
    if t > 10.95: im = camera(im, (540, 960), lerp(1, 5, ease(seg(t, 10.95, 11.2)) ** 2))
    return im

def frame(g, t):
    c = g['c']
    if t < 2.0:                                                    # 1: fast cuts under the hook; the bar at 0%
        cl = (c['raw'], c['s1'], c['s3'], c['done2'])[min(3, int(t / 0.5))]; im = cl.at(t % 0.5 + 0.3)
        with_bar(im, t, back_out(seg(t, 1.0, 1.3)))
        P.say(im, g['making'], t, 0.05, (540, 480), -2); P.say(im, g['start'], t, 0.3, (520, 840), -3); P.say(im, g['finish'], t, 0.55, (560, 1040), -2)
        doodle_on(im, t, 0.9, g['d_under'], (560, 1170), -2)
        if t > 1.75: im = swipe(im, bench2(g, t), seg(t, 1.75, 2.0))
        return im
    if t < 3.6:
        im = bench2(g, t)
        if t > 3.35: im = diagonal(im, with_bar(c['s1'].at(t - 3.35), t), seg(t, 3.35, 3.6))
        return im
    if t < 5.2:                                                    # 3: stage 1; bar 25%
        im = with_bar(c['s1'].at(t - 3.35), t); P.say(im, g['sp'][0], t, 3.7, (540, 1380), -2); doodle_on(im, t, 4.0, g['d_arrow'], (300, 1080), -40)
        if t > 4.95: im = swipe(im, bench4(g, t), seg(t, 4.95, 5.2), -1)
        return im
    if t < 6.6:                                                    # 4: the hourglass flips; 20 minutes later
        im = bench4(g, t)
        if t > 6.35: im = swipe(im, with_bar(c['s2'].at(0), t), seg(t, 6.35, 6.6))
        return im
    if t < 8.2:                                                    # 5: stage 2, sped up; bar 50%
        im = with_bar(c['s2'].at((t - 6.6) * 2), t); P.say(im, g['sp'][1], t, 6.75, (540, 1380), 2); P.say(im, g['speed'], t, 7.0, (800, 620), 8)
        if t > 7.95: im = diagonal(im, stage6(g, t), seg(t, 7.95, 8.2))
        return im
    if t < 9.8:
        im = stage6(g, t)
        if t > 9.55: im = swipe(im, bench7(g, t), seg(t, 9.55, 9.8), -1)
        return im
    if t < 11.2: return bench7(g, t)                                # 7: the bar fills to 100%; dive in
    if t < 13.0:                                                   # 8: finished, one burst behind the word
        im = camera(c['done'].at(t - 11.2), (540, 960), lerp(1.4, 1, ease(seg(t, 11.2, 11.5)))) if t < 11.9 else c['done2'].at(t - 11.9)
        P.say(im, g['fin'], t, 11.4, (540, 700), -3)
        return im
    im = g['bench'].copy()      # 9: CTA, the phone stands on the bench (no hand); its whole screen is one video slot (the buyer's shop scroll)
    put(im, P.on_screen(PHONE, 640, c['done2'].at(t - 13.0)), (560, lerp(2300, 1340, ease(seg(t, 13.0, 13.3)))), 1, -3)
    P.say(im, g['comment'], t, 13.3, (520, 330), -3); P.say(im, g['kw'], t, 13.55, (520, 480), 2); P.say(im, g['town'], t, 13.75, (520, 600), -2)
    return im

def stage6(g, t):
    """6: stage 3 in an arch window on the bench, growing to full frame; bar 75%."""
    c = g['c']; u = ease(seg(t, 8.8, 9.4)); im = g['bench'].copy(); aw, ah = int(lerp(600, W, u)), int(lerp(940, H, u))
    v = c['s3'].at(t - 8.2, (aw, ah)); m = Image.new('L', (aw, ah), 0); r = int(aw / 2 * (1 - u))
    ImageDraw.Draw(m).rectangle((0, r, aw, ah), fill=255)
    if r > 2: ImageDraw.Draw(m).pieslice((0, 0, aw - 1, 2 * r), 180, 360, fill=255)
    v.putalpha(m); put(im, v if u > 0.98 else C.shadow(v, (8, 14), 14, 100), (540, lerp(1050, 960, u)))
    P.say(im, g['sp'][2], t, 8.3, (540, 1380), -2)
    return with_bar(im, t)

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render('06', X.with_holds(fr, HOLDS), 15.0 + sum(h for _, h in HOLDS), out); X.strip_sheet(DIR, 22)

if __name__ == '__main__':
    main()
