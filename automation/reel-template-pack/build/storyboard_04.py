"""Storyboard stills for #4 A or B? (2026-10-17, v3: bold side-by-sides and clever cuts).
Her brief: no theme. Buyers drop in their clips (A, B, a pick clip); the template does the bold side-by-sides and the
transitions between full-screen A and full-screen B. The real paper pieces Mercedes made (torn white paper, crumpled
paper stars, a sticky note) are the split edges, windows and labels, with a hand-drawn line around them.
Cuts: a diagonal torn-paper split (hook) that sweeps away to leave A; B opens through a real crumpled star that grows
until it fills the screen; a torn vertical split with the two clips staggered (both); the pick clip with the CTA on
torn paper. Editable text: DynaPuff (CapCut library). Footage: her soap clips, stand-in only.
Usage: python build/storyboard_04.py  ->  04-a-or-b/storyboard/
"""
import math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import engine as E
from props import cut_white

OUT = E.PACK / '04-a-or-b' / 'storyboard'; OUT.mkdir(parents=True, exist_ok=True)
SCR = OUT / '_frames'; SCR.mkdir(exist_ok=True)
SRC = E.PACK / 'assets' / 'props' / 'source' / 'physical'   # moved 2026-10-17
SOAP = Path('C:/Users/merce/OneDrive/Documents/Sudsy Day/Soap Photos')
W, H = 1080, 1920
INK, WHITE = (28, 26, 24), (255, 255, 255)
GOLD = (236, 184, 40)                               # from the crumpled gold star: the colour buyers change
HEAD = 'C:/Users/merce/AppData/Local/CapCut/User Data/Cache/AITextTemplate/Resource/13501609231124469651/DynaPuff-SemiBold.ttf'
A, B, PICK = ('IMG_6829', 7.5), ('IMG_6832', 0.2), ('IMG_6831', 0.3)

def F(px): return ImageFont.truetype(HEAD, px)

