"""The cover of each template (build/covers.py draws them): one function per template, cNN() -> covers.Cover.
The buyer's clip fills every cover (a placeholder card until they swap it in); the template's own world (its real
props, doodles, accent colour and built-in words) sits on top, with every word and the hero inside the grid's 3:4 band
(covers.SAFE). Kept apart from build/templates/tNN.py so cover work never touches a template another session is
rebuilding. Never import motion_h5 / templates.th5 here: importing them pulls clip frames with ffmpeg."""
import random
from PIL import Image, ImageDraw, ImageFont
from covers import Cover, WHITE, INK
import editable as Ed
import engine as E

# templates whose module can't be imported here (it runs ffmpeg on import): the bits covers.py needs
SPECS = {'h5': dict(num='h5', title='Trick or treat', dir='halloween/h5-trick-or-treat')}


def c24():
    """24 Make it last: "make it LAST" over the product, the real calendar page on "year 3" (ringed) in the lower
    corner, butter sparkles."""
    import templates.t24 as T, motion_24 as M
    cv = Cover(M.BUTTER); cv.video(0, 'Your product', (640, 960))
    sheet, (cw, ch) = T.sheets(); k = 0.46; c, r = (300, 1350), -8
    cv.art('calendar', sheet, c, rot=r, scale=k, hero=True)
    o = Ed.rot((0, -0.38 * ch * k), r); lab = (c[0] + o[0], c[1] + o[1])
    cv.serif('year 3', 120 * k * 1.15, lab, M.WINE, WHITE, rot=r)
    cv.doodle('frame', 0, 300, (lab[0], lab[1] + 4), M.WINE, rot=r)
    cv.serif('make it', 160, (500, 430), WHITE, M.WINE, rot=-3)
    cv.serif('LAST', 270, (560, 620), WHITE, M.WINE, rot=-3)
    for i, (x, y, s) in enumerate([(160, 380, 130), (930, 470, 110), (820, 1500, 130)]):
        cv.doodle('icon', 8, s, (x, y), M.BUTTER, WHITE, rot=(-12, 10, -6)[i])
    return cv


def c02():
    """02 Pack an order with me: the clip is a photo taped down: blue dotted washi over two corners, the title on the
    butter gingham washi strip, the shipping label slapped on the lower corner."""
    import templates.t02 as T, collage as C
    from engine import rot_pt, PX_PER_SIZE
    cv = Cover(T.BUTTER); cv.video(0, 'Picking the order', (440, 960))
    for (x, y, rr, sd) in ((90, 300, -40, 8), (990, 1640, -40, 9)):
        cv.art(f'corner-tape{sd}', C.washi(420, 120, 'dots', (T.BLUE, WHITE), seed=sd, alpha=240), (x, y), rot=rr)
    tape = C.washi(940, 280, 'gingham', (T.BUTTER, WHITE), seed=17, alpha=250); tc = (540, 470); tr = -3
    cv.art('title-tape', tape, tc, rot=tr)
    def on(dy): o = Ed.rot((0, dy), tr); return (tc[0] + o[0], tc[1] + o[1])
    cv.plain('pack an order', 70, on(-62), INK, rot=tr)
    cv.serif('with me', 160, on(42), T.ACCENT, rot=tr)
    lw = 330; k = lw / 520; lh = int(780 * k); lc = (800, 1350); lr = 7
    cv.art('label', C.shadow(C.ship_label().resize((lw, lh)), (6, 10), 10, 80), lc, rot=lr, hero=True)
    for y, px, words, test, *_ in T.LABEL_FIELDS[:3]:   # editable fields, placed as t02.label
        size = round(px * 0.8 * k / PX_PER_SIZE, 2)
        p = T.letters_centre('montserrat', size, lc[0] - lw / 2 + 60 * k, lc[1] - lh / 2 + y * k, test)
        cv.text('montserrat', size * PX_PER_SIZE, test, rot_pt(p, lc, lr), lr, INK)
    cv.doodle('icon', 8, 120, (170, 1430), T.ACCENT, WHITE, rot=-10)
    cv.doodle('icon', 8, 90, (950, 760), T.ACCENT, WHITE, rot=12)
    return cv


def ch6():
    """h6 Once in a blood moon: the blood moon rising off the lower corner with the howling wolf on it, clouds, and
    "once in a / blood moon" over the clip."""
    import templates.th6 as T, storyboard_halloween as B
    cv = Cover(T.STAGE); cv.video(0, 'Your product', (720, 900))
    d = 700; moon = B.blood(B.moon_disc(d)); c = (300, 1540)
    glow = Image.new('RGBA', (d + 600, d + 600), (0, 0, 0, 0)); B.moon_glow(glow, d, (300, 300)); cv.art('glow', glow, c)
    cv.art('moon', moon, c)
    cv.art('clouds', B.clouds(1250), (360, 1830))
    wolf = B.fit_w(B.white_on_clear('Howling Wolf Silhouette.png', (14, 10, 16)), 300); cv.art('wolf', wolf, (430, 1290), hero=True)
    cv.text('bodoni', 120, 'once in a', (540, 400), 0, T.CREAM, shadow=True)
    cv.text('bodoni', 160, 'blood moon', (540, 570), 0, T.RED, shadow=True)
    return cv


