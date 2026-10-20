"""09 Who it's for, approved 2026-10-18 as the round-4 motion test (build/story7.py, "LOVE").
FULLY EDITABLE build (2026-10-20, build/editable.py; the motion test plays P.SLOW times longer, so script times are
scaled by SLOW): every word is CapCut text (DM Serif Display built-in words with the last word Italic; the hook, the
problem lines, the product name, the three sticky notes and the CTA in Montserrat, the [brackets] on CapCut's text
background); the underline and the arrow are Scrolly Doodles letters (recolour like text); the notebook stage is
CapCut's background colour under a colourless ruled-paper grain; the butterflies, alarm clock, paper balls, gift, mug,
sticky notes and phone are real photos moving on keyframes; the four clips are real clip layers (placeholder cards
until the buyer's clips go in).
CapCut limits: the ray burst behind the alarm clock is a picture (text always sits above pictures; recolour it with
Adjust > HSL); the problem window plays in colour with straight edges on a torn paper mat (no black-and-white, no torn
mask); the butterflies' wings pulse (keyframes scale evenly, so they can't fold sideways); the balloon strings are
straight; the motion-blur swipes are plain slides. The dashed head guide is its own layer: hide it before export."""
import math
from PIL import Image
import editable as Ed
from editable import at, still, then
import editable_b as B
from editable_b import pop, word, out_l, gone, flutter
import play as P
import story7 as S7
import collage as C
from story4 import roundwin
from collage_kit import doodle as art_doodle, raw
from motion_b2 import ease, back_out, seg, lerp, lerp2
from engine import W, H

SL = B.SL; END = S7.SECS['09']
SPEC = dict(num='09', title="Who it's for", subtitle='24 seconds. Four clips: you, the everyday problem, your product, you again.',
            font='montserrat', dir='09-who-its-for', folder='Template 09 - Who its for', project='09 Who its for', cover_at=3.0,
            slots=[('You, talking to camera', 'Head inside the dashed guide, room above it for the butterfly'),
                   ('The everyday problem', 'The moment your buyer struggles without your product'),
                   ('Your product', 'In use, upright, close up'),
                   ('You again, for the ending', 'A second take: smile and nod, head inside the guide')],
            test_clips=[('IMG_1469', 1.0), ('IMG_1430', 1.0), ('IMG_1381', 1.0), ('IMG_1470', 1.0)])
INK, WHITE, WINE, PINK = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['pink']
STAGE = (248, 244, 236)
NOTES = ((((310, 640)), -6, 'for the\n[6am crowd]', 'for the\n6am crowd', 'pin-head-black'),
         ((760, 900), 5, 'for the\n[dog mums]', 'for the\ndog mums', 'pin-head-cream'),
         ((330, 1240), -3, 'for the\n[busy mums]', 'for the\nbusy mums', 'pin-head-white'))

