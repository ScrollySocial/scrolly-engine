"""Storyboard stills for #2 Pack an order, built from Mercedes's real props (2026-10-17).
Real objects (box, flaps, peanuts, shreds, envelope, wax seal, closed box) with a playful layer (washi tape, a label
whose fields type in, coloured borders, words). The video spots show stand-in footage from her July clips.
Usage: python build/storyboard_02.py  ->  02-pack-an-order/storyboard/
"""
import math, random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import engine as E

OUT = E.PACK / '02-pack-an-order' / 'storyboard'; OUT.mkdir(parents=True, exist_ok=True)
PROPS = E.PACK / 'assets' / 'props'
W, H = 1080, 1920
ROSE = (212, 98, 127); INK = (24, 23, 22); WHITE = (255, 255, 255)
BG = (199, 209, 187, 255)          # soft sage backdrop (not white)
BLUE, BUTTER, SAGE, COBALT, TOMATO = (166, 206, 242), (250, 232, 120), (190, 214, 170), (52, 86, 196), (228, 88, 56)
SANS, SERIF, MONO = 'C:/Windows/Fonts/arial.ttf', E.font_file('7580184437816675601'), 'C:/Windows/Fonts/consola.ttf'
HAND = E.INKFREE
TONE = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p'
SCR = OUT / '_frames'; SCR.mkdir(exist_ok=True)

def F(p, px): return ImageFont.truetype(p, px)
def prop(n): return Image.open(PROPS / f'{n}.png').convert('RGBA')

def footage(clip, t, size):
    p = SCR / f'{clip}-{t}.png'
    if not p.exists():
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t), '-i', str(E.FOOTAGE / f'{clip}.MOV'), '-frames:v', '1',
                        '-vf', f'{TONE},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}', str(p)], check=True)
    return ImageOps.fit(Image.open(p).convert('RGBA'), size)

def word(img, xy, text, font, fill, anchor='la', shadow=False):
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(lay).text(xy, text, font=font, fill=fill, anchor=anchor)
    if shadow:
        s = Image.new('RGBA', img.size, (0, 0, 0, 0)); s.putalpha(lay.split()[3].filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.6)))
        img.alpha_composite(s)
    img.alpha_composite(lay)

def tape_words(img, c, small, big, rot=-3):
    """Words on a strip of white paper tape stuck to the box: small sans line + accent serif line."""
    strip = C.washi(760, 250, 'gingham', (BUTTER, WHITE), seed=17, alpha=250)
    d = ImageDraw.Draw(strip)
    cx = strip.width / 2; cy = strip.height / 2
    d.text((cx, cy - 50), small, font=F(SANS, 52), fill=INK, anchor='mm'); d.text((cx, cy + 44), big, font=F(SERIF, 96), fill=INK, anchor='mm')
    place(img, strip, c, rot)

def place(img, item, c, rot=0):
    it = item.rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def bordered(item, inner=WHITE, outer=ROSE, w1=14, w2=10):
    """A real object with a playful border: white, then a colour, like a sticker."""
    pad = w1 + w2 + 10
    a = Image.new('L', (item.width + 2 * pad, item.height + 2 * pad), 0); a.paste(item.split()[3], (pad, pad))
    a = a.point(lambda v: 255 if v > 100 else 0)
    r1 = a.filter(ImageFilter.MaxFilter(w1 * 2 + 1)); r2 = r1.filter(ImageFilter.MaxFilter(w2 * 2 + 1))
    out = Image.new('RGBA', a.size, (0, 0, 0, 0))
    o = Image.new('RGBA', a.size, outer + (255,)); o.putalpha(r2.filter(ImageFilter.GaussianBlur(1))); out.alpha_composite(o)
    i = Image.new('RGBA', a.size, inner + (255,)); i.putalpha(r1.filter(ImageFilter.GaussianBlur(1))); out.alpha_composite(i)
    out.alpha_composite(item, (pad, pad))
    return C.shadow(out, offset=(6, 12), blur=12, alpha=70)

