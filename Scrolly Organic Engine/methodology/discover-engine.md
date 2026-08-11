# Discover Engine (V0.5)

Operational playbook for running a Discover engagement end-to-end. Pairs with [discover.md](discover.md) (what to analyze and how to judge it) and [report-contract.md](report-contract.md) (what the finished report/appendix must contain — permanent, non-regressing) — this file is how/where the work happens and how it resumes. Through V0.4 this was manual-only: a Claude Code session follows this protocol by hand, one engagement at a time. **V0.5 adds Automated/Unattended Mode** (see below) for a headless agent runner — the manual protocol described throughout the rest of this file is still the default and still fully valid; Automated Mode is an explicit, narrow variant of it, not a replacement.

## Engagement Folder Structure

Created at `clients/<name>/discover/` when an engagement starts (copy from [engagement-template/](engagement-template/)):

```
input.md        — validated/normalized lightweight business input (O1) + geographic input (O2) + determined mode
data-plan.md     — planned queries, tiered per the retrieval protocol below, approved before any paid call
query-log.md     — one line per executed query, checked before every new call
raw/             — raw retrieved payloads, one file per call (archival; rarely reloaded)
normalized/      — extracted facts per topic, small enough to read routinely (e.g. geographic-screening.md, keyword-universe.md, current-capture.md, alongside the existing per-category files)
findings.md      — canonical-schema records: A–N (Supporting Audit) + Geographic Market (O2) + Money Page (O4) + Content Opportunity (O9) — the structured source of truth, "C"
status.md        — checkpoint: step reached, what's done, what's next
report.md        — Simple customer report ("A"), derived from findings.md, structured per report-contract.md (not independently structured)
appendix.md      — Supporting appendix ("B"), derived from findings.md, structured per report-contract.md §24
```

## Step-by-Step Protocol

