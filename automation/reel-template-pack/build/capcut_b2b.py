"""CapCut builds for the batch-2b motion tests (build/motion_04.py ... motion_25.py), using the main chat's converter
(build/motion_capcut.py) without changing it.

The motion tests run on reading-time holds (play_extra.with_holds): CapCut time = the motion test's real time, so a
script moment ts lands at R(ts) = ts + the holds before it. The flipbook renders the held frames; clips become key
colours (KeyClip) so their windows are found and turned into real CapCut clip layers; bracketed words are blanked in
the artwork and added as editable Montserrat text with CapCut's own text background.
"""
import contextlib
from PIL import Image
from engine import Layers, W, H
import motion_capcut as MC
import play_extra as X
from motion_b2 import ease

BLANK = Image.new('RGBA', (2, 2), (0, 0, 0, 0)); CLEAR = Image.new('RGBA', (W, H), (0, 0, 0, 0))
INK, WHITE = (24, 23, 22), (255, 255, 255)

def sz(px): return round(px * 0.85 / 6.1, 2)

def slide(old, new, u, direction=1):
    """A plain slide (the motion tests' smeared swipe would blur the key colours)."""
    if u <= 0: return old
    if u >= 1: return new
    dx = int(direction * ease(u) * W); out = Image.new('RGBA', (W, H)); out.alpha_composite(old, (-dx, 0)); out.alpha_composite(new, (direction * W - dx, 0)); return out

class Build:
    def __init__(self, holds, script_end):
        self.g = Layers(); self.holds = holds; self.end = self.R(script_end); self.z = 60
    def R_inv(self, t):
        """CapCut (real) time -> script time (inside a hold: the hold's moment)."""
        return X.warp(t, self.holds)[0]
    def R(self, ts):
        return ts + sum(h for x, h in self.holds if x < ts)
    def flip(self, frame_script, fps=15):
        """Flipbook of the whole Reel (real time), returns the clip-window track."""
        fr = X.with_holds(frame_script, self.holds); frames, track = MC.flipbook(fr, 0, self.end, fps); self.g.flip('fx', frames, 0, 40)
        return track
    def clips(self, track, segs):
        """segs in SCRIPT seconds: (key, slot, ts0, ts1, size, rot, mask[, geom]); src = time since the segment began."""
        out = []
        for s in segs:
            key, slot, a, b, size, rot, mask = s[:7]; ra, rb = self.R(a), self.R(b)
            row = (key, slot, ra, rb, size, rot, mask, (lambda t, ra=ra: round(t - ra, 4)))   # rounded: ffmpeg rejects 1.8e-15
            out.append(row + ((s[7],) if len(s) > 7 else ()))
        MC.clip_layers(self.g, track, out, z0=1)
    def say(self, words, test, px, t0, t1, pos, rot=0, box=WHITE, color=None, round_=0.0, stroke=None):
        """Editable words (script seconds); box = the highlight-box colour (None = no box); text ink/white by the box."""
        self.z += 1
        if color is None: color = INK if (box is None or sum(box) / 3 > 140) else WHITE
        self.g.text('montserrat', sz(px), (words, test), (self.R(t0), self.R(t1) if t1 is not None else self.end), self.z, pos, rot,
                    {'scale': MC.popk(0, 0.3)}, color=color, box=box and (box, round_), stroke=stroke)

def both(fn):
    """fn() rendered twice, plain and with KeyClip.invert on: artwork with a key-colour window baked in (a photo card
    holding a clip) has to swap colour for the matte's second render too, or the window reads as artwork."""
    a = fn(); MC.KeyClip.invert = True
    try: b = fn()
    finally: MC.KeyClip.invert = False
    return a, b

def per_pass(g, pairs, frame):
    """frame(t) with each g[key] set to the half of its both() pair that matches the render pass."""
    def f(t):
        for k, (a, b) in pairs.items(): g[k] = b if MC.KeyClip.invert else a
        return frame(t)
    return f

@contextlib.contextmanager
def flip_mode(M, g, keys, blanks, extra=None):
    """Swap the motion test's clips for key colours (keys: {clip name: key letter}), blank the editable words, use plain
    slides; `extra` (dict of g entries) replaces artwork for the flipbook only."""
    c = g['c']; keep_c = dict(c); keep = {k: g[k] for k in list(blanks) + list((extra or {}).keys())}
    sw = getattr(M, 'swipe', None)
    for name, k in keys.items(): c[name] = MC.KeyClip(MC.KEYS[k])
    for k in blanks: g[k] = BLANK
    for k, v in (extra or {}).items(): g[k] = v
    if sw: M.swipe = slide
    try: yield
    finally:
        c.clear(); c.update(keep_c); g.update(keep)
        if sw: M.swipe = sw
