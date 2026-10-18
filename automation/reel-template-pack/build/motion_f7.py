"""Motion test for f7 "Which is your style?" (Fall pack), from Mercedes's notes and Canva mock-ups (fall/inspo/, 2026-10-17):
her clip full screen with the question; real fall drinks pop in one at a time beside her, each with a short label and
a hand-drawn arrow; a real plaid blanket rises between clips and becomes the full-page background; two clips per screen
on the blanket; the blanket drops to reveal the next clip; CTA with the drinks numbered by hand.
Props are real photos with a hand-drawn touch (wobbly marker outlines that boil, her marker numbers and arrows).
Stand-in footage: her July clips. Usage: python build/motion_f7.py -> fall/f7-pick-your-brew/preview/motion-test.mp4
"""
import math, random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import storyboard_fall as B

W, H, FPS, DUR = 1080, 1920, 30, 15.0
OUT = E.PACK / 'fall' / 'f7-pick-your-brew' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
INK, WHITE, CREAM = B.INK, B.WHITE, B.CREAM
FOAM_EDGE = (92, 52, 30)
CLIPS = {'a': ('IMG_1470', 0.6), 'b': ('IMG_1455', 0.5), 'c': ('IMG_1391', 0.5), 'd': ('IMG_1469', 0.8)}

def extract(key, secs=5.5):
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

