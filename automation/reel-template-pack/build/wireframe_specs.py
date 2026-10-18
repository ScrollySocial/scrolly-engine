"""Plan specs for every physical-pack template not done yet (rendered by build/wireframes.py). Each template: its own
world, 5 to 6 beats, each object arriving with the word it pictures, patterns/stickers ON the objects, the footage in
an opening, one main action per beat, one or two layers carried into the next beat, 3+ of her doodles with a job.
Positions are on the 1080 x 1920 frame; text stays inside y 230 to 1490 (and x < 930 in the lower half)."""
INK, WHITE, CREAM = (24, 23, 22), (255, 255, 255), (248, 242, 228)
RED, NAVY, COBALT, MUSTARD, SAGE, TERRA = (210, 52, 46), (26, 38, 70), (40, 80, 190), (214, 166, 64), (130, 152, 120), (196, 104, 74)
FULL = (0, 0, 1080, 1920)
DOTS, STRIPES, CHECKS, ZIG, CROSS, WAVY = ('Playful hand-painted black polka dots-12.png', 'Hand-drawn black stripe pattern-16.png',
    'Wobbly hand-drawn black and white checkerboard-24.png', 'Bold hand-drawn zigzag pattern-17.png', 'Bold hand-drawn cross pattern-19.png',
    'Hand-drawn wavy line pattern-20.png')
IMG, FALL, TECH, PHYS = 'images', 'fall', 'tech', 'physical'

def B(name, time, label, bg=(), open=(), items=(), doodles=(), text=(), lens=()):
    return dict(name=name, time=time, label=list(label), bg=list(bg), open=list(open), items=list(items), doodles=list(doodles), text=list(text), lens=list(lens))

SPECS = []

# ---- 04 A or B? : Side A / Side B ---------------------------------------------------------------------------------------
REC = 'Classic black vinyl record on white-1.png'
SPECS.append(dict(num='04', title='A or B?', job='two versions (colours, scents, sizes): get viewers to pick and comment',
    world='the record shop: two real vinyl records (Side A, Side B), her cobalt/mustard stripes, kraft sleeve',
    moves='record as a spinning window, two-tone strip slice between A and B, flip', beats=[
    B('Hook: both, side by side', '0-2s', ['cobalt stripes top, mustard stripes bottom (two materials, one per version)',
        'two round windows: the centre labels of two real records, version A left, B right',
        'both records spin in from the edges and lock side by side', 'her arrows point from A and from B up to the question',
        'the two records', 'A slides up and fills the frame'],
      bg=[('pat', STRIPES, COBALT, CREAM, (0, 0, 1080, 960)), ('pat', STRIPES, MUSTARD, CREAM, (0, 960, 1080, 1920))],
      open=[('circle', (110, 760, 510, 1160), 'smoothie'), ('circle', (570, 760, 970, 1160), 'blender')],
      items=[(IMG, REC, (310, 960), 560, 0), (IMG, REC, (770, 960), 560, 0)],
      doodles=[('arrow', 2, (300, 600), 220, INK, 30), ('arrow', 2, (780, 600), 220, INK, 150)],
      text=[('WHICH ONE ARE YOU?', (540, 330), 110, 'B', INK), ('A', (310, 1260), 120, 'B', COBALT), ('B', (770, 1260), 120, 'B', MUSTARD)]),
    B('Side A', '2-5s', ['cobalt stripes', 'version A full frame (the record label opened up)', 'the record keeps turning slowly in the corner like a dial',
        'her circle round the A sticker', 'the small record in the corner', 'two-tone strip slice (cobalt / mustard) to Side B'],
      bg=[], open=[('rect', FULL, 'smoothie')], items=[(IMG, REC, (900, 1600), 380, 20)],
      doodles=[('frame', 1, (210, 380), 260, WHITE)], text=[('A', (210, 380), 150, 'B', COBALT), ('A: [NAME + ONE WORD]', (540, 1350), 80, 'E', INK)]),
    B('Strip slice', '4.8-5.2s', ['A cut into strips tinted cobalt and mustard', 'B underneath, showing through the gaps',
        'the strips slide apart left and right', '', 'the corner record', 'B is full frame'],
      bg=[('pat', STRIPES, COBALT, CREAM, (0, 0, 1080, 1920))], open=[('rect', (0, 240, 1080, 480), 'blender'), ('rect', (0, 720, 1080, 960), 'blender'), ('rect', (0, 1200, 1080, 1440), 'blender')]),
    B('Side B', '5-8s', ['mustard stripes', 'version B full frame', 'the corner record flips over (now Side B)',
        'her circle round the B sticker; her dashed arrow at the product', 'the corner record', 'both shrink back into the two records'],
      open=[('rect', FULL, 'blender')], items=[(IMG, REC, (180, 1600), 380, -20)],
      doodles=[('frame', 1, (870, 380), 260, WHITE), ('path', 6, (520, 900), 320, WHITE, 20)],
      text=[('B', (870, 380), 150, 'B', MUSTARD), ('B: [NAME + ONE WORD]', (540, 1350), 80, 'E', INK)]),
    B('CTA: pick one', '10-12s', ['cobalt over mustard stripes', 'both records again, A and B playing in the labels; your hand picking one',
        'the records spin; your pick pops bigger', 'her ticks pop by each record as people vote', '', 'end'],
      bg=[('pat', STRIPES, COBALT, CREAM, (0, 0, 1080, 960)), ('pat', STRIPES, MUSTARD, CREAM, (0, 960, 1080, 1920))],
      open=[('circle', (110, 760, 510, 1160), 'smoothie'), ('circle', (570, 760, 970, 1160), 'hand')],
      items=[(IMG, REC, (310, 960), 560, 0), (IMG, REC, (770, 960), 560, 0)],
      doodles=[('tick', 0, (310, 1300), 150, INK), ('tick', 1, (770, 1300), 150, INK)],
      text=[('COMMENT A OR B', (540, 330), 110, 'B', INK), ('BOTH AT [SHOP]', (540, 480), 80, 'E', INK)])]))

# ---- 05 Details you'd miss in a photo : the jeweller's bench -------------------------------------------------------------
LOUPE = 'Vintage brass jeweler’s loupe-10.png'
GLASSES = 'Antique-Gold Round Wire Eyeglass Frame-3.png'
SPECS.append(dict(num='05', title="Details you'd miss in a photo", job='show the quality only a close look reveals',
    world="the jeweller's bench: dark walnut, brass loupe, gold wire glasses, tweezers, her cream dots on deep navy",
    moves='lens window (loupe), glasses with a detail in each lens, colour inside / greyscale outside', beats=[
    B('Hook: the loupe finds detail 1', '0-2.5s', ['detail 1 full frame in GREYSCALE', 'a sharp, colour circle inside the real brass loupe',
        'the loupe slides in over the product', 'her burst on the loupe as it lands', 'the loupe', 'the loupe glides to the next spot'],
      open=[('grey', FULL, 'close')], items=[(IMG, LOUPE, (560, 980), 620, -10)], lens=[((330, 820, 560, 1050), 'close')], doodles=[('burst', 3, (840, 700), 220, WHITE)],
      text=[("DETAILS YOU'D", (540, 330), 110, 'B', WHITE), ('MISS IN A PHOTO', (540, 470), 110, 'B', WHITE)]),
    B('Detail 2', '2.5-5s', ['greyscale outside', 'colour inside the loupe, now on detail 2', 'the loupe glides from detail 1 to detail 2',
        'her arrow at the detail', 'the loupe', 'the loupe lens grows to full frame'],
      open=[('grey', FULL, 'brush')], items=[(IMG, LOUPE, (420, 1000), 620, 8)], lens=[((190, 850, 420, 1080), 'brush')], doodles=[('arrow', 9, (780, 760), 220, WHITE)],
      text=[('[HAND-STITCHED EDGES]', (540, 1380), 80, 'E', INK)]),
    B('Details 3 + 4: the glasses', '5-8s', ['deep navy with her cream dots', 'detail 3 and detail 4 in the two lenses of real gold wire glasses',
        'the glasses settle onto the frame, one lens then the other fills', 'her underlines under each line', 'the glasses', 'the right lens expands to full frame'],
      bg=[('pat', DOTS, NAVY, CREAM, FULL)], open=[('circle', (120, 760, 520, 1160), 'close'), ('circle', (560, 760, 960, 1160), 'counter')],
      items=[(FALL, GLASSES, (540, 960), 1000, 0)], doodles=[('under', 2, (320, 1330), 300, CREAM), ('under', 4, (760, 1330), 300, CREAM)],
      text=[('[LABEL]', (320, 1260), 70, 'E', CREAM), ('[FINISH]', (760, 1260), 70, 'E', CREAM)]),
    B('Detail 4 close', '8-10s', ['', 'detail 4 full frame', 'tweezers lift in from the side and point at the detail',
        'her circle round the spot', 'the tweezers', 'zoom out through the loupe'],
      open=[('rect', FULL, 'counter')], items=[(IMG, 'Fine-point stainless steel tweezers-131.png', (820, 900), 520, -35)],
      doodles=[('frame', 1, (480, 980), 360, WHITE)], text=[('[GLAZED BY HAND]', (500, 1380), 80, 'E', INK)]),
    B('CTA: pulled back', '10-12s', ['navy dots, the walnut bench as a band', 'the whole product inside the loupe, pulled back',
        'the loupe lifts away revealing it all', 'her sparkle on the product', '', 'end'],
      bg=[('pat', DOTS, NAVY, CREAM, FULL)], open=[('circle', (190, 560, 890, 1260), 'shelf')], items=[(IMG, LOUPE, (540, 910), 980, 0)],
      doodles=[('icon', 9, (860, 520), 140, CREAM)], text=[('COMMENT "[KEYWORD]"', (540, 330), 100, 'B', CREAM), ('[PRODUCT NAME]', (540, 1430), 80, 'E', CREAM)])]))

