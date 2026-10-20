"""16 What it feels like, approved 2026-10-19 (motion test build/motion_16.py). FULLY EDITABLE build (2026-10-20,
build/editable.py, like t24): every word is CapCut text (DM Serif Display built-in words "what it feels like",
"sound on", "in three words", "Comment"; Montserrat [brackets] on CapCut's text background: the product, the three
feeling words, "you'll hear it", the product name and the keyword); the sparkles and the underline are Scrolly Doodles
letters (recolour like text); the butter stage is CapCut's background colour under a colourless tissue grain; the
phone, the three photo cards and their pins are real photos moving on keyframes, the clips sitting in them; the five
clips are real clip layers (placeholder cards until the buyer's clips go in), the hook's fast cuts and the pinned
photos are the same clips.
CapCut limits: the burst behind the phone is a picture (text always sits above pictures; recolour it with Adjust >
HSL); close-up 2 opens in a growing round window (a circle-masked clip scaling up), then cuts to the full clip; the
swipes are plain slides (no motion blur)."""
from PIL import Image, ImageDraw
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import motion_16 as M
import play as P
import storyboard_b2 as S
import collage as C
from collage_kit import doodle as art_doodle

SPEC = dict(num='16', title='What it feels like', subtitle='20 seconds. Five clips, filmed close with the sound on.',
            font='montserrat', dir='16-what-it-feels-like', folder='Template 16 - What it feels like', project='16 What it feels like',
            cover_at=0.6,
            slots=[('A squeeze', 'A squeeze, press or stretch'), ('Close-up 1', 'A hand across the surface'), ('Close-up 2', 'Another texture, close'),
                   ('The satisfying moment', 'A pour, fold, tap or drape (sound on)'), ('The whole product', 'The whole product, pulled back')],
            test_clips=[('IMG_1403', 0.5), ('IMG_1406', 0.0), ('IMG_1407', 0.5), ('IMG_1409', 0.0), ('IMG_1398', 0.0)])
INK, WHITE, BUTTER, WINE = (24, 23, 22), (255, 255, 255), M.PINK, M.BLUE        # motion_16: PINK = butter, BLUE = wine
W, H = 1080, 1920

def pop(x, y, t0, r=0.0): return pop_in(x, y, t0, r, 0.22, 1.8, 18)

