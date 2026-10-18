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

W, H, FPS, END = 1080, 1920, 30, 17.5
OUT = E.PACK / 'halloween' / 'h5-trick-or-treat' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
INK, ORANGE, BRASS, CORN_Y, CORN_W = (22, 20, 24), (236, 120, 36), (214, 160, 70), (250, 196, 40), (252, 246, 232)
BOLD = 'C:/Windows/Fonts/arialbd.ttf'
SNAP = 'C:/Windows/Fonts/SNAP____.TTF'     # built-in words, rendered as artwork (her pick: option C)
TAFFY = (196, 170, 232)
CLIPS = {'trick': ('IMG_1447', 0.3), 'treat': ('IMG_1439', 1.0), 'proof': ('IMG_1460', 1.0)}   # v9: clip 3 is the proof

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

# ---- v9 (2026-10-18, her new principles: 7+ scenes, two home bases = the buyer's clips + the doorstep stage,
# footage in openings, a carried element, a tech prop, embellished shapes behind words, reading time) ----------------
PANES = [(168, 0, 408, 960), (688, 0, 928, 960)]           # door 1's two glass panes (measured on her photo)
def door_with_panes(video):
    """Door 1 closed, with the clip playing behind its glass (the lattice stays on top)."""
    im = DOOR_SHUT.copy(); g = ImageOps.grayscale(DOOR_SHUT.convert('RGB'))
    for b in PANES:
        v = ImageOps.fit(video, (b[2] - b[0], b[3] - b[1])); im.paste(v, b[:2])
        lat = DOOR_SHUT.crop(b); lat.putalpha(g.crop(b).point(lambda x: 230 if x < 70 else 0))   # the dark lattice bars
        im.alpha_composite(lat, b[:2])
    return im

def _crt():
    t = Image.open(E.PACK / 'assets' / 'props' / 'source' / 'tech' / 'Beige CRT monitor with green screen-56.png').convert('RGBA')
    t = B.cut_white(t, tol=8); r, g, b, a = t.split()
    key = ImageChops.subtract(g, ImageChops.lighter(r, b)).point(lambda v: 0 if v > 40 else 255)   # green screen -> clear
    t.putalpha(ImageChops.multiply(a, key)); return t
CRT = _crt(); _sb = ImageChops.invert(CRT.split()[3]).getbbox()
CRT_SCREEN = (156 + 6, 180 + 6, 832 - 6, 816 - 6)          # its screen, measured on her photo (minus the bezel lip)
def crt_scene(video, scale=0.86, c=(560, 900)):
    """The retro TV standing on door 2's porch steps, the clip playing on its screen."""
    im = HOUSE.copy(); im = ImageEnhance.Brightness(im).enhance(0.75)
    w = int(CRT.width * scale); h = int(CRT.height * scale); tv = CRT.resize((w, h), Image.LANCZOS)
    x0, y0 = int(c[0] - w / 2), int(c[1] - h / 2); sx = [int(v * scale) for v in CRT_SCREEN]
    im.alpha_composite(ImageOps.fit(video, (sx[2] - sx[0], sx[3] - sx[1])), (x0 + sx[0], y0 + sx[1]))
    im.alpha_composite(E.C.shadow(tv, (10, 18), 18, 90), (x0 - 18, y0 - 18))
    return im, (x0 + (sx[0] + sx[2]) / 2, y0 + (sx[1] + sx[3]) / 2), (sx[2] - sx[0]) / W

def _paper(name, w):
    im = B.cut_white(Image.open(E.PACK / 'assets' / 'props' / 'source' / 'physical' / name), tol=8)
    return B.fit_w(im.crop(im.getbbox()), w)
NOTE = _paper('Blank Yellow Sticky Note on White.png', 520)
PIN = _paper('Glossy Push Pin Quartet.png', 260).crop((0, 0, 130, 130))
def sticky(img, t, t0, text, c, rot=-4):
    """Her words on a real yellow sticky note, pinned, popping on."""
    if t < t0: return
    k = back_out((t - t0) / 0.3, 2.2); n = NOTE.copy(); d = ImageDraw.Draw(n)
    f = E.ImageFont.truetype(BOLD, 64); d.multiline_text((n.width / 2, n.height / 2), text, font=f, fill=(30, 26, 22), anchor='mm', align='center')
    n = n.resize((max(1, int(n.width * k)), max(1, int(n.height * k)))).rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(E.C.shadow(n, (8, 14), 12, 90), (int(c[0] - n.width / 2), int(c[1] - n.height / 2)))
    if k > 0.9: img.alpha_composite(PIN, (int(c[0] - 40), int(c[1] - n.height / 2 - 30)))

