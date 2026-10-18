"""Rough motion test for h1 "Now you see it" (Halloween pack): scarcity (a limited drop, last chance, a sale ending).
The buyer's product is there, a snap, smoke rolls in, and when it clears the product is gone. Then GONE, the
deadline, the product back for one more look, and "Comment POOF".
World: a magic show. Built-in words in Playbill (the old magician-poster type) in gold with an ink edge; editable
lines in Arial Bold. Smoke: her smoke.mp4 (white smoke on black, in assets/props/source/halloween/) when it exists;
until then a stand-in built from the real steam photo in fall/ (layered, spun and grown from the centre).
Slots: 1 your product in place (hold still), 2 the same shot WITHOUT the product (it vanished), 3 the product again.
Usage: python build/motion_h1.py  ->  halloween/h1-now-you-see-it/preview/motion-test.mp4
"""
import math, random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageChops, ImageEnhance
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import storyboard_halloween as B

W, H, FPS, END = 1080, 1920, 30, 14.0
OUT = E.PACK / 'halloween' / 'h1-now-you-see-it' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
INK, GOLD, GOLD2 = (24, 18, 14), (246, 206, 112), (196, 140, 52)
BOLD, POSTER = 'C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/PLAYBILL.TTF'
LIB = E.PACK / 'assets' / 'props' / 'source'
SMOKE_VIDEO = B.SRC / 'smoke.mp4'
CLIPS = {'with': ('IMG_1439', 1.0), 'without': ('IMG_1385', 0.5), 'again': ('IMG_1439', 4.0)}   # stand-ins

def extract(src, key, t0=0.0, secs=6.0, hdr=True):
    d = TMP / key; d.mkdir(exist_ok=True)
    if not any(d.glob('*.jpg')):
        vf = (f'{B.S.TONE},' if hdr else '') + f'fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}'
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t0), '-t', str(secs), '-i', str(src), '-vf', vf, '-q:v', '3',
                        str(d / '%04d.jpg')], check=True)
    return sorted(d.glob('*.jpg'))
FR = {k: extract(E.FOOTAGE / f'{n}.MOV', k, t0) for k, (n, t0) in CLIPS.items()}
def vid(key, t): fs = FR[key]; return Image.open(fs[min(len(fs) - 1, max(0, int(t * FPS)))]).convert('RGBA')

