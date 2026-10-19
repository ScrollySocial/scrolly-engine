"""Turn an approved story7 motion test into CapCut layers (round 4, 2026-10-18).

The buyer's clips stay real CapCut clip layers; everything else that moves (objects, doodles, built-in DM Serif words,
rims, phones) plays as a flipbook rendered from the motion test itself, so the template moves the way she approved it.

How the clip windows are found: while the flipbook renders, each Clip is swapped for a solid key colour. Each frame,
the key colours are cut out of the artwork (leaving a hole) and their bounding box gives that clip's position and scale
at that moment, which become the clip layer's keyframes. Editable words ([brackets], highlight boxes) are blanked in
the artwork and added on top as CapCut text with CapCut's own text background (engine Layers.text box=...).
Times: story7 plays its timeline P.SLOW times longer (reading time), so CapCut time = story time x SLOW.
"""
import hashlib, math
from PIL import Image, ImageChops, ImageFilter, ImageMath, ImageOps
from engine import W, H

KEYS = {'m': (255, 0, 255), 'c': (0, 255, 255), 'b': (0, 0, 255), 'y': (255, 0, 128), 'o': (128, 0, 255), 'g': (0, 255, 0)}   # far from the four palette colours

class KeyClip:
    """Stands in for a story7 Clip while the flipbook renders: a solid key colour at any size. With KeyClip.invert on,
    every clip draws the opposite colour instead (the second render of the matte, see matte())."""
    invert = False
    def __init__(self, col): self.col = col
    def at(self, t, size=(W, H)):
        col = tuple(255 - v for v in self.col) if KeyClip.invert else self.col
        return Image.new('RGBA', (int(size[0]), int(size[1])), col + (255,))

class KeySheet:
    """A tall key-coloured sheet that something crops from (a phone's scrolling feed): the crop follows KeyClip.invert."""
    def __init__(self, col, size): self.clip, self.size = KeyClip(col), size
    def crop(self, box): return self.clip.at(0, (box[2] - box[0], box[3] - box[1]))

def holes(im, cols, thr=40):
    """{key: bbox} of each key colour's solid area in a frame (where that clip shows)."""
    rgb = im.convert('RGB'); alpha = im.split()[3].point(lambda v: 255 if v > 200 else 0); boxes = {}
    for k, col in cols.items():
        d = ImageChops.difference(rgb, Image.new('RGB', rgb.size, col)).split()
        far = ImageChops.lighter(ImageChops.lighter(d[0], d[1]), d[2])          # the largest channel difference
        bb = ImageChops.multiply(far.point(lambda v: 255 if v < thr else 0), alpha).getbbox()
        if bb and (bb[2] - bb[0]) * (bb[3] - bb[1]) > 400: boxes[k] = bb
    return boxes

def matte(a, b):
    """The artwork with clean holes, from two renders: a with every clip in its key colour, b with every clip in the
    opposite colour. Where the two differ, a clip shows through; by how much they differ is how see-through the
    artwork is there (shadows and soft edges keep their true transparency, no coloured fringe), and their average,
    less the grey the two keys average to, is the artwork's own colour."""
    A, B = a.split(), b.split(); dif = [ImageChops.difference(x, y) for x, y in zip(A[:3], B[:3])]
    d = ImageChops.lighter(ImageChops.lighter(dif[0], dif[1]), dif[2]); op = ImageOps.invert(d)   # 255 = opaque artwork
    rgb = [ImageMath.lambda_eval(lambda e: e['convert'](e['max'](e['min'](((e['float'](e['p']) + e['float'](e['q'])) / 2.0 - e['float'](e['d']) / 2.0) * 255.0 / e['max'](e['float'](e['o']), 1.0), 255.0), 0.0), 'L'),
                                 p=x, q=y, d=d, o=op) for x, y in zip(A[:3], B[:3])]
    alpha = ImageChops.multiply(A[3], op.point(lambda v: 0 if v < 6 else v))
    return Image.merge('RGBA', rgb + [alpha])

def _on_screen_keysafe(name, w, content, edge=8):
    """play.on_screen without its green despill on key colours (the matte's second render uses green)."""
    import play as P
    im, m, bb = P.device(name, w); im = im.copy(); cw, ch = bb[2] - bb[0], bb[3] - bb[1]
    lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); lay.paste(ImageOps.fit(content.convert('RGBA'), (cw, ch)), bb[:2]); im.paste(lay, (0, 0), m)
    keys = list(KEYS.values()) + [tuple(255 - v for v in c) for c in KEYS.values()]; px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g_, b_, al = px[x, y]
            if al and g_ > 120 and g_ > r + 40 and g_ > b_ + 40 and not any(max(abs(r - k[0]), abs(g_ - k[1]), abs(b_ - k[2])) < 40 for k in keys):
                px[x, y] = (20, 20, 22, al)
    return P.die_cut(im, edge)

