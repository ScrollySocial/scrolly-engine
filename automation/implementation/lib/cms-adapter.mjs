/**
 * Generic CMS/plugin-facing interface the Implementation Engine actually
 * calls (implementation-agent.md §10): getSeoTitle/setSeoTitle,
 * getMetaDescription/setMetaDescription, getAltText/setAltText,
 * getWcField/setWcField. Nothing above this file knows WordPress,
 * WooCommerce, Yoast, Rank Math, or mock-vs-live exist.
 *
 * CMS_MODE=mock (default) uses the in-memory mock-site so the full
 * lifecycle can be proven without live credentials. CMS_MODE=live switches
 * to the real wp-client/wc-client — flip it once a customer test site's
 * WP_BASE_URL / WP_APP_USER / WP_APP_PASSWORD / WC_CONSUMER_KEY /
 * WC_CONSUMER_SECRET are set (see automation/.env.example).
 */

import 'dotenv/config';
import * as wp from './wp-client.mjs';
import * as wc from './wc-client.mjs';
import * as mock from './mock-site.mjs';
import * as shopify from './shopify-client.mjs';
import { getFieldMap } from './seo-plugin-adapter.mjs';

const MODE = process.env.CMS_MODE || 'mock';

function siteConfigFromEnv() {
  return {
    baseUrl: process.env.WP_BASE_URL,
    wpUser: process.env.WP_APP_USER,
    wpAppPassword: process.env.WP_APP_PASSWORD,
    wcConsumerKey: process.env.WC_CONSUMER_KEY,
    wcConsumerSecret: process.env.WC_CONSUMER_SECRET,
    seoPlugin: process.env.SEO_PLUGIN || 'yoast',
  };
}

// Shopify dispatch: routed purely by task.targetObjectType's "shopify_"
// prefix, never a frozen-at-import env var (see the note on MODE above —
// a module-level `const` read from process.env is fixed at ESM import
// time, before run-implementation.mjs's later `process.env.X = ...`
// assignments run; this file has already been bitten by that once for
// CMS_MODE). Reading shopifyConfigFromEnv() fresh inside each call avoids
// repeating that landmine for the new platform dimension. No Shopify mock
// mode exists (V1 tests directly against a disposable dev store, same
// spirit as WordPress's later live-tested components) — every
// shopify_-prefixed task always calls the real client.
function isShopify(task) {
  return typeof task.targetObjectType === 'string' && task.targetObjectType.startsWith('shopify_');
}
function shopifyConfigFromEnv() {
  return {
    shopDomain: process.env.SHOPIFY_SHOP_DOMAIN,
    clientId: process.env.SHOPIFY_CLIENT_ID,
    clientSecret: process.env.SHOPIFY_CLIENT_SECRET,
  };
}

export async function getSeoTitle(task) {
  if (isShopify(task)) return shopify.getSeoTitle(shopifyConfigFromEnv(), task.targetObjectType, task.targetObjectId);
  if (MODE === 'mock') {
    const pluginValue = await mock.getPostMeta(task.targetObjectType, task.targetObjectId, '_yoast_wpseo_title');
    if (pluginValue) return pluginValue;
    return mock.getPostMeta(task.targetObjectType, task.targetObjectId, '__title__');
  }
  const site = siteConfigFromEnv();
  const { seoTitleMetaKey } = await getFieldMap(site);
  const pluginValue = await wp.getPostMeta(site, task.targetObjectType, task.targetObjectId, seoTitleMetaKey);
  if (pluginValue) return pluginValue;
  const obj = await wp.getObject(site, task.targetObjectType, task.targetObjectId);
  return obj.title?.raw ?? '';
}

export async function setSeoTitle(task, value) {
  if (isShopify(task)) return shopify.setSeoTitle(shopifyConfigFromEnv(), task.targetObjectType, task.targetObjectId, value);
  if (MODE === 'mock') return mock.setPostMeta(task.targetObjectType, task.targetObjectId, '_yoast_wpseo_title', value);
  const site = siteConfigFromEnv();
  const { seoTitleMetaKey } = await getFieldMap(site);
  return wp.setPostMeta(site, task.targetObjectType, task.targetObjectId, seoTitleMetaKey, value);
}

export async function getMetaDescription(task) {
  if (isShopify(task)) return shopify.getMetaDescription(shopifyConfigFromEnv(), task.targetObjectType, task.targetObjectId);
  if (MODE === 'mock') return mock.getPostMeta(task.targetObjectType, task.targetObjectId, '_yoast_wpseo_metadesc');
  const site = siteConfigFromEnv();
  const { metaDescriptionMetaKey } = await getFieldMap(site);
  return wp.getPostMeta(site, task.targetObjectType, task.targetObjectId, metaDescriptionMetaKey);
}

