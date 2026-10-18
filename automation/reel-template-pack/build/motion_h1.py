"""Rough motion test for h1 "Now you see it" (Halloween pack): scarcity (a limited drop, last chance, a sale ending).
The buyer's product is there, a snap, smoke rolls in, and when it clears the product is gone. Then GONE, the
deadline, the product back for one more look, and "Comment POOF".
v2 (her notes): it's the SAME shot twice: the person, a snap, then the shot without them and a puff of smoke where
they stood. Built-in words in Bodoni Moda (her pick, modern IG), thickened with a strong shadow; editable lines in
Arial Bold. Smoke: her smoke.mp4 (white smoke on black, in assets/props/source/halloween/) when it exists;
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

W, H, FPS, END = 1080, 1920, 30, 12.5
OUT = E.PACK / 'halloween' / 'h1-now-you-see-it' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
INK, GOLD, GOLD2 = (24, 18, 14), (246, 206, 112), (196, 140, 52)
BOLD, POSTER = 'C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/PLAYBILL.TTF'
LIB = E.PACK / 'assets' / 'props' / 'source'
SMOKE_VIDEO = B.SRC / 'smoke.mp4'
CLIPS = {'with': ('IMG_1385', 1.4), 'without': ('IMG_1385', 0.0), 'again': ('IMG_1439', 4.0)}   # stand-ins: her kitchen clip
# starts empty before she walks in, so its first frame is the same shot without the person (the buyer films both)
SPOT = (330, 1050)          # where the person stands in the stand-in clip: the smoke puffs up there
ACC = (236, 120, 36)        # accent: buyers change it to their brand colour

def extract(src, key, t0=0.0, secs=6.0, hdr=True):
    d = TMP / key; d.mkdir(exist_ok=True)
    if not any(d.glob('*.jpg')):
        vf = (f'{B.S.TONE},' if hdr else '') + f'fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}'
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t0), '-t', str(secs), '-i', str(src), '-vf', vf, '-q:v', '3',
                        str(d / '%04d.jpg')], check=True)
    return sorted(d.glob('*.jpg'))
FR = {k: extract(E.FOOTAGE / f'{n}.MOV', k, t0) for k, (n, t0) in CLIPS.items()}
def vid(key, t): fs = FR[key]; return Image.open(fs[min(len(fs) - 1, max(0, int(t * FPS)))]).convert('RGBA')
def _empty_shot():
    """Stand-in only: her kitchen clip's first frame still shows her hand at the right edge; crop to
    the left of the frame, scaled back up, so the shot reads as empty."""
    im = vid('without', 0.0); cw = 840; ch = int(cw * 16 / 9); return im.crop((0, 160, cw, 160 + ch)).resize((W, H), Image.LANCZOS)
EMPTY = _empty_shot()

def clamp(x): return max(0.0, min(1.0, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def back_out(x, s=2.0): x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s)

# ---- smoke: her video if it's there, otherwise the stand-in -----------------------------------------------------------------
SMOKE_FR = extract(SMOKE_VIDEO, 'smoke-video', hdr=False) if SMOKE_VIDEO.exists() else None
STEAM = ImageOps.grayscale(Image.open(LIB / 'fall' / 'Delicate Steam on Black Space-98.png'))
def smoke(u, at=None):
    """A puff of smoke at progress u (0 = the snap, 1 = gone), white with alpha. Her smoke.mp4 plays full frame
    (white smoke on black, keyed by brightness); the stand-in is the real steam photo, layered, rising and thinning."""
    if SMOKE_FR:
        f = Image.open(SMOKE_FR[min(len(SMOKE_FR) - 1, int(u * (len(SMOKE_FR) - 1)))]).convert('L')
        a = ImageOps.autocontrast(f).point(lambda v: min(255, int(v * 1.3)))
    else:
        cx, cy = at or (W / 2, 960); a = Image.new('L', (W, H), 0)
        grow = ease(u / 0.35); fade = 1 - ease((u - 0.35) / 0.65)
        for k, (rot, dx, dy, s0) in enumerate(((0, 0, 0, 1.0), (140, -90, 60, 0.85), (230, 110, 30, 0.9))):
            sc = (0.4 + 1.0 * grow) * s0; im = STEAM.resize((int(STEAM.width * sc), int(STEAM.height * sc)))
            im = im.rotate(rot + u * 40, expand=True)
            a = ImageChops.lighter(a, _paste(im, (cx + dx * grow, cy + dy - 240 * u)))
        a = a.filter(ImageFilter.GaussianBlur(3 + 10 * u)).point(lambda v: int(min(255, v * 1.7) * fade))
    lay = Image.new('RGBA', (W, H), (246, 244, 240, 255)); lay.putalpha(a); return lay
def _paste(im, c):
    out = Image.new('L', (W, H), 0); out.paste(im, (int(c[0] - im.width / 2), int(c[1] - im.height / 2))); return out

# ---- lettering: Bodoni Moda (her pick, option C), thickened and shadowed so it reads over video ---------------------
SERIF = B.SERIF
def word(img, t, t0, text, c, px, color=(255, 255, 255), gone=None):
    """Pops in (scale with a small overshoot); with gone set, it lifts and fades away like a puff."""
    if t < t0: return
    k = back_out((t - t0) / 0.3, 2.2); a = 1.0; dy = 0
    if gone and t > gone: q = clamp((t - gone) / 0.35); a = 1 - q; dy = -60 * q
    if a <= 0: return
    f = E.ImageFont.truetype(SERIF, max(6, int(px * (0.7 + 0.3 * k))))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text((c[0], c[1] + dy), text, font=f, fill=color + (255,), anchor='mm', stroke_width=max(2, px // 45), stroke_fill=color + (255,))
    if a < 1: lay.putalpha(lay.split()[3].point(lambda v: int(v * a)))
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.putalpha(lay.split()[3].filter(ImageFilter.GaussianBlur(12)).point(lambda v: min(255, int(v * 1.25))))
    img.alpha_composite(sh); img.alpha_composite(sh); img.alpha_composite(lay)

def line(img, t, t0, text, xy, px=70):
    if t < t0: return
    k = back_out((t - t0) / 0.25); f = E.ImageFont.truetype(BOLD, max(6, int(px * (0.6 + 0.4 * k))))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text(xy, text, font=f, fill=(255, 255, 255, 255), anchor='mm', stroke_width=max(4, px // 12), stroke_fill=INK + (255,))
    img.alpha_composite(lay)
NIGHT = ImageOps.colorize(ImageOps.grayscale(Image.open(LIB / 'fall' / 'Delicate Steam on Black Space-98.png')).resize((W, H)),
                          (10, 8, 12), (70, 60, 52)).convert('RGBA')

def flash(img, k):
    w = Image.new('RGBA', (W, H), (255, 255, 255, int(255 * k))); img.alpha_composite(w)

def frame(t):
    # 0.0-2.4 clip 1: the person (with the product) in the shot; now you see it
    if t < 2.4:
        im = vid('with', t)
        word(im, t, -0.2, 'now you', (520, 360), 130); word(im, t, 0.15, 'see it', (520, 560), 250, ACC)
        line(im, t, 0.8, '[me + our spice candle]', (520, 760), 62)
    # 2.4-2.55 the snap: a quick white flash
    elif t < 2.55:
        im = vid('with', t); flash(im, 1 - (t - 2.4) / 0.15)
    # 2.55-5.0 the same shot, the person gone; a puff of smoke where they stood; now you don't
    elif t < 5.0:
        im = EMPTY.copy(); im.alpha_composite(smoke((t - 2.55) / 2.2, SPOT))
        if t < 2.65: flash(im, 1 - (t - 2.55) / 0.1)
        word(im, t, 3.0, 'now you', (520, 360), 130); word(im, t, 3.3, "don't", (520, 560), 260, ACC)
    # 5.0-6.8 intermission: gone, and when
    elif t < 6.8:
        im = NIGHT.copy()
        word(im, t, 5.05, 'gone', (540, 820), 300, ACC)
        line(im, t, 5.6, '[at midnight Oct 31]', (540, 1060), 76)
    # 6.8-9.4 clip 3: the product back for one more look; only a few left
    elif t < 9.4:
        im = vid('again', t - 6.8)
        word(im, t, 6.95, 'only', (520, 380), 170)
        line(im, t, 7.3, '[20 left]', (520, 600), 120)
    # 9.4-12.5 CTA: Comment POOF
    else:
        im = vid('again', t - 6.8)
        word(im, t, 9.45, 'comment', (520, 420), 170)
        line(im, t, 9.9, '[POOF]', (520, 650), 160)
        word(im, t, 10.3, 'before it\'s gone', (520, 860), 100, ACC)
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
