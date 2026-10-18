# Physical starter pack (8 templates), plan approved 2026-10-17

Launch a starter pack of 8 physical-product templates; the rest of the 25 come later as free updates. Each template:
one rough motion-test MP4, one round of Mercedes's notes, then the CapCut build and an upload zip (same as
`halloween/for-upload/`). Follow FRAMEWORK.md (balance of beats, own world, modern, IG safe zones).

| # | Template | State |
|---|---|---|
| 01 | One product, three ways | approved, built |
| 02 | Pack an order with me | approved, built |
| 03 | Before and after | approved, built |
| 11 | A day with it | motion test round 3, waiting for her notes |
| 20 | What buyers said | motion test round 3, waiting for her notes (lettering pick open) |
| 10 | Three people to gift it to | motion test 1 |
| 22 | Put it to the test | rebuilt 2026-10-18 (`build/motion_22.py`), waiting for her notes |
| 23 | Every option in 10 seconds | motion test 1 |

Review page for everything in motion: `batch2-motion.html` at `http://localhost:8950/batch2-motion.html`
(`python build/review_b2_motion.py`); notes save to `batch2-motion-notes.json`.

## The style kit (`build/collage_kit.py`)

The approved parts, so a new template is a short recipe instead of a new design:
- **Beats:** full-frame video with accents spread round the screen (`accents()`), full-screen words with no video
  (`word_card()`), collage moments (`tiles()`: tiles slide in, flip, peel off, swap; the clip is one tile; a still photo
  switches to video; `grid()` for "all of them together").
- **Moves:** words pop onto an element and the camera dives into it until it's the next clip (`dive()`, `on_tag()`);
  the clock-hand wipe (`radial()`); a big real object sweeping across as the wipe (`sweep()`); a flood of real cut-outs
  that covers the screen and flies off (`takeover()`).
- **Lettering:** her f2 pick, Anton caps filled with a real photo plus a small line in the tall serif
  (`photo_letters()`, `serif_line()`; dark edge where a cream one won't read); plain Anton words with a soft shadow
  for labels and the buyer's words (`word()`).
- **Objects:** real cut-outs with a soft shadow and no outline (`cutout()`); no lines round tiles.

Recipes: `build/starter.py` (#10, #22, #23; `python build/starter.py 10` renders `10-.../preview/motion-test.mp4`, add
seconds for a test sheet). #11 and #20 are in `build/collage_b2.py` (written before the kit; same parts).

## New idea-bank moves to fold into the fix pass (FRAMEWORK.md, commit c007602)

Her one-line summary of the look: "mixed-media video collages, hyper interesting and visually hooky". Where the new
moves fit a template's job (apply with her notes on that template, not as an extra round):
- **#23 Every option:** glasses frames with a different option in each lens, colour inside, greyscale outside, as a
  side-by-side "compare two" beat.
- **#22 Put it to the test:** the stopwatch's face becomes a circle video and the camera zooms into it (her clock-face
  move) for the jump into the uncut test.
- **#11 A day with it:** the same clock-face move for the dives into the slices.
- **#10 Gift:** butterfly wings opening onto a person's clip, or the patchwork quilt dissolving one fabric at a time
  into the gift-wrap clip. Careful: she sees butterflies, quilt, street lamp, cathedral and skyline as fall ideas
  first, and the physical pack must not look seasonal, so use them in neutral colours or ask.

## The #22 rebuild (2026-10-18): how every template is made from now on

Her notes on the first #10/#22/#23 tests: no patterns or overlays on the objects (rule 9, asked many times), props
unrelated to each other or the words (a stopwatch, then test tubes), arrows at nothing, poor cut-outs, nothing like her
sample videos. The rebuild works the way her references do, and each template follows the same steps:
1. A script first: each beat names its words, and each object arrives WITH the word it pictures (TEST brings the
   tubes, the time brings the stopwatch, RESULT brings the magnifier, PASSED is the real stamp). One story per Reel.
2. Patterns and stickers ON the objects: the tubes fill with three different patterns of her marks, the stopwatch
   wears a dotted No.1 sticker, the stamp prints PASSED in rough ink, the key words are her dots in red.
3. Clean cut-outs from the rembg model (`build/cutout_hq.py`, model in `~/.rembg/models`), with a white die-cut edge.
4. Something new every 1 to 1.5 s, even inside an uncut take; arrows point at a real thing (the shot guide asks
   buyers to keep the product centred).
5. Before she sees it: a 1 fps strip and a side-by-side sheet against her TOP-15 references
   (`22-.../preview/side-by-side.jpg`). If it doesn't hold up, it doesn't go to her.

#10 and #23 wait for her verdict on #22 before being rebuilt the same way.

## Open

- Editable words in the motion tests are in Anton and the tall serif: the serif is a CapCut library font (id
  7580184437816675601); Anton came from a CapCut text template, so confirm it's in CapCut's font list before the build,
  or swap editable text to a font buyers have.
- #22 stand-in footage isn't a real test; buyers film their own one-take test (pack rule: only a claim they already make).
