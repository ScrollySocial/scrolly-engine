"""h1 Now you see it (Halloween pack), approved 2026-10-20 as motion test v4 (build/motion_h1.py: her smoke, the clock
tower). FULLY EDITABLE build (build/editable.py). The disappear trick from her tutorial (instagram.com/p/Dcb54SQxv_z):
 1 0-2.4    clip 1 WITH you (or the product), you snap; "now you / see it", the product line, sparkles
 2 2.4-5.4  the cut on the snap: clip 2, the SAME shot empty; her smoke rolls up over everything, the words included;
            under the smoke "see it" becomes "don't"
 3 5.4-8.1  the midnight stage: her clock tower rises in, real brass hands sweep to midnight, it rings; "gone /
            [at midnight Oct 31]"; a second puff of smoke wipes the stage away onto clip 3
 4 8.1-10.6 clip 3, the product again: "only [20 left]", a ring round it
 5 10.6-end CTA: "comment [POOF] before it's gone", an arrow at the keyword
Editable: every word is CapCut text (Bodoni Moda built-in words with an ink outline, accent orange = the buyer's brand
colour; Montserrat [brackets] on CapCut's text background, [POOF] on a pill); the sparkles, bell marks, ring and arrow
are Scrolly Doodles letters; the night is CapCut's Background > Colour under a colourless tissue grain.
The smoke ships inside the project (Resources/smoke/smoke-h1.mov: her Pexels smoke, rotated, keyed to real
transparency, trimmed, ProRes 4444) on its own video track ABOVE the text (render_index past CapCut's text range), so
it rolls over the words like in her tutorial; it plays at 1.6x, scaled 1.35x and raised so it covers the middle of the
shot. Buyers can move or resize it, or turn it down with Opacity.
CapCut limits: the tower and its hands are photos (the tower's own painted hands were taken off its dial and the
patterned glass rebuilt from a clean patch of the same glass; build/tower_h1.py); the smoke is a fixed video, so its
colour isn't editable (it's white smoke; a colour filter on its layer tints it).
Shot guide: prop the phone and keep it perfectly still for clips 1 and 2; clip 2 starts the moment you'd snap."""
import json, math, shutil, subprocess
from PIL import Image
import engine as E
from engine import W, H
import editable as Ed
from editable import at
import tower_h1 as T

SPEC = dict(num='h1', title='Now you see it', subtitle="14 seconds. Three clips: you in the shot (snap!), the same shot empty, your product.",
            font='bodoni', dir='halloween/h1-now-you-see-it', folder='Template h1 - Now you see it',
            project='h1 Now you see it', cover_at=1.2,
            slots=[('With you', 'Phone propped and still. You (or you holding the product) in the middle; snap your fingers at the end'),
                   ('The same shot, empty', "Don't move the phone. Step out of the shot and film the empty spot"),
                   ('Your product again', 'Your product up close, upright, a little movement')],
            test_clips=[('IMG_1385', 1.4), (str(E.PACK / 'halloween' / 'h1-now-you-see-it' / 'preview' / '_frames' / 'standin-empty'), 0.0),
                        ('IMG_1439', 4.0)])
END = 13.6
INK, WHITE, CREAM = (24, 18, 14), (255, 255, 255), (246, 238, 222)
ACC = (236, 120, 36)                 # the accent: buyers change it to their brand colour
STAGE = (44, 28, 58)                 # the midnight stage (CapCut's background colour)
T_CUT, T_STAGE, T_PUFF2, T_CLIP3, T_CTA = 2.4, 5.4, 7.4, 8.1, 10.6
SMOKE = E.PACK / 'assets' / 'props' / 'source' / 'halloween' / 'smoke-h1.mov'   # 4.6 s from 0.8 s into smoke.mov
SMOKE_SPEED, SMOKE_SCALE, SMOKE_C = 1.6, 1.35, (540, 650)   # its bottom edge stays below the frame
SMOKE_DUR = 4.5 / SMOKE_SPEED
TOWER_S, DIAL_AT = 2.1, (540, 1300)
LIB = E.PACK / 'assets' / 'props' / 'source'

