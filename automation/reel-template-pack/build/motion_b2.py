"""Rough motion tests for the physical pack's batch 2 (#07, #11, #15, #20), the motion_h6.py way: a quick render with
stand-in footage (her July clips) that shows every transition, the background layers moving and the doodles doing
their jobs. Not the CapCut build; that comes after she approves the motion.

Every object is one of her real photos (cut out by storyboard_b2.py); the drawn layer is her own marker doodles,
drawn on as you watch. Each scene has 2 to 3 background layers (a wash or texture, a torn paper band with her painted
dots or marks, drifting real things) that move at different speeds and change at every clip change.
Usage: python build/motion_b2.py 11 [frame seconds...]  ->  NN-.../preview/motion-test.mp4  (or stills of those times)

Superseded the same day by the collage versions in build/collage_b2.py (FRAMEWORK.md "The look: collage"), which
reuse this file's helpers and setups (clips, clock wheel, hands, spotlights, postcards). Render with collage_b2.py.
"""
import math, random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import collage as C
import storyboard_b2 as S
from storyboard_b2 import W, H, INK, WHITE, CREAM, BOLD, HAND, F, dd, ARROWS, BURSTS, ICONS, LINES, GLYPHS

FPS = 30
VID = S.CACHE / 'video'

# ---- timing --------------------------------------------------------------------------------------------------------
def clamp(x): return max(0.0, min(1.0, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def back_out(x, s=1.9): x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s)
def seg(t, t0, t1): return clamp((t - t0) / (t1 - t0))
def lerp(a, b, u): return a + (b - a) * u
def lerp2(a, b, u): return (lerp(a[0], b[0], u), lerp(a[1], b[1], u))

# ---- footage ---------------------------------------------------------------------------------------------------------
class Clip:
    """A stand-in clip as frames at 30 fps; at(t, size) is the frame t seconds in, filled to size."""
    def __init__(self, name, t0, secs=5.0):
        d = VID / f'{name}-{t0}'; d.mkdir(parents=True, exist_ok=True)
        if not any(d.glob('*.jpg')):
            src = next(E.FOOTAGE.glob(name + '.*'))
            subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t0), '-t', str(secs), '-i', str(src),
                            '-vf', f'{S.TONE},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}',
                            '-q:v', '3', str(d / '%04d.jpg')], check=True)
        self.fs = sorted(d.glob('*.jpg')); self._c = {}
    def at(self, t, size=(W, H)):
        i = min(len(self.fs) - 1, max(0, int(t * FPS))); size = (int(size[0]), int(size[1])); k = (i, size)
        if k not in self._c:
            if len(self._c) > 16: self._c.clear()
            self._c[k] = ImageOps.fit(Image.open(self.fs[i]).convert('RGBA'), size, Image.BILINEAR)
        return self._c[k].copy()

# ---- drawing ---------------------------------------------------------------------------------------------------------
def put(img, item, c, scale=1.0, rot=0, alpha=1.0):
    if scale <= 0.01 or alpha <= 0.01: return
    it = item if abs(scale - 1) < 1e-3 else item.resize((max(1, int(item.width * scale)), max(1, int(item.height * scale))), Image.BILINEAR)
    if rot: it = it.rotate(rot, expand=True, resample=Image.BICUBIC)
    if alpha < 1: it = it.copy(); it.putalpha(it.split()[3].point(lambda v: int(v * alpha)))
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def draw_on(img, item, c, u, rot=0, alpha=1.0):
    """A doodle or handwriting appearing left to right, as if drawn while you watch."""
    if u <= 0: return
    it = item
    if u < 1:
        it = item.copy(); a = it.split()[3]; ImageDraw.Draw(a).rectangle((int(item.width * u), 0, item.width, item.height), fill=0); it.putalpha(a)
    put(img, it, c, 1, rot, alpha)

def pop(img, item, t, t0, c, rot=0, out=None, dur=0.3, wiggle=0):
    """In with a bounce at t0, a little wiggle while it stays, out with a quick shrink at `out`."""
    if t < t0: return
    k = back_out(seg(t, t0, t0 + dur), 2.2)
    if out is not None: k *= 1 - ease(seg(t, out, out + 0.18))
    put(img, item, c, k, rot + (wiggle * math.sin(t * 7) if t > t0 + dur else 0))

def hero(img, t, t0, ls, c, out=None, step=0.07):
    """Built-in lettering: each letter pops in on its own at its own tilt, then the word bobs."""
    for i, (im, dx) in enumerate(ls):
        ti = t0 + i * step
        if t < ti: continue
        k = back_out(seg(t, ti, ti + 0.3), 2.4)
        if out is not None: k *= 1 - ease(seg(t, out + i * 0.03, out + i * 0.03 + 0.18))
        rot = S.TILTS[i % len(S.TILTS)] * (1 + (1 - clamp(k)) * 3)
        bob = 5 * math.sin(t * 5 + i * 0.8) if t > ti + 0.35 else 0
        put(img, im, (c[0] + dx, c[1] + bob), k, rot)

def slide(img, item, t, t0, t1, a, b, rot=0, fn=ease):
    if t < t0: return
    put(img, item, lerp2(a, b, fn(seg(t, t0, t1))), 1, rot)

def tex(folder, name, size): return ImageOps.fit(S.raw(folder, name), (int(size[0]), int(size[1])), Image.LANCZOS).convert('RGBA')

def drift(img, layer, t, vx=0, vy=0, x0=0, y0=0, alpha=1.0):
    """A background layer bigger than the screen, drifting at its own speed (parallax)."""
    x = x0 - (vx * t) % max(1, layer.width - W) if vx else x0
    y = y0 - (vy * t) % max(1, layer.height - H) if vy else y0
    if alpha < 1: layer = layer.copy(); layer.putalpha(layer.split()[3].point(lambda v: int(v * alpha)))
    img.alpha_composite(layer, (int(x), int(y)))

def torn_band(texture, size, seed=5, edges='t', depth=16):
    """A strip of patterned paper with a torn edge and a soft shadow."""
    p = ImageOps.fit(texture, size, Image.LANCZOS).convert('RGBA'); p.putalpha(C.torn_mask(size, seed, depth, edges))
    return C.shadow(p, (0, -8 if 't' in edges else 8), 12, 90)

def camera(scene, focus, s):
    """Look at the scene as a camera would: s > 1 zooms in on focus (scene coordinates)."""
    if s <= 1.001: return scene
    w, h = W / s, H / s; x = min(max(focus[0] - w / 2, 0), W - w); y = min(max(focus[1] - h / 2, 0), H - h)
    return scene.crop((int(x), int(y), int(x + w), int(y + h))).resize((W, H), Image.BILINEAR)

