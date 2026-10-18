"""Motion test for f2 "The fall drop" (Fall pack), in the collage look (FRAMEWORK "The look: collage", her fall mood
boards, 2026-10-17): photo and pattern tiles butted edge to edge, the buyer's clips are tiles; a few real cut-outs cross
the seams; one paper piece with words per frame; rust, burgundy, cream, brown. The collage is alive: tiles slide in,
flip from photo to video, words land on the postcard and we zoom through it into the next clip, tiles swap and peel.
Business job: a product launch (the fall drop). Stand-in footage: her July clips.
Usage: python build/motion_f2.py [seconds...]  ->  fall/f2-fall-drop/preview/motion-test.mp4
"""
import math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps, ImageEnhance
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import storyboard_fall as B
from motion_f7 import marker_outline

W, H, FPS, DUR = 1080, 1920, 30, 12.0
OUT = E.PACK / 'fall' / 'f2-fall-drop' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
INK, WHITE, CREAM = B.INK, B.WHITE, (246, 236, 216)
RUST, BURGUNDY, BROWN = (176, 78, 40), (110, 30, 36), (92, 58, 36)
CLIPS = {'a': ('IMG_1439', 0.8), 'b': ('IMG_1422', 0.5), 'c': ('IMG_1391', 0.5), 'd': ('IMG_1418', 0.5)}

def extract(key, secs=7.0):
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
def back_out(x, s=1.7): x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s)
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)

# ---- tiles --------------------------------------------------------------------------------------------------------------
TEX = {'plaid': B.src('Rust-red and cream plaid blanket texture-7.png').convert('RGBA'),
       'knit': B.src('Cream cable-knit wool texture-47.png').convert('RGBA'),
       'wheat': B.src('Autumn Sky Over Golden Wheat-31.png').convert('RGBA'),
       'leaves': B.src('Autumn path blanketed in leaves-30.png').convert('RGBA'),
       'cord': B.src('Rust orange corduroy texture-26.png').convert('RGBA'),
       'gingham': B.two_tone('Wobbly hand-drawn black and white checkerboard-24.png', RUST, CREAM, (1254, 1254)),
       'stripes': B.two_tone('Hand-drawn black stripe pattern-16.png', BURGUNDY, CREAM, (1254, 1254)),
       'wool': B.src('Warm plaid wool blanket texture-8.png').convert('RGBA')}
_fit = {}
def content(src, t, w, h, drift=0.0):
    """A tile's picture: a texture (with a slow drift) or a clip (key 'a'..'d', playing from local time t)."""
    w, h = max(1, int(w)), max(1, int(h))
    if src in CLIPS: return ImageOps.fit(vid(src, t), (w, h))
    q = (src, w, h)
    if q not in _fit:
        im = TEX[src]; big = ImageOps.fit(im, (int(w * 1.12), int(h * 1.12))); _fit[q] = big
    big = _fit[q]; dx = int((big.width - w) * (0.5 + 0.5 * math.sin(drift))); return big.crop((dx, (big.height - h) // 2, dx + w, (big.height - h) // 2 + h))

def tile(img, src, t, box, k=1.0, frm=None, flip=None, src2=None):
    """Draw a tile in box. k<1 slides it in from `frm` ('l','r','t','b'); flip (0..1) turns it over to src2."""
    x0, y0, x1, y1 = box; w, h = x1 - x0, y1 - y0
    if k <= 0: return
    ox = oy = 0
    if frm == 'l': ox = -(1 - k) * (x1 + 40)
    if frm == 'r': ox = (1 - k) * (W - x0 + 40)
    if frm == 't': oy = -(1 - k) * (y1 + 40)
    if frm == 'b': oy = (1 - k) * (H - y0 + 40)
    s, scale = src, 1.0
    if flip is not None and flip > 0:
        scale = abs(math.cos(flip * math.pi)); s = src2 if flip > 0.5 else src
    im = content(s, t, w, h, t * 0.25 + x0 * 0.01)
    if scale < 0.999: im = im.resize((max(1, int(w * scale)), h)); ox += (w - im.width) / 2
    img.alpha_composite(B.shadowed(im, (0, 6), 10, 70), (int(x0 + ox) - 10, int(y0 + oy) - 10))

def cut(name, w, tol=26, ol=True, seed=1):
    k = ('cut', name, w, ol)
    if k not in _fit:
        im = B.shadowed(B.fit_w(B.cut(name, tol), w), (8, 14), 10, 100); _fit[k] = marker_outline(im, CREAM, 7, 12, seed) if ol else im
    return _fit[k]
def put(img, item, c, k=1.0, rot=0):
    if k <= 0.02: return
    it = item if abs(k - 1) < 0.01 else item.resize((max(1, int(item.width * k)), max(1, int(item.height * k))))
    if rot: it = it.rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))
