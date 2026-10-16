"""Render style options for the Reel Template Packs as stills (hook, list label, CTA) on test footage.

Every font is a CapCut library font (downloads by resource id on a buyer's computer), found in Mercedes's CapCut cache.
No Scrolly branding: these are the buyer's Reels.
Usage: python build/style_options.py   ->  01-one-product-three-ways/style-options/*.png
"""
import glob, os, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PACK = Path(__file__).resolve().parent.parent
OUT = PACK / '01-one-product-three-ways' / 'style-options'
FFMPEG = str(PACK.parent / 'hyperframes-test' / 'bin' / 'ffmpeg.exe')
CACHE = Path(os.environ['LOCALAPPDATA']) / 'CapCut' / 'User Data' / 'Cache' / 'effect'
FOOT = Path.home() / 'OneDrive' / 'Desktop' / 'July Videos'
W, H = 1080, 1920

FONTS = {  # name: CapCut resource id
    'satisfy': '7563929797689167105', 'bodoni': '7580184437816675601', 'imbue': '7533523619876523280',
    'montserrat': '7541303466296184080', 'inter': '7533517738157886721',
    'ellios': '7527221190125948161', 'truefate': '7525720839577144577',
    'hand': '7480848031034772791',  # JS Arirang PPURI, casual pen handwriting
}
BUTTER, INK, CREAM = (246, 228, 160), (24, 22, 20), (255, 250, 238)

def fpath(name):
    return next(p for p in glob.glob(str(CACHE / FONTS[name] / '*' / '*')) if p.lower().endswith(('.ttf', '.otf')))

def F(name, px):
    return ImageFont.truetype(fpath(name), px)

def frame(clip, t):
    out = OUT / f'_{clip}.png'
    if not out.exists():
        tone = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p'
        subprocess.run([FFMPEG, '-v', 'error', '-y', '-ss', str(t), '-i', str(FOOT / f'{clip}.MOV'), '-frames:v', '1',
                        '-vf', f'{tone},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}', str(out)], check=True)
    return Image.open(out).convert('RGBA')

def text_layer(draw_fn):
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0)); draw_fn(ImageDraw.Draw(layer)); return layer

def centered(d, y, text, font, fill, stroke=0, stroke_fill=None):
    w = d.textlength(text, font=font)
    d.text(((W - w) / 2, y), text, font=font, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill)
    return w

def pill(d, cx, cy, text, font, bg, fg, padx=34, pady=18, radius=22):
    w = d.textlength(text, font=font); b = font.getbbox(text); h = b[3] - b[1]
    box = (cx - w / 2 - padx, cy - h / 2 - pady, cx + w / 2 + padx, cy + h / 2 + pady)
    d.rounded_rectangle(box, radius=radius, fill=bg)
    d.text((cx - w / 2, cy - h / 2 - b[1]), text, font=font, fill=fg)

def glow(base, layer, color=(255, 255, 255), radius=14, strength=2):
    a = layer.split()[3].filter(ImageFilter.GaussianBlur(radius))
    g = Image.new('RGBA', (W, H), color + (0,)); g.putalpha(a.point(lambda v: min(255, v * strength)))
    return Image.alpha_composite(Image.alpha_composite(base, g), layer)

# ---- three directions -----------------------------------------------------------------------------------------
def butter(kind, img, words):
    """A. Butter: butter-yellow labels with ink text (Montserrat), one script word (Satisfy) in white."""
    if kind == 'hook':
        a, b = words
        def d(dr):
            pill(dr, W / 2, 470, a, F('montserrat', 74), BUTTER, INK)
        img = Image.alpha_composite(img, text_layer(d))
        s = text_layer(lambda dr: centered(dr, 545, b, F('satisfy', 150), 'white'))
        return glow(img, s, (0, 0, 0), 10, 1)
    if kind == 'label':
        return Image.alpha_composite(img, text_layer(lambda dr: pill(dr, W / 2, 1400, words[0], F('montserrat', 60), BUTTER, INK)))
    def d(dr):
        pill(dr, W / 2, 1330, words[0], F('montserrat', 64), BUTTER, INK)
        pill(dr, W / 2, 1450, words[1], F('montserrat', 44), CREAM, INK, padx=26, pady=14)
    return Image.alpha_composite(img, text_layer(d))

