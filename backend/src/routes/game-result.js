import { Router } from 'express';
import { getGamesByIds, getGamesByGenres, getPopularGames, coverImageUrl } from '../services/igdb-client.js';
import { aggregateScoreForWork } from '../services/score-aggregator.js';
import { computeResult } from '../services/scoring-engine.js';

const router = Router();
const NUM_QUESTIONS = 4;

/**
 * Generate test questions from selected game IDs. Deterministic for same input order.
 */
async function generateQuestions(gameIds) {
  if (!gameIds?.length) return [];
  const selected = await getGamesByIds(gameIds);
  const genreIds = [...new Set(selected.flatMap((g) => g.genres || []).filter(Boolean))];
  let pool = [];
  if (genreIds.length > 0) {
    pool = await getGamesByGenres(genreIds, gameIds, 40);
  }
  if (pool.length < 2) {
    const popular = await getPopularGames(40);
    pool = popular.filter((g) => !gameIds.includes(g.id));
  }
  pool.sort((a, b) => (a.id - b.id));
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
  for (let i = 0; i < NUM_QUESTIONS; i++) {
    const available = withScores.filter((x) => !used.has(x.id));
    if (available.length < 2) break;
    const [a, b] = available.slice(0, 2);
    used.add(a.id);
    used.add(b.id);
    questions.push({
      questionId: `q-${gameIds.join('-')}-${i}`,
      prompt: '你更偏爱哪一边？',
      left: { id: a.id, name: a.name, cover: a.cover, p: a.p, c: a.c },
      right: { id: b.id, name: b.name, cover: b.cover, p: b.p, c: b.c },
    });
  }
  return questions;
}

/** GET /api/game/test-questions?gameIds=1,2,3,4 */
router.get('/test-questions', async (req, res) => {
  const raw = req.query.gameIds;
  const gameIds = raw ? raw.split(',').map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n)) : [];
  if (gameIds.length < 4) {
    return res.status(400).json({ error: 'Need at least 4 game IDs' });
  }
  try {
    const questions = await generateQuestions(gameIds);
    res.json(questions);
  } catch (err) {
    console.error('test-questions error', err);
    res.status(502).json({ error: err.message || 'Failed to generate questions' });
  }
});

/** POST /api/game/result  body: { gameIds: number[], answers: { questionId, choice }[] } */
router.post('/result', async (req, res) => {
  const { gameIds = [], answers = [] } = req.body;
  if (gameIds.length < 4) {
    return res.status(400).json({ error: 'Need at least 4 game IDs' });
  }
  try {
    const games = await getGamesByIds(gameIds);
    const gameNames = games.map((g) => g.name).filter(Boolean);
    const selectionScores = games.map((g) => {
      const raw = { igdb: { aggregated_rating: g.aggregated_rating, rating_count: g.rating_count } };
      return aggregateScoreForWork(raw);
    });
    const questions = await generateQuestions(gameIds);
    const questionsForEngine = questions.map((q) => ({
      questionId: q.questionId,
      left: { p: q.left.p, c: q.left.c },
      right: { p: q.right.p, c: q.right.c },
    }));
    const result = computeResult(selectionScores, answers, questionsForEngine, gameNames, 'default');
    res.json(result);
  } catch (err) {
    console.error('result error', err);
    res.status(502).json({ error: err.message || 'Failed to compute result' });
  }
});

export default router;
