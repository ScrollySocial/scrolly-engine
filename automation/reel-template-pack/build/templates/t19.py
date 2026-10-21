"""19 Pair it with, approved 2026-10-19 (motion test build/motion_19.py, "love it"). FULLY EDITABLE build (2026-10-20,
build/editable.py, like t24): every word is CapCut text (DM Serif Display built-in words "what to pair?", the
question marks, "pair it with", "a perfect pair", "Comment"; Montserrat [brackets] on CapCut's text background: the
three pairings, why they go together, the bundle name and the keyword); the sparkles and hearts are Scrolly Doodles
letters (recolour like text); the pink stage is CapCut's background colour under a colourless tissue grain; the gold
locket is a real photo with its two openings punched out, the clips playing under them (so the gold rim frames each
oval), and the camera zooms out of the product and dives into the right half on keyframes; her gold chain is a real
photo; the four clips are real clip layers (placeholder cards until the buyer's clips go in).
Two locket scenes: the one locket (product left, the pairings turning in the right half) and the CTA's two lockets on
her chain (the product + its three pairs) over the product full frame.
CapCut limits: the locket's page turn is a turn on the hinge (the old pairing folds down to the hinge and the next opens
out of it, both at full height ratio: CapCut can't squash a clip on one side), an improvement on the flipbook build's
wipe; the chain doesn't stretch as the lockets drop (it hangs at its final length and drops with them); the swipes are
plain slides (no motion blur)."""
from PIL import Image
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import motion_19 as M
import play as P
import storyboard_b2 as S
import collage as C

SPEC = dict(num='19', title='Pair it with', subtitle='20 seconds. Four clips: your product and three things that go with it.',
            font='montserrat', dir='19-pair-it-with', folder='Template 19 - Pair it with', project='19 Pair it with',
            cover_at=1.0,
            slots=[('Your product', 'Your product, moving'), ('Pair 1', 'Something that goes with it'),
                   ('Pair 2', 'A second thing that goes with it'), ('Pair 3', 'A third thing that goes with it')],
            test_clips=[('IMG_1464', 2.0), ('IMG_1422', 7.5), ('IMG_1439', 0.5), ('IMG_1436', 2.0)])
WHITE, PINK, WINE, CRM = (255, 255, 255), M.PINK, M.WINE, M.CRM
W, H = 1080, 1920
LX, LY = M.LC

def pop(x, y, t0, r=0.0): return pop_in(x, y, t0, r, 0.22, 1.8, 18)

def locket_holes():
    """The styled locket (motion_19.setup) with both openings punched out: (image, [(hole size, offset)] for left/right)."""
    lk = Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Open vintage gold locket, blank inside.png').convert('RGBA')
    im = P.style_object(S.fitw(lk, M.LW), None, None, edge=8); rw, rh = im.width - 2 * M.PAD, im.height - 2 * M.PAD; holes = []
    for (fx, fy), (ax, ay) in M.OVALS:
        box = (M.PAD + (fx - ax) * rw, M.PAD + (fy - ay) * rh, M.PAD + (fx + ax) * rw, M.PAD + (fy + ay) * rh)
        im, size, off = Ed.window(im, tuple(int(v) for v in box), ellipse=True); holes.append((size, off))
    return im, holes

def view(ts):
    """motion_19's camera on the locket: (focus, zoom)."""
    if ts < 1.8: return M.oval_centre(0), Ed.lerp(4.8, 1.0, Ed.ease(Ed.seg(ts, 0.35, 1.25)))
    if 3.0 <= ts < 3.5: return M.oval_centre(1), Ed.lerp(1.0, 4.8, Ed.ease(Ed.seg(ts, 3.0, 3.5)) ** 2)
    if 4.6 <= ts < 6.2: return M.oval_centre(1), Ed.lerp(4.8, 1.0, Ed.ease(Ed.seg(ts, 4.6, 5.0)))
    return (540, 960), 1.0

def cam(f):
    def g(ts):
        v = f(ts); (fx, fy), s = view(ts)
        if s <= 1.001: return v
        w, h = W / s, H / s; x0 = min(max(fx - w / 2, 0), W - w); y0 = min(max(fy - h / 2, 0), H - h)
        return dict(v, x=(v['x'] - x0) * s, y=(v['y'] - y0) * s, s=v.get('s', 1.0) * s)
    return g

def in_half(parent, hole, k=None, hinge=False):
    """A clip in one half of the locket: rides on the locket (parent), scaled by k(ts) about the oval's centre, or about
    its hinge side (the page turn)."""
    (w, h), (ox, oy) = hole
    def f(ts):
        v = parent(ts); kk = 1.0 if k is None else k(ts); s = v.get('s', 1.0)
        dx = (ox - w / 2 + w * kk / 2) if hinge else ox
        ddx, ddy = Ed.rot((dx * s, oy * s), v.get('r', 0.0))
        return at(v['x'] + ddx, v['y'] + ddy, s * kk, v.get('r', 0.0))
    return f

