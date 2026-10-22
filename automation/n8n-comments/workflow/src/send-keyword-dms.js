// Comment keyword -> one private-reply DM with the freebie link (Instagram only;
// Meta allows one private reply per comment, within 7 days). The keyword list is
// config/keywords.json, made from automation/carousels/config/destinations.json
// by scripts/sync-keywords.mjs. Only keywords marked live + dmApproved are in it.
let keywords = [];
try {
  keywords = JSON.parse(fs.readFileSync(cfg('KEYWORDS_FILE', '/data/config/keywords.json'), 'utf8')).keywords || [];
} catch (e) {
  logError('keywords-file', e);
}
const ownId = cfg('IG_USER_ID');

const out = [];
for (const item of $input.all()) {
  const c = { ...item.json };
  const words = (c.text.toUpperCase().match(/[A-Z0-9$]+/g) || []);
  const hit = keywords.find((k) => words.includes(String(k.keyword).toUpperCase()));
  if (hit) {
    c.keyword = hit.keyword;
    // "PINS", "pins!", "PINS please 🙏" count as keyword-only: no reply draft needed.
    const rest = words.filter((w) => w !== hit.keyword.toUpperCase() && !/^(PLEASE|PLS|PLZ|THANKS|THANK|YOU|TY)$/.test(w));
    c.keywordOnly = rest.length === 0;
  }
  if (hit && c.platform === 'Instagram') {
    const text = hit.dm.replace('{url}', hit.url);
    if (state.dm?.[c.id]) {
      c.dm = 'already sent';
    } else if (DRY_RUN) {
      c.dm = `test mode, would send: ${text}`;
    } else {
      try {
        await http({
          method: 'POST',
          url: `${GRAPH}/${ownId || 'me'}/messages`,
          headers: { Authorization: `Bearer ${igToken()}` },
          body: { recipient: { comment_id: c.id }, message: { text } },
        });
        remember('dm', c.id);
        c.dm = `sent: ${text}`;
      } catch (e) {
        logError('instagram-dm', e);
        c.dm = `failed: ${errText(e)}`;
      }
    }
  }
  out.push({ json: c });
}
return out;
