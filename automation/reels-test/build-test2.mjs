// Test #2, final step: build member-facing card records from Test #2 + Snapshot #1 evidence.
// SOURCE FACTS are copied by code from collected data. Classification comes from deterministic rules over sound checks.
// OUR ASSESSMENT (names, recipes, formatTag, audioRisk, bestFor, difficulty) is Claude's judgment, kept in its own object.
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './apify.mjs';

const dir = path.join(DATA_DIR, 'tests', 'test-02');
const cands = JSON.parse(fs.readFileSync(path.join(dir, 'candidates.json'), 'utf8'));
const norm = JSON.parse(fs.readFileSync(path.join(dir, 'normalized.json'), 'utf8'));
const v2 = JSON.parse(fs.readFileSync(path.join(dir, 'sound-verification.json'), 'utf8'));
const v1 = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'snapshots', '2026-W39', 'sound-verification.json'), 'utf8'));
const allVideos = [...norm.test2, ...norm.snapshot1Rescored];

// ---- Classification rules (deterministic)
export const CLASS_RULES = {
  Trending: 'sound check: >=5 distinct creators posted with the sound in the last 14 days AND >=5 sampled videos have >=100K plays',
  Rising: 'sound check: 3-4 distinct creators in the last 14 days, sound first sampled use within the last 120 days',
  Breakout: 'the example video passes the breakout rule (>=100K plays and >=5x followers, floor 1,000; or >=1M plays and >=1x followers). Sound not shown to be spreading',
  Sustained: 'UNAVAILABLE until 5 consecutive weekly snapshots exist',
};
function soundEvidence(soundId) {
  const a = v2.sounds[soundId];
  if (a) return { from: 'test-02 sound check', sampled: a.sampled, distinctCreators: a.distinctCreators, creatorsLast7d: a.creatorsLast7d, creatorsLast14d: a.creatorsLast14d, highPerformers100k: a.highPerformers100k, earliestSampledUse: a.earliestSampledUse, newestSampledUse: a.newestSampledUse, checkedAt: v2.checkedAt };
  const b = v1.sounds[soundId];
  if (b) return { from: 'snapshot-1 sound check', sampled: b.sampled, distinctCreators: b.distinctCreatorsSampled, creatorsLast7d: b.creatorsLast7d, creatorsLast14d: b.creatorsLast14d, highPerformers100k: b.samplePlays.filter((p) => p >= 100_000).length + '+ (top 5 recorded)', earliestSampledUse: b.oldestPostInSample, newestSampledUse: b.newestPost, checkedAt: v1.checkedAt };
  return null;
}
function classify(video, ev) {
  const hp = ev ? parseInt(ev.highPerformers100k, 10) : 0;
  const ageDays = ev?.earliestSampledUse ? (Date.parse(ev.checkedAt) - Date.parse(ev.earliestSampledUse)) / 86_400_000 : Infinity;
  if (ev && ev.creatorsLast14d >= 5 && hp >= 5) return 'Trending';
  if (ev && ev.creatorsLast14d >= 3 && ageDays <= 120) return 'Rising';
  if (!video.rejectedAt) return 'Breakout';
  return null; // neither trend evidence nor breakout: not publishable
}

