"""Starter-pack recipes (physical pack, 2026-10-17): #10 Three people to gift it to, #22 Put it to the test, #23 Every
option in 10 seconds. Each is a short recipe on build/collage_kit.py: full-frame video with accents, full-screen
words with no video, one collage moment, and the approved moves between them. Rough motion tests with stand-in
footage (her July clips); the CapCut build comes after her one round of notes.
Usage: python build/starter.py 10 [seconds ...]  ->  NN-.../preview/motion-test.mp4  (or a test sheet of those times)
"""
import math, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from collage_kit import *
import collage_kit as K

DIRS = {'10': '10-three-people-to-gift-it-to', '22': '22-put-it-to-the-test', '23': '23-every-option-in-10-seconds'}

# ======================================================================================================================
# 10 Three people to gift it to (12 s). World: the wrapping table: light oak, kraft paper, a kraft cube gift, a
# polka-dot gift, gift tags, jute twine; blush tissue used once. Lettering: Anton filled with the kraft paper photo.
# ======================================================================================================================
def setup_10():
    g = {'c': [Clip(n, t0) for n, t0 in (('IMG_1454', 1.0), ('IMG_1381', 1.0), ('IMG_1391', 1.0), ('IMG_1417', 0.5), ('IMG_1456', 1.0))]}
    kraft = raw('images', 'Partly unrolled kraft paper roll-14.png', (0.45, 0.55, 0.85, 0.8))
    g['oak'] = background('images', 'Light oak wood grain texture-2.png')
    g['oakt'] = still(raw('images', 'Light oak wood grain texture-2.png'), 'oak10'); g['kraftt'] = still(kraft, 'kraft10')
    g['tissue'] = still(raw('images', 'Blush Pink Tissue Paper Texture-9.png'), 'tissue10')
    g['hook_s'] = serif_line('gift this to', 96); g['hook'] = photo_letters('3 PEOPLE', 230, kraft, INK)
    g['nums'] = {n: photo_letters(n, 300, kraft, INK) for n in '123'}; g['big3'] = photo_letters('3', 760, kraft, INK)
    g['more'] = serif_line('and one more', 96); g['comment'] = photo_letters('COMMENT', 190, kraft, INK)
    g['cube'] = cutout('images', 'Kraft paper cube gift with twine-38.png', 360); g['polka'] = cutout('images', 'Pale blue polka-dot gift-40.png', 330)
    g['spool'] = cutout('images', 'Natural jute twine spool with loose curl-134.png', 260)
    g['tag'] = S.fitw(S.cut('images', 'Cream gift tag with string loop-42.png'), 300); g['blush'] = cutout('images', 'Blush pink gift tag with cream loop-44.png', 230)
    g['tag1'] = C.shadow(on_tag(g['tag'], '1', 150)); g['tagkw'] = C.shadow(on_tag(S.fitw(S.cut('images', 'Cream gift tag with string loop-42.png'), 360), '"[KEYWORD]"', 44))
    g['roll'] = cutout('images', 'Partly Unrolled Kraft Paper Roll-133.png', 2000)
    g['arrow'] = dd(ARROWS, 7, 170, WHITE); g['spark'] = dd(ICONS, 9, 110, WHITE)
    return g

def person(g, im, t, t0, t1, n, who, side):
    """A 'for your ...' beat: the clip full frame; the big number, the buyer's words, one gift accent."""
    hero(im, t, t0 + 0.05, g['nums'][n], (180 if side else 900, 380), out=t1 - 0.2)
    word(im, t, t0 + 0.3, (70, 1330), 'FOR YOUR', 90, WHITE, anchor='lm', out=t1 - 0.2)
    word(im, t, t0 + 0.45, (70, 1440), who, 70, WHITE, anchor='lm', out=t1 - 0.2)
    accents(im, t, [({'1': g['blush'], '2': g['polka'], '3': g['cube']}[n], (860 if side else 220, 900), 8 if side else -8, t0 + 0.35, t1 - 0.2)])

