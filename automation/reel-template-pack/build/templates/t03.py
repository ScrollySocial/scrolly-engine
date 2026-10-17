"""03 Before and after, v3.1 animated (2026-10-17), following the approved storyboard (build/storyboard_03.py).
Its own world: a real mint instant camera, a real instant photo, a real kitchen timer, a cork board with push pins and
label-maker tape. Big words: Corben Bold in mint (the camera's colour) with a black edge; buyers change that colour to
their brand. Small words: editable text on label-maker tape.

Beats: 1 through the lens (the before plays in the camera's lens, CapCut blurs the same clip behind); 2 the lens grows
to fill the screen; 3 the flash burst is the cut; 4 the work full screen, the giant see-through timer half off the
bottom with its dial turning; 5 the camera pushes in and pulls back, the after prints out of the slot dark; 6 it
develops (flipbook); 7 the after breaks out of its photo window; 8 the before photo held against the same spot
(then / NOW); 9 CTA on the cork: the before and after photos pinned, the camera prints the product, Comment "KEYWORD".

CapCut only blurs the background of its lowest (main) track, so the main track runs: before in the lens, the work,
the after in its photo, the after full screen, the cork. CapCut draws text above every image, so each word leaves
before an image passes over it."""
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from engine import Layers, rot_pt, interp, W, H, PX_PER_SIZE
import collage as C
import storyboard_03 as S

MINT, INK, TAPE_TEXT = S.MINT, S.INK, (236, 236, 232)
SPEC = dict(num='03', title='Before and after', subtitle='14.6 seconds. Four clips, filmed from the same spot.',
            font='corben', dir='03-before-and-after', folder='Template 03 - Before and after',
            project='Scrolly 03 Before and after', cover_at=1.0,
            slots=[('The before', 'The mess or problem, close and steady'),
                   ('Doing the work', 'Cleaning, fixing, applying: it plays sped up'),
                   ('The after', 'Start with your hand over the lens, then pull it away'),
                   ('Your product', 'The product in your hand, close up')],
            test_clips=[('IMG_1398', 0.5), ('IMG_1460', 2.0), ('IMG_1408', 0.5), ('IMG_1417', 0.5)])
END = 14.6
EDGE = (INK, 0.07)                  # the black edge on the big words (CapCut's 0 to 0.2 scale)

# ---- moving groups (same as 02) --------------------------------------------------------------------------------------------
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
        if len({round(v, 3) for _, v in kf[prop]}) == 1: kf[prop] = [kf[prop][0]] if prop != 'scale' or abs(kf[prop][0][1] - 1) > 1e-3 else []
    return kf

def art(g, name, img, T, z, p, r, xfs, k=1.0):
    g.art(name, img, T, z, p, r, motion(xfs, p, r, T, k))

def clip(g, slot, T, z, p, size, r, xfs, src=0.0, speed=1.0, **kw):
    g.clip(slot, T, z, p, size, r, motion(xfs, p, r, T), src=src, speed=speed, **kw)

def text(g, font, size, words, T, z, p, r, xfs, color=INK, stroke=None):
    g.text(font, size, words, T, z, p, r, motion(xfs, p, r, T), color=color, stroke=stroke)

def ease(a, b, t0, t1, n=4):
    """Eased (smooth start and stop) values from a to b between t0 and t1, as (t, value) steps."""
    return [(t0 + (t1 - t0) * i / n, a + (b - a) * (3 * (i / n) ** 2 - 2 * (i / n) ** 3)) for i in range(n + 1)]

# ---- the props, cut from her photos -------------------------------------------------------------------------------------------
def holed_camera(width):
    """The real camera with its lens disc cut open (the clip plays in the hole) and a thin dark glass rim."""
    cam, s = S.camera(width); full = S.shadow(cam); pad = (full.width - cam.width) // 2
    cx, cy, r = [v * s for v in S.CAM_LENS]; cx += pad; cy += pad
    a = full.split()[3]; ImageDraw.Draw(a).ellipse((cx - r, cy - r, cx + r, cy + r), fill=0); full.putalpha(a)
    rim = max(5, int(r / 20))
    ImageDraw.Draw(full).ellipse((cx - r, cy - r, cx + r, cy + r), outline=(12, 12, 14, 235), width=rim)
    return full, s

