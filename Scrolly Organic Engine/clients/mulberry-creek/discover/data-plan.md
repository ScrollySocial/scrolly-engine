# Data Plan — Mulberry Creek

Planned queries, drafted from `input.md` + `data-sources.md`. Requires explicit user approval before any paid call runs.

**Blocker:** DataForSEO MCP calls are currently returning HTTP 401 (unauthorized) — connection needs to be reconnected/re-authenticated before any call below (including free utility lookups) can execute. This plan is drafted and ready; execution is on hold pending (1) your approval below and (2) the connection being fixed.

**Mode 1** (existing business + existing website). Excluded from all keyword/service framing per client instruction: routine landscape maintenance, lawn mowing.

**Geography note:** Wills Point, TX is a small town (~4,000 pop.); DataForSEO's location database may not resolve it at city granularity. Plan: attempt `"Wills Point, Texas, United States"` first for location-aware calls; if unresolved, fall back to `"Texas, United States"` (state-level) and note the confidence downgrade in findings. This fallback is pre-approved as part of this plan — it won't require a second approval round-trip.

## Planned Calls (9 paid calls total)

| capability | tool (from data-sources.md) | why needed | required? (base/optional) | approved? |
|---|---|---|---|---|
| Demand data | `kw_data_google_ads_search_volume` — 1 call, batch of 12 keywords (generic: plant nursery, garden center, landscape design, landscape installation, landscaping company, trees and shrubs, nursery near me; geo-explicit: plant nursery Wills Point TX, landscape design Wills Point TX, landscaping company Van Zandt County, plant nursery Tyler TX, landscape design Tyler TX) | Establish real search demand for core services + compare hyper-local vs. nearest larger market (Tyler) | Base | **executed 2026-08-10** — see normalized/demand.md |
| SERP retrieval (×4) | `serp_organic_live_advanced` — "plant nursery", "landscape design", "landscaping company", "landscape installation", each @ Wills Point, TX location | Capture actual SERP composition (organic, local pack, PAA, ads, AI-overview presence) for the 4 core commercial intents; primary source for competitor identification | Base | **executed 2026-08-10** — see normalized/serp-competitors.md |
| Competitor identification | *(derived from the 4 SERP pulls above — no separate call)* | Category A requires competitors identified from SERP evidence, not assumptions; deriving from geo-accurate local SERP snapshots is more precise here than the labs tool, which only supports country-level location and would blur out local competitors | Base | done — derived in normalized/serp-competitors.md |
| Content/topic demand breadth | `dataforseo_labs_google_keyword_ideas` — 1 call, seeds: plant nursery, landscape design, landscape installation, trees and shrubs, garden center; limit 50; location United States (country-only param) | Category E gate — decide whether informational/blog content investment is justified at all, and surface real topic/intent clusters | Base | **executed 2026-08-10** — see normalized/content-topics.md |
| Site technical audit | `on_page_lighthouse` — 1 call, url https://mulberrycreektx.com/ | Category H — Core Web Vitals/performance/mobile rendering; the site is a single page so one call covers the site. Page content/structure itself already captured free via direct site read — not re-pulling via `on_page_content_parsing` (duplicate) | Base (Mode 1) | **skipped by user instruction 2026-08-10** — Category H technical/performance data to be sourced from a free tool (e.g. PageSpeed Insights) instead of DataForSEO |
| Local search / GBP presence | `business_data_business_listings_search` — 1 call, categories: Nursery / Landscape designer / Landscaper, near Wills Point, TX coordinates, radius ~40km (covers Van Zandt + neighboring counties) | Category I — confirms Mulberry Creek's own GBP presence/rating and surfaces actual local-pack competitors in one call | Base (local business) | **held by user instruction 2026-08-10** — pending confirmation of full service territory (which neighboring counties) before running |
| Authority / backlinks | `backlinks_summary` — 1 call, target mulberrycreektx.com | Category G baseline referring-domain profile for the client's own domain | Base | **executed 2026-08-10** — see normalized/authority.md |

## Explicitly Not Planned (and why)
- **Competitor backlink pulls** (`backlinks_competitors`, etc.) — optional enrichment; skip unless the own-domain baseline shows a material authority gap that needs competitor comparison to be useful.
- **Historical/WHOIS data** (Category J, site history) — optional enrichment only; no known site history to investigate. Findings.md will mark Category J as insufficient evidence rather than pull data for it.
- **AI-Overview/zero-click exposure tool** (`ai_optimization_llm_response`) — flagged in data-sources.md as unverified/candidate-only; the 4 SERP pulls already report AI-Overview presence as a SERP feature, which covers the base requirement without a separate unverified call.
- **`on_page_content_parsing`** — duplicate of content already captured via free site read.
- **Internal Linking (Category F)** — site is a single page (anchor nav only, no separate URLs); will be marked not applicable rather than queried.

## Approval
Reply with approval (all / a subset / none) once ready. Nothing executes until (a) you approve and (b) the DataForSEO connection returns non-401.
