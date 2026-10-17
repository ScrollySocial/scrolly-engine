"""Build template 01 "One product, three ways" for the Reel Template Pack (physical sellers).

Look (Mercedes, 2026-10-16): no Scrolly branding; whimsical collage (paper, tape, Polaroids, hand-drawn marks),
butter yellow, Imbue tall serif headlines (odd-numbered templates; even ones use MADE Awelier), Ink Free handwriting,
eye-catching motion (pops with a bounce, Polaroids flying in and settling, a bouncing arrow).

Every element is its own layer so it can move: paper backgrounds, the buyer's clips (cropped to fit their window),
frames (Polaroid, round photo) on top of the clips, doodles, and editable CapCut text. Motion uses CapCut keyframes
(stored in the project, nothing to download) plus CapCut's Typewriter text animation (downloads by id).

Makes, inside automation/reel-template-pack/01-one-product-three-ways/:
  buyer-folder/Template 01 .../   what a buyer downloads: CapCut project + installer + clips folder + card + guide
  phone-kit/                      shot guide video, artwork, recipe card for CapCut on a phone
  preview/before.mp4, after.mp4   the template with slot cards, and a finished test Reel (frame-by-frame, same motion)

The CapCut project copies the JSON shape of Mercedes's own CapCut 8.9 drafts (read only, never changed).
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
PROTO = DRAFTS / 'Litter 1'                        # clips and text layers (CapCut 8.9), read only
PROTO_PHOTO = DRAFTS / 'Stain Stick with Reviews'  # image layer on an overlay track, read only
PROTO_TYPE = DRAFTS / 'PGYT2'                      # Typewriter text animation, read only
FOOTAGE = Path.home() / 'OneDrive' / 'Desktop' / 'July Videos'
DRAFT_TOKEN = '##_draftpath_placeholder_0E685133-18CE-45ED-8CB8-2904A212EC80_##'
NAME = 'Scrolly 01 One product three ways'
W, H, FPS = 1080, 1920, 30
US = 1_000_000
PX_PER_SIZE = 6.1   # CapCut text size 15 measured at ~92 px on a 1080-wide frame (her "Litter 1" cover)
CLIP_SECS = 4       # placeholder clip length

IMBUE_ID = '7533523619876523280'
INKFREE = 'C:/Windows/Fonts/Inkfree.ttf'
INK = (24, 22, 20); BUTTER = (246, 228, 160); CREAM = (250, 244, 230)

def font_file(rid):
    return next(p for p in glob.glob(str(CACHE / rid / '*' / '*')) if p.lower().endswith(('.ttf', '.otf'))).replace('\\', '/')
IMBUE = font_file(IMBUE_ID)

SLOTS = [  # (what to film, tip)
    ('Your product, held up or on a table', 'Plain background, good light'),
    ('Way one, in use', 'Show it being used the first way'),
    ('Way two, in use', 'A different place, person or use'),
    ('Way three, in use', 'Save the most surprising way for last'),
]
SLOT_COLORS = [(243, 233, 220), (228, 236, 242), (237, 228, 240), (227, 239, 230)]
TEST_CLIPS = [('IMG_1417', 0.3), ('IMG_1411', 15.5), ('IMG_1405', 3.0), ('IMG_1401', 2.5)]  # her July clips

# ---- motion helpers -------------------------------------------------------------------------------------------------
# keyframes: {'scale' | 'x' | 'y' | 'rot': [(seconds from layer start, value), ...]}  (x, y in pixels; rot in cw degrees)
def pop(t, peak=1.18):
    return [(t, 0.0), (t + 0.16, peak), (t + 0.27, 0.94), (t + 0.36, 1.0)]

def fly(start, end, t=0.0, over=24):
    """Fly from start (x, y) to end, overshoot a little past it, settle."""
    dx, dy = end[0] - start[0], end[1] - start[1]; n = math.hypot(dx, dy) or 1
    ox, oy = end[0] + dx / n * over, end[1] + dy / n * over
    return ({'x': [(t, start[0]), (t + 0.30, ox), (t + 0.42, end[0] - dx / n * 8), (t + 0.50, end[0])],
             'y': [(t, start[1]), (t + 0.30, oy), (t + 0.42, end[1] - dy / n * 8), (t + 0.50, end[1])]})

def interp(kfs, t, default):
    if not kfs: return default
    if t <= kfs[0][0]: return kfs[0][1]
    for (a, va), (b, vb) in zip(kfs, kfs[1:]):
        if t <= b: return va + (vb - va) * (t - a) / (b - a)
    return kfs[-1][1]

def rot_pt(p, c, deg_cw):
    a = math.radians(deg_cw); x, y = p[0] - c[0], p[1] - c[1]
    return (c[0] + x * math.cos(a) - y * math.sin(a), c[1] + x * math.sin(a) + y * math.cos(a))

# ---- artwork elements -------------------------------------------------------------------------------------------------
PW, PHT, PB, PBOT = 820, 1000, 40, 170        # bigger Polaroids (Mercedes, 2026-10-16)
WIN = (PW - 2 * PB, PHT - PB - PBOT)          # photo window 740 x 790
CD = 250                                      # opener circles
CTA_D = 440

def polaroid_frame(seed):
    f = C.paper((PW, PHT), (252, 251, 247), seed=seed, grain=6)
    win = Image.new('L', (PW, PHT), 0); ImageDraw.Draw(win).rectangle((PB, PB, PW - PB - 1, PB + WIN[1] - 1), fill=255)
    f.putalpha(Image.composite(Image.new('L', f.size, 0), f.split()[3], win))
    f = C.shadow(f, offset=(8, 12), blur=16, alpha=80)
    pad = (f.width - PW) // 2   # shadow() pads every side by the same amount
    f.alpha_composite(C.tape(260, 74, seed=seed + 1).rotate(4, expand=True, resample=Image.BICUBIC), (pad + PW // 2 - 135, pad - 30))
    return f, pad

def ring_frame(d, bg, seed, ring=12):
    """A paper square with a round window and a white ring (covers the corners of a square-cropped clip)."""
    s = d + 2 * ring + 40
    sq = C.paper((s, s), bg, seed=seed)
    dr = ImageDraw.Draw(sq)
    dr.ellipse((s / 2 - d / 2 - ring, s / 2 - d / 2 - ring, s / 2 + d / 2 + ring, s / 2 + d / 2 + ring), fill=(255, 255, 255, 255))
    hole = Image.new('L', (s, s), 0); ImageDraw.Draw(hole).ellipse((s / 2 - d / 2, s / 2 - d / 2, s / 2 + d / 2, s / 2 + d / 2), fill=255)
    sq.putalpha(Image.composite(Image.new('L', sq.size, 0), sq.split()[3], hole))
    return sq

# ---- the layers ---------------------------------------------------------------------------------------------------------
# layer: kind ('art' | 'clip' | 'text'), t (start, end), z, pos (x, y), rot, kf (keyframes), plus:
#   art:  img (PIL RGBA), name
#   clip: slot, size (w, h) shown on screen, crop aspect w/h, src offset seconds
#   text: font, size, words (template, test), typewriter (seconds or None)
def layers():
    L, A = [], {}
    def art(name, img, t, z, pos, rot=0, kf=None):
        A[name] = img; L.append(dict(kind='art', name=name, t=t, z=z, pos=pos, rot=rot, kf=kf or {}))
    def clip(slot, t, z, pos, size, rot=0, kf=None):
        L.append(dict(kind='clip', slot=slot, t=t, z=z, pos=pos, size=size, rot=rot, kf=kf or {}))
    def text(font, size, words, t, z, pos, rot=0, kf=None, typewriter=None):
        L.append(dict(kind='text', font=font, size=size, words=words, t=t, z=z, pos=pos, rot=rot, kf=kf or {}, typewriter=typewriter))

    # opener 0 to 2.5
    T = (0, 2.5)
    art('bg-opener', C.paper((W, H), CREAM, seed=41), T, 0, (540, 960))
    text('imbue', 25, ('One [product],', 'One stick vacuum,'), T, 20, (540, 390), typewriter=0.45)
    text('imbue', 49, ('3 ways', '3 ways'), T, 21, (540, 700), kf={'scale': pop(0.40, 1.25)})
    art('loop', C.pen_loop((800, 440), INK, 8, seed=43), T, 10, (540, 745), rot=-4, kf={'scale': pop(0.60, 1.08)})
    art('sparkle', C.sparkle(80, INK, 5), T, 11, (930, 250), kf={'scale': pop(0.85, 1.3), 'rot': [(0.85, -90), (1.2, 0)]})
    labels = [('[way one]', 'floors'), ('[way two]', 'couch'), ('[way three]', 'handheld')]
    for i, x in enumerate((190, 540, 890)):
        t0 = 0.8 + 0.15 * i; tilt = [-6, 4, -3][i]
        k = {'scale': pop(t0, 1.2), 'rot': [(t0, tilt - 25), (t0 + 0.36, tilt)]}
        clip(i + 1, T, 2 + 2 * i, (x, 1240), (CD + 6, CD + 6), tilt, k)
        art(f'ring{i}', ring_frame(CD, CREAM, 44 + i), T, 3 + 2 * i, (x, 1240), tilt, copy.deepcopy(k))
        text('ink', 10, labels[i], T, 22 + i, (x, 1440), kf={'scale': pop(t0 + 0.1)})

    # three ways, 3 s each: the Polaroid flies in, settles at a tilt, then drifts
    POL = [dict(c=(540, 1010), tilt=4, frm=(540, 2700), num=(150, 300), star=(930, 1700)),
           dict(c=(540, 1000), tilt=-3, frm=(1900, 980), num=(930, 300), star=(150, 1700)),
           dict(c=(540, 1010), tilt=2, frm=(540, -800), num=(150, 300), star=(930, 1700))]
    words = [('[way one]', 'floors'), ('[way two]', 'the couch'), ('[way three]', 'handheld, anywhere')]
    for i, p in enumerate(POL):
        T = (2.5 + 3 * i, 5.5 + 3 * i)
        frame, pad = polaroid_frame(22 + 3 * i)
        win_c = rot_pt((p['c'][0], p['c'][1] - PHT / 2 + PB + WIN[1] / 2), p['c'], p['tilt'])
        cap_c = rot_pt((p['c'][0], p['c'][1] + PHT / 2 - PBOT / 2), p['c'], p['tilt'])
        frame_c = rot_pt((p['c'][0], p['c'][1]), p['c'], p['tilt'])
        def motion(target):
            m = fly((target[0] + p['frm'][0] - p['c'][0], target[1] + p['frm'][1] - p['c'][1]), target)
            m['rot'] = [(0, p['tilt'] + 14 * (1 if i % 2 == 0 else -1)), (0.30, p['tilt'] - 3), (0.50, p['tilt'])]
            m['scale'] = [(0.5, 1.0), (3.0, 1.04)]
            return m
        art(f'bg-way{i + 1}', C.paper((W, H), CREAM, seed=21 + i), T, 0, (540, 960))
        clip(i + 1, T, 2, win_c, (WIN[0] + 6, WIN[1] + 6), p['tilt'], motion(win_c))
        art(f'polaroid{i + 1}', frame, T, 3, frame_c, p['tilt'], motion(frame_c))
        text('ink', 16, words[i], T, 20, cap_c, p['tilt'], motion(cap_c))
        text('imbue', 69, (str(i + 1), str(i + 1)), T, 21, p['num'], kf={'scale': pop(0.35, 1.3)})
        art(f'star{i + 1}', C.star(110, INK, 6, seed=24 + i), T, 10, p['star'],
            kf={'scale': pop(0.6, 1.3), 'rot': [(0.6, -120), (1.0, 0)]})

    # CTA 11.5 to 14
    T = (11.5, 14)
    art('bg-cta', C.paper((W, H), BUTTER, seed=61), T, 0, (540, 960))
    k = {'scale': pop(0.05, 1.15), 'rot': [(0.05, -15), (0.41, 0)]}
    clip(0, T, 2, (540, 620), (CTA_D + 6, CTA_D + 6), 0, k)
    art('ring-cta', ring_frame(CTA_D, BUTTER, 64), T, 3, (540, 620), 0, copy.deepcopy(k))
    text('imbue', 31, ('[Product name]', 'Stick vacuum'), T, 20, (540, 1030), typewriter=0.5)
    text('ink', 13, ('shop at [where to buy]', 'shop at the link in my bio'), T, 21, (540, 1250),
         kf={'scale': pop(0.55, 1.1)})
    y = 1470
    art('arrow', C.arrow(170, INK, 6, 40, seed=62).rotate(-70, expand=True), T, 10, (540, y),
        kf={'scale': pop(0.9), 'y': [(1.3, y), (1.5, y + 34), (1.7, y), (1.9, y + 34), (2.1, y), (2.3, y + 34), (2.5, y)]})
    return L, A

# ---- placeholder clips --------------------------------------------------------------------------------------------------
def F(px, path=IMBUE):
    return ImageFont.truetype(path, px)

def slot_clip(i, dest):
    img = Image.new('RGB', (W, H), SLOT_COLORS[i]); d = ImageDraw.Draw(img)
    def c(y, t, f, fill=INK):
        d.text(((W - d.textlength(t, font=f)) / 2, y), t, font=f, fill=fill)
    c(470, 'CLIP', F(80, 'C:/Windows/Fonts/segoeuib.ttf'))
    c(560, str(i + 1), F(560))
    c(1200, SLOTS[i][0], F(60, 'C:/Windows/Fonts/segoeui.ttf'))
    c(1290, 'Replace me with your clip', F(44, 'C:/Windows/Fonts/segoeui.ttf'), (110, 105, 95))
    png = dest / f'slot-{i + 1}.png'; img.save(png)
    mp4 = dest / f'slot-{i + 1}.mp4'
    run([FFMPEG, '-v', 'error', '-y', '-loop', '1', '-i', str(png), '-t', str(CLIP_SECS), '-r', str(FPS),
         '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(mp4)])
    png.unlink(); return mp4

# ---- CapCut project ----------------------------------------------------------------------------------------------------
def uid():
    return str(uuid.uuid4()).upper()

def run(args, **kw):
    r = subprocess.run(args, capture_output=True, **kw)
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

def clone_refs(proto_mats, new_mats, refs, anim=None):
    out = []
    for r in refs:
        k, m = find_material(proto_mats, r)
        if not m: continue
        m = copy.deepcopy(m); m['id'] = uid()
        if k == 'speeds': m['speed'] = 1.0
        if k == 'material_animations': m['animations'] = anim or []
        new_mats.setdefault(k, []).append(m); out.append(m['id'])
    return out

def cx_(x): return (x - W / 2) / (W / 2)
def cy_(y): return (H / 2 - y) / (H / 2)

def keyframes(kf, base_scale, dur):
    """Our keyframes -> CapCut common_keyframes (uniform scale is stored as ScaleX)."""
    out = []
    conv = {'x': ('KFTypePositionX', cx_), 'y': ('KFTypePositionY', cy_), 'rot': ('KFTypeRotation', float),
            'scale': ('KFTypeScaleX', lambda v: v * base_scale)}
    for prop, pts in kf.items():
        name, f = conv[prop]
        out.append({'id': uid(), 'material_id': '', 'property_type': name, 'keyframe_list': [{
            'id': uid(), 'curveType': 'Line', 'time_offset': int(min(t, dur) * US), 'left_control': {'x': 0.0, 'y': 0.0},
            'right_control': {'x': 0.0, 'y': 0.0}, 'values': [round(f(v), 6)], 'string_value': '', 'graphID': ''}
            for t, v in pts]})
    return out

def text_content(text, size, path, rid, color):
    return json.dumps({'text': text, 'styles': [{
        'fill': {'content': {'render_type': 'solid', 'solid': {'color': [round(c / 255, 4) for c in color]}}},
        'font': {'path': path, 'id': rid}, 'size': size, 'useLetterColor': True, 'range': [0, len(text)]}]},
        ensure_ascii=False)

def fit(w, h):
    """CapCut shows media fitted inside the canvas at scale 1."""
    return min(W / w, H / h)

def build_capcut(folder, slot_files, art_files, L):
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
    total = int(max(l['t'][1] for l in L) * US); d['duration'] = total

    def seg_common(s, l, base_scale):
        dur = l['t'][1] - l['t'][0]
        s.update(id=uid(), target_timerange={'start': int(l['t'][0] * US), 'duration': int(dur * US)}, keyframe_refs=[],
                 common_keyframes=keyframes(l['kf'], base_scale, dur))
        s['clip'] = {'scale': {'x': base_scale, 'y': base_scale}, 'rotation': float(l['rot']),
                     'transform': {'x': cx_(l['pos'][0]), 'y': cy_(l['pos'][1])},
                     'flip': {'vertical': False, 'horizontal': False}, 'alpha': 1.0}
        if 'uniform_scale' in s: s['uniform_scale'] = {'on': True, 'value': base_scale}
        return s

    by_z = {}
    for l in L:
        if l['kind'] == 'clip':
            cw, ch = l['size']; aspect = cw / ch
            # crop the upright 9:16 clip to the window's shape, centred
            fh = min(1.0, (W / aspect) / H); fw = min(1.0, (H * aspect) / W)
            x0, y0 = (1 - fw) / 2, (1 - fh) / 2
            m = copy.deepcopy(pvmat)
            m.update(id=uid(), path=f'{DRAFT_TOKEN}/Resources/slots/{slot_files[l["slot"]].name}', duration=CLIP_SECS * US,
                     width=W, height=H, has_audio=False, material_name=f'SHOT {l["slot"] + 1} - replace me.mp4',
                     local_material_id=str(uuid.uuid4()), category_name='local', media_path='', type='video',
                     crop={'upper_left_x': x0, 'upper_left_y': y0, 'upper_right_x': 1 - x0, 'upper_right_y': y0,
                           'lower_left_x': x0, 'lower_left_y': 1 - y0, 'lower_right_x': 1 - x0, 'lower_right_y': 1 - y0},
                     crop_ratio='free', crop_scale=1.0)
            mats['videos'].append(m)
            shown_w, shown_h = W * fw, H * fh
            s = seg_common(copy.deepcopy(pv), l, cw / (shown_w * fit(shown_w, shown_h)))
            s.update(material_id=m['id'], speed=1.0, volume=1.0, last_nonzero_volume=1.0,
                     source_timerange={'start': 0, 'duration': s['target_timerange']['duration']},
                     extra_material_refs=clone_refs(pm, mats, pv['extra_material_refs']))
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
            path, rid = (IMBUE, IMBUE_ID) if l['font'] == 'imbue' else (INKFREE, '')
            m = copy.deepcopy(ptmat)
            m.update(id=uid(), content=text_content(l['words'][0], l['size'], path, rid, INK), font_size=float(l['size']),
                     font_path=path, font_resource_id=rid, font_id='', fonts=[], font_title='none',
                     font_source_platform=1 if rid else 0, text_color='#181614', border_width=0.0, has_shadow=False,
                     background_alpha=0.0, background_style=0, alignment=1, line_max_width=0.9, fixed_width=-1.0)
            mats['texts'].append(m)
            anim = None
            if l['typewriter']:
                a = copy.deepcopy(typer); a.update(start=0, duration=int(l['typewriter'] * US)); anim = [a]
            s = seg_common(copy.deepcopy(pt), l, 1.0)
            s.update(material_id=m['id'], extra_material_refs=clone_refs(pm, mats, pt['extra_material_refs'], anim))
        by_z.setdefault((l['kind'] == 'text', l['z']), []).append(s)

    tracks, vi, ti = [], 0, 0
    for (is_text, z) in sorted(by_z):
        segs = sorted(by_z[(is_text, z)], key=lambda s: s['target_timerange']['start'])
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
        'ai_group_type': '', 'create_time': secs, 'duration': CLIP_SECS * US, 'enter_from': 0, 'extra_info': f.name,
        'file_Path': f'{DRAFT_TOKEN}/Resources/slots/{f.name}', 'height': H, 'id': str(uuid.uuid4()),
        'import_time': secs, 'import_time_ms': now_us, 'item_source': 1, 'md5': '', 'metetype': 'video',
        'roughcut_time_range': {'duration': CLIP_SECS * US, 'start': 0}, 'sub_time_range': {'duration': -1, 'start': -1},
        'type': 0, 'width': W} for f in slot_files]
    meta.update(draft_materials=groups, draft_materials_copied_info=[], draft_segment_extra_info=[], draft_id=uid(),
                draft_name=NAME, draft_fold_path=str(folder).replace('\\', '/'), draft_root_path=str(folder.parent),
                tm_duration=total, tm_draft_create=now_us, tm_draft_modified=now_us, draft_timeline_materials_size_=0,
                draft_cover='draft_cover.jpg')
    (folder / 'draft_meta_info.json').write_text(json.dumps(meta, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

# ---- preview renderer (frame by frame, same layers and keyframes) ---------------------------------------------------------
def text_img(l, test, n_chars=None):
    px = round(l['size'] * PX_PER_SIZE)
    f = ImageFont.truetype(IMBUE if l['font'] == 'imbue' else INKFREE, px)
    words = l['words'][1] if test else l['words'][0]
    full_w = int(f.getlength(words)) + 40
    shown = words if n_chars is None else words[:n_chars]
    im = Image.new('RGBA', (full_w, int(px * 1.5)), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((20, int(px * 0.12)), shown, font=f, fill=INK + (255,))
    return im

def clip_frames(sources, L, work):
    """Decode each clip layer's frames at its on-screen size (cropped to the window shape)."""
    tone = 'zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,'
    out = {}
    for n, l in enumerate(L):
        if l['kind'] != 'clip': continue
        p, st, hdr = sources[l['slot']]; w, h = l['size']; dur = l['t'][1] - l['t'][0]
        d = work / f'clip{n}'; d.mkdir(parents=True, exist_ok=True)
        run([FFMPEG, '-v', 'error', '-y', '-ss', str(st), '-t', str(dur), '-i', str(p), '-vf',
             f'{tone if hdr else ""}scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},fps={FPS}',
             '-q:v', '3', str(d / '%04d.jpg')])
        out[n] = sorted(d.glob('*.jpg'))
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
                fl = frames[i]; im = Image.open(fl[min(int(lt * FPS), len(fl) - 1)]).convert('RGBA')
            else:
                tw = l.get('typewriter')
                if tw and lt < tw:
                    words = l['words'][1] if test else l['words'][0]
                    im = text_img(l, test, int(len(words) * lt / tw))
                else:
                    im = texts[i]
            if abs(sc - 1) > 0.005:
                im = im.resize((max(1, int(im.width * sc)), max(1, int(im.height * sc))), Image.BILINEAR)
            r = interp(l['kf'].get('rot'), lt, l['rot'])
            if abs(r) > 0.05:
                im = im.rotate(-r, resample=Image.BICUBIC, expand=True)
            x = interp(l['kf'].get('x'), lt, l['pos'][0]); y = interp(l['kf'].get('y'), lt, l['pos'][1])
            canvas.alpha_composite(im, (int(x - im.width / 2), int(y - im.height / 2))) if (
                0 <= int(x - im.width / 2) and 0 <= int(y - im.height / 2)) else canvas.paste(im, (int(x - im.width / 2), int(y - im.height / 2)), im)
        proc.stdin.write(canvas.convert('RGB').tobytes())
    proc.stdin.close(); proc.wait()

