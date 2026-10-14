#!/usr/bin/env node
/**
 * Local bridge server — runs natively on Windows (NOT inside the n8n Docker
 * container). n8n runs in a Linux container that has no access to this
 * machine's Claude Agent SDK install (Windows-native binary) or the ability
 * to spawn processes on the host. This server exposes the already-tested
 * automation/n8n/scripts/*.mjs CLI scripts over plain HTTP instead, so n8n's
 * workflows call it via `http://host.docker.internal:<PORT>/...` (Docker
 * Desktop's built-in DNS name for reaching the host from inside a container)
 * rather than trying to Execute Command inside the container.
 *
 * Each route is a thin wrapper: parse the JSON body, shell out to the exact
 * same script tested via CLI earlier, return its stdout JSON as the response.
 * No new logic lives here — this only bridges HTTP to the existing scripts.
 *
 * Start: node bridge-server.mjs   (add to a startup script; must be running
 * whenever the n8n workflows need to reach it)
 */
import 'dotenv/config';
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadOrder, recordManualReviewAcceptance, resolveVaultRelativePath } from './lib/order-state.mjs';
import { listOrders, getOrderDetail } from './lib/order-aggregator.mjs';
import { syncOrderToWordPress } from './lib/wp-tracker-sync.mjs';
import { approveAndSend } from './lib/approve-and-send.mjs';
import { submitOnboarding, getResultsForToken } from './club/lib/onboarding-service.mjs';
import { extractBearerToken } from './club/lib/club-access-token.mjs';
import { getModule2Context, generatePositioning, submitModule2, getModule2ResultsForToken } from './club/lib/module2-service.mjs';
import { getModule3Context, generateLanguageHypotheses, submitModule3, getModule3ResultsForToken } from './club/lib/module3-service.mjs';
import { getModule4Context, submitModule4, getModule4ResultsForToken } from './club/lib/module4-service.mjs';
import { getModule5Context, generateCoreMessage, submitModule5, getModule5ResultsForToken } from './club/lib/module5-service.mjs';
import { getModule6Context, submitModule6, getModule6ResultsForToken } from './club/lib/module6-service.mjs';
import { getOverviewForToken, submitManualMetricsForToken } from './club/lib/member-growth-state.mjs';
import { getGrowthReviewState, submitGrowthReview } from './club/lib/module7-service.mjs';
import { getChallengeState, startChallengeAttempt, submitAchievementClaim, submitRewardChoice } from './club/lib/challenge-service.mjs';
import { getOpportunityState, planOpportunity, markOpportunityPosted, recordOpportunityResult } from './club/lib/opportunity-service.mjs';
import { getContentStudioState, saveContent, deleteContent } from './club/lib/content-studio-service.mjs';
import { importFromUrl, applyImportToProfile, getIntegrationRequirements } from './club/lib/connections-import-service.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = path.join(__dirname, 'n8n', 'scripts');
const IMPLEMENTATION_DIR = path.join(__dirname, 'implementation');
const DASHBOARD_HTML_PATH = path.join(__dirname, 'dashboard', 'index.html');
const CLUB_HTML_PATH = path.join(__dirname, 'club', 'public', 'index.html');
const CLUB_MODULE2_HTML_PATH = path.join(__dirname, 'club', 'public', 'module2.html');
const CLUB_MODULE3_HTML_PATH = path.join(__dirname, 'club', 'public', 'module3.html');
const CLUB_MODULE4_HTML_PATH = path.join(__dirname, 'club', 'public', 'module4.html');
const CLUB_MODULE5_HTML_PATH = path.join(__dirname, 'club', 'public', 'module5.html');
const CLUB_MODULE6_HTML_PATH = path.join(__dirname, 'club', 'public', 'module6.html');
const CLUB_OVERVIEW_HTML_PATH = path.join(__dirname, 'club', 'public', 'overview.html');
const CLUB_WEBSITE_HTML_PATH = path.join(__dirname, 'club', 'public', 'website.html');
const CLUB_REVIEW_HTML_PATH = path.join(__dirname, 'club', 'public', 'review.html');
const CLUB_CONNECTIONS_HTML_PATH = path.join(__dirname, 'club', 'public', 'connections.html');
const CLUB_MODULES_HTML_PATH = path.join(__dirname, 'club', 'public', 'modules.html');
const CLUB_CONTENT_HTML_PATH = path.join(__dirname, 'club', 'public', 'content.html');
const CLUB_PERFORMANCE_HTML_PATH = path.join(__dirname, 'club', 'public', 'performance.html');
const CLUB_CHALLENGE_HTML_PATH = path.join(__dirname, 'club', 'public', 'challenge.html');
const CLUB_SHELL_CSS_PATH = path.join(__dirname, 'club', 'public', 'club-shell.css');
const CLUB_SHELL_JS_PATH = path.join(__dirname, 'club', 'public', 'club-shell.js');
const CLUB_STEPPER_JS_PATH = path.join(__dirname, 'club', 'public', 'module-stepper.js');
const CLUB_CHANNEL_CSS_PATH = path.join(__dirname, 'club', 'public', 'channel-module.css');
const CLUB_CHANNEL_JS_PATH = path.join(__dirname, 'club', 'public', 'channel-module.js');
const CLUB_CHANNEL_HTML_PATHS = {
  'instagram-facebook': path.join(__dirname, 'club', 'public', 'channel-instagram-facebook.html'),
  'tiktok': path.join(__dirname, 'club', 'public', 'channel-tiktok.html'),
  'linkedin': path.join(__dirname, 'club', 'public', 'channel-linkedin.html'),
  'youtube': path.join(__dirname, 'club', 'public', 'channel-youtube.html'),
  'google': path.join(__dirname, 'club', 'public', 'channel-google.html'),
  'pinterest': path.join(__dirname, 'club', 'public', 'channel-pinterest.html'),
  'website-seo': path.join(__dirname, 'club', 'public', 'channel-website-seo.html'),
  'groups': path.join(__dirname, 'club', 'public', 'channel-groups.html'),
  'purchase-path': path.join(__dirname, 'club', 'public', 'channel-purchase-path.html'),
};
const PORT = process.env.BRIDGE_PORT || 5679;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function runScriptIn(dir, scriptName, args) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [path.join(dir, scriptName), ...args],
      { cwd: dir, maxBuffer: 20 * 1024 * 1024, windowsHide: true },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(stderr || err.message));
        } else {
          resolve(stdout.trim());
        }
      }
    );
  });
}
function runScript(scriptName, args) {
  return runScriptIn(SCRIPTS_DIR, scriptName, args);
}
function runImplementationScript(scriptName, args) {
  return runScriptIn(IMPLEMENTATION_DIR, scriptName, args);
}

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

