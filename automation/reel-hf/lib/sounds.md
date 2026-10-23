# Sound effects: download checklist

The Reel engine uses 25 free sound effects from [Mixkit](https://mixkit.co/free-sound-effects/). Mixkit's
license lets you use them in your Reels, but doesn't let us ship the files inside the engine, so you download them once
yourself (about 10 minutes).

1. For each row, open the **download** link (or the category page and find the sound by its exact title).
2. Press **Download Free SFX**. Leave the file in your Downloads folder with Mixkit's name; no renaming needed.
3. Tell Claude "check my sounds" (or run `node lib/doctor.mjs`): it finds the Mixkit downloads in your Downloads
   folder or `lib/assets/sfx/`, saves them under the engine's names, and lists any sound still missing. A missing
   sound is skipped, so a Reel still renders without it.

**Short on time? Start with these 8.** They cover most Reels; add the rest whenever you like:
`pop-light.mp3` (small things popping on, list items), `whoosh-air.mp3` (a panel or card sliding in), `swoosh-in.mp3` (a small graphic sweeping in), `check.mp3` (a tick appearing, the good example), `nope.mp3` (the bad example (one, not three in a row)), `typing-short.mp3` (a short prompt or word typed), `riser.mp3` (a short build into a reveal), `chime.mp3` (a point landing).

**How the engine uses them.** These sound rules are on by default (your own rules win; say "add a rule" to change one):
1. A few sounds per Reel, each on a moment that earns it (something appears, moves or lands), timed to the word it marks.
2. Different sounds can stack on one moment.
3. Never the same sound twice in a row: the second one sounds like a glitch.
4. Except a spoken list: every item can get the same sound (3 items, 3 of the same pop), so the items feel like a set.
5. Several marks on one thing (circles, cross-outs) get one sound on the last mark, not one each.
6. One fail sound per bad example, never two or three fail sounds back to back.
7. One music track per Reel, one volume level for the whole track, a slow fade in (about 4 seconds) and a short fade out.
8. Music sits under the voice at Normal by default (clearly heard, voice on top); Quiet and Up front are the other choices.

Change any sound per moment on the review page. If a change puts the same sound twice in a row, the build says so.

Your own sounds work too: drop any short mp3 into `lib/assets/sfx/` and it shows up in the review page's sound library.
Music: download your own tracks the same way (Mixkit's [free music](https://mixkit.co/free-stock-music/) or any library
you have a license for) into your Reel's `assets/music/` folder.

## Pop: something appears (a badge, a sticker, a chat bubble)

| File name | Mixkit title | Links | Use it for |
|---|---|---|---|
| `pop-light.mp3` | Explainer video pops whoosh light pop | [pop](https://mixkit.co/free-sound-effects/pop/) · [download](https://mixkit.co/free-sound-effects/download/3005/) | small things popping on, list items |
| `pop-bubble.mp3` | Bubble pop up alert notification | [pop](https://mixkit.co/free-sound-effects/pop/) · [download](https://mixkit.co/free-sound-effects/download/2357/) | a bigger element popping on |
| `pop-message.mp3` | Message pop alert | [notification](https://mixkit.co/free-sound-effects/notification/) · [download](https://mixkit.co/free-sound-effects/download/2354/) | a chat bubble or DM arriving |

## Whoosh: something moves in or out, or the scene changes

| File name | Mixkit title | Links | Use it for |
|---|---|---|---|
| `whoosh-air.mp3` | Air woosh | [whoosh](https://mixkit.co/free-sound-effects/whoosh/) · [download](https://mixkit.co/free-sound-effects/download/1489/) | a panel or card sliding in |
| `whoosh-fast.mp3` | Fast whoosh transition | [whoosh](https://mixkit.co/free-sound-effects/whoosh/) · [download](https://mixkit.co/free-sound-effects/download/1490/) | whip transitions |
| `swoosh-in.mp3` | Fast small sweep transition | [swoosh](https://mixkit.co/free-sound-effects/swoosh/) · [download](https://mixkit.co/free-sound-effects/download/166/) | a small graphic sweeping in |
| `swoosh-out.mp3` | Ending wind swoosh | [swoosh](https://mixkit.co/free-sound-effects/swoosh/) · [download](https://mixkit.co/free-sound-effects/download/1482/) | a graphic leaving, end of a section |
| `zoom-in.mp3` | Air zoom vacuum | [transition](https://mixkit.co/free-sound-effects/transition/) · [download](https://mixkit.co/free-sound-effects/download/2608/) | zoom-in transitions and punch-ins |

## Success: a tick, a right answer, a win

| File name | Mixkit title | Links | Use it for |
|---|---|---|---|
| `check.mp3` | Correct positive notification | [correct](https://mixkit.co/free-sound-effects/correct/) · [download](https://mixkit.co/free-sound-effects/download/957/) | a tick appearing, the good example |
| `reward.mp3` | Correct answer reward | [correct](https://mixkit.co/free-sound-effects/correct/) · [download](https://mixkit.co/free-sound-effects/download/952/) | the result or payoff moment |
| `coins.mp3` | Clinking coins | [money](https://mixkit.co/free-sound-effects/money/) · [download](https://mixkit.co/free-sound-effects/download/1993/) | money, sales, prices |

## Fail: a wrong answer, the bad example

| File name | Mixkit title | Links | Use it for |
|---|---|---|---|
| `nope.mp3` | Funny fail low tone | [wrong](https://mixkit.co/free-sound-effects/wrong/) · [download](https://mixkit.co/free-sound-effects/download/2876/) | the bad example (one, not three in a row) |
| `buzzer.mp3` | Wrong long buzzer | [wrong](https://mixkit.co/free-sound-effects/wrong/) · [download](https://mixkit.co/free-sound-effects/download/954/) | a big "wrong" moment |
| `sad-trombone.mp3` | Slow sad trombone fail | [wrong](https://mixkit.co/free-sound-effects/wrong/) · [download](https://mixkit.co/free-sound-effects/download/472/) | a funny letdown (use rarely) |

## Typing: text being written on screen

| File name | Mixkit title | Links | Use it for |
|---|---|---|---|
| `typing-laptop.mp3` | Typing on a laptop keyboard | [click](https://mixkit.co/free-sound-effects/click/) · [download](https://mixkit.co/free-sound-effects/download/2531/) | longer typing on screen (cut to the moment) |
| `typing-short.mp3` | Typing on an electronic device | [typewriter](https://mixkit.co/free-sound-effects/typewriter/) · [download](https://mixkit.co/free-sound-effects/download/1376/) | a short prompt or word typed |
| `typewriter-bell.mp3` | Typewriter return bell | [typewriter](https://mixkit.co/free-sound-effects/typewriter/) · [download](https://mixkit.co/free-sound-effects/download/1368/) | end of a typed line, "done" |

## Riser: build-up into a reveal

| File name | Mixkit title | Links | Use it for |
|---|---|---|---|
| `riser.mp3` | Short sci-fi swell | [swell](https://mixkit.co/free-sound-effects/swell/) · [download](https://mixkit.co/free-sound-effects/download/2669/) | a short build into a reveal |

## Click: a cursor or button press, a photo taken

| File name | Mixkit title | Links | Use it for |
|---|---|---|---|
| `camera.mp3` | Camera shutter click | [camera](https://mixkit.co/free-sound-effects/camera/) · [download](https://mixkit.co/free-sound-effects/download/1133/) | a photo, a screenshot, a post appearing |
| `mouse-click.mp3` | Mouse click close | [click](https://mixkit.co/free-sound-effects/click/) · [download](https://mixkit.co/free-sound-effects/download/1113/) | a cursor clicking a button |

## Ding: an idea, a notification, a point landing

| File name | Mixkit title | Links | Use it for |
|---|---|---|---|
| `chime.mp3` | Alert quick chime | [notification](https://mixkit.co/free-sound-effects/notification/) · [download](https://mixkit.co/free-sound-effects/download/766/) | a point landing |
| `bell.mp3` | Bell notification | [notification](https://mixkit.co/free-sound-effects/notification/) · [download](https://mixkit.co/free-sound-effects/download/933/) | a notification, an idea arriving |

## Record scratch: "wait, stop"

| File name | Mixkit title | Links | Use it for |
|---|---|---|---|
| `record-scratch.mp3` | Record player vinyl scratch | [dj-record-scratch](https://mixkit.co/free-sound-effects/dj-record-scratch/) · [download](https://mixkit.co/free-sound-effects/download/702/) | "wait, stop", a turn in the story |

## Paper and sparkle: a card slides, something turns magic

| File name | Mixkit title | Links | Use it for |
|---|---|---|---|
| `paper-slide.mp3` | Paper slide | [paper](https://mixkit.co/free-sound-effects/paper/) · [download](https://mixkit.co/free-sound-effects/download/1530/) | a card, receipt or page sliding in |
| `sparkle.mp3` | Magic wand sparkle | [sparkle](https://mixkit.co/free-sound-effects/sparkle/) · [download](https://mixkit.co/free-sound-effects/download/3062/) | something turning "magic", a transformation |

License: [Mixkit Sound Effects Free License](https://mixkit.co/license/#sfxFree). Free for commercial use in your
videos; don't redistribute the files on their own.
