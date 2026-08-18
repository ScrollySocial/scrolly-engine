# Data Sources (V0.1)

Maps each Data Capability in [discover.md](discover.md) to specific DataForSEO MCP tools, so query planning picks from a pre-approved minimum-sufficient shortlist instead of reasoning over the full tool catalog each engagement. Used by [discover-engine.md](discover-engine.md) Step 3.

**Verification status:** Tool *names* below were confirmed to exist via a live DataForSEO MCP connection on 2026-08-10 (no paid calls were made). Parameter schemas, output structure, and pricing were **not** accessible in that session and are marked Unverified throughout — do not treat those fields as fact until confirmed against live schema access or official DataForSEO documentation. Freshness/reuse windows are proposals to validate, not vendor facts.

**Legend:** ✅ tool name verified to exist · ⚠ candidate only, purpose inferred from tool name, unconfirmed · — none identified in the available tool set

---

## Demand / Keyword Data — Always Required
- **Preferred:** ✅ `kw_data_google_ads_search_volume`
- **Fallback:** ✅ `dataforseo_labs_google_keyword_overview`, ✅ `dataforseo_labs_google_keyword_ideas`
- **Purpose:** search demand/trend/geo data feeding discover.md Category A (opportunity sizing) and Category E (content topic justification)
- **Required inputs:** Unverified — pending schema access
- **Expected output used by Discover:** Unverified — pending schema access
- **Cost tier:** Unknown — not verified
- **Freshness/reuse:** TBD — propose validating after first real call
- **Requirement:** Base Discover
- **Local demand method (corrected 2026-08-10, from the Mulberry Creek engagement):** for local/regional businesses, do not treat a geo-modified keyword phrase (e.g. "plant nursery Wills Point TX") queried at a broad/national `location_name` as equivalent to testing local demand — this approach reliably returns no usable data. Where the target city resolves in `kw_data_google_ads_locations`, query the plain generic keyword with `location_name` set directly to that city instead. Mulberry Creek confirmed this method retrieves real (if low-volume) city-level data where the keyword-embedded approach returned nothing. Always check location resolution via the free `kw_data_google_ads_locations` utility before relying on a location-parameterized call.

## SERP Retrieval — Always Required
- **Preferred:** ✅ `serp_organic_live_advanced`
- **Fallback:** — none identified
- **Purpose:** current SERP results + feature presence (organic, local pack, PAA, featured snippet, ads) for discover.md Category A; also the basis for competitor identification
- **Required inputs:** Unverified
- **Expected output used by Discover:** Unverified
- **Cost tier:** Unknown — not verified
- **Freshness/reuse:** TBD
- **Requirement:** Base Discover
- **Note:** ✅ `serp_locations` exists as a supporting/reference lookup, not a data source itself.

## Competitor Identification — Always Required (derived, not a separate call)
- **Preferred:** ✅ `dataforseo_labs_google_serp_competitors`
- **Fallback:** ✅ `dataforseo_labs_google_competitors_domain`, ✅ `dataforseo_labs_google_domain_intersection`
- **Purpose:** identify actual organic competitors from SERP evidence, not client-named assumptions (discover.md Category A)
- **Selection rule (corrected 2026-08-10, from the Mulberry Creek engagement):** do not select a competitor for deeper analysis merely because it recurred in earlier local-pack pulls. After the keyword universe (O3) exists, use SERP evidence across representative commercial-cluster queries and/or `dataforseo_labs_google_ranked_keywords` on candidate domains to confirm which domains are actually capturing organic traffic across the clusters that matter — including product/nursery-line competitors specifically where the business has a distinct product line, since that set is frequently different from the service-line competitor set.
- **Competitor keyword-gap pull now required, not optional (2026-08-15):** once 1–2 real competitors are selected per the rule above, run `dataforseo_labs_google_domain_intersection` (client domain vs. each competitor) as a **required** Base Discover step — this is what actually answers "what do they rank for that I don't," and was previously scoped out as optional enrichment even though it's already a documented, available tool. Skipping it needs a stated reason (e.g. no real competitor domain could be confirmed), not silent omission.
- **Required inputs / expected output / cost tier:** Unverified
- **Freshness/reuse:** TBD
- **Requirement:** Base Discover

