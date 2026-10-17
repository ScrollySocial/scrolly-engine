"""02 Pack an order with me, v5 animated (2026-10-17), following the approved storyboard (build/storyboard_02.py).
Real photographed props (box, flaps, peanuts, shreds, envelope, wax seal, closed box) with a playful layer (washi tape,
words on tape strips, a shipping label whose fields type in). Sage backdrop. The big serif words use the accent colour:
buyers change that text colour to their brand.

Beats: 1 the label prints and types in above the picking clip; 2 the real box slides up, the product clip plays on its
floor; 3 one peanut drops in; 4 peanuts flood the screen (the transition); 5 white shreds, the envelope lands, the wax
seal is pressed on; 6 the box closes (flipbooks of the real flaps folding, test_close.py); 7 the camera pushes in, pulls
back to the sealed box, washi tape zips along the seam, the label slaps on; 8 CTA: the box slides to the corner, tape
strip with the product name."""
import random
from PIL import Image, ImageDraw, ImageFont
from engine import Layers, rot_pt, interp, font_path, PX_PER_SIZE, W, H
import collage as C
import storyboard_02 as S
import test_close as TC

ACCENT = (44, 78, 168)        # stand-in for the buyer's brand colour (the big serif words)
INK, WHITE, BLUE, BUTTER = (24, 23, 22), (255, 255, 255), (166, 206, 242), (250, 232, 120)
SPEC = dict(num='02', title='Pack an order with me', subtitle='14.4 seconds. Three clips, filmed from above or close.',
            font='bodoni', dir='02-pack-an-order', folder='Template 02 - Pack an order with me',
            project='Scrolly 02 Pack an order with me', cover_at=1.9,
            slots=[('Picking the order', 'Hands taking your product off the shelf'),
                   ('Your product going into the box', 'Film from above, box fills the frame'),
                   ('The extras going in', 'Tissue, a note, a sticker: what you really add')],
            test_clips=[('IMG_1439', 0.5), ('IMG_1439', 1.8), ('IMG_1460', 1.2)])
END = 14.4

# ---- moving groups -----------------------------------------------------------------------------------------------------
# A transform is (pivot, [(t, dx, dy, scale, rot_cw)]) in absolute seconds; children of a group get keyframes that move,
# scale and turn them around the pivot together, like one object.
def xf(pivot, pts): return (pivot, pts)
def pop_in(pivot, t0, peak=1.18): return (pivot, [(t0, 0, 0, 0, 0), (t0 + .16, 0, 0, peak, 0), (t0 + .27, 0, 0, .94, 0), (t0 + .36, 0, 0, 1, 0)])
def pop_out(pivot, t0): return (pivot, [(t0, 0, 0, 1, 0), (t0 + .08, 0, 0, 1.1, 0), (t0 + .18, 0, 0, 0, 0)])

def at(xfs, p, r, t):
    x, y = p; s, rr = 1.0, r
    for pivot, pts in xfs:
        dx, dy, sc, ro = (interp([(q[0], q[i]) for q in pts], t, 0) for i in (1, 2, 3, 4))
        x, y = rot_pt((pivot[0] + (x - pivot[0]) * sc, pivot[1] + (y - pivot[1]) * sc), pivot, ro)
        x, y, s, rr = x + dx, y + dy, s * sc, rr + ro
    return x, y, s, rr

def motion(xfs, p, r, T, k=1.0):
    """Keyframes (layer-relative) for a child at rest position p, rest rotation r, own scale k."""
    keys = sorted({q[0] for _, pts in xfs for q in pts})
    ts = set(keys)
    for a, b in zip(keys, keys[1:]):                     # in-betweens so turning groups follow an arc
        if b - a > 0.02: ts.update(a + (b - a) * f for f in (0.25, 0.5, 0.75))
    ts = sorted(t for t in ts if T[0] < t < T[1]); ts = [T[0]] + ts
    kf = {'x': [], 'y': [], 'scale': [], 'rot': []}
    for t in ts:
        x, y, s, rr = at(xfs, p, r, t)
        kf['x'].append((t - T[0], x)); kf['y'].append((t - T[0], y)); kf['scale'].append((t - T[0], s * k)); kf['rot'].append((t - T[0], rr))
    for prop in list(kf):                                # drop keyframes that never change
        if len({round(v, 3) for _, v in kf[prop]}) == 1: kf[prop] = [kf[prop][0]] if prop != 'scale' else []
    return kf

