/**
 * QA-only: creates one real (but harmless, no real payment) WooCommerce
 * order for the $1K Club product via the admin REST API, so the real
 * verifyClubOrder() code path can be exercised end to end while the product
 * is still draft/unpurchasable on the live site. Uses the same
 * WP_LIVE_APP_USER/PASSWORD credential already used to create the draft
 * products (has manage_woocommerce via the administrator role) -- the
 * read-only WC_AUDIT_CONSUMER_KEY/SECRET cannot create orders.
 *
 * Prints the order_id/order_key to use in the /club onboarding page.
 * Delete this order from wp-admin (Orders) whenever it's no longer needed.
 *
 * Usage: node automation/club/scripts/create-test-club-order.mjs
 */
import 'dotenv/config';

const BASE = process.env.WP_LIVE_BASE_URL;
const USER = process.env.WP_LIVE_APP_USER;
const PASS = process.env.WP_LIVE_APP_PASSWORD;
const CLUB_PRODUCT_ID = Number(process.env.WC_CLUB_PRODUCT_ID);

if (!BASE || !USER || !PASS || !CLUB_PRODUCT_ID) {
  console.error('Missing WP_LIVE_BASE_URL / WP_LIVE_APP_USER / WP_LIVE_APP_PASSWORD / WC_CLUB_PRODUCT_ID in automation/.env');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');

const res = await fetch(`${BASE.replace(/\/$/, '')}/wp-json/wc/v3/orders`, {
  method: 'POST',
  headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'processing',
    set_paid: true,
    billing: { first_name: 'Club', last_name: 'QA Test', email: 'club-qa-test@scrollyseo.com' },
    line_items: [{ product_id: CLUB_PRODUCT_ID, quantity: 1 }],
  }),
});
const order = await res.json();
if (!res.ok) {
  console.error('Failed to create test order:', JSON.stringify(order));
  process.exit(1);
}

console.log(`Test order created: WooCommerce order #${order.id}, status ${order.status}`);
console.log(`order_id=${order.id}`);
console.log(`order_key=${order.order_key}`);
console.log('\nDelete this from wp-admin (Orders) when QA is done -- it is a real order row, not a fixture file.');
