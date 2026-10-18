"""Motion tests for batch 2 (#11, #20; #07 and #15 were dropped after her notes) as living collages (FRAMEWORK.md "The look: collage"): photo and
pattern tiles butted edge to edge, the buyer's clip is one tile, 2 to 3 real cut-outs cross the seams, one paper piece
carries the words. Tiles slide in, flip over, peel off and swap; still photos start playing; words pop onto a tile and
the camera zooms into it until it is the next clip. Rough renders with stand-in footage (her July clips), not the
CapCut build. Every object and pattern is one of her real images; doodles are her marker sheets, drawn on as you watch.
Usage: python build/collage_b2.py 11 [seconds ...]  ->  NN-.../preview/motion-test.mp4  (or a test sheet of those times)
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps
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
# 11 A day with it, v3 (13 s), after her notes on v2 ("looks too much like fall", "a bit too girly and like 7 years
# old", no shape/block outlines, balance full-frame video with accents + full-screen words with no video).
# Modern and not seasonal: light grey concrete (her shared background), black and white type in Anton with the clock's
# brass as the one accent, the real brass clock without outlines. Beats:
#   morning video full frame + accents | clock-hand wipe to a full-screen NOON card | dive through its O into midday
#   video + accents | zoom out to the clock wheel (the collage moment), the hand moves 12 > 4, dive into the slice |
#   afternoon video + accents | clock-hand wipe to a dark NIGHT card | night video + accents | CTA in the clock face.
# Accents on every video beat, in different parts of the screen: the small brass clock telling the time, the time
# stamp, one of her doodles.
# ======================================================================================================================
import lettering_b2 as LB

ANTON = LB.FONT['anton']; BRASS = (222, 176, 92)

def word(img, t, t0, xy, text, px, color=WHITE, font=None, out=None, anchor='mm', shadow=True):
    """A word that pops in at t0 (quick scale-up with a little overshoot), soft shadow only, no outline."""
    if t < t0: return
    k = back_out(seg(t, t0, t0 + 0.22))
    if out is not None: k *= 1 - ease(seg(t, out, out + 0.18))
    if k <= 0.02: return
    f = S.F(font or ANTON, max(6, int(px * (0.6 + 0.4 * k))))
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(lay).text(xy, text, font=f, fill=color + (int(255 * clamp(k * 1.5)),), anchor=anchor)
    if shadow:
        sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.putalpha(lay.split()[3].filter(ImageFilter.GaussianBlur(10)).point(lambda v: min(255, int(v * 0.9))))
        img.alpha_composite(sh, (4, 8))
    img.alpha_composite(lay)

def setup_11():
    g = M.setup_11()
    g['concrete'] = M.tex('images', 'Light gray concrete mineral texture-4.png', (W, H))
    g['concrete_dark'] = ImageEnhance.Brightness(ImageEnhance.Contrast(g['concrete']).enhance(1.4)).enhance(0.16)
    clk = S.fitw(S.cut('fall', 'Handless vintage brass wall clock-24.png'), 1320)
    g['clock'] = C.shadow(clk, (12, 18), 22, 100)                    # no outline (her note)
    g['alarm_m'] = C.shadow(S.fitw(S.cut('images', S.ALARMS[0]), 520), (10, 16), 16, 100)
    g['arrow_w'] = dd(ARROWS, 9, 170, WHITE); g['spark_w'] = dd(ICONS, 9, 110, WHITE); g['under_w'] = dd(LINES, 2, 320, WHITE)
    g['burst_w'] = dd(BURSTS, 5, 200, WHITE)
    return g

ORDER = (1, 2, 0, 3)          # slices: top-right midday, bottom-right afternoon, bottom-left morning, top-left night
SLICE = {1: (1, -1), 2: (1, 1), 0: (-1, 1), 3: (-1, -1)}

def wheel(g, t, bright):
    d = g['d']; h = d // 2; disc = Image.new('RGBA', (d, d), (0, 0, 0, 0))
    for q, (ci, (x, y)) in enumerate(zip(ORDER, ((h, 0), (h, h), (0, h), (0, 0)))):
        f = g['clips'][ci].at(t, (h, h)); k = bright.get(ci, 0.5)
        if k < 1: f = ImageEnhance.Brightness(f).enhance(k)
        lay = Image.new('RGBA', (d, d), (0, 0, 0, 0)); lay.alpha_composite(f, (x, y)); lay.putalpha(ImageChops.multiply(lay.split()[3], g['qmask'][q]))
        disc.alpha_composite(lay)
    put(disc, g['div'], (h, h)); put(disc, g['div'], (h, h), 1, 90)
    return disc

def hour_deg(t):
    keys = [(0, 210), (2.3, 210), (2.9, 360), (6.0, 360), (6.6, 480), (8.2, 480), (8.9, 630), (11.0, 630), (11.6, 720)]
    for (t0, a0), (t1, a1) in zip(keys, keys[1:]):
        if t0 <= t < t1: return lerp(a0, a1, ease(seg(t, t0, t1)))
    return keys[-1][1]

def clock(g, img, t, c, scale, disc=None, h=None):
    h = hour_deg(t) if h is None else h
    put(img, g['clock'], c, scale)
    if disc is not None: put(img, disc, c, scale)
    put(img, g['hands']['hour'], c, scale * 0.62 * 0.8, -h); put(img, g['hands']['minute'], c, scale * 0.62, -((h * 12) % 360))

def accents(g, img, t, t0, stamp, doodle_at, t_end):
    """The accents on a full-frame video beat: the small brass clock top-right telling the time, the time stamp
    bottom-left, one of her doodles somewhere else."""
    k = back_out(seg(t, t0, t0 + 0.3), 1.6) * (1 - ease(seg(t, t_end - 0.15, t_end)))
    if k > 0: clock(g, img, t, (890, 1000), 0.24 * k)
    word(img, t, t0 + 0.15, (70, 1390), stamp, 150, WHITE, anchor='lm', out=t_end - 0.2)
    if doodle_at: draw_on(img, doodle_at[0], doodle_at[1], seg(t, t0 + 0.4, t0 + 0.8), doodle_at[2])

def radial(old, new, u, c=(540, 960)):
    """The clock-hand wipe: the new scene sweeps in clockwise from 12, like a hand going round."""
    if u <= 0: return old
    if u >= 1: return new
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).pieslice((c[0] - 1500, c[1] - 1500, c[0] + 1500, c[1] + 1500), -90, -90 + 360 * u, fill=255)
    out = old.copy(); out.paste(new, (0, 0), m); return out

def card(g, t, text, dark=False, h=None):
    """A full-screen words beat (no user video): a built-in word huge on concrete (NOON, NIGHT: generic, so it fits any
    buyer; their own times stay editable on the video beats), the brass clock half off the edge behind it."""
    im = (g['concrete_dark'] if dark else g['concrete']).copy()
    clock(g, im, t, (1010, 1300), 1.05, h=h)
    f = S.F(ANTON, 470); col = WHITE if dark else INK
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(lay).text((540, 900), text, font=f, fill=col + (255,), anchor='mm')
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.putalpha(lay.split()[3].filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.5)))
    im.alpha_composite(sh, (6, 12)); im.alpha_composite(lay)
    return im, lay

def counter_mask(lay, glyph_xy):
    """The hole inside a letter (the 0 of 12PM): flood fill from its centre, stopped by the letter's ink."""
    m = lay.split()[3].point(lambda v: 255 if v > 100 else 0); ImageDraw.floodfill(m, glyph_xy, 128)
    return m.point(lambda v: 255 if v == 128 else 0).filter(ImageFilter.GaussianBlur(1))

