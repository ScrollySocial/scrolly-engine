"""Extra helpers for the second physical batch (#04, #05, #06, #07, #13), built next to play.py without changing it
(play.py belongs to the main physical chat). Same rules: real objects always styled (play.thing), readable words on
pills or thick-edged lettering, one accent per template that buyers change.

- slice_v / slice_h: the two-tone strip slice (her pick from the board), in any two tones, vertical or horizontal
- interleave: two clips cut into strips that alternate, then sort themselves into a clean half-and-half split
- poll(): a real-looking Instagram story poll sticker (A | B) whose bars fill in
- strip_sheet(): the 1 fps check strip with Instagram's no-text zones drawn on, for the checklist before sending
"""
import math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
from motion_b2 import ease, seg, lerp, clamp, W, H, WHITE

def tint(im, col, k):
    return Image.blend(im.convert('RGBA'), Image.new('RGBA', im.size, col + (255,)), k)

def slice_h(old, new, u, tones, n=8):
    """Old scene cut into horizontal strips tinted in two tones, sliding apart left/right to reveal the new one."""
    if u <= 0: return old
    if u >= 1: return new
    out = new.copy(); sh = H / n
    for i in range(n):
        y0, y1 = int(i * sh), int((i + 1) * sh); s = tint(old.crop((0, y0, W, y1)), tones[i % 2], 0.3 + 0.35 * u)
        out.alpha_composite(s, (int((1 if i % 2 == 0 else -1) * ease(u) * (W + 80)), y0))
    return out

def slice_v(old, new, u, tones, n=6):
    """The same in vertical strips sliding up/down."""
    if u <= 0: return old
    if u >= 1: return new
    out = new.copy(); sw = W / n
    for i in range(n):
        x0, x1 = int(i * sw), int((i + 1) * sw); s = tint(old.crop((x0, 0, x1, H)), tones[i % 2], 0.3 + 0.35 * u)
        out.alpha_composite(s, (x0, int((1 if i % 2 == 0 else -1) * ease(u) * (H + 80))))
    return out

