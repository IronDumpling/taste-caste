import { Router } from 'express';
import { getGamesByIds, coverImageUrl } from '../services/igdb-client.js';
import { aggregateScoreForWork } from '../services/score-aggregator.js';
import { computeResult } from '../services/scoring-engine.js';

const router = Router();
const NUM_QUESTIONS = 4;

/**
 * Generate test questions from selected game IDs (deterministic: same ids -> same questions).
 * Used by both test-questions and result.
 */
async function generateQuestions(gameIds) {
  if (!gameIds?.length) return [];
  const games = await getGamesByIds(gameIds);
  const genreIds = [...new Set(games.flatMap((g) => g.genres || []))];
  const excludeIds = new Set(gameIds);

  let pool = [];
  if (genreIds.length > 0) {
    const body = [
      `where genres = (${genreIds.join(',')}) & id != (${gameIds.join(',')});`,
      'fields name,cover,genres,aggregated_rating,rating_count;',
      'limit 30;',
    ].join('\n');
    const { default: igdbRequest } = await import('../services/igdb-client.js');
    const igdb = await import('../services/igdb-client.js');
    const raw = await igdb.getGamesByIds ? await igdb.getGamesByIds(genreIds.slice(0, 5).map((_, i) => genreIds[i])) : [];
    const { getGamesByIds: getByGenre } = await import('../services/igdb-client.js');
    const genreGames = await getByGenre(genreIds.slice(0, 10));
    pool = genreGames.filter((g) => !excludeIds.has(g.id));
  }

  if (pool.length < 2) {
    const all = await getGamesByIds([]);
    const body = 'where aggregated_rating != null; fields name,cover,genres,aggregated_rating,rating_count; limit 30;';
    const { igdbRequest } = await import('../services/igdb-client.js');
    const igdb = await import('../services/igdb-client.js');
    const res = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${await (await import('../services/igdb-client.js')).getAccessToken?.()}`,
        'Content-Type': 'text/plain',
      },
      body: 'where aggregated_rating != null; fields name,cover,genres,aggregated_rating,rating_count; limit 30;',
    });
    const data = res.ok ? await res.json() : [];
    pool = (Array.isArray(data) ? data : []).filter((g) => !excludeIds.has(g.id));
  }

  const { getGamesByIds: fetchPool } = await import('../services/igdb-client.js');
  const poolGames = await fetchPool(genreIds);
  const filtered = (Array.isArray(poolGames) ? poolGames : []).filter((g) => !excludeIds.has(g.id));
  if (filtered.length < 2) {
    const fallbackBody = 'where rating_count > 0; fields name,cover,genres,aggregated_rating,rating_count; limit 40;';
    const { default: igdb } = await import('../services/igdb-client.js');
    const mod = await import('../services/igdb-client.js');
    const req = mod.igdbRequest || (async () => []);
    const fallback = await (async () => {
      try {
        const fn = mod.igdbRequest;
        if (typeof fn !== 'function') return [];
        return await fn('games', fallbackBody);
      } catch {
        return [];
      }
    })();
    pool = Array.isArray(fallback) ? fallback.filter((g) => !excludeIds.has(g?.id)) : [];
  } else {
    pool = filtered;
  }

  const withScores = pool.map((g) => {
    const raw = { igdb: { aggregated_rating: g.aggregated_rating, rating_count: g.rating_count } };
    const { popularity: p, critic: c } = aggregateScoreForWork(raw);
    return {
      id: g.id,
      name: g.name,
      cover: coverImageUrl(g.cover),
      p: Math.round(p * 10) / 10,
      c: Math.round(c * 10) / 10,
    };
  });

  const questions = [];
  const used = new Set();
  for (let i = 0; i < NUM_QUESTIONS && withScores.length >= 2; i++) {
    const available = withScores.filter((x) => !used.has(x.id));
    if (available.length < 2) break;
    const shuffle = [...available].sort(() => Math.random() - 0.5);
    const left = shuffle[0];
    const right = shuffle[1];
    used.add(left.id);
    used.add(right.id);
    questions.push({
      questionId: `q-${gameIds.join('-')}-${i}`,
      prompt: '你更偏爱哪一边？',
      left: { id: left.id, name: left.name, cover: left.cover, p: left.p, c: left.c },
      right: { id: right.id, name: right.name, cover: right.cover, p: right.p, c: right.c },
    });
  }
  return questions;
}

I'll simplify: add a dedicated function in igdb-client to fetch games by genre (or a simple "get some games" for pool), then a shared module that builds questions so both routes use it.
</think>
Adding a genre-query helper and a shared question generator.
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace