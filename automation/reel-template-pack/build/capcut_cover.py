"""The designed Reel cover as the first 0.2 s of every template's CapCut project (Mercedes, 2026-10-21).

CapCut 8.9's own cover editor (the "Cover" button on the main track) only takes a flat picture on the free plan: adding
or editing text there asks for an upgrade. A separate cover project worked but was more steps for buyers, so (her pick)
the cover is now the opening 0.2 s of the Reel itself, built from build/cover_designs.py cNN() with the same editable
pieces as the template: the buyer's clip 1 fills the frame (on the main track), every word is CapCut text, doodles are
Scrolly Doodles letters, props are pictures. Everything else in the template starts 0.2 s later. When posting, the
buyer picks that first frame as the Reel's cover in Instagram. The flat cover (NN-.../cover/cover.png) is also the
project's home-screen picture (draft_cover.jpg).

Run after make.py (a rebuild wipes the buyer folder), then zip_upload.py:
    python build/capcut_cover.py 24 02 h6        (from automation/reel-template-pack)
Running it again swaps the cover for the current design (the layers it added are listed in cover-layers.json in the
project). No video render and no encode: the cover reuses the template's own clip 1 placeholder.
"""
import copy, importlib, json, shutil, sys, tempfile
from pathlib import Path
from PIL import Image
sys.path.insert(0, str(Path(__file__).resolve().parent))
import engine as E
import editable as Ed
from engine import W, H, US

D = 0.2                     # the cover's length at the start of the Reel (seconds)
DU = int(round(D * US))
RECORD = 'cover-layers.json'

HOW_TO = """How to set your Reel cover

The first 0.2 seconds of the template are your Reel's cover: your clip 1 behind the template's words. Change it like
the rest of the template: double-click a word to change it, its font, colour or outline (the doodles are letters
too, so they recolour the same way), or right-click clip 1 and choose Replace.

When you post the Reel on Instagram, tap Edit cover and slide to the very first frame. Instagram's profile grid shows
only the middle of the cover (3:4), so the words already sit in the middle.
"""


def spec_for(key):
    import cover_designs as CD
    return CD.SPECS.get(key) or importlib.import_module(f'templates.t{key}').SPEC


def _project(buyer):
    hits = [p for p in buyer.iterdir() if p.is_dir() and (p / 'draft_content.json').exists() and ' COVER ' not in p.name]
    if len(hits) != 1: sys.exit(f'{buyer}: expected one template project, found {[p.name for p in hits]}')
    return hits[0]


def layers(cv):
    """covers.Cover -> engine.Layers on 0..D, in CapCut's paint order (clip, pictures, then text)."""
    L = E.Layers(); z = 0; t = (0.0, D)
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


def _shift(d, du):
    for t in d['tracks']:
        for s in t['segments']: s['target_timerange']['start'] += du
    d['duration'] += du


def _all_ids(x, out):
    if isinstance(x, dict):
        if isinstance(x.get('id'), str): out.add(x['id'])
        for v in x.values(): _all_ids(v, out)
    elif isinstance(x, list):
        for v in x: _all_ids(v, out)
    return out


def strip(proj):
    """Take out a cover this script added before (cover-layers.json), so a rerun never stacks two covers."""
    rec_f = proj / RECORD
    if not rec_f.exists(): return
    rec = json.loads(rec_f.read_text(encoding='utf-8'))
    segs, tracks, mats = set(rec['segments']), set(rec['tracks']), set(rec['materials'])
    for f in _drafts(proj):
        d = json.loads(f.read_text(encoding='utf-8'))
        d['tracks'] = [t for t in d['tracks'] if t['id'] not in tracks]
        for t in d['tracks']: t['segments'] = [s for s in t['segments'] if s['id'] not in segs]
        for k, v in d['materials'].items():
            if isinstance(v, list): d['materials'][k] = [m for m in v if not (isinstance(m, dict) and m.get('id') in mats)]
        _shift(d, -rec['us'])
        f.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    _meta_duration(proj, -rec['us'])
    for a in rec['art']: (proj / 'Resources' / 'art' / a).unlink(missing_ok=True)
    rec_f.unlink()


def _drafts(proj):
    return [proj / 'draft_content.json'] + list((proj / 'Timelines').glob('*/draft_content.json'))


