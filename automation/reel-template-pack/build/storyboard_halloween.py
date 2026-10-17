"""Storyboard stills for the Halloween pack (h2 to h6), built from Mercedes's images (2026-10-17: ChatGPT-made props,
Pexels photos, her cloud, house, wolf and tree PNGs).
Round 3 applies her round 1 notes and her round-3 rules (see the rules block below); round 2 applied all her round 1 notes (halloween/notes-round1.md): more video moments in every template, clear CTAs,
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
    """Asides (round 4: Arial Bold with a dark outline; Ink Free couldn't be read over video)."""
    px = int(px * 0.72); lay = _layer(img, xy, text, F(BOLD, px), fill, stroke=max(3, px // 14), stroke_fill=INK)
    if rot: lay = lay.rotate(rot, center=xy, resample=Image.BICUBIC)
    if shadow: halo(img, lay, (0, 0, 0), 10, 1.0)
    img.alpha_composite(lay)

def scrim(img, y0, y1, a=150):
    """A soft dark band behind words over video, fading out at both edges."""
    band = Image.new('L', (1, 64)); bp = band.load()
    for y in range(64): bp[0, y] = int(a * math.sin(math.pi * y / 63) ** 0.8)
    m = band.resize((W, int(y1 - y0))); lay = Image.new('RGBA', (W, int(y1 - y0)), (10, 8, 12, 255)); lay.putalpha(m)
    img.alpha_composite(lay, (0, int(y0)))

def silk_words(img, x, top, y, small, big, big_px=120, color=WHITE):
    """Words hanging on two spider-silk threads from `top` (h3)."""
    fb = F(SERIF, big_px); w = ImageDraw.Draw(img).textlength(big, font=fb)
    d = ImageDraw.Draw(img); bottom = y - big_px * 0.55 - (70 if small else 0)
    for dx in (-w / 3, w / 3): d.line((x + dx, top, x + dx, bottom), fill=(255, 255, 255, 210), width=3)
    if small: hand(img, (x, y - big_px * 0.55 - 25), small, 62, color)
    lay = _layer(img, (x, y + 10), big, fb, SILK); halo(img, lay, (0, 0, 0), 10, 1.6); img.alpha_composite(lay)

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

# ---- round 3 rules (Mercedes 2026-10-17, via the #3 feedback) -----------------------------------------------------------
# Every template is its own world. No white die-cut edges (template #2 owns them): cut-outs carry a real cast shadow,
# and depth comes from props near the camera, big, blurred and half off-screen. The background changes clip to clip
# and the layers ARE the transitions. Headline words are Bodoni Moda in a colour sampled from the scene's own props
# (no glow); asides are Ink Free; door-sign caps are Arial Bold. CTAs are "Comment KEYWORD".
SILK = (246, 246, 250)    # spider silk
MOON_CREAM, MOON_RED = (240, 228, 204), (238, 112, 64)     # sampled from the moon photo, and its blood-moon grade
BRASS = (222, 160, 72)                                       # the door's brass letter plate
LILAC = (196, 160, 196)                                      # the bats' inner ears
FLESH = (250, 196, 92)                                       # carved pumpkin flesh

def cutout(im, w=None, rot=0, shadow=70):
    if w: im = fit_w(im, w)
    return C.shadow(im, offset=(10, 18), blur=18, alpha=shadow)

def near(im, blur=10, alpha=0.85):
    """A prop close to the camera: soft focus, a little see-through."""
    out = im.filter(ImageFilter.GaussianBlur(blur)); out.putalpha(out.split()[3].point(lambda v: int(v * alpha))); return out

def streak(im, dx=60, n=9):
    """Directional motion blur (a door slamming, a strand sliding past)."""
    acc = Image.new('RGBA', im.size, (0, 0, 0, 0))
    for i in range(n):
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh.alpha_composite(im, (int(dx * (i / (n - 1) - 0.5)), 0))
        acc = Image.blend(acc, sh, 1 / (i + 1))
    return acc

def head(img, xy, text, px, color, anchor='mm', shadow=1.3, stroke=0):
    """Headline: Bodoni Moda, solid prop colour, a soft dark drop shadow for legibility (not a glow)."""
    lay = _layer(img, xy, text, F(SERIF, px), color, anchor, stroke=stroke, stroke_fill=INK)
    s = Image.new('RGBA', img.size, (0, 0, 0, 0)); s.alpha_composite(lay, (6, 10))
    halo(img, s, (0, 0, 0), 12, shadow); img.alpha_composite(lay)

def cocoon(n, d):
    """A round clip wrapped in a few strands of spider silk (h3's own edge)."""
    v = disc(clip(n), d); pad = 40; out = Image.new('RGBA', (d + 2 * pad, d + 2 * pad), (0, 0, 0, 0))
    out.alpha_composite(C.shadow(v, offset=(8, 14), blur=16, alpha=80), (pad - 26, pad - 26))
    dr = ImageDraw.Draw(out); c = out.width / 2
    for k, (a0, a1, r) in enumerate(((200, 330, d / 2 + 8), (10, 140, d / 2 + 14), (120, 250, d / 2 + 4), (300, 420, d / 2 + 18))):
        dr.arc((c - r, c - r, c + r, c + r), a0, a1, fill=SILK + (230,), width=3)
    for a in (35, 160, 290):   # strands crossing over the clip
        t = math.radians(a); dr.line((c + (d / 2 + 16) * math.cos(t), c + (d / 2 + 16) * math.sin(t),
                                      c + (d / 2 + 16) * math.cos(t + 2.3), c + (d / 2 + 16) * math.sin(t + 2.3)), fill=SILK + (150,), width=2)
    return out

# ---- h6 Once in a blood moon --------------------------------------------------------------------------------------------
def h6():
    sky = night_sky(); D = 1000; moon = moon_disc(D); bm = blood(moon); cl = clouds(1800)
    house, wolf = house_glowing(), white_on_clear('Howling Wolf Silhouette.png', (12, 10, 14))
    tree = src('Twisted Haunted Tree Silhouette.png').convert('RGBA'); bat = cut('Cute Kawaii Bat with Spread Wings.png')
    mp = ((W - D) // 2, 640)
    def moon_clip(im, n, scale=1.0, at=None):
        d = int(D * scale); p = at or ((W - d) // 2, mp[1] + (D - d) // 2)
        moon_glow(im, d, p); v = disc(clip(n), d); v = Image.blend(v.convert('RGB'), blood(moon_disc(d)).convert('RGB'), 0.2).convert('RGBA')
        v.putalpha(moon_disc(d).split()[3]); im.alpha_composite(v, p)
    fr = []
    im = sky.copy(); moon_glow(im, D, mp, ((255, 240, 220), (220, 220, 230)), 70); im.alpha_composite(moon, mp)
    im.alpha_composite(near(fit_w(cl, 2200), 6, 0.7), (-500, 1350))
    head(im, (W / 2, 330), 'once in a', 210, MOON_CREAM)
    fr.append(('1 a huge full moon, a cloud drifts close to the camera', im))
    im = sky.copy(); moon_glow(im, D, mp); im.alpha_composite(bm, mp)
    big = fit_w(cl, 2600)
    place(im, big, (W / 2 - 1250, 1000), 0); place(im, big, (W / 2 + 1300, 1100), 180)      # the clouds part like curtains
    head(im, (W / 2, 250), 'once in a', 120, MOON_CREAM); head(im, (W / 2, 420), 'blood moon', 170, MOON_RED)
    fr.append(('2 the clouds part like curtains - the moon has turned red', im))
    im = sky.copy(); moon_clip(im, 0)
    hs = fit_w(house, 1000); im.alpha_composite(hs, ((W - hs.width) // 2, H - hs.height + 30))
    place(im, near(fit_w(bat, 900), 12, 0.8), (1040, 420), 18)
    head(im, (W / 2, 250), 'our once-a-year', 110, MOON_CREAM); head(im, (W / 2, 420), 'SALE', 200, MOON_RED)
    fr.append(('3 clip 1 plays inside the moon, a bat swoops past the lens', im))
    im = clip(3).copy()          # the moon rushes at the camera: clip 2 breaks out of it to full screen
    ring = blood(moon_disc(2600)); hole = Image.new('L', ring.size, 255); ImageDraw.Draw(hole).ellipse((330, 330, 2270, 2270), fill=0)
    ring.putalpha(ImageChops.multiply(ring.split()[3], hole.filter(ImageFilter.GaussianBlur(30)))); im.alpha_composite(ring, ((W - 2600) // 2, (H - 2600) // 2))
    wf = fit_w(wolf, 620); im.alpha_composite(C.shadow(wf, (0, 0), 30, 120), (-40, H - wf.height + 20))
    head(im, (W / 2, 300), 'everything', 110, MOON_CREAM); head(im, (W / 2, 470), '30% off', 210, MOON_RED)
    fr.append(('4 clip 2 breaks out of the moon to full screen, the wolf howls', im))
    im = sky.copy(); moon_clip(im, 2, 1.06)
    tr = fit_w(tree, 2400); im.alpha_composite(near(tr, 4, 0.95), (-1350, -200))     # we pan past a huge tree: the wipe
    hand(im, (W / 2 + 120, 300), 'this weekend only', 110, MOON_CREAM); head(im, (W / 2 + 120, 470), 'Oct 29-31', 170, MOON_RED)
    fr.append(('5 a huge tree sweeps past - clip 3 in the moon, the dates', im))
    im = sky.copy(); moon_glow(im, D, mp); im.alpha_composite(bm, mp)
    place(im, fit_w(cl, 1500), (W / 2, 1620), 0); tr = fit_w(tree, 760); im.alpha_composite(tr, (W - tr.width + 220, H - tr.height + 30))
    for (x, y, w_, r, bl) in ((210, 520, 420, -10, 0), (880, 420, 330, 8, 0), (900, 1560, 560, 14, 0)):
        b = cutout(bat, w_) if not bl else near(fit_w(bat, w_), bl, 0.85); place(im, b, (x, y), r)
    sign_text(im, (W / 2, 1000), 'COMMENT', 120, MOON_CREAM); head(im, (W / 2, 1180), 'MOON', 230, MOON_RED)
    hand(im, (W / 2, 1360), "and I'll send your code", 80, MOON_CREAM)
    fr.append(('6 CTA - comment MOON', im))
    return fr

# ---- h3 Caught in our web -----------------------------------------------------------------------------------------------
def h3():
    """Round 4: the spider spins straight silk lines across the screen one at a time; each line holds a point (a clip
    at one end, its words at the other). Earlier points stay, dimmed. Then the rings are spun between the lines and we
    see the whole web holding every point."""
    web, _ = web_layers(); spider = cut_white(src('Cute Fuzzy Pom-Pom Spider Craft-2.png'))
    sp = lambda w, r=0: cutout(spider, w, r, 90)
    Cx, Cy = W / 2, 900
    LINES = [(-55, 'THE GLOW'), (-125, 'THE SCENT'), (90, 'THE PRICE'), (25, 'THE GIFT BOX')]   # angle of the clip end
    def label(img, xy, text, px=92):
        w_ = ImageDraw.Draw(img).textlength(text, font=F(BOLD, px)); xy = (min(max(xy[0], w_ / 2 + 30), W - w_ / 2 - 30), xy[1])
        lay = _layer(img, xy, text, F(BOLD, px), INK, stroke=max(5, px // 11), stroke_fill=SILK); halo(img, lay, (0, 0, 0), 12, 0.7); img.alpha_composite(lay)
    def silk_line(img, a, alpha=255):
        t = math.radians(a); L = 2400; lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(lay).line((Cx - L * math.cos(t), Cy - L * math.sin(t), Cx + L * math.cos(t), Cy + L * math.sin(t)), fill=SILK + (alpha,), width=5)
        halo(img, lay, (0, 0, 0), 4, 0.8); img.alpha_composite(lay)
    def point(img, k, bright=True, d=330, small=False):
        a, word_ = LINES[k]; t = math.radians(a)
        ends = (Cx + 400 * math.cos(t), Cy + 400 * math.sin(t)), (Cx - 420 * math.cos(t), Cy - 420 * math.sin(t))
        c = cocoon(k, d)
        if not bright: c.putalpha(c.split()[3].point(lambda v: int(v * 0.45)))
        place(img, c, ends[0], (-5, 4, -3, 6)[k])
        if small: label(img, (ends[0][0], ends[0][1] + d / 2 + 50), word_, 54)
        elif bright: label(img, ends[1], word_)
    fr = []
    im = clip(0).copy(); ImageDraw.Draw(im).line((0, 0, 330, 470), fill=SILK + (240,), width=5)
    place(im, sp(560, -25), (380, 640))
    scrim(im, 1000, 1500); label(im, (Cx, 1160), "you're about to get", 70); head(im, (Cx, 1320), 'CAUGHT', 190, SILK, stroke=3)
    fr.append(('1 a big cute spider drops in from the top left', im))
    for n in range(3):
        im = dim(clip(n + 1), 0.62)
        for k in range(n + 1): silk_line(im, LINES[k][0], 255 if k == n else 140)
        for k in range(n): point(im, k, bright=False, d=260)
        point(im, n); place(im, sp(200, 20 * n), (Cx, Cy))
        fr.append((f'{n + 2} a straight line spins across - point {n + 1} on its ends', im))
    im = dim(clip(4), 0.5); place(im, fit_w(web, 1300), (Cx, Cy))
    for k in range(4): silk_line(im, LINES[k][0], 200)
    for k in range(4): point(im, k, d=250, small=True)
    place(im, sp(230), (Cx, Cy))
    scrim(im, 1540, 1920, 170); sign_text(im, (Cx, 1650), 'COMMENT', 100, SILK); head(im, (Cx, 1810), 'WEB', 170, SILK, stroke=3)
    fr.append(('5 the rings spin between the lines - every point caught, comment WEB', im))
    return fr

# ---- h5 Trick or treat --------------------------------------------------------------------------------------------------
def h5():
    """Round 4: no door slam, no candy (the clipart candy looked bad); the treat clip breaks out of door 2's arch."""
    fr = []
    def knock(im, y=640):
        sign_text(im, (W / 2 - 110, y), 'KNOCK', 120, WHITE, -9); sign_text(im, (W / 2 + 130, y + 170), 'KNOCK', 120, WHITE, 7)
    im = door1('Warmly Lit Traditional Entryway.png'); knock(im)
    sign_text(im, (W / 2, 1500), 'TRICK', 190, BRASS, -3); hand(im, (W / 2, 1670), 'or treat?', 110, WHITE, -3)
    fr.append(('1 knock knock on door 1', im))
    im = door1('Warm Townhouse Entryway at Night.png', clip(2)); scrim(im, 1330, 1780)
    sign_text(im, (W / 2, 1480), 'TRICK', 170, BRASS, -3); hand(im, (W / 2, 1650), 'cheap sponges', 110, WHITE, -2)
    fr.append(('2 door 1 swings open on the TRICK, clip down to the floor', im))
    im, _ = house2(1.0); knock(im, 600)
    hand(im, (W / 2, 330), "let's try next door", 100, WHITE, -2)
    fr.append(('3 next door - knock on door 2', im))
    def treat_house(zoom):
        im, box = house2(1.9); s_ = W / (box[2] - box[0])
        ax0, ax1, ay0, ay1 = (650 - box[0]) * s_, (832 - box[0]) * s_, (470 - box[1]) * s_, (775 - box[1]) * s_
        cx, cy = (ax0 + ax1) / 2, (ay0 + ay1) / 2
        if zoom != 1:
            im = im.resize((int(W * zoom), int(H * zoom)), Image.LANCZOS)
            ax0, ax1, ay0, ay1 = (v * zoom for v in (ax0, ax1, ay0, ay1)); ox, oy = cx * zoom - W / 2, cy * zoom - H / 2
            im = im.crop((int(ox), int(oy), int(ox) + W, int(oy) + H)); ax0 -= ox; ax1 -= ox; ay0 -= oy; ay1 -= oy
        arch = Image.new('L', (W, H), 0); ad = ImageDraw.Draw(arch)
        ad.rectangle((ax0, ay0 + (ax1 - ax0) / 2, ax1, ay1), fill=255); ad.ellipse((ax0, ay0, ax1, ay0 + (ax1 - ax0)), fill=255)
        return im, arch.filter(ImageFilter.GaussianBlur(2))
    im, arch = treat_house(1.0); im.paste(ImageOps.fit(clip(0), (W, H)), (0, 0), arch)      # the clip fills the real doorway
    scrim(im, 120, 560); sign_text(im, (W / 2, 260), 'TREAT', 190, BRASS, 3); hand(im, (W / 2, 430), 'our 5-minute scrub', 100, WHITE, 2)
    fr.append(('4 door 2 opens on the TREAT', im))
    im = clip(1).copy(); frame_, arch = treat_house(3.4)          # we fly through the doorway: its arch frames the clip
    frame_.putalpha(ImageChops.invert(arch)); im.alpha_composite(frame_)
    scrim(im, 1350, 1800); hand(im, (W / 2, 1520), 'gone in 5 minutes', 120, WHITE, -2)
    fr.append(('5 we fly through the doorway - the clip fills the screen', im))
    im, _ = house2(1.0); scrim(im, 180, 820, 170)
    sign_text(im, (W / 2, 330), 'COMMENT', 120, WHITE, -3); sign_text(im, (W / 2, 520), 'TREAT', 210, BRASS, -3)
    hand(im, (W / 2, 700), "and I'll send you 15% off", 100, WHITE, -2)
    fr.append(('6 CTA at door 2 - comment TREAT', im))
    return fr

# ---- h2 Things I'm batty about ------------------------------------------------------------------------------------------
def h2():
    branch = fit_w(cut('Cute Twisted Spooky Tree Branch.png'), 1150)
    hang = cut('Cute Upside-Down Wrapped Bat.png'); fly = cut('Cute Kawaii Bat with Spread Wings.png'); fold = cut('Cozy Folded-Wing Kawaii Bat.png')
    def bat_window(n, w):
        """Clip 4 seen through a bat-shaped window (the bat's own silhouette)."""
        b = fit_w(fly, w); v = ImageOps.fit(clip(n), b.size); v.putalpha(b.split()[3].point(lambda a: 255 if a > 100 else 0)); return v
    fr = []
    im = clip(0).copy(); place(im, cutout(branch), (W / 2 + 40, 190))
    place(im, cutout(hang, 230), (330, 420), 4); place(im, cutout(hang, 280), (720, 450), -3)
    scrim(im, 760, 1220, 170); hand(im, (W / 2, 880), "things I'm", 110, WHITE, -2); head(im, (W / 2, 1060), 'batty about', 190, LILAC, stroke=3)
    fr.append(('1 bats asleep on a branch over clip 1', im))
    im = clip(0).copy(); iris = Image.new('L', (W, H), 0); ImageDraw.Draw(iris).ellipse((W / 2 - 330, 960 - 330, W / 2 + 330, 960 + 330), fill=255)
    im.paste(clip(1), (0, 0), iris.filter(ImageFilter.GaussianBlur(8)))      # the swirl opens onto clip 2
    th = 0.0
    while th < 4.6 * math.pi:                                                 # a peppermint swirl of bats, all sharp
        r = 70 + 62 * th; x, y = W / 2 + r * math.cos(th), 960 + r * math.sin(th)
        if -200 < x < W + 200 and -200 < y < H + 200:
            place(im, cutout(fly, 70 + r * 0.34), (x, y), -math.degrees(th) - 90)
        th += 0.55 + 120 / (r + 120)
    fr.append(('2 they swirl out like a peppermint - the swirl opens on clip 2', im))
    im = clip(1).copy(); scrim(im, 80, 480, 170); hand(im, (W / 2, 190), 'no. 1', 90, WHITE)
    head(im, (W / 2, 340), 'THE SCRUB', 150, LILAC, stroke=3); place(im, cutout(fold, 180), (W - 110, 130), 8)
    fr.append(('3 favourite 1 - a bat lands on the word', im))
    im = clip(1).copy(); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse((-900, -200, 760, 2200), fill=255)
    im.paste(clip(2), (0, 0), m.filter(ImageFilter.GaussianBlur(20)))
    place(im, near(fit_w(fly, 2600), 5, 0.97), (1220, 960), -20)          # one wing sweeps across the lens
    scrim(im, 1220, 1660, 170); head(im, (W / 2 - 140, 1500), 'THE SPRAY', 150, LILAC, stroke=3); hand(im, (W / 2 - 140, 1350), 'no. 2', 90, WHITE)
    fr.append(('4 a wing sweeps past the lens to favourite 2', im))
    im = dim(clip(2), 0.5).filter(ImageFilter.GaussianBlur(12)); bw = bat_window(1, 2050); place(im, C.shadow(bw, (0, 16), 22, 110), (W / 2, 860))
    scrim(im, 1300, 1760, 170); head(im, (W / 2, 1560), 'THE MITT', 160, LILAC, stroke=3); hand(im, (W / 2, 1410), 'no. 3', 90, WHITE)
    fr.append(('5 favourite 3 flies in inside a bat-shaped window', im))
    im = dim(clip(4), 0.6); place(im, cutout(branch), (W / 2 + 40, 190))
    for j, x in enumerate((230, 540, 850)):
        ImageDraw.Draw(im).line((x, 300, x, 540), fill=(40, 34, 40, 255), width=4)
        place(im, C.shadow(disc(clip(j + 1), 270), (6, 12), 14, 90), (x, 690), (-5, 3, 6)[j]); place(im, cutout(hang, 150), (x, 330))
        head(im, (x, 900), str(j + 1), 110, LILAC)
    scrim(im, 1060, 1680, 170); sign_text(im, (W / 2, 1200), 'COMMENT', 120, WHITE); head(im, (W / 2, 1390), 'BATTY', 200, LILAC, stroke=3)
    hand(im, (W / 2, 1560), "and I'll send all 3 links", 80, WHITE)
    fr.append(('6 CTA - comment BATTY for the links', im))
    return fr

# ---- h4 What's inside? --------------------------------------------------------------------------------------------------
def h4():
    full, whole, holes, rims = pumpkin_parts()
    lit = cut('Bottom-Lit Jack-o’-Lantern on White.png', tol=20)
    bgs = [ImageOps.fit(src(n).convert('RGBA'), (W, H)) for n in ('pexels-olia-danilevich-5490803.jpg', 'pexels-pexels-user-2121223601-29365678.jpg')]
    bg = lambda i=0: dim(bgs[i], 0.6).filter(ImageFilter.GaussianBlur(8))
    s = 1000 / full.width; sz = lambda im: im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    P, Wh, Hm, Rm = sz(full), sz(whole), sz(holes), sz(rims)
    pos = ((W - P.width) // 2, 640)
    def piece(box, scale=1.0):
        m = Image.new('L', Rm.size, 0); m.paste(Rm.crop(box), box[:2])
        p = Wh.copy(); p.putalpha(ImageChops.multiply(p.split()[3], m)); p = p.crop(p.getbbox()); return fit_w(p, p.width * scale)
    eyes_box = (0, 0, P.width, int(P.height * 0.47)); mouth_box = (0, int(P.height * 0.47), P.width, P.height)
    def lit_face(im, video, which):
        v = ImageOps.fit(video, P.size); m = Image.new('L', P.size, 0); m.paste(Hm.crop(which), which[:2]); v.putalpha(m)
        g = Image.new('RGBA', P.size, (255, 150, 40, 0)); g.putalpha(m.filter(ImageFilter.GaussianBlur(26)))
        im.alpha_composite(g, pos); im.alpha_composite(v, pos)
    fr = []
    im = bg(0); im.alpha_composite(C.shadow(Wh, (12, 22), 22, 110), (pos[0] - 22, pos[1] - 22))
    head(im, (W / 2, 400), "what's inside?", 150, FLESH)
    fr.append(('1 a whole pumpkin on the windowsill - what is inside', im))
    im = bg(0); half = Wh.copy(); half.paste(P.crop(eyes_box), eyes_box[:2]); im.alpha_composite(half, pos)
    lit_face(im, clip(0), eyes_box)
    place(im, near(piece(eyes_box, 3.2), 7, 0.95), (W / 2 - 40, 330), -18)          # the eyes fly at the lens
    fr.append(('2 the eyes pop out at the lens, clip 1 glows through', im))
    im = bg(0); im.alpha_composite(P, pos); lit_face(im, clip(0), (0, 0, P.width, P.height))
    place(im, near(piece(mouth_box, 2.4), 8, 0.95), (W / 2 + 80, 1700), 14)
    head(im, (W / 2, 380), 'something new', 140, FLESH)
    fr.append(('3 the mouth pops out - the whole face glows', im))
    im = clip(0).copy(); big = P.resize((P.width * 3, P.height * 3), Image.LANCZOS); bh = Hm.resize(big.size)
    fr_ = big.copy(); fr_.putalpha(ImageChops.multiply(big.split()[3], ImageChops.invert(bh)))
    mx, my = int(big.width * 0.5), int(big.height * 0.70); im.alpha_composite(fr_.crop((mx - W // 2, my - H // 2, mx + W // 2, my + H // 2)))
    fr.append(('4 we fly in through the mouth into clip 1', im))
    im = clip(1).copy(); seeds = piece(eyes_box, 1.0)
    for (x, y, w_, r) in ((140, 260, 420, -30), (980, 1700, 520, 25)): place(im, near(fit_w(seeds, w_), 9, 0.85), (x, y), r)
    head(im, (W / 2, 220), 'launching', 120, FLESH); head(im, (W / 2, 390), 'Oct 24', 200, FLESH)
    fr.append(('5 clip 2 full screen, carved pieces drift past - the date', im))
    im = bg(1); Lt = fit_w(lit, 920); g = Image.new('RGBA', Lt.size, (255, 140, 40, 0)); g.putalpha(Lt.split()[3].filter(ImageFilter.GaussianBlur(60)))
    im.alpha_composite(g, ((W - Lt.width) // 2, 860)); im.alpha_composite(Lt, ((W - Lt.width) // 2, 860))
    sign_text(im, (W / 2, 330), 'COMMENT', 120, WHITE); head(im, (W / 2, 520), 'PUMPKIN', 190, FLESH)
    hand(im, (W / 2, 690), 'to get in first', 90, WHITE)
    fr.append(('6 CTA - lit pumpkin, comment PUMPKIN', im))
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
