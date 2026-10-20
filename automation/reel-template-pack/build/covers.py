"""Designed, editable Reel covers for every CapCut template (Mercedes, 2026-10-20: every template gets a cover; the covers
are also the phone previews on the sales pages).

A cover is one still frame built from the same editable pieces as the template (build/editable.py): the buyer's clip
fills the frame (Mercedes, 2026-10-20: "instead of a background ... do video placeholder"), every word is a text layer (DM Serif Display built-in words with
the last word Italic, Montserrat for small lines, Bodoni for Halloween), doodles are Scrolly Doodles letters, and real
photographed props are pictures. So the buyer changes the cover's words, fonts, colours, doodles and background exactly
like the rest of the template.

Grid rule (Mercedes, 2026-10-20: "make sure that these work on the grid preview"): Instagram's profile grid shows the
middle 3:4 of a Reel cover (1080 x 1440, y 240 to 1680). Every word and the hero object sit inside SAFE (a margin
inside that band); only background and bleed-off props may go outside it. check_grid() prints GRID: for any word or
hero that pokes out.

Usage (from automation/reel-template-pack):  python build/covers.py 24 02 h6
  -> NN-.../cover/cover.png (1080x1920), cover-grid.png (the 3:4 crop), and covers-review.png (side by side + a grid row)
"""
import importlib, json, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import editable as Ed
import doodle_font as DF
from engine import W, H, PX_PER_SIZE

GRID = (0, 240, 1080, 1680)              # what the profile grid shows
SAFE = (70, 300, 1010, 1620)             # words and the hero stay in here
WHITE, INK = (255, 255, 255), (24, 23, 22)

def _dark(c): return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] < 110

class Cover:
    """One still: stage colour + layers in paint order (pictures first, then text, as CapCut draws them)."""
    def __init__(self, stage):
        self.stage = stage; self.L = []
    def video(self, slot=0, what='Your cover shot', at=(540, 960)):
        """The buyer's clip (or photo) fills the frame under everything: a placeholder card until they swap it in."""
        self.L.append(dict(kind='clip', slot=slot, what=what, at=at, pos=(W / 2, H / 2), rot=0.0))
    def art(self, name, img, pos, rot=0.0, scale=1.0, hero=False):
        self.L.append(dict(kind='art', name=name, img=img, pos=pos, rot=rot, scale=scale, hero=hero))
    def text(self, font, px, words, pos, rot=0.0, color=WHITE, stroke=None, box=None, shadow=False, italic_last=False):
        """px = the letters' em in pixels (CapCut size = px / 6.1). words: what shows (no [brackets] on a cover)."""
        self.L.append(dict(kind='text', font=font, size=round(px / PX_PER_SIZE, 2), words=(words, words), pos=pos, rot=rot,
                           color=color, stroke=stroke, box=box, shadow=shadow, italic_last=italic_last))
    # the house styles, as editable.Reel
    def serif(self, words, px, pos, fill=WHITE, edge=None, rot=0.0, italic_last=True):
        if edge and _dark(fill) and not _dark(edge): fill, edge = edge, fill   # over footage the light colour fills
        self.text('dms', px, words, pos, rot, fill, stroke=(edge, 0.03) if edge else None, shadow=True, italic_last=italic_last)
    def boxed(self, words, px, pos, box=WHITE, rot=0.0, round_=0.0):
        self.text('montserrat', px * 0.85, words, pos, rot, INK if sum(box) / 3 > 140 else WHITE, box=(box, round_))
    def plain(self, words, px, pos, color=INK, edge=None, rot=0.0):
        self.text('montserrat', px * 0.85, words, pos, rot, color, stroke=(edge, 0.03) if edge else None)
    def doodle(self, kind, i, px, pos, color, edge=None, rot=0.0):
        if edge is None and _dark(color): edge = WHITE                        # a dark doodle needs a light edge on footage
        self.text('doodles', px, DF.char(kind, i), pos, rot, color, stroke=(edge, 0.02) if edge else None)

