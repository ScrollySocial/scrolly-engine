"""h6 Once in a blood moon (Halloween pack), approved 2026-10-17 as the motion test build/motion_h6.py (v4 + wolf centred)
and checked in her CapCut. FULLY EDITABLE build (2026-10-20, build/editable.py): every element sits where she approved
it (the wolf, the moons, the words); only how it is built changed.
The buyer's video stays full screen; words pop in; the night closes in on clip 1 into a circle that becomes the moon,
the moon turns blood red, it opens like a window onto clip 2, the wolf rises with its own moon, a huge tree sweeps past
as the wipe to clip 3, a bat drops onto a branch, then the CTA "Comment MOON".
Editable: every word is CapCut text (Bodoni Moda key words in the accent red, letter by letter for "blood moon";
the small lines in Montserrat, cream with a shadow; [SALE], [30% off], [this weekend only], [Oct 29-31], [MOON]);
the night colour is CapCut's Background > Colour under a colourless night-sky layer (the photo's stars and shading
without its colour), so a buyer can make the night any colour.
CapCut limits: the iris (2.2-3.2 s) and the moon window (5.0-6.0 s) are a night-sky sheet with a round hole that
scales over the clip, so that sheet is a picture in the default night blue (recolour it with Adjust > HSL to match a
new background colour); the moon going red is a short flipbook of the moon only (CapCut can't fade one picture into
another without opacity keyframes); the moons, clouds, tree, wolf, bats and branch are real photos (HSL to recolour).
No doodles: the approved layout had none, and nothing is added to an approved template."""
from PIL import Image, ImageDraw, ImageFilter
from engine import W, H, wiggle
import editable as Ed
from editable_halloween import kf, popk, tone_overlay
import storyboard_halloween as B

RED, CREAM = (232, 92, 60), (246, 238, 222)     # RED is the accent: buyers change it to their brand colour
SPEC = dict(num='h6', title='Once in a blood moon', subtitle='14 seconds. Three clips: your product, you, your product again.',
            font='bodoni', dir='halloween/h6-once-in-a-blood-moon', folder='Template h6 - Once in a blood moon',
            project='h6 Once in a blood moon', cover_at=1.6,
            slots=[('Your product, close up', 'Hold it up or show it in use, upright'),
                   ('You, or your shop', 'Reaching for it, packing, working: some movement'),
                   ('Your product again', 'A texture or detail shot')],
            test_clips=[('IMG_1439', 1.0), ('IMG_1385', 0.5), ('IMG_1447', 0.3)])
END = 14.0
SKY = B.night_sky()
STAGE = tuple(int(sum(c) / len(c)) for c in zip(*SKY.convert('RGB').resize((32, 32)).getdata()))   # the night blue

def night_sheet(hole_r=600, size=3400):
    """A big night-sky sheet with a round hole in the middle: scaled up or down, it opens or closes on the video."""
    sky = SKY.resize((size, size)); m = Image.new('L', (size, size), 255)
    ImageDraw.Draw(m).ellipse((size / 2 - hole_r, size / 2 - hole_r, size / 2 + hole_r, size / 2 + hole_r), fill=0)
    sky.putalpha(m.filter(ImageFilter.GaussianBlur(3))); return sky

def faded(im, a):
    out = im.copy(); out.putalpha(out.split()[3].point(lambda v: int(v * a))); return out

