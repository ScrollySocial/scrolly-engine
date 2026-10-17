"""Storyboard stills for #3 Before and after, built from Mercedes's real props (2026-10-17, v3 layered).
The story, acted out: you look at the before through the camera's lens, the camera snaps, the after prints out of the
slot dark (the buyer's clip 2 starts with a hand over the lens) and develops while a giant timer dial turns, the after
breaks out of its photo, the before photo is held up against the same spot, and the product prints last (CTA).
Layers change every beat (blurred clip, clip, camera, photo frame, timer, cork) and carry the transitions.
Real objects only (camera, instant photo, timer, cork, push pins, label-maker tape); type: Corben Bold in mint (from
the camera; buyers change it), label-maker tape for small words, Ink Free on the photo strip. Footage is a stand-in.
Usage: python build/storyboard_03.py  ->  03-before-and-after/storyboard/
"""
import math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import engine as E

OUT = E.PACK / '03-before-and-after' / 'storyboard'; OUT.mkdir(parents=True, exist_ok=True)
PROPS = E.PACK / 'assets' / 'props'
W, H = 1080, 1920
INK, WHITE = (24, 23, 22), (255, 255, 255)
MINT = (176, 224, 196)               # the accent, taken from the camera (buyers change it to their brand colour)
LABEL = 'C:/Windows/Fonts/arialbd.ttf'
HEAD = 'C:/Users/merce/AppData/Local/CapCut/User Data/Cache/AITextTemplate/Resource/4624078377714242870/Corben-Bold.ttf'
HAND = E.INKFREE
TONE = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p'
SCR = OUT / '_frames'; SCR.mkdir(exist_ok=True)
BEFORE, AFTER, PRODUCT = ('IMG_1398', 0.5), ('IMG_1408', 0.5), ('IMG_1417', 0.5)

PHOTO_PIC = (65, 97, 719, 939)     # the picture area inside instant-photo-blank.png (measured)
CAM_SLOT = (270, 22, 715, 32)      # the print slot on top of instant-camera.png (measured)
CAM_LENS = (578, 636, 205)         # the lens on instant-camera.png: centre and the radius of its inner disc
CAM_FLASH = (330, 255)             # the flash window on instant-camera.png
DIAL = (516, 524, 414)             # the turning dial on kitchen-timer.png (the pointer above it stays put)

def F(p, px): return ImageFont.truetype(p, px)
def prop(n): return Image.open(PROPS / f'{n}.png').convert('RGBA')

def footage(clip, size=(W, H)):
    name, t = clip; p = SCR / f'{name}-{t}.png'
    if not p.exists():
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t), '-i', str(E.FOOTAGE / f'{name}.MOV'), '-frames:v', '1',
                        '-vf', f'{TONE},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}', str(p)], check=True)
    return ImageOps.fit(Image.open(p).convert('RGBA'), size)

def blur_bg(clip, dim=0.72):
    """The clip itself, blown up, blurred and dimmed: a moving background layer that changes with the clip."""
    im = footage(clip).resize((int(W * 1.2), int(H * 1.2))).crop((int(W * 0.1), int(H * 0.1), int(W * 1.1), int(H * 1.1)))
    im = im.filter(ImageFilter.GaussianBlur(34))
    return ImageEnhance.Brightness(im).enhance(dim)

def cork():
    im = ImageOps.fit(Image.open(PROPS / 'cork.jpg').convert('RGB'), (W, H), Image.LANCZOS).convert('RGBA')
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse((-260, -200, W + 260, H + 200), fill=255)
    dark = Image.new('RGBA', (W, H), (40, 24, 10, 0)); dark.putalpha(ImageOps.invert(m.filter(ImageFilter.GaussianBlur(220))).point(lambda v: int(v * 0.5)))
    im.alpha_composite(dark); return im

def place(img, item, c, rot=0):
    it = item.rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def shadow(item, off=(10, 18), blur=20, alpha=100): return C.shadow(item, offset=off, blur=blur, alpha=alpha)