// ---- Our assessment, keyed by example video id. visualCheck records what was actually looked at.
const A = {
  '7688823110371446046': { name: 'Couple glow-up transition', formatTag: 'transition:glow-up-before-after', bestFor: ['Service', 'Product'], difficulty: 'Moderate', audioRisk: 'MEDIUM',
    visualCheck: { method: 'embed playback, 4 frames', verified: 'full', saw: 'two people in casual clothes, hands clasp and spin, both reappear in formal wear' },
    why: 'Verified multi-creator trend, and the mechanic (plain → dressed up on a hand clasp) works for anyone selling a transformation.',
    film: '0-5s: you (and a partner or teammate) in plain clothes, facing camera. 5-6s: clasp hands and spin on the beat. 6-12s: same spot, fully styled.',
    product: 'Apparel, jewellery, beauty: the "after" is wearing your product.', service: 'Stylists and MUAs: client + stylist, messy → finished. Two-person teams: work clothes → event-ready.',
    text: '"Us before vs after [your service]"', cautions: ['Needs two people.'] },
  '7687547977061190934': { name: 'Makeup glow-up transition', formatTag: 'transition:makeup-before-after', bestFor: ['Service', 'Product'], difficulty: 'Moderate', audioRisk: 'MEDIUM',
    visualCheck: { method: 'embed playback, 3 frames', verified: 'full', saw: 'bare face with glasses, a hand passes in front of the lens, full glam with hair down' },
    why: 'Verified trend: 7 creators used this sound in the last 14 days and all 10 sampled uses have 100K+ plays. The before → after is the whole format.',
    film: '0-4s: bare face (or plain product), looking at camera. 4-5s: sweep your hand across the lens. 5-9s: finished look, same framing.',
    product: 'Beauty and skincare: bare → wearing your product. Any product: plain → styled, using the hand sweep.', service: 'MUAs, estheticians, lash and brow artists: client before → after (with permission).',
    text: '"Before vs after [product / service]"', cautions: ['Same format family as the couple glow-up and upside-down flip: do not publish all three in one week (soft duplicate by formatTag).'] },
  '7688408642772569358': { name: 'Two-person outfit transition', formatTag: 'transition:duo-outfit-swap', bestFor: ['Product', 'Local'], difficulty: 'Moderate', audioRisk: 'MEDIUM',
    visualCheck: { method: 'embed playback, 3 frames', verified: 'full', saw: 'two people in loungewear in a kitchen, a kick on the beat, both reappear styled (red gown, sharp outfit)' },
    why: 'Verified trend on a new sound (first sampled use mid-August, 5 creators in the last 14 days). Two people plus two outfits, nothing else.',
    film: '0-4s: two people side by side in loungewear. 4-5s: kick or jump on the beat. 5-9s: both in the "after" looks. Camera locked off.',
    product: 'Boutiques and apparel: before → your pieces.', service: 'Local teams: street clothes → uniform ("clocking in"). Salons: before → after appointment.',
    text: '"Us before vs after opening the shop"', cautions: ['Needs a second person and a quick outfit change.', 'The example creator has 6.9M followers, so this video is not a breakout. The trend evidence is the sound spread.'] },
  '7688525476393930014': { name: 'Upside-down makeup flip', formatTag: 'transition:makeup-before-after', bestFor: ['Service', 'Product'], difficulty: 'Easy', audioRisk: 'MEDIUM',
    visualCheck: { method: 'embed playback, 5 frames', verified: 'partial', saw: 'bare face with hair tied up, a black transition frame, full glam with curly hair down. The flip mechanic itself is inferred from #upsidedown.' },
    why: 'Rising sound (3 creators in the last 14 days, first sampled use late August). A simple before → after with one camera move.',
    film: '0-5s: the "before". 5-6s: turn the phone upside down (or cover the lens) on the beat. 6-11s: the finished look.',
    product: 'Beauty: bare → wearing it. Food: raw → plated.', service: 'MUAs, nail techs, barbers: bare → finished.',
    text: '"Wait for the flip"', cautions: ['Same format family as the makeup glow-up. The exact camera move needs a human look.'] },
  '7689155868532804865': { name: '5-second transformation', formatTag: 'transformation:5s-quick-reveal', bestFor: ['Service', 'Local'], difficulty: 'Easy', audioRisk: 'MEDIUM',
    visualCheck: { method: 'cover frame', verified: 'partial', saw: 'cover shows the finished result (long wavy hair). The before half was not seen.' },
    why: 'Breakout: 1.1M plays from a 279-follower account, with 26,129 shares. Five seconds, no talking.',
    film: '0-2s: before, quick and unposed. 2-5s: the result, one clean shot.', product: 'Skincare, cleaning products, tools: the result in 5 seconds.', service: 'Hair stylists first; also groomers, detailers, cleaners.',
    text: '"New [hair / car / kitchen] for a new season"', cautions: ['Client permission before posting their face.'] },
  '7689204580566977799': { name: '"Tomorrow." playful drop teaser', formatTag: 'announcement:countdown-drop-teaser', bestFor: ['Product', 'Digital'], difficulty: 'Easy', audioRisk: 'LOW',
    visualCheck: { method: 'cover frame', verified: 'partial', saw: 'cover: a model in the new pink activewear, playful, in a white studio holding a ball. CORRECTS Test #1, which assumed a dark teaser that hid the product.' },
    why: 'Breakout: 495K plays from 1,938 followers and 16,308 shares. It shows the product in a fun, casual shoot plus "Tomorrow." Easy for any launch.',
    film: '0-7s: a fun, unpolished clip of your new product in use (behind the scenes of your shoot is perfect). 7-10s: text "Tomorrow." plus the time.',
    product: 'New collections, restocks, limited batches.', service: 'Opening a limited number of booking slots; show yourself setting up.',
    text: '"Tomorrow. Limited. Once it\'s gone, it\'s gone."', cautions: ['Only say limited if true.'] },
  '7687001792353291550': { name: '"Drops [date]" outfit tease', formatTag: 'announcement:dated-drop-tease', bestFor: ['Product'], difficulty: 'Easy', audioRisk: 'LOW',
    visualCheck: { method: 'cover frame', verified: 'partial', saw: 'cover: a model in the new black tank and jeans with overlay "Drops 9/24 ♥️👀". CORRECTS Test #1 (no finger-to-lips, no covered product).' },
    why: 'Breakout: 841K plays at 24x the brand\'s followers. A person simply wearing the new piece plus a date overlay.',
    film: '0-10s: someone wearing or holding the new product, glancing around casually. Overlay: "Drops [date] 👀".', product: 'Apparel, accessories, any launch with a date.', service: 'New service or menu with a start date.',
    text: '"Drops [date] ♥️👀"', cautions: ['Established sound; the evidence is this one video.'] },
  '7687139461901208865': { name: 'Short clip + "why I started" text story', formatTag: 'story:text-overlay-origin', bestFor: ['Digital', 'Service'], difficulty: 'Easy', audioRisk: 'LOW',
    visualCheck: { method: 'cover frame', verified: 'partial', saw: 'cover: a person in a kitchen with a text-story overlay' },
    why: 'Breakout: 599K plays from 578 followers and 8,346 saves. Found again by the "digital product launch" search.',
    film: '0-6s: one calm shot of you. The story goes in on-screen text and the caption.', product: 'Digital products: "a few years ago I was [problem], so I started [product]".', service: 'Coaches and consultants: the same, about the outcome you help with.',
    text: '"A few years ago, I was [relatable struggle]…"', cautions: [] },
  '7687135085413305618': { name: '"Nothing against influencers, but…" owner POV', formatTag: 'pov:owner-text-over-track', bestFor: ['Any'], difficulty: 'Easy', audioRisk: 'MEDIUM',
    visualCheck: { method: 'cover frame', verified: 'partial', saw: 'cover: the owner with text overlay and a tray of cookies' },
    why: 'Breakout: 443K plays at 217x followers. An honest owner POV works for any small business.',
    film: '0-9s: you doing an everyday task with the POV text on screen. No talking.', product: '"…I\'d have to sell [X] just to pay them."', service: '"…that\'s [X] clients just to pay an agency."',
    text: '"Guess I\'m the face of my brand now 😂"', cautions: ['Track "What\'s This? What\'s That?": check availability on business accounts, or substitute a playful sound.'] },
  '7687598675555618078': { name: '"I hate packaging [product]" honest packing clip', formatTag: 'bts:relatable-packing-complaint', bestFor: ['Product'], difficulty: 'Easy', audioRisk: 'MEDIUM',
    visualCheck: { method: 'cover frame', verified: 'partial', saw: 'cover: the owner packing cookies, with "I hate packaging cookies" text. CORRECTS Test #1, which rejected it as unverifiable.' },
    why: 'Breakout: 396K plays at 396x followers (floored). An honest, unglamorous behind-the-scenes shot of packing orders.',
    film: '0-7s: you packing orders, slightly fed up, with text "I hate packaging [product]". Use a comedic sound.', product: 'Any shop that packs orders.', service: 'Swap for the task you dread: "I hate invoicing".',
    text: '"I hate packaging cookies" → "[your product]"', cautions: ['The sound\'s content was not heard; pick your own comedic sound.'] },
  '7687445152448793869': { name: 'Nail set transition', formatTag: 'transition:nails-before-after', bestFor: ['Service'], difficulty: 'Easy', audioRisk: 'MEDIUM',
    visualCheck: { method: 'cover frame', verified: 'partial', saw: 'cover: close-up of the finished long nails. The transition itself was not seen.' },
    why: 'Breakout: 476K plays at 173x followers. The creator jokes the transition beat the nails, so the transition is the hook.',
    film: '0-5s: bare nails close to the lens. 5-6s: hand sweep or snap on the beat. 6-13s: finished set, same angle.', product: 'Press-on nails, polish.', service: 'Nail techs; the same mechanic for lashes and brows.',
    text: '"The transition or the nails?"', cautions: ['The sound (nailz_forever64) is widely used but not currently spreading (2 creators in 14 days).'] },
  '7688381525699644675': { name: 'Satisfying process close-up', formatTag: 'process:satisfying-closeup', bestFor: ['Product', 'Local'], difficulty: 'Easy', audioRisk: 'MEDIUM',
    visualCheck: { method: 'cover frame', verified: 'partial', saw: 'cover: a pencil portrait; caption says erasing is the satisfying part' },
    why: 'Breakout: 2.3M plays from about 1K followers. A tight close-up of one satisfying step of making something.',
    film: '0-10s: extreme close-up of the most satisfying step (icing, peeling film, erasing, polishing, pouring). No talking.', product: 'Makers, bakers, candle and soap makers, artists.', service: 'Cleaners (the wipe), detailers (the foam), landscapers (the edge).',
    text: '"So satisfying 😩"', cautions: ['"b2b" is an older, widely used sound; any calm track works.'] },
  '7688261860814015765': { name: 'Made-to-order product transition', formatTag: 'transition:product-on-model', bestFor: ['Product'], difficulty: 'Easy', audioRisk: 'LOW',
    visualCheck: { method: 'cover frame', verified: 'partial', saw: 'cover: a handmade crochet granny-square jacket worn by a person' },
    why: 'Breakout: 113K plays at 113x followers, from a handmade seller selling directly ("DM for booking"). The source is 26s, but the format fits in 15s.',
    film: '0-5s: the piece in progress (yarn, hands). 5-6s: cut on the beat. 6-12s: worn and styled. End with "made to order".', product: 'Handmade and made-to-order sellers.', service: 'Custom services: raw material → finished commission.',
    text: '"Made to order. DM to book yours."', cautions: ['The source example is 26s (FLAGGED): the member version must be cut to 15s.', 'The sound is cooling (no uses in 14 days).'] },
};

