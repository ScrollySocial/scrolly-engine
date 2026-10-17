"""Proof of the box closing (2026-10-17): real photo pieces only. The open box's short flaps fold in, its long flaps
fold up, then the two halves of the closed-box photo fold down from each side until they meet at the seam.
Usage: python build/test_close.py  ->  02-pack-an-order/storyboard/test-close.mp4
"""
import subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import storyboard_02 as S
import engine as E

W, H, FPS = 1080, 1920, 30

def darken(im, k):
    a = im.split()[3]; out = im.convert('RGB').point(lambda v: int(v * k)).convert('RGBA'); out.putalpha(a); return out

def pieces():
    """The real-photo pieces of the box on screen (upright, flaps off the edges): body with the floor cut out, the four
    flaps, the two halves of the closed-box photo, and where they sit. Shared with templates/t02.py."""
    box, (xo, y0), fl = S.open_box('kraft')
    fx0, fy0, fx1, fy1 = fl
    wall_x = int((fx1 - fx0) * 0.08); wall_y = int((fy1 - fy0) * 0.05)
    bx0, by0, bx1, by1 = fx0 - wall_x, fy0 - wall_y, fx1 + wall_x, fy1 + wall_y          # the box body on screen
    full = Image.new('RGBA', (W, H), (0, 0, 0, 0)); full.alpha_composite(box, (xo, y0))
    def region(x0, y0_, x1, y1):
        x0, y0_, x1, y1 = max(0, x0), max(0, y0_), min(W, x1), min(H, y1)
        if x1 - x0 < 2 or y1 - y0_ < 2: return Image.new('RGBA', (1, 1), (0, 0, 0, 0))   # off-screen
        m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle((x0, y0_, x1, y1), fill=255)
        r = full.copy(); r.putalpha(Image.composite(full.split()[3], Image.new('L', (W, H), 0), m)); return r.crop((x0, y0_, x1, y1))
    body = region(bx0, by0, bx1, by1)                       # walls + floor area (floor becomes the video spot)
    top, bottom = region(bx0, 0, bx1, by0), region(bx0, by1, bx1, H)               # short flaps
    left, right = region(0, by0 - 40, bx0, by1 + 40), region(bx1, by0 - 40, W, by1 + 40)   # long flaps
    cs = S.prop('box-closed-seam').rotate(-90, expand=True)
    cs = cs.crop((int(cs.width * 0.02), int(cs.height * 0.01), int(cs.width * 0.98), int(cs.height * 0.99)))   # trim the pale edge
    closed = cs.resize((bx1 - bx0, by1 - by0))
    halfL, halfR = closed.crop((0, 0, closed.width // 2, closed.height)), closed.crop((closed.width // 2, 0, closed.width, closed.height))
    hole = Image.new('L', body.size, 255); ImageDraw.Draw(hole).rectangle((fx0 - bx0, fy0 - by0, fx1 - bx0, fy1 - by0), fill=0)
    body.putalpha(Image.composite(body.split()[3], Image.new('L', body.size, 0), hole))
    return dict(floor=fl, body_box=(bx0, by0, bx1, by1), body=body, top=top, bottom=bottom, left=left, right=right,
                halfL=halfL, halfR=halfR, closed=closed)

def main():
    P = pieces(); fx0, fy0, fx1, fy1 = P['floor']; bx0, by0, bx1, by1 = P['body_box']
    body, top, bottom, left, right, halfL, halfR = (P[k] for k in ('body', 'top', 'bottom', 'left', 'right', 'halfL', 'halfR'))
    video = S.footage('IMG_1447', 1.0, (W, H))

    def frame(short_f, long_f, close_f, zoom=1.0):
        """short_f / long_f: 1 = flap lying open, 0 = folded away. close_f: 0 = closed halves not down, 1 = flat."""
        im = Image.new('RGBA', (W, H), S.BG)
        im.alpha_composite(ImageOps.fit(video, (fx1 - fx0, fy1 - fy0)), (fx0, fy0))
        im.alpha_composite(body, (bx0, by0))
        if short_f > 0.02:
            t = darken(top.resize((top.width, max(1, int(top.height * short_f)))), 0.7 + 0.3 * short_f); im.alpha_composite(t, (bx0, by0 - t.height))
            b = darken(bottom.resize((bottom.width, max(1, int(bottom.height * short_f)))), 0.7 + 0.3 * short_f); im.alpha_composite(b, (bx0, by1))
        if long_f > 0.02 and left.width > 1:
            l = darken(left.resize((max(1, int(left.width * long_f)), left.height)), 0.7 + 0.3 * long_f); im.alpha_composite(l, (max(0, bx0 - l.width), max(0, by0 - 40)))
            if right.width > 1:
                r = darken(right.resize((max(1, int(right.width * long_f)), right.height)), 0.7 + 0.3 * long_f); im.alpha_composite(r, (bx1, by0 - 40))
        if close_f > 0.02:
            w = max(1, int(halfL.width * close_f)); k = 0.72 + 0.28 * close_f
            im.alpha_composite(darken(halfL.resize((w, halfL.height)), k), (bx0, by0))
            im.alpha_composite(darken(halfR.resize((w, halfR.height)), k), (bx1 - w, by0))
        if zoom > 1.001:   # push in on the box's centre so the closed box fills the frame
            cx, cy = (bx0 + bx1) / 2, (by0 + by1) / 2
            zw, zh = W / zoom, H / zoom
            im = im.crop((int(cx - zw / 2), int(cy - zh / 2), int(cx + zw / 2), int(cy + zh / 2))).resize((W, H), Image.LANCZOS)
        return im.convert('RGB')

    ease = lambda x: x * x * (3 - 2 * x)
    seq = [frame(1, 1, 0)] * 9
    seq += [frame(1 - ease(i / 6), 1, 0) for i in range(1, 7)]        # short flaps fold in
    seq += [frame(0, 1 - ease(i / 6), 0) for i in range(1, 7)]        # long flaps fold up
    full_zoom = max(W / (bx1 - bx0), H / (by1 - by0)) * 1.02
    seq += [frame(0, 0, ease(i / 8), 1 + (full_zoom - 1) * ease(i / 8) * 0.4) for i in range(1, 9)]   # halves meet
    seq += [frame(0, 0, 1, 1 + (full_zoom - 1) * (0.4 + 0.6 * ease(i / 8))) for i in range(1, 9)]       # push in to fill
    seq += [frame(0, 0, 1, full_zoom)] * 10
    out = S.OUT / 'test-close.mp4'
    p = subprocess.Popen([E.FFMPEG, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(out)], stdin=subprocess.PIPE)
    for f in seq: p.stdin.write(f.tobytes())
    p.stdin.close(); p.wait(); print('saved', out)
    strip = Image.new('RGB', (W * 5, H)); picks = [0, 12, 18, 25, 40]
    for i, k in enumerate(picks): strip.paste(seq[k], (W * i, 0))
    strip.resize((W, H // 5)).save(S.OUT / '_frames' / 'close-strip.jpg')

if __name__ == '__main__':
    main()
