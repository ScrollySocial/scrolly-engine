/**
 * Real Shopify Admin GraphQL API client — the Shopify sibling of
 * wp-client.mjs, called only from cms-adapter.mjs. Nothing above
 * cms-adapter.mjs knows this file exists (implementation-agent.md §10).
 *
 * Auth: client-credentials grant (Client ID + Secret -> short-lived
 * 24h-expiry access token), NOT the old permanent "admin-created custom
 * app" token — Shopify retired creating new ones as of 2026-01-01. This is
 * the correct model for a store in the same Partner org as the calling
 * app (our own dev/test store today); a real customer's own store will
 * need a full OAuth install flow instead (separate, later work — see
 * methodology/implementation-agent.md's Shopify section).
 *
 * Verified against the live Admin GraphQL schema before writing this file
 * (not guessed): Product/Collection have a first-class `seo{title,
 * description}` field; Page/Article do not and use the `title_tag`/
 * `description_tag` metafields (namespace "global") instead — same
 * mechanism WordPress's Yoast plugin used. Every content-bearing resource
 * carries `templateSuffix`; null means the default Liquid template (which
 * reliably renders `body`/`descriptionHtml`), non-null means a
 * possibly-JSON/sectioned custom template that may not render it at all —
 * this is Shopify's structural equivalent of WordPress's Elementor
 * page-builder gate (see shopify-template-adapter.mjs).
 */

const API_VERSION = '2026-07';

const tokenCache = new Map(); // shopDomain -> { token, expiresAt }

