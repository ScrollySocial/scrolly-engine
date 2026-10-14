/**
 * Deterministic WordPress REST API client. No LLM involved anywhere in this
 * file, per implementation-agent.md's "deterministic vs LLM work" split.
 * Auth: Application Password (Basic auth) — the customer creates this once
 * during site onboarding; never entered/stored by an LLM call.
 */

function authHeader(siteConfig) {
  const token = Buffer.from(`${siteConfig.wpUser}:${siteConfig.wpAppPassword}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

async function req(siteConfig, path, { method = 'GET', body } = {}) {
  const url = `${siteConfig.baseUrl.replace(/\/$/, '')}/wp-json${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      'content-type': 'application/json',
      ...authHeader(siteConfig),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`WP REST ${method} ${path} -> ${res.status}: ${errBody}`);
  }
  return res.json();
}

const TYPE_ENDPOINT = { post: '/wp/v2/posts', page: '/wp/v2/pages', media: '/wp/v2/media' };

export async function getObject(siteConfig, objectType, id) {
  return req(siteConfig, `${TYPE_ENDPOINT[objectType]}/${id}?context=edit`);
}

/** Read a Yoast/Rank Math meta field (requires the REST-bridge mu-plugin — see scripts/). */
export async function getPostMeta(siteConfig, objectType, id, metaKey) {
  const obj = await getObject(siteConfig, objectType, id);
  return obj.meta ? obj.meta[metaKey] ?? null : null;
}

export async function setPostMeta(siteConfig, objectType, id, metaKey, value) {
  return req(siteConfig, `${TYPE_ENDPOINT[objectType]}/${id}`, {
    method: 'POST',
    body: { meta: { [metaKey]: value } },
  });
}

/** Native REST field — no mu-plugin registration needed (unlike postmeta). */
export async function getPostContent(siteConfig, objectType, id) {
  const obj = await getObject(siteConfig, objectType, id);
  return obj.content?.raw ?? '';
}

export async function setPostContent(siteConfig, objectType, id, content) {
  return req(siteConfig, `${TYPE_ENDPOINT[objectType]}/${id}`, {
    method: 'POST',
    body: { content },
  });
}

export async function getMediaAltText(siteConfig, mediaId) {
  const obj = await getObject(siteConfig, 'media', mediaId);
  return obj.alt_text ?? null;
}

export async function setMediaAltText(siteConfig, mediaId, altText) {
  return req(siteConfig, `${TYPE_ENDPOINT.media}/${mediaId}`, {
    method: 'POST',
    body: { alt_text: altText },
  });
}
