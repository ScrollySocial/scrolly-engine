/**
 * Goal gap + This Week (launch, 2026-09-26). Deterministic tables only, no AI.
 *
 * Goal gap: revenue so far in the current Challenge -> remaining to $1,000 -> more sales needed at the
 * current average sale. A day-30 projection is shown only from day 7 on, labeled as a planning estimate.
 *
 * This Week: turns the Plan (before any check-in: first priority) or the latest Weekly Review
 * (after: Module 7 constraint category) into a short execution list, varied by
 * executionKey = business type (route) + primary channel + current constraint.
 */
import { CHANNELS, WHERE_THEY_BUY, channelFor, saleWords, serviceVariant } from './plan-view.mjs';
import { CROSS_POST_NOTE } from './v1-instagram.mjs';

const CHALLENGE_GOAL_USD = 1000;
const CHALLENGE_DAYS = 30;
const money = (x) => '$' + Number(x).toLocaleString('en-US', { maximumFractionDigits: 2 });
/**
 * @param {object} saved - Start Here answers
 * @param {{started:boolean, day:number, revenue:number, over:boolean}} challenge - from PHP (revenue = logged inside the Challenge window)
 */
export function computeGoalGap(saved, challenge = {}) {
  const price = Number(saved.price);
  const revenue = Math.max(0, Number(challenge.revenue) || 0);
  const remaining = Math.max(0, CHALLENGE_GOAL_USD - revenue);
  const moreSales = remaining > 0 ? Math.ceil(remaining / price) : 0;
  const { avg, one, many } = saleWords(saved);
  const day = Number(challenge.day) || 0;
  const daysLeft = challenge.started ? Math.max(0, CHALLENGE_DAYS - day) : CHALLENGE_DAYS;
  const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
  const out = {
    started: !!challenge.started, day, revenue, remaining, reached: remaining === 0, moreSales,
    headline: `${money(revenue)} of ${money(CHALLENGE_GOAL_USD)}`,
    toGo: remaining > 0 ? `${money(remaining)} to go` : 'Goal reached',
    salesLine: remaining > 0
      ? `At your current ${money(price)} average ${avg}, ${moreSales === 1 ? `1 more ${one}` : `about ${moreSales} more ${many}`} ${moreSales === 1 ? 'gets' : 'get'} you there.`
      : 'You reached $1,000. Submit your proof to claim your stripe.',
    paceLine: null,
    projection: null,
  };
  if (challenge.started && remaining > 0 && daysLeft > 0) {
    const perWeek = Math.ceil(moreSales / weeksLeft);
    out.paceLine = `With ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left, that is about ${perWeek} ${perWeek === 1 ? one : many} a week.`;
  }
  // Early projections are noisy: only from day 7, always labeled, never the headline.
  if (challenge.started && day >= 7 && remaining > 0) {
    out.projection = `Planning estimate only: at your pace so far, day 30 lands around ${money(Math.round((revenue / day) * CHALLENGE_DAYS))}.`;
  }
  return out;
}

// ---- constraint -> execution mode (Plan priority before a check-in, Module 7 category after)
const MODE_BY_CONSTRAINT = {
  clarify_offer: 'reach', increase_discovery: 'reach', generate_buying_activity: 'reach', improve_conversion: 'decision',
  insufficient_data: 'track', discovery_constraint: 'reach', message_interest_constraint: 'interest', cta_movement_constraint: 'next_step',
  conversion_trust_constraint: 'decision', economics_volume_constraint: 'volume', capacity_constraint: 'capacity',
  repeatability_constraint: 'scale', path_healthy: 'scale',
};

