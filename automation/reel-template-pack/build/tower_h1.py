"""h1's midnight clock tower (2026-10-20, Mercedes: "I like the clock tower"): her Big Ben-style tower photo with its
painted hands taken off the dial (the patterned glass under them is copied from the same dial turned 180 degrees,
where nothing covers it), graded to night with the dial left lit, and the real brass hands from her hands photo,
each padded so its pivot is the image centre (CapCut turns a layer about its centre)."""
import math, random
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter
import engine as E
import storyboard_halloween as B

LIB = E.PACK / 'assets' / 'props' / 'source'
DIAL_C, DIAL_R, GLASS_R = (510, 1203), 140, 72      # on her 1024 x 1536 photo

def tower():
    """(night tower with a clean lit dial, dial centre in the image, dial radius) at the photo's own size."""
    src = Image.open(LIB / 'fall' / 'Big Ben-Style Clock Tower Crown.png').convert('RGB'); cx, cy = DIAL_C
    # 1 the inner patterned glass (r < 72) is rebuilt from one clean patch of the same glass (lower left, clear of the
    #   hands and their shadows), tiled with flips so the cracks don't repeat visibly
    tile = src.crop((cx - 45, cy + 25, cx - 15, cy + 55)); rng = random.Random(5); n = tile.width
    glass_im = Image.new('RGB', (2 * GLASS_R + n, 2 * GLASS_R + n))
    for y in range(0, glass_im.height, n):
        for x in range(0, glass_im.width, n):
            t = tile.transpose(Image.FLIP_LEFT_RIGHT) if rng.random() < 0.5 else tile
            glass_im.paste(t.transpose(Image.FLIP_TOP_BOTTOM) if rng.random() < 0.5 else t, (x, y))
    glass = Image.new('L', src.size, 0)
    ImageDraw.Draw(glass).ellipse((cx - GLASS_R + 2, cy - GLASS_R + 2, cx + GLASS_R - 2, cy + GLASS_R - 2), fill=255)
    full = src.copy(); full.paste(glass_im, (cx - GLASS_R, cy - GLASS_R))
    clean = Image.composite(full, src, glass.filter(ImageFilter.GaussianBlur(1)))
    # 2 where the hand tips cross the ring band and minute track (r 70 to 106, round 10 and 2 o'clock), the dial
    #   turned half round (the same ring and ticks, no hands there) fills in
    turned = src.rotate(180, center=DIAL_C, resample=Image.BICUBIC); tips = Image.new('L', src.size, 0); d = ImageDraw.Draw(tips)
    for ang in (-148, -25):
        d.pieslice((cx - 108, cy - 108, cx + 108, cy + 108), ang - 9, ang + 9, fill=255)
    ring = Image.new('L', src.size, 0); ImageDraw.Draw(ring).ellipse((cx - 68, cy - 68, cx + 68, cy + 68), fill=255)
    tips = ImageChops.subtract(tips, ring)
    clean = Image.composite(turned, clean, tips.filter(ImageFilter.GaussianBlur(1.5)))
    cut = B.cut_white(clean, tol=10); off = _offset(clean, cut)
    night = ImageEnhance.Color(ImageEnhance.Brightness(cut).enhance(0.42)).enhance(0.55)
    dc = (cx - off[0], cy - off[1]); lit = Image.new('L', cut.size, 0)
    ImageDraw.Draw(lit).ellipse((dc[0] - DIAL_R, dc[1] - DIAL_R, dc[0] + DIAL_R, dc[1] + DIAL_R), fill=255)
    warm = ImageEnhance.Brightness(cut).enhance(1.05)
    night.paste(warm, (0, 0), ImageChops.multiply(lit.filter(ImageFilter.GaussianBlur(2)), cut.split()[3]))
    return night, dc, DIAL_R

def _offset(full, cut):
    """Where B.cut_white's trimmed image sits in the untrimmed one."""
    a = full.convert('RGBA'); g = B.cut_white(full, tol=10)
    bb = Image.new('L', full.size, 0)
    # cut_white trims to the alpha bbox: rebuild that bbox from an untrimmed alpha
    im = full.convert('RGBA'); w, h = im.size
    gray = im.convert('L'); near = gray.point(lambda v: 255 if v >= 245 else 0)
    m = Image.new('L', (w + 2, h + 2), 255); m.paste(near, (1, 1)); ImageDraw.floodfill(m, (0, 0), 128)
    fg = m.crop((1, 1, w + 1, h + 1)).point(lambda v: 0 if v == 128 else 255)
    box = fg.getbbox(); return (box[0], box[1]) if box else (0, 0)

def hands(minute_len):
    """(hour hand, minute hand), real brass, pivot at the image centre; minute_len = pivot to tip in px."""
    src = B.cut_white(Image.open(LIB / 'fall' / 'Vintage dark brass clock hands-29.png'), tol=10); out = []
    for half, length in (((0, 0, src.width // 2, src.height), 0.68), ((src.width // 2, 0, src.width, src.height), 1.0)):
        h = src.crop(half); h = h.crop(h.getbbox()); pivot_y = h.height - h.width * 0.5 * 0.55
        k = minute_len * length / pivot_y; h = h.resize((max(1, int(h.width * k)), max(1, int(h.height * k))), Image.LANCZOS)
        py = int(pivot_y * k); pad = Image.new('RGBA', (h.width, 2 * py), (0, 0, 0, 0)); pad.alpha_composite(h, (0, 0))
        out.append(pad)
    return out
