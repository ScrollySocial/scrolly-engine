/**
 * In-memory mock WP/WooCommerce site, used to prove the Checkpoint-1
 * lifecycle end-to-end before a real customer test-site's credentials
 * exist. Same read/write shape as the real clients (get.../set...), so
 * cms-adapter.mjs can point at either without the engine knowing which.
 *
 * Seeded from Mulberry Creek's actual, real audit findings (Category H in
 * findings.md) — generic title, missing meta description, placeholder alt
 * text — so the dry run below exercises real proposed-value generation
 * against real current-state facts, not invented data.
 */

const state = {
  posts: {
    1: {
      id: 1,
      title: { raw: 'Landscaping and Garden Center' }, // real, from findings.md Category H
      meta: { _yoast_wpseo_title: '', _yoast_wpseo_metadesc: '' }, // both empty, per findings.md
      content: '<p>Mulberry Creek offers landscaping and nursery services.</p>',
    },
  },
  media: {
    501: { id: 501, alt_text: 'Placeholder image for ABOUT' }, // real, from findings.md Category H
    502: { id: 502, alt_text: 'IMG_5862.PNG' }, // real, from findings.md Category H
  },
  wcProducts: {
    9001: { id: 9001, name: 'Sample Product', description: '', short_description: '', meta_data: [] },
  },
  wcCategories: {
    7001: { id: 7001, name: 'Trees', description: '' },
  },
};

export async function getPostMeta(objectType, id, metaKey) {
  const obj = state.posts[id];
  if (!obj) throw new Error(`mock: no post/page ${id}`);
  if (metaKey === '__title__') return obj.title.raw;
  return obj.meta[metaKey] ?? '';
}

export async function setPostMeta(objectType, id, metaKey, value) {
  const obj = state.posts[id];
  if (!obj) throw new Error(`mock: no post/page ${id}`);
  if (metaKey === '__title__') obj.title.raw = value;
  else obj.meta[metaKey] = value;
  return obj;
}

export async function getPostContent(objectType, id) {
  const obj = state.posts[id];
  if (!obj) throw new Error(`mock: no post/page ${id}`);
  return obj.content;
}

export async function setPostContent(objectType, id, content) {
  const obj = state.posts[id];
  if (!obj) throw new Error(`mock: no post/page ${id}`);
  obj.content = content;
  return obj;
}

export async function getMediaAltText(mediaId) {
  const obj = state.media[mediaId];
  if (!obj) throw new Error(`mock: no media ${mediaId}`);
  return obj.alt_text;
}

export async function setMediaAltText(mediaId, value) {
  const obj = state.media[mediaId];
  if (!obj) throw new Error(`mock: no media ${mediaId}`);
  obj.alt_text = value;
  return obj;
}

export async function getWcField(objectType, id, field) {
  const store = objectType === 'wc_product' ? state.wcProducts : state.wcCategories;
  const obj = store[id];
  if (!obj) throw new Error(`mock: no ${objectType} ${id}`);
  return obj[field] ?? '';
}

export async function setWcField(objectType, id, field, value) {
  const store = objectType === 'wc_product' ? state.wcProducts : state.wcCategories;
  const obj = store[id];
  if (!obj) throw new Error(`mock: no ${objectType} ${id}`);
  obj[field] = value;
  return obj;
}

export function dumpState() {
  return JSON.parse(JSON.stringify(state));
}
