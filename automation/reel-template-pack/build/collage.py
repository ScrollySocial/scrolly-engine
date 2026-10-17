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
    if border > 0:
        edge = a.filter(ImageFilter.MaxFilter(border * 2 + 1)).filter(ImageFilter.GaussianBlur(1.2))
        white = Image.new('RGBA', canvas.size, (255, 255, 255, 255)); white.putalpha(edge)
        canvas.alpha_composite(white)
    canvas.alpha_composite(im, (pad, pad))
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

# ---- Lisa-language elements (2026-10-17): neutral paper, sticky notes, shape windows ------------------------------------
def dot_paper(size, color=(244, 241, 236), dot=(214, 208, 200), step=34, seed=101):
    p = paper(size, color, seed, grain=5); d = ImageDraw.Draw(p)
    for y in range(step // 2, size[1], step):
        for x in range(step // 2, size[0], step):
            d.ellipse((x - 1.6, y - 1.6, x + 1.6, y + 1.6), fill=dot + (255,))
    return p

STICKY = {'yellow': (250, 232, 120), 'pink': (246, 182, 205), 'blue': (166, 206, 242), 'green': (190, 226, 170)}

def sticky_note(size=420, color='yellow', seed=102, pin=True):
    """A square sticky note with a slight lift at the bottom corner, optionally pinned with a 3D push pin."""
    c = STICKY.get(color, color)
    n = paper((size, size), c, seed, grain=5)
    shade = Image.new('RGBA', (size, size), (0, 0, 0, 0)); sd = ImageDraw.Draw(shade)
    for i in range(40):   # faint darkening toward the lifted corner
        sd.line((size - i * 6, size, size, size - i * 6), fill=(0, 0, 0, max(0, 22 - i // 2)), width=6)
    n.alpha_composite(shade)
    out = shadow(n, offset=(10, 16), blur=14, alpha=70)
    if pin:
        p = sticker('pushpin', int(size * 0.22), border=0, shadow_alpha=50)
        out.alpha_composite(p, (out.width // 2 - p.width // 2 + 10, 0))
    return out

def star_points(c, r_out, r_in, n=5, rot=-90):
    pts = []
    for i in range(n * 2):
        r = r_out if i % 2 == 0 else r_in; a = math.radians(rot + i * 180 / n)
        pts.append((c[0] + r * math.cos(a), c[1] + r * math.sin(a)))
    return pts

def torn_points(box, seed=103, depth=18):
    r = rng(seed); x0, y0, x1, y1 = box; pts = []
    for side in range(4):
        steps = 26
        for i in range(steps):
            t = i / steps
            if side == 0: x, y = x0 + (x1 - x0) * t, y0
            elif side == 1: x, y = x1, y0 + (y1 - y0) * t
            elif side == 2: x, y = x1 - (x1 - x0) * t, y1
            else: x, y = x0, y1 - (y1 - y0) * t
            off = r.uniform(-depth, depth)
            pts.append((x + (off if side in (1, 3) else 0), y + (off if side in (0, 2) else 0)))
    return pts

def window_card(size, shape_pts, bg=None, seed=104, edge=(255, 255, 255), edge_w=0):
    """Paper with a see-through hole in the given shape (footage plays through it from the layer below)."""
    card = bg.copy() if bg is not None else dot_paper(size, seed=seed)
    hole = Image.new('L', size, 0); ImageDraw.Draw(hole).polygon(shape_pts, fill=255)
    if edge_w:
        ring = hole.filter(ImageFilter.MaxFilter(edge_w * 2 + 1))
        e = Image.new('RGBA', size, edge + (255,)); e.putalpha(ring); card.alpha_composite(e)
    sh = hole.filter(ImageFilter.GaussianBlur(12)).point(lambda v: int(v * 0.35))   # soft inner shadow under the paper edge
    s = Image.new('RGBA', size, (0, 0, 0, 0)); s.putalpha(ImageChops.subtract(sh, hole.filter(ImageFilter.MinFilter(9))))
    card.alpha_composite(s)
    card.putalpha(ImageChops.subtract(card.split()[3], hole))
    return card

def sparkle_fill(size=120, color=(255, 255, 255)):
    """A crisp four-point sparkle (filled, curved sides)."""
    c = size / 2; pts = []
    for i in range(80):
        a = i / 80 * 2 * math.pi; k = abs(math.cos(2 * a)) ** 4
        r = c * (0.12 + 0.88 * k); pts.append((c + r * math.cos(a), c + r * math.sin(a)))
    im = Image.new('RGBA', (size * 2, size * 2), (0, 0, 0, 0))
    ImageDraw.Draw(im).polygon([(x * 2, y * 2) for x, y in pts], fill=color + (255,))
    return im.resize((size, size), Image.LANCZOS)

def star_fill(size=160, color=(255, 255, 255), outline=None, ow=6):
    big = size * 2; im = Image.new('RGBA', (big, big), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    pts = star_points((big / 2, big / 2), big * 0.48, big * 0.21)
    d.polygon(pts, fill=color + (255,))
    if outline: d.line(pts + [pts[0]], fill=outline + (255,), width=ow * 2, joint='curve')
    return im.resize((size, size), Image.LANCZOS)

def blob_points(c, rx, ry, seed=105, n=14, wob=0.12):
    """A soft organic blob (like a die-cut sticker shape)."""
    r = rng(seed); ks = [1 + r.uniform(-wob, wob) for _ in range(n)]; pts = []
    for i in range(180):
        t = i / 180 * n; j = int(t) % n; f = t - int(t); k = ks[j] * (1 - f) + ks[(j + 1) % n] * f
        a = i / 180 * 2 * math.pi; pts.append((c[0] + rx * k * math.cos(a), c[1] + ry * k * math.sin(a)))
    return pts

def window_frame(size, shape_pts, border=26, ink=(22, 21, 20), ink_w=5):
    """Just the frame around a window (white border + wobbly ink outline), transparent elsewhere, to animate on its own."""
    hole = Image.new('L', size, 0); ImageDraw.Draw(hole).polygon(shape_pts, fill=255)
    white = hole.filter(ImageFilter.MaxFilter(border * 2 + 1))
    outer = white.filter(ImageFilter.MaxFilter(ink_w * 2 + 1))
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    i = Image.new('RGBA', size, ink + (255,)); i.putalpha(ImageChops.subtract(outer, white)); out.alpha_composite(i)
    w = Image.new('RGBA', size, (255, 255, 255, 255)); w.putalpha(ImageChops.subtract(white, hole)); out.alpha_composite(w)
    return out

# ---- packing-story elements (2026-10-17): cardboard box, folding flaps, packing tape, label, tracker -------------------
KRAFT_OUT = (196, 152, 104); KRAFT_IN = (214, 178, 132); KRAFT_RIM = (150, 110, 70)

def cardboard(size, color=KRAFT_OUT, seed=110):
    """Kraft cardboard: grain, faint corrugation lines, a few fibres."""
    p = paper(size, color, seed, grain=9); d = ImageDraw.Draw(p); r = rng(seed)
    for x in range(0, size[0], 9):
        d.line((x, 0, x, size[1]), fill=tuple(max(0, v - 6) for v in color) + (40,), width=1)
    for _ in range(size[0] * size[1] // 9000):
        x, y = r.uniform(0, size[0]), r.uniform(0, size[1])
        d.line((x, y, x + r.uniform(-14, 14), y + r.uniform(-14, 14)), fill=tuple(max(0, v - 30) for v in color) + (90,), width=1)
    return p

def _shade(img, k):
    """Darken (k < 1) or lighten (k > 1) an RGBA image, keeping alpha."""
    a = img.split()[3]; rgb = img.convert('RGB').point(lambda v: max(0, min(255, int(v * k))))
    out = rgb.convert('RGBA'); out.putalpha(a); return out

def _quad_fill(canvas, quad, tex, k=1.0, hinge=None, far=None):
    """Fill a quad with cardboard, shaded darker toward the far edge, with a crease line at the hinge."""
    m = Image.new('L', canvas.size, 0); ImageDraw.Draw(m).polygon(quad, fill=255)
    t = _shade(tex, k)
    if hinge and far:   # gradient from hinge (as is) to far edge (16% darker)
        g = Image.new('L', canvas.size, 0); gd = ImageDraw.Draw(g)
        (hx, hy), (fx, fy) = hinge, far; n = 24
        for i in range(n, 0, -1):
            f = i / n; cx_, cy_ = hx + (fx - hx) * f, hy + (fy - hy) * f
            rad = max(abs(fx - hx), abs(fy - hy)) * f + 400
            gd.ellipse((hx - rad, hy - rad, hx + rad, hy + rad), fill=int(40 * f))
        dark = Image.new('RGBA', canvas.size, (40, 25, 10, 0)); dark.putalpha(ImageChops.multiply(g, m))
        t = t.copy(); t.alpha_composite(dark)
    t.putalpha(m); canvas.alpha_composite(t)
    d = ImageDraw.Draw(canvas)
    d.line(quad + [quad[0]], fill=(120, 84, 50, 255), width=2)
    d.line([quad[0], quad[1]], fill=(110, 76, 44, 255), width=5)

class Box:
    """An open cardboard box seen from above, around a rectangular opening where the buyer's clip plays.
    Flaps are hinged on the four edges; fold(angles) draws them at any angle (15 = resting open, 180 = closed)."""
    def __init__(self, opening=(180, 640, 900, 1360), size=(1080, 1920), short=300, long_=372, rim=30, seed=111):
        self.o, self.size, self.short, self.long, self.rim = opening, size, short, long_, rim
        self.tex_out = cardboard(size, KRAFT_OUT, seed); self.tex_in = cardboard(size, KRAFT_IN, seed + 1)

    def frame(self):
        """The box rim around the opening (opening transparent), with a soft inner shadow on the clip's edges."""
        x0, y0, x1, y1 = self.o; r = self.rim
        im = Image.new('RGBA', self.size, (0, 0, 0, 0))
        m = Image.new('L', self.size, 0); ImageDraw.Draw(m).rectangle((x0 - r, y0 - r, x1 + r, y1 + r), fill=255)
        ImageDraw.Draw(m).rectangle((x0, y0, x1, y1), fill=0)
        t = _shade(self.tex_out, 0.8); t.putalpha(m); im.alpha_composite(t)
        ImageDraw.Draw(im).rectangle((x0 - r, y0 - r, x1 + r, y1 + r), outline=(110, 76, 44, 255), width=3)
        inner = Image.new('L', self.size, 0); ImageDraw.Draw(inner).rectangle((x0, y0, x1, y1), outline=255, width=22)
        sh = Image.new('RGBA', self.size, (30, 18, 8, 0)); sh.putalpha(inner.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.55)))
        im.alpha_composite(sh)
        return im

    def _quad(self, edge, length, theta):
        x0, y0, x1, y1 = self.o; r = self.rim
        th = math.radians(theta); c = math.cos(th); grow = 1 + 0.16 * math.sin(th)
        if edge == 'top':    a, b, n = (x0 - r, y0 - r), (x1 + r, y0 - r), (0, -1)
        if edge == 'bottom': a, b, n = (x0 - r, y1 + r), (x1 + r, y1 + r), (0, 1)
        if edge == 'left':   a, b, n = (x0 - r, y0 - r), (x0 - r, y1 + r), (-1, 0)
        if edge == 'right':  a, b, n = (x1 + r, y0 - r), (x1 + r, y1 + r), (1, 0)
        mid = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); half = ((b[0] - a[0]) / 2 * grow, (b[1] - a[1]) / 2 * grow)
        far = (mid[0] + n[0] * length * c, mid[1] + n[1] * length * c)
        return [a, b, (far[0] + half[0], far[1] + half[1]), (far[0] - half[0], far[1] - half[1])], mid, far, c

    def fold(self, short_deg, long_deg):
        """One frame: short flaps (top/bottom) at short_deg, long flaps (left/right) at long_deg."""
        im = Image.new('RGBA', self.size, (0, 0, 0, 0))
        order = [('top', self.short, short_deg), ('bottom', self.short, short_deg),
                 ('left', self.long, long_deg), ('right', self.long, long_deg)]
        if long_deg < 90 <= short_deg:
            order = order[2:] + order[:2]
        for e, L, d in order:
            quad, mid, far, c = self._quad(e, L, d)
            if d > 95:   # a flap over the opening casts a soft shadow onto what's inside
                sm = Image.new('L', self.size, 0); ImageDraw.Draw(sm).polygon([(x, y + 14) for x, y in quad], fill=int(120 * min(1, (d - 95) / 40)))
                sh = Image.new('RGBA', self.size, (20, 12, 5, 0)); sh.putalpha(sm.filter(ImageFilter.GaussianBlur(18))); im.alpha_composite(sh)
            _quad_fill(im, quad, self.tex_in if d > 90 else self.tex_out, 0.7 + 0.3 * abs(c), hinge=mid, far=far)
        if short_deg >= 179 and long_deg >= 179:   # closed: the seam where the long flaps meet
            x0, y0, x1, y1 = self.o; cx = (x0 + x1) / 2
            ImageDraw.Draw(im).line((cx, y0 - self.rim, cx, y1 + self.rim), fill=(96, 64, 36, 255), width=4)
        return im

def packing_tape(length=1000, width=150, seed=112):
    """Clear brown packing tape with a sheen and torn ends."""
    r = rng(seed); t = Image.new('RGBA', (width, length), (176, 128, 70, 150)); d = ImageDraw.Draw(t)
    for x in range(width):
        k = 0.5 + 0.5 * math.sin(x / width * math.pi)
        d.line((x, 0, x, length), fill=(214, 170, 110, int(110 + 70 * k)))
    d.rectangle((int(width * 0.18), 0, int(width * 0.26), length), fill=(255, 240, 210, 90))
    m = Image.new('L', (width, length), 255); md = ImageDraw.Draw(m)
    for y_end in (0, length):
        pts = [(0, y_end)] + [(x, y_end + (r.uniform(4, 14) if y_end == 0 else -r.uniform(4, 14))) for x in range(0, width + 1, 10)] + [(width, y_end)]
        md.polygon(pts, fill=0)
    t.putalpha(ImageChops.multiply(t.split()[3], m))
    return t

def tracker_card(size=(860, 420)):
    """A clean order-tracking card: three steps on a line (the words are separate text layers)."""
    w, h = size; c = Image.new('RGBA', size, (255, 255, 255, 255)); d = ImageDraw.Draw(c)
    y = int(h * 0.42)
    d.line((110, y, w - 110, y), fill=(220, 214, 206, 255), width=10)
    for i in range(3):
        x = 110 + i * (w - 220) / 2
        d.ellipse((x - 26, y - 26, x + 26, y + 26), fill=(255, 255, 255, 255), outline=(200, 194, 186, 255), width=6)
    m = Image.new('L', size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=36, fill=255); c.putalpha(m)
    return shadow(c, offset=(0, 12), blur=18, alpha=55)

def tracker_fill(size=(860, 420), step=1, color=(212, 98, 127)):
    """The filled part of the tracker up to a step (1 to 3), with check marks."""
    w, h = size; im = Image.new('RGBA', size, (0, 0, 0, 0)); d = ImageDraw.Draw(im); y = int(h * 0.42)
    xs = [110 + i * (w - 220) / 2 for i in range(3)]
    if step > 1: d.line((xs[0], y, xs[step - 1], y), fill=color + (255,), width=10)
    for i in range(step):
        x = xs[i]; d.ellipse((x - 26, y - 26, x + 26, y + 26), fill=color + (255,))
        d.line([(x - 11, y + 1), (x - 3, y + 9), (x + 12, y - 9)], fill=(255, 255, 255, 255), width=6, joint='curve')
    pad = 44
    out = Image.new('RGBA', (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0)); out.alpha_composite(im, (pad, pad))
    return out

# ---- washi tape and a real-looking shipping label (flat printed things, so code can make them convincingly) ------------
def washi(length=700, width=120, pattern='stripes', colors=((246, 182, 205), (255, 255, 255)), seed=120, alpha=228):
    """Japanese washi tape: a printed pattern on thin fibrous paper, a little see-through, zig-zag torn ends."""
    r = rng(seed); a, b = colors
    t = Image.new('RGBA', (length, width), a + (255,)); d = ImageDraw.Draw(t)
    if pattern == 'stripes':
        for x in range(-width, length + width, 44): d.polygon([(x, 0), (x + 18, 0), (x + 18 + width, width), (x + width, width)], fill=b + (255,))
    elif pattern == 'dots':
        for yy, y in enumerate(range(14, width, 34)):
            for x in range(14 + (17 if yy % 2 else 0), length, 34): d.ellipse((x - 7, y - 7, x + 7, y + 7), fill=b + (255,))
    elif pattern == 'gingham':
        lay = Image.new('RGBA', (length, width), (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
        for x in range(0, length, 40): ld.rectangle((x, 0, x + 19, width), fill=b + (120,))
        for y in range(0, width, 40): ld.rectangle((0, y, length, y + 19), fill=b + (120,))
        t.alpha_composite(lay)
    elif pattern == 'grid':
        for x in range(0, length, 26): d.line((x, 0, x, width), fill=b + (255,), width=3)
        for y in range(0, width, 26): d.line((0, y, length, y), fill=b + (255,), width=3)
    elif pattern == 'hearts':
        for yy, y in enumerate(range(26, width, 52)):
            for x in range(26 + (26 if yy % 2 else 0), length, 52):
                d.ellipse((x - 10, y - 9, x, y + 1), fill=b + (255,)); d.ellipse((x, y - 9, x + 10, y + 1), fill=b + (255,))
                d.polygon([(x - 10, y - 3), (x + 10, y - 3), (x, y + 10)], fill=b + (255,))
    fib = Image.effect_noise((length, width), 30).convert('L').point(lambda v: 255 - max(0, v - 150))   # paper fibres
    t.putalpha(ImageChops.multiply(Image.new('L', (length, width), alpha), fib))
    m = Image.new('L', (length, width), 255); md = ImageDraw.Draw(m)
    for x_end, sgn in ((0, 1), (length, -1)):   # zig-zag torn ends
        pts = [(x_end, 0)] + [(x_end + sgn * r.uniform(6, 14) * (i % 2), y) for i, y in enumerate(range(0, width + 1, 8))] + [(x_end, width)]
        md.polygon(pts, fill=0)
    t.putalpha(ImageChops.multiply(t.split()[3], m))
    return shadow(t, offset=(3, 5), blur=5, alpha=45)

def ship_label(size=(800, 1200), seed=121):
    """A 4x6 thermal shipping label: ruled sections, empty fields for typed text, a barcode, a slight curl."""
    w, h = size; r = rng(seed)
    lab = paper(size, (252, 251, 247), seed, grain=3); d = ImageDraw.Draw(lab); ink = (28, 27, 26, 255)
    f = lambda px, b=True: ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf' if b else 'C:/Windows/Fonts/arial.ttf', px)
    d.rectangle((20, 20, w - 21, h - 21), outline=ink, width=5)
    d.rectangle((20, 20, 220, 220), fill=ink); d.text((120, 120), 'P', font=f(150), fill=(252, 251, 247), anchor='mm')
    d.text((250, 60), 'STANDARD', font=f(56), fill=ink); d.text((250, 135), 'SHIPPING', font=f(40, False), fill=ink)
    d.line((20, 240, w - 21, 240), fill=ink, width=5)
    d.text((48, 262), 'FROM:', font=f(30), fill=ink)
    d.line((20, 400, w - 21, 400), fill=ink, width=3)
    d.text((48, 425), 'SHIP TO:', font=f(34), fill=ink)
    d.line((20, 700, w - 21, 700), fill=ink, width=5)
    d.text((48, 722), 'ITEMS:', font=f(30), fill=ink)
    d.line((20, 820, w - 21, 820), fill=ink, width=5)
    x = 70
    while x < w - 90:
        bw = r.choice([4, 4, 6, 9, 12]); d.rectangle((x, 860, x + bw, 1060), fill=ink); x += bw + r.choice([4, 6, 8])
    d.text((w / 2, 1110), ' '.join(''.join(str(r.randint(0, 9)) for _ in range(4)) for _ in range(5)), font=f(30, False), fill=ink, anchor='mm')
    curl = Image.new('RGBA', size, (0, 0, 0, 0)); cd = ImageDraw.Draw(curl)   # a faint lift on one corner
    for i in range(60): cd.line((w - 140 + i * 2, h, w, h - 140 + i * 2), fill=(0, 0, 0, max(0, 18 - i // 4)), width=3)
    lab.alpha_composite(curl)
    return shadow(lab, offset=(8, 14), blur=14, alpha=70)
