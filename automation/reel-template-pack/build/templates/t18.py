"""18 Check this before you buy, approved 2026-10-19 (motion test build/motion_18.py, after her notes: the check lines
at the top; back to the clipboard after check 2). FULLY EDITABLE build (2026-10-20, build/editable.py, like t24): every
word is CapCut text (DM Serif Display built-in words "3 things to check", "the checklist", the check numbers 1 2 3,
"mine passes", "3/3" on the seal, "Comment"; Montserrat [brackets] on CapCut's text background: the product type, the
three checks on the sheet and at the top of each check, the keyword and the last line); the ticks and sparkles are
Scrolly Doodles letters (recolour like text); the cream desk is CapCut's background colour under a colourless concrete
grain; the clipboard, its ruled sheet, the gold seal and the laptop are real photos moving on keyframes; the buyer's
clip IS the clipboard's sheet (a clip layer under the clipboard's see-through sheet area); the four clips are real
clip layers (placeholder cards until the buyer's clips go in).
CapCut limits: the burst behind the seal is a picture (text always sits above pictures; recolour it with Adjust >
HSL); the 3/3 seal sits on the clipboard's top corner (the bottom corner is under Instagram's caption now that 3/3 is text); the check numbers on the clips are DM Serif words instead of the round number stickers (so buyers can recolour
them); the ticks pop in rather than draw on; the swipes are plain slides (no motion blur)."""
from PIL import Image
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import motion_18 as M
import play as P
import play_extra as X
import storyboard_b2 as S
import collage as C
from collage_kit import doodle as art_doodle
from PIL import ImageOps

SPEC = dict(num='18', title='Check this before you buy', subtitle='20 seconds. Four clips: your product, then three checks on it.',
            font='montserrat', dir='18-check-this-before-you-buy', folder='Template 18 - Check this before you buy',
            project='18 Check this before you buy', cover_at=1.0,
            slots=[('Your product', 'Your product, upright, close'), ('Check 1', 'The first thing to check, shown on yours'),
                   ('Check 2', 'The second check'), ('Check 3', 'The third check')],
            test_clips=[('IMG_1381', 0.5), ('IMG_1381', 1.5), ('IMG_1378', 0.5), ('IMG_1377', 0.5)])
WHITE, WINE, BLUE, INK, CREAM = (255, 255, 255), X.WINE, X.BABY, (24, 23, 22), (246, 241, 232)
CHECKS = (('1. [check the bristles]', '1. check the stitching'), ('2. [check the cord]', '2. check the zip'), ('3. [check the heat]', '3. check the lining'))
W, H = 1080, 1920
CX, CY = M.CB_C

def pop(x, y, t0, r=0.0): return pop_in(x, y, t0, r, 0.22, 1.8, 18)

