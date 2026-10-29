"""Mercedes's own h1 Reel (2026-10-29): "Watch my ManyChat bill disappear", Comment MANYCHAT. Built from the approved
template's pieces (motion_h1.py, untouched): her smoke on Screen blend, the clock tower striking midnight, Bodoni words,
her doodles. No empty shot was filmed, so the empty plate is the curtain from the left edge of a YouTube take (IMG_2063);
the smoke hides the switch (her note 2026-10-29: let her finish "disappear", poof 1 s later, and SHE disappears).
 0.0-5.4   her hook (IMG_2076 from 1.0 s); a real cream index card, the bill in her handwriting, lands on "Watch my"
 5.4-7.4   the smoke poofs over her and the card; they're gone: "now you don't" on the empty curtain
 7.4-10.1   the midnight stage: tower rises, hands sweep to midnight, rings; "gone" + "[$39 a month]"; second puff
 10.1-12.7 her real Chat Manager demo inbox on a phone: "mine" + "[$6 a month]"
 12.7-16.1 CTA on the midnight stage: comment [MANYCHAT] for my full guide
Accent = brand sky blue (orange is retired). Usage: python build/motion_h1_mine.py [stills...]
"""
import math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps, ImageChops
import motion_h1 as M

E, B = M.E, M.B
W, H, FPS = M.W, M.H, M.FPS
ROOT = Path(__file__).resolve().parents[2]
REEL = ROOT / 'reel-hf' / '2026-10-29-hw-manychat-bill'
SRC = Path('C:/Users/merce/OneDrive/Scrolly Media/videos/2026-10-28-session/reels/IMG_2076.MOV')
T0 = 1.0
OUT = Path('C:/Users/merce/OneDrive/Scrolly Media/exports/reels/draft'); OUT.mkdir(parents=True, exist_ok=True)
TMP = REEL / '_frames'; TMP.mkdir(exist_ok=True)
SKY, NAVY, WHITE, ORANGE = (77, 163, 255), (10, 25, 48), (255, 255, 255), M.ACC
T_CARD, T_POOF, T_STAGE, T_RING, T_PUFF2, T_CLIP3, T_CTA, END = 2.3, 5.4, 7.4, 8.95, 9.4, 10.1, 12.7, 16.1
HAND = str(ROOT / 'reel-hf' / 'lib' / 'assets' / 'fonts' / 'covered-by-your-grace.woff2')

HER = M.extract(SRC, str(TMP / 'hook'), T0, 6.4)
INBOX = [ImageOps.fit(Image.open(p).convert('RGBA'), (W, H)) for p in sorted((REEL / 'screens').glob('inbox-0*.png'))]
def _plate():
    """The same curtain with nobody in it: the left edge of YouTube take IMG_2063 (tripod, same curtain), 9:16."""
    f = TMP / 'plate.jpg'
    if not f.exists():
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', '5', '-i', 'C:/Users/merce/OneDrive/Scrolly Media/videos/2026-10-28-session/youtube/IMG_2063.MOV',
                        '-frames:v', '1', '-vf', f'{B.S.TONE},crop=1215:2160:0:0,scale={W}:{H}', '-q:v', '2', str(f)], check=True)
    return Image.open(f).convert('RGBA')
PLATE = _plate()
def her(t): return Image.open(HER[min(len(HER) - 1, max(0, int(t * FPS)))]).convert('RGBA')
def inbox(t): return INBOX[min(len(INBOX) - 1, max(0, int((t - 0.5) / 0.45) + 1 if t >= 0.5 else 0))].copy()

def _card():
    """The bill: her real blank cream index card, written on in her handwriting font (navy ink)."""
    c = B.cut_white(Image.open(M.LIB / 'images' / 'Blank cream index card on white-24.png'), tol=8); c = c.crop(c.getbbox())
    c = c.resize((640, int(c.height * 640 / c.width)), Image.LANCZOS); d = ImageDraw.Draw(c)
    d.text((c.width / 2, c.height * 0.33), 'ManyChat Pro', font=E.ImageFont.truetype(HAND, 92), fill=NAVY + (255,), anchor='mm')
    d.text((c.width / 2, c.height * 0.66), '$39 a month', font=E.ImageFont.truetype(HAND, 118), fill=NAVY + (255,), anchor='mm')
    return c
CARD = _card(); CARD_C = (540, 1430)