BURST_BIG = D.get('bursts', 5, _LAV, 760)
def zoom_into(im, c, z):
    big = im.resize((int(W * z), int(H * z)), Image.BICUBIC); ox, oy = c[0] * z - W / 2, c[1] * z - H / 2
    return big.crop((int(ox), int(oy), int(ox) + W, int(oy) + H))

def frame(t):
    # S1 0.0-2.2 THE STAGE (door 1): clip 1 plays behind the door's glass; TRICK / or TREAT? lands; three knocks
    if t < 2.2:
        im = door_with_panes(vid('trick', t))
        word_art(im, t, -0.3, 'TRICK', 510, 1130, 210, 'taffy', 'jitter')
        word_art(im, t, 0.1, 'or TREAT?', 500, 1370, 120, 'taffy', 'pop', 0.04)
        for k, (x, y) in enumerate(((430, 860), (660, 820), (540, 760))):
            if t > 0.5 + k * 0.4: D.draw_on(im, DOO['burst1' if k % 2 == 0 else 'burst2'], (x, y), t, 0.5 + k * 0.4, 0.12)
        im = shake(im, t, hits=(0.5, 0.9, 1.3))
    # 2.2-3.2 the door swings open on its hinge, then we push into the hallway: clip 1 (carried from the panes)
    elif t < 3.2:
        if t < 2.8:
            u = ease((t - 2.2) / 0.6); im = door_open(t - 1.3)
            th = math.radians(78 * u); lw = 880 * math.cos(th); d = H * 0.10 * math.sin(th)
            dst = [(1000 - lw, d), (1000, 0), (1000, H), (1000 - lw, H - d)]; src = [(120, 0), (1000, 0), (1000, H), (120, H)]
            if lw > 6:
                leaf = door_with_panes(vid('trick', t)).transform((W, H), Image.PERSPECTIVE, persp(dst, src), Image.BICUBIC)
                m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(dst, fill=255); leaf.putalpha(m)
                im.alpha_composite(ImageEnhance.Brightness(leaf).enhance(1 - 0.5 * u))
        else:
            u = ease((t - 2.8) / 0.4); im = zoom_into(door_open(t - 1.3), DOOR_C, 1 + 2.4 * u)
            if u > 0.7: im = Image.blend(im, vid('trick', t - 1.3), (u - 0.7) / 0.3)
    # S2 3.2-5.6 HOME BASE 1, the buyer's clip: the TRICK, her words on a pinned sticky note, crossed out
    elif t < 5.6:
        im = vid('trick', t - 1.3)
        word_art(im, t, 3.25, 'TRICK', 540, 420, 220, 'taffy', 'jitter')
        sticky(im, t, 3.55, '[cheap\nsponges]', (700, 900), -5)
        D.draw_on(im, DOO['x'], (300, 1000), t, 4.3, 0.3, -6)
    # 5.6-6.1 two-tone strip slice to door 2 (she loved it)
    elif t < 6.1:
        u = ease((t - 5.6) / 0.5); a = vid('trick', t - 1.3); im = HOUSE.copy(); n = 12; sh = H // n
        tints = [Image.new('RGBA', (W, sh), (196, 170, 232, 255)), Image.new('RGBA', (W, sh), (70, 44, 96, 255))]
        for k in range(n):
            strip = Image.blend(a.crop((0, k * sh, W, (k + 1) * sh)), tints[k % 2], 0.35 + 0.25 * u)
            im.alpha_composite(strip, (int((W + 40) * u * (1 if k % 2 else -1) * (0.85 + 0.03 * k)), k * sh))
    # S3 6.1-8.3 THE STAGE again (door 2): it opens, clip 2 in the real doorway, candy corn and taffy pop up out of it
    elif t < 8.3:
        im = arch_house(1, vid('treat', t - 6.1)); candy_pop(im, t, 6.5, ARCH_C)
        line(im, t, 6.2, '[something sweet is coming]', (520, 330), 62)
    # 8.3-9.0 we go through the doorway into clip 2 while the candy drops away
    elif t < 9.0:
        u = ease((t - 8.3) / 0.7); im = arch_house(1 + 5.5 * u * u, vid('treat', t - 6.1))
        if u > 0.75: im = Image.blend(im, vid('treat', t - 6.1), (u - 0.75) / 0.25)
        candy_pop(im, t, 6.5, ARCH_C, drop_at=8.3)
    # S4 9.0-11.4 HOME BASE 1: the TREAT; a starburst BEHIND the word; one candy corn carried in lands on the T
    elif t < 11.4:
        im = vid('treat', t - 6.1)
        k = back_out((t - 9.05) / 0.3)
        if t > 9.05:
            b = BURST_BIG.resize((max(1, int(BURST_BIG.width * k)), max(1, int(BURST_BIG.height * k)))).rotate(t * 8, expand=True, resample=Image.BICUBIC)
            im.alpha_composite(b, (int(540 - b.width / 2), int(470 - b.height / 2)))
        word_art(im, t, 9.15, 'TREAT', 540, 470, 210, 'taffy', 'drop', 0.06)
        c = CANDY[1]; u = ease((t - 9.0) / 0.6); cy = 160 + (330 - 160) * u; cx = 900 + (330 - 900) * u
        cc = B.fit_w(c, 150).rotate(-20 + 20 * u, expand=True, resample=Image.BICUBIC); im.alpha_composite(E.C.shadow(cc, (5, 9), 9, 70), (int(cx - cc.width / 2), int(cy - cc.height / 2)))
        line(im, t, 9.6, '[our 5-minute scrub]', (540, 720), 80)
        D.draw_on(im, DOO['heart'], (860, 1200), t, 10.2, 0.35, 8)
    # 11.4-12.0 the clip shrinks onto the retro TV standing on door 2's porch (carried into the stage)
    elif t < 12.0:
        u = ease((t - 11.4) / 0.6); tvim, sc, frac = crt_scene(vid('treat', t - 6.1))
        z = 1 / frac; zz = z + (1 - z) * u; im = zoom_into(tvim, sc, zz)
    # S5 12.0-14.2 THE STAGE (door 2's porch): the TV plays clip 3, the proof; her words on a pinned note
    elif t < 14.2:
        im, sc, frac = crt_scene(vid('proof', t - 12.0))
        word_art(im, t, 12.05, 'PROOF', 540, 300, 170, 'taffy', 'pop', 0.05)
        sticky(im, t, 12.4, '[5-star\nreviews]', (720, 1330), 6)
        D.draw_on(im, DOO['arrow'], (250, 1330), t, 12.9, 0.3, -20)
    # 14.2-14.8 we zoom into the TV screen: clip 3 fills the frame
    elif t < 14.8:
        u = ease((t - 14.2) / 0.6); tvim, sc, frac = crt_scene(vid('proof', t - 12.0)); im = zoom_into(tvim, sc, 1 + (1 / frac - 1) * u)
    # S6 14.8-17.5 HOME BASE 1 + CTA: Comment TREAT with a burst behind the keyword
    else:
        im = vid('proof', t - 12.0)
        word_art(im, t, 14.8, 'COMMENT', 540, 470, 150, 'taffy', 'pop', 0.05)
        k = back_out((t - 15.0) / 0.3)
        if t > 15.0:
            b = BURST_BIG.resize((max(1, int(BURST_BIG.width * 0.8 * k)), max(1, int(BURST_BIG.height * 0.8 * k))))
            im.alpha_composite(b, (int(560 - b.width / 2), int(700 - b.height / 2)))
        line(im, t, 15.05, '[TREAT]', (560, 700), 150)
        line(im, t, 15.2, 'for something sweet: 15% off', (520, 900), 64)
        D.draw_on(im, DOO['wavy'], (520, 1000), t, 15.5, 0.35)
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
