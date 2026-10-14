---
name: scrolly-carousel
description: Make an Instagram carousel for Scrolly (Mercedes's own account) end to end, with no Canva or SaaS tools. Plans the idea, checks it against past carousels so content never repeats, researches and verifies claims, writes slides and caption to Scrolly's content rules, picks photos from the shared media library, renders 1080×1440 PNGs, and records the approved post in the Notion Content Pipeline. Use when Mercedes asks for a carousel, carousel ideas, or to turn an idea/reel/blog into a carousel.
---

# Scrolly carousel

Everything lives in `automation/carousels/`. Run commands from that folder. The scripts are plain Node + headless Chrome,
so any agent (Claude, Codex) can run this skill; Notion steps use the Notion MCP connector.
Rendering needs the Bash sandbox disabled (Chrome + Google Fonts).

## Read first, every time
1. `content-rules.md`: the rules. They override anything here.
2. `config/destinations.json`: the ONLY CTAs, offers, prices and keywords you may use.
3. `config/brand.json`: handle, ManyChat switch (`manychat`), tiger nod options, palettes.
4. Business Brain (voice, pillars, CTA strategy): Mercedes's own filled-in Brain doesn't exist yet. The Notion "Home" Brain
   (Content page `3f0ab38f-4c58-8125-987b-c4f301410c16`) is the blank product template; never treat it as Scrolly facts.
   Until her Brain is filled, use `content-rules.md` + the repo's Scrolly writing-voice rules. When it exists, read its
   Brand, Customer, Content and Offers pages here (Offers owns prices; keep `destinations.json` in sync with it).

## Styles (all 1080×1440, 3:4)
| Style | What | Post fields |
|---|---|---|
| A | One photo of Mercedes on every slide, black text in white Instagram-style highlight | `media.background`, per-slide `pos` top/center/bottom |
| B | Photo dump: different photo per slide, same highlight text | per-slide `media`, `pos`, optional `focus` ("50% 30%") |
| C | Trending format recipe (`format`: `notes`, `post-card`) | `format`, optional `formatDate`, `media.avatar` |
| D | Bold type (kurated-inspired): one line, heavy condensed caps + `*italic serif accent*`, optional cut-out of Mercedes | `palette`, `pattern` (`none`/`stripes`/`grid`/`stars`/`dots`/`rays`, per post or slide), per-slide `overlay` (one holder: `note`/`card`/`polaroid`+`media`; plus decorations `circle`/`highlight`/`arrow`/`sparkle`), per-slide `cutout` |
| E | Show, don't tell (step cards, chat bubbles, phone/laptop frame, photo + app menu). NOT BUILT YET | `palette` |

Palettes (locked 2026-10-06, "classic"): `warm` (cream, black text, orange accent word) and `tangerine` (orange, white
text). Wildcards: `blush` (pastel pink) and `mist` (barely-there blue), black text + orange accent, at most 1 in any
6 posts (check.mjs warns), type + small touches only, never the white note/card overlays (check.mjs errors) so the feed isn't 100% homogenous. Expect the real feed to be photo-heavy (A/B + Reel-first
carousels), with D tiles between. One palette per post; vary between posts. Variety comes from patterns + overlays (see
`_style-samples/D-variety.png`): keep it to at most one holder + one decoration per slide, mix slide layouts within a post,
and keep overlays tied to the content (the circle marks the key word, the arrow points at the photo). No cobalt or other palettes (check.mjs enforces this).

**Layouts inside a D/E post (content-rules 5 and 7c):** slide 1 = big-type cover (`layout` omitted). Slide 2 = a format
change that still works as a cover, default `"layout": "hook2"` with `top` (hook, right-aligned) and `bottom`
(swipe-pull line, left-aligned). Content slides (3 to second-last) each get a `layout`, no two in a row the same, at
least 3 kinds: `text` (left-aligned paragraph), `number` (`big` + text), `formula` (`formula: ["$1,000|goal","÷",...]`),
`chart` (`chart: {rows: [[label, value, display]], hi, note}`), `phone` (`screen: {type: bio | story-link | insights |
reel | image, ...}` + optional `media`), `chat` (`chat: [{text}, {me: true, text}]`), `checklist` (`items`), `photo`
(`media`, highlight text). Accent `*word*`: cover and slide 2, plus at most 2 content slides. Mock app screens use
labels and shapes, never invented numbers. Most posts in a week should lead with Mercedes's photos. Preview-only
stand-ins: `"media": "stock:<name>"` (Playbook stock); ledger add refuses them, so swap before approval.

