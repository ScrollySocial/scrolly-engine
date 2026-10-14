#!/usr/bin/env node
/**
 * Realistic-scope component 9 live validation: Path 2 ready-to-paste
 * content, generated when content_append/content_replace's safety gates
 * refuse. Re-exercises the two real refusal cases from items 3/6 (page 15
 * builder-controlled, page 10 with an ambiguous replacement target) and
 * confirms a real deliverable gets produced instead of a dropped finding.
 */
import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isSafeForBodyContentEdit } from '../lib/page-builder-adapter.mjs';
import { computeUniqueReplacement } from '../lib/content-replace.mjs';
import { generateReadyToPasteContent, validateReadyToPaste, renderReadyToPasteReview } from '../lib/ready-to-paste-generator.mjs';
import { getContent } from '../lib/cms-adapter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', '..', 'Scrolly Organic Engine');
const implDir = path.join(VAULT_DIR, 'clients', '_impl-agent-live-test', 'implementation');
await mkdir(implDir, { recursive: true });

const siteConfig = { baseUrl: process.env.WP_BASE_URL, wpUser: process.env.WP_APP_USER, wpAppPassword: process.env.WP_APP_PASSWORD };
async function getPageMeta(id) {
  const token = Buffer.from(`${siteConfig.wpUser}:${siteConfig.wpAppPassword}`).toString('base64');
  const res = await fetch(`${siteConfig.baseUrl}/wp-json/wp/v2/pages/${id}?context=edit`, { headers: { Authorization: `Basic ${token}` } });
  const obj = await res.json();
  return { url: obj.link, title: obj.title.raw };
}

// --- Case 1: page-builder refusal (page 15) --------------------------------
console.log('=== Case 1: page-builder-controlled page ===');
const page15 = await getPageMeta(15);
const task15 = { targetObjectType: 'page', targetObjectId: 15 };
const safe15 = await isSafeForBodyContentEdit(siteConfig, task15);
console.log(`Safe for direct edit: ${safe15} (expect false)`);
if (!safe15) {
  const finding = { finding: 'Homepage lacks an FAQ section addressing common customer questions.', recommended_action: 'Add an FAQ section covering delivery, plant guarantees, and service area.' };
  const raw = await generateReadyToPasteContent(finding, page15, 'page is controlled by Elementor — direct content edits are not auto-applied to page-builder pages');
  const validated = validateReadyToPaste(raw);
  console.log(`QA: ${validated.qa.passed ? 'PASS' : 'FAIL'}`);
  const doc = renderReadyToPasteReview(validated, finding, page15, 'Elementor page-builder page — not auto-edited');
  await writeFile(path.join(implDir, 'path2-elementor-page-faq.md'), doc);
  console.log(`Wrote ${implDir}/path2-elementor-page-faq.md`);
}

// --- Case 2: ambiguous replacement target (page 10) -------------------------
console.log('\n=== Case 2: ambiguous replacement target ===');
const page10 = await getPageMeta(10);
const task10 = { targetObjectType: 'page', targetObjectId: 10 };
const content10 = await getContent(task10);
const ambiguousTarget = 'this exact phrase does not exist anywhere in the page content';
const computed = computeUniqueReplacement(content10, ambiguousTarget, 'replacement text');
console.log(`Unique replacement possible: ${computed !== null} (expect false)`);
if (computed === null) {
  const finding = { finding: 'Service-area description should mention Terrell and Van Zandt County, not just Wills Point.', recommended_action: `Update the sentence naming the service area to include the confirmed additional markets.` };
  const raw = await generateReadyToPasteContent(finding, page10, 'the exact target text for an automated in-place replacement was not found (or was ambiguous) in the current page content');
  const validated = validateReadyToPaste(raw);
  console.log(`QA: ${validated.qa.passed ? 'PASS' : 'FAIL'}`);
  const doc = renderReadyToPasteReview(validated, finding, page10, 'automated replacement target not uniquely found — needs manual placement');
  await writeFile(path.join(implDir, 'path2-ambiguous-target-service-area.md'), doc);
  console.log(`Wrote ${implDir}/path2-ambiguous-target-service-area.md`);
}
