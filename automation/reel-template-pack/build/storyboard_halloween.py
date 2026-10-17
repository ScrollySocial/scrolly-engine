"""Storyboard stills for the Halloween pack (h2 to h6), built from Mercedes's images (2026-10-17: ChatGPT-made props,
Pexels photos, her cloud, house, wolf and tree PNGs). Real objects with a playful layer (washi tape, white sticker
edges, words on tape, Ink Free asides). Video spots show stand-in footage from her July clips.
Usage: python build/storyboard_halloween.py [h2 h3 ...]  ->  halloween/hN-.../storyboard/
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageEnhance, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import engine as E
import storyboard_02 as S          # footage(), word(), place(), bordered(), F()
from props import cut_white

SRC = E.PACK / 'assets' / 'props' / 'source'
W, H = 1080, 1920
INK, WHITE, CREAM = (24, 23, 22), (255, 255, 255), (250, 244, 230)
ACCENT = (236, 120, 36)            # the one key-word colour (pumpkin orange); buyers swap it for their brand colour
PLUM, NIGHT, ORANGE = (58, 38, 62), (18, 22, 40), (232, 150, 72)
SERIF, SANS, HAND = S.SERIF, S.SANS, S.HAND
F = S.F
DIRS = {'h2': 'h2-batty-about', 'h3': 'h3-caught-in-our-web', 'h4': 'h4-whats-inside', 'h5': 'h5-trick-or-treat',
        'h6': 'h6-once-in-a-blood-moon'}

def src(name): return Image.open(SRC / name)
def cut(name, **k): return cut_white(src(name), **k)
def fit_w(im, w): return im.resize((int(w), int(im.height * w / im.width)), Image.LANCZOS)
def sticker(im, w=16): return S.bordered(im, WHITE, WHITE, w, 2)
def bg(color, seed=1): return C.paper((W, H), color=color, seed=seed, grain=8).convert('RGBA')
def clip(n=0, size=(W, H)):
    clips = [('IMG_1439', 2.0), ('IMG_1439', 4.0), ('IMG_1447', 1.0), ('IMG_1385', 1.0), ('IMG_1460', 2.0)]
    c, t = clips[n % len(clips)]
    return S.footage(c, t, size)

def round_clip(n, d, ring=14):
    """A round video window with a white die-cut edge."""
    v = ImageOps.fit(clip(n), (d, d)); m = Image.new('L', (d, d), 0); ImageDraw.Draw(m).ellipse((0, 0, d - 1, d - 1), fill=255)
    v.putalpha(m); return sticker(v, ring)

def tape(img, c, small, big, rot=-3, pattern='stripes', colors=(INK, (70, 64, 60)), length=760, accent=True):
    """Words on a strip of washi tape: small Arial line + a Bodoni key word in the accent colour."""
    strip = C.washi(length, 250, pattern, colors, seed=17, alpha=250)
    base = Image.new('RGBA', strip.size, (0, 0, 0, 0))
    ImageDraw.Draw(base).rounded_rectangle((26, 40, strip.width - 26, strip.height - 40), 6, fill=CREAM + (255,))
    strip.alpha_composite(base)
    d = ImageDraw.Draw(strip); cx, cy = strip.width / 2, strip.height / 2
    if small: d.text((cx, cy - 46), small, font=F(SANS, 46), fill=INK, anchor='mm')
    d.text((cx, cy + (36 if small else 0)), big, font=F(SERIF, 92), fill=ACCENT if accent else INK, anchor='mm')
    S.place(img, strip, c, rot)

def hand(img, xy, text, px=64, fill=CREAM, rot=0):
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(lay).text(xy, text, font=F(HAND, px), fill=fill, anchor='mm')
    img.alpha_composite(lay.rotate(rot, center=xy, resample=Image.BICUBIC))

def glow(img, item, xy, color, blur=60, alpha=200):
    g = Image.new('RGBA', item.size, color + (0,)); g.putalpha(item.split()[3].point(lambda v: min(255, v) * alpha // 255))
    pad = blur * 3; big = Image.new('RGBA', (item.width + 2 * pad, item.height + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(g, (pad, pad))
    big = big.filter(ImageFilter.GaussianBlur(blur)); img.alpha_composite(big, (xy[0] - pad, xy[1] - pad))

# ---- props --------------------------------------------------------------------------------------------------------------
def candy():
    """Candy corn (3 from the sheets) and the blue gummy worm, the only pieces Mercedes kept."""
    sheet = src('Colorful Candy Collection PNG Asset Sheet-2.png').convert('RGBA')
    k = 1536 / 900
    corn = sheet.crop((int(195 * k), int(195 * k), int(335 * k), int(350 * k)))
    worm = sheet.crop((int(18 * k), int(355 * k), int(298 * k), int(548 * k)))
    r, g, b, a = worm.split()
    blue = ImageChops.subtract(b, r).point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(1.5))
    worm.putalpha(ImageChops.multiply(a, blue))
    for p in (corn, worm): p.putalpha(p.split()[3].point(lambda v: 255 if v > 150 else v * v // 150))
    return corn.crop(corn.getbbox()), worm.crop(worm.getbbox())

def white_on_clear(name, keep_dark=True):
    """A black-line or black-silhouette PNG on white -> the dark parts, cut out."""
    g = ImageOps.grayscale(src(name).convert('RGB'))
    a = g.point(lambda v: 255 if v < 90 else (0 if v > 200 else (200 - v) * 255 // 110))
    out = Image.new('RGBA', g.size, (INK if keep_dark else WHITE) + (255,)); out.putalpha(a); return out.crop(out.getbbox())

def house_glowing():
    """The haunted house silhouette with its white windows lit warm yellow."""
    im = cut('Whimsical Haunted House Silhouette.png', tol=40)
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a > 0 and r > 150: px[x, y] = (255, 196, 92, a)
    return im

def moon_disc(d):
    im = src('pexels-lucaspezeta-8488394.jpg').convert('RGB')
    g = ImageOps.grayscale(im); bb = g.point(lambda v: 255 if v > 60 else 0).getbbox()
    cx, cy, r = (bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2, max(bb[2] - bb[0], bb[3] - bb[1]) / 2
    m = im.crop((int(cx - r), int(cy - r), int(cx + r), int(cy + r))).resize((d, d), Image.LANCZOS).convert('RGBA')
    a = Image.new('L', (d, d), 0); ImageDraw.Draw(a).ellipse((2, 2, d - 3, d - 3), fill=255); m.putalpha(a.filter(ImageFilter.GaussianBlur(2)))
    return m

def blood(moon, k=1.0):
    g = ImageOps.grayscale(moon.convert('RGB'))
    red = ImageOps.colorize(g, (70, 8, 6), (255, 128, 70))
    out = Image.blend(moon.convert('RGB'), red, k).convert('RGBA'); out.putalpha(moon.split()[3]); return out

def night_sky():
    sky = ImageOps.fit(src('pexels-ev4r137-39335277.jpg').convert('RGB'), (W, H), centering=(0.0, 0.5)).convert('RGBA')
    sky = ImageEnhance.Brightness(sky).enhance(0.8)
    return sky

def clouds(w):
    return fit_w(src('Ethereal Wispy Cloud Overlay.png').convert('RGBA'), w)

def pumpkin_parts():
    """The closed jack-o'-lantern split into body and lid along its carved seam; the face holes as a mask."""
    im = cut('Classic Toothsome Jack-o’-Lantern on White.png', tol=20)
    full = src('Classic Toothsome Jack-o’-Lantern on White.png').convert('RGBA')
    ox, oy = cut_white(full.copy(), tol=20).size, None
    bb = ImageOps.grayscale(full.convert('RGB')).point(lambda v: 255 if v < 235 else 0).getbbox()
    k = 1254 / 900
    lid = Image.new('L', full.size, 0); d = ImageDraw.Draw(lid)
    d.ellipse((225 * k, 160 * k, 695 * k, 268 * k), fill=255); d.rectangle((225 * k, 0, 695 * k, 214 * k), fill=255)
    lid = lid.filter(ImageFilter.GaussianBlur(2))
    a = Image.new('L', full.size, 0); a.paste(im.split()[3], bb[:2])
    body = full.copy(); body.putalpha(ImageChops.multiply(a, ImageChops.invert(lid)))
    top = full.copy(); top.putalpha(ImageChops.multiply(a, lid))
    holes = full.convert('RGB').split()[0].point(lambda v: 255 if v < 95 else 0)
    face = Image.new('L', full.size, 0); ImageDraw.Draw(face).rectangle((200 * k, 320 * k, 720 * k, 720 * k), fill=255)
    holes = ImageChops.multiply(holes, face).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(1.5))
    return body, top, holes

# ---- h2 Things I'm batty about -------------------------------------------------------------------------------------------
def h2():
    branch = fit_w(cut('Cute Twisted Spooky Tree Branch.png'), 1100)
    hang = cut('Cute Upside-Down Wrapped Bat.png'); fly = cut('Cute Kawaii Bat with Spread Wings.png'); fold = cut('Cozy Folded-Wing Kawaii Bat.png')
    base = lambda: bg(ORANGE, 3)
    fr = []
    im = base(); S.place(im, branch, (W / 2 + 40, 170)); S.place(im, sticker(fit_w(hang, 300)), (690, 420))
    S.place(im, sticker(fit_w(hang, 240)), (300, 400), 4)
    tape(im, (W / 2, 1020), "things I'm", 'batty about', -4, colors=(INK, ORANGE))
    hand(im, (W / 2, 1300), 'my faves this month', 66, INK, -2)
    fr.append(('1 bats hang from the branch + title', im))
    for i, (bat, word_) in enumerate(((fly, 'the scrub'), (fold, 'the spray'))):
        im = base(); v = round_clip(i, 760)
        S.place(im, v, (W / 2, 1060), -3 + 6 * i)
        S.place(im, sticker(fit_w(bat, 560 if bat is fly else 330)), (W / 2 + (0 if bat is fly else 260), 470), 6 - 12 * i)
        tape(im, (W / 2, 1640), f'no. {i + 1}', word_, 3 - 6 * i, colors=(INK, ORANGE))
        fr.append((f'{i + 2} a bat flies in carrying favourite {i + 1}', im))
    im = base(); S.place(im, branch, (W / 2 + 40, 170))
    for j, x in enumerate((230, 540, 850)):
        d = ImageDraw.Draw(im); d.line((x, 210, x, 560), fill=INK + (255,), width=4)
        S.place(im, round_clip(j, 290, 10), (x, 700), (-5, 3, 6)[j])
        S.place(im, sticker(fit_w(hang, 150), 10), (x, 300))
    tape(im, (W / 2, 1180), 'which one is', 'yours?', -3, colors=(INK, ORANGE))
    hand(im, (W / 2, 1460), 'shop my faves: link in bio', 60, INK, 2)
    fr.append(('4 all three hang + CTA', im))
    return fr

