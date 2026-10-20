"""12 Your order just arrived, approved 2026-10-18 as the round-4 motion test (build/story7.py, "no changes").
FULLY EDITABLE build (2026-10-20, build/editable.py; the motion test plays P.SLOW times longer, so script times are
scaled by SLOW): every word is CapCut text (DM Serif Display built-in words: it's here, the, wait, is over, get yours;
the POV line, ding dong, out for delivery, delivered, the name on the mailbox, the notification, what's inside, the tag
line and the CTA in Montserrat, the [brackets] on CapCut's text background); the concrete stage is CapCut's background
colour under a colourless concrete grain; the doorbell, mailbox, phone, padded mailer, packing peanuts, tissue sheets,
kraft tag and wax seal are real photos moving on keyframes; the four clips are real clip layers (placeholder cards
until the buyer's clips go in): the door (above the diagonal, on the phone, on the mailer), the tracking clip (inside
the mailbox opening, zooming out to full screen), the unboxing (under the three tissue sheets) and in use.
CapCut limits: the diagonal split is a tilted clip window, and the diagonal wipe is a slide up and away; the bursts
behind the doorbell is a picture (text always sits above pictures; recolour it with Adjust > HSL); the mailbox door
folding down on its hinge is a short flipbook of the door alone (CapCut can't squash a picture); the clip in the
mailbox opening shows square corners while it zooms out; the notification pops onto the screen instead of sliding
down from its top edge; the tissue sheets are photos (recolour them with Adjust > HSL)."""
import math
from PIL import Image, ImageDraw, ImageEnhance
import editable as Ed
from editable import at, still, then
import editable_b as B
from editable_b import pop, word
import play as P
import story7 as S7
import collage as C
from collage_kit import doodle as art_doodle, raw
from motion_b2 import ease, back_out, seg, lerp
from engine import W, H

SL = B.SL; END = S7.SECS['12']
SPEC = dict(num='12', title='Your order just arrived', subtitle='25 seconds. Four clips: the doorstep, on its way, the unboxing, in use.',
            font='montserrat', dir='12-your-order-just-arrived', folder='Template 12 - Your order just arrived',
            project='12 Your order just arrived', cover_at=1.5,
            slots=[('The doorstep', 'The parcel arriving or on the doorstep, upright (at least 7 seconds)'),
                   ('On its way', 'Packing it, the courier, or the parcel on the move'),
                   ('The unboxing', 'Hands opening it, upright'),
                   ('In use', 'Your product being used')],
            test_clips=[('IMG_1454', 1.0), ('IMG_1385', 1.0), ('IMG_1456', 1.0), ('IMG_1381', 1.0)])
INK, WHITE, WINE, BLUE = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['blue']
STAGE = (212, 211, 207)
TAG = '[packed with\nlove + a little\nsurprise]'

def blank_tag():
    tag = S7.S.cut('images', 'Blank kraft hang tag with twine-116.png', tol=10); return tag.resize((int(tag.width * 2300 / tag.height), 2300), Image.LANCZOS)

def tag_with(text):
    tag = blank_tag(); d = ImageDraw.Draw(tag); f = P.manrope(64, 600)
    for k, l in enumerate(text.split('\n')): d.text((int(tag.width * 0.07), int(tag.height * 0.5) + k * 82), l, font=f, fill=INK, anchor='lm')
    return P.die_cut(tag, 10)