def frame_11(g, t):
    cl = g['clips']; d = g['d']; c = (540, 900); sc = lambda ci: (c[0] + SLICE[ci][0] * d / 4, c[1] + SLICE[ci][1] * d / 4)
    if t < 2.3:                                                    # morning, full frame, the hook words and accents
        im = cl[0].at(t)
        for i, (w_, xy) in enumerate((('A DAY', (540, 320)), ('WITH MY', (540, 545)))): word(im, t, 0.05 + i * 0.18, xy, w_, 210, WHITE, out=2.1)
        word(im, t, 0.5, (540, 750), '[PRODUCT]', 160, BRASS, out=2.1)
        accents(g, im, t, 0.8, '[7AM]', (g['burst_w'], (860, 1180), 0), 2.25)
        u = ease(seg(t, 2.0, 2.3))
        return radial(im, card(g, t, 'NOON')[0], u) if u > 0 else im
    if t < 3.6:                                                    # full-screen words, then dive through the 0
        im, lay = card(g, t, 'NOON'); f = S.F(ANTON, 470)
        o = (int(540 - f.getlength('NOON') / 2 + f.getlength('N') + f.getlength('O') / 2), 900)    # the first O
        im.paste(cl[1].at(t - 3.0), (0, 0), counter_mask(lay, o))
        z = ease(seg(t, 2.9, 3.6)); out = camera(im, o, lerp(1, 24.0, z ** 1.5)) if z > 0 else im
        fade = seg(t, 3.4, 3.6)
        return Image.blend(out, cl[1].at(t - 3.0), fade) if fade > 0 else out
    if t < 5.6:                                                    # midday, full frame + accents
        im = cl[1].at(t - 3.0); accents(g, im, t, 3.6, '[12PM]', (g['spark_w'], (220, 560), 0), 5.6)
        return im
    if t < 7.1:                                                    # the collage moment: zoom out to the clock wheel, the hand goes to 4, dive in
        im = g['concrete'].copy(); u = ease(seg(t, 6.0, 6.6))
        clock(g, im, t, c, 1, wheel(g, t, {1: 1 - 0.5 * u, 2: 0.5 + 0.5 * u}))
        if t < 6.0:
            z = ease(seg(t, 5.6, 5.95)); out = camera(im, lerp2(sc(1), (W / 2, H / 2), z), lerp(2.0, 1.0, z)); fade = 1 - seg(t, 5.6, 5.8)
            return Image.blend(out, cl[1].at(t - 3.0), fade) if fade > 0 else out
        if t >= 6.6:
            z = ease(seg(t, 6.6, 7.05)); out = camera(im, sc(2), lerp(1.0, 2.0, z)); fade = seg(t, 6.85, 7.1)
            return Image.blend(out, cl[2].at(t - 6.85), fade) if fade > 0 else out
        return im
    if t < 8.4:                                                    # afternoon, full frame + accents; the hand wipes to night
        im = cl[2].at(t - 6.85); accents(g, im, t, 7.1, '[4PM]', (g['arrow_w'], (700, 1200), -20), 8.4)
        u = ease(seg(t, 8.1, 8.4))
        return radial(im, card(g, t, 'NIGHT', dark=True)[0], u) if u > 0 else im
    if t < 9.4:                                                    # full-screen words at night
        im, _ = card(g, t, 'NIGHT', dark=True)
        u = ease(seg(t, 9.15, 9.4))
        return radial(im, cl[3].at(t - 9.15), u) if u > 0 else im
    if t < 10.9:                                                   # night, full frame + accents
        im = cl[3].at(t - 9.15); accents(g, im, t, 9.4, '[9PM]', (g['under_w'], (240, 1500), 0), 10.9)
        return im
    im = g['concrete_dark'].copy()                                 # CTA: the resting product fills the clock face; the hands meet at 12
    u = back_out(seg(t, 10.9, 11.3), 1.4); full = cl[4].at(t - 10.9, (d, d)); full.putalpha(M.circle_mask((d, d), (d / 2, d / 2), d / 2, 1))
    clock(g, im, t, (540, 1060), 0.8 * u, full)
    word(im, t, 11.3, (540, 330), 'COMMENT', 210, WHITE); word(im, t, 11.6, (540, 530), '"[KEYWORD]"', 130, BRASS)
    draw_on(im, g['arrow_w'], (900, 700), seg(t, 11.9, 12.3), 200)
    return im

