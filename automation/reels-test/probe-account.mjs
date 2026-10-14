// Read-only: account plan, monthly usage, and candidate TikTok Actors currently in the Apify Store.
import { apify } from './apify.mjs';

const me = (await apify('/users/me')).data;
console.log('plan:', me.plan?.id, '| monthly usage credit USD:', me.plan?.monthlyUsageCreditsUsd, '| max monthly usage USD:', me.plan?.maxMonthlyUsageUsd);
try {
  const lim = (await apify('/users/me/limits')).data;
  console.log('current cycle usage USD:', lim.current?.monthlyUsageUsd, '| limit USD:', lim.limits?.maxMonthlyUsageUsd, '| cycle:', lim.monthlyUsageCycle?.startAt, '->', lim.monthlyUsageCycle?.endAt);
} catch (e) { console.log('limits:', e.message); }

for (const search of ['tiktok trends', 'tiktok trending', 'tiktok creative center', 'tiktok sound', 'tiktok scraper']) {
  const res = (await apify('/store', { query: { search, limit: 12, sortBy: 'relevance' } })).data;
  console.log(`\n== store search "${search}" (${res.total} total)`);
  for (const a of res.items) {
    const p = a.currentPricingInfo || {};
    const events = p.pricingPerEvent?.actorChargeEvents ? Object.entries(p.pricingPerEvent.actorChargeEvents).map(([k, v]) => `${k}=$${v.eventPriceUsd}`).join(', ') : '';
    console.log(`- ${a.username}/${a.name} | users30d=${a.stats?.totalUsers30Days ?? '?'} | runs30dOK=${a.stats?.publicActorRunStats30Days?.SUCCEEDED ?? '?'} fail=${a.stats?.publicActorRunStats30Days?.FAILED ?? '?'} | rating=${a.actorReviewRating ?? '?'} | ${p.pricingModel || ''} ${p.pricePerUnitUsd ? '$' + p.pricePerUnitUsd + '/unit' : ''} ${events} | modified=${(a.modifiedAt || '').slice(0, 10)} | ${(a.title || '').slice(0, 60)}${a.isDeprecated ? ' [DEPRECATED]' : ''}${a.notice && a.notice !== 'NONE' ? ' [' + a.notice + ']' : ''}`);
  }
}
