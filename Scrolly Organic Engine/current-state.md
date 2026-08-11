# Current State

**Phase:** V0.1 scaffolding complete. Discover V0.4 methodology complete. Discover engine V0.5 (adds Automated/Unattended Mode). No client work done yet. **Automation build in progress** — see `automation/` (started 2026-08-10).

**Exists:**
- `CLAUDE.md` — entry point / index
- `methodology/discover.md` — Discover-phase analysis methodology (what to analyze, how to judge it). Supports 3 modes; existing website is optional, not required. Complete: canonical finding schema, confidence rules, analysis categories, data capabilities, output structure.
- `methodology/discover-engine.md` — operational playbook (how/where the work happens): engagement folder structure, 13-step protocol, checkpoints/resume, query governance/dedup, failure handling, JSON-ready findings format, completion definition, **and (V0.5) an Automated/Unattended Mode section** defining the pre-authorized DataForSEO call ceiling and Final Quality Gate pre-send checkpoint a headless agent runner follows in place of live manual approval. Manual protocol is still the default; Automated Mode is an explicit variant for the `automation/` runner.
- `automation/` (new, in progress) — the $300-report automation pipeline: a headless agent runner (Node + Claude Agent SDK) that executes an engagement end-to-end per Automated Mode, n8n workflows (intake via Tally → Stripe verification → runner → Final Quality Gate review → Resend delivery), and setup specs for Tally/Stripe/Resend. Runs locally on the operator's PC for now (not 24/7-hosted). `REQUIRE_MANUAL_APPROVAL` gates client delivery behind a human review step (current default: on). `DATAFORSEO_ENABLED` lets the pipeline be tested end-to-end on free/Lighthouse data while DataForSEO is unfunded. See `automation/README.md` once written for current build status.
- `methodology/data-sources.md` — maps discover.md's Data Capabilities to specific DataForSEO MCP tools. Tool *names* verified against a live connection (2026-08-10); parameter schemas, output shape, and cost tiers are explicitly marked Unverified pending live schema/doc access — not invented. Two gaps flagged: full-site crawl coverage unconfirmed, reviews/reputation and citation/NAP have no identified tool.
- `methodology/engagement-template/` — blank per-engagement skeleton (`input.md`, `status.md`, `query-log.md`, `data-plan.md`, `findings.md`, `report.md`, `appendix.md`) copied into `clients/<name>/discover/` at engagement start.

**Infrastructure in progress:**
- DataForSEO account created.
- DataForSEO MCP connection: operational. Project-scoped stdio server confirmed loaded and authenticated (2026-08-10) via free `serp_locations` call, status_code 20000/"Ok". No paid requests have been run.
- No credentials are stored in this vault; credentials are held outside the project (local environment config).

**Does not exist yet (by design, not oversight):**
- `clients/` — created when the first client engagement starts
- JSON export/validation of findings, dedup-enforcement script, schema-validation script — deferred until the manual protocol is validated on real engagements
- Execution beyond Discover, QA, measurement, reporting, GEO/AEO, n8n automation, APIs, database, the $999 DIY product — all out of scope until later versions

**Next step:** Confirm DataForSEO MCP is connected in-session, then run the first test engagement: copy `methodology/engagement-template/` into `clients/<name>/discover/` and follow `methodology/discover-engine.md`.
