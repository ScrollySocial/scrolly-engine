"""Motion test for f9 "Traced" (Fall pack): her idea of clips coming in while the background gets outlined by hand
(her example: skyscrapers traced), done with a misty fall forest (fall-pack.md, 2026-10-17).
Layers: the forest photo pushing in slowly; white marker lines drawing on over its real tree trunks and rocks; fog
drifting; real leaves falling. Product clips come in as three tall strips outlined in the same marker; a text-only beat
(LIMITED RUN) with a hand-drawn underline; the forest splits along a traced trunk like curtains to reveal the full clip;
CTA in the gap. Doodles each have a job: traces = the concept, arrow = points at the product, underline = emphasis,
burst = urgency. Stand-in footage: her July clips (product stand-ins).
Usage: python build/motion_f9.py [seconds...]  ->  fall/f9-traced/preview/motion-test.mp4 (or check stills)
"""
import math, random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageEnhance
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import storyboard_fall as B

W, H, FPS, DUR = 1080, 1920, 30, 12.0
OUT = E.PACK / 'fall' / 'f9-traced' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
INK, WHITE, CREAM, ORANGE = B.INK, B.WHITE, B.CREAM, B.ORANGE
CLIPS = {'a': ('IMG_1439', 0.8), 'b': ('IMG_1422', 0.5), 'c': ('IMG_1391', 0.5), 'd': ('IMG_1418', 0.5)}

def extract(key, secs=6.0):
    name, t0 = CLIPS[key]; d = TMP / key; d.mkdir(exist_ok=True)
    if not any(d.glob('*.jpg')):
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t0), '-t', str(secs), '-i', str(E.FOOTAGE / f'{name}.MOV'),
                        '-vf', f'{B.S.TONE},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}',
                        '-q:v', '3', '-strict', 'unofficial', str(d / '%04d.jpg')], check=True)
    return sorted(d.glob('*.jpg'))
FR = {k: extract(k) for k in CLIPS}
def vid(key, t):
    fs = FR[key]; return Image.open(fs[max(0, min(len(fs) - 1, int(t * FPS)))]).convert('RGBA')

def clamp(x): return max(0.0, min(1.0, x))
def back_out(x, s=1.9): x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s)
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)

# ---- the marker -----------------------------------------------------------------------------------------------------------
def marker(d, pts, upto=1.0, width=9, color=WHITE, seed=0, boil=0):
    """A hand-drawn marker stroke along pts, drawn on up to `upto` (0..1) of its length; slight wobble and varying width.
    `boil` changes the wobble a little (swapped every few frames, like a drawing)."""
    r = random.Random(seed * 7 + boil)
    dense = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        n = max(2, int(math.hypot(x1 - x0, y1 - y0) / 14))
        dense += [(x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n) for i in range(n)]
    dense.append(pts[-1]); k = int(len(dense) * clamp(upto))
    if k < 2: return
    ph = r.uniform(0, 6.28); amp = r.uniform(2.5, 4.5)
    out = [(x + amp * math.sin(i * 0.35 + ph), y + amp * math.cos(i * 0.27 + ph)) for i, (x, y) in enumerate(dense[:k])]
    for i, (a, b) in enumerate(zip(out, out[1:])):
        u = i / max(1, len(dense)); w = width * (0.7 + 0.35 * math.sin(u * 11 + ph)) * (0.6 + 0.4 * min(1, i / 4))
        d.line((a, b), fill=color + (255,), width=max(2, int(w))); d.ellipse((b[0] - w / 2, b[1] - w / 2, b[0] + w / 2, b[1] + w / 2), fill=color + (255,))

def rect_pts(x0, y0, x1, y1, over=30):
    """A box drawn by hand: four sides, the last one running a little past the start."""
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0 + over), (x0 + over * 0.2, y0 - over * 0.6)]

