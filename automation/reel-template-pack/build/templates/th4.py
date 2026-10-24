"""h4 What's inside? (Halloween), the FREE bonus template for the SPOOKY comment keyword (Mercedes 2026-10-23: made
only for the freebie, never in the paid pack). Approved 2026-10-23 as motion test v2 (build/motion_h4.py, sparkle
moved clear of the "?"). FULLY EDITABLE build (build/editable.py), every element where she approved it.
Story: the Reel opens on the carved pumpkin with clip 1 only glimpsed through its face ("what's inside?"), the camera
flies in through the mouth and clip 1 is the answer ("something new"); the pumpkin swings in and we dive through its
eye to clip 2 ("launching [Oct 31]"), it rises from the bottom and we fly through the mouth to clip 3 ("get the first
look"); CTA on the lit pumpkin: "comment [PUMPKIN] to get in first".
Editable: every word is CapCut text (Bodoni Moda key words in butter, built letter by letter for the fixed words;
Montserrat small lines in cream; thin dark outline + shadow), the sparkles, arrow and underline are Scrolly Doodles
text, and the night is CapCut's Background > Colour under a colourless night-sky layer.
CapCut limits: CapCut has no pumpkin-shaped mask, so the pumpkin is one picture (the carved shell with see-through
holes on a round patch of night with its orange glow) that moves over the clip; the clip behind it is a window that
grows with the dive until it is full screen, so the cut to full screen is seamless. Because of that round patch, when
the pumpkin swings in over clip 1 and rises over clip 2 it brings a circle of night with it (in the motion test the
clip showed all round it). The patch is a picture in the default night colour: recolour it with Adjust > HSL to match
a new background colour. The candle glow in the holes is an orange picture over the clip."""
import math
from PIL import Image, ImageChops, ImageDraw
from engine import W, H
import editable as Ed
from editable_halloween import kf, popk, tone_overlay
import storyboard_halloween as B
import motion_h4 as M

BUTTER, CREAM, EDGE = M.BUTTER, M.CREAM, M.EDGE        # BUTTER is the accent: buyers change it to their brand colour
SPEC = dict(num='h4', title="What's inside?", subtitle='15 seconds. Three clips: your new product, then two more of it.',
            font='bodoni', dir='halloween/h4-whats-inside', folder='Template h4 - Whats inside',
            project='h4 Whats inside', cover_at=1.9,
            slots=[('Your new product', 'Close up, upright, some movement'),
                   ('You, or your product in use', 'Making, packing, using it'),
                   ('Your product again', 'A detail or texture shot')],
            test_clips=[('IMG_1439', 1.0), ('IMG_1385', 0.5), ('IMG_1447', 0.3)])
END = 14.6
SKY = B.night_sky()
STAGE = tuple(int(sum(c) / len(c)) for c in zip(*SKY.convert('RGB').resize((32, 32)).getdata()))   # the night blue
P0 = 1000                                                 # the pumpkin's width inside its picture
PH0 = P0 * M.PH / M.PW

def pumpkin_sheet():
    """The carved shell (holes see-through) on a round patch of night with the candle's orange glow round it."""
    R1, R2 = 0.98 * P0, 1.25 * P0; S = int(2 * R2); c = S / 2
    sheet = Image.new('RGBA', (S, S), STAGE + (0,))
    a = Image.new('L', (S, S), 0); da = ImageDraw.Draw(a)
    for k in range(60):                                   # opaque out to R1, feathered to nothing at R2
        r = R2 - (R2 - R1) * k / 59; da.ellipse((c - r, c - r, c + r, c + r), fill=int(255 * k / 59))
    sheet.putalpha(a)
    M.halo(sheet, (c, c + 0.03 * P0), 1.3 * P0)
    shell = M.SHELL.resize((P0, int(PH0)), Image.LANCZOS)
    sheet.alpha_composite(shell, (int(c - P0 / 2), int(c - PH0 / 2)))
    holes = Image.new('L', sheet.size, 0)                 # the carved holes go right through the patch too
    holes.paste(M.HOLES.resize((P0, int(PH0)), Image.LANCZOS), (int(c - P0 / 2), int(c - PH0 / 2)))
    sheet.putalpha(ImageChops.subtract(sheet.split()[3], holes)); return sheet

def glow_sheet(level):
    """Orange light in the carved holes (level 0..1, as the motion test's glow), same size and centre as the shell."""
    holes = M.HOLES.resize((P0, int(PH0)), Image.LANCZOS).point(lambda v: int(v * 0.8 * level))
    g = Image.new('RGBA', holes.size, (255, 170, 60, 255)); g.putalpha(holes); return g

