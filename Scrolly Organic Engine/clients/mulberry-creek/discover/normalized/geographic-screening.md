# Normalized — Geographic Opportunity Discovery (O2), Round 2 (2026-08-10)

Source: `raw/geo_screening_demand_2026-08-10.json`, plus free `serp_locations`/`kw_data_google_ads_locations` lookups (query-log.md). Builds on, does not repeat, the confirmed-market evidence already in `normalized/multimarket-local-search.md` (Wills Point, Terrell, Forney, Emory, Mineola tested; Elmo confirmed-but-unresolvable).

## Candidate markets discovered this round

**User-named (7):** Quinlan, Kaufman, Sulphur Springs, Canton, Edgewood, Grand Saline, Point.

**Self-generated via geographic reasoning (3, `evidence_type: inference` until tested) — Lone Oak, Greenville, Crandall.** Rationale: Lone Oak sits in the same Lake Tawakoni/Quinlan corridor already evidenced as nursery-relevant (Tawakoni Plant Farm appeared as a nursery competitor in the original Wills Point "plant nursery" SERP — `normalized/serp-competitors.md`); Greenville is the Hunt County seat, a larger population center north of the existing cluster; Crandall sits directly on the Forney–Kaufman corridor. None of the three should be read as recommended markets — they are inference-only candidates that resolved cleanly in Tier 0 (see below) but were **not** pushed through Tier 1 (paid) this round, to keep this round's spend concentrated on the 7 user-named candidates and on O3. Deferred, not rejected.

