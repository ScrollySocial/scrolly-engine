"""Plan wireframes for the physical pack's unfinished templates (04 to 25, not 01 to 03 or 22): one rough panel per
beat, built from her real images (assets/props/source), with the buyer's clip shown as a dark slot, so Mercedes can pick
the plans she likes before anything is animated. Specs live in build/wf_specs.py (one per template).
Panels are 1080 x 1920 drawn at half size. Red dashed arrows = the one main action (not part of the Reel).
Usage: python build/wireframe_physical.py [04 05 ...]  ->  wireframes/NN-bK.jpg + wireframes/review.html
"""
import html, json, math, os, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import doodles as D
import wf_specs as SP

PACK = Path(__file__).resolve().parent.parent
SRC = PACK / 'assets' / 'props' / 'source'
OUT = PACK / 'wireframes'; OUT.mkdir(exist_ok=True)
CACHE = PACK / 'build' / '.cache' / 'wf'; CACHE.mkdir(parents=True, exist_ok=True)
HQ = PACK / 'build' / '.cache' / 'hq'
S = 0.5; PW, PH = int(1080 * S), int(1920 * S)
RES = Path(os.environ['LOCALAPPDATA']) / 'CapCut' / 'User Data' / 'Cache' / 'AITextTemplate' / 'Resource'
FONTS = {'anton': RES / '571127391353382505' / 'Anton-Regular.ttf', 'alfa': RES / '1970572292665945052' / 'Alfa Slab One-Regular.ttf',
         'corben': RES / '4624078377714242870' / 'Corben-Bold.ttf', 'bounce': RES / '18437452393010598986' / 'BounceHouse-Regular.otf',
         'mont': RES / '16318125380063669143' / 'Montserrat-Bold.otf', 'arial': Path('C:/Windows/Fonts/arialbd.ttf'),
         'ink': Path('C:/Windows/Fonts/Inkfree.ttf')}
INK, CREAM, SLOT = (24, 22, 26), (246, 238, 222), (58, 64, 76)
_f = {}
def F(name, px):
    k = (name, int(px))
    if k not in _f: _f[k] = ImageFont.truetype(str(FONTS[name]), max(6, int(px)))
    return _f[k]
def sc(v): return v * S
def scb(b): return tuple(v * S for v in b)

# ---- images ----------------------------------------------------------------------------------------------------------
_raw = {}
def raw(name, size=1000):
    if name not in _raw:
        im = ImageOps.exif_transpose(Image.open(SRC / name)).convert('RGB'); im.thumbnail((size, size), Image.LANCZOS); _raw[name] = im
    return _raw[name]

def _key(im, key):
    """Alpha for a photo of an object on a plain backdrop: 'border' = near-white touching the edge goes clear,
    'all' = every near-white pixel goes clear (glasses lenses), 'black' = near-black touching the edge, 'green' = the
    green screen goes clear, 'none' = keep the rectangle."""
    if key == 'none': a = Image.new('L', im.size, 255); out = im.convert('RGBA'); out.putalpha(a); return out
    r, g, b = [c.load() for c in im.split()]; px = im.load(); W, H = im.size
    if key == 'green':
        m = Image.new('L', im.size, 255); mp = m.load()
        for y in range(H):
            for x in range(W):
                R, G, B = px[x, y]
                if G > 120 and G > R + 50 and G > B + 50: mp[x, y] = 0
        out = im.convert('RGBA'); out.putalpha(m.filter(ImageFilter.MinFilter(3))); return out
    g = ImageOps.grayscale(im)
    if key == 'black': near = g.point(lambda v: 255 if v < 28 else 0)
    else:
        mn = ImageChops.darker(ImageChops.darker(im.getchannel(0), im.getchannel(1)), im.getchannel(2))
        near = mn.point(lambda v: 255 if v > 232 else 0)
    if key == 'all': clear = near
    else:
        clear = near.copy(); W, H = clear.size
        for x in list(range(0, W, 6)) + [W - 1]:
            for y in (0, H - 1):
                if clear.getpixel((x, y)) == 255: ImageDraw.floodfill(clear, (x, y), 128)
        for y in list(range(0, H, 6)) + [H - 1]:
            for x in (0, W - 1):
                if clear.getpixel((x, y)) == 255: ImageDraw.floodfill(clear, (x, y), 128)
        clear = clear.point(lambda v: 255 if v == 128 else 0)
    a = ImageOps.invert(clear).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert('RGBA'); out.putalpha(a); return out