def stage(t):
    """The template's midnight stage at her times: the tower rises, its brass hands sweep to midnight, it rings."""
    im = Image.new('RGBA', (W, H), M.STAGE + (255,)); im.alpha_composite(M.GRAIN)
    rise = M.back_out((t - T_STAGE) / 0.6, 1.2); dy = (1 - rise) * 1500
    ring = 1.5 * math.sin((t - T_RING) * 50) * (1 - M.clamp((t - T_RING) / 0.7)) if t > T_RING else 0
    c = (M.DIAL_AT[0], M.DIAL_AT[1] + dy)
    M.put(im, M.TOWER, (c[0] - M.DIAL[0] + M.TOWER.width / 2, c[1] - M.DIAL[1] + M.TOWER.height / 2), ring)
    u = M.ease((t - (T_STAGE + 0.55)) / 1.0)
    M.put(im, M.HOUR, c, -7.5 * (1 - u) + ring); M.put(im, M.MINUTE, c, -90 * (1 - u) + ring)
    return im
def plain_stage():
    im = Image.new('RGBA', (W, H), M.STAGE + (255,)); im.alpha_composite(M.GRAIN); return im

def frame(t):
    if t < T_POOF + 0.45: im = her(t)
    elif t < T_STAGE: im = PLATE.copy()
    elif t < T_CLIP3: im = stage(t)
    elif t < T_CTA: im = inbox(t - T_CLIP3)
    else: im = plain_stage()
    # 1 the bill lands below her face on "Watch my", gone when the smoke is thickest
    if T_CARD <= t < T_POOF + 0.45:
        k = M.back_out((t - T_CARD) / 0.35, 1.6)
        M.put(im, CARD, (CARD_C[0], CARD_C[1] + 260 * (1 - k)), -4 + 3 * math.sin(t * 2))
        M.doodle(im, t, T_CARD + 0.5, 'arrow', 0, 170, (150, 1250), SKY, 30, t1=T_POOF + 0.45)   # points at the bill
    # 2 she and the bill are gone: "now you don't" on the empty curtain
    M.word(im, t, T_POOF + 0.45, 'now you', (540, 820), 130, NAVY, t1=T_STAGE)
    M.word(im, t, T_POOF + 0.6, "don't", (540, 1030), 260, NAVY, t1=T_STAGE)
    # 3 midnight: gone
    M.word(im, t, T_STAGE + 0.1, 'gone', (540, 360), 300, SKY, t1=T_CLIP3)
    M.boxed(im, t, T_STAGE + 0.4, '$39 a month', (540, 580), 72, WHITE, NAVY, t1=T_CLIP3)
    M.doodle(im, t, T_RING, 'burst', 1, 190, (120, 900), (246, 238, 222), -20, t1=T_CLIP3)
    M.doodle(im, t, T_RING + 0.1, 'burst', 1, 190, (960, 900), (246, 238, 222), 20, t1=T_CLIP3)
    # 4 her own inbox
    M.word(im, t, T_CLIP3 + 0.3, 'mine', (540, 1180), 190, SKY, t1=T_CTA)
    M.boxed(im, t, T_CLIP3 + 0.55, '$6 a month', (540, 1390), 96, SKY, NAVY, t1=T_CTA)
    # 5 CTA
    M.word(im, t, T_CTA + 0.05, 'comment', (540, 640), 170)
    M.boxed(im, t, T_CTA + 0.3, 'MANYCHAT', (540, 860), 120, ORANGE, WHITE, pill=True)  # orange: her pick for this ending (2026-10-29)
    M.word(im, t, T_CTA + 0.6, 'for my full guide', (540, 1070), 104, ORANGE)
    M.doodle(im, t, T_CTA + 0.9, 'arrow', 0, 150, (80, 860), ORANGE)
    for t0, c in ((T_POOF, (540, 950)), (T_PUFF2, (540, 520))):    # her smoke on Screen: over the bill, then over the stage
        M.SMOKE_C = c; s = M.smoke_at(t, t0)
        if s is not None: im = ImageChops.screen(im.convert('RGB'), s).convert('RGBA')
    return im.convert('RGB')

SFX = ROOT / 'reel-hf' / '2026-10-13-bb-jumbo-shrimp' / 'assets' / 'sfx'
MUSIC = ROOT / 'reel-hf' / '2026-10-13-bb-jumbo-shrimp' / 'assets' / 'music-candidates' / '06-curiosity.mp3'
FX = [('pop-light', T_CARD), ('swoosh-in', T_POOF), ('chime', T_RING), ('swoosh-in', T_PUFF2), ('pop-bubble', T_CLIP3 + 0.55),
      ('check', T_CTA + 0.3)]
HOOK = T_POOF + 0.1

def main():
    if len(sys.argv) > 1:
        for s in sys.argv[1:]: frame(float(s)).save(TMP / f'still-{s}.jpg', quality=88); print(TMP / f'still-{s}.jpg')
        return
    fdir = TMP / 'out'; fdir.mkdir(exist_ok=True)
    for i in range(int(END * FPS)): frame(i / FPS).save(fdir / f'{i:04d}.jpg', quality=88)
    mp4 = OUT / '2026-10-29-hw-manychat-bill.mp4'
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
