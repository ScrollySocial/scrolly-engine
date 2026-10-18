# Physical pack batch 2: #07, #11, #15, #20 (storyboard round, 2026-10-17)

One storyboard round for four templates, one review page: `batch2-review.html` (open it through the review server,
`http://localhost:8950/batch2-review.html`; notes save to `batch2-notes.json`). Stills: `python build/storyboard_b2.py`
-> `NN-.../storyboard/`; page: `python build/review_b2.py`. Footage is a stand-in from her July clips.

Everything is built from her real images in `assets/props/source/` (cut-outs cached in `build/.cache`, not in git) and
her marker doodle sheets (arrows, bursts, sparkles, stars, marker numbers, marker lines). Big built-in words are
artwork lettering in SIL OFL fonts from CapCut's own cache; editable words are Arial Bold or Ink Free on real paper.

| # | World | Beats | Hero lettering |
|---|---|---|---|
| 07 How big is it really? | the measuring table: light oak, wooden rulers, bananas, a mug, playing cards, index cards, a mustard paint chip | 1 alone, a giant banana swings in for scale · 2 a real ruler splits the screen (alone / in my hand) · 3 a giant mug wipes across · 4 the line-up on the oak table, a ruler standing as the height chart · 5 in use, cards fanned · 6 CTA: exact size on a card, Comment "SIZE" on a paint-chip strip | Coiny, banana yellow with brown speckles |
| 11 A day with it | the clock of the day: the brass wall clock as a wheel of 4 clips, its real hands, 3 cream alarm clocks, the hourglass; the sky changes (blue, butter, terracotta washes, then hand-painted dots on black for night) | 1 morning, a giant alarm clock rings · 2 zoom out: four slices, four clips · 3 the midday slice grows to fill the screen · 4 afternoon diagonal split, hourglass on the seam · 5 night slice lit, an alarm clock lies down asleep · 6 CTA: the product resting in the whole clock face | DynaPuff filled with the sky's watercolour + painted dots |
| 15 New drop reveal | the stage: red velvet curtains (open frame, closed halves), spotlight beams on black, cream/yellow/peach ticket stubs | 1 covered on stage, NEW DROP lights up · 2 pause beat: curtain closed, a 3 in light bulbs · 3 the curtain halves slide apart · 4 close-up one in a spotlight · 5 split: two spotlights, two close-ups · 6 CTA: in use on stage, OUT [date] ticket, Comment | Alfa Slab One, marquee cream with light bulbs |
| 20 What buyers said | the prize table: white marble, gold foil stars, gold seals, vintage postcards, gold trophies, a gold paint stroke | 1 five gold stars stick on, WHAT BUYERS SAID · 2 review one on a postcard, sealed in gold · 3 gold stars rush in and cover the screen · 4 split: clip above, marble table below · 5 the clip inside a giant gold seal · 6 CTA: the product, three trophies, Comment | Sigmar One in gold foil cut from her real seal |

## Checklist (FRAMEWORK.md), run on the stills

- Hook moving on frame 1 (letters popping, banana swinging, alarm shaking, bulbs, stars sticking): pass.
- Footage most of the time: 07, 11 and 15 each have one frame without a full clip (the line-up, the wheel and the
  countdown pause, which still show clips except the pause); 20 has clips in every frame: pass.
- Bold creative hero type, readable: pass. Designed transition on every clip change: pass.
- Split screen in each: ruler diagonal (07), clock slices + diagonal (11), two spotlights (15), clip over marble (20).
- Background changes and carries transitions; something oversized; real objects outlined, many of each: pass.
- No objects drawn in code (only her doodles, ink outlines and motion ticks): pass.
- Handwriting and real paper in each: pass. Own world per template; story in order: pass.
- Business job for physical sellers; CTA "Comment [KEYWORD]": pass.
- Text kept out of Instagram's top bar, caption strip and right column by hand on the stills; the build's
  `IG SAFE ZONE` check runs at animation.
