/**
 * Deterministic WooCommerce REST API client (products, categories).
 *
 * Auth: prefers the same WP Application Password used everywhere else in
 * this engine (via Basic Auth) over WooCommerce's separate Consumer
 * Key/Secret system. WooCommerce's wc/v3 routes are standard WP REST
 * routes underneath — they accept normal WP authentication, not only the
 * WC-specific consumer-key scheme, as long as the authenticated user has
 * manage_woocommerce. Discovered/confirmed during Checkpoint 1 live
 * testing (see implementation-agent.md §12): this removes a whole separate
 * credential-generation step from customer site onboarding. Falls back to
 * Consumer Key/Secret query-string auth only if wcConsumerKey is set
 * instead of wpAppPassword (kept for sites where that's preferred/required).
 */

function authHeaderOrQuery(siteConfig) {
  if (siteConfig.wpAppPassword) {
    const token = Buffer.from(`${siteConfig.wpUser}:${siteConfig.wpAppPassword}`).toString('base64');
    return { headers: { Authorization: `Basic ${token}` }, query: '' };
  }
  const q = `consumer_key=${encodeURIComponent(siteConfig.wcConsumerKey)}&consumer_secret=${encodeURIComponent(siteConfig.wcConsumerSecret)}`;
  return { headers: {}, query: q };
}

async function req(siteConfig, path, { method = 'GET', body } = {}) {
  const { headers: authHeaders, query } = authHeaderOrQuery(siteConfig);
  const sep = path.includes('?') ? '&' : '?';
  const url = `${siteConfig.baseUrl.replace(/\/$/, '')}/wp-json/wc/v3${path}${query ? sep + query : ''}`;
  const res = await fetch(url, {
    method,
    headers: { 'content-type': 'application/json', ...authHeaders },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`WC REST ${method} ${path} -> ${res.status}: ${errBody}`);
  }
  return res.json();
}

export async function getProduct(siteConfig, id) {
  return req(siteConfig, `/products/${id}`);
}

export async function updateProductField(siteConfig, id, field, value) {
  return req(siteConfig, `/products/${id}`, { method: 'PUT', body: { [field]: value } });
}

export async function getCategory(siteConfig, id) {
  return req(siteConfig, `/products/categories/${id}`);
}

export async function updateCategoryField(siteConfig, id, field, value) {
  return req(siteConfig, `/products/categories/${id}`, { method: 'PUT', body: { [field]: value } });
}

/** Yoast/Rank Math also store SEO title/description as postmeta on products (post_type=product) — read/write those via wp-client.mjs's getPostMeta/setPostMeta with objectType='post', not through this file. */
