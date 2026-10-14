// Calibration v2 review page (no Apify calls). Candidates chosen by Claude under the "broad, easy trend container"
// definition. SOURCE FACTS are looked up by code from already-paid raw data; the headline sentences, scores and
// adaptations are Claude's judgment and are labeled that way on the page.
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './apify.mjs';

const read = (p) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, p), 'utf8'));
const raws = [
  ...read('snapshots/2026-W39/raw/clockworks-search.json'), ...read('tests/test-02/raw/clockworks-search.json'),
  ...read('snapshots/2026-W39/raw/clockworks-sound-verify.json'), ...read('tests/test-02/raw/clockworks-sound-verify.json'),
];
const byId = new Map(); for (const r of raws) if (!byId.has(String(r.id))) byId.set(String(r.id), r);
const soundUses = (sid) => { const v = raws.filter((r) => String(r.musicMeta?.musicId) === sid); const u = new Map(); for (const r of v) u.set(String(r.id), r); return [...u.values()]; };
const NOW = Date.parse('2026-09-25T20:00:00Z');
function soundFacts(sid) {
  const v = soundUses(sid); if (!v.length) return null;
  const dates = v.map((r) => r.createTimeISO).sort();
  const creators = new Set(v.map((r) => r.authorMeta?.name));
  const within = (d) => new Set(v.filter((r) => NOW - Date.parse(r.createTimeISO) <= d * 86_400_000).map((r) => r.authorMeta?.name)).size;
  return { soundName: v[0].musicMeta?.musicName, videosWeHave: v.length, distinctCreators: creators.size, creatorsLast30d: within(30), creatorsLast14d: within(14), earliestSeen: dates[0].slice(0, 10), newestSeen: dates.at(-1).slice(0, 10), smallAccountHits: v.filter((r) => (r.authorMeta?.fans || 0) < 20000 && r.playCount >= 1_000_000).length };
}
function vfacts(id) {
  const r = byId.get(id); if (!r) return { id, missing: true };
  return { id, url: r.webVideoUrl, author: r.authorMeta?.name, followers: r.authorMeta?.fans, plays: r.playCount, shares: r.shareCount, saves: r.collectCount, durationSec: Math.round((r.videoMeta?.duration || 0) * 10) / 10, postedAt: r.createTimeISO?.slice(0, 10), photoPost: !r.videoMeta?.duration };
}

