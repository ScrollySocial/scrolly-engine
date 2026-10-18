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

R_FONTS = E.LOCAL / 'CapCut' / 'User Data' / 'Cache' / 'AITextTemplate' / 'Resource'
SERIF = E.font_file('7580184437816675601')                       # the tall serif (CapCut library: buyers have it)
ANTON = str(next(R_FONTS.glob('*/Anton-Regular.ttf')))
from PIL import ImageFilter, ImageFont

def text_img(lines, pad=30):
    """lines = [(text, font, px, fill, stroke, stroke_fill)] stacked and centred, with room for the strokes."""
    fs = [(t, ImageFont.truetype(f, px), fill, sw, sf) for t, f, px, fill, sw, sf in lines]
    ws = [f.getbbox(t, stroke_width=sw) for t, f, _, sw, _ in fs]
    w = max(b[2] - b[0] for b in ws) + 2 * pad; h = sum(b[3] - b[1] for b in ws) + pad * (len(fs) + 1)
    im = Image.new('RGBA', (int(w), int(h)), (0, 0, 0, 0)); d = ImageDraw.Draw(im); y = pad
    for (t, f, fill, sw, sf), b in zip(fs, ws):
        d.text((w / 2, y - b[1]), t, font=f, fill=fill + (255,), anchor='ma', stroke_width=sw, stroke_fill=(sf or fill) + (255,)); y += b[3] - b[1] + pad
    return im