# ---- the open white box, turned upright to fill the frame, with its floor as a video spot ---------------------------------
def open_box(colour='white'):
    box = prop(f'box-open-{colour}').rotate(-90, expand=True)           # landscape photo -> upright
    s = 1.6 * W / box.width; box = box.resize((int(box.width * s), int(box.height * s)))
    y0 = (H - box.height) // 2; xo = (W - box.width) // 2   # bigger than the frame: flaps run off the edges
    full = Image.open(PROPS / 'source' / 'box-open-top.webp')           # floor rect, measured on the source photo
    fx0, fy0, fx1, fy1 = 322, 262, 1132, 752; ph = full.height
    # rotate -90 (clockwise): (x, y) -> (ph - y, x); the cut-out was cropped, so offset by its bbox in the source
    bx = 1448 - box.width / s; floor = (ph - fy1, fx0, ph - fy0, fx1)
    cut_off = C_bbox_offset()
    floor = ((floor[0] - cut_off[1]) * s + xo, (floor[1] - cut_off[0]) * s + y0, (floor[2] - cut_off[1]) * s + xo, (floor[3] - cut_off[0]) * s + y0)
    return box, (xo, y0), tuple(int(v) for v in floor)

def C_bbox_offset():
    """Where the cut-out box sits inside the source photo (x0, y0), so the floor rect can be mapped onto it."""
    src = Image.open(PROPS / 'source' / 'box-open-top.webp').convert('L')
    near = src.point(lambda v: 0 if v >= 237 else 255); bb = near.getbbox()
    return bb[0], bb[1]

def box_scene(video, colour='kraft', floor_pad=0):
    canvas = Image.new('RGBA', (W, H), BG)
    box, (xo, y0), fl = open_box(colour)
    x0, y1_, x1, y2 = fl
    canvas.alpha_composite(ImageOps.fit(video, (x1 - x0, y2 - y1_)), (x0, y1_))   # the clip on the box floor
    hole = Image.new('L', box.size, 255); ImageDraw.Draw(hole).rectangle((x0 - xo + floor_pad, y1_ - y0 + floor_pad, x1 - xo - floor_pad, y2 - y0 - floor_pad), fill=0)
    b = box.copy(); b.putalpha(ImageChops.multiply(b.split()[3], hole))
    canvas.alpha_composite(b, (xo, y0))
    return canvas, fl

# ---- the frames ------------------------------------------------------------------------------------------------------------
def f1():
    """The label types itself in (top) while the video picks the items (bottom); washi tape on the seam."""
    im = Image.new('RGBA', (W, H), BG)
    im.alpha_composite(footage('IMG_1439', 1.0, (W, 940)), (0, 980))
    lab = C.ship_label().resize((520, 780))
    d = ImageDraw.Draw(lab); m = F(MONO, 34)
    d.text((60, 205), 'Sunday Studio', font=m, fill=INK)
    d.text((60, 315), 'YOU', font=F(MONO, 44), fill=INK); d.text((60, 368), '123 YOUR HOME', font=m, fill=INK)
    d.text((60, 495), '1 x somethin|', font=m, fill=INK)
    lab = lab.resize((470, 705)); place(im, lab, (760, 590), -4)
    tape_words(im, (330, 130), 'packing', 'an order', -6)
    place(im, C.washi(1300, 120, 'stripes', (INK, WHITE), seed=3), (540, 985), -2)
    return im

def f2():
    """The real open box fills the frame; the clip plays on its floor; words sit on the flaps."""
    im, fl = box_scene(footage('IMG_1439', 2.0, (W, H)))
    tape_words(im, (W / 2, 190), 'the goods', 'go in first')
    return im

def f3():
    """One packing peanut drops in, with a colourful border."""
    im, fl = box_scene(footage('IMG_1439', 2.6, (W, H)))
    pea = bordered(prop('packing-peanut').resize((360, 360)), WHITE, WHITE, 16, 2)
    place(im, pea, (560, 980), -14)
    d = ImageDraw.Draw(im)
    for k in range(3): d.line((470 + 60 * k, 640, 470 + 60 * k, 740), fill=INK + (255,), width=6)   # motion ticks
    tape_words(im, (W / 2, 1740), '+ a little', 'padding', 3)
    return im

def recolour(img, tint):
    g = ImageOps.grayscale(img.convert('RGB')); col = ImageOps.colorize(g, (int(tint[0] * 0.55), int(tint[1] * 0.55), int(tint[2] * 0.55)), tint)
    out = col.convert('RGBA'); out.putalpha(img.split()[3]); return out

