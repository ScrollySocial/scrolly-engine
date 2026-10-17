"""Rough motion test for h6 "Once in a blood moon", in Mercedes's reference style (Lisa Gorbunova contact sheets,
2026-10-17): the VIDEO is the star and stays full screen; words pop in one at a time (small clean Arial + one big
Bodoni key word in the accent colour, no outlines or dark bands); the fun is in the edits: the black night closes in on the
video into a circle that becomes the moon (round 2: no opening bats, big hook words from frame 1), the moon becomes a round
window that opens to full screen, a huge tree sweeps past as a wipe. Stand-in footage: her July clips.
Usage: python build/motion_h6.py  ->  halloween/h6-once-in-a-blood-moon/preview/motion-test.mp4
"""
import math, random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import storyboard_halloween as B

W, H, FPS = 1080, 1920, 30
OUT = E.PACK / 'halloween' / 'h6-once-in-a-blood-moon' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
RED, CREAM = (232, 92, 60), (246, 238, 222)
SANS, SERIF = 'C:/Windows/Fonts/arial.ttf', B.SERIF
CLIPS = {'a': ('IMG_1439', 1.0), 'b': ('IMG_1385', 0.5), 'c': ('IMG_1447', 0.3)}

def extract(key, secs=4.0):
    name, t0 = CLIPS[key]; d = TMP / key; d.mkdir(exist_ok=True)
    if not any(d.glob('*.jpg')):
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t0), '-t', str(secs), '-i', str(E.FOOTAGE / f'{name}.MOV'),
                        '-vf', f'{B.S.TONE},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}',
                        '-q:v', '3', str(d / '%04d.jpg')], check=True)
    return sorted(d.glob('*.jpg'))
FR = {k: extract(k) for k in CLIPS}
def vid(key, t, speed=1.15):
    fs = FR[key]; return Image.open(fs[min(len(fs) - 1, int(t * FPS * speed))]).convert('RGBA')

# easing
def clamp(x): return max(0.0, min(1.0, x))
def back_out(x, s=1.9): x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s)
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)

# assets
sky = B.night_sky(); MOON = B.moon_disc(1000); BLOOD = B.blood(MOON)
cl = B.clouds(1800); tree = B.src('Twisted Haunted Tree Silhouette.png').convert('RGBA')
wolf = B.white_on_clear('Howling Wolf Silhouette.png', (14, 10, 16))
bat = B.cut('Cute Kawaii Bat with Spread Wings.png'); hang = B.cut('Cute Upside-Down Wrapped Bat.png')
branch = B.fit_w(B.cut('Cute Twisted Spooky Tree Branch.png'), 900)
_cache = {}
def sized(im, w, key):
    k = (key, int(w))
    if k not in _cache: _cache[k] = B.fit_w(im, max(8, int(w)))
    return _cache[k]

def put(img, item, c, scale=1.0, rot=0, alpha=1.0, key='x'):
    if scale <= 0.02 or alpha <= 0.01: return
    it = sized(item, item.width * scale, key) if scale != 1 else item
    if rot: it = it.rotate(rot, expand=True, resample=Image.BICUBIC)
    if alpha < 1: it = it.copy(); it.putalpha(it.split()[3].point(lambda v: int(v * alpha)))
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def word(img, t, t0, xy, text, px, color, serif=False, anchor='mm'):
    """A word that pops in at t0: quick scale-up with a little overshoot, soft shadow only."""
    k = back_out((t - t0) / 0.22)
    if t < t0: return
    font = B.F(SERIF if serif else SANS, max(4, int(px * (0.6 + 0.4 * k))))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(lay).text(xy, text, font=font, fill=color + (int(255 * clamp((t - t0) / 0.08)),), anchor=anchor)
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.putalpha(lay.split()[3].filter(ImageFilter.GaussianBlur(9)).point(lambda v: min(255, int(v * 1.1))))
    img.alpha_composite(sh); img.alpha_composite(lay)

def _shadowed(img, lay):
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.putalpha(lay.split()[3].filter(ImageFilter.GaussianBlur(9)).point(lambda v: min(255, int(v * 1.1))))
    img.alpha_composite(sh); img.alpha_composite(lay)

def slam(img, t, t0, xy, text, px, color, serif=True):
    """A word that slams in from huge and lands hard (0.18 s), centred on xy."""
    if t < t0: return
    u = clamp((t - t0) / 0.18); sc = 2.6 - 1.6 * (1 - (1 - u) ** 3)
    font = B.F(SERIF if serif else SANS, max(4, int(px * sc)))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(lay).text(xy, text, font=font, fill=color + (int(255 * clamp(u * 2.5)),), anchor='mm')
    _shadowed(img, lay)

