"""Storyboard stills for #3 Before and after, built from Mercedes's real props (2026-10-17, v2 corkboard world).
Idea: the "after" gets printed on an instant camera. Its own world, nothing from #2: a real cork board backdrop,
photos held by real push pins, small words typed on real label-maker tape, big words in Imbue in the cobalt accent
(the colour buyers change), handwriting on the photo strip. The video spots show stand-in footage from her July clips.
Usage: python build/storyboard_03.py  ->  03-before-and-after/storyboard/
"""
import subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import engine as E

OUT = E.PACK / '03-before-and-after' / 'storyboard'; OUT.mkdir(parents=True, exist_ok=True)
PROPS = E.PACK / 'assets' / 'props'
W, H = 1080, 1920
INK, WHITE = (24, 23, 22), (255, 255, 255)
COBALT = (34, 66, 190)               # the accent: big words (buyers change it to their brand colour)
LABEL = 'C:/Windows/Fonts/arialbd.ttf'
SERIF, HAND = E.font_file(E.FONT_IDS['imbue']), E.INKFREE   # odd template: Imbue
TONE = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p'
SCR = OUT / '_frames'; SCR.mkdir(exist_ok=True)
BEFORE, AFTER, PRODUCT = ('IMG_1398', 0.5), ('IMG_1408', 0.5), ('IMG_1417', 0.5)

PHOTO_PIC = (65, 97, 719, 939)     # the picture area inside instant-photo-blank.png (measured)
CAM_SLOT = (270, 22, 715, 32)      # the print slot on top of instant-camera.png (measured)

def F(p, px): return ImageFont.truetype(p, px)
def prop(n): return Image.open(PROPS / f'{n}.png').convert('RGBA')

def cork():
    """The real cork board, filling the frame, with a soft light falloff toward the corners (not a flat colour)."""
    im = ImageOps.fit(Image.open(PROPS / 'cork.jpg').convert('RGB'), (W, H), Image.LANCZOS).convert('RGBA')
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse((-260, -200, W + 260, H + 200), fill=255)
    dark = Image.new('RGBA', (W, H), (40, 24, 10, 0)); dark.putalpha(ImageOps.invert(m.filter(ImageFilter.GaussianBlur(220))).point(lambda v: int(v * 0.5)))
    im.alpha_composite(dark); return im

def footage(clip, size):
    name, t = clip; p = SCR / f'{name}-{t}.png'
    if not p.exists():
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t), '-i', str(E.FOOTAGE / f'{name}.MOV'), '-frames:v', '1',
                        '-vf', f'{TONE},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}', str(p)], check=True)
    return ImageOps.fit(Image.open(p).convert('RGBA'), size)

def place(img, item, c, rot=0):
    it = item.rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def label(text, px=58, colour='black'):
    """Words typed on real label-maker tape: the photo's cut ends kept, its middle stretched to fit, raised white letters."""
    tape = prop(f'label-tape-{colour}'); f = F(LABEL, px); sp = int(px * 0.16)
    tw = sum(f.getbbox(ch)[2] for ch in text) + sp * (len(text) - 1)
    h = int(px * 1.75); s = h / tape.height; tape = tape.resize((int(tape.width * s), h), Image.LANCZOS)
    end = int(h * 0.5); length = max(tw + 2 * int(px * 0.9), 2 * end + 10)
    out = Image.new('RGBA', (length, h), (0, 0, 0, 0))
    out.alpha_composite(tape.crop((0, 0, end, h)), (0, 0))
    out.alpha_composite(tape.crop((end, 0, tape.width - end, h)).resize((length - 2 * end, h)), (end, 0))
    out.alpha_composite(tape.crop((tape.width - end, 0, tape.width, h)), (length - end, 0))
    d = ImageDraw.Draw(out); x = (length - tw) / 2; y = h / 2
    for ch in text:   # embossed: a dark edge under each light letter
        d.text((x + 1, y + 2), ch, font=f, fill=(0, 0, 0, 200), anchor='lm'); d.text((x, y), ch, font=f, fill=(236, 236, 232, 255), anchor='lm')
        x += f.getbbox(ch)[2] + sp
    return C.shadow(out, offset=(4, 7), blur=6, alpha=90)

def big(img, xy, text, px=150, anchor='mm', fill=COBALT):
    """The big accent words in Imbue, with a soft light lift so they read on the cork."""
    lay = Image.new('RGBA', img.size, (0, 0, 0, 0)); ImageDraw.Draw(lay).text(xy, text, font=F(SERIF, px), fill=fill, anchor=anchor)
    glow = Image.new('RGBA', img.size, (255, 246, 230, 0)); glow.putalpha(lay.split()[3].filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.75)))
    img.alpha_composite(glow); img.alpha_composite(lay)

def pin(img, xy, colour='blue', d=104):
    """A real push pin head stuck into the cork, casting its shadow down and to the right."""
    h = prop(f'pin-head-{colour}').resize((d, d), Image.LANCZOS)
    place(img, C.shadow(h, offset=(12, 16), blur=8, alpha=110), (xy[0] + 0, xy[1] + 0))

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
    return ph

def pinned_photo(img, c, rot, clip, width, note=None, pin_colour='blue', develop=1.0):
    """An instant photo lying flat on the cork, a push pin through its top edge."""
    ph = instant_photo(clip, width, develop, note)
    place(img, C.shadow(ph, offset=(6, 10), blur=12, alpha=95), c, rot)
    import math
    a = math.radians(-rot); top = ph.height / 2 - width * 0.06
    pin(img, (c[0] + top * math.sin(a), c[1] - top * math.cos(a)), pin_colour)

