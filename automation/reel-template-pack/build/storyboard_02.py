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
    s = 1.3 * W / box.width; box = box.resize((int(box.width * s), int(box.height * s)))
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

def box_scene(video, colour='white', floor_pad=0):
    canvas = Image.new('RGBA', (W, H), (246, 244, 240, 255))
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
    im = Image.new('RGBA', (W, H), (246, 244, 240, 255))
    im.alpha_composite(footage('IMG_1439', 1.0, (W, 940)), (0, 980))
    lab = C.ship_label().resize((520, 780))
    d = ImageDraw.Draw(lab); m = F(MONO, 34)
    d.text((60, 205), 'Sunday Studio', font=m, fill=INK)
    d.text((60, 315), 'Jess M.', font=m, fill=INK); d.text((60, 357), 'Portland, OR', font=m, fill=INK)
    d.text((60, 495), '1 x spray clea|', font=m, fill=INK)
    lab = lab.resize((460, 690)); place(im, lab, (790, 600), -4)
    word(im, (70, 150), 'packing', F(SANS, 64), INK)
    word(im, (60, 230), 'an order', F(SERIF, 100), ROSE)
    word(im, (70, 380), 'with me', F(SANS, 64), INK)
    place(im, C.washi(1300, 120, 'stripes', ((246, 182, 205), WHITE), seed=3), (540, 985), -2)
    return im

def f2():
    """The real open box fills the frame; the clip plays on its floor; words sit on the flaps."""
    im, fl = box_scene(footage('IMG_1439', 2.0, (W, H)))
    word(im, (W / 2, 110), 'the goods', F(SANS, 64), INK, anchor='ma')
    word(im, (W / 2, 190), 'go in first', F(SERIF, 104), ROSE, anchor='ma')
    return im

def f3():
    """One packing peanut drops in, with a colourful border."""
    im, fl = box_scene(footage('IMG_1439', 2.6, (W, H)))
    pea = bordered(prop('packing-peanut').resize((360, 360)))
    place(im, pea, (560, 980), -14)
    d = ImageDraw.Draw(im)
    for k in range(3): d.line((470 + 60 * k, 640, 470 + 60 * k, 740), fill=INK + (255,), width=6)   # motion ticks
    word(im, (W / 2, 1650), '+ a little padding', F(HAND, 64), INK, anchor='ma')
    return im

def recolour(img, tint):
    g = ImageOps.grayscale(img.convert('RGB')); col = ImageOps.colorize(g, (int(tint[0] * 0.55), int(tint[1] * 0.55), int(tint[2] * 0.55)), tint)
    out = col.convert('RGBA'); out.putalpha(img.split()[3]); return out

def f4():
    """Peanuts take over the screen (the transition)."""
    im, fl = box_scene(footage('IMG_1439', 2.6, (W, H)))
    r = random.Random(4); pea = prop('packing-peanut')
    tints = [None, None, (246, 182, 205), (250, 232, 140), (200, 190, 245), None]
    for k in range(70):
        s = r.randint(230, 380); p = pea.resize((s, s))
        t = tints[k % len(tints)]
        if t: p = recolour(p, t)
        if k % 9 == 0: p = bordered(p)
        place(im, p, (r.randint(-60, W + 60), r.randint(-60, H + 60)), r.randint(0, 359))
    return im

def f5():
    """The little extra: pink shreds fill the box around a smaller video spot; the thank-you envelope slides in."""
    im = Image.new('RGBA', (W, H), (246, 244, 240, 255))
    box, (xo, y0), fl = open_box('white'); x0, y1_, x1, y2 = fl
    shreds = ImageOps.fit(prop('paper-shreds-pink'), (x1 - x0, y2 - y1_))
    im.alpha_composite(shreds, (x0, y1_))
    spot = ImageOps.fit(footage('IMG_1460', 2.0, (W, H)), (x1 - x0 - 150, int((x1 - x0 - 150) * 1.2)))
    m = Image.new('L', spot.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, spot.width - 1, spot.height - 1), radius=36, fill=255); spot.putalpha(m)
    sp = C.shadow(spot, offset=(0, 10), blur=14, alpha=80)
    im.alpha_composite(sp, (int((x0 + x1) / 2 - sp.width / 2), int((y1_ + y2) / 2 - sp.height / 2) - 60))
    hole = Image.new('L', box.size, 255); ImageDraw.Draw(hole).rectangle((x0 - xo, y1_ - y0, x1 - xo, y2 - y0), fill=0)
    b = box.copy(); b.putalpha(ImageChops.multiply(b.split()[3], hole)); im.alpha_composite(b, (xo, y0))
    env = prop('envelope').resize((620, 413)); seal = prop('wax-seal-thank-you').resize((230, 230))
    env.alpha_composite(seal, (env.width // 2 - 115, env.height // 2 - 70))
    place(im, C.shadow(env, offset=(8, 14), blur=14, alpha=70), (660, 1560), 10)
    word(im, (W / 2, 80), 'a little', F(SANS, 60), INK, anchor='ma')
    word(im, (W / 2, 150), 'extra', F(SERIF, 110), ROSE, anchor='ma')
    return im

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
    im = Image.new('RGBA', (W, H), (246, 244, 240, 255))
    place(im, closed_box_with_tape(), (540, 1080))
    word(im, (70, 150), 'sealed +', F(SANS, 64), INK)
    word(im, (60, 230), 'on its way', F(SERIF, 110), ROSE)
    return im

def f7():
    """CTA: the box slides partly off-screen, the focus moves to the product name."""
    im = Image.new('RGBA', (W, H), (246, 244, 240, 255))
    bx = closed_box_with_tape().resize((770, 980))
    place(im, bx, (260, 1500), -16)
    word(im, (W / 2, 330), 'Spray cleaner', F(SERIF, 120), ROSE, anchor='ma')
    word(im, (W / 2, 500), 'shop at the link in my bio', F(SANS, 50), INK, anchor='ma')
    place(im, C.washi(560, 90, 'gingham', ((250, 232, 120), WHITE), seed=11), (W / 2, 610), -3)
    return im

def main():
    frames = [f1(), f2(), f3(), f4(), f5(), f6(), f7()]
    names = ['1 label types in + picking items', '2 real box, video on the floor', '3 one peanut drops in',
             '4 peanuts take over', '5 shreds + thank-you envelope', '6 sealed: tape + label', '7 CTA']
    for n, f in zip(names, frames): f.convert('RGB').save(OUT / f'{n}.jpg', quality=90)
    sheet = Image.new('RGB', (W * 4 + 60, H * 2 + 20), 'white')
    for i, f in enumerate(frames): sheet.paste(f.convert('RGB'), ((i % 4) * (W + 20), (i // 4) * (H + 20)))
    sheet.resize((sheet.width // 3, sheet.height // 3)).save(OUT / 'storyboard-02.jpg', quality=90)
    print('saved', OUT)

if __name__ == '__main__':
    main()
