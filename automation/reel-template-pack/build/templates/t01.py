"""01 One product, three ways. Approved by Mercedes 2026-10-16. FULLY EDITABLE build (2026-10-20, build/editable.py
via build/editable_a.py): same layout and motion as the approved build, now with every word as CapCut text and the
doodles as Scrolly Doodles letters.
Opener with three round windows popping in one at a time, three taped Polaroids that fly in and grow to fill the frame,
butter CTA card with the product in a round window and a bouncing arrow.
Editable: every word (DM Serif Display built-in words "3 ways" and the numbers, last word Italic; Montserrat for the
[bracket] lines on a highlight box or on the Polaroid paper); the ring, sparkle, stars and arrow are Scrolly Doodles
letters (recolour like text); the cream stage is CapCut's background colour under a colourless tissue grain.
CapCut limits: the butter CTA card is a paper picture over the stage (recolour it with Adjust > HSL); the Polaroid frames
and the white rings round the round windows are pictures (text can't sit under a clip)."""
import copy
from engine import Layers, pop, fly, rot_pt, ring_frame, polaroid_frame, W, H, INK, BUTTER, CREAM
import collage as C
import storyboard_b2 as S
import editable as Ed
from editable_a import Wrap, serif, boxed, plain, doodle

SPEC = dict(num='01', title='One product, 3 ways', subtitle='14 seconds. Four clips, filmed upright.', font='montserrat',
            dir='01-one-product-three-ways', folder='Template 01 - One product, three ways',
            project='01 One product, 3 ways', cover_at=2.2,
            slots=[('Your product, held up or on a table', 'Plain background, good light'),
                   ('Way one, in use', 'Show it being used the first way'),
                   ('Way two, in use', 'A different place, person or use'),
                   ('Way three, in use', 'Save the most surprising way for last')],
            test_clips=[('IMG_1417', 0.3), ('IMG_1411', 15.5), ('IMG_1405', 3.0), ('IMG_1401', 2.5)])
STAGE = CREAM
WINE = (122, 23, 50)

PW, PHT, PB, PBOT = 820, 1000, 40, 170
WIN = (PW - 2 * PB, PHT - PB - PBOT)
CD, CTA_D = 250, 440

def reel():
    g = Layers(); r = Wrap(g)
    g.art('paper-grain', Ed.grain(S.raw('images', 'Crumpled pale blue tissue texture-8.png'), 0.08), (0, 14), 1, (540, 960))
    T = (0, 2.5)
    boxed(r, 'One [product],', 118, T, 20, (540, 390), box=(255, 255, 255), test='One stick vacuum,', typewriter=0.45)
    serif(r, '3 ways', 240, T, 21, (540, 700), kf={'scale': pop(0.40, 1.25)}, fill=INK)
    doodle(r, 'frame', 2, 920, T, 10, (540, 735), -4, {'scale': pop(0.60, 1.08)}, INK)
    doodle(r, 'icon', 10, 100, T, 11, (930, 250), 0, {'scale': pop(0.85, 1.3), 'rot': [(0.85, -90), (1.2, 0)]}, INK)
    labels = [('[way one]', 'floors'), ('[way two]', 'couch'), ('[way three]', 'handheld')]
    for i, x in enumerate((190, 540, 890)):
        lx = 790 if i == 2 else x   # third label nudged left, clear of Instagram's buttons
        t0 = 0.75 + 0.4 * i; tilt = [-6, 4, -3][i]
        k = {'scale': pop(t0, 1.2), 'rot': [(t0, tilt - 25), (t0 + 0.36, tilt)]}
        g.clip(i + 1, T, 2 + 2 * i, (x, 1240), (CD + 6, CD + 6), tilt, k, mask='circle')
        g.art(f'ring{i}', ring_frame(CD, None, 44 + i), T, 3 + 2 * i, (x, 1240), tilt, copy.deepcopy(k))
        plain(r, labels[i][0], 54, T, 22 + i, (lx, 1440), kf={'scale': pop(t0 + 0.1)}, test=labels[i][1])

    POL = [dict(c=(540, 850), tilt=4, frm=(540, 2540), num=(150, 470), star=(920, 250)),   # captions end above IG's caption
           dict(c=(540, 840), tilt=-3, frm=(1900, 820), num=(930, 470), star=(160, 250)),   # strip, numbers below its top bar
           dict(c=(540, 850), tilt=2, frm=(540, -960), num=(150, 470), star=(920, 250))]
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
        g.clip(i + 1, T, 2, win_c, (WIN[0] + 6, WIN[1] + 6), p['tilt'], motion(win_c))
        g.art(f'polaroid{i + 1}', frame, T, 3, p['c'], p['tilt'], motion(p['c']))
        plain(r, words[i][0], 84, T, 20, cap_c, p['tilt'], motion(cap_c), test=words[i][1])
        serif(r, str(i + 1), 260, T, 21, p['num'], kf={'scale': pop(0.35, 1.3)}, fill=INK, edge=(255, 255, 255))
        doodle(r, 'icon', 0, 110, T, 10, p['star'], 0,
               {'scale': pop(0.6, 1.3), 'rot': [(0.6, -120), (1.0, 0), (1.6, 10), (2.2, -8), (2.8, 6)]}, INK)

    T = (11.5, 14)
    g.art('bg-cta', C.paper((W, H), BUTTER, seed=61), T, 2, (540, 960))
    k = {'scale': pop(0.05, 1.15), 'rot': [(0.05, -15), (0.41, 0)]}
    g.clip(0, T, 3, (540, 620), (CTA_D + 6, CTA_D + 6), 0, k, mask='circle')
    g.art('ring-cta', ring_frame(CTA_D, None, 64), T, 4, (540, 620), 0, copy.deepcopy(k))
    serif(r, '[Product name]', 160, T, 20, (540, 1030), fill=INK, edge=(255, 255, 255), italic_last=False, typewriter=0.5)
    r.L.L[-1]['words'] = ('[Product name]', 'Stick vacuum')
    plain(r, 'shop at [where to buy]', 74, T, 21, (540, 1220), kf={'scale': pop(0.55, 1.1)}, test='shop at the link in my bio')
    y = 1400
    doodle(r, 'arrow', 0, 170, T, 10, (540, y), 90,
           {'scale': pop(0.9), 'y': [(1.3, y), (1.5, y + 34), (1.7, y), (1.9, y + 34), (2.1, y), (2.3, y + 34), (2.5, y)]}, INK)
    return r

def layers():
    return reel().L