def big(img, xy, text, px=170, anchor='mm'):
    """Big words: Corben Bold in the accent with a black edge and a soft drop shadow."""
    f = F(HEAD, px); sh = Image.new('RGBA', img.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).text((xy[0] + 6, xy[1] + 10), text, font=f, fill=(0, 0, 0, 120), anchor=anchor, stroke_width=7, stroke_fill=(0, 0, 0, 120))
    img.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8)))
    ImageDraw.Draw(img).text(xy, text, font=f, fill=MINT, anchor=anchor, stroke_width=7, stroke_fill=INK)

def label(text, px=58):
    """Words typed on real label-maker tape: the photo's cut ends kept, its middle stretched to fit, raised white letters."""
    tape = prop('label-tape-black'); f = F(LABEL, px); sp = int(px * 0.16)
    tw = sum(f.getbbox(ch)[2] for ch in text) + sp * (len(text) - 1)
    h = int(px * 1.75); s = h / tape.height; tape = tape.resize((int(tape.width * s), h), Image.LANCZOS)
    end = int(h * 0.5); length = max(tw + 2 * int(px * 0.9), 2 * end + 10)
    out = Image.new('RGBA', (length, h), (0, 0, 0, 0))
    out.alpha_composite(tape.crop((0, 0, end, h)), (0, 0))
    out.alpha_composite(tape.crop((end, 0, tape.width - end, h)).resize((length - 2 * end, h)), (end, 0))
    out.alpha_composite(tape.crop((tape.width - end, 0, tape.width, h)), (length - end, 0))
    d = ImageDraw.Draw(out); x = (length - tw) / 2; y = h / 2
    for ch in text:
        d.text((x + 1, y + 2), ch, font=f, fill=(0, 0, 0, 200), anchor='lm'); d.text((x, y), ch, font=f, fill=(236, 236, 232, 255), anchor='lm')
        x += f.getbbox(ch)[2] + sp
    return C.shadow(out, offset=(4, 7), blur=6, alpha=90)

def instant_photo(clip=None, width=640, develop=1.0, note=None, window=False):
    """The real instant photo. clip shows in the picture; develop < 1 leaves it part dark; window=True makes the
    picture area see-through (an empty frame)."""
    ph = prop('instant-photo-blank'); s = width / ph.width
    ph = ph.resize((width, int(ph.height * s)), Image.LANCZOS)
    x0, y0, x1, y1 = [int(v * s) for v in PHOTO_PIC]
    if window:
        a = ph.split()[3]; ImageDraw.Draw(a).rectangle((x0, y0, x1, y1), fill=0); ph.putalpha(a)
    if clip is not None:
        pic = footage(clip, (x1 - x0, y1 - y0))
        if develop < 1: pic.alpha_composite(Image.new('RGBA', pic.size, (52, 50, 52, int(255 * (1 - develop)))))
        ph.alpha_composite(pic, (x0, y0))
    if note:
        ImageDraw.Draw(ph).text(((x0 + x1) / 2, (y1 + ph.height) / 2 + 4), note, font=F(HAND, int(width * 0.11)), fill=INK, anchor='mm')
    return ph, (x0, y0, x1, y1)

