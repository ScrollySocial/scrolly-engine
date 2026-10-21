"""13 How to use it in 3 steps, approved 2026-10-19 (motion test build/motion_13.py). FULLY EDITABLE build (2026-10-20,
build/editable.py): every word is CapCut text (DM Serif Display built-in words, last word Italic; Montserrat for the
product, the three steps (written on the card and on each step), the proof note, the keyword and the product name,
the [brackets] on CapCut's text background); the arrow, the strike-throughs and the marker path are Scrolly Doodles
letters (recolour like text); the oak stage is CapCut's background colour under a colourless wood grain; the number
cubes, the instruction card, the sticky note and the round-window rims are real photos moving on keyframes; the six
clips are real clip layers (placeholder cards until the buyer's clips go in): the product, steps one to three (full
frame, then in the recap's round windows), the result and the end.
CapCut limits: the burst behind the proof note is a picture (text always sits above pictures; recolour it with
Adjust > HSL), and so is the torn polka-dot band along the bottom; the lines writing themselves on the card use
CapCut's Typewriter; cube 2 rolling across pushes step two in from the left (no moving wipe edge); the swipes are plain
slides and the diagonal wipes diagonal slides; the camera's dive into cube 3 moves every piece of the stage on
keyframes, the grain stays put."""
import math
from PIL import Image, ImageFont, ImageOps
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import editable_a as EA
import engine as E
import motion_13 as M
import motion_capcut as MC
import play as P
import play_extra as X
import storyboard_b2 as S
from collage_kit import doodle as art_doodle
from motion_b2 import ease, back_out, seg, lerp, torn_band

SPEC = dict(num='13', title='How to use it in 3 steps', subtitle='25 seconds. Six clips: your product, three steps, the result, the end.',
            font='montserrat', dir='13-how-to-use-it', folder='Template 13 - How to use it in 3 steps', project='13 How to use it',
            cover_at=1.0,
            slots=[('Your product', 'Your product, upright'), ('Step 1', 'The first step, close'), ('Step 2', 'The second step'),
                   ('Step 3', 'The third step'), ('The result', 'What it looks like after'), ('The end', 'You or your product')],
            test_clips=[('IMG_1464', 1.0), ('IMG_1430', 0.5), ('IMG_1429', 5.0), ('IMG_1423', 2.0), ('IMG_1432', 1.5), ('IMG_1375', 1.0)])
W, H = 1080, 1920
INK, WHITE, WINE = M.INK, (255, 255, 255), M.PLUM
STAGE = (224, 196, 156)                  # the light oak
TESTS = ('1. melt the wax', '2. pour slowly', '3. let it set')
LINE_PX = 56

def word(x, y, t0, r=0.0): return pop_in(x, y, t0, r, 0.22, 1.8, 18)
def swipe_out(t0, d=1): return slide(t0, t0 + 0.25, -d * W)
def swipe_in(t0, d=1): return enter(t0, t0 + 0.25, d * W)
def diag_out(t0): return slide(t0, t0 + 0.25, -W - 300, -420)

def tumble(t0, a, b, spins=1.0, dur=0.45):
    """M.tumble: a real cube rolling from a to b, a hop each quarter turn (clockwise in CapCut)."""
    def f(ts):
        u = ease(seg(ts, t0, t0 + dur)); hop = 40 * abs(math.sin(u * math.pi * 2 * spins))
        return at(lerp(a[0], b[0], u), lerp(a[1], b[1], u) - hop, 1, 360 * spins * u)
    return f

