"""21 Small batch, approved 2026-10-19 (round 3, motion test build/motion_21.py). FULLY EDITABLE build (2026-10-20,
build/editable.py, like t24): every word is CapCut text (DM Serif Display built-in words "only", "made this week",
"each one numbered", "one at a time", "small batch" on the seal, "next batch", "Comment"; Montserrat [brackets]: the
batch size after "only", how each one is made, the next batch date, when yours ships, the keyword and the product
name); the edition number the pen writes ("No. [07] of [24]") is now editable DM Serif Italic text typing in under the
pen (CapCut's Typewriter), so buyers put in their own numbers; the sparkles, ring and underline are Scrolly Doodles
letters (recolour like text); the pink stage is CapCut's background colour under a colourless tissue grain; the
vintage card, fountain pen, gold seal and calendar page are real photos moving on keyframes; the slow pass plays in the
card's window; the five clips are real clip layers (placeholder cards until the buyer's clips go in).
CapCut limits: the number types in letter by letter rather than in handwriting (Ink Free can't ship with the template);
the card's flip over is a turn (it shrinks away and the calendar lands: CapCut can't squash a layer on one side); the
pen's nib sits under the number (text always draws above pictures); the swipes are plain slides (no motion blur).
Improved on the flipbook build: the edition number was artwork, now it's editable."""
from PIL import Image
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import motion_21 as M
import play as P
import storyboard_b2 as S
import collage as C

SPEC = dict(num='21', title='Small batch', subtitle='21 seconds. Five clips: the batch, one picked up, a slow pass, packing, the end.',
            font='montserrat', dir='21-small-batch', folder='Template 21 - Small batch', project='21 Small batch', cover_at=0.8,
            slots=[('The batch', 'The whole batch, laid out'), ('Picking one', 'Picking one up'), ('A slow pass', 'A slow pass over the batch'),
                   ('Packing', 'Packing one up'), ('The end', 'You or your product')],
            test_clips=[('IMG_1522', 0.0), ('IMG_1471', 5.5), ('IMG_1522', 0.0), ('IMG_1474', 15.0), ('IMG_1472', 1.0)])
WHITE, PINK, WINE, INK = (255, 255, 255), M.PINK, M.WINE, M.INK
W, H = 1080, 1920
CX, CY = M.CARD_C
NUM_W = 640                                                     # the written number's width (the pen's travel)

def pop(x, y, t0, r=0.0): return pop_in(x, y, t0, r, 0.22, 1.8, 18)

