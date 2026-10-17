# #3 Before and after: plan (draft, 2026-10-17)

Replaces the batch-1 version (torn paper, drawn in code), which is not the direction. Same way of working as #2: real
photographed props + a playful layer (washi tape, words on butter gingham tape, white die-cut sticker edges,
handwriting), sage backdrop, one storyboard round before any animation.

**Idea from the pack list:** products that change something you can see (cleaning, skincare, organizers, decor, car
care). Hook "Before [product]", then "After [real time it took]". Three clips: the before, the after (starts with the
hand pulled off the lens), the product in hand next to the result.

## Concept: the after gets printed on an instant camera

The template acts out "taking the after photo": the before sits in an instant photo taped to the backdrop, a real
instant camera snaps, the after photo comes out of the slot and develops, then grows to fill the screen.

| Time | Beat | What's on screen |
|---|---|---|
| 0 to 2.2 s | Before | Clip 1 inside a real instant photo, washi-taped to sage, tilted. Tape words: "before" / "[product]". Handwritten "before" on the photo's white strip. |
| 2.2 to 3.2 s | Snap | The text leaves first; the real camera rises from the bottom and covers the photo; a white flash fills the screen (shutter sound). |
| 3.2 to 4.4 s | Print | A blank instant photo (dark, undeveloped) slides out of the camera's slot. The camera drops away. |
| 4.4 to 5.2 s | Develop | Clip 2 fades up through the dark picture (a short flipbook), the photo grows until the clip fills the screen. |
| 5.2 to 7.8 s | After | Clip 2 full screen. Tape words: "after" / "[real time it took]", a real kitchen timer sticker beside them. |
| 7.8 to 9.4 s | Side by side | Both photos taped next to each other, before (left) and after (right), both clips playing. |
| 9.4 to 11 s | CTA | Clip 3 in a third photo. Tape words: "[Product name]" / "find it at [where to buy]". |

About 11 s (the list said 10). Text always leaves before an image passes over it (CapCut draws text on top).

## Props

Already in `assets/props/`: nothing fits #3 (all packing props). Washi tape, gingham strips and handwriting are drawn.

Needed from Mercedes (ChatGPT or royalty-free), each on a plain white background, straight-on, no brand name or logo:

1. **Instant camera**, front view, one soft colour (cream, mint or white), with the photo slot visible on top.
2. **One blank instant photo**, portrait (Instax Mini shape), white frame, the picture area dark grey/undeveloped,
   flat and straight-on.
3. **Kitchen timer** (the twist kind), front view. Optional: it sits next to "after [time]".

## Storyboard v1 (2026-10-17)

Props arrived (mint camera, blank instant photo, cream timer), cut out by `python build/props.py 03` (their pale floor
shadows removed, the storyboard adds its own). Stills: `python build/storyboard_03.py` -> `storyboard/` (seven frames
plus `storyboard-03.jpg`). Stand-in footage: sofa before/after and a vacuum from her July clips. Headline font Imbue (odd
templates). Waiting for her one round of feedback before animating.

**v1 rejected (Mercedes, 2026-10-17):** it reused #2's colours and elements (sage, washi tape, butter gingham, die-cut
edges), and she doesn't want 100% solid backgrounds. New world for #3, her pick: **corkboard**. A real cork-board
backdrop, photos held by real push pins, words typed on real label-maker tape (black tape, white letters), cobalt
accent. Camera, instant photo and timer stay. Props needed from her: cork texture, push pins, a blank label-maker strip.

## Storyboard v2, corkboard (2026-10-17)

`python build/props.py 03` now also makes `cork.jpg`, `pin-head-{blue,white,cream,black}.png` (each head cut as a
measured circle, as if pushed into the cork) and `label-tape-black.png`. `build/storyboard_03.py` rebuilt: cork backdrop
with a soft light falloff, photos pinned flat, small words typed on label-maker tape (cut ends kept, middle stretched,
raised white letters), big words Imbue in cobalt, a SNAP! label at the flash, the real timer beside the after labels.
Waiting for her one round of feedback.

## Storyboard v3, layered (2026-10-17)

v2 rejected: one background all Reel, no layers, the story didn't add up (a photo pinned before it was taken, a video
after it was a photo), frame 7 repeated frame 6. v3 acts the idea out in order and changes the layer every beat:
1 through the lens (the before plays in the camera's lens, blurred clip behind) · 2 into the lens (the lens grows to
fill the screen) · 3 snap (the flash burst is the cut) · 4 the print comes out of the slot dark (clip 2 starts with a
hand over the lens) · 5 it develops while the top half of a giant see-through timer turns along the bottom · 6 the
after breaks out of its photo window · 7 the before photo held up against the same spot (then / NOW) · 8 CTA on the
cork, the before and after photos pinned at the edges, the camera prints the product: "Comment "[KEYWORD]"".
Type (her pick from the sampler, `storyboard/font-options.jpg`, she liked 1 to 4): Corben Bold in mint (the camera's
colour) with a black edge; small words on label-maker tape. CTA is ManyChat style (her default from now on).

**v3.1 (her note "more video of what is happening, something on the timer that shows it being cleaned"):** a 4th clip,
the work (cleaning, sped up), plays full screen right after the snap with the giant half timer turning over it,
see-through. The order is now before > the work > after prints and develops > breaks out > then/now > CTA. The develop
beat no longer has the timer. 4 clips: before, the work, after (starts with a hand over the lens), product.

**Approved 2026-10-17** (v3.1, with the hook label changed to "WATCH THIS TRANSFORMATION"). Next: animate through the
engine as `build/templates/t03.py` (the old batch-1 t03 is replaced), the way #2 was done: flipbooks for the print
sliding out, the develop and the dial turning; the lens zoom, the break-out and the then/now slide as keyframes.
Corben Bold needs its CapCut font id (the cache folder is AITextTemplate/Resource/4624078377714242870).

## Animated v3.1 (2026-10-17), waiting for her one round of feedback

`build/templates/t03.py` follows the 9 beats in order, 14.6 s, four clips (before, the work at 1.5x, after, product).
`python build/make.py 03` (about 9 minutes). Keyframes for every move (camera rise, lens zoom, camera push, the print
sliding out of the slot behind the camera, the lift, the break-out, the then photo, the cork); the dial turns by
rotation keyframes (it is cut from the timer photo as its own disc, the body keeps the pointer); the develop and the
flash fade are flipbooks. The blurred clip behind is CapCut's own Background > Blur, which only works on the main
(lowest) track, so the main track runs: before in the lens, the work, the after in its photo, the after full screen,
the cork. The break-out is a second copy of the after clip above the frame. The then photo shows the same spot of the
before clip (a clip crop matching the photo window). Corben Bold is not in CapCut's font library, so the font file
ships inside the project (`Resources/fonts`, SIL OFL) and the installer points the text at it. Big words: mint with a
black edge (CapCut stroke 0.07); small words: editable Arial Bold on label-maker tape. Sounds: `sounds.md`.
Test copy in her CapCut: "Scrolly 03 Before and after (2)". Preview: `preview/after.mp4`.
