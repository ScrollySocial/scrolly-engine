# Third-party notices

The Reel engine is built on other people's open-source work. This file lists what's included in this package, what
gets installed on your computer during setup, and the license each one comes under.

## Included in this package

### GSAP 3.15.0
- File: `lib/assets/js/gsap.min.js` (copied into each Reel's `assets/js/`)
- Copyright 2026, GreenSock. All rights reserved.
- License: GSAP Standard License, https://gsap.com/standard-license. Free to use, including commercially. The
  copyright header at the top of the file must stay in place.

### Figtree
- File: `lib/assets/fonts/figtree.woff2`
- Copyright 2022 The Figtree Project Authors (https://github.com/erikdkennedy/figtree)
- License: SIL Open Font License 1.1, full text in `lib/assets/fonts/OFL-figtree.txt`

### Bricolage Grotesque
- File: `lib/assets/fonts/bricolage-800.woff2` (a subset of the font: the 800 weight)
- Copyright 2022 The Bricolage Grotesque Project Authors (https://github.com/ateliertriay/bricolage)
- License: SIL Open Font License 1.1, full text in `lib/assets/fonts/OFL-bricolage-grotesque.txt`

### Covered By Your Grace
- File: `lib/assets/fonts/covered-by-your-grace.woff2`
- Copyright (c) 2010, Kimberly Geswein (kimberlygeswein.com)
- License: SIL Open Font License 1.1, full text in `lib/assets/fonts/OFL-covered-by-your-grace.txt`

The fonts are part of the starter brand kit. The Open Font License lets them be bundled with software; it doesn't let
them be sold on their own.

### HyperFrames project template
- Files: `lib/templates/project/hyperframes.json`, `CLAUDE.md`, `AGENTS.md` (copied into each new Reel folder)
- From HyperFrames, Copyright 2026 HeyGen, Inc. (https://github.com/heygen-com/hyperframes)
- License: Apache License 2.0, full text in `licenses/Apache-2.0-HyperFrames.txt`

## Installed during setup (downloaded by you, not included)
`node lib/doctor.mjs` and the first Reel build download these from their official sources. Each copy comes with its
own license file.

| What | Used for | License | Source |
|---|---|---|---|
| HyperFrames (`hyperframes` CLI, Studio), HeyGen, Inc. | turns each Reel into video: preview, checks, render | Apache License 2.0 | npm, https://github.com/heygen-com/hyperframes |
| Puppeteer, Google LLC | drives a headless browser for stills and covers | Apache License 2.0 | npm, https://github.com/puppeteer/puppeteer |
| faster-whisper, SYSTRAN | transcribes your footage on your own computer | MIT License | PyPI, https://github.com/SYSTRAN/faster-whisper |
| Whisper speech model (base.en), OpenAI | the model faster-whisper runs | MIT License | downloaded on first transcription |
| GSAP (npm package `gsap`) | source of `gsap.min.js` if it's ever missing | GSAP Standard License | npm, https://gsap.com |
| FFmpeg + FFprobe | cutting, audio, video files | LGPL / GPL (depends on the build) | your system's ffmpeg, or npm `ffmpeg-static` and `@ffprobe-installer/ffprobe` |
| imageio-ffmpeg | an ffmpeg for Python tools | BSD 2-Clause (bundled ffmpeg: its own license) | PyPI |

HyperFrames and HeyGen are trademarks of their owner. This product is built on HyperFrames; it isn't made or endorsed
by HeyGen.

## Not included: sound effects and music
No sound or music files ship with the engine. `sounds.md` lists the 25 Mixkit sound effects the engine's sound library uses
and how to download them yourself under Mixkit's free license.

## Credits
The setup-check ("doctor") script and the review page's ideas (tap a word to cut it, notes at a moment) were inspired
by Nicola Pocock's (@getgitgirl) claude-reel-editor, MIT License, https://github.com/nicolapocock/claude-reel-editor.
