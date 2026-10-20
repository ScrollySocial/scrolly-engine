"""Shared bits for the editable rebuilds of 08, 09, 10, 11, 12, 20, 22 and 23 (2026-10-20). Their approved motion tests
(build/story7.py) play P.SLOW times longer as a whole (no reading holds), so a layer's script time maps to CapCut time
by * SLOW, and the motion functions are written on the motion test's own script time."""
import math
from PIL import Image, ImageChops
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import play as P
import motion_capcut as MC
from motion_b2 import ease, back_out, seg, lerp
from engine import W, H

SL = P.SLOW
KEY = (255, 0, 255)

class SlowReel(Ed.Reel):
    """Ed.Reel on story7 script time: real = script * SLOW, f(ts) sampled at real / SLOW."""
    def __init__(self, script_end, sl=SL):
        self.sl = sl; super().__init__([], script_end)
    def R(self, ts): return round(ts * self.sl, 4)
    def _kf(self, f, r0, r1): return super()._kf(lambda t: f(t / self.sl), r0, r1)

def hole(img, key=KEY, ellipse=False):
    """Punch the key-coloured (magenta) area of an object image: (image, window size, window centre offset)."""
    px = img.load(); m = Image.new('L', img.size, 0); mp = m.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a > 200 and r > 235 and b > 235 and g < 30: mp[x, y] = 255
    from PIL import ImageFilter
    bb = m.getbbox(); m = m.filter(ImageFilter.MaxFilter(5))      # the exact key shape (a round or arched window too)
    out = img.copy(); out.putalpha(ImageChops.subtract(out.split()[3], m))
    return out, (bb[2] - bb[0] + 8, bb[3] - bb[1] + 8), ((bb[0] + bb[2]) / 2 - img.width / 2, (bb[1] + bb[3]) / 2 - img.height / 2)

def keyed(size):
    return Image.new('RGBA', (int(size[0]), int(size[1])), KEY + (255,))

def anchor(with_text, blank):
    """Where baked words sit on an element, as an offset from its centre (unrotated)."""
    return MC.text_anchor(with_text, blank)

def shake(t, t0, t1, amp=7):
    return amp * math.sin(t * 55) * (1 - seg(t, t0, t1)) if t >= t0 else 0

def pop(x, y, t0, r=0.0, dur=0.3, k=2.2, wiggle=0.0, s=1.0):
    """motion_b2.pop: in with a bounce at t0, a small wiggle while it stays (r = clockwise degrees)."""
    def f(ts):
        if ts < t0: return at(x, y, 0.0, r)
        return at(x, y, s * back_out(seg(ts, t0, t0 + dur), k), r - (wiggle * math.sin(ts * 7) if ts > t0 + dur else 0))
    return f

def word(x, y, t0, r=0.0):
    """P.say for a caption() line (the built-in DM Serif words): bounce 1.8 over 0.22 s, an 18 px rise."""
    return pop_in(x, y, t0, r, 0.22, 1.8, 18)

def out_l(t0, dur=0.3): return slide(t0, t0 + dur, -W)          # the motion test's swipe: the old scene leaves left
def in_r(t0, dur=0.3): return enter(t0, t0 + dur, W)            # ... and the new one comes in from the right
def out_r(t0, dur=0.3): return slide(t0, t0 + dur, W)
def in_l(t0, dur=0.3): return enter(t0, t0 + dur, -W)
def out_u(t0, dur=0.3): return slide(t0, t0 + dur, 0, -H)      # story7.vslide: the old scene leaves upward
def in_u(t0, dur=0.3): return enter(t0, t0 + dur, 0, H)

def kids(parent, off, r0=0.0):
    return Ed.child(parent, off, r0)

def gone(t0, dur=0.18):
    """motion_b2.pop's exit: a quick shrink from t0."""
    def m(ts, v): return dict(v, s=v.get('s', 1.0) * (1 - ease(seg(ts, t0, t0 + dur))))
    return m

def flutter(flap, phase=0.0):
    """P.butterfly's wing beat. CapCut keyframes scale evenly, so the wings pulse instead of folding sideways.
    flap(ts) -> 0..1 strength."""
    def m(ts, v): return dict(v, s=v.get('s', 1.0) * (1 - 0.3 * flap(ts) * (0.5 + 0.5 * math.sin(ts * 16 + phase))))
    return m

def string(item, rest, anchor, color=(250, 250, 250), width=4):
    """A balloon's string as a picture riding on the balloon: (image, offset from the balloon's centre, turn).
    rest = the balloon's resting centre, anchor = where the string is tied."""
    from PIL import ImageDraw
    bx, by = rest[0], rest[1] + item.height / 2 - 20; dx, dy = anchor[0] - bx, anchor[1] - by; L = int(math.hypot(dx, dy))
    im = Image.new('RGBA', (width + 6, L), (0, 0, 0, 0)); ImageDraw.Draw(im).line([(im.width / 2, 0), (im.width / 2, L)], fill=color + (255,), width=width)
    r0 = math.degrees(math.atan2(-dx, dy)); return im, (dx / 2, item.height / 2 - 20 + dy / 2), r0

def bob(x, y, phase, rise=None):
    """P.balloon's float: bobbing round (x, y); rise = (t0, t1, from_y) floats it up into place."""
    def f(ts):
        yy = lerp(rise[2], y, ease(seg(ts, rise[0], rise[1]))) if rise else y
        return at(x + 14 * math.sin(ts * 1.6 + phase), yy + 18 * math.sin(ts * 2.1 + phase), 1, -6 * math.sin(ts * 1.4 + phase))
    return f

def device(name, w):
    """A die-cut green-screen device with its screen punched: (image, screen size, screen offset)."""
    im, _, _ = P.device(name, w); return Ed.device_hole(P.die_cut(im, 8))