export async function setMetaDescription(task, value) {
  if (isShopify(task)) return shopify.setMetaDescription(shopifyConfigFromEnv(), task.targetObjectType, task.targetObjectId, value);
  if (MODE === 'mock') return mock.setPostMeta(task.targetObjectType, task.targetObjectId, '_yoast_wpseo_metadesc', value);
  const site = siteConfigFromEnv();
  const { metaDescriptionMetaKey } = await getFieldMap(site);
  return wp.setPostMeta(site, task.targetObjectType, task.targetObjectId, metaDescriptionMetaKey, value);
}

export async function getAltText(task) {
  if (isShopify(task)) return shopify.getFileAlt(shopifyConfigFromEnv(), task.targetObjectId);
  if (MODE === 'mock') return mock.getMediaAltText(task.targetObjectId);
  return wp.getMediaAltText(siteConfigFromEnv(), task.targetObjectId);
}

export async function setAltText(task, value) {
  if (isShopify(task)) return shopify.setFileAlt(shopifyConfigFromEnv(), task.targetObjectId, value);
  if (MODE === 'mock') return mock.setMediaAltText(task.targetObjectId, value);
  return wp.setMediaAltText(siteConfigFromEnv(), task.targetObjectId, value);
}

export async function getWcField(task) {
  if (MODE === 'mock') return mock.getWcField(task.targetObjectType, task.targetObjectId, task.targetField);
  const site = siteConfigFromEnv();
  const obj =
    task.targetObjectType === 'wc_product'
      ? await wc.getProduct(site, task.targetObjectId)
      : await wc.getCategory(site, task.targetObjectId);
  return obj[task.targetField] ?? '';
}

export async function setWcField(task, value) {
  if (MODE === 'mock') return mock.setWcField(task.targetObjectType, task.targetObjectId, task.targetField, value);
  const site = siteConfigFromEnv();
  return task.targetObjectType === 'wc_product'
    ? wc.updateProductField(site, task.targetObjectId, task.targetField, value)
    : wc.updateCategoryField(site, task.targetObjectId, task.targetField, value);
}

// content_append (native heading/copy/FAQ additions, Realistic scope). Plain
// literal get/set — NOT append logic. The task's proposedValue is already
// the full new content (original + appended fragment) by the time it
// reaches here, computed once at task-creation time — see
// docker/live-test-content-append.mjs. This keeps writeField(task, value) /
// readField(task) uniform for every fieldType: apply writes the full new
// value, rollback writes the full original value back, neither needs
// fieldType-specific handling in apply.mjs/rollback.mjs.
export async function getContent(task) {
  if (isShopify(task)) return shopify.getContent(shopifyConfigFromEnv(), task.targetObjectType, task.targetObjectId);
  if (MODE === 'mock') return mock.getPostContent(task.targetObjectType, task.targetObjectId);
  return wp.getPostContent(siteConfigFromEnv(), task.targetObjectType, task.targetObjectId);
}

export async function setContent(task, value) {
  if (isShopify(task)) return shopify.setContent(shopifyConfigFromEnv(), task.targetObjectType, task.targetObjectId, value);
  if (MODE === 'mock') return mock.setPostContent(task.targetObjectType, task.targetObjectId, value);
  return wp.setPostContent(siteConfigFromEnv(), task.targetObjectType, task.targetObjectId, value);
}

/** Single generic dispatch by fieldType — this is what propose/apply/rollback actually call. */
const READ = { seo_title: getSeoTitle, meta_description: getMetaDescription, alt_text: getAltText, wc_product_field: getWcField, wc_category_field: getWcField, content_append: getContent, content_replace: getContent };
const WRITE = { seo_title: setSeoTitle, meta_description: setMetaDescription, alt_text: setAltText, wc_product_field: setWcField, wc_category_field: setWcField, content_append: setContent, content_replace: setContent };

export async function readField(task) {
  const fn = READ[task.fieldType];
  if (!fn) throw new Error(`No CMS adapter read for fieldType "${task.fieldType}"`);
  return fn(task);
}

export async function writeField(task, value) {
  const fn = WRITE[task.fieldType];
  if (!fn) throw new Error(`No CMS adapter write for fieldType "${task.fieldType}"`);
  return fn(task, value);
}
