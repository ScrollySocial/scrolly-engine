# Report Contract (Permanent — V1.1)

**This is a permanent output contract.** It applies to every SEO Discovery Report this system generates, regardless of client, mode, or which methodology file changed most recently. [discover.md](discover.md) governs *what to analyze* (the O1–O10 Opportunity Engine + A–N Supporting Audit) and *how to judge it*; [discover-engine.md](discover-engine.md) governs *how/where the work happens*; this file governs *what the finished report and appendix must contain and how they must be organized*, independent of which data sources or agents produced the underlying evidence.

**The finished report must function as a complete organic-growth decision document for a business owner** — not a raw audit, keyword export, or research memo.

**Cross-reference style note:** sections in this file are referenced elsewhere by name, not by number. Numbers below are for readability and sequencing only — they are expected to shift as sections are inserted over time (this revision itself inserted five new sections). Never assume a numbered reference from an older file version still points to the same section; match by name.

## Core Rule — Later Research Enriches, Never Replaces

**Later research stages must enrich earlier analysis, never replace it.** This is the single most important rule in this file, added after a concrete failure: an expanded-keyword-research round compressed a prior engagement's technical, competitor, backlink, and site-structure findings down to two summary bullets in the client report — the underlying findings still existed in `findings.md`, but the report itself silently dropped them. **Every required analysis must survive through final report generation unless newer evidence directly invalidates it.**

Concretely: `findings.md` is append-only across rounds within an engagement. Report generation (Step 13 in [discover-engine.md](discover-engine.md)) must render *every* category's full findings into the report — Technical (FIX NOW/IMPROVE/PASSED, itemized), Competitive Landscape (per-competitor detail), Backlink/Authority (classified), Local/GBP — not a prose summary standing in for them. A prose summary is not itemized detail. "Main report = decisions" (below) means the appendix doesn't have to duplicate raw evidence twice, not that the main report can compress FIX NOW/IMPROVE/PASSED items or per-competitor findings into a couple of sentences. Each itemized finding *is* a decision (a fix, a priority, an action) — that's exactly what belongs in the main report, in full, not summarized away.

If data is unavailable for a required analysis:
1. Keep the section.
2. State what was tested.
3. State what was confirmed.
4. State what could not be verified.
5. State what additional data/access is required to resolve it.
6. Never invent or estimate evidence unless clearly labeled as a scenario or inference.

**A report fails this contract if it silently omits a required module because:** later keyword research was deeper · API/data-source funding or credits ran out · some data was unavailable · one agent or processing stage overwrote another's output · the report was shortened for readability · another methodology revision occurred. **None of those are valid reasons to drop a module.** Missing *data* may be marked Pending. Missing *required sections* are never acceptable — see the Final Quality Gate at the end of this file.

If new evidence contradicts old evidence: preserve the discrepancy, determine which source is more reliable/current, explain the update in the report, and replace the *conclusion* only when justified by the evidence. **Never silently overwrite a finding.**

---

## A. Required Pre-Report Intake

Before opportunity analysis, create or consume a structured client-context record. This is the report-facing superset of [discover.md](discover.md) O1's Business/Inventory Map and O2's Geographic Opportunity Map — **only the domain and physical location (if local) are a hard requirement per O1's absolute-minimum rule; everything else below is captured when available and never blocks the report:**

- Primary products/services.
- Products/services explicitly NOT offered.
- Highest-priority products/services.
- Geographic/service areas.
- Target customers.
- Business model.
- Main desired outcome: calls, leads, bookings, store visits, ecommerce sales, revenue, awareness, etc.
- Approximate customer/project/order value, when provided.
- Current marketing channels.
- Current marketing budget, when provided.
- Known business constraints.
- Seasonality.
- Brand/business-structure considerations.
- Existing website/domain(s).
- Google Business Profile access/status.
- Google Search Console access/status.
- GA4 access/status.
- Existing call/form/conversion tracking.
- Known competitors supplied by the client.

Use this context to classify every recommendation as one of exactly three states. These map directly onto [discover.md](discover.md)'s `relevance_classification` field:

| Report-facing label | `relevance_classification` value |
|---|---|
| **Confirmed Opportunity** — the business definitely offers and wants to pursue this | `CONFIRMED RELEVANCE` |
| **Potential Opportunity / Verify Offering** — demand exists, but offering/inventory/geography/business fit needs verification | `POTENTIAL RELEVANCE — VERIFY OFFERING` |
| **Not Relevant / Not Recommended** — the opportunity does not match the client's actual business or strategy | `IRRELEVANT / EXCLUDE` |

**Never recommend a product, service, city, or category solely because keyword demand exists.**

---

## B. Report Design Principles

**The first 60–90 seconds must communicate the value.** The Executive Summary and Scorecard must let the client quickly understand: what's currently working, what's currently hurting them, where the largest opportunity exists, what should be done first, roughly how difficult the opportunity is, and whether organic search is worth investing in.

**Main report = decisions.** Concise, visual, high in decision density — but "concise" governs prose, not itemized findings. **Appendix = depth and evidence.** Large keyword tables, 100–400 content opportunities, supporting SERP evidence, and full research documentation belong primarily in the appendix; the main report still carries the full itemized Technical, Competitive, and Backlink findings per the Core Rule above.

**Do not make the client interpret raw SEO data. Translate evidence into decisions.**

---

## 1. Executive Opportunity Summary

Plain-English assessment containing:
- Biggest organic-search opportunity.
- Biggest current weakness.
- Strongest existing SEO advantage.
- Best near-term win.
- Highest-value long-term opportunity.
- Overall recommendation: **Go / Selective Go / Hold / No-Go.**
- Important risks or dependencies.

Include a visual/scannable **SEO scorecard** covering at minimum:
- Technical SEO (Category H)
- Website architecture (Category C)
- On-page SEO (Category D)
- Organic visibility (Category A)
- Local visibility, when applicable (Category I)
- Google Business Profile/local ecosystem (Category I)
- Keyword opportunity (O3/O4)
- Content opportunity (O9)
- Competition (Category A)
- Backlinks/authority (Category G)
- Organic conversion readiness (Category L)
- Analytics/measurement readiness (Category K)
- AI discovery/readiness (Category M)

Each area gets a clear client-friendly status (e.g., Strong / Needs Work / Critical Gap / Not Evaluated) — qualitative, per [discover.md](discover.md)'s no-fake-precision rule.

## 2. Current Wins

**Never produce a report containing only weaknesses.** Evaluate:
- Existing organic rankings.
- Local Pack / Maps rankings.
- Strong geographic markets.
- Pages already generating visibility.
- Existing keyword positions.
- Successful service/product categories.
- Technical elements that pass.
- Useful backlinks/authority.
- Review or reputation strengths.
- Existing content worth protecting.
- SERP features already captured.

For every meaningful win: what is winning · where · which query/page/market is involved · why it matters · how to protect or expand it.

## 3. Technical SEO Analysis

**A real, itemized audit — never replaced by a short summary.** A line like *"technical foundation is largely sound"* is not a substitute for this section under any circumstance, including when a later research round (e.g., expanded keyword work) is the more recent thing that got analyzed — see the Core Rule above. Evaluate everything technically inspectable through the available tools (per [discover.md](discover.md) Category H).

**Crawlability/indexation:** robots.txt · XML sitemap · sitemap accessibility · noindex directives · canonical tags · canonical conflicts · redirects · redirect chains/loops · 3XX issues · 4XX errors · 5XX errors · crawl failures · duplicate URL/indexation problems · important unindexed pages · blocked pages/resources · orphan-page signals when detectable · HTTP/HTTPS consistency.

**Technical fundamentals:** HTTPS · HTTP→HTTPS · www/non-www consolidation · canonical domain consistency · rendering · mobile usability.

**On-page technical elements:** title tags · meta descriptions · H1 count · heading hierarchy · URLs · internal linking · broken internal links · broken external links · image alt text · structured data/schema · duplicate metadata · missing metadata · image/asset issues.

Present findings in four categories — **never remove a PASSED finding just because problems were also found:**
- **FIX NOW** — confirmed issues requiring action.
- **IMPROVE** — optimization opportunities that aren't critical failures.
- **PASSED** — important checks currently healthy.
- **NOT EVALUATED / DATA NEEDED** — tests that could not be completed.