def reel():
    r = Ed.Reel(M.HOLDS, 13.9); z = [10]
    r.art('concrete-grain', Ed.grain(S.raw('images', 'Light gray concrete mineral texture-4.png')), 0, None, 1, still(540, 960))
    cb = S.fitw(Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Brown clipboard with blank white paper-65.png').convert('RGBA'), M.CB_W)
    cbh = cb.height; x0, y0, x1, y1 = M.SHEET; sw, sh = int(M.CB_W * (x1 - x0)), int(cbh * (y1 - y0))
    soff = (M.CB_W * ((x0 + x1) / 2 - 0.5), cbh * ((y0 + y1) / 2 - 0.5))
    paper = ImageOps.fit(S.raw('physical', 'Blank Ruled Notebook Paper.png'), (sw, sh)).convert('RGBA')
    under = C.shadow(Image.new('RGBA', (sw, sh), WHITE + (255,)), (10, 18), 16, 110)
    def row(i, dx):                                    # a spot on the sheet: line i, dx of the sheet's width
        return (soff[0] - sw / 2 + sw * dx, soff[1] - sh / 2 + sh * (0.3 + 0.2 * i))

    def board(name, a, b, f, sheet, lines=None, ticks=0, tick_t=None):
        """The clipboard on the desk: the white sheet under it, the clip or the ruled paper as its sheet, the clamp
        board on top (see-through over the sheet); lines = when the checklist is written (None = no lines)."""
        z[0] += 10; zz = z[0]
        r.art(f'{name}-under', under, a, b, zz, Ed.child(f, soff))
        for kind, sa, sb in sheet:
            if kind == 'paper': r.art(f'{name}-paper', paper, sa, sb, zz + 1, Ed.child(f, soff))
            else: r.clip(kind, sa, sb, zz + 2, Ed.child(f, soff), size=(sw, sh), src=0.5)
        r.art(f'{name}-clipboard', cb, a, b, zz + 3, f)
        pb = next((sb for k, sa, sb in sheet if k == 'paper'), b)
        if lines is not None:
            for i, (words, test) in enumerate(CHECKS):
                t0 = lines + 0.25 * i if lines >= 0 else a
                def lf(ts, i=i, t0=t0):
                    v = Ed.child(f, row(i, 0.45))(ts); k = Ed.back_out(Ed.seg(ts, t0, t0 + 0.3), 1.6) if lines >= 0 else 1
                    return dict(v, s=k if ts >= t0 else 0)
                r.boxed(words, 50, t0, pb, lf, (BLUE, WHITE, BLUE)[i], test)
            for i in range(ticks):
                ti = tick_t if (tick_t is not None and i == ticks - 1) else a
                def tf(ts, i=i, ti=ti):
                    v = Ed.child(f, row(i, 0.88))(ts); v['y'] -= 10; k = Ed.back_out(Ed.seg(ts, ti, ti + 0.25), 2.0) if ts >= ti else 0
                    return dict(v, s=k if ti > a else 1)
                r.doodle('tick', i, 120, ti, pb, tf, WINE)

    # 1 (0-1.8) the clipboard slides up with the product clip as its sheet; "3 things / to check" + [before you buy a ...]
    o1 = slide(1.55, 1.8, -W)
    board('b1', 0, 1.8, then(lambda ts: at(CX, Ed.lerp(2600, CY, Ed.ease(Ed.seg(ts, 0.0, 0.35)))), o1), [(0, 0, 1.8)])
    r.serif('3 things', 184, 0.05, 1.8, then(pop(540, 335, 0.05, 3), o1), WINE, WHITE, italic_last=False)
    r.serif('to check', 138, 0.3, 1.8, then(pop(560, 490, 0.3, -2), o1), WINE, WHITE)
    for i, (x, y) in enumerate([(120, 300), (960, 260), (980, 560)]):
        ti = 0.4 + i * 0.1
        def sp(ts, x=x, y=y, i=i, ti=ti):
            k = Ed.back_out(Ed.seg(ts, ti, ti + 0.25), 2.2) * (0.8 + 0.25 * Ed.math.sin((ts - ti) * 7 + i * 1.7)) if ts >= ti else 0
            return at(x, y, k * (0.7 + 0.3 * (i % 3) / 2), -15 * Ed.math.sin(ts * 2 + i))
        r.doodle('icon', 8, 140, ti, 1.8, then(sp, o1), WINE)
    r.boxed('before you buy a [hair tool]', 56, 0.4, 1.8, then(pop_in(540, 1440, 0.4, -2), o1), WINE, 'before you buy a tote bag')

    # 2 (1.55-3.65) CLIPBOARD, no video: the checklist is written in on the sheet; diagonal out to check 1
    o2 = slide(3.4, 3.65, -W - 300, -300)
    board('b2', 1.55, 3.65, then(still(CX, CY), enter(1.55, 1.8, W), o2), [('paper', 1.55, 3.65)], lines=1.9)
    r.serif('the checklist', 120, 2.0, 3.65, then(pop(540, 300, 2.0, 2), o2), WINE, WHITE)

    # 3 (3.4-5.2) check 1, full frame; 1. [check] at the top with its number; swipes out right
    o3 = slide(5.0, 5.2, W)
    r.clip(1, 3.4, 5.2, 5, then(still(540, 960), o3))
    r.boxed(CHECKS[0][0], 60, 3.75, 5.2, then(pop_in(600, 330, 3.75, 2), o3), WHITE, CHECKS[0][1])
    r.serif('1', 150, 3.6, 5.2, then(pop_in(130, 330, 3.6, 8, 0.3, 2.0), o3), WHITE, WINE)

    # 4 (5.0-6.8) CLIPBOARD: line 1 ticked; the sheet turns into check 2 (5.9); the camera dives into it (6.35)
    def dive(ts):
        s = Ed.lerp(1, 2.2, Ed.ease(Ed.seg(ts, 6.35, 6.8)) ** 2); fx, fy = 540, CY + 40
        w, h = W / s, H / s; x0_ = min(max(fx - w / 2, 0), W - w); y0_ = min(max(fy - h / 2, 0), H - h)
        return (x0_, y0_, s)
    def b4(ts):
        x0_, y0_, s = dive(ts); v = enter(5.0, 5.2, -W)(ts, at(CX, CY)); return at((v['x'] - x0_) * s, (v['y'] - y0_) * s, s)
    board('b4', 5.0, 6.8, b4, [('paper', 5.0, 5.9), (2, 5.9, 6.8)], lines=-1, ticks=1, tick_t=5.3)
    r.boxed(CHECKS[1][0], 60, 6.0, 6.35, pop_in(540, 300, 6.0, 2), WHITE, CHECKS[1][1])

    # 5 (6.8-7.6) check 2, full frame (her note), its line at the top; swipes out right
    o5 = slide(7.4, 7.6, W)
    r.clip(2, 6.8, 7.6, 6, then(still(540, 960), o5), src=0.5 + r.R(6.8) - r.R(5.9))
    r.boxed(CHECKS[1][0], 60, 6.85, 7.6, then(pop_in(600, 330, 6.85, 2), o5), WHITE, CHECKS[1][1])
    r.serif('2', 150, 6.8, 7.6, then(pop_in(130, 330, 6.8, -6, 0.3, 2.0), o5), WHITE, WINE)

    # 6 (7.4-8.2) CLIPBOARD: line 2 ticked; swipes out left to check 3
    board('b6', 7.4, 8.2, then(still(CX, CY), enter(7.4, 7.6, -W), slide(8.0, 8.2, -W)), [('paper', 7.4, 8.2)], lines=-1, ticks=2, tick_t=7.7)

    # 7 (8.0-9.8) check 3, full frame; 3. [check]; diagonal out
    o7 = slide(9.6, 9.8, -W - 300, -300)
    r.clip(3, 8.0, 9.8, 75, then(still(540, 960), enter(8.0, 8.2, W), o7))
    r.boxed(CHECKS[2][0], 60, 8.35, 9.8, then(pop_in(600, 330, 8.35, -2), o7), WHITE, CHECKS[2][1])
    r.serif('3', 150, 8.2, 9.8, then(pop_in(130, 330, 8.2, -8, 0.3, 2.0), o7), WHITE, WINE)

    # 8 (9.6-11.4) CLIPBOARD, no video: all three ticked; the gold seal slaps on (one burst behind it); "mine passes"
    o8 = slide(11.2, 11.4, W)
    board('b8', 9.6, 11.4, then(still(CX, CY), o8), [('paper', 9.6, 11.4)], lines=-1, ticks=3, tick_t=9.9)
    r.art('burst', art_doodle('burst', 2, 500, WINE), 10.3, 11.4, 80, then(pop_in(830, 760, 10.3, 0, 0.35), o8))
    seal = P.die_cut(P.raw_cut('Blank gold foil seal sticker-175.png', 330), 8)
    sf = then(lambda ts: at(830, 760, Ed.lerp(2.2, 0.9, Ed.back_out(Ed.seg(ts, 10.25, 10.5), 2.0)) if ts >= 10.25 else 0, 12), o8)
    r.art('seal', seal, 10.25, 11.4, 81, sf)
    r.serif('3/3', 120, 10.25, 11.4, sf, WINE, None, italic_last=False)
    r.serif('mine passes', 138, 10.5, 11.4, then(pop(540, 300, 10.5, 3), o8), WINE, WHITE)

    # 9 (11.2-end) CTA: a laptop on the desk plays the product; Comment / "[KEYWORD]" / [mine checks all 3]
    im, _, _ = P.device(M.LAPTOP, 1000); lap, ssize, loff = Ed.device_hole(P.die_cut(im, 8))
    lf = then(lambda ts: at(540, Ed.lerp(2400, 1020, Ed.ease(Ed.seg(ts, 11.4, 11.7)))), enter(11.2, 11.4, -W))
    r.clip(0, 11.2, None, 90, Ed.child(lf, loff), size=ssize, src=1.0)
    r.art('laptop', lap, 11.2, None, 91, lf)
    r.serif('Comment', 175, 11.6, None, pop(540, 330, 11.6, 3), WINE, WHITE)
    r.boxed('"[KEYWORD]"', 64, 11.85, None, pop_in(540, 500, 11.85, -2), WHITE, '"CHECK"')
    r.boxed('[mine checks all 3]', 56, 12.05, None, pop_in(540, 1440, 12.05, 2), WINE, 'mine checks all 3')
    return r

def layers():
    return reel().L

STAGE = CREAM
