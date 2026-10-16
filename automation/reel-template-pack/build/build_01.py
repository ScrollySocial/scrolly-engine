"""Build template 01 "One product, three ways" for the Reel Template Pack (physical sellers).

Makes, inside automation/reel-template-pack/01-one-product-three-ways/:
  capcut-project/Scrolly 01 One product three ways/   a CapCut desktop project (drafts-folder format)
  phone-kit/                                          shot guide video + recipe card for CapCut on a phone
  preview/before.mp4, preview/after.mp4               template with slot cards, and a finished test Reel

The CapCut project copies the exact JSON shape of Mercedes's own CapCut 8.9 drafts (read from her drafts folder,
never changed). Video and audio files stay out of git; rerun this script to rebuild them.

Usage: python build/build_01.py            (from automation/reel-template-pack)
"""
import copy, json, os, shutil, subprocess, sys, time, uuid
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
PACK = HERE.parent
OUT = PACK / '01-one-product-three-ways'
BIN = PACK.parent / 'hyperframes-test' / 'bin'
FFMPEG = str(BIN / 'ffmpeg.exe')
DRAFTS = Path(os.environ['LOCALAPPDATA']) / 'CapCut' / 'User Data' / 'Projects' / 'com.lveditor.draft'
PROTO = DRAFTS / 'Litter 1'              # CapCut 8.9 draft used as the JSON shape (read only)
PROTO_FONT = DRAFTS / 'Old Soaps Short'  # has a Rubik Bold text layer (CapCut library font, downloads by id)
FONT_FILE = Path(os.environ['LOCALAPPDATA']) / 'CapCut/User Data/Cache/effect/7517472189348695297/d9b01b0f3c2256a42fbf4ba926aaeeb8/Rubik-Bold.ttf'
FOOTAGE = Path.home() / 'OneDrive' / 'Desktop' / 'July Videos'
DRAFT_TOKEN = '##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##'
NAME = 'Scrolly 01 One product three ways'
W, H, FPS = 1080, 1920, 30
US = 1_000_000

# ---- the template --------------------------------------------------------------------------------------------
SLOTS = [  # seconds, what to film, tip
    (2, 'Hold the product up to the camera', 'Plain background, good light'),
    (3, 'Way one, in use', 'Show it being used the first way'),
    (3, 'Way two, in use', 'A different place, person or use'),
    (3, 'Way three, in use', 'Save the most surprising way for last'),
    (3, 'The product on a table', 'Your hand placing it down'),
]
# start, end, kind, template text, test text (the finished example)
TEXTS = [
    (0, 2, 'hook', 'One [product], 3 ways', 'One stick vacuum, 3 ways'),
    (2, 5, 'label', '1. [way one]', '1. Floors'),
    (5, 8, 'label', '2. [way two]', '2. The couch'),
    (8, 11, 'label', '3. [way three]', '3. Pop it off: handheld'),
    (11, 14, 'cta', '[Product name]\nShop at [where to buy]', 'Stick vacuum\nShop at the link in my bio'),
]
STYLE = {  # CapCut font size, vertical position (-1 bottom .. 1 top, CapCut's own units)
    'hook': (13, 0.55), 'label': (11, -0.42), 'cta': (10, -0.42),
}
# placeholder test footage (Mercedes's July clips): file, start second; HLG HDR, so tone-mapped for the preview
TEST_CLIPS = [('IMG_1417', 0.3), ('IMG_1411', 15.5), ('IMG_1405', 3.0), ('IMG_1401', 2.5), ('IMG_1421', 15.0)]
SLOT_COLORS = ['#F3E9DC', '#E4ECF2', '#EDE4F0', '#E3EFE6', '#F6E3DA']
INK = '#1d1d1b'

def uid():
    return str(uuid.uuid4()).upper()

def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'ffmpeg failed: {" ".join(args[:6])}...\n{r.stderr[-1500:]}')

def font(px):
    return ImageFont.truetype(str(FONT_FILE), px)

