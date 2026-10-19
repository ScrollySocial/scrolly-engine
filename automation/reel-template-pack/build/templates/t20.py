"""20 What buyers said, round-4 motion test with her four fixes (build/story7.py: pink marble, black pins, the arrow at
the phone, one burst centred behind the circle and the cards).
The buyer's clips are real CapCut clip layers (the product full frame and in the round window, in use, the ending);
the stars, cards, phone, burst, trophy and DM Serif words play as a flipbook from the motion test
(build/motion_capcut.py). Editable Montserrat: what / said, the five reviews, 200, see why, the keyword.
CapCut limits: the swipes are plain slides."""
import contextlib, math
from PIL import Image
from engine import Layers, W, H
import motion_capcut as MC
import play as P
import story7 as S7

SL = P.SLOW; END = S7.SECS['20'] * SL
SPEC = dict(num='20', title='What buyers said', subtitle='22 seconds. Three clips: your product, in use, the ending.',
            font='montserrat', dir='20-what-buyers-said', folder='Template 20 - What buyers said',
            project='Scrolly 20 What buyers said', cover_at=1.2,
            slots=[('Your product', 'Your product, upright, close up (at least 7 seconds)'),
                   ('In use', 'Your product being used'),
                   ('The ending', 'Your product again, or you')],
            test_clips=[('IMG_1388', 0.5), ('IMG_1390', 1.0), ('IMG_1388', 3.0)])
INK, WHITE, WINE, PINK = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['pink']
BLANK = Image.new('RGBA', (2, 2), (0, 0, 0, 0))
REVS = ((['[the review, word for word]'], -4, 'the best thing I bought'), (['[review two]'], 5, 'obsessed!'),
        (['[review three]'], -6, 'buying another'), (['[review four]'], 7, 'gift for my mum'))
BIG = ['[the review, word', 'for word]']; RAW = ['[review two, word', 'for word]']

def sz(px): return round(px * 0.85 / 6.1, 2)
def card(lines, w, rot=None):
    c = P.proof_card(lines, w, WINE, '[buyer]', 'review'); return c if rot is None else P.pinned(c, rot, 'pin-head-black')

@contextlib.contextmanager
def flip_mode(g):
    c = g['c']; keep = dict(g); keep_c = dict(c); sw = S7.swipe
    c.update(prod=MC.KeyClip(MC.KEYS['m']), use=MC.KeyClip(MC.KEYS['c']), cta=MC.KeyClip(MC.KEYS['y']))
    for k in ('what', 'said', 'num', 'see', 'kw'): g[k] = BLANK
    g['rev'] = [card([''] * len(l), 520, r) for l, r, _ in REVS]; g['rev1big'] = card(['', ''], 820, -4); g['rev_raw'] = card(['', ''], 560)
    def slide(old, new, u, direction=1):
        if u <= 0: return old
        if u >= 1: return new
        dx = int(direction * S7.ease(u) * W); out = Image.new('RGBA', (W, H)); out.alpha_composite(old, (-dx, 0)); out.alpha_composite(new, (direction * W - dx, 0)); return out
    S7.swipe = slide
    try: yield
    finally:
        S7.swipe = sw; g.clear(); g.update(keep); c.clear(); c.update(keep_c)

def slide_out(t0, x, at):
    return [(0, x)] + [((at + 0.05 * k - t0) * SL, x - S7.ease(k / 6) * W) for k in range(7)]

