"""The designed Reel cover as its own editable CapCut project in every buyer folder (Mercedes, 2026-10-21).

CapCut 8.9's own cover editor (the "Cover" button on the main track) only takes a flat picture on the free plan: adding
or editing text there asks for an upgrade, so an editable cover can't live inside the template project. Instead each
buyer folder gets a second small project, "NN COVER Title": one still built from build/cover_designs.py cNN() with the
same editable pieces as the template (the buyer's clip 1 fills the frame, every word is CapCut text, doodles are
Scrolly Doodles letters, props are pictures). The buyer changes the words, exports one frame and uploads it as the
Reel's cover on Instagram. The flat cover (NN-.../cover/cover.png) also becomes the home-screen picture
(draft_cover.jpg) of both projects.

Run after make.py (a rebuild wipes the buyer folder), then zip_upload.py:
    python build/capcut_cover.py 24 02 h6        (from automation/reel-template-pack)
No video render: the only encode is the cover's 4-second placeholder clip, from one still.
"""
import importlib, json, shutil, sys
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import editable as Ed
import covers as CV
from engine import W, H

SECS = 4.0     # the cover project's length: a still, long enough to see and to export a frame from

HOW_TO = """How to make your Reel cover (free CapCut)

"{cover}" is your Reel's cover as its own CapCut project. The installer puts it on CapCut's home screen next to the
template, with your clip 1 in the background.

1. Open "{cover}" in CapCut.
2. Swap the background: right-click the clip on the timeline, choose Replace, and pick the clip or photo you want
   behind the words.
3. Double-click any word to change it, its font, colour or outline. Doodles are letters too: change their colour the
   same way.
4. Export it as a picture: Export, then pick the image option (or export it as a short video and take a screenshot
   of it on your phone).
5. On Instagram, when you post the Reel, tap Edit cover, then Add from camera roll, and pick your cover.

Instagram's profile grid shows only the middle of the cover (3:4), so the words already sit in the middle.
"""


def spec_for(key):
    import cover_designs as CD
    return CD.SPECS.get(key) or importlib.import_module(f'templates.t{key}').SPEC


def _project(buyer):
    """The template's CapCut project in the buyer folder (the one that isn't a COVER project)."""
    hits = [p for p in buyer.iterdir() if p.is_dir() and (p / 'draft_content.json').exists() and ' COVER ' not in p.name]
    if len(hits) != 1: sys.exit(f'{buyer}: expected one template project, found {[p.name for p in hits]}')
    return hits[0]


def layers(cv):
    """covers.Cover -> engine.Layers on 0..SECS, in CapCut's paint order (clip, pictures, then text)."""
    L = E.Layers(); z = 0; t = (0.0, SECS)
    for l in cv.L:
        if l['kind'] == 'clip':
            L.clip(l['slot'], t, z, l['pos'], (W, H), l['rot']); z += 1
    for i, l in enumerate(x for x in cv.L if x['kind'] == 'art'):
        img = l['img']
        if abs(l.get('scale', 1) - 1) > 0.005:
            img = img.resize((max(1, int(img.width * l['scale'])), max(1, int(img.height * l['scale']))), Image.LANCZOS)
        L.art(f'cover-{i:02d}-{l["name"]}', img, t, z, l['pos'], l['rot']); z += 1
    italic = set()
    for l in cv.L:
        if l['kind'] != 'text': continue
        z += 1
        L.text(l['font'], l['size'], l['words'], t, z, l['pos'], l['rot'], color=l['color'], shadow=l['shadow'],
               stroke=l['stroke'], box=l['box'])
        if l['font'] == 'doodles': L.L[-1]['centred'] = True
        if l.get('italic_last') and len(l['words'][0].split()) > 1: italic.add(l['words'][0])
    return L, italic


def placeholder_clip(cv, slot, dest):
    """The cover's clip slot: covers.placeholder() (the dark, video-like card the designed cover shows) as a 4 s clip."""
    l = next(x for x in cv.L if x['kind'] == 'clip' and x['slot'] == slot)
    png = dest / f'slot-{slot + 1}.png'; CV.placeholder(slot, l['what'], l['at']).save(png)
    mp4 = dest / f'slot-{slot + 1}.mp4'
    E.run([E.FFMPEG, '-v', 'error', '-y', '-loop', '1', '-framerate', '30', '-i', str(png), '-t', str(SECS + 1),
           '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(mp4)])
    png.unlink(); return mp4


def make(key):
    spec = spec_for(key); out = E.PACK / spec['dir']
    bf = [p for p in (out / 'buyer-folder').glob('*') if p.is_dir()] if (out / 'buyer-folder').exists() else []
    if len(bf) != 1: sys.exit(f'{key}: no single buyer folder (run make.py first)')
    buyer = bf[0]; main = _project(buyer)
    cover_png = out / 'cover' / 'cover.png'
    if not cover_png.exists(): sys.exit(f'{key}: no designed cover (run build/covers.py {key})')
    import cover_designs as CD
    cv = getattr(CD, f'c{key}')()
    name = f'{spec["num"]} COVER {main.name.split(" ", 1)[1]}'
    work = out / '_work_cover'
    if work.exists(): shutil.rmtree(work)
    (work / 'art').mkdir(parents=True)
    L, italic = layers(cv); E.apply_centering(L.L)
    slots = sorted({l['slot'] for l in L.L if l['kind'] == 'clip'})
    if slots != list(range(len(slots))): sys.exit(f'{key}: cover clip slots must start at clip 1: {slots}')
    slot_files = [placeholder_clip(cv, s, work) for s in slots]
    art_files = {}
    for n, img in L.A.items():
        f = work / 'art' / f'{n}.png'; img.save(f); art_files[n] = f
    for old in buyer.glob(f'{spec["num"]} COVER *'): shutil.rmtree(old)
    proj = buyer / name
    E.build_capcut(proj, name, slot_files, [SECS + 1] * len(slot_files), art_files, L.L)
    files = [proj / 'draft_content.json'] + list((proj / 'Timelines').glob('*/draft_content.json'))
    Ed._canvas(cv.stage, files); Ed._flags(files)
    if italic:
        (proj / 'Resources' / 'fonts').mkdir(exist_ok=True); shutil.copy2(E.BUNDLED_FONTS['dmsi'], proj / 'Resources' / 'fonts')
        Ed._italicise(italic, files)
    lic = Ed.FD / 'dmserifdisplay-OFL.txt'
    if (proj / 'Resources' / 'fonts').exists() and lic.exists(): shutil.copy2(lic, proj / 'Resources' / 'fonts' / 'DMSerifDisplay-OFL.txt')
    shutil.rmtree(work)
    jpg = Image.open(cover_png).convert('RGB')
    for p in (main, proj): jpg.save(p / 'draft_cover.jpg', quality=90)
    shutil.copy2(E.HERE / 'installer' / 'install.ps1', buyer / 'install.ps1')    # installs both projects
    (buyer / 'How to make your cover.txt').write_text(HOW_TO.format(cover=name).replace('\n', '\r\n'), encoding='utf-8')
    print('cover project:', proj)
    return proj


if __name__ == '__main__':
    for k in sys.argv[1:]: make(k)
