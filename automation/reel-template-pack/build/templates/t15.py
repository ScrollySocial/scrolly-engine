"""15 New drop reveal, approved 2026-10-19 as the round-4 motion test (build/story7.py frame_15, "ok"). FULLY EDITABLE
build (2026-10-20, build/editable.py, like t24): every word is CapCut text (DM Serif Display built-in words new / drop,
dropping in, 3 2 1, finally., out, Comment; Montserrat [brackets] on CapCut's text background: the hook, the product
name, the three details, the date, the shop line and the keyword pill); the burst, arrow, tick and underline are
Scrolly Doodles letters (recolour like text); the butter stage is CapCut's background colour under a colourless tissue
grain; the kitchen timer, the wine tissue sheet, the photo card, the laptop, the planner and the ticket stub are real
photos moving on keyframes; the five clips are real clip layers (placeholder cards until the buyer's clips go in).
The opening is her idea: the drop clip is full screen and a second copy of it has CapCut's Remove background on, so
the one dust cloud sits between them (behind the product) and new / drop sit in front. If CapCut doesn't cut the
product out on its own, select the top copy of clip 1 > Remove background > Auto.
CapCut limits: the dust cloud grows and shrinks away (no fade); the tissue sheet's tear doesn't breathe; the reveal
has no white flash; the swipes are plain slides (no motion blur)."""
from PIL import Image, ImageDraw
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import play as P
import storyboard_b2 as S
import collage as C
import story7 as S7

SL = P.SLOW; LAND = S7.LAND15; SECS = S7.SECS['15']
SPEC = dict(num='15', title='New drop reveal', subtitle='27 seconds. Five clips: the drop, three close-ups, in use.',
            font='montserrat', dir='15-new-drop-reveal', folder='Template 15 - New drop reveal', project='15 New drop reveal', cover_at=1.0,
            slots=[('The drop', 'Your product dropping onto a table, full frame, landing about half a second in (at least 7 seconds)'),
                   ('Close-up one', 'One detail, close up'), ('Close-up two', 'A second detail'),
                   ('Close-up three', 'A third detail'), ('In use', 'Your product being used')],
            test_clips=[('IMG_1381', 1.0), ('IMG_1388', 0.5), ('IMG_1417', 0.5), ('IMG_1463', 1.0), ('IMG_1391', 1.0)])
INK, WHITE, WINE, BU = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['butter']
W, H = 1080, 1920

class Slow:
    """story7 runs SLOW times longer than its story times: layers here are written on story time and placed on
    script time = story * SL (no holds)."""
    def __init__(self): self.r = Ed.Reel([], SECS * SL)
    def _w(self, a, b, f): return a * SL, (None if b is None else b * SL), (lambda ts: f(ts / SL))
    def art(self, name, img, a, b, z, f): a, b, f = self._w(a, b, f); self.r.art(name, img, a, b, z, f)
    def clip(self, slot, a, b, z, f, src=0.0, **kw): a, b, f = self._w(a, b, f); self.r.clip(slot, a, b, z, f, src=src * SL, **kw)
    def serif(self, words, px, a, b, f, *args, **kw): a, b, f = self._w(a, b, f); self.r.serif(words, px, a, b, f, *args, **kw)
    def boxed(self, words, px, a, b, f, *args, **kw): a, b, f = self._w(a, b, f); self.r.boxed(words, px, a, b, f, *args, **kw)
    def plain(self, words, px, a, b, f, *args, **kw): a, b, f = self._w(a, b, f); self.r.plain(words, px, a, b, f, *args, **kw)
    def text(self, font, px, words, a, b, f, *args, **kw): a, b, f = self._w(a, b, f); self.r.text(font, px, words, a, b, f, *args, **kw)
    def doodle(self, kind, i, px, a, b, f, *args, **kw): a, b, f = self._w(a, b, f); self.r.doodle(kind, i, px, a, b, f, *args, **kw)

