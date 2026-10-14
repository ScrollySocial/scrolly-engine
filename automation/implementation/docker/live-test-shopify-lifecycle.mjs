#!/usr/bin/env node
/**
 * Live proof of the Shopify adapter's core lifecycle against a real,
 * disposable Shopify dev store — the Shopify sibling of
 * docker/live-test-content-append.mjs etc. Mirrors the same discipline:
 * every write independently re-verified with a fresh GraphQL read (not the
 * mutation's own echoed response, which can be misleading — see
 * run-implementation.mjs's final-verification note about a CMS echoing
 * back what was sent rather than what was actually persisted).
 *
 * Requires SHOPIFY_SHOP_DOMAIN / SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET
 * in automation/.env, pointed at a Shopify Partner dev store (never a real
 * merchant's live store — this creates and deletes real test objects).
 *
 * Usage: node docker/live-test-shopify-lifecycle.mjs
 */
import 'dotenv/config';
import { readField, writeField, getContent } from '../lib/cms-adapter.mjs';
import { createTask, markSnapshot } from '../lib/task-schema.mjs';
import { runQa } from '../lib/qa-engine.mjs';
import { valuesMatch } from '../lib/compare.mjs';
import { isSafeForBodyContentEdit } from '../lib/page-builder-adapter.mjs';
import * as shopify from '../lib/shopify-client.mjs';

const site = { platform: 'shopify', shopDomain: process.env.SHOPIFY_SHOP_DOMAIN, clientId: process.env.SHOPIFY_CLIENT_ID, clientSecret: process.env.SHOPIFY_CLIENT_SECRET };
if (!site.shopDomain || !site.clientId || !site.clientSecret) {
  console.error('Missing SHOPIFY_SHOP_DOMAIN / SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET in automation/.env');
  process.exit(1);
}

let failures = 0;
function assert(label, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'} — ${label}`);
  if (!condition) failures++;
}

// ---------------------------------------------------------------------------
// Setup: create a real, disposable test product, page, and article
// ---------------------------------------------------------------------------
console.log('\n=== Setup: creating disposable test objects ===');

const productData = await shopify.graphql(site, `mutation($input: ProductInput!) { productCreate(input: $input) { product { id } userErrors { field message } } }`, {
  input: { title: 'Scrolly Adapter Test Product (safe to delete)', descriptionHtml: '<p>Original product description for adapter testing.</p>' },
});
if (productData.productCreate.userErrors?.length) throw new Error(JSON.stringify(productData.productCreate.userErrors));
const productId = productData.productCreate.product.id;
console.log(`Created test product: ${productId}`);

const pageData = await shopify.graphql(site, `mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { id } userErrors { field message } } }`, {
  page: { title: 'Scrolly Adapter Test Page (safe to delete)', body: '<p>Original page body for adapter testing.</p><p>Follow us: <a href="https://example.com/broken">Broken Link</a></p>' },
});
if (pageData.pageCreate.userErrors?.length) throw new Error(JSON.stringify(pageData.pageCreate.userErrors));
const pageId = pageData.pageCreate.page.id;
console.log(`Created test page: ${pageId}`);

