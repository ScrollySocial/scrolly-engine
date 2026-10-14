// Step 4: build the final test selection. SOURCE FACTS are copied from the collected data by code;
// OUR ASSESSMENT fields are Claude's judgment (this session), written from captions, hashtags and sound metadata.
// The videos themselves were NOT watched, so format descriptions are inferred and say so.
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './apify.mjs';

const SNAPSHOT = '2026-W39';
const snapDir = path.join(DATA_DIR, 'snapshots', SNAPSHOT);
const clusters = JSON.parse(fs.readFileSync(path.join(snapDir, 'clusters.json'), 'utf8'));
const verify = JSON.parse(fs.readFileSync(path.join(snapDir, 'sound-verification.json'), 'utf8'));

// Status rules (deterministic, from verification facts). "Sustained" is impossible until 5 weekly snapshots exist.
function statusFor(soundId, examplePostedAt) {
  const v = verify.sounds[soundId];
  if (!v) return { status: 'Unverified', basis: 'sound not checked' };
  const soundAgeDays = v.oldestPostInSample ? (Date.parse(verify.checkedAt) - Date.parse(v.oldestPostInSample)) / 86_400_000 : null;
  if (v.creatorsLast14d >= 3 && soundAgeDays !== null && soundAgeDays <= 150)
    return { status: 'Rising', basis: `${v.creatorsLast14d} different creators posted with this sound in the last 14 days among its top ${v.sampled} videos; earliest sampled use ${v.oldestPostInSample.slice(0, 10)}` };
  if (v.sampled <= 1)
    return { status: 'Breakout post', basis: 'brand-new sound: only this video uses it so far. Strong performance, not yet a trend' };
  return { status: 'Breakout post (established sound)', basis: `sound in use since at least ${v.oldestPostInSample.slice(0, 10)}; ${v.creatorsLast14d} of its top ${v.sampled} videos are from the last 14 days, so the evidence is this week's video, not sound-wide growth` };
}

const k = (n) => n.toLocaleString('en-US');

