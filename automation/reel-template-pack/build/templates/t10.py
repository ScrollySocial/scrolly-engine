"""10 Three people to gift it to, approved 2026-10-18 as the round-4 motion test (build/story7.py, "no changes").
The buyer's six clips are real CapCut clip layers: the gift being wrapped (full frame), their own shop scrolling on the
phone screen (her note: a 1:1 video slot of the buyer's shop, so the motion test's stand-in grid becomes a clip slot),
the product (growing out of the phone to full frame), and three people in the Polaroids (on the wall, then as
balloons). Everything else plays as a flipbook from the motion test (build/motion_capcut.py). Editable Montserrat:
stuck on a, found it, this one works for, the three names, the CTA and gift wrap.
CapCut limits: the swipes are plain slides; the stage behind a slide changes at the start of it."""
import contextlib, math
from PIL import Image
from engine import Layers, W, H
import motion_capcut as MC
import play as P
import story7 as S7

SL = P.SLOW; END = S7.SECS['10'] * SL
SPEC = dict(num='10', title='Three people to gift it to', subtitle='24 seconds. Six clips: wrapping, your shop, your product, three people.',
            font='montserrat', dir='10-three-people-to-gift-it-to', folder='Template 10 - Three people to gift it to',
            project='Scrolly 10 Three people to gift it to', cover_at=1.2,
            slots=[('Wrapping a gift', 'Hands wrapping or holding a gift, upright'),
                   ('Your shop, scrolling', 'A screen recording of you scrolling your own shop'),
                   ('Your product', 'Your product, upright, close up'),
                   ('Person 1', 'Someone it suits, smiling at the camera'),
                   ('Person 2', 'A second person'),
                   ('Person 3', 'A third person')],
            test_clips=[('IMG_1454', 1.0), ('IMG_1417', 0.5), ('IMG_1456', 1.0), ('IMG_1469', 1.0), ('IMG_1470', 1.0), ('IMG_1469', 4.0)])
INK, WHITE, WINE, BUTTER = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['butter']
BLANK = Image.new('RGBA', (2, 2), (0, 0, 0, 0))
NAMES = (('[your friend]', 'my sister'), ('[your mum]', 'my mum'), ('[your dad]', 'my best friend'))

def sz(px): return round(px * 0.85 / 6.1, 2)

@contextlib.contextmanager
def flip_mode(g):
    c = g['c']; keep = dict(g); keep_c = dict(c); bl, sw = Image.blend, S7.swipe
    c.update(gift=MC.KeyClip(MC.KEYS['m']), prod=MC.KeyClip(MC.KEYS['y']), p1=MC.KeyClip(MC.KEYS['m']), p2=MC.KeyClip(MC.KEYS['c']), p3=MC.KeyClip(MC.KEYS['b']))
    gim, top, row = g['grid']; g['grid'] = (MC.KeySheet(MC.KEYS['c'], gim.size), top, row)   # the shop scroll is a clip slot
    for k in ('stuck', 'found', 'works', 'kw', 'wrap'): g[k] = BLANK
    g['names'] = [BLANK] * 3
    def slide(old, new, u, direction=1):
        if u <= 0: return old
        if u >= 1: return new
        dx = int(direction * S7.ease(u) * W); out = Image.new('RGBA', (W, H)); out.alpha_composite(old, (-dx, 0)); out.alpha_composite(new, (direction * W - dx, 0)); return out
    Image.blend = lambda a, b, al: b if al > 0.5 else a; S7.swipe = slide
    try: yield
    finally:
        Image.blend, S7.swipe = bl, sw; g.clear(); g.update(keep); c.clear(); c.update(keep_c)

def slide_out(t0, x, at):
    return [(0, x)] + [((at + 0.05 * k - t0) * SL, x - S7.ease(k / 6) * W) for k in range(7)]

