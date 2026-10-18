"""#11 A day with it: the sky layer as a transition, with whimsical marker-drawn birds (Mercedes, 2026-10-17).

Her idea: birds drawn onto the video that stay on screen while the clip fades into the sky, or the other way round.
Both ways are shown here, with her sky clips from assets/props/source/images (stand-in July clips for the buyer's):
  1  morning clip, birds fly in  ->  the clip fades to blue clouds under them  ->  one bird loops (dotted trail)
  2  the clouds fade to the next clip, the birds keep flying over it and leave
  3  the other way: birds come in over the clip first, the sunset fades in under them, they fly off into the sun,
     and the sunset fades to the last clip
The birds are doodles (a wobbly thick ink line that boils like a hand drawing, white paper fill, butter beak), the
same marker look as her doodle sheets; the sky is the "very simple video layer" from FRAMEWORK.md.
Usage: python build/sky_birds.py [seconds ...]  ->  11-.../preview/sky-birds-test.mp4  (or a still sheet of those times)
"""
import math, random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import storyboard_b2 as S
from motion_b2 import Clip, FPS, VID, W, H, ease, seg, lerp, put

PACK = Path(__file__).resolve().parent.parent
SKIES = PACK / 'assets' / 'props' / 'source' / 'images'
OUT = PACK / '11-a-day-with-it' / 'preview'
SECS = 12.5
INK_C = (24, 22, 20, 255); PAPER = (252, 249, 240, 255); BUTTER = (244, 196, 72, 255)

class Sky(Clip):
    """One of her sky videos (SDR, so no tone map), cached as 30 fps frames like the stand-in clips."""
    def __init__(self, name, t0, secs):
        d = VID / f'sky-{name}-{t0}'; d.mkdir(parents=True, exist_ok=True)
        if not any(d.glob('*.jpg')):
            subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t0), '-t', str(secs), '-i', str(SKIES / f'{name}.mp4'),
                            '-vf', f'fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}',
                            '-q:v', '3', str(d / '%04d.jpg')], check=True)
        self.fs = sorted(d.glob('*.jpg')); self._c = {}

# ---- marker drawing ----------------------------------------------------------------------------------------------------
def catmull(pts, closed, n=10):
    out = []; m = len(pts)
    rng = range(m) if closed else range(m - 1)
    for i in rng:
        p0 = pts[(i - 1) % m] if closed or i > 0 else pts[0]; p1 = pts[i]; p2 = pts[(i + 1) % m]
        p3 = pts[(i + 2) % m] if closed or i + 2 < m else pts[-1]
        for k in range(n):
            u = k / n; u2 = u * u; u3 = u2 * u
            out.append(tuple(0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3) for j in (0, 1)))
    if not closed: out.append(pts[-1])
    return out

def marker(d, pts, r, rnd, closed=False, fill=None):
    """A thick ink line with uneven width (stamped dabs), the way a marker drags on paper."""
    path = catmull(pts, closed)
    if fill: d.polygon(path, fill=fill)
    if closed: path = path + path[:1]
    ph = rnd.uniform(0, 6.3); f = rnd.uniform(0.04, 0.08)
    dense = []
    for a, b in zip(path, path[1:]):
        steps = max(1, int(math.dist(a, b) / (r * 0.35)))
        dense += [(lerp(a[0], b[0], k / steps), lerp(a[1], b[1], k / steps)) for k in range(steps)]
    for i, (x, y) in enumerate(dense):
        rr = r * (1 + 0.2 * math.sin(i * f + ph) + 0.08 * math.sin(i * f * 3.7 + ph * 2))
        d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=INK_C)

def jit(pts, rnd, a=2.2): return [(x + rnd.uniform(-a, a), y + rnd.uniform(-a, a)) for x, y in pts]

