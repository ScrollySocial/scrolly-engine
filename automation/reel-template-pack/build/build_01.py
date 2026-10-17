"""Build template 01 "One product, three ways" for the Reel Template Pack (physical sellers).

Look (Mercedes, 2026-10-16): no Scrolly branding; whimsical collage (paper, tape, Polaroids, hand-drawn marks),
butter yellow, Imbue tall serif headlines (odd-numbered templates; even ones use MADE Awelier), Ink Free handwriting.
Layout: a graphics-only opener with three round windows (the three ways), three taped Polaroid scenes, and a butter
CTA card with a round window on the product. Artwork goes in as image layers with see-through windows, the buyer's
clips sit underneath, and every word is an editable CapCut text layer.

Makes, inside automation/reel-template-pack/01-one-product-three-ways/:
  buyer-folder/Template 01 .../        what a buyer downloads: CapCut project + installer + clips folder + card + guide
  phone-kit/                           shot guide video, slot clips, artwork cards, recipe card for CapCut on a phone
  preview/before.mp4, after.mp4        the template with slot cards, and a finished test Reel

The CapCut project copies the JSON shape of Mercedes's own CapCut 8.9 drafts (read only, never changed).
Video files stay out of git; rerun this script to rebuild them.
Usage: python build/build_01.py   (from automation/reel-template-pack)
"""
import copy, glob, json, math, os, shutil, subprocess, sys, time, uuid
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import collage as C

PACK = HERE.parent
OUT = PACK / '01-one-product-three-ways'
FFMPEG = str(PACK.parent / 'hyperframes-test' / 'bin' / 'ffmpeg.exe')
LOCAL = Path(os.environ['LOCALAPPDATA'])
DRAFTS = LOCAL / 'CapCut' / 'User Data' / 'Projects' / 'com.lveditor.draft'
CACHE = LOCAL / 'CapCut' / 'User Data' / 'Cache' / 'effect'
PROTO = DRAFTS / 'Litter 1'                     # clips and text layers (CapCut 8.9), read only
PROTO_PHOTO = DRAFTS / 'Stain Stick with Reviews'  # image layer on an overlay track, read only
FOOTAGE = Path.home() / 'OneDrive' / 'Desktop' / 'July Videos'
DRAFT_TOKEN = '##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##'
NAME = 'Scrolly 01 One product three ways'
W, H, FPS = 1080, 1920, 30
US = 1_000_000
PX_PER_SIZE = 6.1   # CapCut text size 15 measured at ~92 px on a 1080-wide frame (her "Litter 1" cover)

IMBUE_ID = '7533523619876523280'                # CapCut library font, downloads by id
INKFREE = 'C:/Windows/Fonts/Inkfree.ttf'        # ships with Windows 10 and 11
INK = (24, 22, 20); BUTTER = (246, 228, 160); CREAM = (250, 244, 230)

def font_file(rid):
    return next(p for p in glob.glob(str(CACHE / rid / '*' / '*')) if p.lower().endswith(('.ttf', '.otf'))).replace('\\', '/')
IMBUE = font_file(IMBUE_ID)

# ---- what the buyer films -----------------------------------------------------------------------------------------
SLOTS = [  # (what to film, tip)
    ('Your product, held up or on a table', 'Plain background, good light'),
    ('Way one, in use', 'Show it being used the first way'),
    ('Way two, in use', 'A different place, person or use'),
    ('Way three, in use', 'Save the most surprising way for last'),
]
SLOT_COLORS = [(243, 233, 220), (228, 236, 242), (237, 228, 240), (227, 239, 230)]
TEST_CLIPS = [('IMG_1417', 0.3), ('IMG_1411', 15.5), ('IMG_1405', 3.0), ('IMG_1401', 2.5)]  # her July clips

# ---- scenes ---------------------------------------------------------------------------------------------------------
# Each scene: time, the artwork card, the clips under its windows, and its text layers.
# clip: (slot index, centre x, centre y, CapCut scale, rotation in degrees clockwise)
# text: (font, CapCut size, centre x, centre y, rotation cw, template words, test words)
POL = [  # Polaroid scenes: centre, tilt (cw degrees), numeral position, star position, tape tilt
    dict(c=(560, 1010), tilt=4, num=(150, 330), star=(900, 1640), tape=3),
    dict(c=(520, 1000), tilt=-3, num=(930, 330), star=(170, 1660), tape=-4),
    dict(c=(555, 1010), tilt=2, num=(150, 330), star=(910, 1630), tape=5),
]
PW, PHT, PB, PBOT = 700, 860, 34, 150   # Polaroid size, border, bottom strip
CIRCLES = [(190, 1240), (540, 1240), (890, 1240)]; CD = 250   # opener windows
CTA_C, CTA_D = (540, 620), 420

