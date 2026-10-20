"""24 Make it last, approved 2026-10-19 (round 2, motion test build/motion_24.py). FULLY EDITABLE build (2026-10-20,
build/editable.py), the prototype for rebuilding the flipbook templates: every word is CapCut text (DM Serif Display
built-in words with the last word Italic, Montserrat [brackets] on CapCut's text background); the sparkles, ring, ray
burst and underline are Scrolly Doodles letters (recolour like text); the butter stage is CapCut's background colour
under a colourless tissue grain; the calendar sheets and smartwatch are real photos moving on keyframes; the five clips
are real clip layers (placeholder cards until the buyer's clips go in).
CapCut limits: the ray burst behind the calendar is a picture (text always sits above pictures; recolour it with
Adjust > HSL); in the last tear the stage's
pieces fall away over the result clip (the background colour can't tear with them)."""
import editable as Ed
from editable import at, still, pop_in, then, slide, enter, tear
import motion_24 as M
import play as P
import storyboard_b2 as S
import collage as C
from PIL import ImageDraw

SPEC = dict(num='24', title='Make it last', subtitle='22 seconds. Five clips: your product, two care tips, after long use, the end.',
            font='montserrat', dir='24-make-it-last', folder='Template 24 - Make it last', project='24 Make it last', cover_at=1.0,
            slots=[('Your product', 'Your product, full frame'), ('Care tip 1', 'The first care step, close'), ('Care tip 2', 'The second care step'),
                   ('After long use', 'Your product, still like new'), ('The end', 'You or your product')],
            test_clips=[('IMG_1464', 0.5), ('IMG_1430', 0.5), ('IMG_1432', 0.0), ('IMG_1464', 2.0), ('IMG_1464', 1.0)])
WHITE, BUTTER, WINE, INK = (255, 255, 255), M.BUTTER, M.WINE, (24, 23, 22)
CX, CY = M.CAL_C; W, H = 1080, 1920

def sheets():
    """The calendar page (month name covered, no label: the labels are text), drop-shadowed; and its label offset."""
    cal = S.card('fall', 'Minimal October calendar page-40.png', M.CAL_W); sh = cal.copy(); d = ImageDraw.Draw(sh)
    d.rectangle((int(sh.width * 0.12), int(sh.height * 0.04), int(sh.width * 0.88), int(sh.height * 0.2)), fill=cal.getpixel((int(cal.width * 0.5), int(cal.height * 0.3))))
    return C.shadow(sh, (8, 14), 14, 100), cal.size

