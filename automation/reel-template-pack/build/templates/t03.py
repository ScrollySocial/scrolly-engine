"""03 Before and after (odd: Imbue). World: torn white paper over the buyer's footage, ink stamps, a dark text card.
The before plays with a torn "Before" strip sliding in; the after lands with an AFTER stamp and a sparkle burst; then
six quick before/after flashes; a dark card with the real time it took; the product in hand with the CTA strip."""
from engine import Layers, pop, thump, fly, wiggle, W, H, INK, BUTTER, CREAM
import collage as C

WHITE = (252, 251, 247); CHAR = (34, 32, 30)
SPEC = dict(num='03', title='Before and after', subtitle='12 seconds. Three clips. Same spot, same light for both.',
            font='imbue', dir='03-before-and-after', folder='Template 03 - Before and after',
            project='Scrolly 03 Before and after', cover_at=0.8,
            slots=[('The before', 'End it by covering the lens with your hand'),
                   ('The after', 'Start with your hand on the lens, pull it away'),
                   ('The product in your hand', 'Next to the result if you can')],
            test_clips=[('IMG_1398', 0.3), ('IMG_1408', 0.3), ('IMG_1417', 0.3)])

def layers():
    g = Layers()
    # before 0 to 2.6
    T = (0, 2.6)
    g.clip(0, T, 1, (540, 960), (W, H))
    m = fly((-400, 420), (380, 420), t=0.2)
    g.art('strip-before', C.torn_strip((560, 190), WHITE, seed=31, edges='lr'), T, 10, (380, 420), -3, m)
    g.text('imbue', 30, ('Before', 'Before'), T, 20, (380, 420), -3, fly((-400, 420), (380, 420), t=0.2))
    # after 2.6 to 5.2
    T = (2.6, 5.2)
    g.clip(1, T, 1, (540, 960), (W, H))
    g.art('stamp-after', C.stamp('AFTER', (340, 340), WHITE, seed=32, round_=True), T, 10, (780, 420), 10,
          {'scale': thump(0.2, 2.0)})
    for k, (x, y, t0) in enumerate([(210, 760, 0.5), (900, 980, 0.7), (300, 1480, 0.9)]):
        g.art(f'sparkle{k}', C.sparkle(110, (255, 255, 255), 7), T, 11 + k, (x, y),
              {'scale': pop(t0, 1.4), 'rot': [(t0, -60), (t0 + 0.4, 0)] + wiggle(t0 + 0.6, 2.6, 10)})
    # six quick flashes: before, after, before...
    t = 5.2; d = 0.47
    for k in range(6):
        slot = k % 2; src = [1.0, 1.6, 2.2][k // 2]
        g.clip(slot, (t, t + d), 1, (540, 960), (W, H), src=src, speed=1.15)
        g.art(f'flash-tag{k}', C.torn_strip((380, 140), WHITE, seed=33 + k, edges='lr'), (t, t + d), 10, (300, 300),
              [-4, 3][slot], {'scale': pop(0.0, 1.1)})
        g.text('ink', 14, [('before', 'before'), ('after', 'after')][slot], (t, t + d), 20, (300, 300), [-4, 3][slot],
               {'scale': pop(0.02, 1.1)})
        t += d
    # dark card: the real time it took
    T = (t, t + 1.1)
    g.art('bg-dark', C.paper((W, H), CHAR, seed=34), T, 0, (540, 960))
    g.text('ink', 16, ('it took', 'it took'), T, 20, (540, 760), kf={'scale': pop(0.05)}, color=CREAM)
    g.text('imbue', 44, ('[2 minutes]', '2 minutes'), T, 21, (540, 950), kf={'scale': pop(0.2, 1.25)}, color=BUTTER)
    g.art('spark-dark-a', C.sparkle(110, BUTTER, 7), T, 2, (180, 1220), kf={'scale': pop(0.45, 1.3)})
    g.art('spark-dark-b', C.sparkle(90, BUTTER, 6), T, 3, (900, 700), kf={'scale': pop(0.55, 1.3)})
    # CTA: the product in hand, a torn strip rises with the name
    T = (t + 1.1, t + 4.0)
    g.clip(2, T, 1, (540, 960), (W, H))
    m = fly((540, 2300), (540, 1500), t=0.1)
    g.art('strip-cta', C.torn_strip((1000, 330), WHITE, seed=35), T, 10, (540, 1500), -2, m)
    g.text('imbue', 28, ('[Product name]', 'Stick vacuum'), T, 20, (540, 1450), -2, fly((540, 2250), (540, 1450), t=0.1))
    g.text('ink', 13, ('shop at [where to buy]', 'shop at the link in my bio'), T, 21, (540, 1575), -2,
           fly((540, 2375), (540, 1575), t=0.1))
    g.art('check-cta', C.check(140, (255, 255, 255), 11), T, 11, (880, 1180), kf={'scale': pop(0.8, 1.3)})
    return g
