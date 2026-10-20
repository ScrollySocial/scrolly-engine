"""25 Mine vs. the usual kind, approved 2026-10-19 (motion test build/motion_25.py). Six clips are real CapCut clip
layers: the usual kind (the opening split, round 2 and the round window in round 3), yours (the opening split and
round 2), the usual kind and yours for round 1, yours for round 3, and the end. The kraft poster, bell, rounds,
trophy, doodles and DM Serif words are a flipbook from the motion test (build/capcut_b2b.py). Editable Montserrat: the
two labels (in the opening split, round 1 and round 2), the three differences, the keyword and the product name.
CapCut limits: round 1's diagonal is the usual kind's clip tilted along the line (CapCut masks here are round only)."""
import math
import capcut_b2b as B
import motion_25 as M

SPEC = dict(num='25', title='Mine vs. the usual kind', subtitle='21 seconds. Six clips: the usual kind, yours, three rounds, the end.',
            font='montserrat', dir='25-mine-vs-the-usual-kind', folder='Template 25 - Mine vs the usual kind',
            project='Scrolly 25 Mine vs the usual kind', cover_at=1.0,
            slots=[('The usual kind', 'The ordinary version, in use'), ('Yours', 'Your product, in use'),
                   ('Round 1: the usual kind', 'The ordinary version, the first difference'), ('Round 1: yours', 'Yours, the first difference'),
                   ('Round 3: yours', 'Yours, the third difference'), ('The end', 'You or your product')],
            test_clips=[('IMG_1460', 0.5), ('IMG_1418', 2.0), ('IMG_1462', 0.5), ('IMG_1423', 2.0), ('IMG_1463', 0.5), ('IMG_1423', 5.0)])
WHITE, BUTTER = (255, 255, 255), M.BUTTER
TESTS = ('no bucket of dirty water', 'steam, no chemicals', 'dries in seconds')

def layers():
    b = B.Build(M.HOLDS, 13.5); g = M.setup()
    with B.flip_mode(M, g, {'usual': 'm', 'mine': 'c', 'u1': 'y', 'm1': 'b', 'u2': 'm', 'm2': 'c', 'm3': 'o', 'cta': 'g'},
                     ('lu', 'lm', 'kw', 'name'), {'diff': [B.BLANK] * 3}):
        track = b.flip(lambda t: M.frame(g, t))
    full, half_w, half_h = (1080, 1920), (534, 1920), (1080, 954)
    ang = math.degrees(math.atan2(1160 - 760, 1080)); n = (-math.sin(math.radians(ang)), -math.cos(math.radians(ang)))
    tilt = (2600, 2000); tc = (540 + n[0] * tilt[1] / 2, 960 + n[1] * tilt[1] / 2)     # bottom edge on the round-1 line
    b.clips(track, [('m', 0, 0, 1.8, half_w, 0, None), ('c', 1, 0, 1.8, half_w, 0, None),
                    ('b', 3, 3.05, 4.8, full, 0, None), ('y', 2, 3.05, 4.8, tilt, -ang, None, lambda t: (tc[0], tc[1], 1.0, -ang)),
                    ('m', 0, 6.0, 7.8, half_h, 0, None), ('c', 1, 6.0, 7.8, half_h, 0, None),
                    ('o', 4, 8.6, 9.4, full, 0, None), ('m', 0, 8.6, 9.4, (300, 300), 0, 'circle'),
                    ('g', 5, 10.8, 13.5, full, 0, None)])
    for t0, t1, lu, lm in ((0.6, 1.6, (270, 1380), (810, 1380)), (3.3, 4.6, (300, 400), (800, 1150)), (6.25, 7.6, (300, 330), (300, 1040))):
        b.say('[the usual kind]', 'the usual mop', 52, t0, t1, lu, 5, WHITE)
        b.say('[mine]', 'mine', 56, t0 + 0.05, t1, lm, -1, BUTTER)
    for i, (t0, t1, pos, r) in enumerate(((2.3, 3.05, (540, 1440), 0), (3.5, 4.6, (540, 1400), 4), (6.45, 7.6, (540, 1420), 0), (8.7, 9.2, (540, 1400), 4))):
        k = (0, 0, 1, 2)[i]; b.say(('[no bucket of dirty water]', '[steam, no chemicals]', '[dries in seconds]')[k], TESTS[k], 58, t0, t1, pos, r, (BUTTER, WHITE, BUTTER)[k])
    b.say('"[KEYWORD]"', '"STEAM"', 64, 11.35, None, (540, 1220), 0, WHITE)
    b.say('[Product name]', 'The Steam Mop', 56, 11.55, None, (540, 1360), 4, BUTTER)
    return b.g
