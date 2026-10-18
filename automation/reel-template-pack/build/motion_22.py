"""#22 Put it to the test, rebuilt 2026-10-18 after her notes ("does this compare to the sample videos?", objects that
have nothing to do with each other, arrows at nothing, no overlays or patterns on the shapes, poor cut-outs).

Written from a script, the way her references work: every object arrives WITH the word it pictures, and they belong
to one story, a lab notebook test log. Patterns and stickers sit ON the objects (rule 9): the test tubes fill with
three different patterns of her hand-painted marks, the stopwatch wears a dotted No.1 sticker, the real stamp prints
PASSED. Cut-outs come from the rembg model (build/cutout_hq.py). Her picks from the Pinterest board used here:
combined backgrounds (graph paper + ruled notebook paper + a strip of her checks), the two-tone strip slice, a swarm
orbiting the product, a shape window (the magnifier's lens), big sticker type.

  0.0  setup, full frame   "does it really" + [STAY DRY]? (big sticker type, her dots in red); her underline
  2.0  the clip shrinks to a photo card on the notebook; "let's TEST it": the tubes slide in and fill with patterns;
       her arrow from TEST to the tubes
  3.0  two-tone strip slice (red / navy) into the test
  3.3  the test in ONE uncut take, full frame; "one take, no cuts"; the stopwatch (No.1 sticker) with outlined seconds
       counting beside it; her circle drawn round the stopwatch
  8.3  black-and-white freeze: "and the RESULT"; her burst
  8.8  the magnifying glass slides in carrying the result in its lens; the lens opens to full screen
  9.6  the result, full frame: her ticks orbit the product; the stamp comes down: PASSED; [IT STAYED DRY]
 10.7  CTA: the clip back on the notebook as a card, the whole kit round it, COMMENT [KEYWORD], her underline
Stand-in footage (her July clips) is not a real test; buyers film their own, one take, a claim they already make.
Usage: python build/motion_22.py [seconds ...]  ->  22-put-it-to-the-test/preview/motion-test.mp4 (or a test sheet)
"""
import math, random, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import lettering_b2 as LB
from collage_kit import doodle, doodle_on
from motion_b2 import Clip, put, draw_on, pop, camera, render, circle_mask, ease, back_out, seg, lerp, lerp2, clamp, W, H, INK, WHITE, CREAM

HQ = Path(__file__).resolve().parent / '.cache' / 'hq'
OUT = S.E.PACK / '22-put-it-to-the-test' / 'preview'
RED, NAVY, PAPER = (214, 52, 46), (26, 38, 70), (248, 244, 234)
ANTON, MONT = LB.FONT['anton'], LB.FONT['montserrat']

def hq(name, w=None):
    im = Image.open(HQ / (Path(name).stem + '.png')).convert('RGBA')
    return S.fitw(im, w) if w else im

def die_cut(im, edge=12, shadow=True):
    """A sticker: the object with a clean white die-cut border (like her references), soft shadow."""
    pad = edge + 4; a = Image.new('L', (im.width + 2 * pad, im.height + 2 * pad), 0); a.paste(im.split()[3].point(lambda v: 255 if v > 90 else 0), (pad, pad))
    border = a.filter(ImageFilter.MaxFilter(2 * edge + 1)).filter(ImageFilter.GaussianBlur(1.2))
    out = Image.new('RGBA', a.size, (255, 255, 255, 0)); out.putalpha(border); out.alpha_composite(im, (pad, pad))
    return C.shadow(out, (8, 14), 14, 90) if shadow else out

def dots(base, dot, scale=0.8): return LB.dots_fill(base, dot, scale)

def big_word(text, px, fill='dots', color=RED):
    """Big sticker type: Anton caps filled with her hand-painted dots (or plain), a white die-cut edge."""
    f = S.F(ANTON, px); l, t, r, b = f.getbbox(text); w, h = r - l + 40, b - t + 40
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((20 - l, 20 - t), text, font=f, fill=255)
    fl = dots(color, CREAM)((w, h), len(text)) if fill == 'dots' else Image.new('RGBA', (w, h), color + (255,))
    word = Image.new('RGBA', (w, h), (0, 0, 0, 0)); fl.putalpha(m); word.alpha_composite(fl)
    return die_cut(word, 10)

