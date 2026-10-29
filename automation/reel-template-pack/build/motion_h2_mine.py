"""Mercedes's own h2 Reel (2026-10-29): "3 free tools I'm batty about", Comment QUIZ. Runs the approved template
motion (motion_h2.py, untouched) with her hook take and real phone recordings of the three tools, shifted so her spoken
hook plays first. Her clip: 2026-10-28-session/reels/IMG_2072.MOV. Screens: automation/reel-hf/2026-10-29-hw-batty-tools/screens.
 0.0-3.8  her hook, a bat hangs from a branch beside her head (above the face, never over it)
 3.8-5.6  template beat 1 (bat swirl + "things I'm BATTY about"), lettering moved below her face; she says "batty" at 4.4
 5.6-18.8 template beats 2-6 (+3.8 s): 3 FREE TOOLS, Offer quiz, Next steps quiz, Calculators, Comment QUIZ
Usage: python build/motion_h2_mine.py  ->  <exports>/reels/draft/2026-10-29-hw-batty-tools.mp4
"""
import math, subprocess
from pathlib import Path
from PIL import Image, ImageOps
import motion_h2 as M

E, B = M.E, M.B
W, H, FPS = M.W, M.H, M.FPS
SHIFT, HOOK = 3.8, 5.6
END = 15.0 + SHIFT
ROOT = Path(__file__).resolve().parents[2]
REEL = ROOT / 'reel-hf' / '2026-10-29-hw-batty-tools'
SCREENS = REEL / 'screens'
SRC = Path('C:/Users/merce/OneDrive/Scrolly Media/videos/2026-10-28-session/reels/IMG_2072.MOV')
T0 = 1.0                                   # her "In the spirit of Halloween" starts right away; "batty" lands at 4.4
OUT = Path('C:/Users/merce/OneDrive/Scrolly Media/exports/reels/draft'); OUT.mkdir(parents=True, exist_ok=True)
TMP = REEL / '_frames'; TMP.mkdir(exist_ok=True)

def her_frames():
    d = TMP / 'hook'; d.mkdir(exist_ok=True)
    if not any(d.glob('*.jpg')):
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(T0), '-t', str(HOOK + 0.2), '-i', str(SRC),
                        '-vf', f'{B.S.TONE},fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}',
                        '-q:v', '3', str(d / '%04d.jpg')], check=True)
    return sorted(d.glob('*.jpg'))
HER = her_frames()
def states(name):
    return [ImageOps.fit(Image.open(p).convert('RGBA'), (W, H)) for p in sorted(SCREENS.glob(f'{name}-0*.png'))]
SC = {'b': (states('quiz'), 0.9, 0.55), 'c': (states('next'), 0.6, 0.7), 'd': (states('calc'), 0.4, 0.38)}

def vid(key, t):
    """Template clip slots: a = her hook, b/c/d = the real tool screens, stepping through what was clicked or typed."""
    if key == 'a': return Image.open(HER[min(len(HER) - 1, max(0, int((t + SHIFT) * FPS)))]).convert('RGBA')
    fr, start, step = SC[key]
    return fr[min(len(fr) - 1, max(0, int((t - start) / step) + 1 if t >= start else 0))].copy()
M.vid = vid

# words: her favourites, her comment word; the hook lettering sits below her face
TICKETS = {'[favourite 1]': 'Offer quiz', '[favourite 2]': 'Next steps quiz', '[favourite 3]': 'Calculators'}
# On the tool screens, number + ticket + doodle move off the page title and off what's being clicked or typed:
# [template ticket base, new ticket centre], [template number centre, new number centre], doodle moves
TK = {'Offer quiz': ((540, 1290), (560, 1520)), 'Next steps quiz': ((540, 650), (690, 905)), 'Calculators': ((540, 650), (690, 1470))}
NUM = {'1': (820, 1330), '2': (890, 730), '3': (880, 1270)}
DOO_MOVE = {(560, 870): (840, 1150), (800, 420): None, (850, 1150): (900, 1200), (200, 1180): (930, 960)}
_ticket, _pop, _line, _put, _draw = M.ticket, M.pop_word, M.line, M.put, M.D.draw_on
tk_ids = {}
def ticket(text, w=620):
    name = TICKETS.get(text, text); im = _ticket(name, w); tk_ids[id(im)] = name; return im
def put(img, im, c, rot=0, shadow=True):
    name = tk_ids.pop(id(im), None)        # pop: ids get reused once an image is freed
    if name: (bx, by), (nx, ny) = TK[name]; c = (nx + c[0] - bx, ny + c[1] - by)
    _put(img, im, c, rot, shadow)
