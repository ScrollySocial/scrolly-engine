"""#09, #10 and #12, round 2 after her 17 notes (2026-10-18) and the "Scene structure" rules (FRAMEWORK.md):
- readable words: solid colour on a solid pill or with a thick white edge (play.pill / play.big_text); no
  pattern-filled lettering, no thin serif over busy footage
- a neutral colour story (cream, stone, ink, kraft) plus ONE accent per template that buyers change to their brand;
  never the same pattern on an object and right behind it; plain white rims on the round clip windows
- three different openings (talking head / a kraft stage / a diagonal split), not the fall layout
- 7 to 8 scenes each (a new one every 1.5 to 2 s), two home bases (the buyer's video and one graphic stage that comes
  back with a new setup), a designed change every time, one element carried across, interplay with the person
- doodles only with a job (an arrow AT something, an underline under the key word, a burst FROM the bell)
Stand-in footage (her July clips; #09's talking head is Mercedes).
Usage: python build/story4.py 09 [seconds ...]  ->  NN-.../preview/motion-test.mp4  (or a test sheet)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
from collage_kit import doodle, doodle_on, raw
from collage_motion import still, video, tiles
from motion_b2 import Clip, put, pop, camera, render, circle_mask, ease, back_out, seg, lerp, lerp2, clamp, W, H, INK, WHITE, CREAM

N = P.NEUTRAL; INKC, STONE, CRM, PAPER = N['ink'], N['stone'], N['cream'], N['paper']
DIRS = {'09': '09-who-its-for', '10': '10-three-people-to-gift-it-to', '12': '12-your-order-just-arrived'}

def bg(name, folder='images', crop=None):
    im = raw(folder, name, crop) if crop else S.raw(folder, name); return ImageOps.fit(im, (W, H), Image.LANCZOS).convert('RGBA')

def pattern_bg(kind, dark, light, scale=0.6):
    m = P._pattern_mask(kind, (W, H), scale); im = Image.new('RGBA', (W, H), light + (255,)); lay = Image.new('RGBA', (W, H), dark + (0,)); lay.putalpha(m); im.alpha_composite(lay); return im

def roundwin(clip_im, d, rim=WHITE):
    """A clip in a round window with a plain rim (no repeated pattern on the rims: her note)."""
    out = Image.new('RGBA', (d + 36, d + 36), (0, 0, 0, 0)); ring = Image.new('RGBA', out.size, rim + (255,))
    ring.putalpha(circle_mask(out.size, (out.width / 2, out.height / 2), d / 2 + 16, 1)); out.alpha_composite(ring)
    v = ImageOps.fit(clip_im, (d, d)); v.putalpha(circle_mask((d, d), (d / 2, d / 2), d / 2, 1)); out.alpha_composite(v, (18, 18))
    return C.shadow(out, (8, 14), 14, 100)

def card(clip_im, w, h, border=16, rot=0):
    c = Image.new('RGBA', (w + 2 * border, h + 2 * border), WHITE + (255,)); c.alpha_composite(ImageOps.fit(clip_im, (w, h)), (border, border))
    return C.shadow(c, (8, 14), 14, 110)

def swipe(old, new, u, direction=1):
    """Motion-blur swipe: the old scene slides out and the new one in, smeared sideways mid-move."""
    if u <= 0: return old
    if u >= 1: return new
    dx = int(direction * ease(u) * W); out = Image.new('RGBA', (W, H))
    out.alpha_composite(old, (-dx, 0)); out.alpha_composite(new, (direction * W - dx, 0))
    k = int(1 + 24 * math.sin(math.pi * u))                       # horizontal smear, strongest mid-swipe
    return out.resize((max(1, W // k), H), Image.BILINEAR).resize((W, H), Image.BILINEAR) if k > 2 else out

def diagonal(old, new, u):
    """Diagonal wipe from the right (Lisa's scene 1)."""
    if u <= 0: return old
    if u >= 1: return new
    x = lerp(W + H * 0.4, -H * 0.4, ease(u)); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(x, 0), (W + 2000, 0), (W + 2000, H), (x + H * 0.4, H)], fill=255)
    out = old.copy(); out.paste(new, (0, 0), m); return out

