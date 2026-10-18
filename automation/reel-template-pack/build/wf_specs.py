"""Plan specs for the physical pack's unfinished templates (drawn by build/wireframe_physical.py).
Each template: its own world, 5 to 6 beats, every image by exact file name (assets/props/source/...).
Coordinates are Reel pixels (1080 x 1920). Words in [brackets] are the buyer's (editable); other words are artwork.
Beat fields: bg, opening (where the footage goes), action (the ONE main action), doodles, carry (layer carried into
the next beat), out (transition out), text.
"""
VERSION = 1
ORDER = ['04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '23', '24', '25']

# moves already used by approved templates (FRAMEWORK.md table) and the physical chat's live plans
EARLIER = {'Polaroids pinned, growing to fill the frame': ['01'], 'Peanut drop-in flood': ['02'], 'Box flaps fold shut': ['02'],
           'Shipping label typing in': ['02'], 'Washi tape zips a seam': ['02'], 'Instant camera prints the after photo': ['03'],
           'Torn reveal / torn edge split': ['22'], 'Dive into an element until it is the next clip': ['11', '20']}

I, FA, PH, TE, DO = 'images/', 'fall/', 'physical/', 'tech/', 'doodles/'
INK, CREAM, WHITE = (24, 22, 26), (246, 238, 222), (255, 255, 255)
FULL = (0, 0, 1080, 1920)

def bg(n, **kw): return ('bg', n, kw)
def pat(n, dark, light, box=FULL, scale=0.35): return ('pat', n, dark, light, box, scale)
def tile(n, box, **kw): return ('tile', n, box, kw)
def clip(box, label, **kw): return ('clip', box, label, kw)
def full(label, **kw): return ('clip', FULL, label, kw)
def strips(box, n, la, lb, ta, tb, **kw): return ('strips', box, n, la, lb, ta, tb, kw)
def cut(n, c, w, **kw): return ('cut', n, c, w, kw)
def dev(n, c, w, holes, **kw): return ('device', n, c, w, holes, kw)
def scr(n, c, w, label, **kw): return ('screen', n, c, w, label, kw)
def word(t, c, px, **kw): return ('word', t, c, px, kw)
def edit(t, c, px, **kw): return ('edit', t, c, px, kw)
def dd(sheet, i, c, w, **kw): return ('dd', sheet, i, c, w, kw)
def mv(a, b, label=''): return ('move', a, b, label)
def shade(box, col, al): return ('shade', box, col, al)
def paper(t, c, px, **kw): return edit(t, c, px, fill=kw.pop('fill', INK), edge=None, edge_w=0, **kw)   # editable words printed on paper

T = {}

# ---------------------------------------------------------------------------------------------------------------------
BLUSH, SAGE = (226, 150, 150), (140, 170, 120)
TERRAZZO = I + 'Warm terracotta terrazzo texture-3.png'
SCALE_L, SCALE_T = I + 'Level vintage brass balance scale-105.png', I + 'Tilted brass balance scale-124.png'
CARD_A, CARD_B = I + 'Blush pink paint sample card-99.png', I + 'Blank sage green paint sample card-92.png'
T['04'] = dict(title='A or B?', world='the weighing table: a real brass balance scale on terracotta terrazzo, a blush and a sage paint card as the two tones',
    job='Sellers with two versions: get people to pick one in the comments (engagement + a buying nudge).',
    moves=['Two-tone strip slice', 'Balance scale tips to the side on screen'], letters='A and B in Alfa Slab filled with painted dots (blush / sage); PICK ONE in black-dot letters',
    cta='Comment [A] or [B]; Both at [shop]', beats=[
    dict(t='0-2 s', name='Hook', draw=[bg(TERRAZZO), strips((0, 160, 1080, 1760), 8, 'A', 'B', BLUSH, SAGE, off=55),
        dd('bursts', 5, (540, 700), 330), word('A', (270, 640), 430, font='alfa', fill=('pat', DO + 'Hand-drawn black dot pattern-21.png', (190, 96, 96), (250, 222, 216))),
        word('B', (810, 640), 430, font='alfa', fill=('pat', DO + 'Hand-drawn black dot pattern-21.png', (90, 120, 76), (226, 238, 214))),
        word('OR', (540, 700), 110, fill=INK), edit('[Which one are you?]', (520, 1130), 58), mv((180, 1660), (180, 1500), 'strips slide level')],
        bg='terrazzo (images/Warm terracotta terrazzo texture-3.png) shows in the gaps', opening='clip 1 (both versions) cut into 8 tall strips, every other strip tinted blush / sage',
        action='the strips slide up and down into line until they make one clip', doodles='a marker burst behind OR', carry='the strips',
        out='the strips slide apart again and clip A fills the screen', text='A, OR, B built-in; [Which one are you?] editable'),
    dict(t='2-5 s', name='Version A, full frame', draw=[full('CLIP 2: version A, close'), cut(CARD_A, (300, 470), 380, rot=-8),
        paper('A: [name]\n[one word]', (300, 560), 56), dd('arrows', 3, (560, 760), 230, rot=-35), dd('underlines', 2, (300, 690), 250),
        dd('icons', 9, (860, 330), 120), cut(SCALE_T, (830, 1640), 470), mv((700, 1450), (790, 1600), 'tips to A')],
        bg='none: the clip fills the frame', opening='full screen', action='the brass scale bottom right tips down towards A',
        doodles='arrow from the card to the product; wavy underline under the name; a sparkle', carry='the scale, bottom right',
        out='strip slice: clip A cuts into flat strips and B slides in between', text='A: [name] [one word] editable, on the blush paint card'),
    dict(t='5-6 s', name='Transition', draw=[strips(FULL, 10, 'A', 'B', BLUSH, SAGE, vertical=False, off=140), cut(SCALE_L, (830, 1640), 470),
        mv((120, 700), (420, 700), 'B slides in'), mv((960, 900), (660, 900), 'A slides out')],
        bg='blush and sage tones on alternate strips', opening='clip A strips and clip B strips, alternating', action='A strips slide left out, B strips slide in from the right',
        doodles='none (one action)', carry='the scale (now level)', out='B strips join into one clip', text='none'),
    dict(t='6-8.5 s', name='Version B, full frame', draw=[full('CLIP 3: version B, close'), cut(CARD_B, (780, 470), 380, rot=7),
        paper('B: [name]\n[one word]', (780, 560), 56), dd('frames', 0, (540, 1050), 560), dd('arrows', 1, (420, 640), 200, rot=-20),
        cut(SCALE_T, (830, 1640), 470, flip=True), mv((960, 1520), (900, 1620), 'tips to B')],
        bg='none', opening='full screen', action='the scale tips the other way, towards B',
        doodles='a hand-drawn ring round the product; arrow from the card', carry='the scale', out='hard cut on the beat to the words card', text='B: [name] [one word] editable, on the sage card'),
    dict(t='8.5-10 s', name='Words only', draw=[bg(TERRAZZO), cut(SCALE_L, (540, 1230), 760), cut(CARD_A, (265, 1340), 190, rot=-6), cut(CARD_B, (815, 1340), 190, rot=6),
        word('A', (265, 1330), 110, font='alfa', fill=INK), word('B', (815, 1330), 110, font='alfa', fill=INK),
        word('PICK\nONE', (540, 520), 260, font='alfa', fill=('pat', DO + 'Playful hand-painted black polka dots-12.png', INK, CREAM, 0.45), edge=INK),
        dd('bursts', 2, (540, 880), 300), mv((300, 1500), (300, 1420), 'see-saws')],
        bg='terrazzo, no video', opening='none (a full-screen words beat)', action='the scale see-saws A, B, A and settles level',
        doodles='burst lines over the scale top', carry='the two paint cards', out='the cards fly to the bottom corners as the clip comes up behind', text='PICK ONE built-in'),
    dict(t='10-12 s', name='CTA', draw=[full('CLIP 4: your hand picks one up'), cut(CARD_A, (170, 1600), 260, rot=-14), cut(CARD_B, (330, 1640), 260, rot=8),
        dd('checks', 7, (170, 1560), 130), word('COMMENT', (540, 540), 160, fill=INK), edit('[A] or [B]', (540, 730), 120),
        edit('Both at [shop]', (540, 1340), 60), dd('underlines', 8, (540, 820), 420)],
        bg='none', opening='full screen', action='a marker tick box draws itself on the blush card',
        doodles='tick box on a card; thick underline under [A] or [B]', carry='end', out='end', text='COMMENT built-in; [A] or [B] and Both at [shop] editable')])

# ---------------------------------------------------------------------------------------------------------------------
NIGHT_DOTS = DO + 'Hand-painted polka dots on black-15.png'
MAG, LOUPE = I + 'Vintage brass magnifying glass-12.png', I + 'Vintage brass jeweler’s loupe-10.png'
TWEEZ, LABEL = I + 'Fine-point stainless steel jeweler\'s tweezers-13.png', I + 'Blank woven cotton care label-86.png'
BRASSDOTS = ('pat', DO + 'Hand-painted polka dots on black-15.png', (120, 84, 36), (232, 196, 120), 0.4)
T['05'] = dict(title="Details you'd miss in a photo", world="the jeweler's bench: brass magnifying glass, brass loupe, steel tweezers holding woven labels, on her hand-painted dots on black",
    job='Handmade and quality products: show the craft up close so the price feels earned.',
    moves=['Lens window: sharp inside the lens, blurred outside', 'Tweezers place a label'], letters='DETAILS in Anton filled with brass, cream edge; the buyer\'s detail lines on woven labels',
    cta='Comment [DETAIL]; [Product name] at [shop]', beats=[
    dict(t='0-2.5 s', name='Hook', draw=[full('CLIP 5: whole product (blurred)'), shade(FULL, (20, 18, 22), 0.25),
        dev(MAG, (640, 1000), 1250, [(0.03, 0.18, 0.47, 0.81, 'circle', 'CLIP 1: detail 1, sharp')], key='all'),
        word("DETAILS\nYOU'D MISS", (540, 430), 170, fill=BRASSDOTS, edge=CREAM),
        edit('[in a photo]', (540, 640), 70), dd('bursts', 3, (180, 1180), 180), mv((900, 1100), (700, 1000), 'sweeps')],
        bg='the whole-product clip, blurred and a little darker', opening='inside the magnifying glass lens: detail 1, sharp',
        action='a giant brass magnifying glass sweeps across; wherever the lens goes the clip is sharp', doodles='burst lines by the lens', carry='the magnifying glass',
        out='the lens grows until its circle fills the screen (detail 1 full)', text="DETAILS YOU'D MISS built-in; [in a photo] editable"),
    dict(t='2.5-5 s', name='Detail 1, full frame', draw=[full('CLIP 1: detail 1 (stitching)'), cut(TWEEZ, (760, 600), 620, rot=35),
        cut(LABEL, (440, 520), 230, rot=86), paper('[Hand-stitched edges]', (440, 520), 50), dd('arrows', 2, (330, 860), 200, rot=10),
        dd('frames', 0, (560, 1150), 300), mv((900, 380), (700, 520), 'tweezers place it')],
        bg='none', opening='full screen', action='steel tweezers lower a woven label onto the clip, next to the detail',
        doodles='a curly arrow from the label to the detail; a small marker ring round it', carry='the woven label (it slides down as a lower third)',
        out='the loupe swings in from the corner and its lens is the next clip', text='[Hand-stitched edges] editable on the woven label'),
    dict(t='5-7.5 s', name='Detail 2 in the loupe', draw=[pat('Hand-painted polka dots on black-15.png', (20, 18, 22), (236, 226, 206)),
        dev(LOUPE, (560, 980), 1400, [(0.13, 0.39, 0.39, 0.77, 'circle', 'CLIP 2: detail 2')], key='all'),
        cut(LABEL, (360, 1430), 200, rot=94), paper('[Brushed brass clasp]', (360, 1430), 44), dd('icons', 11, (820, 360), 160), dd('underlines', 3, (360, 1520), 300)],
        bg="her hand-painted dots on black (doodles/Hand-painted polka dots on black-15.png)", opening="the loupe's round lens",
        action='camera pushes into the lens until detail 2 fills the screen', doodles='a sparkle on the brass; wavy underline under the label', carry='the woven label',
        out='push into the lens', text='[Brushed brass clasp] editable on a woven label'),
    dict(t='7.5-9 s', name='Words only', draw=[pat('Hand-painted polka dots on black-15.png', (20, 18, 22), (236, 226, 206)),
        word('LOOK\nCLOSER', (540, 820), 250, fill=BRASSDOTS, edge=CREAM),
        cut(LOUPE, (820, 1330), 360, rot=-15), dd('arrows', 6, (540, 1230), 150)],
        bg='dots on black, no video', opening='none (words beat)', action='LOOK CLOSER zooms up from small to huge, brass shine sweeps across',
        doodles='double-ended arrow under the words', carry='the loupe', out='the loupe drops and its lens opens to two clips', text='LOOK CLOSER built-in'),
    dict(t='9-10.5 s', name='Details 3 + 4, two lenses', draw=[pat('Hand-painted polka dots on black-15.png', (20, 18, 22), (236, 226, 206)),
        dev(MAG, (560, 560), 860, [(0.03, 0.18, 0.47, 0.81, 'circle', 'CLIP 3')], key='all'), dev(MAG, (520, 1180), 860, [(0.03, 0.18, 0.47, 0.81, 'circle', 'CLIP 4')], key='all', flip=True),
        cut(LABEL, (760, 860), 130, rot=92), paper('[detail 3]', (760, 860), 40), cut(LABEL, (300, 1440), 130, rot=88), paper('[detail 4]', (300, 1440), 40),
        dd('arrows', 9, (420, 860), 140)],
        bg='dots on black', opening='two magnifying-glass lenses, one clip each (2 per screen)', action='the two glasses slide in from opposite sides and cross',
        doodles='an arrow between the two labels', carry='the woven labels', out='both lenses pull back to show the whole product', text='[detail 3], [detail 4] editable'),
    dict(t='10.5-12 s', name='CTA', draw=[full('CLIP 5: the whole product, pulled back'), cut(MAG, (860, 1640), 520, rot=-25),
        cut(LABEL, (540, 1200), 260, rot=90), paper('[Product name] at [shop]', (540, 1200), 50), word('COMMENT', (540, 470), 150, fill=BRASSDOTS, edge=CREAM),
        edit('[DETAIL]', (540, 640), 110), dd('bursts', 6, (220, 1640), 220)],
        bg='none', opening='full screen', action='the woven label drops in with the product name', doodles='a burst by the glass', carry='end', out='end',
        text='COMMENT built-in; [DETAIL], [Product name] [shop] editable')])

# ---------------------------------------------------------------------------------------------------------------------
WOOD = I + 'Warm worn workshop wood texture-15.png'
ROLL, CUBE1, CUBE2, CUBE3 = I + 'Partly unrolled kraft paper roll-14.png', I + 'Engraved wooden number one cube-45.png', I + 'Natural Wooden Cube with Engraved 2-46.png', I + 'Wooden cube with engraved number 3-50.png'
JUTE = I + 'Natural jute twine spool with loose curl-134.png'
KRAFT = I + 'Sealed kraft padded mailer-39.png'
T['06'] = dict(title='Start to finish', world='the workbench: worn workshop wood, a kraft paper roll that unrolls across the screen, engraved wooden number cubes that stack, jute twine',
    job='Makers: show the work behind one product so the price makes sense.',
    moves=['Kraft paper roll unrolls as the wipe', 'Number cubes stack into a tower'], letters='STEP and DONE in Anton filled with the kraft paper photo, dark edge',
    cta='Comment [MADE]; Made by hand in [town]. [Shop]', beats=[
    dict(t='0-2 s', name='Hook', draw=[bg(WOOD), clip((0, 300, 1080, 1340), 'CLIP 1: the raw materials'), cut(ROLL, (800, 1520), 780, rot=0),
        word('START', (540, 470), 220, fill=('photo', I + 'Partly unrolled kraft paper roll-14.png'), edge=INK), edit('[one product]', (540, 640), 70),
        word('TO FINISH', (540, 1220), 140, fill=CREAM, edge=INK), dd('arrows', 7, (300, 1450), 260), mv((240, 1550), (900, 1550), 'unrolls')],
        bg='worn workshop wood (images/Warm worn workshop wood texture-15.png)', opening='a wide band across the middle, printed on the kraft paper as it unrolls',
        action='the kraft roll rolls across the screen and leaves clip 1 printed on the paper', doodles='a wavy marker arrow following the roll', carry='the kraft roll (parked bottom right)',
        out='the paper band grows to full screen', text='START, TO FINISH built-in; [one product] editable'),
    dict(t='2-5 s', name='Step 1, full frame', draw=[full('CLIP 2: step one'), cut(CUBE1, (190, 1620), 260, rot=-6), edit('[Step 1: cut]', (500, 1360), 80),
        cut(JUTE, (900, 380), 300), dd('paths', 4, (740, 560), 200), dd('arrows', 9, (330, 1450), 160)],
        bg='none', opening='full screen', action='wooden cube 1 drops in bottom left and lands with a bounce',
        doodles='a marker loop trailing off the twine; a bent arrow from the cube to the words', carry='cube 1',
        out='the kraft roll rolls back across, wiping to step 2', text='[Step 1: cut] editable'),
    dict(t='5-8 s', name='Step 2', draw=[full('CLIP 3: step two'), cut(ROLL, (540, 980), 1300, rot=90), mv((540, 1700), (540, 300), 'roll wipes up'),
        cut(CUBE1, (190, 1660), 240), cut(CUBE2, (190, 1440), 240, rot=5), edit('[Step 2: shape]', (560, 1360), 80)],
        bg='none', opening='full screen behind the roll', action='the kraft roll rolls up the screen as the wipe, step 2 behind it; cube 2 stacks on cube 1',
        doodles='(the roll is the action; a tick lands next)', carry='the cube tower', out='the roll wipe again', text='[Step 2: shape] editable'),
    dict(t='8-11 s', name='Step 3, split', draw=[bg(WOOD), clip((40, 260, 640, 1360), 'CLIP 4: step three'), tile(KRAFT, (660, 260, 1040, 1360), crop=(0.25, 0.25, 0.75, 0.75)),
        cut(CUBE1, (850, 1600), 230), cut(CUBE2, (850, 1390), 230, rot=4), cut(CUBE3, (850, 1180), 230, rot=-5), edit('[Step 3:\nfinish]', (850, 640), 70, fill=INK, edge=CREAM),
        dd('checks', 0, (850, 900), 160), dd('checks', 1, (360, 1480), 150), mv((850, 900), (850, 1080), 'cube 3 drops')],
        bg='workshop wood + a kraft paper panel', opening='a tall window on the left (2 tiles: clip + kraft paper)', action='cube 3 drops onto the tower; the tower reaches the paper',
        doodles='a marker tick for each finished step', carry='the cube tower', out='the tower tips over and the cubes tumble out of frame', text='[Step 3: finish] editable'),
    dict(t='11-13 s', name='Words only', draw=[bg(KRAFT, crop=(0.2, 0.2, 0.8, 0.8)), word('DONE.', (520, 860), 290, fill=('photo', WOOD), edge=CREAM),
        cut(JUTE, (540, 1260), 360), dd('underlines', 9, (540, 1080), 700)],
        bg='kraft paper, no video', opening='none (words beat)', action='DONE. stamps down; the twine underline pulls tight',
        doodles='thick marker underline', carry='the twine', out='the twine pulls the paper aside like a curtain to the finished product', text='DONE. built-in'),
    dict(t='13-15 s', name='Finished + CTA', draw=[bg(WOOD), clip((140, 280, 940, 1280), 'CLIP 5 + 6: finished product, in use', shape='arch'),
        cut(JUTE, (180, 1450), 260), word('COMMENT', (540, 1330), 110, fill=CREAM, edge=INK), edit('[MADE]', (540, 1435), 80),
        edit('Made by hand in [town]', (540, 1180), 52), dd('bursts', 4, (540, 260), 300), dd('icons', 9, (900, 360), 130)],
        bg='workshop wood', opening='a tall arch window', action='the finished product clip rises into the arch',
        doodles='burst lines over the arch; a sparkle', carry='end', out='end', text='COMMENT built-in; [MADE], Made by hand in [town] editable')])

# ---------------------------------------------------------------------------------------------------------------------
GRAPH = I + 'Creased pale blue graph paper-7.png'
RULER, PENCIL, PHONE = I + 'Pale wooden ruler on pure white-137.png', PH + 'Classic Yellow Pencil on White.png', TE + 'Graphite Smartphone With Green Screen-38.png'
MUG, NOTE = I + 'Warm white ceramic coffee mug-140.png', PH + 'Blank Yellow Sticky Note on White.png'
T['07'] = dict(title='How big is it really?', world='the drafting table: creased blue graph paper, a giant yellow pencil that draws, a wooden ruler that becomes the divider, real everyday objects at true scale (phone, mug, sticky note)',
    job='Products that are hard to size from photos: answer "how big is it?" before people ask (fewer returns, more confidence).',
    moves=['Surreal scale: giant pencil + ruler around the clip', 'Ruler swings down to split the screen'], letters='HOW BIG in Anton filled with the graph paper, ink edge; the size as huge outlined numbers (editable)',
    cta='Comment [SIZE]; [Exact size]. [Shop]', beats=[
    dict(t='0-2 s', name='Hook', draw=[bg(GRAPH), clip((180, 560, 900, 1300), 'CLIP 1: the product alone'), cut(PENCIL, (820, 1420), 900, rot=55),
        dd('frames', 4, (540, 930), 860), word('HOW BIG', (540, 350), 190, fill=('photo', GRAPH), edge=INK), word('IS IT REALLY?', (540, 500), 100, fill=INK, edge=CREAM),
        dd('arrows', 5, (540, 1380), 600), mv((990, 1300), (700, 1400), 'pencil draws')],
        bg='blue graph paper (images/Creased pale blue graph paper-7.png)', opening='a square window in the middle of the paper',
        action='a giant yellow pencil draws the frame round the clip as you watch', doodles='the hand-drawn frame; a double arrow measuring the width', carry='the pencil',
        out='the ruler swings down from the top and splits the screen', text='HOW BIG IS IT REALLY? built-in'),
    dict(t='2-4 s', name='In my hand / next to a phone', draw=[bg(GRAPH), clip((30, 240, 520, 1500), 'CLIP 2: in your hand'), clip((560, 240, 1050, 1500), 'CLIP 3: next to a phone or mug'),
        cut(RULER, (540, 870), 1400, rot=90), edit('[in my hand]', (275, 1380), 54), edit('[next to my phone]', (720, 340), 50),
        dd('arrows', 8, (280, 400), 200), mv((540, 160), (540, 600), 'ruler swings down')],
        bg='graph paper at the edges', opening='two tall windows either side of the ruler (2 per screen)', action='the wooden ruler swings down from the top and becomes the divider',
        doodles='a zigzag arrow pointing at the hand', carry='the ruler', out='the ruler slides right, pushing clip 2 out; clip 3 fills the frame', text='[in my hand], [next to my phone] editable'),
    dict(t='4-6 s', name='True-scale objects', draw=[full('CLIP 3: next to a phone or mug'), cut(TE + 'Graphite smartphone back view-41.png', (840, 1450), 300), cut(MUG, (200, 1620), 330),
        cut(NOTE, (260, 470), 330, rot=-6), paper('[3 x 3 in]', (260, 470), 60), dd('arrows', 6, (840, 1110), 120), dd('icons', 8, (830, 280), 110)],
        bg='none', opening='full screen', action='a real phone and a real mug slide in at the edges as size references',
        doodles='a double-headed height arrow over the phone; a sparkle', carry='the sticky note', out='the sticky note grows to full screen (paper wipe)', text='[3 x 3 in] editable on a real sticky note'),
    dict(t='6-7.5 s', name='Words only', draw=[bg(NOTE, crop=(0.25, 0.25, 0.75, 0.7)), edit('[3 IN]', (500, 820), 250, fill=CREAM, edge=INK, edge_w=24),
        word('ACTUAL SIZE', (540, 1150), 120, fill=INK, edge=CREAM), dd('underlines', 2, (540, 1270), 600), cut(PENCIL, (820, 1420), 600, rot=-30)],
        bg='the sticky note, filling the screen, no video', opening='none (words beat)', action='the size writes itself on in huge outlined numbers',
        doodles='wavy underline under ACTUAL SIZE', carry='the pencil', out='the note peels off the top corner to the clip', text='[3 IN] editable (big outlined numbers); ACTUAL SIZE built-in'),
    dict(t='7.5-10 s', name='Worn / in use + CTA', draw=[full('CLIP 4 + 5: worn / on the ruler'), cut(RULER, (540, 1640), 1200),
        word('COMMENT', (540, 450), 150, fill=('photo', GRAPH), edge=INK), edit('[SIZE]', (540, 610), 110), edit('[Exact size]. [Shop]', (540, 1340), 56),
        dd('arrows', 4, (820, 1250), 220), dd('bursts', 1, (180, 820), 160)],
        bg='none', opening='full screen', action='the ruler slides in along the bottom edge, ticks lined up under the product',
        doodles='a loopy arrow down to the ruler; a burst', carry='end', out='end', text='COMMENT built-in; [SIZE], [Exact size]. [Shop] editable')])

# ---------------------------------------------------------------------------------------------------------------------
WAVY = 'Hand-drawn wavy line pattern-20.png'
TEL, CORD = I + 'Dusty blue vintage rotary telephone-26.png', I + 'Tangled black cord on white-204.png'
ENV = I + 'Cream envelopes tied with a string bow-21.png'
DUSTY, BUTTER = (96, 128, 156), (246, 226, 170)
T['08'] = dict(title='A real customer question', world="the phone line: a dusty-blue rotary telephone, her speech bubbles as windows, marker sound waves (her wavy-line pattern in dusty blue on butter)",
    job='Answer the question buyers keep asking (in DMs, emails, reviews) by showing, not telling: removes a buying doubt.',
    moves=['Speech bubble becomes the window', 'Sound-wave band splits the screen'], letters='YOU ASKED in Bounce House, dusty blue with a butter edge (balloon letters)',
    cta='Comment [ASK]; [Product name]. [Shop]', beats=[
    dict(t='0-3 s', name='Hook', draw=[pat(WAVY, DUSTY, BUTTER), cut(TEL, (330, 1450), 700, rot=-8), dd('bursts', 7, (650, 1220), 240),
        clip((420, 420, 1000, 900), 'screenshot slot: [the real question]', shape='bubble', tint=CREAM), dd('bubbles', 0, (710, 650), 650),
        word('YOU ASKED:', (540, 320), 140, font='bounce', fill=DUSTY, edge=BUTTER), mv((300, 1300), (330, 1180), 'rings')],
        bg="her wavy-line pattern in dusty blue on butter (doodles/Hand-drawn wavy line pattern-20.png)", opening="a speech bubble (her marker bubble) holding the buyer's screenshot of the question",
        action='the telephone rings and shakes; the bubble pops out of the receiver', doodles='marker bubble outline; ring lines by the receiver', carry='the speech bubble',
        out='the camera dives into the bubble until it is clip 1', text='YOU ASKED: built-in; the question is an image slot (screenshot, name hidden)'),
    dict(t='3-7 s', name='Answer, part 1', draw=[full('CLIP 1 + 2: the product, then answer part 1'), cut(TEL, (900, 1700), 380, rot=12),
        edit('[Yes: it fits a\n13 in laptop]', (480, 1300), 66), dd('arrows', 3, (560, 1080), 200, rot=150), dd('underlines', 3, (480, 1420), 420),
        dd('bubbles', 3, (260, 460), 260)],
        bg='none', opening='full screen', action='the answer types on line by line', doodles='an arrow to the product; wavy underline; an empty marker bubble near the top',
        carry='the telephone, bottom right', out='the phone cord stretches across the screen as the divider', text='the answer line is editable'),
    dict(t='7-11 s', name='Answer, part 2: split by the cord', draw=[pat(WAVY, DUSTY, BUTTER), clip((0, 0, 1080, 900), 'CLIP 2: answer part 1'), clip((0, 1020, 1080, 1920), 'CLIP 3: answer part 2'),
        pat(WAVY, DUSTY, BUTTER, (0, 890, 1080, 1030), 0.3), cut(TEL, (900, 960), 300), edit('[and it still zips shut]', (500, 1240), 60), mv((60, 960), (760, 960), 'wave band slides in')],
        bg='the wavy pattern shows along the seam', opening='two clips stacked, one above the band, one below', action='a band of her sound-wave pattern slides in from the phone and splits the screen',
        doodles='(the wave band is her marker pattern)', carry='the wave band', out='the band widens up and down until it fills the screen', text='the second answer line is editable'),
    dict(t='11-12.5 s', name='Words only', draw=[pat(WAVY, DUSTY, BUTTER), word('SHORT\nANSWER:', (540, 640), 190, font='bounce', fill=DUSTY, edge=BUTTER),
        edit('[YES.]', (500, 1050), 220, fill=BUTTER, edge=INK, edge_w=20), dd('bursts', 0, (840, 1040), 200), dd('bubbles', 4, (540, 1060), 900)],
        bg='dusty blue sound waves on butter, no video', opening='none (words beat)', action='[YES.] stamps in and the bubble frame wobbles round it',
        doodles='a scribbled frame round the answer; a burst', carry='the bubble', out='the bubble flies to the corner and the last clip plays', text='SHORT ANSWER: built-in; [YES.] editable'),
    dict(t='12.5-15 s', name='CTA', draw=[full('CLIP 4: the product in use'), cut(ENV, (230, 1600), 520, rot=-8), clip((620, 300, 1000, 640), 'question', shape='bubble', tint=CREAM),
        word('ASK ME', (380, 520), 130, font='bounce', fill=DUSTY, edge=BUTTER), edit('Comment [ASK]', (440, 700), 80), edit('[Product name]. [Shop]', (540, 1340), 56),
        dd('arrows', 4, (420, 1460), 200)],
        bg='none', opening='full screen + the small question bubble', action='a bundle of envelopes (more questions) drops in at the bottom',
        doodles='a loopy arrow towards the envelopes', carry='end', out='end', text='ASK ME built-in; Comment [ASK], [Product name]. [Shop] editable')])

# ---------------------------------------------------------------------------------------------------------------------
ZIG, MUSTARD = 'Bold hand-drawn zigzag pattern-17.png', I + 'Mustard yellow paint sample card-71.png'
BADGE, TAG_R, TAG_G = I + 'Clear badge holder on black lanyard-148.png', I + 'Blank red-bordered name tag sticker-28.png', I + 'Blank grass-green name tag sticker-30.png'
MUST = (214, 170, 60)
BH = [(0.405, 0.695, 0.605, 0.935, 'rect', '')]
def badge(c, w, label): return dev(BADGE, c, w, [(0.26, 0.44, 0.76, 0.88, 'rect', label)], key='all', crop=(0.3, 0.45, 0.7, 1.0))
T['09'] = dict(title="Who it's for", world='the name-tag wall: lanyards with clear badge holders that swing down from the top, real HELLO-style name tag stickers, her zigzag pattern in black on mustard',
    job='Products with a clear buyer: let the right people see themselves in it ("that\'s me") so they buy.',
    moves=['Lanyard badges swing down (each badge a clip)', 'Name tag stickers slap on'], letters='IS THIS YOU? in Anton, cream with a thick black edge (reads on the zigzag)',
    cta='Comment [ME]; Sound like you? [Shop]', beats=[
    dict(t='0-2 s', name='Hook', draw=[pat(ZIG, (30, 26, 24), (232, 196, 96)), badge((200, 560), 620, 'CLIP 2'), badge((540, 500), 620, 'CLIP 3'), badge((880, 580), 620, 'CLIP 4'),
        word('IS THIS\nYOU?', (540, 1240), 220, fill=CREAM, edge=INK), mv((540, 150), (540, 420), 'swing down')],
        bg='her zigzag pattern in black on mustard (doodles/Bold hand-drawn zigzag pattern-17.png)', opening='three clear badge holders on lanyards, a clip in each',
        action='three lanyards drop from the top and swing; the badges sway out of step', doodles='(the zigzag is her marker pattern)', carry='the lanyards',
        out='the middle badge swings to the camera and fills the screen', text='IS THIS YOU? built-in'),
    dict(t='2-5 s', name='Person one, full frame', draw=[full('CLIP 2: person one using it'), cut(TAG_R, (330, 520), 560, rot=-7),
        paper('[the 6am\ncoffee crowd]', (330, 560), 56), dd('arrows', 2, (620, 820), 200, rot=-10), dd('icons', 4, (300, 300), 140), dev(BADGE, (900, 330), 330, [(0.26, 0.44, 0.76, 0.88, 'rect', '')], key='all', crop=(0.3, 0.45, 0.7, 1.0))],
        bg='none', opening='full screen', action='a real name-tag sticker slaps on, a little crooked', doodles='a crown drawn above the tag; arrow to the person',
        carry='the lanyard top right', out='the next badge swings across the frame as the wipe', text='[the 6am coffee crowd] editable, written on the name tag'),
    dict(t='5-8 s', name='Person two (badge swing wipe)', draw=[full('CLIP 3: person two'), badge((540, 630), 1500, 'CLIP 3'), cut(TAG_G, (760, 560), 480, rot=6),
        paper('[the always-\nlate packer]', (760, 600), 50), mv((60, 200), (300, 600), 'swings in')],
        bg='none', opening='the incoming badge grows to fill the screen', action='a giant badge swings in on its lanyard and its clip becomes the frame',
        doodles='(one action)', carry='the green name tag', out='swing', text='[the always-late packer] editable on the green tag'),
    dict(t='8-10 s', name='Person three, full frame', draw=[full('CLIP 4: person three'), cut(TAG_R, (330, 520), 560, rot=4), paper('[the gift-\nmaker]', (330, 560), 56),
        dd('icons', 3, (840, 420), 130), dd('underlines', 1, (330, 700), 300), dd('bursts', 8, (160, 1180), 180)],
        bg='none', opening='full screen', action='the sticker slaps on', doodles='a heart; underline; burst lines', carry='the stickers',
        out='all three name tags fly in and stack', text='[the gift-maker] editable'),
    dict(t='10-12 s', name='Words + CTA', draw=[pat(ZIG, (30, 26, 24), (232, 196, 96)), clip((240, 300, 840, 960), 'CLIP 5: the product alone', edge=WHITE),
        cut(TAG_R, (250, 1150), 380, rot=-10), cut(TAG_G, (560, 1210), 380, rot=4), cut(TAG_R, (850, 1150), 380, rot=9),
        word('SOUND LIKE YOU?', (540, 1350), 105, fill=CREAM, edge=INK), edit('Comment [ME]', (540, 1445), 56), dd('checks', 6, (840, 330), 140)],
        bg='the zigzag pattern again', opening='one framed clip at the top', action='the three name tags stack up under the product',
        doodles='a tick box on the frame', carry='end', out='end', text='SOUND LIKE YOU? built-in; Comment [ME] editable')])
