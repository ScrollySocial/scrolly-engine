"""Clean cut-outs with a real background-removal model (rembg isnet-general-use, downloaded 2026-10-18 with her OK),
replacing the white flood-fill that left grey halos and couldn't handle glass or white objects (her note).
Runs with the carousels venv (it has rembg):
  automation/carousels/.venv/Scripts/python.exe build/cutout_hq.py <folder> <file> [<file> ...]
Writes build/.cache/hq/<stem>.png (trimmed, alpha matting on). Already-cut files are skipped.
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps
from rembg import new_session, remove

PACK = Path(__file__).resolve().parent.parent
SRC = PACK / 'assets' / 'props' / 'source'
OUT = Path(__file__).resolve().parent / '.cache' / 'hq'; OUT.mkdir(parents=True, exist_ok=True)

def main():
    folder, files = sys.argv[1], sys.argv[2:]
    session = None
    for f in files:
        dst = OUT / (Path(f).stem + '.png')
        if dst.exists(): print('have', dst.name); continue
        session = session or new_session('isnet-general-use')
        im = ImageOps.exif_transpose(Image.open(SRC / folder / f)).convert('RGB'); im.thumbnail((1400, 1400), Image.LANCZOS)   # matting runs out of memory on bigger
        try:
            out = remove(im, session=session, alpha_matting=True, alpha_matting_foreground_threshold=240,
                         alpha_matting_background_threshold=15, alpha_matting_erode_size=6)
        except MemoryError:                                # matting needs too much memory on some photos:
            out = remove(im, session=session)              # the model's own mask is clean enough, tighten it 1 px
            a = out.split()[3].filter(ImageFilter.MinFilter(3)); out.putalpha(a)
        out = out.crop(out.getbbox()); out.save(dst); print('cut', dst.name, out.size)

if __name__ == '__main__':
    main()