def art(g, name, img, T, z, p, r, xfs, k=1.0):
    g.art(name, img, T, z, p, r, motion(xfs, p, r, T, k))

def text(g, font, size, words, T, z, p, r, xfs, color=INK, typewriter=None):
    g.text(font, size, words, T, z, p, r, motion(xfs, p, r, T), typewriter=typewriter, color=color)

# ---- the playful layer ---------------------------------------------------------------------------------------------------
def tape_words(g, key, c, small, big, rot, T, z, xfs, seed=17, length=760):
    """A butter gingham washi strip with a small sans line and a big serif line (accent colour) on it."""
    strip = C.washi(length, 250, 'gingham', (BUTTER, WHITE), seed=seed, alpha=250)
    art(g, f'tape-{key}', strip, T, z, c, rot, xfs)
    text(g, 'arial', 8.5, (small, small), T, z + 1, rot_pt((c[0], c[1] - 50), c, rot), rot, xfs)
    text(g, 'bodoni', 15.7, (big, big), T, z + 2, rot_pt((c[0], c[1] + 44), c, rot), rot, xfs, color=ACCENT)

def letters_centre(font, size, x_left, y_top, words):
    """Where a left-aligned line drawn at (x_left, y_top) has its centre (the engine centres text on its spot)."""
    f = ImageFont.truetype(font_path(font), round(size * PX_PER_SIZE))
    asc, _ = f.getmetrics(); cap = f.getbbox('H', anchor='la')[1]
    return (x_left + f.getlength(words) / 2, y_top + (cap + asc) / 2)

LABEL_FIELDS = [   # (y in the 520-wide label drawing, size, template words, test words, typing starts, typing seconds)
    (205, 34, '[Your shop]', 'Sunday Studio', 0.62, 0.35),
    (315, 44, 'YOU', 'YOU', 1.02, 0.18),
    (368, 34, '123 YOUR HOME', '123 YOUR HOME', 1.24, 0.4),
    (495, 34, '1 x something nice', '1 x something nice', 1.7, 0.45)]

def label(g, key, c, width, rot, T, z, xfs, typing=True):
    """The real-looking 4x6 shipping label; its fields are editable CapCut text (mono), typing in when typing=True."""
    k = width / 520; hgt = int(780 * k)
    art(g, f'label-{key}', C.ship_label().resize((width, hgt)), T, z, c, rot, xfs)
    for i, (y, px, words, test, t0, secs) in enumerate(LABEL_FIELDS):
        size = round(px * k / PX_PER_SIZE, 2)
        p = rot_pt(letters_centre('mono', size, c[0] - width / 2 + 60 * k, c[1] - hgt / 2 + y * k, words), c, rot)
        text(g, 'mono', size, (words, test), (T[0] + t0, T[1]) if typing else T, z + 1 + i, p, rot, xfs,
             typewriter=secs if typing else None)

