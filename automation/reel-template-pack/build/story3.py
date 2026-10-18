"""Three templates written story-first after the wireframe round failed (FRAMEWORK.md "READ FIRST: the 10 must-dos"):
#09 Who it's for, #10 Three people to gift it to, #12 Your order just arrived. Each beat (hook, problem, product, proof,
CTA) is its own scene idea with its own objects (no theme object); every object has play on it (build/play.py);
every frame is a collage; at least 3 doodles with a job; big fun lettering plus editable words.
Rough motion tests with stand-in footage (her July clips; #09's talking head is Mercedes).
Usage: python build/story3.py 09 [seconds ...]  ->  NN-.../preview/motion-test.mp4  (or a test sheet)
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import lettering_b2 as LB
import play as P
from collage_kit import doodle, doodle_on, raw
from collage_motion import still, video, tiles
from motion_b2 import Clip, put, pop, hero, draw_on, camera, render, circle_mask, ease, back_out, seg, lerp, lerp2, clamp, W, H, INK, WHITE, CREAM

ANTON = LB.FONT['anton']; SERIF = str(S.E.font_file('7580184437816675601'))
DIRS = {'09': '09-who-its-for', '10': '10-three-people-to-gift-it-to', '12': '12-your-order-just-arrived'}

def word(text, px, fill=('dots', (214, 52, 46)), edge=12, ink_edge=False):
    """Big built-in lettering: Anton caps filled with her pattern (or a real photo), a die-cut edge."""
    f = S.F(ANTON, px); l, t, r, b = f.getbbox(text); w, h = r - l + 40, b - t + 40
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((20 - l, 20 - t), text, font=f, fill=255)
    if fill[0] == 'dots': fl = LB.dots_fill(fill[1], CREAM, 0.7)((w, h), len(text))
    elif fill[0] == 'photo': fl = ImageOps.fit(fill[1], (w, h)).convert('RGBA')
    else: fl = Image.new('RGBA', (w, h), fill[1] + (255,))
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0)); fl.putalpha(m); out.alpha_composite(fl)
    if ink_edge:
        e = Image.new('RGBA', (w + 20, h + 20), INK + (0,)); mm = Image.new('L', (w + 20, h + 20), 0); mm.paste(m, (10, 10))
        e.putalpha(mm.filter(ImageFilter.MaxFilter(13))); e.alpha_composite(out, (10, 10)); out = e
    return P.die_cut(out, edge)

def line(text, px, color=INK, edge=WHITE, font=None):
    """A small line in the tall serif (her f2 pick) or Anton, with a thick edge so it reads over anything."""
    f = S.F(font or SERIF, px); im = Image.new('RGBA', (int(f.getlength(text) + 60), int(px * 1.6 + 30)), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((im.width / 2, im.height / 2), text, font=f, fill=color, anchor='mm', stroke_width=max(4, px // 12), stroke_fill=edge)
    return C.shadow(im, (3, 6), 6, 90)

def window(clip_im, d, rim=None, color=None):
    """A clip in a round window with a patterned rim (play on the shape)."""
    out = Image.new('RGBA', (d + 40, d + 40), (0, 0, 0, 0))
    ring = Image.new('RGBA', out.size, (255, 255, 255, 255)); ring.putalpha(circle_mask(out.size, (out.width / 2, out.height / 2), d / 2 + 18, 1))
    if rim:
        m = ImageChops.multiply(P._pattern_mask(rim, out.size, 0.35), ring.split()[3]); lay = Image.new('RGBA', out.size, color + (0,)); lay.putalpha(m); ring.alpha_composite(lay)
    out.alpha_composite(ring); v = clip_im.copy(); v.putalpha(circle_mask((d, d), (d / 2, d / 2), d / 2, 1)); out.alpha_composite(v, (20, 20))
    return C.shadow(out, (8, 14), 14, 100)

def pat_tile(kind, dark, light, scale=0.6):
    m = P._pattern_mask(kind, (900, 900), scale); im = Image.new('RGBA', (900, 900), light + (255,)); lay = Image.new('RGBA', (900, 900), dark + (0,)); lay.putalpha(m); im.alpha_composite(lay)
    return still(im, f'pt-{kind}-{dark}-{light}-{scale}')

def grey(im): return ImageOps.grayscale(im).convert('RGBA')

# ======================================================================================================================
# 09 Who it's for (12 s). Story: hook "If you [habit], this is for you" (a butterfly lands on your head) > problem
# (the everyday annoyance, B&W, crumpled paper swarming) > product (it floats up as a present on a string) > proof (for
# the [type one] / [type two], name tags) > CTA (the butterfly comes back with friends: a crown; "sound like you?").
# Palette from the clip: lilac and coral. Head interplay ships with the dashed head-outline guide layer.
# ======================================================================================================================
LILAC, CORAL, PLUM = (184, 160, 214), (232, 104, 92), (70, 44, 92)

def setup_09():
    g = {'c': {'me': Clip('IMG_1469', 1.0, 6.0), 'me2': Clip('IMG_1470', 1.0, 6.0), 'problem': Clip('IMG_1430', 1.0), 'product': Clip('IMG_1381', 1.0),
               'p1': Clip('IMG_1391', 1.0), 'p2': Clip('IMG_1460', 2.0)}}
    g['dots'] = pat_tile('dots', CORAL, CREAM); g['stripes'] = pat_tile('stripes', LILAC, CREAM, 0.5); g['checks'] = pat_tile('checks', PLUM, CREAM, 0.4)
    g['knit'] = still(raw('fall', 'Cream cable-knit wool texture-47.png'), 'knit09')
    g['bf'] = [P.thing(P.BUTTERFLIES[i % 3], 230, ('dots', 'stripes', 'smalldots')[i % 3], (CORAL, LILAC, PLUM)[i % 3], scale=0.3, strength=0.7, seed=i, edge=6) for i in range(6)]
    g['bf_big'] = P.thing(P.BUTTERFLIES[0], 300, 'dots', CORAL, scale=0.35, strength=0.7, edge=8)
    g['balls'] = [P.thing('Crumpled cream paper ball-58.png', 190 + 30 * (i % 3), ('stripes', 'dots', 'checks')[i % 3], (PLUM, CORAL, LILAC)[i % 3], scale=0.3, strength=0.7, seed=i, edge=6) for i in range(7)]
    g['gift'] = P.thing('Kraft paper cube gift with twine-38.png', 300, 'dots', CORAL, scale=0.4, label=P.sticker('FOR YOU', 34, CORAL))
    # name tags: white inside a coloured border, so the edge flood-fill keeps the white (the model drops it)
    g['tags'] = [P.die_cut(S.fitw(S.cut('images', n), 640), 8) for n in ('Blank red-bordered name tag sticker-28.png', 'Blank grass-green name tag sticker-30.png')]
    g['this'] = word('THIS IS', 150, ('dots', CORAL)); g['foryou'] = word('FOR YOU', 190, ('dots', CORAL))
    g['habit'] = line('if you [always run late]', 72, PLUM); g['meet'] = word('MEET', 150, ('solid', PLUM)); g['prod'] = line('[PRODUCT NAME]', 80, CORAL, WHITE, ANTON)
    g['problem'] = line('[you lose your keys. again.]', 70, INK); g['sound'] = word('SOUND LIKE YOU?', 120, ('dots', PLUM)); g['kw'] = line('comment "[KEYWORD]"', 76, CORAL)
    g['d_under'] = doodle('under', 4, 560, CORAL); g['d_burst'] = doodle('burst', 1, 220, WHITE); g['d_scrib'] = [doodle('scribble', 4, 200, CORAL), doodle('scribble', 3, 180, CORAL)]
    g['d_arrow'] = doodle('arrow', 9, 220, WHITE); g['d_spark'] = doodle('icon', 9, 140, WHITE); g['d_heart'] = doodle('icon', 2, 150, CORAL)
    return g

def bottom_band(g, t, t0, a, b, split=540):
    return [{'keys': [(t0, (0, 1920, split, 2400)), (t0 + 0.3, (0, 1500, split, 1920))], 'fill': g[a]}, {'keys': [(t0 + 0.05, (split, 1920, 1080, 2400)), (t0 + 0.35, (split, 1500, 1080, 1920))], 'fill': g[b]}]

def frame_09(g, t):
    c = g['c']; cx, cy, rx, ry = P.HEAD; top = (cx, cy - ry - 90)              # perched on top of the head
    if t < 2.4:                                                   # HOOK: the clip of you as a tile; a butterfly flutters in and lands on your head
        im = Image.new('RGBA', (W, H), CREAM + (255,))
        tiles(im, t, [{'keys': [(0, (0, 0, W, 1500))], 'fill': video(c['me'], 0)}] + bottom_band(g, t, -0.3, 'dots', 'stripes'))
        u = ease(seg(t, 0.2, 1.3)); path = (lerp(-150, top[0] + 30, u), lerp(1100, top[1] - 40, u) - 260 * math.sin(math.pi * u))
        P.butterfly(im, g['bf_big'], t, path, -20 + 20 * u, flap=1 - 0.7 * seg(t, 1.3, 1.6))
        doodle_on(im, t, 1.35, g['d_burst'], (top[0] + 230, top[1] - 60), 0, 2.2)
        pop(im, g['habit'], t, 0.1, (540, 270), -2, out=2.25)
        pop(im, g['this'], t, 0.5, (330, 1330), -4, out=2.25); pop(im, g['foryou'], t, 0.7, (560, 1470), 3, out=2.25)
        doodle_on(im, t, 1.0, g['d_under'], (560, 1600), -2, 2.25)
        if t > 2.1: im = strip_slice(im, grey(c['problem'].at(0)), seg(t, 2.1, 2.4))
        return im
    if t < 4.8:                                                   # PROBLEM: the annoyance in B&W in a torn window; crumpled paper swarms round it
        im = Image.new('RGBA', (W, H), CREAM + (255,))
        tiles(im, t, [{'keys': [(2.4, (0, 0, W, 760))], 'fill': g['checks']}, {'keys': [(2.4, (0, 760, W, H))], 'fill': g['knit']}])
        v = grey(c['problem'].at(t - 2.4, (820, 1000))); v.putalpha(C.torn_mask((820, 1000), 5, 18, 'tblr')); put(im, C.shadow(v, (10, 16), 14, 110), (540, 980))
        for i, b in enumerate(g['balls']):                       # the swarm of crumpled paper orbiting the problem
            a = t * 1.3 + i * 2 * math.pi / len(g['balls']); k = back_out(seg(t, 2.5 + i * 0.06, 2.8 + i * 0.06))
            put(im, b, (540 + 470 * math.cos(a), 980 + 600 * math.sin(a)), k, a * 30)
        pop(im, g['problem'], t, 2.6, (540, 330), -2)
        doodle_on(im, t, 2.9, g['d_scrib'][0], (880, 560), 0); doodle_on(im, t, 3.2, g['d_scrib'][1], (200, 1400), 0)
        if t > 4.5: put(im, g['bf_big'], (lerp(-200, 1300, seg(t, 4.5, 4.8)), 900), 1, 10)   # the butterfly sweeps through: the wipe
        return im
    if t < 7.0:                                                   # PRODUCT: it floats up as a present on a string, with the gift and a heart
        im = Image.new('RGBA', (W, H), CREAM + (255,))
        tiles(im, t, [{'keys': [(4.8, (0, 0, 540, H))], 'fill': g['stripes']}, {'keys': [(4.8, (540, 0, W, H))], 'fill': g['dots']}])
        P.balloon(im, window(c['product'].at(t - 4.8, (600, 600)), 600, 'dots', CORAL), t, (540, 860), (540, 1900), 0, rise=(4.8, 5.5, 2400))
        P.balloon(im, g['gift'], t, (870, 1250), (560, 1900), 1.7, rise=(5.1, 5.8, 2400))
        pop(im, g['meet'], t, 5.4, (330, 1360), -6); pop(im, g['prod'], t, 5.6, (420, 1480), -2)
        doodle_on(im, t, 5.9, g['d_heart'], (870, 420), 10); doodle_on(im, t, 6.1, g['d_spark'], (180, 420), 0)
        return im
    if t < 9.6:                                                   # PROOF: for the [type one] / [type two]: two clips under name tags, split
        im = Image.new('RGBA', (W, H), CREAM + (255,))
        tiles(im, t, [{'keys': [(7.0, (-W, 0, 0, 960)), (7.3, (0, 0, W, 960))], 'fill': video(c['p1'], 7.0)},
                      {'keys': [(7.1, (W, 960, 2 * W, 1920)), (7.4, (0, 960, W, 1920))], 'fill': video(c['p2'], 7.1)}])
        for i, (tag, xy, r, words) in enumerate(((g['tags'][0], (330, 820), -6, 'FOR THE [6AM CROWD]'), (g['tags'][1], (720, 1340), 5, 'FOR THE [DOG MUMS]'))):
            k = back_out(seg(t, 7.5 + i * 0.5, 7.75 + i * 0.5), 2.0)
            if k > 0:
                tg = tag.copy(); ImageDraw.Draw(tg).text((tg.width / 2, tg.height * 0.62), words, font=S.F(ANTON, 62), fill=INK, anchor='mm'); put(im, tg, xy, k, r)
        doodle_on(im, t, 8.0, g['d_arrow'], (820, 560), 200); doodle_on(im, t, 8.5, g['d_spark'], (180, 1180), 0)
        return im
    im = Image.new('RGBA', (W, H), CREAM + (255,))                # CTA: back to you; the butterfly returns with friends: a crown
    tiles(im, t, [{'keys': [(9.6, (0, 0, W, 1500))], 'fill': video(c['me2'], 9.6)}] + bottom_band(g, t, 9.6, 'stripes', 'dots'))
    for i, (pt, bf) in enumerate(zip(P.crown_points(6, 170), g['bf'])):
        u = ease(seg(t, 9.7 + i * 0.12, 10.4 + i * 0.12)); start = (-200 if i % 2 else 1300, 300 + 120 * i)
        P.butterfly(im, bf, t, lerp2(start, pt, u), (i - 2.5) * 10, flap=1 - 0.6 * u, phase=i)
    pop(im, g['sound'], t, 10.4, (540, 1360), -3); pop(im, g['kw'], t, 10.7, (540, 1490), 2)
    return im

def strip_slice(old, new, u, n=8, tones=(CORAL, PLUM)):
    out = new.copy(); sh = H / n
    for i in range(n):
        y0, y1 = int(i * sh), int((i + 1) * sh); s = Image.blend(old.crop((0, y0, W, y1)), Image.new('RGBA', (W, y1 - y0), tones[i % 2] + (255,)), 0.3 + 0.3 * u)
        out.alpha_composite(s, (int((1 if i % 2 == 0 else -1) * ease(u) * (W + 80)), y0))
    return out

SETUP = {'09': setup_09}; FRAME = {'09': frame_09}; SECS = {'09': 12.0}

# ======================================================================================================================
# 10 Three people to gift it to (12 s). Story: hook "stuck on a gift?" (a dotted gift with a ? sticker bounces in) >
# problem (the usual gifts, each crossed out: tea set, alarm clock, mug) > product (kraft paper tears open on it: works
# for all 3) > proof (three people's clips float up like balloons, a name on each string) > CTA (the balloons tied to
# the gift). Palette: kraft, red, navy.
# ======================================================================================================================
KRAFT, RED, NAVY = (150, 105, 60), (210, 52, 46), (26, 38, 70)

def setup_10():
    g = {'c': {'gift': Clip('IMG_1454', 1.0), 'prod': Clip('IMG_1456', 1.0), 'p1': Clip('IMG_1381', 1.0), 'p2': Clip('IMG_1391', 1.0),
               'p3': Clip('IMG_1417', 0.5), 'cta': Clip('IMG_1456', 2.5)}}
    kraft = raw('images', 'Partly unrolled kraft paper roll-14.png', (0.45, 0.55, 0.85, 0.8))
    g['kraft'] = still(kraft, 'kraft10b'); g['dots'] = pat_tile('dots', RED, CREAM); g['stripes'] = pat_tile('stripes', NAVY, CREAM, 0.5)
    g['checks'] = pat_tile('checks', RED, CREAM, 0.4); g['knit'] = still(raw('fall', 'Cream cable-knit wool texture-47.png'), 'knit10')
    g['box'] = P.thing('Kraft paper cube gift with twine-38.png', 380, 'dots', RED, scale=0.4, label=P.sticker('?', 70, NAVY, WHITE, 'circle'))
    g['box2'] = P.thing('Kraft paper cube gift with twine-38.png', 400, 'dots', RED, scale=0.4, label=P.sticker('FOR YOU', 40, RED))
    g['usual'] = [P.thing('Vintage Rose Porcelain Tea Set.png', 460, 'checks', NAVY, scale=0.35, strength=0.6),
                  P.thing('Classic Cream Twin-Bell Alarm Clock-185.png', 330, 'stripes', RED, scale=0.45, strength=0.7),
                  P.thing('Warm white ceramic coffee mug-140.png', 330, 'dots', NAVY, scale=0.4, strength=0.8)]
    g['x'] = [doodle('tick', 3 + i, 300, RED) for i in range(3)]
    g['stuck'] = line('stuck on a', 96, NAVY); g['giftw'] = word('GIFT?', 260, ('photo', kraft), ink_edge=True)
    g['imp'] = word('IMPOSSIBLE', 150, ('dots', NAVY)); g['tobuy'] = line('to buy for', 90, RED)
    g['works'] = line('this one works for', 84, NAVY); g['all3'] = word('ALL 3', 220, ('dots', RED))
    g['names'] = [line(n, 56, NAVY, WHITE, ANTON) for n in ('[YOUR FRIEND]', '[YOUR MUM]', '[YOUR DAD]')]
    g['comment'] = word('COMMENT', 160, ('photo', kraft), ink_edge=True); g['kw'] = line('"[KEYWORD]"', 84, RED, WHITE, ANTON); g['wrap'] = line('[gift wrap available]', 70, NAVY)
    g['q'] = S.fitw(S.ink_cut(S.raw('doodles', 'Playful Marker Glyphs Asset Sheet-11.png').crop(tuple(S.pieces('Playful Marker Glyphs Asset Sheet-11.png')[8])), RED), 130)
    g['d_under'] = doodle('under', 4, 520, RED); g['d_arrow'] = doodle('arrow', 9, 230, WHITE); g['d_spark'] = doodle('icon', 9, 140, NAVY); g['d_heart'] = doodle('icon', 2, 150, RED)
    return g

def frame_10(g, t):
    c = g['c']
    if t < 2.2:                                                   # HOOK: the gift-ready clip as a tile; a dotted gift with a ? bounces in
        im = Image.new('RGBA', (W, H), CREAM + (255,))
        tiles(im, t, [{'keys': [(0, (0, 0, W, 1460))], 'fill': video(c['gift'], 0)},
                      {'keys': [(-0.3, (0, 1920, 600, 2400)), (0.0, (0, 1460, 600, 1920))], 'fill': g['kraft']}, {'keys': [(-0.25, (600, 1920, W, 2400)), (0.05, (600, 1460, W, 1920))], 'fill': g['dots']}])
        b = back_out(seg(t, 0.3, 0.7), 2.0); put(im, g['box'], (800, lerp(2300, 1440, b) - abs(40 * math.sin(t * 9)) * seg(t, 0.7, 1.6) * (1 - seg(t, 1.6, 2.0))), 1, 6 * math.sin(t * 7))
        pop(im, g['stuck'], t, 0.1, (360, 330), -3); pop(im, g['giftw'], t, 0.35, (420, 520), -4); doodle_on(im, t, 0.9, g['d_under'], (420, 690), -2)
        doodle_on(im, t, 1.1, g['q'], (930, 1180), 12)
        return im
    if t < 4.6:                                                   # PROBLEM: the usual gifts, each crossed out
        im = Image.new('RGBA', (W, H), CREAM + (255,))
        tiles(im, t, [{'keys': enter3((0, 0, W, 640), 2.2, -1), 'fill': g['stripes']}, {'keys': enter3((0, 640, W, 1280), 2.25, 1), 'fill': g['knit']},
                      {'keys': enter3((0, 1280, W, H), 2.3, -1), 'fill': g['checks']}])
        for i, (obj, xy) in enumerate(zip(g['usual'], ((300, 330), (900, 1010), (330, 1600)))):
            pop(im, obj, t, 2.3 + i * 0.1, xy, (-6, 5, -4)[i]); doodle_on(im, t, 2.9 + i * 0.4, g['x'][i], xy, 0)
        pop(im, g['imp'], t, 2.5, (400, 880), -3); pop(im, g['tobuy'], t, 2.7, (420, 1030), 2)
        return im
    if t < 6.8:                                                   # PRODUCT: kraft paper tears open on it: works for all 3
        im = c['prod'].at(t - 4.6); u = ease(seg(t, 4.6, 5.3))
        cover = g['kraft'](t, (W, H)).copy(); hole = Image.new('L', (W, H), 255)
        if u > 0:
            m = C.torn_mask((int(200 + 900 * u), int(260 + 1300 * u)), 9, 26, 'tblr'); hole.paste(ImageOps.invert(m), (int(540 - m.width / 2), int(960 - m.height / 2)))
        cover.putalpha(hole); im.alpha_composite(cover)
        pop(im, g['works'], t, 5.4, (540, 1290), -2); pop(im, g['all3'], t, 5.55, (540, 1440), 3)
        doodle_on(im, t, 5.9, g['d_arrow'], (820, 720), 200); doodle_on(im, t, 6.1, g['d_spark'], (200, 420), 0)
        return im
    im = Image.new('RGBA', (W, H), CREAM + (255,))                # PROOF + CTA: three people float up like balloons, then tie onto the gift
    tiles(im, t, [{'keys': [(6.8, (0, 0, 540, H))], 'fill': g['dots']}, {'keys': [(6.8, (540, 0, W, H))], 'fill': g['stripes']}])
    cta = seg(t, 10.0, 10.5); anchor = lerp2((540, 2000), (540, 1480), ease(cta))
    up = ease(seg(t, 10.0, 10.5))                                # at the CTA the balloons rise to the top to make room
    for i, (clip, xy0, xy1, rim, col) in enumerate(((c['p1'], (300, 520), (200, 380), 'dots', RED), (c['p2'], (780, 760), (540, 330), 'stripes', NAVY), (c['p3'], (330, 1080), (880, 380), 'checks', RED))):
        xy = lerp2(xy0, xy1, up); dd_ = int(380 - 80 * up); P.balloon(im, window(clip.at(t - 6.8, (dd_, dd_)), dd_, rim, col), t, xy, (anchor[0] + (i - 1) * 40, anchor[1]), i * 1.7, rise=(6.9 + i * 0.6, 7.5 + i * 0.6, 2400))
        nm = g['names'][i]; k = back_out(seg(t, 7.3 + i * 0.6, 7.5 + i * 0.6))
        if t < 10.0: put(im, nm, (xy[0], xy[1] + 260), k, (-4, 3, -3)[i])
    if t >= 10.0:
        pop(im, g['box2'], t, 10.0, (540, 1480), 0, wiggle=2)
        pop(im, g['comment'], t, 10.3, (540, 900), -3); pop(im, g['kw'], t, 10.6, (540, 1050), 2); pop(im, g['wrap'], t, 10.8, (540, 1170), -2)
        doodle_on(im, t, 10.9, g['d_heart'], (860, 1500), 10)
    return im

def enter3(box, t0, d):
    return [(t0, (box[0] + d * W, box[1], box[2] + d * W, box[3])), (t0 + 0.3, box)]

# ======================================================================================================================
# 12 Your order just arrived (12 s). Story: hook "POV: it's here" (ding: a dotted brass doorbell rings, the frame
# shakes) > the wait (the tracking page on an old TV, the mailbox flag pops up: the wait is over) > unboxing (layers of
# real tissue paper peel off the clip one by one) > proof (a starred kraft tag swings in with the packaging detail) >
# CTA (the clip on the front of a dotted mailer). Palette: navy and mustard.
# ======================================================================================================================
MUST = (214, 166, 64)

def setup_12():
    g = {'c': {'door': Clip('IMG_1454', 1.0), 'track': Clip('IMG_1385', 1.0), 'unbox': Clip('IMG_1456', 1.0), 'use': Clip('IMG_1381', 1.0), 'cta': Clip('IMG_1454', 3.0)}}
    g['mat'] = still(raw('images', 'Plain coir doormat with black edge-41.png', (0.1, 0.1, 0.9, 0.9)), 'mat12'); g['stripes'] = pat_tile('stripes', NAVY, CREAM, 0.5)
    g['dots'] = pat_tile('dots', MUST, CREAM); g['checks'] = pat_tile('checks', NAVY, CREAM, 0.4)
    g['tissue'] = [still(raw('images', n), 'ts' + n[:6]) for n in ('Blush Pink Tissue Paper Texture-9.png', 'Crumpled pale blue tissue texture-8.png')] + [still(raw('images', 'Partly unrolled kraft paper roll-14.png', (0.45, 0.55, 0.85, 0.8)), 'kr12')]
    g['bell'] = P.thing('Vintage brass doorbell with ivory button-43.png', 260, 'dots', MUST, scale=0.3, strength=0.6, label=P.sticker('DING!', 40, NAVY), label_at=(0.5, 0.2))
    g['tv'] = P.raw_cut('Vintage Walnut Rabbit-Ear Television.png', 820); g['mailbox'] = P.thing('Vintage Mailbox with Raised Red Flag-20.png', 420, 'stripes', CREAM, scale=0.5, strength=0.8)
    g['tag'] = P.thing('Blank kraft hang tag with twine-116.png', 300, None, None, stars=3)
    g['mailer'] = P.raw_cut('Sealed kraft padded mailer-39.png', 900)
    g['pov'] = line('POV: your [product] just arrived', 64, NAVY); g['here'] = word("IT'S HERE", 200, ('dots', MUST), ink_edge=True)
    g['wait'] = word('THE WAIT', 150, ('dots', NAVY)); g['over'] = word('IS OVER', 150, ('dots', MUST), ink_edge=True)
    g['detail'] = line('[every order comes gift-wrapped]', 60, NAVY, WHITE, ANTON); g['get'] = word('GET YOURS', 150, ('dots', MUST), ink_edge=True)
    g['kw'] = line('comment "[KEYWORD]"', 80, NAVY)
    g['d_burst'] = doodle('burst', 5, 220, NAVY); g['d_path'] = doodle('path', 6, 340, NAVY); g['d_spark'] = [doodle('icon', 9, 150, WHITE), doodle('icon', 11, 130, WHITE)]
    g['d_arrow'] = doodle('arrow', 9, 220, WHITE); g['d_under'] = doodle('under', 4, 560, NAVY)
    return g

def frame_12(g, t):
    c = g['c']
    if t < 2.2:                                                   # HOOK: ding! the dotted doorbell rings, the frame shakes
        im = Image.new('RGBA', (W, H), CREAM + (255,))
        tiles(im, t, [{'keys': [(0, (0, 0, W, 1460))], 'fill': video(c['door'], 0)},
                      {'keys': [(-0.3, (0, 1920, 640, 2400)), (0.0, (0, 1460, 640, 1920))], 'fill': g['mat']}, {'keys': [(-0.25, (640, 1920, W, 2400)), (0.05, (640, 1460, W, 1920))], 'fill': g['stripes']}])
        press = 1 - 0.12 * math.sin(math.pi * seg(t, 0.4, 0.6)); put(im, g['bell'], (880, 1440), back_out(seg(t, 0.1, 0.4)) * press)
        doodle_on(im, t, 0.55, g['d_burst'], (700, 1300), -20)
        pop(im, g['pov'], t, 0.2, (480, 300), -2); pop(im, g['here'], t, 0.6, (480, 460), -4); doodle_on(im, t, 1.0, g['d_under'], (480, 600), -2)
        if 0.55 < t < 0.9: s = int(14 * math.sin(t * 90)); im = ImageChops.offset(im, s, -s)
        return im
    if t < 4.4:                                                   # THE WAIT: the tracking page on an old TV; the mailbox flag pops: the wait is over
        im = Image.new('RGBA', (W, H), CREAM + (255,))
        tiles(im, t, [{'keys': [(2.2, (0, 0, W, 960))], 'fill': g['checks']}, {'keys': [(2.2, (0, 960, W, H))], 'fill': g['dots']}])
        tv = g['tv'].copy(); v = c['track'].at(t - 2.2, (int(tv.width * 0.58), int(tv.height * 0.55))); tv.alpha_composite(v, (int(tv.width * 0.07), int(tv.height * 0.3)))
        pop(im, P.die_cut(tv, 10), t, 2.2, (470, 820), -3)
        pop(im, g['mailbox'], t, 2.9, (800, 1480), 4, wiggle=3); doodle_on(im, t, 3.1, g['d_path'], (700, 1200), 30)
        pop(im, g['wait'], t, 3.3, (360, 1360), -3); pop(im, g['over'], t, 3.5, (400, 1500), 3)
        return im
    if t < 7.0:                                                   # UNBOXING: real tissue paper peels off the clip, layer by layer
        im = c['unbox'].at(t - 4.4)
        tiles(im, t, [{'keys': [(4.4, (0, 0, W, H))], 'fill': g['tissue'][2], 'peel': (4.6, 0.5, 1)}, {'keys': [(4.4, (0, 0, W, H))], 'fill': g['tissue'][1], 'peel': (4.95, 0.5, -1)},
                      {'keys': [(4.4, (0, 0, W, H))], 'fill': g['tissue'][0], 'peel': (5.3, 0.5, 1)}][::-1])
        if t > 5.8: put(im, g['d_spark'][0], (200, 420)); put(im, g['d_spark'][1], (880, 1200))
        return im
    if t < 9.8:                                                   # PROOF: the clip in use, a starred kraft tag swings in with the detail
        im = Image.new('RGBA', (W, H), CREAM + (255,))
        tiles(im, t, [{'keys': [(7.0, (0, 0, W, H)), (7.3, (0, 0, W, 1500))], 'fill': video(c['use'], 7.0)},
                      {'keys': [(7.0, (0, 1920, 540, 2400)), (7.3, (0, 1500, 540, 1920))], 'fill': g['tissue'][0]}, {'keys': [(7.05, (540, 1920, W, 2400)), (7.35, (540, 1500, W, 1920))], 'fill': g['stripes']}])
        sw = 12 * math.sin(t * 3) * (1 - seg(t, 7.5, 9.0)); pop(im, g['tag'], t, 7.4, (820, 1400), sw)
        pop(im, g['detail'], t, 7.7, (430, 1320), -2); doodle_on(im, t, 8.0, g['d_arrow'], (560, 760), 200)
        return im
    im = Image.new('RGBA', (W, H), CREAM + (255,))                # CTA: the clip on the front of a dotted mailer
    tiles(im, t, [{'keys': [(9.8, (0, 0, W, H))], 'fill': g['mat']}])
    m = g['mailer'].copy(); v = c['cta'].at(t - 9.8, (int(m.width * 0.7), int(m.height * 0.6))); m.alpha_composite(v, (int(m.width * 0.15), int(m.height * 0.22)))
    m = P.style_object(m, 'dots', MUST, scale=0.4, strength=0.0); pop(im, m, t, 9.8, (540, 1000), -3)
    pop(im, g['bell'], t, 10.1, (880, 1560), 6); pop(im, g['get'], t, 10.2, (540, 330), -3); pop(im, g['kw'], t, 10.5, (540, 480), 2)
    doodle_on(im, t, 10.7, g['d_spark'][1], (180, 1480), 0)
    return im

SETUP.update({'10': setup_10, '12': setup_12}); FRAME.update({'10': frame_10, '12': frame_12}); SECS.update({'10': 12.0, '12': 12.0})

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
