"""25 Mine vs. the usual kind, approved 2026-10-19 (motion test build/motion_25.py). FULLY EDITABLE build (2026-10-20,
build/editable.py, like t24): every word is CapCut text (DM Serif Display built-in words "mine vs. the usual kind",
"round 1/2/3", "and the winner is", "Comment"; Montserrat [brackets] on CapCut's text background: the two labels, the
three differences, the trophy's [MINE] sticker, the keyword and the product name); the underline and the ticks are
Scrolly Doodles letters (recolour like text); the butter poster is CapCut's background colour under a colourless kraft
grain; the brass bell and the gold trophy are real photos moving on keyframes; every round is a split of real clip
layers (left | right, diagonal, top / bottom, a round window); the six clips are real clip layers (placeholder cards
until the buyer's clips go in).
CapCut limits: round 1's diagonal is the usual kind's clip tilted along the line (no diagonal mask in CapCut), with a
butter bar on the seam; the ring bursts behind the bell and the trophy are pictures (text always sits above pictures;
recolour them with Adjust > HSL); the two-tone strip slice into round 2 is now round 2's two halves sliding in from
opposite sides; the swipes are plain slides (no motion blur)."""
import math
from PIL import Image, ImageDraw, ImageOps
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import motion_25 as M
import play as P
import storyboard_b2 as S
from collage_kit import doodle as art_doodle

SPEC = dict(num='25', title='Mine vs. the usual kind', subtitle='21 seconds. Six clips: the usual kind, yours, three rounds, the end.',
            font='montserrat', dir='25-mine-vs-the-usual-kind', folder='Template 25 - Mine vs the usual kind',
            project='25 Mine vs the usual kind', cover_at=1.0,
            slots=[('The usual kind', 'The ordinary version, in use'), ('Yours', 'Your product, in use'),
                   ('Round 1: the usual kind', 'The ordinary version, the first difference'), ('Round 1: yours', 'Yours, the first difference'),
                   ('Round 3: yours', 'Yours, the third difference'), ('The end', 'You or your product')],
            test_clips=[('IMG_1460', 0.5), ('IMG_1418', 2.0), ('IMG_1462', 0.5), ('IMG_1423', 2.0), ('IMG_1463', 0.5), ('IMG_1423', 5.0)])
WHITE, BUTTER, WINE, INK = (255, 255, 255), M.BUTTER, M.WINE, M.INK
DIFFS = (('[no bucket of dirty water]', 'no bucket of dirty water', BUTTER), ('[steam, no chemicals]', 'steam, no chemicals', WHITE),
         ('[dries in seconds]', 'dries in seconds', BUTTER))
W, H = 1080, 1920

def pop(x, y, t0, r=0.0): return pop_in(x, y, t0, r, 0.22, 1.8, 18)

