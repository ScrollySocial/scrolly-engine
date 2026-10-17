"""Storyboard stills for the Halloween pack (h2 to h6), built from Mercedes's images (2026-10-17: ChatGPT-made props,
Pexels photos, her cloud, house, wolf and tree PNGs).
Round 2 applies all her round 1 notes (halloween/notes-round1.md): more video moments in every template, clear CTAs,
and a different Halloween-themed text look per template (no cream labels): moonlit glowing serif (h6), words hanging
on spider silk (h3), bold door-sign caps (h5), words carried by bats (h2), candle-glow carved serif (h4).
Fonts stay Bodoni Moda, Arial and Ink Free; key words use one accent colour buyers can change.
Usage: python build/storyboard_halloween.py [h2 h3 ...]  ->  halloween/hN-.../storyboard/
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import engine as E
import storyboard_02 as S          # footage(), place(), bordered(), F()
from props import cut_white

SRC = E.PACK / 'assets' / 'props' / 'source'
W, H = 1080, 1920
INK, WHITE, CREAM = (24, 23, 22), (255, 255, 255), (250, 244, 230)
ACCENT = (236, 120, 36)            # the one key-word colour (pumpkin orange); buyers swap it for their brand colour
SERIF, SANS, HAND = S.SERIF, S.SANS, S.HAND
BOLD = 'C:/Windows/Fonts/arialbd.ttf'
F = S.F
DIRS = {'h2': 'h2-batty-about', 'h3': 'h3-caught-in-our-web', 'h4': 'h4-whats-inside', 'h5': 'h5-trick-or-treat',
        'h6': 'h6-once-in-a-blood-moon'}

def src(name): return Image.open(SRC / name)
def cut(name, **k): return cut_white(src(name), **k)
def fit_w(im, w): return im.resize((int(w), int(im.height * w / im.width)), Image.LANCZOS)
def sticker(im, w=16): return S.bordered(im, WHITE, WHITE, w, 2)
def place(img, item, c, rot=0): S.place(img, item, c, rot)
def clip(n=0, size=(W, H)):
    clips = [('IMG_1439', 2.0), ('IMG_1439', 4.0), ('IMG_1447', 1.0), ('IMG_1385', 1.0), ('IMG_1460', 2.0)]
    c, t = clips[n % len(clips)]
    return S.footage(c, t, size)
def dim(im, k=0.7): return ImageEnhance.Brightness(im).enhance(k)

def disc(im, d):
    v = ImageOps.fit(im, (d, d)); m = Image.new('L', (d, d), 0); ImageDraw.Draw(m).ellipse((0, 0, d - 1, d - 1), fill=255)
    v.putalpha(m); return v

def round_clip(n, d, ring=14): return sticker(disc(clip(n), d), ring)

# ---- text looks ---------------------------------------------------------------------------------------------------------
def _layer(img, xy, text, font, fill, anchor='mm', stroke=0, stroke_fill=None):
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(lay).text(xy, text, font=font, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=stroke_fill)
    return lay

def halo(img, lay, color, blur, strength=1.0):
    g = Image.new('RGBA', img.size, color + (0,)); g.putalpha(lay.split()[3].filter(ImageFilter.GaussianBlur(blur)).point(lambda v: min(255, int(v * strength))))
    img.alpha_composite(g)

def glow_text(img, xy, text, font, fill, glow, blur=18, strength=1.6, anchor='mm'):
    """Moonlit / candle-lit words: the letters with a soft coloured glow behind them."""
    lay = _layer(img, xy, text, font, fill, anchor)
    halo(img, lay, glow, blur, strength); halo(img, lay, glow, blur // 3 + 1, 1.0); img.alpha_composite(lay)

def sign_text(img, xy, text, px, fill=WHITE, rot=0):
    """Door-sign caps: Arial Bold, thick black outline and a hard drop shadow."""
    font = F(BOLD, px); sw = max(4, px // 12)
    sh = _layer(img, (xy[0] + px // 14, xy[1] + px // 12), text, font, INK + (200,), stroke=sw, stroke_fill=INK + (200,))
    lay = _layer(img, xy, text, font, fill, stroke=sw, stroke_fill=INK)
    if rot: sh, lay = (l.rotate(rot, center=xy, resample=Image.BICUBIC) for l in (sh, lay))
    img.alpha_composite(sh); img.alpha_composite(lay)

def hand(img, xy, text, px=64, fill=WHITE, rot=0, shadow=True):
    lay = _layer(img, xy, text, F(HAND, px), fill)
    if rot: lay = lay.rotate(rot, center=xy, resample=Image.BICUBIC)
    if shadow: halo(img, lay, (0, 0, 0), 8, 0.9)
    img.alpha_composite(lay)

def silk_words(img, x, top, y, small, big, big_px=120, color=WHITE):
    """Words hanging on two spider-silk threads from `top` (h3)."""
    fb = F(SERIF, big_px); w = ImageDraw.Draw(img).textlength(big, font=fb)
    d = ImageDraw.Draw(img); bottom = y - big_px * 0.55 - (70 if small else 0)
    for dx in (-w / 3, w / 3): d.line((x + dx, top, x + dx, bottom), fill=(255, 255, 255, 210), width=3)
    if small: hand(img, (x, y - big_px * 0.55 - 25), small, 62, color)
    lay = _layer(img, (x, y + 10), big, fb, ACCENT); halo(img, lay, (0, 0, 0), 10, 1.0); img.alpha_composite(lay)

def bat_words(img, bat, c, small, big, bat_w=300, rot=0):
    """A bat carrying the words on two short threads (h2)."""
    b = sticker(fit_w(bat, bat_w), 10); place(img, b, c, rot)
    fb = F(BOLD, 96); w = ImageDraw.Draw(img).textlength(big, font=fb)
    ty = c[1] + b.height / 2 + 120
    d = ImageDraw.Draw(img)
    for dx in (-w / 3, w / 3): d.line((c[0] + dx * 0.3, c[1] + b.height / 3, c[0] + dx, ty - 60), fill=INK + (255,), width=4)
    lay = _layer(img, (c[0], ty), big, fb, ACCENT, stroke=7, stroke_fill=WHITE); halo(img, lay, (0, 0, 0), 10, 0.8); img.alpha_composite(lay)
    if small: hand(img, (c[0], ty + 100), small, 60, WHITE)

# ---- props --------------------------------------------------------------------------------------------------------------
def biggest_piece(im):
    """Keep only the largest blob of an RGBA crop (drops slivers of neighbouring candy)."""
    k = 4; m = im.split()[3].point(lambda v: 255 if v > 60 else 0).resize((im.width // k + 1, im.height // k + 1))
    Wm, Hm = m.size; p = m.load(); seen = set(); best = []
    for y in range(Hm):
        for x in range(Wm):
            if p[x, y] and (x, y) not in seen:
                st = [(x, y)]; seen.add((x, y)); comp = []
                while st:
                    a, b = st.pop(); comp.append((a, b))
                    for c2, d2 in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                        if 0 <= c2 < Wm and 0 <= d2 < Hm and p[c2, d2] and (c2, d2) not in seen: seen.add((c2, d2)); st.append((c2, d2))
                if len(comp) > len(best): best = comp
    keep = Image.new('L', (Wm, Hm), 0); kp = keep.load()
    for a, b in best: kp[a, b] = 255
    keep = keep.filter(ImageFilter.MaxFilter(3)).resize(im.size)
    out = im.copy(); out.putalpha(ImageChops.multiply(im.split()[3], keep)); return out.crop(out.getbbox())

def candy():
    """Whole candy corn and the blue gummy worm (the pieces Mercedes kept), each cut out cleanly."""
    sheet = src('Colorful Candy Collection PNG Asset Sheet-2.png').convert('RGBA'); k = 1536 / 900
    corn = biggest_piece(sheet.crop((int(185 * k), int(180 * k), int(345 * k), int(362 * k))))
    worm = sheet.crop((int(10 * k), int(350 * k), int(305 * k), int(555 * k)))
    r, g, b, a = worm.split()
    blue = ImageChops.subtract(b, r).point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
    worm.putalpha(ImageChops.multiply(a, blue)); worm = biggest_piece(worm)
    return corn, worm

def white_on_clear(name, color=INK):
    """A black-line or black-silhouette PNG on white -> the dark parts, cut out, in `color`."""
    g = ImageOps.grayscale(src(name).convert('RGB'))
    a = g.point(lambda v: 255 if v < 90 else (0 if v > 200 else (200 - v) * 255 // 110))
    out = Image.new('RGBA', g.size, color + (255,)); out.putalpha(a); return out.crop(out.getbbox())

def house_glowing():
    im = cut('Whimsical Haunted House Silhouette.png', tol=40); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a > 0 and r > 150: px[x, y] = (255, 196, 92, a)
    return im

def moon_disc(d):
    """The real full moon, cut tight inside its rim so no dark ring shows."""
    im = src('pexels-lucaspezeta-8488394.jpg').convert('RGB')
    g = ImageOps.grayscale(im); bb = g.point(lambda v: 255 if v > 110 else 0).getbbox()
    cx, cy, r = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2, min(bb[2] - bb[0], bb[3] - bb[1]) / 2 * 0.975
    m = im.crop((int(cx - r), int(cy - r), int(cx + r), int(cy + r))).resize((d, d), Image.LANCZOS).convert('RGBA')
    a = Image.new('L', (d, d), 0); ImageDraw.Draw(a).ellipse((3, 3, d - 4, d - 4), fill=255); m.putalpha(a.filter(ImageFilter.GaussianBlur(2.5)))
    return m

def blood(moon):
    """Ombre blood moon: the moon's own texture, graded warm orange at the top to deep red at the bottom."""
    d = moon.width; g = ImageOps.autocontrast(ImageOps.grayscale(moon.convert('RGB')), cutoff=1)
    top, bot = (255, 176, 96), (176, 34, 24)
    grad = Image.new('RGB', (1, d)); gp = grad.load()
    for y in range(d):
        t = y / (d - 1); gp[0, y] = tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3))
    grad = grad.resize((d, d))
    lum = g.point(lambda v: int(150 + v * 0.42))
    out = ImageChops.multiply(grad, Image.merge('RGB', (lum, lum, lum))).convert('RGBA'); out.putalpha(moon.split()[3]); return out