1. **Validate & normalize inputs** — fill `input.md`'s absolute-minimum O1 fields (website/domain; physical location(s) if local) from client-provided facts. Every other field — business description, service categories, service area, included/excluded markets, and the enhanced tier (inventory, best sellers, transaction values, margins, close rate, capacity) — is optional and clearly marked as such; leave blank rather than guessing or pressuring the client for them. None of it blocks proceeding to Step 2.
2. **Determine mode** — deterministic: existing website → Mode 1; business defined, no website → Mode 2; no business yet, evaluating niche/location → Mode 3. Record in `input.md`. (Mode 3: O1/O2 will be inferred, not client-provided — note that in `input.md` too.)
3. **Determine required data** — cross-reference [discover.md](discover.md)'s Data Capabilities with the mode and business facts against [data-sources.md](data-sources.md); draft `data-plan.md` using the tiered retrieval protocol below, listing only capabilities actually applicable to this engagement.
4. **Geographic Opportunity screening (O2, local/regional businesses only)** — run Tier 0 (free) screening on client-named markets plus independently-generated candidate markets before any paid call in this step. Only candidates surviving Tier 0 proceed to Tier 1 (batched demand), then Tier 2 (targeted SERP), then Tier 3 (listings/competitor density) — each tier gated on the previous tier's survivors, per [discover.md](discover.md) O2. Do not run full evidence collection on every candidate. Skip this step entirely (state so in `status.md`) for a non-geo-bound business.
5. **Query external sources** — only after `data-plan.md` is approved by the user. Before each call, check `query-log.md` for a reusable existing result within the freshness window noted in `data-sources.md`. Log every call immediately (success or failure). Write raw output to `raw/`; extract the relevant facts to `normalized/`.
6. **Build the Keyword Universe (O3) and cluster (O4)** — thin or absent confirmed inventory is not a reason to pause here. Expand in order: (A) confirmed O1 offerings, (B) industry/category-knowledge expansion, (C) competitor keyword discovery, (D) related keyword discovery — scoped to surviving O2 markets where local — using batched/bulk endpoints. Tag every resulting cluster with a `relevance_classification` (CONFIRMED RELEVANCE / POTENTIAL RELEVANCE — VERIFY OFFERING / IRRELEVANT-EXCLUDE) before it proceeds to a Money Page or Content Opportunity record. Before requesting a dedicated difficulty/intent/volume call, check whether those fields are already present in an earlier expansion response — fill genuine gaps only.
7. **Identify organic landscape, competitors, difficulty, and current capture (O5–O6)** — select competitor domains by evidence of actual organic capture across the important commercial clusters (not by recall of prior local-pack appearance), per [discover.md](discover.md) Category A's corrected rule. Pull current-capture evidence for the client's own domain (Mode 1) as the O6 observed baseline.
8. **Analyze evidence** — per [discover.md](discover.md) O1–O10 and Categories A–N, applicable to the determined mode.
9. **Create structured records** — write A–N findings to `findings.md` using the fixed format below; write Geographic Market (O2), Money Page (O4), and Content Opportunity (O9) records to their sections of the same file. Every record carries evidence_type and confidence.
10. **Prioritize** — set priority/expected_impact/effort with rationale in `dependencies_limitations` where non-obvious; complete O10's six distinct opportunity rankings.
11. **Produce the structured analysis** — `findings.md`, complete across all four record types, is "C."
12. **Run the Final Quality Gate** — before generating customer outputs, check `findings.md` against every question in [report-contract.md](report-contract.md)'s Final Quality Gate section, *and* confirm every category A–N and every O1–O10 layer that's in scope for this mode still has its full findings intact in `findings.md` — not compressed, not overwritten by a later round. Where a question can't be answered from available evidence, that's not a blocker — record the gap explicitly (what was evaluated, what was confirmed, what remains unknown, what would resolve it) per the Core Rule's six-step fallback, so the gap shows up *in* the report rather than being silently absent from it. Running out of paid-tool credits mid-engagement is never grounds to drop a category — see report-contract.md's explicit list of invalid reasons for omission.
13. **Derive customer outputs** — generate `report.md` ("A") and `appendix.md` ("B") from the *full, current* `findings.md`, structured per [report-contract.md](report-contract.md) end to end (Executive Summary + scorecard leading, Current Wins never omitted, appendix carrying the depth). Never author them independently, never omit a report-contract.md section (mark it "Not Evaluated / Data Required" instead), and never let a section's itemized findings (Technical FIX NOW/IMPROVE/PASSED, per-competitor detail, backlink classification) collapse into a short prose summary — "concise" governs prose, not itemized findings, per report-contract.md's Core Rule.

## Progressive, Cost-Controlled Retrieval Protocol

Applies to every paid capability in the Opportunity Engine, not just O2's geographic screening:

