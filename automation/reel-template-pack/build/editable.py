"""Fully editable CapCut builds (Mercedes, 2026-10-20), replacing the flipbook builds (capcut_b2b.py), which baked the
words, colours and doodles into a recording: "a customer will not be able to change the color of the background or
the elements ... we need like the canva templates for the customer to be able to change the font words, colors,
outlines, etc. We also need the customer to be able to change the color of the overlays like they do in canva."

What the buyer can change in CapCut, and how each piece is built for it:
- Every word is a CapCut text layer: DM Serif Display (bundled) for the built-in words, Montserrat on CapCut's own
  text background for the [bracket] words. Font, words, fill, outline and shadow all use CapCut's text panel.
- Doodles (bursts, sparkles, underlines, rings, arrows) are one-letter text layers in Scrolly Doodles
  (build/doodle_font.py), so they recolour with the same colour pickers as words.
- The stage colour is CapCut's Background > Colour on the main track (canvas), under a colourless paper grain layer:
  the buyer picks any colour and the paper texture stays.
- Real photographed objects (a calendar page, a smartwatch) stay photos; they move with CapCut keyframes, never as a
  recording of the whole screen.
- Clip slots ship as numbered placeholder cards ("CLIP 2 ... Replace me with your clip"), engine.slot_clip.

Motion is written as functions of the motion test's script time; layers get keyframes sampled from them on real
(CapCut) time through the reading-time holds, so the build moves like the approved motion test.
CapCut limits: text layers always sit above picture and clip layers (the engine orders tracks that way), so a burst
"behind" an object is a ray burst with an empty centre drawn around it; a full-screen tear can't take the background
colour with it (the stage's pieces tear away instead).
"""
import json, math, shutil
from pathlib import Path
from PIL import Image, ImageChops, ImageFilter, ImageOps
import engine as E
from engine import W, H
import play_extra as X
import doodle_font as DF
from motion_b2 import ease, back_out, seg, lerp

FD = E.PACK / 'assets' / 'fonts'
E.BUNDLED_FONTS['dms'] = FD / 'dmserifdisplay-DMSerifDisplay-Regular.ttf'
E.BUNDLED_FONTS['dmsi'] = FD / 'dmserifdisplay-DMSerifDisplay-Italic.ttf'
E.BUNDLED_FONTS['doodles'] = DF.OTF
INK, WHITE = (24, 23, 22), (255, 255, 255)
FPS = 30

def rot(p, deg_cw, c=(0, 0)):
    a = math.radians(deg_cw); x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))

def _rdp(pts, tol):
    """Ramer-Douglas-Peucker on (t, v): the fewest keyframes that stay within tol of the sampled motion."""
    if len(pts) < 3: return pts
    (t0, v0), (t1, v1) = pts[0], pts[-1]; worst, wi = -1, 0
    for i in range(1, len(pts) - 1):
        t, v = pts[i]; lin = v0 + (v1 - v0) * (t - t0) / (t1 - t0) if t1 > t0 else v0; d = abs(v - lin)
        if d > worst: worst, wi = d, i
    if worst <= tol: return [pts[0], pts[-1]]
    return _rdp(pts[:wi + 1], tol)[:-1] + _rdp(pts[wi:], tol)

TOL = {'x': 1.5, 'y': 1.5, 'scale': 0.008, 'rot': 0.3}

