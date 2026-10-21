# Overnight Reels run

Runbook for the scheduled task **reels-overnight** (Claude desktop, every night 12:30am local). Mercedes works in the
evening, so everything heavy happens overnight and finishes before her morning review. Decided 2026-10-13: one run that
posts, applies her choices, renders, then drafts every new Reel (no nightly cap); page approval + "Add to the Buffer
queue" = her yes to queue it (no chat confirmation needed).

**Bash rule for unattended runs (found 2026-10-21):** nobody is there to click Allow, so any Bash call that is not on the
allow list freezes the run forever with no error. Keep every call simple and allow-listed: one command per call, no
`cd X && ...` followed by git/wc/cat, no `for` loops, no `git -C`. Engine commands are `node lib/...` and
`npx hyperframes ...` only. For several Reels, make several calls. Read files with the Read tool, not cat.

**Order of a Reel (Mercedes 2026-10-14):** draft = Plan it only (moments with graphics, script, cover, caption; NO
sounds, music or transitions) → she approves Plan it, or sends changes (stage `revise`: make them, she checks again)
→ Claude's sound pass for the approved plan (stage `sounds`) → she does Edit it → render → she approves the video →
post. Sounds go on once, after the plan is settled, so no sound work is thrown away.

**Catch-up runs:** this runbook also runs during the day when she clicks "Run now" or asks in chat (e.g. after a
restart killed the night run). Then do everything except renders: renders only start between 12:30am and 8:00am,
unless she asks for one in chat. Drafting, applying changes and sound passes are fine at any time.

All engine commands run from `automation/reel-hf` with the **Bash sandbox off** (Edge, ffmpeg, OneDrive, WordPress).
Long commands (renders, background removal) go in the background; wait for them, don't poll in a loop.
Write a running log to `automation/reel-hf/_runs/<yyyy-mm-dd>-overnight.md` as you go (what you did, what you skipped and why).

## Before anything
1. Read the skill `SKILL.md` (this folder), its **Read first** list (handoff spec Her rules, writing rules, graphics
   memory, lib/README, the last approved Reel's build.mjs) and `review/README.md`. Her rules override this file.
2. `node lib/doctor.mjs` (fixes what it can). If anything is left as NEEDS YOU, write it in the log, notify her (see Wrap up) and stop.
3. `node lib/pipeline.mjs` to see every Reel's stage.
4. **Resume, don't restart:** read `automation/reel-hf/_runs/progress/`. Each file is one Reel a run started and
   didn't finish (see D). Continue each from its next unfinished step before starting anything new.

## A. Post (stage `post`: she clicked "Approve the Reel")
For each Reel at stage `post`, `node lib/review/import.mjs <reel>` for her final caption, hashtags and "When you approve".
- **postAfter = queue** (or not set): `node lib/post-reel.mjs <reel>` (posting copy with the cover as frame 0 → WordPress
  media, prints `videoUrl`). Buffer: organization + Instagram channel from `get_account` / `list_channels` (or memory
  `project_buffer_ai_posting_test`), `create_post` with her caption + hashtags, Instagram type reel, the `videoUrl`,
  `thumbnailOffset: 0`, mode addToQueue. Then `node lib/post-reel.mjs <reel> --buffer <post id> --scheduled <due time>`.
  Notion row (from `rows.json`): Status **Scheduled**, Publish Date = Buffer's due time, URL = videoUrl, Instagram Caption,
  Hook, CTA, Series, Media Used, Script / Working File, Notes = WP media id + final MP4 + cover paths (skill step 7).
- **postAfter = hold**: fill the row the same way, Status **Approved**, no upload, no Buffer.
- Never post anything she hasn't approved on the page. A Reel with video notes after its render is not approved: treat
  it in B.

## B. Apply her choices (any stage, `newDecisions` true)
For each Reel with NEW CHOICES (stage `revise` = she sent change requests): `node lib/review/import.mjs <reel>` and act on
every line:
- Sounds, music, captions, transitions, look, brand kit: already applied by the next build. Nothing to do.
- **Moment notes / Change / Remove** (Plan it), **pins and video notes**: edit `build.mjs`. A changed or removed
  moment's sounds need a redo (pipeline shows `redo sounds Fn`): re-place that moment's `R.fx` on the new visuals.
- **Word cuts**: change `carousels/reels/<reel>/plan.json`, re-run `node lib/prep-footage.mjs <reel> <reel>`, read
  `assets/words.json`, then re-verify **every** `at()` anchor in build.mjs (fixed-second anchors break after a re-cut).
- **Cover**: nothing (render-ready renders her pick). **Sound requests**: find options, list file/source/size in the
  log, **don't download**. **Rule for every Reel**: list it in the log for her to confirm; don't add it to the handoff yet.
- Unclear note: don't guess. Leave it, write the question in the log and the morning note.
- Her manual choices beat the style rules: flag a clash in the log, never undo it.
- Studio edits: if `review/built-index.sha` doesn't match `index.html`, diff index.html against a fresh build (ignore
  `data-hf-id`) and fold the changes into build.mjs before anything else.
