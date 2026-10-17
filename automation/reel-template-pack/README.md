# Reel Template Packs (CapCut)

Drag-and-drop CapCut Reel templates. The buyer films their own clips and drops them in. Three packs of 25 by seller
type (physical first, then digital, then service), plus shared Halloween and Thanksgiving packs. Price TBD. The pack is
the paid-ad front door to the AI-assisted Reel Editor. Brain row: My offers, "Reel Template Packs (CapCut)", Idea.

## What's here

| Path | What |
|---|---|
| `physical-pack-list.md` | The approved 25 for physical sellers (Phase 2) |
| `build/build_01.py` | Builds template 01. Run from this folder: `python build/build_01.py` |
| `01-one-product-three-ways/buyer-folder/` | Delivery A, what a buyer downloads: the CapCut project, `1 Put your clips here`, `2 Double-click to install` (Windows), recipe card, guide |
| `01-one-product-three-ways/phone-kit/` | Delivery B: shot guide video, artwork cards, recipe card for CapCut on a phone (artwork has to be added by hand there) |
| `01-one-product-three-ways/style-options/` | The style rounds: options, B variations, collage concepts, handwriting and headline fonts |
| `build/collage.py`, `build/style_options.py`, `build/whimsy_concepts.py` | Collage element drawing and the style-round renderers |
| `01-one-product-three-ways/preview/` | `before.mp4` (the template) and `after.mp4` (finished test Reel) |
| `guide/how-to-use.html` / `.pdf` | One-page beginner guide |

Video files are not in git (`*.mp4`); rerun the build to make them. The test footage in `after.mp4` is Mercedes's own
July stick-vacuum clips (`OneDrive/Desktop/July Videos`). It's for this review only: the vacuum is another brand's
product, so never use that preview in ads or on the sales page.

## How the CapCut project is made

The build copies the JSON shape of Mercedes's own CapCut 8.9 drafts (`Litter 1` for clips, `Old Soaps Short` for the
Rubik Bold font) and never changes them. Slot clips live inside the project folder and are referenced with CapCut's
own folder token (`##_draftpath_placeholder_..._##`), so the folder can be copied to another computer. Text is Rubik
Bold, a CapCut library font that downloads by id, white on a 60% black rounded box.

## How a buyer installs it (Windows)

CapCut for computer has no "import project" button: a project appears on CapCut's home screen when its folder is in
CapCut's projects folder. The installer (`build/installer/`) copies the template there under a new name each run, and
drops the clips from `1 Put your clips here` into the shots in name order. It never touches other projects.
Mac buyers: not supported yet (no installer, folder path unverified).

## Phase 3 test (Mercedes, in CapCut desktop)

Template 01 v5 (stars stay on screen) installed in her CapCut on 2026-10-16 as "Scrolly 01 One product three ways (6)".
v4 ("(5)": circles one at a time, Polaroids grow) was approved by Mercedes apart from the stars. v3 ("(4)", motion confirmed in CapCut by Mercedes) was, filled by the installer with four of her July vacuum clips. "(2)" is v2 (no
motion); the unnumbered copy and "(3)" are v1. Motion uses CapCut keyframes (position, rotation, scale) and the
Typewriter text animation; only scale keyframes were seen in her own drafts, so position and rotation keyframes are
the first thing to check.

1. Close CapCut fully and reopen it. Open "(2)" from the home screen.
2. Do the opener's three round windows, the three Polaroids and the CTA circle show the vacuum clips?
3. Are the words in the tall serif and Ink Free handwriting, in the right places and sizes? (Text size is calibrated
   from one of her drafts, so small size differences from `preview/after.mp4` are expected.)
4. Export and send the file to compare with `preview/after.mp4`.

## Design notes for the batch (Mercedes, 2026-10-16)

- **Look:** no Scrolly branding; collage (paper, tape, Polaroids, hand-drawn marks that never touch text), butter yellow,
  Ink Free handwriting. Headline font alternates: odd templates Imbue (tall serif), even templates MADE Awelier
  (curvy serif, CapCut id 7462241028796337414).
- **Motion everywhere:** pops with a bounce, things flying in and settling, growing to fill the frame, stickers that
  stay on screen and wiggle (01's stars vanished too fast; keep stickers up for the whole shot).
- **Visual hooks through rapid change:** a very popular Reel style is about 14 seconds of 0.6-second clips at a little
  faster than 1x. Use lots of quick clip changes, switch between video and full-screen text cards, and add playful
  animations and stickers.
- Captions on Polaroids: 1 to 3 words.

## Open items

- Mac projects folder path, and whether the font downloads on a computer that never used Rubik Bold: untested.
- Guide upsell line for the AI-assisted Reel Editor: left out until it has a name, link and launch.
- Product description: written after the batch is approved (Phase 4).
