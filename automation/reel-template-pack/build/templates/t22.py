"""22 Put it to the test, approved 2026-10-18 as the round-4 motion test (build/story7.py, "no changes").
FULLY EDITABLE build (2026-10-20, build/editable.py; the motion test plays P.SLOW times longer, so script times are
scaled by SLOW): every word is CapCut text (DM Serif Display built-in words: let's test it, the result, Comment;
I tried to / [ruin] it, does it really / [STAY DRY]?, the claim note, one take, watch closely, did it...?, REC,
[IT STAYED DRY] and the keyword in Montserrat, the [brackets] on CapCut's text background; the stamped PASSED in Anton
inside a doodle frame); the underline, the arrow and the stamp's frame are Scrolly Doodles letters (recolour like
text); the graph-paper stage is CapCut's background colour under a colourless graph-paper grain, with a torn butter
tissue band along the bottom; the magnifiers, test tubes, sticky notes, REC label and rubber stamp are real photos
moving on keyframes; the four clips are real clip layers (placeholder cards until the buyer's clips go in): the test
(full frame, punching in, then the one uncut take), the setup (in the big lens), the result (opening out of the small
lens) and the ending (a card on the paper).
CapCut limits: the burst behind the note is a picture (text always sits above pictures; recolour it with Adjust >
HSL); the tubes filling with her patterns is a short flipbook of the tubes alone; the two-tone strip slice is solid blue
and butter strips sliding apart over the take (CapCut can't cut a clip into strips); PASSED is clean type, not rough
stamp ink, and it sits 140 px higher than the motion test (clear of IG's caption); the result's circle opens on the
middle of the clip (zoomed), then cuts to the full frame; the setup lens shows the middle of the setup clip; the
motion-blur swipes are plain slides; the butter band and the tubes are pictures (Adjust > HSL)."""
import math
from PIL import Image, ImageDraw
import editable as Ed
from editable import at, still, then
import editable_b as B
from editable_b import pop, word, out_l, in_r
import play as P
import story7 as S7
import collage as C
from collage_kit import doodle as art_doodle, raw
from motion_b2 import ease, back_out, seg, lerp, lerp2
from engine import W, H

SL = B.SL; END = S7.SECS['22']
SPEC = dict(num='22', title='Put it to the test', subtitle='25 seconds. Four clips: the setup, the test in one take, the result, you.',
            font='montserrat', dir='22-put-it-to-the-test', folder='Template 22 - Put it to the test',
            project='22 Put it to the test', cover_at=1.0,
            slots=[('The setup', 'Your product before the test, upright'),
                   ('The test, one take', 'The whole test, no cuts (at least 6 seconds)'),
                   ('The result', 'The result, close up'),
                   ('You, at the end', 'You or your product, upright')],
            test_clips=[('IMG_1430', 1.0), ('IMG_1460', 0.0), ('IMG_1463', 1.0), ('IMG_1431', 1.0)])
INK, WHITE, DEEP, BUTTER, BLUE = (24, 23, 22), (255, 255, 255), S7.DEEP, P.PAL['butter'], P.PAL['blue']
STAGE = (214, 228, 242)
NOTE = 'claim:\n[stays dry]'

def passed(r, px, a, b, f):
    """The stamp's print: PASSED (Anton) in a doodle frame, both recolourable."""
    import motion_22 as M
    r.text('anton', px, 'PASSED', a, b, f, DEEP)
    r.doodle('frame', 4, M.passed_ink(px).width, a, b, f, DEEP)

