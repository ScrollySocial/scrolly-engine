"""08 A real customer question, approved 2026-10-18 as the round-4 motion test (build/story7.py, "super cute").
The buyer's three clips are real CapCut clip layers (full frame, the pinned photo, the pinned photo at the end); the
rest (the ringing rotary phone, its burst, the DM cards, the sticky note, doodles, the DM Serif words) plays as a
flipbook rendered from the motion test (build/motion_capcut.py). The question, the answer lines, the note and the CTA
are editable Montserrat (highlight boxes are CapCut's own text background, so they grow with the buyer's words).
CapCut limit: the motion-blur swipes are plain slides."""
import contextlib, math
from PIL import Image
from engine import Layers, W, H
import motion_capcut as MC
import play as P
import story7 as S7

SL = P.SLOW; END = S7.SECS['08'] * SL
SPEC = dict(num='08', title='A real customer question', subtitle='24 seconds. Three clips: the answer, more of the answer, in use.',
            font='montserrat', dir='08-a-real-customer-question', folder='Template 08 - A real customer question',
            project='Scrolly 08 A real customer question', cover_at=3.0,
            slots=[('The answer, shown', 'Show the answer to the question, upright (at least 7 seconds)'),
                   ('More of the answer', 'A second angle or the next step'),
                   ('In use', 'Your product being used, upright')],
            test_clips=[('IMG_1381', 1.0), ('IMG_1414', 1.0), ('IMG_1391', 1.0)])
INK, WHITE, WINE, BL = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['blue']
BLANK = Image.new('RGBA', (2, 2), (0, 0, 0, 0))
Q = ['[the question your', 'customer asked]']
DMS = ((['[another question]'], 4, 'pin-head-black', 'can I gift wrap it?'), (['[and another]'], -5, 'pin-head-white', 'is it dishwasher safe?'),
       (['[one more]'], 3, 'pin-head-cream', 'do you ship to Canada?'))

def sz(px): return round(px * 0.85 / 6.1, 2)

def blank_card(lines, w, rot, pin='pin-head-cream'):
    return P.pinned(P.proof_card([''] * len(lines), w, WINE), rot, pin)

@contextlib.contextmanager
def flip_mode(g):
    c = g['c']; keep = dict(g); keep_c = dict(c); sw = S7.swipe
    c.update(ans1=MC.KeyClip(MC.KEYS['m']), cta=MC.KeyClip(MC.KEYS['c']), ans2=MC.KeyClip(MC.KEYS['y']), use=MC.KeyClip(MC.KEYS['b']))
    g['stage'] = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    for k in ('qpill', 'heres', 'line', 'kw', 'more', 'ans2'): g[k] = BLANK
    g['dm'] = blank_card(Q, 620, -4); g['dm_s'] = blank_card(Q, 440, -4)
    g['dms'] = [blank_card(l, 520, r, pn) for l, r, pn, _ in DMS]
    g['answer_note'] = P.sticky('', 460, px=58, pin='pin-head-black')
    def slide(old, new, u, direction=1):
        if u <= 0: return old
        if u >= 1: return new
        dx = int(direction * S7.ease(u) * W); out = Image.new('RGBA', (W, H)); out.alpha_composite(old, (-dx, 0)); out.alpha_composite(new, (direction * W - dx, 0)); return out
    S7.swipe = slide
    try: yield
    finally:
        S7.swipe = sw; g.clear(); g.update(keep); c.clear(); c.update(keep_c)

def rot_off(d, deg):
    """An offset (image coords, y down) turned the way PIL turns an image by deg."""
    a = math.radians(deg); return (d[0] * math.cos(a) + d[1] * math.sin(a), -d[0] * math.sin(a) + d[1] * math.cos(a))

def slide_out(t0s, base_x, swipe_at):
    """x keyframes (layer-relative, CapCut s) for a word that leaves with the scene's swipe to the left."""
    return [(0, base_x)] + [((swipe_at + 0.05 * k - t0s) * SL, base_x - S7.ease(k / 6) * W) for k in range(7)]

