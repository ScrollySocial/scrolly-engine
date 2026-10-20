"""h5 Trick or treat (Halloween pack), approved 2026-10-18 as motion test v10 (build/motion_h5.py).
FULLY EDITABLE build (2026-10-20, build/editable.py), same beats and timings as the approved CapCut build: clip 1
behind door 1's glass, the door swings open into the hallway (clip 1), TRICK with the mistake on a pinned note,
crossed out; a two-tone strip slice to door 2; clip 2 through the real arch, candy pops out, we fly through the
doorway; TREAT on a striped pill; ding dong and the doorbell view of clip 3 with PROOF; the CTA "Comment [TREAT]".
Editable: the taffy-striped built-in words (TRICK, or TREAT?, TREAT, PROOF, COMMENT) stay artwork (pattern-filled
Halloween lettering, allowed), one picture per letter so each letter jitters, pops or drops like the motion test;
every other word is CapCut text in Montserrat: the notes' [cheap sponges] and [5-star reviews], [something sweet is
coming], [our 5-minute scrub], ding dong!, the doorbell's Front door / LIVE / time, the CTA keyword [TREAT] on a
plum pill (CapCut's text background, so the pill grows with the keyword) and the offer line. The knocks, the X, the
heart, the arrow and the wavy underline are Scrolly Doodles letters (recolour like text).
CapCut limits: the swinging door leaf is a short flipbook of the door only (a perspective turn CapCut can't
keyframe), with its glass see-through so clip 1 shows through it; the strip slice is twelve strips of clip 1 (CapCut
crops) under tinted strip pictures; the striped pill behind TREAT (9.0 s) and the small burst behind the candy corn
are pictures, because text always sits above pictures and the taffy letters are pictures (recolour with Adjust >
HSL); the white "ding dong" flash is a 12-frame flipbook of a white layer (no opacity keyframes); the doorbell view is
a vignette picture plus text (no fisheye); the red LIVE dot blinks by scale; the doors, house, candy, note and pin
are real photos. No stage colour: the doors, the house and the clips fill the screen the whole time."""
import math, random
from PIL import Image, ImageDraw, ImageOps, ImageEnhance, ImageChops
from engine import W, H
import editable as Ed
from editable import at
from editable_halloween import kf, popk
from collage_kit import doodle as art_doodle
import motion_h5 as M
B = M.B

SPEC = dict(num='h5', title='Trick or treat', subtitle='17 seconds. Three clips: the common mistake, your product, the proof.',
            font='montserrat', dir='halloween/h5-trick-or-treat', folder='Template h5 - Trick or treat',
            project='h5 Trick or treat', cover_at=1.6,
            slots=[('The trick: the common mistake', 'The thing people buy or do instead of yours'),
                   ('The treat: your product', 'Your product in use, upright'),
                   ('The proof', 'A result, a happy customer, or the finished job')],
            test_clips=[('IMG_1447', 0.3), ('IMG_1439', 1.0), ('IMG_1460', 1.0)])
END = M.END
INK, WHITE, LAV, PLUM = M.INK, (255, 255, 255), (196, 170, 232), (70, 44, 96)
STAGE = INK

