"""h2 Things I'm batty about (Halloween pack), approved 2026-10-18 as motion test v5 (build/motion_h2.py).
Same beats, built for CapCut:
 1 clip 1 full screen; a peppermint swirl of bats spirals out; "things I'm BATTY about" (solid lilac lettering)
 2 the dotted-night stage: her drawn branch slides in, a bat drops onto it, MY TOP 3
 3 favourite 1 seen through a bat-shaped hole in the night, which slides in and then zooms until the clip fills the
   screen (the night is one big sheet with a bat-shaped hole, scaled with keyframes: CapCut has no bat mask)
 4 favourite 1: number + ticket stub with its name; a crown and an arrow draw on
 5 a flock of bats flies across: the wipe to favourite 2 (number, ticket, heart)
 6 the bats swirl in, close, and swirl open onto favourite 3 (number, ticket, a bat flying, a burst)
 7 end screen: light-topped dotted night, the branch with three hanging bats over three video tiles; Comment BATTY
Built-in words (BATTY, MY TOP 3, numbers) are artwork; "[favourite N]" and the lines are editable Arial Bold."""
import math, random
from PIL import Image, ImageDraw, ImageChops
from engine import Layers, PX_PER_SIZE, W, H, wiggle, pop
import motion_h2 as M
D = M.D

SPEC = dict(num='h2', title="Things I'm batty about", subtitle='15 seconds. One clip to open, then your three favourites.',
            font='bodoni', dir='halloween/h2-batty-about', folder="Template h2 - Things I'm batty about",
            project="Scrolly h2 Things I'm batty about", cover_at=1.2,
            slots=[('Opening clip', 'You or your product, upright, a little movement'),
                   ('Favourite 1', 'Your number one: in use, or held up'),
                   ('Favourite 2', 'Your second favourite'),
                   ('Favourite 3', 'Your third favourite')],
            test_clips=[('IMG_1439', 1.0), ('IMG_1385', 0.5), ('IMG_1447', 0.3), ('IMG_1460', 1.0)])
END = M.END
INK, WHITE = M.INK, (255, 255, 255)
STROKE = (INK, 0.12)
def sz(px): return round(px / PX_PER_SIZE, 2)
_z = [100]
def nz():
    """A fresh track for each overlay (one track can't hold overlapping layers)."""
    _z[0] += 1; return _z[0]

def crop(im):
    bb = im.getbbox() or (0, 0, 2, 2); return im.crop(bb), ((bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2)

def layer(draw):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); draw(im); return crop(im)

def swirl_frame(t, closing=False, t0=0.0):
    """The bats of the peppermint swirl at time t (from motion_h2), on a clear layer."""
    def draw(im):
        th = 0.0
        if not closing:
            while th < 4.4 * math.pi:
                r0 = 40 + 60 * th; age = t * 2.2 - th / (4.4 * math.pi) * 0.6
                if age > 0:
                    r = r0 * (1 + 2.2 * M.ease(max(0, age - 0.7))); a = th + age * 1.2
                    x, y = W / 2 + r * math.cos(a), 960 + r * math.sin(a) * 1.15
                    if -150 < x < W + 150 and -150 < y < H + 150:
                        M.put(im, M.sized(M.FLY, 70 + r0 * 0.30, f'f{int(70 + r0 * 0.30)}'), (x, y), -math.degrees(a) - 90, shadow=False)
                th += 0.55 + 120 / (60 * th + 160)
        else:
            u = (t - t0) / 0.9; close = M.ease(u / 0.5) if u < 0.5 else 1 - M.ease((u - 0.5) / 0.5)
            while th < 4.6 * math.pi:
                r0 = 40 + 60 * th; r = r0 + (1 - close) * 1400; a = th + u * 5
                x, y = W / 2 + r * math.cos(a), 960 + r * math.sin(a) * 1.15
                if -150 < x < W + 150 and -150 < y < H + 150:
                    M.put(im, M.sized(M.FLY, 80 + r0 * 0.32, f'f{int(80 + r0 * 0.32)}'), (x, y), -math.degrees(a) - 90, shadow=False)
                th += 0.5 + 100 / (60 * th + 160)
    return layer(draw)

def flock_frame(t):
    def draw(im):
        u = (t - 5.8) / 0.7; r = random.Random(3)
        for i in range(34):
            y = r.uniform(-100, H + 100); w = r.uniform(180, 420); sp = r.uniform(0.9, 1.3)
            x = -400 + (W + 800) * M.clamp(u * sp - r.uniform(0, 0.25) + 0.15)
            M.put(im, M.sized(M.FLY, w, f'f{int(w)}'), (x, y + 30 * math.sin(t * 9 + i)), r.uniform(-15, 15), shadow=False)
    return layer(draw)

