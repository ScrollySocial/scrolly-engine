# Current State

**Phase:** V0.1 scaffolding complete. Discover methodology upgraded to **V0.2 ("Opportunity Engine")** — O1–O10 layered on top of the original A–J Supporting Audit. Discover engine at V0.5 (Automated/Unattended Mode). **Automation pipeline built and had its first real funded run** (see `automation/` and `automation/README.md`, started 2026-08-10). **One real client engagement in progress** (Mulberry Creek).

**Exists:**
- `CLAUDE.md` — entry point / index
- `methodology/discover.md` — Discover-phase analysis methodology, now V0.2 Opportunity Engine (O1–O10) + A–J Supporting Audit, with three evidence classes (Confirmed Business Offerings / Discovered-Candidate Opportunities / Client-Enhanced Data) and a `relevance_classification` field.
- `methodology/discover-engine.md` — operational playbook: engagement folder structure, protocol, checkpoints/resume, query governance/dedup, failure handling, completion definition, and (V0.5) Automated/Unattended Mode (pre-authorized DataForSEO call ceiling, Final Quality Gate) for the headless runner.
- `automation/` — the $299-report automation pipeline: headless agent runner (Node + Claude Agent SDK), n8n workflows (Tally intake → Stripe verify → runner → operator review → Resend delivery) running via **Docker** (not npm — npm install of n8n was abandoned after repeated failures on this machine), plus `bridge-server.mjs` (runs natively on Windows, lets the Dockerized n8n container trigger local scripts via `host.docker.internal:5679`). **First real funded agent run completed 2026-08-11** ($2.02, correctly recommended HOLD on a degenerate test domain instead of fabricating findings — validates the core integrity design). See `automation/README.md` for full build/verification status and setup steps.
- `methodology/data-sources.md` — maps discover.md's Data Capabilities to DataForSEO MCP tools.
- `methodology/engagement-template/` — blank per-engagement skeleton copied into `clients/<name>/discover/` at engagement start.
- `clients/mulberry-creek/` — **real client engagement**, Discover phase run across 3 rounds under the V0.2 methodology upgrade (which happened mid-engagement). Substantially complete; currently blocked on DataForSEO account funding (hit HTTP 402) before the final validation batch can run and report.md/appendix.md can be refreshed for delivery. Full history in `clients/mulberry-creek/discover/status.md`.
- `clients/_first-real-test/` — kept intentionally as evidence of the first successful funded automation run, not a real client.

**Infrastructure:**
- DataForSEO account created and connected, but **currently unfunded** (calls returning HTTP 402) — this is the main active blocker across both the Mulberry Creek engagement and further automation testing.
- No credentials are stored in this vault; held in `automation/.env` (gitignored).
- Docker Desktop + n8n container + `bridge-server.mjs` all built and verified working end to end on this machine.

**Not yet done:**
- Restore DataForSEO funding.
- Tally form, Stripe Payment Link/webhook, Resend account — user's own account setup, specs written but accounts not created.
- Full end-to-end pipeline dry run with real Tally/Stripe/Resend wiring.
- Mulberry Creek: finish final validation batch once funded, refresh report.md/appendix.md, deliver.
- Execution beyond Discover, QA, measurement, reporting, GEO/AEO, APIs, database, the $999 DIY product — out of scope until later versions.

**Next step:** Fund the DataForSEO account, then (a) run Mulberry Creek's final validation batch and refresh its report for delivery, and (b) run a second automation smoke test against a real small-business site now that mechanics/cost are proven (see `automation/README.md` Status section for the exact next-test recommendation).
