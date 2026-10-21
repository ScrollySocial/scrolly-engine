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
SPECS = {'h5': dict(num='h5', title='Trick or treat', dir='halloween/h5-trick-or-treat'),
         'h1': dict(num='h1', title='Now you see it', dir='halloween/h1-now-you-see-it')}   # h1 has no CapCut build yet


def tape_text(cv, size, pos, rot, tape, dots):
    """A strip of dotted tape as one editable text layer: rows of bullets on CapCut's text background (no torn ends:
    a text box is a rectangle). size = the strip's (w, h) in px; the rows and dot size are fitted to it."""
    rows = 2 if size[1] < 200 else 3
    def words(n): return '\n'.join((' ' if r % 2 else '') + '  '.join(['•'] * (n - r % 2)) for r in range(rows))
    def box(px, n):
        bb = E.text_img(dict(font='montserrat', size=round(px / E.PX_PER_SIZE, 2), words=(words(n),) * 2, color=dots,
                             box=(tape, 0.0), stroke=None, shadow=False), False).getbbox()
        return bb[2] - bb[0], bb[3] - bb[1]
    px = next(p for p in range(int(size[1]), 10, -2) if box(p, 2)[1] <= size[1])
    n = 2
    while box(px, n + 1)[0] <= size[0]: n += 1
    cv.text('montserrat', px, words(n), pos, rot, dots, box=(tape, 0.0))

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
    butter dotted tape strip, the shipping label slapped on the lower corner. The tape is CapCut text (Mercedes,
    2026-10-21: the tape colour must change too): dots on the text's own background box, so the buyer recolours the
    tape (background colour) and its dots (text colour) like any word."""
    import templates.t02 as T, collage as C
    from engine import rot_pt, PX_PER_SIZE
    cv = Cover(T.BUTTER); cv.video(0, 'Picking the order', (440, 960))
    for (x, y, rr) in ((90, 300, -40), (990, 1640, -40)):
        tape_text(cv, (420, 120), (x, y), rr, T.BLUE, WHITE)
    tc = (540, 470); tr = -3
    tape_text(cv, (940, 280), tc, tr, T.BUTTER, (255, 249, 228))
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


# ==== the rest of the pack (Mercedes on round 2: "Do the rest in the same style") ========================================
import play as P, play_extra as X
WINE, BUTTER, PINK, BABY = X.WINE, X.BUTTER, X.PINK, X.BABY
DEEP = (52, 86, 140)                                   # story7.DEEP, the stamp-ink blue of #11 and #22

def thing(name, w, pattern=None, color=None, **kw):
    """A real object played with like its template does (pattern in a colour, white die-cut edge, shadow)."""
    return P.thing(name, w, pattern, color, **kw)

def C_shadow(im, off=(6, 12), blur=12, a=90):
    import collage as C; return C.shadow(im, off, blur, a)

def hook(cv, a, b, fa, ea, fb=None, eb=None, pa=150, pb=250, ya=430, yb=620, ra=-3, rb=-3, ia=True, ib=True):
    """The two-line hook every cover shares: a smaller line, then the big key words (DM Serif, last word Italic)."""
    if a: cv.serif(a, pa, (500, ya), fa, ea, rot=ra, italic_last=ia)
    cv.serif(b, pb, (555, yb), fb or fa, eb if fb else ea, rot=rb, italic_last=ib)

def sparkles(cv, color, edge=WHITE, spots=((150, 360, 120), (930, 460, 100))):
    for i, (x, y, s) in enumerate(spots): cv.doodle('icon', 8, s, (x, y), color, edge, rot=(-12, 10, -6, 8)[i % 4])


def c01():
    """01 One product, 3 ways: "One product," on a white box, "3 ways" in ink with the drawn ring round it, three real
    Polaroids fanned along the bottom."""
    cv = Cover(E.CREAM); cv.video(0, 'Your product', (540, 1010))
    cv.boxed('One product,', 118, (540, 400))
    cv.serif('3 ways', 220, (540, 640), INK, WHITE, italic_last=True)
    cv.doodle('frame', 2, 1000, (540, 668), INK, rot=-3)
    pol = P.raw_cut('Blank Polaroid on White Background.png', 270)
    for i, (x, r) in enumerate(((250, -9), (540, 3), (830, 10))):
        cv.art(f'polaroid{i}', C_shadow(pol), (x, 1440 + (20 if i == 1 else 0)), rot=r, hero=True)
    cv.doodle('icon', 10, 100, (950, 330), INK)
    return cv

def c03():
    """03 Before and after: her polka-dot "before" / "after" lettering in the camera's mint, the mint instant camera in
    the lower corner."""
    import templates.t03 as T
    cv = Cover(T.STAGE); cv.video(0, 'Before', (420, 960))
    for word, cy, px, tilt in (('before', 430, 210, -4), ('after', 640, 250, 3)):
        for i, (im, dx) in enumerate(T.letters(word, px)):
            cv.art(f'{word}{i}', im, (540 + dx, cy + (10 if i % 2 else -10)), rot=T.TILTS[i % len(T.TILTS)] * 0.6 + tilt * 0.3, hero=True)
    cams, _ = T.camera(430); cv.art('camera', cams[0], (790, 1430), rot=8, hero=True)
    cv.doodle('icon', 8, 120, (190, 1420), T.MINT, INK, rot=-10)
    return cv

def c04():
    """04 A or B?: "which one / are you?" in wine, the brass balance scale below with A and B pills over its pans."""
    import templates.t04 as T
    cv = Cover(T.STAGE); cv.video(0, 'Version A', (540, 960))
    hook(cv, 'which one', 'are you?', WINE, WHITE, pa=150, pb=170)
    sc = thing('Level vintage brass balance scale-105.png', 640); cv.art('scale', sc, (540, 1400), hero=True)
    cv.boxed('A', 80, (300, 1300), BUTTER, round_=1.0); cv.boxed('B', 80, (780, 1300), PINK, round_=1.0)
    sparkles(cv, WINE)
    return cv

def c05():
    """05 Details you'd miss: "details / you'd miss", the brass magnifying glass with butter dots over a corner."""
    cv = Cover(E.CREAM); cv.video(0, 'Close-up 1', (460, 980))
    hook(cv, "you'd miss", 'details', INK, WHITE, WHITE, INK, pa=130, pb=230, ya=640, yb=450, ib=False)
    mg = thing('Vintage brass magnifying glass on white-129.png', 520, 'dots', BUTTER, scale=0.35, strength=0.5)
    cv.art('magnifier', mg, (790, 1380), rot=-28, hero=True)
    cv.doodle('arrow', 1, 200, (330, 1300), INK, WHITE, rot=118)   # points at the frame centre
    return cv