Each problem: Issue · Severity · Evidence · Page(s) affected · Why it matters · Recommended fix · Priority. **This full itemized table renders in the main report, not only the appendix** — see the Core Rule.

## 4. Lighthouse / Performance Error Analysis

**Permanent required technical processing step**, distinct from the general technical audit above. Run Lighthouse (or an equivalent available diagnostic, e.g. PageSpeed Insights when the paid tool is unavailable) on **representative important pages, not just the homepage.** At minimum, test appropriate examples of: homepage · main service/product page · category page · important location page · blog/article · major organic landing page · product page for ecommerce sites. **Do not assume homepage results represent every page/template.**

Capture: **Lighthouse category scores** (Performance, Accessibility, Best Practices, SEO); **performance metrics where available** (LCP, INP, CLS, FCP, TBT, Speed Index, TTFB); and **the actual failed audits, errors, warnings, opportunities, and diagnostics** — never report only the score.

Actively check for: render-blocking resources · unused JavaScript/CSS · excessive JS execution · large bundles · main-thread blocking/long tasks · excessive DOM size · slow server response · oversized/improperly-sized images · compression problems · modern image-format opportunities · missing image dimensions · lazy-loading issues · font-loading problems · excessive third-party scripts · caching issues · network dependency chains · excessive redirects · layout shifts · slow LCP elements · mobile usability problems.

Classify severity: **Critical · High · Medium · Low · Informational.** Classify scope: **Site-wide · Template-wide · Page-type specific · Individual-page specific** — a template problem affecting hundreds of pages carries more weight than the same issue on one minor URL, and the report must say so explicitly.

## 5. Analytics & Measurement Readiness

([discover.md](discover.md) Category K — always in scope, not conditional on mode.) Evaluate whether the business can currently *measure* organic-search performance. **Never assume analytics are correct merely because GA4/GSC exist — verify, don't assume.**

**Google Search Console, when accessible:** property verification · clicks · impressions · queries · pages · indexing/coverage · sitemap status · crawl/indexation issues · manual actions/security issues when available.

**GA4, when accessible:** correct installation · duplicate tags · configuration problems · event tracking · conversions/key events · attribution problems.

**Lead measurement — can the business track:** forms · calls · bookings · purchases · quote requests · other primary business conversions.

Explicitly identify measurement gaps, broken tracking, missing tracking, and data-quality concerns.

## 6. Website Structure & Page Architecture

Evaluate whether the current structure can capture discovered search demand ([discover.md](discover.md) Category C + O4 Money Pages).

**Current structure:** important existing URLs/pages and what each appears to target.

**Recommended structure:** every significant page that should be Created · Retained · Updated/Expanded · Rewritten · Consolidated · Redirected · Repositioned.

For each recommended page: Page · Existing or new · Recommended URL · Primary keyword · Supporting keyword cluster · Intent · Business purpose · Geographic target when relevant · Priority · Existing URL affected.

**Do not treat "page recommendations" as synonymous with "new pages."** Also specify important page *sections* that should be added/changed: services · products · categories · pricing/cost · FAQs · process · service areas · inventory · reviews/testimonials · trust signals · credentials · guarantees · about/expertise · CTAs · internal links · comparison content · related resources.

## 7. Keyword Opportunity Analysis

Cluster related keywords — never dump individual phrases into the main report (that belongs in Section 14, the appendix). For each major cluster ([discover.md](discover.md) O4 Money Page schema): Primary keyword · Supporting keywords · Search intent · Funnel stage · Search demand · Geographic relevance · Current visibility · Organic/keyword difficulty · SERP competition · Business value · Recommended target page · Priority · Confidence/data source.

Separate **CONFIRMED OPPORTUNITIES** from **POTENTIAL OPPORTUNITIES / VERIFY OFFERING** per Section A's classification. Never imply the client sells something unconfirmed.

## 8. Keyword Competition & Expected Ranking Difficulty

For each major money-page cluster ([discover.md](discover.md) O5): who currently ranks · type of domains ranking · competitor authority when measurable · content quality/depth · local competitors · review gaps · backlink gaps · site-structure advantages · keyword difficulty metrics when available.

Client-friendly difficulty: **Low · Low–Moderate · Moderate · Moderate–High · High · Very High.**

