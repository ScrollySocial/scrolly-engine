"""Rough motion test for h5 "Trick or treat" (Halloween pack), following Mercedes's notes (rounds 1 to 4) and
FRAMEWORK.md. The business job: a common mistake (the TRICK) next to your product (the TREAT), then a keyword CTA.
Built-in words are extra-fun artwork lettering: Snap ITC in lavender taffy stripes (her pick, v2); KNOCK jumps on
each knock, TRICK jitters, "or" teases, TREAT drops and bounces. v7: door 2 opens, candy corn and taffy (plain, no outlines) pop up out of the doorway, drop away, then the TREAT. Editable words are Arial Bold (every buyer has it).
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

W, H, FPS, END = 1080, 1920, 30, 15.0
OUT = E.PACK / 'halloween' / 'h5-trick-or-treat' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
INK, ORANGE, BRASS, CORN_Y, CORN_W = (22, 20, 24), (236, 120, 36), (214, 160, 70), (250, 196, 40), (252, 246, 232)
BOLD = 'C:/Windows/Fonts/arialbd.ttf'
SNAP = 'C:/Windows/Fonts/SNAP____.TTF'     # built-in words, rendered as artwork (her pick: option C)
TAFFY = (196, 170, 232)
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
    elif kind == 'taffy':   # lavender taffy with soft white twist stripes
        im.paste(TAFFY + (255,), (0, 0, w, h))
        for x in range(-h, w + h, 40): d.polygon([(x, 0), (x + 12, 0), (x + 12 + h, h), (x + h, h)], fill=(255, 255, 255, 110))
    elif kind == 'brass':
        for y in range(h):
            k = 0.75 + 0.5 * abs(math.sin(y / h * math.pi * 1.4)); d.line((0, y, w, y), fill=tuple(min(255, int(c * k)) for c in BRASS) + (255,))
    return im

_letters = {}
def letter(ch, px, kind):
    """One artwork letter: Arial Bold filled with a pattern, a thick ink edge and a hard drop shadow."""
    key = (ch, px, kind)
    if key in _letters: return _letters[key]
    f = E.ImageFont.truetype(SNAP, px); pad = px // 3 + 20
    w = int(f.getlength(ch)) + 2 * pad; h = int(px * 1.5) + 2 * pad
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((w / 2, h / 2), ch, font=f, fill=255, anchor='mm')
    edge = Image.new('L', (w, h), 0); ImageDraw.Draw(edge).text((w / 2, h / 2), ch, font=f, fill=255, anchor='mm', stroke_width=max(6, px // 13))
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sh = Image.new('RGBA', (w, h), INK + (255,)); sh.putalpha(edge.point(lambda v: int(v * 0.55)))
    out.alpha_composite(sh, (px // 22, px // 16))
    e = Image.new('RGBA', (w, h), INK + (255,)); e.putalpha(edge); out.alpha_composite(e)
    p = fill(kind, w, h); p.putalpha(m); out.alpha_composite(p)
    _letters[key] = out; return out

def word_art(img, t, t0, text, cx, cy, px, kind, motion='pop', step=0.07):
    gap = px * 0.02; widths = [E.ImageFont.truetype(SNAP, px).getlength(ch) for ch in text]
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

# ---- candy flood (v5): her single-piece candy photos pour in after door 2, like #2's packing peanuts ------------------
import glob as _g
def _candy_cut(f):
    """Cut from white gently (tol 8) so white details survive (candy corn tips); cached as PNGs."""
    out = TMP / 'candy' / (Path(f).stem + '.png'); out.parent.mkdir(exist_ok=True)
    if not out.exists(): B.cut_white(Image.open(f), tol=8).save(out)
    return Image.open(out).convert('RGBA')
def inked(im, w=7, seed=0):
    """A hand-drawn ink outline around a real photo: a dark line a few px outside the edge, slightly off-register."""
    a = im.split()[3].point(lambda v: 255 if v > 100 else 0); pad = w + 6
    big = Image.new('L', (im.width + 2 * pad, im.height + 2 * pad), 0); big.paste(a, (pad, pad))
    ring = ImageChops.subtract(big.filter(ImageFilter.MaxFilter(2 * w + 1)), big.filter(ImageFilter.MaxFilter(2 * (w - 4) + 1)))
    r = random.Random(seed); out = Image.new('RGBA', big.size, (0, 0, 0, 0))
    ink = Image.new('RGBA', big.size, (34, 26, 38, 255)); ink.putalpha(ring.filter(ImageFilter.GaussianBlur(0.8)))
    out.alpha_composite(ink, (r.randint(-3, 3), r.randint(-3, 3))); out.alpha_composite(im, (pad, pad))
    return out
CANDY = [_candy_cut(f) for i, f in enumerate(sorted(_g.glob(str(B.SRC / '*'))))   # no outline: she found the inked version 'dumb'; real candy reads best plain
         if any(k in Path(f).name.lower() for k in ('candy corn', 'taffy'))]

def candy_bands(n_bands=10, seed=4):
    """The flood: real candy laid over the whole screen, grouped in horizontal bands (top band first)."""
    r = random.Random(seed)
    spots = [(int((cx + .5) * W / 5 + r.randint(-60, 60)), int((cy + .5) * H / 9 + r.randint(-60, 60))) for cy in range(9) for cx in range(5)]
    spots += [(r.randint(0, W), r.randint(0, H)) for _ in range(26)]
    pieces = []
    for k, (x, y) in enumerate(spots):
        c = CANDY[k % len(CANDY)]; w = r.randint(250, 380)
        c = B.fit_w(c, w).rotate(r.randint(0, 359), expand=True, resample=Image.BICUBIC)
        pieces.append((y, E.C.shadow(c, (6, 10), 10, 80), x))
    pieces.sort(key=lambda q: q[0]); out = []
    for b in range(n_bands):
        band = pieces[b * len(pieces) // n_bands:(b + 1) * len(pieces) // n_bands]
        x0 = min(x - p.width // 2 for _, p, x in band); y0 = min(y - p.height // 2 for y, p, _ in band)
        x1 = max(x + p.width // 2 for _, p, x in band); y1 = max(y + p.height // 2 for y, p, _ in band)
        im = Image.new('RGBA', (x1 - x0 + 2, y1 - y0 + 2), (0, 0, 0, 0))
        for y, p, x in band: im.alpha_composite(p, (x - p.width // 2 - x0, y - p.height // 2 - y0))
        out.append((im, (x0, y0)))
    return out
BANDS = candy_bands()
_pr = random.Random(9)
POPS = []
TAFFY_IDS = [i for i, f in enumerate(f for f in sorted(_g.glob(str(B.SRC / '*'))) if any(k in Path(f).name.lower() for k in ('candy corn', 'taffy')))
             if 'taffy' in Path(sorted(f for f in _g.glob(str(B.SRC / '*')) if any(k in Path(f).name.lower() for k in ('candy corn', 'taffy')))[i]).name.lower()]
order = list(range(16)); _pr.shuffle(order)
for n in range(16):   # spread evenly all the way round the doorway, alternating candy corn and taffy
    a = 2 * math.pi * n / 16 + _pr.uniform(-0.15, 0.15); r = _pr.uniform(300, 470); k = n % len(CANDY)
    w = _pr.uniform(270, 330) if k in TAFFY_IDS else _pr.uniform(190, 240)
    POPS.append((k, a, r, order[n] * 0.06 + _pr.uniform(0, 0.03), w, _pr.uniform(-35, 35)))
def candy_pop(img, t, t0, c, drop_at=None):
    """Candy pops up out of the doorway one piece at a time: it springs from the door to its spot with a bounce and
    stays, wobbling a little; at drop_at every piece falls away down the screen (never toward the lens)."""
    for k, a, r, delay, w, rot in POPS:
        tt = t - t0 - delay
        if tt < 0: continue
        u = back_out(tt / 0.35, 2.2); x = c[0] + r * math.cos(a) * u; y = c[1] + r * math.sin(a) * 1.35 * u
        x = min(max(x, 90), W - 90)
        if drop_at and t > drop_at:
            v = t - drop_at - delay * 0.4
            if v > 0: y += 2600 * v * v
        sc = max(0.05, min(1.0, back_out(tt / 0.25, 2.4)))
        im = B.fit_w(CANDY[k], max(8, int(w * sc))).rotate(rot + 5 * math.sin(t * 5 + delay * 9), expand=True, resample=Image.BICUBIC)
        if -400 < y < H + 400: img.alpha_composite(E.C.shadow(im, (6, 10), 10, 70), (int(x - im.width / 2), int(y - im.height / 2)))

def candy_flood(img, t, t0):
    """Bottom band lands first, the top band last; each drops from above with a small bounce; then they all fall away."""
    for j, (im, (x0, y0)) in enumerate(reversed(BANDS)):
        a = t0 + j * 0.045; b = t0 + 0.85 + j * 0.035
        if t < a: continue
        if t < b:
            u = (t - a) / 0.22; dy = -2100 * (1 - back_out(u, 1.6)) if u < 1 else 0
        else:
            u = (t - b) / 0.32
            if u > 1: continue
            dy = 2300 * u * u
        img.alpha_composite(im, (x0, int(y0 + dy)))

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

def persp(dst, src):
    """Coefficients for PIL's PERSPECTIVE transform mapping output points dst back to source points src."""
    A = []
    for (x, y), (X, Y) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -X * x, -X * y, X], [0, 0, 0, x, y, 1, -Y * x, -Y * y, Y]]
    n = 8
    for c in range(n):   # Gauss-Jordan with partial pivoting (8 unknowns)
        piv = max(range(c, n), key=lambda r: abs(A[r][c])); A[c], A[piv] = A[piv], A[c]
        A[c] = [v / A[c][c] for v in A[c]]
        for r in range(n):
            if r != c and A[r][c]: f = A[r][c]; A[r] = [a - f * b for a, b in zip(A[r], A[c])]
    return tuple(A[r][8] for r in range(n))