def frame_10(g, t):
    c = g['c']
    if t < 2.9:                                                   # gift-ready, full frame; "1" pops onto the tag; dive into it
        im = c[0].at(t)
        put(im, g['hook_s'], (540, 300), back_out(seg(t, 0.05, 0.3)) if t < 2.0 else 1 - ease(seg(t, 2.0, 2.2)))
        hero(im, t, 0.2, g['hook'], (540, 480), out=2.0)
        accents(im, t, [(g['cube'], (860, 1380), 6, 0.4, 2.9), (g['spool'], (180, 1520), -8, 0.55, 2.9)])
        tag = g['tag1'] if t >= 1.6 else C.shadow(g['tag']); sw = 7 * math.sin(t * 3)
        put(im, tag, (300, 1000), back_out(seg(t, 0.7, 1.0)), sw)
        if t >= 1.6: draw_on(im, g['arrow'], (520, 860), seg(t, 1.7, 2.0), 200)
        z = ease(seg(t, 2.2, 2.85)); return dive(im, (300, 1040), z, c[1].at(t - 2.6), seg(t, 2.6, 2.9), 5.0)
    if t < 4.8:
        im = c[1].at(t - 2.6); person(g, im, t, 2.9, 4.8, '1', "[FRIEND WHO'S ALWAYS COLD]", True); return im
    if t < 5.6:                                                   # collage moment: the clip shrinks to a tile, tiles slide in, one flips to person two and swaps big
        im = g['oak'].copy(); L, RT, RB = (0, 0, 640, H), (640, 0, W, 900), (640, 900, W, H)
        tiles(im, t, [{'keys': [(4.8, (0, 0, W, H)), (5.05, L), (5.3, L), (5.55, RB)], 'fill': video(c[1], 2.6)},
                      {'keys': enter(RT, 4.85, dx=500), 'fill': g['tissue']},
                      {'keys': enter(RB, 4.9, dy=1000) + [(5.3, RB), (5.55, (0, 0, W, H))], 'fill': g['kraftt'], 'flip': (5.1, 0.2, video(c[2], 5.3))}])
        put(im, g['spool'], (640, 900), back_out(seg(t, 5.0, 5.25)) * (1 - ease(seg(t, 5.3, 5.5))), -10)
        return im
    if t < 7.6:
        im = c[2].at(t - 5.3); person(g, im, t, 5.6, 7.6, '2', '[MUM WHO HAS EVERYTHING]', False); return im
    if t < 8.6:                                                   # full-screen words: "and one more" / 3; a kraft roll sweeps across to person three
        im = word_card(g['oak'], t, 7.6, [(g['more'], (540, 520), 0.05), (g['big3'], (540, 1000), 0.2)])
        u = ease(seg(t, 8.15, 8.6))
        if u > 0:
            if u > 0.5: im = c[3].at(t - 8.4)
            sweep(im, g['roll'], u, 960, -8)
        return im
    if t < 10.1:
        im = c[3].at(t - 8.4); person(g, im, t, 8.6, 10.1, '3', '[DAD WHO LOVES COFFEE]', True); return im
    im = g['oak'].copy()                                           # CTA collage: gift wrap clip, oak + kraft tiles, three different gifts across the seam
    tiles(im, t, [{'keys': [(10.1, (0, 0, W, H)), (10.4, (0, 0, W, 1250))], 'fill': video(c[4], 10.1)},
                  {'keys': enter((0, 1250, 540, H), 10.15, dy=700), 'fill': g['kraftt']}, {'keys': enter((540, 1250, W, H), 10.2, dy=700), 'fill': g['tissue']}])
    for i, (k, xy, r) in enumerate((('cube', (200, 1260), -6), ('polka', (560, 1300), 8), ('spool', (900, 1270), 0))): pop(im, g[k], t, 10.4 + i * 0.1, xy, r, wiggle=2)
    hero(im, t, 10.5, g['comment'], (540, 330)); word(im, t, 10.8, (540, 520), '[GIFT WRAP AVAILABLE]', 70, WHITE)
    pop(im, g['tagkw'], t, 11.0, (540, 1060), -4, wiggle=3)
    return im

