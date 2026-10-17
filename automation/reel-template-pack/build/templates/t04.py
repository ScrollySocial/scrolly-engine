"""04 A or B? (even: MADE Awelier). World: sky-blue paper, two Polaroids facing each other, round A and B stickers.
The hook types on while A and B bounce in; the two Polaroids fly in from opposite sides; quick A/B cuts with the
matching sticker in the corner; one big Polaroid of both, with the stickers wiggling either side."""
from engine import Layers, pop, fly, wiggle, rot_pt, polaroid_frame, W, H, INK, BUTTER
import collage as C

SKY = (206, 226, 241); SAGE = (205, 222, 200)
SPEC = dict(num='04', title='A or B?', subtitle='12.5 seconds. Three clips.', font='awelier',
            dir='04-a-or-b', folder='Template 04 - A or B', project='Scrolly 04 A or B', cover_at=1.6,
            slots=[('Version A, close up', 'One colour, scent or style'),
                   ('Version B, close up', 'Same framing as A'),
                   ('Both together', 'Side by side on a table')],
            test_clips=[('IMG_1432', 0.3), ('IMG_1417', 0.3), ('IMG_1463', 0.3)])

def pol_parts(g, name, t, z, c, tilt, size, border, bottom, slot, caption, motion_from, seed, kf_extra=None):
    """A Polaroid that flies in from motion_from: clip, frame and caption move together."""
    pw, ph = size; win = (pw - 2 * border, ph - border - bottom)
    win_c = rot_pt((c[0], c[1] - ph / 2 + border + win[1] / 2), c, tilt)
    cap_c = rot_pt((c[0], c[1] + ph / 2 - bottom / 2), c, tilt)
    def mo(target):
        m = fly((target[0] + motion_from[0] - c[0], target[1] + motion_from[1] - c[1]), target)
        m['rot'] = [(0, tilt * 4), (0.3, -tilt * 0.6), (0.5, tilt)]
        if kf_extra: kf_extra(m, target)
        return m
    g.clip(slot, t, z, win_c, (win[0] + 6, win[1] + 6), tilt, mo(win_c))
    g.art(name, polaroid_frame(size, border, bottom, seed), t, z + 1, c, tilt, mo(c))
    g.text('ink', 11 if pw < 600 else 13, caption, t, 30 + z, cap_c, tilt, mo(cap_c))

def layers():
    g = Layers()
    T = (0, 2.0)
    g.art('bg-hook', C.paper((W, H), SKY, seed=41), T, 0, (540, 960))
    g.text('awelier', 26, ('Which one', 'Which one'), T, 20, (540, 560), typewriter=0.4)
    g.text('awelier', 26, ('are you?', 'are you?'), T, 21, (540, 720), kf={'scale': pop(0.45, 1.2)})
    g.art('A-hook', C.letter_sticker('A', 260, BUTTER), T, 2, (330, 1180), -8, {'scale': pop(0.7, 1.3), 'rot': wiggle(1.1, 2.0, 7, base=-8)})
    g.art('B-hook', C.letter_sticker('B', 260, SAGE), T, 3, (750, 1180), 8, {'scale': pop(0.9, 1.3), 'rot': wiggle(1.3, 2.0, 7, base=8)})

    T = (2.0, 5.5)
    g.art('bg-pair', C.paper((W, H), SKY, seed=42), T, 0, (540, 960))
    pol_parts(g, 'pol-A', T, 2, (285, 980), -5, (520, 690), 26, 120, 0, ('[name A]', 'Shark'), (-700, 980), 43)
    pol_parts(g, 'pol-B', T, 4, (795, 1000), 5, (520, 690), 26, 120, 1, ('[name B]', 'Samsung'), (1800, 1000), 46)
    g.art('A-pair', C.letter_sticker('A', 140, BUTTER), T, 8, (100, 650), -10, {'scale': pop(0.7, 1.3), 'rot': wiggle(1.1, 3.5, 6, base=-10)})
    g.art('B-pair', C.letter_sticker('B', 140, SAGE), T, 9, (980, 660), 10, {'scale': pop(0.85, 1.3), 'rot': wiggle(1.25, 3.5, 6, base=10)})
    g.text('ink', 15, ('[two moods]', 'two moods'), T, 22, (540, 1560), kf={'scale': pop(1.2)})

    t, d = 5.5, 0.633
    for k in range(6):
        slot = k % 2; src = [0.6, 1.4, 2.2][k // 2]
        g.clip(slot, (t, t + d), 1, (540, 960), (W, H), src=src, speed=1.15)
        g.art(f'corner{k}', C.letter_sticker('AB'[slot], 180, [BUTTER, SAGE][slot], seed=50 + k), (t, t + d), 10,
              (880, 320), [-8, 8][slot], {'scale': pop(0.0, 1.25)})
        t += d

    T = (t, t + 3.2)
    g.art('bg-both', C.paper((W, H), SKY, seed=44), T, 0, (540, 960))
    def grow(m, target):
        c = (540, 1000)
        for t_, s_ in [(0.8, 1.06), (1.4, 1.1), (3.2, 1.14)]:
            m['x'].append((t_, c[0] + (target[0] - c[0]) * s_)); m['y'].append((t_, c[1] + (target[1] - c[1]) * s_))
        m['scale'] = [(0.5, 1.0), (0.8, 1.06), (1.4, 1.1), (3.2, 1.14)]
    pol_parts(g, 'pol-both', T, 2, (540, 1000), 2, (740, 900), 34, 150, 2,
              ('both at [where to buy]', 'both at my shop'), (540, 2800), 47, grow)
    g.text('awelier', 20, ('[Product name]', 'Floor care'), T, 20, (540, 270), typewriter=0.5)
    g.art('A-end', C.letter_sticker('A', 170, BUTTER, seed=60), T, 8, (130, 560), -12, {'scale': pop(0.6, 1.3), 'rot': wiggle(1.0, 3.2, 8, base=-12)})
    g.art('B-end', C.letter_sticker('B', 170, SAGE, seed=61), T, 9, (940, 1740), 12, {'scale': pop(0.75, 1.3), 'rot': wiggle(1.15, 3.2, 8, base=12)})
    return g
