"""h2 Things I'm batty about (Halloween pack), approved 2026-10-18 as motion test v5 (build/motion_h2.py).
FULLY EDITABLE build (2026-10-20, build/editable.py), same beats and timings:
 1 clip 1 full screen; a peppermint swirl of bats spirals out; "things I'm BATTY about"
 2 the dotted-night stage: her drawn branch slides in, a bat drops onto it, MY TOP 3
 3 favourite 1 seen through a bat-shaped hole in the night, which slides in and then zooms until the clip fills the
   screen (the night is one big sheet with a bat-shaped hole, scaled with keyframes: CapCut has no bat mask)
 4 favourite 1: number + ticket stub with its name; a crown and an arrow pop on
 5 a flock of bats flies across: the wipe to favourite 2 (number, ticket, heart)
 6 the bats swirl in, close, and swirl open onto favourite 3 (number, ticket, a bat flying, a burst)
 7 end screen: light-topped dotted night, the branch with three hanging bats over three video tiles; Comment BATTY
Editable: every word is CapCut text. BATTY, MY TOP, 3 and the numbers are Corben Bold (CapCut's own library font,
bundled) in solid lilac with a thick ink outline and shadow, the closest match buyers can edit to the approved
lettering (Goudy Stout, a Windows font we can't ship); the lines and the [favourite N] names on the tickets are
Montserrat. The sparkles, crown, arrows, heart, burst and underline are Scrolly Doodles letters (recolour like text).
The night's colour is CapCut's Background > Colour (default purple) under a colourless layer of her hand-painted
dots; the end screen's light top is a white wash over the same colour.
CapCut limits: the bat-shaped hole (3.0-4.0 s) is a picture of the night with a bat cut out, in the default purple
(recolour it with Adjust > HSL to match a new background colour); the doodles pop on instead of drawing themselves;
the bats of the swirls and the flock are separate bat pictures on keyframes (one layer per bat)."""
import math, random
from PIL import Image, ImageChops, ImageOps
from engine import W, H, wiggle
import editable as Ed
from editable import at
from editable_halloween import kf, popk
import motion_h2 as M

SPEC = dict(num='h2', title="Things I'm batty about", subtitle='15 seconds. One clip to open, then your three favourites.',
            font='corben', dir='halloween/h2-batty-about', folder="Template h2 - Things I'm batty about",
            project="h2 Things I'm batty about", cover_at=1.2,
            slots=[('Opening clip', 'You or your product, upright, a little movement'),
                   ('Favourite 1', 'Your number one: in use, or held up'),
                   ('Favourite 2', 'Your second favourite'),
                   ('Favourite 3', 'Your third favourite')],
            test_clips=[('IMG_1439', 1.0), ('IMG_1385', 0.5), ('IMG_1447', 0.3), ('IMG_1460', 1.0)])
END = M.END
INK, WHITE, LILAC = M.INK, (255, 255, 255), M.LILAC
FILL = (200, 160, 216)                 # motion_h2.glossy's solid lilac
STAGE = (92, 66, 112)                  # the night's dot colour; the ground is this colour darkened by the dot layer
BAT_Z = 200                            # the swirl, flock and swirl-in bats share these tracks (never on screen together)

def dots_tile():
    g = ImageOps.grayscale(Image.open(M.LIB / 'doodles' / 'Playful hand-painted dots on black-13.png')).resize((720, 720))
    tile = Image.new('L', (W, H))
    for y in range(0, H, 720):
        for x in range(0, W, 720): tile.paste(g, (x, y))
    return tile

def night_layers():
    """The dot layer (black ground at 75%, the dots clear, so they show the background colour) and the end screen's
    light top (a white wash, lighter on the dots), both colourless."""
    tile = dots_tile()
    ground = Image.new('RGBA', (W, H), (0, 0, 0, 255)); ground.putalpha(ImageOps.invert(tile).point(lambda v: int(v * 0.75)))
    m = Image.new('L', (1, H)); mp = m.load()
    for y in range(H): mp[0, y] = int(255 * (1 - M.ease((y - 820) / 260)))
    m = m.resize((W, H)); amt = tile.point(lambda v: int(209 + 21 * v / 255))     # 0.82 on the ground, 0.9 on the dots
    wash = Image.new('RGBA', (W, H), (255, 255, 255, 255)); wash.putalpha(ImageChops.multiply(amt, m))
    return ground, wash

