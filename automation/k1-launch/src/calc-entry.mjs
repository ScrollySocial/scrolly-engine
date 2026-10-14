/**
 * My $1K Plan calculator (browser). Bundled on its own into dist/k1-calc.js by build.mjs and inlined by
 * scrolly_k1_calc_html(), so it also runs on the Club-only view (which doesn't load the plan bundle).
 * Markup comes from PHP (#k1-calc); every input change recomputes everything with computePlanCalc().
 */
import { computePlanCalc, MODELS } from './plan-calc.mjs';

const fmt = (x) => Number(x).toLocaleString('en-US');

function init(root) {
  const $ = (id) => root.querySelector('#' + id);
  const model = MODELS.online_checkout;
  const inputs = ['c-goal', 'c-price', 'c-days', 'c-vpd', 'c-cv', 'c-cs'].map($);
  const platformBoxes = [...root.querySelectorAll('input[name="c-platform"]')];
  const scenarioBtns = [...root.querySelectorAll('[data-scenario]')];
  let scenario = 'planning';

  const show = (el, on) => { if (el) el.hidden = !on; };
  const set = (id, html) => { const el = $(id); if (el) el.innerHTML = html; };

  function run() {
    const [goal, price, days, vpd, cv, cs] = inputs.map((el) => (el ? el.value : ''));
    const customOn = (cv !== '' && cv != null) || (cs !== '' && cs != null);
    const r = computePlanCalc({
      goal, avgSale: price, days, videosPerDay: vpd,
      platforms: platformBoxes.filter((b) => b.checked).map((b) => b.value),
      scenario, custom: customOn ? { viewToVisit: cv, visitToSale: cs } : null,
    });
    const I = r.issues;

    // 1. Plan
    set('c-out', r.sales != null ? `${fmt(r.sales)} ${r.sales === 1 ? 'sale' : 'sales'}` : '');
    set('c-per', r.sales != null ? `About ${r.perDay} a day, or ${r.perWeek} a week, over ${fmt(days)} days.` : (I.plan || ''));

    // 2. Distribution
    const nP = r.platformCount;
    set('c-orig', r.originals != null ? `${fmt(vpd)} ${Number(vpd) === 1 ? 'video' : 'videos'}/day × ${fmt(days)} days = <b>${fmt(r.originals)} original ${r.originals === 1 ? 'video' : 'videos'}</b>` : '');
    set('c-pub', r.published != null ? `Distributed across ${nP} ${nP === 1 ? 'platform' : 'platforms'} = <b>${fmt(r.published)} publishing ${r.published === 1 ? 'opportunity' : 'opportunities'}</b>` : '');
    set('c-dist-issue', I.distribution || '');
    set('c-pubnote', r.published != null && r.originals > 0 && nP > 1
      ? `You don't need ${fmt(r.published)} different videos. You're creating ${fmt(r.originals)} original videos and distributing them across ${nP === 5 ? 'five' : nP} platforms.`
      : '');

    // 3. What could it take?
    scenarioBtns.forEach((b) => { const on = !customOn && b.dataset.scenario === scenario; b.setAttribute('aria-checked', on ? 'true' : 'false'); });
    // Radio group keyboard model: only the checked button (or the first, when custom rates are in use) is a Tab stop.
    const stop = scenarioBtns.find((b) => b.getAttribute('aria-checked') === 'true') || scenarioBtns[0];
    scenarioBtns.forEach((b) => { b.tabIndex = b === stop ? 0 : -1; });
    root.classList.toggle('c-custom', customOn);
    const pct = (x) => `${Math.round(x * 1000) / 10}%`;
    set('c-rates', r.rates
      ? `${customOn ? 'Your own rates' : model.scenarios[scenario].label}: ${pct(r.rates.viewToVisit)} of views visit your sales page, ${pct(r.rates.visitToSale)} of visitors buy.`
      : (I.rates || ''));
    const f = r.funnel;
    show($('c-funnel'), !!f && r.views != null);
    if (f && r.views != null) {
      set('c-f-sales', fmt(r.sales));
      set('c-f-sales-noun', r.sales === 1 ? 'sale' : 'sales');
      set('c-f-visitors', '~' + fmt(f[0].count));
      set('c-f-views', '~' + fmt(r.views));
    }
    show($('c-hero'), r.viewsPerPost != null);
    if (r.viewsPerPost != null) set('c-vpp', fmt(r.viewsPerPost));
    set('c-vpp-issue', r.viewsPerPost == null ? (I.viewsPerPost || (r.views != null && I.distribution ? 'Views per post appear once at least one platform is picked.' : '')) : '');
  }

  inputs.forEach((el) => el && el.addEventListener('input', run));
  platformBoxes.forEach((b) => b.addEventListener('change', run));
  scenarioBtns.forEach((b) => b.addEventListener('click', () => {
    scenario = b.dataset.scenario;
    // Picking a scenario while custom rates are filled in clears them, so the choice takes effect.
    [$('c-cv'), $('c-cs')].forEach((el) => { if (el) el.value = ''; });
    run();
  }));
  // Arrow keys move through the scenarios and select them (WAI-ARIA radio group); Home/End jump to the ends.
  scenarioBtns.forEach((b, i) => b.addEventListener('keydown', (e) => {
    const keys = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: scenarioBtns.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const t = scenarioBtns[(keys[e.key] + scenarioBtns.length) % scenarioBtns.length];
    t.click();
    t.focus();
  }));
  run();
}

if (typeof document !== 'undefined') {
  const go = () => { const el = document.getElementById('k1-calc'); if (el && !el.dataset.ready) { el.dataset.ready = '1'; init(el); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
}
