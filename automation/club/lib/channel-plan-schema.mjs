/**
 * Module 4 (Choose How People Will Find You) — the persisted ChannelPlan.
 *
 * Same discipline as offer-plan-schema.mjs/discovery-plan-schema.mjs: only
 * DELIBERATE CUSTOMER DECISIONS live here. Unlike Modules 2/3, Module 4's
 * "decisions" are almost entirely NEW owner-execution inputs (Module 4 needs
 * a small amount of new information the prior modules never asked for --
 * marketing time, feasible formats, real assets/traction, hard constraints)
 * rather than confirmed/refined prior answers. The actual recommendation
 * (Primary/Secondary/Compounding/Not Now/jobs/confidence/strategy/
 * experiment) is NEVER stored here -- it's derived fresh every time by
 * channel-evaluation.mjs/module4.mjs from this plan plus Module 1/2/3's own
 * state, exactly like Module 2/3's Fix-First/Discovery-Gap-style judgments
 * are never persisted separately from their source decisions.
 *
 * `level: 'account_only' | 'real_traction'` on each existing asset is the
 * explicit mechanism that keeps "an account exists" from being silently
 * read as "traction exists" (a spec requirement) -- only 'real_traction'
 * entries feed the Existing Traction evaluation dimension.
 */

export const ASSET_TRACTION_LEVELS = /** @type {const} */ (['account_only', 'real_traction']);

export function newChannelPlan() {
  return {
    marketingHoursPerWeek: null,   // number or null -- a practical range input, never elaborate scheduling
    feasibleFormats: [],           // format keys the owner can realistically create (see channel-content.mjs's FEASIBLE_FORMATS)
    existingAssets: [],            // [{ type, level: 'account_only' | 'real_traction', detail }] -- empty array IS "none yet"
    hardConstraints: [],           // channel keys (from discovery-content.mjs's DISCOVERY_ENVIRONMENTS) the owner genuinely will not use
  };
}

export function assertValidChannelPlan(plan) {
  const required = Object.keys(newChannelPlan());
  for (const key of required) {
    if (!(key in plan)) throw new Error(`ChannelPlan missing required field "${key}"`);
  }
  for (const a of plan.existingAssets) {
    if (!ASSET_TRACTION_LEVELS.includes(a.level)) {
      throw new Error(`ChannelPlan existing asset level "${a.level}" is not one of: ${ASSET_TRACTION_LEVELS.join(', ')}`);
    }
  }
  return true;
}
