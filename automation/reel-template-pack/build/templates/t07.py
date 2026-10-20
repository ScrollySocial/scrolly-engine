"""07 How big is it really?, approved 2026-10-19 (motion test build/motion_07.py). Four clips are real CapCut clip
layers: the product alone (the size-jumping window, the phone screen, the "in real life" window, the card on the grid),
in my hand, in use, and the set at the end. The grid, phone, mug, ruler, arrows and DM Serif words are a flipbook from
the motion test (build/capcut_b2b.py). Editable Montserrat: the reference sizes, one hand, water-bottle size, the exact
size (twice), the keyword and the shop line.
CapCut limits: the window's size jumps follow the tracked hole; the dive into the card is flipbook-only."""
import capcut_b2b as B
import motion_07 as M
import motion_capcut as MC
import play as P
import play_extra as X
from motion_b2 import put, back_out, seg, lerp

SPEC = dict(num='07', title='How big is it really?', subtitle='20 seconds. Four clips: your product alone, in your hand, in use, the set.',
            font='montserrat', dir='07-how-big-is-it', folder='Template 07 - How big is it really', project='Scrolly 07 How big is it really',
            cover_at=1.0,
            slots=[('Your product alone', 'Your product on a plain surface, upright'), ('In your hand', 'Holding it so its size shows'),
                   ('In use', 'Worn, used or on a shelf'), ('The set', 'All of them together, or on a ruler')],
            test_clips=[('IMG_1471', 0.5), ('IMG_1471', 6.0), ('IMG_1474', 10.0), ('IMG_1522', 0.0)])
INK, WHITE = (28, 27, 26), (255, 255, 255)

def layers():
    b = B.Build(M.HOLDS, 12.0); g = M.setup(); grid = g['grid']
    b.g.art('grid', grid, (0, b.end), 0, (540, 960))
    keep4 = M.stage4
    def stage4(g_, t):          # the phone screen gets its own key colour (the same clip shows twice at once)
        c = g_['c']; im = g_['grid'].copy(); k = back_out(seg(t, 4.6, 4.9), 1.5)
        put(im, P.on_screen(M.PHONE, 340, c['alone2'].at(t - 4.6)), (270, lerp(2400, 960, k)), 1, -3)
        k2 = back_out(seg(t, 4.75, 5.05), 1.5)
        if k2 > 0: M.window(im, c['alone'].at(t - 4.6, (380, 680)), 380, 680, (lerp(1500, 740, k2), 960), 3)
        P.say(im, g_['onscreen'], t, 5.0, (270, 1420), -3); P.say(im, g_['irl'], t, 5.15, (720, 1420), 3)
        M.doodle_on(im, t, 5.35, g_['curve'], (500, 620), 0); return im
    g['c']['alone2'] = g['c']['alone']; M.stage4 = stage4
    still = X.clip_card(MC.KeyClip(MC.KEYS['m']).at(0, (620, 574)), 620, 574, 14)
    try:
        with B.flip_mode(M, g, {'alone': 'm', 'alone2': 'o', 'hand': 'c', 'use': 'y', 'set': 'b'},
                         ('phone_p', 'mug_p', 'fits', 'inuse', 'dims', 'dims_s', 'kw', 'buy'), {'grid': B.CLEAR, 'still': still}):
            track = b.flip(lambda t: M.frame(g, t))
    finally:
        M.stage4 = keep4
    full = (1080, 1920); sw, sh = P.screen_size(M.PHONE, 340)
    b.clips(track, [('m', 0, 0, 1.7, (520, 720), 0, None), ('c', 1, 2.85, 4.6, full, 0, None),
                    ('o', 0, 4.6, 6.1, (sw, sh), 3, None), ('m', 0, 4.75, 6.1, (380, 680), -3, None),
                    ('y', 2, 5.85, 7.6, full, 0, None), ('m', 0, 7.6, 8.85, (620, 574), 2, None),
                    ('b', 3, 9.0, 12.0, full, 0, None)])
    b.say('[6 in phone]', '6 in phone', 44, 2.4, 2.85, (300, 1300), 5, WHITE)
    b.say('[mug]', 'mug', 44, 2.65, 2.85, (720, 1350), 0, WHITE)
    b.say('[one hand]', 'one hand', 60, 3.9, 4.35, (520, 1360), 4, INK)
    b.say('[water-bottle size]', 'paperback size', 56, 6.4, 7.35, (520, 380), 4, INK)
    b.z += 1; b.g.text('montserrat', round(150 * 0.6 / 6.1, 2), ('[9 x 4 in]', '6 x 4 in'), (b.R(8.5), b.R(8.9)), b.z, (520, 1450), 4,
                       {'scale': MC.popk(0, 0.3)}, color=INK, stroke=(WHITE, 0.08))
    b.say('[9 x 4 in]', '6 x 4 in', 60, 9.1, None, (540, 380), 5, INK)
    b.say('"[SIZE]"', '"SIZE"', 64, 10.55, None, (520, 1220), 0, WHITE)
    b.say('[shop link in bio]', 'shop link in bio', 52, 10.75, None, (500, 1340), 4, INK)
    return b.g
