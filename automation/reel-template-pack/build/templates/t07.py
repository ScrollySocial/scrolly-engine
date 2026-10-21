"""07 How big is it really?, approved 2026-10-19 (motion test build/motion_07.py). FULLY EDITABLE build (2026-10-20,
build/editable.py): every word is CapCut text (DM Serif Display built-in words, last word Italic; Montserrat for the
"this big?" line, the reference sizes, one hand, on screen / in real life, water-bottle size, the exact size (twice),
the ruler's INCHES label, the keyword and the shop line, the [brackets] on CapCut's text background); the measuring
arrows are Scrolly Doodles letters (recolour like text); the white pegboard stage is CapCut's background colour under a
colourless pegboard grain; the phone, mug, ruler, photo cards and the standing phone are real photos moving on
keyframes; the four clips are real clip layers (placeholder cards until the buyer's clips go in): the product alone
(the size-jumping window, the phone screen, the "in real life" window, the card on the grid), in my hand, in use, and
the set at the end.
CapCut limits: the torn checks strip down the right edge is a picture (recolour with Adjust > HSL); the window's size
jumps keep one shape (it scales evenly); the strip-slice transitions are tinted strips closing over the old scene and
sliding apart (pictures); the motion-blur swipes are plain slides and the diagonal wipe a diagonal slide; the camera's
dive into the card moves every piece of the stage on keyframes, the grain stays put."""
from PIL import Image, ImageDraw, ImageOps
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import editable_a as EA
import motion_07 as M
import play as P
import play_extra as X
import storyboard_b2 as S
from motion_b2 import ease, back_out, seg, lerp, torn_band

SPEC = dict(num='07', title='How big is it really?', subtitle='20 seconds. Four clips: your product alone, in your hand, in use, the set.',
            font='montserrat', dir='07-how-big-is-it', folder='Template 07 - How big is it really', project='07 How big is it really',
            cover_at=1.0,
            slots=[('Your product alone', 'Your product on a plain surface, upright'), ('In your hand', 'Holding it so its size shows'),
                   ('In use', 'Worn, used or on a shelf'), ('The set', 'All of them together, or on a ruler')],
            test_clips=[('IMG_1471', 0.5), ('IMG_1471', 6.0), ('IMG_1474', 10.0), ('IMG_1522', 0.0)])
W, H = 1080, 1920
INK, WHITE, BABY = M.INK, (255, 255, 255), X.BABY
STAGE = (238, 238, 235)                  # the pegboard's white
GREY = (70, 66, 60)

def word(x, y, t0, r=0.0): return pop_in(x, y, t0, r, 0.22, 1.8, 18)
def swipe_out(t0, d=1): return slide(t0, t0 + 0.25, -d * W)
def swipe_in(t0, d=1): return enter(t0, t0 + 0.25, d * W)

