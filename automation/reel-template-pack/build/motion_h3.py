"""Rough motion test for h3 "Caught in our web" (Halloween pack), following Mercedes's round 4 notes
(halloween/notes-round4.md) and FRAMEWORK.md. The buyer's video stays full screen. A sharp, cute spider swings in
diagonally on its thread; built-in words are cut-out paper letters hanging on silk (fun lettering, not plain white
type). Then the spider spins one straight line at a time, running along it as it lays the silk; the first line ends
on the top-right point of the final web; at each line's end a round video bubble slides out and its label pops in at
the other end (earlier points stay, dimmed). Last, the spider spins the scalloped rings BETWEEN the same lines (so
everything lines up), we zoom out to the whole web holding every point, and the CTA: Comment WEB.
Usage: python build/motion_h3.py  ->  halloween/h3-caught-in-our-web/preview/motion-test.mp4
"""
import math, random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import storyboard_halloween as B

W, H, FPS, END = 1080, 1920, 30, 15.0
OUT = E.PACK / 'halloween' / 'h3-caught-in-our-web' / 'preview'; OUT.mkdir(parents=True, exist_ok=True)
TMP = OUT / '_frames'; TMP.mkdir(exist_ok=True)
SILK, INK, ORANGE = (250, 250, 252), (22, 20, 24), (236, 120, 36)
BOLD, SERIF = 'C:/Windows/Fonts/arialbd.ttf', B.SERIF
CLIPS = {'bg': ('IMG_1439', 1.0), 'p1': ('IMG_1385', 0.5), 'p2': ('IMG_1447', 0.3), 'p3': ('IMG_1460', 1.0), 'p4': ('IMG_1439', 5.0)}

def extract(key, secs=6.0):
    name, t0 = CLIPS[key]; d = TMP / key; d.mkdir(exist_ok=True)
    if not any(d.glob('*.jpg')):
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t0), '-t', str(secs), '-i', str(E.FOOTAGE / f'{name}.MOV'),
                        '-vf', f'{B.S.TONE},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}',
                        '-q:v', '3', str(d / '%04d.jpg')], check=True)
    return sorted(d.glob('*.jpg'))
FR = {k: extract(k) for k in CLIPS}
def vid(key, t):
    fs = FR[key]; return Image.open(fs[int(t * FPS) % len(fs)]).convert('RGBA')