def reel():
    g = S7.setup_12(); r = B.SlowReel(END)
    r.art('concrete-grain', Ed.grain(raw('images', 'Light gray concrete mineral texture-4.png'), 0.2), 0, None, 1, still(540, 960))

    # 1 (0-2.6) the door clip above a diagonal (a tilted clip window); the doorbell on the stage, ONE burst behind it
    a = math.degrees(math.atan2(1000 - 1450, W)); cw_, ch_ = 2200, 1700; mid = (540, 1225); off = Ed.rot((0, -ch_ / 2), a)
    away = Ed.slide(2.3, 2.6, -W - 600, -900)
    r.clip(0, 0, 2.6, 10, then(lambda ts: at(mid[0] + off[0], mid[1] + off[1], 1, a), away), size=(cw_, ch_), src=0)
    line = Image.new('RGBA', (2400, 12), WHITE + (255,))
    r.art('diagonal-line', line, 0, 2.6, 11, then(lambda ts: at(mid[0], mid[1], 1, a), away))
    r.art('burst', art_doodle('burst', 1, 640, BLUE), 1.1, 2.6, 12,
          then(lambda ts: at(790, 1560, 0.85 + 0.15 * back_out(seg(ts, 1.1, 1.5), 1.6) + 0.04 * math.sin((ts - 1.1) * 6)), away))
    r.art('doorbell', g['bell'], 0.8, 2.6, 13,
          then(lambda ts: at(790, 1560, back_out(seg(ts, 0.8, 1.1)) * (1 - 0.1 * math.sin(math.pi * seg(ts, 1.1, 1.3)))), away))
    r.boxed('POV: your [product]\njust arrived', 60, 0.0, 2.6, then(pop(430, 300, 0.0, 4), away), WHITE, 'POV: your candle\njust arrived')
    r.serif("it's here", 210, 0.45, 2.6, then(word(540, 500, 0.45, 0), away), WHITE, WINE)
    r.boxed('ding dong!', 64, 1.5, 2.6, then(pop(300, 1440, 1.5, 6), away), WINE, round_=1)

    # 2-3 (2.6-5.6) her front-on mailbox: [out for delivery...]; the door drops open, the tracking clip zooms out of it
    body, door, arch, k = S7.front_mailbox(840, label=False); mc = (540, 1180)
    ox, oy = mc[0] - body.width / 2, mc[1] - body.height / 2; ax0, ay0, ax1, ay1 = arch; aw, ah = ax1 - ax0, ay1 - ay0
    keyed = body.copy(); km = S7.arch_mask((aw, ah), aw / 2); keyed.paste(B.KEY + (255,), (ax0, ay0), km)
    bodyw, wsize, woff = B.hole(keyed)
    fm = lambda ts: at(mc[0], mc[1], back_out(seg(ts, 2.6, 2.9), 1.4))
    inside = Image.new('RGBA', (aw, ah), (30, 12, 16, 255)); inside.putalpha(km)
    r.art('mailbox-inside', inside, 2.6, 3.9, 14, Ed.child(fm, woff))
    r.clip(1, 3.75, 3.9, 15, Ed.child(fm, woff), size=(aw, ah), src=0.25 * SL)
    r.art('mailbox', bodyw, 2.6, 4.5, 16, fm)
    dx0, dy0, dx1, dy1 = [int(v * k) for v in S7.MB_DOOR]
    dcen = (dx0 + door.width / 2 - body.width / 2, dy0 + door.height / 2 - body.height / 2)
    r.art('mailbox-door', door, 2.6, 3.4, 17, Ed.child(fm, dcen))
    frames = []                                                     # the door folds down on its hinge: a flipbook of the door only
    for n in range(int(round(0.35 * SL * 30)) + 1):
        ts = 3.4 + n / 30 / SL; f = math.cos(math.pi / 2 * ease(seg(ts, 3.4, 3.75)))
        if f > 0.02:
            dh = max(1, int(door.height * f)); d_ = door.resize((door.width, dh)); d_ = ImageEnhance.Brightness(d_).enhance(0.6 + 0.4 * f)
            frames.append((d_, (ox + dx0 + door.width / 2, oy + dy1 - dh / 2)))
    r.L.flip('mailbox-door-fold', frames, r.R(3.4), 17)
    t_lip = 3.4 + len(frames) / 30 / SL + 0.01
    lip = door.resize((door.width, max(4, int(door.height * 0.05))))
    r.art('mailbox-door-open', lip, t_lip, 4.5, 17, still(ox + dx0 + door.width / 2, oy + dy1 + lip.height / 2))
    lab = P.pill_m('[your name]', 54, BLUE, rot=0); ly = oy + dy0 + door.height * 0.55 + lab.height / 2; hinge = oy + dy1
    def name(ts):
        f = math.cos(math.pi / 2 * ease(seg(ts, 3.4, 3.75))); return at(ox + dx0 + door.width / 2, hinge - (hinge - ly) * f, back_out(seg(ts, 2.6, 2.9), 1.4) * f)
    r.boxed('[your name]', 54, 2.6, 3.75, name, BLUE, 'the Lees')
    def zoom(ts):
        z = ease(seg(ts, 3.9, 4.5)); bh = lerp(ah, H, z); x0, y0 = ox + ax0, oy + ay0
        bx0, by0 = lerp(x0, (W - H * aw / ah) / 2, z), lerp(y0, 0, z); return at(bx0 + bh * aw / ah / 2, by0 + bh / 2, bh / ah)
    r.clip(1, 3.9, 5.6, 18, zoom, size=(aw, ah), src=0.4 * SL)
    r.boxed('[out for delivery...]', 78, 2.7, 4.2, pop(540, 330, 2.7, 4), WHITE, 'out for delivery...')
    r.boxed('[delivered!]', 88, 4.6, 5.6, pop(540, 330, 4.6, 5), BLUE, 'delivered!')

    # 4 (5.6-7.0) the order notification pops onto the phone; the door clip on its screen (tech)
    ph, ssize, soff = B.device(S7.PHONE, 760)
    fp = lambda ts: at(540, lerp(2400, 1000, ease(seg(ts, 5.6, 5.9))), 1, 3)
    r.clip(0, 5.6, 7.0, 19, Ed.child(fp, soff), size=ssize)
    r.art('phone', ph, 5.6, 7.0, 20, fp)
    sw = ssize[0] - 12; blank = P.notification('', '', 560); fs = sw * 0.94 / 560; nb = S7.S.fitw(blank, int(sw * 0.94))
    noff = (soff[0], soff[1] - (ssize[1] - 12) / 2 + 40 + nb.height / 2)
    fn = Ed.child(fp, noff); fnp = lambda ts: dict(fn(ts), s=back_out(seg(ts, 6.0, 6.3), 1.4))
    r.art('notification', nb, 6.0, 7.0, 21, fnp)
    hh = 560 * 0.32
    for words, test, title, pxn, col in (('[YOUR SHOP]', 'LEE & CO', True, hh * 0.2, INK), ('[Delivered]', 'Delivered', False, hh * 0.16, (70, 68, 66))):
        o = B.anchor(P.notification(words if title else '', '' if title else words, 560), blank)
        r.plain(words, pxn * fs / 0.85, 6.0, 7.0, Ed.child(fnp, (o[0] * fs, o[1] * fs)), col, test=test)

    # 5 (7.0-8.4) the padded mailer shakes, packing peanuts burst out: [what's inside?] (no video)
    def mailer(ts):
        sh = 8 * math.sin(ts * 50) * (1 - seg(ts, 7.4, 7.6)); return at(540 + sh, 1100, back_out(seg(ts, 7.0, 7.25), 1.5), -sh)
    r.art('mailer-shake', g['mailer_s'], 7.0, 8.4, 22, mailer)
    for i in range(12):
        t0 = 7.45 + (i % 4) * 0.03
        def pn(ts, i=i, t0=t0):
            a = -math.pi / 2 + (i - 5.5) * 0.22; s = seg(ts, t0, 8.2); rr = 900 * ease(s)
            return at(540 + rr * math.cos(a), 1000 + rr * math.sin(a) + 900 * s * s, 1, -(i * 40 + 300 * s))
        r.art(f'peanut-{i}', g['peanut'], t0, 8.4, 23 + i, pn)
    r.boxed("[what's inside?]", 80, 7.15, 8.4, pop(540, 420, 7.15, 5), WHITE, "what's inside?")

    # 6-7 (8.4-13.2) the unboxing under three tissue sheets: THE / WAIT / IS OVER, each sheet peels off in turn
    r.clip(2, 8.4, 13.2, 36, still(540, 960))
    for i in (2, 1, 0):
        t0 = (9.3, 10.2, 12.0)[i]; sg = 1 if i % 2 == 0 else -1
        def peel(ts, t0=t0, sg=sg):
            u = ease(seg(ts, t0, t0 + 0.3)); return at(540 + sg * 1100 * u, 960 + 1400 * u * u, 1, -sg * 25 * u)
        r.art(f'tissue-{i}', C.shadow(g['tissues'][i], (16, 24), 18, 120), 8.4, t0 + 0.3, 37 + (2 - i), peel)
        if i == 0: r.serif('the', 230, 8.4, 9.6, peel, WINE, WHITE)
        if i == 1: r.serif('wait', 230, 9.5, 10.5, peel, WINE, WHITE)
        if i == 2: r.serif('is over', 230, 10.4, 12.3, peel, WINE, WHITE, typewriter=round(7 * 0.09 * SL, 2))

    # 8 (13.2-15.6) in use; a giant kraft tag, a third on screen: [packed with love + a little surprise]
    r.clip(3, 13.2, 15.6, 40, still(540, 960))
    bt = P.die_cut(blank_tag(), 10); otag = B.anchor(tag_with(TAG), bt)
    ft = lambda ts: at(lerp(W + 700, W - 110, back_out(seg(ts, 13.3, 13.7), 1.3)), 980, 1, -8)
    r.art('big-tag', bt, 13.2, 15.6, 41, ft)
    r.plain(TAG, 64 / 0.85, 13.2, 15.6, Ed.child(ft, otag), INK, test='packed with\nlove + a little\nsurprise')

    # 9 (15.6-end) CTA: the door clip on the mailer, the wax seal pressed on; get yours / comment "[KEYWORD]"
    m = g['mailer'].copy(); m.paste(B.KEY + (255,), (int(m.width * 0.15), int(m.height * 0.22), int(m.width * 0.15) + int(m.width * 0.7), int(m.height * 0.22) + int(m.height * 0.6)))
    mw, msize, moff = B.hole(P.die_cut(m, 10))
    fmail = pop(540, 1080, 15.6, 3)
    r.clip(0, 15.6, None, 42, Ed.child(fmail, moff), size=msize, src=2.0)
    r.art('mailer', mw, 15.6, None, 43, fmail)
    r.art('wax-seal', g['seal'], 16.0, None, 44, lambda ts: at(860, 1430, 1 + 0.5 * (1 - back_out(seg(ts, 16.0, 16.2), 1.2))))
    r.serif('get yours', 190, 15.8, None, word(540, 330, 15.8, 0), WHITE, WINE)
    r.boxed('comment "[KEYWORD]"', 72, 16.2, None, pop(540, 530, 16.2, 0), WINE, 'comment "CANDLE"')
    return r

def layers():
    return reel().L
