import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { searchGames } from '../api/client';

/**
 * @param {string} query - raw input
 * @returns {{ results: Array, loading: boolean, error: Error | null }}
 */
export function useGameSearch(query) {
  const debounced = useDebounce(query, 350);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    searchGames(debounced)
      .then((data) => {
        if (!cancelled) setResults(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [debounced]);

  return { results, loading, error };
}
