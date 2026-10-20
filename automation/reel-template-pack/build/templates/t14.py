"""14 The annoying moment, approved 2026-10-19 (motion test build/motion_14.py). FULLY EDITABLE build (2026-10-20,
build/editable.py, like t24): every word is CapCut text (DM Serif Display built-in words "again.", "we've all been
there", "every single time", "fixed.", "Comment"; Montserrat [brackets] on CapCut's text background: the annoying
moment, no more ..., how it fixes it, the keyword, the product name); the underline and the arrow are Scrolly Doodles
letters (recolour like text); the butter stage is CapCut's background colour under a colourless concrete grain; the
walnut TV and the three paper balls are real photos moving on keyframes; the TV's screen is a hole with the clip layer
under it; the three clips are real clip layers (placeholder cards until the buyer's clips go in).
CapCut limits: the annoying moment plays in colour (add CapCut's black-and-white filter to it for the motion test's
look); the ray burst behind the TV is a picture (text always sits above pictures; recolour it with Adjust > HSL); the
TV static is a noise picture jumping about under the screen; the diagonal wipes are slides. Improved on the flipbook
build: the fix now grows out of the TV screen to full frame (was a cut)."""
import random
from PIL import Image
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import motion_14 as M
import play as P
import storyboard_b2 as S
from collage_kit import doodle as art_doodle

SPEC = dict(num='14', title='The annoying moment', subtitle='19 seconds. Three clips: the annoying moment, the fix, the fix in use.',
            font='montserrat', dir='14-the-annoying-moment', folder='Template 14 - The annoying moment', project='14 The annoying moment',
            cover_at=1.0,
            slots=[('The annoying moment', 'The everyday problem, acted out (hands only works)'), ('The fix', 'Your product fixing it, close'),
                   ('In use', 'Your product in use')],
            test_clips=[('IMG_1378', 0.5), ('IMG_1381', 0.5), ('IMG_1377', 0.5)])
WHITE, WINE, BUTTER, INK = (255, 255, 255), M.DARK, M.LIGHT, (24, 23, 22)
W, H = 1080, 1920
TVX, TVY = M.TV_C

def tv_hole():
    """The walnut TV die-cut (play.tv_with look) with its screen punched out: (image, screen size, screen offset)."""
    tv = Image.open(P.HQ / 'Vintage Walnut Rabbit-Ear Television.png').convert('RGBA'); k = M.TV_W / tv.width
    x0, y0, x1, y1 = [int(v * k) for v in P.TV_SCREEN]; ins = int(14 * k * 2); pad = 12 + 42      # die_cut + shadow padding
    im = P.die_cut(S.fitw(tv, M.TV_W), 8)
    return Ed.window(im, (x0 + ins + pad, y0 + ins + pad, x1 - ins + pad, y1 - ins + pad), int(70 * k))

