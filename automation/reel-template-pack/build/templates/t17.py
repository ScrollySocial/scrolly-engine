"""17 Everything that goes into one, approved 2026-10-19 (motion test build/motion_17.py). FULLY EDITABLE build
(2026-10-20, build/editable.py, like t24): every word is CapCut text (DM Serif Display built-in words "everything that
goes into one", "= one", "Comment"; Montserrat [brackets] on CapCut's text background: the three material labels,
what it is, the product, the made-fresh line, the keyword and the product name); the sparkles, underline, arrow and
burst are Scrolly Doodles letters (recolour like text); the pink stage is CapCut's background colour under a
colourless marble grain; the walnut tray and the white photo cards are real photos moving on keyframes, with the clips
sitting in them; the camera dives into card 1 and card 2 (every stage layer zooms together on keyframes); the seven
clips are real clip layers (placeholder cards until the buyer's clips go in).
CapCut limits: card two's flip is a turn (it shrinks to nothing and comes back as the clip: CapCut can't squash a
layer on one side); the stage grain doesn't zoom with the camera; the swipes are plain slides (no motion blur).
Improved on the flipbook build: the dives into the cards are real keyframed zooms (they were flipbook-only)."""
from PIL import Image, ImageDraw, ImageOps
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import motion_17 as M
import play_extra as X
import storyboard_b2 as S
import collage as C

SPEC = dict(num='17', title='Everything that goes into one', subtitle='20 seconds. Seven clips: the empty table, three materials, the finished one.',
            font='montserrat', dir='17-everything-that-goes-into-one', folder='Template 17 - What goes into one',
            project='17 What goes into one', cover_at=1.0,
            slots=[('The empty table', 'An empty table, filmed from above'), ('Material 1', 'Placing your first material'),
                   ('Material 2', 'Placing your second material'), ('Material 3', 'Placing your third material'),
                   ('The finished one', 'The finished product in the middle'), ('Close up', 'The finished product, close'),
                   ('The end', 'You or your product')],
            test_clips=[('IMG_1386', 0.5), ('IMG_1387', 1.5), ('IMG_1389', 2.5), ('IMG_1388', 1.0), ('IMG_1391', 0.0), ('IMG_1393', 3.0), ('IMG_1395', 0.5)])
WHITE, INK, BUTTER, BLUE, WINE, PINK = (255, 255, 255), M.INK, M.BUTTER, M.BLUE, X.WINE, X.PINK
W, H = 1080, 1920
TX, TY = M.TRAY_C

def pop(x, y, t0, r=0.0): return pop_in(x, y, t0, r, 0.22, 1.8, 18)

def cam_at(ts):
    """The camera on the tray stage (motion_17.camera): (focus, zoom). Dives into card 1 (3.4-3.8), rests while the
    full clips cover it, dives into card 2 (6.0-6.4)."""
    if 3.4 <= ts < 5.15: return M.SLOTS[0], Ed.lerp(1, 4.2, Ed.ease(Ed.seg(ts, 3.4, 3.8)) ** 2)
    if 6.0 <= ts < 6.75: return M.SLOTS[1], Ed.lerp(4.2, 1, 1 - Ed.ease(Ed.seg(ts, 6.0, 6.4)) ** 0.5)
    return (540, 960), 1.0

def cam(f):
    """A stage layer seen through the camera."""
    def g(ts):
        v = f(ts); (fx, fy), s = cam_at(ts)
        if s <= 1.001: return v
        w, h = W / s, H / s; x0 = min(max(fx - w / 2, 0), W - w); y0 = min(max(fy - h / 2, 0), H - h)
        return dict(v, x=(v['x'] - x0) * s, y=(v['y'] - y0) * s, s=v.get('s', 1.0) * s)
    return g