# real tree trunks and rocks in 'Misty amber autumn forest backdrop-32.png' (fitted to 1080 x 1920), traced bottom to top
TRUNKS = [[(30, 720), (55, 480), (75, 300), (92, 0)],
          [(250, 900), (256, 500), (262, 120)], [(292, 900), (296, 500), (302, 120)],
          [(372, 1140), (410, 500), (428, 0)], [(405, 1140), (452, 500), (466, 0)],
          [(622, 820), (625, 500), (628, 200)], [(646, 820), (648, 500), (652, 200)],
          [(710, 700), (710, 400), (708, 120)], [(734, 700), (733, 400), (730, 120)]]
ROCKS = [[(20, 1340), (40, 1270), (120, 1248), (220, 1262), (246, 1320), (200, 1346), (60, 1352), (24, 1338)],
         [(80, 1460), (100, 1385), (200, 1360), (320, 1380), (346, 1440), (260, 1466), (90, 1462)]]
SPLIT = [(560, 1920), (600, 1300)] + TRUNKS[5] + [(632, 0)]   # the curtains open along this trunk (extended to the bottom)

FOREST = B.tex('Misty amber autumn forest backdrop-32.png', (W, H))
FOG = B.on_black('Whispers of fog on black-99.png', 1.3)
LEAVES = [B.fit_w(B.cut(n), w) for n, w in (('Red maple leaf tumbling in midair-3.png', 150), ('Tumbling orange maple leaf-6.png', 130),
          ('Tumbling yellow birch leaf-12.png', 110), ('Tumbling red and golden maple leaf-18.png', 140), ('Suspended orange maple leaf-5.png', 120))]
HOOK1 = B.letters_img('NEW', B.COINY, 260, B.tex_fill('Autumn path blanketed in leaves-30.png', k=1.2), edge=WHITE, stroke=13)
HOOK2 = B.letters_img('FOR FALL', B.COINY, 150, B.tex_fill('Autumn path blanketed in leaves-30.png', k=1.2), edge=WHITE, stroke=11)
BIG1 = B.letters_img('LIMITED', B.COINY, 170, B.tex_fill('Autumn path blanketed in leaves-30.png', k=1.2), edge=WHITE, stroke=12)
BIG2 = B.letters_img('RUN', B.COINY, 290, B.tex_fill('Autumn path blanketed in leaves-30.png', k=1.2), edge=WHITE, stroke=14)
CTA = B.letters_img('COMMENT', B.COINY, 140, B.tex_fill('Autumn path blanketed in leaves-30.png', k=1.2), edge=WHITE, stroke=11)
ARROW = B.fit_w(B.ink_piece('Hand-drawn arrow doodle sheet-1.png', 2, 5, 0, WHITE, inset=0.12), 200)
BURST = B.fit_w(B.ink_piece('Playful hand-drawn burst asset sheet-2.png', 2, 3, 0, WHITE, inset=0.1), 300)

_c = {}
def scaled(im, k, key):
    q = (key, round(k, 2))
    if q not in _c: _c[q] = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.LANCZOS)
    return _c[q]
def put(img, item, c, k=1.0, rot=0, key=None):
    if k <= 0.02: return
    it = scaled(item, k, key or id(item)) if abs(k - 1) > 0.01 else item
    if rot: it = it.rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))
def pop(t, t0, t1=None, d=0.3):
    k = back_out((t - t0) / d) if t >= t0 else 0
    if t1 is not None and t > t1: k *= 1 - ease((t - t1) / 0.18)
    return k
def letters(img, t, t0, t1, c, art, step=0.05):
    k = pop(t, t0, t1, 0.3)
    if k <= 0.02: return
    cw = int(art.width * (0.1 + 0.9 * clamp((t - t0) / (step * 10 + 0.01)))); part = art.crop((0, 0, cw, art.height))
    pk = scaled(part, k, ('part', id(art), cw)); img.alpha_composite(pk, (int(c[0] - art.width * k / 2), int(c[1] - pk.height / 2)))
