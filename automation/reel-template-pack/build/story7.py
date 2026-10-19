"""Round 4 (2026-10-18): #12, #09, #10, #22, #08, #20, #23 rebuilt with the LOCKED type and palette (FRAMEWORK.md:
DM Serif Display built-in words with a thin outline, Manrope highlight boxes, one pill per template; butter, wine,
pink, light blue, one or two per template), the reading time (must-do 14: the whole test plays P.SLOW times longer,
footage at real speed), and every note in round3-notes.md. Stand-in footage (her July clips).
Usage: python build/story7.py 12 [seconds ...]  ->  NN-.../preview/motion-test.mp4  (or a test sheet)
Test-sheet seconds are in the template's own (unslowed) timeline.
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
from story4 import roundwin, card, swipe, diagonal, balloon as balloon4
from collage_kit import doodle, doodle_on, raw
from collage_motion import still, video, tiles
from motion_b2 import Clip, put, render, circle_mask, ease, back_out, seg, lerp, lerp2, W, H, WHITE

pop = P.say; PAL = P.PAL; INK, CRM = (24, 23, 22), (246, 241, 232)
PHONE = 'Graphite Smartphone With Green Screen-38.png'
DIRS = {'12': '12-your-order-just-arrived', '09': '09-who-its-for', '10': '10-three-people-to-gift-it-to', '22': '22-put-it-to-the-test',
        '08': '08-a-real-customer-question', '20': '20-what-buyers-said', '23': '23-every-option-in-10-seconds'}

def bg(name, folder='images', crop=None):
    im = raw(folder, name, crop) if crop else S.raw(folder, name); return ImageOps.fit(im, (W, H), Image.LANCZOS).convert('RGBA')

def letters_on(img, t, t0, word_img_fn, text, px, c, color, step=0.12):
    """A built-in word revealed letter by letter (her note on 'over')."""
    n = min(len(text), max(0, int((t - t0) / step) + 1)) if t >= t0 else 0
    if n <= 0: return
    full = P.story_word(text, px, color); part = P.story_word(text[:n], px, color)
    img.alpha_composite(part, (int(c[0] - full.width / 2), int(c[1] - part.height / 2)))

# ======================================================================================================================
# 12 Your order just arrived (palette: light blue + wine). Notes applied: one big starburst centred BEHIND the doorbell,
# things arrive one at a time (ripple) and slower; the mailbox opens and the clip zooms out of it to full screen; THE /
# WAIT / IS OVER in DM Serif on light sheets, "over" letter by letter; no stray arrow; a fun tag line; ends on the real
# wax seal (a bow image is still to come from her) instead of the doorbell; locked type throughout.
#  1 0.0  diagonal split: the door clip; on concrete the doorbell, a big starburst behind it ripples out; POV, then
#         it's here, then ding dong, one at a time
#  2 2.6  her front-on mailbox (wine, a [your name] label) on concrete: [out for delivery...]; the door drops open on its hinge and the tracking clip zooms out of
#         it to full screen
#  3 4.5  the tracking clip full frame: [delivered!]
#  4 5.6  the order notification drops onto the phone over the door clip (tech)
#  5 7.0  the padded mailer shakes, packing peanuts burst out: [what's inside?] (no video)
#  6 8.4  THE / WAIT / IS OVER on three tissue sheets peeling off the unboxing ("over" letter by letter)
#  7 10.6 the unboxing, full frame
#  8 11.8 in use; a giant kraft tag, a third on screen: [packed with love + a little surprise]
#  9 13.4 CTA: the clip on the mailer, the wax seal pressed on; get yours / comment [KEYWORD]
# ======================================================================================================================
BLUE, WINE = PAL['blue'], PAL['wine']

def setup_12():
    g = {'c': {'door': Clip('IMG_1454', 1.0, 6.0), 'track': Clip('IMG_1385', 1.0, 6.0), 'unbox': Clip('IMG_1456', 1.0, 6.0), 'use': Clip('IMG_1381', 1.0, 6.0), 'cta': Clip('IMG_1454', 3.0, 6.0)}}
    g['concrete'] = bg('Light gray concrete mineral texture-4.png')
    tissue = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))
    g['tissues'] = [ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tissue), tuple(int(v * 0.86) for v in col), col), (W, H)).convert('RGBA') for col in (CRM, BLUE, PAL['butter'])]
    g['bell'] = P.die_cut(S.fitw(S.cut('images', 'Vintage brass doorbell with ivory button-43.png', tol=6), 300), 8)
    g['burst'] = doodle('burst', 1, 640, BLUE)
    g['mbf'] = front_mailbox(840)
    g['notif'] = P.notification('[YOUR SHOP]', '[Delivered]', 560)   # short enough to read in its moment
    pn = P.raw_cut('packing-peanut.png', 130); g['peanut'] = ImageOps.colorize(ImageOps.grayscale(pn.convert('RGB')), (150, 140, 125), (250, 246, 236)).convert('RGBA'); g['peanut'].putalpha(pn.split()[3])
    g['mailer_s'] = P.thing('Sealed kraft padded mailer-39.png', 640, None, None)
    g['mailer'] = P.raw_cut('Sealed kraft padded mailer-39.png', 900)
    g['seal'] = P.die_cut(S.fitw(Image.open(S.E.PACK / 'assets' / 'props' / 'wax-seal-thank-you.png').convert('RGBA'), 280), 6)
    tag = S.cut('images', 'Blank kraft hang tag with twine-116.png', tol=10); tag = tag.resize((int(tag.width * 2300 / tag.height), 2300), Image.LANCZOS)
    d = ImageDraw.Draw(tag); f = P.manrope(64, 600)
    for k, l in enumerate(('[packed with', 'love + a little', 'surprise]')): d.text((int(tag.width * 0.07), int(tag.height * 0.5) + k * 82), l, font=f, fill=INK, anchor='lm')
    g['bigtag'] = P.die_cut(tag, 10)
    g['pov'] = P.pill_m('POV: your [product]\njust arrived', 60); g['here'] = P.caption("it's here", 210, WHITE, edge=WINE)
    g['ding'] = P.pill_once('ding dong!', 64, WINE)
    g['ofd'] = P.pill_m('[out for delivery...]', 78); g['delivered'] = P.pill_m('[delivered!]', 88, BLUE)
    g['inside'] = P.pill_m("[what's inside?]", 80)
    g['get'] = P.caption('get yours', 190, WHITE, edge=WINE); g['kw'] = P.pill_m('comment "[KEYWORD]"', 72, WINE)
    return g

def frame_12(g, t):
    c = g['c']
    if t < 2.6:                                                   # 1: the doorbell; a big burst behind it ripples out; one thing at a time
        im = g['concrete'].copy(); v = c['door'].at(t); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W, 0), (W, 1000), (0, 1450)], fill=255); im.paste(v, (0, 0), m)
        ImageDraw.Draw(im).line([(0, 1450), (W, 1000)], fill=WHITE + (255,), width=12)
        if t >= 1.1: put(im, g['burst'], (790, 1560), 0.85 + 0.15 * back_out(seg(t, 1.1, 1.5), 1.6) + 0.04 * math.sin((t - 1.1) * 6))
        press = 1 - 0.1 * math.sin(math.pi * seg(t, 1.1, 1.3)); put(im, g['bell'], (790, 1560), back_out(seg(t, 0.8, 1.1)) * press)
        pop(im, g['pov'], t, 0.0, (430, 300), -2); pop(im, g['here'], t, 0.45, (540, 500)); pop(im, g['ding'], t, 1.5, (300, 1440), -6)   # clear of IG's caption
        if t > 2.3: im = diagonal(im, stage_mail(g, t), seg(t, 2.3, 2.6))
        return im
    if t < 5.6: return stage_mail(g, t)
    if t < 7.0:                                                   # 4: the notification on the phone (tech)
        im = g['concrete'].copy(); ph_w = 760; sw, sh = P.screen_size(PHONE, ph_w)
        scr = c['door'].at(t - 5.6, (sw, sh)).copy(); n = S.fitw(g['notif'], int(sw * 0.94)); ny = lerp(-n.height, 40, back_out(seg(t, 6.0, 6.3), 1.4))
        scr.alpha_composite(n, (int((sw - n.width) / 2), int(ny))); put(im, P.on_screen(PHONE, ph_w, scr), (540, lerp(2400, 1000, ease(seg(t, 5.6, 5.9)))), 1, -3)
        return im
    if t < 8.4:                                                   # 5: the mailer shakes, peanuts burst out (no video)
        im = g['concrete'].copy(); sh_ = 8 * math.sin(t * 50) * (1 - seg(t, 7.4, 7.6)); put(im, g['mailer_s'], (540 + sh_, 1100), back_out(seg(t, 7.0, 7.25), 1.5), sh_)
        for i in range(12):
            a = -math.pi / 2 + (i - 5.5) * 0.22; s = seg(t, 7.45 + (i % 4) * 0.03, 8.2); r = 900 * ease(s)
            if s > 0: put(im, g['peanut'], (540 + r * math.cos(a), 1000 + r * math.sin(a) + 900 * s * s), 1, i * 40 + 300 * s)
        pop(im, g['inside'], t, 7.15, (540, 420), -3)
        return im
    if t < 12.4:                                                  # 6: THE / WAIT / IS OVER, one per sheet, each held to read
        im = c['unbox'].at(t - 8.4)
        for i in (2, 1, 0):
            t0 = (9.3, 10.2, 12.0)[i]; u = ease(seg(t, t0, t0 + 0.3))
            if u >= 1: continue
            sh = g['tissues'][i].copy()
            if i < 2: put(sh, P.story_word(('the', 'wait')[i], 230, WINE, edge=WHITE), (540, 960))
            else: letters_on(sh, t, 10.4, None, 'is over', 230, (540, 960), WINE, step=0.09)
            if u <= 0: im.alpha_composite(sh)
            else: put(im, C.shadow(sh, (16, 24), 18, 120), (540 + (1 if i % 2 == 0 else -1) * 1100 * u, 960 + 1400 * u * u), 1, (1 if i % 2 == 0 else -1) * 25 * u)
        return im
    if t < 13.2: return c['unbox'].at(t - 8.4)                    # 7: the unboxing, full frame, after the last sheet peels
    if t < 15.6:                                                  # 8: in use; the giant tag, a third on screen
        im = c['use'].at(t - 13.2); put(im, g['bigtag'], (lerp(W + 700, W - 110, back_out(seg(t, 13.3, 13.7), 1.3)), 980), 1, 8); return im   # words clear of IG's buttons
    im = g['concrete'].copy()                                     # 9: CTA on the mailer; the wax seal pressed on
    m = g['mailer'].copy(); v = c['cta'].at(t - 15.6, (int(m.width * 0.7), int(m.height * 0.6))); m.alpha_composite(v, (int(m.width * 0.15), int(m.height * 0.22)))
    pop(im, P.die_cut(m, 10), t, 15.6, (540, 1080), -3)
    if t >= 16.0: put(im, g['seal'], (860, 1430), 1 + 0.5 * (1 - back_out(seg(t, 16.0, 16.2), 1.2)))
    pop(im, g['get'], t, 15.8, (540, 330)); pop(im, g['kw'], t, 16.2, (540, 530), 2)
    return im

MBF = 'Pristine cherry-red mailbox, front-facing (1).png'      # her front-facing mailbox (2026-10-18)
MB_DOOR = (178, 300, 847, 1222); MB_ARCH = (182, 330, 843, 1212)  # door (with its latch) and the opening, at full size

def front_mailbox(w, label=True):
    """Her front-on mailbox, cut from white, the red recoloured to wine (the latch stays metal); door and body apart."""
    im = Image.open(S.E.PACK / 'assets' / 'props' / 'source' / 'images' / MBF).convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g_, b_, a = px[x, y]
            if min(r, g_, b_) > 238: px[x, y] = (255, 255, 255, 0)
            elif r > g_ + 60 and r > b_ + 60:                     # the red paint -> wine, keeping its shading
                l = (r + g_ + b_) / 3 / 110; px[x, y] = (min(255, int(WINE[0] * l * 1.25)), min(255, int(WINE[1] * l * 1.25)), min(255, int(WINE[2] * l * 1.25)), a)
    k = w / im.width; im = im.resize((w, int(im.height * k)), Image.LANCZOS)
    door = im.crop(tuple(int(v * k) for v in MB_DOOR)); arch = tuple(int(v * k) for v in MB_ARCH)
    lab = P.pill_m('[your name]', 54, BLUE, rot=0)
    if label: door.alpha_composite(lab, (int(door.width / 2 - lab.width / 2), int(door.height * 0.55)))   # play: her name label on the door
    return im, door, arch, k

def arch_mask(size, r):
    m = Image.new('L', size, 0); d = ImageDraw.Draw(m); w_, h_ = size; r = int(min(r, w_ / 2))
    d.rectangle((0, r, w_, h_), fill=255); d.pieslice((0, 0, w_ - 1, 2 * r), 180, 360, fill=255) if r > 0 else None
    if r > 0: d.rectangle((0, r, w_, h_), fill=255)
    return m

def stage_mail(g, t):
    """2-3: her front-on mailbox: the door drops open on its hinge, the tracking clip zooms out of the opening to full
    screen; then [delivered!] on the clip."""
    c = g['c']; im = g['concrete'].copy(); body, door, arch, k = g['mbf']; mc = (540, 1180)
    ox, oy = mc[0] - body.width / 2, mc[1] - body.height / 2
    z = ease(seg(t, 3.9, 4.5))
    if z < 1:
        mb = body.copy(); aw, ah = arch[2] - arch[0], arch[3] - arch[1]
        inside = Image.new('RGBA', (aw, ah), (30, 12, 16, 255)); v = c['track'].at(t - 3.5, (aw, ah))
        inside = Image.blend(inside, v, ease(seg(t, 3.6, 3.9))); inside.putalpha(arch_mask((aw, ah), aw / 2)); mb.alpha_composite(inside, arch[:2])
        f = math.cos(math.pi / 2 * ease(seg(t, 3.4, 3.75)))      # the door swings down on its bottom hinge
        dx0, dy0, dx1, dy1 = [int(v_ * k) for v_ in MB_DOOR]
        if f > 0.02:
            dh = max(1, int(door.height * f)); d_ = door.resize((door.width, dh)); d_ = ImageEnhance.Brightness(d_).enhance(0.6 + 0.4 * f) if f < 1 else d_
            mb.alpha_composite(d_, (dx0, dy1 - dh))
        else:                                                     # the open door seen edge-on below the opening
            lip = door.resize((door.width, max(4, int(door.height * 0.05)))); mb.alpha_composite(lip, (dx0, dy1))
        put(im, mb, mc, back_out(seg(t, 2.6, 2.9), 1.4))
    if z > 0:                                                     # the clip zooms out of the opening to full screen
        x0, y0 = ox + arch[0], oy + arch[1]; aw, ah = arch[2] - arch[0], arch[3] - arch[1]
        bx0, by0 = lerp(x0, (W - H * aw / ah) / 2, z), lerp(y0, 0, z); bw, bh = int(lerp(aw, H * aw / ah, z)), int(lerp(ah, H, z))   # same shape all the way (CapCut)
        v = c['track'].at(t - 3.5, (bw, bh)); v.putalpha(arch_mask((bw, bh), lerp(aw / 2, 0, z))); im.alpha_composite(v, (int(bx0), int(by0)))
    if t < 4.2: pop(im, g['ofd'], t, 2.7, (540, 330), -2)
    pop(im, g['delivered'], t, 4.6, (540, 330), -3)
    return im

SETUP = {'12': setup_12}; FRAME = {'12': frame_12}; SECS = {'12': 17.8}

# ======================================================================================================================
# 09 Who it's for (palette: pink + wine). Notes applied: the butterfly lands clear of every word; the starburst sits
# BEHIND the clock in a contrasting colour, only one; no burst over the product; her Reel plays on a phone at the
# bottom of the frame with the butterfly perched on it; readable type (locked); slower.
#  1 0.0  her; a butterfly lands on her head; "if you [always run late]" top left, clear of it
#  2 1.6  THIS IS FOR YOU low, underlined once; motion-blur swipe to the notebook stage
#  3 2.8  stage, no video: the pink-striped alarm clock rings, one wine burst behind it, crumpled notes circle; [late. again.]
#  4 4.4  stage: the problem in B&W in a torn window; [you lose your keys. again.]
#  5 5.8  swap in place: the window turns to colour, the product; MEET [PRODUCT NAME]
#  6 7.2  the product floats up on a string with a gift; an arrow from MEET to it
#  7 8.8  stage, no video: sticky notes pinned one at a time: for the [6am crowd] / [dog mums] / [busy mums]
#  8 10.6 her; her Reel on a phone at the bottom, the butterfly perched on top of the phone (tech)
#  9 12.2 butterflies gather in a circle into a crown; sound like you? / Comment / [KEYWORD]
# ======================================================================================================================
PINK = PAL['pink']

def setup_09():
    g = {'c': {'me': Clip('IMG_1469', 1.0, 6.0), 'me2': Clip('IMG_1470', 1.0, 6.0), 'problem': Clip('IMG_1430', 1.0, 6.0), 'product': Clip('IMG_1381', 1.0, 6.0)}}
    g['paper'] = bg('Blank Ruled Notebook Paper.png', 'physical')
    g['bf'] = [P.thing(P.BUTTERFLIES[i % 3], 220, ('stripes', 'dots', 'smalldots')[i % 3], (WINE, PINK, WINE)[i % 3], scale=0.3, strength=0.75, seed=i, edge=6) for i in range(6)]
    g['clock'] = P.thing('Classic Cream Twin-Bell Alarm Clock-185.png', 440, 'stripes', PINK, scale=0.5, strength=0.85)
    g['burst'] = doodle('burst', 3, 780, WINE)   # ONE rounded burst, centred behind the clock (her note)
    g['balls'] = [P.thing('Crumpled cream paper ball-58.png', 170 + 20 * (i % 3), ('stripes', 'dots', 'smalldots')[i % 3], (PINK, WINE, PINK)[i % 3], scale=0.3, strength=0.6, seed=i, edge=6) for i in range(5)]
    g['gift'] = P.thing('Kraft paper cube gift with twine-38.png', 260, 'dots', WINE, scale=0.4)
    g['mug'] = P.thing('Warm white ceramic coffee mug-140.png', 260, 'dots', PINK, scale=0.4, strength=0.85)
    g['notes'] = [P.sticky(t_, 400, pin=pn) for t_, pn in (('for the\n[6am crowd]', 'pin-head-black'), ('for the\n[dog mums]', 'pin-head-cream'), ('for the\n[busy mums]', 'pin-head-white'))]
    g['habit'] = P.pill_m('if you\n[always run late]', 70); g['this'] = P.caption('this is for you', 118, WHITE, edge=WINE)
    g['late'] = P.pill_m('[late. again.]', 80); g['problem'] = P.pill_m('[you lose your\nkeys. again.]', 72)
    g['meet'] = P.caption('meet', 200, PINK, edge=WINE); g['prod'] = P.pill_m('[PRODUCT NAME]', 76, WINE)
    g['sound'] = P.pill_m('sound like you?', 72); g['comment'] = P.caption('Comment', 200, WHITE, edge=WINE); g['kw'] = P.pill_once('"[KEYWORD]"', 76, WINE)
    g['d_arrow'] = doodle('arrow', 9, 230, WINE); g['d_under'] = doodle('under', 0, 600, WINE)
    return g

def stage_09(g, t):
    c = g['c']; im = g['paper'].copy()
    if t < 5.4:                                                   # 3: the clock rings, one burst behind it
        s = 6 * math.sin(t * 55) * (1 - seg(t, 4.4, 4.7)); k = back_out(seg(t, 3.6, 3.9), 1.6)
        if t >= 3.8: put(im, g['burst'], (540, 1000), 0.9 + 0.1 * back_out(seg(t, 3.8, 4.1), 1.5), 0)
        put(im, g['clock'], (540 + s, 1000), k, s)
        for i, b in enumerate(g['balls']):
            a = t * 1.1 + i * 2 * math.pi / 5; put(im, b, (540 + 400 * math.cos(a), 1000 + 480 * math.sin(a)), back_out(seg(t, 4.0 + i * 0.08, 4.25 + i * 0.08)), a * 30)
        pop(im, g['late'], t, 3.8, (540, 350), -3)
        return im
    sw = ease(seg(t, 7.2, 7.5)); v = c['problem'].at(t - 5.4, (780, 900))     # 4-5: the torn window, B&W then colour
    v = ImageOps.grayscale(v).convert('RGBA') if sw < 0.5 else c['product'].at(t - 7.2, (780, 900))
    k = back_out(seg(t, 5.4, 5.7), 1.6) * (1 - 0.12 * math.sin(math.pi * sw)); v.putalpha(C.torn_mask((780, 900), 5, 18, 'tblr'))
    put(im, C.shadow(v, (10, 16), 14, 110), (540, 1020), k, -2)
    if t < 7.2: pop(im, g['problem'], t, 5.6, (540, 380), -2)
    else: pop(im, g['meet'], t, 7.4, (540, 340)); pop(im, g['prod'], t, 7.7, (540, 520), -2)
    return im

def frame_09(g, t):
    """Round 4 timing (must-do 14): every line held to read; meet [PRODUCT NAME] stays up from scene 5 into 6."""
    c = g['c']; cx, cy, rx, ry = P.HEAD; top = (cx, cy - ry - 90)
    if t < 3.6:                                                   # 1-2: her; the butterfly lands clear of the words
        im = c['me'].at(t)
        u = ease(seg(t, 0.2, 1.3)); path = (lerp(-150, top[0] + 30, u), lerp(1100, top[1] - 40, u) - 260 * math.sin(math.pi * u))
        P.butterfly(im, g['bf'][0], t, path, -20 + 20 * u, flap=1 - 0.7 * seg(t, 1.3, 1.6))
        pop(im, g['habit'], t, 0.0, (280, 330), -3, out=1.7)
        pop(im, g['this'], t, 1.6, (540, 1330)); doodle_on(im, t, 2.1, g['d_under'], (540, 1450), -2)
        if t > 3.3: im = swipe(im, stage_09(g, t), seg(t, 3.3, 3.6))
        return im
    if t < 8.8: return stage_09(g, t)
    if t < 10.4:                                                  # 6: the product floats up; meet [PRODUCT NAME] already up
        im = g['paper'].copy()
        P.balloon(im, roundwin(c['product'].at(t - 8.8, (520, 520)), 520), t, (560, 860), (560, 1900), 0, rise=(8.8, 9.3, 2400))
        P.balloon(im, g['gift'], t, (880, 1250), (580, 1900), 1.7, rise=(9.0, 9.5, 2400))
        put(im, sum_word(g['meet']), (540, 340)); put(im, g['prod'], (540, 520), 1, -2); doodle_on(im, t, 9.5, g['d_arrow'], (150, 900), 90)   # points right, at the product (her note)
        return im
    if t < 13.0:                                                  # 7: sticky notes, one at a time (no video)
        im = g['paper'].copy(); pop(im, g['mug'], t, 10.4, (820, 1560), 6, wiggle=2)
        for i, (xy, r) in enumerate((((310, 640), -6), ((760, 900), 5), ((330, 1240), -3))): pop(im, g['notes'][i], t, 10.6 + i * 0.4, xy, r)
        if t > 12.7: im = swipe(im, c['me'].at(t - 13.0 + 3.0), seg(t, 12.7, 13.0), -1)
        return im
    if t < 14.6:                                                  # 8: her Reel on a phone at the bottom, the butterfly perched on it
        im = c['me'].at(t - 13.0 + 3.0); k = back_out(seg(t, 13.1, 13.5), 1.4)
        ph = P.on_screen(PHONE, 360, c['product'].at(t - 13.0)); pc = (800, lerp(2300, 1520, k)); put(im, ph, pc, 1, -6)
        perch = (pc[0] - 30, pc[1] - ph.height / 2 - 40); u = ease(seg(t, 13.6, 14.2))
        P.butterfly(im, g['bf'][0], t, lerp2((top[0] + 30, top[1] - 40), perch, u), 0, flap=0.3 + 0.7 * math.sin(math.pi * u))
        return im
    im = c['me2'].at(t - 14.6)                                    # 9: the crown; CTA
    for i, (pt, bf) in enumerate(zip(P.crown_points(6, 170), g['bf'])):
        a0 = i * math.pi / 3 + t * 2; orbit = (540 + 430 * math.cos(a0), 800 + 430 * math.sin(a0))
        u = ease(seg(t, 14.7 + i * 0.08, 15.5 + i * 0.08)); P.butterfly(im, bf, t, lerp2(orbit, pt, u), (i - 2.5) * 10, flap=1 - 0.6 * u, phase=i)
    pop(im, g['sound'], t, 15.4, (540, 1030), -2); pop(im, g['comment'], t, 15.7, (540, 1200)); pop(im, g['kw'], t, 16.1, (540, 1360), 2)   # clear of IG's caption
    return im

def sum_word(ws):
    """A caption() word list flattened into one image (for words that are already up, no entry animation)."""
    h = max(w.height for w, _ in ws); x0 = min(dx - w.width / 2 for w, dx in ws); x1 = max(dx + w.width / 2 for w, dx in ws)
    out = Image.new('RGBA', (int(x1 - x0) + 2, h), (0, 0, 0, 0))
    for w, dx in ws: out.alpha_composite(w, (int(dx - w.width / 2 - x0), (h - w.height) // 2))
    return out

SETUP['09'] = setup_09; FRAME['09'] = frame_09; SECS['09'] = 17.4

# ======================================================================================================================
# 10 Three people to gift it to (palette: butter + wine). Notes applied: opens on the buyer's clip with the ? gift
# swinging in (rich, moving, not plain white); three sensible "usual" gifts (candle, mug, scarf) crossed out with a
# beat of breathing room after; a plain phone lying on a real wooden table, its screen a 1:1 video slot of the buyer
# scrolling their own shop (no hand, no prices); a gallery wall of three pinned Polaroids (Victorian frames and
# silhouettes on request); "works for all 3" held to read; CTA kept (balloons) without tags, solid DM Serif, neutral.
#  1 0.0  her gift clip; the ? gift swings in on twine; "stuck on a" gift?; one underline
#  2 2.2  swipe to the kraft stage (no video), the ? gift carried in: the usual? candle, mug, scarf; each crossed out
#  3 5.4  the gifts fly off; the phone lies on the wooden table, the shop scroll stops on the product; [found it.]
#  4 8.0  the screen grows into the product clip, full frame; [this one works for] all 3
#  5 10.4 swipe to the gallery wall (no video): 3 people; three Polaroids pinned one at a time, a name under each
#  6 13.4 swipe to butter tissue: the Polaroids float up as balloons (pins gone, no tags)
#  7 14.6 CTA: the FOR YOU gift holds the strings; Comment / "[KEYWORD]" (the one pill) / [gift wrap available]
# ======================================================================================================================
BUTTER = PAL['butter']

def dsticker(text, px, fill, ink):
    """A round sticker with a DM Serif word (the locked type) to stick ON an object."""
    f = ImageFont.truetype(P.DMS, px); l, t_, r, b = f.getbbox(text); d_ = int(max(r - l, b - t_) + px * 0.8)
    im = Image.new('RGBA', (d_, d_), (0, 0, 0, 0)); dr = ImageDraw.Draw(im); dr.ellipse((0, 0, d_ - 1, d_ - 1), fill=fill + (255,))
    dr.text((d_ / 2, d_ / 2), text, font=f, fill=ink, anchor='mm'); return P.die_cut(im, 6, False)

def shop_grid(w, rows=6):
    """Stand-in for the buyer's own screen recording of their shop: a two-column grid of product photos, no prices."""
    gap = int(w * 0.03); tw = (w - 3 * gap) // 2; top = int(w * 0.24)
    im = Image.new('RGBA', (w, top + rows * (tw + gap) + w), (250, 249, 246, 255)); d = ImageDraw.Draw(im)
    d.rectangle((0, 0, w, top), fill=(255, 255, 255)); d.text((w / 2, top / 2 + 8), '[YOUR SHOP]', font=P.manrope(int(w * 0.075), 650), fill=INK, anchor='mm')
    shots = [S.footage(cl) for cl in (('IMG_1417', 0.5), ('IMG_1391', 1.0), ('IMG_1460', 2.0), ('IMG_1381', 1.0), ('IMG_1456', 1.0), ('IMG_1388', 0.5))]
    for k in range(rows * 2):
        x, y = gap + (k % 2) * (tw + gap), top + gap + (k // 2) * (tw + gap); p = ImageOps.fit(shots[(k * 5) % len(shots)].convert('RGBA'), (tw, tw))
        m = Image.new('L', (tw, tw), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, tw - 1, tw - 1), 22, fill=255); im.paste(p, (x, y), m)
    return im, top, tw + gap

