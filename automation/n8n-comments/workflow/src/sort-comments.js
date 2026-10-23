// Sorts each comment (question / lead / praise / spam / other) and flags
// questions and leads, with free word rules, so no AI API is needed.
// Reply drafts are written later by Claude on Mercedes's subscription (vault
// skills/draft-comment-replies): rows arrive in the Notion Comment inbox as
// Status "Needs draft". Nothing is ever posted from here.
//
// Optional: CLAUDE_API_DRAFTS=true (plus ANTHROPIC_API_KEY) sorts and drafts each
// comment with the Claude API instead (paid per comment), and rows arrive as "New"
// with the draft filled in. Its prompt below follows the same reply rules as the
// vault skill; change both together.

// ---- free rules (checked in this order: spam, lead, question, praise) ----
const RULES = {
  spam: /promote (it|this|your)|promo(tion)? on @|collab|brand ambassador|(dm|message) (me|us) (for|to)|check (out )?(my|our) (bio|page|profile)|crypto|bitcoin|forex|invest(ment|ing)? (opportunity|platform)|earn \$?\d+.{0,12}(daily|weekly|a day|per day)|(real|cheap|free) followers|grow your (account|page|followers)|https?:\/\//i,
  lead: /how much|price|pricing|cost|how (do|can) i (join|get|buy|sign up|start)|where (do|can) i (get|buy|find|sign up)|sign me up|i('m| am) interested|i need (this|that|help)|i want (this|in)|how to join|\bjoin\b|enroll|send (me )?the link|stuck|nobody buys|no (sales|one buys)|can't (sell|get sales)/i,
  question: /\?|^(how|what|why|when|where|which|who|can|could|does|do|is|are|should|will|would|any tips)\b/i,
  praise: /lov(e|ing)|thank|great|amazing|helpful|so good|needed (this|that)|obsessed|genius|perfect|yes+!|🔥|❤|♥|😍|👏|🙌|💯|🥰|🙏/i,
};
function sortByRules(text) {
  const t = String(text || '').trim();
  if (!t) return 'other';
  for (const type of ['spam', 'lead', 'question', 'praise']) if (RULES[type].test(t)) return type;
  // only emojis / punctuation counts as praise
  if (!/[a-z0-9]/i.test(t)) return 'praise';
  return 'other';
}

// ---- optional Claude API path ----
const SYSTEM = `You sort comments on Mercedes's social media posts and draft her replies.
Mercedes runs Scrolly (@scrollysocial). She helps small business owners and moms make their first money online with organic social media, starting with little or no audience. Her paid products are the $1K Club and the $1K Club + Challenge, plus a few guides and templates.

Sort the comment into exactly one type:
- question: asks something (how, what, where, which tool, does this work for...)
- lead: shows buying interest or a need she sells help for (price, how to join, "I need this", "where do I get it", stuck making their first sale)
- praise: thanks, compliments, emojis, agreement
- spam: bots, crypto, "promote it on", collab or growth offers, unrelated links, scams
- other: anything else

If kind is "dm", it is a private message to her (or a reply to her Story) and the reply is sent privately; the same rules apply.

Write the reply Mercedes would post publicly:
- Warm, encouraging, clear and short: 1 or 2 sentences. Reply to what they actually said.
- Questions: give a genuinely useful answer or one concrete tip when general know-how answers it. Mention "the link in my bio" only when they ask about price, joining or getting one of her products.
- Someone stuck or frustrated: one specific, kind tip first. A bio mention is optional and comes last.
- Never state prices, results, timelines or product features you were not given. If the answer needs a fact about Mercedes or her products, write a short honest placeholder answer and set needs_check to true.
- No filler openers ("Great question", "Every journey is different"). Don't call people by name: the author is a username.
- Never patronize, never pitch to praise, never promise money or results.
- No em dashes. No "It's X, not Y" or "isn't X, it's Y" sentences. No hashtags. At most one emoji.
- For spam, reply is "".

Answer with JSON only: {"type": "...", "reply": "...", "needs_check": true|false}`;

const key = cfg('ANTHROPIC_API_KEY');
const base = cfg('ANTHROPIC_BASE', 'https://api.anthropic.com');
// Current models always think first, so max_tokens leaves room for that; effort
// low is enough for sorting one comment and drafting one or two sentences.
const model = cfg('CLAUDE_MODEL', 'claude-opus-5-5');
const effort = cfg('CLAUDE_EFFORT', 'low');

const useApi = cfg('CLAUDE_API_DRAFTS') === 'true' && !!key;

const out = [];
for (const item of $input.all()) {
  const c = { ...item.json };
  if (c.keywordOnly) {
    out.push({ json: c });
    continue;
  }
  if (!useApi) {
    c.type = sortByRules(c.text);
    c.draft = '';
    out.push({ json: c });
    continue;
  }
  try {
    const res = await http({
      method: 'POST',
      url: `${base}/v1/messages`,
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: {
        model,
        max_tokens: 4000,
        output_config: { effort },
        system: SYSTEM,
        messages: [{ role: 'user', content: JSON.stringify({ platform: c.platform, kind: c.kind || 'comment', author: c.author, comment: c.text }) }],
      },
    });
    if (res.stop_reason !== 'end_turn') throw new Error(`Claude stopped early (${res.stop_reason})`);
    const text = (res.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    const parsed = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    c.type = ['question', 'lead', 'praise', 'spam', 'other'].includes(parsed.type) ? parsed.type : 'other';
    c.draft = String(parsed.reply || '').replace(/\s*[—–]\s*/g, ', ').trim();
    c.needsCheck = !!parsed.needs_check;
  } catch (e) {
    logError('claude', e);
    c.type = sortByRules(c.text);
    c.draft = '';
    c.note = `Couldn't draft a reply: ${errText(e)}`;
  }
  out.push({ json: c });
}
return out;
