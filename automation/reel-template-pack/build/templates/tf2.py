"""f2 The fall drop (Fall pack), approved 2026-10-18 as the motion test build/motion_f2.py v5 ("love it... finally").
Collage look: photo/pattern tiles butted together, the buyer's clips are tiles; real cut-outs with hand-drawn outlines
cross the seams; her doodles (arrow, rays, wavy underline, sparkles); one paper piece per frame.
Built for CapCut with what the engine has: tiles slide in on x/y keyframes; the knit tile's flip is a flipbook and the
clip pops in where it was; the zoom into the wheat tile is scale + position keyframes on every collage layer; the cord
tile peels down behind the wool tile; the cream stripes fade as a flipbook and the red stripes slide off as bands;
the CTA tiles slide over the bottom of the last clip. CapCut draws text above pictures, so every text leaves before a
picture covers it.
Built-in artwork words: THE FALL DROP. Editable: meet the / maple candle and comment (Bodoni Moda, CapCut library),
the tag, the card, SMALL BATCH and the keyword DROP (Anton, shipped inside the project folder)."""
import math
from PIL import Image, ImageOps
from engine import Layers, PX_PER_SIZE, W, H, pop
import motion_f2 as M

SPEC = dict(num='f2', title='The fall drop', subtitle='12 seconds. Four clips of your product: a hero shot, it in use, a detail, and one more.',
            font='bodoni', dir='fall/f2-fall-drop', folder='Template f2 - The fall drop', project='Scrolly f2 The fall drop',
            cover_at=1.8,
            slots=[('Your product, held up', 'Upright, close, against a plain wall'),
                   ('Your product, hero shot', 'The main shot: it stands on its own, the whole thing in view'),
                   ('A detail', 'Texture, the label, pouring, opening'),
                   ('It in use', 'Someone using it, or it in its spot at home')],
            test_clips=[('IMG_1439', 0.8), ('IMG_1422', 0.5), ('IMG_1391', 0.5), ('IMG_1418', 0.5)])
END = 12.0
BURGUNDY, RUST, CREAM = M.BURGUNDY, M.RUST, M.CREAM
def sz(px): return round(px / PX_PER_SIZE, 2)
STROKE_CREAM = (CREAM, 0.14)
STROKE_BURG = (BURGUNDY, 0.12)

def tile_img(src, w, h): return M.content(src, 0, w, h, 0.0).copy()

def slide(c, frm, t0, dur=0.35):
    """x or y keyframes for a tile sliding in from off screen (layer-relative times)."""
    if frm == 'l': return {'x': [(t0, -W / 2), (t0 + dur, c[0])]}
    if frm == 'r': return {'x': [(t0, W * 1.5), (t0 + dur, c[0])]}
    if frm == 't': return {'y': [(t0, -H / 2), (t0 + dur, c[1])]}
    return {'y': [(t0, H * 1.5), (t0 + dur, c[1])]}

ZC, Z0, Z1, ZK = (540, 1110), 2.95, 3.4, 3.4      # the zoom into the wheat tile: centre, start, end, final scale

def zoomed(kf, c, start, base=1.0):
    """Add the zoom (every collage-A layer scales about ZC and moves outward) to a layer's keyframes."""
    kf = {k: list(v) for k, v in kf.items()}
    a, b = Z0 - start, Z1 - start
    for key, i in (('x', 0), ('y', 1)):
        pts = kf.get(key, [])
        kf[key] = [p for p in pts if p[0] < a] + [(a, c[i]), (b, ZC[i] + (c[i] - ZC[i]) * ZK)]
    pts = kf.get('scale', [])
    kf['scale'] = [p for p in pts if p[0] < a] + [(a, base), (b, base * ZK)]
    return kf

