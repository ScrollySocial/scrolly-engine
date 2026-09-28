// Prints goal gap + This Week (before and after a Weekly Review) for the 5 harness businesses, using the real modules.
// Run: node automation/k1-launch/test/this-week-report.mjs
import { computePlanView } from '../src/plan-view.mjs';
import { computeThisWeek, computeGoalGap } from '../src/this-week.mjs';
import { computeModule1Results } from '../../club/lib/module1.mjs';
import { buildProfile, CHANNELS, WHERE_THEY_BUY, channelFor } from '../src/plan-view.mjs';
import { computeWeeklyReview, weeklyReviewMetrics } from '../src/weekly-review-adapter.mjs';
import { newGrowthReviewInput } from '../../club/lib/growth-review-schema.mjs';

export const BUSINESSES = [
  { s: { business: 'Fix-It Frank (handyman)', route: 'services', stage: 'C', offer: 'Home repair jobs', price: 250, audience: 'Homeowners', where: 'quote', channel: 'instagram', found: ['referral', 'facebook'] }, chal: { started: true, day: 9, revenue: 250 } },
  { s: { business: 'Ops Clarity (consultant)', route: 'services', stage: 'B', offer: 'Operations audit', price: 500, audience: 'Agency owners', where: 'booking', channel: 'linkedin', found: ['linkedin'] }, chal: { started: true, day: 10, revenue: 500 } },
  { s: { business: 'Paw Tees (Etsy)', route: 'marketplace_first', stage: 'C', offer: 'Dog-lover T-shirts', price: 28, audience: 'Dog owners', where: 'etsy', channel: 'instagram', found: ['marketplace_search', 'instagram'] }, chal: { started: true, day: 16, revenue: 532 } },
  { s: { business: 'Plan Pretty (digital)', route: 'digital_product', stage: 'B', offer: 'Notion budget template', price: 25, audience: 'Young professionals', where: 'own_site', channel: 'instagram', found: [] }, chal: { started: true, day: 8, revenue: 175 } },
  { s: { business: 'Golden Hour Studio (photographer)', route: 'services', stage: 'C', offer: 'Family and portrait sessions', price: 350, audience: 'Local families', where: 'booking', channel: 'instagram', found: ['instagram', 'referral'] }, chal: { started: true, day: 12, revenue: 700 } },
];

// Week's check-in: reach and interest, no sale yet -> a mid-funnel constraint (shows This Week changing).
function reviewFor(s) {
  const r = computeModule1Results(buildProfile(s));
  const m = weeklyReviewMetrics(r);
  const vals = [1400, 9, 0];
  const input = { ...newGrowthReviewInput(), activity: { channelsUsed: [], actions: ['published_content'], capacityConstrained: false, notes: null },
    revenueUsd: 0, salesCount: 0, pathMetrics: m.map((x, i) => ({ label: x.label, value: i === m.length - 1 ? 0 : vals[i] ?? null, known: true })) };
  return { rec: { periodEnd: '2026-10-04' }, d: computeWeeklyReview(r, { primaryChannelLabel: CHANNELS[channelFor(s)], destinationLabel: WHERE_THEY_BUY[s.where] }, input) };
}

const show = (tw) => [
  `  focus (${tw.focusSource}): ${tw.focus}`,
  `  mode: ${tw.mode} | key: ${tw.executionKey.route} + ${tw.executionKey.channel} + ${tw.executionKey.constraint}`,
  `  create: ${tw.content.items.map((i) => `${i.count} ${i.kind}`).join(', ')} :: ${tw.content.angle}`,
  `  conversion: ${tw.conversion}`,
  `  business move: ${tw.business}`,
  `  track: ${tw.track.metrics.join(', ')} + ${tw.track.alsoTrack.join(', ')}`,
].join('\n');

for (const { s, chal } of BUSINESSES) {
  const pv = computePlanView(s);
  const g = computeGoalGap(s, chal);
  console.log(`\n================ ${s.business}, $${s.price}, day ${chal.day}`);
  console.log(`PLAN: ${pv.number.requiredSales} ${pv.number.saleNoun} | ${pv.funnel.steps.slice(1).map((x) => `about ${x.base} ${x.label}`).join(', ')} | reach ${pv.funnel.reach.low}-${pv.funnel.reach.high} ${pv.funnel.reach.label}`);
  console.log(`  channel: ${pv.channel.label} | priority: ${pv.firstPriority.label} | economics: ${pv.economics.note ? 'high-volume + AOV scenarios' : pv.economics.trustNote ? 'trust note' : 'none'}`);
  console.log(`  work on now: ${pv.workOnNow.join(' / ')}`);
  console.log(`  not yet: ${pv.notYet.join('; ')}`);
  console.log(`  cross-post: ${pv.crossPost}`);
  console.log(`CHECK-IN ASKS: ${weeklyReviewMetrics(computeModule1Results(buildProfile(s))).slice(0, -1).map((m) => `${m.label} [${m.tier}]`).join(', ')}, revenue, sales, created, placements`);
  console.log(`GOAL GAP: ${g.headline} | ${g.toGo} | ${g.salesLine}${g.paceLine ? ' ' + g.paceLine : ''}${g.projection ? '\n          ' + g.projection : ''}`);
  console.log('THIS WEEK (before any check-in):\n' + show(computeThisWeek(s, pv, null, chal, 'Do your first check-in at the end of your first week.')));
  const latest = reviewFor(s);
  console.log(`CHECK-IN RESULT: ${latest.d.constraint.label}`);
  console.log('THIS WEEK (after that check-in):\n' + show(computeThisWeek(s, pv, latest, chal, 'Next check-in: Sunday, Oct 11.')));
}
