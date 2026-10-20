"""h3 Caught in our web (Halloween pack), liked 2026-10-17 as the motion test build/motion_h3.py ("super cute and fun")
and checked in her CapCut. FULLY EDITABLE build (2026-10-20, build/editable.py), same beats and timings:
the buyer's clip 1 stays full screen; a spider swings in diagonally on its thread; CAUGHT drops in as cut-out letters
on silk; the spider spins four straight lines one at a time, running along each, and a round video bubble (clips 2
to 5, CapCut circle mask) slides out to each line's end with its label; then the rings are spun between the same
lines, we zoom out to the whole web, and "Comment WEB".
Editable: every word is CapCut text. The cut-out letters of CAUGHT and COMMENT are one text layer per letter on
CapCut's text background (the paper scrap): Bodoni Moda or Montserrat, each letter its own paper colour, so a buyer
can change any letter's font, colour and paper; "you're about to get", the four [Point N] labels and [WEB] are
Montserrat in ink with a silk-white outline.
CapCut limits: the silk (the swinging thread, the letters' threads, the four lines, the rings, the bubbles' wraps)
is drawn as white pictures, so it can't take a colour from the text panel (white has no hue for Adjust > HSL; use
Adjust > Brightness, or a colour filter on the layer); a line growing behind the spider is one picture scaling out
from its start, so it thickens as it grows (in the motion test it was drawn at full width); the rings appear one
whole ring at a time (the motion test spun them segment by segment); the cut-out letters have straight paper edges
(CapCut's text background) where the artwork had torn ones.
No stage colour: the buyer's clip fills the screen from start to end, so the background colour never shows."""
import math
from PIL import Image, ImageDraw
from engine import W, H, wiggle
import editable as Ed
from editable import at
from editable_halloween import kf, popk
import motion_h3 as M

SPEC = dict(num='h3', title='Caught in our web', subtitle='15 seconds. One clip of your product, then four short detail clips.',
            font='bodoni', dir='halloween/h3-caught-in-our-web', folder='Template h3 - Caught in our web',
            project='h3 Caught in our web', cover_at=1.4,
            slots=[('Your product, held up', 'Against a plain wall, upright, the whole time'),
                   ('Point 1', 'A close-up that shows your first reason'),
                   ('Point 2', 'Another detail: texture, scent, colour'),
                   ('Point 3', 'The price tag, or it in use'),
                   ('Point 4', 'The packaging or a happy customer')],
            test_clips=[('IMG_1439', 1.0), ('IMG_1385', 0.5), ('IMG_1447', 0.3), ('IMG_1460', 1.0), ('IMG_1439', 5.0)])
END = M.END
INK, SILK = M.INK, M.SILK
STAGE = INK
CREAM, ORANGE, GREY = (250, 246, 236), (236, 120, 36), (206, 214, 222)
# the cut-out papers of motion_h3.PAPERS: (paper, letter, font)
PAPERS = [(CREAM, INK, 'bodoni'), (INK, CREAM, 'montserrat'), (ORANGE, INK, 'montserrat'), (CREAM, INK, 'montserrat'),
          (INK, ORANGE, 'bodoni'), (GREY, INK, 'bodoni')]

def silk_bar(length, width=5, alpha=255):
    """A straight strand of silk, horizontal, with a faint dark edge so it reads over any video."""
    im = Image.new('RGBA', (int(length) + 12, width + 12), (0, 0, 0, 0)); d = ImageDraw.Draw(im); y = im.height / 2
    d.line((6, y, length + 6, y), fill=(20, 16, 24, int(alpha * 0.75)), width=width + 5)
    d.line((6, y, length + 6, y), fill=SILK + (alpha,), width=width); return im

def silk_vert(length, width=3, alpha=220):
    return silk_bar(length, width, alpha).rotate(90, expand=True)

def ring_img(r, z_pad=20):
    """One scalloped ring of the web (between the eight spokes), drawn at web scale 1 round the web's centre."""
    size = 2 * (r + z_pad); im = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    c = (size / 2, size / 2)
    def p(a, rr): t = math.radians(a); return (c[0] + rr * math.cos(t), c[1] + rr * math.sin(t))
    lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for a, b in zip(M.SPOKES, M.SPOKES[1:] + [M.SPOKES[0] + 360]):
        q0, q1, m = p(a, r), p(b, r), p((a + b) / 2, r * 0.84)
        pts = [((1 - s) ** 2 * q0[0] + 2 * (1 - s) * s * m[0] + s * s * q1[0], (1 - s) ** 2 * q0[1] + 2 * (1 - s) * s * m[1] + s * s * q1[1])
               for s in [i / 8 for i in range(9)]]
        d.line(pts, fill=(20, 16, 24, 165), width=8, joint='curve'); d.line(pts, fill=SILK + (220,), width=3, joint='curve')
    return lay