# ---- preview (what CapCut will show) -------------------------------------------------------------------------------------
def _serif_img(l):
    """DM Serif Display with the last word in DM Serif Italic (editable._italicise), outline + shadow like text_img."""
    px = round(l['size'] * PX_PER_SIZE); words = l['words'][0]
    reg = ImageFont.truetype(E.font_path('dms'), px); ita = ImageFont.truetype(E.font_path('dmsi'), px)
    cut = words.rstrip().rfind(' ') + 1 if l['italic_last'] and ' ' in words.strip() else len(words)
    a, b = words[:cut], words[cut:]
    asc, desc = reg.getmetrics(); pad = 40; wa, wb = reg.getlength(a), ita.getlength(b)
    im = Image.new('RGBA', (int(wa + wb) + 2 * pad, asc + desc + 2 * pad), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    sw = round(l['stroke'][1] * px * 0.6) if l.get('stroke') else 0
    sf = tuple(l['stroke'][0]) + (255,) if sw else None
    d.text((pad, pad), a, font=reg, fill=tuple(l['color']) + (255,), stroke_width=sw, stroke_fill=sf)
    d.text((pad + wa, pad), b, font=ita, fill=tuple(l['color']) + (255,), stroke_width=sw, stroke_fill=sf)
    if l.get('shadow'):
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh.putalpha(im.split()[3].filter(ImageFilter.GaussianBlur(px * 0.1)).point(lambda v: min(255, int(v * 0.9))))
        base = Image.new('RGBA', im.size, (0, 0, 0, 0)); base.alpha_composite(sh); base.alpha_composite(im); im = base
    return im

def placeholder(slot, what, at=(540, 960)):
    """The cover's clip slot before the buyer swaps their clip in: a mid-dark, video-like card (so white and cream words
    read on it, as they will on footage) with a play badge, the clip number and what to put there at `at`, a spot the
    cover's graphics leave free."""
    im = Image.new('RGB', (W, H)); px = im.load()
    for y in range(0, H, 4):
        for x in range(0, W, 4):
            d = min(1.0, ((x - W / 2) ** 2 / (W * 0.75) ** 2 + (y - H / 2) ** 2 / (H * 0.6) ** 2) ** 0.5)
            c = tuple(int(a_ + (b_ - a_) * d) for a_, b_ in zip((132, 124, 116), (58, 54, 52)))
            for yy in range(y, min(H, y + 4)):
                for xx in range(x, min(W, x + 4)): px[xx, yy] = c
    im = im.convert('RGBA'); lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    cx, cy = at; r = 70
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255, 70), outline=(255, 255, 255, 170), width=4)
    d.polygon([(cx - 22, cy - 34), (cx - 22, cy + 34), (cx + 36, cy)], fill=(255, 255, 255, 200))
    f1, f2 = E.F(40, E.SEGB), E.F(34, E.SEG)
    for t, f, y in ((f'CLIP {slot + 1}: {what}', f1, cy + r + 30), ('Replace me with your clip', f2, cy + r + 82)):
        d.text((cx - d.textlength(t, font=f) / 2, y), t, font=f, fill=(255, 255, 255, 190))
    im.alpha_composite(lay); return im

def render(cv):
    """The cover as CapCut draws it, and each layer's ink box (for the grid check)."""
    out = Image.new('RGBA', (W, H), cv.stage + (255,)); boxes = []
    order = [l for l in cv.L if l['kind'] == 'clip'] + [l for l in cv.L if l['kind'] == 'art'] + [l for l in cv.L if l['kind'] == 'text']
    for l in order:
        if l['kind'] == 'clip': im = placeholder(l['slot'], l['what'], l['at'])
        elif l['kind'] == 'art': im = l['img']
        elif l['font'] == 'dms': im = _serif_img(l)
        else:
            im = E.text_img(dict(l), False)
        if abs(l.get('scale', 1) - 1) > 0.005: im = im.resize((int(im.width * l['scale']), int(im.height * l['scale'])), Image.LANCZOS)
        if abs(l['rot']) > 0.05: im = im.rotate(-l['rot'], resample=Image.BICUBIC, expand=True)
        x, y = l['pos']
        if l['kind'] == 'text' and not l['font'] == 'doodles': y += E.center_offset(l)
        x0, y0 = int(x - im.width / 2), int(y - im.height / 2); out.paste(im, (x0, y0), im)
        bb = im.getbbox()
        if bb: boxes.append((l, (x0 + bb[0], y0 + bb[1], x0 + bb[2], y0 + bb[3])))
    return out.convert('RGB'), boxes