def _box():
    b = M.HOLES.point(lambda v: 255 if v > 128 else 0).getbbox()
    return (b[0] / M.PW, b[1] / M.PH, b[2] / M.PW, b[3] / M.PH)
HB = _box()

def place(width, anchor, frac):
    """Pumpkin `width` px wide with point frac of it at screen anchor -> (centre, scale) of its picture."""
    h = width * M.PH / M.PW
    return (anchor[0] + (0.5 - frac[0]) * width, anchor[1] + (0.5 - frac[1]) * h), width / P0

def window(width, anchor, frac):
    """The clip window behind the face: covers the carved holes, 9:16 like the screen, full screen once it's that big."""
    (cx, cy), _ = place(width, anchor, frac); h = width * M.PH / M.PW
    x0, y0 = cx - width / 2 + HB[0] * width, cy - h / 2 + HB[1] * h
    x1, y1 = cx - width / 2 + HB[2] * width, cy - h / 2 + HB[3] * h
    s = max((x1 - x0) / W, (y1 - y0) / H) * 1.08
    if s >= 1: return Ed.at(W / 2, H / 2, 1.0)
    k = M.clamp((s - 0.6) / 0.4)
    return Ed.at((x0 + x1) / 2 * (1 - k) + W / 2 * k, (y0 + y1) / 2 * (1 - k) + H / 2 * k, s)

def dive(t, t0, dur, width, start, frac):
    """motion_h4.dive: the camera flies in through one carved hole -> (width, anchor, frac)."""
    u = M.ease_in((t - t0) / dur); fx, fy = frac
    return (width * (1 + 20 * u), (start[0] + (fx - 0.5) * width * (1 - u) + (W / 2 - start[0]) * u,
                                   start[1] + (fy - 0.5) * width * (1 - u) + (H / 2 - start[1]) * u), frac)

C = (0.5, 0.5)
def pk(t):
    """Where the pumpkin is at script time t (width, anchor, frac), straight from motion test v2."""
    if t < 2.2:
        rock = 2.5 * math.sin(t * 7) * (1 if t < 1.6 else 0.4)
        return 1050 + 40 * M.ease(t / 2.2), (W / 2 + rock * 6, 1180), C
    if t < 3.2: return dive(t, 2.2, 1.0, 1090, (W / 2, 1180), M.MOUTH)
    if t < 5.2: return dive(3.2, 2.2, 1.0, 1090, (W / 2, 1180), M.MOUTH)
    if t < 6.2:
        u = (t - 5.2) / 1.0
        if u < 0.45: return 1250, (W + 700 - (W / 2 + 700) * M.ease(u / 0.45), 1050), C
        return dive(t, 5.65, 0.55, 1250, (W / 2, 1050), M.EYE_R)
    if t < 8.6: return dive(6.2, 5.65, 0.55, 1250, (W / 2, 1050), M.EYE_R)
    if t < 9.8:
        u = (t - 8.6) / 1.2
        if u < 0.45: return 1150, (W / 2, H + 700 - (H + 700 - 1100) * M.ease(u / 0.45)), C
        return dive(t, 9.14, 0.66, 1150, (W / 2, 1100), M.MOUTH)
    if t < 11.8: return dive(9.8, 9.14, 0.66, 1150, (W / 2, 1100), M.MOUTH)
    return 820, (W / 2, 1250 + 8 * math.sin(t * 3)), C

def at_pumpkin(ts):
    (x, y), s = place(*pk(ts)); return Ed.at(x, y, s)
def at_window(ts): return window(*pk(ts))
def window_until(t_full):
    """A clip's window follows the pumpkin until its dive ends at t_full, then stays full screen (the next pumpkin
    passes over it)."""
    return lambda ts: window(*pk(ts)) if ts < t_full else Ed.at(W / 2, H / 2, 1.0)

