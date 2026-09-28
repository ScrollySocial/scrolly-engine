// Harness: run the EXISTING Club logic (unchanged) + the weekly-review adapter against 5 realistic businesses.
// Purpose: find edge cases before any UI is built. Run: node automation/k1-launch/test/harness.mjs
import { newBusinessProfile, assertValidBusinessProfile } from '../../club/lib/business-profile-schema.mjs';
import { computeModule1Results } from '../../club/lib/module1.mjs';
import { newGrowthReviewInput } from '../../club/lib/growth-review-schema.mjs';
import { weeklyReviewMetrics, computeWeeklyReview } from '../src/weekly-review-adapter.mjs';

const P = (o) => ({ ...newBusinessProfile(), ...o });
const businesses = [
  { name: 'Handyman', channel: 'Facebook', destination: 'a call or text', p: P({ businessName: 'Fix-It Frank', route: 'services', stage: 'C', offer: 'Home repair jobs', price: 250, audience: 'Homeowners in town', currentRevenueUsd: 600, sellingSurfaces: ['phone', 'in_person'], discoveryChannels: ['referral', 'facebook_groups'] }) },
  { name: 'Consultant', channel: 'LinkedIn', destination: 'a booked discovery call', p: P({ businessName: 'Ops Clarity', route: 'services', stage: 'B', offer: 'Operations audit', price: 500, audience: 'Agency owners', sellingSurfaces: ['calendly'], discoveryChannels: ['linkedin'] }) },
  { name: 'Etsy POD', channel: 'Instagram + Facebook', destination: 'your Etsy listing', p: P({ businessName: 'Paw Tees', route: 'marketplace_first', stage: 'C', offer: 'Dog-lover T-shirts', price: 28, audience: 'Dog owners', currentRevenueUsd: 300, sellingSurfaces: ['etsy'], discoveryChannels: ['etsy_search', 'instagram'] }) },
  { name: 'Digital product', channel: 'Instagram + Facebook', destination: 'your checkout page', p: P({ businessName: 'Plan Pretty', route: 'digital_product', stage: 'B', offer: 'Notion budget template', price: 25, audience: 'Young professionals', sellingSurfaces: ['own_site'], discoveryChannels: [] }) },
  { name: 'Photographer', channel: 'Instagram + Facebook', destination: 'your booking link', p: P({ businessName: 'Golden Hour Studio', route: 'services', stage: 'C', offer: 'Family and portrait sessions', price: 350, audience: 'Local families', currentRevenueUsd: 700, sellingSurfaces: ['booking'], discoveryChannels: ['instagram', 'referral'] }) },
];

const k = (n) => (n == null ? '?' : Number(n).toLocaleString('en-US'));
for (const b of businesses) {
  console.log(`\n================ ${b.name} (${b.p.route}, stage ${b.p.stage}, $${b.p.price})`);
  try {
    assertValidBusinessProfile(b.p);
    const r = computeModule1Results(b.p);
    console.log(`Plan: ${r.math.requiredSales} sales at $${r.math.price} -> $${r.math.resultingRevenue} | highTxnCount=${r.math.isHighTransactionCount}`);
    console.log('Funnel (base):', r.math.scenarios.base.map((s) => `${s.stage}=${k(s.count)}`).join('  '));
    console.log('Funnel (conservative/upside reach):', k(r.math.scenarios.conservative?.[0]?.count), '/', k(r.math.scenarios.upside?.[0]?.count));
    console.log('Starting state:', r.startingState.title, '| data:', r.dataConfidence.title);
    console.log('First priority:', r.firstPriority.label, '::', r.firstPriority.rationale);
    console.log('Interpretation:', r.interpretation);
    console.log('What exists:', r.startingPointPlan.whatExists.join('; '));
    console.log("What's unknown:", r.startingPointPlan.whatsUnknown.join('; '));
    const metrics = weeklyReviewMetrics(r);
    console.log('Check-in metrics:', metrics.map((m) => `${m.label}[${m.tier}]`).join(', '));

    // Scenario A: posted, reach known but low interest.  Scenario B: interest but no sales.  Scenario C: a sale.
    const base = () => ({ ...newGrowthReviewInput(), activity: { channelsUsed: [], actions: ['published_content'], capacityConstrained: false, notes: null } });
    const val = (vals) => metrics.map((m, i) => ({ label: m.label, value: vals[i] ?? null, known: vals[i] != null }));
    const scenarios = {
      'reach, no interest': { ...base(), pathMetrics: val([900, 0, 0]), revenueUsd: 0, salesCount: 0 },
      'interest, no sale': { ...base(), pathMetrics: val([900, 12, 3]), revenueUsd: 0, salesCount: 0 },
      'one sale': { ...base(), pathMetrics: val([900, 12, 3]), revenueUsd: b.p.price, salesCount: 1 },
      'did nothing, reported nothing': { ...newGrowthReviewInput() },
    };
    for (const [label, input] of Object.entries(scenarios)) {
      const w = computeWeeklyReview(r, { primaryChannelLabel: b.channel, destinationLabel: b.destination }, input);
      console.log(`  [${label}] -> ${w.constraint.label} | focus: ${w.nextWeekFocus} | test: ${w.test}`);
    }
  } catch (e) {
    console.log('ERROR:', e.message);
  }
}

// Edge case the launch must reject or handle: price missing (stage A is out of scope, but a blank field can still arrive)
console.log('\n================ Edge: price missing');
try { const r = computeModule1Results(P({ route: 'services', stage: 'B', offer: 'x', price: null })); console.log('No error. requiredSales =', r.math.requiredSales); } catch (e) { console.log('ERROR (must be blocked in the form):', e.message); }