# ======================================================================================================================
# 23 Every option in 10 seconds (12 s). World: the paint counter: white pegboard, her real paint chips (the six-colour
# row, the fan deck), the oak display shelf. Eight options at 1 s each, full frame, each with its own chip and name;
# the changes alternate a giant real chip sweeping across and the fan deck opening as a wipe. Lettering: Anton filled
# with the chip row photo.
# ======================================================================================================================
def setup_23():
    names = ('IMG_1403', 'IMG_1404', 'IMG_1405', 'IMG_1406', 'IMG_1410', 'IMG_1417', 'IMG_1422', 'IMG_1424')
    g = {'c': [Clip(n, 1.0, 3.0) for n in names] + [Clip('IMG_1424', 2.0, 3.0)]}
    row = raw('images', 'Six-color paint chip row-77.png'); bb = row.convert('L').point(lambda v: 255 if v < 240 else 0).getbbox(); row = row.crop(bb)
    cw = row.width / 6; g['chips'] = [C.shadow(row.crop((int(i * cw + 6), 0, int((i + 1) * cw - 6), row.height)).convert('RGBA'), (6, 10), 8, 90) for i in range(6)]
    g['chip_big'] = [S.fitw(ch, 1300) for ch in g['chips']]; g['chip_s'] = [S.fitw(ch, 150) for ch in g['chips']]
    g['chips'] = [S.fitw(ch, 190) for ch in g['chips']]
    g['peg'] = background('images', 'White pegboard grid texture-5.png')
    g['fan'] = cutout('images', 'Muted Paint Chip Fan Deck-235.png', 980); g['shelf'] = cutout('images', 'Pale oak three-tier display shelf-74.png', 420)
    g['hook_s'] = serif_line('every [colour] in', 92); g['hook'] = photo_letters('10 SECONDS', 200, row, INK)
    g['comment'] = photo_letters('COMMENT', 180, row, INK)
    return g

def fan_wipe(old, new, u):
    """The fan deck opening from the bottom-left corner is the wipe."""
    if u <= 0: return old
    if u >= 1: return new
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).pieslice((-2300, H - 2300, 2300, H + 2300), -90, -90 + 90 * u, fill=255)
    out = old.copy(); out.paste(new, (0, 0), m); return out

def frame_23(g, t):
    c = g['c']; T0, D = 1.4, 1.0
    if t < T0:                                                    # full-screen words: the fan deck fans open on the pegboard
        im = g['peg'].copy(); k = ease(seg(t, 0, 0.6))
        put(im, g['fan'], (540, 1300), lerp(0.6, 1, k), lerp(-50, 0, k))
        pop(im, g['hook_s'], t, 0.1, (540, 470)); hero(im, t, 0.3, g['hook'], (540, 680))
        u = ease(seg(t, 1.1, 1.4)); return fan_wipe(im, c[0].at(0), u)
    if t < T0 + 8 * D:                                            # eight options, one second each, full frame + accents
        i = int((t - T0) / D); tt = t - T0 - i * D; im = c[i].at(tt)
        accents(im, t, [(g['chips'][i % 6], (120, 1160), -6, T0 + i * D + 0.05, T0 + (i + 1) * D)])
        word(im, t, T0 + i * D + 0.08, (220, 1180), f'[OPTION {i + 1}]', 96, WHITE, anchor='lm')
        word(im, t, T0 + i * D + 0.08, (900, 330), f'{i + 1}/8', 80, WHITE)
        if i < 7 and tt > D - 0.28:                               # the change to the next option
            u = ease(seg(tt, D - 0.28, D)); nxt = c[i + 1].at(0)
            if i % 2 == 0:
                if u > 0.5: im = nxt
                sweep(im, g['chip_big'][(i + 1) % 6], u, 960, -12)
            else: im = fan_wipe(im, nxt, u)
        return im
    im = g['peg'].copy(); bx = grid(8, 2, 0, 1500, 6)             # CTA collage: all eight together, tiles flying in
    tiles(im, t, [{'keys': enter(b, T0 + 8 * D + j * 0.05, dx=(-700 if j % 2 == 0 else 700)), 'fill': video(c[j], T0 + 8 * D)} for j, b in enumerate(bx)])
    for j, (xy, r) in enumerate((((540, 375), -8), ((540, 1125), 10), ((300, 1560), -4))): pop(im, g['chip_s'][j * 2], t, 9.8 + j * 0.1, xy, r)
    put(im, g['shelf'], (880, 1700), back_out(seg(t, 9.9, 10.2)), 0)
    hero(im, t, 10.1, g['comment'], (540, 760)); word(im, t, 10.4, (540, 950), '"[KEYWORD]"', 110, WHITE)
    word(im, t, 10.6, (450, 1420), 'ALL [8] AT [SHOP]', 80, INK, shadow=False)
    return im