def reel():
    r = Ed.Reel([], END)
    r.art('tissue-grain', Ed.grain(Image.open(LIB / 'images' / 'Blush Pink Tissue Paper Texture-9.png'), 0.22), 0, None, 1, Ed.still(540, 960))
    def word(text, px, t0, t1, c, color=WHITE):
        """Built-in words: Bodoni Moda (her h1 pick) with a thin ink outline and a shadow, popping in."""
        r.text('bodoni', px, (text, text), t0, t1, Ed.pop_in(c[0], c[1], t0, 0, 0.3, 2.2), color, stroke=(INK, 0.05), shadow=True)
    def boxed(words, px, t0, t1, c, box, test, pill=False):
        r.boxed(words, px / 0.85, t0, t1, Ed.pop_in(c[0], c[1], t0, 0, 0.25, 2.0), box, test, round_=1.0 if pill else 0.0)
    def doodle(kind, i, px, t0, t1, c, color, rot=0):
        r.doodle(kind, i, px, t0, t1, Ed.pop_in(c[0], c[1], t0, rot, 0.3, 2.2), color)

    # 1-2 clip 1 with you, the cut on the snap, clip 2 the same shot empty; the hook stays through the cut
    r.clip(0, 0, T_CUT, 2, Ed.still(540, 960))
    r.clip(1, T_CUT, T_STAGE, 3, Ed.still(540, 960))
    word('now you', 130, 0.0, T_STAGE, (520, 360))
    word('see it', 250, 0.25, 3.35, (520, 560), ACC)
    word("don't", 260, 3.35, T_STAGE, (520, 560), ACC)            # swapped while the smoke is thickest
    boxed('[me + our spice candle]', 62, 0.7, 3.35, (520, 760), WHITE, 'me + our spice candle')
    for k, (kind, i, px, c) in enumerate((('icon', 9, 170, (190, 470)), ('icon', 11, 190, (880, 640)), ('icon', 8, 130, (860, 420)))):
        doodle(kind, i, px, 0.5 + k * 0.15, T_CUT, c, WHITE)

    # 3 the midnight stage: the tower rises, the hands sweep to midnight, it rings
    tower, dial, _ = T.tower()
    tower = tower.resize((int(tower.width * TOWER_S), int(tower.height * TOWER_S)), Image.LANCZOS)
    off = (tower.width / 2 - dial[0] * TOWER_S, tower.height / 2 - dial[1] * TOWER_S)     # tower centre from the dial
    hour, minute = T.hands(95 * TOWER_S)
    def ring(ts): return 1.5 * math.sin((ts - 6.95) * 50) * (1 - Ed.seg(ts, 6.95, 7.65)) if ts > 6.95 else 0.0
    def dial_f(ts):
        rise = Ed.back_out(Ed.seg(ts, T_STAGE, T_STAGE + 0.6), 1.2); return at(DIAL_AT[0], DIAL_AT[1] + (1 - rise) * 1500, 1.0, ring(ts))
    r.art('tower', tower, T_STAGE, T_CLIP3, 10, Ed.child(dial_f, off))
    for name, img, deg in (('hand-hour', hour, -7.5), ('hand-minute', minute, -90)):
        def hf(ts, deg=deg):
            v = dial_f(ts); u = Ed.ease(Ed.seg(ts, 5.95, 6.95)); return at(v['x'], v['y'], 1.0, deg * (1 - u) + v['r'])
        r.art(name, img, T_STAGE, T_CLIP3, 11 if 'hour' in name else 12, hf)
    word('gone', 300, 5.5, T_CLIP3, (540, 410), ACC)
    boxed('[at midnight Oct 31]', 70, 5.8, T_CLIP3, (540, 625), WHITE, 'at midnight Oct 31')
    doodle('burst', 1, 190, 6.95, T_CLIP3, (120, 900), CREAM, -20)     # the bells ring
    doodle('burst', 1, 190, 7.05, T_CLIP3, (960, 900), CREAM, 20)

    # 4 clip 3, the product again
    r.clip(2, T_CLIP3, None, 4, Ed.still(540, 960))
    word('only', 170, 8.4, T_CTA, (520, 380))
    boxed('[20 left]', 110, 8.65, T_CTA, (520, 590), ACC, '20 left')
    doodle('frame', 2, 560, 9.1, T_CTA, (520, 590), WHITE, -4)

    # 5 CTA
    word('comment', 170, 10.65, None, (520, 400))
    boxed('[POOF]', 130, 10.9, None, (520, 600), ACC, 'POOF', pill=True)
    word("before it's gone", 110, 11.2, None, (520, 800), ACC)
    doodle('arrow', 0, 200, 11.6, None, (150, 600), ACC)
    return r

def layers():
    return reel().L