// rank -> our assessment. rank refers to clusters.json order printed by analyze.mjs.
const ASSESS = {
  18: {
    trendName: 'Glow-up transition (before → after on the beat)',
    formatTag: 'transition:glow-up-before-after',
    why: 'The sound shows trend-level spread (several different creators this fortnight) and the example has a TikTok template attached. Any business with a visible before/after can copy it.',
    film: '0-5s: the "before" shot, plain, filmed straight on. 5-6s: cover the lens or snap on the beat. 6-12s: the "after" in the same framing and pose, holding still for the reveal.',
    product: 'Plain packaging or raw materials → the finished, styled product in the same spot. Digital sellers: blank template → the finished design on screen.',
    service: 'Stylists, cleaners, organisers, landscapers, designers: the space or client before → after, same angle.',
    text: '"Same spot. 2 hours later."',
    cautions: ['Tap "Try TikTok template" on the example if available and replace the clips; timing is kept.'],
  },
  28: {
    trendName: 'Two-person outfit transition',
    formatTag: 'transition:duo-outfit-swap',
    why: 'A new sound (first seen mid-August) with several creators using it in the last 14 days, so the data supports "rising". It needs two people and a quick change, nothing else.',
    film: '0-4s: two people side by side in plain or work clothes. 4-5s: jump or clap on the beat. 5-9s: both in the "styled" look. Keep the camera locked in place.',
    product: 'Boutiques and apparel: before outfit → your pieces. Accessory or beauty sellers: bare → wearing or using the product.',
    service: 'Two team members: street clothes → uniform ("clocking in"). Salons: before → after appointment looks.',
    text: '"Us before vs after opening the shop"',
    cautions: ['Needs a second person.'],
  },
  4: {
    trendName: 'Upside-down flip transition',
    formatTag: 'transition:upside-down-flip',
    why: 'A recent sound (late August) with several creators in the last 14 days. The example is a makeup transition with a TikTok template attached. The flip mechanic transfers to any reveal.',
    film: '0-5s: the "before" shot. 5-6s: flip the phone (or the product) upside down on the beat. 6-11s: the finished result, the right way up.',
    product: 'Flip from the product in its box to the product styled or in use. Food: raw ingredients → the plated dish.',
    service: 'Makeup artists, nail techs, barbers, photographers: bare → finished look, or raw photo → edited photo.',
    text: '"Wait for the flip"',
    cautions: ['The example creator has a large following (4.1M), so plays per follower is low. The sound spread, not this single video, is the evidence.'],
  },
  13: {
    trendName: '5-second hair (or anything) transformation',
    formatTag: 'transformation:5s-quick-reveal',
    why: 'Very short (5s) and unusually widely shared (26,129 shares on 1.1M plays from a 279-follower account). The sound is an older one being picked up again this week.',
    film: '0-2s: "before", quick and unposed. 2-5s: the reveal, one clean shot, no talking.',
    product: 'Anything with a transformation: skincare, cleaning products, tools, packaging makeovers.',
    service: 'Hair stylists first; also groomers, detailers and cleaners. Show the client result in 5 seconds.',
    text: '"New [hair / car / kitchen] for a new season"',
    cautions: ['Get client permission before posting their face.'],
  },
  31: {
    trendName: '"Tomorrow." limited-drop teaser',
    formatTag: 'announcement:countdown-drop-teaser',
    why: 'A breakout post: 495K plays from a 1,938-follower shop, and 16,308 shares (unusually high for a product post). It is a launch format any seller can reuse, and a template is attached.',
    film: '0-3s: black screen or close-up with "Tomorrow." 3-8s: quick glimpses of the product, never fully shown. 8-10s: drop date and time and "limited".',
    product: 'New collections, restocks, limited batches, digital product launches.',
    service: 'Opening a limited number of booking slots, a new service menu, or a waitlist opening.',
    text: '"Tomorrow. Limited. Once it\'s gone, it\'s gone."',
    cautions: ['Only say "limited" if it is true.', 'It is a single breakout post, not a proven trend.'],
  },
  17: {
    trendName: '"The secret\'s out" launch reveal',
    formatTag: 'announcement:secret-reveal',
    why: 'A breakout post: 841K plays at about 24x the brand\'s follower count, on a long-established sound. It is a simple reveal format for launches or collabs.',
    film: '0-3s: finger to lips or a covered product, with text "the secret\'s out". 3-8s: the reveal. 8-10s: date plus "early access link in bio".',
    product: 'New product, new colourway, or a collaboration with another small brand.',
    service: 'A new service, a new location, or a new team member.',
    text: '"The secret\'s out 👀 [thing] drops [date]"',
    cautions: ['The example leans on an influencer collab; members do not need one.', 'Breakout post on an established sound, not sound-wide growth.'],
  },
  23: {
    trendName: 'Short clip + long "why I started" story caption',
    formatTag: 'story:text-overlay-origin',
    why: 'A 6-second clip with a story told in text got 599K plays and 8,346 saves from a 578-follower account. It speaks directly to digital-product sellers.',
    film: '0-6s: one calm shot (you working, a coffee, your screen). The story goes in on-screen text and the caption, not spoken.',
    product: 'Digital products especially: "a few years ago I was [problem], so I started [product]".',
    service: 'Consultants and coaches: "a few years ago I was stuck in [situation], so I started helping people [outcome]".',
    text: '"A few years ago, I was [relatable struggle]…"',
    cautions: ['The sound is not new, so the evidence is this video\'s performance, not a sound trend.'],
  },
  27: {
    trendName: 'Halloween outfit transition (seasonal)',
    formatTag: 'transition:seasonal-halloween-outfit',
    why: 'Seasonally timely: posted this week as part of a series. 559K plays and 31,946 saves (people saving it to copy), and a TikTok template is attached.',
    film: '0-3s: everyday look. 3s: snap or turn on the beat. 3-6s: Halloween version.',
    product: 'Halloween stock, costumes and accessories; bakeries (plain cookie → Halloween cookie).',
    service: 'Salons and nail techs (Halloween looks), photographers, event and party services.',
    text: '"Halloween transition idea, [your shop] edition"',
    cautions: ['Seasonal: useful until October 31 only.', 'Established sound; the evidence is this week\'s saves and plays.'],
  },
  33: {
    trendName: '"Nothing against influencers, but…" owner POV',
    formatTag: 'pov:owner-text-over-track',
    why: 'A 2,045-follower cookie business got 443K plays with an honest owner-POV text over a playful track. The relatable struggle is the hook, and anyone running a small business can use it.',
    film: '0-9s: you doing an everyday task in the business (packing, baking, answering messages) with the POV text on screen. No talking.',
    product: '"Nothing against [expensive option], but I\'d have to sell [X] of these just to pay for it, so hi, I\'m the face of the brand now."',
    service: '"Nothing against agencies, but that\'s [X] clients just to pay them, so I\'m doing my own marketing."',
    text: '"Guess I\'m the face of my brand now 😂"',
    cautions: ['Commercial track: may not be available on business accounts. Use a similar playful sound from the Commercial Music Library.'],
  },
  7: {
    trendName: '"Hotel Lobby" dynamic-duo template',
    formatTag: 'template:duo-walk-in',
    why: 'A 1,776-follower template account got 1.9M plays this week with a ready-made CapCut template. The trend itself dates to 2022, so this is a fresh hit on an old format, not a new trend.',
    film: 'Use the CapCut template linked from the example: two people, walk-in or pose clips, and the template handles the cuts (about 10s).',
    product: 'Owner + product as "the duo", or two best-sellers "walking in" as a pair.',
    service: 'Two team members as the duo ("your stylist and colourist walking into Monday").',
    text: '"The dynamic duo behind [business]"',
    cautions: ['Commercial track (Quavo & Takeoff): likely unavailable on business accounts.', 'Old trend: the sound check found no top videos newer than 2025.'],
  },
};

