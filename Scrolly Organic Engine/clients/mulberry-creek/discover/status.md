# Discover Status — Mulberry Creek

- Engagement started: 2026-08-10
- Mode: Mode 1 (existing business + existing website)
- Step reached (1–10, per discover-engine.md): 10 — complete
- Data plan approved: yes, fully executed — original base batch, multi-market expansion batch, and seasonal-opportunity gate batch all approved and run. HELD #8 (business_data_business_listings_search) was later unblocked and executed (see Category I — inconclusive result, documented as such, not treated as a gap). SKIPPED #7 (on_page_lighthouse) permanently in favor of a free source.
- Blocker: none
- Queries: all approved queries complete — see query-log.md for full call history across all rounds (original 7, multi-market 23, seasonal 4)
- Findings by category complete: A[x] B[x] C[x] D[x] E[x] F[x] G[x] H[x] I[x] J[x — marked insufficient evidence]
- Findings total: 45 rows across A–J (see findings.md) — 10 High priority, 25 Medium, 6 Low, 4 not-yet-prioritizable (confirmed passes / explicit evidence gaps / superseded-marker rows)
- Report generated: yes — report.md (4,449 words), incorporates core business findings, multi-market local-search results, corrected demand methodology, and the seasonal/agritourism opportunity section
- Appendix generated: yes — appendix.md (2,725 words)
- Completed: yes
- Last updated: 2026-08-10

## Completion note
Confirmed ready for design 2026-08-10. Open items for the client (not blockers to delivery, tracked in report.md Section 13): business-priority ranking across service lines, Google Search Console access, real product/service inventory detail, and business-feasibility evaluation of the seasonal opportunity (explicitly out of SEO-review scope). A new engagement or a follow-up round would be needed to act on any of these.

A new session resumes here first — jump to the first incomplete step, load only the `normalized/` files relevant to remaining work.

## Resume note
input.md is fully populated from public site evidence. data-plan.md's initial approved batch (demand data, 4 SERP pulls, keyword ideas, backlinks summary) has been executed and normalized — see `normalized/demand.md`, `normalized/serp-competitors.md`, `normalized/content-topics.md`, `normalized/authority.md`. Raw payloads archived in `raw/`.

**Held:** `business_data_business_listings_search` (Category I / local data) — do not run until Mulberry Creek's full service territory ("Van Zandt and neighboring counties") is confirmed with specifics (which neighboring counties), since this call's ~40km radius parameter depends on that.
**Skipped (by design, not blocked):** `on_page_lighthouse` — client/user will source Core Web Vitals data from a free tool (e.g. PageSpeed Insights) instead of DataForSEO; Category H technical findings should draw from that source when available, not from a DataForSEO call.

