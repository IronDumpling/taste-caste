import express from 'express';
import oauth2Router from './routes/oauth2.js';
import gamesRouter from './routes/games.js';

const app = express();
const DEFAULT_PORT = 3002;
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT;

app.use(express.text({ type: '*/*' }));

app.use('/oauth2', oauth2Router);
app.use('/v4', gamesRouter);

function tryListen(port, maxTries = 3) {
  const server = app.listen(port, () => {
    console.log(`Mock IGDB running at http://localhost:${port}`);
    if (port !== PORT) {
      console.log(`(Port ${PORT} was in use; using ${port}. Set backend .env IGDB_BASE_URL and TWITCH_TOKEN_URL to this port if needed.)`);
    }
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < PORT + maxTries) {
      tryListen(port + 1, maxTries - 1);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
}

tryListen(PORT);