def pan(scene_tall, t, t0, t1, y0, y1):
    """Prezi pan down a tall graphic stage."""
    y = lerp(y0, y1, ease(seg(t, t0, t1))); return scene_tall.crop((0, int(y), W, int(y) + H))

# ======================================================================================================================
# 09 Who it's for. Accent: terracotta (buyers change it). Home bases: her talking head + a notebook-paper stage.
#  1 0.0  her, a butterfly flutters in and lands on her head; "if you [always run late]" on a black pill
#  2 1.6  "THIS IS FOR YOU" big over her (accent, white edge); swipe to the stage
#  3 3.0  stage: the problem in B&W inside a torn window; "[you lose your keys. again.]" pill; one crumpled paper rolls in
#  4 4.5  swap in place: the torn window becomes the product clip in colour; MEET [PRODUCT NAME]; burst on the swap
#  5 5.9  pan down the paper: the product floats up on a string; arrow from MEET to it
#  6 7.4  back to her: sticky notes pinned one at a time: for the [6am crowd] / for the [dog mums]
#  7 9.4  the butterflies gather in a circle round her head (the first one is carried in from scene 1) into a crown
#  8 10.5 CTA word sandwich: "sound like you?" / COMMENT / "[KEYWORD]"; underline under COMMENT
# ======================================================================================================================
TERRA = (196, 92, 62)

def setup_09():
    g = {'c': {'me': Clip('IMG_1469', 1.0, 6.0), 'me2': Clip('IMG_1470', 1.0, 6.0), 'problem': Clip('IMG_1430', 1.0), 'product': Clip('IMG_1381', 1.0)}}
    g['paper'] = bg('Blank Ruled Notebook Paper.png', 'physical')
    tall = Image.new('RGBA', (W, 2 * H)); tall.alpha_composite(g['paper'], (0, 0)); tall.alpha_composite(g['paper'], (0, H)); g['tall'] = tall
    g['bf'] = [P.thing(P.BUTTERFLIES[i % 3], 220, ('stripes', 'dots', 'smalldots')[i % 3], (TERRA, INKC, STONE)[i % 3], scale=0.3, strength=0.75, seed=i, edge=6) for i in range(6)]
    g['ball'] = P.thing('Crumpled cream paper ball-58.png', 220, 'stripes', STONE, scale=0.3, strength=0.7)
    g['gift'] = P.thing('Kraft paper cube gift with twine-38.png', 260, 'dots', TERRA, scale=0.4, label=P.sticker('FOR YOU', 34, INKC))
    g['habit'] = P.pill('if you [always run late]', 64, INKC, WHITE); g['this'] = P.big_text('THIS IS', 150, TERRA); g['foryou'] = P.big_text('FOR YOU', 190, TERRA)
    g['problem'] = P.pill('[you lose your keys. again.]', 58, INKC, WHITE); g['meet'] = P.big_text('MEET', 170, TERRA); g['prod'] = P.pill('[PRODUCT NAME]', 66, TERRA, WHITE)
    g['notes'] = [P.sticky('for the\n[6am crowd]', 420, seed=1, pin='pin-head-black'), P.sticky('for the\n[dog mums]', 420, seed=2, pin='pin-head-cream')]
    g['sound'] = P.pill('sound like you?', 62, INKC, WHITE); g['comment'] = P.big_text('COMMENT', 200, TERRA); g['kw'] = P.pill('"[KEYWORD]"', 66, WHITE, INKC)
    g['d_burst'] = doodle('burst', 1, 300, TERRA); g['d_arrow'] = doodle('arrow', 9, 230, INKC); g['d_under'] = doodle('under', 4, 560, INKC)
    return g

