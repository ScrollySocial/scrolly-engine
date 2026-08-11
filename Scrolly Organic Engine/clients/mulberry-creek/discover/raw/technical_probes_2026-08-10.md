# Raw — Technical Audit Probes (free tools only, no DataForSEO)

All checks performed 2026-08-10 against https://mulberrycreektx.com/ using WebFetch and the Claude Browser tool (two independent fetch clients, cross-checked where noted). No paid DataForSEO calls made. No GSC/GA access used or assumed.

## robots.txt
- WebFetch GET https://mulberrycreektx.com/robots.txt → HTTP 404 Not Found
- Browser GET https://mulberrycreektx.com/robots.txt → HTTP 404 Not Found (tab title: "404 Not Found")
- **Consistent across both clients: robots.txt does not exist.**

## Sitemap paths
- WebFetch GET https://mulberrycreektx.com/sitemap.xml → HTTP 403 Forbidden
- Browser GET https://mulberrycreektx.com/sitemap.xml → HTTP 403 Forbidden (confirmed twice via network log, requestIds 1B7AA187B03D72B1E1F38BB2D6A032CA and 047619BCBF224CAB734D872A82E86200)
- Browser GET https://mulberrycreektx.com/sitemap_index.xml → HTTP 403 Forbidden (via WebFetch)
- Browser GET https://mulberrycreektx.com/wp-sitemap.xml (WordPress-core default path) → HTTP 403 Forbidden (requestId 212EE8B29A46ACD25AC94B3592E3B4AE)

## Control test — confirms 403 is a distinct, deliberate response (not generic site behavior)
- Browser GET https://mulberrycreektx.com/this-path-should-not-exist-test-xyz123 (a genuinely nonexistent path) → HTTP 404 Not Found, twice (requestIds 04850FAE3EF95324BED149E875613A9E, 40E681A6B7A895F022AC5A8978F9AE04), served via the theme's custom "Page not found" template.
- **Conclusion: the server distinguishes between "doesn't exist" (404, themed error page) and sitemap-shaped paths (403, blocked) — this is a deliberate block on sitemap-style URLs, not simple absence.**

## Redirect / host consolidation checks (Browser, final resolved tab state after navigation)
- http://mulberrycreektx.com/ → resolves to https://mulberrycreektx.com (HTTP→HTTPS redirect works)
- https://www.mulberrycreektx.com/ → resolves to https://mulberrycreektx.com (www→non-www redirect works)
- http://www.mulberrycreektx.com/ → resolves to https://mulberrycreektx.com, all subsequent asset requests 200 OK (combined http+www redirects to canonical host in a single observed hop)

## Full network log, homepage load (https://mulberrycreektx.com/)
All first-party asset requests (CSS, JS, wp-includes, wp-content/plugins/fluentform, theme assets) returned 200 OK. No broken resource references found on the live homepage itself.
One broken resource found, but scoped to the theme's 404-error-page template only (loads when a nonexistent URL is visited, not on the live homepage): `wp-content/themes/landscapingandgardencenter_260806_182136/assets/images/404-image.webp` → 404 Not Found (confirmed twice).

## Core Web Vitals / PageSpeed Insights — attempted, blocked by API quota
Request: `GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://mulberrycreektx.com/&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices` (public, unauthenticated PSI v5 endpoint)
Response (via both WebFetch and direct Browser navigation, consistent):
```
HTTP 429 — "Quota exceeded for quota metric 'Queries' and limit 'Queries per day' of service 'pagespeedonline.googleapis.com'... quota_limit_value: 0"
```
**This is an environment-level API quota exhaustion on the shared/unauthenticated PSI project used by this session's tools — not a statement about Mulberry Creek's site performance, and not a GSC-gating issue.** No Core Web Vitals data (lab or field) was retrieved. Not retried further since the quota error is a hard daily block, not a transient failure.

## Indexation sanity check — `site:mulberrycreektx.com`
Run via the WebSearch tool (Claude's own web search backend — not confirmed to be Google's index specifically). Returned zero results from mulberrycreektx.com; instead returned unrelated Wikipedia pages about other things named "Mulberry."
**Per the approved safeguard, this is NOT treated as evidence of actual Google indexation status one way or the other** — the search backend behind this tool is not confirmed to reflect Google's index, and `site:` operators are known to be an unreliable indexation signal even on Google itself. True indexation/coverage status remains a Search-Console-gated unknown.

## Page inspection — see technical_dom_extract_2026-08-10.json for full raw JS-extraction output (title, meta tags, canonical, headings, JSON-LD, images, links, mobile-viewport metrics).