# ---- 06 Start to finish : the workshop timeline ---------------------------------------------------------------------------
STAMP = 'Vintage Rubber Stamp and Ink Pad-17.png'
TICKETS = ['Blank cream ticket stub on white-18.png', 'Blank pale yellow perforated ticket stub-19.png', 'Blank peach perforated ticket stub-22.png']
SPECS.append(dict(num='06', title='Start to finish', job='show the making, so the price makes sense',
    world='the workshop: worn wood bench, kraft paper roll, jute twine, ticket stubs for each step, the rubber stamp',
    moves='torn reveal (kraft paper tears to each step), twine timeline carried across, stamp DONE', beats=[
    B('Hook: raw materials', '0-2s', ['worn wood bench', 'the raw-materials clip in a torn opening in kraft paper',
        'the kraft paper tears open from the middle', 'her dashed arrow from the words into the tear', 'the twine line across the top', 'the next tear'],
      bg=[('img', IMG, 'Warm worn workshop wood texture-15.png', FULL)], open=[('round', (140, 620, 940, 1500), 'kitchen')],
      items=[(IMG, 'Natural jute twine spool with loose curl-134.png', (900, 300), 260, 0)], doodles=[('path', 6, (540, 520), 300, CREAM, 0)],
      text=[('MAKING ONE', (450, 330), 110, 'B', CREAM), ('[PRODUCT]', (450, 460), 110, 'E', MUSTARD)]),
    B('Step 1', '2-5s', ['', 'step 1 full frame', 'a ticket stub drops onto the twine line and swings', 'her circle round the step number',
        'the twine line + ticket 1', 'kraft paper tears across to step 2'],
      open=[('rect', FULL, 'blender')], items=[(IMG, TICKETS[0], (330, 400), 460, -6)], doodles=[('frame', 1, (190, 400), 160, INK)],
      text=[('STEP 1: [WHAT]', (360, 400), 60, 'E', INK)]),
    B('Step 2 (the tear)', '5-8s', ['kraft paper half torn away', 'step 2 behind the tear', 'the tear runs down the frame', '',
        'twine + tickets 1 and 2', 'tear to step 3'],
      bg=[('img', IMG, 'Partly unrolled kraft paper roll-14.png', FULL)], open=[('rect', (300, 0, 1080, 1920), 'kitchen')],
      items=[(IMG, TICKETS[1], (360, 520), 460, 5)], text=[('STEP 2: [WHAT]', (380, 520), 60, 'E', INK)]),
    B('Step 3', '8-11s', ['', 'step 3 full frame (sped up)', 'ticket 3 joins the line', 'her underline under the step', 'twine + three tickets', 'the stamp comes down'],
      open=[('rect', FULL, 'mop')], items=[(IMG, TICKETS[2], (560, 400), 460, -4)], doodles=[('under', 2, (560, 520), 380, WHITE)],
      text=[('STEP 3: [WHAT]', (560, 400), 60, 'E', INK)]),
    B('Done: the stamp', '11-13s', ['wood bench', 'the finished product in a photo card', 'the real rubber stamp stamps DONE',
        'her burst on DONE', 'the stamp', 'the card grows to the CTA'],
      bg=[('img', IMG, 'Warm worn workshop wood texture-15.png', FULL)], open=[('round', (180, 520, 900, 1420), 'shelf')],
      items=[(IMG, STAMP, (820, 1500), 560, -12)], doodles=[('burst', 3, (820, 470), 220, CREAM)], text=[('DONE', (540, 980), 200, 'B', RED, -10)]),
    B('CTA', '13-15s', ['wood + kraft band', 'the product in use full frame', 'the three tickets fan in along the bottom', '', '', 'end'],
      open=[('rect', FULL, 'hand')], items=[(IMG, t, (220 + i * 300, 1650), 360, (-8, 4, 10)[i]) for i, t in enumerate(TICKETS)],
      text=[('MADE BY HAND IN [TOWN]', (540, 330), 80, 'E', INK), ('COMMENT "[KEYWORD]"', (540, 460), 90, 'B', RED)])]))

# ---- 07 How big is it really? (fresh take) : the size line-up ------------------------------------------------------------
SPECS.append(dict(num='07', title='How big is it really? (fresh take)', job='answer the size question before people ask',
    world='the measuring wall: a giant wooden ruler, white pegboard, everyday things for scale (mug, playing card, cassette, phone)',
    moves='the ruler as a sliding divider (carries the next clip in), a line-up for scale, surreal scale', beats=[
    B('Hook: the ruler', '0-2s', ['white pegboard', 'the product clip in a tall window beside a giant ruler', 'the giant real ruler slides up beside the clip, ticking up',
        'her ? beside the hook; her arrow from the ruler to the product', 'the ruler', 'the ruler slides across, carrying clip 2 in behind it'],
      bg=[('img', IMG, 'White pegboard grid texture-5.png', FULL)], open=[('round', (300, 560, 960, 1480), 'hand')],
      items=[(IMG, 'Pale wooden ruler on white-153.png', (170, 1000), 1200, 90)], doodles=[('arrow', 0, (620, 520), 200, INK, -30)],
      text=[('HOW BIG IS IT', (560, 300), 110, 'B', INK), ('REALLY?', (560, 430), 110, 'B', RED)]),
    B('In my hand', '2-4s', ['', 'clip 2 full frame', 'the ruler slides across as the divider, clip 2 coming in behind it', '',
        'the ruler (now on the right edge)', 'line-up'],
      open=[('rect', FULL, 'hand')], items=[(IMG, 'Pale wooden ruler on white-153.png', (980, 1000), 1200, 90)], text=[('IN MY HAND', (450, 1380), 90, 'E', INK)]),
    B('Next to things you own', '4-6s', ['pegboard', 'clip 3 in a window the size the product really is', 'a line-up drops in: a mug, a playing card, a cassette',
        'her labels with arrows to each thing', 'the ruler', 'the clip grows'],
      bg=[('img', IMG, 'White pegboard grid texture-5.png', FULL)], open=[('round', (330, 720, 690, 1240), 'smoothie')],
      items=[(IMG, 'Warm white ceramic coffee mug-140.png', (190, 1100), 280, 0), (IMG, 'Navy geometric playing card back-143.png', (850, 980), 240, 6),
             (TECH, 'Vintage black cassette with blank label-55.png', (860, 1350), 300, -6)],
      doodles=[('arrow', 9, (520, 1360), 200, INK)], text=[('NEXT TO A [MUG]', (540, 420), 90, 'E', INK)]),
    B('Worn / on a shelf', '6-8s', ['', 'clip 4 full frame', 'a real phone slides in at true scale beside it (surreal scale check)', 'her circle round the product',
        'the phone', 'the ruler swings down horizontal'],
      open=[('rect', FULL, 'shelf')], items=[(TECH, 'Graphite smartphone back view-41.png', (850, 1100), 260, 8)], doodles=[('frame', 1, (420, 900), 420, WHITE)],
      text=[('[ON THE SHELF]', (420, 1380), 80, 'E', INK)]),
    B('CTA: the exact size', '8-10s', ['pegboard + mustard stripes band', 'the product on the ruler, full frame clip in a wide window',
        'the size number pops on a real paint chip', 'her underline under the size', '', 'end'],
      bg=[('img', IMG, 'White pegboard grid texture-5.png', FULL), ('pat', STRIPES, MUSTARD, CREAM, (0, 1500, 1080, 1920))], open=[('round', (80, 560, 1000, 1300), 'close')],
      items=[(IMG, 'Pale wooden ruler on white-153.png', (540, 1380), 1100, 0)], doodles=[('under', 4, (540, 470), 520, INK)],
      text=[('[EXACT SIZE]', (540, 380), 110, 'E', RED), ('COMMENT "SIZE"', (540, 1200), 90, 'B', INK)])]))

