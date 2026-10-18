"""Must-do 9 and 10 (FRAMEWORK.md READ FIRST): before showing a motion test, put its 1-frame-per-second strip above
stills from her four winners (f2 The fall drop, h3 Caught in our web, h6 Once in a blood moon, #3 Before and after),
and check it against the must-dos. Usage: python build/compare_winners.py NN-folder [...]  ->  NN-.../preview/vs-winners.jpg
"""
import subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

PACK = Path(__file__).resolve().parent.parent; FF = str(PACK.parent / 'hyperframes-test' / 'bin' / 'ffmpeg.exe')
WINNERS = [('f2 The fall drop', 'fall/f2-fall-drop/preview/after.mp4'), ('h3 Caught in our web', 'halloween/h3-caught-in-our-web/preview/after.mp4'),
           ('h6 Once in a blood moon', 'halloween/h6-once-in-a-blood-moon/preview/after.mp4'), ('#3 Before and after', '03-before-and-after/preview/after.mp4')]
TW, TH = 160, 284

def strip(mp4, fps=1, n=13):
    out = Path(mp4).with_suffix('.strip.png')
    subprocess.run([FF, '-v', 'error', '-y', '-i', str(mp4), '-vf', f'fps={fps},scale={TW}:{TH},tile={n}x1', '-frames:v', '1', str(out)], check=True)
    im = Image.open(out).convert('RGB'); out.unlink(); return im

def main():
    f = ImageFont.truetype('arialbd.ttf', 20); wins = [(n, strip(PACK / p, 1, 13)) for n, p in WINNERS]
    for folder in sys.argv[1:]:
        mine = strip(PACK / folder / 'preview' / 'motion-test.mp4', 1, 13)
        rows = [(f'{folder} (1 frame a second)', mine)] + [(f'winner: {n}', s) for n, s in wins]
        sheet = Image.new('RGB', (13 * TW, len(rows) * (TH + 30)), 'white'); d = ImageDraw.Draw(sheet)
        for i, (label, im) in enumerate(rows):
            d.text((6, i * (TH + 30) + 5), label, font=f, fill=(200, 40, 30) if i == 0 else (40, 40, 40)); sheet.paste(im, (0, i * (TH + 30) + 30))
        out = PACK / folder / 'preview' / 'vs-winners.jpg'; sheet.save(out, quality=85); print(out)

if __name__ == '__main__':
    main()