1. **Bulk discovery** — batch seeds/keywords/candidates into as few calls as the tool allows; never one call per keyword or per candidate market.
2. **Normalize/filter** — extract to `normalized/`, discarding off-topic noise (as already practiced — see the Roblox-contamination handling in prior engagements).
3. **Inspect fields already returned** — bulk keyword-expansion responses typically already carry volume, competition, CPC, difficulty, and intent. A dedicated difficulty/intent/volume call is only justified where those fields are genuinely absent for a keyword that matters to a pending decision.
4. **Identify the actual evidence gap** — name the specific decision (a money-page difficulty rating, a content-topic priority, a geographic market's classification) that's blocked without more data.
5. **Make only the calls needed to fill that gap** — targeted, not blanket. SERP pulls go to representative/high-priority keywords and markets where live evidence would materially change a recommendation, not to every keyword or every candidate market.

A data-plan listing "10–15 calls" or similar is an estimate for planning purposes, never a target to fill or a prescribed sequence — fewer calls that fully resolve the gaps is the better outcome.

## Checkpoints & Resume

`status.md` tracks: mode, step reached (1–13), data-plan approval, query completion (ref `query-log.md`), a per-layer completion checklist (O1–O10) and a per-category (A–N) findings checklist, quality-gate status, report/appendix generation, and completion. A new session reads `status.md` first and resumes at the first incomplete step — it does not re-read `raw/` or redo finished analysis; it reads only the `normalized/` files still relevant to remaining work.

## Automated / Unattended Mode (added 2026-08-10 — enables headless/agentic execution)

Everything in this file describes the manual protocol by default: a human runs each step and approves `data-plan.md` before any paid call, per Query Governance rule 1 below. **Automated Mode** is what an unattended agent runner (no human present between intake and the Final Quality Gate) follows instead. It changes exactly two things; everything else in this file — query-log dedup, freshness reuse, progressive retrieval, failure handling, findings schema, checkpoints/resume — applies unchanged.

1. **Pre-authorized call ceiling replaces per-engagement data-plan approval.** A human isn't present to approve `data-plan.md` live, so approval is granted in advance, capped, and mode-specific instead of per-engagement:
   - **Mode 1/2, local/regional business:** up to 60 paid DataForSEO calls.
   - **Mode 1/2, non-geo-bound business (O2 skipped):** up to 40 paid DataForSEO calls.
   - **Mode 3 (niche/location evaluation):** up to 40 paid DataForSEO calls per candidate, capped at 3 candidates per run unless re-authorized.
   - These are starting estimates sized off `data-sources.md`'s shortlist (roughly: 1 demand call, 5–15 SERP pulls, 3–5 competitor-capture calls, 3–5 keyword-expansion calls, 1–2 gap-fill calls, O2's tiered geographic funnel, 3–5 AI-overview checks, 1–3 local-listings calls, 4–8 backlink calls) — recalibrate after the first several real automated runs once actual per-call costs and counts are known; they are not sourced from vendor pricing (still Unverified per `data-sources.md`).
   - The runner still writes `data-plan.md` before querying (Step 3 is unchanged) — it just self-approves against the ceiling instead of pausing for the user. `data-plan.md` and `query-log.md` remain the audit trail.
   - **If the ceiling would be exceeded** before all applicable Data Capabilities are covered: stop querying, mark the uncovered capabilities "Not Evaluated / Data Required" per `discover.md`'s fallback rules, set `status.md` to flag the engagement as ceiling-limited, and continue to the Final Quality Gate rather than blocking or silently over-spending. Optional-enrichment capabilities (historical/archive, content-coverage trend, technology detection) are skipped by default in Automated Mode to conserve budget for Always Required / Conditionally Required capabilities — same as the "only if the user asks" rule already governs them manually.
   - `DATAFORSEO_ENABLED=false` (e.g., DataForSEO unfunded) is not a ceiling breach — it's the existing "missing always-required capability" fallback in `discover.md`: proceed with every non-DataForSEO capability (Lighthouse/PageSpeed, direct site reads, manual/free checks), mark DataForSEO-dependent findings "Not Evaluated / Data Required," and still complete the report through the Final Quality Gate.

2. **The Final Quality Gate (Step 12) becomes the mandatory pre-send checkpoint**, standing in for the human review a manual engagement gets throughout. The runner must not hand a report to the delivery pipeline until Step 12 has run against `findings.md` and `status.md` records the result. Whether that Quality Gate output then requires a human's explicit approval before the client receives anything, or triggers send automatically, is a delivery-pipeline configuration (`REQUIRE_MANUAL_APPROVAL`, outside this vault) — not a methodology question. Either way, the Quality Gate itself is never skipped and never optional.

Nothing else changes: mode determination, competitor selection, relevance classification, the progressive retrieval protocol, and the Core Rule (later research enriches, never replaces) all apply exactly as written, unattended or not.

## Query Governance (cost control)

- No paid query runs without a `data-plan.md` entry approved by the user first (manual mode) or within the pre-authorized ceiling (Automated Mode — see above).
- Before executing, check `query-log.md` for a match (same tool + normalized params) within that capability's freshness window per `data-sources.md`. Reuse instead of re-querying.
- A methodology revision does not by itself invalidate previously retrieved evidence — reuse existing calls whose underlying facts (demand, SERP composition, backlinks, technical findings) haven't changed; only pull new data to fill evidence gaps the revision exposed.
- Log immediately after every call, success or failure.
- Use the tool marked preferred in `data-sources.md`; use the fallback only if the preferred tool fails or is unavailable. Do not call a tool not listed in `data-sources.md` without adding it there first.
- Call optional-enrichment capabilities only if the base analysis leaves a material gap and the user asks to fill it.