def reel():
    g = M.setup(); r = Ed.Reel(M.HOLDS, 15.0)
    r.art('oak-grain', Ed.grain(S.raw('images', 'Light oak wood grain texture-2.png'), 0.25), 0, None, 1, still(540, 960))
    dots = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', 'Playful hand-painted black polka dots-12.png')), WINE, X.PINK).convert('RGBA')
    band = torn_band(dots, (W + 40, 300), 11, 't', 18); band_c = (540, H - 280 + 150)
    def band_on(a, b, *moves): r.art('dot-band', band, a, b, 3, then(still(*band_c), *moves))
    mont = ImageFont.truetype(E.font_path('montserrat'), round(LINE_PX * 0.85))

    def card_lines(a, b, card_f, shown, struck, write_t):
        """The steps written on the card (Montserrat, left-aligned as the motion test), riding on the card."""
        for i in range(shown):
            x, y = M.card_xy(70, M.LINE_Y[i]); w = mont.getlength(M.STEPS[i])
            off = (x + w / 2 - M.CARD_C[0], y - M.CARD_C[1])
            a_i = write_t if i == shown - 1 else a
            r.plain(M.STEPS[i], LINE_PX, a_i, b, Ed.child(card_f, off), INK, test=TESTS[i], typewriter=0.35 if i == shown - 1 else None)
            if i < struck:
                lw = max(mont.getlength(M.STEPS[i]), 200)
                r.doodle('under', 0, lw, write_t - 0.3, b, then(Ed.child(card_f, (off[0], off[1] + 6)),
                         lambda ts, v: dict(v, s=v['s'] * back_out(seg(ts, write_t - 0.3, write_t - 0.05), 1.2))), WINE)

    # 1 (0-1.8) the product full frame; the three cubes tumble in and stack; "how to use / [product] / in 3 steps"
    o1 = swipe_out(1.55)
    r.clip(0, 0, 1.8, 10, then(still(540, 960), o1))
    for i in range(3):
        r.art(f'cube-{i + 1}-in', g['cubes'][i], 0.1 + i * 0.2, 1.8, 11 + i, then(tumble(0.1 + i * 0.2, (-200, 1250 - i * 230), (870, 1250 - i * 230)), o1))
    r.serif('how to use', 120, 0.05, 1.8, then(word(540, 330, 0.05, 3), o1), WHITE, WINE)
    r.boxed('[your steam mop]', 58, 0.35, 1.8, then(pop_in(540, 470, 0.35, -2), o1), WINE, 'your soy candle')
    r.serif('in 3 steps', 129, 0.6, 1.8, then(word(500, 1440, 0.6, 2), o1), WINE, WHITE)

    # 2 (1.55-3.2) CARD, no video: the instruction card slides onto the oak; "just got one?"; line 1 writes in; cube 1 lands
    i2, o2 = swipe_in(1.55), diag_out(2.95)
    band_on(1.55, 3.2, i2, o2)
    def card2(ts):
        k = back_out(seg(ts, 1.75, 2.05), 1.4); return at(lerp(-700, M.CARD_C[0], k), M.CARD_C[1], 1, 2 * k)
    c2 = then(card2, i2, o2)
    r.art('card', g['card'], 1.55, 3.2, 20, c2)
    card_lines(1.55, 3.2, c2, 1, 0, 2.3)
    r.serif('just got one?', 120, 1.9, 3.2, then(word(540, 400, 1.9, 3), i2, o2), WINE, WHITE)
    r.art('cube-1', g['cubes'][0], 2.6, 3.2, 22, then(tumble(2.6, (-200, 1450), (230, 1450)), o2))

    # 3 (2.95-5.0) step 1 full frame; cube 1 carried to the corner; 1. [step]; an arrow up at the work;
    #   4.6: cube 2 rolls across pushing step 2 in
    r.clip(1, 2.95, 5.0, 15, still(540, 960))           # under scene 2, which slides off it
    r.art('cube-1-s', g['cubes_s'][0], 2.95, 4.75, 16,
          lambda ts: at(lerp(230, 170, ease(seg(ts, 3.2, 3.5))), lerp(1450, 330, ease(seg(ts, 3.2, 3.5))), 1, 8))
    r.boxed(M.STEPS[0], 58, 3.4, 4.6, pop_in(560, 1380, 3.4, 2), WINE, TESTS[0])
    r.doodle('arrow', 0, 190, 3.7, 4.6, pop_in(560, 1215, 3.7, -90, 0.35), WINE)
    def roll(ts): return lerp(-200, W + 200, ease(seg(ts, 4.6, 5.0)))
    r.art('cube-2-roll', g['cubes'][1].resize((int(g['cubes'][1].width * 1.6), int(g['cubes'][1].height * 1.6))), 4.6, 5.0, 32,
          lambda ts: at(roll(ts), 980, 1, 360 * ease(seg(ts, 4.6, 5.0))))

    # 4 (4.6-6.8) step 2 (comes in with the cube); cube 2 in the corner; 2. [step]; swipes right at 6.55
    o4 = swipe_out(6.55, -1)
    r.clip(2, 4.6, 6.8, 30, then(lambda ts: at(min(540, roll(ts) - 540), 960), o4))
    r.art('cube-2-s', g['cubes_s'][1], 5.0, 6.8, 31, then(lambda ts: at(170, 330, back_out(seg(ts, 5.0, 5.25)), -6), o4))
    r.boxed(M.STEPS[1], 58, 5.2, 6.8, then(pop_in(560, 1380, 5.2, -2), o4), WINE, TESTS[1])

    # 5 (6.55-8.2) CARD, no video: lines 1-2 struck through, line 3 writes in; cube 3 lands; the camera dives into it
    i5, cam5 = swipe_in(6.55, -1), EA.zoom_into(7.85, 8.2, (850, 1450), 6)
    band_on(6.55, 8.2, i5, cam5)
    c5 = then(still(M.CARD_C[0], M.CARD_C[1], 2), i5, cam5)
    r.art('card-5', g['card'], 6.55, 8.2, 40, c5)
    card_lines(6.55, 8.2, c5, 3, 2, 7.2)
    r.art('cube-3', g['cubes'][2], 7.4, 8.2, 42, then(tumble(7.4, (W + 200, 1450), (850, 1450)), cam5))

    # 6 (8.2-10.0) step 3 full frame (the camera settles); cube 3 in the corner; the marker path; 3. [step]; swipe at 9.75
    o6 = swipe_out(9.75)
    def settle(ts):
        s = lerp(1.5, 1, ease(seg(ts, 8.2, 8.5))); return at(540, 960, s)
    r.clip(3, 8.2, 10.0, 50, then(settle, o6))
    r.art('cube-3-s', g['cubes_s'][2], 8.3, 10.0, 51, then(lambda ts: at(170, 330, back_out(seg(ts, 8.3, 8.55)), 6), o6))
    r.doodle('arrow', 7, 640, 8.7, 10.0, then(pop_in(540, 1210, 8.7, 4, 0.35), o6), WINE)
    r.boxed(M.STEPS[2], 58, 8.9, 10.0, then(pop_in(560, 1380, 8.9, 2), o6), WINE, TESTS[2])

    # 7 (9.75-11.6) the result; one burst behind the proof note; "the result"; done in [2 minutes]; diagonal out at 11.35
    i7, o7 = swipe_in(9.75), diag_out(11.35)
    r.clip(4, 9.75, 11.6, 66, then(still(540, 960), i7, o7))
    r.art('burst', art_doodle('burst', 2, 760, WINE), 10.45, 11.6, 67, then(pop_in(760, 1180, 10.45, 0, 0.35), o7))
    full, blank = P.sticky('done in\n[2 minutes]', 400, pin='pin-head-black'), P.sticky('', 400, pin='pin-head-black')
    off = MC.text_anchor(full, blank); nf = then(pop_in(760, 1180, 10.5, -7), o7)
    r.art('note-done', blank, 10.5, 11.6, 68, nf)
    r.plain('done in\n[2 minutes]', 60, 10.5, 11.6, Ed.child(nf, off), INK, test='done in\n2 hours')
    r.serif('the result', 147, 10.1, 11.6, then(word(520, 330, 10.1, 3), o7), WHITE, WINE)

    # 8 (11.35-13.0) OAK, no video: the recap: three round windows (the steps) float over the three cubes; "that's it."
    o8 = diag_out(12.75)
    band_on(11.35, 13.0, o8)
    rim = EA.ring(300)
    for i, x in enumerate((220, 540, 860)):
        r.art(f'cube-{i + 1}-recap', g['cubes'][i], 11.35, 13.0, 52 + i,
              then(lambda ts, i=i, x=x: at(x, 1350, back_out(seg(ts, 11.6 + i * 0.1, 11.85 + i * 0.1)), (6, -3, -7)[i]), o8))
        def wf(ts, i=i, x=x):
            return at(x + 10 * math.sin(ts * 2 + i), 900 + 14 * math.sin(ts * 2.4 + i), back_out(seg(ts, 11.8 + i * 0.15, 12.1 + i * 0.15), 1.5))
        wf = then(wf, o8)
        r.clip(i + 1, 11.35, 13.0, 55 + 2 * i, wf, size=(300, 300), mask='circle', src=1.0)
        r.art(f'rim-{i + 1}', rim, 11.35, 13.0, 56 + 2 * i, wf)
    r.serif("that's it.", 156, 12.3, 13.0, then(word(540, 420, 12.3, 3), o8), WINE, WHITE)

    # 9 (12.75-end) CTA: the end clip; Comment / "[KEYWORD]" / [Product name]
    r.clip(5, 12.75, None, 45, still(540, 960))         # under the recap, which slides off it
    r.serif('Comment', 166, 13.1, None, word(500, 1080, 13.1, 3), WHITE, WINE)
    r.boxed('"[KEYWORD]"', 64, 13.35, None, pop_in(500, 1230, 13.35, -2), WHITE, '"HOW"')
    r.boxed('[Product name]', 54, 13.55, None, pop_in(500, 1350, 13.55, 2), WINE, 'The Soy Candle Kit')
    return r

def layers():
    return reel().L
