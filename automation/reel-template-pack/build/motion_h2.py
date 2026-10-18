"""Rough motion test for h2 "Things I'm batty about" (Halloween pack): favourites (best-sellers, a gift guide, tools I
use) with a keyword CTA. Follows FRAMEWORK.md and her h2 notes (round 4): one background video at a time with the bats
as the animation, no dark bands behind words, everything sharp, her peppermint-swirl idea, and the bat-shaped window
she loved ("very clever") made big.
Beats (balanced: full-frame video with accents, a words-only intermission, collage moments):
 1 clip 1 full screen; a peppermint swirl of bats spirals out and away; BATTY in glossy lilac lettering (h2's own)
 2 intermission: dark textured backdrop, a bat lands on a branch, "my top 3"
 3 favourite 1 flies in inside a big bat-shaped window, then we zoom into it; a bat brings a real kraft tag with its name
 4 a flock of bats passes across the screen: the transition to favourite 2
 5 the bats swirl in, close over the clip and swirl open onto favourite 3
 6 CTA: three bats hang from the branch above three video tiles; Comment BATTY
v2 (her note): only favourite 1 gets a kraft tag ("1 was cute, then it took over the theme").
Usage: python build/motion_h2.py  ->  halloween/h2-batty-about/preview/motion-test.mp4
"""
import math, random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageChops, ImageEnhance
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import storyboard_halloween as B

W, H, FPS, END = 1080, 1920, 30, 15.0
OUT = E.PACK / 'halloween' / 'h2-batty-about' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
INK, LILAC, DEEP = (28, 20, 34), (206, 172, 214), (92, 58, 120)
BOLD, STOUT = 'C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/GOUDYSTO.TTF'
LIB = E.PACK / 'assets' / 'props' / 'source'
CLIPS = {'a': ('IMG_1439', 1.0), 'b': ('IMG_1385', 0.5), 'c': ('IMG_1447', 0.3), 'd': ('IMG_1460', 1.0)}

def extract(key, secs=6.0):
    name, t0 = CLIPS[key]; d = TMP / key; d.mkdir(exist_ok=True)
    if not any(d.glob('*.jpg')):
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t0), '-t', str(secs), '-i', str(E.FOOTAGE / f'{name}.MOV'),
                        '-vf', f'{B.S.TONE},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}',
                        '-q:v', '3', str(d / '%04d.jpg')], check=True)
    return sorted(d.glob('*.jpg'))
FR = {k: extract(k) for k in CLIPS}
def vid(key, t): fs = FR[key]; return Image.open(fs[min(len(fs) - 1, max(0, int(t * FPS)))]).convert('RGBA')

