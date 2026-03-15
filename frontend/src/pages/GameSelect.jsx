import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSearch } from '../hooks/useGameSearch';
import { useGame } from '../context/GameContext';

const MIN_SELECT = 4;
const MAX_SELECT = 5;

export default function GameSelect() {
  const navigate = useNavigate();
  const { selectedGames, addGame, removeGame } = useGame();
  const [query, setQuery] = useState('');
  const { results, loading, error } = useGameSearch(query);

  const canStart = selectedGames.length >= MIN_SELECT && selectedGames.length <= MAX_SELECT;

  const handleStartTest = () => {
    if (!canStart) return;
    navigate('/game/test');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2 text-center">灵魂确立</h1>
        <p className="text-zinc-400 text-sm text-center mb-6">
          搜索并添加 4～5 部「人生神作」
        </p>

        <input
          type="search"
          placeholder="搜索游戏..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        {error && (
          <p className="mt-2 text-red-400 text-sm">搜索失败，请稍后重试</p>
        )}

        {/* Search results */}
        {query.trim() && (
          <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
            {loading && <p className="text-zinc-500 text-sm">搜索中…</p>}
            {!loading && results.length === 0 && (
              <p className="text-zinc-500 text-sm">无结果</p>
            )}
            <AnimatePresence>
              {results.map((game) => {
                const added = selectedGames.some((g) => g.id === game.id);
                const full = selectedGames.length >= MAX_SELECT && !added;
                return (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-center gap-3 p-2 rounded-lg ${full ? 'opacity-50' : 'hover:bg-zinc-800'} cursor-pointer`}
                    onClick={() => !full && addGame(game)}
                  >
                    {game.cover ? (
                      <img
                        src={game.cover}
                        alt=""
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-zinc-700 flex-shrink-0" />
                    )}
                    <span className="flex-1 truncate">{game.name}</span>
                    {added && (
                      <span className="text-violet-400 text-sm">已添加</span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Selected cover wall */}
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-3">已选作品 ({selectedGames.length}/5)</h2>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {selectedGames.map((game) => (
                <motion.div
                  key={game.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  {game.cover ? (
                    <img
                      src={game.cover}
                      alt={game.name}
                      className="w-24 h-24 rounded-lg object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-zinc-700" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeGame(game.id)}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="移除"
                  >
                    ×
                  </button>
                  <p className="mt-1 text-xs text-zinc-400 truncate w-24">{game.name}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          {selectedGames.length > 0 && selectedGames.length < MIN_SELECT && (
            <p className="text-zinc-500 text-sm">再选 {MIN_SELECT - selectedGames.length} 部即可开始</p>
          )}
          <button
            type="button"
            onClick={handleStartTest}
            disabled={!canStart}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              canStart
                ? 'bg-violet-600 hover:bg-violet-500 text-white'
                : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            }`}
          >
            开始测试
          </button>
        </div>
      </div>
    </div>
  );
}