**Not exhaustive.** This is not claimed to be the complete plausible-candidate set — a future round could reasonably ask whether other nearby population centers (e.g., further along the I-20/US-80 corridor, or south toward Kaufman County's other towns) belong in the screen.

## Tier 0 — free location resolution (all 10 candidates)

All 10 resolve cleanly as a single unambiguous Texas City match in both the SERP and Google Ads location catalogs, with identical location_codes across catalogs (confirms the shared-taxonomy pattern already observed for Wills Point) — **no repeat of the Elmo problem** in this batch.

| Market | Location code | Catalog match quality |
|---|---|---|
| Quinlan | 1026720 | Single match, unambiguous |
| Kaufman | 1026516 (city) / 9059534 (county) | City match clean; county-level record also exists |
| Sulphur Springs | 1026826 | 1 of 4 same-name matches nationally (only TX one used) |
| Canton | 1026267 | 1 of 26 same-name matches nationally (only TX one used) |
| Edgewood | 9210266 | 1 of 13 same-name matches nationally (only TX one used) |
| Grand Saline | 9217261 | Single match, unambiguous |
| Point | 1026697 | 1 of 90+ same-name matches nationally (only TX one used) |
| Lone Oak *(inference, untested beyond Tier 0)* | 1026570 | Single match, unambiguous |
| Greenville *(inference, untested beyond Tier 0)* | 1026442 | 1 of 30+ same-name matches nationally |
| Crandall *(inference, untested beyond Tier 0)* | 1026322 | Single match, unambiguous |

## Tier 1 — cheap, batched demand signal (7 user-named candidates only)

Same 5-term batch used for the original 5 confirmed markets (`plant nursery`, `garden center`, `landscape design`, `landscaping company`, `landscape installation`), for direct comparability. **Consistent with every market tested so far in this engagement:** floor-value (10/mo, DataForSEO's minimum reportable figure) or no data — real but very small measurable local search activity, never large numbers. No exact precision should be read into these figures beyond "some measurable demand exists" vs. "no measurable demand returned."

| Market | Terms with data (of 5) | Notable signal |
|---|---|---|
| **Kaufman** | 5/5 | Strongest signal of the 7: real CPC ($0.66 plant nursery), competition_index present on 2 terms (MEDIUM 46, HIGH 71), some months up to 30/mo |
| **Canton** | 4/5 | Second-strongest: real CPC ($0.50 plant nursery, $1.88 landscape design), landscape design competition_index = 100 (HIGH) — the single strongest commercial-competition signal in this batch |
| Quinlan | 4/5 | Floor-value only, no CPC |
| Sulphur Springs | 4/5 | Floor-value only, no CPC |
| Edgewood | 4/5 | Floor-value only, no CPC |
| Grand Saline | 3/5 | Floor-value only; landscaping company + landscape installation empty |
| **Point** | 2/5 | Weakest signal — only plant nursery/garden center show any data at all |

**Reminder — evidence_type: estimate/retrieved, not addressable-market sizing.** These are location-parameterized Google Ads floor values, useful only as a directional demand-exists/demand-thin signal per market, exactly as already established for the 5 previously-tested markets. They are not a substitute for local-pack/SERP-based competitive testing (Tier 2), which was **not** run this round for these 7 markets (see Data Limitations in the round-2 summary).

## Provisional per-line catchment read (Corrected 2026-08-10 methodology — nursery vs. landscaping evaluated separately, not blended)

- **Nursery/retail:** Kaufman and Canton both show measurable plant-nursery-specific signal with real CPC — plausibly within a nursery/retail draw radius from Wills Point (Kaufman ~25mi southwest toward Dallas metro edge, Canton ~15-20mi east). Edgewood is also nursery-relevant on independent grounds — it's the confirmed home base of Bruce Miller Nursery, an already-identified nursery-line competitor (`normalized/serp-competitors.md`), meaning real nursery commercial activity is evidenced there regardless of Mulberry Creek's own visibility.
- **Landscape design/install:** Kaufman and Canton again show the strongest signal, notably Canton's landscape-design competition_index of 100 (HIGH) — real, evidenced design-service commercial activity, consistent with project-based services typically carrying a wider catchment than nursery/retail.
- **Point, Grand Saline:** thin signal on both lines — small towns, weak evidence for either a nursery or landscaping push at this time.
- **Sulphur Springs:** furthest from Wills Point (~45mi+) of the 7; floor-value demand present but no differentiating signal (no CPC, no elevated competition) — distance plus thin signal argue against near-term priority.

## Provisional classification (per discover.md O2 — Core / Secondary / Expansion Opportunity / Monitor / Not Recommended)

**None of these 7 (or the 3 inference-only additions) are classified as Core or Secondary this round.** Core/Secondary requires the fuller evidence stack (Tier 2 SERP — current visibility and competitive landscape) that Tier 1 alone doesn't provide, and Tier 2 was not run this round (see Data Limitations). Provisional read, to be finalized once Tier 2 runs:

| Market | Provisional classification | Reasoning | Page recommendation (provisional) |
|---|---|---|---|
| Kaufman | **Expansion Opportunity** (candidate for Tier 2) | Strongest demand + competition signal of the 7; distinct from already-tested Forney/Terrell | Too early — needs Tier 2 (current visibility, competitors) before any page-type call |
| Canton | **Expansion Opportunity** (candidate for Tier 2) | Second-strongest signal; also county seat, independent real-world relevance | Same — needs Tier 2 |
| Edgewood | **Monitor / insufficient evidence** | Nursery-relevant on competitor-location grounds, but demand signal itself is floor-only | Monitor; revisit if Tier 2 run |
| Quinlan, Sulphur Springs, Grand Saline | **Monitor / insufficient evidence** | Floor-value demand only, no differentiating signal | No dedicated targeting at this evidence level |
| Point | **Not Recommended at this time** | Weakest signal of all candidates tested (2/5 terms) | No dedicated targeting |
| Lone Oak, Greenville, Crandall | **Monitor / insufficient evidence** (Tier 0 only) | Not yet tested past free resolution | Not yet evaluable |

**No location page, service-area inclusion, or dedicated targeting is recommended for any of these 10 markets from this round's evidence alone** — consistent with the standing no-doorway-page rule. This table exists to route future Tier 2 spend, not to greenlight page-building.

## Confidence
- Tier 0 resolution: High — directly retrieved, unambiguous matches.
- Tier 1 demand: Moderate — real retrieved data, but floor-value imprecision applies (same caveat as the original 5-market batch).
- Provisional classification: Low-Moderate — explicitly incomplete pending Tier 2; stated as provisional throughout, not a finished O2 classification.