def editorial(kind, img, words):
    """B. Editorial: huge tall serif (Bodoni Moda) in white with a soft dark glow, small sans caption; butter accent line."""
    if kind == 'hook':
        a, b = words
        img = glow(img, text_layer(lambda dr: centered(dr, 380, a, F('bodoni', 120), 'white')), (0, 0, 0), 18, 2)
        img = glow(img, text_layer(lambda dr: centered(dr, 520, b, F('bodoni', 190), 'white')), (0, 0, 0), 20, 2)
        return img
    if kind == 'label':
        n, rest = words[0].split(' ', 1)
        img = glow(img, text_layer(lambda dr: centered(dr, 1180, n.rstrip('.'), F('bodoni', 260), 'white')), (0, 0, 0), 20, 2)
        return glow(img, text_layer(lambda dr: centered(dr, 1470, rest, F('inter', 54), BUTTER)), (0, 0, 0), 10, 2)
    img = glow(img, text_layer(lambda dr: centered(dr, 1250, words[0], F('bodoni', 110), 'white')), (0, 0, 0), 18, 2)
    return glow(img, text_layer(lambda dr: centered(dr, 1420, words[1], F('inter', 46), BUTTER)), (0, 0, 0), 10, 2)

def clean(kind, img, words):
    """C. Clean: Inter Black in white with a thin dark outline, no boxes; butter-yellow numbers and script sign-off."""
    if kind == 'hook':
        a, b = words
        def d(dr):
            centered(dr, 400, a, F('inter', 92), 'white', 5, INK)
            centered(dr, 520, b, F('inter', 140), BUTTER, 6, INK)
        return Image.alpha_composite(img, text_layer(d))
    if kind == 'label':
        n, rest = words[0].split(' ', 1)
        def d(dr):
            fn, fr = F('inter', 96), F('inter', 76)
            wn, wr = dr.textlength(n + ' ', font=fn), dr.textlength(rest, font=fr)
            x = (W - wn - wr) / 2
            dr.text((x, 1350), n, font=fn, fill=BUTTER, stroke_width=5, stroke_fill=INK)
            dr.text((x + wn, 1366), rest, font=fr, fill='white', stroke_width=5, stroke_fill=INK)
        return Image.alpha_composite(img, text_layer(d))
    def d(dr):
        centered(dr, 1270, words[0], F('inter', 88), 'white', 5, INK)
        centered(dr, 1390, words[1], F('satisfy', 92), BUTTER, 4, INK)
    return Image.alpha_composite(img, text_layer(d))

SHOTS = [  # kind, clip, second, words
    ('hook', 'IMG_1417', 0.6, ('One stick vacuum', '3 ways')),
    ('label', 'IMG_1405', 4.0, ('2. The couch',)),
    ('cta', 'IMG_1421', 19.0, ('Stick vacuum', 'Shop at the link in my bio')),
]

# ---- variations on B (Mercedes liked B most, 2026-10-16) ---------------------------------------------------------
def shadowed(img, draw_fn, radius=18, strength=2):
    return glow(img, text_layer(draw_fn), (0, 0, 0), radius, strength)

def b1_tall(kind, img, words):
    """B1. Tall: Imbue (tall condensed serif), white with a soft shadow, butter-yellow key word."""
    if kind == 'hook':
        img = shadowed(img, lambda d: centered(d, 330, words[0], F('imbue', 150), 'white'))
        return shadowed(img, lambda d: centered(d, 480, words[1], F('imbue', 260), BUTTER))
    if kind == 'label':
        n, rest = words[0].split(' ', 1)
        img = shadowed(img, lambda d: centered(d, 1080, n.rstrip('.'), F('imbue', 380), BUTTER))
        return shadowed(img, lambda d: centered(d, 1450, rest, F('imbue', 130), 'white'))
    img = shadowed(img, lambda d: centered(d, 1220, words[0], F('imbue', 170), 'white'))
    return shadowed(img, lambda d: centered(d, 1420, words[1], F('imbue', 84), BUTTER))

def highlight(d, cx, y, text, font, fg, bg, pad=22):
    w = d.textlength(text, font=font); b = font.getbbox(text)
    d.rectangle((cx - w / 2 - pad, y + b[1] - pad * 0.6, cx + w / 2 + pad, y + b[3] + pad * 0.6), fill=bg)
    d.text((cx - w / 2, y), text, font=font, fill=fg)

def b2_highlight(kind, img, words):
    """B2. Highlight: bold high-contrast serif (DV Ellios) in ink on butter-yellow highlight bars."""
    if kind == 'hook':
        def d(dr):
            highlight(dr, W / 2, 380, words[0], F('ellios', 96), INK, BUTTER)
            highlight(dr, W / 2, 520, words[1], F('ellios', 150), INK, BUTTER)
        return Image.alpha_composite(img, text_layer(d))
    if kind == 'label':
        return Image.alpha_composite(img, text_layer(lambda dr: highlight(dr, W / 2, 1360, words[0], F('ellios', 96), INK, BUTTER)))
    def d(dr):
        highlight(dr, W / 2, 1280, words[0], F('ellios', 100), INK, BUTTER)
        highlight(dr, W / 2, 1430, words[1], F('inter', 46), INK, CREAM, pad=16)
    return Image.alpha_composite(img, text_layer(d))