def c06():
    """06 Start to finish: "start to / finish", the wooden hourglass in the lower corner, an underline."""
    cv = Cover(E.CREAM); cv.video(0, 'The materials', (620, 980))
    hook(cv, 'start to', 'finish', WHITE, WINE, WINE, WHITE, pa=156, pb=230)
    hg = thing('Classic wooden hourglass with flowing sand-238.png', 270, 'stripes', WINE, scale=0.3, strength=0.35)
    cv.art('hourglass', hg, (240, 1360), rot=-8, hero=True)
    cv.doodle('under', 0, 520, (560, 740), WINE)
    cv.doodle('icon', 8, 110, (900, 1480), BUTTER, WHITE, rot=8)
    return cv

def c07():
    """07 How big is it really?: the question in white with an ink edge, the real wooden ruler (INCHES sticker) across
    the bottom with the striped mug standing on it."""
    cv = Cover(E.CREAM); cv.video(0, 'Your product alone', (540, 960))
    hook(cv, 'how big is it', 'really?', WHITE, INK, pa=140, pb=230)
    ruler = thing('Pale wooden ruler on white-153.png', 900, label=P.sticker('INCHES', 34, INK), label_at=(0.82, 0.5))
    cv.art('ruler', ruler, (540, 1560), rot=-4, hero=True)
    mug = thing('Warm white ceramic coffee mug-140.png', 300, 'stripes', INK, scale=0.35, strength=0.7)
    cv.art('mug', mug, (830, 1370), rot=3, hero=True)
    cv.doodle('arrow', 1, 190, (300, 1290), INK, WHITE, rot=123)   # points at the frame centre
    return cv

def c08():
    """08 A real customer question: "you asked" with the drawn underline, the dusty blue rotary phone with wine dots."""
    cv = Cover(BABY); cv.video(0, 'The answer', (600, 1000))
    cv.serif('you asked', 200, (540, 520), WHITE, WINE)
    cv.doodle('under', 0, 560, (540, 640), WINE)
    ph = thing('Dusty blue vintage rotary telephone-26.png', 480, 'dots', WINE, scale=0.3, strength=0.35)
    cv.art('phone', ph, (300, 1390), rot=-6, hero=True)
    cv.boxed('?', 110, (840, 1330), WHITE, round_=1.0)
    return cv

