/**
 * The shared, platform-neutral Content Opportunity catalog. One central
 * dataset, reused across every customer (never per-customer content) --
 * matching the architecture the project already committed to for "Current
 * Content Opportunities" (see current-state.md/club/README.md's "Not built
 * yet" list: "one central/shared dataset... cheap per-business filtering").
 *
 * SCOPE NOTE: this is a real, hand-considered V1 seed set (16 opportunities
 * x 3 platform adaptations = 48), not the full "~100" the spec describes.
 * Generating 100 opportunities to hit a headcount would mean either
 * fabricating shallow, generic entries (against this project's own
 * evidence-integrity standard) or authoring real content at a pace this
 * slice's scope doesn't cover -- the schema, ranking, and assignment
 * logic below are all written to scale to 100+ without any code change;
 * growing the catalog itself is a content-authoring task for a follow-up
 * pass, ideally with Mercedes's own review.
 *
 * No opportunity here promises virality, reach, or any specific outcome --
 * every one is a content ANGLE, not a guarantee. `shelfLife`/`difficulty`
 * are honest production-planning labels, not performance predictions.
 *
 * Reuses existing vocabularies rather than inventing parallel ones:
 * - funnelJob: channel-content.mjs's CHANNEL_JOBS
 * - ctaType: messaging-content.mjs's CTA_CATEGORY_LABELS keys
 * - applicableBusinessModels: business-model-router.mjs's route keys
 */

// 2026-09-16: added 'linkedin' for the three-track pivot. Its adaptation
// below reframes the same underlying angle as a written post/document
// structure rather than a video script -- the base hook/execution/caption
// text was authored video-first, so the LinkedIn variant does real
// reframing work, not just a relabel. See platformAdaptationsFor().
export const PLATFORMS = /** @type {const} */ (['instagram_reels', 'tiktok', 'youtube_shorts', 'linkedin']);
export const SHELF_LIVES = /** @type {const} */ (['evergreen', 'seasonal', 'trend_dependent']);
export const DIFFICULTIES = /** @type {const} */ (['low', 'medium', 'high']);
export const SOURCE_BASES = /** @type {const} */ ([
  'general_content_marketing_principle', // a durable, widely-observed pattern, not a live trend
  'business_model_pattern',              // reasoned from this route's own funnel shape
  'founder_operational_experience',      // Scrolly's own documented operating experience
]);

/**
 * One core concept, three platform executions. The IG/TikTok/YouTube
 * differences below are genuine platform-norm differences (native/raw vs.
 * aesthetic/save-worthy vs. searchable/explained), not the same text
 * relabeled -- see each platform's own note.
 */
function platformAdaptationsFor({ hook, execution, caption, cta, ytTitle }) {
  return [
    {
      platform: 'instagram_reels',
      hookVariation: hook,
      executionNotes: `${execution} Instagram rewards a visually clean, save-or-share-worthy cut -- plan for a clear opening frame even with sound off.`,
      captionGuidance: `${caption} Keep the caption itself doing real work (context/CTA), since IG captions are read more than TikTok's.`,
      ctaGuidance: cta,
      titleMetadata: null,
    },
    {
      platform: 'tiktok',
      hookVariation: `${hook} (said/shown in the first 1-2 seconds, no slow build)`,
      executionNotes: `${execution} TikTok rewards native, unpolished delivery over a produced look -- talk to camera like a real person, not an ad.`,
      captionGuidance: `${caption} Shorter and more conversational than the IG version is fine here.`,
      ctaGuidance: cta,
      titleMetadata: null,
    },
    {
      platform: 'youtube_shorts',
      hookVariation: hook,
      executionNotes: `${execution} YouTube Shorts is discovered by search and suggested-content as much as follows -- a beat of plain explanation lands better here than on the other two.`,
      captionGuidance: caption,
      ctaGuidance: cta,
      titleMetadata: { title: ytTitle },
    },
    {
      platform: 'linkedin',
      // Written-post reframing, not a video script relabeled -- see file
      // header. postType tells the UI which field labels to show
      // (opening line / post structure / post copy, not hook/shoot/caption).
      hookVariation: `Opening line: state the same core idea as a direct, credible claim, not a video hook. Example shape: ${hook}.`,
      executionNotes: `Structure: ${execution.replace(/^Film |^Show /, 'Describe ')} As a LinkedIn post, this usually works better as 3-5 short paragraphs or a short document/carousel walking through the same idea, not a single line.`,
      captionGuidance: `Post copy: ${caption} End on a specific, low-pressure question or ask (a comment prompt works well here), not a generic "let me know."`,
      ctaGuidance: cta,
      titleMetadata: { postType: 'text_or_document' },
    },
  ];
}