def pop(t, t0, t1=None, d=0.3):
    k = back_out((t - t0) / d) if t >= t0 else 0
    if t1 is not None and t > t1: k *= 1 - ease((t - t1) / 0.18)
    return k

def paper(name, w, lines, rot=0, tol=8):
    """A real paper piece with words on it (built-in artwork words or buyer text, drawn on the paper)."""
    p = B.fit_w(B.cut(name, tol, 'tag' in name), w).copy(); d = ImageDraw.Draw(p); y = p.height / 2 - sum(px * 1.1 for _, _, px, _ in lines) / 2
    for text, font, px, col in lines:
        d.text((p.width / 2, y + px * 0.55), text, font=B.F(font, px), fill=col + (255,), anchor='mm'); y += px * 1.1
    return B.shadowed(p, (8, 14), 10, 90)

POSTCARD = paper('Blank vintage cream postcard-111.png', 760, [('THE FALL', B.ALFA, 128, BURGUNDY), ('DROP', B.ALFA, 190, RUST)])
POST2 = paper('Blank vintage cream postcard-111.png', 760, [('meet the', B.MONT, 60, BROWN), ('maple candle', B.MONT, 92, BURGUNDY)])
STRIP = paper('Torn White Paper on White Background.png', 900, [('3 scents  ·  small batch', B.MONT, 54, BROWN)], tol=6)
TAG = paper('Blank kraft gift tag with twine-34.png', 330, [('', B.MONT, 10, INK), ('', B.MONT, 10, INK), ('$28', B.ALFA, 92, BURGUNDY)])
CTA_TAG = paper('Blank kraft gift tag with twine-34.png', 460, [('', B.MONT, 30, INK), ('', B.MONT, 30, INK), ('COMMENT', B.ALFA, 58, BURGUNDY), ('DROP', B.MONT, 92, RUST)])
SEAL = None