def polaroid(clip_im, w, frame):
    """A Polaroid with the clip in its photo window (the window is the dark area of the blank Polaroid)."""
    pf = S.fitw(frame, w); bb = g_win(pf); pw, ph = bb[2] - bb[0], bb[3] - bb[1]; out = pf.copy()
    out.alpha_composite(ImageOps.fit(clip_im.convert('RGBA'), (pw, ph)), bb[:2]); return out

def g_win(pf):
    L_ = pf.convert('L').point(lambda v: 255 if v < 90 else 0); a = pf.split()[3].point(lambda v: 255 if v > 200 else 0)
    return ImageChops.multiply(L_, a).getbbox()

def setup_10():
    g = {'c': {'gift': Clip('IMG_1454', 1.0, 6.0), 'prod': Clip('IMG_1456', 1.0, 6.0), 'p1': Clip('IMG_1469', 1.0, 6.0), 'p2': Clip('IMG_1470', 1.0, 6.0), 'p3': Clip('IMG_1469', 4.0, 6.0)}}
    g['kraft'] = bg('Partly unrolled kraft paper roll-14.png', crop=(0.5, 0.56, 0.74, 0.7)); g['oak'] = bg('Light oak wood grain texture-2.png')
    g['wall'] = bg('Vintage Burgundy and Blush Stripes.png')
    tissue = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))
    g['butter'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tissue), tuple(int(v * 0.88) for v in BUTTER), BUTTER), (W, H)).convert('RGBA')
    g['box'] = P.thing('Kraft paper cube gift with twine-38.png', 380, 'dots', BUTTER, scale=0.4, strength=0.9, label=dsticker('?', 90, WINE, WHITE))
    g['box2'] = P.thing('Kraft paper cube gift with twine-38.png', 400, 'dots', WINE, scale=0.4, strength=0.8, label=P.pill_m('FOR YOU', 48, WHITE, rot=0))
    g['usual'] = [P.thing('Glowing Ivory Candle in Glass Jar-96.png', 300, 'smalldots', WINE, scale=0.35, strength=0.35),
                  P.thing('Warm white ceramic coffee mug-140.png', 340, 'dots', WINE, scale=0.4, strength=0.8),
                  P.thing('Rolled chunky knit oatmeal scarf-94.png', 440, 'smalldots', WINE, scale=0.35, strength=0.7)]
    g['x'] = [doodle('tick', 3 + i, 300, WINE) for i in range(3)]
    frame = P.raw_cut('Blank Polaroid on White Background.png', 420); g['frame'] = frame
    sw, sh = P.screen_size(PHONE, 640); g['scr'] = (sw, sh); g['grid'] = shop_grid(sw)
    g['stuck'] = P.pill_m('stuck on a', 76); g['giftw'] = P.story_word('gift?', 250, BUTTER, italic=True)
    g['usualw'] = P.caption('the usual?', 190, WHITE, edge=WINE); g['found'] = P.pill_m('[found it.]', 84)
    g['works'] = P.pill_m('this one works for', 78); g['all3'] = P.story_word('all 3', 260, BUTTER, italic=True)
    g['three'] = P.caption('3 people', 200, WHITE, edge=WINE)
    g['names'] = [P.pill_m(n, 64, BUTTER) for n in ('[your friend]', '[your mum]', '[your dad]')]
    g['comment'] = P.caption('Comment', 210, WINE, edge=WHITE, italic_last=False); g['kw'] = P.pill_once('"[KEYWORD]"', 78, WINE)
    g['wrap'] = P.pill_m('[gift wrap available]', 66)
    g['d_under'] = doodle('under', 0, 560, WINE); g['d_arrow'] = doodle('arrow', 9, 240, WINE)
    return g