# ---- h3 Caught in our web -------------------------------------------------------------------------------------------------
def h3():
    web = white_on_clear('Intricate Symmetrical Spiderweb Illustration.png', keep_dark=False)
    web.putalpha(web.split()[3].point(lambda v: v * 220 // 255))
    spider = cut_white(src('Cute Fuzzy Pom-Pom Spider Craft-2.png'))
    base = lambda: bg(PLUM, 5)
    fr = []
    im = base(); sp = sticker(fit_w(spider, 420), 12)
    ImageDraw.Draw(im).line((W / 2, 0, W / 2, 760), fill=WHITE + (230,), width=4)
    S.place(im, sp, (W / 2, 900), 0)
    hand(im, (W / 2, 1380), 'psst...', 80, CREAM, -4)
    fr.append(('1 a friendly spider drops down', im))
    im = base(); wb = fit_w(web, 1300)
    m = Image.new('L', wb.size, 0); c = (wb.width / 2, wb.height / 2)
    ImageDraw.Draw(m).pieslice((0, 0, wb.width, wb.height), -90, 150, fill=255)   # the web spins round
    part = wb.copy(); part.putalpha(ImageChops.multiply(part.split()[3], m.filter(ImageFilter.GaussianBlur(20))))
    S.place(im, part, (W / 2, 960)); S.place(im, sticker(fit_w(spider, 220), 10), (W / 2 - 280, 520), 30)
    tape(im, (W / 2, 1720), "you'll get", 'caught', 3, pattern='dots', colors=(INK, ORANGE))
    fr.append(('2 the web forms', im))
    im = base(); S.place(im, fit_w(web, 1500), (W / 2, 960))
    v = round_clip(0, 640); S.place(im, v, (W / 2, 900), -4)
    strands = fit_w(web, 1500).crop((210, 300, 1290, 1200)); strands.putalpha(strands.split()[3].point(lambda v: v * 3 // 5))
    S.place(im, strands, (W / 2, 900))
    S.place(im, sticker(fit_w(spider, 200), 10), (790, 560), -20)
    tape(im, (W / 2, 1560), 'caught by', 'the glow', -3, pattern='dots', colors=(INK, ORANGE))
    fr.append(('3 point 1 gets caught in the web', im))
    im = base(); half = fit_w(web, 1700); half = half.crop((0, half.height // 2, half.width, half.height))
    S.place(im, half, (W / 2, half.height / 2 - 20))
    for j, (x, y, d_) in enumerate(((220, 380, 290), (540, 660, 310), (860, 380, 290))):
        S.place(im, round_clip(j, d_, 10), (x, y), (-6, 2, 7)[j])
    S.place(im, sticker(fit_w(spider, 200), 10), (W / 2, 120))
    for j, (x, w_) in enumerate(((220, 'glow'), (540, 'scent'), (860, 'price'))):
        hand(im, (x, (380, 660, 380)[j] + 195), w_, 56, CREAM)
    tape(im, (W / 2, 1300), 'get caught', 'link in bio', -2, pattern='dots', colors=(INK, ORANGE))
    fr.append(('4 zoom out: half web holds every point + CTA', im))
    return fr

# ---- h4 What's inside? ----------------------------------------------------------------------------------------------------
def h4():
    body, lid, holes = pumpkin_parts()
    lit = cut('Bottom-Lit Jack-o’-Lantern on White.png', tol=20)
    base = lambda: bg((44, 30, 52), 7)
    s = 1000 / body.width
    sz = lambda im: im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    B, L, Hm = sz(body), sz(lid), sz(holes)
    pos = ((W - B.width) // 2, 560)
    fr = []
    im = base(); im.alpha_composite(B, pos); im.alpha_composite(L, pos)
    tape(im, (W / 2, 330), "what's", 'inside?', -4, pattern='gingham', colors=(ORANGE, WHITE))
    fr.append(("1 the pumpkin, lid on: what's inside?", im))
    im = base(); glow(im, L, (pos[0], pos[1] + 60), (255, 190, 80), 50, 255); glow(im, L, (pos[0], pos[1] + 60), (255, 220, 120), 25, 255); im.alpha_composite(B, pos)
    S.place(im, L.rotate(-14, expand=True, resample=Image.BICUBIC), (pos[0] + B.width // 2 + 120, pos[1] - 40))
    hand(im, (W / 2, 330), 'ooh, the lid lifts', 70, CREAM, -3)
    fr.append(('2 the lid lifts, a glow spills out', im))
    im = base(); v = ImageOps.fit(clip(1), B.size); v.putalpha(Hm)
    glow(im, v, pos, (255, 160, 50), 30, 255); im.alpha_composite(B, pos); im.alpha_composite(v, pos)
    S.place(im, L.rotate(-14, expand=True, resample=Image.BICUBIC), (pos[0] + B.width // 2 + 120, pos[1] - 40))
    tape(im, (W / 2 - 120, 300), 'something', 'new', 3, pattern='gingham', colors=(ORANGE, WHITE))
    fr.append(('3 the clip glows through the carved face', im))
    im = clip(1).copy()
    mouth = Hm.resize((Hm.width * 3, Hm.height * 3)); frame = Image.new('RGBA', mouth.size, (44, 30, 52, 255))
    S.place(im, sticker(fit_w(L, 360), 12), (850, 250), 12)
    tape(im, (W / 2, 1650), 'new drop', 'Oct 24', -3, pattern='gingham', colors=(ORANGE, WHITE))
    fr.append(('4 zoom through the face: the clip fills the frame', im))
    im = base(); Lt = fit_w(lit, 900); glow(im, Lt, ((W - Lt.width) // 2, 720), (255, 150, 40), 80, 140)
    im.alpha_composite(Lt, ((W - Lt.width) // 2, 720))
    tape(im, (W / 2, 400), 'drops Oct 24', 'link in bio', -2, pattern='gingham', colors=(ORANGE, WHITE))
    fr.append(('5 lit pumpkin + CTA', im))
    return fr

# ---- h5 Trick or treat ----------------------------------------------------------------------------------------------------
def door(name, video=None):
    im = src(name).convert('RGBA'); k = 1024 / 600
    box = (int(150 * k) - 70, int(70 * k), int(150 * k) - 70 + 620, int(70 * k) + int(620 * 16 / 9))
    crop = im.crop(box).resize((W, H), Image.LANCZOS)
    if video is not None:     # the hallway beyond the open door shows the clip
        sx = W / 620; x0, x1 = int((152 * k - box[0]) * sx), int((296 * k - box[0]) * sx)
        out = Image.new('RGBA', (W, H)); out.alpha_composite(ImageOps.fit(video, (x1 - x0, H)), (x0, 0))
        door_ = crop.copy(); m = Image.new('L', (W, H), 255); ImageDraw.Draw(m).rectangle((x0 + 6, 0, x1 - 6, int(1180 * H / 1920)), fill=0)
        door_.putalpha(m.filter(ImageFilter.GaussianBlur(3))); out.alpha_composite(door_); crop = out
    return crop

def h5():
    corn, worm = candy()
    fr = []
    im = door('Warmly Lit Traditional Entryway.png')
    hand(im, (W / 2 - 60, 520), 'knock', 96, WHITE, -8); hand(im, (W / 2 + 120, 680), 'knock', 96, WHITE, 6)
    tape(im, (W / 2, 1560), '', 'trick or treat?', -3, pattern='stripes', colors=(INK, ORANGE))
    fr.append(('1 knock knock: the closed door', im))
    im = door('Warm Townhouse Entryway at Night.png', clip(2))
    tape(im, (W / 2, 1560), 'the trick', 'cheap sponges', 3, pattern='stripes', colors=(INK, ORANGE))
    fr.append(('2 door opens on the TRICK (the mistake)', im))
    im = door('Warm Townhouse Entryway at Night.png', clip(0))
    for j, (x, y, r) in enumerate(((180, 1250, 20), (880, 1180, -30), (760, 1420, 50), (300, 1460, -10))):
        S.place(im, sticker(fit_w(corn if j % 2 == 0 else worm, 190 if j % 2 == 0 else 300), 10), (x, y), r)
    tape(im, (W / 2, 1700), 'the treat', 'our scrub', -3, pattern='stripes', colors=(INK, ORANGE))
    fr.append(('3 knock again: the TREAT + candy spills out', im))
    im = ImageOps.fit(src('pexels-kalei-winfield-501837032-16115259.jpg').convert('RGBA'), (W, H))
    tape(im, (W / 2, 520), 'comment', 'TREAT', -4, pattern='stripes', colors=(INK, ORANGE))
    tape(im, (W / 2 + 60, 760), '', 'for the code', 3, pattern='stripes', colors=(INK, ORANGE), length=600, accent=False)
    S.place(im, sticker(fit_w(corn, 170), 10), (170, 300), -18); S.place(im, sticker(fit_w(worm, 260), 10), (900, 860), 14)
    fr.append(('4 CTA on the porch', im))
    return fr

# ---- h6 Once in a blood moon ----------------------------------------------------------------------------------------------
def h6():
    sky = night_sky(); moon = moon_disc(1000); cl = clouds(1700)
    house, wolf = house_glowing(), white_on_clear('Howling Wolf Silhouette.png')
    tree = src('Twisted Haunted Tree Silhouette.png').convert('RGBA')
    bat = cut('Cute Kawaii Bat with Spread Wings.png')
    mp = ((W - 1000) // 2, 560)
    fr = []
    im = sky.copy(); glow(im, moon, mp, (255, 240, 220), 60, 120); im.alpha_composite(moon, mp)
    hand(im, (W / 2, 330), 'once in a...', 90, CREAM, -3)
    fr.append(('1 a huge full moon', im))
    im = sky.copy(); im.alpha_composite(moon, mp); S.place(im, cl, (W / 2 - 200, 1100), 0); S.place(im, cl, (W / 2 + 350, 700), 180)
    hand(im, (W / 2, 330), 'once in a...', 90, CREAM, -3)
    fr.append(('2 clouds drift over it', im))
    im = sky.copy(); bm = blood(moon); glow(im, bm, mp, (230, 60, 30), 90, 230); im.alpha_composite(bm, mp)
    S.place(im, cl, (W / 2 + 420, 1350), 0)
    tape(im, (W / 2, 330), 'once in a', 'blood moon', -3, pattern='stripes', colors=(INK, (150, 30, 24)))
    fr.append(('3 the moon turns blood red', im))
    im = sky.copy(); v = ImageOps.fit(clip(0), (1000, 1000)); v.putalpha(moon.split()[3])
    glow(im, bm, mp, (230, 60, 30), 90, 230); im.alpha_composite(bm, mp)
    v2 = Image.blend(v.convert('RGB'), blood(moon).convert('RGB'), 0.18).convert('RGBA'); v2.putalpha(moon.split()[3]); im.alpha_composite(v2, mp)
    hs = fit_w(house, 900); im.alpha_composite(hs, ((W - hs.width) // 2, H - hs.height + 40))
    S.place(im, fit_w(bat, 260), (210, 470), -12)
    tape(im, (W / 2, 330), 'our once-a-year', 'sale', -3, pattern='stripes', colors=(INK, (150, 30, 24)))
    fr.append(('4 the moon becomes the clip, the house pops up', im))
    im = sky.copy(); v = ImageOps.fit(clip(3), (1000, 1000)); v.putalpha(moon.split()[3])
    glow(im, bm, mp, (230, 60, 30), 90, 230); im.alpha_composite(v, mp)
    wf = fit_w(wolf, 520); im.alpha_composite(wf, (90, 1560 - wf.height + 60))
    tr = fit_w(tree, 700); im.alpha_composite(tr, (W - tr.width + 160, H - tr.height + 20))
    tape(im, (W / 2, 330), 'everything', '30% off', 3, pattern='stripes', colors=(INK, (150, 30, 24)))
    fr.append(('5 the wolf howls: the deal', im))
    im = sky.copy(); glow(im, bm, mp, (230, 60, 30), 90, 230); im.alpha_composite(bm, mp)
    S.place(im, cl, (W / 2, 1250), 0); im.alpha_composite(tr, (W - tr.width + 160, H - tr.height + 20))
    S.place(im, fit_w(bat, 220), (850, 420), 10); S.place(im, fit_w(bat, 160), (230, 1120), -8)
    tape(im, (W / 2, 900), 'ends Oct 31', 'link in bio', -2, pattern='stripes', colors=(INK, (150, 30, 24)))
    fr.append(('6 CTA', im))
    return fr

def save(tid, frames):
    out = E.PACK / 'halloween' / DIRS[tid] / 'storyboard'; out.mkdir(parents=True, exist_ok=True)
    frames = [(n.replace(':', ' -').replace('?', ''), f) for n, f in frames]   # Windows file names: no : or ?
    for n, f in frames: f.convert('RGB').save(out / f'{n}.jpg', quality=90)
    cols = len(frames); sheet = Image.new('RGB', (W * cols + 20 * (cols - 1), H + 140), (240, 236, 228)); d = ImageDraw.Draw(sheet)
    for i, (n, f) in enumerate(frames):
        sheet.paste(f.convert('RGB'), (i * (W + 20), 140)); d.text((i * (W + 20) + 10, 30), n[:38], font=F(SANS, 56), fill=INK)
    sheet.resize((sheet.width // 3, sheet.height // 3), Image.LANCZOS).save(out / f'storyboard-{tid}.jpg', quality=90)
    print('saved', out)

if __name__ == '__main__':
    for tid in sys.argv[1:] or list(DIRS):
        save(tid, globals()[tid]())