# ---- 08 A real customer question : the switchboard -------------------------------------------------------------------------
PHONE = 'Dusty blue vintage rotary telephone-26.png'
SPECS.append(dict(num='08', title='A real customer question', job="answer the question everyone DMs, once, publicly",
    world='the switchboard: a dusty-blue rotary phone, kraft padded mailers, a mailbox with the flag up, her speech bubbles',
    moves='a speech bubble as the window, the rotary phone ringing, mail floods then clears', beats=[
    B('Hook: the question rings in', '0-3s', ['dusty blue + her cream wavy lines', "the customer's question (their screenshot) inside her speech bubble",
        'the real rotary phone rings (shakes), the bubble pops out of the handset', 'her burst lines on the ringing phone', 'the speech bubble', 'the bubble grows into the answer clip'],
      bg=[('pat', WAVY, (110, 140, 170), CREAM, FULL)], open=[('round', (180, 300, 900, 900), 'box')],
      items=[(IMG, PHONE, (540, 1300), 620, 0)], doodles=[('bubble', 1, (540, 620), 860, INK), ('burst', 5, (860, 1150), 200, INK)],
      text=[('YOU ASKED:', (540, 230 + 60), 80, 'B', INK)]),
    B('Answer, part 1', '3-7s', ['', 'answer clip 1 full frame', 'the bubble shrinks to the corner and stays', 'her arrow at the product',
        'the bubble in the corner', 'mail floods across'],
      open=[('rect', FULL, 'hand')], doodles=[('bubble', 0, (230, 380), 360, WHITE), ('arrow', 9, (700, 900), 220, WHITE)],
      text=[('[THE ANSWER, LINE ONE]', (540, 1380), 80, 'E', INK)]),
    B('Mail flood', '6.8-7.2s', ['kraft padded mailers pile in from every side', 'clip 2 under the pile', 'the mailers flood, then fly off',
        '', 'one mailer stays in the corner', 'clip 2 full'],
      open=[('rect', FULL, 'counter')], items=[(IMG, ('Sealed kraft padded mailer-39.png', 'Blank sealed kraft padded mailer-187.png')[i % 2], (x, y), 480, r) for i, (x, y, r) in enumerate( ((200, 400, -20), (800, 500, 15), (400, 1000, 8), (900, 1300, -12), (250, 1550, 20), (650, 1700, -6)))]),
    B('Answer, part 2', '7-11s', ['', 'answer clip 2 full frame', 'one mailer sits in the corner (the reply)', 'her underline under the line; her tick',
        'the mailer', 'the mailbox flag drops'],
      open=[('rect', FULL, 'counter')], items=[(IMG, 'Sealed kraft padded mailer-39.png', (870, 1580), 360, -10)],
      doodles=[('tick', 0, (870, 400), 160, WHITE)], text=[('[THE ANSWER, LINE TWO]', (520, 1380), 80, 'E', INK)]),
    B('CTA: in use', '11-15s', ['dusty blue wavy lines band', 'the product in use in a photo card', 'the mailbox flag drops (answered)',
        '', '', 'end'],
      bg=[('pat', WAVY, (110, 140, 170), CREAM, FULL)], open=[('round', (140, 520, 940, 1360), 'brush')],
      items=[(IMG, 'Vintage Mailbox with Raised Red Flag-20.png', (820, 1560), 440, 0)],
      text=[('MORE QUESTIONS?', (540, 300), 90, 'B', INK), ('COMMENT "[KEYWORD]"', (540, 430), 90, 'B', RED)])]))

# ---- 09 Who it's for : the name-tag party ---------------------------------------------------------------------------------
SPECS.append(dict(num='09', title="Who it's for", job='make the right buyer say "that\'s me"',
    world='the name-tag party: blank HELLO name-tag stickers (green and red borders), a lanyard badge holder, a cone party hat, a disco ball',
    moves='name tags as windows, disco-ball sparkle swarm orbiting, badge swing as the change', beats=[
    B('Hook: if you...', '0-2s', ['red gingham-style checks (her checkerboard in red)', 'the product clip inside a real HELLO name tag',
        'the name tag slaps onto the frame and wobbles', 'her underline under the habit; her sparkles', 'the tag', 'the tag flips to person one'],
      bg=[('pat', CHECKS, RED, CREAM, FULL)], open=[('rect', (180, 820, 900, 1260), 'box')],
      items=[(IMG, 'Blank red-bordered name tag sticker-28.png', (540, 960), 900, -3)], doodles=[('icon', 9, (900, 640), 150, INK), ('under', 4, (540, 520), 600, INK)],
      text=[('IF YOU [HABIT],', (540, 320), 90, 'E', INK), ('THIS IS FOR YOU', (540, 440), 100, 'B', RED)]),
    B('Type one', '2-5s', ['', 'moment one full frame', 'the badge holder swings in on its lanyard with the type written on it', 'her arrow at the hands',
        'the lanyard', 'the badge swings out, the next swings in'],
      open=[('rect', FULL, 'smoothie')], items=[(IMG, 'Clear badge holder with black lanyard-35.png', (300, 760), 420, -8)], doodles=[('arrow', 9, (700, 1000), 220, WHITE)],
      text=[('FOR THE [6AM COFFEE CROWD]', (540, 1380), 70, 'E', INK)]),
    B('Type two: the disco ball', '5-8s', ['', 'moment two full frame', 'a real disco ball drops in on a string; her sparkles orbit the product (swarm)',
        'her sparkles circling', 'the disco ball', 'the ball swings across as the wipe'],
      open=[('rect', FULL, 'hand')], items=[(IMG, 'Classic silver disco ball.png', (850, 420), 300, 0)],
      doodles=[('icon', 8, (300, 800), 120, WHITE), ('icon', 10, (760, 900), 110, WHITE), ('icon', 9, (420, 1150), 120, WHITE)],
      text=[('FOR THE [TYPE TWO]', (540, 1380), 80, 'E', INK)]),
    B('Type three', '8-10s', ['', 'moment three full frame', 'the party hat lands on the corner of the frame', 'her crown doodle over the product',
        'the hat', 'tags flood to the CTA'],
      open=[('rect', FULL, 'brush')], items=[(IMG, 'Pale yellow cone party hat-154.png', (880, 1560), 300, 15)], doodles=[('icon', 4, (520, 600), 220, WHITE)],
      text=[('FOR THE [TYPE THREE]', (520, 1380), 80, 'E', INK)]),
    B('CTA: sound like you?', '10-12s', ['red checks', 'the product on its own inside the green name tag', 'three tags stack up, the last one is yours',
        '', '', 'end'],
      bg=[('pat', CHECKS, RED, CREAM, FULL)], open=[('rect', (200, 880, 880, 1300), 'shelf')],
      items=[(IMG, 'Blank grass-green name tag sticker-30.png', (540, 1020), 860, 3)],
      text=[('SOUND LIKE YOU?', (540, 330), 100, 'B', INK), ('COMMENT "[KEYWORD]"', (540, 470), 90, 'B', RED)])]))

# ---- 10 Three people to gift it to : the gift-tag line ---------------------------------------------------------------------
TAGC, TAGB, TAGS = 'Cream gift tag with string loop-42.png', 'Pale blue scalloped gift tag-47.png', 'Blank kraft hang tag with twine-116.png'
SPECS.append(dict(num='10', title='Three people to gift it to', job='turn one product into three gift ideas',
    world='the wrapping table: kraft paper, jute twine, three real gift tags (cream, blue scalloped, kraft), a kraft cube gift; her stripes in cobalt',
    moves='gift tags as windows (dive into the tag), torn kraft wrap, tags orbit the gift at the end', beats=[
    B('Hook: three tags drop in', '0-2s', ['kraft paper + a band of her cobalt stripes', 'the gift-ready clip in a photo card',
        'three real gift tags drop in on twine and swing', 'her arrow from "3" to the tags; her underline', 'the tags on the twine', 'the camera dives into tag 1'],
      bg=[('img', IMG, 'Partly unrolled kraft paper roll-14.png', FULL), ('pat', STRIPES, COBALT, CREAM, (0, 1560, 1080, 1920))],
      open=[('round', (120, 600, 640, 1240), 'box')],
      items=[(IMG, TAGC, (780, 760), 200, -8), (IMG, TAGB, (900, 900), 220, 6), (IMG, TAGS, (760, 1100), 200, 10)],
      doodles=[('arrow', 9, (640, 470), 200, INK), ('under', 4, (420, 470), 420, INK)],
      text=[('GIFT THIS TO', (420, 300), 100, 'B', INK), ('3 PEOPLE', (420, 410), 110, 'B', COBALT)]),
    B('Person 1, inside the tag', '2-4.5s', ['', 'person one plays inside the cream tag, which grows until it fills the frame', 'the tag grows (dive)',
        'her burst on "1"', 'the twine across the top', 'kraft wrap covers the screen and tears open'],
      open=[('rect', FULL, 'hand')], items=[(IMG, TAGC, (200, 420), 220, -8)], doodles=[('burst', 3, (360, 360), 180, WHITE)],
      text=[('1', (200, 450), 110, 'B', COBALT), ("FOR YOUR [FRIEND WHO'S ALWAYS COLD]", (540, 1380), 58, 'E', INK)]),
    B('Person 2: the wrap tears', '4.5-7s', ['kraft paper half torn', 'person two behind the tear', 'the kraft wrap tears open', 'her dashed arrow at the product',
        'the blue tag swings in the corner', 'strip slice (kraft / cobalt) to person three'],
      bg=[('img', IMG, 'Partly unrolled kraft paper roll-14.png', FULL)], open=[('rect', (0, 300, 1080, 1620), 'smoothie')],
      items=[(IMG, TAGB, (880, 380), 230, 8)], doodles=[('path', 6, (420, 900), 320, WHITE, 20)],
      text=[('2', (880, 420), 110, 'B', COBALT), ('FOR YOUR [MUM WHO HAS EVERYTHING]', (540, 1400), 60, 'E', INK)]),
    B('Person 3', '7-9.5s', ['', 'person three full frame', 'the kraft tag lands on the corner', 'her circle round the product', 'all three tags gather', 'the gift pops in'],
      open=[('rect', FULL, 'vacuum')], items=[(IMG, TAGS, (180, 420), 210, -6)], doodles=[('frame', 1, (520, 900), 420, WHITE)],
      text=[('3', (180, 460), 110, 'B', COBALT), ('FOR YOUR [DAD WHO LOVES COFFEE]', (540, 1380), 60, 'E', INK)]),
    B('CTA: tags orbit the gift', '9.5-12s', ['kraft + cobalt stripes', 'the gift-wrap clip inside the real kraft cube gift',
        'the three tags orbit the gift (swarm)', 'her sparkles', '', 'end'],
      bg=[('img', IMG, 'Partly unrolled kraft paper roll-14.png', FULL), ('pat', STRIPES, COBALT, CREAM, (0, 1560, 1080, 1920))],
      open=[('round', (300, 760, 780, 1240), 'unbox')], items=[(IMG, 'Kraft paper cube gift with twine-38.png', (540, 1000), 760, 0),
        (IMG, TAGC, (190, 860), 180, -14), (IMG, TAGB, (900, 820), 190, 12), (IMG, TAGS, (540, 1420), 180, 4)],
      doodles=[('icon', 9, (880, 1250), 120, INK)], text=[('COMMENT "[KEYWORD]"', (540, 320), 100, 'B', COBALT), ('[GIFT WRAP AVAILABLE]', (540, 450), 70, 'E', INK)])]))

