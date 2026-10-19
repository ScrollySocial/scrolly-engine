"""11 A day with it, approved 2026-10-19 as the round-4 motion test (build/story7.py, "fine").
The buyer's five clips are real CapCut clip layers: morning, midday, afternoon (on the smartwatch screen, then full
frame), night and the ending (in a round window). The stage objects, words, doodles and the lights going down to night
play as a flipbook from the motion test (build/motion_capcut.py). Editable Montserrat: the hook, the four times, the
product name and the CTA. CapCut limits: the slides are plain slides."""
import contextlib
from PIL import Image
from engine import Layers, W, H
import motion_capcut as MC
import play as P
import story7 as S7

SL = P.SLOW; END = S7.SECS['11'] * SL
SPEC = dict(num='11', title='A day with it', subtitle='24 seconds. Five clips: morning, midday, afternoon, night, the ending.',
            font='montserrat', dir='11-a-day-with-it', folder='Template 11 - A day with it', project='Scrolly 11 A day with it', cover_at=1.2,
            slots=[('Morning', 'You or your product in the morning, upright'), ('Midday', 'Using it in the middle of the day'),
                   ('Afternoon', 'Using it in the afternoon'), ('Night', 'Using it at night'), ('The ending', 'Your product resting, close up')],
            test_clips=[('IMG_1469', 1.0), ('IMG_1381', 1.0), ('IMG_1414', 1.0), ('IMG_1456', 1.0), ('IMG_1388', 0.5)])
INK, WHITE, BLUE, PINK = (24, 23, 22), (255, 255, 255), P.PAL['blue'], P.PAL['pink']
BLANK = Image.new('RGBA', (2, 2), (0, 0, 0, 0))

def sz(px): return round(px * 0.85 / 6.1, 2)

@contextlib.contextmanager
def flip_mode(g):
    c = g['c']; keep = dict(g); keep_c = dict(c); sw = S7.swipe
    c.update(morning=MC.KeyClip(MC.KEYS['m']), midday=MC.KeyClip(MC.KEYS['c']), after=MC.KeyClip(MC.KEYS['b']),
             night=MC.KeyClip(MC.KEYS['y']), end=MC.KeyClip(MC.KEYS['o']))
    for k in ('hook', 't7', 't12', 't4', 't9', 'name', 'kw'): g[k] = BLANK
    def slide(old, new, u, direction=1):
        if u <= 0: return old
        if u >= 1: return new
        dx = int(direction * S7.ease(u) * W); out = Image.new('RGBA', (W, H)); out.alpha_composite(old, (-dx, 0)); out.alpha_composite(new, (direction * W - dx, 0)); return out
    S7.swipe = slide
    try: yield
    finally:
        S7.swipe = sw; g.clear(); g.update(keep); c.clear(); c.update(keep_c)

def layers():
    g = Layers(); s = S7.setup_11(); stage, night = s['stage'], s['night_stage']; clear = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    g.art('stage', stage, (0, END), 0, (540, 960)); g.art('night', night, (11.1 * SL, 12.6 * SL), 1, (540, 960))
    def flip_frame(t):
        ts = t / SL; real = 10.7 <= ts < 11.1                     # the lights going down needs the real stages
        s['stage'], s['night_stage'] = (stage, night) if real else (clear, clear)
        return S7.frame_11(s, ts)
    with flip_mode(s):
        frames, track = MC.flipbook(flip_frame, 0, END)
    s['stage'], s['night_stage'] = stage, night
    g.flip('fx', frames, 0, 40)
    sw_, sh_ = P.screen_size(S7.WATCH, 520)
    MC.clip_layers(g, track, [
        ('m', 0, 0, 2.4 * SL, (W, H), 0, None, lambda t: t),
        ('c', 1, 4.1 * SL, 6.4 * SL, (W, H), 0, None, lambda t: t - 4.4 * SL),
        ('b', 2, 6.4 * SL, 8.6 * SL, (sw_, sh_), -12, None, lambda t: t - 6.4 * SL),
        ('b', 2, 8.3 * SL, 10.6 * SL, (W, H), 0, None, lambda t: t - 6.4 * SL),
        ('y', 3, 12.3 * SL, 14.4 * SL, (W, H), 0, None, lambda t: t - 12.6 * SL),
        ('o', 4, 14.4 * SL, END, (560, 560), 0, 'circle', lambda t: t - 14.4 * SL)], z0=2)

    z = [60]
    def up_out(t0, y, at):   # leaves upward with the scene's slide
        return [(0, y)] + [((at + 0.05 * k - t0) * SL, y - S7.ease(k / 6) * H) for k in range(7)]
    def left_out(t0, x, at):
        return [(0, x)] + [((at + 0.05 * k - t0) * SL, x - S7.ease(k / 6) * W) for k in range(7)]
    def say(words, test, px, t0, t1, pos, rot, box=(255, 255, 255), color=INK, kf_x=None, kf_y=None, round_=0.0):
        z[0] += 1; k = {'scale': MC.popk(0, 0.3 * SL)}
        if kf_x: k['x'] = kf_x
        if kf_y: k['y'] = kf_y
        g.text('montserrat', sz(px), (words, test), (t0 * SL, t1 * SL), z[0], pos, rot, k, color=color, box=box and (box, round_))
    say('a day with my\n[product]', 'a day with my\nwater bottle', 74, 0.0, 2.4, (330, 330), 5, kf_y=up_out(0.0, 330, 2.1))
    say('[7am]', '7am', 72, 0.9, 2.4, (260, 760), 5, box=BLUE, kf_y=up_out(0.9, 760, 2.1))
    say('[12pm]', '12pm', 72, 4.6, 6.4, (300, 330), 5, box=BLUE, kf_y=up_out(4.6, 330, 6.1))
    say('[4pm]', '4pm', 72, 7.0, 8.6, (540, 560), 4, box=BLUE, kf_x=left_out(7.0, 540, 8.3))
    say('[9pm]', '9pm', 72, 11.4, 12.6, (540, 720), 4, box=BLUE, kf_x=left_out(11.4, 540, 12.3))
    say('[Product name] at [shop]', 'The Daily Bottle at my shop', 66, 14.9, END / SL, (540, 470), 4)
    say('comment "[KEYWORD]"', 'comment "DAY"', 66, 15.2, END / SL, (540, 600), -2, box=PINK, round_=1.0)
    return g
