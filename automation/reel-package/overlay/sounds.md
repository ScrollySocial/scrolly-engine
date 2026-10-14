# Sound effects: download these 10 yourself (about 5 minutes)

The Reel engine adds small sounds to your Reels (a pop when a sticker appears, a whoosh on a transition, a chime on
the end card). The sound files are **not included** in this package: Mixkit's free license lets you use them in your
own videos, but not pass them around inside a tool like this one. So you download them once, straight from Mixkit,
under your own free Mixkit license.

**Until you do, everything still works:** a missing sound just stays silent.

## How
1. Open each link below, find the sound by its title (the Mixkit number helps when titles look alike), and click
   **Download Free SFX**. No account needed.
2. Put all the downloaded files in this package's `lib/assets/sfx/` folder. Don't rename them.
3. Run `node lib/doctor.mjs` (or ask Claude: "check my Reel engine"). It finds each download by its Mixkit number,
   saves it under the name the engine expects, and tells you if any are still missing.

Renaming by hand works too: save each file as the name in the first column (`.mp3` is best; a `.wav` gets converted
by doctor).

| Engine name | Mixkit title | Mixkit # | Where to find it | Used for |
|---|---|---|---|---|
| `pop-light.mp3` | Explainer video pops whoosh light pop | 3005 | [mixkit.co/free-sound-effects/whoosh](https://mixkit.co/free-sound-effects/whoosh/) | stickers, small cards popping in |
| `pop-bubble.mp3` | Bubble pop up alert notification | 2357 | [mixkit.co/free-sound-effects/pop](https://mixkit.co/free-sound-effects/pop/) | bigger pop-ins, chat bubbles |
| `whoosh-air.mp3` | Air woosh | 1489 | [mixkit.co/free-sound-effects/whoosh](https://mixkit.co/free-sound-effects/whoosh/) | soft transitions, things sliding in |
| `whoosh-fast.mp3` | Fast whoosh transition | 1490 | [mixkit.co/free-sound-effects/whoosh](https://mixkit.co/free-sound-effects/whoosh/) | whip transitions |
| `paper-slide.mp3` | Paper slide | 1530 | [mixkit.co/free-sound-effects/paper](https://mixkit.co/free-sound-effects/paper/) | paper, receipts, folders |
| `typing-laptop.mp3` | Typing on a laptop keyboard | 2531 | [mixkit.co/free-sound-effects/typing](https://mixkit.co/free-sound-effects/typing/) | a prompt or file typing on screen |
| `check.mp3` | Correct positive notification | 957 | [mixkit.co/free-sound-effects/correct](https://mixkit.co/free-sound-effects/correct/) | ✓ ticks |
| `nope.mp3` | Funny fail low tone | 2876 | [mixkit.co/free-sound-effects/wrong](https://mixkit.co/free-sound-effects/wrong/) | ✗ marks, "not this" |
| `buzzer.mp3` | Wrong long buzzer | 954 | [mixkit.co/free-sound-effects/buzzer](https://mixkit.co/free-sound-effects/buzzer/) | a big "wrong" moment |
| `chime.mp3` | Alert quick chime | 766 | [mixkit.co/free-sound-effects/chime](https://mixkit.co/free-sound-effects/chime/) | the end card |

Mixkit reorders its pages over time. If a sound isn't on the first page of its link, use the search box on mixkit.co
with the title.

## Your own sounds instead
Any short sound you have the right to use works. Save it in `lib/assets/sfx/` under one of the names above to replace
that sound everywhere, or tell Claude "add my sound <file> as <name>" to add a new one (its length goes in
`lib/templates/studio.mjs`, `sfxLen`).

## Music
No music is included either. Two easy routes:
- **Instagram sounds (simplest):** export the Reel without music and add a trending sound in Instagram when you post.
- **Your own track:** download a track you're licensed to use (Mixkit's free music, or a paid library), put it in the
  Reel's `assets/music/` folder and pick it on the review page. Keep it quiet under your voice: the engine plays one
  track at one steady level with fades.

## The license, in short
Mixkit's Sound Effects Free License (mixkit.co/license) lets you use these sounds in your own videos, including ones
you post commercially. It doesn't let you share or sell the sound files on their own. Read the full license on
mixkit.co before you download.
