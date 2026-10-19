"""#21 Small batch, motion test round 3 (2026-10-19). Round 2 was rejected outright ("I don't like anything about it").
Fresh concept: the numbered edition. Small batch = each one is numbered and signed like an art print. A real fountain
pen writes "No. [07] of [24]" on a real vintage card as you watch; a gold foil seal; the batch, close; the card turns
over to the next batch date on a real calendar page with the date ringed. Calm blush paper stage; palette pink + wine.
IG-friendly intro: frame 1 is the batch video, big words. Built the round-3 way (play_extra holds, locked type).
The REAL count only (pack rule): no fake "almost gone".
Story (5 beats): hook "only [24] made" / problem: not a factory, a small batch / product: each one numbered, by hand /
proof: [each one signed] / CTA: comment [KEYWORD].
Scenes (graphics-only: 2, 6):
 1 0.0  the batch video, full frame; big "only [24]" / "made" with sparkles
 2 1.8  PAPER, no video: the vintage card lands; the fountain pen writes "No. 07 of 24" across it as you watch
 3 3.8  one picked up, full frame; the card (carried) slides into the corner, a gold foil seal sticks onto it
 4 5.4  the slow pass along the batch, inside the card's window (the card is a frame now); "[each one signed by hand]"
 5 7.0  the card window grows to full frame: the batch, close
 6 8.4  PAPER: the card flips over; behind it a real calendar page; the pen rings a date: "next batch: [Oct 30]"
 7 10.0 one being packed, full frame; "[yours ships Friday]" + one underline
 8 11.6 CTA: Comment / [KEYWORD] / [Product name]
Usage: python build/motion_21.py [seconds ...]  ->  21-small-batch/preview/motion-test.mp4 (or a test sheet)
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
from motion_b2 import Clip, put, draw_on, render, camera, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (24, 23, 22), (246, 241, 232); WINE, PINK = X.WINE, X.PINK                 # her palette: pink + wine
X.use_type(PINK, WINE); X.enable_holds()
DIR = '21-small-batch'
CARD_W = 860; CARD_C = (540, 1040)
HOLDS = [(1.6, 0.9), (3.6, 1.3), (5.2, 0.6), (6.8, 1.4), (8.2, 0.5), (9.8, 1.5), (11.4, 1.1), (13.95, 0.5)]

def setup():
    g = {'c': {'batch': Clip('IMG_1522', 0.0, 4.0), 'pick': X.Window(Clip('IMG_1471', 0.0), 5.5, 8.0), 'pass': Clip('IMG_1522', 0.0, 4.0),
               'pack': X.Window(Clip('IMG_1474', 0.0), 15.0, 17.0), 'cta': Clip('IMG_1472', 1.0)}}
    tis = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))
    g['paper'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tis), (226, 168, 192), PINK), (W, H)).convert('RGBA')
    pc = S.raw('images', 'Blank vintage cream postcard-111.png'); w_, h_ = pc.size
    card = pc.crop((int(w_ * 0.1), int(h_ * 0.12), int(w_ * 0.9), int(h_ * 0.88))).resize((CARD_W, int(CARD_W * 0.66))).convert('RGBA')
    g['card'] = card; g['cw'], g['ch'] = card.size
    pen = Image.open(S.E.PACK / 'build' / '.cache' / 'hq' / 'Vintage fountain pen with gold nib-51.png').convert('RGBA')
    g['pen'] = C.shadow(S.fitw(pen, 760), (10, 22), 14, 110); g['penL'] = 760
    f = S.F(S.HAND, 120); txt = 'No. 07 of 24'; l, t, r, b = f.getbbox(txt)
    hw = Image.new('RGBA', (r - l + 20, b - t + 30), (0, 0, 0, 0)); ImageDraw.Draw(hw).text((10 - l, 10 - t), txt, font=f, fill=WINE, stroke_width=2, stroke_fill=WINE); g['hand'] = hw
    seal = P.raw_cut('Blank gold foil seal sticker-175.png', 230).copy(); ImageDraw.Draw(seal).text((seal.width / 2, seal.height / 2), 'small\nbatch', font=S.F(X.SERIF, 52), fill=WINE, anchor='mm', align='center')
    g['seal'] = P.die_cut(seal, 6)
    cal = S.card('fall', 'Minimal October calendar page-40.png', 820); g['cal'] = C.shadow(cal, (8, 14), 14, 100); g['calsize'] = cal.size
    g['only'] = P.caption('only [24]', 260, WHITE); g['made'] = P.caption('made this week', 140, WHITE)
    g['numbered'] = P.caption('each one', 170, INK); g['numbered2'] = P.caption('numbered', 220, INK); g['each'] = X.hl('[each one signed by hand]', 60, WINE); g['next'] = X.hl('next batch: [Oct 30]', 64, WHITE)
    g['ships'] = X.hl('[yours ships Friday]', 62, PINK); g['under'] = doodle('under', 0, 520, WHITE); g['ring'] = doodle('frame', 0, 190, WINE)
    g['comment'] = P.caption('Comment', 190, WHITE); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE); g['name'] = X.hl('[Product name]', 56, WINE)
    return g

def pen_at(im, g, nib, k=1.0):
    """The real fountain pen with its nib at `nib`, held at a writing angle."""
    L = g['penL'] * k; a = math.radians(35); put(im, g['pen'], (nib[0] + 0.5 * L * math.cos(a), nib[1] - 0.5 * L * math.sin(a)), k, 35)

def card_scene(g, t, t_in, write_t=None, clip=None, y=None, scale=1.0):
    """The vintage card on the paper; the pen writes the number from write_t; or a clip plays in its window."""
    im = g['paper'].copy(); k = back_out(seg(t, t_in, t_in + 0.35), 1.3) if t_in is not None else 1
    c = g['card'].copy()
    hx, hy = int(g['cw'] / 2 - g['hand'].width / 2), int(g['ch'] * 0.5 - g['hand'].height / 2)
    if clip is not None:
        ins = 40; c.alpha_composite(ImageOps.fit(clip, (g['cw'] - 2 * ins, g['ch'] - 2 * ins)).convert('RGBA'), (ins, ins))
    elif write_t is not None:
        u = seg(t, write_t, write_t + 1.1)
        if u > 0:
            hw = g['hand'].copy(); a = hw.split()[3]; ImageDraw.Draw(a).rectangle((int(hw.width * u), 0, hw.width, hw.height), fill=0); hw.putalpha(a); c.alpha_composite(hw, (hx, hy))
    cy = (CARD_C[1] if y is None else y); put(im, C.shadow(c, (10, 18), 16, 110), (CARD_C[0], lerp(2400, cy, k)), scale, -3)
    if write_t is not None and clip is None and 0 < seg(t, write_t - 0.2, write_t + 1.4) < 1:
        u = seg(t, write_t, write_t + 1.1); nx = CARD_C[0] - g['hand'].width / 2 + g['hand'].width * u
        pen_at(im, g, (nx, cy + 10 - 25 * math.sin(u * 30) * (0 < u < 1)))
    return im

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the batch, big words, sparkles
        im = c['batch'].at(t); P.say(im, g['only'], t, 0.05, (540, 360), -3); P.say(im, g['made'], t, 0.35, (540, 560), 2)
        X.sparkles(im, t, 0.4, [(130, 300), (960, 260), (990, 650), (100, 700)], PINK, 160)
        if t > 1.6: im = swipe(im, card_scene(g, t, 1.8), seg(t, 1.6, 1.8))
        return im
    if t < 3.8:                                                    # 2: the pen writes the number on the card
        im = card_scene(g, t, 1.8, write_t=2.3); P.say(im, g['numbered'], t, 1.9, (520, 360), -3); P.say(im, g['numbered2'], t, 2.1, (560, 560), 2)
        if t > 3.6: im = diagonal(im, c['pick'].at(t - 3.6), seg(t, 3.6, 3.8))
        return im
    if t < 5.4:                                                    # 3: one picked up; the card (carried) in the corner, the seal sticks on
        im = c['pick'].at(t - 3.6); u = ease(seg(t, 3.8, 4.2)); small = card_scene_small(g, 1.0)
        put(im, small, lerp2((540, 1040), (300, 400), u), lerp(1.0, 0.42, u) * 1.0, -6 * u)
        k = back_out(seg(t, 4.4, 4.7), 2.2)
        if k > 0: put(im, g['seal'], (430, 470), lerp(2.0, 0.8, min(1, k)), -12)
        if t > 5.2: im = swipe(im, card_scene(g, t, None, clip=c['pass'].at(t - 5.2)), seg(t, 5.2, 5.4), -1)
        return im
    if t < 7.0:                                                    # 4: the slow pass inside the card's window
        im = card_scene(g, t, None, clip=c['pass'].at(t - 5.2)); put(im, g['seal'], (CARD_C[0] + 300, CARD_C[1] - 230), 0.9, -12)
        P.say(im, g['each'], t, 5.5, (540, 1500), -2)
        return im
    if t < 8.4:                                                    # 5: the card window grows to full frame
        u = ease(seg(t, 7.0, 7.5)); z = lerp(1, 1.5, u)
        im = camera(card_scene(g, t, None, clip=c['pass'].at(t - 5.2)), CARD_C, z) if u < 1 else c['pass'].at(t - 5.2)
        if t > 8.2: im = swipe(im, stage6(g, t), seg(t, 8.2, 8.4))
        return im
    if t < 10.0:
        im = stage6(g, t)
        if t > 9.8: im = diagonal(im, c['pack'].at(t - 9.8), seg(t, 9.8, 10.0))
        return im
    if t < 11.6:                                                   # 7: packed
        im = c['pack'].at(t - 9.8); P.say(im, g['ships'], t, 10.1, (540, 1380), -2); doodle_on(im, t, 10.4, g['under'], (540, 1470), -2)
        if t > 11.4: im = swipe(im, c['cta'].at(0), seg(t, 11.4, 11.6), -1)
        return im
    im = c['cta'].at(t - 11.6)                                      # 8: CTA
    P.say(im, g['comment'], t, 11.7, (540, 1000), -3); P.say(im, g['kw'], t, 11.95, (540, 1200), 2); P.say(im, g['name'], t, 12.15, (540, 1340), -2)
    return im

def card_scene_small(g, u):
    c = g['card'].copy(); hw = g['hand']; c.alpha_composite(hw, (int(g['cw'] / 2 - hw.width / 2), int(g['ch'] * 0.5 - hw.height / 2)))
    return C.shadow(c, (10, 18), 16, 110)

def stage6(g, t):
    """The card flips over (squash) and a real calendar page lands; the pen rings the next batch date."""
    im = g['paper'].copy(); u = seg(t, 8.4, 8.8); sx = abs(math.cos(math.pi * u))
    if u < 0.5:
        cd = card_scene_small(g, 1); cd = cd.resize((max(2, int(cd.width * sx)), cd.height)); put(im, cd, CARD_C, 1, -3)
    else:
        k = back_out(seg(t, 8.6, 8.95), 1.3); put(im, g['cal'], (540, lerp(2400, 1060, k)), 1, 2)
        cw, ch = g['calsize']; day = (540 - cw / 2 + cw * 0.73, 1060 - ch / 2 + ch * 0.78)   # a date square on the grid
        if t > 9.1: doodle_on(im, t, 9.1, g['ring'], day, 0)
        if 9.0 < t < 9.6: pen_at(im, g, (day[0] + 60 * math.cos(t * 12), day[1] + 40 * math.sin(t * 12)))
        P.say(im, g['next'], t, 9.2, (540, 360), -2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 14.0 + sum(h for _, h in HOLDS); render('21', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