_ib = B.house2(1.9)[1]; _is = W / (_ib[2] - _ib[0])
ARCH_C = ((741 - _ib[0]) * _is, (622 - _ib[1]) * _is)       # door 2's doorway on screen (arch measured on her photo)

import doodles as D
_LAV = (196, 170, 232)
DOO = {'burst1': D.get('bursts', 5, _LAV, 300), 'burst2': D.get('bursts', 6, _LAV, 280), 'x': D.get('checks', 4, _LAV, 330),
       'rays': D.get('bursts', 4, _LAV, 380), 'heart': D.get('icons', 3, _LAV, 300), 'sparkle': D.get('icons', 9, (255, 255, 255), 200),
       'arrow': D.get('arrows', 0, _LAV, 270), 'wavy': D.get('underlines', 2, _LAV, 620)}

def frame(t):
    # 0.0-1.3 door 1, KNOCK KNOCK in brass jumps on each knock (and the picture jolts)
    if t < 1.3:
        im = DOOR_SHUT.copy()
        word_art(im, t, 0.05, 'KNOCK', 540, 520, 180, 'taffy', 'knock'); word_art(im, t, 0.4, 'KNOCK', 540, 760, 180, 'taffy', 'knock')
        D.draw_on(im, DOO['burst1'], (215, 1180), t, 0.25, 0.15); D.draw_on(im, DOO['burst2'], (870, 1290), t, 0.6, 0.15)   # knock impacts
        im = shake(im, t)
    # 1.3-2.0 the door swings inward on its right-hand hinge, in perspective, onto the lit hallway (clip 1 plays there)
    elif t < 2.0:
        u = ease((t - 1.3) / 0.6); im = door_open(t - 1.3)
        th = math.radians(78 * u); lw = 880 * math.cos(th); d = H * 0.10 * math.sin(th)
        dst = [(1000 - lw, d), (1000, 0), (1000, H), (1000 - lw, H - d)]
        src = [(120, 0), (1000, 0), (1000, H), (120, H)]
        if lw > 6:
            leaf = DOOR_SHUT.transform((W, H), Image.PERSPECTIVE, persp(dst, src), Image.BICUBIC)
            m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(dst, fill=255); leaf.putalpha(m)
            im.alpha_composite(ImageEnhance.Brightness(leaf).enhance(1 - 0.5 * u))
        if u > 0.9: im = Image.blend(im, door_open(t - 1.3), (u - 0.9) / 0.1)
    # 2.0-2.6 we push into the doorway: clip 1 grows to full screen
    elif t < 2.6:
        u = ease((t - 2.0) / 0.6); z = 1 + 2.4 * u; im0 = door_open(t - 1.3)
        big = im0.resize((int(W * z), int(H * z)), Image.BICUBIC); ox, oy = DOOR_C[0] * z - W / 2, DOOR_C[1] * z - H / 2
        im = big.crop((int(ox), int(oy), int(ox) + W, int(oy) + H))
        if u > 0.7: im = Image.blend(im, vid('trick', t - 1.3), (u - 0.7) / 0.3)
    # 2.6-4.8 clip 1 full screen: the TRICK (stripes, jittering)
    elif t < 4.8:
        im = vid('trick', t - 1.3)
        word_art(im, t, 2.7, 'TRICK', 520, 450, 220, 'taffy', 'jitter')
        line(im, t, 3.3, '[cheap sponges]', (520, 680), 80)
        word_art(im, t, 4.0, 'or...', 520, 880, 150, 'taffy', 'pop', 0.08)
        D.draw_on(im, DOO['x'], (820, 1240), t, 3.55, 0.3, -6)      # the trick, crossed out
    # 4.8-5.3 two-tone strip slice (her Pinterest pick): the TRICK clip cuts into strips, alternately tinted
    # lavender and plum, that slide apart left and right to reveal door 2
    elif t < 5.3:
        u = ease((t - 4.8) / 0.5); a = vid('trick', t - 1.3); im = HOUSE.copy(); n = 12; sh = H // n
        tints = [Image.new('RGBA', (W, sh), (196, 170, 232, 255)), Image.new('RGBA', (W, sh), (70, 44, 96, 255))]
        for k in range(n):
            strip = a.crop((0, k * sh, W, (k + 1) * sh))
            strip = Image.blend(strip, tints[k % 2], 0.35 + 0.25 * u)
            dx = int((W + 40) * u * (1 if k % 2 else -1) * (0.85 + 0.03 * k))
            im.alpha_composite(strip, (dx, k * sh))
    # 5.3-6.1 door 2: a quick knock
    elif t < 6.1:
        im = HOUSE.copy()
        word_art(im, t - 5.3 + 0.0, -0.0, 'KNOCK', 540, 560, 170, 'taffy', 'knock')
        line(im, t, 5.55, '[something sweet is coming]', (520, 820), 62)
        D.draw_on(im, DOO['rays'], (540, 1180), t, 5.45, 0.25)        # the knock on door 2
        im = shake(im, t - 5.3)
    # 6.1-6.5 door 2 opens: warm light, then clip 2 appears in the real doorway
    elif t < 6.5:
        u = ease((t - 6.1) / 0.4); shut = arch_house(1, Image.new('RGBA', (W, H), (255, 214, 150, 255)))
        im = Image.blend(shut, arch_house(1, vid('treat', t - 6.1)), u)
    # 6.5-7.9 candy pops up out of the doorway (candy corn and taffy, inked), clip 2 playing in the arch
    elif t < 7.9:
        im = arch_house(1, vid('treat', t - 6.1)); candy_pop(im, t, 6.5, ARCH_C)
    # 7.9-8.6 we go through the doorway into clip 2 while the candy drops away
    elif t < 8.6:
        u = ease((t - 7.9) / 0.7); im = arch_house(1 + 5.5 * u * u, vid('treat', t - 6.1))
        if u > 0.75: im = Image.blend(im, vid('treat', t - 6.1), (u - 0.75) / 0.25)
        candy_pop(im, t, 6.5, ARCH_C, drop_at=7.9)
    # 8.6-12.0 clip 2 full screen: the TREAT
    elif t < 12.0:
        im = vid('treat', t - 6.1)
        word_art(im, t, 8.7, 'TREAT', 520, 520, 230, 'taffy', 'drop', 0.09)
        line(im, t, 9.3, '[our 5-minute scrub]', (520, 740), 80)
        D.draw_on(im, DOO['heart'], (860, 1120), t, 9.6, 0.35, 8); D.draw_on(im, DOO['sparkle'], (190, 1000), t, 9.9, 0.3)   # the treat, loved
    # 12.0-15.0 CTA over clip 3: COMMENT + the editable keyword
    else:
        im = vid('cta', t - 12.0)
        word_art(im, t, 12.05, 'COMMENT', 520, 500, 150, 'taffy', 'pop', 0.06)
        line(im, t, 12.6, '[TREAT]', (560, 720), 150)
        line(im, t, 13.0, "for something sweet: 15% off", (520, 880), 66)
        D.draw_on(im, DOO['arrow'], (170, 720), t, 12.9, 0.3, 0); D.draw_on(im, DOO['wavy'], (520, 1000), t, 13.3, 0.35)   # point at the keyword, underline the offer
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
