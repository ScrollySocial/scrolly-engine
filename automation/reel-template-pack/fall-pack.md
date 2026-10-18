# Fall pack (started 2026-10-17)

Buyers: online business owners and influencers (shared holiday pack). Every template is a whole Reel with a selling
job and a CTA; the buyer only drops in clips. Built from the images in `assets/props/source/fall/` (plus doodles).
Build ids `f1` to `f8` (`python build/make.py f1`). Rules: FRAMEWORK.md.

## Round 1 concepts (proposed 2026-10-17, waiting for Mercedes's OK)

| Id | Template | Business job | Beat by beat | CTA |
|---|---|---|---|---|
| f1 | A slice of what's new | What's included in an offer or launch (3 to 5 things) | Huge pie from above, turning; slice 1 lifts away, clip 1 plays in the gap; pie turns, slice 2 lifts, clip 2; ... last slice gone = a pie of clips; zoom into one wedge to full screen | Comment SLICE |
| f2 | Round the clock | A day in my business (behind the scenes, trust) | Clock hands spin fast (hook); stop at 7, the face becomes clip 1; hands sweep to the next wedge, clip 2; times handwritten by the real pen on kraft tags; zoom out to the clock on barn wood | Comment DAY |
| f3 | Falling for it | Reviews: why customers come back | Clip 1 with real leaves tumbling over it; leaves thicken over the misty forest, a review lands on a recipe card; leaves thin out to clip 2; repeat 3 times | Comment FALL |
| f4 | Bob for it | Pick your favourite: a range, flavours, colours | Apples bob along the bottom of clip 1 like on water, each with a polka-dot sticker and a number; one dunks and pops up as a round clip window; next apple, next clip; all 4 apple windows in a row | Comment your number |
| f5 | All dressed up | Value stack: everything you get, or the upgrade | A plain pumpkin, oversized; a gold paint stroke swipes on and wipes to clip 1 ("+ bonus"); a gem lands, clip 2; a bow, clip 3; the decorated pumpkin stack with a price on a kraft tag | Comment GET IT |
| f6 | Burning questions | FAQ: answer the 3 things people ask before buying | Real bonfire, embers rising (hook); a question on a note card; embers carry it up and the clip answers through the glow; repeat 3 times; end on a s'more | Drop your question / Comment ASK |
| f7 | Pick your brew | My routine with the product, or 3 ways to use it | Latte from above; the clip plays inside the cup (circle split); steam rises; the latte art changes heart, rosetta, tulip with each clip; a matcha cup slides in for the twist | Comment LATTE |
| f8 | Mark your calendar | Launch date or waitlist | The real October page, huge; the pen circles a date; the page tears away to clip 1; leaves drop onto days as a countdown; November page flips in with the date | Comment WAITLIST |

Notes for the round:
- f1 needs the new top-down pie slice (being redone). f5 needs the bows (#83, not made yet) and the pumpkins being redone.
- f3 (and the embers in f6) need one engine addition: opacity keyframes (fade layers in and out). Small, additive.
- f3: a simple moving background we own (sky or misty forest, 5 s, Sora/Veo) would be better than a still. Optional.
- f4: bobbing works over the buyer's own clip; a tub-of-water image is optional.
- The whole image library is shared (FRAMEWORK). Useful from other folders: `images/` Crystal Clear Splash on Black
  (f4 dunk), hourglass and alarm clocks (f2), gold foil seals and stars (f5); `halloween/` bare trees (f3, leaves fall
  from them), lit carved pumpkins (f6 glow), wispy cloud overlay (f3); `doodles/` polka dots (f4 stickers).
- Each one has its own world: f1 rust plaid + cinnamon, f2 barn wood + kraft tags, f3 misty forest + leaf path,
  f4 apple crate + red plaid, f5 cream knit + gold, f6 night + embers, f7 corduroy + steam, f8 paper + pen + burlap.

## Round 1 storyboards: rejected (2026-10-17)

Mercedes: "this is looking BAD". Stills for f2, f3, f4, f6, f7 (`fall/fN-*/storyboard/`, `build/storyboard_fall.py`)
read as busy collages: too many props piled on, white cards and cups cut away on white, white blobs in tag loops, the
same stand-in clip everywhere. Still storyboards also can't show these ideas, which live in the motion (same lesson as
Halloween). Next round = motion tests, fewer and bigger props.

## Her direction (2026-10-17), with her Canva mock-ups in `fall/inspo/`

- **Blanket** (`01`): a real plaid blanket with fringe rises up and falls between clips, and can grow into (or shrink
  out of) a full-page background. Ignore the background video and font in the mock-up.
- **Apples with shape overlays** (`02`): polka dots, stars, stripes that stay ON the apple (clipped to its shape).
  Work in progress: she isn't happy with how they look yet.
- **2 or 3 clips per screen** (`02`, `03`): stacked vertical, side by side, or diagonal; clips in frames (stamp edges).
- **Look through, then zoom in** (`04`, loved): the clip seen through an airplane window, then zoom into the full image.
  Fall version: through a tree knot hole. More "look through" ideas needed.
- **Day in my life** (`05`): fast, about 4 clips in 2 seconds, with big bold outlined words, halftone sparkles and a
  small pill label ("2 pm - 10 am").
- **Coffee, loved** (`06`): "which is your style?" over the person's clip; real drink cut-outs pop in one at a time,
  each with a short label ("ice americano", "sweet latte"); ends "swipe up your answer!"
- **Lots of one thing (correction, 2026-10-17):** not "fewer props". One kind, many of them: real leaves framing the
  clip on all sides (`07`), a screen full of paper stars (`08`), acorns all along the ground, mushrooms all along the
  ground.
- **Correction 2 (2026-10-17):** not strictly one kind either. Her apples (`02`) are the model: the same object,
  each decorated differently (tiny dots, tiny stars, a lined sticker label with words). What fails is a random pile.

## f7 motion test 1: rejected (2026-10-17)

`build/motion_f7.py` ("which is your style?" with fall drinks) was a poll about drinks: "This isn't selling a
product, I don't like it." The drinks were the subject instead of the buyer's product. Rule 13: the buyer's product
(their clips) must be what the Reel sells; fall props only dress it.

## Wireframes round 1 notes (2026-10-17)

- f1 and f2 too similar (pie wedges vs clock wedges); f4 also circles. Too many round windows across the pack.
- Her ideas: **a collage that comes together and gets animated**; **a background video (her example: skyscrapers)
  where the clips come in while things in the background get outlined** (hand-drawn lines tracing the scene).
- Changes: f2 becomes the collage, f4 drops apple-shaped windows (tall strips, grid), new f9 "Traced" (outlines
  draw on over a fall background, clips come in between them). f1 keeps the pie.
