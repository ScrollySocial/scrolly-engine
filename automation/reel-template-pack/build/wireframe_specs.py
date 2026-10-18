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
