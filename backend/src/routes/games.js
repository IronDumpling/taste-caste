import { Router } from 'express';
import { searchGames, coverImageUrl } from '../services/igdb-client.js';
import { aggregateScoreForWork } from '../services/score-aggregator.js';

const router = Router();

/**
 * GET /api/games/search?q=xxx
 * Proxies IGDB search, adds (p,c) from score-aggregator.
 */
router.get('/search', async (req, res) => {
  const q = req.query.q?.trim();
  if (!q) {
    return res.json([]);
  }
  try {
    const games = await searchGames(q, 20);
    const results = games.map((g) => {
      const rawScoresBySource = {
        igdb: {
          aggregated_rating: g.aggregated_rating ?? null,
          rating_count: g.rating_count ?? null,
        },
      };
      const { popularity: p, critic: c } = aggregateScoreForWork(rawScoresBySource);
      return {
        id: g.id,
        name: g.name,
        cover: g.cover ? coverImageUrl(g.cover) : null,
        genres: g.genres || [],
        aggregated_rating: g.aggregated_rating,
        rating_count: g.rating_count,
        popularity: Math.round(p * 10) / 10,
        critic: Math.round(c * 10) / 10,
      };
    });
    res.json(results);
  } catch (err) {
    console.error('games search error', err);
    if (err.message?.includes('IGDB_CLIENT')) {
      return res.status(500).json({ error: 'IGDB not configured' });
    }
    res.status(502).json({ error: err.message || 'Search failed' });
  }
});

export default router;
