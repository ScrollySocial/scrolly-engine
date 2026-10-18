"""Motion tests for batch 2 (#11, #20; #07 and #15 were dropped after her notes) as living collages (FRAMEWORK.md "The look: collage"): photo and
pattern tiles butted edge to edge, the buyer's clip is one tile, 2 to 3 real cut-outs cross the seams, one paper piece
carries the words. Tiles slide in, flip over, peel off and swap; still photos start playing; words pop onto a tile and
the camera zooms into it until it is the next clip. Rough renders with stand-in footage (her July clips), not the
CapCut build. Every object and pattern is one of her real images; doodles are her marker sheets, drawn on as you watch.
Usage: python build/collage_b2.py 11 [seconds ...]  ->  NN-.../preview/motion-test.mp4  (or a test sheet of those times)
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import motion_b2 as M
from motion_b2 import (W, H, INK, WHITE, CREAM, BOLD, HAND, dd, ARROWS, BURSTS, ICONS, LINES, GLYPHS, Clip, put, draw_on,
                       pop, hero, slide, camera, text_img, ease, back_out, seg, lerp, lerp2, clamp, render)
from collage_motion import still, video, swap, tiles

def raw(folder, name, crop=None):
    im = S.raw(folder, name)
    if crop: w, h = im.size; im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    return im

def off(box, dx=0, dy=0): return (box[0] + dx, box[1] + dy, box[2] + dx, box[3] + dy)
def mid(box): return ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)
def enter(box, t0, dx=0, dy=0, dur=0.28): return [(t0, off(box, dx, dy)), (t0 + dur, box)]

SETUP, FRAME, SECS = {}, {}, {}

# ======================================================================================================================
# 11 A day with it, v2 after her notes (13 s). One texture tells the day: her butter watercolour and a real sky/wheat
# photo, both toned morning cream > noon butter > afternoon amber > night navy (no mix of washes and dots). The clock's
# hour hand carries the story: 7 (morning slice) > 12 (midday) > 4 (afternoon) > 9 (night), each slice lighting up and
# the camera diving into it. Only one alarm clock (the hook); the day's other real objects: latte, sunflower,
# hourglass, candle. Lettering: Alfa Slab One in the clock's brass, filled with her painted dots.
# ======================================================================================================================
import lettering_b2 as LB

TONES = {'morning': ((176, 146, 98), (255, 248, 230)), 'noon': ((196, 146, 30), (255, 236, 150)),
         'afternoon': ((150, 78, 30), (250, 194, 118)), 'night': ((10, 14, 38), (74, 90, 146))}

def toned(im, tone):
    lo, hi = TONES[tone]; g = ImageOps.autocontrast(ImageOps.grayscale(im), cutoff=1)
    return ImageOps.colorize(g, lo, hi).convert('RGBA')

def setup_11():
    g = M.setup_11()
    wash = S.raw('doodles', 'Butter Yellow Watercolor Wash-23.png'); sky = raw('fall', 'Autumn Sky Over Golden Wheat-31.png', (0, 0, 1, 0.55))
    wheat = raw('fall', 'Autumn Sky Over Golden Wheat-31.png', (0, 0.5, 1, 1))
    for tn in TONES:
        g['wash_' + tn] = still(toned(wash, tn), 'wash' + tn); g['sky_' + tn] = still(toned(sky, tn), 'sky' + tn); g['wheat_' + tn] = still(toned(wheat, tn), 'wheat' + tn)
        g['base_' + tn] = ImageOps.fit(toned(wash, tn), (W, H), Image.LANCZOS)
    g['candle'] = still(raw('fall', 'Glowing Ivory Candle in Glass Jar-96.png', (0.2, 0.05, 0.8, 0.95)), 'candle')
    g['latte'] = S.obj('fall', 'Rosetta latte in an ivory cup-20.png', 330, 14, 6, 60)
    g['sunflower'] = S.obj('fall', 'Single sunflower on white-79.png', 420, 14, 6, 61)
    g['hour_s'] = S.obj('images', 'Classic wooden hourglass with flowing sand-238.png', 330, 14, 6, 62)
    g['alarm_m'] = S.alarm(560, 0, 42, WHITE)
    fill = LB.dots_fill(LB.BRASS, CREAM)
    g['a_day'] = S.letters('A DAY', LB.FONT['alfa'], 180, fill, 9); g['with_my'] = S.letters('WITH MY', LB.FONT['alfa'], 130, fill, 9)
    g['comment'] = S.letters('Comment', LB.FONT['alfa'], 140, fill, 9)
    return g

ORDER = (1, 2, 0, 3)          # the clock's slices: top-right midday, bottom-right afternoon, bottom-left morning, top-left night
SLICE = {1: (1, -1), 2: (1, 1), 0: (-1, 1), 3: (-1, -1)}

def wheel(g, t, bright):
    d = g['d']; h = d // 2; disc = Image.new('RGBA', (d, d), (0, 0, 0, 0))
    for q, (ci, (x, y)) in enumerate(zip(ORDER, ((h, 0), (h, h), (0, h), (0, 0)))):
        f = g['clips'][ci].at(t, (h, h)); k = bright.get(ci, 0.5)
        if k < 1: f = M.ImageEnhance.Brightness(f).enhance(k)
        lay = Image.new('RGBA', (d, d), (0, 0, 0, 0)); lay.alpha_composite(f, (x, y)); lay.putalpha(M.ImageChops.multiply(lay.split()[3], g['qmask'][q]))
        disc.alpha_composite(lay)
    put(disc, g['div'], (h, h)); put(disc, g['div'], (h, h), 1, 90)
    return disc

def quad_tiles(g, t, tone_at):
    """Four tiles behind the clock (wash, sky, wheat, wash); tone_at(i) gives each tile's tone (they flip as it changes)."""
    boxes = ((0, 0, 540, 900), (540, 0, W, 900), (0, 900, 540, H), (540, 900, W, H)); kinds = ('wash', 'sky', 'wheat', 'wash')
    im = g['base_' + tone_at(0)].copy()
    for i, (b, k) in enumerate(zip(boxes, kinds)):
        tn = tone_at(i)
        fill = g['candle'] if (tn == 'night' and i == 2) else g[f'{k}_{tn}']
        tiles(im, t, [{'keys': [(0, b)], 'fill': fill}])
    return im

