"""05 Details you'd miss in a photo (odd: Imbue). World: dark charcoal paper, a magnifying glass, cream writing.
The hook types on in cream while the lens swings in; eight steady beats, each close-up popping inside the lens as it
moves, with a cream handwritten label; a butter promise card halfway; the whole product with a dark CTA strip."""
from engine import Layers, pop, fly, wiggle, rot_pt, ring_frame, W, H, INK, BUTTER, CREAM
import collage as C

CHAR = (40, 37, 34)
SPEC = dict(num='05', title="Details you'd miss", subtitle='12.6 seconds. Five clips, as close as your phone focuses.',
            font='imbue', dir='05-details', folder="Template 05 - Details you'd miss in a photo",
            project='Scrolly 05 Details you would miss', cover_at=1.8,
            slots=[('Close-up of detail one', 'Stitching, texture, a label'),
                   ('Close-up of detail two', 'Move slowly'),
                   ('Close-up of detail three', 'Good light from the side'),
                   ('Close-up of detail four', 'The finish, the edges'),
                   ('The whole product', 'Pull back so it fills the frame')],
            test_clips=[('IMG_1417', 0.3), ('IMG_1447', 0.3), ('IMG_1460', 0.3), ('IMG_1439', 0.3), ('IMG_1421', 15.0)])

def lens(g, key, t, z, c, d, slot, src=0.0, kf=None, label=None, label_y=None):
    """A magnifying glass: the clip in a round window, a cream ring, a handle at the bottom right."""
    h_c = rot_pt((c[0] + d * 0.55, c[1] + d * 0.55), c, 0)
    g.clip(slot, t, z, c, (d + 6, d + 6), 0, dict(kf or {}), src=src)
    g.art(f'lens-{key}', ring_frame(d, CHAR, 70 + z, ring=22, ring_color=CREAM), t, z + 1, c, 0, dict(kf or {}))
    k2 = {}   # the handle follows the lens, offset to its bottom right
    if kf and 'scale' in kf: k2['scale'] = kf['scale']
    if kf and 'x' in kf: k2['x'] = [(t_, v + d * 0.55) for t_, v in kf['x']]
    if kf and 'y' in kf: k2['y'] = [(t_, v + d * 0.55) for t_, v in kf['y']]
    g.art(f'handle-{key}', C.magnifier_handle(int(d * 0.42), int(d * 0.11)), t, z + 2, h_c, -45, k2)
    if label:
        g.text('ink', 15, label, t, 25, (540, label_y), kf={'scale': pop(0.1)}, color=CREAM)

def layers():
    g = Layers()
    T = (0, 2.0)
    g.art('bg-hook', C.paper((W, H), CHAR, seed=51), T, 0, (540, 960))
    g.text('imbue', 30, ("Details you'd miss", "Details you'd miss"), T, 20, (540, 420), typewriter=0.5, color=CREAM)
    g.text('ink', 17, ('in a photo', 'in a photo'), T, 21, (540, 620), kf={'scale': pop(0.55, 1.2)}, color=BUTTER)
    m = fly((1500, 1250), (520, 1250), t=0.3); m['rot'] = [(0.3, 30), (0.6, -4), (0.8, 0)]
    lens(g, 'hook', T, 2, (520, 1250), 460, 0, kf={'x': m['x'], 'y': m['y']})

    beats = [(0, 0.0, (520, 900)), (1, 0.0, (560, 960)), (2, 0.0, (520, 930)), (3, 0.0, (560, 900))]
    labels = [('[detail one]', 'the filter'), ('[detail two]', 'the crystals'), ('[detail three]', 'the pad'),
              ('[detail four]', 'the nozzle')]
    t, d = 2.0, 0.9
    def run_beats(srcs, t):
        for k, (slot, _s, c) in enumerate(beats):
            T = (t, t + d)
            g.art(f'bg-beat{t:.1f}', C.paper((W, H), CHAR, seed=52 + k), T, 0, (540, 960))
            lens(g, f'b{t:.1f}', T, 2, c, 720, slot, src=srcs[k], kf={'scale': pop(0.0, 1.08)},
                 label=labels[slot], label_y=1500)
            g.art(f'spark{t:.1f}', C.sparkle(90, BUTTER, 6), T, 10, ([150, 930][k % 2], [380, 1650][k % 2]),
                  {'scale': pop(0.15, 1.3)})
            t += d
        return t
    t = run_beats([0.0, 0.0, 0.0, 0.0], t)
    T = (t, t + 0.9)
    g.art('bg-promise', C.paper((W, H), BUTTER, seed=56), T, 0, (540, 960))
    g.text('imbue', 30, ('[made in small batches]', 'built to last'), T, 20, (540, 920), kf={'scale': pop(0.05, 1.15)})
    g.art('heart-promise', C.heart(120, INK, 6), T, 2, (540, 1250), kf={'scale': pop(0.35, 1.3)})
    t = run_beats([1.2, 1.2, 1.2, 1.2], t + 0.9)

    T = (t, t + 3.0)
    g.clip(4, T, 1, (540, 960), (W, H))
    m = fly((540, 2300), (540, 1520), t=0.1)
    g.art('strip-cta', C.torn_strip((1040, 330), CHAR, seed=57), T, 10, (540, 1520), -2, m)
    g.text('imbue', 28, ('[Product name]', 'Stick vacuum'), T, 20, (540, 1470), -2, fly((540, 2250), (540, 1470), t=0.1), color=CREAM)
    g.text('ink', 13, ('shop at [where to buy]', 'shop at the link in my bio'), T, 21, (540, 1595), -2,
           fly((540, 2375), (540, 1595), t=0.1), color=BUTTER)
    g.art('spark-cta', C.sparkle(110, BUTTER, 7), T, 11, (900, 1260), {'scale': pop(0.7, 1.3), 'rot': wiggle(1.1, 3.0, 10)})
    return g