def b3_script(kind, img, words):
    """B3. Serif + script: Bodoni Moda in white, the key word in butter-yellow script (Satisfy)."""
    if kind == 'hook':
        img = shadowed(img, lambda d: centered(d, 360, words[0], F('bodoni', 116), 'white'))
        return shadowed(img, lambda d: centered(d, 470, words[1], F('satisfy', 220), BUTTER))
    if kind == 'label':
        n, rest = words[0].split(' ', 1)
        img = shadowed(img, lambda d: centered(d, 1140, n.rstrip('.'), F('bodoni', 300), 'white'))
        return shadowed(img, lambda d: centered(d, 1440, rest, F('satisfy', 130), BUTTER))
    img = shadowed(img, lambda d: centered(d, 1240, words[0], F('bodoni', 116), 'white'))
    return shadowed(img, lambda d: centered(d, 1390, words[1], F('satisfy', 80), BUTTER))

def frosted(img, box, tint=(255, 250, 238), alpha=150, radius=28):
    x0, y0, x1, y1 = map(int, box)
    region = img.crop((x0, y0, x1, y1)).filter(ImageFilter.GaussianBlur(radius))
    over = Image.new('RGBA', region.size, tint + (alpha,))
    img = img.copy(); img.paste(Image.alpha_composite(region, over), (x0, y0)); return img

def b4_frosted(kind, img, words):
    """B4. Frosted: serif (True Fate) in ink on a soft frosted cream band; readable on any footage."""
    if kind == 'hook':
        img = frosted(img, (0, 330, W, 700))
        def d(dr):
            centered(dr, 350, words[0], F('truefate', 110), INK)
            centered(dr, 480, words[1], F('truefate', 170), INK)
        return Image.alpha_composite(img, text_layer(d))
    if kind == 'label':
        img = frosted(img, (0, 1330, W, 1500))
        return Image.alpha_composite(img, text_layer(lambda dr: centered(dr, 1345, words[0], F('truefate', 110), INK)))
    img = frosted(img, (0, 1250, W, 1520))
    def d(dr):
        centered(dr, 1265, words[0], F('truefate', 120), INK)
        centered(dr, 1420, words[1], F('inter', 44), INK)
    return Image.alpha_composite(img, text_layer(d))

def make_sheet(options, path):
    rows = []
    for name, fn in options:
        rows.append((name, [fn(k, frame(c, t), w).convert('RGB') for k, c, t, w in SHOTS]))
    out = Image.new('RGB', (W * 3 + 40, (H + 120) * len(rows)), 'white'); d = ImageDraw.Draw(out)
    for i, (name, frames) in enumerate(rows):
        d.text((20, i * (H + 120) + 20), name, font=F('inter', 80), fill='black')
        for j, f in enumerate(frames):
            out.paste(f, (j * (W + 20), i * (H + 120) + 120))
    out.resize((out.width // 3, out.height // 3)).save(path, quality=88)

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rows = []
    for name, fn in (('A-butter', butter), ('B-editorial', editorial), ('C-clean', clean)):
        frames = [fn(k, frame(c, t), w).convert('RGB') for k, c, t, w in SHOTS]
        for (k, *_), f in zip(SHOTS, frames):
            pass  # full-size stills not kept (large); the sheet is enough to choose
        row = Image.new('RGB', (W * 3 + 40, H), 'white')
        for i, f in enumerate(frames):
            row.paste(f, (i * (W + 20), 0))
        rows.append((name, row))
    sheet = Image.new('RGB', (W * 3 + 40, (H + 120) * 3), 'white'); d = ImageDraw.Draw(sheet)
    for i, (name, row) in enumerate(rows):
        d.text((20, i * (H + 120) + 20), name, font=F('inter', 80), fill='black')
        sheet.paste(row, (0, i * (H + 120) + 120))
    sheet.resize((sheet.width // 3, sheet.height // 3)).save(OUT / 'all-options.jpg', quality=88)
    make_sheet([('B1 Tall', b1_tall), ('B2 Highlight', b2_highlight), ('B3 Serif + script', b3_script),
           ('B4 Frosted', b4_frosted)], OUT / 'b-variations.jpg')
    for p in OUT.glob('_*.png'):
        p.unlink()
    print('saved', OUT)

if __name__ == '__main__':
    main()
