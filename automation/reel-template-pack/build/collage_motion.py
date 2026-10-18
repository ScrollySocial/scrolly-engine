"""The living collage (FRAMEWORK.md "The look: collage", 2026-10-17): photo tiles butted edge to edge, the buyer's clip
is one tile, a few real cut-outs cross the seams, one paper piece carries the words, pattern tiles mixed in. About 3 to
5 tiles, 2 to 3 cut-outs and 1 paper piece per frame. The collage moves: tiles slide, flip, peel off and swap; a still
photo tile starts playing as video; words pop onto a tile and the camera zooms into it and it becomes the next clip.

Tiles are dicts: {'keys': [(time, box or None)], 'fill': fn(t, size) -> image}. A box eases from one key to the next;
None hides the tile. Helpers here are shared by the batch 2 motion tests (build/motion_b2.py).
"""
import math
from PIL import Image, ImageDraw, ImageOps
import motion_b2 as M
from motion_b2 import W, H, ease, seg, lerp, clamp

_fit = {}
def still(im, key):
    """A still photo/pattern tile filler (cached per size)."""
    def f(t, size):
        k = (key, size)
        if k not in _fit:
            if len(_fit) > 300: _fit.clear()
            _fit[k] = ImageOps.fit(im, size, Image.BILINEAR, centering=(0.5, 0.5)).convert('RGBA')
        return _fit[k]
    return f

def video(clip, t0, freeze_until=None):
    """A clip tile: plays from t0; before freeze_until it shows its first frame as a still photo, then starts playing."""
    def f(t, size):
        tt = 0 if (freeze_until is not None and t < freeze_until) else t - (freeze_until if freeze_until is not None else t0)
        return clip.at(max(0, tt), size)
    return f

def swap(t_switch, a, b):
    return lambda t, size: a(t, size) if t < t_switch else b(t, size)

def kbox(t, keys):
    if t < keys[0][0]: return None
    for (t0, b0), (t1, b1) in zip(keys, keys[1:]):
        if t0 <= t < t1:
            if b0 is None: return None
            if b1 is None: return b0                      # holds, then is gone at the next key
            u = ease(seg(t, t0, t1)); return tuple(lerp(p, q, u) for p, q in zip(b0, b1))
    return keys[-1][1]

def draw_tile(img, im, box, seam=True):
    x0, y0, x1, y1 = box; w, h = int(round(x1 - x0)), int(round(y1 - y0))
    if w < 3 or h < 3: return
    if im.size != (w, h): im = im.resize((w, h), Image.BILINEAR)
    img.alpha_composite(im, (int(round(x0)), int(round(y0))))
    if seam: ImageDraw.Draw(img).rectangle((x0, y0, x0 + w - 1, y0 + h - 1), outline=(30, 24, 20, 70), width=3)

def tiles(img, t, ts):
    for tl in ts:
        b = kbox(t, tl['keys'])
        if b is None: continue
        w, h = int(round(b[2] - b[0])), int(round(b[3] - b[1]))
        if w < 3 or h < 3: continue
        im = tl['fill'](t, (w, h))
        fl = tl.get('flip')                                          # (t0, dur, other filler): the tile turns over
        if fl and fl[0] <= t < fl[0] + fl[1]:
            u = seg(t, fl[0], fl[0] + fl[1]); k = abs(math.cos(math.pi * u))
            src = tl['fill'] if u < 0.5 else fl[2]; im = src(t, (w, h))
            nw = max(2, int(w * k)); b = (b[0] + (w - nw) / 2, b[1], b[0] + (w + nw) / 2, b[3]); im = im.resize((nw, h), Image.BILINEAR)
        elif fl and t >= fl[0] + fl[1]: im = fl[2](t, (w, h))
        pe = tl.get('peel')                                          # (t0, dur, direction): it lifts off and falls away
        if pe and t >= pe[0]:
            u = ease(seg(t, pe[0], pe[0] + pe[1]))
            if u >= 1: continue
            c = ((b[0] + b[2]) / 2 + pe[2] * 900 * u, (b[1] + b[3]) / 2 + 1500 * u * u)
            M.put(img, M.C.shadow(im.copy(), (16, 24), 18, 120), c, 1 + 0.12 * math.sin(math.pi * min(1, u * 2)), pe[2] * 30 * u); continue
        draw_tile(img, im, b, tl.get('seam', True))