Then `node build.mjs review` (the page shows the changes) and:
- if she asked for changes (notes, Change/Remove, cuts, pins, video notes, sound requests):
  `node lib/review/import.mjs <reel> --done`. It files her requests away (the page stops counting them) and marks the Reel
  revised, so she checks your changes and approves those steps again. Never keep an approval for a step you changed.
- if she only made picks (sounds, music, captions, cover, look): `node lib/pipeline.mjs --mark <reel>`.

## B2. Sound pass (stage `sounds`: she approved Plan it)
For each Reel at stage `sounds`: add the sounds, music and transitions to the plan she approved (follow the last
approved Reel's build.mjs): `R.fx` per event (never the same sound back to back, except the items of a list she says,
which share one sound), music from the existing library (rotate: not the track used by the Reel before it; **no
downloads**), transitions (whips, punch-ins). If the Reel already had sounds from an older draft, keep the ones on
moments she kept and redo only the changed moments. Then `node build.mjs && npm run check`, `node build.mjs review`, and
`node lib/pipeline.mjs --mark <reel> --sounds` (Edit it opens on her page).

## C. Render (stage `render`: Plan it AND Edit it approved)
1. Cut-out clips: every moment that uses a cut-out needs `assets/cut/fNN-cut.webm`. Make missing ones one at a time
   (`hyperframes remove-background <clip> -o assets/cut/fNN-cut.webm`, hyperframes-test/bin on PATH, ~3 min each).
2. `node lib/render-ready.mjs` in the background (~11-15 min per 60s Reel; it builds, checks, renders, copies to
   OneDrive exports/reels/final, renders her cover, refreshes the page). Wait for it.
3. Look at each render yourself: pull frames every ~3s with ffmpeg (hyperframes-test/bin) and check text over her face,
   cut-off text, emoji boxes, black frames, sound level (`ebur128`, about -14 to -16 LUFS). Fix and re-run
   `node lib/render-ready.mjs --only <reel>` once if there's time; otherwise put the problem in the morning note.
4. A failed Reel (see `renders/render.log`) doesn't stop the others. Note it.

## D. Draft new Reels (Notion rows → review pages)
1. Read the Notion saved view **Reels to edit** (Format Reel + Status Edit, by Publish Order):
   `notion-query-data-sources` with `{"mode":"view","view_url":"view://3f9ab38f-4c58-81e3-a763-000cb6af8568"}`.
   **Never** SQL or rows mode on Notion lists (small query allowance; repo-root CLAUDE.md). Skip rows already in
   `automation/reel-hf/rows.json`, but first copy every listed Reel's posting order to the review hub:
   `node lib/schedule.mjs <slug> order=<Publish Order or -> date=<Publish Date or ->` (Notion is the only place the order
   is set; the hub at localhost:4320 numbers the Reels from this copy).
