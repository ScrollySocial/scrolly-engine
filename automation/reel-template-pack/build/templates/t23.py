"""23 Every option in 10 seconds, approved 2026-10-18 as the round-4 motion test (build/story7.py, "no changes").
FULLY EDITABLE build (2026-10-20, build/editable.py; the motion test plays P.SLOW times longer, so script times are
scaled by SLOW): every word is CapCut text (DM Serif Display built-in words: every option, which one?, your favourite,
Comment; in 10 seconds, the six option names, the counts, pause on, the keyword and all 6 at shop in Montserrat, the
[brackets] on CapCut's text background); the heart and the underline are Scrolly Doodles letters (recolour like text);
the pegboard stage is CapCut's background colour under a colourless pegboard grain; the fan deck, paint chips, phone,
glasses and oak shelf are real photos moving on keyframes; the seven clips are real clip layers (placeholder cards
until the buyer's clips go in): the shop scroll on the phone, then six options (full frame one after another, two in
the glasses' lenses, all six on the shelf at the end).
CapCut limits: the fan wipes are the next option swinging in from the bottom-left corner; the option behind the
glasses stays in colour (no black-and-white); the paint chips are pictures (Adjust > HSL)."""
import math
import editable as Ed
from editable import at, still, then
import editable_b as B
from editable_b import pop, word
import play as P
import story7 as S7
import collage as C
from story4 import card
from collage_kit import raw
from motion_b2 import ease, back_out, seg, lerp
from engine import W, H

SL = B.SL; END = S7.SECS['23']; ST = S7.STEP23
SPEC = dict(num='23', title='Every option in 10 seconds', subtitle='25 seconds. Seven clips: your shop scrolling, then six options.',
            font='montserrat', dir='23-every-option-in-10-seconds', folder='Template 23 - Every option in 10 seconds',
            project='23 Every option in 10 seconds', cover_at=1.0,
            slots=[('Option 1', 'One colour, scent or style, upright'), ('Option 2', 'The next one, same framing'),
                   ('Option 3', 'The next one, same framing'), ('Option 4', 'The next one, same framing'),
                   ('Option 5', 'The next one, same framing'), ('Option 6', 'The last one, same framing'),
                   ('Your shop, scrolling', 'A screen recording of you scrolling your shop')],
            test_clips=[(n, 1.0) for n in S7.OPT] + [('IMG_1417', 0.5)])
INK, WHITE, WINE, BLUE = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['blue']
STAGE = (240, 236, 228)
TESTN = ('Sage', 'Plum', 'Slate', 'Cocoa', 'Blush', 'Ivory')

def swing(t0, dur=0.28):
    """story7.fan_wipe as motion: the frame swings in about the bottom-left corner."""
    def f(ts):
        a = -90 * (1 - ease(seg(ts, t0, t0 + dur))); c = Ed.rot((W / 2, -H / 2), a); return at(c[0], H + c[1], 1, a)
    return f