def clamp(x): return max(0.0, min(1.0, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def back_out(x, s=1.9): x = clamp(x) - 1; return 1 + x * x * ((s + 1) * x + s)

spider = B.cutout(B.cut_white(B.src('Cute Fuzzy Pom-Pom Spider Craft-2.png')), 760, 0, 90)   # big source: never upscaled
_cache = {}
def sized(im, w, key):
    k = (key, int(w))
    if k not in _cache: _cache[k] = B.fit_w(im, max(8, int(w)))
    return _cache[k]
def put(img, item, c, w=None, rot=0, key='x', alpha=1.0):
    it = sized(item, w, key) if w else item
    if rot: it = it.rotate(rot, expand=True, resample=Image.BICUBIC)
    if alpha < 1: it = it.copy(); it.putalpha(it.split()[3].point(lambda v: int(v * alpha)))
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def silk(img, pts, width=6, alpha=255):
    """A strand of silk with a faint dark edge so it reads over any video."""
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    d.line(pts, fill=(20, 16, 24, int(alpha * 0.75)), width=width + 5, joint='curve')
    d.line(pts, fill=SILK + (alpha,), width=width, joint='curve'); img.alpha_composite(lay)

# ---- cut-out letters (built-in words: fun artwork lettering) --------------------------------------------------------------
PAPERS = [((250, 246, 236), INK, SERIF), (INK, (250, 246, 236), BOLD), ((236, 120, 36), INK, BOLD), ((250, 246, 236), INK, BOLD),
          (INK, (236, 120, 36), SERIF), ((206, 214, 222), INK, SERIF)]
def scrap(ch, i, px=150):
    """One letter cut from a magazine: its own paper colour and font, a ragged edge, a slight shadow."""
    bg, fg, font = PAPERS[i % len(PAPERS)]; r = random.Random(i * 7 + ord(ch))
    f = B.F(font, px); w = int(px * 0.95); h = int(px * 1.2)
    im = Image.new('RGBA', (w + 40, h + 40), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    pts = [(20 + r.randint(-6, 6), 20 + r.randint(-6, 6)), (20 + w + r.randint(-6, 6), 20 + r.randint(-6, 6)),
           (20 + w + r.randint(-6, 6), 20 + h + r.randint(-6, 6)), (20 + r.randint(-6, 6), 20 + h + r.randint(-6, 6))]
    d.polygon(pts, fill=bg + (255,)); d.text((20 + w / 2, 20 + h / 2), ch, font=f, fill=fg + (255,), anchor='mm')
    return E.C.shadow(im, offset=(4, 8), blur=8, alpha=80)
def hanging_word(img, t, t0, word, y, px=150, top=0, gone=None, cx0=495, step=None):
    """Letters drop one by one on their own silk threads, bounce, and keep swinging a little."""
    sc = [scrap(ch, i, px) for i, ch in enumerate(word)]; step = step or px * 0.97   # left of Instagram's buttons
    for i, s in enumerate(sc):
        ti = t - t0 - i * 0.09; cx = cx0 + (i - (len(word) - 1) / 2) * step
        if ti < 0: continue
        drop = 1 - back_out(ti / 0.35, 2.2); lift = ease((t - gone) / 0.35) if gone and t > gone else 0
        cy = y - drop * 1100 - lift * 1400
        rot = 7 * math.sin(ti * 5 + i) * math.exp(-ti * 0.8) + (2 if i % 2 else -2)
        silk(img, [(cx, top), (cx, cy - s.height / 2 + 30)], 3, 220)
        put(img, s, (cx, cy), rot=rot)

def label(img, xy, text, px=78, alpha=1.0):
    """Editable labels: Arial Bold in ink with a silk-white edge (a font every buyer has; not plain white)."""
    f = B.F(BOLD, px); w = ImageDraw.Draw(img).textlength(text, font=f)
    x = min(max(xy[0], w / 2 + 70), 940 - w / 2); y = min(max(xy[1], 300), 1460)
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(lay).text((x, y), text, font=f, fill=INK + (255,), anchor='mm',
                                                                         stroke_width=max(5, px // 11), stroke_fill=SILK + (255,))
    if alpha < 1: lay.putalpha(lay.split()[3].point(lambda v: int(v * alpha)))
    img.alpha_composite(lay)

# ---- the web: four straight lines through one centre; the first ends top right -------------------------------------------
C = (540, 860)
LINES = [(-50, 'THE GLOW', 'p1', 420), (-130, 'THE SCENT', 'p2', 420), (90, 'THE PRICE', 'p3', 470), (12, 'THE GIFT BOX', 'p4', 340)]
SPOKES = sorted([a % 360 for a, *_ in LINES] + [(a + 180) % 360 for a, *_ in LINES])
def pt(a, r, z=1.0, c=C): t = math.radians(a); return (c[0] + r * z * math.cos(t), c[1] + r * z * math.sin(t))
def line_ends(a): return pt(a, 1400), pt(a + 180, 1400)
T_LINE = [2.4, 4.6, 6.8, 9.0]; DUR = 2.2

def spider_at(img, xy, rot=0, w=360): put(img, spider, xy, w, rot, key='sp')

def bubble(img, key, t, xy, d, alpha=1.0, k=1.0):
    if k <= 0.02: return
    dd = max(8, int(d * k)); v = B.disc(vid(key, t), dd)
    pad = 18; ring = Image.new('RGBA', (dd + 2 * pad, dd + 2 * pad), (0, 0, 0, 0)); rd = ImageDraw.Draw(ring)
    ring.alpha_composite(v, (pad, pad))
    for j, (a0, a1, off) in enumerate(((200, 330, 4), (10, 140, 9), (120, 250, 2), (300, 420, 12))):   # wrapped in silk
        rd.arc((pad - off, pad - off, pad + dd + off, pad + dd + off), a0, a1, fill=SILK + (230,), width=3)
    put(img, E.C.shadow(ring, (6, 12), 14, 90), xy, alpha=alpha)

def rings(img, upto, z=1.0, c=C, alpha=230):
    """Scalloped rings spun between the spokes, from the centre out; `upto` = how many segments are done so far."""
    radii = [110, 200, 300, 410, 530]; n = 0; segs = []
    for r in radii:
        for a, b in zip(SPOKES, SPOKES[1:] + [SPOKES[0] + 360]):
            p, q = pt(a, r, z, c), pt(b, r, z, c); mid = (a + b) / 2; m = pt(mid, r * 0.84, z, c)
            segs.append([((1 - s) ** 2 * p[0] + 2 * (1 - s) * s * m[0] + s * s * q[0], (1 - s) ** 2 * p[1] + 2 * (1 - s) * s * m[1] + s * s * q[1])
                         for s in [i / 8 for i in range(9)]])
    for sgm in segs[:int(upto)]: silk(img, sgm, 3, alpha)
    return len(segs)

def frame(t):
    im = vid('bg', t)
    # 0.0-2.4 the spider swings in diagonally on its thread from the top left; CAUGHT drops in letter by letter
    if t < 2.4:
        A = (60, -80); L = 980
        th = math.radians(-70 * math.exp(-t * 2.2) * math.cos(t * 4.2) - 8) if t < 1.8 else math.radians(-8)
        sp = (A[0] + L * math.sin(-th) + 330, A[1] + L * math.cos(th))
        if t > 1.8:   # it climbs off its thread to the centre, where the web will be
            u = ease((t - 1.8) / 0.6); sp = (sp[0] + (C[0] - sp[0]) * u, sp[1] + (C[1] - sp[1]) * u)
        silk(im, [(A[0] + 330, A[1]), sp], 4)
        spider_at(im, sp, math.degrees(th) * 0.6, 520 - 160 * ease((t - 1.8) / 0.6))
        label(im, (W / 2, 1060), "you're about to get", 92) if t > 0.35 and t < 2.0 else None
        hanging_word(im, t, 0.5, 'CAUGHT', 1240, 150, 0, gone=1.75)
    # 2.4-11.2 one straight line at a time; the spider runs out along it laying silk, a video bubble slides out at its end
    elif t < 11.2:
        k = min(3, int((t - 2.4) // DUR)); lt = t - T_LINE[k]
        for j in range(k):   # earlier lines and points stay, dimmed
            a, word, key, r = LINES[j]; silk(im, list(line_ends(a)), 4, 170)
            bubble(im, key, t, pt(a, r), 250, 0.55)
        a, word, key, r = LINES[k]; far, back = line_ends(a)
        u = ease(lt / 0.8)                                       # the spider runs from the far side, across the centre, to the end
        p0, p1 = pt(a + 180, 700), pt(a, r)
        sp = (p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u)
        silk(im, [p0 if lt < 0.8 else back, sp if lt < 0.8 else far], 5)
        if lt > 0.8: silk(im, [back, far], 5)
        kb = back_out((lt - 0.75) / 0.4)
        if lt > 0.75:   # the bubble slides out along the line to its end
            s = ease((lt - 0.75) / 0.5); bp = pt(a, r * (0.55 + 0.45 * s)); bubble(im, key, t, bp, 330, 1.0, kb)
        if lt > 1.0:
            kl = back_out((lt - 1.0) / 0.3); label(im, pt(a + 180, 380), word, int(78 * max(0.3, kl)))
        if lt < 0.8: spider_at(im, sp, 25 * math.sin(lt * 18))
        else:
            v = ease((lt - 1.3) / 0.6); spider_at(im, (p1[0] + (C[0] - p1[0]) * v, p1[1] + (C[1] - p1[1]) * v), 25 * math.sin(lt * 18))
    # 11.2-13.0 the rings are spun between the same lines; we zoom out to the whole web
    elif t < 13.0:
        u = (t - 11.2) / 1.8; z = 1.0 - 0.25 * ease((u - 0.5) / 0.5); c = (540, 860 - 120 * ease((u - 0.5) / 0.5))
        for a, *_ in LINES: silk(im, [pt(a, 1400, z, c), pt(a + 180, 1400, z, c)], 4, 220)
        n = rings(im, 0, z, c); rings(im, n * ease(u / 0.6), z, c)
        for a, word, key, r in LINES: bubble(im, key, t, pt(a, r, z, c), int(300 * z))
        ang = u * 6 * math.pi; rr = 60 + 470 * ease(u / 0.6)
        spider_at(im, pt(math.degrees(ang), rr * z, 1, c) if u < 0.6 else c, 0, 320)
    # 13.0-15.0 CTA: the whole web holds every point; Comment WEB
    else:
        z, c = 0.75, (540, 740)
        for a, *_ in LINES: silk(im, [pt(a, 1400, z, c), pt(a + 180, 1400, z, c)], 4, 220)
        rings(im, 999, z, c)
        for a, word, key, r in LINES: bubble(im, key, t, pt(a, r, z, c), 225)
        spider_at(im, (c[0], c[1] + 6 * math.sin(t * 6)), 0, 300)
        hanging_word(im, t, 13.05, 'COMMENT', 1230, 112, 1130, cx0=520)
        kw = back_out((t - 13.6) / 0.3)
        if t > 13.6: label(im, (W / 2, 1405), 'WEB', int(130 * max(0.3, kw)))
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
