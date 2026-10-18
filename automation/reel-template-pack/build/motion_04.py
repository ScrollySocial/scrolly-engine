"""#04 A or B? motion test, fresh take (2026-10-18). Built the #09/#10/#12 round 3 way (story5.py): story first,
7 to 10 scenes, two home bases (the buyer's clips + ONE graphic stage: a marble table with a torn band of her wavy
lines, a real brass balance scale on it), graphics-only scenes, one tech moment (an Instagram story poll on a phone),
readable words on pills, one accent buyers change (slate blue; ink is B's tone).

Story (5 beats): hook "which one are you?" / problem: two versions, can't pick / product: A, then B / proof: even my
followers are split 48-52 / CTA: comment "A" or "B".
Scenes (14 s; graphics-only: 2, 6; tech: 6):
 1 0.0  diagonal split, A clip above, B below; giant A and B letters land on their halves; "which one are you?"
 2 1.8  STAGE, no video: the balance scale drops onto the marble; an A sticker lands on one pan, B on the other;
        "two versions" + "[two very different moods]"
 3 3.4  two-tone strip slice (slate/ink) into A full frame; the A sticker is carried to the corner; A: [name + word]
 4 5.2  STAGE: A in a round window lands on the left pan (scale tips to A), then B on the right (tips to B) -
        the one main action; the camera dives into B's window...
 5 7.0  ...B full frame; B sticker; B: [name + word]; underline + burst
 6 8.6  STAGE, tech: a hand holds a phone: an IG story poll, bars fill 48 / 52; "even my followers can't pick"
 7 10.2 A and B in alternating strips that sort themselves into a half-and-half split; "or both?"
 8 11.8 CTA: the hand picks one; a marker circle round it; Comment / "A" or "B" / [both in my shop]
Usage: python build/motion_04.py [seconds ...]  ->  04-a-or-b/preview/motion-test.mp4 (or a test sheet)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
import play_extra as X
from story4 import roundwin, diagonal
from collage_kit import doodle, doodle_on
from motion_b2 import Clip, put, render, torn_band, camera, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (28, 27, 26), (246, 241, 232); SLATE = (74, 96, 128)       # SLATE = the accent buyers change
PHONE = 'Graphite Smartphone With Green Screen-38.png'
DIR = '04-a-or-b'
PAN = {'level': ((0.183, 0.70), (0.85, 0.70)), 'tilt': ((0.167, 0.745), (0.84, 0.64))}   # pan centres (share of w, h)

def setup():
    g = {'c': {'A': Clip('IMG_1422', 3.0), 'A2': Clip('IMG_1420', 0.5), 'B': Clip('IMG_1418', 2.0, 6.0), 'B2': Clip('IMG_1464', 1.0),
               'pick': Clip('IMG_1401', 0.5, 5.0)}}
    marble = ImageOps.fit(S.raw('images', 'Soft veined white marble texture-1.png'), (W, H)).convert('RGBA')
    wav = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', 'Hand-drawn wavy line pattern-20.png')), SLATE, CRM).convert('RGBA')
    marble.alpha_composite(torn_band(wav, (W + 40, 380), 7, 't', 20), (-20, H - 360)); g['stage'] = marble
    sc = P.raw_cut('Level vintage brass balance scale-105.png', 980); g['scale'] = P.style_object(sc, 'smalldots', SLATE, scale=0.25, strength=0.5)
    st = P.raw_cut('Tilted brass balance scale-124.png', 980); g['tiltA'] = P.style_object(st, 'smalldots', SLATE, scale=0.25, strength=0.5)
    g['tiltB'] = P.style_object(ImageOps.mirror(st), 'smalldots', SLATE, scale=0.25, strength=0.5)
    g['tagA'] = P.pill_m('[Copper]', 60, SLATE, CRM); g['tagB'] = P.pill_m('[Mint]', 60, INK, CRM)          # the versions' names, editable
    g['noteA2'] = P.sticky('[copper +\ncordless]', 280, pin='pin-head-black'); g['noteB2'] = P.sticky('[mint +\nsteam]', 280, pin='pin-head-cream')
    g['q1'] = P.caption('which one', 150, SLATE); g['q2'] = P.caption('are you?', 150, INK)
    g['two'] = P.caption('two versions', 130, SLATE); g['moods'] = P.pill_m('[two very different moods]', 50, INK, CRM)
    g['nameA'] = P.pill_m('A: [Copper. Cordless.]', 58, SLATE, CRM); g['nameB'] = P.pill_m('B: [Mint. Steam-clean.]', 58, INK, CRM)
    g['even'] = P.pill_m('even my followers', 54, INK, CRM); g['cant'] = P.caption("can't pick", 140, SLATE)
    g['both'] = P.caption('or both?', 170, SLATE)
    g['comment'] = P.caption('Comment', 180, SLATE, 'stripes'); g['kw'] = P.pill_m('"A" or "B"', 64, CRM, INK); g['shop'] = P.pill_m('[both in my shop]', 50, INK, CRM)
    g['d_arrow'] = doodle('arrow', 9, 250, WHITE); g['d_burst'] = doodle('burst', 2, 700, CRM)
    g['noteA'] = P.sticky('[so light\nyou forget\nit is on]', 330, pin='pin-head-black')
    g['d_arrowS'] = doodle('arrow', 2, 200, INK)
    return g

def scale_at(g, im, t, which, c=(540, 1150), k=1.0):
    """The scale with its pans; returns the pan centres in screen coordinates."""
    s = g[which]; put(im, s, c, k)
    pans = PAN['level'] if which == 'scale' else PAN['tilt'] if which == 'tiltA' else tuple((1 - x, y) for x, y in reversed(PAN['tilt']))
    return [(c[0] + (px - 0.5) * s.width * k, c[1] + (py - 0.5) * s.height * k - 40 * k) for px, py in pans]

def stage2(g, t):
    im = g['stage'].copy(); k = back_out(seg(t, 1.8, 2.1), 1.5)
    pans = scale_at(g, im, t, 'scale', (540, lerp(-600, 1150, k)))
    for i, (s, t0) in enumerate(((g['noteA2'], 2.2), (g['noteB2'], 2.45))):
        d = back_out(seg(t, t0, t0 + 0.3), 1.6)
        if d > 0: put(im, s, (pans[i][0] + (40, -40)[i], lerp(-300, pans[i][1] - 110, d)), 1, (-8, 8)[i])
    P.say(im, g['two'], t, 1.95, (540, 420), -2); P.say(im, g['moods'], t, 2.5, (540, 560), 1)
    return im

def stage4(g, t):
    """Scene 4: A's window lands on its pan (tips to A), then B's (tips to B); the camera dives into B."""
    c = g['c']; im = g['stage'].copy(); which = 'scale' if t < 5.55 else 'tiltA' if t < 6.15 else 'tiltB'
    bounce = 10 * math.sin((t - 5.55) * 30) * (1 - seg(t, 5.55, 5.8)) if t < 6.15 else 10 * math.sin((t - 6.15) * 30) * (1 - seg(t, 6.15, 6.4))
    pans = scale_at(g, im, t, which, (540, 1150 + bounce))
    for i, (cl, t0) in enumerate(((c['A2'], 5.25), (c['B2'], 5.85))):
        d = back_out(seg(t, t0, t0 + 0.3), 1.5)
        if d <= 0: continue
        p = (pans[i][0], lerp(-300, pans[i][1] - 200, d)); win = roundwin(cl.at(t - t0, (330, 330)), 330); put(im, win, p)
        put(im, (g['tagA'], g['tagB'])[i], (p[0], p[1] + 200), 0.8, (-4, 4)[i])
    doodle_on(im, t, 5.6, g['d_arrowS'], (300, 520), -120, 6.1)
    if t >= 6.5: im = camera(im, (pans[1][0], pans[1][1] - 200), lerp(1, 5.5, ease(seg(t, 6.5, 7.0)) ** 2))
    return im

def stage6(g, t):
    c = g['c']; im = g['stage'].copy(); sw, sh = P.screen_size(PHONE, 600)
    scr = c['B2'].at(t - 8.6, (sw, sh)).copy(); p = S.fitw(X.poll('A', 'B', 0.48, 700, ease(seg(t, 9.1, 9.7)), 'which one?'), int(sw * 0.96))
    scr.alpha_composite(p, (int((sw - p.width) / 2), int(sh * 0.48)))
    put(im, P.on_screen(PHONE, 600, scr), (540, lerp(2300, 1080, ease(seg(t, 8.6, 8.95)))), 1, -4)   # the phone stands on its own (never a hand)
    P.say(im, g['even'], t, 8.8, (500, 300), -2); P.say(im, g['cant'], t, 9.0, (500, 440), -3)
    return im

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the two versions as video overlays sliding in
        im = g['stage'].copy()
        for i, (cl, x0, x1, y, r, t0) in enumerate(((c['A'], -500, 300, 980, -5, 0.0), (c['B'], W + 500, 780, 1040, 5, 0.15))):
            x = lerp(x0, x1, back_out(seg(t, t0, t0 + 0.4), 1.3)); put(im, X.clip_card(cl.at(t, (430, 700)), 430, 700, 16, r, 30), (x, y + 10 * math.sin(t * 3 + i)))
            P.say(im, (g['tagA'], g['tagB'])[i], t, t0 + 0.45, (x1, y + 420), (-3, 3)[i])
        P.say(im, g['q1'], t, 0.1, (540, 330), -2); P.say(im, g['q2'], t, 0.4, (540, 490), -2)
        if t > 1.5: im = diagonal(im, stage2(g, t), seg(t, 1.5, 1.8))
        return im
    if t < 3.4:                                                    # 2: the stage, no video
        im = stage2(g, t)
        if t > 3.1: im = X.slice_h(im, c['A'].at(max(0, t - 3.4)), seg(t, 3.1, 3.4), (SLATE, INK))
        return im
    if t < 5.2:                                                    # 3: A full frame; the A sticker carried to the corner
        im = c['A'].at(max(0, t - 3.4))
        P.say(im, g['nameA'], t, 3.6, (580, 1380), -2); doodle_on(im, t, 3.9, g['d_arrow'], (360, 980), -30); P.say(im, g['noteA'], t, 4.2, (820, 640), 6)
        if t > 4.9: im = diagonal(im, stage4(g, t), seg(t, 4.9, 5.2))
        return im
    if t < 7.0: return stage4(g, t)                                # 4: the scale tips to A, then B; dive into B
    if t < 8.6:                                                    # 5: B full frame
        im = c['B'].at(t - 7.0 + 2.0); doodle_on(im, t, 7.25, g['d_burst'], (560, 1330), 0)      # one burst, BEHIND the name
        P.say(im, g['nameB'], t, 7.3, (560, 1330), 2)
        if t > 8.3: im = X.slice_v(im, stage6(g, t), seg(t, 8.3, 8.6), (INK, SLATE))
        return im
    if t < 10.2:                                                   # 6: the poll on a phone
        im = stage6(g, t)
        if t > 9.9: im = X.slice_h(im, X.interleave(c['A'].at(t), c['B'].at(t), 0, 6, 14, INK), seg(t, 9.9, 10.2), (SLATE, INK))
        return im
    if t < 11.8:                                                   # 7: strips sort into a half-and-half split
        im = X.interleave(c['A'].at(t - 6.0), c['B'].at(t - 6.0), seg(t, 10.3, 11.0), 6, 14, INK); s = ease(seg(t, 11.0, 11.2))
        if s > 0: put(im, g['tagA'], (270, 360), s, -4); put(im, g['tagB'], (810, 360), s, 4)
        P.say(im, g['both'], t, 11.05, (540, 1000), -3)
        return im
    im = c['pick'].at(t - 11.8)                                     # 8: CTA, the hand picks one
    P.say(im, g['comment'], t, 12.1, (520, 1140), -3); P.say(im, g['kw'], t, 12.4, (520, 1290), 2); P.say(im, g['shop'], t, 12.6, (520, 1400), -2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render('04', fr, 14.0, out); X.strip_sheet(DIR, 14)

if __name__ == '__main__':
    main()
