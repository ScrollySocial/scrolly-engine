"""Wireframes for the Fall pack (f1 to f8): one simple panel per beat, showing where the clips, the real photo props
and the words go, the beat's timing, and Instagram's no-text zones. For Mercedes to approve the structure before any
motion test. Grey boxes = the buyer's clips; dashed shapes = real photo props (with their hand-drawn touch);
black words = built-in artwork words; blue words in [brackets] = words the buyer edits.
Usage: python build/wireframe_fall.py  ->  fall/wireframes/fN.png + fall/wireframes/review.html
"""
import base64, html, io, math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E

OUT = E.PACK / 'fall' / 'wireframes'; OUT.mkdir(parents=True, exist_ok=True)
S = 0.5; PW, PH = int(1080 * S), int(1920 * S)
BG, CLIPC, PROP, BUILT, EDIT, ZONE, NOTE = (238, 233, 224), (92, 92, 96), (150, 96, 50), (24, 22, 20), (38, 98, 200), (232, 120, 110), (110, 104, 96)
BOLD, REG = 'C:/Windows/Fonts/arialbd.ttf', 'C:/Windows/Fonts/arial.ttf'
def F(p, px): return ImageFont.truetype(p, int(px))
def sc(*v): return [x * S for x in v]

# ---- drawing helpers (all coordinates in 1080 x 1920 Reel pixels) ------------------------------------------------------
def dashed(d, pts, color, width=3, dash=14):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        L = math.hypot(x1 - x0, y1 - y0); n = max(1, int(L / dash))
        for i in range(0, n, 2):
            a, b = i / n, min(1, (i + 1) / n)
            d.line((x0 + (x1 - x0) * a, y0 + (y1 - y0) * a, x0 + (x1 - x0) * b, y0 + (y1 - y0) * b), fill=color, width=width)

def shape_pts(shape, box):
    x0, y0, x1, y1 = sc(*box); cx, cy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
    if shape == 'circle': return [(cx + rx * math.cos(t / 40 * 2 * math.pi), cy + ry * math.sin(t / 40 * 2 * math.pi)) for t in range(41)]
    if shape == 'apple':
        return [(cx + rx * (0.95 * math.sin(t / 40 * 2 * math.pi)), cy - ry * (0.85 * math.cos(t / 40 * 2 * math.pi) - 0.12 * abs(math.sin(t / 40 * 2 * math.pi)) ** 8 + 0.1 * math.cos(t / 40 * 4 * math.pi) * 0)) for t in range(41)]
    if shape == 'leaf':
        return [(cx + rx * math.sin(t / 40 * 2 * math.pi) * (0.75 + 0.25 * math.cos(t / 40 * 10 * math.pi)), cy - ry * math.cos(t / 40 * 2 * math.pi)) for t in range(41)]
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1), (x0, y0)]

def clip(d, box, label, shape='rect'):
    pts = shape_pts(shape, box); d.polygon(pts, fill=CLIPC)
    x0, y0, x1, y1 = sc(*box); cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    r = min(x1 - x0, y1 - y0) * 0.12; d.polygon([(cx - r * 0.6, cy - r - 14), (cx - r * 0.6, cy + r - 14), (cx + r, cy - 14)], fill=(210, 210, 214))
    d.text((cx, cy + r + 4), label, font=F(BOLD, 24), fill=(255, 255, 255), anchor='mt')

def wedges(d, box, labels, gap_from=None):
    """A circle cut into wedges; each wedge with a label is a clip, the others are pie / clock (props)."""
    x0, y0, x1, y1 = sc(*box); cx, cy, r = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2; n = len(labels)
    for i, lab in enumerate(labels):
        a0, a1 = -90 + 360 * i / n, -90 + 360 * (i + 1) / n
        d.pieslice((x0, y0, x1, y1), a0, a1, fill=CLIPC if lab else (214, 170, 110), outline=BG, width=4)
        if lab:
            am = math.radians((a0 + a1) / 2); d.text((cx + r * 0.58 * math.cos(am), cy + r * 0.58 * math.sin(am)), lab, font=F(BOLD, 20), fill=(255, 255, 255), anchor='mm')

