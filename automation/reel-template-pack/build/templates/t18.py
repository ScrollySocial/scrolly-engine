"""18 Check this before you buy, approved 2026-10-19 (motion test build/motion_18.py, after her note: the check lines
at the top). Four clips are real CapCut clip layers: your product (the clipboard's sheet, and the laptop screen at the
end) and the three checks (full frame; check two also as the sheet). The clipboard, ticks, number stickers, seal and
DM Serif words are a flipbook from the motion test (build/capcut_b2b.py). Editable Montserrat: the product type, the
three checks (on the sheet and at the top of each check), the keyword and the last line."""
import capcut_b2b as B
import motion_18 as M
import play as P
import play_extra as X

SPEC = dict(num='18', title='Check this before you buy', subtitle='20 seconds. Four clips: your product, then three checks on it.',
            font='montserrat', dir='18-check-this-before-you-buy', folder='Template 18 - Check this before you buy',
            project='Scrolly 18 Check this before you buy', cover_at=1.0,
            slots=[('Your product', 'Your product, upright, close'), ('Check 1', 'The first thing to check, shown on yours'),
                   ('Check 2', 'The second check'), ('Check 3', 'The third check')],
            test_clips=[('IMG_1381', 0.5), ('IMG_1381', 1.5), ('IMG_1378', 0.5), ('IMG_1377', 0.5)])
WHITE, WINE, BLUE = (255, 255, 255), X.WINE, X.BABY
CHECKS = (('1. [check the bristles]', '1. check the stitching'), ('2. [check the cord]', '2. check the zip'), ('3. [check the heat]', '3. check the lining'))

def layers():
    b = B.Build(M.HOLDS, 13.9); g = M.setup(); desk = g['desk']
    b.g.art('desk', desk, (0, b.end), 0, (540, 960))
    keys = {'hook': 'm', 'cta': 'm', 'c1': 'c', 'c2': 'y', 'c3': 'b'}
    with B.flip_mode(M, g, keys, ('before', 'kw', 'all3'), {'desk': B.CLEAR, 'lines': [B.BLANK] * 3, 'big': [B.BLANK] * 3}):
        track = b.flip(lambda t: M.frame(g, t))
    full = (1080, 1920); sheet = (g['sw'], g['sh']); lw, lh = P.screen_size(M.LAPTOP, 1000)
    b.clips(track, [('m', 0, 0, 1.8, sheet, 0, None), ('c', 1, 3.4, 5.2, full, 0, None), ('y', 2, 5.9, 6.8, sheet, 0, None), ('y', 2, 6.8, 7.6, full, 0, None),
                    ('b', 3, 8.2, 9.8, full, 0, None), ('m', 0, 11.4, 13.9, (lw, lh), 0, None)])
    b.say('before you buy a [hair tool]', 'before you buy a tote bag', 56, 0.4, 1.55, (540, 1440), 0, WINE)
    x0, y0 = M.CB_C[0] - M.CB_W / 2, M.CB_C[1] - g['cbh'] / 2; sx, sy = x0 + M.CB_W * M.SHEET[0], y0 + g['cbh'] * M.SHEET[1]
    for i, (words, test) in enumerate(CHECKS):          # the checklist on the sheet, each time the sheet shows it
        pos = (sx + g['sw'] * 0.45, sy + g['sh'] * (0.3 + 0.2 * i))
        for t0, t1 in ((1.9 + 0.25 * i, 3.4), (5.0, 5.9), (7.6, 8.2), (9.6, 11.2)):
            b.say(words, test, 50, t0, t1, pos, 0, (BLUE, WHITE, BLUE)[i])
    for i, ((words, test), (t0, t1, pos, r)) in enumerate(zip(CHECKS, ((3.75, 5.0, (600, 330), 4), (6.0, 6.35, (540, 300), 4), (8.35, 9.6, (600, 330), 0)))):
        b.say(words, test, 60, t0, t1, pos, r, WHITE)
    b.say(CHECKS[1][0], CHECKS[1][1], 60, 6.85, 7.4, (600, 330), 4, WHITE)      # check 2 full frame (her note)
    b.say('"[KEYWORD]"', '"CHECK"', 64, 11.85, None, (540, 500), 0, WHITE)
    b.say('[mine checks all 3]', 'mine checks all 3', 56, 12.05, None, (540, 1440), 4, WINE)
    return b.g