def clamp(x): return max(0.0, min(1.0, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def back_out(x, s=2.0): x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s)

# ---- smoke: her video if it's there, otherwise the stand-in -----------------------------------------------------------------
SMOKE_FR = extract(SMOKE_VIDEO, 'smoke-video', hdr=False) if SMOKE_VIDEO.exists() else None
STEAM = ImageOps.grayscale(Image.open(LIB / 'fall' / 'Delicate Steam on Black Space-98.png'))
def smoke(u):
    """Smoke over the frame at progress u (0 = none, ~0.5 = fills the screen, 1 = cleared), as white with alpha."""
    if SMOKE_FR:
        f = Image.open(SMOKE_FR[min(len(SMOKE_FR) - 1, int(u * (len(SMOKE_FR) - 1)))]).convert('L')
        a = ImageOps.autocontrast(f).point(lambda v: min(255, int(v * 1.3)))
    else:
        a = Image.new('L', (W, H), 0); grow = ease(u / 0.5) if u < 0.5 else 1.0; thin = ease((u - 0.55) / 0.45)
        for k in range(9):   # the steam photo, spun round the centre and grown outward, layered into a billow
            s = 0.5 + 2.6 * grow * (0.7 + 0.1 * k); im = STEAM.resize((int(STEAM.width * s), int(STEAM.height * s)))
            im = im.rotate(k * 40 + u * 120, expand=True)
            a = ImageChops.lighter(a, _paste(a, im))
        fill = int(255 * clamp((grow - 0.75) / 0.25) * (1 - thin))
        a = ImageChops.lighter(a, Image.new('L', (W, H), fill)).point(lambda v: int(v * (1 - 0.92 * thin)))
    lay = Image.new('RGBA', (W, H), (244, 242, 238, 255)); lay.putalpha(a); return lay
def _paste(a, im):
    out = Image.new('L', (W, H), 0); out.paste(im, (int(W / 2 - im.width / 2), int(960 - im.height / 2))); return out

# ---- lettering: Playbill in gold, ink edge (a magic-show poster) -----------------------------------------------------------
_L = {}
def poster(text, px):
    if (text, px) in _L: return _L[(text, px)]
    f = E.ImageFont.truetype(POSTER, px); bb = f.getbbox(text); pad = px // 4 + 20
    w, h = bb[2] - bb[0] + 2 * pad, bb[3] - bb[1] + 2 * pad; org = (pad - bb[0], pad - bb[1])
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text(org, text, font=f, fill=255)
    e = Image.new('L', (w, h), 0); ImageDraw.Draw(e).text(org, text, font=f, fill=255, stroke_width=max(6, px // 14))
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sh = Image.new('RGBA', (w, h), INK + (255,)); sh.putalpha(e.point(lambda v: int(v * 0.6))); out.alpha_composite(sh, (px // 22, px // 16))
    k = Image.new('RGBA', (w, h), INK + (255,)); k.putalpha(e); out.alpha_composite(k)
    g = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(g)
    for y in range(h):
        u = abs(y / h - 0.45) * 2; c = tuple(int(GOLD[i] * (1 - u) + GOLD2[i] * u) for i in range(3)); d.line((0, y, w, y), fill=c + (255,))
    g.putalpha(m); out.alpha_composite(g); _L[(text, px)] = out; return out
def word(img, t, t0, text, c, px, rot=0, gone=None):
    """Pops in; if gone is set, it puffs away (shrinks and fades) at that time."""
    if t < t0: return
    k = back_out((t - t0) / 0.3, 2.4); a = 1.0
    if gone and t > gone: q = clamp((t - gone) / 0.3); k *= 1 + 0.4 * q; a = 1 - q
    if a <= 0: return
    im = poster(text, px); im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.BICUBIC)
    if rot: im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
    if a < 1: im = im.copy(); im.putalpha(im.split()[3].point(lambda v: int(v * a)))
    img.alpha_composite(im, (int(c[0] - im.width / 2), int(c[1] - im.height / 2)))
def line(img, t, t0, text, xy, px=70):
    if t < t0: return
    k = back_out((t - t0) / 0.25); f = E.ImageFont.truetype(BOLD, max(6, int(px * (0.6 + 0.4 * k))))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text(xy, text, font=f, fill=(255, 255, 255, 255), anchor='mm', stroke_width=max(4, px // 12), stroke_fill=INK + (255,))
    img.alpha_composite(lay)
def sparkle(img, c, r, t):
    """A hand-drawn four-point sparkle (the playful layer), drawn with a thick uneven gold line."""
    d = ImageDraw.Draw(img); k = 1 + 0.15 * math.sin(t * 20)
    for a in range(4):
        th = math.radians(a * 90 + 8); x2, y2 = c[0] + r * k * math.cos(th), c[1] + r * k * math.sin(th)
        d.line((c[0], c[1], x2, y2), fill=GOLD + (255,), width=9)
    for a in range(4):
        th = math.radians(a * 90 + 53); d.line((c[0], c[1], c[0] + r * 0.45 * math.cos(th), c[1] + r * 0.45 * math.sin(th)), fill=GOLD + (255,), width=6)

NIGHT = ImageOps.colorize(ImageOps.grayscale(Image.open(LIB / 'fall' / 'Delicate Steam on Black Space-98.png')).resize((W, H)),
                          (10, 8, 12), (70, 60, 52)).convert('RGBA')

def frame(t):
    # 0.0-2.2 clip 1: your product; NOW YOU SEE IT
    if t < 2.2:
        im = vid('with', t)
        word(im, t, 0.0, 'NOW YOU', (520, 400), 230, -2); word(im, t, 0.3, 'SEE IT', (520, 640), 320, 2)
        line(im, t, 0.9, '[our pumpkin spice candle]', (520, 860), 66)
    # 2.2-2.6 the snap: a gold flash of sparkles
    elif t < 2.6:
        im = vid('with', t); u = (t - 2.2) / 0.4
        for (x, y, r) in ((300, 900, 120), (780, 760, 90), (640, 1180, 140), (420, 1300, 80)): sparkle(im, (x, y), r * back_out(u / 0.5), t)
        word(im, t, 2.2, 'SNAP!', (520, 470), 300, -6)
    # 2.6-4.4 the smoke rolls in, the product is gone when it clears (clip 2 is the same shot, empty)
    elif t < 4.4:
        u = (t - 2.6) / 1.8; im = vid('with', t) if u < 0.5 else vid('without', t - 2.6)
        im.alpha_composite(smoke(u))
    # 4.4-6.2 clip 2: now you don't
    elif t < 6.2:
        im = vid('without', t - 2.6)
        word(im, t, 4.5, "NOW YOU", (520, 400), 230, -2); word(im, t, 4.8, "DON'T", (520, 640), 330, 3)
    # 6.2-8.4 intermission: GONE, and when
    elif t < 8.4:
        im = NIGHT.copy(); im.alpha_composite(smoke(0.75 + 0.25 * clamp((t - 6.2) / 2.2)))
        word(im, t, 6.3, 'GONE', (540, 820), 330, -3)
        line(im, t, 6.9, '[at midnight Oct 31]', (540, 1080), 80)
    # 8.4-11.0 clip 3: the product back for one more look; only a few left
    elif t < 11.0:
        im = vid('again', t - 8.4)
        if t < 8.9: im.alpha_composite(smoke(0.6 + 0.4 * clamp((t - 8.4) / 0.5)))
        word(im, t, 8.7, 'ONLY', (520, 400), 230, -3)
        line(im, t, 9.0, '[20 left]', (520, 620), 120)
    # 11.0-14.0 CTA: Comment POOF
    else:
        im = vid('again', t - 8.4)
        word(im, t, 11.05, 'COMMENT', (520, 500), 220, -2)
        line(im, t, 11.5, '[POOF]', (520, 740), 160)
        line(im, t, 11.9, 'before it disappears', (520, 900), 66)
        for (x, y, r) in ((180, 300, 60), (900, 330, 50)): sparkle(im, (x, y), r, t)
    return im.convert('RGB')

def main():
    fdir = TMP / 'out'; fdir.mkdir(exist_ok=True)
    for i in range(int(END * FPS)): frame(i / FPS).save(fdir / f'{i:04d}.jpg', quality=88)
    mp4 = OUT / 'motion-test.mp4'
    subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-framerate', str(FPS), '-i', str(fdir / '%04d.jpg'), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', str(mp4)], check=True)
    print('saved', mp4, '(smoke:', 'her video' if SMOKE_FR else 'stand-in', ')')

if __name__ == '__main__':
    main()
