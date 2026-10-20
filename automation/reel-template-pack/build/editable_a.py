"""Editable-build helpers for the older layered templates (01, 02, 03): they keep their approved engine.Layers motion
(layer-relative keyframes), and only their words, doodles and backgrounds change to the editable pieces of
build/editable.py (DM Serif Display / Montserrat text, Scrolly Doodles letters, the stage colour under a grain).
Session A's helper file (templates 01-07, 13); editable.py itself stays untouched."""
import editable as Ed
import doodle_font as DF
from engine import PX_PER_SIZE

WHITE, INK = Ed.WHITE, Ed.INK

class Wrap:
    """A Layers object dressed as an editable.Reel for editable.build (it reads .L and .texts)."""
    def __init__(self, g):
        self.L = g; self.texts = []

def _px(px): return round(px / PX_PER_SIZE, 2)

def serif(r, words, px, t, z, pos, rot=0, kf=None, fill=WHITE, edge=None, italic_last=True, typewriter=None):
    """A built-in line as editable.Reel.serif: DM Serif Display, last word Italic, thin outline, soft shadow."""
    if isinstance(words, str): words = (words, words)
    r.L.text('dms', _px(px), words, t, z, pos, rot, kf, typewriter=typewriter, color=fill,
             stroke=(edge, 0.03) if edge else None, shadow=True)
    if italic_last and len(words[0].split()) > 1: r.texts.append(words[0])

def boxed(r, words, px, t, z, pos, rot=0, kf=None, box=WHITE, test=None, round_=0.0, typewriter=None):
    """Editable Montserrat on CapCut's text background (editable.Reel.boxed)."""
    fg = INK if sum(box) / 3 > 140 else WHITE
    r.L.text('montserrat', _px(px * 0.85), (words, test or words.replace('[', '').replace(']', '')), t, z, pos, rot, kf,
             typewriter=typewriter, color=fg, box=(box, round_))

def plain(r, words, px, t, z, pos, rot=0, kf=None, color=INK, edge=None, test=None, typewriter=None):
    """Editable Montserrat with no box (words on paper)."""
    r.L.text('montserrat', _px(px * 0.85), (words, test or words.replace('[', '').replace(']', '')), t, z, pos, rot, kf,
             typewriter=typewriter, color=color, stroke=(edge, 0.03) if edge else None)

def doodle(r, kind, i, px, t, z, pos, rot=0, kf=None, color=INK, edge=None):
    """One of her doodles as a recolourable one-letter text layer (Scrolly Doodles); px = its longest side."""
    c = DF.char(kind, i)
    r.L.text('doodles', _px(px), (c, c), t, z, pos, rot, kf, color=color, stroke=(edge, 0.02) if edge else None)
    r.L.L[-1]['centred'] = True

def keep_blurred_backgrounds():
    """editable._canvas paints the stage colour on every main-track segment, which also wipes CapCut's Background > Blur
    on clips built with blur_bg=True (#03). Patch it (for the template that calls this) to leave blurred ones alone."""
    import json
    if getattr(Ed._canvas, 'keeps_blur', False): return
    paint = Ed._canvas
    def _canvas(color, draft_files):
        saved = {}
        for f in draft_files:
            d = json.loads(f.read_text(encoding='utf-8')); saved[f] = [c['id'] for c in d['materials'].get('canvases', [])
                                                                      if c.get('type') == 'canvas_blur']
        paint(color, draft_files)
        for f in draft_files:
            if not saved[f]: continue
            d = json.loads(f.read_text(encoding='utf-8'))
            for c in d['materials']['canvases']:
                if c['id'] in saved[f]: c.update(type='canvas_blur', blur=0.375, color='')
            f.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    _canvas.keeps_blur = True; Ed._canvas = _canvas

# ---- pieces for the motion-test rebuilds (04, 05, 06, 07, 13) ---------------------------------------------------------
from PIL import Image, ImageDraw
import collage as C
from engine import W, H
from motion_b2 import ease, seg, lerp

def card_frame(w, h, border=16, r=0, shadow=((8, 14), 14, 110), fill=WHITE):
    """play_extra.clip_card / story4.card as a frame: a white card with the clip's window punched out (the shadow only
    outside the card). Returns (image, window size, window centre offset from the image centre)."""
    cw, ch = w + 2 * border, h + 2 * border
    c = Image.new('RGBA', (cw, ch), (0, 0, 0, 0)); ImageDraw.Draw(c).rounded_rectangle((0, 0, cw - 1, ch - 1), r + border if r else 2, fill=fill + (255,))
    if shadow: c = C.shadow(c, *shadow)
    pad = (c.width - cw) // 2
    return Ed.window(c, (pad + border, pad + border, pad + border + w, pad + border + h), radius=r)

def ring(d, rim=16, color=WHITE, shadow=((8, 14), 14, 100)):
    """story4.roundwin's rim as a picture: a ring round a d-wide round clip (the clip layer goes under it, mask='circle')."""
    s = d + 2 * rim + 8; im = Image.new('RGBA', (s, s), (0, 0, 0, 0)); dr = ImageDraw.Draw(im)
    dr.ellipse((4, 4, s - 5, s - 5), fill=color + (255,)); dr.ellipse((s / 2 - d / 2, s / 2 - d / 2, s / 2 + d / 2, s / 2 + d / 2), fill=(0, 0, 0, 0))
    return C.shadow(im, *shadow) if shadow else im

def solid(size, color, alpha=255):
    return Image.new('RGBA', (int(size[0]), int(size[1])), tuple(color) + (alpha,))

def strips(r, name, t0, t1, tones, z, n=8, vertical=False):
    """The two-tone strip slice (play_extra.slice_h / slice_v) as CapCut can do it: n tinted strips close over the old
    scene from alternate sides (t0 to the middle), then slide apart the way they came in to show the new one (to t1).
    The strips are pictures (recolour with Adjust > HSL)."""
    tm = (t0 + t1) / 2; L = H if vertical else W
    for i in range(n):
        size = (W / n + 2, H) if vertical else (W, H / n + 2)
        c = ((i + 0.5) * W / n, H / 2) if vertical else (W / 2, (i + 0.5) * H / n)
        sgn = 1 if i % 2 == 0 else -1
        def f(ts, c=c, sgn=sgn):
            u = 1 - ease(seg(ts, t0, tm)) + ease(seg(ts, tm, t1)); d = sgn * u * (L + 80)
            return Ed.at(c[0], c[1] + d) if vertical else Ed.at(c[0] + d, c[1])
        r.art(f'{name}-{i}', solid(size, tones[i % 2]), t0, t1, z + i, f)

def zoom_into(t0, t1, focus, z1):
    """motion_b2.camera on a group: the camera dives into `focus` (screen point) from scale 1 to z1, eased^2 as in the
    motion tests; the view is kept inside the frame."""
    def m(ts, v):
        z = lerp(1, z1, ease(seg(ts, t0, t1)) ** 2)
        if z <= 1.0001: return v
        w, h = W / z, H / z; x0 = min(max(focus[0] - w / 2, 0), W - w); y0 = min(max(focus[1] - h / 2, 0), H - h)
        return dict(v, x=(v['x'] - x0) * z, y=(v['y'] - y0) * z, s=v.get('s', 1.0) * z)
    return m
