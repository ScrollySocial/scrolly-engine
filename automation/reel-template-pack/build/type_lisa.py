"""Type options after her notes on type-options.jpg ("look at Lisa's videos"): Lisa's system, read from her technique
stills: ONE plain sans (Helvetica-style), lowercase, white plus ONE colour taken from the shot, big size jumps word to
word, placed around the subject. The key word gets one treatment: A soft white glow, B colour outline, C filled with a
photo from the clip, D a pill label for the small line. All use the same font (Segoe UI, ships with Windows; CapCut
has close matches). Usage: python build/type_lisa.py  ->  type-options-lisa.jpg
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import storyboard_b2 as S
SANS, SANSB = 'C:/Windows/Fonts/segoeui.ttf', 'C:/Windows/Fonts/segoeuib.ttf'
W, H, WHITE = 1080, 1920, (255, 255, 255); RED = (206, 44, 60)   # the watermelon red: a colour from the shot

def word(text, px, color=WHITE, bold=True, glow=False, outline=None, fill=None):
    f = S.F(SANSB if bold else SANS, px); l, t, r, b = f.getbbox(text); pad = 60; w, h = r - l + 2 * pad, b - t + 2 * pad
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).text((pad - l, pad - t), text, font=f, fill=255); out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    sh = Image.new('RGBA', (w, h), (0, 0, 0, 0)); sh.putalpha(m.filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.45))); out.alpha_composite(sh, (0, 6))
    if glow:
        gl = Image.new('RGBA', (w, h), (255, 255, 255, 0)); gl.putalpha(m.filter(ImageFilter.GaussianBlur(22)).point(lambda v: min(255, int(v * 1.4)))); out.alpha_composite(gl)
    if outline:
        e = Image.new('RGBA', (w, h), outline + (255,)); e.putalpha(m.filter(ImageFilter.MaxFilter(13))); out.alpha_composite(e)
    fl = ImageOps.fit(fill, (w, h)).convert('RGBA') if fill is not None else Image.new('RGBA', (w, h), color + (255,)); fl.putalpha(m); out.alpha_composite(fl)
    return out

def pill(text, px, bg, fg=WHITE, rot=-4):
    f = S.F(SANSB, px); l, t, r, b = f.getbbox(text); w, h = r - l + px, b - t + int(px * 0.7)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im); d.rounded_rectangle((0, 0, w - 1, h - 1), h // 2, fill=bg + (255,))
    d.text((w / 2, h / 2), text, font=f, fill=fg, anchor='mm'); return im.rotate(rot, expand=True, resample=Image.BICUBIC)

def put(img, it, c): img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def option(n, base, photo):
    im = base.copy(); small = lambda t_, px=64: word(t_, px, bold=False)
    put(im, small('what'), (300, 470))
    if n == 1: put(im, word('buyers', 240, glow=True), (560, 620))
    if n == 2: put(im, word('buyers', 240, WHITE, outline=RED), (560, 620))
    if n == 3: put(im, word('buyers', 270, fill=photo, outline=WHITE), (560, 620))     # a different clip inside, a white edge
    if n == 4: put(im, word('buyers', 240), (560, 620))
    put(im, small('said', 64), (820, 790) if n != 4 else (820, 790))
    if n == 4: put(im, pill('real reviews only', 54, RED), (540, 900))
    put(im, small('comment', 64), (400, 1250))
    if n == 4: put(im, pill('[keyword]', 110, RED), (600, 1390))
    else: put(im, word('[keyword]', 150, WHITE, outline=RED), (600, 1380))                 # colour never on a same-colour clip
    return im

def main():
    base = S.footage(('IMG_1388', 0.5)); photo = S.footage(('IMG_1381', 1.0))
    names = ['A  soft glow on the key word', 'B  key word with a colour outline', 'C  key word filled with your clip', 'D  plain + one pill label']
    sheet = Image.new('RGB', (4 * 540 + 60, 1030), 'white'); d = ImageDraw.Draw(sheet); f = S.F(SANSB, 26)
    for i in range(4): sheet.paste(option(i + 1, base, photo).convert('RGB').resize((540, 960)), (i * 560, 70)); d.text((i * 560 + 6, 22), names[i], font=f, fill=(28, 27, 26))
    out = S.E.PACK / 'type-options-lisa.jpg'; sheet.save(out, quality=90); print(out)

if __name__ == '__main__':
    main()