def letters(img, t, t0, xy, text, px, color, step=0.06):
    """Each letter pops up on its own, tipping in from a tilt, then the word bobs gently."""
    font = B.F(SERIF, px); d = ImageDraw.Draw(img); total = d.textlength(text, font=font)
    x = xy[0] - total / 2; lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for i, ch in enumerate(text):
        w = d.textlength(ch, font=font); k = back_out((t - t0 - i * step) / 0.28, 2.4)
        if t >= t0 + i * step and ch != ' ':
            g = Image.new('RGBA', (int(px * 1.6), int(px * 1.8)), (0, 0, 0, 0))
            ImageDraw.Draw(g).text((g.width / 2, g.height / 2), ch, font=font, fill=color + (255,), anchor='mm')
            rot = (1 - clamp(k)) * (28 if i % 2 else -28); sc = max(0.05, k)
            g = g.resize((max(1, int(g.width * sc)), max(1, int(g.height * sc))), Image.BICUBIC).rotate(rot, expand=True, resample=Image.BICUBIC)
            bob = 6 * math.sin(t * 6 + i * 0.7) if t > t0 + len(text) * step + 0.3 else 0
            lay.alpha_composite(g, (int(x + w / 2 - g.width / 2), int(xy[1] - g.height / 2 + bob)))
        x += w
    _shadowed(img, lay)

def shake(im, t, t0, amp=18, dur=0.25):
    if not (t0 <= t < t0 + dur): return im
    a = amp * (1 - (t - t0) / dur); dx, dy = int(a * math.sin(t * 90)), int(a * math.cos(t * 77))
    out = im.copy(); out.paste(im, (dx, dy)); return out

def moon_window(img, key, t, d, c, tint=0.15):
    v = ImageOps.fit(vid(key, t), (d, d)); m = Image.new('L', (d, d), 0); ImageDraw.Draw(m).ellipse((0, 0, d - 1, d - 1), fill=255)
    v.putalpha(m.filter(ImageFilter.GaussianBlur(2))); img.alpha_composite(v, (int(c[0] - d / 2), int(c[1] - d / 2)))

random.seed(7)
FLOOD = [(random.uniform(-100, W + 100), random.uniform(-100, H + 100), random.uniform(260, 560), random.uniform(-30, 30), random.uniform(0, 0.25))
         for _ in range(46)]

