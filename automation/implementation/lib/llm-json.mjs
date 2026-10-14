/**
 * Shared JSON-reply handling for the Path 2/3/4 LLM generators. All three
 * ask the model for a single JSON object/array and used to bare-JSON.parse
 * it — confirmed live failure (Mulberry Creek finding #31, schema-markup
 * Path 2 generation): when the requested JSON contains a nested JSON string
 * (a JSON-LD <script> block embedded as a "content" value), the model's
 * quote-escaping sometimes leaks past the nested string's closing quote,
 * leaving a stray backslash before the NEXT key — `"placement\": "..."`
 * instead of `"placement": "..."`. That corrupts parsing for a
 * once-otherwise-valid reply.
 */

import { complete } from './llm-router.mjs';

function stripFences(text) {
  return text.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
}

// A literal `\":` never legitimately appears in valid JSON — an escaped
// quote can't be immediately followed by the colon delimiter — so collapsing
// it back to `":` is a safe, targeted repair for the escape-leak failure
// mode above (as opposed to a general/fragile JSON auto-fixer).
function repairEscapeLeak(text) {
  return text.replace(/\\"(\s*):/g, '"$1:');
}

function tryParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Calls the LLM expecting a single JSON reply (object or array). Parse path:
 * as-is -> after a targeted escape-leak repair -> one corrective retry
 * asking the model to fix its own malformed output -> throw.
 */
export async function completeJson({ prompt, maxTokens, label }) {
  const { text } = await complete({ prompt, maxTokens });
  const cleaned = stripFences(text);

  let result = tryParse(cleaned);
  if (result !== null) return result;
  result = tryParse(repairEscapeLeak(cleaned));
  if (result !== null) return result;

  const retryPrompt = `The following was supposed to be valid JSON but failed to parse. Return ONLY the corrected, valid JSON with the exact same fields and content — no markdown fences, no commentary, no explanation.\n\n${cleaned}`;
  const retry = await complete({ prompt: retryPrompt, maxTokens });
  const retryCleaned = stripFences(retry.text);
  result = tryParse(retryCleaned);
  if (result === null) result = tryParse(repairEscapeLeak(retryCleaned));
  if (result !== null) return result;

  throw new Error(`${label}: LLM did not return valid JSON after repair+retry\nRaw: ${cleaned}`);
}
