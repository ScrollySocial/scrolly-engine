"""20 What buyers said, round-4 motion test with her four fixes (build/story7.py: pink marble, black pins, the arrow at
the phone, one burst centred behind the circle and the cards).
FULLY EDITABLE build (2026-10-20, build/editable.py; the motion test plays P.SLOW times longer, so script times are
scaled by SLOW): every word is CapCut text (DM Serif Display built-in words: buyers, happy buyers, Comment, No.1;
what / said, the reviews and buyer names, 200, see why and the keyword in Montserrat, the [brackets] on CapCut's text
background); the arrow and the underline are Scrolly Doodles letters (recolour like text); the pink marble stage is
CapCut's background colour under a colourless marble grain; the gold stars, review cards, phone and trophy are real
photos moving on keyframes; the three clips are real clip layers (placeholder cards until the buyer's clips go in):
the product (full frame and in the round window), in use, the ending.
CapCut limits: the ray burst behind the round window is a picture (text always sits above pictures; recolour it with
Adjust > HSL); the review cards and the No.1 sticker are pictures (recolour with Adjust > HSL; the words on them are
text); the motion-blur swipes are plain slides."""
import math
from PIL import Image
import editable as Ed
from editable import at, still, then
import editable_b as B
from editable_b import pop, word, out_l, in_r
import play as P
import story7 as S7
import storyboard_b2 as S
from story4 import roundwin
from collage_kit import doodle as art_doodle, raw
from motion_b2 import ease, back_out, seg, lerp
from engine import W, H

SL = B.SL; END = S7.SECS['20']
SPEC = dict(num='20', title='What buyers said', subtitle='22 seconds. Three clips: your product, in use, the ending.',
            font='montserrat', dir='20-what-buyers-said', folder='Template 20 - What buyers said',
            project='20 What buyers said', cover_at=1.2,
            slots=[('Your product', 'Your product, upright, close up (at least 7 seconds)'),
                   ('In use', 'Your product being used'),
                   ('The ending', 'Your product again, or you')],
            test_clips=[('IMG_1388', 0.5), ('IMG_1390', 1.0), ('IMG_1388', 3.0)])
INK, WHITE, WINE, PINK = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['pink']
STAGE = (238, 186, 208)
NAMES = ('Sam R.', 'Priya', 'Jo M.', 'Alex T.', 'Mia')

def rcard(lines, w, pin='pin-head-black', wrap=None):
    """A review card with no words baked in: (image, [(words, px, offset)]) for the review lines and the buyer name.
    wrap(card) -> the final picture (pinned by default, or the card on a phone screen)."""
    wrap = wrap or ((lambda c: P.pinned(c, 0, pin)) if pin else (lambda c: c))
    n = len(lines); blank = wrap(P.proof_card([''] * n, w, WINE, '', 'review'))
    px = int(w * 0.065)
    while px > 12 and max(S.F(P.MONT, px).getlength(l) for l in lines) > w * 0.76: px -= 2
    o_lines = B.anchor(wrap(P.proof_card(lines, w, WINE, '', 'review')), blank)
    o_name = B.anchor(wrap(P.proof_card([''] * n, w, WINE, '[buyer]', 'review')), blank)
    return blank, [('\n'.join(lines), px, o_lines), ('[buyer]', int(w * 0.045), o_name)]

def words_on(r, card_words, tests, a, b, f, scale=1.0):
    for (words, px, off), test in zip(card_words, tests):
        col = INK if words != '[buyer]' else (110, 104, 98)
        r.plain(words, px * scale / 0.85 * 0.95, a, b, Ed.child(f, (off[0] * scale, off[1] * scale)), col, test=test)