def frame_09(g, t):
    c = g['c']; cx, cy, rx, ry = P.HEAD; top = (cx, cy - ry - 90)
    if t < 3.0:                                                   # 1-2: her; the butterfly lands; THIS IS FOR YOU; swipe out
        im = c['me'].at(t)
        u = ease(seg(t, 0.2, 1.3)); path = (lerp(-150, top[0] + 30, u), lerp(1100, top[1] - 40, u) - 260 * math.sin(math.pi * u))
        P.butterfly(im, g['bf'][0], t, path, -20 + 20 * u, flap=1 - 0.7 * seg(t, 1.3, 1.6))
        pop(im, g['habit'], t, 0.1, (540, 300), -2, out=1.5)
        pop(im, g['this'], t, 1.6, (400, 1250), -4); pop(im, g['foryou'], t, 1.75, (560, 1420), 3); doodle_on(im, t, 2.0, g['d_under'], (560, 1560), -2)
        if t > 2.7: im = swipe(im, stage_09(g, t, 0), seg(t, 2.7, 3.0))
        return im
    if t < 5.9: return stage_09(g, t, 0)
    if t < 7.4:                                                   # 5: pan down the paper; the product floats up on a string
        im = g['paper'].copy()                                      # the balloon rises as the stage changes (no empty frame)
        P.balloon(im, roundwin(c['product'].at(t - 5.9, (520, 520)), 520), t, (560, 860), (560, 1900), 0, rise=(5.9, 6.4, 2400))
        P.balloon(im, g['gift'], t, (880, 1250), (580, 1900), 1.7, rise=(6.1, 6.6, 2400))
        pop(im, g['meet'], t, 6.2, (280, 1320), -6); pop(im, g['prod'], t, 6.35, (330, 1460), -2)
        doodle_on(im, t, 6.6, g['d_arrow'], (320, 1080), -60)
        if t > 7.1: im = swipe(im, c['me'].at(t - 7.4 + 3.0), seg(t, 7.1, 7.4), -1)
        return im
    if t < 9.4:                                                   # 6: back to her; sticky notes pinned one at a time
        im = c['me'].at(t - 7.4 + 3.0); P.butterfly(im, g['bf'][0], t, (top[0] + 30, top[1] - 40), 0, flap=0.3)   # carried on her head
        pop(im, g['notes'][0], t, 7.6, (250, 1320), -8); pop(im, g['notes'][1], t, 8.3, (830, 1180), 7)
        return im
    im = c['me2'].at(t - 9.4)                                     # 7-8: butterflies gather in a circle into a crown; CTA
    for i, (pt, bf) in enumerate(zip(P.crown_points(6, 170), g['bf'])):
        a0 = i * math.pi / 3 + t * 2; orbit = (540 + 430 * math.cos(a0), 800 + 430 * math.sin(a0))
        u = ease(seg(t, 9.6 + i * 0.08, 10.4 + i * 0.08)); P.butterfly(im, bf, t, lerp2(orbit, pt, u), (i - 2.5) * 10, flap=1 - 0.6 * u, phase=i)
    pop(im, g['sound'], t, 10.5, (540, 1180), -2); pop(im, g['comment'], t, 10.65, (540, 1340), -3); pop(im, g['kw'], t, 10.9, (540, 1480), 2)
    return im

def stage_09(g, t, _):
    """3-4: the notebook stage. The problem in B&W in a torn window, then swapped in place for the product in colour."""
    c = g['c']; im = g['paper'].copy(); sw = ease(seg(t, 4.5, 4.8))
    v = c['problem'].at(max(0, t - 3.0), (780, 900)); v = ImageOps.grayscale(v).convert('RGBA') if sw < 0.5 else c['product'].at(t - 4.5, (780, 900))
    k = 1 - 0.15 * math.sin(math.pi * sw); v.putalpha(C.torn_mask((780, 900), 5, 18, 'tblr')); put(im, C.shadow(v, (10, 16), 14, 110), (540, 980), k, -2)
    if t < 4.5:
        pop(im, g['problem'], t, 3.1, (540, 380), -2); put(im, g['ball'], (lerp(-200, 850, ease(seg(t, 3.4, 4.0))), 1530), 1, t * 200)
    else:
        doodle_on(im, t, 4.55, g['d_burst'], (540, 980), 0, 5.2)
        pop(im, g['meet'], t, 4.8, (330, 360), -5); pop(im, g['prod'], t, 4.95, (560, 500), -2)
    return im