def doodle(g, name, key, c, t0, end, rot=0, dur=0.3):
    """Her doodle drawing itself on (a 6-frame wipe flipbook), then held."""
    d = M.DOO[key]; frames = []
    for i in range(1, 7):
        im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); D.draw_on(im, d, c, t0 + dur * i / 6 - 0.0001, t0, dur, rot)
        frames.append(crop(im))
    z = nz(); t1 = g.flip(f'{name}-on', frames, t0, z)
    full, fc = frames[-1]; g.art(name, full, (t1, end), z, fc, {'rot': wiggle(0.2, end - t1, 1.5, 0.5)})

def word_art(g, name, text, px, c, t0, end, rot=0):
    im = M.glossy(text, px).rotate(rot, expand=True, resample=Image.BICUBIC)
    g.art(name, im, (t0, end), nz(), c, {'scale': pop(0, 1.2)})

def ticket(g, k, y, t0, end, rot):
    tk = M.sized(M.TICKET, 620, 'tk620')
    g.art(f'ticket{k}', tk.rotate(rot, expand=True, resample=Image.BICUBIC), (t0, end), nz(), (540, y), {'y': [(0, y + 30), (0.35, y)], 'scale': pop(0, 1.1)})
    g.text('arialbd', sz(93), (f'[favourite {k}]', f'favourite {k}'), (t0 + 0.1, end), 90, (540 - 0.1 * 620, y), 0, {'scale': pop(0, 1.1)}, color=INK)