// ---- Claude's calibrated picks (strongest first). Scores 1-5: C=currentness, E=ease, B=breadth, X=clarity, P=low performance burden.
const C = [
  { key: 'deadpan', name: 'Unimpressed stare + "me after…" complaint', sound: '7648857265117612814', videos: ['7674284285397912846', '7687598675555618078', '7664386061048597791'],
    what: 'Film a few seconds of yourself at work looking unimpressed at the camera, and put one line on screen about something that happens to you all the time.',
    trend: 'People are all using this same audio under a deadpan look plus a one-line complaint ("Me today after the 5th car in a row tries to modify their unicorn frap").',
    broad: 'Every business has a repeat annoyance (the same question, the same request, the same mess), so the line adapts to any job.',
    textMechanic: '"Me [today/after] [the Nth time something predictable happens]" or a flat statement like "i hate packaging cookies."',
    audio: 'Essential-ish: this audio signals the deadpan joke. I can see how it is used but cannot hear it, so a human should listen once.',
    scores: { C: 3, E: 5, B: 5, X: 5, P: 4 }, time: '1-2 minutes',
    adapt: ['Handyman: "Me after the 3rd client this week says it\'s probably just a quick fix"', 'Etsy/POD seller: "Me after someone asks if the $28 shirt comes in 14 more colors"', 'Consultant: "Me when the 1-hour call was scheduled as a quick 15"', 'Bakery: "i hate packaging cookies." (the real example)'],
    caution: 'Currentness is moderate: big small-account hits were Jun-Aug; only 2 of the creators in our sample posted in the last 30 days (the sample favors popular over newest, so recent use may be undercounted). Some creators use this audio for sensitive rants; keep the text light and about your work.' },
  { key: 'oneliner', name: 'One ordinary clip + a self-aware one-liner', sound: '7523279356548139798', videos: ['7681037422469156129', '7679735352063429921', '7687139461901208865'],
    what: 'Film one calm 6-10 second clip of an ordinary moment and add a single short line of text that makes it relatable or funny.',
    trend: 'Many creators are putting this same soft audio under one everyday clip with a self-aware caption (for example "me ignoring the Eiffel tower cause I\'m already a local (I\'m on my 2nd day)").',
    broad: 'The clip can be anything you already do (a coffee, your desk, a product on a rack), so any account can make one in minutes.',
    textMechanic: 'One self-aware line, or a two-to-three sentence mini-story ("A few years ago I…").',
    audio: 'Helpful: the soft audio sets the mood. Substitutable, but using the same audio is how you join the trend. Not heard by me.',
    scores: { C: 3, E: 5, B: 5, X: 4, P: 5 }, time: '2 minutes',
    adapt: ['Shop: product on the shelf + "the hoodie everyone keeps DMing us about"', 'Freelancer: laptop at a café + "me pretending this is a vacation (it is a deadline)"', 'Local service: van at a job + "me acting like I didn\'t just drive 40 minutes for a 10-minute fix"', 'Digital seller: "A few years ago I was [problem]… so I made [product]"'] },
  { key: 'label', name: 'Ordinary footage + a 2-4 word label', sound: '7315852279827172128', videos: ['7668963939237072161', '7668355021230066945', '7585677330631216398', '7687001792353291550'],
    what: 'Point your phone at your product, workspace or result for about 8 seconds and add a 2-4 word label ("Lunch hour", "Disco corner", "Drops 9/24").',
    trend: 'Creators and businesses keep reusing this audio under simple showcase footage with a tiny label or a "this is your sign to…" line.',
    broad: 'Any business has something to show (a product, a finished job, the shop, a view), and the label does the rest.',
    textMechanic: 'A 2-4 word label, or "this is your sign to [thing you offer]".',
    audio: 'Carries the energy of the reveal. An established sound (in use since 2023) that businesses still reuse; recency is lower than #1-2. Not heard by me.',
    scores: { C: 2, E: 5, B: 5, X: 5, P: 5 }, time: '1 minute',
    adapt: ['Product: hold the product up + "the one that sold out"', 'Salon: finished look + "this is your sign to book the bangs"', 'Realtor: kitchen pan + "the kitchen."', 'Cleaner: spotless room + "Friday reset"'],
    caution: 'Recent uses are fewer than for #1-2; the huge counts are from 2025.' },
  { key: 'dashA', name: 'Snarky "-A" text you pretend to receive', sound: '7296300151751379744', videos: ['7687271378063559968', '7687787896375414030'],
    what: 'Hold your phone like a text just arrived, look up at the camera, and put a teasing message on screen signed "-A".',
    trend: 'People are copying a Pretty Little Liars joke: an anonymous, knowing text about what you are doing right now, signed "-A", with the show\'s sound.',
    broad: 'Any business can write a teasing "-A" line about its customers or its own habits.',
    textMechanic: '"[What you\'re doing]? [knowing jab]. -A"',
    audio: 'Essential (the show\'s sound identifies the trend). TV audio may be unavailable to business accounts.',
    scores: { C: 3, E: 5, B: 4, X: 3, P: 4 }, time: '2 minutes',
    adapt: ['Café: "Third oat latte before 10? Your secret\'s safe… for now. -A"', 'Coach: "Bought another course instead of finishing the last one? -A"', 'Boutique: "Carted it three times this week. Just checkout. -A"'],
    caution: 'Needs a half-sentence of context ("the Pretty Little Liars -A texts"), so clarity is 3.' },
  { key: 'mewhen', name: '"me when…:" + you just looking at the camera', sound: '7683829127282953494', videos: ['7689510089568095518'],
    what: 'Lie in bed, sit at your desk or stand at work, look at the camera, and put "me when [very specific relatable moment]:" on screen.',
    trend: 'A very common container right now: a borrowed meme audio under a single still-ish clip with a long, specific "me when…:" setup.',
    broad: 'Every business owner has a "me when…" moment (Monday orders, an empty calendar, a 2am idea).',
    textMechanic: '"me when [hyper-specific situation]:" and the clip is the punchline.',
    audio: 'Borrowed meme audio; this particular audio is NOT shown to be spreading in our data.',
    scores: { C: 2, E: 5, B: 5, X: 5, P: 4 }, time: '1 minute',
    adapt: ['Shop owner: "me when it\'s Monday, it\'s raining, and there are 14 orders to pack:"', 'Photographer: "me when the client says they don\'t photograph well:"'],
    caution: 'Currentness is weak (the specific audio appears once in our data). Include as a format, or only if Instagram shows the audio trending.' },
  { key: 'cooked', name: '"POV: you\'re so cooked on ___ you start ___"', sound: null, videos: ['7688128627013864759'],
    what: 'Sit at your desk or counter looking lost, with "POV: you\'re so cooked on [task] you start [absurd coping behavior]".',
    trend: 'A current fill-in-the-blank sentence ("you\'re so cooked on…") used over a still, relatable clip.',
    broad: 'Every business has a task that defeats it (taxes, a website, inventory).',
    textMechanic: '"POV: you\'re so cooked on [X] you start [Y]"',
    audio: '"location slowed". One creator in our data; not verified as spreading.',
    scores: { C: 2, E: 5, B: 4, X: 5, P: 4 }, time: '1 minute',
    adapt: ['"POV: you\'re so cooked on your taxes you start reorganizing the stickers"', 'Digital seller: "POV: you\'re so cooked on your launch you start redesigning the logo"'],
    caution: 'Evidence is a single breakout (462K plays, 107x followers). Needs Instagram/audio confirmation.' },
  { key: 'viralwalk', name: '"how I walk in after [small win]:"', sound: null, videos: ['7688101889389907222'],
    what: 'Walk toward the camera or into your shop looking pleased with yourself, with "how I walk in after [small win]:".',
    trend: 'Walk-in + "how I feel coming to ___ after ___:" setup; a light brag format.',
    broad: 'Any business has small wins (a 5-star review, a sold-out item, a booked week).',
    textMechanic: '"how I feel coming to [place] after [small win]:"',
    audio: 'Borrowed audio; single creator in our data.',
    scores: { C: 2, E: 5, B: 5, X: 5, P: 3 }, time: '1 minute',
    adapt: ['"how I walk into the studio after one reel got 10K views:"', '"how I show up to the market after selling out last week:"'],
    caution: 'Slight attitude performance (the example flashes a peace sign). Evidence is weak.' },
  { key: 'handslens', name: 'Hands over the lens → reveal the result', sound: '7677752340367133461', videos: ['7686206394730646806', '7689302488624762142'],
    what: 'Film the "before", push your hands toward the lens so they cover it, then pull them away with the "after" in the same spot.',
    trend: 'A verified trending sound (7 creators in 14 days) where everyone does the same hands-to-lens reveal; the same move shows up on two other sounds.',
    broad: 'Works for any before/after (a room, a product setup, a finished job), not only beauty.',
    textMechanic: 'Optional: "[did X] for the first time in [Y] years…"',
    audio: 'Helpful for timing; substitutable.',
    scores: { C: 5, E: 4, B: 3, X: 5, P: 4 }, time: '5 minutes plus the "after"',
    adapt: ['Cleaner: messy counter → hands → clean', 'Shop: empty table → hands → market display', 'Handyman: broken → hands → fixed'],
    caution: 'Every example in the data is beauty or hair, so business use is our adaptation. Ranked below the text-led picks for that reason.' },
];

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const k = (n) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : Math.round((n || 0) / 1e3) + 'K');
const LBL = { C: 'Currentness', E: 'Ease of filming', B: 'Broad applicability', X: 'Explanation clarity', P: 'Low performance burden' };

