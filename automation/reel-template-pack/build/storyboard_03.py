"""Storyboard stills for #3 Before and after, built from Mercedes's real props (2026-10-17).
Idea: the "after" gets printed on an instant camera. Real objects (instant camera, blank instant photo, kitchen timer)
with a playful layer (washi tape, words on butter gingham tape, handwriting on the photo strip, white die-cut edge).
The video spots show stand-in footage from her July clips (sofa before/after, vacuum).
Usage: python build/storyboard_03.py  ->  03-before-and-after/storyboard/
"""
import random, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import engine as E

OUT = E.PACK / '03-before-and-after' / 'storyboard'; OUT.mkdir(parents=True, exist_ok=True)
PROPS = E.PACK / 'assets' / 'props'
W, H = 1080, 1920
INK, WHITE = (24, 23, 22), (255, 255, 255)
BG = (199, 209, 187, 255)          # sage backdrop, same as #2
BUTTER, BLUE, MINT = (250, 232, 120), (166, 206, 242), (176, 214, 190)
SANS, SERIF, HAND = 'C:/Windows/Fonts/arial.ttf', E.font_file(E.FONT_IDS['imbue']), E.INKFREE   # odd template: Imbue
TONE = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p'
SCR = OUT / '_frames'; SCR.mkdir(exist_ok=True)
BEFORE, AFTER, PRODUCT = ('IMG_1398', 0.5), ('IMG_1408', 0.5), ('IMG_1417', 0.5)

PHOTO_PIC = (65, 97, 719, 939)     # the picture area inside instant-photo-blank.png (measured)
CAM_SLOT = (270, 22, 715, 32)      # the print slot on top of instant-camera.png (measured)

def F(p, px): return ImageFont.truetype(p, px)
def prop(n): return Image.open(PROPS / f'{n}.png').convert('RGBA')

def footage(clip, size):
    name, t = clip; p = SCR / f'{name}-{t}.png'
    if not p.exists():
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t), '-i', str(E.FOOTAGE / f'{name}.MOV'), '-frames:v', '1',
                        '-vf', f'{TONE},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}', str(p)], check=True)
    return ImageOps.fit(Image.open(p).convert('RGBA'), size)

def place(img, item, c, rot=0):
    it = item.rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def tape_words(img, c, small, big, rot=-3, length=760, big_px=104):
    """Words on a strip of butter gingham tape: small sans line + big serif line (the accent the buyer recolours)."""
    strip = C.washi(length, 250, 'gingham', (BUTTER, WHITE), seed=17, alpha=250)
    d = ImageDraw.Draw(strip); cx = strip.width / 2; cy = strip.height / 2
    d.text((cx, cy - 52), small, font=F(SANS, 50), fill=INK, anchor='mm'); d.text((cx, cy + 40), big, font=F(SERIF, big_px), fill=INK, anchor='mm')
    place(img, strip, c, rot)

def instant_photo(clip=None, width=640, develop=1.0, note=None):
    """The real blank instant photo; the clip shows in its picture area. develop < 1 leaves it part dark (developing)."""
    ph = prop('instant-photo-blank'); s = width / ph.width
    ph = ph.resize((width, int(ph.height * s)), Image.LANCZOS)
    x0, y0, x1, y1 = [int(v * s) for v in PHOTO_PIC]
    if clip is not None:
        pic = footage(clip, (x1 - x0, y1 - y0))
        if develop < 1:
            dark = Image.new('RGBA', pic.size, (74, 74, 76, int(255 * (1 - develop)))); pic.alpha_composite(dark)
        ph.alpha_composite(pic, (x0, y0))
    if note:
        d = ImageDraw.Draw(ph); d.text(((x0 + x1) / 2, (y1 + ph.height) / 2 + 4), note, font=F(HAND, int(width * 0.1)), fill=INK, anchor='mm')
    return C.shadow(ph, offset=(8, 14), blur=16, alpha=80)

