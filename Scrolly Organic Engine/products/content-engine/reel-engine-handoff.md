# Scrolly Reel Engine: handoff spec (2026-10-13)

Start a new session from this file. It summarizes a long design session; everything below was decided with Mercedes
unless marked **open**. Not logged to the Business Brain yet: she said it's still being worked out.

## Goal
- Post **10 unique Reels a day, each with ~10 Trial Reel variants** (mirror, different hook, different first frame,
  whatever she wants to test). Scale ceiling she mentioned: 100 a day.
- **Sell it to customers** (likely part of the $10K offer, not decided): the default output is a **finished MP4 with no
  editor needed**. Optional fine-tuning for "control freaks" (HyperFrames Studio, free; CapCut only where its connector
  works, not the US).
- Templates per **Reel type**, but every Reel still gets **unique illustrations** built from its own words.

## Decisions so far
- **Engine: HyperFrames** (chosen over Remotion after a side-by-side: same look, 54s vs ~7min render for 5s, free
  license for customers, built-in workflows for talking-head graphics, captions, beat-synced music). Remotion setup in
  `automation/reel-studio` is a fallback only; its `prep.mjs` (silence-aware cuts) is still the cut logic to reuse.
- **Don't install getgitgirl's tool as the engine** (github.com/nicolapocock/claude-reel-editor, MIT, reviewed: clean,
  local-only, Mac-tested, single template look, CapCut route not in US). **Borrow, with credit:** the review page
  concept (tap transcript words to cut, live rough cut, notes pinned to a timestamp, tabs for cuts/graphics/captions/
  sound+colour/preview, "preview is outdated" banner, one-click draft build), `clean_audio.sh` (DeepFilterNet/afftdn
  chain to -14 LUFS), `tighten.py` + `pacing.py` presets (natural/tight/fast), `qa.py`, the doctor-script pattern,
  brand-file-as-truth with rules appended mid-edit. Reviewed files + notes on each: `automation/reel-engine/reference/claude-reel-editor/README.md`.
- **Reel types (style menu):** Studio (one take, graphics-rich, like @li.gorbunova), Film (multi-angle hero Reels, like
  @justyn.ai), Chill (relaxed talks and faceless b-roll), Demo (screen recording, often with her face picture-in-picture
  or split), Quick Cut (≤15s, ~7 clips sped up to ~0.6s each, strong transitions, punchy sound, cuts on the beat).
  Details: `reel-edit-workflow.md`, references: `reel-style-breakdown.md`.

## What exists (working)
- First finished Studio Reel: `automation/reel-hf/2026-10-13-bb-voice-file/` (BRIEF.md, STORYBOARD.md locked v4,
  frame.md design spec, storyboard.html + `sketch/build-storyboard.mjs`, `build.mjs` → `index.html`). She liked the
  visuals; sound needed fixes (done). Final MP4: `OneDrive/Scrolly Media/exports/reels/final/`.
- Tools: `automation/carousels/transcribe.py` (faster-whisper base.en, local), `automation/reel-studio/prep.mjs`
  (cuts only in real silence, transcript guard, false-start drop, pause trim, word timeline), HyperFrames CLI in
  `automation/hyperframes-test` (bin/ has ffmpeg+ffprobe; local puppeteer@25.13.0 required), HyperFrames skills
  installed (hyperframes, -core, -animation, -keyframes, -creative, -audio, -registry, -studio, -cli, media-use,
  general-video). Background removal: `hyperframes remove-background` (~3 min per 5-8s clip on her CPU).
- Asset sources: b-roll in `OneDrive/Scrolly Media/videos/broll/` (+ screens/), footage folders per series,
  9 approved Mixkit SFX + buzzer in the voice-file project, Business Brain mockups in
  `Scrolly Organic Engine/products/business-brain/mockups/out/`, her real carousel covers in
  `OneDrive/Scrolly Media/exports/carousels/*/slide-01.png`.