def layers():
    g = Layers(); s = S7.setup_20(); marble = s['marble']
    g.art('marble', marble, (0, END), 0, (540, 960))
    with flip_mode(s):
        s['marble'] = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        frames, track = MC.flipbook(lambda t: S7.frame_20(s, t / SL), 0, END)
    s['marble'] = marble
    g.flip('fx', frames, 0, 40)
    full = lambda t: (540, 960, 1.0, 0)
    MC.clip_layers(g, track, [
        ('m', 0, 0, 2.4 * SL, (W, H), 0, None, lambda t: t),
        ('m', 0, 4.4 * SL, 6.4 * SL, (W, H), 0, None, lambda t: t - 2.4 * SL, full),
        ('m', 0, 6.4 * SL, 9.0 * SL, (600, 600), 0, 'circle', lambda t: t - 2.4 * SL),
        ('c', 1, 9.0 * SL, 9.8 * SL, (W, H), 0, None, lambda t: t - 9.0 * SL, full),
        ('c', 1, 11.5 * SL, 13.2 * SL, (W, H), 0, None, lambda t: t - (11.8 - 2.2) * SL),
        ('y', 2, 13.2 * SL, END, (W, H), 0, None, lambda t: t - 13.2 * SL, full)], z0=1)

    z = [60]
    def say(words, test, px, t0, t1, pos, rot, box=(255, 255, 255), color=INK, kf_x=None, round_=0.0, size=None):
        z[0] += 1; k = {'scale': MC.popk(0, 0.3 * SL)}
        if kf_x: k['x'] = kf_x
        g.text('montserrat', size or sz(px), (words, test), (t0 * SL, t1 * SL), z[0], pos, rot, k, color=color, box=box and (box, round_))
    def sandwich(t0, t1, c, top, big, bottom, top_w, bot_w, bot_box, bot_rot, slide_at=None, bot_round=0.0, bot_color=INK):
        bh = max(i.height for i, _ in big)
        tp = (c[0], c[1] - bh / 2 - top.height / 2 + 30); bp = (c[0], c[1] + bh / 2 + bottom.height / 2 - 30); tb = t0 + 0.35 + 0.13 * len(big)
        say(top_w[0], top_w[1], 78, t0, t1, tp, 4, kf_x=slide_out(t0, tp[0], slide_at) if slide_at else None)
        say(bot_w[0], bot_w[1], 78, tb, t1, bp, bot_rot, box=bot_box, color=bot_color, round_=bot_round, kf_x=slide_out(tb, bp[0], slide_at) if slide_at else None)
    sandwich(0.5, 2.4, (540, 1100), s['what'], s['buyers'], s['said'], ('what', 'what'), ('said', 'said'), PINK, 0, slide_at=2.1)
    # the reviews: editable words on each card (the buyer types their real reviews)
    lines = '\n'.join(BIG); o = MC.text_anchor(card(BIG, 820, -4), card(['', ''], 820, -4))
    say(lines, 'the best thing\nI bought all year', 0, 2.4, 4.4, (540 + o[0], 900 + o[1]), 4, box=None, size=round(820 * 0.065 * 0.95 / 6.1, 2))
    sw, sh = P.screen_size(S7.PHONE, 440)
    def phone_with(lines_):
        scr = Image.new('RGBA', (sw, sh), (245, 245, 247, 255)); rw = S7.S.fitw(card(lines_, 560), int(sw * 0.94)); scr.alpha_composite(rw, (int(sw * 0.03), int(sh * 0.3)))
        return P.on_screen(S7.PHONE, 440, scr)
    o = MC.text_anchor(phone_with(RAW), phone_with(['', '']), 6); px_raw = 560 * 0.065 * (sw * 0.94 / 560)
    xs = [((4.4 + 0.35 * j / 8 - 4.4) * SL, S7.lerp(W + 400, 790, S7.ease(j / 8)) + o[0]) for j in range(9)]
    g.text('montserrat', round(px_raw * 0.95 / 6.1, 2), ('\n'.join(RAW), 'obsessed with it,\nso soft'), (4.4 * SL, 6.4 * SL), 70, (790 + o[0], 1150 + o[1]), -6, {'x': xs}, color=INK)
    for i, ((l, r, test), (xy, t0)) in enumerate(zip(REVS[1:], (((260, 520), 6.6), ((830, 640), 6.9), ((330, 1400), 7.1)))):
        o = MC.text_anchor(card(l, 520, r), card([''], 520, r))
        say(l[0], test, 0, t0, 8.75, (xy[0] + o[0], xy[1] + o[1]), -r, box=None, size=round(520 * 0.065 * 0.95 / 6.1, 2))
    say('[200]', '200', 110, 9.9, 11.8, (540, 520), 5, kf_x=slide_out(9.9, 540, 11.5))
    sandwich(13.3, END / SL, (540, 1100), s['see'], s['comment'], s['kw'], ('see why', 'see why'), ('"[KEYWORD]"', '"SOFT"'), WINE, -2, bot_round=1.0, bot_color=WHITE)
    return g
