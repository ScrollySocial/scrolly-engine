// Builds scrolly-comments.json (the n8n workflow) from the Code node sources in
// src/. Edit the .js files, run `node workflow/build.mjs`, then re-import:
//   docker compose exec n8n n8n import:workflow --input=/data/workflow/scrolly-comments.json
// The workflow id and webhook ids are fixed, so a re-import updates the same
// workflow and keeps the same webhook URLs.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const lib = readFileSync(join(here, 'src', '_lib.js'), 'utf8');
// Each node's own code runs inside an async function so the shared state is
// saved after it returns, whichever return it took.
const code = (file) =>
  `${lib}\nconst __result = await (async () => {\n${readFileSync(join(here, 'src', file), 'utf8')}\n})();\nsaveState();\nreturn __result;\n`;
const uuid = (seed) => {
  const h = createHash('sha256').update(`scrolly-comments:${seed}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

const nodes = [];
const add = (name, type, typeVersion, position, parameters, extra = {}) =>
  nodes.push({ id: uuid(`node:${name}`), name, type, typeVersion, position, parameters, ...extra });
const codeNode = (name, file, position) =>
  add(name, 'n8n-nodes-base.code', 2, position, { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: code(file) });
const webhook = (name, method, path, position, responseMode, extraParams = {}) =>
  add(name, 'n8n-nodes-base.webhook', 2, position, { httpMethod: method, path, responseMode, options: {}, ...extraParams }, { webhookId: uuid(`webhook:${name}`) });
const schedule = (name, interval, position) =>
  add(name, 'n8n-nodes-base.scheduleTrigger', 1.2, position, { rule: { interval: [interval] } });

add('About this workflow', 'n8n-nodes-base.stickyNote', 1, [-420, -260], {
  width: 420,
  height: 300,
  content:
    '## Scrolly comments\nInstagram comment with a keyword → freebie DM (automatic).\nEvery Instagram, YouTube and TikTok comment → sorted by free word rules → Notion **Comment inbox** as Needs draft.\nClaude (subscription) writes the drafts; set Status = Approved → posted within 10 minutes (TikTok: reply by hand).\nOptional: CLAUDE_API_DRAFTS=true drafts with the paid Claude API instead.\n\nTest mode is on until COMMENTS_DRY_RUN=false.\nCode lives in automation/n8n-comments/workflow/src (edit there, rebuild, re-import).',
});

webhook('Instagram check', 'GET', 'instagram', [0, 0], 'responseNode');
codeNode('Answer Meta check', 'answer-meta-check.js', [220, 0]);
add('Reply to Meta', 'n8n-nodes-base.respondToWebhook', 1.1, [440, 0], {
  respondWith: 'text',
  responseBody: '={{ $json.body }}',
  options: { responseCode: '={{ $json.status }}' },
});

webhook('Instagram comment', 'POST', 'instagram', [0, 200], 'onReceived', { options: { rawBody: true } });
codeNode('Read Instagram comment', 'read-instagram-comment.js', [220, 200]);
schedule('Every 30 min: YouTube', { field: 'minutes', minutesInterval: 30 }, [0, 400]);
codeNode('Fetch YouTube comments', 'fetch-youtube-comments.js', [220, 400]);
schedule('Daily 8am: TikTok', { field: 'days', daysInterval: 1, triggerAtHour: 8 }, [0, 600]);
codeNode('Fetch TikTok comments', 'fetch-tiktok-comments.js', [220, 600]);

codeNode('New comments only', 'new-comments-only.js', [480, 400]);
codeNode('Send keyword DMs', 'send-keyword-dms.js', [700, 400]);
codeNode('Sort comments', 'sort-comments.js', [920, 400]);
codeNode('Add to Comment inbox', 'add-to-inbox.js', [1140, 400]);

schedule('Every 10 min: approved replies', { field: 'minutes', minutesInterval: 10 }, [0, 800]);
codeNode('Post approved replies', 'post-approved-replies.js', [220, 800]);
schedule('Weekly: Instagram token', { field: 'weeks', weeksInterval: 1, triggerAtDay: [1], triggerAtHour: 6 }, [0, 1000]);
codeNode('Refresh Instagram token', 'refresh-instagram-token.js', [220, 1000]);
schedule('Daily 3am: YouTube cleanup', { field: 'days', daysInterval: 1, triggerAtHour: 3 }, [0, 1200]);
codeNode('YouTube cleanup', 'youtube-cleanup.js', [220, 1200]);

webhook('Run a job now', 'POST', 'comments-run', [-480, 700], 'onReceived');
codeNode('Pick job', 'pick-job.js', [-260, 700]);
webhook('Status check', 'GET', 'comments-status', [-480, 1000], 'lastNode', { responseData: 'firstEntryJson' });
codeNode('Status', 'status.js', [-260, 1000]);

const link = (...targets) => ({ main: [targets.map((node) => ({ node, type: 'main', index: 0 }))] });
const connections = {
  'Instagram check': link('Answer Meta check'),
  'Answer Meta check': link('Reply to Meta'),
  'Instagram comment': link('Read Instagram comment'),
  'Read Instagram comment': link('New comments only'),
  'Every 30 min: YouTube': link('Fetch YouTube comments'),
  'Fetch YouTube comments': link('New comments only'),
  'Daily 8am: TikTok': link('Fetch TikTok comments'),
  'Fetch TikTok comments': link('New comments only'),
  'New comments only': link('Send keyword DMs'),
  'Send keyword DMs': link('Sort comments'),
  'Sort comments': link('Add to Comment inbox'),
  'Every 10 min: approved replies': link('Post approved replies'),
  'Weekly: Instagram token': link('Refresh Instagram token'),
  'Daily 3am: YouTube cleanup': link('YouTube cleanup'),
  'Run a job now': link('Pick job'),
  'Pick job': link('Fetch YouTube comments', 'Fetch TikTok comments', 'Post approved replies', 'Refresh Instagram token', 'YouTube cleanup'),
  'Status check': link('Status'),
};

const workflow = {
  id: 'ScrollyComments1',
  name: 'Scrolly comments',
  active: false,
  nodes,
  connections,
  settings: { executionOrder: 'v1', saveManualExecutions: true },
  pinData: {},
  meta: { builtBy: 'automation/n8n-comments/workflow/build.mjs' },
};
writeFileSync(join(here, 'scrolly-comments.json'), JSON.stringify(workflow, null, 2) + '\n');
console.log(`built scrolly-comments.json: ${nodes.length} nodes`);