const byId = new Map(allVideos.map((v) => [v.videoId, v]));
const records = [];
for (const [id, a] of Object.entries(A)) {
  const v = byId.get(id);
  const ev = soundEvidence(v.soundId);
  const cls = classify(v, ev);
  if (!cls) { console.log('NOT PUBLISHABLE by rules:', id, a.name); continue; }
  records.push({
    name: a.name,
    classification: cls,
    classificationRule: CLASS_RULES[cls],
    example: { url: v.url, durationSec: Math.round(v.durationSec * 10) / 10, durationCompliant: v.durationSec <= 15, templateStickerOnExample: v.templateSticker },
    audio: { name: v.soundName, id: v.soundId, url: `https://www.tiktok.com/music/original-sound-${v.soundId}`, author: v.soundAuthor, isOriginalSound: v.soundIsOriginal },
    sourceFacts: {
      postedAt: v.postedAt, ageDaysAtCollection: v.ageDays, plays: v.plays, likes: v.likes, comments: v.comments, shares: v.shares, saves: v.saves,
      creator: v.author, creatorFollowers: v.authorFollowers, playsPerFollowerFloored: v.ratio, shareRate: v.shareRate, saveRate: v.saveRate,
      foundBy: [...new Set(allVideos.filter((x) => x.videoId === id).flatMap((x) => x.foundByQueries.map((q) => `${x.source}:${q}`)))],
      postedFromCountry: v.locationCreated, soundCheck: ev,
    },
    ourAssessment: {
      assessedBy: 'Claude (AI judgment, 2026-09-25)', whySelected: a.why, filmThis: a.film, productAdaptation: a.product, serviceAdaptation: a.service, onScreenText: a.text,
      bestFor: a.bestFor, difficulty: a.difficulty, audioRisk: a.audioRisk, formatTag: a.formatTag, cautions: a.cautions, visualCheck: a.visualCheck,
    },
    needsHumanReview: a.visualCheck.verified !== 'full',
    fingerprint: { primary: `tiktok:sound:${v.soundId}`, soundId: v.soundId, formatTag_AI: a.formatTag },
  });
}
const order = { Trending: 0, Rising: 1, Breakout: 2 };
records.sort((x, y) => order[x.classification] - order[y.classification] || y.sourceFacts.plays - x.sourceFacts.plays);

