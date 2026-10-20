"""16 What it feels like, approved 2026-10-19 (motion test build/motion_16.py). Five clips are real CapCut clip layers:
the squeeze, close-up 1, close-up 2, the satisfying moment (also on the phone) and the whole product (also the end);
the hook's fast cuts and the three pinned photos are the same clips. The paper, phone, burst, sparkles and DM Serif
words are a flipbook from the motion test (build/capcut_b2b.py). Editable Montserrat: the product, the three feeling
words (on their clips and on the pinned photos), "you'll hear it", the product name and the keyword."""
import math
from PIL import Image
import capcut_b2b as B
import motion_16 as M
import motion_capcut as MC
import play as P
import play_extra as X
import storyboard_b2 as S

SPEC = dict(num='16', title='What it feels like', subtitle='20 seconds. Five clips, filmed close with the sound on.',
            font='montserrat', dir='16-what-it-feels-like', folder='Template 16 - What it feels like', project='Scrolly 16 What it feels like',
            cover_at=0.6,
            slots=[('A squeeze', 'A squeeze, press or stretch'), ('Close-up 1', 'A hand across the surface'), ('Close-up 2', 'Another texture, close'),
                   ('The satisfying moment', 'A pour, fold, tap or drape (sound on)'), ('The whole product', 'The whole product, pulled back')],
            test_clips=[('IMG_1403', 0.5), ('IMG_1406', 0.0), ('IMG_1407', 0.5), ('IMG_1409', 0.0), ('IMG_1398', 0.0)])
INK, WHITE, BUTTER = (24, 23, 22), (255, 255, 255), M.PINK

def layers():
    b = B.Build(M.HOLDS, 12.5); g = M.setup(); paper = g['paper']
    b.g.art('paper', paper, (0, b.end), 0, (540, 960))
    pin = S.fitw(Image.open(M.PINS / 'pin-head-black.png').convert('RGBA'), 54)
    def make_cards():
        out = []
        for i, k in enumerate('cyb'):
            cd = X.clip_card(MC.KeyClip(MC.KEYS[k]).at(0, (300, 380)), 300, 380, 14, (-5, 3, -3)[i]); cd.alpha_composite(pin, (int(cd.width / 2 - 27), 10)); out.append(cd)
        return out
    cards = B.both(make_cards)
    with B.flip_mode(M, g, {'squeeze': 'm', 'close': 'c', 'close2': 'y', 'drape': 'b', 'whole': 'o', 'cta': 'o'},
                     ('mine', 'soft', 'smooth', 'hear', 'name', 'kw'), {'paper': B.CLEAR, 'cards': cards[0], 'words3': [B.BLANK] * 3}):
        track = b.flip(B.per_pass(g, {'cards': cards}, lambda t: M.frame(g, t)))
    full = (1080, 1920); sw, sh = P.screen_size(M.PHONE, 560)
    grow = lambda t: (540, 960, M.lerp(260, 1150, M.ease(M.seg(b.R_inv(t), 5.0, 5.6))) / 260, 0)
    segs = [('m', 0, 0, 0.45, full, 0, None), ('c', 1, 0.45, 0.9, full, 0, None), ('y', 2, 0.9, 1.35, full, 0, None), ('b', 3, 1.35, 1.8, full, 0, None),
            ('c', 1, 1.8, 3.4, full, 0, None), ('b', 3, 3.4, 5.0, (sw, sh), 4, None),
            ('y', 2, 5.0, 5.6, (520, 520), 0, 'circle', grow), ('y', 2, 5.6, 6.6, full, 0, None)]
    segs += [(k, i + 1, 6.8, 8.2, (300, 380), (5, -3, 3)[i], None) for i, k in enumerate('cyb')]
    segs += [('o', 4, 8.2, 12.5, full, 0, None)]
    b.clips(track, segs)
    b.say('[my velvet throw]', 'my linen sheets', 62, 0.6, 1.6, (540, 740), 0, BUTTER)
    b.say('[soft]', 'cool', 130, 1.95, 3.2, (380, 1330), 5, BUTTER)
    b.say("[you'll hear it]", "you'll hear it", 58, 4.0, 5.0, (540, 490), 0, WHITE)
    b.say('[smooth]', 'crisp', 130, 5.6, 6.4, (640, 1330), -1, WHITE)
    for i, ((words, test), x) in enumerate(zip((('[soft]', 'cool'), ('[smooth]', 'crisp'), ('[cozy]', 'airy')), (220, 540, 860))):
        b.say(words, test, 56, 7.1 + i * 0.2, 8.0, (x, 1250 + (i % 2) * 60), (5, -1, 4)[i], (BUTTER, WHITE, BUTTER)[i])
    b.say('[Product name]', 'The Linen Set', 62, 8.6, 9.6, (540, 1380), 4, BUTTER)
    b.say('"[KEYWORD]"', '"FEEL"', 64, 10.15, None, (540, 1220), 0, WHITE)
    return b.g
