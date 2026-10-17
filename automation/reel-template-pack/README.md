# Reel Template Packs (CapCut)

Drag-and-drop CapCut Reel templates. The buyer films their own clips and drops them in. Three packs of 25 by seller
type (physical first, then digital, then service), plus shared Halloween and Thanksgiving packs. Price TBD. The pack is
the paid-ad front door to the AI-assisted Reel Editor. Brain row: My offers, "Reel Template Packs (CapCut)", Idea.

## What's here

| Path | What |
|---|---|
| `physical-pack-list.md` | The approved 25 ideas for physical sellers (Phase 2) |
| `build/make.py` | Builds templates: `python build/make.py 01 02 ...` (from this folder) |
| `build/engine.py` | The shared engine: CapCut project writer, preview renderer, recipe card, buyer folder |
| `build/templates/tNN.py` | One file per template: its clips, layers, keyframes and test footage |
| `build/collage.py` | Draws every artwork element (paper, tape, Polaroids, stamps, labels, stickers, doodles) |
| `build/installer/` | The Windows installer a buyer double-clicks |
| `build/style_options.py`, `build/whimsy_concepts.py` | Renderers from the style rounds (history) |
| `NN-.../buyer-folder/` | What a buyer downloads: CapCut project, `1 Put your clips here`, `2 Double-click to install`, recipe card, guide |
| `NN-.../phone-kit/` | Shot guide video, artwork, recipe card for CapCut on a phone (artwork has to be added by hand there) |
| `NN-.../preview/` | `before.mp4` (the template) and `after.mp4` (a test Reel with placeholder footage) |
| `01-one-product-three-ways/style-options/` | The style rounds: options, B variations, collage concepts, fonts |
| `guide/how-to-use.html` / `.pdf` | One-page beginner guide |

Video files are not in git (`*.mp4`); rerun the build to make them. Test footage in the `after.mp4` previews is
Mercedes's own July clips (`OneDrive/Desktop/July Videos`: vacuum, mop, cleaning products). It's a stand-in only: those
are other brands' products and often don't match the template's idea, so never use the previews in ads or on a sales page.

## How the CapCut project is made

The engine copies the JSON shape of Mercedes's own CapCut 8.9 drafts (`Litter 1` for clips and text, `Stain Stick with
Reviews` for image layers, `PGYT2` for the Typewriter text animation) and never changes them. Slot clips and artwork
live inside the project folder, referenced with CapCut's own folder token (`##_draftpath_placeholder_..._##`), so the
folder can be copied to another computer. Each clip is cropped (CapCut's material crop) to its window's shape and
sits under its own frame layer, so frames and clips move together. Fast cuts reuse one buyer clip from different start
points at 1.15x speed. Motion is CapCut keyframes (position, rotation, uniform scale), confirmed working in her CapCut
on template 01. Fonts: Imbue and MADE Awelier (CapCut library, download by id), Ink Free (ships with Windows).

## How a buyer installs it (Windows)

CapCut for computer has no "import project" button: a project appears on CapCut's home screen when its folder is in
CapCut's projects folder. The installer copies the template there under a new name each run, and drops the clips from
`1 Put your clips here` into the template in name order. It never touches other projects. Mac buyers: not supported yet.

## Status

- **01 One product, three ways:** approved 2026-10-16 (v5, stars stay on screen). Test copy in her CapCut:
  "Scrolly 01 One product three ways (6)".
- **Batch 1, 02 to 06:** built 2026-10-16, each in its own world (kraft shipping, torn paper before/after, sky-blue
  A/B, dark magnifier details, graph-paper progress). Waiting for Mercedes's review.

## Design notes for the batch (Mercedes, 2026-10-16)

- **Look:** no Scrolly branding; collage (paper, tape, Polaroids, hand-drawn marks that never touch text), butter yellow,
  Ink Free handwriting. Headline font alternates: odd templates Imbue (tall serif), even templates MADE Awelier
  (curvy serif, CapCut id 7462241028796337414).
- **Variety:** templates must not look alike. Each gets its own world (background, frame style, sticker set, pacing);
  only the handwriting, a butter accent and the font alternation are shared.
- **Motion everywhere:** pops with a bounce, things flying in and settling, growing to fill the frame, stickers that
  stay on screen and wiggle (01's stars vanished too fast; keep stickers up for the whole shot).
- **Visual hooks through rapid change:** a very popular Reel style is about 14 seconds of 0.6-second clips at a little
  faster than 1x. Use lots of quick clip changes, switch between video and full-screen text cards, and add playful
  animations and stickers.
- Captions and labels: 1 to 3 words.

## Handoff (2026-10-17): where #2 Pack an order stands

- **Direction approved (about 60%, rising):** real photographed props (Mercedes's ChatGPT/royalty-free images in
  `assets/props/source/`, cut out by `build/props.py`) with a playful drawn layer (washi tape, white die-cut sticker
  edges, words on tape strips, a typing shipping label). Sage backdrop, no pink washi, no coloured outlines.
- **Storyboard v5 approved to animate:** `02-pack-an-order/storyboard/` (made by `build/storyboard_02.py`). Beats:
  label types in (TO: YOU / 123 YOUR HOME) over a split with the picking clip; the real kraft box (zoomed, flaps off
  the edges) with the clip on its floor; one peanut drops in, then peanuts flood the screen; white shreds + envelope
  lands, then the wax seal is brought in; the box closes; washi tape along the seam + label; CTA with tape behind text.
- **Box close proven:** `build/test_close.py` makes `test-close.mp4` from real photo pieces only (short flaps fold in,
  long flaps fold up, the two halves of `box-closed-seam` fold down and meet, camera pushes in to fill the frame).
  In CapCut this becomes a flipbook (one image per frame on one track).
- **Next:** animate all of #2 through the engine (`build/templates/t02.py` is the older v3 and must be rewritten to the
  storyboard), add flipbook support to `engine.py`, sound recommendations, install a test copy, show the MP4.
- **Approved 2026-10-17 (v5 animated, after one feedback round):** `build/templates/t02.py` follows the storyboard
  beat by beat, 14.4 s, three clips (picking, product going in, extras). The engine has flipbooks (`Layers.flip`: one
  image per frame on one track) for the flaps folding, the lid halves meeting and the tape zipping along the seam. The
  label fields are editable CapCut text (Consolas) with Typewriter, so buyers can type their shop name. The peanut flood
  is ten bands of real peanut photos dropping in with keyframes (full-screen flipbook frames would add ~90 MB).
  CapCut always draws text above images, so text has to leave before an image covers it (the box pushes the opener up
  and out). Sounds per beat: `02-pack-an-order/sounds.md` (none bundled). Test copy in her CapCut:
  "Scrolly 02 Pack an order with me (4)". Round 1 fixes: seal on the envelope flap point, box centred, pale edge trimmed off the closed-box photo.
- **Rules from Mercedes:** one storyboard round + one animation round per template; ask instead of guessing; real
  objects only (memory note feedback_reel_templates_real_objects). Holiday packs run in a separate chat
  ("Halloween Reel Template Pack") from `holiday-ideas.md`.

## Open items

- Mac support (projects folder path, installer).
- Guide upsell line for the AI-assisted Reel Editor: left out until it has a name, link and launch.
- Product description: written after the batch is approved (Phase 4).
- Clean up the old template 01 test copies in her CapCut (unnumbered, (2) to (5)) when she says so.