def taped(photo, seed=1, colours=((BLUE, WHITE), (BUTTER, WHITE)), pattern=('dots', 'stripes')):
    """Two pieces of washi tape over the photo's top corners."""
    pad = 60; out = Image.new('RGBA', (photo.width + 2 * pad, photo.height + 2 * pad), (0, 0, 0, 0))
    out.alpha_composite(photo, (pad, pad))
    for k, (cx, rot) in enumerate(((pad + 40, 38), (out.width - pad - 40, -38))):
        t = C.washi(260, 84, pattern[k % 2], colours[k % 2], seed=seed + k, alpha=235)
        place(out, t, (cx, pad + 36), rot)
    return out

def sticker(item, edge=16):
    """A white die-cut sticker edge around a real object."""
    pad = edge + 10
    a = Image.new('L', (item.width + 2 * pad, item.height + 2 * pad), 0); a.paste(item.split()[3], (pad, pad))
    ring = a.point(lambda v: 255 if v > 100 else 0).filter(ImageFilter.MaxFilter(edge * 2 + 1)).filter(ImageFilter.GaussianBlur(1))
    out = Image.new('RGBA', a.size, WHITE + (0,)); out.putalpha(ring); out.alpha_composite(item, (pad, pad))
    return C.shadow(out, offset=(6, 12), blur=12, alpha=70)

def camera(width):
    cam = prop('instant-camera'); s = width / cam.width
    return cam.resize((width, int(cam.height * s)), Image.LANCZOS), s

def flash(img, c, r=520):
    """The flash going off: a soft white burst from the flash window."""
    m = Image.new('L', img.size, 0); ImageDraw.Draw(m).ellipse((c[0] - r, c[1] - r, c[0] + r, c[1] + r), fill=255)
    glow = Image.new('RGBA', img.size, (255, 255, 250, 0)); glow.putalpha(m.filter(ImageFilter.GaussianBlur(r * 0.45)))
    img.alpha_composite(glow)

# ---- the frames ------------------------------------------------------------------------------------------------------------
def f1():
    """Before: the before clip in an instant photo taped to the backdrop; the hook on gingham tape."""
    im = Image.new('RGBA', (W, H), BG)
    place(im, taped(instant_photo(BEFORE, 720, note='before'), seed=3), (W / 2 + 10, 1110), -4)
    tape_words(im, (W / 2, 250), 'watch this', 'couch change', -3)
    return im

def f2():
    """Snap: the words have left, the camera rises over the photo and the flash goes off."""
    im = Image.new('RGBA', (W, H), BG)
    place(im, taped(instant_photo(BEFORE, 720, note='before'), seed=3), (W / 2 + 10, 1010), -4)
    cam, s = camera(1000); cx, cy = W / 2, 1420
    place(im, C.shadow(cam, offset=(0, 24), blur=26, alpha=80), (cx, cy))
    fx = cx - cam.width / 2 + 470 * s; fy = cy - cam.height / 2 + 230 * s      # the flash window on the photo
    flash(im, (fx, fy), 300)
    d = ImageDraw.Draw(im)                                                      # click ticks above the shutter button
    bx = cx - cam.width / 2 + 935 * s; by = cy - cam.height / 2 + 330 * s
    for a, b in (((-50, -10), (-75, -60)), ((0, -20), (0, -78)), ((45, -10), (62, -60))):
        d.line((bx + a[0], by + a[1], bx + b[0], by + b[1]), fill=INK + (255,), width=7)
    return im