POL = (((270, 700), -6), ((790, 860), 5), ((360, 1400), -3))       # the gallery wall: Polaroid centres and tilts
NAME_AT = ((270, 1000), (790, 1160), (700, 1440))                  # the third name sits beside its Polaroid (clear of IG's caption)
TWINE = (176, 146, 104)

def swing_box(g, im, t):
    """1: the ? gift swings in on twine from the top and settles."""
    pv = (760, -40); L_ = lerp(300, 820, back_out(seg(t, 0.15, 0.7), 1.3)); a = math.radians(26 * math.sin(t * 3.2) * math.exp(-0.9 * t))
    c = (pv[0] + L_ * math.sin(a), pv[1] + L_ * math.cos(a)); top = (c[0] - 0.42 * g['box'].height * math.sin(a), c[1] - 0.42 * g['box'].height * math.cos(a))
    ImageDraw.Draw(im).line([pv, top], fill=TWINE + (255,), width=6); put(im, g['box'], c, 1, math.degrees(a))

def stage_10(g, t):
    """2: the kraft stage, the ? gift carried in; the usual gifts crossed out, then a beat to breathe."""
    im = g['kraft'].copy(); put(im, g['box'], (860, 1660), 0.7, 8)
    fly = ease(seg(t, 5.4, 5.8))
    for i, (obj, xy, r) in enumerate(zip(g['usual'], ((300, 800), (790, 1000), (360, 1400)), (-6, 5, -4))):
        pos = (xy[0] + (1 if i % 2 else -1) * 1300 * fly, xy[1] - 300 * fly)
        if t >= 2.6 + i * 0.2: put(im, obj, pos, back_out(seg(t, 2.6 + i * 0.2, 2.9 + i * 0.2), 1.6), r + 40 * fly)
        if fly < 1: doodle_on(im, t, 3.4 + i * 0.45, g['x'][i], pos, r)
    if fly < 1: pop(im, g['usualw'], t, 2.3, (540, 360), -2)
    return im

def phone_10(g, t, u=0.0):
    """3: the phone lies on the wooden table; its screen is a 1:1 video slot (stand-in: a shop scroll stopping on the product)."""
    sw, sh = g['scr']; gim, top, row = g['grid']; e = 1 - (1 - seg(t, 5.9, 6.9)) ** 3
    y = int(e * (top + 3 * row - sh * 0.3)); scr = gim.crop((0, y, sw, y + sh))
    if u > 0: scr = Image.blend(scr.convert('RGB'), g['c']['prod'].at(t - 8.0, (sw, sh)).convert('RGB'), min(1, u * 3)).convert('RGBA')
    return P.on_screen(PHONE, 640, scr)

def frame_10(g, t):
    c = g['c']
    if t < 2.2:                                                   # 1: her gift clip; the ? gift swings in
        im = c['gift'].at(t); swing_box(g, im, t)
        pop(im, g['stuck'], t, 0.1, (330, 300), -3); pop(im, g['giftw'], t, 0.4, (330, 480), -3); doodle_on(im, t, 0.9, g['d_under'], (330, 640), -2)
        if t > 1.9: im = swipe(im, stage_10(g, t), seg(t, 1.9, 2.2))
        return im
    if t < 5.4: return stage_10(g, t)
    if t < 8.0:                                                   # 3: the gifts fly off; the phone on the table
        k = ease(seg(t, 5.4, 5.8)); im = g['oak'].copy(); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle((0, int(H * (1 - k)), W, H), fill=255)
        im = Image.composite(im, stage_10(g, t), m) if k < 1 else im
        put(im, phone_10(g, t), (560, lerp(2500, 1060, back_out(seg(t, 5.5, 5.9), 1.2))), 1, -4)
        pop(im, g['found'], t, 6.9, (290, 330), -3); doodle_on(im, t, 7.0, g['d_arrow'], (230, 560), 150)
        return im
    if t < 10.4:                                                  # 4: the screen grows into the product clip
        u = ease(seg(t, 8.0, 8.5))
        if u < 1:
            im = g['oak'].copy(); ph = phone_10(g, t, u); put(im, ph, (lerp(560, 540, u), lerp(1060, 960, u)), lerp(1, 3.4, u), lerp(-4, 0, u))
        else: im = c['prod'].at(t - 8.0)
        pop(im, g['works'], t, 8.6, (540, 1260), -2); pop(im, g['all3'], t, 8.8, (540, 1450), -2)
        if t > 10.1: im = swipe(im, wall_10(g, t), seg(t, 10.1, 10.4))
        return im
    if t < 13.4:
        im = wall_10(g, t)
        if t > 13.1: im = swipe(im, cta_10(g, t), seg(t, 13.1, 13.4))
        return im
    return cta_10(g, t)

def wall_10(g, t):
    """5: the gallery wall: three Polaroids pinned one at a time, a name under each (no video behind)."""
    im = g['wall'].copy(); c = g['c']; pop(im, g['three'], t, 10.5, (540, 330), -2)
    for i, ((xy, r), cl) in enumerate(zip(POL, (c['p1'], c['p2'], c['p3']))):
        t0 = 10.9 + i * 0.5
        if t < t0: continue
        pol = P.pinned(polaroid(cl.at(t - 10.4, (360, 360)), 400, g['frame']), r, ('pin-head-cream', 'pin-head-black', 'pin-head-white')[i])
        put(im, pol, (xy[0], lerp(xy[1] - 120, xy[1], back_out(seg(t, t0, t0 + 0.3), 1.5))), 1)
        pop(im, g['names'][i], t, t0 + 0.2, NAME_AT[i], (-3, 2, -2)[i])
    return im

def cta_10(g, t):
    """6-7: butter tissue; the Polaroids float up as balloons (no tags); the FOR YOU gift holds the strings; the CTA."""
    im = g['butter'].copy(); c = g['c']; up = ease(seg(t, 14.4, 15.0)); anchor = (540, lerp(2100, 1500, ease(seg(t, 14.4, 14.8))))
    for i, (cl, xy0, xy1) in enumerate(((c['p1'], (300, 600), (220, 420)), (c['p2'], (780, 820), (540, 330)), (c['p3'], (330, 1120), (860, 420)))):
        xy = lerp2(xy0, xy1, up); pol = polaroid(cl.at(t - 10.4, (330, 330)), int(lerp(360, 300, up)), g['frame'])
        balloon4(im, pol, t, xy, (anchor[0] + (i - 1) * 40, anchor[1] - 120), i * 1.7, rise=(13.4 + i * 0.25, 14.0 + i * 0.25, 2400))   # thick ink strings (her note)
    if t >= 14.4:
        pop(im, g['box2'], t, 14.4, (540, 1500), 0, wiggle=2)
        pop(im, g['comment'], t, 14.7, (540, 880)); pop(im, g['kw'], t, 15.0, (540, 1060), 2); pop(im, g['wrap'], t, 15.2, (540, 1200), -2)
    return im

