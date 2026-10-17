"""Storyboard stills for #4 A or B? (2026-10-17, v2: video first).
The buyer's two clips are the story. Nothing in the template shows a product (it works for any product): the layers
are the clips themselves (a blurred, blown-up copy behind each clip, so the background changes with every clip), the
clip cards that take over from each other, and accents only (Fluent emoji, white hand-drawn sparkles).
Transitions: the next clip waits half off-screen, then takes over while the last one drops away.
Type: DynaPuff SemiBold (bold, fun; CapCut library), white with a deep plum edge. Footage: Mercedes's soap clips (stand-in).
Usage: python build/storyboard_04.py  ->  04-a-or-b/storyboard/
"""
import subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import engine as E

OUT = E.PACK / '04-a-or-b' / 'storyboard'; OUT.mkdir(parents=True, exist_ok=True)
SCR = OUT / '_frames'; SCR.mkdir(exist_ok=True)
SOAP = Path('C:/Users/merce/OneDrive/Documents/Sudsy Day/Soap Photos')
W, H = 1080, 1920
WHITE, EDGE = (255, 255, 255), (58, 32, 74)        # deep plum edge (buyers change it)
HEAD = 'C:/Users/merce/AppData/Local/CapCut/User Data/Cache/AITextTemplate/Resource/13501609231124469651/DynaPuff-SemiBold.ttf'
A, B, PICK = ('IMG_6829', 7.5), ('IMG_6832', 0.2), ('IMG_6829', 3.0)   # version A, version B, the CTA clip

def F(px): return ImageFont.truetype(HEAD, px)

def footage(clip, size=(W, H)):
    name, t = clip; p = SCR / f'{name}-{t}.png'
    if not p.exists():
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t), '-i', str(SOAP / f'{name}.MP4'), '-frames:v', '1',
                        '-vf', f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}', str(p)], check=True)
    return ImageOps.fit(Image.open(p).convert('RGBA'), size)

def blur_bg(clip, dim=0.8):
    im = footage(clip).resize((int(W * 1.3), int(H * 1.3))).crop((int(W * .15), int(H * .15), int(W * 1.15), int(H * 1.15)))
    return ImageEnhance.Brightness(im.filter(ImageFilter.GaussianBlur(40))).enhance(dim)