def camera(width):
    cam = prop('instant-camera'); s = width / cam.width
    return cam.resize((width, int(cam.height * s)), Image.LANCZOS), s

def flash(img, c, r=300):
    m = Image.new('L', img.size, 0); ImageDraw.Draw(m).ellipse((c[0] - r, c[1] - r, c[0] + r, c[1] + r), fill=255)
    glow = Image.new('RGBA', img.size, (255, 255, 250, 0)); glow.putalpha(m.filter(ImageFilter.GaussianBlur(r * 0.45)))
    img.alpha_composite(glow)

def paste_cam(img, cam, left, top):
    img.alpha_composite(C.shadow(cam, offset=(0, 24), blur=26, alpha=90), (int(left - 76), int(top - 76)))   # C.shadow pads 76

# ---- the frames ------------------------------------------------------------------------------------------------------------
def f1():
    """Before: the before clip in an instant photo pinned to the cork; the hook as a typed label + big accent words."""
    im = cork()
    pinned_photo(im, (W / 2 + 20, 1150), -4, BEFORE, 700, 'before', 'blue')
    place(im, label('WATCH THIS'), (360, 250), -3)
    big(im, (W / 2, 410), 'couch change', 190)
    return im

def f2():
    """Snap: the words have left, the camera rises over the photo, the flash goes off, a SNAP label pops on."""
    im = cork()
    pinned_photo(im, (W / 2 + 20, 1010), -4, BEFORE, 700, 'before', 'blue')
    cam, s = camera(1000); left, top = W / 2 - cam.width / 2, 1420 - cam.height / 2
    paste_cam(im, cam, left, top)
    flash(im, (left + 470 * s, top + 230 * s), 300)
    place(im, label('SNAP!', 64), (860, 960), 8)
    return im

def f3():
    """Print: a blank, undeveloped photo slides up out of the camera's slot."""
    im = cork()
    cam, s = camera(1000); left, top = W / 2 - cam.width / 2, 1460 - cam.height / 2
    slot_w = (CAM_SLOT[2] - CAM_SLOT[0]) * s; slot_cx = left + (CAM_SLOT[0] + CAM_SLOT[2]) / 2 * s
    ph = C.shadow(instant_photo(None, int(slot_w * 0.96)), offset=(6, 10), blur=12, alpha=80)
    shown = int(ph.height * 0.80); slot_y = top + CAM_SLOT[1] * s + 8
    im.alpha_composite(ph.crop((0, 0, ph.width, shown)), (int(slot_cx - ph.width / 2), int(slot_y - shown)))
    paste_cam(im, cam, left, top)
    return im

def f4():
    """Develop: the photo is half developed (the after clip coming up through the dark) and growing; camera dropping away."""
    im = cork()
    cam, s = camera(1000); paste_cam(im, cam, W / 2 - cam.width / 2, 2050 - cam.height / 2)
    ph = C.shadow(instant_photo(AFTER, 860, develop=0.45), offset=(10, 18), blur=20, alpha=90)
    place(im, ph, (W / 2, 900), 3)
    return im

def f5():
    """After: the clip fills the screen; the time it took typed on labels, the real timer beside them."""
    im = footage(AFTER, (W, H))
    place(im, label('AFTER'), (250, 220), -4)
    place(im, label('20 MINUTES', 72), (430, 340), -2)
    timer = prop('kitchen-timer'); timer = timer.resize((290, int(timer.height * 290 / timer.width)), Image.LANCZOS)
    place(im, C.shadow(timer, offset=(10, 16), blur=14, alpha=110), (900, 290), 8)
    return im

def f6():
    """Side by side: both photos pinned next to each other on the cork."""
    im = cork()
    pinned_photo(im, (300, 1050), -7, BEFORE, 500, 'before', 'white')
    pinned_photo(im, (785, 1120), 6, AFTER, 500, 'after', 'blue')
    big(im, (W / 2, 320), 'same couch,', 190)
    place(im, label('20 MINUTES LATER'), (W / 2, 490), -2)
    return im

def f7():
    """CTA: the product clip in a third photo; product name big, where to buy on a typed label."""
    im = cork()
    pinned_photo(im, (W / 2, 1200), 3, PRODUCT, 640, None, 'black')
    big(im, (W / 2, 310), 'Cordless vacuum', 170)
    place(im, label('SHOP: LINK IN BIO'), (W / 2, 480), -2)
    return im

def main():
    frames = [f1(), f2(), f3(), f4(), f5(), f6(), f7()]
    names = ['1 before, pinned to the cork', '2 the camera snaps', '3 the after prints', '4 it develops and grows',
             '5 after, full screen + timer', '6 side by side', '7 CTA']
    for old in OUT.glob('*.jpg'): old.unlink()
    for n, f in zip(names, frames): f.convert('RGB').save(OUT / f'{n}.jpg', quality=90)
    sheet = Image.new('RGB', (W * 4 + 60, H * 2 + 20), 'white')
    for i, f in enumerate(frames): sheet.paste(f.convert('RGB'), ((i % 4) * (W + 20), (i // 4) * (H + 20)))
    sheet.resize((sheet.width // 3, sheet.height // 3)).save(OUT / 'storyboard-03.jpg', quality=90)
    print('saved', OUT)

if __name__ == '__main__':
    main()
