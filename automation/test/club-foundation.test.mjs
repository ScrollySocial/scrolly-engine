import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  metric, newMemberGrowthState, captureJoinedBaseline, startChallengeSnapshot,
  updateCurrentMetric, analyzeWhenReady, createMemberGrowthStore, createOverviewService,
  createManualMetricsService,
} from '../club/lib/member-growth-state.mjs';
import { signAccessToken } from '../club/lib/club-access-token.mjs';

process.env.CLUB_ACCESS_TOKEN_SECRET ||= 'foundation-test-secret';

test('unknown and zero are distinct metric states', () => {
  assert.deepEqual(metric(), { value: null, state: 'unknown', observedAt: null });
  assert.deepEqual(metric(0, 'zero'), { value: 0, state: 'zero', observedAt: null });
  assert.throws(() => metric(0, 'unknown'), /null value/);
});

test('Joined Scrolly baseline is immutable after first capture', () => {
  const state = newMemberGrowthState();
  captureJoinedBaseline(state, { revenue: metric(0, 'zero') }, '2026-01-01T00:00:00.000Z');
  captureJoinedBaseline(state, { revenue: metric(500, 'customer-reported') }, '2026-02-01T00:00:00.000Z');
  assert.equal(state.joinedScrollyBaseline.metrics.revenue.value, 0);
  assert.equal(state.joinedScrollyBaseline.capturedAt, '2026-01-01T00:00:00.000Z');
});

test('each Challenge attempt receives a fresh start snapshot', () => {
  const state = newMemberGrowthState();
  updateCurrentMetric(state, 'revenue', metric(10, 'customer-reported'));
  startChallengeSnapshot(state, { challengeId: 'attempt-1', capturedAt: '2026-01-01T00:00:00.000Z' });
  updateCurrentMetric(state, 'revenue', metric(25, 'customer-reported'));
  startChallengeSnapshot(state, { challengeId: 'attempt-2', capturedAt: '2026-02-01T00:00:00.000Z' });
  assert.equal(state.challengeStarts[0].metrics.revenue.value, 10);
  assert.equal(state.challengeStarts[1].metrics.revenue.value, 25);
});

test('current metric updates append time-series history', () => {
  const state = newMemberGrowthState();
  updateCurrentMetric(state, 'sales', metric(0, 'zero'), '2026-01-01T00:00:00.000Z');
  updateCurrentMetric(state, 'sales', metric(2, 'observed'), '2026-01-08T00:00:00.000Z');
  assert.equal(state.currentMetrics.sales.value, 2);
  assert.deepEqual(state.history.map((point) => point.value), [0, 2]);
});

test('token identity isolates member Overview state', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'club-foundation-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = createMemberGrowthStore(dir);
  const one = newMemberGrowthState(); updateCurrentMetric(one, 'revenue', metric(11, 'customer-reported'));
  const two = newMemberGrowthState(); updateCurrentMetric(two, 'revenue', metric(22, 'customer-reported'));
  await store.save('customer-101', one); await store.save('customer-202', two);
  await mkdir(path.join(dir, 'customer-101'), { recursive: true });
  await writeFile(path.join(dir, 'customer-101', 'channel-plan.json'), '{}');
  const overview = createOverviewService({ store, membersDir: dir });
  const result = await overview(signAccessToken({ customerId: 101, email: 'one@example.test' }));
  assert.equal(result.metrics.revenue.value, 11);
  assert.equal(result.identity.customerId, 101);
  assert.equal(result.sections.organicGrowth.status, 'available');
});

test('model analysis is not called when required connection or data is absent', async () => {
  let calls = 0;
  const result = await analyzeWhenReady({
    state: newMemberGrowthState(),
    requiredConnections: ['analytics'],
    requiredMetrics: ['visits'],
    analyze: async () => { calls += 1; return 'should not run'; },
  });
  assert.equal(calls, 0);
  assert.equal(result.status, 'not_enough_data');
  assert.deepEqual(result.missingConnections, ['analytics']);
  assert.deepEqual(result.missingMetrics, ['visits']);
});