_cut = {}
def cut(name, key='border'):
    k = (name, key)
    if k in _cut: return _cut[k]
    hq = HQ / (Path(name).stem + '.png')
    fn = CACHE / (Path(name).stem + f'.{key}.png')
    if key == 'border' and hq.exists(): im = Image.open(hq).convert('RGBA'); im.thumbnail((900, 900))
    elif fn.exists(): im = Image.open(fn).convert('RGBA')
    else:
        im = _key(raw(name, 900), key)
        if key != 'green' and im.getbbox(): bb = im.getchannel('A').getbbox(); im = im.crop(bb) if bb else im
        im.save(fn)
    _cut[k] = im; return im

def rawc(name, crop=None, size=1000):
    im = raw(name, size)
    if crop: im = im.crop((int(crop[0] * im.width), int(crop[1] * im.height), int(crop[2] * im.width), int(crop[3] * im.height)))
    return im

_full = {}
def cut_full(name, key, crop=None):
    """The keyed photo without trimming, so openings can be given as fractions of the original (or cropped) picture."""
    k = (name, key, crop)
    if k not in _full:
        fn = CACHE / (Path(name).stem + f'.{key}.full{"".join(str(int(c * 100)) for c in crop) if crop else ""}.png')
        if fn.exists(): _full[k] = Image.open(fn).convert('RGBA')
        else: _full[k] = _key(rawc(name, crop, 1400 if crop else 900), key); _full[k].save(fn)
    return _full[k]

def fitw(im, w): w = max(2, int(w)); return im.resize((w, max(2, int(im.height * w / im.width))), Image.LANCZOS)
def cover(im, w, h):
    w, h = max(2, int(w)), max(2, int(h)); r = max(w / im.width, h / im.height)
    im = im.resize((max(w, int(im.width * r + 1)), max(h, int(im.height * r + 1))), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2; return im.crop((x, y, x + w, y + h))

def paste(cv, im, c, rot=0, shadow=True):
    if rot: im = im.rotate(rot, expand=True, resample=Image.BICUBIC)
    x, y = int(sc(c[0]) - im.width / 2), int(sc(c[1]) - im.height / 2)
    if shadow:
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh.putalpha(im.getchannel('A').point(lambda v: v * 0.35))
        sh = sh.filter(ImageFilter.GaussianBlur(5)); _ac(cv, sh, x + 4, y + 7)
    _ac(cv, im, x, y)

def _ac(cv, im, x, y):
    big = Image.new('RGBA', cv.size, (0, 0, 0, 0)); big.paste(im, (x, y)); cv.alpha_composite(big)

# ---- the buyer's clip slot -------------------------------------------------------------------------------------------
def slot_img(w, h, label, tint=None):
    w, h = max(2, int(w)), max(2, int(h)); base = SLOT if tint is None else tuple(int(SLOT[i] * 0.55 + tint[i] * 0.45) for i in range(3))
    im = Image.new('RGBA', (w, h), base + (255,)); d = ImageDraw.Draw(im)
    lt = tuple(min(255, c + 12) for c in base)
    for x in range(-h, w, 22): d.line((x, h, x + h, 0), fill=lt, width=7)
    r = max(8, min(w, h) * 0.09); cx, cy = w / 2, h / 2 - r * 0.6
    d.polygon([(cx - r * 0.7, cy - r), (cx - r * 0.7, cy + r), (cx + r, cy)], fill=(225, 228, 234))
    f = F('arial', max(11, min(26, w / max(8, len(label)) * 1.5)))
    lines = wrap(label, max(8, int(w / (f.size * 0.55))))
    for i, ln in enumerate(lines[:3]): d.text((cx, cy + r * 1.5 + i * f.size * 1.15), ln, font=f, fill=(255, 255, 255), anchor='mt')
    return im

def shape_mask(shape, w, h, pts=None):
    w, h = max(2, int(w)), max(2, int(h)); m = Image.new('L', (w, h), 0); d = ImageDraw.Draw(m)
    if shape == 'circle': d.ellipse((0, 0, w - 1, h - 1), fill=255)
    elif shape == 'arch': d.rectangle((0, w / 2, w, h), fill=255); d.ellipse((0, 0, w - 1, w - 1), fill=255)
    elif shape == 'round': d.rounded_rectangle((0, 0, w - 1, h - 1), radius=min(w, h) * 0.08, fill=255)
    elif shape == 'bubble': d.ellipse((0, 0, w - 1, h * 0.86), fill=255); d.polygon([(w * 0.22, h * 0.7), (w * 0.12, h), (w * 0.42, h * 0.8)], fill=255)
    elif shape == 'heart':
        d.ellipse((0, 0, w * 0.56, h * 0.56), fill=255); d.ellipse((w * 0.44, 0, w, h * 0.56), fill=255); d.polygon([(w * 0.03, h * 0.38), (w * 0.97, h * 0.38), (w / 2, h)], fill=255)
    elif shape == 'poly': d.polygon([(x * S, y * S) for x, y in pts], fill=255)
    else: d.rectangle((0, 0, w, h), fill=255)
    return m

def draw_clip(cv, box, label, shape='rect', tint=None, rot=0, pts=None, edge=None):
    if shape == 'poly':
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]; box = (min(xs), min(ys), max(xs), max(ys))
        pts = [(x - box[0], y - box[1]) for x, y in pts]
    x0, y0, x1, y1 = scb(box); im = slot_img(x1 - x0, y1 - y0, label, tint)
    im.putalpha(shape_mask(shape, im.width, im.height, pts))
    if edge:
        e = Image.new('RGBA', (im.width + 16, im.height + 16), edge + (0,)); a = Image.new('L', e.size, 0); a.paste(im.getchannel('A'), (8, 8))
        e.putalpha(a.filter(ImageFilter.MaxFilter(11))); e.alpha_composite(im, (8, 8)); im = e
    paste(cv, im, ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), rot, shadow=True)