- Editable text in fonts buyers have; built-in words are artwork: pass. No reused moves from the moves table.
- Drag and drop only, no special filming: pass. "Wow": Mercedes's call.

## Motion tests (2026-10-17, before she reviews)

The stills were hard to picture and too flat, so the stills review is on hold and she sees rough motion first, in her
new look (FRAMEWORK.md "The look: collage"): `python build/collage_b2.py NN` -> `NN-.../preview/motion-test.mp4`
(about 6 to 10 min each; stand-in footage, not the CapCut build). Review page with the four videos, what happens in
order and a notes box each: `batch2-motion.html` (`python build/review_b2_motion.py`), open at
`http://localhost:8950/batch2-motion.html`; notes save to `batch2-motion-notes.json`.
(`build/motion_b2.py` holds the first full-screen version, superseded the same day; collage_b2.py reuses its helpers.
The tile engine is `build/collage_motion.py`.)

Every frame is a collage of 3 to 5 tiles (the clip is one tile), 2 to 3 real cut-outs crossing the seams and one paper
piece with the words, laid on a real base (graph paper, her dots on black, red velvet, marble). The collage moves:
- tiles slide in and swap places; a tile flips over to the next clip or a new pattern; every tile peels off to the
  clip underneath (07, 11); still photos become video;
- words pop onto a tile and the camera dives into it until it is the next clip (07 "In my hand" on oak, 15 "look
  closer" on velvet); zoom out to the clock wheel and into its slice (11);
- kept: the clock wheel with real hands (its four tiles flip to midday colours as it turns), the curtain halves sliding
  apart (with real tickets bursting out), the giant mug / hourglass / seal / gold paint wipes, the star takeover;
- doodles with a job, drawn on as you watch: arrows to the thing, underlines, a ring round a detail, marker 1 2 3 for
  the reviews, bursts on the alarm and the reveal, "?" on the hook.

## Her notes on the stills (2026-10-17, batch2-notes.json) and what changed

- **#07 dropped:** the banana "for scale" reads sexual, the idea is hard for buyers to film consistently, the HOW BIG
  font and fill were "terrible", frame 2 didn't show the whole ruler.
- **#15 dropped:** "scratch this idea".
- **#11 rebuilt** (`collage_b2.py` v2): one texture for the whole day (her butter wash plus a real sky/wheat photo,
  toned morning cream > noon butter > afternoon amber > night navy) instead of blue + terracotta watercolour + polka
  dots; the afternoon is the clock hand moving to 4 (her suggestion) instead of the orange split; one alarm clock only
  (the hook), the day's other objects are a latte, a sunflower, the hourglass and a candle; lettering Alfa Slab One in
  the clock's brass filled with her painted dots (not DynaPuff). Her "not two clicks" on frame 2 read as "not two
  clocks" (the alarm clock next to the wheel): to confirm.
- **#20 rebuilt:** magazine cut-out letters on real paper (not Sigmar); reviews are the buyer's screenshots in real
  phones (no postcard, no marker numbers); fewer, bigger stars in the takeover; the "meh" seal medal is replaced by
  diving into the phone screen; the CTA has a trophy, a gem and a gold seal, not three trophies.
- Lettering option sheets: `11-.../preview/font-options.jpg`, `20-.../preview/font-options.jpg`
  (`python build/lettering_b2.py`). The new general rules are in FRAMEWORK.md (Consistency).

## Open questions for Mercedes

- #11 frame 2 "not two clicks": read as "not two clocks". Right?
- Lettering: pick 1 to 4 on each options sheet (the videos use option 1).
- #07 and #15 are dropped: which two ideas from physical-pack-list.md replace them, if any?
- #11 needs 5 clips; the clock slices are clips cropped to quarters (CapCut masks), to prove in the engine at
  animation. #20's screenshots are image slots the buyer drops in.

Moves to log in FRAMEWORK's table once approved: clock wheel of clips with the hand as the story (11), dive into a
tile or phone screen to the next clip (11, 20), tiles flipping tone (11), gold star takeover and gold paint wipe (20).