def pop(x, y, t0, r=0.0): return pop_in(x, y, t0, r, 0.22, 1.8, 18)       # the say/pop entry (story time)

def drop_geom(ts):
    """The drop shot's frame (story7.drop_shot_15): falling in, the shake on the landing."""
    fall = Ed.back_out(Ed.seg(ts, 0.0, LAND), 1.25); m = Ed.math
    shake = 18 * m.exp(-(ts - LAND) * 8) * m.sin((ts - LAND) * 48) if ts > LAND else 0
    z = Ed.lerp(1.38, 1.05, fall); vw, vh = W * z, H * z
    x0 = max(W - vw, min(0, (W - vw) / 2 + shake)); y0 = max(H - vh, min(0, (H - vh) / 2 - 300 * (1 - fall) + shake * 0.5))
    return at(x0 + vw / 2, y0 + vh / 2, z)

def reel():
    R = Slow(); s = {}
    from PIL import ImageOps
    tissue = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))
    R.art('tissue-grain', Ed.grain(tissue.convert('RGB')), 0, None, 1, still(540, 960))

    # 1 (0-2.4) the drop, full frame, with a cut-out copy on top; ONE dust cloud between them; new / drop in front
    o1 = slide(2.1, 2.4, -W)
    R.clip(0, 0, 2.4, 10, then(drop_geom, o1))
    sheet_ = S.raw('doodles', 'Six soft watercolor blobs in a grid-22.png').convert('RGB')
    bl = ImageOps.grayscale(sheet_.crop((165, 0, 595, 430))); dust = ImageOps.colorize(ImageOps.autocontrast(bl), (214, 208, 200), (255, 255, 255)).convert('RGBA')
    from PIL import ImageFilter
    dust.putalpha(bl.point(lambda v: max(0, min(250, int((253 - v) * 10)))).filter(ImageFilter.GaussianBlur(10)))
    dust = C.shadow(dust.resize((820, 560), Image.LANCZOS), (0, 6), 14, 40)
    def df(ts):
        q = Ed.seg(ts, LAND, LAND + 1.0); k = (0.9 + 1.3 * Ed.ease(q)) * (1 - Ed.ease(Ed.seg(ts, LAND + 0.75, LAND + 1.0)))
        return at(540, 780 - 160 * Ed.ease(q), k)
    R.art('dust', dust, LAND, LAND + 1.0, 11, df)
    R.clip(0, 0, 2.4, 12, then(drop_geom, o1))
    R.r.L.L[-1]['cutout'] = True; R.r.L.L[-1]['size'] = (W + 8, H + 8)
    for word, xw, t0, rr, font in (('new', 255, 0.0, 4, 'dms'), ('drop', 785, 0.05, -3, 'dmsi')):
        def wf(ts, xw=xw, t0=t0, rr=rr):
            k = Ed.back_out(Ed.seg(ts, t0, LAND), 1.4); return at(xw, Ed.lerp(250, 520, k), 1, rr)
        R.text(font, 215, word, 0, 2.4, then(wf, o1), BU, stroke=(WINE, 0.03), shadow=True)
    R.boxed('[something new\nis coming]', 72, 0.7, 2.4, then(pop_in(540, 300, 0.7, 2), o1), WHITE, 'something new\nis coming')

    # 2 (2.4-4.6) STAGE: the kitchen timer winds down; dropping in / 3 2 1
    o2 = slide(4.3, 4.6, -W); i2 = enter(2.1, 2.4, W)
    timer = P.thing('Cream Retro Kitchen Timer Dial.png', 620, 'smalldots', WINE, scale=0.4, strength=0.22)
    def tf(ts):
        m = Ed.math; jolt = sum(9 * m.exp(-(ts - t0) * 9) * m.sin((ts - t0) * 45) for t0 in (2.7, 3.05, 3.4) if ts > t0)
        return at(540 + jolt, 1200, Ed.back_out(Ed.seg(ts, 2.4, 2.7), 1.5), -(Ed.lerp(-120, 0, Ed.ease(Ed.seg(ts, 2.6, 4.2))) + jolt))
    R.art('timer', timer, 2.4, 4.6, 20, then(tf, o2))
    R.serif('dropping in', 170, 2.5, 4.6, then(pop(540, 360, 2.5), o2), WINE, WHITE)
    for i, t0 in enumerate((2.7, 3.05, 3.4)):
        R.serif('321'[i], 300, t0, 4.6, then(pop_in(300 + 240 * i, 640, t0, (6, -4, 3)[i], 0.25, 2.6), o2), WINE, WHITE)

    # 3 (4.3-6.8) the product under the wine sheet torn open down the middle; the flaps rip away (4.9); finally. +
    #   [PRODUCT NAME] with one burst behind it
    o3 = slide(6.5, 6.8, -W); i3 = enter(4.3, 4.6, W)
    def rv(ts):
        z = Ed.lerp(1.15, 1.0, Ed.ease(Ed.seg(ts, 4.95, 5.6))) if ts >= 4.9 else 1.0; return at(540, 960, z)
    R.clip(0, 4.3, 6.8, 10, then(rv, i3, o3), src=2.1)
    sheet = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tissue), (78, 10, 30), (150, 42, 72)), (W, H)).convert('RGBA')
    left, right = S7.slit_edges(710)
    for side, edge in ((-1, left), (1, right)):
        m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0 if side < 0 else W, 0)] + edge + [(0 if side < 0 else W, H)], fill=255)
        half = sheet.copy(); half.putalpha(m.filter(ImageFilter.GaussianBlur(1.2))); half = C.shadow(half, (side * 10, 16), 14, 110)
        def ff(ts, side=side):
            tug = 10 * Ed.math.sin(ts * 60) * Ed.seg(ts, 4.6, 4.75) * (1 - Ed.seg(ts, 4.8, 4.9)); u = Ed.seg(ts, 4.9, 5.35)
            return at(540 + tug + side * 1100 * Ed.ease(u), 960 + 200 * u * u, 1, side * 14 * u)
        R.art(f'flap-{"lr"[side > 0]}', half, 4.3, 5.35, 15 + (side > 0), then(ff, i3))
    R.doodle('burst', 2, 700, 5.7, 6.8, then(pop_in(540, 600, 5.7, 0, 0.3, 1.5), o3), BU)
    R.serif('finally.', 220, 5.3, 6.8, then(pop(540, 420, 5.3), o3), WHITE, WINE, italic_last=False)
    R.boxed('[PRODUCT NAME]', 84, 5.7, 6.8, then(pop_in(540, 600, 5.7, 2), o3), WINE, 'The Glow Brush')

    # 4 (6.8-8.8) STAGE: close-up one on a clean white photo card settling onto the stage; [detail one]
    o4 = slide(8.5, 8.8, -W)
    cw, ch, bd = 760, 980, 18
    card = Image.new('RGBA', (cw + 2 * bd, ch + 2 * bd), (0, 0, 0, 0)); ImageDraw.Draw(card).rounded_rectangle((0, 0, card.width - 1, card.height - 1), 4, fill=WHITE + (255,))
    card = C.shadow(card, (8, 14), 14, 110)
    def cf(ts):
        return at(540, Ed.lerp(1150, 1060, Ed.ease(Ed.seg(ts, 6.8, 7.2))), Ed.back_out(Ed.seg(ts, 6.8, 7.1), 1.4) if ts >= 6.8 else 0,
                  -Ed.lerp(-8, 3, Ed.ease(Ed.seg(ts, 6.8, 7.2))))
    cf = then(cf, o4)
    R.art('photo-card', card, 6.8, 8.8, 20, cf)
    R.clip(1, 6.8, 8.8, 21, cf, size=(cw, ch))
    R.boxed('[detail one]', 78, 7.0, 8.8, then(pop_in(540, 380, 7.0, 2), o4), WHITE, 'ceramic barrel')

    # 5 (8.8-10.8) STAGE: the laptop rises onto the stage, its screen close-up two; [detail two]
    o5 = slide(10.5, 10.8, -W)
    im, _, _ = P.device(S7.LAPTOP, 1040); lap, ssize, soff = Ed.device_hole(P.die_cut(im, 8))
    lf = then(lambda ts: at(540, Ed.lerp(2400, 1120, Ed.back_out(Ed.seg(ts, 8.8, 9.15), 1.2))), o5)
    R.clip(2, 8.8, 10.8, 20, Ed.child(lf, soff), size=ssize)
    R.art('laptop', lap, 8.8, 10.8, 21, lf)
    R.boxed('[detail two]', 78, 9.1, 10.8, then(pop_in(540, 420, 9.1, 2), o5), BU, 'two heat settings')

    # 6 (10.8-12.8) detail three, full frame; one arrow toward the centre; [detail three]
    o6 = slide(12.5, 12.8, -W)
    R.clip(3, 10.5, 12.8, 11, then(still(540, 960), enter(10.5, 10.8, W), o6))
    R.boxed('[detail three]', 78, 10.9, 12.8, then(pop_in(540, 330, 10.9, 2), o6), WHITE, 'cord that turns')
    R.doodle('arrow', 9, 220, 11.2, 12.8, then(pop_in(330, 470, 11.2, 0, 0.3), o6), BU)

    # 7 (12.8-14.8) STAGE: the planner, the drop day ticked; the ticket stub drops in: out / [Fri 24 Oct], one underline
    o7 = slide(14.5, 14.8, -W)
    cal = S.raw('fall', 'Minimal October calendar page-40.png').convert('RGBA').crop((100, 300, 1160, 1100))
    planner = C.shadow(S.fitw(cal, 980), (8, 14), 14, 90)
    R.art('planner', planner, 12.8, 14.8, 20, then(lambda ts: at(540, Ed.lerp(2400, 900, Ed.back_out(Ed.seg(ts, 12.8, 13.1), 1.2)), 1, 3), o7))
    R.doodle('tick', 0, 120, 13.2, 14.8, then(pop_in(680, 690, 13.2, 3, 0.3), o7), WINE)
    stub = P.die_cut(P.raw_cut('Blank peach perforated ticket stub-22.png', 900), 8)
    def sf(ts):
        k = Ed.back_out(Ed.seg(ts, 13.0, 13.35), 1.4); return at(540, Ed.lerp(-400, 1300, k), 1, -Ed.lerp(-30, -4, k))
    sf = then(sf, o7)
    R.art('ticket-stub', stub, 13.0, 14.8, 22, sf)
    R.serif('out', 150, 13.0, 14.8, Ed.child(sf, (-0.28 * 900, 0)), WINE, WHITE)
    R.plain('[Fri 24 Oct]', 66 / 0.85, 13.0, 14.8, Ed.child(sf, (0.14 * 900, 0)), INK, test='Fri 24 Oct')
    R.doodle('under', 0, 340, 13.6, 14.8, then(pop_in(540 + 0.14 * 900, 1362, 13.6, 4, 0.3), o7), WINE)

    # 8-9 (14.8-end) in use, full frame; CTA sandwich: get it at [shop] / Comment / "[KEYWORD]"
    R.clip(4, 14.5, None, 12, then(still(540, 960), enter(14.5, 14.8, W)))
    R.boxed('get it at [shop]', 76, 16.7, None, pop_in(540, 868, 16.7, 2), WHITE, 'get it at my shop')
    R.serif('Comment', 210, 16.85, None, pop(540, 1050, 16.85), WHITE, WINE, italic_last=False)
    R.boxed('"[KEYWORD]"', 78, 17.18, None, pop_in(540, 1235, 17.18, -2), WINE, '"BRUSH"', round_=1.0)
    return R.r

def layers():
    return reel().L

STAGE = BU
