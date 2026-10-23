---
name: reel-engine-setup
description: Set up the Reel engine in this folder for the person on this computer. Asks a few plain questions (name, footage and export folders, review, tracker, posting, look, rules), writes reel-settings.json and their brand kit, then runs lib/doctor.mjs, which installs what's missing (HyperFrames helpers, puppeteer, ffmpeg, the Python transcription venv, folders, browser path) and, with permission, system software. Use when someone says "set up my Reel engine", "change my brand kit / colors / fonts / caption style", "add a holiday kit", "install the Reel engine", "get Reels working on this computer", opens this folder for the first time, or when doctor.mjs says NEEDS YOU.
---

# Set up my Reel engine

The engine (`lib/`) holds no personal details. Everything about one person lives in `reel-settings.json` (each section
has a `_note` saying what it's for) and their look in `lib/brand/my-brand.mjs`. This skill fills both in by asking,
then hands over to `node lib/doctor.mjs`, which checks every piece and fixes what it can.
Run engine commands from this folder (the one with `reel-settings.json`) with the **Bash sandbox off** (npm, pip,
the browser, ffmpeg).

## 0. Already set up?
Read `reel-settings.json`. If `owner.name` is filled in and `node lib/doctor.mjs --check` ends with "All set", tell
them it's ready and stop. A fresh package has empty values: ask everything below.

## 1. Ask (plain words, a few at a time)
Use AskUserQuestion for choices, chat for free text. Recommended option first. Don't ask what you can detect.

**About you**
1. "What's your first name?" → `owner.name` (status lines say "waiting on <name>").
2. "What's your Instagram handle?" → `owner.instagram` (shown on the caption preview).

**Your files** (look first: OneDrive, Dropbox, iCloud Drive, Videos folders; offer the ones that exist)
3. "Where do your raw videos go?" → `folders.footage`. One subfolder per series is the pattern.
4. "Where should finished Reels land?" → `folders.exports`. Recommend a synced folder (OneDrive / Dropbox / iCloud)
   so finished videos reach their phone. Engine adds `final/` and `previews/` inside.

**How you work**
5. "Will anyone else review your Reels?" → `review.shared`.
   - No, just me (recommended): the local review page. Fastest, private, real animations and sounds, nothing uploaded.
   - Yes, a teammate / VA / client: a shareable page. **Not built yet**: say so, set `false`, note it as wanted.
6. "Where do you keep track of your posts?" → `tracker`.
   - Nowhere / I'll start Reels from chat (default): `app: "none"`.
   - Notion: search their Notion for a content tracker database; show what you found and confirm before using it
     (never create one without a yes). Store `database` (collection id), `name`, and their status names for
     edit / approved / ready-to-queue / scheduled in `statuses`.
7. "How do finished Reels get posted?" → `posting`.
   - I post them myself (default): `videoHost: "none"`, `scheduler: ""`. The engine makes the posting copy (cover baked
     in as the first frame) and tells them where it is.
   - Through a scheduler (e.g. Buffer): `scheduler: "<name>"`. A scheduler needs the video at a link that never
     expires. If they have a WordPress site: `videoHost: "wordpress"` + a client module path; their WordPress
     application password goes in that client's `.env` **typed by them**, never pasted into chat.

**Your look** (`lib/brand/my-brand.mjs`; every value marked EDIT ME)
8. "What are your brand colors?" Ask for hex codes or a link to their site / brand guide and read the colors from it.
   Map them to the seven roles in the file's comment (light background, warmer light, marker, text, accent, two soft
   panels); show the mapping in plain words and confirm. The marker color must be light enough for dark text on it.
9. "Which fonts do you use?" Keep the starter fonts if they have none. For their own: get the font files into
   `lib/assets/fonts` **with their license file next to each**, and update `fontFaces` + `fontFiles`. A Google Font
   is always fine. A paid font: ask whether its license covers video; if unsure, pick a close Google Font instead.
10. Set `label` (the name shown in the Brand kit dropdown), `site` (shown on end cards, or empty) and `handle`
    (their @handle from question 2, shown on Follow end cards). Keep `name`
    as `my-brand`: `lib/brand/index.mjs` and `reel-settings.json` → `brand` use that id.
10a. "How should your captions look?" → `captionFont` in the kit (AskUserQuestion, show each in their fonts if you can):
    - Clean (recommended): the body font, `'body'`.
    - Big and bold: the statement font, `'statement'`.
    - Handwritten: `'hand'`.
    Then "How many words per caption line?" 3 = punchy, 5 = relaxed (the default) → `templates.studio.captions.maxWords`
    in settings (leave it unset for 5). They can still make single words Big or Highlighted per Reel on the review page.
10b. **Holiday kits.** Explain: for a seasonal Reel they can switch to a holiday version of their kit on the review
    page (Brand kit dropdown), same fonts, festive colors. Starter set: Halloween, Thanksgiving, Christmas, Valentine's
    Day (colors in `lib/brand/holidays.mjs`). Show the four color sets as swatches (a small rendered cover per kit is
    best), ask which to keep → settings `holidays` (`[]` hides them all), and whether any colors should change (edit
    `HOLIDAYS` in `holidays.mjs`; another holiday = one more entry there).
