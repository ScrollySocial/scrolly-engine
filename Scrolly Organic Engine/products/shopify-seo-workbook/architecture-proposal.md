---
status: awaiting approval
created: 2026-08-19
---

# Shopify SEO Workbook — Architecture Proposal

New SKU in the Scrolly product ecosystem: a $59–60 DIY implementation workbook, sitting below the $299 Personalized Organic Search Opportunity Report and the $999 Implementation offer. Teach → Analyze-my-business → Help-me-implement.

This is the pre-draft architecture pass requested before writing any customer-facing content. See `research-notes.md` in this folder for sourced facts backing the claims below.

## 1. Structural review — what's missing / redundant

**Missing — recommend adding:**
- **A short front-matter orientation** ("How to use this," what you'll need on hand: product list, GSC access if any, a spreadsheet or notebook). Cheap to build, sets expectations for a paid product.
- **A "Starting Point" quick-diagnostic before Part 1.** The requested structure puts indexing/GSC setup in Part 6, which is right pedagogically (technical depth belongs after fundamentals) — but a store that isn't indexed at all shouldn't spend three weeks on collections and content before finding that out. Recommend a 1-page "is Google even seeing your store?" gut-check up front (3 yes/no questions: store live 2+ weeks? ever checked GSC? any organic traffic today?) that tells the reader whether to fast-track the Part 6 indexing check. Keeps the full technical section where it belongs later, closes the "wasted a month" risk.
- **On-site search terms as a keyword source.** Shopify's own admin analytics expose what visitors search for in the on-site search bar — a free, store-specific keyword source nobody has to sign up for. Worth a callout in the toolkit and in Section 3/4.

**Redundant — not a problem, by design:**
- The final "Build Your Shopify SEO Plan" repeats fields the reader already filled in earlier worksheets. That's intentional — a workbook needs a single tear-out summary, not a new exercise. Keeping it.
- Parts 7 (Social) and 8 (AI) are each thinner than the core Parts 3–4. That's fine — they're positioning/differentiation sections (most $20–40 generic SEO ebooks don't cover either), not places that need 15 pages of exercises.

**No major cuts recommended.** The requested structure is well-sequenced (fundamentals → keywords → site structure → content → on-page → technical → social → AI → measurement → 90-day plan) and every section maps to a stated buyer pain point.

## 2. Proposed final table of contents (with page estimates)

Page counts are spreads at the generous-whitespace, card-and-table layout described in the brand direction — treat as planning estimates, not a print spec; final count is a design-stage variable.

| # | Section | Pages |
|---|---|---|
| — | Cover, welcome/how-to-use, what you'll need, table of contents | 5 |
| 0 | **[NEW]** Your Starting Point: 3-Question Store Health Check | 3 |
| **PART 1 — YOUR ORGANIC TRAFFIC FOUNDATION** | | **12** |
| 1 | Why Organic Discovery Still Matters + *Where Can Customers Discover Me?* worksheet | 6 |
| 2 | SEO vs Paid Traffic + *Customer Acquisition Economics* calculator | 6 |
| **PART 2 — FIND WHAT PEOPLE ARE SEARCHING FOR** | | **18** |
| 3 | Keyword Research Without Becoming an SEO Expert | 5 |
| 4 | Build Your Keyword Universe (matrix worksheet) | 7 |
| 5 | Search Intent + classification table worksheet | 6 |
| **PART 3 — TURN KEYWORDS INTO A SHOPIFY STORE** | | **26** |
| 6 | Shopify Site Architecture (major section) + *Draw Your Store* worksheet | 8 |
| 7 | Collection Strategy + *Collection Map* worksheet | 7 |
| 8 | Product Page SEO + *Optimize One Product With Me* + catalog checklist | 7 |
| 9 | Collection Page SEO + optimize-one-collection worksheet | 4 |
| **PART 4 — CONTENT THAT ACTUALLY SUPPORTS SALES** | | **13** |
| 10 | Stop Writing Random Blog Posts (topical clusters) | 4 |
| 11 | Build Your Content Clusters worksheet (3–5 clusters) | 4 |
| 12 | Create 30 Content Ideas (method + worksheet) | 5 |
| **PART 5 — ON-PAGE SEO** | | **10** |
| 13 | Anatomy of a Search-Optimized Shopify Page (annotated visual) | 5 |
| 14 | Internal Linking + linking plan worksheet | 5 |
| **PART 6 — TECHNICAL SEO WITHOUT THE TECH OVERLOAD** | | **14** |
| 15 | Is Google Actually Finding Your Store? | 4 |
| 16 | Set Up Google Search Console (verification, sitemap, performance report) | 5 |
| 17 | Technical Health Check + checklist worksheet | 5 |
| **PART 7 — SOCIAL SEARCH** | | **6** |
| 18 | TikTok, Instagram, YouTube & Social SEO + 5-keyword-to-social-ideas worksheet | 6 |
| **PART 8 — AI SEARCH** | | **9** |
| 19 | What Happens When Someone Asks ChatGPT What to Buy? | 4 |
| 20 | AI Search Readiness Checklist | 5 |
| **PART 9 — MEASURE WHAT IS WORKING** | | **9** |
| 21 | Your Organic Search Scorecard (monthly tracking worksheet) | 5 |
| 22 | How Long Does SEO Take? | 4 |
| **PART 10 — THE 90-DAY SHOPIFY SEO PLAN** | | **14** |
| 23 | Days 1–30 / 31–60 / 61–90 detailed plan | 9 |
| 24 | Printable 90-day checklist | 5 |
| **CLOSE** | | **20** |
| 25 | Final Workbook: Build Your Shopify SEO Plan (condensed strategy doc) | 6 |
| 26 | The Small Business SEO Toolkit | 8 |
| 27 | Don't Waste Your Money | 3 |
| 28 | What's Next (report/implementation upsell, one pass only) | 3 |

**Total estimate: ~159 pages** at this whitespace-heavy, one-idea-per-spread layout. If that reads as too long for a workbook (vs. a course), the lever to pull is layout density, not content cuts — e.g. combining Toolkit tables onto denser reference pages could bring it to ~130–140 without losing any exercise. Flagging this as a design-stage decision rather than deciding it now.

## 3. Every worksheet / checklist / template / calculator

1. Where Can Customers Discover Me? (channel-mapping worksheet)
2. Customer Acquisition Economics Calculator (AOV, margin, conversion rate, CAC, ad testing budget, break-even CAC, SEO/content budget, value of organic conversions)
3. Keyword Universe Builder (Product → Type/Category/Problem/Benefit/Material/Feature/Use Case/Customer/Location/Comparison/Question/Season/Gift matrix)
4. Search Intent Classification Table (Keyword | Intent | Searcher Wants | Best Page Type | Priority)
5. Draw Your Search-Optimized Store (blank sitemap framework)
6. Collection Map Builder (Keyword Cluster | Collection | Products | Search Intent | Priority)
7. Optimize One Product With Me (full product-page worksheet) + repeatable catalog checklist
8. Optimize Your Highest-Priority Collection worksheet
9. Content Cluster Builder (Commercial Page | Primary Keyword | Supporting Article | Search Intent | Internal Link Destination | Priority) — 3–5 clusters
10. My First 30 Organic Content Opportunities worksheet
11. Anatomy of a Search-Optimized Page (annotated visual template)
12. Internal Linking Plan worksheet (Blog→Collection, Product→Collection, Collection→Collection, Blog→Blog)
13. My Shopify Technical SEO Check (checkbox checklist)
14. Google Search Console setup walkthrough checklist
15. AI Search Readiness Checklist
16. Social Search idea converter (5 keyword themes → social content ideas)
17. Organic Search Scorecard (monthly tracking worksheet)
18. 90-Day Plan (detailed, phased)
19. Printable 90-Day Checklist (condensed, checkbox format)
20. Build Your Shopify SEO Plan (final condensed strategy doc)
21. Small Business SEO Toolkit (comparison tables by job-to-be-done)
22. Don't Waste Your Money checklist
23. **[NEW]** 3-Question Store Health Check (Part 0)
24. ~12–15 "Ask AI" reusable prompt boxes embedded throughout (not standalone, but a recurring proprietary asset — listing as one line item)

23 discrete tools for a $60 product is a strong value density argument on its own — see §5.

## 4. External research/data still needed before drafting full content

Initial landscape research is done (`research-notes.md`). Before writing customer-facing copy, still need to verify:

- **Shopify robots.txt.liquid editing scope** — sources disagree on whether this is available to all stores or Plus-only as of 2026. Must confirm against Shopify's own Help Docs before the technical section states it either way.
- **GSC verification method specifics for Shopify** (DNS TXT via Shopify domain settings vs. HTML tag) — walkthrough needs current, exact steps and current screenshots.
- **Current pricing/free-tier limits** for every tool named in the Toolkit: Ubersuggest, Semrush free tier, Keywords Everywhere, AnswerThePublic, Moz, Screaming Frog free cap, PageSpeed Insights, Rich Results Test, Bing Webmaster Tools, Google Trends, Google Keyword Planner (no-spend workaround). Initial pass done; needs a final pre-publish price check since these shift often.
- **Google free product listings / Shopping eligibility** requirements for a small store in 2026 — needed for Part 1's discovery-channel explanation.
- **AI citation statistics** (the "3.5x more likely," "6.5x third-party," "87% citation rate" figures found in research) — these currently trace only to SEO-agency marketing content, not primary studies. Per the project's no-invented-stats rule, these get **either** traced to an original source (e.g., a named study from Semrush/Ahrefs/Profound) **or** cut and replaced with qualitative guidance ("third-party mentions appear to matter more than they did for traditional SEO — we don't yet have reliable numbers on how much").
- **The Google Gen Z/TikTok "40%" stat** — real, but originates from a 2022 internal Google survey about *local lunch recommendations specifically*, not general product search. Usable, but must be cited with that scope and date, not generalized to "40% of Gen Z uses TikTok instead of Google for everything."
- **Meta ads testing-budget figures** — the $20–50/day, $200–300/day-to-exit-learning-phase numbers found are directionally consistent across sources but came from marketing-agency blogs, not Meta's own documentation. Recommend framing the paid-vs-organic economics section around the reader's *own* numbers (the calculator) rather than citing a specific industry dollar figure, consistent with the brief's explicit instruction not to invent figures like "$5,000 to warm up a pixel."
- **Structured data gap stat** ("78% of self-built Shopify stores missing key schema") — same issue, single low-authority source found. Cut unless traced.

## 5. Why this justifies ~$60

- **Specificity**: built for Shopify's actual architecture (collections, products, blog/article model, theme-generated schema, sitemap/robots behavior) — not a generic "ecommerce SEO" ebook the reader has to translate themselves.
- **Volume + density**: ~150-page estimate carrying 23 proprietary worksheets/checklists/calculators, not padding — every major teaching section ends in an action, per the brief's LEARN → EXAMPLE → DO → CHECK structure.
- **Synthesis, not information**: the audit test in the brief ("could 3 free blog posts cover this?") is satisfied by the calculators (CAC economics, break-even), the matrices (keyword universe, collection map), and the prioritization frameworks — these require the reader's own inputs and produce a store-specific output, which free content can't replicate.
- **2026-relevant coverage generic guides lack**: most $20–40 SEO ebooks on the market don't integrate social search and AI search as first-class, differentiated channels (not "the same SEO tactics apply") — Parts 7–8 close that gap honestly, without overpromising specific AI outcomes.
- **Ecosystem logic**: priced as the entry point to $299 (research done for you) and $999 (built for you) — the workbook has to fully stand alone (per the brief) or the upsell logic collapses, which is why no section is deliberately left incomplete.

## 6. Open items for approval

1. Approve/reject the **Part 0 Starting Point Check** addition.
2. Approve/reject the **~150-page estimate** vs. requesting a denser layout target (~130 pages) — a design-stage lever, not a content cut.
3. Confirm the plan to **cut or re-source** the AI-citation stats and the schema-gap stat rather than use them as found.
4. Sign off on this TOC/worksheet list as final before any customer-facing drafting begins.
