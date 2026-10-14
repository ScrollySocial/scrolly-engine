/**
 * Public storefront import -- the smallest real, working piece of
 * "connections before questionnaires" this session can actually ship
 * without OAuth infrastructure that doesn't exist here.
 *
 * Shopify stores expose a PUBLIC, unauthenticated `/products.json` endpoint
 * on their own storefront domain (documented Shopify Storefront behavior,
 * not a private API) -- no app registration, no client secret, no OAuth
 * consent screen. That makes it the smallest real integration to build
 * first: point a URL at it, get back real product titles and prices,
 * nothing invented.
 *
 * This can only ever supply PUBLIC catalog information (what they sell,
 * roughly what it costs). It cannot and does not supply revenue, orders,
 * traffic, or any other private analytics -- that would require the
 * Shopify Admin API with a real OAuth access token, which needs a
 * registered Shopify Partner app (App URL + redirect URL + API
 * key/secret) that does not exist in this environment. See
 * `describeAuthorizedIntegrationRequirements()` below for the exact setup
 * that would take.
 */

function normalizeStoreUrl(input) {
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  } catch {
    return null;
  }
  url.pathname = '';
  url.search = '';
  url.hash = '';
  return url;
}

/**
 * @param {string} rawUrl
 * @returns {Promise<{ok:true, platform:'shopify', storeUrl:string, productCount:number, sampleTitles:string[], priceRangeUsd:{min:number,max:number}} | {ok:false, reason:string}>}
 */
export async function fetchPublicStoreInfo(rawUrl) {
  const base = normalizeStoreUrl(rawUrl);
  if (!base) return { ok: false, reason: 'invalid_url' };

  const productsUrl = new URL('/products.json', base);
  productsUrl.searchParams.set('limit', '20');

  let res;
  try {
    res = await fetch(productsUrl, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  } catch (err) {
    return { ok: false, reason: 'unreachable' };
  }
  if (!res.ok) return { ok: false, reason: 'not_a_public_shopify_store' };

  let body;
  try {
    body = await res.json();
  } catch {
    return { ok: false, reason: 'not_a_public_shopify_store' };
  }
  const products = Array.isArray(body?.products) ? body.products : null;
  if (!products || products.length === 0) return { ok: false, reason: 'no_products_found' };

  const prices = [];
  for (const p of products) {
    for (const v of p.variants || []) {
      const price = Number(v.price);
      if (Number.isFinite(price)) prices.push(price);
    }
  }
  if (prices.length === 0) return { ok: false, reason: 'no_prices_found' };

  return {
    ok: true,
    platform: 'shopify',
    storeUrl: base.toString(),
    productCount: products.length,
    sampleTitles: products.slice(0, 5).map((p) => p.title).filter(Boolean),
    priceRangeUsd: { min: Math.min(...prices), max: Math.max(...prices) },
  };
}

/**
 * Real, exact setup requirements for the next tier (private revenue/order
 * data via the Shopify Admin API) -- returned to the UI so it can state
 * plainly what's needed rather than imply it's already possible.
 */
export function describeAuthorizedIntegrationRequirements() {
  return {
    shopify: {
      dataAvailable: ['Order count and revenue', 'Traffic (via linked analytics)', 'Customer counts'],
      requires: [
        'A registered Shopify Partner app (App URL + Allowed redirection URL)',
        'A public HTTPS callback endpoint on this server to receive the OAuth code',
        'API key and API secret stored as real server configuration (not committed to source)',
        'The member installing the app on their own store and approving the requested scopes',
      ],
      notConfigured: true,
    },
    googleAnalytics: {
      dataAvailable: ['Site visits', 'Traffic sources', 'Conversion events (if configured on their site)'],
      requires: [
        'A Google Cloud OAuth 2.0 client (client ID + secret)',
        'The Google Analytics Data API enabled on that project',
        'A public HTTPS OAuth redirect URI registered with Google',
        'The member granting read access to their own GA4 property',
      ],
      notConfigured: true,
    },
  };
}
