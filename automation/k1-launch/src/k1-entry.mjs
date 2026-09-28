/**
 * Browser entry for the My Account $1K tab (bundled into dist/k1-app.js by build.mjs).
 * Renders My $1K Plan from saved Start Here answers using the reused Club logic.
 * Auto-runs on any element with id="k1-plan" and a data-saved JSON attribute.
 */
import { computePlanView, buildProfile, CHANNELS, WHERE_THEY_BUY, FOUND_VIA, listRoutes, channelFor } from './plan-view.mjs';
import { computeModule1Results } from '../../club/lib/module1.mjs';
import { newGrowthReviewInput } from '../../club/lib/growth-review-schema.mjs';
import { weeklyReviewMetrics, computeWeeklyReview } from './weekly-review-adapter.mjs';
import { computeGoalGap, computeThisWeek } from './this-week.mjs';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = (x) => (x == null ? '?' : Number(x).toLocaleString('en-US'));
const money = (x) => '$' + Number(x).toLocaleString('en-US', { maximumFractionDigits: 2 });

export function renderPlan(v) {
  const steps = v.funnel.steps.map((s) => s.isSale
    ? `<li><b>${n(s.base)} ${esc(s.label)}</b> at ${money(v.price)}</li>`
    : `<li>about <b>${n(s.base)} ${esc(s.label)}</b>${s.low !== s.high ? ` <span class="note">(planning range ${n(s.low)} to ${n(s.high)})</span>` : ' <span class="note">(from your own conversion rate)</span>'}</li>`).join('');
  const e = v.economics;
  const econ = e.note ? `<div class="sec cream"><h3>Your offer economics</h3><p>${esc(e.note)}</p>
    ${e.scenarios.length ? `<table><thead><tr><th>Average order value</th><th>Sales needed for $1,000</th></tr></thead><tbody>${e.scenarios.map((s) => `<tr><td>${money(s.aov)}${s.current ? ' (today)' : ''}</td><td>${n(s.sales)}</td></tr>`).join('')}</tbody></table><p class="note">Planning scenarios, not predictions or promises.</p>` : ''}
    ${e.levers.length ? `<p><b>Ways businesses like yours raise the average order:</b></p><ul>${e.levers.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>` : ''}</div>` : '';
  const trust = e.trustNote ? `<div class="sec cream"><h3>Your offer economics</h3><p>${esc(e.trustNote)}</p></div>` : '';
  return `
  <div class="sec black"><h2>My $1K Plan</h2>
    <p>${v.business ? esc(v.business) + ' · ' : ''}${esc(v.offer)} at ${money(v.price)} · ${esc(v.route.label)}</p>
    <div class="big">${n(v.number.requiredSales)} ${esc(v.number.saleNoun)}</div>
    <p>at ${money(v.price)} gets you to ${money(v.number.resultingRevenue)}. That is your $1K number.</p></div>
  <div class="sec"><h2>What it takes</h2>
    <p class="note">Working backward from your ${n(v.number.requiredSales)} ${esc(v.number.saleNoun)}.</p>
    <ul class="funnel">${steps}</ul>
    <p class="note">Before that: somewhere between ${n(v.funnel.reach.low)} and ${n(v.funnel.reach.high)} ${esc(v.funnel.reach.label)}. Reach varies the most, so treat it as a rough range.</p>
    <p class="note">${v.funnel.usesYourData ? 'These numbers use the conversion rate you gave us.' : 'Planning estimates, not predictions. They get sharper as you log real numbers each week.'}</p>
    <p>${esc(v.interpretation)}</p></div>
  ${econ}${trust}
  <div class="sec teal"><h2>My first priority</h2><h3>${esc(v.firstPriority.label)}</h3><p>${esc(v.firstPriority.rationale)}</p>
    <h3>Work on this now</h3><ul>${v.workOnNow.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
    ${v.crossPost ? `<p class="note">${esc(v.crossPost)}</p>` : ''}</div>
  <div class="sec"><h2>Don't worry about these yet</h2><ul>${v.notYet.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
  <div class="sec"><h2>What we know so far</h2><ul class="known">${v.whatWeKnow.map((d) => `<li><span class="ic">${esc(d.icon)}</span> <b>${esc(d.headline)}.</b> ${esc(d.rationale)}</li>`).join('')}</ul>
    <p class="note">Numbers to track each week: ${v.checkInMetrics.map(esc).join(', ')}.</p></div>`;
}

// ---- Weekly Review (Module 7 diagnosis via weekly-review-adapter.mjs; deterministic, no AI)
export function computeReviewForSaved(saved, reviewInput) {
  const r = computeModule1Results(buildProfile(saved));
  return computeWeeklyReview(r, { primaryChannelLabel: CHANNELS[channelFor(saved)], destinationLabel: WHERE_THEY_BUY[saved.where] }, reviewInput);
}
export function checkInMetricsForSaved(saved) { return weeklyReviewMetrics(computeModule1Results(buildProfile(saved))); }

const clean = (s) => String(s ?? '').replace(/\s*(?:—|–|--)\s*/g, ', ');
// Plain-language names for the Module 7 constraint categories (the engine's own labels are internal-sounding).
const CONSTRAINT_PLAIN = {
  insufficient_data: 'Not enough numbers yet to tell',
  discovery_constraint: 'Not enough of the right people are seeing you yet',
  message_interest_constraint: 'People see you, but not enough are interested yet',
  cta_movement_constraint: 'People are interested, but not taking the next step',
  conversion_trust_constraint: 'People reach the last step, but do not buy',
  economics_volume_constraint: 'Sales are working. Volume is now the limit',
  capacity_constraint: 'You have more interest than you can handle',
  repeatability_constraint: 'A past win has not repeated yet',
  path_healthy: 'It is working. Keep going',
};
const METRIC_HINT = {
  'Instagram reach': 'Accounts reached this week, from Instagram Insights',
  'Instagram profile visits': 'Profile visits this week, from Instagram Insights',
  'Qualified reach/visits': 'Views or reach on your posts (Instagram Insights or your platform stats)',
  'Product views': 'Visits to your product pages', 'Add-to-cart activity': 'Times someone added to cart',
  'Inquiries/leads': 'Messages, calls, quote or booking requests', 'Sales conversations': 'Real back-and-forth conversations about buying',
  'Leads': 'Email signups or people who asked about it', 'Sales page views': 'Visits to your sales or checkout page',
  'Audience engagement': 'Likes, comments, shares, and saves', 'Clicks': 'Link clicks',
  'Search impressions': 'Times your listings showed in search (from your shop stats)', 'Listing views': 'Views of your listings',
  'Local discovery views': 'Profile or map views from people nearby', 'Inquiries/visits': 'Orders started, messages, or booking requests',
};

/** Funnel inputs for the check-in form. The final stage (the sale itself) comes from "Sales this week", so it is not asked twice. */
export function renderCheckInMetrics(saved) {
  const metrics = checkInMetricsForSaved(saved);
  return metrics.slice(0, -1).map((m, i) => `<div><label for="k1-m${i}">${esc(m.label)} this week</label>
    <input id="k1-m${i}" name="m[${i}]" type="number" min="0" step="1"><input type="hidden" name="ml[${i}]" value="${esc(m.label)}">
    ${METRIC_HINT[m.label] ? `<p class="note">${esc(METRIC_HINT[m.label])}</p>` : ''}</div>`).join('');
}

/** A stored check-in (PHP record) -> the Module 7 GrowthReviewInput shape. Blank stays unknown, never 0. */
export function reviewInputFromRecord(rec) {
  const metrics = checkInMetricsForSaved(rec.snapshot);
  const byLabel = new Map((rec.metrics || []).map((m) => [m.label, m.value]));
  const known = (v) => v !== '' && v != null;
  const salesKnown = known(rec.sales);
  return {
    ...newGrowthReviewInput(),
    periodStart: rec.periodStart, periodEnd: rec.periodEnd,
    activity: { channelsUsed: [], actions: rec.actions || [], capacityConstrained: rec.cap === 'yes' ? true : rec.cap === 'no' ? false : null, notes: rec.note || null },
    revenueUsd: known(rec.rev) ? Number(rec.rev) : null,
    salesCount: salesKnown ? Number(rec.sales) : null,
    pathMetrics: metrics.map((m, i) => {
      if (i === metrics.length - 1) return { label: m.label, value: salesKnown ? Number(rec.sales) : null, known: salesKnown };
      const v = byLabel.get(m.label);
      return { label: m.label, value: known(v) ? Number(v) : null, known: known(v) };
    }),
    revenueAttribution: { state: rec.attr || 'unknown', breakdown: [] },
  };
}

export function diagnoseRecord(rec) { return computeReviewForSaved(rec.snapshot, reviewInputFromRecord(rec)); }

/** Goal gap: factual progress first, pace second, labeled projection last (never the headline). */
export function renderGoalGap(g) {
  return `<div class="gap"><div class="big">${esc(g.headline)}</div><p><b>${esc(g.toGo)}.</b> ${esc(g.salesLine)}${g.paceLine ? ' ' + esc(g.paceLine) : ''}</p>
    ${g.started ? '' : '<p class="note">Your Challenge has not started yet, so this counts from $0.</p>'}
    ${g.projection ? `<p class="note">${esc(g.projection)}</p>` : ''}</div>`;
}

function renderReviewResult(rec, d, goalGap) {
  const list = (items) => items.map((i) => `<li><b>${esc(clean(i.title))}</b> ${esc(clean(i.rationale))}</li>`).join('');
  const stop = d.stop.filter((s) => !/^Nothing to stop/.test(s.title));
  return `<div class="sec teal"><h2>Your check-in for the week ending ${esc(rec.periodEnd)}</h2>
    ${goalGap ? `<h3>Where you are against $1,000</h3>${renderGoalGap(goalGap)}` : ''}
    <h3>What happened</h3><p>${esc(clean(d.strongestSignal.rationale))}</p>
    <h3>What is holding you back</h3><p><b>${esc(CONSTRAINT_PLAIN[d.constraint.category] || d.constraint.label)}.</b> ${esc(clean(d.constraint.rationale))}</p>
    <h3>Keep doing</h3><ul>${list(d.repeat)}</ul>
    ${stop.length ? `<h3>Stop doing</h3><ul>${list(stop)}</ul>` : ''}
    <h3>Try this next week</h3><p>${esc(clean(d.test))}</p>
    <h3>Your focus for next week</h3><p class="focus"><b>${esc(clean(d.nextWeekFocus))}</b></p>
    <p class="note">How sure we are: ${esc(d.confidence.label)}. ${esc(clean(d.confidence.explanation))}</p></div>`;
}

function renderReviewHistory(rows) {
  if (rows.length < 2) return '';
  return `<div class="sec"><h3>Past check-ins</h3><table><thead><tr><th>Week ending</th><th>Revenue</th><th>Sales</th><th>Created / placed</th><th>What held you back</th></tr></thead><tbody>${
    rows.slice().reverse().map(({ rec, d }) => `<tr><td>${esc(rec.periodEnd)}</td><td>${rec.rev === '' ? '?' : money(rec.rev)}</td><td>${rec.sales === '' ? '?' : n(rec.sales)}</td><td>${rec.created === '' ? '?' : n(rec.created)} / ${rec.distributed === '' ? '?' : n(rec.distributed)}</td><td>${esc(CONSTRAINT_PLAIN[d.constraint.category] || d.constraint.label)}</td></tr>`).join('')
  }</tbody></table></div>`;
}

/** Latest-focus box shown at the top of My $1K Plan once a check-in exists (the loop: review -> updated focus). */
function renderFocusBox(rec, d) {
  return `<div class="sec black"><h2>Your focus this week</h2><p><b>${esc(clean(d.nextWeekFocus))}</b></p><p>Try: ${esc(clean(d.test))}</p><p class="note">From your check-in for the week ending ${esc(rec.periodEnd)}.</p></div>`;
}

/** This Week: the bridge from Plan / latest check-in to a short execution list. contentUrl = the Challenge content tab. */
export function renderThisWeek(tw, contentUrl = '#') {
  const items = tw.content.items.map((i) => `<li><b>${esc(i.text)}</b> <span class="note">${esc(i.job)}.</span></li>`).join('');
  return `<div class="sec black" id="k1-this-week"><h2>This week${tw.week ? ` (week ${tw.week} of your Challenge)` : ''}</h2>
    <p class="note">${esc(tw.focusSource)}:</p><p class="focus"><b>${esc(clean(tw.focus))}</b></p>
    ${renderGoalGap(tw.goalGap)}</div>
  <div class="sec"><h3>1. Create</h3><p>${esc(tw.content.angle)}</p><ul>${items}</ul>
    <p class="note">${esc(tw.content.crossPost)}</p>
    <a class="btn teal" href="${esc(contentUrl)}">Open this week's Reels, carousels, and Stories</a>
    <h3 style="margin-top:22px">2. Make it easy to buy</h3><p>${esc(tw.conversion)}</p>
    ${tw.business ? `<h3>3. Business move</h3><p>${esc(tw.business)}</p>` : ''}
    <h3>${tw.business ? '4' : '3'}. Track these for your check-in</h3><ul>${tw.track.metrics.map((m) => `<li>${esc(m)}</li>`).join('')}${tw.track.alsoTrack.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
    <p class="note">${esc(tw.nextCheckIn)} <a href="#k1-review-sec">Go to your weekly check-in</a>.</p></div>`;
}

function safeJson(s, fallback) { try { return JSON.parse(s); } catch { return fallback; } }

function autorun() {
  const weekEl = document.getElementById('k1-week');
  const planEl = document.getElementById('k1-plan');
  const reviewEl = document.getElementById('k1-review');
  const metricsEl = document.getElementById('k1-checkin-metrics');
  const saved = planEl ? safeJson(planEl.dataset.saved, null) : null;
  const reviews = planEl ? safeJson(planEl.dataset.reviews, []) : [];
  const challenge = weekEl ? safeJson(weekEl.dataset.challenge, {}) : {};
  let diagnosed = [];
  try { diagnosed = reviews.map((rec) => ({ rec, d: diagnoseRecord(rec) })); } catch (err) { diagnosed = []; }
  const latest = diagnosed[diagnosed.length - 1];
  let planView = null;
  if (planEl && saved) {
    try {
      planView = computePlanView(saved);
      planEl.innerHTML = renderPlan(planView);
    } catch (err) {
      planEl.innerHTML = `<div class="sec cream"><p>We couldn't build your plan from these answers (${esc(err.message)}). Please check your business details below.</p></div>`;
    }
  }
  if (weekEl && saved && planView) {
    try { weekEl.innerHTML = renderThisWeek(computeThisWeek(saved, planView, latest || null, challenge, weekEl.dataset.next || ''), weekEl.dataset.content || '#'); } catch (err) { weekEl.innerHTML = ''; }
  }
  if (metricsEl && saved) { try { metricsEl.innerHTML = renderCheckInMetrics(saved); } catch (err) { /* form still works without funnel boxes */ } }
  // Finished without a verified win: show where their latest check-in pointed.
  const finalFocusEl = document.getElementById('k1-final-focus');
  if (finalFocusEl && latest) {
    finalFocusEl.innerHTML = `<p><b>Your latest focus:</b> ${esc(clean(latest.d.nextWeekFocus))}</p><p class="note" style="color:#fff">What held you back most recently: ${esc(CONSTRAINT_PLAIN[latest.d.constraint.category] || latest.d.constraint.label)}.</p>`;
  }
  if (reviewEl) reviewEl.innerHTML = latest ? renderReviewResult(latest.rec, latest.d, saved ? computeGoalGap(saved, challenge) : null) + renderReviewHistory(diagnosed) : '';
}

if (typeof window !== 'undefined') {
  window.ScrollyK1 = { computePlanView, renderPlan, computeReviewForSaved, checkInMetricsForSaved, renderCheckInMetrics, reviewInputFromRecord, diagnoseRecord, renderReviewResult, renderReviewHistory, renderFocusBox, renderGoalGap, renderThisWeek, computeGoalGap, computeThisWeek, newGrowthReviewInput, CHANNELS, WHERE_THEY_BUY, FOUND_VIA, listRoutes };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', autorun); else autorun();
}
