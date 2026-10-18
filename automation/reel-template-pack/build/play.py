"""The play kit (2026-10-18, after the wireframe round failed): her 10 must-dos made into defaults, so a plain cut-out or
a theme-object Reel can't happen by accident (FRAMEWORK.md "READ FIRST").

- style_object(): every real object gets play ON it: her dots / stripes / checks clipped to the object's own shape,
  stars or a sticker stuck on it, a white die-cut edge. thing() is the only way templates load an object, and it
  always styles it (a style is required).
- balloon(): an object or a clip window floating on a string, bobbing (her "balloons of videos").
- butterfly(), crown(): a butterfly flutters in and lands on the head, then a crown of butterflies, each styled
  differently; flower_crown(); head_guide(): the dashed head-outline filming guide that ships on its own layer
  (buyers hide it before export).
Cut-outs come from the rembg model (build/cutout_hq.py; run it for any new object first).
"""
import math, random
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps
import collage as C
import storyboard_b2 as S
import lettering_b2 as LB
from motion_b2 import put, ease, seg, lerp, clamp, back_out, W, H, INK, WHITE, CREAM

HQ = Path(__file__).resolve().parent / '.cache' / 'hq'
ANTON = LB.FONT['anton']
PATTERNS = {'dots': 'Playful hand-painted black polka dots-12.png', 'stripes': 'Hand-drawn black stripe pattern-16.png',
            'checks': 'Wobbly hand-drawn black and white checkerboard-24.png', 'zigzag': 'Bold hand-drawn zigzag pattern-17.png',
            'cross': 'Bold hand-drawn cross pattern-19.png', 'smalldots': 'Hand-painted polka dots on black-15.png'}
_pat = {}

def _pattern_mask(kind, size, scale):
    """Where her pattern has ink (0 to 255), tiled to size."""
    k = (kind, scale)
    if k not in _pat:
        g = ImageOps.grayscale(S.raw('doodles', PATTERNS[kind])); g = g.resize((int(g.width * scale), int(g.height * scale)), Image.LANCZOS)
        if kind == 'smalldots': g = ImageOps.invert(g)            # white dots on black: the dots are the ink
        _pat[k] = ImageOps.invert(g)
    p = _pat[k]; out = Image.new('L', size, 0)
    for y in range(0, size[1], p.height):
        for x in range(0, size[0], p.width): out.paste(p, (x, y))
    return out

def die_cut(im, edge=10, shadow=True):
    pad = edge + 4; a = Image.new('L', (im.width + 2 * pad, im.height + 2 * pad), 0); a.paste(im.split()[3].point(lambda v: 255 if v > 90 else 0), (pad, pad))
    border = a.filter(ImageFilter.MaxFilter(2 * edge + 1)).filter(ImageFilter.GaussianBlur(1.2))
    out = Image.new('RGBA', a.size, (255, 255, 255, 0)); out.putalpha(border); out.alpha_composite(im, (pad, pad))
    return C.shadow(out, (8, 14), 14, 90) if shadow else out

