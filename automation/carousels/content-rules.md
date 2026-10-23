# Carousel content rules (draft v0.2, 2026-10-06)

Working draft from Mercedes. Expect several rounds of revision. Change this file, not the skill, when a rule changes.

## 1. Planning (internal, never published)
- Before writing, record in the carousel's brief: intended reader, the specific problem, the useful outcome.
- Use them to keep the content focused. Do not state them mechanically in the copy.

## 1b. One message (2026-10-07, corrected)
- Content can come from anywhere: Mercedes's topics, research, sound organic-marketing practice, her Playbook. It does NOT have to come from the Playbook.
- It must never CONTRADICT her method. Core method: the $1K plan works backward from $1,000: $1,000 ÷ average order value = sales; sales ÷ % of visitors who buy = website visitors; visitors ÷ % of viewers who visit = Instagram views. Views are the output; followers are not the metric, so don't build posts around follower counts.
- Check a draft against the relevant Playbook section when the topic overlaps it (live edition: `Scrolly Organic Engine/products/1k-club/playbook/edition-2/src/playbook3/`). Facts still follow section 2 and `research/guidelines.md`.
- `brief.source` = where the idea and claims come from (e.g. "Mercedes topic + research card <id>", "Playbook ch. 6").

## 1c. Topics to avoid unless Mercedes asks
- Audience-size angles: "zero followers", "no audience", "nobody's watching", "how many followers you need". She's sensitive about her own audience size; don't build content around it.
- Her personal backstory (SEO audits, pivot to MMO): skipped for now (2026-10-06).
- Unlaunched products (Business Brain, Pinterest pin generator): no posts or CTAs until live.

