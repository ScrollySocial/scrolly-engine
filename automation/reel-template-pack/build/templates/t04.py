"""04 A or B?, approved 2026-10-19 (motion test build/motion_04.py, after her note on the arrows). FULLY EDITABLE build
(2026-10-20, build/editable.py): every word is CapCut text (DM Serif Display built-in words, last word Italic; the
names, notes, A and B lines, poll words, keyword and shop line in Montserrat, the [brackets] on CapCut's text
background); the arrows and the burst are Scrolly Doodles letters (recolour like text); the marble stage is CapCut's
background colour under a colourless marble grain; the brass scale, sticky notes, photo cards, round-window rims and
the phone are real photos moving on keyframes; the clips are real clip layers (placeholder cards until the buyer's
clips go in): version A and B as cards, on the scale, full frame, on the phone and in strips, and the pick at the end.
CapCut limits: the torn band of wavy lines along the bottom is a picture (recolour with Adjust > HSL); the strip-slice
transitions are tinted strips closing over the old scene and sliding apart (pictures, recolour with Adjust > HSL),
not slices of the scene itself; the diagonal wipes are diagonal slides; the scale swaps between its level and tipped
photos; the poll's bars filling are a short flipbook of the bars alone (CapCut can't stretch a picture one way), and
the poll's numbers appear at the end instead of counting up."""
import math
from PIL import Image, ImageDraw, ImageOps
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import editable_a as EA
import motion_04 as M
import motion_capcut as MC
import play as P
import play_extra as X
import collage as C
import storyboard_b2 as S
from motion_b2 import ease, back_out, seg, lerp, torn_band

SPEC = dict(num='04', title='A or B?', subtitle='20 seconds. Three clips: version A, version B, you picking one.',
            font='montserrat', dir='04-a-or-b', folder='Template 04 - A or B', project='04 A or B', cover_at=1.2,
            slots=[('Version A', 'Version A of your product, upright, close'),
                   ('Version B', 'Version B, filmed the same way'),
                   ('You picking one', 'Your hand picking one up')],
            test_clips=[('IMG_1422', 7.0), ('IMG_1418', 2.0), ('IMG_1401', 0.5)])
W, H = 1080, 1920
WINE, BABY, WHITE, INK, CRM = X.WINE, X.BABY, (255, 255, 255), M.INK, M.CRM
STAGE = (242, 240, 237)                  # the marble's white

def word(x, y, t0, r=0.0):
    """P.say on a caption line: the words rise in with a small bounce."""
    return pop_in(x, y, t0, r, 0.22, 1.8, 18)

def diag_out(t0, t1):
    return slide(t0, t1, -W - 300, -420)  # story4.diagonal: the next scene wipes in from the right (here, the old one slides off)

def note(lines, w, pin):
    """A pinned sticky note without words, and where its words sit (offset from its centre, unturned)."""
    full, blank = P.sticky(lines, w, pin=pin), P.sticky('', w, pin=pin)
    return blank, MC.text_anchor(full, blank)

def pans_of(g, which, c, k=1.0):
    s = g[which]; pans = M.PAN['level'] if which == 'scale' else M.PAN['tilt'] if which == 'tiltA' else tuple((1 - x, y) for x, y in reversed(M.PAN['tilt']))
    return [(c[0] + (px - 0.5) * s.width * k, c[1] + (py - 0.5) * s.height * k - 40 * k) for px, py in pans]

def poll_parts(w, pa):
    """X.poll as pieces: the blank card (white, grey tracks), the fill bars at u (0..1), and where the words sit."""
    h = int(w * 0.42) + int(w * 0.16); y0 = int(w * 0.16); bx0, bx1 = 40, w - 40; rh = (h - y0 - 60) / 2
    card = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(card); d.rounded_rectangle((0, 0, w - 1, h - 1), 40, fill=(255, 255, 255, 250))
    rows = [y0 + 30 + k * rh for k in range(2)]
    for ry in rows: d.rounded_rectangle((bx0, ry + 8, bx1, ry + rh - 8), int(rh / 2), fill=(238, 236, 232))
    def bars(u):
        im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); dd = ImageDraw.Draw(im)
        for k, (ry, p) in enumerate(zip(rows, (pa, 1 - pa))):
            fw = (bx1 - bx0) * p * u
            if fw > rh: dd.rounded_rectangle((bx0, ry + 8, bx0 + fw, ry + rh - 8), int(rh / 2), fill=(206, 214, 238) if k == 0 else (240, 210, 200))
        return im
    spots = {'q': (0, y0 * 0.62 - h / 2), 'A': (bx0 + 36 - w / 2, rows[0] + rh / 2 - h / 2), 'B': (bx0 + 36 - w / 2, rows[1] + rh / 2 - h / 2),
             'pA': (bx1 - 36 - w / 2, rows[0] + rh / 2 - h / 2), 'pB': (bx1 - 36 - w / 2, rows[1] + rh / 2 - h / 2)}
    return card, bars, spots, rh

