"""h3 Caught in our web (Halloween pack), liked 2026-10-17 as the motion test build/motion_h3.py ("super cute and fun").
Same beats, built for CapCut: the buyer's clip 1 stays full screen; a spider swings in diagonally on its thread;
CAUGHT drops in as cut-out letters on silk; the spider spins four straight lines one at a time, running along each,
and a round video bubble (clips 2 to 5, CapCut circle mask) slides out to each line's end with its label; then the
rings are spun between the same lines, we zoom out to the whole web, and "Comment WEB".
Built-in words (CAUGHT, COMMENT) are artwork lettering; the labels and the keyword are editable Arial Bold."""
import math
from PIL import Image, ImageDraw
from engine import Layers, PX_PER_SIZE, W, H, wiggle, pop
import motion_h3 as M

SPEC = dict(num='h3', title='Caught in our web', subtitle='15 seconds. One clip of your product, then four short detail clips.',
            font='bodoni', dir='halloween/h3-caught-in-our-web', folder='Template h3 - Caught in our web',
            project='Scrolly h3 Caught in our web', cover_at=1.4,
            slots=[('Your product, held up', 'Against a plain wall, upright, the whole time'),
                   ('Point 1', 'A close-up that shows your first reason'),
                   ('Point 2', 'Another detail: texture, scent, colour'),
                   ('Point 3', 'The price tag, or it in use'),
                   ('Point 4', 'The packaging or a happy customer')],
            test_clips=[('IMG_1439', 1.0), ('IMG_1385', 0.5), ('IMG_1447', 0.3), ('IMG_1460', 1.0), ('IMG_1439', 5.0)])
END = M.END
INK, SILK = M.INK, M.SILK
def sz(px): return round(px / PX_PER_SIZE, 2)
STROKE = (SILK, 0.12)