const routes = {
  '/create-engagement': async (body) => {
    // body is the raw Tally webhook payload; base64-encode it as an argument
    // per create-engagement.mjs's --payload-b64 convention (avoids shell
    // quoting issues with large arbitrary JSON).
    const b64 = Buffer.from(JSON.stringify(body)).toString('base64');
    const out = await runScript('create-engagement.mjs', ['--payload-b64', b64]);
    return JSON.parse(out);
  },
  '/launch-runner': async (body) => {
    if (!body.slug) throw new Error('Missing "slug" in request body');
    const out = await runScript('launch-runner.mjs', [body.slug]);
    return JSON.parse(out);
  },
  '/build-email-payload': async (body) => {
    if (!body.mode || !body.slug) throw new Error('Missing "mode" or "slug" in request body');
    const out = await runScript('build-resend-payload.mjs', [body.mode, body.slug]);
    return JSON.parse(out);
  },
  '/check-token': async (body) => {
    if (!body.slug || !body.token) throw new Error('Missing "slug" or "token" in request body');
    const out = await runScript('check-and-consume-token.mjs', [body.slug, body.token]);
    return JSON.parse(out);
  },
  '/mark-delivered': async (body) => {
    if (!body.slug) throw new Error('Missing "slug" in request body');
    const out = await runScript('mark-delivered.mjs', [body.slug]);
    return JSON.parse(out);
  },
  // --- Operator dashboard: Approve & Send (Phase 4, fixed 2026-08-29) -----
  // The actual logic lives in lib/approve-and-send.mjs (so it's unit-
  // testable with a stubbed Resend call — see test/approve-and-send.test.mjs)
  // — this route is just the thin HTTP wrapper. Order of operations: verify
  // fresh status + both PDFs on disk -> build the real email (with the real
  // PDF attachments) -> send via Resend -> only once Resend confirms
  // acceptance, approve + mark delivered (which also syncs the customer
  // tracker, AFTER delivery). On any failure before that point, order.json
  // is left untouched at 'awaiting_final_review', so a second click (after
  // the first genuinely succeeded) is rejected rather than sending twice,
  // while a second click after a FAILURE is a legitimate manual retry, not
  // a duplicate send. No token needed the way the email-link flow
  // (check-and-consume-token.mjs) needs one — this bridge is localhost-only,
  // never exposed publicly (see the server startup comment), so the request
  // reaching this route at all already proves operator intent.
  '/approve-and-send': async (body) => {
    return approveAndSend(body.slug, { runScript });
  },
  // --- Operator dashboard: Accept Review & Continue (wording/UX pass) -----
  // For a needs_attention order that is really "report done, one internal
  // completeness check needs a human call" (dashboard's reviewRequired
  // flag) rather than a genuinely broken run. Moves the order to
  // awaiting_final_review via the EXISTING order-state system
  // (recordManualReviewAcceptance, alongside recordFailure/
  // recordReadyForReview/recordApproval) so Approve & Send's existing
  // status check picks it up naturally -- this route never sends anything
  // itself. Eligibility is re-checked fresh from order.json on every call
  // (not trusted from the dashboard's last render), so it can't be used on
  // a genuine failure, a customer-action-required case, or fired twice.
  '/accept-review-and-continue': async (body) => {
    if (!body.slug) throw new Error('Missing "slug" in request body');
    const slug = body.slug;
    const order = await loadOrder(slug);
    if (!order) throw new Error(`No order.json found for slug "${slug}"`);
    if (order.status !== 'needs_attention') {
      throw new Error(`Order "${slug}" is not needs_attention (current status: "${order.status}") — nothing to accept, or it was already accepted.`);
    }
    if (order.failure?.customerActionRequired) {
      throw new Error(`Order "${slug}" requires customer action, not an operator review acceptance.`);
    }
    if (!order.reportPdfPath || !order.appendixPdfPath) {
      throw new Error(`Order "${slug}" has no complete report+appendix on file — this is a genuine failure, not a reviewable one.`);
    }

    await recordManualReviewAcceptance(slug, order.productType, {
      operator: 'dashboard-operator',
      note: 'Accepted via operator dashboard after manual report/appendix review.',
    });
    await syncOrderToWordPress(slug).catch(() => {});
    return { ok: true, status: 'awaiting_final_review' };
  },
  '/check-pending-intakes': async () => {
    const out = await runScript('check-pending-intakes.mjs', []);
    return JSON.parse(out);
  },

  // --- Implementation product routes -----------------------------------
  '/create-implementation-engagement': async (body) => {
    const b64 = Buffer.from(JSON.stringify(body)).toString('base64');
    const out = await runImplementationScript('create-implementation-engagement.mjs', ['--payload-b64', b64]);
    return JSON.parse(out);
  },
  '/register-site-connection': async (body) => {
    // Called from the "Implementation — Site Connection" n8n webhook, which
    // is what's actually public (the connector plugin can't reach this
    // bridge server directly — same host.docker.internal boundary as every
    // other route here, just approached from the opposite direction: n8n's
    // public webhook is what a real customer's site can reach).
    const b64 = Buffer.from(JSON.stringify(body)).toString('base64');
    const out = await runImplementationScript('register-site-connection.mjs', ['--payload-b64', b64]);
    return JSON.parse(out);
  },
  '/run-implementation': async (body) => {
    if (!body.slug) throw new Error('Missing "slug" in request body');
    const out = await runImplementationScript('launch-implementation.mjs', [body.slug]);
    return JSON.parse(out);
  },
  '/build-connect-email': async (body) => {
    if (!body.slug) throw new Error('Missing "slug" in request body');
    const out = await runImplementationScript('build-connect-email.mjs', [body.slug]);
    return JSON.parse(out);
  },
  '/engagement-status': async (body) => {
    if (!body.slug) throw new Error('Missing "slug" in request body');
    const mod = await import('./implementation/lib/engagement-status.mjs');
    const status = await mod.getEngagementStatus(body.slug);
    if (!status) throw new Error(`No engagement found for slug "${body.slug}"`);
    return status;
  },

  // --- Order-state safety route (Phase 2) -------------------------------
  // Called from n8n's "Discover — Engagement Complete" workflow as the
  // AUTHORITATIVE readiness check, replacing blind trust in the runner's
  // own webhook payload (which could in principle be stale/replayed) or any
  // historical run-result.json (which this route never reads at all — it
  // only ever reads the current clients/<slug>/order.json). order.json's
  // `status` field reaches 'awaiting_final_review' one of two ways: the
  // automated gate (recordReadyForReview() in run-discover.mjs, reached
  // when evaluateRunOutcome() determined readyForDelivery === true), or an
  // operator's explicit "Accept Review & Continue" on a needs_attention
  // order with a genuinely complete report+appendix (recordManualReviewAcceptance()
  // — the completeness gate itself is never changed; the ORIGINAL failure
  // stays recorded on order.failure either way). Both represent a
  // considered, evidenced "ready" call — so checking `status` here IS
  // checking the real readiness gate, not a separate one.
  '/order-status': async (body) => {
    if (!body.slug) throw new Error('Missing "slug" in request body');
    const order = await loadOrder(body.slug);
    if (!order) throw new Error(`No order.json found for slug "${body.slug}"`);
    return order;
  },
};