**Key findings surfaced this round (not yet written to findings.md — Step 6/7 not started):**
1. Mulberry Creek's local-pack visibility is inconsistent by keyword: present (and #1) for "landscape design" and present (#2) for "landscape installation," but **absent** for "plant nursery" and "landscaping company" — despite the nursery/retail side being the larger described part of the business.
2. Two consistently recurring local competitors across keywords: Your Choice Landscaping and Triple-C Landscaping (the latter with a much deeper review base — 81 vs. Mulberry Creek's 8).
3. Nursery-specific local competitors (Bruce Miller Farms, JP Ranch Gardens, Tawakoni Plant Farm) are a distinct set from the landscaping-keyword competitors — two different competitive fields.
4. Hyper-local demand data (Wills Point/Van Zandt-modified keyword volume) is not measurable via Google Ads data at this granularity — confirms the geography note's predicted fallback need; local visibility must lean on SERP evidence instead.
5. Keyword-ideas content data is ~20% contaminated by an unrelated Roblox game ("Grow a Garden") and some off-topic seed drift (roofing, siding) — filtered out in normalized/content-topics.md.
6. Backlink profile is thin (18 referring domains, 21 backlinks) — typical of a small local business with no link-building history; informational only, not a red flag requiring action.

## Analysis complete (2026-08-10)
findings.md now has 27 structured rows across all 10 categories, built only from evidence already retrieved (no new DataForSEO calls). Headline finding: Mulberry Creek's local-pack visibility is inversely weighted against demand — it wins local pack for lower-demand landscape design/installation terms but is absent for higher-demand "plant nursery"/"landscaping company" terms, and no dedicated page exists for the nursery/retail side of the business. Likely-cause diagnosis (GBP category mismatch) is flagged as inference pending the held listings call.

Two categories remain genuinely thin: **H (Technical)** — fully unaudited, Lighthouse skipped by design; **I (Local Search)** — SERP-derived rows done, but the full GBP/citation/NAP audit is blocked on (a) the held business_data_business_listings_search call and (b) client confirmation of the specific neighboring counties in "Van Zandt and neighboring counties."

## Evidence-strength QA pass complete (2026-08-10)
Reviewed findings.md for overreach before report generation. 5 rows corrected — all were cases of causal language ("more likely driven by," "most likely reflects") or demand-comparison language stated more strongly than the underlying evidence supports:
- The GBP-category explanation for the local-pack visibility gap (Category C row 3, Category I row 1) was downgraded from Moderate to **Low confidence** and reworded from an asserted likely cause to an explicitly labeled untested hypothesis — GBP category settings have never actually been inspected. Priority stays High on both, since investigating is still valuable; the confidence drop reflects certainty about the *cause*, not the *value of finding out*.
- Two demand-comparison rows (Category A row 2, Category B row 2) were reworded to consistently label volume figures as **national** search demand, not Wills Point-specific demand, per the standing rule against treating national/broad volume as proof of local demand.
- Category B row 2 and Category D row 2 were reworded to explicitly separate "SEO opportunity" from "business value" — higher search demand for nursery/retail is no longer implied to mean higher business value, since margin/ticket-size/capacity data remains unknown (Category B row 1).
- Confirmed no finding treats Tyler or any other unconfirmed market as part of the service territory, and the two rows already flagging the neighboring-county ambiguity (Category C row 2, Category I row 4) were left as-is — already correctly hedged.

No priority levels changed. Revised counts: 10 High / 9 Medium / 6 Low / 2 not-yet-prioritizable (unchanged from before QA — this pass corrected wording and confidence, not prioritization).

**findings.md is ready to serve as the source of truth for the rough $299 report**, with the standing caveats already documented: Category H is fully unaudited, and Category I's full GBP/citation audit remains blocked on the held call and service-area confirmation.

## Category H technical audit complete (2026-08-10)
Ran the approved free-tool audit against mulberrycreektx.com — no DataForSEO calls, no GSC/GA access. Found 8 real Medium-severity on-page/technical issues (missing robots.txt, sitemap.xml/wp-sitemap.xml actively blocked with 403 vs a confirmed 404 control, generic title tag, missing meta description, 3 H1 tags on one page, zero structured data, one broken Facebook link, and several images with placeholder-style alt text/filenames from a third-party site-builder bucket) plus a handful of Low-severity polish items. Several real checks passed cleanly (HTTPS/mixed-content, host-redirect consolidation, canonical, meta-robots indexability, mobile layout). Core Web Vitals could not be evaluated — Google's free PageSpeed Insights API hit a hard daily quota exhaustion on this session's shared project, a tool-access constraint, not a site-performance statement. GSC-gated items (true indexation/Coverage status, crawl stats, manual actions, click/impression data) are explicitly marked unavailable, not guessed; a `site:` search sanity check was attempted but is treated as inconclusive only, per the approved safeguard. Raw evidence in `raw/technical_probes_2026-08-10.md` and `raw/technical_dom_extract_2026-08-10.json`; normalized in `normalized/technical.md`.

One existing finding was touched: Category D row 1 (missing page-level content evidence) got a corroborating note — the placeholder-style images are direct evidence the current site content is partly unfinished template output, not proof the client chose it deliberately. Category C row 3 and Category I row 1 (the GBP-cause hypothesis) were deliberately left untouched — the missing-schema finding is framed strictly as an enhancement opportunity, not a cause of the local-pack gap, per the approved safeguard.

## Multi-market local-search retrieval executed (2026-08-10)
Ran the approved 23-call batch (16 SERP across Terrell/Forney/Emory/Mineola on all 4 core terms, 5 location-parameterized demand calls across Wills Point/Terrell/Forney/Emory/Mineola, 2 business-listings calls sized to Wikipedia/GNIS-verified coordinates for the two market clusters). Full evidence in `raw/multimarket_serp_2026-08-10.md`, `raw/multimarket_demand_2026-08-10.json`, `raw/multimarket_listings_2026-08-10.md` (+ 2 large listings JSON files), synthesized in `normalized/multimarket-local-search.md`.

**Headline result: Mulberry Creek's local-pack visibility is confined entirely to Wills Point.** Zero appearances across all 16 market×term combinations in the other 4 confirmed markets. This materially changes the geographic scope of the existing Wills-Point-based findings — updated in findings.md (Category A rows 1–2, Category C rows 2–3, Category I rows 1, 3–4, plus 8 new rows added). The business-listings call finally ran but produced an unreliable result set (excluded several known-active competitors alongside Mulberry Creek, pointing to a category-taxonomy mismatch) — the GBP-category hypothesis remains unconfirmed, now for a documented reason rather than simply untested. Local demand data is now partially available via a corrected method (real but very small, floor-value volume in all 5 directly-testable markets). Elmo confirmed untestable as a named location in either DataForSEO catalog — reported as such, not silently dropped or faked.

findings.md now has 45 rows (12 High / 23 Medium / 5 Low / 5 not-yet-prioritizable). report.md was NOT regenerated this round per instruction — it still reflects the pre-multi-market Wills-Point-only picture and needs a refresh before it's shown to the client again.

Next action: get client answers on priority-service/margin data (Category B gap, still open) — geography is now resolved. Then update report.md/appendix.md to reflect the multi-market findings before final delivery.

## Client confirmed target markets (2026-08-10)
Client provided the specific geography that was previously missing: confirmed target markets are Wills Point, Terrell, Forney, Emory, Mineola, and Elmo, TX. This resolves part of the B/I "next action" above — the neighboring-county ambiguity is now answered with named towns instead of an unnamed county list. input.md updated. Tyler remains explicitly excluded from the target market (comparison-only, per standing rule). Client also instructed that geographic economics must not be assumed identical across nursery/retail, landscape design, and landscape installation — multi-market analysis must preserve that distinction, not collapse it.

Real-world geography note (not client-provided, general knowledge used only for call-design purposes, not as a substitute for retrieved data): the six markets appear to form two loose clusters — Wills Point/Terrell/Forney/Elmo (Kaufman/Van Zandt corridor, closer together) and Emory/Mineola (Rains/Wood county area, farther northeast, likely outside the ~40km radius originally planned for the held local-listings call from Wills Point alone). This affects the local-listings call design — see the proposed plan below, awaiting approval before any new paid call runs.

Business-priority/margin data (Category B gap) remains unanswered — still needed, independent of the geography update.

**Status: additional multi-market local-search retrieval plan proposed 2026-08-10, awaiting user approval. No new paid calls executed yet.**

## Opportunity Engine test-review round (2026-08-10)
Methodology upgraded to V0.2 (Opportunity Engine O1–O10 + Supporting Audit A–J) and applied to Mulberry Creek. O2 geographic screening ran Tier 0 (free location resolution, 10 candidates: Quinlan, Kaufman, Sulphur Springs, Canton, Edgewood, Grand Saline, Point, Lone Oak, Greenville, Crandall — all resolved cleanly) and Tier 1 (batched demand, 7 of the 10). O3 keyword-universe expansion via DataForSEO Labs hit a hard funding wall (HTTP 402) before any Labs calls completed — no O3 Labs evidence was retrieved. Recovered via free/manual evidence instead: full-text read of mulberrycreektx.com (confirmed "perennial flowers" + "ornamental trees" as real site copy, beyond the DOM-only extract from the technical audit), free competitor-site navigation (brucemillernursery.com, moonvalleynurseries.com — real category taxonomies), and a manual Google Keyword Planner "Discover new keywords" export (`Mulberry_Creek_Claude_Keyword_Import.csv`, 11,975 rows / 6,477 unique keywords, geography UNASSIGNED, volume floor-bucketed at ~50/500).

findings.md extended with the O1–O10 Opportunity Engine record types (Geographic Market, Money Page, Content Opportunity, O10 prioritization) alongside the existing A–J tables — see the new "Opportunity Engine Records" section, appended 2026-08-10.

report.md fully rewritten to the opportunity-first structure, explicitly labeled **TEST REVIEW EDITION** — built on a mix of existing paid evidence + manual/free workaround evidence, not the final client deliverable. Organic difficulty and the O6 current-capture baseline remain Pending across nearly every newly-discovered cluster; do not treat this edition's priorities as final until DataForSEO funding is restored and the smallest validation batch (12 representative keywords, listed in the prior working round and summarized in report.md's "What We Still Need to Know") is run.

