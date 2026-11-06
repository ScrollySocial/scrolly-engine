"""Puts a YouTube rough cut into CapCut as a project she can edit herself (Mercedes, 2026-11-05).
Every piece of the cut (words.json "cuts") becomes its own clip on one 16:9 timeline, in order, pointing at the
ORIGINAL take in the footage folder at the same in/out, so any cut can be dragged longer or shorter in CapCut.
The takes are not copied (they are tens of GB); the project needs the OneDrive footage folder on this computer.
CapCut plays each take's own sound, so a hard cut's muted tail (pad) is left off the clip.
Usage: ../carousels/.venv/Scripts/python capcut.py <id> "<CapCut project name>"   (close CapCut first, then reopen it)
"""
import copy, json, subprocess, sys, time, uuid
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'reel-template-pack' / 'build'))
import engine as E   # CapCut draft helpers and the "Litter 1" prototype project (clips and tracks, CapCut 8.9)

FOOTAGE = Path('C:/Users/merce/OneDrive/Scrolly Media/videos')
FP = str(HERE.parent / 'hyperframes-test' / 'bin' / 'ffprobe.exe')
W, H, US = 1920, 1080, E.US
cut_id, name = sys.argv[1], sys.argv[2]
cuts = json.loads((HERE / cut_id / 'words.json').read_text(encoding='utf-8'))['cuts']
folder = E.DRAFTS / name
if folder.exists(): sys.exit(f'a CapCut project called "{name}" already exists: pick another name')

proto = E.load(E.PROTO / 'draft_content.json'); pm = proto['materials']
pvtrack = next(t for t in proto['tracks'] if t['type'] == 'video')
pv = pvtrack['segments'][0]
_, pvmat = E.find_material(pm, pv['material_id'])

tl_id = E.uid(); d = copy.deepcopy(proto); d['id'] = tl_id
d['canvas_config'] = {'ratio': 'original', 'width': W, 'height': H, 'background': None}
mats = {k: ([] if isinstance(v, list) else v) for k, v in pm.items()}
d['keyframes'] = {k: ([] if isinstance(v, list) else v) for k, v in proto['keyframes'].items()}

def probe(f):
    out = subprocess.run([FP, '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'format=duration:stream=width,height',
                          '-of', 'json', str(f)], capture_output=True, text=True, check=True).stdout
    j = json.loads(out); s = j['streams'][0]
    return float(j['format']['duration']), s['width'], s['height']

takes, segs, t = {}, [], 0
for c in cuts:
    src = FOOTAGE / c['src']
    if c['src'] not in takes:   # one material per take, shared by every clip cut from it
        dur, w, h = probe(src); m = copy.deepcopy(pvmat)
        m.update(id=E.uid(), path=str(src).replace('\\', '/'), duration=int(dur * US), width=w, height=h, has_audio=True,
                 material_name=src.name, local_material_id=str(uuid.uuid4()), category_name='local', media_path='', type='video',
                 crop={'upper_left_x': 0.0, 'upper_left_y': 0.0, 'upper_right_x': 1.0, 'upper_right_y': 0.0,
                       'lower_left_x': 0.0, 'lower_left_y': 1.0, 'lower_right_x': 1.0, 'lower_right_y': 1.0},
                 crop_ratio='free', crop_scale=1.0)
        mats['videos'].append(m); takes[c['src']] = (m, dur, w, h)
    m = takes[c['src']][0]
    length = int(round((c['out'] - c.get('pad', 0) - c['in']) * US))
    s = copy.deepcopy(pv)
    s.update(id=E.uid(), material_id=m['id'], speed=1.0, volume=1.0, last_nonzero_volume=1.0, keyframe_refs=[], common_keyframes=[],
             source_timerange={'start': int(round(c['in'] * US)), 'duration': length},
             target_timerange={'start': t, 'duration': length}, render_index=0, track_render_index=0,
             extra_material_refs=E.clone_refs(pm, mats, pv['extra_material_refs'], speed=1.0),
             clip={'scale': {'x': 1.0, 'y': 1.0}, 'rotation': 0.0, 'transform': {'x': 0.0, 'y': 0.0},
                   'flip': {'vertical': False, 'horizontal': False}, 'alpha': 1.0})
    if 'uniform_scale' in s: s['uniform_scale'] = {'on': True, 'value': 1.0}
    segs.append(s); t += length