def hour_deg(t):
    keys = [(0, 210), (3.2, 210), (4.0, 360), (6.4, 360), (7.1, 480), (9.6, 480), (10.3, 630), (11.3, 630), (11.8, 720)]
    for (t0, a0), (t1, a1) in zip(keys, keys[1:]):
        if t0 <= t < t1: return lerp(a0, a1, ease(seg(t, t0, t1)))
    return keys[-1][1]

def clock11(g, img, t, c, scale, bright, disc=None):
    h = hour_deg(t); M.clock_at(g, img, c, scale, disc if disc is not None else wheel(g, t, bright), h, (h * 12) % 360)

def flip_tone(t, t0, a, b, step=0.15): return lambda i: b if t >= t0 + i * step + 0.15 else a

def frame_11(g, t):
    cl = g['clips']; c = (540, 900); d = g['d']; sc = lambda ci: (c[0] + SLICE[ci][0] * d / 4, c[1] + SLICE[ci][1] * d / 4)
    if t < 2.1:                                                    # morning collage; the one alarm clock rings across the seams
        im = g['base_morning'].copy()
        A, TOPB, R1, R2, BOT = (0, 260, 760, 1420), (0, 0, W, 260), (760, 260, W, 820), (760, 820, W, 1420), (0, 1420, W, H)
        tiles(im, t, [{'keys': [(0, A)], 'fill': video(cl[0], 0)}, {'keys': enter(TOPB, 0, dy=-300), 'fill': g['wash_morning']},
                      {'keys': enter(R1, 0.04, dx=400), 'fill': g['sky_morning']}, {'keys': enter(R2, 0.08, dx=400), 'fill': g['wash_morning']},
                      {'keys': enter(BOT, 0.02, dy=560), 'fill': g['wheat_morning']}])
        ring = 1 - seg(t, 1.3, 1.6)
        put(im, g['alarm_m'], (830 + 6 * math.sin(t * 61) * ring, 1400), 1, 12 + 5 * math.sin(t * 55) * ring)
        for k, (x, y, r) in enumerate(((560, 1180, -10), (1010, 1120, 80))):
            if ring > 0 and int(t * 6 + k) % 2 == 0: put(im, g['burst'][k], (x, y), 1, r)
        pop(im, g['latte'], t, 0.5, (210, 1450), -8, wiggle=2)
        hero(im, t, 0.1, g['a_day'], (470, 330), out=1.85); hero(im, t, 0.45, g['with_my'], (470, 520), out=1.9)
        slide(im, g['product'], t, 0.8, 1.1, (-400, 720), (380, 720), -3)
        if t >= 1.2: put(im, M.text_img('[7am]', HAND, 70, INK, CREAM, 5), (920, 560), back_out(seg(t, 1.2, 1.45), 2.2), 6)
        return im
    if t < 4.1:                                                    # zoom out to the clock; the hand sweeps 7 to 12, the tiles turn to noon
        tone = flip_tone(t, 3.2, 'morning', 'noon'); im = quad_tiles(g, t, tone); u = ease(seg(t, 3.2, 4.0))
        clock11(g, im, t, c, 1, {0: 1 - 0.5 * u, 1: 0.5 + 0.5 * u})
        draw_on(im, g['arc'], (900, 380), seg(t, 3.2, 3.7), -20); pop(im, g['t12'], t, 3.8, (800, 560), 6)
        if t < 3.1:
            z = ease(seg(t, 2.1, 3.0)); out = camera(im, lerp2(sc(0), (W / 2, H / 2), z), lerp(2.0, 1.0, z)); fade = 1 - seg(t, 2.1, 2.45)
            return Image.blend(out, cl[0].at(t), fade) if fade > 0 else out
        return im
    if t < 4.8: return dive(g, t, 4.1, 4.8, 1, 'noon', {1: 1}, 4.45, cl[1].at(t - 4.45))
    if t < 6.0:                                                    # midday collage
        im = g['base_noon'].copy(); A0, A, BL, BR = (0, 0, W, H), (0, 0, W, 1300), (0, 1300, 540, H), (540, 1300, W, H)
        tiles(im, t, [{'keys': [(4.8, A0), (5.1, A)], 'fill': video(cl[1], 4.45)},
                      {'keys': enter(BL, 4.8, dy=650), 'fill': g['wash_noon']}, {'keys': enter(BR, 4.9, dy=650), 'fill': g['wheat_noon']}])
        pop(im, g['sunflower'], t, 5.1, (840, 1300), 10, wiggle=3); put(im, g['sun'], (860, 330), 1, t * 30)
        pop(im, g['t12'], t, 5.15, (330, 1300), -4); draw_on(im, g['under'], (330, 1420), seg(t, 5.4, 5.8))
        return im
    if t < 7.1:                                                    # zoom back out to the clock; the hand moves on to 4
        tone = flip_tone(t, 6.3, 'noon', 'afternoon'); im = quad_tiles(g, t, tone); u = ease(seg(t, 6.4, 7.1))
        clock11(g, im, t, c, 1, {1: 1 - 0.5 * u, 2: 0.5 + 0.5 * u})
        pop(im, g['t4'], t, 6.9, (800, 1240), -4)
        z = ease(seg(t, 6.0, 6.5)); out = camera(im, lerp2(sc(1), (W / 2, H / 2), z), lerp(2.0, 1.0, z)); fade = 1 - seg(t, 6.0, 6.3)
        return Image.blend(out, cl[1].at(t - 4.45), fade) if fade > 0 else out
    if t < 7.8: return dive(g, t, 7.1, 7.8, 2, 'afternoon', {2: 1}, 7.45, cl[2].at(t - 7.45))
    if t < 9.6:                                                    # afternoon collage; then its tiles flip to night
        tone = 'afternoon' if t < 9.0 else 'night'; im = g['base_' + tone].copy()
        A0, A, L1, L2, BOT = (0, 0, W, H), (300, 0, W, 1350), (0, 0, 300, 700), (0, 700, 300, 1350), (0, 1350, W, H)
        tiles(im, t, [{'keys': [(7.8, A0), (8.1, A)], 'fill': video(cl[2], 7.45), 'flip': (9.2, 0.3, g['candle'])},
                      {'keys': enter(L1, 7.85, dx=-350), 'fill': g['sky_afternoon'], 'flip': (8.9, 0.3, g['sky_night'])},
                      {'keys': enter(L2, 7.9, dx=-350), 'fill': g['wash_afternoon'], 'flip': (9.0, 0.3, g['wash_night'])},
                      {'keys': enter(BOT, 7.95, dy=600), 'fill': g['wheat_afternoon'], 'flip': (9.1, 0.3, g['wheat_night'])}])
        if t < 9.2: pop(im, g['hour_s'], t, 8.1, (300, 1180), -6, wiggle=2); pop(im, g['t4'], t, 8.2, (640, 1350), -4, out=9.0)
        return im
    if t < 11.3:                                                   # night: the clock returns, the hand moves on to 9
        im = quad_tiles(g, t, lambda i: 'night'); k = back_out(seg(t, 9.6, 10.0), 1.6); u = ease(seg(t, 9.6, 10.3))
        if k > 0: clock11(g, im, t, c, k, {2: 1 - 0.5 * u, 3: 0.5 + 0.5 * u})
        pop(im, g['t9'], t, 10.2, (330, 600), -6)
        return im
    im = g['base_night'].copy()                                    # CTA: the resting product fills the clock face
    tiles(im, t, [{'keys': [(11.3, (0, 0, W, 240))], 'fill': g['wash_night']}, {'keys': enter((0, 1560, 540, H), 11.3, dx=-560), 'fill': g['candle']},
                  {'keys': enter((540, 1560, W, H), 11.35, dx=560), 'fill': g['wheat_night']}])
    u = ease(seg(t, 11.3, 11.8)); full = cl[4].at(t - 11.3, (d, d))
    disc = Image.blend(wheel(g, t, {3: 1}), full, u); disc.putalpha(M.circle_mask((d, d), (d / 2, d / 2), d / 2, 1))
    clock11(g, im, t, (540, lerp(900, 1060, u)), lerp(1.0, 0.76, u), {}, disc)
    for i, (key, (x, y), r) in enumerate((('latte', (170, 1560), -8), ('sunflower', (540, 1600), 6), ('hour_s', (900, 1560), 8))):
        pop(im, g[key], t, 11.6 + i * 0.12, (x, y), r, wiggle=2)
    hero(im, t, 11.5, g['comment'], (540, 330)); slide(im, g['kw'], t, 11.8, 12.1, (540, -200), (540, 500), -2)
    return im