def text_img(text, font, px, fill=WHITE, edge=INK, sw=5):
    f = F(font, px); im = Image.new('RGBA', (int(f.getlength(text) + 4 * sw + 20), int(px * 1.6 + 4 * sw)), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((im.width / 2, im.height / 2), text, font=f, fill=fill, anchor='mm', stroke_width=sw, stroke_fill=edge); return im

def circle_mask(size, c, r, blur=2):
    m = Image.new('L', size, 0); ImageDraw.Draw(m).ellipse((c[0] - r, c[1] - r, c[0] + r, c[1] + r), fill=255)
    return m.filter(ImageFilter.GaussianBlur(blur)) if blur else m

def screen(base, light):
    out = ImageChops.screen(base.convert('RGB'), light.convert('RGB')).convert('RGBA'); return out

def render(tid, frame, secs, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True); fdir = S.CACHE / f'motion-out-{tid}'; fdir.mkdir(exist_ok=True)
    for f in fdir.glob('*.jpg'): f.unlink()
    for i in range(int(secs * FPS)):
        frame(i / FPS).convert('RGB').save(fdir / f'{i:04d}.jpg', quality=88)
    mp4 = out_dir / 'motion-test.mp4'
    subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-framerate', str(FPS), '-i', str(fdir / '%04d.jpg'), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '21', '-movflags', '+faststart', str(mp4)], check=True)
    print('saved', mp4)

# ======================================================================================================================
# 11 A day with it (12.5 s): morning clip, zoom out to the clock wheel, the wheel turns, zoom into midday, the hourglass
# flips across as the wipe to the afternoon split, night pulls down like a blind, the clock returns at night, CTA.
# Layers: the sky wash (changes colour through the day) + real clouds drifting + a torn band of her painted dots
# along the bottom; at night her dots on black + the clouds, darkened.
# ======================================================================================================================
def setup_11():
    g = {}
    g['clips'] = [Clip(n, t0) for n, t0 in (('IMG_1449', 1.0), ('IMG_1391', 1.0), ('IMG_1460', 1.0), ('IMG_1448', 1.0), ('IMG_1451', 1.0))]
    big = (W + 360, H + 200)
    g['sky'] = {k: tex('doodles', v, big) for k, v in S.SKY.items()}
    g['night'] = tex('doodles', 'Hand-painted polka dots on black-15.png', big)
    cl = S.cut('halloween', 'Ethereal Wispy Cloud Overlay.png'); g['cloud'] = S.fitw(cl, 1500)
    g['cloud_dark'] = ImageEnhance.Brightness(g['cloud']).enhance(0.45)
    g['band'] = torn_band(S.raw('doodles', 'Playful hand-painted black dots-14.png'), (W + 500, 330), 11)
    g['band2'] = torn_band(S.raw('doodles', 'Bold hand-drawn zigzag pattern-17.png'), (W + 500, 260), 12)
    cw = 1320; g['cw'] = cw; g['d'] = int(2 * S.FACE * cw)
    c = S.fitw(S.cut('fall', 'Handless vintage brass wall clock-24.png'), cw); g['clock'] = C.shadow(S.outlined(c, 16, 7, 41), (12, 18), 22, 100)
    h = g['d'] // 2; g['qmask'] = []
    for a0 in (270, 0, 90, 180):
        m = Image.new('L', (g['d'], g['d']), 0); ImageDraw.Draw(m).pieslice((0, 0, g['d'] - 1, g['d'] - 1), a0, a0 + 90, fill=255); g['qmask'].append(m)
    g['div'] = dd(LINES, 0, g['d'])
    g['hands'] = {}
    for which in ('hour', 'minute'):
        (x0, x1), (px, py) = S.HANDS[which]
        hd = S.cut('fall', 'Vintage dark brass clock hands-29.png', holes=((0.188, 0.934), (0.826, 0.934))).crop((x0, 0, x1, 1188))
        L = int(math.hypot(max(px, hd.width - px), py) + 4); cv = Image.new('RGBA', (2 * L, 2 * L), (0, 0, 0, 0))
        cv.alpha_composite(hd, (int(L - px), int(L - py))); g['hands'][which] = C.shadow(cv, (8, 12), 8, 110)
    g['alarm'] = [S.alarm(980, 0, 42, WHITE), S.alarm(300, 1, 43), S.alarm(420, 2, 48, WHITE), S.alarm(260, 1, 50, WHITE), S.alarm(280, 0, 49, WHITE)]
    g['hour'] = S.obj('images', 'Classic wooden hourglass with flowing sand-238.png', 470, 16, 6, 46)
    g['hour_big'] = S.obj('images', 'Classic wooden hourglass with flowing sand-238.png', 1500, 22, 9, 46)
    sky = lambda w: S.wash_fill(S.SKY[w])
    g['a_day'] = S.letters('A DAY', S.FONTS['dynapuff'], 230, sky('morning')); g['with_my'] = S.letters('WITH MY', S.FONTS['dynapuff'], 150, sky('morning'))
    g['comment'] = S.letters('Comment', S.FONTS['dynapuff'], 165, sky('lilac'))
    g['product'] = S.card_text('[product]', 520, 70, BOLD, strip=0.5); g['kw'] = S.card_text('"[KEYWORD]"', 560, 70, BOLD, strip=0.45)
    g['t7'] = S.card_text('[7am]', 280, 70); g['t12'] = S.card_text('[12pm]', 300, 70); g['t4'] = S.card_text('[4pm]', 300, 70); g['t9'] = S.card_text('[9pm]', 280, 66)
    g['burst'] = [dd(BURSTS, 5, 200, WHITE), dd(BURSTS, 6, 200, WHITE)]; g['sun'] = dd(BURSTS, 2, 300, WHITE)
    g['arc'] = dd(ARROWS, 2, 330, INK); g['under'] = dd(LINES, 2, 300, INK); g['diag'] = dd(LINES, 4, 1400)
    g['spark'] = [dd(ICONS, 10, 120), dd(ICONS, 8, 90), dd(ICONS, 9, 110, WHITE)]
    g['zzz'] = text_img('z z z', HAND, 90, WHITE, INK, 4); g['circle'] = S.ink_cut(S.raw('doodles', 'Ten hand-drawn doodle frames-4.png').crop((60, 40, 600, 290)), WHITE)
    return g

def sky_layers(g, img, t, a, b=None, u=0.0):
    """The sky: wash a (cross-fading to wash b by u), real clouds drifting over it, the painted-dots band along the bottom."""
    s = g['sky'][a] if b is None or u <= 0 else Image.blend(g['sky'][a], g['sky'][b], u)
    drift(img, s, t, vx=22, x0=0, y0=-100)
    put(img, g['cloud'], (900 - 60 * t % 1700, 520), 1, 0, 0.85)
    put(img, g['cloud'], (300 - 35 * t % 1600 + 1200, 1250), 0.8, 0, 0.7)
    img.alpha_composite(g['band'], (int(-(40 * t) % 400) - 400, H - 300))

def wheel_disc(g, t, lit, rot=0.0, bright=None):
    d = g['d']; h = d // 2; disc = Image.new('RGBA', (d, d), (0, 0, 0, 0))
    for q, (cl, (x, y)) in enumerate(zip(g['clips'][:4], ((h, 0), (h, h), (0, h), (0, 0)))):
        f = cl.at(t, (h, h)); k = (bright[q] if bright else (1.0 if q == lit else 0.55))
        if k < 1: f = ImageEnhance.Brightness(f).enhance(k)
        lay = Image.new('RGBA', (d, d), (0, 0, 0, 0)); lay.alpha_composite(f, (x, y)); lay.putalpha(ImageChops.multiply(lay.split()[3], g['qmask'][q]))
        disc.alpha_composite(lay)
    put(disc, g['div'], (h, h)); put(disc, g['div'], (h, h), 1, 90)
    return disc.rotate(rot, resample=Image.BICUBIC) if rot else disc

def clock_at(g, img, c, scale, disc=None, hour=0, minute=0, alpha=1.0):
    put(img, g['clock'], c, scale, 0, alpha)
    if disc is not None: put(img, disc, c, scale, 0, alpha)
    put(img, g['hands']['hour'], c, scale * 0.62 * 0.8, -hour, alpha); put(img, g['hands']['minute'], c, scale * 0.62, -minute, alpha)

def frame_11(g, t):
    cl = g['clips']; c = (540, 900); d = g['d']; slice_c = (c[0] + d / 4, c[1] - d / 4)
    if t < 2.1:                                                    # morning: the alarm rings
        im = cl[0].at(t)
        ring = 1 - seg(t, 1.3, 1.6)
        put(im, g['alarm'][0], (850 + 6 * math.sin(t * 61) * ring, 1560), 1, 14 + 5 * math.sin(t * 55) * ring)
        for k, (x, y, r) in enumerate(((430, 1150, -10), (1000, 930, 80))):
            if ring > 0 and int(t * 6 + k) % 2 == 0: put(im, g['burst'][k], (x, y), 1, r)
        hero(im, t, 0.1, g['a_day'], (520, 360), out=1.85); hero(im, t, 0.45, g['with_my'], (520, 560), out=1.9)
        slide(im, g['product'], t, 0.8, 1.1, (-400, 740), (520, 740), -3)
        pop(im, g['t7'], t, 1.1, (280, 1060), -7, out=1.9)
        return im
    if t < 4.3:                                                    # zoom out to the clock, then the wheel turns
        u = ease(seg(t, 3.1, 4.2))
        scene = Image.new('RGBA', (W, H)); sky_layers(g, scene, t, 'morning', 'noon', u)
        q_rot = 90 * u; bright = [1 - 0.45 * u, 0.55 + 0.45 * u, 0.55, 0.55]
        clock_at(g, scene, c, 1, wheel_disc(g, t, 0, q_rot, bright), 45 + 90 * u, 60 + 360 * u)
        draw_on(scene, g['arc'], (900, 380), seg(t, 3.15, 3.7), -20)
        pop(scene, g['t12'], t, 3.9, (800, 560), 6)
        if t < 3.1:
            z = ease(seg(t, 2.1, 3.0)); s = lerp(2.0, 1.0, z)
            im = camera(scene, lerp2(slice_c, (W / 2, H / 2), z), s)
            fade = 1 - seg(t, 2.1, 2.45)
            if fade > 0: im = Image.blend(im, cl[0].at(t), fade)
            return im
        return scene
    if t < 5.1:                                                    # zoom into the midday slice
        scene = Image.new('RGBA', (W, H)); sky_layers(g, scene, t, 'noon')
        clock_at(g, scene, c, 1, wheel_disc(g, t, 1, 90, [0.55, 1, 0.55, 0.55]), 135, 60)
        z = ease(seg(t, 4.3, 5.0)); im = camera(scene, slice_c, lerp(1.0, 2.0, z))
        fade = seg(t, 4.65, 5.0)
        return Image.blend(im, cl[1].at(t - 3.0), fade) if fade > 0 else im
    if t < 6.3:                                                    # midday full screen
        im = cl[1].at(t - 3.0)
        put(im, g['sun'], (880, 340), 1, t * 30)
        pop(im, g['t12'], t, 5.15, (420, 420), -4, out=6.1); draw_on(im, g['under'], (420, 540), seg(t, 5.4, 5.8))
        return im
    if t < 7.1:                                                    # the giant hourglass flips across: the wipe
        u = ease(seg(t, 6.3, 7.1))
        im = cl[1].at(t - 3.0) if u < 0.5 else afternoon(g, t, 0)
        put(im, g['hour_big'], (lerp(-700, W + 700, u), 980), 1, -180 * u)
        return im
    if t < 8.6: return afternoon(g, t, 1)
    if t < 10.9:                                                   # night pulls down like a blind; the clock returns
        im = afternoon(g, t, 1) if t < 9.4 else Image.new('RGBA', (W, H))
        y = lerp(-H - 100, -100, ease(seg(t, 8.6, 9.3)))
        drift(im, g['night'], t, vx=10, y0=y)
        put(im, g['cloud_dark'], (900 - 50 * t % 1700, y + 700), 1, 0, 0.8)
        if t >= 9.0:
            k = back_out(seg(t, 9.0, 9.4), 1.6); sw = ease(seg(t, 9.5, 10.2))
            clock_at(g, im, (540, 880), 0.9 * k, wheel_disc(g, t, 3), lerp(200, 300, sw), lerp(-200, 0, sw))
            pop(im, g['t9'], t, 9.6, (330, 600), -6)
            fall = ease(seg(t, 9.9, 10.3)); put(im, g['alarm'][2], (860, 1640), 1, 82 * fall)
            draw_on(im, g['zzz'], (620, 1420), seg(t, 10.3, 10.8), 12)
        return im
    im = Image.new('RGBA', (W, H)); drift(im, g['night'], t, vx=10, y0=-100)    # CTA
    put(im, g['cloud_dark'], (900 - 50 * t % 1700, 600), 1, 0, 0.8)
    pop(im, g['alarm'][4], t, 11.2, (110, 1700), -14); pop(im, g['alarm'][3], t, 11.35, (990, 1540), 12)
    u = ease(seg(t, 10.9, 11.4)); cc = (540, 1100); sc = lerp(0.9, 0.76, u); full = g['clips'][4].at(t - 10.9, (d, d))
    disc = Image.blend(wheel_disc(g, t, 3), full, u); disc.putalpha(circle_mask((d, d), (d / 2, d / 2), d / 2, 1))
    cy = lerp(880, 1100, u)
    clock_at(g, im, (540, cy), sc, disc, lerp(300, 360, u), lerp(0, 360, u))
    hero(im, t, 11.2, g['comment'], (540, 300)); slide(im, g['kw'], t, 11.5, 11.8, (540, -200), (540, 470), -2)
    return im

def afternoon(g, t, k):
    """The afternoon split: the clip above the diagonal, the terracotta sky below with a zigzag band, the hourglass on
    the seam (k = 0 while the wipe passes, then it drops in)."""
    im = Image.new('RGBA', (W, H)); drift(im, g['sky']['afternoon'], t, vx=18, y0=-100)
    im.alpha_composite(g['band2'], (int(-(55 * t) % 400) - 400, H - 260))
    put(im, g['cloud'], (1100 - 60 * t % 1700, 1350), 0.7, 0, 0.6)
    top = g['clips'][2].at(t - 6.3); top.putalpha(S.poly_mask((W, H), [(0, 0), (W, 0), (W, 760), (0, 1440)])); im.alpha_composite(top)
    if k:
        draw_on(im, g['diag'], (540, 1100), seg(t, 7.1, 7.6), 32.2)
        drop = back_out(seg(t, 7.2, 7.55), 1.4); put(im, g['hour'], (800, lerp(-300, 1370, drop)), 1, -8)
        pop(im, g['t4'], t, 7.5, (300, 1180), -5, out=8.45)
        for i, (x, y) in enumerate(((200, 1650), (520, 1760))):
            if int(t * 4 + i) % 3: put(im, g['spark'][i], (x, y))
    return im

# ======================================================================================================================
SETUP = {'11': setup_11}; FRAME = {'11': frame_11}; SECS = {'11': 12.5}

# ======================================================================================================================
# 15 New drop reveal (12 s): covered on stage, the curtain halves close, a countdown in lights, the halves part (real
# tickets burst out), the picture closes into a spotlight on a dark starry stage, a second spotlight swings in for the
# split, the second circle opens out to the in-use clip as the curtain frame drops back in, CTA.
# Layers: the curtain frame (valance + drapes) moves in and out; behind it the clip, or the dark stage (her painted
# dots on black drifting + two moving spotlight beams); a torn band of her wobbly checkerboard as the stage floor.
# ======================================================================================================================
def setup_15():
    g = {}
    g['clips'] = [Clip(n, t0) for n, t0 in (('IMG_1454', 1.0), ('IMG_1456', 1.0), ('IMG_1414', 1.0), ('IMG_1420', 1.0), ('IMG_1418', 1.0))]
    oc = S.cut('images', 'Open red velvet curtains revealing white backdrop-117.png'); w, h = oc.size
    g['left'] = oc.crop((0, int(h * 0.1), int(w * 0.2), h)).resize((200, H + 40), Image.LANCZOS)
    g['right'] = oc.crop((int(w * 0.8), int(h * 0.1), w, h)).resize((200, H + 40), Image.LANCZOS)
    g['valance'] = oc.crop((0, 0, w, int(h * 0.16))).resize((W + 60, 250), Image.LANCZOS)
    cc = S.curtain('closed'); half = cc.width // 2
    g['half_l'], g['half_r'] = cc.crop((0, 0, half, cc.height)), cc.crop((half, 0, cc.width, cc.height))
    b = S.raw('images', 'Soft White Spotlight Beam on Black-70.png'); g['beam'] = S.fith(b, int(H * 0.62)).convert('RGBA')
    g['beam_r'] = ImageOps.mirror(g['beam'])
    g['stars'] = tex('doodles', 'Hand-painted polka dots on black-15.png', (W + 300, H + 200))
    g['floor'] = torn_band(S.raw('doodles', 'Wobbly hand-drawn black and white checkerboard-24.png'), (W + 400, 300), 21)
    g['new'] = S.letters('NEW DROP', S.FONTS['alfa'], 136, S.bulb_fill, 10)
    g['comment'] = S.letters('Comment', S.FONTS['alfa'], 136, S.bulb_fill, 10)
    g['digits'] = {n: S.letters(n, S.FONTS['alfa'], 760, S.bulb_fill, 14) for n in '321'}
    g['tk_name'] = S.ticket('[Product name]', 600, 0, 54); g['tk_first'] = S.ticket("you're seeing it first", 640, 2, 46, HAND)
    g['tk_d1'] = S.ticket('[Detail one]', 440, 1, 50); g['tk_d2'] = S.ticket('[Detail two]', 440, 0, 50)
    g['tk_kw'] = S.ticket('"[KEYWORD]"', 560, 2, 56); g['tk_out'] = S.ticket('OUT [FRI 24 OCT]', 600, 0, 50)
    g['blank'] = [S.ticket('', 300, i) for i in range(3)]; g['fan'] = [S.ticket('', 380, i) for i in range(3)]
    g['burst'] = [dd(BURSTS, 2, 300, CREAM), dd(BURSTS, 0, 200, CREAM), dd(BURSTS, 3, 220, CREAM)]
    g['spark'] = [dd(ICONS, 9, 120, CREAM), dd(ICONS, 11, 150, CREAM), dd(ICONS, 8, 110, CREAM)]
    g['under'] = dd(LINES, 3, 460, CREAM); g['arrow'] = dd(ARROWS, 8, 190, CREAM); g['arrow2'] = dd(ARROWS, 0, 200, CREAM)
    g['ring'] = S.ink_cut(S.raw('doodles', 'Ten hand-drawn doodle frames-4.png').crop((60, 40, 600, 290)), CREAM)
    r = random.Random(3); g['confetti'] = [(r.uniform(0, 2 * math.pi), r.uniform(700, 1500), r.uniform(-400, 400), r.randint(0, 2)) for _ in range(16)]
    return g

def beams(img, t, k=1.0, right=True):
    """Two spotlight beams that sway, added as light."""
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 255))
    put(lay, G15['beam'], (G15['beam'].width / 2 - 140 + 60 * math.sin(t * 1.3), G15['beam'].height / 2 - 40), 1, 4 * math.sin(t * 1.1))
    if right: put(lay, G15['beam_r'], (W - G15['beam_r'].width / 2 + 140 - 60 * math.sin(t * 1.2 + 1), G15['beam_r'].height / 2 - 40), 1, -4 * math.sin(t * 0.9))
    if k < 1: lay = ImageEnhance.Brightness(lay).enhance(k)
    return screen(img, lay)