// Soft duplicates: same AI formatTag, different sound IDs (information only, never an automatic exclusion)
const byTag = {};
for (const r of records) (byTag[r.ourAssessment.formatTag] ||= []).push(r.fingerprint.soundId);
const softDuplicates = Object.entries(byTag).filter(([, s]) => new Set(s).size > 1).map(([tag, sounds]) => ({ formatTag_AI: tag, differentSoundIds: sounds }));

const summary = {
  target25Met: records.length >= 25, publishable: records.length,
  trending: records.filter((r) => r.classification === 'Trending').length, rising: records.filter((r) => r.classification === 'Rising').length, breakout: records.filter((r) => r.classification === 'Breakout').length,
  fullyVisuallyVerified: records.filter((r) => !r.needsHumanReview).length, needsHumanReview: records.filter((r) => r.needsHumanReview).length,
  audioRisk: records.reduce((m, r) => ((m[r.ourAssessment.audioRisk] = (m[r.ourAssessment.audioRisk] || 0) + 1), m), {}),
  difficulty: records.reduce((m, r) => ((m[r.ourAssessment.difficulty] = (m[r.ourAssessment.difficulty] || 0) + 1), m), {}),
  durationFlagged: records.filter((r) => !r.example.durationCompliant).length, softDuplicates,
};
const rejectedAfterReview = [
  { item: 'Text-message conversation trend (sound 7683515977018919713)', classificationByRules: 'Trending (9 creators in 7 days, 9 of 10 samples at 100K+)', reason: 'content rule: the joke is sexual innuendo ("Send?" / "A picture of your hair?"). Watched via embed.' },
  { item: 'Hotel Lobby template (sound 7099522931209816066)', reason: 'cover shows a two-person rap lip-sync performance; commercial track (audioRisk HIGH); trend dates to 2022. CORRECTS Test #1, which included it.' },
  { item: 'Halloween outfit transition (miawilsonn4)', reason: 'fails the new breakout rule (plays are 3.7x followers, under 5x) and the sound is not spreading. Removed from Test #1\'s list.' },
  { item: 'Thank-you-dad B&W photo trend (2 creators, 2 different sounds)', reason: 'personal tribute storytelling, not adaptable for businesses; sources are 22-23s tutorials' },
];
fs.writeFileSync(path.join(dir, 'final-selection.json'), JSON.stringify({ test: 'test-02', released: false, note: 'Experiment output. Not published; not a release for the repeat rule.', classificationRules: CLASS_RULES, summary, rejectedAfterReview, records }, null, 2));
console.log(JSON.stringify(summary, null, 1));
for (const r of records) console.log(`${r.classification.padEnd(9)} ${r.name} | ${r.example.durationSec}s | ${r.sourceFacts.plays.toLocaleString()} plays | ratio ${r.sourceFacts.playsPerFollowerFloored} | audio ${r.ourAssessment.audioRisk} | ${r.ourAssessment.difficulty} | visual ${r.ourAssessment.visualCheck.verified}`);