def c09():
    """09 Who it's for: "this is / for you", three different real butterflies landing round the words."""
    cv = Cover(E.CREAM); cv.video(0, 'You', (540, 1050))
    hook(cv, 'this is', 'for you', WHITE, WINE, pa=150, pb=240)
    for i, (name, x, y, w, r) in enumerate(((P.BUTTERFLIES[0], 170, 1300, 260, -18), (P.BUTTERFLIES[1], 900, 340, 220, 15),
                                            (P.BUTTERFLIES[2], 860, 1420, 200, 8))):
        cv.art(f'butterfly{i}', P.die_cut(P.raw_cut(name, w), 6), (x, y), rot=r, hero=(i != 1))
    cv.doodle('under', 0, 480, (580, 790), WINE)
    return cv

def c10():
    """10 Three people to gift it to: "3 people / gift it to", the kraft gift cube with butter dots and its twine."""
    cv = Cover(BUTTER); cv.video(0, 'Wrapping it', (560, 980))
    hook(cv, 'gift it to', '3 people', WHITE, WINE, pa=140, pb=230, ya=640, yb=450)
    box = thing('Kraft paper cube gift with twine-38.png', 400, 'dots', BUTTER, scale=0.4, strength=0.9)
    cv.art('gift', box, (780, 1400), rot=6, hero=True)
    cv.doodle('icon', 8, 120, (220, 1450), WINE, WHITE, rot=-10)
    return cv

def c11():
    """11 A day with it: "a day / with it" in the deep blue, the cream twin-bell alarm clock and a gold star sticker."""
    cv = Cover((200, 220, 240)); cv.video(0, 'Morning', (600, 990))
    hook(cv, 'a day', 'with it', WHITE, DEEP, pa=160, pb=240)
    clock = thing('Slender Cream Twin-Bell Alarm Clock-158.png', 320, 'smalldots', DEEP, scale=0.3, strength=0.35)
    cv.art('clock', clock, (260, 1360), rot=-8, hero=True)
    cv.art('star', P.die_cut(P.raw_cut('Gold foil star sticker-95.png', 150), 6), (900, 1450), rot=14)
    return cv

def c12():
    """12 Your order just arrived: "it's here" in white and wine, the real padded mailer and the brass doorbell."""
    cv = Cover((212, 211, 207)); cv.video(0, 'The doorstep', (560, 880))
    cv.serif("it's here", 230, (540, 520), WHITE, WINE)
    ml = thing('Sealed kraft padded mailer-39.png', 420); cv.art('mailer', ml, (720, 1360), rot=-10, hero=True)
    bell = thing('Vintage brass doorbell with ivory button-43.png', 220); cv.art('doorbell', bell, (200, 1300), rot=4)
    cv.doodle('icon', 8, 120, (900, 330), BUTTER, WHITE, rot=10)
    return cv

def c13():
    """13 How to use it in 3 steps: "how to use it / in 3 steps", the three real wooden number cubes tumbling in."""
    import motion_13 as M
    cv = Cover(E.CREAM); cv.video(0, 'Your product', (540, 980))
    hook(cv, 'how to use it', 'in 3 steps', WHITE, WINE, pa=140, pb=190)
    for i, (name, x, y, r) in enumerate(zip(M.CUBES, (250, 540, 830), (1450, 1400, 1460), (-12, 5, 14))):
        cv.art(f'cube{i}', thing(name, 230), (x, y), rot=r, hero=True)
    return cv

def c14():
    """14 The annoying moment: "we've all been there / again." and three crumpled paper balls with wine patterns."""
    cv = Cover(BUTTER); cv.video(0, 'The annoying moment', (540, 1000))
    hook(cv, "we've all been there", 'again.', WINE, WHITE, WHITE, WINE, pa=94, pb=250, ib=False)
    for i, (w, x, y, p) in enumerate(((230, 200, 1420, 'dots'), (190, 470, 1510, 'stripes'), (210, 860, 1440, 'checks'))):
        cv.art(f'ball{i}', thing('Crumpled cream paper ball-58.png', w, p, WINE, scale=0.3, strength=0.55, seed=i), (x, y), rot=i * 40, hero=True)
    return cv

def c15():
    """15 New drop reveal: "new / drop" in wine, the cream kitchen timer with wine dots counting down, a burst."""
    cv = Cover(BUTTER); cv.video(0, 'The drop', (560, 980))
    hook(cv, 'new', 'drop', WINE, WHITE, pa=170, pb=270, ib=False)
    timer = thing('Cream Retro Kitchen Timer Dial.png', 430, 'smalldots', WINE, scale=0.4, strength=0.22)
    cv.art('timer', timer, (770, 1400), rot=8, hero=True)
    cv.doodle('icon', 8, 130, (230, 1430), BUTTER, WINE, rot=-8)
    return cv

