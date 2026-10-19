"""04 A or B?, approved 2026-10-19 (motion test build/motion_04.py, after her note on the arrows).
Three clips are real CapCut clip layers: version A, version B (each as a card, on the scale, full frame, on the phone,
in the split) and the pick at the end. Everything else (marble stage, scale, notes, poll, doodles, DM Serif words) is a
flipbook rendered from the motion test (build/capcut_b2b.py on build/motion_capcut.py). Editable Montserrat: the two
names, the notes, the A and B lines, the keyword and the shop line.
CapCut limits: the windows on the scale have no name tags (they moved with the scale); the strips into the split are
a plain split; the strip slices show the clip under tinted strips."""
from PIL import Image
import capcut_b2b as B
import motion_04 as M
import motion_capcut as MC
import play as P
import play_extra as X

SPEC = dict(num='04', title='A or B?', subtitle='20 seconds. Three clips: version A, version B, you picking one.',
            font='montserrat', dir='04-a-or-b', folder='Template 04 - A or B', project='Scrolly 04 A or B', cover_at=1.2,
            slots=[('Version A', 'Version A of your product, upright, close'),
                   ('Version B', 'Version B, filmed the same way'),
                   ('You picking one', 'Your hand picking one up')],
            test_clips=[('IMG_1422', 7.0), ('IMG_1418', 2.0), ('IMG_1401', 0.5)])
WINE, BABY, WHITE = X.WINE, X.BABY, (255, 255, 255)

def layers():
    b = B.Build(M.HOLDS, 14.0); g = M.setup(); stage = g['stage']
    b.g.art('stage', stage, (0, b.end), 0, (540, 960))
    keys = {'A': 'm', 'A2': 'm', 'B': 'c', 'B2': 'c', 'pick': 'y'}
    extra = {'stage': B.CLEAR, 'noteA2': P.sticky('', 280, pin='pin-head-black'), 'noteB2': P.sticky('', 280, pin='pin-head-cream'),
             'noteA': P.sticky('', 330, pin='pin-head-black')}
    il = X.interleave
    X.interleave = lambda a, bb, u, n=8, gap=10, line=WHITE: il(a, bb, 1.0, n, gap, line)     # CapCut: the plain split
    try:
        with B.flip_mode(M, g, keys, ('tagA', 'tagB', 'nameA', 'nameB', 'kw', 'shop'), extra):
            track = b.flip(lambda t: M.frame(g, t))
    finally:
        X.interleave = il
    pans = M.scale_at(g, Image.new('RGBA', (1080, 1920)), 0, 'tiltB', (540, 1150)); p = (pans[1][0], pans[1][1] - 200)
    def dive(t):          # the camera dives into B's window (motion_b2.camera on the scale stage)
        ts = b.R_inv(t); z = M.lerp(1, 5.5, M.ease(M.seg(ts, 6.5, 7.0)) ** 2); w, h = 1080 / z, 1920 / z
        x0 = min(max(p[0] - w / 2, 0), 1080 - w); y0 = min(max(p[1] - h / 2, 0), 1920 - h)
        return (p[0] - x0) * z, (p[1] - y0) * z, z, 0
    sw, sh = P.screen_size(M.PHONE, 600); half = (W2 := 1080 // 2 - 14, 1920)
    b.clips(track, [('m', 0, 0, 1.8, (430, 700), 5, None), ('c', 1, 0.15, 1.8, (430, 700), -5, None),
                    ('m', 0, 3.1, 5.2, (1080, 1920), 0, None),
                    ('m', 0, 5.25, 6.5, (330, 330), 0, 'circle'), ('c', 1, 5.85, 6.5, (330, 330), 0, 'circle'), ('c', 1, 6.5, 7.0, (330, 330), 0, 'circle', dive),
                    ('c', 1, 7.0, 8.6, (1080, 1920), 0, None),
                    ('c', 1, 8.3, 9.95, (sw, sh), 4, None),
                    ('m', 0, 9.9, 11.8, half, 0, None), ('c', 1, 9.9, 11.8, half, 0, None),
                    ('y', 2, 11.8, 14.0, (1080, 1920), 0, None)])
    b.say('[Copper]', 'Copper', 60, 0.45, 1.65, (300, 1400), 5, BABY)
    b.say('[Mint]', 'Mint', 60, 0.6, 1.65, (780, 1460), -1, WHITE)
    for i, (words, test, xy, r, t0) in enumerate((('[copper +\ncordless]', 'copper +\ncordless', (234, 1182), -8, 2.2), ('[mint +\nsteam]', 'mint +\nsteam', (882, 1182), 8, 2.45))):
        n = 'pin-head-black' if i == 0 else 'pin-head-cream'; o = MC.text_anchor(P.sticky(words, 280, pin=n), P.sticky('', 280, pin=n), r)
        b.say(words, test, 44, t0 + 0.1, 3.1, (xy[0] + o[0], xy[1] + o[1]), -r, None)
    b.say('A: [Copper. Cordless.]', 'A: Copper. Cordless.', 58, 3.6, 4.9, (580, 1380), 4, WINE)
    o = MC.text_anchor(P.sticky('[so light]', 330), P.sticky('', 330), 6)
    b.say('[so light]', 'so light', 50, 4.2, 4.9, (820 + o[0], 640 + o[1]), -6, None)
    b.say('B: [Mint. Steam-clean.]', 'B: Mint. Steam-clean.', 58, 7.3, 8.3, (560, 1330), 0, WINE)
    b.say('[Copper]', 'Copper', 60, 11.0, 11.8, (270, 360), 6, BABY)
    b.say('[Mint]', 'Mint', 60, 11.0, 11.8, (810, 360), -2, WHITE)
    b.say('"A" or "B"', '"A" or "B"', 64, 12.4, None, (520, 1290), 0, WHITE)
    b.say('[both in my shop]', 'both in my shop', 50, 12.6, None, (520, 1400), 4, WINE)
    return b.g
