const API_BASE = '/api';

export async function searchGames(q) {
  if (!q?.trim()) return [];
  const res = await fetch(`${API_BASE}/games/search?q=${encodeURIComponent(q.trim())}`);
  if (!res.ok) throw new Error(res.statusText || 'Search failed');
  return res.json();
}

export async function getTestQuestions(gameIds) {
  const params = new URLSearchParams({ gameIds: gameIds.join(',') });
  const res = await fetch(`${API_BASE}/game/test-questions?${params}`);
  if (!res.ok) throw new Error(res.statusText || 'Failed to load questions');
  return res.json();
}

export async function submitResult(gameIds, answers) {
  const res = await fetch(`${API_BASE}/game/result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameIds, answers }),
  });
  if (!res.ok) throw new Error(res.statusText || 'Failed to get result');
  return res.json();
}
