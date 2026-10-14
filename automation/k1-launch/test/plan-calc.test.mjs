// My $1K Plan calculator math. Run: node automation/k1-launch/test/plan-calc.test.mjs
import assert from 'node:assert/strict';
import { computePlanCalc, modelForSaved } from '../src/plan-calc.mjs';

const ALL = ['instagram', 'facebook', 'tiktok', 'youtube', 'pinterest'];
const base = { goal: 1000, avgSale: 75, days: 30, videosPerDay: 3, platforms: ALL, scenario: 'planning' };
let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log('ok  ', name); };

t('A: planning example', () => {
  const r = computePlanCalc(base);
  assert.equal(r.sales, 14);
  assert.equal(r.perDay, 0.5);
  assert.equal(r.perWeek, 3.3);
  assert.equal(r.funnel[0].count, 280); // sales-page visitors
  assert.equal(r.views, 18667);
  assert.equal(r.originals, 90);
  assert.equal(r.published, 450);
  assert.equal(r.viewsPerPost, 42);
});

t('B: Instagram only', () => {
  const r = computePlanCalc({ ...base, platforms: ['instagram'] });
  assert.equal(r.published, 90);
  assert.equal(r.views, 18667); // views needed don't depend on platforms
  assert.equal(r.viewsPerPost, 208); // 18,667 / 90 = 207.4 -> 208
});

t('C: scenarios change visitors/views, not sales', () => {
  const c = computePlanCalc({ ...base, scenario: 'conservative' });
  const p = computePlanCalc({ ...base, scenario: 'planning' });
  const s = computePlanCalc({ ...base, scenario: 'strong' });
  assert.equal(c.sales, 14); assert.equal(p.sales, 14); assert.equal(s.sales, 14);
  assert.deepEqual([c.funnel[0].count, c.views, c.viewsPerPost], [700, 140000, 312]); // 14/.02, 700/.005, /450
  assert.deepEqual([s.funnel[0].count, s.views, s.viewsPerPost], [200, 6667, 15]); // 14/.07, 200/.03, /450
  assert.ok(c.views > p.views && p.views > s.views);
});

t('D: average sale flows downstream', () => {
  const r = computePlanCalc({ ...base, avgSale: 40 });
  assert.equal(r.sales, 25);
  assert.equal(r.funnel[0].count, 500);
  assert.equal(r.views, 33334); // 500 / .015 = 33,333.3 -> 33,334
  assert.equal(r.viewsPerPost, 75); // 33,334 / 450 = 74.1 -> 75
});

t('E: custom rates override the scenario', () => {
  const r = computePlanCalc({ ...base, scenario: 'conservative', custom: { viewToVisit: 2, visitToSale: 10 } });
  assert.equal(r.rateSource, 'custom');
  assert.equal(r.funnel[0].count, 140); // 14 / .10
  assert.equal(r.views, 7000); // 140 / .02
  assert.equal(r.viewsPerPost, 16); // 7,000 / 450 = 15.6 -> 16
});

t('validation: no NaN/Infinity, clear reasons', () => {
  const zeroSale = computePlanCalc({ ...base, avgSale: 0 });
  assert.equal(zeroSale.sales, null); assert.ok(zeroSale.issues.plan);
  const noPlatforms = computePlanCalc({ ...base, platforms: [] });
  assert.equal(noPlatforms.published, null); assert.equal(noPlatforms.viewsPerPost, null); assert.ok(noPlatforms.issues.distribution);
  assert.equal(noPlatforms.views, 18667); // views still shown
  const noVideos = computePlanCalc({ ...base, videosPerDay: 0 });
  assert.equal(noVideos.published, 0); assert.equal(noVideos.viewsPerPost, null); assert.ok(noVideos.issues.viewsPerPost);
  const badCustom = computePlanCalc({ ...base, custom: { viewToVisit: 0, visitToSale: 5 } });
  assert.equal(badCustom.views, null); assert.ok(badCustom.issues.rates);
  const blanks = computePlanCalc({ goal: '', avgSale: '', days: '', videosPerDay: '', platforms: ALL });
  for (const v of Object.values(blanks)) if (typeof v === 'number') assert.ok(Number.isFinite(v));
  const negDays = computePlanCalc({ ...base, days: -5 });
  assert.equal(negDays.sales, null); assert.equal(negDays.originals, null);
  assert.equal(computePlanCalc({ ...base, goal: 1000, avgSale: 12.5 }).sales, 80); // no float-noise 81
});

t('router model mapping (read-only)', () => {
  assert.equal(modelForSaved({ route: 'digital_product', where: 'own_site' }), 'online_checkout');
  assert.equal(modelForSaved({ route: 'marketplace_first', where: 'etsy' }), 'online_checkout');
  assert.equal(modelForSaved({ route: 'services', where: 'booking' }), 'lead_service');
  assert.equal(modelForSaved({ route: 'local_hybrid', where: 'phone' }), 'lead_service');
});

console.log(`\n${passed} passed`);
