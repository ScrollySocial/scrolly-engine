# Report Contract (Permanent — V1.1)

**This is a permanent output contract.** It applies to every SEO Discovery Report this system generates, regardless of client, mode, or which methodology file changed most recently. [discover.md](discover.md) governs *what to analyze* (the O1–O10 Opportunity Engine + A–N Supporting Audit) and *how to judge it*; [discover-engine.md](discover-engine.md) governs *how/where the work happens*; this file governs *what the finished report and appendix must contain and how they must be organized*, independent of which data sources or agents produced the underlying evidence.

**The finished report must function as a complete organic-growth decision document for a business owner** — not a raw audit, keyword export, or research memo.

**Cross-reference style note:** sections in this file are referenced elsewhere by name, not by number. Numbers below are for readability and sequencing only — they are expected to shift as sections are inserted over time (this revision itself inserted five new sections). Never assume a numbered reference from an older file version still points to the same section; match by name.

## Core Rule — Later Research Enriches, Never Replaces

**Later research stages must enrich earlier analysis, never replace it.** This is the single most important rule in this file, added after a concrete failure: an expanded-keyword-research round compressed a prior engagement's technical, competitor, backlink, and site-structure findings down to two summary bullets in the client report — the underlying findings still existed in `findings.md`, but the report itself silently dropped them. **Every required analysis must survive through final report generation unless newer evidence directly invalidates it.**

Concretely: `findings.md` is append-only across rounds within an engagement. Report generation (Step 13 in [discover-engine.md](discover-engine.md)) must render *every* category's full findings into the report — Technical (FIX NOW/IMPROVE/PASSED, itemized), Competitive Landscape (per-competitor detail), Backlink/Authority (classified), Local/GBP — not a prose summary standing in for them. A prose summary is not itemized detail. "Main report = decisions" (below) means the appendix doesn't have to duplicate raw evidence twice, not that the main report can compress FIX NOW/IMPROVE/PASSED items or per-competitor findings into a couple of sentences. Each itemized finding *is* a decision (a fix, a priority, an action) — that's exactly what belongs in the main report, in full, not summarized away.

