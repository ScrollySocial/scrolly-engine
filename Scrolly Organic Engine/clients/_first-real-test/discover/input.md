# Discover Input — _first-real-test (SMOKE TEST — not a real client)

## Absolute Minimum Required Intake (O1/O2 — the only hard requirement for the $299 product)
- Website/domain: example.com
- Physical location(s), if the business is local/regional: (none — non-geo-bound for this test)

## Optional intake (per O1 / report-contract.md §A — captured when known, never blocks)
All of the following were **not provided** at intake and are left blank rather than guessed:
- Primary products/services: not provided
- Products/services explicitly NOT offered: not provided
- Highest-priority products/services: not provided
- Geographic/service areas: n/a — declared non-geo-bound at intake (client-provided fact)
- Target customers: not provided
- Business model: not provided
- Main desired outcome (calls/leads/bookings/sales/awareness): not provided
- Approximate customer/project/order value: not provided
- Current marketing channels / budget: not provided
- Known business constraints: not provided
- Seasonality: not provided
- Brand/business-structure considerations: not provided
- Google Business Profile access/status: not provided (and n/a — non-geo-bound)
- Google Search Console access/status: not provided / not authorized
- GA4 access/status: not provided / not authorized
- Existing call/form/conversion tracking: not provided
- Known competitors supplied by client: not provided
- Client-provided economics (inventory, best sellers, ticket value, margin, close rate, capacity): not provided → O8 `client_specific_economics` = "Not provided" throughout

## Mode determination (Step 2, discover-engine.md)
- **Mode 1 — existing business + existing website.** Deterministic: a website/domain (example.com) was supplied → Mode 1. Full category set A–N applies; existing-site audit, internal linking, site history, and KEEP/IMPROVE/CREATE/CONSOLIDATE/REMOVE classification are in scope.
- **O2 (Geographic Opportunity Map) is SKIPPED** — intake declares the business non-geo-bound. Stated explicitly per discover.md O2/Opportunity Engine rule ("state that explicitly rather than omitting the section silently"), not silently omitted. Category I (Local Search) and report-contract.md §11 are retained and marked Not Applicable / Not Evaluated with the reason.
- Automated Mode ceiling applicable to this engagement: Mode 1, non-geo-bound → **40 paid DataForSEO calls**. Actual paid calls used: **0** (`DATAFORSEO_ENABLED=false`).

## Material limitation on this engagement (recorded at Step 1, affects every layer)
`example.com` is the IANA/ICANN **reserved example domain**, not an operating business. It has no products, services, customers, or commercial intent to map. Therefore O1's confirmed-offering tier is **empty by observation, not by missing intake** — there is no business to describe. This is a smoke-test target, and every opportunity-sizing layer (O3–O10) is unsupportable on business grounds *in addition to* the DataForSEO outage. Both limitations are recorded separately throughout `findings.md` so they are not conflated.

## Notes
First real (non-auth-blocked) run of the automated agent, now that a funded
ANTHROPIC_API_KEY exists. DataForSEO is disabled (unfunded) and the Anthropic
budget is capped at $2 for this run — the goal is to observe real behavior
and real cost on a small scope, not produce a complete report. DataForSEO-
dependent sections are expected to show "Not Evaluated / Data Required".
