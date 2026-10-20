"""11 A day with it, approved 2026-10-19 as the round-4 motion test (build/story7.py, "fine").
FULLY EDITABLE build (2026-10-20, build/editable.py; the motion test plays P.SLOW times longer, so script times are
scaled by SLOW): every word is CapCut text (DM Serif Display built-in words: morning, midday, afternoon, night, every
day; the hook, the four times, the product name and the CTA in Montserrat, the [brackets] on CapCut's text background);
the underline and the arrow are Scrolly Doodles letters (recolour like text); the light-blue stage is CapCut's
background colour under a colourless tissue grain; the alarm clock, mug, rainbow, smartwatch, hourglass, candle and
gold stars are real photos moving on keyframes; the five clips are real clip layers (placeholder cards until the
buyer's clips go in): morning, midday, afternoon (on the watch screen, then full frame), night and the ending (round).
CapCut limits: the ray burst behind the alarm clock is a picture (text always sits above pictures; recolour it with
Adjust > HSL); the lights going down to night is a navy tissue sheet that drops down over the stage (no fades; recolour
it with Adjust > HSL); the slides are plain slides."""
import math
import editable as Ed
from editable import at, still, then
import editable_b as B
from editable_b import pop, word, out_l, in_r, out_u, in_u
import play as P
import story7 as S7
from story4 import roundwin
from collage_kit import doodle as art_doodle, raw
from motion_b2 import ease, back_out, seg, lerp
from engine import W, H

SL = B.SL; END = S7.SECS['11']
SPEC = dict(num='11', title='A day with it', subtitle='24 seconds. Five clips: morning, midday, afternoon, night, the ending.',
            font='montserrat', dir='11-a-day-with-it', folder='Template 11 - A day with it', project='11 A day with it', cover_at=1.2,
            slots=[('Morning', 'You or your product in the morning, upright'), ('Midday', 'Using it in the middle of the day'),
                   ('Afternoon', 'Using it in the afternoon'), ('Night', 'Using it at night'), ('The ending', 'Your product resting, close up')],
            test_clips=[('IMG_1469', 1.0), ('IMG_1381', 1.0), ('IMG_1414', 1.0), ('IMG_1456', 1.0), ('IMG_1388', 0.5)])
INK, WHITE, BLUE, PINK, DEEP = (24, 23, 22), (255, 255, 255), P.PAL['blue'], P.PAL['pink'], S7.DEEP
STAGE = (200, 220, 240)

