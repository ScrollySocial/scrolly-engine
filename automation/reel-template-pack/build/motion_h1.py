"""Motion test v3 for h1 "Now you see it" (Halloween pack, 2026-10-20): scarcity (a limited drop, last chance, a
sale ending), done her tutorial's way (instagram.com/p/Dcb54SQxv_z, notes in halloween-pack.md "h1 method"):
clip 1 is the shot WITH the buyer (or the product), they snap; clip 2 is the SAME shot, phone not moved, empty; the cut
lands on the snap and her real smoke (assets/props/source/halloween/smoke.mp4, white on black) plays on a layer above
both clips from the cut, blend Screen, so the black disappears. The hook words stay through the cut and sit UNDER the
smoke: the smoke rolls over "now you see it", and when it clears the words read "now you don't".
Beats (13.6 s):
 1 0-2.4   clip 1 (you + the product): "now you / see it", the product line, sparkles
 2 2.4-5.4 the snap: clip 2 (the same shot, empty) + smoke over everything; under the smoke "see it" becomes "don't"
 3 5.4-8.1 the midnight stage (the editable background colour + paper grain): her clock tower rises in at night,
           real brass hands sweep to midnight on its lit dial, it rings (v4: the tower, her pick over the brass clock); "gone / [at midnight Oct 31]"; a second puff of the same smoke rises
           over the stage and clears onto clip 3 (the smoke is the carried element)
 4 8.1-10.6 clip 3 (the product again): "only [20 left]", a ring round the number
 5 10.6-13.6 CTA: "comment [POOF] before it's gone", an arrow at the keyword
Lettering as the editable build will have it: Bodoni Moda built-in words (her h1 pick), Montserrat [brackets] on a
text background, her doodles (Scrolly Doodles shapes). Stand-ins: her kitchen clip (with her), the same shot empty
(preview/_frames/standin-empty.MOV, cropped from its first frame), her spray-bottle clip.
Usage: python build/motion_h1.py  ->  halloween/h1-now-you-see-it/preview/motion-test.mp4
"""
import math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageChops
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import storyboard_halloween as B
from collage_kit import doodle as art_doodle

W, H, FPS, END = 1080, 1920, 30, 13.6
DIR = E.PACK / 'halloween' / 'h1-now-you-see-it'
OUT = DIR / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
LIB = E.PACK / 'assets' / 'props' / 'source'
INK, WHITE = (24, 18, 14), (255, 255, 255)
ACC = (236, 120, 36)        # accent: buyers change it to their brand colour
STAGE = (44, 28, 58)        # the midnight stage: CapCut's background colour in the build
SMOKE = B.SRC / 'smoke.mp4'
EMPTY_MOV = TMP / 'standin-empty.MOV'
SMOKE_SPEED, SMOKE_SRC = 1.6, 0.8   # her 5.5 s smoke from 0.8 s in (already a puff at the cut), 1.6x: a quick poof
SMOKE_SCALE, SMOKE_C = 1.35, (540, 520)   # scaled up and raised so the plume covers where they stood and the hook
T_CUT, T_STAGE, T_PUFF2, T_CLIP3, T_CTA = 2.4, 5.4, 7.4, 8.1, 10.6
SERIF = str(E.BUNDLED_FONTS['bodoni']); MONT = str(E.BUNDLED_FONTS['montserrat'])

def extract(src, key, t0=0.0, secs=7.0, hdr=True):
    d = TMP / key; d.mkdir(exist_ok=True)
    if not any(d.glob('*.jpg')):
        vf = (f'{B.S.TONE},' if hdr else '') + f'fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}'
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t0), '-t', str(secs), '-i', str(src), '-vf', vf, '-q:v', '3',
                        str(d / '%04d.jpg')], check=True)
    return sorted(d.glob('*.jpg'))
FR = {'with': extract(E.FOOTAGE / 'IMG_1385.MOV', 'v3-with', 1.4), 'without': extract(EMPTY_MOV, 'v3-without'),
      'again': extract(E.FOOTAGE / 'IMG_1439.MOV', 'v3-again', 4.0), 'smoke': extract(SMOKE, 'v3-smoke', 0, 6, hdr=False)}
def vid(key, t): fs = FR[key]; return Image.open(fs[min(len(fs) - 1, max(0, int(t * FPS)))]).convert('RGB')

