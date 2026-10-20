"""05 Details you'd miss in a photo, approved 2026-10-19 (motion test build/motion_05.py, after her note: the dot band
reaches the top). FULLY EDITABLE build (2026-10-20, build/editable.py): every word is CapCut text (DM Serif Display
built-in words, last word Italic, and the sticker numbers; Montserrat for the detail lines, the sticky note, the tag's
words, the film-frame numbers, the keyword and the product name, the [brackets] on CapCut's text background); the
arrows, ring and underline are Scrolly Doodles letters (recolour like text); the cream contact-sheet stage is CapCut's
background colour under a colourless postcard grain; the phone, the film frames, the sticky note, the kraft tag and the
number stickers are real photos (or paper pieces) moving on keyframes; the five clips are real clip layers (placeholder
cards until the buyer's clips go in): four close-ups (full frame, in the film frames, in strips) and the whole product
(on the phone, as the card in the middle, full frame at the end).
CapCut limits: the butter dot band along the top is a picture (recolour with Adjust > HSL), and the stage's camera
moves (into the phone, into frame 02) move every piece of the stage on keyframes, the grain stays put; the strip-slice
transitions are tinted strips closing over the old scene and sliding apart (pictures, not slices of the scene); the
diagonal wipe is a diagonal slide; the middle card keeps the clip's upright shape (9:16) as it shrinks."""
import math
from PIL import Image, ImageDraw, ImageOps
import editable as Ed
from editable import at, still, pop_in, then, slide, enter
import editable_a as EA
import motion_05 as M
import motion_capcut as MC
import play as P
import play_extra as X
import collage as C
import storyboard_b2 as S
from motion_b2 import ease, back_out, seg, lerp, torn_band

SPEC = dict(num='05', title="Details you'd miss", subtitle='23 seconds. Five clips: four close-ups, then the whole product.',
            font='montserrat', dir='05-details', folder="Template 05 - Details you'd miss in a photo",
            project="05 Details you'd miss", cover_at=1.0,
            slots=[('Detail 1', 'As close as your phone will focus (stitching, texture...)'), ('Detail 2', 'A second detail, close'),
                   ('Detail 3', 'A third detail, close'), ('Detail 4', 'A fourth detail, close'),
                   ('The whole product', 'The whole product, upright, pulled back')],
            test_clips=list(M.DET) + [M.WHOLE])
W, H = 1080, 1920
INK, WHITE, CRM, BUTTER = M.INK, (255, 255, 255), M.CRM, X.BUTTER
STAGE = (238, 228, 206)                  # the postcard's cream
DETAILS = (('[brushed copper finish]', 'hand-stitched edges'), ('[see-through dust bin]', 'real brass buttons'),
           ('[one-touch controls]', 'double-lined inside'))

def word(x, y, t0, r=0.0): return pop_in(x, y, t0, r, 0.22, 1.8, 18)

def film_frame(k=1.0):
    """M.frame_card without the still or the number: (image, window size, window offset, number offset)."""
    w, h = int(M.FW * k), int(M.FH * k); b, top = int(14 * k), int(70 * k)
    c = Image.new('RGBA', (w + 2 * b, h + top + b), (252, 250, 245, 255)); c = C.shadow(c, (6, 10), 10, 90)
    pad = (c.width - (w + 2 * b)) // 2
    im, size, off = Ed.window(c, (pad + b, pad + top, pad + b + w, pad + top + h))
    return im, size, off, (pad + 24 * k + 30 * k - c.width / 2, pad + 38 * k - c.height / 2)

def disc(d=134, fill=INK):
    """P.sticker's circle without its number (the number is text)."""
    im = Image.new('RGBA', (d, d), (0, 0, 0, 0)); ImageDraw.Draw(im).ellipse((0, 0, d - 1, d - 1), fill=fill + (255,))
    return P.die_cut(im, 6, False)

def numbered(r, n, a, b, f):
    """The 0n sticker: a die-cut disc picture with the number as text on it."""
    r.art(f'sticker-{n}', disc(), a, b, 60 + n, f)
    r.serif(f'0{n}', 64, a, b, f, WHITE, None, italic_last=False)

def zoom(t, f0=1.0):
    """motion_b2.camera on a full-frame clip, focus (540, 900): scale f0 -> 1 over 0.3 s from t."""
    def f(ts):
        s = lerp(f0, 1, ease(seg(ts, t, t + 0.3))); y0 = min(max(900 - H / (2 * s), 0), H - H / s)
        return at(540, (960 - y0) * s, s)
    return f

