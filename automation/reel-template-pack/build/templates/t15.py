"""15 New drop reveal, approved 2026-10-19 as the round-4 motion test (build/story7.py, "ok").
The opening is her idea: the drop clip is full screen and a second copy of it has CapCut's Remove background on, so the
one dust cloud sits between them (behind the product) and new / drop sit in front. If CapCut doesn't cut the product
out on its own, select the top copy of clip 1 > Remove background > Auto. The other clips are real CapCut clip layers
(under the wine tissue for the reveal, a photo card, the laptop screen, full frame); the graphics play as flipbooks from
the motion test (build/motion_capcut.py). Editable Montserrat: the hook, the product name, the three details, the date,
the shop line and the keyword.
CapCut limits: the slides are plain slides; the reveal has no white flash."""
import contextlib
from PIL import Image
from engine import Layers, W, H
import motion_capcut as MC
import play as P
import story7 as S7

SL = P.SLOW; END = S7.SECS['15'] * SL; LAND = S7.LAND15
SPEC = dict(num='15', title='New drop reveal', subtitle='27 seconds. Five clips: the drop, three close-ups, in use.',
            font='montserrat', dir='15-new-drop-reveal', folder='Template 15 - New drop reveal', project='Scrolly 15 New drop reveal', cover_at=1.0,
            slots=[('The drop', 'Your product dropping onto a table, full frame, landing about half a second in (at least 7 seconds)'),
                   ('Close-up one', 'One detail, close up'), ('Close-up two', 'A second detail'),
                   ('Close-up three', 'A third detail'), ('In use', 'Your product being used')],
            test_clips=[('IMG_1381', 1.0), ('IMG_1388', 0.5), ('IMG_1417', 0.5), ('IMG_1463', 1.0), ('IMG_1391', 1.0)])
INK, WHITE, WINE, BU = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['butter']
BLANK = Image.new('RGBA', (2, 2), (0, 0, 0, 0))

def sz(px): return round(px * 0.85 / 6.1, 2)

@contextlib.contextmanager
def flip_mode(g):
    c = g['c']; keep = dict(g); keep_c = dict(c); sw, bl, sm = S7.swipe, Image.blend, S7.subject_mask
    c.update(prod=MC.KeyClip(MC.KEYS['m']), close1=MC.KeyClip(MC.KEYS['c']), close2=MC.KeyClip(MC.KEYS['b']),
             close3=MC.KeyClip(MC.KEYS['y']), use=MC.KeyClip(MC.KEYS['o']))
    for k in ('hook', 'name', 'd1', 'd2', 'd3', 'shop', 'kw'): g[k] = BLANK
    g['stub'] = g['stub_blank']; g['dust_big'] = BLANK
    def slide(old, new, u, direction=1):
        if u <= 0: return old
        if u >= 1: return new
        dx = int(direction * S7.ease(u) * W); out = Image.new('RGBA', (W, H)); out.alpha_composite(old, (-dx, 0)); out.alpha_composite(new, (direction * W - dx, 0)); return out
    S7.swipe = slide; Image.blend = lambda a, b, al: a; S7.subject_mask = lambda clip, t: None   # no flash; the cut-out is CapCut's own
    try: yield
    finally:
        S7.swipe, Image.blend, S7.subject_mask = sw, bl, sm; g.clear(); g.update(keep); c.clear(); c.update(keep_c)

def drop_geom(t):
    """The drop shot's frame (story7.drop_shot_15): falling in, the shake on the landing, then leaving with the swipe."""
    ts = t / SL; fall = S7.back_out(S7.seg(ts, 0.0, LAND), 1.25); shake = 18 * S7.math.exp(-(ts - LAND) * 8) * S7.math.sin((ts - LAND) * 48) if ts > LAND else 0
    z = S7.lerp(1.38, 1.05, fall); vw, vh = W * z, H * z
    x0 = max(W - vw, min(0, (W - vw) / 2 + shake)); y0 = max(H - vh, min(0, (H - vh) / 2 - 300 * (1 - fall) + shake * 0.5))
    return x0 + vw / 2 - S7.ease(S7.seg(ts, 2.1, 2.4)) * W, y0 + vh / 2, z, 0

def reveal_geom(t):
    ts = t / SL; z = S7.lerp(1.15, 1.0, S7.ease(S7.seg(ts, 4.95, 5.6))) if ts >= 4.9 else 1.0
    return 540 + W * (1 - S7.ease(S7.seg(ts, 4.3, 4.6))) - W * S7.ease(S7.seg(ts, 6.5, 6.8)), 960, z, 0

def slide_out(t0, x, at):
    return [(0, x)] + [((at + 0.05 * k - t0) * SL, x - S7.ease(k / 6) * W) for k in range(7)]

