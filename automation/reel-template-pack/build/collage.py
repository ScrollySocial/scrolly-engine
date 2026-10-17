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

# ---- batch 1 elements (2026-10-16) ------------------------------------------------------------------------------------
from PIL import ImageFont

def _f(px, bold=True):
    return ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf' if bold else 'C:/Windows/Fonts/segoeui.ttf', px)

def grid_paper(size, color=(250, 250, 246), line=(196, 214, 230), step=54, seed=71):
    p = paper(size, color, seed, grain=6); d = ImageDraw.Draw(p)
    for x in range(0, size[0], step): d.line((x, 0, x, size[1]), fill=line + (255,), width=2)
    for y in range(0, size[1], step): d.line((0, y, size[0], y), fill=line + (255,), width=2)
    return p

def shipping_label(size=(860, 560), seed=81):
    """A white shipping label: hairline box, a barcode, empty lines for the editable text to sit on."""
    w, h = size; r = rng(seed)
    lab = paper(size, (253, 252, 248), seed, grain=4); d = ImageDraw.Draw(lab)
    d.rectangle((14, 14, w - 15, h - 15), outline=(40, 38, 35, 255), width=4)
    d.text((40, 34), 'SHIP TO', font=_f(34), fill=(40, 38, 35))
    d.line((40, 90, w - 40, 90), fill=(40, 38, 35, 255), width=3)
    x = 40
    while x < w - 60:
        bw = r.choice([4, 4, 7, 10]); d.rectangle((x, h - 150, x + bw, h - 50), fill=(30, 28, 26, 255)); x += bw + r.choice([4, 6, 9])
    m = Image.new('L', size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=18, fill=255)
    lab.putalpha(m)
    return shadow(lab, offset=(6, 10), blur=12, alpha=70)

