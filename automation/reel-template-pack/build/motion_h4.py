"""Rough motion test for h4 "What's inside?", the free bonus template for the SPOOKY comment keyword (Mercedes
2026-10-23: a bonus template made only for the freebie, never in the paid pack). Business job: tease a new product or
launch, then send people to comment. Video-first rewrite of the parked round 1-3 idea (her notes: "more of a carousel
idea", "barfing projectile pumpkin"): nothing flies at the lens; the pumpkin is a window. Its carved face shows the
buyer's clip through the holes, the camera flies in through the mouth to the next clip, then in through an eye.
Same word style as h6 (small clean Arial line + one big Bodoni word, butter accent). Stand-in footage: her July clips.
Usage: python build/motion_h4.py  ->  halloween/h4-whats-inside/preview/motion-test.mp4
"""
import math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import storyboard_halloween as B
import doodles as D

W, H, FPS = 1080, 1920, 30
OUT = E.PACK / 'halloween' / 'h4-whats-inside' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
BUTTER, CREAM = (247, 230, 169), (246, 238, 222)
EDGE = (52, 22, 30)                                   # thin dark outline so words read on light footage too
SANS, SERIF = 'C:/Windows/Fonts/arial.ttf', B.SERIF
CLIPS = {'a': ('IMG_1439', 1.0), 'b': ('IMG_1385', 0.5), 'c': ('IMG_1447', 0.3)}

def extract(key, secs=4.5):
    name, t0 = CLIPS[key]; d = TMP / key; d.mkdir(exist_ok=True)
    if not any(d.glob('*.jpg')):
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t0), '-t', str(secs), '-i', str(E.FOOTAGE / f'{name}.MOV'),
                        '-vf', f'{B.S.TONE},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}',
                        '-q:v', '3', str(d / '%04d.jpg')], check=True)
    return sorted(d.glob('*.jpg'))
FR = {k: extract(k) for k in CLIPS}
def vid(key, t, speed=1.0):
    fs = FR[key]; return Image.open(fs[max(0, min(len(fs) - 1, int(t * FPS * speed)))]).convert('RGBA')

def clamp(x): return max(0.0, min(1.0, x))
def back_out(x, s=1.9): x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s)
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_in(x): x = clamp(x); return x * x * x

# ---- the pumpkin: a shell with see-through carved holes ----------------------------------------------------------------
FULL, _, HOLES, _ = B.pumpkin_parts()
_bb = FULL.getbbox(); FULL = FULL.crop(_bb); HOLES = HOLES.crop(_bb)
SHELL = FULL.copy(); SHELL.putalpha(ImageChops.subtract(FULL.split()[3], HOLES))
PW, PH = FULL.size
def _hole_centre(box):
    """Centre of the carved hole(s) inside box (fractions of the pumpkin), as fractions of the pumpkin."""
    px = tuple(int(v) for v in (box[0] * PW, box[1] * PH, box[2] * PW, box[3] * PH))
    b = HOLES.crop(px).point(lambda v: 255 if v > 128 else 0).getbbox()
    return ((px[0] + (b[0] + b[2]) / 2) / PW, (px[1] + (b[1] + b[3]) / 2) / PH)
MOUTH = _hole_centre((0.0, 0.58, 1.0, 0.95))
EYE_R = _hole_centre((0.5, 0.0, 1.0, 0.55))

def pumpkin(img, width, anchor, frac=(0.5, 0.5), inside=None, glow=0.0):
    """Draw the pumpkin `width` px wide with point `frac` of it at screen point `anchor`. `inside` (a full-screen
    image) shows through the holes; glow 0..1 warms the holes like a candle inside."""
    s = width / PW; w, h = int(PW * s), int(PH * s)
    x0, y0 = int(anchor[0] - frac[0] * w), int(anchor[1] - frac[1] * h)
    # crop what's on screen only (zooms go far past the frame)
    sx0, sy0, sx1, sy1 = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if sx1 <= sx0 or sy1 <= sy0: return
    box = ((sx0 - x0) / s, (sy0 - y0) / s, (sx1 - x0) / s, (sy1 - y0) / s)
    sz = (sx1 - sx0, sy1 - sy0)
    holes = HOLES.crop(tuple(int(v) for v in box)).resize(sz, Image.BILINEAR)
    if inside is not None:
        win = inside.crop((sx0, sy0, sx1, sy1))
        if glow > 0:
            warm = Image.new('RGBA', sz, (255, 170, 60, 255)); win = Image.blend(win, warm, 0.8 * glow)
        win.putalpha(holes); img.alpha_composite(win, (sx0, sy0))
    shell = SHELL.crop(tuple(int(v) for v in box)).resize(sz, Image.BILINEAR)
    img.alpha_composite(shell, (sx0, sy0))

# ---- words (h6 style) --------------------------------------------------------------------------------------------------
def _shadowed(img, lay):
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.putalpha(lay.split()[3].filter(ImageFilter.GaussianBlur(9)).point(lambda v: min(255, int(v * 1.1))))
    img.alpha_composite(sh); img.alpha_composite(lay)

