"""22 Put it to the test, approved 2026-10-18 as the round-4 motion test (build/story7.py, "no changes").
The buyer's four clips are real CapCut clip layers: the test (full frame, punching in), the setup (inside the big
magnifier lens), the result (opening out of the small lens to full frame) and the ending (a card on the paper). The
rest (lens, tubes, notes, doodles, stamp, the strip slice, DM Serif words) plays as a flipbook from the motion test
(build/motion_capcut.py). Editable Montserrat: I tried to / ruin it, does it really / STAY DRY?, the claim note, one
take, watch closely, IT STAYED DRY, the keyword.
CapCut limits: the lens shows the middle of the setup clip; the result's circle opens on the middle of the clip, then
cuts to the full frame; swipes are plain slides."""
import contextlib, math
from PIL import Image
from engine import Layers, W, H
import motion_capcut as MC
import play as P
import story7 as S7

SL = P.SLOW; END = S7.SECS['22'] * SL
SPEC = dict(num='22', title='Put it to the test', subtitle='25 seconds. Four clips: the setup, the test in one take, the result, you.',
            font='montserrat', dir='22-put-it-to-the-test', folder='Template 22 - Put it to the test',
            project='Scrolly 22 Put it to the test', cover_at=1.0,
            slots=[('The setup', 'Your product before the test, upright'),
                   ('The test, one take', 'The whole test, no cuts (at least 6 seconds)'),
                   ('The result', 'The result, close up'),
                   ('You, at the end', 'You or your product, upright')],
            test_clips=[('IMG_1430', 1.0), ('IMG_1460', 0.0), ('IMG_1463', 1.0), ('IMG_1431', 1.0)])
INK, WHITE, DEEP, BUTTER, BLUE = (24, 23, 22), (255, 255, 255), S7.DEEP, P.PAL['butter'], P.PAL['blue']
BLANK = Image.new('RGBA', (2, 2), (0, 0, 0, 0))
NOTE = 'claim:\n[stays dry]'

def sz(px): return round(px * 0.85 / 6.1, 2)

@contextlib.contextmanager
def flip_mode(g):
    keep = dict(g); keep_c = list(g['c']); sw = S7.swipe
    g['c'][:] = [MC.KeyClip(MC.KEYS[k]) for k in ('m', 'c', 'y', 'b')]
    for k in ('tried', 'really', 'oneTake', 'watch', 'said', 'kw', 'claim'): g[k] = BLANK
    g['ruin'] = []; g['note_claim'] = P.sticky('', 440)
    def slide(old, new, u, direction=1):
        if u <= 0: return old
        if u >= 1: return new
        dx = int(direction * S7.ease(u) * W); out = Image.new('RGBA', (W, H)); out.alpha_composite(old, (-dx, 0)); out.alpha_composite(new, (direction * W - dx, 0)); return out
    S7.swipe = slide
    try: yield
    finally:
        S7.swipe = sw; c = g['c']; c[:] = keep_c; g.clear(); g.update(keep); g['c'] = c

def slide_out(t0, x, at):
    return [(0, x)] + [((at + 0.05 * k - t0) * SL, x - S7.ease(k / 6) * W) for k in range(7)]

def layers():
    g = Layers(); s = S7.setup_22(); paper = s['paper']
    g.art('paper', paper, (0, END), 0, (540, 960))
    with flip_mode(s):
        s['paper'] = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        frames, track = MC.flipbook(lambda t: S7.frame_22(s, t / SL), 0, END)
    s['paper'] = paper
    g.flip('fx', frames, 0, 40)

    rb = s['lens_big'][2]; ox, oy, r0 = s['lens']; lc = (640 + ox, 1400 + oy)
    def punch(t):
        ts = t / SL; return 540 - S7.ease(S7.seg(ts, 1.9, 2.2)) * W, 960, S7.lerp(1.12, 1.0, S7.ease(S7.seg(ts, 0, 0.6))), 0
    def opens(t):
        gr = S7.ease(S7.seg(t / SL, 12.6, 13.3)); c = S7.lerp2(lc, (540, 960), gr); return c[0], c[1], S7.lerp(r0, 1300, gr) / r0, 0
    def card(t):
        u = S7.ease(S7.seg(t / SL, 15.6, 15.9)); c = S7.lerp2((W / 2, H / 2), (540, 1020), u); return c[0], c[1], S7.lerp(1415, 560, u) / 560, -2 * u
    full = lambda t: (540, 960, 1.0, 0)
    MC.clip_layers(g, track, [
        ('c', 1, 0, 2.2 * SL, (W, H), 0, None, lambda t: t + 2.0 * SL, punch),
        ('m', 0, 1.9 * SL, 4.9 * SL, (int(2 * rb), int(2 * rb)), 0, 'circle', lambda t: t - 2.2 * SL),
        ('c', 1, 6.3 * SL, 10.8 * SL, (W, H), 0, None, lambda t: t - 6.6 * SL, full),
        ('y', 2, 12.4 * SL, 13.4 * SL, (int(2 * r0), int(2 * r0)), 0, 'circle', lambda t: t - 12.4 * SL, opens),
        ('y', 2, 13.4 * SL, 15.6 * SL, (W, H), 0, None, lambda t: t - 12.4 * SL, full),
        ('b', 3, 15.6 * SL, END, (560, 760), 0, None, lambda t: t - 15.6 * SL, card)], z0=1)

    z = [60]
    def say(words, test, px, t0, t1, pos, rot, box=(255, 255, 255), color=INK, kf_x=None, round_=0.0, stroke=None, size=None):
        z[0] += 1; k = {'scale': MC.popk(0, 0.3 * SL)}
        if kf_x: k['x'] = kf_x
        g.text('montserrat', size or sz(px), (words, test), (t0 * SL, t1 * SL), z[0], pos, rot, k, color=color, box=box and (box, round_), stroke=stroke)
    say('I tried to', 'I tried to', 80, 0.1, 2.2, (340, 320), 5, kf_x=slide_out(0.1, 340, 1.9))
    say('[ruin] it', 'spill on it', 0, 0.35, 2.2, (540, 500), 0, box=None, color=DEEP, stroke=(WHITE, 0.08), size=round(230 * 0.6 / 6.1, 2), kf_x=slide_out(0.35, 540, 1.9))
    say('does it really', 'does it really', 76, 2.4, 4.9, (480, 300), 4, kf_x=slide_out(2.4, 480, 4.6))
    say('[STAY DRY]?', 'STAY DRY?', 0, 2.7, 4.9, (540, 470), 3, box=None, color=DEEP, stroke=(WHITE, 0.08), size=round(170 * 0.6 / 6.1, 2), kf_x=slide_out(2.7, 540, 4.6))
    o = MC.text_anchor(P.sticky(NOTE, 440), P.sticky('', 440), -6)
    say(NOTE, 'claim:\nstays dry', 56, 4.9, 6.3, (300 + o[0], 820 + o[1]), 6, box=None)
    say('[one take, no cuts]', 'one take, no cuts', 76, 6.7, 8.5, (400, 330), 5)
    say('watch closely', 'watch closely', 80, 8.6, 10.8, (360, 330), 4, box=BLUE)
    say('[IT STAYED DRY]', 'IT STAYED DRY', 84, 13.5, 15.6, (540, 360), 4, box=BUTTER)
    say('"[KEYWORD]"', '"TEST"', 78, 16.2, END / SL, (540, 500), -2, box=BLUE, round_=1.0)
    return g