def rot(p, c, deg_cw):
    """Rotate point p around c by deg clockwise on screen (y down)."""
    a = math.radians(deg_cw); x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))

def scenes():
    sc = []
    labels = [('[way one]', 'floors'), ('[way two]', 'couch'), ('[way three]', 'handheld')]
    sc.append(dict(name='opener', t=(0, 2.5), card='card-0-opener.png',
        clips=[(i + 1, x, y, 0.30, 0) for i, (x, y) in enumerate(CIRCLES)],
        texts=[('imbue', 25, 540, 390, 0, 'One [product],', 'One stick vacuum,'),
               ('imbue', 49, 540, 700, 0, '3 ways', '3 ways')] +
              [('ink', 10, x, 1440, 0, a, b) for (x, _), (a, b) in zip(CIRCLES, labels)]))
    words = [('[way one]', 'floors'), ('[way two]', 'the couch'), ('[way three]', 'handheld, anywhere')]
    for i, p in enumerate(POL):
        win_c = rot((p['c'][0], p['c'][1] - (PBOT - PB) / 2), p['c'], p['tilt'])
        cap_c = rot((p['c'][0], p['c'][1] + PHT / 2 - PBOT / 2), p['c'], p['tilt'])
        sc.append(dict(name=f'way{i + 1}', t=(2.5 + 3 * i, 5.5 + 3 * i), card=f'card-{i + 1}-way.png',
            clips=[(i + 1, win_c[0], win_c[1], 0.66, p['tilt'])],
            texts=[('imbue', 69, p['num'][0], p['num'][1], 0, str(i + 1), str(i + 1)),
                   ('ink', 14, cap_c[0], cap_c[1], p['tilt'], words[i][0], words[i][1])]))
    sc.append(dict(name='cta', t=(11.5, 14), card='card-4-cta.png',
        clips=[(0, CTA_C[0], CTA_C[1], 0.45, 0)],
        texts=[('imbue', 31, 540, 1010, 0, '[Product name]', 'Stick vacuum'),
               ('ink', 13, 540, 1230, 0, 'shop at [where to buy]', 'shop at the link in my bio')]))
    return sc

# ---- artwork cards (PNG with see-through windows) ---------------------------------------------------------------------
def punch(card, mask):
    a = card.split()[3]
    card.putalpha(Image.composite(Image.new('L', card.size, 0), a, mask))

def card_opener():
    card = C.paper((W, H), CREAM, seed=41)
    card = C.place(card, C.pen_loop((800, 440), INK, 8, seed=43), (540, 745), -4)
    card = C.place(card, C.sparkle(70, INK, 5), (930, 250))
    holes = Image.new('L', (W, H), 0); hd = ImageDraw.Draw(holes)
    for (x, y) in CIRCLES:
        ring = Image.new('RGBA', (CD + 20, CD + 20), (0, 0, 0, 0))
        ImageDraw.Draw(ring).ellipse((0, 0, CD + 19, CD + 19), fill=(255, 255, 255, 255))
        card = C.place(card, C.shadow(ring, blur=10, alpha=70), (x, y))
        hd.ellipse((x - CD / 2, y - CD / 2, x + CD / 2, y + CD / 2), fill=255)
    punch(card, holes)
    return card

def card_way(i, p):
    card = C.paper((W, H), CREAM, seed=21 + i)
    frame = C.paper((PW, PHT), (252, 251, 247), seed=22 + i, grain=6)
    win = Image.new('L', (PW, PHT), 0); ImageDraw.Draw(win).rectangle((PB, PB, PW - PB, PHT - PBOT), fill=255)
    frame.putalpha(Image.composite(Image.new('L', frame.size, 0), frame.split()[3], win))
    card = C.place(card, C.shadow(frame, blur=18, alpha=80), p['c'], -p['tilt'])
    mask = Image.new('L', (W, H), 0)
    wm = win.rotate(-p['tilt'], resample=Image.BICUBIC, expand=True)
    mask.paste(wm, (int(p['c'][0] - wm.width / 2), int(p['c'][1] - wm.height / 2)))
    punch(card, mask)
    top = rot((p['c'][0], p['c'][1] - PHT / 2 + 10), p['c'], p['tilt'])
    card = C.place(card, C.tape(250, 72, seed=23 + i), top, -p['tape'])
    card = C.place(card, C.star(100, INK, 5, seed=24 + i), p['star'])
    return card