def sticker(text, px=60, fill=(214, 52, 46), ink=WHITE, shape='round'):
    """A die-cut sticker with a word on it, to stick ON an object."""
    f = S.F(ANTON, px); l, t, r, b = f.getbbox(text); w, h = r - l + px, b - t + int(px * 0.7)
    if shape == 'circle': w = h = max(w, h)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if shape == 'circle': d.ellipse((0, 0, w - 1, h - 1), fill=fill + (255,))
    else: d.rounded_rectangle((0, 0, w - 1, h - 1), h // 3, fill=fill + (255,))
    d.text((w / 2, h / 2), text, font=f, fill=ink, anchor='mm'); return die_cut(im, 6, False)

def style_object(im, pattern, color, scale=0.6, strength=0.85, stars=0, label=None, label_at=(0.5, 0.55), seed=1, edge=10):
    """Play on a real object: her pattern in `color` clipped to the object's own shape (it still reads as the object),
    optional gold stars stuck on it, an optional label sticker, then a white die-cut edge and a soft shadow."""
    im = im.copy(); a = im.split()[3]
    if pattern:
        m = ImageChops.multiply(_pattern_mask(pattern, im.size, scale), a).point(lambda v: int(v * strength))
        lay = Image.new('RGBA', im.size, color + (0,)); lay.putalpha(m); im.alpha_composite(lay)
    r = random.Random(seed)
    if stars:
        st = Image.open(HQ / 'Gold foil star sticker-95.png').convert('RGBA'); bb = a.getbbox()
        for _ in range(stars):
            for _try in range(30):
                x, y = r.randint(bb[0], bb[2] - 1), r.randint(bb[1], bb[3] - 1)
                if a.getpixel((x, y)) > 200: break
            s = S.fitw(st, int(im.width * r.uniform(0.12, 0.2))).rotate(r.randint(-30, 30), expand=True)
            im.alpha_composite(s, (int(x - s.width / 2), int(y - s.height / 2)))
    if label is not None:
        im.alpha_composite(label, (int(im.width * label_at[0] - label.width / 2), int(im.height * label_at[1] - label.height / 2)))
    return die_cut(im, edge)

def raw_cut(name, w):
    return S.fitw(Image.open(HQ / (Path(name).stem + '.png')).convert('RGBA'), int(w))

def thing(name, w, pattern, color, **kw):
    """The only way a template loads a real object: always styled (must-do 3)."""
    return style_object(raw_cut(name, w), pattern, color, **kw)

# ---- balloons ------------------------------------------------------------------------------------------------------------
def balloon(img, item, t, c, anchor, phase=0.0, rise=None, string=(250, 250, 250)):
    """An object or clip window floating on a string, bobbing; `rise` = (t0, t1, from_y) floats it up into place."""
    x, y = c
    if rise: y = lerp(rise[2], c[1], ease(seg(t, rise[0], rise[1])))
    bx, by = x + 14 * math.sin(t * 1.6 + phase), y + 18 * math.sin(t * 2.1 + phase)
    bottom = (bx, by + item.height / 2 - 20); mid = ((bottom[0] + anchor[0]) / 2 + 30 * math.sin(t * 1.3 + phase), (bottom[1] + anchor[1]) / 2)
    pts = [(lerp(lerp(bottom[0], mid[0], u), lerp(mid[0], anchor[0], u), u), lerp(lerp(bottom[1], mid[1], u), lerp(mid[1], anchor[1], u), u)) for u in [i / 16 for i in range(17)]]
    ImageDraw.Draw(img).line(pts, fill=string + (255,), width=4)
    put(img, item, (bx, by), 1, 6 * math.sin(t * 1.4 + phase))

# ---- head interplay ------------------------------------------------------------------------------------------------------
HEAD = (600, 870, 270, 470)            # the filming guide's head: centre x, y and radii (the buyer lines their head up with it)

def head_guide(alpha=1.0):
    """The dashed head outline buyers film to (its own layer; they hide it before export)."""
    cx, cy, rx, ry = HEAD; lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for i in range(0, 360, 8):
        a0, a1 = math.radians(i), math.radians(i + 4)
        d.line((cx + rx * math.cos(a0), cy + ry * math.sin(a0), cx + rx * math.cos(a1), cy + ry * math.sin(a1)), fill=(255, 255, 255, int(230 * alpha)), width=7)
    d.text((cx, cy + ry + 40), 'YOUR HEAD HERE (hide this layer)', font=S.F(ANTON, 44), fill=(255, 255, 255, int(230 * alpha)), anchor='mm')
    return lay

BUTTERFLIES = ['Delicate Vintage Butterfly Cutout-2.png', 'Ivory butterfly with burnt-orange tips-1.png', 'Vintage newspaper butterfly silhouette-3.png']

def butterfly(img, item, t, c, rot=0, flap=1.0, phase=0.0):
    """A real butterfly with its wings flapping (the cut-out squashed sideways on the beat)."""
    k = 1 - 0.55 * flap * (0.5 + 0.5 * math.sin(t * 16 + phase))
    w = max(4, int(item.width * k)); f = item.resize((w, item.height), Image.BILINEAR); put(img, f, c, 1, rot)

def crown_points(n, spread=150):
    cx, cy, rx, ry = HEAD; top = cy - ry
    return [(cx + rx * 1.05 * math.cos(math.radians(a)), top - 70 + ry * 0.28 * (1 - math.sin(math.radians(-a)))) for a in
            [lerp(-90 - spread / 2, -90 + spread / 2, i / (n - 1)) for i in range(n)]]

# ---- after her notes on #09/#10/#12 (2026-10-18): readable words, a neutral colour story buyers can change -------------
# Words are never pattern-filled and never thin over busy footage: solid colour on a solid pill or real paper.
# Each template has neutrals + ONE accent (the colour buyers change to their brand); patterns use the neutrals or the
# accent, never the same pattern on an object and right behind it.
NEUTRAL = {'cream': (246, 241, 232), 'stone': (196, 188, 176), 'ink': (28, 27, 26), 'paper': (252, 250, 245)}

def pill(text, px, bg, fg, font=None, pad=0.55, rot=0, outline=WHITE):
    """Words on a solid pill (her ManyChat note: an embellished shape behind the words) with a white die-cut edge."""
    f = S.F(font or ANTON, px); l, t, r, b = f.getbbox(text); w, h = int(r - l + px * pad * 2), int(b - t + px * pad * 1.2)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=bg + (255,))
    d.text((w / 2, h / 2), text, font=f, fill=fg, anchor='mm')
    out = die_cut(im, 8, True) if outline else C.shadow(im, (6, 10), 10, 90)
    return out.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else out

