# Reel Engine: your setup guide

The Reel Engine turns one talking-to-camera take into a finished, graphics-rich Instagram Reel (MP4 + cover). Claude
does the editing on your own computer: it writes the captions, adds graphics and sounds around you, cuts the pauses,
and renders the video. You check it and approve it.

You do two things during setup: let Claude install itself, and tell it how you want your Reels to look. That's it.

## How it's built (and why)

- **Everything runs on your computer.** Your videos, the transcription, the editing and the rendering all stay on your
  laptop. Claude works from your transcript and a few still frames, never your video files.
- **You review each Reel on a page that opens in your browser** (http://localhost:4321). It's a small website running
  on your own laptop, so it shows your real footage with the real graphics, sounds and music, live.
- **Why not a claude.ai page (an Artifact)?** That works too, and it can be shared with a teammate. We chose the page on
  your laptop because it's much faster: an Artifact needs your video uploaded and a new draft rendered for every
  change, while the local page shows changes right away and uploads nothing.
- **Claude Code is the editor.** The engine is a set of building blocks (captions, graphics, covers, sounds) plus
  instructions Claude follows. You talk to it in plain words; it runs the commands.

## What you need
- **Windows 10 or 11.** Mac isn't tested yet.
- **A paid Claude plan** (Pro, $20 a month, or higher; see claude.com/pricing). Not included.
- **The Claude desktop app** (claude.ai/download), using its **Code** tab. Claude Code in a terminal works too.
- About **3 GB of free space** and internet for the first setup (tools and the speech model download once).

## Step 1. Put the folder somewhere permanent (2 minutes)
Unzip this folder to a short path that stays put, for example `Documents\reel-engine`. Windows limits how long a path
can be, and the speech-to-text helpers sit deep inside the folder, so a short path matters.
Avoid a folder that syncs (OneDrive, Dropbox): renders write big temporary files.

## Step 2. Let Claude set itself up (15 to 30 minutes, mostly waiting)
Open the Claude desktop app, go to the **Code** tab, choose this folder, and say:

> **set up my Reel engine**

Claude then:
1. **Asks a few questions:** your first name, your Instagram handle, where your raw videos go and where finished
   Reels should land. It looks for your folders first, so mostly you just pick one.
2. **Installs what's missing:** the video tools, ffmpeg, a browser link and the speech-to-text model. If your computer
   needs Node or Python, Claude asks before installing them.
3. **Checks everything works** and tells you when it's done ("All set").

When Claude asks for permission to run a command, that's normal: it's installing tools in this folder.

## Step 3. Choose your look and your rules (10 minutes)
This is the fun part, and it's all yours. Your Reels can look completely different from ours.

**Your brand kit.** Claude asks for:
- **Colors:** give it your hex codes or a link to your website, and it picks seven roles from them (background,
  a warmer light tone, the highlighter behind key words, text, one accent, two soft panel colors). It shows you the
  mapping before saving.
- **Fonts:** a clean one for captions, a big one for statements, a handwritten one for notes. No fonts of your own?
  Keep the starter fonts (free and licensed for video). A font you paid for may not allow video, so Claude asks.
- **Caption style:** clean, big and bold, or handwritten, and how many words per line.
- **Music level:** Normal (recommended), Quiet or Up front.
- **Holiday kits:** festive color versions of your kit for Halloween, Thanksgiving, Christmas and Valentine's Day.
  Pick one for a single Reel on the review page; your normal kit stays the default.

Claude renders a cover in your kit so you see it before you're done.

**Your rules.** Claude shows you our **recommended starter rules**: things we learned make Reels look polished and
less AI-made, like keeping graphics off your face, never using "It's not X, it's Y" lines, and never inventing
numbers or results. Keep each one, switch it off, or add your own ("no emojis", "never say hustle", "no pink").
The engine follows your list on every Reel.

**Change any of it later:** say "change my brand colors", "use a different caption font", "add a rule" or "add an
Easter kit". The next Reel uses it; Reels you already made stay as they are.

## Step 4. Download your sounds (about 10 minutes, optional)
The engine uses 25 free sound effects from Mixkit (pops, whooshes, ticks, typing, a ding). Mixkit's license lets you
use them in your Reels but doesn't let us put them inside the engine, so you download them once yourself.
[sounds.md](sounds.md) has every link, what each sound is for, and **the 8 to start with** if you're short on time.
Drop the downloads in `lib/assets/sfx/` and tell Claude "check my sounds". A missing sound just stays silent.

Music: add your own tracks (Mixkit's free music or any library you have a license for). Instagram sounds can be added
in the Instagram app after you post, if your account has them.

## Making a Reel

### Start each Reel in a new chat
Open a **new chat** in this folder for every Reel and say:

> **make a Reel from IMG_0412.MOV**

(use your file's name; Claude finds it in your footage folder). One chat per Reel works best: each Reel needs a lot of
detail (your transcript, the plan, your choices), and a fresh chat keeps Claude focused and uses less of your plan's
limit. Nothing gets lost between chats, because every Reel's plan and choices are saved in its own folder.

**Coming back to a Reel later?** Open a new chat and say "**continue my Reel 2026-11-02-my-first-reel**" (the folder
name). Claude reads where you left off.

**Keep a content tracker in Notion?** Claude can connect to it during setup. Then you can start a new chat with
"**make the next Reel from my tracker**" and it picks up the next row, and updates the row when the Reel is done.
Without a tracker, the file name is all it needs.

### What happens
1. **Transcribe:** your take becomes text, on your computer.
2. **Rough cut:** Claude keeps the best take of each line and trims the pauses. You OK the list.
3. **Plan:** a moment-by-moment plan of graphics, captions and sounds, built from your words, your kit and your rules.
4. **Review page:** see each moment drawn over your footage; change captions, sounds, music and transitions; approve.
5. **Draft video:** a quick version to check (a few minutes for a 60-second Reel). It looks choppy on purpose, because
   a draft renders about 3 times faster. Leave notes or approve it.
6. **Final video:** the smooth, full-quality MP4 (about 10 to 15 minutes for 60 seconds) and the cover, in your
   exports folder. Rather skip the draft? Say "turn off draft renders".

Film tips: vertical, 20 to 90 seconds, you talking to the camera in one take. Retakes are fine; Claude keeps the best
one of each line.

### Good to know about the review page
- Any browser works (Edge, Chrome, the Claude app's own browser). Your choices save to a file on your computer.
- The page remembers your step and tab separately in each browser, so a different browser may open on step 1. Your
  choices are all still there.
- Keep one window open per Reel. If the same Reel is open twice, the window you change last can overwrite the other.

## Updating to a new version
Each update is a new download (the folder name and the `VERSION` file say the version). Unzip it next to your current
folder, open the new folder in Claude and say **"move my setup from <old folder>"**. Claude copies your settings,
brand kits, fonts, sounds and Reels across.

## Trouble?
Say **"check my Reel engine"**. Claude runs the setup check, where every line says OK, FIXED, NOTE (doesn't block) or
NEEDS YOU (with what to do), and fixes what it can.
- A render that stops on long footage: tell Claude; the engine can split long takes into short pieces.
- Still stuck: reply to your order email with what Claude said, and we'll help.

## For the curious: where things are
| Folder / file | What it is |
|---|---|
| `reel-settings.json` | Your setup: name, folders, posting, rules. Setup writes it |
| `lib/brand/my-brand.mjs` | Your look: 7 colors by role, 3 fonts, caption style |
| `lib/brand/holidays.mjs` | Holiday versions of your kit |
| `lib/` | The engine: graphics, the Studio template, review page, cover maker, setup check |
| `lib/assets/sfx/` | Your downloaded sound effects ([sounds.md](sounds.md)) |
| `tools/` | Transcription and the silence-aware cut |
| `plans/<reel>/plan.json` | Which parts of your take each Reel keeps |
| `<yyyy-mm-dd-name>/` | One folder per Reel: its plan, review choices and renders |
| `CLAUDE.md` | The instructions Claude follows in this folder |
| `THIRD-PARTY-NOTICES.md` | Open-source pieces and their licenses |

The commands Claude runs, and every engine file, are listed in [lib/README.md](lib/README.md).
