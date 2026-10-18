"""Reel Template Pack engine: turns a template spec (layers + keyframes) into everything a buyer gets.

A template file in build/templates/ defines SPEC (title, the clips to film, test footage) and layers(), a list of:
  art   an image layer (paper, frame, sticker, doodle) drawn in code by collage.py
  clip  one of the buyer's clips, cropped to a window shape; src = where in their clip it starts, speed (1.15 = fast);
        mask='circle' shows it through a round window (CapCut's Rectangle mask, square, corners fully rounded)
  text  an editable CapCut text layer (fonts: 'imbue', 'awelier', 'ink'), optional Typewriter animation and edge
        (stroke=(colour, width), CapCut's 0 to 0.2 scale)
A clip with blur_bg=True gets CapCut's blurred background (only works on the lowest track, which CapCut calls the main
track); crop=(x0, y0, x1, y1) shows that part of the buyer's frame (0 to 1) instead of the centred window shape.
Every layer can move with keyframes {'scale' | 'x' | 'y' | 'rot': [(seconds from layer start, value)]}.

From that, build() makes:
  buyer-folder/Template NN - Title/   CapCut project + installer + "1 Put your clips here" + recipe card + guide
  phone-kit/                          shot guide video, artwork, recipe card
  preview/before.mp4, after.mp4       the template with numbered clip cards, and a test Reel (same motion, frame by frame)

The CapCut project copies the JSON shape of Mercedes's own CapCut 8.9 drafts (read only, never changed).
Usage: python build/make.py 01   (from automation/reel-template-pack)
"""
import copy, glob, json, math, os, shutil, subprocess, sys, time, uuid
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import collage as C

PACK = HERE.parent
FFMPEG = str(PACK.parent / 'hyperframes-test' / 'bin' / 'ffmpeg.exe')
LOCAL = Path(os.environ['LOCALAPPDATA'])
DRAFTS = LOCAL / 'CapCut' / 'User Data' / 'Projects' / 'com.lveditor.draft'
CACHE = LOCAL / 'CapCut' / 'User Data' / 'Cache' / 'effect'
PROTO = DRAFTS / 'Litter 1'                        # clips and text layers (CapCut 8.9), read only
PROTO_PHOTO = DRAFTS / 'Stain Stick with Reviews'  # image layer on an overlay track, read only
PROTO_TYPE = DRAFTS / 'PGYT2'                      # Typewriter text animation, read only
PROTO_MASK = DRAFTS / 'PGYT3'                      # CapCut's Rectangle mask on a clip, read only (round corners = circle)
FOOTAGE = Path.home() / 'OneDrive' / 'Desktop' / 'July Videos'
DRAFT_TOKEN = '##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##'
W, H, FPS = 1080, 1920, 30
US = 1_000_000
PX_PER_SIZE = 6.1   # CapCut text size 15 measured at ~92 px on a 1080-wide frame (her "Litter 1" cover)

INK = (24, 22, 20); BUTTER = (246, 228, 160); CREAM = (250, 244, 230)
FONT_IDS = {'imbue': '7533523619876523280', 'awelier': '7462241028796337414', 'bodoni': '7580184437816675601'}   # CapCut library, download by id
SYSTEM_FONTS = {'ink': 'C:/Windows/Fonts/Inkfree.ttf', 'arial': 'C:/Windows/Fonts/arial.ttf',
                'mono': 'C:/Windows/Fonts/consola.ttf', 'arialbd': 'C:/Windows/Fonts/arialbd.ttf'}      # ship with Windows
# fonts not in CapCut's library: shipped inside the project folder (SIL Open Font License, free to bundle)
BUNDLED_FONTS = {'corben': LOCAL / 'CapCut' / 'User Data' / 'Cache' / 'AITextTemplate' / 'Resource' / '4624078377714242870' / 'Corben-Bold.ttf'}
_anton = sorted((LOCAL / 'CapCut' / 'User Data' / 'Cache' / 'AITextTemplate' / 'Resource').glob('*/Anton-Regular.ttf'))
if _anton: BUNDLED_FONTS['anton'] = _anton[0]       # Fall f2's editable caps (OFL); not in CapCut's font library
INKFREE = 'C:/Windows/Fonts/Inkfree.ttf'                                        # ships with Windows 10 and 11
SEG, SEGB = 'C:/Windows/Fonts/segoeui.ttf', 'C:/Windows/Fonts/segoeuib.ttf'
SLOT_COLORS = [(243, 233, 220), (228, 236, 242), (237, 228, 240), (227, 239, 230), (246, 232, 214), (232, 230, 244)]

def font_file(rid):
    return next(p for p in glob.glob(str(CACHE / rid / '*' / '*')) if p.lower().endswith(('.ttf', '.otf'))).replace('\\', '/')