# ---- the smoke: a shipped video on its own track above the text, added to the draft after editable.build ------------
def _inject_smoke(files):
    proj = files[0].parent
    (proj / 'Resources' / 'smoke').mkdir(parents=True, exist_ok=True); shutil.copy2(SMOKE, proj / 'Resources' / 'smoke' / SMOKE.name)
    for f in files:
        d = json.loads(f.read_text(encoding='utf-8')); mats = d['materials']
        if any(m.get('path', '').endswith(SMOKE.name) for m in mats['videos']): continue
        src_m = next(m for m in mats['videos'] if m.get('material_name') == 'SHOT 1 - replace me.mp4')
        src_s = next(s for t in d['tracks'] if t['type'] == 'video' for s in t['segments'] if s['material_id'] == src_m['id'])
        src_t = next(t for t in d['tracks'][1:] if t['type'] == 'video')
        m = json.loads(json.dumps(src_m)); m.update(id=E.uid(), path=f'{E.DRAFT_TOKEN}/Resources/smoke/{SMOKE.name}', duration=4600000,
                                                     width=720, height=1280, material_name='Smoke (included)',
                                                     local_material_id=E.uid(), has_audio=False)
        m['crop'] = {'upper_left_x': 0.0, 'upper_left_y': 0.0, 'upper_right_x': 1.0, 'upper_right_y': 0.0,
                     'lower_left_x': 0.0, 'lower_left_y': 1.0, 'lower_right_x': 1.0, 'lower_right_y': 1.0}
        mats['videos'].append(m)
        segs = []
        for t0 in (T_CUT, T_PUFF2):
            s = json.loads(json.dumps(src_s)); refs = []
            for rid in src_s['extra_material_refs']:
                for kind, lst in mats.items():
                    hit = next((x for x in lst if isinstance(x, dict) and x.get('id') == rid), None) if isinstance(lst, list) else None
                    if hit is None: continue
                    c = json.loads(json.dumps(hit)); c['id'] = E.uid()
                    if kind == 'speeds': c['speed'] = SMOKE_SPEED
                    if kind == 'common_mask': break
                    lst.append(c); refs.append(c['id']); break
            dur = int(round(SMOKE_DUR * E.US))
            s.update(id=E.uid(), material_id=m['id'], extra_material_refs=refs, speed=SMOKE_SPEED, volume=0.0,
                     target_timerange={'start': int(round(t0 * E.US)), 'duration': dur},
                     source_timerange={'start': 0, 'duration': int(round(dur * SMOKE_SPEED))},
                     common_keyframes=[], keyframe_refs=[], render_index=20000, track_render_index=200)
            s['clip'] = {'scale': {'x': SMOKE_SCALE, 'y': SMOKE_SCALE}, 'rotation': 0.0,
                         'transform': {'x': E.cx_(SMOKE_C[0]), 'y': E.cy_(SMOKE_C[1])},
                         'flip': {'vertical': False, 'horizontal': False}, 'alpha': 1.0}
            if 'uniform_scale' in s: s['uniform_scale'] = {'on': True, 'value': SMOKE_SCALE}
            segs.append(s)
        t = json.loads(json.dumps(src_t)); t.update(id=E.uid(), segments=segs); d['tracks'].append(t)
        f.write_text(json.dumps(d, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')

_flags0 = Ed._flags
def _flags(files):
    _flags0(files)
    if files and files[0].parent.name == SPEC['project']: _inject_smoke(files)
Ed._flags = _flags

_render0 = E.render
def _render(L, A, sources, out, *a, **k):
    """The preview: the template as usual, then her smoke composited on top (alpha), as CapCut shows it."""
    res = _render0(L, A, sources, out, *a, **k)
    if 'h1-now-you-see-it' not in str(out): return res
    tmp = out.with_name(out.stem + '-nosmoke.mp4'); shutil.move(out, tmp)
    sw, sh = int(W * SMOKE_SCALE), int(H * SMOKE_SCALE); x, y = int(SMOKE_C[0] - sw / 2), int(SMOKE_C[1] - sh / 2)
    puffs = ''.join(f'[{i + 1}:v]trim=duration={SMOKE_DUR * SMOKE_SPEED:.3f},setpts=(PTS-STARTPTS)/{SMOKE_SPEED}+{t0}/TB,'
                    f'scale={sw}:{sh},format=rgba[s{i}];' for i, t0 in enumerate((T_CUT, T_PUFF2)))
    fc = puffs + f'[0:v][s0]overlay={x}:{y}:eof_action=pass[v0];[v0][s1]overlay={x}:{y}:eof_action=pass,format=yuv420p[v]'
    subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-i', str(tmp), '-i', str(SMOKE), '-i', str(SMOKE), '-filter_complex', fc,
                    '-map', '[v]', '-map', '0:a?', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'copy',
                    '-movflags', '+faststart', str(out)], check=True)
    tmp.unlink(); return res
E.render = _render