If data is unavailable for a required analysis **and the gap is client-access-dependent, or the analysis genuinely ran but produced an inconclusive result** (see the No Unfinished-Research Exposure rule under Client Language Rules, and [discover.md](discover.md)'s fuller version — this 6-step fallback does not apply to Scrolly-incomplete, never-run research; see that rule for what to do instead):
1. Keep the section.
2. State what was tested.
3. State what was confirmed.
4. State what could not be verified.
5. State what additional data/access is required to resolve it.
6. Never invent or estimate evidence unless clearly labeled as a scenario or inference.

**Where the gap is instead Scrolly-incomplete research (a paid/free tool call or platform test that simply never ran this round):** do not apply the 6 steps above client-facing — that would expose the gap in professionally-worded disclosure language, which the No Unfinished-Research Exposure rule specifically prohibits. Instead: complete the research, block delivery until it's complete (normal paid engagements, via the Completeness Gate), or omit/restructure the affected section so the gap isn't visible. The *module itself* (Technical, Backlink, Competitive, etc.) is never dropped — that remains the Core Rule below — but an individual sub-finding that Scrolly simply never got to is omitted rather than flagged.

**A report fails this contract if it silently omits a required module because:** later keyword research was deeper · API/data-source funding or credits ran out · some data was unavailable · one agent or processing stage overwrote another's output · the report was shortened for readability · another methodology revision occurred. **None of those are valid reasons to drop a module.** A required module (the section itself) must always be present with its confidently-known content; an individual data point Scrolly didn't get to is handled per the paragraph above, not by dropping the whole module. Missing *required sections* are never acceptable — see the Final Quality Gate at the end of this file.

If new evidence contradicts old evidence: preserve the discrepancy, determine which source is more reliable/current, explain the update in the report, and replace the *conclusion* only when justified by the evidence. **Never silently overwrite a finding.**

**No silent disappearance (added 2026-08-15, after a real regression).** This rule exists because it already happened once: a real engagement's `findings.md` contained three High-confidence rows plus a full appendix section on a seasonal/adjacent-opportunity gate check, and the client-facing `report.md` contained zero mention of any of it — not because the data was dropped from `findings.md`, but because report *authoring* simply never surfaced it. **A material opportunity or finding discovered during research must do one of exactly three things: appear in the main report, appear in the appendix, or carry a documented, stated reason for exclusion.** "It didn't fit neatly into a section" is not a valid reason. [discover-engine.md](discover-engine.md)'s Final Quality Gate step includes an explicit check for this — walking every High-confidence finding that doesn't map cleanly onto a standard category and confirming it landed somewhere in the draft output — precisely because "the category was analyzed" and "every finding from that category reached the client" are different questions, and only checking the first one is what let this regression happen.

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

**Seven-part narrative order (revised 2026-08-16, second revision — supersedes the six-part version this replaces).** The numbered sections below stay the authoritative content checklist — every one of the 29 areas must still be identifiable and delivered — but the *report itself* should read as one coherent story, fundamental-to-specific, in seven parts. A client should be able to tell which part they're in without checking a table of contents, and the ordering itself should teach the underlying logic: demand → foundation → build → discovery-beyond-Google → secondary opportunities → payoff.

1. **Part I — Executive Opportunity.** *What is the opportunity and why should I care?* Executive Opportunity Summary, Current Wins, and a "Search Data at a Glance" snapshot table of the report's strongest supported facts. Keep this high-level and skimmable — no title-tag/meta/H1-level implementation detail belongs here. (§1, §2.)
2. **Part II — Search Demand & Current Visibility.** *What are people searching for, and where do you stand today?* Keyword Opportunity Analysis (with a cluster **summary table first**, detailed cluster cards second — the reader sees the whole landscape before the highest-priority detail), Keyword & Topic Clusters, Keyword Competition & Expected Ranking Difficulty, SERP Composition/AI Overviews/Zero-Click Risk, and Competitive Landscape. (§§7–10, 13's demand-mapping half.) Keep three conclusions distinct — **demand exists** ≠ **we currently rank** ≠ **we are likely able to compete** — never infer the third from the first alone.
3. **Part III — The Foundation Required to Capture That Demand.** *What has to be true of the website and business presence before it can capture the demand in Part II?* Technical SEO, Lighthouse/Performance, Analytics & Measurement Readiness, On-Page Quality of *existing* pages (§6a), Google Business Profile & Local Search, and Organic Conversion Readiness. (§§3–6a, 11–12.)
4. **Part IV — How to Build the Search Presence.** *What should the business, site, and pages become?* Recommended Website Structure at a high level (§6b — menu/architecture view, no implementation detail, that's Part VII), the Anatomy-of-a-page diagram, Internal Linking Strategy (commercial structure first, content-to-money-page second — never the reverse, and never re-using the identical illustrative example across multiple sections, see §6c), selective supporting content (Content Growth Strategy, narrowly scoped, see §13's demotion note), Backlink & Authority Analysis, and Entity & Business Information Readiness. (§§6b–6c, 13, 15, 17.) This part must never leave a reader thinking organic search strategy reduces to "start a blog."
5. **Part V — AI & Search Beyond Google.** *How does the business appear when people ask AI systems and other platforms, not just Google?* AI Discovery & Readiness (recommendation/citation analysis, distinct from the AI-Overview SERP feature already covered in Part II), Chatbot/Conversational Opportunity (mapping the conversational questions that could lead a customer to this business — not "should we install a chatbot"), Social/Platform Search Visibility, and Light AI Automation Opportunity where genuinely evidenced. (§§16, 18–19, 26.)
6. **Part VI — Additional & Conditional Opportunities.** *What else did the research surface that's real but secondary?* Seasonal Search Opportunities and any other discovered-but-secondary opportunity. (§29.) This part exists specifically so a conditional/secondary finding (however large the numbers look) never interrupts the core demand → foundation → build → discovery narrative in Parts II–V.
7. **Part VII — Business Impact & Implementation.** *What could this mean commercially, and exactly what do I do, in what order?* Expected Organic Traffic Impact, Lead/Business Impact Scenarios and the Investment Case, Quick Wins, the Implementation Priority Matrix, the generated implementation roadmap (wherever the schedule reaches the highest-priority pages is where full Page Blueprints for them live — the plan's payoff, not a repeat of Part IV), the Longer-Term SEO Roadmap, the Measurement Plan, Scope & Next Steps, and the closing 29-point coverage index. (§§20–24, 27–28.) Earlier parts establish *what* and *why*; this part is *how* and *when* — it should read as the report's payoff, not a trailing summary.

**Combining sections is allowed; silently absorbing them is not.** Related analyses may share one customer-friendly section when doing so improves flow (e.g. AI Discovery & Readiness and Entity & Business Information Readiness may each keep their own clearly labeled heading even when adjacent) — but the promised analysis must stay individually identifiable by heading or label. A reader (or an auditor re-running the Final Quality Gate) must be able to point to exactly where each of the 29 areas was addressed.

**No duplicate or near-duplicate eyebrows in a row (added 2026-08-16).** Use a consistent three-level hierarchy — Part label → section eyebrow → section title — and never repeat the identical eyebrow immediately before two or more consecutive subsections; it reads as visual noise and flattens the hierarchy instead of clarifying it. If several consecutive sections genuinely belong to the same eyebrow category, either merge them under one section-opener with subheadings, or vary presentation so the repetition doesn't read as a mistake.

**Duplication audit (required, added 2026-08-16).** Before finalizing, explicitly check the report for duplicate or near-duplicate tables, examples, and analysis — the same illustrative example (e.g. one keyword cluster) reused across Keyword Opportunity Analysis, Internal Linking, Content Growth Strategy, and the roadmap reads as padding, not thoroughness. Each section must add new information; where the same underlying fact is genuinely relevant twice, state it briefly and cross-reference the section with the full detail rather than repeating the full presentation. Add this check to the Final Quality Gate.

**Customer-facing coverage index (required closing section, added 2026-08-16).** The main report must end with a section titled something like "Your 29-Point Organic Search Analysis" — a clean table (`#` · Analysis Area · Result/Status · Where to Find It) covering all 29 numbered areas in this contract, using client-friendly statuses (Completed · Opportunity Found · Issue Found · No Material Issue Found · Partially Evaluated · Pending Validation · Requires Client Access · Conditional — Not Triggered · Conditional — Opportunity Found). **Never mark an item Completed merely because a generic paragraph exists for it** — the status must reflect genuine analytical depth. This is a **scope-delivered summary for the client, not internal QA documentation** — it must never expose tooling names, budget/credit status, or other internal-process language (see the Client Language Rules addition below). Place it at the very end of Part VII, immediately before the Methodology dark-section close.

**Three-part customer package (added 2026-08-16).** Every engagement's deliverable is three files, not one: **(A) the Main Report** (this contract's subject — strategic, visual, decision-oriented), **(B) the Supporting Appendix** (the evidence book — see §30's expanded requirements), and **(C) a Source Data Workbook** — a formatted export of the real underlying data collected for this client (keyword tables, SERP/local-pack detail, competitor data, backlinks, technical/Lighthouse output, AI/social test results, seasonal data), for the client's own future use. The workbook is real customer data, formatted for a human, never raw API JSON and never internal prompts, credentials, secrets, or debugging logs. If the underlying tool stack doesn't yet support a category of data (e.g. multi-platform AI-discovery testing), the workbook simply doesn't include a sheet for it rather than including one with fabricated rows.

---

## Presentation Layer

`report.md` and `appendix.md` must be authored using the components defined in [report-design-system.md](report-design-system.md) — the branded HTML/CSS system that makes the report visually consistent with the Scrolly SEO website. **That file governs visual formatting only.** It is never grounds to omit, compress, reorder, or shorten any section, finding, or table required by this contract — the same Core Rule above (later work enriches, never replaces) applies equally to a design pass. If a finding doesn't cleanly fit one of its components, use its plain fallback card rather than drop or trim the content.

**Prose rule:** never use em-dashes (—) anywhere in `report.md` or `appendix.md`. Rewrite with a comma, period, colon, or parentheses instead.

**Pagination and typography requirements (added 2026-08-16, after real rendered-PDF QA found violations of both).** Every major Part (I through VII) begins on a fresh page — enforced in `automation/report-theme/scrolly-report.css`, not something an author needs to hand-place. No section-opener (eyebrow + heading) may render alone at the bottom of a page with its substantive content starting only on the next page (an orphaned heading) — also CSS-enforced, but authors must not defeat it by inserting raw HTML that bypasses the `.section-opener`/next-sibling pattern. **Typography floor:** 10pt normal body minimum, 9.5–10pt for customer-facing table/card content, 9pt as the absolute smallest size permitted anywhere and only for genuine captions/footnotes/minor metadata. **If a table cannot fit its content at this floor, redesign, split, or convert it to the Matrix card stacked-card pattern (report-design-system.md) — never shrink text to make a wide table fit.** These requirements apply to every future report, not just one engagement, and are checked by visually inspecting every page of a rendered PDF before delivery (see the Final Quality Gate).

**Evidence Density Rule (added 2026-08-16, after a real regression: a fully methodology-compliant report still read as an AI-written narrative summarizing a handful of SEO observations, because compliance with individual section requirements is not the same thing as visibly demonstrating the underlying research).** For every section, before writing prose, ask: can this be a table, a matrix, a scorecard, a visual, or a before/current/recommended comparison instead? **Show the analysis; do not merely summarize that analysis occurred.** Wherever real underlying evidence exists (keyword data, competitor data, cluster relationships, ranked opportunities), prefer a structured, inspectable format over paragraphs of explanatory prose — prose is for *interpreting* evidence the reader can already see, not a substitute for showing it. **The prose-removal test:** if every paragraph of explanatory prose were deleted, would the remaining tables/matrices/visuals/scorecards still make it obvious that substantial, engagement-specific research was performed? If no, the section fails this rule, regardless of whether it satisfies its own numbered requirement elsewhere in this file. This does not mean "make the report longer" — padding length without adding real evidence density fails this rule just as badly as thin prose does; see the Report Experience Standard's `$299 value test`.

## Client Language Rules

`report.md` and `appendix.md` are read by a business owner who does not know SEO terminology. `findings.md`, `status.md`, `data-plan.md`, and every other internal file keep their full internal shorthand freely, unchanged, always — this rule applies only to the two client-facing output files.

**Never use internal methodology shorthand in client-facing text.** This includes (non-exhaustive — translate anything else in this family the same way): `Category A`/`Category H`/`Category M` and similar category letters · `O1`–`O10` and similar opportunity-engine layer codes · `evidence_type` codes (`retrieved`, `estimate`, `inference`) — use the report-facing labels from the Mandatory Evidence Labeling table below instead · raw internal filenames (`findings.md`, `query-log.md`, etc.) unless a specific filename is genuinely useful to the client (e.g. pointing to their own appendix) · funding/tooling status language like "funding-blocked," "O6 ranked-keywords baseline call," "floor-value" · internal-analyst phrasing like "partial tier," "not padded to N," "broader backlog." Say **"Additional competitive ranking data is pending"** — never **"O6 current-capture baseline funding-blocked."** Say **"a large, real pool of additional keyword ideas exists but hasn't been validated for difficulty yet"** — never **"broader backlog, not yet evidenced at a defensible size."**

**Define technical terms on first use, in plain language, inline.** Do not remove or simplify the underlying SEO concepts (search intent, keyword clusters, topical authority, pillar pages, internal linking, crawlability, indexing, schema, local pack, Core Web Vitals, entity/brand signals, cannibalization, transactional vs. informational queries, etc.) — sophistication is part of what the client is paying for. Just explain each one naturally the first time it appears, matching this pattern:

> **Keyword cluster:** a group of closely related searches that can usually be targeted by one strong page rather than creating a separate page for every keyword.

Use [report-design-system.md](report-design-system.md)'s `.def-term` inline pattern and/or its glossary-card component for terms used repeatedly.

**Scope-of-analysis summary (Executive Summary requirement):** replace any bare "N checks/sections completed" style claim with the actual categories genuinely analyzed for *this* engagement (e.g. Search Demand, Current Google Visibility, Competitor Analysis, Technical SEO, Local SEO, Content Opportunities, etc. — only categories actually run, never a fixed list copied engagement to engagement). Use `report-design-system.md`'s scope-chip component; mark anything not evaluated this round as a plainly-stated methodology gap (dashed/gray chip), never omit it silently and never inflate the count for effect.

**No mechanical-causation language (added 2026-08-15).** Do not phrase a recommendation as if taking an action mechanically produces a ranking outcome — e.g. never write "asking for reviews has no downside and directly supports local-pack ranking." Search algorithms weigh many factors together; no single action guarantees a specific result, and phrasing it that way overclaims exactly what report-contract.md elsewhere insists on labeling honestly. Prefer language that describes a genuine contributing relationship without promising mechanics: reviews contribute to local prominence, trust, customer conversion, and competitiveness in local search — not "reviews produce a ranking increase." Audit every recommendation in the report for this pattern before finishing, the same pass that checks for banned shorthand and missing definitions.

**No unsupported causal language, generally (added 2026-08-16).** The mechanical-causation rule above covers recommendations; this extends the same discipline to *observations*, especially in Competitive Landscape. Observed facts (rankings, review counts, page counts, content depth) do not automatically prove *why* a competitor outranks the client — search ranking depends on many factors together, and a comparison table alone rarely isolates a single cause. Before finishing, search the full report for **because · caused by · due to · why they are winning · the reason · therefore** used to assert causation the evidence doesn't establish, and rewrite using **associated with · consistent with · a notable difference · a plausible contributor · worth investigating · may help explain**. This is a precision correction, not a mandate to hedge everything — where evidence genuinely does support a direct claim (e.g. a confirmed server-level block, a directly observed ranking position), state it plainly and without qualification. The goal is matching confidence of wording to confidence of evidence in both directions, not softening the report into caution-only language.

**No unsupported absolutes (added 2026-08-16).** Audit for unqualified absolutes not supported by the evidence at hand — "always," "guaranteed," "will rank," "cannot rank," "definitely caused by," "no downside," "can only." Where the underlying claim is directionally true but the absolute framing overstates it, rewrite to the supportable version (e.g. "a one-page site can only meaningfully target one or two searches" overstates a real constraint; "a one-page site makes it substantially harder to target multiple distinct search intents effectively" states the same finding at the confidence the evidence supports). Keep strong, unhedged conclusions wherever the evidence genuinely supports them — this rule exists to fix overclaiming, not to produce a report full of disclaimers.

**No Unfinished-Research Exposure, in any wording (added 2026-08-16, superseded and tightened 2026-08-17 — replaces the "professional rewording" guidance below it previously carried).** [discover.md](discover.md)'s No Unfinished-Research Exposure rule is the authority here; this is its client-facing-output application. Distinguish two categories:

- **Client-access-dependent** (GSC, GA4, GBP dashboard, first-party tracking): may be described plainly and professionally — **Requires Client Access** · "Available once you grant Search Console access" · similar. This is a real external dependency, not a Scrolly fulfillment gap.
- **Scrolly-incomplete research** (a paid/free tool call or platform test Scrolly's own process didn't complete): **must never be exposed to the client in any wording, including a professionally-reworded one.** Banned regardless of phrasing, in `report.md`/`appendix.md`: **Pending Validation** · **Not Evaluated This Round** · "requires paid research" · "a funded validation batch" · "wasn't run this round" · "tool capacity exhausted" · "future round" · "What We Still Need to Know" framed around Scrolly's own unstarted work · any equivalent restatement. This is a correction to the prior version of this rule, which incorrectly sanctioned these exact labels as an acceptable professional rewording — they are not, for this category.

**The fix is restructuring the output, not better disclosure wording.** Where Scrolly-incomplete research would otherwise leave a gap: omit the affected section/scorecard/column/row and let the report's confident, completed findings stand as the deliverable, or (for a normal paid engagement) don't ship the report until the Completeness Gate's retry/fallback resolves it. Never fabricate data to fill the gap instead — the choice is complete it, block delivery, or restructure around it, never disclose-and-ship.

Internal files (`findings.md`, `status.md`, `data-plan.md`, `query-log.md`) keep exact operational language freely — this rule is client-facing-output-only.

**Dead-end investigations don't need a client-facing card (added 2026-08-16).** When a research path produces no actionable, corroborated finding about the client's own business (e.g. a same-named entity or news result that turns out unrelated after checking against client-provided facts), it does not need a substantive finding-card in the main report. Document the excluded path and why in the appendix or internal files, per the standing rule against presenting unverified claims as fact — but do not show the client every unsuccessful research path as if it were a finding. This is not in tension with "No silent disappearance" above: that rule protects *material* findings and opportunities from vanishing, not from an investigation that concluded nothing.

---

## 1. Executive Opportunity Summary

Plain-English assessment containing:
- Biggest organic-search opportunity.
- Biggest current weakness.
- Strongest existing SEO advantage.
- Best near-term win.
- Highest-value long-term opportunity.
- **Investment recommendation** (see "Lead / Business Impact Scenarios" below for the full evidence case and any break-even framing): **Foundational / Moderate Priority / High Priority / Aggressive Growth Opportunity.** This is never a binary go/no-go — a legitimate operating business is almost always worth clearer, more accurate search visibility; the question this report answers is *how much to prioritize, how aggressively, and where*, not *whether to bother.* The level chosen must be justified by the evidence in this specific report (existing wins, the size of the confirmed gap, technical fixability, architecture headroom), never defaulted to a fixed level.
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

**Severity must be proportionate to demonstrated impact, not to how it sounds (added 2026-08-16).** A missing file or misconfiguration is not automatically FIX NOW severity — check what it actually does before assigning severity. Example: a missing robots.txt file, on its own, does not block crawling or indexing (robots.txt absence means no crawl restrictions are declared, not that crawling is blocked) — if the report elsewhere confirms nothing is blocking indexing, classify a missing robots.txt as IMPROVE (technical hygiene), not FIX NOW, and never claim it "blocks other work" unless that claim is itself evidenced. A genuinely severity-justifying issue (e.g. a confirmed server-level block on the sitemap path, verified against a control test) keeps FIX NOW. The point is evidence-proportionate severity in both directions — do not manufacture urgency, and do not undersell a confirmed, high-impact issue either.

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

## 6. Website Structure, Page Quality & Architecture

This section spans two distinct questions per the five-pillar note above — keep them visually separated, not blended into one undifferentiated wall of findings.

### 6a. On-Page Quality — existing pages ("Where Are You Now?")

Per [discover.md](discover.md) Category D's On-Page Quality Module. For every important existing page, classify into exactly one of **KEEP / OPTIMIZE / EXPAND / MERGE / REDIRECT / CREATE** (Category D's definitions) with the evidence behind the classification: search-intent alignment, topical completeness vs. competitors, cannibalization risk against other pages, thin/duplicate content, on-page elements (title/meta/H1/heading structure/images/alt text/CTAs/trust signals/schema opportunities/internal links). **Size-agnostic requirement:** audit every important page up to ~30; beyond that, sample representatively by template/traffic-tier and say so explicitly — this section must work unmodified for a 1-page site, a 30-page site, and a 500-page site.

Present as a scannable **Website Health / Page Quality scorecard** first (per-page or per-template status), then the important individual findings as Finding → Why it matters → Recommended fix → Priority — not 75 raw checks dumped on the reader; breadth should be visible without being overwhelming.

### 6b. Recommended Website Structure — what it should become ("What Should Your Website Become?")

Evaluate whether the current structure can capture discovered search demand ([discover.md](discover.md) Category C + O4 Money Pages).

**Current structure:** important existing URLs/pages and what each appears to target.

**Recommended structure:** every significant page that should be Created · Retained · Updated/Expanded · Rewritten · Consolidated · Redirected · Repositioned.

For each recommended page: Page · Existing or new · Recommended URL · Primary keyword · Supporting keyword cluster · Intent · Business purpose · Geographic target when relevant · Priority · Existing URL affected.

**Do not treat "page recommendations" as synonymous with "new pages."** Also specify important page *sections* that should be added/changed: services · products · categories · pricing/cost · FAQs · process · service areas · inventory · reviews/testimonials · trust signals · credentials · guarantees · about/expertise · CTAs · internal links · comparison content · related resources.

**Recommended site structure (visual requirement, redesigned 2026-08-16 — now leads with an actual visual tree, not a list).** Open the section with an SVG tree/org-chart diagram (report-design-system.md's site-structure diagram — self-contained inline SVG, never a nested HTML `<ul>` tree, for the pagination reasons documented there) so the reader sees the site's architecture as an actual map before any list. Every node is status-coded **Build Now / Optimize / Validate First / Supporting Content / Future-Conditional** — this status vocabulary is required and must connect directly to the same item's placement in the Implementation Priority Matrix (§23), never invented independently. Follow the diagram with report-design-system.md's flat main-menu list plus one grouped `.cluster-card` per branch that has real sub-pages, for the detail the diagram itself can't carry. This matters most, and is a required, prominent section, for thin/single-page sites where the current-vs-recommended gap is one of the report's biggest findings. Every node states whether it's a Money/Service Page, Supporting Page, Location Page, Content Hub, or Blog/Resource, carries a priority badge, and states whether the underlying offering is CONFIRMED or requires client verification (Section A's classification). **The architecture must visibly trace back to §7's Primary Opportunity Matrix** — a reader should be able to follow keywords → clusters → this diagram without a logical gap.

**Never show a bare unexplained number next to a keyword/topic anywhere in the diagram (added 2026-08-17).** A raw number next to a node (e.g. a keyword-variant count) is easily misread as monthly search volume. Where a variant count is genuinely useful context, label it explicitly in the node itself (e.g. "Oak — 55 keyword variants identified"), or omit the number from the diagram entirely and keep it in the Primary Opportunity Matrix's Variant Count column instead. The architecture diagram's job is communicating what pages should exist and how they relate — not carrying research-count detail that belongs in the matrix.

**Money-page vs. supporting-content relationship must be visually explicit (added 2026-08-17), applied across industries, not just this engagement.** Where a content hub or supporting-article cluster exists specifically to feed a commercial/money page (e.g. a buying-guide hub feeding a "Trees for Sale" page), the diagram must show this as a directional relationship — supporting content flowing into the money page it supports (an arrow/connector and a short "supports →" label), never placed as a visually equal, competing sibling node. The reader must immediately understand the informational hub exists to support the commercial page, not to compete with it.

**Page Blueprints (new 2026-08-15, per discover.md Category D).** For every CREATE and high-priority OPTIMIZE/EXPAND page: recommended URL, primary search intent, primary keyword cluster, suggested SEO title, suggested meta description, recommended H1, a suggested page outline (H2 sections through FAQ through final CTA), and where appropriate: photos/media needed, proof/trust elements, products/services to represent, FAQ topics, CTA placement, internal links in/out, external links where appropriate, schema type, related articles/money pages. **Tier the depth to priority** — full blueprints for the highest-priority pages, a lighter one-paragraph treatment (URL, intent, primary keyword, one-line rationale) for lower-priority ones, so the report stays readable rather than treating every page with equal, exhausting depth. **This is a blueprint, not finished copy** — it tells the client what needs to be built and why; writing the actual page is what the implementation offering is for (see Section 28's Scope & Next Steps).

**Mini visual page blueprints for top-priority commercial/money pages (added 2026-08-17).** For the small number of highest-priority CREATE/OPTIMIZE commercial or menu pages (not every blueprint — reserve this for genuine money pages: e.g. a nursery/garden-center page, a primary service page), present the underlying Page Blueprint content above using report-design-system.md's compact mini-wireframe component (the same visual language as the Anatomy-of-a-page diagram in §6, scoped to this specific page): suggested title/meta as a snippet mockup, then URL/H1/intro/major H2 sections/primary CTA/proof/local relevance/media needed/FAQ/related services/internal links/final CTA/schema. **This reuses the Page Blueprint's existing recommendations — it must never independently invent a second set of recommendations for the same page.** This is strategy/specification, not finished page copy — do not cross into writing final page content here.

**Anatomy of a search-optimized page (revised 2026-08-16, one reusable educational diagram, built once and reused across every client — not authored per-engagement).** **Client-approved as-is (2026-08-16) — this is one of the strongest visual elements in the report; do not revert it to a text/bubble flowchart.** **Must fit on one page.** Show it as a stylized webpage mockup (recognizable page chrome: header/nav, then the page body with numbered or thin-line callouts), not a tall stack of colored bubbles connected by arrows — the earlier bubble-stack version ran long and visually tired the reader. Callouts label: H1 → intent-matching intro → primary CTA → H2 content sections → real images with alt text → proof/reviews/credentials → local relevance where applicable → FAQ → related services/products → internal links → final CTA. Represent the SEO title and meta description as a small Google-result-style snippet mockup next to or above the page body, since those elements don't literally appear in the page's visible content. Purpose: make it visually obvious in seconds that "build this page" means more than writing a blog post, reinforcing why the implementation offering has real scope.

### 6c. Internal linking strategy (required sub-section)

Using [discover.md](discover.md) Category F, extended to also cover the *recommended* future structure (not only auditing an existing site's links): explain in one or two plain sentences why internal links matter to a non-technical reader, then introduce linking through the site's **own commercial structure first** — cross-links *between* money pages (report-design-system.md's link-map component), e.g. Nursery/Garden Center linking to Trees for Sale and relevant plant-category pages, Landscape Design linking to Landscape Installation — **before** showing which supporting articles feed which money page. **This ordering is required, not stylistic:** introducing internal linking through blog-post-to-page relationships first reads as if internal linking (and SEO generally) is fundamentally a content/blogging exercise, which is the single most common misconception this report must actively correct (see the Report Experience Standard's narrative test). Content-to-money-page linking is real and belongs here too, but as the second, secondary layer, presented together with the relevant Section 13 cluster rather than as a disconnected table. Every relationship must trace to an actual page recommended elsewhere in this report; never invent a page solely to complete a linking diagram. Keep exhaustive individual link-by-link detail in the appendix if the main-report version would get too long; the main report shows the *pattern*, the appendix can carry the full list.

**Don't reuse the same illustrative example across sections (added 2026-08-16).** If one money page's linking relationships (e.g. Trees for Sale being fed by three tree-related articles) already appeared as the worked example in Keyword Opportunity Analysis or Content Growth Strategy, use a *different* money page as the lead example here. Each section should teach something new — repeating the identical example across three or four sections reads as padding even when each individual instance is accurate.

## 7. Keyword Opportunity Analysis

Cluster related keywords — never dump the full individual-phrase list into the main report (that belongs in Section 14, the appendix). For each major cluster ([discover.md](discover.md) O4 Money Page schema): Primary keyword · Supporting/related keywords · Search intent · Funnel stage · Search demand · Geographic relevance · Current visibility · Organic/keyword difficulty · SERP competition · Business value · Recommended URL/page to target · Priority · Confidence/data source.

**This section must demonstrate the research, not merely summarize that it happened (redesigned 2026-08-16 — the Evidence Density Rule, see the Core Rule section, applies here first).** Structure, in order:

1. **Keyword universe funnel diagram** (report-design-system.md) — one compact visual teaching the real progression this engagement followed: raw keyword universe → search intent → keyword clusters → page clusters → primary/secondary keywords → supporting content → site architecture, with the real count at each stage.
2. **Grouped keyword evidence tables** (report-design-system.md) — real phrases surfaced in themed tables (Top Commercial, Top Local-Intent, business-specific categories, Informational Questions, Seasonal, High-Value Subclusters, Unexpected Opportunities, Long-Tail). Show volume/CPC/difficulty only where genuinely retrieved; show the bare phrase honestly where it wasn't. **Never invent a missing metric to make a table look more complete.** **No standalone national-only table anywhere in this section, or anywhere in the main report body (tightened 2026-08-17, applies to every table in this section, not only the first).** Where a themed table's only available volume data is national-level, either drop the volume column and show phrase/intent only, or move that specific table to the appendix — a table that leads a reader's eye to a national number, in any position in this section, fails local-demand-primacy exactly as much as a national-led first table does.

**Local-demand primacy (added 2026-08-17, for local/regional-mode engagements — [discover.md](discover.md)'s Local Business Demand Hierarchy).** The *leading* keyword-evidence table in this section must present demand in catchment order (core market → secondary markets → national context last), never a national-led table for a geographically-bound business. Open the section with a short "your realistic customer catchment" callout (Core/Secondary/Monitor markets, per O2) before any demand figure. National-only data (broader category terms never geo-tested this round) may still appear, but only as a clearly labeled, visually secondary table below the core/secondary catchment table — never as the report's primary opportunity evidence. **Never sum overlapping geographies or population-scale a national figure into a fabricated local number** — real per-market figures only, side by side.
3. **Primary Opportunity Matrix** (report-design-system.md's Matrix card; renamed and consolidated 2026-08-17 from "Keyword Cluster → Page Map" — same component, expanded columns, now the single customer-facing table carrying cluster identity, demand, visibility, and competition together) — for every real cluster, including validate-first sub-clusters (e.g. a species or product-line breakdown): Cluster · Primary Keyword · Best Secondary/Long-Tail Keywords · Intent · Local/Regional Demand (per the Local Business Demand Hierarchy where geographically bound) · Current Visibility · Competition/Difficulty · Recommended Page · Priority, plus Variant Count where a labeled variant count is genuinely useful context (never a bare unexplained number — see §6b's labeling rule). **This is the one and only place per-cluster demand, visibility, competition, and difficulty appear together — for every cluster, not just the top few.** §8 (Keyword Competition & Expected Ranking Difficulty) and §10 (Competitive Landscape) reference this matrix's clusters by name for their own distinct analysis (difficulty reasoning, competitor-strength narrative, why-they're-winning explanation) rather than re-presenting a near-duplicate per-cluster table. This replaces a bare cluster-name list — the reader must be able to see *why* a set of keywords became one page, not just that it did.
4. **"Why one page, not many" teaching callout** — a short, concrete explanation using this engagement's own largest cluster as the worked example (never a generic/hypothetical example when a real one exists).

**The separate "Keyword Cluster Summary Table" and standalone detailed per-cluster cards are eliminated (removed 2026-08-17) — the Primary Opportunity Matrix now covers every cluster at full detail, so a second table restating the same clusters at lighter detail, and a third presentation restating the top few clusters at yet another level of detail, are exactly the duplicate-page-7-to-13 pattern the Duplication audit and the consolidated-opportunity-matrix Final Quality Gate check exist to catch.** §7's full structure is now: funnel diagram → grouped keyword evidence tables (phrase-level, themed, this is where individual phrases live) → local-demand-primacy catchment callout → Primary Opportunity Matrix (cluster-level, every cluster, full detail) → why-one-page callout. Four distinct levels of information (funnel = process, grouped tables = phrases, matrix = clusters, callout = teaching), each genuinely different from the others, not four passes over the same cluster list.

**The main report must visibly show real keyword data, not just cluster names or a bare total count (added 2026-08-16, strengthened 2026-08-16 second pass, restructured 2026-08-17).** A report that says "6,477 keyword phrases were found" but never surfaces representative volume, geography, intent data, *or the real sub-cluster counts already sitting in the research* (e.g. "953 real phrase variants for this one cluster") undersells the actual research performed and fails this section even if the Matrix technically exists. The grouped keyword evidence tables carry this requirement now — real phrases, real volumes where retrieved — with the Matrix providing the cluster-level roll-up immediately after, so the reader sees phrase-level evidence before the cluster-level decision (the evidence before the conclusion), without a redundant intermediate summary table.

**Every volume figure needs a visible, specific geography label (added 2026-08-16).** Never present a national, state/regional, or local-market figure without labeling which it is, and never let a national number (which is often 10-100x a local number) sit next to a local one without that distinction being obvious at a glance. Do not sum or otherwise aggregate volumes across keywords that meaningfully overlap in intent, and do not treat national search volume as a proxy for a specific town's addressable demand — state plainly when only broader-geography data is available and a town-level figure wasn't obtainable.

**A keyword cluster is a demand-to-page mapping, not an article list (clarified 2026-08-16).** This section's cluster is a different object from Section 13's content/topic cluster, and the two must not be conflated or presented with the same component. This section answers *"how does related search demand map to one page?"* — Search Intent · Primary Keyword · Related/Supporting Searches · **Recommended URL** (renamed from "Recommended Destination" 2026-08-16 — the client should immediately understand this is the page path we recommend, not an ambiguous "destination") · a one-line Implementation note (e.g. "these searches are closely related enough to target with one strong page rather than a separate page per variation"). It never lists proposed article titles — that's Section 13's job. The client must come away understanding that a large number of keywords (e.g. thousands found in research) does not mean a large number of pages — clustering is how search demand gets consolidated intelligently into site architecture, not fragmented into one page per phrase.

Separate **CONFIRMED OPPORTUNITIES** from **POTENTIAL OPPORTUNITIES / VERIFY OFFERING** per Section A's classification. Never imply the client sells something unconfirmed.

## 8. Keyword Competition & Expected Ranking Difficulty

**Reference §7's Primary Opportunity Matrix by cluster name for demand/visibility/difficulty-rating figures (added 2026-08-17) — do not re-tabulate them here.** This section's job is the *interpretation* the matrix's Competition/Difficulty column doesn't carry: who currently ranks · type of domains ranking · competitor authority when measurable · content quality/depth · local competitors · review gaps · backlink gaps · site-structure advantages, per major money-page cluster ([discover.md](discover.md) O5).

Client-friendly difficulty: **Low · Low–Moderate · Moderate · Moderate–High · High · Very High.**

Realistic ranking ranges where evidence permits — early measurable movement · possible first-page timeframe · possible top-three timeframe — as **range-based, evidence-based scenarios. Never guarantee ranking dates.** Account for: current position · existing authority · site age/history when known · competition · search intent · local vs. national SERP · technical condition · content requirements · backlink requirements · implementation pace. **Explain the assumptions.**

## 9. SERP Composition, AI Overviews & Zero-Click Risk

For priority keyword groups, inspect the actual modern SERP layout (per [discover.md](discover.md) Category A's AI-Overview/zero-click requirement). Identify when present: AI Overviews · Local Pack · featured snippets · People Also Ask · videos · images · shopping/product results · forums · Reddit/social results · direct-answer features · traditional blue links.

Explain how SERP composition changes: expected organic CTR · content strategy · Local Pack importance · snippet/answer-winning opportunity · traffic forecasts.

**Do not treat identical search volume as identical traffic opportunity when SERP layouts differ materially.** **Scope boundary (added 2026-08-16):** this section covers Google's own AI Overview as one SERP feature among several. Whether the business is recommended or cited by *other* AI systems (ChatGPT, Perplexity, Gemini, Grok) is a materially different question, covered in Section 16 (AI Discovery & Readiness) — keep the two clearly separate rather than treating an AI-Overview observation as evidence about other platforms.

## 10. Competitive Landscape

**Reference §7's Primary Opportunity Matrix by cluster name where a competitor's strength is tied to a specific cluster (added 2026-08-17) — do not re-tabulate the matrix's per-cluster demand/visibility columns here.** Identify the businesses/domains that actually compete in search — **do not assume offline competitors and Google competitors are identical.** Separate by business line where appropriate, per [discover.md](discover.md) Category A's corrected selection rule (organic capture, not recall of prior local-pack appearance).

For significant competitors, where possible: repeated SERP presence · ranking keywords · ranking pages · site structure · content strategy · geographic strategy · reviews · Local Pack presence · backlinks · authority · strengths · weaknesses. **Do not reduce competitor analysis to a few isolated mentions.**

Include **WHY THEY ARE WINNING** and **HOW THE CLIENT CAN COMPETE.** The client should understand why another company currently outranks them.

**Actionable gap analysis (added 2026-08-17) — go beyond identifying competitors.** For each meaningful competitor, compare applicable dimensions (keywords/ranking clusters, pages, content depth, site architecture, backlinks/referring domains, local-pack presence, reviews, GBP factors, authority, SERP-feature ownership) and answer explicitly: **what do they have that this business does not**, and **which of those gaps are actually worth closing** given this business's own priorities elsewhere in the report. Prioritize commercially relevant gaps — do not build a large comparison table merely for volume; a short, prioritized gap list beats an exhaustive one.

## 11. Google Business Profile & Local Search

Dedicated local SEO analysis for businesses with meaningful local intent ([discover.md](discover.md) Category I + O2). **If direct GBP access is unavailable, retain this section and state exactly what could and could not be verified** — never drop it.

**Tool correction (2026-08-15):** GBP category/description/hours/attributes and review-level detail (velocity/trend, not just a count) are retrievable via `data-sources.md`'s Google My Business Info and Google Reviews capabilities — cheap, and should run whenever the business is local/regional and funding allows. Do not mark these fields "Not Evaluated" by default; only mark them so when the relevant call genuinely wasn't made or failed, and say which. Citation/NAP consistency across directories remains a real gap with no current tool — that one stays "Not Evaluated / Requires Additional Data Source."

**Never recommend a GBP category change without verifying the current category first (standing rule, added 2026-08-16).** A GBP-category mismatch is a legitimate, common explanation for a visibility gap between related but distinct search intents (e.g. winning "landscape design" local pack but not "plant nursery"), but it stays a labeled hypothesis, not a confirmed finding, until the client's actual current category has been retrieved and compared against how relevant competitors are categorized. Do not recommend changing the category on the strength of the hypothesis alone — say plainly that the category itself wasn't verified this round and that a change shouldn't be made until it is.

**GBP configuration, when accessible:** primary category · secondary categories · description · products · services · attributes · hours · service areas · photos · videos · posts · Q&A · messaging · business information completeness.

**Reviews:** review count · rating · review velocity · recent activity · response rate · response quality/consistency · competitor review gaps.

**NAP/citations:** name/address/phone consistency · major directory presence · citation gaps · duplicate listings · incorrect listings · relevant local directories.

**Geographic search:** Local Pack visibility · city-level differences · service-area opportunities · expansion markets · location-page potential.

Classify markets ([discover.md](discover.md) O2 Geographic Market `classification`): **Core · High Priority · Secondary · Expansion · Monitor · Not Recommended.** Never recommend thin doorway pages.

## 12. Organic Conversion Readiness

([discover.md](discover.md) Category L.) Whether high-value pages can convert the organic traffic they'd receive. Per major money page: CTA clarity/prominence · click-to-call/phone prominence · forms and form friction · booking flow · reviews/testimonials/credentials/guarantees/trust signals · about/expertise · product/service clarity · location/service-area clarity · pricing/cost information where appropriate · visual proof · mobile conversion friction · overall user journey.

Identify obvious traffic-leak points. **Focused SEO ROI/conversion review — not a full CRO engagement.**

## 13. Keyword & Topic Clusters, and Content Growth Strategy

Present content opportunity as **clusters, never a flat list.** Apply [discover.md](discover.md) O9's required clustering procedure (cluster by intent → deduplicate → separate transactional/informational → identify pillar pages → identify supporting articles → surface seasonal/local content where relevant → avoid cannibalization/thin pages/keyword-only padding) before writing this section. Present each cluster with `report-design-system.md`'s cluster-card component: pillar/money page it supports · supporting articles · search intent · why the cluster matters · which page it should link to (feeds the Internal Linking Strategy in Section 6c) · priority.

**Content Growth Strategy is demoted to a supporting role, never the visual centerpiece (added 2026-08-16).** Organic search strategy is architecture, commercial pages, on-page/technical quality, local presence, and trust first; supporting content is one tactic among several, used where a real informational search question genuinely supports a commercial page — not the default answer to "what do I do for SEO." In the main report, show a small, representative set of the strongest content opportunities (each one visibly tied to the money page it supports, e.g. "How Much Does X Cost?" → supports → [Money Page]), not the full prioritized list from every cluster — that full list belongs in Section 14's appendix requirement. If the main-report content section starts to feel like the report's largest or most detailed section, that is a signal it needs to shrink, not evidence the strategy is thorough.

**Narrow scope, no re-derivation (added 2026-08-16).** This section's only job is answering *"after the commercial architecture is built, what informational searches are actually worth targeting?"* It must not re-derive or re-present the keyword clusters (Section 7), the recommended site structure (Section 6b), or the internal-linking relationships (Section 6c) — those already exist elsewhere and should be cross-referenced by name, not repeated. If the evidence suggests content/blogging genuinely isn't an immediate priority for this engagement, say so plainly as the section's conclusion — that is a legitimate, useful finding, not a gap to paper over.

**Content backlog structure (revised 2026-08-15 — organize by cluster, no arbitrary tiers).** Do not split the backlog into flat "first 10 / next N / broader backlog"-style tiers with a different presentation for each — that reads as inconsistent and internal-analyst-y even after translation. Instead, present a numbered, prioritized article list **within each cluster**:

> **[Cluster Name] — N recommended articles**
> 1. [Highest priority] — one-line why-it-matters
> 2. ...
> 3. ...

Order clusters themselves by overall priority. Every article carries a priority/order — there is no separate "tier" concept, just a ranked list per cluster. **Never cap this at a round number (10, 20, 26) merely to fit a format.** If the full, honestly-researched backlog is large, show the highest-priority articles per cluster in the main report and put the complete numbered list in the appendix (Section 14) — main report = decisions, appendix = depth, same principle as everywhere else in this contract. Where a larger raw keyword pool exists but hasn't been validated (no difficulty/geo-sizing, not yet organized into distinct non-overlapping topics), say so plainly in client language ("a large additional pool of keyword ideas exists but hasn't been clustered and validated yet") — never fold it into the counted number, never omit it, never invent a number to sound more comprehensive.

**Do not decide posting cadence before determining the legitimate opportunity universe. Do not pad the list to reach a target number, and do not conclude the opportunity is small after one narrow or interrupted keyword pull** — a research-completeness gap is a methodology gap to state plainly, never a finding about true opportunity size.

## 14. Full Content Map — Appendix Requirement

The appendix carries the full, unclustered opportunity detail behind Section 13's clusters. **Size is evidence-driven, not a fixed target (revised 2026-08-16).** A content-heavy niche with genuinely validated demand across many distinct topics may defensibly reach 100–400 page/article opportunities; a local/service business with a real but naturally limited informational-search footprint should receive a smaller, stronger map instead. **Neither outcome is a defect on its own — a padded map and an artificially small map are both failures; a map sized to what the evidence actually supports is the only correct one, whatever number that turns out to be.** Research multiple discovery paths before concluding the topic universe is small: keyword expansion · competitor ranking keywords · competitor content · People Also Ask · search suggestions · question modifiers · cost queries · comparisons · alternatives · product/service variants · use cases · problem queries · location-specific informational queries · seasonal searches · buying guides · FAQ clusters · industry terminology.

**Do not conclude the opportunity is small after one narrow or interrupted keyword pull — this governs how the research itself is run, not what the client sees.** If a research round was cut short (e.g., a data source ran out of funding/credits, or only free/manual evidence was available), the resulting smaller topic count is a research-completeness gap internally — but per the No Unfinished-Research Exposure rule, that gap is resolved by researching further before the report ships, not by disclosing "Pending further research" to the client. Research broadly enough to determine the actual content universe before concluding it's small; where that broader research genuinely can't happen before delivery (a sample/regression case), report only the honestly-sized number the completed research supports, without a client-facing note that more research is possible.

**DO NOT PAD THE LIST.** If thorough, *complete* research identifies only 76 defensible opportunities, report 76 — consistent with [discover.md](discover.md) O9's "size to what evidence supports" rule. Report the honestly-researched number; do not add a client-facing flag that the research itself was incomplete (see the No Unfinished-Research Exposure rule) — internally, record that in `findings.md`/`status.md` instead.

**Surface already-evidenced but unclustered sub-research separately, never fold it in and never drop it (added 2026-08-16, section renamed 2026-08-17 to avoid the banned "Pending Validation" phrase — the substance is unchanged, this is real retrieved data, not a Scrolly gap).** It's common for a research round to produce real, citable evidence at a finer grain than what's been fully clustered into content-map entries — e.g. a bulk keyword-import file with real sub-counts per category (species, product lines, service variants) that hasn't yet been run through O9's clustering procedure. That evidence must not be padded into the counted content-map number (it isn't yet a defensible article opportunity), and it must not simply disappear either (per the Core Rule's no-silent-disappearance requirement). Present it in its own clearly labeled **"Additional Evidenced Keyword Data"** subsection of the appendix — real numbers, real source, presented as additional real evidence on hand — so a reader can see the scale of additional research already retrieved without mistaking it for validated, individually-sized content opportunities.

Each opportunity, where available: Topic/title · Primary keyword · Supporting cluster · Intent · Funnel stage · Demand · Difficulty · Related money page · Priority.

## 15. Backlink & Authority Analysis

([discover.md](discover.md) Category G.) Backlink quantity · referring domains · link quality · spam/problematic links · relevant local links · local citations · competitor authority · authority gap · current strengths · missing authority signals.

Classify: **Critical blocker · Meaningful weakness · Secondary opportunity · Healthy for current stage.** Recommend specific, realistic authority-building approaches when appropriate. **Do not silently drop this section when another research stage (e.g., expanded keyword work) becomes more detailed in the same round** — see the Core Rule. **Keep this proportionate (added 2026-08-16):** when the business also has architecture, local-visibility, or on-page gaps, do not let backlink/authority work read as the first priority — it wouldn't meaningfully help pages that don't exist yet or aren't optimized. Say so explicitly when applicable.

**Backlink appendix full-listing requirement (added 2026-08-17, size-conditional; tightened 2026-08-19 — individual records are now required, not an optional enrichment call).** The main report carries the summary/interpretation above; the appendix (§30) carries the retrieved evidence itself. **The individual-record `backlinks` call (see [data-sources.md](data-sources.md)'s Backlink/Referring-Domain Data section) must be made before this section is considered complete** — `backlinks_summary` (site-level aggregate) and `backlinks_referring_domains` (domain-level aggregate) are both insufficient on their own, no matter the profile size, because neither returns the individual link records (source URL, destination URL, anchor text per link) this requirement is about. Aggregate-only data presented as if it were a link list — or worded to imply aggregate facts are "the complete picture" — fails this requirement even if every aggregate field is accurate. For a **small backlink profile** (roughly under ~50 referring domains), list every retrieved individual link record in the appendix in full — referring domain, source URL, destination URL, anchor text, follow/nofollow/sponsored/UGC, first seen, last seen, authority/quality metric, and relevant notes/category, **only for fields genuinely retrieved — never invent a field that wasn't actually returned by the data source.** For a **large backlink profile**, the main report keeps its summary/interpretation, the appendix carries a complete-but-bounded individual-record summary plus the important backlink detail (not literally every row), and the full raw retrieved backlink data goes in the Source Data Workbook only — never a PDF appendix stretched to thousands of pages merely to claim completeness. **If the individual-record call genuinely cannot be made this round** (no data source access at all, not merely "wasn't prioritized"), state plainly and factually what was and wasn't retrieved, without claiming equivalence between aggregate data and a complete list — this is a client-access/data-source-availability fact, not a Scrolly-incomplete-research disclosure, so it is not subject to the No Unfinished-Research Exposure rule's ban on "wasn't run"-type language, but it does block the report from being marked `ready_for_delivery` under a normal funded run (see the Final Quality Gate's `backlink-individual-records-retrieved` check).

**Legitimate Link/Citation/Mention Opportunity (added 2026-08-17) — a distinct subsection from the backlink baseline above, not a rewording of it.** Per [discover.md](discover.md) Category G's new Legitimate Link/Citation/Mention Opportunity analysis, present a table: Source/Platform · Currently Present? · Opportunity Type · Industry/Local Relevance · Effort · Priority — covering realistic, legitimate authority-building candidates (chambers/business organizations, legitimate directories, industry/trade associations, supplier/dealer directories, local news/community organizations, niche directories, legitimate review platforms, community partnerships/sponsorships). **This section never recommends spammy link drops, mass posting, or astroturfing as strategy** — matching the AI Search Readiness ethical guardrail (§16b). Forums/community platforms may appear only as opportunities for authentic participation, referral traffic, or entity corroboration, never as link-acquisition targets.

## 16. AI Search Readiness (umbrella — redesigned 2026-08-16)

*(Redesigned 2026-08-16 — [discover.md](discover.md) Category M.)* One Part V umbrella covering two conceptually distinct sub-questions, each its own clearly labeled subsection (never blurred together) — the umbrella exists so a reader gets a comprehensive AI-readiness picture even in the very common case where live platform testing wasn't available.

### 16a. AI Discovery & Platform Visibility (presence-testing)

Broader than detecting AI Overviews (Section 9 covers that as a Google SERP feature — keep the two clearly separate). The real question this subsection answers: **will ChatGPT, Perplexity, Gemini, Grok, and similar AI/answer systems mention, recommend, or cite this business when a potential customer asks a relevant question?**

**Recommendation/citation analysis, not presence-checking.** For a small number of strategically-selected customer-intent prompts (derived from the actual keyword/business research already done for this client, not generic questions), determine where testable: is the business mentioned at all · is it actively recommended · is the business's own website linked or cited · which competitors are recommended instead · which third-party sources (directories, review sites, publishers) the answer draws on · whether the AI's understanding of the business is accurate · whether entity ambiguity (a same-named different business, an unclear service area) is distorting the answer.

**AI Discovery Scorecard component — shown only when testing was performed (revised 2026-08-17, per discover.md's No Unfinished-Research Exposure rule).** Present results as a table: Query/Intent × platform columns (ChatGPT, Perplexity, Gemini, Grok, Google AI, or whichever platforms were actually tested — **the platform list is configurable per engagement and over time, never hard-coded to a fixed set**), with a Key Observation column. **The platform list must reflect what was genuinely tested this round — never populate a platform's column with a result if that platform wasn't actually queried.** **If no multi-platform AI testing was performed this round, omit the scorecard entirely — do not render it with every cell marked "Not Evaluated This Round."** A structurally-empty table exposes unfinished Scrolly research regardless of how honestly each cell is labeled. Fold the one real available signal (Google AI-Overview presence, already captured in §9) into 16b's prose instead, and let 16b's evidence-based assessment carry this category. Never fabricate or simulate a result for an untested platform.

### 16b. AI Search Readiness & Optimization (evidence-based, never conditional on platform testing)

**This subsection is never "Not Evaluated" wholesale merely because 16a's platform testing wasn't performed.** Per [discover.md](discover.md) Category M's 7-dimension framework, most inputs here are directly assessable from evidence already gathered elsewhere in this engagement (Categories D, H, I) — this is synthesis, not a new paid data pull. Evaluate and present as a scorecard (report-design-system.md): **Entity Clarity** (cross-reference 17 below) · **Website Extractability** (clear factual content an AI system can extract — services, products, service area, FAQs, pricing where appropriate, process, expertise, inventory detail) · **Third-Party Corroboration** (see the ethical guardrail immediately below) · **Expertise/Experience Signals** · **Structured Data** (specifically which schema/entity markup applies and why, never a generic recommendation) · **Conversational Query Coverage** (cross-reference Section 18) · **Local Authority**, where applicable. Rate each dimension only where this engagement's evidence supports a rating; an unrated dimension states plainly what's needed to rate it.

**Ethical guardrail on third-party corroboration, non-negotiable.** Recommend only legitimate participation — answering real questions transparently, earning genuine mentions, encouraging real customers to share real experiences, authentic community/trade/PR involvement. **Never recommend or imply fabricated reviews, fake forum/Q&A threads, astroturfing, or any simulated third-party content.**

Close with a **Now / Next / Later** prioritized action plan connected explicitly back to the same underlying SEO strategy elsewhere in the report — schema and content-quality work already recommended in Categories D/H doubles as AI-readiness work; never present "AI SEO" as an unrelated parallel product. **Never promise a specific AI-platform ranking, citation, or recommendation as a guaranteed outcome, and never claim schema alone makes an AI system recommend a site** — contributing factors, not guarantees, consistent with this contract's no-mechanical-causation rule.

Classify each dimension and the overall picture: **Strong · Moderate · Weak · Not Yet Established.** (revised 2026-08-17 — "Not Evaluated This Round" removed from this scale: since every dimension here is rateable from evidence already gathered elsewhere in the engagement, a dimension Scrolly hasn't rated is Scrolly-incomplete work, not a genuine client-facing state; omit that dimension row from the scorecard per the No Unfinished-Research Exposure rule rather than labeling it.)

## 17. Entity & Business Information Readiness

*(New — [discover.md](discover.md) Category M, cross-referenced from 16b above.)* Kept explicitly distinct from Section 16 (16a evaluates *recommendation/citation behavior*; this section evaluates *consistency of the underlying facts* AI and traditional search both depend on, and directly feeds 16b's Entity Clarity dimension). Whether search engines and AI systems can clearly determine: business name · business type · services · products · locations/service areas · hours · contact information · expertise · important people/entities when relevant · organization relationships · same-name business collisions with unrelated entities.

Cross-check across: website · schema/structured data · GBP · citations · social/platform profiles · about/contact pages · service/product pages. Identify inconsistencies and missing entity signals — this is a consistency audit across surfaces already evidenced elsewhere (Categories H and I), not a new data pull.

## 18. Chatbot / Conversational Opportunity

**Corrected definition (2026-08-16, reworded to exact required phrasing 2026-08-17): "This section is not evaluating whether your website needs or should have a chatbot. Instead, it evaluates the conversational questions someone might ask an AI assistant or chatbot that could lead them to your business, and whether your website currently has the right pages and information to answer those questions."** The narrower "should the client install a chatbot" question belongs to Section 19 (Light AI Automation), and only when independently evidenced. This section's actual job: **map the conversational questions a potential customer might ask an AI assistant or conversational search surface that could lead them to this business** — e.g. "where can I buy a mature tree and have it planted near [service area]," "best nursery near [town] for native plants," "who does landscape design near [town]." Derive these from the actual keyword/business research already performed, never generically.

For each mapped conversational intent, state: which existing page (if any) already answers it · which recommended page (Section 6b) should answer it · what content/information needs to exist for an AI system to answer it well and correctly attribute the answer to this business · whether it connects to an AI-recommendation/citation opportunity identified in Section 16.

*(Category N, first half.)* Classify overall: **High-value opportunity · Potential opportunity · Low priority · Not recommended.**

## 19. Light AI Automation Opportunity (Conditional)

*(New — [discover.md](discover.md) Category N, second half. Changed 2026-08-17 from a default/always-present section to conditional-only — a generic AI-automation idea does not belong in an organic-search product.)* **Include this section only when this specific engagement's evidence ties an automation opportunity materially to organic-search execution, lead capture from organic traffic, measurement, or content/search operations.** Where such a finding exists, identify it specifically (lead routing, follow-up, inquiry classification, review-response assistance, reporting, CRM updates, FAQ maintenance, content updating are illustrative examples of the *kind* of finding that qualifies, not a checklist to populate every report). **Where no such materially-relevant finding exists this engagement, omit the section entirely** rather than including a generic placeholder note — this is the expected, common outcome, not a gap. Where included, it stays a light adjunct note next to Section 18, not a standalone deep-dive.

## 20. Expected Organic Traffic Impact

**Every report must address potential traffic impact. Do not omit the section solely because exact outcomes are unknowable** — use transparent scenarios per [discover.md](discover.md) O6/O7's CTR-based methodology, never guarantees.

The section always covers four stages — **current baseline, near-term, mid-term, longer-term implemented-strategy** — but **the form each stage takes is evidence-driven, not mandatory numbers (revised 2026-08-16).** Quantify (weekly/monthly traffic estimates, money-page traffic, informational traffic, local/search-platform activity) only where the underlying evidence genuinely supports it (an observed current baseline, validated ranking-difficulty data, a defensible CTR-by-position assumption). **Where that evidence isn't available, state the stage qualitatively instead, without referencing what Scrolly's own research hasn't yet completed (revised 2026-08-17 per the No Unfinished-Research Exposure rule)** — describe what should plausibly improve and why, in what rough order, using the confidently-known evidence that does exist (current visibility, technical state, architecture gap). A qualitative stage ("near-term: technical fixes and on-page work should improve crawlability and on-page relevance ahead of any ranking movement") satisfies this section exactly as well as a quantified one, and reads as complete on its own — it does not name a "pending check" that would have produced the number. **Omitting the section, fabricating a number, or naming an internal pending check are all contract failures; a clearly-labeled qualitative stage grounded only in what's confidently known is not.**

- **Current baseline** — quantified if an observed baseline exists; otherwise state plainly what's needed to establish one.
- **Near-term scenario** — potential improvement from technical fixes, on-page improvements, core-page optimization.
- **Mid-term scenario** — potential traffic once important money pages achieve meaningful rankings.
- **Longer-term implemented-strategy scenario** — potential traffic if the recommended page structure and content roadmap are substantially implemented and perform successfully.

Modeling considers, when quantifying: search volume · realistic ranking bands · CTR ranges · SERP features · AI Overview/zero-click effects · local pack behavior · keyword overlap · seasonality · authority · competition · implementation completeness. **Do not add overlapping keyword volumes as if every search is a unique visitor. All assumptions must be visible.** Whether quantified or qualitative, every stage must be evidence-labeled per the Mandatory Evidence Labeling table below — a qualitative stage is not exempt from labeling its own confidence.

## 21. Lead / Business Impact Scenarios, and the Investment Case

Where client economics are available ([discover.md](discover.md) O8 `client_specific_economics`), translate traffic scenarios into possible business outcomes using: traffic · conversion rate · lead rate · close rate · average order/project value · margin · lifetime value. **Only use client-provided or clearly sourced values — never invent business economics.**

If economics are unavailable: state what's missing, provide traffic and/or lead scenarios separately (`commercial_value_proxy`), **do not fabricate a revenue forecast.**

For local businesses, also acknowledge value from: calls · Google Maps actions · direction requests · walk-ins · quote requests · branded searches.

**Is organic search worth the investment? (required expansion of the Section 1 verdict, not a repeat of it).** Restate the investment-level recommendation (Foundational / Moderate Priority / High Priority / Aggressive Growth Opportunity) and justify it explicitly from this report's own evidence — e.g. an existing proven local-pack win, a confirmed major visibility gap, fixable technical issues, and how much the recommended site-architecture expansion (Section 6) opens up. State plainly where investment would be well spent and where it would not (gated/unconfirmed offerings, unvalidated clusters) — the goal is to help the client prioritize and sequence, not to declare organic search categorically worthwhile or not.

**The reasoning must be specific to this engagement, never generic (added 2026-08-16).** Do not justify the recommendation with a general claim about businesses of this type or size (e.g. "a legitimate operating business is almost always worth clearer search visibility" as the *stated reason*, rather than as scene-setting). Ground the case in this report's own named findings — cite the specific proven win, the specific confirmed gap, the specific demand evidence, the specific low-effort fixes, the specific confirmed-but-unbuilt offerings — so a reader could not paste the paragraph into a different client's report unchanged.

**Break-even framing, 4-tier fallback hierarchy (revised 2026-08-17 — replaces the prior "compute if supplied, otherwise refuse" behavior, per [discover.md](discover.md) O8).** Show both `Implementation cost ÷ average profit per new customer = customers needed to break even on implementation` and `Report cost ÷ estimated profit per customer = customers needed to recover the report cost`, using `report-design-system.md`'s calc-box component, sourced from the best available tier:

1. **Client-provided economics** — use directly.
2. **Client website pricing** — publicly displayed pricing/ranges on the client's own site, where genuinely representative.
3. **Credible industry benchmark** — a reasonable, sourced industry-typical range for this business category.
4. **Clearly labeled scenario assumptions** — an explicit, stated assumption where none of 1–3 is available.

**Always state, in the report itself: what data was used, where it came from, what is estimated, and what is client-specific.** Prefer profit/contribution economics over gross revenue wherever the tier used reasonably supports it. **Never invent a client-specific figure, never let an estimate read as client-confirmed, never imply a guaranteed acquisition** — this is a break-even/scale calculation, not a forecast.

## 21a. Directional Impact / Opportunity Scenarios (added 2026-08-17)

**Required alongside the break-even framing above — gives the client a sense of scale without a precise forecast.** Present labeled **Conservative / Base (Plausible) / Upside** scenarios, built from whatever combination of local/regional search demand, current ranking, competition, page count, SERP composition, existing authority, and a stated conversion assumption the evidence actually supports for this engagement — every input carries its own evidence-type label. **Only quantify a scenario where the inputs genuinely support a number.** Where they don't, state the scenario qualitatively (e.g. "a meaningful but currently uncaptured segment of local demand," scaled Conservative/Base/Upside by degree, not by an invented number). Where quantified, phrase as an explicit conditional: *"if this page reached approximately [position/range] and captured approximately [stated assumption] of the measured local opportunity, that would imply approximately X–Y visits/leads"* — **never** *"you will receive X visits."* Label every assumption inline, next to the number it produced.

## 22. Quick Wins

Each item: Exact action · Why it matters · Expected impact · Effort · Priority · Dependencies. Specific enough for the client to act on immediately.

## 23. Implementation Priority Matrix & Generated Implementation Roadmap

**Implementation Priority Matrix (precedes the timeline).** A table: Priority · Action · Exact Deliverable · Why · Expected Impact (qualitative) · Effort · Dependencies · **Timing · Timing Reason.** This replaces generic phrasing like "build the nursery page / fix technical issues / publish content" with the same specificity as the rest of the report — after a comprehensive diagnostic, the growth plan should read as comprehensively specific too. **No vague recommendations** ("improve content," "work on technical SEO"). Each task: specific action · page/system affected · keyword/opportunity supported · priority · dependency.

**Timing Reason is a required column, not optional.** State in one line why an item lands where it does — dependency ("after the Nursery page exists"), effort ("a one-line fix, no dependencies"), or urgency/seasonal ("demand window closes in ~7 weeks; page needs build+index lead time before then"). A row with a timing but no stated reason fails this section.

**Roadmap timing is generated per [discover.md](discover.md)'s Roadmap & Timing Generation and Seasonality → Prioritization & Timing rules — never assigned from a fixed calendar template by category.** Use whatever readable, honestly-scaled phases the generated schedule actually calls for — Immediate, Days 1–3, Days 4–7, Week 2, Weeks 3–4, Days 31–60, Month 3, Quarter 2, and so on — sized to what this engagement's findings actually require. **Do not default to a 30/60/90-day skeleton populated by category** (e.g. "all technical fixes go in the first 30 days, all money pages in 31–60, all content in 61–90") merely because that's a familiar shape — that pattern is exactly the anti-pattern this section replaces. A client should leave understanding both what happens immediately and what happens across the coming year, but the phase boundaries themselves must be justified by the items scheduled into them, not decided in advance of the analysis.

**A normally-lower-priority item may be elevated (or a normally-higher one held) when timing genuinely requires it** — most commonly a seasonal lead-time constraint (per discover.md), a technical blocker resolving, or a client confirmation clearing. State the reason inline (Timing Reason column above), never silently.

**Every major roadmap item must trace back to a finding elsewhere in the report**, and dependent items must never be scheduled before the prerequisite they depend on (e.g. a supporting article scheduled before the money page it's meant to link to).

## 23a. Implementation Workbook (added 2026-08-17)

**Immediately after the Priority Matrix/Roadmap (§23), before Page Blueprints.** The analytical report answers *what is happening, why, and what's the opportunity*; the workbook answers *what exactly do I do now* — the executable version of the same analysis, not a second, parallel roadmap. **It must never invent a recommendation independently** — every task's Exact Task/Deliverable content is pulled from a canonical source already in the report (Page Blueprints, technical findings, GBP analysis, AI plan, Organic Conversion Readiness, Measurement Plan). Where an exact implementation recommendation already exists elsewhere, reuse it verbatim or by direct reference; do not re-derive or restate it differently.

**Structure:** one report-design-system.md `.workbook-phase` per roadmap phase, using the same phase labels already generated for §23 (never a reintroduced fixed 30/60/90 template). Each phase contains `.wb-task` checkbox blocks with, where applicable: Action · Why This Is Your Priority · Exact Task · Owner · Status (checkbox) · Dependency · Input Needed From You · Deliverable · Success/Completion Criteria · When To Check Results · What Signal To Look For. Where a phase includes a `POTENTIAL RELEVANCE — VERIFY OFFERING` item (report-facing: "Validate First"), add a `.wb-decision` block with the actual yes/no/conditional options a client would need to answer, and state explicitly which Priority Matrix/Keyword Cluster → Page Map item that answer unlocks or eliminates.

**Design intent, not a formality:** the client should be able to print these pages, check items off by hand, write in answers, and know exactly what happens next without hunting back through the rest of the report. Measurement/checkpoint content reuses the type-specific chains and per-item timing already established in §27 and discover.md's Expected-Progress rules — never a fresh, disconnected timeline.

**Later phases must stay as operational as the first phase, in an explicit required 5-part structure (added 2026-08-17, tightened 2026-08-17 second pass) — the workbook must never taper into generic "monitor and optimize" language.** Every later-phase `.wb-task` (any phase after the first) states all five, per page/cluster, not as free prose but as identifiable fields:

1. **What data to inspect** — the exact source (GSC Performance report, GBP Insights, local-pack rank tracker, the page's own analytics) and exactly what view/filter within it.
2. **What signal to look for** — the specific metric/pattern (e.g. "which queries are generating impressions for `/trees-for-sale/`," "position for 'plant nursery' in the Wills Point local pack").
3. **What action that signal triggers** — the concrete next step if the signal appears (e.g. "if terms are sitting at positions 8-20, add internal links from the two highest-traffic existing pages").
4. **What not to react to yet** — a plausible-looking non-result at this checkpoint that doesn't warrant a change (matches §27's "what not to panic about" element).
5. **When to check again** — the next specific checkpoint, not "ongoing" or "ongoing monitoring."

Useful concrete signals to draw from, selected by what the actual finding/action type supports: is the page indexed · which queries are generating impressions · are unexpected queries appearing · which terms sit in positions 8–20 · is CTR weak despite impressions · is the wrong page ranking for the intended query · are local-pack positions changing · are GBP actions increasing · are leads/conversions appearing · are users landing but not converting · does the page need stronger proof/CTA · is internal linking sufficient · does a subcluster show enough evidence to justify its own page. **A later-phase task that only says "monitor and optimize," or that's missing any of the 5 parts above, fails this requirement** — see the new workbook-later-phase-specificity Final Quality Gate check.

## 24. Longer-Term SEO Roadmap

Additional page expansion · content growth · content updating · content consolidation/pruning where appropriate · backlinks · digital PR/local authority · location expansion · conversion optimization · ranking monitoring · competitor monitoring · seasonal planning · measurement refinement.

## 25. Visual Evidence

**Data-driven visualization (charts, diagrams, structured tables built from retrieved data — [report-design-system.md](report-design-system.md)'s component set) is the standard evidence format (revised 2026-08-16).** Use it when it materially helps prove or explain a finding — visuals support conclusions, they don't decorate the report. Priority: important current rankings · Local Pack wins/gaps · significant SERP composition · Lighthouse/performance findings · visually-demonstrable technical problems · competitor comparisons · current site architecture · recommended site architecture · GBP findings · important before/after opportunities.

**Literal screenshots are optional, not the default — required only where the pipeline reliably supports capturing them and a screenshot would materially improve the finding over a data-driven equivalent** (e.g. a genuinely distinctive visual state that a table or chart can't convey as clearly). Where no screenshot capability exists in the current tool stack, that is not a gap in this section — a data-driven visualization of the same underlying evidence satisfies the requirement on its own. **Never mark this section, or its coverage-index row, "Completed" on the basis of screenshot evidence unless a screenshot was actually captured** — if the section is satisfied entirely through data-driven visualization, say so plainly rather than implying screenshots were delivered. Annotate/caption every visual to explain what the client should notice.

## 26. Social / Platform Search Visibility

**Secondary — keep brief unless social/platform discovery is strategically important** (per [discover.md](discover.md) Category A's brief sub-note). Whether branded social profiles appear in Google · whether public social content is indexed · whether YouTube/Instagram/TikTok/Pinterest/Reddit/other platforms repeatedly occupy target SERPs · whether platform content creates an opportunity or competitive threat. **Do not let this section replace core SEO work.**

**Test where feasible, mark honestly where not (added 2026-08-16).** Evaluate branded discoverability, category/service discoverability, local discoverability, competitor presence, and profile consistency across the platforms genuinely relevant to this business (YouTube, Instagram, TikTok, Facebook, and others as relevant) wherever the current tool stack and time budget make that reliably testable. **When a platform cannot be reliably tested this round, mark it "Not Evaluated" rather than padding the section with generic platform-strategy advice** — a thin, honest section beats a padded one that reads as filler.

## 27. Measurement Plan

Define how progress should be measured after implementation: GSC clicks/impressions · ranking/query visibility · indexed pages · organic sessions · conversion events · leads · calls · bookings · transactions · Local Pack visibility · GBP interactions · reviews/review velocity · AI/search visibility where measurable · YouTube/search growth where applicable.

**Baseline-vs-post-access distinction (required, added 2026-08-15).** Explicitly separate what can be baselined publicly right now (local-pack position, review counts, on-page/technical state, publicly visible ranking signals) from what only becomes measurable once the client authorizes GSC/GA4/GBP access (impressions, clicks, exact query-level rankings, conversion events, GBP interaction data). Don't blur the two — a client should know which numbers this report can already show them and which require a connection they haven't granted yet.

**Checkpoint timing is generated per item, not forced onto one fixed grid (revised 2026-08-16).** Apply [discover.md](discover.md)'s Expected-Progress / Measurement Checkpoints chains — NEW PAGE, TECHNICAL FIX, GBP/LOCAL CHANGE, CONTENT UPDATE — to determine, per roadmap item, which indicator becomes checkable when, from that item's own implementation date, its realistic lead time, and any seasonal window it's tied to. Present each checkpoint against the indicator it actually measures (e.g. "crawl/indexation confirmable roughly 1–2 weeks after publishing," "meaningful ranking movement not realistically checkable before roughly N weeks") rather than checking every indicator on the same handful of dates. **30/60/90/180/365-day-style horizons remain available client-facing labels where an item's own generated timing genuinely lands there** — they are a presentation option, never the organizing structure imposed on every item regardless of what it is. **Ranking alone is not the business outcome — say so. Never promise a specific outcome or response time; explain what indicators should move, and roughly when it becomes reasonable to look.**

**Four-part checkpoint structure, required per stage (added 2026-08-17, per [discover.md](discover.md)'s checkpoint-vs-guarantee rule).** Every checkpoint states all four: **what may reasonably be visible** by this point · **what to check** (the specific data/screen/report and the specific signal) · **what not to panic about yet** (a plausible non-result at this checkpoint that doesn't mean the item failed) · **what would warrant action** (the actual signal meaning something needs attention or reoptimization). Phrase as "by this point, it becomes reasonable to CHECK whether X" — never "you should have X by this point." This is the same structure the Implementation Workbook (§23a) draws its later-phase content from.

## 28. Scope & Next Steps

Clearly explain what the $299 Discovery Report includes and does **NOT** include. It is strategy, diagnosis, prioritization, and opportunity discovery. Unless specifically included in the purchased package, do not imply it includes: full website implementation · full site redesign · writing every recommended page · writing the complete blog backlog · ongoing SEO management · link-building execution · ongoing GBP management · ongoing analytics reporting.

Provide clear next-step paths: **DIY** (client follows the roadmap) · **Implementation** (Scrolly Social implements priority recommendations) · **Ongoing SEO** (Scrolly Social manages implementation, content, optimization, measurement, iteration). **Do not make the offer excessively sales-heavy** — it should follow naturally from the identified work.

## 29. Seasonal Search Opportunities (Conditional)

*(New 2026-08-15, per [discover.md](discover.md) Category A's seasonal/adjacent-opportunity gate check — the section that was silently dropped once already, see the Core Rule's "No silent disappearance" note.)* Include this section whenever research surfaces real, evidenced seasonal demand material to the business — pumpkin/fall attractions, corn mazes, spring gardening, Christmas trees, holiday events, Mother's Day traffic, or other relevant seasonal patterns, whatever the actual evidence shows for this business. Not every client needs this section — omit it cleanly (not silently; note it wasn't applicable) when no material seasonal opportunity was found.

**Only include offerings/events that are confirmed, or clearly labeled "Opportunity Worth Evaluating" when not confirmed** — this is gate-check-level evidence (real demand + competitive landscape), not a feasibility, capacity, staffing, or operations assessment, and must say so explicitly. Never imply the business should build a seasonal attraction; state what the search-and-competition evidence shows and leave the operational decision to the client.

**Local-first structure is required, not a caveat (added 2026-08-17, per discover.md's Local Business Demand Hierarchy).** The section must open with whatever local/catchment-level evidence exists — local-pack testing at the client's own markets, local competitor presence — not with the broad-geography (state/national) volume figure. Where local competitive evidence was gathered (who currently serves this seasonal demand in the client's market), that evidence is the section's lead finding and first callout; the broad-geography number follows as supporting scale context, never as the opening stat. This is a structural ordering requirement, checked in the rendered report, not satisfied by adding a sentence noting local data wasn't tested.

**Roadmap cross-reference is required, not optional (added 2026-08-16).** Per [discover.md](discover.md)'s Seasonality → Prioritization & Timing rule, a material seasonal finding in this section must state: (a) the lead time remaining from this report's date to the next relevant demand window, and (b) whether and how that lead time affected §22 Quick Wins or §23's Priority Matrix/Roadmap — with a stated reason either way. **Where the underlying offering is only "Opportunity Worth Evaluating" (not confirmed), the roadmap effect is a client-decision deadline, not a build task** — e.g. "the demand window is real and time-limited; deciding whether to pursue it should happen within roughly N weeks" belongs in §23 as a Days-1-30-style decision item, distinct from any actual build/implementation row. A seasonal finding that has no effect on the roadmap at all (window already passed, or genuinely no time-sensitive action follows from it) must say so explicitly rather than simply not appearing in §23 — see the Final Quality Gate's seasonal-roadmap check.

## 30. Appendix

Complete keyword opportunity table · full 100–400-topic content opportunity map when available · keyword clusters/difficulty/search volume · long-tail modifier classification detail · SERP evidence · competitor detail/rankings · **full geographic candidate-market comparison (distance/drive-time + population/size + demand/competition where retrieved, for every Tier-0 survivor, per [discover.md](discover.md) O2's proximity-vs-importance rule — not only the markets that received the deepest testing)** · full technical audit detail · full Lighthouse/performance findings · GSC/GA4 findings · local/GBP evidence · full backlink/referring-domain listing per §15's size-conditional rule · legitimate link/citation/mention opportunity table · AI-discovery evidence (including the full AI Discovery Scorecard when platform testing was performed) · social/platform test results · seasonal/conditional-opportunity monthly-or-best-available data · traffic-model and ranking-time assumptions · data sources · confidence labels · research methodology · pending items · client assumptions.

**Local-first geography ordering (added 2026-08-16).** For a local/regional business, order supporting search-demand data by strategic relevance, not by data-source convenience: town/local-market data first, regional/state data second, national data last and explicitly framed as context only. Do not open the appendix's demand data with a national figure and relegate the client's actual market to a secondary note — a national "550,000 searches" figure sitting above a real town's numbers reads as if it's the client's opportunity, even when the surrounding prose says otherwise. Every table needs a geography column or explicit label; never let figures at different geographic scopes appear interchangeable.

**Format for humans (standing rule, reaffirmed 2026-08-16).** The appendix is a formatted evidence book, not a raw data dump — never paste unformatted API/JSON output into the PDF. Raw underlying data (the kind a client might want to keep and reuse) belongs in the Source Data Workbook (see "Three-part customer package," above), not the appendix — the appendix explains and supports the report's conclusions; the workbook is the client's own copy of the source data.

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

Before generating the client-facing report, run a completeness check. **A report fails validation if it silently omits a required module for any of these reasons:** later keyword research was deeper · a data source's API funding/credits ran out · some data was unavailable · one processing stage or agent overwrote another's output · the report was shortened for length/readability · another methodology revision occurred in between. **A required module (the section itself) is never dropped. An individual Scrolly-incomplete data point within it is never marked "Pending" client-facing either (revised 2026-08-17, per the No Unfinished-Research Exposure rule) — the module ships with its confidently-known content, restructured around the gap, not flagged.**

**Additional checks (added 2026-08-16):**
- **Duplication audit:** does any table, worked example, or analysis appear twice (or in near-duplicate form) across the report? Each occurrence must add new information, or the repeat must be cross-referenced rather than fully repeated.
- **Pagination/orphan check:** does any section-opener (eyebrow + heading) land alone at the bottom of a page with its actual content starting on the next page? Does any table, diagram, or linking-relationship unit break awkwardly mid-block?
- **Keyword-visibility check:** does the main report visibly show representative keyword/volume/geography data, or does it only reference a total count while burying the actual data in the appendix?
- **AI Discovery honesty check (revised 2026-08-17):** if a multi-platform AI Discovery Scorecard is present, does every populated cell correspond to a genuinely performed test? If no multi-platform testing was performed this round, the scorecard must be **absent entirely**, not present with untested cells marked "Not Evaluated This Round" — see the Unfinished-research-exposure check.
- **Coverage-index honesty check:** does every "Completed" row in the 29-point coverage index correspond to genuine analytical depth, not just a generic paragraph?
- **Roadmap-specificity check (added 2026-08-16):** does §23 contain only broad phase-level summaries ("Days 1–30: foundation work"), or does every row trace to a specific finding with a stated reason for its timing? A roadmap that could be pasted unchanged into a different client's report fails this check.
- **Seasonal-roadmap check (added 2026-08-16):** does `findings.md` contain a Moderate/High-confidence seasonal finding? If so, does §23 (or §29 itself) state whether and how it affected roadmap timing, with a reason either way? A seasonal finding present in findings.md/§29 but silent in §23 with no stated reason fails this check — this is the specific regression that first motivated the Seasonality → Prioritization & Timing rule.
- **Manufactured-seasonality check (added 2026-08-16):** does every seasonal claim in `report.md`/`appendix.md` trace to an actual evidenced row in `findings.md`? A seasonal recommendation or timing adjustment with no corroborating evidence fails this check.
- **Roadmap-dependency check (added 2026-08-16):** is any roadmap item scheduled before a prerequisite it explicitly depends on (e.g. a supporting article scheduled ahead of the money page it's meant to link to, or a build item scheduled ahead of the client confirmation it's gated on)?
- **Screenshot-honesty check (added 2026-08-16):** does §25 or the coverage index claim screenshot evidence was delivered when no screenshot was actually captured? Data-driven visualization satisfying §25 on its own must be described as exactly that, never implied to be screenshot evidence.
- **Content-map-sizing-honesty check (added 2026-08-16, updated 2026-08-17):** does §14's actual item count plausibly match the genuinely validated opportunity for this business (not padded to look thorough, not artificially capped below what the research supports)? Is any already-evidenced-but-unclustered sub-research (e.g. bulk keyword-import sub-counts) present somewhere in the appendix's "Additional Evidenced Keyword Data" subsection, rather than silently absent?
- **Client-language leak check (added 2026-08-16):** does report.md/appendix.md contain a raw internal code verbatim in client-facing text — e.g. `POTENTIAL RELEVANCE`, `CONFIRMED RELEVANCE`, `IRRELEVANT / EXCLUDE`, a bare `Category A`–`Category N` reference, a bare `O1`–`O10` reference — instead of the report-facing label from Section A's mapping table? This is a concrete, recurring leak pattern (an internal enum value reached client text in a real engagement even after the general shorthand ban existed) — check for it explicitly, don't rely on the general rule alone.
- **Evidence-density check (added 2026-08-16, second redesign round):** apply the prose-removal test from the Evidence Density Rule above to the report as a whole, and specifically to §7 (keyword depth) and §6b (site architecture) — with every paragraph of prose removed, do the remaining tables/matrices/visuals still make the depth of research obvious? A report that passes every individual numbered section requirement can still fail this check if it reads as narrative summary rather than visible evidence.
- **Keyword-depth-visibility check (added 2026-08-16):** does §7 include the funnel diagram, grouped keyword evidence tables with real phrases, and the Keyword Cluster → Page Map (variant counts + secondary keywords, not just cluster names)? Does any already-evidenced sub-cluster count sitting in `findings.md` fail to appear anywhere in report.md or appendix.md?
- **Cluster-to-page traceability check (added 2026-08-16):** can a reader follow the causal chain from §7's keyword clusters to §6b's site-architecture diagram without a logical gap — i.e. does every Build Now/Optimize/Validate First node in the architecture diagram trace to an actual cluster in the Keyword Cluster → Page Map?
- **Pagination/typography visual check (added 2026-08-16, cannot be satisfied by markdown/HTML review alone):** render the PDF and visually inspect every page — every Part starts on a fresh page, no orphaned section-opener headings, no text below the 9pt floor, no table overflow/clipping, no awkward partial sections. This check is explicitly a rendered-artifact check, not a source-file check — a report can pass every other Final Quality Gate item and still fail this one if the actual PDF wasn't inspected.
- **AI Search Readiness completeness check (added 2026-08-16):** does 16b (AI Search Readiness & Optimization) contain a genuine assessment for each of the 7 dimensions (rated or explicitly stated as not ratable this round), independent of whether 16a's platform testing was performed? Does every third-party-corroboration recommendation describe only legitimate participation, with zero suggestion of fabricated reviews, fake threads, or astroturfing?
- **Local-demand-primacy check (added 2026-08-17, local/regional-mode engagements only):** does §7's leading keyword table present catchment-ordered demand (core → secondary → national-context-last), or does a national figure lead the primary opportunity table? Is there a real per-market figure for every core/secondary row, with zero summed or population-scaled fabricated local numbers?
- **Diagram color-token check (added 2026-08-17):** does every SVG/diagram introduced in a redesign pass use only the canonical `--scrolly-*`/palette hex values (report-design-system.md), with no one-off hex value and no reuse of `--amber`/`--mint`/`--gray` outside their existing reserved badge meanings? Does every fill/text pairing meet the stated contrast rule (dark fill → light text, pale fill → dark text)?
- **Long-tail-discovery-evidence check (added 2026-08-17, tightened 2026-08-17 second pass):** does §7's grouped keyword tables show explicit long-tail modifier classification (Head/Mid-tail/Long-tail) inline, across every major cluster, not concentrated in one isolated sample table? Per the No Unfinished-Research Exposure rule, if long-tail testing genuinely wasn't performed this round, the fix is mining the existing keyword pool for long-tail phrases (almost always possible, see discover.md), not disclosing the absence.
- **Consolidated-opportunity-matrix check (added 2026-08-17):** does §7's Primary Opportunity Matrix appear once, with §8/§10 referencing it by cluster name rather than re-presenting a near-duplicate per-cluster demand/visibility table? A report with the same cluster-level figures tabulated three times in three sections fails this check.
- **Backlink-appendix-completeness check (added 2026-08-17):** for a small backlink profile (roughly under ~50 referring domains) where individual-record-level data was actually retrieved, does the appendix list it in full rather than presenting only an aggregate summary count?
- **Backlink-individual-records-retrieved check (added 2026-08-19, blocking for a normal funded run):** was the `backlinks` individual-record call actually made this engagement (not just `backlinks_summary`/`backlinks_referring_domains`)? If not, and a real data-source budget was available, the report is not `ready_for_delivery` — this is a completeness gap, not something a disclosure sentence in the appendix can substitute for. Only exempt when no backlink data source access existed at all this engagement (matches a client-access/data-source-availability constraint, not a "didn't get to it" one).
- **Break-even-fallback-tier-disclosed check (added 2026-08-17):** does §21's break-even section state which of the 4 fallback tiers (client-provided / website pricing / industry benchmark / labeled assumption) was used to produce its figures?
- **Workbook-later-phase-specificity check (added 2026-08-17):** does any Days-61-90-or-later `.workbook-phase` in §23a contain a task whose Exact Task/Deliverable content amounts only to generic "monitor and optimize" language with no page/cluster-specific signal named?
- **AI-automation-not-default check (added 2026-08-17):** if §19 (Light AI Automation Opportunity) is present, does it cite a specific finding tying it materially to organic-search execution, lead capture, measurement, or content/search operations — rather than appearing as a generic, evidence-free AI idea?
- **Unfinished-research-exposure check (added 2026-08-17, blocking) — scans the rendered/final `report.md` and `appendix.md` for language that exposes Scrolly's own incomplete research**, per discover.md's No Unfinished-Research Exposure rule. Flags, case-insensitively: "Pending Validation" · "Not Evaluated This Round" · "requires paid research" · "funded validation batch" · "wasn't run this round" · "tool capacity exhausted" · "future round" · a "What We Still Need to Know" (or equivalent) heading framed around Scrolly's own unstarted work · any AI Discovery Scorecard where all/nearly-all platform cells are empty/Not-Evaluated. **Client-access-dependent language is explicitly exempt** — "Requires Client Access," "Available once you grant Search Console access," and equivalent phrasing describing a genuine external dependency (GSC/GA4/GBP access, first-party tracking) are not flagged. A match on a non-exempt phrase **blocks delivery** (this is not a soft warning) until the underlying content is restructured per the No Unfinished-Research Exposure rule — complete the research, or omit/restructure the section, never reword the disclosure.
- **National-lead check (added 2026-08-17):** for a local/regional-mode engagement, does any table anywhere in the main report body (not only §7's first table) present a national-only volume figure as its lead/most prominent number, with no local figure alongside it?

The report is **not complete** unless it clearly answers:

- What does this business actually offer?
- What is already working?
- What is currently wrong, technically? What technical checks passed?
- What Lighthouse/performance problems exist?
- Can SEO performance currently be measured correctly?
- What site/page structure should change? What pages should be created? What existing pages should be updated? What sections of those pages should change? For the highest-priority new/changed pages, is there an actual implementation blueprint (not just a page name)?
- For existing pages, has each one been classified KEEP/OPTIMIZE/EXPAND/MERGE/REDIRECT/CREATE with real evidence behind the classification?
- Is there a real seasonal/adjacent-opportunity section if the research surfaced one — or a stated reason there isn't?
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

**Narrative test (added 2026-08-16) — read the finished report as a small-business owner who knows little about SEO, and ask two questions:**

1. *What does this report teach me SEO actually consists of?* The answer must not be **"build a blog."** It must be something like: understand what customers search for, organize the website around those intents, build strong commercial pages for what the business actually sells, make the site technically understandable to search engines, improve local visibility and trust, connect related pages intelligently, create supporting content only where there's a real reason to, strengthen how the business is understood across Google/AI/platforms, and measure what happens. If Content Growth Strategy or the Internal Linking Strategy reads as the report's centerpiece, that's a structural failure — see §13's demotion note and §6c's commercial-first linking order.
2. *After reading all this research, do I know exactly what to do next?* The answer must be **yes** — Part VII (Business Impact & Implementation) is the report's payoff, not a summary of what was already said.

**$299 value test.** Before considering the report complete: would it be obvious to the client that substantial, personalized research and strategy were performed specifically for their business? Value comes from depth, specificity, evidence, prioritization, and actionability — never from artificially lengthening the report or adding generic SEO education as filler.