def big_text(text, px, color, edge=WHITE, edge_w=None, font=None):
    """Big solid lettering with a thick contrasting edge and a soft shadow: always readable."""
    f = S.F(font or ANTON, px); ew = edge_w or max(8, px // 9); l, t, r, b = f.getbbox(text)
    im = Image.new('RGBA', (r - l + 4 * ew + 20, b - t + 4 * ew + 20), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((im.width / 2, im.height / 2), text, font=f, fill=color, anchor='mm', stroke_width=ew, stroke_fill=edge)
    return C.shadow(im, (5, 10), 10, 110)

PIN = Path(__file__).resolve().parent.parent / 'assets' / 'props'
def sticky(text, w=380, tint=None, px=None, seed=1, pin='pin-head-black'):
    """A real yellow sticky note (tinted to the template's accent if asked) with the words in marker, pinned."""
    n = S.fitw(S.cut('physical', 'Blank Yellow Sticky Note on White.png', tol=10), w)
    if tint:
        g = ImageOps.grayscale(n.convert('RGB')); c = ImageOps.colorize(ImageOps.autocontrast(g), tuple(int(v * 0.55) for v in tint), tint).convert('RGBA'); c.putalpha(n.split()[3]); n = c
    d = ImageDraw.Draw(n); px = px or int(w * 0.17); f = S.F(S.HAND, px); lines = text.split('\n'); lh = px * 1.15
    for k, l in enumerate(lines): d.text((n.width / 2, n.height * 0.52 + (k - (len(lines) - 1) / 2) * lh), l, font=f, fill=NEUTRAL['ink'], anchor='mm')
    p = S.fitw(Image.open(PIN / f'{pin}.png').convert('RGBA'), int(w * 0.16)); n.alpha_composite(p, (int(n.width / 2 - p.width / 2), int(w * 0.03)))
    return C.shadow(n, (8, 14), 12, 100)

TV_SCREEN = (104, 432, 903, 993)        # the walnut TV cut-out's screen (measured), at its full cut-out size
def tv_with(clip_im, w):
    """The real walnut TV with the clip fitted INTO its screen (rounded like the glass)."""
    tv = Image.open(HQ / 'Vintage Walnut Rabbit-Ear Television.png').convert('RGBA'); k = w / tv.width
    x0, y0, x1, y1 = [int(v * k) for v in TV_SCREEN]; tv = S.fitw(tv, w); ins = int(14 * k * 2)
    sw, shh = x1 - x0 - 2 * ins, y1 - y0 - 2 * ins; v = ImageOps.fit(clip_im, (sw, shh)).convert('RGBA')
    m = Image.new('L', (sw, shh), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, sw - 1, shh - 1), int(70 * k), fill=255); v.putalpha(m)
    tv.alpha_composite(v, (x0 + ins, y0 + ins)); return die_cut(tv, 8)

# ---- tech moments (must-do 13): green-screen devices, a scrolling product feed, a notification ---------------------------
_dev = {}
def device(name, w):
    """A real green-screen device (cut-out from the model), sized: returns (image, screen mask, screen box). Cached."""
    k = (name, int(w))
    if k not in _dev:
        hq = HQ / (Path(name).stem + '.png')                 # the model drops the hand on the hand-held phone: use the white cut there
        src = S.cut('tech', name, tol=14) if 'Hand Holding' in name or not hq.exists() else Image.open(hq).convert('RGBA')
        im = S.fitw(src, int(w)); px = im.load(); m = Image.new('L', im.size, 0); mp = m.load()
        for y in range(im.height):
            for x in range(im.width):
                r, g, b, a = px[x, y]
                if a and g > 120 and g > r + 40 and g > b + 40: mp[x, y] = 255
        core = m.filter(ImageFilter.MinFilter(15))                 # the screen box from the solid green only (stray green on edges is ignored)
        m = ImageChops.multiply(m.filter(ImageFilter.MaxFilter(3)), core.filter(ImageFilter.MaxFilter(19)))   # only the screen, not green spill
        m = m.filter(ImageFilter.GaussianBlur(0.8)); _dev[k] = (im, m, core.getbbox())
    return _dev[k]

def on_screen(name, w, content, edge=8):
    """The device with `content` (any image) fitted into its green screen, die-cut."""
    im, m, bb = device(name, w); im = im.copy(); cw, ch = bb[2] - bb[0], bb[3] - bb[1]
    lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); lay.paste(ImageOps.fit(content.convert('RGBA'), (cw, ch)), bb[:2]); im.paste(lay, (0, 0), m)
    px = im.load()                                               # despill: any green left (round the camera notch) goes dark
    for y in range(im.height):
        for x in range(im.width):
            r, g_, b_, a = px[x, y]
            if a and g_ > 120 and g_ > r + 40 and g_ > b_ + 40: px[x, y] = (20, 20, 22, a)
    return die_cut(im, edge)