def check_grid(boxes, label):
    bad = []
    for l, (x0, y0, x1, y1) in boxes:
        if l['kind'] == 'text' or l.get('hero'):
            if x0 < SAFE[0] or y0 < SAFE[1] or x1 > SAFE[2] or y1 > SAFE[3]:
                bad.append(f"{label}: {l.get('words', [l.get('name')])[0]!r} at {(x0, y0, x1, y1)}")
    for b in bad: print('GRID:', b)
    return bad

def _save(img, path, tries=20):
    """Save, retrying while another program (a viewer, OneDrive) holds the file for a moment."""
    import time
    for i in range(tries):
        try: img.save(path); return path
        except OSError:
            if i == tries - 1: raise
            time.sleep(0.5)

# ---- output --------------------------------------------------------------------------------------------------------------
def make(key):
    import cover_designs as CD
    spec = CD.SPECS.get(key) or importlib.import_module(f'templates.t{key}').SPEC
    cv = getattr(CD, f'c{key}')(); img, boxes = render(cv); check_grid(boxes, key)
    d = E.PACK / spec['dir'] / 'cover'; d.mkdir(exist_ok=True)
    _save(img, d / 'cover.png'); _save(img.crop(GRID), d / 'cover-grid.png')
    return spec, img

def review(items, path):
    """Each cover full size beside its grid crop, then the grid crops side by side as a profile row."""
    sw, gh = 540, 720; pad = 40; n = len(items)
    sheet = Image.new('RGB', (pad + n * (sw + int(sw * 0.75) + pad * 2), pad * 3 + 960 + gh // 2 + 120), (236, 233, 228))
    d = ImageDraw.Draw(sheet); f = ImageFont.truetype(E.font_path('montserrat'), 26)
    x = pad
    for spec, img in items:
        sheet.paste(img.resize((sw, 960)), (x, pad + 40)); d.text((x, pad), f"{spec['num']} {spec['title']}", font=f, fill=INK)
        g = img.crop(GRID).resize((int(sw * 0.75), gh)); sheet.paste(g, (x + sw + pad // 2, pad + 40 + 120))
        d.text((x + sw + pad // 2, pad + 40 + 80), 'grid (3:4)', font=f, fill=INK)
        x += sw + int(sw * 0.75) + pad * 2
    y = pad * 2 + 1000; d.text((pad, y), 'On the profile grid', font=f, fill=INK); tw = 300
    for i, (_, img) in enumerate(items):
        sheet.paste(img.crop(GRID).resize((tw, 400)), (pad + i * (tw + 4), y + 40))
    sheet = sheet.crop((0, 0, sheet.width, y + 40 + 400 + pad)); return _save(sheet, path)

def profile(items, path, cols=3, tw=360):
    """The covers as Instagram's profile grid shows them: 3:4 tiles, 3 across, 2 px gaps, with the template number."""
    th = tw * 4 // 3; rows = (len(items) + cols - 1) // cols; f = ImageFont.truetype(E.font_path('montserrat'), 22)
    sheet = Image.new('RGB', (cols * tw + (cols - 1) * 3, rows * (th + 34)), (255, 255, 255)); d = ImageDraw.Draw(sheet)
    for i, (spec, img) in enumerate(items):
        x, y = (i % cols) * (tw + 3), (i // cols) * (th + 34)
        sheet.paste(img.crop(GRID).resize((tw, th), Image.LANCZOS), (x, y)); d.text((x + 6, y + th + 5), f"{spec['num']} {spec['title']}", font=f, fill=INK)
    return _save(sheet, path)

def fulls(items, path, cols=6, tw=300):
    """Full 9:16 covers with the grid band marked, to check the parts outside the grid."""
    th = tw * 16 // 9; rows = (len(items) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 10), rows * (th + 10)), (236, 233, 228)); d = ImageDraw.Draw(sheet)
    for i, (spec, img) in enumerate(items):
        x, y = (i % cols) * (tw + 10), (i // cols) * (th + 10); sheet.paste(img.resize((tw, th), Image.LANCZOS), (x, y))
        k = tw / W; d.rectangle((x, y + GRID[1] * k, x + tw - 1, y + GRID[3] * k), outline=(255, 80, 160), width=2)
    return _save(sheet, path)

if __name__ == '__main__':
    keys = sys.argv[1:]
    items = [make(k) for k in keys]
    if len(items) <= 5: print('review:', review(items, E.PACK / 'covers-review.png'))
    else: print('review:', profile(items, E.PACK / 'covers-grid.png'), fulls(items, E.PACK / 'covers-full.png'))