def font_path(name):
    if name in BUNDLED_FONTS: return str(BUNDLED_FONTS[name]).replace('\\', '/')
    return SYSTEM_FONTS[name] if name in SYSTEM_FONTS else font_file(FONT_IDS[name])

def F(px, name='imbue'):
    return ImageFont.truetype(name if '/' in name else font_path(name), px)

# ---- motion helpers ---------------------------------------------------------------------------------------------------
def pop(t, peak=1.18):
    return [(t, 0.0), (t + 0.16, peak), (t + 0.27, 0.94), (t + 0.36, 1.0)]

def thump(t, start=1.8):
    """A stamp landing: big to small, a tiny bounce."""
    return [(t, 0.0), (t + 0.01, start), (t + 0.14, 0.92), (t + 0.22, 1.03), (t + 0.3, 1.0)]

def wiggle(t0, t1, amp=8, period=0.6, base=0):
    pts, t, s = [], t0, 1
    while t <= t1:
        pts.append((t, base + amp * s)); s = -s; t += period / 2
    return pts

def fly(start, end, t=0.0, over=24):
    dx, dy = end[0] - start[0], end[1] - start[1]; n = math.hypot(dx, dy) or 1
    ox, oy = end[0] + dx / n * over, end[1] + dy / n * over
    return ({'x': [(t, start[0]), (t + 0.30, ox), (t + 0.42, end[0] - dx / n * 8), (t + 0.50, end[0])],
             'y': [(t, start[1]), (t + 0.30, oy), (t + 0.42, end[1] - dy / n * 8), (t + 0.50, end[1])]})

def visible(t0, t1, at=None):
    """Scale keyframes that show a layer only between t0 and t1 (layer-relative), popping in."""
    return ([(0, 0.0), (t0 - 0.001, 0.0)] if t0 > 0 else []) + pop(t0)[0:] + [(t1 - 0.001, 1.0), (t1, 0.0)]

def interp(kfs, t, default):
    if not kfs: return default
    if t <= kfs[0][0]: return kfs[0][1]
    for (a, va), (b, vb) in zip(kfs, kfs[1:]):
        if t <= b: return va if b == a else va + (vb - va) * (t - a) / (b - a)
    return kfs[-1][1]

def rot_pt(p, c, deg_cw):
    a = math.radians(deg_cw); x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))

class Layers:
    """Collects layers and their artwork for one template."""
    def __init__(self):
        self.L, self.A = [], {}
    def art(self, name, img, t, z, pos, rot=0, kf=None):
        if isinstance(rot, dict): rot, kf = 0, rot   # motion passed in the rotation's place
        self.A[name] = img; self.L.append(dict(kind='art', name=name, t=t, z=z, pos=pos, rot=rot, kf=kf or {}))
    def clip(self, slot, t, z, pos, size, rot=0, kf=None, src=0.0, speed=1.0, blur_bg=False, crop=None, mask=None):
        self.L.append(dict(kind='clip', slot=slot, t=t, z=z, pos=pos, size=size, rot=rot, kf=kf or {}, src=src, speed=speed,
                           blur_bg=blur_bg, crop=crop, mask=mask))
    def text(self, font, size, words, t, z, pos, rot=0, kf=None, typewriter=None, color=INK, shadow=False, stroke=None):
        if isinstance(rot, dict): rot, kf = 0, rot
        self.L.append(dict(kind='text', font=font, size=size, words=words, t=t, z=z, pos=pos, rot=rot, kf=kf or {},
                           typewriter=typewriter, color=color, shadow=shadow, stroke=stroke))
    def flip(self, name, frames, t0, z, rot=0, fps=FPS):
        """A flipbook: pre-rendered images played one per frame on one track. frames = [(img, centre), ...]; a frame
        that repeats the previous one (same image object, same centre) just holds longer. Returns the end time."""
        runs = []
        for img, c in frames:
            if runs and runs[-1][0] is img and runs[-1][1] == c: runs[-1][2] += 1
            else: runs.append([img, c, 1])
        k = 0
        for i, (img, c, n) in enumerate(runs):
            self.art(f'{name}-{i:02d}', img, (t0 + k / fps, t0 + (k + n) / fps), z, c, rot); k += n
        return t0 + k / fps

