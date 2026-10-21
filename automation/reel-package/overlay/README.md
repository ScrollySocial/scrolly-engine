# Reel Engine: getting started

Turn one talking-head take into a finished, graphics-rich Instagram Reel (MP4 + cover), edited by Claude on your own
computer. Nothing is uploaded: transcription, editing and rendering all run locally.

## What you need
- **Windows 10 or 11** (Mac is untested for now).
- **A paid Claude plan** with Claude Code (Pro, $20/month, or higher; see claude.com/pricing). Not included.
- **Claude Code**, in the Claude desktop app (Code tab) or in a terminal.
- About **3 GB free space** and an internet connection for the first setup (tools and the speech model download once).
- Optional: **10 free sound effects** you download yourself from Mixkit (see [sounds.md](sounds.md)). Reels build
  without them; the sounds just stay silent.

## 1. Put the folder somewhere permanent
Unzip this folder to a place it can stay, e.g. `Documents/reel-engine`. Avoid a folder that syncs (OneDrive, Dropbox):
renders write big temporary files.

## 2. Open it in Claude Code and run setup
Open the folder in Claude Code and say:

> **set up my Reel engine**

Claude asks a few plain questions (your name, where your raw videos and finished Reels go, how you post, your colors
and fonts) and then installs everything that's missing: Node and Python if needed (it asks first), the HyperFrames
video tools, ffmpeg, a browser path, and the local speech-to-text model. The first run takes 5 to 15 minutes, mostly
downloads.

It's done when this says **All set**:
```
node lib/doctor.mjs --check
```

### Your brand kit (part of setup)
Setup asks about your look and saves it as your **brand kit** (`lib/brand/my-brand.mjs`), so every Reel, caption and
cover uses it:
- **Colors:** seven, by job (background, a warmer light tone, the highlighter behind key words, text, one accent, two
  soft panel colors). Give Claude your hex codes or a link to your website and it maps them for you.
- **Fonts:** a clean font for captions, a big bold one for statements, a handwritten one for notes. No fonts of your
  own? Keep the starter fonts (free, licensed for video). A font you paid for may not allow video: setup asks.
- **Caption style:** clean, big and bold, or handwritten, and how many words per line.
- **Never-do rules:** anything you never want in a Reel ("no emojis", "never say hustle", "no text over my face").
- **Holiday kits:** Halloween, Thanksgiving, Christmas and Valentine's Day versions of your kit (same fonts, festive
  colors). Pick one for a single Reel on the review page; your normal kit stays the default.

**Change any of it later:** tell Claude "change my brand colors", "use a different caption font", "add a never-do
rule" or "add an Easter kit". The next Reel uses it; Reels you already made stay as they are.

## 3. Add the sounds (optional, 5 minutes)
Follow [sounds.md](sounds.md): download 10 files from Mixkit, drop them in `lib/assets/sfx/`, run `node lib/doctor.mjs`.

## 4. Make your first Reel
Film one take on your phone (vertical, 20 to 90 seconds, you talking to the camera). Put it in your footage folder,
then tell Claude:

> **make a Reel from &lt;your file name&gt;**

What happens:
1. **Transcribe** your take (on your computer).
2. **Rough cut:** Claude keeps the best take of each line and trims the pauses; you OK the list.
3. **Plan:** a moment-by-moment plan of graphics, captions and sounds, built from your own words and your brand kit.
4. **Review page** on your laptop (http://localhost:4321): see each moment drawn over your footage, change captions,
   sounds, music and transitions, then approve.
5. **Draft video** to check (a few minutes for a 60-second Reel). The motion looks choppy on purpose: a draft
   renders about 3 times faster, so you see your edit sooner. Leave notes or approve it.
6. **Final video** once you approve the draft: the smooth, full-quality MP4 (about 10 to 15 minutes for a 60-second
   Reel) and the cover. Finished files land in your exports folder (`final/<reel>.mp4`, `<reel>/cover.png`). Drafts
   wait in `draft/` and are removed once the final is made. Rather skip the draft? Tell Claude "turn off draft renders".

## Where things are
| Folder / file | What it is |
|---|---|
| `reel-settings.json` | Your setup: name, folders, posting, rules. Setup writes it; edit it any time |
| `lib/brand/my-brand.mjs` | Your look: 7 colors by role, 3 fonts, caption style |
| `lib/brand/holidays.mjs` | Holiday versions of your kit (colors you can change) |
| `lib/` | The engine: components, Studio template, review page, cover maker, doctor |
| `lib/assets/sfx/` | Your downloaded sound effects ([sounds.md](sounds.md)) |
| `tools/` | Transcription and the silence-aware cut (doctor installs their helpers here) |
| `plans/<reel>/plan.json` | Which parts of your take each Reel keeps |
| `<yyyy-mm-dd-name>/` | One folder per Reel: its `build.mjs`, `index.html`, review files, renders |
| `THIRD-PARTY-NOTICES.md` | Open-source pieces and their licenses |

## The commands behind it (Claude runs these for you)
```
node lib/doctor.mjs                                   # check + fix the setup (--check = look only)
node lib/new-reel.mjs 2026-11-02-my-first-reel        # new Reel folder
node lib/transcribe-footage.mjs "My Series/IMG_0001.MOV"
node lib/prep-footage.mjs 2026-11-02-my-first-reel 2026-11-02-my-first-reel   # cut → talk.mp4 + words.json
cd 2026-11-02-my-first-reel && node build.mjs && npm run check && npm run render
```
The engine reference (every file in `lib/`) is in [lib/README.md](lib/README.md).

## Updating to a new version
Each update is a new download (the folder name says the version, e.g. `reel-engine-v0.1.0`; `VERSION` inside says it
too). Unzip it next to your current folder, then copy these from the old folder into the new one:
- `reel-settings.json` (your setup)
- `lib/brand/my-brand.mjs`, `lib/brand/holidays.mjs` and any other kit you made, plus your own font files in
  `lib/assets/fonts/` (with their license files)
- `lib/assets/sfx/` (your downloaded sounds)
- `plans/`, `work/` and your Reel folders (`yyyy-mm-dd-…`) if you want to keep editing old Reels there

Then open the new folder in Claude Code and run `node lib/doctor.mjs`. Or just say **"move my setup from
<old folder>"** and Claude copies them for you.

## Trouble?
- Run `node lib/doctor.mjs`. Every line says OK, FIXED, NOTE (doesn't block) or NEEDS YOU (with what to do).
- "Claude Code signed in (terminal)" as a NOTE is fine if you use Claude Code inside the desktop app.
- A render that stops on long footage: tell Claude, the engine splits long takes into short pieces for exactly this.
