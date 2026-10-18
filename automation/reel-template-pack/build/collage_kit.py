"""The style kit for the physical pack's starter templates (Mercedes approved the plan 2026-10-17: a starter pack of 8,
each new template a short recipe that reuses approved parts instead of being designed from scratch).

What's here, all approved in her notes so far (FRAMEWORK.md):
- beats in balance: full-frame video with accents spread round the screen (accents()), full-screen words with no video
  (word_card()), and collage moments (tiles() from collage_motion: tiles slide in, flip, peel, swap; the clip is one
  tile; still photos switch to video)
- moves between beats: words pop onto an element and the camera dives into it until it is the next clip (dive());
  the clock-hand wipe (radial()); a big real object sweeping across as the wipe (sweep()); a flood of real cut-outs that
  covers the screen and flies off (takeover())
- lettering: her pick from the fall chat (f2): Anton caps filled with a real photo, a thick cream edge, a small line in
  the tall serif above it (photo_letters(), serif_line()); plain Anton words with a soft shadow for the time stamps and
  labels on video (word())
- no lines round tiles or cut-outs (her note on #11 v2); cut-outs carry a soft shadow only (cutout())
Rough motion tests only (stand-in footage); the CapCut build reuses the same beats through engine.py.
"""
import math, random
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps
import collage as C
import storyboard_b2 as S
import lettering_b2 as LB
from motion_b2 import (Clip, put, draw_on, pop, hero, slide, camera, text_img, render, circle_mask, ease, back_out, seg, lerp, lerp2,
                       clamp, W, H, INK, WHITE, CREAM, BOLD, HAND, dd, ARROWS, BURSTS, ICONS, LINES, GLYPHS)
from collage_motion import still, video, swap, tiles, kbox

ANTON = LB.FONT['anton']
SERIF = str(S.E.font_file('7580184437816675601'))      # the tall serif she picked in f2 (CapCut library font)

# ---- images ----------------------------------------------------------------------------------------------------------
def raw(folder, name, crop=None):
    im = S.raw(folder, name)
    if crop: w, h = im.size; im = im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h)))
    return im

def cutout(folder, name, w, tol=22, holes=(), shadow=(8, 14, 14, 100)):
    """A real object cut out of its white background, sized, with a soft shadow and no outline."""
    return C.shadow(S.fitw(S.cut(folder, name, tol, holes), w), shadow[:2], shadow[2], shadow[3])

def background(folder, name, dark=0.0):
    im = ImageOps.fit(S.raw(folder, name), (W, H), Image.LANCZOS).convert('RGBA')
    return ImageEnhance.Brightness(im).enhance(1 - dark) if dark else im

def off(box, dx=0, dy=0): return (box[0] + dx, box[1] + dy, box[2] + dx, box[3] + dy)
def enter(box, t0, dx=0, dy=0, dur=0.28): return [(t0, off(box, dx, dy)), (t0 + dur, box)]

# ---- lettering -------------------------------------------------------------------------------------------------------
def photo_letters(word, px, texture, edge=CREAM, edge_w=9):
    """Her f2 pick: Anton caps filled with a real photo, a thick cream edge; one image per letter (pops with hero())."""
    return S.letters(word, ANTON, px, LB.photo_fill(texture), edge_w, edge)

