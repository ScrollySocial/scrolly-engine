# Selling the Reel Engine: research + beta recommendation (2026-10-13)

Companion to `reel-engine-handoff.md` (open item: "Pricing/packaging for customers"). Not logged to the Business Brain
(Mercedes: still being worked out). Labels follow the vault rule: **fact** = retrieved from the source on 2026-10-13,
**estimate**, **inference** = Claude's reading. This is a license reading, not legal advice; the two "ask them" items
below are cheap to confirm by email before money changes hands.

## The answer in one screen

| Piece | Ship it inside the product? | What the customer does |
|---|---|---|
| HyperFrames (engine, CLI, Studio) | **Yes** (Apache 2.0) | Nothing, or `npm install` runs it |
| Our engine library, skill, review page, templates | **Yes** (ours) | Nothing |
| GSAP (`lib/assets/js/gsap.min.js`) | **Yes** (free Standard license) | Nothing |
| Fonts: Figtree, Bricolage Grotesque, Covered By Your Grace | **Yes** (SIL OFL 1.1), with license files added | Nothing |
| Mixkit sound effects (the 10 in `lib/assets/sfx/`) | **No** | Download from Mixkit themselves (we give a link list) |
| Mixkit music | **No** | Download themselves, or use Instagram sounds |
| ffmpeg / ffprobe binaries (gyan.dev GPL build) | **No** (inference: avoid GPL obligations) | Doctor script installs it (`winget install ffmpeg`) |
| Claude Code | Can't ship | Own paid Claude plan: Pro $20/mo minimum |
| Notion / Buffer / WordPress posting steps | Can't ship | Own accounts, or skip posting and keep the finished MP4 |

**Recommended beta:** "Reel Engine Founding Beta", **$97 one-time, 10 seats**, Studio Reel type only, Windows, one
45-minute setup call each, finished-MP4 default with the review page. Details at the end.

---

## 1) Can HyperFrames be bundled in a paid product?

