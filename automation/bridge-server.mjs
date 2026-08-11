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
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = path.join(__dirname, 'n8n', 'scripts');
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

function runScript(scriptName, args) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [path.join(SCRIPTS_DIR, scriptName), ...args],
      { cwd: SCRIPTS_DIR, maxBuffer: 20 * 1024 * 1024, windowsHide: true },
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
};

const server = createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    return send(res, 200, { ok: true });
  }
  const handler = routes[req.url];
  if (req.method !== 'POST' || !handler) {
    return send(res, 404, { error: `No route for ${req.method} ${req.url}` });
  }
  try {
    const body = await readJsonBody(req);
    const result = await handler(body);
    send(res, 200, result);
  } catch (err) {
    console.error(`[${req.url}] ${err.message}`);
    send(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Bridge server listening on http://localhost:${PORT} (reachable from Docker as http://host.docker.internal:${PORT})`);
});
