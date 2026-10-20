"""Matching carousels for the Reel templates: one recipe per template, each in its Reel's own world (stage, palette,
objects with play, DM Serif words, her doodles), telling the Reel's story as slides. Parts: carousel_kit.py.
Rules (FRAMEWORK "Matching carousels"): slides 1 AND 2 are covers (slide 2 a second hook in a new format: hook top
right-aligned, swipe-pull bottom left-aligned); content from slide 3, never like the cover, varied layouts; serif
accent words on the cover + at most two other slides; left-aligned lines; the last slide is the Comment [KEYWORD] CTA,
with a caption to start from in its notes.
Usage: python build/carousels.py 09 08 ...  ->  NN-.../carousel/ (slides/, contact-sheet.jpg, as-the-buyer-opens-it.jpg, .pptx)
"""
import math, sys
from pathlib import Path
from PIL import Image, ImageFont, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parent))
import carousel_kit as K
from carousel_kit import art, photo, text, guide, word, at, CW, CH, WINE, PINK, BUTTER, BLUE, WHITE, INK, CAPTION, FIRST_GUIDE
import play as P
import storyboard_b2 as S
import story7 as S7
from carousel_kit import doodle, vec
from motion_b2 import Clip

DIRS = {'01': '01-one-product-three-ways', '02': '02-pack-an-order', '03': '03-before-and-after', '04': '04-a-or-b', '05': '05-details',
        '06': '06-start-to-finish', '07': '07-how-big-is-it', '13': '13-how-to-use-it', '09': '09-who-its-for', '08': '08-a-real-customer-question', '10': '10-three-people-to-gift-it-to', '12': '12-your-order-just-arrived',
        '20': '20-what-buyers-said', '22': '22-put-it-to-the-test', '23': '23-every-option-in-10-seconds',
        'h2': 'halloween/h2-batty-about', 'h3': 'halloween/h3-caught-in-our-web', 'h5': 'halloween/h5-trick-or-treat', 'h6': 'halloween/h6-once-in-a-blood-moon'}
TITLES = {'01': 'One product three ways', '02': 'Pack an order with me', '03': 'Before and after', '04': 'A or B', '05': 'Details',
          '06': 'Start to finish', '07': 'How big is it really', '13': 'How to use it in 3 steps', '09': 'Who its for', '08': 'A real customer question', '10': 'Three people to gift it to', '12': 'Your order just arrived',
          '20': 'What buyers said', '22': 'Put it to the test', '23': 'Every option in 10 seconds',
          'h2': "Things I'm batty about", 'h3': 'Caught in our web', 'h5': 'Trick or treat', 'h6': 'Once in a blood moon'}
HOOK2 = 'Second hook: Instagram often shows a carousel starting on slide 2, so this one works as a cover on its own. '
REPLACE = 'Photo: click it, then Replace.'

def S2(sl, bg, note, layers): sl.append(dict(bg=bg, note=note, layers=layers))

# ======================================================================================================================
# 09 Who it's for (ruled notebook paper; wine + pink; butterflies, the alarm clock, paper balls, sticky notes)
# ======================================================================================================================
def c09():
    me, me2, prob, prod = Clip('IMG_1469', 1.0, 6.0), Clip('IMG_1470', 1.0, 6.0), Clip('IMG_1430', 1.0, 6.0), Clip('IMG_1381', 1.0, 6.0)
    paper = K.fit_bg(S.raw('physical', 'Blank Ruled Notebook Paper.png'))
    bf = [K.thing(P.BUTTERFLIES[i % 3], 230, ('stripes', 'dots', 'smalldots')[i % 3], (WINE, PINK, WINE)[i % 3], scale=0.3, strength=0.75, seed=i, edge=6) for i in range(6)]
    small_bf = [K.thing(P.BUTTERFLIES[i % 3], 166, ('stripes', 'dots', 'smalldots')[i % 3], (WINE, PINK, WINE)[i % 3], scale=0.3, strength=0.75, seed=i, edge=6) for i in range(6)]
    balls = [K.thing('Crumpled cream paper ball-58.png', 170 + 20 * (i % 3), ('stripes', 'dots', 'smalldots')[i % 3], (PINK, WINE, PINK)[i % 3], scale=0.3, strength=0.6, seed=i, edge=6) for i in range(5)]
    clock = K.thing('Classic Cream Twin-Bell Alarm Clock-185.png', 560, 'stripes', PINK, scale=0.5, strength=0.85)
    gift = K.thing('Kraft paper cube gift with twine-38.png', 270, 'dots', WINE, scale=0.4)
    mug = K.thing('Warm white ceramic coffee mug-140.png', 250, 'dots', PINK, scale=0.4, strength=0.85)
    notes = [P.sticky('', 400, pin=pn) for pn in ('pin-head-black', 'pin-head-cream', 'pin-head-white')]
    ph, scr = K.device_art(400)
    s = []
    S2(s, paper, "Hook. Swap in a photo of you (head near the top, under the butterfly). Edit the [bracket] line to your buyer's habit.", [
        art(K.torn_card((800, 980), 3), (540, 820), -2, 'torn paper'),
        photo('You (head near the top)', (540, 820), (800, 980), -2, me.at(0.3, (800, 980))),
        art(bf[0], (650, 330), -18, 'butterfly'),
        text('if you\n[always run late]', 62, (330, 165), 3),
        art(word('this is', 140, italic_last=False), (400, 1100), -3, 'this is'),
        art(word('for you', 196), (600, 1245), -3, 'for you'),
        art(doodle('icon', 8, 120, WINE), (1005, 1120), 0, 'sparkle'), art(doodle('icon', 10, 90, WINE), (85, 960), 0, 'sparkle'),
        guide(FIRST_GUIDE)])
    ring = [(540 + 390 * math.cos(a), 850 + 400 * math.sin(a)) for a in [math.radians(200 + i * 72) for i in range(5)]]
    S2(s, paper, HOOK2 + 'No photo needed. Edit both [bracket] lines.', [
        art(doodle('burst', 3, 860, WINE), (540, 850), 0, 'burst'),
        art(clock, (540, 850), 6, 'alarm clock')] + [art(b, c, i * 25, 'paper ball') for i, (b, c) in enumerate(zip(balls, ring))] + [
        text('[always running\nlate?]', 92, (600, 190), -2, align='right'),
        text("[here's what helps]", 62, (380, 1320), -2, align='left'),
        art(doodle('arrow', 0, 170, WINE), (800, 1315), -2, 'arrow')])
    S2(s, paper, 'Swap in a photo of the everyday problem. Tip: set it to black and white (Edit photo > Filters).', [
        art(K.torn_card((760, 900), 5), (540, 860), -2, 'torn paper'),
        photo('The everyday problem', (540, 860), (760, 900), -2, prob.at(0.5, (760, 900)), gray=True),
        art(balls[1], (190, 1260), 20, 'paper ball'), art(balls[3], (900, 470), -15, 'paper ball'),
        text('[you lose your\nkeys. again.]', 72, (420, 250), 3, align='left'),
        guide(REPLACE + ' Filters > B&W')])
    S2(s, paper, 'Swap in your product photo and type its name.', [
        photo('Your product (fills the page)', (540, 720), (CW, CH), 0, prod.at(0.5, (CW, CH))),
        art(K.torn_strip(paper, 500, 7), (540, 250), 0, 'torn notebook strip'),
        art(word('meet', 200, PINK), (540, 175), 0, 'meet'),
        text('[PRODUCT NAME]', 76, (540, 350), -2, box=WINE, fg=WHITE),
        art(doodle('arrow', 9, 200, WINE), (170, 600), 0, 'arrow'),
        art(bf[1], (900, 500), 20, 'butterfly')])
    sa, sc = K.string((520, 905), (560, 1440)); ga, gc = K.string((850, 1110), (600, 1440), -30)
    S2(s, paper, 'A second product photo (or the same one). Edit the line to what it fixes, in your words.', [
        art(sa, sc, 0, 'string'), art(ga, gc, 0, 'string'),
        art(K.round_card(560), (520, 620), 0, 'round paper'),
        photo('Your product, close up', (520, 620), (560, 560), 0, prod.at(2.0, (560, 560)), shape='circle'),
        art(gift, (850, 980), 8, 'gift'),
        art(doodle('icon', 11, 150, WINE), (900, 330), 0, 'sparkle'), art(doodle('icon', 10, 90, WINE), (150, 300), 0, 'sparkle'),
        text('[what it fixes,\nin one line]', 58, (285, 1180), -3, align='left')])
    nxy = (((300, 380), -6), ((760, 700), 5), ((330, 1030), -3))
    S2(s, paper, "Who it's for: three kinds of buyer, one per note.", [
        art(mug, (820, 1180), 6, 'mug')] + [art(n, c, r, 'sticky note') for n, (c, r) in zip(notes, nxy)] + [
        K.note_text(c, r, t, align='left') for t, (c, r) in zip(('for the\n[6am crowd]', 'for the\n[dog mums]', 'for the\n[busy mums]'), nxy)])
    pc = (560, 790)
    S2(s, paper, 'Swap in a screenshot of your shop or listing for the phone screen. Edit the line.', [
        art(doodle('burst', 2, 900, PINK), pc, 0, 'burst'), art(ph, pc, 0, 'phone'),
        K.on_screen(pc, ph, scr, prod.at(3.0, (400, 800)), 'Your shop or listing (screenshot)'),
        art(small_bf[2], (pc[0] - 70, pc[1] - ph.height / 2 + 30), -10, 'butterfly'),
        text('[in my shop now]', 72, (540, 1300), -2)])
    crown = [(330 + i * 84, 360 - 38 * math.sin(math.pi * i / 5)) for i in range(6)]
    S2(s, paper, 'Swap in a second photo of you (head near the top, under the crown). Type your keyword. ' + CAPTION, [
        art(K.torn_card((860, 1000), 9), (540, 860), 2, 'torn paper'),
        photo('You again (head near the top)', (540, 860), (860, 1000), 2, me2.at(0.3, (860, 1000))),
        ] + [art(small_bf[i], c, (i - 2.5) * 10, 'butterfly') for i, c in enumerate(crown)] + [
        text('sound like you?', 66, (540, 1000), -2),
        art(word('Comment', 190), (540, 1140), 0, 'Comment'),
        text('"[KEYWORD]"', 74, (540, 1290), 2, box=WINE, fg=WHITE, pill=True),
        art(doodle('icon', 10, 80, WHITE), (930, 1080), 0, 'sparkle')])
    return s

# ======================================================================================================================
# 08 A real customer question (light-blue parchment; light blue + wine; the striped rotary phone, DM cards, a sticky note)
# ======================================================================================================================
def c08():
    g = S7.setup_08(); g['phone'] = K.thing('Dusty blue vintage rotary telephone-26.png', 660, 'stripes', S7.CRM, scale=0.45, strength=0.65); c = g['c']; stage = K.fit_bg(g['stage']); BL = BLUE; g['d_burst'] = vec(g['d_burst'], WINE)
    dm, dm_off, dm_px = K.blank_card(2, 640, WINE)
    dms = [K.blank_card(1, 560, WINE, pin=pn) for pn in ('pin-head-black', 'pin-head-white', 'pin-head-cream')]
    note = P.sticky('', 480, pin='pin-head-black'); phone_s = K.thing('Dusty blue vintage rotary telephone-26.png', 363, 'stripes', S7.CRM, scale=0.45, strength=0.65)
    s = []
    S2(s, stage, 'Hook. Swap in a photo of your product. Type the question a customer asked you.', [
        photo('Your product (fills the page)', (540, 720), (CW, CH), 0, c['ans1'].at(2.0, (CW, CH))),
        art(word('you asked', 170), (540, 820), -2, 'you asked'),
        art(dm, (540, 1080), -4, 'DM card'),
        text('[the question your\ncustomer asked]', dm_px + 6, at((540, 1080), -4, dm_off), -4, box=None, fg=WHITE, align='left'),
        guide(FIRST_GUIDE)])
    S2(s, stage, HOOK2 + 'No photo needed. Edit both [bracket] lines.', [
        art(g['d_burst'], (540, 900), 0, 'burst'), art(g['phone'], (540, 940), -4, 'rotary phone'),
        text('[can I wash it?]', 96, (620, 230), -2, align='right'),
        text("[here's the answer]", 62, (370, 1320), -2, align='left'),
        art(doodle('arrow', 0, 170, WINE), (800, 1315), -2, 'arrow')])
    S2(s, stage, 'Swap in a photo that shows the answer. Edit the line.', [
        art(K.white_card((760, 820)), (540, 840), 2, 'photo border'),
        photo('The answer (photo)', (540, 840), (760, 820), 2, c['ans1'].at(4.0, (760, 820))),
        art(word('the answer', 170), (540, 250), -2, 'the answer'),
        text('[in one line]', 76, (330, 1330), -2, box=BL, align='left')])
    nc = (330, 640)
    S2(s, stage, 'The answer on a note, a photo pinned beside it. Edit the note.', [
        art(note, nc, -5, 'sticky note'), K.note_text(nc, -5, '[yes! wash\nit at 30°]', 58, align='left'),
        art(K.white_card((420, 540), 14), (750, 1060), 6, 'photo border'),
        photo('The answer, close up', (750, 1060), (420, 540), 6, c['ans1'].at(1.0, (420, 540))),
        art(doodle('arrow', 2, 220, WINE), (560, 900), 30, 'arrow')])
    top = K.torn_strip(stage, 640, 4, 't')
    S2(s, stage, 'A second answer photo, then the second line of your answer.', [
        photo('Answer part 2 (top half)', (540, 430), (CW, 860), 0, c['ans2'].at(1.0, (CW, 860))),
        art(top, (540, CH - 640 / 2 + 6), 0, 'torn stage'),
        text('[the answer,\nline two]', 80, (380, 1150), -2, align='left')])
    S2(s, stage, 'More questions you get. One per card.', [
        text('you all asked:', 70, (380, 240), -2, align='left')] + [
        x for i, (xy, r) in enumerate((((500, 560), 4), ((600, 830), -5), ((500, 1100), 3))) for x in (
            art(dms[i][0], xy, r, 'DM card'), text(('[another question]', '[and another]', '[one more]')[i], dms[i][2] + 6, at(xy, r, dms[i][1]), r, box=None, fg=WHITE, align='left'))] + [
        art(phone_s, (880, 1330), 8, 'rotary phone')])
    S2(s, stage, 'Your product in use. Edit the line.', [
        art(K.torn_card((820, 1040), 6), (540, 780), -3, 'torn paper'),
        photo('Your product in use', (540, 780), (820, 1040), -3, c['use'].at(1.0, (820, 1040))),
        text('[one tip for\nusing it]', 70, (330, 1340), 2, box=BL, align='left')])
    S2(s, stage, 'Swap in a photo of your product. Type your keyword. ' + CAPTION, [
        art(K.white_card((600, 760)), (540, 1000), 3, 'photo border'),
        photo('Your product', (540, 1000), (600, 760), 3, c['cta'].at(1.0, (600, 760))),
        art(word('Comment', 200, WINE, edge=WHITE), (540, 230), 0, 'Comment'),
        text('"[KEYWORD]"', 76, (540, 400), 2, box=WINE, fg=WHITE, pill=True),
        text('[more questions?]', 66, (540, 530), -2, box=BL)])
    return s