G15 = {}

def stage_frame(img, t, k=1.0):
    """The curtain frame: k = 1 in place, 0 away (valance up, drapes out to the sides)."""
    e = ease(k)
    img.alpha_composite(G15['left'], (int(lerp(-260, 0, e)), -20)); img.alpha_composite(G15['right'], (int(W - 200 + lerp(260, 0, e)), -20))
    img.alpha_composite(G15['valance'], (-30, int(lerp(-300, -10, e))))

def floor(img, t, y=H - 270):
    img.alpha_composite(G15['floor'], (int(-(45 * t) % 400) - 400, int(y)))

def spot(img, clip_im, c, r, glow=True):
    if r < 4: return
    if glow:
        g = Image.new('L', (W, H), 0); ImageDraw.Draw(g).ellipse((c[0] - r - 60, c[1] - r - 60, c[0] + r + 60, c[1] + r + 60), fill=190)
        gl = Image.new('RGBA', (W, H), (255, 236, 190, 0)); gl.putalpha(g.filter(ImageFilter.GaussianBlur(40))); img.alpha_composite(gl)
    img.paste(clip_im.convert('RGB'), (0, 0), circle_mask((W, H), c, r, 3))

def dark_stage(t):
    im = Image.new('RGBA', (W, H), (8, 6, 6, 255)); drift(im, G15['stars'], t, vx=14, y0=-100, alpha=0.35)
    return beams(im, t)

