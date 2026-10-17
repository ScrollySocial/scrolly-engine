"""02 Pack an order with me (even: MADE Awelier), v2 "spectacular" sample (Mercedes, 2026-10-17).
Opens straight on fast packing footage with a polka-dot PACK popping on; quick cuts each get their own surprise
(3D stickers, a thank-you note sliding out of an envelope); polka dots take over the screen into a graphics-only
packing checklist; a shipping label prints out and slaps onto the box; a flood of 3D packages carries into the CTA."""
from engine import Layers, pop, thump, fly, wiggle, rot_pt, polaroid_frame, font_file, W, H, INK, BUTTER, CREAM
import collage as C

RED = (217, 74, 61)
SPEC = dict(num='02', title='Pack an order with me', subtitle='13.8 seconds. Four clips, filmed from above or close.',
            font='awelier', dir='02-pack-an-order', folder='Template 02 - Pack an order with me',
            project='Scrolly 02 Pack an order with me', cover_at=1.2,
            slots=[('The empty box or mailer, from above', 'Clear the table first'),
                   ('Your product going in', 'Hands only is perfect'),
                   ('The extras: tissue, a note, a sticker', 'Whatever you really add'),
                   ('Sealing it up', 'Keep the shipping label out of frame')],
            test_clips=[('IMG_1462', 0.3), ('IMG_1439', 0.3), ('IMG_1460', 0.3), ('IMG_1447', 0.3)])

BAGEL = font_file('7480840886788558135')   # Bagel Fat One (CapCut library), only drawn into the artwork

def band(g, key, t, z, pos, words, rot=-3, color=BUTTER, w=560, kf_t=0.0):
    """A torn paper band with a handwritten label on it, popping in together."""
    g.art(f'band-{key}', C.torn_strip((w, 150), color, seed=hash(key) % 97), t, z, pos, rot, {'scale': pop(kf_t, 1.12)})
    g.text('ink', 15, words, t, 40 + z, pos, rot, {'scale': pop(kf_t + 0.03, 1.12)})

