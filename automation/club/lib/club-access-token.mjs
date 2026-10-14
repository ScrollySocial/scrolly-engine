/**
 * Signed, short-lived access tokens -- the WooCommerce-account-gated
 * replacement for the temporary order_id+order_key gate.
 *
 * Design: stateless (no session store, no cookies). WordPress (a WPCode
 * snippet, not yet live -- see automation/wordpress/deployed/club-access-route.php)
 * verifies the customer is logged in AND owns the $1K Club via WooCommerce's
 * own `wc_customer_bought_product()` (real ownership infrastructure, not a
 * parallel auth system), then mints a token with this exact HMAC scheme and
 * hands it to the browser via a link from My Account. The browser holds the
 * token in sessionStorage (tab-scoped, not localStorage) and sends it as
 * `Authorization: Bearer <token>` on every /club/* call. A fresh token is
 * minted every time the customer clicks back in from My Account -- they
 * never type an order id/key, and the stable identity (WC customer id)
 * never changes across visits, purchases, or future $10K/$24K entitlements.
 *
 * Short TTL (default 60 min) makes a leaked token low-value without needing
 * a revocation list. No ownership re-check happens on the bridge-server side
 * per request -- the signature IS the proof, exactly like a JWT -- so this
 * secret must never leak (never log or print a real token's contents).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

// 2026-09-16: was 60 min -- confirmed real-world bug (member mid-way through
// a multi-module reading session hitting "your access link is missing or
// expired" without having done anything wrong). A signed HMAC token this
// short-lived was tuned around "low value if leaked", not around how long a
// self-paced course session actually takes. 4h keeps the same fail-closed,
// no-revocation-list design (still a single browsing session, still cheap
// to re-mint by clicking back in from My Account) while matching real usage.
const DEFAULT_TTL_SECONDS = 60 * 60 * 4;

function secret() {
  const s = process.env.CLUB_ACCESS_TOKEN_SECRET;
  if (!s) throw new Error('CLUB_ACCESS_TOKEN_SECRET is not configured');
  return s;
}

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

/**
 * @param {object} params
 * @param {number} params.customerId - stable WooCommerce/WordPress user id (never a guest 0)
 * @param {string} params.email
 * @param {number} [params.ttlSeconds]
 * @returns {string} opaque token, safe to put in a URL query string once
 */
export function signAccessToken({ customerId, email, ttlSeconds = DEFAULT_TTL_SECONDS }) {
  if (!customerId) throw new Error('signAccessToken requires a non-zero customerId (guests are not eligible)');
  const payload = { customerId, email, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const payloadPart = base64url(JSON.stringify(payload));
  const signature = createHmac('sha256', secret()).update(payloadPart).digest('base64url');
  return `${payloadPart}.${signature}`;
}

/** @returns {{valid:true, customerId:number, email:string} | {valid:false, reason:string}} */
export function verifyAccessToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return { valid: false, reason: 'malformed_token' };
  const [payloadPart, signature] = token.split('.');
  const expected = createHmac('sha256', secret()).update(payloadPart).digest('base64url');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { valid: false, reason: 'bad_signature' };

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  } catch {
    return { valid: false, reason: 'malformed_payload' };
  }
  if (!payload.customerId || !payload.exp) return { valid: false, reason: 'malformed_payload' };
  if (Math.floor(Date.now() / 1000) > payload.exp) return { valid: false, reason: 'expired' };

  return { valid: true, customerId: payload.customerId, email: payload.email ?? null };
}

/** Parses "Authorization: Bearer <token>" out of a Node http headers object. Never throws. */
export function extractBearerToken(headers) {
  const raw = headers?.authorization || headers?.Authorization;
  if (!raw || !raw.startsWith('Bearer ')) return null;
  return raw.slice('Bearer '.length).trim() || null;
}
