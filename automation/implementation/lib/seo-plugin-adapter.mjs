/**
 * SEO-plugin adapter (methodology/implementation-agent.md §10).
 *
 * The engine calls only getSeoTitle()/setSeoTitle()/getMetaDescription()/
 * setMetaDescription() — never a plugin-specific field name. Adding AIOSEO
 * later means adding one more entry to FIELD_MAPS, not touching the engine.
 *
 * IMPORTANT — discovered during Checkpoint 1 build, not a scope change:
 * neither Yoast nor Rank Math expose their title/description postmeta for
 * REST *write* access out of the box (WordPress core doesn't auto-register
 * arbitrary postmeta for REST; these plugins don't register theirs either).
 * The least-fragile fix is a small (~20 line) mu-plugin on the customer's
 * site that calls register_post_meta()/register_term_meta() for exactly
 * these keys with show_in_rest + an auth callback gated on the same
 * Application Password user used for everything else here — not a scraper,
 * not raw DB access, just turning on REST access to fields the plugin
 * already owns. This is a one-time site-onboarding step (see
 * scripts/wp-rest-bridge-mu-plugin.php in this folder), not an engine
 * concern — the field keys below assume it's installed.
 */

export const FIELD_MAPS = {
  yoast: {
    seoTitleMetaKey: '_yoast_wpseo_title',
    metaDescriptionMetaKey: '_yoast_wpseo_metadesc',
    // WooCommerce product/category descriptions use core WC fields directly
    // (see wc-client.mjs) — Yoast's product-specific title/desc keys are the
    // same _yoast_wpseo_* keys, just on the product post/term object.
  },
  rankmath: {
    seoTitleMetaKey: 'rank_math_title',
    metaDescriptionMetaKey: 'rank_math_description',
  },
};

// WordPress.org plugin slugs as returned by GET /wp/v2/plugins's `plugin`
// field ("<folder>/<main-file>", no .php extension — confirmed empirically;
// docs/examples elsewhere often show it with .php, which does NOT match).
// Used for live detection (Realistic scope, added 2026-08-24) — Checkpoint 1
// used static siteConfig.seoPlugin config only; this makes it the fallback
// instead of the only path.
const PLUGIN_SLUGS = {
  yoast: 'wordpress-seo/wp-seo',
  rankmath: 'seo-by-rank-math/rank-math',
};

const liveDetectCache = new Map(); // baseUrl -> detected plugin key, so we don't hit /wp/v2/plugins on every field read/write

async function detectPluginLive(siteConfig) {
  if (liveDetectCache.has(siteConfig.baseUrl)) return liveDetectCache.get(siteConfig.baseUrl);

  const token = Buffer.from(`${siteConfig.wpUser}:${siteConfig.wpAppPassword}`).toString('base64');
  let plugins;
  try {
    const res = await fetch(`${siteConfig.baseUrl.replace(/\/$/, '')}/wp-json/wp/v2/plugins`, {
      headers: { Authorization: `Basic ${token}` },
    });
    if (!res.ok) return null; // e.g. user lacks activate_plugins — fall back to config, don't error
    plugins = await res.json();
  } catch {
    return null; // network/parse failure — fall back to config rather than block the whole engine on a detection probe
  }

  const activeSlugs = new Set(plugins.filter((p) => p.status === 'active').map((p) => p.plugin));
  let detected = null;
  for (const [key, slug] of Object.entries(PLUGIN_SLUGS)) {
    if (activeSlugs.has(slug)) {
      if (detected) {
        // Both active (unusual, but real sites do sometimes leave a
        // deactivated-in-spirit plugin technically active) — don't guess,
        // fall back to explicit config so a wrong pick isn't silent.
        liveDetectCache.set(siteConfig.baseUrl, null);
        return null;
      }
      detected = key;
    }
  }
  liveDetectCache.set(siteConfig.baseUrl, detected);
  return detected;
}

export async function detectPlugin(siteConfig) {
  if (siteConfig.wpUser && siteConfig.wpAppPassword) {
    const live = await detectPluginLive(siteConfig);
    if (live) return live;
  }
  // Fallback: explicit config (mock mode always lands here — no live site to probe).
  const plugin = siteConfig.seoPlugin;
  if (!FIELD_MAPS[plugin]) {
    throw new Error(`Unsupported or unconfigured SEO plugin "${plugin}". Supported: ${Object.keys(FIELD_MAPS).join(', ')}.`);
  }
  return plugin;
}

export async function getFieldMap(siteConfig) {
  return FIELD_MAPS[await detectPlugin(siteConfig)];
}