def frame_15(g, t):
    cl = g['clips']
    if t < 2.6:                                                   # covered on stage; then the curtain halves close
        im = beams(cl[0].at(t), t, 0.8, right=False); floor(im, t); stage_frame(im, t)
        hero(im, t, 0.1, g['new'], (540, 430), out=1.95)
        slide(im, g['tk_name'], t, 0.6, 0.9, (-400, 650), (540, 650), -4); draw_on(im, g['under'], (540, 760), seg(t, 1.0, 1.4))
        for i, (x, y) in enumerate(((220, 1250), (860, 1130))):
            if int(t * 5 + i) % 3: put(im, g['spark'][i], (x, y))
        u = ease(seg(t, 2.0, 2.6))
        if u > 0:
            im.alpha_composite(g['half_l'], (int(lerp(-g['half_l'].width, -30, u)), -20)); im.alpha_composite(g['half_r'], (int(lerp(W, W + 30 - g['half_r'].width, u)), -20))
        return im
    if t < 4.4:                                                   # countdown on the closed curtain, then it parts
        u = ease(seg(t, 3.6, 4.3))
        im = beams(cl[1].at(t - 3.6), t, 0.9, right=False) if u > 0 else Image.new('RGBA', (W, H))
        if u > 0:
            for i, (a, v, spin, k) in enumerate(g['confetti']):                     # real tickets burst out of the gap
                s = seg(t, 3.6 + i * 0.02, 4.4); r = v * ease(s)
                put(im, g['blank'][k], (540 + r * math.cos(a), 900 + r * math.sin(a) + 500 * s * s), 0.6, spin * s, 1 - s * 0.6)
            for i, (x, y) in enumerate(((540, 520), (300, 1250), (800, 1300))): pop(im, g['burst'][i], t, 3.75 + i * 0.1, (x, y), 0)
        im.alpha_composite(g['half_l'], (int(lerp(-30, -g['half_l'].width + 60, u)), -20)); im.alpha_composite(g['half_r'], (int(lerp(W + 30 - g['half_r'].width, W - 60, u)), -20))
        if u == 0:
            pool = Image.new('L', (W, H), 0); cx = 540 + 40 * math.sin(t * 2); ImageDraw.Draw(pool).ellipse((cx - 450, 520, cx + 450, 1420), fill=140)
            lt = Image.new('RGBA', (W, H), (255, 236, 200, 0)); lt.putalpha(pool.filter(ImageFilter.GaussianBlur(90))); im.alpha_composite(lt)
            n = '321'[min(2, int((t - 2.65) / 0.32))] if t >= 2.65 else None
            if n: hero(im, t, 2.65 + '321'.index(n) * 0.32, g['digits'][n], (540, 1000), step=0)
            pop(im, g['tk_first'], t, 2.8, (520, 1420), 3)
        floor(im, t); stage_frame(im, t)
        return im
    if t < 5.6:                                                   # the reveal plays on stage
        im = beams(cl[1].at(t - 3.6), t, 0.9, right=False); floor(im, t); stage_frame(im, t)
        for i, (x, y) in enumerate(((260, 520), (840, 760), (240, 1200))):
            if int(t * 5 + i) % 3: put(im, g['spark'][i], (x, y))
        return im
    if t < 6.4:                                                   # the picture closes into a spotlight; the frame lifts away
        u = ease(seg(t, 5.6, 6.4)); im = dark_stage(t)
        r = lerp(1200, 450, u); c = lerp2((540, 960), (560, 980), u)
        spot(im, cl[1].at(t - 3.6) if u < 0.85 else cl[2].at(t - 5.6), c, r, u > 0.3)
        stage_frame(im, t, 1 - u); floor(im, t, H - 270 + 300 * u)
        return im
    if t < 9.4:                                                   # close-up one, then the split with close-up two
        im = dark_stage(t); m = ease(seg(t, 7.6, 8.4))
        c1, r1 = lerp2((560, 980), (380, 640), m), lerp(450, 320, m)
        spot(im, cl[2].at(t - 5.6), c1, r1)
        if m > 0: spot(im, cl[3].at(t - 7.6), (640, 1240), 370 * back_out(m, 1.5))
        if t < 7.6:
            slide(im, g['tk_d1'], t, 6.5, 6.8, (-300, 1440), (330, 1440), -6); draw_on(im, g['arrow'], (700, 1430), seg(t, 6.9, 7.3), 10)
            draw_on(im, g['ring'], (560, 830), seg(t, 6.8, 7.3))
        else:
            put(im, g['tk_d1'], (lerp(330, 800, m), lerp(1440, 360, m)), lerp(1, 0.9, m), lerp(-6, 6, m))
            if t > 8.4: pop(im, g['tk_d2'], t, 8.45, (270, 1400), -5); draw_on(im, g['arrow2'], (300, 1270), seg(t, 8.6, 9.0), -60)
            for i, (x, y) in enumerate(((930, 860), (130, 960))):
                if int(t * 5 + i) % 3: put(im, g['spark'][i], (x, y))
        return im
    if t < 10.2:                                                  # the second circle opens out; the curtain frame drops back in
        u = ease(seg(t, 9.4, 10.2)); im = dark_stage(t)
        spot(im, cl[2].at(t - 5.6), (380, 640), 320 * (1 - u))
        spot(im, cl[3].at(t - 7.6) if u < 0.4 else cl[4].at(t - 9.4), lerp2((640, 1240), (540, 960), u), lerp(370, 1250, u))
        stage_frame(im, t, u); floor(im, t, H - 270 + 300 * (1 - u))
        return im
    im = beams(cl[4].at(t - 9.4), t, 0.8, right=False); floor(im, t); stage_frame(im, t)          # CTA
    for i, (c, r) in enumerate((((150, 1700), -24), ((300, 1760), -6), ((900, 1730), 16))): pop(im, g['fan'][i], t, 10.3 + i * 0.1, c, r)
    hero(im, t, 10.4, g['comment'], (540, 400)); slide(im, g['tk_kw'], t, 10.7, 11.0, (W + 400, 590), (540, 590), -3)
    pop(im, g['tk_out'], t, 11.1, (520, 1380), 3); draw_on(im, g['under'], (520, 1480), seg(t, 11.3, 11.7))
    return im

