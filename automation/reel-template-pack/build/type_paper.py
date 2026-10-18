"""Type on paper (her note: pills look like a TikTok takeover; use pills only sparingly as emphasis). Words sit on
torn paper, the collage way, so they read on any clip: the key word big in one bold sans on a torn strip of paper in
the brand colour (text auto white/ink), the small words on a torn scrap of white paper; only the keyword gets a pill.
Tested on four very different clips in three brand colours. Usage: python build/type_paper.py -> type-paper-test.jpg
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
from type_stress import pill, on, put, SANSB, WHITE, INK

def strip(text, px, color, rot, seed):
    f = S.F(SANSB, px); l, t, r, b = f.getbbox(text); w, h = int(r - l + px * 0.9), int(b - t + px * 0.75)
    p = C.torn_strip((w, h), color, seed=seed, edges='tblr'); ImageDraw.Draw(p).text((w / 2, h / 2), text, font=f, fill=on(color), anchor='mm')
    return C.shadow(p, (6, 10), 10, 100).rotate(rot, expand=True, resample=3)

def frame(clip, brand):
    im = S.footage(clip)
    put(im, strip('what', 60, (250, 248, 244), -4, 3), (330, 460)); put(im, strip('buyers', 170, brand, 2, 5), (560, 640)); put(im, strip('said', 60, (250, 248, 244), 3, 7), (780, 820))
    put(im, strip('comment', 62, (250, 248, 244), -2, 9), (430, 1230)); put(im, pill('[keyword]', 110, brand, 3), (620, 1390)); return im

def main():
    clips = [('IMG_1469', 1.0), ('IMG_1448', 1.0), ('IMG_1430', 1.0), ('IMG_1388', 0.5)]
    brands = [(232, 190, 205), (24, 56, 110), (240, 200, 60)]
    sheet = Image.new('RGB', (4 * 290 + 30, 3 * 515 + 20), 'white')
    for r, bc in enumerate(brands):
        for c, cl in enumerate(clips): sheet.paste(frame(cl, bc).convert('RGB').resize((280, 498)), (c * 290 + 10, r * 515 + 10))
    out = S.E.PACK / 'type-paper-test.jpg'; sheet.save(out, quality=88); print(out)

if __name__ == '__main__':
    main()
