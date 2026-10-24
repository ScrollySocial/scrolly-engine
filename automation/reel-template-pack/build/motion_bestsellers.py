"""Rough motion test for the bonus template "Our top 3 bestsellers", the free template for the SHOPREELS comment keyword
(Mercedes 2026-10-23: a bonus made only for the freebie, never one of the Product Reel Template Pack's 25). Business
job: show a shop's three bestsellers as a countdown, then send people to comment for the links.
Its own world: real award rosettes (her ChatGPT images, 2026-10-24: blue No. 3, red No. 2, gold No. 1) on a calm
marble stage. Home bases: the buyer's clips full screen + the marble stage, a new setup each visit (a card that is the
clip, a card rising from below, the big gold rosette, a row of rosettes with the clips in their centres). Each rosette
carries its number into its clip. Type: DM Serif Display (built-in words) + small lines on butter highlight boxes;
palette wine + butter (FRAMEWORK, locked). Stand-in footage: her July clips.
Usage: python build/motion_bestsellers.py [seconds ...]  ->  bonus/b1-top-3-bestsellers/preview/motion-test.mp4
"""
import math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import doodles as D
import storyboard_b2 as S
from props import cut_white

W, H, FPS = 1080, 1920, 30
OUT = E.PACK / 'bonus' / 'b1-top-3-bestsellers' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
WINE, BUTTER, WHITE = (122, 23, 50), (247, 230, 169), (255, 255, 255)
FD = E.PACK / 'assets' / 'fonts'
DMS, DMSI = str(FD / 'dmserifdisplay-DMSerifDisplay-Regular.ttf'), str(FD / 'dmserifdisplay-DMSerifDisplay-Italic.ttf')
SANS = 'C:/Windows/Fonts/arialbd.ttf'
IMG = E.PACK / 'assets' / 'props' / 'source' / 'images'
CLIPS = {'hook': ('IMG_1422', 7.5), 'c1': ('IMG_1464', 2.0), 'c2': ('IMG_1436', 2.0), 'c3': ('IMG_1439', 0.5)}

def extract(key, secs=5.0):
    name, t0 = CLIPS[key]; d = TMP / key; d.mkdir(exist_ok=True)
    if not any(d.glob('*.jpg')):
        src = next(E.FOOTAGE.glob(name + '.*'))
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t0), '-t', str(secs), '-i', str(src),
                        '-vf', f'{S.TONE},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}',
                        '-q:v', '3', str(d / '%04d.jpg')], check=True)
    return sorted(d.glob('*.jpg'))
FR = {k: extract(k) for k in CLIPS}
def vid(key, t):
    fs = FR[key]; return Image.open(fs[max(0, min(len(fs) - 1, int(t * FPS)))]).convert('RGBA')