def lens_offset(s):
    """Where the lens centre sits relative to the camera image's centre, at camera scale s."""
    cam = S.prop('instant-camera')
    return ((S.CAM_LENS[0] - cam.width / 2) * s, (S.CAM_LENS[1] - cam.height / 2) * s)

def photo(width):
    """The real instant photo with its picture area open; returns the image (with shadow), the picture's size, and
    the picture centre's offset from the photo centre."""
    ph, (x0, y0, x1, y1) = S.instant_photo(None, width, window=True)
    return S.shadow(ph, (8, 14), 16, 95), (x1 - x0, y1 - y0), ((x0 + x1) / 2 - ph.width / 2, (y0 + y1) / 2 - ph.height / 2), ph.size

def strip_offset(width):
    """Centre of the photo's white writing strip, relative to the photo centre."""
    k = width / S.prop('instant-photo-blank').width; ph_h = S.prop('instant-photo-blank').height
    return (0, ((S.PHOTO_PIC[3] + ph_h) / 2 - ph_h / 2) * k)

def label_tape(words, px):
    """Blank label-maker tape (the real photo's cut ends kept, middle stretched) long enough for the longest words;
    the words themselves are editable CapCut text on top."""
    tape = S.prop('label-tape-black'); f = ImageFont.truetype(S.LABEL, px)
    tw = max(f.getlength(w) for w in words)
    h = int(px * 1.75); s = h / tape.height; tape = tape.resize((int(tape.width * s), h), Image.LANCZOS)
    end = int(h * 0.5); length = int(max(tw + 2 * px * 0.8, 2 * end + 10))
    out = Image.new('RGBA', (length, h), (0, 0, 0, 0))
    out.alpha_composite(tape.crop((0, 0, end, h)), (0, 0))
    out.alpha_composite(tape.crop((end, 0, tape.width - end, h)).resize((length - 2 * end, h)), (end, 0))
    out.alpha_composite(tape.crop((tape.width - end, 0, tape.width, h)), (length - end, 0))
    return C.shadow(out, offset=(4, 7), blur=6, alpha=90)

def label(g, key, words, c, rot, px, T, z, xfs):
    art(g, f'tape-{key}', label_tape(words, px), T, z, c, rot, xfs)
    text(g, 'arialbd', round(px / PX_PER_SIZE, 2), words, T, z, c, rot, xfs, color=TAPE_TEXT)

def big(g, words, c, px, T, z, xfs, rot=0):
    text(g, 'corben', round(px / PX_PER_SIZE, 2), words, T, z, c, rot, xfs, color=MINT, stroke=EDGE)

def timer_parts(scale=0.5):
    """The real kitchen timer split into its body (with the pointer) and its turning dial, see-through."""
    t = S.prop('kitchen-timer'); cx, cy, r = S.DIAL
    m = Image.new('L', t.size, 0); ImageDraw.Draw(m).ellipse((cx - r, cy - r, cx + r, cy + r), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(1))
    body, dial = t.copy(), t.copy()
    body.putalpha(Image.eval(Image.merge('L', [t.split()[3]]), lambda v: v).point(lambda v: v));
    body.putalpha(Image.composite(Image.new('L', t.size, 0), t.split()[3], m))
    dial.putalpha(Image.composite(t.split()[3], Image.new('L', t.size, 0), m)); dial = dial.crop((cx - r, cy - r, cx + r, cy + r))
    out = []
    for im in (body, dial):
        im = im.resize((int(im.width * scale), int(im.height * scale)), Image.LANCZOS)
        im.putalpha(im.split()[3].point(lambda v: int(v * 0.42))); out.append(im)
    return out[0], out[1], ((t.width / 2 - cx) * scale, (t.height / 2 - cy) * scale)

def glow(size=600, core=0.25):
    im = Image.new('RGBA', (size, size), (255, 255, 250, 0)); m = Image.new('L', (size, size), 0)
    c = size / 2; ImageDraw.Draw(m).ellipse((c - size * core, c - size * core, c + size * core, c + size * core), fill=255)
    im.putalpha(m.filter(ImageFilter.GaussianBlur(size * 0.12))); return im