Video slides are not supported yet (ffmpeg via Docker, planned with the reels editor; Mercedes doesn't want CapCut/GIMP-style apps in the loop since they can't be automated). Say so if a post needs one.
`*word*` = emphasis in C/D/E. `\n` in text = forced line break.

## Workflow

**1. Idea.** From an approved research idea card (`node ideas.mjs`; made by the scrolly-research skill), from Mercedes, or Content Pipeline rows (Notion data source `collection://d2cc8645-5399-4d65-91e2-d535e5cc98bc`)
with Status = Idea, or its Source Ideas relation. If the idea can't support 5 worthwhile slides, say so and suggest another format.

**2. Brief + repeat check (before writing slides).** First `node check-topic.mjs "<topic>"`: it compares against
approved carousels, drafts in `posts/`, and every idea card including REJECTED and USED ones. Never re-propose a
rejected topic or remake a used/drafted one; if close, pick a clearly new angle and say which earlier piece it differs from.
`node new-post.mjs <slug> <A-E>` → fill `brief` (reader, problem, outcome, topic, mainPoint, structure, ending) and a draft hook,
then `node check.mjs <id>`. Treat every SIMILAR line as a possible repeat: open the old entry (`data/ledger.json`) and judge it.
If it's the same point, pick a new angle or tell Mercedes. Also check the Content Pipeline for published posts on the same topic.
Choose a structure and ending different from the last few posts (`node ledger.mjs list`).

**3. Research.** Follow `research/guidelines.md`; new-post.mjs copies the research record template into `research.md`. Verify every factual claim first. Log claim, source URL, how verified in `research.md`. Drop anything unverifiable.
No invented examples, numbers, stories, quotes or results. Research notes never go into the post.

**4. Media (styles A, B, C post-card).** `node scan-media.mjs` indexes `OneDrive/Scrolly Media/photos`. For new untagged
photos it writes `data/contact-sheet.png`: look at it, then fill each item's `tags` (e.g. `me`, `closeup`, `waist-up`, `laptop`,
`outdoor`, `smiling`), `textSpace` (where text can sit without covering her face: `top`/`center`/`bottom`) and `notes` in
`data/media-index.json`. Pick photos whose `textSpace` matches the slide `pos`. Respect the photo reuse warning. Prefer
photos ≥1080px on the short side (scan lists low-res ones). HEIC files are skipped; ask Mercedes for JPGs.

**4b. Cut-outs (style D).** `.venv/Scripts/python cutout.py <media-id>` removes the background locally and writes
`photos/cutouts/<id>.png`; run `node scan-media.mjs` again, then use the new id as a slide's `cutout`. Check the edges
on a colored background before using it.

**5. Write.** ALWAYS write slide 1 and slide 2 together as two hooks: slide 2 is a unique iteration of slide 1 (new angle,
same promise) that could replace it as the cover; content starts on slide 3. Fill `brief.slide2Check` with how slide 2
works as an alternate cover. Apply this to text drafts shown to Mercedes in chat too, not only post.json. Fill `slides`, `cta`, `tigerNod` (optional: `line`, `emoji`, `image`; last slide only, at most once per post, rotate),
`caption` (CTA in the first two sentences, no hashtags inside) and `hashtags` (exactly 3). One thought per slide.
While `manychat` is false, never use a "comment" CTA.

**6. Check + render.** `node check.mjs <id>` until 0 errors; weigh every WARN. Then `node build.mjs <id>` and
`node overview.mjs <id>`. Look at `overview.png` yourself: text over her face, unreadable contrast, awkward line breaks,
a lonely last word. Fix and rebuild. "Doesn't fit" means split the slide, never shrink further.

**7. Final review (judgment, not scriptable).** Does it deliver the cover's promise? Is slide 2 a second hook (a new angle on slide 1's promise that could replace it as the cover), with content starting on slide 3?
Does every middle slide carry real substance and make the next worth reading, without fake suspense? Will the reader
know exactly what to do? Is the caption adding context, an example, a caveat or an application? CTA confirmed?

