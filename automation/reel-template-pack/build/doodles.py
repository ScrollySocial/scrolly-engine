"""Mercedes's hand-drawn doodles (assets/props/source/doodles/), cut out of her asset sheets so templates can use them
one by one: arrows, bursts, bubbles, frames, underlines, icons (stars, hearts, crowns, sparkles), marker paths.
Each doodle is keyed by darkness (black marker on white), recoloured to a template's palette, and can draw itself on
(a wipe in the stroke's direction) so it looks hand-drawn as you watch. Pieces are cached in assets/props/doodles/.
Usage in a template:  import doodles as D;  arrow = D.get('arrows', 3, (206, 172, 214));  D.draw_on(img, arrow, c, t, t0)
"""
from pathlib import Path
from PIL import Image, ImageOps, ImageFilter, ImageDraw

PACK = Path(__file__).resolve().parent.parent
SRC = PACK / 'assets' / 'props' / 'source' / 'doodles'
CACHE = PACK / 'assets' / 'props' / 'doodles'
SHEETS = {'arrows': 'Hand-drawn arrow doodle sheet-1.png', 'bursts': 'Playful hand-drawn burst asset sheet-2.png',
          'bubbles': 'Eight playful speech and thought bubbles-3.png', 'frames': 'Ten hand-drawn doodle frames-4.png',
          'underlines': 'Hand-Drawn Underline Asset Sheet-5.png', 'icons': 'Playful black doodle icon sheet-6.png',
          'checks': 'Hand-drawn checks, Xs, and tick boxes-8.png', 'paths': 'Eight playful marker doodle paths-10.png'}

def _pieces(sheet, k=4, grow=7, min_px=90):
    """Split a sheet into its doodles: ink mask at 1/k scale, strokes grouped by dilation, one crop per group,
    ordered top to bottom, left to right."""
    g = ImageOps.grayscale(Image.open(SRC / SHEETS[sheet]).convert('RGB'))
    ink = g.point(lambda v: 255 if v < 140 else 0)
    small = ink.resize((g.width // k, g.height // k)).filter(ImageFilter.MaxFilter(grow))
    W, H = small.size; p = small.load(); seen = set(); boxes = []
    for y in range(H):
        for x in range(W):
            if p[x, y] and (x, y) not in seen:
                st = [(x, y)]; seen.add((x, y)); x0 = x1 = x; y0 = y1 = y; n = 0
                while st:
                    a, b = st.pop(); n += 1; x0, x1, y0, y1 = min(x0, a), max(x1, a), min(y0, b), max(y1, b)
                    for c, d in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                        if 0 <= c < W and 0 <= d < H and p[c, d] and (c, d) not in seen: seen.add((c, d)); st.append((c, d))
                if n * k * k > min_px * min_px / 4: boxes.append((x0 * k, y0 * k, (x1 + 1) * k, (y1 + 1) * k))
    boxes.sort(key=lambda b: (round(b[1] / (g.height / 6)), b[0]))
    out = []
    for b in boxes:
        a = g.crop(b).point(lambda v: max(0, min(255, (215 - v) * 2)))     # alpha from darkness, soft marker edge
        out.append(a)
    return out

def get(sheet, i, color=(24, 20, 28), width=None):
    """Doodle i of a sheet, recoloured; cached per sheet as PNG alpha masks."""
    d = CACHE / sheet
    if not d.exists() or not any(d.glob('*.png')):
        d.mkdir(parents=True, exist_ok=True)
        for n, a in enumerate(_pieces(sheet)): a.save(d / f'{n:02d}.png')
    files = sorted(d.glob('*.png')); a = Image.open(files[i % len(files)]).convert('L')
    if width: a = a.resize((int(width), int(a.height * width / a.width)), Image.LANCZOS)
    im = Image.new('RGBA', a.size, tuple(color) + (255,)); im.putalpha(a); return im

def count(sheet):
    get(sheet, 0); return len(list((CACHE / sheet).glob('*.png')))

def draw_on(img, doodle, c, t, t0, dur=0.35, rot=0, direction='lr', hold=None):
    """Draw a doodle as if by hand: it wipes on over dur seconds from t0 (left to right, or 'tb' top to bottom),
    then wiggles very slightly; with hold=(t1, fade) it fades out from t1."""
    if t < t0: return
    u = min(1.0, (t - t0) / dur); im = doodle
    if u < 1:
        m = Image.new('L', im.size, 0); dr = ImageDraw.Draw(m)
        if direction == 'tb': dr.rectangle((0, 0, im.width, int(im.height * u)), fill=255)
        else: dr.rectangle((0, 0, int(im.width * u), im.height), fill=255)
        im = im.copy(); im.putalpha(Image.composite(im.split()[3], Image.new('L', im.size, 0), m))
    a = 1.0
    if hold and t > hold[0]: a = max(0.0, 1 - (t - hold[0]) / hold[1])
    if a <= 0: return
    if a < 1: im = im.copy(); im.putalpha(im.split()[3].point(lambda v: int(v * a)))
    import math
    r = rot + (1.5 * math.sin(t * 9 + c[0]) if u >= 1 else 0)
    if r: im = im.rotate(r, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(im, (int(c[0] - im.width / 2), int(c[1] - im.height / 2)))