def moon_glow(img, d, xy, colors=((255, 150, 70), (200, 40, 30)), blur=90):
    """A soft ombre halo around the moon (no hard border)."""
    pad = blur * 3; size = d + 2 * pad
    halo_ = Image.new('RGBA', (size, size), (0, 0, 0, 0)); hp = ImageDraw.Draw(halo_)
    for i, c in enumerate(colors):
        r = d / 2 + 30 - i * 10; hp.ellipse((size / 2 - r, size / 2 - r + i * 30, size / 2 + r, size / 2 + r + i * 30), fill=c + (150,))
    img.alpha_composite(halo_.filter(ImageFilter.GaussianBlur(blur)), (xy[0] - pad, xy[1] - pad))

def night_sky():
    sky = ImageOps.fit(src('pexels-ev4r137-39335277.jpg').convert('RGB'), (W, H), centering=(0.0, 0.5)).convert('RGBA')
    return ImageEnhance.Brightness(sky).enhance(0.8)

def clouds(w): return fit_w(src('Ethereal Wispy Cloud Overlay.png').convert('RGBA'), w)

def web_layers():
    """The web line art, white on clear, plus a mask of its 12 straight spokes (measured: every 30 degrees)."""
    web = white_on_clear('Intricate Symmetrical Spiderweb Illustration.png', WHITE)
    cx, cy = web.width / 2, web.height / 2; R = max(web.size)
    spokes = Image.new('L', web.size, 0); d = ImageDraw.Draw(spokes)
    for a in range(0, 360, 30):
        t = math.radians(a); d.line((cx, cy, cx + R * math.cos(t), cy + R * math.sin(t)), fill=255, width=16)
    return web, spokes.filter(ImageFilter.GaussianBlur(2))

