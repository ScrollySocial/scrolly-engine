"""Cuts a person out of a library photo (background removal runs locally, no account needed).
Writes a transparent PNG to <photosDir>/cutouts/<media-id>.png; then run `node scan-media.mjs` to index it.
Usage: .venv/Scripts/python cutout.py <media-id> [<media-id> ...]
       .venv/Scripts/python cutout.py --file <input-image> <output.png>   (test on any file)
"""
import json, sys, pathlib
from PIL import Image, ImageOps
from rembg import remove, new_session

HERE = pathlib.Path(__file__).parent
session = new_session("u2net_human_seg")  # tuned for people; model downloads once (~170 MB) on first run

def cut(src, dst):
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    out = remove(img, session=session, alpha_matting=True, alpha_matting_erode_size=8)
    bbox = out.getbbox()
    if bbox: out = out.crop(bbox)
    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst)
    print(f"{dst}  ({out.width}x{out.height})")

args = sys.argv[1:]
if args[:1] == ["--file"]:
    cut(pathlib.Path(args[1]), pathlib.Path(args[2]))
else:
    media = json.loads((HERE / "config/media.json").read_text(encoding="utf8"))
    items = {i["id"]: i for i in json.loads((HERE / "data/media-index.json").read_text(encoding="utf8"))["items"]}
    root = pathlib.Path(media["photosDir"])
    for mid in args:
        it = items.get(mid)
        if not it or it["type"] != "photo": sys.exit(f"{mid}: not a photo in the index (run node scan-media.mjs)")
        cut(root / it["file"], root / "cutouts" / f"{mid}.png")
