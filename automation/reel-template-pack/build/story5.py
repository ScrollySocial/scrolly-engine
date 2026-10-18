"""#09, #10, #12 and #22, round 3 (2026-10-18): her approved scene structure (must-do 11: 7 to 10 scenes, two home
bases, a designed change every time, one element carried on, interplay with the person), graphics-only scenes with
real objects and text and no footage (must-do 12), and tech moments on green-screen devices in most of them
(must-do 13: #09 her Reel on a phone over her head, #10 the shop feed scrolling on a phone, #12 the order
notification on a phone; #22 has none). Everything from round 2 stays: readable words on pills, one accent colour
buyers change, doodles only with a job. #22 keeps the magnifier opening, the stamp and the two-tone strip slice.
Usage: python build/story5.py 09 [seconds ...]  ->  NN-.../preview/motion-test.mp4  (or a test sheet)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
import story4 as S4
from story4 import roundwin, card, swipe, diagonal, pan, balloon, INKC, STONE, CRM, TERRA, RED, COB
from collage_kit import doodle, doodle_on
from motion_b2 import Clip, put, pop, render, circle_mask, ease, back_out, seg, lerp, lerp2, W, H, WHITE


# ---- round 3b (her notes on round 2, 2026-10-18): modern type, muted accents, and the specific fixes ---------------------
# Muted accents (buyers change them): #09 clay, #10 wine, #12 olive, #22 brick. Story words in Bodoni Black Italic coming
# in word by word (P.caption + P.say); editable words in Montserrat Bold on pills (P.pill_m).
MU = P.MUTED; INKP, CRMP = (28, 27, 26), (246, 241, 232)
S4.TERRA, S4.RED, S4.COB = MU['clay'], MU['wine'], MU['olive']
TERRA, RED, COB = S4.TERRA, S4.RED, S4.COB
pop = P.say; S4.pop = P.say                      # every pop in both files accepts caption lists (word-by-word entry)

def restyle_09(g):
    g['habit'] = P.pill_m('if you [always run late]', 56, INKP, CRMP); g['this'] = P.caption('this is', 150, TERRA); g['foryou'] = P.caption('for you', 190, TERRA)
    g['problem'] = P.pill_m('[you lose your keys. again.]', 52, INKP, CRMP); g['late'] = P.pill_m('[late. again.]', 64, INKP, CRMP)
    g['meet'] = P.caption('meet', 170, TERRA); g['prod'] = P.pill_m('[PRODUCT NAME]', 58, TERRA, CRMP)
    g['sound'] = P.pill_m('sound like you?', 56, INKP, CRMP); g['comment'] = P.caption('Comment', 190, TERRA, 'stripes'); g['kw'] = P.pill_m('"[KEYWORD]"', 60, CRMP, INKP)
    g['d_under'] = doodle('under', 0, 520, INKP)

def restyle_10(g):
    g['stuck'] = P.pill_m('stuck on a', 62, INKP, CRMP); g['giftw'] = P.caption('gift?', 250, RED)
    g['imp'] = P.caption('the usual?', 140, MU['mocha']); g['works'] = P.pill_m('this one works for', 56, INKP, CRMP); g['all3'] = P.caption('all 3', 210, RED)
    g['names'] = [P.pill_m(n, 46, CRMP, INKP) for n in ('[YOUR FRIEND]', '[YOUR MUM]', '[YOUR DAD]')]
    g['comment'] = P.caption('Comment', 170, RED, 'stripes'); g['kw'] = P.pill_m('"[KEYWORD]"', 60, INKP, CRMP); g['wrap'] = P.pill_m('[gift wrap available]', 46, CRMP, INKP)
    g['three'] = P.caption('3 people', 190, RED); g['found'] = P.pill_m('found it.', 62, INKP, CRMP); g['d_under'] = doodle('under', 0, 520, INKP)

def restyle_12(g):
    g['pov'] = P.pill_m('POV: your [product] just arrived', 48, INKP, CRMP); g['here'] = P.caption("it's here", 200, COB)
    g['ofd'] = P.pill_m('[out for delivery...]', 64, INKP, CRMP); g['delivered'] = P.pill_m('[delivered!]', 70, COB, CRMP)
    g['ding'] = P.pill_m('ding dong!', 56, COB, CRMP); g['inside'] = P.pill_m("[what's inside?]", 64, INKP, CRMP)
    g['words'] = [P.story_word(w_, 250, col) for w_, col in (('the', MU['mocha']), ('wait', COB), ('is over', TERRA if False else MU['clay']))]
    g['get'] = P.caption('get yours', 170, COB); g['kw'] = P.pill_m('comment "[KEYWORD]"', 56, INKP, CRMP); g['d_under'] = doodle('under', 0, 560, INKP)
    g['bell'] = P.die_cut(S.fitw(S.cut('images', 'Vintage brass doorbell with ivory button-43.png', tol=6), 250), 8)   # flood cut keeps the ivory button
    g['mailbox_big'] = P.thing('Vintage Mailbox with Raised Red Flag-20.png', 980, 'stripes', STONE, scale=0.6, strength=0.6)
    g['mailbox_down'] = P.thing('Mailbox with lowered red flag-101.png', 980, 'stripes', STONE, scale=0.6, strength=0.6)
    tag = S.cut('images', 'Blank kraft hang tag with twine-116.png', tol=10); tag = tag.resize((int(tag.width * 2300 / tag.height), 2300), Image.LANCZOS)
    d = ImageDraw.Draw(tag); f = S.F(P.MONT, 60)
    for k, l in enumerate(('[every', 'order comes', 'gift-', 'wrapped]')): d.text((int(tag.width * 0.07), int(tag.height * 0.5) + k * 78), l, font=f, fill=INKP, anchor='lm')
    g['bigtag'] = P.die_cut(tag, 10)

def stage_12b(g, t):
    """2-3 (her note 13): the mailbox opens to the clip: the tracking clip slides up out of the mailbox as a card, big
    words on top; then the card drops back in, the flag pops up: [delivered!]."""
    c = g['c']; im = g['concrete'].copy(); up = ease(seg(t, 1.9, 2.4)) * (1 - ease(seg(t, 3.0, 3.3)))
    if up > 0.01:
        v = c['track'].at(max(0, t - 1.8), (620, 780)); cd = card(v, 620, 780); put(im, cd, (560, lerp(1500, 860, up)), lerp(0.4, 1, up), -3)
    put(im, g['mailbox_down'] if t < 3.3 else g['mailbox_big'], (560, 1450), 1, 0)
    if t < 3.3: pop(im, g['ofd'], t, 2.1, (540, 330), -2)
    else: pop(im, g['delivered'], t, 3.4, (540, 330), -3)
    return im

S4.stage_12 = stage_12b

PHONE, HANDPHONE = 'Graphite Smartphone With Green Screen-38.png', 'Hand Holding Graphite Smartphone with Green Screen-40.png'
DIRS = dict(S4.DIRS, **{'22': '22-put-it-to-the-test'})

def stage_paper(g): return g['paper'].copy()

# ======================================================================================================================
# 09 Who it's for (14 s, 9 scenes; graphics-only: 3, 7; tech: 8)
#  1 0.0  her; a butterfly lands on her head; "if you [always run late]"
#  2 1.6  THIS IS FOR YOU over her, underlined; swipe to the notebook stage
#  3 3.0  STAGE, no video: the usual morning: a striped alarm clock rings, crumpled notes circle it, "[late. again.]"
#  4 4.4  swap in place: the clock becomes the problem clip, B&W, in a torn window
#  5 5.6  swap in place: the window turns to colour: the product; MEET [PRODUCT NAME]; a burst on the swap
#  6 6.8  the product floats up on a string with a gift; an arrow from MEET to it
#  7 8.2  STAGE, no video: sticky notes pinned one at a time: for the [6am crowd] / [dog mums] / [busy mums]
#  8 9.8  her; her Reel plays on a phone floating over her head (tech); swipe from the stage
#  9 11.2 butterflies gather in a circle into a crown (the first one carried from scene 1); CTA word sandwich
# ======================================================================================================================
def setup_09():
    g = S4.setup_09(); restyle_09(g)
    g['clock'] = P.thing('Classic Cream Twin-Bell Alarm Clock-185.png', 420, 'stripes', TERRA, scale=0.5, strength=0.75)
    g['balls'] = [P.thing('Crumpled cream paper ball-58.png', 170 + 20 * (i % 3), ('stripes', 'dots', 'smalldots')[i % 3], (STONE, INKC, TERRA)[i % 3], scale=0.3, strength=0.6, seed=i, edge=6) for i in range(5)]
    g['notes3'] = [P.sticky(t, 380, seed=i, pin=('pin-head-black', 'pin-head-cream', 'pin-head-white')[i]) for i, t in enumerate(('for the\n[6am crowd]', 'for the\n[dog mums]', 'for the\n[busy mums]'))]
    g['mug'] = P.thing('Warm white ceramic coffee mug-140.png', 260, 'dots', TERRA, scale=0.4, strength=0.8)
    g['d_burst2'] = doodle('burst', 5, 220, TERRA)
    return g

def frame_09(g, t):
    c = g['c']; cx, cy, rx, ry = P.HEAD; top = (cx, cy - ry - 90)
    if t < 3.0: return S4.frame_09(g, t) if t < 2.7 else swipe(S4.frame_09(g, 2.69), scene3_09(g, t), seg(t, 2.7, 3.0))
    if t < 4.4: return scene3_09(g, t)
    if t < 6.8:                                                   # 4-5: the window swaps in place: problem B&W, then product
        im = stage_paper(g); sw = ease(seg(t, 5.6, 5.9)); v = c['problem'].at(t - 4.4, (780, 900))
        v = ImageOps.grayscale(v).convert('RGBA') if sw < 0.5 else c['product'].at(t - 5.6, (780, 900))
        k = back_out(seg(t, 4.4, 4.7), 1.6) * (1 - 0.15 * math.sin(math.pi * sw)); v.putalpha(C.torn_mask((780, 900), 5, 18, 'tblr'))
        put(im, C.shadow(v, (10, 16), 14, 110), (540, 980), k, -2)
        if t < 5.6: pop(im, g['problem'], t, 4.5, (540, 380), -2)
        else: doodle_on(im, t, 5.65, g['d_burst'], (540, 980), 0, 6.3); pop(im, g['meet'], t, 5.9, (330, 360), -5); pop(im, g['prod'], t, 6.05, (560, 500), -2)
        return im
    if t < 8.2:                                                   # 6: it floats up on a string
        im = stage_paper(g)
        P.balloon(im, roundwin(c['product'].at(t - 6.8, (520, 520)), 520), t, (560, 860), (560, 1900), 0, rise=(6.8, 7.3, 2400))
        P.balloon(im, g['gift'], t, (880, 1250), (580, 1900), 1.7, rise=(7.0, 7.5, 2400))
        pop(im, g['meet'], t, 7.1, (280, 1320), -6); pop(im, g['prod'], t, 7.25, (330, 1460), -2); doodle_on(im, t, 7.5, g['d_arrow'], (320, 1080), -60)
        return im
    if t < 9.8:                                                   # 7: graphics only: sticky notes pinned one at a time
        im = stage_paper(g); pop(im, g['mug'], t, 8.2, (820, 1520), 6, wiggle=2)
        for i, (xy, r) in enumerate((((300, 620), -6), ((760, 880), 5), ((330, 1220), -3))):
            pop(im, g['notes3'][i], t, 8.3 + i * 0.4, xy, r)
        if t > 9.5: im = swipe(im, c['me'].at(t - 9.8 + 3.0), seg(t, 9.5, 9.8), -1)
        return im
    if t < 11.2:                                                  # 8: her; her Reel on a phone over her head (tech)
        im = c['me'].at(t - 9.8 + 3.0); P.butterfly(im, g['bf'][0], t, (top[0] + 30, top[1] - 40), 0, flap=0.3)
        ph = P.on_screen(PHONE, 250, c['product'].at(t - 9.8)); k = back_out(seg(t, 9.9, 10.3), 1.6)   # above her head, clear of her face
        put(im, ph, (330, 300 + 14 * math.sin(t * 2)), k, -8)
        return im
    return S4.frame_09(g, t - 11.2 + 9.4)                         # 9: the crown + CTA (round 2's ending, shifted)

def scene3_09(g, t):
    im = stage_paper(g); shake = 6 * math.sin(t * 60) * (1 - seg(t, 3.6, 3.9))
    put(im, g['clock'], (540 + shake, 1000), back_out(seg(t, 3.0, 3.3), 1.6), shake)
    doodle_on(im, t, 3.2, g['d_burst2'], (790, 760), 30, 4.2)
    for i, b in enumerate(g['balls']):
        a = t * 1.4 + i * 2 * math.pi / 5; put(im, b, (540 + 380 * math.cos(a), 1000 + 450 * math.sin(a)), back_out(seg(t, 3.2 + i * 0.06, 3.45 + i * 0.06)), a * 30)
    pop(im, g['late'], t, 3.3, (540, 380), -3)
    return im

# ======================================================================================================================
# 10 Three people to gift it to (14 s, 8 scenes; graphics-only: 2-3, 6; tech: 4)
#  1 0.0  the ? gift lands on the gift clip (photo); "stuck on a" GIFT?
#  2 1.6  pan down to the kraft stage, no video: the usual gifts
#  3 2.6  each crossed out in turn
#  4 3.8  a hand holds a phone: the shop feed scrolls like a thumb scroll and stops on the product (tech; photo slots)
#  5 5.2  the phone screen grows into the product clip; "works for ALL 3"
#  6 6.6  kraft stage, no video: 3 PEOPLE; three gift tags drop in with the names written on them
#  7 8.0  the people float up as balloons, a tag hanging on each string (the tags carried on)
#  8 11.2 CTA: balloons rise, the FOR YOU gift, COMMENT + keyword + gift-wrap
# ======================================================================================================================
TAGS = ('Cream gift tag with string loop-42.png', 'Blush pink gift tag with cream loop-44.png', 'Pale blue scalloped gift tag-47.png')

def setup_10():
    g = S4.setup_10(); restyle_10(g)
    g['tagnames'] = []
    for n, name in zip(TAGS, ('[YOUR FRIEND]', '[YOUR MUM]', '[YOUR DAD]')):
        tg = P.raw_cut(n, 300).copy(); ImageDraw.Draw(tg).text((tg.width / 2, tg.height * 0.66), name, font=S.F(P.ANTON, 40), fill=INKC, anchor='mm'); g['tagnames'].append(P.die_cut(tg, 6))
    g['tagsmall'] = [S.fitw(t, 230) for t in g['tagnames']]
    sw, sh = P.screen_size(HANDPHONE, 900); g['sratio'] = sh / sw
    g['feed'] = P.feed([(S.footage(cl), nm, pr) for cl, nm, pr in ((('IMG_1417', 0.5), '[Product 1]', '[$24]'), (('IMG_1391', 1.0), '[Product 2]', '[$18]'),
                         (('IMG_1460', 2.0), '[Product 3]', '[$29]'), (('IMG_1456', 1.0), '[THE ONE]', '[$32]'))], w=sw, accent=RED)
    return g

def frame_10(g, t):
    c = g['c']
    if t < 3.8: return S4.frame_10(g, t)                          # 1-3: round 2's opening and the crossed-out gifts
    if t < 5.2:                                                   # 4: the phone feed scrolls and stops on the product
        im = g['cream'].copy(); f, ch, top = g['feed']; scr = P.phone_scroll(f, ch, top, seg(t, 3.9, 4.8), 3, g['sratio'])
        put(im, P.on_screen(HANDPHONE, 900, scr), (600, lerp(2200, 1150, ease(seg(t, 3.8, 4.1)))), 1, -4)
        pop(im, g['found'], t, 4.8, (300, 330), -4); doodle_on(im, t, 4.85, g['d_arrow'], (250, 560), 150)   # points down at the product on the screen
        return im
    if t < 6.6:                                                   # 5: the screen grows into the product clip
        u = ease(seg(t, 5.2, 5.6)); im = g['cream'].copy() if u < 1 else c['prod'].at(t - 5.2)
        if u < 1:
            d = int(lerp(380, 1500, u)); v = c['prod'].at(t - 5.2, (d, int(d * 1.6))); put(im, card(v, v.width, v.height, int(16 * (1 - u))), (560, 980))
        pop(im, g['works'], t, 5.7, (540, 1250), -2); pop(im, g['all3'], t, 5.9, (540, 1440), 0)   # no overlap (her note)
        return im
    if t < 8.0:                                                   # 6: graphics only: 3 PEOPLE, the tags drop in
        im = g['kraft'].copy(); pop(im, g['three'], t, 6.6, (540, 450), -3)
        for i, (x, r) in enumerate(((250, -8), (540, 4), (830, 9))):
            drop = back_out(seg(t, 6.9 + i * 0.25, 7.2 + i * 0.25), 1.5); put(im, g['tagnames'][i], (x, lerp(-300, 1150, drop)), 1, r + 6 * math.sin(t * 3 + i))
        return im
    im = g['cta_bg'].copy(); up = ease(seg(t, 11.2, 11.7)); anchor = lerp2((540, 2000), (540, 1500), up)      # 7-8
    for i, (clip, xy0, xy1) in enumerate(((c['p1'], (300, 520), (200, 380)), (c['p2'], (780, 760), (540, 330)), (c['p3'], (330, 1080), (880, 380)))):
        xy = lerp2(xy0, xy1, up); d = int(380 - 80 * up); ry = 8.1 + i * 0.9
        balloon(im, roundwin(clip.at(t - 8.0, (d, d)), d), t, xy, (anchor[0] + (i - 1) * 40, anchor[1]), i * 1.7, rise=(ry, ry + 0.6, 2400))
        y_now = lerp(2400, xy[1], ease(seg(t, ry, ry + 0.6)))
        put(im, g['tagsmall'][i], (xy[0] + 14 * math.sin(t * 1.6 + i * 1.7) + 30, y_now + d / 2 + 90), 1, (-8, 6, -5)[i])   # the tag hangs on the string
    if t >= 11.2:
        pop(im, g['box2'], t, 11.2, (540, 1500), 0, wiggle=2)
        pop(im, g['comment'], t, 11.5, (540, 900), -3); pop(im, g['kw'], t, 11.75, (540, 1060), 2); pop(im, g['wrap'], t, 11.95, (540, 1170), -2)
    return im

# ======================================================================================================================
# 12 Your order just arrived (14 s, 9 scenes; graphics-only: 3, 5; tech: 4)
#  1 0.0  diagonal split: the door clip; the doorbell rings; POV + IT'S HERE
#  2 1.8  diagonal wipe to the stage: the tracking clip in the TV; [out for delivery...]
#  3 3.2  swap in place, no video: the mailbox, flag up; [delivered!]
#  4 4.3  a phone slides in: the order notification drops down over the door clip on its screen (tech)
#  5 5.6  concrete stage, no video: the kraft mailer shakes, packing peanuts burst out; [what's inside?]
#  6 6.8  THE / WAIT / IS OVER on three tissue sheets peeling off the unboxing
#  7 9.3  the unboxing, an arrow at the product
#  8 10.7 in use; the tag swings in with the detail on it
#  9 12.2 CTA on the mailer; the doorbell carried back in
# ======================================================================================================================
def setup_12():
    g = S4.setup_12(); restyle_12(g); g['notif'] = P.notification('[YOUR SHOP]', '[Your order has been delivered]', 560)
    pn = P.raw_cut('packing-peanut.png', 130); g['peanut'] = ImageOps.colorize(ImageOps.grayscale(pn.convert('RGB')), (150, 140, 125), (250, 246, 236)).convert('RGBA'); g['peanut'].putalpha(pn.split()[3])   # cream, not green
    g['mailer_s'] = P.thing('Sealed kraft padded mailer-39.png', 640, 'dots', COB, scale=0.4, strength=0.0)
    return g

def frame_12(g, t):
    c = g['c']
    if t < 4.3: return S4.frame_12(g, t)                          # 1-3: round 2's opening, TV and mailbox
    if t < 5.6:                                                   # 4: the phone with the notification (tech)
        im = g['concrete'].copy(); k = ease(seg(t, 4.3, 4.6)); ph_w = 760; sw, sh = P.screen_size(PHONE, ph_w)
        scr = c['door'].at(t - 4.3, (sw, sh)).copy(); n = S.fitw(g['notif'], int(sw * 0.94)); ny = lerp(-n.height, 40, back_out(seg(t, 4.7, 5.0), 1.4))
        scr.alpha_composite(n, (int((sw - n.width) / 2), int(ny)))
        put(im, P.on_screen(PHONE, ph_w, scr), (540, lerp(2400, 1000, k)), 1, -3)
        return im
    if t < 6.8:                                                   # 5: graphics only: the mailer shakes, peanuts burst out
        im = g['concrete'].copy(); sh = 8 * math.sin(t * 50) * (1 - seg(t, 6.0, 6.2)); put(im, g['mailer_s'], (540 + sh, 1100), back_out(seg(t, 5.6, 5.85), 1.5), sh)
        for i in range(12):
            a = -math.pi / 2 + (i - 5.5) * 0.22; s = seg(t, 6.05 + (i % 4) * 0.03, 6.7); r = 900 * ease(s)
            if s > 0: put(im, g['peanut'], (540 + r * math.cos(a), 1000 + r * math.sin(a) + 900 * s * s), 1, i * 40 + 300 * s)
        pop(im, g['inside'], t, 5.75, (540, 420), -3)
        return im
    if 10.7 <= t < 12.2:                                          # 8 (her note 14): a giant tag, a third of it showing, full height, angled
        im = c['use'].at(t - 10.7 + 8.4 - 8.0); x = lerp(W + 700, W - 10, back_out(seg(t, 10.8, 11.2), 1.3))
        put(im, g['bigtag'], (x, 980), 1, 8); return im
    return S4.frame_12(g, t - 2.3)                                # 6-9: round 2's tissues, unboxing, CTA (shifted)

# ======================================================================================================================
# 22 Put it to the test (14 s, 8 scenes; graphics-only: 2, 5; no screen, by design)
#  1 0.0  graph-paper stage: the setup clip inside the real magnifier's lens (the opening); does it really [STAY DRY]?
#  2 1.6  STAGE, no video: the claim: the test tubes fill with her patterns, a sticky note "claim: [stays dry]"
#  3 3.0  two-tone strip slice into the test
#  4 3.3  the test, ONE uncut take; the camera with REC; "one take, no cuts", then the claim, then "watch closely"
#  5 7.4  STAGE, no video: "did it...?" sticky notes; the magnifier slides across the paper (carried)
#  6 8.6  the lens carries the result and opens to full frame
#  7 9.6  the result; the stamp comes down: PASSED (the one main action); [IT STAYED DRY]
#  8 11.0 CTA on the paper: the clip as a card, the kit round it, COMMENT + keyword
# ======================================================================================================================
def setup_22():
    import motion_22 as M; M.RED = MU['brick']; g = M.setup(); g['M'] = M; g['mag_big'], g['lens_big'] = M.magnifier(2000)
    g['claim'] = P.pill_m('[STAY DRY]?', 84, MU['brick'], CRMP); g['test'] = P.caption("let's test it", 150, MU['brick']); g['result'] = P.caption('the result', 160, MU['brick'])
    g['said'] = P.pill_m('[IT STAYED DRY]', 64, INKP, CRMP); g['claim_s'] = P.pill_m('[STAY DRY]?', 60, MU['brick'], CRMP)
    g['note_claim'] = P.sticky('claim:\n[stays dry]', 420); g['did'] = P.sticky('did it...?', 380, pin='pin-head-cream')
    g['really'] = P.pill_m('does it really', 58, INKP, CRMP); g['oneTake'] = P.pill_m('one take, no cuts', 54, INKP, CRMP); g['watch'] = P.pill_m('watch closely', 54, INKP, CRMP)
    g['comment2'] = P.caption('Comment', 180, MU['brick'], 'stripes'); g['kw2'] = P.pill_m('"[KEYWORD]"', 60, INKP, CRMP)
    return g

def frame_22(g, t):
    M = g['M']; c = g['c']; paper = g['paper']
    if t < 1.6:                                                   # 1: the setup clip inside the magnifier's lens
        im = paper.copy(); (ox, oy, r) = g['lens_big']; mx, my = 540 - ox, 980 - oy           # a big lens centred on the frame
        im.paste(c[0].at(t).convert('RGB'), (0, 0), circle_mask((W, H), (mx + ox, my + oy), r, 2)); put(im, g['mag_big'], (mx, my), 1, 0)
        pop(im, g['really'], t, 0.1, (500, 300), -2); pop(im, g['claim'], t, 0.4, (540, 460), -3)
        return im
    if t < 3.0:                                                   # 2: graphics only: the claim; tubes fill with her patterns
        im = paper.copy(); put(im, M.tubes(g, seg(t, 1.8, 2.6)), (760, 1100), back_out(seg(t, 1.6, 1.9), 1.4), 4)
        pop(im, g['note_claim'], t, 1.8, (300, 700), -6); pop(im, g['test'], t, 2.2, (540, 400), -4)
        if t > 2.7: im = M.slice_wipe(im, c[1].at(0), seg(t, 2.7, 3.0))
        return im
    if t < 7.4:                                                   # 3-4: the uncut test; the words change, nothing cuts the take
        im = c[1].at(t - 3.0); pop(im, g['camera'], t, 3.2, (820, 1180), 8, wiggle=2)
        if t >= 3.4 and int(t * 2) % 2 == 0: put(im, g['rec'], (820, 960), 1, 0)
        if t < 4.8: pop(im, g['oneTake'], t, 3.3, (380, 330), -3)
        elif t < 6.2: pop(im, g['claim_s'], t, 4.8, (420, 330), -3)
        else: pop(im, g['watch'], t, 6.2, (380, 330), -2)
        doodle_on(im, t, 4.0, g['d_dash'], (330, 760), 20, 7.2)
        return im
    if t < 8.6:                                                   # 5: graphics only: did it...? the magnifier glides across
        im = paper.copy(); pop(im, g['did'], t, 7.5, (320, 600), -5); pop(im, g['result'], t, 7.8, (540, 1000), 3)
        put(im, g['mag'], (lerp(W + 700, 640, ease(seg(t, 8.0, 8.5))), 1350), 1, 0)
        return im
    if t < 9.6:                                                   # 6: the lens carries the result and opens
        im = paper.copy(); (ox, oy, r) = g['lens']; grow = ease(seg(t, 8.9, 9.5)); lc = (640 + ox, 1350 + oy)
        im.paste(c[2].at(t - 8.6).convert('RGB'), (0, 0), circle_mask((W, H), lerp2(lc, (540, 960), grow), lerp(r, 1300, grow), 2))
        if grow < 0.5: put(im, g['mag'], (640, 1350), 1, 0, 1 - grow * 2)
        return im
    if t < 11.0:                                                  # 7: the stamp: PASSED (one main action)
        im = c[2].at(t - 8.6); pop(im, g['said'], t, 9.7, (540, 360), -2)
        if t >= 10.12: put(im, g['ink'], (700, 640), 1, -12)
        down = ease(seg(t, 9.95, 10.12)); up = ease(seg(t, 10.25, 10.45))
        if t >= 9.95 and up < 1: put(im, g['stamp'], (700, lerp(-300, 560, down) - 900 * up), 1, -12)
        for i, tk in enumerate(g['d_ticks'][:2]): doodle_on(im, t, 10.5 + i * 0.15, tk, (230 + i * 620, 1250), 0)
        return im
    im = paper.copy(); u = ease(seg(t, 11.0, 11.3))                # 8: CTA on the paper
    cw, ch = int(lerp(W, 560, u)), int(lerp(H, 760, u)); put(im, M.card(c[3].at(t - 11.0), cw, ch, int(18 * u)), lerp2((W / 2, H / 2), (540, 1000), u), 1, 2 * u)
    if t >= 11.3: put(im, g['ink_s'], (700, 700), 1, -14)
    pop(im, M.tubes(g, 1.0), t, 11.3, (190, 1500), -6); pop(im, g['camera_s'], t, 11.4, (880, 1480), 8)
    pop(im, g['comment2'], t, 11.45, (540, 330), -2); pop(im, g['kw2'], t, 11.7, (540, 490), 2)
    return im

SETUP = {'09': setup_09, '10': setup_10, '12': setup_12, '22': setup_22}; FRAME = {'09': frame_09, '10': frame_10, '12': frame_12, '22': frame_22}

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