def reel():
    g = S7.setup_22(); M = g['M']; r = B.SlowReel(END)
    r.art('graph-grain', Ed.grain(raw('images', 'Creased pale blue graph paper-7.png'), 0.25), 0, None, 1, still(540, 960))
    tissue = S7.ImageOps.grayscale(S7.S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))
    band = S7.ImageOps.fit(S7.ImageOps.colorize(S7.ImageOps.autocontrast(tissue), tuple(int(v * 0.88) for v in BUTTER), BUTTER), (W + 72, 460)).convert('RGBA')
    band.putalpha(C.torn_mask((W + 72, 460), 7, 22, 't')); band = C.shadow(band, (0, -6), 10, 80)
    r.art('butter-band', band, 0, None, 2, still(540 - 36, H - 230 - 36))

    # 1 (0-2.2) the test clip mid-action, full frame, punching in; [I tried to] ruin it; one underline
    o1 = out_l(1.9)
    r.clip(1, 0, 2.2, 10, then(lambda ts: at(540, 960, lerp(1.12, 1.0, ease(seg(ts, 0, 0.6)))), o1), src=2.0 * SL)
    r.boxed('I tried to', 80, 0.1, 2.2, then(pop(340, 320, 0.1, 5), o1))
    r.plain('[ruin] it', 230 * 0.6 / 0.85, 0.35, 2.2, then(word(540, 500, 0.35, 0), o1), DEEP, WHITE, test='spill on it')
    r.doodle('under', 0, 600, 0.8, 2.2, then(pop(540, 650, 0.8, 2, 0.3), o1), DEEP)

    # 2 (1.9-4.9) graph paper: the setup clip inside the big magnifier's lens; does it really [STAY DRY]?
    i2, o2 = in_r(1.9), out_l(4.6)
    ox, oy, rl = g['lens_big']
    fm = then(lambda ts: at(540 - ox + 30 * math.sin(ts * 1.2), 1040 - oy), i2, o2)
    r.clip(0, 1.9, 4.9, 11, Ed.child(fm, (ox, oy)), size=(int(2 * rl), int(2 * rl)), mask='circle')
    r.art('magnifier-big', g['mag_big'], 1.9, 4.9, 12, fm)
    r.boxed('does it really', 76, 2.4, 4.9, then(pop(480, 300, 2.4, 4), o2))
    r.plain('[STAY DRY]?', 170 * 0.6 / 0.85, 2.7, 4.9, then(pop(540, 470, 2.7, 3), o2), DEEP, WHITE, test='STAY DRY?')

    # 3 (4.6-6.6) graph paper, no video: the claim note; the tubes fill with her patterns; let's test it
    i3 = in_r(4.6)
    ft = then(lambda ts: at(770, 1150, back_out(seg(ts, 4.45, 4.75), 1.4), -4), i3)
    r.art('tubes-empty', M.tubes(g, 0.0), 4.6, 4.75, 13, ft)
    frames = [(M.tubes(g, seg(4.75 + k / 15 / SL, 4.7, 5.6)), (770, 1150)) for k in range(int(0.85 * SL * 15) + 1)]
    end = r.L.flip('tubes-fill', frames, r.R(4.75), 13, rot=-4, fps=15)
    r.art('tubes-full', M.tubes(g, 1.0), end / SL, 6.45, 13, still(770, 1150, -4))
    note = P.sticky('', 440); fn = then(pop(300, 820, 4.6, 6), i3)
    r.art('claim-note', note, 4.6, 6.45, 14, fn)
    r.plain(NOTE, 56, 4.6, 6.45, Ed.child(fn, B.anchor(P.sticky(NOTE, 440), note)), INK, test='claim:\nstays dry')
    r.doodle('arrow', 9, 230, 5.4, 6.45, pop(520, 1080, 5.4, 20, 0.3), INK)
    r.serif("let's test it", 170, 4.75, 6.45, word(540, 400, 4.75, 2), DEEP, WHITE)

    # 4 (6.3-10.8) the two-tone strip slice into the test: ONE uncut take, a REC corner; [one take, no cuts] / watch closely
    r.clip(1, 6.3, 10.8, 15, still(540, 960))
    n = 8; sh = H / n
    for i in range(n):
        strip = Image.new('RGBA', (W, int(math.ceil(sh)) + 2), (BLUE if i % 2 == 0 else BUTTER) + (255,))
        d = (1 if i % 2 == 0 else -1) * (W + 80)
        r.art(f'slice-{i}', strip, 6.3, 6.6, 50 + i, lambda ts, i=i, d=d: at(540 + d * ease(seg(ts, 6.35, 6.6)), (i + 0.5) * sh))
    rec = Image.new('RGBA', (230, 80), (0, 0, 0, 0)); dr = ImageDraw.Draw(rec)
    dr.rounded_rectangle((0, 0, 229, 79), 18, fill=(20, 20, 22, 170)); dr.ellipse((22, 24, 54, 56), fill=(225, 60, 60))
    for k in range(4):                                              # blinks every half second of the take
        a, b = 7.0 + k, 7.5 + k
        r.art(f'rec-{k}', rec, a, b, 17, still(W - 290 + 115, 290))
        r.plain('REC', 46 / 0.85, a, b, still(W - 290 + 140, 290), WHITE)
    r.boxed('[one take, no cuts]', 76, 6.7, 8.5, pop(400, 330, 6.7, 5), WHITE, 'one take, no cuts')
    r.boxed('watch closely', 80, 8.6, 10.8, pop(360, 330, 8.6, 4), BLUE)

    # 5 (10.8-12.4) graph paper, no video: did it...? the result; the magnifier glides in
    r.art('burst', art_doodle('burst', 1, 600, BUTTER), 10.9, 12.4, 18, pop(320, 640, 10.9))
    did = P.sticky('', 400, pin='pin-head-cream'); fd = pop(320, 640, 10.95, 5)
    r.art('did-note', did, 10.95, 12.4, 19, fd)
    r.plain('did it...?', 400 * 0.17, 10.95, 12.4, Ed.child(fd, B.anchor(P.sticky('did it...?', 400, pin='pin-head-cream'), did)), INK)
    r.serif('the result', 190, 11.2, 12.4, word(560, 1000, 11.2, 2), DEEP, WHITE)

    # 6 (11.6-13.4) the lens carries the result and opens to full frame (the magnifier zooms with it)
    lox, loy, lr = g['lens']
    def lens(ts):
        grow = ease(seg(ts, 12.6, 13.3)); x = lerp(W + 700, 640, ease(seg(ts, 11.6, 12.2)))
        c = lerp2((x + lox, 1400 + loy), (540, 960), grow); return at(c[0], c[1], lerp(lr, 1300, grow) / lr)
    r.clip(2, 12.4, 13.4, 20, lens, size=(int(2 * lr), int(2 * lr)), mask='circle')
    r.art('magnifier', g['mag'], 11.6, 13.3, 21, Ed.child(lens, (-lox, -loy)))

    # 7 (13.4-15.6) the result; the stamp comes down: PASSED; [IT STAYED DRY]
    r.clip(2, 13.4, 15.6, 22, still(540, 960), src=1.0 * SL)
    r.boxed('[IT STAYED DRY]', 84, 13.5, 15.6, pop(540, 360, 13.5, 4), BUTTER, 'IT STAYED DRY')
    r.art('stamp', g['stamp'], 13.95, 14.45, 23, lambda ts: at(330, lerp(-300, 1200, ease(seg(ts, 13.95, 14.12))) - 1700 * ease(seg(ts, 14.25, 14.45)), 1, 12))
    passed(r, 150, 14.3, 15.6, still(330, 1280, 12))             # 140 px higher than the motion test: clear of IG's caption

    # 8 (15.6-end) CTA on the paper: the clip shrinks to a card, the kit round it; Comment / "[KEYWORD]"
    cd, csize, coff = B.hole(M.card(B.keyed((560, 760)), 560, 760, 18))
    def cardf(ts):
        u = ease(seg(ts, 15.6, 15.9)); c = lerp2((W / 2, H / 2), (540, 1020), u); return at(c[0], c[1], lerp(1415 / 560, 1.0, u), -2 * u)
    r.clip(3, 15.6, None, 24, Ed.child(cardf, coff), size=csize)
    r.art('card', cd, 15.6, None, 25, cardf)
    passed(r, 70, 15.9, None, still(700, 720, 14))
    r.art('tubes-cta', M.tubes(g, 1.0), 15.9, None, 26, pop(190, 1520, 15.9, 6))
    r.art('magnifier-small', g['mag_s'], 16.0, None, 27, pop(880, 1500, 16.0, 20))
    r.serif('Comment', 210, 15.9, None, word(540, 330, 15.9, 0), DEEP, WHITE, italic_last=False)
    r.boxed('"[KEYWORD]"', 78, 16.2, None, pop(540, 500, 16.2, -2), BLUE, '"TEST"', round_=1)
    return r

def layers():
    return reel().L
