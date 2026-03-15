# Mock IGDB Server

Simulates Twitch OAuth and IGDB API so the backend can run without real credentials.

## Endpoints

- **POST /oauth2/token** — Returns a fake access token (ignores query/body).
- **POST /v4/games** — Returns games from `data/games.json`; optionally filters by `search "q"` or `where id = (1,2,...)` in the request body.

## Setup

```bash
npm install
```

Optional: copy `.env.example` to `.env` and set `PORT` (default 3002).

## Run

```bash
npm run dev
```

Server listens on http://localhost:3002 (or `PORT` from env).

## Backend configuration (no credentials)

In the **backend** `.env`, point the app at this mock server:

```env
IGDB_BASE_URL=http://localhost:3002/v4
TWITCH_TOKEN_URL=http://localhost:3002/oauth2/token
IGDB_CLIENT_ID=mock
IGDB_CLIENT_SECRET=mock
```

Start order: run **mock-igdb** first, then backend, then frontend.

## Switching to real IGDB

When you have Twitch client ID and secret:

1. Stop the mock-igdb server.
2. In backend `.env`, remove or comment out `IGDB_BASE_URL` and `TWITCH_TOKEN_URL` (so the backend uses the default real URLs), and set real values for `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET`.
3. Restart the backend.

No code changes required.
