"""09 Who it's for, approved 2026-10-18 as the round-4 motion test (build/story7.py, "LOVE").
The buyer's four clips are real CapCut clip layers (full frame, the torn window, the floating balloon, the phone screen);
the rest (butterflies, crown, clock, burst, paper balls, notes, doodles, the DM Serif words) plays as a flipbook rendered
from the motion test, so it moves the way she approved it (build/motion_capcut.py). Highlight-box lines and [brackets]
are editable Montserrat with CapCut's own text background.
CapCut limits: the problem window is in colour (CapCut layers here can't be black-and-white) and has straight edges
(no torn mask); the motion-blur swipes are plain slides. The dashed head guide is its own layer: hide it before export."""
import contextlib
from PIL import Image, ImageOps
from engine import Layers, W, H
import motion_capcut as MC
import play as P
import story7 as S7

SL = P.SLOW; END = S7.SECS['09'] * SL
SPEC = dict(num='09', title="Who it's for", subtitle='24 seconds. Four clips: you, the everyday problem, your product, you again.',
            font='montserrat', dir='09-who-its-for', folder='Template 09 - Who its for', project='Scrolly 09 Who its for', cover_at=3.0,
            slots=[('You, talking to camera', 'Head inside the dashed guide, room above it for the butterfly'),
                   ('The everyday problem', 'The moment your buyer struggles without your product'),
                   ('Your product', 'In use, upright, close up'),
                   ('You again, for the ending', 'A second take: smile and nod, head inside the guide')],
            test_clips=[('IMG_1469', 1.0), ('IMG_1430', 1.0), ('IMG_1381', 1.0), ('IMG_1470', 1.0)])
INK, WHITE, WINE = (24, 23, 22), (255, 255, 255), P.PAL['wine']
BLANK = Image.new('RGBA', (2, 2), (0, 0, 0, 0))

def sz(px): return round(px * 0.85 / 6.1, 2)     # Manrope px in the motion test -> Montserrat Bold CapCut size

@contextlib.contextmanager
def flip_mode(g):
    """Clips -> key colours, the paper -> clear, editable words and note text -> blank, swipes without motion blur, no
    greyscale (it would hide the key)."""
    c = g['c']; keep = dict(g); keep_c = dict(c); gs, sw = ImageOps.grayscale, S7.swipe
    c.update(me=MC.KeyClip(MC.KEYS['m']), me2=MC.KeyClip(MC.KEYS['c']), problem=MC.KeyClip(MC.KEYS['y']), product=MC.KeyClip(MC.KEYS['b']))
    g['paper'] = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for k in ('habit', 'late', 'problem', 'prod', 'sound', 'kw'): g[k] = BLANK
    g['notes'] = [P.sticky('', 400, pin=pn) for pn in ('pin-head-black', 'pin-head-cream', 'pin-head-white')]
    def slide(old, new, u, direction=1):
        if u <= 0: return old
        if u >= 1: return new
        dx = int(direction * S7.ease(u) * W); out = Image.new('RGBA', (W, H)); out.alpha_composite(old, (-dx, 0)); out.alpha_composite(new, (direction * W - dx, 0)); return out
    ImageOps.grayscale = lambda im: im; S7.swipe = slide
    try: yield
    finally:
        ImageOps.grayscale, S7.swipe = gs, sw; g.clear(); g.update(keep); c.clear(); c.update(keep_c)

def layers():
    g = Layers(); s = S7.setup_09(); paper = s['paper']
    g.art('paper', paper, (0, END), 0, (540, 960))
    with flip_mode(s):
        frames, track = MC.flipbook(lambda t: S7.frame_09(s, t / SL), 0, END)
    g.flip('fx', frames, 0, 40)
    sw_, sh_ = P.screen_size(S7.PHONE, 360)
    MC.clip_layers(g, track, [
        ('m', 0, 0, 3.6 * SL, (W, H), 0, None, lambda t: t),
        ('m', 0, 12.7 * SL, 14.6 * SL, (W, H), 0, None, lambda t: t - 10.0 * SL),
        ('c', 3, 14.6 * SL, END, (W, H), 0, None, lambda t: t - 14.6 * SL),
        ('y', 1, 5.4 * SL, 7.5 * SL, (780, 900), 2, None, lambda t: t - 5.4 * SL),
        ('b', 2, 7.2 * SL, 8.8 * SL, (780, 900), 2, None, lambda t: t - 7.2 * SL),
        ('b', 2, 8.8 * SL, 10.4 * SL, (520, 520), 0, 'circle', lambda t: t - 8.8 * SL),
        ('b', 2, 13.0 * SL, 14.6 * SL, (sw_, sh_), 6, None, lambda t: t - 13.0 * SL)], z0=1)
    guide = P.head_guide(0.8)
    g.art('HIDE ME head guide 1', guide, (0, 3.6 * SL), 45, (540, 960)); g.art('HIDE ME head guide 2', guide, (14.6 * SL, END), 45, (540, 960))

    def say(words, test, px, t0, t1, pos, rot, box=(255, 255, 255), color=INK, out=None, kf_x=None, z=[60]):
        z[0] += 1; a, b = t0 * SL, t1 * SL
        kf = {'scale': MC.popk(0, 0.3 * SL, None if out is None else (out - t0) * SL, 0.18 * SL)}
        if kf_x: kf['x'] = kf_x
        g.text('montserrat', sz(px), (words, test), (a, b), z[0], pos, rot, kf, color=color, box=box and (box, 0.0))
    say('if you\n[always run late]', 'if you\nalways run late', 70, 0.0, 1.9, (280, 330), 5, out=1.7)
    say('[late. again.]', 'late. again.', 80, 3.8, 5.4, (540, 350), 5)
    say('[you lose your\nkeys. again.]', 'you lose your\nkeys. again.', 72, 5.6, 7.2, (540, 380), 4)
    say('[PRODUCT NAME]', 'the 5-minute styler', 76, 7.7, 10.4, (540, 520), 4, box=WINE, color=WHITE)
    for i, ((x, y), r, words, test) in enumerate(((((310, 640)), -6, 'for the\n[6am crowd]', 'for the\n6am crowd'),
                                                ((760, 900), 5, 'for the\n[dog mums]', 'for the\ndog mums'),
                                                ((330, 1240), -3, 'for the\n[busy mums]', 'for the\nbusy mums'))):
        pn = ('pin-head-black', 'pin-head-cream', 'pin-head-white')[i]
        dx, dy = MC.text_anchor(P.sticky(words, 400, pin=pn), P.sticky('', 400, pin=pn), r)
        t0 = 10.6 + i * 0.4; xs = [((12.7 + k * 0.05 - t0) * SL, x + dx + S7.ease(k / 6) * W) for k in range(7)]
        say(words, test, 54, t0, 13.0, (x + dx, y + dy), -r, box=None, kf_x=[(0, x + dx)] + xs)
    say('sound like you?', 'sound like you?', 72, 15.4, END / SL, (540, 1030), 4)
    g.text('montserrat', sz(76), ('"[KEYWORD]"', '"BRUSH"'), (16.1 * SL, END), 70, (540, 1360), -2,
           {'scale': MC.popk(0, 0.3 * SL)}, color=WHITE, box=(WINE, 1.0))
    return g
