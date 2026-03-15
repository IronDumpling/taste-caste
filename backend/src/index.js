import express from 'express';
import cors from 'cors';
import gamesRouter from './routes/games.js';
import gameResultRouter from './routes/game-result.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/games', gamesRouter);
app.use('/api/game', gameResultRouter);

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
