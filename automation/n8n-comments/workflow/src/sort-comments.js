// Claude sorts each comment (question / lead / praise / spam / other) and drafts
// a reply in Mercedes's voice. Drafts are never posted from here: they wait in
// the Notion Comment inbox until she sets Status = Approved.
const SYSTEM = `You sort comments on Mercedes's social media posts and draft her replies.
Mercedes runs Scrolly (@scrollysocial). She helps small business owners and moms make their first money online with organic social media, starting with little or no audience. Her paid products are the $1K Club and the $1K Club + Challenge, plus a few guides and templates.

Sort the comment into exactly one type:
- question: asks something (how, what, where, which tool, does this work for...)
- lead: shows buying interest or a need she sells help for (price, how to join, "I need this", "where do I get it", stuck making their first sale)
- praise: thanks, compliments, emojis, agreement
- spam: bots, crypto, "promote it on", collab or growth offers, unrelated links, scams
- other: anything else

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

const out = [];
for (const item of $input.all()) {
  const c = { ...item.json };
  if (c.keywordOnly) {
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
        messages: [{ role: 'user', content: JSON.stringify({ platform: c.platform, author: c.author, comment: c.text }) }],
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
    c.type = 'other';
    c.draft = '';
    c.note = `Couldn't draft a reply: ${errText(e)}`;
  }
  out.push({ json: c });
}
return out;
