/**
 * Page-builder detection (methodology/implementation-agent.md §7/§13).
 *
 * The rule: "we don't automatically modify page-builder body content" is a
 * per-page decision, not a per-site one — a builder-controlled page still
 * gets full Path 1 treatment for field-level changes (title/meta/alt/WC
 * fields never touch page body content regardless of builder). This module
 * exists purely to answer one question for the content-editing task types
 * that DO touch body content (native heading/copy/FAQ edits): is THIS
 * page's body safe to write to directly, or must it route to Path 2
 * (ready-to-paste content) instead?
 *
 * V1: detects Elementor only (the builder actually verified in this
 * project — both the real scrollyseo.com storefront and this test site use
 * it). Divi/Beaver Builder/etc. are unverified — treat any unrecognized
 * builder signal as "unsafe to auto-edit" (fail closed), not as "native."
 */

import { getPostMeta } from './wp-client.mjs';
import { getTemplateSuffix } from './shopify-client.mjs';

const MODE = () => process.env.CMS_MODE || 'mock';

/**
 * @returns {Promise<'elementor'|'native'>}
 */
export async function detectPageBuilder(siteConfig, objectType, objectId) {
  if (MODE() === 'mock') {
    // Mock site has no builder-detection state modeled — every mock page is
    // native. Real per-page builder-status testing happens in CMS_MODE=live
    // against a real Elementor page; adding mock support isn't needed to
    // prove this component (unlike the CMS field lifecycle, there's no
    // multi-step write/rollback sequence here to rehearse safely first).
    return 'native';
  }
  const editMode = await getPostMeta(siteConfig, objectType, objectId, '_elementor_edit_mode');
  return editMode === 'builder' ? 'elementor' : 'native';
}

/**
 * Shopify's structural equivalent of Elementor detection (verified against
 * the live Admin GraphQL schema, not assumed): every content-bearing
 * resource carries `templateSuffix`. null means the default Liquid
 * template, which reliably renders `body`/`descriptionHtml`. Non-null means
 * a custom (possibly JSON/sectioned Online Store 2.0) template that may not
 * render it at all — same fail-closed philosophy as an unrecognized
 * WordPress builder: treat as unsafe rather than guess.
 * @returns {Promise<'custom_template'|'default_template'>}
 */
export async function detectShopifyTemplate(siteConfig, objectType, objectId) {
  const suffix = await getTemplateSuffix(siteConfig, objectType, objectId);
  return suffix === null ? 'default_template' : 'custom_template';
}

/** Convenience wrapper matching the task object shape used elsewhere — dispatches by siteConfig.platform. */
export async function isSafeForBodyContentEdit(siteConfig, task) {
  if (siteConfig.platform === 'shopify') {
    const template = await detectShopifyTemplate(siteConfig, task.targetObjectType, task.targetObjectId);
    return template === 'default_template';
  }
  const builder = await detectPageBuilder(siteConfig, task.targetObjectType, task.targetObjectId);
  return builder === 'native';
}