def layers():
    g = Layers(); s = S7.setup_15(); stage, dust = s['stage'], s['dust_big']
    g.art('stage', stage, (0, END), 0, (540, 960))
    def dust_frame(t):   # the one dust cloud, on its own flipbook so it sits under the cut-out copy of clip 1
        ts = t / SL; im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); q = S7.seg(ts, LAND, LAND + 1.0)
        if 0 < q < 1: S7.put(im, dust, (540, 780 - 160 * S7.ease(q)), 0.9 + 1.3 * S7.ease(q), 0, min(1, 2.0 * (1 - q)) ** 1.1)
        return im
    dframes, _ = MC.flipbook(dust_frame, LAND * SL, (LAND + 1.0) * SL)
    g.flip('dust', dframes, LAND * SL, 20)
    with flip_mode(s):
        s['stage'] = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        frames, track = MC.flipbook(lambda t: S7.frame_15(s, t / SL), 0, END)
    s['stage'] = stage
    g.flip('fx', frames, 0, 40)

    lw = s['lap_w']; lsw, lsh = P.screen_size(S7.LAPTOP, lw)
    card_rot = lambda t: -S7.lerp(-8, 3, S7.ease(S7.seg(t / SL, 6.8, 7.2)))
    MC.clip_layers(g, track, [
        ('m', 0, 0, 2.4 * SL, (W, H), 0, None, lambda t: t, drop_geom),
        ('m', 0, 4.3 * SL, 6.8 * SL, (W, H), 0, None, lambda t: t - 2.2 * SL, reveal_geom),
        ('c', 1, 6.5 * SL, 8.8 * SL, (760, 980), card_rot, None, lambda t: t - 6.8 * SL),
        ('b', 2, 8.5 * SL, 10.8 * SL, (lsw, lsh), 0, None, lambda t: t - 8.8 * SL),
        ('y', 3, 10.5 * SL, 12.8 * SL, (W, H), 0, None, lambda t: t - 10.8 * SL),
        ('o', 4, 14.5 * SL, END, (W, H), 0, None, lambda t: t - 14.8 * SL)], z0=2)
    # the cut-out copy of clip 1, moving exactly with it (her depth idea: the dust goes between the two)
    pts = [(t, drop_geom(t)) for t, bx in track if t < 2.4 * SL]
    g.clip(0, (0, 2.4 * SL), 30, pts[0][1][:2], (W + 8, H + 8), 0,
           {'x': [(t, p[0]) for t, p in pts], 'y': [(t, p[1]) for t, p in pts], 'scale': [(t, p[2]) for t, p in pts]}, src=0.0, cutout=True)

    z = [60]
    def say(words, test, px, t0, t1, pos, rot, box=(255, 255, 255), color=INK, kf_x=None, round_=0.0):
        z[0] += 1; k = {'scale': MC.popk(0, 0.3 * SL)}
        if kf_x: k['x'] = kf_x
        g.text('montserrat', sz(px), (words, test), (t0 * SL, t1 * SL), z[0], pos, rot, k, color=color, box=box and (box, round_))
    say('[something new\nis coming]', 'something new\nis coming', 72, 0.7, 2.4, (540, 300), 4, kf_x=slide_out(0.7, 540, 2.1))
    say('[PRODUCT NAME]', 'The Glow Brush', 84, 5.7, 6.8, (540, 600), 4, box=WINE, color=WHITE, kf_x=slide_out(5.7, 540, 6.5))
    say('[detail one]', 'ceramic barrel', 78, 7.0, 8.8, (540, 380), 4, kf_x=slide_out(7.0, 540, 8.5))
    say('[detail two]', 'two heat settings', 78, 9.1, 10.8, (540, 420), 4, box=BU, kf_x=slide_out(9.1, 540, 10.5))
    say('[detail three]', 'cord that turns', 78, 10.9, 12.8, (540, 330), 4, kf_x=slide_out(10.9, 540, 12.5))
    dx = 0.14 * 900; say('[Fri 24 Oct]', 'Fri 24 Oct', 66, 13.35, 14.8, (540 + dx, 1300 + dx * 0.07), 4, box=None, kf_x=slide_out(13.35, 540 + dx, 14.5))
    bh = max(i.height for i, _ in s['comment'])
    tp = (540, 1050 - bh / 2 - s['shop'].height / 2 + 30); bp = (540, 1050 + bh / 2 + s['kw'].height / 2 - 30)
    say('get it at [shop]', 'get it at my shop', 76, 16.7, END / SL, tp, 4)
    say('"[KEYWORD]"', '"BRUSH"', 78, 16.7 + 0.35 + 0.13, END / SL, bp, -2, box=WINE, color=WHITE, round_=1.0)
    return g
