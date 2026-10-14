/**
 * club-public-proxy.mjs tests. A fake upstream (a plain http.Server, not
 * the real bridge-server.mjs) records every request it actually receives,
 * so a blocked request can be proven to have never reached "bridge-server"
 * at all -- not just that the proxy's own response was a 404.
 */
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

import { createProxyServer, isAllowed, ALLOWLIST } from '../club-public-proxy.mjs';

let fakeUpstream;
let fakeUpstreamPort;
let received; // every request the fake upstream actually got

let proxyServer;
let proxyPort;
let proxyOrigin;

before(async () => {
  fakeUpstream = createServer((req, res) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      received.push({
        method: req.method,
        url: req.url,
        authorization: req.headers.authorization ?? null,
        cookie: req.headers.cookie ?? null,
        body,
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, from: 'fake-upstream', url: req.url }));
    });
  });
  await new Promise((resolve) => fakeUpstream.listen(0, resolve));
  fakeUpstreamPort = fakeUpstream.address().port;

  proxyServer = createProxyServer({ upstreamOrigin: `http://127.0.0.1:${fakeUpstreamPort}`, logger: { warn() {}, error() {} } });
  await new Promise((resolve) => proxyServer.listen(0, resolve));
  proxyPort = proxyServer.address().port;
  proxyOrigin = `http://127.0.0.1:${proxyPort}`;
});

after(async () => {
  await new Promise((resolve) => proxyServer.close(resolve));
  await new Promise((resolve) => fakeUpstream.close(resolve));
});

beforeEach(() => {
  received = [];
});

// --- Sensitive bridge-server routes must never pass through -----------------
// The exact routes the task called out, plus a couple of neighbors from the
// same trust boundary (operator dashboard reads, implementation product).
const SENSITIVE_ROUTES = [
  { method: 'GET', path: '/dashboard' },
  { method: 'GET', path: '/orders' },
  { method: 'GET', path: '/order-detail?slug=mulberry-creek' },
  { method: 'POST', path: '/create-engagement' },
  { method: 'POST', path: '/launch-runner' },
  { method: 'POST', path: '/approve-and-send' },
  { method: 'POST', path: '/mark-delivered' },
  { method: 'POST', path: '/accept-review-and-continue' },
  { method: 'POST', path: '/check-pending-intakes' },
  { method: 'POST', path: '/order-status' },
  { method: 'POST', path: '/create-implementation-engagement' },
  { method: 'POST', path: '/register-site-connection' },
  { method: 'POST', path: '/run-implementation' },
  { method: 'GET', path: '/report-file?slug=mulberry-creek&type=report' },
];

for (const { method, path: p } of SENSITIVE_ROUTES) {
  test(`blocks ${method} ${p} -- never reaches upstream, proxy returns 404`, async () => {
    const res = await fetch(`${proxyOrigin}${p}`, { method, headers: { 'Content-Type': 'application/json' }, body: method === 'POST' ? '{}' : undefined });
    assert.equal(res.status, 404);
    assert.equal(received.length, 0, `fake upstream should never have been contacted for ${method} ${p}`);
  });
}

test('blocks a hypothetical future module route not yet on the allow-list (fail closed by default, not by /club/* prefix)', async () => {
  const res = await fetch(`${proxyOrigin}/club/module7/context`);
  assert.equal(res.status, 404);
  assert.equal(received.length, 0);
});

test('blocks a wrong HTTP method on an otherwise-allowed path', async () => {
  const res = await fetch(`${proxyOrigin}/club/onboarding`, { method: 'GET' });
  assert.equal(res.status, 404);
  assert.equal(received.length, 0);

  const res2 = await fetch(`${proxyOrigin}/club`, { method: 'POST', body: '{}' });
  assert.equal(res2.status, 404);
  assert.equal(received.length, 0);
});

// --- Legitimate Club traffic must still reach the app ------------------------
test('every entry on the allow-list reaches the fake upstream and its response is relayed back', async () => {
  for (const { method, path: p } of ALLOWLIST) {
    received = [];
    const res = await fetch(`${proxyOrigin}${p}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' },
      body: method === 'POST' ? JSON.stringify({ answers: {} }) : undefined,
    });
    assert.equal(res.status, 200, `${method} ${p} should reach upstream and relay its 200`);
    const json = await res.json();
    assert.equal(json.from, 'fake-upstream');
    assert.equal(received.length, 1, `${method} ${p} should have reached upstream exactly once`);
    assert.equal(received[0].method, method);
    assert.equal(received[0].url, p);
  }
});

test('forwards the Authorization header upstream unchanged (identity the Club actually relies on)', async () => {
  await fetch(`${proxyOrigin}/club/results`, { headers: { Authorization: 'Bearer abc.def' } });
  assert.equal(received.length, 1);
  assert.equal(received[0].authorization, 'Bearer abc.def');
});

test('does not forward a Cookie header upstream (no cookie-based session exists for the Club; nothing to leak)', async () => {
  await fetch(`${proxyOrigin}/club/results`, { headers: { Authorization: 'Bearer abc.def', Cookie: 'session=should-not-be-forwarded' } });
  assert.equal(received.length, 1);
  assert.equal(received[0].cookie, null);
});

test('forwards a POST body upstream intact', async () => {
  const payload = JSON.stringify({ answers: { businessType: 'ecommerce' } });
  await fetch(`${proxyOrigin}/club/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer abc.def' },
    body: payload,
  });
  assert.equal(received.length, 1);
  assert.equal(received[0].body, payload);
});

// --- isAllowed() unit coverage (no server involved) --------------------------
test('isAllowed is an exact-match allow-list, not a prefix match', () => {
  assert.equal(isAllowed('GET', '/club'), true);
  assert.equal(isAllowed('GET', '/club/overview'), true);
  assert.equal(isAllowed('GET', '/club/overview/state'), true);
  assert.equal(isAllowed('GET', '/club/website'), true);
  assert.equal(isAllowed('GET', '/club/review'), true);
  assert.equal(isAllowed('GET', '/club/review/state'), true);
  assert.equal(isAllowed('POST', '/club/review/submit'), true);
  assert.equal(isAllowed('POST', '/club/review/state'), false);
  assert.equal(isAllowed('GET', '/club/challenge/state'), true);
  assert.equal(isAllowed('POST', '/club/challenge/start'), true);
  assert.equal(isAllowed('GET', '/club/opportunities/state'), true);
  assert.equal(isAllowed('POST', '/club/opportunities/plan'), true);
  assert.equal(isAllowed('POST', '/club/opportunities/posted'), true);
  assert.equal(isAllowed('POST', '/club/opportunities/result'), true);
  assert.equal(isAllowed('GET', '/club/opportunities/plan'), false);
  assert.equal(isAllowed('GET', '/club/connections'), true);
  assert.equal(isAllowed('POST', '/club/website/metrics'), true);
  assert.equal(isAllowed('POST', '/club/overview/state'), false);
  assert.equal(isAllowed('GET', '/club/'), false); // trailing slash is a different string on purpose
  assert.equal(isAllowed('GET', '/club/module99'), false);
  assert.equal(isAllowed('GET', '/dashboard'), false);
  assert.equal(isAllowed('POST', '/club/onboarding'), true);
  assert.equal(isAllowed('DELETE', '/club/onboarding'), false);
});