# ======================================================================================================================
# 22 Put it to the test (12 s). World: the lab: water splash on black, a silver stopwatch, glass test tubes, a beaker,
# blue crumpled tissue. The test plays in ONE uncut take (pack rule) with the stopwatch running beside it.
# Lettering: Anton filled with the blue crumpled tissue.
# ======================================================================================================================
def setup_22():
    g = {'c': [Clip('IMG_1430', 1.0), Clip('IMG_1460', 0.0, 6.0), Clip('IMG_1463', 1.0), Clip('IMG_1431', 1.0)]}
    blue = raw('images', 'Crumpled pale blue tissue texture-8.png'); splash = S.raw('images', 'Crystal Clear Splash on Black-132.png')
    g['black'] = ImageOps.fit(splash, (W + 600, H), Image.LANCZOS, centering=(0.5, 0.5)).convert('RGBA')
    g['splasht'] = still(splash, 'splash22'); g['bluet'] = still(blue, 'blue22')
    g['splash_big'] = S.fitw(splash.convert('RGBA'), 2600)
    sw = S.cut('images', 'Vintage Silver Mechanical Stopwatch-233.png'); g['watch'] = sw
    g['tubes'] = cutout('images', 'Three empty test tubes in wooden rack-125.png', 380); g['beaker'] = cutout('images', 'Clear glass laboratory beaker-126.png', 300)
    g['lets'] = serif_line("let's", 120, CREAM, INK); g['test'] = photo_letters('TEST IT', 300, blue, INK)
    g['andthe'] = serif_line('and the', 120, CREAM, INK); g['result'] = photo_letters('RESULT', 300, blue, INK)
    g['hook_s'] = serif_line('does it really', 96); g['comment'] = photo_letters('COMMENT', 190, blue, INK)
    g['tick'] = dd('Hand-drawn checks, Xs, and tick boxes-8.png', 0, 380, WHITE); g['arrow'] = dd(ARROWS, 9, 170, WHITE)
    return g

def watch(g, img, t, c, w, running_from=None, stop_at=None):
    """The real stopwatch (nothing drawn on it); while it runs it gives a little tick-bounce every second."""
    running = running_from is not None and running_from <= t < (stop_at or 1e9)
    k = 1 + (0.06 * (1 - ((t - running_from) % 1) / 0.15) if running and ((t - running_from) % 1) < 0.15 else 0)
    put(img, C.shadow(S.fitw(g['watch'], w), (8, 12), 10, 100), c, k)

