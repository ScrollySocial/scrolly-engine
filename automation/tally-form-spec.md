# Tally Intake Form — Build Spec

Build this in your own Tally account (I can't create the account for you). Fields map 1:1 to `methodology/engagement-template/input.md`, with a few operational fields added that aren't part of the Discover methodology itself (name, email, the Stripe link-back).

**Form settings:**
- Redirect target after a Stripe payment success (see `stripe-setup.md`) — this form is reached only after payment, so no separate payment step lives inside Tally.
- Under Tally's "Integrations" → enable a Webhook pointing at your n8n `Intake & Kickoff` workflow's webhook URL, firing on submit.
- Add a **hidden field** named `session_id`. Tally supports populating hidden fields from the URL query string automatically (`?session_id=...`) — no visible form field, just carries the Stripe Checkout session id through to the webhook payload so n8n can verify payment before doing anything else.

---

## Section 0 — Operational (added, not in input.md)
| Field | Type | Required | Notes |
|---|---|---|---|
| Business name | Short text | **Required** | Used for the client-folder slug and every report heading. |
| Contact name | Short text | **Required** | Who the report/emails address. |
| Contact email | Email | **Required** | Where the finished report is delivered. |
| `session_id` | Hidden field | required | Populated from URL param, not shown to the client. |

## Section 1 — Absolute Minimum (input.md's only hard requirement)
| Field | Type | Required | input.md target |
|---|---|---|---|
| Website / domain | Short text | Optional (leave blank if none) | Existing Website → URL |
| Physical location(s), if local/regional | Long text | Optional but strongly encouraged if local | Geography → Service area |

## Section 2 — Optional, Helpful
All Short/Long text unless noted, all optional, no required validation:
- Short business description
- Known service area / radius
- Products/services you most want to grow
- Markets definitely served
- Markets definitely excluded
- Target customers
- Business model
- Main desired outcome — **Multiple choice, single-select**: Calls / Leads / Bookings / Store visits / Ecommerce sales / Revenue / Awareness / Other
- Current marketing channels
- Current marketing budget
- Known business constraints
- Seasonality
- Brand/business-structure considerations (do related service lines share one site or operate separately?)
- Google Business Profile access/status — **Multiple choice**: I have access / Client has it, can share / Not sure / No GBP yet
- Google Search Console access/status — same options
- GA4 access/status — same options
- Existing call/form/conversion tracking (what, if anything)

## Section 3 — Enhanced Optional (never required — improves O8's value modeling only)
- Detailed inventory / product categories
- Best sellers
- Highest-value / highest-margin products or services
- Average transaction/project value
- Margins
- Conversion/close rate
- Capacity constraints

## Section 4 — Niche & Context
- Category/niche (Short text)
- Named competitors, if any (signal only, not verified)
- Known site history (redesigns, migrations, past issues)
- Hard constraints (e.g., domain is fixed, excluded services/categories)

---

## Copy note for the form intro
Make clear up front that **only the website/domain and location are ever required** — every other field is optional and the report still runs without them, per `discover.md`'s O1 absolute-minimum rule. This matters for conversion: don't let the form feel mandatory-heavy.

## What n8n does with the submission
The `Intake & Kickoff` workflow (see `n8n/intake-and-kickoff.json`) reads this payload, verifies `session_id` against Stripe, slugifies "Business name" into `clients/<slug>/`, and writes every answered field into that client's `input.md` in the same section layout as `engagement-template/input.md` — blank fields stay blank, never guessed.