def card(clip, w, h, radius=56, border=14):
    """The clip on a rounded card with a white edge and a soft shadow."""
    pic = footage(clip, (w, h)); m = Image.new('L', (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=radius, fill=255); pic.putalpha(m)
    out = Image.new('RGBA', (w + 2 * border, h + 2 * border), (0, 0, 0, 0))
    ImageDraw.Draw(out).rounded_rectangle((0, 0, out.width - 1, out.height - 1), radius=radius + border, fill=WHITE)
    out.alpha_composite(pic, (border, border))
    return C.shadow(out, offset=(10, 22), blur=26, alpha=120)

def place(img, item, c, rot=0):
    it = item.rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def words(img, xy, text, px=150, rot=0, fill=WHITE):
    """Big words: DynaPuff, white with a thick plum edge and a soft shadow."""
    f = F(px); bb = ImageDraw.Draw(img).multiline_textbbox((0, 0), text, font=f, anchor='la', align='center', stroke_width=12, spacing=8)
    bb = [int(v) for v in bb]
    lay = Image.new("RGBA", (bb[2] - bb[0] + 60, bb[3] - bb[1] + 60), (0, 0, 0, 0)); o = (30 - bb[0], 30 - bb[1])
    sh = lay.copy(); ImageDraw.Draw(sh).multiline_text((o[0] + 6, o[1] + 12), text, font=f, fill=(0, 0, 0, 110), align='center', stroke_width=12, stroke_fill=(0, 0, 0, 110), spacing=8)
    lay.alpha_composite(sh.filter(ImageFilter.GaussianBlur(9)))
    ImageDraw.Draw(lay).multiline_text(o, text, font=f, fill=fill, align='center', stroke_width=12, stroke_fill=EDGE, spacing=8)
    place(img, lay, xy, rot)

def pill(img, xy, text, px=58, rot=0):
    """Small words on a white pill."""
    f = F(px); tw = int(f.getbbox(text)[2]); h = int(px * 1.6)
    p = Image.new('RGBA', (tw + int(px * 1.4), h), (0, 0, 0, 0)); d = ImageDraw.Draw(p)
    d.rounded_rectangle((0, 0, p.width - 1, h - 1), radius=h // 2, fill=WHITE)
    d.text((p.width / 2, h / 2), text, font=f, fill=EDGE, anchor='mm')
    place(img, C.shadow(p, offset=(4, 8), blur=8, alpha=90), xy, rot)

def emoji(img, name, xy, size=170, rot=0): place(img, C.sticker(name, size, border=0, shadow_alpha=70), xy, rot)
def spark(img, xy, size=90, rot=0): place(img, C.sparkle_fill(size, WHITE), xy, rot)

# ---- the frames ---------------------------------------------------------------------------------------------------------
def f1():
    """Hook: two clips face off. Background: A blurred top, B blurred bottom. The cards bump into each other."""
    im = blur_bg(A); im.alpha_composite(blur_bg(B).crop((0, H // 2, W, H)), (0, H // 2))
    place(im, card(A, 600, 820), (380, 560), -7)
    place(im, card(B, 600, 820), (700, 1380), 6)
    words(im, (W / 2, 990), 'WHICH ONE\nWOULD YOU PICK?', 112, -3)
    emoji(im, 'sparkles', (900, 330), 170, 12); spark(im, (130, 1250), 90, -10); spark(im, (190, 1370), 55)
    return im

def f2():
    """A takes over: card A rushes forward to fill the screen, card B drops away off the bottom."""
    im = blur_bg(A)
    place(im, card(B, 420, 575), (820, 1840), 24)
    place(im, card(A, 960, 1600), (W / 2, 900), -2)
    return im

def f3():
    """A: clip A plays big on its own blurred copy; B waits half off-screen in the corner (it's next)."""
    im = blur_bg(A)
    place(im, card(A, 920, 1500), (W / 2, 860), 0)
    place(im, card(B, 380, 520), (980, 1760), -14)
    words(im, (W / 2, 1420), '[NAME A]', 140, -3); pill(im, (W / 2, 1580), 'one word', 60, -3)
    emoji(im, 'red_heart', (880, 260), 160, 14); spark(im, (150, 300), 80); spark(im, (210, 400), 50)
    return im

def f4():
    """B takes over: B swings up from the corner and covers A; the background changes to B's blur behind it."""
    im = blur_bg(A); bg_b = blur_bg(B); m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon([(W, 360), (W, H), (0, H), (0, 1500)], fill=255); im.paste(bg_b, (0, 0), m.filter(ImageFilter.GaussianBlur(30)))
    place(im, card(A, 920, 1500), (W / 2 - 80, 820), -4)
    place(im, card(B, 820, 1340), (W / 2 + 120, 1180), 9)
    return im

def f5():
    """B: clip B big on its own blurred copy; A waits half off-screen in the other corner."""
    im = blur_bg(B)
    place(im, card(B, 920, 1500), (W / 2, 860), 0)
    place(im, card(A, 380, 520), (100, 1760), 14)
    words(im, (W / 2, 1420), '[NAME B]', 140, 3); pill(im, (W / 2, 1580), 'one word', 60, 3)
    emoji(im, 'glowing_star', (200, 260), 170, -12); spark(im, (930, 300), 80); spark(im, (870, 400), 50)
    return im

def f6():
    """Both: side by side on a split background (A's blur left, B's right), see-sawing; a big 'or' between."""
    im = blur_bg(A); im.alpha_composite(blur_bg(B).crop((W // 2, 0, W, H)), (W // 2, 0))
    place(im, card(A, 470, 800), (285, 900), -5)
    place(im, card(B, 470, 800), (795, 1000), 5)
    words(im, (W / 2, 960), 'or', 170, 0)
    emoji(im, 'red_heart', (130, 470), 140, -14); emoji(im, 'glowing_star', (960, 560), 150, 12)
    words(im, (W / 2, 1600), 'YOUR PICK?', 120, -2)
    return im

def f7():
    """CTA: the pick clip (a hand picking one up) full screen; the two cards drop out of shot at the bottom."""
    im = footage(PICK)
    place(im, card(A, 300, 420), (170, 1860), -16); place(im, card(B, 300, 420), (910, 1860), 16)
    words(im, (W / 2, 330), 'Comment', 150, -3); words(im, (W / 2, 500), '"[KEYWORD]"', 130, -3)
    pill(im, (W / 2, 650), "and I'll send you the link", 52, -3)
    emoji(im, 'sparkles', (900, 820), 130, 10)
    return im

def main():
    frames = [f1(), f2(), f3(), f4(), f5(), f6(), f7()]
    names = ['1 hook, face off', '2 A takes over, B drops away', '3 A, B waits in the corner', '4 B takes over',
             '5 B, A waits in the corner', '6 both, see-saw', '7 CTA']
    for old in OUT.glob('*.jpg'): old.unlink()
    for n, f in zip(names, frames): f.convert('RGB').save(OUT / f'{n}.jpg', quality=90)
    sheet = Image.new('RGB', (W * 7 + 120, H), 'white')
    for i, f in enumerate(frames): sheet.paste(f.convert('RGB'), (i * (W + 20), 0))
    sheet.resize((sheet.width // 3, sheet.height // 3)).save(OUT / 'storyboard-04.jpg', quality=90)
    print('saved', OUT)

if __name__ == '__main__':
    main()
