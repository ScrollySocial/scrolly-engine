"""Rough motion test for h5 "Trick or treat" (Halloween pack), following Mercedes's notes (rounds 1 to 4) and
FRAMEWORK.md. The business job: a common mistake (the TRICK) next to your product (the TREAT), then a keyword CTA.
Built-in words are extra-fun artwork lettering, each with its own Halloween pattern: KNOCK in brass (from the doors'
own brass plates), TRICK in orange-and-black stripes that jitter, TREAT in candy-corn bands that drop and bounce,
COMMENT in stripes. Editable words are Arial Bold (every buyer has it).
Moves (its own, not h6's or h3's): the door swings open on its hinge, we push into the doorway into clip 1; a whip pan
along the street to door 2 (her generated Victorian house, same setting to the end); we fly through door 2's arch into
clip 2. No door slam, no candy until her new single-piece candy images exist.
Usage: python build/motion_h5.py  ->  halloween/h5-trick-or-treat/preview/motion-test.mp4
"""
import math, random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps, ImageChops, ImageEnhance
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import storyboard_halloween as B

W, H, FPS, END = 1080, 1920, 30, 14.0
OUT = E.PACK / 'halloween' / 'h5-trick-or-treat' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
INK, ORANGE, BRASS, CORN_Y, CORN_W = (22, 20, 24), (236, 120, 36), (214, 160, 70), (250, 196, 40), (252, 246, 232)
BOLD = 'C:/Windows/Fonts/arialbd.ttf'
CLIPS = {'trick': ('IMG_1447', 0.3), 'treat': ('IMG_1439', 1.0), 'cta': ('IMG_1439', 5.0)}

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

# ---- artwork lettering ---------------------------------------------------------------------------------------------------
def fill(kind, w, h):
    im = Image.new('RGBA', (w, h)); d = ImageDraw.Draw(im)
    if kind == 'stripes':
        im.paste(ORANGE + (255,), (0, 0, w, h))
        for x in range(-h, w + h, 56): d.polygon([(x, 0), (x + 26, 0), (x + 26 + h, h), (x + h, h)], fill=INK + (255,))
    elif kind == 'corn':   # candy corn: white tip, orange middle, yellow base
        d.rectangle((0, 0, w, h * 0.34), fill=CORN_W + (255,)); d.rectangle((0, h * 0.34, w, h * 0.66), fill=ORANGE + (255,))
        d.rectangle((0, h * 0.66, w, h), fill=CORN_Y + (255,))
    elif kind == 'brass':
        for y in range(h):
            k = 0.75 + 0.5 * abs(math.sin(y / h * math.pi * 1.4)); d.line((0, y, w, y), fill=tuple(min(255, int(c * k)) for c in BRASS) + (255,))
    return im

