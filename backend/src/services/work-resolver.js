import { loadScoringConfig } from './score-aggregator.js';

// In-memory cache: canonicalId -> { sourceId: externalId | null }
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Normalize name for search: lowercase, trim, remove common suffixes.
 * @param {string} name
 */
function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*-(?:edition|remastered|重制版|完全版| definitive edition)\s*$/i, '');
}

/**
 * Resolve external IDs for a canonical work (e.g. from IGDB) so each scoring source can be queried.
 * Uses external_games when available; otherwise other sources get null (to be filled by name search in adapters).
 * @param {object} canonicalWork - e.g. { id, name, alternative_names?: Array<{name: string}>, external_games?: Array<{category, uid: string}> }
 * @param {object} [config] - scoring config (to list source ids)
 * @returns {Record<string, string|null>} e.g. { igdb: "123", opencritic: null }
 */
export function resolveWorkForSources(canonicalWork, config = null) {
  const cfg = config || loadScoringConfig();
  const canonicalId = canonicalWork?.id ?? canonicalWork?.igdb_id;
  if (canonicalId == null) return {};

  const cacheKey = `igdb:${canonicalId}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  const result = {};
  const sourceIds = new Set();
  for (const dim of Object.values(cfg.dimensions || {})) {
    for (const s of dim.sources || []) {
      if (s.enabled) sourceIds.add(s.id);
    }
  }

  // Primary source is IGDB for games; canonical id is IGDB id
  if (sourceIds.has('igdb')) {
    result.igdb = String(canonicalId);
  }

  // Map IGDB external_games category to our source id for lookup
  // IGDB: 1=steam, 2=gog, 3=youtube, 4=twitter, etc. OpenCritic often uses Steam ID.
  const externalGames = canonicalWork.external_games || [];
  for (const ext of externalGames) {
    if (ext.category === 1 && ext.uid) {
      if (sourceIds.has('opencritic')) result.opencritic = result.opencritic ?? ext.uid;
      if (sourceIds.has('steam')) result.steam = ext.uid;
    }
  }

  // Other sources: no external ID yet, leave null (adapters can try name search)
  for (const id of sourceIds) {
    if (result[id] === undefined) result[id] = null;
  }

  cache.set(cacheKey, { result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}

/**
 * Get list of names to try for name-based search (canonical + alternatives, normalized).
 * @param {object} canonicalWork
 * @returns {string[]}
 */
export function getSearchNames(canonicalWork) {
  const names = [];
  if (canonicalWork?.name) names.push(canonicalWork.name);
  const alts = canonicalWork?.alternative_names || [];
  for (const a of alts) {
    const n = typeof a === 'string' ? a : a?.name;
    if (n && !names.includes(n)) names.push(n);
  }
  const normalized = names.map(normalizeName).filter(Boolean);
  return [...new Set([...names, ...normalized])];
}

/**
 * Clear resolver cache (e.g. for tests).
 */
export function clearResolverCache() {
  cache.clear();
}