def bat_hole_sheet(hole_w=1180, size=(3800, 3000)):
    """The dotted night as one big sheet with a bat-shaped hole in the middle (favourite 1 shows through it)."""
    tile = M.BACKDROP.convert('RGB'); sheet = Image.new('RGB', size)
    for y in range(0, size[1], H):
        for x in range(0, size[0], W): sheet.paste(tile, (x, y))
    sheet = sheet.convert('RGBA'); bat = M.sized(M.FLY, hole_w, f'win{hole_w}').split()[3].point(lambda a: 255 if a > 100 else 0)
    hole = Image.new('L', size, 255); hole.paste(ImageChops.invert(bat), ((size[0] - bat.width) // 2, (size[1] - bat.height) // 2))
    sheet.putalpha(hole); return sheet

def reel():
    r = Ed.Reel([], END)
    ground, wash = night_layers()
    r.art('night-dots', ground, 0, None, 1, Ed.still(540, 960))
    def word(text, px, t0, end, c, rot):
        """Built-in lettering: Corben Bold, solid lilac, thick ink edge, popping in (motion_h2.pop_word)."""
        r.text('corben', px, (text, text), t0, end, kf(c, t0, -rot, scale=popk(0, 1.2)), FILL, stroke=(INK, 0.1), shadow=True)
    def line(text, px, t0, end, c, test=None):
        r.plain(text, px, t0, end, kf(c, t0, scale=popk(0, 1.15)), WHITE, INK, test=test)
    def doodle(kind, i, px, c, t0, end, color, rot=0):
        r.doodle(kind, i, px, t0, end, Ed.pop_in(c[0], c[1], t0, -rot, 0.3), color)
    def ticket(k, y, t0, end, rot):
        tk = M.sized(M.TICKET, 620, 'tk620'); f = kf((540, y), t0, -rot, y=[(0, y + 30), (0.35, y)], scale=popk(0, 1.1))
        r.art(f'ticket{k}', tk, t0, end, 60 + k, f)
        r.plain(f'[favourite {k}]', 93, t0 + 0.1, end, Ed.child(f, (-0.1 * 620, 0)), INK, test=f'favourite {k}')

    # bats as separate pictures on keyframes ---------------------------------------------------------------------------
    def bat(n, w, a, b, f):
        r.art(f'bat-{a:.1f}-{n}', M.sized(M.FLY, w, f'f{int(w)}'), a, b, BAT_Z + n, f)
    th, n = 0.0, 0                     # 1 the peppermint swirl spirals out (0 to 1.8)
    while th < 4.4 * math.pi:
        r0 = 40 + 60 * th
        def f(ts, th=th, r0=r0):
            age = ts * 2.2 - th / (4.4 * math.pi) * 0.6
            if age <= 0: return at(W / 2 + r0 * math.cos(th), 960 + r0 * math.sin(th) * 1.15, 0.0)
            rr = r0 * (1 + 2.2 * M.ease(max(0, age - 0.7))); a = th + age * 1.2
            return at(W / 2 + rr * math.cos(a), 960 + rr * math.sin(a) * 1.15, Ed.back_out(min(1, age / 0.15), 1.5), -math.degrees(a) - 90)
        bat(n, 70 + r0 * 0.30, 0.0, 1.8, f); n += 1
        th += 0.55 + 120 / (60 * th + 160)
    rnd = random.Random(3)            # 5 the flock (5.8 to 6.5), same draws as motion_h2.flock_frame
    for i in range(34):
        y = rnd.uniform(-100, H + 100); w = rnd.uniform(180, 420); sp = rnd.uniform(0.9, 1.3); off = rnd.uniform(0, 0.25); ro = rnd.uniform(-15, 15)
        def f(ts, y=y, sp=sp, off=off, ro=ro, i=i):
            u = (ts - 5.8) / 0.7; x = -400 + (W + 800) * M.clamp(u * sp - off + 0.15)
            return at(x, y + 30 * math.sin(ts * 9 + i), 1.0, ro)
        bat(i, w, 5.8, 6.5, f)
    th, n = 0.0, 0                     # 6 the swirl closes over favourite 2 and opens onto favourite 3 (9.0 to 9.9)
    while th < 4.6 * math.pi:
        r0 = 40 + 60 * th
        def f(ts, th=th, r0=r0):
            u = (ts - 9.0) / 0.9; close = M.ease(u / 0.5) if u < 0.5 else 1 - M.ease((u - 0.5) / 0.5)
            rr = r0 + (1 - close) * 1400; a = th + u * 5
            return at(W / 2 + rr * math.cos(a), 960 + rr * math.sin(a) * 1.15, 1.0, -math.degrees(a) - 90)
        bat(n, 80 + r0 * 0.32, 9.0, 9.9, f); n += 1
        th += 0.5 + 100 / (60 * th + 160)

    # 1 opening clip, BATTY (0 to 1.8)
    r.clip(0, 0, 1.8, 2, Ed.still(540, 960))
    line("things I'm", 80, 0.15, 1.8, (540, 640))
    word('BATTY', 190, 0.35, 1.8, (540, 820), -3)
    line('about', 80, 0.5, 1.8, (540, 1010))
    doodle('icon', 9, 190, (170, 520), 1.0, 1.8, WHITE); doodle('icon', 11, 220, (900, 1200), 1.2, 1.8, LILAC)

    # 2 the dotted-night stage: branch, bat, MY TOP 3 (1.8 to 3.0)
    br = M.sized(M.BRANCH, 1150, 'br')
    r.art('branch-2', br, 1.8, 3.0, 10, kf((640, 300), 1.8, x=[(0, 480), (0.35, 640)]))
    r.art('hang-2', M.sized(M.HANG, 230, 'h230'), 2.05, 3.0, 11, kf((760, 470), 2.05, scale=popk(0, 1.2), rot=wiggle(0.3, 0.9, 4, 0.5)))
    word('MY TOP', 165, 1.85, 3.1, (500, 960), -2); word('3', 360, 1.85, 3.1, (500, 1200), 4)   # 1.2 s to read

    # 3 favourite 1 through the bat-shaped hole: slides in, then zooms until the clip fills the screen (3.0 to 4.0)
    r.clip(1, 3.0, 6.15, 2, Ed.still(540, 960))
    xs = [(0.0, 1700), (0.33, 470), (0.45, 540), (0.6, 540)]
    r.art('bat-hole', bat_hole_sheet(), 3.0, 4.0, 30,
          kf((1700, 900), 3.0, x=xs, y=[(0.0, 900)], rot=[(0.0, -8), (0.55, 0)], scale=[(0.0, 1.0), (0.6, 1.0), (0.8, 2.6), (1.0, 6.0)]))

    # 4 favourite 1: number, ticket, crown, arrow (4.0 to 5.8)
    word('1', 300, 4.2, 5.8, (540, 1070), 6); ticket(1, 1290, 4.3, 5.8, 2)
    doodle('icon', 5, 230, (560, 870), 4.8, 5.8, LILAC, 8); doodle('arrow', 2, 300, (800, 420), 5.0, 5.8, WHITE, -25)

    # 5 favourite 2 (6.15 to 9.0)
    r.clip(2, 6.15, 9.45, 3, Ed.still(540, 960))
    word('2', 300, 6.6, 9.0, (540, 465), -6); ticket(2, 650, 6.95, 9.0, -3)   # numbers kept clear of Instagram's top bar
    doodle('icon', 2, 230, (850, 1150), 7.4, 9.0, LILAC, -8)

    # 6 favourite 3 (9.45 to 12.0)
    r.clip(3, 9.45, 12.0, 2, Ed.still(540, 960))
    word('3', 300, 10.0, 12.0, (540, 465), 6); ticket(3, 650, 10.35, 12.0, 3)
    def flyer(ts): return at(860 - 40 * math.sin(ts * 2), 330 + 20 * math.sin(ts * 5), 1.0, 8 * math.sin(ts * 4))
    r.art('bat-fly-3', M.sized(M.FLY, 230, 'f230'), 9.9, 12.0, 50, flyer)
    doodle('burst', 0, 260, (200, 1180), 10.8, 12.0, LILAC)

    # 7 end screen (12.0 to 15.0): the light top over the same night colour
    r.art('night-light-top', wash, 12.0, None, 5, Ed.still(540, 960))
    r.art('branch-end', br, 12.0, None, 10, Ed.still(600, 260))
    for j, (x, slot) in enumerate(((230, 1), (540, 2), (850, 3))):
        t0 = 12.05 + j * 0.15
        r.art(f'hang-end{j}', M.sized(M.HANG, 170, 'h170'), t0, None, 11 + j, kf((x, 410), t0, scale=popk(0, 1.2), rot=wiggle(0.3, 2.9, 3, 0.7)))
        r.clip(slot, t0, None, 20 + j, kf((x, 720), t0, (-3, 2, 4)[j], scale=popk(0, 1.15)), size=(270, 400), src=0.5)
        word(str(j + 1), 150, 12.3 + j * 0.15, None, (x, 960), (-6, 4, 6)[j])
    line('comment', 80, 12.3, None, (540, 1100))
    word('BATTY', 190, 12.45, None, (540, 1240), -3)
    line("and I'll send all 3 links", 60, 12.2, None, (540, 1455))
    doodle('arrow', 0, 250, (150, 1100), 12.7, None, LILAC); doodle('under', 3, 520, (540, 1372), 12.9, None, LILAC)
    return r

def layers():
    return reel().L