- **Engine library (built 2026-10-13, session 2):** `automation/reel-hf/lib/` (README there). Components + Studio
  template + Scrolly brand kit + `prep-footage.mjs` + `new-reel.mjs`. The voice-file Reel rebuilt from it
  (`build-lib.mjs`) matches the approved build exactly (145/145 timeline calls) and passes `npm run check`; its
  `index.html` now comes from the library. Steps 1 and 2 of the architecture below are done for Studio.
- **Reel #2 in progress:** `automation/reel-hf/2026-10-13-bb-know-what-you-sell/` from Business Brain/IMG_1996
  ("your AI should know what you're selling"); keep list in `carousels/reels/2026-10-13-bb-know-what-you-sell/plan.json`,
  rough cut APPROVED 2026-10-13 (62.9s; plan.json has maxPause 0.45 + a later in-point on "Of course" to fix a
  dropped "Your" and a leaked "check your output"). Storyboard v1 (`storyboard-v1.png`, built by `node build.mjs storyboard`
  with the SAME components as the final) sent for review. Music not chosen.
- **Storyboard mode:** `R.storyboard()` in lib/reel.mjs draws every frame over a real still (cut-out PNGs via
  `hyperframes remove-background <still.jpg> -o x.png`, needs hyperframes-test/bin on PATH). Emoji like 🍞 render as
  boxes in headless Edge/Chrome: avoid uncommon emoji on screen.
- **Reel #2 storyboard v1 APPROVED** (no visual changes). Music: 10 new Mixkit candidates (calmer: jazz, lo-fi, mellow
  hip hop, soft pop) in `assets/music-candidates/`, 25s samples in `samples-music/`, sent for her pick.
  Mixkit scraping gotcha: on listing pages a card's preview mp3 sits BEFORE its title, so pair each title with the
  last mp3 before it, and verify by matching file duration to the listed length.
- **Animatic step built:** `lib/animatic.mjs` (`node build.mjs animatic`): full-size frames drawn with the same
  components (headless Edge), held per frame over voice + music + every sfx (ffmpeg amix), 540x960 preview also copied
  to OneDrive exports/reels/previews. Reel #2 music = "Curiosity" (her: "they all seem fine as background music";
  Claude picked; the other 9 candidates rotate for future Reels). At data-volume 0.02 the music measures ~-46 LUFS vs
  voice ~-15 LUFS. Reel #2 animatic sent 2026-10-13.
- **Reel #2 animatic notes (fixed):** nope-buzzer-nope on the F3 circles sounded like a double womp → circles silent,
  ONE nope on the last. A 1.8s gap after "because" (transcript put the word inside the pause, so the pause trimmer
  skipped it) → dropped her run-together first try, line now starts "Because otherwise…" (word re-inserted via
  plan.insert since base.en missed it). Cut is 61.1s. Lesson: `at(phrase, after)` anchors with fixed seconds break when
  the cut changes; re-verify every anchor after any re-cut.
- **She cannot review video on the laptop:** the chat player skips, Windows Media Player failed (OneDrive in-place
  replace broke a file; fresh OneDrive copies fail while syncing), the browser pane works only via http (launch config
  `reel-previews`, port 8942) but she still couldn't view it. She said "let's just make it". For finals: OneDrive copy for
  her phone. Open question: a reliable laptop review surface.
- **Reel #2 full build:** cut-outs F5/F9 trimmed 8% on the right (remove-background left curtain ghosting at the edge).
  `npm run check` passes (21/21 contrast). RENDERED 2026-10-13: 61.2s, 1080x1920, -15.7 LUFS, no gaps >0.7s, 11.5 min
  render on her laptop. Final in OneDrive exports/reels/final/2026-10-13-bb-know-what-you-sell.mp4; awaiting her
  watch on phone. Cover PICKED 2026-10-13: style A (text behind her on ink, "Tired of fixing every AI post?"),
  `cover/build-cover-styles.mjs` (A/B/C styles reusable) → OneDrive exports/reels/<slug>/cover.png. Content Pipeline row
  updated (caption, hook, CTA, media, notes).
