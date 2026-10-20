"""#24 Make it last, motion test round 2 (2026-10-19). Her note on round 1: "what do envelopes have to do with making
something last longer? I get the apple watch, that is good." Round 2: props that literally say "lasts longer": a real
wall-calendar page whose sheets tear off as the months and years go by (the carried element), and the smartwatch she
liked as the weekly reminder. Calm butter paper stage; palette butter + wine. Built the round-3 way (play_extra:
locked type, palette, reading-time holds; IG-friendly intro: frame 1 is the product, moving, with big words).
Story (5 beats): hook "make it last" / problem: most wear out in [a year] / product: one small habit, two steps /
proof: [year 3] and still like new / CTA: comment [KEYWORD].
Scenes (graphics-only: 2, 6; tech: 5):
 1 0.0  the product, full frame; big "make it" / "LAST" with sparkles
 2 1.8  PAPER, no video: the calendar on the paper; its sheets tear off (month 1, month 6, year 1); "most wear out in
        [a year]"
 3 3.6  a full-screen calendar sheet tears away from its binding to reveal tip 1; "[rinse after each use]" at the top
 4 5.4  the next sheet tears away to tip 2; "[store it upright]"
 5 7.2  PAPER: the smartwatch stands on the paper, its screen the reminder clip; "[every Sunday]" + "2-minute habit"
 6 8.8  PAPER: the calendar again; sheets keep tearing (year 2, year 3); a wine ring is drawn round "year 3";
        "still like new" (one burst behind the calendar)
 7 10.4 the result, full frame; "[still going strong]" + one underline
 8 11.8 CTA: the product at its best; Comment / [KEYWORD] / [Product name]
Usage: python build/motion_24.py [seconds ...]  ->  24-make-it-last/preview/motion-test.mp4 (or a test sheet)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
import play_extra as X
from story4 import swipe, diagonal
from collage_kit import doodle, doodle_on
from motion_b2 import Clip, put, render, camera, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (24, 23, 22), (246, 241, 232); WINE, BUTTER = X.WINE, X.BUTTER            # her palette: butter + wine
X.use_type(BUTTER, WINE); X.enable_holds()
DIR = '24-make-it-last'
WATCH = 'Graphite smartwatch with green display-47.png'
CAL_W = 880; CAL_C = (540, 1100)
LABELS = ('month 1', 'month 6', 'year 1', 'year 2', 'year 3')
HOLDS = [(1.6, 0.8), (3.4, 1.5), (5.2, 1.0), (7.0, 1.0), (8.6, 1.3), (10.2, 1.4), (11.6, 0.9), (13.95, 0.5)]

def setup():
    g = {'c': {'prod': Clip('IMG_1464', 0.5), 'tip1': Clip('IMG_1430', 0.5), 'tip2': X.Window(Clip('IMG_1432', 0.0), 0.0, 3.0),
               'result': X.Window(Clip('IMG_1464', 0.0), 2.0, 5.0), 'best': X.Window(Clip('IMG_1464', 0.0), 1.0, 4.0)}}
    tis = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))
    g['paper'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tis), (222, 200, 128), BUTTER), (W, H)).convert('RGBA')
    cal = S.card('fall', 'Minimal October calendar page-40.png', CAL_W)          # white paper on white: keep its rectangle
    g['sheets'] = []
    for lab in LABELS:                                         # each sheet: the month name covered, our label in DM Serif
        sh = cal.copy(); d = ImageDraw.Draw(sh); d.rectangle((int(sh.width * 0.12), int(sh.height * 0.04), int(sh.width * 0.88), int(sh.height * 0.2)), fill=cal.getpixel((int(cal.width * 0.5), int(cal.height * 0.3))))
        w_ = X.key(lab, 120, WINE, WHITE); sh.alpha_composite(w_, (int(sh.width / 2 - w_.width / 2), int(sh.height * 0.12 - w_.height / 2)))
        g['sheets'].append(C.shadow(sh, (8, 14), 14, 100))
    g['calw'], g['calh'] = cal.size
    g['make'] = P.caption('make it', 200, WHITE); g['last'] = P.caption('LAST', 330, WHITE)
    g['most'] = P.caption('most wear out', 150, INK); g['ayear'] = X.hl('in [a year]', 72, WINE)
    g['tip1'] = X.hl('[rinse after each use]', 62, WHITE); g['tip2'] = X.hl('[store it upright]', 62, BUTTER)
    g['sunday'] = X.hl('[every Sunday]', 64, WINE); g['habit'] = P.caption('a 2-minute habit', 120, INK)
    g['still'] = P.caption('still like new', 140, INK); g['going'] = X.hl('[still going strong]', 62, BUTTER); g['under'] = doodle('under', 0, 560, WHITE)
    g['ring'] = doodle('frame', 0, 520, WINE); g['burst'] = doodle('burst', 2, 1150, WINE)
    g['comment'] = P.caption('Comment', 190, WHITE); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['name'] = X.hl('[Product name]', 56, WINE)
    return g

def calendar(im, g, t, t0, first, last, y=None, k=1.0):
    """The calendar on the paper; from t0 its sheets tear off one by one (first..last), each swinging down off the
    binding and falling; returns the index now on top."""
    cy = CAL_C[1] if y is None else y; n = last - first; top = first
    for i in range(first, last + 1):
        ti = t0 + (i - first) * 0.45
        top = i
        if i == last or t < ti + 0.45: break                      # the first sheet not yet torn off and gone
    for i in range(last, top - 1, -1):                             # draw the stack: deeper sheets first
        sh = g['sheets'][i]; ti = t0 + (i - first) * 0.45
        if i < last and t >= ti:
            u = seg(t, ti, ti + 0.45); rot = 25 * ease(u); dy = 900 * u * u
            put(im, sh, (CAL_C[0] + 120 * u, cy + dy), k, -rot)
        else: put(im, sh, (CAL_C[0], cy), k, 0)
    return top

def tear(old, new, u):
    """A full-screen calendar sheet (the old frame) tears away from its top binding and falls, revealing new."""
    if u <= 0: return old
    if u >= 1: return new
    out = new.copy(); piece = old.rotate(-28 * ease(u), resample=Image.BICUBIC, center=(0, 0))
    out.alpha_composite(C.shadow(piece, (12, 20), 18, 120), (int(160 * u) - 50, int(1300 * u * u) - 50)); return out

def sheet_full(g, i):
    sh = g['sheets'][i]; im = g['paper'].copy(); put(im, sh, (540, 960), W / sh.width * 1.05); return im

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the product, big words, sparkles
        im = c['prod'].at(t); P.say(im, g['make'], t, 0.05, (520, 330), -3); P.say(im, g['last'], t, 0.3, (560, 560), -2)
        X.sparkles(im, t, 0.35, [(140, 300), (960, 380), (980, 720), (110, 760)], BUTTER, 170)
        if t > 1.6: im = swipe(im, stage2(g, t), seg(t, 1.6, 1.8))
        return im
    if t < 3.6:
        im = stage2(g, t)
        if t > 3.4: im = tear(sheet_full(g, 2), c['tip1'].at(t - 3.4), seg(t, 3.4, 3.6))
        return im
    if t < 5.4:                                                    # 3: tip 1
        im = c['tip1'].at(t - 3.4); P.say(im, g['tip1'], t, 3.6, (540, 340), -2)
        if t > 5.2: im = tear(im, c['tip2'].at(t - 5.2), seg(t, 5.2, 5.4))
        return im
    if t < 7.2:                                                    # 4: tip 2
        im = c['tip2'].at(t - 5.2); P.say(im, g['tip2'], t, 5.4, (540, 340), 2)
        if t > 7.0: im = diagonal(im, stage5(g, t), seg(t, 7.0, 7.2))
        return im
    if t < 8.8:
        im = stage5(g, t)
        if t > 8.6: im = swipe(im, stage6(g, t), seg(t, 8.6, 8.8), -1)
        return im
    if t < 10.4:
        im = stage6(g, t)
        if t > 10.2: im = tear(im, c['result'].at(t - 10.2), seg(t, 10.2, 10.4))
        return im
    if t < 11.8:                                                   # 7: the result
        im = c['result'].at(t - 10.2); P.say(im, g['going'], t, 10.4, (540, 1380), -2); doodle_on(im, t, 10.7, g['under'], (540, 1470), -2)
        if t > 11.6: im = swipe(im, c['best'].at(0), seg(t, 11.6, 11.8))
        return im
    im = c['best'].at(t - 11.8)                                     # 8: CTA
    P.say(im, g['comment'], t, 11.9, (540, 1000), -3); P.say(im, g['kw'], t, 12.15, (540, 1200), 2); P.say(im, g['name'], t, 12.35, (540, 1340), -2)
    return im

def stage2(g, t):
    im = g['paper'].copy(); k = back_out(seg(t, 1.8, 2.1), 1.3)
    calendar(im, g, t, 2.4, 0, 2, lerp(-900, CAL_C[1], k))
    P.say(im, g['most'], t, 2.0, (540, 330), -3); P.say(im, g['ayear'], t, 2.25, (560, 500), 2)
    return im

def stage5(g, t):
    """The smartwatch stands on the paper; its whole screen is the reminder clip (the habit, weekly)."""
    im = g['paper'].copy(); k = back_out(seg(t, 7.2, 7.5), 1.3)
    put(im, P.on_screen(WATCH, 560, g['c']['tip1'].at(t - 7.2)), (540, lerp(2400, 1050, k)), 1, -4)
    P.say(im, g['habit'], t, 7.4, (540, 330), -3); P.say(im, g['sunday'], t, 7.6, (540, 1640 - 180), 2)
    return im

def stage6(g, t):
    im = g['paper'].copy(); doodle_on(im, t, 9.6, g['burst'], CAL_C, 0)
    calendar(im, g, t, 8.9, 2, 4)
    if t > 9.8: doodle_on(im, t, 9.8, g['ring'], (CAL_C[0], CAL_C[1] - g['calh'] * 0.38), 3)
    P.say(im, g['still'], t, 9.9, (540, 330), -3)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 14.0 + sum(h for _, h in HOLDS); render('24', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