class Reel:
    """One template's layers on script time. f(ts) -> dict(x, y, s, r): position (px), scale (1 = the layer's size),
    clockwise rotation (deg). Layers live from script a to script b (real times through the holds)."""
    def __init__(self, holds, script_end):
        self.L = E.Layers(); self.holds = holds; self.end = self.R(script_end); self.tz = 1000; self.texts = []
    def R(self, ts):
        """Script -> real seconds. A layer that starts or ends at a hold point does so after the hold."""
        return round(ts + sum(h for x, h in self.holds if x <= ts + 1e-9), 4)
    def _kf(self, f, r0, r1):
        n = max(1, int(round((r1 - r0) * FPS))); raw = {'x': [], 'y': [], 'scale': [], 'rot': []}
        for k in range(n + 1):
            tr = min(r1, r0 + k / FPS); ts = X.warp(tr, self.holds)[0]; v = f(ts)
            raw['x'].append((tr - r0, v['x'])); raw['y'].append((tr - r0, v['y']))
            raw['scale'].append((tr - r0, max(0.0, v.get('s', 1.0)))); raw['rot'].append((tr - r0, v.get('r', 0.0)))
        kf = {}
        for p, pts in raw.items():
            if len({round(v, 3) for _, v in pts}) == 1:
                # position and turn ride on the layer's start values; a scale that never changes but isn't 1 has no
                # such home, so it keeps two keyframes (it was dropped and the layer built at full size)
                if p == 'scale' and abs(pts[0][1] - 1.0) > 1e-3: kf[p] = [(0.0, round(pts[0][1], 4)), (round(pts[-1][0], 4), round(pts[0][1], 4))]
                continue
            kf[p] = [(round(t, 4), round(v, 4)) for t, v in _rdp(pts, TOL[p])]
        v0 = f(X.warp(r0, self.holds)[0])
        return kf, (v0['x'], v0['y']), v0.get('r', 0.0)
    def art(self, name, img, a, b, z, f):
        r0, r1 = self.R(a), (self.end if b is None else self.R(b)); kf, pos, r = self._kf(f, r0, r1)
        self.L.art(name, img, (r0, r1), z, pos, r, kf)
    def clip(self, slot, a, b, z, f, size=(W, H), src=0.0, mask=None, speed=1.0):
        """A buyer clip layer; size = its window (the clip is centre-cropped to it); mask='circle' for a round window
        (size must be square). src = seconds into the buyer's clip at the layer's start."""
        r0, r1 = self.R(a), (self.end if b is None else self.R(b)); kf, pos, r = self._kf(f, r0, r1)
        self.L.clip(slot, (r0, r1), z, pos, (2 * (int(size[0]) // 2), 2 * (int(size[1]) // 2)), r, kf, src=src, mask=mask, speed=speed)
    def text(self, font, px, words, a, b, f, color=WHITE, stroke=None, box=None, shadow=False, italic_last=False, typewriter=None):
        """px: the letters' em in pixels (CapCut size = px / 6.1). words = (template words, test words)."""
        self.tz += 1; r0, r1 = self.R(a), (self.end if b is None else self.R(b)); kf, pos, r = self._kf(f, r0, r1)
        if isinstance(words, str): words = (words, words)
        self.L.text(font, round(px / E.PX_PER_SIZE, 2), words, (r0, r1), self.tz, pos, r, kf, color=color, stroke=stroke,
                    box=box, shadow=shadow, typewriter=typewriter)   # typewriter = seconds to type in (CapCut's Typewriter)
        if font == 'doodles': self.L.L[-1]['centred'] = True     # glyphs are centred on the line box already
        if italic_last and len(words[0].split()) > 1: self.texts.append(words[0])
    # ---- the house styles --------------------------------------------------------------------------------------------
    def serif(self, words, px, a, b, f, fill=WHITE, edge=None, italic_last=True, typewriter=None):
        """A built-in line: DM Serif Display, last word Italic, thin outline (px/55), soft shadow (play_extra.key).
        px = the motion test's px (play_extra.key draws at px * 0.92 via play.caption; pass that number)."""
        self.text('dms', px, words, a, b, f, fill, stroke=(edge, 0.03) if edge else None, shadow=True, italic_last=italic_last,
                  typewriter=typewriter)
    def boxed(self, words, px, a, b, f, box=WHITE, test=None, round_=0.0, typewriter=None):
        """Small editable line: Montserrat Bold on CapCut's text background (the highlight box grows with the words);
        round_=1 is a pill. Multi-line words: separate lines with \n."""
        fg = INK if sum(box) / 3 > 140 else WHITE
        self.text('montserrat', px * 0.85, (words, test or words.replace('[', '').replace(']', '')), a, b, f, fg, box=(box, round_),
                  typewriter=typewriter)
    def plain(self, words, px, a, b, f, color=INK, edge=None, test=None, typewriter=None):
        """Editable Montserrat with no box (words on paper: a sticky note, a tag, a label)."""
        self.text('montserrat', px * 0.85, (words, test or words.replace('[', '').replace(']', '')), a, b, f, color,
                  stroke=(edge, 0.03) if edge else None, typewriter=typewriter)
    def doodle(self, kind, i, px, a, b, f, color, edge=None):
        """One of her doodles as a recolourable one-letter text layer; px = its longest side."""
        c = DF.char(kind, i); self.text('doodles', px, (c, c), a, b, f, color, stroke=(edge, 0.02) if edge else None)

# ---- motion pieces (script time) --------------------------------------------------------------------------------------
def at(x, y, s=1.0, r=0.0): return {'x': x, 'y': y, 's': s, 'r': r}
def still(x, y, r=0.0): return lambda ts: at(x, y, 1.0, r)
def pop_in(x, y, t0, r=0.0, dur=0.3, k=2.2, rise=0):
    """motion_b2.pop / play.say: in with a bounce at t0 (scale 0 before), a small rise."""
    return lambda ts: at(x, y + rise * (1 - seg(ts, t0, t0 + dur)), back_out(seg(ts, t0, t0 + dur), k) if ts >= t0 else 0.0, r)
def then(f, *moves):
    """f, then group moves on top: each move(ts, state) -> state (a slide, a tear)."""
    def g(ts):
        v = f(ts)
        for m in moves: v = m(ts, v)
        return v
    return g
def slide(t0, t1, dx, dy=0.0):
    """Moves by (dx, dy) * ease over t0..t1 (a swipe in or out)."""
    def m(ts, v):
        u = ease(seg(ts, t0, t1)); return dict(v, x=v['x'] + dx * u, y=v['y'] + dy * u)
    return m
def enter(t0, t1, dx, dy=0.0):
    """Comes in from (dx, dy) away over t0..t1."""
    def m(ts, v):
        u = 1 - ease(seg(ts, t0, t1)); return dict(v, x=v['x'] + dx * u, y=v['y'] + dy * u)
    return m
def tear(t0, t1, deg=28, fall=(160, 1300)):
    """The whole frame tears off a top binding: turns clockwise about the top-left corner and drops (motion_24.tear)."""
    def m(ts, v):
        u = seg(ts, t0, t1)
        if u <= 0: return v
        a = deg * ease(u); x, y = rot((v['x'], v['y']), a)
        return dict(v, x=x + fall[0] * u, y=y + fall[1] * u * u, r=v.get('r', 0.0) + a)
    return m

# ---- pieces -----------------------------------------------------------------------------------------------------------
def child(parent, off, r0=0.0, s_mul=True):
    """A layer riding on another (a label on a sheet, a clip in a frame): parent f, offset from the parent's centre at
    scale 1 and no turn; it turns and scales with the parent."""
    def f(ts):
        v = parent(ts); s = v.get('s', 1.0) if s_mul else 1.0; dx, dy = rot((off[0] * s, off[1] * s), v.get('r', 0.0))
        return at(v['x'] + dx, v['y'] + dy, v.get('s', 1.0), v.get('r', 0.0) + r0)
    return f

def ink(photo, size=None, strength=1.0):
    """A black-ink pattern photo (her polka dots, stripes, checks on white) as a colourless layer: black where the ink
    is, see-through elsewhere. Over the canvas colour it reads as a pattern in any brand colour."""
    g = ImageOps.grayscale(photo.convert('RGB')); g = ImageOps.fit(g, size or (W, H))
    a = g.point(lambda v: int((255 - v) * strength)); out = Image.new('RGBA', g.size, (0, 0, 0, 255)); out.putalpha(a); return out

def window(img, box, radius=0, ellipse=False):
    """Punch a see-through window in an object photo (a frame, a mailer, a TV) so a clip layer under it shows through:
    box = (x0, y0, x1, y1) in the image. Returns (image, window size, window centre offset from the image centre)."""
    from PIL import ImageDraw
    m = Image.new('L', img.size, 0); d = ImageDraw.Draw(m)
    if ellipse: d.ellipse(box, fill=255)
    else: d.rounded_rectangle(box, radius, fill=255)
    out = img.copy(); out.putalpha(ImageChops.subtract(out.split()[3], m))
    size = (box[2] - box[0] + 8, box[3] - box[1] + 8)
    return out, size, ((box[0] + box[2]) / 2 - img.width / 2, (box[1] + box[3]) / 2 - img.height / 2)

def grain(photo, strength=0.16):
    """A colourless paper grain from a texture photo: black where the photo is dark, see-through elsewhere, so it
    shades whatever background colour the buyer picks."""
    g = ImageOps.autocontrast(ImageOps.grayscale(ImageOps.fit(photo.convert('RGB'), (W, H))))
    a = g.point(lambda v: int((255 - v) * strength)); out = Image.new('RGBA', (W, H), (0, 0, 0, 255)); out.putalpha(a); return out

def device_hole(dev):
    """A die-cut device (play.on_screen look) with its green screen punched out: (image, screen box size, screen centre
    offset from the image centre). The clip layer goes under it, sized to the box."""
    px = dev.load(); m = Image.new('L', dev.size, 0); mp = m.load()
    for y in range(dev.height):
        for x in range(dev.width):
            r, g, b, a = px[x, y]
            if a and g > 120 and g > r + 40 and g > b + 40: mp[x, y] = 255
    core = m.filter(ImageFilter.MinFilter(15)); bb = core.getbbox()
    hole = ImageChops.multiply(m.filter(ImageFilter.MaxFilter(5)), core.filter(ImageFilter.MaxFilter(25)))
    out = dev.copy(); out.putalpha(ImageChops.subtract(out.split()[3], hole)); px = out.load()
    for y in range(out.height):                      # green spill on the screen's rim goes dark
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if a and g > 100 and g > r + 30 and g > b + 30: px[x, y] = (20, 20, 22, a)
    # the clip sits a little bigger than the solid screen so no gap shows at the rounded corners
    size = (bb[2] - bb[0] + 12, bb[3] - bb[1] + 12)
    return out, size, ((bb[0] + bb[2]) / 2 - out.width / 2, (bb[1] + bb[3]) / 2 - out.height / 2)

# ---- build ------------------------------------------------------------------------------------------------------------
def _italicise(text, draft_files):
    """CapCut text with two style ranges: the last word in DM Serif Italic (the motion tests' key word)."""
    ital = f'{E.DRAFT_TOKEN}/Resources/fonts/{E.BUNDLED_FONTS["dmsi"].name}'
    for f in draft_files:
        d = json.loads(f.read_text(encoding='utf-8'))
        for m in d['materials']['texts']:
            c = json.loads(m['content'])
            if c['text'] not in text or len(c['styles']) != 1: continue
            st = c['styles'][0]; cut = c['text'].rstrip().rfind(' ') + 1
            a = dict(st, range=[0, cut]); b = json.loads(json.dumps(st)); b['range'] = [cut, len(c['text'])]
            b['font'] = {'path': ital, 'id': ''}; c['styles'] = [a, b]; m['content'] = json.dumps(c, ensure_ascii=False)
        f.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

def _canvas(color, draft_files):
    """The main track's background (canvas) in the stage colour: CapCut's Background > Colour, buyer-editable."""
    hexa = '#%02X%02X%02XFF' % color
    for f in draft_files:
        d = json.loads(f.read_text(encoding='utf-8')); mats = d['materials']
        main = next(t for t in d['tracks'] if t['type'] == 'video')
        for s in main['segments']:
            cv = [c for c in mats.get('canvases', []) if c['id'] in s['extra_material_refs']]
            if not cv:
                c = {'id': E.uid(), 'type': 'canvas_color', 'color': '', 'blur': 0.0, 'image': '', 'album_image': '', 'image_id': '',
                     'image_name': '', 'source_platform': 0, 'team_id': ''}
                mats.setdefault('canvases', []).append(c); s['extra_material_refs'].append(c['id']); cv = [c]
            for c in cv: c.update(type='canvas_color', color=hexa, blur=0.0)
        f.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

def _flags(draft_files):
    """CapCut only draws a text effect whose bit is on in check_flag (7 = fill and font, +8 outline, +16 background,
    +32 shadow). The engine copies 47 from the prototype draft (no background bit), so the highlight boxes never showed
    in CapCut (Mercedes, 2026-10-20: "a color where the text is ... didn't carry in on any text")."""
    for f in draft_files:
        d = json.loads(f.read_text(encoding='utf-8'))
        for m in d['materials']['texts']:
            m['check_flag'] = (7 | (8 if m.get('border_width', 0) > 0 else 0)
                               | (16 if m.get('background_style', 0) and m.get('background_alpha', 0) > 0 else 0)
                               | (32 if m.get('has_shadow') else 0))
        f.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

def build(spec, reel_fn, stage):
    """engine.build with the stage colour painted under the preview, then the draft patched: canvas colour on the
    main track, Italic key words. reel_fn() -> Reel; stage = the background colour (RGB)."""
    box = {}
    def layers():
        r = reel_fn(); box['r'] = r; return r.L
    solid = Image.new('RGBA', (W, H), stage + (255,)); render0 = E.render
    def render(L, A, *a, **k):
        bg = dict(kind='art', name='_stage', t=(0, max(l['t'][1] for l in L)), z=-999, pos=(W / 2, H / 2), rot=0, kf={})
        return render0([bg] + L, dict(A, _stage=solid), *a, **k)
    E.render = render
    try: E.build(spec, layers)
    finally: E.render = render0
    proj = E.PACK / spec['dir'] / 'buyer-folder' / spec['folder'] / spec['project']
    files = [proj / 'draft_content.json'] + list((proj / 'Timelines').glob('*/draft_content.json'))
    _canvas(stage, files); _flags(files)
    if box['r'].texts:
        (proj / 'Resources' / 'fonts').mkdir(exist_ok=True); shutil.copy2(E.BUNDLED_FONTS['dmsi'], proj / 'Resources' / 'fonts')
        _italicise(set(box['r'].texts), files)
    lic = FD / 'dmserifdisplay-OFL.txt'
    if (proj / 'Resources' / 'fonts').exists() and lic.exists(): shutil.copy2(lic, proj / 'Resources' / 'fonts' / 'DMSerifDisplay-OFL.txt')
