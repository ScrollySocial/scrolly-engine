"""#16 What it feels like, motion test (2026-10-18). Built the #04-#13 round 3 way (play_extra: locked type, palette,
reading-time holds). World: the quilt (her idea bank): a patchwork of real soft textures and her patterns in pink and
light blue that dissolves one patch at a time into the clip; one real touch object comes with each feeling word (a
feather, a river stone, a cotton boll). Palette: pink + light blue (ink outlines).
Story (5 beats): hook "what my [product] feels like" / problem: you can't touch it through a screen (sound on) / product:
the feel, word by word / proof: soft, smooth, cozy (the recap) / CTA: comment [KEYWORD].
Scenes (graphics-only: 3, 6; tech: 3, a phone standing on the quilt, its whole screen one video slot):
 1 0.0  the quilt covers the squeeze clip, then dissolves one patch at a time into it; "what my [product]" / "feels like"
 2 2.0  the close-up, full frame; [soft] on a pink box; a real feather drifts down beside the word
 3 3.6  QUILT: a phone stands on the quilt playing the satisfying clip; "sound on" with one burst behind it
 4 5.2  QUILT: one patch opens as a window onto the hand-across clip and grows to full frame; [smooth]; the river stone
        slides across like the hand
 5 6.8  the satisfying moment, full frame; [cozy]; a cotton boll puffs in
 6 8.4  QUILT, no video: the patches fly back in; the three words land on three patches: the recap
 7 10.0 CTA: the whole product, pulled back; Comment (one underline) / [KEYWORD] / [Product name]
Usage: python build/motion_16.py [seconds ...]  ->  16-what-it-feels-like/preview/motion-test.mp4 (or a test sheet)
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
import play_extra as X
from story4 import swipe, diagonal
from collage_kit import doodle, doodle_on
from motion_b2 import Clip, put, render, camera, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (24, 23, 22), (246, 241, 232); PINK, BLUE = X.PINK, X.BABY             # her palette: pink + light blue
X.use_type(PINK, INK); X.enable_holds()
DIR = '16-what-it-feels-like'
PHONE = 'Graphite Smartphone With Green Screen-38.png'
COLS, ROWS = 3, 4; PW, PH = W // COLS, H // ROWS
HOLDS = [(1.7, 0.6), (3.3, 0.4), (4.9, 1.15), (6.5, 1.1), (8.1, 0.4), (9.7, 1.2), (12.45, 0.3)]   # just before each transition

def tone(name, folder, dark, light, size):
    g = ImageOps.grayscale(S.raw(folder, name)); return ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(g), dark, light), size).convert('RGBA')

def setup():
    g = {'c': {'squeeze': Clip('IMG_1403', 0.5), 'close': Clip('IMG_1406', 0.0), 'drape': Clip('IMG_1409', 0.0), 'across': X.Window(Clip('IMG_1407', 0.0), 0.5, 3.5),
               'whole': Clip('IMG_1398', 0.0)}}
    P_ = (PW + 6, PH + 6); dpink, dblue = (214, 150, 178), (132, 168, 204)
    src = [('images', 'Blush Pink Tissue Paper Texture-9.png', dpink, PINK), ('images', 'Crumpled pale blue tissue texture-8.png', dblue, BLUE),
           ('doodles', 'Playful hand-painted black polka dots-12.png', dpink, CRM), ('images', 'Clear bubble wrap texture-11.png', dblue, CRM),
           ('doodles', 'Hand-drawn wavy line pattern-20.png', dblue, CRM), ('images', 'Soft veined white marble texture-1.png', dpink, CRM),
           ('doodles', 'Wobbly hand-drawn black and white checkerboard-24.png', dpink, PINK), ('images', 'Blush Pink Tissue Paper Texture-9.png', dblue, BLUE),
           ('doodles', 'Hand-drawn black dot pattern-21.png', dblue, BLUE), ('images', 'Crumpled pale blue tissue texture-8.png', dpink, PINK),
           ('doodles', 'Bold hand-drawn cross pattern-19.png', dpink, CRM), ('images', 'Clear bubble wrap texture-11.png', dpink, PINK)]
    g['patches'] = [C.shadow(tone(n, f, d, l, P_), (0, 6), 8, 70) for f, n, d, l in src]
    r = random.Random(7); g['order'] = list(range(12)); r.shuffle(g['order'])
    g['feather'] = P.thing('Curved white feather, isolated-212.png', 300, 'smalldots', PINK, scale=0.25, strength=0.6)
    g['stone'] = P.thing('Smooth grey river stone with white vein-190.png', 260, 'stripes', BLUE, scale=0.25, strength=0.45)
    g['cotton'] = P.thing('Fluffy natural cotton boll-88.png', 280, None, None, label=P.sticker('COZY', 34, INK), label_at=(0.5, 0.85))
    g['whatmy'] = X.hl('what my [velvet sofa]', 60, WHITE); g['feels'] = P.caption('feels like', 200, INK)
    g['wavy'] = doodle('under', 2, 620, PINK)
    g['soft'] = X.hl('[soft]', 110, PINK); g['smooth'] = X.hl('[smooth]', 110, BLUE); g['cozy'] = X.hl('[cozy]', 110, PINK)
    g['sound'] = P.caption('sound on', 170, INK); g['full'] = X.hl("[you'll hear it]", 54, WHITE); g['burst'] = doodle('burst', 2, 1000, INK)
    g['three'] = P.caption('in three words', 130, INK)
    g['comment'] = P.caption('Comment', 190, INK); g['under'] = doodle('under', 0, 560, PINK)
    g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['name'] = X.hl('[Product name]', 56, BLUE)
    return g

def quilt(im, g, t, gone_t0=None, back_t0=None, hole=None):
    """The 3x4 quilt: patches leave one at a time from gone_t0 (shrink and spin off), or fly back in from back_t0."""
    for k, i in enumerate(g['order']):
        cx, cy = (i % COLS) * PW + PW / 2, (i // COLS) * PH + PH / 2; s, rot = 1.0, 0
        if gone_t0 is not None: u = ease(seg(t, gone_t0 + k * 0.1, gone_t0 + k * 0.1 + 0.25)); s, rot = 1 - u, 40 * u
        if back_t0 is not None: u = back_out(seg(t, back_t0 + k * 0.06, back_t0 + k * 0.06 + 0.3), 1.4); s = u
        if hole == i: continue
        if s > 0.02: put(im, g['patches'][i], (cx, cy), s, rot)

def stage3(g, t):
    """The phone stands on the quilt; its whole screen is the satisfying clip; 'sound on' with a burst behind it."""
    im = Image.new('RGBA', (W, H), CRM + (255,)); quilt(im, g, t)
    k = ease(seg(t, 3.6, 3.95)); doodle_on(im, t, 3.95, g['burst'], (540, 1230), 0)   # one burst, behind the phone
    put(im, P.on_screen(PHONE, 560, g['c']['drape'].at(t - 3.6)), (540, lerp(2400, 1230, k)), 1, -4)
    P.say(im, g['sound'], t, 3.9, (540, 360), -3)
    P.say(im, g['full'], t, 4.2, (540, 520), 2)
    return im

def stage4(g, t):
    """One patch is a window onto the clip; it grows to full frame; the river stone slides across like the hand."""
    c = g['c']; u = ease(seg(t, 5.6, 6.1)); win = 4                    # the centre-left patch
    im = c['across'].at(t - 5.2).copy()
    if u < 1:
        base = Image.new('RGBA', (W, H), CRM + (255,)); quilt(base, g, t, hole=win)
        cx, cy = (win % COLS) * PW + PW / 2, (win // COLS) * PH + PH / 2; w, h = lerp(PW, W * 1.6, u), lerp(PH, H * 1.6, u)
        m = Image.new('L', (W, H), 255); ImageDraw.Draw(m).rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), fill=0)
        im.paste(base, (0, 0), m)
    P.say(im, g['smooth'], t, 6.1, (540, 1380), -3)
    put(im, g['stone'], (lerp(-200, 1280, ease(seg(t, 6.2, 6.75))), 1100), 1, -20 + 40 * seg(t, 6.2, 6.75))
    return im

def stage6(g, t):
    im = Image.new('RGBA', (W, H), CRM + (255,)); quilt(im, g, t, back_t0=8.4)
    for k, (w_, i) in enumerate(((g['soft'], 3), (g['smooth'], 7), (g['cozy'], 11))):
        cx, cy = (i % COLS) * PW + PW / 2, (i // COLS) * PH + PH / 2; P.say(im, w_, t, 9.0 + k * 0.2, (cx - 180 if i % 3 == 2 else cx + 180, cy), (-4, 3, -2)[k])
    P.say(im, g['three'], t, 8.9, (540, 330), -2)
    return im

def frame(g, t):
    c = g['c']
    if t < 2.0:                                                    # 1: the quilt dissolves into the squeeze clip
        im = c['squeeze'].at(t); quilt(im, g, t, gone_t0=0.2)
        P.say(im, g['whatmy'], t, 0.05, (540, 400), -2); P.say(im, g['feels'], t, 0.3, (540, 1230), -3)
        doodle_on(im, t, 0.8, g['wavy'], (540, 1370), -2)
        if t > 1.75: im = swipe(im, c['close'].at(t - 1.75), seg(t, 1.75, 2.0))
        return im
    if t < 3.6:                                                    # 2: soft; a feather drifts down
        im = c['close'].at(t - 1.75); u = ease(seg(t, 2.1, 3.0))
        put(im, g['feather'], (lerp(820, 760, u) + 60 * math.sin(t * 5) * (1 - u), lerp(-200, 1180, u)), 1, 30 * math.sin(t * 4) * (1 - u) - 10)
        P.say(im, g['soft'], t, 2.2, (400, 1320), -3)
        if t > 3.35: im = diagonal(im, stage3(g, t), seg(t, 3.35, 3.6))
        return im
    if t < 5.2: return stage3(g, t) if t < 4.95 else swipe(stage3(g, t), stage4(g, 5.2), seg(t, 4.95, 5.2), -1)
    if t < 6.8:
        im = stage4(g, t)
        if t > 6.55: im = swipe(im, c['drape'].at(0), seg(t, 6.55, 6.8))
        return im
    if t < 8.4:                                                    # 5: cozy; a cotton boll puffs in
        im = c['drape'].at(t - 6.8); P.say(im, g['cozy'], t, 7.0, (420, 1330), 3)
        k = back_out(seg(t, 7.2, 7.5), 2.0); put(im, g['cotton'], (820, 1150), k * (1 + 0.04 * math.sin(t * 6)), 8)
        if t > 8.15: im = diagonal(im, stage6(g, t), seg(t, 8.15, 8.4))
        return im
    if t < 10.0:
        im = stage6(g, t)
        if t > 9.75: im = swipe(im, c['whole'].at(t - 9.75), seg(t, 9.75, 10.0), -1)
        return im
    im = c['whole'].at(t - 9.75)                                     # 7: CTA
    P.say(im, g['comment'], t, 10.1, (540, 1000), -3); doodle_on(im, t, 10.4, g['under'], (540, 1110), -2)
    P.say(im, g['kw'], t, 10.4, (540, 1230), 2); P.say(im, g['name'], t, 10.6, (540, 1360), -2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 12.5 + sum(h for _, h in HOLDS); render('16', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
