"""The matching carousel for 09 Who it's for (prototype, 2026-10-18): 8 slides at 1080 x 1440 (3:4, the vault's
carousel size) that tell the Reel's story in the Reel's own world (ruled notebook paper, wine + pink, striped and
dotted butterflies, the pink-striped alarm clock, paper balls, pinned sticky notes, DM Serif built-in words).

Delivery: a .pptx the buyer drags into Canva Free (desktop browser), the path proven on the $1K Challenge library:
exact page size, editable text, photo Replace works, page notes carry over. Three kinds of layer:
  art    built-in artwork (real objects with play, doodles, DM Serif lettering), a PNG the buyer leaves alone
  photo  a photo slot the buyer swaps (Replace in Canva); previews show stand-in stills from her July clips
  text   editable words in Montserrat Bold (in Canva's library and CapCut's) on a highlight box
  guide  blue notes: "everything blue is a guide, delete it before you download"
Usage: python build/carousel_09.py  ->  09-who-its-for/carousel/ (slide PNGs, contact sheet, the .pptx)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import play as P
import storyboard_b2 as S
import story7 as S7
from collage_kit import doodle
from lettering_b2 import FONT
from motion_b2 import Clip

CW, CH = 1080, 1440
WINE, PINK, WHITE, INK = P.PAL['wine'], P.PAL['pink'], (255, 255, 255), (24, 23, 22)
GUIDE = (37, 99, 235)
MONT = FONT['montserrat']
OUT = S.E.PACK / '09-who-its-for' / 'carousel'
NAME = 'Template 09 - Who its for - Carousel'

# ---- layers ------------------------------------------------------------------------------------------------------------
def art(img, c, rot=0, name='art'): return dict(kind='art', img=img, c=c, rot=rot, name=name)
def photo(slot, c, size, rot=0, still=None, shape='rect', gray=False): return dict(kind='photo', slot=slot, c=c, size=size, rot=rot, still=still, shape=shape, gray=gray)
def text(words, px, c, rot=0, box=WHITE, fg=INK, pill=False): return dict(kind='text', words=words, px=px, c=c, rot=rot, box=box, fg=fg, pill=pill)
def guide(words, c, px=30): return dict(kind='guide', words=words, px=px, c=c, rot=0, box=GUIDE, fg=WHITE, pill=False)

def mfont(px): return ImageFont.truetype(MONT, px)

def text_box(L):
    """The words' box in px, the same numbers the .pptx uses: (w, h, pad_x, pad_y, line_h)."""
    f = mfont(L['px']); lines = L['words'].split('\n'); lh = L['px'] * 1.22
    pad_x = L['px'] * (0.55 if L['pill'] else 0.28); pad_y = L['px'] * (0.22 if L['pill'] else 0.12)
    w = max(f.getlength(l) for l in lines) + 2 * pad_x; h = lh * len(lines) + 2 * pad_y
    return int(w), int(h), pad_x, pad_y, lh

def text_img(L):
    w, h, px_, py_, lh = text_box(L); f = mfont(L['px']); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if L['box']:
        if L['pill']: d.rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=L['box'] + (255,))
        else: d.rectangle((0, 0, w - 1, h - 1), fill=L['box'] + (255,))
    for k, l in enumerate(L['words'].split('\n')): d.text((w / 2, py_ + lh * (k + 0.5)), l, font=f, fill=L['fg'], anchor='mm')
    return im