SETUP['10'] = setup_10; FRAME['10'] = frame_10; SECS['10'] = 17.0


# ======================================================================================================================
# 22 Put it to the test (palette: light blue + butter; ink for the stamp). Notes applied: a scroll-stopping first frame
# (the test already happening, full frame, a dare as the hook); no floating camera; no brick/red checkerboard; no ticks;
# slower; the magnifier lens, the stamp and the two-tone strip slice kept (22 is already counted in the slice's 4 of 5).
#  1 0.0  the test clip mid-action, full frame, punching in: [I tried to] ruin it (one underline)
#  2 2.2  swipe to graph paper: the setup clip inside the big magnifier's lens; [does it really] [STAY DRY]?
#  3 4.6  graph paper, no video: the tubes fill with her patterns; a sticky note "claim: [stays dry]"; let's test it
#  4 6.6  two-tone strip slice (blue / butter) into the test: ONE uncut take, a REC corner; [one take, no cuts] /
#         [watch closely]
#  5 10.8 graph paper, no video: "did it...?" note; the result; the magnifier glides in (carried)
#  6 12.4 the lens carries the result and opens to full frame
#  7 13.4 the result; the stamp comes down: PASSED (the one main action); [IT STAYED DRY]
#  8 15.6 CTA on the paper: the clip as a card, the kit round it (no camera); Comment / "[KEYWORD]"
# ======================================================================================================================
DEEP = (52, 86, 140)                                              # stamp ink: a deep shade of the light blue

def setup_22():
    import motion_22 as M
    M.RED, M.NAVY = DEEP, INK; g = M.setup(); g['M'] = M; g['mag_big'], g['lens_big'] = M.magnifier(2000)
    paper = ImageOps.fit(S.raw('images', 'Creased pale blue graph paper-7.png'), (W, H)).convert('RGBA')   # graph paper + a torn butter band
    tissue = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))
    band = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tissue), tuple(int(v * 0.88) for v in BUTTER), BUTTER), (W + 72, 460)).convert('RGBA')
    band.putalpha(C.torn_mask((W + 72, 460), 7, 22, 't')); paper.alpha_composite(C.shadow(band, (0, -6), 10, 80), (-72, H - 460 - 36)); g['paper'] = paper
    g['tried'] = P.pill_m('I tried to', 80); g['ruin'] = P.caption('[ruin] it', 230, DEEP, edge=WHITE, italic_last=False)
    g['really'] = P.pill_m('does it really', 76); g['claim'] = P.story_word('[STAY DRY]?', 170, DEEP, edge=WHITE)
    g['note_claim'] = P.sticky('claim:\n[stays dry]', 440); g['test'] = P.caption("let's test it", 170, DEEP, edge=WHITE)
    g['oneTake'] = P.pill_m('[one take, no cuts]', 76); g['watch'] = P.pill_m('watch closely', 80, PAL['blue'])
    g['did'] = P.sticky('did it...?', 400, pin='pin-head-cream'); g['result'] = P.caption('the result', 190, DEEP, edge=WHITE)
    g['said'] = P.pill_m('[IT STAYED DRY]', 84, BUTTER); g['ink'] = M.passed_ink(150); g['ink_s'] = M.passed_ink(70)
    g['comment'] = P.caption('Comment', 210, DEEP, edge=WHITE, italic_last=False); g['kw'] = P.pill_once('"[KEYWORD]"', 78, PAL['blue'])
    g['d_under'] = doodle('under', 0, 600, DEEP); g['d_arrow'] = doodle('arrow', 9, 230, INK); g['d_burst'] = doodle('burst', 1, 600, BUTTER)
    f = P.manrope(46, 700); rec = Image.new('RGBA', (230, 80), (0, 0, 0, 0)); d = ImageDraw.Draw(rec)
    d.rounded_rectangle((0, 0, 229, 79), 18, fill=(20, 20, 22, 170)); d.ellipse((22, 24, 54, 56), fill=(225, 60, 60)); d.text((140, 40), 'REC', font=f, fill=WHITE, anchor='mm'); g['rec'] = rec
    return g

def slice_22(old, new, u, n=8):
    """The two-tone strip slice in this template's palette (light blue / butter)."""
    out = new.copy(); sh = H / n
    for i in range(n):
        y0, y1 = int(i * sh), int((i + 1) * sh); strip = old.crop((0, y0, W, y1))
        strip = Image.blend(strip, Image.new('RGBA', strip.size, (PAL['blue'] if i % 2 == 0 else BUTTER) + (255,)), 0.45 + 0.3 * u)
        out.alpha_composite(strip, (int((1 if i % 2 == 0 else -1) * ease(u) * (W + 80)), y0))
    return out

def frame_22(g, t):
    M = g['M']; c = g['c']; paper = g['paper']
    if t < 2.2:                                                   # 1: the test, mid-action, punching in; the dare
        v = c[1].at(t + 2.0); z = lerp(1.12, 1.0, ease(seg(t, 0, 0.6))); im = ImageOps.fit(v, (int(W * z), int(H * z))).crop((int((W * z - W) / 2), int((H * z - H) / 2), int((W * z - W) / 2) + W, int((H * z - H) / 2) + H))
        pop(im, g['tried'], t, 0.1, (340, 320), -3); pop(im, g['ruin'], t, 0.35, (540, 500)); doodle_on(im, t, 0.8, g['d_under'], (540, 650), -2)
        if t > 1.9: im = swipe(im, lens_22(g, t), seg(t, 1.9, 2.2))
        return im
    if t < 4.6: return lens_22(g, t)
    if t < 6.6:                                                   # 3: graphics only: the claim; the tubes fill (swiped in, already filling)
        im = paper.copy(); put(im, M.tubes(g, seg(t, 4.7, 5.6)), (770, 1150), back_out(seg(t, 4.45, 4.75), 1.4), 4)
        pop(im, g['note_claim'], t, 4.5, (300, 820), -6); doodle_on(im, t, 5.4, g['d_arrow'], (520, 1080), -20)   # from the claim to the tubes
        pop(im, g['test'], t, 4.75, (540, 400), -2)
        if t < 4.9: im = swipe(lens_22(g, t), im, seg(t, 4.6, 4.9))
        if t > 6.3: im = slice_22(im, c[1].at(0), seg(t, 6.3, 6.6))
        return im
    if t < 10.8:                                                  # 4: the uncut test; a REC corner; the words change, nothing cuts the take
        im = c[1].at(t - 6.6)
        if int(t * 2) % 2 == 0: im.alpha_composite(g['rec'], (W - 290, 250))
        if t < 8.5: pop(im, g['oneTake'], t, 6.7, (400, 330), -3)
        else: pop(im, g['watch'], t, 8.6, (360, 330), -2)
        return im
    if t < 12.4:                                                  # 5: graphics only: did it...? the magnifier glides across
        im = paper.copy(); pop(im, g['d_burst'], t, 10.9, (320, 640), 0); pop(im, g['did'], t, 10.95, (320, 640), -5); pop(im, g['result'], t, 11.2, (560, 1000), -2)
        put(im, g['mag'], (lerp(W + 700, 640, ease(seg(t, 11.6, 12.2))), 1400), 1, 0)
        return im
    if t < 13.4:                                                  # 6: the lens carries the result and opens
        im = paper.copy(); (ox, oy, r) = g['lens']; grow = ease(seg(t, 12.6, 13.3)); lc = (640 + ox, 1400 + oy)
        im.paste(c[2].at(t - 12.4).convert('RGB'), (0, 0), circle_mask((W, H), lerp2(lc, (540, 960), grow), lerp(r, 1300, grow), 2))
        if grow < 0.5: put(im, g['mag'], (640, 1400), 1, 0, 1 - grow * 2)
        return im
    if t < 15.6:                                                  # 7: the stamp: PASSED (one main action)
        im = c[2].at(t - 12.4); pop(im, g['said'], t, 13.5, (540, 360), -2)
        if t >= 14.12: put(im, g['ink'], (330, 1420), 1, -12)
        down = ease(seg(t, 13.95, 14.12)); up = ease(seg(t, 14.25, 14.45))
        if t >= 13.95 and up < 1: put(im, g['stamp'], (330, lerp(-300, 1340, down) - 1700 * up), 1, -12)
        return im
    im = paper.copy(); u = ease(seg(t, 15.6, 15.9))                # 8: CTA on the paper, the kit round it
    cw, ch = int(lerp(1415, 560, u)), int(lerp(H, 760, u)); put(im, M.card(c[3].at(t - 15.6), cw, ch, int(18 * u)), lerp2((W / 2, H / 2), (540, 1020), u), 1, 2 * u)   # keeps its shape (CapCut)
    if t >= 15.9: put(im, g['ink_s'], (700, 720), 1, -14)
    pop(im, M.tubes(g, 1.0), t, 15.9, (190, 1520), -6); pop(im, g['mag_s'], t, 16.0, (880, 1500), -20)
    pop(im, g['comment'], t, 15.9, (540, 330)); pop(im, g['kw'], t, 16.2, (540, 500), 2)
    return im

def lens_22(g, t):
    """2: the setup clip inside the big magnifier's lens on the graph paper; the claim."""
    im = g['paper'].copy(); (ox, oy, r) = g['lens_big']; mx, my = 540 - ox + 30 * math.sin(t * 1.2), 1040 - oy
    im.paste(g['c'][0].at(t - 2.2).convert('RGB'), (0, 0), circle_mask((W, H), (mx + ox, my + oy), r, 2)); put(im, g['mag_big'], (mx, my), 1, 0)
    pop(im, g['really'], t, 2.4, (480, 300), -2); pop(im, g['claim'], t, 2.7, (540, 470), -3)
    return im

SETUP['22'] = setup_22; FRAME['22'] = frame_22; SECS['22'] = 17.8


def toned(folder, name, dark, light, crop=None):
    im = raw(folder, name, crop) if crop else S.raw(folder, name)
    return ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(ImageOps.grayscale(im)), dark, light), (W, H), Image.LANCZOS).convert('RGBA')

def shake(t, t0, t1, amp=7): return amp * math.sin(t * 55) * (1 - seg(t, t0, t1)) if t >= t0 else 0

# ======================================================================================================================
# 08 A real customer question (palette: light blue + wine). Notes applied: frame 1 is full and moving (the buyer's clip
# with the question already up, never an empty paper); words grouped together, not spread across the frame; slower;
# no hand on a phone (the ringing rotary phone is the prop); arrows only where they point at something.
#  1 0.0  the clip full frame; the question card already up, swinging on its pin; "you asked" right above it
#  2 2.4  swipe to the light-blue stage (no video): the rotary phone rings, ONE wine burst behind it; [can I wash it?]
#  3 4.2  the answer, full frame; the word sandwich grouped low: here's / the answer / [in one line]
#  4 6.6  stage: the question card swaps in place for the answer note; the clip pinned beside it; an arrow note -> photo
#  5 8.6  answer part 2, full frame; [the answer, line two]
#  6 10.6 stage, no video: you all asked; three more questions pinned in one tight column; the phone rings again
#  7 13.0 in use, full frame (motion-blur swipe in)
#  8 14.4 CTA: the clip pinned as a photo; Comment / "[KEYWORD]" / [more questions?] grouped at the top
# ======================================================================================================================
def setup_08():
    BL = PAL['blue']
    g = {'c': {'ans1': Clip('IMG_1381', 1.0, 6.0), 'ans2': Clip('IMG_1414', 1.0, 6.0), 'use': Clip('IMG_1391', 1.0, 6.0), 'cta': Clip('IMG_1381', 3.0, 6.0)}}
    g['stage'] = toned('images', 'Cream parchment paper stack-205.png', tuple(int(v * 0.72) for v in BL), (240, 245, 250), (0.3, 0.3, 0.7, 0.62))
    g['phone'] = P.thing('Dusty blue vintage rotary telephone-26.png', 660, 'stripes', CRM, scale=0.45, strength=0.65)
    q = ['[the question your', 'customer asked]']
    g['dm'] = P.pinned(P.proof_card(q, 620, WINE), -4); g['dm_s'] = P.pinned(P.proof_card(q, 440, WINE), -4)
    g['dms'] = [P.pinned(P.proof_card(l, 520, WINE), r, pn) for l, r, pn in ((['[another question]'], 4, 'pin-head-black'), (['[and another]'], -5, 'pin-head-white'), (['[one more]'], 3, 'pin-head-cream'))]
    g['answer_note'] = P.sticky('[yes! wash\nit at 30°]', 460, px=58, pin='pin-head-black')
    g['you'] = P.caption('you asked', 170, WHITE, edge=WINE); g['qpill'] = P.pill_m('[can I wash it?]', 84)
    g['heres'] = P.pill_m("here's", 76); g['answer'] = P.caption('the answer', 190, WHITE, edge=WINE); g['line'] = P.pill_m('[in one line]', 76, BL)
    g['all'] = P.caption('you all asked', 120, WINE, edge=WHITE); g['comment'] = P.caption('Comment', 200, WINE, edge=WHITE, italic_last=False)
    g['kw'] = P.pill_once('"[KEYWORD]"', 78, WINE); g['more'] = P.pill_m('[more questions?]', 70, BL); g['ans2'] = P.pill_m('[the answer, line two]', 78)
    g['d_burst'] = doodle('burst', 2, 760, WINE); g['d_arrow'] = doodle('arrow', 2, 220, WINE); g['d_under'] = doodle('under', 0, 520, WINE)   # rays round the ringing phone
    return g

