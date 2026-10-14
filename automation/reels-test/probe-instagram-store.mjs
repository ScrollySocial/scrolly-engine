// Read-only (no runs, no cost): which Instagram Actors exist for trending audio / reels-by-audio / reels search.
import { apify } from './apify.mjs';

const seen = new Set();
for (const search of ['instagram trending audio', 'instagram audio', 'instagram reels audio', 'instagram reels trending', 'instagram reel scraper', 'instagram hashtag reels', 'instagram music']) {
  const res = (await apify('/store', { query: { search, limit: 8 } })).data;
  for (const a of res.items) {
    const id = `${a.username}/${a.name}`;
    if (seen.has(id)) continue; seen.add(id);
    const p = a.currentPricingInfo || {};
    const ev = p.pricingPerEvent?.actorChargeEvents ? Object.entries(p.pricingPerEvent.actorChargeEvents).map(([k, v]) => `${k}=${v.eventPriceUsd ?? '(tiered)'}`).join(' ') : '';
    const st = a.stats?.publicActorRunStats30Days || {};
    console.log(`${id.padEnd(58)} users30d=${String(a.stats?.totalUsers30Days ?? '?').padStart(5)} ok=${st.SUCCEEDED ?? '?'} fail=${st.FAILED ?? '?'} ${p.pricingModel || ''} ${ev} | ${(a.title || '').slice(0, 60)}${a.notice && a.notice !== 'NONE' ? ' [' + a.notice + ']' : ''}`);
  }
}