def ticks(n=3, length=90, gap=34, width=7):
    im = Image.new('RGBA', (gap * (n - 1) + 2 * width + 40, length + 20), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for i in range(n):
        x = width + 20 + i * gap; d.line((x, 10 + (i % 2) * 12, x, 10 + length - (i % 2) * 12), fill=INK + (255,), width=width)
    return im

# ---- the box, cut from her real photo (same pieces as test_close.py) --------------------------------------------------------
def box_parts():
    b = TC.pieces()['body_box']; P = TC.pieces(dx=round(W / 2 - (b[0] + b[2]) / 2))   # the box centred on screen
    bx0, by0, bx1, by1 = P['body_box']
    P['spots'] = {'top': (bx0, by0 - P['top'].height), 'bottom': (bx0, by1), 'left': (bx0 - P['left'].width, by0 - 40),
                  'right': (bx1, by0 - 40)}
    open_ = Image.new('RGBA', (W, H), (0, 0, 0, 0)); open_.alpha_composite(P['body'], (bx0, by0))
    for e in ('top', 'bottom', 'left', 'right'): open_.alpha_composite(P[e], P['spots'][e])
    P['open'] = open_
    closed = P['body'].copy(); closed.alpha_composite(P['closed']); P['closed_box'] = C.shadow(closed, offset=(10, 18), blur=20, alpha=70)
    return P

def flap_frames(P, edges, n=6):
    """Flipbook frames of flaps folding away toward their hinge (foreshortened, darkening), each cropped to the flap."""
    ease = lambda x: x * x * (3 - 2 * x)
    bx0, by0, bx1, by1 = P['body_box']; books = {e: [] for e in edges}
    for i in range(n):
        f = 1 - ease(i / n)
        for e in edges:
            im = P[e]; vert = e in ('top', 'bottom')
            piece = im.resize((im.width, max(1, int(im.height * f))) if vert else (max(1, int(im.width * f)), im.height))
            piece = TC.darken(piece, 0.7 + 0.3 * f)
            x, y = P['spots'][e]
            if e == 'top': y = by0 - piece.height
            if e == 'left': x = bx0 - piece.width
            books[e].append((piece, (x + piece.width / 2, y + piece.height / 2)))
    return books

def halves_frames(P, n=8):
    ease = lambda x: x * x * (3 - 2 * x)
    bx0, by0, bx1, by1 = P['body_box']; cy = (by0 + by1) / 2; L, R = [], []
    for i in range(1, n + 1):
        f = ease(i / n); k = 0.72 + 0.28 * f; w = max(1, int(P['halfL'].width * f))
        L.append((TC.darken(P['halfL'].resize((w, P['halfL'].height)), k), (bx0 + w / 2, cy)))
        R.append((TC.darken(P['halfR'].resize((w, P['halfR'].height)), k), (bx1 - w / 2, cy)))
    return L, R

def shreds_layer(floor, spot):
    """White paper shreds filling the box floor, with a rounded window for the extras clip and its shadow."""
    fx0, fy0, fx1, fy1 = floor; sx0, sy0, sx1, sy1 = spot
    im = S.ImageOps.fit(S.white_shreds(), (fx1 - fx0, fy1 - fy0))
    sh = Image.new('L', im.size, 0); ImageDraw.Draw(sh).rounded_rectangle((sx0 - fx0, sy0 - fy0 + 12, sx1 - fx0, sy1 - fy0 + 12), 36, fill=95)
    dark = Image.new('RGBA', im.size, (0, 0, 0, 255)); dark.putalpha(sh.filter(S.ImageFilter.GaussianBlur(14))); im.alpha_composite(dark)
    hole = Image.new('L', im.size, 255); ImageDraw.Draw(hole).rounded_rectangle((sx0 - fx0, sy0 - fy0, sx1 - fx0, sy1 - fy0), 36, fill=0)
    im.putalpha(S.ImageChops.multiply(im.split()[3], hole))
    return im

def peanut_clumps(n_bands=10, seed=4):
    """The flood: real peanut photos (some with a white die-cut edge) laid over the whole screen, grouped in bands."""
    r = random.Random(seed); pea = S.prop('packing-peanut')
    tints = [None, None, None, (250, 250, 246), (250, 232, 140), None, (250, 250, 246)]
    spots = [(int((cx + .5) * W / 6 + r.randint(-50, 50)), int((cy + .5) * H / 10 + r.randint(-50, 50))) for cy in range(10) for cx in range(6)]
    spots += [(r.randint(0, W), r.randint(0, H)) for _ in range(22)]
    spots += [(r.randint(220, W - 220), r.randint(500, H - 500)) for _ in range(12)]   # no gap in the middle
    pieces = []
    for k, (x, y) in enumerate(spots):
        s = r.randint(240, 380); p = pea.resize((s, s)); t = tints[k % len(tints)]
        if t: p = S.recolour(p, t)
        if k % 2 == 0: p = S.bordered(p, WHITE, WHITE, 14, 2)
        pieces.append((y, p.rotate(r.randint(0, 359), expand=True, resample=Image.BICUBIC), x))
    pieces.sort(key=lambda q: q[0])
    out = []
    for b in range(n_bands):
        band = pieces[b * len(pieces) // n_bands:(b + 1) * len(pieces) // n_bands]
        x0 = min(x - p.width // 2 for _, p, x in band); y0 = min(y - p.height // 2 for y, p, _ in band)
        x1 = max(x + p.width // 2 for _, p, x in band); y1 = max(y + p.height // 2 for y, p, _ in band)
        im = Image.new('RGBA', (x1 - x0 + 2, y1 - y0 + 2), (0, 0, 0, 0))
        for y, p, x in band: im.alpha_composite(p, (x - p.width // 2 - x0, y - p.height // 2 - y0))
        cut = im.crop((max(0, -x0 - 60), 0, min(im.width, W + 60 - x0), im.height))   # off-screen parts aren't needed
        out.append((cut, (max(x0, -60) + cut.width / 2, y0 + im.height / 2)))
    return out   # top band first

# ---- the template ---------------------------------------------------------------------------------------------------------
def layers():
    g = Layers(); P = box_parts()
    fx0, fy0, fx1, fy1 = P['floor']; bx0, by0, bx1, by1 = P['body_box']
    floor_c = ((fx0 + fx1) / 2, (fy0 + fy1) / 2); body_c = ((bx0 + bx1) / 2, (by0 + by1) / 2)
    g.art('sage', Image.new('RGBA', (W, H), S.BG), (0, END), 0, (540, 960))

    # ===== 1 the label prints and types in, above the picking clip (0 to 2.75) =====
    # text always renders above images in CapCut, so the rising box pushes this whole scene up and out
    T1 = (0, 2.75); push = xf((540, 960), [(2.4, 0, 0, 1, 0), (2.68, 0, -1980, 1, 0)])
    g.clip(0, T1, 2, (540, 1450), (W, 940), 0, motion([push], (540, 1450), 0, T1), src=0.0, speed=1.0)
    art(g, 'washi-split', C.washi(1300, 120, 'stripes', (INK, WHITE), seed=3), T1, 3, (540, 985), 2,
        [xf((540, 985), [(0.1, -1500, 0, 1, 0), (0.4, 30, 0, 1, 0), (0.48, 0, 0, 1, 0)]), push])
    printing = xf((790, 640), [(0.1, 0, -1100, 1, 0), (0.18, 0, -760, 1, 0), (0.22, 0, -760, 1, 0), (0.3, 0, -430, 1, 0),
                               (0.34, 0, -430, 1, 0), (0.42, 0, -120, 1, 0), (0.46, 0, -120, 1, 0), (0.54, 0, 0, 1, 0)])
    label(g, 'print', (790, 640), 470, 4, T1, 4, [printing, push])
    tape_words(g, 'packing', (300, 320), 'packing', 'an order', 6, T1, 9, [pop_in((300, 320), 0.3), push], length=560)

    # ===== 2 the real box slides up, the product clip on its floor (2.4 to 6.15) =====
    rise = xf((540, 960), [(2.4, 0, 1950, 1, 0), (2.68, 0, -28, 1, 0), (2.76, 0, 0, 1, 0)])
    T2 = (2.4, 6.12)
    g.clip(1, T2, 10, floor_c, (fx1 - fx0, fy1 - fy0), 0, motion([rise], floor_c, 0, T2), src=0.0, speed=1.0)
    art(g, 'box-open', P['open'], (2.4, 8.9), 20, (540, 960), 0, [rise])
    tape_words(g, 'goods', (540, 310), 'the goods', 'go in first', 3, (2.85, 4.45), 50,
               [pop_in((540, 310), 2.85), pop_out((540, 310), 4.27)], seed=18)

    # ===== 3 one peanut drops in (4.45 to 6.15) =====
    pea = S.bordered(S.prop('packing-peanut').resize((360, 360)), WHITE, WHITE, 16, 2)
    art(g, 'peanut-one', pea, (4.45, 6.15), 25, (540, 980), 14,
        [xf((540, 980), [(4.45, 0, -1350, 1, -30), (4.66, 0, 0, 1, 0), (4.74, 0, -46, 1, 6), (4.82, 0, 0, 1, 0)])])
    art(g, 'ticks-peanut', ticks(), (4.7, 6.15), 26, (500, 700), 0, [pop_in((500, 700), 4.7)])
    tape_words(g, 'padding', (540, 310), '+ a little', 'padding', -3, (4.85, 5.75), 50,
               [pop_in((540, 310), 4.85), pop_out((540, 310), 5.55)], seed=19)   # gone before the flood covers it

    # ===== 4 peanuts flood the screen, then fall away (5.55 to 6.85) =====
    clumps = peanut_clumps()
    for j, (im, c) in enumerate(reversed(clumps)):    # the bottom band lands first, the top band last
        t0 = 5.55 + j * 0.035; t1 = 6.2 + j * 0.03
        art(g, f'flood-{j}', im, (t0, t1 + 0.32), 60 + (len(clumps) - j), c, 0,
            [xf(c, [(t0, 0, -2100, 1, 0), (t0 + 0.2, 0, 22, 1, 0), (t0 + 0.26, 0, 0, 1, 0),
                    (t1, 0, 0, 1, 0), (t1 + 0.14, 0, 380, 1, 0), (t1 + 0.3, 0, 2300, 1, 0)])])

    # ===== 5 white shreds, the extras clip, the envelope lands, the wax seal is pressed on (6.1 to 9.57) =====
    T5 = (6.12, 9.57)
    sw = fx1 - fx0 - 150; sh = int(sw * 1.2); scx, scy = floor_c[0], floor_c[1] - 60
    spot = (int(scx - sw / 2), int(scy - sh / 2), int(scx + sw / 2), int(scy + sh / 2))
    g.clip(2, T5, 10, (scx, scy), (sw, sh), src=0.0, speed=1.0)
    g.art('shreds', shreds_layer(P['floor'], spot), T5, 12, floor_c)
    tape_words(g, 'extra', (540, 310), 'a little', 'extra', -2, (6.45, 8.9), 50,
               [pop_in((540, 310), 6.45), pop_out((540, 310), 8.72)], seed=20)
    env_c = (572, 1500)
    env = C.shadow(S.prop('envelope').resize((580, 334)), offset=(8, 14), blur=14, alpha=70)
    art(g, 'envelope', env, (6.85, 9.57), 25, env_c, -10,
        [xf(env_c, [(6.85, 900, 700, 1, 25), (7.15, -20, -14, 1, -2), (7.25, 0, 0, 1, 0)])])
    seal_c = rot_pt((env_c[0], env_c[1] + 70), env_c, -10)   # on the point of the envelope flap, where a real seal goes
    seal = C.shadow(S.prop('wax-seal-thank-you').resize((250, 250)), offset=(10, 22), blur=20, alpha=70)
    art(g, 'seal', seal, (7.6, 9.57), 26, seal_c, 8,
        [xf(seal_c, [(7.6, 0, 0, 1.8, -10), (7.74, 0, 0, 0.93, 0), (7.82, 0, 0, 1.03, 0), (7.9, 0, 0, 1, 0)])])
    art(g, 'ticks-seal', ticks().rotate(35, expand=True), (7.75, 9.0), 27, (380, 1330), 0, [pop_in((380, 1330), 7.75)])

    # ===== 6 the box closes: real flaps fold away, the closed lid's halves fold down and meet (8.9 to 9.57) =====
    g.art('box-body', P['body'], (8.9, 9.57), 20, body_c)
    books = flap_frames(P, ('top', 'bottom', 'left', 'right'))
    for z, e in enumerate(('top', 'bottom')): g.flip(f'flap-{e}', books[e], 8.9, 21 + z)
    for z, e in enumerate(('left', 'right')): g.flip(f'flap-{e}', books[e], 8.9 + 6 / 30, 23 + z)
    hl, hr = halves_frames(P)
    g.flip('half-l', hl, 9.57 - 8 / 30, 30); g.flip('half-r', hr, 9.57 - 8 / 30, 31)

    # ===== 7 push in, pull back to the sealed box, tape zips along the seam, the label slaps on (9.57 to 11.8) =====
    zoom = max(W / (bx1 - bx0), H / (by1 - by0)) * 1.02; s7 = 0.95; c7 = (540, 1040)
    box_move = xf(body_c, [(9.57, 0, 0, 1, 0), (9.9, 0, 0, zoom, 0), (10.0, 0, 0, zoom, 0),
                           (10.32, c7[0] - body_c[0], c7[1] - body_c[1], s7, 0)])
    cta = xf(c7, [(11.8, 0, 0, 1, 0), (12.15, 290 - c7[0] + 12, 1250 - c7[1] - 15, 0.6, 17), (12.25, 290 - c7[0], 1250 - c7[1], 0.58, 16)])
    art(g, 'box-closed', P['closed_box'], (9.57, END), 32, body_c, 0, [box_move, cta])
    tape_len = int((by1 - by0) * s7) + 16
    tape = C.washi(tape_len, 170, 'dots', (BLUE, WHITE), seed=8, alpha=245).rotate(90, expand=True)
    top_y = c7[1] - tape.height / 2; zip_frames = []
    for i in range(1, 10):
        part = tape.crop((0, 0, tape.width, max(2, int(tape.height * i / 9))))
        zip_frames.append((part, (c7[0], top_y + part.height / 2)))
    t_zip = g.flip('tape-zip', zip_frames[:-1], 10.4, 33)
    art(g, 'tape-seam', tape, (t_zip, END), 33, c7, 0, [cta])
    lab_c = (c7[0] + 150 * s7, c7[1] + 260 * s7)
    label(g, 'box', lab_c, int(430 * s7), 6, (10.8, END), 34,
          [xf(lab_c, [(10.8, 0, 0, 1.7, -12), (10.94, 0, 0, 0.94, 0), (11.02, 0, 0, 1.02, 0), (11.1, 0, 0, 1, 0)]), cta], typing=False)
    tape_words(g, 'sealed', (540, 310), 'sealed +', 'on its way', -3, (10.45, 12.0), 50,
               [pop_in((540, 310), 10.45), xf((540, 310), [(11.8, 0, 0, 1, 0), (12.0, 0, -500, 1, 0)])], seed=21)

    # ===== 8 CTA: tape strip with the product name, where to buy (11.95 to 14.4) =====
    T8 = (11.95, END)
    strip = C.washi(980, 300, 'gingham', (BUTTER, WHITE), seed=11, alpha=250)
    art(g, 'tape-cta', strip, T8, 40, (540, 450), 3, [xf((540, 450), [(11.95, 1300, 0, 1, 0), (12.25, -25, 0, 1, 0), (12.33, 0, 0, 1, 0)])])
    name_c = letters_centre('bodoni', 19.7, 0, 350, '[Product name]'); name_c = (540, name_c[1])
    g.text('bodoni', 19.7, ('[Product name]', 'Spray cleaner'), (12.3, END), 41, name_c, typewriter=0.5, color=ACCENT)
    shop_c = (540, letters_centre('arial', 8.2, 0, 500, 'shop')[1])
    text(g, 'arial', 8.2, ('shop at [where to buy]', 'shop at the link in my bio'), (12.75, END), 42, shop_c, 0,
         [pop_in(shop_c, 12.75, 1.12)])
    return g
