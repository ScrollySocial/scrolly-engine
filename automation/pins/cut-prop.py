"""Cuts an object prop out of a stock photo (rembg general model, runs locally) into a transparent PNG.
Usage: ../carousels/.venv/Scripts/python cut-prop.py <input.jpg> <x0> <y0> <x1> <y1> <output.png>
"""
import sys
from PIL import Image
from rembg import remove, new_session

src, x0, y0, x1, y1, dst = sys.argv[1], *map(int, sys.argv[2:6]), sys.argv[6]
img = Image.open(src).convert("RGB").crop((x0, y0, x1, y1))
out = remove(img, session=new_session("u2net"))
out = out.crop(out.getbbox())
out.save(dst)
print("saved", dst, out.size)
