/**
 * Channel -> Message Map -- one of Module 5's most important outputs. Maps
 * messaging/content guidance onto Module 4's ACTUAL Channel Jobs (never a
 * generic "post here too" list, never identical content across channels).
 *
 * Reuses Module 4's own `JOB_PHRASES` (channel-evaluation.mjs, frozen Module
 * 4 surface) for job framing rather than re-describing each job differently
 * here -- one source of truth for what a job means.
 */
import { channelRef } from './channel-content.mjs';
import { JOB_PHRASES } from './channel-evaluation.mjs';
import { CONTENT_ROLE_LABELS, JOB_TO_CONTENT_ROLES, JOB_TO_CTA_CATEGORY, CTA_CATEGORY_LABELS, CTA_CATEGORY_EXAMPLES } from './messaging-content.mjs';
import { clause, topic } from './messaging-text-utils.mjs';

// Formats generically suitable for a channel that needs no ongoing content
// production of its own (e.g. a marketplace listing, a Maps profile) --
// used only when the channel's own CHANNEL_REFERENCE.requiredFormats is empty.
const LISTING_STYLE_FORMATS = ['photography_images', 'graphics_design', 'writing_articles'];

function suitableFormats(channelKey, feasibleFormats = []) {
  const ref = channelRef(channelKey);
  if (!ref) return [];
  if (ref.requiredFormats.length === 0) {
    const overlap = LISTING_STYLE_FORMATS.filter((f) => feasibleFormats.includes(f));
    return overlap.length > 0 ? overlap : feasibleFormats;
  }
  return ref.requiredFormats.filter((f) => feasibleFormats.includes(f));
}

/** Picks the strongest angle relevant to this channel's job -- reused verbatim for the "what to communicate" sentence and later by the idea generator. */
function angleForJob(job, angles) {
  const roles = JOB_TO_CONTENT_ROLES[job] || [];
  if (roles.includes('proof_process')) {
    const a = angles.find((x) => x.sourceType === 'proof' || x.sourceType === 'objection_observed');
    if (a) return a;
  }
  if (roles.includes('problem')) {
    const a = angles.find((x) => x.sourceType === 'trigger');
    if (a) return a;
  }
  if (roles.includes('desire')) {
    const a = angles.find((x) => x.sourceType === 'desired_result');
    if (a) return a;
  }
  return angles[0] || null;
}

function buildWhatToCommunicate({ channelLabel, job, coreMessage, angle }) {
  const jobPhrase = JOB_PHRASES[job] || job.replace(/_/g, ' ');
  const base = `On ${channelLabel}, the job is to ${jobPhrase}. Center that on: ${clause(coreMessage, 'the core message')}`;
  return angle ? `${base}, especially through the angle of "${topic(angle.name)}."` : `${base}.`;
}

/**
 * @param {object} params
 * @param {Array} params.channels - [{ key, label, job, isPrimary, isSecondary, isCompounding }] -- Module 4's actual selected channels only (never Not Now channels)
 * @param {string[]} params.feasibleFormats - Module 4's ChannelPlan.feasibleFormats
 * @param {string} params.coreMessage
 * @param {Array} params.angles - from message-angle-generator.mjs
 * @returns {Array} one entry per selected channel, each with distinct guidance
 */
export function buildChannelMessageMap({ channels, feasibleFormats, coreMessage, angles }) {
  return channels.map(({ key, label, job }) => {
    const roles = (JOB_TO_CONTENT_ROLES[job] || []).map((r) => ({ role: r, label: CONTENT_ROLE_LABELS[r] }));
    const ctaCategory = JOB_TO_CTA_CATEGORY[job] || 'discover';
    const angle = angleForJob(job, angles);
    return {
      channel: label,
      channelKey: key,
      job,
      jobLabel: job.replace(/_/g, ' '),
      whatToCommunicate: buildWhatToCommunicate({ channelLabel: label, job, coreMessage, angle }),
      priorityRoles: roles,
      suitableFormats: suitableFormats(key, feasibleFormats),
      ctaCategory,
      ctaLabel: CTA_CATEGORY_LABELS[ctaCategory],
      ctaExamples: CTA_CATEGORY_EXAMPLES[ctaCategory] || [],
    };
  });
}