def reel():
    r = Ed.Reel(M.HOLDS, 13.5)
    kp = S.raw('images', 'Partly unrolled brown kraft paper-149.png'); w_, h_ = kp.size
    r.art('kraft-grain', Ed.grain(kp.crop((int(w_ * 0.25), int(h_ * 0.3), int(w_ * 0.75), int(h_ * 0.7)))), 0, None, 1, still(540, 960))
    bell = P.thing('Classic brass boxing ring bell-89.png', 420, 'stripes', WINE, scale=0.3, strength=0.45); bell_s = S.fitw(bell, 260)
    rings = art_doodle('burst', 2, 700, WINE)

    def ring(name, t0, c, a, b, z, big=True, moves=()):
        """The bell rings: it shakes, and one burst of ring-lines pops behind it (motion_25.ring)."""
        def bf(ts):
            k = Ed.back_out(Ed.seg(ts, t0, t0 + 0.3), 1.6) if ts >= t0 else 0; sh = 9 * math.sin(ts * 60) * (1 - Ed.seg(ts, t0 + 0.3, t0 + 0.9))
            return at(c[0] + sh, c[1], k, -sh)
        r.art(f'{name}-rings', rings, a, b, z, then(pop_in(c[0], c[1], t0 + 0.2, 0, 0.35), *moves))
        r.art(name, bell if big else bell_s, a, b, z + 1, then(bf, *moves))

    def poster(n, a, b, t0, z, moves=(), diff=None):
        ring(f'bell-{n}', t0, (540, 820), a, b, z, moves=moves)
        r.serif(f'round {n + 1}', 184, t0 + 0.25, b, then(pop(540, 1260, t0 + 0.25, 3), *moves), WINE, WHITE)
        if diff is not None:
            words, test, col = DIFFS[diff]   # white box on the poster (a butter box vanishes on the butter stage)
            r.boxed(words, 58, t0 + 0.4, b, then(pop_in(540, 1440, t0 + 0.4, -2), *moves), WHITE, test)

    def labels(a, b, lu, lm, moves=()):
        r.boxed('[the usual kind]', 52, a, b, then(pop_in(*lu, a, 3), *moves), WHITE, 'the usual mop')
        r.boxed('[mine]', 56, a + 0.05, b, then(pop_in(*lm, a + 0.05, -3), *moves), BUTTER, 'mine')

    # 1 (0-1.8) split screen: the usual kind | mine, the bell between them; "mine vs. / the usual kind" + labels
    o1 = slide(1.6, 1.8, -W)
    r.clip(0, 0, 1.8, 10, then(still(267, 960), o1), size=(534, 1920))
    r.clip(1, 0, 1.8, 11, then(still(813, 960), o1), size=(534, 1920))
    ring('bell-0', 0.0, (540, 960), 0, 1.8, 12, big=False, moves=(o1,))
    r.serif('mine vs.', 156, 0.1, 1.8, then(pop(540, 330, 0.1, 3), o1), WHITE, WINE)
    r.serif('the usual kind', 110, 0.35, 1.8, then(pop(540, 480, 0.35, -2), o1), WINE, WHITE)
    r.doodle('under', 0, 600, 0.7, 1.8, then(pop_in(540, 570, 0.7, 2, 0.35), o1), WINE)
    labels(0.6, 1.8, (270, 1380), (810, 1380), (o1,))

    # 2 (1.6-3.2) POSTER: the bell rings; "round 1" + [difference one]; slides off diagonally to round 1
    poster(0, 1.6, 3.2, 1.8, 20, (enter(1.6, 1.8, W), slide(3.05, 3.2, -W - 300, -300)), diff=0)

    # 3 (3.05-4.8) round 1: the diagonal split (the usual kind above, yours below); labels, [difference one], a tick
    o3 = slide(4.6, 4.8, W)
    r.clip(3, 3.05, 4.8, 5, then(still(540, 960), o3))
    ang = math.degrees(math.atan2(1160 - 760, 1080)); n = (-math.sin(math.radians(ang)), -math.cos(math.radians(ang)))
    tc = (540 + n[0] * 1000, 960 + n[1] * 1000)                  # a 2600 x 2000 clip whose bottom edge lies on the line
    r.clip(2, 3.05, 4.8, 6, then(still(tc[0], tc[1], -ang), o3), size=(2600, 2000))
    bar = Image.new('RGBA', (2600, 14), BUTTER + (255,))
    r.art('seam', bar, 3.05, 4.8, 7, then(still(540, 960, -ang), o3))
    labels(3.3, 4.8, (300, 400), (800, 1150), (o3,))
    words, test, col = DIFFS[0]; r.boxed(words, 58, 3.5, 4.8, then(pop_in(540, 1400, 3.5, 2), o3), col, test)
    r.doodle('tick', 0, 160, 3.8, 4.8, then(pop_in(930, 1060, 3.8, 0, 0.3), o3), BUTTER)

    # 4 (4.6-6.2) POSTER: the bell rings again; "round 2"
    poster(1, 4.6, 6.2, 4.8, 22, (enter(4.6, 4.8, -W),))

    # 5 (6.0-7.8) round 2: the halves slide in from opposite sides (top / bottom); labels, [difference two], a tick
    o5 = slide(7.6, 7.8, -W - 300, -300)
    r.clip(0, 6.0, 7.8, 40, then(still(540, 477), enter(6.0, 6.2, -W), o5), size=(1080, 954), src=2.5)
    r.clip(1, 6.0, 7.8, 41, then(still(540, 1443), enter(6.0, 6.2, W), o5), size=(1080, 954), src=4.0)
    labels(6.25, 7.8, (300, 330), (300, 1040), (o5,))
    words, test, col = DIFFS[1]; r.boxed(words, 58, 6.45, 7.8, then(pop_in(540, 1420, 6.45, -2), o5), col, test)
    r.doodle('tick', 0, 160, 6.8, 7.8, then(pop_in(880, 1200, 6.8, 0, 0.3), o5), BUTTER)

    # 6 (7.6-9.4) POSTER: round 3 rung in like rounds 1 and 2 (her note); then yours full frame, the usual kind small in a
    #   round window; [difference three]; swipes out right
    poster(2, 7.6, 8.6, 7.8, 24)
    o6 = slide(9.2, 9.4, W)
    r.clip(4, 8.6, 9.4, 42, then(still(540, 960), o6))
    wk = lambda ts: Ed.back_out(Ed.seg(ts, 8.6, 8.9), 1.5)
    rim = Image.new('RGBA', (332, 332), (0, 0, 0, 0)); ImageDraw.Draw(rim).ellipse((0, 0, 331, 331), outline=WHITE + (255,), width=18)
    r.clip(0, 8.6, 9.4, 43, then(lambda ts: at(250, 520, wk(ts)), o6), size=(300, 300), mask='circle', src=5.0)
    r.art('window-rim', rim, 8.6, 9.4, 44, then(lambda ts: at(250, 520, wk(ts)), o6))
    words, test, col = DIFFS[2]; r.boxed(words, 58, 8.7, 9.4, then(pop_in(540, 1400, 8.7, 2), o6), col, test)

    # 7 (9.2-11.0) POSTER, no video: "and the winner is" + the gold trophy with its [MINE] sticker; one burst behind it
    i7 = enter(9.2, 9.4, -W); o7 = slide(10.8, 11.0, -W)
    trophy = P.thing('Plain gold trophy on black base-223.png', 520, None, None)
    tf = then(lambda ts: at(540, Ed.lerp(2400, 1050, Ed.back_out(Ed.seg(ts, 9.6, 9.95), 1.3))), i7, o7)
    r.art('trophy-burst', art_doodle('burst', 2, 900, WINE), 9.75, 11.0, 30, then(pop_in(540, 1050, 9.75, 0, 0.35), o7))
    r.art('trophy', trophy, 9.2, 11.0, 31, then(tf, lambda ts, v: dict(v, r=3)))
    r.boxed('[MINE]', 54, 9.95, 11.0, Ed.child(tf, (0, -0.1 * trophy.height), 3), WINE, 'MINE')
    r.serif('and the winner is', 101, 9.45, 11.0, then(pop(540, 380, 9.45, 2), i7, o7), WINE, WHITE)

    # 8 (10.8-end) CTA: yours in use; Comment / "[KEYWORD]" / [Product name]
    r.clip(5, 10.8, None, 50, then(still(540, 960), enter(10.8, 11.0, W)))
    r.serif('Comment', 175, 11.1, None, pop(540, 1000, 11.1, 3), WHITE, WINE)
    r.boxed('"[KEYWORD]"', 64, 11.35, None, pop_in(540, 1220, 11.35, -2), WHITE, '"STEAM"')
    r.boxed('[Product name]', 56, 11.55, None, pop_in(540, 1360, 11.55, 2), BUTTER, 'The Steam Mop')
    return r

def layers():
    return reel().L

STAGE = BUTTER