2. A row is a **Studio** Reel when its footage is talking-head take(s) of her. The footage is named in **Filming Notes**
   (paths relative to the footage folder, `reel-settings.json` → `folders.footage`, e.g. `videos/Business
   Brain/IMG_2008` → find the file by name). Skip and log (with the reason) rows where: the footage file isn't there
   (OneDrive not synced), it's a screen recording (Demo), b-roll or short intro clips (Quick Cut / Chill), multi-angle
   (Film), the Notes say it was already edited, or no footage is named. These types aren't built yet.
3. For each Studio row, run skill steps 2-5 **without stopping at the ◆ checkpoints** (she reviews all of it on the page
   in the morning), but **stop at Plan it: no sound pass in a draft** (B2 does it after she approves the plan). To keep
   context small, you may hand each Reel to its own subagent with this runbook, the skill and the row's text; run at
   most 3 at once (heavy video steps one at a time). **Save points:** before the first step write
   `automation/reel-hf/_runs/progress/<notion page id>.md` (row title, slug), and after every step below add one line
   ("done: transcribed IMG_2008", "done: plan.json", …). A run that finds this file continues from the next step instead
   of starting over. Delete the file once the row is in rows.json. Per Reel:
   - Transcribe every take named (`node lib/transcribe-footage.mjs …`), pick the best take of each line (Filming Notes
     say which take is best; follow them), drop retakes, false starts, "link in bio" lines when Notes say so, asides.
   - Slug `yyyy-mm-dd-<series>-<topic>` (today's date), `plan.json`, `node lib/new-reel.mjs <slug>`,
     `node lib/prep-footage.mjs <slug> <slug>`; check `assets/words.json` reads clean.
   - Plan the moments in build.mjs (follow the last approved Reel's build.mjs as the pattern), stills + cut-out stills,
     5-6 `COVERS` lines (the viewer's problem in their words) + `coverCut`, the `POST` caption (writing rules; no CTA
     line in it: the build adds it; Business Brain = name + scrollyseo.com, never the price; exactly 3 hashtags; no
     em dashes). `R.endCard({ kind, word, detail })` from the row's CTA (`lib/cta.mjs` kinds); no CTA on the row =
     leave it out, the page makes her pick one before she can approve the plan. Write the hook to set up that CTA.
   - Captions yes; **no** `R.fx`, music or transitions yet (B2 adds them after she approves the plan).
   - `node build.mjs && npm run check` (long footage: the PRODUCER_* timeouts), then `node build.mjs review`.
   - Add the row to `rows.json` (page id → slug). Notion row: Status stays **Edit**; Script / Working File and Edit
     Notes = "Draft ready for review <date>: automation/reel-hf/<slug> (open http://localhost:4320)". Hook = the
     on-screen hook if the row has none.
4. Never: set Status Ready, post, download music or sound effects, log the engine or a Reel to the Business Brain.

## E. Wrap up (always, even after a failure)
1. `node lib/review/hub.mjs --start` (one page for every Reel: http://localhost:4320).
2. `node lib/pipeline.mjs` and finish the log with a short **morning note** for her, plain words:
   how many drafts wait for her review (Plan it), how many rendered videos wait for her approval (Approve it), what
   else waits on her (Edit it), with titles, what got queued in Buffer (times), what was
   skipped and why, questions. No file paths she has to hunt for; the hub link is enough.
3. PushNotification, one line under 200 characters, e.g. "Reels: 4 ready to review, 2 queued for Thu. Open
   localhost:4320". Only if something is waiting on her or something failed.
4. Last line of the log, exactly one of: `RUN FINISHED <time>` or `RUN STOPPED EARLY <time>: <what's left>`. The 8am
   check-in reads it: a log without this line means the run died (restart, sleep) and gets offered as a resume.
5. Renders: don't start one after 8:00am (see Catch-up runs). Drafts and sound passes may continue.

## Laptop
Needs: Claude desktop app open, laptop plugged in, lid open, sleep on AC = Never (Settings → System → Power).
If the app or laptop was off at 12:30am, the task runs when the app next opens. Do everything except renders (see
Catch-up runs); after 4pm (she works evenings), keep it light: A, B, B2, E, and drafts one at a time.