def _setup_15():
    g = setup_15(); G15.update(g); return g
SETUP['15'] = _setup_15; FRAME['15'] = frame_15; SECS['15'] = 12.0

# ======================================================================================================================
# 07 How big is it really? (12 s): the product alone, a giant banana swings in for scale; a real ruler slices in and the
# hand clip rises under it (split); a giant mug wipes across to the line-up on the oak table; playing cards are dealt
# over the whole screen and swept off to the in-use clip; the clip shrinks into a window on the table, a ruler sweeps
# across it to the product on the ruler (CTA).
# Layers: oak tabletop (drifting) + a torn band of her butter watercolour + a torn band of her marker stripes.
# ======================================================================================================================
def window_frame(size, r=28, line=8, seed=3, color=INK):
    """Just the sketchy ink edge of a window of `size` (the inside is clear)."""
    box = Image.new('RGBA', size, (255, 255, 255, 255)); box.putalpha(S.round_rect(size, r))
    o = S.outlined(box, 10, line, seed, color); pad = 10 + line + 12
    a = o.split()[3]; ImageDraw.Draw(a).rounded_rectangle((pad, pad, pad + size[0] - 1, pad + size[1] - 1), r, fill=0); o.putalpha(a)
    return o

def in_window(img, frame_im, clip_im, c, size, r=28):
    clip_im = clip_im.copy(); clip_im.putalpha(S.round_rect(size, r))
    put(img, C.shadow(clip_im, (10, 16), 18, 100), c); put(img, frame_im, c)