def vignette():
    m = Image.new('L', (W // 4, H // 4), 0); ImageDraw.Draw(m).ellipse((-60, -40, W // 4 + 60, H // 4 + 40), fill=255)
    im = Image.new('RGBA', m.size, (20, 14, 10, 0)); im.putalpha(m.filter(ImageFilter.GaussianBlur(50)).point(lambda v: int((255 - v) * 0.55)))
    return im.resize((W, H), Image.BILINEAR)

def shadow_only(size, off=(0, 16), blur=20, alpha=110):
    pad = blur * 3; w, h = size
    m = Image.new('L', (w + 2 * pad, h + 2 * pad), 0); ImageDraw.Draw(m).rectangle((pad + off[0], pad + off[1], pad + w + off[0], pad + h + off[1]), fill=alpha)
    im = Image.new('RGBA', m.size, (0, 0, 0, 0)); im.putalpha(m.filter(ImageFilter.GaussianBlur(blur))); return im

# ---- the template ---------------------------------------------------------------------------------------------------------
def layers():
    g = Layers()

    # ===== 1 through the lens: the camera rises, the before plays in its lens, CapCut blurs it behind (0 to 1.95) =====
    cam1, s1 = holed_camera(1180); C1, R1 = (570, 1230), 8
    ox, oy = lens_offset(s1); L1 = rot_pt((C1[0] + ox, C1[1] + oy), C1, R1); d1 = int(2 * S.CAM_LENS[2] * s1) + 6
    cam_in = xf(C1, [(0, 0, 640, 1, 0), (0.3, 0, -24, 1, 0), (0.4, 0, 0, 1, 0)])
    # ===== 2 into the lens: the lens grows until the before fills the screen (1.95 to 2.45) =====
    Z = 1120 / (S.CAM_LENS[2] * s1)
    zoom = xf(L1, [(t, (540 - L1[0]) * f, (960 - L1[1]) * f, 1 + (Z - 1) * f ** 2, -R1 * f) for t, f in ease(0, 1, 1.95, 2.45, 5)])
    T1 = (0, 2.62)
    clip(g, 0, T1, 0, L1, (d1, d1), R1, [cam_in, zoom], blur_bg=True)
    art(g, 'camera-lens', cam1, T1, 20, C1, R1, [cam_in, zoom])
    big(g, ('before', 'before'), (540, 330), 190, (0.25, 1.95), 1, [pop_in((540, 330), 0.25), pop_out((540, 330), 1.72)])
    label(g, 'watch', ('WATCH THIS TRANSFORMATION', 'WATCH THIS TRANSFORMATION'), (540, 500), -2, 48, (0.45, 1.95), 60,
          [xf((540, 500), [(0.45, -1200, 0, 1, 0), (0.72, 20, 0, 1, 0), (0.8, 0, 0, 1, 0), (1.72, 0, 0, 1, 0), (1.9, 1300, 0, 1, 0)])])

    # ===== 3 snap: the flash bursts from the corner and whites out the screen; the cut lands on the white (2.42 to 2.9) =====
    fc = (120, 260)
    art(g, 'flash-burst', glow(), (2.42, 2.62), 40, fc, 0, [xf(fc, [(2.42, 0, 0, 0.3, 0), (2.62, 0, 0, 12, 0)])])
    whites = [(Image.new('RGBA', (W, H), (255, 255, 250, a)), (540, 960)) for a in (255, 255, 230, 190, 140, 90, 45)]
    g.flip('flash-white', [x for x in whites for _ in (0, 1)], 2.62, 40)

    # ===== 4 the work, full screen and sped up; the giant see-through timer turns along the bottom (2.62 to 5.6) =====
    T4 = (2.62, 5.6)
    g.clip(1, T4, 0, (540, 960), (W, H), src=0.0, speed=1.5)
    body, dial, boff = timer_parts(); k4 = 1700 / (2 * S.DIAL[2]) / 0.5
    dial_c = (540, H + 380); body_c = (dial_c[0] + boff[0] * k4, dial_c[1] + boff[1] * k4)
    t_in = xf(dial_c, [(2.7, 0, 900, 1, 0), (2.98, 0, -20, 1, 0), (3.06, 0, 0, 1, 0), (5.3, 0, 0, 1, 0), (5.48, 0, 900, 1, 0)])
    art(g, 'timer-body', body, (2.7, 5.5), 8, body_c, 0, [t_in], k4)
    art(g, 'timer-dial', dial, (2.7, 5.5), 9, dial_c, -90, [t_in, xf(dial_c, [(2.9, 0, 0, 1, 0), (5.25, 0, 0, 1, 90)])], k4)
    label(g, 'work', ('[CLEANING IT]', 'CLEANING IT'), (540, 260), -2, 56, (2.95, 5.3), 61,
          [pop_in((540, 260), 2.95, 1.12), pop_out((540, 260), 5.1)])

    # ===== 5 the camera pushes in and pulls back; the after prints out of the slot, still dark (5.3 to 6.95) =====
    cam5, s5 = S.camera(1300); cam5 = S.shadow(cam5, (0, 24), 26, 90)
    top5 = H - S.prop('instant-camera').height * s5 * 0.40
    C5 = (540, top5 + S.prop('instant-camera').height * s5 / 2)
    slot_cx = 540 + ((S.CAM_SLOT[0] + S.CAM_SLOT[2]) / 2 - S.prop('instant-camera').width / 2) * s5
    slot_y = top5 + S.CAM_SLOT[1] * s5 + 8
    push = xf(C5, [(5.3, 0, 1700, 2.6, 0), (5.55, 0, 960 - C5[1], 2.6, 0), (5.62, 0, 960 - C5[1], 2.6, 0),
                   (5.8, 0, 120, 1.15, 0), (5.92, 0, -10, 0.99, 0), (5.98, 0, 0, 1, 0), (6.95, 0, 0, 1, 0), (7.25, 0, 900, 1, 0)])
    art(g, 'camera-print', cam5, (5.3, 7.25), 20, C5, 0, [push])

    pw5 = int((S.CAM_SLOT[2] - S.CAM_SLOT[0]) * s5 * 0.96)
    ph5, pic5, poff5, phs5 = photo(pw5)
    P5 = (slot_cx, slot_y - phs5[1] * 0.86 + phs5[1] / 2)          # printed: 86 % of the photo out of the slot
    out_by = slot_y + phs5[1] / 2 - P5[1]                              # how far down it starts (hidden in the camera)
    printing = xf(P5, [(6.0, 0, out_by, 1, 0), (6.14, 0, out_by * 0.68, 1, 0), (6.24, 0, out_by * 0.68, 1, 0),
                       (6.38, 0, out_by * 0.34, 1, 0), (6.48, 0, out_by * 0.34, 1, 0), (6.68, 0, 0, 1, 0)])
    # ===== 6 it develops: the camera drops away, the photo lifts to the middle and the after comes up (6.95 to 8.3) =====
    P6, k6, R6 = (540, 860), 800 / pw5, 3
    lift = xf(P5, [(6.95, 0, 0, 1, 0), (7.22, P6[0] - P5[0], P6[1] - P5[1] - 20, k6 * 1.03, R6), (7.3, P6[0] - P5[0], P6[1] - P5[1], k6, R6)])
    # ===== 7 the after breaks out of its photo window (8.3 to 9.65) =====
    k7 = W * 0.94 / pw5; h7 = phs5[1] * k7; P7 = (540, H - 40 - h7 / 2)
    to7 = xf(P6, [(8.3, 0, 0, 1, 0), (8.5, P7[0] - P6[0], P7[1] - P6[1], k7 / k6, -R6)])
    drop = xf(P7, [(9.45, 0, 0, 1, 0), (9.65, 0, 1900, 1, 0)])
    group = [printing, lift, to7, drop]
    win5 = (P5[0] + poff5[0], P5[1] + poff5[1])
    T5 = (5.6, 9.65)
    clip(g, 2, T5, 0, win5, pic5, 0, group, src=0.0, blur_bg=True)
    art(g, 'vignette', vignette(), (5.6, 8.3), 5, (540, 960), 0, [])
    art(g, 'photo-after', ph5, T5, 10, P5, 0, group)
    dark = Image.new('RGBA', pic5, (52, 50, 52, 240))
    art(g, 'photo-dark', dark, (5.6, 7.3), 11, win5, 0, group)
    wx, wy, ws, wr = at(group, win5, 0, 7.3)
    develop = []
    for i, (a, tint) in enumerate([(232, (52, 50, 52)), (215, (62, 58, 60)), (190, (78, 72, 72)), (160, (98, 92, 88)),
                                   (128, (130, 124, 118)), (96, (170, 164, 156)), (64, (205, 200, 192)), (32, (230, 226, 220))]):
        im = Image.new('RGBA', (int(pic5[0] * ws), int(pic5[1] * ws)), tint + (a,))
        develop += [(im, (wx, wy))] * 3
    g.flip('develop', develop, 7.3, 11, rot=wr)

    # the after bursts up past the window's top and sides (above the frame), the main track's copy blurs behind
    px0 = P7[0] - phs5[0] * k7 / 2; py0 = P7[1] - h7 / 2
    pic_k = phs5[0] * k7 / S.prop('instant-photo-blank').width
    wx0, wx1, wy1 = px0 + S.PHOTO_PIC[0] * pic_k, px0 + S.PHOTO_PIC[2] * pic_k, py0 + S.PHOTO_PIC[3] * pic_k
    tall = (int(wx1 - wx0 + 80), int(wy1)); tall_c = ((wx0 + wx1) / 2, wy1 / 2)
    burst = xf((tall_c[0], wy1), [(8.55, 0, 0, 0.9, 0), (8.66, 0, 0, 1.04, 0), (8.74, 0, 0, 1, 0)])
    cover = xf(tall_c, [(9.45, 0, 0, 1, 0), (9.65, 540 - tall_c[0], 960 - tall_c[1], 1.32, 0)])
    T7 = (8.55, 9.65)
    art(g, 'breakout-shadow', shadow_only(tall), T7, 14, tall_c, 0, [burst, cover])
    clip(g, 2, T7, 15, tall_c, tall, 0, [burst, cover], src=8.55 - 5.6)
    big(g, ('after', 'after'), (540, (wy1 + P7[1] + h7 / 2) / 2 - 6), 170, (8.7, 9.42), 2,
        [pop_in((540, (wy1 + P7[1] + h7 / 2) / 2), 8.7), pop_out((540, (wy1 + P7[1] + h7 / 2) / 2), 9.24)])

    # ===== 8 then / NOW: the before photo slides in over the after, lined up with the same spot (9.65 to 11.35) =====
    T8 = (9.65, 11.6)
    g.clip(2, T8, 0, (540, 960), (W, H), src=9.65 - 5.6)
    pw8 = 660; ph8, pic8, poff8, phs8 = photo(pw8); P8 = (540, 900)
    win8 = (P8[0] + poff8[0], P8[1] + poff8[1])
    crop8 = ((win8[0] - pic8[0] / 2) / W, (win8[1] - pic8[1] / 2) / H, (win8[0] + pic8[0] / 2) / W, (win8[1] + pic8[1] / 2) / H)
    slide = xf(P8, [(9.65, -1100, 60, 1, -14), (9.9, 24, -6, 1, 1.5), (9.98, 0, 0, 1, 0)])
    # ...and on to the cork's left edge for the CTA
    PL, kL, RL = (100, 1000), 420 / pw8, -12
    pin_left = xf(P8, [(11.35, 0, 0, 1, 0), (11.6, PL[0] - P8[0], PL[1] - P8[1], kL, RL)])
    before_grp = [slide, pin_left]
    clip(g, 0, (9.65, END), 30, win8, pic8, 0, before_grp, src=0.0, crop=crop8)
    art(g, 'photo-then', ph8, (9.65, END), 31, P8, 0, before_grp)
    so8 = strip_offset(pw8)
    text(g, 'ink', round(pw8 * 0.11 / PX_PER_SIZE, 2), ('then', 'then'), (9.65, END), 3, (P8[0], P8[1] + so8[1]), 0, before_grp)
    label(g, 'now', ('NOW', 'NOW'), (850, 1560), 4, 72, (10.05, 11.3), 62, [pop_in((850, 1560), 10.05), pop_out((850, 1560), 11.1)])

    # ===== 9 CTA on the cork: then and now pinned, the camera prints the product (11.35 to the end) =====
    cork = S.cork()
    art(g, 'cork-in', cork, (11.35, 11.6), 28, (540, 960), 0, [xf((540, 960), [(11.35, 1100, 0, 1, 0), (11.6, 0, 0, 1, 0)])])
    g.art('cork', cork, (11.6, END), 0, (540, 960))
    PR, RR = (985, 1080), 10
    after_grp = [xf(PR, [(11.35, 1100, 0, 1, RR - 4), (11.6, -14, 0, 1, 1), (11.68, 0, 0, 1, 0)])]
    phR, picR, poffR, phsR = photo(420)
    clip(g, 2, (11.35, END), 32, (PR[0] + poffR[0], PR[1] + poffR[1]), picR, 0, [xf(PR, [(11.35, 0, 0, 1, RR)])] + after_grp, src=1.0)
    art(g, 'photo-now', phR, (11.35, END), 33, PR, RR, after_grp)
    soR = strip_offset(420)
    text(g, 'ink', round(420 * 0.11 / PX_PER_SIZE, 2), ('now', 'now'), (11.35, END), 4, rot_pt((PR[0], PR[1] + soR[1]), PR, RR), RR, after_grp)
    for key, c, rot, t0, col in (('l', PL, RL, 11.68, 'blue'), ('r', PR, RR, 11.78, 'white')):
        reach = phs8[1] * kL / 2 - 26 if key == 'l' else phsR[1] / 2 - 26
        pc = rot_pt((c[0], c[1] - reach), c, rot)
        pin = S.shadow(S.prop(f'pin-head-{col}').resize((96, 96), Image.LANCZOS), (12, 16), 8, 110)
        art(g, f'pin-{key}', pin, (t0, END), 34 + (key == 'r'), pc, 0, [xf(pc, [(t0, 0, -10, 1.8, 0), (t0 + .1, 0, 0, 0.92, 0), (t0 + .16, 0, 0, 1, 0)])])

    cam9, s9 = S.camera(980); cam9 = S.shadow(cam9, (0, 24), 26, 90)
    camh9 = S.prop('instant-camera').height * s9; top9 = H - camh9 * 0.48; C9 = (540, top9 + camh9 / 2)
    rise = xf(C9, [(11.75, 0, 800, 1, 0), (12.02, 0, -18, 1, 0), (12.1, 0, 0, 1, 0)])
    art(g, 'camera-cta', cam9, (11.75, END), 38, C9, 0, [rise])
    pw9 = int((S.CAM_SLOT[2] - S.CAM_SLOT[0]) * s9 * 0.96); ph9, pic9, poff9, phs9 = photo(pw9)
    slot9 = top9 + S.CAM_SLOT[1] * s9 + 8
    P9 = (540 + ((S.CAM_SLOT[0] + S.CAM_SLOT[2]) / 2 - S.prop('instant-camera').width / 2) * s9, slot9 - phs9[1] * 0.9 + phs9[1] / 2)
    by9 = slot9 + phs9[1] / 2 - P9[1]
    print9 = xf(P9, [(12.15, 0, by9, 1, 0), (12.3, 0, by9 * 0.66, 1, 0), (12.4, 0, by9 * 0.66, 1, 0), (12.55, 0, by9 * 0.33, 1, 0),
                     (12.65, 0, by9 * 0.33, 1, 0), (12.85, 0, 0, 1, 0)])
    clip(g, 3, (12.1, END), 36, (P9[0] + poff9[0], P9[1] + poff9[1]), pic9, 0, [rise, print9])
    art(g, 'photo-product', ph9, (12.1, END), 37, P9, 0, [rise, print9])
    label(g, 'want', ('WANT THE [PRODUCT]?', 'WANT THE VACUUM?'), (540, 190), -2, 56, (12.3, END), 63, [pop_in((540, 190), 12.3, 1.12)])
    big(g, ('Comment', 'Comment'), (540, 345), 150, (12.48, END), 5, [pop_in((540, 345), 12.48)])
    big(g, ('"[WORD]"', '"CLEAN"'), (540, 505), 150, (12.66, END), 6, [pop_in((540, 505), 12.66)])
    return g