def reel():
    r = Ed.Reel(M.HOLDS, 12.5)
    r.art('tissue-grain', Ed.grain(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png')), 0, None, 1, still(540, 960))

    # 1 (0-1.8) the hook: four fast cuts; "what it / feels like" + [my velvet throw], sparkles; swipes out left
    o1 = slide(1.6, 1.8, -W)
    for i in range(4):
        r.clip(i, i * 0.45, 1.8 if i == 3 else (i + 1) * 0.45, 10 + i, then(still(540, 960), o1), src=0.3)
    r.serif('what it', 156, 0.05, 1.8, then(pop(500, 330, 0.05, 3), o1), WHITE, INK)
    r.serif('feels like', 212, 0.25, 1.8, then(pop(560, 540, 0.25, 2), o1), WHITE, INK)
    r.boxed('[my velvet throw]', 62, 0.6, 1.8, then(pop_in(540, 740, 0.6, -2), o1), BUTTER, 'my linen sheets')
    for i, (x, y) in enumerate([(150, 300), (950, 380), (990, 700), (110, 760)]):
        ti = 0.35 + i * 0.1
        def sp(ts, x=x, y=y, i=i, ti=ti):
            k = Ed.back_out(Ed.seg(ts, ti, ti + 0.25), 2.2) * (0.8 + 0.25 * Ed.math.sin((ts - ti) * 7 + i * 1.7)) if ts >= ti else 0
            return at(x, y, k * (0.7 + 0.3 * (i % 3) / 2), -15 * Ed.math.sin(ts * 2 + i))
        r.doodle('icon', 8, 160, ti, 1.8, then(sp, o1), WINE)

    # 2 (1.8-3.4) close-up 1, full frame; [soft] + one underline; diagonal out
    o2 = slide(3.2, 3.4, -W - 300, -300)
    r.clip(1, 1.6, 3.4, 14, then(still(540, 960), enter(1.6, 1.8, W), o2), src=0.6)
    r.boxed('[soft]', 130, 1.95, 3.4, then(pop_in(380, 1330, 1.95, 3), o2), BUTTER, 'cool')
    r.doodle('under', 0, 480, 2.3, 3.4, then(pop_in(380, 1440, 2.3, 2, 0.35), o2), BUTTER)

    # 3 (3.4-5.0) PAPER: the phone stands on the paper playing the satisfying clip; "sound on" + [you'll hear it];
    #   one burst behind the phone
    im, _, _ = P.device(M.PHONE, 560); phone, ssize, soff = Ed.device_hole(P.die_cut(im, 8))
    pf = lambda ts: at(540, Ed.lerp(2400, 1150, Ed.ease(Ed.seg(ts, 3.4, 3.75))), 1, 4)
    r.art('burst', art_doodle('burst', 2, 980, WINE), 3.8, 5.0, 18, pop_in(540, 1150, 3.8, 0, 0.35))
    r.clip(3, 3.4, 5.0, 20, Ed.child(pf, soff), size=ssize)
    r.art('phone', phone, 3.4, 5.0, 21, pf)
    r.serif('sound on', 156, 3.7, 5.0, pop(540, 330, 3.7, 3), INK, WHITE)
    r.boxed("[you'll hear it]", 58, 4.0, 5.0, pop_in(540, 490, 4.0, -2), WHITE, "you'll hear it")

    # 4 (5.0-6.6) close-up 2 opens in a growing round window, then full frame; [smooth]; swipes out left
    o4 = slide(6.4, 6.6, -W)
    r.clip(2, 5.0, 5.6, 15, lambda ts: at(540, 960, Ed.lerp(260, 1150, Ed.ease(Ed.seg(ts, 5.0, 5.6))) / 260), size=(520, 520), mask='circle')
    r.clip(2, 5.6, 6.6, 15, then(still(540, 960), o4), src=r.R(5.6) - r.R(5.0))
    r.boxed('[smooth]', 130, 5.6, 6.6, then(pop_in(640, 1330, 5.6, -3), o4), WHITE, 'crisp')

    # 5 (6.6-8.2) PAPER, no video: three photo cards pinned in a row, each with its word; "in three words"
    o5 = slide(8.0, 8.2, -W - 300, -300); i5 = enter(6.4, 6.6, W)
    r.serif('in three words', 120, 6.7, 8.2, then(pop(540, 380, 6.7, 2), o5), INK, WHITE)
    cw, ch, bd = 300, 380, 14
    card = Image.new('RGBA', (cw + 2 * bd, ch + 2 * bd), (0, 0, 0, 0)); ImageDraw.Draw(card).rectangle((0, 0, card.width - 1, card.height - 1), fill=WHITE + (255,))
    card = C.shadow(card, (8, 14), 14, 110); pin = S.fitw(Image.open(M.PINS / 'pin-head-black.png').convert('RGBA'), 54)
    for i, (x, (wd, test, col)) in enumerate(zip((220, 540, 860), (('[soft]', 'cool', BUTTER), ('[smooth]', 'crisp', WHITE), ('[cozy]', 'airy', BUTTER)))):
        def cf(ts, i=i, x=x):
            k = Ed.back_out(Ed.seg(ts, 6.8 + i * 0.2, 7.1 + i * 0.2), 1.5); return at(x, Ed.lerp(-400, 950 + (i % 2) * 60, k), 1, (5, -3, 3)[i])
        cf = then(cf, i5, o5)
        r.art(f'card-{i}', card, 6.6, 8.2, 30 + 3 * i, cf)
        r.clip(i + 1, 6.6, 8.2, 31 + 3 * i, cf, size=(cw, ch), src=1.0)
        r.art(f'pin-{i}', pin, 6.6, 8.2, 32 + 3 * i, Ed.child(cf, (0, -ch / 2 - bd - 5)))
        r.boxed(wd, 56, 7.1 + i * 0.2, 8.2, then(pop_in(x, 1250 + (i % 2) * 60, 7.1 + i * 0.2, (3, -3, 2)[i]), o5), col, test)

    # 6 (8.2-9.8) the whole product, pulled back; [Product name]; swipes out right
    o6 = slide(9.6, 9.8, W)
    r.clip(4, 8.0, 9.8, 16, then(lambda ts: at(540, 960, Ed.lerp(1.6, 1, Ed.ease(Ed.seg(ts, 8.2, 8.9)))), enter(8.0, 8.2, W + 300, 300), o6))
    r.boxed('[Product name]', 62, 8.6, 9.8, then(pop_in(540, 1380, 8.6, 2), o6), BUTTER, 'The Linen Set')

    # 7 (9.8-end) CTA: Comment / "[KEYWORD]"
    r.clip(4, 9.6, None, 17, then(still(540, 960), enter(9.6, 9.8, -W)), src=3.0)
    r.serif('Comment', 175, 9.9, None, pop(540, 1000, 9.9, 3), INK, WHITE)
    r.boxed('"[KEYWORD]"', 64, 10.15, None, pop_in(540, 1220, 10.15, -2), WHITE, '"FEEL"')
    return r

def layers():
    return reel().L

STAGE = BUTTER
