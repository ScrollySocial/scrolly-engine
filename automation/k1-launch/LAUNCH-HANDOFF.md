# $1K Club + Challenge launch: founder hand-off (2026-09-28)

Everything below was tested on a local WordPress + WooCommerce 11.0.1 copy of the store (same product/page IDs).
Only the steps marked **YOU** need wp-admin or Stripe; everything else is done by Claude via REST after your OK.

## 1. YOU: replace the member-tabs snippet (WPCode)

1. wp-admin → Code Snippets. Open the existing **$1K member tabs / My Account** snippet (the 2026-09-23 version:
   its first comment line says "member tabs in WooCommerce My Account (launch version, 2026-09-23)").
2. Select all of its code and replace it with the full contents of
   `automation/k1-launch/dist/my-account-1k-tabs.php`. Keep: PHP Snippet · Auto Insert · Run Everywhere. Save + Active.
   **Do not add it as a second snippet.** If the old one stays active, it silently wins and the new one does nothing.
3. Make sure these are **inactive or absent** (the new snippet replaces them):
   - the "Go to $1K Club" button snippet (#288, `club-access-route.php`): it links to the never-deployed Club app
   - any "account required at checkout" or "$1K Club thank-you" snippet (`club-checkout-account-required.php`, `club-thankyou-snippet.php`)
4. Leave the **shirt-size checkout** snippet (v4) active. It is unchanged.

Quick check after saving: log in as yourself and open My Account. Nothing should error. (You won't see the $1K tabs
unless your account owns product 279.)

## 2. Claude via REST (after your OK)

- Publish product 280 ($35 Challenge add-on, hidden from the catalog; the new snippet only lets $1K Club owners buy it).
- WooCommerce → Accounts: turn **off** "When creating an account, send the new user a link to set their password",
  so buyers choose their own password at checkout (no dependence on that email to get back in).
- Attach the Playbook PDF + D-1 to D-4 to both packages (582, 583) as downloads.
- Publish the corrected /1k-club/ sales page copy (Club vs Challenge lists).
- Create a 100%-off, single-use coupon limited to your email, for the free live test.

## 3. YOU: free live test (coupon, no card)

Log out (or use a private window) and buy **Club + Challenge** with a new email you can read, with the coupon.
Then: My Account → My $1K Plan → answer Start Here → Start my 30 days → Challenge Content → Downloads → log a $1,000 sale
→ submit a test proof screenshot. Claude checks the order, the account, download access and the Challenge state on the
backend, and confirms the proof email reached hello@scrollyseo.com. Afterwards you mark the test proof "Cannot verify"
(Users → that user → $1K Challenge) and Claude cleans up.

## 4. YOU: Stripe to live, then one small real-money test

WooCommerce → Settings → Payments → Stripe: turn off test mode (live keys are already saved). Buy the $40 Club with a
real card, confirm the order lands as Processing/Completed with the downloads, then refund it in WooCommerce
(the refund goes back through Stripe).

## 5. Claude: turn off "coming soon" (store pages), re-check the live pages, GO/NO-GO report.