# ---- words -----------------------------------------------------------------------------------------------------------
def tinted(name, dark, light, w, h, scale=1.0):
    t = raw(name, 1254); t = t.resize((int(t.width * scale), int(t.height * scale)))
    tile = Image.new('RGB', (max(w, 1), max(h, 1)))
    for y in range(0, h, t.height):
        for x in range(0, w, t.width): tile.paste(t, (x, y))
    g = ImageOps.grayscale(tile); return ImageOps.colorize(g, dark, light).convert('RGBA')

def word_img(text, px, font='anton', fill=INK, edge=CREAM, edge_w=None, lines_gap=0.95):
    f = F(font, sc(px)); ew = int(sc(edge_w if edge_w is not None else px / 14)); lines = text.split('\n')
    sizes = [f.getbbox(l, stroke_width=ew) for l in lines]; lh = sc(px) * lines_gap
    W = int(max(b[2] - b[0] for b in sizes) + ew * 2 + 8); H = int(lh * (len(lines) - 1) + (sizes[-1][3] - sizes[0][1]) + ew * 2 + 8)
    mask_e, mask_f = Image.new('L', (W, H), 0), Image.new('L', (W, H), 0)
    for i, l in enumerate(lines):
        for m, sw in ((mask_e, ew), (mask_f, 0)):
            ImageDraw.Draw(m).text((W / 2, ew + 4 + i * lh - sizes[0][1]), l, font=f, anchor='ma', fill=255, stroke_width=sw, stroke_fill=255)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    if edge and ew: e = Image.new('RGBA', (W, H), edge + (255,)); e.putalpha(mask_e); out.alpha_composite(e)
    if isinstance(fill, tuple) and len(fill) == 3: fl = Image.new('RGBA', (W, H), fill + (255,))
    elif fill[0] == 'pat': fl = tinted(fill[1], fill[2], fill[3], W, H, fill[4] if len(fill) > 4 else 0.5)
    else: fl = cover(raw(fill[1], 1400), W, H).convert('RGBA')
    fl.putalpha(mask_f); out.alpha_composite(fl); return out

def ig_check(tid, text, c, im):
    x0, y0 = c[0] - im.width / S / 2, c[1] - im.height / S / 2; x1, y1 = x0 + im.width / S, y0 + im.height / S
    if y0 < 220 or y1 > 1500 or (x1 > 930 and y1 > 960): print(f'  IG SAFE ZONE: {tid} "{text[:30]}" {int(x0)},{int(y0)},{int(x1)},{int(y1)}')

# ---- doodles ---------------------------------------------------------------------------------------------------------
GRID = {'bubbles': ('Eight playful speech and thought bubbles-3.png', 2, 4), 'frames': ('Ten hand-drawn doodle frames-4.png', 2, 5),
        'glyphs': ('Playful Marker Glyphs Asset Sheet-11.png', 4, 3), 'scribbles': ('Eight playful black scribble patches-9.png', 3, 3)}
