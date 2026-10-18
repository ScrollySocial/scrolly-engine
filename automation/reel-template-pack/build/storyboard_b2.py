"""Storyboard stills for the physical pack's batch 2 (2026-10-17): #07 How big is it really?, #11 A day with it,
#15 New drop reveal, #20 What buyers said. One round, one review page (build/review_b2.py).

Every object is one of Mercedes's real photos from assets/props/source (the library is shared across packs), cut out
here and cached in build/.cache. The drawn layer is her own marker doodles (doodles/*.png sheets) plus a sketchy ink
outline around real objects. Each template has its own world:
  07  the measuring table: light oak, wooden rulers, a banana, a mug, playing cards; letters banana yellow with
      brown speckles (Coiny), small words on index cards and a mustard paint chip.
  11  the clock of the day: the handless brass wall clock as a wheel of 4 clips, its real brass hands, cream twin-bell
      alarm clocks, the hourglass; the sky behind changes with the time of day (her watercolour washes, then her
      hand-painted dots on black for night); letters filled with the sky's wash (DynaPuff).
  15  the stage: red velvet curtains, a spotlight beam on black, ticket stubs; marquee letters with light bulbs
      (Alfa Slab One).
  20  the prize table: white marble, gold foil stars, gold seals, trophies, vintage postcards; letters in gold foil
      (Sigmar One).
Footage is a stand-in (her July clips). Editable words use fonts buyers have (Arial Bold, Ink Free); the big built-in
words are artwork lettering (Coiny, DynaPuff, Alfa Slab One, Sigmar One: SIL OFL fonts from CapCut's cache).
Usage: python build/storyboard_b2.py [07 11 15 20]  ->  NN-.../storyboard/
"""
import math, random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import engine as E
from props import cut_white

W, H = 1080, 1920
INK, WHITE, CREAM = (24, 23, 22), (255, 255, 255), (250, 244, 230)
SRC = E.PACK / 'assets' / 'props' / 'source'
CACHE = Path(__file__).resolve().parent / '.cache'; CACHE.mkdir(exist_ok=True)
BOLD, HAND = 'C:/Windows/Fonts/arialbd.ttf', E.INKFREE
# artwork lettering only (rendered into images, never editable text): SIL OFL fonts from CapCut's text-template cache
_RES = E.LOCAL / 'CapCut' / 'User Data' / 'Cache' / 'AITextTemplate' / 'Resource'
FONTS = {'coiny': str(_RES / '12525961487611282290' / 'Coiny-Regular.ttf'), 'dynapuff': str(_RES / '13501609231124469651' / 'DynaPuff-SemiBold.ttf'),
         'alfa': str(_RES / '1970572292665945052' / 'Alfa Slab One-Regular.ttf'), 'sigmar': str(_RES / '5639597983442207182' / 'SigmarOne-Regular.ttf')}
TONE = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p'
DIRS = {'07': '07-how-big-is-it', '11': '11-a-day-with-it', '15': '15-new-drop-reveal', '20': '20-what-buyers-said'}

def F(p, px): return ImageFont.truetype(p, px)

# ---- images ----------------------------------------------------------------------------------------------------------------
def raw(folder, name): return Image.open(SRC / folder / name).convert('RGB')

def cut(folder, name, tol=22, holes=()):
    """A real photo cut out of its white background (cached). holes: points (as fractions of the cut-out) inside
    closed gaps that show the background, like a mug handle; each is cleared by flood fill."""
    p = CACHE / (Path(name).stem + '.png')
    if not p.exists():
        im = cut_white(Image.open(SRC / folder / name), tol=tol)
        for fx, fy in holes:
            near = ImageOps.grayscale(im.convert('RGB')).point(lambda v: 255 if v >= 255 - max(tol, 6) else 0)
            seed = (int(fx * im.width), int(fy * im.height)); ImageDraw.floodfill(near, seed, 128)
            hole = near.point(lambda v: 255 if v == 128 else 0).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1))
            im.putalpha(ImageChops.subtract(im.split()[3], hole))
        im.save(p)
    return Image.open(p).convert('RGBA')

def ink_cut(im, color=INK, gamma=1.6):
    """A marker doodle on white: alpha from how dark each pixel is, so the holes inside shapes stay clear."""
    g = ImageOps.grayscale(im.convert('RGB'))
    a = g.point(lambda v: 0 if v > 235 else min(255, int(((255 - v) / 200) ** (1 / gamma) * 255)))
    out = Image.new('RGBA', im.size, color + (255,)); out.putalpha(a)
    return out.crop(out.getbbox()) if out.getbbox() else out

