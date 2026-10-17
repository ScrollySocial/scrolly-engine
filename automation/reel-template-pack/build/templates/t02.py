"""02 Pack an order with me (even: MADE Awelier). World: kraft paper, a shipping label, rubber stamps.
A label flies in with the hook and a stamp thumps on; then 12 quick cuts (0.63 s at 1.15x) through the packing,
with a little kraft tag naming each step; a typed-on "on its way" card; the label comes back as the CTA."""
from engine import Layers, pop, thump, fly, wiggle, W, H, INK, CREAM
import collage as C

KRAFT = (201, 164, 120)
SPEC = dict(num='02', title='Pack an order with me', subtitle='13 seconds. Four clips, filmed from above or close.',
            font='awelier', dir='02-pack-an-order', folder='Template 02 - Pack an order with me',
            project='Scrolly 02 Pack an order with me', cover_at=1.5,
            slots=[('The empty box or mailer, from above', 'Clear the table first'),
                   ('Your product going in', 'Hands only is perfect'),
                   ('The extras: tissue, a note, a sticker', 'Whatever you really add'),
                   ('Sealing it up', 'Keep the shipping label out of frame')],
            test_clips=[('IMG_1462', 0.3), ('IMG_1439', 0.3), ('IMG_1460', 0.3), ('IMG_1447', 0.3)])

def layers():
    g = Layers()
    # hook 0 to 1.6: the label flies in, the stamp thumps on
    T = (0, 1.6)
    g.art('bg-hook', C.paper((W, H), KRAFT, seed=11), T, 0, (540, 960))
    lab_c = (540, 800)
    m = fly((540, -500), lab_c); m['rot'] = [(0, -14), (0.3, 1), (0.5, -3)]
    g.art('label', C.shipping_label((860, 560)), T, 2, lab_c, -3, m)
    for k, (line, y) in enumerate([(('Pack a [product]', 'Pack a cleaner'), 760), (('order with me', 'order with me'), 880)]):
        mt = fly((540, -500 + (y - 800)), (540, y)); mt['rot'] = [(0, -14), (0.3, 1), (0.5, -3)]
        g.text('awelier', 17, line, T, 20 + k, (540, y), -3, mt)
    g.art('stamp-care', C.stamp('HANDLE\nWITH CARE', (520, 200)), T, 3, (720, 1210), 8, {'scale': thump(0.8)})
    g.art('heart', C.heart(120, INK, 6), T, 4, (230, 1300), kf={'scale': pop(1.1, 1.3), 'rot': wiggle(1.4, 1.6, 8)})

    # 12 quick cuts through the packing, a kraft tag names each step
    cuts = [(0, 0.0), (0, 1.2), (1, 0.0), (1, 1.0), (1, 2.0), (2, 0.0), (2, 1.0), (2, 2.0), (3, 0.0), (3, 1.0), (3, 2.0), (3, 3.0)]
    d, t = 0.633, 1.6
    starts = {}
    for slot, src in cuts:
        g.clip(slot, (t, t + d), 1, (540, 960), (W, H), src=src, speed=1.15)
        starts.setdefault(slot, [t, t + d]); starts[slot][1] = t + d
        t += d
    steps = [('[the box]', 'the box'), ('[the goods]', 'the goods'), ('[a little extra]', 'a little extra'), ('[sealed]', 'sealed')]
    for slot, (a, b) in starts.items():
        g.art(f'tag{slot}', C.torn_strip((520, 150), KRAFT, seed=12 + slot), (a, b), 10, (540, 330), [-3, 2, -2, 3][slot],
              {'scale': pop(0.0, 1.12)})
        g.text('ink', 15, steps[slot], (a, b), 20, (540, 330), [-3, 2, -2, 3][slot], {'scale': pop(0.05, 1.12)})
    g.art('check', C.check(150, (255, 255, 255), 12), (starts[3][0], starts[3][1]), 11, (870, 1480),
          {'scale': pop(0.8, 1.3)})
    end = t   # 9.2

    # "on its way" card
    T = (end, end + 1.0)
    g.art('bg-way', C.paper((W, H), KRAFT, seed=13), T, 0, (540, 960))
    g.text('awelier', 20, ("[It's on its way]", "It's on its way"), T, 20, (540, 900), typewriter=0.5)
    g.art('spark-a', C.sparkle(100, INK, 6), T, 2, (180, 700), kf={'scale': pop(0.5, 1.3)})
    g.art('spark-b', C.sparkle(80, INK, 6), T, 3, (900, 1120), kf={'scale': pop(0.6, 1.3)})

    # CTA: the label comes back with the product name, a round stamp thumps
    T = (end + 1.0, end + 3.8)
    g.art('bg-cta', C.paper((W, H), KRAFT, seed=14), T, 0, (540, 960))
    m = fly((1700, 820), (540, 820)); m['rot'] = [(0, 18), (0.3, -1), (0.5, 2)]
    g.art('label-cta', C.shipping_label((860, 560), seed=86), T, 2, (540, 820), 2, m)
    for k, (line, y, size, font) in enumerate([(('[Product name]', 'Spray cleaner'), 780, 19, 'awelier'),
                                               (('shop at [where to buy]', 'shop at the link in my bio'), 905, 12, 'ink')]):
        mt = fly((1700, y), (540, y)); mt['rot'] = [(0, 18), (0.3, -1), (0.5, 2)]
        g.text(font, size, line, T, 20 + k, (540, y), 2, mt)
    g.art('stamp-thanks', C.stamp('THANK\nYOU', (300, 300), INK, seed=87, round_=True), T, 3, (800, 1260), -10,
          {'scale': thump(0.75)})
    g.art('heart-cta', C.heart(110, INK, 6, seed=88), T, 4, (250, 1250), kf={'scale': pop(1.0, 1.3), 'rot': wiggle(1.3, 2.8, 8)})
    return g
