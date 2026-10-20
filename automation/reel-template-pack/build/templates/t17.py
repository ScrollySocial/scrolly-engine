"""17 Everything that goes into one, approved 2026-10-19 (motion test build/motion_17.py). Seven clips are real CapCut
clip layers: the empty table (inside the tray), three materials (the photo cards on the tray, and full frame as each is
placed), the finished one (the card in the middle), the finished one close, and the end. The tray, marble, sparkles,
doodles and DM Serif words are a flipbook from the motion test (build/capcut_b2b.py). Editable Montserrat: the three
material labels, what it is, the product, the made-fresh line, the keyword and the product name.
CapCut limits: card two's flip shows its clip squashed for a moment; the dives are flipbook-only."""
import capcut_b2b as B
import motion_17 as M
import motion_capcut as MC
import play_extra as X

SPEC = dict(num='17', title='Everything that goes into one', subtitle='20 seconds. Seven clips: the empty table, three materials, the finished one.',
            font='montserrat', dir='17-everything-that-goes-into-one', folder='Template 17 - Everything that goes into one',
            project='Scrolly 17 Everything that goes into one', cover_at=1.0,
            slots=[('The empty table', 'An empty table, filmed from above'), ('Material 1', 'Placing your first material'),
                   ('Material 2', 'Placing your second material'), ('Material 3', 'Placing your third material'),
                   ('The finished one', 'The finished product in the middle'), ('Close up', 'The finished product, close'),
                   ('The end', 'You or your product')],
            test_clips=[('IMG_1386', 0.5), ('IMG_1387', 1.5), ('IMG_1389', 2.5), ('IMG_1388', 1.0), ('IMG_1391', 0.0), ('IMG_1393', 3.0), ('IMG_1395', 0.5)])
WHITE, BUTTER, BLUE = (255, 255, 255), M.BUTTER, M.BLUE

def layers():
    b = B.Build(M.HOLDS, 12.5); g = M.setup(); bg = g['bg']
    b.g.art('bg', bg, (0, b.end), 0, (540, 960))
    cards = [X.clip_card(MC.KeyClip(MC.KEYS[k]).at(0, (420, 520)), 360, 445, 14, r) for k, r in zip('cyb', (-6, 5, -3))]
    with B.flip_mode(M, g, {'empty': 'm', 'place1': 'c', 'place2': 'y', 'done': 'o', 'close': 'g', 'cta': 'm'},
                     ('prod', 'what', 'fresh', 'kw', 'name'), {'bg': B.CLEAR, 'cards': cards, 'labels': [B.BLANK] * 3}):
        track = b.flip(lambda t: M.frame(g, t))
    x0, y0, x1, y1 = M.TRAY_IN; inside = (int(g['tw'] * (x1 - x0)), int(g['th'] * (y1 - y0))); full = (1080, 1920); card = (360, 445)
    b.clips(track, [('m', 0, 0, 1.8, inside, 0, None),
                    ('c', 1, 1.9, 3.8, card, 6, None), ('y', 2, 2.35, 3.8, card, -5, None), ('b', 3, 2.8, 3.8, card, 3, None),
                    ('c', 1, 3.8, 5.4, full, 0, None),
                    ('c', 1, 5.4, 6.4, card, 6, None), ('y', 2, 5.4, 6.4, card, -5, None), ('b', 3, 5.4, 6.4, card, 3, None),
                    ('c', 1, 7.0, 8.6, card, 6, None), ('b', 3, 7.0, 8.6, card, 3, None),
                    ('y', 2, 6.4, 7.0, full, 0, None), ('y', 2, 7.0, 8.6, card, -5, None),
                    ('o', 4, 7.4, 8.6, (430, 560), -2, None), ('g', 5, 8.35, 10.2, full, 0, None), ('m', 6, 9.95, 12.5, full, 0, None)])
    for i, ((words, test), xy) in enumerate(zip(zip(M.NAMES, ('[beeswax]', '[cotton wick]', '[lavender oil]')), M.SLOTS)):
        t0 = 1.9 + i * 0.45 + 0.25; spans = ((t0, 3.4),) if i == 1 else ((t0, 3.4), (5.4, 6.0))
        for a, z in spans: b.say(words, test.strip('[]'), 54, a, z, (xy[0], xy[1] + 270), (5, -1, 4)[i], (BUTTER, WHITE, BUTTER)[i])
    b.say('[fresh watermelon]', 'pure beeswax', 60, 4.0, 5.15, (540, 1380), 4, WHITE)
    b.say('[smoothie]', 'candle', 70, 7.95, 8.35, (540, 440), 0, BUTTER)
    b.say('[made fresh, to order]', 'poured by hand', 60, 8.85, 9.95, (540, 1380), 4, BUTTER)
    b.say('"[KEYWORD]"', '"INSIDE"', 64, 10.55, None, (540, 1220), 0, WHITE)
    b.say('[Product name]', 'The Beeswax Candle', 56, 10.75, None, (540, 1360), 4, BLUE)
    return b.g