def word(img, t, t0, xy, text, px, color, serif=False):
    if t < t0: return
    k = back_out((t - t0) / 0.22); font = B.F(SERIF if serif else SANS, max(4, int(px * (0.6 + 0.4 * k))))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text(xy, text, font=font, fill=color + (int(255 * clamp((t - t0) / 0.08)),), anchor='mm',
                             stroke_width=max(2, font.size // 22), stroke_fill=EDGE); _shadowed(img, lay)

def slam(img, t, t0, xy, text, px, color):
    if t < t0: return
    u = clamp((t - t0) / 0.18); sc = 2.6 - 1.6 * (1 - (1 - u) ** 3)
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    f = B.F(SERIF, max(4, int(px * sc)))
    ImageDraw.Draw(lay).text(xy, text, font=f, fill=color + (int(255 * clamp(u * 2.5)),), anchor='mm', stroke_width=max(2, f.size // 40), stroke_fill=EDGE); _shadowed(img, lay)

def letters(img, t, t0, xy, text, px, color, step=0.06):
    font = B.F(SERIF, px); d = ImageDraw.Draw(img); total = d.textlength(text, font=font)
    x = xy[0] - total / 2; lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for i, ch in enumerate(text):
        w = d.textlength(ch, font=font); k = back_out((t - t0 - i * step) / 0.28, 2.4)
        if t >= t0 + i * step and ch != ' ':
            g = Image.new('RGBA', (int(px * 1.6), int(px * 1.8)), (0, 0, 0, 0))
            ImageDraw.Draw(g).text((g.width / 2, g.height / 2), ch, font=font, fill=color + (255,), anchor='mm', stroke_width=max(2, px // 40), stroke_fill=EDGE)
            rot = (1 - clamp(k)) * (28 if i % 2 else -28); sc = max(0.05, k)
            g = g.resize((max(1, int(g.width * sc)), max(1, int(g.height * sc))), Image.BICUBIC).rotate(rot, expand=True, resample=Image.BICUBIC)
            bob = 6 * math.sin(t * 6 + i * 0.7) if t > t0 + len(text) * step + 0.3 else 0
            lay.alpha_composite(g, (int(x + w / 2 - g.width / 2), int(xy[1] - g.height / 2 + bob)))
        x += w
    _shadowed(img, lay)

# ---- props: a candy-corn floor (a set, each one turned a little differently), small pumpkins, doodles --------------------
sky = B.night_sky()
CORN, WORM = B.candy()
SMALL = B.cut('Classic orange pumpkin on white-5.png'); SMALL = SMALL.crop(SMALL.getbbox())
FLOOR = [(90 + i * 180, 1760 + (i % 2) * 30, 150 + (i % 3) * 20, (-1) ** i * (8 + i * 3)) for i in range(6)]
SPARK = D.get('icons', 9, BUTTER, 120); ARROW = D.get('arrows', 0, BUTTER, 240); LINE = D.get('underlines', 2, BUTTER, 520)
_c = {}
def sized(im, w, key):
    if (key, int(w)) not in _c: _c[(key, int(w))] = B.fit_w(im, max(8, int(w)))
    return _c[(key, int(w))]
def put(img, im, c, w, rot=0, key='x'):
    it = sized(im, w, key)
    if rot: it = it.rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))
def corn_floor(img, t, t0):
    for i, (x, y, w, r) in enumerate(FLOOR):
        k = back_out((t - t0 - i * 0.07) / 0.3)
        if k > 0.02: put(img, CORN, (x, y + (1 - min(1, k)) * 300), w * min(1.0, k), r, key=f'corn{i}')
def halo(img, c, d, a=1.0):
    B.moon_glow(img, int(d), (int(c[0] - d / 2), int(c[1] - d / 2)), colors=((255, 170, 70), (220, 90, 20)), blur=90)

HOOK = ((('what\'s', W / 2, 380), 0.0),)
def frame(t):
    # 0.0-2.0  clip A full screen, big hook from frame 1
    if t < 2.0:
        im = vid('a', t)
        slam(im, t, -0.1, (W / 2, 390), "what's", 200, CREAM); letters(im, t, 0.45, (W / 2, 640), 'inside?', 250, BUTTER)
        D.draw_on(im, SPARK, (900, 520), t, 1.1, 0.2)
        # the pumpkin's stem peeks up from the bottom edge: something is coming
        if t > 1.4: pumpkin(im, 1500, (W / 2, H + 760 - 140 * ease((t - 1.4) / 0.6)), (0.5, 0.5))
    # 2.0-3.2  the pumpkin rises over the clip; clip A now only shows through the carved face; the night closes in
    elif t < 3.2:
        u = ease((t - 2.0) / 1.2); clip = vid('a', t)
        im = Image.blend(clip, sky, clamp((u - 0.35) / 0.5))
        halo(im, (W / 2, 1150), 1300 * clamp((u - 0.5) / 0.5))
        pumpkin(im, 1500 - 520 * u, (W / 2, H + 620 - (H + 620 - 1150) * u), (0.5, 0.5), inside=clip)
        k = 1 - clamp((t - 2.0) / 0.4)
        if k > 0: slam(im, 9, 0, (W / 2, 390), "what's", 200, CREAM); letters(im, 9, 0, (W / 2, 640), 'inside?', 250, BUTTER)
    # 3.2-5.0  graphic stage: the lit pumpkin on the candy-corn floor; "something new"
    elif t < 5.0:
        im = sky.copy(); halo(im, (W / 2, 1150), 1300)
        pumpkin(im, 980, (W / 2, 1150), (0.5, 0.5), inside=vid('a', t), glow=ease((t - 3.4) / 0.8))
        corn_floor(im, t, 3.3)
        word(im, t, 3.45, (W / 2, 330), 'something', 70, CREAM); letters(im, t, 3.8, (W / 2, 520), 'new', 250, BUTTER)
        D.draw_on(im, SPARK, (250, 470), t, 4.2, 0.2); D.draw_on(im, SPARK, (840, 600), t, 4.35, 0.2, 20)
    # 5.0-6.0  the camera flies in through the mouth; clip B is inside
    elif t < 6.0:
        u = ease_in((t - 5.0) / 1.0); im = sky.copy()
        mx, my = MOUTH; cx, cy = W / 2 + (mx - 0.5) * 980 * (1 - u), 1150 + (my - 0.5) * 980 * (1 - u) + (H / 2 - 1150) * u
        halo(im, (W / 2, 1150), 1300 * (1 - u))
        pumpkin(im, 980 * (1 + 18 * u), (cx, cy), (mx, my), inside=vid('b', t - 5.0), glow=1 - u)
        if u < 0.15: corn_floor(im, 9, 0)
    # 6.0-8.4  clip B full screen; the launch date; two small pumpkins sit on the bottom edge
    elif t < 8.4:
        im = vid('b', t - 5.0)
        for i, (x, w) in enumerate(((150, 300), (930, 240))):
            k = back_out((t - 6.2 - i * 0.12) / 0.35)
            if k > 0.02: sp = sized(SMALL, w * min(1, k), f'sp{i}'); im.alpha_composite(sp, (int(x - sp.width / 2), H - sp.height + 40))
        word(im, t, 6.3, (W / 2, 360), 'launching', 70, CREAM); letters(im, t, 6.65, (W / 2, 560), 'Oct 31', 220, BUTTER)
        D.draw_on(im, ARROW, (300, 820), t, 7.3, 0.3, -35)
    # 8.4-9.4  the pumpkin swings in from the right over clip B, clip C glowing in its eyes; we dive into the right eye
    elif t < 9.4:
        u = (t - 8.4) / 1.0; im = vid('b', t - 5.0)
        if u < 0.45:
            k = ease(u / 0.45); pumpkin(im, 1250, (W + 700 - (W / 2 + 700) * k, 1050), (0.5, 0.5), inside=vid('c', t - 8.4))
        else:
            k = ease_in((u - 0.45) / 0.55); ex, ey = EYE_R
            pumpkin(im, 1250 * (1 + 22 * k), (W / 2 + (ex - 0.5) * 1250 * (1 - k), 1050 + (ey - 0.5) * 1250 * (1 - k) + (H / 2 - 1050) * k), (ex, ey), inside=vid('c', t - 8.4))
    # 9.4-11.6  clip C full screen; "first look" with a hand-drawn underline
    elif t < 11.6:
        im = vid('c', t - 8.4)
        word(im, t, 9.55, (W / 2, 360), 'get the', 70, CREAM); letters(im, t, 9.9, (W / 2, 560), 'first look', 190, BUTTER)
        D.draw_on(im, LINE, (W / 2, 690), t, 10.6, 0.35)
    # 11.6-14.5  CTA: the lit pumpkin home again, the floor, comment PUMPKIN
    else:
        im = sky.copy(); halo(im, (W / 2, 1250), 1200)
        pumpkin(im, 820, (W / 2, 1250 + 8 * math.sin(t * 3)), (0.5, 0.5), inside=vid('c', 2.2), glow=1.0)
        corn_floor(im, t, 11.7)
        word(im, t, 11.8, (W / 2, 330), 'comment', 72, CREAM); letters(im, t, 12.1, (W / 2, 520), 'PUMPKIN', 200, BUTTER)
        word(im, t, 12.8, (W / 2, 700), 'to get in first', 66, CREAM)
        D.draw_on(im, SPARK, (150, 330), t, 12.5, 0.2, -15); D.draw_on(im, SPARK, (930, 330), t, 12.65, 0.2, 15)
    return im.convert('RGB')

def main():
    n = int(14.5 * FPS); fdir = TMP / 'out'; fdir.mkdir(exist_ok=True)
    for i in range(n):
        frame(i / FPS).save(fdir / f'{i:04d}.jpg', quality=88)
    mp4 = OUT / 'motion-test.mp4'
    subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-framerate', str(FPS), '-i', str(fdir / '%04d.jpg'), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', str(mp4)], check=True)
    print('saved', mp4)

if __name__ == '__main__':
    if len(sys.argv) > 1:      # stills for checking: python build/motion_h4.py 0.5 2.6 4 ...
        for s in sys.argv[1:]: frame(float(s)).save(OUT / f'_t{s}.jpg', quality=85)
    else: main()
