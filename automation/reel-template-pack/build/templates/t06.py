"""06 Start to finish (even: MADE Awelier). World: graph paper and masking tape.
The hook builds word by word; four steps of three quick cuts each, a tape label naming the step and a tape progress bar
filling along the bottom; the finished piece lands in a Polaroid that grows, with a DONE stamp; a graph-paper CTA."""
from engine import Layers, pop, thump, fly, wiggle, rot_pt, polaroid_frame, W, H, INK, BUTTER
import collage as C

SPEC = dict(num='06', title='Start to finish', subtitle='13.6 seconds. Five clips, filmed while you make it.',
            font='awelier', dir='06-start-to-finish', folder='Template 06 - Start to finish',
            project='Scrolly 06 Start to finish', cover_at=1.6,
            slots=[('The raw materials', 'Lay them out on the table'),
                   ('Step one', 'Hands at work'), ('Step two', 'Hands at work'), ('Step three', 'Hands at work'),
                   ('The finished piece', 'On its own, good light')],
            test_clips=[('IMG_1462', 0.3), ('IMG_1460', 0.3), ('IMG_1430', 2.0), ('IMG_1433', 2.0), ('IMG_1463', 0.3)])

def layers():
    g = Layers()
    T = (0, 1.8)
    g.art('bg-hook', C.grid_paper((W, H)), T, 0, (540, 960))
    g.text('awelier', 24, ('Making one', 'Making one'), T, 20, (540, 520), typewriter=0.35)
    g.text('awelier', 40, ('[product]', 'mop kit'), T, 21, (540, 720), kf={'scale': pop(0.4, 1.25)})
    g.text('ink', 17, ('start to finish', 'start to finish'), T, 22, (540, 930), kf={'scale': pop(0.75, 1.15)})
    g.art('arrow-hook', C.arrow(240, INK, 7, 50), T, 2, (540, 1200), kf={'scale': pop(1.0), 'x': wiggle(1.3, 1.8, 18, base=540)})

    steps = [('[materials]', 'materials'), ('[step one]', 'soak'), ('[step two]', 'rinse'), ('[step three]', 'mop')]
    t, d = 1.8, 0.65
    for s in range(4):
        st = t
        for src in (0.0, 1.0, 2.0):
            g.clip(s, (t, t + d), 1, (540, 960), (W, H), src=src, speed=1.15)
            t += d
        g.art(f'tape-label{s}', C.tape(560, 130, seed=60 + s, alpha=235), (st, t), 10, (540, 300), [-3, 2, -2, 3][s],
              {'scale': pop(0.0, 1.12)})
        g.text('ink', 16, steps[s], (st, t), 20, (540, 300), [-3, 2, -2, 3][s], {'scale': pop(0.05, 1.12)})
        g.art(f'tape-bar{s}', C.tape(230, 80, seed=70 + s, color=BUTTER, alpha=240), (st, 9.6), 11 + s,
              (170 + 247 * s, 1690), [-2, 1, -1, 2][s], {'scale': pop(0.1, 1.15)})
    # finished: a Polaroid lands and grows, DONE thumps
    T = (t, t + 1.8)
    g.art('bg-done', C.grid_paper((W, H), seed=72), T, 0, (540, 960))
    c, tilt, pw, ph, b, bot = (540, 1050), -3, 760, 930, 36, 150
    win = (pw - 2 * b, ph - b - bot)
    win_c = rot_pt((c[0], c[1] - ph / 2 + b + win[1] / 2), c, tilt)
    grow = [(0.5, 1.0), (0.9, 1.12), (1.3, 1.18), (1.8, 1.2)]
    def mo(target):
        m = fly((target[0], target[1] + 1900), target); m['rot'] = [(0, 12), (0.3, -5), (0.5, tilt)]; m['scale'] = list(grow)
        for t_, s_ in grow[1:]:
            m['x'].append((t_, c[0] + (target[0] - c[0]) * s_)); m['y'].append((t_, c[1] + 30 + (target[1] - c[1]) * s_))
        return m
    g.clip(4, T, 2, win_c, (win[0] + 6, win[1] + 6), tilt, mo(win_c))
    g.art('pol-done', polaroid_frame((pw, ph), b, bot, 73), T, 3, c, tilt, mo(c))
    g.art('stamp-done', C.stamp('DONE', (300, 300), (178, 62, 44), seed=74, round_=True), T, 4, (830, 330), 12,
          {'scale': thump(0.55, 2.0)})
    g.art('burst-done', C.burst(600, INK, 6), T, 5, (830, 330), kf={'scale': pop(0.7, 1.1)})
    t += 1.8
    # CTA
    T = (t, t + 2.2)
    g.art('bg-cta', C.grid_paper((W, H), seed=75), T, 0, (540, 960))
    g.text('awelier', 30, ('[Product name]', 'Mop kit'), T, 20, (540, 720), typewriter=0.45)
    g.text('ink', 14, ('made by hand in [town]', 'made by hand in Ohio'), T, 21, (540, 900), kf={'scale': pop(0.5)})
    g.text('ink', 14, ('shop at [where to buy]', 'shop at the link in my bio'), T, 22, (540, 1010), kf={'scale': pop(0.7)})
    g.art('tape-cta', C.tape(620, 90, seed=76, color=BUTTER, alpha=240), T, 2, (540, 1180), -2, {'scale': pop(0.9, 1.1)})
    g.art('check-cta', C.check(130, INK, 10), T, 3, (230, 1420), kf={'scale': pop(1.1, 1.3)})
    g.art('heart-cta', C.heart(110, INK, 6, seed=77), T, 4, (850, 1420), kf={'scale': pop(1.25, 1.3), 'rot': wiggle(1.6, 2.2, 8)})
    return g