def clamp(x): return max(0.0, min(1.0, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def back_out(x, s=2.0): x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s)

def smoke_at(t, t0):
    """Her smoke at time t for a puff starting at t0 (None outside it): white on black, for a Screen blend."""
    u = SMOKE_SRC + (t - t0) * SMOKE_SPEED
    if t < t0 or u >= 5.4: return None
    f = vid('smoke', u).point(lambda v: min(255, int(v * 1.35)))       # her smoke, a little brighter (the shipped file)
    big = f.resize((int(W * SMOKE_SCALE), int(H * SMOKE_SCALE)), Image.BICUBIC)
    out = Image.new('RGB', (W, H), (0, 0, 0)); out.paste(big, (int(SMOKE_C[0] - big.width / 2), int(SMOKE_C[1] - big.height / 2)))
    return out

# ---- lettering ------------------------------------------------------------------------------------------------------------
def _shadow(img, lay, blur=12):
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.putalpha(lay.split()[3].filter(ImageFilter.GaussianBlur(blur)).point(lambda v: min(255, int(v * 1.1))))
    img.alpha_composite(sh); img.alpha_composite(lay)
def word(img, t, t0, text, c, px, color=WHITE, t1=None):
    """Built-in word (Bodoni Moda): pops in with a small overshoot; gone after t1."""
    if t < t0 or (t1 is not None and t >= t1): return
    k = back_out((t - t0) / 0.3, 2.2); f = E.ImageFont.truetype(SERIF, max(6, int(px * (0.7 + 0.3 * k))))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text(c, text, font=f, fill=color + (255,), anchor='mm', stroke_width=max(3, px // 40), stroke_fill=INK + (255,))
    _shadow(img, lay)
def boxed(img, t, t0, text, c, px, box=ACC, fg=WHITE, t1=None, pill=False):
    """Editable [bracket] words (Montserrat Bold) on a text background, as CapCut draws it."""
    if t < t0 or (t1 is not None and t >= t1): return
    k = back_out((t - t0) / 0.25, 2.0); f = E.ImageFont.truetype(MONT, max(6, int(px * (0.6 + 0.4 * k))))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    bb = d.textbbox(c, text, font=f, anchor='mm'); px_ = f.size; bx, by = int(px_ * 0.22), int(px_ * 0.16)
    d.rounded_rectangle((bb[0] - bx, bb[1] - by, bb[2] + bx, bb[3] + by), radius=(bb[3] - bb[1] + 2 * by) // 2 if pill else 0, fill=box + (255,))
    d.text(c, text, font=f, fill=fg + (255,), anchor='mm'); img.alpha_composite(lay)
_doo = {}
def doodle(img, t, t0, kind, i, w, c, color=WHITE, rot=0, t1=None):
    """One of her doodles popping on (the build's Scrolly Doodles letters)."""
    if t < t0 or (t1 is not None and t >= t1): return
    if (kind, i, w, color) not in _doo: _doo[(kind, i, w, color)] = art_doodle(kind, i, w, color)
    k = back_out((t - t0) / 0.3, 2.2); im = _doo[(kind, i, w, color)]
    im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k)))).rotate(-rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(im, (int(c[0] - im.width / 2), int(c[1] - im.height / 2)))

# ---- the midnight stage: paper grain over the background colour, a real brass clock with its real hands ---------------
def _grain():
    g = ImageOps.autocontrast(ImageOps.grayscale(ImageOps.fit(Image.open(LIB / 'images' / 'Blush Pink Tissue Paper Texture-9.png').convert('RGB'), (W, H))))
    a = g.point(lambda v: int((255 - v) * 0.22)); out = Image.new('RGBA', (W, H), (0, 0, 0, 255)); out.putalpha(a); return out
GRAIN = _grain()
import tower_h1 as T
TOWER, DIAL, DIAL_R = T.tower()           # her clock tower at night, the dial lit and its painted hands taken off
TOWER_S = 2.1; TOWER = TOWER.resize((int(TOWER.width * TOWER_S), int(TOWER.height * TOWER_S)), Image.LANCZOS)
DIAL = (DIAL[0] * TOWER_S, DIAL[1] * TOWER_S)
HOUR, MINUTE = T.hands(95 * TOWER_S)     # her real brass hands, pivot at the image centre
DIAL_AT = (540, 1300)                     # where the dial lands on screen (the tower runs off the bottom edge)
def put(img, im, c, rot=0, k=1.0):
    if k <= 0.01: return
    if k != 1: im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))))
    if rot: im = im.rotate(-rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(im, (int(c[0] - im.width / 2), int(c[1] - im.height / 2)))

def stage(t):
    """The midnight stage: the tower rises from the bottom edge (her idea bank: a clock tower rising in), its hands
    sweep to midnight, and it shakes as the bells ring."""
    im = Image.new('RGBA', (W, H), STAGE + (255,)); im.alpha_composite(GRAIN)
    rise = back_out((t - T_STAGE) / 0.6, 1.2); dy = (1 - rise) * 1500
    ring = 1.5 * math.sin((t - 6.95) * 50) * (1 - clamp((t - 6.95) / 0.7)) if t > 6.95 else 0
    c = (DIAL_AT[0], DIAL_AT[1] + dy)
    put(im, TOWER, (c[0] - DIAL[0] + TOWER.width / 2, c[1] - DIAL[1] + TOWER.height / 2), ring)
    u = ease((t - 5.95) / 1.0)
    put(im, HOUR, c, -7.5 * (1 - u) + ring); put(im, MINUTE, c, -90 * (1 - u) + ring)
    return im

def frame(t):
    if t < T_CUT: im = vid('with', t).convert('RGBA')
    elif t < T_STAGE: im = vid('without', t - T_CUT).convert('RGBA')
    elif t < T_CLIP3: im = stage(t)
    else: im = vid('again', t - T_CLIP3).convert('RGBA')
    # 1-2 the hook stays through the cut, under the smoke; "see it" becomes "don't" while the smoke is thickest
    word(im, t, 0.0, 'now you', (520, 360), 130, t1=T_STAGE)
    word(im, t, 0.25, 'see it', (520, 560), 250, ACC, t1=3.35)
    word(im, t, 3.35, "don't", (520, 560), 260, ACC, t1=T_STAGE)
    boxed(im, t, 0.7, '[me + our spice candle]', (520, 760), 62, WHITE, INK, t1=3.35)
    for k, (kind, i, w, c) in enumerate((('icon', 9, 170, (190, 470)), ('icon', 11, 190, (880, 640)), ('icon', 8, 130, (860, 420)))):
        doodle(im, t, 0.5 + k * 0.15, kind, i, w, c, WHITE, t1=T_CUT)
    # 3 the midnight stage
    word(im, t, 5.5, 'gone', (540, 360), 300, ACC, t1=T_CLIP3)
    boxed(im, t, 5.8, '[at midnight Oct 31]', (540, 580), 70, WHITE, INK, t1=T_CLIP3)
    doodle(im, t, 6.95, 'burst', 1, 190, (120, 900), (246, 238, 222), -20, t1=T_CLIP3)   # the alarm rings by its edge
    doodle(im, t, 7.05, 'burst', 1, 190, (960, 900), (246, 238, 222), 20, t1=T_CLIP3)
    # 4 the product again
    word(im, t, 8.4, 'only', (520, 380), 170, t1=T_CTA)
    boxed(im, t, 8.65, '[20 left]', (520, 590), 110, ACC, WHITE, t1=T_CTA)
    doodle(im, t, 9.1, 'frame', 2, 560, (520, 590), WHITE, -4, t1=T_CTA)
    # 5 CTA
    word(im, t, 10.65, 'comment', (520, 400), 170)
    boxed(im, t, 10.9, '[POOF]', (520, 600), 130, ACC, WHITE, pill=True)
    word(im, t, 11.2, "before it's gone", (520, 800), 110, ACC)
    doodle(im, t, 11.6, 'arrow', 0, 200, (150, 600), ACC)
    # her smoke on top of everything, blend Screen: the poof at the snap, then the puff that wipes the stage away
    for t0 in (T_CUT, T_PUFF2):
        s = smoke_at(t, t0)
        if s is not None: im = ImageChops.screen(im.convert('RGB'), s).convert('RGBA')
    return im.convert('RGB')

def main():
    fdir = TMP / 'out'; fdir.mkdir(exist_ok=True)
    for f in fdir.glob('*.jpg'): f.unlink()
    for i in range(int(END * FPS)): frame(i / FPS).save(fdir / f'{i:04d}.jpg', quality=88)
    mp4 = OUT / 'motion-test.mp4'
    subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-framerate', str(FPS), '-i', str(fdir / '%04d.jpg'), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-crf', '20', '-movflags', '+faststart', str(mp4)], check=True)
    print('saved', mp4)

if __name__ == '__main__':
    main()