## Current Organic Capture — Always Required (Mode 1/2 own domain; supports Category A competitor selection and O6/O7)
- **Preferred:** ✅ `dataforseo_labs_google_ranked_keywords`
- **Fallback:** ✅ `dataforseo_labs_google_keywords_for_site`
- **Purpose:** the O6 "current visibility" observed baseline — what the domain actually ranks for, at any position, across its whole site — not just presence/absence on a handful of tested head terms. Also the evidence source for confirming which competitor domains genuinely capture organic traffic (Category A's corrected selection rule). One call per domain (own + a small number of representative competitors, not every domain that ever appeared in a SERP).
- **Required inputs / expected output / cost tier:** Unverified
- **Freshness/reuse:** TBD
- **Requirement:** Base Discover for Mode 1/2 (own domain); as-needed for Category A competitor selection

## Keyword Universe Expansion — Base Discover (O3)
Per discover.md O3, the universe is built from four sources — detailed client inventory is not required for any of them:
- **(A) Confirmed offerings** — seeds come from O1's confirmed tier, however minimal (even a single vague phrase like "trees & shrubs" is a sufficient starting seed).
- **(B) Industry/category expansion** — not a DataForSEO call; Claude's own category knowledge for this business type, used to propose plausible sub-category/adjacent-product seeds beyond what's confirmed. Every resulting cluster is tagged `relevance_classification: POTENTIAL RELEVANCE — VERIFY OFFERING`, never presented as confirmed.
- **(C) Competitor keyword discovery** — ✅ `dataforseo_labs_google_ranked_keywords` (see Current Organic Capture, above) on the competitor domains selected per Category A's corrected rule. Surfaces categories the client's own site may never mention.
- **(D) Related keyword discovery** — ✅ `dataforseo_labs_google_related_keywords`, ✅ `dataforseo_labs_google_keyword_suggestions` (fallback: ✅ `dataforseo_labs_google_keyword_ideas`, already listed under Demand). Adjacent/comparison terms and long-tail/question terms (feeds O9's content queue directly). Batch multiple seeds per call; do not call once per keyword.
- **Note:** responses from the (D) tools typically already carry volume, competition, CPC, difficulty (KD), and intent fields — check before calling the two gap-fill tools below.
- **Required inputs / expected output / cost tier:** Unverified
- **Requirement:** Base Discover

## Bulk Keyword Difficulty — Base Discover (O5, gap-fill only)
- **Preferred:** ✅ `dataforseo_labs_bulk_keyword_difficulty`
- **Purpose:** batch KD lookup for any keyword that matters to an O4/O5 decision and doesn't already carry a KD value from an earlier expansion call. Never call per-keyword; one batched call covers the gap list.
- **Required inputs / expected output / cost tier:** Unverified
- **Requirement:** Base Discover, gap-fill only per the progressive retrieval protocol in discover-engine.md

## Search Intent Classification — Base Discover (O4, gap-fill only)
- **Preferred:** ✅ `dataforseo_labs_search_intent`
- **Purpose:** batch intent classification for keywords that matter to an O4 clustering decision and don't already carry an intent label from an earlier expansion call.
- **Required inputs / expected output / cost tier:** Unverified
- **Requirement:** Base Discover, gap-fill only per the progressive retrieval protocol in discover-engine.md

## Geographic Candidate Screening — Base Discover for local/regional businesses (O2)
Not a single tool — a tiered use of tools already mapped elsewhere in this file, per discover.md O2's screening funnel:
- **Tier 0 (free):** ✅ `serp_locations`, ✅ `kw_data_google_ads_locations` — resolve every client-named and independently-generated candidate market; eliminates unresolvable candidates (e.g., Elmo, TX in the Mulberry Creek engagement) before any paid call.
- **Tier 1 (cheap, batched paid):** `kw_data_google_ads_search_volume`, location-parameterized per surviving candidate (see Demand section above).
- **Tier 2 (targeted paid):** `serp_organic_live_advanced`, location-parameterized per candidate surviving Tier 1 (see SERP Retrieval section above).
- **Tier 3 (targeted paid, as needed):** `business_data_business_listings_search`, sized to markets/clusters surviving Tier 2 (see Local Data section below).
- **Unmapped gap:** no DataForSEO tool provides proximity/drive-time or population/market-size data. Until a non-DataForSEO source is integrated, use general/geographic knowledge for these two inputs, labeled `inference`, client-provided population if they happen to know it, and never presented as verified fact.

## AI-Overview / Zero-Click Exposure — Always Required (part of Category A)
- **Preferred:** ⚠ `ai_optimization_llm_response`
- **Fallback:** ⚠ `ai_opt_llm_ment_search`, ⚠ `ai_opt_llm_ment_top_domains`
- **Purpose:** assess whether ranking well would still produce traffic, per discover.md's AI-Overview/zero-click crowding requirement
- **Status:** Candidate only — exact function not confirmed from tool name alone. **Verify actual behavior before relying on this for a conclusion**; if it doesn't do what the name implies, this capability may need a non-DataForSEO source.
- **Requirement:** Base Discover (pending verification of a working tool)

## AI Discovery / LLM Mention Tracking — Category M (added 2026-08-10, reframed 2026-08-16 per report-contract.md's upgraded AI Discovery & Readiness section)
- **Candidates:** ⚠ `ai_opt_llm_ment_search`, ⚠ `ai_opt_llm_ment_top_domains`, ⚠ `ai_opt_llm_ment_top_pages`, ⚠ `ai_opt_llm_ment_agg_metrics`, ⚠ `ai_opt_llm_ment_cross_agg_metrics`, ⚠ `ai_optimization_chat_gpt_scraper`, ⚠ `ai_optimization_llm_response`
- **Purpose:** a genuine recommendation/citation analysis — for a small set of research-derived customer-intent prompts, whether the client's business gets mentioned, actively recommended, or cited/linked across configurable AI/answer surfaces (candidates: ChatGPT Search, Perplexity, Gemini, Grok, Google AI experiences), and which competitors/third-party sources appear instead. Feeds the AI Discovery Scorecard (report-design-system.md) and Category M's Strong/Moderate/Weak/Not Yet Established/Not Evaluated classification.
- **Status:** Candidate only — none of the DataForSEO tools above have confirmed behavior in this tool set yet, and there is currently **no paid API access to ChatGPT/Perplexity/Gemini/Grok in this stack**, nor a budgeted default step for manual per-platform testing. **This is an honest, current capability gap, not a methodology gap** — Category M stays mandatory (it must appear in every report), but its multi-platform scorecard defaults to "Not Evaluated This Round" per platform until one of the above exists. The AI-Overview presence/absence already captured under Category A's SERP pulls remains available as a partial, Google-specific signal, clearly scoped as such — it is not a substitute for the multi-platform test and must never be relabeled as a ChatGPT/Perplexity/Gemini/Grok result.
- **Requirement:** Base Discover for Category M, tool-pending. When time/budget allows manual testing (an analyst actually running the derived prompts through each consumer AI surface), do so and record genuine results; when it doesn't, report "Not Evaluated This Round" — never simulate, infer, or estimate a per-platform result.

## Site Crawl + Technical/Performance Data — Conditionally Required (Mode 1; Mode 3 owned lead-gen sites)
- **Preferred:** ✅ `on_page_lighthouse` (performance/Core Web Vitals), ✅ `on_page_content_parsing` (page content/structure)
- **Purpose:** discover.md Category H (Technical SEO), the Category D on-page page-quality module, and Lighthouse/performance data.
- **Correction (2026-08-15 — this was previously wrong):** an earlier version of this file said bulk/multi-page crawl was "unverified... these tool names suggest per-URL operation." **That was incomplete.** DataForSEO's On-Page API is confirmed (live pricing check, dataforseo.com/pricing/on-page) to be a genuine site crawler: submit `target` (domain) + `max_crawl_pages`, it follows internal links and returns per-page technical data, duplicate-content/duplicate-tag detection, and an internal link graph (which is what powers real orphan-page detection, not a guess). **Lighthouse is a parameter on the same crawl task**, not a separate capability.
- **Verified pricing (live-checked 2026-08-15):** base crawl **$0.000125/page**; browser-rendering/Lighthouse **$0.00425/page** on top of that. A 20–50 representative-page crawl with Lighthouse enabled costs roughly **$0.09–$0.50 total** — cheap enough that Core Web Vitals should never be skipped in a funded engagement.
- **Reliability fix (2026-08-15):** the free PageSpeed Insights fallback hit a hard quota-exhaustion error on a shared/unauthenticated project during the Mulberry Creek engagement — no CWV data was obtainable that round. Three-tier fallback, in order:
  1. **DataForSEO On-Page crawl + Lighthouse** (above) whenever the account is funded — cheap, reliable, no external quota dependency.
  2. **Local Lighthouse via Puppeteer, deferred (attempted 2026-08-15, not currently installed).** The idea: reuse `automation/`'s existing Puppeteer/Edge dependency (already used for PDF rendering) to run Lighthouse locally with zero external rate limit. **In practice, `npm install lighthouse` pulled in a full `puppeteer` (bundled-Chromium-download) dependency chain and caused real install problems on this machine** — consistent with this repo's already-documented history of Puppeteer-Chromium-download issues (see `automation/README.md`'s "npm install saga"). Not adopted this round. If revisited, install with `PUPPETEER_SKIP_DOWNLOAD=true` set and confirm `lighthouse`'s `chrome-launcher` dependency can be pointed at the system Edge executable (the same `executablePath` pattern `run-discover.mjs` already uses) before trusting it — do not attempt a bare `npm install lighthouse` again on this machine without that precaution.
  3. **Authenticated PageSpeed Insights API key** (free tier, one-time signup) — the practical fallback for now, given tier 2 is deferred. An unauthenticated/shared PSI call is not an acceptable primary or sole fallback — mark Core Web Vitals "Not Evaluated / Data Required" rather than relying on it if both tiers 1 and 3 are genuinely unavailable.
- **Lighthouse/performance requirement (report-contract.md's Lighthouse/Performance Error Analysis section, unchanged):** call once per representative page *type* — homepage, main service/product page, category page, an important location page, a blog/article, a major organic landing page, and (ecommerce) a product page. Extract category scores, Core Web Vitals where available, and the actual failed audits/opportunities/diagnostics, not just the top-line score.
- **On-page page-quality module use (new 2026-08-15 — feeds discover.md Category D):** `on_page_content_parsing` output (page text, headings, internal link graph) is the evidence source for the KEEP/OPTIMIZE/EXPAND/MERGE/REDIRECT/CREATE classification — cross-reference parsed page content against the O3/O4 keyword clusters to judge topical completeness and cannibalization, not a fresh eyeballing of the live site.
- **Required inputs / expected output / cost tier:** crawl/Lighthouse pricing verified above; exact request/response schema still Unverified pending live schema access — confirm parameter names against current DataForSEO docs before the first real call.
- **Requirement:** Base Discover for Mode 1

## Local Data (GBP / Local Pack / Reviews) — Conditionally Required (local/regional businesses)

**Correction (2026-08-15 — this was previously the wrong tool for the job).** `business_data_business_listings_search` is an **area/category listings search** (find every nursery/landscaper within a radius) — it was never the right tool for fetching *the client's own* profile, which is why it returned a result set excluding both Mulberry Creek and several independently-confirmed active competitors: that's a category-matching mismatch from using a discovery tool for a lookup task, not proof the tool itself is broken. Two DataForSEO Business Data endpoints, live-verified 2026-08-15, were previously missing from this file entirely and are the actual fix:

- **`business_data_business_listings_search`** — **keep**, but only for its correct purpose: discovering nearby competitor listings by category + radius (feeds Category A's competitor identification and Category I's "who else is winning locally" read). Pricing: ~$0.01–0.012 task fee + ~$0.0003–0.00036/row returned (dataforseo.com/pricing/business-data/business-listings-api), up to 1,000 rows/request.
- **`business_data_google_my_business_info`** *(candidate name — verify exact endpoint against current DataForSEO docs before first use; naming per their v3 Business Data API)* — looks up **one specific business's own public GBP profile**: category, secondary categories, description, attributes, hours, website/appointment URLs, rating. This is the tool for the fields this file previously said were unreachable. Verified pricing: **$0.0015–$0.0054 per profile lookup** depending on queue speed (Standard/Priority/Live) — trivially one call per report.
- **`business_data_google_reviews`** *(candidate name, same verification caveat)* — actual review-level data (text, rating, date) for a business, enabling real review-velocity/trend reads instead of a single point-in-time count. Billed per 10–20 reviews returned; a few cents per report for a small local business's review volume.
- **Photos, Q&A, and posts**: DataForSEO's Business Data API family may cover some of this (a Google Q&A endpoint exists) — not yet verified this round; treat as a further candidate, don't assume coverage until checked the same way the two above were.
- **Citation/NAP consistency across directories**: still a genuine **unmapped gap** — no DataForSEO tool covers this, and it isn't being added now (would require a dedicated citation-tracking vendor, e.g. BrightLocal/Whitespark-class — a real product/cost decision, out of scope for this revision per explicit instruction). Keep marking it "Not Evaluated / Requires Additional Data Source," never estimate it.
- **Do not fabricate:** any GBP field not actually returned by a verified call stays "Not Evaluated / Requires Additional Data Source" — never infer GBP category from the local-pack visibility pattern alone; that stays a labeled, low-confidence hypothesis, not a finding.
- **Requirement:** Base Discover when the business is local/regional. The GMB Info + Reviews calls above are cheap enough (well under $0.10/report combined) that they should run whenever the business is local/regional and funding allows, not be treated as optional enrichment.

## Backlink / Referring-Domain Data — Conditionally Required (wherever authority findings are made)
- **Preferred:** ✅ `backlinks_summary`, ✅ `backlinks_referring_domains`
- **Individual-record list (added 2026-08-19 — REQUIRED, not optional enrichment):** ✅ `backlinks` (DataForSEO Backlinks API's per-link endpoint — returns `domain_from`, `url_from`, `url_to`, `anchor`, `dofollow`, `first_seen`, `last_seen`, `page_from_rank`/`domain_from_rank`, etc. per individual link). `backlinks_summary` and `backlinks_referring_domains` are both aggregate/domain-level only — neither one returns individual link records, and **the appendix's backlink section is not complete without this call**, distinct from the domain-level `backlinks_referring_domains` fallback below. Confirmed gap (2026-08-19): Mulberry Creek's engagement only ever called `backlinks_summary`; `backlinks` was never called, so no individual-record list existed to appendix even before the client-facing wording was fixed to stop implying otherwise. See report-contract.md §15 and the `backlink-individual-records-retrieved` Final Quality Gate check.
- **Fallback:** ✅ `backlinks_bulk_referring_domains`, ✅ `backlinks_competitors`
- **Purpose:** discover.md Category G (Authority & Trust) — referring-domain profile, quality patterns, competitor link gaps
- **Note:** ✅ `backlinks_bulk_spam_score` exists and could support "surface unusual patterns" per discover.md's disavowal rule — informational only, never a disavow trigger.
- **Required inputs / expected output / cost tier:** Unverified
- **Freshness/reuse:** TBD — backlink data changes more slowly than SERP/keyword data; proposal to validate, not yet a policy
- **Requirement:** Base Discover wherever authority findings are in scope. The individual-record `backlinks` call is REQUIRED before the backlink appendix section can be marked complete — not conditional on profile size. For a small profile (roughly under ~50 referring domains, matching report-contract.md §15's existing size threshold), every returned record is listed individually in the appendix; for a larger profile, list the ones that matter (highest-authority, most recent, or most unusual) and summarize the rest, but the call itself must still happen so that choice is evidence-based, not a stand-in for never having looked.

## Historical / Archive Data — Optional, Confidence-Boosting
- **Preferred:** ✅ `domain_analytics_whois_overview` (domain age/registration — supports discover.md Category J)
- **Fallback:** ✅ `dataforseo_labs_google_historical_rank_overview`, ✅ `dataforseo_labs_google_historical_serps`
- **Purpose:** site-history context (Category J); never used to claim unsupported causation
- **Required inputs / expected output / cost tier:** Unverified
- **Requirement:** Optional enrichment

## Content Coverage / Trend Signals — Optional Enrichment (Category E support)
- **Preferred:** ⚠ `content_analysis_search`
- **Fallback:** ⚠ `content_analysis_phrase_trends`, ⚠ `content_analysis_summary`
- **Status:** Candidate only — exact function unconfirmed.
- **Requirement:** Optional enrichment, only if base keyword/SERP evidence leaves a material content-strategy gap

## Technology Detection — Optional Enrichment
- **Preferred:** ⚠ `domain_analytics_technologies_domain_technologies`
- **Purpose:** minor supporting context for Technical SEO (CMS/platform detection)
- **Requirement:** Optional enrichment

## YouTube / Cross-Channel Content Opportunity — Optional Enrichment (narrowed 2026-08-15, was fully excluded before)
- **Content-repurposing suggestions** (which O9 content-cluster topics would work as a YouTube video/Short, Instagram Reel, TikTok, or Pinterest asset) require **no new data at all** — pure synthesis from the already-built keyword/topic clusters, and should be included as a light note wherever a cluster's search intent is genuinely video-friendly (how-to, buying-guide, visual-comparison topics). Never generic "post more on social" advice — every suggestion must trace to a real cluster/topic already in the report.
- **Formal YouTube SERP presence-testing** (does the business's own video content appear for relevant searches; do competitor videos crowd the SERP) would use ⚠ `serp_youtube_organic_live` — **candidate only, pricing not yet live-verified** (unlike the tools above, which were). Do not treat this as cost-known or budget it into a report until verified the same way; if adopted before verification, mark the capability itself "Unverified — pending price/schema confirmation," not "available."
- **Requirement:** Optional enrichment — content-repurposing notes can appear in any report at no cost; formal SERP testing stays out of Base Discover until priced.

## Not Applicable to Discover V0.1
- All `merchant_amazon_*` and `dataforseo_labs_amazon_*` tools — Amazon marketplace–specific, out of scope for organic-search service-business analysis.

## Not Mapped to DataForSEO (different source)
- **Business input** (services, geography, niche) — client-provided, not a data pull.
- **First-party GSC/GA** — requires the client's own authorized access, separate integration, not part of this file.
- **Category K (Analytics & Measurement Readiness)** — GSC/GA4/conversion-tracking evidence, added 2026-08-10 per report-contract.md §4. Entirely dependent on client-authorized access; no DataForSEO tool substitutes for it. Where access isn't authorized, the category stays in scope and is marked unavailable, not skipped.
- **Category L (Organic Conversion Readiness)** — added 2026-08-10 per report-contract.md §11. Sourced the same way as Category H's on-page checks (direct site read via free browser/fetch tools), not a DataForSEO capability.
