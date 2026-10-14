---
name: scrolly-reels
description: Edit Mercedes's raw footage into a finished Scrolly Reel (MP4 + cover) with the HyperFrames Reel engine, starting with the Studio type (one talking-head take, graphics-rich). Transcribes, makes a silence-aware rough cut, plans each beat's graphics, copy and sounds, runs her review checkpoints, builds and renders, makes the cover, and records the Reel on its Content Pipeline row in Notion. Use when Mercedes says "new Reel", "make/edit a Reel", "next Reel from Notion", drops footage to edit, or asks to continue a Reel in automation/reel-hf/.
---

# Scrolly Reels

Engine: `automation/reel-hf/` (one folder per Reel, shared library in `lib/`, see `lib/README.md`). Run engine
commands from `automation/reel-hf` unless a step says otherwise. Rendering and headless Edge need the Bash sandbox off.
Types: **Studio** is built. Film, Chill, Demo and Quick Cut are planned (`reel-edit-workflow.md`); if a Reel needs one,
say so and offer Studio or wait.

## Read first, every time
1. Vault `products/content-engine/reel-engine-handoff.md`: goal, decisions, **Her rules** (look, sound, process, covers).
   Her rules there override anything here and anything older.
2. Vault `brand/writing-and-content-rules.md` for caption voice, and memory `feedback_reel_graphics_style`.
3. `lib/README.md` (engine commands) and the component catalog at the top of `lib/components.mjs`.
4. The last approved Reel's `build.mjs` as the pattern (`2026-10-13-bb-know-what-you-sell/build.mjs`).

## Never
- Never render or rebuild over her Studio edits without diffing them into `build.mjs` first (ignore `data-hf-id`).
- Never show her a text description where a picture or video can go. She judges visually.
- Never set Status = **Ready** unless she says to queue it: any Ready row is added to the Buffer posting queue.
- Never log the engine or a Reel to the Business Brain (still being worked out, Mercedes 2026-10-13).
- Never download music or sound effects without listing exact file, source and size first.

## The steps
Each ◆ is a review checkpoint. **How** she reviews is a swappable part: follow `review/README.md` (the review slot)
for every ◆. Don't hard-code a review format into the steps.

**0. Setup.** `node lib/doctor.mjs`. Fix anything it flags before going on.

**1. Start.** Two doors, one process:
- From chat: she names the idea or drops footage. Create the Content Pipeline row (`collection://d2cc8645-5399-4d65-91e2-d535e5cc98bc`):
  Content = working title, Format = Reel, Platforms = Instagram, Status = Edit, Series, Product if it sells one.
- From Notion: "next Reel" = the first row with Format Reel and Status Edit (sort by Publish Order, then created);
  or the row she names. Read Hook, CTA, Series, Edit Notes, Filming Notes.
**Every Reel has a purpose (required).** One action it asks for: Follow, Comment a word, Share, Save, Link in bio, or
Comment for a freebie (`lib/cta.mjs`). Take it from the row's CTA; if the row has none, ask her (chat) or leave it for
the Plan step, which won't let her approve without one. Write the hook with it in mind (the hook tip per action is in
`lib/cta.mjs`). "Comment for a freebie" = she DMs by hand until ManyChat is set up.
Slug = `yyyy-mm-dd-<series>-<topic>` (e.g. `2026-10-13-bb-know-what-you-sell`). Footage lives under the footage folder
(`carousels/config/media.json` → `reelFootageDir`), one subfolder per series.

**2. Transcribe.** `node lib/transcribe-footage.mjs "<Folder>/<File>.MOV" …` → `carousels/reels/_work/audio/<name>.json/.txt`.
Read the .txt. Pick the best take of each line; drop retakes, false starts, "check your output"-type asides.

**3. Rough cut.** Write `automation/carousels/reels/<slug>/plan.json` (keep list: `segments [{src, in, out, transcript}]`;
`maxPause`, `noiseDb` optional; format at the top of `reel-studio/prep.mjs`). Then
`node lib/new-reel.mjs <slug>` and `node lib/prep-footage.mjs <slug> <slug>`. Check `assets/words.json` reads clean
(no clipped or leaked words; fix in plan.json with later in-points and re-run).
◆ **Review 1, rough cut:** what stays, in order (and the length).