// --- Dashboard-facing GET routes (Phase 2) ----------------------------------
// Read-only, browser-fetched (no n8n involvement). Served from this SAME
// process — no second server — per the phase's explicit instruction.
const getJsonRoutes = {
  '/orders': async () => listOrders(),
  '/order-detail': async (query) => {
    if (!query.slug) throw new Error('Missing "slug" query parameter');
    const detail = await getOrderDetail(query.slug);
    if (!detail) throw new Error(`No order found for slug "${query.slug}"`);
    return detail;
  },
  // --- $1K Club (browser-fetched, same-origin, no n8n involvement) --------
  // Identity comes ONLY from the verified Authorization: Bearer token, never
  // from a query param -- a client-supplied slug would let anyone view
  // another customer's business data by guessing it (see onboarding-service.mjs).
  '/club/results': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getResultsForToken(token);
  },
  // --- Module 2 (Offer Builder) -------------------------------------------
  '/club/module2/context': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getModule2Context(token);
  },
  '/club/module2/results': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getModule2ResultsForToken(token);
  },
  // --- Module 3 (Customer Discovery Map) -----------------------------------
  '/club/module3/context': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getModule3Context(token);
  },
  '/club/module3/results': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getModule3ResultsForToken(token);
  },
  // --- Module 4 (Channel Selector + $1K Channel Plan) ----------------------
  '/club/module4/context': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getModule4Context(token);
  },
  '/club/module4/results': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getModule4ResultsForToken(token);
  },
  // --- Module 5 (Messaging & Content Builder) ------------------------------
  '/club/module5/context': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getModule5Context(token);
  },
  '/club/module5/results': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getModule5ResultsForToken(token);
  },
  // --- Module 6 (Sales Path Builder) ---------------------------------------
  '/club/module6/context': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getModule6Context(token);
  },
  '/club/module6/results': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getModule6ResultsForToken(token);
  },
  '/club/overview/state': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getOverviewForToken(token);
  },
  // --- Module 7 (Weekly Growth Review) --------------------------------------
  '/club/content/state': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getContentStudioState(token);
  },
  '/club/connections/requirements': async () => getIntegrationRequirements(),
  '/club/review/state': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getGrowthReviewState(token);
  },
  // --- $1K Challenge ---------------------------------------------------------
  '/club/challenge/state': async (_query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return getChallengeState(token);
  },
  // --- Challenge content opportunities -----------------------------------
  '/club/opportunities/state': async (query, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    // query is a plain object (Object.fromEntries(url.searchParams)), not a
    // URLSearchParams instance -- plain property access, not .get().
    const raw = query?.activePlatforms;
    const activePlatforms = raw ? raw.split(',').filter(Boolean) : undefined;
    return getOpportunityState(token, { activePlatforms });
  },
};

