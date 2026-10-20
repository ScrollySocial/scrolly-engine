"""10 Three people to gift it to, approved 2026-10-18 as the round-4 motion test (build/story7.py, "no changes").
FULLY EDITABLE build (2026-10-20, build/editable.py; the motion test plays P.SLOW times longer, so script times are
scaled by SLOW): every word is CapCut text (DM Serif Display built-in words, Italic key words; stuck on a, found it,
this one works for, the three names, the CTA and gift wrap in Montserrat, the [brackets] on CapCut's text background,
FOR YOU on the gift too); the underline, the arrow, the three crosses and the ? on the gift are Scrolly Doodles letters
(recolour like text); the stage is CapCut's background colour (butter) under a colourless kraft grain, then a tissue
grain for the ending; the gifts, candle, mug, scarf, phone, oak table, striped wall and Polaroids are real photos
moving on keyframes; the six clips are real clip layers (placeholder cards until the buyer's clips go in): the shop
scroll and the product on the phone screen, the three people in the Polaroid windows.
CapCut limits: the oak table and the striped wall are photos (recolour them with Adjust > HSL); the oak table slides
up instead of wiping in; the motion-blur swipes are plain slides; the balloon strings are straight."""
import math
from PIL import Image
import editable as Ed
from editable import at, still, then
import editable_b as B
from editable_b import pop, word, out_l, in_r
import play as P
import story7 as S7
from collage_kit import raw
from motion_b2 import ease, back_out, seg, lerp, lerp2
from engine import W, H

SL = B.SL; END = S7.SECS['10']
SPEC = dict(num='10', title='Three people to gift it to', subtitle='24 seconds. Six clips: wrapping, your shop, your product, three people.',
            font='montserrat', dir='10-three-people-to-gift-it-to', folder='Template 10 - Three people to gift it to',
            project='10 Three people to gift it to', cover_at=1.2,
            slots=[('Wrapping a gift', 'Hands wrapping or holding a gift, upright'),
                   ('Your shop, scrolling', 'A screen recording of you scrolling your own shop'),
                   ('Your product', 'Your product, upright, close up'),
                   ('Person 1', 'Someone it suits, smiling at the camera'),
                   ('Person 2', 'A second person'),
                   ('Person 3', 'A third person')],
            test_clips=[('IMG_1454', 1.0), ('IMG_1417', 0.5), ('IMG_1456', 1.0), ('IMG_1469', 1.0), ('IMG_1470', 1.0), ('IMG_1469', 4.0)])
INK, WHITE, WINE, BUTTER = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['butter']
STAGE = BUTTER
NAMES = (('[your friend]', 'my sister'), ('[your mum]', 'my mum'), ('[your dad]', 'my best friend'))
INKC = (28, 27, 26)

def polaroid(frame, w, pin=None):
    """The blank Polaroid with its photo window punched (the clip goes under it): (image, window size, offset)."""
    pf = S7.S.fitw(frame, w); bb = S7.g_win(pf); pf = pf.copy(); pf.paste(B.KEY + (255,), bb)
    return B.hole(P.pinned(pf, 0, pin) if pin else pf)

