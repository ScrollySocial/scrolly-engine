"""06 Start to finish, approved 2026-10-19 (motion test build/motion_06.py, after her note: no wood on wood, a cream
stage). FULLY EDITABLE build (2026-10-20, build/editable.py): every word is CapCut text (DM Serif Display built-in
words, last word Italic; Montserrat for the product line, the materials, the three stages, the "later" note, the 2x
sticker, the bar's percent, the keyword and the town line, the [brackets] on CapCut's text background); the underline,
arrow and tick are Scrolly Doodles letters (recolour like text); the cream bench is CapCut's background colour under a
colourless concrete grain; the hourglass, photo cards, sticky note, sticker and phone are real photos (or paper pieces)
moving on keyframes; the six clips are real clip layers (placeholder cards until the buyer's clips go in): the
materials, stages one to three, the finished one and the finished one in use (also on the phone at the end). Stage
two plays at 2x (CapCut's speed).
CapCut limits: the loading bar is a picture (track and fill; recolour with Adjust > HSL) and its fill growing is a short
flipbook of the fill alone each time it moves (CapCut can't stretch a picture one way); the percent changes when each
fill ends instead of counting up; stage three grows out of an arch-window card that drops away as the clip fills the
frame (CapCut has no arch mask); the motion-blur swipes are plain slides and the diagonal wipes diagonal slides."""
from PIL import Image, ImageDraw, ImageOps
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import editable_a as EA
import motion_06 as M
import motion_capcut as MC
import play as P
import play_extra as X
import collage as C
import storyboard_b2 as S
from motion_b2 import ease, back_out, seg, lerp

SPEC = dict(num='06', title='Start to finish', subtitle='21 seconds. Six clips: materials, three stages, the finished one, in use.',
            font='montserrat', dir='06-start-to-finish', folder='Template 06 - Start to finish', project='06 Start to finish',
            cover_at=0.8,
            slots=[('The raw materials', 'Everything before you start'), ('Stage one', 'The first step, close'),
                   ('Stage two', 'The middle step (long is fine, it plays at 2x)'), ('Stage three', 'The last step'),
                   ('The finished one', 'The finished product, close'), ('In use', 'The finished one being used or held')],
            test_clips=[('IMG_1393', 0.5), ('IMG_1387', 1.5), ('IMG_1389', 2.5), ('IMG_1390', 2.0), ('IMG_1391', 0.0), ('IMG_1394', 1.0)])
W, H = 1080, 1920
INK, WHITE, CRM, WINE, LIGHT = M.INK, (255, 255, 255), M.CRM, X.WINE, X.BUTTER
STAGE = (232, 216, 184)                  # the bench's cream (M.setup colourises the concrete 214,192,150 -> 246,236,214)
BW, BH = 760, 84
FILLS = ((3.7, 0.25, 0.5), (6.7, 0.5, 0.5), (8.3, 0.75, 0.5), (10.1, 1.0, 0.7))   # (start, value, seconds), as M.progress

def word(x, y, t0, r=0.0): return pop_in(x, y, t0, r, 0.22, 1.8, 18)
def swipe_out(t0, d=1): return slide(t0, t0 + 0.25, -d * W)
def swipe_in(t0, d=1): return enter(t0, t0 + 0.25, d * W)
def diag_out(t0): return slide(t0, t0 + 0.25, -W - 300, -420)

