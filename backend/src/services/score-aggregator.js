import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

let cachedConfig = null;

export function loadScoringConfig() {
  if (cachedConfig) return cachedConfig;
  const path = join(__dirname, '../../data/scoring-config.json');
  cachedConfig = JSON.parse(readFileSync(path, 'utf-8'));
  return cachedConfig;
}

/**
 * Normalize a raw value to 0-100 for critic (linear scale).
 * @param {number} raw
 * @param {{ scale: [number, number], scaleTo100?: boolean }} sourceConfig
 */
function normalizeCritic(raw, sourceConfig) {
  if (raw == null || typeof raw !== 'number') return null;
  const [min, max] = sourceConfig.scale || [0, 100];
  if (sourceConfig.scaleTo100 && max <= 10) {
    return Math.max(0, Math.min(100, (raw - min) / (max - min) * 100));
  }
  return Math.max(0, Math.min(100, (raw - min) / (max - min) * 100));
}

/**
 * Normalize a raw value to 0-100 for popularity (log scale for counts).
 * @param {number} raw
 * @param {{ normalize?: string }} sourceConfig
 */
function normalizePopularity(raw, sourceConfig) {
  if (raw == null || typeof raw !== 'number') return null;
  if (sourceConfig.normalize === 'log_100') {
    const logMax = Math.log10(1e6 + 1);
    const v = Math.log10((raw || 0) + 1);
    return Math.max(0, Math.min(100, (v / logMax) * 100));
  }
  return Math.max(0, Math.min(100, raw));
}

/**
 * Compute single dimension score from raw values per source.
 * @param {'popularity'|'critic'} dimension
 * @param {Record<string, Record<string, number>|null>} rawScoresBySource - e.g. { igdb: { aggregated_rating: 85, rating_count: 1000 }, opencritic: null }
 * @param {object} config - full scoring config
 * @returns {number}
 */
function computeDimensionScore(dimension, rawScoresBySource, config) {
  const dimConfig = config.dimensions[dimension];
  if (!dimConfig?.sources) return config.fallback?.[dimension] ?? 50;

  const isCritic = dimension === 'critic';
  const available = [];

  for (const source of dimConfig.sources) {
    if (!source.enabled) continue;
    const rawData = rawScoresBySource[source.id];
    if (rawData == null) continue;
    const rawValue = source.field ? rawData[source.field] : rawData;
    let normalized = null;
    if (isCritic) {
      normalized = normalizeCritic(rawValue, source);
    } else {
      normalized = normalizePopularity(rawValue, source);
    }
    if (normalized != null) available.push({ weight: source.weight, value: normalized });
  }

  if (available.length === 0) return config.fallback?.[dimension] ?? 50;

  const whenMissing = config.whenSourceMissing || 'renormalize';
  if (whenMissing === 'useFallbackScore') {
    const fallbackVal = config.fallback?.[dimension] ?? 50;
    let sumWeight = 0;
    let weightedSum = 0;
    for (const s of dimConfig.sources) {
      if (!s.enabled) continue;
      const rawData = rawScoresBySource[s.id];
      const rawValue = rawData != null && s.field ? rawData[s.field] : null;
      let value;
      if (rawValue != null && typeof rawValue === 'number') {
        value = isCritic ? normalizeCritic(rawValue, s) : normalizePopularity(rawValue, s);
      } else {
        value = fallbackVal;
      }
      weightedSum += s.weight * value;
      sumWeight += s.weight;
    }
    return sumWeight ? weightedSum / sumWeight : (config.fallback?.[dimension] ?? 50);
  }

  // renormalize: only available sources, weights proportional
  const totalWeight = available.reduce((s, a) => s + a.weight, 0);
  const weightedSum = available.reduce((s, a) => s + a.weight * a.value, 0);
  return totalWeight ? weightedSum / totalWeight : (config.fallback?.[dimension] ?? 50);
}

/**
 * Compute (popularity, critic) for a single work from raw scores per source.
 * @param {Record<string, Record<string, number>|null>} rawScoresBySource - e.g. { igdb: { aggregated_rating: 85, rating_count: 1000 } }
 * @param {object} [config] - optional config; loads from file if not provided
 * @returns {{ popularity: number, critic: number }}
 */
export function aggregateScoreForWork(rawScoresBySource, config = null) {
  const cfg = config || loadScoringConfig();
  const popularity = computeDimensionScore('popularity', rawScoresBySource, cfg);
  const critic = computeDimensionScore('critic', rawScoresBySource, cfg);
  return { popularity, critic };
}

/**
 * Aggregate (P0, C0) from multiple works' (p, c) (e.g. user's 4-5 selections).
 * @param {Array<{ popularity: number, critic: number }>} scores
 * @param {object} [config]
 * @returns {{ popularity: number, critic: number }}
 */
export function aggregateSelectionScores(scores, config = null) {
  const cfg = config || loadScoringConfig();
  if (!scores?.length) return { popularity: cfg.fallback?.popularity ?? 50, critic: cfg.fallback?.critic ?? 50 };
  const agg = cfg.selectionAggregation || 'mean';
  if (agg === 'mean') {
    const p = scores.reduce((s, x) => s + x.popularity, 0) / scores.length;
    const c = scores.reduce((s, x) => s + x.critic, 0) / scores.length;
    return { popularity: p, critic: c };
  }
  return { popularity: scores[0].popularity, critic: scores[0].critic };
}
