import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { MEMBERS_DIR, loadMember, recordFirstName } from './club-state.mjs';
import { verifyAccessToken } from './club-access-token.mjs';
import { loadBusinessProfile } from './business-profile-store.mjs';
import { loadGrowthReviews } from './growth-review-store.mjs';
import { loadSavedContent } from './content-library-store.mjs';
import { fetchCustomerFirstName } from './club-order-verify.mjs';

/**
 * Real current streak (consecutive days up to today/yesterday with at
 * least one dated real action), built only from activity the Club already
 * records with a timestamp -- metric updates (`history`), Growth Review
 * submissions, and saved Content Studio items. No dedicated "daily
 * activity" event exists (events.ndjson only logs account-lifecycle
 * events like club_purchased, not day-to-day use), so this is the
 * honest, economical proxy rather than a new tracking system. If the most
 * recent dated action isn't today or yesterday, the streak is not
 * "current" -- shown as inactive, not a stale number.
 */
export function computeStreak(dateStrings) {
  const toDay = (d) => new Date(d).toISOString().slice(0, 10);
  // Normalize to calendar days BEFORE dedup/sort -- comparing raw
  // timestamp strings (e.g. "2026-09-14T21:12:02.074Z") against a
  // day-only string ("2026-09-14") never matches, which silently broke
  // every real streak.
  const unique = [...new Set(dateStrings.map(toDay))].sort().reverse();
  if (unique.length === 0) return { active: false, days: 0 };
  const today = toDay(new Date());
  const yesterday = toDay(new Date(Date.now() - 86400000));
  if (unique[0] !== today && unique[0] !== yesterday) return { active: false, days: 0 };
  let days = 1;
  let cursor = unique[0];
  for (let i = 1; i < unique.length; i++) {
    const expectedPrev = toDay(new Date(new Date(cursor).getTime() - 86400000));
    if (unique[i] === expectedPrev) { days++; cursor = unique[i]; }
    else break;
  }
  return { active: true, days };
}

/**
 * Real trailing-30-day revenue, built only from dated Growth Review periods
 * -- never from the undated `currentMetrics` running snapshot, which has no
 * period and must not be relabeled as one. A review only contributes if its
 * own `revenueUsd` was actually reported (not null); a review with unknown
 * revenue is real evidence of "unknown," not zero, so it's excluded from
 * the sum rather than counted as $0 -- but its existence still counts
 * toward `reviewsInWindow` so the UI can tell "no reviews" apart from
 * "reviews exist but didn't report revenue."
 */
function computeRevenue30Day(reviews) {
  const now = Date.now();
  const windowStart = now - 30 * 24 * 60 * 60 * 1000;
  // Filtered by periodSTART, not periodEnd: the review form defaults a
  // period's end to several days after today (a still-in-progress
  // reporting window), so a real, currently-open review can have a
  // periodEnd in the future. Requiring periodEnd to already have passed
  // would wrongly exclude the review a member just submitted today.
  const inWindow = reviews.filter((r) => {
    const start = new Date(r.input.periodStart).getTime();
    return Number.isFinite(start) && start >= windowStart && start <= now;
  });
  const withRevenue = inWindow.filter((r) => r.input.revenueUsd != null);
  if (withRevenue.length === 0) {
    return { known: false, reviewsInWindow: inWindow.length, totalUsd: null, periodStart: null, periodEnd: null };
  }
  const totalUsd = withRevenue.reduce((sum, r) => sum + r.input.revenueUsd, 0);
  const periodStart = withRevenue.map((r) => r.input.periodStart).sort()[0];
  const periodEnd = withRevenue.map((r) => r.input.periodEnd).sort().at(-1);
  return { known: true, reviewsInWindow: inWindow.length, reviewsWithRevenue: withRevenue.length, totalUsd, periodStart, periodEnd };
}