def reel():
    r = Ed.Reel(M.HOLDS, 12.0)
    r.art('concrete-grain', Ed.grain(S.raw('images', 'Light gray concrete mineral texture-4.png')), 0, None, 1, still(540, 960))

    # 1 (0-1.8) the annoying moment, full frame; [when your cord tangles] + "again."; swipes out left
    o1 = slide(1.6, 1.8, -W)
    r.clip(0, 0, 1.8, 10, then(still(540, 960), o1))
    r.boxed('[when your cord tangles]', 60, 0.05, 1.8, then(pop_in(540, 380, 0.05, 2), o1), WHITE, 'when your necklace tangles')
    r.serif('again.', 212, 0.4, 1.8, then(pop_in(540, 1250, 0.4, -4, 0.22, 1.8, 18), o1), WHITE, WINE)

    # 2 (1.8-3.4) STAGE: paper balls drop in one by one; "we've all been there"
    balls = [P.thing('Crumpled cream paper ball-58.png', w, p, WINE, scale=0.3, strength=0.55, seed=i)
             for i, (w, p) in enumerate(((330, 'stripes'), (290, 'dots'), (310, 'smalldots')))]
    o5 = slide(8.0, 8.2, -W)                                     # stage 5 swipes out to the fix in use
    for i, (b, (x0, y0)) in enumerate(zip(balls, M.SPOTS if hasattr(M, 'SPOTS') else [(230, 1600), (840, 1560), (540, 1680)])):
        def bf(ts, i=i, x0=x0, y0=y0):
            d = Ed.back_out(Ed.seg(ts, 1.8 + i * 0.25, 2.1 + i * 0.25), 1.6); x, y = x0, Ed.lerp(-300, y0, d)
            u = Ed.ease(Ed.seg(ts, 6.9 + i * 0.2, 7.25 + i * 0.2)); x += (1 if i % 2 else -1) * 900 * u; y -= 200 * u
            return at(x, y, 1, -((i * 47) % 40 - 20))
        r.art(f'ball-{i}', b, 1.8, 8.2, 30 + i, then(bf, o5))
    r.serif("we've all been there", 107, 2.3, 3.4, then(pop_in(540, 900, 2.3, 2, 0.22, 1.8, 18), slide(3.2, 3.4, -W - 300, -300)), WINE, WHITE)

    # 3 (3.4-5.0) STAGE: the TV rolls in playing the moment; "every single time"
    tv, ssize, soff = tv_hole()
    def tvf(ts):
        k = Ed.back_out(Ed.seg(ts, 3.4, 3.75), 1.3); return at(TVX, Ed.lerp(2600, TVY, k), 1, 2)
    tvf = then(tvf, o5); screen = Ed.child(tvf, soff)
    r.art('tv', tv, 3.4, 8.2, 25, tvf)
    r.clip(0, 3.4, 5.0, 20, screen, size=ssize, src=2.0)
    r.serif('every single time', 107, 3.7, 5.0, pop_in(540, 330, 3.7, 2, 0.22, 1.8, 18), WINE, WHITE)

    # 4 (5.0-6.6) the channel flips: static, then the fix on the TV, growing out of the screen to full frame;
    #   "fixed." + one underline; diagonal out to stage 5
    rnd = random.Random(14); jit = [(rnd.uniform(-30, 30), rnd.uniform(-30, 30)) for _ in range(40)]
    noise = Image.effect_noise((ssize[0] // 3 + 30, ssize[1] // 3 + 30), 100).convert('RGBA').resize((ssize[0] + 90, ssize[1] + 90), Image.NEAREST)
    def nf(ts):
        v = screen(ts); dx, dy = jit[int(ts * 30) % 40]; return at(v['x'] + dx, v['y'] + dy, 1, v['r'])
    r.art('static', noise, 5.0, 5.25, 21, nf)
    r.clip(1, 5.25, 8.2, 20, screen, size=ssize)
    o4 = slide(6.4, 6.6, -W - 300, -300); s0 = ssize[1] / H
    def grow(ts):
        v = screen(ts); u = Ed.ease(Ed.seg(ts, 5.5, 5.9))
        return at(Ed.lerp(v['x'], 540, u), Ed.lerp(v['y'], 960, u), Ed.lerp(s0, 1, u), Ed.lerp(v['r'], 0, u))
    r.clip(1, 5.5, 6.6, 40, then(grow, o4), src=r.R(5.5) - r.R(5.25))
    r.serif('fixed.', 239, 5.9, 6.6, then(pop_in(540, 960, 5.9, -4, 0.22, 1.8, 18), o4), WHITE, WINE)
    r.doodle('under', 0, 560, 6.05, 6.6, then(pop_in(540, 1090, 6.05, -2, 0.35), o4), BUTTER)

    # 5 (6.6-8.2) STAGE: the TV now shows the fix; the balls are swept off; [no more tangles] (one burst behind the TV)
    r.art('burst', art_doodle('burst', 2, 1150, WINE), 6.75, 8.2, 22, then(pop_in(TVX, TVY, 6.75, 0, 0.35), o5))
    r.boxed('[no more tangles]', 62, 7.2, 8.2, then(pop_in(540, 1380, 7.2, -2), o5), WINE, 'no more knots')

    # 6 (8.2-9.8) the fix in use, full frame; [one smooth pass] + one arrow up to the centre; swipes out right
    o6 = slide(9.6, 9.8, W)
    r.clip(2, 8.0, 9.8, 11, then(still(540, 960), enter(8.0, 8.2, W), o6))
    r.boxed('[one smooth pass]', 60, 8.35, 9.8, then(pop_in(540, 1380, 8.35, 2), o6), WHITE, 'one twist, done')
    r.doodle('arrow', 0, 190, 8.7, 9.8, then(pop_in(540, 1215, 8.7, -90, 0.3), o6), WHITE)

    # 7 (9.8-end) CTA: the product on its own; Comment / "[KEYWORD]" / [Product name]
    r.clip(1, 9.6, None, 12, then(still(540, 960), enter(9.6, 9.8, -W)), src=1.0)
    r.serif('Comment', 175, 9.9, None, pop_in(540, 980, 9.9, 3, 0.22, 1.8, 18), WHITE, WINE)
    r.boxed('"[KEYWORD]"', 64, 10.15, None, pop_in(540, 1200, 10.15, -2), WHITE, '"FIXED"')
    r.boxed('[Product name]', 56, 10.4, None, pop_in(540, 1340, 10.4, 2), WINE, 'The Tangle-Free Case')
    return r

def layers():
    return reel().L

STAGE = BUTTER
