"""08 A real customer question, approved 2026-10-18 as the round-4 motion test (build/story7.py, "super cute").
FULLY EDITABLE build (2026-10-20, build/editable.py; the motion test plays P.SLOW times longer, so script times are
scaled by SLOW): every word is CapCut text (DM Serif Display built-in words with the last word Italic; the question,
the answer note, the three more questions and the CTA lines in Montserrat, the [brackets] on CapCut's text
background); the underline and the arrow are Scrolly Doodles letters (recolour like text); the light-blue stage is
CapCut's background colour under a colourless parchment grain; the rotary phone, the DM cards, the sticky note and the
pinned photo cards are real photos moving on keyframes; the three clips are real clip layers (placeholder cards until
the buyer's clips go in), the pinned photos are clip layers under a card with a window.
CapCut limits: the ray burst behind the ringing phone is a picture (text always sits above pictures; recolour it with
Adjust > HSL); the motion-blur swipes are plain slides; the DM cards are pictures, so their colour is changed with
Adjust > HSL (the words on them are text)."""
import editable as Ed
from editable import at, still, then
import editable_b as B
from editable_b import pop, word, out_l, in_r, shake
import play as P
import story7 as S7
from story4 import card
from collage_kit import doodle as art_doodle
from motion_b2 import ease, back_out, seg, lerp
from engine import W, H

SL = B.SL; END = S7.SECS['08']
SPEC = dict(num='08', title='A real customer question', subtitle='24 seconds. Three clips: the answer, more of the answer, in use.',
            font='montserrat', dir='08-a-real-customer-question', folder='Template 08 - A real customer question',
            project='08 A real customer question', cover_at=3.0,
            slots=[('The answer, shown', 'Show the answer to the question, upright (at least 7 seconds)'),
                   ('More of the answer', 'A second angle or the next step'),
                   ('In use', 'Your product being used, upright')],
            test_clips=[('IMG_1381', 1.0), ('IMG_1414', 1.0), ('IMG_1391', 1.0)])
INK, WHITE, WINE, BL = (24, 23, 22), (255, 255, 255), P.PAL['wine'], P.PAL['blue']
STAGE = BL
Q = ['[the question your', 'customer asked]']
DMS = ((['[another question]'], 4, 'pin-head-black', 'can I gift wrap it?'), (['[and another]'], -5, 'pin-head-white', 'is it dishwasher safe?'),
       (['[one more]'], 3, 'pin-head-cream', 'do you ship to Canada?'))

def dm(lines, w, pin='pin-head-cream'):
    """A pinned DM card (unturned; the layer turns it) and the offset of its words from its centre."""
    full, blank = P.pinned(P.proof_card(lines, w, WINE), 0, pin), P.pinned(P.proof_card([''] * len(lines), w, WINE), 0, pin)
    return blank, B.anchor(full, blank)

