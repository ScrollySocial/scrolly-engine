# Reel engine library (HyperFrames)

Shared pieces for every Reel in `<package>/<yyyy-mm-dd-slug>/`. A Reel's `build.mjs` only declares what appears when;
this folder owns the look, motion, footage handling, captions and audio wiring.

**One person's setup lives in `../reel-settings.json`, never in `lib/`:** name, Instagram handle, default brand kit,
footage + exports folders, browser path, tool locations, review ports, posting route, tracker, personal rules and
template overrides (e.g. music level). The **`reel-engine-setup`** skill (`.claude/skills/reel-engine-setup/`) asks a
few questions, writes the file and runs `doctor.mjs`, which installs what's missing.

| File | What it does |
|---|---|
| `settings.mjs` | Reads `../reel-settings.json` (`REEL_SETTINGS=<file>` to test another): resolved paths, ffmpeg/ffprobe, browser, puppeteer launch, template overrides |
| `reel.mjs` | Engine core: frames, scenes, cut-outs, camera (alternate / punch / whip), captions, sfx, music → `index.html` |
| `components.mjs` | Component catalog (list at the top of the file) + all component CSS |
| `brand/my-brand.mjs` | Your brand kit: colors by role, fonts, site |
| `brand/index.mjs` | Every kit the review page's Brand kit dropdown offers; another kit = one file + one line; the default comes from settings `brand` |
| `templates/studio.mjs` | Studio template: segment length, framing, caption rules, music level, sfx lengths (settings `templates.studio` overrides) |
| `templates/project/` | HyperFrames project files every new Reel folder starts with |
| `transcribe-footage.mjs` | Footage → 16 kHz wav → local faster-whisper transcript in settings `tools.transcripts` |
| `prep-footage.mjs` | Silence-aware cut (`tools/cut/prep.mjs`, reads `plans/<id>/plan.json`) → talk.mp4, voice track, muted 18s segments, words.json |
| `new-reel.mjs` | Scaffolds a Reel folder (config, shared fonts/gsap/sfx, starter build.mjs) |
| `doctor.mjs` | Setup check **and fixer**. `--check` = look only, `--install` = also Node/Python/browser via winget/brew |
| `review/` | Review page: `node build.mjs review` → `node lib/review/server.mjs <reel>` → http://localhost:4321; read back with `node lib/review/import.mjs <reel>` |
| `review/hub.mjs` | One page for every Reel: http://localhost:4320 (`--start` runs it in the background) |
| `pipeline.mjs` | Where every Reel stands (plan / edit / render / approve / post / done) |
| `render-ready.mjs` | Renders every Reel with Plan it + Edit it approved: first a quick draft (15 fps, ~3× faster) to exports/draft for Approve it, then after approval the full-quality MP4 to exports/final, plus the cover. Settings `render.draft: false` skips the draft; `--full` forces full quality |
| `post-reel.mjs` | Posting copy (cover as frame 0, CRF 20, ≤9 Mbps); uploads to WordPress media only when settings `posting.videoHost` = wordpress |
| `cover.mjs` | Covers: your cut-out on a brand color with the title, or a full frame |
| `animatic.mjs` | Storyboard stills timed to voice + music + sound effects |
| `assets/` | Shared fonts (+ their OFL licenses), gsap, and the sound effects you downloaded (`sfx/`, see `../sounds.md`) |

## plan.json (the keep list for the cut)
`plans/<id>/plan.json`:
```json
{
  "segments": [
    { "src": "My Series/IMG_0001.MOV", "in": 0.7, "out": 18.2, "transcript": "audio/My_Series__IMG_0001.json" }
  ],
  "maxPause": 0.45
}
```
`src` is relative to the footage folder; `in`/`out` are seconds in the take (the cut moves each point into the nearest
real silence); `transcript` is the file `transcribe-footage.mjs` printed. Optional: `exact` (`{ "heard": "meant" }`
word fixes), `fix` (lower-case word → spelling, e.g. your brand name), `insert`, `drop`.

## Sounds
A sound the build asks for that isn't in `lib/assets/sfx/` is left out (the build prints `sound off: …`), so a Reel
always builds. Download them with `../sounds.md`.

## Long footage
`npm run check` / snapshots on long takes need `PRODUCER_PAGE_NAVIGATION_TIMEOUT_MS=180000
PRODUCER_PLAYER_READY_TIMEOUT_MS=180000`. HyperFrames reads each video in a 30-second window, which is why the engine
plays the take as muted ~18s segments plus one voice track.

## Growing the library
Add a component only after it ships in an approved Reel. Check the HyperFrames registry first
(`npx hyperframes catalog <words>`): chat threads, typing indicators, hand-drawn arrows and underlines, cursors,
whip pans and count-ups already exist there.