// Content mix per mode. Reels = discovery/reach/traffic, carousels = education/trust/objections, Stories = nurture/proof/CTA.
const CONTENT_MIX = {
  reach: { reels: 5, carousels: 1, stories: 3, angle: 'Pick Reels that show your offer to new people. Discovery is the job this week.' },
  track: { reels: 4, carousels: 1, stories: 3, angle: 'Keep posting at a steady pace so next week has real numbers to read.' },
  interest: { reels: 4, carousels: 2, stories: 3, angle: 'Pick Reels whose hook names your buyer\'s problem in their own words. Use carousels to explain and answer doubts.' },
  next_step: { reels: 3, carousels: 1, stories: 5, angle: 'Every piece should end with one clear next step. Stories with a link sticker do the heavy lifting this week.' },
  decision: { reels: 3, carousels: 2, stories: 5, angle: 'Lead with proof: results, reviews, and answers to the questions people ask before buying.' },
  scale: { reels: 5, carousels: 1, stories: 3, angle: 'Repeat the format and message that just produced a sale. Change as little as possible.' },
  volume: { reels: 4, carousels: 1, stories: 4, angle: 'Feature your bundle or bigger option so each sale is worth more.' },
  capacity: { reels: 2, carousels: 1, stories: 2, angle: 'Post lightly. Your time is better spent handling the demand you already have.' },
};

const CONVERSION_ACTION = {
  reach: (c) => `End every post with one clear next step: ${c.destination}. Put the same link or instruction in your bio.`,
  track: (c) => `Check that ${c.destination} works on your phone from start to finish, so interest is not lost at the last step.`,
  interest: () => 'Rewrite the first line of your 3 most recent posts so it names the problem your buyer has, not your product.',
  next_step: (c) => `Put ${c.destination} in your bio, a pinned comment, and a Story link sticker. Say exactly what happens after they click.`,
  decision: (c) => `Add 3 pieces of proof right where people decide (${c.destination}): reviews, results, or a short client quote.`,
  scale: () => 'Keep the call to action that produced your sale. Do not change it this week.',
  volume: (c) => `Offer your bundle or bigger option right at ${c.destination}, so the upgrade is one tap away.`,
  capacity: () => 'Add a waitlist, booking window, or "next available" note so new interest is not lost while you catch up.',
};

// Business-specific action per route and mode ('*' = default for that route).
const BUSINESS_ACTION = {
  // Trades and other quote/call/DM services: jobs come from outreach and referrals.
  'services:outreach': {
    '*': 'Message 10 past clients or contacts: say you have openings this month and ask who they know.',
    decision: 'Ask 2 happy clients for a short review or testimonial you can post this week.',
    scale: 'Ask this week\'s client for a referral and a review while the result is fresh.',
    capacity: 'Batch your jobs into set days so you can take on the demand without burning out.',
  },
  // Booked services (photographers, consultants, coaches): clients book on proof.
  'services:booking': {
    '*': 'Share 3 recent results (photos, a client quote, or a before-and-after), each ending with "book yours" and your booking link.',
    decision: 'Add 2 client testimonials and your next available dates to your booking page.',
    next_step: 'Make your booking page show real availability and exactly what happens after someone books.',
    scale: 'Ask this week\'s client for a review and a referral while the result is fresh.',
    capacity: 'Open a waitlist or set booking windows so new interest is not lost.',
  },
  marketplace_first: {
    '*': 'Refresh the titles and first photo of your top 3 listings with the words buyers actually search.',
    decision: 'Add a size or in-use photo to your best listing and answer its most common question in the description.',
    volume: 'Create one bundle listing (2 or 3 items) from your best sellers.',
  },
  ecommerce: {
    '*': 'Link straight to your best-selling product page and make sure it shows the price, clear photos, and one line of proof.',
    decision: 'Add reviews and a shipping or returns line near the buy button on your best seller.',
    volume: 'Add a "buy 2, save" bundle or a matching add-on to your best seller.',
  },
  digital_product: {
    '*': 'Record a 20-second screen recording that shows the result your product gives, and link it to checkout.',
    decision: 'Add one real example of the finished result and a short "who this is for" line to your sales page.',
    volume: 'Create a bundle or premium version of your product.',
  },
  local_hybrid: {
    '*': 'Make ordering or booking effortless: one link in your Instagram bio that goes straight to ordering or booking.',
    decision: 'Add recent reviews and photos where people order or book online.',
    volume: 'Create a party pack, minimum box, or add-on option for online orders.',
  },
  creator_affiliate: {
    '*': 'Pick the one product you will recommend this week and end every post with the link to it.',
  },
};

