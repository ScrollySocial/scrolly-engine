# Normalized — Direct Site Read (example.com)

Source: query-log #1–3 (WebFetch, free). Evidence class: **DIRECTLY OBSERVED** (`retrieved`). Date: 2026-08-11.

## Observed facts
- Site resolves over **HTTPS** at `https://example.com/`. HTTP 200.
- **Exactly one page.** No internal links of any kind. No navigation menu.
- `<title>`: "Example Domain". **H1**: "Example Domain" (one H1 — count is correct).
- Body copy, in full: *"This domain is for use in documentation examples without needing permission. Avoid use in operations."*
- Outbound links: **1** — anchor "Learn more" → `https://iana.org/domains/example`.
- **Absent:** forms · phone number · address · CTA (beyond the single informational link) · images · navigation · business, product, or service information · meta description (none surfaced) · H2–H6 subheadings · structured data/schema (none surfaced in the rendered read).
- `robots.txt` → **HTTP 404** (absent).
- `sitemap.xml` → **HTTP 404** (absent at the conventional path).

## Derived reads
- **O1 confirmed-offering tier is empty by direct observation.** The page names no product, service, category, or industry. This is not thin intake — there is no commercial entity at this domain to map. (`retrieved`, High confidence.)
- Page-type inventory for the Lighthouse multi-page-type sub-audit: **homepage only.** No service/product page, category page, location page, blog/article, or product page exists to test. (`retrieved`, High confidence.)
- Category F (Internal Linking) has a definite observed answer, not an unknown: zero internal links, single page, so no orphan/broken/weak-link structure can exist. (`retrieved`, High confidence.)
- Conversion surface (Category L): **no conversion mechanism of any kind exists** — no form, phone, booking, or CTA. (`retrieved`, High confidence.)
- Entity readiness (Category M, second half): business name, type, services, locations, hours, contact info, and expertise are **all absent**, so nothing exists for search engines or AI systems to resolve into an entity. (`retrieved`, High confidence.)
- The domain is the IANA/ICANN reserved documentation domain, and its own copy instructs "Avoid use in operations" — i.e., it is explicitly not intended to host a business. (`retrieved` for the copy; the reserved-domain status is `inference` from general knowledge, not a WHOIS pull — WHOIS was skipped as optional enrichment per Automated Mode.)
