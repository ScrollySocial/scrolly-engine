"""The play kit (2026-10-18, after the wireframe round failed): her 10 must-dos made into defaults, so a plain cut-out or
a theme-object Reel can't happen by accident (FRAMEWORK.md "READ FIRST").

- style_object(): every real object gets play ON it: her dots / stripes / checks clipped to the object's own shape,
  stars or a sticker stuck on it, a white die-cut edge. thing() is the only way templates load an object, and it
  always styles it (a style is required).
- balloon(): an object or a clip window floating on a string, bobbing (her "balloons of videos").
- butterfly(), crown(): a butterfly flutters in and lands on the head, then a crown of butterflies, each styled
  differently; flower_crown(); head_guide(): the dashed head-outline filming guide that ships on its own layer
  (buyers hide it before export).
Cut-outs come from the rembg model (build/cutout_hq.py; run it for any new object first).
"""
import math, random
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps
import collage as C
import storyboard_b2 as S
import lettering_b2 as LB
from motion_b2 import put, ease, seg, lerp, clamp, W, H, INK, WHITE, CREAM

HQ = Path(__file__).resolve().parent / '.cache' / 'hq'
ANTON = LB.FONT['anton']
PATTERNS = {'dots': 'Playful hand-painted black polka dots-12.png', 'stripes': 'Hand-drawn black stripe pattern-16.png',
            'checks': 'Wobbly hand-drawn black and white checkerboard-24.png', 'zigzag': 'Bold hand-drawn zigzag pattern-17.png',
            'cross': 'Bold hand-drawn cross pattern-19.png', 'smalldots': 'Hand-painted polka dots on black-15.png'}
_pat = {}

def _pattern_mask(kind, size, scale):
    """Where her pattern has ink (0 to 255), tiled to size."""
    k = (kind, scale)
    if k not in _pat:
        g = ImageOps.grayscale(S.raw('doodles', PATTERNS[kind])); g = g.resize((int(g.width * scale), int(g.height * scale)), Image.LANCZOS)
        if kind == 'smalldots': g = ImageOps.invert(g)            # white dots on black: the dots are the ink
        _pat[k] = ImageOps.invert(g)
    p = _pat[k]; out = Image.new('L', size, 0)
    for y in range(0, size[1], p.height):
        for x in range(0, size[0], p.width): out.paste(p, (x, y))
    return out

def die_cut(im, edge=10, shadow=True):
    pad = edge + 4; a = Image.new('L', (im.width + 2 * pad, im.height + 2 * pad), 0); a.paste(im.split()[3].point(lambda v: 255 if v > 90 else 0), (pad, pad))
    border = a.filter(ImageFilter.MaxFilter(2 * edge + 1)).filter(ImageFilter.GaussianBlur(1.2))
    out = Image.new('RGBA', a.size, (255, 255, 255, 0)); out.putalpha(border); out.alpha_composite(im, (pad, pad))
    return C.shadow(out, (8, 14), 14, 90) if shadow else out