def setup_07():
    g = {}
    g['clips'] = [Clip(n, t0) for n, t0 in (('IMG_1378', 1.0), ('IMG_1381', 1.0), ('IMG_1378', 3.0), ('IMG_1377', 1.0), ('IMG_1381', 3.0))]
    g['oak'] = tex('images', 'Light oak wood grain texture-2.png', (W + 300, H + 100))
    g['butter'] = torn_band(S.raw('doodles', 'Butter Yellow Watercolor Wash-23.png'), (W + 400, 260), 31, 'tb')
    g['stripes'] = torn_band(S.raw('doodles', 'Hand-drawn black stripe pattern-16.png'), (W + 400, 230), 32, 't')
    g['banana'] = S.banana(1500, 0); g['banana_s'] = S.banana(760, 1, 11); g['banana_c'] = S.banana(700, 2, 30)
    g['ruler'] = S.ruler(1650); g['ruler_v'] = S.ruler(1500, 7); g['ruler_c'] = S.ruler(1200, 32)
    g['mug_big'] = S.mug(1450); g['mug'] = S.mug(330, 8); g['mug_c'] = S.mug(300, 31)
    g['cards'] = [S.playing(250, i % 2, 9 + i) for i in range(2)] + [S.playing(300, i % 2, 20 + i) for i in range(3)]
    g['deal'] = [S.playing(420, i % 2, 40 + i) for i in range(2)]
    g['how'] = S.letters('HOW BIG', S.FONTS['coiny'], 196, S.banana_fill); g['comment'] = S.letters('Comment', S.FONTS['coiny'], 160, S.banana_fill)
    g['really'] = S.card_text('is it really?', 520, 74); g['hand'] = S.card_text('In my hand', 500, 66, BOLD)
    g['next'] = S.card_text('Next to a mug', 560, 62, BOLD); g['worn'] = S.card_text('[Worn every day]', 600, 56, BOLD)
    g['size'] = S.card_text('[Exact size]', 520, 64, BOLD)
    chip = S.fitw(S.cut('images', 'Mustard yellow paint sample card-71.png').rotate(90, expand=True), 520)
    chip = chip.crop((0, int(chip.height * 0.3), chip.width, int(chip.height * 0.7))); g['chip'] = C.shadow(S.words_on(chip, '"SIZE"', BOLD, 84, INK))
    g['q'] = dd(GLYPHS, 8, 130, WHITE); g['ticks'] = S.motion_ticks(color=WHITE); g['arrow'] = dd(ARROWS, 9, 170, WHITE)
    g['arrow_k'] = dd(ARROWS, 0, 150); g['arrow_c'] = dd(ARROWS, 7, 170); g['under'] = dd(LINES, 1, 420, INK)
    g['burst'] = dd(BURSTS, 4, 200, WHITE); g['burst2'] = dd(BURSTS, 0, 180, WHITE); g['spark'] = dd(ICONS, 9, 120, WHITE)
    g['tags'] = [text_img(w, HAND, 70, INK, (255, 250, 240), 5) for w in ('mug', 'card', 'banana')]
    g['win_lu'] = window_frame((500, 860)); g['win_c'] = window_frame((820, 860), seed=5)
    r = random.Random(9); g['dealt'] = [(r.uniform(-60, W + 60), r.uniform(-80, H + 80), r.uniform(-40, 40), r.randint(0, 1)) for _ in range(22)]
    return g

def table(img, t):
    """The oak table with its two torn paper bands drifting at their own speeds."""
    drift(img, G07['oak'], t, vx=14, y0=-50)
    img.alpha_composite(G07['butter'], (int(-(36 * t) % 400) - 400, 90))
    img.alpha_composite(G07['stripes'], (int(-(60 * t) % 400) - 400, H - 210))
G07 = {}

def lineup(g, t, t0):
    im = Image.new('RGBA', (W, H)); table(im, t)
    slide(im, g['ruler_v'], t, t0, t0 + 0.3, (100, H + 800), (100, 980), 90)
    if t >= t0 + 0.1: in_window(im, g['win_lu'], g['clips'][2].at(t - t0, (500, 860)), (560, 900), (500, 860))
    pop(im, g['mug'], t, t0 + 0.4, (300, 1250)); pop(im, g['cards'][0], t, t0 + 0.55, (900, 720), 8); pop(im, g['cards'][1], t, t0 + 0.7, (935, 1010), -6)
    slide(im, g['banana_s'], t, t0 + 0.85, t0 + 1.15, (W + 500, 1540), (600, 1540), -6)
    for i, (c, r) in enumerate((((250, 1430), 4), ((840, 1215), -3), ((300, 1700), -4))): draw_on(im, g['tags'][i], c, seg(t, t0 + 1.0 + i * 0.2, t0 + 1.3 + i * 0.2), r)
    draw_on(im, g['arrow_k'], (390, 1080), seg(t, t0 + 1.1, t0 + 1.4), -150)
    slide(im, g['next'], t, t0 + 0.3, t0 + 0.6, (560, -300), (560, 330), -3)
    return im

