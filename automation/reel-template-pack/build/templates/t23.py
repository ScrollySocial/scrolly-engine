"""23 Every option in 10 seconds, approved 2026-10-18 as the round-4 motion test (build/story7.py, "no changes").
The buyer's seven clips are real CapCut clip layers: their shop scrolling on the phone (a screen recording), and six
options (full frame one after another, two in the glasses' lenses, all six on the shelf at the end). The fan deck,
chips, glasses, shelf and DM Serif words play as a flipbook from the motion test (build/motion_capcut.py).
Editable Montserrat: in 10 seconds, the six option names, pause on, the keyword, all 6 at shop.
CapCut limits: the option behind the glasses stays in colour; the fan wipes between options are cuts (the giant chip
sweeps stay)."""
import contextlib
from PIL import Image, ImageOps
from engine import Layers, W, H
import motion_capcut as MC
import play as P
import story7 as S7

SL = P.SLOW; END = S7.SECS['23'] * SL; ST = S7.STEP23
SPEC = dict(num='23', title='Every option in 10 seconds', subtitle='25 seconds. Seven clips: your shop scrolling, then six options.',
            font='montserrat', dir='23-every-option-in-10-seconds', folder='Template 23 - Every option in 10 seconds',
            project='Scrolly 23 Every option in 10 seconds', cover_at=1.0,
            slots=[('Option 1', 'One colour, scent or style, upright'), ('Option 2', 'The next one, same framing'),
                   ('Option 3', 'The next one, same framing'), ('Option 4', 'The next one, same framing'),
                   ('Option 5', 'The next one, same framing'), ('Option 6', 'The last one, same framing'),
                   ('Your shop, scrolling', 'A screen recording of you scrolling your shop')],
            test_clips=[(n, 1.0) for n in S7.OPT] + [('IMG_1417', 0.5)])
INK, WHITE, WINE, BLUE = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['blue']
BLANK = Image.new('RGBA', (2, 2), (0, 0, 0, 0))
OK = ('m', 'c', 'y', 'b', 'o', 'g')
TESTN = ('Sage', 'Plum', 'Slate', 'Cocoa', 'Blush', 'Ivory')

def sz(px): return round(px * 0.85 / 6.1, 2)

@contextlib.contextmanager
def flip_mode(g):
    keep = dict(g); keep_c = list(g['c']); gs = ImageOps.grayscale
    g['c'][:] = [MC.KeyClip(MC.KEYS[k]) for k in OK]
    gim, top, row = g['grid']; g['grid'] = (MC.KeySheet(MC.KEYS['b'], gim.size), top, row)
    for k in ('ten', 'pause', 'kw', 'all'): g[k] = BLANK
    g['names'] = [BLANK] * 6
    ImageOps.grayscale = lambda im: im
    try: yield
    finally:
        ImageOps.grayscale = gs; c = g['c']; c[:] = keep_c; g.clear(); g.update(keep); g['c'] = c

def layers():
    g = Layers(); s = S7.setup_23(); peg = s['peg']
    g.art('peg', peg, (0, END), 0, (540, 960))
    with flip_mode(s):
        s['peg'] = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        frames, track = MC.flipbook(lambda t: S7.frame_23(s, t / SL), 0, END)
    s['peg'] = peg
    g.flip('fx', frames, 0, 40)

    full = lambda t: (540, 960, 1.0, 0); sw, sh = s['scr']
    segs = [('b', 6, 2.2 * SL, 4.0 * SL, (sw, sh), 3, None, lambda t: t - 2.2 * SL)]
    starts = {i: 4.0 + ST * i for i in range(4)}; starts.update({4: 10.8, 5: 10.8 + ST})
    for i in range(6):
        a = starts[i] - (0.3 if i == 0 else 0 if i == 4 else 0.28)   # option 5 comes straight after the glasses (a cut)
        b = starts[i] + ST if i not in (3, 5) else (9.0 if i == 3 else 13.3)
        segs.append((OK[i], i, a * SL, b * SL, (W, H), 0, None, (lambda t, s0=starts[i]: t - s0 * SL), full))
    gl = s['glasses']; k = gl.width / 1316; gx, gy = 540 - gl.width / 2, 900 - gl.height / 2
    segs.append(('b', 3, 9.0 * SL, 10.8 * SL, (W, H), 0, None, lambda t: t - 4.0 * SL, full))       # option 4 behind the glasses
    for (bx, i) in ((S7.LENS_L, 4), (S7.LENS_R, 5)):
        x0, y0, x1, y1 = [int(v * k) for v in bx]
        segs.append((OK[i], i, 9.0 * SL, 10.8 * SL, (x1 - x0, y1 - y0), 0, 'circle', lambda t: t - 9.0 * SL))
    for i in range(6):
        segs.append((OK[i], i, 15.0 * SL, END, (230, 170), (3, -3)[i % 2], None, lambda t: t - 15.0 * SL))
    MC.clip_layers(g, track, segs, z0=1)

    z = [60]
    def say(words, test, px, t0, t1, pos, rot, box=(255, 255, 255), color=INK, round_=0.0, pop_=True):
        z[0] += 1; k_ = {'scale': MC.popk(0, (0.3 if pop_ else 0.25) * SL)}
        g.text('montserrat', sz(px), (words, test), (t0 * SL, t1 * SL), z[0], pos, rot, k_, color=color, box=box and (box, round_))
    say('[in 10 seconds]', 'in 10 seconds', 80, 0.5, 2.2, (540, 580), 0, box=BLUE)
    for i in range(6):
        end = starts[i] + ST if i not in (3, 5) else (9.0 if i == 3 else 13.3)
        say(f'[OPTION {i + 1}]', TESTN[i], 80, starts[i], end, (540, 1390), 4)
    say('[OPTION 5]', TESTN[4], 80, 9.5, 10.8, (290, 1460), 5); say('[OPTION 6]', TESTN[5], 80, 9.65, 10.8, (790, 1460), -1)
    say('pause on', 'pause on', 78, 13.4, 15.0, (540, 330), 4)
    say('"[KEYWORD]"', '"COLOURS"', 76, 15.7, END / SL, (540, 460), -2, box=WINE, color=WHITE, round_=1.0)
    say('all [6] at [shop]', 'all 6 at my shop', 70, 15.9, END / SL, (540, 580), 4, box=BLUE)
    return g
