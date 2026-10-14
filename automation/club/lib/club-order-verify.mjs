/**
 * Verifies a WooCommerce order is a real, paid purchase of a specific Club
 * product before onboarding accepts it as "eligible customer" -- same
 * order_id+order_key verification pattern already proven for the $299
 * product (see automation/stripe-setup.md), and the same read-only
 * WC_AUDIT_CONSUMER_KEY/SECRET credential already used for order lookups
 * (automation/lib/wc-order-lookup.mjs) -- no new credential needed.
 *
 * This is the real verification path (works once WC_CLUB_PRODUCT_ID is live
 * and purchasable). It is deliberately the ONLY eligibility gate -- there is
 * no separate login system for V1, matching the project's standing rule that
 * customer-facing authorization derives from WooCommerce order ownership,
 * not a parallel auth mechanism.
 */

function wcBase() {
  const base = process.env.WC_STORE_BASE_URL;
  if (!base) throw new Error('WC_STORE_BASE_URL is not configured');
  return `https://${base.replace(/^https?:\/\//, '')}`;
}

function authHeader() {
  const key = process.env.WC_AUDIT_CONSUMER_KEY;
  const secret = process.env.WC_AUDIT_CONSUMER_SECRET;
  if (!key || !secret) throw new Error('WC_AUDIT_CONSUMER_KEY/SECRET are not configured');
  return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
}

/**
 * @param {object} params
 * @param {string|number} params.orderId
 * @param {string} params.orderKey
 * @param {number} params.requireProductId - must appear as a line item
 * @returns {Promise<{valid:boolean, reason?:string, orderId?:number, email?:string, wcCustomerId?:number}>}
 */
export async function verifyClubOrder({ orderId, orderKey, requireProductId }) {
  if (!orderId || !orderKey) return { valid: false, reason: 'missing_order_id_or_key' };
  let order;
  try {
    const url = `${wcBase()}/wp-json/wc/v3/orders/${encodeURIComponent(orderId)}`;
    const res = await fetch(url, { headers: { Authorization: authHeader() } });
    if (res.status === 404) return { valid: false, reason: 'order_not_found' };
    if (!res.ok) return { valid: false, reason: `woocommerce_error_${res.status}` };
    order = await res.json();
  } catch (err) {
    return { valid: false, reason: `network_error: ${err.message}` };
  }

  if (order.order_key !== orderKey) return { valid: false, reason: 'order_key_mismatch' };
  if (!['processing', 'completed'].includes(order.status)) return { valid: false, reason: `order_status_${order.status}` };
  const hasProduct = (order.line_items || []).some((li) => li.product_id === requireProductId);
  if (!hasProduct) return { valid: false, reason: 'product_not_in_order' };

  return {
    valid: true,
    orderId: order.id,
    orderKey: order.order_key,
    email: order.billing?.email || null,
    wcCustomerId: order.customer_id || null,
  };
}

/**
 * Finds a real, paid WooCommerce order for `requireProductId` belonging to
 * `customerId` that has not already been consumed by a previous Challenge
 * attempt -- the read-only equivalent of WordPress's
 * wc_customer_bought_product(), but attempt-aware: owning the product once
 * is not the same as having an unused attempt, since each $25 purchase is
 * meant to fund exactly one 30-day attempt (see startChallengeAttempt()).
 * Same WC_AUDIT_CONSUMER_KEY/SECRET credential as verifyClubOrder/
 * fetchCustomerFirstName -- no new credential, no new WordPress deploy.
 * @param {number} customerId
 * @param {number} requireProductId
 * @param {string[]} consumedOrderIds - wcOrderId values already recorded on member.challenges
 * @returns {Promise<{ok:true, orderId:number, orderKey:string}|{ok:false, reason:string}>}
 */
export async function findAvailableChallengeOrder(customerId, requireProductId, consumedOrderIds = []) {
  if (!customerId) return { ok: false, reason: 'missing_customer_id' };
  const consumed = new Set(consumedOrderIds.map(String));
  let orders;
  try {
    const url = `${wcBase()}/wp-json/wc/v3/orders?customer=${encodeURIComponent(customerId)}&status=processing,completed&per_page=50`;
    const res = await fetch(url, { headers: { Authorization: authHeader() } });
    if (!res.ok) return { ok: false, reason: `woocommerce_error_${res.status}` };
    orders = await res.json();
  } catch (err) {
    return { ok: false, reason: `network_error: ${err.message}` };
  }
  const candidates = (orders || [])
    .filter((o) => !consumed.has(String(o.id)))
    .filter((o) => (o.line_items || []).some((li) => li.product_id === requireProductId))
    .sort((a, b) => new Date(a.date_created) - new Date(b.date_created)); // oldest unused purchase first
  const match = candidates[0];
  if (!match) return { ok: false, reason: 'no_available_purchase' };
  return { ok: true, orderId: match.id, orderKey: match.order_key };
}

/**
 * Best-effort real first-name lookup via the same read-only WC customer
 * record already reachable with this credential -- WooCommerce always
 * collects billing.first_name at checkout, so it's real, not invented.
 * Never throws: a missing credential, network failure, or missing/blank
 * name all return null, so the dashboard greeting falls back to its
 * honest no-name state rather than breaking or fabricating one.
 * @param {number} customerId - stable WooCommerce/WordPress user id
 * @returns {Promise<string|null>}
 */
export async function fetchCustomerFirstName(customerId) {
  if (!customerId) return null;
  try {
    const url = `${wcBase()}/wp-json/wc/v3/customers/${encodeURIComponent(customerId)}`;
    const res = await fetch(url, { headers: { Authorization: authHeader() } });
    if (!res.ok) return null;
    const customer = await res.json();
    const firstName = customer?.first_name || customer?.billing?.first_name || null;
    return firstName && String(firstName).trim() ? String(firstName).trim() : null;
  } catch {
    return null;
  }
}