def frame_08(g, t):
    c = g['c']
    if t < 2.4:                                                   # 1: full and moving from frame 1: the clip, the question already up
        im = c['ans1'].at(t + 2.0); sw_ = 5 * math.sin(t * 3.2) * math.exp(-0.6 * t)
        put(im, g['dm'], (540, lerp(1180, 1260, ease(seg(t, 0, 0.4)))), 1, sw_)
        pop(im, g['you'], t, 0.0, (540, 960), -2); doodle_on(im, t, 0.6, g['d_under'], (540, 1070), -2)
        if t > 2.1: im = swipe(im, stage2_08(g, t), seg(t, 2.1, 2.4))
        return im
    if t < 4.2:
        im = stage2_08(g, t)
        if t > 3.9: im = swipe(im, c['ans1'].at(0), seg(t, 3.9, 4.2))
        return im
    if t < 6.6:                                                   # 3: the answer; the sandwich grouped low
        im = c['ans1'].at(t - 4.2); P.sandwich(im, t, 4.3, (540, 1300), g['heres'], g['answer'], g['line']); return im
    if t < 8.6:                                                   # 4: the card swaps for the answer note; the clip pinned beside it
        im = g['stage'].copy(); sw_ = ease(seg(t, 6.8, 7.1))
        if sw_ < 0.5: put(im, g['dm_s'], (330, 860), 1 - sw_ * 2 if sw_ > 0 else 1, -4)
        else: put(im, g['answer_note'], (330, 860), back_out(seg(t, 6.95, 7.2), 1.6), -5)
        ph = P.pinned(card(c['ans1'].at(t - 4.2, (420, 540)), 420, 540), 6, 'pin-head-white'); pop(im, ph, t, 6.7, (760, 1180), 0)
        doodle_on(im, t, 7.5, g['d_arrow'], (560, 1040), 30)
        if t > 8.3: im = swipe(im, c['ans2'].at(0), seg(t, 8.3, 8.6))
        return im
    if t < 10.6:                                                  # 5: answer part 2
        im = c['ans2'].at(t - 8.6); pop(im, g['ans2'], t, 8.7, (540, 1380), -2)
        if t > 10.3: im = swipe(im, stage6_08(g, t), seg(t, 10.3, 10.6))
        return im
    if t < 13.0:
        im = stage6_08(g, t)
        if t > 12.7: im = swipe(im, c['use'].at(0), seg(t, 12.7, 13.0))
        return im
    if t < 14.4: return c['use'].at(t - 13.0)                     # 7: in use
    im = g['stage'].copy(); u = ease(seg(t, 14.4, 14.75))         # 8: CTA: the clip pinned as a photo; words grouped at the top
    cw, ch = int(lerp(1488, 620, u)), int(lerp(H, 800, u)); cd = card(c['cta'].at(t - 14.4, (cw, ch)), cw, ch, int(16 * u))   # keeps its shape (CapCut)
    put(im, P.pinned(cd, 3 * u, 'pin-head-black') if u > 0.9 else cd, lerp2((W / 2, H / 2), (540, 1180), u))
    pop(im, g['comment'], t, 14.8, (540, 330)); pop(im, g['kw'], t, 15.1, (540, 500), 2); pop(im, g['more'], t, 15.3, (540, 630), -2)
    return im

def stage2_08(g, t):
    """2: the rotary phone rings on the stage, one burst behind it; the question grouped above it."""
    im = g['stage'].copy(); s = shake(t, 2.5, 3.6)
    if t >= 2.5: put(im, g['d_burst'], (540, 1260), 0.9 + 0.1 * back_out(seg(t, 2.5, 2.8), 1.5))
    put(im, g['phone'], (540 + s, 1300), back_out(seg(t, 2.4, 2.7), 1.6), s)
    pop(im, g['qpill'], t, 2.6, (540, 820), -2)
    return im

def stage6_08(g, t):
    """6: you all asked: three more questions pinned in one tight column (grouped); the phone rings again."""
    im = g['stage'].copy(); pop(im, g['all'], t, 10.6, (540, 330), -2)
    for i, (xy) in enumerate(((500, 640), (580, 900), (500, 1160))): pop(im, g['dms'][i], t, 10.9 + i * 0.4, xy, 0)
    s = shake(t, 12.0, 12.5); put(im, g['phone'], (820 + s, 1580), back_out(seg(t, 11.9, 12.15), 1.6) * 0.6, s)
    return im

SETUP['08'] = setup_08; FRAME['08'] = frame_08; SECS['08'] = 17.0

# ======================================================================================================================
# 20 What buyers said (palette: pink + wine; the gold is only the stars). Notes applied: KEEP the five gold stars
# sticking on at the start and the stars rushing in as the transition (she loved both); no duplicate stars anywhere
# else and no gold seal; the locked type; slower.
#  1 0.0  the product full frame; five gold stars stick on one by one; what / buyers / said
#  2 2.4  marble stage, no video: review 1 pinned big
#  3 4.4  the product clip with review 2 on a plain phone beside it (tech); an arrow at the phone
#  4 6.4  marble: the clip in a round window, ONE wine burst behind it, review cards fanned round (behind and in front)
#  5 8.4  gold stars rush in and cover everything, then fly off to the in-use clip (kept)
#  6 9.8  marble, no video: [200] happy buyers; a trophy with a No.1 sticker rises
#  7 11.8 in use, full frame
#  8 13.2 CTA: see why / Comment / "[KEYWORD]" over the product
# ======================================================================================================================
def setup_20():
    PK = PAL['pink']
    g = {'c': {'prod': Clip('IMG_1388', 0.5, 6.0), 'use': Clip('IMG_1390', 1.0, 6.0), 'cta': Clip('IMG_1388', 3.0, 6.0)}}
    g['marble'] = toned('images', 'Soft veined white marble texture-1.png', (196, 120, 150), PK)   # pink marble: the white review cards stand out (her note)
    st = P.raw_cut('Gold foil star sticker-95.png', 160); g['stars'] = [C.shadow(st.rotate(r, expand=True), (4, 8), 6, 90) for r in (-12, 8, -4, 10, -18)]
    g['bigstars'] = [S.fitw(st, 380).rotate(r, expand=True) for r in (-20, 0, 15, 30, -35)]
    g['rev'] = [P.pinned(P.proof_card(l, 520, WINE, '[buyer]', 'review'), r, pn) for l, r, pn in
                ((['[the review, word for word]'], -4, 'pin-head-black'), (['[review two]'], 5, 'pin-head-black'), (['[review three]'], -6, 'pin-head-black'), (['[review four]'], 7, 'pin-head-black'))]
    g['rev1big'] = P.pinned(P.proof_card(['[the review, word', 'for word]'], 820, WINE, '[buyer]', 'review'), -4, 'pin-head-black')
    g['rev_raw'] = P.proof_card(['[review two, word', 'for word]'], 560, WINE, '[buyer]', 'review')
    g['trophy'] = P.thing('Plain gold trophy on black base-223.png', 380, None, None, label=dsticker('No.1', 44, WINE, WHITE), label_at=(0.5, 0.3))
    g['what'] = P.pill_m('what', 78); g['buyers'] = P.caption('buyers', 230, PK, edge=WINE); g['said'] = P.pill_m('said', 78, PK)
    g['num'] = P.pill_m('[200]', 110); g['happy'] = P.caption('happy buyers', 128, WINE, edge=WHITE)
    g['see'] = P.pill_m('see why', 78); g['comment'] = P.caption('Comment', 210, WHITE, edge=WINE, italic_last=False); g['kw'] = P.pill_once('"[KEYWORD]"', 78, WINE)
    g['d_arrow'] = doodle('arrow', 9, 230, WINE); g['d_burst'] = doodle('burst', 3, 900, WINE); g['d_under'] = doodle('under', 0, 520, WINE)
    return g

def frame_20(g, t):
    c = g['c']
    if t < 2.4:                                                   # 1: stars stick on (kept); the sandwich
        im = c['prod'].at(t)
        for i in range(5):
            t0 = 0.05 + 0.15 * i
            if t >= t0: put(im, g['stars'][i], (190 + i * 175, 300 - (30 if i in (1, 3) else 0)), 1 + 0.8 * (1 - back_out(seg(t, t0, t0 + 0.2), 1.2)))
        P.sandwich(im, t, 0.5, (540, 1100), g['what'], g['buyers'], g['said'])
        if t > 2.1: im = swipe(im, stage2_20(g, t), seg(t, 2.1, 2.4))
        return im
    if t < 4.4: return stage2_20(g, t)
    if t < 6.4:                                                   # 3: review 2 on a plain phone beside the product (tech)
        im = c['prod'].at(t - 2.4); sw, sh = P.screen_size(PHONE, 440); scr = Image.new('RGBA', (sw, sh), (245, 245, 247, 255))
        rw = S.fitw(g['rev_raw'], int(sw * 0.94)); scr.alpha_composite(rw, (int(sw * 0.03), int(sh * 0.3)))
        put(im, P.on_screen(PHONE, 440, scr), (lerp(W + 400, 790, ease(seg(t, 4.4, 4.75))), 1150), 1, 6)
        doodle_on(im, t, 5.0, g['d_arrow'], (450, 1190), 90)   # points right, at the review on the phone
        return im
    if t < 8.4:                                                   # 4: the clip in a round window, one burst behind it; cards fanned round
        im = g['marble'].copy()
        if t >= 6.5: put(im, g['d_burst'], (540, 1020), 0.9 + 0.1 * back_out(seg(t, 6.5, 6.8), 1.5))     # ONE burst, centred behind the circle and the cards
        for i, (xy) in enumerate(((260, 520), (830, 640))): pop(im, g['rev'][i + 1], t, 6.6 + i * 0.3, xy, 0)
        put(im, roundwin(c['prod'].at(t - 2.4, (600, 600)), 600), (540, 1020), back_out(seg(t, 6.4, 6.7), 1.5))
        pop(im, g['rev'][3], t, 7.1, (330, 1400), 0)                                                                  # in front
        return im
    if t < 9.8:                                                   # 5: the stars rush in and cover it all, then fly off (kept)
        im = frame_20(g, 8.39) if t < 9.0 else c['use'].at(t - 9.0)
        for i, (x, y) in enumerate([(x, y) for y in (150, 560, 970, 1380, 1790) for x in (130, 540, 950)]):
            a = ease(seg(t, 8.5 + (i % 5) * 0.03, 8.9)); b = ease(seg(t, 9.05 + (i % 4) * 0.03, 9.5))
            if a <= 0 or b >= 1: continue
            dx, dy = x - W / 2, y - H / 2; n = math.hypot(dx, dy) + 1; fx, fy = dx / n * 1500, dy / n * 1500
            put(im, g['bigstars'][i % 5], (x + fx * (1 - a) + fx * b, y + fy * (1 - a) + fy * b), 1, 80 * b)
        return im
    if t < 11.8:                                                  # 6: no video: the recap; the trophy rises (no extra stars)
        im = g['marble'].copy(); pop(im, g['num'], t, 9.9, (540, 520), -3); pop(im, g['happy'], t, 10.1, (540, 700), 0); doodle_on(im, t, 10.5, g['d_under'], (540, 820), -2)
        put(im, g['trophy'], (540, lerp(2300, 1320, back_out(seg(t, 10.3, 10.7), 1.3))), 1, 0)
        if t > 11.5: im = swipe(im, c['use'].at(2.2), seg(t, 11.5, 11.8))
        return im
    if t < 13.2: return c['use'].at(t - 11.8 + 2.2)               # 7: in use
    im = c['cta'].at(t - 13.2); P.sandwich(im, t, 13.3, (540, 1100), g['see'], g['comment'], g['kw'])
    return im

def stage2_20(g, t):
    """2: review 1 pinned big on the marble, one underline under it (no seal, no repeated stars)."""
    im = g['marble'].copy(); pop(im, g['rev1big'], t, 2.4, (540, 900), 0)
    return im

SETUP['20'] = setup_20; FRAME['20'] = frame_20; SECS['20'] = 15.8