_PIECES = {}
def pieces(sheet, join=9):
    """The separate doodles on one of her marker sheets: dark marks grown by `join` px so a doodle's strokes count as
    one piece, each piece found by flood fill on a quarter-size mask. Boxes in reading order (rows, then left to right)."""
    if sheet in _PIECES: return _PIECES[sheet]
    im = raw('doodles', sheet); k = 4
    m = ImageOps.grayscale(im).resize((im.width // k, im.height // k)).point(lambda v: 255 if v < 150 else 0)
    m = m.filter(ImageFilter.MaxFilter(2 * (join // 2) + 1)); px = m.load(); boxes = []
    for y in range(m.height):
        for x in range(m.width):
            if px[x, y] == 255:
                ImageDraw.floodfill(m, (x, y), 100); b = m.point(lambda v: 255 if v == 100 else 0).getbbox()
                ImageDraw.floodfill(m, (x, y), 50)
                if (b[2] - b[0]) * (b[3] - b[1]) > 60: boxes.append(tuple(v * k for v in b))
    rows = []
    for b in sorted(boxes, key=lambda b: (b[1] + b[3]) / 2):
        if rows and abs((b[1] + b[3]) / 2 - rows[-1][0]) < 60: rows[-1][1].append(b)
        else: rows.append([(b[1] + b[3]) / 2, [b]])
    _PIECES[sheet] = [b for _, r in rows for b in sorted(r)]
    return _PIECES[sheet]

def doodle(sheet, i, w=None, color=INK):
    """Doodle number i from one of her marker sheets, recoloured, sized to width w."""
    x0, y0, x1, y1 = pieces(sheet)[i]; im = raw('doodles', sheet)
    d = ink_cut(im.crop((max(0, x0 - 8), max(0, y0 - 8), x1 + 8, y1 + 8)), color)
    return fitw(d, w) if w else d

ARROWS, BURSTS, ICONS, LINES, GLYPHS = 'Hand-drawn arrow doodle sheet-1.png', 'Playful hand-drawn burst asset sheet-2.png', \
    'Playful black doodle icon sheet-6.png', 'Hand-Drawn Underline Asset Sheet-5.png', 'Playful Marker Glyphs Asset Sheet-11.png'
def dd(kind, i, w, color=INK): return doodle(kind, i, w, color)

def card(folder, name, w, thresh=244):
    """Pale paper on white (index card, postcard): keep its rectangle (cached)."""
    from props import rect_cut
    p = CACHE / (Path(name).stem + '-rect.png')
    if not p.exists(): rect_cut(Image.open(SRC / folder / name), thresh=thresh, radius=4).save(p)
    return fitw(Image.open(p).convert('RGBA'), w)

def fitw(im, w): return im.resize((int(w), max(1, int(im.height * w / im.width))), Image.LANCZOS)
def fith(im, h): return im.resize((max(1, int(im.width * h / im.height)), int(h)), Image.LANCZOS)
def texture(folder, name, size=(W, H)): return ImageOps.fit(raw(folder, name), size, Image.LANCZOS).convert('RGBA')

def place(img, item, c, rot=0):
    it = item.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else item
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def sh(item, off=(10, 16), blur=18, a=95): return C.shadow(item, offset=off, blur=blur, alpha=a)

def outlined(img, gap=20, width=6, seed=1, color=INK, thresh=110):
    """A real photo with a sketchy hand-drawn ink line around it (two passes, like a pen going round twice)."""
    pad = gap + width + 12; w, h = img.size
    m = Image.new('L', (w + 2 * pad, h + 2 * pad), 0); m.paste(img.split()[3].point(lambda v: 255 if v > thresh else 0), (pad, pad))
    ImageDraw.floodfill(m, (0, 0), 128); m = m.point(lambda v: 0 if v == 128 else 255)
    m = m.filter(ImageFilter.MaxFilter(2 * (gap // 2) + 1)).filter(ImageFilter.MaxFilter(2 * (gap - gap // 2) + 1))
    m = m.filter(ImageFilter.GaussianBlur(gap * 1.1)).point(lambda v: 255 if v > 128 else 0)
    ring = ImageChops.subtract(m.filter(ImageFilter.MaxFilter(2 * width + 1)), m).filter(ImageFilter.GaussianBlur(0.8))
    out = Image.new('RGBA', m.size, (0, 0, 0, 0)); r = random.Random(seed)
    for k, a in ((0, 255), (1, 170)):
        dx, dy = (r.choice((-2, 2)), r.choice((-2, 2))) if k == 0 else (r.choice((-7, 7)), r.choice((-5, 5)))
        line = Image.new('RGBA', m.size, color + (0,)); line.putalpha(ImageChops.offset(ring, dx, dy).point(lambda v: v * a // 255))
        out.alpha_composite(line)
    out.alpha_composite(img, (pad, pad))
    return out

def obj(folder, name, w, gap=18, width=6, seed=1, color=INK, shadow=True, tol=22, holes=()):
    """A real object, sized, with its hand-drawn outline and a soft shadow."""
    o = outlined(fitw(cut(folder, name, tol, holes), w), gap, width, seed, color)
    return sh(o) if shadow else o

def alpha(im, k):
    im = im.copy(); im.putalpha(im.split()[3].point(lambda v: int(v * k))); return im

def footage(clip, size=(W, H)):
    name, t = clip; p = CACHE / f'{name}-{t}.png'
    if not p.exists():
        src = next(E.FOOTAGE.glob(name + '.*'))
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t), '-i', str(src), '-frames:v', '1',
                        '-vf', f'{TONE},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}', str(p)], check=True)
    return ImageOps.fit(Image.open(p).convert('RGBA'), (int(size[0]), int(size[1])), Image.LANCZOS)

def masked(im, m):
    im = im.copy(); im.putalpha(ImageChops.multiply(im.split()[3], m)); return im

def round_rect(size, r):
    m = Image.new('L', size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), r, fill=255); return m

def circle(d):
    m = Image.new('L', (d, d), 0); ImageDraw.Draw(m).ellipse((0, 0, d - 1, d - 1), fill=255); return m

def poly_mask(size, pts):
    m = Image.new('L', size, 0); ImageDraw.Draw(m).polygon(pts, fill=255); return m

# ---- words -------------------------------------------------------------------------------------------------------------------
def letters(word, font, px, fill, stroke=9, edge=INK):
    """Built-in big words as artwork lettering, one image per letter: fill(size, i) paints the letter, a black ink
    edge goes round it. Returns [(image, x offset of its centre from the word's centre)]."""
    f = F(font, px); _, t, _, b = f.getbbox(word, anchor='ls'); total = f.getlength(word); out = []
    for i, ch in enumerate(word):
        if ch == ' ': continue
        bl, _, br, _ = f.getbbox(ch, anchor='ls'); w, h = br - bl + 4 * stroke, b - t + 4 * stroke
        mask = Image.new('L', (w, h), 0); ImageDraw.Draw(mask).text((2 * stroke - bl, 2 * stroke - t), ch, font=f, fill=255, anchor='ls')
        im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        ink = Image.new('RGBA', (w, h), edge + (255,)); ink.putalpha(mask.filter(ImageFilter.MaxFilter(stroke * 2 + 1))); im.alpha_composite(ink)
        fl = fill((w, h), i); fl.putalpha(ImageChops.multiply(fl.split()[3], mask)); im.alpha_composite(fl)
        out.append((C.shadow(im, offset=(8, 12), blur=10, alpha=80), f.getlength(word[:i]) + bl - 2 * stroke + w / 2 - total / 2))
    return out

TILTS = (-6, 4, -3, 7, -5, 3, -4, 5, -2)
def hero(img, word, font, px, c, fill, stroke=9, popping=True, tilt=1.0):
    """The letters landed at slight angles; with popping, the last one is still mid-pop (bigger, more tilted)."""
    ls = letters(word, font, px, fill, stroke)
    for i, (im, dx) in enumerate(ls):
        last = popping and i == len(ls) - 1
        it = im.resize((int(im.width * 1.22), int(im.height * 1.22)), Image.LANCZOS) if last else im
        place(img, it, (c[0] + dx, c[1] - (12 if last else 0)), TILTS[i % len(TILTS)] * tilt * (1.8 if last else 1))

def text_w(text, font, px): return F(font, px).getlength(text)

def words_on(paper, text, font, px, color=INK, dy=0, lines=None):
    """Words written on a piece of real paper (centred)."""
    p = paper.copy(); d = ImageDraw.Draw(p); ls = lines or [text]; lh = px * 1.15
    y0 = p.height / 2 - lh * (len(ls) - 1) / 2 + dy
    for k, l in enumerate(ls): d.text((p.width / 2, y0 + k * lh), l, font=F(font, px), fill=color, anchor='mm')
    return p

def edged_text(img, xy, text, font, px, fill=WHITE, edge=INK, sw=None, anchor='mm', rot=0):
    """Editable-style text with an outline (CapCut stroke), optionally tilted."""
    f = F(font, px); sw = sw if sw is not None else max(3, px // 12)
    if not rot:
        ImageDraw.Draw(img).text(xy, text, font=f, fill=fill, anchor=anchor, stroke_width=sw, stroke_fill=edge); return
    l = Image.new('RGBA', (int(f.getlength(text) + 4 * sw + 20), int(px * 1.6 + 4 * sw)), (0, 0, 0, 0))
    ImageDraw.Draw(l).text((l.width / 2, l.height / 2), text, font=f, fill=fill, anchor='mm', stroke_width=sw, stroke_fill=edge)
    place(img, l, xy, rot)

# ---- fills for the lettering -------------------------------------------------------------------------------------------
def banana_fill(size, i):
    """Banana yellow with ripe brown speckles, irregular sizes (not a grid)."""
    im = Image.new('RGBA', size, (250, 214, 58, 255)); d = ImageDraw.Draw(im); r = random.Random(40 + i)
    for _ in range(int(size[0] * size[1] / 2600)):
        x, y = r.uniform(0, size[0]), r.uniform(0, size[1]); a = r.uniform(3, 11); b = a * r.uniform(0.6, 1.3)
        d.ellipse((x - a, y - b, x + a, y + b), fill=(122, 78, 30, r.randint(170, 240)))
    return im.filter(ImageFilter.GaussianBlur(0.6))

def wash_fill(name, dots=True):
    def f(size, i):
        tex = texture('doodles', name, (size[0] * 2, size[1] * 2)).crop((i * 37 % size[0], i * 53 % size[1], i * 37 % size[0] + size[0], i * 53 % size[1] + size[1]))
        tex = ImageEnhance.Color(tex).enhance(1.35); tex = ImageEnhance.Contrast(tex).enhance(1.15)
        if dots:
            d = ImageDraw.Draw(tex); r = random.Random(60 + i)
            for _ in range(int(size[0] * size[1] / 5200)):
                x, y, a = r.uniform(0, size[0]), r.uniform(0, size[1]), r.uniform(4, 9)
                d.ellipse((x - a, y - a * r.uniform(.8, 1.15), x + a, y + a), fill=(255, 255, 255, 235))
        return tex
    return f

def bulb_fill(size, i):
    """Marquee letters: theatre cream with rows of warm light bulbs, each with a little glow."""
    im = Image.new('RGBA', size, (246, 232, 196, 255)); glow = Image.new('RGBA', size, (0, 0, 0, 0)); g = ImageDraw.Draw(glow)
    d = ImageDraw.Draw(im); step = 44; r = 9
    for yy, y in enumerate(range(step // 2, size[1], step)):
        for x in range(step // 2 + (step // 2 if yy % 2 else 0), size[0], step):
            g.ellipse((x - r * 2.2, y - r * 2.2, x + r * 2.2, y + r * 2.2), fill=(255, 196, 80, 150))
            d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 250, 214, 255))
    im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(7)))
    for yy, y in enumerate(range(step // 2, size[1], step)):
        for x in range(step // 2 + (step // 2 if yy % 2 else 0), size[0], step):
            d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 252, 228, 255), outline=(170, 120, 60, 255), width=2)
    return im

def gold_fill(size, i):
    """Gold foil, cut from her real gold seal (the crinkled foil in its middle)."""
    seal = raw('images', 'Blank gold foil seal sticker-175.png'); c = seal.width // 2; k = 330
    tex = seal.crop((c - k, c - k, c + k, c + k)).rotate(i * 47, resample=Image.BICUBIC).crop((60, 60, 2 * k - 60, 2 * k - 60))
    tex = ImageEnhance.Contrast(tex).enhance(1.25)
    return ImageOps.fit(tex, size, Image.LANCZOS).convert('RGBA')

# ---- shared scenery ------------------------------------------------------------------------------------------------------
def motion_ticks(n=3, length=90, gap=34, width=8, color=INK):
    im = Image.new('RGBA', (gap * (n - 1) + 2 * width + 40, length + 30), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for i in range(n):
        x = width + 20 + i * gap; d.line((x, 12 + (i % 2) * 14, x, 12 + length - (i % 2) * 14), fill=color + (255,), width=width)
    return im

def save(tid, frames):
    out = E.PACK / DIRS[tid] / 'storyboard'; out.mkdir(parents=True, exist_ok=True)
    for old in out.glob('*.jpg'): old.unlink()
    ims = []
    for name, im in frames:
        im = im.convert('RGB'); im.save(out / f'{name}.jpg', quality=90); ims.append(im)
    n = len(ims); sheet = Image.new('RGB', (W * n + 20 * (n - 1), H), 'white')
    for i, im in enumerate(ims): sheet.paste(im, (i * (W + 20), 0))
    sheet.resize((sheet.width // 3, sheet.height // 3), Image.LANCZOS).save(out / f'storyboard-{tid}.jpg', quality=88)
    print('saved', out, n, 'frames')

def card_text(text, w=520, px=60, font=HAND, color=INK, rot=0, name='Blank cream index card on white-24.png', lines=None, strip=None):
    """Words on a real cream index card (editable words in the template); strip keeps only that share of its height,
    like a strip cut from the card."""
    c = card('images', name, w)
    if strip: c = c.crop((0, int(c.height * (0.5 - strip / 2)), c.width, int(c.height * (0.5 + strip / 2))))
    return sh(words_on(c, text, font, px, color, lines=lines), (6, 10), 10, 90)

def window(clip, size, r=26, line=8, seed=3, color=INK):
    """A clip in a rounded window with a sketchy hand-drawn edge."""
    im = masked(footage(clip, size), round_rect(size, r))
    return sh(outlined(im, 10, line, seed, color), (10, 16), 18, 100)

def screen(base, light):
    """Light added the way a spotlight adds it (screen blend), keeping base's alpha."""
    out = ImageChops.screen(base.convert('RGB'), light.convert('RGB')).convert('RGBA'); out.putalpha(base.split()[3]); return out

# ---- 07 How big is it really? -------------------------------------------------------------------------------------
C07 = dict(alone=('IMG_1378', 1.0), hand=('IMG_1381', 1.0), next=('IMG_1378', 3.0), used=('IMG_1377', 1.0), cta=('IMG_1381', 3.0))
BANANA = ['Ripe Banana on Pure White-29.png', 'Ripe Yellow Banana on Pure White-155.png', 'Ripe yellow banana on white background-139.png']
RULER = 'Pale wooden ruler on white-153.png'

def oak(): return texture('images', 'Light oak wood grain texture-2.png')
def banana(w, i=0, seed=1): return obj('images', BANANA[i], w, 22, 7, seed)
def ruler(w, seed=2): return obj('images', RULER, w, 12, 6, seed)
def mug(w, seed=4): return obj('images', 'Warm white ceramic coffee mug-140.png', w, 16, 6, seed, tol=2, holes=((0.86, 0.5),))
def playing(w, i=0, seed=5): return obj('images', ['Navy geometric playing card back-143.png', 'Navy and cream geometric card back-157.png'][i], w, 12, 5, seed)
def b_hero(img, word, px, c, **k): hero(img, word, FONTS['coiny'], px, c, banana_fill, **k)

def f07_1():
    """Hook: the product alone, and a giant banana swings in for scale. HOW BIG pops in, letter by letter."""
    im = footage(C07['alone'])
    place(im, banana(1500, 0), (260, 1540), 28)
    place(im, motion_ticks(color=WHITE), (760, 1290), -35)
    b_hero(im, 'HOW BIG', 196, (540, 420))
    place(im, card_text('is it really?', 520, 74), (560, 700), -4)
    place(im, dd(GLYPHS, 8, 130, WHITE), (985, 250), 12)
    return im

def f07_2():
    """The ruler splits the screen: the product alone above, in my hand below, a real ruler on the seam."""
    im = footage(C07['hand']); top = footage(C07['alone'])
    im.alpha_composite(masked(top, poly_mask((W, H), [(0, 0), (W, 0), (W, 1070), (0, 870)])))
    place(im, ruler(1650), (540, 970), -10.5)
    place(im, card_text('In my hand', 500, 66, BOLD), (330, 1300), 4)
    place(im, dd(ARROWS, 9, 170, WHITE), (640, 1180), -20)
    place(im, dd(ICONS, 9, 120, WHITE), (870, 420), 0)
    return im

def f07_3():
    """Transition: a giant real mug slides across the screen and wipes the hand clip off; next to a mug is behind it."""
    im = footage(C07['next']); old = footage(C07['hand'])
    im.alpha_composite(masked(old, poly_mask((W, H), [(0, 0), (330, 0), (330, H), (0, H)])))
    m = mug(1450); place(im, m, (430, 980), -4)
    for y in (700, 980, 1260): place(im, motion_ticks(3, 110, 38, 9, WHITE), (1000, y), 90)
    return im

def f07_4():
    """Next to things you own: the clip stands in a line-up on the oak table between a real mug, a playing card and a
    banana, a ruler standing up as the height chart; each thing named in handwriting."""
    im = oak()
    place(im, ruler(1500, 7), (100, 980), 90)
    place(im, window(C07['next'], (500, 860)), (560, 900), 0)
    place(im, mug(330, 8), (300, 1250), 0)
    place(im, playing(250, 0, 9), (900, 720), 8)
    place(im, playing(250, 1, 10), (935, 1010), -6)
    place(im, banana(760, 1, 11), (600, 1540), -6)
    hd = lambda t, xy, r: edged_text(im, xy, t, HAND, 70, INK, (255, 250, 240), 5, rot=r)
    hd('mug', (250, 1430), 4); hd('card', (840, 1215), -3); hd('banana', (300, 1700), -4)
    place(im, dd(ARROWS, 0, 150), (390, 1080), -150)
    place(im, card_text('Next to a mug', 560, 62, BOLD), (560, 330), -3)
    return im

def f07_5():
    """In use: the clip full screen; real playing cards fan in the corner, the words on an index card."""
    im = footage(C07['used'])
    for i, (c, r) in enumerate((((120, 1640), -28), ((230, 1680), -8), ((350, 1700), 14))):
        place(im, playing(300, i % 2, 20 + i), c, r)
    place(im, card_text('[Worn every day]', 600, 56, BOLD), (420, 1330), -3)
    place(im, dd(BURSTS, 4, 200, WHITE), (840, 520), 0)
    return im

def f07_6():
    """CTA: the product on the ruler, the exact size on a card, Comment + keyword on a real mustard paint chip."""
    im = oak()
    place(im, banana(700, 2, 30), (1000, 140), 140)
    place(im, mug(300, 31), (110, 1720), 10)
    place(im, window(C07['cta'], (820, 860)), (540, 1000), 2)
    place(im, ruler(1200, 32), (540, 1470), 2)
    place(im, card_text('[Exact size]', 520, 64, BOLD), (310, 1360), -6)
    b_hero(im, 'Comment', 160, (540, 300), popping=False)
    chip = fitw(cut('images', 'Mustard yellow paint sample card-71.png').rotate(90, expand=True), 520)
    chip = chip.crop((0, int(chip.height * 0.3), chip.width, int(chip.height * 0.7)))   # a strip cut from the chip
    place(im, sh(words_on(chip, '"SIZE"', BOLD, 84, INK)), (540, 470), -2)
    place(im, dd(ARROWS, 7, 170), (930, 1250), 0)
    return im

def t07():
    save('07', [('1 hook - a giant banana swings in for scale', f07_1()), ('2 a real ruler splits the screen - alone, in my hand', f07_2()),
                ('3 a giant mug wipes across to the next clip', f07_3()), ('4 the line-up - next to things you own', f07_4()),
                ('5 in use, cards fanned in the corner', f07_5()), ('6 CTA - exact size, comment SIZE', f07_6())])

# ---- 11 A day with it -------------------------------------------------------------------------------------------------
C11 = dict(morning=('IMG_1449', 1.0), midday=('IMG_1391', 1.0), afternoon=('IMG_1460', 1.0), night=('IMG_1448', 1.0), rest=('IMG_1451', 1.0))
DAY = [C11['morning'], C11['midday'], C11['afternoon'], C11['night']]          # clockwise from the top-right slice
SKY = {'morning': 'Soft Sky Blue Watercolor Wash-27.png', 'noon': 'Butter Yellow Watercolor Wash-23.png',
       'afternoon': 'Soft terracotta watercolor wash-28.png', 'lilac': 'Soft lilac watercolor wash-29.png'}
ALARMS = ['Classic Cream Twin-Bell Alarm Clock-185.png', 'Classic cream twin-bell alarm clock-57.png', 'Slender Cream Twin-Bell Alarm Clock-158.png']
FACE = 0.405                        # the face's radius as a share of the brass clock's width (measured)
HANDS = {'hour': ((0, 207), (78, 1110)), 'minute': ((207, 414), (135, 1110))}   # each hand's crop and its pivot (the ring)

def sky(name): return texture('doodles', SKY[name])
def night_sky(): return texture('doodles', 'Hand-painted polka dots on black-15.png')
def alarm(w, i=0, seed=40, color=INK): return obj('images', ALARMS[i], w, 16, 6, seed, color)

def wheel(d, lit, clips=DAY, dim=0.6):
    """The clock face cut into four slices, each playing its own clip; the lit slice bright, the others dimmed.
    Her marker strokes divide the slices."""
    disc = Image.new('RGBA', (d, d), (0, 0, 0, 0)); h = d // 2
    for q, (clip, (x, y), a0) in enumerate(zip(clips, ((h, 0), (h, h), (0, h), (0, 0)), (270, 0, 90, 180))):
        f = footage(clip, (h, h))
        if q != lit: f = ImageEnhance.Brightness(f).enhance(dim)
        layer = Image.new('RGBA', (d, d), (0, 0, 0, 0)); layer.alpha_composite(f, (x, y))
        m = Image.new('L', (d, d), 0); ImageDraw.Draw(m).pieslice((0, 0, d - 1, d - 1), a0, a0 + 90, fill=255)
        disc.alpha_composite(masked(layer, m))
    stroke = dd(LINES, 0, d)
    place(disc, stroke, (h, h), 0); place(disc, stroke, (h, h), 90)
    return disc

def clock(w, lit=None, full=None, seed=41):
    """The real brass wall clock; its face plays the wheel of four clips (lit = the bright slice) or one clip."""
    c = fitw(cut('fall', 'Handless vintage brass wall clock-24.png'), w); d = int(2 * FACE * w)
    if lit is not None: place(c, wheel(d, lit), (c.width / 2, c.height / 2))
    if full is not None: place(c, masked(footage(full, (d, d)), circle(d)), (c.width / 2, c.height / 2))
    return sh(outlined(c, 16, 7, seed), (12, 18), 22, 100)

def hand(img, which, centre, k, deg):
    """One of her real brass clock hands, scale k, pointing deg clockwise from 12, turning on its ring."""
    (x0, x1), (px, py) = HANDS[which]
    h = cut('fall', 'Vintage dark brass clock hands-29.png', holes=((0.188, 0.934), (0.826, 0.934))).crop((x0, 0, x1, 1188))
    h = h.resize((int(h.width * k), int(h.height * k)), Image.LANCZOS); px, py = px * k, py * k
    L = int(math.hypot(max(px, h.width - px), py) + 4); cv = Image.new('RGBA', (2 * L, 2 * L), (0, 0, 0, 0))
    cv.alpha_composite(h, (int(L - px), int(L - py)))
    place(img, sh(cv.rotate(-deg, resample=Image.BICUBIC), (8, 12), 8, 110), centre)

def hands(img, centre, k, hour, minute):
    hand(img, 'hour', centre, k * 0.8, hour); hand(img, 'minute', centre, k, minute)

def sky_hero(img, word, px, c, wash='morning', **k): hero(img, word, FONTS['dynapuff'], px, c, wash_fill(SKY[wash]), **k)

def f11_1():
    """Hook: morning, the alarm rings. The clip plays full screen; a giant real alarm clock shakes in the corner."""
    im = footage(C11['morning'])
    place(im, alarm(980, 0, 42, WHITE), (850, 1560), 14)
    place(im, dd(BURSTS, 5, 200, WHITE), (420, 1150), -10); place(im, dd(BURSTS, 6, 200, WHITE), (1000, 930), 80)
    sky_hero(im, 'A DAY', 230, (520, 360))
    sky_hero(im, 'WITH MY', 150, (520, 560), popping=False)
    place(im, card_text('[product]', 520, 70, BOLD, strip=0.5), (520, 740), -3)
    place(im, card_text('[7am]', 280, 70), (280, 1060), -7)
    return im

def f11_2():
    """Zoom out: the whole day is a clock. Four slices, four clips; the hands point at morning. Morning-blue sky."""
    im = sky('morning'); c = (540, 900)
    place(im, clock(1320, lit=0), c)
    hands(im, c, 0.62, 45, 60)
    place(im, card_text('[7am]', 270, 66), (800, 560), 6)
    place(im, alarm(300, 1, 43), (170, 1680), -12)
    return im

def f11_3():
    """The hands sweep on and the midday slice comes up and grows until it fills the screen: the clock is now so big
    that only the slice shows, its brass rim curving across the corner, the sky turned butter-yellow behind it."""
    im = sky('noon'); w = 3800; c = (60, 1820)
    big = fitw(cut('fall', 'Handless vintage brass wall clock-24.png'), w); d = int(2 * FACE * w)
    f = footage(C11['midday'], (W + 200, H)); layer = Image.new('RGBA', big.size, (0, 0, 0, 0))
    layer.alpha_composite(f, (int(big.width / 2 - 60), int(big.height / 2 - 1820)))
    m = Image.new('L', big.size, 0); r = d / 2; cx, cy = big.width / 2, big.height / 2
    ImageDraw.Draw(m).pieslice((cx - r, cy - r, cx + r, cy + r), 270, 360, fill=255)
    big.alpha_composite(masked(layer, m)); big = outlined(big, 16, 8, 45)
    im.alpha_composite(big, (int(c[0] - big.width / 2), int(c[1] - big.height / 2)))
    hands(im, c, 0.95, 30, 45)
    place(im, dd(ARROWS, 2, 260, WHITE), (820, 520), -30)
    place(im, card_text('[12pm]', 300, 70), (560, 380), -4)
    return im

def f11_4():
    """Afternoon, a diagonal split: the clip above the line, the terracotta afternoon sky below with the real
    hourglass running on the seam."""
    im = sky('afternoon'); top = footage(C11['afternoon'])
    im.alpha_composite(masked(top, poly_mask((W, H), [(0, 0), (W, 0), (W, 760), (0, 1440)])))
    place(im, dd(LINES, 4, 1400), (540, 1100), 32.2)
    place(im, obj('images', 'Classic wooden hourglass with flowing sand-238.png', 470, 16, 6, 46), (800, 1370), -8)
    place(im, card_text('[4pm]', 300, 70), (300, 1180), -5)
    place(im, dd(ICONS, 10, 120), (200, 1650), 0); place(im, dd(ICONS, 8, 90), (520, 1760), 0)
    return im

def f11_5():
    """Night: the clock comes back on a night sky (her hand-painted dots), the night slice lit, the hands at nine;
    an alarm clock lies down asleep."""
    im = night_sky(); c = (540, 880)
    place(im, clock(1180, lit=3, seed=47), c)
    hands(im, c, 0.56, 300, 0)
    place(im, card_text('[9pm]', 280, 66), (330, 600), -6)
    place(im, alarm(420, 2, 48, WHITE), (860, 1640), 82)
    edged_text(im, (620, 1420), 'z z z', HAND, 90, WHITE, INK, 4, rot=12)
    return im

def f11_6():
    """CTA: the product resting, playing in the whole clock face; the hands meet at twelve. Comment + keyword."""
    im = night_sky(); c = (540, 1100)
    place(im, alarm(300, 0, 49, WHITE), (110, 1700), -14); place(im, alarm(260, 1, 50, WHITE), (990, 1540), 12)
    place(im, clock(1000, full=C11['rest'], seed=51), c)
    hands(im, c, 0.5, 0, 0)
    sky_hero(im, 'Comment', 165, (540, 300), wash='lilac', popping=False)
    place(im, card_text('"[KEYWORD]"', 560, 70, BOLD, strip=0.45), (540, 470), -2)
    return im

def t11():
    save('11', [('1 hook - morning, the alarm rings', f11_1()), ('2 zoom out - the day is a clock of four clips', f11_2()),
                ('3 the hands sweep, the midday slice grows to fill the screen', f11_3()), ('4 afternoon - diagonal split, hourglass on the seam', f11_4()),
                ('5 night - the clock returns, night slice lit', f11_5()), ('6 CTA - the product resting in the clock face', f11_6())])

# ---- 15 New drop reveal -----------------------------------------------------------------------------------------------
C15 = dict(covered=('IMG_1454', 1.0), reveal=('IMG_1456', 1.0), close1=('IMG_1414', 1.0), close2=('IMG_1420', 1.0), use=('IMG_1418', 1.0))
TICKETS = ['Blank cream ticket stub on white-18.png', 'Blank pale yellow perforated ticket stub-19.png', 'Blank peach perforated ticket stub-22.png']

def curtain(kind, size=(W + 60, H + 40)):
    """Her real velvet curtain (closed or open) stretched to the screen. The folds run up and down, so the stretch
    only lengthens them."""
    name = {'closed': 'Closed red velvet theater curtain-67.png', 'open': 'Open red velvet curtains revealing white backdrop-117.png'}[kind]
    c = cut('images', name)
    if kind == 'closed': return c.resize(size, Image.LANCZOS)
    # open: a stage frame built from her photo's own pieces, the valance across the top and a narrow drape each side
    w, h = c.size; out = Image.new('RGBA', size, (0, 0, 0, 0)); side = 200
    left = c.crop((0, int(h * 0.1), int(w * 0.2), h)).resize((side, size[1]), Image.LANCZOS)
    right = c.crop((int(w * 0.8), int(h * 0.1), w, h)).resize((side, size[1]), Image.LANCZOS)
    out.alpha_composite(left, (0, 0)); out.alpha_composite(right, (size[0] - side, 0))
    out.alpha_composite(c.crop((0, 0, w, int(h * 0.16))).resize((size[0], 250), Image.LANCZOS), (0, 0))
    return out

def beam(flip=False, k=1.0):
    """Her spotlight beam on black, as a light layer the size of the screen."""
    b = raw('images', 'Soft White Spotlight Beam on Black-70.png'); b = fith(b, int(H * 0.62 * k))
    if flip: b = ImageOps.mirror(b)
    layer = Image.new('RGB', (W, H), 'black'); layer.paste(b, (W - b.width + 120 if flip else -120, -40)); return layer

def ticket(text, w=520, i=0, px=56, font=BOLD, seed=60):
    t = fitw(cut('images', TICKETS[i]), w); body = t.width * 0.78           # the stub's tear-off end is on the right
    d = ImageDraw.Draw(t); d.text((body / 2, t.height / 2), text, font=F(font, px), fill=INK, anchor='mm')
    return sh(t, (6, 10), 10, 100)

def bulb_hero(img, word, px, c, **k): hero(img, word, FONTS['alfa'], px, c, bulb_fill, stroke=10, **k)

def spot(clip, d, glow=(255, 236, 190)):
    """A clip in a round pool of spotlight: a soft warm glow round its edge."""
    g = Image.new('RGBA', (d + 160, d + 160), (0, 0, 0, 0)); ImageDraw.Draw(g).ellipse((40, 40, d + 120, d + 120), fill=glow + (190,))
    g = g.filter(ImageFilter.GaussianBlur(36))
    g.alpha_composite(masked(footage(clip, (d, d)), circle(d).filter(ImageFilter.GaussianBlur(3))), (80, 80)); return g

def f15_1():
    """Hook: the covered product on stage, the curtain framing it, a spotlight on it; NEW DROP lights up bulb by bulb."""
    im = screen(footage(C15['covered']), beam())
    im.alpha_composite(curtain('open'), (-30, -20))
    bulb_hero(im, 'NEW DROP', 136, (540, 430))
    place(im, ticket('[Product name]', 600, 0, 54), (540, 650), -4)
    place(im, dd(ICONS, 9, 120, CREAM), (220, 1250), 0); place(im, dd(ICONS, 11, 150, CREAM), (860, 1130), 0)
    return im

def f15_2():
    """Pause beat (no footage): the curtain closes, a spotlight on the velvet, a giant 3 in light bulbs counts down."""
    im = curtain('closed').crop((30, 20, W + 30, H + 20)).convert('RGBA')
    pool = Image.new('L', (W, H), 0); ImageDraw.Draw(pool).ellipse((90, 520, 990, 1420), fill=140)
    light = Image.new('RGBA', (W, H), (255, 236, 200, 0)); light.putalpha(pool.filter(ImageFilter.GaussianBlur(90))); im.alpha_composite(light)
    bulb_hero(im, '3', 760, (540, 1000), popping=False)
    place(im, ticket("you're seeing it first", 640, 2, 46, HAND), (520, 1420), 3)
    return im

def f15_3():
    """The reveal: the two halves of the closed curtain slide apart and the product is under the spotlight."""
    im = screen(footage(C15['reveal']), beam(k=1.1))
    cl = curtain('closed'); half = cl.width // 2
    im.alpha_composite(cl.crop((0, 0, half, cl.height)), (230 - half, -20))
    im.alpha_composite(cl.crop((half, 0, cl.width, cl.height)), (850, -20))
    for y in (700, 1000, 1300):
        place(im, motion_ticks(3, 80, 30, 8, CREAM), (310, y), 90); place(im, motion_ticks(3, 80, 30, 8, CREAM), (770, y), 90)
    place(im, dd(BURSTS, 2, 260, CREAM), (560, 470), 0); place(im, dd(BURSTS, 0, 160, CREAM), (640, 1380), 12)
    return im

def f15_4():
    """Close-up one: the stage goes dark, the clip plays in a big pool of spotlight; a ticket names the detail."""
    im = Image.new('RGBA', (W, H), (8, 6, 6, 255)); im = screen(im, beam(k=1.2))
    place(im, spot(C15['close1'], 900), (560, 980))
    place(im, ticket('[Detail one]', 480, 1, 54), (330, 1440), -6)
    place(im, dd(ARROWS, 8, 170, CREAM), (700, 1430), 10)
    return im

def f15_5():
    """Split: close-up one moves up into its own spotlight, close-up two lands in a second one (two beams)."""
    im = Image.new('RGBA', (W, H), (8, 6, 6, 255)); im = screen(im, beam(k=0.9)); im = screen(im, beam(True, 1.25))
    place(im, spot(C15['close1'], 640), (380, 640))
    place(im, spot(C15['close2'], 740), (640, 1240))
    place(im, ticket('[Detail one]', 400, 1, 46), (800, 360), 6)
    place(im, ticket('[Detail two]', 420, 0, 46), (270, 1400), -5)
    place(im, dd(ICONS, 8, 110, CREAM), (930, 860), 0); place(im, dd(ICONS, 10, 90, CREAM), (130, 960), 0)
    return im

def f15_6():
    """CTA: the product in use, back on the stage; tickets fanned in the corner, the date on one; Comment in lights."""
    im = screen(footage(C15['use']), beam(k=0.9))
    im.alpha_composite(curtain('open'), (-30, -20))
    for i, (c, r) in enumerate((((150, 1700), -24), ((300, 1760), -6), ((900, 1730), 16))): place(im, ticket('', 380, i, seed=70 + i), c, r)
    bulb_hero(im, 'Comment', 136, (540, 400), popping=False)
    place(im, ticket('"[KEYWORD]"', 560, 2, 56), (540, 590), -3)
    place(im, ticket('OUT [FRI 24 OCT]', 600, 0, 50), (520, 1380), 3)
    return im

def t15():
    save('15', [('1 hook - covered on stage, NEW DROP lights up', f15_1()), ('2 pause - curtain closes, countdown in lights', f15_2()),
                ('3 the reveal - the curtain halves slide apart', f15_3()), ('4 close-up one in a spotlight', f15_4()),
                ('5 split - two spotlights, two close-ups', f15_5()), ('6 CTA - in use on stage, tickets, the date', f15_6())])

# ---- 20 What buyers said ----------------------------------------------------------------------------------------------
C20 = dict(one=('IMG_1389', 1.0), two=('IMG_1391', 1.0), three=('IMG_1387', 1.0), product=('IMG_1390', 1.0))
STARS = ['Gold foil star sticker-95.png', 'Golden foil star sticker-103.png', 'Shiny Gold Foil Star Sticker-100.png',
         'Crinkled gold foil star sticker-106.png', 'Crinkled gold foil star sticker-97.png']
SEALS = ['Blank gold foil seal sticker-175.png', 'Blank gold foil seal sticker-78.png', 'Blank embossed gold foil seal-202.png']
TROPHIES = ['Plain gold trophy on black base-223.png', 'Minimal gold trophy on black base-203.png', 'Blank gold trophy on black base-109.png']
POSTCARDS = ['Blank vintage cream postcard-111.png', 'Blank vintage cream postcard-193.png', 'Blank vintage cream postcard-219.png']

def marble(): return texture('images', 'Soft veined white marble texture-1.png')
def star(w, i=0, seed=80, rot=0): return sh(fitw(cut('images', STARS[i % 5]), w), (5, 8), 6, 90)
def seal(w, i=0): return sh(fitw(cut('images', SEALS[i % 3]), w), (6, 10), 10, 100)
def trophy(w, i=0, seed=81): return obj('images', TROPHIES[i % 3], w, 14, 6, seed)
def gold_hero(img, word, px, c, **k): hero(img, word, FONTS['sigmar'], px, c, gold_fill, **k)

def postcard(lines, w=820, i=0, seed=82, who='- [buyer, if they said yes]'):
    """A review written on a real vintage postcard (editable text: the buyer pastes the review word for word)."""
    pc = card('images', POSTCARDS[i % 3], w); d = ImageDraw.Draw(pc); px = int(w * 0.068); lh = px * 1.25
    y0 = pc.height * 0.42 - lh * (len(lines) - 1) / 2
    for k, l in enumerate(lines): d.text((pc.width / 2, y0 + k * lh), l, font=F(HAND, px), fill=INK, anchor='mm')
    d.text((pc.width * 0.92, pc.height * 0.82), who, font=F(BOLD, int(px * 0.62)), fill=(90, 80, 70), anchor='rm')
    return sh(outlined(pc, 10, 5, seed), (8, 14), 14, 100)

REVIEW = lambda n: [f'"[Review {n}, pasted', 'word for word]"']

def f20_1():
    """Hook: the product in use; five real gold stars stick on one by one, WHAT BUYERS SAID in gold foil letters;
    a giant gold seal half off the corner."""
    im = footage(C20['one'])
    place(im, seal(820, 0), (1000, 1760), 0)
    for i in range(5):
        x = 170 + i * 185; last = i == 4
        place(im, star(200 if last else 165, i), (x, 300 - (30 if i in (1, 3) else 0) - (20 if last else 0)), (-12, 8, -4, 10, -18)[i])
    gold_hero(im, 'WHAT BUYERS', 118, (540, 520), popping=False)
    gold_hero(im, 'SAID', 200, (540, 710))
    return im

def f20_2():
    """Review one: written on a real postcard, stuck to the clip with a gold seal; her marker 1 beside it."""
    im = footage(C20['one'])
    place(im, postcard(REVIEW('one'), 840, 0, 83), (540, 1180), -4)
    place(im, seal(210, 1), (170, 940), 0)
    place(im, dd(GLYPHS, 0, 130, WHITE), (930, 820), 8)
    return im

def f20_3():
    """Transition: real gold stars rush in from every side until they cover the screen; the next clip shows through."""
    im = footage(C20['two']); r = random.Random(7)
    pts = [(x, y) for y in range(-60, H + 120, 230) for x in range(-60, W + 120, 230)]
    for k, (x, y) in enumerate(pts):
        dx, dy = x - W / 2, y - H / 2
        if (dx / 420) ** 2 + (dy / 600) ** 2 < 1: continue          # the middle still shows the clip
        place(im, star(r.randint(230, 330), k), (x + r.randint(-60, 60), y + r.randint(-60, 60)), r.randint(-40, 40))
    place(im, dd(ICONS, 9, 130, WHITE), (540, 700), 0); place(im, dd(ICONS, 11, 110, WHITE), (450, 1240), 0)
    return im

def f20_4():
    """Review two, a split: the clip on top, the marble prize table below, a real gold paint stroke on the seam,
    the postcard laid across it."""
    im = marble(); im.alpha_composite(footage(C20['two'], (W, 1120)), (0, 0))
    place(im, sh(fitw(cut('fall', 'Single metallic gold paint stroke-109.png'), 1300)), (540, 1120), -2)
    place(im, postcard(REVIEW('two'), 860, 1, 84), (540, 1300), 3)
    place(im, dd(GLYPHS, 1, 130), (950, 1060), -6)
    for i, (c, w) in enumerate((((150, 1700), 150), ((300, 1760), 110), ((880, 1720), 160))): place(im, star(w, i + 2), c, (i - 1) * 14)
    return im

def f20_5():
    """Review three: the clip plays inside a giant real gold seal like a medal on the marble; the postcard below."""
    im = marble(); c = (540, 820); w = 1250
    s = fitw(cut('images', SEALS[0]), w); d = int(s.width * 0.74)
    place(s, masked(footage(C20['three'], (d, d)), circle(d)), (s.width / 2, s.height / 2))
    place(im, sh(outlined(s, 14, 7, 85), (12, 18), 20, 110), c)
    place(im, postcard(REVIEW('three'), 800, 2, 86), (520, 1290), -5)
    place(im, dd(GLYPHS, 2, 130), (130, 1150), 6)
    place(im, trophy(220, 1), (985, 1760), 4)
    return im

def f20_6():
    """CTA: the product on its own in a window on the marble, a gold seal on its corner; three real trophies, each
    different, stand along the bottom; Comment in gold."""
    im = marble()
    place(im, window(C20['product'], (820, 960), 30, 8, 87), (540, 880), 0)
    place(im, seal(230, 2), (880, 440), 0)
    for i, (x, w, y) in enumerate(((180, 300, 1700), (540, 400, 1680), (900, 300, 1700))): place(im, trophy(w, i, 88 + i), (x, y), (-5, 0, 5)[i])
    gold_hero(im, 'Comment', 140, (540, 300), popping=False)
    pc = card('images', POSTCARDS[1], 560); pc = pc.crop((0, int(pc.height * 0.25), pc.width, int(pc.height * 0.75)))
    place(im, sh(words_on(pc, '"[KEYWORD]"', BOLD, 66)), (540, 1410), -2)
    return im

def t20():
    save('20', [('1 hook - five gold stars stick on, WHAT BUYERS SAID', f20_1()), ('2 review one on a postcard, sealed in gold', f20_2()),
                ('3 gold stars rush in and cover the screen', f20_3()), ('4 review two - split with the marble table', f20_4()),
                ('5 review three - the clip in a giant gold seal', f20_5()), ('6 CTA - the product, three trophies, comment', f20_6())])

if __name__ == '__main__':
    todo = sys.argv[1:] or ['07', '11', '15', '20']
    for t in todo: globals()['t' + t]()
