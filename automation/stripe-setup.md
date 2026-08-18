# Stripe Setup — Build Spec

Create these yourself in your own Stripe account (I can't create the account or enter payment details for you). This spec is exactly what to configure so the rest of the pipeline lines up.

## 1. Product & Price
- Product name: `SEO Discovery Report` (or your preferred client-facing name).
- Price: **$299.00 USD**, one-time (not recurring).

## 2. Payment Link
Create a Payment Link for that price. Under its settings:
- **After payment, redirect customers to a URL** (not the default confirmation page) → set to your Tally form URL with the Checkout Session id appended:
  ```
  https://tally.so/r/<your-form-id>?session_id={CHECKOUT_SESSION_ID}
  ```
  Stripe automatically substitutes `{CHECKOUT_SESSION_ID}` at redirect time. This is what lets Tally's hidden `session_id` field (see `tally-form-spec.md`) carry the payment proof through to n8n.
- Collect the customer's email at checkout (Stripe Payment Links do this by default) — useful as a fallback/cross-check against the email the client types into Tally, but the Tally-entered email is what delivery actually uses.

## 3. Webhook
In Stripe Dashboard → Developers → Webhooks, add an endpoint:
- URL: your n8n `Intake & Kickoff` workflow's Stripe-verification webhook path (n8n workflow exposes this — see `n8n/intake-and-kickoff.json`).
- Events to send: `checkout.session.completed` (this is what confirms payment; n8n also independently re-verifies the `session_id` from the Tally submission against Stripe's API directly, so the webhook is a secondary signal / logging, not the sole trust boundary).
- Copy the **Signing secret** shown after creating the endpoint into `automation/.env` as `STRIPE_WEBHOOK_SECRET` — n8n uses it to verify the webhook is genuinely from Stripe, not spoofed.

## 4. API keys
Copy your **Secret key** (starts `sk_live_...` in live mode, `sk_test_...` in test mode) into `automation/.env` as `STRIPE_SECRET_KEY`. n8n uses this to call Stripe's API and confirm a given `session_id` is actually `payment_status: paid` before kicking off any work — this is the real gate, not just trusting the redirect happened.

## 5. Test before going live
Stripe's test mode uses a parallel set of keys/webhooks and Stripe's documented test card numbers. Run the full pipeline in test mode first (see the plan's Build Order step 6 — full dry run) before switching `.env` to live keys and making the Payment Link public. **Do not take the live Payment Link public until:**
- A full test-mode run has produced a correct report end-to-end, and
- DataForSEO has been funded and one full live engagement has been verified (plan step 7) — selling before that means selling something never confirmed to work.

## What n8n does with this
`n8n/intake-and-kickoff.json`'s first real step, once a Tally submission arrives, is calling Stripe's `GET /v1/checkout/sessions/{session_id}` with `STRIPE_SECRET_KEY` and checking `payment_status === "paid"` and that the amount matches $299. Only then does it create the client folder and start the runner — an unpaid or forged submission never reaches the agent runner.
