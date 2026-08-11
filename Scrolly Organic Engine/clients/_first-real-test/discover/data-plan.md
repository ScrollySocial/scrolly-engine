# Data Plan — _first-real-test (example.com)

**Written at Step 3, before any query.** Approval: **self-approved under Automated/Unattended Mode** (discover-engine.md, Automated Mode rule 1) — no human is present to approve live. Applicable pre-authorized ceiling: **Mode 1, non-geo-bound → 40 paid DataForSEO calls.**

**Governing constraint: `DATAFORSEO_ENABLED=false` (account unfunded).** Per discover-engine.md Automated Mode rule 1, this is **not a ceiling breach** — it is discover.md's "missing always-required capability" fallback. Every non-DataForSEO capability is still executed; every DataForSEO-dependent capability is marked **"Not Evaluated / Data Required"** and carried into the report rather than dropped. Paid-call budget consumed: **0 of 40.**

## Capabilities applicable to this engagement (Mode 1, non-geo-bound)

| # | Data Capability (discover.md) | Requirement | Mapped tool (data-sources.md) | Plan for this run | Status |
|---|---|---|---|---|---|
| 1 | Website/domain + location | Always required | client intake | Consume from `input.md` | ✅ Executed |
| 2 | Demand / keyword data | Always required | `kw_data_google_ads_search_volume` | Cannot run — DataForSEO disabled. No free substitute with equivalent volume data. | ❌ Not Evaluated / Data Required |
| 3 | SERP retrieval (+ features: local pack, PAA, snippet, ads, AI Overview) | Always required | `serp_organic_live_advanced` | Cannot run — DataForSEO disabled. | ❌ Not Evaluated / Data Required |
| 4 | Competitor identification (derived from SERP/capture) | Always required | `dataforseo_labs_google_serp_competitors` | Cannot run — depends on #2/#3, which are unavailable. Client supplied no competitors either. | ❌ Not Evaluated / Data Required |
| 5 | Current organic capture, own domain (O6 baseline) | Always required (Mode 1) | `dataforseo_labs_google_ranked_keywords` | Cannot run — DataForSEO disabled. No free substitute. | ❌ Not Evaluated / Data Required |
| 6 | Industry/category expansion reasoning (O3 tier B) | Always required | Claude category knowledge — **not a paid call** | Attempt. Requires a determinable business category from O1. | ⚠ Attempted — blocked on O1 (no business exists at this domain) |
| 7 | Keyword universe expansion (O3 tiers C/D) | Base Discover | `dataforseo_labs_google_related_keywords` / `_keyword_suggestions` | Cannot run — DataForSEO disabled. | ❌ Not Evaluated / Data Required |
| 8 | Bulk keyword difficulty (O5 gap-fill) | Base, gap-fill only | `dataforseo_labs_bulk_keyword_difficulty` | Not reached — no keyword universe to gap-fill. | ❌ Not Evaluated / Data Required |
| 9 | Search intent classification (O4 gap-fill) | Base, gap-fill only | `dataforseo_labs_search_intent` | Not reached — no clusters to classify. | ❌ Not Evaluated / Data Required |
| 10 | Geographic candidate screening (O2) | Local/regional only | tiered `serp_locations` → volume → SERP → listings | **Not applicable** — business declared non-geo-bound. Skipped explicitly per discover.md O2. | ⊘ N/A (stated, not omitted) |
| 11 | AI-Overview / zero-click exposure (Category A) | Always required | ⚠ `ai_optimization_llm_response` (unverified) | Cannot run — DataForSEO disabled *and* tool unverified. | ❌ Not Evaluated / Data Required |
| 12 | AI discovery / LLM mention tracking (Category M) | Base Discover, tool-pending | ⚠ `ai_opt_llm_ment_*` — **manual/free fallback is the current default** | Run the manual/free fallback: direct site read for entity clarity, structured data, first-party content, crawlability/citability. | ✅ Executed (free/manual) |
| 13 | Site crawl + technical data (Category H, D) | Conditionally required (Mode 1) | `on_page_content_parsing` / `on_page_instant_pages` | Substitute **free direct site read via WebFetch** (homepage + robots.txt + sitemap probe). | ✅ Executed (free substitute) |
| 14 | Lighthouse / performance, multi-page-type (Category H sub-audit, §4) | Conditionally required (Mode 1) | `on_page_lighthouse` → **free PageSpeed Insights API via WebFetch** (explicit fallback per data-sources.md) | Run PSI on every distinct page type that exists. **Site has exactly one page type (homepage) — the required multi-page-type sampling is impossible because the pages don't exist, not because the tool was skipped.** Record that distinction. | ✅ Executed (free substitute, single page type available) |
| 15 | Local data — GBP / local pack / citations (Category I) | Local/regional only | `business_data_business_listings_search` | **Not applicable** (non-geo-bound). Also an unmapped gap for reviews/NAP per data-sources.md. Section retained and marked. | ⊘ N/A (stated, not omitted) |
| 16 | Backlink / referring-domain data (Category G) | Conditionally required | `backlinks_summary`, `backlinks_referring_domains` | Cannot run — DataForSEO disabled. No free substitute. | ❌ Not Evaluated / Data Required |
| 17 | Analytics & measurement readiness (Category K) | Always in scope | **no DataForSEO tool substitutes** — client-authorized GSC/GA4 only | Cannot verify — no access authorized at intake. Row retained, marked unavailable (never guessed). | ❌ Not Evaluated / Data Required |
| 18 | Conversion readiness (Category L) | Conditionally required | direct site read (free) | Run against the one existing page. | ✅ Executed (free/manual) |
| 19 | Chatbot / light AI automation read (Category N) | Conditionally required | qualitative — no data pull | Derive from O1 business model + Category L friction. | ✅ Executed (qualitative) |
| 20 | Site history (Category J) | Mode 1 | `domain_analytics_whois_overview` — **optional enrichment** | **Skipped by default in Automated Mode** to conserve budget (discover-engine.md rule 1). Public/general knowledge of the domain's reserved status used instead, labeled `inference`/`retrieved` as appropriate. | ⊘ Skipped (optional enrichment, per Automated Mode) |
| 21 | Content coverage / trend signals | Optional enrichment | ⚠ `content_analysis_*` | Skipped by default in Automated Mode. | ⊘ Skipped (optional enrichment) |
| 22 | Technology detection | Optional enrichment | ⚠ `domain_analytics_technologies_domain_technologies` | Skipped by default in Automated Mode. | ⊘ Skipped (optional enrichment) |