# ---- 11 A day with it : the clock and its wedges ----------------------------------------------------------------------------
CLOCK = 'Handless vintage brass wall clock-24.png'
SPECS.append(dict(num='11', title='A day with it', job='show it fits into a whole day',
    world='the clock of the day: the brass clock as four wedges of footage, the clock-tower crown as a divider, one alarm clock, a French press, a lava lamp; concrete grey + black/white type',
    moves='radial wedge expands into the next scene, the hour hand carried across, the clock tower rising as a divider', beats=[
    B('Hook: 7am', '0-2s', ['concrete grey', 'morning clip full frame', 'the real alarm clock rings (shakes) in the corner', 'her burst lines on the bells',
        'the hour hand (small, top right)', 'zoom out to the clock'],
      open=[('rect', FULL, 'lamp')], items=[(IMG, 'Classic Cream Twin-Bell Alarm Clock-185.png', (840, 1320), 380, 12)],
      doodles=[('burst', 5, (640, 1150), 200, WHITE)], text=[('A DAY WITH MY', (540, 320), 100, 'B', WHITE), ('[PRODUCT]', (540, 450), 110, 'E', (222, 176, 92)), ('[7AM]', (240, 1380), 90, 'E', WHITE)]),
    B('The clock of four clips', '2-3.5s', ['concrete grey + her black checks band', 'four wedges of the brass clock, a clip in each', 'the hour hand sweeps from 7 to 12',
        'her curved arrow round the rim', 'the clock', 'the 12 wedge expands to full frame'],
      bg=[('img', IMG, 'Light gray concrete mineral texture-4.png', FULL), ('pat', CHECKS, INK, CREAM, (0, 1600, 1080, 1920))],
      open=[('circle', (110, 470, 970, 1330), 'smoothie')], items=[(FALL, CLOCK, (540, 900), 1080, 0)], doodles=[('arrow', 2, (880, 380), 260, INK, -20)]),
    B('Midday', '3.5-6s', ['', 'midday clip full frame', 'the clock-tower crown rises from the bottom as a divider', 'her sparkle', 'the tower crown', 'the wedge for 4pm expands'],
      open=[('rect', FULL, 'smoothie')], items=[(FALL, 'Big Ben-Style Clock Tower Crown.png', (900, 1500), 380, 0)], doodles=[('icon', 9, (220, 420), 140, WHITE)],
      text=[('[12PM]', (260, 1380), 90, 'E', WHITE)]),
    B('Afternoon', '6-9s', ['', 'afternoon clip full frame', 'the hand points at 4; a real French press slides in', 'her arrow at the product',
        'the hour hand', 'the clock wheel turns to night'],
      open=[('rect', FULL, 'mop')], items=[(IMG, 'Classic stainless steel French press.png', (860, 1350), 300, 6)], doodles=[('arrow', 9, (520, 760), 220, WHITE)],
      text=[('[4PM]', (240, 1380), 90, 'E', WHITE)]),
    B('Night', '9-12s', ['concrete toned near-black', 'night clip full frame', 'a real lava lamp glows in the corner', 'her stars', 'the hour hand at 9', 'the clock returns'],
      open=[('rect', FULL, 'lamp')], items=[(IMG, 'Classic Amber Lava Lamp-2.png', (880, 1400), 200, 0)], doodles=[('icon', 1, (300, 420), 140, WHITE)],
      text=[('[9PM]', (240, 1380), 90, 'E', WHITE)]),
    B('CTA: resting in the clock face', '12-15s', ['dark concrete', 'the product resting inside the whole clock face', 'the hands meet at 12', '', '', 'end'],
      bg=[('img', IMG, 'Light gray concrete mineral texture-4.png', FULL)], open=[('circle', (150, 640, 930, 1420), 'shelf')], items=[(FALL, CLOCK, (540, 1030), 980, 0)],
      text=[('COMMENT', (540, 320), 120, 'B', INK), ('"[KEYWORD]"', (540, 460), 90, 'B', (222, 176, 92))])]))

# ---- 12 Your order just arrived : the front door -----------------------------------------------------------------------------
SPECS.append(dict(num='12', title='Your order just arrived', job='make the unboxing feel like a gift',
    world='the front door: a brass doorbell, a coir doormat, kraft padded mailers, a walnut rabbit-ear TV',
    moves='doorbell press shakes the frame, mailer tears open (torn reveal), the clip lives in the TV screen (POV)', beats=[
    B('Hook: ding dong', '0-2s', ['coir doormat', 'the package-on-the-doorstep clip inside the real walnut TV (POV)', 'a finger-press on the real brass doorbell shakes the frame',
        'her burst on the bell', 'the TV', 'the camera pushes into the TV screen'],
      bg=[('img', IMG, 'Plain coir doormat with black edge-41.png', FULL)], lens=[((150, 800, 690, 1190), 'box', 'rect')],
      items=[(IMG, 'Vintage Walnut Rabbit-Ear Television.png', (520, 880), 900, 0), (IMG, 'Vintage brass doorbell with ivory button-43.png', (900, 1450), 200, 0)],
      doodles=[('burst', 1, (900, 1250), 220, INK)], text=[('POV: YOUR', (540, 300), 100, 'B', INK), ('[PRODUCT] JUST ARRIVED', (540, 420), 80, 'E', RED)]),
    B('Opening it', '2-5s', ['', 'hands opening, full frame', 'a kraft mailer edge peels back across the top', 'her dashed arrow at the tape',
        'the mailer edge', 'the mailer tears open'],
      open=[('rect', FULL, 'unbox')], items=[(IMG, 'Sealed kraft padded mailer-39.png', (540, 120), 1100, 180)], doodles=[('path', 7, (700, 900), 300, WHITE, -30)],
      text=[("IT'S HERE", (540, 1380), 100, 'B', INK)]),
    B('First look (torn reveal)', '5-8s', ['kraft mailer torn open', 'the first-look clip inside the tear', 'the tear rips open from left to right', 'her sparkles',
        'torn kraft edge', 'the mailer flips'],
      bg=[('img', IMG, 'Partly unrolled kraft paper roll-14.png', FULL)], open=[('round', (120, 420, 960, 1400), 'kitchen')],
      doodles=[('icon', 9, (900, 360), 140, INK), ('icon', 11, (180, 1480), 120, INK)], text=[('[ONE DETAIL ABOUT THE PACKAGING]', (540, 1460), 56, 'E', INK)]),
    B('In use, on the mailer', '8-10s', ['doormat', 'the product-in-use clip on the front of a real kraft padded mailer', 'the mailer flips over to show the clip',
        'her heart doodle on the mailer', 'the mailer', 'the mailer slides onto the CTA'],
      bg=[('img', IMG, 'Plain coir doormat with black edge-41.png', FULL)], lens=[((250, 640, 830, 1220), 'hand', 'rect')],
      items=[(IMG, 'Sealed kraft padded mailer-39.png', (540, 950), 900, 0)], doodles=[('icon', 2, (860, 600), 180, RED)]),
    B('CTA: with its packaging', '10-12s', ['doormat + kraft', 'the product with its packaging, full frame card', 'the doorbell gives a last wiggle', '', '', 'end'],
      bg=[('img', IMG, 'Plain coir doormat with black edge-41.png', FULL)], open=[('round', (140, 560, 940, 1400), 'unbox')],
      items=[(IMG, 'Vintage brass doorbell with ivory button-43.png', (900, 1500), 200, 0)],
      text=[('GET YOURS AT [SHOP]', (540, 320), 80, 'E', INK), ('COMMENT "[KEYWORD]"', (540, 450), 90, 'B', RED)])]))

