"""14 The annoying moment, approved 2026-10-19 (motion test build/motion_14.py). Three clips are real CapCut clip layers:
the annoying moment (full frame, then on the TV), the fix (on the TV after the channel flip, full frame, the end) and
the fix in use. The concrete stage, TV, static, paper balls, burst and DM Serif words are a flipbook from the motion
test (build/capcut_b2b.py). Editable Montserrat: the annoying moment, no more ..., how it fixes it, the keyword and
the product name.
CapCut limits: the annoying moment plays in colour (add CapCut's black-and-white filter to it for the motion test's
look); the TV-to-full-frame grow is a cut."""
from PIL import Image
import capcut_b2b as B
import motion_14 as M
import play as P

SPEC = dict(num='14', title='The annoying moment', subtitle='19 seconds. Three clips: the annoying moment, the fix, the fix in use.',
            font='montserrat', dir='14-the-annoying-moment', folder='Template 14 - The annoying moment', project='Scrolly 14 The annoying moment',
            cover_at=1.0,
            slots=[('The annoying moment', 'The everyday problem, acted out (hands only works)'), ('The fix', 'Your product fixing it, close'),
                   ('In use', 'Your product in use')],
            test_clips=[('IMG_1378', 0.5), ('IMG_1381', 0.5), ('IMG_1377', 0.5)])
INK, WHITE, WINE = (24, 23, 22), (255, 255, 255), M.DARK

def layers():
    b = B.Build(M.HOLDS, 12.0); g = M.setup(); bg = g['bg']
    b.g.art('bg', bg, (0, b.end), 0, (540, 960))
    gray, blend = M.gray, Image.blend
    M.gray = lambda im: im; Image.blend = lambda a, b_, al: b_ if al > 0.5 else a          # key colours must stay pure
    try:
        with B.flip_mode(M, g, {'prob': 'm', 'prob2': 'm', 'fix': 'c', 'cta': 'c', 'use': 'y'}, ('annoy', 'nomore', 'how', 'kw', 'name'), {'bg': B.CLEAR}):
            track = b.flip(lambda t: M.frame(g, t))
    finally:
        M.gray, Image.blend = gray, blend
    tvim = Image.open(P.HQ / 'Vintage Walnut Rabbit-Ear Television.png'); k = M.TV_W / tvim.width; x0, y0, x1, y1 = P.TV_SCREEN
    ins = int(14 * k * 2); tvs = (int((x1 - x0) * k) - 2 * ins, int((y1 - y0) * k) - 2 * ins); full = (1080, 1920)
    b.clips(track, [('m', 0, 0, 1.8, full, 0, None), ('m', 0, 3.4, 5.0, tvs, 2, None),
                    ('c', 1, 5.25, 5.7, tvs, 2, None), ('c', 1, 5.7, 6.6, full, 0, None), ('c', 1, 6.6, 8.2, tvs, 2, None),
                    ('y', 2, 8.0, 9.8, full, 0, None), ('c', 1, 9.6, 12.0, full, 0, None)])
    b.say("[when your cord tangles]", 'when your necklace tangles', 60, 0.05, 1.6, (540, 380), 4, WHITE)
    b.say('[no more tangles]', 'no more knots', 62, 7.2, 8.0, (540, 1380), 0, WINE)
    b.say('[one smooth pass]', 'one twist, done', 60, 8.35, 9.6, (540, 1380), 4, WHITE)
    b.say('"[KEYWORD]"', '"FIXED"', 64, 10.15, None, (540, 1200), 0, WHITE)
    b.say('[Product name]', 'The Tangle-Free Case', 56, 10.4, None, (540, 1340), 4, WINE)
    return b.g