def reel():
    g = M.setup(); r = Ed.Reel(M.HOLDS, 14.0)
    pc = S.raw('images', 'Blank vintage cream postcard-111.png'); w_, h_ = pc.size
    r.art('paper-grain', Ed.grain(pc.crop((int(w_ * 0.1), int(h_ * 0.12), int(w_ * 0.9), int(h_ * 0.88))), 0.22), 0, None, 1, still(540, 960))
    dots = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', 'Hand-drawn black dot pattern-21.png')), (226, 200, 118), BUTTER).convert('RGBA')
    band = torn_band(dots, (W + 40, 520), 3, 'b', 18); band_c = (band.width / 2 - 20 - (band.width - W - 40) / 2, band.height / 2 - 20 - (band.height - 520) / 2)
    def band_on(a, b, *moves): r.art('dot-band', band, a, b, 3, then(still(*band_c), *moves))

    # 1 (0-1.6) detail 1 full frame; "details / you'd miss" + [in a photo]; diagonal out at 1.35
    o1 = slide(1.35, 1.6, -W - 300, -420)
    r.clip(0, 0, 1.6, 10, then(still(540, 960), o1))
    r.serif('details', 175, 0.15, 1.6, then(word(540, 1160, 0.15, 3), o1), WHITE, INK)
    r.serif("you'd miss", 138, 0.45, 1.6, then(word(560, 1320, 0.45, 2), o1), INK, WHITE)
    r.boxed('in a photo', 60, 0.8, 1.6, then(pop_in(560, 1450, 0.8, -2), o1), INK)

    # 2 (1.35-3.2) STAGE, tech: the phone lies on the sheet showing the flat shop photo; "the photo:" / "looks... fine?";
    #   the camera dives into the screen
    cam2 = EA.zoom_into(2.7, 3.2, (560, 1080), 3.2)
    band_on(0, 3.2, cam2)
    im, _, _ = P.device(M.PHONE, 620); phone, ssize, soff = Ed.device_hole(P.die_cut(im, 8))
    ph = then(lambda ts: at(560, lerp(2300, 1080, back_out(seg(ts, 1.6, 1.9), 1.5)), 1, 6), cam2)
    r.clip(4, 1.35, 3.2, 20, Ed.child(ph, soff), size=ssize)
    r.art('phone', phone, 1.35, 3.2, 21, ph)
    r.serif('the photo:', 129, 1.7, 3.2, then(word(540, 350, 1.7, 3), cam2), INK, WHITE)
    full, blank = P.sticky('looks...\nfine?', 360, pin='pin-head-black'), P.sticky('', 360, pin='pin-head-black')
    off = MC.text_anchor(full, blank)
    nf = then(pop_in(250, 1350, 2.1, 8), cam2)
    r.art('note-fine', blank, 2.1, 3.2, 22, nf)
    r.plain('looks...\nfine?', 62, 2.1, 3.2, Ed.child(nf, off), INK)

    # 3 (3.2-4.8) detail 1 full frame (the camera settles); the 01 sticker, the first detail line, an arrow up at it
    r.clip(0, 3.2, 4.65, 30, zoom(3.2, 1.4), src=1.6)
    numbered(r, 1, 3.3, 4.65, lambda ts: at(200, 360, back_out(seg(ts, 3.3, 3.6)) * 1.4, 8))
    r.doodle('arrow', 0, 190, 3.8, 4.65, pop_in(540, 1215, 3.8, -90, 0.35), WHITE)
    r.boxed(DETAILS[0][0], 54, 3.5, 4.65, pop_in(540, 1380, 3.5, 2), INK, DETAILS[0][1])
    EA.strips(r, 'slice-1', 4.5, 4.8, (INK, (70, 66, 60)), 80)

    # 4 (4.65-6.2) STAGE, no video: the contact sheet, the four details as film frames; "up close:"; the marker ring
    #   round frame 02, and the camera zooms into it
    cam4 = EA.zoom_into(5.75, 6.2, M.SLOTS[1], 3.4)
    band_on(4.65, 6.2, cam4)
    frm, fsize, foff, noff = film_frame()
    for i, xy in enumerate(M.SLOTS):
        ff = then(lambda ts, i=i, xy=xy: at(xy[0], xy[1], back_out(seg(ts, 4.8 + i * 0.1, 5.1 + i * 0.1), 1.5), (3, -2, -3, 2)[i]), cam4)
        r.clip(i, 4.65, 6.2, 40 + 2 * i, Ed.child(ff, foff), size=fsize, src=1.0)
        r.art(f'film-{i + 1}', frm, 4.65, 6.2, 41 + 2 * i, ff)
        r.plain(f'0{i + 1}', 50, 4.65, 6.2, Ed.child(ff, noff), INK)
    r.serif('up close:', 129, 5.0, 6.2, then(word(540, 350, 5.0, 2), cam4), INK, WHITE)
    r.doodle('frame', 0, 520, 5.4, 6.2, then(pop_in(M.SLOTS[1][0], M.SLOTS[1][1], 5.4, -4, 0.35), cam4), INK)

    # 5 (6.2-7.6) detail 2 full frame; 02 sticker, the second line, an underline
    r.clip(1, 6.2, 8.15, 30, zoom(6.2, 1.3))
    numbered(r, 2, 6.3, 7.6, lambda ts: at(200, 360, back_out(seg(ts, 6.3, 6.6)) * 1.4, -6))
    r.boxed(DETAILS[1][0], 54, 6.5, 7.6, pop_in(540, 1360, 6.5, -2), INK, DETAILS[1][1])
    r.doodle('under', 0, 600, 6.8, 7.6, pop_in(540, 1460, 6.8, 2, 0.35), CRM)

    # 6 (7.6-9.0) detail 3 assembles from three tall strips (alternate down / up); 03 sticker, the third line
    for i in range(3):
        sw = W / 3
        def sf(ts, i=i): return at((i + 0.5) * sw, lerp((-H, H, -H)[i], 0, ease(seg(ts, 7.6 + i * 0.1, 7.95 + i * 0.1))) + 960)
        a, b = r.R(7.6), r.R(9.0); kf, pos, rot = r._kf(sf, a, b)
        r.L.clip(2, (a, b), 32 + i, pos, (2 * int(sw // 2) + 2, H), rot, kf, crop=(i / 3, 0, (i + 1) / 3, 1))
    numbered(r, 3, 8.0, 9.0, lambda ts: at(200, 360, back_out(seg(ts, 8.0, 8.3)) * 1.4, 6))
    r.boxed(DETAILS[2][0], 54, 8.15, 9.0, pop_in(540, 1370, 8.15, 2), INK, DETAILS[2][1])

    # 7 (9.0-10.4) detail 4 full frame; the kraft tag swings in with the 04 sticker and the detail written on it
    r.clip(3, 9.0, 10.25, 30, still(540, 960))
    raw = P.raw_cut('Blank kraft hang tag with twine-116.png', 480); tag = P.die_cut(raw.copy(), 8); d_ = disc().width
    def tf(ts):
        sw_ = 10 * math.sin(ts * 4) * (1 - seg(ts, 9.4, 10.2)); return at(lerp(-400, 290, back_out(seg(ts, 9.1, 9.45), 1.4)), 1050, 1, 6 - sw_)
    r.art('tag', tag, 9.0, 10.25, 50, tf)
    sk = (-60 + d_ / 2, raw.height * 0.42 + d_ / 2 - raw.height / 2)   # where M.setup stuck the 04 sticker
    r.art('sticker-4', disc(), 9.0, 10.25, 51, Ed.child(tf, sk))
    r.serif('04', 64, 9.0, 10.25, Ed.child(tf, sk), WHITE, None, italic_last=False)
    r.plain('[LED head\nshows\nthe dust]', 52, 9.0, 10.25, Ed.child(tf, (0, raw.height * 0.24)), INK, test='lined in\nsoft cotton')
    EA.strips(r, 'slice-2', 10.1, 10.4, (INK, (70, 66, 60)), 80, n=6, vertical=True)

    # 8 (10.25-12.0) pull back: the whole product as a card in the middle of the sheet, the four details pinned round
    #   it, arrows to the product; "now you know"
    band_on(10.25, 12.0)
    cw, ch = 420, 746
    cardim, csize, coff = EA.card_frame(cw, ch, 16, 0)
    def mid(ts):
        u = ease(seg(ts, 10.15, 10.65)); return at(540, lerp(960, 990, u), lerp(W / cw * 1.02, 1, u), -2 * u)
    r.clip(4, 10.25, 12.0, 60, Ed.child(mid, coff), size=csize, src=0.5)
    r.art('card-whole', cardim, 10.25, 12.0, 61, mid)
    k = 290 / (M.FW + 28 + 2 * 30); sf_, ssz, sof, snf = film_frame(k)
    for i, xy in enumerate(((190, 640), (890, 660), (190, 1330), (890, 1310))):
        ff = lambda ts, i=i, xy=xy: at(xy[0], xy[1], back_out(seg(ts, 10.8 + i * 0.12, 11.1 + i * 0.12), 1.6), (6, -5, -4, 5)[i])
        r.clip(i, 10.25, 12.0, 62 + 2 * i, Ed.child(ff, sof), size=ssz, src=1.5)
        r.art(f'film-s{i + 1}', sf_, 10.25, 12.0, 63 + 2 * i, ff)
        r.plain(f'0{i + 1}', 50 * k, 10.25, 12.0, Ed.child(ff, snf), INK)
    for i, ((x, y), rr) in enumerate((((350, 820), 40), ((730, 840), -220), ((350, 1180), -40), ((730, 1160), -140))):
        r.doodle('arrow', 0, 150, 11.2 + i * 0.1, 12.0, pop_in(x, y, 11.2 + i * 0.1, rr, 0.35), INK)
    r.serif('now you know', 101, 11.3, 12.0, word(540, 350, 11.3, 2), INK, WHITE)

    # 9 (12.0-end) CTA: the whole product full frame; Comment / "[KEYWORD]" / [Product name]
    r.clip(4, 12.0, None, 90, still(540, 960), src=1.0)
    r.serif('Comment', 166, 12.2, None, word(520, 1130, 12.2, 3), INK, WHITE)
    r.boxed('"[KEYWORD]"', 64, 12.5, None, pop_in(520, 1280, 12.5, -2), WHITE, '"DETAILS"')
    r.boxed('[Product name]', 54, 12.7, None, pop_in(520, 1400, 12.7, 2), INK, 'The Weekender Tote')
    return r

def layers():
    return reel().L