def reel():
    g = M.setup(); r = Ed.Reel(M.HOLDS, 12.0)
    r.art('pegboard-grain', Ed.grain(S.raw('images', 'White pegboard grid texture-5.png'), 0.28), 0, None, 1, still(540, 960))
    checks = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', 'Wobbly hand-drawn black and white checkerboard-24.png')), INK, BABY).convert('RGBA')
    band = torn_band(checks, (240, H + 40), 9, 'l', 18)
    band_c = (W - 190 + 120, -20 + (H + 40) / 2)
    r.art('checks-band', band, 0, None, 2, still(*band_c))

    # 1 (0-1.7) the product in a photo card that jumps size: small, huge, medium; "how big / is it really?"; swipe at 1.45
    o1 = swipe_out(1.45)
    cardim, csize, coff = EA.card_frame(520, 720, 14, 0)
    ks = (300 / 520, 860 / 520, 1.0); rots = (3, -2, 2)
    def jump(ts):
        i = min(2, int(ts / 0.45)); k = back_out(seg(ts, i * 0.45, i * 0.45 + 0.25), 1.6)
        return at(520, 980, lerp(ks[max(0, i - 1)], ks[i], k) if i else ks[0], rots[i])
    jump = then(jump, o1)
    r.clip(0, 0, 1.7, 10, Ed.child(jump, coff), size=csize)
    r.art('card-jump', cardim, 0, 1.7, 11, jump)
    r.boxed('this big?', 54, 0.1, 1.7, then(pop_in(820, 600, 0.1, -5), o1), INK)
    r.serif('how big', 184, 0.0, 1.7, then(word(500, 330, 0.0, 3), o1), INK, WHITE)
    r.serif('is it really?', 120, 0.3, 1.7, then(word(520, 1440, 0.3, -2), o1), INK, WHITE)

    # 2 (1.45-3.1) GRID, no video: "next to things you own"; a phone and a mug drop onto the grid with their sizes
    i2, o2 = swipe_in(1.45), slide(2.85, 3.1, -W - 300, -420)
    r.serif('next to', 138, 1.75, 3.1, then(word(480, 330, 1.75, 3), i2, o2), INK, WHITE)
    r.boxed('things you own', 56, 1.95, 3.1, then(pop_in(480, 470, 1.95, -2), i2, o2), INK)
    for k, (obj, words, test, (x, y), t0, rr) in enumerate(((g['phone_b'], '[6 in phone]', '6 in phone', (300, 1000), 2.1, 6),
                                                            (g['mug'], '[mug]', 'mug', (720, 1050), 2.35, -5))):
        r.art(f'ref-{test.split()[-1]}', obj, 1.45, 3.1, 20 + k, then(lambda ts, x=x, y=y, t0=t0, rr=rr: at(x, lerp(-400, y, back_out(seg(ts, t0, t0 + 0.3), 1.5)), 1, rr), i2, o2))
        r.boxed(words, 44, t0 + 0.3, 3.1, then(pop_in(x, y + 300, t0 + 0.3, rr / 2), i2, o2), WHITE, test)

    # 3 (2.85-4.6) in my hand, full frame; the double-headed arrows measure it; [one hand]; strips at 4.35
    r.clip(1, 2.85, 4.5, 15, still(540, 960))     # under scene 2, which slides off it
    r.serif('in my hand', 115, 3.2, 4.5, word(520, 330, 3.2, 3), INK, WHITE)
    r.doodle('arrow', 5, 560, 3.5, 4.5, pop_in(520, 1160, 3.5, 0, 0.35), WHITE)
    r.doodle('arrow', 6, 150, 3.7, 4.5, pop_in(150, 1030, 3.7, 0, 0.35), WHITE)
    r.boxed('[one hand]', 60, 3.9, 4.5, pop_in(520, 1360, 3.9, 2), INK, 'one hand')
    EA.strips(r, 'slice-1', 4.35, 4.6, (INK, GREY), 80)

    # 4 (4.5-6.1) GRID, tech: the phone shows the product (on screen), the real clip beside it (in real life); an arrow
    o4 = swipe_out(5.85)
    im, _, _ = P.device(M.PHONE, 340); phone, ssize, soff = Ed.device_hole(P.die_cut(im, 8))
    ph = then(lambda ts: at(270, lerp(2400, 960, back_out(seg(ts, 4.6, 4.9), 1.5)), 1, 3), o4)
    r.clip(0, 4.5, 6.1, 30, Ed.child(ph, soff), size=ssize, src=1.0)
    r.art('phone', phone, 4.5, 6.1, 31, ph)
    rl, rsize, roff = EA.card_frame(380, 680, 14, 0)
    rf = then(lambda ts: at(lerp(1500, 740, back_out(seg(ts, 4.75, 5.05), 1.5)), 960, 1, -3), o4)
    r.clip(0, 4.5, 6.1, 32, Ed.child(rf, roff), size=rsize, src=1.0)
    r.art('card-irl', rl, 4.5, 6.1, 33, rf)
    r.boxed('on screen', 50, 5.0, 6.1, then(pop_in(270, 1420, 5.0, 3), o4), INK)
    r.boxed('in real life', 50, 5.15, 6.1, then(pop_in(720, 1420, 5.15, -3), o4), INK)
    r.doodle('arrow', 2, 230, 5.35, 6.1, then(pop_in(500, 620, 5.35, 0, 0.35), o4), INK)

    # 5 (5.85-7.6) in use, full frame; the measuring arrow carried in; [water-bottle size]; strips (vertical) at 7.35
    i5 = swipe_in(5.85)
    r.clip(2, 5.85, 7.5, 40, then(still(540, 960), i5))
    r.doodle('arrow', 6, 150, 6.2, 7.5, pop_in(460, 1150, 6.2, 0, 0.35), WHITE)
    r.boxed('[water-bottle size]', 56, 6.4, 7.5, pop_in(520, 380, 6.4, 2), INK, 'paperback size')
    EA.strips(r, 'slice-2', 7.35, 7.6, (GREY, INK), 80, n=6, vertical=True)

    # 6 (7.5-9.0) GRID, no video: the product still on the grid, the ruler slides under it, the size stamps in;
    #   the camera dives into the card
    cam6 = EA.zoom_into(8.65, 9.0, (540, 900), 2.2)
    sc, ssz, sof = EA.card_frame(620, 574, 14, 0)
    sf = then(lambda ts: at(540, 900, back_out(seg(ts, 7.6, 7.9), 1.4), 2), cam6)
    r.clip(0, 7.5, 9.0, 50, Ed.child(sf, sof), size=ssz, src=0.5)
    r.art('card-still', sc, 7.5, 9.0, 51, sf)
    ruler = P.thing('Pale wooden ruler on white-153.png', 900, None, None)
    rlf = then(lambda ts: at(lerp(-600, 520, ease(seg(ts, 7.8, 8.2))), 1290), cam6)
    r.art('ruler', ruler, 7.5, 9.0, 52, rlf)
    lab = P.sticker('INCHES', 34, INK); blank = Image.new('RGBA', lab.size, (0, 0, 0, 0))
    ImageDraw.Draw(blank).rounded_rectangle((6, 6, lab.width - 7, lab.height - 7), (lab.height - 12) // 3, fill=INK + (255,))
    lab_f = Ed.child(rlf, (ruler.width * 0.32, 0))
    r.art('ruler-label', P.die_cut(blank.crop(blank.getbbox()), 6, False), 7.5, 9.0, 53, lab_f)
    r.plain('INCHES', 34 * 0.7 / 0.85, 7.5, 9.0, lab_f, WHITE)
    r.serif('exactly', 156, 7.9, 9.0, then(word(480, 330, 7.9, 3), cam6), INK, WHITE)
    r.plain('[9 x 4 in]', 120 / 0.85, 8.3, 9.0, then(pop_in(520, 1430, 8.3, 4), cam6), INK, WHITE, test='6 x 4 in')
    r.doodle('arrow', 5, 520, 8.2, 9.0, then(pop_in(540, 560, 8.2, 0, 0.35), cam6), INK)

    # 7 (9.0-10.2) the set, full frame (the camera settles); the size carried as a line; an arrow under it
    def settle(ts):
        s = lerp(1.5, 1, ease(seg(ts, 9.0, 9.4))); return at(540, 960, s)
    r.clip(3, 9.0, None, 60, settle)
    r.boxed('[9 x 4 in]', 60, 9.1, None, pop_in(540, 380, 9.1, 3), INK, '6 x 4 in')
    r.doodle('arrow', 5, 520, 9.4, 10.2, pop_in(540, 1300, 9.4, 0, 0.35), WHITE)

    # 8 (10.2-end) CTA: Comment / "[SIZE]" / [shop link in bio]
    r.serif('Comment', 166, 10.3, None, word(520, 1060, 10.3, 3), INK, WHITE)
    r.boxed('"[SIZE]"', 64, 10.55, None, pop_in(520, 1220, 10.55, -2), WHITE, '"SIZE"')
    r.boxed('[shop link in bio]', 52, 10.75, None, pop_in(500, 1340, 10.75, 2), INK, 'shop link in bio')
    return r

def layers():
    return reel().L