def reel():
    g = S7.setup_08(); r = B.SlowReel(END)
    from collage_kit import raw
    r.art('paper-grain', Ed.grain(raw('images', 'Cream parchment paper stack-205.png', (0.3, 0.3, 0.7, 0.62)), 0.2), 0, None, 1, still(540, 960))

    # 1 (0-2.4) the clip full frame; the question card already up, swaying on its pin; "you asked"; swipes out at 2.1
    o1 = out_l(2.1)
    r.clip(0, 0, 2.4, 10, then(still(540, 960), o1), src=2.0 * SL)
    card1, off1 = dm(Q, 620)
    def sway(ts):
        sw_ = 5 * Ed.math.sin(ts * 3.2) * Ed.math.exp(-0.6 * ts); return at(540, lerp(1180, 1260, ease(seg(ts, 0, 0.4))), 1, 4 - sw_)
    f1 = then(sway, o1)
    r.art('dm-1', card1, 0, 2.4, 20, f1)
    r.plain('\n'.join(Q), 40, 0, 2.4, Ed.child(f1, off1), WHITE, test='can I wash it\non 30?')
    r.serif('you asked', 170, 0.0, 2.4, then(word(540, 960, 0.0, 2), o1), WHITE, WINE)
    r.doodle('under', 0, 520, 0.6, 2.4, then(pop(540, 1070, 0.6, 2, 0.3), o1), WINE)

    # 2 (2.1-4.2) the stage: the rotary phone rings, ONE burst behind it; [can I wash it?]; swipes out at 3.9
    i2, o2 = B.in_r(2.1), out_l(3.9)
    r.art('burst-1', art_doodle('burst', 2, 760, WINE), 2.5, 4.2, 18, then(lambda ts: at(540, 1260, 0.9 + 0.1 * back_out(seg(ts, 2.5, 2.8), 1.5)), o2))
    def ring(t0, t1, x, y, s=1.0, a=2.4, b=2.7):
        return lambda ts: at(x + shake(ts, t0, t1), y, s * back_out(seg(ts, a, b), 1.6), -shake(ts, t0, t1))
    r.art('phone-1', g['phone'], 2.1, 4.2, 19, then(ring(2.5, 3.6, 540, 1300), i2, o2))
    r.boxed('[can I wash it?]', 84, 2.6, 4.2, then(pop(540, 820, 2.6, 4), o2), WHITE, 'can I wash it?')

    # 3 (3.9-6.6) the answer, full frame; the word sandwich low: here's / the answer / [in one line]
    r.clip(0, 3.9, 6.6, 11, then(still(540, 960), in_r(3.9)))
    bh = max(i.height for i, _ in g['answer']); c = (540, 1300)
    r.boxed("here's", 76, 4.3, 6.6, word(c[0], c[1] - bh / 2 - g['heres'].height / 2 + 30, 4.3, 4))
    r.serif('the answer', 190, 4.45, 6.6, word(c[0], c[1], 4.45, 0), WHITE, WINE)
    r.boxed('[in one line]', 76, 4.91, 6.6, word(c[0], c[1] + bh / 2 + g['line'].height / 2 - 30, 4.91, 0), BL, 'yes, on 30')

    # 4 (6.6-8.6) the stage: the question card swaps in place for the answer note; the clip pinned beside it; arrow
    o4 = out_l(8.3)
    small, offs = dm(Q, 440)
    def shrink(ts):
        sw_ = ease(seg(ts, 6.8, 7.1)); return at(330, 860, max(0.0, 1 - sw_ * 2), 4)
    r.art('dm-small', small, 6.6, 6.95, 20, shrink)
    r.plain('\n'.join(Q), 30, 6.6, 6.95, Ed.child(shrink, offs), WHITE, test='can I wash it\non 30?')
    note = P.sticky('', 460, px=58, pin='pin-head-black'); onote = B.anchor(P.sticky('[yes! wash\nit at 30°]', 460, px=58, pin='pin-head-black'), note)
    fn = then(pop(330, 860, 6.95, 5, 0.25, 1.6), o4)
    r.art('answer-note', note, 6.95, 8.6, 21, fn)
    r.plain('[yes! wash\nit at 30°]', 50, 6.95, 8.6, Ed.child(fn, onote), INK, test='yes! wash\nit at 30°')
    photo, psize, poff = B.hole(P.pinned(card(B.keyed((420, 540)), 420, 540), 0, 'pin-head-white'))
    fp = then(pop(760, 1180, 6.7, -6), o4)
    r.clip(0, 6.6, 8.6, 15, Ed.child(fp, poff), size=psize, src=(6.6 - 4.2) * SL)
    r.art('photo-1', photo, 6.6, 8.6, 16, fp)
    r.doodle('arrow', 2, 220, 7.5, 8.6, then(pop(560, 1040, 7.5, -30, 0.3), o4), WINE)

    # 5 (8.3-10.6) answer part 2, full frame; [the answer, line two]
    o5 = out_l(10.3)
    r.clip(1, 8.3, 10.6, 12, then(still(540, 960), in_r(8.3), o5))
    r.boxed('[the answer, line two]', 78, 8.7, 10.6, then(pop(540, 1380, 8.7, 4), o5), WHITE, 'machine wash, cold')

    # 6 (10.3-13.0) the stage: you all asked; three more questions pinned in one tight column; the phone rings again
    i6, o6 = B.in_r(10.3), out_l(12.7)
    r.serif('you all asked', 120, 10.6, 13.0, then(word(540, 330, 10.6, 2), o6), WINE, WHITE)
    for i, ((lines, rr, pn, test), (x, y)) in enumerate(zip(DMS, ((500, 640), (580, 900), (500, 1160)))):
        cd, off = dm(lines, 520, pn); t0 = 10.9 + i * 0.4; f = then(pop(x, y, t0, -rr), o6)
        r.art(f'dm-{i + 2}', cd, t0, 13.0, 20 + i, f)
        r.plain(lines[0], 34, t0, 13.0, Ed.child(f, off), WHITE, test=test)
    r.art('phone-2', g['phone'], 11.9, 13.0, 24, then(ring(12.0, 12.5, 820, 1580, 0.6, 11.9, 12.15), o6))

    # 7 (12.7-14.4) in use, full frame
    r.clip(2, 12.7, 14.4, 13, then(still(540, 960), in_r(12.7)))

    # 8 (14.4-end) CTA: the clip shrinks to a pinned photo; Comment / "[KEYWORD]" / [more questions?] grouped on top
    cta, csize, coff = B.hole(P.pinned(card(B.keyed((620, 800)), 620, 800), 0, 'pin-head-black'))
    def shrink8(ts):
        u = ease(seg(ts, 14.4, 14.75)); return at(540, lerp(960, 1180, u), lerp(1488 / 620, 1.0, u), -3 * seg(ts, 14.65, 14.75))
    r.clip(0, 14.4, None, 14, Ed.child(shrink8, coff), size=csize, src=2.0)
    r.art('photo-cta', cta, 14.4, None, 15, shrink8)
    r.serif('Comment', 200, 14.8, None, word(540, 330, 14.8, 0), WINE, WHITE, italic_last=False)
    r.boxed('"[KEYWORD]"', 78, 15.1, None, pop(540, 500, 15.1, -2), WINE, '"WASH"', round_=1)
    r.boxed('[more questions?]', 70, 15.3, None, pop(540, 630, 15.3, 4), BL, 'more questions? ask me')
    return r

def layers():
    return reel().L