def clip_crop(r, slot, a, b, z, f, size, crop, src=0.0):
    """editable.Reel.clip with CapCut's crop (part of the buyer's frame, 0 to 1)."""
    r0, r1 = r.R(a), (r.end if b is None else r.R(b)); k, pos, rot = r._kf(f, r0, r1)
    r.L.clip(slot, (r0, r1), z, pos, (2 * (int(size[0]) // 2), 2 * (int(size[1]) // 2)), rot, k, src=src, crop=crop)

def scale_about(c0, piv, z):
    return (piv[0] + (c0[0] - piv[0]) * z, piv[1] + (c0[1] - piv[1]) * z)

_zc = [300]
def nz():
    _zc[0] += 1; return _zc[0]

def taffy(r, text, t0, cx, cy, px, motion, step, end, name):
    """The taffy lettering as one picture per letter, moving like motion_h5.word_art (jitter / pop / drop)."""
    gap = px * 0.02; widths = [M.E.ImageFont.truetype(M.SNAP, px).getlength(ch) for ch in text]
    x = cx - (sum(widths) + gap * (len(text) - 1)) / 2
    for i, ch in enumerate(text):
        lc = x + widths[i] / 2; x += widths[i] + gap
        if ch == ' ': continue
        ti0 = t0 + i * step
        def f(ts, i=i, lc=lc, ti0=ti0):
            ti = ts - ti0; rot, dy, sc = 0.0, 0.0, 1.0
            if ti < 0: return at(lc, cy, 0.0)
            if motion == 'pop':
                sc = M.back_out(ti / 0.3, 2.4); rot = (8 if i % 2 else -8) * (1 - M.clamp(ti / 0.3)) + (3 if i % 2 else -3)
            elif motion == 'jitter':   # spooky little jolts that never settle (12 a second)
                sc = M.back_out(ti / 0.25, 2.0); rr = random.Random(int(ts * 12) * 31 + i); rot = rr.uniform(-9, 9); dy = rr.uniform(-10, 10)
            elif motion == 'drop':
                dy = -(1 - M.back_out(ti / 0.45, 2.6)) * 900; rot = (5 if i % 2 else -5) * math.exp(-ti * 2)
            return at(lc, cy + dy, max(0.0, sc), -rot)      # PIL turns anticlockwise; CapCut clockwise
        r.art(f'{name}-{i}', M.letter(ch, px, 'taffy'), max(0.0, ti0), end, nz(), f)

def note_art(rot):
    return M.E.C.shadow(M.NOTE.rotate(rot, expand=True, resample=Image.BICUBIC), (8, 14), 12, 90)

def pill_img(w, h, stripe=120):
    """motion_h5.pill at full size: a plum pill with lavender taffy stripes and an ink edge."""
    im = Image.new('RGBA', (w + 24, h + 24), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((12, 12, w + 12, h + 12), radius=h // 2, fill=INK + (255,))
    inner = Image.new('RGBA', (w - 12, h - 12), PLUM + (255,)); di = ImageDraw.Draw(inner)
    for x in range(-h, w + h, 46): di.polygon([(x, 0), (x + 16, 0), (x + 16 + h, h), (x + h, h)], fill=LAV + (stripe,))
    m = Image.new('L', inner.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, inner.width - 1, inner.height - 1), radius=(h - 12) // 2, fill=255)
    inner.putalpha(m); im.alpha_composite(inner, (18, 18)); return M.E.C.shadow(im, (6, 12), 12, 80)

def reel():
    r = Ed.Reel([], END)
    def line(words, px, a, b, c, test=None):
        r.plain(words, px, a, b, kf(c, a, scale=popk(0, 1.1)), WHITE, INK, test=test)
    def doodle(kind, i, px, c, t0, end, rot=0, color=LAV, dur=0.3):
        r.doodle(kind, i, px, t0, end, Ed.pop_in(c[0], c[1], t0, -rot, dur), color)
    def pinned_note(t0, end, c, rot, words, test):
        r.art(f'note-{t0}', note_art(rot), t0, end, nz(), kf(c, t0, scale=popk(0, 1.15)))
        r.art(f'pin-{t0}', M.PIN, t0 + 0.25, end, nz(), Ed.still(c[0] + M.PIN.width * 0.2, c[1] - M.NOTE.height / 2 + M.PIN.height * 0.45))
        r.plain(words, 64, t0 + 0.05, end, kf(c, t0 + 0.05, -rot, scale=popk(0, 1.1)), INK, test=test)

    # ===== S1 door 1, clip 1 behind its glass (0 to 2.2) =====
    door = M.DOOR_SHUT.copy(); a = door.split()[3].copy()
    gray = ImageOps.grayscale(M.DOOR_SHUT.convert('RGB'))
    for b in M.PANES:   # the glass becomes see-through except the dark lattice bars
        a.paste(gray.crop(b).point(lambda x: 230 if x < 70 else 0), b[:2])
    door.putalpha(a)
    fw = (240 / 960) * 1920 / 1080
    for k, b in enumerate(M.PANES):
        clip_crop(r, 0, 0, 2.2, 2 + k, Ed.still((b[0] + b[2]) / 2, (b[1] + b[3]) / 2), (b[2] - b[0], b[3] - b[1]),
                  (0.5 - fw / 2, 0, 0.5 + fw / 2, 1))
    r.art('door1', door, 0, 2.2, 10, Ed.still(540, 960))
    taffy(r, 'TRICK', -0.3, 510, 1130, 210, 'jitter', 0.07, 2.2, 'hook-trick')
    taffy(r, 'or TREAT?', 0.1, 500, 1370, 120, 'pop', 0.04, 2.2, 'hook-treat')
    for k, (x, y) in enumerate(((430, 860), (660, 820), (540, 760))):   # three knocks
        doodle('burst', 3 if k % 2 == 0 else 4, 300 if k % 2 == 0 else 280, (x, y), 0.5 + k * 0.4, 2.2, dur=0.12)

    # ===== 2.2 to 3.2 the door swings open, then we push into the hallway (clip 1 full frame behind) =====
    r.clip(0, 2.2, 5.6, 2, Ed.still(540, 960), src=1.0)
    opened = B.door1('Warm Townhouse Entryway at Night.png', Image.new('RGBA', (W, H), (0, 0, 0, 0)))   # hallway left clear
    hx = [(0, 540), (0.6, 540)]; hy = [(0, 960), (0.6, 960)]; hs = [(0, 1.0), (0.6, 1.0)]
    for i in range(5):
        u = M.ease(i / 4); z = 1 + 2.4 * u; c = scale_about((540, 960), M.DOOR_C, z)
        hx.append((0.6 + 0.4 * i / 4, c[0])); hy.append((0.6 + 0.4 * i / 4, c[1])); hs.append((0.6 + 0.4 * i / 4, z))
    r.art('door1-open', opened, 2.2, 3.2, 10, kf((540, 960), 2.2, x=hx, y=hy, scale=hs))
    zl = nz()
    for i in range(18):     # the door leaf turns on its hinge (a flipbook of the door only; its glass stays see-through)
        u = M.ease(i / 17); th = math.radians(78 * u); lw = 880 * math.cos(th); d = H * 0.10 * math.sin(th)
        if lw <= 6: break
        dst = [(1000 - lw, d), (1000, 0), (1000, H), (1000 - lw, H - d)]; src = [(120, 0), (1000, 0), (1000, H), (120, H)]
        leaf = door.transform((W, H), Image.PERSPECTIVE, M.persp(dst, src), Image.BICUBIC)
        m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(dst, fill=255); leaf.putalpha(ImageChops.multiply(leaf.split()[3], m))
        leaf = ImageEnhance.Brightness(leaf).enhance(1 - 0.5 * u); bb = leaf.getbbox()
        r.art(f'door-swing-{i:02d}', leaf.crop(bb), 2.2 + i / 30, 2.2 + (i + 1) / 30, zl, Ed.still((bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2))

    # ===== S2 3.2 to 5.6 the TRICK: clip 1 full; TRICK, her words on a pinned note, crossed out =====
    taffy(r, 'TRICK', 3.25, 540, 420, 220, 'jitter', 0.07, 5.6, 'trick')
    pinned_note(3.55, 5.6, (700, 900), -5, '[cheap\nsponges]', 'cheap\nsponges')
    doodle('tick', 4, 330, (700, 900), 4.9, 5.6, -6)

    # ===== 5.6 to 6.1 two-tone strip slice to door 2: twelve strips of clip 1 slide apart over the house =====
    r.art('house-strip', M.HOUSE, 5.6, 6.1, 1, Ed.still(540, 960))
    n = 12; sh = H // n
    for k in range(n):
        def sf(ts, k=k):
            u = M.ease((ts - 5.6) / 0.5); return at(540 + (W + 40) * u * (1 if k % 2 else -1) * (0.85 + 0.03 * k), k * sh + sh / 2)
        clip_crop(r, 0, 5.6, 6.1, 40 + k, sf, (W, sh), (0, k / n, 1, (k + 1) / n), src=4.4)
        r.art(f'strip-tint{k}', Image.new('RGBA', (W, sh), (LAV if k % 2 == 0 else PLUM) + (115,)), 5.6, 6.1, 60 + k, sf)

    # ===== S3 6.1 to 8.3 door 2: clip 2 through the real arch, candy pops out; 8.3 to 9.0 through the doorway =====
    r.clip(1, 6.1, 11.6, 2, Ed.still(540, 960))
    arch_img = M.arch_house(1, Image.new('RGBA', (W, H), (0, 0, 0, 0)))
    ax, ay, asc = [(0, 540), (2.2, 540)], [(0, 960), (2.2, 960)], [(0, 1.0), (2.2, 1.0)]
    for i in range(8):
        u = M.ease(i / 7); z = 1 + 5.5 * u * u; c = scale_about((540, 960), M.ARCH_C, z)
        ax.append((2.2 + 0.7 * i / 7, c[0])); ay.append((2.2 + 0.7 * i / 7, c[1])); asc.append((2.2 + 0.7 * i / 7, z))
    r.art('door2-arch', arch_img, 6.1, 9.0, 10, kf((540, 960), 6.1, x=ax, y=ay, scale=asc))
    for j, (k, a_, rad, delay, w, rot) in enumerate(M.POPS):   # each candy springs out of the doorway, then drops away
        im = M.E.C.shadow(B.fit_w(M.CANDY[k], int(w)), (6, 10), 10, 70)
        def cf(ts, a_=a_, rad=rad, delay=delay, rot=rot):
            tt = ts - 6.5 - delay
            if tt < 0: return at(M.ARCH_C[0], M.ARCH_C[1], 0.0)
            u = M.back_out(tt / 0.35, 2.2); x = M.ARCH_C[0] + rad * math.cos(a_) * u; y = M.ARCH_C[1] + rad * math.sin(a_) * 1.35 * u
            x = min(max(x, 90), W - 90)
            if ts > 8.3:
                v = ts - 8.3 - delay * 0.4
                if v > 0: y += 2600 * v * v
            return at(x, y, max(0.05, min(1.0, M.back_out(tt / 0.25, 2.4))), -(rot + 5 * math.sin(ts * 5 + delay * 9)))
        r.art(f'candy{j}', im, 6.5 + delay, 9.0, 20 + j, cf)
    line('[something sweet is coming]', 62, 6.2, 8.3, (520, 330), 'something sweet is coming')

    # ===== S4 9.0 to 11.4 the TREAT: the pill behind the word, the carried candy corn beside it =====
    pill = pill_img(940, 280)
    r.art('pill-treat', pill.rotate(-3, expand=True, resample=Image.BICUBIC), 9.05, 11.4, nz(), kf((540, 480), 9.05, scale=popk(0, 1.12)))
    taffy(r, 'TREAT', 9.15, 540, 470, 200, 'drop', 0.06, 11.4, 'treat')
    r.art('burst-candy', art_doodle('burst', 3, 300, LAV), 9.5, 11.4, nz(), Ed.pop_in(905, 290, 9.5, 0, 0.2))   # behind the candy: a picture
    cc = M.E.C.shadow(B.fit_w(M.CANDY[1], 150), (5, 9), 9, 70)
    def corn(ts):
        u = M.ease((ts - 9.0) / 0.6); return at(980 + (900 - 980) * u, -100 + 390 * u, 1.0, 20 - 30 * u)
    r.art('candy-corn', cc, 9.0, 11.4, nz(), corn)
    line('[our 5-minute scrub]', 80, 9.6, 11.4, (540, 720), 'our 5-minute scrub')
    doodle('icon', 3, 300, (860, 1200), 10.2, 11.4, 8, dur=0.35)

    # ===== 11.4 to 11.8 ding dong (a white flash), S5 11.8 to 14.6 the doorbell view of clip 3 =====
    r.clip(2, 11.6, None, 3, Ed.still(540, 960))
    zf = nz()
    for i in range(12):
        u = i / 11; wimg = Image.new('RGBA', (W, H), (255, 255, 255, int(255 * (1 - abs(u - 0.5) * 2))))
        r.art(f'flash-{i:02d}', wimg, 11.4 + i / 30, 11.4 + (i + 1) / 30, zf, Ed.still(540, 960))
    line('ding dong!', 120, 11.4, 12.7, (540, 960))
    dark = Image.new('RGBA', (W, H), (0, 0, 0, 255)); dark.putalpha(ImageChops.invert(M.VIGNETTE).point(lambda v: int((255 - v) * 0.9)))
    r.art('doorbell-vignette', dark, 11.8, 14.6, nz(), Ed.still(540, 960))
    f40 = M.E.ImageFont.truetype(M.BOLD, 40)
    def small(words, left, y, a, b):
        x = left + f40.getlength(words) / 2
        r.text('montserrat', 40, (words, words), a, b, Ed.still(x, y), WHITE, stroke=((0, 0, 0), 0.05))
    small('Front door', 80, 282, 11.8, 14.6); small('LIVE', 890, 282, 11.8, 14.6); small('10/31  7:41 PM', 80, 1442, 11.8, 14.6)
    dot = Image.new('RGBA', (30, 30), (0, 0, 0, 0)); ImageDraw.Draw(dot).ellipse((1, 1, 28, 28), fill=(230, 50, 50, 255))
    r.art('live-dot', dot, 11.8, 14.6, nz(), lambda ts: at(864, 282, 1.0 if int(ts * 2) % 2 == 0 else 0.0))
    taffy(r, 'PROOF', 11.85, 540, 420, 170, 'pop', 0.05, 14.6, 'proof')
    pinned_note(12.2, 14.6, (680, 1180), 6, '[5-star\nreviews]', '5-star\nreviews')
    doodle('arrow', 0, 270, (260, 1180), 12.8, 14.6, -20)

    # ===== S6 14.8 to 17.5 CTA: COMMENT, the keyword on a pill, the offer underlined =====
    taffy(r, 'COMMENT', 14.8, 540, 470, 150, 'pop', 0.05, None, 'comment')
    r.text('montserrat', 140 * 0.85, ('[TREAT]', 'TREAT'), 15.05, None, kf((560, 712), 15.05, scale=popk(0, 1.1)), WHITE,
           stroke=(INK, 0.06), box=(PLUM, 1.0))
    line('for something sweet: 15% off', 64, 15.2, None, (520, 900))
    doodle('under', 2, 620, (520, 1000), 15.5, None, dur=0.35)
    return r

def layers():
    return reel().L
