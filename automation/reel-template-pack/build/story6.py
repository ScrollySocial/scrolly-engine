"""Next batch (2026-10-18): #08 A real customer question, #20 What buyers said, #23 Every option in 10 seconds, #15 New
drop reveal (fresh), #11 A day with it. Same approach as #09/#10/#12 round 3 (must-dos 1 to 13): 8 to 9 scenes, two
home bases (the buyer's video + one graphic stage that returns with a new setup), graphics-only scenes, a tech moment in
most, Bodoni italic story words coming in word by word, Montserrat pills for editable words, one muted accent per
template, her doodles only with a job, play on every object. Each template has its own world.
Usage: python build/story6.py 08 [seconds ...]  ->  NN-.../preview/motion-test.mp4  (or a test sheet)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
from story4 import roundwin, card, swipe, diagonal, balloon
from collage_kit import doodle, doodle_on, raw
from motion_b2 import Clip, put, render, circle_mask, ease, back_out, seg, lerp, lerp2, W, H, WHITE

pop = P.say
MU = P.MUTED; INK, CRM, STONE = (28, 27, 26), (246, 241, 232), (196, 188, 176)
PHONE, HANDPHONE = 'Graphite Smartphone With Green Screen-38.png', 'Hand Holding Graphite Smartphone with Green Screen-40.png'
DIRS = {'08': '08-a-real-customer-question', '20': '20-what-buyers-said', '23': '23-every-option-in-10-seconds', '15': '15-new-drop-reveal', '11': '11-a-day-with-it'}

def toned(folder, name, dark, light, crop=None):
    im = raw(folder, name, crop) if crop else S.raw(folder, name)
    return ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(ImageOps.grayscale(im)), dark, light), (W, H), Image.LANCZOS).convert('RGBA')

def shake(t, t0, t1, amp=7): return amp * math.sin(t * 55) * (1 - seg(t, t0, t1)) if t >= t0 else 0

# ======================================================================================================================
# 08 A real customer question (14 s, 8 scenes; graphics-only: 1, 6; tech: 2). Accent: dusty blue.
# World: the switchboard: dusty-blue toned paper, a real rotary phone, pinned DM cards (buyer's screenshots).
#  1 0.0  STAGE: the rotary phone rings (striped, shaking); the question pinned up as a DM card; "you asked"
#  2 1.6  a hand-held phone shows the DM on its screen (tech); the question pill
#  3 3.0  the answer, full frame; word sandwich: "here's" / the answer / "[in one line]"
#  4 4.6  STAGE swap in place: the DM card flips to the answer sticky note; the clip pinned beside it as a photo
#  5 6.0  answer part 2, full frame; an arrow at the product
#  6 7.6  STAGE, no video: more DMs pinned one by one ("you all asked"); the phone carried back in, ringing
#  7 9.0  in use, full frame (motion-blur swipe in)
#  8 10.6 CTA on the stage: the clip as a pinned photo, Comment + keyword + "[more questions?]"
# ======================================================================================================================
DUSTY = MU['dusty']

def setup_08():
    g = {'c': {'ans1': Clip('IMG_1381', 1.0), 'ans2': Clip('IMG_1414', 1.0), 'use': Clip('IMG_1391', 1.0), 'cta': Clip('IMG_1381', 3.0)}}
    g['stage'] = toned('images', 'Cream parchment paper stack-205.png', (150, 165, 182), (236, 240, 244), (0.3, 0.3, 0.7, 0.62))
    g['phone'] = P.thing('Dusty blue vintage rotary telephone-26.png', 520, 'stripes', CRM, scale=0.45, strength=0.65)
    q = ['[the question your', 'customer asked]']
    g['dm'] = P.pinned(P.proof_card(q, 600, DUSTY), -4); g['dm_raw'] = P.proof_card(q, 560, DUSTY)
    g['dms'] = [P.pinned(P.proof_card(l, 460, DUSTY), r, pn) for l, r, pn in ((['[another question]'], 6, 'pin-head-black'), (['[and another]'], -7, 'pin-head-white'), (['[one more]'], 4, 'pin-head-cream'))]
    g['answer_note'] = P.sticky('[yes! wash\nit at 30°]', 460, px=58, pin='pin-head-black')
    g['you'] = P.caption('you asked', 150, DUSTY); g['qpill'] = P.pill_m('[can I wash it?]', 62, INK, CRM)
    g['heres'] = P.pill_m("here's", 56, INK, CRM); g['answer'] = P.caption('the answer', 140, DUSTY); g['line'] = P.pill_m('[in one line]', 54, CRM, INK)
    g['all'] = P.caption('you all asked', 118, DUSTY); g['comment'] = P.caption('Comment', 150, DUSTY, 'stripes'); g['kw'] = P.pill_m('"[KEYWORD]"', 60, INK, CRM)
    g['more'] = P.pill_m('[more questions?]', 54, CRM, INK); g['ans2'] = P.pill_m('[the answer, line two]', 54, INK, CRM)
    g['d_burst'] = doodle('burst', 5, 230, DUSTY); g['d_arrow'] = doodle('arrow', 9, 230, WHITE); g['d_under'] = doodle('under', 0, 520, INK)
    return g

def frame_08(g, t):
    c = g['c']
    if t < 1.6:                                                   # 1: the phone rings; the question pinned up (no video)
        im = g['stage'].copy(); s = shake(t, 0.1, 1.0); put(im, g['phone'], (560 + s, 1450), back_out(seg(t, 0.0, 0.3), 1.6), s)
        doodle_on(im, t, 0.15, g['d_burst'], (860, 1250), -20, 1.2)
        pop(im, g['dm'], t, 0.4, (540, 850), 0); pop(im, g['you'], t, 0.1, (540, 330), -3)
        return im
    if t < 3.0:                                                   # 2: the DM on a hand-held phone (tech)
        im = g['stage'].copy(); sw, sh = P.screen_size(HANDPHONE, 900); scr = Image.new('RGBA', (sw, sh), (245, 245, 247, 255))
        dmw = S.fitw(g['dm_raw'], int(sw * 0.96)); scr.alpha_composite(dmw, (int(sw * 0.02), int(sh * 0.28)))
        put(im, P.on_screen(HANDPHONE, 900, scr), (600, lerp(2300, 1180, ease(seg(t, 1.6, 1.9)))), 1, -4)
        pop(im, g['qpill'], t, 2.0, (480, 330), -3)
        if t > 2.75: im = swipe(im, c['ans1'].at(0), seg(t, 2.75, 3.0))
        return im
    if t < 4.6:                                                   # 3: the answer, full frame; word sandwich
        im = c['ans1'].at(t - 3.0); P.sandwich(im, t, 3.1, (540, 1230), g['heres'], g['answer'], g['line']); return im
    if t < 6.0:                                                   # 4: stage: the card swaps in place for the answer note; the clip pinned as a photo
        im = g['stage'].copy(); sw_ = ease(seg(t, 4.7, 5.0))
        if sw_ < 0.5: put(im, g['dm'], (330, 760), 1 - sw_, -4)
        else: put(im, g['answer_note'], (330, 760), back_out(seg(t, 4.85, 5.1), 1.6), -5)
        ph = P.pinned(card(c['ans1'].at(t - 3.0, (420, 540)), 420, 540), 6, 'pin-head-white'); pop(im, ph, t, 4.7, (760, 1250), 0)
        doodle_on(im, t, 5.3, doodle('arrow', 2, 220, INK), (560, 1050), 30)
        return im
    if t < 7.6:                                                   # 5: answer part 2; an arrow at the product
        im = c['ans2'].at(t - 6.0); pop(im, g['ans2'], t, 6.1, (540, 1380), -2); doodle_on(im, t, 6.3, g['d_arrow'], (760, 760), 200); return im
    if t < 9.0:                                                   # 6: no video: more DMs pinned one by one; the phone rings again
        im = g['stage'].copy(); pop(im, g['all'], t, 7.6, (540, 330), -3)
        for i, (xy) in enumerate(((330, 700), (760, 900), (380, 1150))): pop(im, g['dms'][i], t, 7.8 + i * 0.3, xy, 0)
        s = shake(t, 8.5, 8.9); put(im, g['phone'], (800 + s, 1520), back_out(seg(t, 8.3, 8.55), 1.6) * 0.7, s)
        if t > 8.75: im = swipe(im, c['use'].at(0), seg(t, 8.75, 9.0))
        return im
    if t < 10.6: return c['use'].at(t - 9.0)                      # 7: in use
    im = g['stage'].copy(); u = ease(seg(t, 10.6, 10.95))         # 8: CTA: the clip pinned as a photo
    cw, ch = int(lerp(W, 640, u)), int(lerp(H, 820, u)); cd = card(c['cta'].at(t - 10.6, (cw, ch)), cw, ch, int(16 * u))
    put(im, P.pinned(cd, 3 * u, 'pin-head-black') if u > 0.9 else cd, lerp2((W / 2, H / 2), (540, 1050), u))
    pop(im, g['comment'], t, 11.0, (540, 330), -2); pop(im, g['kw'], t, 11.4, (540, 500), 2); pop(im, g['more'], t, 11.6, (540, 1560), -2)
    return im

SETUP = {'08': setup_08}; FRAME = {'08': frame_08}

# ======================================================================================================================
# 20 What buyers said (14 s, 8 scenes; graphics-only: 2, 6; tech: 3). Accent: ochre. World: the prize table: white
# marble, real gold foil stars and seals, one trophy, review screenshots pinned as cards (buyer swaps them in).
#  1 0.0  the product full frame; five gold stars stick on; word sandwich: "what" / buyers / "said"
#  2 1.6  STAGE, no video: review 1 pinned on the marble, a gold seal stamped on its corner
#  3 3.0  the product clip with review 2 on a phone beside it (tech)
#  4 4.4  STAGE: the product clip in a round window, three review cards fanned round it (some behind, some in front)
#  5 5.8  gold stars rush in and cover everything, then fly off to the in-use clip
#  6 7.2  STAGE, no video: the recap: "[200]" pill + "happy buyers" in the big italic, a trophy rises
#  7 8.6  in use, full frame; the stars carried in, one on the corner
#  8 10.0 CTA: word sandwich "see why" / Comment / "[KEYWORD]" over the product
# ======================================================================================================================
OCHRE = MU['ochre']

def setup_20():
    g = {'c': {'prod': Clip('IMG_1388', 0.5), 'p2': Clip('IMG_1391', 1.0), 'use': Clip('IMG_1390', 1.0), 'cta': Clip('IMG_1388', 3.0)}}
    g['marble'] = ImageOps.fit(S.raw('images', 'Soft veined white marble texture-1.png'), (W, H)).convert('RGBA')
    st = P.raw_cut('Gold foil star sticker-95.png', 160); g['stars'] = [C.shadow(st.rotate(r, expand=True), (4, 8), 6, 90) for r in (-12, 8, -4, 10, -18)]
    g['bigstars'] = [S.fitw(st, 380).rotate(r, expand=True) for r in (-20, 0, 15, 30, -35)]
    g['seal'] = P.die_cut(P.raw_cut('Blank gold foil seal sticker-175.png', 200), 6)
    g['rev'] = [P.pinned(P.proof_card(l, 520, OCHRE, '[buyer]', 'review'), r, pn) for l, r, pn in
                ((['[the review, word for word]'], -4, 'pin-head-cream'), (['[review two]'], 5, 'pin-head-black'), (['[review three]'], -6, 'pin-head-white'), (['[review four]'], 7, 'pin-head-cream'))]
    g['rev1big'] = P.pinned(P.proof_card(['[the review, word', 'for word]'], 820, OCHRE, '[buyer]', 'review'), -4)
    g['rev_raw'] = P.proof_card(['[review two, word', 'for word]'], 560, OCHRE, '[buyer]', 'review')
    g['trophy'] = P.thing('Plain gold trophy on black base-223.png', 380, None, None, label=P.sticker('No.1', 40, MU['mocha']), label_at=(0.5, 0.3))
    g['what'] = P.pill_m('what', 56, INK, CRM); g['buyers'] = P.caption('buyers', 190, OCHRE); g['said'] = P.pill_m('said', 56, CRM, INK)
    g['num'] = P.pill_m('[200]', 90, INK, CRM); g['happy'] = P.caption('happy buyers', 112, OCHRE)
    g['see'] = P.pill_m('see why', 56, INK, CRM); g['comment'] = P.caption('Comment', 170, OCHRE, 'stripes'); g['kw'] = P.pill_m('"[KEYWORD]"', 58, CRM, INK)
    g['d_arrow'] = doodle('arrow', 9, 220, INK); g['d_spark'] = doodle('icon', 9, 140, OCHRE)
    return g

def frame_20(g, t):
    c = g['c']
    if t < 1.6:                                                   # 1: stars stick on; word sandwich
        im = c['prod'].at(t)
        for i in range(5): put(im, g['stars'][i], (190 + i * 175, 300 - (30 if i in (1, 3) else 0)), 1 + 0.8 * (1 - back_out(seg(t, 0.05 + 0.12 * i, 0.25 + 0.12 * i), 1.2)) if t >= 0.05 + 0.12 * i else 0)
        P.sandwich(im, t, 0.4, (540, 1280), g['what'], g['buyers'], g['said'])
        if t > 1.35: im = swipe(im, stage2_20(g, t), seg(t, 1.35, 1.6))
        return im
    if t < 3.0: return stage2_20(g, t)
    if t < 4.4:                                                   # 3: review 2 on a phone (tech)
        im = c['prod'].at(t - 1.6); sw, sh = P.screen_size(PHONE, 420); scr = Image.new('RGBA', (sw, sh), (245, 245, 247, 255))
        rw = S.fitw(g['rev_raw'], int(sw * 0.94)); scr.alpha_composite(rw, (int(sw * 0.03), int(sh * 0.3)))
        put(im, P.on_screen(PHONE, 420, scr), (lerp(W + 400, 790, ease(seg(t, 3.0, 3.35))), 1150), 1, 6)
        doodle_on(im, t, 3.5, g['d_arrow'], (450, 1150), 0)
        return im
    if t < 5.8:                                                   # 4: the clip in a round window; review cards fanned round it
        im = g['marble'].copy()
        for i, (xy) in enumerate(((260, 520), (830, 640))): pop(im, g['rev'][i + 1], t, 4.5 + i * 0.2, xy, 0)       # behind
        put(im, roundwin(c['prod'].at(t - 1.6, (600, 600)), 600), (540, 1020), back_out(seg(t, 4.4, 4.7), 1.5))
        pop(im, g['rev'][3], t, 4.9, (330, 1500), 0); pop(im, g['seal'], t, 5.2, (820, 1380), 0)                     # in front
        doodle_on(im, t, 5.3, g['d_spark'], (860, 1050), 0)
        return im
    if t < 7.2:                                                   # 5: gold stars rush in and cover it all, then fly off
        im = frame_20(g, 5.79) if t < 6.4 else c['use'].at(t - 6.4)
        for i, (x, y) in enumerate([(x, y) for y in (150, 560, 970, 1380, 1790) for x in (130, 540, 950)]):
            a = ease(seg(t, 5.9 + (i % 5) * 0.03, 6.3)); b = ease(seg(t, 6.45 + (i % 4) * 0.03, 6.9))
            if a <= 0 or b >= 1: continue
            dx, dy = x - W / 2, y - H / 2; n = math.hypot(dx, dy) + 1; fx, fy = dx / n * 1500, dy / n * 1500
            put(im, g['bigstars'][i % 5], (x + fx * (1 - a) + fx * b, y + fy * (1 - a) + fy * b), 1, 80 * b)
        return im if t < 6.9 else c['use'].at(t - 6.4)
    if t < 8.6:                                                   # 6: no video: the recap; a trophy rises
        im = g['marble'].copy(); pop(im, g['num'], t, 7.3, (540, 560), -3); pop(im, g['happy'], t, 7.5, (540, 760), 0)
        put(im, g['trophy'], (540, lerp(2300, 1300, back_out(seg(t, 7.6, 8.0), 1.3))), 1, 0)
        for i, (x, y) in enumerate(((240, 1150), (840, 1180))): pop(im, g['stars'][i + 2], t, 8.0 + i * 0.1, (x, y), 0)
        if t > 8.35: im = swipe(im, c['use'].at(2.2), seg(t, 8.35, 8.6))
        return im
    if t < 10.0:                                                  # 7: in use; one star carried onto the corner
        im = c['use'].at(t - 6.4); put(im, g['stars'][0], (900, 330), 1, 12); return im
    im = c['cta'].at(t - 10.0)                                    # 8: CTA word sandwich
    put(im, g['stars'][0], (900, 330), 1, 12); P.sandwich(im, t, 10.1, (540, 1280), g['see'], g['comment'], g['kw'])
    return im

def stage2_20(g, t):
    """2: review 1 pinned on the marble; a gold seal stamped on its corner (no video)."""
    im = g['marble'].copy(); pop(im, g['rev1big'], t, 1.6, (540, 900), 0)
    k = back_out(seg(t, 2.2, 2.4), 1.2); put(im, g['seal'], (880, 1180), (1 + 0.6 * (1 - k)) if t >= 2.2 else 0)
    for i in range(5): put(im, g['stars'][i], (190 + i * 175, 300), 0.7, 0)
    return im

SETUP['20'] = setup_20; FRAME['20'] = frame_20

def main():
    tid = sys.argv[1]; g = SETUP[tid](); fr = lambda t: FRAME[tid](g, t); out = S.E.PACK / DIRS[tid] / 'preview'
    if len(sys.argv) > 2:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[2:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render(tid, fr, 14.0, out)

if __name__ == '__main__':
    main()