const picks = Object.keys(ASSESS).map(Number);
const records = picks.map((rank) => {
  const c = clusters[rank - 1];
  const v = c.videos[0];
  const a = ASSESS[rank];
  const st = statusFor(c.soundId, v.postedAt);
  const sv = verify.sounds[c.soundId] || {};
  return {
    trendName: a.trendName,
    status: st.status,
    statusBasis: st.basis,
    example: { url: v.url, durationSec: Math.round(v.durationSec * 10) / 10, durationCompliant: v.durationSec <= 15, templateStickerOnExample: v.effects.some((e) => /template/i.test(e)) },
    audio: { name: c.soundName, id: c.soundId, url: `https://www.tiktok.com/music/original-sound-${c.soundId}`, author: c.soundAuthor, isOriginalSound: c.soundIsOriginal },
    sourceFacts: {
      source: 'clockworks/tiktok-scraper (search, past week, most liked) + clockworks/tiktok-sound-scraper',
      postedAt: v.postedAt, ageDaysAtCollection: v.ageDays, plays: v.plays, likes: v.likes, comments: v.comments, shares: v.shares, saves: v.saves,
      creator: v.author, creatorFollowers: v.authorFollowers, playsPerFollower: v.playsPerFollower,
      foundByQueries: v.foundByQueries, captionLanguage: v.language, postedFromCountry: v.locationCreated, hashtags: v.hashtags,
      soundCheck: { videosSampled: sv.sampled, distinctCreators: sv.distinctCreatorsSampled, creatorsLast7d: sv.creatorsLast7d, creatorsLast14d: sv.creatorsLast14d, earliestSampledUse: sv.oldestPostInSample, newestSampledUse: sv.newestPost },
    },
    ourAssessment: {
      assessedBy: 'Claude (AI judgment, 2026-09-25). Based on caption, hashtags, sound metadata and numbers. The videos were not watched, so the format is inferred.',
      whySelected: a.why, filmThis: a.film, productBusiness: a.product, serviceBusiness: a.service, onScreenText: a.text, cautions: a.cautions,
    },
    fingerprint: { primary: `tiktok:sound:${c.soundId}`, soundId: c.soundId, formatTag: a.formatTag, soundOriginator: (c.soundName || '').startsWith('original sound - ') ? c.soundName.slice(17) : c.soundAuthor },
  };
});

const order = { Rising: 0, 'Breakout post': 1, 'Breakout post (established sound)': 2 };
records.sort((x, y) => (order[x.status] ?? 9) - (order[y.status] ?? 9) || y.sourceFacts.plays - x.sourceFacts.plays);
fs.writeFileSync(path.join(snapDir, 'final-selection.json'), JSON.stringify({ snapshot: SNAPSHOT, released: false, note: 'TEST selection for review. Not published, and NOT counted as a weekly release for the 4-week repeat rule.', count: records.length, records }, null, 2));
for (const r of records) console.log(`${r.status.padEnd(34)} ${r.trendName} | ${r.example.durationSec}s | ${k(r.sourceFacts.plays)} plays | ${r.fingerprint.primary}`);