# ---- shared artwork ----------------------------------------------------------------------------------------------------
def ring_frame(d, bg, seed, ring=12, ring_color=(255, 255, 255)):
    """A paper square with a round window and a ring (covers the corners of a square-cropped clip)."""
    s = d + 2 * ring + 40
    sq = C.paper((s, s), bg, seed=seed) if bg else Image.new('RGBA', (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(sq).ellipse((s / 2 - d / 2 - ring, s / 2 - d / 2 - ring, s / 2 + d / 2 + ring, s / 2 + d / 2 + ring),
                               fill=ring_color + (255,))
    hole = Image.new('L', (s, s), 0); ImageDraw.Draw(hole).ellipse((s / 2 - d / 2, s / 2 - d / 2, s / 2 + d / 2, s / 2 + d / 2), fill=255)
    sq.putalpha(Image.composite(Image.new('L', sq.size, 0), sq.split()[3], hole))
    return sq

def polaroid_frame(size, border, bottom, seed, tape=True):
    pw, ph = size
    f = C.paper((pw, ph), (252, 251, 247), seed=seed, grain=6)
    win = Image.new('L', (pw, ph), 0); ImageDraw.Draw(win).rectangle((border, border, pw - border - 1, ph - bottom - 1), fill=255)
    f.putalpha(Image.composite(Image.new('L', f.size, 0), f.split()[3], win))
    f = C.shadow(f, offset=(8, 12), blur=16, alpha=80)
    pad = (f.width - pw) // 2
    if tape:
        f.alpha_composite(C.tape(int(pw * 0.32), 74, seed=seed + 1).rotate(4, expand=True, resample=Image.BICUBIC),
                          (pad + pw // 2 - int(pw * 0.16) - 5, pad - 30))
    return f

# ---- placeholder clips --------------------------------------------------------------------------------------------------
def run(args, **kw):
    r = subprocess.run(args, capture_output=True, **kw)
    if r.returncode:
        sys.exit(f'ffmpeg failed:\n{(r.stderr or b"")[-1500:]}')

def slot_clip(i, what, secs, dest):
    """A numbered card with a running clock, so fast cuts from different parts of the clip look different."""
    base = Image.new('RGB', (W, H), SLOT_COLORS[i % len(SLOT_COLORS)]); d = ImageDraw.Draw(base)
    def c(y, t, f, fill=INK):
        d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=fill)
    c(470, 'CLIP', F(80, SEGB)); c(560, str(i + 1), F(560))
    c(1200, what, F(60, SEG)); c(1290, 'Replace me with your clip', F(44, SEG), (110, 105, 95))
    mp4 = dest / f'slot-{i + 1}.mp4'
    p = subprocess.Popen([FFMPEG, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(mp4)],
                         stdin=subprocess.PIPE)
    f = F(70, SEGB)
    for k in range(int(secs * FPS)):
        im = base.copy(); dd = ImageDraw.Draw(im); t = f'{k / FPS:4.1f}s'
        dd.text(((W - dd.textlength(t, font=f)) / 2, 1420), t, font=f, fill=(110, 105, 95))
        p.stdin.write(im.tobytes())
    p.stdin.close(); p.wait()
    return mp4

# ---- CapCut project ----------------------------------------------------------------------------------------------------
def uid():
    return str(uuid.uuid4()).upper()

def load(p):
    return json.loads(Path(p).read_text(encoding='utf-8'))

def find_material(mats, mid):
    for k, v in mats.items():
        if isinstance(v, list):
            for x in v:
                if isinstance(x, dict) and x.get('id') == mid:
                    return k, x
    return None, None

def clone_refs(proto_mats, new_mats, refs, anim=None, speed=1.0):
    out = []
    for r in refs:
        k, m = find_material(proto_mats, r)
        if not m: continue
        m = copy.deepcopy(m); m['id'] = uid()
        if k == 'speeds': m['speed'] = speed
        if k == 'material_animations': m['animations'] = anim or []
        new_mats.setdefault(k, []).append(m); out.append(m['id'])
    return out

def cx_(x): return (x - W / 2) / (W / 2)
def cy_(y): return (H / 2 - y) / (H / 2)

def keyframes(kf, base_scale, dur):
    out = []
    conv = {'x': ('KFTypePositionX', cx_), 'y': ('KFTypePositionY', cy_), 'rot': ('KFTypeRotation', float),
            'scale': ('KFTypeScaleX', lambda v: v * base_scale)}
    for prop, pts in kf.items():
        name, f = conv[prop]
        out.append({'id': uid(), 'material_id': '', 'property_type': name, 'keyframe_list': [{
            'id': uid(), 'curveType': 'Line', 'time_offset': int(max(0, min(t, dur)) * US), 'left_control': {'x': 0.0, 'y': 0.0},
            'right_control': {'x': 0.0, 'y': 0.0}, 'values': [round(f(v), 6)], 'string_value': '', 'graphID': ''}
            for t, v in pts]})
    return out

def text_content(text, size, path, rid, color, stroke=None):
    style = {'fill': {'content': {'render_type': 'solid', 'solid': {'color': [round(c / 255, 4) for c in color]}}},
             'font': {'path': path, 'id': rid}, 'size': size, 'useLetterColor': True, 'range': [0, len(text)]}
    if stroke:   # the same shape as the white edge on her "Litter 1" cover text
        style['strokes'] = [{'content': {'render_type': 'solid', 'solid': {'color': [round(c / 255, 4) for c in stroke[0]]}},
                             'width': stroke[1], 'mode': 0}]
    return json.dumps({'text': text, 'styles': [style]}, ensure_ascii=False)

def fit(w, h):
    return min(W / w, H / h)

def build_capcut(folder, name, slot_files, slot_secs, art_files, L):
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
    typer = next(x for a in load(PROTO_TYPE / 'draft_content.json')['materials']['material_animations']
                 for x in a['animations'] if x['name'] == 'Typewriter')

    tl_id = uid(); d = copy.deepcopy(proto); d['id'] = tl_id
    mats = {k: ([] if isinstance(v, list) else v) for k, v in pm.items()}
    d['keyframes'] = {k: ([] if isinstance(v, list) else v) for k, v in proto['keyframes'].items()}
    total = int(round(max(l['t'][1] for l in L) * US)); d['duration'] = total

    def seg_common(s, l, base_scale):
        dur = l['t'][1] - l['t'][0]
        s.update(id=uid(), target_timerange={'start': int(round(l['t'][0] * US)), 'duration': int(round(dur * US))},
                 keyframe_refs=[], common_keyframes=keyframes(l['kf'], base_scale, dur))
        s['clip'] = {'scale': {'x': base_scale, 'y': base_scale}, 'rotation': float(l['rot']),
                     'transform': {'x': cx_(l['pos'][0]), 'y': cy_(l['pos'][1])},
                     'flip': {'vertical': False, 'horizontal': False}, 'alpha': 1.0}
        if 'uniform_scale' in s: s['uniform_scale'] = {'on': True, 'value': base_scale}
        return s

    by_z = {}
    for l in L:
        if l['kind'] == 'clip':
            cw, ch = l['size']; aspect = cw / ch
            fh = min(1.0, (W / aspect) / H); fw = min(1.0, (H * aspect) / W)
            x0, y0 = (1 - fw) / 2, (1 - fh) / 2
            if l.get('crop'): x0, y0, fw, fh = l['crop'][0], l['crop'][1], l['crop'][2] - l['crop'][0], l['crop'][3] - l['crop'][1]
            m = copy.deepcopy(pvmat)
            m.update(id=uid(), path=f'{DRAFT_TOKEN}/Resources/slots/{slot_files[l["slot"]].name}',
                     duration=int(slot_secs[l['slot']] * US), width=W, height=H, has_audio=False,
                     material_name=f'SHOT {l["slot"] + 1} - replace me.mp4', local_material_id=str(uuid.uuid4()),
                     category_name='local', media_path='', type='video',
                     crop={'upper_left_x': x0, 'upper_left_y': y0, 'upper_right_x': x0 + fw, 'upper_right_y': y0,
                           'lower_left_x': x0, 'lower_left_y': y0 + fh, 'lower_right_x': x0 + fw, 'lower_right_y': y0 + fh},
                     crop_ratio='free', crop_scale=1.0)
            mats['videos'].append(m)
            sw, sh = W * fw, H * fh
            s = seg_common(copy.deepcopy(pv), l, cw / (sw * fit(sw, sh)))
            tdur = s['target_timerange']['duration']
            s.update(material_id=m['id'], speed=l['speed'], volume=1.0, last_nonzero_volume=1.0,
                     source_timerange={'start': int(round(l['src'] * US)), 'duration': int(round(tdur * l['speed']))},
                     extra_material_refs=clone_refs(pm, mats, pv['extra_material_refs'], speed=l['speed']))
            if l.get('mask') == 'circle':   # a square clip seen through a circle: Rectangle mask, square, corners fully round
                mk = copy.deepcopy(load(PROTO_MASK / 'draft_content.json')['materials']['common_mask'][0])
                mk.update(id=uid(), constant_material_id=uid())
                mk['config'].update(width=1.0, height=1.0, centerX=0.0, centerY=0.0, rotation=0.0, feather=0.0, roundCorner=1.0,
                                    invert=False, aspectRatio=1.0)
                mats.setdefault('common_mask', []).append(mk); s['extra_material_refs'].append(mk['id'])
            if l.get('blur_bg'):   # CapCut's "Background > Blur": the clip itself, blurred, fills the rest of the frame
                for c in mats.get('canvases', []):
                    if c['id'] in s['extra_material_refs']: c.update(type='canvas_blur', blur=0.375, color='')
        elif l['kind'] == 'art':
            f = art_files[l['name']]; img = Image.open(f)
            m = copy.deepcopy(ph_mat)
            m.update(id=uid(), path=f'{DRAFT_TOKEN}/Resources/art/{f.name}', width=img.width, height=img.height,
                     material_name=f.name, local_material_id=str(uuid.uuid4()), category_name='local', media_path='')
            mats['videos'].append(m)
            s = seg_common(copy.deepcopy(ph_seg), l, 1 / fit(img.width, img.height))
            s.update(material_id=m['id'], source_timerange={'start': 0, 'duration': s['target_timerange']['duration']},
                     extra_material_refs=clone_refs(php['materials'], mats, ph_seg['extra_material_refs']))
        else:
            path = font_path(l['font']); rid = FONT_IDS.get(l['font'], '')
            if l['font'] in BUNDLED_FONTS: path = f'{DRAFT_TOKEN}/Resources/fonts/{BUNDLED_FONTS[l["font"]].name}'
            m = copy.deepcopy(ptmat)
            m.update(id=uid(), content=text_content(l['words'][0], l['size'], path, rid, l['color'], l.get('stroke')),
                     font_size=float(l['size']), font_path=path, font_resource_id=rid, font_id='', fonts=[],
                     font_title='none', font_source_platform=1 if rid else 0, text_color='#%02x%02x%02x' % l['color'],
                     border_width=0.0, has_shadow=bool(l.get('shadow')), shadow_color='#000000', shadow_alpha=0.85,
                     shadow_smoothing=1.0, shadow_distance=2.0, background_alpha=0.0, background_style=0, alignment=1,
                     line_max_width=0.9, fixed_width=-1.0)
            if l.get('stroke'):
                m.update(border_color='#%02x%02x%02x' % l['stroke'][0], border_width=l['stroke'][1], border_alpha=1.0, border_mode=0)
            mats['texts'].append(m)
            anim = None
            if l['typewriter']:
                a = copy.deepcopy(typer); a.update(start=0, duration=int(l['typewriter'] * US)); anim = [a]
            s = seg_common(copy.deepcopy(pt), l, 1.0)
            s.update(material_id=m['id'], extra_material_refs=clone_refs(pm, mats, pt['extra_material_refs'], anim))
        by_z.setdefault((l['kind'] == 'text', l['z']), []).append(s)

    lowest = min(z for (is_text, z) in by_z if not is_text)
    if any(l['kind'] == 'clip' and l.get('blur_bg') and l['z'] != lowest for l in L):
        sys.exit('a blurred-background clip must be on the lowest track (CapCut only blurs the main track)')
    tracks, vi, ti = [], 0, 0
    for (is_text, z) in sorted(by_z):
        segs = sorted(by_z[(is_text, z)], key=lambda s: s['target_timerange']['start'])
        for a, b in zip(segs, segs[1:]):   # one track cannot hold overlapping segments
            if a['target_timerange']['start'] + a['target_timerange']['duration'] > b['target_timerange']['start'] + 1:
                sys.exit(f'overlapping layers on z={z}: fix the template')
        if is_text:
            t = copy.deepcopy(pttrack); ti += 1
            for s in segs: s.update(render_index=14000 + ti, track_render_index=ti)
        else:
            t = copy.deepcopy(pvtrack if vi == 0 else ph_track)
            for s in segs: s.update(render_index=vi, track_render_index=vi)
            vi += 1
        t.update(id=uid(), segments=segs); tracks.append(t)
    d['tracks'] = tracks; d['materials'] = mats

    if folder.exists(): shutil.rmtree(folder)
    (folder / 'Resources' / 'slots').mkdir(parents=True); (folder / 'Resources' / 'art').mkdir(parents=True)
    for key in {l['font'] for l in L if l['kind'] == 'text'} & set(BUNDLED_FONTS):
        (folder / 'Resources' / 'fonts').mkdir(exist_ok=True); shutil.copy2(BUNDLED_FONTS[key], folder / 'Resources' / 'fonts')
    for f in slot_files: shutil.copy2(f, folder / 'Resources' / 'slots' / f.name)
    for f in art_files.values(): shutil.copy2(f, folder / 'Resources' / 'art' / f.name)
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
        'ai_group_type': '', 'create_time': secs, 'duration': int(sec * US), 'enter_from': 0, 'extra_info': f.name,
        'file_Path': f'{DRAFT_TOKEN}/Resources/slots/{f.name}', 'height': H, 'id': str(uuid.uuid4()),
        'import_time': secs, 'import_time_ms': now_us, 'item_source': 1, 'md5': '', 'metetype': 'video',
        'roughcut_time_range': {'duration': int(sec * US), 'start': 0}, 'sub_time_range': {'duration': -1, 'start': -1},
        'type': 0, 'width': W} for f, sec in zip(slot_files, slot_secs)]
    meta.update(draft_materials=groups, draft_materials_copied_info=[], draft_segment_extra_info=[], draft_id=uid(),
                draft_name=name, draft_fold_path=str(folder).replace('\\', '/'), draft_root_path=str(folder.parent),
                tm_duration=total, tm_draft_create=now_us, tm_draft_modified=now_us, draft_timeline_materials_size_=0,
                draft_cover='draft_cover.jpg')
    (folder / 'draft_meta_info.json').write_text(json.dumps(meta, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

# ---- preview renderer ----------------------------------------------------------------------------------------------------
def text_img(l, test, n_chars=None):
    """Text drawn like CapCut lays it out: each line is a box of ascent + descent, centred on the layer's spot."""
    px = round(l['size'] * PX_PER_SIZE)
    f = ImageFont.truetype(font_path(l['font']), px)
    asc, desc = f.getmetrics(); lh = asc + desc
    words = l['words'][1] if test else l['words'][0]
    lines = words.split(chr(10))
    pad = 40
    width = int(max(f.getlength(x) for x in lines)) + 2 * pad
    shown = (words if n_chars is None else words[:n_chars]).split(chr(10))
    im = Image.new('RGBA', (width, lh * len(lines) + 2 * pad), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    sw = round(l['stroke'][1] * px * 0.6) if l.get('stroke') else 0   # CapCut's edge width, measured on her "Litter 1" cover
    for i, ln in enumerate(shown):
        dr.text(((width - f.getlength(lines[i])) / 2, pad + i * lh), ln, font=f, fill=tuple(l['color']) + (255,), anchor='la',
                stroke_width=sw, stroke_fill=tuple(l['stroke'][0]) + (255,) if sw else None)
    if l.get('shadow'):
        from PIL import ImageFilter
        sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh.putalpha(im.split()[3].filter(ImageFilter.GaussianBlur(px * 0.1)).point(lambda v: min(255, int(v * 0.9))))
        base = Image.new('RGBA', im.size, (0, 0, 0, 0)); base.alpha_composite(sh, (0, 0)); base.alpha_composite(im); im = base
    return im

def clip_frames(sources, L, work):
    tone = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,'
    out = {}
    for n, l in enumerate(L):
        if l['kind'] != 'clip': continue
        p, st, hdr = sources[l['slot']]; w, h = l['size']; dur = l['t'][1] - l['t'][0]
        d = work / f'clip{n}'; d.mkdir(parents=True, exist_ok=True)
        pre = f'{tone if hdr else ""}setpts=PTS/{l["speed"]},'
        if l.get('crop'):
            x0, y0, x1, y1 = l['crop']
            pre += (f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},'
                    f'crop={int((x1 - x0) * W)}:{int((y1 - y0) * H)}:{int(x0 * W)}:{int(y0 * H)},')
        run([FFMPEG, '-v', 'error', '-y', '-ss', str(st + l['src']), '-t', str(dur * l['speed'] + 0.2), '-i', str(p), '-vf',
             f'{pre}scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},fps={FPS}', '-q:v', '3', str(d / '%04d.jpg')])
        out[n] = sorted(d.glob('*.jpg'))
        if l.get('blur_bg'):   # what CapCut's blurred background looks like: the whole frame, filled and blurred
            b = work / f'blur{n}'; b.mkdir(parents=True, exist_ok=True)
            run([FFMPEG, '-v', 'error', '-y', '-ss', str(st + l['src']), '-t', str(dur * l['speed'] + 0.2), '-i', str(p), '-vf',
                 f'{tone if hdr else ""}setpts=PTS/{l["speed"]},scale=270:480:force_original_aspect_ratio=increase,crop=270:480,'
                 f'gblur=sigma=9,fps={FPS}', '-q:v', '4', str(b / '%04d.jpg')])
            out[('blur', n)] = sorted(b.glob('*.jpg'))
    return out

def render(L, A, sources, out, work, test):
    work.mkdir(parents=True, exist_ok=True)
    frames = clip_frames(sources, L, work)
    total = max(l['t'][1] for l in L); n = int(round(total * FPS))
    order = sorted(range(len(L)), key=lambda i: (L[i]['kind'] == 'text', L[i]['z']))
    texts = {i: text_img(L[i], test) for i in order if L[i]['kind'] == 'text'}
    proc = subprocess.Popen([FFMPEG, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                             '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                             str(out)], stdin=subprocess.PIPE)
    for k in range(n):
        t = k / FPS; canvas = Image.new('RGBA', (W, H), (0, 0, 0, 255))
        for i in order:
            l = L[i]
            if not (l['t'][0] <= t < l['t'][1]): continue
            lt = t - l['t'][0]
            sc = interp(l['kf'].get('scale'), lt, 1.0)
            if sc <= 0.01: continue
            if l['kind'] == 'art':
                im = A[l['name']]
            elif l['kind'] == 'clip':
                fl = frames[i]
                if not fl: continue
                if ('blur', i) in frames:
                    bl = frames[('blur', i)]
                    canvas.paste(Image.open(bl[min(int(lt * FPS), len(bl) - 1)]).convert('RGB').resize((W, H), Image.BILINEAR), (0, 0))
                im = Image.open(fl[min(int(lt * FPS), len(fl) - 1)]).convert('RGBA')
                if l.get('mask') == 'circle':
                    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).ellipse((0, 0, im.width - 1, im.height - 1), fill=255); im.putalpha(m)
            else:
                tw = l.get('typewriter')
                words = l['words'][1] if test else l['words'][0]
                im = text_img(l, test, int(len(words) * lt / tw)) if tw and lt < tw else texts[i]
            if abs(sc - 1) > 0.005:
                im = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.BILINEAR)
            r = interp(l['kf'].get('rot'), lt, l['rot'])
            if abs(r) > 0.05:
                im = im.rotate(-r, resample=Image.BICUBIC, expand=True)
            x = interp(l['kf'].get('x'), lt, l['pos'][0]); y = interp(l['kf'].get('y'), lt, l['pos'][1])
            canvas.paste(im, (int(x - im.width / 2), int(y - im.height / 2)), im)
        proc.stdin.write(canvas.convert('RGB').tobytes())
    proc.stdin.close(); proc.wait()

# ---- recipe card and the buyer folder ---------------------------------------------------------------------------------------
def recipe_card(path, spec, L):
    img = C.paper((W, H), CREAM, seed=91).convert('RGB'); d = ImageDraw.Draw(img)
    hf = spec['font']
    d.text((90, 130), spec['title'], font=F(110 if hf == 'imbue' else 80, hf), fill=INK)
    d.text((90, 300), spec['subtitle'], font=F(40, SEG), fill=(85, 80, 72))
    y = 400
    for i, (what, tip) in enumerate(spec['slots']):
        d.text((90, y - 20), str(i + 1), font=F(110), fill=INK)
        d.text((200, y), what, font=F(44, SEGB), fill=INK)
        d.text((200, y + 58), tip, font=F(36, SEG), fill=(85, 80, 72)); y += 150
    y += 20
    d.text((90, y), 'Words to type over the [brackets] (1 to 3 words each)', font=F(42, SEGB), fill=INK); y += 74
    seen = set()
    for l in L:
        if l['kind'] != 'text' or '[' not in l['words'][0] or l['words'][0] in seen: continue
        seen.add(l['words'][0]); one = l['words'][0].replace('\n', ' / ')
        d.text((90, y), one, font=F(36, SEG), fill=INK)
        d.text((600, y), f"e.g. {l['words'][1]}".replace('\n', ' / '), font=F(36, INKFREE), fill=(85, 80, 72)); y += 52
    img.save(path)

def center_offset(l):
    """How far below its spot a text layer must sit so its letters (cap height to baseline) look centred."""
    f = ImageFont.truetype(font_path(l['font']), round(l['size'] * PX_PER_SIZE))
    asc, desc = f.getmetrics(); cap_top = f.getbbox('H', anchor='la')[1]
    return (asc + desc) / 2 - (cap_top + asc) / 2

def apply_centering(L):
    for l in L:
        if l['kind'] != 'text' or l.get('centred'): continue
        dy = center_offset(l)
        l['pos'] = (l['pos'][0], l['pos'][1] + dy)
        if 'y' in l['kf']: l['kf']['y'] = [(t, v + dy) for t, v in l['kf']['y']]
        l['centred'] = True

# Where Instagram draws over a Reel (1080x1920): the top bar, the caption/username/audio strip at the bottom, and the
# like/comment/share/remix column on the right. Text must stay out of these; images and stickers may go there.
IG_ZONES = (('top bar', (0, 0, W, 220)), ('caption + username', (0, H - 420, W, H)),
            ('like/comment/share buttons', (W - 150, H // 2 - 100, W, H)))

def check_ig_safe(L, min_secs=0.3):
    """Every text layer that sits in an Instagram zone for min_secs or more, sampled every 0.1 s (passing through on
    the way in or out is fine). Returns readable warnings."""
    bad = []
    for l in L:
        if l['kind'] != 'text': continue
        im = text_img(l, False); pad = 40
        hits = {}
        t = l['t'][0]
        while t < l['t'][1]:
            lt = t - l['t'][0]
            sc = interp(l['kf'].get('scale'), lt, 1.0)
            x = interp(l['kf'].get('x'), lt, l['pos'][0]); y = interp(l['kf'].get('y'), lt, l['pos'][1])
            w, h = (im.width - 2 * pad) * sc / 2, (im.height - 2 * pad) * sc / 2
            box = (x - w, y - h, x + w, y + h)
            on = max(0, min(box[2], W) - max(box[0], 0)) * max(0, min(box[3], H) - max(box[1], 0))
            if sc > 0.3 and on > 0.5 * (4 * w * h):   # mostly on screen and readable size
                for name, z in IG_ZONES:
                    ov = max(0, min(box[2], z[2]) - max(box[0], z[0])) * max(0, min(box[3], z[3]) - max(box[1], z[1]))
                    if ov > 0.15 * (4 * w * h):   # a sliver over the edge is fine; 15% of the words under it is not
                        hits[name] = hits.get(name, 0) + 0.1
            t += 0.1
        words = l['words'][0].replace(chr(10), ' ')
        bad += [f'"{words}" sits under Instagram\'s {name} for {s:.1f}s' for name, s in hits.items() if s >= min_secs]
    return bad

def build(spec, layers_fn):
    out = PACK / spec['dir']
    for p in (FFMPEG, PROTO / 'draft_content.json', PROTO_PHOTO / 'draft_content.json', PROTO_TYPE / 'draft_content.json',
              PROTO_MASK / 'draft_content.json'):
        if not Path(p).exists(): sys.exit(f'missing: {p}')
    work = out / '_work'
    if work.exists(): shutil.rmtree(work)
    (work / 'slots').mkdir(parents=True); (work / 'art').mkdir()
    lay = layers_fn(); L, A = lay.L, lay.A
    apply_centering(L)
    for w in check_ig_safe(L): print('IG SAFE ZONE:', w)
    n = len(spec['slots'])
    need = [0.0] * n
    for l in L:
        if l['kind'] == 'clip':
            need[l['slot']] = max(need[l['slot']], l['src'] + (l['t'][1] - l['t'][0]) * l['speed'])
    slot_secs = [max(4.0, math.ceil(x + 1.0)) for x in need]
    slot_files = [slot_clip(i, spec['slots'][i][0], slot_secs[i], work / 'slots') for i in range(n)]
    art_files = {}
    for name, img in A.items():
        f = work / 'art' / f'{name}.png'; img.save(f); art_files[name] = f

    buyer = out / 'buyer-folder' / spec['folder']
    if buyer.exists(): shutil.rmtree(buyer)
    build_capcut(buyer / spec['project'], spec['project'], slot_files, slot_secs, art_files, L)
    (buyer / '1 Put your clips here').mkdir()
    (buyer / '1 Put your clips here' / 'READ ME.txt').write_text(
        'Put your clips in this folder, then double-click "2 Double-click to install".\n\n'
        f'They go into the template in name order, so name them 1 to {n} (for example 1.mov, 2.mov).\n'
        'Film upright (vertical) and start each clip right on the action.\n\n'
        + '\n'.join(f'{i + 1}: {what} (at least {int(slot_secs[i] - 1)} seconds)' for i, (what, _) in enumerate(spec['slots']))
        + '\n', encoding='utf-8')
    for f in ('install.ps1', '2 Double-click to install.cmd'):
        shutil.copy2(HERE / 'installer' / f, buyer / f)
    kit = out / 'phone-kit'
    if kit.exists(): shutil.rmtree(kit)
    (kit / 'artwork').mkdir(parents=True)
    card = kit / f'{spec["num"]}-recipe-card.png'; recipe_card(card, spec, L); shutil.copy2(card, buyer / 'Recipe card.png')
    guide = PACK / 'guide' / 'how-to-use.pdf'
    if guide.exists(): shutil.copy2(guide, buyer / 'How to use.pdf')
    for f in art_files.values(): shutil.copy2(f, kit / 'artwork' / f.name)

    (out / 'preview').mkdir(exist_ok=True)
    render(L, A, [(f, 0, False) for f in slot_files], out / 'preview' / 'before.mp4', work / 'rb', test=False)
    shutil.copy2(out / 'preview' / 'before.mp4', kit / f'{spec["num"]}-shot-guide.mp4')
    render(L, A, [(FOOTAGE / f'{c}.MOV', st, True) for c, st in spec['test_clips']], out / 'preview' / 'after.mp4',
           work / 'ra', test=True)
    shutil.rmtree(work)
    run([FFMPEG, '-v', 'error', '-y', '-ss', str(spec.get('cover_at', 2.0)), '-i', str(out / 'preview' / 'before.mp4'),
         '-frames:v', '1', str(buyer / spec['project'] / 'draft_cover.jpg')])
    print('built:', buyer)
