"""#25 Mine vs. the usual kind, motion test (2026-10-18). Built the #04-#13 round 3 way (play_extra: locked type,
palette, reading-time holds). World: three rounds: a real brass boxing-ring bell rings in each round on a butter
kraft poster; every round is a split screen (the usual kind | yours) with the one real difference written under it; a
real gold trophy for yours at the end. Fair play (pack rule): compare with a generic one you own, never name or mock a
brand, only real differences: so no X on the usual kind, just the difference and a tick on yours.
Palette: wine + butter. No tech moment. Uses the two-tone strip slice once (its 5th and last use in the pack).
Story (5 beats): hook "mine vs. the usual kind" / problem: they look the same on a shelf / product: round 1, 2, 3 /
proof: and the winner is... / CTA: comment [KEYWORD].
Scenes (graphics-only: 2, 4, 7):
 1 0.0  split screen: the usual kind | mine, the bell between them; "mine vs." / "the usual kind" + labels
 2 1.8  POSTER, no video: the bell rings; "round 1" + [difference one]
 3 3.2  round 1: split screen (diagonal); [no bucket of dirty water]; a tick on yours
 4 4.8  POSTER: the bell rings again; "round 2"; two-tone strip slice into round 2
 5 6.2  round 2: split top / bottom; [steam, no chemicals]; a tick on yours
 6 7.8  round 3: yours full frame, the usual kind small in a round window; [dries in seconds]
 7 9.4  POSTER, no video: "and the winner is" + the gold trophy with a [mine] sticker; one burst behind the trophy
 8 11.0 CTA: yours in use; Comment / [KEYWORD] / [Product name]
Usage: python build/motion_25.py [seconds ...]  ->  25-mine-vs-the-usual-kind/preview/motion-test.mp4 (or a test sheet)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
import play_extra as X
from story4 import swipe, diagonal, roundwin
from collage_kit import doodle, doodle_on
from motion_b2 import Clip, put, render, camera, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (24, 23, 22), (246, 241, 232); WINE, BUTTER = X.WINE, X.BUTTER          # her palette: wine + butter
X.use_type(BUTTER, WINE); X.enable_holds()
DIR = '25-mine-vs-the-usual-kind'
HOLDS = [(1.55, 0.8), (3.0, 1.8), (4.55, 0.9), (5.95, 0.7), (7.55, 0.8), (9.15, 0.8), (10.75, 1.3), (13.45, 0.4)]   # just before each transition

def setup():
    g = {'c': {'usual': Clip('IMG_1460', 0.5), 'mine': Clip('IMG_1418', 2.0), 'u1': Clip('IMG_1462', 0.5), 'm1': Clip('IMG_1423', 2.0),
               'u2': Clip('IMG_1460', 3.0), 'm2': Clip('IMG_1418', 6.0), 'm3': Clip('IMG_1463', 0.5), 'cta': Clip('IMG_1423', 5.0)}}
    kp = ImageOps.grayscale(S.raw('images', 'Partly unrolled brown kraft paper-149.png')); w_, h_ = kp.size
    g['poster'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(kp.crop((int(w_ * 0.25), int(h_ * 0.3), int(w_ * 0.75), int(h_ * 0.7)))), (176, 146, 70), BUTTER), (W, H)).convert('RGBA')
    ck = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', 'Wobbly hand-drawn black and white checkerboard-24.png')), WINE, BUTTER).convert('RGBA')
    from motion_b2 import torn_band; g['poster'].alpha_composite(torn_band(ck, (W + 40, 300), 4, 'tb', 18), (-20, 1600))   # collage: a torn band of her checks
    g['bell'] = P.thing('Classic brass boxing ring bell-89.png', 420, 'stripes', WINE, scale=0.3, strength=0.45)
    g['bell_s'] = S.fitw(g['bell'], 260)
    g['trophy'] = P.thing('Plain gold trophy on black base-223.png', 520, None, None, label=P.sticker('[MINE]', 54, WINE), label_at=(0.5, 0.4))
    g['rings'] = doodle('burst', 2, 700, WINE); g['tbg'] = doodle('burst', 2, 900, WINE)
    g['mine'] = P.caption('mine vs.', 170, WINE); g['usual'] = P.caption('the usual kind', 120, INK); g['under'] = doodle('under', 0, 600, WINE)
    g['lu'] = X.hl('[the usual kind]', 52, WHITE); g['lm'] = X.hl('[mine]', 56, BUTTER)
    g['round'] = [P.caption(f'round {n}', 200, INK) for n in (1, 2, 3)]
    g['diff'] = [X.hl(t, 58, (BUTTER, WHITE, BUTTER)[i]) for i, t in enumerate(('[no bucket of dirty water]', '[steam, no chemicals]', '[dries in seconds]'))]
    g['tick'] = doodle('tick', 0, 160, BUTTER)
    g['winner'] = P.caption('and the winner is', 110, INK)
    g['comment'] = P.caption('Comment', 190, WINE); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['name'] = X.hl('[Product name]', 56, BUTTER)
    return g

def ring(im, g, t, t0, c, big=True):
    """The bell rings: it shakes and one burst of ring-lines pulses behind it."""
    if t < t0: return
    k = back_out(seg(t, t0, t0 + 0.3), 1.6); sh = 9 * math.sin(t * 60) * (1 - seg(t, t0 + 0.3, t0 + 0.9))
    if t > t0 + 0.2: doodle_on(im, t, t0 + 0.2, g['rings'], c, 0)
    put(im, g['bell'] if big else g['bell_s'], (c[0] + sh, c[1]), k, sh)

def poster(g, t, t0, n, diff=None):
    im = g['poster'].copy(); ring(im, g, t, t0, (540, 820))
    P.say(im, g['round'][n], t, t0 + 0.25, (540, 1260), -3)
    if diff is not None: P.say(im, g['diff'][diff], t, t0 + 0.5, (540, 1440), 2)
    return im

def split_v(a, b, label=True, g=None, t=0, t0=0):
    im = Image.new('RGBA', (W, H)); im.alpha_composite(ImageOps.fit(a, (W // 2 - 6, H)).convert('RGBA'), (0, 0))
    im.alpha_composite(ImageOps.fit(b, (W // 2 - 6, H)).convert('RGBA'), (W // 2 + 6, 0)); ImageDraw.Draw(im).rectangle((W // 2 - 6, 0, W // 2 + 6, H), fill=BUTTER + (255,))
    return im

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the usual | mine, the bell between them
        im = split_v(c['usual'].at(t), c['mine'].at(t)); ring(im, g, t, 0.0, (540, 960), big=False)
        P.say(im, g['mine'], t, 0.1, (540, 330), -3); P.say(im, g['usual'], t, 0.35, (540, 480), 2); doodle_on(im, t, 0.7, g['under'], (540, 570), -2)
        P.say(im, g['lu'], t, 0.6, (270, 1380), -3); P.say(im, g['lm'], t, 0.7, (810, 1380), 3)
        if t > 1.6: im = swipe(im, poster(g, t, 1.8, 0, 0), seg(t, 1.6, 1.8))
        return im
    if t < 3.2:
        im = poster(g, t, 1.8, 0, 0)
        if t > 3.05: im = diagonal(im, round1(g, t), seg(t, 3.05, 3.2))
        return im
    if t < 4.8:
        im = round1(g, t)
        if t > 4.6: im = swipe(im, poster(g, t, 4.8, 1), seg(t, 4.6, 4.8), -1)
        return im
    if t < 6.2:                                                    # 4: round 2 on the poster; strip slice into it
        im = poster(g, t, 4.8, 1)
        if t > 6.0: im = X.slice_h(im, round2(g, t), seg(t, 6.0, 6.2), (WINE, BUTTER))
        return im
    if t < 7.8:
        im = round2(g, t)
        if t > 7.6: im = diagonal(im, round3(g, t), seg(t, 7.6, 7.8))
        return im
    if t < 9.4:
        im = round3(g, t)
        if t > 9.2: im = swipe(im, stage7(g, t), seg(t, 9.2, 9.4), -1)
        return im
    if t < 11.0:
        im = stage7(g, t)
        if t > 10.8: im = swipe(im, c['cta'].at(0), seg(t, 10.8, 11.0))
        return im
    im = c['cta'].at(t - 11.0)                                       # 8: CTA
    P.say(im, g['comment'], t, 11.1, (540, 1000), -3); P.say(im, g['kw'], t, 11.35, (540, 1220), 2); P.say(im, g['name'], t, 11.55, (540, 1360), -2)
    return im

def round1(g, t):
    """Round 1: a diagonal split, the usual kind above, yours below."""
    c = g['c']; im = c['m1'].at(t - 3.2).copy(); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W, 0), (W, 760), (0, 1160)], fill=255)
    im.paste(c['u1'].at(t - 3.2), (0, 0), m); ImageDraw.Draw(im).line([(0, 1160), (W, 760)], fill=BUTTER + (255,), width=14)
    P.say(im, g['lu'], t, 3.3, (300, 400), -3); P.say(im, g['lm'], t, 3.35, (800, 1150), 3)
    P.say(im, g['diff'][0], t, 3.5, (540, 1400), -2); doodle_on(im, t, 3.8, g['tick'], (930, 1060), 0)
    return im

def round2(g, t):
    """Round 2: split top / bottom."""
    c = g['c']; im = Image.new('RGBA', (W, H), BUTTER + (255,))
    im.alpha_composite(ImageOps.fit(c['u2'].at(t - 6.0), (W, H // 2 - 6)).convert('RGBA'), (0, 0))
    im.alpha_composite(ImageOps.fit(c['m2'].at(t - 6.0), (W, H // 2 - 6)).convert('RGBA'), (0, H // 2 + 6))
    P.say(im, g['lu'], t, 6.25, (300, 330), -3); P.say(im, g['lm'], t, 6.3, (300, 1040), 3)
    P.say(im, g['diff'][1], t, 6.45, (540, 1420), 2); doodle_on(im, t, 6.8, g['tick'], (880, 1200), 0)
    return im

def round3(g, t):
    """Round 3: yours full frame; the usual kind small in a round window."""
    c = g['c']; im = c['m3'].at(t - 7.8)
    put(im, roundwin(c['usual'].at(t - 7.8, (300, 300)), 300), (250, 520), back_out(seg(t, 7.9, 8.2), 1.5))
    P.say(im, g['round'][2], t, 7.85, (680, 330), 3); P.say(im, g['diff'][2], t, 8.1, (540, 1400), -2)
    return im

def stage7(g, t):
    im = g['poster'].copy(); doodle_on(im, t, 9.75, g['tbg'], (540, 1050), 0)
    put(im, g['trophy'], (540, lerp(2400, 1050, back_out(seg(t, 9.6, 9.95), 1.3))), 1, -3)
    P.say(im, g['winner'], t, 9.45, (540, 380), -2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 13.5 + sum(h for _, h in HOLDS); render('25', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