## Planned free/non-DataForSEO queries (the only calls this run will make)

Progressive retrieval still applies: bulk first, inspect what's already returned, fill only genuine gaps. Estimate — **not a target to fill**:

1. Direct site read — `https://example.com/` (Categories H, D, L, M, C; O1 confirmed-offering evidence).
2. `https://example.com/robots.txt` — crawlability (Category H).
3. `https://example.com/sitemap.xml` — sitemap presence (Category H).
4. PageSpeed Insights API — `example.com`, mobile, all four Lighthouse categories (Category H sub-audit / §4).
5. PageSpeed Insights API — `example.com`, desktop, if mobile leaves a material diagnostic gap (gap-fill only, per the progressive protocol).

Anything beyond this list requires either DataForSEO funding or client-authorized GSC/GA4 access.

## Explicit consequence, recorded up front
With #2–#5, #7–#9, #11, and #16 unavailable, the **Opportunity Engine's quantitative core (O3, O4, O5, O6, O7, and the demand half of O8/O9/O10) cannot be evidenced.** Per report-contract.md's Core Rule and Final Quality Gate, those sections are **kept, marked "Not Evaluated / Data Required," and accompanied by what was tested, what was confirmed, what could not be verified, and what would resolve it.** They are not omitted, and the resulting small content-topic count is labeled a **research-completeness gap, not a finding about true opportunity size** (report-contract.md §14).