track = copy.deepcopy(pvtrack); track.update(id=E.uid(), segments=segs)
d['tracks'] = [track]; d['materials'] = mats; d['duration'] = t

(folder / 'Timelines' / tl_id).mkdir(parents=True)
content = json.dumps(d, ensure_ascii=False, separators=(',', ':'))
(folder / 'draft_content.json').write_text(content, encoding='utf-8')
(folder / 'Timelines' / tl_id / 'draft_content.json').write_text(content, encoding='utf-8')
now_us = int(time.time() * US); secs = int(time.time())
(folder / 'Timelines' / 'project.json').write_text(json.dumps({
    'config': {'color_space': -1, 'render_index_track_mode_on': False, 'use_float_render': False},
    'create_time': now_us, 'id': E.uid(), 'main_timeline_id': tl_id,
    'timelines': [{'create_time': now_us, 'id': tl_id, 'is_marked_delete': False, 'name': 'Timeline 01', 'update_time': now_us}],
    'update_time': now_us, 'version': 0}), encoding='utf-8')
(folder / 'timeline_layout.json').write_text(json.dumps({'dockItems': [{'dockIndex': 0, 'ratio': 1, 'timelineIds': [tl_id],
    'timelineNames': ['Timeline 01']}], 'layoutOrientation': 1}), encoding='utf-8')
(folder / 'draft_biz_config.json').write_text(json.dumps({'timeline_settings': {tl_id: {'linkage_enabled': False}}}, indent=4), encoding='utf-8')
(folder / 'performance_opt_info.json').write_text('{"manual_cancle_precombine_segs":null,"need_auto_precombine_segs":null}', encoding='utf-8')
(folder / 'draft_settings').write_text(f'[General]\ndraft_create_time={secs}\ndraft_last_edit_time={secs}\n'
                                       'real_edit_seconds=0\nreal_edit_keys=0\ncloud_last_modify_platform=windows\n', encoding='utf-8')
meta = E.load(E.PROTO / 'draft_meta_info.json')
groups = [{'type': g['type'], 'value': []} for g in meta['draft_materials']]
groups[0]['value'] = [{   # the takes in the project's media panel
    'ai_group_type': '', 'create_time': secs, 'duration': int(dur * US), 'enter_from': 0, 'extra_info': Path(src).name,
    'file_Path': str(FOOTAGE / src).replace('\\', '/'), 'height': h, 'id': str(uuid.uuid4()), 'import_time': secs,
    'import_time_ms': now_us, 'item_source': 1, 'md5': '', 'metetype': 'video',
    'roughcut_time_range': {'duration': int(dur * US), 'start': 0}, 'sub_time_range': {'duration': -1, 'start': -1},
    'type': 0, 'width': w} for src, (m, dur, w, h) in takes.items()]
meta.update(draft_materials=groups, draft_materials_copied_info=[], draft_segment_extra_info=[], draft_id=E.uid(),
            draft_name=name, draft_fold_path=str(folder).replace('\\', '/'), draft_root_path=str(folder.parent),
            tm_duration=t, tm_draft_create=now_us, tm_draft_modified=now_us, draft_timeline_materials_size_=0, draft_cover='draft_cover.jpg')
(folder / 'draft_meta_info.json').write_text(json.dumps(meta, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(f'CapCut project "{name}": {len(segs)} clips from {len(takes)} takes, {t / US / 60:.1f} min -> {folder}')