def reel():
    r = Ed.Reel(M.HOLDS, 14.0)
    r.art('tissue-grain', Ed.grain(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png')), 0, None, 1, still(540, 960))
    pc = S.raw('images', 'Blank vintage cream postcard-111.png'); w_, h_ = pc.size
    card0 = pc.crop((int(w_ * 0.1), int(h_ * 0.12), int(w_ * 0.9), int(h_ * 0.88))).resize((M.CARD_W, int(M.CARD_W * 0.66))).convert('RGBA')
    cw, ch = card0.size; card = C.shadow(card0, (10, 18), 16, 110)
    pen = C.shadow(S.fitw(Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Vintage fountain pen with gold nib-51.png').convert('RGBA'), 760), (10, 22), 14, 110)
    seal = P.die_cut(P.raw_cut('Blank gold foil seal sticker-175.png', 230), 6)
    NUM = ('No. [07] of [24]', 'No. 07 of 24')
    def number(a, b, f, typewriter=None):
        r.text('dmsi', 120, NUM, a, b, f, WINE, typewriter=typewriter)
    def seal_on(a, b, f, z):
        r.art(f'seal-{a}', seal, a, b, z, f); r.serif('small\nbatch', 52, a, b, f, WINE, None, italic_last=False)
    def pen_f(nib):
        """The pen with its nib at nib(ts), held at a writing angle (motion_21.pen_at)."""
        a = Ed.math.radians(35)
        return lambda ts: (lambda n: at(n[0] + 380 * Ed.math.cos(a), n[1] - 380 * Ed.math.sin(a), 1, -35))(nib(ts))

    # 1 (0-1.8) the batch, full frame; "only [24]" / "made this week", sparkles; swipes out left
    o1 = slide(1.6, 1.8, -W)
    r.clip(0, 0, 1.8, 10, then(still(540, 960), o1))
    only = P.caption('only [24]', 260, WHITE)                    # motion_21's layout: "only" and the number side by side
    r.serif('only', 239, 0.05, 1.8, then(pop(540 + only[0][1], 360, 0.05, 3), o1), WHITE, WINE)
    r.plain('[24]', 230, 0.05, 1.8, then(pop(540 + only[1][1] - 50, 370, 0.18, 3), o1), WHITE, INK, test='24')
    r.serif('made this week', 129, 0.35, 1.8, then(pop(540, 560, 0.35, -2), o1), WHITE, WINE)
    for i, (x, y) in enumerate([(130, 300), (960, 260), (990, 650), (100, 700)]):
        ti = 0.4 + i * 0.1
        def sp(ts, x=x, y=y, i=i, ti=ti):
            k = Ed.back_out(Ed.seg(ts, ti, ti + 0.25), 2.2) * (0.8 + 0.25 * Ed.math.sin((ts - ti) * 7 + i * 1.7)) if ts >= ti else 0
            return at(x, y, k * (0.7 + 0.3 * (i % 3) / 2), -15 * Ed.math.sin(ts * 2 + i))
        r.doodle('icon', 8, 160, ti, 1.8, then(sp, o1), PINK)

    # 2 (1.8-3.8) PAPER: the vintage card lands; the fountain pen writes "No. [07] of [24]"; "each one / numbered"
    # 3 (3.8-5.4) the card (carried) shrinks into the corner over the picked-up clip; the gold seal sticks on
    o3 = slide(5.2, 5.4, W)
    def cf(ts):
        k = Ed.back_out(Ed.seg(ts, 1.8, 2.15), 1.3); u = Ed.ease(Ed.seg(ts, 3.8, 4.2)); v = Ed.ease(Ed.seg(ts, 3.6, 3.8))
        x = Ed.lerp(CX, 300, u); y = Ed.lerp(Ed.lerp(Ed.lerp(2400, CY, k), 1040, v), 400, u)
        return at(x, y, Ed.lerp(1, 0.42, u), Ed.lerp(3, 0, v) + 6 * u)
    cf = then(cf, o3)
    r.art('card-1', card, 1.8, 5.4, 30, cf)
    number(2.3, 5.4, cf, typewriter=1.1)
    nib = lambda ts: (CX - NUM_W / 2 + NUM_W * Ed.seg(ts, 2.3, 3.4), CY + 10 - 25 * Ed.math.sin(Ed.seg(ts, 2.3, 3.4) * 30) * (2.3 < ts < 3.4))
    r.art('pen-1', pen, 2.1, 3.7, 35, pen_f(nib))
    o2 = slide(3.6, 3.8, -W - 300, -300)
    r.serif('each one', 156, 1.9, 3.8, then(pop(520, 360, 1.9, 3), o2), WINE, WHITE)
    r.serif('numbered', 202, 2.1, 3.8, then(pop(560, 560, 2.1, -2), o2), WINE, WHITE, italic_last=False)
    r.clip(1, 3.6, 5.4, 5, then(still(540, 960), o3))
    seal_on(4.4, 5.4, then(lambda ts: at(500, 545, Ed.lerp(2.0, 0.8, min(1, Ed.back_out(Ed.seg(ts, 4.4, 4.7), 2.2))) if ts >= 4.4 else 0, 12), o3), 60)

    # 4 (5.2-7.0) the slow pass inside the card's window, the seal on its corner; "one at a time" + [each one signed by hand]
    # 5 (7.0-8.4) the camera moves in on the card; the pass full frame from 7.5; swipes out left
    i4 = enter(5.2, 5.4, -W)
    zoom = lambda ts: Ed.lerp(1, 1.5, Ed.ease(Ed.seg(ts, 7.0, 7.5)))
    c4 = then(lambda ts: at(CX, CY, zoom(ts), 3), i4)
    r.art('card-2', card, 5.2, 7.5, 32, c4)
    r.clip(2, 5.2, 7.5, 33, c4, size=(cw - 80, ch - 80))
    seal_on(5.2, 7.5, then(lambda ts: at(CX + 300 * zoom(ts), CY - 230 * zoom(ts), 0.9 * zoom(ts), 12), i4), 61)
    r.serif('one at a time', 152, 5.3, 7.0, pop(540, 400, 5.3, 3), WINE, WHITE)
    r.boxed('[each one signed by hand]', 60, 5.5, 7.0, pop_in(540, 1450, 5.5, 2), WINE, 'each one signed by hand')
    r.clip(2, 7.5, 8.4, 45, then(still(540, 960), slide(8.2, 8.4, -W)), src=r.R(7.5) - r.R(5.2))

    # 6 (8.2-10.0) PAPER: the numbered card turns away; a real calendar page lands; the pen rings the next batch date
    o6 = slide(9.8, 10.0, -W - 300, -300); i6 = enter(8.2, 8.4, W)
    c6 = then(lambda ts: at(CX, CY, abs(Ed.math.cos(Ed.math.pi * Ed.seg(ts, 8.4, 8.8))) if ts < 8.6 else 0, 3), i6)
    r.art('card-3', card, 8.2, 8.6, 30, c6)
    number(8.2, 8.6, c6)
    cal = S.card('fall', 'Minimal October calendar page-40.png', 820); calw, calh = cal.size
    r.art('calendar', C.shadow(cal, (8, 14), 14, 100), 8.6, 10.0, 31, then(lambda ts: at(540, Ed.lerp(2400, M.CAL_Y, Ed.back_out(Ed.seg(ts, 8.6, 8.95), 1.3)), 1, -2), o6))
    day = (540 - calw / 2 + calw * 0.73, M.CAL_Y - calh / 2 + calh * 0.78)
    r.doodle('frame', 0, 190, 9.1, 10.0, then(pop_in(day[0], day[1], 9.1, 0, 0.3), o6), WINE)
    r.art('pen-2', pen, 9.0, 9.6, 35, pen_f(lambda ts: (day[0] + 60 * Ed.math.cos(ts * 12), day[1] + 40 * Ed.math.sin(ts * 12))))
    r.serif('next batch', 175, 8.9, 10.0, then(pop(540, 330, 8.9, 3), o6), WINE, WHITE)
    r.boxed('[Oct 30]', 84, 9.2, 10.0, then(pop_in(580, 530, 9.2, -3), o6), WHITE, 'Oct 30')

    # 7 (9.8-11.6) one being packed, full frame; [yours ships Friday] + one underline; swipes out right
    o7 = slide(11.4, 11.6, W)
    r.clip(3, 9.8, 11.6, 6, then(still(540, 960), o7))
    r.boxed('[yours ships Friday]', 62, 10.1, 11.6, then(pop_in(540, 1380, 10.1, 2), o7), PINK, 'yours ships Friday')
    r.doodle('under', 0, 520, 10.4, 11.6, then(pop_in(540, 1470, 10.4, 2, 0.35), o7), WHITE)

    # 8 (11.4-end) CTA: Comment / "[KEYWORD]" / [Product name]
    r.clip(4, 11.4, None, 50, then(still(540, 960), enter(11.4, 11.6, -W)))
    r.serif('Comment', 175, 11.7, None, pop(540, 1000, 11.7, 3), WHITE, WINE)
    r.boxed('"[KEYWORD]"', 64, 11.95, None, pop_in(540, 1200, 11.95, -2), WHITE, '"BATCH"')
    r.boxed('[Product name]', 56, 12.15, None, pop_in(540, 1340, 12.15, 2), WINE, 'The Iron Set')
    return r

def layers():
    return reel().L

STAGE = PINK