def turn(t0, out):
    """The page turn's scale: the old page folds to the hinge over t0..t0+0.25, the new one opens out to t0+0.5."""
    if out: return lambda ts: 1 - Ed.ease(Ed.seg(ts, t0, t0 + 0.25))
    return lambda ts: Ed.ease(Ed.seg(ts, t0 + 0.25, t0 + 0.5))

def reel():
    r = Ed.Reel(M.HOLDS, 12.5)
    r.art('tissue-grain', Ed.grain(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png')), 0, None, 1, still(540, 960))
    lk, (hl, hr) = locket_holes()

    # 1-5 (0-8.4) the locket: the product video zooms out into the left half; ?s float out of the empty right half;
    #   pairing 1 grows into it; the camera dives into pairing 1 (full frame 3.5-4.6) and back out; the right half
    #   turns to pairing 2 (5.1) and pairing 3 (6.5); diagonal out at 8.15
    o5 = slide(8.15, 8.4, -W - 300, -300)
    lf = then(cam(still(LX, LY)), o5)
    r.art('locket', lk, 0, 8.4, 30, lf)
    r.clip(0, 0, 8.4, 20, in_half(lf, hl), size=hl[0])
    grow = lambda ts: Ed.back_out(Ed.seg(ts, 1.9, 2.3), 1.4) if ts >= 1.9 else 0
    r.clip(1, 1.9, 5.6, 21, in_half(lf, hr, lambda ts: grow(ts) * turn(5.1, True)(ts), hinge=True), size=hr[0], src=0.0)
    r.clip(2, 5.1, 7.0, 22, in_half(lf, hr, lambda ts: turn(5.1, False)(ts) * turn(6.5, True)(ts), hinge=True), size=hr[0])
    r.clip(3, 6.5, 8.4, 23, in_half(lf, hr, turn(6.5, False), hinge=True), size=hr[0])
    r.clip(1, 3.5, 4.6, 40, still(540, 960), src=r.R(3.5) - r.R(1.9))           # pairing 1 full frame (out of the dive)

    r.serif('what to', 175, 0.05, 1.8, pop(500, 340, 0.05, 3), WHITE, WINE)
    r.serif('pair?', 276, 0.25, 1.8, pop(560, 540, 0.25, 2), WHITE, WINE, italic_last=False)
    rx, ry = M.oval_centre(1)
    for i, (dx, dy, sz) in enumerate(((-60, -520, 1.0), (170, -380, 0.8), (-200, -300, 0.65), (230, -620, 0.7), (40, -760, 0.55))):
        t0 = 1.15 + i * 0.15
        def qf(ts, i=i, dx=dx, dy=dy, t0=t0):
            u = Ed.ease(Ed.seg(ts, t0, t0 + 0.6)); m = Ed.math
            x, y = rx + dx * u + 14 * m.sin(ts * 3 + i), ry + dy * u + 10 * m.sin(ts * 4 + i)
            v = Ed.ease(Ed.seg(ts, 1.9, 2.2)); x += (1 if i % 2 else -1) * 900 * v; y -= 300 * v
            return at(x, y, min(1, u * 1.5), -((i * 23) % 30 - 15))
        r.serif('?', 330 * sz, t0, 2.2, qf, WINE, CRM, italic_last=False)

    for a, b in ((1.95, 3.0), (4.8, 8.4)):                             # the headline above the locket in every pairing scene
        oo = o5 if b > 8 else (lambda ts, v: v)
        r.serif('pair it', 212, a, b, then(pop(540, 330, a, 3), oo), WINE, WHITE)
        r.serif('with', 184, a + 0.2, b, then(pop(600, 540, a + 0.2, -2), oo), WINE, WHITE, italic_last=False)
    r.boxed('+ [the stick vacuum]', 62, 2.3, 3.0, pop_in(540, 1470, 2.3, 2), PINK, '+ the stick vacuum')
    r.boxed('[why they go together]', 60, 3.6, 4.6, pop_in(540, 1380, 3.6, 2), PINK, 'one clean sweep')
    r.boxed('+ [the odor spray]', 62, 5.5, 6.2, pop_in(540, 1470, 5.5, -2), WHITE, '+ the odor spray')
    r.boxed('+ [the litter]', 62, 6.9, 8.4, then(pop_in(540, 1470, 6.9, 2), o5), PINK, '+ the litter')

    def sparkle(pts, t0, b, size=140, moves=()):
        for i, (x, y) in enumerate(pts):
            ti = t0 + i * 0.1
            def sp(ts, x=x, y=y, i=i, ti=ti):
                k = Ed.back_out(Ed.seg(ts, ti, ti + 0.25), 2.2) * (0.8 + 0.25 * Ed.math.sin((ts - ti) * 7 + i * 1.7)) if ts >= ti else 0
                return at(x, y, k * (0.7 + 0.3 * (i % 3) / 2), -15 * Ed.math.sin(ts * 2 + i))
            r.doodle('icon', 8, size, ti, b, then(sp, *moves), WINE)
    sparkle([(880, 640), (990, 900)], 2.3, 3.0)
    sparkle([(140, 700), (960, 640), (930, 1350)], 7.0, 8.4, moves=(o5,))

    # 6 (8.4-10.0) "a perfect pair": the locket rises again with the product and pairing 1; hearts + sparkles
    o6 = slide(9.75, 10.0, W)
    lf6 = then(lambda ts: at(LX, Ed.lerp(2400, LY, Ed.back_out(Ed.seg(ts, 8.4, 8.75), 1.3))), o6)
    r.clip(0, 8.15, 10.0, 50, in_half(lf6, hl), size=hl[0], src=1.0)
    r.clip(1, 8.15, 10.0, 51, in_half(lf6, hr), size=hr[0], src=1.0)
    r.art('locket-2', lk, 8.15, 10.0, 52, lf6)
    r.serif('a perfect pair', 129, 8.6, 10.0, then(pop(540, 380, 8.6, 3), o6), WINE, WHITE)
    for i, ((x, y), rr) in enumerate((((150, 640), -15), ((930, 600), 12), ((880, 1560), -8))):
        ti = 8.8 + i * 0.12
        def hf(ts, x=x, y=y, rr=rr, i=i, ti=ti):
            return at(x, y, Ed.back_out(Ed.seg(ts, ti, ti + 0.25), 2.0) if ts >= ti else 0, -(rr + 6 * Ed.math.sin(ts * 3 + i)))
        r.doodle('icon', 2 + i % 2, 150, ti, 10.0, then(hf, o6), WINE, WHITE)
    sparkle([(250, 1500), (980, 900), (100, 1000)], 8.9, 10.0, moves=(o6,))

    # 7 (9.75-end) CTA: the product full frame; two lockets on her chain drop in (the product + its three pairs);
    #   [bundle name] / Comment / "[KEYWORD]"
    r.clip(0, 9.75, None, 10, then(still(540, 960), enter(9.75, 10.0, -W)), src=2.0)
    ch = Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Fine gold necklace chain.png').convert('RGBA')
    ch = ch.crop((0, 0, ch.width, int(ch.height * 0.945))).resize((230, 560 - 195 + 40))
    # half-size locket (a scale that never changes is dropped from the keyframes, so the art is shrunk instead)
    lkh = lk.resize((lk.width // 2, lk.height // 2), Image.LANCZOS)
    hlh, hrh = [((w // 2, h // 2), (ox / 2, oy / 2)) for (w, h), (ox, oy) in (hl, hr)]
    for i, (x, slots) in enumerate(((285, (0, 1)), (795, (2, 3)))):
        t0 = 10.0 + i * 0.15
        def lfc(ts, x=x, i=i, t0=t0):
            y = Ed.lerp(-400, 560, Ed.back_out(Ed.seg(ts, t0, t0 + 0.4), 1.4)); return at(x, y, 1, -3 * Ed.math.sin(ts * 2 + i * 1.3))
        def chf(ts, lfc=lfc, x=x):
            v = lfc(ts); bx, by = x + 122, v['y'] - 195; return at(bx, by + 30 - ch.height / 2)
        z0 = 60 + 5 * i
        r.art(f'chain-{i}', ch, 10.0, None, z0, chf)
        r.clip(slots[0], 10.0, None, z0 + 1, in_half(lfc, hlh), size=hlh[0], src=1.5)
        r.clip(slots[1], 10.0, None, z0 + 2, in_half(lfc, hrh), size=hrh[0], src=1.5)
        r.art(f'locket-cta-{i}', lkh, 10.0, None, z0 + 3, lfc)
    r.boxed('[the clean-home bundle]', 60, 10.3, None, pop_in(540, 860, 10.3, 2), PINK, 'the clean-home bundle')
    r.serif('Comment', 175, 10.6, None, pop(540, 1150, 10.6, 3), WHITE, WINE)
    r.boxed('"[KEYWORD]"', 64, 10.85, None, pop_in(540, 1330, 10.85, -2), WHITE, '"PAIR"')
    return r

def layers():
    return reel().L

STAGE = PINK