- **POSTING ROUTE (first run 2026-10-13):** posting copy (CRF 20, ≤9 Mbps, ~45-65 MB) with the cover PNG baked in as
  frame 0 (1/30 s) → WordPress media via REST (`WP_LIVE_*` in automation/.env) → Buffer `create_post` addToQueue, IG
  reel, `thumbnailOffset: 0` (Buffer's API can't take a custom cover image, only a frame offset; Mercedes chose the
  baked-in frame). Notion row: URL = WP video link, Notes = WP ids, Status Scheduled + Publish Date. No automation
  watches Ready rows: Claude queues on her yes.
- Queued: Reel #1 (Buffer 6acec913b610c3011f9488ff, Oct 14 1:11 PM CT, her own caption) and Reel #2
  (6acec91b33507eb5b0e55f13, Oct 14 6:29 PM CT). Unused WP uploads without the cover frame: media 1453, 1455.

- **scrolly-reels skill (built 2026-10-13, session 3):** `.claude/skills/scrolly-reels/SKILL.md` runs steps 0-8
  (setup check → start from chat or a Notion row → transcribe → rough cut → plan beats → build/render → cover → Notion
  row → learn). Review is a swappable slot: `.claude/skills/scrolly-reels/review/README.md` (active: files + chat;
  candidates B local page, C claude.ai page, D Notion row, to be shown as samples). New: `lib/doctor.mjs`,
  `lib/transcribe-footage.mjs`. Status rule: Ready = added to the Buffer queue, so the skill sets Approved and only sets
  Ready when she says to queue it. Trial variants on hold until her account is eligible.

## Her rules (apply to every Reel)
**Look** (also in memory `feedback_reel_graphics_style`):
- No italic serif accent words and no color-changed words (reads as AI-made). Statements = Bricolage Grotesque 800
  condensed; emphasis = peach marker swipe; asides = handwritten (Covered By Your Grace) with drawn arrows.
- No eyebrow-label cards. Real-looking objects and real-looking UI (chat apps, a .md file being edited, badges,
  folders, receipts, her real posts, the real Business Brain design).
- Graphics go around her body (above her head first), never over her face; over her body only for emphasis.
- Circles and scribbles never cross the text they mark. Example copy must be specific to her rules (e.g. the bad AI
  caption uses a pattern banned in her voice file: "It's not X, it's Y").
- Palette: cream, peach, orange (rare splash), ink/black neutrals, blush and mist panels. More than peach is welcome.
- Never show the Business Brain price. CTA for Business Brain = name + scrollyseo.com (IG bio link = $1K Challenge).
- No em dashes or "|" on screen. No fake proof.
- Covers: vary the style against the post's NEIGHBORS ON THE GRID in posting order (Publish Date / Publish Order), not build order; Trial Reel variants can share one cover unless the cover is what's tested (full rule in brand/writing-and-content-rules.md, Reel covers).
**Sound:**
- Stacking different sounds is fine; never double up the SAME sound back to back.
- One music track with one volume level + fades (no automation lanes: Studio's volume control must move the whole
  track). She turned music way down (data-volume ~0.02) with a ~4s fade-in. She disliked "Be Happy 2".
- Music review: Mixkit full songs download instead of playing; send 25s mp3 samples in chat instead. Library tracks
  all sound "the same level of happy" to her: she'll likely want either a better music source or Instagram sounds.
**Process:**
- Checkpoints: script → rough-cut list (plain text) → storyboard sketches drawn over real stills (she judges visually,
  never from text descriptions) → **animatic** (sketch stills timed to her voice + music + SFX, reviewed together) →
  build → Studio preview → render.
- Always diff her Studio edits (ignore `data-hf-id`) and fold them into the build script before regenerating.
- She prefers to see options rendered, not described.

