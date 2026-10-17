"""02 Pack an order with me, v3 (2026-10-17): Lisa's language, layered.
Neutral dotted paper, one accent colour on key words (buyers change that text colour to their brand), words placed
around the subject, framed clips stacked at different depths, stickers and words in front. Transitions are layers
leaving: torn paper halves closing, a whole scene sliding away to reveal the next, a zoom through a star window,
a diagonal panel slicing in, Polaroids dealt onto paper. Scenes later in time sit lower in the stack so they can be
revealed from underneath."""
from engine import Layers, pop, wiggle, rot_pt, polaroid_frame, W, H, INK, CREAM
import collage as C

ROSE = (212, 98, 127)          # stand-in accent: the buyer's brand colour
WHITE = (255, 255, 255)
SPEC = dict(num='02', title='Pack an order with me', subtitle='14.4 seconds. Four clips, filmed from above or close.',
            font='bodoni', dir='02-pack-an-order', folder='Template 02 - Pack an order with me',
            project='Scrolly 02 Pack an order with me', cover_at=1.2,
            slots=[('The empty box or mailer, from above', 'Clear the table first'),
                   ('Your product, held up or going in', 'Your bestseller'),
                   ('The extras: tissue, a note, a sticker', 'Whatever you really add'),
                   ('Sealing it up', 'Keep the shipping label out of frame')],
            test_clips=[('IMG_1462', 0.3), ('IMG_1439', 0.3), ('IMG_1460', 0.3), ('IMG_1447', 0.3)])

def card(g, key, slot, src, t, z, c, tilt, size=(420, 520), border=20, bottom=90, motion=None, speed=1.0):
    """A framed clip (Polaroid-style print): the clip is cropped to the window and moves with its frame."""
    pw, ph = size; win = (pw - 2 * border, ph - border - bottom)
    wc = rot_pt((c[0], c[1] - ph / 2 + border + win[1] / 2), c, tilt)
    g.clip(slot, t, z, wc, (win[0] + 4, win[1] + 4), tilt, motion(wc) if motion else {}, src=src, speed=speed)
    g.art(f'print-{key}', polaroid_frame(size, border, bottom, seed=sum(map(ord, key)) % 89, tape=True), t, z + 1, c, tilt,
          motion(c) if motion else {})

def slide(start, end, t0=0.0, dur=0.45):
    return {'x': [(t0, start[0]), (t0 + dur * 0.75, end[0] + (end[0] - start[0]) * 0.03), (t0 + dur, end[0])],
            'y': [(t0, start[1]), (t0 + dur * 0.75, end[1] + (end[1] - start[1]) * 0.03), (t0 + dur, end[1])]}

def leave(kf, pos, t0, dx=0, dy=-2400, dur=0.3):
    """Add an exit (flying off-screen) to a layer's keyframes."""
    kf = {k: list(v) for k, v in kf.items()}
    for axis, d_, i in (('x', dx, 0), ('y', dy, 1)):
        if not d_: continue
        base = kf[axis][-1][1] if kf.get(axis) else pos[i]
        if not kf.get(axis): kf[axis] = [(0, base)]
        kf[axis] += [(t0, base), (t0 + dur, base + d_)]
    return kf

