# $1K Club + Challenge launch: founder hand-off (updated 2026-10-03)

Status on 2026-10-03 (checked over REST): product 279 (582 Club only $40 / 583 Club + Challenge $75) is published with the
Playbook + D-1 to D-4 downloads on both packages; product 280 ($35 Challenge re-buy, members only) is published and hidden;
buyers choose their own password at checkout; the free-test coupon `k1test-49f389` exists (100% off, single use, unused).
My Account page 8 and the Challenge Content pages (633 / 845 / 846) are on the v3 look. The member-tab styling lives in the
global stylesheet (`website/scrolly-site/chrome/k1-account.css`), so after the paste below, restyles never need another paste.

Only the steps marked **YOU** need wp-admin or Stripe.

## 1. YOU: replace the member-tabs snippet (WPCode), once

1. wp-admin → Code Snippets. Open the existing **My $1k Plan Snippet** (its first comment line says "member tabs in WooCommerce
   My Account").
2. Select all of its code and replace it with the full contents of `automation/k1-launch/dist/my-account-1k-tabs.php`.
   Keep: PHP Snippet · Auto Insert · Run Everywhere. Save + Active. **Do not add it as a second snippet.**
3. Leave the **shirt-size checkout** snippet and the **$1K checkout layout** snippet as they are.

What this brings live: the v3 look in My $1K Plan / Weekly Check-in / My Numbers / Challenge Content and the order
thank-you panel, the 2026-09-29 one-card calculator, and keyboard arrow keys on the scenario buttons and content tabs.

Quick check: open My Account while logged in. Nothing should error. Then tell Claude, who checks the pages and records the
pasted version in `automation/wordpress/deployed/`.

## 2. YOU: free live test (coupon, no card)

Log out (or use a private window) and buy **Club + Challenge** with a new email you can read, using coupon `k1test-49f389`.
(The store is in coming-soon mode, so open it through the WooCommerce private link.) Then: My Account → My $1K Plan → answer
Start Here → Start my 30 days → Challenge Content → Downloads → log a $1,000 sale → submit a test proof screenshot.
Claude then checks the order, the account, download access and the Challenge state on the backend, and confirms the proof
email reached hello@scrollyseo.com. Afterwards you mark the test proof "Cannot verify" (Users → that user → $1K Challenge)
and Claude cleans up.

## 3. Content: Week 2 Reels before selling

Challenge Content shows "Week 1: September 28 to October 4, 2026" (page 633). The Challenge promises 25 new Reel
opportunities each week, so a new week's set has to be published before (and every week after) customers can buy.
See the weekly reels engine notes; `content/render.mjs` renders the page, then publish page 633.

## 4. YOU: Stripe to live, then one small real-money test

WooCommerce → Settings → Payments → Stripe: turn off test mode (live keys are already saved). Buy the $40 Club with a real
card, confirm the order lands as Processing/Completed with the downloads, then refund it in WooCommerce.

## 5. YOU say "go": Claude turns off "coming soon" (store pages), re-checks the live pages, GO/NO-GO report.