def track():
    im = Image.new('RGBA', (BW + 16, BH + 16), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle((8, 8, BW + 8, BH + 8), BH // 2, fill=LIGHT + (255,), outline=INK + (255,), width=6)
    return C.shadow(im, (4, 8), 8, 90)

def fill(p):
    """The bar's fill alone, on a canvas the size of the track picture (same centre)."""
    t = track(); pad = (t.width - BW - 16) // 2; im = Image.new('RGBA', t.size, (0, 0, 0, 0)); fw = max(BH, (BW - 12) * p)
    ImageDraw.Draw(im).rounded_rectangle((pad + 14, pad + 14, pad + 14 + fw, pad + BH + 2), (BH - 12) // 2, fill=WINE + (255,)); return im

def blank_sticker(text, px, fill_=INK):
    """P.sticker's rounded label without its words (the words are text)."""
    f = S.F(P.ANTON, px); l, t, r, b = f.getbbox(text); w, h = r - l + px, b - t + int(px * 0.7)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); ImageDraw.Draw(im).rounded_rectangle((0, 0, w - 1, h - 1), h // 3, fill=fill_ + (255,))
    return P.die_cut(im, 6, False)

def reel():
    g = M.setup(); r = Ed.Reel(M.HOLDS, 15.0)
    r.art('concrete-grain', Ed.grain(S.raw('images', 'Light gray concrete mineral texture-4.png'), 0.22), 0, None, 1, still(540, 960))

    # the loading bar (the carried element): at the top from 1.0 until the camera dives into it at 11.2
    cam7 = EA.zoom_into(10.95, 11.2, (540, 960), 5)
    def barf(ts):
        k = ease(seg(ts, 9.8, 10.1)); s = back_out(seg(ts, 1.0, 1.3)) * lerp(1, 1.35, k); return at(540, lerp(M.BAR_Y, 960, k), s)
    barf = then(barf, cam7)
    r.art('bar-track', track(), 1.0, 11.2, 200, barf)
    edges = [1.0]
    for t0, v, d in FILLS:
        prev = 0.0 if t0 == FILLS[0][0] else [x for x in FILLS if x[0] < t0][-1][1]
        r.art(f'bar-fill-{int(prev * 100)}', fill(prev), edges[-1], t0, 201, barf) if prev > 0 else None
        n = int(d * 15)
        for k in range(n):
            a = t0 + k * d / n; b = t0 + (k + 1) * d / n
            r.art(f'bar-fill-{int(v * 100)}-{k:02d}', fill(lerp(prev, v, ease((k + 1) / n))), a, b, 201, barf)
        edges.append(t0 + d)
    r.art('bar-fill-100', fill(1.0), edges[-1], 11.2, 201, barf)
    starts = [1.0] + [t0 for t0, _, _ in FILLS] + [11.2]   # each percent shows as its fill starts (readable while it fills)
    pct = [(f'{int(v * 100)}%', starts[i], starts[i + 1]) for i, v in enumerate([0.0] + [v for _, v, _ in FILLS])]
    for words, a, b in pct:
        r.text('montserrat', BH * 0.55, (words, words), a, b, barf, WHITE, stroke=(INK, 0.09))   # white, thick ink edge: reads on the butter track and the wine fill

    # 1 (0-2.0) fast cuts of the whole make under the hook; underline; swipes left at 1.75
    o1 = swipe_out(1.75)
    for i, slot in enumerate((0, 1, 3, 5)):
        r.clip(slot, 0.5 * i, 0.5 * (i + 1) if i < 3 else 2.0, 10 + i, then(still(540, 960), o1), src=0.3)
    r.boxed('making one [smoothie]', 58, 0.05, 2.0, then(pop_in(540, 480, 0.05, 2), o1), WINE, 'making one candle')
    r.serif('start to', 156, 0.3, 2.0, then(word(520, 840, 0.3, 3), o1), WHITE, WINE)
    r.serif('finish', 212, 0.55, 2.0, then(word(560, 1040, 0.55, 2), o1), WINE, WHITE)
    r.doodle('under', 0, 600, 0.9, 2.0, then(pop_in(560, 1170, 0.9, 2, 0.35), o1), WINE)

    # 2 (1.75-3.6) BENCH: the raw materials as a photo card; the hourglass lands; "it starts as" + [a pile of fruit]
    i2, o2 = swipe_in(1.75), diag_out(3.35)
    cardim, csize, coff = EA.card_frame(560, 700, 16, 0)
    cf = then(lambda ts: at(440, 1000, back_out(seg(ts, 2.0, 2.3), 1.4), 4), i2, o2)
    r.clip(0, 1.75, 3.6, 20, Ed.child(cf, coff), size=csize)
    r.art('card-raw', cardim, 1.75, 3.6, 21, cf)
    r.art('hourglass', g['glass'], 1.75, 3.6, 22, then(lambda ts: at(840, lerp(-400, 1260, back_out(seg(ts, 2.3, 2.6), 1.5)), 1, -6), i2, o2))
    r.serif('it starts as', 129, 2.2, 3.6, then(word(540, 470, 2.2, 3), i2, o2), WINE, WHITE)
    r.boxed('[a pile of fruit]', 58, 2.5, 3.6, then(pop_in(440, 1430, 2.5, -2), i2, o2), WINE, 'a pile of wax')

    # 3 (3.35-5.2) stage one full frame (bar 25%); [stage one] line, an arrow up at the work; swipes right at 4.95
    o3 = swipe_out(4.95, -1)
    r.clip(1, 3.35, 5.2, 15, then(still(540, 960), o3))   # under scene 2, which slides off it
    r.doodle('arrow', 0, 190, 4.0, 5.2, then(pop_in(540, 1215, 4.0, -90, 0.35), o3), WHITE)
    r.boxed('[stage one: prep]', 56, 3.7, 5.2, then(pop_in(540, 1380, 3.7, 2), o3), WINE, 'stage one: melt')

    # 4 (4.95-6.6) BENCH, no video: the hourglass flips and runs; a sticky note [20 minutes later]; swipes left at 6.35
    i4, o4 = swipe_in(4.95, -1), swipe_out(6.35)
    gl = g['glass']; gl = gl.resize((int(gl.width * 1.3), int(gl.height * 1.3)), Image.LANCZOS)
    r.art('hourglass-big', gl, 4.95, 6.6, 40, then(lambda ts: at(540, 1000, 1, -180 * ease(seg(ts, 5.4, 5.8))), i4, o4))
    full, blank = P.sticky('[20 minutes\nlater]', 440, pin='pin-head-black'), P.sticky('', 440, pin='pin-head-black')
    off = MC.text_anchor(full, blank); nf = then(pop_in(770, 660, 5.7, -6), i4, o4)
    r.art('note-later', blank, 5.7, 6.6, 41, nf)
    r.plain('[20 minutes\nlater]', 62, 5.7, 6.6, Ed.child(nf, off), INK, test='2 days\nlater')

    # 5 (6.35-8.2) stage two full frame at 2x (bar 50%); the >> 2x sticker; diagonal out at 7.95
    i5, o5 = swipe_in(6.35), diag_out(7.95)
    r.clip(2, 6.35, 8.2, 65, then(still(540, 960), i5, o5), speed=2.0)   # over scene 6, which it slides off
    r.boxed('[stage two: mix]', 56, 6.75, 8.2, then(pop_in(540, 1380, 6.75, -2), o5), WINE, 'stage two: pour')
    stk = then(pop_in(800, 620, 7.0, -8), o5)
    r.art('sticker-2x', blank_sticker('>> 2x', 70), 7.0, 8.2, 66, stk)
    r.plain('>> 2x', 70 * 0.62 / 0.85, 7.0, 8.2, stk, WHITE)

    # 6 (7.95-9.8) stage three in an arch-window card on the bench, growing to full frame (bar 75%); swipes right at 9.55
    o6 = swipe_out(9.55, -1)
    aw, ah = 560, 996; k_full = W / aw * 1.01
    def af(ts):
        u = ease(seg(ts, 8.8, 9.4)); return at(540, lerp(1050, 960, u), lerp(1, k_full, u))
    af = then(af, o6)
    arch = Image.new('RGBA', (aw + 32, ah + 32), (0, 0, 0, 0)); d = ImageDraw.Draw(arch)
    d.rectangle((0, 0, aw + 31, ah + 31), fill=(252, 250, 245, 255))
    hole = Image.new('L', arch.size, 0); hd = ImageDraw.Draw(hole); hd.rectangle((16, 16 + aw // 2, 16 + aw, 16 + ah), fill=255); hd.pieslice((16, 16, 16 + aw, 16 + aw), 180, 360, fill=255)
    arch.putalpha(Image.composite(Image.new('L', arch.size, 0), arch.split()[3], hole)); arch = C.shadow(arch, (8, 14), 14, 100)
    r.clip(3, 7.95, 9.8, 60, af, size=(aw, ah))
    r.art('arch-card', arch, 7.95, 9.3, 61, then(af, slide(9.1, 9.3, 0, 2200)))
    r.boxed('[stage three: blend]', 56, 8.3, 9.8, then(pop_in(540, 1380, 8.3, 2), o6), WINE, 'stage three: set')

    # 7 (9.55-11.2) BENCH, no video: the bar comes down big and fills to 100%; "almost..."; every stage as a photo card;
    #   a tick at 100%; the camera dives into the bar
    i7 = swipe_in(9.55, -1)
    sm, ssz, sof = EA.card_frame(250, 320, 12, 0)
    for i, (slot, x, rr) in enumerate(((1, 230, 7), (2, 520, -4), (3, 810, 3))):
        pf = then(lambda ts, i=i, x=x, rr=rr: at(x, 1330, back_out(seg(ts, 9.9 + i * 0.12, 10.2 + i * 0.12), 1.5), rr), i7, cam7)
        r.clip(slot, 9.55, 11.2, 70 + 2 * i, Ed.child(pf, sof), size=ssz, src=1.0)
        r.art(f'card-stage{i + 1}', sm, 9.55, 11.2, 71 + 2 * i, pf)
    r.serif('almost...', 147, 10.0, 11.2, then(word(540, 700, 10.0, 3), cam7), WINE, WHITE)
    r.doodle('tick', 0, 240, 10.8, 11.2, then(pop_in(900, 820, 10.8, 0, 0.35), cam7), INK)

    # 8 (11.2-13.0) the finished one, full frame (the camera settles), then in use; "finished."
    def settle(ts):
        s = lerp(1.4, 1, ease(seg(ts, 11.2, 11.5))); return at(540, 960, s)
    r.clip(4, 11.2, 11.9, 80, settle)
    r.clip(5, 11.9, 13.0, 81, still(540, 960), src=0.5)
    r.serif('finished.', 175, 11.4, 13.0, word(540, 700, 11.4, 3), WHITE, WINE)

    # 9 (13.0-end) CTA: the phone stands on the bench, the finished one on its screen; Comment / [KEYWORD] / [town]
    im, _, _ = P.device(M.PHONE, 640); phone, ssize, soff = Ed.device_hole(P.die_cut(im, 8))
    ph = lambda ts: at(560, lerp(2300, 1340, ease(seg(ts, 13.0, 13.3))), 1, 3)
    r.clip(5, 13.0, None, 90, Ed.child(ph, soff), size=ssize, src=1.5)
    r.art('phone', phone, 13.0, None, 91, ph)
    r.serif('Comment', 166, 13.3, None, word(520, 330, 13.3, 3), WHITE, WINE)
    r.boxed('"[KEYWORD]"', 64, 13.55, None, pop_in(520, 480, 13.55, -2), WHITE, '"MADE"')
    r.boxed('[handmade in Austin]', 50, 13.75, None, pop_in(520, 600, 13.75, 2), WINE, 'handmade in Leeds')
    return r

def layers():
    return reel().L