def layers():
    g = Layers()
    # ===== S1 hook 0 to 2.4 (top of the stack: base 60) =====================================================
    t = 0.0
    for slot, src in [(1, 0.0), (0, 0.0), (1, 1.0), (2, 0.0)]:
        g.clip(slot, (t, t + 0.6), 60, (540, 960), (W, H), src=src, speed=1.15); t += 0.6
    T = (0, 2.4)
    card(g, 'h1', 0, 0.5, T, 61, (215, 1430), -8, (380, 470), motion=lambda p: slide((p[0] - 700, p[1] + 200), p, 0.3))
    card(g, 'h2', 2, 0.5, T, 63, (860, 1520), 7, (380, 470), motion=lambda p: slide((p[0] + 700, p[1] + 300), p, 0.5))
    g.text('arial', 16, ('packing', 'packing'), T, 70, (250, 300), kf={'scale': pop(0.1, 1.15)}, color=WHITE, shadow=True)
    g.text('bodoni', 30, ('an order', 'an order'), T, 71, (620, 450), kf=slide((1500, 450), (620, 450), 0.3), color=ROSE, shadow=True)
    g.text('arial', 16, ('with me', 'with me'), T, 72, (820, 620), kf={'scale': pop(0.65, 1.15)}, color=WHITE, shadow=True)
    for k, (x, y, s, t0) in enumerate([(120, 470, 90, 0.8), (960, 330, 70, 1.0), (520, 1180, 60, 1.2)]):
        g.art(f'tw{k}', C.sparkle_fill(s, WHITE), T, 65 + k, (x, y),
              {'scale': [(0, 0), (t0, 0), (t0 + 0.15, 1.3), (t0 + 0.3, 0.8), (t0 + 0.5, 1.15), (t0 + 0.7, 0.9), (2.4, 1.0)],
               'rot': [(t0, 0), (2.4, 90)]})
    # torn halves slam together over the end of the hook
    left = C.torn_strip((560, 1920), CREAM, seed=31, edges='r'); right = C.torn_strip((560, 1920), CREAM, seed=32, edges='l')
    g.art('half-l', left, (2.1, 2.45), 90, (280, 960), 0, {'x': [(0, -400), (0.25, 290), (0.32, 280)]})
    g.art('half-r', right, (2.1, 2.45), 91, (800, 960), 0, {'x': [(0, 1480), (0.25, 790), (0.32, 800)]})

    # ===== S2 the goods 2.4 to 5.0 (base 40): blob window, a print peeking, aside + arrow; leaves upward ==========
    T = (2.4, 5.0); out = 2.3
    blob = C.blob_points((560, 1020), 330, 400, seed=7)
    g.clip(1, T, 40, (560, 1020), (760, 900), 0, leave({'scale': [(0, 1.0), (2.3, 1.08)]}, (560, 1020), out), src=0.4)
    g.art('blob-card', C.window_card((W, H), blob, seed=33), T, 41, (540, 960), 0, leave({}, (540, 960), out))
    g.art('blob-frame', C.window_frame((W, H), blob), T, 42, (540, 960), 0,
          leave({'scale': [(0, 1.15), (0.15, 0.97), (0.25, 1.0)]}, (540, 960), out))
    card(g, 'g1', 0, 1.5, T, 43, (180, 1650), -10, (300, 370), border=16, bottom=70,
         motion=lambda p: leave(slide((p[0] - 500, p[1] + 300), p, 0.4), p, out))
    g.text('arial', 14, ('the goods', 'the goods'), T, 50, (300, 310), kf=leave({'scale': pop(0.2, 1.15)}, (300, 310), out))
    g.text('bodoni', 24, ('go in first', 'go in first'), T, 51, (560, 450), typewriter=0.45,
           kf=leave({}, (560, 450), out), color=ROSE)
    g.art('arrow-g', C.arrow(200, INK, 6, 50, seed=34).rotate(200, expand=True), T, 45, (860, 1530),
          leave({'scale': pop(0.8)}, (860, 1530), out))
    g.text('ink', 14, ('[my bestseller]', 'my bestseller'), T, 52, (820, 1700), -4,
           leave({'scale': pop(0.95, 1.15)}, (820, 1700), out))
    g.art('tape-blob', C.tape(260, 80, seed=35), T, 46, (360, 640), -30, leave({'scale': pop(0.3)}, (360, 640), out))

    # ===== S3 a little extra 4.7 to 7.6 (base 20): star window, stars take over, zoom through ====================
    T = (4.7, 7.6); zoom = 2.55
    star = C.star_points((540, 960), 470, 215)
    g.clip(2, T, 20, (540, 960), (W, H), src=0.2)
    zk = {'scale': [(0, 1.0), (zoom, 1.0), (zoom + 0.35, 3.2)]}
    g.art('star-card', C.window_card((W, H), star, seed=36), T, 21, (540, 960), 0, dict(zk))
    g.art('star-frame', C.window_frame((W, H), star, border=18), T, 22, (540, 960), 0, dict(zk))
    spots = [(150, 300, ROSE, 210), (930, 260, CREAM, 170), (110, 1500, WHITE, 190), (960, 1620, ROSE, 230),
             (300, 1820, CREAM, 160), (820, 120, WHITE, 140), (80, 900, ROSE, 150), (1000, 1050, WHITE, 160),
             (560, 140, ROSE, 120), (560, 1840, WHITE, 130), (250, 620, CREAM, 120), (860, 1330, CREAM, 140)]
    for k, (x, y, col, s) in enumerate(spots):
        t0 = 0.35 + 0.1 * k
        g.art(f'st{k}', C.star_fill(s, col, outline=INK if col != ROSE else None, ow=3), T, 23 + k, (x, y), (k * 17) % 40 - 20,
              {'scale': [(0, 0.0), (t0, 0.0), (t0 + 0.15, 1.25), (t0 + 0.25, 0.95), (t0 + 0.32, 1.0), (zoom, 1.0), (zoom + 0.3, 0.0)]})
    g.text('arial', 14, ('a little', 'a little'), T, 30, (270, 230), kf={'scale': pop(0.2, 1.15) + [(zoom, 1.0), (zoom + 0.2, 0.0)]})
    g.text('bodoni', 34, ('extra', 'extra'), T, 31, (640, 360), color=ROSE,
           kf={'scale': [(0, 0), (0.4, 0), (0.55, 1.3), (0.65, 0.95), (0.72, 1.0), (zoom, 1.0), (zoom + 0.2, 0.0)]})
    for k, (x, y, t0) in enumerate([(380, 1180, 1.6), (720, 760, 1.85), (620, 1330, 2.1)]):
        g.art(f'sp3-{k}', C.sparkle_fill(110, WHITE), T, 36 + k, (x, y),
              {'scale': [(0, 0), (t0, 0), (t0 + 0.15, 1.3), (t0 + 0.3, 0.9), (zoom, 1.0), (zoom + 0.2, 0)], 'rot': [(t0, 0), (zoom, 60)]})

    # ===== S4 the extras 7.6 to 10.2 (base 0): pinned note over fast cuts, prints stacked in the corner ============
    t = 7.6
    for slot, src in [(2, 1.2), (2, 2.2), (0, 1.0), (2, 3.0)]:
        g.clip(slot, (t, t + 0.65), 0, (540, 960), (W, H), src=src, speed=1.15); t += 0.65
    T = (7.6, 10.2)
    nk = {'y': [(0, -400), (0.3, 1010), (0.4, 990), (0.48, 1000)], 'rot': [(0, -20)] + wiggle(0.5, 2.6, 3, base=-4)}
    g.art('note', C.sticky_note(500, 'yellow', seed=37), T, 5, (540, 1000), -4, nk)
    g.text('ink', 17, ('[tissue +\na thank-you note]', 'tissue +\na thank-you note'), T, 60, (540, 1010), -4,
           {'y': [(0, -390), (0.3, 1020), (0.4, 1000), (0.48, 1010)], 'rot': [(0, -20)] + wiggle(0.5, 2.6, 3, base=-4)})
    for k in range(3):
        g.text('arial', 10, (f'{k + 1}/3', f'{k + 1}/3'), (7.6 + 0.65 * (k + 1), 7.6 + 0.65 * (k + 2)), 61, (540, 1360),
               color=WHITE, shadow=True)
    g.text('arial', 12, ('the', 'the'), T, 62, (300, 300), kf={'scale': pop(0.1)}, color=WHITE, shadow=True)
    g.text('bodoni', 26, ('extras', 'extras'), T, 63, (560, 420), kf={'scale': pop(0.25, 1.2)}, color=ROSE, shadow=True)
    card(g, 'e1', 1, 2.0, T, 1, (880, 1650), 9, (300, 370), border=16, bottom=70,
         motion=lambda p: slide((p[0] + 500, p[1] + 200), p, 0.6))
    card(g, 'e2', 0, 2.0, T, 3, (790, 1720), -5, (300, 370), border=16, bottom=70,
         motion=lambda p: slide((p[0] + 500, p[1] + 300), p, 0.8))

    # ===== S5 sealed 10.2 to 11.6 (base 80): a tilted panel of video slices in diagonally ===========================
    T = (10.2, 11.6)
    g.clip(1, (10.2, 12.0), 80, (540, 960), (W, H), src=2.5, speed=1.15)   # runs on under the paper wipe
    g.clip(3, (10.2, 12.0), 81, (560, 1520), (1500, 1100), -18, slide((1900, 2500), (560, 1520), 0.0, 0.4), src=0.0, speed=1.15)
    g.art('seam', C.tape(1800, 26, seed=38, color=WHITE, alpha=255), T, 82, (560, 980), -18,
          slide((1900, 1960), (560, 980), 0.0, 0.4))
    g.art('band-sealed', C.torn_strip((640, 300), WHITE, seed=39), T, 83, (380, 1520), -6, slide((-700, 1520), (380, 1520), 0.45))
    g.text('bodoni', 26, ('sealed', 'sealed'), T, 64, (330, 1480), -6, slide((-750, 1480), (330, 1480), 0.45), color=ROSE)
    g.text('arial', 13, ('+ ready', '+ ready'), T, 65, (520, 1590), -6, slide((-560, 1590), (520, 1590), 0.45))

    # ===== S6 CTA 11.6 to 14.4 (base 100): paper wipes in, three Polaroids dealt, name types on =====================
    T = (11.6, 14.4)
    g.art('cta-paper', C.dot_paper((W, H), seed=40), T, 100, (540, 960), 0, {'x': [(0, 1700), (0.3, 520), (0.38, 540)]})
    deal = [((520, 760), -9, 0.35), ((580, 740), 6, 0.6), ((540, 730), -2, 0.85)]
    for k, (c, tilt, t0) in enumerate(deal):
        card(g, f'd{k}', [1, 2, 1][k], [0.6, 1.4, 2.6][k], T, 101 + 2 * k, c, tilt, (560, 680), border=24, bottom=110,
             motion=lambda p, t0=t0: slide((p[0] + 300, p[1] + 1500), p, t0, 0.35))
    g.text('bodoni', 24, ('[Product name]', 'Spray cleaner'), (12.7, 14.4), 70, (540, 1300), typewriter=0.5, color=ROSE)
    g.text('arial', 11, ('shop at [where to buy]', 'shop at the link in my bio'), T, 71, (540, 1430), kf={'scale': pop(1.6)})
    y = 1600
    g.art('arrow-cta', C.arrow(170, INK, 6, 40, seed=41).rotate(-70, expand=True), T, 110, (540, y),
          {'scale': pop(1.8), 'y': [(2.0, y), (2.2, y + 30), (2.4, y), (2.6, y + 30), (2.8, y)]})
    for k, (x, yy, t0) in enumerate([(170, 330, 1.2), (960, 1120, 1.5)]):
        g.art(f'sp6-{k}', C.sparkle_fill(100, ROSE), T, 111 + k, (x, yy), {'scale': pop(t0, 1.3), 'rot': [(t0, 0), (2.8, 90)]})
    return g
