// Reads Instagram "Download your information" JSON exports: saved collections (folders) and saved posts.
// Meta has shipped two entry shapes over time (string_map_data and label_values); both are normalised here.
import fs from 'node:fs';
import path from 'node:path';

const POST_RE = /instagram\.com\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]+)/i;

// Meta exports store UTF-8 text as Latin-1 escapes ("Ã°Â\u009f..."); undo that when it round-trips cleanly.
export function fixText(s) {
  if (typeof s !== 'string' || !/[À-ÿ]/.test(s)) return s;
  const fixed = Buffer.from(s, 'latin1').toString('utf8');
  return fixed.includes('�') ? s : fixed;
}

export function canonicalPost(href) {
  const m = POST_RE.exec(href || '');
  if (!m) return null;
  const kind = m[1].toLowerCase().startsWith('reel') ? 'reel' : m[1].toLowerCase();
  return { shortcode: m[2], kind, url: `https://www.instagram.com/${kind}/${m[2]}/` };
}

/** Find export files anywhere under the extracted export folder. */
export function findExportFiles(root) {
  const found = { collections: null, posts: null, html: false };
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name === 'saved_collections.json') found.collections = p;
      else if (ent.name === 'saved_posts.json') found.posts = p;
      else if (/^saved_(collections|posts)\.html$/.test(ent.name)) found.html = true;
    }
  };
  walk(root);
  return found;
}

// Flatten one entry into { Label: { value, href, timestamp } } whatever shape Meta used.
function fields(entry) {
  const out = {};
  for (const [k, v] of Object.entries(entry.string_map_data || {})) out[k] = v || {};
  for (const lv of entry.label_values || []) {
    if (lv.label) out[lv.label] = { value: lv.value, href: lv.href, timestamp: lv.timestamp_value ?? lv.timestamp };
  }
  return out;
}

function firstArray(json) {
  if (Array.isArray(json)) return json;
  return Object.values(json).find(Array.isArray) || [];
}

function anyHref(entry) {
  let hit = null;
  const scan = (v) => {
    if (hit || v == null) return;
    if (typeof v === 'string') { if (POST_RE.test(v)) hit = v; return; }
    if (typeof v === 'object') Object.values(v).forEach(scan);
  };
  scan(entry);
  return hit;
}

function toIso(ts) {
  return typeof ts === 'number' && ts > 0 ? new Date(ts * 1000).toISOString() : null;
}

/** saved_collections.json -> [{ shortcode, kind, url, handle, savedAt, collection }] */
export function parseCollections(file) {
  const rows = [];
  let current = null;
  for (const entry of firstArray(JSON.parse(fs.readFileSync(file, 'utf8')))) {
    const f = fields(entry);
    const name = f.Name || f['Collection name'];
    const isHeader = entry.title === 'Collection'
      || (name && !name.href && !anyHref(entry) && (f['Creation Time'] || f['Update Time'] || f['Created on']));
    if (isHeader) { current = fixText(name?.value ?? entry.title ?? '') || null; continue; }
    const post = canonicalPost(name?.href || anyHref(entry));
    if (!post) continue;
    const added = f['Added Time'] || f['Added on'] || f['Saved on'] || {};
    rows.push({ ...post, handle: fixText(name?.value || entry.title || '') || null, savedAt: toIso(added.timestamp ?? entry.timestamp), collection: current });
  }
  return rows;
}

/** saved_posts.json -> same shape, collection null (used to fill in missing handles/dates). */
export function parsePosts(file) {
  const rows = [];
  for (const entry of firstArray(JSON.parse(fs.readFileSync(file, 'utf8')))) {
    const f = fields(entry);
    const saved = f['Saved on'] || f.URL || {};
    const post = canonicalPost(saved.href || anyHref(entry));
    if (!post) continue;
    const handle = entry.title || f.Username?.value || f.Name?.value || null;
    rows.push({ ...post, handle: fixText(handle), savedAt: toIso(saved.timestamp ?? entry.timestamp), collection: null });
  }
  return rows;
}