def layers():
    g = Layers(); z = iter(range(1, 400))
    g.art('base', Image.new('RGBA', (W, H), CREAM + (255,)), (0, 9.65), 1, (540, 960))   # cream under the collage gaps
    # ===== collage A (0 to 3.4) =====
    A = []                                                  # (kind, args) collected so the zoom can be added to all
    def a_art(name, img, t, c, kf, rot=0): A.append(('art', name, img, t, c, kf, rot))
    def a_clip(slot, t, c, size, kf, src): A.append(('clip', slot, t, c, size, kf, src))
    a_clip(0, (0, Z1), (320, 410), (640, 820), slide((320, 410), 'l', 0), 0.0)
    a_art('plaid-a', tile_img('plaid', 440, 430), (0, Z1), (860, 215), slide((860, 215), 'r', 0.1))
    knit = tile_img('knit', 440, 390)
    a_art('knit-a', knit, (0, 1.3), (860, 625), slide((860, 625), 'r', 0.2))
    for i in range(6):                                      # the knit tile turns over (flipbook) ...
        k = math.cos((i + 1) / 6 * math.pi / 2)
        g.art(f'knit-flip-{i}', knit.resize((max(2, int(440 * k)), 390)), (1.3 + i / 30, 1.3 + (i + 1) / 30), 30, (860, 625))
    a_clip(2, (1.5, Z1), (860, 625), (440, 390), {'scale': [(0, 0.05), (0.18, 1.06), (0.26, 1.0)]}, 0.0)   # ... and the clip is behind it
    a_art('wheat-a', tile_img('wheat', 1080, 580), (0, 2.85), (540, 1110), slide((540, 1110), 'l', 0.3))
    a_clip(1, (2.85, Z1), (540, 1110), (1080, 580), {'scale': [(0, 0.9), (0.12, 1.0)]}, 2.85)   # the wheat tile becomes the clip
    a_clip(1, (0, Z1), (300, 1660), (600, 520), slide((300, 1660), 'b', 0.4), 0.0)
    a_art('knit-b', tile_img('knit', 480, 520), (0, Z1), (840, 1660), slide((840, 1660), 'b', 0.5))
    a_art('pinecone-a', M.cut('Large open pinecone on white-68.png', 210, seed=2), (0.8, Z1), (1000, 440), {'scale': pop(0)}, -12)
    a_art('leaf-a', M.cut('Red maple leaf on white-38.png', 200, seed=4), (0.95, Z1), (930, 800), {'scale': pop(0)}, 25)
    for i, (n, c, r) in enumerate(M.ACORNS):
        a_art(f'acorn-{i}', M.cut(n, 170, seed=10 + i), (1.0 + 0.12 * i, Z1), c, {'scale': pop(0)}, r)
    g.art('arrow', M.ARROW, (0.7, 2.3), 60, (560, 690), {'scale': pop(0)}, 95)
    g.art('hero', M.HERO, (0.15, 2.3), 61, (540, 1110), {'scale': pop(0), 'rot': [(0, -2)]})
    for kind, *rest in A:
        if kind == 'art':
            name, img, t, c, kf, rot = rest
            if 'rot' not in kf and rot: kf = dict(kf, rot=[(0, rot)])
            g.art(name, img, t, next(z) + 2, c, zoomed(kf, c, t[0], 1.0))
        else:
            slot, t, c, size, kf, src = rest
            g.clip(slot, t, next(z) + 2, c, size, 0, zoomed(kf, c, t[0], 1.0), src=src, speed=1.0)
    # new words land on the wheat tile (editable), and leave before the zoom
    g.text('bodoni', sz(90), ('meet the', 'meet the'), (2.4, 2.85), 70, (540, 1040), 0, {'scale': pop(0, 1.15)}, color=M.BROWN, stroke=STROKE_CREAM)
    g.text('bodoni', sz(150), ('[maple candle]', 'maple candle'), (2.45, 2.85), 71, (540, 1170), 0, {'scale': pop(0, 1.15)}, color=BURGUNDY, stroke=STROKE_CREAM)

    # ===== clip b full (3.4 to 5.4), then it shrinks into a tile for collage B (5.4 to 8.2) =====
    g.clip(1, (Z1, 8.2), 2, (540, 960), (W, H), 0, {'scale': [(5.4 - Z1, 1.0), (5.85 - Z1, 0.5)], 'x': [(5.4 - Z1, 540), (5.85 - Z1, 270)],
           'y': [(5.4 - Z1, 960), (5.85 - Z1, 480)]}, src=Z1, speed=1.0)
    g.art('rays', M.RAYS, (3.85, 5.2), 20, (300, 1260), {'scale': pop(0), 'rot': [(0, -6), (0.7, 6), (1.35, -6)]})
    tag = M.paper('Blank kraft gift tag with twine-34.png', 520, [])
    g.art('tag', tag, (3.7, 5.2), 21, (300, 1100), {'scale': pop(0)}, -6)
    for i, (words, px, dy) in enumerate((('HAND-POURED', 64, 80), ('SOY WAX', 104, 173))):   # centred on the tag body
        c = (300 - dy * math.sin(math.radians(6)), 1100 + dy * math.cos(math.radians(6)))
        g.text('anton', sz(px), (f'[{words.lower()}]', words), (3.85, 5.2), 72 + i, c, -6, {'scale': pop(0, 1.1)}, color=BURGUNDY)

    # ===== collage B (5.4 to 8.2) =====
    g.art('gingham', tile_img('gingham', 540, 480), (5.5, 8.2), 3, (810, 240), slide((810, 240), 't', 0))
    g.clip(3, (5.6, 8.2), 4, (810, 720), (540, 480), 0, slide((810, 720), 'r', 0), src=0.0)
    cord = tile_img('cord', 540, 480)
    g.art('cord', cord, (5.6, 7.6), 5, (810, 720), {'x': [(0, W * 1.5), (0.3, 810)], 'y': [(1.4, 720), (2.0, 1320)]})   # peels down behind the wool
    g.art('wool', tile_img('wool', 1080, 960), (5.7, 8.2), 6, (540, 1440), slide((540, 1440), 'b', 0))
    g.art('sunflower', M.cut('Single sunflower on white-79.png', 240, seed=8), (6.3, 8.2), 7, (900, 900), {'scale': pop(0)}, 8)
    card = M.paper('Blank ivory note card-121.png', 860, [], tol=6)
    g.art('card', card, (6.2, 8.2), 8, (500, 1360), {'scale': pop(0)}, -3)
    g.art('wavy', M.WAVY, (6.6, 8.2), 9, (500, 1540), {'scale': pop(0)}, -3)
    g.art('cinnamon', M.cut('Twine-Tied Cinnamon Stick Bundle-55.png', 300, seed=7), (6.4, 8.2), 10, (210, 970), {'scale': pop(0)}, -20)
    g.text('anton', sz(180), ('[3 scents]', '3 SCENTS'), (6.35, 8.2), 74, (500, 1300), -3, {'scale': pop(0, 1.1)}, color=BURGUNDY)
    g.text('anton', sz(92), ('[maple, cider, pine]', 'MAPLE · CIDER · PINE'), (6.45, 8.2), 75, (504, 1430), -3, {'scale': pop(0, 1.1)}, color=RUST)

    # ===== text only (8.2 to 9.45): the knit fills the screen, SMALL BATCH (editable) =====
    g.art('knit-full', tile_img('knit', W, H), (8.2, 9.65), 11, (540, 960), slide((540, 960), 'r', 0, 0.3))
    g.text('anton', sz(220), ('[small]', 'SMALL'), (8.4, 9.45), 76, (540, 800), -2, {'scale': pop(0, 1.15)}, color=CREAM, stroke=STROKE_BURG)
    g.text('anton', sz(360), ('[batch]', 'BATCH'), (8.5, 9.45), 77, (540, 1060), -2, {'scale': pop(0, 1.15)}, color=CREAM, stroke=STROKE_BURG)

    # ===== stripes (9.4 to 10.75): they sweep in, the cream stripes fade onto the clip, the red stripes slide off =====
    st = M.content('stripes', 0, W, H).copy(); gray = ImageOps.grayscale(st.convert('RGB'))
    g.art('stripes-in', st, (9.4, 9.65), 12, (540, 960), slide((540, 960), 'r', 0, 0.25))
    g.clip(3, (9.65, END), 2 + 0, (540, 960), (W, H), 0, {}, src=4.05)
    frames = []
    for i in range(10):                                      # the cream stripes fade away (flipbook)
        cr = st.copy(); cr.putalpha(gray.point(lambda v, a=1 - (i + 1) / 11: int(255 * a) if v >= 150 else 0)); frames.append((cr, (540, 960)))
    g.flip('cream-fade', frames, 9.65, 13)
    red = st.copy(); red.putalpha(gray.point(lambda v: 255 if v < 150 else 0))
    for i, (y0, y1) in enumerate(M.STRIPE_ROWS):
        band = red.crop((0, y0, W, y1)); cy = (y0 + y1) / 2; d = 1 if i % 2 else -1
        g.art(f'stripe-{i:02d}', band, (9.65, 10.75), 40 + i, (540, cy), {'x': [(0.45, 540), (1.05, 540 + d * (W + 60))]})

    # ===== CTA (10.6 to 12): tiles slide over the bottom of the clip; comment DROP across the seam =====
    g.art('plaid-cta', tile_img('plaid', 540, 760), (10.75, END), 15, (270, 1540), slide((270, 1540), 'l', 0, 0.3))
    g.art('wheat-cta', tile_img('wheat', 540, 760), (10.85, END), 16, (810, 1540), slide((810, 1540), 'r', 0, 0.3))
    g.art('pinecone-cta', M.cut('Large open pinecone on white-68.png', 200, seed=9), (11.1, END), 17, (990, 1170), {'scale': pop(0)}, 20)
    g.art('spark-a', M.SPARKS[0], (11.35, END), 18, (240, 1290), {'scale': pop(0), 'rot': [(0, -10), (0.4, 10), (0.8, -10), (1.2, 10)]})
    g.art('spark-b', M.SPARKS[1], (11.45, END), 19, (840, 1400), {'scale': pop(0), 'rot': [(0, 10), (0.4, -10), (0.8, 10), (1.2, -10)]})
    g.text('bodoni', sz(110), ('comment', 'comment'), (11.0, END), 78, (540, 1150), -2, {'scale': pop(0, 1.15)}, color=BURGUNDY, stroke=STROKE_CREAM)
    g.text('anton', sz(230), ('[DROP]', 'DROP'), (11.15, END), 79, (540, 1330), 0, {'scale': pop(0, 1.2)}, color=CREAM, stroke=STROKE_BURG)
    return g
