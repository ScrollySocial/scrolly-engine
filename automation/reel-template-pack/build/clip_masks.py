"""Cut the subject out of a stand-in clip's frames (rembg isnet-general-use), for the "text behind the object" effect:
the full-frame clip, then graphics, then the cut-out subject on top (her note on #15, 2026-10-19: the product in the
video is made into its own layer so the drop sits behind it; in CapCut that is a second copy of the clip with
background removal).
Runs with the carousels venv (it has rembg):
  automation/carousels/.venv/Scripts/python.exe build/clip_masks.py <frames dir> <first frame> <count>
Writes <frames dir>/mask/NNNN.png (L, full size). Frames already done are skipped.
"""
import sys
from pathlib import Path
from PIL import Image, ImageFilter
from rembg import new_session, remove

def main():
    d, first, count = Path(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3])
    out = d / 'mask'; out.mkdir(exist_ok=True); session = new_session('isnet-general-use')
    for i in range(first, first + count):
        src = d / f'{i:04d}.jpg'; dst = out / f'{i:04d}.png'
        if dst.exists() or not src.exists(): continue
        im = Image.open(src).convert('RGB'); small = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
        m = remove(small, session=session, only_mask=True).resize(im.size, Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
        m.save(dst); print('mask', dst.name, flush=True)

if __name__ == '__main__':
    main()