## Proposed architecture (to build)
1. **Component library** (HyperFrames compositions with slots): chat thread, prompt bar, markdown/voice file, folders,
   name badge, receipt, lined-paper checklist, phone/IG grid with real covers, marker-swipe statement, handwritten
   note + arrow, circle highlight, cut-out background swap, text behind her head, title card, end card with URL bar,
   cursor click. Grows with every approved Reel (check the HyperFrames registry first: it has chat, notes typing,
   hand-drawn marks, whip pan, captions, counters).
2. **Reel-type templates:** pacing preset, caption style (relaxed default, main points bold), graphics density,
   music behavior, allowed components.
3. **Per Reel:** transcript → Claude drafts the plan (beats → components + copy) → **one review page** (cuts like
   getgitgirl's, storyboard, animatic, notes at a timestamp) → render.
4. **Variants engine for Trial Reels:** render the base once; mirror via ffmpeg (seconds); hook swap = re-render only
   the opening scene and splice; first-frame/cover swap; batch naming + tracking in the Content Pipeline.
5. **Customer review options (Mercedes 2026-10-13, idea for the customer build):** setup asks "Will anyone else review
   your Reels?" No (default, recommended) = the local review page: fastest, private, real animations + sounds live, no
   uploads. Yes = a hosted, shareable page (claude.ai Artifact like getgitgirl's, or on the customer's own site): opens
   on a phone, co-workers/VA/client can leave notes; slower (video uploads + draft renders per change). Same page and
   decisions file either way; switchable later.
**Optional feature: overnight runs.** Customers can skip it and run every step during the day, with Claude asking
as it goes. If they turn it on, it needs three things on their computer (learned 2026-10-13, Mercedes's first
unattended setup):
1. **Pre-approved permissions** in `<their project>/.claude/settings.local.json` (local only, never shared). Without them
   the nightly run stops at the first command and waits for a click until morning. The list (adjust IDs to their
   connectors): `Bash(cd *)`, `Bash(node *)`, `Bash(npx --yes hyperframes@<version> *)`, `Bash(npx hyperframes *)`,
   `Bash(npm run check)`, `Bash(npm run check *)`, `Bash(PRODUCER_PAGE_NAVIGATION_TIMEOUT_MS=180000 *)`,
   `Edit(/automation/reel-hf/**)` (their engine folder), their Notion connector's `notion-update-page` + `notion-search`
   (+ fetch / query), and, only if they auto-post, their Buffer connector's `get_account`, `list_channels`, `list_posts`,
   `get_post`, `create_post`.
   Claude can't silently grant itself permissions (blocked as self-modification, correctly): the setup step shows
   the customer the exact lines and the customer saves them, or approves Claude's edit when asked. Then Claude
   checks the file is valid JSON (one missing comma makes Claude ignore the whole file).
   Tell them plainly: these let Claude run those actions without asking in any session in that project.
2. **The routine's mode set to Auto** (not "Accept edits", which still stops on commands; avoid "Bypass permissions").
3. **The computer awake:** sleep when plugged in = Never, Claude app open, lid open at run time.
After the first night, read the morning note: any step still stopped gets added to the list.

6. **Customer package:** brand kit file instead of Scrolly's, finished MP4 default, optional Studio editing, cloud
   rendering (HyperFrames supports AWS Lambda / Cloud Run / HeyGen cloud) priced into the offer.

## Constraints and numbers
- Laptop render: ~11× real time (60s Reel ≈ 10-15 min). 10 unique/day ≈ 2-3 h background rendering; 100/day only
  via cheap variants. Review time is the real bottleneck: the review page must be fast.
- Windows + Git Bash; Edge works as the headless browser when the bundled one hangs; snapshots/checks on long footage
  need `PRODUCER_PAGE_NAVIGATION_TIMEOUT_MS=180000` and `PRODUCER_PLAYER_READY_TIMEOUT_MS=180000`.
- HyperFrames frame extraction has a hardcoded 30s ffmpeg timeout per source video. An 86s 15 Mbps take failed the
  first final render. Engine rule: split long takes into muted ~18s segments (cut with 0.3s overlap) and play her
  voice from one full-length audio track (see the voice-file project's `build.mjs`, `TALK_SEGS`).

## Covers (Mercedes 2026-10-13)
- Talking/teaching and caption-led Reels get a **custom cover**: her cut-out on a flat brand color (she picked cream
  for the voice-file Reel), title in the Reel's type (Bricolage 800 condensed, peach marker swipe, handwritten aside +
  arrow). Quick Cut / vibe Reels can use a still + short line (`automation/carousels/reel-cover.mjs`).
- Cover text = the viewer's problem in their words, never our internal names ("voice file" was rejected; final:
  "Stop rewriting every caption AI gives you"). Offer 5-6 options before building.
