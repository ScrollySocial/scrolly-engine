"""Collage elements for the Reel Template Packs, drawn in code so Scrolly owns them and can ship them in templates.

Paper textures, torn paper strips, tape, Polaroid frames, a hanging price tag, round photo badges with arched words,
and hand-drawn doodles (star, sparkle, arrow, circle). Everything returns RGBA PIL images.
Rule from Mercedes: doodles never touch or overlap each other or the text; a few, not many.
"""
import math, random
from PIL import Image, ImageDraw, ImageFilter, ImageChops

def rng(seed):
    return random.Random(seed)

def paper(size, color=(250, 244, 230), seed=1, grain=10):
    """Flat paper with fine grain and a few soft fibers."""
    w, h = size; r = rng(seed)
    base = Image.new('RGB', (w, h), color)
    noise = Image.effect_noise((w, h), grain * 0.35).convert('L')   # centred on 128
    base = ImageChops.add(base, Image.merge('RGB', [noise] * 3), scale=1.0, offset=-128)
    d = ImageDraw.Draw(base)
    for _ in range(max(6, w * h // 60000)):
        x, y = r.uniform(0, w), r.uniform(0, h); a = r.uniform(0, math.pi); l = r.uniform(10, 40)
        c = tuple(max(0, v - r.randint(8, 18)) for v in color)
        d.line((x, y, x + l * math.cos(a), y + l * math.sin(a)), fill=c, width=1)
    return base.convert('RGBA')

def torn_mask(size, seed=2, depth=10, edges='tb'):
    """Mask with ragged torn edges on the chosen sides (t, b, l, r)."""
    w, h = size; r = rng(seed)
    pts = []
    def jag(x0, y0, x1, y1, n):
        out = []
        for i in range(n + 1):
            t = i / n; x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t
            off = r.uniform(-depth, depth) * (1 if i % 2 else 0.5)
            if x0 == x1: x += off
            else: y += off
            out.append((x, y))
        return out
    pts += jag(0, depth, w, depth, w // 14) if 't' in edges else [(0, 0), (w, 0)]
    pts += jag(w - depth, 0, w - depth, h, h // 14)[1:-1] if 'r' in edges else []
    pts += jag(w, h - depth, 0, h - depth, w // 14) if 'b' in edges else [(w, h), (0, h)]
    pts += jag(depth, h, depth, 0, h // 14)[1:-1] if 'l' in edges else []
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).polygon(pts, fill=255)
    return m

def torn_strip(size, color, seed=3, edges='tb'):
    p = paper(size, color, seed)
    p.putalpha(torn_mask(size, seed, edges=edges))
    return p

def tape(length=220, width=64, seed=4, color=(255, 252, 240), alpha=170):
    """A strip of masking tape with zigzag ends."""
    r = rng(seed); t = Image.new('RGBA', (length, width), color + (alpha,))
    m = Image.new('L', (length, width), 255); d = ImageDraw.Draw(m)
    step = 8
    for y in range(0, width, step):
        d.polygon([(0, y), (r.uniform(4, 10), y + step / 2), (0, y + step)], fill=0)
        d.polygon([(length, y), (length - r.uniform(4, 10), y + step / 2), (length, y + step)], fill=0)
    t.putalpha(ImageChops.multiply(t.split()[3], m))
    stripes = ImageDraw.Draw(t)
    for x in range(0, length, 3):
        stripes.line((x, 0, x, width), fill=color + (alpha - r.randint(0, 25),))
    t.putalpha(ImageChops.multiply(t.split()[3], m))
    return t

def shadow(img, offset=(10, 14), blur=16, alpha=90):
    """img with a soft drop shadow underneath (returns a bigger canvas)."""
    pad = blur * 2 + max(map(abs, offset))
    out = Image.new('RGBA', (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    sh = Image.new('RGBA', img.size, (0, 0, 0, alpha)); sh.putalpha(ImageChops.multiply(img.split()[3], sh.split()[3]))
    out.paste(sh, (pad + offset[0], pad + offset[1]), sh)
    out = out.filter(ImageFilter.GaussianBlur(blur))
    out.alpha_composite(img, (pad, pad))
    return out

def place(canvas, item, center, angle=0):
    """Paste item rotated, centered at center."""
    it = item.rotate(angle, resample=Image.BICUBIC, expand=True)
    canvas.alpha_composite(it, (int(center[0] - it.width / 2), int(center[1] - it.height / 2)))
    return canvas

def polaroid(photo, size=(640, 760), border=34, bottom=150, seed=5):
    """A Polaroid frame with the photo cropped to fit."""
    w, h = size; pw, ph = w - border * 2, h - border - bottom
    ph_img = photo.copy()
    s = max(pw / ph_img.width, ph / ph_img.height)
    ph_img = ph_img.resize((int(ph_img.width * s) + 1, int(ph_img.height * s) + 1))
    x0, y0 = (ph_img.width - pw) // 2, (ph_img.height - ph) // 2
    ph_img = ph_img.crop((x0, y0, x0 + pw, y0 + ph))
    frame = paper(size, (252, 251, 247), seed, grain=6)
    frame.paste(ph_img.convert('RGBA'), (border, border))
    return frame

def price_tag(size=(520, 300), color=(246, 228, 160), seed=6):
    """A paper price tag pointing left, with a hole and a string."""
    w, h = size; n = h * 0.42
    m = Image.new('L', size, 0); d = ImageDraw.Draw(m)
    d.rounded_rectangle((n * 0.6, 0, w, h), radius=26, fill=255)
    d.polygon([(0, h / 2), (n, 0), (n, h)], fill=255)
    tag = paper(size, color, seed); tag.putalpha(m)
    d2 = ImageDraw.Draw(tag)
    d2.ellipse((n * 0.55 - 16, h / 2 - 16, n * 0.55 + 16, h / 2 + 16), fill=(0, 0, 0, 0), outline=(150, 135, 90, 255), width=3)
    return tag

def string(canvas, a, b, color=(60, 55, 50, 255), sag=60, width=4):
    d = ImageDraw.Draw(canvas)
    pts = [(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + sag * math.sin(math.pi * t)) for t in [i / 30 for i in range(31)]]
    d.line(pts, fill=color, width=width, joint='curve')

def round_photo(photo, d=300, ring=(255, 255, 255), ring_w=10):
    ph = photo.copy(); s = max(d / ph.width, d / ph.height)
    ph = ph.resize((int(ph.width * s) + 1, int(ph.height * s) + 1))
    x0, y0 = (ph.width - d) // 2, (ph.height - d) // 2; ph = ph.crop((x0, y0, x0 + d, y0 + d)).convert('RGBA')
    m = Image.new('L', (d, d), 0); ImageDraw.Draw(m).ellipse((0, 0, d - 1, d - 1), fill=255)
    ph.putalpha(m)
    out = Image.new('RGBA', (d + ring_w * 2, d + ring_w * 2), (0, 0, 0, 0))
    ImageDraw.Draw(out).ellipse((0, 0, d + ring_w * 2 - 1, d + ring_w * 2 - 1), fill=ring + (255,))
    out.alpha_composite(ph, (ring_w, ring_w))
    return out

def arched_text(canvas, center, radius, text, font, fill, start_deg=-150, spread=120, top=True):
    """Letters set on an arc above (top=True) a circle."""
    d = ImageDraw.Draw(canvas)
    widths = [d.textlength(c, font=font) for c in text]; total = sum(widths)
    ang = math.radians(start_deg + (spread - math.degrees(total / radius)) / 2)
    for c, cw in zip(text, widths):
        a = ang + (cw / 2) / radius
        x, y = center[0] + radius * math.cos(a), center[1] + radius * math.sin(a)
        g = Image.new('RGBA', (int(cw) + 20, font.size + 30), (0, 0, 0, 0))
        ImageDraw.Draw(g).text((10, 5), c, font=font, fill=fill)
        g = g.rotate(-math.degrees(a) - 90, resample=Image.BICUBIC, expand=True)
        canvas.alpha_composite(g, (int(x - g.width / 2), int(y - g.height / 2)))
        ang += cw / radius

# ---- doodles: hand-drawn feel from jittered strokes -----------------------------------------------------------------
def _jit(r, pts, j):
    return [(x + r.uniform(-j, j), y + r.uniform(-j, j)) for x, y in pts]

def star(size=90, color=(24, 22, 20), width=5, seed=7):
    r = rng(seed); c = size / 2; out = []
    for i in range(11):
        rad = c * (0.95 if i % 2 == 0 else 0.42); a = -math.pi / 2 + i * math.pi / 5
        out.append((c + rad * math.cos(a), c + rad * math.sin(a)))
    im = Image.new('RGBA', (size + 10, size + 10), (0, 0, 0, 0))
    ImageDraw.Draw(im).line([(x + 5, y + 5) for x, y in _jit(r, out, size * 0.03)], fill=color, width=width, joint='curve')
    return im

def sparkle(size=70, color=(24, 22, 20), width=5):
    c = size / 2; im = Image.new('RGBA', (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    pts = []
    for i in range(40):
        a = i / 40 * 2 * math.pi; k = abs(math.cos(2 * a)) ** 3
        rad = c * (0.18 + 0.78 * k); pts.append((c + rad * math.cos(a), c + rad * math.sin(a)))
    d.line(pts + [pts[0]], fill=color, width=width, joint='curve')
    return im

def arrow(length=200, color=(24, 22, 20), width=6, bend=50, seed=8):
    r = rng(seed); im = Image.new('RGBA', (length + 40, bend * 2 + 80), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    pts = [(20 + length * t, 40 + bend - bend * math.sin(math.pi * t)) for t in [i / 24 for i in range(25)]]
    d.line(_jit(r, pts, 1.5), fill=color, width=width, joint='curve')
    ex, ey = pts[-1]; px, py = pts[-3]; a = math.atan2(ey - py, ex - px)
    for s in (2.5, -2.5):
        d.line((ex, ey, ex - 28 * math.cos(a + s / 6), ey - 28 * math.sin(a + s / 6)), fill=color, width=width)
    return im

def hand_circle(size=(300, 140), color=(24, 22, 20), width=5, seed=9):
    r = rng(seed); w, h = size; im = Image.new('RGBA', (w + 20, h + 20), (0, 0, 0, 0))
    pts = [(10 + w / 2 + (w / 2) * math.cos(a) * r.uniform(.97, 1.03), 10 + h / 2 + (h / 2) * math.sin(a) * r.uniform(.95, 1.05))
           for a in [i / 40 * 2.15 * math.pi - 0.3 for i in range(41)]]
    ImageDraw.Draw(im).line(pts, fill=color, width=width, joint='curve')
    return im

def pen_loop(size=(760, 380), color=(24, 22, 20), width=9, turns=1.12, start_deg=200, seed=10, ss=3):
    """A smooth hand-drawn loop: one pen stroke going around once and a bit, ends crossing, tapered at both ends.
    Drawn 3x larger and scaled down so the edge is smooth."""
    r = rng(seed); w, h = size; W2, H2 = (w + 40) * ss, (h + 40) * ss
    im = Image.new('RGBA', (W2, H2), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    ph1, ph2 = r.uniform(0, 6.28), r.uniform(0, 6.28)
    n = 400; total = turns * 2 * math.pi; a0 = math.radians(start_deg)
    for i in range(n + 1):
        t = i / n; a = a0 + total * t
        wob = 1 + 0.035 * math.sin(2 * a + ph1) + 0.02 * math.sin(3 * a + ph2) + 0.05 * t  # drifts outward a little
        x = W2 / 2 + (w / 2) * ss * wob * math.cos(a)
        y = H2 / 2 + (h / 2) * ss * wob * math.sin(a) * (1 - 0.06 * math.cos(a))  # slightly egg-shaped
        taper = min(1, t / 0.08, (1 - t) / 0.12)
        rad = max(1, width * ss / 2 * (0.35 + 0.65 * taper))
        d.ellipse((x - rad, y - rad, x + rad, y + rad), fill=color + (255,) if len(color) == 3 else color)
    return im.resize((w + 40, h + 40), Image.LANCZOS)