# ======================================================================================================================
# 10 Three people to gift it to. Accent: red (buyers change it). Neutrals: kraft, cream, ink, stone. Home bases: a
# kraft-paper stage and the buyer's video.
#  1 0.0  stage: a red-dotted gift with a ? sticker drops onto plain cream paper; "stuck on a" pill + GIFT? big
#  2 1.6  pan down the kraft stage: the usual gifts (ink-striped tea set, stone-dotted clock, ink-dotted mug)
#  3 2.6  each crossed out in turn (her X has a job)
#  4 4.0  swap in place: the three gifts gather into one round window: the product; "works for ALL 3"
#  5 5.4  the product clip full frame
#  6 6.8  people float up one at a time as balloons (plain white rims, thicker strings), a name pill on each
#  7 10.0 CTA (she loved it): the balloons rise, the gift with FOR YOU, COMMENT, keyword, gift-wrap pill; plain
#         cream + stone stripes behind (never dots behind the dotted box)
# ======================================================================================================================
RED = (200, 50, 44)

def setup_10():
    g = {'c': {'gift': Clip('IMG_1454', 1.0), 'prod': Clip('IMG_1456', 1.0), 'p1': Clip('IMG_1381', 1.0), 'p2': Clip('IMG_1391', 1.0), 'p3': Clip('IMG_1417', 0.5)}}
    g['kraft'] = bg('Partly unrolled kraft paper roll-14.png', crop=(0.5, 0.56, 0.74, 0.7)); g['cream'] = Image.new('RGBA', (W, H), CRM + (255,))
    st = pattern_bg('stripes', STONE, CRM, 0.5); half = Image.new('RGBA', (W, H)); half.alpha_composite(g['cream']); half.alpha_composite(st.crop((540, 0, W, H)), (540, 0)); g['cta_bg'] = half
    tall = Image.new('RGBA', (W, 2 * H)); tall.alpha_composite(g['cream'], (0, 0)); tall.alpha_composite(g['kraft'], (0, H)); g['tall'] = tall
    g['box'] = P.thing('Kraft paper cube gift with twine-38.png', 400, 'dots', RED, scale=0.4, label=P.sticker('?', 70, INKC, WHITE, 'circle'))
    g['box2'] = P.thing('Kraft paper cube gift with twine-38.png', 420, 'dots', RED, scale=0.4, label=P.sticker('FOR YOU', 40, INKC))
    g['usual'] = [P.thing('Vintage Rose Porcelain Tea Set.png', 440, 'stripes', INKC, scale=0.35, strength=0.6),
                  P.thing('Classic Cream Twin-Bell Alarm Clock-185.png', 320, 'dots', STONE, scale=0.45, strength=0.8),
                  P.thing('Warm white ceramic coffee mug-140.png', 320, 'smalldots', INKC, scale=0.4, strength=0.8)]
    g['x'] = [doodle('tick', 3 + i, 300, RED) for i in range(3)]
    g['stuck'] = P.pill('stuck on a', 70, INKC, WHITE); g['giftw'] = P.big_text('GIFT?', 260, RED)
    g['imp'] = P.big_text('THE USUAL?', 140, INKC); g['works'] = P.pill('this one works for', 62, INKC, WHITE); g['all3'] = P.big_text('ALL 3', 220, RED)
    g['names'] = [P.pill(n, 52, WHITE, INKC) for n in ('[YOUR FRIEND]', '[YOUR MUM]', '[YOUR DAD]')]
    g['comment'] = P.big_text('COMMENT', 170, RED); g['kw'] = P.pill('"[KEYWORD]"', 66, INKC, WHITE); g['wrap'] = P.pill('[gift wrap available]', 52, WHITE, INKC)
    g['d_under'] = doodle('under', 4, 560, INKC); g['d_arrow'] = doodle('arrow', 9, 220, INKC)
    return g