# ---- hand-drawn touch ---------------------------------------------------------------------------------------------------
def marker_outline(item, color=WHITE, width=9, gap=16, seed=1):
    """A loose marker line drawn round a real object: follows its shape a little way off, wobbles, varies in width,
    and doesn't quite close (start and end overlap), like it was drawn by hand."""
    r_ = random.Random(seed); k = 4; s = 2                         # mask at 1/4 size; draw at 2x then shrink
    a = item.split()[3].point(lambda v: 255 if v > 100 else 0); sm = a.resize((a.width // k + 1, a.height // k + 1)); px = sm.load()
    bb = sm.getbbox(); cx, cy = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2; n = 160; R = []
    for i in range(n):
        t = 2 * math.pi * i / n; dx, dy = math.cos(t), math.sin(t); rr, far = 0.0, 0.0
        while True:
            x, y = int(cx + dx * rr), int(cy + dy * rr)
            if not (0 <= x < sm.width and 0 <= y < sm.height): break
            if px[x, y]: far = rr
            rr += 0.5
        R.append(far * k)
    R = [sum(R[(i + j) % n] for j in range(-4, 5)) / 9 for i in range(n)]       # smooth the dents (handles, stems)
    ph = [r_.uniform(0, 6.28) for _ in range(3)]
    pad = gap + width + 30; cw, ch = (item.width + 2 * pad) * s, (item.height + 2 * pad) * s
    lay = Image.new('RGBA', (cw, ch), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    start = r_.uniform(0, 2 * math.pi); span = 2 * math.pi * 1.06; steps = 260; pts = []
    for i in range(steps + 1):
        u = i / steps; t = start + span * u; j = int(((t % (2 * math.pi)) / (2 * math.pi)) * n) % n
        wob = 7 * math.sin(3 * t + ph[0]) + 4 * math.sin(5 * t + ph[1]) + 9 * u + r_.uniform(-1, 1)
        rr = R[j] + gap + wob
        pts.append(((pad + cx * k + rr * math.cos(t)) * s, (pad + cy * k + rr * math.sin(t)) * s, u))
    for (x0, y0, u), (x1, y1, _) in zip(pts, pts[1:]):
        w = width * s * (0.75 + 0.35 * math.sin(u * 9 + ph[2])) * (0.55 + 0.45 * min(1, u * 12, (1 - u) * 12))
        d.line((x0, y0, x1, y1), fill=color + (255,), width=max(2, int(w))); d.ellipse((x1 - w / 2, y1 - w / 2, x1 + w / 2, y1 + w / 2), fill=color + (255,))
    lay = lay.resize((cw // s, ch // s), Image.LANCZOS)
    out = Image.new('RGBA', lay.size, (0, 0, 0, 0)); out.alpha_composite(item, (pad, pad)); out.alpha_composite(lay); return out

def boiled(item, color=WHITE, seed=0, **k):
    """Three hand-drawn versions of the outline, swapped every few frames (the line 'boils' like a drawing)."""
    return [marker_outline(item, color, seed=seed * 10 + i, **k) for i in range(3)]
def boil(versions, t): return versions[int(t * 8) % len(versions)]

def white_piece(sheet, cols, rows, i, color=WHITE): return B.ink_piece(sheet, cols, rows, i, color)

# ---- assets -------------------------------------------------------------------------------------------------------------
def drink(name, w, tol=26): return B.fit_w(B.cut(name, tol), w)
DRINKS = [boiled(B.shadowed(drink('Creamy chai in a clear mug-54.png', 330), (8, 14), 10, 90), WHITE, 1),
          boiled(B.shadowed(drink('Cinnamon apple cider in a cream mug-53.png', 330, 5), (8, 14), 10, 90), WHITE, 2),
          boiled(B.shadowed(drink('Plain white takeaway coffee cup-45.png', 250, 5), (8, 14), 10, 90), WHITE, 3)]
LABELS = ['chai latte', 'apple cider', 'pumpkin spice']
ARROWS = [B.fit_w(white_piece('Hand-drawn arrow doodle sheet-1.png', 2, 5, i), 190) for i in (2, 3, 2)]
NUMS = [B.fit_w(white_piece('Playful Marker Glyphs Asset Sheet-11.png', 4, 3, i), 120) for i in range(3)]
BLANKET = B.tex('Rust-red and cream plaid blanket texture-7.png', (W, H + 200))
ANISE = [B.fit_w(B.cut(n), w) for n, w in (('Whole star anise on white-56.png', 260), ('Star anise on white-58.png', 200),
                                           ('Whole star anise on white-57.png', 230), ('Whole star anise on white-56.png', 180))]
HOOK_BIG = B.letters_img('YOUR STYLE?', B.BOUNCE, 150, B.foam_fill(), edge=FOAM_EDGE, stroke=11)
CTA_BIG = B.letters_img('YOUR PICK', B.BOUNCE, 170, B.foam_fill(), edge=FOAM_EDGE, stroke=11)

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
    """Scale for something that pops in at t0 (with a little overshoot) and pops out at t1."""
    k = back_out((t - t0) / d) if t >= t0 else 0
    if t1 is not None and t > t1: k *= 1 - ease((t - t1) / 0.18)
    return k

def say(img, t, t0, t1, c, text, px, fill=WHITE, edge=INK):
    """Editable words (Montserrat Bold with an edge): pop in at t0, out at t1."""
    k = pop(t, t0, t1, 0.22)
    if k <= 0.02: return
    key = ('say', text, px, fill)
    if key not in _c:
        lay = Image.new('RGBA', (W * 2, 400), (0, 0, 0, 0))
        ImageDraw.Draw(lay).text((W, 200), text, font=B.F(B.MONT, px), fill=fill + (255,), anchor='mm', stroke_width=max(4, px // 10), stroke_fill=edge + (255,))
        _c[key] = B.shadowed(lay.crop(lay.getbbox()), (4, 7), 6, 90)
    put(img, _c[key], c, k, key=key)

def letters(img, t, t0, t1, c, art, step=0.05):
    """The built-in artwork words, revealed letter by letter left to right with a pop."""
    k = pop(t, t0, t1, 0.3)
    if k <= 0.02: return
    reveal = clamp((t - t0) / (step * 11 + 0.01))
    cropw = int(art.width * (0.08 + 0.92 * reveal)); part = art.crop((0, 0, cropw, art.height))
    x0 = c[0] - art.width * k / 2; pk = scaled(part, k, ('part', id(art), cropw))
    img.alpha_composite(pk, (int(x0), int(c[1] - pk.height / 2)))

def blanket(img, top):
    """The real plaid blanket, its top edge at y=top, with a soft shadow above the edge."""
    if top >= H: return
    sh = Image.new('RGBA', (W, 80), (0, 0, 0, 0)); g = Image.new('L', (1, 80))
    for y in range(80): g.putpixel((0, y), int(110 * (y / 79) ** 2))
    sh.putalpha(g.resize((W, 80))); img.alpha_composite(sh, (0, int(top) - 80))
    img.alpha_composite(BLANKET.crop((0, 0, W, int(min(H + 200, H - top)))) if top > 0 else BLANKET.crop((0, int(-top), W, int(-top) + H)), (0, int(max(0, top))))

def framed(key, t, w, h, seed):
    """A clip in a white die-cut border with a hand-drawn ink outline."""
    v = ImageOps.fit(vid(key, t), (w, h)); bw = 18
    f = Image.new('RGBA', (w + 2 * bw, h + 2 * bw), WHITE + (255,)); f.alpha_composite(v, (bw, bw))
    return B.shadowed(f, (10, 18), 14, 110)
_out = {}
def frame_outline(w, h, seed):
    q = (w, h, seed)
    if q not in _out:
        blank = Image.new('RGBA', (w + 36, h + 36), (0, 0, 0, 255))
        _out[q] = [marker_outline(blank, INK, 10, 14, seed * 10 + i) for i in range(3)]
        for o in _out[q]:
            a = o.split()[3]; m = Image.new('L', o.size, 0); m.paste(255, (44 + 30 - 14, 44 + 30 - 14, o.width - 44, o.height - 44))
    return _out[q]
def outlined_frame(img, key, t, c, w, h, rot, seed, k=1.0):
    fr = framed(key, t, w, h, seed)
    ol = boil(frame_outline(w, h, seed), t)
    lay = Image.new('RGBA', ol.size, (0, 0, 0, 0)); a = ol.split()[3]
    hole = Image.new('L', ol.size, 0); pad = (ol.width - (w + 36)) // 2
    ImageDraw.Draw(hole).rectangle((pad + 6, pad + 6, ol.width - pad - 6, ol.height - pad - 6), fill=255)
    lay = ol.copy(); lay.putalpha(Image.composite(Image.new('L', ol.size, 0), a, hole))   # keep only the drawn line
    lay.alpha_composite(fr, ((ol.width - fr.width) // 2, (ol.height - fr.height) // 2))
    lay = lay.rotate(rot, expand=True, resample=Image.BICUBIC)
    if k < 0.999: lay = lay.resize((max(1, int(lay.width * k)), max(1, int(lay.height * k))))
    img.alpha_composite(lay, (int(c[0] - lay.width / 2), int(c[1] - lay.height / 2)))

# drink spots beside her (shoulders, never her face) and their labels
SPOTS = [((180, 1330), (230, 1060), (200, 1170), -8), ((900, 1380), (740, 1110), (850, 1230), 7), ((560, 1770), (540, 1470), (720, 1600), -5)]

def frame(t):
    # 0.0-3.6  her clip full screen; the question; drinks pop in one by one with a label and an arrow
    if t < 4.5:
        im = vid('a', t)
        say(im, t, 0.0, 3.35, (540, 300), 'which is', 76)
        letters(im, t, 0.15, 3.4, (540, 450), HOOK_BIG)
        for i, (dc, lc, ac, rot) in enumerate(SPOTS):
            t0 = 0.8 + 0.5 * i; k = pop(t, t0, None, 0.35)
            put(im, boil(DRINKS[i], t), (dc[0], dc[1] + 12 * math.sin(t * 3 + i)), k, rot + 3 * math.sin(t * 2 + i), key=('dr', i, int(t * 8) % 3))
            say(im, t, t0 + 0.15, 3.35, lc, LABELS[i], 64)
        if t >= 3.5: blanket(im, H - ease((t - 3.5) / 0.9) * (H + 120))          # the blanket rises over everything
        return im
    # 4.5-8.4  the blanket is the page: two clips, each in a drawn frame, with their labels; star anise along the floor
    if t < 8.4:
        im = Image.new('RGBA', (W, H)); blanket(im, -120)
        k1 = ease((t - 4.5) / 0.45); k2 = ease((t - 5.0) / 0.45)
        outlined_frame(im, 'b', t - 4.5, (360 - (1 - k1) * 900, 640), 560, 720, -4, 1)
        if t > 5.0: outlined_frame(im, 'c', t - 5.0, (720 + (1 - k2) * 900, 1250), 560, 720, 4, 2)
        say(im, t, 4.9, 8.1, (820, 430), '(01)', 70); say(im, t, 5.05, 8.1, (800, 530), 'espresso, always', 50)
        say(im, t, 5.4, 8.1, (260, 1040), '(02)', 70); say(im, t, 5.55, 8.1, (280, 1140), 'iced, all year', 50)
        for i, (x, a) in enumerate(((140, 0), (420, 40), (690, 15), (950, 60))):
            put(im, ANISE[i], (x, 1760 + (i % 2) * 40), pop(t, 4.7 + 0.12 * i, None, 0.3), a + 20 * t, key=('an', i))
        if t >= 8.1: pass
        return im
    # 8.4-9.3  the blanket drops away and reveals her next clip
    if t < 9.3:
        im = vid('d', t - 8.4); blanket(im, -120 + ease((t - 8.4) / 0.9) * (H + 240)); return im
    # 9.3-11.6  her clip; the drinks bob along the bottom, numbered by hand; "1, 2 or 3?" above her head
    if t < 11.6:
        im = vid('d', t - 8.4)
        say(im, t, 9.4, 11.4, (540, 300), '1, 2 or 3?', 96)
        for i, x in enumerate((200, 540, 880)):
            put(im, boil(DRINKS[i], t), (x, 1700 + 14 * math.sin(t * 3 + i)), pop(t, 9.5 + 0.2 * i, None, 0.35) * 0.85, 0, key=('dr2', i, int(t * 8) % 3))
            put(im, NUMS[i], (x, 1440), pop(t, 9.7 + 0.2 * i, None, 0.3), (-6, 4, -3)[i], key=('n', i))
        if t >= 11.0: blanket(im, H - ease((t - 11.0) / 0.6) * (H + 120))
        return im
    # 11.6-15  CTA: the blanket is the page again, her clip in a drawn frame, comment your pick, the drinks numbered
    im = Image.new('RGBA', (W, H)); blanket(im, -120)
    k = ease((t - 11.6) / 0.4); outlined_frame(im, 'd', t - 8.4, (540, 640), 560, 760, -3, 3, 0.6 + 0.4 * k)
    say(im, t, 12.0, None, (540, 1170), 'comment', 72)
    letters(im, t, 12.2, None, (540, 1330), CTA_BIG)
    for i, x in enumerate((200, 540, 880)):
        put(im, boil(DRINKS[i], t), (x, 1700 + 10 * math.sin(t * 3 + i)), 0.8, 0, key=('dr3', i, int(t * 8) % 3))
        put(im, NUMS[i], (x + 120, 1560), pop(t, 12.4 + 0.15 * i, None, 0.3) * 0.8, (-6, 4, -3)[i], key=('n2', i))
    return im

def main():
    n = int(DUR * FPS); fdir = TMP / 'out'; fdir.mkdir(exist_ok=True)
    only = [float(a) for a in sys.argv[1:]]
    if only:                                   # stills at given seconds, for checking
        for s in only: frame(s).convert('RGB').save(OUT / f'check-{s:05.2f}.jpg', quality=85)
        return
    for i in range(n): frame(i / FPS).convert('RGB').save(fdir / f'{i:04d}.jpg', quality=88)
    mp4 = OUT / 'motion-test.mp4'
    subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-framerate', str(FPS), '-i', str(fdir / '%04d.jpg'), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', str(mp4)], check=True)
    print('saved', mp4)

if __name__ == '__main__':
    main()