# ---- 13 How to use it in 3 steps : the number blocks ---------------------------------------------------------------------------
CUBES = ['Engraved wooden number one cube-45.png', 'Natural Wooden Cube with Engraved 2-46.png', 'Wooden cube with engraved number 3-50.png']
SPECS.append(dict(num='13', title='How to use it in 3 steps', job='remove the "is it hard to use?" doubt',
    world='the step blocks: three real wooden number cubes, a three-line recipe card, light oak, her sage zigzag',
    moves='each step plays on the face of its number block, which tumbles in and grows (object replaced by footage)', beats=[
    B('Hook: the blocks stack', '0-2s', ['light oak + a band of her sage zigzag', 'the product clip on the recipe card', 'three real number blocks drop and stack, one by one',
        'her underline under "3 steps"', 'the blocks', 'block 1 tumbles forward and grows'],
      bg=[('img', IMG, 'Light oak wood grain texture-2.png', FULL), ('pat', ZIG, SAGE, CREAM, (0, 1600, 1080, 1920))],
      open=[('round', (130, 640, 650, 1160), 'box')], items=[(IMG, c, (850, 820 + i * 230), 260, (-6, 4, -3)[i]) for i, c in enumerate(CUBES)],
      doodles=[('under', 4, (430, 520), 500, INK)], text=[('HOW TO USE [PRODUCT]', (440, 320), 80, 'E', INK), ('IN 3 STEPS', (440, 440), 110, 'B', SAGE)]),
    B('Step 1 on block 1', '2-5.5s', ['', 'step 1 full frame (it grew out of the face of block 1)', 'block 1 sits in the corner, its face still playing',
        'her arrow at the action', 'block 1', 'block 2 tumbles in over it'],
      open=[('rect', FULL, 'counter')], items=[(IMG, CUBES[0], (180, 400), 240, -8)], doodles=[('arrow', 9, (620, 760), 220, WHITE)],
      text=[('1. [STEP]', (540, 1380), 100, 'E', INK)]),
    B('Step 2', '5.5-9s', ['', 'step 2 full frame', 'block 2 lands in the corner', 'her circle round the detail', 'blocks 1 + 2', 'block 3 tumbles in'],
      open=[('rect', FULL, 'blender')], items=[(IMG, CUBES[1], (180, 400), 240, 6)], doodles=[('frame', 1, (560, 900), 380, WHITE)],
      text=[('2. [STEP]', (540, 1380), 100, 'E', INK)]),
    B('Step 3', '9-12.5s', ['', 'step 3 full frame', 'block 3 lands; the three stack', 'her dashed arrow', 'the stack', 'the stack slides away to the result'],
      open=[('rect', FULL, 'smoothie')], items=[(IMG, CUBES[2], (180, 400), 240, -4)], doodles=[('path', 6, (620, 820), 300, WHITE)],
      text=[('3. [STEP]', (540, 1380), 100, 'E', INK)]),
    B('CTA: the result', '12.5-15s', ['oak + sage zigzag', 'the result clip in a photo card on the recipe card', 'the three blocks spell 1 2 3 along the bottom; her ticks on each',
        'her ticks', '', 'end'],
      bg=[('img', IMG, 'Light oak wood grain texture-2.png', FULL), ('pat', ZIG, SAGE, CREAM, (0, 1600, 1080, 1920))],
      open=[('round', (160, 520, 920, 1300), 'smoothie')], items=[(IMG, c, (240 + i * 300, 1520), 220, 0) for i, c in enumerate(CUBES)],
      doodles=[('tick', i % 3, (300 + i * 300, 1380), 110, INK) for i in range(3)], text=[('COMMENT "[KEYWORD]"', (540, 360), 100, 'B', SAGE)])]))

# ---- 14 The annoying moment : the junk drawer -----------------------------------------------------------------------------
SPECS.append(dict(num='14', title='The annoying moment', job='name a pain, then fix it',
    world='the junk drawer: a messy wooden drawer, a tangled cord, crumpled paper balls, crossed plasters; black-and-white for the problem, colour for the fix',
    moves='B&W to colour, her scribbles as the annoyance that gets wiped away, the drawer slamming shut', beats=[
    B('Hook: the annoying moment', '0-2s', ['the messy drawer photo', 'the annoying-moment clip in B&W inside the drawer opening', 'the drawer slides open',
        'her angry scribbles round the problem', 'the scribbles', 'the drawer pulls toward camera'],
      bg=[('img', IMG, 'Messy wooden junk drawer-66.png', FULL)], open=[('grey', (140, 520, 940, 1240), 'counter')],
      doodles=[('scribble', 3, (850, 600), 240, RED), ('scribble', 4, (230, 1200), 220, RED)],
      text=[('[WHEN YOUR EARRINGS', (540, 300), 80, 'E', INK), ('TANGLE AGAIN]', (540, 410), 80, 'E', INK)]),
    B('Still annoying', '2-4s', ['', 'the problem clip full frame in B&W', 'a real tangled cord and paper balls pile in at the edges', 'her X marks',
        'the plasters (crossed)', 'the plasters peel off and colour floods in'],
      open=[('grey', FULL, 'counter')], items=[(IMG, 'Compact tangled black cord knot-54.png', (200, 1500), 360, 0), (IMG, 'Crumpled cream paper ball-58.png', (880, 1480), 220, 0),
        (IMG, 'Crossed beige adhesive plasters-63.png', (840, 420), 300, 10)], doodles=[('tick', 3, (260, 400), 180, RED)]),
    B('Fixed (colour)', '4-8s', ['', 'the same moment with your product, full COLOUR', 'colour sweeps in behind the plasters as they peel off',
        'her tick; her sparkles', 'the cord, now neatly gone', 'the drawer slams shut'],
      open=[('rect', FULL, 'hand')], doodles=[('tick', 0, (850, 420), 220, WHITE), ('icon', 9, (220, 1150), 140, WHITE)],
      text=[('FIXED', (480, 420), 160, 'B', RED, -6)]),
    B('CTA: on its own', '8-10s', ['the drawer, now tidy (closed)', 'the product on its own in a photo card on the drawer front', 'the drawer slams; a paper ball bounces out',
        '', '', 'end'],
      bg=[('img', IMG, 'Light oak wood grain texture-2.png', FULL)], open=[('round', (160, 560, 920, 1360), 'shelf')],
      items=[(IMG, 'Crumpled cream paper ball-58.png', (900, 1520), 200, 0)], text=[('[PRODUCT NAME]', (540, 330), 90, 'E', INK), ('COMMENT "[KEYWORD]"', (540, 460), 90, 'B', RED)])]))

# ---- 15 New drop reveal (fresh take) : the mountains open -------------------------------------------------------------------
SPECS.append(dict(num='15', title='New drop reveal (fresh take)', job='launch a new product or restock',
    world='the double horizon: her paper mountain bands hanging from the top and rising from the bottom, the clip in the sky between; a disco ball drops; a gothic window for the close-ups',
    moves='double skyline (mountains top + bottom), the disco ball drop, gothic window opening, rainbow arch frame', beats=[
    B('Hook: covered, between two horizons', '0-2s', ['terracotta mountains hanging upside down from the top, green ridge rising from the bottom', 'the covered product clip in the sky between',
        'the two mountain bands close in a little (the gap narrows)', 'her ? and sparkles', 'the two mountain bands', 'the bands part wide'],
      bg=[('fill', (236, 226, 204), FULL)], open=[('rect', (0, 560, 1080, 1360), 'box')],
      items=[(IMG, 'Torn-edge terracotta mountain band-5.png', (540, 380), 1300, 180), (IMG, 'Vintage green mountain ridge cutout-6.png', (540, 1560), 1300, 0)],
      doodles=[('icon', 9, (900, 700), 130, WHITE)], text=[('NEW:', (540, 640), 110, 'B', WHITE), ('[PRODUCT NAME]', (540, 760), 100, 'E', WHITE)]),
    B('The drop', '2-5s', ['', 'the reveal clip full frame (the mountains parted off the edges)', 'a real disco ball DROPS in on its string and spins; light flecks swarm',
        'her sparkles orbit (swarm)', 'the disco ball', 'the ball swings across into a gothic window'],
      open=[('rect', FULL, 'unbox')], items=[(IMG, 'Classic silver disco ball.png', (820, 360), 320, 0)],
      doodles=[('icon', 8, (240, 700), 110, WHITE), ('icon', 10, (860, 900), 110, WHITE), ('icon', 9, (300, 1200), 130, WHITE)]),
    B('Close-up 1: the gothic window', '5-7s', ['cream paper + her terracotta zigzag', 'close-up 1 inside the real gothic green-screen window',
        'the window frame slides up, close-up playing inside', 'her arrow at the detail', 'the window frame', 'the window grows to full frame'],
      bg=[('pat', ZIG, TERRA, CREAM, FULL)], open=[('screen', IMG, 'Gothic green-screen cathedral window frame-3.png', (540, 980), 760, 'close')],
      doodles=[('arrow', 9, (880, 620), 200, INK)]),
    B('Close-up 2 under the rainbow', '7-10s', ['', 'close-up 2 full frame', 'a real retro rainbow arch rises behind the product', 'her underline under the date',
        'the rainbow', 'the rainbow lifts to frame the CTA'],
      open=[('rect', FULL, 'close')], items=[(IMG, 'Muted retro rainbow arch-2.png', (540, 1560), 900, 0)], doodles=[('under', 4, (540, 470), 520, WHITE)],
      text=[('OUT [FRI 24 OCT]', (540, 380), 100, 'E', WHITE)]),
    B('CTA: in use, framed', '10-12s', ['the two mountain bands return (top and bottom)', 'the in-use clip in the sky between', 'the bands close back in like a frame',
        '', '', 'end'],
      bg=[('fill', (236, 226, 204), FULL)], open=[('rect', (0, 560, 1080, 1360), 'hand')],
      items=[(IMG, 'Torn-edge terracotta mountain band-5.png', (540, 380), 1300, 180), (IMG, 'Vintage green mountain ridge cutout-6.png', (540, 1560), 1300, 0)],
      text=[('OUT [DAY]', (540, 650), 90, 'E', WHITE), ('COMMENT "[KEYWORD]"', (540, 780), 90, 'B', WHITE)])]))

