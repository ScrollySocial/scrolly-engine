# Review slot

Every ◆ checkpoint in the scrolly-reels skill goes through this file. The format is swappable: the steps only ask for **send** and **read back**, and the active format
below says how. To switch formats, change **Active** and add a section; nothing in SKILL.md changes.

## The contract (every format does these)
- **Send:** put the checkpoint's material where she can see and hear it on her phone, and tell her in one line what to look at.
  | Checkpoint | Material |
  |---|---|
  | 1 Rough cut | the kept lines in order + total length (text is fine here; a quick cut preview MP4 if asked) |
  | 2 Storyboard + sound | `storyboard.html` → PNG sheet, `animatic.mp4`, music samples (mp3) when music is still open |
  | 3 Finished draft | the render (or a 540×960 preview while it's rendering) |
  | Cover | each option as a PNG |
- **Read back:** turn her answer into changes tied to a frame (F3) or a time (0:24), make them, and say what changed.
  Unclear notes → ask, don't guess. A rule she states ("never…") also goes into the handoff spec's Her rules.
- **Version:** every resend bumps the version (storyboard v2, animatic v2) so she can tell them apart.

## Active: three-step review page (Mercedes 2026-10-13, v4): Plan it · Edit it · Approve it
One laptop page (http://localhost:4321, `reel-review` launch config), steps across the top, each with an approve button:
1. **Plan it** (no player; **Brand kit** dropdown on top = lib/brand/index.mjs BRANDS, default Scrolly, Scrolly Holiday is a
   DRAFT kit; tabs Cover | Script | Moments, her order 2026-10-13): **Script** = her words by beat, click a beat
   to hear just her voice, click a word to cut it. **Cover** composer = 1 frame from the video (storyboard stills; a cut-out of her is made on
   demand, 2-3 min, via `hyperframes remove-background` → review/cover-cuts/) · 2 style (cut-out on cream/blush/mist/
   peach/ink, or the full video frame) · 3 text (options from COVERS in build.mjs, or her own with *stars* = marker)
   + optional handwritten note, live preview via `/cover` (lib/cover.mjs). **Moments**: every beat drawn with the real
   graphics over her still (review/frames/, lib/review/frames.mjs), Keep/Change/Remove + notes. Visuals get approved BEFORE sounds are picked (her reasoning: graphics drive the sounds).
2. **Edit it** (live preview: real footage + real graphics + sounds + music, no render): Moments & sounds
   (sounds per beat on the word they land on, swap/volume/off, + Add a sound, notes), Captions
   (Mercedes moved them here: per line Normal/Big/Hidden, click words for the peach marker, edit wording, one font), Music &
   library (listen/pick tracks, level, hear every sound, request new sounds), Transitions (cut/whip/zoom with plain
   descriptions + 🐢 quarter-speed replay), Filters & lighting (whole-Reel presets + sliders, plus a preset for any single moment, live). Moment cards show the
   step-1 picture with ▶ on it. Sounds play only for their real length (long files like typing get cut, like the render).
   Music shows a ♪ badge on the preview; "Boost music while reviewing" is preview-only (not saved, not in the Reel).
3. **Approve it**: the render plays; notes at a moment; **Post caption** (Claude's draft from POST in build.mjs, editable,
   with the first ~125 characters shown as Instagram shows them, character + hashtag count) and "When you approve":
   Add to the Buffer queue (row → Ready) or Hold for now (row → Approved); approve → skill step 7 (posting).
- **Send:** `node build.mjs review` (stage.html, proxy, frame pictures, reel.json; build.mjs passes covers, coverCut,
  stills). **Read back:** `node lib/review/import.mjs <reel-folder>` (approvals, cover, visual notes, captions,
  cuts, sounds, music, transitions, look, video notes). Sound/music/transitions/look/captions apply on the next build
  automatically (lib/reel.mjs reads review/decisions.json); cuts need the take re-cut; cover → renderCovers.
- Rejected along the way: animatic, editor-style timeline, plain-background cards, two previews at once.
- Inspiration credit: Nicola Pocock's claude-reel-editor (MIT) for the tabbed review idea; no code reused.

## Fallback: A · Files + chat
- Copy files to OneDrive `Scrolly Media/exports/reels/previews/` (reaches her phone) named `<slug>-<what>-v<N>.<ext>`,
  and send them in chat with SendUserFile (MP4 / PNG / mp3).
- She replies in chat; match each note to a frame or time yourself.