def sticker(text, px=60, fill=(214, 52, 46), ink=WHITE, shape='round'):
    """A die-cut sticker with a word on it, to stick ON an object."""
    f = S.F(ANTON, px); l, t, r, b = f.getbbox(text); w, h = r - l + px, b - t + int(px * 0.7)
    if shape == 'circle': w = h = max(w, h)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if shape == 'circle': d.ellipse((0, 0, w - 1, h - 1), fill=fill + (255,))
    else: d.rounded_rectangle((0, 0, w - 1, h - 1), h // 3, fill=fill + (255,))
    d.text((w / 2, h / 2), text, font=f, fill=ink, anchor='mm'); return die_cut(im, 6, False)

def style_object(im, pattern, color, scale=0.6, strength=0.85, stars=0, label=None, label_at=(0.5, 0.55), seed=1, edge=10):
    """Play on a real object: her pattern in `color` clipped to the object's own shape (it still reads as the object),
    optional gold stars stuck on it, an optional label sticker, then a white die-cut edge and a soft shadow."""
    im = im.copy(); a = im.split()[3]
    if pattern:
        m = ImageChops.multiply(_pattern_mask(pattern, im.size, scale), a).point(lambda v: int(v * strength))
        lay = Image.new('RGBA', im.size, color + (0,)); lay.putalpha(m); im.alpha_composite(lay)
    r = random.Random(seed)
    if stars:
        st = Image.open(HQ / 'Gold foil star sticker-95.png').convert('RGBA'); bb = a.getbbox()
        for _ in range(stars):
            for _try in range(30):
                x, y = r.randint(bb[0], bb[2] - 1), r.randint(bb[1], bb[3] - 1)
                if a.getpixel((x, y)) > 200: break
            s = S.fitw(st, int(im.width * r.uniform(0.12, 0.2))).rotate(r.randint(-30, 30), expand=True)
            im.alpha_composite(s, (int(x - s.width / 2), int(y - s.height / 2)))
    if label is not None:
        im.alpha_composite(label, (int(im.width * label_at[0] - label.width / 2), int(im.height * label_at[1] - label.height / 2)))
    return die_cut(im, edge)

def raw_cut(name, w):
    return S.fitw(Image.open(HQ / (Path(name).stem + '.png')).convert('RGBA'), int(w))

def thing(name, w, pattern, color, **kw):
    """The only way a template loads a real object: always styled (must-do 3)."""
    return style_object(raw_cut(name, w), pattern, color, **kw)

# ---- balloons ------------------------------------------------------------------------------------------------------------
def balloon(img, item, t, c, anchor, phase=0.0, rise=None, string=(250, 250, 250)):
    """An object or clip window floating on a string, bobbing; `rise` = (t0, t1, from_y) floats it up into place."""
    x, y = c
    if rise: y = lerp(rise[2], c[1], ease(seg(t, rise[0], rise[1])))
    bx, by = x + 14 * math.sin(t * 1.6 + phase), y + 18 * math.sin(t * 2.1 + phase)
    bottom = (bx, by + item.height / 2 - 20); mid = ((bottom[0] + anchor[0]) / 2 + 30 * math.sin(t * 1.3 + phase), (bottom[1] + anchor[1]) / 2)
    pts = [(lerp(lerp(bottom[0], mid[0], u), lerp(mid[0], anchor[0], u), u), lerp(lerp(bottom[1], mid[1], u), lerp(mid[1], anchor[1], u), u)) for u in [i / 16 for i in range(17)]]
    ImageDraw.Draw(img).line(pts, fill=string + (255,), width=4)
    put(img, item, (bx, by), 1, 6 * math.sin(t * 1.4 + phase))

# ---- head interplay ------------------------------------------------------------------------------------------------------
HEAD = (600, 870, 270, 470)            # the filming guide's head: centre x, y and radii (the buyer lines their head up with it)

def head_guide(alpha=1.0):
    """The dashed head outline buyers film to (its own layer; they hide it before export)."""
    cx, cy, rx, ry = HEAD; lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for i in range(0, 360, 8):
        a0, a1 = math.radians(i), math.radians(i + 4)
        d.line((cx + rx * math.cos(a0), cy + ry * math.sin(a0), cx + rx * math.cos(a1), cy + ry * math.sin(a1)), fill=(255, 255, 255, int(230 * alpha)), width=7)
    d.text((cx, cy + ry + 40), 'YOUR HEAD HERE (hide this layer)', font=S.F(ANTON, 44), fill=(255, 255, 255, int(230 * alpha)), anchor='mm')
    return lay

BUTTERFLIES = ['Delicate Vintage Butterfly Cutout-2.png', 'Ivory butterfly with burnt-orange tips-1.png', 'Vintage newspaper butterfly silhouette-3.png']

def butterfly(img, item, t, c, rot=0, flap=1.0, phase=0.0):
    """A real butterfly with its wings flapping (the cut-out squashed sideways on the beat)."""
    k = 1 - 0.55 * flap * (0.5 + 0.5 * math.sin(t * 16 + phase))
    w = max(4, int(item.width * k)); f = item.resize((w, item.height), Image.BILINEAR); put(img, f, c, 1, rot)

def crown_points(n, spread=150):
    cx, cy, rx, ry = HEAD; top = cy - ry
    return [(cx + rx * 1.05 * math.cos(math.radians(a)), top - 70 + ry * 0.28 * (1 - math.sin(math.radians(-a)))) for a in
            [lerp(-90 - spread / 2, -90 + spread / 2, i / (n - 1)) for i in range(n)]]