def prop(d, box, label, shape='rect', drawn=True):
    pts = shape_pts(shape, box); dashed(d, pts, PROP, 3)
    if drawn:   # the hand-drawn outline: a looser wobbly line just outside
        x0, y0, x1, y1 = sc(*box); cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
        wob = [(cx + (x - cx) * 1.07 + 3 * math.sin(i * 1.7), cy + (y - cy) * 1.07 + 3 * math.cos(i * 1.3)) for i, (x, y) in enumerate(pts)]
        d.line(wob, fill=(40, 40, 40), width=2)
    if label:   # a small tag on the prop's top edge, so it never sits on the words
        x0, y0, x1, y1 = sc(*box); lab = label.replace(chr(10), ' '); f = F(BOLD, 17)
        cx = min(max((x0 + x1) / 2, 70), PW - 70); cy = max(y0 + 12, 125)
        bb = d.textbbox((cx, cy), lab, font=f, anchor='mm'); d.rounded_rectangle((bb[0] - 6, bb[1] - 4, bb[2] + 6, bb[3] + 4), 6, fill=(255, 248, 236), outline=PROP)
        d.text((cx, cy), lab, font=f, fill=PROP, anchor='mm')

def text(d, xy, words, px, kind='built'):
    x, y = sc(*xy); f = F(BOLD, px * S)
    if kind == 'edit':
        d.text((x, y), words, font=f, fill=EDIT, anchor='mm', stroke_width=max(2, int(px * S / 16)), stroke_fill=(255, 255, 255))
    else:
        d.text((x, y), words, font=f, fill=BUILT, anchor='mm', stroke_width=max(1, int(px * S / 14)), stroke_fill=(255, 255, 255))
    bb = d.textbbox((x, y), words, font=f, anchor='mm')
    bb = [v / S for v in bb]
    if bb[1] < 220 or bb[3] > 1500 or (bb[2] > 930 and bb[3] > 960): print('IG SAFE ZONE:', words, [int(v) for v in bb])

def arrow(d, a, b, label=''):
    x0, y0 = sc(*a); x1, y1 = sc(*b); d.line((x0, y0, x1, y1), fill=(210, 60, 40), width=4)
    t = math.atan2(y1 - y0, x1 - x0)
    for s in (2.6, -2.6): d.line((x1, y1, x1 - 18 * math.cos(t + s / 6), y1 - 18 * math.sin(t + s / 6)), fill=(210, 60, 40), width=4)
    if label: d.text(((x0 + x1) / 2 + 8, (y0 + y1) / 2), label, font=F(BOLD, 18), fill=(210, 60, 40), anchor='lm')

def panel(time, title, bg, draw):
    im = Image.new('RGB', (PW, PH), BG); d = ImageDraw.Draw(im)
    d.text((10, 120), 'BG: ' + bg, font=F(REG, 17), fill=NOTE)
    draw(d)
    zone = Image.new('RGBA', (PW, PH), (0, 0, 0, 0)); z = ImageDraw.Draw(zone)
    for r in ((0, 0, PW, 110), (0, PH - 210, PW, PH), (PW - 75, PH / 2, PW, PH - 210)): z.rectangle(r, fill=ZONE + (46,))
    im = Image.alpha_composite(im.convert('RGBA'), zone).convert('RGB'); d = ImageDraw.Draw(im)
    d.text((PW / 2, 55), 'no words here (IG)', font=F(REG, 15), fill=(190, 80, 70), anchor='mm')
    out = Image.new('RGB', (PW, PH + 120), (255, 255, 255)); out.paste(im, (0, 0)); d = ImageDraw.Draw(out)
    d.text((10, PH + 10), time, font=F(BOLD, 24), fill=BUILT)
    y = PH + 44
    for line in wrap(title, 46): d.text((10, y), line, font=F(REG, 20), fill=BUILT); y += 25
    return out

def wrap(s, n):
    out, cur = [], ''
    for w in s.split():
        if len(cur) + len(w) + 1 > n: out.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return out + [cur]

# ---- the eight templates --------------------------------------------------------------------------------------------------
T = {}