async function getAccessToken(site) {
  const cached = tokenCache.get(site.shopDomain);
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached.token;

  const res = await fetch(`https://${site.shopDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: site.clientId, client_secret: site.clientSecret }),
  });
  if (!res.ok) throw new Error(`shopify-client: token request failed: ${res.status} ${await res.text()}`);
  const { access_token, expires_in } = await res.json();
  tokenCache.set(site.shopDomain, { token: access_token, expiresAt: Date.now() + expires_in * 1000 });
  return access_token;
}

export async function graphql(site, query, variables = {}) {
  const token = await getAccessToken(site);
  const res = await fetch(`https://${site.shopDomain}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`shopify-client: GraphQL request failed: ${res.status} ${await res.text()}`);
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(`shopify-client: GraphQL errors: ${JSON.stringify(errors)}`);
  return data;
}

function checkUserErrors(payload, mutationName) {
  const errs = payload?.userErrors;
  if (errs?.length) throw new Error(`shopify-client: ${mutationName} userErrors: ${JSON.stringify(errs)}`);
}

// Confirmed live: writing an empty string to a title_tag/description_tag
// metafield is a silent no-op — the mutation reports no userErrors, but the
// metafield keeps its previous value. This breaks rollback-to-absent (the
// common case where a finding's "original value" was simply no metafield at
// all). Deleting the metafield is the only way to genuinely restore "no
// value" — metafieldsDelete is safe to call even when nothing exists to
// delete (returns null for that identifier, not an error).
async function deleteMetafield(site, ownerId, key) {
  const data = await graphql(site, `mutation($metafields: [MetafieldIdentifierInput!]!) { metafieldsDelete(metafields: $metafields) { deletedMetafields { key } userErrors { field message } } }`, { metafields: [{ ownerId, namespace: 'global', key }] });
  checkUserErrors(data.metafieldsDelete, 'metafieldsDelete');
}

const RESOURCE_QUERY = { shopify_product: 'product', shopify_collection: 'collection', shopify_page: 'page', shopify_article: 'article' };
function resourceField(targetObjectType) {
  const f = RESOURCE_QUERY[targetObjectType];
  if (!f) throw new Error(`shopify-client: unknown targetObjectType "${targetObjectType}"`);
  return f;
}

// ---------------------------------------------------------------------------
// SEO title / meta description
// ---------------------------------------------------------------------------

const SEO_FIELD_RESOURCES = new Set(['shopify_product', 'shopify_collection']); // first-class `seo{title,description}`
const METAFIELD_RESOURCES = new Set(['shopify_page', 'shopify_article']); // title_tag/description_tag metafields

export async function getSeoTitle(site, targetObjectType, targetObjectId) {
  const field = resourceField(targetObjectType);
  if (SEO_FIELD_RESOURCES.has(targetObjectType)) {
    const data = await graphql(site, `query($id: ID!) { ${field}(id: $id) { seo { title } title } }`, { id: targetObjectId });
    return data[field]?.seo?.title || '';
  }
  const data = await graphql(site, `query($id: ID!) { ${field}(id: $id) { metafield(namespace: "global", key: "title_tag") { value } title } }`, { id: targetObjectId });
  return data[field]?.metafield?.value || '';
}

// Confirmed live (genuine bug, caught by the whole-audit acceptance test's
// final verification pass, not a happy-path test): productUpdate/
// collectionUpdate's `seo` input is replaced WHOLESALE, not merged per
// subfield. Calling setSeoTitle then separately calling setMetaDescription
// on the same product silently wipes the title back to empty, even though
// the second call never mentioned `title` — Shopify has no per-subfield
// partial-update semantics for this nested input, unlike top-level fields.
// Read-modify-write makes each call self-healing regardless of the other
// field's current value or call order.
async function setSeoField(site, targetObjectType, targetObjectId, patch) {
  const field = resourceField(targetObjectType);
  const current = await graphql(site, `query($id: ID!) { ${field}(id: $id) { seo { title description } } }`, { id: targetObjectId });
  const seo = { title: current[field]?.seo?.title || '', description: current[field]?.seo?.description || '', ...patch };
  const mutation = `mutation($input: ${field === 'product' ? 'ProductUpdate' : 'Collection'}Input!) { ${field}Update(${field === 'product' ? 'product' : 'input'}: $input) { ${field} { id } userErrors { field message } } }`;
  const data = await graphql(site, mutation, { input: { id: targetObjectId, seo } });
  checkUserErrors(data[`${field}Update`], `${field}Update`);
}

export async function setSeoTitle(site, targetObjectType, targetObjectId, value) {
  const field = resourceField(targetObjectType);
  if (SEO_FIELD_RESOURCES.has(targetObjectType)) return setSeoField(site, targetObjectType, targetObjectId, { title: value });
  if (value === '') return deleteMetafield(site, targetObjectId, 'title_tag');
  const mutation = `mutation($id: ID!, $input: ${field === 'page' ? 'PageUpdate' : 'ArticleUpdate'}Input!) { ${field}Update(id: $id, ${field}: $input) { ${field} { id } userErrors { field message } } }`;
  const data = await graphql(site, mutation, { id: targetObjectId, input: { metafields: [{ namespace: 'global', key: 'title_tag', value, type: 'single_line_text_field' }] } });
  checkUserErrors(data[`${field}Update`], `${field}Update`);
}

export async function getMetaDescription(site, targetObjectType, targetObjectId) {
  const field = resourceField(targetObjectType);
  if (SEO_FIELD_RESOURCES.has(targetObjectType)) {
    const data = await graphql(site, `query($id: ID!) { ${field}(id: $id) { seo { description } } }`, { id: targetObjectId });
    return data[field]?.seo?.description || '';
  }
  const data = await graphql(site, `query($id: ID!) { ${field}(id: $id) { metafield(namespace: "global", key: "description_tag") { value } } }`, { id: targetObjectId });
  return data[field]?.metafield?.value || '';
}

export async function setMetaDescription(site, targetObjectType, targetObjectId, value) {
  const field = resourceField(targetObjectType);
  if (SEO_FIELD_RESOURCES.has(targetObjectType)) return setSeoField(site, targetObjectType, targetObjectId, { description: value });
  if (value === '') return deleteMetafield(site, targetObjectId, 'description_tag');
  const mutation = `mutation($id: ID!, $input: ${field === 'page' ? 'PageUpdate' : 'ArticleUpdate'}Input!) { ${field}Update(id: $id, ${field}: $input) { ${field} { id } userErrors { field message } } }`;
  const data = await graphql(site, mutation, { id: targetObjectId, input: { metafields: [{ namespace: 'global', key: 'description_tag', value, type: 'single_line_text_field' }] } });
  checkUserErrors(data[`${field}Update`], `${field}Update`);
}

// ---------------------------------------------------------------------------
// Image / media alt text
// ---------------------------------------------------------------------------

export async function getFileAlt(site, fileId) {
  const data = await graphql(site, `query($id: ID!) { node(id: $id) { ... on MediaImage { alt } } }`, { id: fileId });
  return data.node?.alt || '';
}

export async function setFileAlt(site, fileId, value) {
  const data = await graphql(site, `mutation($files: [FileUpdateInput!]!) { fileUpdate(files: $files) { files { id } userErrors { field message } } }`, { files: [{ id: fileId, alt: value }] });
  checkUserErrors(data.fileUpdate, 'fileUpdate');
}

// ---------------------------------------------------------------------------
// Body content (content_append / content_replace target)
// ---------------------------------------------------------------------------

const BODY_FIELD = { shopify_product: 'descriptionHtml', shopify_collection: 'descriptionHtml', shopify_page: 'body', shopify_article: 'body' };

export async function getContent(site, targetObjectType, targetObjectId) {
  const field = resourceField(targetObjectType);
  const bodyField = BODY_FIELD[targetObjectType];
  const data = await graphql(site, `query($id: ID!) { ${field}(id: $id) { ${bodyField} } }`, { id: targetObjectId });
  return data[field]?.[bodyField] || '';
}

export async function setContent(site, targetObjectType, targetObjectId, value) {
  const field = resourceField(targetObjectType);
  const bodyField = BODY_FIELD[targetObjectType];
  if (SEO_FIELD_RESOURCES.has(targetObjectType)) {
    const mutation = `mutation($input: ${field === 'product' ? 'ProductUpdate' : 'Collection'}Input!) { ${field}Update(${field === 'product' ? 'product' : 'input'}: $input) { ${field} { id } userErrors { field message } } }`;
    const data = await graphql(site, mutation, { input: { id: targetObjectId, [bodyField]: value } });
    checkUserErrors(data[`${field}Update`], `${field}Update`);
    return;
  }
  const mutation = `mutation($id: ID!, $input: ${field === 'page' ? 'PageUpdate' : 'ArticleUpdate'}Input!) { ${field}Update(id: $id, ${field}: $input) { ${field} { id } userErrors { field message } } }`;
  const data = await graphql(site, mutation, { id: targetObjectId, input: { [bodyField]: value } });
  checkUserErrors(data[`${field}Update`], `${field}Update`);
}

// ---------------------------------------------------------------------------
// templateSuffix — the page-builder-equivalent safety gate (see
// shopify-template-adapter.mjs, which wraps this as isSafeForBodyContentEdit)
// ---------------------------------------------------------------------------

export async function getTemplateSuffix(site, targetObjectType, targetObjectId) {
  const field = resourceField(targetObjectType);
  const data = await graphql(site, `query($id: ID!) { ${field}(id: $id) { templateSuffix } }`, { id: targetObjectId });
  return data[field]?.templateSuffix ?? null;
}

// ---------------------------------------------------------------------------
// {url, title, content} in one call — the Shopify equivalent of the direct
// WordPress REST fetch run-implementation.mjs's Path 3 dispatch uses to
// build real page context for the internal-link planner.
// ---------------------------------------------------------------------------

const STOREFRONT_PATH = { shopify_product: 'products', shopify_collection: 'collections', shopify_page: 'pages' };

export async function getPageMeta(site, targetObjectType, targetObjectId) {
  const field = resourceField(targetObjectType);
  const bodyField = BODY_FIELD[targetObjectType];
  if (targetObjectType === 'shopify_article') {
    const data = await graphql(site, `query($id: ID!) { article(id: $id) { title handle body blog { handle } } }`, { id: targetObjectId });
    const a = data.article;
    return { url: `https://${site.shopDomain}/blogs/${a.blog.handle}/${a.handle}`, title: a.title, content: stripHtml(a.body) };
  }
  const data = await graphql(site, `query($id: ID!) { ${field}(id: $id) { title handle ${bodyField} } }`, { id: targetObjectId });
  const obj = data[field];
  return { url: `https://${site.shopDomain}/${STOREFRONT_PATH[targetObjectType]}/${obj.handle}`, title: obj.title, content: stripHtml(obj[bodyField]) };
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// URL redirects — stronger than WordPress's equivalent: a genuinely safe,
// purely-additive Path-1 fix for a broken/old URL (create a redirect)
// instead of only being able to edit body text pointing at it.
// ---------------------------------------------------------------------------

export async function createRedirect(site, fromPath, toTarget) {
  const data = await graphql(site, `mutation($urlRedirect: UrlRedirectInput!) { urlRedirectCreate(urlRedirect: $urlRedirect) { urlRedirect { id path target } userErrors { field message } } }`, { urlRedirect: { path: fromPath, target: toTarget } });
  checkUserErrors(data.urlRedirectCreate, 'urlRedirectCreate');
  return data.urlRedirectCreate.urlRedirect;
}

export async function deleteRedirect(site, redirectId) {
  const data = await graphql(site, `mutation($id: ID!) { urlRedirectDelete(id: $id) { deletedUrlRedirectId userErrors { field message } } }`, { id: redirectId });
  checkUserErrors(data.urlRedirectDelete, 'urlRedirectDelete');
}