def feed(items, w=600, accent=(200, 50, 44), name_px=None):
    """A tall shop feed for phone_scroll: product cards (photo slot + name + price pill), white app chrome on top.
    items = [(photo image, '[name]', '[price]')]; the buyer swaps the photos (slots) and the words."""
    name_px = name_px or int(w * 0.085); card_h = int(w * 1.12); top = int(w * 0.28)
    im = Image.new('RGBA', (w, top + card_h * len(items) + int(w * 1.4)), (250, 249, 246, 255)); d = ImageDraw.Draw(im)   # room below so the last card can sit centred
    d.rectangle((0, 0, w, top), fill=(255, 255, 255)); d.text((w / 2, top / 2 + 10), '[YOUR SHOP]', font=S.F(ANTON, int(w * 0.1)), fill=NEUTRAL['ink'], anchor='mm')
    for i, (ph, name, price) in enumerate(items):
        y = top + 20 + i * card_h; pw = w - 40; phh = int(pw * 0.85)
        p = ImageOps.fit(ph.convert('RGBA'), (pw, phh)); m = Image.new('L', (pw, phh), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, pw - 1, phh - 1), 26, fill=255)
        im.paste(p, (20, y), m); d.text((24, y + phh + name_px), name, font=S.F(ANTON, name_px), fill=NEUTRAL['ink'], anchor='lm')
        pr = pill(price, int(name_px * 0.8), accent, WHITE, outline=None); im.alpha_composite(pr, (int(w - 14 - pr.width), int(y + phh + name_px * 0.15)))
    return im, card_h, top

def phone_scroll(feed_img, card_h, top, u, stop_index, screen_ratio=2.0):
    # screen_ratio = screen height / width (from screen_size)
    """A thumb scroll: the feed flicks up fast, eases, overshoots a touch and settles on card `stop_index`.
    u = 0..1 progress; returns the screen-sized crop (width x width*screen_ratio)."""
    w = feed_img.width; h = int(w * screen_ratio); target = top + 20 + stop_index * card_h + card_h / 2 - h / 2
    e = 1 - (1 - clamp(u)) ** 3; over = 0.03 * math.sin(math.pi * clamp((u - 0.75) / 0.25)) if u > 0.75 else 0
    y = int(min(1.05, max(0.0, e + over)) * target); y = max(0, min(feed_img.height - h, y))
    return feed_img.crop((0, y, w, y + h))