def footage(clip, size=(W, H)):
    name, t = clip; p = SCR / f'{name}-{t}.png'
    if not p.exists():
        subprocess.run([E.FFMPEG, '-v', 'error', '-y', '-ss', str(t), '-i', str(SOAP / f'{name}.MP4'), '-frames:v', '1',
                        '-vf', f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}', str(p)], check=True)
    return ImageOps.fit(Image.open(p).convert('RGBA'), size)

# ---- her paper pieces -----------------------------------------------------------------------------------------------
def load(name, tol=26):
    im = Image.open(SRC / name)
    return cut_white(im, tol=tol) if im.mode != 'RGBA' else im.crop(im.getbbox())

STAR_GOLD = load('Crumpled Golden Paper Star-2.png')
STAR_CREAM = load('Crumpled Paper Star on White-3.png')
STAR_YELLOW = load('Crumpled Yellow Paper Star-1.png')
NOTE = load('Blank Yellow Sticky Note on White.png')
TORN = load('Torn White Paper on White Background.png', tol=5)

def outline(item, gap=10, width=6, seed=1):
    """A hand-drawn line around a real paper piece: its outline grown a little, wobbled, drawn in ink."""
    a = item.split()[3].point(lambda v: 255 if v > 100 else 0)
    pad = gap + width + 8; big = Image.new('L', (a.width + 2 * pad, a.height + 2 * pad), 0); big.paste(a, (pad, pad))
    grown = big.filter(ImageFilter.MaxFilter(2 * (gap // 2) + 1)).filter(ImageFilter.MaxFilter(2 * (gap - gap // 2) + 1))
    edge = ImageChops.subtract(grown, grown.filter(ImageFilter.MinFilter(width if width % 2 else width + 1)))
    r = C.rng(seed); dx, dy = r.randint(-5, 5), r.randint(-5, 5)          # off-register, like a quick pen line
    out = Image.new('RGBA', big.size, (0, 0, 0, 0))
    ink = Image.new('RGBA', big.size, INK + (255,)); ink.putalpha(ImageChops.offset(edge, dx, dy))
    out.alpha_composite(ink); out.alpha_composite(Image.new('RGBA', big.size, (0, 0, 0, 0)))
    body = Image.new('RGBA', big.size, (0, 0, 0, 0)); body.paste(item, (pad, pad)); out.alpha_composite(body)
    return out

def sized(item, w): return item.resize((w, int(item.height * w / item.width)), Image.LANCZOS)
def shadow(item, off=(8, 14), blur=14, alpha=95): return C.shadow(item, offset=off, blur=blur, alpha=alpha)

def place(img, item, c, rot=0):
    it = item.rotate(rot, expand=True, resample=Image.BICUBIC)
    img.alpha_composite(it, (int(c[0] - it.width / 2), int(c[1] - it.height / 2)))

def torn_strip(length, thick):
    """A long strip of her torn paper: the photo's torn top and bottom edges, the middle stretched to length."""
    t = TORN.resize((length, int(TORN.height * length / TORN.width)), Image.LANCZOS)
    return t.resize((length, thick), Image.LANCZOS)

def words(img, xy, text, px, rot=0, fill=WHITE, edge=INK, sw=None):
    sw = sw or max(6, px // 11); f = F(px)
    bb = [int(v) for v in ImageDraw.Draw(img).multiline_textbbox((0, 0), text, font=f, align='center', stroke_width=sw, spacing=4)]
    lay = Image.new('RGBA', (bb[2] - bb[0] + 60, bb[3] - bb[1] + 60), (0, 0, 0, 0)); o = (30 - bb[0], 30 - bb[1])
    ImageDraw.Draw(lay).multiline_text(o, text, font=f, fill=fill, align='center', stroke_width=sw, stroke_fill=edge, spacing=4)
    place(img, shadow(lay, (5, 9), 6, 90), xy, rot)

def note(img, xy, line1, line2, rot):
    """Her sticky note with the version's name (big) and one word (smaller), slapped on at an angle."""
    n = sized(NOTE, 420).copy(); d = ImageDraw.Draw(n)
    d.text((n.width / 2, n.height * 0.40), line1, font=F(78), fill=INK, anchor='mm')
    d.text((n.width / 2, n.height * 0.66), line2, font=F(54), fill=(150, 104, 10), anchor='mm')
    place(img, shadow(n, (8, 16), 16, 110), xy, rot)

FOCUS_Y = 0.36    # where the product sits in the stand-in clips (buyers are told to film it centred)

def fit_box(clip, box):
    """A clip filling a box, cropped around the product, so each side of a split shows its own product."""
    x0, y0, x1, y1 = [int(v) for v in box]; w, h = x1 - x0, y1 - y0
    return ImageOps.fit(footage(clip), (w, h), centering=(0.5, FOCUS_Y))

def shifted(clip, dy):
    """The full clip moved up or down (CapCut: the clip's position), so its product sits in its part of a split."""
    im = Image.new('RGBA', (W, H)); f = footage(clip).resize((int(W * 1.12), int(H * 1.12)))
    im.paste(f, (int((W - f.width) / 2), int((H - f.height) / 2 + dy))); return im

def split_diag(top, bottom, ang_deg=-24, cy=H / 2, dy_top=-300, dy_bottom=560):
    """Two clips split along a slanted line through (W/2, cy): top above it, bottom below, each moved into its half."""
    k = math.tan(math.radians(-ang_deg)); y0, y1 = cy - k * W / 2, cy + k * W / 2
    im = shifted(bottom, dy_bottom)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(0, 0), (W, 0), (W, y1), (0, y0)], fill=255)
    im.paste(shifted(top, dy_top), (0, 0), m); return im

def star_window(clip, item, w, c, rot=0):
    """A clip seen through a real crumpled paper star: the star's own shape, with its paper as a rim."""
    s = sized(item, w); a = s.split()[3].point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.MinFilter(int(w * 0.07) | 1))
    pic = footage(clip, (W, H)).crop((int(c[0] - s.width / 2), int(c[1] - s.height / 2), int(c[0] + s.width / 2), int(c[1] + s.height / 2))).resize(s.size)
    win = s.copy(); pic.putalpha(a); win.alpha_composite(pic)
    return outline(win, gap=12, width=7, seed=3)

# ---- the frames -----------------------------------------------------------------------------------------------------
def f1():
    """Hook: A and B face off on a steep diagonal; a long strip of torn paper is the dividing line, with the question
    on it in huge letters. A big gold star (hand outline) hangs half off the top corner."""
    im = split_diag(A, B, -24)
    strip = shadow(torn_strip(1700, 360), (0, 14), 18, 120); place(im, strip, (W / 2, H / 2), 24)
    words(im, (W / 2, H / 2 - 20), 'WHICH ONE\nWOULD YOU PICK?', 112, 24, fill=INK, edge=WHITE, sw=4)
    place(im, shadow(outline(sized(STAR_GOLD, 460), seed=5)), (960, 260), 14)
    return im

def f2():
    """The cut to A: the torn strip slides down to the corner, A takes the whole screen (B is pushed out under it)."""
    im = split_diag(A, B, -24, cy=H * 0.93, dy_top=0)
    place(im, shadow(torn_strip(1500, 300), (0, 14), 18, 120), (W / 2 + 60, H * 0.93 + 30), 24)
    place(im, shadow(outline(sized(STAR_GOLD, 360), seed=5)), (1010, 330), 34)
    return im

def f3():
    """A full screen: the sticky note slaps on with A's name; a crumpled cream star (outlined) sits half off the left."""
    im = footage(A)
    note(im, (330, 1330), '[NAME A]', 'one word', -7)
    place(im, shadow(outline(sized(STAR_CREAM, 380), seed=7)), (60, 420), -18)
    return im

def f4():
    """A to B: a real crumpled star lands on A, and B plays inside it; the star grows until B fills the screen."""
    im = footage(A)
    place(im, shadow(star_window(B, STAR_YELLOW, 1000, (W / 2, 900)), (12, 22), 24, 120), (W / 2, 900), -8)
    return im

def f5():
    """B full screen: a second sticky note lands over where the first was, turned the other way."""
    im = footage(B)
    note(im, (740, 1300), '[NAME B]', 'one word', 6)
    place(im, shadow(outline(sized(STAR_GOLD, 340), seed=9)), (130, 330), 20)
    return im

def f6():
    """Both: a torn vertical split, A on the left slid up, B on the right slid down (staggered); 'or' on a big cream
    star sitting on the tear."""
    im = Image.new('RGBA', (W, H)); im.paste(fit_box(B, (W * 0.4, 0, W, H)), (int(W * 0.4), 0))
    im.paste(ImageChops.offset(im, 0, 0), (0, 0)); left = Image.new('RGBA', (W, H)); left.paste(fit_box(A, (0, 0, W * 0.6, H)), (0, 0))
    left = ImageChops.offset(left, 0, -110); left.paste(fit_box(A, (0, 0, W * 0.6, H)).crop((0, 0, int(W * 0.6), 110)), (0, H - 110))
    m = Image.new('L', (W, H), 0); pts = [(0, 0), (W * 0.56, 0), (W * 0.44, H), (0, H)]
    ImageDraw.Draw(m).polygon(pts, fill=255); im.paste(left, (0, 0), m)
    place(im, shadow(torn_strip(2100, 150), (10, 0), 18, 120), (W / 2, H / 2), 86.4)
    place(im, shadow(outline(sized(STAR_CREAM, 400), seed=11)), (W / 2, 900), 8)
    words(im, (W / 2 + 4, 930), 'or', 150, 8, fill=INK, edge=WHITE, sw=4)
    return im

def f7():
    """CTA: the pick clip full screen; the comment line on a strip of torn paper; gold star at the top."""
    im = footage(PICK)
    place(im, shadow(torn_strip(1000, 340), (0, 14), 18, 120), (W / 2 - 20, 520), -4)
    words(im, (W / 2 - 20, 470), 'Comment', 110, -4, fill=INK, edge=WHITE, sw=4)
    words(im, (W / 2 - 20, 600), '"[KEYWORD]"', 96, -4, fill=GOLD, edge=INK)
    words(im, (W / 2 - 20, 780), "for the link", 64, -4)
    place(im, shadow(outline(sized(STAR_YELLOW, 300), seed=13)), (920, 300), 16)
    return im

def main():
    frames = [f1(), f2(), f3(), f4(), f5(), f6(), f7()]
    names = ['1 hook, diagonal face-off', '2 the tear slides away, A takes over', '3 A, name note', '4 B opens through a star',
             '5 B, name note', '6 both, torn split', '7 CTA']
    for old in OUT.glob('*.jpg'): old.unlink()
    for n, f in zip(names, frames): f.convert('RGB').save(OUT / f'{n}.jpg', quality=90)
    sheet = Image.new('RGB', (W * 7 + 120, H), 'white')
    for i, f in enumerate(frames): sheet.paste(f.convert('RGB'), (i * (W + 20), 0))
    sheet.resize((sheet.width // 3, sheet.height // 3)).save(OUT / 'storyboard-04.jpg', quality=90)
    print('saved', OUT)

if __name__ == '__main__':
    main()
