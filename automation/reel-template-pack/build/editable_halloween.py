"""Helpers for the editable Halloween builds (th2, th3, th5, th6; 2026-10-20), on top of build/editable.py.
The Halloween CapCut builds were written as engine keyframe lists (layer-relative times); kf() turns those lists into
an editable.Reel motion function, so the approved timings carry over unchanged."""
from PIL import Image, ImageOps
from engine import W, H, interp, pop, wiggle
from editable import at

def kf(base, a, r0=0.0, **tracks):
    """Engine-style keyframes -> f(ts). base = (x, y) when a track is missing; a = the layer's start (script s);
    tracks: x, y, scale, rot as [(t from a, value), ...]."""
    def f(ts):
        t = ts - a
        return at(interp(tracks.get('x'), t, base[0]), interp(tracks.get('y'), t, base[1]),
                  interp(tracks.get('scale'), t, 1.0), interp(tracks.get('rot'), t, r0))
    return f

def popk(t=0.0, peak=1.18): return pop(t, peak)

def tone_overlay(photo, base=None, size=(W, H)):
    """A colourful photo stage (a night sky) as a colourless layer over CapCut's background colour: black where the
    photo is darker than the base colour, white where it is lighter, so the photo's light and shade stay and the
    colour comes from the canvas the buyer picks. base = the canvas colour it is tuned for (default: the photo's mean)."""
    im = ImageOps.fit(photo.convert('RGB'), size)
    g = ImageOps.grayscale(im)
    if base is None: base = tuple(int(sum(c) / len(c)) for c in zip(*im.resize((32, 32)).getdata()))
    c0 = max(1, int(0.299 * base[0] + 0.587 * base[1] + 0.114 * base[2]))
    dark = g.point(lambda v: int(255 * max(0, 1 - v / c0)) if v < c0 else 0)
    light = g.point(lambda v: int(255 * (v - c0) / (255 - c0)) if v > c0 else 0)
    out = Image.new('RGBA', size, (0, 0, 0, 0))
    k = Image.new('RGBA', size, (0, 0, 0, 255)); k.putalpha(dark); out.alpha_composite(k)
    w = Image.new('RGBA', size, (255, 255, 255, 255)); w.putalpha(light); out.alpha_composite(w)
    return out, base

def mean_colour(photo):
    im = photo.convert('RGB').resize((32, 32)); return tuple(int(sum(c) / len(c)) for c in zip(*im.getdata()))
