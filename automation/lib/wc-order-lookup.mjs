/**
 * Best-effort, read-only WooCommerce order lookups for the operator
 * dashboard -- purchase date and WooCommerce's own order/payment status,
 * which order.json intentionally does NOT store (WooCommerce remains
 * authoritative for commerce facts; order.json is fulfillment-only).
 *
 * Reuses WC_AUDIT_CONSUMER_KEY/SECRET (already a read-only key, already used
 * elsewhere in this repo for order verification) -- no new credential.
 * Never throws: a WooCommerce/network failure degrades every affected row
 * to "Unknown" rather than breaking the dashboard, since the dashboard must
 * still work from order.json alone if WooCommerce is unreachable.
 */

/**
 * Fetches exactly the WooCommerce orders named by `orderIds` in one request
 * (WC's own `include` filter), keyed by id. Skips entirely (returns an
 * empty map) if WC_AUDIT credentials aren't configured or no ids given --
 * callers must treat a missing map entry as "unknown," not "order doesn't
 * exist."
 * @param {Array<string|number>} orderIds
 * @returns {Promise<Map<number, {datePaid: string|null, dateCreated: string|null, wcStatus: string, total: string}>>}
 */
export async function fetchWcOrdersByIds(orderIds) {
  const ids = [...new Set(orderIds.map(Number).filter((n) => Number.isInteger(n) && n > 0))];
  const map = new Map();
  if (ids.length === 0) return map;

  const base = process.env.WC_STORE_BASE_URL;
  const key = process.env.WC_AUDIT_CONSUMER_KEY;
  const secret = process.env.WC_AUDIT_CONSUMER_SECRET;
  if (!base || !key || !secret) return map; // not configured -- degrade gracefully

  try {
    const url = new URL(`https://${base.replace(/^https?:\/\//, '')}/wp-json/wc/v3/orders`);
    url.searchParams.set('include', ids.join(','));
    url.searchParams.set('per_page', String(Math.min(ids.length, 100)));
    const auth = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
    const res = await fetch(url, { headers: { Authorization: auth } });
    if (!res.ok) return map;
    const orders = await res.json();
    if (!Array.isArray(orders)) return map;
    for (const o of orders) {
      map.set(o.id, {
        datePaid: o.date_paid || null,
        dateCreated: o.date_created || null,
        wcStatus: o.status || null,
        total: o.total || null,
      });
    }
  } catch {
    // network error, DNS failure, timeout -- dashboard still works, just without commerce enrichment
  }
  return map;
}