def _meta_duration(proj, du):
    f = proj / 'draft_meta_info.json'; m = json.loads(f.read_text(encoding='utf-8'))
    m['tm_duration'] = int(m['tm_duration']) + du; f.write_text(json.dumps(m, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')


def make(key):
    spec = spec_for(key); out = E.PACK / spec['dir']
    bf = [p for p in (out / 'buyer-folder').glob('*') if p.is_dir()] if (out / 'buyer-folder').exists() else []
    if len(bf) != 1: sys.exit(f'{key}: no single buyer folder (run make.py first)')
    buyer = bf[0]; main = _project(buyer)
    cover_png = out / 'cover' / 'cover.png'
    if not cover_png.exists(): sys.exit(f'{key}: no designed cover (run build/covers.py {key})')
    import cover_designs as CD
    cv = getattr(CD, f'c{key}')()
    for old in buyer.glob('* COVER *'): shutil.rmtree(old)            # the separate cover project (first version)
    strip(main)

    L, italic = layers(cv); E.apply_centering(L.L)
    if {l['slot'] for l in L.L if l['kind'] == 'clip'} - {0}: sys.exit(f'{key}: the cover may only use clip 1')
    slot1 = main / 'Resources' / 'slots' / 'slot-1.mp4'
    probe = json.loads((main / 'draft_content.json').read_text(encoding='utf-8'))
    secs = max(m['duration'] for m in probe['materials']['videos'] if m['path'].endswith('/Resources/slots/slot-1.mp4')) / US

    with tempfile.TemporaryDirectory(prefix=f'cover{key}-') as tmp:
        tmp = Path(tmp); (tmp / 'art').mkdir()
        art_files = {}
        for n, img in L.A.items():
            f = tmp / 'art' / f'{n}.png'; img.save(f); art_files[n] = f
        cp = tmp / 'proj'
        E.build_capcut(cp, 'cover', [slot1], [secs], art_files, L.L)
        Ed._flags([cp / 'draft_content.json'])
        if italic: Ed._italicise(italic, [cp / 'draft_content.json'])
        c = json.loads((cp / 'draft_content.json').read_text(encoding='utf-8'))
        for a in art_files.values(): shutil.copy2(a, main / 'Resources' / 'art' / a.name)
        if (cp / 'Resources' / 'fonts').exists():
            (main / 'Resources' / 'fonts').mkdir(exist_ok=True)
            for f in (cp / 'Resources' / 'fonts').iterdir():
                if not (main / 'Resources' / 'fonts' / f.name).exists(): shutil.copy2(f, main / 'Resources' / 'fonts')
            if italic: shutil.copy2(E.BUNDLED_FONTS['dmsi'], main / 'Resources' / 'fonts')
            lic = Ed.FD / 'dmserifdisplay-OFL.txt'
            if lic.exists(): shutil.copy2(lic, main / 'Resources' / 'fonts' / 'DMSerifDisplay-OFL.txt')

    # the cover's clip goes at the head of the main track; its pictures and words on tracks of their own
    ctracks = c['tracks']; clip_track = ctracks[0]
    assert clip_track['type'] == 'video' and all(c_['kind'] == 'clip' for c_ in L.L[:1]), 'the cover clip must be the lowest layer'
    rec = dict(us=DU, segments=[s['id'] for t in ctracks for s in t['segments']], tracks=[t['id'] for t in ctracks[1:]],
               materials=sorted(_all_ids(c['materials'], set())), art=[a.name for a in art_files.values()])
    for f in _drafts(main):
        d = json.loads(f.read_text(encoding='utf-8'))
        _shift(d, DU)
        main_track = next(t for t in d['tracks'] if t['type'] == 'video')
        nxt = main_track['segments'][0] if main_track['segments'] else None
        head = copy.deepcopy(clip_track['segments'][0])
        head['render_index'] = nxt['render_index'] if nxt else 0; head['track_render_index'] = nxt.get('track_render_index', 0) if nxt else 0
        main_track['segments'].insert(0, head)
        for k, v in c['materials'].items():
            if isinstance(v, list) and v: d['materials'].setdefault(k, []).extend(copy.deepcopy(v))
        # the head segment's background: the same Background > Colour as the template's main track
        if nxt:
            src = next((m for m in d['materials'].get('canvases', []) if m['id'] in nxt['extra_material_refs']), None)
            for m in d['materials'].get('canvases', []):
                if src and m['id'] in head['extra_material_refs']: m.update(type=src['type'], color=src['color'], blur=src['blur'])
        vids = [i for i, t in enumerate(d['tracks']) if t['type'] == 'video']
        top_v = max((s['render_index'] for t in d['tracks'] if t['type'] == 'video' for s in t['segments']), default=0)
        top_t = max((s['render_index'] for t in d['tracks'] if t['type'] == 'text' for s in t['segments']), default=14000)
        new_v, new_t = [], []
        for t in ctracks[1:]:
            t = copy.deepcopy(t)
            for s in t['segments']:
                if t['type'] == 'video': top_v += 1; s.update(render_index=top_v, track_render_index=top_v)
                else: top_t += 1; s.update(render_index=top_t, track_render_index=top_t - 14000)
            (new_v if t['type'] == 'video' else new_t).append(t)
        at = (vids[-1] + 1) if vids else 0
        d['tracks'] = d['tracks'][:at] + new_v + d['tracks'][at:] + new_t
        f.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    _meta_duration(main, DU)
    (main / RECORD).write_text(json.dumps(rec), encoding='utf-8')
    Image.open(cover_png).convert('RGB').save(main / 'draft_cover.jpg', quality=90)
    shutil.copy2(E.HERE / 'installer' / 'install.ps1', buyer / 'install.ps1')
    (buyer / 'How to make your cover.txt').unlink(missing_ok=True)
    (buyer / 'How to set your cover.txt').write_text(HOW_TO.replace('\n', '\r\n'), encoding='utf-8')
    print(f'{key}: cover in the first {D} s of', main.name)
    return main


if __name__ == '__main__':
    for k in sys.argv[1:]: make(k)
