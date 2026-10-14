#!/usr/bin/env node
/**
 * Realistic-scope component 4 live validation: Path 3 internal-link plans.
 * No CMS write/rollback here — this component only reads content and
 * generates a plan. Test order per implementation-agent.md's documented
 * plan: prove QA catches a deliberately-broken plan BEFORE trusting the
 * real LLM-generated happy path.
 */
import 'dotenv/config';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateLinkPlan, generateInternalLinkPlan, renderLinkPlanReview } from '../lib/internal-link-planner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT_DIR = path.resolve(__dirname, '..', '..', '..', 'Scrolly Organic Engine');

const siteConfig = { baseUrl: process.env.WP_BASE_URL, wpUser: process.env.WP_APP_USER, wpAppPassword: process.env.WP_APP_PASSWORD };

async function getPage(id) {
  const token = Buffer.from(`${siteConfig.wpUser}:${siteConfig.wpAppPassword}`).toString('base64');
  const res = await fetch(`${siteConfig.baseUrl}/wp-json/wp/v2/pages/${id}?context=edit`, { headers: { Authorization: `Basic ${token}` } });
  const obj = await res.json();
  return { url: obj.link, title: obj.title.raw, content: obj.content.raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() };
}

const pages = [await getPage(10), await getPage(18)];
console.log('Pages loaded:', pages.map((p) => `${p.title} (${p.url})`).join(', '));

// --- Step 1: prove QA catches a deliberately-broken plan --------------------
const brokenPlan = [
  {
    sourceUrl: pages[0].url,
    destinationUrl: pages[1].url,
    anchorText: 'landscape design',
    contextSentence: 'This sentence does not actually appear anywhere in the source page content.',
    placement: 'test',
    rationale: 'test',
  },
];
const brokenResult = validateLinkPlan(brokenPlan, pages);
const brokenCorrectlyFailed = brokenResult.every((e) => e.qa.passed === false);
console.log(`Deliberately-broken plan correctly failed QA: ${brokenCorrectlyFailed}`);
if (!brokenCorrectlyFailed) {
  console.error('QA did not catch the broken plan — do not trust the real generation below.');
  process.exit(1);
}

// --- Step 2: real LLM-generated plan -----------------------------------
const rawPlan = await generateInternalLinkPlan(pages);
console.log(`LLM proposed ${rawPlan.length} link opportunity(ies).`);
const validated = validateLinkPlan(rawPlan, pages);

for (const entry of validated) {
  console.log(`\n${entry.sourceUrl} -> ${entry.destinationUrl}`);
  console.log(`  anchor: "${entry.anchorText}"`);
  console.log(`  context: "${entry.contextSentence}"`);
  console.log(`  placement: ${entry.placement}`);
  console.log(`  rationale: ${entry.rationale}`);
  console.log(`  QA: ${entry.qa.passed ? 'PASS' : 'FAIL'}${entry.qa.passed ? '' : ' — ' + entry.qa.checks.filter((c) => !c.passed).map((c) => c.detail).join('; ')}`);
}

const allPassed = validated.length > 0 && validated.every((e) => e.qa.passed);
console.log(`\nOverall: ${validated.length} plan(s), all QA-passed: ${allPassed}`);

const implDir = path.join(VAULT_DIR, 'clients', '_impl-agent-live-test', 'implementation');
await mkdir(implDir, { recursive: true });
await writeFile(path.join(implDir, 'internal-link-plan.md'), renderLinkPlanReview(validated));
console.log(`Wrote ${implDir}/internal-link-plan.md`);
