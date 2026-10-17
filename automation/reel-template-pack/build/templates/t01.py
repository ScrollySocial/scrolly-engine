"""01 One product, three ways (odd: Imbue). Approved by Mercedes 2026-10-16.
Opener card with three round windows popping in one at a time, three taped Polaroids that fly in and grow to fill
the frame, butter CTA card with the product in a round window and a bouncing arrow."""
import copy
from engine import Layers, pop, fly, rot_pt, ring_frame, polaroid_frame, W, H, INK, BUTTER, CREAM
import collage as C

SPEC = dict(num='01', title='One product, 3 ways', subtitle='14 seconds. Four clips, filmed upright.', font='imbue',
            dir='01-one-product-three-ways', folder='Template 01 - One product, three ways',
            project='Scrolly 01 One product three ways', cover_at=2.2,
            slots=[('Your product, held up or on a table', 'Plain background, good light'),
                   ('Way one, in use', 'Show it being used the first way'),
                   ('Way two, in use', 'A different place, person or use'),
                   ('Way three, in use', 'Save the most surprising way for last')],
            test_clips=[('IMG_1417', 0.3), ('IMG_1411', 15.5), ('IMG_1405', 3.0), ('IMG_1401', 2.5)])

PW, PHT, PB, PBOT = 820, 1000, 40, 170
WIN = (PW - 2 * PB, PHT - PB - PBOT)
CD, CTA_D = 250, 440

def layers():
    g = Layers()
    T = (0, 2.5)
    g.art('bg-opener', C.paper((W, H), CREAM, seed=41), T, 0, (540, 960))
    g.text('imbue', 25, ('One [product],', 'One stick vacuum,'), T, 20, (540, 390), typewriter=0.45)
    g.text('imbue', 49, ('3 ways', '3 ways'), T, 21, (540, 700), kf={'scale': pop(0.40, 1.25)})
    g.art('loop', C.pen_loop((800, 440), INK, 8, seed=43), T, 10, (540, 745), rot=-4, kf={'scale': pop(0.60, 1.08)})
    g.art('sparkle', C.sparkle(80, INK, 5), T, 11, (930, 250), kf={'scale': pop(0.85, 1.3), 'rot': [(0.85, -90), (1.2, 0)]})
    labels = [('[way one]', 'floors'), ('[way two]', 'couch'), ('[way three]', 'handheld')]
    for i, x in enumerate((190, 540, 890)):
        t0 = 0.75 + 0.4 * i; tilt = [-6, 4, -3][i]
        k = {'scale': pop(t0, 1.2), 'rot': [(t0, tilt - 25), (t0 + 0.36, tilt)]}
        g.clip(i + 1, T, 2 + 2 * i, (x, 1240), (CD + 6, CD + 6), tilt, k)
        g.art(f'ring{i}', ring_frame(CD, CREAM, 44 + i), T, 3 + 2 * i, (x, 1240), tilt, copy.deepcopy(k))
        g.text('ink', 10, labels[i], T, 22 + i, (x, 1440), kf={'scale': pop(t0 + 0.1)})

    POL = [dict(c=(540, 1010), tilt=4, frm=(540, 2700), num=(150, 240), star=(920, 230)),
           dict(c=(540, 1000), tilt=-3, frm=(1900, 980), num=(930, 240), star=(160, 230)),
           dict(c=(540, 1010), tilt=2, frm=(540, -800), num=(150, 240), star=(920, 230))]
    words = [('[way one]', 'floors'), ('[way two]', 'the couch'), ('[way three]', 'handheld')]
    GROW = [(0.5, 1.0), (0.8, 1.12), (1.1, 1.22), (1.4, 1.28), (1.6, 1.30), (3.0, 1.34)]
    for i, p in enumerate(POL):
        T = (2.5 + 3 * i, 5.5 + 3 * i)
        frame = polaroid_frame((PW, PHT), PB, PBOT, 22 + 3 * i)
        win_c = rot_pt((p['c'][0], p['c'][1] - PHT / 2 + PB + WIN[1] / 2), p['c'], p['tilt'])
        cap_c = rot_pt((p['c'][0], p['c'][1] + PHT / 2 - PBOT / 2), p['c'], p['tilt'])
        def motion(target, p=p, i=i):
            m = fly((target[0] + p['frm'][0] - p['c'][0], target[1] + p['frm'][1] - p['c'][1]), target)
            m['rot'] = [(0, p['tilt'] + 14 * (1 if i % 2 == 0 else -1)), (0.30, p['tilt'] - 3), (0.50, p['tilt'])]
            m['scale'] = list(GROW)
            for t_, s_ in GROW[1:]:
                cx = p['c'][0]; cy = p['c'][1] + 40 * (s_ - 1) / 0.34
                m['x'].append((t_, cx + (target[0] - p['c'][0]) * s_))
                m['y'].append((t_, cy + (target[1] - p['c'][1]) * s_))
            return m
        g.art(f'bg-way{i + 1}', C.paper((W, H), CREAM, seed=21 + i), T, 0, (540, 960))
        g.clip(i + 1, T, 2, win_c, (WIN[0] + 6, WIN[1] + 6), p['tilt'], motion(win_c))
        g.art(f'polaroid{i + 1}', frame, T, 3, p['c'], p['tilt'], motion(p['c']))
        g.text('ink', 14, words[i], T, 20, cap_c, p['tilt'], motion(cap_c))
        g.text('imbue', 69, (str(i + 1), str(i + 1)), T, 21, p['num'], kf={'scale': pop(0.35, 1.3)})
        g.art(f'star{i + 1}', C.star(110, INK, 6, seed=24 + i), T, 10, p['star'],
              kf={'scale': pop(0.6, 1.3), 'rot': [(0.6, -120), (1.0, 0), (1.6, 10), (2.2, -8), (2.8, 6)]})

    T = (11.5, 14)
    g.art('bg-cta', C.paper((W, H), BUTTER, seed=61), T, 0, (540, 960))
    k = {'scale': pop(0.05, 1.15), 'rot': [(0.05, -15), (0.41, 0)]}
    g.clip(0, T, 2, (540, 620), (CTA_D + 6, CTA_D + 6), 0, k)
    g.art('ring-cta', ring_frame(CTA_D, BUTTER, 64), T, 3, (540, 620), 0, copy.deepcopy(k))
    g.text('imbue', 31, ('[Product name]', 'Stick vacuum'), T, 20, (540, 1030), typewriter=0.5)
    g.text('ink', 13, ('shop at [where to buy]', 'shop at the link in my bio'), T, 21, (540, 1250), kf={'scale': pop(0.55, 1.1)})
    y = 1470
    g.art('arrow', C.arrow(170, INK, 6, 40, seed=62).rotate(-70, expand=True), T, 10, (540, y),
          kf={'scale': pop(0.9), 'y': [(1.3, y), (1.5, y + 34), (1.7, y), (1.9, y + 34), (2.1, y), (2.3, y + 34), (2.5, y)]})
    return g