def frame_22(g, t):
    c = g['c']
    if t < 2.0:                                                   # the setup, full frame + accents; the hook
        im = c[0].at(t)
        put(im, g['hook_s'], (540, 300), back_out(seg(t, 0.05, 0.3)) * (1 - ease(seg(t, 1.8, 2.0))))
        word(im, t, 0.25, (540, 480), '[STAY DRY]?', 190, WHITE, out=1.8)
        watch(g, im, t, (880, 1060), 300); accents(im, t, [(g['tubes'], (220, 1560), -6, 0.5, 2.0)])
        return im
    if t < 3.0:                                                   # full-screen words: LET'S TEST IT over the splash; the splash sweeps to the test
        im = Image.new('RGBA', (W, H)); im.alpha_composite(g['black'], (int(-300 - 120 * (t - 2.0)), 0))
        im = word_card(im, t, 2.0, [(g['lets'], (540, 640), 0.05), (g['test'], (540, 900), 0.15)])
        u = ease(seg(t, 2.7, 3.0))
        if u > 0:
            if u > 0.5: im = c[1].at(0)
            sweep(im, g['splash_big'], u, 960, 0)
        return im
    if t < 8.3:                                                   # the test: one uncut take, the stopwatch running beside it
        im = c[1].at(t - 3.0)
        watch(g, im, t, (880, 1060), 300, running_from=3.0)
        word(im, t, 3.05, (540, 330), '[THE CLAIM]', 120, WHITE)
        secs = int(t - 3.0); word(im, t, 3.05, (70, 1390), f'00:0{secs}', 140, WHITE, anchor='lm')
        draw_on(im, g['arrow'], (640, 1180), seg(t, 4.0, 4.4), -20)
        return im
    if t < 9.3:                                                   # full-screen words: and the RESULT; the stopwatch hand sweeps it away
        im = Image.new('RGBA', (W, H)); im.alpha_composite(g['black'], (int(-300 - 120 * (t - 2.0)), 0))
        im = word_card(im, t, 8.3, [(g['andthe'], (540, 640), 0.05), (g['result'], (540, 900), 0.15)])
        return radial(im, c[2].at(t - 9.0), ease(seg(t, 9.0, 9.3)))
    if t < 10.4:                                                  # the result, full frame + accents: a big tick, the stopwatch stopped
        im = c[2].at(t - 9.0); draw_on(im, g['tick'], (820, 640), seg(t, 9.4, 9.8), -6)
        watch(g, im, t, (880, 1060), 300, running_from=3.0, stop_at=8.3)
        word(im, t, 9.45, (70, 1390), '[WHAT HAPPENED]', 110, WHITE, anchor='lm')
        return im
    im = Image.new('RGBA', (W, H), (12, 12, 14, 255))             # CTA collage: the product in use, splash + blue tiles, three lab pieces across the seam
    tiles(im, t, [{'keys': [(10.4, (0, 0, W, H)), (10.7, (0, 0, W, 1250))], 'fill': video(c[3], 10.4)},
                  {'keys': enter((0, 1250, 540, H), 10.45, dy=700), 'fill': g['splasht']}, {'keys': enter((540, 1250, W, H), 10.5, dy=700), 'fill': g['bluet']}])
    pop(im, g['tubes'], t, 10.7, (230, 1250), -6, wiggle=2); pop(im, g['beaker'], t, 10.8, (800, 1300), 6, wiggle=2)
    watch(g, im, t, (540, 1330), 260, running_from=3.0, stop_at=8.3)
    hero(im, t, 10.8, g['comment'], (540, 330)); word(im, t, 11.1, (540, 520), '"[KEYWORD]"', 120, WHITE)
    return im

SETUP = {'10': setup_10, '22': setup_22, '23': setup_23}; FRAME = {'10': frame_10, '22': frame_22, '23': frame_23}; SECS = {'10': 12.0, '22': 12.0, '23': 12.0}

def main():
    tid = sys.argv[1]; g = SETUP[tid](); fr = lambda t: FRAME[tid](g, t)
    out = S.E.PACK / DIRS[tid] / 'preview'
    if len(sys.argv) > 2:
        ims = [fr(float(x)).convert('RGB') for x in sys.argv[2:]]
        sheet = Image.new('RGB', (len(ims) * 360, 640), 'white')
        for i, im in enumerate(ims): sheet.paste(im.resize((360, 640)), (i * 360, 0))
        out.mkdir(parents=True, exist_ok=True); sheet.save(out / '_test.jpg', quality=85); print('test', out / '_test.jpg')
    else:
        render(tid, fr, SECS[tid], out)

if __name__ == '__main__':
    main()
