"""12 Your order just arrived, approved 2026-10-18 as the round-4 motion test (build/story7.py, "no changes").
The buyer's four clips are real CapCut clip layers: the door (above the diagonal, then on the phone, then on the mailer
at the end), the tracking clip (inside her front-facing mailbox, zooming out to full screen), the unboxing (under the
three tissue sheets, which are their own layers and peel off), and in use. Everything else plays as a flipbook from the
motion test (build/motion_capcut.py). Editable Montserrat: POV line, ding dong, out for delivery, delivered, the name on
the mailbox, the notification, what's inside, the tag line and the CTA.
CapCut limits: the clip in the mailbox opening shows square corners for a moment while it zooms, and the zoom ends on a
crop of the clip before the full frame; the clip appears in the opening without a fade."""
import contextlib, math
from PIL import Image, ImageDraw
from engine import Layers, W, H
import motion_capcut as MC
import play as P
import story7 as S7

SL = P.SLOW; END = S7.SECS['12'] * SL
SPEC = dict(num='12', title='Your order just arrived', subtitle='25 seconds. Four clips: the doorstep, on its way, the unboxing, in use.',
            font='montserrat', dir='12-your-order-just-arrived', folder='Template 12 - Your order just arrived',
            project='Scrolly 12 Your order just arrived', cover_at=1.5,
            slots=[('The doorstep', 'The parcel arriving or on the doorstep, upright (at least 7 seconds)'),
                   ('On its way', 'Packing it, the courier, or the parcel on the move'),
                   ('The unboxing', 'Hands opening it, upright'),
                   ('In use', 'Your product being used')],
            test_clips=[('IMG_1454', 1.0), ('IMG_1385', 1.0), ('IMG_1456', 1.0), ('IMG_1381', 1.0)])
INK, WHITE, WINE, BLUE = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['blue']
BLANK = Image.new('RGBA', (2, 2), (0, 0, 0, 0))
TAG = '[packed with\nlove + a little\nsurprise]'

def sz(px): return round(px * 0.85 / 6.1, 2)

def blank_tag():
    tag = S7.S.cut('images', 'Blank kraft hang tag with twine-116.png', tol=10); tag = tag.resize((int(tag.width * 2300 / tag.height), 2300), Image.LANCZOS)
    return tag

def tag_with(text):
    tag = blank_tag(); d = ImageDraw.Draw(tag); f = P.manrope(64, 600)
    for k, l in enumerate(text.split('\n')): d.text((int(tag.width * 0.07), int(tag.height * 0.5) + k * 82), l, font=f, fill=INK, anchor='lm')
    return P.die_cut(tag, 10)

@contextlib.contextmanager
def flip_mode(g):
    c = g['c']; keep = dict(g); keep_c = dict(c); bl = Image.blend
    c.update(door=MC.KeyClip(MC.KEYS['m']), cta=MC.KeyClip(MC.KEYS['m']), track=MC.KeyClip(MC.KEYS['c']),
             unbox=MC.KeyClip(MC.KEYS['y']), use=MC.KeyClip(MC.KEYS['b']))
    g['tissues'] = [Image.new('RGBA', (W, H), (0, 0, 0, 0)) for _ in range(3)]
    for k in ('pov', 'ding', 'ofd', 'delivered', 'inside', 'kw'): g[k] = BLANK
    sw_ = P.story_word; P.story_word = lambda text, *a, **k: BLANK if text in ('the', 'wait') else sw_(text, *a, **k)
    g['notif'] = P.notification('', '', 560); g['bigtag'] = P.die_cut(blank_tag(), 10); g['mbf'] = S7.front_mailbox(840, label=False)
    Image.blend = lambda a, b, al: b if al > 0.5 else a           # no fade: a half-key colour can't be cut out
    try: yield
    finally:
        Image.blend = bl; P.story_word = sw_; g.clear(); g.update(keep); c.clear(); c.update(keep_c)

