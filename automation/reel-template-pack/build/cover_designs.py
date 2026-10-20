"""The cover of each template (build/covers.py draws them): one function per template, cNN() -> covers.Cover.
Each cover uses its template's own world (stage colour, grain, real props, accent colour) and its title hook, with every
word and the hero inside the grid's 3:4 band (covers.SAFE). Kept apart from build/templates/tNN.py so cover work never
touches a template another session is rebuilding."""
from PIL import Image
from covers import Cover, WHITE, INK
import editable as Ed
from engine import W, H


def c24():
    """24 Make it last: butter tissue stage, the real calendar page on "year 3" with a wine ray burst behind it and a
    ring round the label; "make it LAST" above."""
    import templates.t24 as T, motion_24 as M, storyboard_b2 as S
    from collage_kit import doodle as art_doodle
    cv = Cover(M.BUTTER)
    cv.art('paper-grain', Ed.grain(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png')), (540, 960))
    sheet, (cw, ch) = T.sheets(); k = 0.74; c = (540, 1215)
    cv.art('calendar', sheet, (c[0], c[1] + 10), rot=-3, scale=k, hero=True)
    o = Ed.rot((0, -0.38 * ch * k), -3); lab = (c[0] + o[0], c[1] + o[1])
    cv.serif('year 3', 110 * k * 1.15, lab, M.WINE, WHITE, rot=-3)
    cv.doodle('frame', 0, 430, (lab[0], lab[1] + 6), M.WINE, rot=-3)
    cv.serif('make it', 150, (500, 450), WHITE, M.WINE, rot=-3)
    cv.serif('LAST', 250, (560, 630), WHITE, M.WINE, rot=-3)
    for i, (x, y, s) in enumerate([(170, 420, 130), (920, 480, 110), (930, 1540, 120)]):
        cv.doodle('icon', 8, s, (x, y), M.BUTTER, WHITE, rot=(-12, 10, -6)[i])
    return cv


def c02():
    """02 Pack an order with me: sage concrete stage, her real sealed kraft box with washi along the seam and the
    shipping label; the title on the butter gingham washi strip."""
    import templates.t02 as T, storyboard_02 as S, storyboard_b2 as SB, collage as C
    cv = Cover(S.BG[:3])
    cv.art('concrete-grain', Ed.grain(SB.raw('images', 'Light gray concrete mineral texture-4.png'), 0.12), (540, 960))
    cb = S.prop('box-closed-seam').rotate(-90, expand=True)
    cb = cb.crop((int(cb.width * 0.075), int(cb.height * 0.01), int(cb.width * 0.99), int(cb.height * 0.99)))   # pale edge off (test_close)
    bw = 620; cb = cb.resize((bw, int(cb.height * bw / cb.width)))
    box = C.shadow(cb, offset=(10, 18), blur=20, alpha=70); c = (520, 1140)
    cv.art('box', box, c, rot=-4, hero=True)
    cv.art('seam-tape', C.washi(cb.height + 16, 150, 'dots', (T.BLUE, WHITE), seed=8, alpha=245), (c[0] - 18, c[1] + 10), rot=90 - 4)
    from engine import rot_pt, PX_PER_SIZE
    lw = 360; k = lw / 520; lh = int(780 * k); lab = C.ship_label().resize((lw, lh)); lc = (c[0] + 150, c[1] + 170); lr = -8
    cv.art('label', lab, lc, rot=lr)
    # the label's fields as editable text, placed like t02.label (the shop name is the one buyers type)
    for y, px, words, test, *_ in T.LABEL_FIELDS[:3]:
        size = round(px * 0.8 * k / PX_PER_SIZE, 2)
        p = T.letters_centre('montserrat', size, lc[0] - lw / 2 + 60 * k, lc[1] - lh / 2 + y * k, test)
        cv.text('montserrat', size * PX_PER_SIZE, test, rot_pt(p, lc, lr), lr, INK)
    tape = C.washi(900, 270, 'gingham', (T.BUTTER, WHITE), seed=17, alpha=250); tc = (540, 470)
    cv.art('title-tape', tape, tc, rot=-3)
    def on_tape(dy): o = Ed.rot((0, dy), -3); return (tc[0] + o[0], tc[1] + o[1])
    cv.plain('pack an order', 66, on_tape(-62), INK, rot=-3)
    cv.serif('with me', 150, on_tape(40), T.ACCENT, rot=-3, italic_last=True)
    for x, y, r in ((930, 770, 12), (150, 1000, -10), (900, 1530, 8)):
        cv.doodle('icon', 8, 120, (x, y), T.ACCENT, WHITE, rot=r)
    return cv


def ch6():
    """h6 Once in a blood moon: the night (background colour under the sky's tone layer), the real moon turned blood
    red with its glow, the howling wolf on its rim, "once in a / blood moon" in Bodoni."""
    import templates.th6 as T, storyboard_halloween as B
    from editable_halloween import tone_overlay
    cv = Cover(T.STAGE)
    tone, _ = tone_overlay(T.SKY, T.STAGE); cv.art('night-sky', tone, (540, 960))
    d = 760; moon = B.blood(B.moon_disc(d)); c = (540, 1180)
    glow = Image.new('RGBA', (d + 600, d + 600), (0, 0, 0, 0)); B.moon_glow(glow, d, (300, 300)); cv.art('glow', glow, c)
    cv.art('moon', moon, c, hero=True)
    cv.art('clouds', B.clouds(1300), (540, 1520))
    wolf = B.fit_w(B.white_on_clear('Howling Wolf Silhouette.png', (14, 10, 16)), 380); cv.art('wolf', wolf, (720, 1340))
    cv.text('bodoni', 120, 'once in a', (540, 400), 0, T.CREAM, shadow=True)
    cv.text('bodoni', 160, 'blood moon', (540, 570), 0, T.RED, shadow=True)
    return cv