def say(img, t, t0, t1, c, text, px, fill=WHITE, edge=INK):
    k = pop(t, t0, t1, 0.22)
    if k <= 0.02: return
    key = ('say', text, px, fill)
    if key not in _c:
        lay = Image.new('RGBA', (W * 2, 400), (0, 0, 0, 0))
        ImageDraw.Draw(lay).text((W, 200), text, font=B.F(B.MONT, px), fill=fill + (255,), anchor='mm', stroke_width=max(4, px // 10), stroke_fill=edge + (255,))
        _c[key] = B.shadowed(lay.crop(lay.getbbox()), (4, 7), 6, 90)
    put(img, _c[key], c, k, key=key)

def forest(t, trace, dark=0.0):
    """The forest with its traced lines (trace = how much of the tracing is drawn, 0..1), pushing in slowly."""
    im = FOREST.copy()
    if dark: im = ImageEnhance.Brightness(im).enhance(1 - dark)
    d = ImageDraw.Draw(im); boil = int(t * 8) % 3
    for i, p in enumerate(TRUNKS): marker(d, p, clamp(trace * 1.6 - i * 0.06), 8, WHITE, i, boil)
    s = 1.0 + 0.05 * t / DUR; big = im.resize((int(W * s), int(H * s)), Image.BILINEAR)
    return big.crop(((big.width - W) // 2, (big.height - H) // 2, (big.width - W) // 2 + W, (big.height - H) // 2 + H))

def fog(im, t, a=0.7, y=1560, w=2200):
    f = scaled(FOG, w / FOG.width, ('fog', w))
    if a < 1: f = f.copy(); f.putalpha(f.split()[3].point(lambda v: int(v * a)))
    im.alpha_composite(f, (int(-600 + 120 * t) % 600 - 600, int(y - f.height / 2)))

def falling(im, t, n=5, seed=3):
    r = random.Random(seed)
    for i in range(n):
        x0, sp, ph = r.uniform(80, W - 80), r.uniform(220, 340), r.uniform(0, 6)
        y = (t * sp + r.uniform(0, H)) % (H + 300) - 150
        put(im, LEAVES[i % len(LEAVES)], (x0 + 70 * math.sin(t * 1.6 + ph), y), 1.0, 40 * math.sin(t * 2 + ph) + i * 50, key=('lf', i))

def strip(im, key, t, x, y, w, h, k, i):
    """A tall clip strip, outlined by hand in the same white marker as the trunks."""
    if k <= 0: return
    v = ImageOps.fit(vid(key, t), (w, h)); yy = y + (1 - k) * (H - y + h / 2)
    im.alpha_composite(B.shadowed(v, (8, 14), 12, 110), (int(x - w / 2) - 14, int(yy - h / 2) - 14))
    d = ImageDraw.Draw(im); marker(d, rect_pts(x - w / 2 - 12, yy - h / 2 - 12, x + w / 2 + 12, yy + h / 2 + 12), clamp((k - 0.4) / 0.6), 8, WHITE, 40 + i, int(t * 8) % 3)

def split_mask(dx):
    """Left/right halves of the frame, cut along the traced trunk SPLIT."""
    m = Image.new('L', (W, H), 0); xs = [x for x, _ in SPLIT]
    poly = [(0, 0)] + [(x, y) for x, y in sorted(SPLIT, key=lambda p: p[1])] + [(0, H)]
    ImageDraw.Draw(m).polygon(poly, fill=255); return m

LEFT = split_mask(0)

def curtains(t, gap, under):
    """The forest splits along the traced trunk: left half slides left, right half right, by `gap` px each."""
    f = forest(t, 1.0); out = under.copy()
    L = Image.new('RGBA', (W, H)); L.paste(f, (0, 0), LEFT); R = Image.new('RGBA', (W, H)); R.paste(f, (0, 0), Image.eval(LEFT, lambda v: 255 - v))
    out.alpha_composite(L, (-int(gap), 0)); out.alpha_composite(R, (int(gap), 0))
    d = ImageDraw.Draw(out); b = int(t * 8) % 3
    marker(d, [(x - gap, y) for x, y in SPLIT], 1, 10, WHITE, 90, b)
    marker(d, [(x + gap, y) for x, y in SPLIT], 1, 10, WHITE, 91, b)
    return out

def frame(t):
    # 0-2.4  the forest; the trunks get traced in white marker as you watch; NEW FOR FALL pops in
    if t < 2.4:
        im = forest(t, ease(t / 1.8)); fog(im, t, 0.55); falling(im, t, 3)
        letters(im, t, 0.2, 2.25, (540, 700), HOOK1); letters(im, t, 0.55, 2.25, (530, 920), HOOK2)
        say(im, t, 0.9, 2.25, (540, 1080), 'the maple candle', 60)
        return im
    # 2.4-5.2  three tall product clips slide up in front of the traced forest, each outlined in the same marker
    if t < 5.2:
        im = forest(t, 1.0); fog(im, t, 0.5, 1700)
        for i, (x, key) in enumerate(((210, 'a'), (540, 'b'), (870, 'c'))):
            strip(im, key, t - 2.4, x, 900, 290, 860, ease((t - 2.4 - 0.18 * i) / 0.55), i)
        say(im, t, 3.3, 5.0, (540, 380), 'new scent', 66)
        falling(im, t, 3, 5)
        return im
    # 5.2-5.6  the fog rolls in thick and carries us to the text-only beat
    if t < 5.6:
        u = ease((t - 5.2) / 0.4); im = forest(t, 1.0)
        for i, (x, key) in enumerate(((210, 'a'), (540, 'b'), (870, 'c'))): strip(im, key, t - 2.4, x, 900 - u * 1500, 290, 860, 1, i)
        for k in range(3): fog(im, t + k, 0.9, 1700 - u * 900 - k * 300, 2600)
        return im
    # 5.6-7.2  TEXT ONLY: LIMITED RUN, huge, over the darkened traced forest; the underline draws itself under RUN
    if t < 7.2:
        im = forest(t, 1.0, 0.35); fog(im, t, 0.5 * (1 - ease((t - 5.6) / 0.6)) + 0.3, 1650)
        letters(im, t, 5.65, 7.05, (520, 760), BIG1); letters(im, t, 5.9, 7.05, (520, 1010), BIG2)
        if t < 7.05: marker(ImageDraw.Draw(im), [(250, 1170), (500, 1185), (800, 1165)], ease((t - 6.2) / 0.4), 14, WHITE, 70, int(t * 8) % 3)
        return im
    # 7.2-8.0  the forest splits along a traced trunk like curtains: the full product clip is behind it
    if t < 8.0:
        u = ease((t - 7.2) / 0.8); return curtains(t, u * 620, vid('d', t - 7.2))
    # 8.0-10.0  the product clip full screen; leaves fall; the urgency line with a hand-drawn burst
    if t < 10.0:
        im = vid('d', t - 7.2); falling(im, t, 4, 8)
        put(im, BURST, (300, 1240), pop(t, 8.3, 9.85), 8 * math.sin(t * 6), key='burst'); say(im, t, 8.4, 9.85, (520, 1250), 'only 50 made', 84, WHITE)
        return im
    # 10.0-12  CTA: the curtains close part way, the product clip stays in the gap; comment for the link
    u = 1 - ease((t - 10.0) / 0.6); im = curtains(t, 250 + u * 370, vid('d', t - 7.2)); fog(im, t, 0.5, 1750)
    letters(im, t, 10.5, None, (540, 1180), CTA); say(im, t, 10.8, None, (540, 1360), 'NEW for the link', 66)
    return im

def main():
    only = [float(a) for a in sys.argv[1:]]
    if only:
        for s in only: frame(s).convert('RGB').save(OUT / f'check-{s:05.2f}.jpg', quality=85)
        return
    n = int(DUR * FPS); fdir = TMP / 'out'; fdir.mkdir(exist_ok=True)
    for i in range(n): frame(i / FPS).convert('RGB').save(fdir / f'{i:04d}.jpg', quality=88)
    mp4 = OUT / 'motion-test.mp4'
    subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-framerate', str(FPS), '-i', str(fdir / '%04d.jpg'), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', str(mp4)], check=True)
    print('saved', mp4)

if __name__ == '__main__':
    main()