def reel():
    g = S7.setup_10(); r = B.SlowReel(END)
    r.art('kraft-grain', Ed.grain(raw('images', 'Partly unrolled kraft paper roll-14.png', (0.5, 0.56, 0.74, 0.7)), 0.22), 0, 13.1, 1, still(540, 960))
    r.art('tissue-grain', Ed.grain(raw('images', 'Blush Pink Tissue Paper Texture-9.png'), 0.18), 13.1, None, 1, then(still(540, 960), in_r(13.1)))
    box = P.thing('Kraft paper cube gift with twine-38.png', 380, 'dots', BUTTER, scale=0.4, strength=0.9)

    # 1 (0-2.2) the gift clip; the ? gift swings in on twine; "stuck on a" gift?; one underline; swipe at 1.9
    o1 = out_l(1.9)
    r.clip(0, 0, 2.2, 10, then(still(540, 960), o1))
    pv = (760, -40)
    def swing(ts):
        L_ = lerp(300, 820, back_out(seg(ts, 0.15, 0.7), 1.3)); a = 26 * math.sin(ts * 3.2) * math.exp(-0.9 * ts); ar = math.radians(a)
        return at(pv[0] + L_ * math.sin(ar), pv[1] + L_ * math.cos(ar), 1, -a)
    fs = then(swing, o1); tw = Image.new('RGBA', (12, 1400), (0, 0, 0, 0)); tw.paste(S7.TWINE + (255,), (3, 0, 9, 1400))
    r.art('twine', tw, 0, 2.2, 19, Ed.child(fs, (0, -0.42 * box.height - 700)))
    r.art('gift-q', box, 0, 2.2, 20, fs)
    r.doodle('glyph', 8, 120, 0, 2.2, Ed.child(fs, (0, 0.05 * box.height)), WINE, WHITE)
    r.boxed('stuck on a', 76, 0.1, 2.2, then(pop(330, 300, 0.1, 5), o1))
    r.text('dmsi', 250, 'gift?', 0.4, 2.2, then(pop(330, 480, 0.4, 3), o1), BUTTER, stroke=(WINE, 0.03), shadow=True)
    r.doodle('under', 0, 560, 0.9, 2.2, then(pop(330, 640, 0.9, 2, 0.3), o1), WINE)

    # 2 (1.9-5.6) the kraft stage, the ? gift carried in: the usual? candle, mug, scarf, each crossed out
    i2 = in_r(1.9)
    fb = then(still(860, 1660), i2); fb = (lambda f: lambda ts: dict(f(ts), s=0.7, r=-8))(fb)
    r.art('gift-q2', box, 1.9, 5.6, 12, fb)
    r.doodle('glyph', 8, 84, 1.9, 5.6, Ed.child(fb, (0, 0.05 * box.height)), WINE, WHITE)
    for i, (obj, xy, rr) in enumerate(zip(g['usual'], ((300, 800), (790, 1000), (360, 1400)), (-6, 5, -4))):
        t0 = 2.6 + i * 0.2
        def usual(ts, xy=xy, rr=rr, i=i, t0=t0):
            fly = ease(seg(ts, 5.4, 5.8)); return at(xy[0] + (1 if i % 2 else -1) * 1300 * fly, xy[1] - 300 * fly, back_out(seg(ts, t0, t0 + 0.3), 1.6), -(rr + 40 * fly))
        r.art(f'usual-{i}', obj, t0, 5.8, 13 + i, usual)
        r.doodle('tick', 3 + i, 300, 3.4 + i * 0.45, 5.8, lambda ts, u=usual, t1=3.4 + i * 0.45: dict(u(ts), s=back_out(seg(ts, t1, t1 + 0.3), 2.2)), WINE)
    r.serif('the usual?', 190, 2.3, 5.4, word(540, 360, 2.3, 2), WHITE, WINE)

    # 3 (5.4-8.0) the oak table rises; the phone lies on it, the shop scroll on its screen; [found it.]
    ph, ssize, soff = B.device(S7.PHONE, 640)
    def oak(ts): return at(540, 960 + H * (1 - ease(seg(ts, 5.4, 5.8))))
    r.art('oak-table', S7.bg('Light oak wood grain texture-2.png'), 5.4, 10.4, 16, then(oak, out_l(10.1)))
    def phone(ts):
        u = ease(seg(ts, 8.0, 8.5))
        return at(lerp(560, 540, u), lerp(lerp(2500, 1060, back_out(seg(ts, 5.5, 5.9), 1.2)), 960, u), lerp(1, 3.4, u), lerp(4, 0, u))
    r.clip(1, 5.4, 8.0, 20, Ed.child(phone, soff), size=ssize)
    r.clip(2, 8.0, 8.5, 20, Ed.child(phone, soff), size=ssize)
    r.art('phone', ph, 5.4, 8.5, 21, phone)
    r.boxed('[found it.]', 84, 6.9, 8.0, pop(290, 330, 6.9, 5), WHITE, 'found it.')
    r.doodle('arrow', 9, 240, 7.0, 8.0, pop(230, 560, 7.0, -150, 0.3), WINE)

    # 4 (8.5-10.4) the product clip, full frame; [this one works for] all 3; swipe at 10.1
    o4 = out_l(10.1)
    r.clip(2, 8.5, 10.4, 22, then(still(540, 960), o4), src=0.5 * SL)
    r.boxed('this one works for', 78, 8.6, 10.4, then(pop(540, 1180, 8.6, 4), o4))
    r.text('dmsi', 260, 'all 3', 8.8, 10.4, then(pop(540, 1360, 8.8, 2), o4), BUTTER, stroke=(WINE, 0.03), shadow=True)

    # 5 (10.1-13.4) the striped wall: 3 people; three Polaroids pinned one at a time, a name under each
    i5, o5 = in_r(10.1), out_l(13.1)
    r.art('striped-wall', g['wall'], 10.1, 13.4, 17, then(still(540, 960), i5, o5))
    r.serif('3 people', 200, 10.5, 13.4, then(word(540, 330, 10.5, 2), o5), WHITE, WINE)
    for i, ((xy, rr), (words, test)) in enumerate(zip(S7.POL, NAMES)):
        t0 = 10.9 + i * 0.5; pin = ('pin-head-cream', 'pin-head-black', 'pin-head-white')[i]
        pol, psize, poff = polaroid(g['frame'], 400, pin)
        f = then(lambda ts, xy=xy, rr=rr, t0=t0: at(xy[0], lerp(xy[1] - 120, xy[1], back_out(seg(ts, t0, t0 + 0.3), 1.5)), 1 if ts >= t0 else 0, -rr), o5)
        r.clip(3 + i, t0, 13.4, 23 + 2 * i, Ed.child(f, poff), size=psize, src=(t0 - 10.4) * SL)
        r.art(f'polaroid-{i}', pol, t0, 13.4, 24 + 2 * i, f)
        r.boxed(words, 64, t0 + 0.2, 13.4, then(pop(*S7.NAME_AT[i], t0 + 0.2, 2 - (-3, 2, -2)[i]), o5), BUTTER, test)

    # 6-7 (13.1-end) butter tissue: the Polaroids float up as balloons; the FOR YOU gift holds the strings; the CTA
    up = lambda ts: ease(seg(ts, 14.4, 15.0))
    for i, (xy0, xy1) in enumerate((((300, 600), (220, 420)), ((780, 820), (540, 330)), ((330, 1120), (860, 420)))):
        pol, psize, poff = polaroid(g['frame'], 400); ph_ = 1.7 * i; rise = (13.4 + i * 0.25, 14.0 + i * 0.25)
        def fl(ts, xy0=xy0, xy1=xy1, ph_=ph_, rise=rise):
            u = up(ts); x, y = lerp2(xy0, xy1, u); y = lerp(2400, y, ease(seg(ts, *rise)))
            return at(x + 14 * math.sin(ts * 1.6 + ph_), y + 18 * math.sin(ts * 2.1 + ph_), lerp(0.9, 0.75, u), -6 * math.sin(ts * 1.4 + ph_))
        st, so, r0 = B.string(pol, xy1, (540 + (i - 1) * 40, 2900), INKC, 12)   # long enough at 0.75 scale
        r.art(f'string-{i}', st, 13.4, None, 30 + 3 * i, Ed.child(fl, so, r0))
        r.clip(3 + i, 13.4, None, 31 + 3 * i, Ed.child(fl, poff), size=psize, src=(13.4 - 10.4) * SL)
        r.art(f'balloon-{i}', pol, 13.4, None, 32 + 3 * i, fl)
    box2 = P.thing('Kraft paper cube gift with twine-38.png', 400, 'dots', WINE, scale=0.4, strength=0.8)
    fb2 = pop(540, 1390, 14.4, 0, wiggle=2)                      # higher than the motion test: FOR YOU clear of IG's caption
    r.art('gift-for-you', box2, 14.4, None, 40, fb2)
    r.boxed('FOR YOU', 48, 14.4, None, Ed.child(fb2, (0, 0.05 * box2.height)), WHITE)
    r.serif('Comment', 210, 14.7, None, word(540, 810, 14.7, 0), WINE, WHITE, italic_last=False)
    r.boxed('"[KEYWORD]"', 78, 15.0, None, pop(540, 990, 15.0, -2), WINE, '"GIFT"', round_=1)
    r.boxed('[gift wrap available]', 66, 15.2, None, pop(540, 1110, 15.2, 4), WHITE, 'gift wrap available')
    return r

def layers():
    return reel().L