def frame(t):
    im = Image.new('RGBA', (W, H), CREAM + (255,))
    # ---- collage A (0-3.4): tiles slide in one by one; clip a is a tile from frame 1; the knit tile flips to clip c
    if t < 3.4:
        tile(im, 'a', t, (0, 0, 640, 820), ease(t / 0.35), 'l')
        tile(im, 'plaid', t, (640, 0, 1080, 430), ease((t - 0.12) / 0.35), 'r')
        tile(im, 'knit', t, (640, 430, 1080, 820), ease((t - 0.24) / 0.35), 'r', flip=clamp((t - 1.3) / 0.5), src2='c')
        tile(im, 'wheat', t, (0, 820, 440, 1380), ease((t - 0.36) / 0.35), 'l')
        tile(im, 'b', t, (440, 820, 1080, 1380), ease((t - 0.48) / 0.35), 'b')
        tile(im, 'leaves', t, (0, 1380, 1080, 1920), ease((t - 0.6) / 0.35), 'b')
        put(im, cut('Large open pinecone on white-68.png', 230, seed=2), (640, 830), pop(t, 0.8), -12)
        put(im, cut('Plump Chestnut Acorn Study-66.png', 190, seed=3), (420, 1380), pop(t, 0.95), 18)
        put(im, cut('Red maple leaf on white-38.png', 220, seed=4), (1010, 440), pop(t, 1.1), 25)
        # the postcard lands across the seams with the hook words; at 2.2 s new words land on it
        if t < 2.5: put(im, POSTCARD, (420, 1180), pop(t, 0.15, 2.3, 0.35), -4)
        else:
            u = ease((t - 2.95) / 0.45)                # 2.95-3.4: we zoom into the postcard, now playing clip b
            # the postcard stays; its face turns into clip b, then we zoom into it until it fills the screen
            pc = POST2.copy()
            if t > 2.85:
                face = ImageOps.fit(vid('b', t), (pc.width - 60, pc.height - 60)); face.putalpha(int(255 * ease((t - 2.85) / 0.12)))
                pc.alpha_composite(face, (30, 30))
            put(im, pc, (420, 1180), pop(t, 2.45, None, 0.3), 0)
            if u > 0:
                z = 1 + u * 3.2; cx, cy = 420, 1180
                im = im.resize((int(W * z), int(H * z)), Image.BILINEAR).crop((int(cx * z - cx), int(cy * z - cy), int(cx * z - cx) + W, int(cy * z - cy) + H))
                if u > 0.75: im = Image.blend(im, vid('b', t), (u - 0.75) / 0.25)
        return im
    # ---- clip b full (3.4-5.4); the real price tag swings in with an acorn on it
    if t < 5.4:
        im = vid('b', t)
        put(im, TAG, (250, 1180), pop(t, 3.7, 5.2, 0.35), -8 + 3 * math.sin(t * 3))
        put(im, cut('Golden acorn on white-65.png', 150, seed=6), (370, 980), pop(t, 3.9, 5.2), 14)
        return im
    # ---- collage B (5.4-8.2): clip b shrinks into a tile, new tiles slide in; the gingham tile peels down to clip d
    if t < 8.2:
        k = ease((t - 5.4) / 0.5)
        tile(im, 'b', t, (0, 0, int(1080 - 540 * k), int(1920 - 820 * k)))
        tile(im, 'gingham', t, (540, 0, 1080, 520), ease((t - 5.6) / 0.35), 't')
        peel = ease((t - 7.0) / 0.6)
        tile(im, 'd', t - 7.0, (540, 520, 1080, 1100), ease((t - 5.75) / 0.35), 'r')
        if peel < 1: tile(im, 'cord', t, (540, int(520 + peel * 600), 1080, 1100), ease((t - 5.75) / 0.35), 'r')
        tile(im, 'wool', t, (0, 1100, 1080, 1920), ease((t - 5.9) / 0.35), 'b')
        put(im, cut('Twine-Tied Cinnamon Stick Bundle-55.png', 300, seed=7), (560, 1100), pop(t, 6.2), -20)
        put(im, cut('Single sunflower on white-79.png', 260, seed=8), (980, 980), pop(t, 6.4), 10)
        put(im, STRIP, (520, 1330), pop(t, 6.3, None, 0.35), 2)
        return im
    # ---- text only (8.2-9.4): a striped card fills the screen with big type
    if t < 9.4:
        tile(im, 'stripes', t, (0, 0, 1080, 1920), ease((t - 8.2) / 0.3), 'r')
        card = paper('Blank ivory note card-121.png', 900, [('SMALL', B.ALFA, 190, BURGUNDY), ('BATCH', B.ALFA, 210, RUST)], 0, 6)
        put(im, card, (540, 900), pop(t, 8.4, 9.2, 0.35), -3)
        return im
    # ---- the striped tile splits and slides apart to reveal clip d (9.4-10.2), then the CTA collage (10.2-12)
    if t < 10.2:
        im = vid('d', t - 7.0); u = ease((t - 9.4) / 0.6)
        tile(im, 'stripes', t, (0, int(-960 * u), 1080, int(960 - 960 * u)))
        tile(im, 'stripes', t, (0, int(960 + 960 * u), 1080, int(1920 + 960 * u)))
        return im
    k = ease((t - 10.2) / 0.5)
    tile(im, 'd', t - 7.0, (0, 0, 1080, int(1920 - 760 * k)))
    tile(im, 'plaid', t, (0, 1160, 540, 1920), ease((t - 10.4) / 0.35), 'l')
    tile(im, 'knit', t, (540, 1160, 1080, 1920), ease((t - 10.5) / 0.35), 'r')
    put(im, cut('Large open pinecone on white-68.png', 200, seed=9), (980, 1160), pop(t, 10.8), 20)
    put(im, CTA_TAG, (330, 1060), pop(t, 10.7, None, 0.35), -6)
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