appendix.md was NOT refreshed this round — still reflects the pre-Opportunity-Engine structure. Needs a pass before final delivery.

**Next action:** restore DataForSEO funding → run the 12-keyword SERP/difficulty validation shortlist + the O6 ranked-keywords baseline on mulberrycreektx.com → refresh report.md/appendix.md from validated (not Pending) data before treating this as a deliverable.

## Methodology upgraded to V0.2 — Opportunity Engine (2026-08-10)
User approved a full methodology revision (`methodology/discover.md`/`discover-engine.md`/`data-sources.md`/`engagement-template/*` all updated, frozen). Mulberry Creek is the first engagement to run under it. Adds O1–O10 Opportunity Engine layers (Business/Inventory Map, Geographic Opportunity Discovery, Keyword Universe, Clustering/Money Pages, Organic Difficulty, Current Visibility/Capture, Uncaptured Opportunity, Business/Sales Opportunity, Content Opportunity, Prioritization) on top of the existing A–J Supporting Audit. Introduces three evidence classes (Confirmed Business Offerings / Discovered-Candidate Opportunities / Client-Enhanced Data) and a `relevance_classification` field so Discover can surface non-confirmed category opportunities without ever implying Mulberry Creek sells something unverified. See `methodology/discover.md` for full detail — not reproduced here.