def reel():
    g = M.setup(); r = Ed.Reel(M.HOLDS, 14.0)
    r.art('marble-grain', Ed.grain(S.raw('images', 'Soft veined white marble texture-1.png'), 0.3), 0, None, 1, still(540, 960))
    wav = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', 'Hand-drawn wavy line pattern-20.png')), WINE, BABY).convert('RGBA')
    band = torn_band(wav, (W + 40, 380), 7, 't', 20); band_c = (540, H - 360 + 190)   # motion_04 pastes it at (-20, H - 360)

    # 1 (0-1.8) A and B as photo cards sliding in on the stage; "which one / are you?"; the names; diagonal out at 1.5
    o1 = diag_out(1.5, 1.8)
    cardim, csize, coff = EA.card_frame(430, 700, 16, 30)
    for i, (x0, x1, y, rr, t0) in enumerate(((-500, 300, 980, 5, 0.0), (W + 500, 780, 1040, -5, 0.15))):
        def cf(ts, x0=x0, x1=x1, y=y, rr=rr, t0=t0, i=i):
            return at(lerp(x0, x1, back_out(seg(ts, t0, t0 + 0.4), 1.3)), y + 10 * math.sin(ts * 3 + i), 1, rr)
        cf = then(cf, o1)
        r.clip(i, 0, 1.8, 10 + 2 * i, Ed.child(cf, coff), size=csize)
        r.art(f'card-{"AB"[i]}', cardim, 0, 1.8, 11 + 2 * i, cf)
        r.boxed(('[Copper]', '[Mint]')[i], 60, 0.45 + 0.15 * i, 1.8, then(pop_in((300, 780)[i], (1400, 1460)[i], 0.45 + 0.15 * i, (3, -3)[i]), o1),
                (BABY, WHITE)[i], ('Copper', 'Mint')[i])
    r.serif('which one', 138, 0.1, 1.8, then(word(540, 330, 0.1, 2), o1), WINE, WHITE)
    r.serif('are you?', 138, 0.4, 1.8, then(word(540, 490, 0.4, 2), o1), WINE, WHITE)

    # 2 (1.8-3.4) STAGE, no video: the scale drops onto the marble; the two notes drop onto its pans; "two versions"
    def sc2(ts): return at(540, lerp(-600, 1150, back_out(seg(ts, 1.8, 2.1), 1.5)))
    r.art('scale-level', g['scale'], 1.8, 3.25, 20, sc2)
    pans = pans_of(g, 'scale', (540, 1150))
    for i, (lines, test, pin, t0) in enumerate((('[copper +\ncordless]', 'copper +\ncordless', 'pin-head-black', 2.2),
                                                 ('[mint +\nsteam]', 'mint +\nsteam', 'pin-head-cream', 2.45))):
        blank, off = note(lines, 280, pin)
        def nf(ts, i=i, t0=t0):
            d = back_out(seg(ts, t0, t0 + 0.3), 1.6); return at(pans[i][0] + (110, -110)[i], lerp(-300, pans[i][1] - 110, d), 1, (8, -8)[i])   # inward: words clear of IG's buttons
        r.art(f'note-{"AB"[i]}2', blank, t0, 3.25, 22 + i, nf)
        r.plain(lines, 44, t0, 3.25, Ed.child(nf, off), INK, test=test)
    r.serif('two versions', 120, 1.95, 3.25, word(540, 420, 1.95, 2), WINE, WHITE)
    EA.strips(r, 'slice-1', 3.1, 3.4, (WINE, INK), 60)

    # 3 (3.25-5.2) A full frame; its name, an arrow up to it, a note "[so light]"; diagonal out at 4.9
    o3 = diag_out(4.9, 5.2)
    r.clip(0, 3.25, 5.2, 30, then(still(540, 960), o3))
    r.doodle('arrow', 0, 190, 3.9, 5.2, then(pop_in(580, 1215, 3.9, -90), o3), WHITE)
    r.boxed('A: [Copper. Cordless.]', 58, 3.6, 5.2, then(pop_in(580, 1380, 3.6, 2), o3), WINE, 'A: Copper. Cordless.')
    blank, off = note('[so light]', 330, 'pin-head-black')
    nA = then(pop_in(820, 640, 4.2, -6), o3)
    r.art('note-A', blank, 4.2, 5.2, 32, nA)
    r.plain('[so light]', 54, 4.2, 5.2, Ed.child(nA, off), INK, test='so light')

    # 4 (5.2-7.0) STAGE: A in a round window lands on the left pan (the scale tips to A), then B on the right (tips to B);
    #   an arrow down to each as it lands; the camera dives into B's window
    def state(ts): return 'scale' if ts < 5.55 else 'tiltA' if ts < 6.15 else 'tiltB'
    def bounce(ts):
        return 10 * math.sin((ts - 5.55) * 30) * (1 - seg(ts, 5.55, 5.8)) if ts < 6.15 else 10 * math.sin((ts - 6.15) * 30) * (1 - seg(ts, 6.15, 6.4))
    p_end = pans_of(g, 'tiltB', (540, 1150)); focus = (p_end[1][0], p_end[1][1] - 200); cam = EA.zoom_into(6.5, 7.0, focus, 5.5)
    for which, a, b in (('scale', 5.2, 5.55), ('tiltA', 5.55, 6.15), ('tiltB', 6.15, 7.0)):
        r.art(f'scale-{which}', g[which], a, b, 20, then(lambda ts: at(540, 1150 + bounce(ts)), cam))
    rim = EA.ring(330)
    for i, t0 in enumerate((5.25, 5.85)):
        def wf(ts, i=i, t0=t0):
            pn = pans_of(g, state(ts), (540, 1150 + bounce(ts)))[i]; d = back_out(seg(ts, t0, t0 + 0.3), 1.5)
            return at(pn[0], lerp(-300, pn[1] - 200, d))
        wf = then(wf, cam)
        r.clip(i, t0, 7.0, 24 + 2 * i, wf, size=(330, 330), mask='circle')
        r.art(f'rim-{"AB"[i]}', rim, t0, 7.0, 25 + 2 * i, wf)
        r.boxed(('[Copper]', '[Mint]')[i], 48, t0, 7.0, Ed.child(wf, ((0, -40)[i], 200), (4, -4)[i]), (BABY, WHITE)[i], ('Copper', 'Mint')[i])
    for t0, (x, y) in ((5.55, (210, 640)), (6.15, (870, 560))):
        r.doodle('arrow', 0, 170, t0, 7.0, then(pop_in(x, y, t0, 90, 0.35), cam), INK)

    # 5 (7.0-8.6) B full frame; ONE burst behind its name; strips (vertical) to the phone at 8.3
    r.clip(1, 7.0, 8.45, 30, still(540, 960), src=2.0)
    r.doodle('burst', 2, 700, 7.25, 8.45, pop_in(560, 1330, 7.25, 0, 0.35), (246, 241, 232))
    r.boxed('B: [Mint. Steam-clean.]', 58, 7.3, 8.45, pop_in(560, 1330, 7.3, -2), WINE, 'B: Mint. Steam-clean.')
    EA.strips(r, 'slice-2', 8.3, 8.6, (INK, WINE), 60, n=6, vertical=True)

    # 6 (8.45-10.05) STAGE, tech: the phone stands up on the stage, B on its screen, a story poll whose bars fill 48 / 52;
    #   "even my followers / can't pick"; strips to the split at 9.9
    im, _, _ = P.device(M.PHONE, 600); phone, ssize, soff = Ed.device_hole(P.die_cut(im, 8))
    def ph(ts): return at(540, lerp(2300, 1080, ease(seg(ts, 8.6, 8.95))), 1, 4)
    scr = Ed.child(ph, soff)
    r.clip(1, 8.45, 10.05, 34, scr, size=ssize)
    r.art('phone', phone, 8.45, 10.05, 35, ph)
    pw = int(ssize[0] * 0.92); card, bars, spots, rh = poll_parts(pw, 0.48)
    poll_off = (soff[0], soff[1] - ssize[1] / 2 + ssize[1] * 0.48 + card.height / 2)
    pf = Ed.child(ph, poll_off)
    r.art('poll', C.shadow(card, (4, 12), 16, 110), 8.45, 10.05, 36, pf)
    t_fill = [9.1 + k / 30 for k in range(19)]     # script time; the bars fill over 0.6 s
    for k, ts in enumerate(t_fill):
        r.art(f'poll-bars-{k:02d}', bars(ease(seg(ts, 9.1, 9.7))), ts if k else 8.45, t_fill[k + 1] if k < 18 else 10.05, 37, pf)
    fpx = rh * 0.42
    r.plain('which one?', pw * 0.06 / 0.85, 8.45, 10.05, Ed.child(ph, (poll_off[0] + spots['q'][0], poll_off[1] + spots['q'][1])), INK)
    for key, lab in (('A', 'A'), ('B', 'B')):
        r.plain(lab, fpx / 0.85, 8.45, 10.05, Ed.child(ph, (poll_off[0] + spots[key][0] + 10, poll_off[1] + spots[key][1])), INK)
    for key, lab in (('pA', '48%'), ('pB', '52%')):
        r.plain(lab, fpx / 0.85, 9.7, 10.05, then(Ed.child(ph, (poll_off[0] + spots[key][0] - 40, poll_off[1] + spots[key][1])),
                                                 lambda ts, v: dict(v, s=back_out(seg(ts, 9.7, 9.95), 2.2))), INK)
    r.boxed('even my followers', 54, 8.8, 10.05, pop_in(500, 300, 8.8, 2), WINE)
    r.serif("can't pick", 129, 9.0, 10.05, word(500, 440, 9.0, 3), WINE, WHITE)
    EA.strips(r, 'slice-3', 9.9, 10.2, (WINE, INK), 60)

    # 7 (10.05-11.8) A and B in alternating strips sorting themselves into a half-and-half split; "or both?"
    n, sw, gap = 6, W / 6, 14
    r.art('split-lines', EA.solid((W, H), INK), 10.05, 11.8, 40, still(540, 960))
    for i in range(n):
        k = i // 2; dest = k if i % 2 == 0 else n // 2 + k
        def sf(ts, i=i, dest=dest): return at(lerp(i * sw, dest * sw, ease(seg(ts, 10.3, 11.0))) + sw / 2, 960)
        a, b = r.R(10.05), r.R(11.8); kf, pos, rot = r._kf(sf, a, b)
        r.L.clip(i % 2, (a, b), 41 + i, pos, (2 * int((sw - gap) // 2), H), rot, kf, src=(0.0 if i % 2 == 0 else 2.0),
                 crop=((dest * sw + gap / 2) / W, 0, ((dest + 1) * sw - gap / 2) / W, 1))
    for i, (x, rr) in enumerate(((270, 4), (810, -4))):
        r.boxed(('[Copper]', '[Mint]')[i], 60, 11.0, 11.8, lambda ts, x=x, rr=rr: at(x, 360, ease(seg(ts, 11.0, 11.2)), rr), (BABY, WHITE)[i], ('Copper', 'Mint')[i])
    r.serif('or both?', 156, 11.05, 11.8, word(540, 1000, 11.05, 3), WHITE, WINE)

    # 8 (11.8-end) CTA: the hand picks one; Comment / "A" or "B" / [both in my shop]
    r.clip(2, 11.8, None, 50, still(540, 960))
    r.serif('Comment', 166, 12.1, None, word(520, 1140, 12.1, 3), WHITE, WINE)
    r.boxed('"A" or "B"', 64, 12.4, None, pop_in(520, 1290, 12.4, -2), WHITE)
    r.boxed('[both in my shop]', 50, 12.6, None, pop_in(520, 1400, 12.6, 2), WINE, 'both in my shop')

    r.art('wavy-band', band, 0, None, 2, still(*band_c))   # part of the stage: full-frame scenes cover it
    return r

def layers():
    return reel().L