def collage_word(small, big, tex='plaid', px=400, spx=150):
    """Her pick (f2, 2026-10-17): a small line in the tall serif (burgundy, cream edge) over a big Anton word filled with
    a real textile photo, with a thick cream edge. Padded so the edge is never cut off."""
    sm = text_img([(small, SERIF, spx, BURGUNDY, 9, CREAM)], 20)
    bg = text_img([(big, ANTON, px, (255, 255, 255), 0, None)], 24); a = bg.split()[3]
    fill = Image.new('RGBA', bg.size, (0, 0, 0, 0)); fill.paste(ImageOps.fit(TEX[tex], bg.size), (0, 0), a)
    edge = Image.new('RGBA', bg.size, CREAM + (255,)); edge.putalpha(a.filter(ImageFilter.MaxFilter(17))); edge.alpha_composite(fill)
    edge = B.shadowed(edge, (6, 10), 10, 120)
    out = Image.new('RGBA', (max(sm.width, edge.width), sm.height + edge.height - 70), (0, 0, 0, 0))
    out.alpha_composite(edge, ((out.width - edge.width) // 2, sm.height - 70)); out.alpha_composite(sm, ((out.width - sm.width) // 2, 0))
    return out

def serif_words(lines):
    """Words the buyer edits, in the tall serif (burgundy, cream edge), so they match the hero lettering."""
    return B.shadowed(text_img([(t, SERIF, px, col, max(6, px // 14), CREAM) for t, px, col in lines], 8), (4, 8), 8, 90)

HERO = collage_word('the fall', 'DROP')
MEET = serif_words([('meet the', 90, BROWN), ('maple candle', 150, BURGUNDY)])
BATCH = B.shadowed(text_img([('SMALL', ANTON, 220, CREAM, 10, BURGUNDY), ('BATCH', ANTON, 360, CREAM, 12, BURGUNDY)], 20), (6, 10), 10, 120)   # editable in CapCut
NOTE = paper('Blank ivory note card-121.png', 860, [('3 SCENTS', ANTON, 180, BURGUNDY), ('MAPLE · CIDER · PINE', ANTON, 92, RUST)], tol=6)
TAG = paper('Blank kraft gift tag with twine-34.png', 520, [('', B.MONT, 50, INK), ('', B.MONT, 50, INK), ('', B.MONT, 50, INK), ('', B.MONT, 50, INK), ('', B.MONT, 50, INK), ('HAND-POURED', ANTON, 64, BURGUNDY), ('SOY WAX', ANTON, 104, BURGUNDY)])
CTA_S = serif_words([('comment', 110, BURGUNDY)])
CTA_B = B.shadowed(text_img([('DROP', ANTON, 230, CREAM, 10, BURGUNDY)], 16), (6, 10), 10, 120)
D = 'assets'
ARROW = B.fit_w(B.ink_piece('Hand-drawn arrow doodle sheet-1.png', 2, 6, 2, CREAM, inset=0.08), 400)        # points at the product tile
RAYS = B.fit_w(B.ink_piece('Playful hand-drawn burst asset sheet-2.png', 2, 3, 2, RUST, inset=0.06), 1000)  # emphasis behind the tag
WAVY = B.fit_w(B.ink_piece('Hand-Drawn Underline Asset Sheet-5.png', 2, 5, 2, RUST, inset=0.06), 460)     # underlines the card
SPARKS = [B.fit_w(B.ink_piece('Playful black doodle icon sheet-6.png', 4, 3, i, CREAM, inset=0.1), w) for i, w in ((8, 150), (9, 120))]  # around the keyword
ACORNS = (('Plump Chestnut Acorn Study-66.png', (720, 1650), 18), ('Golden acorn on white-65.png', (880, 1780), -10), ('Elongated dark brown acorn-69.png', (1000, 1610), 30))

def stripes_reveal(t, under, t0):
    """The striped tile: its cream stripes open first as windows onto the clip, then the red stripes slide apart off
    screen, alternate bands left and right."""
    st = content('stripes', t, W, H); g = ImageOps.grayscale(st.convert('RGB'))
    red = st.copy(); red.putalpha(g.point(lambda v: 255 if v < 150 else 0))
    u1 = ease((t - t0) / 0.35); u2 = ease((t - t0 - 0.45) / 0.6)
    out = under.copy()
    if u1 < 1:
        cream = st.copy(); cream.putalpha(g.point(lambda v, u1=u1: int(255 * (1 - u1)) if v >= 150 else 0)); out.alpha_composite(cream)
    for i, (y0, y1) in enumerate(STRIPE_ROWS):                # each red stripe slides off whole, alternate sides
        band = red.crop((0, y0, W, y1)); dx = int((1 if i % 2 else -1) * u2 * (W + 60)); out.alpha_composite(band, (dx, y0))
    return out

def _stripe_rows():
    """The y ranges of the red stripes on the striped tile (cut between stripes, not through them)."""
    g = ImageOps.grayscale(content('stripes', 0, W, H).convert('RGB')).resize((60, H))
    dark = [sum(1 for x in range(60) if g.getpixel((x, y)) < 150) > 6 for y in range(H)]
    rows, y = [], 0
    while y < H:
        if dark[y]:
            y0 = y
            while y < H and dark[y]: y += 1
            rows.append((max(0, y0 - 6), min(H, y + 6)))
        y += 1
    return rows
STRIPE_ROWS = _stripe_rows()

def frame(t):
    im = Image.new('RGBA', (W, H), CREAM + (255,))
    # ---- collage A (0-3.4): tiles slide in; clip a is a tile from frame 1; the knit tile flips to clip c;
    # THE FALL DROP on the wheat tile; then new words land on the wheat tile, it turns into clip b and we zoom into it
    if t < 3.4:
        tile(im, 'a', t, (0, 0, 640, 820), ease(t / 0.35), 'l')
        tile(im, 'plaid', t, (640, 0, 1080, 430), ease((t - 0.1) / 0.35), 'r')
        tile(im, 'knit', t, (640, 430, 1080, 820), ease((t - 0.2) / 0.35), 'r', flip=clamp((t - 1.3) / 0.5), src2='c')
        tile(im, 'b' if t > 2.9 else 'wheat', t, (0, 820, 1080, 1400), ease((t - 0.3) / 0.35), 'l')
        if 2.75 < t <= 2.9:
            v = content('b', t, 1080, 580); v.putalpha(int(255 * ease((t - 2.75) / 0.15))); im.alpha_composite(v, (0, 820))
        tile(im, 'b', t, (0, 1400, 600, 1920), ease((t - 0.4) / 0.35), 'b')
        tile(im, 'knit', t, (600, 1400, 1080, 1920), ease((t - 0.5) / 0.35), 'b')
        put(im, cut('Large open pinecone on white-68.png', 210, seed=2), (1000, 440), pop(t, 0.8), -12)
        put(im, cut('Red maple leaf on white-38.png', 200, seed=4), (930, 800), pop(t, 0.95), 25)
        for i, (n, c, r) in enumerate(ACORNS): put(im, cut(n, 170, seed=10 + i), c, pop(t, 1.0 + 0.12 * i), r)
        put(im, ARROW, (560, 690), pop(t, 0.7, 2.3, 0.3), 95)
        put(im, HERO, (540, 1110), pop(t, 0.15, 2.3, 0.35), -2)
        put(im, MEET, (540, 1110), pop(t, 2.4, 2.8, 0.3), 2)
        u = ease((t - 2.95) / 0.45)
        if u > 0:
            z = 1 + u * 2.4; cx, cy = 540, 1110
            im = im.resize((int(W * z), int(H * z)), Image.BILINEAR).crop((int(cx * z - cx), int(cy * z - cy), int(cx * z - cx) + W, int(cy * z - cy) + H))
            if u > 0.7: im = Image.blend(im, vid('b', t), (u - 0.7) / 0.3)
        return im
    # ---- clip b full (3.4-5.4); the real kraft tag swings in once, big, with a feature
    if t < 5.4:
        im = vid('b', t)
        put(im, RAYS, (300, 1260), pop(t, 3.85, 5.2, 0.35), 8 * math.sin(t * 2))
        put(im, TAG, (300, 1100), pop(t, 3.7, 5.2, 0.35), -8 + 3 * math.sin(t * 3))
        return im
    # ---- collage B (5.4-8.2): clip b shrinks into a tile, new tiles slide in; the cord tile peels down to clip d
    if t < 8.2:
        k = ease((t - 5.4) / 0.45)
        tile(im, 'b', t, (0, 0, int(1080 - 540 * k), int(1920 - 820 * k)))
        tile(im, 'gingham', t, (540, 0, 1080, 520), ease((t - 5.5) / 0.3), 't')
        peel = ease((t - 7.0) / 0.6)
        tile(im, 'd', t - 7.0, (540, 520, 1080, 1100), ease((t - 5.6) / 0.3), 'r')
        if peel < 1: tile(im, 'cord', t, (540, int(520 + peel * 600), 1080, 1100), ease((t - 5.6) / 0.3), 'r')
        tile(im, 'wool', t, (0, 1100, 1080, 1920), ease((t - 5.7) / 0.3), 'b')
        put(im, cut('Single sunflower on white-79.png', 240, seed=8), (900, 900), pop(t, 6.3), 8)
        put(im, NOTE, (500, 1360), pop(t, 6.2, None, 0.35), -3)
        put(im, WAVY, (500, 1540), pop(t, 6.6, None, 0.3), -3)
        put(im, cut('Twine-Tied Cinnamon Stick Bundle-55.png', 300, seed=7), (210, 1110), pop(t, 6.4), -20)
        return im
    # ---- text only (8.2-9.4): the cream knit fills the screen, big lettering
    if t < 9.4:
        tile(im, 'knit', t, (0, 0, 1080, 1920), ease((t - 8.2) / 0.3), 'r')
        put(im, BATCH, (540, 900), pop(t, 8.4, None, 0.35), -2)
        return im
    # ---- (9.4-10.6) the striped tile sweeps in over the words, its cream stripes open onto clip d, then the red
    # stripes slide apart off screen
    if t < 10.6:
        if t < 9.65:
            tile(im, 'knit', t, (0, 0, 1080, 1920)); put(im, BATCH, (540, 900), 1, -2)
            tile(im, 'stripes', t, (0, 0, 1080, 1920), ease((t - 9.4) / 0.25), 'r'); return im
        return stripes_reveal(t, vid('d', t - 7.0), 9.65)
    # ---- CTA collage (10.6-12): clip d on top, plaid and wheat below; comment DROP across the seam
    k = ease((t - 10.6) / 0.45)
    tile(im, 'd', t - 7.0, (0, 0, 1080, int(1920 - 760 * k)))
    tile(im, 'plaid', t, (0, 1160, 540, 1920), ease((t - 10.75) / 0.3), 'l')
    tile(im, 'wheat', t, (540, 1160, 1080, 1920), ease((t - 10.85) / 0.3), 'r')
    put(im, cut('Large open pinecone on white-68.png', 200, seed=9), (990, 1170), pop(t, 11.1), 20)
    put(im, CTA_S, (540, 1150), pop(t, 11.0, None, 0.3), -2); put(im, CTA_B, (540, 1330), pop(t, 11.15, None, 0.35), 0)
    put(im, SPARKS[0], (240, 1290), pop(t, 11.35, None, 0.3), 10 * math.sin(t * 5)); put(im, SPARKS[1], (840, 1400), pop(t, 11.45, None, 0.3), -10 * math.sin(t * 5))
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