def small(img, t, t0, xy, text, px=78, color=WHITE, out=None, shadow=True, font=None):
    """A small connecting word, popping in on its beat (one or two words at a time, like her references)."""
    if t < t0 or (out is not None and t > out + 0.15): return
    k = back_out(seg(t, t0, t0 + 0.2)) * (1 - ease(seg(t, out, out + 0.15)) if out is not None else 1)
    if out is None: k = back_out(seg(t, t0, t0 + 0.2))
    f = S.F(font or MONT, max(6, int(px * (0.6 + 0.4 * k)))); lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text(xy, text, font=f, fill=color + (int(255 * clamp(k * 1.5)),), anchor='mm')
    if shadow:
        sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); sh.putalpha(lay.split()[3].filter(ImageFilter.GaussianBlur(9)).point(lambda v: int(v * 0.85))); img.alpha_composite(sh, (3, 6))
    img.alpha_composite(lay)

def outlined_number(text, px=170):
    """Hand-drawn-looking outlined digits (her reference: the outlined $5 next to the item)."""
    f = S.F(ANTON, px); l, t, r, b = f.getbbox(text); im = Image.new('RGBA', (r - l + 40, b - t + 40), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((20 - l, 20 - t), text, font=f, fill=(0, 0, 0, 0), stroke_width=6, stroke_fill=WHITE)
    return C.shadow(im, (3, 6), 6, 120)

# ---- the objects, with patterns and stickers ON them -----------------------------------------------------------------------
def tubes_parts(w):
    """The real test-tube rack and, for each tube, a 'liquid' of one of her patterns clipped to the glass."""
    rack = hq('Three empty test tubes in wooden rack-125.png', w); a = rack.split()[3]; px = rack.load(); wd, ht = rack.size
    glass = Image.new('L', rack.size, 0); gp = glass.load()
    for y in range(ht):
        for x in range(wd):
            r, g, b, al = px[x, y]
            if al > 30 and max(r, g, b) - min(r, g, b) < 26: gp[x, y] = 255          # glass: no wood colour in it
    top = int(ht * 0.04); prof = [sum(1 for y in range(top, int(ht * 0.25)) if gp[x, y]) for x in range(wd)]
    cols, on = [], None
    for x, v in enumerate(prof + [0]):
        if v > 8 and on is None: on = x
        if v <= 8 and on is not None:
            if x - on > wd * 0.04: cols.append((on, x))
            on = None
    pats = [('Playful hand-painted black polka dots-12.png', RED, CREAM), ('Hand-drawn black stripe pattern-16.png', NAVY, CREAM),
            ('Wobbly hand-drawn black and white checkerboard-24.png', RED, CREAM)]
    fills = []
    for (x0, x1), (name, dk, lt) in zip(cols[:3], pats):
        p = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', name)).resize((260, 260)), dk, lt).convert('RGBA')
        layer = Image.new('RGBA', rack.size, (0, 0, 0, 0))
        for yy in range(0, ht, 260):
            layer.paste(p, (x0 - 20, yy))
        m = Image.new('L', rack.size, 0); m.paste(glass.crop((x0, 0, x1, ht)), (x0, 0)); m = m.filter(ImageFilter.MinFilter(5))
        layer.putalpha(m.point(lambda v: int(v * 0.92))); fills.append(layer)
    return rack, fills

def tubes(g, level):
    """The rack with each tube filled to `level` (0 to 1) of its glass, each with a different pattern."""
    rack = g['rack'].copy(); ht = rack.height; y_bottom = int(ht * 0.86); y_top = int(ht * 0.08)
    for i, f in enumerate(g['fills']):
        lv = clamp(level - i * 0.12); yl = int(lerp(y_bottom, y_top + ht * 0.12, lv))
        m = Image.new('L', rack.size, 0); ImageDraw.Draw(m).rectangle((0, yl, rack.width, ht), fill=255)
        part = f.copy(); part.putalpha(ImageChops.multiply(f.split()[3], m)); rack.alpha_composite(part)
    return die_cut(rack, 10)

def stopwatch(w):
    """The real stopwatch wearing a round red sticker with her dots and No.1 on it."""
    sw = hq('Vintage Silver Mechanical Stopwatch-233.png', w); d = int(w * 0.34)
    st = dots(RED, CREAM, 0.5)((d, d), 3); st.putalpha(circle_mask((d, d), (d / 2, d / 2), d / 2 - 1, 1))
    ImageDraw.Draw(st).text((d / 2, d / 2), 'No.1', font=S.F(ANTON, int(d * 0.34)), fill=WHITE, anchor='mm', stroke_width=3, stroke_fill=INK)
    sw.alpha_composite(die_cut(st, 6, False), (int(w * 0.6), int(sw.height * 0.66)))
    return die_cut(sw, 10)

LENS = (247, 237, 212)                     # the magnifier's glass in its cut-out (measured): centre, radius
def magnifier(w):
    m = hq('Vintage brass magnifying glass on white-129.png'); k = w / m.width; m = S.fitw(m, w)
    cx, cy, r = [v * k for v in LENS]; a = m.split()[3]; ImageDraw.Draw(a).ellipse((cx - r, cy - r, cx + r, cy + r), fill=0); m.putalpha(a)
    return m, (cx - m.width / 2, cy - m.height / 2, r)

def passed_ink(px=150):
    """PASSED in red stamp ink: Anton, rough where the ink missed (her hand-painted dots as the gaps)."""
    f = S.F(ANTON, px); l, t, r, b = f.getbbox('PASSED'); w, h = r - l + 60, b - t + 60
    m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m); d.text((30 - l, 30 - t), 'PASSED', font=f, fill=255); d.rectangle((6, 6, w - 6, h - 6), outline=255, width=10)
    gaps = ImageOps.grayscale(S.raw('doodles', 'Hand-painted polka dots on black-15.png')).resize((w, h)).point(lambda v: 0 if v > 140 else 255)
    m = ImageChops.multiply(m, gaps)
    ink = Image.new('RGBA', (w, h), RED + (0,)); ink.putalpha(m.point(lambda v: int(v * 0.9))); return ink

