/**
 * Quick Content Ideas -- a deliberately simpler, separate idea generator
 * from idea-generator.mjs's sophisticated engine (which needs Module 2-5's
 * full buyer/trigger/channel/message pipeline). This one needs only the
 * business profile every Club member already has from Module 1 onboarding
 * (offer + audience), so Content Studio never has to require completing
 * Module 5 first -- per the "short business summary supplies the necessary
 * context" instruction.
 *
 * These are honestly a lower tier: generic prompts personalized with the
 * member's own offer/audience text, not derived from real buyer triggers,
 * objections, or channel strategy the way the full engine's ideas are.
 * Every idea here says so explicitly (see `tier` on each returned item) so
 * the UI can label them accurately rather than implying they're as
 * targeted as the full pipeline's output.
 */

const TEMPLATES = [
  (offer, audience) => `Show exactly what ${audience} get when they choose ${offer}.`,
  (offer, audience) => `Answer the #1 question ${audience} ask before buying ${offer}.`,
  (offer, audience) => `Share why you started offering ${offer} for ${audience}.`,
  (offer, audience) => `Bust a common myth ${audience} believe that gets in the way of ${offer}.`,
  (offer, audience) => `Give a behind-the-scenes look at how you deliver ${offer}.`,
  (offer, audience) => `Highlight one specific result ${audience} can expect from ${offer}.`,
];

/**
 * @param {{offer: string|null, audience: string|null}} profile
 * @returns {Array<{idea:string, channel:string, role:string, purpose:string, angle:null, tier:'quick'}>}
 */
export function generateQuickIdeas(profile) {
  const offer = (profile?.offer || '').trim();
  const audience = (profile?.audience || '').trim();
  if (!offer || !audience) return [];
  return TEMPLATES.map((build) => ({
    idea: build(offer, audience),
    channel: 'Any channel',
    role: 'Starter idea',
    purpose: 'Generated from your Module 1 profile (offer + audience) — not yet personalized to your buyer\'s specific triggers, objections, or channels.',
    angle: null,
    tier: 'quick',
  }));
}