def doodle(kind, i, w, color=INK):
    if kind in GRID:
        name, cols, rows = GRID[kind]; im = ImageOps.grayscale(raw('doodles/' + name, 1254)); cw, ch = im.width / cols, im.height / rows
        c, r = i % cols, i // cols; cell = im.crop((int(c * cw), int(r * ch), int((c + 1) * cw), int((r + 1) * ch)))
        a = cell.point(lambda v: max(0, min(255, (215 - v) * 2))); a = a.crop(a.getbbox())
        out = Image.new('RGBA', a.size, tuple(color) + (255,)); out.putalpha(a); return fitw(out, sc(w))
    return D.get(kind, i, color, width=sc(w))

# ---- motion note (not part of the Reel) ------------------------------------------------------------------------------
RED = (226, 36, 70)
def move(d, a, b, label=''):
    x0, y0, x1, y1 = sc(a[0]), sc(a[1]), sc(b[0]), sc(b[1]); L = math.hypot(x1 - x0, y1 - y0); n = max(2, int(L / 9))
    for i in range(0, n, 2):
        u0, u1 = i / n, min(1, (i + 1) / n); d.line((x0 + (x1 - x0) * u0, y0 + (y1 - y0) * u0, x0 + (x1 - x0) * u1, y0 + (y1 - y0) * u1), fill=RED, width=4)
    t = math.atan2(y1 - y0, x1 - x0)
    d.polygon([(x1, y1), (x1 - 16 * math.cos(t - 0.45), y1 - 16 * math.sin(t - 0.45)), (x1 - 16 * math.cos(t + 0.45), y1 - 16 * math.sin(t + 0.45))], fill=RED)
    if label:
        f = F('arial', 15); mx, my = (x0 + x1) / 2, (y0 + y1) / 2; bb = d.textbbox((mx, my), label, font=f, anchor='mm')
        d.rounded_rectangle((bb[0] - 5, bb[1] - 3, bb[2] + 5, bb[3] + 3), 5, fill=(255, 255, 255), outline=RED, width=2); d.text((mx, my), label, font=f, fill=RED, anchor='mm')