def frame_10(g, t):
    c = g['c']
    if t < 4.0:                                                   # 1-3: the gift drops; pan down to the usual gifts, crossed out
        if t < 1.6:
            im = g['cream'].copy(); put(im, card(c['gift'].at(t, (640, 760)), 640, 760), (470, 1100), 1, -4)   # the buyer's gift clip, as a photo
            b = back_out(seg(t, 0.2, 0.6), 2.0); put(im, g['box'], (800, lerp(-400, 1420, b)), 1, 4 * math.sin(t * 5))   # the ? gift lands on its corner
            pop(im, g['stuck'], t, 0.1, (420, 300), -3); pop(im, g['giftw'], t, 0.35, (540, 480), -3); doodle_on(im, t, 0.8, g['d_under'], (540, 640), -2)
            return im
        im = pan(g['tall'], t, 1.6, 2.4, 0, H).copy()
        if t >= 2.2:
            for i, (obj, xy) in enumerate(zip(g['usual'], ((300, 600), (800, 1000), (330, 1450)))):
                pop(im, obj, t, 2.2 + i * 0.1, xy, (-6, 5, -4)[i]); doodle_on(im, t, 2.7 + i * 0.4, g['x'][i], xy, 0)
            pop(im, g['imp'], t, 2.4, (600, 320), -2)
        return im
    if t < 5.4:                                                   # 4: the three gather into one round window: the product
        im = g['kraft'].copy(); u = ease(seg(t, 4.0, 4.5))
        for i, (obj, xy) in enumerate(zip(g['usual'], ((300, 600), (800, 1000), (330, 1450)))):
            if u < 1: put(im, obj, lerp2(xy, (540, 900), u), 1 - u, (-6, 5, -4)[i] + 200 * u)
        k = back_out(seg(t, 4.4, 4.75), 1.6)
        if k > 0: put(im, roundwin(c['prod'].at(t - 4.4, (620, 620)), 620), (540, 900), k)
        pop(im, g['works'], t, 4.7, (540, 1330), -2); pop(im, g['all3'], t, 4.85, (540, 1480), 3); doodle_on(im, t, 5.0, g['d_arrow'], (860, 1300), -110)
        return im
    if t < 6.8:                                                   # 5: the product full frame (the window grew)
        im = c['prod'].at(t - 4.4); return im
    im = g['cta_bg'].copy()                                       # 6-7: people float up as balloons; CTA
    up = ease(seg(t, 10.0, 10.5)); anchor = lerp2((540, 2000), (540, 1500), ease(seg(t, 10.0, 10.5)))
    for i, (clip, xy0, xy1) in enumerate(((c['p1'], (300, 520), (200, 380)), (c['p2'], (780, 760), (540, 330)), (c['p3'], (330, 1080), (880, 380)))):
        xy = lerp2(xy0, xy1, up); d = int(380 - 80 * up)
        balloon(im, roundwin(clip.at(t - 6.8, (d, d)), d), t, xy, (anchor[0] + (i - 1) * 40, anchor[1]), i * 1.7, rise=(6.9 + i * 1.0, 7.5 + i * 1.0, 2400))
        if t < 10.0: put(im, g['names'][i], (xy[0], xy[1] + 250), back_out(seg(t, 7.3 + i, 7.5 + i)), (-4, 3, -3)[i])
    if t >= 10.0:
        pop(im, g['box2'], t, 10.0, (540, 1500), 0, wiggle=2)
        pop(im, g['comment'], t, 10.3, (540, 900), -3); pop(im, g['kw'], t, 10.55, (540, 1060), 2); pop(im, g['wrap'], t, 10.75, (540, 1170), -2)
    return im

def balloon(img, item, t, c, anchor, phase=0.0, rise=None):
    """P.balloon with a thicker, darker string (her note: make the lines thicker)."""
    x, y = c
    if rise: y = lerp(rise[2], c[1], ease(seg(t, rise[0], rise[1])))
    bx, by = x + 14 * math.sin(t * 1.6 + phase), y + 18 * math.sin(t * 2.1 + phase)
    bottom = (bx, by + item.height / 2 - 20); mid = ((bottom[0] + anchor[0]) / 2 + 30 * math.sin(t * 1.3 + phase), (bottom[1] + anchor[1]) / 2)
    pts = [(lerp(lerp(bottom[0], mid[0], u), lerp(mid[0], anchor[0], u), u), lerp(lerp(bottom[1], mid[1], u), lerp(mid[1], anchor[1], u), u)) for u in [i / 16 for i in range(17)]]
    ImageDraw.Draw(img).line(pts, fill=INKC + (255,), width=9)
    put(img, item, (bx, by), 1, 6 * math.sin(t * 1.4 + phase))