def layer_of(draw_fn):
    """Draw onto a blank frame, then crop to what was drawn; returns (image, centre)."""
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); draw_fn(im); bb = im.getbbox() or (0, 0, 2, 2)
    return im.crop(bb), ((bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2)

def samples(t0, t1, step=0.1):
    n = max(1, int(round((t1 - t0) / step))); return [t0 + (t1 - t0) * i / n for i in range(n + 1)]

def layers():
    g = Layers()
    g.clip(0, (0, END), 2, (540, 960), (W, H), src=0.0, speed=1.0)
    sp_img = M.sized(M.spider, 520, 'sp520')

    # ===== 1 the spider swings in diagonally on its thread (0 to 2.4) =====
    A = (60 + 330, -80); L = 980
    def swing(t):
        th = math.radians(-70 * math.exp(-t * 2.2) * math.cos(t * 4.2) - 8) if t < 1.8 else math.radians(-8)
        sp = (60 + L * math.sin(-th) + 330, -80 + L * math.cos(th))
        if t > 1.8:
            u = M.ease((t - 1.8) / 0.6); sp = (sp[0] + (M.C[0] - sp[0]) * u, sp[1] + (M.C[1] - sp[1]) * u)
        return sp, math.degrees(th)
    ts = samples(0, 2.4, 0.05)
    kf = {'x': [], 'y': [], 'rot': [], 'scale': []}
    for t in ts:
        (x, y), a = swing(t); kf['x'].append((t, x)); kf['y'].append((t, y)); kf['rot'].append((t, a * 0.6))
        kf['scale'].append((t, 1.0 - 0.31 * M.ease((t - 1.8) / 0.6)))
    g.art('spider-swing', sp_img, (0, 2.4), 30, swing(0)[0], kf)
    thread = Image.new('RGBA', (16, L), (0, 0, 0, 0)); M.silk(thread, [(8, 0), (8, L)], 4)
    tk = {'x': [], 'y': [], 'rot': []}
    for t in samples(0, 1.8, 0.05):
        (x, y), a = swing(t); tk['x'].append((t, (A[0] + x) / 2)); tk['y'].append((t, (A[1] + y) / 2)); tk['rot'].append((t, -a))
    g.art('thread-swing', thread, (0, 1.8), 29, ((A[0] + swing(0)[0][0]) / 2, (A[1] + swing(0)[0][1]) / 2), tk)
    g.text('arialbd', sz(92), ("you're about to get", "you're about to get"), (0.1, 2.3), 60, (540, 1060), 0, {'scale': pop(0, 1.15)},
           color=INK, stroke=STROKE)

    # cut-out letters on silk: each letter and its thread are one picture, so they drop and lift together
    def hanging(word, t0, y, px, cx0, gone, z0, name):
        step = px * 0.97
        for i, ch in enumerate(word):
            s = M.scrap(ch, i, px); cx = cx0 + (i - (len(word) - 1) / 2) * step
            top_len = int(y - s.height / 2 + 30)
            im = Image.new('RGBA', (s.width, top_len + s.height), (0, 0, 0, 0))
            M.silk(im, [(s.width / 2, 0), (s.width / 2, top_len + 10)], 3, 220); im.alpha_composite(s, (0, top_len))
            c = (cx, im.height / 2); ti = t0 + i * 0.09
            k = {'y': [(0, c[1] - 1100), (0.2, c[1] + 40), (0.3, c[1] - 12), (0.38, c[1])], 'rot': wiggle(0.4, 4, 2.5, 1.1)}
            if gone: k['y'] += [(gone - ti, c[1]), (gone - ti + 0.35, c[1] - 1500)]
            g.art(f'{name}-{i}', im, (ti, (gone + 0.4) if gone else END), z0 + i, c, k)
    hanging('CAUGHT', 0.2, 1240, 150, 495, 2.05, 40, 'caught')   # fully readable 1.2 s+

    # ===== 2 four straight lines, one at a time; a bubble slides out at each end (2.4 to 11.2) =====
    for k, (a, word, key, r) in enumerate(M.LINES):
        t0 = M.T_LINE[k]; far, back = M.line_ends(a); p0, p1 = M.pt(a + 180, 700), M.pt(a, r)
        frames = []
        for f in range(12):   # the line grows behind the running spider (a flipbook, 0.8 s)
            u = M.ease((f + 1) / 12); sp = (p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u)
            img, c = layer_of(lambda im: M.silk(im, [p0, sp], 5)); frames += [(img, c), (img, c)]
        g.flip(f'line{k}-grow', frames, t0, 20 + k)
        full, fc = layer_of(lambda im: M.silk(im, [back, far], 5))
        g.art(f'line{k}', full, (t0 + 0.8, 11.2), 20 + k, fc)
        sk = {'x': [(0, p0[0]), (0.8, p1[0]), (1.3, p1[0]), (1.9, M.C[0])], 'y': [(0, p0[1]), (0.8, p1[1]), (1.3, p1[1]), (1.9, M.C[1])],
              'rot': wiggle(0, 2.2, 22, 0.35)}
        g.art(f'spider-line{k}', M.sized(M.spider, 360, 'sp360'), (t0, t0 + 2.2), 70, p0, sk)
        # the bubble: clip k+1 in a circle, sliding out along the line; later it shrinks a little (earlier points de-emphasised)
        d = 330; b0 = M.pt(a, r * 0.55)
        bk = {'x': [(0, b0[0]), (0.5, p1[0])], 'y': [(0, b0[1]), (0.5, p1[1])], 'scale': [(0, 0.0), (0.25, 1.12), (0.4, 1.0)]}
        nxt = M.T_LINE[k + 1] if k < 3 else 11.2
        bk['scale'] += [(nxt - t0 - 0.75, 1.0), (nxt - t0 - 0.5, 0.76)]
        # the final zoom-out: every bubble moves to its spot on the smaller web (11.2 to 13.0, settles 0.75 at centre 740)
        z1, c1 = 0.75, (540, 740); fp = M.pt(a, r, z1, c1); tz0, tz1 = 12.1 - t0 - 0.75, 13.0 - t0 - 0.75
        bk['x'] += [(tz0, p1[0]), (tz1, fp[0])]; bk['y'] += [(tz0, p1[1]), (tz1, fp[1])]; bk['scale'] += [(tz0, 0.9), (tz1, 225 / d)]
        g.clip(k + 1, (t0 + 0.75, END), 10 + k, b0, (d, d), 0, bk, src=0.0, speed=1.0, mask='circle')
        ring = Image.new('RGBA', (d + 40, d + 40), (0, 0, 0, 0)); rd = ImageDraw.Draw(ring)
        for (a0, a1, off) in ((200, 330, 4), (10, 140, 9), (120, 250, 2), (300, 420, 12)):
            rd.arc((20 - off, 20 - off, 20 + d + off, 20 + d + off), a0, a1, fill=SILK + (230,), width=4)
        g.art(f'bubble-silk{k}', ring, (t0 + 0.75, END), 15 + k, b0, bk)
        lab = M.pt(a + 180, 380); w = M.B.F(M.BOLD, 78).getlength(word)
        lab = (min(max(lab[0], w / 2 + 70), 940 - w / 2), min(max(lab[1], 300), 1460))
        g.text('arialbd', sz(78), (f'[Point {k + 1}]', word), (t0 + 0.8, nxt), 61 + k, lab, 0, {'scale': pop(0, 1.15)}, color=INK, stroke=STROKE)

    # ===== 3 the rings are spun between the same lines, and we zoom out to the whole web (11.2 to 13.0) =====
    frames = []
    for f in range(27):
        t = 11.2 + f * 2 / 30; u = (t - 11.2) / 1.8
        z = 1.0 - 0.25 * M.ease((u - 0.5) / 0.5); c = (540, 860 - 120 * M.ease((u - 0.5) / 0.5))
        def web(im):
            for a, *_ in M.LINES: M.silk(im, [M.pt(a, 1400, z, c), M.pt(a + 180, 1400, z, c)], 4, 220)
            n = M.rings(im, 0, z, c); M.rings(im, n * M.ease(u / 0.6), z, c)
        img, cc = layer_of(web); frames += [(img, cc), (img, cc)]
    g.flip('web-spin', frames, 11.2, 20)
    def final(im):
        for a, *_ in M.LINES: M.silk(im, [M.pt(a, 1400, 0.75, (540, 740)), M.pt(a + 180, 1400, 0.75, (540, 740))], 4, 220)
        M.rings(im, 999, 0.75, (540, 740))
    img, cc = layer_of(final); g.art('web', img, (13.0, END), 20, cc)
    spk = {'x': [], 'y': []}
    for t in samples(11.2, 13.0, 0.06):
        u = (t - 11.2) / 1.8; ang = u * 6 * math.pi; rr = 60 + 470 * M.ease(u / 0.6)
        z = 1.0 - 0.25 * M.ease((u - 0.5) / 0.5); c = (540, 860 - 120 * M.ease((u - 0.5) / 0.5))
        p = M.pt(math.degrees(ang), rr * z, 1, c) if u < 0.6 else c
        spk['x'].append((t - 11.2, p[0])); spk['y'].append((t - 11.2, p[1]))
    spk['y'] += [(1.8 + i * 0.25, 740 + (6 if i % 2 else -6)) for i in range(9)]
    g.art('spider-web', M.sized(M.spider, 320, 'sp320'), (11.2, END), 70, (540, 860), spk)

    # ===== 4 CTA: Comment WEB (13.0 to 15.0) =====
    hanging('COMMENT', 12.8, 1230, 112, 520, None, 80, 'comment')
    g.text('arialbd', sz(130), ('[WEB]', 'WEB'), (13.6, END), 90, (540, 1405), 0, {'scale': pop(0, 1.2)}, color=INK, stroke=STROKE)
    return g
