# Normalized — Demand Data (kw_data_google_ads_search_volume)

Source: `raw/kw_data_search_volume_2026-08-10.json` · Retrieved fact · location_name param = "United States" (national volume; geo-explicit terms are embedded in the keyword text itself, not a location filter)

| keyword | search volume (monthly avg) | competition | cpc | trend note |
|---|---|---|---|---|
| plant nursery | 90,500 | LOW (22) | $0.89 | seasonal peak Mar–Apr (up to 165k), trough Nov (40.5k) |
| garden center | 90,500 | LOW (18) | $1.15 | seasonal peak Apr–May (201k) |
| landscape design | 33,100 | HIGH (68) | $5.38 | fairly stable, high CPC = high commercial value |
| landscape installation | 1,000 | LOW (26) | $5.10 | low volume but high CPC — niche, high-intent term |
| landscaping company | 27,100 | MEDIUM (42) | $9.70 | highest CPC of core terms — strong commercial intent |
| trees and shrubs | 5,400 | HIGH (93) | $0.62 | very high competition for modest volume |
| nursery near me | 550,000 | MEDIUM (41) | $1.21 | huge volume but "near me" — mostly non-Wills-Point searchers nationally; not a reliable local demand proxy on its own |
| plant nursery Wills Point TX | no data returned | — | — | see gap note below |
| landscape design Wills Point TX | no data returned | — | — | see gap note below |
| landscaping company Van Zandt County | no data returned | — | — | see gap note below |
| plant nursery Tyler TX | **missing from API response entirely** | — | — | see gap note below |
| landscape design Tyler TX | **missing from API response entirely** | — | — | see gap note below |

## Data gaps (flag for findings.md)
- **Hyper-local geo-modified keywords return no measurable Google Ads volume.** The 3 Wills Point/Van Zandt-modified terms came back with a `location_code` but no `search_volume`/`monthly_searches` fields at all — Google Ads keyword-volume data doesn't resolve at this granularity, consistent with the geography note in data-plan.md.
- **2 of 12 requested keywords (both Tyler-market terms) are entirely absent from the response** — not zero, just missing. Treat Tyler comparison-market demand as unestablished, not zero.
- Confidence on core generic terms (plant nursery, garden center, landscape design, landscaping company): **High** — direct retrieved national data.
- Confidence on hyper-local demand sizing: **Low** — no direct data; must be inferred from SERP local-pack presence instead (see serp-competitors.md).