def dive(g, t, t0, t1, ci, tone, bright, t_clip, clip_im):
    """The camera dives into one slice of the clock until it is that clip, full screen."""
    im = quad_tiles(g, t, lambda i: tone); clock11(g, im, t, (540, 900), 1, bright)
    d = g['d']; f = (540 + SLICE[ci][0] * d / 4, 900 + SLICE[ci][1] * d / 4)
    z = ease(seg(t, t0, t1 - 0.1)); out = camera(im, f, lerp(1.0, 2.0, z)); fade = seg(t, t0 + 0.35, t1)
    return Image.blend(out, clip_im, fade) if fade > 0 else out

SETUP['11'] = setup_11; FRAME['11'] = frame_11; SECS['11'] = 13.0

# ======================================================================================================================
# 20 What buyers said, v2 after her notes (12 s). World: the prize table on white marble: gold foil, her painted dots,
# a trophy photo. Reviews are the buyer's own screenshots, shown in real phones (her green-screen phone photos), not
# typed on cards. Lettering: magazine cut-outs on real paper (gold foil, black, cream card, kraft, marble).
# No marker numbers; fewer, bigger stars; the third review comes from diving into the second phone's screen; the CTA
# has three different prizes (a trophy, a gem, a gold seal).
# ======================================================================================================================
PHONES = ['Graphite Smartphone With Green Screen-38.png', 'Graphite Smartphone With Chroma Screen-39.png', 'Hand Holding Graphite Smartphone with Green Screen-40.png']