SETUP['11'] = setup_11; FRAME['11'] = frame_11; SECS['11'] = 13.0

# ======================================================================================================================
# 20 What buyers said, v2/v3 after her notes (12 s). v3 balances the beats: full-frame video with accents, one
# full-screen words beat, one collage moment (CTA); no lines round tiles or objects. World: the prize table on white marble: gold foil, her painted dots,
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
    g['gem'] = C.shadow(S.fitw(S.cut('fall', 'Warm champagne faceted rhinestone-107.png'), 230), (6, 10), 10, 90)   # no outlines (her note)
    g['trophy1'] = C.shadow(S.fitw(S.cut('images', S.TROPHIES[0]), 380), (8, 14), 14, 100); g['seal_c'] = S.seal(250, 2)
    g['in_their'] = LB.magazine('IN THEIR', 128, kinds, seed=5); g['words'] = LB.magazine('WORDS', 180, kinds, seed=9)
    strip = S.raw('images', 'Blank gold foil seal sticker-175.png').crop((300, 520, 960, 700)).convert('RGBA')
    g['kw'] = C.shadow(S.words_on(strip, '"[KEYWORD]"', BOLD, 64))
    r = random.Random(12)
    g['cover12'] = [(x + r.randint(-60, 60), y + r.randint(-60, 60), r.randint(-30, 30), r.randint(0, 4)) for y in (120, 560, 1000, 1440, 1840) for x in (120, 540, 960)][:15]
    return g

