"""Contact sheet of wireframe panels for checking (not for Mercedes): python build/wf_sheet.py out.jpg 04 05 ..."""
import sys, glob
from pathlib import Path
from PIL import Image
OUT = Path(__file__).resolve().parent.parent / 'wireframes'
rows = []
for t in sys.argv[2:]:
    fs = sorted(OUT.glob(f'{t}-b*.jpg')); ims = [Image.open(f).resize((270, 480)) for f in fs]
    r = Image.new('RGB', (270 * 6 + 50, 484), 'white')
    for i, im in enumerate(ims): r.paste(im, (i * 272, 2))
    rows.append(r)
sh = Image.new('RGB', (rows[0].width, 484 * len(rows)), 'white')
for i, r in enumerate(rows): sh.paste(r, (0, i * 484))
sh.save(sys.argv[1], quality=85)
