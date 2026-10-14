#!/usr/bin/env node
/**
 * Public-facing allow-list proxy for the $1K Club external-access test path.
 *
 * bridge-server.mjs is safe TODAY only because it has never been reachable
 * from the internet -- several of its routes (/create-engagement,
 * /launch-runner, /approve-and-send, /mark-delivered, /dashboard, /orders,
 * /order-detail, /order-status, /accept-review-and-continue,
 * /check-pending-intakes, and the whole Implementation-product route set)
 * have ZERO authentication and rely entirely on "this bridge is
 * localhost-only, never exposed publicly" (see bridge-server.mjs's own
 * /approve-and-send comment). Putting a Cloudflare Tunnel in front of
 * bridge-server.mjs directly would strip that protection from every one of
 * those routes, not just /club/*.
 *
 * This proxy sits between the tunnel and bridge-server.mjs and forwards
 * ONLY an explicit (method, exact path) allow-list -- the routes a real
 * customer's browser actually calls to use the Club, enumerated by reading
 * bridge-server.mjs's current route tables directly (not by guessing or by
 * matching a "/club/*" prefix). Anything not on this list is rejected
 * BEFORE bridge-server.mjs ever sees the request -- fail closed. A future
 * bridge route (a new module, a dashboard feature, anything) is never
 * accidentally exposed by this proxy; it has to be added here on purpose,
 * by someone reading this file's allow-list and deciding it belongs.
 *
 * Deliberately a separate file -- bridge-server.mjs is not modified.
 */
import { createServer, request as httpRequest } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Exact (method, path) pairs currently required by the live Club frontend
// (club/public/index.html, module2.html through module6.html) against the
// live bridge-server.mjs route tables. Verified by reading both directly,
// not assumed from docs. Updated for Module 5 (2026-09-12, added
// retroactively -- this proxy was built before Module 5 landed and never
// exposed its routes), Module 6 (2026-09-12), and Module 7 / Growth Review
// (2026-09-12: GET /club/review/state + POST /club/review/submit, added
// alongside the two routes so this list never lags a shipped feature the
// way it lagged Module 5), and the $1K Challenge + content opportunities
// slice (2026-09-13) -- each addition means someone read
// bridge-server.mjs's actual route tables and this file's own allow-list
// before deciding a route belongs, exactly as intended.
export const ALLOWLIST = Object.freeze([
  // --- Health -----------------------------------------------------------
  { method: 'GET', path: '/health' },

  // --- Club pages (static HTML, served by bridge-server.mjs) -------------
  { method: 'GET', path: '/club' },
  { method: 'GET', path: '/club/overview' },
  { method: 'GET', path: '/club/website' },
  { method: 'GET', path: '/club/review' },
  { method: 'GET', path: '/club/connections' },
  { method: 'GET', path: '/club/module2' },
  { method: 'GET', path: '/club/module3' },
  { method: 'GET', path: '/club/module4' },
  { method: 'GET', path: '/club/module5' },
  { method: 'GET', path: '/club/module6' },

  // --- Club JSON reads ----------------------------------------------------
  // Token-gated in bridge-server.mjs; identity comes only from the
  // Authorization header, never a query param -- no query params to worry
  // about forwarding for any of these.
  { method: 'GET', path: '/club/results' },
  { method: 'GET', path: '/club/overview/state' },
  { method: 'GET', path: '/club/module2/context' },
  { method: 'GET', path: '/club/module2/results' },
  { method: 'GET', path: '/club/module3/context' },
  { method: 'GET', path: '/club/module3/results' },
  { method: 'GET', path: '/club/module4/context' },
  { method: 'GET', path: '/club/module4/results' },
  { method: 'GET', path: '/club/module5/context' },
  { method: 'GET', path: '/club/module5/results' },
  { method: 'GET', path: '/club/module6/context' },
  { method: 'GET', path: '/club/module6/results' },
  { method: 'GET', path: '/club/review/state' },
  { method: 'GET', path: '/club/challenge/state' },
  { method: 'GET', path: '/club/opportunities/state' },

  // --- Club JSON writes ---------------------------------------------------
  // Also token-gated in bridge-server.mjs.
  { method: 'POST', path: '/club/onboarding' },
  { method: 'POST', path: '/club/website/metrics' },
  { method: 'POST', path: '/club/module2/positioning' },
  { method: 'POST', path: '/club/module2/submit' },
  { method: 'POST', path: '/club/module3/language-hypotheses' },
  { method: 'POST', path: '/club/module3/submit' },
  { method: 'POST', path: '/club/module4/submit' },
  { method: 'POST', path: '/club/module5/core-message' },
  { method: 'POST', path: '/club/module5/submit' },
  { method: 'POST', path: '/club/module6/submit' },
  { method: 'POST', path: '/club/review/submit' },
  { method: 'POST', path: '/club/challenge/start' },
  { method: 'POST', path: '/club/opportunities/plan' },
  { method: 'POST', path: '/club/opportunities/posted' },
  { method: 'POST', path: '/club/opportunities/result' },
]);