// Attach a real image to the test product, for the alt_text test below
const mediaData = await shopify.graphql(site, `mutation($productId: ID!, $media: [CreateMediaInput!]!) { productCreateMedia(productId: $productId, media: $media) { media { id ... on MediaImage { alt } } mediaUserErrors { field message } } }`, {
  productId,
  media: [{ mediaContentType: 'IMAGE', originalSource: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png', alt: 'IMG_original_placeholder' }],
});
if (mediaData.productCreateMedia.mediaUserErrors?.length) throw new Error(JSON.stringify(mediaData.productCreateMedia.mediaUserErrors));
const mediaImageId = mediaData.productCreateMedia.media[0].id;
console.log(`Attached test image: ${mediaImageId}`);

// A second page with a non-null templateSuffix, to prove the safety gate fails closed
const customTemplatePageData = await shopify.graphql(site, `mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { id } userErrors { field message } } }`, {
  page: { title: 'Scrolly Adapter Test Custom-Template Page (safe to delete)', body: '<p>Should never be auto-edited.</p>', templateSuffix: 'custom' },
});
if (customTemplatePageData.pageCreate.userErrors?.length) throw new Error(JSON.stringify(customTemplatePageData.pageCreate.userErrors));
const customTemplatePageId = customTemplatePageData.pageCreate.page.id;
console.log(`Created custom-template test page: ${customTemplatePageId}`);

try {
  // ---------------------------------------------------------------------------
  // 1. seo_title (product — first-class `seo` field)
  // ---------------------------------------------------------------------------
  console.log('\n=== seo_title (Product) ===');
  {
    const task = createTask({ engagementSlug: 'shopify-adapter-test', path: 'auto_implementable', fieldType: 'seo_title', targetSite: site.shopDomain, targetObjectType: 'shopify_product', targetObjectId: productId, targetField: 'seo_title', sourceFindingRef: { table: 'test', index: 0 }, rationale: 'test' });
    task.originalValue = await readField(task);
    markSnapshot(task, task.originalValue);
    task.proposedValue = 'Scrolly Adapter Test Product | Test Store';
    task.qa = runQa(task, task.proposedValue);
    assert('QA passes', task.qa.passed);
    await writeField(task, task.proposedValue);
    const fresh = await readField(task);
    assert('write + fresh read-back match', valuesMatch(task, task.proposedValue, fresh));
    await writeField(task, task.originalValue);
    const rolledBack = await readField(task);
    assert('rollback verified', valuesMatch(task, task.originalValue, rolledBack));
  }

  // ---------------------------------------------------------------------------
  // 2. alt_text (product image — MediaImage via the generic Files interface)
  // ---------------------------------------------------------------------------
  console.log('\n=== alt_text (Product image) ===');
  {
    const task = createTask({ engagementSlug: 'shopify-adapter-test', path: 'auto_implementable', fieldType: 'alt_text', targetSite: site.shopDomain, targetObjectType: 'shopify_file', targetObjectId: mediaImageId, targetField: 'alt_text', sourceFindingRef: { table: 'test', index: 4 }, rationale: 'test' });
    task.originalValue = await readField(task);
    markSnapshot(task, task.originalValue);
    assert('original alt text read back matches what was set at creation', task.originalValue === 'IMG_original_placeholder');
    task.proposedValue = 'The Wikipedia globe logo, used as a placeholder test image';
    task.qa = runQa(task, task.proposedValue);
    assert('QA passes (not a placeholder pattern)', task.qa.passed);
    await writeField(task, task.proposedValue);
    const fresh = await readField(task);
    assert('write + fresh read-back match', valuesMatch(task, task.proposedValue, fresh));
    await writeField(task, task.originalValue);
    const rolledBack = await readField(task);
    assert('rollback verified', valuesMatch(task, task.originalValue, rolledBack));
  }

  // ---------------------------------------------------------------------------
  // 3. meta_description (page — metafield-based, not first-class `seo`)
  // ---------------------------------------------------------------------------
  console.log('\n=== meta_description (Page, metafield path) ===');
  {
    const task = createTask({ engagementSlug: 'shopify-adapter-test', path: 'auto_implementable', fieldType: 'meta_description', targetSite: site.shopDomain, targetObjectType: 'shopify_page', targetObjectId: pageId, targetField: 'meta_description', sourceFindingRef: { table: 'test', index: 1 }, rationale: 'test' });
    task.originalValue = await readField(task);
    markSnapshot(task, task.originalValue);
    task.proposedValue = 'A test meta description for the Scrolly Shopify adapter, long enough to plausibly pass a 120-160 char QA length check for realism here.';
    task.qa = runQa(task, task.proposedValue);
    assert('QA passes', task.qa.passed);
    await writeField(task, task.proposedValue);
    const fresh = await readField(task);
    assert('write + fresh read-back match', valuesMatch(task, task.proposedValue, fresh));
    await writeField(task, task.originalValue || '');
    const rolledBack = await readField(task);
    assert('rollback verified', valuesMatch(task, task.originalValue || '', rolledBack));
  }

  // ---------------------------------------------------------------------------
  // 4. templateSuffix safety gate
  // ---------------------------------------------------------------------------
  console.log('\n=== Page-builder-equivalent safety gate (templateSuffix) ===');
  {
    const safeDefault = await isSafeForBodyContentEdit(site, { targetObjectType: 'shopify_page', targetObjectId: pageId });
    assert('default-template page is safe to auto-edit', safeDefault === true);
    const safeCustom = await isSafeForBodyContentEdit(site, { targetObjectType: 'shopify_page', targetObjectId: customTemplatePageId });
    assert('custom-template page correctly refused (fail closed)', safeCustom === false);
  }

  // ---------------------------------------------------------------------------
  // 5. content_replace (broken link fix, on the default-template page)
  // ---------------------------------------------------------------------------
  console.log('\n=== content_replace (Page body) ===');
  {
    const task = createTask({ engagementSlug: 'shopify-adapter-test', path: 'auto_implementable', fieldType: 'content_replace', targetSite: site.shopDomain, targetObjectType: 'shopify_page', targetObjectId: pageId, targetField: 'content', sourceFindingRef: { table: 'test', index: 2 }, rationale: 'test' });
    const current = await getContent(task);
    task.replaceTarget = 'https://example.com/broken';
    task.replaceWith = 'https://example.com/fixed';
    task.originalValue = current;
    markSnapshot(task, current);
    task.proposedValue = current.replace(task.replaceTarget, task.replaceWith);
    task.qa = runQa(task, task.proposedValue);
    assert('QA passes (unique_occurrence + reconstruction_matches)', task.qa.passed);
    await writeField(task, task.proposedValue);
    const fresh = await getContent(task);
    assert('write + fresh read-back match', valuesMatch(task, task.proposedValue, fresh));
    assert('fixed link genuinely present live', fresh.includes('https://example.com/fixed'));
    await writeField(task, task.originalValue);
    const rolledBack = await getContent(task);
    assert('rollback verified', valuesMatch(task, task.originalValue, rolledBack));
  }

  // ---------------------------------------------------------------------------
  // 6. content_append (product description, safe additive content)
  // ---------------------------------------------------------------------------
  console.log('\n=== content_append (Product descriptionHtml) ===');
  {
    const task = createTask({ engagementSlug: 'shopify-adapter-test', path: 'auto_implementable', fieldType: 'content_append', targetSite: site.shopDomain, targetObjectType: 'shopify_product', targetObjectId: productId, targetField: 'content', sourceFindingRef: { table: 'test', index: 3 }, rationale: 'test' });
    const current = await getContent(task);
    const fragment = '<h3>Care Instructions</h3><p>Hand wash cold, lay flat to dry.</p>';
    task.originalValue = current;
    markSnapshot(task, current);
    task.proposedValue = current + '\n' + fragment;
    task.qa = runQa(task, task.proposedValue);
    assert('QA passes (original_content_preserved + content_grew)', task.qa.passed);
    await writeField(task, task.proposedValue);
    const fresh = await getContent(task);
    assert('write + fresh read-back match', valuesMatch(task, task.proposedValue, fresh));
    assert('original content preserved live', fresh.includes('Original product description'));
    assert('fragment present live', fresh.includes('Care Instructions'));
    await writeField(task, task.originalValue);
    const rolledBack = await getContent(task);
    assert('rollback verified', valuesMatch(task, task.originalValue, rolledBack));
  }
} finally {
  // ---------------------------------------------------------------------------
  // Cleanup — leave the dev store as we found it
  // ---------------------------------------------------------------------------
  console.log('\n=== Cleanup ===');
  await shopify.graphql(site, `mutation($id: ID!) { productDelete(input: { id: $id }) { deletedProductId } }`, { id: productId }).catch((e) => console.error('cleanup productDelete failed:', e.message));
  await shopify.graphql(site, `mutation($id: ID!) { pageDelete(id: $id) { deletedPageId } }`, { id: pageId }).catch((e) => console.error('cleanup pageDelete failed:', e.message));
  await shopify.graphql(site, `mutation($id: ID!) { pageDelete(id: $id) { deletedPageId } }`, { id: customTemplatePageId }).catch((e) => console.error('cleanup pageDelete failed:', e.message));
  console.log('Test objects deleted.');
}

console.log(`\n${failures === 0 ? 'ALL PASSED' : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