def screenshot(n, size=(600, 1300)):
    """A stand-in for the buyer's review screenshot (they drop in their own): a plain review card layout with an
    honest placeholder line, never invented review words."""
    w, h = size; im = Image.new('RGBA', size, (252, 252, 250, 255)); d = ImageDraw.Draw(im); f = S.F(S.BOLD, 40)
    d.ellipse((50, 120, 150, 220), fill=(214, 210, 204)); d.rounded_rectangle((180, 140, 470, 170), 12, fill=(196, 192, 186)); d.rounded_rectangle((180, 186, 380, 206), 10, fill=(222, 218, 212))
    for i in range(5): S.place(im, S.fitw(S.cut('images', S.STARS[i]), 64), (85 + i * 76, 290))
    for k, ww in enumerate((500, 470, 510, 430, 300)): d.rounded_rectangle((50, 380 + k * 54, 50 + ww, 408 + k * 54), 12, fill=(214, 210, 204))
    for k, l in enumerate(('[Your buyer\'s', f'review {n} screenshot]')): d.text((w / 2, 760 + k * 56), l, font=f, fill=(120, 112, 104), anchor='mm')
    return im

def phone(i, shot, w):
    """Her real phone photo with the screenshot keyed into its green screen."""
    p = S.cut('tech', PHONES[i]); px = p.load(); m = Image.new('L', p.size, 0); mp = m.load()
    for y in range(p.height):
        for x in range(p.width):
            r, g, b, a = px[x, y]
            if a and g > 140 and g > r + 50 and g > b + 50: mp[x, y] = 255
    m = m.filter(ImageFilter.MaxFilter(3)); box = m.getbbox()
    scr = ImageOps.fit(shot, (box[2] - box[0], box[3] - box[1]), Image.LANCZOS)
    lay = Image.new('RGBA', p.size, (0, 0, 0, 0)); lay.paste(scr, box[:2]); p.paste(lay, (0, 0), m.filter(ImageFilter.GaussianBlur(1)))
    k = w / p.width; box = tuple(v * k for v in box)
    return C.shadow(S.fitw(p, w), (14, 22), 20, 110), ((box[0] + box[2]) / 2 - w / 2, (box[1] + box[3]) / 2 - p.height * k / 2)