def reel():
    r = Ed.Reel(M.HOLDS, 14.0); g = {'paper': S.raw('images', 'Blush Pink Tissue Paper Texture-9.png')}
    sheet, (cw, ch) = sheets(); lab_dy = -0.38 * ch
    r.art('paper-grain', Ed.grain(g['paper']), 0, None, 1, still(540, 960))

    # 1 (0-1.8) the product, "make it LAST", sparkles; swipes out left at 1.6
    out1 = slide(1.6, 1.8, -W)
    r.clip(0, 0, 1.8, 10, then(still(540, 960), out1))
    r.serif('make it', 184, 0.05, 1.8, then(pop_in(520, 330, 0.05, 3, 0.22, 1.8, 18), out1), WHITE, WINE)
    r.serif('LAST', 304, 0.3, 1.8, then(pop_in(560, 560, 0.3, 2, 0.22, 1.8, 18), out1), WHITE, WINE)
    for i, (x, y) in enumerate([(140, 300), (960, 380), (980, 720), (110, 760)]):
        ti = 0.35 + i * 0.1
        def sp(ts, x=x, y=y, i=i, ti=ti):
            k = Ed.back_out(Ed.seg(ts, ti, ti + 0.25), 2.2) * (0.8 + 0.25 * Ed.math.sin((ts - ti) * 7 + i * 1.7)) if ts >= ti else 0
            return at(x, y, k * (0.7 + 0.3 * (i % 3) / 2), -15 * Ed.math.sin(ts * 2 + i))
        r.doodle('icon', 8, 170, ti, 1.8, then(sp, out1), BUTTER, WHITE)

    # 2 (1.8-3.4) PAPER: the calendar drops in, month 1 and month 6 tear off; "most wear out / in [a year]"
    def cal_sheet(i, t_drop, t_tear, t_end, first, moves=()):
        """Sheet i of the stack: drops in (or is already there), tears off at t_tear (None = stays), with its label."""
        def f(ts):
            y = Ed.lerp(-900, CY, Ed.back_out(Ed.seg(ts, t_drop, t_drop + 0.3), 1.3)) if t_drop is not None else CY
            if t_tear is not None and ts >= t_tear:
                u = Ed.seg(ts, t_tear, t_tear + 0.45); return at(CX + 120 * u, y + 900 * u * u, 1, 25 * Ed.ease(u))
            return at(CX, y)
        f = then(f, *moves); t_out = t_end if t_tear is None else t_tear + 0.45
        r.art(f'sheet-{i}', sheet, first, t_out, 30 - i, f)
        def lab(ts):
            v = f(ts); dx, dy = Ed.rot((0, lab_dy), v['r']); return at(v['x'] + dx, v['y'] + dy, 1, v['r'])
        return lab, t_out
    LBL = M.LABELS
    def label(i, f, a, b, show_from):
        """The sheet's label as text; text sits above every picture, so it shows only once the sheet above is mostly off."""
        r.serif(LBL[i], 110, max(a, show_from), b, f, WINE, WHITE)
    for i, tt in ((0, 2.4), (1, 2.85), (2, None)):
        f, b = cal_sheet(i, 1.8, tt, 3.4, 1.8)
        label(i, f, 1.8, b, 1.8 if i == 0 else 2.4 + (i - 1) * 0.45 + 0.2)
    r.serif('most wear out', 138, 2.0, 3.4, pop_in(540, 330, 2.0, 3, 0.22, 1.8, 18), WINE, WHITE)
    r.boxed('in [a year]', 72, 2.25, 3.4, pop_in(560, 500, 2.25, 2), WINE, 'in a year')

    # 3 (3.4-5.4) a full-screen sheet tears away to tip 1; tip 1 tears away at 5.2 to tip 2
    k = W / sheet.width * 1.05; full = sheet.resize((int(sheet.width * k), int(sheet.height * k)))
    ft = then(still(540, 960), tear(3.4, 3.6))
    r.art('sheet-full', full, 3.4, 3.6, 40, ft)
    r.serif(LBL[2], 110 * k * 0.95, 3.4, 3.6, lambda ts: (lambda v: at(v['x'] + Ed.rot((0, lab_dy * k), v['r'])[0], v['y'] + Ed.rot((0, lab_dy * k), v['r'])[1], 1, v['r']))(ft(ts)), WINE, WHITE)
    t1 = tear(5.2, 5.4)
    r.clip(1, 3.4, 5.4, 12, then(still(540, 960), t1))
    r.boxed('[rinse after each use]', 62, 3.6, 5.4, then(pop_in(540, 340, 3.6, 2), t1), WHITE, 'rinse after each use')

    # 4 (5.2-7.2) tip 2; slides off at 7.0 (the diagonal wipe)
    o4 = slide(7.0, 7.2, -W - 300, -300)
    r.clip(2, 5.2, 7.2, 11, then(still(540, 960), o4))
    r.boxed('[store it upright]', 62, 5.4, 7.2, then(pop_in(540, 340, 5.4, -2), o4), BUTTER, 'store it upright')

    # 5 (7.2-8.8) PAPER: the smartwatch rises, its screen is tip 1 again; "a 2-minute habit", "[every Sunday]"; swipes right
    im, m, bb = P.device(M.WATCH, 560); watch = P.die_cut(im, 8)
    watch, ssize, soff = Ed.device_hole(watch)
    o5 = slide(8.6, 8.8, W)
    def wf(ts):
        kk = Ed.back_out(Ed.seg(ts, 7.2, 7.5), 1.3); return at(540, Ed.lerp(2400, 1050, kk), 1, 4)
    wf = then(wf, o5)
    def screen(ts):
        v = wf(ts); dx, dy = Ed.rot(soff, v['r']); return at(v['x'] + dx, v['y'] + dy, 1, v['r'])
    r.clip(1, 7.2, 8.8, 20, screen, size=ssize)
    r.art('watch', watch, 7.2, 8.8, 21, wf)
    r.serif('a 2-minute habit', 110, 7.4, 8.8, then(pop_in(540, 330, 7.4, 3, 0.22, 1.8, 18), o5), WINE, WHITE)
    r.boxed('[every Sunday]', 64, 7.6, 8.8, then(pop_in(540, 1460, 7.6, -2), o5), WINE, 'every Sunday')

    # 6 (8.8-10.4) PAPER: the calendar comes in from the left; year 2 tears off to year 3; ray burst; ring round year 3;
    #   "still like new"; the stage's pieces tear away at 10.2 over the result clip
    o6 = tear(10.2, 10.4); in6 = enter(8.6, 8.8, -W)
    for i, tt in ((2, 8.9), (3, 9.35), (4, None)):
        f, b = cal_sheet(i, None, tt, 10.4, 8.6, (in6, o6))
        label(i, f, 8.6, b, 8.6 if i == 2 else 8.9 + (i - 3) * 0.45 + 0.2)
    from collage_kit import doodle as art_doodle   # behind the calendar, so a picture (text always sits above pictures)
    r.art('burst', art_doodle('burst', 2, 1150, WINE), 9.6, 10.4, 25, then(pop_in(CX, CY, 9.6, 0, 0.35), o6))
    r.doodle('frame', 0, 560, 9.8, 10.4, then(pop_in(CX, CY + lab_dy, 9.8, -3, 0.3), o6), WINE)
    r.serif('still like new', 128, 9.9, 10.4, then(pop_in(540, 330, 9.9, 3, 0.22, 1.8, 18), o6), WINE, WHITE)

    # 7 (10.2-11.8) the result, "[still going strong]" + underline; swipes left at 11.6
    o7 = slide(11.6, 11.8, -W)
    r.clip(3, 10.2, 11.8, 13, then(still(540, 960), o7))
    r.boxed('[still going strong]', 62, 10.4, 11.8, then(pop_in(540, 1380, 10.4, 2), o7), BUTTER, 'still going strong')
    r.doodle('under', 0, 560, 10.7, 11.8, then(pop_in(540, 1470, 10.7, 2, 0.35), o7), WHITE)

    # 8 (11.6-end) CTA: Comment / "[KEYWORD]" / [Product name]
    r.clip(4, 11.6, None, 14, then(still(540, 960), enter(11.6, 11.8, W)))
    r.serif('Comment', 175, 11.9, None, pop_in(540, 1000, 11.9, 3, 0.22, 1.8, 18), WHITE, WINE)
    r.boxed('"[KEYWORD]"', 64, 12.15, None, pop_in(540, 1200, 12.15, -2), WHITE, '"LAST"')
    r.boxed('[Product name]', 56, 12.35, None, pop_in(540, 1340, 12.35, 2), WINE, 'The Steam Mop')
    for l in r.L.L:
        if l['kind'] == 'text' and l['font'] == 'doodles': l['centred'] = True   # glyphs are centred on the line box already
    return r

def layers():
    return reel().L

STAGE = BUTTER