def word(t, px, color=WHITE, italic_last=True):
    """A built-in DM Serif line (last word Italic), words set tight like the Reel's lettering."""
    ws = t.split(); ims = [P.story_word(w_, px, color, edge=WINE, italic=(italic_last and i == len(ws) - 1 and len(ws) > 1)) for i, w_ in enumerate(ws)]
    step = [im.width - 80 + int(px * 0.24) for im in ims]; out = Image.new('RGBA', (sum(step[:-1]) + ims[-1].width, max(im.height for im in ims)), (0, 0, 0, 0)); x = 0
    for im, st in zip(ims, step): out.alpha_composite(im, (x, (out.height - im.height) // 2)); x += st
    return out

def torn_card(size, seed, margin=26):
    """Torn white paper behind a photo slot: its ragged edge shows round the photo."""
    w, h = size[0] + 2 * margin, size[1] + 2 * margin; card = Image.new('RGBA', (w, h), (252, 250, 245, 255))
    card.putalpha(C.torn_mask((w, h), seed, 14, 'tblr')); return C.shadow(card, (8, 14), 14, 100)

def round_card(d, margin=18):
    im = Image.new('RGBA', (d + 2 * margin, d + 2 * margin), (0, 0, 0, 0)); ImageDraw.Draw(im).ellipse((0, 0, d + 2 * margin - 1, d + 2 * margin - 1), fill=(252, 250, 245, 255))
    return C.shadow(im, (8, 14), 14, 100)

def string(a, b, sag=40):
    """A balloon string from a to b (slide coordinates), as its own art layer: (image, centre)."""
    x0, y0 = min(a[0], b[0]) - sag - 10, min(a[1], b[1]) - 10; x1, y1 = max(a[0], b[0]) + sag + 10, max(a[1], b[1]) + 10
    im = Image.new('RGBA', (int(x1 - x0), int(y1 - y0)), (0, 0, 0, 0)); mid = ((a[0] + b[0]) / 2 + sag, (a[1] + b[1]) / 2)
    pts = [((1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mid[0] + u * u * b[0] - x0, (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * mid[1] + u * u * b[1] - y0) for u in [i / 24 for i in range(25)]]
    ImageDraw.Draw(im).line(pts, fill=(120, 108, 100, 255), width=4)
    return im, ((x0 + x1) / 2, (y0 + y1) / 2)

def phone_art(w):
    """The real green-screen phone with a dark screen, and where its screen sits inside the art (for the photo slot)."""
    im, m, bb = P.device(S7.PHONE, w); im = im.copy(); dark = Image.new('RGBA', im.size, (20, 20, 22, 255)); im.paste(dark, (0, 0), m)
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g_, b_, a = px[x, y]
            if a and g_ > 120 and g_ > r + 40 and g_ > b_ + 40: px[x, y] = (20, 20, 22, a)
    edge = 8; cut = P.die_cut(im, edge, shadow=False); shadowed = C.shadow(cut, (8, 14), 14, 90)
    off = (edge + 4) + (shadowed.width - cut.width) // 2
    return shadowed, (bb[0] + off, bb[1] + off, bb[2] + off, bb[3] + off)

# ---- the slides ----------------------------------------------------------------------------------------------------------
def slides():
    me, me2, prob, prod = Clip('IMG_1469', 1.0, 6.0), Clip('IMG_1470', 1.0, 6.0), Clip('IMG_1430', 1.0, 6.0), Clip('IMG_1381', 1.0, 6.0)
    bf = [P.thing(P.BUTTERFLIES[i % 3], 230, ('stripes', 'dots', 'smalldots')[i % 3], (WINE, PINK, WINE)[i % 3], scale=0.3, strength=0.75, seed=i, edge=6) for i in range(6)]
    small_bf = [b.resize((int(b.width * 0.72), int(b.height * 0.72)), Image.LANCZOS) for b in bf]
    balls = [P.thing('Crumpled cream paper ball-58.png', 170 + 20 * (i % 3), ('stripes', 'dots', 'smalldots')[i % 3], (PINK, WINE, PINK)[i % 3], scale=0.3, strength=0.6, seed=i, edge=6) for i in range(5)]
    clock = P.thing('Classic Cream Twin-Bell Alarm Clock-185.png', 560, 'stripes', PINK, scale=0.5, strength=0.85)
    gift = P.thing('Kraft paper cube gift with twine-38.png', 270, 'dots', WINE, scale=0.4)
    mug = P.thing('Warm white ceramic coffee mug-140.png', 250, 'dots', PINK, scale=0.4, strength=0.85)
    notes = [P.sticky('', 400, pin=pn) for pn in ('pin-head-black', 'pin-head-cream', 'pin-head-white')]
    ph, scr = phone_art(400); sw, sh = scr[2] - scr[0], scr[3] - scr[1]
    s = []
    # 1 HOOK: the buyer, a butterfly landing on their head; "this is for you"
    s.append(dict(note='Hook. Swap in a photo of you (head near the top, under the butterfly). Edit the [bracket] line to your buyer\'s habit.', layers=[
        art(torn_card((800, 980), 3), (540, 820), -2, 'torn paper'),
        photo('You (head near the top)', (540, 820), (800, 980), -2, me.at(0.3, (800, 980))),
        art(bf[0], (650, 330), -18, 'butterfly'),
        text('if you\n[always run late]', 62, (330, 165), 3),
        art(word('this is', 140, italic_last=False), (400, 1100), -3, 'this is'),
        art(word('for you', 196), (600, 1245), -3, 'for you'),
        art(doodle('under', 0, 330, WINE), (760, 1350), -3, 'underline'),
        art(doodle('icon', 9, 130, WINE), (1005, 1120), 0, 'sparkle'), art(doodle('icon', 10, 90, WINE), (85, 960), 0, 'sparkle'),
        guide('Everything blue is a guide. Delete it before you download.', (540, 1385), 26)]))
    # 2 PROBLEM (graphics only): the alarm clock rings, one burst behind it, paper balls round it
    ring = [(540 + 390 * math.cos(a), 800 + 450 * math.sin(a)) for a in [math.radians(200 + i * 72) for i in range(5)]]
    s.append(dict(note='The everyday problem, no photo needed. Edit the [bracket] line.', layers=[
        art(doodle('burst', 3, 860, WINE), (540, 820), 0, 'burst'),
        art(clock, (540, 820), 6, 'alarm clock')] + [art(b, c, i * 25, 'paper ball') for i, (b, c) in enumerate(zip(balls, ring))] + [
        text('[late. again.]', 80, (540, 220), -3)]))
    # 3 PROBLEM (photo): the moment, in a torn window (black and white)
    s.append(dict(note='Swap in a photo of the everyday problem. Tip: set it to black and white (Edit photo > Filters).', layers=[
        art(torn_card((760, 900), 5), (540, 860), -2, 'torn paper'),
        photo('The everyday problem', (540, 860), (760, 900), -2, prob.at(0.5, (760, 900)), gray=True),
        art(balls[1], (190, 1260), 20, 'paper ball'), art(balls[3], (900, 470), -15, 'paper ball'),
        text('[you lose your\nkeys. again.]', 72, (540, 250), 3),
        guide('Photo: click it, then Replace. Filters > B&W', (540, 1385), 26)]))
    # 4 PRODUCT: meet [PRODUCT NAME]
    s.append(dict(note='Swap in your product photo and type its name.', layers=[
        art(torn_card((720, 840), 7), (560, 930), 2, 'torn paper'),
        photo('Your product', (560, 930), (720, 840), 2, prod.at(0.5, (720, 840))),
        art(word('meet', 200, PINK), (540, 200), 0, 'meet'),
        text('[PRODUCT NAME]', 76, (540, 380), -2, box=WINE, fg=WHITE),
        art(doodle('arrow', 9, 220, WINE), (150, 600), 0, 'arrow'),
        art(bf[1], (900, 520), 20, 'butterfly')]))
    # 5 THE FIX: the product floats up as a balloon, a gift beside it
    sa, sc = string((520, 905), (560, 1440)); ga, gc = string((850, 1110), (600, 1440), -30)
    s.append(dict(note='A second product photo (or the same one). Edit the line to what it fixes, in your words.', layers=[
        art(sa, sc, 0, 'string'), art(ga, gc, 0, 'string'),
        art(round_card(560), (520, 620), 0, 'round paper'),
        photo('Your product, close up', (520, 620), (560, 560), 0, prod.at(2.0, (560, 560)), shape='circle'),
        art(gift, (850, 980), 8, 'gift'),
        art(doodle('icon', 11, 150, WINE), (900, 330), 0, 'sparkle'), art(doodle('icon', 10, 90, WINE), (150, 300), 0, 'sparkle'),
        text('[what it fixes,\nin one line]', 58, (285, 1180), -3)]))
    # 6 WHO IT'S FOR: three pinned sticky notes, a mug
    nxy = (((300, 600), -6), ((770, 830), 5), ((320, 1100), -3))
    def on_note(c, r, k=(0, 22)):
        a = math.radians(r); return (c[0] + k[0] * math.cos(a) + k[1] * math.sin(a), c[1] - k[0] * math.sin(a) + k[1] * math.cos(a))
    s.append(dict(note='Who it\'s for: three kinds of buyer, one per note.', layers=[
        art(word('made for', 150), (540, 210), -2, 'made for'),
        art(mug, (840, 1230), 6, 'mug')] + [art(n, c, r, 'sticky note') for n, (c, r) in zip(notes, nxy)] + [
        text(t, 50, on_note(c, r), r, box=None) for t, (c, r) in zip(('for the\n[6am crowd]', 'for the\n[dog mums]', 'for the\n[busy mums]'), nxy)]))
    # 7 TECH: the phone standing on the page, your product on its screen, a butterfly perched on it
    pc = (560, 790); px0 = pc[0] - ph.width / 2 + (scr[0] + scr[2]) / 2; py0 = pc[1] - ph.height / 2 + (scr[1] + scr[3]) / 2
    s.append(dict(note='Swap in a screenshot of your shop or listing for the phone screen. Edit the line.', layers=[
        art(doodle('burst', 2, 900, PINK), pc, 0, 'burst'),
        art(ph, pc, 0, 'phone'),
        photo('Your shop or listing (screenshot)', (px0, py0), (sw - 6, sh - 6), 0, prod.at(3.0, (sw, sh))),
        art(small_bf[2], (pc[0] - 70, pc[1] - ph.height / 2 + 30), -10, 'butterfly'),
        text('[in my shop now]', 72, (540, 1300), -2)]))
    # 8 CTA: the buyer again, a crown of butterflies; sound like you? Comment [KEYWORD]
    crown = [(330 + i * 84, 360 - 38 * math.sin(math.pi * i / 5)) for i in range(6)]
    s.append(dict(note='Swap in a second photo of you (head near the top, under the crown). Type your keyword.', layers=[
        art(torn_card((860, 1000), 9), (540, 860), 2, 'torn paper'),
        photo('You again (head near the top)', (540, 860), (860, 1000), 2, me2.at(0.3, (860, 1000))),
        ] + [art(small_bf[i], c, (i - 2.5) * 10, 'butterfly') for i, c in enumerate(crown)] + [
        text('sound like you?', 66, (540, 1000), -2),
        art(word('Comment', 190), (540, 1140), 0, 'Comment'),
        text('"[KEYWORD]"', 74, (540, 1290), 2, box=WINE, fg=WHITE, pill=True),
        art(doodle('icon', 10, 80, WHITE), (930, 1080), 0, 'sparkle')]))
    return s

# ---- preview PNGs ----------------------------------------------------------------------------------------------------
def paper():
    return ImageOps.fit(S.raw('physical', 'Blank Ruled Notebook Paper.png'), (CW, CH), Image.LANCZOS).convert('RGBA')

def place(im, item, c, rot):
    it = item.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else item
    im.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def photo_img(L, still):
    w, h = L['size']; v = ImageOps.fit(still.convert('RGBA'), (int(w), int(h)))
    if L['gray']: v = ImageOps.grayscale(v).convert('RGBA')
    if L['shape'] == 'circle': m = Image.new('L', v.size, 0); ImageDraw.Draw(m).ellipse((0, 0, v.width - 1, v.height - 1), fill=255); v.putalpha(m)
    return v

def placeholder(L):
    w, h = int(L['size'][0]), int(L['size'][1]); im = Image.new('RGB', (w, h), (236, 226, 230)); d = ImageDraw.Draw(im)
    d.text((w / 2, h / 2), 'YOUR PHOTO', font=mfont(max(28, w // 12)), fill=WINE, anchor='mm')
    return im

def render(sl, guides=False, stills=True):
    im = paper()
    for L in sl['layers']:
        if L['kind'] == 'art': place(im, L['img'], L['c'], L['rot'])
        elif L['kind'] == 'photo': place(im, photo_img(L, L['still'] if stills else placeholder(L)), L['c'], L['rot'])
        elif L['kind'] == 'text' or (guides and L['kind'] == 'guide'): place(im, text_img(L), L['c'], L['rot'])
    return im.convert('RGB')

# ---- the .pptx ---------------------------------------------------------------------------------------------------------
def pptx(ss, path, tmp):
    from pptx import Presentation
    from pptx.util import Emu, Pt
    from pptx.dml.color import RGBColor
    from pptx.enum.shapes import MSO_SHAPE
    from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
    E = lambda v: Emu(int(round(v * 9525)))
    prs = Presentation(); prs.slide_width, prs.slide_height = E(CW), E(CH); blank = prs.slide_layouts[6]
    tmp.mkdir(parents=True, exist_ok=True); bgp = tmp / 'paper.jpg'; paper().convert('RGB').save(bgp, quality=90); n = 0
    for i, sl in enumerate(ss, 1):
        slide = prs.slides.add_slide(blank)
        slide.shapes.add_picture(str(bgp), 0, 0, E(CW), E(CH)).name = 'paper (background)'
        for L in sl['layers']:
            if L['kind'] in ('art', 'photo'):
                n += 1; p = tmp / f'{n:03d}.png'
                im = L['img'] if L['kind'] == 'art' else placeholder(L)
                im.save(p); w, h = (im.width, im.height) if L['kind'] == 'art' else L['size']
                pic = slide.shapes.add_picture(str(p), E(L['c'][0] - w / 2), E(L['c'][1] - h / 2), E(w), E(h))
                pic.rotation = -L['rot']; pic.name = L['name'] if L['kind'] == 'art' else 'PHOTO: ' + L['slot']
                if L['kind'] == 'photo' and L['shape'] == 'circle': pic.auto_shape_type = MSO_SHAPE.OVAL
            else:
                w, h, pad_x, pad_y, lh = text_box(L)
                shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if L['pill'] else MSO_SHAPE.RECTANGLE,
                                             E(L['c'][0] - w / 2), E(L['c'][1] - h / 2), E(w), E(h))
                if L['pill']: shp.adjustments[0] = 0.5
                shp.rotation = -L['rot']; shp.line.fill.background(); shp.shadow.inherit = False
                if L['box']: shp.fill.solid(); shp.fill.fore_color.rgb = RGBColor(*L['box'])
                else: shp.fill.background()
                tf = shp.text_frame; tf.word_wrap = False; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
                tf.margin_left = tf.margin_right = E(pad_x); tf.margin_top = tf.margin_bottom = E(pad_y)
                for k, line in enumerate(L['words'].split('\n')):
                    para = tf.paragraphs[0] if k == 0 else tf.add_paragraph(); para.alignment = PP_ALIGN.CENTER; para.line_spacing = Pt(lh * 0.75)
                    r = para.add_run(); r.text = line; r.font.name = 'Montserrat'; r.font.bold = True; r.font.size = Pt(L['px'] * 0.75); r.font.color.rgb = RGBColor(*L['fg'])
                shp.name = 'GUIDE (delete)' if L['kind'] == 'guide' else 'TEXT: ' + L['words'].replace('\n', ' ')
        slide.notes_slide.notes_text_frame.text = f'Slide {i}. ' + sl['note']
    prs.save(str(path))

def main():
    ss = slides(); OUT.mkdir(parents=True, exist_ok=True); (OUT / 'slides').mkdir(exist_ok=True)
    ims = []
    for i, sl in enumerate(ss, 1):
        im = render(sl); im.save(OUT / 'slides' / f'{i:02d}.png'); ims.append(im)
    th = [im.resize((360, 480), Image.LANCZOS) for im in ims]; sheet = Image.new('RGB', (len(th) * 372 + 12, 492), (255, 255, 255))
    for i, t in enumerate(th): sheet.paste(t, (12 + i * 372, 6))
    sheet.save(OUT / 'contact-sheet.jpg', quality=88)
    blank = [render(sl, guides=True, stills=False).resize((360, 480), Image.LANCZOS) for sl in ss]; sh2 = Image.new('RGB', sheet.size, (255, 255, 255))
    for i, t in enumerate(blank): sh2.paste(t, (12 + i * 372, 6))
    sh2.save(OUT / 'as-the-buyer-opens-it.jpg', quality=88)
    pptx(ss, OUT / f'{NAME}.pptx', S.E.PACK / 'build' / '.cache' / 'carousel09')
    print('done', OUT)

if __name__ == '__main__':
    main()
