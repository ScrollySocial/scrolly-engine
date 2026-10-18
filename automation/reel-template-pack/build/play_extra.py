"""Extra helpers for the second physical batch (#04, #05, #06, #07, #13), built next to play.py without changing it
(play.py belongs to the main physical chat). Same rules: real objects always styled (play.thing), readable words on
pills or thick-edged lettering, one accent per template that buyers change.

- slice_v / slice_h: the two-tone strip slice (her pick from the board), in any two tones, vertical or horizontal
- interleave: two clips cut into strips that alternate, then sort themselves into a clean half-and-half split
- poll(): a real-looking Instagram story poll sticker (A | B) whose bars fill in
- strip_sheet(): the 1 fps check strip with Instagram's no-text zones drawn on, for the checklist before sending
"""
import math, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import collage as C
import storyboard_b2 as S
import play as P
from motion_b2 import ease, seg, lerp, clamp, W, H, WHITE

def tint(im, col, k):
    return Image.blend(im.convert('RGBA'), Image.new('RGBA', im.size, col + (255,)), k)

def slice_h(old, new, u, tones, n=8):
    """Old scene cut into horizontal strips tinted in two tones, sliding apart left/right to reveal the new one."""
    if u <= 0: return old
    if u >= 1: return new
    out = new.copy(); sh = H / n
    for i in range(n):
        y0, y1 = int(i * sh), int((i + 1) * sh); s = tint(old.crop((0, y0, W, y1)), tones[i % 2], 0.3 + 0.35 * u)
        out.alpha_composite(s, (int((1 if i % 2 == 0 else -1) * ease(u) * (W + 80)), y0))
    return out

def slice_v(old, new, u, tones, n=6):
    """The same in vertical strips sliding up/down."""
    if u <= 0: return old
    if u >= 1: return new
    out = new.copy(); sw = W / n
    for i in range(n):
        x0, x1 = int(i * sw), int((i + 1) * sw); s = tint(old.crop((x0, 0, x1, H)), tones[i % 2], 0.3 + 0.35 * u)
        out.alpha_composite(s, (x0, int((1 if i % 2 == 0 else -1) * ease(u) * (H + 80))))
    return out

def interleave(a, b, u, n=8, gap=10, line=WHITE):
    """A and B in alternating vertical strips (u=0), sorting into A on the left and B on the right (u=1)."""
    out = Image.new('RGBA', (W, H), line + (255,)); sw = W / n; half = n // 2
    for i in range(n):
        src = a if i % 2 == 0 else b; k = i // 2; dest = k if i % 2 == 0 else half + k
        x_from, x_to = i * sw, dest * sw; x = lerp(x_from, x_to, ease(u))
        cx0 = int(dest * sw)                        # each strip shows the part of its clip it will sit over at the end
        st = src.crop((cx0, 0, int(cx0 + sw), H)); st = st.crop((gap // 2, 0, st.width - gap // 2, H))
        out.alpha_composite(st, (int(x + gap // 2), 0))
    return out

def poll(a='A', b='B', pa=0.5, w=720, show=1.0, question=None):
    """An Instagram-style story poll sticker: white rounded card, the two options, bars filling to pa / 1-pa."""
    h = int(w * 0.42) + (int(w * 0.16) if question else 0); im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, h - 1), 40, fill=(255, 255, 255, 250)); y0 = 0
    if question:
        y0 = int(w * 0.16); d.text((w / 2, y0 * 0.62), question, font=S.F(P.MONT, int(w * 0.06)), fill=(28, 27, 26), anchor='mm')
    bx0, bx1 = 40, w - 40; rows = ((a, pa), (b, 1 - pa)); rh = (h - y0 - 60) / 2
    for k, (lab, p) in enumerate(rows):
        ry = y0 + 30 + k * rh; d.rounded_rectangle((bx0, ry + 8, bx1, ry + rh - 8), int(rh / 2), fill=(238, 236, 232))
        fw = (bx1 - bx0) * p * show
        if fw > rh: d.rounded_rectangle((bx0, ry + 8, bx0 + fw, ry + rh - 8), int(rh / 2), fill=(206, 214, 238) if k == 0 else (240, 210, 200))
        f = S.F(P.MONT, int(rh * 0.42)); d.text((bx0 + 36, ry + rh / 2), lab, font=f, fill=(28, 27, 26), anchor='lm')
        if show > 0.05: d.text((bx1 - 36, ry + rh / 2), f'{int(round(p * show * 100))}%', font=f, fill=(28, 27, 26), anchor='rm')
    return C.shadow(im, (4, 12), 16, 110)

def clip_card(clip_im, w, h, border=14, rot=0, r=0):
    """A clip as a white-bordered photo card (rounded if r)."""
    c = Image.new('RGBA', (w + 2 * border, h + 2 * border), (0, 0, 0, 0)); ImageDraw.Draw(c).rounded_rectangle((0, 0, c.width - 1, c.height - 1), r + border if r else 2, fill=WHITE + (255,))
    v = ImageOps.fit(clip_im, (w, h)).convert('RGBA')
    if r: m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255); v.putalpha(m)
    c.alpha_composite(v, (border, border)); c = C.shadow(c, (8, 14), 14, 110)
    return c.rotate(rot, expand=True, resample=Image.BICUBIC) if rot else c

PACK = Path(__file__).resolve().parent.parent; FF = str(PACK.parent / 'hyperframes-test' / 'bin' / 'ffmpeg.exe')

def strip_sheet(folder, secs=14, tw=180):
    """1 fps strip of NN-.../preview/motion-test.mp4 with the no-text zones shaded (top 220, bottom 420, right 150 of
    the lower half), saved as preview/strip.jpg for the checklist."""
    mp4 = PACK / folder / 'preview' / 'motion-test.mp4'; th = int(tw * 16 / 9); tmp = mp4.with_suffix('.tmp.png')
    subprocess.run([FF, '-v', 'error', '-y', '-i', str(mp4), '-vf', f'fps=1,scale={tw}:{th},tile={secs}x1', '-frames:v', '1', str(tmp)], check=True)
    im = Image.open(tmp).convert('RGBA'); tmp.unlink(); k = tw / W; lay = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for i in range(secs):
        x = i * tw; d.rectangle((x, 0, x + tw, 220 * k), fill=(255, 0, 0, 22)); d.rectangle((x, th - 420 * k, x + tw, th), fill=(255, 0, 0, 22))
        d.rectangle((x + tw - 150 * k, th / 2, x + tw, th - 420 * k), fill=(255, 0, 0, 22))
    im.alpha_composite(lay); out = Image.new('RGB', (im.width, im.height + 26), 'white'); out.paste(im.convert('RGB'), (0, 26))
    f = ImageFont.truetype('arialbd.ttf', 18); dd = ImageDraw.Draw(out)
    for i in range(secs): dd.text((i * tw + 4, 4), f'{i}s', font=f, fill=(0, 0, 0))
    p = PACK / folder / 'preview' / 'strip.jpg'; out.save(p, quality=85); print(p); return p
