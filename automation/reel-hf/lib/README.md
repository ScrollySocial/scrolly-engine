# Reel engine library (HyperFrames)

Shared pieces for every Reel in `automation/reel-hf/<yyyy-mm-dd-slug>/`. A Reel's `build.mjs` only declares
what appears when; this folder owns the look, motion, footage handling, captions and audio wiring.
Spec and decisions: vault `products/content-engine/reel-engine-handoff.md`. Workflow: the `scrolly-reels` skill (`.claude/skills/scrolly-reels/`).

| File | What it does |
|---|---|
| `reel.mjs` | Engine core: frames, scenes, cut-outs, camera (alternate / punch / whip), captions, sfx, music → `index.html` |
| `components.mjs` | Component catalog (list at the top of the file) + all component CSS |
| `cta.mjs` | Every Reel's purpose: the 6 actions (Follow, Comment a word, Share, Save, Link in bio, Comment for a freebie), their end-card text, caption line and hook tip. `R.endCard({ kind, word, detail })` in build.mjs; her Ending pick (decisions.json `cta`) wins |
| `brand/scrolly.mjs` | Brand kit: colors by role, fonts, site. A customer swaps this one file |
| `brand/index.mjs` | Every kit the review page's Brand kit dropdown offers (Scrolly, Scrolly Holiday draft); a customer kit = one file + one line |
| `templates/studio.mjs` | Studio template: segment length, framing, caption rules, music level, sfx lengths |
| `prep-footage.mjs` | Silence-aware cut (reel-studio/prep.mjs) → talk.mp4, voice track, muted 18s segments, words.json |
| `new-reel.mjs` | Scaffolds a Reel folder (config, shared fonts/gsap/sfx, starter build.mjs) |
| `transcribe-footage.mjs` | Footage → 16 kHz wav → local faster-whisper transcript in carousels/reels/_work/audio |
| `doctor.mjs` | Setup check (ffmpeg/ffprobe, puppeteer 25.13.0, Edge, whisper, fonts, sfx, OneDrive folders) |
| `review/` | Review page (laptop): `node build.mjs review` → `node lib/review/server.mjs <reel>` → http://localhost:4321; read back with `node lib/review/import.mjs <reel>` |
| `pipeline.mjs` | Where every Reel stands (plan / edit / render / approve / post / done) from its review files; `--mark <reel>` after acting on her choices |
| `render-ready.mjs` | Renders every Reel with Plan it + Edit it approved: build, check, render, fresh copy to OneDrive final, her cover, page refresh |
| `post-reel.mjs` | Posting copy (cover as frame 0, CRF 20, ≤9 Mbps) → WordPress media (never-expiring link for Buffer); `--buffer <id>` records it |
| `review/hub.mjs` | One page for every Reel: http://localhost:4320 (`--start` runs it in the background); opens each Reel's page on 4331+ |
| `../rows.json` | Notion row → Reel folder ledger, so the overnight run never drafts a row twice |
| `animatic.mjs` | Storyboard stills timed to voice + music + sound effects (review before the full build) |
| `assets/` | Shared fonts, gsap, the 10 approved sound effects |

## New Reel
```bash
node lib/new-reel.mjs 2026-10-14-my-slug
# write ../carousels/reels/2026-10-14-my-slug/plan.json (keep list), then:
node lib/prep-footage.mjs 2026-10-14-my-slug 2026-10-14-my-slug
cd 2026-10-14-my-slug && node build.mjs && npm run check
```
Long footage needs `PRODUCER_PAGE_NAVIGATION_TIMEOUT_MS=180000 PRODUCER_PLAYER_READY_TIMEOUT_MS=180000` for check/snapshot.

## Proof the library matches the approved Reel
`2026-10-13-bb-voice-file/build-lib.mjs` rebuilds the first Studio Reel from the library. Against the original
`build.mjs` output, it gives the same CSS, the same on-screen text, the same elements (an empty `id=""` dropped) and
all 145 GSAP timeline calls identical in value and per-target order (2026-10-13). `npm run check` passes.

## Rules baked in (Mercedes)
- Statements: condensed heavy grotesque; emphasis = peach marker swipe (`<m>word</m>`); asides handwritten. Never italic serif accents or color-changed words. No eyebrow cards.
- Graphics around her body (above her head first), never over her face. Circles/scribbles never cross the text they mark.
- One music track, one static volume + fades. Never the SAME sound effect back to back, except list items: when she says a list, each item can share one sound (Mercedes 2026-10-14).
- No em dashes or "|" on screen. Business Brain CTA = name + scrollyseo.com, never the price.

## Growing the library
Add a component only after it ships in an approved Reel. Check the HyperFrames registry first
(`npx hyperframes catalog <words>` from automation/hyperframes-test). Candidates seen 2026-10-13, not yet tried:
`claude-exchange`, `chatgpt-exchange` (real-looking app UI), `chat-thread`, `typing-indicator`, `streaming-text`,
`hw-arrow`, `hw-underline`, `marker-highlight`, `agent-cursor`, `cursor-text-select`, `whip-pan-cut`, `count-up`.
