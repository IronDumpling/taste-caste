/**
 * IGDB API v4 client (Twitch OAuth). Exports: searchGames, getGamesByIds, getGamesByGenres, getPopularGames, coverImageUrl.
 * Set IGDB_BASE_URL and TWITCH_TOKEN_URL in env to point at a mock server (e.g. mock-igdb) when without credentials.
 */

const IGDB_BASE = process.env.IGDB_BASE_URL || 'https://api.igdb.com/v4';
const TWITCH_TOKEN_URL = process.env.TWITCH_TOKEN_URL || 'https://id.twitch.tv/oauth2/token';

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('IGDB_CLIENT_ID and IGDB_CLIENT_SECRET must be set');
  }
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });
  const res = await fetch(`${TWITCH_TOKEN_URL}?${params}`, { method: 'POST' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IGDB token failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

/**
 * @param {string} endpoint - e.g. 'games'
 * @param {string} body - Apical query body
 * @returns {Promise<Array>}
 */
async function igdbRequest(endpoint, body) {
  const token = await getAccessToken();
  const res = await fetch(`${IGDB_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.IGDB_CLIENT_ID,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IGDB request failed: ${res.status} ${text}`);
  }
  return res.json();
}

const GAME_FIELDS = 'id,name,cover,genres,aggregated_rating,rating_count';

/**
 * @param {string} q - search query
 * @param {number} [limit=20]
 * @returns {Promise<Array<{id, name, cover, genres, aggregated_rating, rating_count}>>}
 */
export async function searchGames(q, limit = 20) {
  if (!q?.trim()) return [];
  const body = `search "${q.trim().replace(/"/g, '\\"')}"; fields ${GAME_FIELDS}; limit ${Math.min(limit, 50)};`;
  const data = await igdbRequest('games', body);
  return Array.isArray(data) ? data : [];
}

/**
 * @param {number[]} ids
 * @returns {Promise<Array<{id, name, cover, genres, aggregated_rating, rating_count}>>}
 */
export async function getGamesByIds(ids) {
  if (!ids?.length) return [];
  const clean = ids.filter((n) => Number.isInteger(n) && n > 0);
  if (!clean.length) return [];
  const body = `where id = (${clean.join(',')}); fields ${GAME_FIELDS};`;
  const data = await igdbRequest('games', body);
  return Array.isArray(data) ? data : [];
}

/**
 * @param {number[]} genreIds
 * @param {number[]} excludeGameIds
 * @param {number} [limit=40]
 * @returns {Promise<Array>}
 */
export async function getGamesByGenres(genreIds, excludeGameIds, limit = 40) {
  if (!genreIds?.length) return [];
  const exclude = excludeGameIds?.length ? ` & id != (${excludeGameIds.join(',')})` : '';
  const body = `where genres = (${genreIds.join(',')})${exclude}; fields ${GAME_FIELDS}; limit ${Math.min(limit, 100)};`;
  const data = await igdbRequest('games', body);
  return Array.isArray(data) ? data : [];
}

/**
 * @param {number} [limit=40]
 * @returns {Promise<Array>}
 */
export async function getPopularGames(limit = 40) {
  const body = `where aggregated_rating != null & rating_count > 0; fields ${GAME_FIELDS}; sort rating_count desc; limit ${Math.min(limit, 100)};`;
  const data = await igdbRequest('games', body);
  return Array.isArray(data) ? data : [];
}

/**
 * @param {number|string|{image_id?: string}|null|undefined} cover - IGDB cover id or cover object
 * @returns {string|null}
 */
export function coverImageUrl(cover) {
  if (cover == null) return null;
  const id = typeof cover === 'object' && cover?.image_id != null
    ? String(cover.image_id)
    : String(cover);
  if (!id) return null;
  return `https://images.igdb.com/igdb/image/upload/t_cover_big/${id}.png`;
}