_letters = {}
def letter(ch, px, kind):
    """One artwork letter: Arial Bold filled with a pattern, a thick ink edge and a hard drop shadow."""
    key = (ch, px, kind)
    if key in _letters: return _letters[key]
    f = E.ImageFont.truetype(BOLD, px); pad = px // 4 + 20
    w = int(f.getlength(ch)) + 2 * pad; h = int(px * 1.25) + 2 * pad
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((w / 2, h / 2), ch, font=f, fill=255, anchor='mm')
    edge = Image.new('L', (w, h), 0); ImageDraw.Draw(edge).text((w / 2, h / 2), ch, font=f, fill=255, anchor='mm', stroke_width=max(6, px // 13))
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sh = Image.new('RGBA', (w, h), INK + (255,)); sh.putalpha(edge.point(lambda v: int(v * 0.55)))
    out.alpha_composite(sh, (px // 22, px // 16))
    e = Image.new('RGBA', (w, h), INK + (255,)); e.putalpha(edge); out.alpha_composite(e)
    p = fill(kind, w, h); p.putalpha(m); out.alpha_composite(p)
    _letters[key] = out; return out

def word_art(img, t, t0, text, cx, cy, px, kind, motion='pop', step=0.07):
    gap = px * 0.06; widths = [E.ImageFont.truetype(BOLD, px).getlength(ch) for ch in text]
    x = cx - (sum(widths) + gap * (len(text) - 1)) / 2
    for i, ch in enumerate(text):
        lc = x + widths[i] / 2; x += widths[i] + gap
        if ch == ' ': continue
        ti = t - t0 - i * step
        if ti < 0: continue
        L = letter(ch, px, kind); rot, dy, sc = 0.0, 0.0, 1.0
        if motion == 'pop':
            sc = back_out(ti / 0.3, 2.4); rot = (8 if i % 2 else -8) * (1 - clamp(ti / 0.3)) + (3 if i % 2 else -3)
        elif motion == 'jitter':   # TRICK: spooky little jolts that never settle
            sc = back_out(ti / 0.25, 2.0); r = random.Random(int(t * 12) * 31 + i)
            rot = r.uniform(-9, 9); dy = r.uniform(-10, 10)
        elif motion == 'drop':     # TREAT: drops in and bounces like a sweet into a bag
            dy = -(1 - back_out(ti / 0.45, 2.6)) * 900; rot = (5 if i % 2 else -5) * math.exp(-ti * 2)
        elif motion == 'knock':    # KNOCK: jumps on each knock
            sc = back_out(ti / 0.2, 2.0); kn = min(abs(t - k) for k in (0.25, 0.6, 0.95)); dy = -24 * max(0, 1 - kn / 0.12); rot = (4 if i % 2 else -4)
        if sc <= 0.02: continue
        im = L.resize((max(1, int(L.width * sc)), max(1, int(L.height * sc))), Image.BICUBIC) if sc != 1 else L
        if rot: im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
        img.alpha_composite(im, (int(lc - im.width / 2), int(cy + dy - im.height / 2)))

def line(img, t, t0, text, xy, px=72):
    """Editable line: Arial Bold, white with an ink edge (a font every buyer has)."""
    if t < t0: return
    k = back_out((t - t0) / 0.25); f = E.ImageFont.truetype(BOLD, max(6, int(px * (0.6 + 0.4 * k))))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text(xy, text, font=f, fill=(255, 255, 255, 255), anchor='mm', stroke_width=max(4, px // 12), stroke_fill=INK + (255,))
    img.alpha_composite(lay)

def shake(im, t, hits=(0.25, 0.6, 0.95), amp=16):
    kn = min(abs(t - k) for k in hits)
    if kn > 0.12: return im
    a = amp * (1 - kn / 0.12); out = Image.new('RGBA', im.size, (0, 0, 0, 255)); out.paste(im, (int(a * math.sin(t * 97)), int(a * math.cos(t * 83))))
    return out

# ---- the doors (her images) -----------------------------------------------------------------------------------------------
DOOR_SHUT = B.door1('Warmly Lit Traditional Entryway.png')
def door_open(t): return B.door1('Warm Townhouse Entryway at Night.png', vid('trick', t))
DOOR_C = (330, 960)        # the open doorway's centre on screen (door1's measured doorway, x 125 to 540)

HOUSE, HBOX = B.house2(1.0)
def arch_house(zoom, video):
    """Door 2's arch, framed for the fly-through: the clip fills the real doorway, then we zoom in through it."""
    im, box = B.house2(1.9); s = W / (box[2] - box[0])
    ax0, ax1, ay0, ay1 = (650 - box[0]) * s, (832 - box[0]) * s, (470 - box[1]) * s, (775 - box[1]) * s
    cx, cy = (ax0 + ax1) / 2, (ay0 + ay1) / 2
    arch = Image.new('L', (W, H), 0); ad = ImageDraw.Draw(arch)
    ad.rectangle((ax0, ay0 + (ax1 - ax0) / 2, ax1, ay1), fill=255); ad.ellipse((ax0, ay0, ax1, ay0 + (ax1 - ax0)), fill=255)
    im.paste(ImageOps.fit(video, (W, H)), (0, 0), arch.filter(ImageFilter.GaussianBlur(2)))
    if zoom > 1:
        big = im.resize((int(W * zoom), int(H * zoom)), Image.BICUBIC); ox, oy = cx * zoom - W / 2, cy * zoom - H / 2
        im = big.crop((int(ox), int(oy), int(ox) + W, int(oy) + H))
    return im

def frame(t):
    # 0.0-1.3 door 1, KNOCK KNOCK in brass jumps on each knock (and the picture jolts)
    if t < 1.3:
        im = DOOR_SHUT.copy()
        word_art(im, t, 0.05, 'KNOCK', 540, 520, 190, 'brass', 'knock'); word_art(im, t, 0.4, 'KNOCK', 540, 760, 190, 'brass', 'knock')
        im = shake(im, t)
    # 1.3-2.0 the door opens onto the lit hallway (her two photos of the same door), clip 1 playing in the hallway
    elif t < 2.0:
        u = ease((t - 1.3) / 0.35); im = Image.blend(DOOR_SHUT, door_open(t - 1.3), u)
    # 2.0-2.6 we push into the doorway: clip 1 grows to full screen
    elif t < 2.6:
        u = ease((t - 2.0) / 0.6); z = 1 + 2.4 * u; im0 = door_open(t - 1.3)
        big = im0.resize((int(W * z), int(H * z)), Image.BICUBIC); ox, oy = DOOR_C[0] * z - W / 2, DOOR_C[1] * z - H / 2
        im = big.crop((int(ox), int(oy), int(ox) + W, int(oy) + H))
        if u > 0.7: im = Image.blend(im, vid('trick', t - 1.3), (u - 0.7) / 0.3)
    # 2.6-4.8 clip 1 full screen: the TRICK (stripes, jittering)
    elif t < 4.8:
        im = vid('trick', t - 1.3)
        word_art(im, t, 2.7, 'TRICK', 520, 470, 230, 'stripes', 'jitter')
        line(im, t, 3.3, '[the trick: cheap sponges]', (520, 680), 70)
    # 4.8-5.3 whip pan along the street to door 2
    elif t < 5.3:
        u = ease((t - 4.8) / 0.5); a = vid('trick', t - 1.3); im = Image.new('RGBA', (W, H), (0, 0, 0, 255))
        im.alpha_composite(a, (int(-u * W), 0)); im.alpha_composite(HOUSE, (int(W - u * W), 0))
        im = B.streak(im, int(260 * math.sin(u * math.pi)) or 1, 9) if 0.05 < u < 0.95 else im
        im = im.convert('RGBA')
    # 5.3-6.1 door 2: a quick knock
    elif t < 6.1:
        im = HOUSE.copy()
        word_art(im, t, 5.35, 'KNOCK', 540, 620, 160, 'brass', 'pop', 0.05)
    # 6.1-7.0 door 2 opens: clip 2 fills the real arch, we fly through it to full screen
    elif t < 7.0:
        u = ease((t - 6.1) / 0.9); im = arch_house(1 + 5.5 * u * u, vid('treat', t - 6.1))
        if u > 0.75: im = Image.blend(im, vid('treat', t - 6.1), (u - 0.75) / 0.25)
    # 7.0-11.0 clip 2 full screen: the TREAT (candy-corn letters drop and bounce)
    elif t < 11.0:
        im = vid('treat', t - 6.1)
        word_art(im, t, 7.1, 'TREAT', 520, 470, 230, 'corn', 'drop', 0.09)
        line(im, t, 7.8, '[our 5-minute scrub]', (520, 690), 72)
    # 11.0-14.0 CTA over clip 3: COMMENT (stripes) + the editable keyword
    else:
        im = vid('cta', t - 11.0)
        word_art(im, t, 11.05, 'COMMENT', 520, 520, 150, 'stripes', 'pop', 0.06)
        line(im, t, 11.6, '[TREAT]', (520, 720), 150)
        line(im, t, 12.0, "and I'll send you 15% off", (520, 880), 64)
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