**Yes.**
- **Fact:** HyperFrames is Apache License 2.0, "Copyright 2026 HeyGen, Inc." The README says: "Apache 2.0 license, with
  no per-render fees or commercial-use thresholds."
  Sources: [github.com/heygen-com/hyperframes](https://github.com/heygen-com/hyperframes),
  [LICENSE](https://raw.githubusercontent.com/heygen-com/hyperframes/main/LICENSE)
- **Fact (Apache 2.0, section 4):** when we redistribute it we must include a copy of the license, keep existing
  copyright/attribution notices, mark files we changed, and include a NOTICE file's contents if the project has one.
- **Fact (section 6):** no right to HeyGen's trademarks beyond describing origin.
- **What this means for us (inference):** sell it as the Scrolly Reel Engine, "built on HyperFrames (open source, by
  HeyGen)". Don't put HyperFrames or HeyGen in the product name or logo. Simplest compliance: don't vendor HyperFrames
  at all; the customer's install pulls it from npm (`hyperframes` in package.json), so their copy carries HeyGen's own
  license. We ship only our code plus a THIRD-PARTY-NOTICES file.
- **GSAP**, which the engine's compositions use, ships in `lib/assets/js/gsap.min.js`. **Fact:** the GSAP Standard
  License (owned by Webflow) is free for commercial use; the main prohibited use is a no-code visual tool that
  "competes with Webflow's visual animation building capabilities", and proprietary notices must not be removed.
  Source: [gsap.com/standard-license](https://gsap.com/standard-license/). **Inference:** a Reel editor whose review
  page offers a few transition presets is not a Webflow-style animation builder, so we're fine; keep the file's header
  comment intact. If the review page ever grows into a free-form animation designer, ask GSAP first.
- **Cloud rendering** (HeyGen cloud, AWS Lambda, Cloud Run) is supported by the CLI, but no public price was found in
  the repo. Not needed for the beta: customers render on their own computer.

## 2) Mixkit sound effects and music: ship inside, or customers download?

**Customers must download them themselves. We can't ship the files.**

- **Fact, Sound Effects Free License** (read from the license modal on
  [mixkit.co/license](https://mixkit.co/license/)): free for commercial use; you may use an item to make "an End Product
  that incorporates the Item as well as other things". The deciding line:
  > "You can't redistribute the Item on its own, as stock, in a tool or template, or with source files."

  Our engine is a tool and its Reel types are templates, so the 10 SFX in `lib/assets/sfx/` (buzzer, check, chime, nope,
  paper-slide, pop-bubble, pop-light, typing-laptop, whoosh-air, whoosh-fast) must be stripped from the customer build.
- **Fact, Stock Music Free License:** allowed in social media posts, ads, podcasts, YouTube (claims go to
  team@mixkit.co); not allowed in CDs/DVDs, video games, TV/radio; no remixing, no claiming as your own, no registering
  with a rights-management (Content ID) service. It doesn't mention tools or templates, but:
- **Fact, Mixkit User Terms** ([mixkit.co/terms](https://mixkit.co/terms/)): you must not "rent, license, sublicense,
  sell, resell or otherwise commercially exploit or make Mixkit or any Item available to any third party", including
  collecting items and offering them "on a stock or inventory basis". Also no using any Item "to build a similar or
  competitive product or service".
- **So (inference):** no Mixkit audio of any kind goes in the download. The finished Reels themselves are fine: a
  customer's Reel with a Mixkit sound in it is an End Product.

**How customers get sounds (recommended):**
1. Ship a `sounds.md` checklist: the 10 SFX names + their Mixkit page links + what each is used for, and the filenames
   the engine expects. Customer downloads 10 files once (~5 minutes), drops them in `assets/sfx/`. The doctor script
   checks they're there and plays a test.
2. The engine already treats missing sounds as "off", so a Reel still renders without them.
3. Music: same pattern (a link list of calm tracks), or the customer adds an Instagram sound in the app at posting time.
   The handoff spec already flags library music as "all the same level of happy"; Instagram sounds may be the better
   default for customers anyway.
4. **Don't** ship the automatic Mixkit-scraping routine the engine used for music candidates. Inference: an automated
   puller inside a paid product sits too close to "make any Item available" / "build a competitive product". Manual
   download by the customer under their own Mixkit license is the clean route.
5. **Later option:** commission or buy a small SFX pack whose license allows inclusion in a tool (or record our own
   pops/whooshes). That removes the download step for v1.

## 3) Fonts: Figtree, Bricolage Grotesque, Covered By Your Grace

**All three can ship inside the product.**
- **Fact:** all three are SIL Open Font License 1.1 in Google's font repository
  ([figtree](https://github.com/google/fonts/tree/main/ofl/figtree),
  [bricolagegrotesque](https://github.com/google/fonts/tree/main/ofl/bricolagegrotesque),
  [coveredbyyourgrace](https://github.com/google/fonts/tree/main/ofl/coveredbyyourgrace)).
  - Figtree: Copyright 2022 The Figtree Project Authors (Erik Kennedy)
  - Bricolage Grotesque: Copyright 2022 The Bricolage Grotesque Project Authors (Mathieu Triay)
  - Covered By Your Grace: Copyright (c) 2010, Kimberly Geswein
  - None declares a Reserved Font Name, so our subset files (`bricolage-800.woff2` etc.) can keep their names.
- **Fact (OFL):** fonts may be bundled, embedded and redistributed with software, including sold software, but no font
  "may be sold by itself", and each copy must carry the copyright notice and the license.
- **To do before shipping:** `automation/reel-hf/lib/assets/fonts/` has the three .woff2 files but **no license files**.
  Add one `OFL.txt` per font (copy from the links above) plus a line in THIRD-PARTY-NOTICES. Don't list the fonts as a
  feature you're selling; they're part of the brand kit.
- **Customer brand kits:** the customer's own fonts are their responsibility. If their brand uses a paid font, the
  desktop license may not cover video use: the setup should ask, and default to a Google Font if unsure.

## 4) Which Claude plans include Claude Code, and what they cost (2026-10-13)

**Fact,** from [claude.com/pricing](https://claude.com/pricing),
[Max plan article](https://support.claude.com/en/articles/11049741-what-is-the-max-plan),
[Claude Code with Pro or Max](https://support.claude.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan):

| Plan | Price | Claude Code |
|---|---|---|
| Free | $0 | **No** |
| Pro | $20/mo monthly, or $17/mo billed annually ($200 up front) | Yes |
| Max 5x | $100/mo | Yes |
| Max 20x | $200/mo | Yes |
| Team (Standard seat) | $25/seat monthly, $20 annually | Yes |
| Team (Premium seat) | $125/seat monthly, $100 annually | Yes |
| Enterprise | $20/seat/mo annual + usage at API rates | Yes |

- **Fact:** limits are shared between chat and Claude Code, with a 5-hour session limit and a weekly limit on both Pro
  and Max. Max adds a separate weekly limit for Fable. Max's included API credits can't be used in Claude Code.
- **Estimate for our customers:** rendering runs on their CPU and costs no Claude usage; Claude is used for transcript →
  plan → build edits. One Studio Reel a day should fit Pro. Several Reels a day plus heavy back-and-forth on the review
  page will likely hit Pro's 5-hour limit, so the sales page should say "Pro works for 1-2 Reels a day; daily
  batches need Max 5x". **Test this on Pro with one beta user before promising numbers.**
- **Sales page line:** "Requires a paid Claude plan (Pro, $20/month, or higher). Not included." Prices change; link to
  claude.com/pricing rather than hard-coding them.

## 5) Competitors: AI Reel editing and their prices

All prices **fact**, read 2026-10-13 from each pricing page (USD). "/mo yearly" = per month when billed annually.
The "What it does" column is a short general summary, not checked feature by feature.

| Tool | Paid plans | What it does | Gap vs our engine (inference) |
|---|---|---|---|
| **Submagic** ([pricing](https://www.submagic.co/pricing)) | Starter $19/mo ($12 yearly), 15 videos/mo up to 2 min; Pro $39 ($23), 40 videos, 5 min, auto zooms, bad-take + silence removal, clean audio; Business $69 ($41), 100 videos, custom templates | Captions, zooms, b-roll on one talking-head take | Closest to Studio. Template captions + stock b-roll; no illustrations built from your own words, no brand-rule review |
| **Captions / Mirage** ([pricing](https://www.captions.ai/pricing)) | Max $24.99/mo (500 credits); Frontier $69.99 / $139.99 / $279.99 | AI edit, captions, AI avatars, eye contact | Big generative feature set; look is recognizably "Captions" |
| **OpusClip** ([pricing](https://www.opus.pro/pricing)) | Starter $15/mo; Pro $29/mo; Business custom | Long video → short clips, captions, b-roll | Built for repurposing long videos, not editing a single talking-head take |
| **Vizard** ([pricing](https://vizard.ai/pricing)) | Creator $29/mo ($14.50 yearly, $174/yr); Business $39/mo ($19.50 yearly) | Clipping, subtitles, scheduling to social | Repurposing + scheduling; not graphics-rich |
| **Descript** ([pricing](https://www.descript.com/pricing)) | Hobbyist $24/mo ($16 yearly); Creator $35 ($24); Business $65 ($50) | Edit video by editing the transcript, Studio Sound, AI agent | You still edit yourself; the word-cut idea we borrowed lives here |
| **VEED** ([pricing](https://www.veed.io/pricing)) | Creator $12/mo yearly; Pro $22 yearly; Studio $39 yearly | Browser editor, auto subtitles, AI tools | General editor; you do the editing |
| **CapCut Pro** (third-party reports: [hooked.so](https://www.hooked.so/compare/capcut-pricing), [eesel.ai](https://eesel.ai/blog/capcut-pricing)) | Pro ~$19.99/mo or ~$179.99/yr US; Standard ~$9.99/mo (**estimate**: price varies by platform; capcut.com doesn't publish one list) | Full editor, templates, auto captions | Manual editing; the cheapest "pro" anchor |
| **Free DIY Claude skills**: getgitgirl's [claude-reel-editor](https://github.com/nicolapocock/claude-reel-editor) (MIT), the [Freshstack Remotion skills](https://www.freshstack.ai/resources/automate-instagram-reels-with-claude) | $0 + the Claude plan | Claude Code edits Reels | Our direct comparison: same "Claude edits for you" promise. Single template look, Mac-tested, setup is on you |

**What the market tells us (inference):**
- SaaS editors cost **$12-40/mo** for solo creators; the anchor customers know is "about $20-30 a month".
- Our customer already pays $20/mo for Claude, so a recurring fee on top competes with Submagic at $23-39. A
  **one-time price** is easier to say yes to, and matches how Mercedes sells today ($40 Club, $47 Business Brain).
- Nobody else sells: illustrations generated from the Reel's own words, the customer's brand rules enforced on every
  frame, a review page with notes at a moment, and everything running locally and privately with no per-video credits.
  That's the pitch. The free DIY skills prove the idea works but leave setup and taste to the buyer: we sell taste
  (brand kit, rules, components) plus a working setup.

## Recommended beta offer

**Reel Engine Founding Beta: $97 one-time, 10 seats.**

What's in it:
- The engine (component library, Studio Reel template, review page with the three steps, cover maker, doctor script),
  installed with the customer on one **45-minute setup call** (Windows only for the beta; Mac is untested).
- Their own brand kit file made with them on the call (colors, fonts, caption style, their "never do" rules).
- Default output: a finished MP4 + cover. Studio editing optional.
- Updates to the engine through the end of the beta.
- They bring: a paid Claude plan (Pro minimum), a Mixkit download of the 10 starter sounds (link list provided),
  their own posting tool. Notion/Buffer/WordPress posting stays out of the beta (too many accounts to support).

Why $97 (inference):
- Below three months of Submagic Pro ($39/mo) and about four months of CapCut Pro, for a one-time payment.
- Above the $40 Club and $47 Business Brain, so it doesn't undercut the ladder, and still a small enough yes for a
  founding buyer who's taking on setup bugs.
- The setup call is the real cost: 10 seats × 45 min ≈ 7.5 hours of Mercedes's time, the right amount for a first batch.
- After the beta, if setup becomes self-serve: **$197 one-time**, or fold it into the $10K offer (where the handoff spec
  already leans) as its content machine.

Before selling (checklist):
1. Build a customer copy of `automation/reel-hf/lib/` with `assets/sfx/` empty, no Mixkit scraping code, no ffmpeg
   binaries, and nothing Scrolly-specific (the brand kit becomes a blank template the setup call fills in).
2. Add `OFL.txt` for each font and a THIRD-PARTY-NOTICES file (HyperFrames Apache 2.0, GSAP Standard License, the
   three OFL fonts, faster-whisper MIT, puppeteer Apache 2.0).
3. Doctor script: check Claude Code is signed in, ffmpeg installed, Edge present, sounds folder filled.
4. Run one beta user on **Claude Pro** for a week to measure how many Reels fit in the limits.
5. Optional, cheap insurance: email team@mixkit.co to confirm the link-list approach, and GSAP if the review page grows.
6. Sales page: no fake proof, show Mercedes's real Reels, state the Claude plan requirement and the sound download up
   front.

**Overnight runs need three things on the customer's computer (learned 2026-10-13, Mercedes's first unattended setup):**
1. **Pre-approved permissions** in `<their project>/.claude/settings.local.json` (local only, never shared). Without them
   the nightly run stops at the first command and waits for a click until morning. The list (adjust IDs to their
   connectors): `Bash(cd *)`, `Bash(node *)`, `Bash(npx --yes hyperframes@<version> *)`, `Bash(npx hyperframes *)`,
   `Bash(npm run check)`, `Bash(npm run check *)`, `Bash(PRODUCER_PAGE_NAVIGATION_TIMEOUT_MS=180000 *)`,
   `Edit(/automation/reel-hf/**)` (their engine folder), their Notion connector's `notion-update-page` + `notion-search`
   (+ fetch / query), and, only if they auto-post, their Buffer connector's `get_account`, `list_channels`, `list_posts`,
   `get_post`, `create_post`.
   Claude can't silently grant itself permissions (blocked as self-modification, correctly): the setup step shows
   the customer the exact lines and the customer saves them, or approves Claude's edit when asked. Then Claude
   checks the file is valid JSON (one missing comma makes Claude ignore the whole file).
   Tell them plainly: these let Claude run those actions without asking in any session in that project.
2. **The routine's mode set to Auto** (not "Accept edits", which still stops on commands; avoid "Bypass permissions").
3. **The computer awake:** sleep when plugged in = Never, Claude app open, lid open at run time.
After the first night, read the morning note: any step still stopped gets added to the list.

## Open decisions for Mercedes
- Beta price ($97) and seat count (10) OK?
- Windows only for the beta, or test a Mac first?
- Standalone product, or part of the $10K offer from the start?
- Which music route to recommend customers: Mixkit link list or Instagram sounds?