def flipbook(frame_fn, t0, t1, fps=15):
    """Render frame_fn(t) (t in CapCut seconds) from t0 to t1, twice per frame for the matte. Returns (frames for
    Layers.flip at 30 fps, track) where track = [(t, {key: bbox})]. Identical frames share one image."""
    import play as P
    frames, track, seen = [], [], {}; keep = P.on_screen; P.on_screen = _on_screen_keysafe
    try:
        n = max(1, int(round((t1 - t0) * fps)))
        for i in range(n):
            t = t0 + i / fps; KeyClip.invert = False; a = frame_fn(t); KeyClip.invert = True; b = frame_fn(t); KeyClip.invert = False
            track.append((t, holes(a, KEYS))); im = matte(a, b)
            bb = im.getbbox()
            if bb is None: im, c = Image.new('RGBA', (2, 2), (0, 0, 0, 0)), (W / 2, H / 2)
            else: c = ((bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2); im = im.crop(bb)
            h = hashlib.md5(im.tobytes()).hexdigest() + f'{c}'
            if h in seen: im = seen[h]
            else: seen[h] = im
            frames += [(im, c)] * (30 // fps)
    finally:
        KeyClip.invert = False; P.on_screen = keep
    return frames, track

def place(bb, size, rot):
    """Centre and scale of a (size, rot-degrees) window from the bounding box of what is visible of it. A side cut off
    by the frame edge is rebuilt from the opposite side."""
    w0, h0 = size; a = math.radians(abs(rot)); bw = w0 * math.cos(a) + h0 * math.sin(a); bh = w0 * math.sin(a) + h0 * math.cos(a)
    x0, y0, x1, y1 = bb; cl, cr, ct, cb = x0 <= 1, x1 >= W - 1, y0 <= 1, y1 >= H - 1
    if not (cl or cr): s = (x1 - x0) / bw
    elif not (ct or cb): s = (y1 - y0) / bh
    else: s = 1.0
    cx = (x0 + x1) / 2 if cl == cr else (x1 - bw * s / 2 if cl else x0 + bw * s / 2)
    cy = (y0 + y1) / 2 if ct == cb else (y1 - bh * s / 2 if ct else y0 + bh * s / 2)
    return cx, cy, s

def clip_layers(g, track, segs, z0=1):
    """segs: [(key, slot, t0, t1, size, rot, mask, src_fn[, geom_fn])] in CapCut seconds. One clip layer per segment,
    following its hole frame by frame (x, y, scale keyframes); src_fn(t) = where in the buyer's clip that moment is.
    geom_fn(t) -> (x, y, scale, rot) replaces the tracking where the window is bigger than the frame (nothing to measure)."""
    z = z0
    for seg_ in segs:
        key, slot, a, b, size, rot, mask, src_fn = seg_[:8]; geom = seg_[8] if len(seg_) > 8 else None
        if geom: pts = [(t, geom(t)) for t, bx in track if a <= t < b and key in bx]
        else:   # rot may be a function of time (a balloon swinging): tracked position, known turn
            rf = rot if callable(rot) else (lambda t, r=rot: r)
            pts = [(t, place(bx[key], size, rf(t)) + (rf(t),)) for t, bx in track if a <= t < b and key in bx]
        if not pts: continue
        ts, te = pts[0][0], min(b, pts[-1][0] + 1 / 15)
        kf = {'x': [(t - ts, p[0]) for t, p in pts], 'y': [(t - ts, p[1]) for t, p in pts], 'scale': [(t - ts, p[2]) for t, p in pts]}
        if geom or callable(rot): kf['rot'] = [(t - ts, p[3]) for t, p in pts]
        g.clip(slot, (ts, te), z, (pts[0][1][0], pts[0][1][1]), (2 * ((int(size[0]) + 9) // 2), 2 * ((int(size[1]) + 9) // 2)), pts[0][1][3], kf, src=max(0.0, src_fn(ts)), mask=mask)   # even sizes (the preview's JPEG frames need them)
        z += 1
    return z

def text_anchor(with_text, blank, rot=0):
    """Where baked-in words sit on an element (offset from its centre, after rotating it `rot` degrees as put() does):
    so an editable CapCut text can sit exactly where the motion test drew them."""
    d = ImageChops.difference(with_text.convert('RGB'), blank.convert('RGB')).convert('L').point(lambda v: 255 if v > 30 else 0)
    if rot: d = d.rotate(rot, expand=True)
    bb = d.getbbox(); return ((bb[0] + bb[2]) / 2 - d.width / 2, (bb[1] + bb[3]) / 2 - d.height / 2)

def popk(t0, dur=0.3, out=None, out_dur=0.18):
    """motion_b2.pop's bounce (back_out 2.2) as scale keyframes, layer-relative, in CapCut seconds."""
    from motion_b2 import back_out, ease
    k = [(t0 + dur * i / 6, back_out(i / 6, 2.2)) for i in range(7)]
    if out is not None: k += [(out, 1.0), (out + out_dur, 0.0)]
    return ([(0, 0.0)] if t0 > 0 else []) + k
