import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

let gamesCache = null;
function getGames() {
  if (gamesCache) return gamesCache;
  const path = join(__dirname, '../../data/games.json');
  const raw = readFileSync(path, 'utf-8');
  gamesCache = JSON.parse(raw);
  return gamesCache;
}

router.post('/games', (req, res) => {
  const body = (req.body || '').toString();
  let list = getGames();

  const searchMatch = body.match(/search\s*"\s*([^"]*)\s*"/);
  if (searchMatch) {
    const q = searchMatch[1].toLowerCase().trim();
    if (q) {
      list = list.filter((g) => g.name && g.name.toLowerCase().includes(q));
    }
  }

  const whereIdMatch = body.match(/where\s+id\s*=\s*\(\s*([^)]+)\s*\)/);
  if (whereIdMatch) {
    const ids = whereIdMatch[1].split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
    if (ids.length > 0) {
      const idSet = new Set(ids);
      list = list.filter((g) => idSet.has(g.id));
    }
  }

  const limitMatch = body.match(/limit\s+(\d+)/);
  const limit = limitMatch ? Math.min(parseInt(limitMatch[1], 10) || 20, 100) : 20;
  list = list.slice(0, limit);

  res.json(list);
});

export default router;