_Dmod = M.D
M.ticket, M.put = ticket, put
in_hook = {'on': False}
def pop_word(img, t, t0, text, c, px, rot=0):
    if in_hook['on']: c = (c[0], c[1] + 520)
    elif text == 'MY TOP': text, px = '3 FREE', 112
    elif text == '3' and c[1] == 1200: text, px = 'TOOLS', 128
    elif text == 'BATTY': text = 'QUIZ'
    elif text in NUM and c[0] == 540 and px == 240: c, px = NUM[text], 200
    _pop(img, t, t0, text, c, px, rot)
def line(img, t, t0, text, xy, px=70, **kw):
    if in_hook['on']: xy = (xy[0], xy[1] + 520)
    if text == "and I'll send all 3 links": text = "and I'll DM you the quiz link"
    _line(img, t, t0, text, xy, px, **kw)
M.pop_word, M.line = pop_word, line
class DProxy:
    def __getattr__(self, k): return getattr(_Dmod, k)
    def draw_on(self, img, doo, c, *a):
        c = DOO_MOVE.get(tuple(c), c)
        if c is not None: _draw(img, doo, c, *a)
M.D = DProxy()

def frame(t):
    if t < SHIFT:                          # her hook: a bat hangs from a branch above, beside her head
        im = vid('a', t - SHIFT)
        M.put(im, M.sized(M.BRANCH, 760, 'brh'), (720, 120 - 40 * (1 - M.ease(t / 0.5))))
        k = M.back_out((t - 0.4) / 0.4)
        if t > 0.4: M.put(im, M.sized(M.HANG, 170 * max(0.1, k), f'h{int(170 * max(0.1, k))}'), (900, 300 + 5 * math.sin(t * 5)), 5 * math.sin(t * 3))
        return im.convert('RGB')
    tt = t - SHIFT
    in_hook['on'] = tt < 1.8
    try: return M.frame(tt)
    finally: in_hook['on'] = False

SFX = ROOT / 'reel-hf' / '2026-10-13-bb-jumbo-shrimp' / 'assets' / 'sfx'
MUSIC = ROOT / 'reel-hf' / '2026-10-13-bb-jumbo-shrimp' / 'assets' / 'music-candidates' / '06-curiosity.mp3'
FX = [('swoosh-in', 3.8), ('swoosh-in', 6.8), ('pop-light', 8.0), ('swoosh-in', 9.6), ('pop-light', 10.4),
      ('swoosh-in', 12.8), ('pop-light', 13.8), ('pop-bubble', 16.8)]

def main():
    import sys
    if len(sys.argv) > 1:                  # stills: python build/motion_h2_mine.py 1.0 4.6 ...
        for s in sys.argv[1:]: frame(float(s)).save(TMP / f'still-{s}.jpg', quality=88); print(TMP / f'still-{s}.jpg')
        return
    fdir = TMP / 'out'; fdir.mkdir(exist_ok=True)
    for i in range(int(END * FPS)): frame(i / FPS).save(fdir / f'{i:04d}.jpg', quality=88)
    mp4 = OUT / '2026-10-29-hw-batty-tools.mp4'
    ins = ['-framerate', str(FPS), '-i', str(fdir / '%04d.jpg'), '-ss', str(T0), '-t', str(HOOK), '-i', str(SRC),
           '-stream_loop', '-1', '-i', str(MUSIC)]
    for name, _ in FX: ins += ['-i', str(SFX / f'{name}.mp3')]
    fl = [f'[1:a]aresample=48000,loudnorm=I=-14:TP=-1.5,afade=t=out:st={HOOK - 0.2}:d=0.2,apad[v]',
          f'[2:a]aresample=48000,volume=0.16,afade=t=in:d=3,afade=t=out:st={END - 1.2}:d=1.2,atrim=0:{END}[m]']
    for j, (_, at) in enumerate(FX): fl.append(f'[{3 + j}:a]aresample=48000,volume=0.5,adelay={int(at * 1000)}:all=1[f{j}]')
    fl.append('[v][m]' + ''.join(f'[f{j}]' for j in range(len(FX))) + f'amix=inputs={2 + len(FX)}:normalize=0,atrim=0:{END}[a]')
    subprocess.run([E.FFMPEG, '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '0:v', '-map', '[a]',
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-c:a', 'aac', '-b:a', '192k',
                    '-movflags', '+faststart', '-t', str(END), str(mp4)], check=True)
    print('saved', mp4)

if __name__ == '__main__':
    main()