def layers():
    g = Layers(); s = S7.setup_10(); bgs = {k: s[k] for k in ('kraft', 'oak', 'wall', 'butter')}; clear = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for name, a, b in (('kraft', 0, 5.4), ('oak', 5.4, 10.1), ('wall', 10.1, 13.1), ('butter', 13.1, END / SL)):
        g.art(name, bgs[name], (a * SL, b * SL), 0, (540, 960))
    def flip_frame(t):
        ts = t / SL; real = 5.4 <= ts < 5.8 or 13.1 <= ts < 13.4      # the oak wipe and the wall-to-butter slide need the real stages
        for k, v in bgs.items(): s[k] = v if real else clear
        return S7.frame_10(s, ts)
    with flip_mode(s):
        frames, track = MC.flipbook(flip_frame, 0, END)
    s.update(bgs)
    g.flip('fx', frames, 0, 40)

    sw_, sh_ = s['scr']; dev, _, bb = P.device(S7.PHONE, 640); so = ((bb[0] + bb[2]) / 2 - dev.width / 2, (bb[1] + bb[3]) / 2 - dev.height / 2)
    def grow(t):   # the phone grows until its screen is the product clip, full frame (story7 frame_10, scene 4)
        u = S7.ease(S7.seg(t / SL, 8.0, 8.5)); sc = S7.lerp(1, 3.4, u); r = S7.lerp(-4, 0, u); a = math.radians(r)
        ox, oy = so[0] * sc, so[1] * sc; dx, dy = ox * math.cos(a) + oy * math.sin(a), -ox * math.sin(a) + oy * math.cos(a)
        return S7.lerp(560, 540, u) + dx, S7.lerp(1060, 960, u) + dy, sc, -r
    pw = S7.S.fitw(s['frame'], 400); win = S7.g_win(pw); win = (win[2] - win[0], win[3] - win[1])
    segs = [('m', 0, 0, 2.2 * SL, (W, H), 0, None, lambda t: t),
            ('c', 1, 5.4 * SL, 8.5 * SL, (sw_, sh_), 4, None, lambda t: t - 5.5 * SL),
            ('y', 2, 8.0 * SL, 8.5 * SL, (sw_, sh_), 0, None, lambda t: t - 8.0 * SL, grow),
            ('y', 2, 8.5 * SL, 10.4 * SL, (W, H), 0, None, lambda t: t - 8.0 * SL)]
    for i, (key, slot) in enumerate((('m', 3), ('c', 4), ('b', 5))):
        r = S7.POL[i][1]
        segs.append((key, slot, 10.4 * SL, 13.4 * SL, win, -r, None, lambda t: t - 10.4 * SL))
        segs.append((key, slot, 13.4 * SL, END, (int(win[0] * 0.75), int(win[1] * 0.75)), (lambda t, i=i: -6 * math.sin(t / SL * 1.4 + i * 1.7)), None, lambda t: t - 10.4 * SL))
    MC.clip_layers(g, track, segs, z0=1)

    z = [60]
    def say(words, test, px, t0, t1, pos, rot, box=(255, 255, 255), color=INK, kf_x=None, round_=0.0):
        z[0] += 1; k = {'scale': MC.popk(0, 0.3 * SL)}
        if kf_x: k['x'] = kf_x
        g.text('montserrat', sz(px), (words, test), (t0 * SL, t1 * SL), z[0], pos, rot, k, color=color, box=box and (box, round_))
    say('stuck on a', 'stuck on a', 76, 0.1, 2.2, (330, 300), 5, kf_x=slide_out(0.1, 330, 1.9))
    say('[found it.]', 'found it.', 84, 6.9, 8.0, (290, 330), 5)
    say('this one works for', 'this one works for', 78, 8.6, 10.4, (540, 1260), 4, kf_x=slide_out(8.6, 540, 10.1))
    for i, ((xy, r), (words, test)) in enumerate(zip(S7.POL, NAMES)):
        t0 = 10.9 + i * 0.5 + 0.2; x = xy[0]
        x, y = S7.NAME_AT[i]; say(words, test, 64, t0, 13.4, (x, y), 2 - (-3, 2, -2)[i], box=BUTTER, kf_x=slide_out(t0, x, 13.1))
    say('"[KEYWORD]"', '"GIFT"', 78, 15.0, END / SL, (540, 1060), -2, box=WINE, color=WHITE, round_=1.0)
    say('[gift wrap available]', 'gift wrap available', 66, 15.2, END / SL, (540, 1200), 4)
    return g
