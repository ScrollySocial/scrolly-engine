"""h5 Trick or treat (Halloween pack), approved 2026-10-18 as motion test v10 (build/motion_h5.py).
The buyer's three clips are real CapCut clip layers (in door 1's glass, in the hallway, through door 2's arch, full
screen, under the doorbell view); the graphics (Snap ITC taffy lettering, candy, doodles, notes, the doorbell overlay,
the swinging door, the strip slice) are rendered from the approved motion test as short flipbooks above them, so the
template moves the same way. Business words stay editable Arial Bold.
CapCut limits: the swinging door leaf and the strip slice use a still of clip 1 (they last half a second each); the
doorbell view is a vignette + overlay (no fisheye distortion)."""
import math
from PIL import Image, ImageDraw, ImageOps, ImageEnhance
from engine import Layers, PX_PER_SIZE, W, H, pop
import motion_h5 as M
B, D = M.B, M.D

SPEC = dict(num='h5', title='Trick or treat', subtitle='17 seconds. Three clips: the common mistake, your product, the proof.',
            font='bodoni', dir='halloween/h5-trick-or-treat', folder='Template h5 - Trick or treat',
            project='Scrolly h5 Trick or treat', cover_at=1.6,
            slots=[('The trick: the common mistake', 'The thing people buy or do instead of yours'),
                   ('The treat: your product', 'Your product in use, upright'),
                   ('The proof', 'A result, a happy customer, or the finished job')],
            test_clips=[('IMG_1447', 0.3), ('IMG_1439', 1.0), ('IMG_1460', 1.0)])
END = M.END
INK, WHITE = M.INK, (255, 255, 255)
STROKE = (INK, 0.12)
def sz(px): return round(px / PX_PER_SIZE, 2)
_z = [100]
def nz():
    _z[0] += 1; return _z[0]