def reel():
    g = S7.setup_20(); r = B.SlowReel(END)
    r.art('marble-grain', Ed.grain(raw('images', 'Soft veined white marble texture-1.png'), 0.2), 0, None, 1, still(540, 960))

    # 1 (0-2.4) the product full frame; five gold stars stick on one by one; what / buyers / said
    o1 = out_l(2.1)
    r.clip(0, 0, 2.4, 10, then(still(540, 960), o1))
    for i in range(5):
        t0 = 0.05 + 0.15 * i
        r.art(f'star-{i}', g['stars'][i], t0, 2.4, 11 + i, then(lambda ts, i=i, t0=t0: at(190 + i * 175, 300 - (30 if i in (1, 3) else 0), 1 + 0.8 * (1 - back_out(seg(ts, t0, t0 + 0.2), 1.2))), o1))
    bh = max(i.height for i, _ in g['buyers']); c = (540, 1100)
    r.boxed('what', 78, 0.5, 2.4, then(word(c[0], c[1] - bh / 2 - g['what'].height / 2 + 30, 0.5, 4), o1))
    r.serif('buyers', 230, 0.65, 2.4, then(word(c[0], c[1], 0.65, 0), o1), PINK, WINE)
    r.boxed('said', 78, 0.98, 2.4, then(word(c[0], c[1] + bh / 2 + g['said'].height / 2 - 30, 0.98, 0), o1), PINK)

    # 2 (2.1-4.4) marble, no video: review 1 pinned big
    big, bw = rcard(['[the review, word', 'for word]'], 820)
    fb = pop(540, 900, 2.4, 4)
    r.art('review-big', big, 2.4, 4.4, 16, fb)
    words_on(r, bw, ('the best thing\nI bought all year', NAMES[0]), 2.4, 4.4, fb)

    # 3 (4.4-6.4) the product clip with review 2 on a plain phone beside it (tech); an arrow at the phone
    r.clip(0, 4.4, 6.4, 17, still(540, 960), src=2.0 * SL)
    sw, sh = P.screen_size(S7.PHONE, 440); k = sw * 0.94 / 560
    def on_phone(c):
        scr = Image.new('RGBA', (sw, sh), (245, 245, 247, 255)); rc = S7.S.fitw(c, int(sw * 0.94)); scr.alpha_composite(rc, (int(sw * 0.03), int(sh * 0.3)))
        return P.on_screen(S7.PHONE, 440, scr)
    phone, rw_words = rcard(['[review two, word', 'for word]'], 560, None, on_phone)
    rw_words = [(wd, px * k, off) for wd, px, off in rw_words]
    fph = lambda ts: at(lerp(W + 400, 790, ease(seg(ts, 4.4, 4.75))), 1150, 1, -6)
    r.art('phone', phone, 4.4, 6.4, 18, fph)
    words_on(r, rw_words, ('obsessed with it,\nso soft', NAMES[1]), 4.4, 6.4, fph)
    r.doodle('arrow', 9, 230, 5.0, 6.4, pop(450, 1190, 5.0, -90, 0.3), WINE)

    # 4 (6.4-9.0) marble: the clip in a round window, ONE burst behind it, review cards fanned round (behind and in front)
    r.art('burst', art_doodle('burst', 3, 900, WINE), 6.5, 9.0, 19, lambda ts: at(540, 1020, 0.9 + 0.1 * back_out(seg(ts, 6.5, 6.8), 1.5)))
    for i, ((xy), t0, (lines, rr, test)) in enumerate(zip(((260, 520), (830, 640), (330, 1400)), (6.6, 6.9, 7.1),
                                                     ((['[review two]'], 5, 'obsessed!'), (['[review three]'], -6, 'buying another'), (['[review four]'], 7, 'gift for my mum')))):
        cd, cw = rcard(lines, 520); f = pop(xy[0], xy[1], t0, -rr)
        r.art(f'review-{i + 2}', cd, t0, 9.0, 20 + (i if i < 2 else 5), f)
        words_on(r, cw, (test, NAMES[i + 2]), t0, 9.0, f)
    rwin, rsize, roff = B.hole(roundwin(B.keyed((600, 600)), 600))
    fr = lambda ts: at(540, 1020, back_out(seg(ts, 6.4, 6.7), 1.5))
    r.clip(0, 6.4, 9.0, 22, Ed.child(fr, roff), size=rsize, mask='circle', src=4.0 * SL)
    r.art('round-window', rwin, 6.4, 9.0, 23, fr)

    # 5 (8.4-9.8) gold stars rush in and cover everything, then fly off to the in-use clip
    r.clip(1, 9.0, 9.8, 24, still(540, 960))
    for i, (x, y) in enumerate([(x, y) for y in (150, 560, 970, 1380, 1790) for x in (130, 540, 950)]):
        def rush(ts, i=i, x=x, y=y):
            a = ease(seg(ts, 8.5 + (i % 5) * 0.03, 8.9)); b = ease(seg(ts, 9.05 + (i % 4) * 0.03, 9.5))
            dx, dy = x - W / 2, y - H / 2; n = math.hypot(dx, dy) + 1; fx, fy = dx / n * 1500, dy / n * 1500
            return at(x + fx * (1 - a) + fx * b, y + fy * (1 - a) + fy * b, 1, -80 * b)
        r.art(f'big-star-{i}', g['bigstars'][i % 5], 8.5, 9.6, 30 + i, rush)

    # 6 (9.8-11.8) marble, no video: [200] happy buyers; a trophy with a No.1 sticker rises
    o6 = out_l(11.5)
    r.boxed('[200]', 110, 9.9, 11.8, then(pop(540, 520, 9.9, 5), o6), WHITE, '200')
    r.serif('happy buyers', 128, 10.1, 11.8, then(word(540, 700, 10.1, 0), o6), WINE, WHITE)
    r.doodle('under', 0, 520, 10.5, 11.8, then(pop(540, 820, 10.5, 2, 0.3), o6), WINE)
    tro = P.thing('Plain gold trophy on black base-223.png', 380, None, None)
    sticker = S7.dsticker(' ', 44, WINE, WHITE)
    ftr = then(lambda ts: at(540, lerp(2300, 1320, back_out(seg(ts, 10.3, 10.7), 1.3))), o6)
    soff = (0, -0.2 * tro.height)
    r.art('trophy', tro, 10.3, 11.8, 46, ftr)
    r.art('trophy-sticker', sticker, 10.3, 11.8, 47, Ed.child(ftr, soff))
    r.serif('No.1', 44, 10.3, 11.8, Ed.child(ftr, soff), WHITE, WINE, italic_last=False)

    # 7 (11.5-13.2) in use, full frame
    r.clip(1, 11.5, 13.2, 48, then(still(540, 960), in_r(11.5)), src=1.9 * SL)

    # 8 (13.2-end) CTA: see why / Comment / "[KEYWORD]" over the product
    r.clip(2, 13.2, None, 49, still(540, 960))
    bh = max(i.height for i, _ in g['comment'])
    r.boxed('see why', 78, 13.3, None, word(c[0], c[1] - bh / 2 - g['see'].height / 2 + 30, 13.3, 4))
    r.serif('Comment', 210, 13.45, None, word(c[0], c[1], 13.45, 0), WHITE, WINE, italic_last=False)
    r.boxed('"[KEYWORD]"', 78, 13.78, None, word(c[0], c[1] + bh / 2 + g['kw'].height / 2 - 30, 13.78, -2), WINE, '"SOFT"', round_=1)
    return r

def layers():
    return reel().L