# ---- 16 What it feels like : the quilt -----------------------------------------------------------------------------------------
SPECS.append(dict(num='16', title='What it feels like', job='make people feel the texture through the screen',
    world='the quilt: patches of real textiles (cream cable knit, burlap, red gingham) and her patterns in grey; one touch object per word (feather, cotton, river stone)',
    moves='patchwork quilt dissolving one patch at a time into the clip, a touch object with each word', beats=[
    B('Hook: the quilt', '0-3s', ['a 3x4 quilt of real textile patches and her grey patterns', 'the squeeze clip behind the quilt',
        'patches dissolve one at a time, showing the clip underneath', 'her stitched dashed lines between patches', 'the remaining patches', 'the last patch goes'],
      bg=[('img', FALL, 'Cream cable-knit wool texture-47.png', (0, 0, 540, 480)), ('img', IMG, 'Red gingham cotton tablecloth texture-6.png', (540, 0, 1080, 480)),
          ('img', FALL, 'Natural burlap texture close-up-23.png', (0, 480, 540, 960)), ('pat', DOTS, (90, 90, 90), CREAM, (0, 960, 540, 1440)),
          ('img', FALL, 'Cream cable-knit wool texture-47.png', (540, 1440, 1080, 1920)), ('pat', STRIPES, (90, 90, 90), CREAM, (0, 1440, 540, 1920))],
      open=[('rect', (540, 480, 1080, 1440), 'hand')], doodles=[('path', 6, (540, 960), 300, INK, 0)],
      text=[('WHAT [PRODUCT]', (540, 320), 90, 'E', INK), ('FEELS LIKE', (540, 430), 110, 'B', RED)]),
    B('Soft', '3-6s', ['', 'the hand running across the surface, full frame', 'a real feather drifts across', 'her wavy underline under the word',
        'one gingham patch in the corner', 'patches flick back over as the wipe'],
      open=[('rect', FULL, 'sofa')], items=[(IMG, 'Curved white feather, isolated-212.png', (820, 600), 300, -20)], doodles=[('under', 2, (420, 1460), 360, WHITE)],
      text=[('[SOFT]', (420, 1380), 120, 'E', INK)]),
    B('Squishy', '6-9s', ['', 'the most satisfying moment full frame', 'a real cotton boll squashes and springs back', 'her burst on the squeeze',
        'the corner patch', 'patch wipe'],
      open=[('rect', FULL, 'brush')], items=[(IMG, 'Fluffy natural cotton boll-88.png', (860, 1350), 300, 0)], doodles=[('burst', 1, (700, 1200), 220, WHITE)],
      text=[('[SQUISHY]', (420, 1380), 120, 'E', INK)]),
    B('CTA: the quilt again', '9-12s', ['the quilt re-forms around the clip', 'the whole product, pulled back, in the middle patch', 'the patches stitch back in, one by one',
        '', '', 'end'],
      bg=[('img', FALL, 'Cream cable-knit wool texture-47.png', FULL), ('img', IMG, 'Red gingham cotton tablecloth texture-6.png', (0, 1440, 540, 1920)),
          ('img', FALL, 'Natural burlap texture close-up-23.png', (540, 1440, 1080, 1920))],
      open=[('rect', (180, 560, 900, 1360), 'shelf')], items=[(IMG, 'Smooth grey river stone with white vein-190.png', (880, 1420), 260, 0)],
      text=[('COMMENT "[KEYWORD]"', (540, 360), 100, 'B', RED)])]))

# ---- 17 Everything that goes into one : the flat lay --------------------------------------------------------------------------
SPECS.append(dict(num='17', title='Everything that goes into one', job='show the value in the materials',
    world='the flat lay from above: a walnut serving tray, glass jars, measuring spoons, a kitchen scale, parchment squares; her mustard checks',
    moves='the tray as the opening, materials landing one by one with labels, the scale needle swinging at the finish', beats=[
    B('Hook: the empty tray', '0-3s', ['parchment squares + her mustard checks band', 'the empty-table clip inside the real walnut tray (from above)',
        'the tray slides in and settles', 'her underline under "everything"', 'the tray', 'push into the tray'],
      bg=[('pat', CHECKS, MUSTARD, CREAM, FULL)], open=[('round', (200, 560, 880, 1360), 'counter')], items=[(IMG, 'Empty walnut serving tray-59.png', (540, 960), 900, 90)],
      doodles=[('under', 4, (540, 430), 600, INK)], text=[('EVERYTHING THAT', (540, 300), 100, 'B', INK), ('GOES INTO ONE', (540, 400), 100, 'B', INK)]),
    B('Materials land', '3-8s', ['', 'hands placing each material, full frame (one take)', 'a label card pops in at the edge for each material as it lands',
        'her arrows from each label toward the middle', 'the label cards', 'the scale slides in'],
      open=[('rect', FULL, 'kitchen')], items=[(IMG, 'Empty clear glass jar-64.png', (170, 1500), 240, 0), (IMG, 'Four nested stainless steel measuring spoons-165.png', (880, 1520), 300, 20)],
      doodles=[('arrow', 0, (300, 600), 200, WHITE, -20), ('arrow', 1, (800, 700), 200, WHITE, 20)],
      text=[('[MATERIAL 1]', (260, 420), 70, 'E', INK), ('[MATERIAL 2]', (800, 520), 70, 'E', INK), ('[MATERIAL 3]', (300, 1300), 70, 'E', INK)]),
    B('The finished one lands', '8-10s', ['', 'the finished product placed in the middle, full frame', 'a real kitchen scale needle swings as it lands', 'her burst',
        'the scale', 'push in close'],
      open=[('rect', FULL, 'box')], items=[(IMG, 'Cream vintage analog kitchen scale-68.png', (860, 1350), 340, 0)], doodles=[('burst', 3, (840, 1050), 220, WHITE)]),
    B('CTA: close', '10-12s', ['mustard checks', 'the product close in a photo card', 'the jars and spoons slide in round it', '', '', 'end'],
      bg=[('pat', CHECKS, MUSTARD, CREAM, FULL)], open=[('round', (160, 560, 920, 1360), 'close')],
      items=[(IMG, 'Empty clear glass jar-64.png', (170, 1520), 220, 0), (IMG, 'Four nested stainless steel measuring spoons-165.png', (880, 1520), 280, 20)],
      text=[('[PRODUCT NAME]', (540, 330), 90, 'E', INK), ('COMMENT "[KEYWORD]"', (540, 460), 90, 'B', RED)])]))

# ---- 18 Check this before you buy : the inspection clipboard ----------------------------------------------------------------
CLIP = 'Brown clipboard with blank white paper-65.png'
SPECS.append(dict(num='18', title='Check this before you buy', job='show expertise, then show yours passes',
    world='the inspection desk: a brown clipboard (the footage is the sheet), a six-box checklist pad, her tick boxes, a gold foil seal; navy + her cross pattern',
    moves='the clip IS the sheet on the clipboard, a tick box ticked per check, the seal stamped at the end', beats=[
    B('Hook: the clipboard', '0-2s', ['navy + her cream cross pattern', 'the product clip on the sheet of a real clipboard', 'the clipboard slides in and tilts toward camera',
        'her underline under "3 things"', 'the clipboard', 'push into the sheet'],
      bg=[('pat', CROSS, NAVY, CREAM, FULL)], items=[(IMG, CLIP, (540, 1080), 760, -3)], lens=[((230, 760, 850, 1500), 'box', 'rect')],
      doodles=[('under', 4, (540, 470), 600, CREAM)], text=[('3 THINGS TO CHECK', (540, 300), 100, 'B', CREAM), ('BEFORE YOU BUY A [TYPE]', (540, 410), 70, 'E', CREAM)]),
    B('Check 1', '2-6s', ['', 'check one shown on your product, full frame', 'a tick box in the corner gets ticked by her marker', 'her tick in the box; her arrow at the spot',
        'the checklist (1 ticked)', 'the page flips up like a clipboard sheet'],
      open=[('rect', FULL, 'close')], doodles=[('tick', 6, (180, 420), 200, WHITE), ('arrow', 9, (700, 800), 220, WHITE)], text=[('1. [CHECK]', (540, 1380), 100, 'E', INK)]),
    B('Check 2', '6-10s', ['', 'check two, full frame', 'the second box ticks', 'her circle round the detail', 'checklist (2 ticked)', 'page flip'],
      open=[('rect', FULL, 'counter')], doodles=[('tick', 7, (180, 420), 200, WHITE), ('frame', 1, (560, 900), 400, WHITE)], text=[('2. [CHECK]', (540, 1380), 100, 'E', INK)]),
    B('Check 3', '10-13s', ['', 'check three, full frame', 'the third box ticks', 'her dashed arrow', 'checklist (3 ticked)', 'the clipboard returns'],
      open=[('rect', FULL, 'brush')], doodles=[('tick', 6, (180, 420), 200, WHITE), ('path', 6, (620, 840), 300, WHITE)], text=[('3. [CHECK]', (540, 1380), 100, 'E', INK)]),
    B('CTA: passes all three', '13-15s', ['navy cross pattern', 'your product on the clipboard sheet', 'a real gold foil seal stamps onto the corner', 'three ticks down the side',
        '', 'end'],
      bg=[('pat', CROSS, NAVY, CREAM, FULL)], items=[(IMG, CLIP, (540, 1080), 760, 2), (IMG, 'Blank gold foil seal sticker-175.png', (820, 1480), 280, 0)],
      lens=[((230, 760, 850, 1500), 'shelf', 'rect')], doodles=[('tick', i, (130, 820 + i * 200), 120, CREAM) for i in range(3)],
      text=[('MINE CHECKS ALL THREE', (540, 300), 90, 'E', CREAM), ('COMMENT "[KEYWORD]"', (540, 420), 90, 'B', MUSTARD)])]))