// POST routes fetched directly by the Club onboarding page's browser JS --
// kept separate from the n8n-facing `routes` table below (different caller,
// different trust boundary: a customer's browser, not the Docker n8n
// container), same request/response shape.
const clubPostRoutes = {
  '/club/connections/import': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return importFromUrl(token, body?.url);
  },
  '/club/connections/apply-import': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return applyImportToProfile(token, { offer: body?.offer, priceUsd: body?.priceUsd, audience: body?.audience });
  },
  '/club/content/save': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return saveContent(token, { sourceIdea: body?.sourceIdea, platform: body?.platform, text: body?.text });
  },
  '/club/content/delete': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return deleteContent(token, body?.id);
  },
  '/club/website/metrics': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return submitManualMetricsForToken({ accessToken: token, values: body?.values });
  },
  '/club/onboarding': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return submitOnboarding({ accessToken: token, answers: body?.answers });
  },
  '/club/module2/positioning': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return generatePositioning({ accessToken: token, answers: body?.answers });
  },
  '/club/module2/submit': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return submitModule2({ accessToken: token, answers: body?.answers });
  },
  '/club/module3/language-hypotheses': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return generateLanguageHypotheses({ accessToken: token, answers: body?.answers });
  },
  '/club/module3/submit': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return submitModule3({ accessToken: token, answers: body?.answers });
  },
  '/club/module4/submit': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return submitModule4({ accessToken: token, answers: body?.answers });
  },
  '/club/module5/core-message': async (_body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return generateCoreMessage({ accessToken: token });
  },
  '/club/module5/submit': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return submitModule5({ accessToken: token, answers: body?.answers });
  },
  '/club/module6/submit': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return submitModule6({ accessToken: token, answers: body?.answers });
  },
  '/club/review/submit': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return submitGrowthReview({ accessToken: token, answers: body?.answers });
  },
  '/club/challenge/start': async (_body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return startChallengeAttempt(token);
  },
  '/club/challenge/claim': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return submitAchievementClaim(token, { challengeId: body?.challengeId, claimedRevenueUsd: body?.claimedRevenueUsd, note: body?.note });
  },
  '/club/challenge/reward-choice': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return submitRewardChoice(token, { challengeId: body?.challengeId, choice: body?.choice });
  },
  '/club/opportunities/plan': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return planOpportunity(token, { assignmentId: body?.assignmentId });
  },
  '/club/opportunities/posted': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return markOpportunityPosted(token, { assignmentId: body?.assignmentId });
  },
  '/club/opportunities/result': async (body, headers) => {
    const token = extractBearerToken(headers);
    if (!token) return { ok: false, reason: 'missing_access_token' };
    return recordOpportunityResult(token, { assignmentId: body?.assignmentId, metrics: body?.metrics });
  },
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/health') {
    return send(res, 200, { ok: true });
  }

  // --- Dashboard page itself (Phase 2) ------------------------------------
  if (req.method === 'GET' && url.pathname === '/dashboard') {
    try {
      const html = await readFile(DASHBOARD_HTML_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      return send(res, 500, { error: `Could not load dashboard HTML: ${err.message}` });
    }
  }

  // --- $1K Club onboarding/results page ------------------------------------
  if (req.method === 'GET' && url.pathname === '/club') {
    try {
      const html = await readFile(CLUB_HTML_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      return send(res, 500, { error: `Could not load club HTML: ${err.message}` });
    }
  }

  if (req.method === 'GET' && url.pathname === '/club/overview') {
    try {
      const html = await readFile(CLUB_OVERVIEW_HTML_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      return send(res, 500, { error: `Could not load club overview HTML: ${err.message}` });
    }
  }

  // Website & Conversion and Growth Review are now consolidated into one
  // Performance view; these routes redirect rather than disappear, so any
  // existing link/bookmark to either still works (query string, including
  // a token handoff, is preserved).
  if (req.method === 'GET' && url.pathname === '/club/website') {
    res.writeHead(302, { Location: `/club/performance${url.search}` });
    return res.end();
  }

  if (req.method === 'GET' && url.pathname === '/club/review') {
    const hash = '#review';
    const sep = url.search ? `${url.search}${hash}` : hash;
    res.writeHead(302, { Location: `/club/performance${sep}` });
    return res.end();
  }

  if (req.method === 'GET' && url.pathname === '/club/performance') {
    try {
      const html = await readFile(CLUB_PERFORMANCE_HTML_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      return send(res, 500, { error: `Could not load club performance HTML: ${err.message}` });
    }
  }

  if (req.method === 'GET' && url.pathname === '/club/challenge') {
    try {
      const html = await readFile(CLUB_CHALLENGE_HTML_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      return send(res, 500, { error: `Could not load club challenge HTML: ${err.message}` });
    }
  }

  if (req.method === 'GET' && url.pathname === '/club/content') {
    try {
      const html = await readFile(CLUB_CONTENT_HTML_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      return send(res, 500, { error: `Could not load club content HTML: ${err.message}` });
    }
  }

  if (req.method === 'GET' && url.pathname === '/club/connections') {
    const html = await readFile(CLUB_CONNECTIONS_HTML_PATH, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  // Channel modules live under /club/channel/<name> -- the 8-channel
  // curriculum from the 2026-09-16/17 rebuild. Freely accessible, not
  // gated behind Modules 1-2 or each other (per the rebuild-inspection
  // report, Founder Decision #3: a member should be able to use one
  // channel without completing the whole Club).
  if (req.method === 'GET' && url.pathname.startsWith('/club/channel/')) {
    const name = url.pathname.slice('/club/channel/'.length);
    const htmlPath = CLUB_CHANNEL_HTML_PATHS[name];
    if (!htmlPath) return send(res, 404, { error: 'Unknown channel module' });
    const html = await readFile(htmlPath, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }
  if (req.method === 'GET' && url.pathname === '/club/channel-module.css') {
    const css = await readFile(CLUB_CHANNEL_CSS_PATH, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
    return res.end(css);
  }
  if (req.method === 'GET' && url.pathname === '/club/channel-module.js') {
    const js = await readFile(CLUB_CHANNEL_JS_PATH, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
    return res.end(js);
  }

  // --- $1K Club module index (real completion state, fixes Modules/Growth
  // Review both silently resolving to /club/review for a member who has
  // finished every module) ------------------------------------------------
  if (req.method === 'GET' && url.pathname === '/club/modules') {
    const html = await readFile(CLUB_MODULES_HTML_PATH, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  // --- Shared Club chrome (header/sidebar) used by every signed-in Club
  // page except Home, which keeps its own frozen copy of the same look ----
  if (req.method === 'GET' && url.pathname === '/club/club-shell.css') {
    const css = await readFile(CLUB_SHELL_CSS_PATH, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
    return res.end(css);
  }
  if (req.method === 'GET' && url.pathname === '/club/club-shell.js') {
    const js = await readFile(CLUB_SHELL_JS_PATH, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
    return res.end(js);
  }
  if (req.method === 'GET' && url.pathname === '/club/module-stepper.js') {
    const js = await readFile(CLUB_STEPPER_JS_PATH, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
    return res.end(js);
  }

  // --- $1K Club Module 2 (Offer Builder) page -------------------------------
  if (req.method === 'GET' && url.pathname === '/club/module2') {
    try {
      const html = await readFile(CLUB_MODULE2_HTML_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      return send(res, 500, { error: `Could not load club module2 HTML: ${err.message}` });
    }
  }

  // --- $1K Club Module 3 (Customer Discovery Map) page ----------------------
  if (req.method === 'GET' && url.pathname === '/club/module3') {
    try {
      const html = await readFile(CLUB_MODULE3_HTML_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      return send(res, 500, { error: `Could not load club module3 HTML: ${err.message}` });
    }
  }

  // --- $1K Club Module 4 (Channel Selector) page ----------------------------
  if (req.method === 'GET' && url.pathname === '/club/module4') {
    try {
      const html = await readFile(CLUB_MODULE4_HTML_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      return send(res, 500, { error: `Could not load club module4 HTML: ${err.message}` });
    }
  }

  // --- $1K Club Module 5 (Messaging & Content Builder) page -----------------
  if (req.method === 'GET' && url.pathname === '/club/module5') {
    try {
      const html = await readFile(CLUB_MODULE5_HTML_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      return send(res, 500, { error: `Could not load club module5 HTML: ${err.message}` });
    }
  }

  // --- $1K Club Module 6 (Sales Path Builder) page --------------------------
  if (req.method === 'GET' && url.pathname === '/club/module6') {
    try {
      const html = await readFile(CLUB_MODULE6_HTML_PATH, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(html);
    } catch (err) {
      return send(res, 500, { error: `Could not load club module6 HTML: ${err.message}` });
    }
  }

  // --- Report PDF serving (Phase 2, Part 4's "Preview/Open functionality") ---
  // Only ever serves the exact path order.json itself recorded as this
  // order's reportPdfPath/appendixPdfPath — never an arbitrary path, never
  // "whatever PDF happens to sit in that client folder." If order.json says
  // null, this 404s; it does not go looking for one anyway.
  if (req.method === 'GET' && url.pathname === '/report-file') {
    try {
      const slug = url.searchParams.get('slug');
      const type = url.searchParams.get('type');
      if (!slug || !['report', 'appendix'].includes(type)) {
        throw new Error('Missing/invalid "slug" or "type" query parameter (type must be "report" or "appendix").');
      }
      const order = await loadOrder(slug);
      const relPath = type === 'report' ? order?.reportPdfPath : order?.appendixPdfPath;
      if (!relPath) throw new Error(`No ${type} PDF available for "${slug}" per canonical order state.`);
      const buf = await readFile(resolveVaultRelativePath(relPath));
      // Content-Length is set explicitly (not left to Node's default
      // chunked transfer-encoding) -- without a known length up front,
      // Chrome's own PDF viewer can fall back to treating the response as a
      // download (a native Save-As picker, not an Explorer window, but easy
      // to mistake for one) instead of rendering it inline in the tab.
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Length': buf.length,
        'Content-Disposition': `inline; filename="${slug}-${type}.pdf"`,
      });
      return res.end(buf);
    } catch (err) {
      console.error(`[/report-file] ${err.message}`);
      return send(res, 404, { error: err.message });
    }
  }

  // --- Dashboard JSON reads (Phase 2) --------------------------------------
  if (req.method === 'GET' && getJsonRoutes[url.pathname]) {
    try {
      const query = Object.fromEntries(url.searchParams);
      const result = await getJsonRoutes[url.pathname](query, req.headers);
      return send(res, 200, result);
    } catch (err) {
      console.error(`[${url.pathname}] ${err.message}`);
      return send(res, 500, { error: err.message });
    }
  }

  // --- Club POST routes (browser-facing) -----------------------------------
  if (req.method === 'POST' && clubPostRoutes[url.pathname]) {
    try {
      const body = await readJsonBody(req);
      const result = await clubPostRoutes[url.pathname](body, req.headers);
      return send(res, 200, result);
    } catch (err) {
      console.error(`[${url.pathname}] ${err.message}`);
      return send(res, 500, { error: err.message });
    }
  }

  // --- Existing n8n-facing POST routes (unchanged) -------------------------
  const handler = routes[url.pathname];
  if (req.method !== 'POST' || !handler) {
    return send(res, 404, { error: `No route for ${req.method} ${url.pathname}` });
  }
  try {
    const body = await readJsonBody(req);
    const result = await handler(body);
    send(res, 200, result);
  } catch (err) {
    console.error(`[${url.pathname}] ${err.message}`);
    send(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Bridge server listening on http://localhost:${PORT} (reachable from Docker as http://host.docker.internal:${PORT})`);
});