def web_at(ts):
    """The web's centre and zoom: still until 11.2, then the zoom-out to the whole web (motion_h3)."""
    u = (ts - 11.2) / 1.8; e = M.ease((u - 0.5) / 0.5)
    if ts >= 13.0: return (540, 740), 0.75
    return (540, 860 - 120 * e), 1.0 - 0.25 * e

def reel():
    r = Ed.Reel([], END)
    r.clip(0, 0, END, 2, Ed.still(540, 960))
    sp_img = M.sized(M.spider, 520, 'sp520')

    # ===== 1 the spider swings in diagonally on its thread (0 to 2.4) =====
    A = (60 + 330, -80); L = 980
    def swing(t):
        th = math.radians(-70 * math.exp(-t * 2.2) * math.cos(t * 4.2) - 8) if t < 1.8 else math.radians(-8)
        sp = (60 + L * math.sin(-th) + 330, -80 + L * math.cos(th))
        if t > 1.8:
            u = M.ease((t - 1.8) / 0.6); sp = (sp[0] + (M.C[0] - sp[0]) * u, sp[1] + (M.C[1] - sp[1]) * u)
        return sp, math.degrees(th)
    def spider_f(ts):
        (x, y), a = swing(ts); return at(x, y, 1.0 - 0.31 * M.ease((ts - 1.8) / 0.6), a * 0.6)
    r.art('spider-swing', sp_img, 0, 2.4, 30, spider_f)
    def thread_f(ts):
        (x, y), a = swing(min(ts, 1.8)); return at((A[0] + x) / 2, (A[1] + y) / 2, 1.0, -a)
    r.art('thread-swing', silk_vert(L, 4, 255), 0, 1.8, 29, thread_f)
    r.plain("you're about to get", 92, 0.1, 2.3, kf((540, 1060), 0.1, scale=popk(0, 1.15)), INK, SILK)

    # cut-out letters on silk: each letter is a text layer on its own paper (text background); its thread is a picture
    def hanging(word, t0, y, px, cx0, gone, name):
        step = px * 0.97
        for i, ch in enumerate(word):
            paper, fg, font = PAPERS[i % len(PAPERS)]; cx = cx0 + (i - (len(word) - 1) / 2) * step; ti = t0 + i * 0.09
            k = {'y': [(0, y - 1100), (0.2, y + 40), (0.3, y - 12), (0.38, y)], 'rot': wiggle(0.4, 4, 2.5, 1.1)}
            if gone: k['y'] += [(gone - ti, y), (gone - ti + 0.35, y - 1500)]
            b = (gone + 0.4) if gone else None
            f = kf((cx, y), ti, (2 if i % 2 else -2), **k)
            top = int(y - px * 0.62)
            r.art(f'{name}-thread{i}', silk_vert(top + 40), ti, b, 40 + i, Ed.child(f, (0, -px * 0.62 - (top + 40) / 2 + 20)))
            r.text(font, px * (0.95 if font == 'bodoni' else 0.8), (ch, ch), ti, b, f, fg, box=(paper, 0.0))
    hanging('CAUGHT', 0.2, 1240, 150, 495, 2.05, 'caught')   # fully readable 1.2 s+

    # ===== 2 four straight lines, one at a time; a bubble slides out at each end (2.4 to 11.2) =====
    for k, (a, word, key, rr) in enumerate(M.LINES):
        t0 = M.T_LINE[k]; p0, p1 = M.pt(a + 180, 700), M.pt(a, rr); Lg = math.dist(p0, p1)
        def grow(ts, p0=p0, p1=p1, t0=t0, a=a):   # the strand grows behind the running spider (0.8 s)
            u = max(0.02, M.ease((ts - t0) / 0.8)); sp = (p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u)
            return at((p0[0] + sp[0]) / 2, (p0[1] + sp[1]) / 2, u, a)
        r.art(f'line{k}-grow', silk_bar(Lg), t0, t0 + 0.8, 20 + k, grow)
        def full(ts, a=a):
            c, z = web_at(ts); return at(c[0], c[1], z, a)
        r.art(f'line{k}', silk_bar(2800), t0 + 0.8, None, 20 + k, full)
        sk = {'x': [(0, p0[0]), (0.8, p1[0]), (1.3, p1[0]), (1.9, M.C[0])], 'y': [(0, p0[1]), (0.8, p1[1]), (1.3, p1[1]), (1.9, M.C[1])],
              'rot': wiggle(0, 2.2, 22, 0.35)}
        r.art(f'spider-line{k}', M.sized(M.spider, 360, 'sp360'), t0, t0 + 2.2, 70, kf(p0, t0, **sk))
        # the bubble: clip k+1 in a circle, sliding out along the line; later it shrinks a little (earlier points de-emphasised)
        d = 330; b0 = M.pt(a, rr * 0.55)
        bk = {'x': [(0, b0[0]), (0.5, p1[0])], 'y': [(0, b0[1]), (0.5, p1[1])], 'scale': [(0, 0.0), (0.25, 1.12), (0.4, 1.0)]}
        nxt = M.T_LINE[k + 1] if k < 3 else 11.2
        bk['scale'] += [(nxt - t0 - 0.75, 1.0), (nxt - t0 - 0.5, 0.76)]
        # the final zoom-out: every bubble moves to its spot on the smaller web (settles 0.75 at centre 740)
        z1, c1 = 0.75, (540, 740); fp = M.pt(a, rr, z1, c1); tz0, tz1 = 12.1 - t0 - 0.75, 13.0 - t0 - 0.75
        bk['x'] += [(tz0, p1[0]), (tz1, fp[0])]; bk['y'] += [(tz0, p1[1]), (tz1, fp[1])]; bk['scale'] += [(tz0, 0.9), (tz1, 225 / d)]
        bf = kf(b0, t0 + 0.75, **bk)
        r.clip(k + 1, t0 + 0.75, None, 10 + k, bf, size=(d, d), mask='circle')
        ring = Image.new('RGBA', (d + 40, d + 40), (0, 0, 0, 0)); rd = ImageDraw.Draw(ring)
        for (a0, a1, off) in ((200, 330, 4), (10, 140, 9), (120, 250, 2), (300, 420, 12)):
            rd.arc((20 - off, 20 - off, 20 + d + off, 20 + d + off), a0, a1, fill=SILK + (230,), width=4)
        r.art(f'bubble-silk{k}', ring, t0 + 0.75, None, 15 + k, bf)
        lab = M.pt(a + 180, 380); w = M.B.F(M.BOLD, 78).getlength(word)
        lab = (min(max(lab[0], w / 2 + 70), 940 - w / 2), min(max(lab[1], 300), 1460))
        r.plain(f'[Point {k + 1}]', 78, t0 + 0.8, nxt, kf(lab, t0 + 0.8, scale=popk(0, 1.15)), INK, SILK, test=word)

    # ===== 3 the rings are spun between the same lines, and we zoom out to the whole web (11.2 to 13.0) =====
    for i, rad in enumerate([110, 200, 300, 410, 530]):
        tr = 11.2 + 1.08 * (i + 0.6) / 5
        def ring_f(ts, tr=tr):
            c, z = web_at(ts); k = Ed.back_out(Ed.seg(ts, tr, tr + 0.25), 1.6) if ts >= tr else 0.0
            return at(c[0], c[1], z * k)
        r.art(f'ring{i}', ring_img(rad), tr, None, 25 + i, ring_f)
    spk = {'x': [], 'y': []}
    for j in range(31):
        t = 11.2 + 1.8 * j / 30; u = (t - 11.2) / 1.8; ang = u * 6 * math.pi; rad = 60 + 470 * M.ease(u / 0.6)
        c, z = web_at(t); p = M.pt(math.degrees(ang), rad * z, 1, c) if u < 0.6 else c
        spk['x'].append((t - 11.2, p[0])); spk['y'].append((t - 11.2, p[1]))
    spk['y'] += [(1.8 + i * 0.25, 740 + (6 if i % 2 else -6)) for i in range(9)]
    r.art('spider-web', M.sized(M.spider, 320, 'sp320'), 11.2, None, 70, kf((540, 860), 11.2, **spk))

    # ===== 4 CTA: Comment WEB (13.0 to 15.0) =====
    hanging('COMMENT', 12.8, 1230, 112, 520, None, 'comment')
    r.plain('[WEB]', 130, 13.6, None, kf((540, 1405), 13.6, scale=popk(0, 1.2)), INK, SILK)
    return r

def layers():
    return reel().L