Realistic ranking ranges where evidence permits — early measurable movement · possible first-page timeframe · possible top-three timeframe — as **range-based, evidence-based scenarios. Never guarantee ranking dates.** Account for: current position · existing authority · site age/history when known · competition · search intent · local vs. national SERP · technical condition · content requirements · backlink requirements · implementation pace. **Explain the assumptions.**

## 9. SERP Composition, AI Overviews & Zero-Click Risk

For priority keyword groups, inspect the actual modern SERP layout (per [discover.md](discover.md) Category A's AI-Overview/zero-click requirement). Identify when present: AI Overviews · Local Pack · featured snippets · People Also Ask · videos · images · shopping/product results · forums · Reddit/social results · direct-answer features · traditional blue links.

Explain how SERP composition changes: expected organic CTR · content strategy · Local Pack importance · snippet/answer-winning opportunity · traffic forecasts.

**Do not treat identical search volume as identical traffic opportunity when SERP layouts differ materially.**

## 10. Competitive Landscape

Identify the businesses/domains that actually compete in search — **do not assume offline competitors and Google competitors are identical.** Separate by business line where appropriate, per [discover.md](discover.md) Category A's corrected selection rule (organic capture, not recall of prior local-pack appearance).

For significant competitors, where possible: repeated SERP presence · ranking keywords · ranking pages · site structure · content strategy · geographic strategy · reviews · Local Pack presence · backlinks · authority · strengths · weaknesses. **Do not reduce competitor analysis to a few isolated mentions.**

Include **WHY THEY ARE WINNING** and **HOW THE CLIENT CAN COMPETE.** The client should understand why another company currently outranks them.

## 11. Google Business Profile & Local Search

Dedicated local SEO analysis for businesses with meaningful local intent ([discover.md](discover.md) Category I + O2). **If direct GBP access is unavailable, retain this section and state exactly what could and could not be verified** — never drop it.

**GBP configuration, when accessible:** primary category · secondary categories · description · products · services · attributes · hours · service areas · photos · videos · posts · Q&A · messaging · business information completeness.

**Reviews:** review count · rating · review velocity · recent activity · response rate · response quality/consistency · competitor review gaps.

**NAP/citations:** name/address/phone consistency · major directory presence · citation gaps · duplicate listings · incorrect listings · relevant local directories.

**Geographic search:** Local Pack visibility · city-level differences · service-area opportunities · expansion markets · location-page potential.

Classify markets ([discover.md](discover.md) O2 Geographic Market `classification`): **Core · High Priority · Secondary · Expansion · Monitor · Not Recommended.** Never recommend thin doorway pages.

## 12. Organic Conversion Readiness

([discover.md](discover.md) Category L.) Whether high-value pages can convert the organic traffic they'd receive. Per major money page: CTA clarity/prominence · click-to-call/phone prominence · forms and form friction · booking flow · reviews/testimonials/credentials/guarantees/trust signals · about/expertise · product/service clarity · location/service-area clarity · pricing/cost information where appropriate · visual proof · mobile conversion friction · overall user journey.

Identify obvious traffic-leak points. **Focused SEO ROI/conversion review — not a full CRO engagement.**

## 13. Blog & Informational Content Opportunity

Identify the complete realistic informational-search opportunity ([discover.md](discover.md) O9). **Do not decide posting cadence before determining the legitimate opportunity universe.**

**What to publish first:** an exact prioritized launch list of approximately 10–30 articles. Each: Recommended topic/title · Primary keyword · Supporting cluster · Search intent · Funnel stage · Related money page · Search demand · Difficulty/competition · Why it matters (strategic purpose) · Priority.

## 14. Full Content Map — Appendix Requirement

Deliberately attempt to build a comprehensive content opportunity map. **Target: approximately 100–400 defensible page/article opportunities when sufficient opportunity exists.** Research multiple discovery paths before concluding the topic universe is small: keyword expansion · competitor ranking keywords · competitor content · People Also Ask · search suggestions · question modifiers · cost queries · comparisons · alternatives · product/service variants · use cases · problem queries · location-specific informational queries · seasonal searches · buying guides · FAQ clusters · industry terminology.

**Do not conclude the opportunity is small after one narrow or interrupted keyword pull.** If a research round was cut short (e.g., a data source ran out of funding/credits, or only free/manual evidence was available), the resulting smaller topic count is a **research-completeness gap, not a finding about the true opportunity size** — label it "Pending further research," not "the full opportunity." Research broadly enough to determine the actual content universe before concluding it's small.

**DO NOT PAD THE LIST.** If thorough, *complete* research identifies only 76 defensible opportunities, report 76 — consistent with [discover.md](discover.md) O9's "size to what evidence supports" rule. The distinction that matters: report the honestly-researched number, and separately flag if the research itself was incomplete.

Each opportunity, where available: Topic/title · Primary keyword · Supporting cluster · Intent · Funnel stage · Demand · Difficulty · Related money page · Priority.

## 15. Backlink & Authority Analysis

([discover.md](discover.md) Category G.) Backlink quantity · referring domains · link quality · spam/problematic links · relevant local links · local citations · competitor authority · authority gap · current strengths · missing authority signals.

Classify: **Critical blocker · Meaningful weakness · Secondary opportunity · Healthy for current stage.** Recommend specific, realistic authority-building approaches when appropriate. **Do not silently drop this section when another research stage (e.g., expanded keyword work) becomes more detailed in the same round** — see the Core Rule.

## 16. AI Discovery & Readiness

*(New — [discover.md](discover.md) Category M, first half.)* Broader than detecting AI Overviews (Section 9 covers that as a SERP feature). This evaluates whether the business itself is discoverable and citable *through* AI-assisted search.

For priority commercial and informational topics, determine where testable: whether AI Overviews appear · whether AI-generated search experiences materially alter the user journey · whether the client/business/domain appears or is referenced · which competitors/publishers/directories/forums/social/video sources appear instead · whether the client's content is structured clearly enough to be understood and cited · whether important business information is consistent across website, structured data, GBP, citations, and public profiles · whether important pages are crawlable/indexable · whether the site provides first-party, specific information instead of generic commodity content · whether important customer questions are answered clearly.

Classify: **Strong · Moderate · Weak · Not Yet Established.** Recommend specific improvements. **Do not invent "GEO hacks."** Prioritize improvements that strengthen human readers, traditional search, and AI-assisted discovery together, not tactics aimed at AI systems alone.

## 17. Entity & Business Information Readiness

*(New — [discover.md](discover.md) Category M, second half.)* Whether search engines and AI systems can clearly determine: business name · business type · services · products · locations/service areas · hours · contact information · expertise · important people/entities when relevant · organization relationships.

Cross-check across: website · schema/structured data · GBP · citations · social/platform profiles · about/contact pages · service/product pages. Identify inconsistencies and missing entity signals — this is a consistency audit across surfaces already evidenced elsewhere (Categories H and I), not a new data pull.

## 18. Chatbot / Conversational Opportunity

*(New — [discover.md](discover.md) Category N, first half.)* Whether a chatbot/conversational assistant could materially improve conversion or customer experience. Consider: repetitive customer questions · product/service complexity · lead qualification · service-area qualification · quote intake · appointment booking · product matching · inventory questions · pricing questions · customer service · after-hours inquiries · slow lead response · form friction.

Classify: **High-value opportunity · Potential opportunity · Low priority · Not recommended.** Where appropriate, recommend specific functions: FAQ answering · product/service matching · lead qualification · quote intake · scheduling · service-area qualification · inventory guidance · lead capture · customer-support routing · human handoff. **Do not recommend a chatbot merely because AI exists — it must solve a real, evidenced business problem.**

## 19. Light AI Automation Opportunity

*(New — [discover.md](discover.md) Category N, second half.)* Where relevant, identify a small number of useful internal AI automation opportunities: lead routing · follow-up · inquiry classification · review-response assistance · reporting · CRM updates · FAQ maintenance · content updating. **Keep this secondary unless it materially affects organic growth or lead conversion** — this is a light adjunct note next to Section 18, not a standalone deep-dive.

## 20. Expected Organic Traffic Impact

**Every report must address potential traffic impact. Do not omit projections solely because exact outcomes are unknowable** — use transparent scenarios per [discover.md](discover.md) O6/O7's CTR-based methodology, never guarantees.

- **Current baseline** — approximate current weekly/monthly organic traffic.
- **Near-term scenario** — potential improvement from technical fixes, on-page improvements, core-page optimization.
- **Mid-term scenario** — potential traffic once important money pages achieve meaningful rankings.
- **Longer-term implemented-strategy scenario** — potential traffic if the recommended page structure and content roadmap are substantially implemented and perform successfully.

Show, where practical: weekly traffic · monthly traffic · money-page traffic · informational traffic · local/search-platform activity.

Modeling considers: search volume · realistic ranking bands · CTR ranges · SERP features · AI Overview/zero-click effects · local pack behavior · keyword overlap · seasonality · authority · competition · implementation completeness. **Do not add overlapping keyword volumes as if every search is a unique visitor. All assumptions must be visible.**

## 21. Lead / Business Impact Scenarios

Where client economics are available ([discover.md](discover.md) O8 `client_specific_economics`), translate traffic scenarios into possible business outcomes using: traffic · conversion rate · lead rate · close rate · average order/project value · margin · lifetime value. **Only use client-provided or clearly sourced values — never invent business economics.**

If economics are unavailable: state what's missing, provide traffic and/or lead scenarios separately (`commercial_value_proxy`), **do not fabricate a revenue forecast.**

For local businesses, also acknowledge value from: calls · Google Maps actions · direction requests · walk-ins · quote requests · branded searches.

## 22. Quick Wins

Each item: Exact action · Why it matters · Expected impact · Effort · Priority · Dependencies. Specific enough for the client to act on immediately.

## 23. 30/60/90-Day Implementation Roadmap

**No vague recommendations** ("improve content," "work on technical SEO"). Organize by week where practical. Each task: specific action · page/system affected · keyword/opportunity supported · priority · dependency.

Example structure:
- **Week 1** — Measurement + critical technical fixes.
- **Week 2** — On-page cleanup + GBP/local fixes.
- **Weeks 3–4** — First highest-priority money page(s).
- **Days 31–60** — Remaining core commercial architecture + first supporting content.
- **Days 61–90** — Content expansion + authority + secondary market opportunities.

**Every major roadmap item must trace back to a finding elsewhere in the report.**

## 24. Longer-Term SEO Roadmap

Additional page expansion · content growth · content updating · content consolidation/pruning where appropriate · backlinks · digital PR/local authority · location expansion · conversion optimization · ranking monitoring · competitor monitoring · seasonal planning · measurement refinement.

## 25. Visual Evidence

Use visual evidence when it materially helps prove or explain a finding — screenshots support conclusions, they don't decorate the report. Priority: important current rankings · Local Pack wins/gaps · significant SERPs · Lighthouse/performance findings · visually-demonstrable technical problems · competitor examples · current site architecture · recommended site architecture · GBP findings · important before/after opportunities. Annotate/caption to explain what the client should notice.

## 26. Social / Platform Search Visibility

**Secondary — keep brief unless social/platform discovery is strategically important** (per [discover.md](discover.md) Category A's brief sub-note). Whether branded social profiles appear in Google · whether public social content is indexed · whether YouTube/Instagram/TikTok/Pinterest/Reddit/other platforms repeatedly occupy target SERPs · whether platform content creates an opportunity or competitive threat. **Do not let this section replace core SEO work.**

## 27. Measurement Plan

Define how progress should be measured after implementation: GSC clicks/impressions · ranking/query visibility · indexed pages · organic sessions · conversion events · leads · calls · bookings · transactions · Local Pack visibility · GBP interactions · reviews/review velocity.

Checkpoints at: **30 days · 60 days · 90 days · 180 days · 365 days.** **Ranking alone is not the business outcome — say so.**

## 28. Scope & Next Steps

Clearly explain what the $300 Discovery Report includes and does **NOT** include. It is strategy, diagnosis, prioritization, and opportunity discovery. Unless specifically included in the purchased package, do not imply it includes: full website implementation · full site redesign · writing every recommended page · writing the complete blog backlog · ongoing SEO management · link-building execution · ongoing GBP management · ongoing analytics reporting.

Provide clear next-step paths: **DIY** (client follows the roadmap) · **Implementation** (Scrolly Social implements priority recommendations) · **Ongoing SEO** (Scrolly Social manages implementation, content, optimization, measurement, iteration). **Do not make the offer excessively sales-heavy** — it should follow naturally from the identified work.

## 29. Appendix

Complete keyword opportunity table · full 100–400-topic content opportunity map when available · keyword clusters/difficulty/search volume · SERP evidence · competitor detail/rankings · geographic evidence · full technical audit detail · full Lighthouse/performance findings · GSC/GA4 findings · local/GBP evidence · backlink information · AI-discovery evidence · traffic-model and ranking-time assumptions · data sources · confidence labels · research methodology · pending items · client assumptions.

The appendix demonstrates depth without making the main report hard to use.

---

## Mandatory Evidence Labeling

For material findings, internally track and, where useful, surface in the report:

| Report-facing label | Internal `evidence_type` (findings.md) |
|---|---|
| CLIENT-PROVIDED | `client-provided` |
| DIRECTLY OBSERVED | `retrieved` (manual/human-observed evidence — e.g. a manual SERP check, a direct site read) |
| API / RETRIEVED DATA | `retrieved` (automated tool/API pull — e.g. a DataForSEO call) |
| CALCULATED | `estimate` (arithmetic/derived from other retrieved values, e.g. O6/O7 traffic modeling) |
| INFERENCE | `inference` |
| SCENARIO | `estimate`, explicitly framed as a labeled range/scenario (O6/O7/O8) |
| PENDING VALIDATION | no record yet — the gap itself is stated, per the Core Rule's fallback steps |

`DIRECTLY OBSERVED` and `API / RETRIEVED DATA` are both stored as `retrieved` internally (per [discover.md](discover.md)'s existing four-value evidence_type enum — not expanded, to avoid schema churn) but **must be distinguished in report-facing text** so the client can tell a manual check from an automated pull. Also assign confidence when meaningful: **High · Moderate · Low.** Never blur an inference into a confirmed fact.

## Mandatory Action Rule

Every material finding must answer:
1. **What did we find?**
2. **Why does it matter?**
3. **What should the client do?**

A finding without a recommended decision/action is incomplete — it fails this contract regardless of which report section it's in.

## Final Quality Gate

Before generating the client-facing report, run a completeness check. **A report fails validation if it silently omits a required module for any of these reasons:** later keyword research was deeper · a data source's API funding/credits ran out · some data was unavailable · one processing stage or agent overwrote another's output · the report was shortened for length/readability · another methodology revision occurred in between. **Missing data may be marked Pending. Missing required sections are never acceptable.**

The report is **not complete** unless it clearly answers:

- What does this business actually offer?
- What is already working?
- What is currently wrong, technically? What technical checks passed?
- What Lighthouse/performance problems exist?
- Can SEO performance currently be measured correctly?
- What site/page structure should change? What pages should be created? What existing pages should be updated? What sections of those pages should change?
- What keywords should be targeted? What are the largest commercial keyword opportunities?
- Who is competing for those searches? Why are they winning?
- How difficult are the priority keywords? Roughly how long could ranking take?
- What SERP/AI features may reduce or change traffic?
- How visible/ready is the business for AI-driven discovery? Is there a useful chatbot/conversational opportunity?
- What should the business publish first? What is the complete long-term content opportunity?
- Does the business have an authority/backlink problem?
- For local businesses, what is happening with GBP/local search?
- Can existing pages convert the traffic they receive?
- Roughly what traffic lift could implementation create? What could that traffic mean for leads/business outcomes?
- What should be fixed immediately? What should happen in the first 90 days? What should happen after 90 days?
- How will success be measured?
- What does Scrolly Social recommend the client do next?

**If evidence is unavailable for one of these questions, the report must explicitly say so and identify the missing input — never silently omit it.** If the report silently omits one of these areas, it fails the quality gate and is not ready to send.

## Report Experience Standard

The final report should feel like: *"I now understand exactly where my organic growth opportunity is, what is preventing me from capturing it, what I should build or fix, what I should expect, and what order I should do it in."*

It should **not** feel like: a keyword export · a generic SEO checklist · an automated website audit · a dump of API data · an unfinished research memo · a collection of SEO observations with no implementation path.

**The goal is not maximum page count. The goal is maximum decision value.**