def ch3():
    """h3 Caught in our web: the pom-pom spider dropping in on its silk, "you're about to get" and CAUGHT as cut-out
    letters hanging on threads (each letter editable text on its own paper)."""
    import templates.th3 as T, storyboard_halloween as B
    cv = Cover(T.STAGE); cv.video(0, 'Your product, held up', (540, 1520))
    spider = B.cutout(B.cut_white(B.src('Cute Fuzzy Pom-Pom Spider Craft-2.png')), 760, 0, 90)
    sp = B.fit_w(spider, 330); sc = (830, 700)
    cv.art('spider-thread', T.silk_vert(sc[1] - 60, 4, 255), (sc[0], (sc[1] - 60) / 2))
    cv.art('spider', sp, sc, rot=-8, hero=True)
    y, px = 1290, 150; step = px * 0.97; strand = 1140          # the letters hang from one strand under the words
    cv.art('strand', T.silk_bar(1000, 5), (540, strand))
    for i, ch in enumerate('CAUGHT'):
        paper, fg, font = T.PAPERS[i % len(T.PAPERS)]; cx = 540 + (i - 2.5) * step; top = int(y - px * 0.62)
        cv.art(f'thread{i}', T.silk_vert(top - strand + 10), (cx, (strand + top) / 2))
        cv.text(font, px * (0.95 if font == 'bodoni' else 0.8), ch, (cx, y), (2 if i % 2 else -2), fg, box=(paper, 0.0))
    cv.plain("you're about to get", 92, (540, 1030), T.SILK, INK)
    return cv


# ---- h5's taffy lettering (motion_h5.letter, copied: importing motion_h5 runs ffmpeg) ------------------------------------
SNAP = 'C:/Windows/Fonts/SNAP____.TTF'; TAFFY = LAV = (196, 170, 232); H5INK = (22, 20, 24)
def _taffy_letter(ch, px):
    f = ImageFont.truetype(SNAP, px); pad = px // 3 + 20
    w = int(f.getlength(ch)) + 2 * pad; h = int(px * 1.5) + 2 * pad
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((w / 2, h / 2), ch, font=f, fill=255, anchor='mm')
    edge = Image.new('L', (w, h), 0); ImageDraw.Draw(edge).text((w / 2, h / 2), ch, font=f, fill=255, anchor='mm', stroke_width=max(6, px // 13))
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sh = Image.new('RGBA', (w, h), H5INK + (255,)); sh.putalpha(edge.point(lambda v: int(v * 0.55))); out.alpha_composite(sh, (px // 22, px // 16))
    e = Image.new('RGBA', (w, h), H5INK + (255,)); e.putalpha(edge); out.alpha_composite(e)
    p = Image.new('RGBA', (w, h), TAFFY + (255,)); d = ImageDraw.Draw(p)
    for x in range(-h, w + h, 40): d.polygon([(x, 0), (x + 12, 0), (x + 12 + h, h), (x + h, h)], fill=(255, 255, 255, 110))
    p.putalpha(m); out.alpha_composite(p); return out

def _taffy_word(cv, text, cx, cy, px, name, rots):
    f = ImageFont.truetype(SNAP, px); widths = [f.getlength(ch) for ch in text]; gap = px * 0.02
    x = cx - (sum(widths) + gap * (len(text) - 1)) / 2
    for i, ch in enumerate(text):
        lc = x + widths[i] / 2; x += widths[i] + gap
        if ch != ' ': cv.art(f'{name}{i}', _taffy_letter(ch, px), (lc, cy + (8 if i % 2 else -8)), rot=rots[i % len(rots)], hero=True)

def ch5():
    """h5 Trick or treat: TRICK / or TREAT? in her lavender taffy lettering over the clip, real candy corn and taffy
    spilling in along the bottom, a lavender burst."""
    cv = Cover(H5INK); cv.video(0, 'The common mistake', (540, 1060))
    candy = sorted((E.PACK / 'halloween' / 'h5-trick-or-treat' / 'preview' / '_frames' / 'candy').glob('*.png'))
    r = random.Random(5); spots = [(120, 1560, 230), (330, 1640, 200), (950, 1560, 240), (760, 1650, 190), (60, 1370, 170), (1020, 1370, 180)]
    for i, (x, y, w) in enumerate(spots):
        im = Image.open(candy[(i * 3) % len(candy)]).convert('RGBA'); im = im.resize((w, int(im.height * w / im.width)))
        cv.art(f'candy{i}', im, (x, y), rot=r.uniform(-30, 30))
    _taffy_word(cv, 'TRICK', 540, 470, 230, 'trick', [-4, 3, -2, 4, -3])
    _taffy_word(cv, 'or TREAT?', 540, 690, 130, 'treat', [0, 0, 0, -3, 2, -2, 3, -2, 4])
    return cv