**8. Show Mercedes.** Give her the `preview.html` path in the exports folder (it shows a phone-style swipe view + caption +
grid; the files sync to her phone through OneDrive). Nothing goes to Notion or the ledger before she approves.

**9. After approval.**
- Create a row in Content Pipeline: Content = short title; Format = Carousel; Platforms = Instagram; Status = Approved (NEVER "Ready": any row set to Ready gets added to the Buffer posting queue (no longer Make, 2026-10-13), so Ready means "post this"; Edit while stand-ins remain);
  Carousel Style = matching option (e.g. "A · One photo"); Hook = slide 1 text; Instagram Caption = caption + hashtags;
  CTA = CTA in words; Carousel ID = post id; Media Used = comma-separated media ids (from `posts/<id>/build.json`);
  Product = the offer's club if the CTA sells one; Notes = export folder path. Link Source Ideas if it came from one.
- `node ledger.mjs add <id> <notion-page-url>` (also marks the source idea card `used`).
- If she changes copy after approval, rebuild and re-run `ledger.mjs add` (it replaces the entry).

## Reels → covers + twin carousels (2026-10-10)
Every Reel gets a cover and a matching carousel from ONE spec, so carousels never need their own ideas.
- Spec: `reels/<id>/reel.json` (`series`, `hook`, `altHook`, `swipeLine`, `cover {clip, at, pos, focus, label}`, `beats [{text, clip, at, pos}]`,
  `carouselExtras [{after, ...}]` = the long-version slides, `cta {text, clip, at}`, `caption`, `hashtags`, `brief`).
  Template: `reels/sample-what-to-post/reel.json`. Clip paths are relative to `media.json → reelFootageDir`.
- Series: `reels/series.json` gives each series one cover template + palette + offer. `lintReel` errors when the offer
  isn't live in `destinations.json` (Business Brain, Threads kit, Pin generator are blocked until they are).
- `node reel-cover.mjs <id>|--all` → `exports/reels/<id>/cover.png` (1080×1920; text kept in the grid's middle 3:4,
  y 300 to 1620) + `cover-grid.png` + `exports/reels/covers.html` (grid view of every cover). Cover = a frame from the reel.
- `node reel-to-carousel.mjs <id>` → writes `posts/<id>/post.json` in the established style D templates (NOT photo-dump B;
  Mercedes 2026-10-10): big-type cover = hook, `hook2` = `altHook` + `swipeLine`, one slide per beat (+ extras), CTA on the
  cover look. A beat's `carousel` object sets its layout like a post.json slide (`photo` and `phone` + `useFrame` get a 3:4
  Reel frame from `photos/frames/<id>/`); beats without one alternate photo/text, so add phone/chat/checklist layouts to
  pass 7c. Then the normal check → build → overview → show Mercedes → approval steps. `--force` overwrites a hand-edited post.json.
- Upcoming products (`upcoming: true` in destinations.json, e.g. Threads kit, Pin generator): teaser Reels/carousels allowed
  with a follow/save CTA, no link, no price. Business Brain is live ($47).
- `node reel-preview.mjs <id>` → `exports/reels/previews/<id>.mp4`: b-roll segments (hook, beats, CTA; per segment clip/at/dur/reelPos) with white-box text, no music (she adds audio in Edits). Check a frame per segment for text over her face and bad footage (notebook-hand-01 is only usable 0 to 2.4s).
- Frames need `pip install imageio-ffmpeg` in `.venv` (already done); rendering needs the Bash sandbox off.

## Files
- `posts/<id>/post.json` + `research.md`: source of each carousel (in git).
- `data/ledger.json`: every approved carousel (repeat checks). `data/media-index.json`: photo IDs, tags, sizes.
- Exports: `OneDrive/Scrolly Media/exports/carousels/<id>/` (slide-NN.png, caption.txt, preview.html, overview.png).
- `posts/_test-style-*`: style samples, not real posts.

## Later (not built)
Trend research feed into Source Ideas; video slides; final looks for D/E once Mercedes picks inspiration; customer
package (swap `brand.json` + `destinations.json`; ties into the Business Brain Skills and the content tracker template).
