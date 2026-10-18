"""Storyboard stills for the Fall pack (f2, f3, f4, f6, f7; f1 and f5 wait on images being redone), built only from
Mercedes's images in assets/props/source/ (the library is shared across packs). Each template has its own world and
its own built-in lettering (artwork words); the words buyers edit are Montserrat Bold (in CapCut's library) or Ink Free
on paper. Concepts and lengths: fall-pack.md. Rules: FRAMEWORK.md.
Usage: python build/storyboard_fall.py [f2 f3 ...]  ->  fall/fN-.../storyboard/
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import engine as E
import storyboard_02 as S          # footage()
from props import cut_white

LIB = E.PACK / 'assets' / 'props' / 'source'
OUT = E.PACK / 'fall'
W, H = 1080, 1920
INK, WHITE, CREAM = (30, 24, 20), (255, 255, 255), (250, 242, 222)
ORANGE = (232, 112, 34)            # the key-word colour buyers swap for their brand colour
FONTS = E.LOCAL / 'CapCut' / 'User Data' / 'Cache' / 'AITextTemplate' / 'Resource'
def font_file(name): return str(next(FONTS.glob(f'*/{name}')))
MONT, ALFA, CORBEN, COINY, DYNA, BOUNCE = (font_file(n) for n in ('Montserrat-Bold.otf', 'Alfa Slab One-Regular.ttf',
    'Corben-Bold.ttf', 'Coiny-Regular.ttf', 'DynaPuff-SemiBold.ttf', 'BounceHouse-Regular.otf'))
HAND = E.INKFREE
DIRS = {'f2': 'f2-round-the-clock', 'f3': 'f3-falling-for-it', 'f4': 'f4-bob-for-it', 'f6': 'f6-burning-questions',
        'f7': 'f7-pick-your-brew'}
FRAME = ['']                       # the frame being drawn, for safe-zone warnings

def F(p, px): return ImageFont.truetype(p, int(px))

# ---- images -------------------------------------------------------------------------------------------------------------
_files = {p.name: p for p in LIB.rglob('*') if p.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp')}
_cache = {}
def src(name): return Image.open(_files[name])
def cut(name, tol=26, holes=False):
    """Cut-out from the white background; holes=True also clears white enclosed by the object (a tag's twine loop)."""
    k = ('cut', name, tol, holes)
    if k not in _cache:
        im = cut_white(src(name), tol=tol)
        if holes:
            g = ImageOps.grayscale(im.convert('RGB')); r, gg, b = im.convert('RGB').split()
            lo = ImageChops.darker(ImageChops.darker(r, gg), b)
            keep = lo.point(lambda v: 0 if v > 232 else 255).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1))
            im.putalpha(ImageChops.multiply(im.split()[3], keep))
        _cache[k] = im
    return _cache[k]
def tex(name, size, centering=(0.5, 0.5)): return ImageOps.fit(src(name).convert('RGBA'), size, centering=centering)
def fit_w(im, w): return im.resize((max(1, int(w)), max(1, int(im.height * w / im.width))), Image.LANCZOS)
def dim(im, k=0.7): return ImageEnhance.Brightness(im).enhance(k)
def place(img, item, c, rot=0):
    it = item.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else item
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))
    return (c[0] - it.width / 2, c[1] - it.height / 2, c[0] + it.width / 2, c[1] + it.height / 2)

def on_black(name, gain=1.4, gamma=0.8):
    """A photo on black (fire, embers, steam, splash, glow) as a cut-out: brightness becomes see-through-ness."""
    k = ('black', name)
    if k not in _cache:
        im = src(name).convert('RGB'); r, g, b = im.split()
        a = ImageChops.lighter(ImageChops.lighter(r, g), b).point(lambda v: min(255, int(255 * (v / 255) ** gamma * gain)))
        out = ImageEnhance.Brightness(im).enhance(1.25).convert('RGBA'); out.putalpha(a); _cache[k] = out
    return _cache[k]

def clip(n=0, size=(W, H)):
    """Stand-in footage (Mercedes's July clips); buyers drop their own clips into these slots."""
    clips = [('IMG_1439', 2.0), ('IMG_1447', 1.0), ('IMG_1385', 1.0), ('IMG_1460', 2.0), ('IMG_1439', 4.0)]
    c, t = clips[n % len(clips)]
    return S.footage(c, t, size)

def disc(im, d):
    v = ImageOps.fit(im, (int(d), int(d))); m = Image.new('L', v.size, 0); ImageDraw.Draw(m).ellipse((0, 0, v.width - 1, v.height - 1), fill=255)
    v.putalpha(m); return v

