# Reel editing workflow (v2 draft, 2026-10-12, waiting for Mercedes's OK)

Goal: Mercedes films, Claude edits, she approves at three checkpoints, and nothing slow gets made in the wrong
direction. Later this becomes part of the $10K Club content system (customers swap in their own brand kit).
Style references: [reel-style-breakdown.md](reel-style-breakdown.md). v1 (plain trim + bottom captions) was rejected:
clipped words and "not what I wanted".

## Style menu (pick one per Reel on the Notion row)
| Style | Based on | Filming | Feels like |
|---|---|---|---|
| **Studio** | Sample 1 (@li.gorbunova) | One talking-head take, one spot | Graphics-rich: stickers, screenshots, moving captions, a background swap or two |
| **Film** | Sample 2 (@justyn.ai) | Talking head + extra angles or locations + screen captures | Hero Reels: title cards, depth text, animated demos, fast cut bursts |
| **Chill** | Relaxed talks + the faceless b-roll previews she liked | One take, or b-roll only (often faceless) | Quiet small captions, slow zooms, a few highlights; stories, personal updates, text-led b-roll |
| **Demo** | Tutorials | Screen recording, often with her talking head (picture-in-picture or split screen) | Zooms on the part of the screen that matters, cursor clicks, step labels, her face reacting |
| **Quick Cut** | Short trend Reels | About 7 short clips | 15s or less: clips sped up and cut to about 0.6s each, still with great transitions, punchy sound effects and captions; cuts land on the beat |

All styles share the Scrolly brand kit: cream / peach / orange / ink (+ blush and mist panels), Bricolage Grotesque
800 condensed for statements with a peach marker swipe for emphasis, handwriting (Covered By Your Grace) + drawn
arrows for asides, Figtree for captions, orange wardrobe. Never italic serif accents or color-changed words
(Mercedes 2026-10-13). Code: `automation/reel-hf/lib/brand/scrolly.mjs`.

## Toolbox (any style can use these; the style sets how often)
- **Captions:** relaxed (small one-line tag) by default; main points go BOLD (big condensed statement with a
  marker-swiped word, placed by meaning, often above her head).
- **Stickers:** stars, sparkles, starbursts, sticky notes with handwritten-style text.
- **Proof:** screenshots and screen clips of what she's talking about, popping in as cards or in a phone frame.
- **Animations and demos:** cursor clicks, UI cards, app icons, step-by-step builds.
- **Background swaps:** her cut out on a flat brand color or in a circle mask, for a beat.
- **Title cards and depth text:** full-screen section cards; big words behind her head.
- **Treatments:** black-and-white beat, motion-blur whip transitions, punch-in zoom, circle highlight.
- **Audio:** sound effects on pop-ins and transitions; music baked in for Film-type Reels, or no music so she can
  add an Instagram sound in Edits (her call per Reel type).

## The loop (one Reel)
1. **Brief (Notion row):** series, style, topic, CTA. Two minutes.
2. **Script:** Claude drafts it, or interviews her to pull it out. **Checkpoint 1: she approves the script.**
3. **Film + gather:** shot list for the style; she drops the takes + any screenshots into the series folder.
4. **Rough cut:** best takes, retakes/stutters/long pauses removed, cut only in real silence (never mid-word).
   **Checkpoint 2: she approves a plain list of what stays, in order** (fast to check, nothing visual yet).
5. **Storyboard:** one still per beat showing every graphic, caption, zoom and sound cue.
   **Checkpoint 3: she approves or marks changes.**
6. **Render** to her phone (OneDrive).
7. **Polish + post:** optional hand touch-ups, add music in Edits if it's that type, post, then Claude makes the
   cover + matching carousel.
8. **Learn:** every "love this / never do that" goes into `automation/reel-studio/STYLE-RULES.md`, so the next Reel
   starts from everything she's taught so far.

## Tools
- Transcribe: `automation/carousels/transcribe.py` (local faster-whisper).
- Cuts + word timings: `automation/reel-studio/prep.mjs` (silence-aware cuts, false-start removal, pause trimming).
- Render: **HyperFrames** (chosen 2026-10-13 after the side-by-side). Engine library: `automation/reel-hf/lib/`
  (components, Studio template, brand kit, footage prep, new-Reel scaffolder; see its README). Remotion in
  `automation/reel-studio` is fallback only.
- Per Reel: `automation/reel-hf/<yyyy-mm-dd-slug>/build.mjs` → `index.html` → `npm run check` → Studio preview → `npm run render`.

## Open decisions
- Approve this loop and the style menu (names can change).
- ~~Remotion vs HyperFrames~~ HyperFrames (2026-10-13).
- Sound effect files (Mixkit, free license) waiting for her OK.
- Music: which Reel types get baked-in music vs an Instagram sound.

## Audio pass (added 2026-10-13 after the first Studio Reel)
Her verdict: the visuals and wireframe review worked; sound selection and review need a better process.
- **Pick music before the build** from 25s samples sent in chat as mp3 files (Mixkit full-song links download instead of playing; samples play). If nothing fits, the Reel exports without music for an Instagram sound in Edits.
- **One volume per music track** (`data-volume` + `data-fade-in/out`), never an automation lane: Studio's volume control then moves the whole track.
- **Sound effect rules (Mercedes 2026-10-13):** stacking different sounds is fine; never double up the SAME sound back to back (e.g. two nopes in a row, or the same sound repeating per list item).
- **Sound map on the storyboard:** each frame lists its sound by name with a playable link, reviewed at the storyboard checkpoint like the visuals.
- **Studio edits are truth:** before regenerating `index.html`, diff her Studio edits and fold them into `build.mjs` (Studio adds `data-hf-id` tags; ignore those). Keep backups outside the project root (a second root HTML breaks lint).

## Animatic checkpoint (Mercedes 2026-10-13)
Between the approved storyboard sketches and the full build: an **animatic**, the sketch stills held for each frame's real duration over her voice, with the chosen music and every sound effect at its real time. She reviews visuals + sound together and changes music/SFX there; the full HyperFrames build happens once, after the animatic is approved. She is researching preview approaches and may want to shape this step further.