def setup_20():
    g = M._setup_20()
    seal = S.raw('images', 'Blank gold foil seal sticker-175.png'); cx = seal.width // 2
    g.update(marble=M.tex('images', 'Soft veined white marble texture-1.png', (W, H)),
             gold=still(seal.crop((cx - 300, cx - 300, cx + 300, cx + 300)), 'gold'),
             dots=still(raw('doodles', 'Playful hand-painted black polka dots-12.png'), 'dots20'),
             troph=still(raw('images', 'Plain gold trophy on black base-223.png', (0.15, 0.05, 0.85, 0.95)), 'troph'),
             parch=still(raw('images', 'Cream parchment paper stack-205.png', (0.25, 0.25, 0.75, 0.75)), 'parch'))
    kinds = ('gold', 'black', 'cream', 'kraft', 'marble')
    g['what'] = LB.magazine('WHAT BUYERS', 106, kinds, seed=11); g['said'] = LB.magazine('SAID', 170, kinds, seed=4)
    g['comment'] = LB.magazine('Comment', 140, kinds, seed=7)
    g['phones'] = [phone(i, screenshot(n), w) for i, (n, w) in enumerate((('one', 470), ('two', 480), ('three', 640)))]
    g['shot2'] = screenshot('two')
    g['big_stars'] = [S.star(430, i) for i in range(5)]
    g['gem'] = S.obj('fall', 'Warm champagne faceted rhinestone-107.png', 230, 12, 5, 70)
    g['trophy1'] = S.trophy(380, 0, 88); g['seal_c'] = S.seal(250, 2)
    strip = S.raw('images', 'Blank gold foil seal sticker-175.png').crop((300, 520, 960, 700)).convert('RGBA')
    g['kw'] = C.shadow(S.words_on(strip, '"[KEYWORD]"', BOLD, 64))
    r = random.Random(12)
    g['cover12'] = [(x + r.randint(-60, 60), y + r.randint(-60, 60), r.randint(-30, 30), r.randint(0, 4)) for y in (120, 560, 1000, 1440, 1840) for x in (120, 540, 960)][:15]
    return g