## O1–O3 test round executed (2026-08-10) — partially blocked
Ran O1 (Business/Inventory Map), O2 (Geographic Opportunity Discovery), O3 (Keyword Universe) per the new methodology, explicitly stopping before O4. See `normalized/geographic-screening.md` and `normalized/keyword-universe.md` for full detail.

**O1: complete.** Reclassified existing confirmed offerings under the new evidence-class framework; no new evidence needed.

**O2: partially complete.** Tier 0 (free location resolution) and Tier 1 (batched, location-parameterized demand) both ran successfully for 7 user-named candidate markets (Quinlan, Kaufman, Sulphur Springs, Canton, Edgewood, Grand Saline, Point) plus 3 self-generated candidates (Lone Oak, Greenville, Crandall, Tier 0 only). Kaufman and Canton show the strongest combined demand/competition signal. Tier 2 (SERP/current-visibility) and Tier 3 (listings) were **not** run this round by design (cost discipline + focus on O3) — all 10 candidates are provisionally Monitor/Expansion-candidate only, not Core/Secondary, pending Tier 2.

**O3: blocked mid-round.** All 11 new `dataforseo_labs_*` calls attempted (competitor discovery, category expansion, related keywords, keyword suggestions, ranked-keywords capture baseline for 5 domains including mulberrycreektx.com itself) returned **HTTP 402 Payment Required**. A diagnostic `serp_organic_live_advanced` probe also returned 402, confirming the block is account-wide (likely the DataForSEO account balance was exhausted partway through this round — the 7 O2 Tier 1 demand calls succeeded immediately before the block began). Only reused prior-session evidence (demand.md's 7 terms + content-topics.md's ~30-item prior keyword_ideas result) could be reclassified under the new framework — far short of the "30 commercial / 20 informational" target, and with no new current-capture baseline for mulberrycreektx.com.

**Blocker for next round: DataForSEO account needs funding/billing resolved before O3 (and O2 Tier 2/3) can complete.** Nothing else is blocking — O1 is done, O2's screening logic and partial data are in place, and the moment the account is funded the exact same 11-call O3 batch (domains and seeds already selected and documented in `normalized/keyword-universe.md`) can simply be re-run.

Two nursery-line competitor domains were verified via free WebSearch this round (not a DataForSEO call): brucemillernursery.com (Edgewood, TX — confirmed via TNLA/business listings), moonvalleynurseries.com (large regional chain, no Wills-Point-area location but appeared in prior Terrell/Forney SERP evidence). Selected for the blocked ranked_keywords deep-dive alongside mulberrycreektx.com, yourchoicelandscaping.info, and triple-c-landscaping.com — domain selection is preserved for when the block clears.

