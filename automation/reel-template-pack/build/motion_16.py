"""#16 What it feels like, motion test round 2 (2026-10-18). Round 1 (the patchwork quilt + touch objects) was
disliked entirely. Round 2, calmer, in the approved #08/#09 way: a calm light-blue paper stage, and ONE carried element
that belongs to touch for any product: a real sheet of bubble wrap that peels off the clip like unwrapping it.
Feeling words are the buyer's own, one per shot, on highlight boxes. Palette: light blue + pink (ink outlines).
Tech: the satisfying clip on a phone standing on the paper (whole screen = one video slot), "sound on".
Story (5 beats): hook "what my [product] feels like" / problem: you can't touch it through a screen / product: the feel,
shot by shot / proof: three words, pinned / CTA: comment [KEYWORD].
Scenes (graphics-only: 5; tech: 3):
 1 0.0  the squeeze clip under a sheet of bubble wrap that peels away; "what it feels like" + [my velvet throw]
 2 1.8  close-up 1, full frame; [soft] + one underline
 3 3.4  PAPER: a phone stands on the paper playing the satisfying clip; "sound on" + [you'll hear it]; one burst
        behind the phone
 4 5.0  the bubble wrap slides back over and peels off again onto close-up 2 (the carried element); [smooth]
 5 6.6  PAPER, no video: three photo cards pinned in a row, each with its word: the recap; "in three words"
 6 8.2  the whole product, pulled back; one arrow up from [Product name] to the centre
 7 9.8  CTA: Comment / [KEYWORD]
Usage: python build/motion_16.py [seconds ...]  ->  16-what-it-feels-like/preview/motion-test.mp4 (or a test sheet)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
import play_extra as X
from story4 import swipe, diagonal
from collage_kit import doodle, doodle_on
from motion_b2 import Clip, put, render, camera, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (24, 23, 22), (246, 241, 232); BLUE, PINK = X.WINE, X.BUTTER            # her palette: butter + wine (off blue: her note)
X.use_type(PINK, INK); X.enable_holds()
DIR = '16-what-it-feels-like'
PHONE = 'Graphite Smartphone With Green Screen-38.png'
PINS = Path(__file__).resolve().parent.parent / 'assets' / 'props'
HOLDS = [(1.55, 1.1), (3.15, 0.6), (4.75, 1.1), (6.35, 0.8), (7.95, 1.3), (9.55, 0.9), (12.45, 0.5)]

def setup():
    g = {'c': {'squeeze': Clip('IMG_1403', 0.5), 'close': Clip('IMG_1406', 0.0), 'drape': X.Window(Clip('IMG_1409', 0.0), 0.0, 3.0),
               'close2': X.Window(Clip('IMG_1407', 0.0), 0.5, 3.5), 'whole': X.Window(Clip('IMG_1398', 0.0), 0.0, 3.0), 'cta': X.Window(Clip('IMG_1398', 0.0), 3.0, 6.0)}}
    tis = ImageOps.grayscale(S.raw('images', 'Blush Pink Tissue Paper Texture-9.png'))
    g['paper'] = ImageOps.fit(ImageOps.colorize(ImageOps.autocontrast(tis), (222, 200, 128), X.BUTTER), (W, H)).convert('RGBA')
    bw = ImageOps.fit(S.raw('images', 'Clear bubble wrap texture-11.png'), (W + 200, H + 200)).convert('RGBA')
    bw.putalpha(ImageOps.grayscale(bw.convert('RGB')).point(lambda v: int(40 + v * 0.42)))     # see-through plastic
    g['wrap'] = bw
    g['what'] = P.caption('what it', 170, WHITE); g['feels'] = P.caption('feels like', 230, WHITE); g['mine'] = X.hl('[my velvet throw]', 62, PINK)
    g['soft'] = X.hl('[soft]', 130, PINK); g['smooth'] = X.hl('[smooth]', 130, WHITE); g['cozy'] = X.hl('[cozy]', 84, PINK)
    g['under'] = doodle('under', 0, 480, PINK)
    g['sound'] = P.caption('sound on', 170, INK); g['hear'] = X.hl("[you'll hear it]", 58, WHITE); g['burst'] = doodle('burst', 2, 980, BLUE)
    g['three'] = P.caption('in three words', 130, INK)
    stills = [S.footage(c_, (300, 380)) for c_ in (('IMG_1406', 1.0), ('IMG_1407', 2.0), ('IMG_1409', 1.0))]
    g['cards'] = []
    for i, st in enumerate(stills):
        cd = X.clip_card(st, 300, 380, 14, (-5, 3, -3)[i]); pin = S.fitw(Image.open(PINS / 'pin-head-black.png').convert('RGBA'), 54)
        cd.alpha_composite(pin, (int(cd.width / 2 - 27), 10)); g['cards'].append(cd)
    g['words3'] = [X.hl(w_, 56, (PINK, WHITE, PINK)[i]) for i, w_ in enumerate(('[soft]', '[smooth]', '[cozy]'))]
    g['name'] = X.hl('[Product name]', 62, PINK)
    g['comment'] = P.caption('Comment', 190, INK); g['kw'] = X.hl('"[KEYWORD]"', 64, WHITE)
    return g

def wrap_over(im, g, u, t, direction=1):
    """The bubble wrap sheet over the frame, peeled away diagonally by u (0 = covering, 1 = gone)."""
    if u >= 1: return im
    sheet = g['wrap'].crop((60 + int(20 * math.sin(t)), 60, 60 + W + int(20 * math.sin(t)), 60 + H)); m = Image.new('L', (W, H), 0)
    x = lerp(-H * 0.6, W + 200, ease(u)) if direction > 0 else lerp(W + H * 0.6, -200, ease(u))
    pts = [(x, 0), (W + 2000, 0), (W + 2000, H), (x + H * 0.6, H)] if direction > 0 else [(x, 0), (-2000, 0), (-2000, H), (x - H * 0.6, H)]
    ImageDraw.Draw(m).polygon(pts, fill=255); sheet.putalpha(Image.composite(sheet.split()[3], Image.new('L', (W, H), 0), m))
    edge = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(edge).line([pts[0], pts[3]], fill=(255, 255, 255, 230), width=10)
    sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sh).line([pts[0], pts[3]], fill=(0, 0, 0, 90), width=40)
    out = im.copy(); out.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18))); out.alpha_composite(sheet); out.alpha_composite(edge); return out

def frame(g, t):
    c = g['c']
    if t < 1.8:                                                    # 1: the bubble wrap peels off the squeeze clip
        cl = (c['squeeze'], c['close'], c['close2'], c['drape'])[min(3, int(t / 0.45))]; im = cl.at(t % 0.45 + 0.3)   # fast cuts: the hook
        P.say(im, g['what'], t, 0.05, (500, 330), -3); P.say(im, g['feels'], t, 0.25, (560, 540), -2); P.say(im, g['mine'], t, 0.6, (540, 740), 2)
        X.sparkles(im, t, 0.35, [(150, 300), (950, 380), (990, 700), (110, 760)], BLUE, 160)
        if t > 1.6: im = swipe(im, c['close'].at(0), seg(t, 1.6, 1.8))
        return im
    if t < 3.4:                                                    # 2: soft
        im = c['close'].at(t - 1.8); P.say(im, g['soft'], t, 1.95, (380, 1330), -3); doodle_on(im, t, 2.3, g['under'], (380, 1440), -2)
        if t > 3.2: im = diagonal(im, stage3(g, t), seg(t, 3.2, 3.4))
        return im
    if t < 5.0:
        im = stage3(g, t)
        return im
    if t < 6.6:                                                    # 4: the wrap peels off again onto close-up 2
        u = ease(seg(t, 5.0, 5.6)); im = g['paper'].copy() if u < 1 else c['close2'].at(t - 5.0)
        if u < 1:
            r = lerp(260, 1150, u); m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse((540 - r, 960 - r, 540 + r, 960 + r), fill=255)
            im.paste(c['close2'].at(t - 5.0), (0, 0), m)
        P.say(im, g['smooth'], t, 5.6, (640, 1330), 3)
        if t > 6.4: im = swipe(im, stage5(g, t), seg(t, 6.4, 6.6))
        return im
    if t < 8.2:
        im = stage5(g, t)
        if t > 8.0: im = diagonal(im, c['whole'].at(0), seg(t, 8.0, 8.2))
        return im
    if t < 9.8:                                                    # 6: the whole product, pulled back
        im = camera(c['whole'].at(t - 8.2), (540, 960), lerp(1.6, 1, ease(seg(t, 8.2, 8.9))))
        P.say(im, g['name'], t, 8.6, (540, 1380), -2)
        if t > 9.6: im = swipe(im, c['cta'].at(0), seg(t, 9.6, 9.8), -1)
        return im
    im = c['cta'].at(t - 9.8)                                        # 7: CTA
    P.say(im, g['comment'], t, 9.9, (540, 1000), -3); P.say(im, g['kw'], t, 10.15, (540, 1220), 2)
    return im

def stage3(g, t):
    im = g['paper'].copy(); k = ease(seg(t, 3.4, 3.75)); doodle_on(im, t, 3.8, g['burst'], (540, 1150), 0)
    put(im, P.on_screen(PHONE, 560, g['c']['drape'].at(t - 3.4)), (540, lerp(2400, 1150, k)), 1, -4)
    P.say(im, g['sound'], t, 3.7, (540, 330), -3); P.say(im, g['hear'], t, 4.0, (540, 490), 2)
    return im

def stage5(g, t):
    im = g['paper'].copy(); P.say(im, g['three'], t, 6.7, (540, 380), -2)
    for i, (cd, wd, x) in enumerate(zip(g['cards'], g['words3'], (220, 540, 860))):
        k = back_out(seg(t, 6.8 + i * 0.2, 7.1 + i * 0.2), 1.5)
        if k > 0: put(im, cd, (x, lerp(-400, 950 + (i % 2) * 60, k)), 1)
        P.say(im, wd, t, 7.1 + i * 0.2, (x, 1250 + (i % 2) * 60), (-3, 3, -2)[i])
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        T = 12.5 + sum(h for _, h in HOLDS); render('16', X.with_holds(fr, HOLDS), T, out); X.strip_sheet(DIR, int(T) + 1)

if __name__ == '__main__':
    main()
