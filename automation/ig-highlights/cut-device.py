"""Cut a green-screen device prop (shared prop library, tech/) off its white background and make the screen transparent.
Prints the screen box so the video builder can place the page recording under it.
Usage: python cut-device.py "<prop file name>" <out name>      e.g. python cut-device.py "Open silver laptop with green screen-33.png" laptop
"""
import sys, json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops

HERE = Path(__file__).parent
SRC = HERE / '../reel-template-pack/assets/props/source/tech'
im = Image.open(SRC / sys.argv[1]).convert('RGB')
W, H = im.size
key = im.copy()
for p in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1), (W // 2, 0), (W // 2, H - 1), (0, H // 2), (W - 1, H // 2)]:
    ImageDraw.floodfill(key, p, (255, 0, 255), thresh=30)
r, g, b = key.split()
bg = ImageChops.multiply(ImageChops.multiply(r.point(lambda v: 255 if v == 255 else 0), b.point(lambda v: 255 if v == 255 else 0)), g.point(lambda v: 255 if v == 0 else 0))
alpha = ImageChops.invert(bg).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1))
px = im.load()
gm = Image.new('L', (W, H), 0)
gp = gm.load()
for y in range(H):
    for x in range(W):
        R, G, B = px[x, y]
        if G > 150 and G - R > 80 and G - B > 80:
            gp[x, y] = 255
box = gm.getbbox()
alpha = ImageChops.subtract(alpha, gm.filter(ImageFilter.MaxFilter(5)))
out = im.copy()
out.putalpha(alpha)
d = out.load()
for y in range(H):  # take the green spill off the bezel
    for x in range(W):
        R, G, B, A = d[x, y]
        if A and G > max(R, B) + 10:
            d[x, y] = (R, max(R, B), B, A)
crop = alpha.getbbox()
out = out.crop(crop)
box = (box[0] - crop[0], box[1] - crop[1], box[2] - crop[0], box[3] - crop[1])
out.save(HERE / 'assets' / f'{sys.argv[2]}.png')
print(json.dumps({'file': f'assets/{sys.argv[2]}.png', 'w': out.size[0], 'h': out.size[1], 'screen': {'x': box[0], 'y': box[1], 'w': box[2] - box[0], 'h': box[3] - box[1]}}))