# ---- 19 Pair it with : the locket -----------------------------------------------------------------------------------------------
LOCKET = 'Open vintage gold locket, blank inside.png'
SPECS.append(dict(num='19', title='Pair it with', job='sell the second item (or a bundle)',
    world='the locket: a real open gold locket with the product in one half and the pairing in the other; a rose porcelain tea set as the "perfect pair"; burgundy and blush stripes',
    moves='a locket opening onto two clips (her idea bank), the halves swapping pairings', beats=[
    B('Hook: the locket opens', '0-2s', ['her stripes in burgundy and blush (her Vintage Burgundy and Blush Stripes)', 'the main product in the left half of the locket',
        'the real gold locket swings in on its chain and opens', 'her sparkles on the hinge', 'the locket', 'the right half fills with pairing one'],
      bg=[('img', IMG, 'Vintage Burgundy and Blush Stripes.png', FULL)], items=[(FALL, LOCKET, (540, 1000), 980, 0)], lens=[((140, 760, 520, 1220), 'box')],
      doodles=[('icon', 9, (540, 700), 130, CREAM)], text=[('WHAT TO PAIR WITH', (540, 300), 90, 'B', CREAM), ('[PRODUCT]', (540, 420), 100, 'E', CREAM)]),
    B('Pairing 1', '2-5s', ['burgundy stripes', 'product left, pairing one right, inside the locket', 'the right half lights up', 'her + between the halves',
        'the locket', 'the right half spins to pairing two'],
      bg=[('img', IMG, 'Vintage Burgundy and Blush Stripes.png', FULL)], items=[(FALL, LOCKET, (540, 1000), 980, 0)],
      lens=[((140, 760, 520, 1220), 'box'), ((560, 760, 940, 1220), 'smoothie')], text=[('+ [PRODUCT ONE]', (540, 1430), 90, 'E', CREAM)]),
    B('Pairing 2 (full frame)', '5-8s', ['', 'pairing two full frame (the locket half zoomed in)', 'a real rose tea set slides in: the classic pair', 'her heart doodle',
        'the tea set', 'zoom back out to the locket'],
      open=[('rect', FULL, 'blender')], items=[(IMG, 'Vintage Rose Porcelain Tea Set.png', (820, 1480), 420, 0)], doodles=[('icon', 3, (260, 420), 180, WHITE)],
      text=[('+ [PRODUCT TWO]', (480, 1380), 90, 'E', INK)]),
    B('Pairing 3', '8-10s', ['stripes', 'product + pairing three in the locket halves', 'the locket closes and reopens with the new pair', 'her dashed arrow',
        'the locket', 'all of them gather'],
      bg=[('img', IMG, 'Vintage Burgundy and Blush Stripes.png', FULL)], items=[(FALL, LOCKET, (540, 1000), 980, 0)],
      lens=[((140, 760, 520, 1220), 'box'), ((560, 760, 940, 1220), 'hand')], doodles=[('path', 6, (540, 600), 300, CREAM)], text=[('+ [PRODUCT THREE]', (540, 1430), 90, 'E', CREAM)]),
    B('CTA: all together', '10-12s', ['stripes', 'all of them together in a photo card', 'the locket hangs over the card', '', '', 'end'],
      bg=[('img', IMG, 'Vintage Burgundy and Blush Stripes.png', FULL)], open=[('round', (160, 640, 920, 1420), 'shelf')], items=[(FALL, LOCKET, (860, 600), 380, 12)],
      text=[('[BUNDLE NAME]', (500, 330), 90, 'E', CREAM), ('COMMENT "[KEYWORD]"', (500, 460), 90, 'B', CREAM)])]))

# ---- 20 What buyers said : the review phones -------------------------------------------------------------------------------------
PH = 'Graphite Smartphone With Green Screen-38.png'
SPECS.append(dict(num='20', title='What buyers said', job='let real buyers sell it',
    world="the prize table: white marble, gold foil stars (five, then carried), the buyer's review screenshots in real phones, her speech bubbles, one gold trophy",
    moves='phone screens as the windows, her speech bubble round each review, a gold star carried across, two-tone strip slice (gold / black)', beats=[
    B('Hook: five stars', '0-2s', ['white marble + a band of her black dots', 'the product clip full frame behind', 'five real gold stars stick on one by one',
        'her underline under the title', 'one gold star', 'a phone slides in'],
      open=[('rect', FULL, 'blender')], items=[(IMG, 'Gold foil star sticker-95.png', (180 + i * 180, 300), 150, (-12, 8, -4, 10, -18)[i]) for i in range(5)],
      doodles=[('under', 4, (540, 620), 560, WHITE)], text=[('WHAT BUYERS SAID', (540, 470), 110, 'B', INK)]),
    B('Review 1 in a phone', '2-5s', ['', 'product full frame; the review screenshot in a real phone screen', 'the phone slides up, her speech bubble pops round it',
        'her speech bubble; her arrow', 'the gold star rides on the phone', 'strip slice (gold / black)'],
      open=[('rect', FULL, 'blender'), ('screen', TECH, PH, (760, 1120), 400, 'box')], items=[(IMG, 'Gold foil star sticker-95.png', (900, 760), 140, 10)],
      doodles=[('bubble', 3, (740, 1100), 560, WHITE), ('arrow', 9, (360, 900), 200, WHITE)]),
    B('Review 2', '5-8s', ['marble', 'the review in a hand-held phone (her photo), product clip behind the hand', 'the hand brings the phone in', 'her bubble',
        'the gold star', 'the phone screen grows into the next clip'],
      bg=[('img', IMG, 'Soft veined white marble texture-1.png', FULL)], open=[('rect', (0, 0, 1080, 1100), 'smoothie'), ('screen', TECH, 'Hand Holding Graphite Smartphone with Green Screen-40.png', (620, 1350), 520, 'box')],
      items=[(IMG, 'Gold foil star sticker-95.png', (220, 1250), 150, -10)], doodles=[('bubble', 1, (300, 600), 400, WHITE)]),
    B('Review 3', '8-10s', ['', 'product full frame', 'the review phone tilts in from the left', 'her sparkles', 'the gold star', 'gold strips sweep to the CTA'],
      open=[('rect', FULL, 'blender'), ('screen', TECH, PH, (330, 1120), 400, 'box')], doodles=[('icon', 9, (840, 600), 140, WHITE), ('bubble', 0, (330, 1100), 560, WHITE)]),
    B('CTA: one trophy', '10-12s', ['white marble', 'the product on its own in a photo card', 'one real gold trophy rises; the gold star lands on it', '', '', 'end'],
      bg=[('img', IMG, 'Soft veined white marble texture-1.png', FULL)], open=[('round', (160, 560, 920, 1320), 'blender')],
      items=[(IMG, 'Plain gold trophy on black base-223.png', (860, 1500), 300, 0), (IMG, 'Gold foil star sticker-95.png', (860, 1270), 120, 0)],
      text=[('COMMENT "[KEYWORD]"', (540, 360), 100, 'B', INK)])]))

# ---- 21 Small batch : the cooling rack -------------------------------------------------------------------------------------------
TAGK = 'Blank kraft hang tag with twine-116.png'
SPECS.append(dict(num='21', title='Small batch', job='make "made in small batches" feel special and scarce',
    world='the bakery rack: a silver wire cooling rack as the grid over the footage, kraft hang tags counting up, parchment squares; her red stripes',
    moves='the clip seen through the cooling-rack grid, tags counting up one by one, the rack lifting away', beats=[
    B('Hook: through the rack', '0-3s', ['parchment + her red stripes band', 'the whole-batch clip seen through a real wire cooling rack', 'the rack slides on over the clip',
        'her circle round the count', 'the rack', 'the rack slides along the batch'],
      bg=[('pat', STRIPES, RED, CREAM, (0, 1600, 1080, 1920))], open=[('rect', (0, 0, 1080, 1600), 'shelf')], items=[(IMG, 'Silver wire baking cooling rack-113.png', (540, 820), 1100, 0)],
      doodles=[('frame', 1, (540, 470), 520, WHITE)], text=[("THIS WEEK'S BATCH:", (540, 330), 90, 'B', WHITE), ('[24] [CANDLES]', (540, 470), 100, 'E', RED)]),
    B('The slow pass', '3-7s', ['', 'the slow pass along the batch, full frame', 'kraft tags count up along the bottom: 1, 2, 3 ...', 'her dashed path along the row',
        'the row of tags', 'the rack lifts away'],
      open=[('rect', FULL, 'shelf')], items=[(IMG, TAGK, (160 + i * 190, 1650), 150, (-8, 4, -4, 8, -6)[i]) for i in range(5)], doodles=[('path', 7, (540, 900), 400, WHITE)],
      text=[('[24] MADE', (540, 1380), 100, 'E', INK)]),
    B('One picked up', '7-10s', ['', 'one picked up, close', 'one tag flips to show a number (this one is No. [7])', 'her burst', 'that one tag', 'push into the tag'],
      open=[('rect', FULL, 'hand')], items=[(IMG, TAGK, (850, 600), 260, 8)], doodles=[('burst', 3, (850, 380), 200, WHITE)],
      text=[('[ONE DETAIL ABOUT THIS BATCH]', (520, 1380), 64, 'E', INK)]),
    B('CTA: packed', '10-12s', ['parchment squares + red stripes', 'one being packed, in a photo card on parchment', 'the tag ties on', '', '', 'end'],
      bg=[('img', IMG, 'Neat stack of parchment squares-123.png', FULL), ('pat', STRIPES, RED, CREAM, (0, 1600, 1080, 1920))], open=[('round', (160, 560, 920, 1360), 'unbox')],
      items=[(IMG, TAGK, (870, 1380), 240, 10)], text=[('[PRODUCT NAME]', (540, 330), 90, 'E', INK), ('COMMENT "[KEYWORD]"', (540, 460), 90, 'B', RED)])]))

