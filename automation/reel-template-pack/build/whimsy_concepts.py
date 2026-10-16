"""Two whimsical collage concepts for template 01, on Mercedes's test footage. Type: Imbue (style B1, her pick).

Usage: python build/whimsy_concepts.py  ->  01-one-product-three-ways/style-options/whimsy-concepts.jpg
"""
from PIL import Image, ImageDraw
from style_options import F, frame, glow, text_layer, centered, BUTTER, INK, OUT, W, H
import collage as C

CREAM = (250, 244, 230)

def shadow_text(img, fn, radius=18, strength=2):
    return glow(img, text_layer(fn), (0, 0, 0), radius, strength)

# ---- concept 1: scrapbook -------------------------------------------------------------------------------------------
def scrap_hook(img):
    strip = C.torn_strip((980, 230), BUTTER, seed=11)
    ImageDraw.Draw(strip).text((490 - ImageDraw.Draw(strip).textlength('One stick vacuum', font=F('imbue', 140)) / 2, 30),
                               'One stick vacuum', font=F('imbue', 140), fill=INK)
    img = C.place(img, C.shadow(strip, blur=12, alpha=70), (540, 470), 2)
    img = C.place(img, C.tape(200, 60, seed=12), (130, 360), -28)
    img = C.place(img, C.tape(200, 60, seed=13), (950, 580), -24)
    img = shadow_text(img, lambda d: centered(d, 610, '3 ways', F('imbue', 250), 'white'))
    img = C.place(img, C.sparkle(80, (255, 255, 255), 6), (900, 260))
    return img

def scrap_label(img_clip):
    bg = C.paper((W, H), CREAM, seed=21)
    pol = C.polaroid(img_clip, (700, 860), seed=22)
    d = ImageDraw.Draw(pol); f = F('hand', 96); t = 'the couch'
    d.text((350 - d.textlength(t, font=f) / 2, 860 - 140), t, font=f, fill=INK)
    bg = C.place(bg, C.shadow(pol, blur=18, alpha=80), (560, 1000), -4)
    bg = C.place(bg, C.tape(240, 70, seed=23), (560, 560), 3)
    ImageDraw.Draw(bg).text((80, 170), '2', font=F('imbue', 420), fill=INK)
    bg = C.place(bg, C.star(100, INK, 5, seed=24), (900, 1620))
    return bg

def scrap_cta(img):
    tag = C.price_tag((640, 320), BUTTER, seed=31)
    d = ImageDraw.Draw(tag)
    d.text((150, 50), 'Stick vacuum', font=F('imbue', 104), fill=INK)
    d.text((152, 210), 'Shop at the link in my bio', font=F('inter', 32), fill=INK)
    C.string(img, (330, 1010), (565, 1230), sag=40)
    img = C.place(img, C.shadow(tag, blur=12, alpha=80), (700, 1290), 6)
    img = C.place(img, C.star(80, (255, 255, 255), 5, seed=32), (180, 1660))
    return img

# ---- concept 2: graphic list ----------------------------------------------------------------------------------------
def list_hook(clips):
    bg = C.paper((W, H), CREAM, seed=41)
    d = ImageDraw.Draw(bg)
    centered(d, 300, 'One stick vacuum,', F('imbue', 150), INK)
    centered(d, 540, '3 ways', F('imbue', 300), INK)
    bg = C.place(bg, C.pen_loop((800, 440), INK, 8, seed=43), (540, 745), -4)
    names = ['FLOORS', 'COUCH', 'HANDHELD']
    for i, (clip, name) in enumerate(zip(clips, names)):
        cx = 190 + i * 350; cy = 1230
        bg = C.place(bg, C.shadow(C.round_photo(clip, 250, (255, 255, 255), 10), blur=10, alpha=70), (cx, cy), [-6, 4, -3][i])
        C.arched_text(bg, (cx, cy), 175, name, F('inter', 40), INK, start_deg=-155, spread=130)
    bg = C.place(bg, C.sparkle(70, INK, 5), (930, 250))
    return bg

def list_label(img):
    badge = C.paper((240, 240), BUTTER, seed=51)
    m = Image.new('L', (240, 240), 0); ImageDraw.Draw(m).ellipse((0, 0, 239, 239), fill=255); badge.putalpha(m)
    bd = ImageDraw.Draw(badge); f = F('imbue', 200)
    bd.text((120 - bd.textlength('2', font=f) / 2, 0), '2', font=f, fill=INK)
    img = C.place(img, C.shadow(badge, blur=10, alpha=80), (200, 1180), -8)
    img = shadow_text(img, lambda d: d.text((330, 1110), 'The couch', font=F('imbue', 150), fill='white'))
    return img

def list_cta(clip):
    bg = C.paper((W, H), BUTTER, seed=61)
    bg = C.place(bg, C.shadow(C.round_photo(clip, 380, (255, 255, 255), 12), blur=12, alpha=60), (540, 620), -4)
    d = ImageDraw.Draw(bg)
    centered(d, 900, 'Stick vacuum', F('imbue', 190), INK)
    centered(d, 1130, 'shop at the link in my bio', F('hand', 78), INK)
    bg = C.place(bg, C.arrow(170, INK, 6, 40, seed=62).rotate(-70, expand=True), (540, 1420))
    return bg

def main():
    get = lambda c, s: frame(c, s).copy()   # each concept draws on its own copy
    hook, couch, cta = get('IMG_1417', 0.6), get('IMG_1405', 4.0), get('IMG_1421', 19.0)
    floors, hand = get('IMG_1411', 17.0), get('IMG_1401', 4.5)
    rows = [('Concept 1: Scrapbook', [scrap_hook(hook.copy()), scrap_label(couch.copy()), scrap_cta(cta.copy())]),
            ('Concept 2: Graphic list', [list_hook([floors, couch, hand]), list_label(couch.copy()), list_cta(hook)])]
    out = Image.new('RGB', (W * 3 + 40, (H + 120) * 2), 'white'); d = ImageDraw.Draw(out)
    for i, (name, frames) in enumerate(rows):
        d.text((20, i * (H + 120) + 20), name, font=F('inter', 80), fill='black')
        for j, f in enumerate(frames):
            out.paste(f.convert('RGB'), (j * (W + 20), i * (H + 120) + 120))
    out.resize((out.width // 3, out.height // 3)).save(OUT / 'whimsy-concepts.jpg', quality=90)
    for p in OUT.glob('_*.png'):
        p.unlink()
    print('saved', OUT / 'whimsy-concepts.jpg')

if __name__ == '__main__':
    main()