# ======================================================================================================================
# 23 Every option in 10 seconds (palette: light blue + wine; the paint chips bring their own colours). Notes applied:
# no hand on the phone (it stands on its own, a 1:1 video slot of the shop scroll, no prices); the locked type; each
# option held long enough to read its name; words grouped.
#  1 0.0  pegboard, no video: the fan deck fans open; every option [in 10 seconds]
#  2 2.2  the phone stands on the pegboard shelf edge: the shop scroll (buyer's video slot)
#  3 4.0  options 1-4, 1.25 s each, full frame: its own real chip + name; fan wipe / giant chip sweep between
#  7 9.0  glasses: the outside goes greyscale, options 5 and 6 play in colour in the two lenses; which one?
#  8 10.8 options 5-6
#  9 13.3 pegboard, no video: the chip row; pause on / your favourite; her heart on one chip
# 10 15.0 CTA: every option playing on the real oak shelf; Comment / "[KEYWORD]" / all [6] at [shop] grouped on top
# ======================================================================================================================
OPT = ('IMG_1403', 'IMG_1404', 'IMG_1405', 'IMG_1406', 'IMG_1410', 'IMG_1417')
GLASSES = 'Bold black acetate eyeglass front frame-4.png'; LENS_L, LENS_R = (96, 41, 548, 416), (768, 41, 1220, 416)
STEP23 = 1.25

def setup_23():
    BL = PAL['blue']
    g = {'c': [Clip(n, 1.0, 3.0) for n in OPT]}
    g['peg'] = ImageOps.fit(S.raw('images', 'White pegboard grid texture-5.png'), (W, H)).convert('RGBA')
    row = S.raw('images', 'Six-color paint chip row-77.png'); bb = row.convert('L').point(lambda v: 255 if v < 240 else 0).getbbox(); row = row.crop(bb); cw = row.width / 6
    chips = [row.crop((int(i * cw + 6), 0, int((i + 1) * cw - 6), row.height)).convert('RGBA') for i in range(6)]
    g['chips'] = [P.die_cut(S.fitw(ch, 190), 6) for ch in chips]; g['chip_big'] = [S.fitw(ch, 1300) for ch in chips]
    g['chip_row'] = [P.die_cut(S.fitw(ch, 300), 8) for ch in chips]
    g['fan'] = P.die_cut(P.raw_cut('Muted Paint Chip Fan Deck-235.png', 980), 10); g['shelf'] = P.die_cut(P.raw_cut('Pale oak three-tier display shelf-74.png', 900), 8)
    g['glasses'] = P.raw_cut(GLASSES, 1000)
    sw, sh = P.screen_size(PHONE, 640); g['scr'] = (sw, sh); g['grid'] = shop_grid(sw)
    g['every'] = P.caption('every option', 128, WINE, edge=WHITE); g['ten'] = P.pill_m('[in 10 seconds]', 80, BL)
    g['names'] = [P.pill_m(f'[OPTION {i + 1}]', 80) for i in range(6)]; g['count'] = [P.pill_m(f'{i + 1}/6', 64, BL) for i in range(6)]
    g['which'] = P.caption('which one?', 190, WHITE, edge=WINE); g['pause'] = P.pill_m('pause on', 78); g['fav'] = P.caption('your favourite', 118, WINE, edge=WHITE)
    g['comment'] = P.caption('Comment', 200, WINE, edge=WHITE, italic_last=False); g['kw'] = P.pill_once('"[KEYWORD]"', 76, WINE); g['all'] = P.pill_m('all [6] at [shop]', 70, BL)
    g['d_heart'] = doodle('icon', 2, 190, WINE); g['d_under'] = doodle('under', 0, 520, WINE)
    return g

def fan_wipe(old, new, u):
    if u <= 0: return old
    if u >= 1: return new
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).pieslice((-2300, H - 2300, 2300, H + 2300), -90, -90 + 90 * u, fill=255)
    out = old.copy(); out.paste(new, (0, 0), m); return out

def option(g, i, tt):
    im = g['c'][i].at(max(0, tt)); k = back_out(min(1, max(0, tt) / 0.25)) if tt < 0.25 else 1
    put(im, g['chips'][i], (170, 1380), k, -6); put(im, g['names'][i], (540, 1390), k, -2); put(im, g['count'][i], (930, 330), 1)
    return im

def options(g, t, t0, idx):
    """STEP23 seconds per option from t0, alternating a fan wipe and a giant chip sweep between them."""
    j = min(len(idx) - 1, int((t - t0) / STEP23)); tt = t - t0 - j * STEP23; im = option(g, idx[j], tt)
    if j < len(idx) - 1 and tt > STEP23 - 0.28:
        u = ease((tt - STEP23 + 0.28) / 0.28); nxt = option(g, idx[j + 1], 0)
        if j % 2 == 0:
            if u > 0.5: im = nxt
            ch = g['chip_big'][idx[j + 1]]; put(im, ch, (lerp(-ch.width / 2 - 200, W + ch.width / 2 + 200, u), 960), 1, -12)
        else: im = fan_wipe(im, nxt, u)
    return im

