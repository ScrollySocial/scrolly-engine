"""Real-object props for the packing templates (images Mercedes supplied 2026-10-17: ChatGPT-made, plus pink paper
shreds from a royalty-free site and the open box from Pexels). Cuts each one out from its white background, makes the
white version of the open box, and splits the open box into its floor and four flaps so the flaps can close on screen.
Usage: python build/props.py  ->  assets/props/*.png   (python build/props.py 03 for #3's camera, instant photo, timer)
"""
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

PROPS = Path(__file__).resolve().parent.parent / 'assets' / 'props'
SRC = PROPS / 'source'

def cut_white(im, tol=26, feather=1.5):
    """Remove a near-white background that touches the edges (flood fill from the border), with a soft edge."""
    if im.mode == 'RGBA' and im.getextrema()[3][0] == 0:   # already cut out: just trim
        return im.crop(im.getbbox())
    im = im.convert('RGBA'); w, h = im.size
    gray = ImageOps.grayscale(im.convert('RGB'))
    near = gray.point(lambda v: 255 if v >= 255 - tol else 0)
    mask = Image.new('L', (w + 2, h + 2), 255); mask.paste(near, (1, 1))   # a white border so the fill goes all the way round
    ImageDraw.floodfill(mask, (0, 0), 128)   # 128 = background reachable from the edge
    bg = mask.crop((1, 1, w + 1, h + 1)).point(lambda v: 255 if v == 128 else 0)
    alpha = ImageChops.invert(bg).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(feather))
    im.putalpha(ImageChops.multiply(im.split()[3], alpha))
    return im.crop(im.getbbox())

def rect_cut(im, thresh=246, radius=10):
    """For a rectangular object on white whose top is nearly white (the envelope): keep its bounding rectangle."""
    g = ImageOps.grayscale(im.convert('RGB')); w, h = g.size
    rows = [y for y in range(h) if min(g.crop((0, y, w, y + 1)).getdata()) < thresh]
    cols = [x for x in range(w) if min(g.crop((x, 0, x + 1, h)).getdata()) < thresh]
    box = (cols[0], rows[0], cols[-1] + 1, rows[-1] + 1)
    out = im.convert('RGBA').crop(box)
    m = Image.new('L', out.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, out.width - 1, out.height - 1), radius=radius, fill=255)
    out.putalpha(m); return out

def whiten(im, lift=1.0):
    """A white corrugated box from a kraft one: keep the texture and shading, lose the brown."""
    a = im.split()[3]
    g = ImageOps.grayscale(im.convert('RGB'))
    g = ImageOps.autocontrast(g, cutoff=1).point(lambda v: min(255, int(178 + v * 0.33)))   # bright white, keeps the shading
    rgb = Image.merge('RGB', (g.point(lambda v: min(255, v + 2)), g, g.point(lambda v: max(0, v - 4))))  # a touch warm
    out = rgb.convert('RGBA'); out.putalpha(a); return out

# the open box photo (1448 x 1086, landscape): opening and flaps, measured on the image
OPEN_FLOOR = (322, 262, 1132, 752)
FLAPS = {'top': (300, 60, 1140, 262), 'bottom': (318, 752, 1150, 1036), 'left': (74, 256, 322, 770),
         'right': (1132, 254, 1376, 772)}

def main():
    for name in ('packing-peanut', 'wax-seal-thank-you', 'box-closed-top'):
        cut_white(Image.open(SRC / f'{name}.webp')).save(PROPS / f'{name}.png')
    env = rect_cut(Image.open(SRC / 'envelope.webp')); env.save(PROPS / 'envelope.png')
    box = cut_white(Image.open(SRC / 'box-open-top.webp'), tol=18)
    # crop the stray sliver on the closed box's right edge
    closed = Image.open(PROPS / 'box-closed-top.png'); closed.crop((0, 0, closed.width - 14, closed.height)).save(PROPS / 'box-closed-top.png')
    for colour, img in (('kraft', box), ('white', whiten(box))):
        img.save(PROPS / f'box-open-{colour}.png')
        full = img if False else (Image.open(SRC / 'box-open-top.webp').convert('RGBA'))
        full = full if colour == 'kraft' else whiten(full)
        full.crop(OPEN_FLOOR).save(PROPS / f'box-floor-{colour}.png')
        for k, b in FLAPS.items():
            full.crop(b).save(PROPS / f'box-flap-{k}-{colour}.png')
    Image.open(SRC / 'paper-shreds-pink.webp').convert('RGB').save(PROPS / 'paper-shreds-pink.png')
    print('props ->', PROPS)

# #3 Before and after (Mercedes, 2026-10-17, ChatGPT): file names as she saved them
PROPS_03 = {'instant-camera': 'Mint Green Retro Instant Camera.png', 'kitchen-timer': 'Cream Retro Kitchen Timer Dial.png'}

def drop_floor_shadow(im, band=0.16, light=175, grey=16):
    """Remove the pale floor shadow under an object stood on white (it reads as a white smear on sage); the storyboard
    adds its own soft shadow."""
    im = im.copy(); px = im.load(); w, h = im.size
    for y in range(int(h * (1 - band)), h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a and (r + g + b) // 3 > light and max(r, g, b) - min(r, g, b) < grey:
                px[x, y] = (r, g, b, 0)
    return im.crop(im.getbbox())

def main_03():
    for name, f in PROPS_03.items():
        drop_floor_shadow(cut_white(Image.open(SRC / f), tol=14)).save(PROPS / f'{name}.png')
    # white frame on white: keep its rectangle (the frame is a touch greyer than the background)
    rect_cut(Image.open(SRC / 'Blank Polaroid on White Background.png'), thresh=240, radius=6).save(PROPS / 'instant-photo-blank.png')
    print('props 03 ->', PROPS)

if __name__ == '__main__':
    main_03() if '03' in sys.argv[1:] else main()
