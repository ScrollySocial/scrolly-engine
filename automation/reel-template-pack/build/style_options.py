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
    for p in OUT.glob('_*.png'):
        p.unlink()
    print('saved', OUT)

if __name__ == '__main__':
    main()