// the two POV picks reference videos by author; resolve ids from the pool
const findByAuthor = (a) => [...byId.values()].find((r) => r.authorMeta?.name === a);
C.find((c) => c.key === 'mewhen').videos = [String(findByAuthor('mr.afroo').id)];
C.find((c) => c.key === 'cooked').videos = [String(findByAuthor('24_d4niel').id)];
C.find((c) => c.key === 'viralwalk').videos = [String(findByAuthor('callmeasophie').id)];
C.find((c) => c.key === 'mewhen').sound = String(findByAuthor('mr.afroo').musicMeta.musicId);
C.find((c) => c.key === 'cooked').sound = String(findByAuthor('24_d4niel').musicMeta.musicId);
C.find((c) => c.key === 'viralwalk').sound = String(findByAuthor('callmeasophie').musicMeta.musicId);

const out = C.map((c) => ({ ...c, soundFacts: soundFacts(c.sound), videoFacts: c.videos.map(vfacts) }));
fs.writeFileSync(path.join(DATA_DIR, 'tests', 'test-03-correction', 'calibration-v2.json'), JSON.stringify({ note: 'Headline sentences, scores and adaptations are Claude judgment; soundFacts/videoFacts are copied from paid raw data by code. Claude cannot hear audio.', candidates: out }, null, 2));