# ======================================================================================================================
# 12 Your order just arrived. Accent: cobalt (buyers change it). Neutrals: concrete, cream, kraft, ink. Home bases:
# the buyer's video and a concrete stage.
#  1 0.0  diagonal split: the door clip above the line; on the concrete below, the real doorbell (button showing),
#         a burst coming FROM it, a DING! pill beside it; "POV: your [product] just arrived" + IT'S HERE
#  2 1.8  diagonal wipe to the stage: the tracking clip fitted INTO the TV screen; "[out for delivery]" pill
#  3 3.3  swap in place: the TV becomes the mailbox, flag up: [delivered!]
#  4 4.5  three sheets of tissue (cream, stone, cobalt) cover the unboxing clip, ONE word each: THE / WAIT / IS OVER;
#         each peels off on its word
#  5 7.0  the unboxing, full frame; an arrow at the product
#  6 8.4  in use, full frame; a starred kraft tag swings in with the packaging detail written ON it
#  7 9.9  CTA: the clip on the front of a kraft mailer on concrete; the doorbell carried back in; GET YOURS + keyword
# ======================================================================================================================
COB = (40, 80, 190)

def setup_12():
    g = {'c': {'door': Clip('IMG_1454', 1.0), 'track': Clip('IMG_1385', 1.0), 'unbox': Clip('IMG_1456', 1.0), 'use': Clip('IMG_1381', 1.0), 'cta': Clip('IMG_1454', 3.0)}}
    g['concrete'] = bg('Light gray concrete mineral texture-4.png'); tissue = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))
    g['tissues'] = [ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tissue), tuple(int(v * 0.8) for v in col), col), (W, H)).convert('RGBA') for col in (CRM, STONE, (150, 172, 222))]
    g['bell'] = P.die_cut(P.raw_cut('Vintage brass doorbell with ivory button-43.png', 250), 8)       # untouched: the button must show
    g['ding'] = P.pill('DING!', 56, COB, WHITE); g['mailbox'] = P.thing('Vintage Mailbox with Raised Red Flag-20.png', 760, 'stripes', STONE, scale=0.5, strength=0.7)
    g['tag'] = P.thing('Blank kraft hang tag with twine-116.png', 340, None, None, stars=2)
    tg = g['tag'].copy(); ImageDraw.Draw(tg).multiline_text((tg.width / 2, tg.height * 0.66), '[every order\ncomes gift-\nwrapped]', font=S.F(P.ANTON, 40), fill=INKC, anchor='mm', align='center'); g['tag_w'] = tg
    g['mailer'] = P.raw_cut('Sealed kraft padded mailer-39.png', 900)
    g['pov'] = P.pill('POV: your [product] just arrived', 54, INKC, WHITE); g['here'] = P.big_text("IT'S HERE", 200, COB)
    g['ofd'] = P.pill('[out for delivery...]', 56, INKC, WHITE); g['delivered'] = P.pill('[delivered!]', 70, COB, WHITE); g['words'] = [P.big_text(w, 260, INKC if i < 2 else WHITE, WHITE if i < 2 else INKC) for i, w in enumerate(('THE', 'WAIT', 'IS OVER'))]
    g['get'] = P.big_text('GET YOURS', 170, COB); g['kw'] = P.pill('comment "[KEYWORD]"', 60, INKC, WHITE)
    g['d_burst'] = doodle('burst', 1, 330, COB); g['d_arrow'] = doodle('arrow', 9, 240, WHITE); g['d_under'] = doodle('under', 4, 600, INKC)
    return g