**4. Plan it (visuals first, no sounds yet).** Split into moments by meaning (a new idea = a new moment; something
new on screen every 1-2s, one focal point at a time). Per moment: components and copy (real-looking objects and UI,
specific example copy that follows her rules) and camera moves. Write it into `build.mjs` with a `note(n, title)` per
moment, like Reel #2. Add the ending: `R.endCard({ kind, word, detail })` right after `R.frames(…)` (her pick on the
page's Ending tab overrides it; the card, its two sounds and the caption line come from the library). Stills of her per moment in `sketch/fNN.jpg`; cut-outs where a moment needs one:
`hyperframes remove-background sketch/fNN.jpg -o sketch/fNN-cut.png` (hyperframes-test/bin on PATH). Write 5-6 cover
lines into `COVERS` (the viewer's problem in their words, never internal names; `<m>` = marker) and pick `coverCut`.
Start the page: `node build.mjs review`, then the `reel-review` launch config (http://localhost:4321).
◆ **Step 1 on the page, Plan it:** brand kit, cover (frame + style + text), script (cuts), moments (keep/change/remove),
ending (the action, its word/detail, end-card color; required before approving).
Read back with `node lib/review/import.mjs <reel>`; fix what she marked, rebuild, then `node lib/review/import.mjs <reel> --done`
(files her requests away; she checks and approves again). Repeat until she approves the plan with no changes. Step 2
stays locked on her page until step 5 is done.

**5. Edit it (sounds and motion, on the approved visuals).** Sound effects per event in build.mjs (`R.fx`, one per
event; repeats only when she chooses them, or for the items of a list she says, which share one sound), music (25s samples if the track is open; one track, template volume
+ fades), captions (`R.captions`), transitions (`R.cam.whip` / `punch`). Then `node build.mjs review` again and `node lib/pipeline.mjs --mark <reel> --sounds` (opens Edit it).
◆ **Step 2 on the page, Edit it:** live preview (real footage + graphics + sounds + music, no render). Her sound,
music, caption, transition and filter choices apply on the next build automatically (lib/reel.mjs reads
review/decisions.json); word cuts need the take re-cut (plan.json + prep-footage). Never send an animatic.

**6. Make the video.** Background removal for every cut-out moment (`hyperframes remove-background <clip> -o assets/cut/fNN-cut.webm`,
~3 min each; run in the background). `node build.mjs && npm run check` (long footage: set
`PRODUCER_PAGE_NAVIGATION_TIMEOUT_MS=180000 PRODUCER_PLAYER_READY_TIMEOUT_MS=180000`). Render with hyperframes-test/bin on PATH:
`npx --yes hyperframes@0.8.150 render . -o "<reelExportsDir>/final/<slug>.mp4"` (~11× real time: run it in the background).
Look at frames yourself before sending (text over her face, cut-off text, emoji boxes). Render her cover choice with
`renderCovers` from lib/cover.mjs (her frame, style, background, text, aside) into `<reelExportsDir>/<slug>/cover.png`.
Then `node build.mjs review` so step 3 plays the render. Fine-tuning can also happen in HyperFrames Studio
(`npm run dev`); diff and fold back.
◆ **Step 3 on the page, Approve it:** the video, notes at a moment, the post caption, and "When you approve".

**7. Posting (after she approves step 3, "Approve it", on the review page).** Draft the post caption into `POST` in
build.mjs before step 3 (brand voice; leave the CTA line out: the build inserts it as the second sentence from the
Ending pick; Business Brain = name + scrollyseo.com, never
the price; bio link = $1K Challenge; exactly 3 hashtags; no em dashes; no "It's X, not Y"). She edits it on the page.
`node lib/review/import.mjs <reel>` gives her final caption, hashtags and "When you approve" choice. Update the row:
Hook (on-screen hook), Instagram Caption (her final caption + hashtags), CTA (her Ending pick + word), Series, Media Used (footage + b-roll ids),
Script / Working File (the Reel folder), Notes (final MP4 + cover paths). Status: **Ready** only if she chose "Add to
the Buffer queue" (Ready = added to the Buffer queue), otherwise **Approved**. Buffer only takes media by a live,
non-expiring URL (no Notion file links); how the queue picks up the video file is **open**: confirm with her the first time.

**8. Learn.** Every "love this / never do that" she says goes into the **Her rules** section of the handoff spec the
same session, so the next Reel starts from it. A component joins `lib/` only after it ships in an approved Reel
(check the HyperFrames registry first).

## Overnight run (scheduled)
The scheduled task **reels-overnight** (12:30am daily) runs this skill unattended by `overnight.md` (this folder):
posts what she approved on the page, applies her choices, renders approved Reels, drafts every new Studio row, and
leaves everything on the review hub (http://localhost:4320, `lib/review/hub.mjs`). Where each Reel stands:
`node lib/pipeline.mjs`. Rows already drafted are in `automation/reel-hf/rows.json`. In a chat session, the same
scripts work by hand: `lib/render-ready.mjs`, `lib/post-reel.mjs`.

## Later (not built)
Trial Reel variants (on hold until her account is eligible: hook / opening / pace, one change each, child rows via
Parent Content), Film / Chill / Demo / Quick Cut templates, borrowed audio clean-up and QA scripts, customer package
(swap `lib/brand/scrolly.mjs`).

## Credits
Review-page, setup-check, pacing, audio clean-up and QA ideas come from Nicola Pocock's (@getgitgirl)
claude-reel-editor, MIT license: reference copy and notes in `automation/reel-engine/reference/claude-reel-editor/`.
Keep the MIT notice and credit in anything shipped that's built from that code.