def outline(item, color=CREAM, w=8, gap=12, seed=1):
    """A hand-drawn line around a real object: a ring a little off-centre, so it looks drawn on by hand."""
    r = random.Random(seed); pad = gap + w + 16
    a = Image.new('L', (item.width + 2 * pad, item.height + 2 * pad), 0); a.paste(item.split()[3].point(lambda v: 255 if v > 90 else 0), (pad, pad))
    small = a.resize((a.width // 3, a.height // 3))
    d1 = small.filter(ImageFilter.MaxFilter(2 * (gap // 3) + 1)); d2 = d1.filter(ImageFilter.MaxFilter(2 * max(1, w // 3) + 1))
    ring = ImageChops.subtract(d2, d1).resize(a.size).filter(ImageFilter.GaussianBlur(1.2)).point(lambda v: 255 if v > 110 else 0)
    ring = ring.rotate(r.uniform(-1.2, 1.2), resample=Image.BICUBIC, translate=(r.randint(-5, 5), r.randint(-5, 5)))
    out = Image.new('RGBA', a.size, (0, 0, 0, 0)); lay = Image.new('RGBA', a.size, color + (255,)); lay.putalpha(ring)
    out.alpha_composite(item, (pad, pad)); out.alpha_composite(lay); return out

def shadowed(im, off=(8, 14), blur=14, alpha=90): return C.shadow(im, offset=off, blur=blur, alpha=alpha)

def ink_piece(sheet, cols, rows, i, color=INK, inset=0.06):
    """One drawing from one of her doodle sheets (a grid of marker drawings on white), recoloured."""
    im = src(sheet).convert('L'); cw, ch = im.width / cols, im.height / rows
    x, y = i % cols, i // cols
    cell = im.crop((int((x + inset) * cw), int((y + inset) * ch), int((x + 1 - inset) * cw), int((y + 1 - inset) * ch)))
    a = cell.point(lambda v: 255 if v < 90 else (0 if v > 200 else (200 - v) * 255 // 110))
    out = Image.new('RGBA', cell.size, color + (255,)); out.putalpha(a); return out.crop(out.getbbox())

def two_tone(name, dark, light, size):
    """A black-and-white pattern sheet recoloured: black -> dark, white -> light (e.g. hand-painted polka dots)."""
    g = ImageOps.grayscale(tex(name, size).convert('RGB'))
    return ImageOps.colorize(g, dark, light).convert('RGBA')

# ---- text ---------------------------------------------------------------------------------------------------------------
def zone(box, what):
    """IG safe zone: no words under the top bar, the caption strip or the button column."""
    x0, y0, x1, y1 = box
    if y0 < 220 or y1 > H - 420 or (x1 > W - 150 and y1 > H / 2):
        print(f'IG SAFE ZONE: {FRAME[0]}: "{what}" at {tuple(int(v) for v in box)}')

def letters_img(word, font, px, fill, stroke=10, edge=INK, tilts=(-5, 4, -3, 6, -4, 3, -6, 5), glow=None, track=0.02):
    """Built-in words as artwork: each letter filled with a texture/pattern, a thick ink edge, its own slight tilt."""
    f = F(font, px); asc, desc = f.getmetrics(); hh = asc + desc + 4 * stroke
    pieces, x = [], 0
    for i, ch in enumerate(word):
        if ch == ' ': x += px * 0.32; continue
        l, t, r, b = f.getbbox(ch, anchor='ls'); w = r - l + 4 * stroke
        m = Image.new('L', (w, hh), 0); ImageDraw.Draw(m).text((2 * stroke - l, asc + 2 * stroke), ch, font=f, fill=255, anchor='ls')
        fl = fill(w, hh, i) if callable(fill) else Image.new('RGBA', (w, hh), fill + (255,))
        im = Image.new('RGBA', (w, hh), (0, 0, 0, 0)); ink = Image.new('RGBA', (w, hh), edge + (255,))
        ink.putalpha(m.filter(ImageFilter.MaxFilter(2 * stroke + 1))); im.alpha_composite(ink)
        fl = fl.copy(); fl.putalpha(ImageChops.multiply(fl.split()[3], m)); im.alpha_composite(fl)
        pieces.append((im.rotate(tilts[i % len(tilts)], expand=True, resample=Image.BICUBIC), x + w / 2))
        x += r - l + px * track
    out = Image.new('RGBA', (int(x + 6 * stroke + px * 0.4), int(hh * 1.35)), (0, 0, 0, 0))
    for im, cx in pieces: out.alpha_composite(im, (int(cx + 2 * stroke - im.width / 2 + px * 0.1), int(out.height / 2 - im.height / 2)))
    out = out.crop(out.getbbox())
    if glow:
        g = Image.new('RGBA', (out.width + 120, out.height + 120), glow + (0,)); a = Image.new('L', g.size, 0); a.paste(out.split()[3], (60, 60))
        g.putalpha(a.filter(ImageFilter.GaussianBlur(26)).point(lambda v: min(255, int(v * 1.5)))); g.alpha_composite(out, (60, 60)); out = g
    return shadowed(out, (6, 10), 8, 80)

def max_w(c, h):
    """Widest a word can be at centre c: inside the frame, and left of the button column when it reaches the lower half."""
    return 2 * min(c[0] - 30, (W - 160 if c[1] + h / 2 > H / 2 else W - 30) - c[0])

def hero(img, c, word, font, px, fill, rot=0, **k):
    it = letters_img(word, font, px, fill, **k)
    it = fit_w(it, min(it.width, max_w(c, it.height)))
    zone(place(img, it, c, rot), word)

def tex_fill(name, crop=None, k=1.0):
    def f(w, h, i):
        im = src(name).convert('RGBA')
        if crop: im = im.crop(crop)
        im = ImageOps.fit(im, (int(w * 3 * k), int(h * k)), centering=((i * 0.27) % 1, 0.5))
        return ImageOps.fit(im, (w, h))
    return f

def say(img, c, text, px, fill=WHITE, edge=INK, rot=0, font=MONT, anchor='mm'):
    """Words the buyer edits: Montserrat Bold (CapCut library) with a thick edge, readable over any video."""
    f = F(font, px); sw = max(4, px // 10)
    lay = Image.new('RGBA', (W * 2, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.text((W, H / 2), text, font=f, fill=fill + (255,), anchor='mm', stroke_width=sw, stroke_fill=edge + (255,), align='center')
    lay = lay.crop(lay.getbbox()); lay = shadowed(lay, (4, 7), 6, 90); lay = fit_w(lay, min(lay.width, max_w(c, lay.height)))
    zone(place(img, lay, c, rot), text)

def on_paper(img, paper, c, w, lines, rot=0, pad=0.16, area=None):
    """Words written on a real paper object (card, tag, sign). lines = [(text, font, px, colour)], area = (x0,y0,x1,y1)
    of the writing area as fractions of the paper. Returns the placed paper's box."""
    p = fit_w(paper, w).copy(); d = ImageDraw.Draw(p)
    x0, y0, x1, y1 = area or (pad, pad, 1 - pad, 1 - pad)
    total = sum(px * 1.18 for _, _, px, _ in lines); y = p.height * (y0 + y1) / 2 - total / 2
    tw = max(d.textlength(t, font=F(f_, px)) for t, f_, px, _ in lines)
    for text, font, px, col in lines:
        d.text((p.width * (x0 + x1) / 2, y + px * 0.59), text, font=F(font, px), fill=col + (255,), anchor='mm'); y += px * 1.18
    box = place(img, shadowed(p, (6, 12), 10, 80), c, rot)
    dx, dy = p.width * ((x0 + x1) / 2 - 0.5), p.height * ((y0 + y1) / 2 - 0.5); t = math.radians(-rot)
    tx, ty = c[0] + dx * math.cos(t) - dy * math.sin(t), c[1] + dx * math.sin(t) + dy * math.cos(t)
    zone((tx - tw / 2, ty - total / 2, tx + tw / 2, ty + total / 2), ' / '.join(t_ for t_, *_ in lines)); return box

# ---- f2 Round the clock (about 30 s): a day in my business --------------------------------------------------------------
CLOCK_C, CLOCK_R, FACE_R = (624, 614), 588, 478      # measured on 'Handless vintage brass wall clock-24.png'

def clock(face, d):
    """The real brass clock at diameter d, its face replaced by `face` (an RGBA square, the clip or clips)."""
    im = src('Handless vintage brass wall clock-24.png').convert('RGBA')
    cx, cy = CLOCK_C; sq = im.crop((cx - CLOCK_R, cy - CLOCK_R, cx + CLOCK_R, cy + CLOCK_R))
    m = Image.new('L', sq.size, 0); ImageDraw.Draw(m).ellipse((2, 2, sq.width - 3, sq.height - 3), fill=255); sq.putalpha(m)
    if face is not None:
        fd = 2 * FACE_R; fc = disc(face, fd); sq.alpha_composite(fc, (CLOCK_R - FACE_R, CLOCK_R - FACE_R))
    return sq.resize((int(d), int(d)), Image.LANCZOS)

def wedges(clips, active, start=-90):
    """The clock face cut into len(clips) wedges, each playing its own clip; the active wedge bright, the rest dimmed."""
    n = len(clips); d = 2 * FACE_R; face = Image.new('RGBA', (d, d))
    for i, ci in enumerate(clips):
        v = ImageOps.fit(clip(ci), (d, d)); v = v if i == active else dim(v, 0.5)
        m = Image.new('L', (d, d), 0); a0 = start + 360 * i / n
        ImageDraw.Draw(m).pieslice((0, 0, d - 1, d - 1), a0, a0 + 360 / n, fill=255); face.paste(v, (0, 0), m)
    d_ = ImageDraw.Draw(face)
    for i in range(n):                                    # thin brass seams between the wedges
        t = math.radians(start + 360 * i / n); d_.line((d / 2, d / 2, d / 2 + d * math.cos(t), d / 2 + d * math.sin(t)), fill=(150, 112, 52, 255), width=10)
    return face

def hands():
    im = cut('Vintage dark brass clock hands-29.png'); w = im.width
    return [x.crop(x.getbbox()) for x in (im.crop((0, 0, w // 2, im.height)), im.crop((w // 2, 0, w, im.height)))]

def hand_at(img, which, length, angle, pivot):
    """Place a real clock hand pointing at `angle` (0 = 12 o'clock, clockwise) with its ring on the pivot."""
    h = hands()[which]; h = h.resize((int(h.width * length / h.height), int(length)), Image.LANCZOS)
    ring = h.width / 2; pad = Image.new('RGBA', (h.width, int(2 * (h.height - ring))), (0, 0, 0, 0)); pad.alpha_composite(h, (0, 0))
    place(img, shadowed(pad, (6, 10), 6, 110), pivot, -angle)

def tag(img, c, w, lines, rot=0):
    return on_paper(img, cut('Blank kraft gift tag with twine-34.png', holes=True), c, w, lines, rot, area=(0.12, 0.48, 0.88, 0.92))

def wood(): return tex('Warm weathered barn wood texture-24.png', (W, H))

def cutout_letters(word, px):
    """f2's built-in words: magazine cut-out letters, each on its own scrap (kraft, cream card, brass-dark wood)."""
    scraps = [((196, 160, 116), INK), ((250, 242, 222), INK), ((58, 40, 28), CREAM), ((232, 112, 34), CREAM)]
    fonts = [ALFA, CORBEN, ALFA, COINY]
    out, x, hh = [], 0, int(px * 1.5); r = random.Random(sum(map(ord, word)))
    for i, ch in enumerate(word):
        if ch == ' ': x += px * 0.4; continue
        bg, fg = scraps[(i * 3 + 1) % 4]; f = F(fonts[i % 4], px * r.uniform(0.86, 1.05))
        l, t, rr, b = f.getbbox(ch, anchor='mm'); w = int(rr - l + px * 0.34)
        s = C.paper((w, hh), bg, seed=i + 7, grain=6); d = ImageDraw.Draw(s)
        d.text((w / 2, hh / 2), ch, font=f, fill=fg + (255,), anchor='mm')
        poly = [(r.randint(0, 9), r.randint(0, 9)), (w - r.randint(0, 9), r.randint(0, 9)), (w - r.randint(0, 9), hh - r.randint(0, 9)), (r.randint(0, 9), hh - r.randint(0, 9))]
        m = Image.new('L', s.size, 0); ImageDraw.Draw(m).polygon(poly, fill=255); s.putalpha(m)
        out.append((shadowed(s, (4, 7), 5, 90).rotate(r.uniform(-7, 7), expand=True, resample=Image.BICUBIC), x + w / 2)); x += w + px * 0.04
    im = Image.new('RGBA', (int(x + px), int(hh * 1.4)), (0, 0, 0, 0))
    for p, cx in out: im.alpha_composite(p, (int(cx + px / 2 - p.width / 2), int(im.height / 2 - p.height / 2)))
    return im.crop(im.getbbox())

def cut_hero(img, c, word, px, rot=0):
    it = cutout_letters(word, px)
    it = fit_w(it, min(it.width, max_w(c, it.height)))
    zone(place(img, it, c, rot), word)

def pen(img, c, w, rot): place(img, shadowed(fit_w(cut('Dark Brown Vintage Fountain Pen-22.png'), w), (10, 16), 10, 90), c, rot)

def f2():
    fr = []
    # 1 hook: the clock, oversized, its face already playing clip 1; the hands spin
    im = wood(); ck = clock(clip(0), 1500); place(im, shadowed(ck, (14, 24), 20, 120), (540, 1130))
    piv = (540, 1130)
    for k, a in enumerate((200, 230, 255, 275)):     # a fast spin: the real minute hand, fading copies behind it
        tmp = Image.new('RGBA', (W, H)); hand_at(tmp, 1, 520, a, piv)
        tmp.putalpha(tmp.split()[3].point(lambda v, k=k: int(v * (0.25 + 0.25 * k)))); im.alpha_composite(tmp)
    hand_at(im, 0, 360, 60, piv)
    cut_hero(im, (540, 340), 'WHERE DOES', 120, -2); cut_hero(im, (540, 520), 'MY DAY GO?', 130, 2)
    fr.append(('1 hook - the clock spins, its face is already clip 1', im))
    # 2 7 am: the hands stop, the face is clip 1; a kraft tag swings in, the pen has just written on it
    im = wood(); ck = clock(clip(0), 1240); place(im, shadowed(ck, (14, 24), 20, 120), (540, 1080))
    hand_at(im, 0, 300, 210, (540, 1080)); hand_at(im, 1, 430, 0, (540, 1080))
    ImageDraw.Draw(im).line((250, 0, 262, 300), fill=(170, 140, 100, 255), width=5)
    tag(im, (300, 470), 400, [('7 AM', MONT, 74, INK), ('coffee + orders', HAND, 50, INK)], 8)
    pen(im, (520, 560), 420, 35)
    fr.append(('2 7 am - the hands stop, a kraft tag swings in, the pen writes', im))
    # 3 push through the face: clip 1 fills the screen, the brass rim slides past the edges
    im = clip(0).copy(); ck = clock(clip(0), 2700); place(im, ck, (540, 960))
    fr.append(('3 we push through the clock face into clip 1', im))
    # 4 the minute hand sweeps across as the wipe: clip 1 on one side, clip 2 on the other
    im = clip(1).copy(); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W, 0), (W, 180), (0, 1500)], fill=255)
    im.paste(clip(0), (0, 0), m)
    hand_at(im, 1, 2000, 39, (-40, 1560))
    tag(im, (330, 1080), 380, [('10 AM', MONT, 70, INK), ('packing day', HAND, 48, INK)], -6)
    fr.append(('4 the giant minute hand sweeps across - the wipe to clip 2', im))
    # 5 intermission: NOON, huge, on barn wood; the little clock with both hands up
    im = wood(); ck = clock(None, 560); place(im, shadowed(ck, (10, 18), 14, 120), (540, 560)); hand_at(im, 0, 150, 0, (540, 560)); hand_at(im, 1, 220, 0, (540, 560))
    cut_hero(im, (540, 1060), 'NOON', 300, -3); say(im, (540, 1330), '(lunch? what lunch)', 64, CREAM)
    fr.append(('5 intermission - NOON, huge, the point of the Reel lands', im))
    # 6 the afternoon is a wheel of clips: 3 wedges, the hands sweep from wedge to wedge
    im = wood(); ck = clock(wedges([1, 2, 3], 0), 1100); place(im, shadowed(ck, (14, 24), 20, 120), (540, 900))
    hand_at(im, 0, 260, 150, (540, 900)); hand_at(im, 1, 400, 60, (540, 900))
    for c, t, r in (((870, 310), '1 PM', 8), ((180, 1180), '5 PM', -8), ((790, 1230), '3 PM', 6)):
        tag(im, c, 250, [(t, MONT, 58, INK)], r)
    fr.append(('6 the afternoon as a wheel of clips - each wedge plays its own', im))
    # 7 the active wedge swings out to fill the frame
    im = clip(1).copy(); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).pieslice((-1800, -1500, 2200, 3000), -128, 2, fill=255)
    big = clip(2); im.paste(big, (0, 0), m.filter(ImageFilter.GaussianBlur(1)))
    ImageDraw.Draw(im).arc((-1800, -1500, 2200, 3000), -128, 2, fill=(150, 112, 52, 255), width=16)
    ImageDraw.Draw(im).line((200, 750, W, 750), fill=(150, 112, 52, 255), width=14)
    tag(im, (300, 1080), 360, [('3 PM', MONT, 70, INK), ('the fun part', HAND, 48, INK)], -5)
    fr.append(('7 the 3 pm wedge swings out to fill the screen', im))
    # 8 evening: clip 4; the real alarm clock rings in the corner
    im = clip(3).copy(); ac = fit_w(cut('Classic cream twin-bell alarm clock-57.png'), 620); place(im, shadowed(outline(ac, CREAM, 8, 14, 3)), (190, 1660), 14)
    for i, (c, r) in enumerate((((470, 1420), -20), ((60, 1270), 30))): place(im, fit_w(ink_piece('Playful hand-drawn burst asset sheet-2.png', 2, 3, 4, CREAM), 150), c, r)
    tag(im, (700, 430), 380, [('9 PM', MONT, 70, INK), ("that's a wrap", HAND, 48, INK)], 6)
    fr.append(('8 evening - the alarm clock rings, the last clip', im))
    # 9 CTA: zoom out to the whole clock on the wall, a tag on twine asks for the comment
    im = wood(); ck = clock(wedges([0, 1, 2, 3], 3), 820); place(im, shadowed(ck, (14, 24), 20, 120), (540, 640))
    hand_at(im, 0, 190, 300, (540, 640)); hand_at(im, 1, 300, 0, (540, 640))
    cut_hero(im, (540, 1080), 'COMMENT', 120, -2)
    on_paper(im, cut('Weathered blank farm-stand sign-35.png'), (470, 1560), 960, [('DAY', MONT, 150, ORANGE), ('for my routine', MONT, 58, CREAM)], 2, area=(0.06, 0.08, 0.94, 0.4))
    fr.append(('9 CTA - the whole day on the wall, comment DAY', im))
    return fr

# ---- f3 Falling for it (about 22 s): reviews ----------------------------------------------------------------------------
LEAVES = ['Red maple leaf tumbling in midair-3.png', 'Suspended orange maple leaf-4.png', 'Tumbling yellow birch leaf-12.png',
          'Floating brown oak leaf-7.png', 'Suspended red and golden maple leaf-16.png', 'Suspended curled brown leaf-14.png',
          'Tumbling orange maple leaf-6.png', 'Suspended yellow birch leaf-10.png', 'Tumbling red and golden maple leaf-18.png',
          'Red maple leaf in midair-2.png', 'Suspended Two-Tone Maple Leaf-17.png', 'Tumbling brown oak leaf on white-9.png']
def leaf(i, w, rot=0): return fit_w(cut(LEAVES[i % len(LEAVES)]), w)
def forest(): return tex('Misty amber autumn forest backdrop-32.png', (W, H))

def drift(im, n, seed, wmin, wmax, area=(0, 0, W, H), avoid=None):
    r = random.Random(seed)
    for k in range(n):
        x, y = r.uniform(area[0], area[2]), r.uniform(area[1], area[3])
        if avoid and avoid[0] < x < avoid[2] and avoid[1] < y < avoid[3]: continue
        place(im, shadowed(leaf(r.randrange(99), r.uniform(wmin, wmax)), (8, 14), 8, 70), (x, y), r.uniform(-180, 180))

def review_card(im, c, w, quote, who, rot, paper='Blank ivory recipe card-33.png'):
    box = on_paper(im, cut(paper, 6 if 'note card' in paper else 26, 'tag' in paper), c, w, [(quote, HAND, 56, INK), (who, MONT, 40, (120, 72, 40))], rot, area=(0.08, 0.2, 0.92, 0.9))
    for k in range(5):                                 # five real gold foil stars along the top of the card
        place(im, fit_w(cut('Gold foil star sticker-95.png'), 74), (c[0] - 160 + k * 80, box[1] + 30), (k * 11) % 20 - 10)

def f3():
    fr = []
    leafy = tex_fill('Autumn path blanketed in leaves-30.png', k=1.2)
    # 1 hook: clip 1, a huge red maple tumbles across; the question in leaf-filled letters
    im = clip(0).copy()
    place(im, shadowed(fit_w(cut(LEAVES[0]), 1050)), (870, 1560), -24); place(im, shadowed(leaf(2, 260)), (150, 1260), 40); place(im, shadowed(leaf(3, 220)), (920, 330), -30)
    hero(im, (520, 560), 'WHY THEY', CORBEN, 150, leafy, edge=CREAM, stroke=11); hero(im, (520, 760), 'KEEP COMING', CORBEN, 128, leafy, edge=CREAM, stroke=11)
    hero(im, (520, 960), 'BACK', CORBEN, 190, leafy, edge=CREAM, stroke=12)
    fr.append(('1 hook - a huge maple leaf tumbles across clip 1', im))
    # 2 the leaves thicken over clip 1 as it fades into the misty forest
    im = Image.blend(clip(0), forest(), 0.45); drift(im, 34, 5, 150, 380)
    fr.append(('2 leaves thicken - clip 1 fades into the misty forest', im))
    # 3 review 1 lands on a recipe card among the leaves
    im = forest(); drift(im, 30, 9, 160, 360, avoid=(80, 520, 1000, 1150)); place(im, shadowed(fit_w(cut('Tall bare tree on white background-45.png'), 700)), (980, 700), -4)
    review_card(im, (520, 860), 900, '"Best thing I bought this fall"', '- Sam R.', -3)
    fr.append(('3 review 1 drifts in on a recipe card', im))
    # 4 the leaves thin out and clip 2 shows through; the card flutters away
    im = Image.blend(forest(), clip(1), 0.8); drift(im, 10, 13, 140, 300, area=(-100, -100, W + 100, 700)); drift(im, 6, 14, 140, 280, area=(-100, 1500, W + 100, H + 100))
    place(im, shadowed(fit_w(cut('Blank ivory recipe card-33.png'), 330)), (880, 260), 28)
    fr.append(('4 the leaves thin out - clip 2 shows through', im))
    # 5 split: clip 2 above, clip 3 below, a real leafy branch lies across the seam; review 2 on a note card
    im = clip(2).copy(); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W, 0), (W, 700), (0, 1140)], fill=255); im.paste(clip(1), (0, 0), m)
    place(im, shadowed(fit_w(cut('Red and gold autumn branch-75.png'), 1500), (10, 16), 10, 100), (560, 930), 22)
    review_card(im, (470, 470), 700, '"I ordered 3 more"', '- Jo, Texas', 4, 'Blank ivory note card-121.png')
    fr.append(('5 split - a leafy branch divides clip 2 and clip 3, review 2', im))
    # 6 a real leaf pile rises over clip 3; review 3 tucked into it; a bare tree drops its last leaves
    im = clip(2).copy(); place(im, shadowed(fit_w(cut('Tall bare tree on white background-45.png'), 820)), (1010, 640), 3)
    drift(im, 5, 21, 120, 220, area=(600, 300, 1080, 1100))
    place(im, fit_w(cut('Colorful autumn leaf mound on white-76.png'), 1700), (540, 1820))
    review_card(im, (380, 980), 520, '"Worth every penny"', '- Priya', -5, 'Blank kraft gift tag with twine-34.png')
    fr.append(('6 a leaf pile rises over clip 3 - review 3', im))
    # 7 CTA: the last clip inside a leaf-shaped window, leaves blowing past
    im = forest(); lw = fit_w(cut('Autumn maple leaf on white-39.png'), 1000); m = lw.split()[3].point(lambda v: 255 if v > 100 else 0).filter(ImageFilter.MinFilter(9))
    win = ImageOps.fit(clip(3), lw.size); win.putalpha(m); lw.alpha_composite(win); place(im, shadowed(outline(lw, CREAM, 9, 14, 7), (14, 22), 16, 120), (540, 760), -6)
    place(im, fit_w(on_black('Autumn Leaves Blowing Across Black-100.png'), 1500), (540, 1500), -12)
    hero(im, (540, 1240), 'COMMENT', CORBEN, 150, leafy, edge=CREAM, stroke=11); say(im, (540, 1385), 'FALL', 110, ORANGE, INK)
    fr.append(('7 CTA - the last clip in a leaf window, comment FALL', im))
    return fr

# ---- f4 Bob for it (about 15 s): pick your favourite --------------------------------------------------------------------
APPLES = ['Deep red apple on white-2.png', 'Red-gold streaked apple on white-1.png', 'Fresh green apple on white-3.png', 'Blush-red apple with green leaf-4.png']
APPLE_RED, DOT_CREAM = (178, 30, 34), (250, 236, 214)
def apple(i, w): return fit_w(cut(APPLES[i]), w)
def dots_fill(color=APPLE_RED):
    def f(w, h, i): return two_tone('Playful hand-painted dots on black-13.png', color, DOT_CREAM, (w * 2, h * 2)).resize((w, h))
    return f
def num_sticker(n, d=150):
    s = disc(two_tone('Playful hand-painted black polka dots-12.png', INK, DOT_CREAM, (int(d), int(d))), d)
    s2 = Image.new('RGBA', (int(d) + 24, int(d) + 24), (0, 0, 0, 0)); m = Image.new('L', s2.size, 0); ImageDraw.Draw(m).ellipse((0, 0, s2.width - 1, s2.height - 1), fill=255)
    wb = Image.new('RGBA', s2.size, WHITE + (255,)); wb.putalpha(m); s2.alpha_composite(wb); s2.alpha_composite(s, (12, 12))
    ImageDraw.Draw(s2).text((s2.width / 2, s2.height / 2), str(n), font=F(COINY, d * 0.62), fill=APPLE_RED + (255,), anchor='mm', stroke_width=7, stroke_fill=WHITE + (255,))
    return shadowed(s2, (4, 8), 6, 90)

def apple_window(i, w, n_clip):
    """The real apple with the clip playing inside it (the apple's own shape), its skin left as a rim."""
    a = apple(i, w).copy(); m = a.split()[3].point(lambda v: 255 if v > 100 else 0)
    inner = m.resize((m.width // 4, m.height // 4)).filter(ImageFilter.MinFilter(9)).resize(m.size).filter(ImageFilter.GaussianBlur(2))
    top = int(a.height * 0.2); inner.paste(0, (0, 0, a.width, top))            # keep the stem, leaf and shoulders as apple
    v = ImageOps.fit(clip(n_clip), a.size); v.putalpha(inner); a.alpha_composite(v); return outline(a, CREAM, 9, 14, i)

def plaid(): return tex('Rust-red and cream plaid blanket texture-7.png', (W, H))

def f4():
    fr = []
    bob = [(150, 1690, -10, 340), (420, 1730, 8, 330), (680, 1700, -6, 330), (930, 1740, 12, 360)]
    # 1 hook: four apples bob along the bottom of clip 1, numbered; the question in polka-dot letters
    im = clip(0).copy()
    for i, (x, y, r, w) in enumerate(bob):
        place(im, shadowed(outline(apple(i, w), CREAM, 8, 12, i)), (x, y), r); place(im, num_sticker(i + 1, 110), (x + 90, y - 150), r)
    hero(im, (540, 520), 'WHICH ONE', COINY, 150, dots_fill(), edge=CREAM, stroke=12); hero(im, (540, 740), 'ARE YOU?', COINY, 170, dots_fill(), edge=CREAM, stroke=12)
    fr.append(('1 hook - four numbered apples bob along clip 1', im))
    # 2 apple 1 dunks: a real splash
    im = clip(0).copy()
    for i, (x, y, r, w) in list(enumerate(bob))[1:]: place(im, shadowed(outline(apple(i, w), CREAM, 8, 12, i)), (x, y + 30 * (i % 2)), -r)
    place(im, fit_w(on_black('Crystal Clear Splash on Black-132.png', 1.6, 0.9), 900), (200, 1600))
    a1 = apple(0, 340); a1 = a1.crop((0, 0, a1.width, int(a1.height * 0.45))); place(im, shadowed(a1), (150, 1700), -6)
    say(im, (430, 1200), 'No. 1', 120, WHITE, INK, -4)
    fr.append(('2 apple 1 dunks - splash', im))
    # 3 apple 1 pops up huge as a window: clip 2 plays inside the apple
    im = plaid(); place(im, shadowed(apple_window(0, 1080, 1), (16, 26), 20, 130), (540, 940), -4); place(im, num_sticker(1, 170), (200, 420), -8)
    say(im, (560, 1420), 'the classic', 92, WHITE, APPLE_RED, -3)
    fr.append(('3 it pops up huge - clip 2 plays inside the apple', im))
    # 4 roll: apple 1 rolls off left as apple 2 rolls in with clip 3
    im = plaid(); place(im, shadowed(apple_window(0, 900, 1), (16, 26), 20, 130), (-120, 1000), 38)
    place(im, shadowed(apple_window(1, 1000, 2), (16, 26), 20, 130), (660, 930), -18); place(im, num_sticker(2, 170), (860, 380), 10)
    say(im, (560, 1370), 'the sweet one', 92, WHITE, APPLE_RED, 3)
    fr.append(('4 apple 1 rolls out, apple 2 rolls in with clip 3', im))
    # 5 polka-dot wipe: a band of hand-painted dots sweeps across into clip 4 (apple 3)
    im = clip(3).copy(); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W, 0), (W, 120), (0, 980)], fill=255); im.paste(clip(2), (0, 0), m)
    band = two_tone('Playful hand-painted black dots-14.png', APPLE_RED, DOT_CREAM, (1700, 560)); bm = Image.new('L', band.size, 0); ImageDraw.Draw(bm).rectangle((0, 0, band.width, band.height), fill=255); band.putalpha(bm)
    place(im, band, (540, 640), 38)
    place(im, shadowed(outline(apple(2, 420), CREAM, 8, 12, 5)), (860, 1640), 12); place(im, num_sticker(3, 150), (700, 1500), -6)
    say(im, (430, 1320), 'the sour one', 92, WHITE, (76, 130, 40), -3)
    fr.append(('5 a polka-dot band wipes across to apple 3', im))
    # 6 CTA: all four apple windows in a row on the real crate, each playing its clip
    im = plaid(); place(im, shadowed(fit_w(cut('Empty wooden apple crate on white-42.png'), 1300), (12, 20), 16, 120), (540, 1690))
    for i, x in enumerate((150, 400, 660, 920)):
        place(im, shadowed(apple_window(i, 300, i)), (x, 1230 + (i % 2) * 30), (-8, 6, -4, 9)[i]); place(im, num_sticker(i + 1, 90), (x, 1030), 0)
    hero(im, (540, 470), 'COMMENT', COINY, 150, dots_fill(), edge=CREAM, stroke=12); say(im, (540, 700), 'your number', 100, WHITE, APPLE_RED)
    fr.append(('6 CTA - all four on the crate, comment your number', im))
    return fr

# ---- f6 Burning questions (about 30 s): FAQ before buying ---------------------------------------------------------------
def fire_fill(w, h, i):
    im = src('Golden Bonfire on Black-35.png').convert('RGBA').crop((300, 380, 980, 900))
    return ImageOps.fit(im, (w, h), centering=((i * 0.31) % 1, 0.5))
def night(): return Image.new('RGBA', (W, H), (14, 10, 8, 255))
def embers(im, a=1.0):
    e = fit_w(on_black('Embers rising through the dark-97.png', 1.8, 0.9), W)
    if a < 1: e.putalpha(e.split()[3].point(lambda v: int(v * a)))
    im.alpha_composite(ImageOps.fit(e, (W, H)))
def bonfire(im, w, c): place(im, fit_w(on_black('Golden Bonfire on Black-35.png', 1.5, 0.75), w), c)
def q_card(im, c, w, q, rot):
    return on_paper(im, cut('Blank ivory note card-121.png', 6), c, w, [('Q:', MONT, 80, ORANGE), (q, MONT, 46, INK)], rot, area=(0.08, 0.12, 0.92, 0.88))

def f6():
    fr = []
    burn = dict(edge=INK, stroke=10, glow=(255, 140, 40))
    # 1 hook: clip 1 with a real bonfire roaring in front of it, embers rising; fire-filled letters
    im = clip(0).copy(); bonfire(im, 1500, (540, 1760)); embers(im, 0.45)
    hero(im, (540, 470), 'BURNING', DYNA, 190, fire_fill, **burn); hero(im, (540, 700), 'QUESTIONS', DYNA, 150, fire_fill, **burn)
    fr.append(('1 hook - a bonfire in front of clip 1, embers rising', im))
    # 2 question 1 rises from the fire on a note card
    im = clip(0).copy(); bonfire(im, 1400, (540, 1800)); embers(im, 0.35); q_card(im, (520, 900), 860, 'Does it work for beginners?', -5)
    fr.append(('2 question 1 rises out of the fire on a note card', im))
    # 3 the answer: clip 2, a warm light flare sweeps across, the card flies up and away with the embers
    im = clip(1).copy(); place(im, fit_w(on_black('Amber glow on black-101.png', 1.6), 1900), (380, 360), -18); embers(im, 0.5)
    place(im, shadowed(fit_w(cut('Blank ivory note card-121.png', 6), 300)), (880, 260), 24)
    say(im, (480, 1300), 'A: yes! here\'s how', 80, WHITE, INK, -3)
    fr.append(('3 the answer - clip 2, a warm flare sweeps across', im))
    # 4 fire takeover: the flames rise and fill the screen, carrying clip 2 into clip 3
    im = clip(1).copy(); bonfire(im, 2600, (540, 1650)); embers(im, 1.0)
    fr.append(('4 the flames rise and take over the screen', im))
    # 5 split: the real lit candle on the left, clip 3 on the right; question 2
    im = night(); cd = ImageOps.fit(src('Glowing Ivory Candle in Glass Jar-96.png').convert('RGBA'), (560, H), centering=(0.5, 0.6)); im.alpha_composite(cd, (-40, 0))
    v = ImageOps.fit(clip(2), (600, H)); m = Image.new('L', v.size, 0); ImageDraw.Draw(m).polygon([(80, 0), (600, 0), (600, H), (0, H)], fill=255); im.paste(v, (480, 0), m)
    q_card(im, (560, 520), 760, 'How long does it take?', 4); embers(im, 0.4)
    fr.append(('5 split - the real candle and clip 3, question 2', im))
    # 6 answer 2: clip 3 full, fog drifting low
    im = clip(2).copy(); place(im, fit_w(on_black('Whispers of fog on black-99.png', 1.3), 1800), (540, 1600)); embers(im, 0.4)
    say(im, (500, 420), 'A: about a week', 82, WHITE, INK, 3)
    fr.append(('6 answer 2 - clip 3, fog drifting low', im))
    # 7 intermission: the big one, huge fire letters on the night, question 3 below
    im = night(); place(im, fit_w(on_black('Whispers of fog on black-99.png', 1.2), 2000), (540, 1700)); embers(im, 1.0)
    hero(im, (540, 520), 'AND THE', DYNA, 150, fire_fill, **burn); hero(im, (540, 760), 'BIG ONE', DYNA, 210, fire_fill, **burn)
    q_card(im, (540, 1220), 760, 'Is it worth the price?', -3)
    fr.append(('7 intermission - and the big one, question 3', im))
    # 8 answer 3: clip 4, a real s'more stacks itself in the corner
    im = clip(3).copy(); sm = cut('Separated s’more components on white-40.png'); sm = fit_w(sm, 460)
    place(im, shadowed(outline(sm, CREAM, 8, 12, 4)), (850, 1600), 8)
    say(im, (500, 420), 'A: 100% (here\'s why)', 76, WHITE, INK, -3)
    fr.append(('8 answer 3 - clip 4, a real smore stacks itself', im))
    # 9 CTA: the last clip in a round glowing window above the fire
    im = night(); bonfire(im, 1400, (540, 1780)); embers(im, 0.7)
    g = fit_w(on_black('Amber glow on black-101.png', 1.4), 1600); place(im, g, (540, 820))
    place(im, shadowed(outline(disc(clip(4), 700), (255, 196, 120), 9, 14, 2), (0, 16), 24, 140), (540, 760))
    hero(im, (540, 1240), 'COMMENT', DYNA, 130, fire_fill, **burn); say(im, (540, 1400), 'ASK', 110, ORANGE, INK)
    fr.append(('9 CTA - the last clip glowing above the fire, comment ASK', im))
    return fr

# ---- f7 Pick your brew (about 15 s): my routine with it, or 3 ways to use it ---------------------------------------------
CUPS = {'plain': 'Minimalist top-down ivory latte-49.png', 'heart': 'Classic heart latte art-19.png',
        'rosetta': 'Rosetta latte in an ivory cup-20.png', 'tulip': 'Tulip latte art on brown crema-21.png',
        'matcha': 'Top-down matcha latte on ivory saucer-50.png'}
def foam_circle(im):
    """Find the drink's surface (the coloured circle inside the white cup) on the photo."""
    s = im.convert('HSV').split()[1].point(lambda v: 255 if v > 70 else 0).filter(ImageFilter.MedianFilter(9))
    x0, y0, x1, y1 = s.getbbox(); r = min(x1 - x0, y1 - y0) / 2
    return ((x0 + x1) / 2, (y0 + y1) / 2, r)

def cup(kind, w, n_clip=None, art=0.0, rim=0.97):
    """The real cup from above at width w; with n_clip the clip plays in the drink, `art` of the latte art left on top."""
    im = cut(CUPS[kind], tol=8).copy()
    if n_clip is not None:
        cx, cy, r = foam_circle(cut(CUPS[kind], tol=8)); r *= rim; d = int(2 * r)
        v = disc(clip(n_clip), d)
        if art:
            a = im.crop((int(cx - r), int(cy - r), int(cx - r) + d, int(cy - r) + d)); a.putalpha(v.split()[3].point(lambda x: int(x * art))); v.alpha_composite(a)
        im.alpha_composite(v, (int(cx - r), int(cy - r)))
    return fit_w(im, w)

def steam(im, c, w, a=1.0):
    s = fit_w(on_black('Delicate Steam on Black Space-98.png', 1.5, 0.8), w)
    if a < 1: s.putalpha(s.split()[3].point(lambda v: int(v * a)))
    place(im, s, c)
def cord(): return tex('Rust orange corduroy texture-26.png', (W, H))
def foam_fill(name='Minimalist top-down ivory latte-49.png'):
    def f(w, h, i):
        im = src(name).convert('RGBA'); cx, cy, r = foam_circle(cut(name, tol=8)); return ImageOps.fit(im.crop((int(cx - r * 0.7), int(cy - r * 0.7), int(cx + r * 0.7), int(cy + r * 0.7))), (w, h))
    return f
def spices(im, pts):
    for k, (c, r, w) in enumerate(pts):
        name = 'Twine-Tied Cinnamon Stick Bundle-55.png' if k % 3 == 0 else 'Whole star anise on white-56.png'
        place(im, shadowed(fit_w(cut(name), w)), c, r)

def f7():
    fr = []
    foam = dict(edge=(92, 52, 30), stroke=11)
    # 1 hook: a huge latte from above; its heart art is melting into clip 1; steam rises; the question in foam letters
    im = cord(); place(im, shadowed(cup('heart', 1500, 0, art=0.55), (16, 26), 22, 120), (590, 1150)); steam(im, (400, 520), 900, 0.8)
    spices(im, [((140, 1780), 30, 380), ((980, 1720), 20, 200)])
    hero(im, (540, 330), 'HOW DO YOU', BOUNCE, 130, foam_fill(), **foam); hero(im, (540, 520), 'TAKE YOURS?', BOUNCE, 140, foam_fill(), **foam)
    fr.append(('1 hook - the latte art melts into clip 1', im))
    # 2 clip 1 plays in the cup; tag 1
    im = cord(); place(im, shadowed(outline(cup('heart', 1180, 0), CREAM, 9, 16, 2), (16, 26), 22, 120), (560, 1060)); steam(im, (620, 420), 700, 0.7)
    spices(im, [((960, 1690), -25, 300), ((130, 1540), 15, 170)])
    tag(im, (250, 420), 380, [('No. 1', MONT, 70, INK), ('the quick one', HAND, 48, INK)], -7)
    fr.append(('2 clip 1 plays in the cup - no. 1', im))
    # 3 we dive into the cup: clip 1 fills the screen, the rim slides past the corners
    im = clip(0).copy(); place(im, cup('heart', 3500, 0), (560, 960))
    fr.append(('3 we dive into the cup - clip 1 full screen', im))
    # 4 slide: cup 1 slides out left as the rosetta cup slides in with clip 2 (its art melting)
    im = cord(); place(im, shadowed(cup('heart', 1000, 0)), (-180, 760), 0)
    place(im, shadowed(outline(cup('rosetta', 1150, 1, art=0.35), CREAM, 9, 16, 5), (16, 26), 22, 120), (640, 1150)); steam(im, (700, 560), 600, 0.6)
    tag(im, (330, 1300), 360, [('No. 2', MONT, 66, INK), ('the cozy one', HAND, 46, INK)], 5)
    fr.append(('4 cup 1 slides out, the rosetta cup slides in with clip 2', im))
    # 5 the twist: a matcha slides in with clip 3; huge matcha-foam letters
    im = cord(); place(im, shadowed(outline(cup('matcha', 1250, 2, rim=0.93), CREAM, 9, 16, 8), (16, 26), 22, 120), (540, 1200))
    hero(im, (540, 340), 'PLOT', BOUNCE, 170, foam_fill('Top-down matcha latte on ivory saucer-50.png'), edge=(40, 60, 24), stroke=11)
    hero(im, (540, 540), 'TWIST', BOUNCE, 190, foam_fill('Top-down matcha latte on ivory saucer-50.png'), edge=(40, 60, 24), stroke=11)
    fr.append(('5 the twist - a matcha slides in with clip 3', im))
    # 6 CTA: the three cups, each playing its clip, and a takeaway cup with the keyword on its kraft sleeve
    im = cord()
    for kind, n, c in (('heart', 0, (790, 420)), ('rosetta', 1, (840, 900)), ('matcha', 2, (800, 1430))): place(im, shadowed(cup(kind, 470, n)), c)
    tw = fit_w(cut('Plain white takeaway coffee cup-45.png', 5), 640); twc = (330, 1080)
    sleeve = Image.new('RGBA', tw.size, (0, 0, 0, 0)); d = ImageDraw.Draw(sleeve); sy = tw.height * 0.58
    d.text((tw.width / 2, sy - 50), 'Comment', font=F(MONT, 64), fill=INK + (255,), anchor='mm'); d.text((tw.width / 2, sy + 40), 'LATTE', font=F(MONT, 104), fill=ORANGE + (255,), anchor='mm')
    tw.alpha_composite(sleeve); place(im, shadowed(outline(tw, CREAM, 9, 16, 11), (16, 26), 20, 130), twc, -4)
    zone((twc[0] - 180, twc[1] - tw.height * 0.08 - 60, twc[0] + 180, twc[1] + tw.height * 0.08 + 60), 'Comment LATTE')
    steam(im, (330, 560), 520, 0.7)
    fr.append(('6 CTA - all three cups, comment LATTE on the sleeve', im))
    return fr

def save(tid, frames):
    out = OUT / DIRS[tid] / 'storyboard'; out.mkdir(parents=True, exist_ok=True)
    for old in out.glob('*.jpg'): old.unlink()
    for n, f in frames: f.convert('RGB').save(out / f'{n}.jpg', quality=88)
    cols = len(frames); sheet = Image.new('RGB', (W * cols + 20 * (cols - 1), H + 140), (240, 236, 228)); d = ImageDraw.Draw(sheet)
    for i, (n, f) in enumerate(frames):
        sheet.paste(f.convert('RGB'), (i * (W + 20), 140)); d.text((i * (W + 20) + 10, 30), n[:40], font=F(MONT, 48), fill=INK)
    sheet.resize((sheet.width // 3, sheet.height // 3), Image.LANCZOS).save(out / f'storyboard-{tid}.jpg', quality=88)
    print('saved', out)

if __name__ == '__main__':
    for tid in sys.argv[1:] or list(DIRS):
        fns = globals()[tid]
        frames = []
        orig_append = None
        FRAME[0] = tid
        save(tid, fns())