const ALLOWED_SET = new Set(ALLOWLIST.map((r) => `${r.method} ${r.path}`));

/** @returns {boolean} true only for an exact (method, pathname) match on ALLOWLIST. */
export function isAllowed(method, pathname) {
  return ALLOWED_SET.has(`${method} ${pathname}`);
}

// Headers forwarded upstream -- deliberately short. Authorization carries
// the customer's signed access token (the only identity bridge-server.mjs
// trusts); Content-Type/Content-Length describe a POST's JSON body; Accept
// is harmless. Cookies are never forwarded: the Club has no cookie-based
// session, so there is nothing legitimate to carry, and refusing to forward
// unknown headers removes a whole class of accidental leakage.
const FORWARD_REQUEST_HEADERS = ['authorization', 'content-type', 'content-length', 'accept'];
const FORWARD_RESPONSE_HEADERS = ['content-type', 'content-length', 'content-disposition'];

/**
 * @param {object} opts
 * @param {string} opts.upstreamOrigin - e.g. "http://localhost:5679"
 * @param {Console} [opts.logger]
 * @returns {import('node:http').Server}
 */
export function createProxyServer({ upstreamOrigin, logger = console } = {}) {
  if (!upstreamOrigin) throw new Error('createProxyServer requires upstreamOrigin');
  const upstream = new URL(upstreamOrigin);

  return createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const method = req.method || 'GET';

    if (!isAllowed(method, url.pathname)) {
      logger.warn?.(`[club-proxy] blocked ${method} ${url.pathname}`);
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      req.resume(); // drain/discard the blocked request's body; upstream is never contacted
      return;
    }

    const headers = {};
    for (const name of FORWARD_REQUEST_HEADERS) {
      if (req.headers[name] !== undefined) headers[name] = req.headers[name];
    }

    const upstreamReq = httpRequest(
      {
        protocol: upstream.protocol,
        hostname: upstream.hostname,
        port: upstream.port,
        method,
        path: url.pathname + url.search,
        headers,
      },
      (upstreamRes) => {
        const resHeaders = {};
        for (const name of FORWARD_RESPONSE_HEADERS) {
          if (upstreamRes.headers[name] !== undefined) resHeaders[name] = upstreamRes.headers[name];
        }
        res.writeHead(upstreamRes.statusCode || 502, resHeaders);
        upstreamRes.pipe(res);
      }
    );

    upstreamReq.on('error', (err) => {
      logger.error?.(`[club-proxy] upstream error for ${method} ${url.pathname}: ${err.message}`);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Upstream unavailable' }));
      } else {
        res.end();
      }
    });

    req.pipe(upstreamReq);
  });
}

const PORT = process.env.CLUB_PROXY_PORT || 5680;
const UPSTREAM_ORIGIN = process.env.CLUB_PROXY_UPSTREAM || 'http://localhost:5679';

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const server = createProxyServer({ upstreamOrigin: UPSTREAM_ORIGIN });
  server.listen(PORT, () => {
    console.log(
      `Club public proxy listening on http://localhost:${PORT} -> ${UPSTREAM_ORIGIN} (allow-listed Club routes + /health only, everything else fails closed)`
    );
  });
}