function opp({ id, coreConcept, hook, execution, caption, cta, ytTitle, funnelJob, ctaType, businessModels, industries = [], shelfLife = 'evergreen', difficulty, sourceBasis }) {
  return {
    opportunityId: id,
    coreConcept,
    hookAngle: hook,
    contentPurpose: coreConcept, // short free-text restatement of the angle's job -- funnelJob carries the categorical value; see file header
    funnelJob,
    applicableBusinessModels: businessModels,
    applicableIndustries: industries,
    shelfLife,
    difficulty,
    ctaType,
    sourceMetadata: { basis: sourceBasis, note: 'A durable content angle, not a live trend/virality claim.' },
    createdAt: '2026-09-13',
    currentAsOf: '2026-09-13',
    platformAdaptations: platformAdaptationsFor({ hook, execution, caption, cta, ytTitle }),
  };
}

export const OPPORTUNITY_CATALOG = [
  opp({
    id: 'moment-of-solving', coreConcept: 'Show the exact moment your product/service solves the problem',
    hook: 'The exact second this actually works', execution: 'Film the real before -> action -> resolved moment, not a staged reenactment.',
    caption: 'Name the specific problem being solved in plain language.', cta: 'discover', ytTitle: 'Watch This Actually Solve [problem] in Seconds',
    funnelJob: 'discovery', ctaType: 'discover', businessModels: ['ecommerce', 'services', 'digital_product', 'creator_affiliate', 'marketplace_first', 'local_hybrid'],
    difficulty: 'low', sourceBasis: 'general_content_marketing_principle',
  }),
  opp({
    id: 'top-objection-on-camera', coreConcept: 'Answer the single most common objection directly on camera',
    hook: '"Isn\'t this just [the objection]?"', execution: 'State the real objection a prospect actually says, then answer it honestly -- no strawman.',
    caption: 'Invite people to add the objection they still have in the comments.', cta: 'consider', ytTitle: 'Answering the #1 Question People Ask Before Buying',
    funnelJob: 'consideration', ctaType: 'consider', businessModels: ['ecommerce', 'services', 'digital_product', 'creator_affiliate', 'marketplace_first', 'local_hybrid'],
    difficulty: 'low', sourceBasis: 'business_model_pattern',
  }),
  opp({
    id: 'behind-the-scenes-made', coreConcept: 'Behind-the-scenes of how the thing is made or delivered',
    hook: 'What actually goes into this', execution: 'Real process footage, not a polished commercial -- the "unpolished" part is the point.',
    caption: 'Give one specific detail most customers never see.', cta: 'trust', ytTitle: 'How [the offer] Is Actually Made/Delivered',
    funnelJob: 'trust', ctaType: 'trust', businessModels: ['ecommerce', 'services', 'digital_product'],
    difficulty: 'medium', sourceBasis: 'general_content_marketing_principle',
  }),
  opp({
    id: 'before-after-reveal', coreConcept: 'Before/after or transformation reveal',
    hook: 'What changed, side by side', execution: 'Use a REAL before/after -- your own or a real customer\'s, never staged or exaggerated.',
    caption: 'State plainly what changed and over what timeframe -- no vague superlatives.', cta: 'discover', ytTitle: 'The Real Before and After',
    funnelJob: 'discovery', ctaType: 'discover', businessModels: ['ecommerce', 'services', 'local_hybrid'],
    difficulty: 'medium', sourceBasis: 'general_content_marketing_principle',
  }),
  opp({
    id: 'one-question-one-clip', coreConcept: 'A real customer question, answered in one clip',
    hook: 'You asked, here\'s the real answer', execution: 'Pull an actual question you\'ve been asked -- DM, email, in person -- and answer it directly.',
    caption: 'Quote the actual question as asked.', cta: 'educate', ytTitle: 'You Asked: [the real question]',
    funnelJob: 'education', ctaType: 'educate', businessModels: ['ecommerce', 'services', 'digital_product', 'creator_affiliate', 'marketplace_first', 'local_hybrid'],
    difficulty: 'low', sourceBasis: 'founder_operational_experience',
  }),
  opp({
    id: 'myth-vs-reality', coreConcept: 'Myth vs. reality about the category',
    hook: 'What people get wrong about [category]', execution: 'Pick one real misconception you hear often, correct it plainly -- no strawmanning a myth nobody believes.',
    caption: 'Name the myth exactly as people actually say it.', cta: 'educate', ytTitle: 'The Truth About [category] (Not What You\'ve Heard)',
    funnelJob: 'education', ctaType: 'educate', businessModels: ['ecommerce', 'services', 'digital_product', 'creator_affiliate', 'marketplace_first', 'local_hybrid'],
    difficulty: 'medium', sourceBasis: 'general_content_marketing_principle',
  }),
  opp({
    id: 'day-in-the-life', coreConcept: 'A day in the life of running the business',
    hook: 'What a real day actually looks like', execution: 'Genuine day footage -- the ordinary parts included, not a highlight reel.',
    caption: 'Let the ordinary moments stay in -- that\'s what builds trust here.', cta: 'trust', ytTitle: 'A Real Day Running [the business]',
    funnelJob: 'trust', ctaType: 'trust', businessModels: ['ecommerce', 'services', 'digital_product', 'creator_affiliate', 'marketplace_first', 'local_hybrid'],
    difficulty: 'low', sourceBasis: 'founder_operational_experience',
  }),
  opp({
    id: 'real-buyer-first-look', coreConcept: 'Unboxing or first impression from a real buyer',
    hook: 'Their actual first reaction', execution: 'Ask a real, willing customer to film their own honest first look -- never scripted.',
    caption: 'Credit the real customer if they\'re comfortable being named/tagged.', cta: 'trust', ytTitle: 'A Real Customer\'s First Look',
    funnelJob: 'trust', ctaType: 'trust', businessModels: ['ecommerce', 'digital_product'],
    difficulty: 'medium', sourceBasis: 'general_content_marketing_principle',
  }),
  opp({
    id: 'this-vs-alternative', coreConcept: 'Direct comparison: this vs. the common alternative',
    hook: '[This] vs [the thing people usually do instead]', execution: 'Compare honestly, including a real tradeoff -- a comparison with zero downsides reads as an ad, not information.',
    caption: 'State the one real, fair tradeoff plainly.', cta: 'consider', ytTitle: '[This] vs [The Alternative]: The Honest Comparison',
    funnelJob: 'consideration', ctaType: 'consider', businessModels: ['ecommerce', 'services', 'digital_product'],
    difficulty: 'medium', sourceBasis: 'business_model_pattern',
  }),
  opp({
    id: 'buying-process-walkthrough', coreConcept: 'Show the buying or booking process start to finish',
    hook: 'Exactly how easy/hard this actually is', execution: 'Screen-record or film the real steps a buyer takes, start to finish, no edits skipping friction.',
    caption: 'Link or point to exactly where to start.', cta: 'buy_convert', ytTitle: 'Exactly How to [buy/book] This',
    funnelJob: 'conversion_support', ctaType: 'buy_convert', businessModels: ['ecommerce', 'services', 'digital_product', 'creator_affiliate', 'marketplace_first', 'local_hybrid'],
    difficulty: 'low', sourceBasis: 'business_model_pattern',
  }),
  opp({
    id: 'three-signs-you-need-this', coreConcept: 'Three signs you actually need this',
    hook: '3 signs you need [the offer]', execution: 'Use real, specific signs a genuine prospect would recognize in themselves -- not generic pain points.',
    caption: 'List the 3 signs plainly in the caption too, for skimmers.', cta: 'discover', ytTitle: '3 Signs You Need [the offer]',
    funnelJob: 'discovery', ctaType: 'discover', businessModels: ['services', 'local_hybrid'],
    difficulty: 'low', sourceBasis: 'business_model_pattern',
  }),
  opp({
    id: 'one-real-result-story', coreConcept: 'One real result or case study, told as a story',
    hook: 'What actually happened for [a real customer]', execution: 'Tell one real, specific, permission-granted result as a short story arc: situation -> what they did -> result.',
    caption: 'Only ever a real, attributable result -- never a composite or invented one.', cta: 'trust', ytTitle: 'A Real Result: [customer]\'s Story',
    funnelJob: 'trust', ctaType: 'trust', businessModels: ['ecommerce', 'services', 'digital_product', 'creator_affiliate', 'marketplace_first', 'local_hybrid'],
    difficulty: 'medium', sourceBasis: 'general_content_marketing_principle',
  }),
  opp({
    id: 'genuinely-useful-tip', coreConcept: 'One quick tip that\'s genuinely useful, related to your category',
    hook: 'A tip you can use whether or not you buy from me', execution: 'Give a real, standalone-useful tip -- something valuable even to someone who never buys.',
    caption: 'Don\'t bury the tip behind a pitch -- lead with the value.', cta: 'discover', ytTitle: 'A Quick Tip About [category]',
    funnelJob: 'discovery', ctaType: 'discover', businessModels: ['ecommerce', 'services', 'digital_product', 'creator_affiliate', 'marketplace_first', 'local_hybrid'],
    difficulty: 'low', sourceBasis: 'general_content_marketing_principle',
  }),
  opp({
    id: 'whats-included-vs-not', coreConcept: 'What\'s included vs. what\'s not, set expectations plainly',
    hook: 'What you actually get (and don\'t)', execution: 'State the real scope honestly, including what\'s NOT included -- this reduces friction/refunds more than it costs sales.',
    caption: 'List both columns plainly -- included and not included.', cta: 'consider', ytTitle: 'Exactly What\'s Included With [the offer]',
    funnelJob: 'consideration', ctaType: 'consider', businessModels: ['ecommerce', 'services', 'digital_product'],
    difficulty: 'low', sourceBasis: 'business_model_pattern',
  }),
  opp({
    id: 'react-to-real-review', coreConcept: 'React to a real customer message or review',
    hook: 'A real message we got this week', execution: 'Read/show an actual message or review (with permission) and respond genuinely on camera.',
    caption: 'Never fabricate or composite a review -- only a real, permissioned one.', cta: 'trust', ytTitle: 'Reacting to a Real Customer Review',
    funnelJob: 'trust', ctaType: 'trust', businessModels: ['ecommerce', 'services', 'digital_product', 'creator_affiliate', 'marketplace_first', 'local_hybrid'],
    difficulty: 'low', sourceBasis: 'founder_operational_experience',
  }),
  opp({
    id: 'seasonal-tie-in', coreConcept: 'A seasonal or timely tie-in relevant to your offer',
    hook: 'Why now/this season matters for [the offer]', execution: 'Connect a real, currently-relevant moment (season, common event) to a genuine reason someone needs this now -- not a forced holiday tie-in.',
    caption: 'Be specific about the real timing reason, not generic "it\'s the season" filler.', cta: 'discover', ytTitle: 'Why Now Is the Time for [the offer]',
    funnelJob: 'discovery', ctaType: 'discover', businessModels: ['ecommerce', 'services', 'digital_product', 'creator_affiliate', 'marketplace_first', 'local_hybrid'],
    difficulty: 'medium', shelfLife: 'seasonal', sourceBasis: 'general_content_marketing_principle',
  }),
];