def reel():
    g = S7.setup_11(); r = B.SlowReel(END)
    r.art('tissue-grain', Ed.grain(raw('images', 'Crumpled pale blue tissue texture-8.png'), 0.22), 0, None, 1, still(540, 960))

    # 1 (0-2.4) morning: an alarm clock rings in the corner, ONE burst behind it; a day with my [product]; morning; [7am]
    o1 = out_u(2.1)
    r.clip(0, 0, 2.4, 10, then(still(540, 960), o1))
    r.art('burst', art_doodle('burst', 3, 720, PINK), 0.25, 2.4, 11, then(lambda ts: at(820, 1330, 0.9 + 0.1 * back_out(seg(ts, 0.25, 0.55), 1.5)), o1))
    def ring(ts):
        s = 7 * math.sin(ts * 55) * (1 - seg(ts, 1.2, 1.5)) if ts > 0.2 else 0; return at(820 + s, 1330, back_out(seg(ts, 0.0, 0.25), 1.6), -s)
    r.art('clock', g['clock'], 0, 2.4, 12, then(ring, o1))
    r.boxed('a day with my\n[product]', 74, 0.0, 2.4, then(pop(330, 330, 0.0, 5), o1), WHITE, 'a day with my\nwater bottle')
    r.serif('morning', 190, 0.4, 2.4, then(word(430, 560, 0.4, 0), o1), WHITE, DEEP)
    r.doodle('under', 0, 520, 0.8, 2.4, then(pop(430, 680, 0.8, 2, 0.3), o1), PINK)
    r.boxed('[7am]', 72, 0.9, 2.4, then(pop(260, 760, 0.9, 5), o1), BLUE, '7am')

    # 2 (2.1-4.4) stage: a mug; the rainbow rises behind midday; the alarm clock carried in, resting in the corner
    i2, o2 = in_u(2.1), out_l(4.1)
    r.art('rainbow', g['rainbow'], 2.1, 4.4, 13, then(lambda ts: at(540, lerp(1300, 820, back_out(seg(ts, 2.5, 2.9), 1.2))), i2, o2))
    r.art('mug', g['mug'], 2.6, 4.4, 14, then(pop(300, 1340, 2.6, 6, wiggle=2), o2))
    r.art('clock-small', g['clock_s'], 2.1, 4.4, 15, then(lambda ts: at(lerp(800, 840, ease(seg(ts, 2.4, 2.7))), lerp(1700, 1420, ease(seg(ts, 2.4, 2.7))), 1, -12), i2, o2))
    r.serif('midday', 220, 2.8, 4.4, then(word(540, 900, 2.8, 0), o2), DEEP, WHITE)

    # 3 (4.1-6.4) midday, full frame: the rainbow carried in as a sticker; [12pm]
    o3 = out_u(6.1)
    r.clip(1, 4.1, 6.4, 16, then(still(540, 960), in_r(4.1), o3))
    r.art('rainbow-small', g['rainbow_s'], 4.5, 6.4, 17, then(lambda ts: at(850, 330, back_out(seg(ts, 4.5, 4.8), 1.5), -(6 + 3 * math.sin(ts * 2))), o3))
    r.boxed('[12pm]', 72, 4.6, 6.4, then(pop(300, 330, 4.6, 5), o3), BLUE, '12pm')

    # 4 (6.1-8.6) stage: the smartwatch lying on it, its screen the afternoon clip (tech); the hourglass flips
    o4 = out_l(8.3)
    watch, ssize, soff = B.device(S7.WATCH, 520)
    fw = then(lambda ts: at(600, lerp(2300, 1080, back_out(seg(ts, 6.4, 6.75), 1.2)), 1, -12), o4)
    r.clip(2, 6.4, 8.6, 18, Ed.child(fw, soff), size=ssize)
    r.art('watch', watch, 6.4, 8.6, 19, fw)
    r.art('hourglass', g['hourglass'], 6.6, 8.6, 20, then(lambda ts: at(230, 1440, back_out(seg(ts, 6.6, 6.9), 1.5), -180 * ease(seg(ts, 7.2, 7.6))), o4))
    r.serif('afternoon', 170, 6.6, 8.6, then(word(540, 380, 6.6, 0), o4), DEEP, WHITE)
    r.boxed('[4pm]', 72, 7.0, 8.6, then(pop(540, 560, 7.0, 4), o4), BLUE, '4pm')

    # 5 (8.3-10.6) afternoon, full frame: the hourglass carried into the corner
    o5 = out_u(10.3)
    r.clip(2, 8.3, 10.6, 21, then(still(540, 960), in_r(8.3), o5), src=(8.3 - 6.4) * SL)
    r.art('hourglass-small', g['hourglass_s'], 8.7, 10.6, 22, then(lambda ts: at(170, 1380, back_out(seg(ts, 8.7, 9.0), 1.5), -(180 + 8 * math.sin(ts * 2))), o5))

    # 6 (10.3-12.6) stage, the lights go down to night: the candle lights, three gold stars; night [9pm]
    o6 = out_l(12.3)
    r.art('night-sheet', g['night_stage'], 10.7, 12.6, 3, then(lambda ts: at(540, 960 - H * (1 - ease(seg(ts, 10.7, 11.1)))), o6))
    r.art('candle', g['candle'], 11.0, 12.6, 23, then(pop(540, 1240, 11.0), o6))
    for i, (xy, t0) in enumerate((((230, 760), 11.2), ((860, 900), 11.35), ((300, 1600), 11.5))):
        r.art(f'star-{i}', g['stars'][i], t0, 12.6, 24 + i, then(lambda ts, xy=xy, t0=t0, i=i: at(xy[0], xy[1], back_out(seg(ts, t0, t0 + 0.25), 1.8) * (1 + 0.06 * math.sin((ts - t0) * 6 + i))), o6))
    r.serif('night', 230, 11.1, 12.6, then(word(540, 520, 11.1, 0), o6), PINK, WHITE)
    r.boxed('[9pm]', 72, 11.4, 12.6, then(pop(540, 720, 11.4, 4), o6), BLUE, '9pm')

    # 7 (12.3-14.4) night, full frame: the candle carried into the corner
    o7 = out_u(14.1)
    r.clip(3, 12.3, 14.4, 27, then(still(540, 960), in_r(12.3), o7))
    r.art('candle-small', g['candle_s'], 12.7, 14.4, 28, then(lambda ts: at(880, 1380, back_out(seg(ts, 12.7, 13.0), 1.5), 6), o7))

    # 8 (14.1-end) CTA on the stage: the product in a round window, the day's four objects round it; one arrow
    rw, rsize, roff = B.hole(roundwin(B.keyed((560, 560)), 560), ellipse=True)
    fr = pop(540, 1090, 14.4, 0, 0.35, 1.4)
    r.clip(4, 14.4, None, 29, Ed.child(fr, roff), size=rsize, mask='circle')
    r.art('round-window', rw, 14.4, None, 30, fr)
    for i, (im, xy, rr) in enumerate(((g['clock_s'], (170, 960), -10), (S7.S.fitw(g['mug'], 220), (910, 900), 8),
                                      (g['hourglass_s'], (180, 1460), 6), (g['candle_s'], (890, 1450), -6))):
        r.art(f'cta-obj-{i}', im, 14.6 + i * 0.1, None, 31 + i, pop(xy[0], xy[1], 14.6 + i * 0.1, -rr, wiggle=1.5))
    r.serif('every day', 190, 14.6, None, word(540, 350, 14.6, 0), DEEP, WHITE)   # clear of IG's top bar
    r.boxed('[Product name] at [shop]', 66, 14.9, None, pop(540, 500, 14.9, 4), WHITE, 'The Daily Bottle at my shop')
    r.boxed('comment "[KEYWORD]"', 66, 15.2, None, pop(540, 620, 15.2, -2), PINK, 'comment "DAY"', round_=1)
    r.doodle('arrow', 9, 220, 15.4, None, pop(330, 760, 15.4, 0, 0.3), DEEP)
    return r

def layers():
    return reel().L