def masked(im, m):
    out = im.copy(); out.putalpha(ImageChops.multiply(im.split()[3], m.resize(im.size))); return out

# ---- h6 Once in a blood moon --------------------------------------------------------------------------------------------
def h6():
    sky = night_sky(); D = 1000; moon = moon_disc(D); bm = blood(moon); cl = clouds(1800)
    house, wolf = house_glowing(), white_on_clear('Howling Wolf Silhouette.png', (12, 10, 14))
    tree = src('Twisted Haunted Tree Silhouette.png').convert('RGBA'); bat = cut('Cute Kawaii Bat with Spread Wings.png')
    mp = ((W - D) // 2, 640)
    def moonlit(im, t1, t2=None, big_px=200, y=330):
        if t2: hand(im, (W / 2, y - 130), t1, 96, CREAM); glow_text(im, (W / 2, y + 30), t2, F(SERIF, big_px), ACCENT, (255, 140, 60))
        else: glow_text(im, (W / 2, y), t1, F(SERIF, big_px), CREAM, (255, 230, 200), 22, 1.3)
    def white_moon(im): moon_glow(im, D, mp, ((255, 240, 220), (220, 220, 230)), 70); im.alpha_composite(moon, mp)
    def red_moon(im, video=None, tint=0.22):
        moon_glow(im, D, mp)
        if video is None: im.alpha_composite(bm, mp); return
        v = disc(video, D); v = Image.blend(v.convert('RGB'), bm.convert('RGB'), tint).convert('RGBA'); v.putalpha(moon.split()[3]); im.alpha_composite(v, mp)
    fr = []
    im = sky.copy(); white_moon(im); moonlit(im, 'once in a', None, 230)
    fr.append(('1 a huge full moon', im))
    im = sky.copy(); white_moon(im)
    place(im, fit_w(cl, 1100), (130, 1500), 0); place(im, fit_w(cl, 1000), (1000, 760), 180); moonlit(im, 'once in a', None, 230)
    fr.append(('2 a few clouds creep in', im))
    im = sky.copy(); white_moon(im)
    place(im, cl, (W / 2, 1050), 0); place(im, cl, (W / 2 - 100, 1300), 180); place(im, cl, (W / 2 + 200, 820), 0)
    moonlit(im, 'once in a', None, 230)
    fr.append(('3 clouds cover the moon', im))
    im = sky.copy(); red_moon(im); place(im, fit_w(cl, 1300), (-120, 1650), 0); place(im, fit_w(cl, 1200), (1180, 900), 180)
    moonlit(im, 'once in a', 'blood moon', 165)
    fr.append(('4 clouds part - ombre blood moon', im))
    im = sky.copy(); red_moon(im, clip(0)); hs = fit_w(house, 980); im.alpha_composite(hs, ((W - hs.width) // 2, H - hs.height + 30))
    moonlit(im, 'our once-a-year', 'SALE', 210)
    fr.append(('5 the moon plays clip 1 behind the haunted house', im))
    im = sky.copy(); red_moon(im, clip(3))
    ground = Image.new('RGBA', (W, 260), (8, 8, 12, 255)); gm = Image.new('L', (W, 260), 0)
    ImageDraw.Draw(gm).pieslice((-500, 40, W + 200, 900), 180, 360, fill=255); ground.putalpha(gm); im.alpha_composite(ground, (0, H - 260))
    wf = fit_w(wolf, 560); im.alpha_composite(wf, (60, H - 200 - wf.height + 40))
    moonlit(im, 'everything', '30% off', 200)
    fr.append(('6 the wolf howls at clip 2 - the deal', im))
    im = sky.copy(); red_moon(im, clip(2))
    for (x, y, w_, r) in ((250, 900, 330, -14), (800, 1150, 260, 12), (430, 1420, 200, -6)): place(im, fit_w(bat, w_), (x, y), r)
    moonlit(im, 'this weekend only', 'Oct 29-31', 170)
    fr.append(('7 bats fly across clip 3 - the dates', im))
    im = sky.copy(); red_moon(im); place(im, fit_w(cl, 1500), (W / 2, 1520), 0)
    tr = fit_w(tree, 760); im.alpha_composite(tr, (W - tr.width + 200, H - tr.height + 30))
    glow_text(im, (W / 2, 1080), 'Shop the sale', F(SERIF, 150), CREAM, (255, 140, 60))
    sign_text(im, (W / 2, 1300), 'LINK IN BIO', 90, WHITE)
    moonlit(im, 'once in a', 'blood moon', 150, 300)
    fr.append(('8 CTA - shop the sale, link in bio', im))
    return fr

# ---- h3 Caught in our web -----------------------------------------------------------------------------------------------
def h3():
    web, spokes = web_layers(); spider = cut_white(src('Cute Fuzzy Pom-Pom Spider Craft-2.png'))
    sp = lambda w: sticker(fit_w(spider, w), 10)
    bgv = lambda n: dim(clip(n), 0.62)
    fr = []
    im = bgv(0); ImageDraw.Draw(im).line((0, 0, 330, 560), fill=WHITE + (230,), width=4)
    place(im, sp(330), (380, 650), -28)
    silk_words(im, 720, 0, 1250, "you're about to get", 'caught', 160)
    fr.append(('1 the spider swings in from the top left', im))
    big = fit_w(web, 1500)
    im = bgv(0); place(im, masked(big, spokes), (W / 2, 980)); place(im, sp(230), (W / 2, 980))
    hand(im, (W / 2, 260), 'first the spokes...', 80, WHITE, -3)
    fr.append(('2 the spider spins the straight spokes', im))
    sweep = Image.new('L', big.size, 0); ImageDraw.Draw(sweep).pieslice((0, 0, big.width, big.height), -90, 120, fill=255)
    m = ImageChops.lighter(spokes.resize(big.size), sweep.filter(ImageFilter.GaussianBlur(25)))
    im = bgv(0); place(im, masked(big, m), (W / 2, 980)); place(im, sp(230), (W / 2 + 360, 760), 40)
    hand(im, (W / 2, 260), '...then the scallops', 80, WHITE, 3)
    fr.append(('3 then the scalloped rings', im))
    half = fit_w(web, 2600); half = half.crop((half.width // 2, 0, half.width, half.height))
    def zoom_on(n, word_, tip_y):
        im = dim(clip(n), 0.45).filter(ImageFilter.GaussianBlur(14))
        im.alpha_composite(half, (-60, int(tip_y - half.height / 2)))
        place(im, round_clip(n, 640), (W - 360, tip_y), -3)
        silk_words(im, W - 360, tip_y + 330, tip_y + 560, f'point {n // 2 + 1}', word_, 130)
        return im
    fr.append(('4 zoom to end point 1 on the half web', zoom_on(0, 'the glow', 760)))
    fr.append(('5 slide along the web to point 2', zoom_on(2, 'the scent', 760)))
    im = dim(clip(1), 0.4).filter(ImageFilter.GaussianBlur(14)); fw = fit_w(web, 1060); place(im, fw, (W / 2, 900))
    for j, a in enumerate((-150, -30, 90)):
        t = math.radians(a); x, y = W / 2 + 360 * math.cos(t), 900 + 360 * math.sin(t)
        place(im, round_clip(j, 300, 10), (x, y), (-6, 4, 6)[j])
    place(im, sp(200), (W / 2, 900))
    silk_words(im, W / 2, 1420, 1680, 'get caught:', 'link in bio', 120)
    fr.append(('6 zoom out - the full web holds every point + CTA', im))
    return fr

# ---- h5 Trick or treat --------------------------------------------------------------------------------------------------
def door1(name, video=None):
    """Door 1 (the TRICK), framed tall. With a video, the clip fills the hallway right down to the threshold."""
    im = src(name).convert('RGBA')
    box = (190, 120, 190 + 620, 120 + int(620 * 16 / 9)); s = W / 620
    crop = im.crop(box).resize((W, H), Image.LANCZOS)
    if video is None: return crop
    poly = [(262, 0), (503, 0), (503, 1140), (600, 1186), (600, 1240), (262, 1240)]   # the open doorway, measured
    poly = [((x - box[0]) * s, (y - box[1]) * s) for x, y in poly]
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(poly, fill=255); m = m.filter(ImageFilter.GaussianBlur(2))
    xs = [p[0] for p in poly]; ys = [p[1] for p in poly]
    v = Image.new('RGBA', (W, H)); bb = (max(0, int(min(xs))), 0, int(max(xs)), int(max(ys)))
    v.alpha_composite(ImageOps.fit(video, (bb[2] - bb[0], bb[3] - bb[1])), (bb[0], 0))
    out = crop.copy(); out.paste(v, (0, 0), m); return out

def house2(zoom=1.0):
    """Door 2 (the TREAT): Mercedes's Victorian house with its door open, framed on the doorway."""
    im = src('Open Door, Warm Victorian Evening.png').convert('RGBA')
    h = 1086 / zoom; w = h * 9 / 16; cx, cy = 740, (640 if zoom > 1 else 543)
    y0 = max(0, min(1086 - h, cy - h / 2))
    box = (int(cx - w / 2), int(y0), int(cx + w / 2), int(y0 + h))
    return im.crop(box).resize((W, H), Image.LANCZOS), box

def arch_window(video, w, h, ring=16):
    m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m); d.rectangle((0, w // 2, w - 1, h - 1), fill=255); d.ellipse((0, 0, w - 1, w - 1), fill=255)
    v = ImageOps.fit(video, (w, h)); v.putalpha(m); return sticker(v, ring)

def candy_spill(im, corn, worm, spots):
    for j, (x, y, r) in enumerate(spots):
        p = corn if j % 2 == 0 else worm
        place(im, sticker(fit_w(p, 170 if p is corn else 290), 10), (x, y), r)

def h5():
    corn, worm = candy()
    fr = []
    im = door1('Warmly Lit Traditional Entryway.png')
    hand(im, (W / 2 - 90, 560), 'knock', 120, WHITE, -10); hand(im, (W / 2 + 140, 760), 'knock', 120, WHITE, 8)
    sign_text(im, (W / 2, 1500), 'TRICK', 190, WHITE, -3); hand(im, (W / 2, 1660), 'or treat?', 110, WHITE, -3)
    fr.append(('1 knock knock on door 1', im))
    im = door1('Warm Townhouse Entryway at Night.png', clip(2))
    sign_text(im, (W / 2, 1480), 'TRICK', 170, ACCENT, -3); hand(im, (W / 2, 1650), 'cheap sponges', 100, WHITE, -2)
    fr.append(('2 door 1 opens on the TRICK (clip to the floor)', im))
    im, _ = house2(1.0)
    hand(im, (W / 2 - 160, 600), 'knock', 110, WHITE, -10); hand(im, (W / 2 + 120, 760), 'knock', 110, WHITE, 8)
    hand(im, (W / 2, 330), "let's try next door...", 80, WHITE, -2)
    fr.append(('3 next door - knock on door 2', im))
    im, box = house2(1.9); s = W / (box[2] - box[0])
    dx, dy = (760 - box[0]) * s, (650 - box[1]) * s
    place(im, arch_window(clip(0), 560, 760), (dx, dy - 40), 0)
    candy_spill(im, corn, worm, ((220, 1330, 20), (880, 1240, -30), (760, 1520, 50), (320, 1560, -10), (560, 1720, 15)))
    sign_text(im, (W / 2, 260), 'TREAT', 190, ACCENT, 3); hand(im, (W / 2, 430), 'our 5-minute scrub', 90, WHITE, 2)
    fr.append(('4 door 2 opens on the TREAT, candy spills out', im))
    im, _ = house2(1.0)
    candy_spill(im, corn, worm, ((180, 1500, 20), (900, 1440, -30), (760, 1700, 50), (300, 1760, -10)))
    sign_text(im, (W / 2, 330), 'COMMENT', 120, WHITE, -3); sign_text(im, (W / 2, 520), 'TREAT', 210, ACCENT, -3)
    hand(im, (W / 2, 700), "and I'll send you 15% off", 82, WHITE, -2)
    fr.append(('5 CTA at the same house - comment TREAT', im))
    return fr

# ---- h2 Things I'm batty about ------------------------------------------------------------------------------------------
def h2():
    branch = fit_w(cut('Cute Twisted Spooky Tree Branch.png'), 1150)
    hang = cut('Cute Upside-Down Wrapped Bat.png'); fly = cut('Cute Kawaii Bat with Spread Wings.png'); fold = cut('Cozy Folded-Wing Kawaii Bat.png')
    fr = []
    im = dim(clip(0), 0.75); place(im, sticker(branch, 10), (W / 2 + 40, 190))
    place(im, sticker(fit_w(hang, 230)), (330, 420), 4); place(im, sticker(fit_w(hang, 280)), (720, 450), -3)
    sign_text(im, (W / 2, 900), "THINGS I'M", 110, WHITE, -2)
    glow_text(im, (W / 2, 1090), 'batty about', F(SERIF, 170), ACCENT, (40, 20, 50), 14, 1.4)
    fr.append(('1 bats hang over clip 1 - the title', im))
    im = clip(0).copy(); place(im, sticker(fit_w(fly, 2200), 22), (W / 2, 980), -8)
    fr.append(('2 a bat swoops at the camera - wing wipe', im))
    for i, (bat, word_) in enumerate(((fly, 'THE SCRUB'), (fold, 'THE SPRAY'), (fly, 'THE MITT'))):
        im = clip(i + 1).copy()
        bat_words(im, bat, (W / 2 + (-170, 200, -120)[i], 330), f'favourite no. {i + 1}', word_, (300, 220, 260)[i], (-8, 6, 4)[i])
        fr.append((f'{i + 3} full-screen favourite {i + 1}, a bat carries the word', im))
    im = dim(clip(4), 0.55).filter(ImageFilter.GaussianBlur(10)); place(im, sticker(branch, 10), (W / 2 + 40, 190))
    for j, x in enumerate((230, 540, 850)):
        ImageDraw.Draw(im).line((x, 230, x, 560), fill=WHITE + (255,), width=4)
        place(im, round_clip(j + 1, 290, 10), (x, 700), (-5, 3, 6)[j]); place(im, sticker(fit_w(hang, 150), 10), (x, 330))
        sign_text(im, (x, 900), str(j + 1), 110, ACCENT)
    sign_text(im, (W / 2, 1240), 'WHICH ONE?', 130, WHITE, -2)
    hand(im, (W / 2, 1420), 'comment 1, 2 or 3', 96, WHITE, 2)
    fr.append(('6 CTA - comment 1, 2 or 3', im))
    return fr

# ---- h4 What's inside? --------------------------------------------------------------------------------------------------
def pumpkin_parts():
    """The jack-o'-lantern, its carved holes as a mask, and an uncarved face made by patching the holes with its own
    skin (until Mercedes sends a matching uncarved pumpkin photo)."""
    full = src('Classic Toothsome Jack-o’-Lantern on White.png').convert('RGBA')
    body = cut_white(full.copy(), tol=20)
    bb = ImageOps.grayscale(full.convert('RGB')).point(lambda v: 255 if v < 235 else 0).getbbox()
    a = Image.new('L', full.size, 0); a.paste(body.split()[3], bb[:2]); full.putalpha(a)
    k = 1254 / 900
    holes = full.convert('RGB').split()[0].point(lambda v: 255 if v < 95 else 0)
    face = Image.new('L', full.size, 0); ImageDraw.Draw(face).rectangle((200 * k, 320 * k, 720 * k, 720 * k), fill=255)
    holes = ImageChops.multiply(holes, face).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(7))
    rims = holes.filter(ImageFilter.MaxFilter(25))          # the carved rims too
    skin = full.crop((int(110 * k), int(330 * k), int(250 * k), int(470 * k))).resize(full.size)
    skin = ImageEnhance.Brightness(skin.convert('RGB')).enhance(1.05).convert('RGBA')
    whole = full.copy(); whole.paste(skin, (0, 0), rims.filter(ImageFilter.GaussianBlur(4))); whole.putalpha(a)
    return full, whole, holes.filter(ImageFilter.GaussianBlur(1.5)), rims

def h4():
    full, whole, holes, rims = pumpkin_parts()
    lit = cut('Bottom-Lit Jack-o’-Lantern on White.png', tol=20)
    bg = lambda: dim(ImageOps.fit(src('pexels-katie-harp-636435-5646192.jpg').convert('RGBA'), (W, H)), 0.55).filter(ImageFilter.GaussianBlur(6))
    s = 1000 / full.width; sz = lambda im: im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    P, Wh, Hm, Rm = sz(full), sz(whole), sz(holes), sz(rims)
    pos = ((W - P.width) // 2, 620)
    carved = lambda im, xy, t, px, fill=(255, 214, 120): glow_text(im, xy, t, F(SERIF, px), fill, (255, 130, 30), 20, 1.8)
    def piece(box):
        m = Image.new('L', Rm.size, 0); m.paste(Rm.crop(box), box[:2])
        p = Wh.copy(); p.putalpha(ImageChops.multiply(p.split()[3], m)); p = p.crop(p.getbbox()); return sticker(fit_w(p, p.width * 1.6), 10)
    eyes_box = (0, 0, P.width, int(P.height * 0.47)); mouth_box = (0, int(P.height * 0.47), P.width, P.height)
    def lit_face(im, video, which):
        v = ImageOps.fit(video, P.size); m = Image.new('L', P.size, 0); m.paste(Hm.crop(which), which[:2]); v.putalpha(m)
        g = Image.new('RGBA', P.size, (255, 150, 40, 0)); g.putalpha(m.filter(ImageFilter.GaussianBlur(26)))
        im.alpha_composite(g, pos); im.alpha_composite(v, pos)
    fr = []
    im = bg(); im.alpha_composite(Wh, pos); carved(im, (W / 2, 400), "what's inside?", 150)
    fr.append(('1 a whole pumpkin - what is inside', im))
    im = bg(); half = Wh.copy(); half.paste(P.crop(eyes_box), eyes_box[:2]); im.alpha_composite(half, pos)
    lit_face(im, clip(0), eyes_box); place(im, piece(eyes_box), (W / 2 - 40, 430), -18)
    carved(im, (W / 2, 1600), 'pop!', 170)
    fr.append(('2 the eyes pop out, the clip glows through', im))
    im = bg(); im.alpha_composite(P, pos); lit_face(im, clip(0), (0, 0, P.width, P.height))
    place(im, piece(mouth_box), (W / 2 + 60, 1640), 14)
    carved(im, (W / 2, 400), 'something new', 140)
    fr.append(('3 the mouth pops out - the whole face glows', im))
    im = clip(0).copy(); big = P.resize((P.width * 3, P.height * 3), Image.LANCZOS); bh = Hm.resize(big.size)
    fr_ = big.copy(); fr_.putalpha(ImageChops.multiply(big.split()[3], ImageChops.invert(bh)))
    mx, my = int(big.width * 0.5), int(big.height * 0.70); im.alpha_composite(fr_.crop((mx - W // 2, my - H // 2, mx + W // 2, my + H // 2)))
    fr.append(('4 zoom through the mouth into clip 1', im))
    im = clip(1).copy(); carved(im, (W / 2, 250), 'launching', 110); carved(im, (W / 2, 420), 'Oct 24', 190)
    fr.append(('5 full-screen clip 2 - the launch date', im))
    im = bg(); Lt = fit_w(lit, 920); g = Image.new('RGBA', Lt.size, (255, 140, 40, 0)); g.putalpha(Lt.split()[3].filter(ImageFilter.GaussianBlur(60)))
    im.alpha_composite(g, ((W - Lt.width) // 2, 860)); im.alpha_composite(Lt, ((W - Lt.width) // 2, 860))
    carved(im, (W / 2, 380), 'be the first inside', 120); sign_text(im, (W / 2, 600), 'LINK IN BIO', 100, WHITE)
    fr.append(('6 CTA - lit pumpkin, link in bio', im))
    return fr

def save(tid, frames):
    out = E.PACK / 'halloween' / DIRS[tid] / 'storyboard'; out.mkdir(parents=True, exist_ok=True)
    for old in out.glob('*.jpg'):
        if '-notes' not in old.name: old.unlink()
    frames = [(n.replace(':', ' -').replace('?', ''), f) for n, f in frames]   # Windows file names: no : or ?
    for n, f in frames: f.convert('RGB').save(out / f'{n}.jpg', quality=90)
    cols = len(frames); sheet = Image.new('RGB', (W * cols + 20 * (cols - 1), H + 140), (240, 236, 228)); d = ImageDraw.Draw(sheet)
    for i, (n, f) in enumerate(frames):
        sheet.paste(f.convert('RGB'), (i * (W + 20), 140)); d.text((i * (W + 20) + 10, 30), n[:36], font=F(SANS, 56), fill=INK)
    sheet.resize((sheet.width // 3, sheet.height // 3), Image.LANCZOS).save(out / f'storyboard-{tid}.jpg', quality=90)
    print('saved', out)

if __name__ == '__main__':
    for tid in sys.argv[1:] or list(DIRS):
        save(tid, globals()[tid]())