def card_cta():
    card = C.paper((W, H), BUTTER, seed=61)
    ring = Image.new('RGBA', (CTA_D + 24, CTA_D + 24), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((0, 0, CTA_D + 23, CTA_D + 23), fill=(255, 255, 255, 255))
    card = C.place(card, C.shadow(ring, blur=12, alpha=60), CTA_C)
    hole = Image.new('L', (W, H), 0)
    ImageDraw.Draw(hole).ellipse((CTA_C[0] - CTA_D / 2, CTA_C[1] - CTA_D / 2, CTA_C[0] + CTA_D / 2, CTA_C[1] + CTA_D / 2), fill=255)
    punch(card, hole)
    card = C.place(card, C.arrow(170, INK, 6, 40, seed=62).rotate(-70, expand=True), (540, 1450))
    return card

def build_cards(dest):
    dest.mkdir(parents=True, exist_ok=True)
    cards = [card_opener()] + [card_way(i, p) for i, p in enumerate(POL)] + [card_cta()]
    names = []
    for s, c in zip(scenes(), cards):
        c.save(dest / s['card']); names.append(dest / s['card'])
    return names

# ---- slot placeholder clips -----------------------------------------------------------------------------------------
def F(px, path=IMBUE):
    return ImageFont.truetype(path, px)

def slot_clip(i, dest, secs=4):
    img = Image.new('RGB', (W, H), SLOT_COLORS[i]); d = ImageDraw.Draw(img)
    def c(y, t, f, fill=INK):
        d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=fill)
    c(470, 'CLIP', F(80, 'C:/Windows/Fonts/segoeuib.ttf'))
    c(560, str(i + 1), F(560))
    c(1200, SLOTS[i][0], F(60, 'C:/Windows/Fonts/segoeui.ttf'))
    c(1290, 'Replace me with your clip', F(44, 'C:/Windows/Fonts/segoeui.ttf'), (110, 105, 95))
    png = dest / f'slot-{i + 1}.png'; img.save(png)
    mp4 = dest / f'slot-{i + 1}.mp4'
    run([FFMPEG, '-v', 'error', '-y', '-loop', '1', '-i', str(png), '-t', str(secs), '-r', str(FPS),
         '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(mp4)])
    png.unlink(); return mp4

# ---- CapCut project ----------------------------------------------------------------------------------------------------
def uid():
    return str(uuid.uuid4()).upper()

def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'ffmpeg failed:\n{r.stderr[-1500:]}')

def load(p):
    return json.loads(Path(p).read_text(encoding='utf-8'))

def find_material(mats, mid):
    for k, v in mats.items():
        if isinstance(v, list):
            for x in v:
                if isinstance(x, dict) and x.get('id') == mid:
                    return k, x
    return None, None

def clone_refs(proto_mats, new_mats, refs):
    out = []
    for r in refs:
        k, m = find_material(proto_mats, r)
        if not m:
            continue
        m = copy.deepcopy(m); m['id'] = uid()
        if k == 'speeds': m['speed'] = 1.0
        if k == 'material_animations': m['animations'] = []
        new_mats.setdefault(k, []).append(m); out.append(m['id'])
    return out

def clip_xy(cx, cy):
    return {'x': (cx - W / 2) / (W / 2), 'y': (H / 2 - cy) / (H / 2)}

def text_content(text, size, path, rid, color):
    return json.dumps({'text': text, 'styles': [{
        'fill': {'content': {'render_type': 'solid', 'solid': {'color': [round(c / 255, 4) for c in color]}}},
        'font': {'path': path, 'id': rid}, 'size': size, 'useLetterColor': True, 'range': [0, len(text)]}]},
        ensure_ascii=False)

def build_capcut(folder, slot_files, card_files):
    proto = load(PROTO / 'draft_content.json'); pm = proto['materials']
    pv = next(s for t in proto['tracks'] if t['type'] == 'video' for s in t['segments'])
    pt = next(s for t in proto['tracks'] if t['type'] == 'text' for s in t['segments'])
    pvtrack = next(t for t in proto['tracks'] if t['type'] == 'video')
    pttrack = next(t for t in proto['tracks'] if t['type'] == 'text')
    _, pvmat = find_material(pm, pv['material_id']); _, ptmat = find_material(pm, pt['material_id'])
    php = load(PROTO_PHOTO / 'draft_content.json')
    ph_mat = next(v for v in php['materials']['videos'] if v['type'] == 'photo')
    ph_track = next(t for t in php['tracks'] if t['type'] == 'video' and t['attribute'] == 0)
    ph_seg = next(s for s in ph_track['segments'] if s['material_id'] == ph_mat['id'])

    tl_id = uid(); d = copy.deepcopy(proto); d['id'] = tl_id
    mats = {k: ([] if isinstance(v, list) else v) for k, v in pm.items()}
    d['keyframes'] = {k: ([] if isinstance(v, list) else v) for k, v in proto['keyframes'].items()}
    sc = scenes(); total = int(sc[-1]['t'][1] * US); d['duration'] = total

    def clip_seg(slot, cx, cy, scale, rot_cw, t0, t1, proto_seg, render_index, track_index):
        m = copy.deepcopy(pvmat)
        m.update(id=uid(), path=f'{DRAFT_TOKEN}/Resources/slots/{slot_files[slot].name}', duration=4 * US, width=W,
                 height=H, has_audio=False, material_name=f'SHOT {slot + 1} - replace me.mp4',
                 local_material_id=str(uuid.uuid4()), category_name='local', media_path='', type='video')
        mats['videos'].append(m)
        s = copy.deepcopy(proto_seg); dur = int((t1 - t0) * US)
        s.update(id=uid(), material_id=m['id'], speed=1.0, volume=1.0, last_nonzero_volume=1.0,
                 source_timerange={'start': 0, 'duration': dur}, target_timerange={'start': int(t0 * US), 'duration': dur},
                 extra_material_refs=clone_refs(pm, mats, pv['extra_material_refs']), keyframe_refs=[],
                 common_keyframes=[], render_index=render_index, track_render_index=track_index)
        s['clip'] = {'scale': {'x': scale, 'y': scale}, 'rotation': float(rot_cw), 'transform': clip_xy(cx, cy),
                     'flip': {'vertical': False, 'horizontal': False}, 'alpha': 1.0}
        s['uniform_scale'] = {'on': True, 'value': scale}
        return s

    # video tracks: main (one clip per scene), two overlays for the opener's 2nd and 3rd windows, artwork on top
    main, ov1, ov2, art = [], [], [], []
    for s in sc:
        for j, (slot, cx, cy, scale, r) in enumerate(s['clips']):
            target = [main, ov1, ov2][j]
            target.append(clip_seg(slot, cx, cy, scale, r, *s['t'], pv if j == 0 else ph_seg, [0, 1, 2][j], [0, 1, 2][j]))
    for s, f in zip(sc, card_files):
        m = copy.deepcopy(ph_mat)
        m.update(id=uid(), path=f'{DRAFT_TOKEN}/Resources/art/{f.name}', width=W, height=H, material_name=f.name,
                 local_material_id=str(uuid.uuid4()), category_name='local', media_path='')
        mats['videos'].append(m)
        seg = copy.deepcopy(ph_seg); dur = int((s['t'][1] - s['t'][0]) * US)
        seg.update(id=uid(), material_id=m['id'], source_timerange={'start': 0, 'duration': dur},
                   target_timerange={'start': int(s['t'][0] * US), 'duration': dur},
                   extra_material_refs=clone_refs(php['materials'], mats, ph_seg['extra_material_refs']),
                   keyframe_refs=[], common_keyframes=[], render_index=3, track_render_index=3)
        seg['clip'] = {'scale': {'x': 1.0, 'y': 1.0}, 'rotation': 0.0, 'transform': {'x': 0.0, 'y': 0.0},
                       'flip': {'vertical': False, 'horizontal': False}, 'alpha': 1.0}
        seg['uniform_scale'] = {'on': True, 'value': 1.0}
        art.append(seg)

    # text layers: one track per simultaneous layer
    ttracks = []
    for s in sc:
        for j, (fnt, size, cx, cy, r, words, _) in enumerate(s['texts']):
            while len(ttracks) <= j:
                ttracks.append([])
            m = copy.deepcopy(ptmat)
            path, rid = (IMBUE, IMBUE_ID) if fnt == 'imbue' else (INKFREE, '')
            m.update(id=uid(), content=text_content(words, size, path, rid, INK), font_size=float(size),
                     font_path=path, font_resource_id=rid, font_id='', fonts=[], font_title='none',
                     font_source_platform=1 if rid else 0, text_color='#181614', border_width=0.0,
                     has_shadow=False, background_alpha=0.0, background_style=0, alignment=1,
                     line_max_width=0.9, fixed_width=-1.0)
            mats['texts'].append(m)
            seg = copy.deepcopy(pt)
            seg.update(id=uid(), material_id=m['id'],
                       target_timerange={'start': int(s['t'][0] * US), 'duration': int((s['t'][1] - s['t'][0]) * US)},
                       extra_material_refs=clone_refs(pm, mats, pt['extra_material_refs']), keyframe_refs=[],
                       common_keyframes=[], render_index=14000 + j, track_render_index=4 + j)
            seg['clip'] = {'scale': {'x': 1.0, 'y': 1.0}, 'rotation': float(r), 'transform': clip_xy(cx, cy),
                           'flip': {'vertical': False, 'horizontal': False}, 'alpha': 1.0}
            ttracks[j].append(seg)

    tracks = []
    t = copy.deepcopy(pvtrack); t.update(id=uid(), segments=main); tracks.append(t)
    for segs in (ov1, ov2, art):
        t = copy.deepcopy(ph_track); t.update(id=uid(), segments=segs); tracks.append(t)
    for segs in ttracks:
        t = copy.deepcopy(pttrack); t.update(id=uid(), segments=segs); tracks.append(t)
    d['tracks'] = tracks; d['materials'] = mats

    if folder.exists():
        shutil.rmtree(folder)
    (folder / 'Resources' / 'slots').mkdir(parents=True); (folder / 'Resources' / 'art').mkdir(parents=True)
    for f in slot_files: shutil.copy2(f, folder / 'Resources' / 'slots' / f.name)
    for f in card_files: shutil.copy2(f, folder / 'Resources' / 'art' / f.name)
    content = json.dumps(d, ensure_ascii=False, separators=(',', ':'))
    (folder / 'draft_content.json').write_text(content, encoding='utf-8')
    (folder / 'Timelines' / tl_id).mkdir(parents=True)
    (folder / 'Timelines' / tl_id / 'draft_content.json').write_text(content, encoding='utf-8')
    now_us = int(time.time() * US); secs = int(time.time())
    (folder / 'Timelines' / 'project.json').write_text(json.dumps({
        'config': {'color_space': -1, 'render_index_track_mode_on': False, 'use_float_render': False},
        'create_time': now_us, 'id': uid(), 'main_timeline_id': tl_id,
        'timelines': [{'create_time': now_us, 'id': tl_id, 'is_marked_delete': False, 'name': 'Timeline 01',
                       'update_time': now_us}], 'update_time': now_us, 'version': 0}), encoding='utf-8')
    (folder / 'timeline_layout.json').write_text(json.dumps({'dockItems': [{'dockIndex': 0, 'ratio': 1,
        'timelineIds': [tl_id], 'timelineNames': ['Timeline 01']}], 'layoutOrientation': 1}), encoding='utf-8')
    (folder / 'draft_biz_config.json').write_text(json.dumps({'timeline_settings': {tl_id: {'linkage_enabled': False}}}, indent=4), encoding='utf-8')
    (folder / 'performance_opt_info.json').write_text('{"manual_cancle_precombine_segs":null,"need_auto_precombine_segs":null}', encoding='utf-8')
    (folder / 'draft_settings').write_text(f'[General]\ndraft_create_time={secs}\ndraft_last_edit_time={secs}\n'
                                           'real_edit_seconds=0\nreal_edit_keys=0\ncloud_last_modify_platform=windows\n', encoding='utf-8')
    meta = load(PROTO / 'draft_meta_info.json')
    groups = [{'type': g['type'], 'value': []} for g in meta['draft_materials']]
    groups[0]['value'] = [{
        'ai_group_type': '', 'create_time': secs, 'duration': 4 * US, 'enter_from': 0, 'extra_info': f.name,
        'file_Path': f'{DRAFT_TOKEN}/Resources/slots/{f.name}', 'height': H, 'id': str(uuid.uuid4()),
        'import_time': secs, 'import_time_ms': now_us, 'item_source': 1, 'md5': '', 'metetype': 'video',
        'roughcut_time_range': {'duration': 4 * US, 'start': 0}, 'sub_time_range': {'duration': -1, 'start': -1},
        'type': 0, 'width': W} for f in slot_files]
    meta.update(draft_materials=groups, draft_materials_copied_info=[], draft_segment_extra_info=[], draft_id=uid(),
                draft_name=NAME, draft_fold_path=str(folder).replace('\\', '/'), draft_root_path=str(folder.parent),
                tm_duration=total, tm_draft_create=now_us, tm_draft_modified=now_us, draft_timeline_materials_size_=0,
                draft_cover='draft_cover.jpg')
    (folder / 'draft_meta_info.json').write_text(json.dumps(meta, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    Image.open(card_files[0]).convert('RGB').save(folder / 'draft_cover.jpg', quality=85)

# ---- previews (ffmpeg, mirroring the CapCut layout) -------------------------------------------------------------------
def text_png(fnt, size, cx, cy, r, words, path):
    px = round(size * PX_PER_SIZE)
    f = ImageFont.truetype(IMBUE if fnt == 'imbue' else INKFREE, px)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    tmp = Image.new('RGBA', (int(f.getlength(words)) + 40, int(px * 1.5)), (0, 0, 0, 0))
    ImageDraw.Draw(tmp).text((20, int(px * 0.15)), words, font=f, fill=INK + (255,))
    tmp = tmp.rotate(-r, resample=Image.BICUBIC, expand=True)
    layer.alpha_composite(tmp, (int(cx - tmp.width / 2), int(cy - tmp.height / 2)))
    layer.save(path)

def render(sources, out, work, test):
    """sources: per slot (path, start, hdr). Renders each scene, then joins them."""
    work.mkdir(parents=True, exist_ok=True); parts = []
    tone = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,'
    for k, s in enumerate(scenes()):
        dur = s['t'][1] - s['t'][0]
        args = [FFMPEG, '-v', 'error', '-y', '-f', 'lavfi', '-i', f'color=c=black:s={W}x{H}:r={FPS}:d={dur}']
        for (slot, *_r) in s['clips']:
            p, st, hdr = sources[slot]
            args += ['-ss', str(st), '-t', str(dur), '-i', str(p)]
        args += ['-loop', '1', '-t', str(dur), '-i', str(work.parent / 'art' / s['card'])]
        tp = []
        for j, (fnt, size, cx, cy, r, a, b) in enumerate(s['texts']):
            png = work / f't{k}-{j}.png'; text_png(fnt, size, cx, cy, r, b if test else a, png); tp.append(png)
            args += ['-loop', '1', '-t', str(dur), '-i', str(png)]
        fc, last = [], '0:v'
        for j, (slot, cx, cy, scale, r) in enumerate(s['clips']):
            hdr = sources[slot][2]
            w_, h_ = int(W * scale) // 2 * 2, int(H * scale) // 2 * 2
            rr = f',format=rgba,rotate={math.radians(r)}:c=none:ow=rotw({math.radians(r)}):oh=roth({math.radians(r)})' if r else ''
            fc.append(f'[{j + 1}:v]{tone if hdr else ""}scale={w_}:{h_}:force_original_aspect_ratio=increase,crop={w_}:{h_},fps={FPS},setsar=1{rr}[c{j}]')
            fc.append(f'[{last}][c{j}]overlay=x={cx}-overlay_w/2:y={cy}-overlay_h/2:shortest=1[b{j}]'); last = f'b{j}'
        n = len(s['clips']) + 1
        fc.append(f'[{last}][{n}:v]overlay=0:0:shortest=1[a0]'); last = 'a0'
        for j in range(len(tp)):
            fc.append(f'[{last}][{n + 1 + j}:v]overlay=0:0:shortest=1[x{j}]'); last = f'x{j}'
        part = work / f'part{k}.mp4'
        run(args + ['-filter_complex', ';'.join(fc), '-map', f'[{last}]', '-t', str(dur), '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-r', str(FPS), str(part)])
        parts.append(part)
    lst = work / 'parts.txt'; lst.write_text(''.join(f"file '{p.as_posix()}'\n" for p in parts), encoding='utf-8')
    tmp = work / 'joined.mp4'
    run([FFMPEG, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c', 'copy', str(tmp)])
    run([FFMPEG, '-v', 'error', '-y', '-display_rotation', '0', '-i', str(tmp), '-c', 'copy', '-movflags', '+faststart', str(out)])

# ---- recipe card, buyer folder -----------------------------------------------------------------------------------------
def recipe_card(path):
    img = C.paper((W, H), CREAM, seed=91).convert('RGB'); d = ImageDraw.Draw(img)
    seg = 'C:/Windows/Fonts/segoeui.ttf'; segb = 'C:/Windows/Fonts/segoeuib.ttf'
    d.text((90, 140), 'One product, 3 ways', font=F(120), fill=INK)
    d.text((90, 320), '14 seconds. Four clips, filmed upright.', font=F(40, seg), fill=(85, 80, 72))
    y = 440
    for i, (what, tip) in enumerate(SLOTS):
        d.text((90, y - 20), str(i + 1), font=F(120), fill=INK)
        d.text((200, y), what, font=F(46, segb), fill=INK)
        d.text((200, y + 62), tip, font=F(38, seg), fill=(85, 80, 72)); y += 170
    y += 30
    d.text((90, y), 'Words to type over the [brackets]', font=F(46, segb), fill=INK); y += 80
    for s in scenes():
        for (fnt, size, cx, cy, r, a, b) in s['texts']:
            if a.isdigit(): continue
            d.text((90, y), f'{a}', font=F(40, seg), fill=INK); d.text((560, y), f'e.g. {b}', font=F(40, INKFREE), fill=(85, 80, 72)); y += 58
    img.save(path)

def main():
    for p in (FFMPEG, IMBUE, INKFREE, PROTO / 'draft_content.json', PROTO_PHOTO / 'draft_content.json'):
        if not Path(p).exists(): sys.exit(f'missing: {p}')
    work = OUT / '_work'
    if work.exists(): shutil.rmtree(work)
    (work / 'slots').mkdir(parents=True)
    slot_files = [slot_clip(i, work / 'slots') for i in range(len(SLOTS))]
    card_files = build_cards(work / 'art')

    buyer = OUT / 'buyer-folder' / 'Template 01 - One product, three ways'
    if buyer.exists(): shutil.rmtree(buyer)
    build_capcut(buyer / NAME, slot_files, card_files)
    (buyer / '1 Put your clips here').mkdir()
    (buyer / '1 Put your clips here' / 'READ ME.txt').write_text(
        'Put your clips in this folder, then double-click "2 Double-click to install".\n\n'
        'They go into the template in name order, so name them 1, 2, 3, 4 (for example 1.mov, 2.mov).\n'
        'Film upright (vertical) and start each clip right on the action.\n\n'
        + '\n'.join(f'{i + 1}: {what}' for i, (what, _) in enumerate(SLOTS)) + '\n', encoding='utf-8')
    for f in ('install.ps1', '2 Double-click to install.cmd'):
        shutil.copy2(HERE / 'installer' / f, buyer / f)
    kit = OUT / 'phone-kit'
    if kit.exists(): shutil.rmtree(kit)
    kit.mkdir()
    recipe_card(kit / '01-recipe-card.png'); shutil.copy2(kit / '01-recipe-card.png', buyer / 'Recipe card.png')
    guide = PACK / 'guide' / 'how-to-use.pdf'
    if guide.exists(): shutil.copy2(guide, buyer / 'How to use.pdf')
    for f in card_files: shutil.copy2(f, kit / f.name)

    (OUT / 'preview').mkdir(exist_ok=True)
    render([(f, 0, False) for f in slot_files], OUT / 'preview' / 'before.mp4', work / 'rb', test=False)
    shutil.copy2(OUT / 'preview' / 'before.mp4', kit / '01-shot-guide.mp4')
    render([(FOOTAGE / f'{n}.MOV', st, True) for n, st in TEST_CLIPS], OUT / 'preview' / 'after.mp4', work / 'ra', test=True)
    shutil.rmtree(work)
    print('built:', buyer)

if __name__ == '__main__':
    main()
