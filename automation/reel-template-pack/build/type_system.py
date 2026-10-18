"""The type system from her notes on Lisa's Reels (2026-10-18): highlight boxes for the small lines (underused till now:
use them most), a condensed serif key word with a thick outline (easy to read), glow only for the CTA emphasis, a pill
only once, video-fill only sparingly. Small lines are big enough to read (no tiny captions). Works on any clip in any
brand colour: the outline and the highlight take the brand colour; text on them flips white/ink by brightness.
Usage: python build/type_system.py  ->  type-system-test.jpg
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, str(Path(__file__).resolve().parent))
import storyboard_b2 as S
SANS, SANSB, SERIF_C = 'C:/Windows/Fonts/segoeui.ttf', 'C:/Windows/Fonts/segoeuib.ttf', 'C:/Windows/Fonts/BOD_CR.TTF'
WHITE, INK = (255, 255, 255), (24, 23, 22)

def on(c): return INK if (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) > 160 else WHITE

def highlight(lines, px, bg, rot=0):
    """Small lines on tight rectangular highlight boxes, each line its own box (Lisa's 'everyone / is trying / to grow')."""
    f = S.F(SANS, px); boxes = []
    for l in lines:
        a, t, b, bt = f.getbbox(l); w, h = int(b - a + px * 0.35), int(px * 1.18)
        im = Image.new('RGBA', (w, h), bg + (255,)); ImageDraw.Draw(im).text((w / 2, h / 2), l, font=f, fill=on(bg), anchor='mm'); boxes.append(im)
    W_ = max(b.width for b in boxes); H_ = sum(b.height for b in boxes); out = Image.new('RGBA', (W_ + 20, H_ + 20), (0, 0, 0, 0)); y = 10
    for b in boxes: out.alpha_composite(b, (10, y)); y += b.height
    return out.rotate(rot, expand=True, resample=3) if rot else out

def outlined(text, px, edge, fill=WHITE, ew=None, glow=False):
    """The key word: condensed serif, white, thick outline in the brand colour, soft shadow; glow only for the CTA."""
    f = S.F(SERIF_C, px); l, t, r, b = f.getbbox(text); ew = ew or max(3, px // 55); pad = ew * 3 + 40; w, h = r - l + 2 * pad, b - t + 2 * pad
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((pad - l, pad - t), text, font=f, fill=255); out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sh = Image.new('RGBA', (w, h), (0, 0, 0, 0)); sh.putalpha(m.filter(ImageFilter.MaxFilter(2 * ew + 1)).filter(ImageFilter.GaussianBlur(12)).point(lambda v: int(v * 0.5))); out.alpha_composite(sh, (0, 8))
    if glow:
        g = Image.new('RGBA', (w, h), WHITE + (0,)); g.putalpha(m.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(24))); out.alpha_composite(g)
    e = Image.new('RGBA', (w, h), edge + (255,)); e.putalpha(m.filter(ImageFilter.MaxFilter(2 * ew + 1))); out.alpha_composite(e)
    fl = Image.new('RGBA', (w, h), fill + (255,)); fl.putalpha(m); out.alpha_composite(fl); return out

def put(img, it, c): img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def frame(clip, brand):
    im = S.footage(clip)
    put(im, highlight(['what my', 'buyers'], 88, WHITE, -2), (330, 400))
    put(im, outlined('actually said', 210, brand), (560, 640))
    put(im, highlight(['comment'], 88, brand), (360, 1200))
    put(im, outlined('[keyword]', 190, brand), (580, 1370))   # glow is an animation effect for emphasis, not static
    return im

def main():
    clips = [('IMG_1469', 1.0), ('IMG_1448', 1.0), ('IMG_1430', 1.0), ('IMG_1388', 0.5)]
    brands = [(232, 160, 185), (24, 56, 110), (230, 190, 50)]
    sheet = Image.new('RGB', (4 * 290 + 30, 3 * 515 + 20), 'white')
    for r, bc in enumerate(brands):
        for c, cl in enumerate(clips): sheet.paste(frame(cl, bc).convert('RGB').resize((280, 498)), (c * 290 + 10, r * 515 + 10))
    out = S.E.PACK / 'type-system-test.jpg'; sheet.save(out, quality=88); print(out)

if __name__ == '__main__':
    main()