def f3():
    """Print: a blank, undeveloped photo slides up out of the camera's slot."""
    im = Image.new('RGBA', (W, H), BG)
    cam, s = camera(1000); cx, cy = W / 2, 1460
    left = cx - cam.width / 2; top = cy - cam.height / 2
    slot_w = (CAM_SLOT[2] - CAM_SLOT[0]) * s; slot_cx = left + (CAM_SLOT[0] + CAM_SLOT[2]) / 2 * s
    ph = instant_photo(None, int(slot_w * 0.96))
    shown = int(ph.height * 0.82)                                               # most of it is out, the rest still in the slot
    slot_y = top + CAM_SLOT[1] * s + 8
    im.alpha_composite(ph.crop((0, 0, ph.width, shown)), (int(slot_cx - ph.width / 2), int(slot_y - shown)))
    im.alpha_composite(C.shadow(cam, offset=(0, 24), blur=26, alpha=80), (int(left - 76), int(top - 76)))   # C.shadow pads by blur*2 + offset
    d = ImageDraw.Draw(im)                                                      # motion ticks beside the photo
    for k in range(3):
        x = slot_cx + ph.width / 2 + 50; y = slot_y - shown + 140 + 70 * k
        d.line((x, y, x + 70, y - 22), fill=INK + (255,), width=7)
    return im

def f4():
    """Develop: the photo is half developed (the after clip coming up through the dark) and growing; camera dropping away."""
    im = Image.new('RGBA', (W, H), BG)
    cam, s = camera(1000); place(im, C.shadow(cam, offset=(0, 24), blur=26, alpha=80), (W / 2, 2050))
    place(im, instant_photo(AFTER, 860, develop=0.45), (W / 2, 900), 3)
    return im

def f5():
    """After: the clip fills the screen; the time it took on gingham tape, with the real timer as a sticker."""
    im = footage(AFTER, (W, H))
    tape_words(im, (440, 250), 'after', '20 minutes', -3, length=700)
    timer = prop('kitchen-timer'); timer = timer.resize((300, int(timer.height * 300 / timer.width)), Image.LANCZOS)
    place(im, sticker(timer), (900, 300), 10)
    return im

def f6():
    """Side by side: both photos taped next to each other, both clips playing."""
    im = Image.new('RGBA', (W, H), BG)
    place(im, taped(instant_photo(BEFORE, 500, note='before'), seed=5), (300, 1000), -7)
    place(im, taped(instant_photo(AFTER, 500, note='after'), seed=7, colours=((BUTTER, WHITE), (MINT, WHITE)), pattern=('stripes', 'dots')), (780, 1080), 6)
    tape_words(im, (W / 2, 330), 'same couch,', '20 minutes', 2, length=720)
    return im

def f7():
    """CTA: the product clip in a third photo; product name and where to buy on gingham tape."""
    im = Image.new('RGBA', (W, H), BG)
    place(im, taped(instant_photo(PRODUCT, 640), seed=9), (W / 2, 1190), 3)
    place(im, C.washi(980, 300, 'gingham', (BUTTER, WHITE), seed=11, alpha=250), (W / 2, 330), -3)
    d = ImageDraw.Draw(im)
    d.text((W / 2, 300), 'Cordless vacuum', font=F(SERIF, 112), fill=INK, anchor='mm')
    d.text((W / 2, 410), 'shop at the link in my bio', font=F(SANS, 50), fill=INK, anchor='mm')
    return im

def main():
    frames = [f1(), f2(), f3(), f4(), f5(), f6(), f7()]
    names = ['1 before, in an instant photo', '2 the camera snaps', '3 the after prints', '4 it develops and grows',
             '5 after, full screen + timer', '6 side by side', '7 CTA']
    for n, f in zip(names, frames): f.convert('RGB').save(OUT / f'{n}.jpg', quality=90)
    sheet = Image.new('RGB', (W * 4 + 60, H * 2 + 20), 'white')
    for i, f in enumerate(frames): sheet.paste(f.convert('RGB'), ((i % 4) * (W + 20), (i // 4) * (H + 20)))
    sheet.resize((sheet.width // 3, sheet.height // 3)).save(OUT / 'storyboard-03.jpg', quality=90)
    print('saved', OUT)

if __name__ == '__main__':
    main()