test('Overview uses the existing Club token handoff and session convention', async () => {
  const html = await readFile(new URL('../club/public/overview.html', import.meta.url), 'utf8');
  assert.match(html, /params\.get\('token'\)/);
  assert.match(html, /scrolly_club_access_token/);
  assert.doesNotMatch(html, /params\.get\('access_token'\)|scrolly_club_token/);
});

test('manual metric submission preserves unknown/zero, baseline, current, and history', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'club-metrics-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = createMemberGrowthStore(dir);
  const submit = createManualMetricsService({ store });
  const token = signAccessToken({ customerId: 303, email: 'metrics@example.test' });
  const first = await submit({ accessToken: token, values: { revenueUsd: 0, salesCount: 0, siteVisits: null } });
  assert.equal(first.metrics.revenueUsd.state, 'zero');
  assert.equal(first.metrics.siteVisits.state, 'unknown');
  assert.equal(first.metrics.conversionRate.state, 'unknown');
  const second = await submit({ accessToken: token, values: { revenueUsd: 125, salesCount: 4, siteVisits: 80 } });
  assert.equal(second.baseline.metrics.revenueUsd.value, 0);
  assert.equal(second.metrics.revenueUsd.value, 125);
  assert.equal(second.metrics.revenueUsd.state, 'customer-reported');
  assert.equal(second.metrics.conversionRate.value, 5);
  assert.equal(second.metrics.conversionRate.state, 'observed');
  assert.equal(second.history.length, 8);
});

test('manual metric submissions are isolated by token identity', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'club-metric-identity-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = createMemberGrowthStore(dir);
  const submit = createManualMetricsService({ store });
  await submit({ accessToken: signAccessToken({ customerId: 401, email: 'one@example.test' }), values: { revenueUsd: 10 } });
  await submit({ accessToken: signAccessToken({ customerId: 402, email: 'two@example.test' }), values: { revenueUsd: 20 } });
  assert.equal((await store.load('customer-401')).currentMetrics.revenueUsd.value, 10);
  assert.equal((await store.load('customer-402')).currentMetrics.revenueUsd.value, 20);
});

test('manual metric submission rejects negative or non-numeric values without saving', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'club-invalid-metrics-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = createMemberGrowthStore(dir);
  const submit = createManualMetricsService({ store });
  const result = await submit({ accessToken: signAccessToken({ customerId: 501, email: 'invalid@example.test' }), values: { revenueUsd: -1 } });
  assert.deepEqual(result, { ok: false, reason: 'invalid_revenueUsd' });
  assert.deepEqual(await store.load('customer-501'), newMemberGrowthState());
});

test('Website page shares the Club token convention and explicit unknown copy', async () => {
  const html = await readFile(new URL('../club/public/website.html', import.meta.url), 'utf8');
  assert.match(html, /scrolly_club_access_token/);
  assert.match(html, /Not enough data yet/);
  assert.match(html, /A real zero stays zero; an empty field stays unknown/);
  assert.match(html, /Conversion rate is calculated from sales and site visits/);
  assert.doesNotMatch(html, /name="conversionRate"/);
});

test('calculated conversion is zero only when known sales are zero and visits are positive', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'club-zero-conversion-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const submit = createManualMetricsService({ store: createMemberGrowthStore(dir) });
  const result = await submit({
    accessToken: signAccessToken({ customerId: 601, email: 'zero@example.test' }),
    values: { salesCount: 0, siteVisits: 25 },
  });
  assert.equal(result.metrics.conversionRate.value, 0);
  assert.equal(result.metrics.conversionRate.state, 'zero');
});