def frame(t):
    # 0.0-2.2  clip A full screen; a big bold hook from the first frame
    if t < 2.2:
        im = vid('a', t)
        for k_, (w_, x_) in enumerate((('once', W / 2 - 250), ('in', W / 2 + 40), ('a', W / 2 + 230))):
            slam(im, t, -0.1 + k_ * 0.2, (x_, 300), w_, 150, CREAM)
        letters(im, t, 0.55, (W / 2, 560), 'blood', 270, RED); letters(im, t, 0.85, (W / 2, 820), 'moon', 270, RED)
        im = shake(im, t, 1.2)
    # 2.2-3.2  the black night closes in on the video into a circle, and the circle becomes the moon
    elif t < 3.2:
        u = ease((t - 2.2) / 1.0); r = 1150 - u * 650; cx, cy = W / 2, 1140 - (1 - u) * 180
        im = sky.copy(); d = int(2 * r)
        inner = vid('a', t)
        if u > 0.55:   # the clip inside the circle dissolves into the real moon, then it starts to redden
            mo = B.fit_w(Image.blend(MOON, BLOOD, clamp((u - 0.8) / 0.2) * 0.3), 1000)
            moon_full = Image.new('RGBA', (W, H), (0, 0, 0, 255)); moon_full.alpha_composite(sky); moon_full.alpha_composite(mo, (int(cx - 500), int(cy - 500)))
            inner = Image.blend(inner, moon_full, clamp((u - 0.55) / 0.4))
        m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
        im.paste(inner, (0, 0), m.filter(ImageFilter.GaussianBlur(3)))
        k = 1 - clamp((t - 2.2) / 0.5)
        if k > 0:
            for k_, (w_, x_) in enumerate((('once', W / 2 - 250), ('in', W / 2 + 40), ('a', W / 2 + 230))): slam(im, 3.0, 0.0, (x_, 300), w_, 150, CREAM)
            letters(im, 3.0, 0.0, (W / 2, 560), 'blood', 270, RED); letters(im, 3.0, 0.0, (W / 2, 820), 'moon', 270, RED)
    # 3.2-5.0  graphics break: the huge moon, clouds drift, it turns blood red; "our once-a-year SALE"
    elif t < 5.0:
        u = (t - 3.2) / 1.8; im = sky.copy()
        B.moon_glow(im, 1000, ((W - 1000) // 2, 640)); put(im, Image.blend(MOON, BLOOD, 0.3 + 0.7 * ease(u * 1.5)), (W / 2, 1140))
        put(im, cl, (-300 + 500 * u, 1650), 0.9, key='cl'); put(im, cl, (1350 - 500 * u, 700), 0.8, 180, key='cl2')
        word(im, t, 3.45, (W / 2, 300), 'our once-a-year', 66, CREAM); word(im, t, 3.85, (W / 2, 450), 'SALE', 210, RED, serif=True)
    # 5.0-6.0  the moon becomes a round window on clip B, then opens to full screen
    elif t < 6.0:
        u = ease((t - 5.0) / 1.0); im = sky.copy()
        d = int(1000 + u * 1500); B.moon_glow(im, min(d, 1400), (int(W / 2 - min(d, 1400) / 2), int(1140 - min(d, 1400) / 2)))
        moon_window(im, 'b', t - 5.0, d, (W / 2, 1140 - u * 180))
    # 6.0-8.4  clip B full screen; the wolf slides up and howls; the deal pops in word by word
    elif t < 8.4:
        im = vid('b', t - 5.0)
        k = back_out((t - 6.3) / 0.5); lift = (1 - min(1.0, k)) * 900          # a blood moon rises with the wolf in front of it
        mc = (360, 1420 + lift); B.moon_glow(im, 620, (int(mc[0] - 310), int(mc[1] - 310))); put(im, BLOOD, mc, 0.62, key='bm')
        wf = sized(wolf, 600, 'wolf'); im.alpha_composite(wf, (60, int(H - wf.height + 40 + lift)))
        word(im, t, 6.5, (W / 2, 280), 'everything', 66, CREAM); word(im, t, 6.9, (W / 2, 440), '30% off', 210, RED, serif=True)
    # 8.4-9.2  a huge tree sweeps past the lens: the wipe to clip C
    elif t < 9.2:
        u = ease((t - 8.4) / 0.8); im = vid('b', t - 5.0) if u < 0.5 else vid('c', t - 8.4)
        tr = sized(tree, 2800, 'tree'); im.alpha_composite(tr, (int(W - u * (tr.width + W)), -300))
    # 9.2-11.4  clip C full screen; the dates; one bat lands and hangs upside down
    elif t < 11.4:
        im = vid('c', t - 8.4)
        bk = ease((t - 9.25) / 0.35); im.alpha_composite(branch, (int(W - 760 + (1 - bk) * 900), 40))      # a branch slides in
        k = back_out((t - 9.6) / 0.35); sway = 5 * math.sin(t * 4)
        put(im, hang, (W - 300, 330 + 4 * math.sin(t * 5)), 0.0 if k <= 0 else k * 230 / hang.width, sway, key='hang')
        word(im, t, 9.4, (W / 2, 1460), 'this weekend only', 66, CREAM); word(im, t, 9.8, (W / 2, 1620), 'Oct 29-31', 170, RED, serif=True)
    # 11.4-14  CTA: the blood moon, bats settle, Comment MOON
    else:
        im = sky.copy(); B.moon_glow(im, 1000, ((W - 1000) // 2, 640)); put(im, BLOOD, (W / 2, 1140))
        put(im, cl, (W / 2 + 60 * math.sin(t), 1720), 0.85, key='cl')
        for i, (x, y, w) in enumerate(((210, 560, 260), (880, 470, 220))):
            k = back_out((t - 11.5 - i * 0.15) / 0.35); put(im, bat, (x, y + 10 * math.sin(t * 6 + i)), 0.0 if k <= 0 else k * w / bat.width, 8 * math.sin(t * 5 + i), key='bat')
        word(im, t, 11.6, (W / 2, 1000), 'comment', 70, CREAM); word(im, t, 11.95, (W / 2, 1170), 'MOON', 240, CREAM, serif=True)
        word(im, t, 12.4, (W / 2, 1340), 'for your code', 66, CREAM)
    return im.convert('RGB')

def main():
    n = int(14.0 * FPS); fdir = TMP / 'out'; fdir.mkdir(exist_ok=True)
    for i in range(n):
        frame(i / FPS).save(fdir / f'{i:04d}.jpg', quality=88)
    mp4 = OUT / 'motion-test.mp4'
    subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-framerate', str(FPS), '-i', str(fdir / '%04d.jpg'), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', str(mp4)], check=True)
    print('saved', mp4)

if __name__ == '__main__':
    main()