def frame_20(g, t):
    cl = g['clips']
    if t < 3.6:                                                   # the prize-table collage; five stars stick on; review one in a phone
        im = g['marble'].copy()
        A, TOPB, R1, R2, BOT = (0, 300, 760, 1450), (0, 0, W, 300), (760, 300, W, 850), (760, 850, W, 1450), (0, 1450, W, H)
        tiles(im, t, [{'keys': [(0, A)], 'fill': video(cl[0], 0)}, {'keys': enter(TOPB, 0, dy=-320), 'fill': g['dots']},
                      {'keys': enter(R1, 0.04, dx=400), 'fill': g['gold']}, {'keys': enter(R2, 0.08, dx=400), 'fill': g['troph']},
                      {'keys': enter(BOT, 0.02, dy=500), 'fill': g['parch']}])
        roll = ease(seg(t, 0.3, 0.9)); put(im, g['seal_big'], (lerp(W + 500, 960, roll), 1500), 0.8, lerp(220, 0, roll))
        for i in range(5):
            t0 = 0.1 + 0.15 * i
            if t < t0 or t > 2.05: continue
            k = 1 + 0.8 * (1 - back_out(seg(t, t0, t0 + 0.2), 1.2)); up = ease(seg(t, 1.85, 2.05)) * 500
            put(im, g['stars'][i], (170 + i * 185, 300 - (30 if i in (1, 3) else 0) - up), k, (-12, 8, -4, 10, -18)[i])
        hero(im, t, 0.5, g['what'], (540, 560), out=1.85); hero(im, t, 0.85, g['said'], (520, 760), out=1.9)
        if t >= 2.0:
            ph, _ = g['phones'][0]; slide(im, ph, t, 2.0, 2.4, (520, H + 700), (520, 1180), -5, fn=lambda x: back_out(x, 1.3))
            pop(im, g['seal_s'][0], t, 2.5, (300, 760), 0); draw_on(im, g['arrow'], (870, 980), seg(t, 2.7, 3.1), 200)
        return im
    if t < 4.4:                                                   # fewer, bigger gold stars rush in, cover it all, fly off
        im = frame_20(g, 3.59) if t < 4.0 else split2(g, t)
        for i, (x, y, r, k) in enumerate(g['cover12']):
            a = ease(seg(t, 3.6 + (i % 5) * 0.03, 3.95)); b = ease(seg(t, 4.0 + (i % 4) * 0.03, 4.4))
            if a <= 0 or b >= 1: continue
            dx, dy = x - W / 2, y - H / 2; n = math.hypot(dx, dy) + 1; fx, fy = dx / n * 1500, dy / n * 1500
            put(im, g['big_stars'][k], (x + fx * (1 - a) + fx * b, y + fy * (1 - a) + fy * b), 1, r + 80 * b)
        return im
    if t < 6.0:                                                   # review two: clip above, two tiles below, gold drawn on the seam, the second phone
        im = split2(g, t); draw_on(im, g['stroke'], (540, 1120), seg(t, 4.4, 4.75), -2)
        ph, _ = g['phones'][1]; slide(im, ph, t, 4.55, 4.95, (540, H + 700), (560, 1180), 4, fn=lambda x: back_out(x, 1.3))
        draw_on(im, g['arrow'], (210, 1000), seg(t, 5.1, 5.5), -20)
        return im
    if t < 6.8:                                                   # the camera dives into the phone's screen: it becomes the third clip
        im = split2(g, t); ph, off_ = g['phones'][1]; put(im, ph, (560, 1180), 1, 4)
        f = (560 + off_[0], 1180 + off_[1]); z = ease(seg(t, 6.0, 6.65)); out = camera(im, f, lerp(1, 3.4, z))
        fade = seg(t, 6.4, 6.8)
        return Image.blend(out, cl[2].at(t - 6.4), fade) if fade > 0 else out
    if t < 8.4:                                                   # review three: the clip, tiles slide in, a hand brings the phone
        im = g['marble'].copy(); A0, A, BL, BR = (0, 0, W, H), (0, 0, W, 1350), (0, 1350, 540, H), (540, 1350, W, H)
        tiles(im, t, [{'keys': [(6.8, A0), (7.1, A)], 'fill': video(cl[2], 6.4)}, {'keys': enter(BL, 6.85, dy=600), 'fill': g['gold']},
                      {'keys': enter(BR, 6.9, dy=600), 'fill': g['dots']}])
        ph, _ = g['phones'][2]; slide(im, ph, t, 7.1, 7.5, (W + 600, 1300), (780, 1300), -4)
        return im
    if t < 9.2:                                                   # three sweeps of real gold paint wipe to the CTA
        im = frame_20(g, 8.39) if t < 8.8 else cta2(g, t)
        for i, y in enumerate((300, 960, 1620)):
            u = ease(seg(t, 8.4 + i * 0.08, 9.15 + i * 0.05)); x = lerp(-1500, W + 1500, u) if i % 2 == 0 else lerp(W + 1500, -1500, u)
            put(im, g['stroke_big'], (x, y), 1, (-3, 2, -2)[i])
        return im
    return cta2(g, t)

