/**
 * My $1K Plan calculator math (2026-09-29). PLANNING MATH, not a prediction.
 *
 * Works backward from a revenue goal:
 *   goal -> sales -> (funnel steps for the business model) -> cumulative views
 *   videos/day x days -> original videos; x platforms -> publishing opportunities
 *   cumulative views / publishing opportunities -> average views needed per published post
 *
 * Funnels are defined per business model so later versions can add them without touching the UI:
 *   online_checkout (built): views -> sales-page visitors -> purchases
 *   lead_service (later):    views -> visitors -> leads -> customers
 *   in_person (later):       trackable offer / landing page / code attribution
 * Scenario rates are illustrative planning assumptions, not industry averages or expected results.
 */

export const PLATFORMS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube Shorts' },
  { key: 'pinterest', label: 'Pinterest' },
];

export const MODELS = {
  online_checkout: {
    label: 'Online checkout',
    // Ordered from the top of the funnel down to the sale. `rate` keys are what scenarios and custom inputs set.
    steps: [
      { rate: 'viewToVisit', label: 'View to site visit', noun: 'sales-page visitors' },
      { rate: 'visitToSale', label: 'Site visitor to purchase', noun: 'sales' },
    ],
    scenarios: {
      conservative: { label: 'Conservative', viewToVisit: 0.005, visitToSale: 0.02 },
      planning: { label: 'Planning', viewToVisit: 0.015, visitToSale: 0.05 },
      strong: { label: 'Strong', viewToVisit: 0.03, visitToSale: 0.07 },
    },
  },
};

const num = (x) => (typeof x === 'number' ? x : parseFloat(x));
const ok = (x) => Number.isFinite(x);

/**
 * @param {object} i
 *   goal, avgSale, days, videosPerDay: numbers (strings accepted)
 *   platforms: number of selected platforms, or an array of selected keys
 *   scenario: key in the model's scenarios (default 'planning')
 *   custom: null, or { viewToVisit, visitToSale } as PERCENTAGES (e.g. 1.5 for 1.5%); overrides the scenario
 *   model: 'online_checkout' (default)
 * @returns {object} results; any value that can't be computed is null, with a reason in `issues`
 */
export function computePlanCalc(i) {
  const model = MODELS[i.model || 'online_checkout'];
  const goal = num(i.goal), avgSale = num(i.avgSale), days = num(i.days), vpd = num(i.videosPerDay);
  const platformCount = Array.isArray(i.platforms) ? i.platforms.length : Math.max(0, Math.floor(num(i.platforms) || 0));
  const issues = {};
  const out = { sales: null, perDay: null, perWeek: null, originals: null, published: null, platformCount, funnel: null, views: null, viewsPerPost: null, rates: null, rateSource: null, issues };

  // 1. Plan: sales required.
  if (!(ok(goal) && goal > 0) || !(ok(avgSale) && avgSale > 0) || !(ok(days) && days > 0)) {
    issues.plan = 'Enter a goal, an average sale, and a number of days above 0.';
  } else {
    out.sales = Math.ceil(goal / avgSale - 1e-9); // guard float noise (e.g. 1000/12.5)
    out.perDay = Math.round((out.sales / days) * 10) / 10;
    out.perWeek = Math.round((out.sales / days) * 7 * 10) / 10;
  }

  // 2. Distribution: original videos and publishing opportunities (independent of the sales math).
  if (!(ok(vpd) && vpd >= 0)) issues.distribution = 'Videos per day must be 0 or more.';
  else if (!(ok(days) && days > 0)) issues.distribution = 'Enter a number of days above 0.';
  else {
    out.originals = Math.round(vpd * days);
    if (platformCount < 1) issues.distribution = 'Pick at least one platform.';
    else out.published = out.originals * platformCount;
  }

  // 3. Rates: custom (percent) overrides the scenario.
  let rates = null;
  if (i.custom) {
    const r = {};
    for (const s of model.steps) {
      const pct = num(i.custom[s.rate]);
      if (!(ok(pct) && pct > 0 && pct <= 100)) { issues.rates = `${s.label} must be above 0% and at most 100%.`; break; }
      r[s.rate] = pct / 100;
    }
    if (!issues.rates) { rates = r; out.rateSource = 'custom'; }
  } else {
    const sc = model.scenarios[i.scenario || 'planning'];
    if (sc) { rates = sc; out.rateSource = i.scenario || 'planning'; } else issues.rates = 'Pick a scenario.';
  }
  out.rates = rates ? Object.fromEntries(model.steps.map((s) => [s.rate, rates[s.rate]])) : null;

  // 4. Work backward from sales to cumulative views (round up at each step: you can't have part of a visitor).
  if (out.sales != null && rates) {
    const funnel = [{ noun: model.steps[model.steps.length - 1].noun, count: out.sales }];
    let need = out.sales;
    for (let k = model.steps.length - 1; k >= 0; k--) {
      need = Math.ceil(need / rates[model.steps[k].rate] - 1e-9);
      if (k > 0) funnel.unshift({ noun: model.steps[k - 1].noun, count: need });
    }
    out.views = need;
    out.funnel = funnel; // top (visitors) ... bottom (sales); views are out.views
  }

  // 5. Average views needed per published post.
  if (out.views != null && out.published != null) {
    if (out.published > 0) out.viewsPerPost = Math.ceil(out.views / out.published - 1e-9);
    else issues.viewsPerPost = 'Add at least one video per day to see views per post.';
  }
  return out;
}

/**
 * Which calculator model fits a saved Start Here profile (reads the Router's route + where they buy; never changes them).
 * Only online_checkout is built; the others are returned so the UI can say the math is written for online checkout.
 */
export function modelForSaved(saved) {
  if (!saved) return 'online_checkout';
  if (['booking', 'quote', 'dm', 'phone'].includes(saved.where) || saved.route === 'services') return 'lead_service';
  return 'online_checkout';
}
