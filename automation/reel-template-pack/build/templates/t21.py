"""21 Small batch, approved 2026-10-19 (round 3, motion test build/motion_21.py). Five clips are real CapCut clip
layers: the batch, picking one up, the slow pass (inside the card's window, then full frame), packing it and the end.
The pink paper, vintage card, fountain pen, gold seal, calendar and DM Serif words are a flipbook from the motion test
(build/capcut_b2b.py). Editable Montserrat: the batch size after "only", how each one is made, the next batch date,
when yours ships, the keyword and the product name.
CapCut limits: the pen's handwritten "No. 07 of 24" is artwork (the batch size to edit is the one after "only")."""
from PIL import Image
import capcut_b2b as B
import motion_21 as M
import play as P

SPEC = dict(num='21', title='Small batch', subtitle='21 seconds. Five clips: the batch, one picked up, a slow pass, packing, the end.',
            font='montserrat', dir='21-small-batch', folder='Template 21 - Small batch', project='Scrolly 21 Small batch', cover_at=0.8,
            slots=[('The batch', 'The whole batch, laid out'), ('Picking one', 'Picking one up'), ('A slow pass', 'A slow pass over the batch'),
                   ('Packing', 'Packing one up'), ('The end', 'You or your product')],
            test_clips=[('IMG_1522', 0.0), ('IMG_1471', 5.5), ('IMG_1522', 0.0), ('IMG_1474', 15.0), ('IMG_1472', 1.0)])
WHITE, PINK, WINE = (255, 255, 255), M.PINK, M.WINE

def layers():
    b = B.Build(M.HOLDS, 14.0); g = M.setup()
    full_cap, word = g['only'], P.caption('only', 260, WHITE)                  # "only" stays DM Serif; the number is editable
    only = Image.new('RGBA', full_cap.size, (0, 0, 0, 0)); only.alpha_composite(word, (0, (full_cap.height - word.height) // 2))
    num_x = 540 - full_cap.width / 2 + word.width + (full_cap.width - word.width) / 2 - 10
    with B.flip_mode(M, g, {'batch': 'm', 'pick': 'c', 'pass': 'y', 'pack': 'b', 'cta': 'o'},
                     ('each', 'next', 'ships', 'kw', 'name'), {'only': only}):
        track = b.flip(lambda t: M.frame(g, t))
    full = (1080, 1920); win = (g['cw'] - 80, g['ch'] - 80)
    b.clips(track, [('m', 0, 0, 1.8, full, 0, None), ('c', 1, 3.6, 5.4, full, 0, None),
                    ('y', 2, 5.2, 7.5, win, 3, None), ('y', 2, 7.5, 8.4, full, 0, None),
                    ('b', 3, 9.8, 11.6, full, 0, None), ('o', 4, 11.4, 14.0, full, 0, None)])
    b.z += 1; b.g.text('montserrat', B.sz(200), ('[24]', '24'), (b.R(0.05), b.R(1.8)), b.z, (num_x, 372), 3,
                       {'scale': B.MC.popk(0, 0.3)}, color=WHITE, stroke=(M.INK, 0.06))
    b.say('[each one signed by hand]', 'each one signed by hand', 60, 5.5, 7.0, (540, 1500), 4, WINE)
    b.say('[Oct 30]', 'Oct 30', 84, 9.2, 9.8, (580, 530), -1, WHITE)
    b.say('[yours ships Friday]', 'yours ships Friday', 62, 10.1, 11.4, (540, 1380), 4, PINK)
    b.say('"[KEYWORD]"', '"BATCH"', 64, 11.95, None, (540, 1200), 0, WHITE)
    b.say('[Product name]', 'The Iron Set', 56, 12.15, None, (540, 1340), 4, WINE)
    return b.g