- Working example: `automation/reel-hf/2026-10-13-bb-voice-file/cover/build-cover.mjs` (cut-out via
  `automation/carousels/cutout.py --matte`). The carousels `launch()` now defaults to Edge because the bundled headless
  Chrome hangs silently after a Windows restart.

## Session 3 (2026-10-13): the scrolly-reels skill + the review page
- **Skill built:** `.claude/skills/scrolly-reels/SKILL.md` (steps 0-8: setup check, start from chat or a Notion row,
  transcribe, rough cut, Plan it, Edit it, make the video + cover, posting, learn). Review format lives in
  `.claude/skills/scrolly-reels/review/README.md` (the swappable "review slot").
- **Review decided (after many rounds; she rejected the animatic, an editor-style timeline, plain-background cards and
  two previews at once):** one laptop page, http://localhost:4321 (`reel-review` launch config,
  `automation/reel-hf/lib/review/`), three steps with an approve button each:
  1. **Plan it** (no player): brand kit dropdown; Cover composer (frame from the video, style = her cut-out on a brand
     color or the full frame, text options or her own, live preview); Script as one paragraph per moment (hear her
     voice, click words to cut); Moments (each drawn with the real graphics over her still; keep/change/remove + notes).
  2. **Edit it** (live preview = her real footage + real graphics + sounds + music, no render): Moments & sounds (sounds
     per moment on the word they land on; hear, swap, volume, off, + add; notes), Captions (Normal/Big/Hidden, peach
     marker words, wording, font), Music & library (listen, pick, level, preview-only boost, sound library, requests),
     Transitions (cut/whip/zoom, plain descriptions, quarter-speed replay), Filters & lighting (whole Reel + per moment).
  3. **Approve it**: the render, notes at a moment, post caption (preview text + full text + hashtags), and "When you
     approve": add to the Buffer queue (Notion row → Ready) or hold (→ Approved).
  Her choices save to `<reel>/review/decisions.json`; `lib/reel.mjs` applies sounds, music, captions, transitions,
  filters and brand kit on the next build; `node lib/review/import.mjs <reel>` lists everything for Claude.
  Word cuts still need the take re-cut. Her manual choices beat Claude's style rules (flag, never undo).
- **New engine pieces:** `lib/doctor.mjs`, `lib/transcribe-footage.mjs`, `lib/cover.mjs` (keeps the title above her
  head and the aside beside it), `lib/brand/index.mjs` (Scrolly + a DRAFT Scrolly Holiday kit), `lib/review/*`.
- **Reel #2** ("Your AI should know what you're selling") was finished and posted in another chat; it was the test bed
  for the page. A third Reel folder (`2026-10-13-bb-jumbo-shrimp`) belongs to another chat.

## Session 4 (2026-10-13): overnight scheduling BUILT
- **Changed from the plan (Mercedes):** she works at 7pm, so there is no evening run. ONE nightly run, scheduled task
  `reels-overnight` at 12:30am: A post what she approved → B apply her page choices → C render → D draft every new
  Studio row (no cap) → E hub + morning note + notification. Runbook: `.claude/skills/scrolly-reels/overnight.md`.
