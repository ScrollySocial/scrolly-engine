# Normalized — Lighthouse / Performance (example.com)

Source: query-log #4–6. **All three attempts failed (HTTP 429).** Date: 2026-08-11.

## Status: NOT EVALUATED / DATA REQUIRED

Per report-contract.md §4 (Lighthouse/Performance Error Analysis) this is a **permanent required processing step**, so it is retained and marked, never dropped. Recording the Core Rule's six-step fallback:

1. **Section kept.** Yes — report §4 and Category H's performance rows exist and are marked.
2. **What was tested:** the free PageSpeed Insights API v5 (the declared substitute for DataForSEO `on_page_lighthouse` per data-sources.md), against `https://example.com/`, mobile strategy, requesting all four Lighthouse categories. Retried twice — once with a reduced single-category payload, once against the alternate `pagespeedonline.googleapis.com` host.
3. **What was confirmed:** nothing about the site's performance. Confirmed only that the keyless PSI quota is exhausted for this egress IP (HTTP 429 on all three attempts).
4. **What could not be verified:** Lighthouse category scores (Performance, Accessibility, Best Practices, SEO); Core Web Vitals and lab metrics (LCP, INP, CLS, FCP, TBT, Speed Index, TTFB); and every §4 diagnostic — render-blocking resources, unused JS/CSS, JS execution time, bundle size, main-thread blocking, DOM size, server response time, image sizing/format/compression, missing image dimensions, lazy-loading, font loading, third-party scripts, caching, network dependency chains, redirects, layout shifts, LCP element, mobile usability. **Severity and scope classification cannot be assigned** to any performance issue.
5. **What would resolve it:** a free PSI API key (raises the quota immediately), or funding DataForSEO's `on_page_lighthouse`. Either resolves this within one call.
6. **Nothing invented.** No score, metric, or diagnostic is estimated anywhere in this engagement.

## Second, independent limitation on this sub-audit
Even with working performance data, §4's **multi-page-type sampling requirement could not have been satisfied** — the site has exactly one page type (homepage). No service/product page, category page, location page, blog/article, or product page exists to test (see `site-read.md`). This is a property of the site, **not** a skipped step, and must be reported as distinct from the 429 outage.