def frame_20(g, t):
    """v3 (her balance note): full-frame video with accents (stars, seal, phones with the screenshots) for most of it,
    one full-screen words beat with no video ("IN THEIR WORDS" on marble), and one collage moment for the CTA.
    No lines round tiles or objects."""
    cl = g['clips']
    if t < 3.6:                                                   # review one: full frame + accents
        im = cl[0].at(t)
        roll = ease(seg(t, 0.3, 0.9)); put(im, g['seal_big'], (lerp(W + 500, 1000, roll), 1760), 0.7, lerp(220, 0, roll))
        for i in range(5):
            t0 = 0.1 + 0.15 * i
            if t < t0: continue
            k = 1 + 0.8 * (1 - back_out(seg(t, t0, t0 + 0.2), 1.2)) - ease(seg(t, 1.85, 2.05)) * 0.45
            y = lerp(300 - (30 if i in (1, 3) else 0), 270, ease(seg(t, 1.85, 2.05)))
            x = lerp(170 + i * 185, 120 + i * 95, ease(seg(t, 1.85, 2.05)))
            put(im, g['stars'][i], (x, y), k, (-12, 8, -4, 10, -18)[i])
        hero(im, t, 0.5, g['what'], (540, 560), out=1.85); hero(im, t, 0.85, g['said'], (520, 760), out=1.9)
        if t >= 2.0:
            ph, _ = g['phones'][0]; slide(im, ph, t, 2.0, 2.4, (W + 500, 1150), (760, 1150), -6, fn=lambda x: back_out(x, 1.3))
            draw_on(im, g['arrow'], (330, 1100), seg(t, 2.5, 2.9), -10)
        return im
    if t < 5.0:                                                   # a few big stars sweep across to the words beat
        im = frame_20(g, 3.59) if t < 4.0 else words_card(g, t)
        for i, (x, y, r, k) in enumerate(g['cover12']):
            a = ease(seg(t, 3.6 + (i % 5) * 0.03, 3.95)); b = ease(seg(t, 4.0 + (i % 4) * 0.03, 4.4))
            if a <= 0 or b >= 1: continue
            dx, dy = x - W / 2, y - H / 2; n = math.hypot(dx, dy) + 1; fx, fy = dx / n * 1500, dy / n * 1500
            put(im, g['big_stars'][k], (x + fx * (1 - a) + fx * b, y + fy * (1 - a) + fy * b), 1, r + 80 * b)
        u = ease(seg(t, 4.7, 5.0))                                # a stroke of gold paint wipes to the next clip
        if u > 0:
            m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle((0, 0, int(W * u), H), fill=255); im.paste(cl[1].at(t - 4.7), (0, 0), m)
            put(im, g['stroke_big'], (W * u, 960), 1, 90)
        return im
    if t < 6.4:                                                   # review two: full frame + accents
        im = cl[1].at(t - 4.7)
        ph, _ = g['phones'][1]; slide(im, ph, t, 5.0, 5.4, (-500, 1150), (320, 1150), 5, fn=lambda x: back_out(x, 1.3))
        pop(im, g['seal_s'][1], t, 5.3, (900, 380)); draw_on(im, g['arrow'], (760, 1050), seg(t, 5.5, 5.9), 180)
        return im
    if t < 7.2:                                                   # dive into the phone's screen: it becomes the third clip
        im = cl[1].at(t - 4.7); ph, off_ = g['phones'][1]; put(im, ph, (320, 1150), 1, 5)
        f = (320 + off_[0], 1150 + off_[1]); z = ease(seg(t, 6.4, 7.05)); out = camera(im, f, lerp(1, 3.4, z))
        fade = seg(t, 6.8, 7.2)
        return Image.blend(out, cl[2].at(t - 6.8), fade) if fade > 0 else out
    if t < 8.6:                                                   # review three: full frame, a hand brings the phone
        im = cl[2].at(t - 6.8)
        ph, _ = g['phones'][2]; slide(im, ph, t, 7.3, 7.7, (W + 600, 1250), (760, 1250), -4)
        for i, (x, y) in enumerate(((200, 600), (330, 1300))):
            if int(t * 5 + i) % 3: put(im, g['spark'][i], (x, y))
        return im
    return cta3(g, t)