def reel():
    g = S7.setup_09(); r = B.SlowReel(END); cx, cy, rx, ry = P.HEAD; top = (cx, cy - ry - 90)
    r.art('paper-grain', Ed.grain(raw('physical', 'Blank Ruled Notebook Paper.png'), 0.3), 0, None, 1, still(540, 960))
    guide = P.head_guide(0.8); ly = int(cy + ry + 40)
    lab = guide.crop((0, ly - 40, W, ly + 40)); guide.paste((0, 0, 0, 0), (0, ly - 40, W, ly + 40)); guide.alpha_composite(lab, (0, 1560))
    bf0 = g['bf'][0]

    # 1-2 (0-3.6) her; a butterfly lands clear of the words; "if you [always run late]"; THIS IS FOR YOU; swipe at 3.3
    o1 = out_l(3.3)
    r.clip(0, 0, 3.6, 10, then(still(540, 960), o1))
    r.art('HIDE ME head guide 1', guide, 0, 3.6, 40, then(still(540, 960), o1))
    def fly1(ts):
        u = ease(seg(ts, 0.2, 1.3))
        return at(lerp(-150, top[0] + 30, u), lerp(1100, top[1] - 40, u) - 260 * math.sin(math.pi * u), 1, 20 - 20 * u)
    r.art('butterfly-1', bf0, 0, 3.6, 30, then(fly1, flutter(lambda ts: 1 - 0.7 * seg(ts, 1.3, 1.6)), o1))
    r.boxed('if you\n[always run late]', 70, 0.0, 3.6, then(pop(280, 330, 0.0, 5), gone(1.7)), WHITE, 'if you\nalways run late')
    r.serif('this is for you', 118, 1.6, 3.6, then(word(540, 1330, 1.6, 0), o1), WHITE, WINE)
    r.doodle('under', 0, 600, 2.1, 3.6, then(pop(540, 1450, 2.1, 2, 0.3), o1), WINE)

    # 3 (3.6-5.4) stage, no video: the alarm clock rings, ONE burst behind it, crumpled notes circle; [late. again.]
    r.art('burst', art_doodle('burst', 3, 780, WINE), 3.8, 5.4, 18, lambda ts: at(540, 1000, 0.9 + 0.1 * back_out(seg(ts, 3.8, 4.1), 1.5)))
    def ring(ts):
        s = 6 * math.sin(ts * 55) * (1 - seg(ts, 4.4, 4.7)); return at(540 + s, 1000, back_out(seg(ts, 3.6, 3.9), 1.6), -s)
    r.art('clock', g['clock'], 3.6, 5.4, 19, ring)
    for i, b in enumerate(g['balls']):
        def orbit(ts, i=i):
            a = ts * 1.1 + i * 2 * math.pi / 5
            return at(540 + 400 * math.cos(a), 1000 + 480 * math.sin(a), back_out(seg(ts, 4.0 + i * 0.08, 4.25 + i * 0.08)), -a * 30)
        r.art(f'ball-{i}', b, 4.0, 5.4, 20 + i, orbit)
    r.boxed('[late. again.]', 80, 3.8, 5.4, pop(540, 350, 3.8, 5), WHITE, 'late. again.')

    # 4-5 (5.4-8.8) stage: the problem in a window on a torn paper mat; it swaps in place to the product; MEET [PRODUCT NAME]
    mat = Image.new('RGBA', (812, 932), (252, 250, 245, 255)); mat.putalpha(C.torn_mask(mat.size, 5, 18, 'tblr')); mat = C.shadow(mat, (10, 16), 14, 110)
    def win(ts):
        sw = ease(seg(ts, 7.2, 7.5)); return at(540, 1020, back_out(seg(ts, 5.4, 5.7), 1.6) * (1 - 0.12 * math.sin(math.pi * sw)), 2)
    r.art('torn-mat', mat, 5.4, 8.8, 14, win)
    r.clip(1, 5.4, 7.35, 15, win, size=(780, 900))
    r.clip(2, 7.35, 8.8, 16, win, size=(780, 900), src=0.15 * SL)
    r.boxed('[you lose your\nkeys. again.]', 72, 5.6, 7.2, pop(540, 380, 5.6, 4), WHITE, 'you lose your\nkeys. again.')
    r.serif('meet', 200, 7.4, 10.4, word(540, 340, 7.4, 0), PINK, WINE, italic_last=False)
    r.boxed('[PRODUCT NAME]', 76, 7.7, 10.4, pop(540, 520, 7.7, 4), WINE, 'the 5-minute styler')

    # 6 (8.8-10.4) the product floats up in a round window on a string with a gift; an arrow points at it
    rw = roundwin(B.keyed((520, 520)), 520); rwin, rsize, roff = B.hole(rw, ellipse=True)
    for name, item, (x, y), anc, ph, rise, z in (('prod', rwin, (560, 860), (560, 1900), 0, (8.8, 9.3, 2400), 22),
                                                 ('gift', g['gift'], (880, 1250), (580, 1900), 1.7, (9.0, 9.5, 2400), 25)):
        f = B.bob(x, y, ph, rise); st, so, r0 = B.string(item, (x, y), anc)
        r.art(f'string-{name}', st, 8.8, 10.4, z - 2, Ed.child(f, so, r0))
        if name == 'prod': r.clip(2, 8.8, 10.4, z - 1, Ed.child(f, roff), size=rsize, mask='circle', src=(8.8 - 7.2) * SL)
        r.art(f'balloon-{name}', item, 8.8, 10.4, z, f)
    r.doodle('arrow', 9, 230, 9.5, 10.4, pop(150, 900, 9.5, -90, 0.3), WINE)

    # 7 (10.4-13.0) stage, no video: sticky notes pinned one at a time; swipes right at 12.7
    o7 = B.out_r(12.7)
    r.art('mug', g['mug'], 10.4, 13.0, 18, then(pop(820, 1560, 10.4, -6, wiggle=2), o7))
    blank_notes = [P.sticky('', 400, pin=pn) for *_, pn in NOTES]
    for i, ((x, y), rr, words, test, pn) in enumerate(NOTES):
        t0 = 10.6 + i * 0.4; f = then(pop(x, y, t0, -rr), o7)
        r.art(f'note-{i}', blank_notes[i], t0, 13.0, 20 + i, f)
        r.plain(words, 54, t0, 13.0, Ed.child(f, B.anchor(P.sticky(words, 400, pin=pn), blank_notes[i])), INK, test=test)

    # 8 (12.7-14.6) her; her Reel on a phone at the bottom, the butterfly perched on top of it (tech)
    r.clip(0, 12.7, 14.6, 11, then(still(540, 960), B.in_l(12.7)), src=(12.7 - 10.0) * SL)
    ph, ssize, soff = B.device(S7.PHONE, 360)
    def phone(ts): return at(800, lerp(2300, 1520, back_out(seg(ts, 13.1, 13.5), 1.4)), 1, 6)
    r.clip(2, 13.0, 14.6, 12, Ed.child(phone, soff), size=ssize)
    r.art('phone', ph, 13.0, 14.6, 13, phone)
    perch = (800 - 30, 1520 - ph.height / 2 - 40)
    def fly8(ts):
        u = ease(seg(ts, 13.6, 14.2)); p = lerp2((top[0] + 30, top[1] - 40), perch, u); return at(p[0], p[1], 1, 0)
    r.art('butterfly-8', bf0, 12.7, 14.6, 30, then(fly8, B.in_l(12.7), flutter(lambda ts: 0.3 + 0.7 * math.sin(math.pi * ease(seg(ts, 13.6, 14.2))))))

    # 9 (14.6-end) butterflies gather from a circle into a crown; sound like you? / Comment / "[KEYWORD]"
    r.clip(3, 14.6, None, 10, still(540, 960))
    r.art('HIDE ME head guide 2', guide, 14.6, None, 40, still(540, 960))
    for i, (pt, bf) in enumerate(zip(P.crown_points(6, 170), g['bf'])):
        def crown(ts, i=i, pt=pt):
            a0 = i * math.pi / 3 + ts * 2; orb = (540 + 430 * math.cos(a0), 800 + 430 * math.sin(a0))
            u = ease(seg(ts, 14.7 + i * 0.08, 15.5 + i * 0.08)); p = lerp2(orb, pt, u); return at(p[0], p[1], 1, -(i - 2.5) * 10)
        r.art(f'crown-{i}', bf, 14.6, None, 30 + i, then(crown, flutter(lambda ts, i=i: 1 - 0.6 * ease(seg(ts, 14.7 + i * 0.08, 15.5 + i * 0.08)), i)))
    r.boxed('sound like you?', 72, 15.4, None, pop(540, 1030, 15.4, 4), WHITE)
    r.serif('Comment', 200, 15.7, None, word(540, 1200, 15.7, 0), WHITE, WINE, italic_last=False)
    r.boxed('"[KEYWORD]"', 76, 16.1, None, pop(540, 1360, 16.1, -2), WINE, '"BRUSH"', round_=1)
    return r

def layers():
    return reel().L
