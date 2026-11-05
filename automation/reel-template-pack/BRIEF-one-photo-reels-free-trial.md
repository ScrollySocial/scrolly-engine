# Brief for the new chat: the "1 photo, 7 Reels" templates + a free trial on YouTube

Open a new Claude Code chat in THIS project (`C:\Users\merce\Scrolly Organic Engine`) and paste everything under "THE PROMPT". The checklist is for Mercedes first.

## Before you start (Mercedes)

1. **Decide what's free.** The prompt asks the chat to recommend 1 or 2 of the 7 Reels as the free trial, but if you already know (for example REAL vs PRODUCT), write it in.
2. **Have CapCut for computer open-able on this PC**: the chat will put test copies in your CapCut projects folder for you to check, like the Product Reel Pack.
3. **Know where the YouTube link goes**: the description of a YouTube video or live, a pinned comment, or both. (The chat writes the text; you paste it.)
4. **Price later.** The chat will NOT ask you to set prices while building (your rule). The paid pack's price comes after it's built, from a pricing check.

## What already exists (the chat reads these)

| What | Where |
|---|---|
| The 7 approved soap Reels (the designs to turn into templates) | `automation/reel-series/soap-9-posts/` scripts; finished videos in `C:\Users\merce\OneDrive\Scrolly Media\exports\reels\soap-9-posts\` (`reel-1.mp4`, `reel-2-v7.mp4`, `reel-3-v2.mp4`, `reel-4-v4.mp4`, `reel-5.mp4`, `reel-6-v6.mp4`, `reel-bubbles-v3.mp4`) and the main "1 photo, 9 posts" Reel `main-reel-v20.mp4` |
| What each Reel does, timings, looks she rejected | `automation/reel-series/soap-9-posts/notes/*.md` |
| Her Pinterest inspo for each | `C:\Users\merce\OneDrive\Scrolly Media\exports\reels\soap-9-posts\inspo-pins\` |
| The template rules (read FIRST, run its checklist before every showing) | `automation/reel-template-pack/FRAMEWORK.md`, `README.md`, `CLAUDE.md` |
| The CapCut engine (project writer, installer, buyer folder, zip) | `automation/reel-template-pack/build/` : `engine.py`, `editable.py` (fully editable words/fonts/colours), `zip_upload.py` |
| How freebies + keywords work | vault `products/lead-magnets/freebie-plan-2026-10-23.md` (SPOOKY = a bonus template shared as a WP media zip; SHOPREELS = Product Reel Pack keyword) and the comment-to-DM setup in vault `products/content-engine/comment-to-dm-n8n-plan.md` |
| Existing packs + sales pages | vault `products/asset-map.md` (Product Reel Template Pack $17.99, product 1500, scrollyseo.com/product-reels/; Halloween pack), sales notes `automation/reel-template-pack/sales/` |

---

## THE PROMPT

I'm Mercedes (The Ambition Department). I want to sell the 7 Reels we just made for my "1 photo, 9 posts" soap Reel as **editable CapCut templates any product shop can use with ONE product photo**, and give people a **free trial** of them through my YouTube channel, the way I've given away free Reel templates before.

### Read first
- `automation/reel-template-pack/FRAMEWORK.md`, `README.md` and `CLAUDE.md` (my template rules and how the CapCut engine works). Follow them, and run the FRAMEWORK checklist before showing me anything.
- The 7 soap Reels: scripts in `automation/reel-series/soap-9-posts/`, notes in its `notes/` folder, finished videos in `C:\Users\merce\OneDrive\Scrolly Media\exports\reels\soap-9-posts\`, inspo pins in its `inspo-pins\` folder.
- Vault `products/lead-magnets/freebie-plan-2026-10-23.md` and `products/asset-map.md`.

### The 7 Reels to turn into templates
1. Big words with the video playing inside the letters, pushing into the product ("UPGRADE YOUR SHOWER EXPERIENCE").
2. Scent / ingredients: product + each note's object popping in with one big word.
3. Podium: phrases stack in the product's shape on a stand, sparkles swap them for the product, "get yours now".
4. Icon callouts on a bold colour: line icons with labels draw in around the product.
5. REAL vs PRODUCT: split screen, half a real photo, half the product.
6. Weather: the product as a white-outlined sticker over changing scenes, "it's still SUNNY…".
7. Bubbles / texture: the product settles in among a texture with a short line + name.

### What I want
1. **A plan first, in one message:** for each of the 7, how it becomes a CapCut template a buyer fills with their own product photo (and optional clips), which words/colours/fonts they can edit, what has to be a flipbook vs live CapCut elements, and anything that won't carry over to CapCut (say so plainly). Recommend which 1 or 2 should be the **free trial** and why (the most impressive, easiest to use, and the one that best sells the rest).
2. **Generic, not soap-only:** the templates must work for any product (candles, jewelry, skincare, food…). Keep my approved motion and layouts; swap the soap words for clear placeholders.
3. **Fully editable**, per my rule: words, fonts, colours, doodles and backgrounds editable like Canva, built with `build/editable.py`, never flipbooks for things a buyer must change. Real photographed objects only (free Pexels), never code-drawn fake objects.
4. **Motion tests before full builds** (my FRAMEWORK rule): one template at a time, starting with the free-trial one. Put a test copy in my CapCut for me to check before moving on.
5. **The free trial setup** (plan it, show me, build only after my OK):
   - a free zip of the trial template(s) made with `build/zip_upload.py` (buyer folder + phone kit), uploaded to WordPress media only after I OK it;
   - my rule: **every keyword collects an email** (like MATH: signup page, MailerLite group, reminder), never a direct link. So the YouTube description and pinned comment point to a signup page, and Instagram gets a comment keyword (check the keyword list in the freebie plan; avoid everyday words);
   - the delivery email/DM text and the YouTube description text, for my approval;
   - the upsell: the full 7-template pack (new product, or added to the Product Reel Pack: recommend one). Don't ask me to set a price while building.
6. **Show me a preview MP4 of each template filled with a sample product** (not just the soap) before calling it done.
7. Record everything in its one home: product facts and decisions in my Scrolly Business Brain (ask "Save to your Brain?"), files and build notes in this repo, the asset in vault `products/asset-map.md`. Commit your work when each step is done.

### My rules (from the soap Reels, please follow every one)
- Stills or motion tests first, then video. Check your own frames across the whole Reel before showing me: text never cut off, readable at tiny tile size.
- Match my inspo closely (what happens, not just colours). Ask for the image if you only have a description.
- ONE video render at a time on my PC: run `tasklist | grep -i ffmpeg` before every render and wait if one is running.
- No sound effects baked in.
- New file name for every version.
- No em dashes in any copy; never "it's X, not Y" lines; warm and clear.

Start by reading the files above, then send me the plan from step 1.
