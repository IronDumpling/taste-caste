import { loadScoringConfig } from './score-aggregator.js';

/**
 * Resolve caste id from (popularity, critic) using config casteBounds.
 * Bounds are checked in order; first matching interval wins.
 * @param {number} popularity
 * @param {number} critic
 * @param {object} [config] - optional; loads from file if not provided
 * @returns {string} caste id (e.g. 'brahmin') or 'default' if no match
 */
export function resolveCaste(popularity, critic, config = null) {
  const cfg = config || loadScoringConfig();
  const bounds = cfg.casteBounds || [];
  for (const b of bounds) {
    const [pMin, pMax] = b.popularity || [0, 100];
    const [cMin, cMax] = b.critic || [0, 100];
    if (popularity >= pMin && popularity <= pMax && critic >= cMin && critic <= cMax) {
      return b.id;
    }
  }
  return cfg.defaultCasteId || 'vaishya';
}