## Failure & Low-Confidence Handling

On query failure: log the failure and reason in `query-log.md`, mark that capability unavailable in `status.md`, and apply [discover.md](discover.md)'s existing fallback/confidence rules — do not block the rest of the run and do not guess.

## Findings Format (JSON-ready discipline)

`findings.md` has four sections, each a fixed-column Markdown table:

- **A–N (Supporting Audit)** — one table per category: `category | finding | recommended_action | evidence | evidence_type | source | confidence | priority | expected_impact | effort | dependencies_limitations`
- **Geographic Market (O2)** — `market | distance/drive_time | relevant_business_line(s) | demand_signal | competition | current_visibility | opportunity | recommended_targeting_approach | classification | page_recommendation | evidence_type | confidence`
- **A–N (Supporting Audit)** now includes **K. Analytics & Measurement Readiness** and **L. Organic Conversion Readiness** alongside the original A–J categories — same fixed schema, no new columns.
- **Money Page (O4)** — `recommended_url | purpose | primary_keyword | supporting_keyword_cluster | search_intent | relevant_geography | demand | organic_difficulty | current_visibility | estimated_traffic_opportunity | commercial_value_proxy | client_specific_economics | priority | supporting_content_needed | relevance_classification | evidence_type | confidence`
- **Content Opportunity (O9)** — `topic_title | primary_keyword | supporting_keywords | search_demand | organic_difficulty | intent | money_page_supported | relevance_classification | why_it_matters | priority | evidence_type | confidence` — grouped under First 10 / Next 20 / Broader Backlog per discover.md O9, sized to the real opportunity count found.

`relevance_classification` (CONFIRMED RELEVANCE / POTENTIAL RELEVANCE — VERIFY OFFERING / IRRELEVANT-EXCLUDE) and the O8 commercial-value split (`commercial_value_proxy` vs. `client_specific_economics`) are defined in [discover.md](discover.md)'s Evidence Classes and O8 sections — never collapse either pair into a single field.

No freeform prose rows in any of the four. Use `—` for a field that doesn't apply — never omit a column or reorder fields. This fixed, consistent structure is what allows a future JSON conversion without redesigning the schema. JSON generation itself is deferred — not built in V0.2.

## Completion Definition

An engagement is complete when: every O1–O10 layer applicable to the mode has schema-complete records (or an explicit "insufficient evidence" entry per the fallback rules); every category applicable to the mode has schema-complete entries in `findings.md`'s A–N tables; the data plan is fully executed or each unmet capability is explicitly marked unavailable; the Final Quality Gate (Step 12) has been run against `findings.md`; `report.md` and `appendix.md` are generated from `findings.md`, structured per [report-contract.md](report-contract.md); and `status.md` is marked complete and dated.

## Rules

- Never run a paid query without an approved `data-plan.md` entry.
- Never call a DataForSEO tool that isn't listed in `data-sources.md`.
- Always check `query-log.md` before calling — reuse before re-querying, including across a methodology revision (see Query Governance above).
- Follow the progressive retrieval protocol — bulk, then inspect, then fill gaps only. Never call per-keyword or per-candidate-market by default.
- `report.md` and `appendix.md` are always generated views of `findings.md`, never independently authored, and always structured per [report-contract.md](report-contract.md) — never omit one of its required sections; mark it "Not Evaluated / Data Required" instead.
- `findings.md` is append-only within an engagement — a new round adds and updates records, it never causes an earlier round's records to disappear from what gets rendered into `report.md`. If new evidence contradicts old evidence, follow report-contract.md's contradiction-handling steps (preserve, evaluate, explain, then replace the conclusion) instead of quietly dropping the old record.
- **Permanent non-regression rule** applies to this file, `discover.md`, `data-sources.md`, and `report-contract.md` alike: a later methodology revision may add steps, categories, or requirements, but must never remove or substantially reduce a previously required one. Invalid reasons to drop a required module include (not limited to): deeper research elsewhere in the same round, a paid data source running out of funding/credits, a shortened report for readability, or one processing round's output overwriting an earlier round's. Full statement in [report-contract.md](report-contract.md).