def reel():
    r = Ed.Reel([], END)
    MOON = B.moon_disc(1000); BLOOD = B.blood(MOON)
    cl = B.clouds(1800); tree = B.fit_w(B.src('Twisted Haunted Tree Silhouette.png').convert('RGBA'), 2800)
    wolf = B.fit_w(B.white_on_clear('Howling Wolf Silhouette.png', (14, 10, 16)), 430)
    bat = B.cut('Cute Kawaii Bat with Spread Wings.png'); hang = B.fit_w(B.cut('Cute Upside-Down Wrapped Bat.png'), 230)
    branch = B.fit_w(B.cut('Cute Twisted Spooky Tree Branch.png'), 900)
    sheet = night_sheet(); HOLE = 600
    def art(name, img, t, z, pos, tracks=None, rot=0.0):
        r.art(name, img, t[0], t[1], z, kf(pos, t[0], rot, **(tracks or {})))
    def say(font, px, words, t, pos, tracks, color, z=None):
        """Bodoni key words keep her approved size; the small lines are Montserrat (px * 0.85, as editable.plain)."""
        f = kf(pos, t[0], **tracks)
        if font == 'bodoni': r.text('bodoni', px, words, t[0], t[1], f, color, shadow=True)
        else: r.text('montserrat', px * 0.85, words, t[0], t[1], f, color, shadow=True)

    # the night: CapCut's background colour + the sky's stars and shading as a colourless layer (z=1, lowest picture)
    tone, _ = tone_overlay(SKY, STAGE)
    r.art('night-sky', tone, 0, None, 1, Ed.still(540, 960))

    # ===== 1 clip 1 full screen, the hook slams in (0 to 3.2) =====
    shake = {'x': [(0, 540), (1.2, 540)] + [(1.2 + i * 0.04, 540 + (14 if i % 2 else -14) * (1 - i / 6)) for i in range(1, 7)] + [(1.5, 540)]}
    r.clip(0, 0, 3.2, 2, kf((540, 960), 0, **shake), speed=1.15)
    for k, (w, x) in enumerate((('once', 290), ('in', 580), ('a', 770))):
        t0 = k * 0.2
        say('bodoni', 150, w, (t0, 2.45), (x, 360), {'scale': [(0, 2.6), (0.18, 1.0)]}, CREAM)
    font = B.F(B.SERIF, 270); d = ImageDraw.Draw(Image.new('L', (4, 4)))
    for row, (word, y, t0) in enumerate((('blood', 610, 0.55), ('moon', 860, 0.85))):
        x = W / 2 - d.textlength(word, font=font) / 2
        for i, ch in enumerate(word):
            cw = d.textlength(ch, font=font); ts = t0 + i * 0.06
            say('bodoni', 270, ch, (ts, 2.45), (x + cw / 2, y),
                {'scale': popk(0, 1.25), 'rot': [(0, 28 if i % 2 else -28), (0.28, 0)],
                 'y': [(0, y)] + [(0.6 + j * 0.25, y + (6 if j % 2 else -6)) for j in range(6)]}, RED)
            x += cw

    # ===== 2 the night closes in on the clip into a circle; the circle becomes the moon (2.2 to 3.2) =====
    c = (540, 1140)
    art('night-close', sheet, (2.2, 3.2), 50, (540, 960), {'scale': [(0, 1150 / HOLE), (0.5, 700 / HOLE), (0.75, 540 / HOLE), (0.9, 492 / HOLE), (1.0, 488 / HOLE)],
                                                          'y': [(0, 960), (0.5, 1090), (0.75, 1130), (1.0, c[1])]})
    for a in range(1, 7):   # the moon fades in inside the circle (6 frames of the moon only)
        art(f'moon-in-{a}', faded(MOON, a / 6), (2.75 + (a - 1) / 30, 2.75 + a / 30), 40, c)
    art('moon-hold', MOON, (2.75 + 6 / 30, 3.2), 41, c)

    # ===== 3 graphics break: the moon turns blood red, clouds drift; "our once-a-year SALE" (3.2 to 5.0) =====
    for i in range(10):     # the moon reddens (a flipbook of the moon only, 4 frames per step)
        art(f'moon-red-{i}', Image.blend(MOON, BLOOD, 0.3 + 0.7 * i / 9), (3.2 + i * 4 / 30, 3.2 + (i + 1) * 4 / 30), 5, c)
    t = 3.2 + 40 / 30
    art('blood-3', BLOOD, (t, 5.0), 5, c)
    art('cloud-a', B.fit_w(cl, 1620), (3.2, 5.0), 8, (-300, 1650), {'x': [(0, -300), (1.8, 200)]})
    art('cloud-b', B.fit_w(cl, 1440).rotate(180), (3.2, 5.0), 9, (1350, 700), {'x': [(0, 1350), (1.8, 850)]})
    say('m', 66, 'our once-a-year', (3.45, 5.0), (540, 350), {'scale': popk(0, 1.15)}, CREAM)
    say('bodoni', 210, ('[SALE]', 'SALE'), (3.85, 5.0), (540, 500), {'scale': popk(0, 1.2)}, RED)

    # ===== 4 the moon opens like a window onto clip 2 (5.0 to 6.0), clip 2 full screen until the tree passes =====
    r.clip(1, 5.0, 8.8, 2, Ed.still(540, 960), speed=1.15)
    art('night-open', sheet, (5.0, 6.0), 50, (540, c[1]), {'scale': [(0, 500 / HOLE), (1.0, 2600 / HOLE)], 'y': [(0, c[1]), (1.0, 960)]})

    # ===== 5 the wolf rises with its own blood moon; the deal (6.0 to 8.4) =====
    mc = (360, 1420)                     # low and to the left, as approved in v4; the wolf centred on it
    small = B.fit_w(BLOOD, 620)
    art('wolf-moon', small, (6.3, 8.4), 10, mc, {'y': [(0, mc[1] + 900), (0.3, mc[1] - 30), (0.42, mc[1])]})
    wy = mc[1] + 290 - wolf.height / 2
    art('wolf', wolf, (6.3, 8.4), 11, (mc[0], wy), {'y': [(0, wy + 900), (0.3, wy - 30), (0.42, wy)]})
    say('m', 66, 'everything', (6.5, 8.4), (540, 350), {'scale': popk(0, 1.15)}, CREAM)
    say('bodoni', 210, ('[30% off]', '30% off'), (6.9, 8.4), (540, 500), {'scale': popk(0, 1.2)}, RED)

    # ===== 6 a huge tree sweeps past the lens: the wipe to clip 3 (8.4 to 9.2) =====
    art('tree', tree, (8.4, 9.2), 55, (W + tree.width / 2, -300 + tree.height / 2),
        {'x': [(0, W + tree.width / 2), (0.8, -tree.width / 2)]})
    r.clip(2, 8.8, 11.4, 3, Ed.still(540, 960), speed=1.15)

    # ===== 7 clip 3: a branch slides in, a bat drops onto it; the dates (9.2 to 11.4) =====
    bx = W - 760 + branch.width / 2; by = branch.height / 2
    art('branch', branch, (9.25, 11.4), 20, (bx, by), {'x': [(0, bx + 900), (0.35, bx)]})
    col = branch.split()[3].crop((int(W - 300 - (W - 760)) - 6, 0, int(W - 300 - (W - 760)) + 6, branch.height))
    feet = max((y for y in range(col.height) if col.getpixel((6, y)) > 120), default=branch.height // 2) - 14
    art('bat-hang', hang, (9.6, 11.4), 21, (W - 300, feet + hang.height / 2), {'scale': popk(0, 1.2), 'rot': wiggle(0.4, 1.8, 4, 1.2)})
    say('m', 66, ('[this weekend only]', 'this weekend only'), (9.4, 11.4), (500, 1180), {'scale': popk(0, 1.15)}, CREAM)
    say('bodoni', 170, ('[Oct 29-31]', 'Oct 29-31'), (9.8, 11.4), (500, 1330), {'scale': popk(0, 1.2)}, RED)

    # ===== 8 CTA: the blood moon, bats, Comment MOON (11.4 to 14); the night is the background colour again =====
    art('blood-8', BLOOD, (11.4, END), 5, c)
    art('cloud-8', B.fit_w(cl, 1530), (11.4, END), 8, (540, 1720), {'x': wiggle(0, 2.6, 60, 2.0, 540)})
    for i, (x, y, w) in enumerate(((210, 560, 260), (880, 470, 220))):
        art(f'bat-cta-{i}', B.fit_w(bat, w), (11.5 + i * 0.15, END), 10 + i, (x, y), {'scale': popk(0, 1.2), 'rot': wiggle(0.4, 2.4, 8, 0.5)})
    say('m', 70, 'comment', (11.6, END), (540, 1000), {'scale': popk(0, 1.15)}, CREAM)
    say('bodoni', 240, ('[MOON]', 'MOON'), (11.95, END), (540, 1170), {'scale': popk(0, 1.2)}, CREAM)
    say('m', 66, 'for your code', (12.4, END), (540, 1340), {'scale': popk(0, 1.15)}, CREAM)
    return r

def layers():
    return reel().L