def reel():
    g = S7.setup_23(); r = B.SlowReel(END)
    r.art('pegboard-grain', Ed.grain(raw('images', 'White pegboard grid texture-5.png'), 0.25), 0, None, 1, still(540, 960))

    # 1 (0-2.2) pegboard, no video: the fan deck fans open; every option [in 10 seconds]
    r.art('fan-deck', g['fan'], 0, 2.2, 10, lambda ts: at(540, 1300, lerp(0.75, 1, ease(seg(ts, 0, 0.8))), lerp(50, 0, ease(seg(ts, 0, 0.8)))))
    r.serif('every option', 128, 0.1, 2.2, word(540, 400, 0.1, 2), WINE, WHITE)
    r.boxed('[in 10 seconds]', 80, 0.5, 2.2, pop(540, 580, 0.5, 0), BLUE, 'in 10 seconds')

    # 2 (2.2-4.0) the phone stands on its own; the buyer's shop scroll on its screen
    ph, ssize, soff = B.device(S7.PHONE, 640)
    fp = lambda ts: at(540, lerp(2400, 1000, back_out(seg(ts, 2.2, 2.55), 1.2)), 1, 3)
    r.clip(6, 2.2, 4.0, 11, Ed.child(fp, soff), size=ssize)
    r.art('phone', ph, 2.2, 4.0, 12, fp)

    # 3-5 (3.75-13.3) the options, full frame, each with its own chip + name; a giant chip sweep or a fan swing between
    plan = {0: (3.75, 5.11, 'fan'), 1: (5.11, 6.5, 'cut'), 2: (6.22, 7.61, 'fan'), 3: (7.61, 10.8, 'cut'), 4: (10.8, 11.91, 'cut'), 5: (11.91, 13.3, 'cut')}
    starts = {0: 4.0, 1: 4.0 + ST, 2: 4.0 + 2 * ST, 3: 4.0 + 3 * ST, 4: 10.8, 5: 10.8 + ST}
    ends_txt = {0: 5.11, 1: 6.5, 2: 7.61, 3: 9.0, 4: 11.91, 5: 13.3}
    for i, (a, b, how) in plan.items():
        z = 20 + 4 * i; f = swing(a) if how == 'fan' else still(540, 960)
        r.clip(i, a, b, z, f, src=max(0.0, a - starts[i]) * SL)
        s0 = starts[i]; e = ends_txt[i]
        r.art(f'chip-{i}', g['chips'][i], s0, e, z + 1, pop(170, 1380, s0, 6, 0.25, 2.2))
        r.boxed(f'[OPTION {i + 1}]', 80, s0, e, pop(540, 1390, s0, 4, 0.25), WHITE, TESTN[i])
        r.boxed(f'{i + 1}/6', 64, a, e, Ed.child(f, (390, -630), 2), BLUE)
    for j, (t0, nxt) in enumerate(((5.25 - 0.28, 1), (7.75 - 0.28, 3), (12.05 - 0.28, 5))):   # the giant chip sweeps across
        ch = g['chip_big'][nxt]
        r.art(f'chip-sweep-{j}', ch, t0, t0 + 0.28, 60, lambda ts, t0=t0, ch=ch: at(lerp(-ch.width / 2 - 200, W + ch.width / 2 + 200, ease(seg(ts, t0, t0 + 0.28))), 960, 1, 12))

    # 4 (9.0-10.8) the glasses: options 5 and 6 play in the two lenses over option 4; which one?
    gl = g['glasses']; k = gl.width / 1316; gsh = C.shadow(gl, (8, 14), 12, 110)
    fg = lambda ts: at(540, 900, back_out(seg(ts, 9.0, 9.3), 1.4))
    for (bx, i) in ((S7.LENS_L, 4), (S7.LENS_R, 5)):
        x0, y0, x1, y1 = [int(v * k) for v in bx]
        off = ((x0 + x1) / 2 - gl.width / 2, (y0 + y1) / 2 - gl.height / 2)
        r.clip(i, 9.0, 10.8, 40 + i, Ed.child(fg, off), size=(x1 - x0, y1 - y0), mask='circle')
    r.art('glasses', gsh, 9.0, 10.8, 46, fg)
    r.serif('which one?', 190, 9.2, 10.8, word(540, 1300, 9.2, 2), WHITE, WINE)
    r.boxed('[OPTION 5]', 80, 9.5, 10.8, pop(290, 1460, 9.5, 5, 0.25), WHITE, TESTN[4])
    r.boxed('[OPTION 6]', 80, 9.65, 10.8, pop(790, 1460, 9.65, -1, 0.25), WHITE, TESTN[5])

    # 6 (13.3-15.0) pegboard, no video: the chip row; pause on / your favourite; her heart on one chip
    for i in range(6):
        r.art(f'chip-row-{i}', g['chip_row'][i], 13.3 + i * 0.06, 15.0, 62 + i, pop(180 + (i % 3) * 360, 860 + (i // 3) * 520, 13.3 + i * 0.06, -(-6, 4, -3, 5, -4, 6)[i]))
    r.boxed('pause on', 78, 13.4, 15.0, pop(540, 330, 13.4, 4))
    r.serif('your favourite', 118, 13.55, 15.0, word(540, 500, 13.55, 0), WINE, WHITE)
    r.doodle('icon', 2, 190, 14.0, 15.0, pop(540, 1290, 14.0, -8, 0.3), WINE)

    # 7 (15.0-end) CTA: every option playing on the real oak shelf; Comment / "[KEYWORD]" / all [6] at [shop]
    r.art('shelf', g['shelf'], 15.0, None, 70, pop(540, 1240, 15.0, 0, 0.3, 1.3))
    cw, csize, coff = B.hole(card(B.keyed((230, 170)), 230, 170, 8))
    for i, (x, y) in enumerate(((330, 960), (750, 960), (330, 1260), (750, 1260), (330, 1550), (750, 1550))):
        t0 = 15.1 + i * 0.08; f = pop(x, y, t0, (3, -3)[i % 2], 0.25)
        r.clip(i, t0, None, 71 + 2 * i, Ed.child(f, coff), size=csize)
        r.art(f'shelf-card-{i}', cw, t0, None, 72 + 2 * i, f)
    r.serif('Comment', 200, 15.4, None, word(540, 350, 15.4, 0), WINE, WHITE, italic_last=False)   # 50 px lower: clear of IG's top bar
    r.boxed('"[KEYWORD]"', 76, 15.7, None, pop(540, 505, 15.7, -2), WINE, '"COLOURS"', round_=1)
    r.boxed('all [6] at [shop]', 70, 15.9, None, pop(540, 620, 15.9, 4), BLUE, 'all 6 at my shop')
    r.doodle('under', 0, 520, 16.1, None, pop(540, 725, 16.1, 2, 0.3), WINE)
    return r

def layers():
    return reel().L