def camera(width, lens_clip=None):
    """The real camera; with lens_clip, that clip plays inside the lens (you look at the scene through it)."""
    cam = prop('instant-camera'); s = width / cam.width
    cam = cam.resize((width, int(cam.height * s)), Image.LANCZOS)
    if lens_clip is not None:
        cx, cy, r = [v * s for v in CAM_LENS]; d = int(2 * r)
        disc = footage(lens_clip, (d, d)); m = Image.new('L', (d, d), 0); ImageDraw.Draw(m).ellipse((0, 0, d - 1, d - 1), fill=255)
        rim = Image.new('RGBA', (d, d), (0, 0, 0, 0)); rd = ImageDraw.Draw(rim)        # a little lens glass: dark rim + glint
        rd.ellipse((0, 0, d - 1, d - 1), outline=(10, 10, 12, 230), width=max(4, d // 40))
        disc.alpha_composite(rim); disc.putalpha(m.filter(ImageFilter.GaussianBlur(1)))
        cam.alpha_composite(disc, (int(cx - r), int(cy - r)))
    return cam, s

def timer(diameter, minutes_left=0, opacity=1.0):
    """The real kitchen timer; its dial turned so minutes_left sits under the pointer; semi-transparent if asked."""
    t = prop('kitchen-timer'); cx, cy, r = DIAL
    disc = t.crop((cx - r, cy - r, cx + r, cy + r)).rotate(minutes_left * 6, resample=Image.BICUBIC)
    m = Image.new('L', disc.size, 0); ImageDraw.Draw(m).ellipse((0, 0, 2 * r - 1, 2 * r - 1), fill=255)
    t.paste(disc, (cx - r, cy - r), m.filter(ImageFilter.GaussianBlur(1)))
    s = diameter / (2 * r); t = t.resize((int(t.width * s), int(t.height * s)), Image.LANCZOS)
    if opacity < 1: t.putalpha(t.split()[3].point(lambda v: int(v * opacity)))
    return t

def flash(img, c, r=420, strength=1.0):
    m = Image.new('L', img.size, 0); ImageDraw.Draw(m).ellipse((c[0] - r, c[1] - r, c[0] + r, c[1] + r), fill=255)
    glow = Image.new('RGBA', img.size, (255, 255, 250, 0)); glow.putalpha(m.filter(ImageFilter.GaussianBlur(r * 0.45)).point(lambda v: int(v * strength)))
    img.alpha_composite(glow)

# ---- the frames ------------------------------------------------------------------------------------------------------------
def f1():
    """Through the lens: the camera fills the frame, the before clip plays in its lens; the blurred clip moves behind."""
    im = blur_bg(BEFORE)
    cam, s = camera(1180, BEFORE)
    place(im, shadow(cam), (W / 2 + 30, 1230), -8)
    big(im, (W / 2, 330), 'before', 190)
    place(im, label('WATCH THIS COUCH'), (W / 2, 500), -2)
    return im

def f2():
    """Into the lens: the lens grows until the clip fills the screen, the camera body slides off past the edges."""
    im = blur_bg(BEFORE)
    cam, s = camera(3300, BEFORE)
    lx, ly = CAM_LENS[0] * s, CAM_LENS[1] * s
    im.alpha_composite(cam, (int(W / 2 - lx), int(H / 2 - ly)))
    return im

def f3():
    """Snap: the before fills the screen and the flash bursts from the corner, the cut lands on the white."""
    im = footage(BEFORE)
    flash(im, (120, 260), 900, 1.0); flash(im, (120, 260), 420, 1.0)
    return im

def f4():
    """The print comes out: the camera's top edge at the bottom, the photo slides up out of the slot, still dark
    (the after clip starts with a hand over the lens)."""
    im = blur_bg(AFTER, 0.45)
    cam, s = camera(1300); left = W / 2 - cam.width / 2; top = H - cam.height * 0.40
    slot_w = (CAM_SLOT[2] - CAM_SLOT[0]) * s; slot_cx = left + (CAM_SLOT[0] + CAM_SLOT[2]) / 2 * s
    ph, _ = instant_photo(AFTER, int(slot_w * 0.96), develop=0.06); ph = shadow(ph, (6, 10), 12, 80)
    shown = int(ph.height * 0.86); slot_y = top + CAM_SLOT[1] * s + 8
    im.alpha_composite(ph.crop((0, 0, ph.width, shown)), (int(slot_cx - ph.width / 2), int(slot_y - shown)))
    im.alpha_composite(shadow(cam, (0, 24), 26, 90), (int(left - 76), int(top - 76)))
    return im

def f5():
    """It develops while the timer turns: the photo brightens as the hand pulls away; the top half of the timer, giant and
    see-through, turns down along the bottom with the clip showing through it (its other half is off-screen)."""
    im = blur_bg(AFTER, 0.6)
    ph, _ = instant_photo(AFTER, 700, develop=0.55)
    place(im, shadow(ph), (W / 2 - 40, 820), -3)
    t = timer(1800, minutes_left=8, opacity=0.66); k = 1800 / (2 * DIAL[2])
    im.alpha_composite(t, (int(W / 2 - DIAL[0] * k), int(H + 120 - DIAL[1] * k)))   # dial centre below the bottom edge
    return im

def f6():
    """Breaks out: the after clip grows past its photo window, over the frame's top and sides, toward full screen."""
    im = blur_bg(AFTER, 0.6)
    frame, (x0, y0, x1, y1) = instant_photo(None, int(W * 0.94), window=True)
    fx, fy = int(W / 2 - frame.width / 2), int(H - frame.height - 40)
    im.alpha_composite(shadow(frame, (8, 14), 18, 90), (fx - 46, fy - 46))
    grow = 40; top = 0                                           # wider than the window and running off the top
    clip = footage(AFTER, (x1 - x0 + 2 * grow, fy + y1 - top))
    im.alpha_composite(shadow(clip, (0, 16), 20, 110), (fx + x0 - grow - 52, top - 52))
    big(im, (W / 2, fy + y1 + (frame.height - y1) / 2 - 6), 'after', 170)
    return im

def f7():
    """Held against the scene: the before photo slides in over the after, lined up with the same spot (then / now)."""
    im = footage(AFTER)
    ph, (x0, y0, x1, y1) = instant_photo(None, 660, note='then')
    cx, cy = W / 2, 900; px, py = int(cx - ph.width / 2), int(cy - ph.height / 2)
    ph.alpha_composite(footage(BEFORE).crop((px + x0, py + y0, px + x1, py + y1)), (x0, y0))   # the same spot, then
    place(im, shadow(ph, (14, 22), 24, 110), (cx + 4, cy + 4), 0)
    place(im, label('NOW', 70), (850, 1560), 4)
    return im

def f8():
    """CTA: on the cork, the before and after photos pinned at the edges; the camera prints the product last."""
    im = cork()
    for clip, c, rot, note in ((BEFORE, (90, 1000), -12, 'before'), (AFTER, (1000, 1080), 10, 'after')):
        ph, _ = instant_photo(clip, 420, note=note); place(im, shadow(ph, (6, 10), 12, 95), c, rot)
        a = math.radians(-rot); t = ph.height / 2 - 26
        pin = prop('pin-head-blue' if rot < 0 else 'pin-head-white').resize((96, 96), Image.LANCZOS)
        place(im, shadow(pin, (12, 16), 8, 110), (c[0] + t * math.sin(a), c[1] - t * math.cos(a)))
    cam, s = camera(980); left = W / 2 - cam.width / 2; top = H - cam.height * 0.48
    slot_w = (CAM_SLOT[2] - CAM_SLOT[0]) * s; slot_cx = left + (CAM_SLOT[0] + CAM_SLOT[2]) / 2 * s
    ph, _ = instant_photo(PRODUCT, int(slot_w * 0.96)); ph = shadow(ph, (6, 10), 12, 80)
    shown = int(ph.height * 0.9); slot_y = top + CAM_SLOT[1] * s + 8
    im.alpha_composite(ph.crop((0, 0, ph.width, shown)), (int(slot_cx - ph.width / 2), int(slot_y - shown)))
    im.alpha_composite(shadow(cam, (0, 24), 26, 90), (int(left - 76), int(top - 76)))
    place(im, label('WANT THE VACUUM?'), (W / 2, 190), -2)
    big(im, (W / 2, 340), 'Comment', 150)
    big(im, (W / 2, 500), '"CLEAN"', 150)
    return im

def main():
    frames = [f1(), f2(), f3(), f4(), f5(), f6(), f7(), f8()]
    names = ['1 through the lens', '2 into the lens', '3 snap', '4 the print comes out dark',
             '5 it develops as the timer turns', '6 the after breaks out', '7 then, held against now', '8 CTA']
    for old in OUT.glob('*.jpg'):
        if old.name != 'font-options.jpg': old.unlink()
    for n, f in zip(names, frames): f.convert('RGB').save(OUT / f'{n}.jpg', quality=90)
    sheet = Image.new('RGB', (W * 4 + 60, H * 2 + 20), 'white')
    for i, f in enumerate(frames): sheet.paste(f.convert('RGB'), ((i % 4) * (W + 20), (i // 4) * (H + 20)))
    sheet.resize((sheet.width // 3, sheet.height // 3)).save(OUT / 'storyboard-03.jpg', quality=90)
    print('saved', OUT)

if __name__ == '__main__':
    main()
