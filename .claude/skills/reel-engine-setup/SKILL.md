---
name: reel-engine-setup
description: Set up the HyperFrames Reel engine (automation/reel-hf) for a person on this computer. Asks a few plain questions (name, footage and export folders, review, tracker, posting, look, rules), writes reel-settings.json, then runs lib/doctor.mjs, which installs what's missing (puppeteer, ffmpeg, the Python transcription venv, folders, browser path) and, with permission, system software. Use when someone says "set up my Reel engine", "install the Reel engine", "get Reels working on this computer", is a new customer of the Reel engine, or when doctor.mjs says NEEDS YOU.
---

# Set up my Reel engine

The engine (`automation/reel-hf/lib`) holds no personal details. Everything about one person lives in
`automation/reel-hf/reel-settings.json` (each section has a `_note` saying what it's for). This skill fills that file
in by asking, then hands over to `node lib/doctor.mjs`, which checks every piece and fixes what it can.
Run engine commands from `automation/reel-hf` with the **Bash sandbox off** (npm, pip, the browser, ffmpeg).

## 0. Whose setup is this?
Read `reel-settings.json`. If `owner.name` is already this person and `node lib/doctor.mjs --check` says "All set",
tell them it's ready and stop. If the file holds **someone else's** values (the shipped file is Mercedes's / Scrolly's),
treat every answer below as new: never keep another person's folders, tracker id, posting route, rules or Instagram
handle. Mercedes's own setup needs no questions: her values are the file's current values.

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
     application password goes in that client's `.env` **typed by them**, never pasted into chat. Connect the
     scheduler's own connector if Claude should queue posts.

**Your look**
8. "Which look should your Reels start from?" → `brand`.
   - The built-in kit (fastest): first id in `lib/brand/index.mjs`.
   - My own colors and fonts: copy `lib/brand/scrolly.mjs` to `lib/brand/<their-id>.mjs` with their colors by role
     (cream, cream2, peach = marker, ink, orange = accent, blush, mist panels) and font files in `lib/assets/fonts`;
     add one line to `lib/brand/index.mjs`. Show them a cover rendered with it (`renderCovers` in `lib/cover.mjs`)
     before calling it done.
9. "How loud should background music be under your voice?" → `templates.studio.music.volume`
   (Quiet bed = the template's 0.05, leave it unset / Very quiet = 0.02). They can still change it per Reel on the
   review page.
10. "Anything you never want in a Reel?" (free text, optional) → `rules.list`, one short line each. If they keep a
    longer rules doc, point `rules.doc` + `rules.section` at it; otherwise leave `doc` empty.

Leave `tools` as shipped unless doctor says otherwise (it fills in `tools.browser` itself).

## 2. Write the file
Update `reel-settings.json` in place: keep every `_note`, change only the values. Paths: absolute, forward slashes.
Show them a short plain summary of what you saved (no JSON).

## 3. Install what's missing
1. `node lib/doctor.mjs` → fixes everything inside the project: puppeteer + HyperFrames helpers (npm), ffmpeg +
   ffprobe, the Python venv with faster-whisper, GSAP, missing folders, the browser path. Takes a few minutes the
   first time (downloads); run it in the background and wait.
2. Lines left as **NEEDS YOU**:
   - Node / Python / browser missing: ask "Can I install <thing> with winget (or brew)?" and on a yes run
     `node lib/doctor.mjs --install`. Restart the terminal if Node or Python was installed, then run doctor again.
   - Engine files missing (transcribe script, cut script, sound effects, fonts): the package is incomplete. Stop
     and say which files; don't invent replacements.
   - WordPress client / tracker id: go back to question 6 or 7.
3. **NOTE** lines don't block. The OneDrive one ("keep on this device") downloads every take; ask before
   `--install` pins it, since it can be many GB.
4. Done when `node lib/doctor.mjs --check` ends with "All set".

## 4. Prove it works (2 minutes)
Ask for one short test clip (or use any in their footage folder): `node lib/transcribe-footage.mjs "<Folder>/<File>"`
and show them the transcript's first lines. First run downloads the speech model (~150 MB).

## 5. Hand over
One short message: what's set up, where finished Reels will land, how to start ("say *new Reel* and drop your
footage"), and anything still open. The scrolly-reels skill is written for Mercedes: for anyone else, follow its
steps but take names, folders, tracker, posting and rules from their settings, never hers.

## Never
- Never put passwords, API keys or tokens into chat or into `reel-settings.json`.
- Never install system software (Node, Python, a browser) or pin a synced folder without a yes.
- Never keep another person's folders, tracker, rules or handle in a new person's file.
- Never create a Notion database, Buffer channel or WordPress anything without asking.

## Credits
The doctor-script pattern comes from Nicola Pocock's (@getgitgirl) claude-reel-editor, MIT license
(`automation/reel-engine/reference/claude-reel-editor/`).
