# Normalized — Seasonal / Agritourism Opportunity Gate Check

Source: `raw/seasonal_demand_2026-08-10.json`, `raw/seasonal_serp_pumpkinpatch_willspoint_2026-08-10.json`, `raw/seasonal_serp_pumpkinpatch_terrell_2026-08-10.json`, `raw/seasonal_serp_cornmaze_willspoint_2026-08-10.json`. This was a scoped gate check (4 calls) to decide whether a seasonal/agritourism concept deserves one section in the report — not a feasibility study and not a strategy build-out.

## Client-provided existing assets (not independently verified by DataForSEO)
- Mulberry Creek grows giant / show-size pumpkins.
- Mulberry Creek has livestock on the property.
Neither asset currently appears anywhere on the live website or in any tested search result.

## Demand (Texas-level, 12-month average)
| Term | Volume | Ads competition (paid-advertiser only) | CPC |
|---|---|---|---|
| pumpkin patch | 60,500/mo | LOW | $2.53 |
| pumpkin patch near me | 49,500/mo | LOW | $0.03 |
| corn maze | 5,400/mo | LOW | $0.18 |
| fall festival | 2,900/mo | LOW | $7.03 |
| giant pumpkin | 390/mo | MEDIUM | $0.29 |

**"LOW/MEDIUM competition" here describes Google Ads paid-advertiser competition in this dataset only. It says nothing about organic/SEO ranking difficulty, which was not separately measured.** Do not translate this into "easy to rank" language anywhere downstream.

"Giant pumpkin" is a real but comparatively small search term on its own (390/mo vs. 60,500/mo for "pumpkin patch"). The generic terms are the demand opportunity; giant pumpkins is a potential differentiation/marketing angle that could be layered onto that generic demand, not a primary demand driver in its own right.

## Seasonality
Sharply concentrated in October across every term tested. Example: "pumpkin patch near me" rises from ~320-480/mo in the March–June range to 450,000/mo in October, then falls back by December. This is a hard, predictable seasonal window — any content built around it needs to be in place well before September.

## Local-pack competitive landscape (3 SERP pulls: pumpkin patch @ Wills Point, pumpkin patch @ Terrell, corn maze @ Wills Point)
| Search | #1 | #2 | #3 |
|---|---|---|---|
| pumpkin patch @ Wills Point | Walls Family Farm (Terrell, TX) 4.7★/122 | Spooktacular Nights at YesterLand Farm (Canton, TX) 4.4★/13 | Blase Family Farm (Rockwall, TX) 4.6★/439 |
| pumpkin patch @ Terrell | Walls Family Farm (Terrell, TX) 4.7★/122 | Huddin Homestead Fun Farm (Rockwall, TX) 4.8★/297 | Blase Family Farm (Rockwall, TX) 4.6★/439 |
| corn maze @ Wills Point | Walls Family Farm (Terrell, TX) 4.7★/122 | Spooktacular Nights at YesterLand Farm (Canton, TX) 4.4★/13 | The Corn Maze at Yesterland Farm (Canton, TX) 5★/2 |

**Wording correction:** the corn-maze result's #2 and #3 listings ("Spooktacular Nights at YesterLand Farm" and "The Corn Maze at Yesterland Farm") both trace to the same underlying business — YesterLand Farm, Canton, TX — one listing for their general seasonal event and one for the corn-maze attraction specifically. This is one competitor holding two of the three local-pack slots for that search, not two independent competitors. Do not describe this as "two competitors."

Walls Family Farm (Terrell, TX) and Blase Family Farm (Rockwall, TX) both recur across the Wills Point and Terrell searches — this is a genuinely regional draw category (same top competitors regardless of which of the two markets is searched from), a different pattern than the core nursery/landscaping business, where competition was market-specific.

**Factual description only — no claim of "beatable":** these are established, heavily-reviewed operations (122–439 reviews). Whether Mulberry Creek could realistically compete for local-pack placement is not evaluated by this data and is not claimed here.

Mulberry Creek does not appear in local pack for any of the 3 searches tested.

## SERP feature observation
No AI-Overview element appeared on any of the 3 pulls — reported as an observed SERP characteristic only, a different pattern than the core nursery/landscaping searches (which were heavily AI-Overview-crowded). **This is not evidence that organic ranking would be easy or "winnable"** — no ranking-difficulty data was gathered.

## Differentiation observation
Nothing in the visible titles/descriptions of the observed competitors referenced giant/show-size pumpkins specifically. This is a low-to-moderate-confidence observation (absence in snippet text, not a verified check of what these farms actually grow or market elsewhere) — offered as a plausible differentiation angle, not a confirmed competitive gap.

## Explicitly out of scope for this gate check
Business/operational feasibility — capacity, staffing, insurance, liability, permitting, agritourism logistics — has **not** been evaluated at all. This was a search-demand-and-competition check only.

## Confidence
- Demand and seasonality: High — directly retrieved, consistent pattern across all 5 terms.
- Local-pack competitive landscape: High for what was tested (2 of 6 confirmed markets, 2 of several possible fall-attraction intents) — directional, not exhaustive.
- Differentiation-angle observation: Low-Moderate — absence-based inference.
- Ads-competition-metric and AI-Overview-absence framing: High confidence in the observation itself, explicitly capped from being used as an SEO-difficulty or winnability claim.