10c. Show them a cover rendered with their kit (`renderCovers` in `lib/cover.mjs`) before calling the look done.
11. "How loud should background music be under your voice?" → `templates.studio.music.level` (the engine measures
    each track, so the level holds whatever the song):
    - Normal (recommended, the default; leave it unset): you hear it clearly, your voice stays well on top.
    - Quiet: in the background, you notice it if you listen for it → `"quiet"`.
    - Up front: part of the mood, good for short punchy Reels → `"front"`.
    They can still change it per Reel on the review page.
12. **Starter rules.** Read `starter-rules.md` (recommended rules from the engine's maker, grouped by look, sound,
    covers and captions, each one line with its reason). Explain in one sentence: these keep Reels polished and less
    AI-made, and every one is optional. Show them a group at a time (AskUserQuestion, multiSelect, all ticked by
    default) and save the ones they keep to `rules.list`, one short line each. Their brand is theirs: never push a
    rule they switch off, and never carry over anything about another brand's colors, fonts or voice.
    The **Sound** group is already on (the engine's `SOUND_RULES`): show it in one short message instead of asking,
    and say "add a rule" changes any of it. Don't copy those rules into `rules.list`.
    No `starter-rules.md` in the folder: skip to 12a.
12a. "Anything else you never want in a Reel?" (free text, optional; examples: a word or phrase, a color, emojis,
    text over their face, a kind of sound) → append to `rules.list`. If they keep a longer rules doc, point
    `rules.doc` + `rules.section` at it; otherwise leave `doc` empty.

Leave `tools` as shipped unless doctor says otherwise (it fills in `tools.browser` itself). On a Mac, set
`tools.python` to `tools/.venv/bin/python`.

## 2. Write the files
Update `reel-settings.json` in place: keep every `_note`, change only the values. Paths: absolute, forward slashes.
Show them a short plain summary of what you saved (no JSON).

## 3. Install what's missing
1. `node lib/doctor.mjs` → fixes everything inside the folder: puppeteer + HyperFrames helpers (npm), ffmpeg +
   ffprobe, the Python venv with faster-whisper, GSAP, missing folders, the browser path. Takes a few minutes the
   first time (downloads); run it in the background and wait.
2. Lines left as **NEEDS YOU**:
   - Node / Python / browser missing: ask "Can I install <thing> with winget (or brew)?" and on a yes run
     `node lib/doctor.mjs --install`. Restart the terminal if Node or Python was installed, then run doctor again.
   - Engine files missing (transcribe script, cut script, fonts): the package is incomplete. Stop and say which
     files; don't invent replacements.
   - WordPress client / tracker id: go back to question 6 or 7.
3. **Sounds (walk them through it, about 10 minutes).** The engine already knows which sound goes on which moment;
   it just needs the files. Mixkit's license doesn't let the engine ship or fetch them, so they press the buttons:
   - Take doctor's "Start with" names (the 8 starter sounds), find each one's download link in `sounds.md`, and give
     them as clickable links in one message: "open each link,
     press Download Free SFX, leave the file in Downloads; tell me when you're done".
   - Then run `node lib/doctor.mjs`: it finds the Mixkit files in Downloads, saves them under the engine's names and
     says what's left. Offer the other 17 (all in `sounds.md`) the same way, now or later.
   - **Never download the sounds for them**, not even with the browser: the license is theirs to accept. A missing
     sound just stays silent, so skipping this never blocks a Reel.
4. Other **NOTE** lines don't block:
   - Claude Code signed in (terminal): fine if they use Claude Code inside the desktop app.
   - OneDrive "keep on this device" downloads every take; ask before `--install` pins it, since it can be many GB.
5. Done when `node lib/doctor.mjs --check` ends with "All set".

## 4. Prove it works (2 minutes)
Ask for one short test clip (or use any in their footage folder): `node lib/transcribe-footage.mjs "<Folder>/<File>"`
and show them the transcript's first lines. First run downloads the speech model (~150 MB).

## 5. Hand over
One short message: what's set up, where finished Reels will land, whether the sounds are still to download (point to
the 8 starter sounds in `sounds.md`), and anything still open. Then how to start: **open a new chat for each Reel** and
say *make a Reel from <file>* (or *make the next Reel from my tracker* if one is connected); *continue my Reel
<folder>* picks one up later. The Reel workflow is in `CLAUDE.md`.

## Changing it later
Everything here can change any time; the next Reel uses the new values (Reels already rendered stay as they are).
- "change my brand colors / fonts / caption style": edit `lib/brand/my-brand.mjs` (steps 8-10a), show a cover.
- "add / change a holiday kit": `lib/brand/holidays.mjs` + settings `holidays` (step 10b).
- "add a rule" / "drop a rule": edit `rules.list`; "show me the starter rules again": step 12.
- "I moved my footage / exports folder": `folders` in settings, then `node lib/doctor.mjs --check`.
- A second brand (a client, a side project): copy `my-brand.mjs` to a new file with a new `name`, add one line to
  `lib/brand/index.mjs`, and pick it per Reel in the dropdown.
- Updating to a new engine version: see "Updating" in `README.md` (their settings, kits and sounds move across).

## Never
- Never put passwords, API keys or tokens into chat or into `reel-settings.json`.
- Never install system software (Node, Python, a browser) or pin a synced folder without a yes.
- Never create a Notion database, Buffer channel or WordPress anything without asking.
- Never add sound or music files to the package for them.

## Credits
The doctor-script pattern comes from Nicola Pocock's (@getgitgirl) claude-reel-editor, MIT license.
