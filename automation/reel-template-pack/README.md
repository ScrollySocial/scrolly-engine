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
| `01-one-product-three-ways/phone-kit/` | Delivery B: shot guide video, slot clips, recipe card for CapCut on a phone |
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

Installed in her CapCut on 2026-10-16: "Scrolly 01 One product three ways" (empty template) and
"Scrolly 01 One product three ways (3)" (installed by the installer with five of her July vacuum clips).

1. Close CapCut fully and reopen it. Are both on the home screen?
2. Open "(3)": are the vacuum clips in the five shots, with the five text boxes, 14 seconds total?
3. Double-click a text box and type: Rubik Bold on a dark box?
4. Export, and send the file over to compare with `preview/after.mp4`.

## Open items

- Mac projects folder path, and whether the font downloads on a computer that never used Rubik Bold: untested.
- Guide upsell line for the AI-assisted Reel Editor: left out until it has a name, link and launch.
- Product description: written after the batch is approved (Phase 4).
