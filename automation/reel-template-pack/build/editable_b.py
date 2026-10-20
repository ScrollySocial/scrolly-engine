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

def hole(img, key=KEY):
    """Punch the key-coloured (magenta) area of an object image: (image, window size, window centre offset)."""
    px = img.load(); m = Image.new('L', img.size, 0); mp = m.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if a > 200 and r > 235 and b > 235 and g < 30: mp[x, y] = 255
    bb = m.getbbox(); return Ed.window(img, bb)

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
