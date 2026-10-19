"""05 Details you'd miss in a photo, approved 2026-10-19 (motion test build/motion_05.py, after her note: the dot band
reaches the top). Five clips are real CapCut clip layers: four close-ups (full frame, and as film frames on the contact
sheet) and the whole product (on the phone, as the card in the middle, full frame at the end). The rest is a flipbook
from the motion test (build/capcut_b2b.py). Editable Montserrat: the three detail lines, the tag's words, the keyword
and the product name.
CapCut limits: detail 3 cuts in (no strips); the camera dives into the phone and the film frame are flipbook-only."""
from PIL import Image, ImageDraw
import capcut_b2b as B
import motion_05 as M
import motion_capcut as MC
import play as P
import storyboard_b2 as S

SPEC = dict(num='05', title="Details you'd miss", subtitle='23 seconds. Five clips: four close-ups, then the whole product.',
            font='montserrat', dir='05-details', folder="Template 05 - Details you'd miss in a photo",
            project='Scrolly 05 Details you would miss', cover_at=1.0,
            slots=[('Detail 1', 'As close as your phone will focus (stitching, texture...)'), ('Detail 2', 'A second detail, close'),
                   ('Detail 3', 'A third detail, close'), ('Detail 4', 'A fourth detail, close'),
                   ('The whole product', 'The whole product, upright, pulled back')],
            test_clips=list(M.DET) + [M.WHOLE])
INK, WHITE = (28, 27, 26), (255, 255, 255)

def tag_blank():
    tag = P.raw_cut('Blank kraft hang tag with twine-116.png', 480).copy()
    tag.alpha_composite(P.sticker('04', 64, M.TEAL, WHITE, 'circle'), (int(tag.width / 2 - 60), int(tag.height * 0.42))); return P.die_cut(tag, 8)

def layers():
    b = B.Build(M.HOLDS, 14.0); g = M.setup(); sheet = g['sheet']
    b.g.art('sheet', sheet, (0, b.end), 0, (540, 960))
    keys = {'d0': 'm', 'd1': 'c', 'd2': 'y', 'd3': 'b', 'whole': 'o', 'cta': 'o'}
    cards = [M.frame_card(MC.KeyClip(MC.KEYS[k]).at(0, (M.FW, M.FH)), i + 1) for i, k in enumerate('mcyb')]
    with B.flip_mode(M, g, keys, ('kw', 'name'), {'sheet': B.CLEAR, 'cards': cards, 'label': tag_blank(), 'p': [B.BLANK] * 3}):
        track = b.flip(lambda t: M.frame(g, t))
    sw, sh = P.screen_size(M.PHONE, 620); k = 290 / g['cards'][0].width; small = (int(M.FW * k), int(M.FH * k))
    full = (1080, 1920)
    segs = [('m', 0, 0, 1.6, full, 0, None), ('o', 4, 1.6, 3.0, (sw, sh), 6, None), ('m', 0, 3.2, 4.8, full, 0, None)]
    segs += [(key, i, 4.8, 6.2 if i == 1 else 5.75, (M.FW, M.FH), (3, -2, -3, 2)[i], None) for i, key in enumerate('mcyb')]
    segs += [('c', 1, 6.2, 7.75, full, 0, None), ('y', 2, 7.75, 9.0, full, 0, None, lambda t: (540, 960, 1.0, 0)),
             ('b', 3, 9.0, 10.4, full, 0, None), ('o', 4, 10.15, 12.0, (420, 600), -2, None)]
    segs += [(key, i, 10.8, 12.0, small, (6, -5, -4, 5)[i], None) for i, key in enumerate('mcyb')]
    segs += [('o', 4, 12.0, 14.0, full, 0, None)]
    b.clips(track, segs)
    for (words, test), (t0, t1, y, r) in zip((('[brushed copper finish]', 'hand-stitched edges'), ('[see-through dust bin]', 'real brass buttons'),
                                              ('[one-touch controls]', 'double-lined inside')), ((3.5, 4.5, 1380, 4), (6.5, 7.75, 1360, 0), (8.15, 9.0, 1370, 4))):
        b.say(words, test, 54, t0, t1, (540, y), r, INK)
    o = MC.text_anchor(g['label'], tag_blank(), 6)
    b.say('[LED head\nshows\nthe dust]', 'lined in\nsoft cotton', 52, 9.45, 10.1, (290 + o[0], 1050 + o[1]), 6, None)
    b.say('"[KEYWORD]"', '"DETAILS"', 64, 12.5, None, (520, 1280), 0, WHITE)
    b.say('[Product name]', 'The Weekender Tote', 54, 12.7, None, (520, 1400), 4, INK)
    return b.g