# ---- one panel -------------------------------------------------------------------------------------------------------
def render_panel(tid, k, beat):
    cv = Image.new('RGBA', (PW, PH), (200, 196, 190, 255)); moves = []
    for op in beat['draw']:
        kind, a = op[0], op[1:]
        if kind == 'bg':
            name, kw = a[0], (a[1] if len(a) > 1 else {})
            im = rawc(name, kw.get('crop'), 1600)
            if kw.get('flip'): im = ImageOps.flip(im)
            if kw.get('gray'): im = ImageOps.grayscale(im).convert('RGB')
            box = kw.get('box', (0, 0, 1080, 1920)); x0, y0, x1, y1 = scb(box)
            cv.alpha_composite(cover(im, x1 - x0, y1 - y0).convert('RGBA'), (int(x0), int(y0)))
        elif kind == 'pat':                                     # a tinted doodle pattern as a backdrop or tile
            name, dark, light, box = a[:4]; x0, y0, x1, y1 = [int(v) for v in scb(box)]
            cv.alpha_composite(tinted('doodles/' + name, dark, light, x1 - x0, y1 - y0, a[4] if len(a) > 4 else 0.35), (x0, y0))
        elif kind == 'tile':                                    # a photo cropped into a rectangle (collage tile)
            name, box = a[0], a[1]; kw = a[2] if len(a) > 2 else {}; x0, y0, x1, y1 = scb(box)
            im = cover(rawc(name, kw.get('crop'), 1400), x1 - x0, y1 - y0).convert('RGBA')
            if kw.get('gray'): im = ImageOps.grayscale(im.convert('RGB')).convert('RGBA')
            paste(cv, im, ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), kw.get('rot', 0), shadow=kw.get('shadow', True))
        elif kind == 'clip':
            box, label = a[0], a[1]; kw = a[2] if len(a) > 2 else {}
            draw_clip(cv, box, label, kw.get('shape', 'rect'), kw.get('tint'), kw.get('rot', 0), kw.get('pts'), kw.get('edge'))
        elif kind == 'strips':                                  # two-tone strip slice: alternate strips of clip A / B
            box, n, la, lb, ta, tb = a[:6]; kw = a[6] if len(a) > 6 else {}; vert = kw.get('vertical', True); off = kw.get('off', 60)
            x0, y0, x1, y1 = box
            for i in range(n):
                if vert:
                    w = (x1 - x0) / n; b = (x0 + i * w, y0 + (off if i % 2 else -off), x0 + (i + 1) * w - 6, y1 + (off if i % 2 else -off))
                else:
                    h = (y1 - y0) / n; b = (x0 + (off if i % 2 else -off), y0 + i * h, x1 + (off if i % 2 else -off), y0 + (i + 1) * h - 6)
                draw_clip(cv, b, (lb if i % 2 else la) if i in (1, 2) else '', 'rect', tb if i % 2 else ta)
        elif kind == 'cut':                                     # a real cut-out object
            name, c, w = a[:3]; kw = a[3] if len(a) > 3 else {}
            im = fitw(cut(name, kw.get('key', 'border')), sc(w))
            if kw.get('flip'): im = ImageOps.mirror(im)
            if kw.get('vflip'): im = ImageOps.flip(im)
            if kw.get('gray'): g = ImageOps.grayscale(im.convert('RGB')).convert('RGBA'); g.putalpha(im.getchannel('A')); im = g
            if kw.get('alpha'): im.putalpha(im.getchannel('A').point(lambda v: int(v * kw['alpha'])))
            paste(cv, im, c, kw.get('rot', 0), shadow=kw.get('shadow', True))
        elif kind == 'device':                                  # an object with openings: clips drawn behind it
            name, c, w, holes = a[:4]; kw = a[4] if len(a) > 4 else {}
            im = fitw(cut_full(name, kw.get('key', 'border'), kw.get('crop')), sc(w))
            if kw.get('flip'):
                im = ImageOps.mirror(im); holes = [(1 - h[2], h[1], 1 - h[0], h[3]) + tuple(h[4:]) for h in holes]
            ox, oy = c[0] - im.width / S / 2, c[1] - im.height / S / 2; W_, H_ = im.width / S, im.height / S
            def holes_(top):
                for h in holes:
                    if (len(h) > 6 and h[6] == 'top') == top:
                        draw_clip(cv, (ox + h[0] * W_, oy + h[1] * H_, ox + h[2] * W_, oy + h[3] * H_), h[5], h[4], kw.get('tint'))
            holes_(False); paste(cv, im, c, kw.get('rot', 0), shadow=kw.get('shadow', True)); holes_(True)
        elif kind == 'screen':                                  # a green-screen frame: the clip shows through the green
            name, c, w, label = a[:4]; kw = a[4] if len(a) > 4 else {}
            fr = fitw(cut(name, 'green'), sc(w)); bg = fitw(_key(raw(name, 900), 'border'), sc(w))
            hole = ImageChops.subtract(bg.getchannel('A'), fr.getchannel('A'))
            sl = slot_img(fr.width, fr.height, label, kw.get('tint')); bb = hole.getbbox()
            if bb: sl = Image.new('RGBA', fr.size, (0, 0, 0, 0)); s2 = slot_img(bb[2] - bb[0], bb[3] - bb[1], label, kw.get('tint')); sl.paste(s2, bb[:2])
            sl.putalpha(ImageChops.multiply(sl.getchannel('A'), hole))
            fr2 = bg.copy(); fr2.putalpha(ImageChops.subtract(bg.getchannel('A'), hole)); sl.alpha_composite(fr2)
            paste(cv, sl, c, kw.get('rot', 0), shadow=True)
        elif kind == 'word':                                    # built-in artwork words
            text, c, px = a[:3]; kw = a[3] if len(a) > 3 else {}
            im = word_img(text, px, kw.get('font', 'anton'), kw.get('fill', INK), kw.get('edge', CREAM), kw.get('edge_w'))
            if kw.get('rot'): im = im.rotate(kw['rot'], expand=True, resample=Image.BICUBIC)
            ig_check(tid, text, c, im); paste(cv, im, c, 0, shadow=kw.get('shadow', True))
        elif kind == 'edit':                                    # words the buyer edits: CapCut font, clean stroke
            text, c, px = a[:3]; kw = a[3] if len(a) > 3 else {}
            im = word_img(text, px, kw.get('font', 'mont'), kw.get('fill', (255, 255, 255)), kw.get('edge', INK), kw.get('edge_w', px / 9))
            if kw.get('rot'): im = im.rotate(kw['rot'], expand=True, resample=Image.BICUBIC)
            ig_check(tid, text, c, im); paste(cv, im, c, 0, shadow=False)
        elif kind == 'dd':                                      # one of her doodles
            sheet, i, c, w = a[:4]; kw = a[4] if len(a) > 4 else {}
            im = doodle(sheet, i, w, kw.get('color', INK))
            if kw.get('flip'): im = ImageOps.mirror(im)
            paste(cv, im, c, kw.get('rot', 0), shadow=False)
        elif kind == 'move': moves.append(a)
        elif kind == 'shade':                                   # a see-through wash over part of the frame
            box, col, al = a; x0, y0, x1, y1 = [int(v) for v in scb(box)]
            cv.alpha_composite(Image.new('RGBA', (x1 - x0, y1 - y0), col + (int(al * 255),)), (x0, y0))
    d = ImageDraw.Draw(cv)
    for m in moves: move(d, *m)
    for y in (220, 1500): d.line((0, sc(y), PW, sc(y)), fill=(255, 255, 255, 140), width=1)
    d.line((sc(930), sc(960), sc(930), sc(1500)), fill=(255, 255, 255, 140), width=1)
    d.ellipse((8, 8, 44, 44), fill=INK); d.text((26, 26), str(k + 1), font=F('arial', 22), fill=(255, 255, 255), anchor='mm')
    out = cv.convert('RGB'); out.save(OUT / f'{tid}-b{k + 1}.jpg', quality=84)