def frame_12(g, t):
    c = g['c']
    if t < 2.1:                                                   # 1: diagonal split; the doorbell rings
        im = g['concrete'].copy(); v = c['door'].at(t); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W, 0), (W, 1050), (0, 1500)], fill=255); im.paste(v, (0, 0), m)
        ImageDraw.Draw(im).line([(0, 1500), (W, 1050)], fill=WHITE + (255,), width=12)
        if t > 0.5: doodle_on(im, t, 0.5, g['d_burst'], (820, 1560), 0, 1.4)
        press = 1 - 0.1 * math.sin(math.pi * seg(t, 0.5, 0.7)); put(im, g['bell'], (820, 1560), back_out(seg(t, 0.1, 0.4)) * press)
        pop(im, g['ding'], t, 0.6, (500, 1660), -6, out=1.6)
        pop(im, g['pov'], t, 0.2, (540, 300), -2); pop(im, g['here'], t, 0.5, (540, 470), -3)
        if t > 1.8: im = diagonal(im, stage_12(g, t), seg(t, 1.8, 2.1))
        return im
    if t < 4.5: return stage_12(g, t)
    if t < 7.0:                                                   # 4: THE / WAIT / IS OVER on three tissue sheets, peeling off
        im = c['unbox'].at(t - 4.5)
        for i in (2, 1, 0):
            t0 = 5.0 + i * 0.65; u = ease(seg(t, t0, t0 + 0.32))          # each word holds before its sheet peels
            if u >= 1: continue
            sh = g['tissues'][i].copy(); put(sh, g['words'][i], (540, 960), 1, (-3, 2, -2)[i])
            if u <= 0: im.alpha_composite(sh)
            else: put(im, C.shadow(sh, (16, 24), 18, 120), (540 + (1 if i % 2 == 0 else -1) * 1100 * u, 960 + 1400 * u * u), 1, (1 if i % 2 == 0 else -1) * 25 * u)
        return im
    if t < 8.4:                                                   # 5: the unboxing; an arrow at the product
        im = c['unbox'].at(t - 4.5); doodle_on(im, t, 7.2, g['d_arrow'], (760, 820), 200); return im
    if t < 9.9:                                                   # 6: in use; the tag swings in with the detail on it
        im = c['use'].at(t - 8.4); sw = 14 * math.sin(t * 3) * (1 - seg(t, 8.7, 9.7)); pop(im, g['tag_w'], t, 8.6, (790, 1180), sw); return im
    im = g['concrete'].copy()                                     # 7: CTA on the mailer; the doorbell carried back in
    m = g['mailer'].copy(); v = c['cta'].at(t - 9.9, (int(m.width * 0.7), int(m.height * 0.6))); m.alpha_composite(v, (int(m.width * 0.15), int(m.height * 0.22)))
    pop(im, P.die_cut(m, 10), t, 9.9, (540, 1050), -3); pop(im, g['bell'], t, 10.1, (900, 1560), 6)
    pop(im, g['get'], t, 10.2, (540, 330), -3); doodle_on(im, t, 10.5, g['d_under'], (540, 450), -2); pop(im, g['kw'], t, 10.5, (540, 560), 2)
    return im

def stage_12(g, t):
    """2-3: the concrete stage: the tracking clip in the TV, then swapped in place for the mailbox."""
    c = g['c']; im = g['concrete'].copy(); sw = seg(t, 3.3, 3.6)
    if sw < 0.5: put(im, P.tv_with(c['track'].at(max(0, t - 1.8)), 860), (540, 960), 1 - sw * 0.6, -2)
    else: put(im, g['mailbox'], (540, 1000), back_out(seg(t, 3.45, 3.75), 1.8), 2)
    if t < 3.3: pop(im, g['ofd'], t, 2.2, (540, 1500), -2)
    else: pop(im, g['delivered'], t, 3.8, (540, 1450), -3)
    return im

SETUP = {'09': setup_09, '10': setup_10, '12': setup_12}; FRAME = {'09': frame_09, '10': frame_10, '12': frame_12}; SECS = {'09': 12.0, '10': 12.0, '12': 12.0}

def main():
    tid = sys.argv[1]; g = SETUP[tid](); fr = lambda t: FRAME[tid](g, t); out = S.E.PACK / DIRS[tid] / 'preview'
    if len(sys.argv) > 2:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[2:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render(tid, fr, SECS[tid], out)

if __name__ == '__main__':
    main()