def frame_07(g, t):
    cl = g['clips']
    if t < 2.0:                                                   # alone; the giant banana swings in for scale
        im = cl[0].at(t); sw = back_out(seg(t, 0.2, 0.75), 1.6)
        put(im, g['banana'], (lerp(-700, 260, sw), lerp(2300, 1540, sw)), 1, lerp(-40, 28, sw))
        if 0.3 < t < 0.85: put(im, g['ticks'], (760, 1290), 1, -35)
        pop(im, g['burst'], t, 0.75, (900, 1250), out=1.3)
        hero(im, t, 0.1, g['how'], (540, 420), out=1.85); draw_on(im, g['q'], (985, 250), seg(t, 0.7, 1.0), 12)
        slide(im, g['really'], t, 0.9, 1.2, (-400, 700), (560, 700), -4)
        return im
    if t < 4.2:                                                   # the ruler slices in; the hand clip rises under it
        u = ease(seg(t, 2.0, 2.6)); im = cl[0].at(t)
        low = cl[1].at(t - 2.0); low.putalpha(S.poly_mask((W, H), [(0, 870), (W, 1070), (W, H), (0, H)]))
        im.alpha_composite(low, (0, int(900 * (1 - u))))
        put(im, g['ruler'], (lerp(-1000, 540, u), lerp(700, 970, u)), 1, -10.5)
        pop(im, g['hand'], t, 2.7, (330, 1300), 4); draw_on(im, g['arrow'], (640, 1180), seg(t, 2.9, 3.3), -20)
        if int(t * 5) % 3: put(im, g['spark'], (870, 420))
        return im
    if t < 5.0:                                                   # a giant mug wipes across to the line-up
        u = ease(seg(t, 4.2, 5.0)); im = lineup(g, t, 4.6) if u > 0.5 else cl[1].at(t - 2.0)
        put(im, g['mug_big'], (lerp(W + 800, -800, u), 980), 1, -4)
        return im
    if t < 7.0: return lineup(g, t, 4.6)
    if t < 7.9:                                                   # cards are dealt over everything, then swept off
        im = lineup(g, t, 4.6) if t < 7.45 else cl[3].at(t - 7.45)
        for i, (x, y, r, k) in enumerate(g['dealt']):
            a = ease(seg(t, 7.0 + i * 0.018, 7.25 + i * 0.018)); b = ease(seg(t, 7.5 + i * 0.012, 7.85))
            if a <= 0 or b >= 1: continue
            put(im, g['deal'][k], (lerp(-400, x, a) + b * 1600, lerp(-500, y, a) + b * 700), 1, r + 30 * b)
        return im
    if t < 9.4:                                                   # in use
        im = cl[3].at(t - 7.45)
        for i, (c, r) in enumerate((((120, 1640), -28), ((230, 1680), -8), ((350, 1700), 14))): pop(im, g['cards'][2 + i], t, 7.95 + i * 0.08, c, r)
        pop(im, g['worn'], t, 8.0, (420, 1330), -3); draw_on(im, g['under'], (420, 1450), seg(t, 8.3, 8.7))
        pop(im, g['burst'], t, 8.1, (840, 520), wiggle=6)
        return im
    u = ease(seg(t, 9.4, 10.0)); im = Image.new('RGBA', (W, H)); table(im, t)       # shrink into the window; CTA
    pop(im, g['banana_c'], t, 9.9, (1000, 140), 140); pop(im, g['mug_c'], t, 10.0, (110, 1720), 10)
    if u < 1:
        size = (lerp(W, 820, u), lerp(H, 860, u)); c = lerp2((W / 2, H / 2), (540, 1000), u)
        clip_im = (cl[3].at(t - 7.45, size) if t < 9.85 else cl[4].at(t - 9.85, size)); clip_im.putalpha(S.round_rect((int(size[0]), int(size[1])), 28))
        put(im, clip_im, c)
    else:
        in_window(im, g['win_c'], cl[4].at(t - 9.85, (820, 860)), (540, 1000), (820, 860))
    if 9.65 < t < 10.05: put(im, g['ruler_c'], (lerp(-700, W + 700, seg(t, 9.65, 10.05)), 1000), 1, 2)
    slide(im, g['ruler_c'], t, 10.0, 10.3, (-700, 1470), (540, 1470), 2)
    pop(im, g['size'], t, 10.25, (310, 1360), -6); hero(im, t, 10.3, g['comment'], (540, 300))
    slide(im, g['chip'], t, 10.6, 10.9, (W + 400, 470), (540, 470), -2); draw_on(im, g['arrow_c'], (930, 1250), seg(t, 10.9, 11.3))
    return im

def _setup_07():
    g = setup_07(); G07.update(g); return g
SETUP['07'] = _setup_07; FRAME['07'] = frame_07; SECS['07'] = 12.0

# ======================================================================================================================
# 20 What buyers said (11.5 s): five real gold stars stick on and the title pops; review one on a postcard, sealed in
# gold; gold stars rush in and cover everything, then fly off to review two (clip above, marble below, a gold paint
# stroke drawn along the seam); a giant gold seal rolls in and its centre opens on review three; three strokes of
# gold paint sweep across to the CTA with trophies rising.
# Layers: white marble (drifting) + a torn band of her hand-painted dots + sweeps of real gold paint.
# ======================================================================================================================
def setup_20():
    g = {}
    g['clips'] = [Clip(n, t0) for n, t0 in (('IMG_1388', 0.5), ('IMG_1391', 1.0), ('IMG_1387', 1.0), ('IMG_1390', 1.0))]
    g['marble'] = tex('images', 'Soft veined white marble texture-1.png', (W + 300, H + 100))
    g['dots'] = torn_band(S.raw('doodles', 'Playful hand-painted black polka dots-12.png'), (W + 400, 280), 51, 't')
    g['stars'] = [S.star(165, i) for i in range(5)] + [S.star(200, 4)]
    g['flood'] = [S.star(320, i) for i in range(5)]; g['small'] = [S.star(w, i) for i, w in ((2, 150), (3, 110), (4, 160))]
    g['seal_big'] = S.seal(820, 0); g['seal_s'] = [S.seal(210, 1), S.seal(230, 2)]
    medal = S.fitw(S.cut('images', S.SEALS[0]), 1250); g['medal'] = S.outlined(medal, 14, 7, 85); g['md'] = int(medal.width * 0.74)
    g['trophy'] = [S.trophy(w, i, 88 + i) for i, w in enumerate((300, 400, 300))]; g['trophy_s'] = S.trophy(220, 1)
    stroke = S.cut('fall', 'Single metallic gold paint stroke-109.png'); g['stroke'] = C.shadow(S.fitw(stroke, 1300)); g['stroke_big'] = S.fitw(stroke, 2700)
    g['what'] = S.letters('WHAT BUYERS', S.FONTS['sigmar'], 118, S.gold_fill); g['said'] = S.letters('SAID', S.FONTS['sigmar'], 200, S.gold_fill)
    g['comment'] = S.letters('Comment', S.FONTS['sigmar'], 140, S.gold_fill)
    g['pc'] = [S.postcard([], (840, 860, 800)[i], i, 83 + i) for i in range(3)]
    g['pc_text'] = [text_img_lines(S.REVIEW(n), int((840, 860, 800)[i] * 0.068)) for i, n in enumerate(('one', 'two', 'three'))]
    pc = S.card('images', S.POSTCARDS[1], 560); pc = pc.crop((0, int(pc.height * 0.25), pc.width, int(pc.height * 0.75)))
    g['kw'] = C.shadow(S.words_on(pc, '"[KEYWORD]"', BOLD, 66))
    g['num'] = [dd(GLYPHS, 0, 130, WHITE), dd(GLYPHS, 1, 130), dd(GLYPHS, 2, 130)]
    g['wavy'] = dd(LINES, 2, 380); g['spark'] = [dd(ICONS, 9, 130, WHITE), dd(ICONS, 11, 110, WHITE), dd(ICONS, 10, 100)]
    g['arrow'] = dd(ARROWS, 7, 180)
    g['win'] = window_frame((820, 960), 30, 8, 87)
    r = random.Random(12); g['cover'] = [(x + r.randint(-50, 50), y + r.randint(-50, 50), r.randint(-40, 40), r.randint(0, 4))
                                         for y in range(-40, H + 140, 210) for x in range(-40, W + 140, 210)]
    return g

