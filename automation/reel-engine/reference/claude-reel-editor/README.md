# Reference: getgitgirl's claude-reel-editor (partial copy)

Source: https://github.com/nicolapocock/claude-reel-editor by Nicola Pocock (@getgitgirl), MIT license.
Mercedes found it on 2026-10-13 ("the one that looked the coolest by far"). Claude reviewed it the same day:
clean and safe (network calls are jsdelivr GSAP with a hash check, the HyperFrames registry, Google Fonts and
optional ElevenLabs only), tested on Mac only, one template look, and its CapCut route isn't available in the US.

**Decision:** don't install it as our engine. Borrow its parts, with credit, into the scrolly-reels skill
(see `Scrolly Organic Engine/products/content-engine/reel-engine-handoff.md`). This folder is reference only and
holds the files that were reviewed, not the whole repo. Pull the rest (including LICENSE) from GitHub when needed.
Keep the MIT notice and credit her in anything we ship that's built from this code.

## What's here and why it matters
| File | What it does | Use for us |
|---|---|---|
| `references/review.md` + `review/reel-review.html` + `review/core.js` | A private claude.ai Artifact review page: tap transcript words to cut, live rough cut, graphics/captions/sound+colour tabs, draft preview with notes pinned to a timestamp, "preview is outdated" banner. Uses Artifact db + assets. | Main inspiration for our review step. Mercedes hasn't decided her review format yet, so this is one option. |
| `scripts/review_sync.py` | Exports a proposal to the page's data and reads her decisions back. Its header documents the `proposal.json` format. | Model for the plan → review → build data flow. |
| `references/rough-cut.md`, `scripts/cut.py`, `scripts/tighten.py`, `scripts/timings.py` | Rough cut from the transcript, filler ("um") detection, word timings. | Compare with our `automation/reel-studio/prep.mjs` (silence-aware cuts). |
| `scripts/pacing.py` | Pacing presets (natural / tight / fast). | Per Reel type pacing in our templates. |
| `scripts/qa.py` | Automated checks on the finished render. | Our QA step before sending her a Reel. |
| `scripts/auto_edit.py`, `scripts/build_reel.py` | Her end-to-end build. | Reference for pipeline order only. |
| `scripts/capcut_draft.py` | Writes a CapCut draft. | Not usable in the US. Skip. |
| `references/motions.md` | Motion/animation menu. | Ideas for our component library. |
| `references/setup-interview.md` | First-run brand interview. | Model for the customer onboarding (brand kit). |

Not copied but worth pulling from the repo: `clean_audio.sh` (DeepFilterNet/afftdn chain to -14 LUFS) and the
doctor (setup check) script.
