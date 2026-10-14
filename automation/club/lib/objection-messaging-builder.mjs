/**
 * Objection Messaging -- brings forward Module 3's own carried-forward
 * objections (which are themselves Module 2's objections, confirmed/refined
 * in Module 3), preserving the observed/hypothesis distinction end to end.
 * Never discounts, never adds urgency/guarantees, never attacks a
 * competitor, and never lets a merely hypothesized objection read with the
 * same confidence as an observed one.
 */
import { directionForObjectionType } from './messaging-content.mjs';

/** @param {Array} objections - [{type, note, basis: 'observed' | 'hypothesis'}] */
export function buildObjectionMessaging(objections = []) {
  return objections.map((o) => ({
    objection: o.type,
    basis: o.basis,
    messageDirection: directionForObjectionType(o.type),
  }));
}