def notification(title, body, w=560, icon=None):
    """A phone notification banner (rounded frosted card, app icon, two lines): the order arriving."""
    h = int(w * 0.32); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, h - 1), 36, fill=(248, 247, 244, 240)); s = int(h * 0.56)
    if icon is not None: im.alpha_composite(ImageOps.fit(icon, (s, s)), (24, (h - s) // 2))
    else: d.rounded_rectangle((24, (h - s) // 2, 24 + s, (h + s) // 2), 22, fill=(200, 150, 90))
    d.text((48 + s, h * 0.36), title, font=S.F(ANTON, int(h * 0.2)), fill=NEUTRAL['ink'], anchor='lm')
    d.text((48 + s, h * 0.68), body, font=S.F('C:/Windows/Fonts/arial.ttf', int(h * 0.16)), fill=(70, 68, 66), anchor='lm')
    return C.shadow(im, (4, 10), 14, 110)

def screen_size(name, w):
    """The green screen's size on a device at width w (build feeds and cards to this, so nothing gets cropped)."""
    _, _, bb = device(name, w); return bb[2] - bb[0], bb[3] - bb[1]

# ---- modern type (her note 2026-10-18: "doesn't look trendy", primary colours feel elementary) ---------------------------
# Story words the buyer won't change: a big Bodoni Black Italic with a soft two-tone fill (or her stripes for a touch of
# fun), a thin cream edge and an offset ink shadow, coming in word by word like captions. Words the buyer edits: clean
# Montserrat Bold (CapCut library) on a pill. Accents are muted (clay, wine, olive, brick), never primaries.
SERIF_I = 'C:/Windows/Fonts/BOD_BLAI.TTF'
MONT = str(LB.FONT['montserrat'])
MUTED = {'clay': (178, 104, 80), 'wine': (122, 40, 52), 'olive': (104, 110, 74), 'brick': (156, 62, 50), 'mocha': (92, 66, 52)}

def story_word(text, px, color, fill='soft', edge=(246, 241, 232), shadow=(28, 27, 26)):
    """One built-in word: Bodoni Black Italic, a soft vertical two-tone fill (or 'stripes'), cream edge, offset shadow."""
    f = S.F(SERIF_I, px); l, t, r, b = f.getbbox(text); w, h = r - l + 50, b - t + 50
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((25 - l, 25 - t), text, font=f, fill=255)
    top_c = tuple(min(255, int(v + (255 - v) * 0.35)) for v in color); fl = Image.new('RGBA', (w, h))
    for y in range(h):
        u = y / max(1, h - 1); ImageDraw.Draw(fl).line((0, y, w, y), fill=tuple(int(lerp(a, b_, u)) for a, b_ in zip(top_c, color)) + (255,))
    if fill == 'stripes':
        pm = _pattern_mask('stripes', (w, h), 0.18); lay = Image.new('RGBA', (w, h), edge + (0,)); lay.putalpha(pm.point(lambda v: int(v * 0.55))); fl.alpha_composite(lay)
    out = Image.new('RGBA', (w + 16, h + 16), (0, 0, 0, 0))
    ew = 2 * max(5, px // 22) + 1                                  # a thick cream edge so it reads over busy footage
    sh = Image.new('RGBA', (w, h), shadow + (255,)); sh.putalpha(m.filter(ImageFilter.MaxFilter(ew))); out.alpha_composite(sh, (8, 8))
    ed = Image.new('RGBA', (w, h), edge + (255,)); ed.putalpha(m.filter(ImageFilter.MaxFilter(ew))); out.alpha_composite(ed, (0, 0))
    fl.putalpha(m); out.alpha_composite(fl, (0, 0)); return out

def caption(text, px, color, fill='soft', gap=0.28):
    """A built-in line as separate words (for word-by-word entry): [(image, x offset of its centre)]."""
    ws = [story_word(w_, px, color, fill) for w_ in text.split()]; sp = px * gap; total = sum(w.width for w in ws) + sp * (len(ws) - 1)
    out, x = [], -total / 2
    for w in ws: out.append((w, x + w.width / 2)); x += w.width + sp
    return out

def say(img, item, t, t0, c, rot=0, out=None, step=0.13, **kw):
    """Captions-style entry for a caption() list (each word pops up in turn, a small rise); plain pop for an image."""
    from motion_b2 import pop as _pop
    if not isinstance(item, list): return _pop(img, item, t, t0, c, rot, out=out, **kw)
    for i, (im, dx) in enumerate(item):
        ti = t0 + i * step
        if t < ti: continue
        k = back_out(seg(t, ti, ti + 0.22), 1.8)
        if out is not None: k *= 1 - ease(seg(t, out, out + 0.15))
        if k <= 0.02: continue
        put(img, im, (c[0] + dx, c[1] + 18 * (1 - min(1, seg(t, ti, ti + 0.22)))), k, rot)

def pill_m(text, px, bg, fg):
    """Editable words: Montserrat Bold on a pill (a font buyers have in CapCut)."""
    return pill(text, px, bg, fg, font=MONT, pad=0.6)

# ---- next batch helpers (2026-10-18): pinned proof cards, the word sandwich, more muted accents ------------------------
MUTED.update({'dusty': (92, 116, 146), 'plum': (98, 62, 90), 'ochre': (170, 134, 64), 'sage': (112, 130, 102)})

def proof_card(lines, w=520, accent=(92, 116, 146), name='[customer name hidden]', kind='dm'):
    """A buyer-swappable proof slot shaped like a DM or review screenshot (the buyer drops their own screenshot here):
    rounded white card, avatar dot, name line, the words in a chat bubble. Placeholder words only, never invented."""
    px = int(w * 0.065)
    while px > 12 and max(S.F(MONT, px).getlength(l) for l in lines) > w * 0.76: px -= 2   # shrink to fit the bubble
    f = S.F(MONT, px); lh = int(px * 1.3); bh = lh * len(lines) + int(w * 0.12)
    h = int(w * 0.24) + bh + int(w * 0.08); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, h - 1), int(w * 0.07), fill=(252, 251, 249, 255)); a = int(w * 0.12)
    d.ellipse((int(w * 0.06), int(w * 0.06), int(w * 0.06) + a, int(w * 0.06) + a), fill=(205, 198, 188))
    d.text((int(w * 0.22), int(w * 0.09)), name, font=S.F(MONT, int(w * 0.045)), fill=(110, 104, 98), anchor='lm')
    if kind == 'review':
        st = S.fitw(Image.open(HQ / 'Gold foil star sticker-95.png').convert('RGBA'), int(w * 0.08))
        for i in range(5): im.alpha_composite(st, (int(w * 0.22) + i * int(w * 0.085), int(w * 0.13)))   # under the name
    by = int(w * 0.24); d.rounded_rectangle((int(w * 0.06), by, w - int(w * 0.06), by + bh), int(w * 0.06), fill=accent + (255,) if kind == 'dm' else (238, 234, 228, 255))
    for k, l in enumerate(lines): d.text((int(w * 0.11), by + int(w * 0.06) + k * lh + lh // 2), l, font=f, fill=WHITE if kind == 'dm' else NEUTRAL['ink'], anchor='lm')
    return im

def pinned(card_im, rot=0, pin='pin-head-cream', d=None):
    """A card pinned at the top with a real push pin, slightly tilted, with a soft shadow."""
    c = card_im.copy(); d = d or int(c.width * 0.13); p = S.fitw(Image.open(PIN / f'{pin}.png').convert('RGBA'), d)
    out = Image.new('RGBA', (c.width, c.height + d // 2), (0, 0, 0, 0)); out.alpha_composite(c, (0, d // 2)); out.alpha_composite(p, (c.width // 2 - d // 2, 0))
    out = C.shadow(out, (8, 14), 14, 100); return out.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else out

def sandwich(img, t, t0, c, top, big, bottom, gap=None):
    """The word sandwich (Lisa's ManyChat Reel): a small line, one big italic word, a small line in a second colour."""
    gap = gap or 0; bh = max(i.height for i, _ in big) if isinstance(big, list) else big.height
    say(img, top, t, t0, (c[0], c[1] - bh / 2 - top.height / 2 + 30 - gap), -2)
    say(img, big, t, t0 + 0.15, c, 0)
    say(img, bottom, t, t0 + 0.35 + 0.13 * (len(big) if isinstance(big, list) else 1), (c[0], c[1] + bh / 2 + bottom.height / 2 - 30 + gap), 2)
