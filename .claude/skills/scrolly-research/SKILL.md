---
name: scrolly-research
description: Research carousel ideas for Scrolly from the subject itself (studies, official data, docs, industry news), never from other Instagram accounts. Produces verified idea cards and stats for the carousel builder, following Mercedes's research guidelines. Use when Mercedes asks for content ideas, research, stats, "what should I post", or before writing a carousel that makes factual claims.
---

# Scrolly research

Files live in `automation/carousels/research/`. Run commands from `automation/carousels/`.

## Read first, every time
1. `research/guidelines.md`: Mercedes's research rules. They override anything here.
2. `research/business-context.md`: audience, offers, proposed pillars, the method to stay consistent with.
3. `content-rules.md` sections 1b and 1c: one message (her $1K method: $1,000 → sales → visitors → Instagram VIEWS; never follower-count framing) and topics to avoid (audience-size angles, her backstory, unlaunched products).

## Idea research (when she asks for ideas)
0. Before proposing anything: `node ideas.mjs` (see what's proposed, approved, used, REJECTED) and
   `node check-topic.mjs "<candidate>"` for each candidate. Don't re-propose rejected or used ideas or anything
   already drafted/approved; also glance at Notion Content Pipeline rows for the same topic. Remember the niche is
   ORGANIC MARKETING (business-context.md); taxes, fees, legal and admin topics were rejected.
1. Pick 1-2 pillars (or her requested topic). Search the SUBJECT off the app: studies, government/official data,
   platform help docs and announcements, payment/marketplace policy changes, small-business research, credible journalism.
   Not creator posts, not carousel trends, not AI/social media unless it truly is the topic.
2. For each promising finding, answer the 5 topic-selection questions. Reject impressive-but-useless numbers,
   irrelevant announcements, generic advice, thin material.
3. Follow every claim to its ORIGINAL source and read it (WebFetch / built-in browser). Snippets and listicles are
   discovery only. Record publish date AND data/event date, population, geography, sample, method, qualifiers.
   Surprising claims need independent corroboration (not several articles repeating one report).
4. Write one idea card per surviving idea: copy `research/idea-template.md` to `research/ideas/<YYYY-MM-DD>-<slug>.md`,
   status `proposed`. Separate verified facts from interpretation.
5. Add any reusable verified stat to `research/stats.json` (fields in its `_note`). Flag data older than ~2 years.
6. Show Mercedes a short list: title, the insight, why it helps her audience, source type, freshness. Fewer strong
   ideas beat many weak ones. She approves with `node ideas.mjs set <id> approved` (or you set it on her word).
7. If a source can't be accessed or a claim can't be verified: say so, omit it. Never imply you read something you didn't.

## Carousel research (before writing an approved idea)
Copy `research/record-template.md` into the post's `research.md` and fill it from the idea card, re-checking anything
time-sensitive. `brief.source` = the idea id (and Playbook section if it builds on her method). Then continue with the
scrolly-carousel skill.

## Stats requests
"Find stats like <listicle>": treat the listicle as discovery only. Trace each number to its original study; keep only
those that pass verification; most self-cited listicle stats (e.g. "Source: <the listicle's own company>") won't.