## 2. Research and accuracy
- Full rules: `research/guidelines.md` (Mercedes's research guidelines). The points below are the short version.
- Verify factual claims during research, before writing.
- Keep sources and verification notes in the carousel's `research.md`, separate from slide copy and caption. No bibliographies or citation lists in the post.
- Never invent statistics, quotations, personal experience, proof, results, hypothetical businesses, scenarios, customer stories, or sample numbers.
- Omit claims that cannot be verified. Credit real quotations or named examples naturally when needed.

## 3. Structure and length
- Minimum 5 slides. Around 10 is normal. No fixed upper limit (Mercedes, 2026-10-07).
- Length follows substance: never pad a short idea or compress a useful explanation to hit a number.
- Slide 1 = cover. Slide 2 = second hook (see section 5). Content starts on slide 3. Last slide = primary CTA. Everything between is substantive content.
- If the topic can't support 5 worthwhile slides, develop it further or recommend another format.

## 4. Cover (slide 1)
- A specific, honest hook that makes the topic and the reason to read clear.
- The carousel must deliver the cover's promise.

## 5. Slide 2: a unique iteration of slide 1 (Mercedes, 2026-10-07)
- Slide 2 is a SECOND HOOK: a different version of the slide 1 hook, making the same promise from a new angle, so it works as the cover for anyone Instagram shows the carousel to starting at slide 2.
- It must make sense without slide 1 and pull the reader forward. It is not the first content point, and not a repeat or rewording of slide 1.
- Test: could slide 2 replace slide 1 as the cover? If not, rewrite it.
- Slide 2 must be a FORMAT change from slide 1 while still working as a cover that makes people swipe. Default format: two text sections, the hook at the top right-aligned and a short swipe-pull line at the bottom left-aligned (layout `hook2`). A photo slide with hook text also works.
- Content starts on slide 3.

## 6. Progression and swipe momentum
- Every slide advances the idea and gives a reason to continue: an unfolding explanation, a useful sequence, a meaningful discovery, or the next practical step.
- Each slide is satisfying on its own and makes the next feel worth reading.
- No filler, artificial suspense, repeated teasers, or withholding the promised answer. Never "but first…".

## 7. Slide copy
- About one sentence and one clear thought per slide.
- Specific and useful. Split an overloaded sentence across slides rather than packing it.
- Copy must fit the chosen template without reducing readability (the renderer's fit check enforces this).
- Concrete instruction: tell readers what to do and how. No advice that sounds useful but leaves them guessing.

## 7b. Visual rules (Mercedes's inspiration review, 2026-10-06)
- One short sentence or point per slide; almost never two. Let visuals carry information wherever possible (a mockup, a step card, a screenshot, a photo with an overlay) so very few words do a lot of work.
- Fun, colorful and engaging, without clutter. Never add: slide counts, the handle, eyebrow/kicker text, decorative underscores or `|`, "whiskers"/scribble marks, extra sticker labels.
- Vary the layout inside a post (slide 2 may switch to a new layout) while staying cohesive: same palette and fonts throughout.
- No AI-looking generated illustrations. No checkered backgrounds. No celebrity or pop-culture reaction images (rights); use Mercedes's own photos.
- Text-heavy slides only as an occasional test.

## 7c. Layout variety inside a post (Mercedes, 2026-10-07)
- Content slides must NOT look like the cover. Slides 1-2 are the big-type hooks; from slide 3 on, switch formats.
- Break up formats across the content slides: phone mockups (bio, Story with link sticker, Insights, a Reel), real screenshots, charts, formulas, big numbers, chat/DM bubbles, checklists, photos with overlays, polaroids, notes. A changed background color alone does not count as a new format (exception: a photo/video slide with simple text).
- No two content slides in a row with the same layout, and at least 3 different layouts in the content slides. Exception: photo/video-led posts (e.g. walking-through-slides, layout `pano`, one wide photo across slides) where every slide is the photo with simple text.
- Accent words (the italic serif in a color) belong on the cover. Use them on at most one or two other slides, only for the single most important word. Never on nearly every slide.
- Paragraph text is LEFT-aligned (one short paragraph per slide). Center alignment only for the cover hooks.
- Across a week, mix post types: most posts should include photo or video backgrounds (Mercedes's photos), with text-only posts as the minority.

## 7d. Grid panoramas (pinned rows)
- Several posts' covers form one wide design across the profile grid (`data/panoramas.json`, `node panorama.mjs <group>`).
- Each tile has its own design and job, but the row must clearly cross over: shapes or a photo flow across the seams.
- Anything that crosses a seam is NEUTRAL: shapes, stickers (stars, sparkles, squiggles, blobs) or a photograph. Never words, badges with text, or a chart/graph split across two posts. Text and charts stay fully inside their tile.
- One focal point per tile; plain backgrounds behind text (no dots/grid behind text).

## 8. Value before the CTA
- Deliver the promised value before asking for action.
- The resource or product in the CTA should help them apply or extend what they learned.

## 9. CTA and destinations
- One primary CTA that fits the post's purpose and gives a clear reason to act.
- CTA appears on the last slide AND in the first two sentences of the caption.
- Only confirmed resources, URLs, offers, prices, inclusions, and keywords, taken from `destinations.json`. If something is missing there, flag it; never invent it.
- ManyChat switch (`manychat` in brand config):
  - `false`: no "comment X" CTAs. Use save, send to a friend, follow, or link in bio.
  - `true` (now, since 2026-10-23: her own n8n comment automation is live): every CTA is a comment-keyword CTA, using a keyword that is switched on with an approved DM (MATH, QUIZ so far).

## 10. Caption
- CTA within the first two sentences.
- Add useful context, a real example, a caveat, or an application. Don't repeat the slides; it doesn't need to be a second lesson.
- Exactly 3 hashtags, generic and relevant to this specific post.
- Tiger nod (optional, small): one short line or 🐯 near the end, at most once.

## 11. Variety
- Vary hooks, structures, pacing, and endings across posts (checked against the ledger).
- Don't force every topic into a numbered list or reuse the same opening formula.

## 12. Voice
- Reader is capable but may be new. Explain unfamiliar terms without talking down.
- Encouraging through clear, achievable actions. No shame, hustle guilt, or exaggerated income promises.
- No generic AI phrases, fake urgency, forced controversy, or habitual "secret", "hack", "game changer".
- Natural topic keywords, never stuffed into every slide.
- Never use "it's X, not Y" constructions. No patronizing filler.
- No em dashes (—), en dashes used as dashes (–), or `|` anywhere in slides or caption. Hyphenated words are fine. (Mercedes 2026-10-06)

## 13. Final review (run before showing Mercedes)
- Slide 2 could replace slide 1 as the cover (a different angle on the same promise)?
- Delivers the cover's promise?
- Enough substance on every middle slide?
- Swipe momentum holds, without fake suspense?
- Reader leaves with something usable?
- CTA leads to a confirmed destination?
- Not a near-duplicate of a ledger entry (topic, point, hook, structure)?
