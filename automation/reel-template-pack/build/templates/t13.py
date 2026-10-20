"""13 How to use it in 3 steps, approved 2026-10-19 (motion test build/motion_13.py). Six clips are real CapCut clip
layers: the product, steps one to three (full frame, then as the round windows in the recap), the result and the end.
The number cubes, instruction card, strikes, doodles and DM Serif words are a flipbook from the motion test
(build/capcut_b2b.py). Editable Montserrat: the product, the three steps (on the card and on each step), the proof
note, the keyword and the product name.
CapCut limits: step two slides in (the cube wipe is flipbook-only)."""
from PIL import Image
import capcut_b2b as B
import motion_13 as M
import motion_capcut as MC
import play as P

SPEC = dict(num='13', title='How to use it in 3 steps', subtitle='25 seconds. Six clips: your product, three steps, the result, the end.',
            font='montserrat', dir='13-how-to-use-it', folder='Template 13 - How to use it in 3 steps', project='Scrolly 13 How to use it',
            cover_at=1.0,
            slots=[('Your product', 'Your product, upright'), ('Step 1', 'The first step, close'), ('Step 2', 'The second step'),
                   ('Step 3', 'The third step'), ('The result', 'What it looks like after'), ('The end', 'You or your product')],
            test_clips=[('IMG_1464', 1.0), ('IMG_1430', 0.5), ('IMG_1429', 5.0), ('IMG_1423', 2.0), ('IMG_1432', 1.5), ('IMG_1375', 1.0)])
INK, WHITE, WINE = (28, 27, 26), (255, 255, 255), M.PLUM
TESTS = ('1. melt the wax', '2. pour slowly', '3. let it set')

def layers():
    b = B.Build(M.HOLDS, 15.0); g = M.setup(); oak = g['oak']
    b.g.art('oak', oak, (0, b.end), 0, (540, 960))
    widths = [l.width for l in g['lines']]
    with B.flip_mode(M, g, {'prod': 'm', 's1': 'c', 's2': 'y', 's3': 'b', 'res': 'o', 'cta': 'g'}, ('prodname', 'kw', 'name'),
                     {'oak': B.CLEAR, 'lines': [Image.new('RGBA', l.size, (0, 0, 0, 0)) for l in g['lines']], 'sp': [B.BLANK] * 3,
                      'done': P.sticky('', 400, pin='pin-head-black')}):
        track = b.flip(lambda t: M.frame(g, t))
    full = (1080, 1920)
    segs = [('m', 0, 0, 1.8, full, 0, None), ('c', 1, 2.95, 5.0, full, 0, None), ('y', 2, 4.6, 6.8, full, 0, None),
            ('b', 3, 8.2, 10.0, full, 0, None), ('o', 4, 9.75, 11.6, full, 0, None)]
    segs += [(k, i + 1, 11.6, 13.0, (300, 300), 0, 'circle') for i, k in enumerate('cyb')]
    segs += [('g', 5, 12.75, 15.0, full, 0, None)]
    b.clips(track, segs)
    b.say('[your steam mop]', 'your soy candle', 58, 0.35, 1.55, (540, 470), 0, WINE)
    for i, (words, test) in enumerate(zip(M.STEPS, TESTS)):            # the steps written on the card
        x, y = M.card_xy(70, M.LINE_Y[i]); pos = (x + widths[i] / 2, y)
        spans = ((2.3, 2.95), (6.8, 7.85)) if i == 0 else ((6.8, 7.85),) if i == 1 else ((7.2, 7.85),)
        for t0, t1 in spans: b.say(words, test, 56, t0, t1, pos, 0, None)
    for i, (words, test) in enumerate(zip(M.STEPS, TESTS)):            # each step on its own clip
        t0, t1, r = ((3.4, 4.6, 4), (5.2, 6.55, 0), (8.9, 9.75, 4))[i]
        b.say(words, test, 58, t0, t1, (560, 1380), r, WINE)
    o = MC.text_anchor(P.sticky('done in\n[2 minutes]', 400), P.sticky('', 400), 7)
    b.say('done in\n[2 minutes]', 'done in\n2 hours', 60, 10.5, 11.6, (760 + o[0], 1180 + o[1]), -7, None)
    b.say('"[KEYWORD]"', '"HOW"', 64, 13.35, None, (500, 1230), 0, WHITE)
    b.say('[Product name]', 'The Soy Candle Kit', 54, 13.55, None, (500, 1350), 4, WINE)
    return b.g