def frame_23(g, t):
    c = g['c']
    if t < 2.2:                                                   # 1: the fan deck fans open (no video), already on screen and moving
        im = g['peg'].copy(); k = ease(seg(t, 0, 0.8)); put(im, g['fan'], (540, 1300), lerp(0.75, 1, k), lerp(-50, 0, k))
        pop(im, g['every'], t, 0.1, (540, 400), -2); pop(im, g['ten'], t, 0.5, (540, 580), 2)
        return im
    if t < 4.0:                                                   # 2: the phone stands on its own; the shop scroll (video slot)
        im = g['peg'].copy(); sw, sh = g['scr']; gim, top, rw = g['grid']; e = 1 - (1 - seg(t, 2.4, 3.5)) ** 3
        y = int(e * (top + 3 * rw - sh * 0.3)); scr = gim.crop((0, y, sw, y + sh))
        put(im, P.on_screen(PHONE, 640, scr), (540, lerp(2400, 1000, back_out(seg(t, 2.2, 2.55), 1.2))), 1, -3)
        if t > 3.75: im = fan_wipe(im, option(g, 0, 0), seg(t, 3.75, 4.0))
        return im
    if t < 9.0: return options(g, t, 4.0, [0, 1, 2, 3])
    if t < 10.8:                                                  # 7: the glasses: greyscale outside, two options in colour inside
        base = ImageOps.grayscale(c[3].at(t - 4.0)).convert('RGBA'); gl = g['glasses']; k = gl.width / 1316
        gx, gy = 540 - gl.width / 2, 900 - gl.height / 2
        for (bx, clip) in ((LENS_L, c[4]), (LENS_R, c[5])):
            x0, y0, x1, y1 = [int(v * k) for v in bx]; v = clip.at(t - 9.0, (x1 - x0, y1 - y0))
            hole = Image.new('L', v.size, 0); ImageDraw.Draw(hole).ellipse((4, 4, v.width - 4, v.height - 4), fill=255); v.putalpha(hole)
            base.alpha_composite(v, (int(gx + x0), int(gy + y0)))
        put(base, C.shadow(gl, (8, 14), 12, 110), (540, 900), back_out(seg(t, 9.0, 9.3), 1.4))
        pop(base, g['which'], t, 9.2, (540, 1300), -2); put(base, g['names'][4], (290, 1480), back_out(seg(t, 9.5, 9.7)), -3); put(base, g['names'][5], (790, 1480), back_out(seg(t, 9.65, 9.85)), 3)
        return base
    if t < 13.3: return options(g, t, 10.8, [4, 5])
    if t < 15.0:                                                  # 9: the chip row (no video); pause on your favourite
        im = g['peg'].copy()
        for i in range(6): pop(im, g['chip_row'][i], t, 13.3 + i * 0.06, (180 + (i % 3) * 360, 860 + (i // 3) * 520), (-6, 4, -3, 5, -4, 6)[i])
        pop(im, g['pause'], t, 13.4, (540, 330), -2); pop(im, g['fav'], t, 13.55, (540, 500), 0)
        doodle_on(im, t, 14.0, g['d_heart'], (540, 1290), 8)
        return im
    im = g['peg'].copy(); put(im, g['shelf'], (540, 1240), back_out(seg(t, 15.0, 15.3), 1.3))  # 10: CTA on the shelf
    for i, (x, y) in enumerate(((330, 960), (750, 960), (330, 1260), (750, 1260), (330, 1550), (750, 1550))):
        if t >= 15.1 + i * 0.08: put(im, card(c[i].at(t - 15.0, (230, 170)), 230, 170, 8), (x, y), back_out(seg(t, 15.1 + i * 0.08, 15.35 + i * 0.08)), (-3, 3)[i % 2])
    pop(im, g['comment'], t, 15.4, (540, 300)); pop(im, g['kw'], t, 15.7, (540, 460), 2); pop(im, g['all'], t, 15.9, (540, 580), -2)
    doodle_on(im, t, 16.1, g['d_under'], (540, 690), -2)
    return im

SETUP['23'] = setup_23; FRAME['23'] = frame_23; SECS['23'] = 17.6


# ======================================================================================================================
# 11 A day with it (palette: light blue + pink, deep blue for words on the light stage). New style (round 4): her notes
# on v1-v3 (too fall, block outlines, girly, three clocks) and the batch-3 rules: one calm stage (pale blue tissue) that
# returns with a different setup each visit, one object per beat (no theme object, no clock wheel), one burst behind
# something, one arrow toward the frame centre, the watch screen is one video slot. Words: generic built-in time-of-day
# words; the buyer's times and product are editable.
#  1 0.0  morning, full frame: an alarm clock rings in the corner, ONE burst behind it; a day with my [product];
#         morning; [7am]
#  2 2.4  stage (no video): a mug; the rainbow rises behind midday
#  3 4.4  midday, full frame: the rainbow carried in as a sticker; [12pm]
#  4 6.4  stage: a smartwatch lying on it, its screen the afternoon clip (tech); the hourglass flips; afternoon [4pm]
#  5 8.6  afternoon, full frame: the hourglass carried into the corner
#  6 10.6 stage, the lights go down to night: the candle lights, three gold stars; night [9pm]
#  7 12.6 night, full frame: the candle carried into the corner
#  8 14.4 CTA on the stage: the product in a round window, the day's four objects round it; every day, [Product name]
#         at [shop], comment "[KEYWORD]"; one arrow from the words toward the product
# ======================================================================================================================
WATCH = 'Graphite smartwatch with green display-47.png'

def vslide(old, new, u):
    """The next scene slides up from below (old leaves upward)."""
    if u <= 0: return old
    if u >= 1: return new
    dy = int(ease(u) * H); out = Image.new('RGBA', (W, H)); out.alpha_composite(old, (0, -dy)); out.alpha_composite(new, (0, H - dy)); return out

def setup_11():
    PK, BL = PAL['pink'], PAL['blue']
    g = {'c': {'morning': Clip('IMG_1469', 1.0, 6.0), 'midday': Clip('IMG_1381', 1.0, 6.0), 'after': Clip('IMG_1391', 1.0, 6.0),
               'night': Clip('IMG_1456', 1.0, 6.0), 'end': Clip('IMG_1388', 0.5, 6.0)}}
    g['stage'] = ImageOps.fit(S.raw('images', 'Crumpled pale blue tissue texture-8.png'), (W, H)).convert('RGBA')
    g['night_stage'] = toned('images', 'Crumpled pale blue tissue texture-8.png', (12, 20, 44), (48, 64, 104))
    g['clock'] = P.thing('Slender Cream Twin-Bell Alarm Clock-158.png', 330, 'dots', BL, scale=0.4, strength=0.8)
    g['clock_s'] = S.fitw(g['clock'], 200)
    g['mug'] = P.thing('Warm white ceramic coffee mug-140.png', 330, 'smalldots', PK, scale=0.4, strength=0.85)
    g['rainbow'] = P.die_cut(P.raw_cut('Muted retro rainbow arch-2.png', 760), 10); g['rainbow_s'] = S.fitw(g['rainbow'], 280)
    g['hourglass'] = P.thing('Classic wooden hourglass with flowing sand-238.png', 300, 'stripes', PK, scale=0.35, strength=0.5)
    g['hourglass_s'] = S.fitw(g['hourglass'], 170)
    g['candle'] = P.thing('Glowing Ivory Candle in Glass Jar-96.png', 300, 'smalldots', PK, scale=0.35, strength=0.35); g['candle_s'] = S.fitw(g['candle'], 190)
    st = P.raw_cut('Gold foil star sticker-95.png', 130); g['stars'] = [C.shadow(st.rotate(r, expand=True), (4, 8), 6, 90) for r in (-14, 9, -4)]
    g['burst'] = doodle('burst', 3, 720, PK); g['d_under'] = doodle('under', 0, 520, PK); g['d_arrow'] = doodle('arrow', 9, 220, DEEP)
    g['hook'] = P.pill_m('a day with my\n[product]', 74)
    g['morning'] = P.caption('morning', 190, WHITE, edge=DEEP); g['t7'] = P.pill_m('[7am]', 72, BL)
    g['midday'] = P.caption('midday', 220, DEEP, edge=WHITE); g['t12'] = P.pill_m('[12pm]', 72, BL)
    g['afternoon'] = P.caption('afternoon', 170, DEEP, edge=WHITE); g['t4'] = P.pill_m('[4pm]', 72, BL)
    g['night'] = P.caption('night', 230, PK, edge=WHITE); g['t9'] = P.pill_m('[9pm]', 72, BL)
    g['every'] = P.caption('every day', 190, DEEP, edge=WHITE); g['name'] = P.pill_m('[Product name] at [shop]', 66)
    g['kw'] = P.pill_once('comment "[KEYWORD]"', 66, PK)
    return g

def stage1_11(g, t):
    """2: the stage, a mug; the rainbow rises behind midday; the alarm clock carried in, resting in the corner."""
    im = g['stage'].copy()
    put(im, g['rainbow'], (540, lerp(1300, 820, back_out(seg(t, 2.5, 2.9), 1.2))), 1)
    pop(im, g['midday'], t, 2.8, (540, 900)); pop(im, g['mug'], t, 2.6, (300, 1340), -6, wiggle=2)
    put(im, g['clock_s'], (lerp(800, 840, ease(seg(t, 2.4, 2.7))), lerp(1700, 1420, ease(seg(t, 2.4, 2.7)))), 1, 12)
    return im

def watch_11(g, t):
    sw, sh = P.screen_size(WATCH, 520); return P.on_screen(WATCH, 520, g['c']['after'].at(t - 6.4, (sw, sh)))

def stage2_11(g, t):
    """4: the stage again, a new setup: the watch lying on it (its screen the afternoon clip), the hourglass flips."""
    im = g['stage'].copy(); put(im, watch_11(g, t), (600, lerp(2300, 1080, back_out(seg(t, 6.4, 6.75), 1.2))), 1, 12)
    flip = ease(seg(t, 7.2, 7.6)); put(im, g['hourglass'], (230, 1440), back_out(seg(t, 6.6, 6.9), 1.5), 180 * flip)
    pop(im, g['afternoon'], t, 6.6, (540, 380)); pop(im, g['t4'], t, 7.0, (540, 560), -2)
    return im

def stage3_11(g, t):
    """6: the lights go down: the stage dims to night; the candle lights; three gold stars twinkle in."""
    dim = ease(seg(t, 10.7, 11.1)); im = Image.blend(g['stage'], g['night_stage'], dim)
    pop(im, g['candle'], t, 11.0, (540, 1240), 0)
    for i, (xy, t0) in enumerate((((230, 760), 11.2), ((860, 900), 11.35), ((300, 1600), 11.5))):
        if t >= t0: put(im, g['stars'][i], xy, back_out(seg(t, t0, t0 + 0.25), 1.8) * (1 + 0.06 * math.sin((t - t0) * 6 + i)))
    pop(im, g['night'], t, 11.1, (540, 520)); pop(im, g['t9'], t, 11.4, (540, 720), -2)
    return im

def cta_11(g, t):
    """8: the product in a round window, the day's four objects round it; the CTA; one arrow toward the product."""
    im = g['stage'].copy(); c = g['c']
    put(im, roundwin(c['end'].at(t - 14.4, (560, 560)), 560), (540, 1090), back_out(seg(t, 14.4, 14.75), 1.4))
    for i, (key, xy, r) in enumerate((('clock_s', (170, 960), -10), ('mug', (910, 900), 8), ('hourglass_s', (180, 1460), 6), ('candle_s', (890, 1450), -6))):
        pop(im, g[key] if key != 'mug' else S.fitw(g['mug'], 220), t, 14.6 + i * 0.1, xy, r, wiggle=1.5)
    pop(im, g['every'], t, 14.6, (540, 300)); pop(im, g['name'], t, 14.9, (540, 470), -2); pop(im, g['kw'], t, 15.2, (540, 600), 2)
    doodle_on(im, t, 15.4, g['d_arrow'], (330, 760), 0)   # one arrow, from the words toward the frame centre
    return im

def frame_11(g, t):
    c = g['c']
    if t < 2.4:                                                   # 1: morning; the alarm clock rings, one burst behind it
        im = c['morning'].at(t); s = 7 * math.sin(t * 55) * (1 - seg(t, 1.2, 1.5)) if t > 0.2 else 0
        if t >= 0.25: put(im, g['burst'], (820, 1330), 0.9 + 0.1 * back_out(seg(t, 0.25, 0.55), 1.5))
        put(im, g['clock'], (820 + s, 1330), back_out(seg(t, 0.0, 0.25), 1.6), s)
        pop(im, g['hook'], t, 0.0, (330, 330), -3); pop(im, g['morning'], t, 0.4, (430, 560)); doodle_on(im, t, 0.8, g['d_under'], (430, 680), -2)
        pop(im, g['t7'], t, 0.9, (260, 760), -3)
        if t > 2.1: im = vslide(im, stage1_11(g, t), seg(t, 2.1, 2.4))
        return im
    if t < 4.4:
        im = stage1_11(g, t)
        if t > 4.1: im = swipe(im, c['midday'].at(0), seg(t, 4.1, 4.4))
        return im
    if t < 6.4:                                                   # 3: midday; the rainbow carried in as a sticker
        im = c['midday'].at(t - 4.4); put(im, g['rainbow_s'], (850, 330), back_out(seg(t, 4.5, 4.8), 1.5), 6 + 3 * math.sin(t * 2))
        pop(im, g['t12'], t, 4.6, (300, 330), -3)
        if t > 6.1: im = vslide(im, stage2_11(g, t), seg(t, 6.1, 6.4))
        return im
    if t < 8.6:
        im = stage2_11(g, t)
        if t > 8.3: im = swipe(im, c['after'].at(t - 6.4), seg(t, 8.3, 8.6))
        return im
    if t < 10.6:                                                  # 5: afternoon; the hourglass carried into the corner
        im = c['after'].at(t - 6.4); put(im, g['hourglass_s'], (170, 1380), back_out(seg(t, 8.7, 9.0), 1.5), 180 + 8 * math.sin(t * 2))
        if t > 10.3: im = vslide(im, stage3_11(g, t), seg(t, 10.3, 10.6))
        return im
    if t < 12.6:
        im = stage3_11(g, t)
        if t > 12.3: im = swipe(im, c['night'].at(0), seg(t, 12.3, 12.6))
        return im
    if t < 14.4:                                                  # 7: night; the candle carried into the corner
        im = c['night'].at(t - 12.6); put(im, g['candle_s'], (880, 1380), back_out(seg(t, 12.7, 13.0), 1.5), -6)
        if t > 14.1: im = vslide(im, cta_11(g, t), seg(t, 14.1, 14.4))
        return im
    return cta_11(g, t)

SETUP['11'] = setup_11; FRAME['11'] = frame_11; SECS['11'] = 17.0; DIRS['11'] = '11-a-day-with-it'


# ======================================================================================================================
# 15 New drop reveal (palette: butter + wine). Fresh idea (the stage-curtain version was scratched): the product is
# hidden under a sheet of wine tissue and seen only through a torn peephole; a kitchen timer counts the drop in; the
# sheet rips in two to reveal it. Calm butter-tissue stage, one burst behind a word, one ring round the date, real dates
# only (the buyer types theirs).
#  1 0.0  (her note) the video is full screen and the product in it is lifted onto its own layer: ONE dust cloud and
#         new / drop land BEHIND the product on the thud; speed lines while it falls, a shake on the landing; [something new is coming]; new drop
#  2 2.4  stage (no video): the kitchen timer winds down; dropping in / 3 2 1
#  3 4.6  the sheet again: it rips in two and slides apart, the product full frame; finally. (one burst behind it);
#         [PRODUCT NAME]
#  4 6.8  stage: close-up one in a torn-paper window, a NEW sticker on its corner; [detail one]
#  5 8.8  stage: the laptop standing on it, its screen close-up two (tech); [detail two]
#  6 10.8 detail three, full frame: the NEW sticker, one arrow toward the centre; [detail three]
#  7 12.8 stage (no video): the ticket stub drops in: out / [Fri 24 Oct], one underline (the date shows once)
#  8 14.8 in use, full frame: the NEW sticker carried into the corner
#  9 16.6 CTA over the clip: get it at [shop] / Comment / "[KEYWORD]"
# ======================================================================================================================
LAPTOP = 'Open Silver Laptop with Green Screen-34.png'

def jag_poly(c, r, n=26, amp=0.12, seed=3):
    import random
    rnd = random.Random(seed); return [(c[0] + r * (1 + amp * (rnd.random() - 0.5)) * math.cos(2 * math.pi * k / n),
                                        c[1] + r * (1 + amp * (rnd.random() - 0.5)) * math.sin(2 * math.pi * k / n)) for k in range(n)]

def tear_line(seed=5, n=30):
    import random
    rnd = random.Random(seed); return [(W / 2 + 40 * (rnd.random() - 0.5), H * k / n) for k in range(n + 1)]

def setup_15():
    BU = PAL['butter']
    g = {'c': {'drop': Clip('IMG_1454', 1.0, 6.0), 'prod': Clip('IMG_1381', 1.0, 6.0), 'close1': Clip('IMG_1388', 0.5, 6.0), 'close2': Clip('IMG_1417', 0.5, 6.0), 'close3': Clip('IMG_1463', 1.0, 6.0), 'use': Clip('IMG_1391', 1.0, 6.0)}}
    tissue = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))
    g['stage'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tissue), tuple(int(v * 0.88) for v in BU), BU), (W, H)).convert('RGBA')
    g['sheet'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tissue), (78, 10, 30), (150, 42, 72)), (W, H)).convert('RGBA')
    g['timer'] = P.thing('Cream Retro Kitchen Timer Dial.png', 620, 'smalldots', WINE, scale=0.4, strength=0.22)
    stub = P.raw_cut('Blank peach perforated ticket stub-22.png', 900); d = ImageDraw.Draw(stub)
    sw_ = P.story_word('out', 150, WINE, edge=WHITE); stub.alpha_composite(sw_, (int(stub.width * 0.22 - sw_.width / 2), int(stub.height / 2 - sw_.height / 2)))
    g['stub_blank'] = P.die_cut(stub.copy(), 8)
    dt = P.manrope(66, 600); d.text((int(stub.width * 0.64), stub.height // 2), '[Fri 24 Oct]', font=dt, fill=INK, anchor='mm')
    g['stub'] = P.die_cut(stub, 8)
    g['new'] = dsticker('new', 70, WINE, WHITE)
    cal = S.raw('fall', 'Minimal October calendar page-40.png').convert('RGBA').crop((100, 300, 1160, 1100))   # the grid only: no month, any date
    g['planner'] = C.shadow(S.fitw(cal, 980), (8, 14), 14, 90); g['d_tick'] = doodle('tick', 0, 120, WINE)
    g['lap_w'] = 1040
    g['hook'] = P.pill_m('[something new\nis coming]', 72); g['drop'] = P.caption('new drop', 210, BU, edge=WHITE); g['drop_big'] = sum_word(P.caption('new drop', 215, BU, edge=WINE)); g['drop_w'] = {'new': P.story_word('new', 215, BU, edge=WINE), 'drop': P.story_word('drop', 215, BU, edge=WINE, italic=True)}
    g['dropping'] = P.caption('dropping in', 170, WINE, edge=WHITE); g['digits'] = [P.story_word(d_, 300, WINE, edge=WHITE) for d_ in '321']
    import random as _r; rnd = _r.Random(11); g['scraps'] = []
    for k in range(12):   # torn scraps of the wine sheet that fly off the rip
        sz_ = rnd.randint(70, 130); m_ = Image.new('L', (sz_, sz_), 0); ImageDraw.Draw(m_).polygon(jag_poly((sz_ / 2, sz_ / 2), sz_ * 0.42, n=9, amp=0.6, seed=k), fill=255)
        sc_ = g['sheet'].crop((k * 60, k * 90, k * 60 + sz_, k * 90 + sz_)).copy(); sc_.putalpha(m_); g['scraps'].append(C.shadow(sc_, (3, 6), 5, 90))
    g['finally'] = P.caption('finally.', 220, WHITE, edge=WINE, italic_last=False); g['burst'] = doodle('burst', 2, 700, BU)
    g['name'] = P.pill_m('[PRODUCT NAME]', 84, WINE)
    g['d1'] = P.pill_m('[detail one]', 78); g['d2'] = P.pill_m('[detail two]', 78, BU); g['d3'] = P.pill_m('[detail three]', 78)
    g['shop'] = P.pill_m('get it at [shop]', 76); g['comment'] = P.caption('Comment', 210, WHITE, edge=WINE, italic_last=False); g['kw'] = P.pill_once('"[KEYWORD]"', 78, WINE)
    sheet_ = S.raw('doodles', 'Six soft watercolor blobs in a grid-22.png').convert('RGB'); g['dust'] = []
    for cx_, cy_ in ((380, 215), (870, 215), (380, 610), (870, 610), (380, 1000), (870, 1000)):   # her watercolour blobs as soft dust
        bl = ImageOps.grayscale(sheet_.crop((cx_ - 215, cy_ - 215, cx_ + 215, cy_ + 215))); dust = ImageOps.colorize(ImageOps.autocontrast(bl), (196, 184, 166), (250, 244, 232)).convert('RGBA')
        dust.putalpha(bl.point(lambda v: max(0, min(235, int((252 - v) * 5)))).filter(ImageFilter.GaussianBlur(6))); g['dust'].append(dust)
    g['speed'] = doodle('under', 0, 260, WINE)
    bl = ImageOps.grayscale(sheet_.crop((380 - 215, 215 - 215, 380 + 215, 215 + 215)).convert('RGB')); dust = ImageOps.colorize(ImageOps.autocontrast(bl), (176, 168, 160), (255, 255, 253)).convert('RGBA')
    dust.putalpha(bl.point(lambda v: max(0, min(245, int((252 - v) * 6)))).filter(ImageFilter.GaussianBlur(8))); g['dust_big'] = C.shadow(dust.resize((820, 560), Image.LANCZOS), (0, 6), 14, 40)   # one wide cloud, greyer so it shows on butter
    g['d_under'] = doodle('under', 0, 560, PAL['butter']); g['d_ring'] = doodle('under', 0, 340, WINE); g['d_arrow'] = doodle('arrow', 9, 220, PAL['butter'])
    return g

def slit_edges(w):
    """The two torn edges of a tall tear down the middle of the sheet, w apart (jagged, top to bottom)."""
    import random
    rl, rr = random.Random(21), random.Random(34); n = 28
    left = [(540 - w / 2 + 34 * (rl.random() - 0.5), H * k / n) for k in range(n + 1)]
    right = [(540 + w / 2 + 34 * (rr.random() - 0.5), H * k / n) for k in range(n + 1)]
    return left, right

def covered(g, t, base, open_=1.0, w=None):
    """The product under the wine sheet, already torn open down the middle: a tall, wide band of video from frame 1
    (her note: no small round peephole). The tear breathes wider; the sheet trembles before it rips."""
    im = base.copy(); sh = g['sheet'].copy(); m = Image.new('L', (W, H), 255)
    left, right = slit_edges((w or 710) * (1 + 0.02 * math.sin(t * 5))); ImageDraw.Draw(m).polygon(left + right[::-1], fill=0)
    sh.putalpha(m.filter(ImageFilter.GaussianBlur(1.2))); tug = 10 * math.sin(t * 60) * seg(t, 4.6, 4.75) * (1 - seg(t, 4.8, 4.9))
    if tug: im.alpha_composite(sh, (int(tug), 0))
    else: im.alpha_composite(sh)
    return im

def rip(g, t, base, u):
    """The two flaps tear away and slide off left and right, turning a little."""
    im = base.copy(); left, right = slit_edges(710)
    for side, edge in ((-1, left), (1, right)):
        m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0 if side < 0 else W, 0)] + edge + [(0 if side < 0 else W, H)], fill=255)
        half = g['sheet'].copy(); half.putalpha(m)
        put(im, C.shadow(half, (side * 10, 16), 14, 110), (540 + side * 1100 * ease(u), 960 + 200 * u * u), 1, -side * 14 * u)
    return im