def clamp(x): return max(0.0, min(1.0, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_in(x): x = clamp(x); return x * x * x
def back_out(x, s=1.9): x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s)
def lerp(a, b, u): return a + (b - a) * u

# ---- props ---------------------------------------------------------------------------------------------------------------
def rosette(name):
    im = cut_white(Image.open(IMG / f'rosette-{name}.png').convert('RGBA')); return im.crop(im.getbbox())
ROS = {3: rosette('blue'), 2: rosette('red'), 1: rosette('gold')}
DISC = {3: (0.49, 0.48, 0.23), 2: (0.51, 0.435, 0.20), 1: (0.51, 0.47, 0.21)}   # centre disc: x, y, radius (fractions of width)
NUMCOL = {3: WHITE, 2: WHITE, 1: WINE}
STAGE = ImageOps.fit(Image.open(IMG / 'Soft veined white marble texture-1.png').convert('RGB'), (W, H)).convert('RGBA')
BIGSTAGE = ImageOps.fit(Image.open(IMG / 'Soft veined white marble texture-1.png').convert('RGB'), (W, H * 2)).convert('RGBA')
SPARK = D.get('icons', 9, BUTTER, 120); ARROW = D.get('arrows', 0, BUTTER, 230); LINE = D.get('underlines', 2, BUTTER, 480)
BURST = D.get('bursts', 5, BUTTER, 980); STRING = D.get('underlines', 0, WINE, 1000)
_c = {}
def sized(im, w, key):
    k = (key, int(w))
    if k not in _c: _c[k] = im.resize((max(1, int(w)), max(1, int(im.height * w / im.width))), Image.LANCZOS)
    return _c[k]
def put(img, im, c, w, rot=0, key='x'):
    if w < 4: return
    it = sized(im, w, key)
    if rot: it = it.rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def badge(img, n, c, w, rot=0, inside=None, t=0.0):
    """Rosette n, w px wide, centred at c. Its centre disc shows the number, or a clip when inside is given."""
    if w < 4: return
    r = sized(ROS[n], w, f'ros{n}').copy(); dx, dy, dr = DISC[n]
    cx, cy, rr = dx * r.width, dy * r.width, dr * r.width
    if inside is not None:
        d = int(2 * rr); v = ImageOps.fit(vid(inside, t), (d, d)); m = Image.new('L', (d, d), 0)
        ImageDraw.Draw(m).ellipse((0, 0, d - 1, d - 1), fill=255); r.paste(v, (int(cx - rr), int(cy - rr)), m)
    else:
        f = ImageFont.truetype(DMS, max(8, int(rr * 1.45)))
        ImageDraw.Draw(r).text((cx, cy + rr * 0.05), str(n), font=f, fill=NUMCOL[n] + (255,), anchor='mm')
    sh = Image.new('RGBA', r.size, (0, 0, 0, 0)); sh.putalpha(r.split()[3].point(lambda v: v * 70 // 255).filter(ImageFilter.GaussianBlur(10)))
    lay = Image.new('RGBA', (r.width + 40, r.height + 40), (0, 0, 0, 0)); lay.alpha_composite(sh, (28, 32)); lay.alpha_composite(r, (20, 20))
    if rot: lay = lay.rotate(rot, expand=True, resample=Image.BICUBIC)
    # place so the rosette's disc (not the image centre) sits at c when hanging from the disc
    img.alpha_composite(lay, (int(c[0] - lay.width / 2), int(c[1] - lay.height / 2)))

def card(img, key, t, c, w, rot=0, border=16):
    """The clip as a white-edged card on the stage (9:16, rounded corners, soft shadow)."""
    h = w * 16 / 9; v = ImageOps.fit(vid(key, t), (int(w), int(h))); r = int(w * 0.05)
    m = Image.new('L', v.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, v.width - 1, v.height - 1), r, fill=255)
    out = Image.new('RGBA', (v.width + 2 * border, v.height + 2 * border), (0, 0, 0, 0))
    mo = Image.new('L', out.size, 0); ImageDraw.Draw(mo).rounded_rectangle((0, 0, out.width - 1, out.height - 1), r + border, fill=255)
    wh = Image.new('RGBA', out.size, WHITE + (255,)); out.paste(wh, (0, 0), mo); out.paste(v, (border, border), m)
    sh = Image.new('RGBA', (out.width + 80, out.height + 80), (0, 0, 0, 0)); sh.paste((0, 0, 0, 90), (40, 52), mo)
    sh = sh.filter(ImageFilter.GaussianBlur(16)); sh.alpha_composite(out, (40, 40))
    if rot: sh = sh.rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(sh, (int(c[0] - sh.width / 2), int(c[1] - sh.height / 2)))

def zoom_to_full(img, key, t, c0, w0, u):
    """A card at (c0, w0) growing until the clip fills the screen (u 0..1)."""
    w = lerp(w0, W, u); c = (lerp(c0[0], W / 2, u), lerp(c0[1], H / 2, u))
    if u >= 1: img.alpha_composite(vid(key, t)); return
    card(img, key, t, c, w, border=int(16 * (1 - u)))

# ---- words ---------------------------------------------------------------------------------------------------------------
def _shadowed(img, lay, blur=9, a=1.0):
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.putalpha(lay.split()[3].filter(ImageFilter.GaussianBlur(blur)).point(lambda v: min(255, int(v * a))))
    img.alpha_composite(sh); img.alpha_composite(lay)

def serif(img, t, t0, xy, text, px, fill=WHITE, edge=WINE, italic=False, shadow=True):
    if t < t0: return
    k = back_out((t - t0) / 0.24); f = ImageFont.truetype(DMSI if italic else DMS, max(4, int(px * (0.55 + 0.45 * k))))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text(xy, text, font=f, fill=fill + (int(255 * clamp((t - t0) / 0.08)),), anchor='mm',
                             stroke_width=max(2, f.size // 55) if edge else 0, stroke_fill=edge)
    _shadowed(img, lay, a=0.9 if shadow else 0.0)

def boxed(img, t, t0, xy, text, px=54, box=BUTTER, ink=WINE):
    """Small line on a tight highlight box that pops in."""
    if t < t0: return
    k = back_out((t - t0) / 0.22); f = ImageFont.truetype(SANS, int(px)); d = ImageDraw.Draw(img)
    tw = d.textlength(text, font=f); padx, pady = px * 0.35, px * 0.22
    lay = Image.new('RGBA', (int(tw + 2 * padx), int(px * 1.25 + 2 * pady)), (0, 0, 0, 0)); dl = ImageDraw.Draw(lay)
    dl.rounded_rectangle((0, 0, lay.width - 1, lay.height - 1), int(px * 0.18), fill=box + (255,))
    dl.text((lay.width / 2, lay.height / 2), text, font=f, fill=ink + (255,), anchor='mm')
    s = max(0.05, k); lay = lay.resize((max(1, int(lay.width * s)), max(1, int(lay.height * s))), Image.BICUBIC)
    img.alpha_composite(lay, (int(xy[0] - lay.width / 2), int(xy[1] - lay.height / 2)))

# ---- the Reel ------------------------------------------------------------------------------------------------------------
CARD_W = 560
def hang(t, t0, x, y, w, n, swing=6):
    """A rosette dropping in and swinging from its pin, settling."""
    if t < t0: return
    u = back_out((t - t0) / 0.45); yy = lerp(y - 420, y, min(1.0, u))
    rot = swing * math.sin((t - t0) * 7) * max(0.0, 1 - (t - t0) / 1.6)
    badge(img_ref[0], n, (x, yy), w, rot)
img_ref = [None]

def frame(t):
    # 0.0-2.2  the hook clip full screen; "our top 3 / bestsellers"; three rosettes drop in hanging from the top edge
    if t < 2.2:
        im = vid('hook', t); img_ref[0] = im
        for i, (n, x) in enumerate(((3, 190), (2, 540), (1, 890))): hang(t, 0.3 + i * 0.15, x, 175, 210, n)
        serif(im, t, -0.2, (W / 2, 520), 'our top 3', 150)
        serif(im, t, 0.1, (W / 2, 700), 'bestsellers', 190, BUTTER, WINE, italic=True)
        D.draw_on(im, SPARK, (930, 600), t, 1.2, 0.2, 15)
    # 2.2-3.2  the clip shrinks into a card on the marble stage; it becomes No. 3's clip; the blue rosette pins on
    elif t < 3.2:
        u = ease((t - 2.2) / 0.6); im = STAGE.copy(); img_ref[0] = im
        key = 'hook' if t < 2.55 else 'c1'
        w = lerp(W, CARD_W, u); c = (lerp(W / 2, W / 2, u), lerp(H / 2, 1080, u))
        card(im, key, t - (2.2 if key == 'c1' else 0), c, w, border=int(16 * u), rot=-3 * u)
        hang(t, 2.65, c[0] - w / 2 + 40, c[1] - w * 8 / 9 + 60, 260, 3)
        serif(im, t, 2.75, (W / 2, 330), 'No. 3', 170, WINE, None, shadow=False)
    # 3.2-3.7  the camera zooms into the card: No. 3's clip full screen
    elif t < 3.7:
        im = STAGE.copy(); img_ref[0] = im; zoom_to_full(im, 'c1', t - 2.2, (W / 2, 1080), CARD_W, ease_in((t - 3.2) / 0.5))
    # 3.7-5.7  No. 3 full screen; its rosette carried into the corner; the product name
    elif t < 5.7:
        im = vid('c1', t - 2.2); img_ref[0] = im
        badge(im, 3, (870, 370), 230, -8)
        serif(im, t, 3.8, (420, 370), 'No. 3', 170)
        boxed(im, t, 4.1, (420, 525), '[product name]')
        D.draw_on(im, ARROW, (300, 760), t, 4.6, 0.3, -35)
    # 5.7-6.9  stage visit 2: the clip shrinks to a card that slides up off the top; card 2 rises; the red rosette pins on
    elif t < 6.9:
        im = BIGSTAGE.crop((0, int(H * ease((t - 5.7) / 0.9) * 0.5), W, int(H * ease((t - 5.7) / 0.9) * 0.5) + H)).copy(); img_ref[0] = im
        u = ease((t - 5.7) / 0.35); pan = ease((t - 5.85) / 0.75) * 1500
        card(im, 'c1', t - 2.2, (W / 2, lerp(H / 2, 1000, u) - pan), lerp(W, CARD_W, u), border=int(16 * u), rot=-3 * u)
        c2 = (W / 2, 1000 + 1500 - pan); card(im, 'c2', t - 5.7, c2, CARD_W, rot=3)
        if t > 6.45: hang(t, 6.45, c2[0] + CARD_W / 2 - 40, c2[1] - CARD_W * 8 / 9 + 60, 260, 2)
        serif(im, t, 6.5, (W / 2, 330), 'No. 2', 170, WINE, None, shadow=False)
    # 6.9-7.4  zoom into card 2
    elif t < 7.4:
        im = STAGE.copy(); img_ref[0] = im; zoom_to_full(im, 'c2', t - 5.7, (W / 2, 1000), CARD_W, ease_in((t - 6.9) / 0.5))
    # 7.4-9.4  No. 2 full screen
    elif t < 9.4:
        im = vid('c2', t - 5.7); img_ref[0] = im
        badge(im, 2, (190, 370), 230, 8)
        serif(im, t, 7.5, (680, 370), 'No. 2', 170)
        boxed(im, t, 7.8, (680, 525), '[product name]')
        D.draw_on(im, SPARK, (960, 240), t, 8.2, 0.2)
    # 9.4-11.0  stage visit 3, graphics only: "and our No. 1..."; the gold rosette spins in big over a burst
    elif t < 11.0:
        im = STAGE.copy(); img_ref[0] = im
        if t > 9.9: D.draw_on(im, BURST, (W / 2, 1180), t, 9.9, 0.25)
        k = back_out((t - 9.7) / 0.5); rot = (1 - clamp((t - 9.7) / 0.5)) * 160
        if t > 9.7: badge(im, 1, (W / 2, 1220), 720 * min(1.0, k), rot)
        boxed(im, t, 9.45, (W / 2, 300), 'and our')
        serif(im, t, 9.6, (W / 2, 470), 'No. 1', 210, WINE, None, italic=True, shadow=False)
        D.draw_on(im, SPARK, (200, 760), t, 10.3, 0.2, -15); D.draw_on(im, SPARK, (880, 760), t, 10.4, 0.2, 15)
    # 11.0-11.7  the gold rosette's centre becomes a window: zoom into it, No. 1's clip fills the screen
    elif t < 11.7:
        u = ease_in((t - 11.0) / 0.7); im = STAGE.copy(); img_ref[0] = im
        w = 720 * (1 + 9 * u); dx, dy, dr = DISC[1]
        r = sized(ROS[1], w, 'ros1z'); cx = W / 2 - (dx - 0.5) * w * (1 - u); top = 1220 - r.height / 2
        disc_y = lerp(top + dy * w, H / 2, u)
        im.alpha_composite(r, (int(cx - r.width / 2), int(disc_y - dy * w)))
        d = int(2 * dr * w)
        if d > 8:
            v = ImageOps.fit(vid('c3', t - 11.0), (d, d)) if d < 2 * H else None
            if v is not None:
                m = Image.new('L', (d, d), 0); ImageDraw.Draw(m).ellipse((0, 0, d - 1, d - 1), fill=255)
                im.paste(v, (int(cx - d / 2), int(disc_y - d / 2)), m)
        if u > 0.85: im = Image.blend(im, vid('c3', t - 11.0), (u - 0.85) / 0.15)
    # 11.7-13.7  No. 1 full screen; gold rosette in the corner; the name, underlined
    elif t < 13.7:
        im = vid('c3', t - 11.0); img_ref[0] = im
        badge(im, 1, (860, 370), 250, -8)
        serif(im, t, 11.8, (420, 370), 'No. 1', 180, BUTTER, WINE, italic=True)
        boxed(im, t, 12.1, (420, 525), '[product name]')
        D.draw_on(im, LINE, (420, 605), t, 12.5, 0.35)
    # 13.7-16.0  CTA, new stage setup: the three rosettes hang from a drawn string, each playing its clip; comment
    else:
        im = STAGE.copy(); img_ref[0] = im
        D.draw_on(im, STRING, (W / 2, 1090), t, 13.75, 0.3)
        for i, (n, x, key) in enumerate(((3, 210, 'c1'), (2, 540, 'c2'), (1, 870, 'c3'))):
            t0 = 13.95 + i * 0.15
            if t < t0: continue
            u = back_out((t - t0) / 0.45); y = lerp(1300 - 420, 1300, min(1.0, u))
            rot = 6 * math.sin((t - t0) * 7) * max(0.0, 1 - (t - t0) / 1.6)
            badge(im, n, (x, y), 300, rot, inside=key, t=t - 11.0)
        boxed(im, t, 14.0, (W / 2, 330), 'comment')
        serif(im, t, 14.25, (W / 2, 500), '[KEYWORD]', 150, WINE, None, shadow=False)
        boxed(im, t, 14.6, (W / 2, 680), 'for the links')
    return im.convert('RGB')

END = 16.0
def main():
    n = int(END * FPS); fdir = TMP / 'out'; fdir.mkdir(exist_ok=True)
    for i in range(n): frame(i / FPS).save(fdir / f'{i:04d}.jpg', quality=88)
    mp4 = OUT / 'motion-test.mp4'
    subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-framerate', str(FPS), '-i', str(fdir / '%04d.jpg'), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', str(mp4)], check=True)
    print('saved', mp4)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        for s in sys.argv[1:]: frame(float(s)).save(OUT / f'_t{s}.jpg', quality=85)
    else: main()
