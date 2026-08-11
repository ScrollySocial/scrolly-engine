# Discover Methodology (V0.4)

Diagnostic/planning phase. Produces a structured, evidence-based organic-search **opportunity analysis** — what relevant search opportunity exists for the business, how much of it is currently captured, and what to build to capture the rest — from which a simple customer report and appendix are generated. No execution, QA, measurement, or content generation happens in this phase.

**The opportunity is the product. The audit (Categories A–N) is supporting evidence.** A client opening the $299 report should finish it understanding how much organic-search opportunity exists around their business, how much they're missing, and exactly what to build to go after it — not primarily a technical scorecard. (Corrected 2026-08-10, from the Mulberry Creek engagement: the V0.1 process produced primarily an SEO audit. See the Opportunity Engine below.)

## Modes

**Mode 1 — Existing business + existing website**
Full category set. Includes existing-site audit (Architecture KEEP/IMPROVE/CREATE/CONSOLIDATE/REMOVE, Page-Level Recommendations, Internal Linking, Technical/Indexation audit, Site History). Requires site crawl. Runs the full Opportunity Engine (O1–O10) with client-provided O1/O2.

**Mode 2 — Existing/new business, no website**
Skip: existing-site audit, internal linking, site history, KEEP/IMPROVE/CONSOLIDATE/REMOVE. Produce an evidence-based initial architecture (page/topic inventory + hierarchy) instead. Runs the full Opportunity Engine with client-provided O1/O2. All other categories apply.

**Mode 3 — Niche/location opportunity evaluation (pre-business/pre-site)**
Purpose: decide IF building is justified, and compare candidates — this is the rank-and-rent / lead-gen site-selection use case. Runs the same Opportunity Engine (O1–O10) as Modes 1/2, with one difference: O1 (Business/Inventory Map) and O2 (Geographic Opportunity Map) are built from an **inferred typical inventory and candidate-market set for the niche**, not client-provided facts — every O1/O2 record in Mode 3 is labeled `inference`, never `client-provided` or `retrieved`. If a candidate has an owned lead-gen site, run a Mode-1-style audit (A–N) on it as supporting evidence. Support multiple candidates evaluated side by side on the same O1–O10 schema, ranked by O10's Best Overall Opportunity axis plus a Strong/Moderate/Weak investment recommendation — comparative ranking, not a composite score. Output: go/no-go per candidate; a Strong/Moderate verdict feeds into Mode 1 or 2 as the next step (not built here).

## Canonical Finding/Action Schema (A–N, Supporting Audit)

Every material A–N finding is one record with these fields (omit fields that don't apply; don't add new ones):

`category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations`

- **evidence_type**: retrieved / client-provided / estimate / inference (per [CLAUDE.md](../CLAUDE.md)). "Retrieved" includes directly observed evidence (e.g., a SERP position or a ranked-keyword record) — use "observed" informally in prose for this subtype where it aids clarity, but the stored label stays `retrieved`.
- **confidence**: High / Moderate / Low
- **priority**, **expected_impact**, **effort**: High / Medium / Low (qualitative only — no numeric scores)

The Opportunity Engine (below) uses three additional record schemas — Geographic Market, Money Page, Content Opportunity — because their fields don't map onto the A–N schema. All four schemas share the same evidence_type/confidence discipline.

## Confidence Rules

- **High** — multiple independent evidence sources agree, or the fact is directly retrieved/verified.
- **Moderate** — single reliable source, or client-provided fact not independently verified.
- **Low** — evidence unavailable, conflicting, estimated, or the finding is AI inference/judgment without direct data support.

Every material finding carries evidence_type + confidence. Findings without supporting evidence are Low confidence and must not be presented as actions without that label visible in both structured and simple outputs. Simple-report plain-English mapping: High = "Well-supported," Moderate = "Likely," Low = "Uncertain/directional."

No composite numeric score anywhere in V0.2. Use qualitative Strong/Moderate/Weak per category, plus O10's six distinct (never collapsed) opportunity rankings, plus one overall investment recommendation.

## Evidence Classes & Relevance Classification (cross-cutting — governs O1, O3, O4, O8, O9)

**The $299 product cannot depend on receiving detailed inventory, margin, or service-area detail from every client.** (Corrected 2026-08-10: many online clients will supply only a domain and a physical location. Everything beyond that improves the analysis when supplied; it must not normally block it.) Every fact Discover works with falls into exactly one of three evidence classes, and every O3/O4/O9 record carries an explicit **relevance_classification** field (separate from evidence_type and confidence) recording which class produced it:

1. **Confirmed Business Offerings** — supported by the website, client intake, or other direct business evidence. `evidence_type: retrieved` or `client-provided`. `relevance_classification: CONFIRMED RELEVANCE`. Recommend these confidently.
2. **Discovered/Candidate Opportunities** — generated through industry/category knowledge, keyword expansion, competitor keyword discovery, SERP evidence, or related-search/topic discovery, but not confirmed as something the client actually offers. `evidence_type: inference` (or `retrieved` for the keyword/SERP data itself, with the relevance judgment marked `inference`). `relevance_classification: POTENTIAL RELEVANCE — VERIFY OFFERING`. Discovering commercially attractive categories a business may or may not currently carry is itself useful opportunity discovery — it is not a weakness of the report, especially since a client buying an opportunity report often has a weak website precisely because it fails to represent everything they sell.
3. **Client-Enhanced Data** — optional client-supplied detail (inventory, best sellers, highest-margin items, transaction values, priorities, close rates, capacity). Improves prioritization and O8's value modeling when present; its absence never blocks a complete report.

**Standing rule:** Discover must never state or imply that a client sells an unverified product or serves an unconfirmed market. Any `POTENTIAL RELEVANCE — VERIFY OFFERING` finding is phrased in client-facing output as **"Potential opportunity — inventory confirmation recommended"** (or, for geography, "candidate market — confirmation recommended"), never as a claim about what the business currently does.

A third classification, **IRRELEVANT / EXCLUDE**, marks discovered clusters that don't belong in the analysis at all (off-topic seed drift, a different business entirely, client-excluded categories) — recorded so the exclusion is auditable, not silently dropped.

---

## The Opportunity Engine (O1–O10)

Primary tier. Authored first; drives the customer report's lead sections. Runs for Modes 1, 2, and 3 (Mode 3 uses inferred O1/O2, see Modes above). Skip O2 entirely for a niche with no meaningful geographic bound (e.g., a pure e-commerce/national business) — state that explicitly rather than omitting the section silently.

**Cost-control principle governing every layer below:** progressive retrieval — bulk discovery → normalize/filter → inspect fields already returned → identify the actual evidence gap → make only the calls needed to fill that specific gap. Never mechanically call a difficulty endpoint when adequate difficulty evidence already exists in an earlier response, never expand further when the keyword universe is already sufficient, never pull a SERP for every keyword or a full evidence stack for every candidate geographic market. Use representative/high-priority SERP and capture pulls where live evidence would materially change a recommendation — not as a default per-item action. See [discover-engine.md](discover-engine.md) for the tiered retrieval protocol this implies.

### O1. Business/Inventory Map
Understand what the business actually sells, starting from whatever confirmed evidence exists — however minimal — then let O3 discover candidate categories beyond it. Built from confirmed evidence (Mode 1/2) or an entirely inferred typical inventory for the niche (Mode 3, `relevance_classification: POTENTIAL RELEVANCE`, since there is no confirmed tier at all in Mode 3).

**Absolute minimum required intake (Corrected 2026-08-10 — this is the whole hard requirement for the $299 product, and it must not grow):**
- Website/domain
- Physical location(s), if the business is local/regional

That is the only input that may block the base workflow. A business description, service categories, or anything else improves O1's confirmed tier when available but is not required to produce a complete report — where confirmed detail is thin, O3 compensates through discovery (see O3), not by stalling on intake.

