---
purpose: source-traceability file for factual claims in the Shopify SEO Workbook — keep this updated as drafting proceeds so the customer-facing copy can stay clean without losing citations
created: 2026-08-19
---

# Research Notes — Shopify SEO Workbook

Initial landscape pass for the architecture proposal. Classify every claim as **FACT** (verifiable, cite source), **RECOMMENDATION** (defensible judgment, not a hard fact), or **EMERGING PRACTICE** (industry is still figuring this out — say so plainly in the workbook).

## Google Search Console (FACT)
Core reports as of 2026: Performance (clicks/impressions/CTR/avg. position), Index Coverage, Core Web Vitals, URL Inspection, Sitemaps, Links, Enhancements, Manual Actions, Security Issues, API access. URL Inspection now has a more detailed rendering report.
Sources: [clickrank.ai](https://www.clickrank.ai/search-console-indexing-enhancements/), [imarkinfotech.com](https://www.imarkinfotech.com/google-search-console-the-ultimate-guide-for-2026/)

## Shopify technical SEO defaults (FACT, needs one more verification pass)
- Every store gets an auto-generated, auto-updated sitemap at `/sitemap.xml`.
- Shopify auto-generates `robots.txt`; **conflicting signal on whether robots.txt.liquid editing is all-stores or Plus-only** — sources disagree, verify against Shopify's own Help Docs before publishing.
- Shopify sets canonical tags automatically, but generates two possible paths per product (`/products/...` and `/collections/.../products/...`) — verify the canonical consistently points to the `/products/` URL, not something to state as universally guaranteed without a check.
Sources: [innovatrixinfotech.com](https://www.innovatrixinfotech.com/blog/shopify-sitemap-robots-txt-seo-2026), [digitalapplied.com](https://www.digitalapplied.com/blog/shopify-seo-2026-product-page-optimization-guide)

## Shopify structured data / schema (FACT + flag)
Shopify's `structured_data` Liquid filter auto-generates basic Product JSON-LD (name, price, availability, URL) on theme product/article pages. Description, images, GTIN, brand, SKU, reviews, shipping, breadcrumbs, and FAQ schema are NOT included by default and require manual/theme/app work.
Source: [fudge.ai](https://www.fudge.ai/guides/how-to-add-structured-data-in-shopify/)

**Flagged, do not use as-is**: "78% of self-built Shopify stores are missing key schema types" — single low-authority source (SEO content-marketing site), not a primary study. Cut from the workbook or find a citable original.

## Google Keyword Planner (FACT)
Requires a Google Ads account but not an active spend to access the tool itself. Accounts with no active campaign spend see broad volume ranges (e.g., "1K–10K") instead of specific monthly numbers. Workaround exists: create a campaign in Expert Mode without entering payment, then pause it immediately — surfaces more granular data without spending money. Present as a real but slightly clunky workaround, not a guarantee of exact numbers.
Source: [rankdots.com](https://rankdots.com/blog/google-keyword-planner), Google Ads Community thread

## Free / low-cost keyword & SEO tools (FACT, needs a final pre-publish price check — these shift often)
- **Ahrefs Webmaster Tools** — free, full backlink data for domains you verify as your own. Strong recommend for a small Shopify store.
- **Semrush free tier** — capped at 10 requests/day. Useful for occasional spot-checks only, not a research workflow.
- **Ubersuggest** — free tier: 3 queries/day; paid $12–40/mo.
- **Google Trends, Google Search (autocomplete), Google Search Console** — free, no caps relevant to this use case.
Sources: various 2026 tool-comparison roundups (see architecture-proposal.md §4 for the list still to verify directly against vendor pricing pages before publishing).

## AI search / citations (EMERGING PRACTICE — treat carefully)
Found claims: "sites with 32,000+ referring domains are 3.5x more likely to be cited by ChatGPT," "brands are 6.5x more likely to be cited via third-party sources than their own domain," "ChatGPT cites 87.0% of the time but mentions brands in only 20.7% of answers." **All currently trace only to SEO-agency marketing blog content, not a named primary study.** Per the project's no-invented-stats rule: either trace to an original source (e.g., a specific named study) before publishing, or replace with qualitative, hedged guidance and explicitly tell the reader this is an emerging, unstable area — not settled practice like traditional on-page SEO.

Directionally consistent theme across sources worth keeping as **qualitative** guidance (not as a stat): AI answer engines seem to lean on third-party mentions (review sites, comparison content, forums) more than a brand's own site, and citation behavior differs meaningfully by platform (ChatGPT vs. Google AI Overviews vs. Perplexity). Frame as "what practitioners are currently observing," not proven mechanics.

## Social search — the "40% of Gen Z" stat (FACT, but scope must be preserved)
Origin: Google SVP Prabhakar Raghavan, July 2022, referencing an **internal, non-public Google survey of US users aged 18–24**, specifically about **finding a place for lunch** — not general product search. Google confirmed this to TechCrunch at the time. Widely cited since, often over-generalized.
**Workbook usage rule**: if cited at all, must include the original scope (2022, informal internal survey, local/lunch-recommendation context) — never state as "40% of Gen Z uses TikTok instead of Google" without that qualifier.

Separately, more recent (2026) platform-preference data: TikTok used by ~43% of US Gen Z adults as a search starting point vs. ~19% of all adults; YouTube 42% vs. 25%; Instagram 36% vs. 19%. This is a different, better-scoped data point than the Raghavan quote — prefer this framing if a current comparative stat is needed.
Source: [searchengineland.com](https://searchengineland.com/social-search-gen-z-visibility-453502)

## Paid ad testing costs (RECOMMENDATION — do not state as universal fact)
Multiple 2026 marketing-agency sources converge on: Meta technical minimum is $1/day, but $20–50/day is described as the practical floor for meaningful testing data; $50–100+ for Advantage+ campaigns; roughly $200–300/day cited as what's needed to hit Meta's ~50-conversions/week/ad-set learning-phase exit threshold. **None of these are Meta's own published documentation** — they're agency estimates that vary by vertical, AOV, and existing pixel data.
**Workbook usage rule**: do not present a specific dollar figure as fact (per the brief's explicit instruction — no "$5,000 to warm up a pixel" style claims). Use the reader's own numbers via the Customer Acquisition Economics calculator instead; mention the general shape (ad testing requires sustained spend before the algorithm has enough data to optimize) without hard-coding a number.

## Shopify nested/subcollections (FACT — recent, important)
As of **July 16, 2026**, Shopify made nested collections a **native** feature: a parent collection can pull in child collections as a source, and stays live-synced (add a product to the child, it appears in the parent automatically). Before this, stores simulated subcollections via navigation menus, tag-based automated collections, or third-party apps (Power Tools Suite, Search & Discovery app).
**Workbook usage rule**: Section 6 (Site Architecture) can now teach "subcollections" as a real, current Shopify feature — but should flag it as a **recent (mid-2026) addition**, since a lot of existing SEO content and the reader's own past research may describe the old workaround-only reality. Worth a short "New: Shopify added real subcollections in 2026" callout so the reader isn't confused by outdated blog posts.
Source: [sodawebmedia.com](https://www.sodawebmedia.com/insights/shopify-sub-collections/)

## Google FAQ rich results — DEPRECATED (FACT, changes Section 8/20 framing)
Google added a deprecation notice to FAQ structured data docs on **May 7, 2026**, and FAQ rich results **no longer appear in Google Search**; Google stopped checking FAQ markup in June 2026 entirely. The Rich Results Test and Schema Markup Validator remain the two current official testing tools (Rich Results Test = Google-specific eligibility/preview; Schema Markup Validator = generic schema.org validation), but neither will return anything useful for FAQ markup now.
**Workbook usage rule**: This is a real error waiting to happen if unchecked — do NOT tell readers to add FAQ schema "to get rich results in Google." FAQs on product/collection pages are still valuable (for on-page content, AI-assistant readability, and user experience/conversion) but the *Google rich-snippet* motivation is gone as of mid-2026. Reframe FAQ content in Section 8 and the AI Readiness Checklist (Section 20) around AI-assistant/user value, not SERP rich results.
Sources: [getpassionfruit.com](https://www.getpassionfruit.com/blog/what-changed-with-google-drops-faq-rich-results-and-what-to-do-now), [developers.google.com](https://developers.google.com/search/docs/appearance/structured-data)

## Batch 1 verification (Front Matter, Part 0, Part 1, Part 2) — RESOLVED, used in workbook-draft.md

**Google free product listings (Section 1)** — FACT. Eligibility requires: supported country, SSL across the whole domain, visible returns/refund policy, contact info, business name matching domain/Shopify account. Setup: Google Merchant Center account + Google & YouTube sales channel app in Shopify + clean product feed (valid GTIN, accurate Google product category, descriptive titles). No bidding/click cost — genuinely free placement once approved. Used at summary level only in Section 1 (full setup deferred to Toolkit, Section 26).
Source: [Shopify Help Center](https://help.shopify.com/en/manual/promoting-marketing/create-marketing/google/google-listings), [support.google.com/merchants](https://support.google.com/merchants/answer/13692890?hl=en)

**Google Trends (Section 3)** — FACT, confirmed still free and unchanged in function (interest-over-time, seasonal/trend detection). No further verification needed.

**Google Keyword Planner no-spend workaround (Section 3)** — reused from initial research pass, restated in workbook copy: Expert Mode → create campaign without goal guidance → pause immediately, no payment entered. Still current as of this check.

**Bing US search share (Section 3)** — FACT, verified during QC pass on the draft (initial draft used an unverified "5–10%" placeholder figure, corrected). StatCounter 2026 data: ~8.6–9.7% across 2026 monthly readings, all-device US share, with an all-time high of 10.48%; desktop share notably higher (~13%) than mobile (~0.6%). Workbook copy now says "roughly 8–10%... meaningfully higher on desktop than mobile."
Source: StatCounter-derived figures via [bloggerspassion.com](https://bloggerspassion.com/bing-statistics/), [demandsage.com](https://www.demandsage.com/bing-statistics/)

**Shopify password protection as an indexing red flag (Part 0)** — used as the primary Question 1 check instead of "store age," since it's a concrete, common, and high-impact real-world failure mode (Settings → Preferences → password protection). This is standard, long-standing Shopify functionality, not a 2026-specific claim — low risk of having changed, but worth a quick UI-location re-check during the Part 6 draft pass (Section 15/16) since that's where it gets a fuller technical treatment.

## Batch 2 verification (Part 3: Sections 6–9) — RESOLVED, used in workbook-draft.md

**Shopify native nested collections (Section 6)** — FACT, reconfirmed and now used in copy with correct framing: native since July 16, 2026; built via Products → Collections → Add collection → add a source, set source type to "Collection," connect child collection(s). Workbook explicitly tells the reader to disregard older nav-menu/tag-workaround tutorials, and explicitly warns against creating subcollections just because the feature exists.

**Google FAQ rich-result deprecation (Section 8)** — FACT, now applied in copy exactly as the correction required: FAQs kept as a page element for objection-handling/AI-assistant clarity, explicitly *not* pitched as a rich-result tactic, with a plain-language explanation of why (Google stopped supporting/checking FAQ markup for that purpose in 2026).

**Shopify product SEO fields (Section 8)** — FACT. Products → [product] → "Search engine listing preview" → Edit website SEO → Page title (≤70 characters), Description, URL handle. Confirmed current for 2026.
Source: various 2026 Shopify how-to guides consistent with [Shopify Help Center](https://help.shopify.com/en/manual/promoting-marketing/seo/adding-keywords) pattern.

**Shopify collection creation/editing (Sections 6–7)** — FACT. Products → Collections → Add collection → Add title → Add description (rich-text editor) → choose Manual (search/browse products to add) or Automated/Smart (up to 60 conditions) → URL handle auto-generated from title, editable, with an option to redirect the old URL if changed later.
Source: [Shopify Help Center — collection settings](https://help.shopify.com/en/manual/products/collections/collection-settings), [Shopify Help Center — create collection](https://help.shopify.com/en/manual/products/collections/create-collection)

**Shopify image alt text editing (Section 8)** — FACT. Products → [product] → click a media item to open its preview → alt text field → Save. Recommended under ~125 characters since most screen readers truncate around there. Confirmed current for 2026.
Source: [shopify.com/blog/image-alt-text](https://www.shopify.com/blog/image-alt-text), [firstpier.com](https://www.firstpier.com/resources/alt-text-shopify)

**Shopify native FAQ capability (Section 8)** — FACT. Metafields are free and built into every Shopify plan — no app required to create question/answer metafields and connect them to a theme block via the theme editor's "dynamic source" option. Metaobjects offer a more advanced setup for per-product FAQ lists. A dedicated FAQ block app exists as an optional, lower-effort alternative for a polished UI, but isn't required — workbook copy presents the app as optional, not necessary.
Source: [community.shopify.com](https://community.shopify.com/t/how-to-dynamically-populate-product-faqs-using-shopify-metafields-and-liquid/417394), [easyappsecom.com](https://easyappsecom.com/guides/shopify-metafields-guide)

## Batch 3 verification (Part 4: Sections 10–12) — RESOLVED, used in workbook-draft.md

**"People Also Ask" status in 2026 (Section 12)** — FACT. Still an active SERP feature (Google shows 37 distinct SERP features in the US as of 2026, PAA among them), but its content is now largely AI-generated and its on-page prominence has been pushed down by AI Overviews taking the top position. Workbook copy reflects this accurately: "still an active feature... AI Overviews now often take the more prominent spot... treat it as one signal, not the whole picture." Did not cite the "6.6% of search results" figure found alongside this — didn't meet the new editorial bar (doesn't change what the reader should do) even though it came from a seemingly reasonable source.
Source: [growbydata.com](https://growbydata.com/google-serp-features/), [getfoundquick.com](https://www.getfoundquick.com/google-is-answering-people-also-ask-serp-features-with-ai-generated-content/)

**Reddit visibility in Google search (Section 12)** — PARTIAL FACT, handled cautiously per the new editorial rule. The underlying mechanism is well-documented and safe to state: Google signed a paid data-partnership with Reddit (Feb 2024) giving it deeper/faster crawling access, and Reddit threads now appear prominently in Google results, especially for comparison/advice-style queries. **Did not use** the specific multipliers found in secondary sources ("1,328% visibility increase," "42% of product comparison and advice queries," "top 4–5 most visible domain") — these trace only to SEO-agency blog posts, not a primary/verifiable source, and per the new rule, a precise-sounding number that doesn't change the reader's action isn't worth the citation risk. Workbook copy states the qualitative point only (Reddit is a genuinely useful source for real customer language and recurring questions; a busy thread is evidence people discuss something, not proof of Google search volume) without attaching an unverifiable percentage to it.

## Batch 4 verification (Part 5: Sections 13–14) — RESOLVED, used in workbook-draft.md

**Title tag truncation/rewriting behavior (Section 13)** — FACT. Google truncates by pixel width (~580–600px desktop), not a strict character count — roughly 50–60 characters is a practical proxy, more allowance on mobile. Google rewrites titles when they're too long, keyword-stuffed, boilerplate, or when it judges the H1/page content a better match for the query. Workbook copy deliberately avoids stating a hard character rule, framing length as "keep the important part near the front" rather than a cutoff to engineer around — matches the instruction against rigid character-count superstition.
Source: search-aggregated 2026 title-tag guides (seo-king.co.uk, zyppy.com) — directionally consistent across sources on the pixel-width mechanism specifically, which is the load-bearing claim used in copy; the "50-60 char" framing is presented as a rule of thumb, not a fact, consistent with how it's sourced.

**Meta description NOT a ranking factor (Section 13)** — FACT, long-standing and reaffirmed through 2026 (originally stated by Google in 2009). Used in copy exactly as instructed: explicitly stated as non-ranking, with CTR/indirect value explained honestly, and the Google-rewrites-it-anyway behavior included.

**Shopify image delivery (Section 13)** — FACT. Shopify's CDN (Cloudflare-backed) auto-serves modern smaller formats (e.g., WebP) to supporting browsers and resizes images, but doesn't aggressively compress — the merchant still benefits from uploading reasonably sized files. Most themes support lazy-loading for below-fold images by default. Used to explain why the workbook doesn't teach manual image-compression tooling as a core exercise (Shopify handles most of it) while still telling the reader they control input quality.
Source: 2026 Shopify image-optimization guides (mgroupweb.com, ontapgroup.com) — consistent across sources on the CDN/WebP/lazy-load mechanics used in copy.

## Batch 5 verification (Part 6: Sections 15–17) — mostly RESOLVED, one item still genuinely ambiguous

**robots.txt.liquid editing scope — STILL UNRESOLVED, handled editorially rather than asserted.** One secondary source claims Plus-only with non-Plus stores limited to noindex tags; the official Shopify Help Center page describes the customization process (add robots.txt.liquid via the theme code editor, explicitly flagged as "unsupported") without stating a plan restriction in the retrieved excerpt. Sources disagree and neither is a clean primary-source confirmation either way. **Editorial decision**: since this section's actual advice is "don't touch this unless you have a specific reason" regardless of who technically can, the workbook copy sidesteps the plan-gating question entirely — it explains what robots.txt does, that Shopify's default is sound, and that customizing it requires theme code editing and is officially unsupported, without asserting which plans can access it. This avoids publishing an unverified claim while still fully serving the reader. **Flag for a real fact-check pass before final publish** — worth a direct look at current Shopify Help Center content (not secondary blog summaries) to resolve definitively, since a future edition might want to state the plan scope explicitly.

**Shopify noindex mechanics (Section 15)** — FACT. Standalone Pages have a native, no-code "Hide page from search engines" toggle under Online Store → Pages → [page] → Visibility. Products and collections have no equivalent one-click toggle — hiding one requires a theme.liquid code snippet checking page handle/template. Used this distinction to explain why accidental Page-noindexing is a real (checkable) risk while accidental product-noindexing is rarer for non-technical merchants.
Source: [help.shopify.com](https://help.shopify.com/en/manual/promoting-marketing/seo/hide-a-page-from-search-engines), corroborated by multiple 2026 how-to guides on the code-snippet method for products.

**Shopify URL Redirects (Section 15)** — FACT. Native feature, "Redirect from"/"Redirect to" fields, takes effect immediately. Current admin location is Content → Menus → View URL Redirects, but multiple sources note Shopify's admin navigation labeling has shifted across rollouts — workbook copy explicitly hedges this ("search 'redirect' in your admin's search bar if you can't find it") rather than presenting one exact path as permanent, per the UI-freshness instruction.
Source: [help.shopify.com/en/manual/online-store/menus-and-links/url-redirect](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)

**GSC verification for Shopify domains (Section 16)** — FACT. Domain-property verification via DNS TXT record is the recommended method. Two paths depending on where the domain was purchased: (1) domain bought through Shopify → add the TXT record directly in Shopify admin under Settings → Domains → [domain] → DNS settings, no external login needed; (2) domain bought elsewhere and pointed at Shopify → add the TXT record at the external registrar. DNS propagation can take minutes to 48 hours. Both paths now reflected in workbook copy.
Source: [support.google.com/webmasters](https://support.google.com/webmasters/answer/9008080?hl=en), [help.shopify.com — verify domain ownership](https://help.shopify.com/en/manual/your-account/users/security/advanced-security-features/verify-domain)

**Shopify sitemap structure (Section 16)** — FACT. `sitemap.xml` is a sitemap *index* file referencing sub-sitemaps (products, collections, pages, blogs), auto-split once a sub-sitemap exceeds 5,000 URLs. Only `sitemap.xml` should be submitted to Search Console — submitting numbered sub-sitemaps individually can cause duplicate processing/indexing delays. This is now an explicit warning in the workbook (a genuinely common beginner mistake).
Source: multiple 2026 Shopify sitemap guides, consistent on the 5,000-URL auto-split behavior and the submit-only-the-index-file guidance.

**PageSpeed Insights lab vs. field data (Section 17)** — FACT. Still free, still available in 2026. Lab data = one-time simulated test, good for debugging specific issues. Field data = real 28-day rolling Chrome User Experience Report (CrUX) data from actual visitors, closer to what actually matters, but may not exist yet for a new/low-traffic store. Used to explain why a new store might see "no field data available" without treating it as an error.
Source: [developers.google.com/speed/docs/insights/v5/about](https://developers.google.com/speed/docs/insights/v5/about)

## Batch 6 verification (Part 7: Section 18; Part 8: Sections 19–20) — RESOLVED, with several deliberate exclusions

**TikTok search signals (Section 18)** — PARTIAL FACT, handled cautiously. Real, corroborated pattern: TikTok's search reads caption text, on-screen text, and audio/spoken content, and cross-references them to categorize a video. **Excluded**: precise-sounding figures found alongside this ("triple-mentions rank 2–3x better," "first 50/150 characters matter most") — these trace only to SEO-agency blogs with no visible methodology, not TikTok's own documentation, and don't materially change the reader's action (say the topic across audio/text/caption either way). Kept the mechanism, dropped the manufactured precision — consistent with the Batch 3/5 editorial standard.
Source pattern consistent across multiple 2026 TikTok-SEO guides on the three-signal mechanism specifically.

**Instagram hashtags vs. captions (Section 18)** — FACT, well-corroborated across independent sources. Instagram has shifted toward caption/alt-text/keyword-based discovery; hashtag impact on reach has declined; current practitioner guidance clusters around 3–5 relevant hashtags rather than the old "use up to 30" advice. Presented in copy as "reasonable practice," not officially documented Meta policy, since no source produced an actual Meta statement.

**YouTube ranking signals (Section 18)** — PARTIAL FACT, same treatment as TikTok. Real, corroborated pattern: title, description, and transcript/caption accuracy all feed YouTube's understanding of a video, and CTR + watch time matter significantly. **Excluded**: precise stats found ("200+ word minimum description," "94% of top-3 videos have full transcripts," "keyword in first 5 words of title") — same reasoning, agency-blog sourcing without visible methodology, dropped in favor of the qualitative, defensible pattern.

**Hashtag platform divergence (Section 18)** — FACT, multi-source corroborated: TikTok still uses hashtags meaningfully for FYP categorization; Instagram has moved away from hashtag-driven discovery toward captions/keywords. Used directly to build the "platform-documented / reasonable practice / internet lore" framework requested — this framework is itself now a reusable teaching device for the whole section, distinguishing verifiable platform behavior from repeated-but-unconfirmed advice.

**AI assistant landscape and commerce features (Section 19)** — FACT. ChatGPT, Google's AI-powered search experiences, Perplexity, and Microsoft Copilot are the four systems used in copy, matching what a Shopify owner might realistically encounter. Real, verifiable 2026 developments: Microsoft Copilot has shipped shopping/comparison features with Copilot Checkout (merchant infrastructure including PayPal), ChatGPT has Instant Checkout and shopping-research/comparison features — both used only to establish that AI-mediated shopping is now a real transactional channel, not a hypothetical, without claiming any specific optimization tactic influences these systems.
**Excluded**: a precise-sounding citation-source-preference statistic ("ChatGPT leans on Wikipedia 47.9% of citations, Perplexity on Reddit 46.7%, Google AI Overviews on YouTube 23.3%") — single-source, methodology not visible, and the actionable takeaway (different systems favor different source types, pursue broad third-party presence rather than gaming one source) survives perfectly well without the specific percentages. Kept only the directional point: these systems are architecturally different from each other, not interchangeable.

**GEO/AEO terminology fluidity (Section 19)** — FACT, well-corroborated including a Wikipedia entry and an eMarketer explainer alongside practitioner sources: no standardized, consensus definition exists across GEO/AEO/LLMO/AIO as of 2026; terms are used interchangeably by some, distinguished differently by others. This is the one place in this batch where the "no consensus" finding *is* the useful fact — directly supports the instruction not to present one acronym as settled science.

## Batch 8 verification (Sections 26–28 + final QC) 

**Tool pricing pass (Section 26)** — FACT, verified this session: AnswerThePublic (free tier ~3 searches/day, paid from ~$20/mo), Screaming Frog (free to 500 URLs, paid license ~£259/year), Moz (30-day free trial, entry pricing ~$99/mo), Keywords Everywhere (freemium, paid credit packs from ~$10). Combined with previously-verified GSC/Trends/Keyword Planner/Ahrefs Webmaster Tools/Semrush/Ubersuggest/PageSpeed Insights/Rich Results Test/Bing Webmaster Tools/Google free listings. Per your instruction, exact dollar figures were mostly kept out of the customer-facing copy itself (Free/Freemium/Paid + a "start here/optional" framing instead) since pricing dates quickly — the verified numbers live here for the pre-publish pricing check, not hard-coded into Section 26's tables.

**$299 product terms (Section 28) — RESOLVED, with one flagged inconsistency.** Verified directly against this repo (not web research): price is consistently **$299** across `website/index.html`, `terms.html`, and `methodology/discover.md`. **Naming conflict found and not yet resolved in the source repo itself**: the live website (the actual customer-facing sales page) calls it the **"SEO Site Audit"**; the methodology docs and the rendered report's own branding call it the **"Organic Search Opportunity Report."** These are the same product under two different names in two different places. Workbook copy in Section 28 uses **"SEO Site Audit"** since that's what a reader would actually encounter on the real purchase page — but **this naming conflict needs a real decision from the product owner**, independent of this workbook, since it affects the live site too.

**$999 product — NOT RESOLVED, handled per your explicit direction.** Confirmed via direct repo search: no scope, deliverables, or finalized price exist anywhere for this product. `current-state.md` calls it the "$999 DIY product" while this workbook's own planning docs called it "$999 Implementation" — contradictory names for opposite delivery models, which was itself a sign this hadn't been decided yet. Per your direction: Section 28's Path 3 now names no price, no product name, and no specific deliverables — generic "implementation support... Scrolly is building out" language only, with an explicit **[PRODUCT OWNER REVIEW REQUIRED]** flag inline in the workbook copy itself. Section 28 is not publication-ready until this is resolved with a real offer.

## FINAL RESEARCH-FLAG STATUS (as of end of Batch 8)

**RESOLVED — used confidently in copy:**
- Shopify native nested collections (July 16, 2026)
- Google FAQ rich-result deprecation (May–June 2026)
- Google free product listings requirements
- Google Trends, Keyword Planner no-spend workaround
- Bing US search share (~8–10%)
- Shopify product/collection SEO field locations, alt-text editing, native FAQ metafields
- Title tag pixel-width truncation behavior, meta description non-ranking status
- Shopify image CDN/WebP/lazy-load behavior
- Shopify noindex mechanics, URL Redirects feature, sitemap-index structure (submit only sitemap.xml)
- GSC domain verification (both DNS paths)
- PageSpeed Insights lab vs. field data
- TikTok/Instagram/YouTube signal mechanisms, hashtag platform divergence
- Current AI assistant landscape and real 2026 commerce features (Copilot Checkout, ChatGPT Instant Checkout)
- GEO/AEO terminology fluidity (no industry consensus)
- Section 26 tool pricing/availability (this batch)
- $299 product price (this batch, via repo — not web research)

**STILL NEEDS FINAL VERIFICATION before publish:**
- **Shopify `robots.txt.liquid` plan-gating** (all stores vs. Plus) — genuinely unresolved after two research passes; handled editorially (the section's advice doesn't depend on the answer), but a direct primary-source check is still owed before final publish.
- **All Section 26 tool pricing** — deliberately time-sensitive by nature; needs a fresh check immediately before the workbook actually goes to print/sale, not just once during drafting.
- **The $299 product naming conflict** ("SEO Site Audit" vs. "Organic Search Opportunity Report") — needs a product-owner decision, not a research task.
- **The $999 product** — needs to be fully defined (name, price, scope, deliverables, exclusions) before Section 28's Path 3 placeholder can be replaced with real copy.

**EXCLUDED CLAIMS — deliberately not used anywhere in the workbook, per the "useful fact > impressive number" rule:**
- Shopify schema-gap "78% of self-built stores missing key schema types" (single low-authority source)
- AI-citation multipliers: "3.5x more likely to be cited," "6.5x third-party citation preference," "87% ChatGPT citation rate" (agency-blog sourced, no visible methodology)
- TikTok "triple-mentions rank 2–3x better," "first 50/150 characters matter most" (same issue)
- YouTube "200+ word minimum description," "94% of top-3 videos have transcripts," "keyword in first 5 words" (same issue)
- AI citation source-preference percentages by platform ("ChatGPT leans on Wikipedia 47.9%," etc.) — single-source, no visible methodology
- The 2022 "40% of Gen Z uses TikTok instead of Google" stat, used outside its actual scope (local/lunch-recommendation context only) — the better-scoped 2026 platform-preference figures (43%/42%/36%) were used instead where a comparative stat was needed

## Post-QC addition: Section 9, Google Product Visibility (Merchant Center & Free Listings)

Inserted between the (former) Section 8 Product Page SEO and (former) Section 9 Collection Page SEO — Sections 9–28 renumbered to 10–29 throughout the document as a result (mechanical renumbering done via a single-pass regex script, then manually corrected for two ranges that crossed the old 8/9 boundary and would otherwise have silently misrepresented the range — see below).

**Shopify → Google Merchant Center connection (FACT)** — via Shopify admin: Sales channels (+) → search "Google & YouTube" → add channel → connect a Google account (business account recommended over personal Gmail) → domain auto-verified via an automatically-added meta tag (no manual code editing) → confirm shipping zones → first feed sync takes hours up to ~24h → disapproval review can take several business days. No Google Ads account required for free listings specifically.
Source: multiple 2026 setup guides, consistent on the seven-step mechanism.

**Free listings eligibility (FACT)** — free, unpaid organic placements powered by Merchant Center data; can appear across Google Search, Shopping tab, Google Images, Google Lens, Google Maps, YouTube, and Google's AI-powered search experiences. Requirements: Merchant Center account, policy compliance (prohibited/restricted content, site requirements), supported country, **business verification required** (unverified accounts don't appear), accurate/complete shipping info, core store policies (returns, contact info) clearly displayed. Free listings are typically on by default once eligible; no bidding/budget involved.
Source: [support.google.com/merchants/answer/13692890](https://support.google.com/merchants/answer/13692890?hl=en), [support.google.com/merchants/answer/13889434](https://support.google.com/merchants/answer/13889434?hl=en)

**Product identifiers — GTIN/MPN/brand (FACT, important correctness point)** — GTIN required/strongly recommended when a manufacturer has assigned one; never fabricate one. For products with genuinely no manufacturer GTIN (handmade, custom, small-batch — directly applicable to the Juniper Lane candle example), the correct mechanism is submitting `identifier_exists = false`, not inventing a number. Misusing this flag on a product that *does* have a real identifier (Google cross-checks title/brand/MPN against its own database) risks account-level warnings or suspension — used to justify the "never fabricate, never misuse the exemption either" framing in the workbook.
Source: [support.google.com/merchants/answer/6324461](https://support.google.com/merchants/answer/6324461?hl=en), [support.google.com/merchants/answer/6324478](https://support.google.com/merchants/answer/6324478?hl=en)

**Merchant Center Next / current diagnostics terminology (FACT, UI-freshness correction)** — the classic "Diagnostics" tab referenced in older tutorials no longer exists; all retailers were migrated to Merchant Center Next by September 2024. Current path: Products → Needs attention, with issues ranked by click-potential (High/Medium/Low) rather than raw error count. Explicitly flagged in the workbook copy itself ("older tutorials calling this 'Diagnostics' are describing a retired interface") so this doesn't read as a generic screenshot caption that goes stale unnoticed.
Source: [developers.google.com/shopping-content/guides/how-tos/severity-mapping](https://developers.google.com/shopping-content/guides/how-tos/severity-mapping), multiple 2026 disapproval-troubleshooting guides consistent on the Next migration and current tab location.

**Renumbering QC note**: two references originally read as ranges spanning the old Section 8–9 boundary ("Section 8–9" in two places) — a blind mechanical shift would have silently turned these into "Section 8–10," which reads as a contiguous range that incorrectly sweeps in the new, unrelated Section 9. Caught and hand-corrected to "Sections 8 and 10" / "Sections 8, 10, and 13" respectively. All other en-dash ranges in the document had both endpoints on the same side of the boundary (both ≤8 or both ≥9) and shifted correctly without manual intervention. `final-toc-asset-map.md` was **not** renumbered — it now reflects the pre-Section-9-insertion architecture and should be treated as superseded by `workbook-draft.md`'s actual section numbers going forward, or refreshed in a later pass if it needs to remain a living reference.

## Open verification items before drafting (carried into architecture-proposal.md §4, still open for later batches)
- Shopify robots.txt.liquid plan-gating (all stores vs. Plus) — genuinely unresolved after two research passes; handled editorially in Section 15 (see above) by not asserting a plan restriction either way. Worth a direct primary-source check before final publish, not blocking for now since the section's advice doesn't depend on resolving it.
- Final pricing check on every named tool immediately before publish — needed for Section 26
- Trace or cut: AI citation multipliers, Shopify schema-gap 78% stat — needed for Sections 19, 20 (schema-gap stat successfully avoided in Sections 8 and 17 already — confirms the cut decision was correct and workable in practice)
- Shopify structured_data Liquid filter defaults (name/price/availability/URL auto-generated; description/images/GTIN/brand/SKU/reviews/breadcrumbs need manual/app work) — carried from initial pass, referenced at a conceptual level in Section 17 ("Shopify themes generate basic product structured data automatically") without the granular field-by-field breakdown; may be worth surfacing in Section 20 if AI-readiness content needs it