def f4():
    """Peanuts take over the screen (the transition)."""
    im, fl = box_scene(footage('IMG_1439', 2.6, (W, H)))
    r = random.Random(4); pea = prop('packing-peanut')
    tints = [None, None, None, (250, 250, 246), (250, 232, 140), None, (250, 250, 246)]
    styles = [(WHITE, WHITE, 14, 2)]   # plain white die-cut sticker edge (no colours)
    for k in range(70):
        s = r.randint(230, 380); p = pea.resize((s, s))
        t = tints[k % len(tints)]
        if t: p = recolour(p, t)
        if k % 2 == 0:
            inner, outer, w1, w2 = styles[(k // 2) % len(styles)]
            p = bordered(p, inner, outer or inner, w1, max(1, w2))
        place(im, p, (r.randint(-60, W + 60), r.randint(-60, H + 60)), r.randint(0, 359))
    return im

def f5(seal_in=False):
    """The little extra: pink shreds fill the box around a smaller video spot; the thank-you envelope slides in."""
    im = Image.new('RGBA', (W, H), BG)
    box, (xo, y0), fl = open_box('kraft'); x0, y1_, x1, y2 = fl
    shreds = ImageOps.fit(white_shreds(), (x1 - x0, y2 - y1_))
    im.alpha_composite(shreds, (x0, y1_))
    spot = ImageOps.fit(footage('IMG_1460', 2.0, (W, H)), (x1 - x0 - 150, int((x1 - x0 - 150) * 1.2)))
    m = Image.new('L', spot.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, spot.width - 1, spot.height - 1), radius=36, fill=255); spot.putalpha(m)
    sp = C.shadow(spot, offset=(0, 10), blur=14, alpha=80)
    im.alpha_composite(sp, (int((x0 + x1) / 2 - sp.width / 2), int((y1_ + y2) / 2 - sp.height / 2) - 60))
    hole = Image.new('L', box.size, 255); ImageDraw.Draw(hole).rectangle((x0 - xo, y1_ - y0, x1 - xo, y2 - y0), fill=0)
    b = box.copy(); b.putalpha(ImageChops.multiply(b.split()[3], hole)); im.alpha_composite(b, (xo, y0))
    env = prop('envelope').resize((620, 413))
    place(im, C.shadow(env, offset=(8, 14), blur=14, alpha=70), (660, 1560), 10)
    if seal_in:   # the wax seal is brought in after the envelope lands
        seal = C.shadow(prop('wax-seal-thank-you').resize((300, 300)), offset=(10, 22), blur=20, alpha=70)
        place(im, seal, (600, 1380), -8)
        d = ImageDraw.Draw(im)
        for k in range(3): d.line((420 + 30 * k, 1180 - 22 * k, 470 + 30 * k, 1240 - 22 * k), fill=INK + (255,), width=6)
    tape_words(im, (W / 2, 190), 'a little', 'extra', 2)
    return im

def white_shreds():
    """White paper shreds from the pink photo: keep the light and shadow, drop the colour."""
    g = ImageOps.grayscale(prop('paper-shreds-pink').convert('RGB'))
    g = ImageOps.autocontrast(g, cutoff=1).point(lambda v: min(255, int(120 + v * 0.55)))
    return Image.merge('RGB', (g, g, g.point(lambda v: max(0, v - 3)))).convert('RGBA')

def closed_box_with_tape():
    b = prop('box-closed-top').resize((860, 1150))
    canvas = Image.new('RGBA', (1100, 1400), (0, 0, 0, 0)); canvas.alpha_composite(b, (120, 125))
    place(canvas, C.washi(980, 130, 'dots', ((166, 206, 242), WHITE), seed=8), (550, 420), -18)
    place(canvas, C.washi(980, 130, 'hearts', (WHITE, ROSE), seed=9), (550, 560), 12)
    lab = C.ship_label().resize((420, 630)); d = ImageDraw.Draw(lab); m = F(MONO, 27)
    d.text((48, 165), 'Sunday Studio', font=m, fill=INK); d.text((48, 255), 'Jess M.', font=m, fill=INK)
    d.text((48, 290), 'Portland, OR', font=m, fill=INK); d.text((48, 400), '1 x spray cleaner', font=m, fill=INK)
    place(canvas, lab, (560, 930), -5)
    return canvas

def f6():
    """Sealed: the flaps have closed over the video, washi tape and the label are on."""
    im = Image.new('RGBA', (W, H), BG)
    place(im, closed_box_with_tape(), (540, 1080))
    word(im, (70, 150), 'sealed +', F(SANS, 64), INK)
    word(im, (60, 230), 'on its way', F(SERIF, 110), ROSE)
    return im

def f7():
    """CTA: the same sealed box shrinks and slides partly off-screen, the focus moves to the product name."""
    im = Image.new('RGBA', (W, H), BG)
    sealed = f6b(words=False, bg=(0, 0, 0, 0)); box_only = sealed.crop(sealed.getbbox())
    box_only = box_only.resize((int(box_only.width * 0.62), int(box_only.height * 0.62)))
    place(im, C.shadow(box_only, offset=(10, 16), blur=18, alpha=70), (300, 1500), -16)
    place(im, C.washi(980, 300, 'gingham', (BUTTER, WHITE), seed=11, alpha=250), (W / 2, 450), -3)
    word(im, (W / 2, 350), 'Spray cleaner', F(SERIF, 120), INK, anchor='ma')
    word(im, (W / 2, 500), 'shop at the link in my bio', F(SANS, 50), INK, anchor='ma')
    return im


# ---- the same box closing its own flaps over the video (flap pieces cut from the real photo) ------------------------------
SRC_FLOOR = (322, 262, 1132, 752)
SRC_FLAPS = {'top': (300, 60, 1140, 262), 'bottom': (318, 752, 1150, 1036), 'left': (74, 256, 322, 770), 'right': (1132, 254, 1376, 772)}

def _fold_piece(flap, edge, theta):
    """A real flap photo at a fold angle: foreshortened toward its hinge, mirrored and a bit darker once past 90."""
    th = math.radians(theta); c = abs(math.cos(th)); widen = 1 + 0.12 * math.sin(th)
    vert = edge in ('top', 'bottom')
    w, h = flap.size
    if vert: nw, nh = int(w * widen), max(1, int(h * c))
    else:    nw, nh = max(1, int(w * c)), int(h * widen)
    piece = flap.resize((nw, nh), Image.LANCZOS)
    if theta > 90:
        piece = ImageOps.flip(piece) if vert else ImageOps.mirror(piece)
        a = piece.split()[3]; piece = piece.convert('RGB').point(lambda v: int(v * 0.86)).convert('RGBA'); piece.putalpha(a)
    return piece

def box_state(video, short_deg=15, long_deg=15, bg=BG):
    """The kraft box (landscape, as photographed) with the clip on its floor and the flaps at the given angles,
    then turned upright and scaled to fill the frame like open_box()."""
    cut = prop('box-open-kraft'); ox, oy = C_bbox_offset()
    land = Image.new('RGBA', cut.size, (0, 0, 0, 0))
    fx0, fy0, fx1, fy1 = [v - o for v, o in zip(SRC_FLOOR, (ox, oy, ox, oy))]
    vid = ImageOps.fit(video.rotate(90, expand=True), (fx1 - fx0, fy1 - fy0)); land.alpha_composite(vid, (fx0, fy0))
    body = cut.copy(); hole = Image.new('L', cut.size, 255); hd = ImageDraw.Draw(hole)
    hd.rectangle((fx0, fy0, fx1, fy1), fill=0)
    rects = {k: tuple(v - o for v, o in zip(r, (ox, oy, ox, oy))) for k, r in SRC_FLAPS.items()}
    for r in rects.values(): hd.rectangle(r, fill=0)     # the flaps are redrawn at their angle below
    body.putalpha(ImageChops.multiply(body.split()[3], hole)); land.alpha_composite(body)
    for edge in ('left', 'right', 'top', 'bottom'):     # short side flaps first, long flaps on top
        theta = short_deg if edge in ('left', 'right') else long_deg
        x0, y0, x1, y1 = rects[edge]; flap = cut.crop(rects[edge])
        p = _fold_piece(flap, edge, theta); cx = (x0 + x1) / 2; cy = (y0 + y1) / 2
        if edge == 'top':    pos = (cx - p.width / 2, (y1 - p.height) if theta <= 90 else y1)
        if edge == 'bottom': pos = (cx - p.width / 2, y0 if theta <= 90 else y0 - p.height)
        if edge == 'left':   pos = ((x1 - p.width) if theta <= 90 else x1, cy - p.height / 2)
        if edge == 'right':  pos = (x0 if theta <= 90 else x0 - p.width, cy - p.height / 2)
        if theta > 95:       # a flap over the opening casts a soft shadow on the clip
            sh = Image.new('RGBA', land.size, (0, 0, 0, 0)); m = Image.new('L', land.size, 0)
            ImageDraw.Draw(m).rectangle((pos[0] + 10, pos[1] + 14, pos[0] + p.width + 10, pos[1] + p.height + 14), fill=110)
            sh.putalpha(m.filter(ImageFilter.GaussianBlur(16))); land.alpha_composite(sh)
        land.alpha_composite(p, (int(pos[0]), int(pos[1])))
    up = land.rotate(-90, expand=True); s = 1.6 * W / up.width
    up = up.resize((int(up.width * s), int(up.height * s)))
    canvas = Image.new('RGBA', (W, H), bg)
    canvas.alpha_composite(up, ((W - up.width) // 2, (H - up.height) // 2))
    return canvas

def f6a():
    """The flaps closing over the video: side flaps already in, the long flaps swinging shut."""
    im = box_state(footage('IMG_1447', 1.0, (W, H)), 180, 115)
    tape_words(im, (W / 2, 160), 'all', 'tucked in', -2)
    return im

def sealed_box():
    """The same box as frames 2-5, flaps closed (her closed-box photo, seam down the middle, turned upright to match),
    sized to the open box's body. Packing washi tape runs along the seam and over both ends. Transparent around."""
    cb = prop('box-closed-seam').rotate(-90, expand=True)
    _, _, fl = open_box('kraft'); body_w = int((fl[2] - fl[0]) * 1.16)       # the open box's body, walls included
    s = body_w / cb.width; cb = cb.resize((body_w, int(cb.height * s)))
    pad = 120; out = Image.new('RGBA', (cb.width + 2 * pad, cb.height + 2 * pad), (0, 0, 0, 0))
    out.alpha_composite(C.shadow(cb, offset=(10, 18), blur=20, alpha=70), (pad - 44, pad - 44))
    tape = C.washi(cb.height + 16, 170, 'dots', (BLUE, WHITE), seed=8, alpha=245)   # along the seam, over the ends
    place(out, tape, (out.width / 2, out.height / 2), 90)
    lab = C.ship_label().resize((430, 645)); d = ImageDraw.Draw(lab); m = F(MONO, 27)
    d.text((48, 166), 'Sunday Studio', font=m, fill=INK); d.text((48, 258), 'YOU', font=F(MONO, 35), fill=INK)
    d.text((48, 302), '123 YOUR HOME', font=m, fill=INK); d.text((48, 408), '1 x something nice', font=m, fill=INK)
    place(out, lab, (out.width / 2 + 150, out.height / 2 + 260), -6)
    return out

def f6b(words=True, bg=BG):
    """Sealed: her closed box, washi tape across the lid and over the edges, label on."""
    im = Image.new('RGBA', (W, H), bg)
    place(im, sealed_box(), (W / 2, H / 2 + 80))
    if words: tape_words(im, (W / 2, 160), 'sealed +', 'on its way', 3)
    return im

def f7():
    """CTA: the sealed box shrinks and slides partly off-screen, the focus moves to the product name."""
    im = Image.new('RGBA', (W, H), BG)
    bx = sealed_box(); bx = bx.resize((int(bx.width * 0.55), int(bx.height * 0.55)))
    place(im, bx, (290, 1480), -16)
    place(im, C.washi(980, 300, 'gingham', (BUTTER, WHITE), seed=11, alpha=250), (W / 2, 450), -3)
    word(im, (W / 2, 350), 'Spray cleaner', F(SERIF, 120), INK, anchor='ma')
    word(im, (W / 2, 500), 'shop at the link in my bio', F(SANS, 50), INK, anchor='ma')
    return im

def main():
    frames = [f1(), f2(), f3(), f4(), f5(), f5(True), f6b(), f7()]
    names = ['1 label types in + picking items', '2 real box, video on the floor', '3 one peanut drops in',
             '4 peanuts take over', '5a shreds + the envelope lands', '5b the wax seal is brought in',
             '6 sealed, washi tape + label', '7 CTA']
    for n, f in zip(names, frames): f.convert('RGB').save(OUT / f'{n}.jpg', quality=90)
    sheet = Image.new('RGB', (W * 4 + 60, H * 2 + 20), 'white')
    for i, f in enumerate(frames): sheet.paste(f.convert('RGB'), ((i % 4) * (W + 20), (i // 4) * (H + 20)))
    sheet.resize((sheet.width // 3, sheet.height // 3)).save(OUT / 'storyboard-02.jpg', quality=90)
    print('saved', OUT)

if __name__ == '__main__':
    main()
