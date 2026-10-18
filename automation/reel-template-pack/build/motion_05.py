"""#05 Details you'd miss in a photo, motion test (2026-10-18), built the #09/#10/#12 round 3 way (story5.py).
World: a photographer's contact sheet: cream parchment with the buyer's stills as film frames, details ringed in
teal grease-pencil marker (her doodle frames), real woven care label and push pins. Accent buyers change: deep teal.
Home bases: the buyer's close-ups + the contact-sheet stage (new setup each visit).

Story (5 beats): hook "details you'd miss in a photo" / problem: the shop photo looks flat / product: four close-ups /
proof: up close it's [made well] / CTA: comment [KEYWORD].
Scenes (14 s; graphics-only: 2, 4; tech: 2):
 1 0.0  extreme close-up (detail 1) full frame; a teal marker ring draws round it; "details" / "you'd miss" + pill
 2 1.6  STAGE, tech: a phone lies on the contact sheet showing the flat shop photo; "the photo:" / "looks... fine?"
        sticky; the camera dives into the screen...
 3 3.2  ...detail 1 full frame: 01 sticker, [what it is] pill, an arrow AT it
 4 4.8  STAGE, no video: the contact sheet, four detail stills as film frames; the marker rings frame 02 and the
        camera zooms into it (Prezi)...
 5 6.2  ...detail 2 full frame: 02 sticker, pill, underline
 6 7.6  detail 3 assembles from three tall strips (alternate up / down); 03 sticker + pill
 7 9.0  detail 4 full frame; a real woven care label swings in with the detail stitched ON it (04)
 8 10.4 pull back: the whole product in the centre frame of the sheet, the four details pinned round it, each ringed,
        numbered, arrows to the product
 9 12.0 CTA: the whole product full frame; Comment / "[KEYWORD]" / [Product name]
Usage: python build/motion_05.py [seconds ...]  ->  05-details/preview/motion-test.mp4 (or a test sheet)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
import play_extra as X
from story4 import diagonal
from collage_kit import doodle, doodle_on
from motion_b2 import Clip, put, render, camera, torn_band, ease, back_out, seg, lerp, lerp2, W, H, WHITE

INK, CRM = (28, 27, 26), (246, 241, 232); TEAL = INK; LIGHT = X.BUTTER   # her palette: butter + ink (buyers change them)
X.use_type(LIGHT, TEAL); X.enable_holds()
HOLDS = [(1.3, 1.35), (2.65, 0.95), (4.45, 0.9), (5.7, 0.85), (7.55, 0.8), (8.95, 0.7), (10.05, 1.3), (11.95, 1.25), (13.95, 0.3)]   # reading time
PHONE = 'Graphite Smartphone With Green Screen-38.png'
DIR = '05-details'
DET = [('IMG_1414', 4.0), ('IMG_1421', 5.0), ('IMG_1457', 1.5), ('IMG_1459', 0.5)]; WHOLE = ('IMG_1422', 3.0)
SLOTS = [(290, 790), (790, 810), (290, 1330), (790, 1310)]               # film frames on the sheet (centres)
FW, FH = 380, 470

def frame_card(im, n, w=FW, h=FH):
    """A still as a film frame on the contact sheet: white border, frame number in marker underneath."""
    c = Image.new('RGBA', (w + 28, h + 84), (252, 250, 245, 255)); c.alpha_composite(ImageOps.fit(im, (w, h)).convert('RGBA'), (14, 70))
    ImageDraw.Draw(c).text((24, 38), f'0{n}', font=S.F(S.HAND, 50), fill=INK, anchor='lm'); return C.shadow(c, (6, 10), 10, 90)

def setup():
    g = {'c': {f'd{i}': Clip(n, t0) for i, (n, t0) in enumerate(DET)}}; g['c']['whole'] = Clip(*WHOLE); g['c']['cta'] = Clip(WHOLE[0], WHOLE[1] + 1.0)
    pc = S.raw('images', 'Blank vintage cream postcard-111.png'); w_, h_ = pc.size
    paper = ImageOps.fit(pc.crop((int(w_ * 0.1), int(h_ * 0.12), int(w_ * 0.9), int(h_ * 0.88))), (W, H)).convert('RGBA')
    dots = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', 'Hand-drawn black dot pattern-21.png')), (226, 200, 118), LIGHT)   # soft dots so the words read ON the band.convert('RGBA')
    paper.alpha_composite(torn_band(dots, (W + 40, 250), 3, 'tb', 18), (-20, 225))   # the words sit ON this band (her note)
    g['sheet'] = paper
    g['stills'] = [S.footage(d, (FW, FH)) for d in DET]; g['cards'] = [frame_card(s, i + 1) for i, s in enumerate(g['stills'])]
    g['nums'] = [P.sticker(f'0{i + 1}', 64, TEAL, WHITE, 'circle') for i in range(4)]
    g['details'] = P.caption('details', 190, X.WINE); g['miss'] = P.caption("you'd miss", 150, INK); g['inphoto'] = P.pill_m('in a photo', 60, TEAL, CRM)
    g['photo'] = P.caption('the photo:', 140, INK); g['fine'] = P.sticky('looks...\nfine?', 360, pin='pin-head-black')
    g['upclose'] = P.caption('up close:', 140, INK)
    g['p'] = [P.pill_m(t, 54, INK, CRM) for t in ('[brushed copper finish]', '[see-through dust bin]', '[one-touch controls]')]
    tag = P.raw_cut('Blank kraft hang tag with twine-116.png', 480).copy(); d = ImageDraw.Draw(tag)     # a kraft hang tag reads at a glance
    tag.alpha_composite(P.sticker('04', 64, TEAL, WHITE, 'circle'), (int(tag.width / 2 - 60), int(tag.height * 0.42)))
    d.multiline_text((tag.width / 2, tag.height * 0.74), '[LED head\nshows\nthe dust]', font=S.F(P.MONT, 52), fill=INK, anchor='mm', align='center')
    g['label'] = P.die_cut(tag, 8)
    g['seen'] = P.caption('now you know', 110, INK)
    g['comment'] = P.caption('Comment', 180, TEAL, 'stripes'); g['kw'] = P.pill_m('"[KEYWORD]"', 64, CRM, INK); g['name'] = P.pill_m('[Product name]', 54, TEAL, CRM)
    g['ring'] = doodle('frame', 0, 760, TEAL); g['ringS'] = doodle('frame', 0, 520, TEAL); g['ringW'] = doodle('frame', 0, 700, WHITE)
    g['d_arrow'] = doodle('arrow', 9, 260, WHITE); g['d_under'] = doodle('under', 0, 600, CRM)
    g['arrows'] = [doodle('arrow', 0, 150, TEAL) for i in range(4)]
    return g

def stage2(g, t):
    im = g['sheet'].copy(); k = back_out(seg(t, 1.6, 1.9), 1.5)       # the whole screen is one video slot: the buyer's listing
    put(im, P.on_screen(PHONE, 620, g['c']['whole'].at(t - 1.6)), (560, lerp(2300, 1080, k)), 1, -6)
    P.say(im, g['photo'], t, 1.7, (540, 350), -3); P.say(im, g['fine'], t, 2.1, (250, 1350), -8)
    if t > 2.7: im = camera(im, (560, 1080), lerp(1, 3.2, ease(seg(t, 2.7, 3.2)) ** 2))
    return im

def stage4(g, t):
    im = g['sheet'].copy()
    for i, (cd, xy) in enumerate(zip(g['cards'], SLOTS)): put(im, cd, xy, back_out(seg(t, 4.8 + i * 0.1, 5.1 + i * 0.1), 1.5), (-3, 2, 3, -2)[i])
    P.say(im, g['upclose'], t, 5.0, (540, 350), -2)
    doodle_on(im, t, 5.4, g['ringS'], SLOTS[1], 4)
    if t > 5.75: im = camera(im, SLOTS[1], lerp(1, 3.4, ease(seg(t, 5.75, 6.2)) ** 2))
    return im

def stage8(g, t):
    """Pull back: the whole product in the middle, the four details pinned round it, ringed and numbered."""
    c = g['c']; im = g['sheet'].copy(); u = ease(seg(t, 10.15, 10.65))
    cw, ch = int(lerp(W, 420, u)), int(lerp(H, 600, u)); v = c['whole'].at(t - 10.4, (cw, ch))
    put(im, X.clip_card(v, cw, ch, int(16 * u)), lerp2((W / 2, H / 2), (540, 990), u), 1, 2 * u)
    corners = [(190, 640), (890, 660), (190, 1330), (890, 1310)]
    for i, xy in enumerate(corners):
        k = back_out(seg(t, 10.8 + i * 0.12, 11.1 + i * 0.12), 1.6)
        if k <= 0: continue
        put(im, S.fitw(g['cards'][i], 290), xy, k, (-6, 5, 4, -5)[i])
    for i, (xy, r) in enumerate((((350, 820), -40), ((730, 840), 220), ((350, 1180), 40), ((730, 1160), 140))):
        doodle_on(im, t, 11.2 + i * 0.1, g['arrows'][i], xy, r)
    P.say(im, g['seen'], t, 11.3, (540, 350), -2)
    return im

def frame(g, t):
    c = g['c']
    if t < 1.6:                                                    # 1: the extreme close-up, ringed
        im = c['d0'].at(t)                                   # no ring on the footage (her note)
        P.say(im, g['details'], t, 0.15, (540, 1160), -3); P.say(im, g['miss'], t, 0.45, (560, 1320), -2); P.say(im, g['inphoto'], t, 0.8, (560, 1450), 2)
        if t > 1.35: im = diagonal(im, stage2(g, t), seg(t, 1.35, 1.6))
        return im
    if t < 3.2: return stage2(g, t)                                 # 2: the flat shop photo on a phone; dive into it
    if t < 4.8:                                                    # 3: detail 1
        im = camera(c['d0'].at(t - 3.2 + 1.6), (540, 900), lerp(1.4, 1, ease(seg(t, 3.2, 3.5))))
        put(im, g['nums'][0], (200, 360), back_out(seg(t, 3.3, 3.6)) * 1.4, -8); P.say(im, g['p'][0], t, 3.5, (540, 1380), -2)
        doodle_on(im, t, 3.8, g['d_arrow'], (300, 1050), -20)
        if t > 4.5: im = X.slice_h(im, stage4(g, t), seg(t, 4.5, 4.8), (TEAL, INK))
        return im
    if t < 6.2: return stage4(g, t)                                 # 4: the contact sheet; zoom into frame 02
    if t < 7.6:                                                    # 5: detail 2
        im = camera(c['d1'].at(t - 6.2), (540, 900), lerp(1.3, 1, ease(seg(t, 6.2, 6.5))))
        put(im, g['nums'][1], (200, 360), back_out(seg(t, 6.3, 6.6)) * 1.4, 6); P.say(im, g['p'][1], t, 6.5, (540, 1360), 2)
        doodle_on(im, t, 6.8, g['d_under'], (540, 1460), -2)
        return im
    if t < 9.0:                                                    # 6: detail 3 assembles from three tall strips
        im = c['d1'].at(t - 6.2); new = c['d2'].at(t - 7.6); sw = W // 3
        for i in range(3):
            u = ease(seg(t, 7.6 + i * 0.1, 7.95 + i * 0.1)); y = lerp((-H, H, -H)[i], 0, u)
            im.alpha_composite(new.crop((i * sw, 0, (i + 1) * sw if i < 2 else W, H)), (i * sw, int(y)))
        if t > 8.0:
            put(im, g['nums'][2], (200, 360), back_out(seg(t, 8.0, 8.3)) * 1.4, -6); P.say(im, g['p'][2], t, 8.15, (540, 1370), -2)
        return im
    if t < 10.4:                                                   # 7: detail 4; the care label swings in with it stitched on
        im = c['d3'].at(t - 9.0); sw_ = 10 * math.sin(t * 4) * (1 - seg(t, 9.4, 10.2))
        put(im, g['label'], (lerp(-400, 290, back_out(seg(t, 9.1, 9.45), 1.4)), 1050), 1, -6 + sw_)
        if t > 10.1: im = X.slice_v(im, stage8(g, t), seg(t, 10.1, 10.4), (TEAL, INK))
        return im
    if t < 12.0: return stage8(g, t)                                # 8: pull back to the whole
    im = c['cta'].at(t - 12.0)                                      # 9: CTA
    P.say(im, g['comment'], t, 12.2, (520, 1130), -3); P.say(im, g['kw'], t, 12.5, (520, 1280), 2); P.say(im, g['name'], t, 12.7, (520, 1400), -2)
    return im

def main():
    g = setup(); fr = lambda t: frame(g, t); out = S.E.PACK / DIR / 'preview'
    if len(sys.argv) > 1:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[1:]]; sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render('05', X.with_holds(fr, HOLDS), 14.0 + sum(h for _, h in HOLDS), out); X.strip_sheet(DIR, 23)

if __name__ == '__main__':
    main()