export const METRIC_STATES = Object.freeze(['unknown', 'zero', 'customer-reported', 'observed', 'connected']);
export const CONNECTION_KEYS = Object.freeze(['store', 'analytics']);

export function metric(value = null, state = 'unknown', observedAt = null) {
  if (!METRIC_STATES.includes(state)) throw new Error(`Invalid metric state "${state}"`);
  if (state === 'unknown' && value !== null) throw new Error('Unknown metrics must have a null value');
  if (state === 'zero' && value !== 0) throw new Error('Zero metrics must have a numeric value of 0');
  if (!['unknown', 'zero'].includes(state) && (typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error(`${state} metrics require a finite numeric value`);
  }
  return { value, state, observedAt };
}

export function newMemberGrowthState() {
  return {
    joinedScrollyBaseline: null,
    challengeStarts: [],
    currentMetrics: {},
    history: [],
    connections: Object.fromEntries(CONNECTION_KEYS.map((key) => [key, { status: 'not_connected', connectedAt: null }])),
  };
}

export function captureJoinedBaseline(state, metrics, capturedAt = new Date().toISOString()) {
  if (!state.joinedScrollyBaseline) state.joinedScrollyBaseline = { capturedAt, metrics: structuredClone(metrics) };
  return state;
}

export function startChallengeSnapshot(state, {
  challengeId = randomUUID(),
  metrics = state.currentMetrics,
  capturedAt = new Date().toISOString(),
} = {}) {
  state.challengeStarts.push({ challengeId, capturedAt, metrics: structuredClone(metrics) });
  return challengeId;
}

export function updateCurrentMetric(state, key, nextMetric, recordedAt = new Date().toISOString()) {
  const normalized = metric(nextMetric.value, nextMetric.state, nextMetric.observedAt ?? recordedAt);
  state.currentMetrics[key] = normalized;
  state.history.push({ key, ...structuredClone(normalized), recordedAt });
  return state;
}

export function setConnectionStatus(state, key, status, changedAt = new Date().toISOString()) {
  if (!CONNECTION_KEYS.includes(key)) throw new Error(`Unknown connection "${key}"`);
  if (!['not_connected', 'connected', 'error'].includes(status)) throw new Error(`Invalid connection status "${status}"`);
  state.connections[key] = { status, connectedAt: status === 'connected' ? changedAt : null };
  return state;
}

export async function analyzeWhenReady({ state, requiredConnections = [], requiredMetrics = [], analyze }) {
  const missingConnections = requiredConnections.filter((key) => state.connections[key]?.status !== 'connected');
  const missingMetrics = requiredMetrics.filter((key) => !state.currentMetrics[key] || state.currentMetrics[key].state === 'unknown');
  if (missingConnections.length || missingMetrics.length) {
    return { status: 'not_enough_data', missingConnections, missingMetrics, analysis: null };
  }
  return { status: 'ready', missingConnections: [], missingMetrics: [], analysis: await analyze(state) };
}

export function createMemberGrowthStore(baseDir = MEMBERS_DIR) {
  const statePath = (slug) => path.join(baseDir, slug, 'growth-state.json');
  return {
    async load(slug) {
      const file = statePath(slug);
      return existsSync(file) ? JSON.parse(await readFile(file, 'utf8')) : newMemberGrowthState();
    },
    async save(slug, state) {
      await mkdir(path.dirname(statePath(slug)), { recursive: true });
      await writeFile(statePath(slug), JSON.stringify(state, null, 2), 'utf8');
      return state;
    },
  };
}

function availability(state, connection, message) {
  return state.connections[connection]?.status === 'connected'
    ? { status: 'not_enough_data', message: 'Not enough data yet' }
    : { status: 'connection_required', message };
}

// The 7 modules in build order, matched to the persisted artifact each one
// produces -- same file-existence convention `has()` already used for
// organicGrowth/growthReview below, just applied to all 7 so the Club Home
// dashboard can show real "N of 7" progress instead of inventing one.
export const MODULE_SEQUENCE = Object.freeze([
  { key: 'starting_point', file: 'profile.json', href: '/club', label: 'Your $1K Starting Point' },
  { key: 'offer', file: 'offer-plan.json', href: '/club/module2', label: 'Build an Offer People Want to Buy' },
  { key: 'discovery', file: 'discovery-plan.json', href: '/club/module3', label: 'Find the People Most Likely to Buy It' },
  { key: 'channel_plan', file: 'channel-plan.json', href: '/club/module4', label: 'Choose How People Will Find You' },
  { key: 'messaging', file: 'messaging-plan.json', href: '/club/module5', label: 'Give Them a Reason to Pay Attention' },
  { key: 'sales_path', file: 'sales-path-plan.json', href: '/club/module6', label: 'Turn Attention Into Sales' },
  { key: 'growth_review', file: 'growth-reviews.json', href: '/club/review', label: 'Growth Review' },
]);

export function createOverviewService({ store = createMemberGrowthStore(), membersDir = MEMBERS_DIR } = {}) {
  return async function getOverviewForToken(accessToken) {
    const identity = verifyAccessToken(accessToken);
    if (!identity.valid) return { ok: false, reason: identity.reason };
    const slug = `customer-${identity.customerId}`;
    const state = await store.load(slug);
    const member = await loadMember(slug);
    // Real first name, cached once fetched -- WooCommerce always collects
    // billing.first_name at checkout, so this is real customer data, not
    // invented. A failed/unconfigured lookup just leaves it null; the
    // dashboard greeting has an honest no-name fallback for that case.
    let firstName = member?.firstName ?? null;
    if (!firstName) {
      firstName = await fetchCustomerFirstName(identity.customerId);
      if (firstName) await recordFirstName(slug, firstName);
    }
    const businessProfile = await loadBusinessProfile(slug);
    const growthReviews = await loadGrowthReviews(slug);
    const revenue30Day = computeRevenue30Day(growthReviews);
    const savedContent = await loadSavedContent(slug);
    const streak = computeStreak([
      ...(state.history || []).map((h) => h.recordedAt),
      ...growthReviews.map((r) => r.createdAt),
      ...savedContent.map((c) => c.savedAt),
    ]);
    const has = (name) => existsSync(path.join(membersDir, slug, name));
    // Module 1 ("starting_point") is only really complete once the actual
    // guided onboarding ran (member.profileComplete -- the same flag every
    // other module's real prerequisite check uses), not just because a
    // profile.json file exists. A Connections-page import can create a
    // real profile.json (offer/price only) without ever setting that flag,
    // which must not be shown here as "Module 1 done" when Module 2 would
    // still correctly refuse to let them in.
    const moduleStatus = MODULE_SEQUENCE.map((m) => ({
      ...m,
      complete: m.key === 'starting_point' ? Boolean(member?.profileComplete) : has(m.file),
    }));
    const modulesCompleted = moduleStatus.filter((m) => m.complete).length;
    const nextModule = moduleStatus.find((m) => !m.complete) || null;
    return {
      ok: true,
      identity: { customerId: identity.customerId, firstName },
      // Narrow, read-only surface of the real onboarding profile -- lets the
      // dashboard pick which supporting metrics are actually relevant to
      // this member's sales path (e.g. don't show "site visits" to someone
      // who sells only through DMs) without re-asking anything they already
      // told us in Module 1.
      profile: businessProfile
        ? { businessName: businessProfile.businessName, websiteUrl: businessProfile.websiteUrl, route: businessProfile.route, price: businessProfile.price, sellingSurfaces: businessProfile.sellingSurfaces, discoveryChannels: businessProfile.discoveryChannels }
        : null,
      metrics: state.currentMetrics,
      // Real, dated, period-scoped revenue -- built only from submitted
      // Growth Reviews whose period falls in the last 30 days. Kept
      // separate from `metrics.revenueUsd` (an undated running snapshot)
      // so neither is ever mislabeled as the other.
      revenue30Day,
      // Real, if honest: computed only from actually-dated actions
      // (metric updates, Growth Reviews, saved content) -- never a
      // fabricated or hardcoded count. { active:false, days:0 } when the
      // most recent dated action isn't today or yesterday.
      streak,
      baseline: state.joinedScrollyBaseline,
      latestChallengeStart: state.challengeStarts.at(-1) ?? null,
      history: state.history,
      // Small, real, Club-scoped activity counts -- built from data this
      // function already loads for streak/revenue30Day, not a new store.
      // Deliberately excludes anything Challenge-scoped (opportunities
      // planned/posted, view counts), which belongs to the separate
      // Challenge product, not the permanent Club dashboard.
      activity: {
        contentSavedCount: savedContent.length,
        growthReviewsCount: growthReviews.length,
        latestGrowthReviewAt: growthReviews.length ? growthReviews.map((r) => r.createdAt).sort().at(-1) : null,
      },
      connections: state.connections,
      progress: {
        modulesCompleted,
        modulesTotal: MODULE_SEQUENCE.length,
        modules: moduleStatus.map((m) => ({ key: m.key, label: m.label, href: m.href, complete: m.complete })),
        nextModule: nextModule ? { key: nextModule.key, href: nextModule.href, label: nextModule.label } : null,
      },
      sections: {
        // Corrected 2026-09-14: this previously pointed at module2 (Build an
        // Offer), not the actual channel plan the status check reads --
        // module4 is where channel-plan.json is produced.
        organicGrowth: { status: has('channel-plan.json') ? 'available' : 'not_enough_data', href: '/club/module4' },
        // Manual entry already works today with no connection at all --
        // this must never read as "locked until you connect something."
        // A connection, once available, only automates what you can
        // already do by hand on the Website & Conversion page.
        websiteConversion: availability(state, 'store', 'You can enter revenue and sales manually right now -- a store connection will automate this when available.'),
        siteTraffic: availability(state, 'analytics', 'You can enter site visits manually right now -- an analytics connection will automate this when available.'),
        growthReview: { status: has('growth-reviews.json') ? 'available' : 'not_enough_data', message: 'Not enough data yet' },
      },
    };
  };
}

export const getOverviewForToken = createOverviewService();

export const MANUAL_METRIC_KEYS = Object.freeze(['revenueUsd', 'salesCount', 'siteVisits']);

export function createManualMetricsService({ store = createMemberGrowthStore() } = {}) {
  return async function submitManualMetricsForToken({ accessToken, values = {} }) {
    const identity = verifyAccessToken(accessToken);
    if (!identity.valid) return { ok: false, reason: identity.reason };
    const slug = `customer-${identity.customerId}`;
    const state = await store.load(slug);
    const recordedAt = new Date().toISOString();
    const snapshot = {};
    for (const key of MANUAL_METRIC_KEYS) {
      const raw = values[key];
      if (raw === null || raw === undefined || raw === '') {
        snapshot[key] = metric();
        continue;
      }
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) return { ok: false, reason: `invalid_${key}` };
      snapshot[key] = metric(value, value === 0 ? 'zero' : 'customer-reported', recordedAt);
    }
    const sales = snapshot.salesCount;
    const visits = snapshot.siteVisits;
    snapshot.conversionRate = sales.state !== 'unknown' && visits.state !== 'unknown' && visits.value > 0
      ? metric((sales.value / visits.value) * 100, sales.value === 0 ? 'zero' : 'observed', recordedAt)
      : metric();
    captureJoinedBaseline(state, snapshot, recordedAt);
    for (const [key, value] of Object.entries(snapshot)) updateCurrentMetric(state, key, value, recordedAt);
    await store.save(slug, state);
    return { ok: true, metrics: state.currentMetrics, baseline: state.joinedScrollyBaseline, history: state.history };
  };
}

export const submitManualMetricsForToken = createManualMetricsService();