def bat_hole_sheet(hole_w=1180, size=(3800, 3000)):
    """The dotted night as one big sheet with a bat-shaped hole in the middle (favourite 1 shows through it)."""
    tile = M.BACKDROP.convert('RGB'); sheet = Image.new('RGB', size)
    for y in range(0, size[1], H):
        for x in range(0, size[0], W): sheet.paste(tile, (x, y))
    sheet = sheet.convert('RGBA'); bat = M.sized(M.FLY, hole_w, f'win{hole_w}').split()[3].point(lambda a: 255 if a > 100 else 0)
    hole = Image.new('L', size, 255); hole.paste(ImageChops.invert(bat), ((size[0] - bat.width) // 2, (size[1] - bat.height) // 2))
    sheet.putalpha(hole); return sheet

def layers():
    g = Layers()
    # 1 opening clip, swirl, BATTY (0 to 1.8)
    g.clip(0, (0, 1.8), 2, (540, 960), (W, H), src=0.0, speed=1.0)
    g.flip('swirl-out', [swirl_frame(i / 15) for i in range(27) for _ in range(2)], 0.0, 40)
    g.text('arialbd', sz(80), ("things I'm", "things I'm"), (0.15, 1.8), 90, (540, 640), 0, {'scale': pop(0, 1.15)}, color=WHITE, stroke=STROKE)
    word_art(g, 'batty-hook', 'BATTY', 122, (540, 820), 0.35, 1.8, -3)
    g.text('arialbd', sz(80), ('about', 'about'), (0.5, 1.8), 91, (540, 1010), 0, {'scale': pop(0, 1.15)}, color=WHITE, stroke=STROKE)
    doodle(g, 'sparkle1', 'sparkle', (170, 520), 1.0, 1.8); doodle(g, 'sparkle2', 'sparkle2', (900, 1200), 1.2, 1.8)

    # 2 the dotted-night stage: branch, bat, MY TOP 3 (1.8 to 3.0)
    g.art('night-2', M.BACKDROP, (1.8, 3.0), 1, (540, 960))
    br = M.sized(M.BRANCH, 1150, 'br')
    g.art('branch-2', br, (1.8, 3.0), 10, (640, 300), {'x': [(0, 480), (0.35, 640)]})
    g.art('hang-2', M.sized(M.HANG, 230, 'h230'), (2.05, 3.0), 11, (760, 470), {'scale': pop(0, 1.2), 'rot': wiggle(0.3, 0.9, 4, 0.5)})
    word_art(g, 'mytop', 'MY TOP', 112, (500, 960), 1.85, 3.1, -2); word_art(g, 'three', '3', 260, (500, 1200), 1.85, 3.1, 4)   # 1.2 s to read

    # 3 favourite 1 through the bat-shaped hole: slides in, then zooms until the clip fills the screen (3.0 to 4.0)
    g.clip(1, (3.0, 6.15), 2, (540, 960), (W, H), src=0.0, speed=1.0)
    sheet = bat_hole_sheet()
    xs = [(0.0, 1700), (0.33, 470), (0.45, 540), (0.6, 540)]
    g.art('bat-hole', sheet, (3.0, 4.0), 30, (1700, 900),
          {'x': xs, 'y': [(0.0, 900)], 'rot': [(0.0, -8), (0.55, 0)], 'scale': [(0.0, 1.0), (0.6, 1.0), (0.8, 2.6), (1.0, 6.0)]})

    # 4 favourite 1: number, ticket, crown, arrow (4.0 to 5.8)
    word_art(g, 'n1', '1', 240, (540, 1060), 4.2, 5.8, 6); ticket(g, 1, 1290, 4.3, 5.8, 2)
    doodle(g, 'crown', 'crown', (560, 870), 4.8, 5.8, 8); doodle(g, 'arrow', 'arrow', (800, 420), 5.0, 5.8, -25, 0.35)

    # 5 the flock wipes to favourite 2 (5.8 to 6.5), then favourite 2 (6.5 to 9.0)
    g.flip('flock', [flock_frame(5.8 + i / 30) for i in range(21)], 5.8, 45)
    g.clip(2, (6.15, 9.45), 2, (540, 960), (W, H), src=0.0, speed=1.0)
    word_art(g, 'n2', '2', 240, (540, 420), 6.6, 9.0, -6); ticket(g, 2, 650, 6.95, 9.0, -3)
    doodle(g, 'heart', 'heart', (850, 1150), 7.4, 9.0, -8, 0.35)

    # 6 the swirl closes and opens onto favourite 3 (9.0 to 9.9), then favourite 3 (9.9 to 12.0)
    g.flip('swirl-in', [swirl_frame(9.0 + i / 30, True, 9.0) for i in range(27)], 9.0, 45)
    g.clip(3, (9.45, 12.0), 2, (540, 960), (W, H), src=0.0, speed=1.0)
    word_art(g, 'n3', '3', 240, (540, 420), 10.0, 12.0, 6); ticket(g, 3, 650, 10.35, 12.0, 3)
    fx = [(i * 0.2, 860 - 40 * math.sin((9.9 + i * 0.2) * 2)) for i in range(11)]; fy = [(i * 0.2, 330 + 20 * math.sin((9.9 + i * 0.2) * 5)) for i in range(11)]
    g.art('bat-fly-3', M.sized(M.FLY, 230, 'f230'), (9.9, 12.0), 50, (860, 330), {'x': fx, 'y': fy, 'rot': wiggle(0, 2.1, 8, 0.8)})
    doodle(g, 'burst', 'burst', (200, 1180), 10.8, 12.0)

    # 7 end screen (12.0 to 15.0)
    g.art('night-end', M.BACKDROP_END, (12.0, END), 1, (540, 960))
    g.art('branch-end', br, (12.0, END), 10, (600, 260))
    for j, (x, slot) in enumerate(((230, 1), (540, 2), (850, 3))):
        t0 = 12.05 + j * 0.15
        g.art(f'hang-end{j}', M.sized(M.HANG, 170, 'h170'), (t0, END), 11 + j, (x, 410), {'scale': pop(0, 1.2), 'rot': wiggle(0.3, 2.9, 3, 0.7)})
        g.clip(slot, (t0, END), 20 + j, (x, 720), (270, 400), (-3, 2, 4)[j], {'scale': pop(0, 1.15)}, src=0.5, speed=1.0)
        word_art(g, f'n-end{j}', str(j + 1), 110, (x, 960), 12.3 + j * 0.15, END, (-6, 4, 6)[j])
    g.text('arialbd', sz(80), ('comment', 'comment'), (12.3, END), 90, (540, 1100), 0, {'scale': pop(0, 1.15)}, color=WHITE, stroke=STROKE)
    g.art('batty-cta', M.glossy('BATTY', 122).rotate(-3, expand=True, resample=Image.BICUBIC), (12.45, END), 72, (540, 1240), {'scale': pop(0, 1.2)})
    g.text('arialbd', sz(60), ("and I'll send all 3 links", "and I'll send all 3 links"), (12.2, END), 91, (540, 1455), 0,
           {'scale': pop(0, 1.15)}, color=WHITE, stroke=STROKE)
    doodle(g, 'arrow2', 'arrow2', (150, 1100), 12.7, END); doodle(g, 'under', 'under', (540, 1372), 12.9, END)
    return g