def layers():
    g = Layers(); s = S7.setup_12(); concrete = s['concrete']; clear = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    g.art('concrete', concrete, (0, END), 0, (540, 960))
    # scene 1: the concrete below the diagonal covers the door clip (its own layer, over the clip)
    tri = concrete.copy(); m = Image.new('L', (W, H), 255); ImageDraw.Draw(m).polygon([(0, 0), (W, 0), (W, 1000), (0, 1450)], fill=0); tri.putalpha(m)
    ImageDraw.Draw(tri).line([(0, 1450), (W, 1000)], fill=WHITE + (255,), width=12)
    g.art('diagonal', tri, (0, 2.6 * SL), 20, (540, 960))
    # the three tissue sheets: their own layers, peeling off (the words on them come with the flipbook)
    for i in (2, 1, 0):
        t0 = (9.3, 10.2, 12.0)[i]; sg = 1 if i % 2 == 0 else -1; sheet = s['tissues'][i].copy()
        if i < 2: S7.put(sheet, P.story_word(('the', 'wait')[i], 230, WINE, edge=WHITE), (540, 960))   # the word lives on its sheet
        sh = S7.C.shadow(sheet, (16, 24), 18, 120)
        us = [k / 8 for k in range(9)]; ts = [(t0 + 0.3 * S7.ease(u) - 8.4) * SL for u in us]
        kf = {'x': [(0, 540)] + [(ts_, 540 + sg * 1100 * u) for ts_, u in zip(ts, us)], 'y': [(0, 960)] + [(ts_, 960 + 1400 * u * u) for ts_, u in zip(ts, us)],
              'rot': [(0, 0)] + [(ts_, -sg * 25 * u) for ts_, u in zip(ts, us)]}
        g.art(f'tissue{i}', sh, (8.4 * SL, (t0 + 0.3) * SL), 30 + (2 - i), (540, 960), kf)

    def flip_frame(t):
        ts = t / SL; s['concrete'] = concrete if 2.3 <= ts < 2.6 else clear   # the diagonal wipe needs the real stage
        return S7.frame_12(s, ts)
    with flip_mode(s):
        frames, track = MC.flipbook(flip_frame, 0, END)
    s['concrete'] = concrete
    g.flip('fx', frames, 0, 40)

    body, door, arch, k = s['mbf']; mc = (540, 1180); ox, oy = mc[0] - body.width / 2, mc[1] - body.height / 2
    aw, ah = arch[2] - arch[0], arch[3] - arch[1]; x0, y0 = ox + arch[0], oy + arch[1]
    def zoom_geom(t):   # the clip grows out of the mailbox opening (same shape all the way, see story7.stage_mail)
        z = S7.ease(S7.seg(t / SL, 3.9, 4.5)); bw, bh = S7.lerp(aw, H * aw / ah, z), S7.lerp(ah, H, z)
        bx, by = S7.lerp(x0, (W - H * aw / ah) / 2, z), S7.lerp(y0, 0, z); return bx + bw / 2, by + bh / 2, bw / aw, 0
    sw_, sh_ = P.screen_size(S7.PHONE, 760); mailer = s['mailer']
    MC.clip_layers(g, track, [
        ('m', 0, 0, 2.6 * SL, (W, H), 0, None, lambda t: t, lambda t: (540, 960, 1.0, 0)),
        ('c', 1, 3.6 * SL, 5.6 * SL, (aw, ah), 0, None, lambda t: t - 3.5 * SL, zoom_geom),
        ('m', 0, 5.6 * SL, 7.0 * SL, (sw_, sh_), 3, None, lambda t: t - 5.6 * SL),
        ('y', 2, 8.4 * SL, 13.2 * SL, (W, H), 0, None, lambda t: t - 8.4 * SL, lambda t: (540, 960, 1.0, 0)),
        ('b', 3, 13.2 * SL, 15.6 * SL, (W, H), 0, None, lambda t: t - 13.2 * SL, lambda t: (540, 960, 1.0, 0)),
        ('m', 0, 15.6 * SL, END, (int(mailer.width * 0.7), int(mailer.height * 0.6)), 3, None, lambda t: t - 15.6 * SL + 2.0)], z0=1)

    z = [60]
    def say(words, test, px, t0, t1, pos, rot, box=(255, 255, 255), color=INK, kf=None, round_=0.0, size=None):
        z[0] += 1; k = kf or {'scale': MC.popk(0, 0.3 * SL)}
        g.text('montserrat', size or sz(px), (words, test), (t0 * SL, t1 * SL), z[0], pos, rot, k, color=color, box=box and (box, round_))
    say('POV: your [product]\njust arrived', 'POV: your candle\njust arrived', 60, 0.0, 2.45, (430, 300), 4)
    say('ding dong!', 'ding dong!', 64, 1.5, 2.45, (300, 1440), 6, box=WINE, color=WHITE, round_=1.0)
    say('[out for delivery...]', 'out for delivery...', 78, 2.7, 4.2, (540, 330), 4)
    # the name on the mailbox door: sits on the door, then folds away as the door drops open
    lab = P.pill_m('[your name]', 54, BLUE, rot=0); dx0, dy0, dx1, dy1 = [int(v * k) for v in S7.MB_DOOR]
    lx, ly = ox + dx0 + door.width / 2, oy + dy0 + door.height * 0.55 + lab.height / 2
    fold = [((3.4 + 0.35 * j / 6) * SL - 2.6 * SL, math.cos(math.pi / 2 * S7.ease(j / 6))) for j in range(7)]
    say('[your name]', 'the Lees', 54, 2.6, 3.75, (lx, ly), 0, box=BLUE,
        kf={'scale': MC.popk(0, 0.3 * SL)[:-1] + [(f[0], max(0.0, f[1])) for f in fold],
            'y': [(0, ly)] + [(f[0], dy1 + oy - (dy1 + oy - ly) * max(0.0, f[1])) for f in fold]})
    say('[delivered!]', 'delivered!', 88, 4.6, 5.6, (540, 330), 5, box=BLUE)
    # the notification on the phone screen (title and body), riding up with the phone
    sw, sh = sw_, sh_; nimg = S7.S.fitw(s['notif'], int(sw * 0.94)); fs = nimg.width / s['notif'].width
    def phone_with(title, body):
        scr = Image.new('RGBA', (sw, sh), (90, 90, 90, 255)); n = S7.S.fitw(P.notification(title, body, 560), int(sw * 0.94))
        scr.alpha_composite(n, (int((sw - n.width) / 2), 40)); return P.on_screen(S7.PHONE, 760, scr)
    pb = phone_with('', ''); hh = int(560 * 0.32)
    for words, test, body, pxn in (('[YOUR SHOP]', 'LEE & CO', False, hh * 0.2), ('[Delivered]', 'Delivered', True, hh * 0.16)):
        o = MC.text_anchor(phone_with('' if body else words, words if body else ''), pb, -3)
        say(words, test, 0, 6.1, 7.0, (540 + o[0], 1000 + o[1]), 3, box=None, size=round(pxn * fs * 0.95 / 6.1, 2), color=INK if not body else (70, 68, 66))
    say("[what's inside?]", "what's inside?", 80, 7.15, 8.4, (540, 420), 5)
    # the tag line, on the giant tag sliding in from the right
    o = MC.text_anchor(tag_with(TAG), P.die_cut(blank_tag(), 10), 8)
    xs = [((13.3 + 0.4 * j / 8 - 13.2) * SL, S7.lerp(W + 700, W - 110, S7.back_out(j / 8, 1.3)) + o[0]) for j in range(9)]
    say(TAG, 'packed with\nlove + a little\nsurprise', 64, 13.2, 15.6, (xs[-1][1], 980 + o[1]), -8, box=None, kf={'x': [(0, W + 700 + o[0])] + xs})
    say('comment "[KEYWORD]"', 'comment "CANDLE"', 72, 16.2, END / SL, (540, 530), 0, box=WINE, color=WHITE)
    return g
