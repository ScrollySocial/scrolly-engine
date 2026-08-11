# Normalized — SERP Retrieval & Competitor Identification (serp_organic_live_advanced)

Source: 4 calls, all at location_name="Wills Point,Texas,United States", en, desktop, depth 10 · Retrieved fact
Raw: `raw/serp_plant_nursery_2026-08-10.json`, `raw/serp_landscape_design_2026-08-10.json`, `raw/serp_landscaping_company_2026-08-10.json`, `raw/serp_landscape_installation_2026-08-10.json`

## Mulberry Creek's own local-pack presence, by keyword
| keyword | Mulberry Creek in local pack? | position |
|---|---|---|
| plant nursery | **No** | not present in top 3 |
| landscape design | **Yes** | #1 |
| landscaping company | **No** | not present in top 3 |
| landscape installation | **Yes** | #2 |

**This is the single most important finding from this batch:** Mulberry Creek ranks strongly in the local pack for "landscape design" and "landscape installation" but is absent for "plant nursery" and "landscaping company" — despite the nursery/retail side being described as the core of the 43-acre business in input.md. The site's local-pack visibility skews toward the design/install services, not the nursery/retail identity.

## Local-pack competitors identified (by keyword)
| keyword | #1 | #2 | #3 |
|---|---|---|---|
| plant nursery | Bruce Miller Farms Inc (Edgewood, TX) — 4.8★/78 | JP Ranch Gardens (Kaufman, TX) — 5★/8 | Tawakoni Plant Farm (VZ Co Rd) — 4.4★/8 |
| landscape design | **Mulberry Creek** — 5★/8 | Your Choice Landscaping (Wills Point, TX) — 5★/5 | Triple-C Landscaping — 5★/81 |
| landscaping company | Your Choice Landscaping — 5★/5 | Triple-C Landscaping — 5★/81 | Rimmele Landscaping & Handyman (Wills Point, TX, Facebook-only listing) |
| landscape installation | Your Choice Landscaping — 5★/5 | **Mulberry Creek** — 5★/8 | Triple-C Landscaping — 5★/81 |

**Consistently recurring local competitors across all 4 pulls:** Your Choice Landscaping (yourchoicelandscaping.info) and Triple-C Landscaping (triple-c-landscaping.com) — both appear in 3 of 4 local packs. Triple-C has a materially deeper review base (81 vs. Mulberry Creek's 8).
**Nursery-specific competitors (only surfaced on "plant nursery")**: Bruce Miller Farms (Edgewood, TX), JP Ranch Gardens (Kaufman, TX), Tawakoni Plant Farm — all outside Wills Point proper but within the general area; none of these overlap with the landscaping-keyword competitor set. This suggests the nursery/retail competitive set and the landscape design/install competitive set are largely two different groups of businesses.

## SERP feature crowding (all 4 keywords)
- **Local pack present on all 4** — local intent confirmed for every core term.
- **People Also Ask present on all 4**, and in every case PAA items expand to an **AI-Overview element** rather than a plain text snippet — meaningful zero-click risk signal (see AI-Overview note below).
- **Organic results are dominated by non-local, often national/DFW-metro players** (Garden Design, Wikipedia, The Spruce, Yardzen, Home Depot, BrightView, Bonick, Southern Botanical) — none in Wills Point/Van Zandt County. Mulberry Creek does not appear in organic (non-local-pack) results for any of the 4 terms in this pull (depth 10).
- **"plant nursery" additionally surfaces a large `product_considerations` AI-Overview block** (care instructions, environmental impact, history) — heavy zero-click informational crowding specific to this term.
- **Image packs** present on plant nursery, landscape design, landscaping company.
- **Video carousel** present on landscape installation only.
- related_searches on every pull include both a Wills Point-specific and a nearby-town (Canton, TX) variant — confirms Wills Point is a resolvable, meaningfully-searched geo modifier for these terms, supporting the data-plan's choice of Wills Point as the SERP location.

## AI-Overview / zero-click exposure (informal note, not the unverified dedicated tool)
Every PAA block across all 4 pulls resolves to an AI-Overview rather than a standard snippet. This is evidence — gathered as a SERP feature, per the data-plan's stated substitute for the unverified `ai_optimization_llm_response` tool — that ranking well organically may not guarantee a click for informational/PAA-adjacent queries. Does not apply to the local-pack results themselves, which remain the primary local commercial-intent surface.

## Confidence
High — directly retrieved, single geo point (Wills Point). Caveat: single-location snapshot; does not capture variation across the rest of the stated "Van Zandt and neighboring counties" service area (see status.md flag).
