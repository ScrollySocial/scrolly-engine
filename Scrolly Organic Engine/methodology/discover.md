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

**Proximity is not the deciding factor — importance is (added 2026-08-17).** A larger or more commercially important market that's farther away can legitimately outrank a smaller, closer one; the screening funnel above exists specifically to let that happen, not to default to whichever candidates happen to be nearest. Every candidate market that survives Tier 0 must be compared on **distance/drive-time, population/market-size signal, and (once available) demand and competition together** — never on proximity alone, and never on "which markets happened to get SERP-tested this round" as an implicit substitute for a real comparison. Where Tier 1–3 evidence wasn't retrieved for every Tier-0 survivor (a common, honest outcome under a bounded research budget), still produce the Tier-0-level comparison (distance/drive-time + population/size, labeled `inference`/`estimate` as appropriate) across *all* surviving candidates side by side — do not silently narrow the comparison down to only the subset that happened to get deeper-tier testing. **This comparison must reach the client-facing report** (report-contract.md §7/§11), not remain internal-only in findings.md — a client should be able to see why a farther town was included, or why a nearer one wasn't, not just the final market list.

### O3. Keyword Universe
**Detailed inventory is not a blocker to O3.** (Corrected 2026-08-10.) Discover the commercially relevant search universe around the business starting from whatever confirmed evidence O1 provides — even a single vague phrase like "trees & shrubs" is a sufficient seed. Build the universe from four sources, in order:

