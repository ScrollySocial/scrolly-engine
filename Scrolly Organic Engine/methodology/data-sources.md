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

## AI Discovery / LLM Mention Tracking — Category M (added 2026-08-10, per report-contract.md's AI Discovery & Readiness section)
- **Candidates:** ⚠ `ai_opt_llm_ment_search`, ⚠ `ai_opt_llm_ment_top_domains`, ⚠ `ai_opt_llm_ment_top_pages`, ⚠ `ai_opt_llm_ment_agg_metrics`, ⚠ `ai_opt_llm_ment_cross_agg_metrics`, ⚠ `ai_optimization_chat_gpt_scraper`, ⚠ `ai_optimization_llm_response`
- **Purpose:** whether the client's business/domain is referenced when AI-assisted search/LLM answers surface for its priority topics, and which competitors/publishers appear instead — feeds Category M's Strong/Moderate/Weak/Not Yet Established classification.
- **Status:** Candidate only — none of these have confirmed behavior in this tool set yet. **Category M is still mandatory even before these are verified** — until verified, source this category's evidence manually/free (e.g., directly running a small set of priority prompts through a consumer AI search surface and recording what appears, or noting AI-Overview presence/absence already captured under Category A's SERP pulls). Do not block the category on unverified paid tools; do not skip it either.
- **Requirement:** Base Discover for Category M, tool-pending — manual fallback is not optional-only, it's the current default until verification happens.

## Site Crawl + Technical/Performance Data — Conditionally Required (Mode 1; Mode 3 owned lead-gen sites)
- **Preferred:** ✅ `on_page_lighthouse` (performance/Core Web Vitals), ✅ `on_page_content_parsing` (page content/structure)
- **Fallback:** ✅ `on_page_instant_pages`; a free tool (e.g. PageSpeed Insights) is an acceptable substitute for the Lighthouse *data*, per discover.md's Category H sub-audit — the multi-page-type, full-diagnostic requirement is not optional, only the specific tool is.
- **Purpose:** discover.md Category H (Technical SEO) and Category D (page-level coverage)
- **Lighthouse/performance requirement (expanded 2026-08-10, now permanent — report-contract.md's Lighthouse/Performance Error Analysis section):** call once per representative page *type*, not once for the homepage only — homepage, main service/product page, category page, an important location page, a blog/article, a major organic landing page, and (ecommerce) a product page. Extract category scores, Core Web Vitals where available, and the actual failed audits/opportunities/diagnostics — not just the top-line score. Whichever tool is used (paid or free), this per-page-type sampling is required before Category H's performance findings can be marked complete.
- **Gap flagged:** these tool names suggest **per-URL** operation (single-page fetch/render), not automatic full-site crawl/discovery. Whether a bulk/multi-page crawl capability exists in this tool set is **unverified** — confirm before assuming full-site technical audits are covered; may need per-page calls against a manually assembled URL list, or a non-DataForSEO source.
- **Required inputs / expected output / cost tier:** Unverified
- **Requirement:** Base Discover for Mode 1

## Local Data (GBP / Local Pack / Citations) — Conditionally Required (local/regional businesses)
- **Preferred:** ✅ `business_data_business_listings_search`
- **Fallback:** — none identified
- **Purpose:** discover.md Category I (Local Search)
- **Gap flagged:** no tool in the available set was identified for **reviews/reputation** or **citation/NAP consistency**. Treat as an unmapped capability — may require a non-DataForSEO source, not yet resolved.
- **Required inputs / expected output / cost tier:** Unverified
- **Requirement:** Base Discover when the business is local/regional

## Backlink / Referring-Domain Data — Conditionally Required (wherever authority findings are made)
- **Preferred:** ✅ `backlinks_summary`, ✅ `backlinks_referring_domains`
- **Fallback:** ✅ `backlinks_bulk_referring_domains`, ✅ `backlinks_competitors`
- **Purpose:** discover.md Category G (Authority & Trust) — referring-domain profile, quality patterns, competitor link gaps
- **Note:** ✅ `backlinks_bulk_spam_score` exists and could support "surface unusual patterns" per discover.md's disavowal rule — informational only, never a disavow trigger.
- **Required inputs / expected output / cost tier:** Unverified
- **Freshness/reuse:** TBD — backlink data changes more slowly than SERP/keyword data; proposal to validate, not yet a policy
- **Requirement:** Base Discover wherever authority findings are in scope

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

## Not Applicable to Discover V0.1
- All `merchant_amazon_*` and `dataforseo_labs_amazon_*` tools — Amazon marketplace–specific, out of scope for organic-search service-business analysis.
- All `serp_youtube_*` tools — video-platform-specific, out of scope for base Discover.

## Not Mapped to DataForSEO (different source)
- **Business input** (services, geography, niche) — client-provided, not a data pull.
- **First-party GSC/GA** — requires the client's own authorized access, separate integration, not part of this file.
- **Category K (Analytics & Measurement Readiness)** — GSC/GA4/conversion-tracking evidence, added 2026-08-10 per report-contract.md §4. Entirely dependent on client-authorized access; no DataForSEO tool substitutes for it. Where access isn't authorized, the category stays in scope and is marked unavailable, not skipped.
- **Category L (Organic Conversion Readiness)** — added 2026-08-10 per report-contract.md §11. Sourced the same way as Category H's on-page checks (direct site read via free browser/fetch tools), not a DataForSEO capability.
