# Brief for the new chat: 7 Reels for each of my soap bars

Paste everything under "THE PROMPT" into a new Claude Code chat opened on the new project folder. The checklist above it is what to set up first.

## Before you start: set up checklist (Mercedes)

1. **Make the project folder.** For example `C:\Users\merce\<Your Soap Shop Name>`. Open a new Claude Code chat on that folder. The chat will set up git there and copy what it needs from the soap 9-posts folder; you don't copy code by hand.
2. **One photo per bar**, the best you have, in a new folder `bar-photos\` inside the project:
   - straight on, the whole bar visible, on a plain light background (like the Sunshine Splash photo);
   - name each file after the bar, e.g. `unscented.jpg`, `rainbow.jpg`, `pink.jpg`, `black.jpg`.
3. **A short fact list per bar** (the chat can turn this into a file for you): name, colour/look, scent (or "unscented"), the real ingredients, anything special (e.g. activated charcoal, goat milk, exfoliating, for sensitive skin), and price if you want it shown.
4. **Your shop basics:** shop name, Instagram handle, website or Etsy link, and any colours/fonts/logo you already use. If you don't have brand colours, say so and the chat will propose a small palette from your bars.
5. **Your own clips (optional but great):** any footage of you making or pouring soap, cutting bars, your hands, your shop. Put them in `my-clips\`. iPhone clips are fine; the chat knows they're HDR and converts them.

## What already exists (the chat reads these, they stay where they are)

All in `C:\Users\merce\Scrolly Organic Engine\`:

| What | Where |
|---|---|
| The 7 approved soap Reels' scripts | `automation/reel-series/soap-9-posts/` : `build.mjs` (Reels 1 and 5, plus the main grid Reel), `reel2-scent.mjs`, `reel3-podium.mjs`, `reel4-callouts.mjs`, `reel6-weather.mjs`, `reel-bubbles.mjs`; also `image-post.mjs` and `c1-cover-motion.mjs` if wanted later |
| What each Reel does, its timings, what Mercedes rejected | `automation/reel-series/soap-9-posts/notes/*.md` (one per Reel, written when each was approved) |
| Fonts used (OFL / free) | `automation/reel-series/soap-9-posts/fonts/` |
| Stock clips + photos (Pexels, free) | `automation/reel-series/soap-9-posts/clips/` (919 MB, not in git) and `credits.json` |
| The render engine helpers (ffmpeg path, Chrome for drawing frames, folders) | `automation/reel-hf/lib/settings.mjs`, sounds/fonts in `automation/reel-hf/lib/assets/` |
| The finished Sunshine Splash Reels, for reference | `C:\Users\merce\OneDrive\Scrolly Media\exports\reels\soap-9-posts\` : `reel-1.mp4`, `reel-2-v7.mp4`, `reel-3-v2.mp4`, `reel-4-v4.mp4`, `reel-5.mp4`, `reel-6-v6.mp4`, `reel-bubbles-v3.mp4` |
| Her Pinterest inspo images for these Reels | `C:\Users\merce\AppData\Local\Temp\claude\C--Users-merce-Scrolly-Organic-Engine\043dd0ea-8ca4-45d4-b12f-77640e6169f8\scratchpad\pins\` (p0 scent, p1 callouts, p2 podium, p3 bubbles, season.jpg weather) — temporary folder: the chat should copy them into the new project first thing |

---

## THE PROMPT

I'm Mercedes. I run a handmade soap business, and I want a set of 7 short Instagram Reels (7 seconds each, 1080×1920) for EACH of my soap bars, so I can market every bar. We already built and I approved these 7 Reels for one bar ("Sunshine Splash", a sunset bar) in my other project, `C:\Users\merce\Scrolly Organic Engine\automation\reel-series\soap-9-posts\`. This project is for my soap business only; keep everything here, separate from that project. Don't edit anything in the other project; copy what you need.

**My bars:** Unscented, Rainbow, Pink, Black, and more (9 in total). Photos are in `bar-photos\`, and my facts per bar are below or in `bars.md`. [Paste your bar list + facts here, or say "ask me".]
**Shop:** [name, @handle, link, colours/fonts if any]

### The 7 Reels (each one uses ONLY that bar's one photo, cut out or cropped, never a different photo of the bar)

1. **UPGRADE YOUR SHOWER EXPERIENCE** (`build.mjs` reel1): a shower clip with a POV hook, then big words with the shower video playing inside the letters over the bar, then a push into the bar, then sunset flashes, ending on the bar with "Comment SUNSET for the link". Its cover frame is the words in clean white over the bar.
2. **Scent** (`reel2-scent.mjs`): the bar on a soft pastel colour, each scent note's object (pineapple, coconut…) popping in with one big bold word; loops.
3. **Podium / soap dish** (`reel3-podium.mjs`): short phrases stack up in the bar's shape on a wooden soap dish, golden sparkles swap them for the bar, ending "Bar Soap, get yours now".
4. **Icon callouts** (`reel4-callouts.mjs`): the bar on deep blue, round line icons with labels draw in ("handmade", ingredients…), hook "You weren't looking for a new soap, but here we are."
5. **REAL vs SOAP** (`build.mjs` BOLD[5]): split screen, half a real sunset photo and half the soap, same size, line through the middle.
6. **Weather** (`reel6-weather.mjs`): the bar as a white-outlined sticker over bad weather (leaves, rain, snow), then "it's still SUNNY in the shower".
7. **Bubbles** (`reel-bubbles.mjs`): warm beige, foam and floating bubbles, the bar settles in, a short line + the bar's name.

Read every script and the matching note in `notes/` before changing anything: the notes list timings, word positions and the looks I already rejected.

### What I want you to build

1. **Make it a recipe, not 9 copies.** Copy the 7 scripts into this project and turn the hard-coded Sunshine Splash parts (the photo, the crop and sun position, the name, scent notes, ingredients, phrases, colours, hook lines) into ONE config file per bar, e.g. `bars/unscented.json`. Running one command per bar should render its 7 Reels. Keep the motion, timing and layout that I approved; only the bar and its words change.
2. **Adapt the concepts that only work for a sunset bar.** Reels 1, 5 and 6 depend on the bar looking like a sunset (sun → real sunset, REAL vs SOAP, "still sunny"). For each other bar, propose its own version of those three (e.g. Black: a "night sky" or "charcoal" idea; Rainbow: real rainbow vs soap; Pink: a pink-sky or rose idea), in ONE table for all bars, and get my OK before building them. Reels 2, 3, 4 and 7 mostly just need that bar's words and colours.
3. **Start with ONE bar** (I'll pick which), all 7 Reels, and get my OK on each before doing the other bars.
4. **Cut each bar out** of its photo like `bar.png` was made in `build.mjs` (`texts()`), check the cut-out edges look clean before using it, and show me.
5. **Save outputs** to `C:\Users\merce\OneDrive\Scrolly Media\exports\<shop name>\<bar>\reel-<n>-v<version>.mp4`, a NEW file name for every version (my video player keeps showing old copies otherwise).
6. **Captions:** when a bar's 7 Reels are approved, write a caption for each (my voice: warm, clear, no em dashes, never "it's X, not Y" lines) and get my OK.

### My rules (learned the hard way on the first set, please follow every one)

- **Previews before anything is called done.** For a new look, send ONE still of the key frame first; only render video after I OK it. Then send the MP4.
- **Check your own work before showing me.** Look at frames across the whole Reel (not just the end) and compare against my inspo. Text must never be cut off, and it must be big enough to read when the Reel shows as a tiny tile in a 3×3 grid.
- **Match my inspo closely.** If I give a Pinterest pin or screenshot, copy what happens in it (motion, layout, type), not just its colours. If you only have a description, ask me for the image.
- **ONE video render at a time on my PC** (parallel renders crashed it). Before every render run `tasklist | grep -i ffmpeg`; if one is running, wait. If you split work into several chats, they all follow this.
- **No sound effects** in the Reels; I add a trending sound in Instagram myself.
- **Only real photographed objects** (free Pexels photos/clips, cut out if needed), never code-drawn fake objects.
- **iPhone clips are HDR** (BT.2020 HLG): tone-map them to SDR and tag the output BT.709, or the whole Reel looks darker. See `build.mjs` (`SDR`, `BT709`).
- **Facts:** only my real ingredients and claims. Ask if unsure.
- **Keep a simple record** of each bar's Reels (file, version, approved yes/no, caption) in `TRACKER.md` in this project, and commit your work to git here when each step is done (never commit the clips or videos).

Start by: setting up git in this folder, copying the scripts + fonts + notes + inspo images, reading them, then asking me for anything missing from the checklist (bar photos, facts, shop name). Then show me the per-bar concept table for Reels 1, 5 and 6.
