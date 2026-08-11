# Supporting Appendix — example.com

Generated from `findings.md`. Companion to `report.md`. 2026-08-11. Mode 1, non-geo-bound.

## 1. Research methodology
Followed `discover-engine.md`'s 13-step protocol in **Automated/Unattended Mode**. Steps: inputs normalized (1) → Mode 1 determined (2) → `data-plan.md` written and self-approved against the pre-authorized ceiling (3) → O2 screening skipped, non-geo-bound (4) → free queries executed and logged (5) → O3–O7 attempted and blocked (6–7) → evidence analyzed (8) → structured records written (9–11) → Final Quality Gate run (12) → this report and appendix generated (13).

## 2. Data sources used, and call budget
| | |
|---|---|
| Paid DataForSEO calls authorized (Automated Mode, Mode 1 non-geo-bound) | **40** |
| Paid DataForSEO calls executed | **0** — `DATAFORSEO_ENABLED=false` (unfunded). Per Automated Mode this is the "missing always-required capability" fallback, **not** a ceiling breach. |
| Free calls executed | 3 successful direct reads (homepage, `/robots.txt`, `/sitemap.xml`); 3 failed PageSpeed Insights attempts (HTTP 429) |
| Optional-enrichment capabilities | Skipped by default in Automated Mode: WHOIS/historical rank, content-coverage trend, technology detection |

Full call-by-call audit trail: `query-log.md`. Full capability-by-capability plan and disposition: `data-plan.md`.

## 3. Per-category finding tables (A–N)
The complete fixed-schema tables (`category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations`) are held in **`findings.md` Section 2** and are the canonical source for `report.md` §3, §5, §10, §11, §12, §15–§19. Category coverage: **A ✔ B ✔ C ✔ D ✔ E ✔ F ✔ G ✔ H ✔ I ✔(n/a, marked) J ✔ K ✔ L ✔ M ✔ N ✔** — 14 of 14, none omitted.

## 4. Full technical audit detail
| Class | Items |
|---|---|
| **FIX NOW (2)** | no `robots.txt` (HTTP 404) · no XML sitemap (HTTP 404) |
| **IMPROVE (2)** | no meta description · no structured data/schema |
| **PASSED (8)** | HTTPS + HTTP 200 · single H1 · title tag present/unique · no duplicate metadata · zero broken internal links · zero broken external links · no image issues · no cannibalization/duplicate content |
| **NOT EVALUATED (6 groups)** | indexation/noindex/canonical + conflicts · HTTP→HTTPS + www consolidation + canonical domain · redirects/chains/loops/3XX/4XX/5XX/crawl failures · duplicate-URL + unindexed + blocked resources + orphan signals · mobile rendering/usability · manual-action/penalty signals |

Confidence note: meta-description and schema absence are **Moderate** confidence (rendered read, not raw-HTML source inspection); all other observed items are **High**.

## 5. Full Lighthouse / performance findings
**None retrievable.** Three attempts, all HTTP 429 — see `normalized/performance.md` for the six-step gap record (section kept · what was tested · what was confirmed · what could not be verified · what would resolve it · nothing invented). Unavailable: 4 category scores; LCP/INP/CLS/FCP/TBT/Speed Index/TTFB; all 19 required diagnostics; all severity (Critical/High/Medium/Low/Informational) and scope (site-wide/template-wide/page-type/individual) classifications. **Second, independent limitation:** the site has exactly one page type, so the required multi-page-type sampling was impossible regardless of the outage.

## 6. Keyword opportunity table · clusters · difficulty · volume
**Not Evaluated / Data Required.** Schema retained with one explicit insufficient-evidence record in `findings.md` Section 4 (O4 Money Page). No field was filled with a plausible-looking number.

## 7. Full content opportunity map
**Not Evaluated / Data Required — "Pending further research."** `findings.md` Section 5 retains the First 10 / Next 20 / Broader Backlog structure with insufficient-evidence records, plus the status of all 16 applicable discovery paths (0 of 16 executable). Target on a funded re-run: ~100–400 defensible opportunities where evidence supports it. **The list was not padded, and the small count is a research gap, not a finding about true opportunity size.**

## 8. SERP evidence · competitor detail · rankings
**Not Evaluated / Data Required.** No SERP was retrieved; no competitor was identified **or assumed**. Competitor selection would follow Category A's corrected rule — evidence of actual organic capture across commercial clusters, never local-pack recall or a client's offline competitor list.

## 9. Geographic evidence
**Not applicable.** `findings.md` Section 3 retains the full O2 Geographic Market schema with an explicit n/a record. Tiers 0–3 of the screening funnel were never entered; zero paid calls were spent on geography. No location page is recommended anywhere.

## 10. GSC / GA4 findings · local & GBP evidence · backlink data
All **Not Evaluated / Data Required**: GSC and GA4 (no authorized access — no substitute exists); local/GBP (not applicable, non-geo-bound; note that reviews/reputation and citation/NAP are **unmapped capabilities** with no tool in the current provider); backlinks (unfunded). Forward-looking caution recorded in `findings.md` Category G: this domain's documentation-driven link profile will read as anomalously strong in any future pull and must not be mistaken for earned commercial authority.

## 11. AI-discovery evidence
Classification **Not Yet Established** (deliberately not "Weak" — nothing was tested and found absent). Entity readiness **confirmed absent** by direct observation. The prescribed manual/free fallback (running priority prompts through consumer AI search surfaces) was not executable: no priority topics exist to prompt with. The `ai_opt_llm_ment_*` tools remain **candidate/unverified** regardless of funding.

## 12. Traffic-model and ranking-time assumptions
**No traffic model was built and no ranking timeframe was offered.** The required chain — relevant demand → observed visibility → modeled current capture → modeled incremental opportunity, using a stated CTR-by-position range — has no first link without demand and position data. Opportunity was specifically **not** computed as `total volume − ranking volume` (invalid regardless of data availability). No CTR curve is published here because none was applied.

## 13. Confidence labels used
High = "Well-supported" · Moderate = "Likely" · Low = "Uncertain/directional". Report-facing evidence labels: CLIENT-PROVIDED · DIRECTLY OBSERVED · API/RETRIEVED DATA · CALCULATED · INFERENCE · SCENARIO · PENDING VALIDATION. **No composite numeric score is used anywhere**; O10's six rankings are kept distinct and are individually recorded in `findings.md` Section 6.

## 14. Client assumptions
- Non-geo-bound status is **client-provided** and taken at face value; it drives the O2 skip and the Category I / §11 n/a. Correcting it re-activates both.
- `client_specific_economics` = **"Not provided"** throughout — the expected common case, not a defect.
- No inference was made about what the business sells. The site names nothing, and we did not invent an industry to expand from.

## 15. Pending items — the complete unblock list
| Pending item | Blocks | Resolution | Est. cost |
|---|---|---|---|
| DataForSEO funding | §7, §8, §9, §10, §13, §14, §15, §20, §21; O3–O10 | Fund the account | ~20–40 calls, inside the 40-call ceiling |
| PageSpeed Insights API key (free) | §4; Category H performance | Obtain a key, or fund `on_page_lighthouse` | 1 call per page type |
| A real operating domain + stated offering | §1, §6, §7, §13, §16–§19, §21; O1's confirmed tier | Client input, or re-point the engagement | Free |
| GSC read-only access | §5, §20 baseline, indexation checks in §3 | Client authorization | Free |
| GA4 access | §5 | Client authorization | Free |
| Non-DataForSEO source for reviews/NAP | Category I, if the business is ever local | Add a source to `data-sources.md` first | TBD |