def bird_sprite(phase, boil, seed):
    """A round little doodle bird facing right, drawn at 2x then halved. phase 0..1 is one wing beat."""
    rnd = random.Random(seed * 100 + boil); Z = 2
    im = Image.new('RGBA', (300 * Z, 260 * Z), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    o = (150 * Z, 140 * Z); P = lambda pts: [(o[0] + x * Z, o[1] + y * Z) for x, y in jit(pts, rnd)]
    lift = -math.cos(phase * 2 * math.pi)                        # +1 wings up, -1 wings down
    def wing(sx, sy, scale, fill):
        """A leaf-shaped wing hinged at the shoulder; it swings from up-and-back to down-and-back."""
        th = math.radians(203 + 52 * lift); L = 78 * scale * (0.78 + 0.22 * abs(lift)); w = 22 * scale
        leaf = [(0, 0), (0.3 * L, -w), (0.75 * L, -w * 0.75), (L, 0), (0.62 * L, w * 0.55), (0.22 * L, w * 0.6)]
        c, sn = math.cos(th), math.sin(th)
        pts = [(sx + x * c - y * sn, sy + x * sn + y * c) for x, y in leaf]
        marker(d, P(pts), 4.2 * Z, rnd, closed=True, fill=fill)
    wing(6, -36, 0.8, (226, 222, 212, 255))                     # far wing, a little behind
    for ty in (-12, 0, 12):                                       # three tail feathers
        marker(d, P([(-44, 4), (-74, 4 + ty * 1.6)]), 4.0 * Z, rnd)
    marker(d, P([(-50, 6), (-38, -24), (-6, -42), (34, -46), (62, -30), (70, -6), (60, 18), (30, 32), (-10, 32), (-40, 22)]),
           4.6 * Z, rnd, closed=True, fill=PAPER)
    cx, cy = o[0] + 46 * Z, o[1] - 4 * Z; d.ellipse((cx - 9 * Z, cy - 6 * Z, cx + 9 * Z, cy + 6 * Z), fill=(244, 172, 160, 255))
    d.polygon(P([(66, -24), (92, -15), (66, -6)]), fill=BUTTER)
    marker(d, P([(66, -24), (92, -15), (66, -6)]), 3.0 * Z, rnd, closed=True)
    ex, ey = o[0] + 50 * Z, o[1] - 22 * Z; d.ellipse((ex - 6 * Z, ey - 6 * Z, ex + 6 * Z, ey + 6 * Z), fill=INK_C)
    wing(-6, -30, 1.0, PAPER)                                     # near wing over the body
    return im.resize((im.width // Z, im.height // Z), Image.LANCZOS)

def gull_sprite(phase, boil, seed, col=INK_C):
    """A far-away 'm' bird, two arcs."""
    rnd = random.Random(seed * 77 + boil); Z = 2
    im = Image.new('RGBA', (120 * Z, 70 * Z), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    lift = -math.cos(phase * 2 * math.pi); y = -14 * lift
    pts = [(-42, 6 - y * 0.4), (-22, y - 6), (0, 4), (22, y - 6), (42, 6 - y * 0.4)]
    path = [(60 * Z + x * Z, 35 * Z + yy * Z) for x, yy in jit(pts, rnd, 1.6)]
    for a, b in zip(catmull(path, False), catmull(path, False)[1:]):
        d.line((a, b), fill=col, width=int(4.5 * Z))
        d.ellipse((a[0] - 2.2 * Z, a[1] - 2.2 * Z, a[0] + 2.2 * Z, a[1] + 2.2 * Z), fill=col)
    return im.resize((im.width // Z, im.height // Z), Image.LANCZOS)

PH = 12
BIRD = {s: [[bird_sprite(p / PH, b, s) for p in range(PH)] for b in range(3)] for s in range(3)}
GULL = [[gull_sprite(p / PH, b, 1) for p in range(PH)] for b in range(3)]

def frame_of(t, flap):
    return int((t * flap % 1) * PH) % PH, int(t * 8) % 3           # wing phase, boil (redrawn 8 times a second)

# ---- the flock -------------------------------------------------------------------------------------------------------
# kind, sprite seed, enter t, leave t, start (x, y), end (x, y), scale, flap Hz, bob px, extra
FLOCK = [
    ('bird', 0, 0.6, 6.4, (-160, 640), (1260, 520), 1.25, 3.2, 26, None),
    ('bird', 1, 0.9, 6.9, (-160, 900), (1260, 760), 0.95, 3.8, 20, None),
    ('bird', 2, 1.3, 6.2, (-160, 470), (1260, 330), 0.75, 4.2, 16, 'loop'),
    ('gull', 0, 0.7, 7.0, (-80, 380), (1180, 300), 0.9, 4.6, 10, None),
    ('gull', 0, 1.1, 7.2, (-80, 1160), (1180, 1040), 0.7, 5.0, 8, None),
    ('gull', 0, 1.6, 7.4, (-80, 280), (1180, 220), 0.55, 5.4, 6, None),
    # the other way round: over the clip first, then into the sunset (shrinking into the distance)
    ('bird', 1, 6.9, 10.6, (1240, 760), (560, 1010), (1.3, 0.22), 3.4, 24, None),
    ('bird', 0, 7.2, 10.4, (1240, 560), (470, 960), (1.0, 0.18), 3.9, 18, None),
    ('bird', 2, 7.5, 10.8, (-160, 640), (620, 990), (0.9, 0.16), 4.3, 16, None),
    ('gull', 0, 7.1, 10.5, (1160, 420), (520, 930), (0.9, 0.2), 4.8, 8, None),
    ('gull', 0, 7.6, 10.9, (-80, 520), (590, 950), (0.7, 0.18), 5.2, 6, None),
]
LOOP = (3.0, 4.4)                                                 # the bird that loops, and its dotted trail

def bird_at(b, t):
    kind, seed, t0, t1, a, z, sc, hz, bob, extra = b
    u = seg(t, t0, t1); x = lerp(a[0], z[0], u); y = lerp(a[1], z[1], u)
    s = lerp(sc[0], sc[1], ease(u) ** 0.8) if isinstance(sc, tuple) else sc
    y += bob * math.sin(t * hz * 2 * math.pi + seed)              # the body rides each wing beat
    rot = -math.degrees(math.atan2(z[1] - a[1], abs(z[0] - a[0]))) * 0.6
    if extra == 'loop' and LOOP[0] <= t <= LOOP[1]:
        k = ease(seg(t, *LOOP)); ang = k * 2 * math.pi; r = 120
        x += r * math.sin(ang); y += -r * (1 - math.cos(ang)); rot += math.degrees(ang)
    return x, y, s, rot, z[0] < a[0]

def trail(img, b, t):
    """The looping bird leaves a dotted marker line that fades after."""
    if not (LOOP[0] <= t <= LOOP[1] + 1.2): return
    d = ImageDraw.Draw(img); fade = 1 - seg(t, LOOP[1] + 0.4, LOOP[1] + 1.2)
    pts = [bird_at(b, tt)[:2] for tt in [LOOP[0] - 0.4 + k * 0.035 for k in range(int((min(t, LOOP[1] + 0.2) - LOOP[0] + 0.4) / 0.035))]]
    for i, (x, y) in enumerate(pts[:-3]):
        if i % 2: continue
        r = 5.5 + 1.2 * math.sin(i * 1.7)
        d.ellipse((x - 40 - r, y + 10 - r, x - 40 + r, y + 10 + r), fill=(255, 255, 255, int(235 * fade)))

def flock(img, t):
    for b in FLOCK:
        if not (b[2] <= t <= b[3]): continue
        x, y, s, rot, left = bird_at(b, t); s *= 1.35; ph, bo = frame_of(t, b[7])
        spr = (BIRD[b[1]] if b[0] == 'bird' else GULL)[bo][ph]
        if left: spr = ImageOps.mirror(spr); rot = -rot
        if b[9] == 'loop': trail(img, b, t)
        fade = min(seg(t, b[2], b[2] + 0.25), 1 - seg(t, b[3] - 0.5, b[3])) if isinstance(b[6], tuple) else 1
        put(img, spr, (x, y), s, rot, fade)

# ---- the day ---------------------------------------------------------------------------------------------------------
def setup():
    return {'a': Clip('IMG_1449', 1.0), 'b': Clip('IMG_1460', 1.0), 'c': Clip('IMG_1451', 1.0),
            'blue': Sky('12458041-hd_1080_1920_30fps', 3.0, 5.0), 'sun': Sky('17158574_1080_1920_60fps', 2.0, 5.0)}

def fade(x, y, u): return x if u <= 0 else y if u >= 1 else Image.blend(x, y, ease(u))

def frame(g, t):
    if t < 4.6:   im = fade(g['a'].at(t), g['blue'].at(t - 1.4), seg(t, 1.7, 2.7))
    elif t < 8.8: im = fade(g['blue'].at(t - 1.4), g['b'].at(t - 4.6), seg(t, 4.6, 5.6))
    else:         im = fade(g['b'].at(t - 4.6), g['sun'].at(t - 7.8), 1)
    if 7.8 <= t < 8.8: im = fade(g['b'].at(t - 4.6), g['sun'].at(t - 7.8), seg(t, 7.8, 8.8))
    if t >= 10.4: im = fade(g['sun'].at(t - 7.8), g['c'].at(t - 10.4), seg(t, 10.4, 11.4))
    im = im.convert('RGBA'); flock(im, t); return im

def main():
    g = setup(); OUT.mkdir(parents=True, exist_ok=True)
    if len(sys.argv) > 1:                                        # a still sheet of the times asked for
        ts = [float(a) for a in sys.argv[1:]]; th = [frame(g, t).convert('RGB').resize((270, 480)) for t in ts]
        sheet = Image.new('RGB', (270 * len(th), 480)); [sheet.paste(s, (270 * i, 0)) for i, s in enumerate(th)]
        sheet.save(OUT / '_sky-birds-sheet.jpg', quality=88); print(OUT / '_sky-birds-sheet.jpg'); return
    mp4 = OUT / 'sky-birds-test.mp4'
    p = subprocess.Popen([E.FFMPEG, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(mp4)],
                         stdin=subprocess.PIPE)
    for i in range(int(SECS * FPS)): p.stdin.write(frame(g, i / FPS).convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print(mp4)

if __name__ == '__main__':
    main()