# ---- 1. slot placeholder clips --------------------------------------------------------------------------------
def slot_card(i, secs, what, tip):
    img = Image.new('RGB', (W, H), SLOT_COLORS[i])
    d = ImageDraw.Draw(img)
    def center(y, text, f, fill=INK):
        w = d.textlength(text, font=f)
        d.text(((W - w) / 2, y), text, font=f, fill=fill)
    center(650, f'SHOT {i + 1} OF {len(SLOTS)}', font(64))
    center(750, f'{secs} seconds', font(110))
    # wrap the instruction
    f = font(58); words = what.split(); lines, cur = [], ''
    for w_ in words:
        t = (cur + ' ' + w_).strip()
        if d.textlength(t, font=f) > 900 and cur: lines.append(cur); cur = w_
        else: cur = t
    lines.append(cur)
    y = 920
    for ln in lines: center(y, ln, f); y += 74
    center(y + 20, tip, font(40), '#55524c')
    center(1180, 'Replace me with your clip', font(36), '#8a857c')
    return img

def build_slots(dest):
    dest.mkdir(parents=True, exist_ok=True)
    paths = []
    for i, (secs, what, tip) in enumerate(SLOTS):
        png = dest / f'slot-{i + 1}.png'
        slot_card(i, secs, what, tip).save(png)
        mp4 = dest / f'slot-{i + 1}.mp4'
        run([FFMPEG, '-v', 'error', '-y', '-loop', '1', '-i', str(png), '-t', str(secs), '-r', str(FPS),
             '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(mp4)])
        png.unlink()
        paths.append(mp4)
    return paths

# ---- 2. CapCut project ------------------------------------------------------------------------------------------
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
    """Copy each extra material a segment points to (speed, canvas, animation...) with a fresh id."""
    out = []
    for r in refs:
        k, m = find_material(proto_mats, r)
        if not m:
            continue
        m = copy.deepcopy(m); m['id'] = uid()
        if k == 'speeds':
            m['speed'] = 1.0
        if k == 'material_animations':
            m['animations'] = []
        new_mats[k].append(m); out.append(m['id'])
    return out

def text_content(text, fsize, font_path, font_res):
    return json.dumps({'text': text, 'styles': [{
        'fill': {'content': {'render_type': 'solid', 'solid': {'color': [1, 1, 1]}}},
        'font': {'path': font_path, 'id': font_res},
        'size': fsize, 'bold': False, 'useLetterColor': True, 'range': [0, len(text)]}]}, ensure_ascii=False)

def build_capcut(folder, slot_files):
    proto = load(PROTO / 'draft_content.json')
    pm = proto['materials']
    pvseg = next(s for t in proto['tracks'] if t['type'] == 'video' for s in t['segments'])
    ptseg = next(s for t in proto['tracks'] if t['type'] == 'text' for s in t['segments'])
    pvtrack = next(t for t in proto['tracks'] if t['type'] == 'video')
    pttrack = next(t for t in proto['tracks'] if t['type'] == 'text')
    _, pvmat = find_material(pm, pvseg['material_id'])
    _, ptmat = find_material(pm, ptseg['material_id'])
    ftxt = next(t for t in load(PROTO_FONT / 'draft_content.json')['materials']['texts']
                if t.get('font_resource_id') == '7517472189348695297')

    timeline_id = uid()
    d = copy.deepcopy(proto)
    d['id'] = timeline_id
    mats = {k: ([] if isinstance(v, list) else v) for k, v in pm.items()}
    d['keyframes'] = {k: ([] if isinstance(v, list) else v) for k, v in proto['keyframes'].items()}
    total = sum(s[0] for s in SLOTS) * US
    d['duration'] = total

    vsegs, t0 = [], 0
    for i, ((secs, what, _), f) in enumerate(zip(SLOTS, slot_files)):
        dur = secs * US
        m = copy.deepcopy(pvmat)
        m.update(id=uid(), path=f'{DRAFT_TOKEN}/Resources/slots/{f.name}', duration=dur, width=W, height=H,
                 has_audio=False, material_name=f'SHOT {i + 1} - replace me.mp4', local_material_id=str(uuid.uuid4()),
                 category_name='local', media_path='')
        mats['videos'].append(m)
        s = copy.deepcopy(pvseg)
        s.update(id=uid(), material_id=m['id'], speed=1.0, volume=1.0, last_nonzero_volume=1.0,
                 source_timerange={'start': 0, 'duration': dur}, target_timerange={'start': t0, 'duration': dur},
                 extra_material_refs=clone_refs(pm, mats, pvseg['extra_material_refs']), keyframe_refs=[],
                 common_keyframes=[])
        s['clip'] = {'scale': {'x': 1.0, 'y': 1.0}, 'rotation': 0.0, 'transform': {'x': 0.0, 'y': 0.0},
                     'flip': {'vertical': False, 'horizontal': False}, 'alpha': 1.0}
        vsegs.append(s); t0 += dur

    tsegs = []
    for (a, b, kind, text, _) in TEXTS:
        fsize, y = STYLE[kind]
        m = copy.deepcopy(ptmat)
        for k in ('font_path', 'font_resource_id', 'font_source_platform', 'fonts', 'font_id', 'font_title'):
            m[k] = copy.deepcopy(ftxt[k])
        m.update(id=uid(), content=text_content(text, fsize, ftxt['font_path'], ftxt['font_resource_id']),
                 font_size=float(fsize), text_color='#ffffff', border_width=0.0, has_shadow=False,
                 background_style=1, background_color='#000000', background_alpha=0.6,
                 background_round_radius=0.3, alignment=1, line_max_width=0.82, fixed_width=-1.0)
        mats['texts'].append(m)
        s = copy.deepcopy(ptseg)
        s.update(id=uid(), material_id=m['id'], target_timerange={'start': a * US, 'duration': (b - a) * US},
                 extra_material_refs=clone_refs(pm, mats, ptseg['extra_material_refs']), keyframe_refs=[],
                 common_keyframes=[])
        s['clip'] = {'scale': {'x': 1.0, 'y': 1.0}, 'rotation': 0.0, 'transform': {'x': 0.0, 'y': y},
                     'flip': {'vertical': False, 'horizontal': False}, 'alpha': 1.0}
        tsegs.append(s)

    vt = copy.deepcopy(pvtrack); vt.update(id=uid(), segments=vsegs)
    tt = copy.deepcopy(pttrack); tt.update(id=uid(), segments=tsegs)
    d['tracks'] = [vt, tt]
    d['materials'] = mats

    # folder layout, same as CapCut 8.9 drafts
    if folder.exists():
        shutil.rmtree(folder)
    (folder / 'Resources' / 'slots').mkdir(parents=True)
    for f in slot_files:
        shutil.copy2(f, folder / 'Resources' / 'slots' / f.name)
    content = json.dumps(d, ensure_ascii=False, separators=(',', ':'))
    (folder / 'draft_content.json').write_text(content, encoding='utf-8')
    tl = folder / 'Timelines' / timeline_id
    tl.mkdir(parents=True)
    (tl / 'draft_content.json').write_text(content, encoding='utf-8')
    now_us = int(time.time() * US)
    (folder / 'Timelines' / 'project.json').write_text(json.dumps({
        'config': {'color_space': -1, 'render_index_track_mode_on': False, 'use_float_render': False},
        'create_time': now_us, 'id': uid(), 'main_timeline_id': timeline_id,
        'timelines': [{'create_time': now_us, 'id': timeline_id, 'is_marked_delete': False, 'name': 'Timeline 01',
                       'update_time': now_us}], 'update_time': now_us, 'version': 0}), encoding='utf-8')
    (folder / 'timeline_layout.json').write_text(json.dumps({'dockItems': [{'dockIndex': 0, 'ratio': 1,
        'timelineIds': [timeline_id], 'timelineNames': ['Timeline 01']}], 'layoutOrientation': 1}), encoding='utf-8')
    (folder / 'draft_biz_config.json').write_text(json.dumps({'timeline_settings': {timeline_id: {'linkage_enabled': False}}},
                                                             indent=4), encoding='utf-8')
    (folder / 'performance_opt_info.json').write_text('{"manual_cancle_precombine_segs":null,"need_auto_precombine_segs":null}', encoding='utf-8')
    secs = int(time.time())
    (folder / 'draft_settings').write_text(f'[General]\ndraft_create_time={secs}\ndraft_last_edit_time={secs}\n'
                                           'real_edit_seconds=0\nreal_edit_keys=0\ncloud_last_modify_platform=windows\n', encoding='utf-8')
    meta = load(PROTO / 'draft_meta_info.json')
    groups = [{'type': g['type'], 'value': []} for g in meta['draft_materials']]
    groups[0]['value'] = [{
        'ai_group_type': '', 'create_time': secs, 'duration': s * US, 'enter_from': 0, 'extra_info': f.name,
        'file_Path': f'{DRAFT_TOKEN}/Resources/slots/{f.name}', 'height': H, 'id': str(uuid.uuid4()),
        'import_time': secs, 'import_time_ms': now_us, 'item_source': 1, 'md5': '', 'metetype': 'video',
        'roughcut_time_range': {'duration': s * US, 'start': 0}, 'sub_time_range': {'duration': -1, 'start': -1},
        'type': 0, 'width': W} for (s, _, _), f in zip(SLOTS, slot_files)]
    meta.update(draft_materials=groups, draft_materials_copied_info=[], draft_segment_extra_info=[],
                draft_id=uid(), draft_name=NAME, draft_fold_path=str(folder).replace('\\', '/'),
                draft_root_path=str(folder.parent), tm_duration=total, tm_draft_create=now_us,
                tm_draft_modified=now_us, draft_timeline_materials_size_=0, draft_cover='draft_cover.jpg')
    (folder / 'draft_meta_info.json').write_text(json.dumps(meta, ensure_ascii=False), encoding='utf-8')
    run([FFMPEG, '-v', 'error', '-y', '-i', str(slot_files[0]), '-frames:v', '1', str(folder / 'draft_cover.jpg')])

# ---- 3. previews (ffmpeg, mirroring the CapCut layout) ------------------------------------------------------------
def text_png(text, kind, path):
    fsize, y = STYLE[kind]
    px = round(fsize * 5.9)  # CapCut size 15 ~ 88 px tall line on a 1080 x 1920 canvas
    f = font(px)
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    lines = text.split('\n')
    lh = round(px * 1.18)
    widths = [d.textlength(l, font=f) for l in lines]
    bw, bh = max(widths) + px * 0.8, lh * len(lines) + px * 0.4
    cy = H / 2 * (1 - y)
    box = (W / 2 - bw / 2, cy - bh / 2, W / 2 + bw / 2, cy + bh / 2)
    d.rounded_rectangle(box, radius=px * 0.35, fill=(0, 0, 0, round(255 * 0.6)))
    for i, (l, w) in enumerate(zip(lines, widths)):
        d.text((W / 2 - w / 2, box[1] + px * 0.2 + i * lh), l, font=f, fill='white')
    img.save(path)

def render(clips, texts, out, work):
    """clips: list of (path, start, secs, hdr); texts: list of (start, end, kind, text)."""
    work.mkdir(parents=True, exist_ok=True)
    args = [FFMPEG, '-v', 'error', '-y']
    for p, start, secs, _ in clips:
        args += ['-ss', str(start), '-t', str(secs), '-i', str(p)]
    pngs = []
    for i, (a, b, kind, text) in enumerate(texts):
        png = work / f'text-{i}.png'; text_png(text, kind, png); pngs.append(png)
        args += ['-i', str(png)]
    fc = []
    for i, (_, _, secs, hdr) in enumerate(clips):
        tone = ('zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,'
                'zscale=t=bt709:m=bt709:r=tv,format=yuv420p,') if hdr else ''
        fc.append(f'[{i}:v]{tone}scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},'
                  f'fps={FPS},setsar=1,trim=duration={secs},setpts=PTS-STARTPTS[v{i}]')
    fc.append(''.join(f'[v{i}]' for i in range(len(clips))) + f'concat=n={len(clips)}:v=1:a=0[base]')
    last = 'base'
    for j, (a, b, _, _) in enumerate(texts):
        k = len(clips) + j
        fc.append(f"[{last}][{k}:v]overlay=0:0:enable='between(t,{a},{b - 0.001})'[o{j}]")
        last = f'o{j}'
    tmp = work / 'render.mp4'
    args += ['-filter_complex', ';'.join(fc), '-map', f'[{last}]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
             '-r', str(FPS), str(tmp)]
    run(args)
    # iPhone clips carry a rotation tag that ffmpeg copies to the output; the frames are already upright, so drop it
    run([FFMPEG, '-v', 'error', '-y', '-display_rotation', '0', '-i', str(tmp), '-c', 'copy',
         '-movflags', '+faststart', str(out)])

# ---- 4. phone kit recipe card ---------------------------------------------------------------------------------------
def recipe_card(path):
    img = Image.new('RGB', (W, H), '#FBF7F1'); d = ImageDraw.Draw(img)
    y = 150
    d.text((90, y), '01  One product, 3 ways', font=font(64), fill=INK); y += 110
    d.text((90, y), '14 seconds. Five clips. Film each one a little longer.', font=font(34), fill='#55524c'); y += 110
    t = 0
    for i, (secs, what, tip) in enumerate(SLOTS):
        d.text((90, y), f'{i + 1}', font=font(70), fill='#c96a2b')
        d.text((190, y), f'{what}', font=font(44), fill=INK)
        d.text((190, y + 58), f'Trim to {secs} seconds  ({t} to {t + secs}s)', font=font(34), fill='#55524c')
        y += 150; t += secs
    y += 20
    d.text((90, y), 'Text to add (Text, then Add text)', font=font(44), fill=INK); y += 80
    for (a, b, kind, text, _) in TEXTS:
        d.text((90, y), f'{a} to {b}s', font=font(32), fill='#55524c')
        d.text((300, y), text.replace('\n', ' / '), font=font(36), fill=INK); y += 64
    img.save(path)

def main():
    for p in (FFMPEG, FONT_FILE, PROTO / 'draft_content.json'):
        if not Path(p).exists():
            sys.exit(f'missing: {p}')
    work = OUT / '_work'
    slot_files = build_slots(work / 'slots')
    project = OUT / 'capcut-project' / NAME
    build_capcut(project, slot_files)
    kit = OUT / 'phone-kit'; kit.mkdir(parents=True, exist_ok=True)
    (OUT / 'preview').mkdir(exist_ok=True)
    tpl_texts = [(a, b, k, t) for a, b, k, t, _ in TEXTS]
    render([(f, 0, s[0], False) for f, s in zip(slot_files, SLOTS)], tpl_texts, OUT / 'preview' / 'before.mp4', work / 'b')
    shutil.copy2(OUT / 'preview' / 'before.mp4', kit / '01-shot-guide.mp4')
    for f in slot_files:
        shutil.copy2(f, kit / f.name)
    recipe_card(kit / '01-recipe-card.png')
    test = [(FOOTAGE / f'{n}.MOV', st, s[0], True) for (n, st), s in zip(TEST_CLIPS, SLOTS)]
    render(test, [(a, b, k, t) for a, b, k, _, t in TEXTS], OUT / 'preview' / 'after.mp4', work / 'a')
    shutil.rmtree(work)
    print('built:', project, '\n', OUT / 'preview')

if __name__ == '__main__':
    main()