def crop(im):
    bb = im.getbbox() or (0, 0, 2, 2); return im.crop(bb), ((bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2)

def overlay(g, name, t0, t1, draw, fps=15):
    """Graphics rendered frame by frame from the motion test (transparent, cropped), played as a flipbook."""
    frames = []; n = max(1, int(round((t1 - t0) * fps)))
    for i in range(n):
        t = t0 + i / fps; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); draw(im, t)
        c = crop(im); frames += [c] * (30 // fps)
    g.flip(name, frames, t0, nz())

def scale_about(c0, piv, z):
    return (piv[0] + (c0[0] - piv[0]) * z, piv[1] + (c0[1] - piv[1]) * z)

def note_art(rot):
    return M.E.C.shadow(M.NOTE.rotate(rot, expand=True, resample=Image.BICUBIC), (8, 14), 12, 90)

def layers():
    g = Layers()
    # ===== S1 door 1, clip 1 behind its glass (0 to 2.2) =====
    door = M.DOOR_SHUT.copy(); a = door.split()[3].copy(); dr = ImageDraw.Draw(a)
    gray = ImageOps.grayscale(M.DOOR_SHUT.convert('RGB'))
    for b in M.PANES:   # the glass becomes see-through except the dark lattice bars
        lat = gray.crop(b).point(lambda x: 230 if x < 70 else 0); a.paste(lat, b[:2])
    door.putalpha(a)
    fw = (240 / 960) * 1920 / 1080
    for k, b in enumerate(M.PANES):
        g.clip(0, (0, 2.2), 2 + k, ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2), (b[2] - b[0], b[3] - b[1]),
               crop=(0.5 - fw / 2, 0, 0.5 + fw / 2, 1), src=0.0, speed=1.0)
    g.art('door1', door, (0, 2.2), 10, (540, 960))
    overlay(g, 'hook-words', 0.0, 2.2, lambda im, t: (M.word_art(im, t, -0.3, 'TRICK', 510, 1130, 210, 'taffy', 'jitter'),
                                                     M.word_art(im, t, 0.1, 'or TREAT?', 500, 1370, 120, 'taffy', 'pop', 0.04)))
    def knocks(im, t):
        for k, (x, y) in enumerate(((430, 860), (660, 820), (540, 760))):
            if t > 0.5 + k * 0.4: D.draw_on(im, M.DOO['burst1' if k % 2 == 0 else 'burst2'], (x, y), t, 0.5 + k * 0.4, 0.12)
    overlay(g, 'knocks', 0.5, 2.2, knocks)

    # ===== 2.2 to 3.2 the door swings open, then we push into the hallway (clip 1 full frame behind) =====
    g.clip(0, (2.2, 5.6), 2, (540, 960), (W, H), src=1.0, speed=1.0)
    opened = B.door1('Warm Townhouse Entryway at Night.png', Image.new('RGBA', (W, H), (0, 0, 0, 0)))   # hallway left clear
    def hall(im): return im
    hx = [(0, 540), (0.6, 540)]; hy = [(0, 960), (0.6, 960)]; hs = [(0, 1.0), (0.6, 1.0)]
    for i in range(5):
        u = M.ease(i / 4); z = 1 + 2.4 * u; c = scale_about((540, 960), M.DOOR_C, z)
        hx.append((0.6 + 0.4 * i / 4, c[0])); hy.append((0.6 + 0.4 * i / 4, c[1])); hs.append((0.6 + 0.4 * i / 4, z))
    g.art('door1-open', opened, (2.2, 3.2), 10, (540, 960), {'x': hx, 'y': hy, 'scale': hs})
    still = M.door_with_panes(M.vid('trick', 2.2))
    leaf_frames = []
    for i in range(18):
        u = M.ease(i / 17); th = math.radians(78 * u); lw = 880 * math.cos(th); d = H * 0.10 * math.sin(th)
        if lw <= 6: break
        dst = [(1000 - lw, d), (1000, 0), (1000, H), (1000 - lw, H - d)]; src = [(120, 0), (1000, 0), (1000, H), (120, H)]
        leaf = still.transform((W, H), Image.PERSPECTIVE, M.persp(dst, src), Image.BICUBIC)
        m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(dst, fill=255); leaf.putalpha(m)
        leaf_frames.append(crop(ImageEnhance.Brightness(leaf).enhance(1 - 0.5 * u)))
    g.flip('door-swing', leaf_frames, 2.2, nz())

    # ===== S2 3.2 to 5.6 the TRICK: clip 1 full; TRICK, her words on a pinned note, crossed out =====
    overlay(g, 'trick-word', 3.2, 5.6, lambda im, t: M.word_art(im, t, 3.25, 'TRICK', 540, 420, 220, 'taffy', 'jitter'))
    na = note_art(-5); g.art('note-trick', na, (3.55, 5.6), nz(), (700, 900), {'scale': pop(0, 1.15)})
    g.art('pin-trick', M.PIN, (3.8, 5.6), nz(), (700 + M.PIN.width * 0.2, 900 - M.NOTE.height / 2 + M.PIN.height * 0.45))
    g.text('arialbd', sz(64), ('[cheap\nsponges]', 'cheap\nsponges'), (3.6, 5.6), 90, (700, 900), -5, {'scale': pop(0, 1.1)}, color=INK)
    overlay(g, 'x', 4.9, 5.6, lambda im, t: D.draw_on(im, M.DOO['x'], (700, 900), t, 4.9, 0.3, -6))

    # ===== 5.6 to 6.1 two-tone strip slice to door 2 (strips cut from a still of clip 1) =====
    g.art('house-strip', M.HOUSE, (5.6, 6.1), 1, (540, 960))
    a0 = M.vid('trick', 4.3)
    def strips(im, t):
        u = M.ease((t - 5.6) / 0.5); n = 12; sh = H // n
        tints = [Image.new('RGBA', (W, sh), (196, 170, 232, 255)), Image.new('RGBA', (W, sh), (70, 44, 96, 255))]
        for k in range(n):
            st = Image.blend(a0.crop((0, k * sh, W, (k + 1) * sh)), tints[k % 2], 0.35 + 0.25 * u)
            im.alpha_composite(st, (int((W + 40) * u * (1 if k % 2 else -1) * (0.85 + 0.03 * k)), k * sh))
    overlay(g, 'strip-slice', 5.6, 6.1, strips, fps=30)

    # ===== S3 6.1 to 8.3 door 2: clip 2 through the real arch, candy pops out; 8.3 to 9.0 through the doorway =====
    g.clip(1, (6.1, 11.6), 2, (540, 960), (W, H), src=0.0, speed=1.0)
    arch_img = M.arch_house(1, Image.new('RGBA', (W, H), (0, 0, 0, 0)))
    ax, ay, asc = [(0, 540), (2.2, 540)], [(0, 960), (2.2, 960)], [(0, 1.0), (2.2, 1.0)]
    for i in range(8):
        u = M.ease(i / 7); z = 1 + 5.5 * u * u; c = scale_about((540, 960), M.ARCH_C, z)
        ax.append((2.2 + 0.7 * i / 7, c[0])); ay.append((2.2 + 0.7 * i / 7, c[1])); asc.append((2.2 + 0.7 * i / 7, z))
    g.art('door2-arch', arch_img, (6.1, 9.0), 10, (540, 960), {'x': ax, 'y': ay, 'scale': asc})
    overlay(g, 'candy', 6.5, 9.0, lambda im, t: M.candy_pop(im, t, 6.5, M.ARCH_C, drop_at=8.3 if t > 8.3 else None))
    g.text('arialbd', sz(62), ('[something sweet is coming]', 'something sweet is coming'), (6.2, 8.3), 91, (520, 330), 0,
           {'scale': pop(0, 1.1)}, color=WHITE, stroke=STROKE)

    # ===== S4 9.0 to 11.4 the TREAT: the pill behind the word, the carried candy corn beside it =====
    def treat(im, t):
        M.pill(im, t, 9.05, (540, 480), 940, 280); M.word_art(im, t, 9.15, 'TREAT', 540, 470, 200, 'taffy', 'drop', 0.06)
        u = M.ease((t - 9.0) / 0.6); cx, cy = 980 + (900 - 980) * u, -100 + 390 * u
        if t > 9.5: D.draw_on(im, M.BURST_SMALL, (905, 290), t, 9.5, 0.2)
        cc = B.fit_w(M.CANDY[1], 150).rotate(-20 + 30 * u, expand=True, resample=Image.BICUBIC)
        im.alpha_composite(M.E.C.shadow(cc, (5, 9), 9, 70), (int(cx - cc.width / 2), int(cy - cc.height / 2)))
        D.draw_on(im, M.DOO['heart'], (860, 1200), t, 10.2, 0.35, 8)
    overlay(g, 'treat', 9.0, 11.4, treat)
    g.text('arialbd', sz(80), ('[our 5-minute scrub]', 'our 5-minute scrub'), (9.6, 11.4), 92, (540, 720), 0,
           {'scale': pop(0, 1.1)}, color=WHITE, stroke=STROKE)

    # ===== 11.4 to 11.8 ding dong (a white flash), S5 11.8 to 14.8 the doorbell view of clip 3 =====
    g.clip(2, (11.6, END), 3, (540, 960), (W, H), src=0.0, speed=1.0)
    flash = []
    for i in range(12):
        u = i / 11; w = Image.new('RGBA', (W, H), (255, 255, 255, int(255 * (1 - abs(u - 0.5) * 2)))); flash.append((w, (540, 960)))
    g.flip('flash', flash, 11.4, nz())
    g.text('arialbd', sz(120), ('ding dong!', 'ding dong!'), (11.4, 12.7), 93, (540, 960), 0, {'scale': pop(0, 1.1)}, color=WHITE, stroke=STROKE)
    from PIL import ImageChops
    def bell(im, t):
        """The doorbell look over clip 3: darker edges plus the Front door / LIVE / time overlay (as in motion_h5.doorbell)."""
        dark = Image.new('RGBA', (W, H), (0, 0, 0, 255)); dark.putalpha(ImageChops.invert(M.VIGNETTE).point(lambda v: int((255 - v) * 0.9)))
        im.alpha_composite(dark); d = ImageDraw.Draw(im)
        f = M.E.ImageFont.truetype(M.BOLD, 40); f2 = M.E.ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 40)
        d.text((80, 260), 'Front door', font=f, fill=(255, 255, 255, 235), stroke_width=2, stroke_fill=(0, 0, 0, 160))
        if int(t * 2) % 2 == 0: d.ellipse((850, 268, 878, 296), fill=(230, 50, 50, 255))
        d.text((890, 260), 'LIVE', font=f, fill=(255, 255, 255, 235), stroke_width=2, stroke_fill=(0, 0, 0, 160))
        d.text((80, 1420), f'10/31  7:4{int(t) % 10} PM', font=f2, fill=(255, 255, 255, 220), stroke_width=2, stroke_fill=(0, 0, 0, 160))
    overlay(g, 'doorbell', 11.8, 14.6, bell, fps=10)
    overlay(g, 'proof-word', 11.8, 14.6, lambda im, t: (M.word_art(im, t, 11.85, 'PROOF', 540, 420, 170, 'taffy', 'pop', 0.05),
                                                       D.draw_on(im, M.DOO['arrow'], (260, 1180), t, 12.8, 0.3, -20)))
    nb = note_art(6); g.art('note-proof', nb, (12.2, 14.6), nz(), (680, 1180), {'scale': pop(0, 1.15)})
    g.art('pin-proof', M.PIN, (12.45, 14.6), nz(), (680 + M.PIN.width * 0.2, 1180 - M.NOTE.height / 2 + M.PIN.height * 0.45))
    g.text('arialbd', sz(64), ('[5-star\nreviews]', '5-star\nreviews'), (12.25, 14.6), 94, (680, 1180), 6, {'scale': pop(0, 1.1)}, color=INK)

    # ===== S6 14.8 to 17.5 CTA: COMMENT, the pill behind the keyword, the offer underlined =====
    def cta(im, t):
        M.word_art(im, t, 14.8, 'COMMENT', 540, 470, 150, 'taffy', 'pop', 0.05); M.pill(im, t, 15.0, (560, 712), 640, 220, 0, 50)
        D.draw_on(im, M.DOO['wavy'], (520, 1000), t, 15.5, 0.35)
    overlay(g, 'cta', 14.8, END, cta)
    g.text('arialbd', sz(140), ('[TREAT]', 'TREAT'), (15.05, END), 95, (560, 712), 0, {'scale': pop(0, 1.1)}, color=WHITE, stroke=(INK, 0.16))   # centred in the pill
    g.text('arialbd', sz(64), ('for something sweet: 15% off', 'for something sweet: 15% off'), (15.2, END), 96, (520, 900), 0,
           {'scale': pop(0, 1.1)}, color=WHITE, stroke=STROKE)
    return g
