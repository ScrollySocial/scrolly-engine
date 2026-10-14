/**
 * Pushes an order's customer-safe status (via discover-customer-status.mjs)
 * to the live WordPress order-status route, idempotently.
 *
 * Design notes (per Mercedes, 2026-08-28):
 * - Event-driven: called from the handful of real order-state.mjs mutation
 *   call sites in runner/run-discover.mjs (run started, step changed,
 *   failed, ready for review) -- not a polling loop.
 * - Idempotent: the last-synced projection is snapshotted onto order.json's
 *   own `wpSync` field. A call whose computed projection matches that
 *   snapshot exactly is skipped -- no network call, no duplicate write.
 * - Fail-safe order matching: WooCommerce order id is the only linkage.
 *   Missing/invalid order.orderId skips (logs internally) rather than
 *   guessing at a target order.
 * - Never throws: a WordPress/network failure must never abort or block
 *   the underlying Discover run. Every failure path logs via
 *   order-state.mjs's existing event log and returns a result object.
 * - order-state.mjs itself stays untouched and network-free -- this module
 *   is a one-directional consumer of it, not the other way around.
 */
import { loadOrder, saveOrder, logOrderEvent } from './order-state.mjs';
import { toCustomerStatus } from './discover-customer-status.mjs';

const SYNC_VERSION = 1;
const ROUTE_PATH = '/wp-json/scrolly-tracker/v1/order-status';

function projectionOf(customer) {
  return {
    customerStatus: customer.customerStatus,
    customerMessage: customer.customerMessage,
    actionLabel: customer.actionLabel,
    actionUrl: customer.actionUrl,
    reportAvailable: customer.reportAvailable,
    syncVersion: SYNC_VERSION,
  };
}

function projectionsEqual(a, b) {
  if (!a || !b) return false;
  return (
    a.customerStatus === b.customerStatus &&
    a.customerMessage === b.customerMessage &&
    a.actionLabel === b.actionLabel &&
    a.actionUrl === b.actionUrl &&
    a.reportAvailable === b.reportAvailable &&
    a.syncVersion === b.syncVersion
  );
}

/**
 * @param {string} slug
 * @param {{ context?: object }} [opts] - context passed through to toCustomerStatus (e.g. tallyIntakeUrl)
 * @returns {Promise<object>} always resolves, never throws
 */
export async function syncOrderToWordPress(slug, opts = {}) {
  const order = await loadOrder(slug);
  if (!order) {
    return { skipped: true, reason: 'no_order_json' };
  }

  // Fail-safe order matching: WC order id is the only linkage this module
  // will ever use. A missing/malformed id is logged and skipped -- never
  // guessed at by email, business name, or slug.
  const orderIdNum = Number(order.orderId);
  if (!order.orderId || !Number.isInteger(orderIdNum) || orderIdNum <= 0) {
    await logOrderEvent(slug, { type: 'wp_sync_skipped', reason: 'missing_or_invalid_order_id' });
    return { skipped: true, reason: 'missing_or_invalid_order_id' };
  }

  const customer = toCustomerStatus(order, opts.context || {});
  const desired = projectionOf(customer);

  if (projectionsEqual(order.wpSync, desired)) {
    return { skipped: true, reason: 'unchanged', customerStatus: customer.customerStatus };
  }

  const baseUrl = process.env.WP_TRACKER_BASE_URL;
  const user = process.env.WP_TRACKER_USER;
  const pass = process.env.WP_TRACKER_APP_PASSWORD;
  if (!baseUrl || !user || !pass) {
    await logOrderEvent(slug, { type: 'wp_sync_failed', reason: 'missing_credentials' });
    return { ok: false, reason: 'missing_credentials' };
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}${ROUTE_PATH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64'),
      },
      body: JSON.stringify({
        order_id: orderIdNum,
        customer_status: customer.customerStatus,
        customer_message: customer.customerMessage,
        action_label: customer.actionLabel,
        action_url: customer.actionUrl,
        report_available: customer.reportAvailable,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      await logOrderEvent(slug, { type: 'wp_sync_failed', reason: 'http_error', status: res.status, body: body.slice(0, 300) });
      return { ok: false, status: res.status };
    }

    // Reload rather than mutate the in-memory `order` in case something
    // else wrote to order.json while the request was in flight.
    const fresh = await loadOrder(slug);
    if (fresh) {
      fresh.wpSync = { ...desired, syncedAt: new Date().toISOString() };
      await saveOrder(fresh);
    }
    await logOrderEvent(slug, { type: 'wp_synced', customerStatus: customer.customerStatus });
    return { ok: true, customerStatus: customer.customerStatus };
  } catch (err) {
    await logOrderEvent(slug, { type: 'wp_sync_failed', reason: 'network_error', message: err.message });
    return { ok: false, error: err.message };
  }
}