- **Auto-queue decided:** "Approve the Reel" + "Add to the Buffer queue" on the page = her yes. The run uploads the
  posting copy to WordPress media (link never expires: this settles the "where MP4s live for Buffer" question) and
  queues it in Buffer, row → Scheduled. "Hold" → row Approved.
- **New pieces:** `lib/pipeline.mjs` (stage per Reel), `lib/render-ready.mjs`, `lib/post-reel.mjs` (cover as frame 0
  fixed: the first version dropped the cover frame), `lib/review/hub.mjs` (one link, http://localhost:4320, every
  Reel's page on 4331+), `automation/reel-hf/rows.json` (row → folder ledger). Already-queued Reels #1/#2 carry
  `review/posted.json`.
- **End-to-end proof (render honors page choices):** Reel #2 rebuilt with its saved page choices and rendered
  (`renders/e2e-page-choices.mp4`, 11.3 min): the look filter shows up in the real render (frames 4-7% brighter,
  softer contrast), the F10 zoom transition and the swapped pop sound are in. Captions and the brand kit dropdown
  were not exercised (no choices saved); the first overnight Reel with those choices is their proof. Posted
  index.html restored after the test. **Full proof done 2026-10-13:** every choice type (brand kit, caption font, big
  caption + marker, swapped + added sound, whip, zoom, whole-Reel + one-moment filter) checked in a real render on a
  copy; 2 engine fixes. Report + frames: `reel-e2e-page-choices-2026-10-13.md`.
- **Laptop:** sleep on AC was 20 min; must be Never (her to change) + app open + lid open for 12:30am to fire.
- Still open: approvals on the page don't notify Claude (the nightly run picks them up); Holiday kit colors;
  marker auto-contrast; Film/Chill/Demo/Quick Cut (overnight skips those rows and says so); Trial variants on hold.

## Next: overnight scheduling (planned 2026-10-13, superseded by Session 4 above)
Mercedes's idea (2026-10-13), agreed in shape:
- **Overnight run (~1am):** for every Content Pipeline row with Format Reel, Status Edit and footage: transcribe, rough
  cut (her rough-cut checkpoint moves onto the page: she fixes cuts in Plan it's Script tab), plan the moments, cover
  lines, caption draft, AND a first sound/music/caption/transition pass, then `node build.mjs review`. Draft both
  Plan it and Edit it so a day isn't lost waiting for sounds.
- **Morning:** she reviews Plan it, then Edit it. If she changes a moment's visuals, flag its sounds for a redo.
- **Evening run (~7pm):** apply her decisions, redo flagged sounds, render every Reel whose Plan it AND Edit it are
  approved (10-15 min each, ~2-3 h for ten), render covers, rebuild review data. Next morning she approves in step 3,
  and approval runs posting (skill step 7).
- **Must run locally** (footage, OneDrive, Edge, the engine live on her laptop; cloud routines can't reach them):
  Claude desktop scheduled tasks; laptop on, plugged in, allowed to stay awake. Start the review server automatically
  and send her a notification with what's ready and the page link.
- **Before scheduling:** run ONE new Reel end to end through the skill with page choices applied (proves the render
  honors sounds, captions, transitions, filters, brand kit; filters via CSS on footage are unverified in a real render).
- **Still open:** where finished MP4s live online for Buffer (needs a link that never expires; Notion file links
  expire); approvals on the page don't notify Claude (she says "review's in" for now); Holiday kit colors; auto QA
  checks; marker auto-contrast on a same-color cover background; Film/Chill/Demo/Quick Cut types; Trial variants on hold.

## Open
- Music source (library vs Instagram sounds vs a paid catalog).
- ~~The review step~~ decided in session 3 (above). The animatic is retired for review.
- Which Reel type to template first (Studio is proven).
- Pricing/packaging for customers. Research + recommended beta (not decided): `selling-research.md`.