test('every Organic Growth module provides a route back to the V2 shell', async () => {
  // Navigation used to be copied verbatim into each page's own <nav> markup
  // (and drifted: module3-6 all wrongly highlighted "Organic Growth" as the
  // active link no matter which module was actually open). It's now
  // injected at runtime by one shared club-shell.js, so every page gets
  // real hrefs by construction and can't drift page-to-page -- verify each
  // page loads that shared shell, and that the shell itself carries the
  // real primary routes, rather than grepping for literal hrefs no page
  // contains in its own static markup anymore.
  //
  // 2026-09-15 sprint: the primary nav is now Dashboard / My Plan /
  // Performance / Connections only. Content Studio is no longer a
  // Club-permanent nav destination (content generation belongs to the
  // $1K Challenge Toolkit) -- the route itself still exists and still
  // loads (verified separately, it's just not in NAV_ITEMS). "Growth
  // Review" was relabeled "Performance" to match what /club/performance
  // actually contains. Quick Actions was removed outright -- three
  // navigation systems (WP header, Club sidebar, Quick Actions) was one
  // too many.
  const shellJs = await readFile(new URL('../club/public/club-shell.js', import.meta.url), 'utf8');
  assert.match(shellJs, /href:\s*'\/club\/overview'/, 'club-shell.js should link to Dashboard');
  assert.match(shellJs, /href:\s*'\/club\/modules'/, 'club-shell.js should expose My Plan');
  assert.match(shellJs, /label:\s*'Performance',\s*href:\s*'\/club\/performance'/, 'club-shell.js should expose Performance (not "Growth Review")');
  assert.match(shellJs, /href:\s*'\/club\/connections'/, 'club-shell.js should expose Connections');
  assert.doesNotMatch(shellJs, /club-shell-qa-btn/, 'Quick Actions must be fully removed, not just hidden');
  for (const name of ['index.html', 'module2.html', 'module3.html', 'module4.html', 'module5.html', 'module6.html']) {
    const html = await readFile(new URL(`../club/public/${name}`, import.meta.url), 'utf8');
    assert.match(html, /<script src="\/club\/club-shell\.js">/, `${name} should load the shared Club shell`);
  }
});

test('Content Studio route still works when reached directly even though it is no longer in primary nav', async () => {
  const bridgeServer = await readFile(new URL('../bridge-server.mjs', import.meta.url), 'utf8');
  assert.match(bridgeServer, /url\.pathname === '\/club\/content'/, 'the route must still be served, not deleted');
});

test('old Website & Conversion and Growth Review links still work after consolidating into Performance', async () => {
  // "Preserve existing capabilities and working links during this
  // consolidation" -- these routes must keep resolving, not 404, even
  // though they're no longer primary nav destinations.
  const bridgeServer = await readFile(new URL('../bridge-server.mjs', import.meta.url), 'utf8');
  assert.match(bridgeServer, /url\.pathname === '\/club\/website'/);
  assert.match(bridgeServer, /url\.pathname === '\/club\/review'/);
  assert.match(bridgeServer, /Location: `\/club\/performance/);
  const performance = await readFile(new URL('../club/public/performance.html', import.meta.url), 'utf8');
  assert.match(performance, /tab-numbers/, 'Performance should carry the former Website & Conversion view');
  assert.match(performance, /tab-review/, 'Performance should carry the former Growth Review view');
});

test('Growth Review and Connections are real pages, not dead Overview anchors', async () => {
  const review = await readFile(new URL('../club/public/review.html', import.meta.url), 'utf8');
  const connections = await readFile(new URL('../club/public/connections.html', import.meta.url), 'utf8');
  // Growth Review is now a real, dynamically-wired page (Module 7): it reads
  // its own /club/review/state route and gates on Module 6 completion --
  // not the old static placeholder that wrongly pointed at Website &
  // Conversion as the prerequisite (that was a real bug, now fixed).
  assert.match(review, /fetch\('\/club\/review\/state'/);
  assert.match(review, /module6_not_complete/);
  assert.doesNotMatch(review, /Open Website &amp; Conversion/);
  // Connections' copy no longer implies manual tracking is locked behind a
  // connection that doesn't exist yet -- that was a real, live-verified bug
  // (the launch-readiness audit), now fixed. It should say what a customer
  // can already do today, not what they're missing. Re-checked 2026-09-15:
  // Store/Revenue and Website Analytics were also merged into one "Your
  // Store & Website" card (member-facing, not a technical split) as part
  // of that sprint's Connections IA pass.
  assert.match(connections, /enter revenue, sales, and visits (yourself|manually)/);
  assert.match(connections, /Optional, read-only, disconnect anytime/);
  assert.doesNotMatch(connections, /unlock revenue\/conversion tracking/);
  assert.doesNotMatch(connections, /unlock site traffic analysis/);
  assert.doesNotMatch(connections, /measure your growth automatically/, 'must not overclaim automatic measurement');
});