def stamp(text, size=(620, 220), color=(178, 62, 44), seed=82, round_=False):
    """A rubber stamp with a double border and worn ink."""
    w, h = size; r = rng(seed)
    im = Image.new('RGBA', size, (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if round_:
        d.ellipse((6, 6, w - 7, h - 7), outline=color + (255,), width=10); d.ellipse((26, 26, w - 27, h - 27), outline=color + (255,), width=4)
    else:
        d.rounded_rectangle((6, 6, w - 7, h - 7), radius=20, outline=color + (255,), width=10)
        d.rounded_rectangle((24, 24, w - 25, h - 25), radius=12, outline=color + (255,), width=4)
    f = _f(int(h * (0.24 if round_ else 0.34)))
    lines = text.split('\n'); lh = f.size * 1.05
    for i, ln in enumerate(lines):
        tw = d.textlength(ln, font=f)
        d.text(((w - tw) / 2, h / 2 - lh * len(lines) / 2 + i * lh - f.size * 0.12), ln, font=f, fill=color + (255,))
    wear = Image.effect_noise(size, 60).point(lambda v: 0 if v < 70 else 255)
    im.putalpha(ImageChops.multiply(im.split()[3], wear.filter(ImageFilter.GaussianBlur(0.6))))
    return im

def letter_sticker(letter, d=200, color=(246, 228, 160), ink=(24, 22, 20), seed=83):
    s = d + 24; im = Image.new('RGBA', (s, s), (0, 0, 0, 0)); dr = ImageDraw.Draw(im)
    dr.ellipse((0, 0, s - 1, s - 1), fill=(255, 255, 255, 255))
    face = paper((d, d), color, seed, grain=6); m = Image.new('L', (d, d), 0); ImageDraw.Draw(m).ellipse((0, 0, d - 1, d - 1), fill=255)
    face.putalpha(m); im.alpha_composite(face, (12, 12))
    f = _f(int(d * 0.6)); tw = dr.textlength(letter, font=f); bb = f.getbbox(letter)
    dr.text(((s - tw) / 2, (s - (bb[3] + bb[1])) / 2), letter, font=f, fill=ink)
    return shadow(im, offset=(5, 8), blur=8, alpha=70)

def magnifier_handle(length=330, width=70, color=(250, 244, 230)):
    im = Image.new('RGBA', (width + 20, length + 20), (0, 0, 0, 0))
    ImageDraw.Draw(im).rounded_rectangle((10, 10, width + 9, length + 9), radius=width // 2, fill=color + (255,))
    return im

def heart(size=110, color=(24, 22, 20), width=6, seed=84):
    r = rng(seed); c = size / 2; pts = []
    for i in range(61):
        t = i / 60 * 2 * math.pi
        x = 16 * math.sin(t) ** 3; y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        pts.append((c + x * size / 36, c + y * size / 36))
    im = Image.new('RGBA', (size + 10, size + 10), (0, 0, 0, 0))
    ImageDraw.Draw(im).line([(x + 5, y + 5) for x, y in _jit(r, pts, 1.2)], fill=color, width=width, joint='curve')
    return im

def check(size=120, color=(24, 22, 20), width=10):
    im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(im).line([(size * 0.12, size * 0.55), (size * 0.4, size * 0.82), (size * 0.9, size * 0.18)], fill=color, width=width, joint='curve')
    return im

def burst(size=220, color=(24, 22, 20), width=6, rays=8, seed=85):
    """Short strokes radiating out, like an 'it's done' pop. Leaves the middle empty for what it surrounds."""
    r = rng(seed); im = Image.new('RGBA', (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im); c = size / 2
    for i in range(rays):
        a = i / rays * 2 * math.pi + r.uniform(-0.1, 0.1)
        r0, r1 = size * 0.30, size * r.uniform(0.44, 0.49)
        d.line((c + r0 * math.cos(a), c + r0 * math.sin(a), c + r1 * math.cos(a), c + r1 * math.sin(a)), fill=color, width=width)
    return im

# ---- Fluent Emoji 3D stickers (Microsoft, MIT license: assets/fluent/LICENSE.txt) --------------------------------------
from pathlib import Path as _P
FLUENT = _P(__file__).resolve().parent.parent / 'assets' / 'fluent'

def sticker(name, size=300, border=10, shadow_alpha=60):
    """A Fluent 3D emoji as a die-cut sticker: white border, soft shadow."""
    im = Image.open(FLUENT / f'{name}_3d.png').convert('RGBA')
    im = im.resize((size, size), Image.LANCZOS)
    pad = border + 4
    canvas = Image.new('RGBA', (size + 2 * pad, size + 2 * pad), (0, 0, 0, 0))
    a = Image.new('L', canvas.size, 0); a.paste(im.split()[3], (pad, pad))
    edge = a.filter(ImageFilter.MaxFilter(border * 2 + 1)).filter(ImageFilter.GaussianBlur(1.2))
    white = Image.new('RGBA', canvas.size, (255, 255, 255, 255)); white.putalpha(edge)
    canvas.alpha_composite(white); canvas.alpha_composite(im, (pad, pad))
    return shadow(canvas, offset=(6, 9), blur=10, alpha=shadow_alpha)

def flood(names, size=(1200, 1000), count=9, sticker_px=330, seed=90):
    """A cluster of stickers for a screen-filling flood (several of these fly up together)."""
    r = rng(seed); im = Image.new('RGBA', size, (0, 0, 0, 0))
    for k in range(count):
        s = sticker(names[k % len(names)], sticker_px + r.randint(-40, 60))
        s = s.rotate(r.uniform(-30, 30), resample=Image.BICUBIC, expand=True)
        im.alpha_composite(s, (r.randint(-60, size[0] - s.width + 60) if size[0] > s.width else 0,
                               r.randint(-40, size[1] - s.height + 40) if size[1] > s.height else 0) if False else
                           (max(0, min(size[0] - s.width, r.randint(-60, size[0] - s.width + 60))),
                            max(0, min(size[1] - s.height, r.randint(-40, size[1] - s.height + 40)))))
    return im

def lined_paper(size, color=(252, 249, 241), line=(176, 202, 226), margin=(232, 150, 150), step=64, seed=92):
    p = paper(size, color, seed, grain=5); d = ImageDraw.Draw(p)
    for y in range(220, size[1], step): d.line((0, y, size[0], y), fill=line + (255,), width=2)
    d.line((120, 0, 120, size[1]), fill=margin + (255,), width=3)
    return p

def printer_slot(width=900, height=70):
    im = Image.new('RGBA', (width, height), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, width - 1, height - 1), radius=height // 2, fill=(38, 36, 34, 255))
    d.rounded_rectangle((40, height // 2 - 5, width - 41, height // 2 + 5), radius=5, fill=(10, 10, 10, 255))
    return shadow(im, offset=(0, 8), blur=10, alpha=80)

def pattern_word(text, font_path, px, pattern='dots', fg=(246, 228, 160), dot=(217, 74, 61), outline=(24, 22, 20),
                 stroke=10, seed=93):
    """Big lettering filled with a pattern (polka dots, stripes or checks), an ink outline and a sticker shadow."""
    f = ImageFont.truetype(font_path, px)
    l, t, r_, b = f.getbbox(text, anchor='la'); w, h = r_ - l + 4 * stroke, b - t + 4 * stroke
    mask = Image.new('L', (w, h), 0); ImageDraw.Draw(mask).text((2 * stroke - l, 2 * stroke - t), text, font=f, fill=255, anchor='la')
    fill = Image.new('RGBA', (w, h), fg + (255,)); d = ImageDraw.Draw(fill); step = max(24, px // 6)
    if pattern == 'dots':
        rad = step * 0.28
        for yy, y in enumerate(range(0, h + step, step)):
            for x in range(-step, w + step, step):
                cx = x + (step / 2 if yy % 2 else 0)
                d.ellipse((cx - rad, y - rad, cx + rad, y + rad), fill=dot + (255,))
    elif pattern == 'stripes':
        for x in range(-h, w + h, step):
            d.polygon([(x, 0), (x + step / 2, 0), (x + step / 2 + h, h), (x + h, h)], fill=dot + (255,))
    else:
        for yy, y in enumerate(range(0, h, step)):
            for xx, x in enumerate(range(0, w, step)):
                if (xx + yy) % 2: d.rectangle((x, y, x + step, y + step), fill=dot + (255,))
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ring = mask.filter(ImageFilter.MaxFilter(stroke * 2 + 1))
    ink = Image.new('RGBA', (w, h), outline + (255,)); ink.putalpha(ring); out.alpha_composite(ink)
    fill.putalpha(mask); out.alpha_composite(fill)
    return shadow(out, offset=(8, 12), blur=10, alpha=70)

def dots_layer(size=(1080, 1920), count=26, colors=((246, 228, 160), (217, 74, 61), (252, 249, 241)), rmin=110, rmax=230, seed=94):
    """Big polka dots scattered over a frame; several layers popping in cover the screen."""
    r = rng(seed); im = Image.new('RGBA', size, (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    cols, rows = 4, 7
    for i in range(rows):
        for j in range(cols):
            cx = (j + r.uniform(0.1, 0.9)) * size[0] / cols; cy = (i + r.uniform(0.1, 0.9)) * size[1] / rows
            rad = r.uniform(rmin, rmax); c = colors[(i * cols + j + seed) % len(colors)]
            d.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), fill=c + (255,))
    return im

def note_card(size=(420, 300), seed=95):
    c = paper(size, (253, 251, 245), seed, grain=4); d = ImageDraw.Draw(c)
    for y in range(90, size[1] - 20, 52): d.line((30, y, size[0] - 30, y), fill=(190, 205, 225, 255), width=2)
    return shadow(c, offset=(4, 8), blur=8, alpha=60)