def serif_line(text, px, color=INK, edge=CREAM, sw=7):
    """The small line in the tall serif with a thick edge, as one image (placed above the big word)."""
    f = S.F(SERIF, px); im = Image.new('RGBA', (int(f.getlength(text) + 4 * sw + 30), int(px * 1.5 + 4 * sw)), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((im.width / 2, im.height / 2), text, font=f, fill=color, anchor='mm', stroke_width=sw, stroke_fill=edge)
    return C.shadow(im, (4, 8), 8, 90)

def word(img, t, t0, xy, text, px, color=WHITE, font=None, out=None, anchor='mm', shadow=True):
    """A plain Anton word (labels, time stamps, the buyer's words) popping in with a soft shadow, no outline."""
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

def on_tag(tag, text, px, color=INK, font=None, dy=0.1):
    """Words written onto a real tag or card (the element the camera can dive into)."""
    t = tag.copy(); f = S.F(font or ANTON, px); ImageDraw.Draw(t).text((t.width / 2, t.height * (0.5 + dy)), text, font=f, fill=color, anchor='mm'); return t

# ---- beats and moves ---------------------------------------------------------------------------------------------------
def accents(img, t, items):
    """The accents on a full-frame video beat: [(image, (x, y), rot, t_in, t_out)], each popping in and out."""
    for im, c, r, t0, t1 in items: pop(img, im, t, t0, c, r, out=t1, wiggle=2)

def word_card(bg, t, t0, lines):
    """A full-screen words beat, no user video: lines = [(letters or image, (x, y), delay)] on a background."""
    im = bg.copy()
    for item, c, dl in lines:
        if isinstance(item, list): hero(im, t, t0 + dl, item, c, step=0.035)   # quick, so the word lands before the wipe
        else: pop(im, item, t, t0 + dl, c)
    return im

def radial(old, new, u, c=(540, 960)):
    """The clock-hand wipe: the new scene sweeps in clockwise from 12."""
    if u <= 0: return old
    if u >= 1: return new
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).pieslice((c[0] - 1500, c[1] - 1500, c[0] + 1500, c[1] + 1500), -90, -90 + 360 * u, fill=255)
    out = old.copy(); out.paste(new, (0, 0), m); return out

def dive(scene, focus, z, nxt=None, fade=0.0, s=3.4):
    """The camera dives into an element (a tag, a phone screen, a letter's hole) and it becomes the next clip."""
    out = camera(scene, focus, lerp(1, s, z)) if z > 0 else scene
    return Image.blend(out, nxt, fade) if (nxt is not None and fade > 0) else out

def sweep(img, item, u, y, rot=0, left_to_right=True):
    """A big real object sweeps across the screen (the wipe); swap the scene under it at u = 0.5."""
    x = lerp(-item.width / 2 - 200, W + item.width / 2 + 200, u) if left_to_right else lerp(W + item.width / 2 + 200, -item.width / 2 - 200, u)
    put(img, item, (x, y), 1, rot)

def grid(n, cols, top=0, bottom=H, gap=0):
    """Boxes for n tiles in a grid (the 'all of them together' collage)."""
    rows = math.ceil(n / cols); w = W / cols; h = (bottom - top) / rows
    return [(c * w + gap, top + r * h + gap, (c + 1) * w - gap, top + (r + 1) * h - gap) for r in range(rows) for c in range(cols)][:n]

def takeover(img, t, t0, items, n=14, seed=12, t_in=0.35, hold=0.05, t_out=0.4, size=None):
    """A flood of real cut-outs rushes in from the edges, covers the screen, then flies off (swap the scene under it
    at t0 + t_in + hold)."""
    r = random.Random(seed); pts = [(x + r.randint(-60, 60), y + r.randint(-60, 60), r.randint(-30, 30), r.randrange(len(items)))
                                    for y in (120, 560, 1000, 1440, 1840) for x in (120, 540, 960)][:n]
    for i, (x, y, rot, k) in enumerate(pts):
        a = ease(seg(t, t0 + (i % 5) * 0.03, t0 + t_in)); b = ease(seg(t, t0 + t_in + hold + (i % 4) * 0.03, t0 + t_in + hold + t_out))
        if a <= 0 or b >= 1: continue
        dx, dy = x - W / 2, y - H / 2; nn = math.hypot(dx, dy) + 1; fx, fy = dx / nn * 1500, dy / nn * 1500
        put(img, items[k], (x + fx * (1 - a) + fx * b, y + fy * (1 - a) + fy * b), 1, rot + 80 * b)

# ---- her doodles, used visibly (FRAMEWORK checklist, 2026-10-17: at least 3 doodle moments per template, each with a job)
SHEETS = {'arrow': ('Hand-drawn arrow doodle sheet-1.png', 9), 'burst': ('Playful hand-drawn burst asset sheet-2.png', 9),
          'icon': ('Playful black doodle icon sheet-6.png', 9), 'under': ('Hand-Drawn Underline Asset Sheet-5.png', 9),
          'bubble': ('Eight playful speech and thought bubbles-3.png', 3), 'frame': ('Ten hand-drawn doodle frames-4.png', 3),
          'scribble': ('Eight playful black scribble patches-9.png', 9), 'tick': ('Hand-drawn checks, Xs, and tick boxes-8.png', 9),
          'path': ('Eight playful marker doodle paths-10.png', 9)}