# ======================================================================================================================
# 10 Three people to gift it to (kraft, oak, wine/blush stripes, butter tissue; butter + wine; the ? gift, Polaroids)
# ======================================================================================================================
def polaroid_art(frame, w, pin):
    """A pinned blank Polaroid: (art, window centre offset, window size)."""
    pf = S.fitw(frame, w); x0, y0, x1, y1 = S7.g_win(pf); pd = int(pf.width * 0.13); pn = P.pinned(pf, 0, pin); pad = (pn.width - pf.width) // 2
    return pn, (pad + (x0 + x1) / 2 - pn.width / 2, pad + pd // 2 + (y0 + y1) / 2 - pn.height / 2), (x1 - x0, y1 - y0)

def c10():
    g = S7.setup_10(); g['x'] = [vec(x, WINE) for x in g['x']]
    g['box'] = K.thing('Kraft paper cube gift with twine-38.png', 380, 'dots', BUTTER, scale=0.4, strength=0.9, label=S7.dsticker('?', 90, WINE, WHITE))
    g['box2'] = K.thing('Kraft paper cube gift with twine-38.png', 400, 'dots', WINE, scale=0.4, strength=0.8, label=P.pill_m('FOR YOU', 48, WHITE, rot=0))
    g['usual'] = [K.thing('Glowing Ivory Candle in Glass Jar-96.png', 300, 'smalldots', WINE, scale=0.35, strength=0.35),
                  K.thing('Warm white ceramic coffee mug-140.png', 340, 'dots', WINE, scale=0.4, strength=0.8),
                  K.thing('Rolled chunky knit oatmeal scarf-94.png', 440, 'smalldots', WINE, scale=0.35, strength=0.7)]; c = g['c']; kraft, oak, wall, tissue = (K.fit_bg(g[k]) for k in ('kraft', 'oak', 'wall', 'butter'))
    ph, scr = K.device_art(520); s = []
    tw = K.string((850, -10), (850, 420), 0, S7.TWINE, 6)
    S2(s, kraft, 'Hook. Swap in a photo of your gift being wrapped.', [
        photo('Your gift being wrapped (fills the page)', (540, 720), (CW, CH), 0, c['gift'].at(1.0, (CW, CH))),
        art(tw[0], tw[1], 0, 'twine'), art(g['box'], (850, 560), 6, 'gift'),
        text('stuck on a', 72, (300, 250), -3),
        art(word('gift?', 250, BUTTER), (290, 440), -3, 'gift?'),
        guide(FIRST_GUIDE)])
    S2(s, kraft, HOOK2 + 'No photo needed. Edit both [bracket] lines.', [
        x for obj, xy, r, xx in zip(g['usual'], ((300, 640), (790, 820), (380, 1080)), (-6, 5, -4), g['x']) for x in (art(obj, xy, r, 'the usual gift'), art(xx, xy, r, 'cross'))] + [
        text('[tired of giving\nthe usual?]', 86, (620, 230), -2, align='right'),
        text('[try this instead]', 62, (360, 1330), -2, align='left'),
        art(doodle('arrow', 0, 170, WINE), (760, 1325), -2, 'arrow')])
    pc = (580, 820)
    S2(s, oak, 'Swap in a screenshot of your shop for the phone screen.', [
        art(ph, pc, -4, 'phone'), dict(K.on_screen(pc, ph, scr, c['prod'].at(1.0, (520, 1000)), 'Your shop (screenshot)'), rot=-4),
        text('[found it.]', 84, (290, 250), -3),
        art(doodle('arrow', 9, 220, WINE), (200, 520), -10, 'arrow')])
    S2(s, tissue, 'Swap in your product photo.', [
        art(K.round_card(680), (540, 760), 0, 'round paper'),
        photo('Your product', (540, 760), (680, 680), 0, c['prod'].at(2.0, (680, 680)), shape='circle'),
        text('this one works for', 72, (540, 300), -2),
        art(word('all 3', 230, BUTTER), (540, 1250), -2, 'all 3')])
    pol = [polaroid_art(g['frame'], 400, pn) for pn in ('pin-head-cream', 'pin-head-black', 'pin-head-white')]
    pos = (((280, 560), -6), ((790, 760), 5), ((330, 1110), -3)); names = ('[your friend]', '[your mum]', '[your dad]')
    S2(s, wall, 'Three people to gift it to: a photo and a name for each.', [
        x for (pa, off, wh), (xy, r), cl, nm, nxy in zip(pol, pos, (c['p1'], c['p2'], c['p3']), names, ((280, 830), (790, 1030), (720, 1250)))
        for x in (art(pa, xy, r, 'Polaroid'), photo('Person ' + nm, at(xy, r, off), wh, r, cl.at(1.0, wh)), text(nm, 60, nxy, (-3, 2, -2)[names.index(nm)], box=BUTTER))] + [
        text('[3 people to\ngift it to]', 66, (720, 230), 2, align='left')])
    S2(s, oak, 'Edit the line (gift wrap, a note, whatever you offer).', [
        art(K.thing('Kraft paper cube gift with twine-38.png', 640, 'dots', WINE, scale=0.64, strength=0.8, label=P.pill_m('FOR YOU', 77, WHITE, rot=0)), (540, 720), -4, 'gift'),
        art(doodle('icon', 10, 110, WINE), (250, 560), 0, 'sparkle'), art(doodle('icon', 8, 150, WINE), (850, 470), 0, 'sparkle'),
        text('[gift wrap available]', 72, (540, 1200), -2)])
    anchor = (540, 1180); s7 = []
    for i, (cl, xy) in enumerate(((c['p1'], (230, 420)), (c['p2'], (540, 330)), (c['p3'], (860, 420)))):
        pf = S.fitw(g['frame'], 290); x0, y0, x1, y1 = S7.g_win(pf); sh = K.C.shadow(pf, (8, 14), 14, 100); pad = (sh.width - pf.width) // 2
        st = K.string((xy[0], xy[1] + pf.height / 2 - 10), (anchor[0] + (i - 1) * 40, anchor[1]), (i - 1) * -30, INK, 5)
        s7 += [art(st[0], st[1], 0, 'string'), art(sh, xy, (4, -2, -4)[i], 'Polaroid'),
               photo(f'Person {i + 1}', at(xy, (4, -2, -4)[i], (pad + (x0 + x1) / 2 - sh.width / 2, pad + (y0 + y1) / 2 - sh.height / 2)), (x1 - x0, y1 - y0), (4, -2, -4)[i], cl.at(1.0, (x1 - x0, y1 - y0)))]
    S2(s, tissue, 'The same three photos. Type your keyword. ' + CAPTION, s7 + [
        art(g['box2'], (540, 1300), 0, 'gift'),
        art(word('Comment', 200, WINE, edge=WHITE), (540, 790), 0, 'Comment'),
        text('"[KEYWORD]"', 76, (540, 960), 2, box=WINE, fg=WHITE, pill=True)])
    return s

# ======================================================================================================================
# 12 Your order just arrived (concrete; light blue + wine; doorbell, the wine mailbox, the phone, mailer + peanuts,
# tissue sheets, the big kraft tag, the wax seal)
# ======================================================================================================================
def c12():
    g = S7.setup_12(); g['burst'] = vec(g['burst'], BLUE); c = g['c']; concrete = K.fit_bg(g['concrete']); tissues = [K.fit_bg(t) for t in g['tissues']]
    body, door, arch, k = g['mbf']; mb = body.copy(); dx0, dy0, dx1, dy1 = [int(v * k) for v in S7.MB_DOOR]
    mb.alpha_composite(door.resize((door.width, max(4, int(door.height * 0.05)))), (dx0, dy1))
    ph, scr = K.device_art(560); s = []
    diag = concrete.copy(); m = Image.new('L', (CW, CH), 0); K.ImageDraw.Draw(m).polygon([(0, 1060), (CW, 760), (CW, CH), (0, CH)], fill=255); diag.putalpha(m)
    K.ImageDraw.Draw(diag).line([(0, 1060), (CW, 760)], fill=WHITE + (255,), width=12)
    S2(s, concrete, 'Hook. Swap in a photo at your door (or your parcel arriving). Edit [product].', [
        photo('At the door (top of the page)', (540, 560), (CW, 1120), 0, c['door'].at(1.0, (CW, 1120))),
        art(diag, (540, 720), 0, 'concrete (diagonal)'),
        art(g['burst'], (800, 1140), 0, 'burst'), art(g['bell'], (800, 1140), 0, 'doorbell'),
        text('POV: your [product]\njust arrived', 58, (380, 200), -2),
        art(word("it's here", 200), (520, 400), -2, "it's here"),
        text('ding dong!', 62, (330, 1190), -6, box=WINE, fg=WHITE),
        guide(FIRST_GUIDE)])
    pts = [(540 + r * math.cos(a), 760 + r * math.sin(a)) for r, a in ((440, -2.6), (470, -2.0), (420, -1.1), (470, -0.5), (430, 0.3), (430, 2.6))]
    S2(s, concrete, HOOK2 + 'No photo needed. Edit both [bracket] lines.', [
        art(g['mailer_s'], (540, 860), -4, 'mailer')] + [art(g['peanut'], p, i * 50, 'packing peanut') for i, p in enumerate(pts)] + [
        text('[still waiting\nfor yours?]', 90, (620, 230), -2, align='right'),
        text("[it's on the way]", 62, (350, 1330), -2, align='left'),
        art(doodle('arrow', 0, 170, WINE), (740, 1325), -2, 'arrow')])
    mc = (540, 900); aw, ah = arch[2] - arch[0], arch[3] - arch[1]
    S2(s, concrete, 'Swap in a photo of your parcel on its way (packing, the courier, a tracking screenshot).', [
        art(mb, mc, 0, 'mailbox'),
        photo('Out for delivery', (mc[0] - mb.width / 2 + (arch[0] + arch[2]) / 2, mc[1] - mb.height / 2 + (arch[1] + arch[3]) / 2), (aw - 8, ah - 8), 0, c['track'].at(1.0, (aw, ah)), shape='arch'),
        text('[out for delivery...]', 78, (540, 220), -2)])
    pc = (560, 820)
    S2(s, concrete, 'Swap in a screenshot of your delivery or order message for the phone screen.', [
        art(ph, pc, -3, 'phone'), dict(K.on_screen(pc, ph, scr, c['door'].at(2.0, (560, 1100)), 'Delivery screenshot'), rot=-3),
        text('[delivered!]', 88, (330, 230), -3, box=BLUE)])
    S2(s, tissues[1], 'No photo. These built-in words stay as they are.', [
        art(word('the wait', 220, WINE, edge=WHITE, italic_last=False), (540, 600), -2, 'the wait'),
        art(word('is over', 240, WINE, edge=WHITE), (560, 840), -2, 'is over'),
        art(doodle('icon', 8, 140, WINE), (880, 400), 0, 'sparkle'), art(doodle('icon', 10, 100, WINE), (190, 1050), 0, 'sparkle')])
    S2(s, tissues[0], 'Swap in a photo of the unboxing. Edit the line.', [
        art(K.torn_card((820, 980), 8, color=BUTTER), (540, 820), 2, 'torn tissue'),
        photo('The unboxing', (540, 820), (820, 980), 2, c['unbox'].at(1.5, (820, 980))),
        art(g['peanut'], (180, 300), 20, 'packing peanut'), art(g['peanut'], (900, 1300), -40, 'packing peanut'),
        text("[what's inside?]", 80, (380, 220), -3, align='left')])
    tag = S.cut('images', 'Blank kraft hang tag with twine-116.png', tol=10); tag = P.die_cut(S.fitw(tag, 560), 10)
    S2(s, concrete, 'Swap in a photo of your product in use. Edit the tag.', [
        photo('In use (fills the page)', (540, 720), (CW, CH), 0, c['use'].at(1.0, (CW, CH))),
        art(tag, (830, 880), 8, 'kraft tag'),
        text('[packed with\nlove + a little\nsurprise]', 52, at((830, 880), 8, (10, 170)), 8, box=None, align='left')])
    mailer = g['mailer']; mw, mh = int(mailer.width * 0.7), int(mailer.height * 0.6)
    mc8 = (540, 980); m8 = P.die_cut(mailer, 10)
    S2(s, concrete, 'Swap in a photo of your product. Type your keyword. ' + CAPTION, [
        art(m8, mc8, -3, 'mailer'),
        photo('Your product (in the mailer)', at(mc8, -3, (0, -mailer.height * 0.5 + mailer.height * 0.22 + mh / 2)), (mw, mh), -3, c['cta'].at(1.0, (mw, mh))),
        art(g['seal'], (830, 1290), 0, 'wax seal'),
        art(word('get yours', 190), (540, 240), -2, 'get yours'),
        text('comment "[KEYWORD]"', 72, (540, 420), 2, box=WINE, fg=WHITE)])
    return s

# ======================================================================================================================
# 20 What buyers said (pink marble; pink + wine, gold stars; review cards, the phone, the trophy)
# ======================================================================================================================
def c20():
    g = S7.setup_20(); g['d_burst'] = vec(g['d_burst'], WINE); c = g['c']; marble = K.fit_bg(g['marble']); ph, scr = K.device_art(480); s = []
    big, big_off, big_px = K.blank_card(2, 820, WINE, 'review', name='[buyer]')
    revs = [K.blank_card(1, 520, WINE, 'review', name='[buyer]') for _ in range(3)]
    S2(s, marble, 'Hook. Swap in a photo of your product.', [
        photo('Your product (fills the page)', (540, 720), (CW, CH), 0, c['prod'].at(1.0, (CW, CH)))] + [
        art(g['stars'][i], (190 + i * 175, 260 - (30 if i in (1, 3) else 0)), 0, 'gold star') for i in range(5)] + [
        text('what', 78, (540, 900), -2),
        art(word('buyers', 230, PINK), (540, 1060), 0, 'buyers'),
        text('said', 78, (540, 1220), 2, box=PINK),
        guide(FIRST_GUIDE)])
    S2(s, marble, HOOK2 + 'Paste a real review, word for word.', [
        art(big, (540, 820), -3, 'review card'),
        text('[the review, word\nfor word]', big_px + 8, at((540, 820), -3, big_off), -3, box=None, align='left'),
        text("[don't take\nmy word for it]", 90, (620, 240), -2, align='right'),
        text("[here's theirs]", 62, (330, 1330), -2, align='left'),
        art(doodle('arrow', 0, 170, WINE), (680, 1325), -2, 'arrow')])
    pc = (700, 800)
    S2(s, marble, 'Swap in a screenshot of a real review or DM for the phone screen.', [
        art(ph, pc, 5, 'phone'), dict(K.on_screen(pc, ph, scr, c['prod'].at(2.0, (480, 960)), 'Review screenshot'), rot=5),
        art(doodle('arrow', 9, 200, WINE), (260, 700), 0, 'arrow'),
        text('[straight from\nmy DMs]', 72, (280, 330), -3, align='left')])
    S2(s, marble, 'Three more reviews round your product photo.', [
        art(g['d_burst'], (540, 800), 0, 'burst'),
        art(K.round_card(560), (540, 800), 0, 'round paper'),
        photo('Your product', (540, 800), (560, 560), 0, c['prod'].at(3.0, (560, 560)), shape='circle')] + [
        x for (ra, off, px), xy, r, w_ in zip(revs, ((290, 300), (800, 470), (330, 1230)), (-4, 5, -3), ('[review two]', '[review three]', '[review four]'))
        for x in (art(ra, xy, r, 'review card'), text(w_, px + 6, at(xy, r, off), r, box=None, align='left'))])
    S2(s, marble, 'Your real number of happy buyers (or reviews). Edit it.', [
        text('[200]', 120, (540, 330), -3),
        art(word('happy buyers', 130, WINE, edge=WHITE), (540, 520), 0, 'happy buyers'),
        art(g['trophy'], (540, 1000), 0, 'trophy')])
    S2(s, marble, 'Swap in a photo of your product in use. Edit the line.', [
        art(K.white_card((780, 960)), (540, 800), -3, 'photo border'),
        photo('In use', (540, 800), (780, 960), -3, c['use'].at(1.0, (780, 960))),
        art(g['stars'][0], (190, 340), 0, 'gold star'), art(g['stars'][2], (900, 1250), 0, 'gold star'),
        text('[what they love most]', 70, (540, 1360), 2)])
    S2(s, marble, 'Swap in a photo of your product. Type your keyword. ' + CAPTION, [
        art(K.white_card((560, 700)), (540, 1000), 3, 'photo border'),
        photo('Your product', (540, 1000), (560, 700), 3, c['cta'].at(1.0, (560, 700))),
        text('see why', 74, (540, 200), -2),
        art(word('Comment', 200), (540, 350), 0, 'Comment'),
        text('"[KEYWORD]"', 76, (540, 520), 2, box=WINE, fg=WHITE, pill=True)])
    return s

# ======================================================================================================================
# 22 Put it to the test (graph paper + torn butter band; light blue + butter, deep blue ink; magnifier, tubes, stamp)
# ======================================================================================================================
def c22():
    g = S7.setup_22(); g['d_burst'] = vec(g['d_burst'], BUTTER); M = g['M']; c = g['c']; paper = K.fit_bg(g['paper']); DEEP = S7.DEEP; s = []
    mag, (ox, oy, r) = M.magnifier(1150); mag_s, (sox, soy, sr) = M.magnifier(800)
    claim = P.sticky('', 440); did = P.sticky('', 400, pin='pin-head-cream'); tubes = M.tubes(g, 1.0)
    S2(s, paper, 'Hook. Swap in a photo of your product mid-test. Edit [ruin].', [
        photo('The test (fills the page)', (540, 720), (CW, CH), 0, c[1].at(2.5, (CW, CH))),
        art(g['rec'], (930, 160), 0, 'REC'),
        text('I tried to', 78, (330, 330), -3),
        text('[ruin] it', 150, (520, 500), -3, box=DEEP, fg=WHITE),
        guide(FIRST_GUIDE)])
    mc = (600, 960)
    S2(s, paper, HOOK2 + 'Swap in a photo of the setup (it shows inside the lens). Edit both [bracket] lines.', [
        art(mag, mc, 0, 'magnifier'),
        photo('The setup', (mc[0] + ox, mc[1] + oy), (2 * r - 6, 2 * r - 6), 0, c[0].at(1.0, (int(2 * r), int(2 * r))), shape='circle'),
        text('[does it really\nSTAY DRY?]', 90, (620, 230), -2, align='right'),
        text('[watch this]', 62, (290, 1330), -2, align='left'),
        art(doodle('arrow', 0, 170, DEEP), (600, 1325), -2, 'arrow')])
    nc = (320, 760)
    S2(s, paper, 'The claim you are testing. Edit the note.', [
        art(word("let's test it", 160, DEEP, edge=WHITE), (540, 300), -2, "let's test it"),
        art(claim, nc, -6, 'sticky note'), K.note_text(nc, -6, 'claim:\n[stays dry]', 56, align='left'),
        art(tubes, (790, 1080), 4, 'test tubes'),
        art(doodle('arrow', 9, 220, INK), (540, 1040), -20, 'arrow')])
    S2(s, paper, 'Swap in a still from your one-take test. Edit the line.', [
        art(K.white_card((760, 980)), (540, 820), 2, 'photo border'),
        photo('The test, one take', (540, 820), (760, 980), 2, c[1].at(5.0, (760, 980))),
        art(g['rec'], at((540, 820), 2, (300, -430)), 2, 'REC'),
        text('[one take, no cuts]', 72, (540, 210), -3),
        text('watch closely', 66, (330, 1370), -2, box=BLUE)])
    S2(s, paper, 'Swap in a photo of the result (it shows inside the lens).', [
        art(g['d_burst'], (330, 560), 0, 'burst'), art(did, (330, 560), -5, 'sticky note'), K.note_text((330, 560), -5, 'did it...?', 60),
        art(mag_s, (680, 1080), -10, 'magnifier'),
        photo('The result', at((680, 1080), -10, (sox, soy)), (2 * sr - 6, 2 * sr - 6), 0, c[2].at(1.0, (int(2 * sr), int(2 * sr))), shape='circle')])
    S2(s, paper, 'Swap in a photo of the result. Edit the line.', [
        photo('The result (fills the page)', (540, 720), (CW, CH), 0, c[2].at(2.0, (CW, CH))),
        art(g['ink'], (330, 1150), -12, 'PASSED stamp ink'), art(g['stamp'], (820, 1220), 10, 'rubber stamp'),
        text('[IT STAYED DRY]', 84, (540, 300), -2, box=BUTTER)])
    S2(s, paper, 'Swap in a photo of your product. Type your keyword. ' + CAPTION, [
        art(K.white_card((560, 720)), (540, 960), 2, 'photo border'),
        photo('Your product', (540, 960), (560, 720), 2, c[3].at(1.0, (560, 720))),
        art(g['ink_s'], (720, 680), -14, 'PASSED stamp ink'),
        art(tubes.resize((int(tubes.width * 0.7), int(tubes.height * 0.7)), Image.LANCZOS), (170, 1290), -6, 'test tubes'),
        art(word('Comment', 200, DEEP, edge=WHITE), (540, 240), 0, 'Comment'),
        text('"[KEYWORD]"', 76, (540, 410), 2, box=BLUE, pill=True)])
    return s

# ======================================================================================================================
# 23 Every option in 10 seconds (white pegboard; light blue + wine; the fan deck, paint chips, glasses, the oak shelf)
# ======================================================================================================================
def c23():
    g = S7.setup_23(); c = g['c']; peg = K.fit_bg(g['peg']); s = []
    gl = g['glasses']; kk = gl.width / 1316; gsh = K.C.shadow(gl, (8, 14), 12, 110); gpad = (gsh.width - gl.width) // 2
    S2(s, peg, 'Hook. No photo needed. Edit the [bracket] line.', [
        art(g['fan'], (540, 1050), 0, 'paint chip fan'),
        art(word('every option', 150, WINE, edge=WHITE), (540, 330), -2, 'every option'),
        text('[in one swipe]', 80, (540, 520), 2, box=BLUE),
        guide(FIRST_GUIDE)])
    gc = (540, 760)
    lenses = [photo(f'Option {5 + i}', (gc[0] - gsh.width / 2 + gpad + (b[0] + b[2]) * kk / 2, gc[1] - gsh.height / 2 + gpad + (b[1] + b[3]) * kk / 2),
                    ((b[2] - b[0]) * kk - 12, (b[3] - b[1]) * kk - 12), 0, c[4 + i].at(1.0, (300, 300)), shape='oval') for i, b in enumerate((S7.LENS_L, S7.LENS_R))]
    S2(s, peg, HOOK2 + 'Two option photos show in the lenses. Edit both [bracket] lines.', [art(gsh, gc, 0, 'glasses')] + lenses + [
        text("[can't decide?]", 96, (620, 250), -2, align='right'),
        text('[see them all]', 62, (300, 1320), -2, align='left'),
        art(doodle('arrow', 0, 170, WINE), (620, 1315), -2, 'arrow')])
    S2(s, peg, 'Option 1: its photo, its colour chip, its name.', [
        photo('Option 1 (fills the page)', (540, 720), (CW, CH), 0, c[0].at(1.0, (CW, CH))),
        art(g['chip_row'][0], (190, 1120), -6, 'paint chip'),
        text('[OPTION 1]', 84, (560, 1180), -2)])
    S2(s, peg, 'Options 2 and 3, one in each half.', [
        photo('Option 2 (top half)', (540, 360), (CW, 720), 0, c[1].at(1.0, (CW, 720))),
        photo('Option 3 (bottom half)', (540, 1080), (CW, 720), 0, c[2].at(1.0, (CW, 720))),
        art(g['chips'][1], (150, 560), -6, 'paint chip'), text('[OPTION 2]', 72, (430, 600), -2),
        art(g['chips'][2], (930, 1260), 6, 'paint chip'), text('[OPTION 3]', 72, (650, 1300), 2)])
    S2(s, peg, 'Option 4 as a print on the pegboard.', [
        art(K.white_card((720, 900)), (540, 760), -3, 'photo border'),
        photo('Option 4', (540, 760), (720, 900), -3, c[3].at(1.0, (720, 900))),
        art(g['chip_row'][3], (880, 1230), 8, 'paint chip'),
        text('[OPTION 4]', 80, (380, 1310), -2)])
    S2(s, peg, 'Options 5 and 6 side by side.', [
        art(K.white_card((440, 820)), (290, 760), -3, 'photo border'), photo('Option 5', (290, 760), (440, 820), -3, c[4].at(1.0, (440, 820))),
        art(K.white_card((440, 820)), (790, 800), 3, 'photo border'), photo('Option 6', (790, 800), (440, 820), 3, c[5].at(1.0, (440, 820))),
        text('[OPTION 5]', 66, (290, 1270), -3), text('[OPTION 6]', 66, (790, 1310), 3),
        text('which one?', 70, (540, 230), -2)])
    S2(s, peg, 'The chips stay as they are (or recolour them to your options).', [
        art(g['chip_row'][i], (200 + (i % 3) * 340, 760 + (i // 3) * 460), (-6, 4, -3, 5, -4, 6)[i], 'paint chip') for i in range(6)] + [
        text('pause on', 72, (540, 230), -2),
        art(word('your favourite', 130, WINE, edge=WHITE), (540, 400), 0, 'your favourite'),
        art(doodle('icon', 2, 170, WINE), (540, 1310), 8, 'heart')])
    shelf = g['shelf']; sc = (540, 1000); cards = []
    for i, (x, y) in enumerate(((330, 720), (750, 720), (330, 1010), (750, 1010), (330, 1290), (750, 1290))):
        r = (-3, 3)[i % 2]; cards += [art(K.white_card((230, 170), 8), (x, y), r, 'photo border'), photo(f'Option {i + 1}', (x, y), (230, 170), r, c[i].at(1.0, (230, 170)))]
    S2(s, peg, 'All six option photos on the shelf. Type your keyword and shop. ' + CAPTION, [art(shelf, sc, 0, 'shelf')] + cards + [
        art(word('Comment', 190, WINE, edge=WHITE), (540, 200), 0, 'Comment'),
        text('"[KEYWORD]"', 74, (540, 360), 2, box=WINE, fg=WHITE, pill=True),
        text('all [6] at [shop]', 64, (540, 480), -2, box=BLUE)])
    return s

# ======================================================================================================================
# Halloween pack: each carousel reuses its Reel's own art (motion_hN.py): h2's dotted night, bats and glossy lilac
# Goudy Stout; h3's silk web, pom-pom spider and cut-out letters; h5's doors, candy and Snap ITC taffy letters; h6's
# night sky, blood moon, wolf and tree, with Bodoni Moda for its editable serif words (as in its CapCut build).
# ======================================================================================================================
def crop_h(im, cy):
    """A 1080 x 1920 Reel frame cut to the 1440-tall slide around height cy."""
    y0 = int(max(0, min(im.height - CH, cy - CH / 2))); return im.crop((0, y0, CW, y0 + CH)).convert('RGBA'), y0

def scaled(im, w): return im.resize((int(w), int(im.height * w / im.width)), Image.LANCZOS)

def ch2():
    import motion_h2 as M
    LIL, INK2 = M.LILAC, M.INK; night = K.fit_bg(M.BACKDROP); night_end = crop_h(M.BACKDROP_END, 720)[0]
    fly = [K.C.shadow(scaled(M.FLY, w).rotate(r, expand=True, resample=Image.BICUBIC), (6, 12), 12, 80) for w, r in ((260, -12), (190, 18), (150, -25), (220, 8), (130, 30), (170, -6))]
    hang = scaled(M.HANG, 190); branch = scaled(M.BRANCH, 1080); tk = scaled(M.TICKET, 600)
    def ticket(c, rot, words): return [art(tk, c, rot, 'ticket stub'), text(words, 52, at(c, rot, (-tk.width * 0.1, 0)), rot, box=None, fg=INK2)]
    s = []
    S2(s, night, 'Hook. Swap in your opening photo (you or your product).', [
        photo('Opening photo (fills the page)', (540, 720), (CW, CH), 0, M.vid('a', 1.0))] + [
        art(b, xy, 0, 'bat') for b, xy in zip(fly, ((170, 200), (900, 150), (980, 640), (110, 760), (880, 1290), (190, 1330)))] + [
        text("things I'm", 70, (540, 860), -2, box=LIL, fg=INK2),
        art(M.glossy('BATTY', 165), (540, 1040), -3, 'BATTY'),
        art(M.glossy('about', 90), (560, 1220), 2, 'about'),
        guide(FIRST_GUIDE)])
    S2(s, night, HOOK2 + 'No photo needed. Edit both [bracket] lines.', [
        art(branch, (540, 170), 0, 'branch'), art(hang, (760, 400), 0, 'hanging bat'),
        art(M.glossy('TOP 3', 170), (520, 830), -3, 'TOP 3'),
        text('[my Halloween\nfavourites]', 84, (620, 580), -2, align='right'),
        text('[number 1 first]', 62, (330, 1300), -2, align='left'),
        art(doodle('arrow', 0, 170, LIL), (720, 1295), -2, 'arrow')])
    S2(s, night, 'Favourite 1: swap in its photo and type its name on the ticket.', [
        art(K.white_card((760, 860)), (560, 700), -2, 'photo border'),
        photo('Favourite 1', (560, 700), (760, 860), -2, M.vid('b', 1.0)),
        art(M.glossy('1', 280), (150, 330), -6, '1'),
        art(doodle('icon', 4, 200, LIL), (880, 250), 10, 'crown')] + ticket((600, 1250), -3, '[favourite 1]'))
    S2(s, night, 'Favourite 2: swap in its photo and type its name on the ticket.', [
        photo('Favourite 2 (top of the page)', (540, 450), (CW, 900), 0, M.vid('c', 1.0)),
        art(K.torn_strip(night, 640, 3, 't'), (540, CH - 320 + 6), 0, 'torn night'),
        art(M.glossy('2', 240), (170, 1050), 5, '2'),
        art(doodle('icon', 3, 160, LIL), (900, 1020), -8, 'heart')] + ticket((620, 1240), 2, '[favourite 2]'))
    S2(s, night, 'Favourite 3: swap in its photo and type its name on the ticket.', [
        art(doodle('burst', 3, 860, LIL), (540, 680), 0, 'burst'),
        art(K.round_card(600), (540, 680), 0, 'round paper'),
        photo('Favourite 3', (540, 680), (600, 600), 0, M.vid('d', 1.0), shape='circle'),
        art(fly[1], (930, 330), 0, 'bat'), art(fly[4], (140, 1000), 0, 'bat'),
        art(M.glossy('3', 240), (170, 260), -5, '3')] + ticket((620, 1250), -2, '[favourite 3]'))
    cards = []
    for i, (key, x) in enumerate((('b', 220), ('c', 540), ('d', 860))):
        r = (-3, 2, -2)[i]; cards += [art(hang, (x, 300), 0, 'hanging bat'), art(K.white_card((260, 330), 12), (x, 640), r, 'photo border'),
                                      photo(f'Favourite {i + 1}', (x, 640), (260, 330), r, M.vid(key, 1.0))]
    S2(s, night_end, 'The same three photos. Type your keyword. ' + CAPTION, [art(branch, (540, 150), 0, 'branch')] + cards + [
        text('comment', 66, (540, 920), -2, box=LIL, fg=INK2),
        art(M.glossy('BATTY', 150), (540, 1080), -2, 'BATTY'),
        text("[and I'll send all 3 links]", 56, (540, 1250), 2)])
    return s

def ch3():
    import motion_h3 as M
    cream = K.fit_bg(S7.toned('images', 'Cream parchment paper stack-205.png', (196, 186, 168), (250, 246, 236), (0.3, 0.3, 0.7, 0.62)))
    def web(full=True, angles=None):
        lay = Image.new('RGBA', (1080, 1920), (0, 0, 0, 0))
        for a in (angles if angles is not None else [l[0] for l in M.LINES]): M.silk(lay, list(M.line_ends(a)), 5)
        if full: M.rings(lay, 999)
        return lay.crop((0, 140, 1080, 1580))
    def thread(x0, y0, x1, y1):
        lay = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); M.silk(lay, [(x0, y0), (x1, y1)], 4); return lay.crop(lay.getbbox()), ((x0 + x1) / 2, (y0 + y1) / 2)
    def hanging(word_, px, y):
        """Cut-out letters hanging on silk from the top edge (built-in word): one art layer."""
        lay = Image.new('RGBA', (CW, y + px), (0, 0, 0, 0)); step = px * 0.97
        for i, ch in enumerate(word_):
            sc = M.scrap(ch, i, px); cx = 540 + (i - (len(word_) - 1) / 2) * step; rot = 4 if i % 2 else -4
            M.silk(lay, [(cx, 0), (cx, y - sc.height / 2 + 30)], 3, 220); it = sc.rotate(rot, expand=True, resample=Image.BICUBIC)
            lay.alpha_composite(it, (int(cx - it.width / 2), int(y - it.height / 2)))
        return lay, (540, lay.height / 2)
    spider = M.spider; sp = lambda w: scaled(spider, w)
    def bubble(c, d, key, slot):
        return [art(K.round_card(d, 14), c, 0, 'round paper'), photo(slot, c, (d, d), 0, M.vid(key, 1.0), shape='circle')]
    s = []; cw_ = hanging('CAUGHT', 150, 330); th1 = thread(900, 0, 900, 700)
    S2(s, cream, 'Hook. Swap in a photo of your product held up against a plain wall.', [
        photo('Your product, held up (fills the page)', (540, 720), (CW, CH), 0, M.vid('bg', 1.0)),
        art(cw_[0], cw_[1], 0, 'CAUGHT'),
        art(th1[0], th1[1], 0, 'silk'), art(sp(280), (900, 790), 0, 'spider'),
        text("you're about to get", 66, (420, 560), -2),
        guide(FIRST_GUIDE)])
    S2(s, cream, HOOK2 + 'No photo needed. Edit both [bracket] lines.', [
        art(web(), (540, 720), 0, 'web'), art(sp(320), (540, 720), 0, 'spider'),
        text("[4 reasons\nyou'll love it]", 88, (620, 230), -2, align='right'),
        text('[get caught]', 62, (290, 1320), -2, align='left'),
        art(doodle('arrow', 0, 170, M.INK), (600, 1315), -2, 'arrow')])
    S2(s, cream, 'Reason 1: swap in a close-up and type its label.', [
        art(web(False, [-50]), (540, 720), 0, 'silk')] + bubble((640, 640), 620, 'p1', 'Reason 1') + [
        art(sp(220), (230, 1080), 30, 'spider'),
        text('[THE GLOW]', 84, (380, 1240), -2, align='left')])
    S2(s, cream, 'Reasons 2 and 3: a close-up and a label for each.', [
        art(web(False, [-130, 90]), (540, 720), 0, 'silk')] + bubble((330, 470), 440, 'p2', 'Reason 2') + bubble((750, 980), 440, 'p3', 'Reason 3') + [
        text('[THE SCENT]', 70, (330, 780), -2), text('[THE PRICE]', 70, (720, 1300), 2)])
    th5 = thread(840, 0, 840, 300)
    S2(s, cream, 'Reason 4: swap in its photo and type its label.', [
        art(K.white_card((760, 900)), (540, 800), 2, 'photo border'),
        photo('Reason 4', (540, 800), (760, 900), 2, M.vid('p4', 1.0)),
        art(th5[0], th5[1], 0, 'silk'), art(sp(260), (840, 370), 0, 'spider'),
        text('[THE GIFT BOX]', 80, (380, 190), -3, align='left')])
    cm = hanging('COMMENT', 120, 300)
    S2(s, cream, 'Swap in your product photo for the middle of the web. Type your keyword. ' + CAPTION, [
        art(web(), (540, 800), 0, 'web')] + bubble((540, 800), 420, 'bg', 'Your product') + [
        art(sp(220), (760, 620), -20, 'spider'),
        art(cm[0], cm[1], 0, 'COMMENT'),
        text('[WEB]', 110, (540, 1250), -2, box=M.INK, fg=WHITE)])
    return s

def ch5():
    import motion_h5 as M
    LAV, INK5 = M._LAV, M.INK
    DOO = {k: vec(v, (255, 255, 255) if k == 'sparkle' else LAV) for k, v in M.DOO.items()}
    def taffy(text_, px, kind='taffy'):
        f = K.ImageFont.truetype(M.SNAP, px); gap = px * 0.02; ws = [f.getlength(ch) for ch in text_]
        ls = [M.letter(ch, px, kind) for ch in text_]; tot = sum(ws) + gap * (len(text_) - 1)
        out = Image.new('RGBA', (int(tot + px), max(l.height for l in ls)), (0, 0, 0, 0)); x = px / 2
        for i, (ch, w_, L) in enumerate(zip(text_, ws, ls)):
            if ch != ' ':
                it = L.rotate(3 if i % 2 else -3, expand=True, resample=Image.BICUBIC); out.alpha_composite(it, (int(x + w_ / 2 - it.width / 2), int(out.height / 2 - it.height / 2)))
            x += w_ + gap
        return out
    door, _ = crop_h(M.DOOR_SHUT, 720)
    house, hbox = M.HOUSE, M.HBOX; hs = CW / (hbox[2] - hbox[0])
    ax0, ax1, ay0, ay1 = (650 - hbox[0]) * hs, (832 - hbox[0]) * hs, (470 - hbox[1]) * hs, (775 - hbox[1]) * hs
    hcrop, hy0 = crop_h(house, (ay0 + ay1) / 2 + 150)
    candy = [K.C.shadow(scaled(c, w).rotate(r, expand=True, resample=Image.BICUBIC), (6, 10), 10, 80) for c, w, r in zip(M.CANDY * 3, (230, 200, 260, 180, 240, 210), (20, -30, 60, -10, 110, 35))]
    note = P.sticky('', 440, pin='pin-head-black'); s = []
    S2(s, door, 'Hook. Swap in a photo of the common mistake in both glass panes (use the same photo twice).', [
        photo(f'The trick ({side} pane)', ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2), (b[2] - b[0], b[3] - b[1]), 0, M.vid('trick', 1.0)) for side, b in zip(('left', 'right'), M.PANES)] + [
        art(DOO['burst1'], (330, 820), 0, 'burst'),
        art(taffy('TRICK', 230), (540, 1080), -2, 'TRICK'),
        art(taffy('or TREAT?', 120), (540, 1270), 2, 'or TREAT?'),
        guide(FIRST_GUIDE, (540, 1405))])
    S2(s, hcrop, HOOK2 + 'Swap in a photo of your product for the open doorway. Edit both [bracket] lines.', [
        photo('Your product (in the doorway)', ((ax0 + ax1) / 2, (ay0 + ay1) / 2 - hy0), (ax1 - ax0, ay1 - ay0), 0, M.vid('treat', 1.0), shape='arch')] + [
        art(c, xy, 0, 'candy') for c, xy in zip(candy, ((180, 760), (900, 700), (230, 1150), (880, 1180), (640, 1300)))] + [
        text('[something sweet\nis coming]', 80, (620, 200), -2, align='right'),
        text('[trick first]', 62, (290, 1360), -2, align='left'),
        art(DOO['arrow'], (660, 1350), -2, 'arrow')])
    nc = (700, 1000)
    S2(s, door, 'The trick: a photo of the common mistake. Name it on the note.', [
        photo('The trick (fills the page)', (540, 720), (CW, CH), 0, M.vid('trick', 2.0)),
        text('the trick:', 72, (300, 220), -3),
        art(note, nc, 5, 'sticky note'), K.note_text(nc, 5, '[cheap\nsponges]', 62, k=(0, 30)),
        art(vec(scaled(DOO['x'], 190), LAV), at(nc, 5, (230, -170)), 5, 'cross')])
    S2(s, hcrop, 'The treat: swap in your product photo and say what it is.', [
        art(K.white_card((700, 860)), (540, 760), -2, 'photo border'),
        photo('The treat: your product', (540, 760), (700, 860), -2, M.vid('treat', 1.5)),
        art(taffy('TREAT', 200), (540, 230), -2, 'TREAT'),
        art(candy[2], (920, 560), 0, 'candy'), art(DOO['heart'], (180, 1050), -8, 'heart'),
        text('[our 5-minute scrub]', 72, (540, 1290), 2)])
    cam = Image.new('RGBA', (CW, 120), (0, 0, 0, 0)); d = K.ImageDraw.Draw(cam); f = K.ImageFont.truetype('C:/Windows/Fonts/consola.ttf', 40)
    d.text((70, 60), 'Front door', font=f, fill=(255, 255, 255, 230), anchor='lm'); d.ellipse((870, 46, 898, 74), fill=(230, 50, 40, 255)); d.text((910, 60), 'LIVE', font=f, fill=(255, 255, 255, 230), anchor='lm')
    nc5 = (720, 1030)
    S2(s, door, 'The proof: a photo of the result or a happy customer. Edit the note.', [
        photo('The proof (fills the page)', (540, 720), (CW, CH), 0, M.vid('proof', 1.0)),
        art(cam, (540, 90), 0, 'doorbell camera'),
        text('the proof:', 72, (300, 260), -3),
        art(note, nc5, -4, 'sticky note'), K.note_text(nc5, -4, '[5-star\nreviews]', 64, k=(0, 30)),
        art(DOO['arrow'], (420, 1040), 10, 'arrow')])
    S2(s, door, 'Type your keyword and your offer. ' + CAPTION, [
        art(c, xy, 0, 'candy') for c, xy in zip(candy, ((160, 1180), (420, 1300), (680, 1220), (930, 1320), (300, 1050), (860, 1080)))] + [
        art(taffy('COMMENT', 150), (540, 330), -2, 'COMMENT'),
        text('[TREAT]', 100, (540, 540), 2, box=LAV, fg=INK5, pill=True),
        text('[for something sweet: 15% off]', 54, (540, 700), -2)])
    return s

def ch6():
    import motion_h6 as M
    import storyboard_halloween as B
    RED, CREAM = M.RED, M.CREAM; sky = K.fit_bg(M.sky)
    def glow(d):
        pad = 270; im = Image.new('RGBA', (d + 2 * pad, d + 2 * pad), (0, 0, 0, 0)); B.moon_glow(im, d, (pad, pad)); return im
    def serif(t, px, color):
        """A built-in word in Bodoni Moda (live text in Canva; the preview uses the same font)."""
        f = K.ImageFont.truetype(K.FONTS['bodoni'][0], px); l, t_, r, b = f.getbbox(t); im = Image.new('RGBA', (r - l + 60, b - t_ + 60), (0, 0, 0, 0))
        K.ImageDraw.Draw(im).text((30 - l, 30 - t_), t, font=f, fill=color + (255,)); im = K.C.shadow(im, (0, 6), 9, 140)
        im.info['lettering'] = dict(words=t, px=px, fill=color, edge=None, italic_last=False, font='bodoni'); return im
    blood = lambda w: scaled(M.BLOOD, w); wolf = scaled(M.wolf, 380); s = []
    S2(s, sky, 'Hook. Swap in a photo of your product or shop.', [
        photo('Your product (fills the page)', (540, 720), (CW, CH), 0, M.vid('a', 0.5)),
        art(serif('once in a', 130, CREAM), (540, 230), 0, 'once in a'),
        art(serif('blood', 250, RED), (540, 450), -2, 'blood'), art(serif('moon', 250, RED), (560, 680), -2, 'moon'),
        guide(FIRST_GUIDE)])
    S2(s, sky, HOOK2 + 'No photo needed. Edit both lines.', [
        art(glow(860), (540, 900), 0, 'moon glow'), art(blood(860), (540, 900), 0, 'blood moon'),
        art(M.cl.resize((1300, int(M.cl.height * 1300 / M.cl.width))), (420, 1300), 0, 'clouds'),
        text('our once-a-year', 60, (700, 180), 0, box=None, fg=CREAM, align='right'),
        text('SALE', 200, (760, 330), 0, box=None, fg=RED, font='bodoni', align='right'),
        text('[see the deal]', 62, (300, 1330), -2, align='left'),
        art(doodle('arrow', 0, 170, CREAM), (620, 1325), -2, 'arrow')])
    S2(s, sky, 'Swap in a photo for the moon window. Edit the deal.', [
        art(glow(800), (540, 640), 0, 'moon glow'),
        photo('Your product (in the moon)', (540, 640), (800, 800), 0, M.vid('b', 1.0), shape='circle'),
        text('everything', 60, (540, 1150), 0, box=None, fg=CREAM),
        text('30% off', 190, (540, 1290), 0, box=None, fg=RED, font='bodoni')])
    mc = (250, 1150)
    S2(s, sky, 'Swap in a photo of your product. Edit the dates.', [
        art(K.white_card((560, 720)), (680, 560), 3, 'photo border'),
        photo('Your product', (680, 560), (560, 720), 3, M.vid('b', 2.0)),
        art(glow(480), mc, 0, 'moon glow'), art(blood(480), mc, 0, 'blood moon'), art(scaled(M.wolf, 320), (mc[0], mc[1] + 240 - scaled(M.wolf, 320).height / 2), 0, 'wolf'),
        text('this weekend only', 54, (800, 1140), 0, box=None, fg=CREAM),
        text('Oct 29-31', 120, (800, 1270), 0, box=None, fg=RED, font='bodoni')])
    tree = scaled(M.tree, 1500); branch = scaled(M.branch, 760); hang = scaled(M.hang, 210)
    S2(s, sky, 'Swap in a photo of your shop or the whole collection. Edit the line.', [
        photo('Your shop (fills the page)', (540, 720), (CW, CH), 0, M.vid('c', 1.0)),
        art(tree, (-260, 760), 0, 'tree'),
        art(branch, (CW - 380, branch.height / 2), 0, 'branch'), art(hang, (CW - 300, branch.height - 10 + hang.height / 2), 0, 'hanging bat'),
        text('[everything in the shop]', 62, (600, 1300), -2)])
    bat = lambda w: scaled(M.bat, w)
    S2(s, sky, 'Type your keyword. ' + CAPTION, [
        art(glow(900), (540, 760), 0, 'moon glow'), art(blood(900), (540, 760), 0, 'blood moon'),
        art(M.cl.resize((1500, int(M.cl.height * 1500 / M.cl.width))), (540, 1330), 0, 'clouds'),
        art(bat(260), (200, 230), 8, 'bat'), art(bat(210), (880, 180), -8, 'bat'),
        text('comment', 66, (540, 600), 0, box=None, fg=CREAM),
        text('MOON', 230, (540, 770), 0, box=None, fg=CREAM, font='bodoni'),
        text('for your code', 60, (540, 940), 0, box=None, fg=CREAM)])
    return s

# ======================================================================================================================
# 01, 02, 03: the first three Reels (built before the locked type), each in its own world. Their big words go in as
# live Bodoni FLF (01, 02: the Reels' tall/Bodoni serif) or stay polka-dot artwork (03's approved Corben dots).
# ======================================================================================================================
def c01():
    import templates.t01 as T
    clips = [Clip(n, t, 6.0) for n, t in T.SPEC['test_clips']]; cream = K.fit_bg(K.C.paper((CW, CH), (250, 244, 230), seed=41))
    butter = K.fit_bg(K.C.paper((CW, CH), (247, 230, 169), seed=61))
    pol = lambda w, pin: polaroid_art(P.raw_cut('Blank Polaroid on White Background.png', 420), w, pin)
    def tape(length, rot_seed): return K.C.washi(length, 90, 'stripes', (BUTTER, WHITE), seed=rot_seed, alpha=235)
    def serif(t, px, color=INK): return text(t, px, (0, 0), 0, box=None, fg=color, font='bodoni')
    def place(L, c, rot=0): L = dict(L); L['c'] = c; L['rot'] = rot; return L
    s = []
    rings = [(220, 1080), (540, 1120), (860, 1080)]
    S2(s, cream, 'Hook. Swap in three small photos, one per way, and name your product.', [
        place(serif('One [product],', 84), (540, 250)),
        place(serif('3 ways', 200), (540, 470)),
        art(doodle('frame', 2, 900, INK), (540, 480), -3, 'circle'),
        art(doodle('icon', 10, 100, INK), (930, 220), 0, 'sparkle')] + [
        x for i, (c, w) in enumerate(zip(rings, ('[way one]', '[way two]', '[way three]')))
        for x in (art(K.round_card(260, 12), c, 0, 'round paper'), photo(f'Way {i + 1}', c, (260, 260), 0, clips[i + 1].at(1.0, (260, 260)), shape='circle'),
                  text(w, 48, (c[0], c[1] + 200), 0, box=None))] + [guide(FIRST_GUIDE)])
    pa, off, wh = pol(640, 'pin-head-black')
    S2(s, butter, HOOK2 + 'Swap in a photo of your product. Edit both [bracket] lines.', [
        art(pa, (540, 800), -4, 'Polaroid'), photo('Your product', at((540, 800), -4, off), wh, -4, clips[0].at(1.0, wh)),
        text("[you're only using\nit one way]", 84, (620, 210), -2, align='right'),
        text('[here are 3]', 62, (300, 1340), -2, align='left'),
        art(doodle('arrow', 0, 170, INK), (600, 1335), -2, 'arrow')])
    p3, off3, wh3 = pol(820, 'pin-head-cream')
    S2(s, cream, 'Way 1: its photo and a few words.', [
        art(tape(360, 3), (380, 230), 20, 'washi tape'),
        art(p3, (560, 760), 3, 'Polaroid'), photo('Way 1', at((560, 760), 3, off3), wh3, 3, clips[1].at(1.0, wh3)),
        place(serif('1', 300), (150, 300), -4),
        art(doodle('icon', 0, 130, INK), (930, 260), 10, 'star'),
        text('[way one]', 64, at((560, 760), 3, (0, 380)), 3, box=None)])
    S2(s, cream, 'Way 2: a full-page photo.', [
        photo('Way 2 (fills the page)', (540, 720), (CW, CH), 0, clips[2].at(1.0, (CW, CH))),
        art(K.torn_strip(cream, 420, 5, 't'), (540, CH - 210 + 6), 0, 'torn paper'),
        place(serif('2', 260), (170, 1200), -4),
        text('[way two]', 72, (560, 1260), -2, box=None, align='left'),
        art(doodle('icon', 0, 120, INK), (930, 1150), -8, 'star')])
    p5, off5, wh5 = pol(560, 'pin-head-white')
    S2(s, butter, 'Way 3: save the most surprising one for last.', [
        art(doodle('burst', 3, 900, WHITE), (540, 760), 0, 'burst'),
        art(p5, (540, 760), -3, 'Polaroid'), photo('Way 3', at((540, 760), -3, off5), wh5, -3, clips[3].at(1.0, wh5)),
        place(serif('3', 260), (880, 300), 6),
        text('[way three]', 64, (540, 1300), 2)])
    S2(s, butter, 'Swap in your product photo and type its name and your keyword. ' + CAPTION, [
        art(K.round_card(440), (540, 560), 0, 'round paper'),
        photo('Your product', (540, 560), (440, 440), 0, clips[0].at(2.0, (440, 440)), shape='circle'),
        place(serif('[Product name]', 120), (540, 900)),
        place(serif('Comment', 150), (540, 1080)),
        text('"[KEYWORD]"', 74, (540, 1230), 2, box=INK, fg=WHITE, pill=True),
        art(doodle('arrow', 9, 170, INK), (250, 470), 0, 'arrow')])
    return s

def c02():
    import templates.t02 as T
    import storyboard_02 as S02
    clips = [Clip(n, t, 6.0) for n, t in T.SPEC['test_clips']]; ACC = T.ACCENT
    sage = K.fit_bg(K.C.paper((CW, CH), S02.BG[:3], seed=9))
    Pb = T.box_parts(); open_box, _ = crop_h(Pb['open'], 960); closed = Pb['closed_box']; bx0, by0, bx1, by1 = Pb['body_box']
    floor = ((bx0 + bx1) / 2, (by0 + by1) / 2 - (960 - CH / 2)); fw, fh = (bx1 - bx0) * 0.82, (by1 - by0) * 0.82
    env = K.C.shadow(S02.prop('envelope').resize((480, 276)), (8, 14), 14, 70); seal = K.C.shadow(S02.prop('wax-seal-thank-you').resize((200, 200)), (8, 16), 16, 70)
    pn = S02.prop('packing-peanut'); peanuts = []
    for i, col in enumerate(((176, 214, 172), (250, 232, 120), (250, 250, 246))):
        g_ = ImageOps.colorize(ImageOps.grayscale(pn.convert('RGB')), tuple(int(v * 0.7) for v in col), col).convert('RGBA'); g_.putalpha(pn.split()[3])
        peanuts.append(P.die_cut(scaled(g_, 150), 6))
    label = scaled(K.C.ship_label(), 360)
    def tape_words(c, rot, small, big, length=760):
        strip = K.C.washi(length, 230, 'gingham', (BUTTER, WHITE), seed=17, alpha=250)
        return [art(strip, c, rot, 'washi tape'), text(small, 46, at(c, rot, (0, -50)), rot, box=None),
                text(big, 92, at(c, rot, (0, 28)), rot, box=None, fg=ACC, font='bodoni')]
    s = []
    S2(s, sage, 'Hook. Swap in a photo of you picking the order. Edit [your shop] on the label.', [
        photo('Picking the order (bottom of the page)', (540, 1060), (CW, 760), 0, clips[0].at(1.0, (CW, 760))),
        art(K.C.washi(CW + 60, 70, 'stripes', (INK, WHITE), seed=4, alpha=250), (540, 680), 0, 'stripe tape'),
        art(label, (800, 380), 6, 'shipping label'), text('[Your shop]', 30, at((800, 380), 6, (-40, -105)), 6, box=None, align='left'),
        guide(FIRST_GUIDE)] + tape_words((330, 300), -3, 'packing', 'an order', 560))
    pts = [(170, 1150), (900, 1180), (300, 1300), (760, 1320), (540, 1240)]
    S2(s, sage, HOOK2 + 'No photo needed. Edit both [bracket] lines.', [
        art(scaled(closed, 760), (540, 800), -3, 'closed box')] + [art(peanuts[i % 3], p, i * 40, 'packing peanut') for i, p in enumerate(pts)] + [
        text('[ever wondered how\nyour order is packed?]', 76, (620, 210), -2, align='right'),
        text('[watch me pack it]', 62, (330, 1390), -2, align='left'),
        art(doodle('arrow', 0, 160, INK), (680, 1385), -2, 'arrow')])
    S2(s, sage, 'Swap in a photo of your product going into the box.', [
        art(open_box, (540, 720), 0, 'open box'),
        photo('Your product going in', floor, (fw, fh), 0, clips[1].at(1.0, (int(fw), int(fh))))] + tape_words((540, 200), 2, 'the goods', 'go in first'))
    S2(s, sage, 'Swap in a photo of the padding going in.', [
        photo('Padding (fills the page)', (540, 720), (CW, CH), 0, clips[1].at(2.5, (CW, CH)))] + [
        art(peanuts[i % 3], (90 + (i % 6) * 180 + (40 if i // 6 % 2 else 0), 1180 + (i // 6) * 110), i * 37, 'packing peanut') for i in range(18)] + tape_words((540, 220), -2, '+ a little', 'padding', 560))
    S2(s, sage, 'Swap in a photo of the extras you add (a note, tissue, a sticker).', [
        art(K.white_card((700, 860)), (540, 760), 2, 'photo border'), photo('The extras', (540, 760), (700, 860), 2, clips[2].at(1.0, (700, 860))),
        art(env, (720, 1230), -8, 'envelope'), art(seal, (760, 1250), 0, 'wax seal')] + tape_words((420, 230), -3, 'a little', 'extra', 520))
    lab2 = scaled(K.C.ship_label(), 300)
    S2(s, sage, 'No photo needed. Edit [your shop] on the label.', [
        art(scaled(closed, 800), (540, 820), 0, 'closed box'),
        art(K.C.washi(int(closed.height * 800 / closed.width) - 60, 120, 'dots', ((166, 206, 242), WHITE), seed=8, alpha=245).rotate(90, expand=True), (540, 820), 0, 'blue washi tape'),
        art(lab2, (640, 1080), -6, 'shipping label'), text('[Your shop]', 26, at((640, 1080), -6, (-35, -88)), -6, box=None, align='left')] + tape_words((540, 210), 2, 'sealed +', 'on its way', 620))
    S2(s, sage, 'Type your product name and keyword. ' + CAPTION, [
        art(scaled(closed, 620), (540, 1050), -8, 'closed box'),
        art(K.C.washi(980, 280, 'gingham', (BUTTER, WHITE), seed=11, alpha=250), (540, 330), -2, 'washi tape'),
        text('[Product name]', 110, at((540, 330), -2, (0, -10)), -2, box=None, fg=ACC, font='bodoni'),
        text('comment "[KEYWORD]"', 60, (540, 560), 2, box=ACC, fg=WHITE)])
    return s

def c03():
    import templates.t03 as T
    import storyboard_03 as S03
    clips = [Clip(n, t, 6.0) for n, t in T.SPEC['test_clips']]; cork = K.fit_bg(S03.cork())
    def polka(word, px):
        ls = T.letters(word, px); w = int(max(dx + im.width / 2 for im, dx in ls) - min(dx - im.width / 2 for im, dx in ls)) + 10
        h = max(im.height for im, _ in ls); out = Image.new('RGBA', (w, h), (0, 0, 0, 0)); x0 = min(dx - im.width / 2 for im, dx in ls)
        for i, (im, dx) in enumerate(ls):
            it = im.rotate(T.TILTS[i % len(T.TILTS)] * 0.5, resample=Image.BICUBIC); out.alpha_composite(it, (int(dx - im.width / 2 - x0), (h - it.height) // 2))
        return out
    def tape(words, px, c, rot):
        tw = max(ImageFont.truetype(S03.LABEL, px).getlength(w_) for w_ in words.split('\n'))
        return [art(T.tape_strip(int(tw + 1.6 * px), int(px * 1.75)), c, rot, 'label tape'), text(words, px, c, rot, box=None, fg=T.TAPE_TEXT)]
    def iphoto(w):
        ph, (x0, y0, x1, y1) = S03.instant_photo(None, w, window=True); sh = K.C.shadow(ph, (8, 14), 16, 95); pad = (sh.width - ph.width) // 2
        return sh, (pad + (x0 + x1) / 2 - sh.width / 2, pad + (y0 + y1) / 2 - sh.height / 2), (x1 - x0, y1 - y0), (pad + ph.width / 2 - sh.width / 2, pad + (y1 + ph.height) / 2 - sh.height / 2)
    cam, cs = S03.camera(1000); camsh = K.C.shadow(cam, (0, 24), 26, 90); cpad = (camsh.width - cam.width) // 2
    lx, ly, lr = [v * cs for v in S03.CAM_LENS]; lens_off = (cpad + lx - camsh.width / 2, cpad + ly - camsh.height / 2)
    pin = lambda col, d=70: K.C.shadow(S03.prop(f'pin-head-{col}').resize((d, d), Image.LANCZOS), (8, 12), 7, 110)
    s = []; cc = (540, 1080)
    S2(s, cork, 'Hook. Swap in a photo of the before for the camera lens. Edit the tape.', [
        art(camsh, cc, 0, 'instant camera'),
        photo('The before (in the lens)', (cc[0] + lens_off[0], cc[1] + lens_off[1]), (2 * lr, 2 * lr), 0, clips[0].at(1.0, (int(2 * lr), int(2 * lr))), shape='circle'),
        art(polka('before', 190), (540, 260), -2, 'before'),
        guide(FIRST_GUIDE)] + tape('[WATCH THIS TRANSFORMATION]', 40, (540, 450), -2))
    stack = [S03.prop('instant-photo-blank') for _ in range(4)]
    S2(s, cork, HOOK2 + 'No photo needed. Edit both [bracket] lines.', [
        art(K.C.shadow(scaled(st, 360), (8, 12), 14, 90), (380 + i * 110, 760 + (i % 2) * 90), (-14, 6, -4, 12)[i], 'instant photo') for i, st in enumerate(stack)] + [
        art(pin('blue'), (420, 600), 0, 'push pin'), art(pin('white'), (760, 680), 0, 'push pin'),
        text("[you won't believe\nthe after]", 84, (620, 220), -2, align='right'),
        text('[swipe for it]', 62, (300, 1330), -2, align='left'),
        art(doodle('arrow', 0, 160, INK), (600, 1325), -2, 'arrow')])
    ph3, off3, wh3, strip3 = iphoto(700)
    S2(s, cork, 'Swap in a photo of the before. Edit the words.', [
        art(ph3, (540, 760), -4, 'instant photo'), photo('The before', at((540, 760), -4, off3), wh3, -4, clips[0].at(2.0, wh3)),
        art(pin('blue', 80), at((540, 760), -4, (0, -ph3.height / 2 + 70)), 0, 'push pin'),
        text('before', 64, at((540, 760), -4, strip3), -4, box=None, fg=INK)] + tape('[THE BEFORE]', 46, (360, 1360), 3))
    kt = K.C.shadow(scaled(S03.prop('kitchen-timer'), 420), (8, 14), 14, 90)
    S2(s, cork, 'Swap in a photo of the work in progress. Edit the time.', [
        photo('The work (fills the page)', (540, 720), (CW, CH), 0, clips[1].at(1.0, (CW, CH))),
        art(kt, (860, 1220), -10, 'kitchen timer'),
        art(doodle('icon', 10, 110, WHITE), (180, 300), 0, 'sparkle')] + tape('[CLEANING IT]', 48, (380, 260), -3) + tape('[20 MIN]', 48, (330, 1250), 2))
    ph5, off5, wh5, strip5 = iphoto(820)
    S2(s, cork, 'Swap in a photo of the after.', [
        art(ph5, (540, 700), 3, 'instant photo'), photo('The after', at((540, 700), 3, off5), wh5, 3, clips[2].at(1.0, wh5)),
        art(polka('after', 190), (540, 1250), -2, 'after'),
        art(doodle('icon', 10, 120, WHITE), (130, 330), 0, 'sparkle'), art(doodle('icon', 8, 100, WHITE), (950, 1060), 0, 'sparkle')])
    pha, offa, wha, stra = iphoto(440)
    S2(s, cork, 'The before and the after, side by side. Edit the captions.', [
        x for xy, r, cl, cap, pc in (((290, 760), -5, clips[0], 'then', 'blue'), ((790, 820), 4, clips[2], 'now', 'white'))
        for x in (art(pha, xy, r, 'instant photo'), photo(f'The {cap}', at(xy, r, offa), wha, r, cl.at(1.0, wha)),
                  art(pin(pc), at(xy, r, (0, -pha.height / 2 + 50)), 0, 'push pin'), text(cap, 56, at(xy, r, stra), r, box=None))] + [
        art(doodle('arrow', 2, 200, WHITE), (540, 470), 0, 'arrow')] + tape('[SAME SPOT, 20 MIN LATER]', 40, (540, 1300), -2))
    php, offp, whp, _ = iphoto(520)
    S2(s, cork, 'Swap in a photo of your product. Type your keyword. ' + CAPTION, [
        art(scaled(camsh, 860), (540, 1300), 0, 'instant camera'),
        art(php, (540, 830), 0, 'instant photo'), photo('Your product', at((540, 830), 0, offp), whp, 0, clips[3].at(1.0, whp)),
        art(polka('Comment', 135), (540, 330), -2, 'Comment')] + tape('[WANT THE PRODUCT?]', 40, (540, 160), -2) + tape('"[KEYWORD]"', 76, (540, 500), 2))
    return s

# ======================================================================================================================
# Batch A (2026-10-19): 04, 05, 06, 07, 13, each in its Reel's world (motion_NN.py setup): same stage, palette,
# objects with play and her doodles; built-in words as live DM Serif (outlined in Canva).
# ======================================================================================================================
from motion_b2 import torn_band
import collage as Cg

def band_bg(base, pattern, c0, c1, h, seed, edge, y):
    """A slide stage with a torn band of her doodle pattern (as on the Reel's stage), placed for the 1440 slide."""
    bg = K.fit_bg(base); pat = ImageOps.colorize(ImageOps.grayscale(S.raw('doodles', pattern)), c0, c1).convert('RGBA')
    if edge in ('t', 'b'): bg.alpha_composite(torn_band(pat, (CW + 40, h), seed, edge, 18), (-20, y))
    else: bg.alpha_composite(torn_band(pat, (h, CH + 40), seed, edge, 18), (y, -20))
    return bg

def film_frame(n, w, h):
    """A blank film frame (white border, frame number in marker): (art, photo-window offset, window size)."""
    c = Image.new('RGBA', (w + 28, h + 84), (252, 250, 245, 255)); K.ImageDraw.Draw(c).text((24, 38), f'0{n}', font=S.F(S.HAND, 50), fill=INK, anchor='lm')
    sh = Cg.shadow(c, (6, 10), 10, 90); pad = (sh.width - c.width) // 2
    return sh, (pad + 14 + w / 2 - sh.width / 2, pad + 70 + h / 2 - sh.height / 2), (w, h)

def c04():
    PAN_TILT = ((0.167, 0.745), (0.84, 0.64))   # motion_04 PAN['tilt'] (importing motion_04 swaps the lettering font)
    A, A2, B, B2, pick = Clip('IMG_1422', 7.0, 6.0), Clip('IMG_1420', 0.5, 6.0), Clip('IMG_1418', 2.0, 6.0), Clip('IMG_1464', 1.0, 6.0), Clip('IMG_1401', 0.5, 6.0)
    stage = band_bg(S.raw('images', 'Soft veined white marble texture-1.png'), 'Hand-drawn wavy line pattern-20.png', WINE, BLUE, 300, 7, 't', CH - 280)
    level = K.thing('Level vintage brass balance scale-105.png', 900, 'smalldots', WINE, scale=0.25, strength=0.5)
    tilt = K.thing('Tilted brass balance scale-124.png', 920, 'smalldots', WINE, scale=0.25, strength=0.5)
    notes = [P.sticky('', 330, pin=pn) for pn in ('pin-head-black', 'pin-head-cream')]
    ph, scr = K.device_art(500); s = []
    S2(s, stage, 'Hook. Swap in a photo of version A (left) and version B (right). Edit their names.', [
        art(K.torn_card((440, 640), 3), (290, 820), -3, 'torn paper'), photo('Version A', (290, 820), (440, 640), -3, A.at(0.5, (440, 640))),
        art(K.torn_card((440, 640), 6), (790, 860), 3, 'torn paper'), photo('Version B', (790, 860), (440, 640), 3, B.at(0.5, (440, 640))),
        text('A', 96, (150, 520), -3, box=WINE, fg=WHITE, pill=True), text('B', 96, (930, 560), 3, box=BLUE, pill=True),
        art(word('which one', 160, italic_last=False), (540, 220), -2, 'which one'),
        art(word('are you?', 160), (560, 380), -2, 'are you?'),
        guide(FIRST_GUIDE)])
    S2(s, stage, HOOK2 + 'No photo needed. Edit both [bracket] lines.', [
        art(doodle('burst', 2, 900, BLUE), (540, 860), 0, 'burst'),
        art(level, (540, 900), 0, 'balance scale'),
        text('[copper or\nmint?]', 96, (620, 230), -2, align='right'),
        text('[help me pick]', 62, (300, 1320), -2, align='left'),
        art(doodle('arrow', 0, 170, WINE), (620, 1315), -2, 'arrow')])
    nA = (300, 1130)
    S2(s, stage, 'Version A: swap in its photo. Edit its name and the note.', [
        photo('Version A (fills the page)', (540, 720), (CW, CH), 0, A.at(1.0, (CW, CH))),
        text('A: [Copper. Cordless.]', 62, (540, 230), -2, box=WINE, fg=WHITE),
        art(notes[0], nA, -6, 'sticky note'), K.note_text(nA, -6, '[so light]', 54),
        art(doodle('arrow', 0, 190, WHITE), (560, 1000), 20, 'arrow')])
    S2(s, stage, 'Version B: swap in its photo. Edit its name.', [
        art(doodle('burst', 3, 860, BLUE), (540, 700), 0, 'burst'),
        art(K.round_card(640), (540, 700), 0, 'round paper'),
        photo('Version B', (540, 700), (640, 640), 0, B2.at(1.0, (640, 640)), shape='circle'),
        text('B: [Mint. Steam-clean.]', 62, (540, 1190), 2, box=INK, fg=WHITE)])
    tc = (540, 1000); pans = [(tc[0] + (px - 0.5) * tilt.width, tc[1] + (py - 0.5) * tilt.height - 40) for px, py in PAN_TILT]
    S2(s, stage, 'One photo of each version sits on the scale. Edit the line and both notes.', [
        art(tilt, tc, 0, 'balance scale')] + [
        x for i, (p, cl) in enumerate(zip(pans, (A2, B))) for x in (
            art(K.round_card(250, 12), (p[0], p[1] - 150), 0, 'round paper'), photo(f'Version {"AB"[i]}', (p[0], p[1] - 150), (250, 250), 0, cl.at(1.0, (250, 250)), shape='circle'))] + [
        text('[two very different\nmoods]', 72, (380, 250), -2, align='left'),
        text('A', 70, (pans[0][0], pans[0][1] - 320), 0, box=WINE, fg=WHITE, pill=True), text('B', 70, (pans[1][0], pans[1][1] - 320), 0, box=BLUE, pill=True)])
    pc = (700, 800)
    S2(s, stage, 'Swap in a screenshot of your poll or comments for the phone screen. Edit the line.', [
        art(ph, pc, 4, 'phone'), dict(K.on_screen(pc, ph, scr, pick.at(1.0, (500, 1000)), 'Your poll (screenshot)'), rot=4),
        text("even my followers\ncan't pick", 66, (400, 260), -3, align='left'),
        art(doodle('arrow', 9, 200, WINE), (250, 640), 0, 'arrow'),
        art(notes[1], (240, 1120), 5, 'sticky note'), K.note_text((240, 1120), 5, '[A: 52%\nB: 48%]', 50, align='left')])
    S2(s, stage, 'Swap in a photo of each version. Type your shop line. ' + CAPTION, [
        art(K.white_card((400, 520)), (290, 1000), -4, 'photo border'), photo('Version A', (290, 1000), (400, 520), -4, A.at(2.0, (400, 520))),
        art(K.white_card((400, 520)), (790, 1020), 4, 'photo border'), photo('Version B', (790, 1020), (400, 520), 4, B.at(2.0, (400, 520))),
        art(word('Comment', 200), (540, 230), 0, 'Comment'),
        text('"A" or "B"', 76, (540, 400), 2, box=WINE, fg=WHITE, pill=True),
        text('[both in my shop]', 60, (540, 530), -2, box=BLUE)])
    return s

def c05():
    det = [Clip(n, t, 6.0) for n, t in (('IMG_1414', 4.0), ('IMG_1421', 5.0), ('IMG_1457', 1.5), ('IMG_1459', 0.5))]; whole = Clip('IMG_1422', 3.0, 6.0)
    pc_ = S.raw('images', 'Blank vintage cream postcard-111.png'); w_, h_ = pc_.size; pc_ = pc_.crop((int(w_ * 0.1), int(h_ * 0.12), int(w_ * 0.9), int(h_ * 0.88)))
    sheet = band_bg(pc_, 'Hand-drawn black dot pattern-21.png', (226, 200, 118), BUTTER, 470, 3, 'b', -20)
    plain = K.fit_bg(pc_); ph, scr = K.device_art(540); fine = P.sticky('', 360, pin='pin-head-black')
    num = lambda n, px=64: P.sticker(f'0{n}', px, INK, WHITE, 'circle')
    tag = P.die_cut(P.raw_cut('Blank kraft hang tag with twine-116.png', 520), 8); s = []
    S2(s, sheet, 'Hook. Swap in a photo of your product. Move the circle onto a detail.', [
        art(K.white_card((860, 860)), (540, 920), -2, 'photo border'),
        photo('Your product', (540, 920), (860, 860), -2, whole.at(0.5, (860, 860))),
        art(doodle('frame', 0, 420, INK), (700, 900), 0, 'circle'),
        art(word('details', 210, WINE, edge=WHITE, italic_last=False), (360, 170), -2, 'details'),
        text("you'd miss in a photo", 60, (560, 340), -2, box=INK, fg=WHITE),
        guide(FIRST_GUIDE)])
    fr = [film_frame(i + 1, 360, 450) for i in range(2)]
    S2(s, sheet, HOOK2 + 'Two close-ups go in the film frames. Edit both [bracket] lines.', [
        x for i, ((fa, off, wh), xy, r) in enumerate(zip(fr, ((340, 830), (740, 900)), (-5, 4))) for x in (
            art(fa, xy, r, 'film frame'), photo(f'Detail {i + 1}', at(xy, r, off), wh, r, det[i].at(1.0, wh)))] + [
        text('[look closer]', 96, (620, 230), -2, align='right'),
        text('[4 things you\nwould miss]', 62, (330, 1330), -2, align='left'),
        art(doodle('arrow', 0, 170, INK), (720, 1340), -2, 'arrow')])
    pcn = (600, 820)
    S2(s, plain, 'Swap in a screenshot of your listing photo for the phone screen. Edit the note.', [
        art(ph, pcn, -5, 'phone'), dict(K.on_screen(pcn, ph, scr, whole.at(1.0, (540, 1080)), 'Your listing photo (screenshot)'), rot=-5),
        text('the photo:', 80, (300, 220), -3, align='left'),
        art(fine, (230, 1150), -8, 'sticky note'), K.note_text((230, 1150), -8, 'looks...\nfine?', 58)])
    S2(s, plain, 'Detail 1: a close-up and its name.', [
        art(K.round_card(700), (540, 700), 0, 'round paper'),
        photo('Detail 1, close up', (540, 700), (700, 700), 0, det[0].at(1.0, (700, 700)), shape='circle'),
        art(doodle('frame', 0, 820, INK), (540, 700), 0, 'circle'),
        art(num(1, 80), (870, 380), 0, 'number sticker'),
        art(word('up close', 170, WINE, edge=WHITE), (330, 190), -3, 'up close'),
        text('[brushed copper finish]', 62, (540, 1230), 2, box=INK, fg=WHITE)])
    fr2 = [film_frame(i + 2, 360, 440) for i in range(2)]
    S2(s, plain, 'Details 2 and 3: a close-up and a name for each.', [
        x for i, ((fa, off, wh), xy, r, nm, nxy) in enumerate(zip(fr2, ((300, 470), (770, 990)), (-3, 4), ('[see-through' + chr(10) + 'dust bin]', '[one-touch controls]'), ((270, 860), (700, 1340))))
        for x in (art(fa, xy, r, 'film frame'), photo(f'Detail {i + 2}', at(xy, r, off), wh, r, det[i + 1].at(1.0, wh)), text(nm, 54, nxy, (-2, 2)[i], box=INK, fg=WHITE))] + [
        art(doodle('arrow', 9, 180, INK), (760, 380), 0, 'arrow')])
    tc = (800, 980)
    S2(s, sheet, 'Detail 4: a full-page photo. Edit the tag.', [
        photo('Detail 4 (fills the page)', (540, 720), (CW, CH), 0, det[3].at(1.0, (CW, CH))),
        art(tag, tc, 8, 'kraft tag'), art(num(4), at(tc, 8, (0, -30)), 8, 'number sticker'),
        text('[LED head\nshows\nthe dust]', 46, at(tc, 8, (0, 130)), 8, box=None),
        art(doodle('arrow', 0, 190, WHITE), (420, 900), -20, 'arrow')])
    S2(s, sheet, 'Swap in a photo of your product. Type its name and your keyword. ' + CAPTION, [
        text('now you know', 64, (540, 120), -2, box=None),
        art(word('Comment', 200, WINE, edge=WHITE), (540, 270), 0, 'Comment'),
        text('"[KEYWORD]"', 76, (540, 430), 2, box=INK, fg=WHITE, pill=True),
        art(K.white_card((620, 700)), (540, 1000), 3, 'photo border'),
        photo('Your product', (540, 1000), (620, 700), 3, whole.at(1.0, (620, 700))),
        text('[Product name]', 56, (800, 1340), -3, box=BUTTER)])
    return s

def loading_bar(w=760, h=84, p=0.0):
    """#06's loading bar without its number (the percent is live text on top)."""
    im = Image.new('RGBA', (w + 16, h + 16), (0, 0, 0, 0)); d = K.ImageDraw.Draw(im)
    d.rounded_rectangle((8, 8, w + 8, h + 8), h // 2, fill=BUTTER + (255,), outline=INK + (255,), width=6)
    if p > 0.01: d.rounded_rectangle((14, 14, 14 + max(h, (w - 12) * p), h + 2), (h - 12) // 2, fill=WINE + (255,))
    return Cg.shadow(im, (4, 8), 8, 90)

def c06():
    raw, s1, s2, s3, done, done2 = (Clip(n, t, 6.0) for n, t in (('IMG_1393', 0.5), ('IMG_1387', 1.5), ('IMG_1389', 2.5), ('IMG_1390', 2.0), ('IMG_1391', 0.5), ('IMG_1394', 1.0)))
    cc = ImageOps.grayscale(S.raw('images', 'Light gray concrete mineral texture-4.png'))
    bench = K.fit_bg(ImageOps.colorize(ImageOps.autocontrast(cc), (214, 192, 150), (246, 236, 214)))
    glass = lambda w: K.thing('Classic wooden hourglass with flowing sand-238.png', w, 'smalldots', WINE, scale=0.3, strength=0.6)
    def bar(p, c=(480, 150), w=680):
        im = loading_bar(w, 76, p); return [art(im, c, 0, 'loading bar'), text(f'{int(p * 100)}%', 54, (c[0] + w / 2 + 110, c[1]), 0, box=BUTTER)]
    ph, scr = K.device_art(440); later = P.sticky('', 420, pin='pin-head-black'); s = []
    S2(s, bench, 'Hook. Swap in a photo of you making it. Edit [smoothie].', [
        photo('Making it (fills the page)', (540, 720), (CW, CH), 0, s1.at(0.5, (CW, CH)))] + bar(0.0) + [
        text('making one [smoothie]', 60, (540, 1000), -2, box=INK, fg=WHITE),
        art(word('start to', 160, BUTTER, edge=WINE, italic_last=False), (480, 1150), -2, 'start to'),
        art(word('finish', 230, BUTTER, edge=WINE, italic_last=False), (560, 1320), -2, 'finish'),
        guide(FIRST_GUIDE, (540, 260))])
    S2(s, bench, HOOK2 + 'No photo needed. Edit both [bracket] lines.', [
        art(doodle('burst', 2, 820, WINE), (540, 820), 0, 'burst'),
        art(glass(460), (540, 840), -6, 'hourglass'),
        text('[how long does\none really take?]', 84, (620, 230), -2, align='right'),
        text('[watch it get made]', 62, (360, 1330), -2, align='left'),
        art(doodle('arrow', 0, 170, WINE), (760, 1325), -2, 'arrow')])
    S2(s, bench, 'Swap in a photo of your raw materials. Edit the line.', bar(0.0) + [
        text('it starts as', 76, (330, 330), -3, align='left'),
        art(K.torn_card((620, 760), 4), (440, 870), -4, 'torn paper'),
        photo('Raw materials', (440, 870), (620, 760), -4, raw.at(1.0, (620, 760))),
        art(glass(300), (880, 1050), 6, 'hourglass'),
        text('[a pile of fruit]', 62, (440, 1340), 2, box=INK, fg=WHITE)])
    S2(s, bench, 'Stage 1: swap in its photo and name it.', [
        photo('Stage 1 (fills the page)', (540, 720), (CW, CH), 0, s1.at(1.5, (CW, CH)))] + bar(0.25) + [
        text('[stage one: prep]', 64, (380, 1250), -2, box=INK, fg=WHITE, align='left'),
        art(doodle('arrow', 0, 190, WHITE), (700, 1050), 30, 'arrow')])
    nc = (290, 520)
    S2(s, bench, 'Stage 2: swap in its photo. Edit the note and the stage name.', bar(0.5) + [
        art(K.white_card((640, 820)), (640, 860), 3, 'photo border'),
        photo('Stage 2', (640, 860), (640, 820), 3, s2.at(1.0, (640, 820))),
        art(later, nc, -6, 'sticky note'), K.note_text(nc, -6, '[20 minutes\nlater]', 56),
        art(P.sticker('>> 2x', 70, INK, WHITE), (880, 470), 8, '2x sticker'),
        text('[stage two: mix]', 62, (540, 1340), 2, box=INK, fg=WHITE)])
    S2(s, bench, 'Stage 3: swap in its photo (in the arch). Name it.', bar(0.75) + [
        art(K.white_card((640, 860)), (540, 780), 0, 'photo border'),
        photo('Stage 3', (540, 780), (620, 840), 0, s3.at(1.0, (620, 840)), shape='arch'),
        text('almost...', 76, (300, 1250), -3, box=None, align='left'),
        text('[stage three: blend]', 60, (640, 1350), 2, box=INK, fg=WHITE)])
    S2(s, bench, 'The finished one: swap in its photo.', [
        photo('Finished (fills the page)', (540, 720), (CW, CH), 0, done.at(1.0, (CW, CH)))] + bar(1.0) + [
        art(doodle('tick', 0, 200, WINE), (960, 300), 0, 'tick'),
        art(doodle('burst', 2, 760, BUTTER), (540, 1180), 0, 'burst'),
        art(word('finished.', 200, WINE, edge=WHITE, italic_last=False), (540, 1180), -2, 'finished.')])
    pc = (680, 920)
    S2(s, bench, 'Swap in a screenshot of your shop for the phone screen. Type your keyword. ' + CAPTION, [
        art(ph, pc, 4, 'phone'), dict(K.on_screen(pc, ph, scr, done2.at(1.0, (440, 880)), 'Your shop (screenshot)'), rot=4),
        art(word('Comment', 190, WINE, edge=WHITE), (540, 190), 0, 'Comment'),
        text('"[KEYWORD]"', 72, (540, 350), 2, box=INK, fg=WHITE, pill=True),
        text('[handmade in\nAustin]', 56, (250, 1150), -2, box=BUTTER, align='left'),
        art(doodle('arrow', 9, 180, WINE), (270, 820), 0, 'arrow')])
    return s

def c07():
    alone, hand, use, set_ = Clip('IMG_1471', 0.5, 6.0), Clip('IMG_1471', 6.0, 6.0), Clip('IMG_1474', 10.0, 6.0), Clip('IMG_1522', 0.0, 4.0)
    grid = band_bg(S.raw('images', 'White pegboard grid texture-5.png'), 'Wobbly hand-drawn black and white checkerboard-24.png', INK, BLUE, 230, 9, 'l', CW - 180)
    plain = K.fit_bg(S.raw('images', 'White pegboard grid texture-5.png'))
    phone_b = K.thing('Graphite smartphone back view-41.png', 300, 'smalldots', INK, scale=0.25, strength=0.5)
    mug = K.thing('Warm white ceramic coffee mug-140.png', 360, 'stripes', INK, scale=0.35, strength=0.7)
    ruler = K.thing('Pale wooden ruler on white-153.png', 900, None, None, label=P.sticker('INCHES', 34, INK), label_at=(0.82, 0.5))
    ph, scr = K.device_art(400); s = []
    S2(s, grid, 'Hook. The same product photo three times, at three sizes. Swap in yours.', [
        art(K.white_card((220, 260), 12), (230, 900), -4, 'photo border'), photo('Your product (small)', (230, 900), (220, 260), -4, alone.at(1.0, (220, 260))),
        art(K.white_card((380, 460), 14), (590, 1000), 3, 'photo border'), photo('Your product (medium)', (590, 1000), (380, 460), 3, alone.at(1.0, (380, 460))),
        text('this big?', 50, (230, 1100), -4), text('this big?', 50, (590, 1300), 3),
        art(word('how big', 180, BLUE, edge=INK, italic_last=False), (460, 260), -2, 'how big'),
        text('is it really?', 84, (450, 450), -2, box=INK, fg=WHITE),
        guide(FIRST_GUIDE)])
    S2(s, grid, HOOK2 + 'No photo needed. Edit the size labels and both [bracket] lines.', [
        art(phone_b, (330, 860), -8, 'phone'), art(mug, (660, 900), 4, 'mug'),
        text('[6 in phone]', 48, (330, 1130), -4, box=INK, fg=WHITE), text('[mug]', 48, (660, 1130), 3, box=INK, fg=WHITE),
        text('[photos lie\nabout size]', 92, (600, 230), -2, align='right'),
        text("[here's the real size]", 60, (360, 1330), -2, align='left'),
        art(doodle('arrow', 0, 160, INK), (760, 1325), -2, 'arrow')])
    S2(s, grid, 'In your hand: a full-page photo. Move the arrows to the edges of your product. Edit the line.', [
        photo('In your hand (fills the page)', (540, 720), (CW, CH), 0, hand.at(1.0, (CW, CH))),
        art(doodle('arrow', 5, 560, WHITE), (540, 470), 0, 'measuring arrow'), art(doodle('arrow', 6, 150, WHITE), (870, 760), 0, 'measuring arrow'),
        text('in my hand', 72, (320, 230), -3, box=BLUE, align='left'),
        text('[fits in one hand]', 62, (540, 1250), 2, box=INK, fg=WHITE)])
    pc = (290, 800)
    S2(s, plain, 'Left: a screenshot of your shop photo. Right: the real thing, at the same height.', [
        art(ph, pc, -3, 'phone'), dict(K.on_screen(pc, ph, scr, alone.at(1.0, (400, 800)), 'Your shop photo (screenshot)'), rot=-3),
        art(K.white_card((400, 640)), (770, 800), 3, 'photo border'), photo('In real life', (770, 800), (400, 640), 3, use.at(1.0, (400, 640))),
        text('on screen', 54, (290, 1270), -3, box=INK, fg=WHITE), text('in real life', 54, (770, 1240), 3, box=BLUE),
        art(doodle('arrow', 2, 230, INK), (540, 330), 0, 'arrow')])
    S2(s, grid, 'In use: swap in its photo. Edit the line.', [
        art(K.torn_card((700, 900), 5), (460, 760), -2, 'torn paper'),
        photo('In use', (460, 760), (700, 900), -2, use.at(2.0, (700, 900))),
        art(mug, (880, 1170), 6, 'mug'),
        text('[the size of a\nwater bottle]', 60, (360, 1330), 2, box=INK, fg=WHITE, align='left')])
    S2(s, plain, 'Swap in a photo of your product on a plain surface. Type its exact size.', [
        art(ruler, (540, 1000), 0, 'ruler'),
        art(K.white_card((560, 520), 14), (540, 720), -2, 'photo border'), photo('Your product', (540, 720), (560, 520), -2, alone.at(2.0, (560, 520))),
        art(word('exactly', 180, BLUE, edge=INK), (320, 220), -3, 'exactly'),
        text('[9 x 4 in]', 130, (560, 1250), -2, box=INK, fg=WHITE)])
    S2(s, grid, 'Swap in your product photo. Type your keyword. ' + CAPTION, [
        art(K.white_card((640, 780)), (450, 960), 3, 'photo border'), photo('Your product', (450, 960), (640, 780), 3, set_.at(1.0, (640, 780))),
        art(word('Comment', 200, BLUE, edge=INK), (450, 240), 0, 'Comment'),
        text('"[SIZE]"', 76, (450, 410), 2, box=INK, fg=WHITE, pill=True),
        text('[exact size + where to buy]', 52, (450, 1400 - 40), -2, box=BLUE)])
    return s

def c13():
    CUBES = ('Engraved wooden number one cube-45.png', 'Natural Wooden Cube with Engraved 2-46.png', 'Wooden cube with engraved number 3-50.png')   # as motion_13
    STEPS = ('1. [rinse the pad]', '2. [unwind + plug in]', '3. [glide]')
    prod, s1, s2, s3, res, cta = (Clip(n, t, 6.0) for n, t in (('IMG_1464', 1.0), ('IMG_1430', 0.5), ('IMG_1429', 5.0), ('IMG_1423', 2.0), ('IMG_1432', 1.5), ('IMG_1375', 1.0)))
    oak = band_bg(S.raw('images', 'Light oak wood grain texture-2.png'), 'Playful hand-painted black polka dots-12.png', WINE, PINK, 260, 11, 't', CH - 240)
    plain = K.fit_bg(S.raw('images', 'Light oak wood grain texture-2.png'))
    pats = (('stripes', WINE), ('dots', INK), ('smalldots', WINE))
    cube = lambda i, w: K.thing(CUBES[i], w, pats[i][0], pats[i][1], scale=0.3, strength=0.45, seed=i)
    card = P.die_cut(S.card('images', 'Blank Three-Line Recipe Card-56.png', 900), 8)
    done = P.sticky('', 400, pin='pin-head-black'); s = []
    S2(s, oak, 'Hook. Swap in a photo of your product. Edit [your steam mop].', [
        photo('Your product (fills the page)', (540, 720), (CW, CH), 0, prod.at(0.5, (CW, CH))),
        art(cube(0, 200), (900, 640), -8, 'number cube'), art(cube(1, 200), (900, 830), 6, 'number cube'), art(cube(2, 200), (900, 1020), -4, 'number cube'),
        text('how to use', 72, (360, 220), -3, box=PINK, align='left'),
        text('[your steam mop]', 60, (380, 340), 2, box=INK, fg=WHITE, align='left'),
        art(word('in 3 steps', 160, PINK, edge=WINE), (440, 1080), -2, 'in 3 steps'),
        guide(FIRST_GUIDE)])
    cc = (540, 800)
    S2(s, plain, HOOK2 + 'No photo needed. Edit both [bracket] lines.', [
        art(card, cc, -2, 'recipe card'),
        art(cube(0, 220), (230, 1150), -10, 'number cube'), art(cube(1, 220), (520, 1200), 5, 'number cube'), art(cube(2, 220), (810, 1140), -6, 'number cube'),
        text('[just got one?]', 96, (620, 230), -2, align='right'),
        text('[3 steps, that is all]', 62, (360, 1370), -2, align='left'),
        art(doodle('arrow', 0, 160, WINE), (760, 1365), -2, 'arrow'),
        text('[here is how to\nuse it]', 60, at(cc, -2, (0, -10)), -2, box=None)])
    S2(s, oak, 'Step 1: swap in its photo and name it.', [
        photo('Step 1 (fills the page)', (540, 720), (CW, CH), 0, s1.at(1.0, (CW, CH))),
        art(cube(0, 220), (160, 200), -8, 'number cube'),
        text('1. [rinse the pad]', 64, (420, 1240), -2, box=INK, fg=WHITE, align='left'),
        art(doodle('arrow', 0, 190, WINE), (700, 1060), 30, 'arrow')])
    S2(s, plain, 'Step 2: a close-up. Move the circle onto the click.', [
        art(K.round_card(680), (540, 700), 0, 'round paper'),
        photo('Step 2, close up', (540, 700), (680, 680), 0, s2.at(1.0, (680, 680)), shape='circle'),
        art(doodle('frame', 0, 300, WINE), (650, 820), 0, 'circle'),
        art(cube(1, 240), (190, 1170), 6, 'number cube'),
        text('2. [unwind + plug in]', 62, (620, 1220), 2, box=WINE, fg=WHITE)])
    S2(s, oak, 'Step 3: swap in its photo. Name it.', [
        art(K.white_card((700, 860)), (560, 700), 3, 'photo border'),
        photo('Step 3', (560, 700), (700, 860), 3, s3.at(1.0, (700, 860))),
        art(doodle('arrow', 7, 520, WINE), (560, 860), 0, 'marker path'),
        art(cube(2, 230), (170, 280), -6, 'number cube'),
        text('3. [glide]', 66, (400, 1250), -2, box=INK, fg=WHITE, align='left')])
    nc = (290, 1120)
    S2(s, oak, 'The result: a full-page photo. Edit the note.', [
        photo('The result (fills the page)', (540, 720), (CW, CH), 0, res.at(1.0, (CW, CH))),
        art(doodle('burst', 2, 640, PINK), (640, 260), 0, 'burst'),
        art(word('the result', 160, PINK, edge=WINE, italic_last=False), (640, 260), -2, 'the result'),
        art(done, nc, -5, 'sticky note'), K.note_text(nc, -5, 'done in\n[2 minutes]', 54)])
    rc = (540, 470); rtop = rc[1] - card.height / 2
    S2(s, plain, 'Recap: the three step photos sit on the cubes. Edit the steps on the card.', [
        art(card, rc, -1, 'recipe card')] + [
        text(t, 52, (230 + K.mfont(52).getlength(t) / 2, rtop + 150 + i * 90), -1, box=None, align='left') for i, t in enumerate(STEPS)] + [
        x for i, (cl, xc) in enumerate(zip((s1, s2, s3), (220, 540, 860))) for x in (
            art(cube(i, 200), (xc, 1260), (-6, 4, -3)[i], 'number cube'),
            art(K.round_card(240, 12), (xc, 1010), 0, 'round paper'), photo(f'Step {i + 1}', (xc, 1010), (240, 240), 0, cl.at(1.0, (240, 240)), shape='circle'))] + [
        text("that's it.", 80, (540, 820), -2, box=PINK)])
    S2(s, oak, 'Swap in a photo of your product. Type its name and your keyword. ' + CAPTION, [
        art(K.white_card((600, 720)), (540, 900), -3, 'photo border'), photo('Your product', (540, 900), (600, 720), -3, cta.at(1.0, (600, 720))),
        art(word('Comment', 200, PINK, edge=WINE), (540, 220), 0, 'Comment'),
        text('"[KEYWORD]"', 76, (540, 390), 2, box=WINE, fg=WHITE, pill=True),
        text('[Product name]', 56, (780, 1300), -3, box=INK, fg=WHITE)])
    return s

RECIPES = {'01': c01, '02': c02, '03': c03, '04': c04, '05': c05, '06': c06, '07': c07, '13': c13, '09': c09, '08': c08, '10': c10, '12': c12, '20': c20, '22': c22, '23': c23, 'h2': ch2, 'h3': ch3, 'h5': ch5, 'h6': ch6}

HEX = lambda c: '#%02X%02X%02X' % tuple(c[:3])
CNAME = {WINE: 'wine', PINK: 'pink', BUTTER: 'butter', BLUE: 'light blue', WHITE: 'white', INK: 'ink', S7.DEEP: 'deep blue'}
ARTWORK_WORDS = {'03': 'before, after and Comment (polka-dot letters)', 'h2': 'BATTY, TOP 3, about and the numbers', 'h3': 'CAUGHT and COMMENT (cut-out letters)', 'h5': 'TRICK, or TREAT?, TREAT and COMMENT (taffy letters)'}

def outline_md(tid, outlines):
    """The Canva step before the template link: which live words get Effects > Outline, in which colour."""
    out = [f'## {tid} {TITLES[tid]}', '']
    if tid in ARTWORK_WORDS: out += [f'Nothing to do: {ARTWORK_WORDS[tid]} stay artwork (pattern-filled lettering in fonts Canva does not have).', '']
    elif not outlines: out += ['Nothing to do: the built-in words are live Bodoni FLF with no outline, as in the Reel.', '']
    for slide, lt in outlines:
        e = lt['edge']; out.append(f'- Slide {slide}: **{lt["words"]}** ({CNAME.get(tuple(lt["fill"]), HEX(lt["fill"]))} {HEX(lt["fill"])}): '
                                   f'Outline in {CNAME.get(tuple(e), HEX(e))} {HEX(e)}, thin')
    return out + ['']

def main():
    md = ['# Canva: outlines to add before making each template link', '',
          'Canva drops text outlines when it imports a .pptx, but keeps an Outline effect in a template link. For each',
          'carousel: import the .pptx, select each word below, Effects > Outline, set the colour (type the hex), keep it',
          'thin (similar to the previews), then Share > Template link. The words are live text, so buyers can still change them.', '']
    for tid in sys.argv[1:]:
        ss = RECIPES[tid](); name = f'Template {tid} - {TITLES[tid]} - Carousel'
        outl = K.build(ss, S.E.PACK / DIRS[tid] / 'carousel', name, S.E.PACK / 'build' / '.cache' / f'carousel{tid}'); print('done', tid, len(ss), 'slides')
        md += outline_md(tid, outl); (S.E.PACK / DIRS[tid] / 'carousel' / 'canva-outline-list.md').write_text('\n'.join(md[:6] + outline_md(tid, outl)), encoding='utf-8')
    allmd = md[:6]                                                # the combined list: every carousel's own list, in pack order
    for tid in RECIPES:
        f = S.E.PACK / DIRS[tid] / 'carousel' / 'canva-outline-list.md'
        if f.exists(): allmd += f.read_text(encoding='utf-8').split('\n')[6:]
    (S.E.PACK / 'canva-outline-list.md').write_text('\n'.join(allmd), encoding='utf-8')

if __name__ == '__main__':
    main()