def reel():
    r = Ed.Reel(M.HOLDS, 12.5)
    r.art('marble-grain', Ed.grain(S.raw('images', 'Soft veined white marble texture-1.png')), 0, None, 1, still(540, 960))
    tray = Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Empty walnut serving tray-59.png').convert('RGBA').rotate(90, expand=True)
    tray = S.fith(tray, 1520); tw, th = tray.size; tray = C.shadow(tray, (12, 22), 18, 120)
    x0, y0, x1, y1 = M.TRAY_IN; inside = (int(tw * (x1 - x0)), int(th * (y1 - y0)))
    _i4 = enter(5.15, 5.4, -W)                                    # the stage swipes back in from the left after scene 3
    i4 = lambda ts, v: _i4(ts, v) if ts >= 5.0 else v

    # 1 (0-1.8) the tray slides in from above, the empty table playing inside it; "everything that / goes into one"
    tf = cam(then(lambda ts: at(TX, Ed.lerp(-900, TY, Ed.ease(Ed.seg(ts, 0.0, 0.35)))), i4))
    r.art('tray', tray, 0, 8.6, 10, then(tf, slide(8.35, 8.6, -W)))
    r.clip(0, 0, 1.8, 11, tf, size=inside)
    r.serif('everything that', 129, 0.05, 1.8, pop(540, 300, 0.05, 2), INK, WHITE)
    r.serif('goes into one', 161, 0.3, 1.8, pop(540, 470, 0.3, 3), INK, WHITE)
    for i, (x, y) in enumerate([(110, 250), (980, 330), (90, 1250), (990, 1350)]):
        ti = 0.4 + i * 0.1
        def sp(ts, x=x, y=y, i=i, ti=ti):
            k = Ed.back_out(Ed.seg(ts, ti, ti + 0.25), 2.2) * (0.8 + 0.25 * Ed.math.sin((ts - ti) * 7 + i * 1.7)) if ts >= ti else 0
            return at(x, y, k * (0.7 + 0.3 * (i % 3) / 2), -15 * Ed.math.sin(ts * 2 + i))
        r.doodle('icon', 8, 150, ti, 1.8, sp, WINE)
    r.doodle('under', 0, 520, 0.9, 1.8, pop_in(540, 590, 0.9, 2, 0.35), BUTTER)

    # 2 (1.8-3.8) TRAY: the material cards land one at a time, each with its label; the camera dives into card 1
    # 4 (5.4-7.0) the stage is back; card 2 turns over into its clip; the camera dives into it
    # 5 (7.0-8.6) TRAY: the cards slide to the corners; the finished one drops into the middle; "= one [smoothie]"
    o5 = slide(8.35, 8.6, -W); cw, ch, bd = 360, 445, 14
    card = Image.new('RGBA', (cw + 2 * bd, ch + 2 * bd), (0, 0, 0, 0)); ImageDraw.Draw(card).rectangle((0, 0, card.width - 1, card.height - 1), fill=WHITE + (255,))
    card = C.shadow(card, (8, 14), 14, 110)
    corners = ((250, 520), (830, 620), (270, 1520))
    for i, (xy, to) in enumerate(zip(M.SLOTS, corners)):
        t0 = 1.9 + i * 0.45
        def cf(ts, i=i, xy=xy, to=to, t0=t0):
            k = Ed.back_out(Ed.seg(ts, t0, t0 + 0.3), 1.5) if ts >= t0 else 0
            u = Ed.ease(Ed.seg(ts, 7.1, 7.5)); s = k * Ed.lerp(1, 0.62, u)
            if i == 1 and 5.45 <= ts < 5.75:                         # card 2 turns over
                s *= abs(Ed.math.cos(Ed.math.pi * Ed.seg(ts, 5.45, 5.75)))
            return at(Ed.lerp(xy[0], to[0], u), Ed.lerp(Ed.lerp(-400, xy[1], k), to[1], u), s, (6, -5, 3)[i])
        cf = then(cam(then(cf, i4)), o5)
        r.art(f'card-{i}', card, 1.9, 8.6, 20 + 2 * i, cf)
        r.clip(i + 1, 1.9, 8.6, 21 + 2 * i, cf, size=(cw, ch), src=1.0)
        words, test = M.NAMES[i], ('beeswax', 'cotton wick', 'lavender oil')[i]
        lf = then(pop_in(xy[0], xy[1] + (270 if i < 2 else -265), t0 + 0.25, (3, -3, 2)[i]), i4)
        r.boxed(words, 54, t0 + 0.25, 3.4, lf, (BUTTER, WHITE, BUTTER)[i], test)
        if i != 1: r.boxed(words, 54, 5.4, 6.0, lf, (BUTTER, WHITE, BUTTER)[i], test)
    dk = lambda ts: Ed.back_out(Ed.seg(ts, 7.4, 7.75), 1.5) if ts >= 7.4 else 0
    df = then(lambda ts: at(600, Ed.lerp(-500, 1040, dk(ts)), 1 if dk(ts) > 0 else 0, -2), o5)
    big = Image.new('RGBA', (430 + 32, 560 + 32), (0, 0, 0, 0)); ImageDraw.Draw(big).rectangle((0, 0, big.width - 1, big.height - 1), fill=WHITE + (255,))
    r.art('card-done', C.shadow(big, (8, 14), 14, 110), 7.4, 8.6, 30, df)
    r.clip(4, 7.4, 8.6, 31, df, size=(430, 560))
    r.serif('= one', 175, 7.75, 8.6, then(pop(540, 335, 7.75, 3), o5), INK, WHITE)
    r.boxed('[smoothie]', 70, 7.95, 8.6, then(pop_in(540, 440, 7.95, -2), o5), BUTTER, 'candle')

    # 3 (3.8-5.4) placing material 1, full frame (out of the dive); [what it is] + one arrow; swipes out right
    o3 = slide(5.15, 5.4, W)
    r.clip(1, 3.8, 5.4, 40, then(lambda ts: at(540, 960, Ed.lerp(1.4, 1, Ed.ease(Ed.seg(ts, 3.8, 4.1)))), o3), src=1.0 + r.R(3.8) - r.R(1.9))
    r.boxed('[fresh watermelon]', 60, 4.0, 5.4, then(pop_in(540, 1380, 4.0, 2), o3), WHITE, 'pure beeswax')
    r.doodle('arrow', 0, 190, 4.3, 5.4, then(pop_in(540, 1215, 4.3, -90, 0.3), o3), WHITE)

    # 4b (6.4-7.0) material 2, full frame; diagonal out to the tray
    r.clip(2, 6.4, 7.0, 40, then(still(540, 960), slide(6.75, 7.0, -W - 300, -300)), src=1.0 + r.R(6.4) - r.R(1.9))

    # 6 (8.6-10.2) the finished one, close, full frame; [made fresh, to order] with one burst behind the box
    o6 = slide(9.95, 10.2, W)
    r.clip(5, 8.35, 10.2, 41, then(still(540, 960), enter(8.35, 8.6, W), o6))
    r.doodle('burst', 2, 560, 8.8, 10.2, then(pop_in(540, 1380, 8.8, 0, 0.35), o6), WHITE)
    r.boxed('[made fresh, to order]', 60, 8.85, 10.2, then(pop_in(540, 1380, 8.85, 2), o6), BUTTER, 'poured by hand')

    # 7 (10.2-end) CTA: Comment / "[KEYWORD]" / [Product name]
    r.clip(6, 9.95, None, 42, then(still(540, 960), enter(9.95, 10.2, -W)))
    r.serif('Comment', 175, 10.3, None, pop(540, 1000, 10.3, 3), INK, WHITE)
    r.boxed('"[KEYWORD]"', 64, 10.55, None, pop_in(540, 1220, 10.55, -2), WHITE, '"INSIDE"')
    r.boxed('[Product name]', 56, 10.75, None, pop_in(540, 1360, 10.75, 2), BLUE, 'The Beeswax Candle')
    return r

def layers():
    return reel().L

STAGE = PINK