T['f1'] = ('A slice of what\'s new', 'New drop: what\'s in it', '15 s', [
    ('0-2 s', 'Hook: a huge pumpkin pie from above spins in, big words land', 'rust plaid blanket', lambda d: (
        prop(d, (40, 700, 1040, 1700), 'pumpkin pie\n(photo, top view)', 'circle'), text(d, (540, 360), 'SOMETHING NEW', 110), text(d, (540, 520), '[the fall drop]', 70, 'edit'))),
    ('2-4.5 s', 'Slice 1 lifts away to the top right; clip 1 plays in the gap', 'rust plaid blanket', lambda d: (
        wedges(d, (40, 700, 1040, 1700), ['CLIP 1', '', '', '', '', '']), prop(d, (720, 330, 1000, 640), 'slice\n(photo)', 'rect'),
        arrow(d, (700, 900), (840, 640), 'lifts'), text(d, (330, 460), '[item 1]', 80, 'edit'))),
    ('4.5-7 s', 'The pie turns; slice 2 lifts; two clips now show (2 per screen)', 'rust plaid blanket', lambda d: (
        wedges(d, (40, 700, 1040, 1700), ['CLIP 1', 'CLIP 2', '', '', '', '']), arrow(d, (900, 1200), (1000, 1000), 'lifts'), text(d, (330, 460), '[item 2]', 80, 'edit'))),
    ('7-8.5 s', 'TEXT ONLY: the point, huge, no video', 'pie crust (photo), full screen', lambda d: (
        text(d, (540, 760), 'JUST', 210), text(d, (500, 1000), 'BAKED', 200), text(d, (540, 1250), '[launches Friday]', 70, 'edit'))),
    ('8.5-11 s', 'The last slices lift: a whole pie of clips', 'rust plaid blanket', lambda d: (
        wedges(d, (40, 560, 1040, 1560), ['CLIP 1', 'CLIP 2', 'CLIP 3', 'CLIP 4', 'CLIP 1', 'CLIP 2']), text(d, (540, 330), "here's the whole drop", 60, 'edit'))),
    ('11-13 s', 'We zoom into one wedge: clip 4 fills the screen', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 4 (full)'), arrow(d, (540, 1200), (540, 700), 'zoom in'), text(d, (420, 1380), '[the hero piece]', 72, 'edit'))),
    ('13-15 s', 'CTA: whipped-cream slices (photos) pop in, comment keyword', 'rust plaid blanket', lambda d: (
        clip(d, (240, 300, 840, 1000), 'CLIP 4', 'circle'), prop(d, (60, 1560, 420, 1880), 'slice +\ncream'), prop(d, (660, 1560, 1020, 1880), 'slice +\ncream'),
        text(d, (540, 1150), 'COMMENT', 120), text(d, (500, 1330), '[SLICE] for the link', 66, 'edit'))),
])

T['f2'] = ('Made by hand', 'Shows the work behind the product', '30 s', [
    ('0-2 s', 'Hook: fast cuts, 4 clips in 2 seconds, under big bold words', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIPS 1-4, 0.5 s each'), text(d, (540, 520), 'MADE', 190), text(d, (540, 720), 'BY HAND', 170), text(d, (540, 880), '[7 am to ship day]', 56, 'edit'))),
    ('2-6 s', 'The brass clock (photo) swings in; its face is clip 5; the hands sweep', 'barn wood (photo)', lambda d: (
        prop(d, (40, 560, 1040, 1560), 'clock (photo)', 'circle'), clip(d, (140, 660, 940, 1460), 'CLIP 5', 'circle'), prop(d, (60, 280, 420, 600), 'kraft tag'), text(d, (240, 470), '[7 AM]', 64, 'edit'))),
    ('6-10 s', '2 clips per screen, split on the diagonal by the giant minute hand (photo)', 'none', lambda d: (
        d.polygon(sc(0, 0, 1080, 0, 1080, 300, 0, 1300), fill=CLIPC), d.polygon(sc(0, 1300, 1080, 300, 1080, 1920, 0, 1920), fill=(120, 120, 126)),
        prop(d, (-40, 760, 1120, 840), 'minute hand (photo)', drawn=False), text(d, (300, 420), 'CLIP 6', 50), text(d, (700, 1400), 'CLIP 7', 50),
        text(d, (300, 560), '[cutting]', 64, 'edit'), text(d, (600, 1300), '[packing]', 64, 'edit'))),
    ('10-12 s', 'TEXT ONLY: the point, huge, no video', 'barn wood (photo)', lambda d: (
        text(d, (540, 650), 'EVERY.', 190), text(d, (540, 880), 'SINGLE.', 190), text(d, (540, 1110), 'ONE.', 220))),
    ('12-20 s', 'The clock face splits into 3 wedges, each a step; hands move wedge to wedge', 'barn wood (photo)', lambda d: (
        prop(d, (60, 540, 1020, 1500), 'clock', 'circle', drawn=False), wedges(d, (140, 620, 940, 1420), ['CLIP 8', 'CLIP 9', 'CLIP 10']),
        prop(d, (720, 260, 1000, 520), 'tag'), text(d, (860, 420), '[1 PM]', 54, 'edit'))),
    ('20-25 s', 'The active wedge swings open: the finished product fills the screen', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 11: the finished product'), prop(d, (80, 1100, 520, 1480), 'kraft tag'), text(d, (300, 1300), '[name] [$48]', 60, 'edit'))),
    ('25-30 s', 'CTA: zoom out to the clock on the wall; farm-stand sign (photo)', 'barn wood (photo)', lambda d: (
        prop(d, (240, 300, 840, 900), 'clock', 'circle'), wedges(d, (300, 360, 780, 840), ['C 8', 'C 9', 'C 11']), text(d, (540, 1080), 'COMMENT', 120),
        prop(d, (90, 1180, 990, 1520), 'farm-stand sign (photo)'), text(d, (540, 1300), '[SHOP]', 110, 'edit'))),
])

T['f3'] = ('Falling for it', 'Reviews of the product', '22 s', [
    ('0-2.5 s', 'Hook: clip 1 framed all round by real leaves (one kind, each different)', 'none', lambda d: (
        clip(d, (140, 260, 940, 1660), 'CLIP 1 (the product)'), [prop(d, (x, y, x + 220, y + 220), 'leaf', 'leaf', drawn=False) for x, y in ((-60, 160), (300, 120), (700, 140), (900, 500), (-80, 700), (920, 1050), (-60, 1300), (880, 1500), (300, 1640), (620, 1680))],
        text(d, (540, 760), 'WHY THEY KEEP', 100), text(d, (540, 920), 'COMING BACK', 110))),
    ('2.5-4 s', 'TEXT ONLY: the point, huge, gold foil stars (photos) pop in', 'wall of leaves (photo)', lambda d: (
        text(d, (540, 820), '5', 380), text(d, (540, 1150), 'STARS', 210), [prop(d, (x, 1300, x + 120, 1420), 'star', 'circle', drawn=False) for x in (190, 330, 470, 610, 750)])),
    ('4-8 s', 'Clip 2 full; review 1 lands on a recipe card (photo)', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 2'), prop(d, (100, 900, 900, 1380), 'recipe card (photo)'), text(d, (500, 1100), '["best thing I bought"]', 50, 'edit'), text(d, (500, 1200), '[- Sam R.]', 46, 'edit'))),
    ('8-10 s', 'Transition: leaves pour across the screen, then thin out onto clip 3', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 2 > CLIP 3'), [prop(d, (x, y, x + 240, y + 240), 'leaf', 'leaf', drawn=False) for x, y in ((0, 300), (380, 200), (760, 380), (120, 760), (560, 700), (820, 980), (40, 1200), (420, 1150), (700, 1450))])),
    ('10-15 s', '2 clips stacked, a real leafy branch along the seam; review 2 on a note card', 'none', lambda d: (
        clip(d, (0, 0, 1080, 950), 'CLIP 3'), clip(d, (0, 970, 1080, 1920), 'CLIP 4'), prop(d, (-40, 880, 1120, 1040), 'leafy branch (photo)', drawn=False),
        prop(d, (120, 300, 760, 640), 'note card'), text(d, (440, 470), '["ordered 3 more"]', 46, 'edit'))),
    ('15-19 s', 'Clip 5; real acorns all along the ground, each different; review 3 on a kraft tag', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 5'), [prop(d, (x, 1650, x + 170, 1860), 'acorn', 'circle') for x in (20, 230, 450, 660, 880)],
        prop(d, (120, 900, 560, 1400), 'kraft tag'), text(d, (340, 1200), '["worth it"]', 50, 'edit'))),
    ('19-22 s', 'CTA: the last clip inside a big leaf-shaped window', 'misty forest (photo)', lambda d: (
        clip(d, (140, 260, 940, 1100), 'CLIP 5', 'leaf'), text(d, (540, 1250), 'COMMENT', 120), text(d, (540, 1400), '[FALL] to shop', 70, 'edit'))),
])

T['f4'] = ('Pick of the bunch', 'Product options: colours, scents, flavours', '15 s', [
    ('0-2 s', 'Hook: clip 1; 4 real apples bob along the bottom, each played with differently', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 1 (all options)'), [prop(d, (x, 1560, x + 250, 1830), lab, 'apple') for x, lab in ((10, 'dots'), (280, 'stars'), (550, 'stripes'), (820, 'label'))],
        text(d, (540, 520), "WHICH ONE'S", 120), text(d, (540, 680), 'YOURS?', 150))),
    ('2-3.5 s', 'TEXT ONLY: the point, huge; the apples line up underneath', 'red plaid (photo)', lambda d: (
        text(d, (540, 800), 'PICK', 260), text(d, (540, 1080), 'ONE', 260), [prop(d, (x, 1560, x + 230, 1800), str(i + 1), 'apple', drawn=False) for i, x in enumerate((40, 300, 560, 820))])),
    ('3.5-6 s', 'Apple 1 grows huge: clip 2 (option 1) plays inside the apple', 'red plaid (photo)', lambda d: (
        clip(d, (90, 400, 990, 1400), 'CLIP 2', 'apple'), prop(d, (60, 360, 1020, 1440), '', 'apple'), text(d, (520, 1450), '[option 1: cinnamon]', 54, 'edit'))),
    ('6-8.5 s', 'Apple 1 rolls out left, apple 2 rolls in with clip 3', 'red plaid (photo)', lambda d: (
        clip(d, (-400, 500, 300, 1300), 'CLIP 2', 'apple'), clip(d, (300, 450, 1060, 1300), 'CLIP 3', 'apple'), arrow(d, (300, 1400), (60, 1400), 'rolls'), text(d, (560, 1420), '[option 2]', 64, 'edit'))),
    ('8.5-11 s', '2 per screen: apples 3 and 4 side by side, each a clip', 'red plaid (photo)', lambda d: (
        clip(d, (20, 600, 530, 1150), 'CLIP 4', 'apple'), clip(d, (550, 600, 1060, 1150), 'CLIP 5', 'apple'), text(d, (270, 1240), '[option 3]', 56, 'edit'), text(d, (760, 1240), '[option 4]', 56, 'edit'))),
    ('11-15 s', 'CTA: all four apple windows on the real crate, numbered by hand', 'red plaid (photo)', lambda d: (
        [clip(d, (x, 1000, x + 240, 1250), f'C{i + 2}', 'apple') for i, x in enumerate((20, 285, 550, 815))], prop(d, (0, 1260, 1080, 1920), 'apple crate (photo)', drawn=False),
        text(d, (540, 480), 'COMMENT', 130), text(d, (540, 640), 'YOUR NUMBER', 90))),
])

T['f5'] = ('All dressed up', 'Gift set or upgrade: everything you get', '15 s', [
    ('0-2 s', 'Hook: clip 1 (the product, plain); a huge plain pumpkin (photo) in the corner', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 1'), prop(d, (560, 1300, 1160, 1920), 'plain pumpkin', 'circle'), text(d, (520, 500), 'DRESSED UP', 130), text(d, (520, 650), '[the gift set]', 70, 'edit'))),
    ('2-5 s', 'A gold paint stroke (photo) swipes across as the wipe to clip 2; the pumpkin gets a gold stripe', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 1 > CLIP 2'), prop(d, (-60, 820, 1140, 1080), 'gold paint stroke (photo)', drawn=False), text(d, (420, 1300), '+ [the candle]', 72, 'edit'))),
    ('5-7.5 s', 'A gem (photo) pops onto the pumpkin; clip 3 in a round window', 'cream knit (photo)', lambda d: (
        clip(d, (140, 300, 940, 1100), 'CLIP 3', 'circle'), prop(d, (560, 1250, 1100, 1800), 'pumpkin + stripe + gem', 'circle'), text(d, (380, 1250), '+ [the mug]', 72, 'edit'))),
    ('7.5-9 s', 'TEXT ONLY: the point, huge', 'cream knit (photo)', lambda d: (
        text(d, (540, 760), 'AND', 200), text(d, (540, 980), "THERE'S", 180), text(d, (540, 1200), 'MORE', 230))),
    ('9-12 s', 'A bow (photo) lands on the pumpkin; 2 clips per screen, side by side', 'cream knit (photo)', lambda d: (
        clip(d, (40, 300, 530, 1100), 'CLIP 4'), clip(d, (550, 300, 1040, 1100), 'CLIP 5'), prop(d, (300, 1250, 800, 1750), 'pumpkin + bow', 'circle'), text(d, (420, 1200), '+ [2 bonuses]', 64, 'edit'))),
    ('12-15 s', 'CTA: the decorated pumpkin stack (photos) with the price on a kraft tag', 'cream knit (photo)', lambda d: (
        prop(d, (300, 900, 800, 1400), 'pumpkin', 'circle'), prop(d, (220, 1350, 880, 1900), 'pumpkin', 'circle'), prop(d, (620, 600, 960, 900), 'kraft tag'), text(d, (790, 760), '[$49]', 70, 'edit'),
        text(d, (430, 420), 'COMMENT', 120), text(d, (430, 570), '[GIFT]', 90, 'edit'))),
])

T['f6'] = ('Burning questions', 'Answers what people ask before buying', '30 s', [
    ('0-2.5 s', 'Hook: clip 1 with a real bonfire in front, embers rising', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 1'), prop(d, (0, 1300, 1080, 1920), 'bonfire (photo)', drawn=False), text(d, (540, 480), 'BURNING', 170), text(d, (540, 680), 'QUESTIONS', 130))),
    ('2.5-5 s', 'Question 1 rises out of the fire on a note card (photo)', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 1'), prop(d, (0, 1400, 1080, 1920), 'bonfire', drawn=False), prop(d, (110, 700, 900, 1150), 'note card'), text(d, (500, 860), 'Q:', 70), text(d, (500, 990), '[does it work for me?]', 52, 'edit'),
        arrow(d, (500, 1350), (500, 1180), 'rises'))),
    ('5-10 s', 'The answer: clip 2 shows the product doing it', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 2'), text(d, (480, 1300), 'A: [yes, here\'s how]', 66, 'edit'))),
    ('10-11 s', 'Transition: the flames rise and take over the screen', 'none', lambda d: (
        clip(d, (0, 0, 1080, 800), 'CLIP 2'), prop(d, (0, 600, 1080, 1920), 'bonfire, huge', drawn=False), arrow(d, (540, 1400), (540, 900), 'rises'))),
    ('11-16 s', 'Split: a real lit candle on the left, clip 3 on the right; question 2', 'night', lambda d: (
        prop(d, (0, 0, 480, 1920), 'candle (photo)', drawn=False), clip(d, (500, 0, 1080, 1920), 'CLIP 3'), prop(d, (160, 380, 900, 760), 'note card'), text(d, (520, 560), '[how long does it last?]', 46, 'edit'))),
    ('16-18 s', 'TEXT ONLY: the point, huge; question 3 below', 'night + embers (photo)', lambda d: (
        text(d, (540, 640), 'THE', 180), text(d, (540, 880), 'BIG ONE', 190), prop(d, (160, 1080, 920, 1440), 'note card'), text(d, (540, 1260), '[is it worth it?]', 54, 'edit'))),
    ('18-25 s', 'The answer: 2 clips stacked (the product, close up and in use)', 'none', lambda d: (
        clip(d, (0, 0, 1080, 950), 'CLIP 4'), clip(d, (0, 970, 1080, 1920), 'CLIP 5'), text(d, (480, 480), 'A: [100%, here\'s why]', 60, 'edit'))),
    ('25-30 s', 'CTA: the product clip in a glowing round window above the fire', 'night', lambda d: (
        clip(d, (190, 300, 890, 1000), 'CLIP 6', 'circle'), prop(d, (0, 1450, 1080, 1920), 'bonfire', drawn=False), text(d, (540, 1150), 'COMMENT', 120), text(d, (540, 1320), '[SHOP]', 100, 'edit'))),
])

T['f7'] = ('Cozy season pick', 'The product in everyday use', '15 s', [
    ('0-2 s', 'Hook: a huge coffee cup from above (photo); clip 1 (the product) plays in the cup; steam rises', 'corduroy (photo)', lambda d: (
        prop(d, (-60, 650, 1140, 1850), 'cup + saucer (photo)', 'circle'), clip(d, (190, 900, 890, 1600), 'CLIP 1', 'circle'), text(d, (540, 380), 'THE COZY', 140), text(d, (540, 560), 'EDIT', 170))),
    ('2-3.5 s', 'We dive into the cup: clip 1 fills the screen', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 1 (full)'), arrow(d, (540, 1300), (540, 900), 'zoom in'), text(d, (420, 1350), '[the cozy candle]', 70, 'edit'))),
    ('3.5-4.5 s', 'Transition: the real plaid blanket rises from the bottom', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 1'), prop(d, (0, 900, 1080, 1920), 'plaid blanket (photo)', drawn=False), arrow(d, (540, 1500), (540, 1000), 'rises'))),
    ('4.5-6 s', 'TEXT ONLY: the point, huge, on the blanket', 'plaid blanket (photo), full screen', lambda d: (
        text(d, (540, 820), 'COZY', 250), text(d, (510, 1100), 'SEASON', 180))),
    ('6-10 s', 'On the blanket: 2 product clips in hand-drawn frames, with labels', 'plaid blanket (photo)', lambda d: (
        clip(d, (60, 280, 640, 1000), 'CLIP 2'), clip(d, (440, 1000, 1020, 1720), 'CLIP 3'), text(d, (820, 500), '(01)', 70), text(d, (800, 600), '[on the desk]', 50, 'edit'),
        text(d, (250, 1150), '(02)', 70), text(d, (260, 1250), '[by the bath]', 50, 'edit'))),
    ('10-11 s', 'The blanket drops away to reveal clip 4', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 4'), prop(d, (0, 1300, 1080, 1920), 'blanket', drawn=False), arrow(d, (540, 1350), (540, 1750), 'drops'))),
    ('11-15 s', 'CTA: three cups from above (photos), each playing a clip', 'corduroy (photo)', lambda d: (
        [clip(d, (x, 300, x + 300, 600), f'CLIP {i + 2}', 'circle') for i, x in enumerate((60, 390, 720))], [prop(d, (x - 30, 270, x + 330, 630), '', 'circle', drawn=False) for x in (60, 390, 720)],
        text(d, (540, 900), 'SHOP THE', 120), text(d, (540, 1060), 'COZY EDIT', 120), text(d, (540, 1250), 'comment [COZY]', 70, 'edit'))),
])

T['f8'] = ('Sneak peek', 'Launch teaser', '15 s', [
    ('0-2 s', 'Hook: real tree bark fills the screen; through a knot hole, clip 1 (a glimpse)', 'tree bark (photo, NEEDED)', lambda d: (
        clip(d, (360, 820, 720, 1180), 'CLIP 1', 'circle'), prop(d, (300, 760, 780, 1240), 'knot hole', 'circle'), text(d, (540, 480), 'PSST...', 180))),
    ('2-4 s', 'We push in toward the hole; it grows', 'tree bark (photo)', lambda d: (
        clip(d, (140, 560, 940, 1360), 'CLIP 1', 'circle'), prop(d, (80, 500, 1000, 1420), 'knot hole', 'circle'), arrow(d, (540, 1500), (540, 1300), 'push in'), text(d, (540, 360), '[something new]', 70, 'edit'))),
    ('4-6 s', 'TEXT ONLY: the point, huge, on the bark', 'tree bark (photo)', lambda d: (
        text(d, (540, 800), 'COMING', 200), text(d, (540, 1050), 'SOON', 250))),
    ('6-8.5 s', 'A second peek: through the hole of a real cider donut (photo)', 'burlap (photo)', lambda d: (
        prop(d, (90, 520, 990, 1420), 'cider donut (photo)', 'circle'), clip(d, (360, 790, 720, 1150), 'CLIP 2', 'circle'), text(d, (540, 360), '[a little closer]', 66, 'edit'))),
    ('8.5-11 s', 'Through the hole into clip 3: the full reveal', 'none', lambda d: (
        clip(d, (0, 0, 1080, 1920), 'CLIP 3: the product, revealed'), prop(d, (300, 200, 780, 320), 'kraft tag'), text(d, (540, 1300), '[drops Oct 30]', 80, 'edit'))),
    ('11-15 s', 'CTA: the product clip back in the knot hole, comment for first access', 'tree bark (photo)', lambda d: (
        clip(d, (240, 340, 840, 940), 'CLIP 3', 'circle'), prop(d, (200, 300, 880, 980), 'knot hole', 'circle'), text(d, (540, 1150), 'COMMENT', 120), text(d, (540, 1320), '[PEEK] for first access', 60, 'edit'))),
])

def legend():
    im = Image.new('RGB', (PW, PH + 120), (255, 255, 255)); d = ImageDraw.Draw(im); y = 40
    d.text((20, y), 'How to read these', font=F(BOLD, 30), fill=BUILT); y += 70
    clip(d, (40, (y + 10) / S, 300, (y + 110) / S), 'CLIP'); d.text((180, y + 40), "= the buyer's clip", font=F(REG, 22), fill=BUILT); y += 150
    prop(d, (40, (y) / S, 300, (y + 110) / S), 'prop'); d.text((180, y + 40), '= real photo prop', font=F(REG, 22), fill=BUILT)
    d.text((180, y + 68), '+ hand-drawn outline', font=F(REG, 22), fill=BUILT); y += 160
    d.text((20, y), 'BIG BLACK', font=F(BOLD, 34), fill=BUILT); d.text((230, y + 6), '= built-in fun lettering', font=F(REG, 22), fill=BUILT); y += 70
    d.text((20, y), '[blue]', font=F(BOLD, 34), fill=EDIT); d.text((150, y + 6), '= words the buyer edits', font=F(REG, 22), fill=BUILT); y += 70
    d.rectangle((20, y, 120, y + 40), fill=(248, 210, 205)); d.text((140, y + 8), '= Instagram covers it: no words', font=F(REG, 22), fill=BUILT); y += 80
    for line in wrap('Fonts, colours and exact props come at the motion test. These only show the order, the layout and the words.', 40):
        d.text((20, y), line, font=F(REG, 22), fill=NOTE); y += 30
    return im

def data_uri(im):
    b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=86); return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()

def main():
    sections = []
    lg = data_uri(legend())
    for tid, (name, job, length, beats) in T.items():
        panels = [panel(t, title, bg, fn) for t, title, bg, fn in beats]
        strip = Image.new('RGB', (len(panels) * (PW + 16), PH + 120), (255, 255, 255))
        for i, p in enumerate(panels): strip.paste(p, (i * (PW + 16), 0))
        strip.save(OUT / f'{tid}.png')
        cards = ''.join(f'<figure><img src="{data_uri(p)}"><textarea data-k="{tid} beat {i + 1}" placeholder="Notes on this beat"></textarea></figure>' for i, p in enumerate(panels))
        sections.append(f'<section><h2>{tid} {html.escape(name)} <small>{html.escape(job)} &middot; {length}</small></h2>'
                        f'<label class="ok"><input type="checkbox" data-k="{tid} APPROVED"> Approved</label>'
                        f'<textarea class="all" data-k="{tid} overall" placeholder="Notes on this whole template"></textarea><div class="row">{cards}</div></section>')
    page = PAGE.replace('LEGEND', lg).replace('ROWS', ''.join(sections))
    (OUT / 'review.html').write_text(page, encoding='utf-8'); print('saved', OUT / 'review.html')

PAGE = '''<!doctype html><html><head><meta charset="utf-8"><title>Fall wireframes</title><style>
body{margin:0;padding:16px 20px 90px;background:#f1ece4;font:15px Arial,sans-serif;color:#1b1a19}
h1{font-size:22px;margin:0 0 4px} h2{font-size:19px;margin:30px 0 6px} h2 small{font-weight:normal;color:#6b645c;font-size:15px}
.top{display:flex;gap:20px;align-items:flex-start} .top img{width:220px;border-radius:6px}
.row{display:flex;gap:12px;overflow-x:auto;padding-bottom:8px}
figure{margin:0;flex:0 0 240px} img{width:240px;border-radius:6px;display:block;cursor:zoom-in}
textarea{width:100%;box-sizing:border-box;height:70px;font:14px Arial;padding:6px;border:1px solid #c9bfb2;border-radius:6px;margin-top:6px}
textarea.all{height:44px;max-width:960px} .ok{font-weight:bold;display:inline-block;margin:0 0 6px}
#bar{position:fixed;left:0;right:0;bottom:0;background:#1b1a19;color:#fff;padding:12px 20px;display:flex;gap:14px;align-items:center}
button{font:bold 15px Arial;padding:10px 18px;border:0;border-radius:6px;background:#ec7824;color:#fff;cursor:pointer}
#big{position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center} #big img{max-height:94vh;width:auto}
</style></head><body><div class="top"><img src="LEGEND"><div><h1>Fall pack wireframes</h1>
<p>One panel per beat: where the clips, real props and words go. Tick <b>Approved</b> on the ones you want, or type notes under any beat.
Notes save as you type and reach Claude automatically. Click a panel to see it big.</p></div></div>
ROWS<div id="bar"><button id="save">Send notes to Claude</button><button id="copy">Copy all notes</button><span id="msg"></span></div><div id="big"><img></div>
<script>
const els=[...document.querySelectorAll('textarea,input[type=checkbox]')], msg=document.getElementById('msg');
const val=e=>e.type==='checkbox'?(e.checked?'yes':''):e.value.trim();
els.forEach(e=>{try{const v=localStorage.getItem('fw1:'+e.dataset.k);if(v!==null){if(e.type==='checkbox')e.checked=v==='yes';else e.value=v}}catch(x){}
 const h=()=>{try{localStorage.setItem('fw1:'+e.dataset.k,val(e))}catch(x){};clearTimeout(window._s);window._s=setTimeout(send,600)};e.oninput=h;e.onchange=h});
function send(){const o={};els.forEach(e=>{if(val(e))o[e.dataset.k]=val(e)});
 fetch('/notes?to=fall/wireframes/notes.json',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)}).then(r=>{msg.textContent=r.ok?'Notes saved. Claude can read them.':'Could not save notes.'}).catch(()=>{msg.textContent='Could not save notes (open it through the link Claude gave you).'})}
document.getElementById('save').onclick=send;
document.getElementById('copy').onclick=async()=>{const s=els.filter(e=>val(e)).map(e=>e.dataset.k+': '+val(e)).join('\\n');try{await navigator.clipboard.writeText(s);msg.textContent='Copied. Paste it in the chat.'}catch(x){msg.textContent='Copy failed.'}};
const big=document.getElementById('big');document.querySelectorAll('figure img,.top img').forEach(i=>i.onclick=()=>{big.firstChild.src=i.src;big.style.display='flex'});big.onclick=()=>big.style.display='none';
</script></body></html>'''

if __name__ == '__main__':
    main()