def layers():
    g = Layers()
    # ---- hook 0 to 2.2: fast footage + PACK an order with me ----------------------------------------------------
    t, d = 0.0, 0.55
    for slot, src in [(1, 0.0), (2, 0.0), (0, 0.0), (1, 1.2)]:
        g.clip(slot, (t, t + d), 1, (540, 960), (W, H), src=src, speed=1.15); t += d
    T = (0, 2.2)
    g.art('word-pack', C.pattern_word('PACK', BAGEL, 330), T, 10, (540, 470), -4,
          {'scale': [(0, 0.0), (0.12, 1.25), (0.22, 0.92), (0.3, 1.0)], 'rot': wiggle(0.6, 2.2, 3, base=-4)})
    band(g, 'order', T, 14, (470, 700), ('an order', 'an order'), rot=-2, color=CREAM, w=480, kf_t=0.4)
    g.art('band-withme', C.torn_strip((680, 200), BUTTER, seed=41), T, 13, (600, 880), 3, {'scale': pop(0.7, 1.12)})
    g.text('awelier', 28, ('with me', 'with me'), T, 55, (600, 880), 3, {'scale': pop(0.73, 1.12)})
    g.art('pkg-hook', C.sticker('package', 360), T, 11, (800, 1430),
          {'y': [(1.0, 2300), (1.3, 1400), (1.42, 1450), (1.5, 1430)], 'rot': [(1.0, 25)] + wiggle(1.5, 2.2, 6)})
    g.art('spark-hook', C.sticker('sparkles', 200), T, 12, (230, 1250), {'scale': pop(1.3, 1.3), 'rot': wiggle(1.6, 2.2, 10)})

    # ---- quick cuts 2.2 to 5.8, each with its own surprise -------------------------------------------------------
    t = 2.2
    cuts = [(1, 2.0), (1, 2.8), (2, 0.0), (2, 1.0), (2, 2.0), (1, 3.4)]
    for k, (slot, src) in enumerate(cuts):
        T = (t, t + 0.6)
        g.clip(slot, T, 1, (540, 960), (W, H), src=src, speed=1.15)
        if k == 0: band(g, 'goods', T, 10, (540, 320), ('[the goods]', 'the goods'))
        if k == 1: g.art('heart', C.sticker('red_heart', 260), T, 11, (820, 1350), {'scale': pop(0.0, 1.3), 'rot': [(0, -20), (0.3, 8)]})
        if k == 2: band(g, 'extra', T, 10, (540, 320), ('[a little extra]', 'a little extra'), rot=2, w=640)
        if k == 3: g.art('ribbon', C.sticker('ribbon', 300), T, 11, (300, 1400), {'scale': pop(0.0, 1.3), 'rot': [(0, 25), (0.3, -6)]})
        if k == 4:   # the envelope gag: a thank-you note slides up out of the envelope
            g.art('note', C.note_card((440, 320)), T, 11, (560, 1350), -4, {'y': [(0.0, 1560), (0.35, 1290), (0.6, 1300)]})
            g.text('ink', 14, ('[thank you!]', 'thank you!'), T, 42, (560, 1290), -4, {'y': [(0.0, 1550), (0.35, 1280), (0.6, 1290)]})
            g.art('envelope', C.sticker('envelope', 470, shadow_alpha=40), T, 12, (560, 1560), 0, {'scale': pop(0.0, 1.08)})
        if k == 5: g.art('spark-cut', C.sticker('sparkles', 240), T, 11, (840, 420), {'scale': pop(0.0, 1.3)})
        t += 0.6
    # ---- polka dots take over the screen (5.8 to 6.4) --------------------------------------------------------------
    g.clip(1, (5.8, 6.4), 1, (540, 960), (W, H), src=4.0, speed=1.15)   # footage keeps running under the dots
    for k in range(3):
        g.art(f'dots{k}', C.dots_layer(seed=10 + k, rmin=150, rmax=260), (5.6 + 0.08 * k, 6.4), 20 + k, (540, 960), 0,
              {'scale': [(0, 0.0), (0.18, 1.08), (0.26, 1.0)]})
    sheet = C.paper((W, H), BUTTER, seed=99); sheet.alpha_composite(C.dots_layer(seed=13, rmin=90, rmax=150, colors=(RED, CREAM)))
    g.art('dots-sheet', sheet, (6.0, 6.4), 23, (540, 960), 0, {'scale': [(0, 0.0), (0.2, 1.06), (0.28, 1.0)]})
    # ---- graphics-only packing checklist 6.4 to 8.4 ------------------------------------------------------------------
    T = (6.4, 8.4)
    g.art('paper', C.lined_paper((W, H)), T, 0, (540, 960))
    g.text('ink', 24, ('packing list', 'packing list'), T, 40, (560, 400), -2, {'scale': pop(0.05)})
    g.art('pin', C.sticker('pushpin', 170), T, 2, (900, 280), kf={'scale': pop(0.1, 1.3)})
    g.art('tape-list', C.tape(300, 80, seed=96), T, 3, (170, 170), -35)
    items = [('[the goods]', 'the goods'), ('[tissue + a note]', 'tissue + a note'), ('[a little gift]', 'a little gift')]
    for k, words in enumerate(items):
        y = 700 + 230 * k; t0 = 0.3 + 0.4 * k
        g.text('ink', 19, words, T, 43 + k, (650, y), kf={'scale': pop(t0, 1.1)})
        g.art(f'check{k}', C.sticker('check_mark_button', 140), T, 4 + k, (190, y), kf={'scale': pop(t0 + 0.2, 1.35)})
    g.art('gift', C.sticker('wrapped_gift', 300), T, 8, (800, 1600), kf={'scale': pop(1.5, 1.3), 'rot': wiggle(1.8, 2.0, 6)})

    # ---- seal it + the label prints and slaps on 8.4 to 10.6 ----------------------------------------------------------
    T = (8.4, 10.6)
    g.clip(3, (8.4, 9.5), 1, (540, 960), (W, H), src=0.0, speed=1.15)
    g.clip(3, (9.5, 11.2), 1, (540, 960), (W, H), src=1.4, speed=1.15)   # runs on under the package flood
    g.art('slot', C.printer_slot(940, 76), T, 30, (540, 40))
    lab_y = [(0.0, -320), (0.8, 560), (1.3, 560), (1.6, 1300), (1.7, 1260), (1.8, 1280)]
    g.art('label', C.shipping_label((820, 520)), T, 25, (540, 560), 0,
          {'y': lab_y, 'rot': [(1.3, 0), (1.6, -7)], 'scale': [(1.3, 1.0), (1.6, 1.12), (1.8, 1.0)]})
    g.text('awelier', 19, ('[your shop name]', 'Sunday Clean Co.'), T, 46, (540, 560), 0,
           {'y': [(t_, v) for t_, v in lab_y], 'rot': [(1.3, 0), (1.6, -7)], 'scale': [(1.3, 1.0), (1.6, 1.12), (1.8, 1.0)]})
    # ---- flood of 3D packages into the CTA 10.6 to 11.2 ----------------------------------------------------------------
    for k in range(3):
        g.art(f'flood{k}', C.flood(['package', 'ribbon', 'wrapped_gift', 'package'], (1300, 900), 14, 380, seed=20 + k),
              (10.4 + 0.07 * k, 11.2), 31 + k, (540, 330 + 640 * k), 0,
              {'y': [(0, 2700 + 300 * k), (0.42, 330 + 640 * k), (0.5, 350 + 640 * k)]})

    # ---- CTA 11.2 to 13.8 ------------------------------------------------------------------------------------------------
    T = (11.2, 13.8)
    g.art('paper-cta', C.lined_paper((W, H), seed=97), T, 0, (540, 960))
    c, tilt, pw, ph, b, bot = (540, 640), -4, 640, 760, 30, 120
    win = (pw - 2 * b, ph - b - bot)
    win_c = rot_pt((c[0], c[1] - ph / 2 + b + win[1] / 2), c, tilt)
    def drop(target):
        m = fly((target[0], target[1] - 1600), target); m['rot'] = [(0, 10), (0.3, -7), (0.5, tilt)]; return m
    g.clip(3, T, 2, win_c, (win[0] + 6, win[1] + 6), tilt, drop(win_c), src=2.6)
    g.art('pol-cta', polaroid_frame((pw, ph), b, bot, 98), T, 3, c, tilt, drop(c))
    g.art('stamp-cta', C.stamp('HANDLE\nWITH CARE', (430, 170), RED), T, 4, (800, 330), 10, {'scale': thump(0.6)})
    g.text('awelier', 26, ('[Product name]', 'Spray cleaner'), T, 40, (540, 1180), typewriter=0.5)
    g.text('ink', 14, ('shop at [where to buy]', 'shop at the link in my bio'), T, 41, (540, 1330), kf={'scale': pop(0.6)})
    g.art('truck', C.sticker('delivery_truck', 300), T, 5, (360, 1600),
          {'x': [(0.8, -300), (1.3, 380), (1.4, 350), (1.5, 360)], 'rot': [(1.3, -4), (1.5, 0)] + wiggle(1.6, 2.6, 3)})
    g.art('heart-cta', C.sticker('red_heart', 180), T, 6, (820, 1620), kf={'scale': pop(1.5, 1.3), 'rot': wiggle(1.8, 2.6, 8)})
    return g
