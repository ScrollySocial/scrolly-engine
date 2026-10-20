"""19 Pair it with, approved 2026-10-19 (motion test build/motion_19.py). Four clips are real CapCut clip layers: your
product (the left half of the locket, and full frame at the end) and three pairings (the right half, each one in turn;
pairing 1 also full frame). The pink paper, gold locket, question marks, hearts, chain, sparkles and DM Serif words are
a flipbook from the motion test (build/capcut_b2b.py); the locket sits over the clips, so its gold rim frames each oval.
Editable Montserrat: the three pairings, why they go together, the bundle name and the keyword.
CapCut limits: the locket page turn shows as a wipe (the clip itself does not squash)."""
import math
import capcut_b2b as B
import motion_19 as M
import motion_capcut as MC
import play as P
from motion_b2 import put, back_out, ease, seg, lerp, W, H

SPEC = dict(num='19', title='Pair it with', subtitle='20 seconds. Four clips: your product and three things that go with it.',
            font='montserrat', dir='19-pair-it-with', folder='Template 19 - Pair it with', project='Scrolly 19 Pair it with',
            cover_at=1.0,
            slots=[('Your product', 'Your product, moving'), ('Pair 1', 'Something that goes with it'),
                   ('Pair 2', 'A second thing that goes with it'), ('Pair 3', 'A third thing that goes with it')],
            test_clips=[('IMG_1464', 2.0), ('IMG_1422', 7.5), ('IMG_1439', 0.5), ('IMG_1436', 2.0)])
WHITE, PINK = (255, 255, 255), M.PINK

def cta(g, t):
    """motion_19.cta with the full-frame product on its own key (the left half of locket 1 is the same clip)."""
    c = g['c']; im = c['main2'].at(t).copy()
    for i, (a, b_, x) in enumerate(((c['main'].at(t), c['p1'].at(t), 285), (c['p2'].at(t), c['p3'].at(t), 795))):
        lay = M.locket(g, t, a, b_, bg=False).crop((0, M.LC[1] - 560, W, M.LC[1] + 560)).resize((540, 560))
        y = lerp(-400, 560, back_out(seg(t, 10.0 + i * 0.15, 10.4 + i * 0.15), 1.4)); sw = 3 * math.sin(t * 2 + i * 1.3); bail = (x + 122, y - 195)
        if bail[1] + 40 > 20:
            ch = g['chain'].resize((230, int(bail[1] + 40))); im.alpha_composite(ch, (int(bail[0] - ch.width / 2), int(bail[1] + 30 - ch.height)))
        put(im, lay, (x, y), 1, sw)
    P.say(im, g['bname'], t, 10.3, (540, 860), -2); P.say(im, g['comment'], t, 10.6, (540, 1150), -3); P.say(im, g['kw'], t, 10.85, (540, 1330), 2)
    return im

def layers():
    b = B.Build(M.HOLDS, 12.5); g = M.setup(); lk = g['locket']
    rw, rh = lk.width - 2 * M.PAD, lk.height - 2 * M.PAD
    ov = [(int(2 * ax * rw), int(2 * ay * rh)) for _, (ax, ay) in M.OVALS]
    def centre(i, cy=M.LC[1]):
        (fx, fy), _ = M.OVALS[i]; return (540 - lk.width / 2 + M.PAD + fx * rw, cy - lk.height / 2 + M.PAD + fy * rh)
    def view(ts):
        """(focus, zoom) of the motion test's camera at script time ts."""
        if ts < 1.8: return M.oval_centre(0), lerp(4.8, 1.0, ease(seg(ts, 0.35, 1.25)))
        if 3.0 <= ts < 3.5: return M.oval_centre(1), lerp(1.0, 4.8, ease(seg(ts, 3.0, 3.5)) ** 2)
        if 4.6 <= ts < 6.2: return M.oval_centre(1), lerp(4.8, 1.0, ease(seg(ts, 4.6, 5.0)))
        return (540, 960), 1.0
    def geom(i):
        def f(t):
            ts = b.R_inv(t); (fx, fy), s = view(ts); p = centre(i)
            if s > 1.001:
                w, h = W / s, H / s; x0 = min(max(fx - w / 2, 0), W - w); y0 = min(max(fy - h / 2, 0), H - h); p = ((p[0] - x0) * s, (p[1] - y0) * s)
            if i == 1 and 1.8 <= ts < 3.0: s *= max(0.01, back_out(seg(ts, 1.9, 2.3), 1.4))   # pairing 1 grows into the empty half
            return (p[0], p[1], s, 0)
        return f
    keep = M.cta; M.cta = cta; g['c']['main2'] = g['c']['main']
    try:
        with B.flip_mode(M, g, {'main': 'm', 'main2': 'o', 'p1': 'c', 'p2': 'y', 'p3': 'b', 'cta': 'o'}, ('why', 'kw', 'bname'), {'plus': [B.BLANK] * 3}):
            track = b.flip(lambda t: M.frame(g, t))
    finally:
        M.cta = keep
    swing = lambda i: (lambda t: -3 * math.sin(b.R_inv(t) * 2 + i * 1.3))
    b.clips(track, [('o', 0, 9.75, 12.5, (1080, 1920), 0, None),                       # the end, under the lockets
                    ('m', 0, 0, 3.5, ov[0], 0, 'circle', geom(0)), ('c', 1, 1.9, 3.5, ov[1], 0, 'circle', geom(1)),
                    ('c', 1, 3.5, 4.6, (1080, 1920), 0, None),
                    ('m', 0, 4.6, 8.15, ov[0], 0, 'circle', geom(0)), ('c', 1, 4.6, 5.35, ov[1], 0, 'circle', geom(1)),
                    ('y', 2, 5.35, 6.75, ov[1], 0, 'circle', geom(1)), ('b', 3, 6.75, 8.15, ov[1], 0, 'circle', geom(1)),
                    ('m', 0, 8.4, 10.0, ov[0], 0, 'circle'), ('c', 1, 8.4, 10.0, ov[1], 0, 'circle'),
                    ('m', 0, 10.0, 12.5, ov[0], swing(0), 'circle'), ('c', 1, 10.0, 12.5, ov[1], swing(0), 'circle'),
                    ('y', 2, 10.0, 12.5, ov[0], swing(1), 'circle'), ('b', 3, 10.0, 12.5, ov[1], swing(1), 'circle')])
    b.say('+ [the stick vacuum]', '+ the stick vacuum', 62, 2.3, 3.0, (540, 1470), 4, PINK)
    b.say('[why they go together]', 'one clean sweep', 60, 3.6, 4.6, (540, 1380), 4, PINK)
    b.say('+ [the odor spray]', '+ the odor spray', 62, 5.5, 6.2, (540, 1470), 0, WHITE)
    b.say('+ [the litter]', '+ the litter', 62, 6.9, 8.15, (540, 1470), 4, PINK)
    b.say('[the clean-home bundle]', 'the clean-home bundle', 60, 10.3, None, (540, 860), 4, PINK)
    b.say('"[KEYWORD]"', '"PAIR"', 64, 10.85, None, (540, 1330), 0, WHITE)
    return b.g
