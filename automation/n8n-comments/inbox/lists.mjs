// Email list connections for the signup page. Every signup is also kept on this server
// (inbox.json → subscribers, downloadable as CSV), so the built-in list works with no
// email tool at all. EMAIL_LIST picks where signups go as well:
//   builtin (default when no key is set), mailerlite, kit, mailchimp, beehiiv, flodesk, webhook.
// Each tool does one thing here: "add this email and put it in this group / tag / audience /
// publication / segment". Request shapes checked in each tool's own API docs on 2026-10-23.
// Answers to a keyword's questions go along too (checked in the docs 2026-10-29): a custom field in
// MailerLite, beehiiv and Flodesk (made the first time it's needed), a "field: answer" tag in Kit
// and Mailchimp. That part never costs a signup: if the tool refuses it, the email still goes in.
// No npm packages. Base URLs are settings so tests can point them at test/mock-apis.mjs.
import { createHash, createHmac } from 'node:crypto';

const env = (k, d = '') => (process.env[k] ?? '').trim() || d;
const md5 = (s) => createHash('md5').update(s).digest('hex');
const basic = (user, pass = '') => `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;

// The answers as { field, value }; field is the short name the owner gave the question ("sews").
const answerPairs = (s) => (s.answers || []).filter((a) => a.field && a.a).map((a) => ({ field: a.field, value: a.a }));
const answerTag = (p) => `${p.field}: ${p.value}`.slice(0, 100);
async function tryAnswers(s, fn, fallback) {
  const pairs = answerPairs(s);
  if (!pairs.length) return fallback;
  try {
    return await fn(pairs);
  } catch (e) {
    s.answersError = String(e.message || e).slice(0, 300);
    return fallback;
  }
}
// Field keys and ids already looked up or made, so each is made once (tool:list:name → key).
const fieldCache = new Map();
async function cachedField(id, make) {
  if (!fieldCache.has(id)) fieldCache.set(id, await make());
  return fieldCache.get(id);
}
async function call(name, base, method, path, headers, body) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'ChatManager (self-hosted)', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {}
  if (!res.ok) {
    const why = data.message || data.detail || data.title || data.errors?.[0]?.message || (Array.isArray(data.errors) ? data.errors.join(', ') : '') || text.slice(0, 200);
    throw new Error(`${name} answered ${res.status}${why ? `: ${why}` : ''}`);
  }
  return data;
}

// label: what one keyword's "list" is called in that tool. canCreate: the dashboard can make a new one.
const PROVIDERS = {
  builtin: {
    name: 'Built-in list',
    label: '',
    needsTarget: false,
    connected: () => true,
    add: async () => {},
  },

  webhook: {
    name: 'Webhook (Zapier, Make, n8n and others)',
    label: '',
    needsTarget: false,
    connected: () => /^https:\/\/\S+$/.test(env('LIST_WEBHOOK_URL')) || /^http:\/\/localhost[:/]/.test(env('LIST_WEBHOOK_URL')),
    // One POST per signup. With LIST_WEBHOOK_SECRET set, X-Signature is sha256=<HMAC of the body>.
    add: async (s) => {
      const body = JSON.stringify({ event: 'signup', email: s.email, keyword: s.keyword, freebie: s.freebie, platform: s.platform, consent: s.consent, signedUpAt: s.at, answers: s.answers || [], test: !!s.test });
      const headers = { 'Content-Type': 'application/json', 'User-Agent': 'ChatManager (self-hosted)' };
      if (env('LIST_WEBHOOK_SECRET')) headers['X-Signature'] = `sha256=${createHmac('sha256', env('LIST_WEBHOOK_SECRET')).update(body).digest('hex')}`;
      const res = await fetch(env('LIST_WEBHOOK_URL'), { method: 'POST', headers, body });
      if (!res.ok) throw new Error(`The webhook answered ${res.status}`);
    },
  },

  mailerlite: {
    name: 'MailerLite',
    label: 'group',
    needsTarget: true,
    canCreate: true,
    connected: () => !!env('MAILERLITE_API_KEY'),
    req(method, path, body) {
      return call('MailerLite', env('MAILERLITE_BASE', 'https://connect.mailerlite.com/api'), method, path, { Authorization: `Bearer ${env('MAILERLITE_API_KEY')}` }, body);
    },
    async targets() {
      const d = await this.req('GET', '/groups?limit=100&sort=name');
      return (d.data || []).map((g) => ({ id: String(g.id), name: g.name }));
    },
    async create(name) {
      const g = (await this.req('POST', '/groups', { name })).data || {};
      return { id: String(g.id), name: g.name };
    },
    // POST /subscribers adds or updates, and only ever adds groups; fields go in by key.
    async add(s) {
      const fields = await tryAnswers(s, async (pairs) => {
        const out = {};
        for (const p of pairs) out[await this.fieldKey(p.field)] = p.value;
        return out;
      }, {});
      await this.req('POST', '/subscribers', { email: s.email, groups: [s.listId], status: 'active', ...(Object.keys(fields).length ? { fields } : {}) });
    },
    fieldKey(name) {
      return cachedField(`mailerlite:${name.toLowerCase()}`, async () => {
        const found = ((await this.req('GET', `/fields?limit=100&filter[keyword]=${encodeURIComponent(name)}`)).data || []).find((f) => String(f.name).toLowerCase() === name.toLowerCase());
        const key = found?.key || ((await this.req('POST', '/fields', { name, type: 'text' })).data || {}).key;
        if (!key) throw new Error(`MailerLite didn't make the field "${name}"`);
        return key;
      });
    },
    // The keyword page's extra panel: group size and the email sequences that group starts.
    async detail(id) {
      const g = (await this.req('GET', `/groups/${id}`)).data || {};
      const autos = (await this.req('GET', '/automations?limit=100')).data || [];
      const starts = autos.filter((a) => (a.triggers || []).some((t) => (t.group_ids || []).map(String).includes(String(id))));
      return {
        group: { id: String(g.id), name: g.name, active: g.active_count ?? 0, url: `https://dashboard.mailerlite.com/groups/${id}` },
        automations: starts.map((a) => ({ id: String(a.id), name: a.name, enabled: !!a.enabled, emails: a.emails_count ?? 0, sent: a.stats?.sent ?? 0, openRate: a.stats?.open_rate?.string ?? a.stats?.open_rate ?? null, url: `https://dashboard.mailerlite.com/automations/${a.id}` })),
      };
    },
  },

  // Kit (ConvertKit) v4: the subscriber is created first, then tagged (tagging needs an existing subscriber).
  kit: {
    name: 'Kit',
    label: 'tag',
    needsTarget: true,
    canCreate: true,
    connected: () => !!env('KIT_API_KEY'),
    req(method, path, body) {
      return call('Kit', env('KIT_BASE', 'https://api.kit.com'), method, path, { 'X-Kit-Api-Key': env('KIT_API_KEY') }, body);
    },
    async targets() {
      const d = await this.req('GET', '/v4/tags?per_page=1000');
      return (d.tags || []).map((t) => ({ id: String(t.id), name: t.name }));
    },
    async create(name) {
      const t = (await this.req('POST', '/v4/tags', { name })).tag || {};
      return { id: String(t.id), name: t.name };
    },
    async add(s) {
      await this.req('POST', '/v4/subscribers', { email_address: s.email, state: 'active' });
      await this.req('POST', `/v4/tags/${encodeURIComponent(s.listId)}/subscribers`, { email_address: s.email });
      // Creating a tag that exists returns it (matched ignoring case), so this is safe every time.
      await tryAnswers(s, async (pairs) => {
        for (const p of pairs) {
          const t = (await this.req('POST', '/v4/tags', { name: answerTag(p) })).tag || {};
          if (!t.id) throw new Error(`Kit didn't make the tag "${answerTag(p)}"`);
          await this.req('POST', `/v4/tags/${t.id}/subscribers`, { email_address: s.email });
        }
      });
    },
  },

  // Mailchimp Marketing API v3: the key ends in the data center (…-us21). Add or update the member,
  // then tag them with the keyword (tags sent with the member are ignored for existing members).
  mailchimp: {
    name: 'Mailchimp',
    label: 'audience',
    needsTarget: true,
    canCreate: false,
    connected: () => /-[a-z]+\d+$/.test(env('MAILCHIMP_API_KEY')),
    req(method, path, body) {
      const key = env('MAILCHIMP_API_KEY');
      const base = env('MAILCHIMP_BASE', `https://${key.split('-').pop()}.api.mailchimp.com/3.0`);
      return call('Mailchimp', base, method, path, { Authorization: basic('chatmanager', key) }, body);
    },
    async targets() {
      const d = await this.req('GET', '/lists?count=100&fields=lists.id,lists.name');
      return (d.lists || []).map((l) => ({ id: String(l.id), name: l.name }));
    },
    async add(s) {
      const hash = md5(s.email.toLowerCase());
      await this.req('PUT', `/lists/${encodeURIComponent(s.listId)}/members/${hash}`, { email_address: s.email, status_if_new: 'subscribed' });
      await this.req('POST', `/lists/${encodeURIComponent(s.listId)}/members/${hash}/tags`, { tags: [{ name: `freebie-${s.keyword}`, status: 'active' }] });
      // Mailchimp makes a tag the first time it's used.
      await tryAnswers(s, (pairs) => this.req('POST', `/lists/${encodeURIComponent(s.listId)}/members/${hash}/tags`, { tags: pairs.map((p) => ({ name: answerTag(p), status: 'active' })) }));
    },
  },

  // beehiiv v2: subscribers join a publication; the keyword goes in utm_campaign so it shows in their reports.
  beehiiv: {
    name: 'beehiiv',
    label: 'publication',
    needsTarget: true,
    canCreate: false,
    connected: () => !!env('BEEHIIV_API_KEY'),
    req(method, path, body) {
      return call('beehiiv', env('BEEHIIV_BASE', 'https://api.beehiiv.com'), method, path, { Authorization: `Bearer ${env('BEEHIIV_API_KEY')}` }, body);
    },
    async targets() {
      const d = await this.req('GET', '/v2/publications?limit=100');
      return (d.data || []).map((p) => ({ id: String(p.id), name: p.name }));
    },
    // Custom fields must exist first (beehiiv quietly drops unknown ones), so they're made if missing.
    async add(s) {
      const pub = encodeURIComponent(s.listId);
      const custom = await tryAnswers(s, async (pairs) => {
        for (const p of pairs) {
          await cachedField(`beehiiv:${s.listId}:${p.field.toLowerCase()}`, async () => {
            const have = ((await this.req('GET', `/v2/publications/${pub}/custom_fields?limit=100`)).data || []).find((f) => String(f.display).toLowerCase() === p.field.toLowerCase());
            return have?.display || ((await this.req('POST', `/v2/publications/${pub}/custom_fields`, { kind: 'string', display: p.field })).data || {}).display || p.field;
          });
        }
        return pairs.map((p) => ({ name: p.field, value: p.value }));
      }, []);
      const d = await this.req('POST', `/v2/publications/${pub}/subscriptions`, {
        email: s.email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: (s.platform || 'instagram').toLowerCase(),
        utm_medium: 'chat-manager',
        utm_campaign: s.keyword,
        ...(custom.length ? { custom_fields: custom } : {}),
      });
      const warn = d.warnings || d.data?.warnings;
      if (custom.length && Array.isArray(warn) && warn.length) s.answersError = `beehiiv: ${warn.map((w) => w.message || w).join(', ')}`.slice(0, 300);
    },
  },

  // Flodesk v1: the API key is the Basic-auth username with an empty password; segments by id.
  flodesk: {
    name: 'Flodesk',
    label: 'segment',
    needsTarget: true,
    canCreate: true,
    connected: () => !!env('FLODESK_API_KEY'),
    req(method, path, body) {
      return call('Flodesk', env('FLODESK_BASE', 'https://api.flodesk.com'), method, path, { Authorization: basic(env('FLODESK_API_KEY')) }, body);
    },
    async targets() {
      const d = await this.req('GET', '/v1/segments?per_page=100');
      return (d.data || []).map((g) => ({ id: String(g.id), name: g.name }));
    },
    async create(name) {
      const g = await this.req('POST', '/v1/segments', { name });
      return { id: String(g.id), name: g.name };
    },
    // POST /v1/subscribers adds or updates; custom fields go in by key (made from a label if missing).
    async add(s) {
      const custom = await tryAnswers(s, async (pairs) => {
        const out = {};
        for (const p of pairs) {
          const key = await cachedField(`flodesk:${p.field.toLowerCase()}`, async () => {
            const all = await this.req('GET', '/v1/custom-fields/all');
            const have = (Array.isArray(all) ? all : all.data || []).find((f) => String(f.label).toLowerCase() === p.field.toLowerCase());
            return have?.key || (await this.req('POST', '/v1/custom-fields', { label: p.field })).key;
          });
          if (!key) throw new Error(`Flodesk didn't make the field "${p.field}"`);
          out[key] = p.value;
        }
        return out;
      }, {});
      await this.req('POST', '/v1/subscribers', { email: s.email, segment_ids: [s.listId], ...(Object.keys(custom).length ? { custom_fields: custom } : {}) });
    },
  },
};

// Which tool signups go to. Mercedes's server predates EMAIL_LIST, so a MailerLite key alone means MailerLite.
export function providerId() {
  const chosen = env('EMAIL_LIST').toLowerCase();
  if (PROVIDERS[chosen]) return chosen;
  return env('MAILERLITE_API_KEY') ? 'mailerlite' : 'builtin';
}
export function provider() {
  const id = providerId();
  return { id, ...PROVIDERS[id] };
}
// What the dashboard shows about the connection (no keys).
export function listInfo() {
  const p = provider();
  return { id: p.id, name: p.name, label: p.label, needsTarget: p.needsTarget, canCreate: !!p.canCreate, connected: p.connected(), hasDetail: !!p.detail };
}
export const PROVIDER_IDS = Object.keys(PROVIDERS);