_dcache = {}
def doodle(kind, i, w, color=INK):
    """One shape cut off one of her marker sheets, recoloured to the template's palette, sized to width w."""
    k = (kind, i, int(w), color)
    if k not in _dcache:
        sheet, join = SHEETS[kind]; x0, y0, x1, y1 = S.pieces(sheet, join)[i]; im = S.raw('doodles', sheet)
        _dcache[k] = S.fitw(S.ink_cut(im.crop((max(0, x0 - 8), max(0, y0 - 8), x1 + 8, y1 + 8)), color), w)
    return _dcache[k]

def doodle_on(img, t, t0, item, c, rot=0, out=None, dur=0.35):
    """A doodle drawn on while you watch (left to right), held, then popped off at `out`."""
    if t < t0 or (out is not None and t > out + 0.15): return
    if out is not None and t > out: put(img, item, c, 1 - ease(seg(t, out, out + 0.15)), rot); return
    draw_on(img, item, c, seg(t, t0, t0 + dur), rot)

def pattern(name, dark, light, scale=1.0):
    """One of her hand-drawn pattern sheets (dots, checks, stripes, zigzag) recoloured to two palette colours."""
    g = ImageOps.grayscale(S.raw('doodles', name))
    if scale != 1: g = g.resize((int(g.width * scale), int(g.height * scale)), Image.LANCZOS)
    return still(ImageOps.colorize(g, dark, light).convert('RGBA'), f'pat-{name}-{dark}-{light}-{scale}')

EDGE = {'bottom': lambda s: ((0, 0, W, H - s), (0, H - s, W, H), (0, s + 40)), 'top': lambda s: ((0, s, W, H), (0, 0, W, s), (0, -s - 40)),
        'right': lambda s: ((0, 0, W - s, H), (W - s, 0, W, H), (s + 40, 0)), 'left': lambda s: ((s, 0, W, H), (0, 0, s, H), (-s - 40, 0))}

def vbeat(img, t, t0, t1, clip_fill, side, fills, size=430):
    """A full-frame video beat made into a collage: the clip starts full frame, gives up one edge to one or two pattern
    / photo tiles that slide in, and is full frame again by t1 (so the next move starts from a full clip).
    Returns the clip's box and the strip's box, for the paper note and the cut-out that cross the seam."""
    box, strip, (dx, dy) = EDGE[side](size); full = (0, 0, W, H)
    keys = [(t0, full), (t0 + 0.3, box), (t1 - 0.3, box), (t1, full)]
    parts = []
    if len(fills) == 1: parts = [(strip, fills[0])]
    else:
        x0, y0, x1, y1 = strip
        if side in ('bottom', 'top'): parts = [((x0, y0, W * 0.55, y1), fills[0]), ((W * 0.55, y0, x1, y1), fills[1])]
        else: parts = [((x0, y0, x1, H * 0.55), fills[0]), ((x0, H * 0.55, x1, y1), fills[1])]
    spec = [{'keys': keys, 'fill': clip_fill}]
    for j, (b, f) in enumerate(parts):
        o = (b[0] + dx, b[1] + dy, b[2] + dx, b[3] + dy)
        spec.append({'keys': [(t0 + j * 0.05, o), (t0 + 0.3 + j * 0.05, b), (t1 - 0.3, b), (t1, o)], 'fill': f})
    tiles(img, t, spec)
    return box, strip

def note(paper, text, w, px, color=INK):
    """A real paper note with editable words on it in Anton (never the serif on paper: FRAMEWORK)."""
    p = S.fitw(paper, w).copy(); d = ImageDraw.Draw(p); f = S.F(ANTON, px); lines = text.split('\n'); lh = px * 1.08
    for k, l in enumerate(lines): d.text((p.width / 2, p.height / 2 + (k - (len(lines) - 1) / 2) * lh), l, font=f, fill=color, anchor='mm')
    return C.shadow(p, (6, 10), 10, 100)