**Optional, helpful (improves confidence, never blocks):** short business description, known service area, products/services the client most wants to grow (a soft O10 priority signal), markets definitely served/excluded, target customers, business model, main desired outcome (calls / leads / bookings / store visits / ecommerce sales / revenue / awareness — shapes which O6–O8 scenarios and which report-contract.md §16 business-impact framing actually matter to this client), current marketing channels, current marketing budget, known business constraints, seasonality, brand/business-structure considerations (e.g. whether related service lines share one site or operate as separate brands), GBP/GSC/GA4/conversion-tracking access status (feeds Category K), known competitors supplied by the client (signal only, per Category A's corrected rule).

**Enhanced optional inputs (improve O8's prioritization and value modeling only — never required):** detailed inventory, best sellers, highest-value/highest-margin products or services, average transaction/project values, close/conversion rates, capacity.

This is the full field checklist behind [report-contract.md](report-contract.md) Section A's Required Pre-Report Intake — "required" there means *required to capture when known*, not required from every client. O1's absolute minimum above is unchanged by this list.

Keep client questions minimal. Search volume is never treated as business value on its own (that conflation is exactly what O8 exists to avoid). Every O1 fact is tagged per the Evidence Classes rule above — confirmed offerings vs. discovered candidates are never presented as equivalent.

### O2. Geographic Opportunity Map (local/regional businesses only)

The methodology cannot depend on the client remembering every relevant town. (Corrected 2026-08-10: Mulberry Creek's client-named markets — Wills Point, Terrell, Forney, Emory, Mineola, Elmo — were a real but incomplete list; Quinlan, Kaufman, and Sulphur Springs were plausible candidates the process should have surfaced and screened on its own, not assumed as good targets. That's the general failure mode this layer closes — not a claim that those specific towns are opportunities.)

**Required input:** physical location(s) only (already covered by O1's absolute minimum). **Optional, improves confidence but never blocks:** known service radius, markets definitely served, markets definitely excluded. Absent those, Discover proceeds to generate and screen candidates from the physical location alone — client confirmation improves confidence but is not required for initial opportunity discovery, per the Evidence Classes rule.

**Discover independently identifies plausible candidate nearby markets** from that starting point — labeled `inference` (general/geographic knowledge) until screened, never presented as verified fact on its own, and never described in client-facing output as a market the business definitely serves unless client-confirmed.

**Different business lines can have different catchments — never force one geography onto the whole business.** Evaluate each relevant line's realistic draw separately (e.g., nursery/retail draw is typically tighter than design/install project draw, which is typically tighter than a destination/agritourism draw). A market can be in-scope for one line and out of scope for another.

**Progressive, cost-controlled screening funnel** (do not run full evidence collection on every candidate):
- **Tier 0 — free:** location-resolution utility check (`serp_locations` / `kw_data_google_ads_locations`) on every candidate; proximity/drive-time estimate (general knowledge, labeled `inference` — no DataForSEO tool provides this); rough population/market-size signal (client-provided if known, else labeled `inference`). Eliminates candidates that don't resolve or are clearly implausible before any paid call.
- **Tier 1 — cheap, batched paid:** location-parameterized demand-signal check (batched keyword-volume calls) for candidates surviving Tier 0.
- **Tier 2 — targeted paid:** SERP pulls (current visibility + competition) only for candidates surviving Tier 1 with a meaningful signal or clear strategic relevance.
- **Tier 3 — targeted paid, as needed:** local-listings/competitor-density check for markets/clusters surviving Tier 2.

**Geographic Market record schema:**
`market | distance/drive_time | relevant_business_line(s) | demand_signal | competition | current_visibility | opportunity | recommended_targeting_approach | classification | page_recommendation | evidence_type | confidence`

**Classification:** Core / Secondary / Expansion opportunity / Monitor (insufficient evidence) / Not recommended.

**Page recommendation per market:** inclusion within a service-area page / a dedicated location page / supporting local content only / no dedicated page. A dedicated location page requires genuine, differentiable local content potential, not merely appearing on the classified-market list — **never manufacture a thin doorway page.**

Mode 3: candidate generation + screening runs identically, radiating from a hypothesized HQ point for the niche.

### O3. Keyword Universe
**Detailed inventory is not a blocker to O3.** (Corrected 2026-08-10.) Discover the commercially relevant search universe around the business starting from whatever confirmed evidence O1 provides — even a single vague phrase like "trees & shrubs" is a sufficient seed. Build the universe from four sources, in order:

- **A. Confirmed offerings** (O1's confirmed tier) — the seed keywords directly supported by evidence.
- **B. Industry/category expansion** — general category knowledge for this type of business, used to generate plausible sub-category and adjacent-product seeds beyond what the confirmed evidence names explicitly.
- **C. Competitor keyword discovery** — what domains actually capturing organic traffic in this space rank for (surfaces real categories the client's own site may not mention at all).
- **D. Related keyword discovery** — adjacent/comparison/long-tail expansion off both A and B.

Every resulting keyword cluster is then tagged with a `relevance_classification` (per Evidence Classes above): **CONFIRMED RELEVANCE** (maps directly to a confirmed O1 offering), **POTENTIAL RELEVANCE — VERIFY OFFERING** (plausible and commercially attractive for this type of business, but not confirmed the client actually carries it), or **IRRELEVANT / EXCLUDE** (off-topic, or excluded by client instruction). This is exactly how Discover surfaces opportunity a weak or incomplete client website fails to describe on its own — a thin site is a reason to lean on B/C/D harder, not a reason to stop.

Scope to the markets that survive O2 screening where local. Includes local/store intent, product/category purchase intent, service/high-ticket intent, problem/use-case intent, comparison/research intent, informational intent, seasonal intent where relevant. Do not stop at obvious seed keywords.

Use bulk/batched expansion endpoints (multiple seeds per call), not one call per keyword. Before requesting a dedicated enrichment call (difficulty, intent, volume), **inspect the fields already returned by the expansion call** — bulk keyword-idea/related/suggestion responses typically already carry volume, competition, CPC, difficulty, and intent fields. Only fill genuine gaps.

### O4. Clustering / Money Pages
Cluster keywords by search intent to determine which terms belong on the same page. For each cluster, also apply O2's per-market page recommendation where geography is a factor (a cluster may become a dedicated page in one market and a service-area-page mention in another).

**Money Page record schema:**
`recommended_url | purpose | primary_keyword | supporting_keyword_cluster | search_intent | relevant_geography | demand | organic_difficulty | current_visibility | estimated_traffic_opportunity | commercial_value_proxy | client_specific_economics | priority | supporting_content_needed | relevance_classification | evidence_type | confidence`

`relevance_classification` (CONFIRMED RELEVANCE / POTENTIAL RELEVANCE — VERIFY OFFERING / IRRELEVANT-EXCLUDE) governs how the page is described in client-facing output — see Evidence Classes above. `commercial_value_proxy` and `client_specific_economics` are defined under O8. Do not invent values. A field with no defensible evidence is left labeled `insufficient evidence`, not filled with a plausible-looking number.

### O5. Organic Ranking Difficulty
Google Ads competition (a paid-advertiser metric) is never presented as organic SEO difficulty — the two are analytically distinct and V0.1 evidence already conflated them in places (see Mulberry Creek's `demand.md`/`content-topics.md` `competition` columns, corrected separately, not in this file). Determine Easy/Moderate/Hard using keyword-difficulty fields (from expansion calls or `dataforseo_labs_bulk_keyword_difficulty`), SERP composition (authority/type of ranking domains, feature crowding), and relevant authority signals (Category G). Avoid fake numerical precision — qualitative rating with the evidence stated beside it.

### O6. Current Visibility / Organic Traffic Capture
Two distinct things, never merged:
- **Current visibility** (`retrieved`/observed) — actual SERP position and/or `dataforseo_labs_google_ranked_keywords` results for the domain. This is the only part of this layer that is directly observed evidence.
- **Estimated current traffic capture** (`estimate`) — modeled from observed position × demand × a stated CTR-by-position assumption/range. Without first-party GSC access, this is always modeled, never presented as directly observed traffic.

### O7. Uncaptured / Incremental Traffic Opportunity
Rankings are not traffic capture, and this layer must never be computed as `total search volume − ranking volume`. Structure instead as a chain:

`Relevant Search Demand → Current Organic Visibility (observed) → Estimated Current Organic Traffic Capture (modeled) → Potential Incremental Organic Traffic Opportunity (modeled)`

Incremental opportunity is estimated as the traffic delta between modeled current capture and a stated target-position scenario, using the same CTR-by-position curve — a labeled scenario, not a forecast or guarantee. Where exact capture can't be measured, use a defensible range rather than a false-precision point estimate. The goal is letting the owner understand the *scale* of what's being missed, not a guaranteed number.

### O8. Business/Sales Opportunity
Translate qualified traffic into business terms using two explicitly separate, always-both-present labels — never blend them into one implied figure:

- **`commercial_value_proxy`** (High / Medium / Low): built from demand, commercial intent (CPC as a proxy signal), traffic opportunity, and general industry/category knowledge about what this type of lead is typically worth (e.g., a project-based landscape-installation lead can reasonably be classified as a higher commercial-value proxy than a single low-cost retail plant purchase — that's an industry-knowledge judgment, `relevance_classification`/`evidence_type: inference`, not a claim about this specific client's numbers).
- **`client_specific_economics`**: the client-provided ticket value/margin/close-rate figures if supplied, or the literal label **"Not provided"** if not. Never state or imply client-specific profitability, margin, or average transaction value unless the client actually supplied it.

**Default mode (no client economics provided, the expected common case):** report `commercial_value_proxy` + `client_specific_economics: Not provided` for every money page and prioritization call. This is a complete, usable business-value read on its own — not a degraded fallback — it simply stops short of a dollar figure.

**If the client supplies economics (optional input):** produce labeled scenario ranges for leads/sales using the real figures, clearly distinguished from the industry-proxy figures used elsewhere in the same report. For local businesses, explicitly account for value that doesn't flow through a web form — calls, directions requests, and physical visits driven by search — not just form submissions.

### O9. Content Opportunity
Determine how many genuinely valuable topics exist before recommending any publishing cadence — this is a discovery step, not a default. Build topics from O3/O4/O5 evidence: commercially relevant, meaningfully demanded, differentiable from existing competitor content, and related to a specific money page (O4). Category shapes only (product/use-case questions, comparisons, "best X for Y," local/regional questions, problems/solutions, seasonal questions, buying guides, care/selection questions) — the retrieved data determines actual topics, never the category list itself.

**Output, sized to the real opportunity count found — never padded and never artificially capped:**
- **First 10 posts**
- **Next 20 posts**
- **Broader backlog**

If 100+ strong opportunities exist, surface them. If only 30 do, report 30. High-cadence publishing (e.g., 2–3 posts/day) is presented as an option only when the backlog evidence actually supports that volume of genuine, differentiated topics — never assumed by default.

**Content Opportunity record schema:**
`topic_title | primary_keyword | supporting_keywords | search_demand | organic_difficulty | intent | money_page_supported | relevance_classification | why_it_matters | priority | evidence_type | confidence`

A content topic built around a category that isn't a confirmed offering (e.g., a care/buying guide for a plant category the site never mentions) is tagged `POTENTIAL RELEVANCE — VERIFY OFFERING` and phrased accordingly — never presented as content about something the business is confirmed to sell.

### O10. Opportunity Prioritization
Explicitly identify six distinct rankings — never collapsed into a single score:
- Biggest Search-Demand Opportunity
- Highest Potential Business-Value Opportunity (ranked by `commercial_value_proxy` when `client_specific_economics` is "Not provided," per O8)
- Most Favorable Organic Competition
- Best Demand × Difficulty Opportunity
- Best Near-Term SEO Win
- Best Overall Organic Opportunity

If an overall score is ever used, explain its construction plainly and avoid fake precision. In Mode 3, "Best Overall Organic Opportunity" across candidates is the direct input to the go/no-go verdict.

---

## Analysis Categories (A–N) — Supporting Audit Layer

Necessary supporting evidence, not the primary deliverable. These categories explain *why* opportunity exists or is blocked, and feed evidence directly into the Opportunity Engine (Category A's SERP/competitor evidence feeds O5/O6; Category H's technical findings explain capture blockers; Category G's authority signals feed O5's difficulty read; Category I is the local-trust counterpart to O2's geographic-demand read; Categories K, L, and M feed the report-contract's Analytics-Readiness, Conversion-Readiness, and AI-Discovery scorecard rows). They also cover engagement-completeness requirements the Opportunity Engine doesn't itself replace (technical health, local trust/reputation, authority, site history, measurement readiness, conversion readiness, AI/entity discoverability, chatbot/automation opportunity). Full report-facing structure and completeness requirements for how this evidence is presented live in [report-contract.md](report-contract.md) — this section defines what to analyze, that file defines what the finished report must contain.

**A. Competitive Search Landscape** (opportunity + competitors, one connected analysis)
Identify actual organic competitors via SERP retrieval and organic-capture evidence (`dataforseo_labs_google_ranked_keywords` and similar) — client-named competitors are input signal only, not ground truth, and **prior local-pack appearance is not sufficient grounds to select a competitor for deeper analysis.** (Corrected 2026-08-10: earlier Mulberry Creek work defaulted to the two competitors that recurred in local-pack pulls; going forward, after the keyword universe (O3) exists, select competitor domains by evidence of actually capturing organic traffic across the important commercial clusters — including product/nursery-line competitors specifically where the business has a distinct product line, since those are frequently a different competitor set than the service-line competitors.) Assess demand, intent, commercial relevance, geo fit, and competition. Assess SERP-feature crowding and AI-Overview/zero-click exposure to judge whether ranking well would even produce traffic. Determine where competitors control the SERP and why, so the report can explain why a competitor wins and how the client can compete — not just that they do. Feeds O5/O6/O10.

**Social/platform search visibility (brief sub-note, added 2026-08-10):** as a secondary, non-blocking part of this category, briefly note whether branded social profiles appear in Google, whether public social content is indexed, and whether YouTube/Instagram/TikTok/Pinterest/Reddit/other platforms repeatedly occupy target SERPs. Keep this short — it never substitutes for the core organic-competitor analysis above.

**B. Business Value & Prioritization**
Traffic/rankings are inputs, not goals — prioritize by commercial relevance of demand. Use client-provided priority-service/economic input when available (optional, per O1/O8). Without it, default to SEO-only/relative prioritization per O8 and state that limitation explicitly. Never invent profitability/value data.

**C. Site Architecture**
Internally separate: information/URL architecture, page/topic inventory, navigation — one deliverable, distinct evidence per part. Derive from validated demand, SERP/competitive evidence, and visitor usefulness — never a fixed page-count template. Existing sites: classify each important page/action KEEP / IMPROVE / CREATE / CONSOLIDATE / REMOVE. No site: evidence-based initial architecture, no classification.

**Location/service-area pages, specifically (corrected 2026-08-10, from the Mulberry Creek engagement):** evaluate on confirmed business/service relevance to that market, confirmed target-market status, demand, competitive landscape, ability to support the page with genuinely useful differentiated local content, and business value/priority where known — never on whether the business already has search visibility there. Lack of current visibility is not disqualifying and can itself represent the opportunity a location page is meant to capture. Conversely, never recommend a location page merely because a target city exists on a list — a page without real differentiated local content behind it is a thin/doorway page and should not be built regardless of how many of the other criteria are met. As of V0.2, this decision is made jointly with O2/O4 — see those layers for the market-classification-to-page-type mapping.

**D. Page-Level Recommendations**
Per important page: URL, purpose/intent, primary + supporting topic/entity/question coverage, missing coverage, internal links in/out, schema opportunities, conversion opportunities, priority. No word-count targets — depth is justified only by topical/entity coverage gaps vs. competitors.

**E. Content & Topical Strategy**
Superseded operationally by O9 (Content Opportunity), which is the actual discovery methodology. This category remains for any content-adjacent finding that isn't a publishable-topic record (e.g., structural content-quality issues, cannibalization, duplicate/thin content, freshness/decay). Check cannibalization (multiple pages targeting the same intent) and duplicate/thin content. Check freshness/decay where historical performance data is available.

**F. Internal Linking** (Mode 1 only — requires an existing site)
Broken links, orphan pages, weakly linked important pages, missing contextual links, navigation/hierarchy problems, specific recommended linking relationships.

**G. Authority & Trust**
Keep backlinks, reviews/reputation, citations/NAP, and on-site trust/E-E-A-T signals analytically distinct — never merged into one score. Backlinks: referring-domain profile, relevance/quality patterns, competitor link gaps, anchor patterns. Surface unusual patterns as informational only — never auto-recommend disavowal. Reviews/citations/E-E-A-T are assessed under Local Search (I) for local/regional businesses; otherwise assessed here. Feeds O5 (difficulty).

**H. Technical SEO & Indexation**
Crawlability/indexability (robots.txt, canonical, noindex, sitemap), redirects/status codes, mobile rendering, structured data validity, duplicate/thin content, crawl-budget issues (scale-dependent), detectable manual-action/penalty signals. Present as FIX NOW / IMPROVE / PASSED / NOT EVALUATED per [report-contract.md](report-contract.md)'s Technical SEO Analysis section — **the full itemized table belongs in the main report, not a compressed prose summary** (this was corrected 2026-08-10 after a real regression: an expanded-keyword-research round left a prior technical audit compressed to two summary bullets in the client report — see report-contract.md's Core Rule). Explains capture blockers feeding O6/O7.

**Lighthouse/performance sub-audit (expanded 2026-08-10, now permanent — [report-contract.md](report-contract.md)'s Lighthouse/Performance Error Analysis section):** test representative page types, not just the homepage — homepage, main service/product page, category page, an important location page, a blog/article, a major organic landing page, and (for ecommerce) a product page. Capture category scores, Core Web Vitals where available, and the actual failed audits/opportunities/diagnostics, not just a score. Classify each by severity (Critical/High/Medium/Low/Informational) and by scope (site-wide/template-wide/page-type-specific/individual-page-specific) — a template-wide issue outweighs the same issue on one minor page, and the report says so. The specific tool is substitutable (paid Lighthouse call vs. a free tool like PageSpeed Insights, per each engagement's data-plan) — the multi-page-type, full-diagnostic requirement itself is not.

**I. Local Search** (first-class when the business is local/regional — not a subsection of backlinks or technical)
GBP profile completeness/optimization, local pack competitive dynamics, reviews/reputation, citation/NAP consistency, local-specific ranking factors. Complements O2's demand/competition read with trust/reputation evidence.

**J. Site History** (Mode 1, and owned lead-gen sites evaluated in Mode 3)
Include relevant history (redesigns, migrations, manual actions, major known issues) where evidence is available. Present as context only — never claim unsupported causation between a historical event and current performance.

**K. Analytics & Measurement Readiness** (added 2026-08-10, per [report-contract.md](report-contract.md)'s Analytics & Measurement Readiness section — always in scope, not conditional on Mode)
Evaluate whether the business can currently *measure* organic-search performance — a distinct question from whether it currently ranks. Never assume analytics are correct merely because GA4/GSC exist; verify, don't assume. **GSC, when accessible:** correct property verification, indexing/coverage visibility, clicks/impressions/queries/pages, crawl/indexation issues, manual actions or security warnings when accessible. **GA4, when accessible:** installed correctly, duplicate tags, misconfiguration, traffic attribution, event tracking, conversion/key-event setup. **Lead attribution:** whether the business can track forms, phone calls, bookings, ecommerce purchases, direction requests, quote requests, and other meaningful conversions. Where GSC/GA4/tracking access isn't authorized, keep the finding row and mark it explicitly unavailable — never guess at measurement state.

**L. Organic Conversion Readiness** (added 2026-08-10, per [report-contract.md](report-contract.md)'s Organic Conversion Readiness section)
SEO success is not only rankings — evaluate whether important pages (existing or O4 Money Page candidates) can actually convert the organic traffic they'd receive. Per page: CTA visibility, clarity of next action, phone prominence/click-to-call, forms and form friction, booking process, trust signals (reviews/testimonials/credentials/guarantees/about-expertise), service/product clarity, geographic clarity, pricing/cost expectations where appropriate, visual proof, user journey, mobile conversion friction. Identify obvious traffic-leak points before they become a lost lead. **Keep this focused on SEO ROI — this is not a full CRO engagement**, and never expands into a redesign recommendation on its own authority.

**M. AI Discovery & Entity Readiness** (added 2026-08-10, per [report-contract.md](report-contract.md)'s AI Discovery & Readiness and Entity & Business Information Readiness sections)
Two related sub-analyses, one category. *AI discovery*: whether the business appears/is referenced when AI Overviews or AI-assisted search surfaces answers for its priority commercial/informational topics; who appears instead (competitors, publishers, directories, forums, social, video); whether the client's content is structured clearly enough to be understood and cited; whether it offers first-party, specific information rather than generic commodity content. Classify Strong/Moderate/Weak/Not Yet Established. *Entity/business-information readiness*: whether business name, type, services, products, locations, hours, contact info, and expertise are consistent across website, schema, GBP, citations, and social/platform profiles — a cross-check of evidence already gathered under H and I, not a new data pull. Never invent "GEO hacks" — recommendations here should strengthen human readers and traditional search too, not target AI systems alone.

**N. Chatbot & Light AI Automation Opportunity** (added 2026-08-10, per [report-contract.md](report-contract.md)'s Chatbot/Conversational Opportunity and Light AI Automation Opportunity sections)
Whether a chatbot/conversational assistant would solve a real, evidenced business problem — repetitive questions, lead qualification, quote intake, scheduling, after-hours inquiries, slow lead response, form friction and the like. Classify High-value/Potential/Low priority/Not recommended; recommend specific functions only where evidenced, never a chatbot merely because AI exists. Secondarily, note a small number of internal AI-automation opportunities (lead routing, follow-up, review-response assistance, reporting) only where they materially affect organic growth or lead conversion — this stays a light adjunct note, not a standalone deep-dive.

## Risk — Never Auto-Prescribe

Domain migrations/rebrands, backlink disavowal, subjective brand/positioning changes, compliance-sensitive/YMYL-specific advice. Render these as a flagged consideration (evidence + limitation noted) in the structured analysis and appendix; exclude from the prioritized action list and simple-report priority actions; note that professional judgment is required.

## Data Capabilities

**Always required:** website/domain and physical location(s) if local (O1's absolute minimum — nothing else about the client's business is required); demand/keyword data (volume/trend, geo-adjusted where local); SERP retrieval (results + features present: organic, local pack, PAA, featured snippet, ads, AI overview); competitor identification derived from SERP/organic-capture retrieval per Category A's corrected rule; current organic capture data for the client's own domain (O6) where an existing site exists; industry/category-expansion reasoning to build O3's candidate tier when confirmed inventory is thin or absent.

**Conditionally required:** site crawl + technical/performance data (Mode 1; Mode 3 owned lead-gen sites) including the multi-page-type Lighthouse/performance sub-audit; local data — GBP, local pack, citations (local/regional businesses); backlink/referring-domain data (wherever authority findings are made); geographic candidate screening data (O2, local/regional businesses only — runs regardless of whether the client supplies a service radius); Category K's GSC/GA4/conversion-tracking evidence (authorized-access only — not a DataForSEO capability, see data-sources.md); Category L's conversion-readiness evidence (direct site read, same free/manual method as Category H's on-page checks — not a DataForSEO capability); Category M's AI-discovery evidence (candidate DataForSEO AI-mention tools, unverified — see data-sources.md — falls back to manual/free inspection); Category N's chatbot/automation read (qualitative, built from O1 business-model understanding + Category L friction points — no data pull).

**Optional, confidence-boosting — improves the report, never blocks it:** business description, known service area, priority growth line, markets definitely served/excluded; first-party GSC/GA (authorized) — the only source of directly observed traffic capture, as opposed to O6's modeled estimate; historical/archive data; client-provided economics (detailed inventory, best sellers, ticket value, margin, close rate, capacity) for O8's `client_specific_economics` field and O3's confirmed-tier expansion.

**Broad/regional demand ≠ local addressable opportunity (standing rule, generalized 2026-08-10 from the Mulberry Creek pumpkin correction):** state- or national-level search volume for a geographically-bound business may only be used as evidence of category existence and seasonality. It must never be presented as that business's addressable search opportunity. Sizing a real local/regional opportunity requires O2's catchment-based screening (or an equivalent defensible regional-geography methodology) — never a broad-geography volume figure standing in for it.

**Fallback behavior:**
- Missing conditionally-required capability → state the limitation on affected findings, downgrade those to Low confidence, continue the rest of the report.
- Missing always-required capability (e.g., no demand data for a hyper-niche term) → state that explicitly, proceed with qualitative/SERP-based analysis at Low confidence rather than blocking the report or inventing numbers.
- Missing optional capability → cap affected findings at Moderate confidence and note the limitation. Missing detailed inventory does not block O3 (see O3's four-source discovery model); missing client economics does not block O8 (report `commercial_value_proxy` with `client_specific_economics: Not provided`, see O8). Neither is a degraded report — both produce a complete, usable $299 deliverable on their own.

## Automation & Escalation Behavior

Routine fulfillment is fully automated — no subjective human-review step in the normal workflow. When a finding cannot be responsibly automated (causal explanation of past changes, brand/positioning calls, YMYL-specific guidance, disavowal/migration decisions), render it as a flagged, low-confidence consideration with a stated limitation — not as a prioritized action, and not by silently inserting a "needs human review" step. When required evidence is unavailable, label the finding Low confidence / inference (or "insufficient evidence") rather than omitting it or guessing.

## Output

**Full report and appendix structure, completeness requirements, and the permanent non-regression rule governing all future changes to them are defined in [report-contract.md](report-contract.md) — that file is the authoritative spec for A and B below, not this section.** Summary only:

**A. Simple customer report** — a complete organic-growth decision document, not a raw audit or keyword export. Leads with the Executive Opportunity Summary + scannable scorecard (report-contract.md §1), then Current Wins (§2 — never omitted), then the Organic Search Opportunity Snapshot and Biggest Opportunities (O1–O10), Pages to Build (O4/§5–6), SERP/AI-Overview reality and ranking difficulty (§7–8), Competitive Landscape with why-they-win/how-to-compete (§9), Local/GBP (§10), Conversion Readiness (§11), Content Opportunities (O9/§12), Traffic and Lead/Business scenarios (O6–O8/§15–16), Quick Wins and the 30/60/90-day roadmap (§17–18), longer-term roadmap (§19), measurement plan (§20), and scope/next-steps (§23). Every material finding answers what/why/what-to-do (report-contract.md's Mandatory Action Rule).

**B. Supporting appendix** — full Geographic Market table (O2), full Money Page plan (O4), the full 100–400-topic Content Opportunity map when evidence supports it (O9, never padded — report-contract.md §13), full per-category A–N finding tables, full technical issue list (FIX NOW/IMPROVE/PASSED/NOT EVALUATED), full competitor/SERP detail, full GBP/local evidence, backlink detail, traffic-model and ranking-time assumptions, data sources, confidence labels, and pending items.

**C. Structured Discover analysis (canonical source of truth)** — every A–N finding/action as a schema record, plus every O2 Geographic Market, O4 Money Page, and O9 Content Opportunity record, grouped and machine-readable. Authored first; A and B are generated views of C, never independently authored.

Outputs are stored under `clients/<client-name>/` (created at engagement start), kept separate from this methodology per [CLAUDE.md](../CLAUDE.md).

## Downstream Use (context only — not designed here)

Structured output (C) must remain consumable by future implementation agents (DIY engine, paid setup, managed SEO) without re-deriving the analysis.

## Rules

- Every claim labeled by evidence_type: retrieved / client-provided / estimate / inference. Report-facing text distinguishes DIRECTLY OBSERVED from API/RETRIEVED DATA within `retrieved` — see [report-contract.md](report-contract.md)'s Mandatory Evidence Labeling table.
- Every O3/O4/O9 record labeled by relevance_classification: CONFIRMED RELEVANCE / POTENTIAL RELEVANCE — VERIFY OFFERING / IRRELEVANT-EXCLUDE. Never state or imply a client sells an unverified product or serves an unconfirmed market — use "Potential opportunity — inventory confirmation recommended" phrasing for anything not confirmed.
- Never fabricate metrics or business/financial data. Industry-knowledge-based commercial-value judgment is permitted only as a labeled `commercial_value_proxy`, never presented as this client's actual profitability, margin, or transaction value unless client-provided (`client_specific_economics`).
- Traffic/scenario estimates are permitted only via O6/O7's stated methodology (observed position × demand × labeled CTR-by-position assumption/range) — never a raw volume subtraction, never an unlabeled forecast, never a guarantee.
- Missing detailed inventory, service-area detail, or client economics never blocks a complete report — see O1/O3/O8's absolute-minimum-intake and discovery-tier rules.
- Every material finding answers what was found, why it matters, and what the client should do — [report-contract.md](report-contract.md)'s Mandatory Action Rule. A finding without a recommended action is incomplete.
- **Permanent non-regression rule** (governs all future edits to this file, discover-engine.md, data-sources.md, and report-contract.md — the "Core Rule" there): new research stages, agents, APIs, datasets, or methodology changes may add findings and requirements; they must never overwrite, remove, or substantially reduce previously required analysis. Concretely: `findings.md` is append-only within an engagement, and report generation renders the *full* accumulated record — a later round's expanded keyword/opportunity work must never cause an earlier round's technical, competitor, or backlink findings to shrink to a prose summary in `report.md`. Where a required analysis can't be completed, keep the section and state what was evaluated, what was confirmed, what remains unknown, and what would resolve it — never silently drop it, and running out of API credits/funding is not an exception. Full statement in [report-contract.md](report-contract.md).
- Never produce a client report containing only weaknesses — Current Wins (report-contract.md §2) is a required section, not optional color.
- Discover ends at the prioritized recommendation — no execution, QA, measurement, or content generation.
