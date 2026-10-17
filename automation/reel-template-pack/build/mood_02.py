"""Still mood frames for #2 in Lisa's language (2026-10-17): neutral dotted paper, one accent colour on key words,
words scattered around the subject, real objects with hand-drawn outlines and stickers, footage through shape
windows, a pinned sticky note with a counter, a clock, a diagonal split. Stand-in footage: Mercedes's July clips.
Usage: python build/mood_02.py  ->  02-pack-an-order/mood/mood-02.jpg
"""
import math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageFont
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import engine as E

OUT = E.PACK / '02-pack-an-order' / 'mood'; OUT.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1920
ACCENT = (212, 98, 127)        # the one brand colour (editable text colour in CapCut)
INK = (22, 21, 20)
SANS = 'C:/Windows/Fonts/arial.ttf'
SERIF = E.font_file('7580184437816675601')     # Bodoni Moda, CapCut library
HAND = E.INKFREE
TONE = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p'
SCRATCH = OUT / '_frames'; SCRATCH.mkdir(exist_ok=True)

def frame(clip, t):
    p = SCRATCH / f'{clip}-{t}.png'
    if not p.exists():
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t), '-i', str(E.FOOTAGE / f'{clip}.MOV'), '-frames:v', '1',
                        '-vf', f'{TONE},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}', str(p)], check=True)
    return Image.open(p).convert('RGBA')

def F(path, px): return ImageFont.truetype(path, px)

def word(img, xy, text, font, fill, shadow=True, anchor='la'):
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    d.text(xy, text, font=font, fill=fill, anchor=anchor)
    if shadow:
        sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); sh.putalpha(layer.split()[3].filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.45)))
        img.alpha_composite(sh)
    img.alpha_composite(layer)

def outline(cut, color=(255, 255, 255), w=16, ink=INK, ink_w=4, seed=1):
    """A hand-drawn-looking outline around a cut-out: a white border and a wobbly ink line just outside it."""
    pad = w + ink_w + 20
    a = Image.new('L', (cut.width + 2 * pad, cut.height + 2 * pad), 0); a.paste(cut.split()[3], (pad, pad))
    a = a.point(lambda v: 255 if v > 100 else 0)
    white = a.filter(ImageFilter.MaxFilter(w * 2 + 1)).filter(ImageFilter.GaussianBlur(1.5))
    outer = white.filter(ImageFilter.MaxFilter(ink_w * 2 + 1)).filter(ImageFilter.GaussianBlur(1))
    out = Image.new('RGBA', a.size, (0, 0, 0, 0))
    i = Image.new('RGBA', a.size, ink + (255,)); i.putalpha(ImageChops.subtract(outer, white.point(lambda v: 255 if v > 128 else 0)))
    out.alpha_composite(i)
    wl = Image.new('RGBA', a.size, color + (255,)); wl.putalpha(white); out.alpha_composite(wl)
    out.alpha_composite(cut, (pad, pad))
    return C.shadow(out, offset=(10, 16), blur=16, alpha=70)

def hand_dots(img, pts, color=ACCENT, r=14):
    d = ImageDraw.Draw(img)
    for x, y in pts: d.ellipse((x - r, y - r, x + r, y + r), fill=color + (255,))

# ---- 1 hook: words scattered around the subject -------------------------------------------------------------------
def f1():
    im = frame('IMG_1439', 1.0)
    word(im, (90, 230), 'packing', F(SANS, 78), (255, 255, 255))
    word(im, (430, 330), 'an order', F(SERIF, 150), ACCENT)
    word(im, (700, 520), 'with me', F(SANS, 78), (255, 255, 255))
    return im

# ---- 2 a real object, played with ---------------------------------------------------------------------------------
def f2():
    im = C.dot_paper((W, H))
    cut = Image.open(E.PACK.parent / '..' / 'AppData' if False else Path(r'C:\Users\merce\AppData\Local\Temp\claude\C--Users-merce-Scrolly-Organic-Engine\1afa2eb3-be77-4e52-a35f-77f4f2d91204\scratchpad\spray-cut.png')).convert('RGBA')
    cut = cut.resize((int(cut.width * 0.62), int(cut.height * 0.62)))
    o = outline(cut).rotate(-6, expand=True, resample=Image.BICUBIC)
    im.alpha_composite(o, (40, 640))
    word(im, (120, 300), 'the goods', F(SANS, 84), INK, shadow=False)
    word(im, (300, 400), 'go in first', F(SERIF, 130), ACCENT, shadow=False)
    hand_dots(im, [(860, 900), (905, 960), (880, 1030)])
    im.alpha_composite(C.sticker('sparkles', 120, border=8), (800, 640))
    lab = C.torn_strip((330, 110), (255, 255, 255), seed=5)
    ImageDraw.Draw(lab).text((165, 55), 'new!', font=F(HAND, 62), fill=INK, anchor='mm')
    im.alpha_composite(lab.rotate(8, expand=True, resample=Image.BICUBIC), (640, 1450))
    return im

# ---- 3 footage through a star window ---------------------------------------------------------------------------------
def f3():
    base = frame('IMG_1460', 2.0)
    card = C.window_card((W, H), C.star_points((540, 1060), 560, 250), edge=(255, 255, 255), edge_w=10)
    base.alpha_composite(card)
    word(base, (110, 260), 'a little', F(SANS, 84), INK, shadow=False)
    word(base, (480, 330), 'extra', F(SERIF, 160), ACCENT, shadow=False)
    return base

