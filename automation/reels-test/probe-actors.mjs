// Read-only: details, pricing tiers, health and input schema of candidate Actors.
import { apify } from './apify.mjs';

const ids = process.argv.slice(2);
for (const id of ids) {
  try {
    const a = (await apify(`/acts/${id.replace('/', '~')}`)).data;
    const p = (a.pricingInfos || []).at(-1) || {};
    const ev = p.pricingPerEvent?.actorChargeEvents || {};
    const evs = Object.entries(ev).map(([k, v]) => `${k}: ${v.eventPriceUsd ?? JSON.stringify(v.eventTieredPricingUsd)}`).join(' | ');
    const st = a.stats || {};
    console.log(`\n=== ${id}  ${a.title}`);
    console.log(`deprecated=${a.isDeprecated} notice=${a.notice} modified=${a.modifiedAt?.slice(0, 10)} users30d=${st.totalUsers30Days} runs30d=${JSON.stringify(st.publicActorRunStats30Days || {})}`);
    console.log(`pricing: ${p.pricingModel} ${p.pricePerUnitUsd ?? ''} ${evs}`);
    const build = a.taggedBuilds?.latest?.buildId;
    if (build) {
      const b = (await apify(`/actor-builds/${build}`)).data;
      let schema = b.inputSchema || b.actorDefinition?.input;
      if (typeof schema === 'string') schema = JSON.parse(schema);
      const props = schema?.properties || {};
      console.log('input:', Object.entries(props).map(([k, v]) => `${k}(${v.type}${v.enum ? ':' + v.enum.slice(0, 8).join('/') : ''}${v.default !== undefined ? ' =' + JSON.stringify(v.default).slice(0, 40) : ''})`).join(', '));
    }
    console.log('desc:', (a.description || '').slice(0, 300).replace(/\s+/g, ' '));
  } catch (e) { console.log(`\n=== ${id}: ${e.message.slice(0, 200)}`); }
}