def words_card(g, t):
    """The full-screen words beat: no video, IN THEIR WORDS in magazine cut-outs on marble, gold paint under it."""
    im = g['marble'].copy()
    draw_on(im, g['stroke'], (540, 1160), seg(t, 4.3, 4.6), -3)
    hero(im, t, 4.05, g['in_their'], (540, 760)); hero(im, t, 4.3, g['words'], (540, 1000))
    return im

def cta3(g, t):
    """The collage moment, for the CTA: the clip shrinks into a tile as the other tiles slide in round it."""
    im = g['marble'].copy()
    tiles(im, t, [{'keys': [(8.6, (0, 0, W, H)), (9.0, (0, 240, W, 1350))], 'fill': video(g['clips'][3], 8.6)},
                  {'keys': enter((0, 0, W, 240), 8.7, dy=-260), 'fill': g['dots']},
                  {'keys': enter((0, 1350, 540, H), 8.75, dy=600), 'fill': g['parch']}, {'keys': enter((540, 1350, W, H), 8.8, dy=600), 'fill': g['gold']}])
    slide(im, g['trophy1'], t, 9.2, 9.55, (200, H + 400), (200, 1620), -5, fn=lambda x: back_out(x, 1.4))
    pop(im, g['gem'], t, 9.4, (560, 1700), 8, wiggle=3); pop(im, g['seal_c'], t, 9.55, (900, 1620), 0)
    hero(im, t, 9.3, g['comment'], (540, 400)); slide(im, g['kw'], t, 9.7, 10.0, (-400, 1330), (540, 1330), -2)
    draw_on(im, g['arrow'], (900, 1150), seg(t, 10.0, 10.4))
    return im

SETUP['20'] = setup_20; FRAME['20'] = frame_20; SECS['20'] = 11.0

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