def wrap(s, n):
    out, cur = [], ''
    for w in s.split():
        if len(cur) + len(w) + 1 > n and cur: out.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    return out + [cur]

# ---- the review page -------------------------------------------------------------------------------------------------
FIELDS = [('bg', 'Background'), ('opening', 'Footage goes'), ('action', 'Main action'), ('doodles', 'Doodles'),
          ('carry', 'Carried on'), ('out', 'Transition out'), ('text', 'Text')]

def page():
    done = [t for t in SP.ORDER if t in SP.T and all((OUT / f'{t}-b{k + 1}.jpg').exists() for k in range(len(SP.T[t]['beats'])))]
    counts = {}
    for t in done:
        for m in SP.T[t]['moves']: counts.setdefault(m, []).append(t)
    for m, ts in SP.EARLIER.items():
        for t in ts: counts.setdefault(m, []).insert(0, t)
    rows = ''.join(f'<tr><td>{html.escape(m)}</td><td>{", ".join(sorted(set(ts)))}</td><td class="{"over" if len(set(ts)) > 5 else ""}">{len(set(ts))} of 5</td></tr>'
                   for m, ts in sorted(counts.items(), key=lambda kv: -len(set(kv[1]))))
    cards = ''
    for t in done:
        s = SP.T[t]; beats = ''
        for k, b in enumerate(s['beats']):
            lab = ''.join(f'<p><b>{n}:</b> {html.escape(b[f])}</p>' for f, n in FIELDS if b.get(f))
            beats += (f'<div class="beat"><a href="{t}-b{k + 1}.jpg" target="_blank"><img src="{t}-b{k + 1}.jpg?v={SP.VERSION}" loading="lazy"></a>'
                      f'<div class="when">{k + 1}. {html.escape(b["t"])} · {html.escape(b["name"])}</div>{lab}</div>')
        cards += f'''<section id="t{t}"><h2>{t}. {html.escape(s["title"])}</h2>
<p class="meta"><b>World:</b> {html.escape(s["world"])}<br><b>Job:</b> {html.escape(s["job"])}<br><b>Moves:</b> {html.escape(" · ".join(s["moves"]))}<br><b>Lettering:</b> {html.escape(s["letters"])}<br><b>CTA:</b> {html.escape(s["cta"])}</p>
<div class="strip">{beats}</div>
<div class="vote"><label><input type="checkbox" data-k="{t}" data-f="approve"> Approve</label><label><input type="checkbox" data-k="{t}" data-f="maybe"> Maybe</label>
<textarea data-k="{t}" data-f="note" placeholder="Notes on {t}"></textarea></div></section>'''
    nav = ' '.join(f'<a href="#t{t}">{t}</a>' for t in done)
    todo = [t for t in SP.ORDER if t not in done]
    more = f'<p class="todo">Still drawing: {", ".join(todo)}. Reload in a while.</p>' if todo else ''
    doc = f'''<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Physical pack plans</title><style>
:root{{--ink:#1d1b1f;--paper:#f6f2ea;--line:#d9d1c4;--red:#e22446}}
body{{margin:0;background:var(--paper);color:var(--ink);font:15px/1.4 Arial,sans-serif;padding:0 16px 120px}}
header{{position:sticky;top:0;background:var(--paper);padding:10px 0;border-bottom:1px solid var(--line);z-index:2}}
h1{{font-size:22px;margin:4px 0}} nav a{{margin-right:8px;color:var(--ink)}} .key{{font-size:14px;color:#555}}
section{{border-bottom:2px solid var(--ink);padding:18px 0}} h2{{margin:0 0 6px;font-size:24px}} .meta{{margin:0 0 10px;max-width:1100px}}
.strip{{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}}
.beat img{{width:100%;display:block;border-radius:6px;border:1px solid var(--line)}} .beat p{{margin:3px 0;font-size:15px}}
.when{{font-weight:bold;margin:6px 0 2px}} .vote{{display:flex;gap:16px;align-items:flex-start;margin-top:12px;flex-wrap:wrap}}
.vote label{{font-size:17px;font-weight:bold;padding:8px 12px;border:1px solid var(--ink);border-radius:6px;background:#fff}}
textarea{{flex:1;min-width:260px;min-height:70px;font:15px Arial;padding:8px}} table{{border-collapse:collapse;font-size:15px}}
td{{border:1px solid var(--line);padding:3px 8px}} .over{{color:var(--red);font-weight:bold}} .todo{{font-weight:bold;color:var(--red)}}
#bar{{position:fixed;bottom:0;left:0;right:0;background:var(--ink);color:#fff;padding:10px 16px;display:flex;gap:12px;align-items:center}}
#bar button{{font-size:15px;padding:6px 12px}} details{{margin:8px 0}}
</style></head><body><header><h1>Physical pack: plans for {len(done)} templates</h1><nav>{nav}</nav>
<p class="key">Plans, not motion. Dark striped slots = the buyer's clips. Red dashed arrow = the one main action (not in the Reel). [Brackets] = words the buyer edits; other big words are built-in artwork. White lines = Instagram's no-text zones. Click a panel to see it bigger.</p></header>
{more}{cards}
<details><summary>Moves used across the pack (cap: 5 of 25)</summary><table>{rows}</table></details>
<div id="bar"><span id="msg">Notes save by themselves.</span><button id="copy">Copy all notes</button></div>
<script>
const N={{}};const msg=document.getElementById('msg');let tm;
function save(){{clearTimeout(tm);tm=setTimeout(()=>fetch('/notes?to=wireframes/notes.json',{{method:'POST',headers:{{'Content-Type':'application/json'}},body:JSON.stringify(N)}}).then(r=>{{msg.textContent=r.ok?'Saved.':'Could not save. Use Copy all notes.'}}).catch(()=>{{msg.textContent='Could not save. Use Copy all notes.'}}),500)}}
fetch('notes.json?'+Date.now()).then(r=>r.ok?r.json():{{}}).catch(()=>({{}})).then(o=>{{Object.assign(N,o);document.querySelectorAll('[data-k]').forEach(el=>{{const v=(N[el.dataset.k]||{{}})[el.dataset.f];if(el.type==='checkbox')el.checked=!!v;else if(v)el.value=v}})}});
document.querySelectorAll('[data-k]').forEach(el=>el.addEventListener(el.type==='checkbox'?'change':'input',()=>{{const k=el.dataset.k;N[k]=N[k]||{{}};N[k][el.dataset.f]=el.type==='checkbox'?el.checked:el.value;save()}}));
document.getElementById('copy').onclick=()=>{{const t=Object.entries(N).map(([k,v])=>k+': '+(v.approve?'APPROVE ':'')+(v.maybe?'MAYBE ':'')+(v.note||'')).join('\\n');navigator.clipboard.writeText(t).then(()=>msg.textContent='Copied.')}};
</script></body></html>'''
    (OUT / 'review.html').write_text(doc, encoding='utf-8'); print('page:', len(done), 'templates')

if __name__ == '__main__':
    ids = sys.argv[1:] or [t for t in SP.ORDER if t in SP.T]
    for t in ids:
        if t == 'page': continue
        print(t, SP.T[t]['title'])
        for k, b in enumerate(SP.T[t]['beats']): render_panel(t, k, b)
    page()