def stage_count_15(g, t):
    """2: the kitchen timer winds down; dropping in / 3 2 1 (the numbers arrive one at a time)."""
    jolt = sum(9 * math.exp(-(t - t0) * 9) * math.sin((t - t0) * 45) for t0 in (2.7, 3.05, 3.4) if t > t0)
    im = g['stage'].copy(); put(im, g['timer'], (540 + jolt, 1200), back_out(seg(t, 2.4, 2.7), 1.5), lerp(-120, 0, ease(seg(t, 2.6, 4.2))) + jolt)
    pop(im, g['dropping'], t, 2.5, (540, 360))
    for i, t0 in enumerate((2.7, 3.05, 3.4)):
        if t >= t0: put(im, g['digits'][i], (300 + 240 * i, 640), back_out(seg(t, t0, t0 + 0.25), 2.6), (-6, 4, -3)[i])
    return im

def stage_close_15(g, t):
    """4: close-up one on a clean photo card that settles onto the stage."""
    im = g['stage'].copy(); v = g['c']['close1'].at(t - 6.8)                         # the same clean photo card as the opening drop (her note)
    put(im, card(v, 760, 980, 18), (540, lerp(1150, 1060, ease(seg(t, 6.8, 7.2)))), back_out(seg(t, 6.8, 7.1), 1.4), lerp(-8, 3, ease(seg(t, 6.8, 7.2))))
    pop(im, g['d1'], t, 7.0, (540, 380), -2)
    return im

def stage_lap_15(g, t):
    """5: the laptop standing on the stage, its screen close-up two (one video slot)."""
    im = g['stage'].copy(); sw, sh = P.screen_size(LAPTOP, g['lap_w'])
    put(im, P.on_screen(LAPTOP, g['lap_w'], g['c']['close2'].at(t - 8.8, (sw, sh))), (540, lerp(2400, 1120, back_out(seg(t, 8.8, 9.15), 1.2))), 1)
    pop(im, g['d2'], t, 9.1, (540, 420), -2)
    return im

def stage_date_15(g, t):
    """7: the ticket stub drops in: out / [date], one underline under the date (the only time the date shows)."""
    im = g['stage'].copy(); put(im, g['planner'], (540, lerp(2400, 900, back_out(seg(t, 12.8, 13.1), 1.2))), 1, -3)   # her note: a planner behind it
    doodle_on(im, t, 13.2, g['d_tick'], (680, 690), -3)                                 # the drop day ticked on the planner
    k = back_out(seg(t, 13.0, 13.35), 1.4); put(im, g['stub'], (540, lerp(-400, 1300, k)), 1, lerp(-30, -4, k))
    doodle_on(im, t, 13.6, g['d_ring'], (540 + 0.14 * 900, 1300 + 62), -4)
    return im

LAND15 = 0.45                                                     # when the drop lands (the shot guide asks buyers to match it)

def subject_mask(clip, t):
    """The cut-out mask of a stand-in clip's frame at story time t (build/clip_masks.py), or None if not made yet."""
    import motion_b2 as _M
    real = t * (P.SLOW if getattr(_M.Clip, '_slowed', False) else 1); i = min(len(clip.fs) - 1, max(0, int(real * 30)))
    f = clip.fs[i].parent / 'mask' / clip.fs[i].with_suffix('.png').name
    if not f.exists(): return None
    m = Image.open(f).convert('L').point(lambda v: 255 if v > 50 else 0)              # solid subject: see-through bristles filled in
    return m.filter(ImageFilter.MaxFilter(11)).filter(ImageFilter.MinFilter(9)).filter(ImageFilter.GaussianBlur(1.5))

def drop_shot_15(g, t):
    """1 (her note): the video is FULL screen and the product in it is lifted onto its own layer, so the drop sits
    between them: the full-frame clip, then ONE dust cloud and new / drop, then the cut-out product on top. Speed lines
    while it falls, a shake on the landing. The stand-in fakes the fall by dropping the whole frame in."""
    c = g['c']; v = c['prod'].at(t); m = subject_mask(c['prod'], t); fall = back_out(seg(t, 0.0, LAND15), 1.25)
    shake = 18 * math.exp(-(t - LAND15) * 8) * math.sin((t - LAND15) * 48) if t > LAND15 else 0
    z = lerp(1.38, 1.05, fall); vw, vh = int(W * z), int(H * z)
    x0 = max(W - vw, min(0, int((W - vw) / 2 + shake))); y0 = max(H - vh, min(0, int((H - vh) / 2 - 300 * (1 - fall) + shake * 0.5)))
    def placed(layer):
        out = Image.new('RGBA', (W, H), (0, 0, 0, 0)); out.alpha_composite(layer.resize((vw, vh), Image.BILINEAR), (x0, y0)); return out
    im = Image.new('RGBA', (W, H), (0, 0, 0, 255)); im.alpha_composite(placed(v))
    if t >= LAND15:                                               # ONE dust cloud, behind the product
        q = seg(t, LAND15, LAND15 + 1.0)
        if q < 1: put(im, g['dust_big'], (540, 1050 - 200 * ease(q)), 0.9 + 1.4 * ease(q), 0, min(1, 2.0 * (1 - q)) ** 1.1)
    for word, xw, t0 in (('new', 255, 0.0), ('drop', 785, 0.05)):   # new / drop fall and land behind the product
        k = back_out(seg(t, t0, LAND15), 1.4); put(im, g['drop_w'][word], (xw, lerp(300, 900, k)), 1.0, (-4, 3)[word == 'drop'])
    if m is not None:                                             # the product, cut out of the same frame, on top
        sub = v.copy(); sub.putalpha(m); im.alpha_composite(placed(sub))
    if t < LAND15 + 0.05:
        for i, dx in enumerate((-160, 0, 160)):
            put(im, g['speed'], (540 + dx, 260 + 300 * seg(t, 0, LAND15) - (i % 2) * 70), 1, 90, 1 - seg(t, LAND15 - 0.08, LAND15 + 0.05))
    return im

def frame_15(g, t):
    c = g['c']
    if t < 2.4:                                                   # 1: under the sheet, already torn open down the middle
        # her idea: the hook is in the buyer's own video, something falling into the shot (their boxed or wrapped product
        # dropping onto a table, landing about 0.45 s in, lower middle); the template adds speed lines, a camera shake on
        # the landing and puffs of dust. The stand-in fakes the fall by dropping the frame in.
        im = drop_shot_15(g, t)
        pop(im, g['hook'], t, 0.7, (540, 300), -2)
        if t > 2.1: im = swipe(im, stage_count_15(g, t), seg(t, 2.1, 2.4))
        return im
    if t < 4.6:
        im = stage_count_15(g, t)
        if t > 4.3: im = swipe(im, covered(g, t, c['prod'].at(t - 4.6 + 2.4)), seg(t, 4.3, 4.6))
        return im
    if t < 6.8:                                                   # 3: the flaps rip away: the reveal; finally. with one burst behind the name
        base = c['prod'].at(t - 4.6 + 2.4); u = seg(t, 4.9, 5.35); z = lerp(1.15, 1.0, ease(seg(t, 4.95, 5.6)))
        if t >= 4.9 and z > 1.001: base = ImageOps.fit(base, (int(W * z), int(H * z))).crop((int((W * z - W) / 2), int((H * z - H) / 2), int((W * z - W) / 2) + W, int((H * z - H) / 2) + H))
        im = covered(g, t, base) if t < 4.9 else (rip(g, t, base, u) if u < 1 else base.copy())
        fl = 1 - seg(t, 4.95, 5.15)
        if t >= 4.95 and fl > 0: im = Image.blend(im, Image.new('RGBA', (W, H), (255, 255, 255, 255)), 0.55 * fl)   # a quick flash on the rip
        if t >= 5.7: put(im, g['burst'], (540, 600), 0.9 + 0.1 * back_out(seg(t, 5.7, 6.0), 1.5))   # behind the name box: no ray crosses a letter
        pop(im, g['finally'], t, 5.3, (540, 420)); pop(im, g['name'], t, 5.7, (540, 600), -2)
        if t > 6.5: im = swipe(im, stage_close_15(g, t), seg(t, 6.5, 6.8))
        return im
    if t < 8.8:
        im = stage_close_15(g, t)
        if t > 8.5: im = swipe(im, stage_lap_15(g, t), seg(t, 8.5, 8.8))
        return im
    if t < 10.8:
        im = stage_lap_15(g, t)
        if t > 10.5: im = swipe(im, c['close3'].at(0), seg(t, 10.5, 10.8))
        return im
    if t < 12.8:                                                  # 6: detail three, full frame; the NEW sticker; one arrow toward the centre
        im = c['close3'].at(t - 10.8); pop(im, g['d3'], t, 10.9, (540, 330), -2)
        doodle_on(im, t, 11.2, g['d_arrow'], (330, 470), 0)
        if t > 12.5: im = swipe(im, stage_date_15(g, t), seg(t, 12.5, 12.8))
        return im
    if t < 14.8:
        im = stage_date_15(g, t)
        if t > 14.5: im = swipe(im, c['use'].at(0), seg(t, 14.5, 14.8))
        return im
    im = c['use'].at(t - 14.8)                                                       # 8: in use (no sticker: it looked like the keyword pill, her note)
    if t >= 16.6: P.sandwich(im, t, 16.7, (540, 1050), g['shop'], g['comment'], g['kw'])                             # 9: the CTA
    return im

SETUP['15'] = setup_15; FRAME['15'] = frame_15; SECS['15'] = 19.2; DIRS['15'] = '15-new-drop-reveal'


def main():
    tid = sys.argv[1]; g = SETUP[tid](); out = S.E.PACK / DIRS[tid] / 'preview'
    if len(sys.argv) > 2:
        ims = [FRAME[tid](g, float(x)).convert('RGB') for x in sys.argv[2:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render(tid, P.slowed(lambda t: FRAME[tid](g, t)), SECS[tid] * P.SLOW, out)

if __name__ == '__main__':
    main()
