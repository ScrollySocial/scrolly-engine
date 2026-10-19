"""06 Start to finish, approved 2026-10-19 (motion test build/motion_06.py, after her note: no wood on wood, a cream
stage). Six clips are real CapCut clip layers: the raw materials, stages one to three, the finished one and the
finished one in use (also on the phone at the end). The loading bar, hourglass, notes, doodles and DM Serif words are a
flipbook from the motion test (build/capcut_b2b.py). Editable Montserrat: the product, the materials, the three
stages, the "later" note, the keyword and the town line.
CapCut limits: stage three grows out of a rectangle (no arch); stage two plays at normal speed (speed it up in CapCut)."""
import capcut_b2b as B
import motion_06 as M
import motion_capcut as MC
import play as P
import play_extra as X

SPEC = dict(num='06', title='Start to finish', subtitle='21 seconds. Six clips: materials, three stages, the finished one, in use.',
            font='montserrat', dir='06-start-to-finish', folder='Template 06 - Start to finish', project='Scrolly 06 Start to finish',
            cover_at=0.8,
            slots=[('The raw materials', 'Everything before you start'), ('Stage one', 'The first step, close'),
                   ('Stage two', 'The middle step (long is fine, speed it up)'), ('Stage three', 'The last step'),
                   ('The finished one', 'The finished product, close'), ('In use', 'The finished one being used or held')],
            test_clips=[('IMG_1393', 0.5), ('IMG_1387', 1.5), ('IMG_1389', 2.5), ('IMG_1390', 2.0), ('IMG_1391', 0.0), ('IMG_1394', 1.0)])
INK, WHITE, WINE = (28, 27, 26), (255, 255, 255), X.WINE

def layers():
    b = B.Build(M.HOLDS, 15.0); g = M.setup(); bench = g['bench']
    b.g.art('bench', bench, (0, b.end), 0, (540, 960))
    keys = {'raw': 'm', 's1': 'c', 's2': 'y', 's3': 'b', 'done': 'o', 'done2': 'g'}
    with B.flip_mode(M, g, keys, ('making', 'pile', 'kw', 'town'), {'bench': B.CLEAR, 'sp': [B.BLANK] * 3, 'later': P.sticky('', 440, pin='pin-head-black')}):
        track = b.flip(lambda t: M.frame(g, t))
    full = (1080, 1920); sw, sh = P.screen_size(M.PHONE, 640)
    segs = [('m', 0, 0, 0.5, full, 0, None), ('c', 1, 0.5, 1.0, full, 0, None), ('b', 3, 1.0, 1.5, full, 0, None), ('g', 5, 1.5, 2.0, full, 0, None),
            ('m', 0, 2.0, 3.6, (560, 700), 4, None), ('c', 1, 3.35, 5.2, full, 0, None), ('y', 2, 6.35, 8.2, full, 0, None),
            ('b', 3, 7.95, 9.4, (600, 940), 0, None), ('b', 3, 9.4, 9.8, full, 0, None)]
    segs += [(k, i + 1, 9.9, 11.2, (250, 320), r, None) for i, (k, r) in enumerate((('c', 7), ('y', -4), ('b', 3)))]
    segs += [('o', 4, 11.2, 11.9, full, 0, None), ('g', 5, 11.9, 13.0, full, 0, None), ('g', 5, 13.0, 15.0, (sw, sh), 3, None)]
    b.clips(track, segs)
    b.say('making one [smoothie]', 'making one candle', 58, 0.05, 1.75, (540, 480), 4, WINE)
    b.say('[a pile of fruit]', 'a pile of wax', 58, 2.5, 3.35, (440, 1430), 0, WINE)
    for (words, test), (t0, t1, r) in zip((('[stage one: prep]', 'stage one: melt'), ('[stage two: mix]', 'stage two: pour'), ('[stage three: blend]', 'stage three: set')),
                                          ((3.7, 4.95, 4), (6.75, 7.95, 0), (8.3, 9.55, 4))):
        b.say(words, test, 56, t0, t1, (540, 1380), r, WINE)
    o = MC.text_anchor(P.sticky('[20 minutes\nlater]', 440), P.sticky('', 440), 6)
    b.say('[20 minutes\nlater]', '2 days\nlater', 64, 5.7, 6.35, (770 + o[0], 660 + o[1]), -6, None)
    b.say('"[KEYWORD]"', '"MADE"', 64, 13.55, None, (520, 480), 0, WHITE)
    b.say('[handmade in Austin]', 'handmade in Leeds', 50, 13.75, None, (520, 600), 4, WINE)
    return b.g