def c16():
    """16 What it feels like: "what it / feels like" in white with an ink edge, a real white feather and a cotton boll
    (soft to the touch), sparkles."""
    cv = Cover(BUTTER); cv.video(0, 'Close, sound on', (560, 1000))
    hook(cv, 'what it', 'feels like', WHITE, INK, pa=156, pb=210)
    cv.art('feather', P.die_cut(P.raw_cut('Curved white feather, isolated-212.png', 300), 6), (250, 1440), rot=-30, hero=True)
    cv.art('cotton', P.die_cut(P.raw_cut('Fluffy natural cotton boll-88.png', 260), 6), (830, 1450), rot=10, hero=True)
    sparkles(cv, BUTTER, INK)
    return cv

def c17():
    """17 Everything that goes into one: the two-line hook in ink, the real walnut tray along the bottom."""
    cv = Cover(PINK); cv.video(0, 'The empty table', (540, 980))
    hook(cv, 'everything that', 'goes into one', INK, WHITE, pa=120, pb=148)
    tray = Image.open(E.PACK / 'build' / '.cache' / 'hq' / 'Empty walnut serving tray-59.png').convert('RGBA')
    cv.art('tray', C_shadow(tray.resize((820, int(tray.height * 820 / tray.width)))), (540, 1470), rot=-3, hero=True)
    cv.doodle('icon', 8, 110, (900, 330), WINE, WHITE)
    return cv

def c18():
    """18 Check this before you buy: "3 things / to check", the brown clipboard with three ticks, the gold 3/3 seal."""
    cv = Cover((246, 241, 232)); cv.video(0, 'Your product', (620, 980))
    hook(cv, '3 things', 'to check', WINE, WHITE, pa=184, pb=170, ia=False)
    cb = thing('Brown clipboard with blank white paper-65.png', 360); cv.art('clipboard', cb, (250, 1390), rot=-7, hero=True)
    for i in range(3): cv.doodle('tick', 0, 90, (220 + i * 4, 1290 + i * 100), WINE, rot=-7)
    seal = P.die_cut(P.raw_cut('Blank gold foil seal sticker-175.png', 240), 6); cv.art('seal', seal, (830, 1450), rot=10)
    cv.serif('3/3', 90, (830, 1450), WINE, None, rot=10, italic_last=False)
    return cv

def c19():
    """19 Pair it with: "pair it / with" in wine, the open gold locket, sparkles."""
    cv = Cover(PINK); cv.video(0, 'Your product', (540, 1010))
    hook(cv, 'pair it', 'with', WINE, WHITE, pa=200, pb=200, ib=False)
    lk = Image.open(E.PACK / 'build' / '.cache' / 'hq' / 'Open vintage gold locket, blank inside.png').convert('RGBA')
    cv.art('locket', C_shadow(lk.resize((560, int(lk.height * 560 / lk.width)))), (540, 1420), rot=-4, hero=True)
    sparkles(cv, WINE, WHITE)
    return cv

def c20():
    """20 What buyers said: "what / buyers said" in pink and wine, the gold trophy and gold star stickers."""
    cv = Cover((238, 186, 208)); cv.video(0, 'Your product', (460, 960))
    hook(cv, 'what', 'buyers said', WHITE, WINE, PINK, WINE, pa=150, pb=168)
    cv.art('trophy', thing('Plain gold trophy on black base-223.png', 330), (800, 1410), rot=5, hero=True)
    for i, (x, y, w) in enumerate(((210, 1400, 150), (360, 1520, 110))):
        cv.art(f'star{i}', P.die_cut(P.raw_cut('Gold foil star sticker-95.png', w), 6), (x, y), rot=(-12, 18)[i])
    return cv

def c21():
    """21 Small batch: "only / made this week", the fountain pen and the gold "small batch" seal."""
    cv = Cover(PINK); cv.video(0, 'The batch', (560, 1000))
    cv.serif('only', 260, (540, 440), WHITE, WINE, rot=-3, italic_last=False)
    cv.serif('made this week', 130, (540, 630), WHITE, WINE, rot=-2)
    pen = Image.open(E.PACK / 'build' / '.cache' / 'hq' / 'Vintage fountain pen with gold nib-51.png').convert('RGBA')
    cv.art('pen', C_shadow(pen.resize((560, int(pen.height * 560 / pen.width)))), (330, 1450), rot=-30, hero=True)
    seal = P.die_cut(P.raw_cut('Blank gold foil seal sticker-175.png', 280), 6); cv.art('seal', seal, (820, 1420), rot=8, hero=True)
    for word, dy in (('small', -26), ('batch', 30)):   # two lines on the seal (one text each)
        o = Ed.rot((0, dy), 8); cv.serif(word, 56, (820 + o[0], 1420 + o[1]), WINE, None, rot=8, italic_last=False)
    return cv