def clamp(x): return max(0.0, min(1.0, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def back_out(x, s=2.0): x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s)

# ---- props ----------------------------------------------------------------------------------------------------------------
def cached(name, fn):
    p = TMP / 'props' / f'{name}.png'; p.parent.mkdir(exist_ok=True)
    if not p.exists(): fn().save(p)
    return Image.open(p).convert('RGBA')
FLY = cached('bat-fly', lambda: B.cut('Cute Kawaii Bat with Spread Wings.png', tol=8))
HANG = cached('bat-hang', lambda: B.cut('Cute Upside-Down Wrapped Bat.png', tol=8))
def _real_branch():
    """v2 (more mixed media): a real bare limb, cut from her bare-tree photo, instead of the drawn branch."""
    im = Image.open(B.SRC / 'Twisting bare tree on white-46.png').convert('RGB').crop((260, 30, 1300, 470))
    g = ImageOps.grayscale(im); out = im.convert('RGBA')
    out.putalpha(g.point(lambda v: max(0, min(255, (232 - v) * 4))))      # keyed by darkness: fine twigs keep, white goes
    return out.crop(out.getbbox())
BRANCH = cached('branch', lambda: B.cut('Cute Twisted Spooky Tree Branch.png', tol=8))   # v3: her drawn branch (the real tree was a no)
def _ticket():
    t = B.cut_white(Image.open(LIB / 'images' / 'Blank cream ticket stub on white-18.png'), tol=8); return t.crop(t.getbbox())
TICKET = cached('ticket', _ticket)
def ticket(text, w=620):
    """A real cream ticket stub with the favourite's name on it (editable words in Arial Bold)."""
    tk = sized(TICKET, w, f'tk{w}').copy(); f = E.ImageFont.truetype(BOLD, int(w * 0.085))
    ImageDraw.Draw(tk).text((tk.width * 0.4, tk.height * 0.5), text, font=f, fill=INK + (255,), anchor='mm'); return tk
def _tag():
    im = B.cut_white(Image.open(LIB / 'images' / 'Blank kraft hang tag with twine-114.png'), tol=8)
    a = im.split()[3]; g = ImageOps.grayscale(im.convert('RGB'))
    hole = g.point(lambda v: 0 if v > 244 else 255)          # the white inside the twine loop must be see-through
    im.putalpha(ImageChops.multiply(a, hole)); return im.crop(im.getbbox())
TAG = cached('kraft-tag', _tag)
def _backdrop():
    """h2's night: her hand-painted dots on black, tiled small and recoloured to a muted bat-night purple."""
    g = ImageOps.grayscale(Image.open(LIB / 'doodles' / 'Playful hand-painted dots on black-13.png')).resize((720, 720))
    tile = Image.new('L', (W, H))
    for y in range(0, H, 720):
        for x in range(0, W, 720): tile.paste(g, (x, y))
    return ImageOps.colorize(tile, (24, 16, 32), (92, 66, 112)).convert('RGBA')
BACKDROP = _backdrop()
def _backdrop_two_tone():
    """End screen (v4, her note): the top, where the branch and bats hang, is a light lavender version of the same
    dotted night so the dark bats show; it fades into the dark dots lower down, where the words sit."""
    g = ImageOps.grayscale(Image.open(LIB / 'doodles' / 'Playful hand-painted dots on black-13.png')).resize((720, 720))
    tile = Image.new('L', (W, H))
    for y in range(0, H, 720):
        for x in range(0, W, 720): tile.paste(g, (x, y))
    light = ImageOps.colorize(tile, (214, 196, 228), (238, 228, 244)).convert('RGBA')
    m = Image.new('L', (1, H)); mp = m.load()
    for y in range(H): mp[0, y] = int(255 * (1 - ease((y - 820) / 260)))
    out = BACKDROP.copy(); out.paste(light, (0, 0), m.resize((W, H))); return out
BACKDROP_END = _backdrop_two_tone()
_c = {}
def sized(im, w, key):
    k = (key, int(w))
    if k not in _c: _c[k] = B.fit_w(im, max(8, int(w)))
    return _c[k]
def put(img, im, c, rot=0, shadow=True):
    if rot: im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
    if shadow: im = E.C.shadow(im, (6, 12), 12, 80)
    img.alpha_composite(im, (int(c[0] - im.width / 2), int(c[1] - im.height / 2)))

# ---- lettering: Goudy Stout, glossy lilac (the bats' inner ears), deep-purple edge ------------------------------------------
_L = {}
def glossy(text, px):
    if (text, px) in _L: return _L[(text, px)]
    f = E.ImageFont.truetype(STOUT, px); bb = f.getbbox(text); pad = px // 3 + 24
    w, h = bb[2] - bb[0] + 2 * pad, bb[3] - bb[1] + 2 * pad; org = (pad - bb[0], pad - bb[1])
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text(org, text, font=f, fill=255)
    e = Image.new('L', (w, h), 0); ImageDraw.Draw(e).text(org, text, font=f, fill=255, stroke_width=max(6, px // 11))
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sh = Image.new('RGBA', (w, h), INK + (255,)); sh.putalpha(e); out.alpha_composite(sh, (px // 18, px // 12))
    k = Image.new('RGBA', (w, h), INK + (255,)); k.putalpha(e); out.alpha_composite(k)
    fill = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(fill)
    d.rectangle((0, 0, w, h), fill=(200, 160, 216, 255))      # v3: solid, opaque lilac (the glossy version read as see-through)
    fill.putalpha(m); out.alpha_composite(fill)
    _L[(text, px)] = out; return out
def pop_word(img, t, t0, text, c, px, rot=0):
    if t < t0: return
    k = back_out((t - t0) / 0.3, 2.4); im = glossy(text, px)
    im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.BICUBIC)
    put(img, im, c, rot + 4 * math.sin(t * 3), shadow=False)
def line(img, t, t0, text, xy, px=70, fill=(255, 255, 255), stroke=INK):
    if t < t0: return
    k = back_out((t - t0) / 0.25); f = E.ImageFont.truetype(BOLD, max(6, int(px * (0.6 + 0.4 * k))))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text(xy, text, font=f, fill=fill + (255,), anchor='mm', stroke_width=max(4, px // 12) if stroke else 0,
                             stroke_fill=(stroke + (255,)) if stroke else None)
    img.alpha_composite(lay)

def tag_with(text, w=380, video=None, t=0):
    """The real kraft tag, with the favourite's name written on it (or a small clip tile in place of the words)."""
    tg = sized(TAG, w, f'tag{w}').copy(); d = ImageDraw.Draw(tg)
    if video is not None:
        tw, th = int(tg.width * 0.62), int(tg.height * 0.5); v = ImageOps.fit(video, (tw, th))
        tg.alpha_composite(v, ((tg.width - tw) // 2, int(tg.height * 0.36)))
    else:
        f = E.ImageFont.truetype(BOLD, max(10, int(w * 0.15)))
        d.text((tg.width / 2, tg.height * 0.6), text, font=f, fill=INK + (255,), anchor='mm')
    return tg

def bat_carry(img, t, t0, tag, c_end, w=300, from_x=1300):
    """A bat flies in carrying a tag on two strands of twine, then hovers with a gentle flap."""
    if t < t0: return
    u = back_out((t - t0) / 0.6, 1.4); x = from_x + (c_end[0] - from_x) * u; y = c_end[1] - 180 * (1 - ease((t - t0) / 0.6)) + 10 * math.sin(t * 7)
    bat = sized(FLY, w, f'fly{w}'); flap = 1 + 0.06 * math.sin(t * 22)
    bat = bat.resize((int(bat.width * flap), int(bat.height / flap)))
    ty = y + bat.height * 0.45 + tag.height * 0.55
    d = ImageDraw.Draw(img); d.line((x - 20, y + bat.height * 0.25, x - 10, ty - tag.height * 0.42), fill=(150, 120, 80, 255), width=4)
    d.line((x + 20, y + bat.height * 0.25, x + 10, ty - tag.height * 0.42), fill=(150, 120, 80, 255), width=4)
    put(img, tag, (x, ty), 4 * math.sin(t * 3)); put(img, bat, (x, y), -6 * math.sin(t * 4))

def bat_window(video, w):
    b = sized(FLY, w, f'win{w}'); v = ImageOps.fit(video, b.size)
    v.putalpha(b.split()[3].point(lambda a: 255 if a > 100 else 0)); return v

import doodles as D
DOO = {'sparkle': D.get('icons', 9, (255, 255, 255), 190), 'sparkle2': D.get('icons', 11, LILAC, 220),
       'crown': D.get('icons', 5, LILAC, 230), 'arrow': D.get('arrows', 3, (255, 255, 255), 300), 'heart': D.get('icons', 2, LILAC, 230),
       'burst': D.get('bursts', 0, LILAC, 260), 'arrow2': D.get('arrows', 0, LILAC, 250), 'under': D.get('underlines', 3, LILAC, 520)}

def frame(t):
    # 0.0-1.8 clip 1 full screen; a peppermint swirl of bats spirals out and away; BATTY
    if t < 1.8:
        im = vid('a', t); th = 0.0
        while th < 4.4 * math.pi:
            r0 = 40 + 60 * th; age = t * 2.2 - th / (4.4 * math.pi) * 0.6
            if age > 0:
                r = r0 * (1 + 2.2 * ease(max(0, age - 0.7))); a = th + age * 1.2
                x, y = W / 2 + r * math.cos(a), 960 + r * math.sin(a) * 1.15
                if -150 < x < W + 150 and -150 < y < H + 150:
                    put(im, sized(FLY, 70 + r0 * 0.30, f'f{int(70 + r0 * 0.30)}'), (x, y), -math.degrees(a) - 90, shadow=False)
            th += 0.55 + 120 / (60 * th + 160)
        line(im, t, 0.35, "things I'm", (540, 640), 80)
        pop_word(im, t, 0.6, 'BATTY', (540, 820), 122, -3)
        line(im, t, 0.95, 'about', (540, 1010), 80)
        D.draw_on(im, DOO['sparkle'], (170, 520), t, 1.0, 0.3); D.draw_on(im, DOO['sparkle2'], (900, 1200), t, 1.2, 0.3)   # sparkles round the hook
    # 1.8-3.0 intermission: dark backdrop, a bat drops onto the branch, MY TOP 3
    elif t < 3.0:
        im = BACKDROP.copy(); bx = 640 - 160 * (1 - ease((t - 1.8) / 0.35))
        put(im, sized(BRANCH, 1150, 'br'), (bx, 300))
        k = back_out((t - 2.05) / 0.35)
        if t > 2.05: put(im, sized(HANG, 230 * max(0.1, k), f'h{int(230 * max(0.1, k))}'), (760, 470 + 6 * math.sin(t * 5)), 4 * math.sin(t * 4))
        pop_word(im, t, 2.2, 'MY TOP', (500, 960), 112, -2); pop_word(im, t, 2.45, '3', (500, 1200), 260, 4)
    # 3.0-5.8 favourite 1: a big bat-shaped window flies in carrying clip 2, then we zoom into it; a bat brings its tag
    elif t < 5.8:
        if t < 4.0:
            im = BACKDROP.copy(); u = back_out((t - 3.0) / 0.55, 1.3); x = 1700 + (540 - 1700) * u
            put(im, bat_window(vid('b', t - 3.0), 1180), (x, 900 + 30 * math.sin(t * 6)), -8 * (1 - clamp((t - 3.0) / 0.55)))
            if t > 3.6:   # zoom into the bat's body: the clip becomes the screen
                z = ease((t - 3.6) / 0.4); bw = int(1180 * (1 + 5 * z)); win = bat_window(vid('b', t - 3.0), bw)
                im2 = BACKDROP.copy(); im2.alpha_composite(win, (int(540 - win.width / 2), int(900 - win.height * 0.52)))
                im = im2
        else:
            im = vid('b', t - 3.0)
            bat_carry(im, t, 4.2, tag_with('[favourite 1]'), (300, 560))
            pop_word(im, t, 4.5, '1', (820, 420), 220, 6)
            D.draw_on(im, DOO['crown'], (820, 230), t, 4.8, 0.3, 8); D.draw_on(im, DOO['arrow'], (560, 900), t, 5.0, 0.35, 15)   # number 1 is crowned; point at it
    # 5.8-6.5 a flock of bats passes across the screen: the transition to favourite 2
    elif t < 6.5:
        u = (t - 5.8) / 0.7; im = vid('b', t - 3.0) if u < 0.5 else vid('c', t - 5.8)
        r = random.Random(3)
        for i in range(34):
            y = r.uniform(-100, H + 100); w = r.uniform(180, 420); sp = r.uniform(0.9, 1.3)
            x = -400 + (W + 800) * clamp(u * sp - r.uniform(0, 0.25) + 0.15)
            put(im, sized(FLY, w, f'f{int(w)}'), (x, y + 30 * math.sin(t * 9 + i)), r.uniform(-15, 15), shadow=False)
    # 6.5-9.0 favourite 2 full screen: the big glossy number and its name (v2: only favourite 1 gets a tag)
    elif t < 9.0:
        im = vid('c', t - 5.8)
        pop_word(im, t, 6.6, '2', (540, 420), 240, -6)
        if t > 6.95: put(im, ticket('[favourite 2]'), (540, 650 + 30 * (1 - back_out((t - 6.95) / 0.35))), -3)
        D.draw_on(im, DOO['heart'], (850, 1150), t, 7.4, 0.35, -8)        # loved
    # 9.0-9.9 the bats swirl in from the edges, close over favourite 2, and swirl open onto favourite 3
    elif t < 9.9:
        u = (t - 9.0) / 0.9; close = ease(u / 0.5) if u < 0.5 else 1 - ease((u - 0.5) / 0.5)
        im = vid('c', t - 5.8) if u < 0.5 else vid('d', t - 9.0); th = 0.0
        while th < 4.6 * math.pi:
            r0 = 40 + 60 * th; r = r0 + (1 - close) * 1400; a = th + u * 5
            x, y = W / 2 + r * math.cos(a), 960 + r * math.sin(a) * 1.15
            if -150 < x < W + 150 and -150 < y < H + 150:
                put(im, sized(FLY, 80 + r0 * 0.32, f'f{int(80 + r0 * 0.32)}'), (x, y), -math.degrees(a) - 90, shadow=False)
            th += 0.5 + 100 / (60 * th + 160)
    # 9.9-12.0 favourite 3 full screen
    elif t < 12.0:
        im = vid('d', t - 9.0)
        pop_word(im, t, 10.0, '3', (540, 420), 240, 6)
        if t > 10.35: put(im, ticket('[favourite 3]'), (540, 650 + 30 * (1 - back_out((t - 10.35) / 0.35))), 3)
        put(im, sized(FLY, 230, 'f230'), (860 - 40 * math.sin(t * 2), 330 + 20 * math.sin(t * 5)), 8 * math.sin(t * 4), shadow=False)
        D.draw_on(im, DOO['burst'], (200, 1180), t, 10.8, 0.3)         # wow
    # 12.0-15.0 CTA: three bats hang from the branch above three video tiles (1, 2, 3); Comment BATTY
    else:
        im = BACKDROP_END.copy(); put(im, sized(BRANCH, 1150, 'br'), (600, 260))
        for j, (x, key, st) in enumerate(((230, 'b', 3.0), (540, 'c', 5.8), (850, 'd', 9.0))):
            k = back_out((t - 12.05 - j * 0.15) / 0.35)
            if k <= 0: continue
            sw = 3 * math.sin(t * 3 + j)
            put(im, sized(HANG, 170, 'h170'), (x, 410 + 4 * math.sin(t * 5 + j)), sw)
            tw, th_ = int(270 * max(0.1, k)), int(400 * max(0.1, k))
            put(im, ImageOps.fit(vid(key, t - st), (tw, th_)), (x, 720), (-3, 2, 4)[j])
            pop_word(im, t, 12.3 + j * 0.15, str(j + 1), (x, 960), 110, (-6, 4, 6)[j])
        line(im, t, 12.8, 'comment', (540, 1100), 80)
        pop_word(im, t, 13.0, 'BATTY', (540, 1240), 122, -3)
        line(im, t, 13.4, "and I'll send all 3 links", (540, 1455), 60)
        D.draw_on(im, DOO['arrow2'], (150, 1100), t, 13.1, 0.3); D.draw_on(im, DOO['under'], (540, 1372), t, 13.3, 0.3)   # point at it, underline BATTY
    return im.convert('RGB')

def main():
    fdir = TMP / 'out'; fdir.mkdir(exist_ok=True)
    for i in range(int(END * FPS)): frame(i / FPS).save(fdir / f'{i:04d}.jpg', quality=88)
    mp4 = OUT / 'motion-test.mp4'
    subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-framerate', str(FPS), '-i', str(fdir / '%04d.jpg'), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', str(mp4)], check=True)
    print('saved', mp4)

if __name__ == '__main__':
    main()
