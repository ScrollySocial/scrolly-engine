"""#21 Small batch, motion test round 2 (2026-10-18). Her notes on round 1: gingham under the wire-rack grid read as
"double plaid", and the only objects were tags. Round 2: a calm kraft-paper stage (the bakery counter), the count told
by the batch clip itself splitting into 24 tiles that flip in a wave, and a different real object in each scene: a
rubber stamp printing SMALL BATCH, the cooling rack as the stand under the clip, one kraft tag for the batch number, a
shipping box for "ships Friday". The REAL count only (pack rule: never fake "almost gone"). Palette: butter + ink.
Tech: one picked up, on a phone standing on the paper (whole screen = one video slot).
Story (5 beats): hook "this week's batch: [24] [sets]" / problem: made in small batches, not a factory / product: the
batch, one up close / proof: [one detail about this batch] / CTA: comment [KEYWORD].
Scenes (graphics-only: 2, 5; tech: 4):
 1 0.0  the batch from above; it splits into 24 tiles that flip over one by one (the count) and come back together;
        "this week's batch" + [24 dumbbell sets]
 2 1.8  KRAFT, no video: the rubber stamp comes down and prints SMALL BATCH; [24 made, by hand]
 3 3.6  the slow pass, as a photo card resting on the real cooling rack, panning
 4 5.2  one picked up, on a phone standing on the paper; [each one checked by hand] + one arrow up
 5 6.8  KRAFT, no video: one kraft tag: "batch no. [07]" + [next batch: Oct 30], one burst behind the tag
 6 8.4  one being packed, full frame; the real shipping box slides up into the corner; [yours ships Friday] + underline
 7 10.0 CTA: Comment / [KEYWORD] / [Product name]
Usage: python build/motion_21.py [seconds ...]  ->  21-small-batch/preview/motion-test.mp4 (or a test sheet)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
import play_extra as X
from story4 import swipe, diagonal
from collage_kit import doodle, doodle_on
from motion_b2 import Clip, put, render, camera, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (24, 23, 22), (246, 241, 232); BUTTER = X.BUTTER                       # her palette: butter (+ ink)
X.use_type(BUTTER, INK); X.enable_holds()
DIR = '21-small-batch'
PHONE = 'Graphite Smartphone With Green Screen-38.png'
HOLDS = [(1.55, 1.0), (3.35, 1.1), (4.95, 2.2), (6.55, 1.0), (8.15, 1.5), (9.75, 1.0), (12.45, 0.4)]

def tag_with(text, w, px):
    t = P.raw_cut('Blank kraft hang tag with twine-116.png', w).copy()
    ImageDraw.Draw(t).multiline_text((t.width / 2, t.height * 0.66), text, font=S.F(X.SERIF, px), fill=INK, anchor='mm', align='center'); return P.die_cut(t, 6)

def ink_word(text, px=150, color=INK):
    """SMALL BATCH in rubber-stamp ink: rough where the ink missed (her painted dots as the gaps), a box round it."""
    f = S.F(P.ANTON, px); l, t, r, b = f.getbbox(text); w, h = r - l + 70, b - t + 70
    m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m); d.text((35 - l, 35 - t), text, font=f, fill=255); d.rectangle((6, 6, w - 6, h - 6), outline=255, width=10)
    gaps = ImageOps.grayscale(S.raw('doodles', 'Hand-painted polka dots on black-15.png')).resize((w, h)).point(lambda v: 0 if v > 140 else 255)
    im = Image.new('RGBA', (w, h), color + (0,)); im.putalpha(ImageChops.multiply(m, gaps).point(lambda v: int(v * 0.9))); return im

def setup():
    g = {'c': {'batch': Clip('IMG_1522', 0.0, 4.0), 'pass': Clip('IMG_1522', 0.0, 4.0), 'pick': Clip('IMG_1471', 5.5), 'pack': Clip('IMG_1474', 10.0), 'cta': Clip('IMG_1472', 1.0)}}
    kp = ImageOps.grayscale(S.raw('images', 'Partly unrolled brown kraft paper-149.png')); w_, h_ = kp.size
    g['kraft'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(kp.crop((int(w_ * 0.25), int(h_ * 0.3), int(w_ * 0.75), int(h_ * 0.7)))), (150, 112, 70), (214, 178, 128)), (W, H)).convert('RGBA')
    g['rack'] = C.shadow(S.fitw(Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Silver wire baking cooling rack-113.png').convert('RGBA'), 1060), (8, 14), 10, 110)
    st = Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Vintage Rubber Stamp and Ink Pad-17.png').convert('RGBA')
    g['stamp'] = P.style_object(S.fitw(st.crop((0, 0, int(st.width * 0.42), st.height)), 400), 'stripes', BUTTER, scale=0.3, strength=0.5, edge=8)
    g['ink'] = ink_word('SMALL BATCH', 190)
    g['batchtag'] = tag_with('batch no.\n[07]', 520, 96)
    g['box'] = P.thing('Plain kraft cardboard shipping box-230.png', 460, None, None, label=P.sticker('FRIDAY', 44, INK), label_at=(0.5, 0.45)) \
        if (S.E.PACK / 'build' / '.cache' / 'hq' / 'Plain kraft cardboard shipping box-230.png').exists() else P.thing('Unmarked cardboard shipping box-110.png', 460, None, None, label=P.sticker('FRIDAY', 44, INK), label_at=(0.5, 0.45))
    g['week'] = P.caption("this week's batch", 120, BUTTER); g['count'] = X.hl('[24 dumbbell sets]', 64, BUTTER)
    g['made'] = X.hl('[24 made, by hand]', 64, BUTTER); g['byhand'] = X.hl('[made by hand, one at a time]', 60, BUTTER)
    g['checked'] = X.hl('[each one checked by hand]', 56, WHITE); g['arrow'] = doodle('arrow', 0, 130, INK)
    g['next'] = X.hl('[next batch: Oct 30]', 60, WHITE); g['burst'] = doodle('burst', 2, 760, BUTTER)
    g['ships'] = X.hl('[yours ships Friday]', 62, BUTTER); g['under'] = doodle('under', 0, 520, WHITE)
    g['comment'] = P.caption('Comment', 190, BUTTER); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['name'] = X.hl('[Product name]', 56, BUTTER)
    return g

def tiles(im, t, t0):
    """The frame splits into 4 x 6 tiles that flip over one by one (the count), then settle back."""
    cols, rows = 4, 6; tw, th = W // cols, H // rows; out = Image.new('RGBA', (W, H), (214, 178, 128, 255))
    for k in range(cols * rows):
        cx, cy = k % cols, k // cols; u = seg(t, t0 + k * 0.04, t0 + k * 0.04 + 0.35); sx = abs(math.cos(math.pi * u))
        tile = im.crop((cx * tw, cy * th, (cx + 1) * tw, (cy + 1) * th)); gap = 6 if 0 < u < 1 else 0
        if u <= 0 or u >= 1: out.alpha_composite(tile, (cx * tw, cy * th)); continue
        tw2 = max(2, int((tw - gap) * sx)); tile = tile.resize((tw2, th - gap)); out.alpha_composite(tile, (int(cx * tw + (tw - tw2) / 2), cy * th + gap // 2))
    return out

def stage2(g, t):
    im = g['kraft'].copy(); down = ease(seg(t, 2.1, 2.3)); up = ease(seg(t, 2.45, 2.7))
    if t >= 2.3: put(im, g['ink'], (540, 900), 1, -6)
    if t >= 1.9 and up < 1: put(im, g['stamp'], (540, lerp(-400, 760, down) - 1200 * up), 1, -6)
    P.say(im, g['made'], t, 2.6, (540, 1200), 2)
    return im

def stage3(g, t):
    """The slow pass along the batch; white marker strokes paint across the top and turn the footage into a pencil
    drawing (her style board #14: real footage into a drawing = "made by hand / back to basics")."""
    im = g['c']['pass'].at(t - 3.6)
    strokes = [((80, 260 + i * 120), (1000, 200 + i * 120)) for i in range(7)]
    im = X.sketch_over(im, ease(seg(t, 3.8, 4.6)), strokes, 160)
    P.say(im, g['byhand'], t, 4.5, (540, 1250), -2)
    return im

def stage4(g, t):
    im = g['kraft'].copy(); k = ease(seg(t, 5.2, 5.5))
    put(im, P.on_screen(PHONE, 480, g['c']['pick'].at(t - 5.2)), (540, lerp(2400, 800, k)), 1, -3)
    P.say(im, g['checked'], t, 5.5, (540, 1460), -2); doodle_on(im, t, 5.8, g['arrow'], (540, 1350), 90)
    return im

def stage5(g, t):
    im = g['kraft'].copy(); doodle_on(im, t, 7.05, g['burst'], (540, 1000), 0)
    put(im, g['batchtag'], (540, lerp(-700, 1000, back_out(seg(t, 6.8, 7.15), 1.4))), 1, 4 * math.sin(t * 2))
    P.say(im, g['next'], t, 7.3, (540, 1460), -2)
    return im

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the batch; 24 tiles flip in a wave (the count)
        im = tiles(c['batch'].at(t), t, 0.3)
        P.say(im, g['week'], t, 0.05, (540, 330), -2); P.say(im, g['count'], t, 0.35, (540, 480), 2)
        if t > 1.6: im = swipe(im, stage2(g, t), seg(t, 1.6, 1.8))
        return im
    if t < 3.6:
        im = stage2(g, t)
        if t > 3.4: im = diagonal(im, stage3(g, t), seg(t, 3.4, 3.6))
        return im
    if t < 5.2:
        im = stage3(g, t)
        if t > 5.0: im = swipe(im, stage4(g, t), seg(t, 5.0, 5.2), -1)
        return im
    if t < 6.8:
        im = stage4(g, t)
        if t > 6.6: im = diagonal(im, stage5(g, t), seg(t, 6.6, 6.8))
        return im
    if t < 8.4:
        im = stage5(g, t)
        if t > 8.2: im = swipe(im, c['pack'].at(0), seg(t, 8.2, 8.4))
        return im
    if t < 10.0:                                                   # 6: one being packed; the shipping box slides up
        im = c['pack'].at(t - 8.4); put(im, g['box'], (lerp(1500, 820, ease(seg(t, 8.5, 8.9))), 1560), 1, -6)
        P.say(im, g['ships'], t, 8.7, (480, 1300), -2); doodle_on(im, t, 9.0, g['under'], (480, 1390), -2)
        if t > 9.8: im = swipe(im, c['cta'].at(0), seg(t, 9.8, 10.0), -1)
        return im
    im = c['cta'].at(t - 10.0)                                       # 7: CTA
    P.say(im, g['comment'], t, 10.1, (540, 1000), -3); P.say(im, g['kw'], t, 10.35, (540, 1220), 2); P.say(im, g['name'], t, 10.55, (540, 1360), -2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 12.5 + sum(h for _, h in HOLDS); render('21', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
