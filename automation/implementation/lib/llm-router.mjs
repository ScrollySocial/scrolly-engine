/**
 * Provider-neutral LLM interface for the Implementation Engine.
 *
 * Per methodology/implementation-agent.md §9: the engine must never import
 * or depend on the Claude Agent SDK (that's the Discover runner's pattern,
 * and exactly the lock-in this project exists to avoid repeating). This
 * module is the only place that knows which provider is configured — every
 * caller uses `complete()` and never sees Anthropic/OpenAI/etc. directly.
 *
 * V1: always routes to one configured provider (Anthropic, via a plain
 * fetch call to the Messages API — not the Agent SDK, since this is a
 * single request/response generation call, not an autonomous tool-use loop).
 * Task/cost/capability-based routing is V2 — do not build it here.
 */

import 'dotenv/config';

const PROVIDER = process.env.LLM_PROVIDER || 'anthropic';

async function completeAnthropic({ system, prompt, maxTokens = 1024 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set (required for LLM_PROVIDER=anthropic).');
  const model = process.env.LLM_MODEL_ANTHROPIC || 'claude-sonnet-4-5-20250929';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }
  const data = await res.json();
  const text = (data.content || []).map((b) => (b.type === 'text' ? b.text : '')).join('');
  return { text, raw: data, provider: 'anthropic', model };
}

const PROVIDERS = {
  anthropic: completeAnthropic,
  // Add 'openai' / 'gemini' / etc. here later — same signature in, same
  // { text, raw, provider, model } shape out. Nothing outside this file
  // needs to change when a provider is added.
};

/**
 * @param {{system?: string, prompt: string, maxTokens?: number}} args
 * @returns {Promise<{text: string, raw: any, provider: string, model: string}>}
 */
export async function complete(args) {
  const impl = PROVIDERS[PROVIDER];
  if (!impl) throw new Error(`Unknown LLM_PROVIDER "${PROVIDER}". Known: ${Object.keys(PROVIDERS).join(', ')}`);
  return impl(args);
}
