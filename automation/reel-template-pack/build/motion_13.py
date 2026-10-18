"""#13 How to use it in 3 steps, motion test (2026-10-18), built the #09/#10/#12 round 3 way (story5.py).
World: a light oak table with a real lined instruction card that gets written on step by step, and three real
engraved wooden number cubes (1, 2, 3) that tumble in, one per step, and carry the count from scene to scene.
Accent buyers change: muted plum. No tech moment in this one (most templates, not all).
Home bases: the buyer's how-to clips + the oak-table instruction card (a new line each visit).

Story (5 beats): hook "how to use [product] in 3 steps" / problem: just got one, now what? / product: step 1, 2, 3 /
proof: the result, done in [2 minutes] / CTA: comment [KEYWORD].
Scenes (15 s; graphics-only: 2, 5, 8):
 1 0.0  the product full frame; the three cubes tumble in and stack beside it; "how to use" / [product] / in 3 steps
 2 1.8  CARD, no video: the instruction card slides onto the oak; "just got one?" and line 1 writes in; cube 1 lands
 3 3.2  step 1 full frame; cube 1 carried to the corner; 1. [step] pill; arrow AT the work
 4 5.0  cube 2 rolls across as the wipe into step 2; 2. [step] pill; a marker ring round the click
 5 6.8  CARD, no video: lines 1-2 struck through, line 3 writes in; cube 3 lands; the camera dives into it...
 6 8.2  ...step 3 full frame; a marker path follows the glide; 3. [step] pill
 7 10.0 the result full frame; a burst behind THE RESULT; a sticky note: done in [2 minutes]
 8 11.6 OAK, no video: recap: three round windows (the three steps) float over the three cubes; "1 2 3. that's it."
 9 13.0 CTA: the product full frame; Comment / "[KEYWORD]" / [Product name]
Usage: python build/motion_13.py [seconds ...]  ->  13-how-to-use-it/preview/motion-test.mp4 (or a test sheet)
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
from motion_b2 import Clip, put, draw_on, render, camera, torn_band, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (28, 27, 26), (246, 241, 232); PLUM = (110, 62, 92)           # PLUM = the accent buyers change
DIR = '13-how-to-use-it'
CUBES = ('Engraved wooden number one cube-45.png', 'Natural Wooden Cube with Engraved 2-46.png', 'Wooden cube with engraved number 3-50.png')
CARD_W = 980; CARD_C = (540, 1000); LINE_Y = (140, 218, 297); STEPS = ('1. [rinse the pad]', '2. [unwind + plug in]', '3. [glide]')

def card_xy(x, y):
    k = CARD_W / 900; return (CARD_C[0] + (x - 450) * k, CARD_C[1] + (y - 246) * k)

def setup():
    g = {'c': {'prod': Clip('IMG_1464', 1.0), 's1': Clip('IMG_1430', 0.5), 's2': Clip('IMG_1429', 5.0), 's3': Clip('IMG_1423', 2.0),
               'res': Clip('IMG_1463', 0.5), 'cta': Clip('IMG_1375', 1.0)}}
    oak = ImageOps.fit(S.raw('images', 'Light oak wood grain texture-2.png'), (W, H)).convert('RGBA')
    dots = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', 'Playful hand-painted black polka dots-12.png')), PLUM, CRM).convert('RGBA')
    oak.alpha_composite(torn_band(dots, (W + 40, 300), 11, 't', 18), (-20, H - 280)); g['oak'] = oak
    g['card'] = P.die_cut(S.card('images', 'Blank Three-Line Recipe Card-56.png', CARD_W), 8)
    pats = (('stripes', PLUM), ('dots', INK), ('smalldots', PLUM))
    g['cubes'] = [P.thing(n, 260, p, col, scale=0.3, strength=0.45, seed=i) for i, (n, (p, col)) in enumerate(zip(CUBES, pats))]
    g['cubes_s'] = [S.fitw(c_, 180) for c_ in g['cubes']]
    f = S.F(S.HAND, 66); g['lines'] = []
    for txt in STEPS:
        im = Image.new('RGBA', (int(f.getlength(txt) + 20), 110), (0, 0, 0, 0)); ImageDraw.Draw(im).text((10, 55), txt, font=f, fill=INK, anchor='lm', stroke_width=1, stroke_fill=INK); g['lines'].append(im)
    g['strike'] = [doodle('under', 0, g['lines'][i].width, PLUM) for i in range(3)]
    g['howto'] = P.caption('how to use', 130, PLUM); g['prodname'] = P.pill_m('[your steam mop]', 58, INK, CRM); g['in3'] = P.caption('in 3 steps', 140, INK)
    g['just'] = P.caption('just got one?', 130, PLUM)
    g['sp'] = [P.pill_m(t, 58, INK if i != 1 else PLUM, CRM) for i, t in enumerate(STEPS)]
    g['done'] = P.sticky('done in\n[2 minutes]', 400, pin='pin-head-black'); g['result'] = P.caption('the result', 160, PLUM)
    g['thats'] = P.caption("that's it.", 170, PLUM)
    g['comment'] = P.caption('Comment', 180, PLUM, 'stripes'); g['kw'] = P.pill_m('"[KEYWORD]"', 64, CRM, INK); g['name'] = P.pill_m('[Product name]', 54, PLUM, CRM)
    g['d_arrow'] = doodle('arrow', 3, 260, PLUM); g['d_ring'] = doodle('frame', 0, 460, PLUM); g['d_path'] = doodle('arrow', 7, 640, PLUM)
    g['d_burst'] = doodle('burst', 2, 760, PLUM); g['d_under'] = doodle('under', 3, 600, PLUM)
    return g

def tumble(img, cube, t, t0, a, b, spins=1.0, dur=0.45):
    """A real cube tumbling from a to b (rolls over its corners, a little hop each quarter turn)."""
    if t < t0: return
    u = ease(seg(t, t0, t0 + dur)); x, y = lerp2(a, b, u); hop = 40 * abs(math.sin(u * math.pi * 2 * spins))
    put(img, cube, (x, y - hop), 1, -360 * spins * u)

def card_scene(g, t, t_in, written, struck, write_t):
    im = g['oak'].copy(); k = back_out(seg(t, t_in, t_in + 0.3), 1.4) if t_in is not None else 1
    put(im, g['card'], (lerp(-700, CARD_C[0], k), CARD_C[1]), 1, -2 * k)
    if k < 0.98: return im
    for i in range(written):
        u = seg(t, write_t, write_t + 0.35) if i == written - 1 else 1; x, y = card_xy(70, LINE_Y[i])
        draw_on(im, g['lines'][i], (x + g['lines'][i].width / 2, y), u)
    for i in range(struck):
        x, y = card_xy(70, LINE_Y[i]); draw_on(im, g['strike'][i], (x + g['lines'][i].width / 2, y + 6), seg(t, write_t - 0.3, write_t - 0.05))
    return im

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the product; the cubes tumble in and stack
        im = c['prod'].at(t)
        for i in range(3): tumble(im, g['cubes'][i], t, 0.1 + i * 0.2, (-200, 1250 - i * 230), (870, 1250 - i * 230), 1.0)
        P.say(im, g['howto'], t, 0.05, (540, 330), -3); P.say(im, g['prodname'], t, 0.35, (540, 470), 2); P.say(im, g['in3'], t, 0.6, (500, 1440), -2)
        if t > 1.55: im = swipe(im, card_scene(g, t, 1.75, 1, 0, 2.3), seg(t, 1.55, 1.8))
        return im
    if t < 3.2:                                                    # 2: the card; line 1 writes in; cube 1 lands
        im = card_scene(g, t, 1.75, 1, 0, 2.3); P.say(im, g['just'], t, 1.9, (540, 400), -3)
        tumble(im, g['cubes'][0], t, 2.6, (-200, 1450), (230, 1450))
        if t > 2.95: im = diagonal(im, c['s1'].at(t - 2.95), seg(t, 2.95, 3.2))
        return im
    if t < 5.0:                                                    # 3: step 1; cube 1 carried to the corner
        im = c['s1'].at(t - 2.95); put(im, g['cubes_s'][0], lerp2((230, 1450), (170, 330), ease(seg(t, 3.2, 3.5))), 1, -8)
        P.say(im, g['sp'][0], t, 3.4, (560, 1380), -2); doodle_on(im, t, 3.7, g['d_arrow'], (330, 1000), -20)
        if t > 4.6:                                                # 4: cube 2 rolls across as the wipe
            u = ease(seg(t, 4.6, 5.0)); x = lerp(-200, W + 200, u); new = c['s2'].at(t - 4.6); m = Image.new('L', (W, H), 0)
            ImageDraw.Draw(m).rectangle((0, 0, max(0, int(x)), H), fill=255); im.paste(new, (0, 0), m); put(im, g['cubes'][1], (x, 980), 1.6, -360 * u)
        return im
    if t < 6.8:                                                    # 4: step 2
        im = c['s2'].at(t - 4.6); put(im, g['cubes_s'][1], (170, 330), back_out(seg(t, 5.0, 5.25)), 6)
        P.say(im, g['sp'][1], t, 5.2, (560, 1380), 2); doodle_on(im, t, 5.5, g['d_ring'], (560, 1100), -4)
        if t > 6.55: im = swipe(im, card_scene(g, t, None, 3, 2, 7.2), seg(t, 6.55, 6.8), -1)
        return im
    if t < 8.2:                                                    # 5: lines struck, line 3 written; cube 3 lands; dive
        im = card_scene(g, t, None, 3, 2, 7.2); tumble(im, g['cubes'][2], t, 7.4, (W + 200, 1450), (850, 1450))
        if t > 7.85: im = camera(im, (850, 1450), lerp(1, 6, ease(seg(t, 7.85, 8.2)) ** 2))
        return im
    if t < 10.0:                                                   # 6: step 3, the glide traced
        im = camera(c['s3'].at(t - 8.2), (540, 960), lerp(1.5, 1, ease(seg(t, 8.2, 8.5)))); put(im, g['cubes_s'][2], (170, 330), back_out(seg(t, 8.3, 8.55)), -6)
        doodle_on(im, t, 8.7, g['d_path'], (540, 1210), -4, dur=0.6); P.say(im, g['sp'][2], t, 8.9, (560, 1380), -2)
        if t > 9.75: im = swipe(im, c['res'].at(t - 9.75), seg(t, 9.75, 10.0))
        return im
    if t < 11.6:                                                   # 7: the result
        im = c['res'].at(t - 9.75); doodle_on(im, t, 10.05, g['d_burst'], (520, 330), 0)          # one burst, behind the words
        P.say(im, g['result'], t, 10.1, (520, 330), -3); P.say(im, g['done'], t, 10.5, (760, 1180), 7)
        if t > 11.35: im = diagonal(im, recap(g, t), seg(t, 11.35, 11.6))
        return im
    if t < 13.0:
        im = recap(g, t)
        if t > 12.75: im = diagonal(im, c['cta'].at(t - 12.75), seg(t, 12.75, 13.0))
        return im
    im = c['cta'].at(t - 12.75)                                     # 9: CTA
    P.say(im, g['comment'], t, 13.1, (500, 1080), -3); P.say(im, g['kw'], t, 13.35, (500, 1230), 2); P.say(im, g['name'], t, 13.55, (500, 1350), -2)
    doodle_on(im, t, 13.4, g['d_under'], (500, 1160), -2)
    return im

def recap(g, t):
    """8: three round windows (the steps) float over the three cubes on the oak; that's it."""
    c = g['c']; im = g['oak'].copy(); xs = (220, 540, 860)
    for i, (cl, x) in enumerate(zip((c['s1'], c['s2'], c['s3']), xs)):
        put(im, g['cubes'][i], (x, 1350), back_out(seg(t, 11.6 + i * 0.1, 11.85 + i * 0.1)), (-6, 3, 7)[i])
        k = back_out(seg(t, 11.8 + i * 0.15, 12.1 + i * 0.15), 1.5)
        if k > 0: put(im, roundwin(cl.at(t - 11.6, (300, 300)), 300), (x + 10 * math.sin(t * 2 + i), 900 + 14 * math.sin(t * 2.4 + i)), k)
    P.say(im, g['thats'], t, 12.3, (540, 420), -3)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render('13', fr, 15.0, out); X.strip_sheet(DIR, 15)

if __name__ == '__main__':
    main()
