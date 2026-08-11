# Raw — Business Listings Search, 2 Calls (Summary + Limitation Note)

Tool: `business_data_business_listings_search`, categories=["Nursery","Landscape designer","Landscaper"], limit 50. Full raw payloads: `listings_cluster1_willspoint_2026-08-10.json`, `listings_cluster2_emorymineola_2026-08-10.json`.

## Call 1 — Wills Point / Terrell / Forney / Elmo cluster
`location_coordinate = 32.730,-96.218,28` (28km radius, centroid of the 4 confirmed-coordinate cluster towns — see status.md for the geocoding work).
Returned **10 items**, despite `limit: 50` requested. **Zero mentions of "Mulberry Creek" anywhere in the response.**

| Business | Category (as returned) | City | Rating |
|---|---|---|---|
| YD Lawn and Fence | Fence contractor (+ landscaper, lawn sprinkler system contractor) | Terrell | 5★/1 |
| Lone Star Organic Landscaping | Landscaper (+ landscape designer) | Royse City | n/a |
| Rockwall Lawn Care and Landscaping | Lawn care service (+ landscaper, tree service) | (unlisted) | 3.2★/9 |
| Design Masters Landscaping | Landscaper (+ general contractor, landscape designer, lawn care, masonry) | Heath | 4.2★/5 |
| J & T Nursery & Landscaping | Plant nursery (+ landscaper, landscaping supply store, wholesale plant nursery) | Terrell | 4.9★/40 |
| B and J Landscaping | Landscaper | (unlisted) | 5★/8 |
| TURF CAT – Mowing and Landscape | Landscaper | Terrell | 4.8★/20 |
| ERM Landscape & More, LLC | Landscaper | Royse City | 5★/4 |
| Patient Gardener | Landscaper (+ masonry, retaining wall supplier) | Royse City | 4.7★/12 |
| Clients First Landscape Solutions | Landscape designer (+ drainage, landscape architect, landscaper, pool contractor) | Rockwall | 4.3★/90 |

## Call 2 — Emory / Mineola cluster
`location_coordinate = 32.758,-95.618,22` (22km radius, midpoint of Emory and Mineola).
Returned **10 items**. **Zero mentions of "Mulberry Creek."** (Expected and uninformative for this cluster — it's ~60km from Mulberry Creek's location, correctly out of range.)

| Business | Category (as returned) | City | Rating |
|---|---|---|---|
| Jo's MowJo Landscape Solutions | Landscaper (+ lawn care, plant nursery) | Emory | n/a |
| David's Lawn Service | Lawn care service (+ landscaper) | Mineola | n/a |
| Juan Rocha Tree Service | Tree service (+ forestry, landscaper) | Mineola | 4.8★/17 |
| Lawn Solutions | Landscaper (+ lawn care) | Yantis | n/a |
| A & J Landscape and Sprinklers | Landscaper (+ general contractor, lawn care) | Yantis | 4★/4 |
| Keener's Lawn and Landscape | Landscaper (+ lawn mower repair) | (unlisted) | 5★/28 |
| Holden Landscape | Lawn care service (+ landscaper, tree service) | Grand Saline | 5★/2 |
| Hooten's Lawn & Tree Service LLC | Tree service (+ landscaper, lawn care, plant nursery) | Emory | 4.5★/48 |
| Red Sky Landscaping & Welding | Landscaper (+ fence contractor, welder) | Mineola | 5★/14 |
| Texans Lawn Care | Landscaper (+ landscape designer, lawn care, sprinkler contractor) | Yantis | 5★/44 |

## Reliability limitation — read before drawing any conclusion

**Neither call's result set includes Mulberry Creek, and — critically — neither includes several businesses we independently confirmed are active, well-reviewed, and physically located inside the same search radius via the SERP local-pack data** (Triple-C Landscaping and Your Choice Landscaping in the Wills Point/Terrell area, both seen repeatedly in local-pack results; RCD Outdoors, Olivos Landscaping, Cabral Landscape Management in the Forney area). Their absence here, alongside Mulberry Creek's, strongly suggests this call's category filter and/or result set is incomplete rather than exhaustive.

The category strings used ("Nursery", "Landscape designer", "Landscaper") appear not to align cleanly with the tool's actual internal taxonomy — the results themselves report categories like `plant_nursery`, `landscaper`, `lawn_care_service` (note "Plant nursery," not "Nursery"). This is a plausible, sufficient explanation for the mismatch, though not confirmed.

**Conclusion: this call cannot responsibly be used to confirm or rule out anything about Mulberry Creek's own Google Business Profile category configuration.** Per the standing instruction not to draw GBP conclusions without inspecting Mulberry Creek's actual returned listing data — and no such data was returned — the GBP-category hypothesis (Category I, Local Search) remains exactly what it was before this call: an untested, unconfirmed hypothesis. This call did surface real, previously-unseen small competitors in the area (J & T Nursery & Landscaping in Terrell notably — a nursery+landscaper combination business not seen in any SERP pull) and confirmed the tool's actual category taxonomy for any future, better-targeted attempt.