def c22():
    """22 Put it to the test: "let's / test it" in the deep blue, the silver stopwatch, a REC pill."""
    cv = Cover((214, 228, 242)); cv.video(0, 'The test', (560, 980))
    hook(cv, "let's", 'test it', WHITE, DEEP, DEEP, WHITE, pa=160, pb=240)
    sw = thing('Vintage Silver Mechanical Stopwatch-233.png', 380, 'smalldots', DEEP, scale=0.3, strength=0.3)
    cv.art('stopwatch', sw, (280, 1390), rot=-10, hero=True)
    cv.boxed('REC', 70, (850, 1450), (214, 40, 40), round_=1.0)
    return cv

def c23():
    """23 Every option in 10 seconds: "every option" in wine, "in 10 seconds" on a box, the muted paint-chip fan deck."""
    cv = Cover((240, 236, 228)); cv.video(0, 'Option 1', (540, 1000))
    cv.serif('every option', 155, (540, 440), WINE, WHITE, rot=-3)
    cv.boxed('in 10 seconds', 72, (560, 600), WHITE, rot=-2)
    fan = thing('Muted Paint Chip Fan Deck-235.png', 520); cv.art('fan-deck', fan, (720, 1420), rot=-12, hero=True)
    cv.doodle('icon', 8, 110, (200, 1450), WINE, WHITE, rot=-8)
    return cv

def c25():
    """25 Mine vs. the usual kind: the two-line hook, the brass boxing bell with wine stripes, a tick."""
    cv = Cover(BUTTER); cv.video(0, 'Mine', (600, 990))
    hook(cv, 'mine vs.', 'the usual kind', WHITE, WINE, WINE, WHITE, pa=170, pb=130, ya=430, yb=600, ia=False)
    bell = thing('Classic brass boxing ring bell-89.png', 420, 'stripes', WINE, scale=0.3, strength=0.45)
    cv.art('bell', bell, (270, 1400), rot=-6, hero=True)
    cv.doodle('icon', 8, 120, (850, 1450), BUTTER, WINE, rot=6)
    return cv


def ch2():
    """h2 Things I'm batty about: "things I'm" + BATTY in Corben lilac with an ink edge + "about", real bats flying."""
    import templates.th2 as T
    cv = Cover(T.STAGE); cv.video(0, 'An opening', (540, 1040))
    cv.text('montserrat', 92 * 0.85, "things I'm", (540, 380), -2, WHITE, stroke=(INK, 0.03), shadow=True)
    cv.text('corben', 200, 'BATTY', (540, 560), -3, T.FILL, stroke=(INK, 0.1), shadow=True)
    cv.text('montserrat', 92 * 0.85, 'about', (560, 730), -2, WHITE, stroke=(INK, 0.03), shadow=True)
    for i, (x, y, w, r) in enumerate(((180, 1380, 300, -14), (860, 1460, 340, 10), (870, 300, 220, 8), (530, 1560, 200, -4))):
        cv.art(f'bat{i}', T.M.sized(T.M.FLY, w, f'cov{w}'), (x, y), rot=r, hero=(i != 2))
    return cv


def ch1():
    """h1 Now you see it: "now you / see it" in Bodoni (cream, then gold) with a heavy shadow, her real smoke rolling
    up from the bottom over the clip (one frame of smoke.mp4, brightness as see-through)."""
    p = E.PACK / 'build' / '.cache' / 'cover-smoke.png'
    if not p.exists():   # one frame only, never a video render
        from PIL import ImageOps
        f = p.with_name('cover-smoke-raw.png')
        E.run([E.FFMPEG, '-v', 'error', '-y', '-ss', '1.5', '-i', str(E.PACK / 'assets' / 'props' / 'source' / 'halloween' / 'smoke.mp4'),
               '-frames:v', '1', str(f)])
        g = ImageOps.grayscale(Image.open(f)); sm = Image.new('RGBA', g.size, (255, 255, 255, 0))
        sm.putalpha(g.point(lambda v: min(255, int(max(0, v - 12) * 1.6)))); sm.save(p)
    cv = Cover((24, 18, 14)); cv.video(0, 'Your product, in place', (540, 900))
    cv.art('smoke', Image.open(p).convert('RGBA'), (540, 1160))
    cv.text('bodoni', 130, 'now you', (540, 420), 0, (246, 238, 222), shadow=True)
    cv.text('bodoni', 210, 'see it', (540, 610), 0, (246, 206, 112), shadow=True)
    return cv