def text_img_lines(lines, px):
    """Review lines in handwriting, as their own layer so they can write on over the postcard."""
    f = F(HAND, px); lh = px * 1.25; w = int(max(f.getlength(l) for l in lines) + 20)
    im = Image.new('RGBA', (w, int(lh * len(lines) + 20)), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for k, l in enumerate(lines): d.text((w / 2, 10 + lh * (k + 0.5)), l, font=f, fill=INK, anchor='mm')
    return im

def prize_table(img, t):
    drift(img, G20['marble'], t, vx=12, y0=-50)
    img.alpha_composite(G20['dots'], (int(-(42 * t) % 400) - 400, H - 260))
G20 = {}

def review(img, t, t0, i, c, rot):
    """A postcard slides up into place, then the review writes itself on."""
    slide(img, G20['pc'][i], t, t0, t0 + 0.35, (c[0], H + 500), c, rot, fn=lambda x: back_out(x, 1.3))
    draw_on(img, G20['pc_text'][i], (c[0], c[1] - G20['pc'][i].height * 0.06), seg(t, t0 + 0.4, t0 + 1.0), rot)

def scene_split(g, t):
    im = Image.new('RGBA', (W, H)); prize_table(im, t); im.alpha_composite(g['clips'][1].at(t - 4.0, (W, 1120)), (0, 0))
    return im

def scene_cta(g, t):
    im = Image.new('RGBA', (W, H)); prize_table(im, t)
    k = back_out(seg(t, 9.0, 9.35), 1.6)
    if k > 0:
        cl = g['clips'][3].at(t - 9.0, (820, 960)); cl.putalpha(S.round_rect((820, 960), 30))
        put(im, C.shadow(cl, (10, 16), 18, 100), (540, 880), k); put(im, g['win'], (540, 880), k)
    pop(im, g['seal_s'][1], t, 9.4, (880, 440))
    for i, (x, y) in enumerate(((180, 1700), (540, 1680), (900, 1700))): slide(im, g['trophy'][i], t, 9.5 + i * 0.12, 9.85 + i * 0.12, (x, H + 400), (x, y), (-5, 0, 5)[i], fn=lambda x: back_out(x, 1.4))
    hero(im, t, 9.6, g['comment'], (540, 300)); slide(im, g['kw'], t, 10.0, 10.3, (-400, 1410), (540, 1410), -2)
    draw_on(im, g['arrow'], (930, 1250), seg(t, 10.3, 10.7))
    for i, (x, y) in enumerate(((360, 1560), (720, 1560))):
        if t > 10 and int(t * 5 + i) % 3: put(im, g['spark'][i], (x, y))
    return im

def frame_20(g, t):
    cl = g['clips']
    if t < 3.6:                                                   # stars stick on, the title; then review one
        im = cl[0].at(t)
        roll = ease(seg(t, 0.3, 0.9)); put(im, g['seal_big'], (lerp(W + 500, 1000, roll), 1760), 1, lerp(220, 0, roll))
        for i in range(5):
            last = i == 4; t0 = 0.1 + 0.15 * i
            if t < t0 or t > 2.05: continue
            k = 1 + 0.8 * (1 - back_out(seg(t, t0, t0 + 0.2), 1.2)); up = ease(seg(t, 1.85, 2.05)) * 500
            put(im, g['stars'][5 if last else i], (170 + i * 185, 300 - (30 if i in (1, 3) else 0) - up), k, (-12, 8, -4, 10, -18)[i])
        hero(im, t, 0.5, g['what'], (540, 520), out=1.85); hero(im, t, 0.8, g['said'], (540, 710), out=1.9)
        if t >= 2.0:
            review(im, t, 2.0, 0, (540, 1180), -4)
            if t > 2.4: put(im, g['seal_s'][0], (170, 940), 1 + 0.6 * (1 - back_out(seg(t, 2.4, 2.6), 1.2)))
            draw_on(im, g['num'][0], (930, 820), seg(t, 2.5, 2.8), 8); draw_on(im, g['wavy'], (540, 1290), seg(t, 2.9, 3.3), -4)
        return im
    if t < 4.4:                                                   # gold stars rush in and cover everything, then fly off
        im = cl[0].at(t) if t < 4.0 else scene_split(g, t)
        for i, (x, y, r, k) in enumerate(g['cover']):
            a = ease(seg(t, 3.6 + (i % 7) * 0.02, 3.95)); b = ease(seg(t, 4.0 + (i % 5) * 0.02, 4.4))
            if a <= 0 or b >= 1: continue
            dx, dy = x - W / 2, y - H / 2; n = math.hypot(dx, dy) + 1
            fx, fy = dx / n * 1400, dy / n * 1400
            put(im, g['flood'][k], (x + fx * (1 - a) + fx * b, y + fy * (1 - a) + fy * b), 1, r + 90 * b)
        return im
    if t < 6.0:                                                   # review two: the split, the gold seam drawn on
        im = scene_split(g, t); draw_on(im, g['stroke'], (540, 1120), seg(t, 4.4, 4.75), -2)
        review(im, t, 4.55, 1, (540, 1300), 3); draw_on(im, g['num'][1], (950, 1060), seg(t, 4.9, 5.2), -6)
        for i, ((x, y), r) in enumerate((((150, 1700), -14), ((300, 1760), 0), ((880, 1720), 14))): pop(im, g['small'][i], t, 5.1 + i * 0.1, (x, y), r, wiggle=5)
        return im
    if t < 8.4:                                                   # the giant seal rolls in, opens on review three
        im = scene_split(g, t) if t < 6.25 else Image.new('RGBA', (W, H))
        if t >= 6.25: prize_table(im, t)
        roll = ease(seg(t, 6.0, 6.6)); c = (lerp(W + 800, 540, roll), 820)
        put(im, C.shadow(g['medal'], (12, 18), 20, 110), c, 1, lerp(300, 0, roll) + 6 * math.sin(t * 1.5))
        op = ease(seg(t, 6.5, 6.9))
        if op > 0:
            d = int(g['md'] * op); cl3 = cl[2].at(t - 6.5, (d, d)); cl3.putalpha(circle_mask((d, d), (d / 2, d / 2), d / 2, 1)); put(im, cl3, c)
        if t >= 6.8: review(im, t, 6.8, 2, (520, 1290), -5); draw_on(im, g['num'][2], (130, 1150), seg(t, 7.2, 7.5), 6); pop(im, g['trophy_s'], t, 7.4, (985, 1760), 4)
        return im
    if t < 9.2:                                                   # three sweeps of real gold paint wipe to the CTA
        im = frame_20(g, 8.39) if t < 8.8 else scene_cta(g, t)
        for i, y in enumerate((300, 960, 1620)):
            u = ease(seg(t, 8.4 + i * 0.08, 9.15 + i * 0.05)); x = lerp(-1500, W + 1500, u) if i % 2 == 0 else lerp(W + 1500, -1500, u)
            put(im, g['stroke_big'], (x, y), 1, (-3, 2, -2)[i])
        return im
    return scene_cta(g, t)

def _setup_20():
    g = setup_20(); G20.update(g); return g
SETUP['20'] = _setup_20; FRAME['20'] = frame_20; SECS['20'] = 11.5

if __name__ == '__main__':
    tid = sys.argv[1]; g = SETUP[tid](); fr = lambda t: FRAME[tid](g, t)
    out = E.PACK / S.DIRS[tid] / 'preview'
    if len(sys.argv) > 2:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[2:]]
        sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render(tid, fr, SECS[tid], out)