def paper_bg():
    """Combined backgrounds (her pick): graph paper above, ruled notebook paper below, a strip of her checks between."""
    im = Image.new('RGBA', (W, H)); graph = ImageOps.fit(S.raw('images', 'Creased pale blue graph paper-7.png'), (W, 1000)).convert('RGBA')
    ruled = ImageOps.fit(S.raw('physical', 'Blank Ruled Notebook Paper.png'), (W, 820)).convert('RGBA')
    chk = ImageOps.fit(ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', 'Wobbly hand-drawn black and white checkerboard-24.png')), RED, CREAM), (W, 110)).convert('RGBA')
    im.alpha_composite(graph, (0, 0)); im.alpha_composite(ruled, (0, 1100)); im.alpha_composite(chk, (0, 990)); return im

def card(clip_im, w, h, border=18):
    """The clip printed as a photo card (white border), like her reference's video shrinking to a card."""
    c = Image.new('RGBA', (w + 2 * border, h + 2 * border), (255, 255, 255, 255)); c.alpha_composite(ImageOps.fit(clip_im, (w, h)), (border, border))
    return C.shadow(c, (10, 16), 16, 110)

def slice_wipe(old, new, u, n=8):
    """Two-tone strip slice (her pick): the old scene cut into strips tinted red and navy, sliding apart to reveal the new."""
    out = new.copy(); sh = H / n
    for i in range(n):
        y0, y1 = int(i * sh), int((i + 1) * sh); strip = old.crop((0, y0, W, y1))
        tint = Image.new('RGBA', strip.size, (RED if i % 2 == 0 else NAVY) + (255,)); strip = Image.blend(strip, tint, 0.35 + 0.3 * u)
        dx = int((1 if i % 2 == 0 else -1) * ease(u) * (W + 80)); out.alpha_composite(strip, (dx, y0))
    return out

# ---- the Reel ------------------------------------------------------------------------------------------------------------
def setup():
    g = {'c': [Clip('IMG_1430', 1.0), Clip('IMG_1460', 0.0, 6.0), Clip('IMG_1463', 1.0), Clip('IMG_1431', 1.0)]}
    g['rack'], g['fills'] = tubes_parts(440)
    g['watch'] = stopwatch(300); g['watch_s'] = stopwatch(230)
    g['mag'], g['lens'] = magnifier(1100); g['mag_s'], g['lens_s'] = magnifier(380)
    st = hq('Vintage Rubber Stamp and Ink Pad-17.png'); g['stamp'] = die_cut(S.fitw(st.crop((0, 0, int(st.width * 0.42), st.height)), 330), 8)
    g['ink'] = passed_ink(150); g['ink_s'] = passed_ink(70)
    g['claim'] = big_word('[STAY DRY]?', 170); g['test'] = big_word('TEST', 250); g['result'] = big_word('RESULT', 260)
    g['said'] = big_word('[IT STAYED DRY]', 120, 'plain', NAVY); g['comment'] = big_word('COMMENT', 190); g['kw'] = big_word('"[KEYWORD]"', 110, 'plain', NAVY)
    g['paper'] = paper_bg()
    g['d_under'] = doodle('under', 4, 600, WHITE); g['d_arrow'] = doodle('arrow', 9, 250, NAVY); g['d_circle'] = doodle('frame', 1, 430, WHITE)
    g['d_burst'] = doodle('burst', 3, 300, WHITE); g['d_ticks'] = [doodle('tick', i % 3, 150, RED) for i in range(6)]; g['d_under_n'] = doodle('under', 2, 520, NAVY)
    g['secs'] = [big_word(f'0:0{i}', 170, 'plain', RED) for i in range(7)]          # the seconds as red stickers: white outlines vanished on a white wall
    g['q'] = S.fitw(S.ink_cut(S.raw('doodles', 'Playful Marker Glyphs Asset Sheet-11.png').crop(tuple(S.pieces('Playful Marker Glyphs Asset Sheet-11.png')[8])), RED), 130)
    g['d_dash'] = doodle('path', 6, 340, WHITE); g['claim_s'] = big_word('[STAY DRY]?', 100)
    return g

def frame(g, t):
    c = g['c']
    if t < 2.0:                                                   # the setup, full frame; the question, word by word
        im = c[0].at(t)
        small(im, t, 0.05, (230, 300), 'does', 84); small(im, t, 0.25, (450, 300), 'it', 84); small(im, t, 0.45, (680, 300), 'really', 84)
        pop(im, g['claim'], t, 0.75, (540, 470), -3)
        doodle_on(im, t, 1.05, g['d_under'], (540, 640), -2); doodle_on(im, t, 1.2, g['q'], (960, 230), 12)
        return im
    if t < 3.3:                                                   # shrink to a card on the notebook; TEST brings the tubes, they fill
        im = g['paper'].copy(); u = ease(seg(t, 2.0, 2.35))
        cw, ch = int(lerp(W, 500, u)), int(lerp(H, 690, u)); cc = lerp2((W / 2, H / 2), (330, 1080), u)
        put(im, card(c[0].at(t), cw, ch, int(18 * u)), cc, 1, -3 * u)
        small(im, t, 2.3, (250, 420), "let's", 90, INK, shadow=False)
        pop(im, g['test'], t, 2.45, (560, 560), -4)
        small(im, t, 2.65, (880, 560), 'it', 90, INK, shadow=False)
        if t >= 2.45: slide_in = back_out(seg(t, 2.45, 2.75), 1.4); put(im, tubes(g, seg(t, 2.6, 3.0)), (lerp(1400, 810, slide_in), 1080), 1, 4)
        doodle_on(im, t, 2.75, g['d_arrow'], (690, 770), 0)
        if t >= 3.0: im = slice_wipe(im, c[1].at(0), seg(t, 3.0, 3.3))
        return im
    if t < 8.3:                                                   # the test, ONE uncut take; the stopwatch counts beside it
        im = c[1].at(t - 3.3)
        small(im, t, 3.4, (240, 300), 'one take,', 80, out=5.1); small(im, t, 3.7, (240, 390), 'no cuts', 80, out=5.1)   # something new every second,
        doodle_on(im, t, 4.3, g['d_dash'], (330, 760), 20, 7.2)                         # nothing that cuts the take
        pop(im, g['claim_s'], t, 5.3, (420, 330), -3, out=8.1)
        small(im, t, 6.4, (330, 1200), 'still going...', 76, out=8.1)
        pop(im, g['watch'], t, 3.5, (840, 1040), 6, wiggle=2)
        doodle_on(im, t, 3.8, g['d_circle'], (840, 1060), 0)
        s = min(6, int(t - 3.3)); put(im, g['secs'][s], (760, 1360), 1 + 0.12 * (1 - seg((t - 3.3) % 1, 0, 0.15)), -4)
        return im
    if t < 8.8:                                                   # black-and-white freeze: and the RESULT
        im = ImageOps.grayscale(c[1].at(5.0)).convert('RGBA')
        small(im, t, 8.35, (540, 620), 'and the', 90)
        pop(im, g['result'], t, 8.5, (540, 820), 3); doodle_on(im, t, 8.6, g['d_burst'], (900, 520), 0)
        return im
    if t < 9.6:                                                   # the magnifier slides in carrying the result in its lens; the lens opens
        im = ImageOps.grayscale(c[1].at(5.0)).convert('RGBA'); pop(im, g['result'], t, 0, (540, 820), 3)
        k = ease(seg(t, 8.8, 9.15)); mx, my = lerp(W + 700, 640, k), 900; (ox, oy, r) = g['lens']
        grow = ease(seg(t, 9.2, 9.6)); lc = (mx + ox, my + oy); rr = lerp(r, 1300, grow)
        im.paste(c[2].at(t - 8.8).convert('RGB'), (0, 0), circle_mask((W, H), lc, rr, 2))
        if grow < 0.5: put(im, g['mag'], (mx, my), 1, 0, 1 - grow * 2)
        return im
    if t < 10.7:                                                  # the result: ticks orbit the product; the stamp stamps PASSED
        im = c[2].at(t - 8.8)
        for i, tk in enumerate(g['d_ticks']):
            a = t * 1.7 + i * math.pi / 3; put(im, tk, (540 + 380 * math.cos(a), 1050 + 270 * math.sin(a)), back_out(seg(t, 9.6 + i * 0.05, 9.8 + i * 0.05)), -10 * math.cos(a))
        pop(im, g['said'], t, 9.7, (540, 360), -2)
        if t >= 10.12: put(im, g['ink'], (700, 640), 1, -12)
        down = ease(seg(t, 9.95, 10.12)); up = ease(seg(t, 10.25, 10.45))
        if t >= 9.95 and up < 1: put(im, g['stamp'], (700, lerp(-300, 560, down) - 900 * up), 1, -12)
        return im
    im = g['paper'].copy(); u = ease(seg(t, 10.7, 11.0))          # CTA: the clip as a card on the notebook, the kit round it
    cw, ch = int(lerp(W, 560, u)), int(lerp(H, 760, u)); put(im, card(c[3].at(t - 10.7), cw, ch, int(18 * u)), lerp2((W / 2, H / 2), (540, 1000), u), 1, 2 * u)
    if t >= 11.0: put(im, g['ink_s'], (700, 700), 1, -14)
    pop(im, tubes(g, 1.0), t, 11.0, (190, 1500), -6); pop(im, g['watch_s'], t, 11.1, (900, 1460), 8)
    pop(im, g['mag_s'], t, 11.2, (860, 760), -20); pop(im, g['stamp'], t, 11.3, (180, 760), 10)
    pop(im, g['comment'], t, 11.15, (540, 330), -2); pop(im, g['kw'], t, 11.4, (540, 500), 2)
    doodle_on(im, t, 11.55, g['d_under_n'], (540, 600), -2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t)
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]
        sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        OUT.mkdir(parents=True, exist_ok=True); sheet.save(OUT / '_test.jpg', quality=85); print('test', OUT / '_test.jpg')
    else:
        render('22', fr, 12.0, OUT)

if __name__ == '__main__':
    main()