def interleave(a, b, u, n=8, gap=10, line=WHITE):
    """A and B in alternating vertical strips (u=0), sorting into A on the left and B on the right (u=1)."""
    out = Image.new('RGBA', (W, H), line + (255,)); sw = W / n; half = n // 2
    for i in range(n):
        src = a if i % 2 == 0 else b; k = i // 2; dest = k if i % 2 == 0 else half + k
        x_from, x_to = i * sw, dest * sw; x = lerp(x_from, x_to, ease(u))
        cx0 = int(dest * sw)                        # each strip shows the part of its clip it will sit over at the end
        st = src.crop((cx0, 0, int(cx0 + sw), H)); st = st.crop((gap // 2, 0, st.width - gap // 2, H))
        out.alpha_composite(st, (int(x + gap // 2), 0))
    return out

def poll(a='A', b='B', pa=0.5, w=720, show=1.0, question=None):
    """An Instagram-style story poll sticker: white rounded card, the two options, bars filling to pa / 1-pa."""
    h = int(w * 0.42) + (int(w * 0.16) if question else 0); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, h - 1), 40, fill=(255, 255, 255, 250)); y0 = 0
    if question:
        y0 = int(w * 0.16); d.text((w / 2, y0 * 0.62), question, font=S.F(P.MONT, int(w * 0.06)), fill=(28, 27, 26), anchor='mm')
    bx0, bx1 = 40, w - 40; rows = ((a, pa), (b, 1 - pa)); rh = (h - y0 - 60) / 2
    for k, (lab, p) in enumerate(rows):
        ry = y0 + 30 + k * rh; d.rounded_rectangle((bx0, ry + 8, bx1, ry + rh - 8), int(rh / 2), fill=(238, 236, 232))
        fw = (bx1 - bx0) * p * show
        if fw > rh: d.rounded_rectangle((bx0, ry + 8, bx0 + fw, ry + rh - 8), int(rh / 2), fill=(206, 214, 238) if k == 0 else (240, 210, 200))
        f = S.F(P.MONT, int(rh * 0.42)); d.text((bx0 + 36, ry + rh / 2), lab, font=f, fill=(28, 27, 26), anchor='lm')
        if show > 0.05: d.text((bx1 - 36, ry + rh / 2), f'{int(round(p * show * 100))}%', font=f, fill=(28, 27, 26), anchor='rm')
    return C.shadow(im, (4, 12), 16, 110)

def clip_card(clip_im, w, h, border=14, rot=0, r=0):
    """A clip as a white-bordered photo card (rounded if r)."""
    c = Image.new('RGBA', (w + 2 * border, h + 2 * border), (0, 0, 0, 0)); ImageDraw.Draw(c).rounded_rectangle((0, 0, c.width - 1, c.height - 1), r + border if r else 2, fill=WHITE + (255,))
    v = ImageOps.fit(clip_im, (w, h)).convert('RGBA')
    if r: m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255); v.putalpha(m)
    c.alpha_composite(v, (border, border)); c = C.shadow(c, (8, 14), 14, 110)
    return c.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else c

PACK = Path(__file__).resolve().parent.parent; FF = str(PACK.parent / 'hyperframes-test' / 'bin' / 'ffmpeg.exe')

def strip_sheet(folder, secs=14, tw=180):
    """1 fps strip of NN-.../preview/motion-test.mp4 with the no-text zones shaded (top 220, bottom 420, right 150 of
    the lower half), saved as preview/strip.jpg for the checklist."""
    mp4 = PACK / folder / 'preview' / 'motion-test.mp4'; th = int(tw * 16 / 9); tmp = mp4.with_suffix('.tmp.png')
    subprocess.run([FF, '-v', 'error', '-y', '-i', str(mp4), '-vf', f'fps=1,scale={tw}:{th},tile={secs}x1', '-frames:v', '1', str(tmp)], check=True)
    im = Image.open(tmp).convert('RGBA'); tmp.unlink(); k = tw / W; lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for i in range(secs):
        x = i * tw; d.rectangle((x, 0, x + tw, 220 * k), fill=(255, 0, 0, 22)); d.rectangle((x, th - 420 * k, x + tw, th), fill=(255, 0, 0, 22))
        d.rectangle((x + tw - 150 * k, th / 2, x + tw, th - 420 * k), fill=(255, 0, 0, 22))
    im.alpha_composite(lay); out = Image.new('RGB', (im.width, im.height + 26), 'white'); out.paste(im.convert('RGB'), (0, 26))
    f = ImageFont.truetype('arialbd.ttf', 18); dd = ImageDraw.Draw(out)
    for i in range(secs): dd.text((i * tw + 4, 4), f'{i}s', font=f, fill=(0, 0, 0))
    p = PACK / folder / 'preview' / 'strip.jpg'; out.save(p, quality=85); print(p); return p

# ---- reading-time holds (must-do 14, 2026-10-18) ------------------------------------------------------------------------
# A hold freezes the graphics at script time X for h seconds while the words are read; the footage keeps playing
# (each clip runs on real time), so nothing jumps and the video never stops. Total length = script length + sum of holds.
import motion_b2 as _MB
_BIAS = [0.0]

def warp(t, holds):
    """Real time -> (script time, seconds of hold so far)."""
    H = 0.0
    for X, h in holds:
        if t - H <= X: break
        if t - H < X + h: return X, t - X
        H += h
    return t - H, H

def with_holds(frame, holds):
    """Wrap a frame(t) so the script holds at each (X, h); clips advance on real time throughout."""
    def fr(t):
        s, H = warp(t, holds); _BIAS[0] = H; return frame(s)
    return fr

def enable_holds():
    """Clips (motion_b2.Clip) run on real time while the script holds: their time gets the hold total added, they are
    extracted 14 s long (separate cache from the 5 s ones), and loop back and forth if a take runs out."""
    if getattr(_MB.Clip, '_holds', False): return
    init0 = _MB.Clip.__init__
    def init(self, name, t0, secs=5.0): init0(self, name, round(t0 + 0.001, 3), max(secs, 14.0))
    at0 = _MB.Clip.at
    def at(self, t, size=(W, H)):
        x = t + _BIAS[0]; n = len(self.fs) / _MB.FPS
        if n > 0.1 and x > n - 0.04:
            per = 2 * n; x = x % per; x = x if x < n else per - x   # ping-pong past the end of a short take
        return at0(self, x, size)
    _MB.Clip.__init__ = init; _MB.Clip.at = at; _MB.Clip._holds = True

# ---- her LOCKED type system and palette (FRAMEWORK.md "LOCKED: type and colour", 2026-10-18) ----------------------------
# Built-in words: DM Serif Display (Regular; Italic for the key word) with a thin outline (px/55); small lines: Manrope
# Medium on tight highlight boxes (use most). Words the buyer edits ([brackets]) use Montserrat (confirmed in CapCut).
# Pill once at most; no pattern fills; glow only as an animated flash. Palette: butter, wine, pink, light blue, ONE or
# TWO per template (+ ink/cream).
from PIL import ImageFilter as _IF, ImageFont as _IFont
BUTTER, WINE, PINK, BABY = (247, 230, 169), (122, 23, 50), (249, 201, 223), (191, 217, 242)
_FD = S.E.PACK / 'assets' / 'fonts'
SERIF, SERIF_I = str(_FD / 'dmserifdisplay-DMSerifDisplay-Regular.ttf'), str(_FD / 'dmserifdisplay-DMSerifDisplay-Italic.ttf')
MANROPE = str(_FD / 'manrope-Manrope[wght].ttf'); MONT = str(P.LB.FONT['montserrat'])     # Montserrat: editable words (in CapCut)
THEME = {'light': WHITE, 'dark': WINE}

def _manrope(px, wght=500):
    f = _IFont.truetype(MANROPE, int(px))
    try: f.set_variation_by_axes([wght])
    except Exception: pass
    return f

def key(text, px, fill=WHITE, edge=None, italic=False):
    """A key word: DM Serif Display (Italic for the key word; Montserrat if the buyer edits it), solid fill, thin outline
    (px/55) in the dark colour, soft shadow."""
    edge = edge or THEME['dark']; f = S.F(MONT if '[' in text else (SERIF_I if italic else SERIF), int(px * (0.8 if '[' in text else 1))); ew = max(3, int(px) // 55); l, t, r, b = f.getbbox(text); pad = ew * 3 + 30
    w, h = r - l + 2 * pad, b - t + 2 * pad; m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((pad - l, pad - t), text, font=f, fill=255)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0)); sh = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sh.putalpha(m.filter(_IF.MaxFilter(2 * ew + 1)).filter(_IF.GaussianBlur(12)).point(lambda v: int(v * 0.55))); out.alpha_composite(sh, (0, 8))
    e = Image.new('RGBA', (w, h), edge + (255,)); e.putalpha(m.filter(_IF.MaxFilter(2 * ew + 1))); out.alpha_composite(e)
    fl = Image.new('RGBA', (w, h), fill + (255,)); fl.putalpha(m); out.alpha_composite(fl); return out

def key_line(text, px, fill=WHITE, edge=None, gap=0.22):
    """A line of key words as separate images for word-by-word entry (works with play.say)."""
    parts = text.split(); ws = [key(w_, px, fill, edge, italic=(i == len(parts) - 1 and len(parts) > 1)) for i, w_ in enumerate(parts)]; sp = px * gap - 60; total = sum(w.width for w in ws) + sp * (len(ws) - 1)
    out, x = [], -total / 2
    for w in ws: out.append((w, x + w.width / 2)); x += w.width + sp
    return out

def hl(text, px, bg=WHITE, fg=None, rot=-2):
    """Small lines on tight highlight boxes (one box per line, Manrope Medium); text flips ink/white on the box colour."""
    fg = fg or ((24, 23, 22) if sum(bg) / 3 > 140 else WHITE); f = S.F(MONT, int(px * 0.92)) if '[' in text else _manrope(px); boxes = []
    for l in text.split('\n'):
        a, t, b, bt = f.getbbox(l); w, h = int(b - a + px * 0.45), int(px * 1.3)
        im = Image.new('RGBA', (w, h), bg + (255,)); ImageDraw.Draw(im).text((w / 2, h / 2), l, font=f, fill=fg, anchor='mm'); boxes.append(im)
    out = Image.new('RGBA', (max(b.width for b in boxes) + 20, sum(b.height for b in boxes) + 20), (0, 0, 0, 0)); y = 10
    for b in boxes: out.alpha_composite(b, (10, y)); y += b.height
    out = C.shadow(out, (4, 8), 8, 70); return out.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else out

def use_type(light, dark):
    """Switch play.caption / pill_m / big_text / story_word to her type system for this process (motion tests only;
    play.py itself is untouched). Captions become Bodoni key words, pills become highlight boxes: a dark pill -> a box in
    the dark colour, a light/cream pill -> white, an accent pill -> the light colour."""
    THEME['light'], THEME['dark'] = light, dark
    def caption(text, px, color=None, fill='soft', gap=0.28):
        if color is not None and sum(color) < 120: return key_line(text, px * 0.92, dark, WHITE)   # ink = a light stage: dark word, white edge
        return key_line(text, px * 0.92, WHITE, dark)
    def pill_m(text, px, bg, fg):
        b = sum(bg) / 3; box = dark if b < 70 else (WHITE if b > 225 else light)
        return hl(text, px, box)
    P.caption = caption; P.pill_m = pill_m
    P.big_text = lambda text, px, color=None, edge=None, edge_w=None, font=None: key(text, px * 0.9, WHITE, dark)
    P.story_word = lambda text, px, color=None, fill='soft', edge=None, shadow=None: key(text, px * 0.9, WHITE, dark)
    sticky0 = P.sticky
    def sticky(text, w=380, tint=None, px=None, seed=1, pin='pin-head-black'):
        """Sticky note with the words sized to stay INSIDE the note (her note on #06)."""
        if px is None:
            px = int(w * 0.17)
            while px > 20 and max(S.F(S.HAND, px).getlength(l) for l in text.split('\n')) > w * 0.72: px -= 2
        return sticky0(text, w, tint, px, seed, pin)
    P.sticky = sticky

class Window:
    """A clip held inside one stretch [a, b] of its take (seconds), playing back and forth there, on real time like the
    others (holds included). For stand-ins whose good moment is short (a lamp that is lit for 3 s)."""
    def __init__(self, clip, a, b): self.c, self.a, self.b = clip, a, b
    def at(self, t, size=(W, H)):
        n = self.b - self.a; x = (t + _BIAS[0]) % (2 * n); x = x if x < n else 2 * n - x
        return _AT0[0](self.c, self.a + x, size)

_AT0 = [None]
_enable0 = enable_holds
def enable_holds():
    _AT0[0] = _MB.Clip.at if not getattr(_MB.Clip, '_holds', False) else _AT0[0] or _MB.Clip.at
    if _AT0[0] is None or getattr(_MB.Clip, '_holds', False) is False: _AT0[0] = _MB.Clip.at
    _enable0()

# ---- sparkles (her note 2026-10-18: "add some diamonds or sparkles doodles ... a little more play/fun") ------------------
def sparkles(img, t, t0, pts, color, size=110, step=0.1):
    """Her 4-point sparkle doodle (icon 8) popping in at each point one after another, then twinkling (scale pulse)."""
    from collage_kit import doodle as _d
    from motion_b2 import put as _put, back_out as _bo
    sp = P.die_cut(_d('icon', 8, size, color), 4, False)
    for i, (x, y) in enumerate(pts):
        ti = t0 + i * step
        if t < ti: continue
        k = _bo(seg(t, ti, ti + 0.25), 2.2) * (0.8 + 0.25 * math.sin((t - ti) * 7 + i * 1.7))
        _put(img, sp, (x, y), k * (0.7 + 0.3 * (i % 3) / 2), 15 * math.sin(t * 2 + i))