def split2(g, t):
    im = g['marble'].copy()
    tiles(im, t, [{'keys': [(4.0, (0, 0, W, 1120))], 'fill': video(g['clips'][1], 4.0)},
                  {'keys': [(4.0, (0, 1120, 540, H))], 'fill': g['dots']}, {'keys': [(4.0, (540, 1120, W, H))], 'fill': g['gold']}])
    return im

def cta2(g, t):
    im = g['marble'].copy()
    tiles(im, t, [{'keys': enter((0, 240, W, 1350), 8.8, dx=-W), 'fill': video(g['clips'][3], 9.0)}, {'keys': enter((0, 0, W, 240), 8.9, dy=-260), 'fill': g['dots']},
                  {'keys': enter((0, 1350, 540, H), 8.95, dy=600), 'fill': g['parch']}, {'keys': enter((540, 1350, W, H), 9.0, dy=600), 'fill': g['gold']}])
    slide(im, g['trophy1'], t, 9.5, 9.85, (200, H + 400), (200, 1620), -5, fn=lambda x: back_out(x, 1.4))
    pop(im, g['gem'], t, 9.7, (560, 1700), 8, wiggle=3); pop(im, g['seal_c'], t, 9.85, (900, 1620), 0)
    hero(im, t, 9.6, g['comment'], (540, 400)); slide(im, g['kw'], t, 10.0, 10.3, (-400, 1330), (540, 1330), -2)
    draw_on(im, g['arrow'], (900, 1150), seg(t, 10.3, 10.7))
    return im

SETUP['20'] = setup_20; FRAME['20'] = frame_20; SECS['20'] = 11.5

def main():
    tid = sys.argv[1]; g = SETUP[tid](); fr = lambda t: FRAME[tid](g, t)
    out = S.E.PACK / S.DIRS[tid] / 'preview'
    if len(sys.argv) > 2:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[2:]]
        sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render(tid, fr, SECS[tid], out)

if __name__ == '__main__':
    main()
