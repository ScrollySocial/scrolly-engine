# 09 Who it's for: matching carousel (prototype, 2026-10-18)

The Reel's story as 8 slides at 1080 x 1440 (the vault's carousel size), in the Reel's own world: ruled notebook paper,
wine + pink, the striped and dotted butterflies, the pink-striped alarm clock, paper balls, pinned sticky notes, DM
Serif built-in words, her marker doodles (arrows, bursts, sparkles).

| # | Slide | Buyer swaps |
|---|---|---|
| 1 | Hook: their photo, a butterfly on their head, "if you [always run late]" + **this is for you** | photo of them, the habit |
| 2 | Second hook (works as a cover on its own): [always running late?] over the ringing alarm clock, [here's what helps] + arrow | both lines |
| 3 | The problem photo in a torn window (black and white) | photo, the line |
| 4 | **meet** [PRODUCT NAME] on a torn notebook strip over a full-page product photo | product photo, name |
| 5 | The product as a balloon with a gift | close-up photo, what it fixes |
| 6 | Three pinned sticky notes, a mug | three kinds of buyer |
| 7 | The phone standing on the page, their shop on the screen | screenshot, the line |
| 8 | CTA: their photo with a butterfly crown, sound like you? **Comment** "[KEYWORD]" | photo, keyword |

**Delivery: a .pptx the buyer drags into Canva Free** (desktop browser). Same path as the $1K Challenge template library:
Canva imports it at the exact page size with editable text, and Replace works on photos. Canva templates via link need
Canva Pro on our side; CapCut photo templates can't swap photos and words easily.

- Editable words: Montserrat Bold (in Canva and CapCut) on highlight boxes. Built-in words and objects are PNG artwork.
- Blue boxes are guides ("delete before you download"); page notes say what to swap on each slide.
- `slides/` and `contact-sheet.jpg` use stand-in stills from her July clips (other brands' products: never in ads or
  on a sales page). `as-the-buyer-opens-it.jpg` shows the file as a buyer opens it.
- Follows the carousel rules in `automation/carousels/content-rules.md` (not the brand colours): slides 1 and 2 are both
  covers, varied layouts, left-aligned lines, a caption to start from in slide 8's notes.
- Build: `python build/carousels.py 09` (shared parts in `build/carousel_kit.py`). The upload zip gets it as "3 Matching carousel" with a Canva how-to (`build/zip_upload.py`).

**To test in Canva Free:** canva.com > Create a design > Import file (or drag the .pptx onto the home page). Check:
8 pages at 1080 x 1440; the words edit; the fonts look right; click a photo > Replace with your own; slide 5's photo
stays round; slide 7's photo sits inside the phone screen.