const card = (c, i) => `<section class="card" id="${c.key}">
<h2>${i + 1}. ${esc(c.name)}</h2>
<div class="big3"><p><b>WHAT YOU ACTUALLY DO:</b> ${esc(c.what)}</p><p><b>WHAT MAKES IT A TREND:</b> ${esc(c.trend)}</p><p><b>WHY IT'S BROADLY USEFUL:</b> ${esc(c.broad)}</p></div>
<div class="row"><div class="players">${c.videoFacts.filter((v) => !v.missing).map((v) => `<figure><div class="player"><iframe src="https://www.tiktok.com/embed/v2/${v.id}" loading="lazy" allow="encrypted-media; fullscreen" allowfullscreen></iframe></div><figcaption><a href="${v.url}" target="_blank">@${esc(v.author)}</a> · ${v.photoPost ? 'photo post' : v.durationSec + 's'} · ${k(v.plays)} plays · ${k(v.followers)} followers · ${v.postedAt}</figcaption></figure>`).join('')}</div>
<div class="info">
<table class="scores">${Object.entries(c.scores).map(([s, v]) => `<tr><td>${LBL[s]}</td><td><span class="dots">${'●'.repeat(v)}${'○'.repeat(5 - v)}</span> ${v}</td></tr>`).join('')}</table>
<p class="small">Scores are my judgment, not data.</p>
<p><b>Currentness evidence (facts):</b> ${c.soundFacts ? `sound "${esc(c.soundFacts.soundName)}": ${c.soundFacts.videosWeHave} videos by ${c.soundFacts.distinctCreators} creators in our data; ${c.soundFacts.creatorsLast30d} creators in the last 30 days, ${c.soundFacts.creatorsLast14d} in the last 14; first seen ${c.soundFacts.earliestSeen}, newest ${c.soundFacts.newestSeen}; ${c.soundFacts.smallAccountHits} videos with 1M+ plays from accounts under 20K followers.` : 'n/a'}</p>
<p><b>Audio:</b> ${esc(c.audio)}</p>
<p><b>Text mechanic:</b> ${esc(c.textMechanic)}</p>
<p><b>Filming:</b> ease ${c.scores.E}/5 · about ${esc(c.time)}</p>
<p><b>Business adaptations:</b></p><ul>${c.adapt.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
${c.caution ? `<p class="warn">${esc(c.caution)}</p>` : ''}
<label>Verdict: <select data-key="v2-${c.key}"><option></option><option>Yes, this is it</option><option>Close</option><option>No</option></select></label>
<textarea data-key="v2n-${c.key}" placeholder="Notes"></textarea>
</div></div></section>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Reels to Steal Calibration</title>
<style>
:root{--ink:#08152c;--bg:#fbf8f3;--card:#fff;--teal:#94ece1;--line:#e5e0d8}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 system-ui,Arial,sans-serif}main{max-width:1200px;margin:0 auto;padding:16px}
h1{font-size:26px;margin:8px 0}.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;margin:0 0 18px}.card h2{font-size:20px;margin:0 0 10px}
.big3{background:var(--teal);border-radius:10px;padding:10px 14px;margin:0 0 14px}.big3 p{margin:6px 0;font-size:16px}
.row{display:flex;gap:16px;flex-wrap:wrap}.players{display:flex;gap:10px;flex-wrap:wrap}.info{flex:1;min-width:280px}
figure{margin:0;width:240px}figcaption{font-size:12px;margin-top:4px}.player{width:240px;height:430px;background:#000;border-radius:10px;overflow:hidden}.player iframe{width:100%;height:100%;border:0}
.scores td{padding:2px 10px 2px 0}.dots{letter-spacing:2px}.small{font-size:12px;color:#44506a}.warn{background:#fff4d6;padding:8px;border-radius:8px}
textarea{width:100%;min-height:60px;margin-top:8px;font:inherit;box-sizing:border-box}select{font:inherit;margin-left:6px}
#copy{position:sticky;top:0;background:var(--ink);color:#fff;padding:10px 16px;z-index:5;display:flex;gap:12px;align-items:center;flex-wrap:wrap}#copy button{font:inherit;border:0;border-radius:18px;padding:6px 14px;cursor:pointer}
@media(max-width:640px){figure,.player{width:100%}}
</style></head><body>
<div id="copy">Verdicts save in this browser. <button onclick="copyNotes()">Copy my verdicts for Claude</button><span id="msg"></span></div>
<main><h1>Reels to Steal: calibration v2</h1>
<p>${C.length} candidates from data we already paid for, strongest first. The target: broad, easy trend containers where text or audio carries the idea. I cannot hear audio, so audio notes describe how a sound is used, not how it sounds. Currentness for #5-7 is weak in TikTok data and would need Instagram confirmation.</p>
${out.map(card).join('\n')}
</main><script>
const store={get(k){try{return localStorage.getItem('r2s:'+k)}catch(e){return null}},set(k,v){try{localStorage.setItem('r2s:'+k,v)}catch(e){}}};
document.querySelectorAll('[data-key]').forEach(el=>{const v=store.get(el.dataset.key);if(v)el.value=v;['input','change'].forEach(ev=>el.addEventListener(ev,()=>store.set(el.dataset.key,el.value)))});
function copyNotes(){const o=[];document.querySelectorAll('[data-key]').forEach(el=>{if(el.value)o.push(el.dataset.key+': '+el.value)});const t=o.join('\\n')||'(no verdicts yet)';navigator.clipboard.writeText(t).then(()=>{document.getElementById('msg').textContent='Copied '+o.length+' items. Paste them to Claude.'},()=>{prompt('Copy this:',t)})}
</script></body></html>`;
fs.writeFileSync(path.join(DATA_DIR, 'tests', 'test-03-correction', 'calibration-v2.html'), html);
for (const c of out) console.log(c.key.padEnd(10), JSON.stringify(c.soundFacts), c.videoFacts.map((v) => v.missing ? 'MISSING ' + v.id : `${v.author}:${k(v.plays)}`).join(', '));


