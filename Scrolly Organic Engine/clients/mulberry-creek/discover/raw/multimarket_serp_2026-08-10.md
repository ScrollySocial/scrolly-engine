# Raw — Multi-Market SERP Local-Pack Results (16 calls)

All calls: `serp_organic_live_advanced`, language en, device desktop, depth 10, 2026-08-10. Location parameter used the DataForSEO-confirmed city location names (see query-log.md for location-resolution checks). Two results exceeded inline token limits and were parsed programmatically from saved files (Terrell "plant nursery", Forney "plant nursery" — note: the Forney "plant nursery" file was initially mislabeled during extraction and corrected after content inspection, see below).

## Terrell, TX
- **plant nursery** — local_pack: 1) Honey Locust Farms LLC (Rockwall, TX) 4.6★/80  2) Moon Valley Nurseries (Forney, TX) 4.8★/214  3) Oak Tree Nursery (Seagoville, TX) 4.3★/100. Mulberry Creek not present.
- **landscape design** — local_pack: 1) RCD Outdoors (Forney, TX) 5★/21  2) Land Art of Rockwall 4.5★/48  3) Southern Seasons Landscaping and Design (Rockwall, TX) 5★/127. Mulberry Creek not present.
- **landscape installation** — no local_pack block returned (result opened with an ai_overview element, then organic results only — LawnStarter, Yelp, Triple-C Landscaping in organic rank 6). No local map pack triggered for this query in this market.
- **landscaping company** — local_pack: 1) Triple-C Landscaping 5★/81  2) RCD Outdoors (Forney, TX) 5★/21  3) Southern Style Landscaping (Rockwall, TX) 4.8★/23. Mulberry Creek not present.

## Forney, TX
- **plant nursery** — local_pack: 1) Moon Valley Nurseries (707 W Broad St, Forney) 4.8★/214  2) Calloway's Nursery (Mesquite, TX) 4.6★/264  3) Oak Tree Nursery (Seagoville, TX) 4.3★/100. Mulberry Creek not present.
- **landscape design** — local_pack: 1) Olivos Landscaping residential and commercial 4.9★/39  2) Cabral Landscape Management 5★/52  3) RCD Outdoors 5★/21. Mulberry Creek not present.
- **landscape installation** — local_pack: 1) Olivos Landscaping 4.9★/39  2) Cabral Landscape Management 5★/52  3) RCD Outdoors 5★/21. Mulberry Creek not present. (Same 3 businesses as landscape design.)
- **landscaping company** — local_pack: 1) Olivos Landscaping 4.9★/39  2) Warrior Landscaping LLC 5★/12  3) Cabral Landscape Management 5★/52. Mulberry Creek not present.

## Emory, TX
- **plant nursery** — local_pack: 1) Bruce Miller Farms Inc (Edgewood, TX) 4.8★/78  2) Picketts Plants and Produce (Alba, TX) 4.8★/115  3) Grays Nursery and Garden Center (Mineola, TX) 4.8★/69. Mulberry Creek not present.
- **landscape design** — local_pack: 1) SNS Landscape LLC (Point, TX) 4.6★/27  2) Texas Wunder Works LLC (Point, TX) 4.8★/34  3) Southern Seasons Landscaping and Design (Rockwall, TX) 5★/127. Mulberry Creek not present.
- **landscape installation** — local_pack: 1) Hooten's Lawn & Tree Service LLC (Emory, TX) 4.5★/49  2) Texans Lawn Care (Yantis, TX) 5★/45  3) Texas Wunder Works LLC (Point, TX) 4.8★/34. Mulberry Creek not present.
- **landscaping company** — no local_pack block returned (ai_overview + organic only; Hooten's Nursery & Landscaping appears in organic rank 4, not local pack). No local map pack triggered for this query in this market.

## Mineola, TX
- **plant nursery** — local_pack: 1) Grays Nursery and Garden Center (5685 TX-37, Mineola) 4.8★/69  2) Sanchez Garden (2693 US-80) 4.8★/110  3) Bob Wells Nursery at Sorelle Farms (975 Co Rd 2220) 4.7★/276. Mulberry Creek not present.
- **landscape design** — local_pack: 1) Cutting Edge Irrigation & Lawns LLC (Lindale, TX) 4.8★/136  2) Halls Landscape and Design LLC 5★/21  3) Happy Gardens Landscape (Tyler, TX) 5★/99. Mulberry Creek not present. Note: "Happy Gardens Landscape" is Tyler-based — appearing in Mineola's local pack as an incidental SERP result, not evidence that Tyler is part of Mulberry Creek's service territory.
- **landscape installation** — no local_pack block returned (ai_overview + images + organic only). No local map pack triggered for this query in this market.
- **landscaping company** — no local_pack block returned (ai_overview + organic only; organic results include Tyler-based businesses — Clear Choice Outdoor, Houzz "Tyler, TX" listing page, LawnStarter Tyler — again incidental, not a service-area claim).

## Wills Point, TX
Reused from the original approved batch — see `normalized/serp-competitors.md`. Not re-queried.

## Elmo, TX
**Not directly testable.** Confirmed via free location lookup (query-log.md) that Elmo, TX does not resolve in DataForSEO's SERP location catalog. No SERP call was made for Elmo under any keyword. Indirect coverage is limited to whatever the Wills-Point-cluster business-listings radius call happens to physically include (see multimarket_listings_2026-08-10.md) — that is a different kind of evidence (raw business listings by coordinate, not a keyword-ranked local pack) and should not be described as an "Elmo SERP test."

## Summary observation
Across all 16 market×term combinations tested outside Wills Point, **Mulberry Creek does not appear in a single local pack.** Four of the sixteen combinations (Terrell/landscape installation, Emory/landscaping company, Mineola/landscape installation, Mineola/landscaping company) did not trigger a local pack at all for anyone — a distinct outcome from "present but absent," logged separately above.
