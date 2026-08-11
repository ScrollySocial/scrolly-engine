# Query Log — _first-real-test (example.com)

One line per executed call, logged immediately, success or failure. Checked before every new call for a reusable result within the freshness window.

**Paid DataForSEO calls executed: 0 of 40 pre-authorized (Automated Mode, Mode 1 non-geo-bound).** Reason: `DATAFORSEO_ENABLED=false` (unfunded). No paid tool was called; no ceiling breach occurred.

| # | Date | Capability | Tool / endpoint | Normalized params | Result | Cost | Notes |
|---|---|---|---|---|---|---|---|
| 1 | 2026-08-11 | Site read (H, D, L, M, C; O1) | WebFetch (free) | `https://example.com/` | ✅ Success | free | Single page. Title + H1 "Example Domain", 1 outbound link to iana.org, no nav/forms/images/CTA/business info. See `normalized/site-read.md`. |
| 2 | 2026-08-11 | Crawlability (H) | WebFetch (free) | `https://example.com/robots.txt` | ✅ Success (HTTP 404) | free | No robots.txt. 404 is the observed fact, not a call failure. |
| 3 | 2026-08-11 | Crawlability (H) | WebFetch (free) | `https://example.com/sitemap.xml` | ✅ Success (HTTP 404) | free | No XML sitemap at the conventional path. |
| 4 | 2026-08-11 | Lighthouse/performance (H sub-audit, §4) | PageSpeed Insights API v5 via WebFetch (free — declared fallback for `on_page_lighthouse`) | `url=https://example.com/&strategy=mobile&category=performance,accessibility,best-practices,seo` | ❌ **Failed — HTTP 429 Too Many Requests** | free | Keyless PSI quota exhausted at this egress IP. |
| 5 | 2026-08-11 | Lighthouse/performance (retry 1) | PageSpeed Insights API v5 via WebFetch | `url=https://example.com&strategy=mobile` (reduced payload) | ❌ **Failed — HTTP 429** | free | Retried with a smaller request to rule out response-size failure. Same result. |
| 6 | 2026-08-11 | Lighthouse/performance (retry 2) | PageSpeed Insights API v5 via WebFetch | `pagespeedonline.googleapis.com/...&category=seo` (alternate host, single category) | ❌ **Failed — HTTP 429** | free | Third attempt, alternate hostname. Same result. **Capability marked unavailable in `status.md`; Category H performance findings and report §4 marked "Not Evaluated / Data Required" per discover.md's fallback rules — not skipped, not estimated.** Resolution: a PSI API key (free, raises quota) or DataForSEO `on_page_lighthouse` funding. |

## Calls NOT made, and why (audit trail for the ceiling)

Every DataForSEO-mapped capability in `data-plan.md` rows 2–5, 7–9, 11, 16 was **not called** because `DATAFORSEO_ENABLED=false`. Per discover-engine.md Automated Mode rule 1 this is the "missing always-required capability" fallback, not a ceiling breach. Optional-enrichment capabilities (rows 20–22: historical/WHOIS, content-coverage trend, technology detection) were **skipped by default in Automated Mode** to conserve budget. O2's tiered geographic funnel (row 10) and Category I's local-listings call (row 15) were **not applicable** — non-geo-bound business.

No query in this log was reused from a prior engagement; this is the first engagement in `clients/`.