- **A. Confirmed offerings** (O1's confirmed tier) — the seed keywords directly supported by evidence.
- **B. Industry/category expansion** — general category knowledge for this type of business, used to generate plausible sub-category and adjacent-product seeds beyond what the confirmed evidence names explicitly.
- **C. Competitor keyword discovery** — what domains actually capturing organic traffic in this space rank for (surfaces real categories the client's own site may not mention at all).
- **D. Related keyword discovery** — adjacent/comparison/long-tail expansion off both A and B.

Every resulting keyword cluster is then tagged with a `relevance_classification` (per Evidence Classes above): **CONFIRMED RELEVANCE** (maps directly to a confirmed O1 offering), **POTENTIAL RELEVANCE — VERIFY OFFERING** (plausible and commercially attractive for this type of business, but not confirmed the client actually carries it), or **IRRELEVANT / EXCLUDE** (off-topic, or excluded by client instruction). This is exactly how Discover surfaces opportunity a weak or incomplete client website fails to describe on its own — a thin site is a reason to lean on B/C/D harder, not a reason to stop.

Scope to the markets that survive O2 screening where local. Includes local/store intent, product/category purchase intent, service/high-ticket intent, problem/use-case intent, comparison/research intent, informational intent, seasonal intent where relevant. Do not stop at obvious seed keywords.

Use bulk/batched expansion endpoints (multiple seeds per call), not one call per keyword. Before requesting a dedicated enrichment call (difficulty, intent, volume), **inspect the fields already returned by the expansion call** — bulk keyword-idea/related/suggestion responses typically already carry volume, competition, CPC, difficulty, and intent fields. Only fill genuine gaps.

**Long-Tail Discovery Stage (added 2026-08-17).** Long-tail terms must be deliberately researched, not merely accepted as incidental noise inside a head-term expansion call or a bulk manual import. For every commercially meaningful seed/cluster surviving sources A–B above, deliberately test applicable modifier families against it — the families themselves are industry-adaptive, not a fixed list to apply uniformly:

- **Geographic:** location name, "near me"/"nearby"
- **Product/service subtype:** category, species/model/material, size
- **Commercial:** price, cost, "best," comparison ("X vs Y")
- **Intent-shaping:** question forms, transactional modifiers (buy/order/hire/get), informational modifiers (how/what/why/guide)
- **Situational:** problem/need, use case, audience, availability, urgency, seasonal modifiers

Classify every keyword in the resulting universe as **Head** (broad category term), **Mid-tail** (one qualifier), or **Long-tail** (multiple qualifiers/highly specific) — this classification is a required field on the keyword universe, not optional color. **Do not automatically discard a strong long-tail query for low or zero reported volume** — for local/service businesses a highly specific low-volume search can carry real commercial value; evaluate long-tail terms on commercial intent, specificity, local relevance, likely competition, fit to an actual recommended page, conversion potential, and FAQ/topical usefulness, the same way head terms are evaluated, not by volume alone. Where a large raw keyword export already exists (e.g. a manual CSV import) but was never explicitly modifier-tested, mining and classifying the long-tail phrases already present in it satisfies this stage — it does not require a fresh paid pull if the phrases are already there.

**Coverage requirement, not a sample (tightened 2026-08-17).** This stage must produce a genuinely systematic pass across **every major commercial cluster**, not an illustrative handful of rows pulled from one or two clusters. The client-facing output must be able to show, per major cluster, which modifier families were actually applied and what was found — a single 4-6-row "representative sample" table across the whole engagement fails this requirement even if individually accurate, because it doesn't demonstrate systematic coverage. Where the raw keyword pool already contains long-tail variants for a cluster (the common case with a bulk import), report-contract.md §7 requires that cluster's own grouped keyword table to visibly include its long-tail variants inline (tail-length labeled), not a separate, thin, cross-cluster afterthought table.

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

**Break-even display (required report output, per [report-contract.md](report-contract.md)'s Lead/Business Impact Scenarios section, regardless of whether economics were supplied) — 4-tier fallback hierarchy (revised 2026-08-17, replaces the prior "compute if supplied, otherwise refuse" behavior):** show `implementation cost ÷ average profit per new customer = customers needed to break even`, and `report cost ÷ estimated profit per customer = customers needed to recover the report cost`, using the best available tier of economics data:

1. **Client-provided economics** (`client_specific_economics`) — average sale/project value, margin/profit, close rate. Use directly.
2. **Client website pricing** — publicly displayed pricing or price ranges on the client's own site (evidence_type: `retrieved`), where genuinely present. Use as a stand-in for average value only where the displayed price is representative, not a low-end teaser rate.
3. **Credible industry benchmark** — a reasonable, sourced industry-typical range for this business type/category (evidence_type: `inference`, same discipline as `commercial_value_proxy`). State the source/basis for the range.
4. **Clearly labeled scenario assumptions** — where none of 1–3 is available, state an explicit, clearly labeled assumption (e.g. "assuming a mid-range project value typical for this category") rather than refusing to show a number at all.

**Always disclose which tier was used, in the report itself** — what data was used, where it came from, what is estimated vs. client-specific. Prefer profit/contribution economics over gross revenue wherever tier 1–3 data reasonably supports it. Never invent a client-specific figure, never silently upgrade an estimate to read as client-confirmed, and never imply these are guaranteed acquisitions — this stays a break-even/scale calculation, not a forecast.

**Directional Impact/Opportunity Scenarios (added 2026-08-17, required report output alongside break-even) — Conservative / Base (Plausible) / Upside.** Purpose: give the client a sense of scale, not a precise forecast. Build from whatever combination of local/regional search demand, current ranking, competition, page count, SERP composition, existing authority, and a conversion assumption the evidence actually supports — every input labeled by its own evidence_type. **Only quantify a scenario when the inputs genuinely support a number; otherwise state the scenario qualitatively** (e.g. "a meaningful but currently uncaptured segment of local demand" rather than a fabricated range). Where quantified, phrase as an explicit conditional, never a promise: *"if this page reached approximately [position/range] and captured approximately [stated assumption] of the measured local opportunity, that would imply approximately X–Y visits/leads"* — never *"you will receive X visits."* Label every assumption inline.

### O9. Content Opportunity
Determine how many genuinely valuable topics exist before recommending any publishing cadence — this is a discovery step, not a default. Build topics from O3/O4/O5 evidence: commercially relevant, meaningfully demanded, differentiable from existing competitor content, and related to a specific money page (O4). Category shapes only (product/use-case questions, comparisons, "best X for Y," local/regional questions, problems/solutions, seasonal questions, buying guides, care/selection questions) — the retrieved data determines actual topics, never the category list itself.

**Required clustering procedure (formalized 2026-08-10 — apply this before sizing any tier, not just "size to evidence" as an unstructured instruction):**
1. Cluster the retrieved keyword pool by search intent — group phrases that would be satisfied by the same page, don't leave them as a flat list.
2. Deduplicate — keywords that differ only by phrasing but target the same page/intent collapse into one cluster entry.
3. Separate transactional/commercial clusters from informational clusters explicitly; they feed different report sections (money pages vs. content topics).
4. Identify which clusters are pillar/money pages (O4) vs. supporting informational content that should link to them.
5. Identify supporting-article topics within each cluster.
6. Surface seasonal content where the demand data shows real seasonality.
7. Surface local/regional content only where a market has evidence-backed differentiation (per Category C's location-page rule — never a doorway page).
8. Actively check for and avoid keyword cannibalization — two clusters that would compete for the same intent get merged or clearly differentiated, never left to silently overlap.
9. Avoid thin pages — a cluster with only one or two low-signal keywords isn't a defensible standalone page/article.
10. Never create a topic merely because a keyword exists with no supporting cluster, intent match, or money-page relevance behind it.

**Output, sized to the real opportunity count found — never padded and never artificially capped, and always organized as clusters (pillar + supporting articles), never a flat list, per [report-contract.md](report-contract.md)'s content sections:**
- **Launch first** — the exact prioritized near-term list (typically ~10 articles/pages).
- **Next growth phase** — additional clusters already validated by evidence, sized to what step 1-9 above actually supports.
- **Long-term content opportunity** — an honest range across clusters where the research supports one; where a larger raw keyword pool exists (e.g. a broad manual export) but hasn't been validated for difficulty/geo-sizing, say so explicitly rather than folding it into a validated number or omitting it.

If 100+ strong opportunities exist, surface them. If only 30 do, report 30. High-cadence publishing (e.g., 2–3 posts/day) is presented as an option only when the backlog evidence actually supports that volume of genuine, differentiated topics — never assumed by default. **This tiering and its labels are internal working language** — see [report-contract.md](report-contract.md)'s Client Language Rules for how it must be translated for the client-facing report (never "partial tier," "not padded to N," or "broader backlog" in report.md/appendix.md).

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

### Roadmap & Timing Generation (added 2026-08-16, feeds [report-contract.md](report-contract.md) §23)

Priority (above) and **timing** are related but distinct outputs — O10 ranks opportunities against each other; timing places them on the client's implementation roadmap. **Timing is generated per engagement from the factors below, never assigned by a fixed template that maps a finding's category (technical, money page, content, local) onto a fixed calendar bucket regardless of its actual urgency, effort, or dependencies.** An earlier report draft did exactly that (a Days-1-30/31-60/61-90/Months-4-6/7-12 skeleton pre-populated by category) — this section exists to replace that pattern, not decorate it.

**Timing factors, applied per roadmap item:**
- **Expected impact** and **effort** (already tracked per O10/A–N schema).
- **Urgency** — including seasonal lead time (see below), a confirmed active problem (e.g. a server-level indexing block), or a stated client deadline.
- **Dependencies / prerequisite status** — an item that depends on another (e.g. a supporting article that links to a money page) cannot be scheduled before its prerequisite.
- **Confidence / evidence quality** — a Low-confidence or Pending item is sequenced after the validation step that would resolve it, not scheduled as if already actionable.
- **Current visibility** and **whether the affected page already exists** — a CREATE item carries real production lead time (build → crawl → index) that a KEEP/OPTIMIZE item doesn't.
- **Technical blockers** — an item blocked on a technical fix elsewhere in the report is sequenced after that fix.
- **Implementation lead time** — how long the action itself realistically takes to execute (a one-line meta-description fix vs. a full page build vs. a content cluster).
- **Measurement requirements** — whether the client needs to grant GSC/GA4/GBP access before an item's own impact becomes measurable.
- **Client-confirmation requirements** — an item gated on `POTENTIAL RELEVANCE — VERIFY OFFERING` confirmation is sequenced as a confirmation/decision step, not a build step, until confirmed.

**The roadmap must answer, for every item:** what can be done now · what should be done first · what unlocks something else · what is time-sensitive · what can run in parallel · what must wait (and on what) · what should be checked afterward · when. This is reasoning stated per item (report-contract.md §23 requires a one-line stated reason per row), not prose written fresh without reference to the factors above.

**Phase labels are generated, not templated.** Use whatever readable phase labels the actual generated timing calls for — e.g. Immediate, Days 1–3, Days 4–7, Week 2, Weeks 3–4, Days 31–60, Month 3, Quarter 2 — sized to what the findings actually require, not a fixed calendar grid reused engagement to engagement. Every phase boundary and its contents must be justified by the items actually scheduled into it.

### Seasonality → Prioritization & Timing (added 2026-08-16, feeds report-contract.md §23, §27, §29)

Seasonality (surfaced by Category A's seasonal/adjacent-opportunity gate check below, or by O9's seasonal-content step) is an **input to Roadmap & Timing Generation above, not only a standalone report section.** Apply this logic to every material seasonal finding:

```
IF meaningful seasonality is detected (an evidenced demand pattern, not assumed):
    identify the next relevant demand period
    compute lead time remaining, from the report/engagement date to that period
    identify which recommendations the window affects — a page, a content cluster,
      a GBP/local action, or (where the underlying offering is only
      POTENTIAL RELEVANCE) a client confirmation/decision step
    if the lead time is shorter than the affected item's realistic
      implementation-and-signal-accrual time (build → crawl → index → accrue
      ranking signal, see Expected-Progress below), elevate that item's roadmap
      timing accordingly
    if the relevant window has just passed, that MAY reduce immediate urgency
      even though the opportunity remains valid — state this explicitly rather
      than defaulting to elevated priority regardless of actual timing
    state the reason for any timing adjustment in the roadmap row itself
    set a measurement checkpoint tied to the window (see Expected-Progress below)
ELSE:
    do not manufacture a seasonal recommendation or timing adjustment —
    absence of evidenced seasonality is a valid, common outcome
```

**A confirmed opportunity is scheduled as a build/implementation item; a `POTENTIAL RELEVANCE` opportunity with real lead time is scheduled as a client-decision item with a stated deadline** — e.g. "the demand window is real and time-limited; deciding whether to pursue it should happen within N weeks" is a decision deadline, not a claim that the offering itself will be built in that time. Never collapse the two into the same kind of roadmap row — see [report-contract.md](report-contract.md) §29 for the report-facing requirement this feeds.

### Expected-Progress / Measurement Checkpoints (added 2026-08-16, feeds report-contract.md §27)

Every roadmap item eventually needs a checkpoint: a point where it becomes reasonable to check whether it's working. **Checkpoint timing is generated per item, not forced onto one fixed calendar** (e.g. a single 30/60/90/180-day grid applied uniformly regardless of what's being checked). Different indicators become checkable at genuinely different times — forcing all of them onto the same few dates either checks some before anything could plausibly have happened, or leaves others unchecked far longer than necessary. 30/60/90/180/365-day-style horizons remain available as client-facing presentation labels where they genuinely fit an item's own timing, but they are never the organizing structure itself.

**Type-specific expected-progress chains** (the sequence of indicators becoming checkable over time, per action type — apply the sequence; choose the actual checkpoint dates per engagement from the implementation date, the item's own realistic lead time, and any seasonality window):
- **NEW PAGE:** implementation → crawl/discovery → indexation → impressions/query discovery → ranking movement → clicks/conversions → reoptimization.
- **TECHNICAL FIX:** implementation → verification → recrawl → confirm corrected state.
- **GBP / LOCAL CHANGE:** implementation → verify profile state → monitor local visibility → monitor actions/leads.
- **CONTENT UPDATE:** implementation → recrawl → impressions/query changes → ranking/click changes → reoptimization.

**Never invent a universal promise about how quickly Google (or any platform) will respond.** State what to check and roughly when it becomes reasonable to check it — a monitoring checkpoint, not a guaranteed result timeline. Where a seasonal window applies, the checkpoint that matters most is whichever indicator would need to have moved before the window closes to make the item worthwhile — state that explicitly rather than defaulting to a checkpoint that lands after the window has already passed.

**Checkpoint vs. guarantee — required four-part structure per stage (added 2026-08-17).** Every checkpoint in the chain, in the client-facing Measurement Plan (report-contract.md §27) and the Implementation Workbook alike, states all four of:
1. **What may reasonably be visible** by this point, given the item's own type/lead time.
2. **What to check** — the specific data/screen/report to open, and the specific signal to look at.
3. **What not to panic about yet** — a plausible-looking non-result at this checkpoint that does not mean the item failed (e.g. zero ranking movement immediately after indexation is expected, not a red flag).
4. **What would warrant action** — the actual signal that means something needs attention or reoptimization, distinct from #3.

Phrase every checkpoint as "by this point, it becomes reasonable to CHECK whether X" — never "you should have X by this point." This structure is what the Implementation Workbook's later phases (report-contract.md §23a) must draw on to stay operational rather than degrading into generic "monitor and optimize" language.

---

## Analysis Categories (A–N) — Supporting Audit Layer

Necessary supporting evidence, not the primary deliverable. These categories explain *why* opportunity exists or is blocked, and feed evidence directly into the Opportunity Engine (Category A's SERP/competitor evidence feeds O5/O6; Category H's technical findings explain capture blockers; Category G's authority signals feed O5's difficulty read; Category I is the local-trust counterpart to O2's geographic-demand read; Categories K, L, and M feed the report-contract's Analytics-Readiness, Conversion-Readiness, and AI-Discovery scorecard rows). They also cover engagement-completeness requirements the Opportunity Engine doesn't itself replace (technical health, local trust/reputation, authority, site history, measurement readiness, conversion readiness, AI/entity discoverability, chatbot/automation opportunity). Full report-facing structure and completeness requirements for how this evidence is presented live in [report-contract.md](report-contract.md) — this section defines what to analyze, that file defines what the finished report must contain.

**A. Competitive Search Landscape** (opportunity + competitors, one connected analysis)
Identify actual organic competitors via SERP retrieval and organic-capture evidence (`dataforseo_labs_google_ranked_keywords` and similar) — client-named competitors are input signal only, not ground truth, and **prior local-pack appearance is not sufficient grounds to select a competitor for deeper analysis.** (Corrected 2026-08-10: earlier Mulberry Creek work defaulted to the two competitors that recurred in local-pack pulls; going forward, after the keyword universe (O3) exists, select competitor domains by evidence of actually capturing organic traffic across the important commercial clusters — including product/nursery-line competitors specifically where the business has a distinct product line, since those are frequently a different competitor set than the service-line competitors.) Assess demand, intent, commercial relevance, geo fit, and competition. Assess SERP-feature crowding and AI-Overview/zero-click exposure to judge whether ranking well would even produce traffic. Determine where competitors control the SERP and why, so the report can explain why a competitor wins and how the client can compete — not just that they do. Feeds O5/O6/O10.

**Social/platform search visibility (brief sub-note, made concrete 2026-08-10 — report-contract.md's "Search Beyond Google" treatment):** as a secondary, non-blocking, deliberately small part of this category, using only free tools already in the stack (WebSearch/Browser — no new vendor): (1) search the branded business name (+ location, if local) and note which social/platform profiles appear in the results; (2) check whether the business name, category, and location are described consistently across whatever profiles do appear (an entity-consistency check, not a follower-count/engagement audit); (3) note only where YouTube/Instagram/TikTok/Pinterest/Reddit/other platforms repeatedly occupy the business's actual target commercial SERPs (evidence from Category A's own SERP pulls, not a separate platform-by-platform audit). Keep this short and factual — it never substitutes for the core organic-competitor analysis above, and it is never a generic "post more on social" recommendation; every note must tie to an actual observed search result.

**YouTube content-repurposing note (2026-08-15, no new data required):** wherever an O9 content cluster's topic is genuinely video-friendly (how-to, buying-guide, visual-comparison intent), note that it could be repurposed as a YouTube video/Short, Reel, TikTok, or Pinterest asset — this is synthesis from clusters already built, not a new research pass, and every suggestion must trace to a real cluster already in the report, never generic "make more video content" advice. Formal YouTube SERP presence-testing is a separate, not-yet-priced capability — see [data-sources.md](data-sources.md).

**Entity/name-collision check (2026-08-15):** while running the branded-search check above, note if a same- or similarly-named, unrelated business surfaces (a genuine finding — it's evidence of an ambiguity risk in both traditional and AI-assisted search, not noise to discard). Report it as a factual disambiguation risk only; do not speculate about the other business's relationship to the client unless independently corroborated. See Category M for how this feeds AI/entity readiness, and the new Prior-Business/Entity-Transition Audit below for when to investigate further.

**Seasonal/adjacent-opportunity gate check (formalized 2026-08-15 from a real regression — see report-contract.md's Core Rule):** where research surfaces real, evidenced demand for a seasonal or adjacent opportunity outside the business's core confirmed offerings (e.g. a nursery with agritourism-adjacent assets showing real demand for a seasonal attraction), treat it as its own labeled finding, gated clearly as "opportunity worth evaluating" rather than a recommendation to build anything — and it must land in the report (main body if material, appendix otherwise) or carry a documented reason for exclusion. **A material opportunity discovered during research must never silently disappear during summarization** — this is now a standing report-contract.md rule, not a one-off fix.

**B. Business Value & Prioritization**
Traffic/rankings are inputs, not goals — prioritize by commercial relevance of demand. Use client-provided priority-service/economic input when available (optional, per O1/O8). Without it, default to SEO-only/relative prioritization per O8 and state that limitation explicitly. Never invent profitability/value data.

**C. Site Architecture**
Internally separate: information/URL architecture, page/topic inventory, navigation — one deliverable, distinct evidence per part. Derive from validated demand, SERP/competitive evidence, and visitor usefulness — never a fixed page-count template. Existing sites: classify each important page/action KEEP / IMPROVE / CREATE / CONSOLIDATE / REMOVE. No site: evidence-based initial architecture, no classification.

**Location/service-area pages, specifically (corrected 2026-08-10, from the Mulberry Creek engagement):** evaluate on confirmed business/service relevance to that market, confirmed target-market status, demand, competitive landscape, ability to support the page with genuinely useful differentiated local content, and business value/priority where known — never on whether the business already has search visibility there. Lack of current visibility is not disqualifying and can itself represent the opportunity a location page is meant to capture. Conversely, never recommend a location page merely because a target city exists on a list — a page without real differentiated local content behind it is a thin/doorway page and should not be built regardless of how many of the other criteria are met. As of V0.2, this decision is made jointly with O2/O4 — see those layers for the market-classification-to-page-type mapping.

**D. Page-Level Recommendations — On-Page Quality Module (expanded 2026-08-15)**
Technical SEO (Category H) and on-page/page-quality are distinct questions — a page can be perfectly crawlable and indexable while still being the wrong content for its intended query. This module answers that second question for every important existing page.

**Classify each important existing page into exactly one of:**
- **KEEP** — already strong/appropriate for its intended search intent.
- **OPTIMIZE** — correct page and intent, execution needs improvement (title/meta/headings/depth/trust signals).
- **EXPAND** — correct topic, missing important subtopics/entities a competitor or the SERP shows are expected.
- **MERGE** — two or more pages overlap enough that they're competing with each other (cannibalization) and should become one stronger page.
- **REDIRECT** — obsolete/duplicate page should consolidate into another URL.
- **CREATE** — an important search intent has no page at all (feeds directly into O4's Money Page records and the Recommended Website Structure).

**Per page, evaluate:** search-intent alignment, primary topic, keyword targeting, title, meta description, H1, H2/H3 structure, topical completeness vs. what the SERP/competitors cover, missing subtopics/entities, thin content, duplicate/overlapping content (cannibalization — cross-reference O4's clusters so two money pages never silently target the same intent), image presence/alt text, calls to action, trust/proof elements, local relevance where applicable, internal links in and out, schema opportunities, conversion considerations, and — bluntly — whether the page actually deserves to rank for its intended query given what's already winning that SERP.

**Evidence source:** `on_page_content_parsing` (see [data-sources.md](data-sources.md)) provides the parsed page text/headings/internal-link data; cross-reference against O3/O4's keyword clusters to judge topical completeness and cannibalization — this is analysis of already-retrieved content, not a fresh manual read of the live site for every page.

**Size-agnostic rule (this must work for a 1-page site, a 30-page site, and a 500-page site):** audit every important existing page up to roughly 30. Beyond that, sample representatively by template/page-type and traffic tier (e.g. a handful of category pages, a handful of product pages, top organic landing pages) rather than attempting exhaustive coverage — and say explicitly in the report that sampling was used and what wasn't covered, never silently truncate the page list without saying so.

**Page Blueprints (new, feeds report-contract.md's Page Blueprints requirement):** for every CREATE or high-priority OPTIMIZE/EXPAND page, produce an implementation blueprint — not the finished page copy, an actionable spec: recommended URL, primary search intent, primary keyword cluster, suggested SEO title, suggested meta description, recommended H1, a suggested H2-level page outline (intro through FAQ through final CTA), and — where appropriate — photos/media needed, proof/trust elements, products/services that should be represented, FAQ topics, CTA placement, internal links in/out, external links where appropriate, schema type, and related articles/money pages. **Tier the depth of the blueprint to priority** (per explicit user instruction, 2026-08-15): full detailed blueprints for the highest-priority pages, a lighter treatment (URL, intent, primary keyword, one-line rationale) for lower-priority ones — do not give every page the same depth of treatment regardless of priority, that buries the important ones and bloats the report. The report tells the client *what* needs to be built and *why*; it does not ship finished page copy — that's what the implementation product is for.

**E. Content & Topical Strategy**
Superseded operationally by O9 (Content Opportunity), which is the actual discovery methodology. This category remains for any content-adjacent finding that isn't a publishable-topic record (e.g., structural content-quality issues, cannibalization, duplicate/thin content, freshness/decay). Check cannibalization (multiple pages targeting the same intent) and duplicate/thin content. Check freshness/decay where historical performance data is available.

**F. Internal Linking**
For an **existing site** (Mode 1): broken links, orphan pages, weakly linked important pages, missing contextual links, navigation/hierarchy problems. Where the existing site has too little structure to audit (e.g. a single-page site), mark this half explicitly Not Applicable rather than forcing findings — that's a real, correct outcome, not a gap.

**Recommended internal-linking strategy (extended 2026-08-10 — applies in every mode, per [report-contract.md](report-contract.md)'s Internal Linking Strategy requirement under Section 6):** independent of whether an existing-site audit ran, produce specific recommended linking relationships for the *proposed* page structure (C's KEEP/IMPROVE/CREATE/CONSOLIDATE/REMOVE classification + O4's Money Page records) — which informational/supporting pages should link to which money pages, and which money pages should link to each other. This is synthesis from already-collected records, not a new data pull. Every recommended relationship must reference an actual page recommended elsewhere in the analysis; never invent a page solely to complete a linking relationship.

**Present linking within the cluster it belongs to, not as one flat undifferentiated list (2026-08-15):** the relationship between an O9 content cluster's supporting articles and the money page they support *is* the primary internal-linking story for most clients and should be shown together (which articles feed which money page), with cross-links *between* money pages shown as a separate, shorter list. A reader should never have to infer the connection between "Recommended Website Structure," "Keyword & Topic Clusters," and "Internal Linking" — they're three views of the same underlying page/cluster records, and should read as connected, not as three separately-invented sections.

**G. Authority & Trust**
Keep backlinks, reviews/reputation, citations/NAP, and on-site trust/E-E-A-T signals analytically distinct — never merged into one score. Backlinks: referring-domain profile, relevance/quality patterns, competitor link gaps, anchor patterns. Surface unusual patterns as informational only — never auto-recommend disavowal. Reviews/citations/E-E-A-T are assessed under Local Search (I) for local/regional businesses; otherwise assessed here. Feeds O5 (difficulty).

**Legitimate Link/Citation/Mention Opportunity (added 2026-08-17) — a distinct analysis from the backlink baseline above, not a rewording of it.** A backlink-profile finding ("thin but clean") describes the current state; this identifies realistic, legitimate ways to improve it, based on the business's actual industry, location, and type — chambers/local business organizations, legitimate directories, industry/trade associations, supplier/manufacturer dealer directories, local news/community organizations, relevant niche directories, legitimate review platforms, local/neighborhood resources, community partnerships and sponsorships, and authentic expert/community participation. Where technically feasible, check whether the business already appears on a candidate source (reuse Category A's branded-search evidence and G's own referring-domain data rather than a fresh pull per source). Record each candidate as: source/platform, currently present (yes/no/unconfirmed), opportunity type, industry/local relevance, effort, priority. **Hard ethical line, matching Category M's guardrail: never recommend spammy link drops, fake conversations, astroturfing, or mass link posting as SEO strategy.** Forums/community platforms (Reddit, Quora, neighborhood boards, etc.) may be named only as opportunities for authentic participation, referral traffic, expertise-building, or AI-search corroboration — never as link-acquisition targets.

**H. Technical SEO & Indexation**
Crawlability/indexability (robots.txt, canonical, noindex, sitemap), redirects/status codes, mobile rendering, structured data validity, duplicate/thin content, crawl-budget issues (scale-dependent), detectable manual-action/penalty signals. Present as FIX NOW / IMPROVE / PASSED / NOT EVALUATED per [report-contract.md](report-contract.md)'s Technical SEO Analysis section — **the full itemized table belongs in the main report, not a compressed prose summary** (this was corrected 2026-08-10 after a real regression: an expanded-keyword-research round left a prior technical audit compressed to two summary bullets in the client report — see report-contract.md's Core Rule). Explains capture blockers feeding O6/O7.

**Lighthouse/performance sub-audit (expanded 2026-08-10, now permanent — [report-contract.md](report-contract.md)'s Lighthouse/Performance Error Analysis section):** test representative page types, not just the homepage — homepage, main service/product page, category page, an important location page, a blog/article, a major organic landing page, and (for ecommerce) a product page. Capture category scores, Core Web Vitals where available, and the actual failed audits/opportunities/diagnostics, not just a score. Classify each by severity (Critical/High/Medium/Low/Informational) and by scope (site-wide/template-wide/page-type-specific/individual-page-specific) — a template-wide issue outweighs the same issue on one minor page, and the report says so. The specific tool is substitutable (paid Lighthouse call vs. a free tool like PageSpeed Insights, per each engagement's data-plan) — the multi-page-type, full-diagnostic requirement itself is not.

**I. Local Search** (first-class when the business is local/regional — not a subsection of backlinks or technical)
GBP profile completeness/optimization, local pack competitive dynamics, reviews/reputation, citation/NAP consistency, local-specific ranking factors. Complements O2's demand/competition read with trust/reputation evidence.

**Tool correction (2026-08-15):** GBP profile fields (category, description, hours, attributes) and review-level data (velocity/trend, not just a count) are retrievable via `business_data_google_my_business_info` and `business_data_google_reviews` respectively — see [data-sources.md](data-sources.md) for verified pricing (both cheap, well under $0.10/report combined). `business_data_business_listings_search` stays in scope but only for its correct purpose — finding *nearby competitor* listings, not fetching the client's own profile. Citation/NAP consistency across directories remains a genuine unmapped gap with no current tool. Never infer it, and per the No Unfinished-Research Exposure rule (revised 2026-08-17), do not include a client-facing "Not Evaluated" row for it either — omit it from the client-facing checklist/scorecard entirely rather than flagging the capability gap; record the gap internally in `findings.md` only.

**J. Site History** (Mode 1, and owned lead-gen sites evaluated in Mode 3)
Include relevant history (redesigns, migrations, manual actions, major known issues) where evidence is available. Present as context only — never claim unsupported causation between a historical event and current performance.

**K. Analytics & Measurement Readiness** (added 2026-08-10, per [report-contract.md](report-contract.md)'s Analytics & Measurement Readiness section — always in scope, not conditional on Mode)
Evaluate whether the business can currently *measure* organic-search performance — a distinct question from whether it currently ranks. Never assume analytics are correct merely because GA4/GSC exist; verify, don't assume. **GSC, when accessible:** correct property verification, indexing/coverage visibility, clicks/impressions/queries/pages, crawl/indexation issues, manual actions or security warnings when accessible. **GA4, when accessible:** installed correctly, duplicate tags, misconfiguration, traffic attribution, event tracking, conversion/key-event setup. **Lead attribution:** whether the business can track forms, phone calls, bookings, ecommerce purchases, direction requests, quote requests, and other meaningful conversions. Where GSC/GA4/tracking access isn't authorized, keep the finding row and mark it explicitly unavailable — never guess at measurement state.

**L. Organic Conversion Readiness** (added 2026-08-10, per [report-contract.md](report-contract.md)'s Organic Conversion Readiness section)
SEO success is not only rankings — evaluate whether important pages (existing or O4 Money Page candidates) can actually convert the organic traffic they'd receive. Per page: CTA visibility, clarity of next action, phone prominence/click-to-call, forms and form friction, booking process, trust signals (reviews/testimonials/credentials/guarantees/about-expertise), service/product clarity, geographic clarity, pricing/cost expectations where appropriate, visual proof, user journey, mobile conversion friction. Identify obvious traffic-leak points before they become a lost lead. **Keep this focused on SEO ROI — this is not a full CRO engagement**, and never expands into a redesign recommendation on its own authority.

**M. AI Discovery & Entity Readiness** (added 2026-08-10, substantially upgraded 2026-08-16, per [report-contract.md](report-contract.md)'s AI Discovery & Readiness and Entity & Business Information Readiness sections)
Two related sub-analyses, one category. *AI discovery* is a **recommendation/citation analysis, not a presence check**: for a small number of strategically-selected customer-intent prompts (derived from this engagement's actual keyword/business research, never generic), does the business get mentioned, does it get actively recommended, is its website linked/cited, which competitors get recommended instead, which third-party sources the answer draws on, and whether entity ambiguity is distorting the answer. **This is explicitly distinct from Category A's AI-Overview/zero-click SERP check** — an AI Overview appearing on a Google search result page is a different fact from ChatGPT/Perplexity/Gemini/Grok recommending or citing the business, and the two must never be conflated or treated as evidence of each other. Classify Strong/Moderate/Weak/Not Yet Established/Not Evaluated This Round. *Entity/business-information readiness*: whether business name, type, services, products, locations, hours, contact info, and expertise are consistent across website, schema, GBP, citations, and social/platform profiles — a cross-check of evidence already gathered under H and I, not a new data pull. Never invent "GEO hacks" — recommendations here should strengthen human readers and traditional search too, not target AI systems alone. Never promise a specific AI-platform citation/recommendation as a guaranteed outcome.

**AI Search Readiness framework (added 2026-08-16 — the redesign that makes this category substantive even when live platform testing isn't available).** Platform-visibility testing (above) answers "did we observe the business getting recommended." This framework answers the separate, always-answerable question: **"how ready is this business to be understood, trusted, and cited by any AI system?"** It is never "Not Evaluated" wholesale merely because platform testing wasn't performed — most of its 7 dimensions are directly assessable from evidence already gathered elsewhere in this engagement (Categories D, H, I), not a new data pull:

1. **Entity clarity** — can an AI system confidently identify this specific business? Consistent name/location/contact info across surfaces, LocalBusiness schema presence, an About page, same-name business conflicts (cross-reference the entity/name-collision check above), GBP consistency, authoritative third-party references.
2. **Crawlable, citable information** — does the site contain clear factual information an AI system can extract: services, products, service area, FAQs, pricing/cost ranges where appropriate, process, expertise, inventory/category detail, business history, credentials, unique facts. Cross-reference Category D's on-page evidence rather than re-reading the site.
3. **Third-party corroboration** — where is the business discussed outside its own website (reviews, local directories, trade/industry sites, local media, community sites, legitimate forums, social platforms). **Hard ethical line, non-negotiable: never recommend or imply fabricated reviews, fake forum/Q&A threads, astroturfing, or any simulated third-party content.** Legitimate participation only — answering real questions transparently, earning genuine mentions, encouraging real customers to share real experiences, authentic community/trade/PR involvement.
4. **Expertise/experience signals** — what information would make this business a credible source an AI system would want to draw on.
5. **Conversational query coverage** — cross-reference Category N below; which conversational questions from this engagement's actual keyword research does the site currently answer, and where are the gaps.
6. **Structured data** — exactly which schema/entity markup is relevant to this business and why, not a generic "add schema" recommendation.
7. **AI-ready content format** — practical formatting guidance: clear headings, concise direct answers, FAQs, tables, factual statements, named entities, dates where relevant, sourceable statistics, unique first-party information.

Rate each dimension only where this engagement's evidence supports a rating (Strong/Moderate/Weak/Not Yet Established/Not Evaluated This Round, per the existing classification scale) — an unrated dimension states plainly what's needed to rate it, never a guessed rating. Close with a **Now / Next / Later** prioritized action plan, connected explicitly back to the same underlying SEO strategy elsewhere in the report (schema and content-quality work already recommended in Categories D/H double as AI-readiness work — never present "AI SEO" as an unrelated parallel product).

**Platform list is configurable, never hard-coded (2026-08-16).** AI Discovery testing should cover whichever AI/answer surfaces are actually relevant and testable at the time of the engagement (candidates today: ChatGPT Search, Perplexity, Gemini, Grok, Google AI experiences) — this list is expected to change as the AI-search landscape changes, and the methodology/report template must not bake in today's platform set as a permanent fixture.

**Current real capability, and the client-facing consequence (2026-08-16, restructured 2026-08-17 per the No Unfinished-Research Exposure rule).** As of this revision, the tool stack does not include paid API access to ChatGPT/Perplexity/Gemini/Grok, and manual browser-based testing of consumer AI surfaces is not yet a budgeted default step. **Where multi-platform testing genuinely wasn't performed this round, the client-facing AI Discovery Scorecard (report-design-system.md) is omitted entirely, not shown with every cell marked "Not Evaluated."** A table that is structurally all-empty exposes Scrolly's own unfinished research, which the No Unfinished-Research Exposure rule prohibits regardless of how honestly each cell is labeled. Fold the one genuinely available signal (Google AI-Overview presence, already captured in Category A's SERP pulls) into 16b's prose as a stated partial signal about Google specifically, and let 16b's evidence-based readiness assessment (which doesn't depend on platform testing) carry this category's substantive content. Never simulate or infer a platform result to fill the table instead.

**Manual-fallback protocol, while dedicated multi-platform tooling doesn't exist (tightened 2026-08-10, reaffirmed 2026-08-16, scorecard behavior corrected 2026-08-17):** the `ai_opt_llm_ment_*`/`ai_optimization_*` DataForSEO tools (see [data-sources.md](data-sources.md)) are candidate/unverified — do not treat them as a production data source. Where time/budget allows manual testing (an analyst actually running the derived prompts through consumer AI surfaces), do so and record real results, and build the scorecard from those real results. Where it doesn't, omit the scorecard per the rule above rather than publishing an empty one. **This step is also an explicit checklist item in [discover-engine.md](discover-engine.md)'s protocol (not just prose here) so it can't be silently skipped by oversight during a rebuild.**

**Entity ambiguity (2026-08-15):** a same/similarly-named unrelated business (see Category A's entity/name-collision check) is exactly the kind of thing that degrades both traditional and AI-assisted entity resolution — note it explicitly under this category's entity-readiness read, not just as a Category A curiosity, since it directly affects whether AI systems can confidently identify *which* business is being asked about.

**N. Conversational Search Mapping & Light AI Automation Opportunity** (added 2026-08-10, chatbot definition corrected 2026-08-16, reworded and Light AI Automation demoted to conditional-only 2026-08-17, per [report-contract.md](report-contract.md)'s Chatbot/Conversational Opportunity and Light AI Automation Opportunity sections)
**Corrected framing (reworded 2026-08-17 to the exact required client-facing phrasing): "This section is not evaluating whether your website needs or should have a chatbot. Instead, it evaluates the conversational questions someone might ask an AI assistant or chatbot that could lead them to your business, and whether your website currently has the right pages and information to answer those questions."** The primary analysis maps **the conversational questions a potential customer might ask an AI assistant or conversational search surface that could lead them to this business** (derived from the client's actual keyword/business research), and for each: which existing page already answers it, which recommended page should, what content/information needs to exist for an AI system to answer it well and correctly attribute the business, and whether it connects to an AI-recommendation/citation opportunity identified in Category M. Classify overall: High-value/Potential/Low priority/Not recommended.

**Light AI Automation Opportunity is conditional-only, not a default/always-present section (changed 2026-08-17 — it was previously a required standing section; a generic AI-automation idea does not belong in an organic-search product).** Only surface a business-process automation opportunity when this specific engagement's evidence ties it materially to organic-search execution, lead capture from organic traffic, measurement, or content/search operations — never include it merely because AI could plausibly automate something generic (review-follow-up drafting, inquiry routing, etc., named only as illustrative examples of the kind of finding that would qualify, not a checklist to fill in every report). Where no such materially-relevant finding exists this engagement, omit the section entirely rather than including a placeholder note — this is a valid, common outcome, not a gap.

**Prior-Business / Entity-Transition Audit** (new 2026-08-15, conditional — run only when evidence suggests it's relevant, never by default)
Some businesses operate from a location or under a name that recently changed hands — a takeover, rename, relocation, or rebrand. When client intake or research surfaces evidence of this (never assume it from a visibility gap alone — a takeover is not automatically the explanation for a technical or nursery-visibility gap found elsewhere in this methodology), investigate where possible: previous business name, old Google listings, duplicate GBP listings, inherited reviews/profile history, old citations, inconsistent NAP, old websites/domains, old social profiles, old directory listings, conflicting business names, brand/entity confusion, and redirects from old domains where relevant. Use only free/already-available tools (WebSearch, the GBP-lookup tools above) — this is a research-depth question, not a new paid capability. Present findings factually, distinguish confirmed from unconfirmed relationships clearly, and never assert a causal link to a current SEO problem unless the evidence actually supports it. **Trigger condition, stated explicitly in the report either way:** run this when there's real evidence of a transition (a differing business name in a directory listing, a client mention, a search result referencing a prior operator); skip it with a one-line stated reason when there isn't — this module does not run by default for every client, and forcing it onto a business with no transition history wastes report space on a non-finding.

## Risk — Never Auto-Prescribe

Domain migrations/rebrands, backlink disavowal, subjective brand/positioning changes, compliance-sensitive/YMYL-specific advice. Render these as a flagged consideration (evidence + limitation noted) in the structured analysis and appendix; exclude from the prioritized action list and simple-report priority actions; note that professional judgment is required.

## Data Capabilities

**Always required:** website/domain and physical location(s) if local (O1's absolute minimum — nothing else about the client's business is required); demand/keyword data (volume/trend, geo-adjusted where local); SERP retrieval (results + features present: organic, local pack, PAA, featured snippet, ads, AI overview); competitor identification derived from SERP/organic-capture retrieval per Category A's corrected rule; current organic capture data for the client's own domain (O6) where an existing site exists; industry/category-expansion reasoning to build O3's candidate tier when confirmed inventory is thin or absent.

**Conditionally required:** site crawl + technical/performance data (Mode 1; Mode 3 owned lead-gen sites) including the multi-page-type Lighthouse/performance sub-audit; local data — GBP, local pack, citations (local/regional businesses); backlink/referring-domain data (wherever authority findings are made); geographic candidate screening data (O2, local/regional businesses only — runs regardless of whether the client supplies a service radius); Category K's GSC/GA4/conversion-tracking evidence (authorized-access only — not a DataForSEO capability, see data-sources.md); Category L's conversion-readiness evidence (direct site read, same free/manual method as Category H's on-page checks — not a DataForSEO capability); Category M's AI-discovery evidence (candidate DataForSEO AI-mention tools, unverified — see data-sources.md — falls back to manual/free inspection); Category N's chatbot/automation read (qualitative, built from O1 business-model understanding + Category L friction points — no data pull).

**Optional, confidence-boosting — improves the report, never blocks it:** business description, known service area, priority growth line, markets definitely served/excluded; first-party GSC/GA (authorized) — the only source of directly observed traffic capture, as opposed to O6's modeled estimate; historical/archive data; client-provided economics (detailed inventory, best sellers, ticket value, margin, close rate, capacity) for O8's `client_specific_economics` field and O3's confirmed-tier expansion.

**Broad/regional demand ≠ local addressable opportunity (standing rule, generalized 2026-08-10 from the Mulberry Creek pumpkin correction):** state- or national-level search volume for a geographically-bound business may only be used as evidence of category existence and seasonality. It must never be presented as that business's addressable search opportunity. Sizing a real local/regional opportunity requires O2's catchment-based screening (or an equivalent defensible regional-geography methodology) — never a broad-geography volume figure standing in for it.

**Local Business Demand Hierarchy (added 2026-08-17 — governs presentation order, feeds report-contract.md §7).** For any geographically-bound business (local/regional mode), demand evidence is presented in this order, primary figure first, every other tier as explicit secondary context:

1. **Core market** — the confirmed HQ/primary catchment (O2's `Core` classification).
2. **Secondary service markets** — O2's `Secondary` classification: real enough demand/proximity to include in service-area copy, not yet a dedicated page.
3. **Relevant regional/metro context** — only where actually retrieved; state plainly when it wasn't ("regional/metro data not separately retrieved this round"), never invent it.
4. **State-level data**, where genuinely useful and retrieved.
5. **National data** — context only, always last, always explicitly labeled as category-scale context rather than addressable demand.

**A small town's realistic customer base is rarely bounded by its own city limit** — O2's Secondary/Monitor markets exist precisely to capture this; city-limit-only figures can materially understate real opportunity, which is exactly why tiers 1–2 (not tier 1 alone) constitute "local" for this hierarchy's purposes.

**Seasonal demand follows this same hierarchy (added 2026-08-17, tightened 2026-08-17 second pass) — a broad-geography seasonal spike is not exempt from it, and this is a structural requirement, not a disclosure.** A statewide or national seasonal search spike identifies that a seasonal opportunity category exists and roughly when it peaks; it does not by itself demonstrate that *this* business, in *its* market, can capture meaningful seasonal demand. **The seasonal section must open with whatever local/catchment-level evidence exists — local-pack testing, local competitor presence/absence, local search behavior — before any state/national figure appears, even when the local evidence is thinner than the broad-geography number.** The broad-geography figure (Texas-wide, national) follows as supporting/scale context, never as the section's lead statistic or its first callout. Where local-level seasonal *demand* wasn't separately volume-tested (a common, honest outcome for a low-volume niche seasonal query) but local *competitive* evidence was gathered (who currently serves this seasonal demand in the client's own market), lead with that competitive evidence instead — it is real, local, and exactly the kind of evidence this hierarchy exists to prioritize. Only fall back to leading with the broad-geography number when literally no local-market evidence of any kind (demand or competitive) was gathered — and even then, do not narrate that local testing "wasn't run" or "wasn't performed this round" (see the No Unfinished-Research Exposure rule below); simply present what was found, in hierarchy order.

**Never manufacture a combined local-volume number.** Do not sum demand across overlapping or nearby geographies, and do not population-adjust or otherwise scale a national figure down to estimate a local one, unless the underlying data source's own methodology actually supports that calculation (it currently does not, for any tool in `data-sources.md`). Where per-tier local/secondary data was genuinely retrieved (O2's Tier 1 location-parameterized demand calls), present those real per-market figures side by side, not summed. **A standalone table whose only populated volume column is national-level does not belong in the main report body (tightened 2026-08-17)** — where a broader commercial keyword pool has only national-level data because it was never geo-tested, either (a) fold the phrases into the main report without a misleadingly prominent national-volume column (present the phrase/intent only), or (b) move the full national-volume table to the appendix as supporting category-scale context. The main report's visible tables must never lead a reader's eye to a national number as if it were this business's opportunity, in any table, not only the first one.

## No Unfinished-Research Exposure (added 2026-08-17, standing rule)

**Two genuinely different kinds of "missing data" exist, and they must be handled differently in client-facing output:**

1. **Client-access-dependent.** Data that requires the client to grant something Scrolly cannot manufacture on its own (Google Search Console, GA4, GBP dashboard access, first-party conversion-tracking systems). This may be described plainly and professionally in client-facing output (e.g., "Available once you grant Search Console access," "Measurable After Access Granted") — this is a real, external dependency, not a Scrolly fulfillment gap, and disclosing it is honest and useful to the client.

2. **Scrolly-incomplete research.** Any analysis Scrolly's own tools/process are responsible for retrieving (paid API calls, free-tool tests, platform testing, competitor comparisons) that was not completed this round due to budget, capacity, scope, or time. **This must never be exposed to the client as a gap, in any wording, including a professionally-reworded one.** Banned regardless of phrasing: "Pending Validation," "Not Evaluated This Round," "requires paid research," "a funded validation batch," "wasn't run this round," "tool capacity exhausted," "future round," "What We Still Need to Know" framed around Scrolly's own unstarted work, or any equivalent restatement. This supersedes the Client Language Rules' earlier "professional rewording" guidance for this specific category — the fix is not a better-worded disclosure, it's removing the disclosure.

**Resolution, in order of preference:**
- **Production/normal paid engagements:** this is exactly what the Minimum Paid-Report Completeness Gate (discover-engine.md) exists to prevent — a `REQUIRED TO SHIP` source that fails retries and fallback blocks delivery entirely (`INCOMPLETE_REVIEW_REQUIRED`) rather than shipping with the gap exposed. The customer never sees an incomplete report.
- **Where research genuinely wasn't completed and the report still needs to be produced (e.g., a sample/regression/demo case):** restructure the output so the gap isn't visible — present only the confident, completed findings; omit a section, scorecard, column, or row that would only be populated by the missing research, rather than including it half-empty with an explanatory note. A scorecard that is 90% "Not Evaluated" fails this rule even if every cell is honestly labeled — the fix is not including that scorecard at all until the underlying testing exists, not labeling it honestly.

**This does not relax the ban on fabrication.** Never invent a number, score, or finding to fill the gap instead. The choice is always between (a) actually completing the research, (b) blocking delivery, or (c) omitting/restructuring the unsupported output — never (d) disclosing the gap, and never (e) inventing data to hide it.

**This is distinct from a genuinely-explored-but-inconclusive finding.** Where Scrolly's research *did* run but produced ambiguous, conflicting, or low-confidence results (e.g., a listings call that returned unreliable data, an entity-collision risk that couldn't be fully corroborated), the Core Rule's existing disclosure steps still apply — that is real, completed research whose honest result is uncertainty, not an unstarted analysis. The distinction is whether the analysis ran at all, not whether it produced a clean answer.

**Fallback behavior (revised 2026-08-17 — apply the No Unfinished-Research Exposure rule above to distinguish which of these actually reach client-facing output):**
- Missing conditionally-required capability, client-access-dependent (GSC/GA4/GBP/tracking) → state the limitation plainly in client-facing output, downgrade affected findings to Low confidence, continue the rest of the report. This category is exempt from the No Unfinished-Research Exposure rule.
- Missing conditionally-required capability, Scrolly-incomplete (a paid/free tool call Scrolly's process didn't complete) → do not state this as a limitation in client-facing output. Internally (`findings.md`) record what was attempted and why it's incomplete, at Low confidence, per the Core Rule's fallback steps — that internal record is what feeds the Completeness Gate. The client-facing report either omits/restructures the affected section per the No Unfinished-Research Exposure rule, or the engagement doesn't ship until the gap is closed.
- Missing always-required capability (e.g., no demand data for a hyper-niche term) → proceed with qualitative/SERP-based analysis at Low confidence rather than blocking the report or inventing numbers; state this only if it reflects a genuine data-source limitation (e.g., no tool measures this at all) rather than Scrolly's own incomplete research pass.
- Missing optional capability → cap affected findings at Moderate confidence. Missing detailed inventory does not block O3 (see O3's four-source discovery model); missing client economics does not block O8 (report `commercial_value_proxy` with `client_specific_economics: Not provided`, see O8) — economics specifically stays exempt from the exposure rule since "not provided" is a client-side fact, not a Scrolly research gap. Neither is a degraded report — both produce a complete, usable $299 deliverable on their own.

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
- **Roadmap timing and measurement checkpoints are generated per item from the Roadmap & Timing Generation / Seasonality / Expected-Progress rules above — never assigned from a fixed calendar template by category, and never forced onto a uniform checkpoint grid regardless of what's being checked.** A seasonal finding that goes on to have zero effect on any roadmap item's timing must carry a stated reason why not.
- Discover ends at the prioritized recommendation — no execution, QA, measurement, or content generation.