# ---- 23 Every option in 10 seconds : the paint counter ---------------------------------------------------------------------------
FAN = 'Muted Paint Chip Fan Deck-235.png'
SPECS.append(dict(num='23', title='Every option in 10 seconds', job='show the whole range fast',
    world='the paint counter: white pegboard, a real paint-chip fan deck whose blades each carry an option, single chips as windows, the oak display shelf',
    moves='radial wedges (the fan blades fan out, one expands into the next option), chip-shaped windows, the shelf as the CTA grid', beats=[
    B('Hook: the fan opens', '0-1.4s', ['white pegboard', 'a still of each option on the fan blades', 'the real fan deck fans open from its pivot',
        'her underline under "10 seconds"', 'the fan pivot', 'blade 1 expands to full frame'],
      bg=[('img', IMG, 'White pegboard grid texture-5.png', FULL)], items=[(IMG, FAN, (540, 1300), 1000, 0)],
      doodles=[('under', 0, (540, 650), 620, INK)], text=[('EVERY [COLOUR] IN', (540, 380), 90, 'E', INK), ('10 SECONDS', (540, 520), 120, 'B', TERRA)]),
    B('Options 1 to 8 (1s each)', '1.4-9.4s', ['', 'each option full frame; its name on a real paint chip across the bottom seam', 'the next blade sweeps across like a fan wipe',
        'her arrow at the product (alternating sides)', 'the chip in the corner (changes colour each option)', 'the fan wipe'],
      open=[('rect', FULL, 'sofa')], items=[(IMG, 'Blank terracotta paint sample card-94.png', (220, 1450), 260, -6)],
      doodles=[('arrow', 9, (680, 820), 220, WHITE)], text=[('[OPTION 1]', (250, 1450), 70, 'E', WHITE), ('1/8', (900, 330), 80, 'B', WHITE)]),
    B('Pause beat', '~5s', ['pegboard', 'no video: full-screen words', 'the words pop with the fan half-open behind', 'her heart', 'the fan', 'the fan wipes back'],
      bg=[('img', IMG, 'White pegboard grid texture-5.png', FULL)], items=[(IMG, FAN, (540, 1500), 800, 0)], doodles=[('icon', 2, (840, 520), 160, RED)],
      text=[('PAUSE ON', (540, 620), 120, 'B', INK), ('YOUR FAVOURITE', (540, 780), 110, 'B', TERRA)]),
    B('CTA: the shelf', '9.4-12s', ['pegboard', 'all options together on the real oak shelf, one clip per cubby', 'the clips drop onto the shelves one by one', 'her sparkles',
        '', 'end'],
      bg=[('img', IMG, 'White pegboard grid texture-5.png', FULL)], items=[(IMG, 'Pale oak three-tier display shelf-74.png', (540, 1080), 900, 0)],
      lens=[((230, 640, 520, 880), 'sofa', 'rect'), ((560, 640, 850, 880), 'vacuum', 'rect'), ((230, 980, 520, 1220), 'shelf', 'rect'), ((560, 980, 850, 1220), 'mop', 'rect')],
      text=[('ALL [8] AT [SHOP]', (540, 330), 90, 'E', INK), ('COMMENT "[KEYWORD]"', (540, 460), 90, 'B', TERRA)])]))

# ---- 24 Make it last : the hourglass ---------------------------------------------------------------------------------------------
HG = 'Classic wooden hourglass with flowing sand-238.png'
SPECS.append(dict(num='24', title='Make it last', job='care tips that make the product worth more',
    world='the care kit: a wooden hourglass (its two bulbs are windows), a woven care label with the tip, a sage watering can; sage + her wavy lines',
    moves='the hourglass bulbs as two windows, the hourglass flips as the transition, the tip written on a real care label', beats=[
    B('Hook: the hourglass', '0-2s', ['sage + her cream wavy lines', 'the product clip in the top bulb of a real hourglass', 'sand runs; the hourglass turns slightly',
        'her underline under "longer"', 'the hourglass', 'the hourglass flips'],
      bg=[('pat', WAVY, SAGE, CREAM, FULL)], items=[(IMG, HG, (540, 1120), 640, 0)], lens=[((380, 700, 700, 1000), 'shelf')],
      doodles=[('under', 2, (540, 520), 520, INK)], text=[('MAKE YOUR [PRODUCT]', (540, 320), 80, 'E', INK), ('LAST LONGER', (540, 440), 110, 'B', INK)]),
    B('Tip, part 1', '2-7s', ['', 'care tip one full frame', 'a real woven care label slides up with the tip on it', 'her arrow at the action', 'the care label', 'the hourglass flips (wipe)'],
      open=[('rect', FULL, 'counter')], items=[(IMG, 'Blank woven cotton care label-86.png', (540, 1380), 240, 88)], doodles=[('arrow', 9, (700, 760), 220, WHITE)],
      text=[('[THE TIP, LINE ONE]', (540, 1380), 70, 'E', INK)]),
    B('Tip, part 2', '7-11s', ['', 'care tip two full frame', 'the watering can tips in from the corner (for plants; swap for your care tool)', 'her dashed arrow',
        'the care label', 'flip to the result'],
      open=[('rect', FULL, 'mop')], items=[(IMG, 'Classic sage green watering can-232.png', (860, 420), 380, 20), (IMG, 'Blank woven cotton care label-86.png', (540, 1380), 240, 92)],
      doodles=[('path', 6, (400, 900), 300, WHITE)], text=[('[THE TIP, LINE TWO]', (540, 1380), 70, 'E', INK)]),
    B('Result: both bulbs', '11-13s', ['sage wavy lines', 'before in the top bulb, after in the bottom bulb', 'the sand finishes', 'her tick by the bottom bulb', 'the hourglass', 'the bottom bulb grows'],
      bg=[('pat', WAVY, SAGE, CREAM, FULL)], items=[(IMG, HG, (540, 1000), 760, 0)], lens=[((340, 520, 740, 880), 'counter'), ((340, 1120, 740, 1480), 'shelf')],
      doodles=[('tick', 0, (850, 1300), 160, INK)]),
    B('CTA: at its best', '13-15s', ['sage', 'the product looking its best in a photo card', 'the care label tucks under the card', '', '', 'end'],
      bg=[('pat', WAVY, SAGE, CREAM, FULL)], open=[('round', (160, 560, 920, 1360), 'shelf')], items=[(IMG, 'Blank woven cotton care label-86.png', (740, 1420), 200, 86)],
      text=[('[PRODUCT NAME]', (540, 330), 90, 'E', INK), ('COMMENT "[KEYWORD]"', (540, 460), 90, 'B', INK)])]))

# ---- 25 Mine vs. the usual kind : the weigh-in --------------------------------------------------------------------------------
SCALE_L, SCALE_T = 'Level vintage brass balance scale-105.png', 'Tilted brass balance scale-124.png'
SPECS.append(dict(num='25', title='Mine vs. the usual kind', job='show why yours beats the common version',
    world='the weigh-in: a brass balance scale (level, then tipped your way), a plain cardboard box as "the usual kind", a brass boxing bell for each round; black + her checks',
    moves='the two pans as windows, the scale tipping a little more each round, the boxing bell as the round change', beats=[
    B('Hook: on the scale', '0-2s', ['black + her cream checks band', 'yours on one pan, the usual kind on the other (round windows)', 'the real brass scale settles level',
        'her "vs" scribble between the pans', 'the scale', 'DING: the boxing bell'],
      bg=[('fill', (20, 20, 22), FULL), ('pat', CHECKS, INK, CREAM, (0, 1600, 1080, 1920))], items=[(IMG, SCALE_L, (540, 1050), 1000, 0)],
      lens=[((90, 860, 390, 1160), 'box'), ((690, 860, 990, 1160), 'vacuum')],
      text=[('[MINE]', (240, 1260), 80, 'E', WHITE), ('THE USUAL KIND', (840, 1260), 60, 'B', WHITE), ('VS', (540, 420), 160, 'B', RED)]),
    B('Round 1', '2-5s', ['', 'difference one full frame', 'the boxing bell rings in the corner: ROUND 1', 'her arrow at the difference', 'the bell', 'DING'],
      open=[('rect', FULL, 'close')], items=[(IMG, 'Classic brass boxing ring bell-89.png', (860, 400), 300, 0)], doodles=[('arrow', 9, (560, 820), 220, WHITE)],
      text=[('ROUND 1', (300, 380), 110, 'B', RED), ('[DIFFERENCE ONE]', (540, 1380), 80, 'E', INK)]),
    B('Round 2: the usual kind', '5-8s', ['', 'difference two, the usual kind side', 'a plain cardboard box (the usual kind) gets her X', 'her X over the usual kind',
        'the bell', 'DING'],
      open=[('rect', FULL, 'counter')], items=[(IMG, 'Unmarked cardboard shipping box-110.png', (850, 1450), 340, 6)], doodles=[('tick', 3, (850, 1420), 280, RED)],
      text=[('ROUND 2', (300, 380), 110, 'B', RED), ('[DIFFERENCE TWO]', (480, 1380), 80, 'E', INK)]),
    B('Round 3', '8-10s', ['', 'difference three full frame', 'the bell; her tick on yours', 'her tick', 'the scale returns', 'the scale tips your way'],
      open=[('rect', FULL, 'brush')], doodles=[('tick', 0, (800, 600), 220, WHITE)], text=[('ROUND 3', (300, 380), 110, 'B', RED), ('[DIFFERENCE THREE]', (540, 1380), 80, 'E', INK)]),
    B('CTA: the scale tips', '10-12s', ['black + checks', 'yours in use on the low pan (the winner), the usual kind up high', 'the real scale tips toward yours', '', '', 'end'],
      bg=[('fill', (20, 20, 22), FULL), ('pat', CHECKS, INK, CREAM, (0, 1600, 1080, 1920))], items=[(IMG, SCALE_T, (540, 1050), 1000, 0)],
      lens=[((100, 960, 400, 1260), 'hand'), ((680, 720, 980, 1020), 'vacuum')],
      text=[('WINNER: [PRODUCT]', (540, 330), 90, 'E', WHITE), ('COMMENT "[KEYWORD]"', (540, 460), 90, 'B', RED)])]))