Not proceeding to O4 per instruction. report.md and appendix.md not touched.

## Round 3 — Free-evidence O3 salvage (2026-08-10)
DataForSEO funding confirmed unavailable for now — treated as a temporary constraint, not a methodology failure. No new DataForSEO calls made this round (paid or free-utility). All previously completed O1/O2/O3 paid evidence preserved untouched.

Used only free sources to extend O3: full-text read of Mulberry Creek's own site (upgraded "ornamental trees" and "perennial flowers/perennials" from POTENTIAL to CONFIRMED RELEVANCE — direct site copy, not previously captured by the DOM-metadata-only technical audit); direct browser navigation of 3 of 4 known competitor sites (Bruce Miller Nursery, Moon Valley Nurseries, Triple-C Landscaping — Your Choice Landscaping blocked by browser tool policy); 2 WebSearch queries for general North Texas nursery/horticultural content topics. Full detail in `normalized/competitor-site-evidence.md` and the Round 3 section appended to `normalized/keyword-universe.md`.

Produced a provisional category/cluster universe (commercial + content) with every volume/difficulty field explicitly marked "Pending paid validation" — no numbers invented, no national/state figures substituted as local demand, no unconfirmed product claimed as sold.

**Smallest prioritized DataForSEO validation batch for when funding resumes (~5-7 calls, down from the original 11):**
1. `kw_data_google_ads_search_volume` — batch the new candidate terms (ornamental trees, native Texas trees, shade trees, hardscape design, retaining wall installation, landscape lighting, privacy hedges, bagged mulch/soil, holiday lighting), National — 1-2 calls
2. `dataforseo_labs_google_ranked_keywords` — mulberrycreektx.com — 1 call (current-capture baseline, highest-value unknown)
3. `dataforseo_labs_google_ranked_keywords` — brucemillernursery.com + moonvalleynurseries.com — 2 calls (nursery-line capture, domains now doubly justified: local-pack recurrence + real category-structure relevance confirmed via free site read)
4. `dataforseo_labs_google_related_keywords` or `keyword_ideas` — seeded with the new CONFIRMED categories (ornamental trees, perennials) — 1-2 calls
Deferred further: Tier 2 SERP for Kaufman/Canton, `triple-c-landscaping.com`/`yourchoicelandscaping.info` ranked_keywords, remaining suggestions/intent/difficulty gap-fill calls.

Not proceeding to O4. report.md/appendix.md still untouched.

## Plan revised after user correction (2026-08-10)
User rejected the first draft of the multi-market plan on methodology grounds: it used unverified population/growth claims to justify call selection, assumed smaller towns wouldn't have demand data without testing, collapsed landscape design/installation/landscaping-company into a single proxy term despite Wills Point evidence showing those three diverge, excluded Elmo without verifying whether DataForSEO actually recognizes it, and sized the two business-listings radii without checking real geographic coverage.

Ran free location-lookup checks (`serp_locations` and `kw_data_google_ads_locations`, both free/utility, logged in query-log.md) to resolve this empirically rather than by assumption:
- **Terrell, Forney, Emory, Mineola, and Wills Point all resolve cleanly** as City-type locations in both DataForSEO location catalogs.
- **Elmo, TX resolves in neither catalog** — confirmed via a plain name search returning zero Texas matches of any type in either the SERP or Google Ads location database. This is a genuine, documented tool limitation, not a population-based exclusion.
- Corrected an earlier inaccuracy: the original data-plan's concern that Wills Point "may not resolve at city granularity" was itself never actually tested (the only past attempts used national-level location with keyword-embedded geo terms, a different method) — now confirmed Wills Point does resolve at city level.

Revised plan proposed to the user: full 4-term SERP coverage (plant nursery, landscape design, landscape installation, landscaping company — matching the original Wills Point test exactly, no intent-collapsing) across Terrell/Forney/Emory/Mineola; location-based demand testing (not keyword-embedded) across all 5 resolvable markets including Wills Point; two geographically-sized business-listings calls with radii derived from approximate real-world town coordinates and distance math (shown to the user, flagged as estimated general knowledge, not a verified geocoding-API result); Elmo covered only indirectly via the business-listings radius (coordinate-based, not name-based) and explicitly not claimed as directly SERP/demand-tested. Awaiting approval — nothing executed beyond the free location checks above.
