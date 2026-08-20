---
status: superseded on section numbering — see note below; content/asset guidance below still reflects what was actually built
created: 2026-08-19
supersedes: architecture-proposal.md (TOC section) — that file's structural review and pricing rationale still stand; this file is the detailed, section-by-section build spec
---

> **NUMBERING NOTE (post-drafting):** a new Section 9 ("Google Product Visibility — Merchant Center & Free Listings") was inserted after drafting completed, shifting everything from the old Section 9 onward up by one (old 9–28 → new 10–29). This file's section numbers below were **not** updated to match — treat `workbook-draft.md`'s actual headers and its Table of Contents as the current source of truth for numbering; use this file only for the per-section content/asset intent, not the numbers.



# Shopify SEO Workbook — Final TOC + Asset Map

Internal build document. Nothing in the "bridge" column is customer-facing copy — it's a note for the writer to avoid content that quietly duplicates the $299/$999 offers, and to avoid gating information to force an upsell. No sales language appears inside the workbook itself except the single closing section (28).

Grounded against `research-notes.md` and, for the upsell-bridge notes, against `methodology/discover.md` (what the $299 Discover report actually does: DataForSEO-powered competitor keyword discovery, bulk volume/difficulty/intent data, full site crawl + technical/indexation audit, architecture KEEP/IMPROVE/CREATE/CONSOLIDATE/REMOVE recommendations).

---

## Front Matter — 5 pages
**Outcome:** reader knows how to use the book and has what they need open before starting.
**Worksheet:** none. **Ask AI:** none. **Visual:** cover design; simple "what you'll need" icon list.
**Research needed:** none.
**Bridge:** none (no sales copy in front matter).

## Part 0 — Your Starting Point: 3-Question Store Health Check — 3 pages
**Outcome:** reader knows in under 5 minutes whether Google can even find their store, before investing weeks in strategy work. Red-flag check, not a lesson.
**Worksheet:** 3-question checklist (store live 2+ weeks? ever opened GSC? any organic traffic today?) — each "no" answer routes to a specific immediate action + a pointer to the full explanation in Part 6.
**Ask AI:** none — this is a self-check, not a research task.
**Visual:** simple traffic-light/decision-flow graphic (pass / fix-now / not sure yet).
**Research needed:** none new — reuses Part 6 facts, written first here in stripped-down form.
**Bridge:** none.

---

## PART 1 — YOUR ORGANIC TRAFFIC FOUNDATION (11 pages)