# ---- 4 a pinned sticky note with a counter over the footage ------------------------------------------------------------
def f4():
    im = frame('IMG_1462', 1.5)
    note = C.sticky_note(520, 'yellow', seed=7)
    d = ImageDraw.Draw(note); f = F(HAND, 74)
    for i, line in enumerate(['tissue +', 'a thank-you', 'note \u2605']):
        d.text((note.width / 2, 200 + i * 92), line, font=f, fill=INK, anchor='mm')
    note.alpha_composite(C.star(70, INK, 5), (int(note.width / 2 + 120), 360))
    im.alpha_composite(note.rotate(-4, expand=True, resample=Image.BICUBIC), (250, 760))
    word(im, (540, 1500), '2/4', F(SANS, 48), (255, 255, 255), anchor='ma')
    word(im, (300, 300), 'the', F(SANS, 70), (255, 255, 255))
    word(im, (430, 360), 'extras', F(SERIF, 140), ACCENT)
    return im

# ---- 5 the clock ---------------------------------------------------------------------------------------------------------
def f5():
    im = C.dot_paper((W, H), seed=8); d = ImageDraw.Draw(im); c = (540, 1000); R = 380
    for k in range(60):
        a = math.radians(k * 6 - 90); l = 46 if k % 5 == 0 else 18
        d.line((c[0] + (R - l) * math.cos(a), c[1] + (R - l) * math.sin(a), c[0] + R * math.cos(a), c[1] + R * math.sin(a)),
               fill=INK + (255,), width=6 if k % 5 == 0 else 3)
    f = F(SERIF, 330); txt = '60'
    mask = Image.new('L', im.size, 0); ImageDraw.Draw(mask).text(c, txt, font=f, fill=255, anchor='mm')
    ring = mask.filter(ImageFilter.MaxFilter(9)); edge = ImageChops.subtract(ring, mask)
    ink = Image.new('RGBA', im.size, INK + (255,)); ink.putalpha(edge); im.alpha_composite(ink)   # outlined number
    a = math.radians(40 - 90)
    d.line((c[0], c[1], c[0] + (R - 70) * math.cos(a), c[1] + (R - 70) * math.sin(a)), fill=ACCENT + (255,), width=10)
    d.ellipse((c[0] - 16, c[1] - 16, c[0] + 16, c[1] + 16), fill=ACCENT + (255,))
    word(im, (540, 420), 'packed in', F(SANS, 84), INK, shadow=False, anchor='ma')
    word(im, (540, 1450), 'seconds', F(SERIF, 150), ACCENT, shadow=False, anchor='ma')
    return im

# ---- 6 a diagonal split -------------------------------------------------------------------------------------------------
def f6():
    a, b = frame('IMG_1447', 2.0), frame('IMG_1439', 2.5)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W, 0), (W, 760), (0, 1160)], fill=255)
    out = Image.composite(a, b, m)
    d = ImageDraw.Draw(out); d.line((0, 1160, W, 760), fill=(255, 255, 255, 255), width=18)
    band = C.torn_strip((760, 330), (255, 255, 255), seed=6)
    out.alpha_composite(band.rotate(-8, expand=True, resample=Image.BICUBIC), (150, 1300))
    word(out, (250, 1360), 'sealed', F(SERIF, 150), ACCENT, shadow=False)
    word(out, (620, 1500), '+ ready', F(SANS, 78), INK, shadow=False)
    return out

# ---- 7 the CTA ------------------------------------------------------------------------------------------------------------
def f7():
    base = frame('IMG_1439', 3.0)
    win = [rotate_pt(p, (540, 760), -4) for p in C.torn_points((190, 360, 890, 1160), seed=9)]
    base.alpha_composite(C.window_card((W, H), win, seed=12))
    word(base, (540, 1290), 'Spray cleaner', F(SERIF, 130), ACCENT, shadow=False, anchor='ma')
    word(base, (540, 1470), 'shop at the link in my bio', F(SANS, 52), INK, shadow=False, anchor='ma')
    d = ImageDraw.Draw(base)
    base.alpha_composite(C.arrow(170, INK, 6, 40).rotate(-70, expand=True), (470, 1560))
    return base

def rotate_pt(p, c, deg):
    a = math.radians(deg); x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))

def main():
    frames = [f1(), f2(), f3(), f4(), f5(), f6(), f7()]
    names = ['1 words around the subject', '2 real object, played with', '3 star window', '4 sticky note + counter',
             '5 clock', '6 diagonal split', '7 CTA']
    for n, f in zip(names, frames): f.convert('RGB').save(OUT / f'{n}.jpg', quality=90)
    sheet = Image.new('RGB', (W * 4 + 60, H * 2 + 20), 'white')
    for i, f in enumerate(frames): sheet.paste(f.convert('RGB'), ((i % 4) * (W + 20), (i // 4) * (H + 20)))
    sheet.resize((sheet.width // 3, sheet.height // 3)).save(OUT / 'mood-02.jpg', quality=90)
    print('saved', OUT)

if __name__ == '__main__':
    main()