def reel():
    r = Ed.Reel([], END)
    sheet = pumpkin_sheet(); glow_lo, glow_hi = glow_sheet(0.35), glow_sheet(1.0)
    def say(font, px, words, t, pos, tracks, color):
        f = kf(pos, t[0], **tracks)
        if font == 'bodoni': r.text('bodoni', px, words, t[0], t[1], f, color, stroke=(EDGE, 0.03), shadow=True)
        else: r.text('montserrat', px * 0.85, words, t[0], t[1], f, color, stroke=(EDGE, 0.03), shadow=True)
    def letters(word, px, y, t0, end, color=BUTTER, step=0.06):
        font = B.F(B.SERIF, px); d = ImageDraw.Draw(Image.new('L', (4, 4)))
        x = W / 2 - d.textlength(word, font=font) / 2
        for i, ch in enumerate(word):
            cw = d.textlength(ch, font=font); ts = t0 + i * step
            if ch != ' ':
                say('bodoni', px, ch, (ts, end), (x + cw / 2, y),
                    {'scale': popk(0, 1.25), 'rot': [(0, 28 if i % 2 else -28), (0.28, 0)],
                     'y': [(0, y)] + [(0.6 + j * 0.25, y + (6 if j % 2 else -6)) for j in range(6)]}, color)
            x += cw
    def pop(words, font, px, t, pos, color=CREAM): say(font, px, words, t, pos, {'scale': popk(0, 1.2)}, color)
    def doodle(kind, i, px, c, t0, end, rot=0):
        r.doodle(kind, i, px, t0, end, Ed.pop_in(c[0], c[1], t0, rot, 0.25), BUTTER)
    def corn(t0, end):
        for i, (x, y, w, rot) in enumerate(M.FLOOR):
            ts = t0 + i * 0.07
            r.art(f'corn-{t0}-{i}', B.fit_w(M.CORN, w), ts, end, 60 + i,
                  kf((x, y), ts, -rot, y=[(0, y + 300), (0.3, y)], scale=[(0, 0.0), (0.2, 1.1), (0.3, 1.0)]))

    # the night: CapCut's background colour + the sky's stars and shading as a colourless layer (lowest picture)
    tone, _ = tone_overlay(SKY, STAGE)
    r.art('night-sky', tone, 0, None, 1, Ed.still(540, 960))

    # ===== 1-3 clip 1: glimpsed through the face, then the fly-in through the mouth reveals it (0 to 6.2) =====
    r.clip(0, 0, 6.2, 2, window_until(3.2))
    r.art('glow-1', glow_lo, 0, 2.5, 45, at_pumpkin)
    r.art('pumpkin-1', sheet, 0, 3.2, 50, at_pumpkin)
    corn(0.25, 2.4)
    say('bodoni', 200, "what's", (-0.1 + 0.1, 2.3), (540, 360), {'scale': [(0, 2.6), (0.18, 1.0)]}, CREAM)
    letters('inside?', 250, 600, 0.4, 2.3)
    doodle('icon', 9, 130, (920, 290), 1.0, 2.3, -15)
    pop('something', 'm', 70, (3.35, 5.2), (540, 360)); letters('new', 250, 560, 3.7, 5.2)
    doodle('icon', 9, 140, (250, 500), 3.95, 5.2); doodle('icon', 9, 140, (830, 620), 4.0, 5.2, -20)

    # ===== 4-5 the pumpkin swings in, we dive through its eye; clip 2 (5.2 to 9.8) =====
    r.clip(1, 5.2, 9.8, 3, window_until(6.2))
    r.art('pumpkin-2', sheet, 5.2, 6.2, 50, at_pumpkin)
    for i, (x, w) in enumerate(((150, 300), (930, 240))):
        sp = B.fit_w(M.SMALL, w); y = H - sp.height / 2 + 40; ts = 6.4 + i * 0.12
        r.art(f'small-{i}', sp, ts, 8.6, 20 + i, kf((x, y), ts, scale=popk(0, 1.15)))
    pop('launching', 'm', 70, (6.5, 8.6), (540, 360)); pop(('[Oct 31]', 'Oct 31'), 'bodoni', 220, (6.85, 8.6), (540, 560), BUTTER)
    doodle('arrow', 0, 240, (300, 820), 7.3, 8.6, 35)

    # ===== 6-7 the pumpkin rises, we fly through the mouth; clip 3 (8.6 to 11.8) =====
    r.clip(2, 8.6, 11.8, 4, window_until(9.8))
    r.art('pumpkin-3', sheet, 8.6, 9.8, 50, at_pumpkin)
    pop('get the', 'm', 70, (9.85, 11.8), (540, 360)); letters('first look', 190, 560, 9.95, 11.8, step=0.03)
    doodle('under', 2, 520, (540, 690), 10.5, 11.8)

    # ===== 8 CTA: the lit pumpkin, the floor, comment PUMPKIN (11.8 to 14.6) =====
    r.clip(2, 11.8, END, 4, at_window, src=3.2)
    r.art('glow-8', glow_hi, 11.8, END, 45, at_pumpkin)
    r.art('pumpkin-8', sheet, 11.8, END, 50, at_pumpkin)
    corn(11.9, END)
    pop('comment', 'm', 72, (11.95, END), (540, 330)); pop(('[PUMPKIN]', 'PUMPKIN'), 'bodoni', 200, (12.2, END), (540, 520), BUTTER)
    pop('to get in first', 'm', 66, (12.6, END), (540, 700))
    doodle('icon', 9, 140, (150, 330), 12.7, END, 15); doodle('icon', 9, 140, (930, 330), 12.85, END, -15)
    return r

def layers():
    return reel().L