### 1. Why Organic Discovery Still Matters — 5 pages
**Outcome:** reader can name the specific platforms (Google, YouTube, TikTok, Instagram, Pinterest, AI assistants) where *their* customers actually search, instead of assuming "SEO = Google only."
**Worksheet:** *Where Can Customers Discover Me?* — channel-mapping exercise.
**Ask AI:** none (this is the reader's own observation, not researchable).
**Visual:** discovery-channel map diagram (fragmented search behavior).
**Research needed:** current Google Shopping/free listings eligibility for small stores (2026), so the channel list is accurate.
**Bridge:** none — foundational, not a data-depth question.

### 2. SEO vs Paid Traffic — 6 pages
**Outcome:** reader understands the economic difference between paid and organic acquisition and has run their own numbers, not industry averages.
**Worksheet:** *Customer Acquisition Economics Calculator* — AOV, gross margin, conversion rate, CAC, ad testing budget, break-even CAC, SEO/content budget, value of organic conversions. All reader-supplied inputs; no external dollar figures asserted.
**Ask AI:** "Help me sanity-check my break-even CAC math" (verification prompt, not a data source).
**Visual:** paid-vs-organic comparison diagram (cost curve shape, not specific numbers).
**Research needed:** none — deliberately anchored to reader's own inputs per the no-invented-stats decision.
**Bridge:** none.

---

## PART 2 — FIND WHAT PEOPLE ARE SEARCHING FOR (15 pages)

### 3. Keyword Research Without Becoming an SEO Expert — 4 pages
**Outcome:** reader understands keyword volume/intent/competition in plain English and knows which 2–3 free tools to actually open. Includes a short, honest note on how to spot who's really competing for a term (not a full competitor audit).
**Worksheet:** none (concept + tool primer; the doing happens in Section 4).
**Ask AI:** none yet (data literacy section, not a generation task).
**Visual:** Google Keyword Planner / Google Trends interface screenshots.
**Research needed:** confirm Keyword Planner no-spend workaround still functions as described; confirm Google Trends free/unchanged.
**Bridge:** **299** — workbook teaches manual, free-tool keyword spotting; the $299 report runs bulk DataForSEO volume/difficulty/intent + real competitor-keyword discovery at scale. Do not imply the free-tool method here produces equivalent data quality.

### 4. Build Your Keyword Universe — 6 pages
**Outcome:** reader has generated their own expanded keyword list (product → type/category/problem/benefit/material/feature/use case/customer/location/comparison/question/season/gift) instead of stopping at one obvious term.
**Worksheet:** *Keyword Universe Builder* matrix — worked example + blank grid.
**Ask AI:** "Turn my seed keywords into these categories" (expansion assist — explicitly labeled: AI suggests candidates, it does not know real search volume).
**Visual:** filled-in worked example (candles → soy candles, non-toxic candles, etc.) alongside the blank matrix.
**Research needed:** none (methodology, not fact-dependent).
**Bridge:** **299** — same distinction as Section 3, restated once, not repeated section after section.

### 5. Search Intent — 5 pages
**Outcome:** reader can classify any keyword as informational/comparison/transactional and knows which Shopify page type each maps to.
**Worksheet:** *Search Intent Classification Table* (Keyword | Intent | Searcher Wants | Best Page Type | Priority).
**Ask AI:** "Classify these keywords by search intent" (labeled: verify against actual SERP results, don't trust blind).
**Visual:** three-tier intent funnel diagram (What is X → Best X for Y → Buy X).
**Research needed:** none.
**Bridge:** none.

---

## PART 3 — TURN KEYWORDS INTO A SHOPIFY STORE (24 pages) — flagship section

### 6. Shopify Site Architecture — 7 pages
**Outcome:** reader has drawn their own homepage → collections → subcollections → products → supporting-content map, and can decide whether a keyword variation deserves a page at all.
**Worksheet:** *Does This Keyword Deserve Its Own Page?* (added during Batch 2 drafting, approved — a 5-question decision framework: same intent as an existing page? filter or standalone need? enough distinct products? real demand? cannibalization risk?) **+** *Draw Your Search-Optimized Store* — blank sitemap framework + worked example. **24 total worksheets/tools as of Batch 2, not 23.**
**Ask AI:** none (removed during Batch 2 drafting, approved — the filter-vs-collection judgment call is exactly what the reader needs to learn to make themselves before AI accelerates it; AI assistance moved to Section 7 instead, after the structural decision is made).
**Visual:** sitemap diagram (worked example + blank template); short "New in 2026" callout graphic on native nested collections.
**Research needed:** Shopify's collections became natively nestable July 16, 2026 (replacing nav-menu/tag workarounds) — confirmed, must be dated correctly so the section doesn't read as an app-workaround explainer.
**Bridge:** **299/999** — workbook teaches the structure logic; the $299 report evaluates the reader's *actual* current architecture against real crawl data (KEEP/IMPROVE/CREATE/CONSOLIDATE/REMOVE); $999 builds it.

### 7. Collection Strategy — 6 pages
**Outcome:** reader has decided which keyword clusters deserve a real collection page vs. which don't, and avoided thin/duplicate collections.
**Worksheet:** *Collection Map Builder* (Keyword Cluster | Collection | Products | Search Intent | Priority).
**Ask AI:** "Help me name and describe this collection without keyword stuffing."
**Visual:** none new (reuses architecture diagram context).
**Research needed:** confirm current collection URL/handle editing and description editor (rich text/HTML) behavior in Shopify admin.
**Bridge:** **299** — data-backed prioritization (real demand/difficulty numbers) vs. the workbook's judgment-based prioritization.

### 8. Product Page SEO — 7 pages
**Outcome:** reader has fully optimized one real product page and has a repeatable checklist for the rest of the catalog.
**Worksheet:** *Optimize One Product With Me* (title, URL, H1, description, images/alt text, specs, FAQs, internal links, metadata) + separate *Repeatable Product Optimization Checklist*.
**Ask AI:** "Help me rewrite this product description without keyword stuffing."
**Visual:** annotated before/after product page screenshot; Shopify admin screenshot showing where to edit meta title/description and alt text.
**Research needed:** Google deprecated FAQ rich results in May–June 2026 — FAQs stay in the framework for on-page/AI-assistant value, but must NOT be pitched as a rich-snippet tactic anymore. Confirm current product metafield UI for specs.
**Bridge:** **999** — workbook teaches the framework and gets one product done; implementing it across a 200-SKU catalog is exactly what $999 solves.

### 9. Collection Page SEO — 4 pages
**Outcome:** reader has fully optimized their single highest-priority collection page.
**Worksheet:** *Optimize Your Highest-Priority Collection*.
**Ask AI:** none new (reuses Section 8's description-assist prompt).
**Visual:** none new.
**Research needed:** same as Section 7.
**Bridge:** none new.

---

## PART 4 — CONTENT THAT ACTUALLY SUPPORTS SALES (12 pages)

### 10. Stop Writing Random Blog Posts — 3 pages
**Outcome:** reader understands topical clusters (commercial page + supporting informational articles) instead of disconnected blogging.
**Worksheet:** none (concept, worked example only).
**Ask AI:** none yet.
**Visual:** hub-and-spoke cluster diagram (Non-Toxic Cookware example).
**Research needed:** none.
**Bridge:** none.

### 11. Build Your Content Clusters — 4 pages
**Outcome:** reader has built 3–5 real clusters tied to their own commercial pages.
**Worksheet:** *Content Cluster Builder* (Commercial Page | Primary Keyword | Supporting Article | Search Intent | Internal Link Destination | Priority).
**Ask AI:** "Generate supporting content ideas for this commercial page."
**Visual:** none new (reuses hub-and-spoke diagram).
**Research needed:** none.
**Bridge:** **299** — deeper content-gap analysis using real search data vs. the workbook's manual clustering.

### 12. Create 30 Content Ideas — 5 pages
**Outcome:** reader has a real list of 30 content opportunities generated by a repeatable method, not a brainstorm.
**Worksheet:** *My First 30 Organic Content Opportunities*, built from autocomplete, forums/Reddit, competitor sites, Google Trends, customer questions/reviews, GSC (once data exists).
**Ask AI:** "Turn these customer questions into content opportunities."
**Visual:** none new.
**Research needed:** confirm current status of "People Also Ask" in Google SERPs (partially displaced by AI Overviews on some queries in 2026) so the method described doesn't rely on a feature that's disappearing.
**Bridge:** none.

---

## PART 5 — ON-PAGE SEO (10 pages)

### 13. Anatomy of a Search-Optimized Shopify Page — 5 pages
**Outcome:** reader has one clear, memorable visual reference for every element of a well-built page. Flagship visual section per the brief.
**Worksheet:** none (reference template, used as a companion while doing Sections 8–9).
**Ask AI:** none.
**Visual:** full annotated page diagram — URL, title tag, meta description, H1, opening paragraph, H2s, body, images/alt text, product/collection info, FAQs, internal links, CTA. Highest design investment page in the book.
**Research needed:** none beyond Section 8's FAQ-schema correction.
**Bridge:** none.

### 14. Internal Linking — 5 pages
**Outcome:** reader has a real internal-linking plan for their store (blog→collection, product→collection, collection→collection, blog→blog).
**Worksheet:** *Internal Linking Plan*.
**Ask AI:** "Review my internal linking structure for gaps."
**Visual:** linking-pattern diagram (four link types).
**Research needed:** none.
**Bridge:** none.

---

## PART 6 — TECHNICAL SEO WITHOUT THE TECH OVERLOAD (13 pages)

### 15. Is Google Actually Finding Your Store? — 3 pages
**Outcome:** reader understands crawling/indexing/sitemap/canonical/noindex in plain English, scoped to Shopify's actual defaults.
**Worksheet:** none (concept only; the check itself is Section 17).
**Ask AI:** none.
**Visual:** simple crawl → index → rank diagram.
**Research needed:** confirm robots.txt.liquid editing scope (all stores vs. Shopify Plus only) — sources disagree, must resolve against Shopify's own docs before stating either way.
**Bridge:** **999** — workbook explains the concepts; $999 fixes technical issues directly.

### 16. Set Up Google Search Console — 5 pages
**Outcome:** reader has GSC verified and their sitemap submitted, and understands what each performance-report number means.
**Worksheet:** GSC setup walkthrough checklist (verify → submit sitemap → check indexing → read performance report).
**Ask AI:** "Help me interpret this Search Console export" (once the reader has real data).
**Visual:** step-by-step GSC screenshots — property verification, sitemap submission, performance report with Queries/Pages/Clicks/Impressions/CTR/Avg. Position labeled.
**Research needed:** current GSC verification method for Shopify specifically (DNS TXT via domain settings vs. HTML tag) — needs exact, current steps and screenshots.
**Bridge:** none.

### 17. Technical Health Check — 5 pages
**Outcome:** reader has run a basic technical check across page speed, mobile usability, broken links, indexing, Core Web Vitals, HTTPS, structured data, and image sizes using free tools.
**Worksheet:** *My Shopify Technical SEO Check* — checkbox format.
**Ask AI:** none (this needs real tool output, not AI guessing).
**Visual:** tool screenshots (PageSpeed Insights, Rich Results Test / Schema Markup Validator).
**Research needed:** confirm current free tool set is unchanged (PageSpeed Insights, Rich Results Test, Schema Markup Validator, mobile-friendly checks); Shopify stores get HTTPS by default — confirm still universally true.
**Bridge:** **299/999** — workbook teaches a manual spot-check; $299 runs a full site crawl and technical audit; $999 implements the fixes.

---

## PART 7 — SOCIAL SEARCH (6 pages)

### 18. TikTok, Instagram, YouTube & Social SEO — 6 pages
**Outcome:** reader understands how social search differs from Google search (spoken keywords, on-screen text, captions, hashtags) and has turned 5 of their own keyword themes into social content ideas.
**Worksheet:** keyword-theme → social-content-idea converter (5 themes).
**Ask AI:** "Turn these search keywords into short-form video content angles."
**Visual:** side-by-side "Google SEO vs. Social Search" comparison table/graphic.
**Research needed:** confirm current on-platform search mechanics (TikTok/Instagram search relevance signals) and current stance on hashtag usefulness, since this shifts often; use the *scoped* Gen Z social-search data point from research-notes.md (43%/42%/36% platform-starting-point figures), not the over-generalized 2022 quote.
**Bridge:** none.

---

## PART 8 — AI SEARCH (8 pages)

### 19. What Happens When Someone Asks ChatGPT What to Buy? — 3 pages
**Outcome:** reader understands, in beginner terms, how AI assistants surface and cite brands — and understands this is an emerging, unsettled practice area, not settled SEO.
**Worksheet:** none (concept only).
**Ask AI:** none.
**Visual:** simple diagram of an AI-assistant answer with citation sources labeled.
**Research needed:** confirm current AI assistant landscape naming (ChatGPT Search, Google AI Overviews, Perplexity, Gemini) is accurate as of publish date; explicitly exclude the unsupported citation-multiplier stats per the cut list.
**Bridge:** **299** — light bridge: the $299 report's authority/entity signals feed into AI-visibility indirectly, worth one honest sentence, not a pitch.

### 20. AI Search Readiness Checklist — 5 pages
**Outcome:** reader can answer, in writing, whether an AI system could clearly understand what they sell, who it's for, what makes it different, and whether the brand is consistent across the web.
**Worksheet:** *AI Search Readiness Checklist*.
**Ask AI:** "Audit my product page copy for whether an AI system could clearly extract what I sell and who it's for."
**Visual:** none new.
**Research needed:** reflect the FAQ-schema correction (Section 8) here too — readiness is about clear, consistent information, not FAQ rich-snippet eligibility.
**Bridge:** none new.

---

## PART 9 — MEASURE WHAT IS WORKING (8 pages)

### 21. Your Organic Search Scorecard — 5 pages
**Outcome:** reader has a monthly tracking sheet set up (indexed pages, impressions, clicks, sessions, revenue, ranking queries, top pages/queries, conversion rate, revenue per organic visitor).
**Worksheet:** *Organic Search Scorecard*.
**Ask AI:** "Summarize what changed in my Search Console export this month."
**Visual:** filled-in example scorecard.
**Research needed:** confirm current GSC/Shopify analytics field names match what's referenced.
**Bridge:** none.

### 22. How Long Does SEO Take? — 3 pages
**Outcome:** reader has realistic, honestly-hedged expectations (existing authority, competition, niche, site age, content quality, technical health, demand, execution) — no specific timeframe promised.
**Worksheet:** none.
**Ask AI:** none.
**Visual:** none.
**Research needed:** none — deliberately avoids a hard number per the brief; state the uncertainty rather than manufacture a range.
**Bridge:** none.

---

## PART 10 — THE 90-DAY SHOPIFY SEO PLAN (12 pages)

### 23. Days 1–30 / 31–60 / 61–90 — 8 pages
**Outcome:** reader has a phased plan (foundation → optimization → growth) referencing the specific worksheets they already completed.
**Worksheet:** phased plan template (not a new exercise — synthesizes everything above).
**Ask AI:** "Turn my 90-day plan into a week-by-week task list."
**Visual:** 90-day roadmap timeline graphic.
**Research needed:** none (synthesis).
**Bridge:** **299/999** — one honest closing note that a personalized roadmap (299) or built-for-you execution (999) exists; not inserted mid-plan.

### 24. Printable 90-Day Checklist — 4 pages
**Outcome:** reader has a condensed, checkbox-only version to keep visible while working.
**Worksheet:** printable checklist.
**Ask AI:** none.
**Visual:** clean checklist layout, designed to print well on its own.
**Research needed:** none.
**Bridge:** none.

---

## CLOSE (17 pages)

### 25. Final Workbook: Build Your Shopify SEO Plan — 6 pages
**Outcome:** one condensed, tear-out strategy document pulling together every field the reader already filled in (goal, categories, collections, keywords, cluster, articles, technical fixes, linking priorities, social/AI strategy, 30/60/90-day goals).
**Worksheet:** the condensed doc itself.
**Ask AI:** none (pure synthesis of the reader's own prior answers).
**Visual:** clean single-document layout.
**Research needed:** none.
**Bridge:** none.

### 26. The Small Business SEO Toolkit — 7 pages
**Outcome:** reader has the smallest useful tool stack, organized by job (keyword research, trends, technical checks, indexing, analytics, page speed, content research, competitor research, AI search research, social search) — not 25 subscriptions.
**Worksheet:** none (reference tables).
**Ask AI:** none.
**Visual:** none.
**Research needed:** final pricing/feature check on every named tool immediately pre-publish (pricing shifts often) — full list carried in research-notes.md.
**Bridge:** none (explicitly the "here's the smallest stack" section, not a pitch for anything paid beyond the tools themselves).

### 27. Don't Waste Your Money — 2 pages
**Outcome:** reader knows what a new/small store probably doesn't need yet (overlapping SEO subscriptions, hundreds of low-quality AI posts, bought backlinks, vanity metrics, keyword stuffing, apps installed without understanding the problem they solve).
**Worksheet:** none.
**Ask AI:** none.
**Visual:** none.
**Research needed:** none — qualitative guidance only, no invented stats about wasted spend.
**Bridge:** none — this section exists to build trust, not to sell.

### 28. What's Next — 2 pages
**Outcome:** reader who wants deeper personalization or done-for-them execution knows the two next steps exist, described honestly against what they just built themselves.
**Worksheet:** none. **Ask AI:** none. **Visual:** none.
**Research needed:** verify the $299/$999 descriptions here against `methodology/discover.md` and current Scrolly offer terms before publish, so this section never overstates or understates what those products actually include.
**Bridge:** this section *is* the bridge — the only place sales language appears, once, at the end.

---

## Totals

| Metric | Count |
|---|---|
| **Total estimated designed pages** | **~144** (front matter 5 + Part 0 through Close) — within the 140–160 target, landing lower-middle by keeping teaching sections concise |
| **Total worksheets/tools the reader fills in** | **24** (updated from 23 during Batch 2 — see Section 6) |
| **Total reusable "Ask AI" prompts** | **~13** |
| **Total diagrams/visual frameworks** | **~10** |
| **Total screenshots/tutorial visuals** | **~16** |

## Every deliverable the customer will have actually created by the end

1. Their channel-discovery map (where customers search for them)
2. Their customer acquisition economics (AOV, margin, CAC, break-even, budget split)
3. Their keyword universe (expanded list across 13 expansion angles)
4. Their search-intent classification of those keywords
5. Their Shopify site architecture / sitemap
6. Their collection map (keyword clusters → planned collections)
7. One fully optimized product page + a repeatable checklist for the rest
8. One fully optimized collection page
9. 3–5 content clusters tied to commercial pages
10. Their first 30 organic content opportunities
11. Their internal linking plan
12. Their completed technical SEO checklist
13. Google Search Console set up and verified, sitemap submitted
14. Their monthly organic search scorecard (tracking template, in use)
15. Their social-search content plan (5 keyword themes → content ideas)
16. Their AI search readiness self-assessment
17. Their phased 90-day plan + printable checklist
18. Their condensed, single-document Shopify SEO strategy (the capstone deliverable)

## Notes carried forward, not yet resolved
- Section 6, 8, 15, 16, 17, 18, 19/20, 26: research items listed above must be closed out (or the specific claim cut) before drafting that section — matches the open list in `research-notes.md`.
- No section currently withholds information to force an upsell; every "bridge" is depth/data/implementation, not information gating, per your instruction.
