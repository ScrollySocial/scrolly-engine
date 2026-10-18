"""#06 Start to finish, motion test (2026-10-18), built the #09/#10/#12 round 3 way (story5.py).
World: a maker's workbench (worn workshop wood), a real checklist pad that gets written on and ticked as the Reel
goes, real tools that arrive with their words (measuring spoons with the materials, the hourglass with the wait).
Accent buyers change: muted ochre. Home bases: the buyer's making clips + the workbench checklist (new tick each visit).

Story (5 beats): hook: fast cuts of the whole make under "start to finish" / problem: nobody sees the work behind
one [product] / product: every step / proof: the finished one / CTA: comment [KEYWORD].
Scenes (15 s; graphics-only: 2, 5; tech: 9):
 1 0.0  fast cuts (4 clips in 2 s) under "making one" [product] "start to finish"
 2 2.0  BENCH, no video: the checklist slides in; the steps write themselves in, line by line
 3 3.6  the raw materials full frame; the measuring spoons and twine spool cross the edges; pill
 4 5.0  step 1 full frame (swipe in); STEP 1 sticker + [what] pill; arrow AT the work
 5 6.5  BENCH, no video: box 1 ticked, the hourglass flips (time passing); the camera dives into box 2...
 6 7.7  ...step 2 full frame; a ">> 2x" speed sticker (the template speeds long steps)
 7 9.2  step 3 in a tall arch window on the bench that grows to full frame; STEP 3 + pill; burst
 8 10.9 BENCH: all ticked, DONE ringed; the camera dives into DONE: the finished reveal, full frame
 9 13.0 CTA, tech: a phone on the bench scrolls the shop and stops on it; Comment / [KEYWORD] / [made by hand in]
Usage: python build/motion_06.py [seconds ...]  ->  06-start-to-finish/preview/motion-test.mp4 (or a test sheet)
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

INK, CRM = (28, 27, 26), (246, 241, 232); OCHRE = (176, 128, 48)        # OCHRE = the accent buyers change
HANDPHONE = 'Hand Holding Graphite Smartphone with Green Screen-40.png'
DIR = '06-start-to-finish'
PAD_W = 760; PAD_C = (540, 1000); ROWS = (0.217, 0.344, 0.469, 0.594, 0.722); BOX_X = 0.20
LINES = ('[the fruit]', 'Step 1: [prep]', 'Step 2: [mix]', 'Step 3: [blend]', 'Done!')

def pad_xy(fx, fy, k=1.0):
    h = PAD_W * 1048 / 638; return (PAD_C[0] + (fx - 0.5) * PAD_W * k, PAD_C[1] + (fy - 0.5) * h * k)

def setup():
    g = {'c': {'raw': Clip('IMG_1393', 0.5), 's1': Clip('IMG_1387', 1.5), 's2': Clip('IMG_1389', 2.5), 's3': Clip('IMG_1390', 2.0),
               'done': Clip('IMG_1391', 0.0, 1.5), 'done2': Clip('IMG_1394', 1.0)}}
    bench = ImageOps.fit(S.raw('images', 'Warm worn workshop wood texture-15.png'), (W, H)).convert('RGBA'); g['bench'] = bench
    pad = P.raw_cut('Minimal white six-box checklist pad-169.png', PAD_W)
    g['pad'] = P.style_object(pad, None, None, stars=0, label=P.sticker('TO DO', 46, OCHRE), label_at=(0.72, 0.08), edge=8)
    g['pad_off'] = ((g['pad'].width - pad.width) / 2, (g['pad'].height - pad.height) / 2)
    f = S.F(S.HAND, 74); g['lines'] = []
    for txt in LINES:
        im = Image.new('RGBA', (int(f.getlength(txt) + 20), 120), (0, 0, 0, 0)); ImageDraw.Draw(im).text((10, 60), txt, font=f, fill=INK, anchor='lm', stroke_width=1, stroke_fill=INK); g['lines'].append(im)
    g['ticks'] = [doodle('tick', i % 3, 120, OCHRE) for i in range(5)]
    g['spoons'] = P.thing('Four nested stainless steel measuring spoons-165.png', 420, 'stripes', OCHRE, scale=0.3, strength=0.6)
    g['spool'] = P.thing('Natural jute twine spool with loose curl-134.png', 340, 'dots', INK, scale=0.35, strength=0.6)
    g['glass'] = P.thing('Classic wooden hourglass with flowing sand-238.png', 300, 'smalldots', OCHRE, scale=0.3, strength=0.6)
    g['making'] = P.pill_m('making one [smoothie]', 58, INK, CRM); g['start'] = P.caption('start to', 170, OCHRE); g['finish'] = P.caption('finish', 230, INK)
    g['every'] = P.caption('every step', 140, OCHRE)
    g['rawp'] = P.pill_m('the raw materials', 58, INK, CRM)
    g['st'] = [P.sticker(f'STEP {i}', 60, OCHRE if i != 2 else INK, WHITE) for i in (1, 2, 3)]
    g['sp'] = [P.pill_m(t, 56, INK, CRM) for t in ('[cut the fruit]', '[measure + pour]', '[blend 60 seconds]')]
    g['speed'] = P.sticker('>> 2x', 70, INK, WHITE)
    g['wait'] = P.caption('worth the wait', 100, OCHRE)
    g['ta'] = P.caption('ta-da', 200, OCHRE)
    g['comment'] = P.caption('Comment', 180, OCHRE, 'stripes'); g['kw'] = P.pill_m('"[KEYWORD]"', 64, CRM, INK); g['town'] = P.pill_m('[made by hand in Austin]', 48, INK, CRM)
    g['d_ring'] = doodle('frame', 0, 420, OCHRE); g['d_arrow'] = doodle('arrow', 9, 250, WHITE); g['d_burst'] = doodle('burst', 1, 340, OCHRE)
    g['d_under'] = doodle('under', 4, 640, OCHRE)
    sw, sh = P.screen_size(HANDPHONE, 860); g['sr'] = sh / sw
    g['feed'] = P.feed([(S.footage(cl), nm, pr) for cl, nm, pr in ((('IMG_1388', 2.0), '[Product 1]', '[$8]'), (('IMG_1395', 0.5), '[Product 2]', '[$9]'),
                         (('IMG_1390', 8.0), '[Product 3]', '[$8]'), (('IMG_1391', 0.5), '[THE ONE]', '[$9]'))], w=sw, accent=OCHRE)
    return g

def bench(g, t, t_in, written, ticked, tick_t=None, ring_t=None):
    """The workbench with the checklist: `written` lines shown (writing in from t_in), `ticked` boxes ticked."""
    im = g['bench'].copy(); k = back_out(seg(t, t_in, t_in + 0.3), 1.4) if t_in is not None else 1
    put(im, g['pad'], (PAD_C[0], lerp(2600, PAD_C[1], k)), 1, 0)
    if k < 0.98: return im
    for i in range(written):
        x, y = pad_xy(BOX_X + 0.13, ROWS[i]); u = seg(t, (t_in or 0) + 0.3 + i * 0.22, (t_in or 0) + 0.5 + i * 0.22) if t_in is not None else 1
        draw_on(im, g['lines'][i], (x + g['lines'][i].width / 2, y), u)
    for i in range(ticked):
        x, y = pad_xy(BOX_X, ROWS[i]); u = seg(t, tick_t, tick_t + 0.25) if (tick_t is not None and i == ticked - 1) else 1
        draw_on(im, g['ticks'][i], (x + 10, y - 10), u)
    if ring_t is not None:
        x, y = pad_xy(BOX_X + 0.3, ROWS[4]); doodle_on(im, t, ring_t, g['d_ring'], (x, y), 3)
    return im

def frame(g, t):
    c = g['c']
    if t < 2.0:                                                    # 1: fast cuts under the hook
        cl = (c['raw'], c['s1'], c['s3'], c['done2'])[min(3, int(t / 0.5))]; im = cl.at(t % 0.5 + 0.3)
        P.say(im, g['making'], t, 0.05, (540, 330), -2); P.say(im, g['start'], t, 0.3, (520, 840), -3); P.say(im, g['finish'], t, 0.55, (560, 1040), -2)
        doodle_on(im, t, 0.9, g['d_under'], (560, 1170), -2)
        if t > 1.75: im = swipe(im, bench(g, t, 1.9, 5, 0), seg(t, 1.75, 2.0))
        return im
    if t < 3.6:                                                    # 2: the checklist writes itself in
        im = bench(g, t, 1.9, 5, 0); P.say(im, g['every'], t, 2.4, (540, 300), -2)
        if t > 3.35: im = diagonal(im, c['raw'].at(t - 3.35), seg(t, 3.35, 3.6))
        return im
    if t < 5.0:                                                    # 3: the raw materials; tools cross the edges
        im = c['raw'].at(t - 3.35); put(im, g['spoons'], (lerp(-300, 160, ease(seg(t, 3.6, 3.95))), 1180), 1, 25)
        put(im, g['spool'], (lerp(W + 300, 930, ease(seg(t, 3.75, 4.1))), 640), 1, -10)
        P.say(im, g['rawp'], t, 3.8, (500, 330), -2)
        if t > 4.75: im = swipe(im, c['s1'].at(t - 4.75), seg(t, 4.75, 5.0))
        return im
    if t < 6.5:                                                    # 4: step 1
        im = c['s1'].at(t - 4.75); put(im, g['st'][0], (230, 340), back_out(seg(t, 5.0, 5.3)) * 1.2, -6)
        P.say(im, g['sp'][0], t, 5.2, (540, 1380), -2); doodle_on(im, t, 5.5, g['d_arrow'], (300, 1080), -40)
        if t > 6.25: im = swipe(im, bench(g, t, None, 5, 1, 6.6), seg(t, 6.25, 6.5), -1)
        return im
    if t < 7.7:                                                    # 5: box 1 ticked; the hourglass flips; dive into box 2
        im = bench(g, t, None, 5, 1, 6.6); fl = ease(seg(t, 6.8, 7.1)); put(im, g['glass'], (900, 1560), back_out(seg(t, 6.5, 6.75)), 180 * fl)
        x, y = pad_xy(BOX_X + 0.25, ROWS[2])
        if t > 7.25: im = camera(im, (x, y), lerp(1, 6, ease(seg(t, 7.25, 7.7)) ** 2))
        return im
    if t < 9.2:                                                    # 6: step 2, sped up
        im = camera(c['s2'].at((t - 7.7) * 2), (540, 900), lerp(1.4, 1, ease(seg(t, 7.7, 8.0))))
        put(im, g['st'][1], (230, 340), back_out(seg(t, 7.8, 8.1)) * 1.2, 6); P.say(im, g['sp'][1], t, 8.0, (540, 1380), 2)
        P.say(im, g['speed'], t, 8.3, (800, 560), 8)
        return im
    if t < 10.9:                                                   # 7: step 3 in a tall arch on the bench, growing to full
        u = ease(seg(t, 9.6, 10.2)); im = g['bench'].copy(); aw, ah = int(lerp(560, W, u)), int(lerp(900, H, u))
        v = c['s3'].at(t - 9.2, (aw, ah)); m = Image.new('L', (aw, ah), 0); r = int(aw / 2 * (1 - u))
        ImageDraw.Draw(m).rounded_rectangle((0, 0, aw - 1, ah - 1), 1, fill=255)
        if r > 2: ImageDraw.Draw(m).rectangle((0, 0, aw, r), fill=0); ImageDraw.Draw(m).pieslice((0, 0, aw - 1, 2 * r), 180, 360, fill=255)
        v.putalpha(m); put(im, v if u > 0.98 else C.shadow(v, (8, 14), 14, 100), (540, lerp(1000, 960, u)), 1, 0)
        k = back_out(seg(t, 9.2, 9.5)); put(im, g['st'][2], (230, 340), k * 1.2, -4)
        if u < 0.3: put(im, g['glass'], (900, 1300), 1 - u * 3, 180)
        P.say(im, g['sp'][2], t, 9.45, (540, 1380), -2); doodle_on(im, t, 10.2, g['d_burst'], (780, 640), 0, 10.8)
        if t > 10.65: im = diagonal(im, bench(g, t, None, 5, 4, 10.95, 11.2), seg(t, 10.65, 10.9))
        return im
    if t < 13.0:                                                   # 8: all ticked; DONE ringed; dive into it: the reveal
        if t < 11.6:
            im = bench(g, t, None, 5, 5, 10.95, 11.2); x, y = pad_xy(BOX_X + 0.3, ROWS[4])
            if t > 11.3: im = camera(im, (x, y), lerp(1, 6, ease(seg(t, 11.3, 11.6)) ** 2))
            return im
        im = camera(c['done'].at(t - 11.6), (540, 960), lerp(1.4, 1, ease(seg(t, 11.6, 11.9)))) if t < 12.3 else c['done2'].at(t - 12.3)
        P.say(im, g['ta'], t, 11.75, (540, 760), -4); P.say(im, g['wait'], t, 12.1, (540, 960), 2)
        return im
    im = g['bench'].copy(); f, ch, top = g['feed']                 # 9: CTA, the shop feed on a phone stops on it
    scr = P.phone_scroll(f, ch, top, seg(t, 13.1, 13.9), 3, g['sr'])
    put(im, P.on_screen(HANDPHONE, 860, scr), (650, lerp(2300, 1320, ease(seg(t, 13.0, 13.3)))), 1, -4)
    P.say(im, g['comment'], t, 13.3, (520, 330), -3); P.say(im, g['kw'], t, 13.55, (520, 480), 2); P.say(im, g['town'], t, 13.75, (480, 610), -2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render('06', fr, 15.0, out); X.strip_sheet(DIR, 15)

if __name__ == '__main__':
    main()
