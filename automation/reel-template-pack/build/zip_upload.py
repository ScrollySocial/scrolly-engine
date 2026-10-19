"""Make the upload zips: the buyer folder plus its phone kit.  Usage: python build/zip_upload.py 08 09 h2 ...
(from automation/reel-template-pack). Writes for-upload/<buyer folder name>.zip (Halloween: halloween/for-upload/).
Run make.py for a template first; this only packs what its buyer-folder and phone-kit already hold."""
import sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHONE_README = """Using CapCut on your phone

1. Watch {guide} once. It's this template with colored SHOT cards where your clips go, so you can see the timing.
2. Open "Recipe card.png". It lists every clip, how long it is, and the words to type.
3. In CapCut, tap New project and add your clips in the order on the card. Tap each clip and drag its edges until it
   matches the seconds on the card.
4. Tap Text, then Add text, and type each line from the card. Drag it to start and end at the times listed.
5. The artwork folder holds the template's graphics as see-through PNG images. To add one, tap Overlay, then Add
   overlay, and pick it. Files that end in numbers (for example web-spin-00, web-spin-01) are the frames of one
   animation: use one of them as a still.
6. Tap Export.

On a computer (Windows), the installer builds the full template for you, with every animation: see "How to use.pdf".
"""


def template_dir(tid):
    hits = sorted((ROOT / 'halloween').glob(f'{tid}-*')) if tid.startswith('h') else sorted(ROOT.glob(f'{tid}-*'))
    if not hits: sys.exit(f'no template folder for {tid}')
    return hits[0]


def pack(tid):
    d = template_dir(tid)
    buyer = next((d / 'buyer-folder').iterdir())          # one folder: "Template NN - Name"
    kit = d / 'phone-kit'
    guide = next(kit.glob('*-shot-guide.mp4'))
    out = (ROOT / 'halloween' / 'for-upload' if tid.startswith('h') else ROOT / 'for-upload') / f'{buyer.name}.zip'
    out.parent.mkdir(exist_ok=True)
    tmp = out.with_suffix('.tmp')
    with zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for f in sorted(buyer.rglob('*')):
            if f.is_file(): z.write(f, f'{buyer.name}/{f.relative_to(buyer).as_posix()}')
        top = f'{buyer.name}/Phone kit'
        z.writestr(f'{top}/READ ME (phone).txt', PHONE_README.format(guide=guide.name).replace('\n', '\r\n'))
        z.write(guide, f'{top}/{guide.name}')
        z.write(buyer / 'Recipe card.png', f'{top}/Recipe card.png')
        for f in sorted((kit / 'artwork').glob('*.png')):
            z.write(f, f'{top}/artwork/{f.name}')
    tmp.replace(out)
    print(f'{out.relative_to(ROOT)}  {out.stat().st_size / 1e6:.0f} MB')


for t in sys.argv[1:]:
    pack(t)