def layers():
    g = Layers(); s = S7.setup_08()
    g.art('stage', s['stage'], (0, END), 0, (540, 960))
    with flip_mode(s):
        frames, track = MC.flipbook(lambda t: S7.frame_08(s, t / SL), 0, END)
    g.flip('fx', frames, 0, 40)
    def cta_geom(t):
        ts = t / SL; u = S7.ease(S7.seg(ts, 14.4, 14.75)); cw = S7.lerp(1488, 620, u)
        return 540, S7.lerp(960, 1180, u), cw / 620, (-3 * u if u > 0.9 else 0)
    MC.clip_layers(g, track, [
        ('m', 0, 0, 2.4 * SL, (W, H), 0, None, lambda t: t + 2.0 * SL),
        ('m', 0, 3.9 * SL, 6.6 * SL, (W, H), 0, None, lambda t: t - 4.2 * SL),
        ('m', 0, 6.6 * SL, 8.6 * SL, (420, 540), -6, None, lambda t: t - 4.2 * SL),
        ('y', 1, 8.3 * SL, 10.6 * SL, (W, H), 0, None, lambda t: t - 8.6 * SL),
        ('b', 2, 12.7 * SL, 14.4 * SL, (W, H), 0, None, lambda t: t - 13.0 * SL),
        ('c', 0, 14.4 * SL, END, (620, 800), 0, None, lambda t: t - 14.4 * SL + 2.0, cta_geom)], z0=1)

    z = [60]
    def say(words, test, px, t0, t1, pos, rot, box=(255, 255, 255), color=INK, kf_x=None, kf=None):
        z[0] += 1; k = kf or {'scale': MC.popk(0, 0.3 * SL)}
        if kf_x: k['x'] = kf_x
        g.text('montserrat', sz(px), (words, test), (t0 * SL, t1 * SL), z[0], pos, rot, k, color=color, box=box and (box, 0.0))

    # 1: the question on the DM card, swaying with it, then leaving with the swipe
    full, blank = P.pinned(P.proof_card(Q, 620, WINE), -4), blank_card(Q, 620, -4)
    off = MC.text_anchor(full, blank); pts = []
    for i in range(int(2.4 * 15) + 1):
        ts = i / 15; sw_ = 5 * math.sin(ts * 3.2) * math.exp(-0.6 * ts); cy = S7.lerp(1180, 1260, S7.ease(S7.seg(ts, 0, 0.4)))
        o = rot_off(off, sw_); slide = -S7.ease(S7.seg(ts, 2.1, 2.4)) * W
        pts.append((ts * SL, 540 + o[0] + slide, cy + o[1], 4 - sw_))
    g.text('montserrat', sz(40), ('[the question your\ncustomer asked]', 'can I wash it\non 30?'), (0, 2.4 * SL), 61,
           (pts[0][1], pts[0][2]), pts[0][3], {'x': [(t, x) for t, x, _, _ in pts], 'y': [(t, y) for t, _, y, _ in pts], 'rot': [(t, r) for t, _, _, r in pts]}, color=WHITE)
    z[0] = 62
    # 2: the question again, big
    say('[can I wash it?]', 'can I wash it?', 84, 2.6, 4.2, (540, 820), 4, kf_x=slide_out(2.6, 540, 3.9))
    # 3: the sandwich (here's / the answer / [in one line])
    bh = max(i.height for i, _ in s['answer'])
    say("here's", "here's", 76, 4.3, 6.6, (540, 1300 - bh / 2 - s['heres'].height / 2 + 30), 4)
    say('[in one line]', 'yes, on 30', 76, 4.91, 6.6, (540, 1300 + bh / 2 + s['line'].height / 2 - 30), 0, box=BL)
    # 4: the small card shrinks away (its question too), the answer note pops in
    small_full, small_blank = P.pinned(P.proof_card(Q, 440, WINE), -4), blank_card(Q, 440, -4); o = MC.text_anchor(small_full, small_blank)
    shrink = [((t - 6.6) * SL, 1 - (2 * S7.ease(S7.seg(t, 6.8, 7.1)) if t > 6.8 else 0)) for t in (6.6, 6.8, 6.85, 6.9, 6.95)]
    g.text('montserrat', sz(30), ('[the question your\ncustomer asked]', 'can I wash it\non 30?'), (6.6 * SL, 6.95 * SL), 90, (330 + o[0], 860 + o[1]), 4,
           {'scale': [(t, max(0, v)) for t, v in shrink]}, color=WHITE)
    words = '[yes! wash\nit at 30°]'; o = MC.text_anchor(P.sticky(words, 460, px=58, pin='pin-head-black'), P.sticky('', 460, px=58, pin='pin-head-black'), -5)
    say(words, 'yes! wash\nit at 30°', 50, 6.95, 8.6, (330 + o[0], 860 + o[1]), 5, box=None,
        kf={'scale': [(0, 0.0)] + [(0.25 * SL * k / 6, S7.back_out(k / 6, 1.6)) for k in range(7)]}, kf_x=slide_out(6.95, 330 + o[0], 8.3))
    # 5: answer part 2
    say('[the answer, line two]', 'machine wash, cold', 78, 8.7, 10.6, (540, 1380), 4, kf_x=slide_out(8.7, 540, 10.3))
    # 6: three more questions on their cards
    for i, ((l, r, pn, test), (x, y)) in enumerate(zip(DMS, ((500, 640), (580, 900), (500, 1160)))):
        o = MC.text_anchor(P.pinned(P.proof_card(l, 520, WINE), r, pn), blank_card(l, 520, r, pn)); t0 = 10.9 + i * 0.4
        say(l[0], test, 34, t0, 13.0, (x + o[0], y + o[1]), -r, box=None, color=WHITE, kf_x=slide_out(t0, x + o[0], 12.7))
    # 8: the CTA
    g.text('montserrat', sz(78), ('"[KEYWORD]"', '"WASH"'), (15.1 * SL, END), 80, (540, 500), -2, {'scale': MC.popk(0, 0.3 * SL)}, color=WHITE, box=(WINE, 1.0))
    say('[more questions?]', 'more questions? ask me', 70, 15.3, END / SL, (540, 630), 4, box=BL)
    return g
