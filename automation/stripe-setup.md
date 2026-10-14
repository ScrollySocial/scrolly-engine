# Stripe / WooCommerce Setup — Build Spec

**Rewritten 2026-08-24.** The original version of this doc assumed a standalone
Stripe Payment Link (Stripe-hosted checkout, redirecting to Tally with a
`{CHECKOUT_SESSION_ID}`). That's no longer the architecture — Stripe is now
connected *through WooCommerce's own checkout* on scrollyseo.com, so there is
no Stripe Checkout Session for the pipeline to verify against. Verification
now happens against the **WooCommerce Order REST API** instead. See
`automation/n8n/intake-and-kickoff.json` for the current logic and
`automation/woocommerce-thankyou-snippet.php` for the piece that hands off to
Tally after payment.

## 1. Confirm Stripe is actually connected in WooCommerce
In wp-admin → WooCommerce → Settings → Payments, the Stripe gateway should
show as **enabled** with live keys entered (test keys first — see §5). As of
this doc's last check, the live checkout's "Payment methods" section was
still empty/loading — this step isn't finished yet. Nothing else in this spec
works until it is.

## 2. WooCommerce REST API key (read-only, for order verification)
In wp-admin → WooCommerce → Settings → Advanced → REST API → **Add key**:
- Description: `Scrolly automation — order verification`
- Permissions: **Read** (never needs to write)
- Generate, then copy the **Consumer key** and **Consumer secret** into
  `automation/.env` as `WC_AUDIT_CONSUMER_KEY` / `WC_AUDIT_CONSUMER_SECRET`.
  These are separate from any WooCommerce keys used by the (unrelated)
  Implementation Agent workstream — don't reuse one pair for both.

## 3. Confirm the product ID
`WC_AUDIT_PRODUCT_ID` in `.env` should match the live "SEO Site Audit"
product's ID (24 as of 2026-08-20, per `current-state.md` — re-check in
wp-admin → Products before relying on it, in case it changed).

## 4. The thank-you-page hand-off
WooCommerce's checkout no longer redirects anywhere external after payment —
the customer lands on WooCommerce's own order-received/thank-you page. Install
`automation/woocommerce-thankyou-snippet.php` (via WPCode or your child
theme's `functions.php`) so that page shows a "Start Your Intake Form" button
linking to Tally with `order_id` + `order_key` appended — see that file's
header comment for exact steps, and `tally-form-spec.md` for the matching
Tally-side hidden fields.

## 5. What n8n does with this
`n8n/intake-and-kickoff.json`, once a Tally submission arrives: reads the
`order_id`/`order_key` hidden fields, calls WooCommerce's
`GET /wp-json/wc/v3/orders/{order_id}` (authenticated with
`WC_AUDIT_CONSUMER_KEY`/`SECRET`), and only proceeds if **all** of: the
returned `order_key` matches, `status` is `processing` or `completed`,
`total` is exactly `299`, and the order's line items include
`WC_AUDIT_PRODUCT_ID`. An unpaid, forged, or mismatched submission never
reaches the agent runner — same trust-boundary shape as the old Stripe
session check, just against a different API.

## 6. Test before going live
Stripe's test mode uses parallel test keys and Stripe's documented test card
numbers — WooCommerce's Stripe gateway supports test mode natively (a
checkbox in its settings). Run one full test-mode purchase through the whole
pipeline (checkout → thank-you button → Tally → n8n → runner → your review →
delivery) before switching to live Stripe keys. **Do not take live payment
public until:**
- A full test-mode run has produced a correct report end-to-end, and
- DataForSEO has been funded and one full live engagement has been verified —
  selling before that means selling something never confirmed to work.

## Leftover test cart data
While checking the live checkout page, it showed 3 stale "SEO Site Audit"
items ($897 total) sitting in a guest session cart — harmless (never became
an order), but worth clearing/testing with a fresh private/incognito window
so a real customer's cart isn't polluted by leftover test-browsing state.