/**
 * @param {object} saved - Start Here answers
 * @param {object} planView - computePlanView(saved)
 * @param {object|null} latest - { rec, d } from the most recent Weekly Review, or null
 * @param {object} challenge - PHP challenge info (see computeGoalGap)
 * @param {string} nextCheckIn - human-readable next check-in line from PHP
 */
export function computeThisWeek(saved, planView, latest, challenge = {}, nextCheckIn = '') {
  const constraint = latest ? latest.d.constraint.category : planView.firstPriority.type;
  const mode = MODE_BY_CONSTRAINT[constraint] || 'reach';
  const channelKey = channelFor(saved); // V1: always Instagram
  const c = { channel: CHANNELS[channelKey], destination: WHERE_THEY_BUY[saved.where] || 'the place people buy from you' };
  const mix = CONTENT_MIX[mode];
  const routeActions = BUSINESS_ACTION[saved.route === 'services' ? `services:${serviceVariant(saved)}` : saved.route] || {};
  const linkedin = channelKey === 'linkedin'; // dormant in V1 (Instagram-first); kept for future products
  // LinkedIn-first: same weekly ideas, written for LinkedIn (no Stories there). Everyone else: Instagram-first video.
  const contentItems = linkedin
    ? [
      { kind: 'posts', count: Math.min(3, mix.reels), text: `Write ${Math.min(3, mix.reels)} LinkedIn posts. Borrow ideas from this week's 25 Reel opportunities and turn them into text or short video posts.`, job: 'Reach and discovery' },
      { kind: 'carousels', count: mix.carousels, text: `Post ${mix.carousels} document ${mix.carousels === 1 ? 'post' : 'posts'} from the 30 carousel templates.`, job: 'Education, trust, and answering doubts' },
      { kind: 'engage', count: 10, text: 'Leave 10 thoughtful comments on posts by the people you want as clients.', job: 'Being seen by the right people' },
    ]
    : [
      { kind: 'reels', count: mix.reels, text: `Film ${mix.reels} Reels from this week's 25 fresh Reel opportunities.`, job: 'Reach and discovery' },
      { kind: 'carousels', count: mix.carousels, text: `Post ${mix.carousels} ${mix.carousels === 1 ? 'carousel' : 'carousels'} from the 30 carousel templates.`, job: 'Education, trust, and answering doubts' },
      { kind: 'stories', count: mix.stories, text: `Post Stories on ${mix.stories} days from the 30 Story templates.`, job: 'Staying in touch, proof, and your call to action' },
    ];
  const week = challenge.started ? Math.min(5, Math.max(1, Math.ceil((Number(challenge.day) || 1) / 7))) : null;
  const crossPost = linkedin
    ? 'LinkedIn is your main channel, so write for LinkedIn first. Short videos you make can still go to Instagram Reels, TikTok, and Shorts.'
    : CROSS_POST_NOTE;
  return {
    executionKey: { route: saved.route, channel: channelKey, constraint },
    mode,
    week,
    focus: latest ? latest.d.nextWeekFocus : planView.workOnNow[0],
    focusSource: latest ? `From your check-in for the week ending ${latest.rec.periodEnd}` : 'From your $1K Plan',
    goalGap: computeGoalGap(saved, challenge),
    content: {
      angle: linkedin
        ? mix.angle.replace('Stories with a link sticker do the heavy lifting this week.', 'A clear last line pointing to your next step does the heavy lifting this week.').replace(/Reels/g, 'posts')
        : mix.angle,
      items: contentItems,
      crossPost,
    },
    conversion: CONVERSION_ACTION[mode](c),
    business: routeActions[mode] || routeActions['*'] || null,
    // Same funnel boxes the check-in form asks for (the final stage is "sales", and Revenue has its own box).
    track: { metrics: planView.checkInMetrics.slice(0, -2), alsoTrack: ['Revenue and sales', 'Posts created and placements (cross-posts)'] },
    nextCheckIn,
  };
}