# ---- recipe card and buyer folder ---------------------------------------------------------------------------------------
def recipe_card(path, L):
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
    seen = set()
    for l in L:
        if l['kind'] != 'text' or '[' not in l['words'][0] or l['words'][0] in seen: continue
        seen.add(l['words'][0])
        d.text((90, y), l['words'][0], font=F(40, seg), fill=INK)
        d.text((560, y), f"e.g. {l['words'][1]}", font=F(40, INKFREE), fill=(85, 80, 72)); y += 58
    img.save(path)

def main():
    for p in (FFMPEG, IMBUE, INKFREE, PROTO / 'draft_content.json', PROTO_PHOTO / 'draft_content.json',
              PROTO_TYPE / 'draft_content.json'):
        if not Path(p).exists(): sys.exit(f'missing: {p}')
    work = OUT / '_work'
    if work.exists(): shutil.rmtree(work)
    (work / 'slots').mkdir(parents=True); (work / 'art').mkdir()
    L, A = layers()
    slot_files = [slot_clip(i, work / 'slots') for i in range(len(SLOTS))]
    art_files = {}
    for name, img in A.items():
        f = work / 'art' / f'{name}.png'; img.save(f); art_files[name] = f

    buyer = OUT / 'buyer-folder' / 'Template 01 - One product, three ways'
    if buyer.exists(): shutil.rmtree(buyer)
    build_capcut(buyer / NAME, slot_files, art_files, L)
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
    (kit / 'artwork').mkdir(parents=True)
    recipe_card(kit / '01-recipe-card.png', L); shutil.copy2(kit / '01-recipe-card.png', buyer / 'Recipe card.png')
    guide = PACK / 'guide' / 'how-to-use.pdf'
    if guide.exists(): shutil.copy2(guide, buyer / 'How to use.pdf')
    for f in art_files.values(): shutil.copy2(f, kit / 'artwork' / f.name)

    (OUT / 'preview').mkdir(exist_ok=True)
    render(L, A, [(f, 0, False) for f in slot_files], OUT / 'preview' / 'before.mp4', work / 'rb', test=False)
    shutil.copy2(OUT / 'preview' / 'before.mp4', kit / '01-shot-guide.mp4')
    render(L, A, [(FOOTAGE / f'{n}.MOV', st, True) for n, st in TEST_CLIPS], OUT / 'preview' / 'after.mp4', work / 'ra', test=True)
    # cover: a frame from the template after everything has popped in
    shutil.rmtree(work)
    run([FFMPEG, '-v', 'error', '-y', '-ss', '2.2', '-i', str(OUT / 'preview' / 'before.mp4'), '-frames:v', '1',
         str(buyer / NAME / 'draft_cover.jpg')])
    print('built:', buyer)

if __name__ == '__main__':
    main()
