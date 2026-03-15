import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameSearch } from '../hooks/useGameSearch';
import { useGame } from '../context/GameContext';
import SelectCard from '../components/SelectCard';

const SLOT_COUNT = 4;

export default function GameSelect() {
  const navigate = useNavigate();
  const { selectedGames, setGameAtSlot, removeGameAtSlot } = useGame();
  const [activeSlot, setActiveSlot] = useState(null);
  const [query, setQuery] = useState('');
  const { results, loading, error } = useGameSearch(activeSlot !== null ? query : '');

  const filledCount = selectedGames.filter(Boolean).length;
  const canStart = filledCount === SLOT_COUNT;

  const handleStartTest = () => {
    if (!canStart) return;
    navigate('/game/test');
  };

  const handleSelectResult = (game) => {
    if (activeSlot === null) return;
    setGameAtSlot(activeSlot, game);
    setActiveSlot(null);
    setQuery('');
  };

  const handleClearSlot = (slotIndex) => {
    removeGameAtSlot(slotIndex);
    if (activeSlot === slotIndex) {
      setActiveSlot(null);
      setQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2 text-center">灵魂确立</h1>
        <p className="text-zinc-400 text-sm text-center mb-6">
          点击卡片搜索并选择 4 部你最喜欢的游戏
        </p>

        {/* 2×2 卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
          {Array.from({ length: SLOT_COUNT }, (_, i) => (
            <SelectCard
              key={i}
              item={selectedGames[i]}
              titleLabel="游戏"
              onSelect={() => setActiveSlot(i)}
              onClear={selectedGames[i] ? () => handleClearSlot(i) : undefined}
            />
          ))}
        </div>

        {/* 当前卡片的搜索面板 */}
        <AnimatePresence>
          {activeSlot !== null && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl bg-zinc-900 border border-zinc-700 p-4 mb-6"
            >
              <p className="text-zinc-400 text-sm mb-3">为第 {activeSlot + 1} 张卡片搜索游戏</p>
              <input
                type="search"
                placeholder="搜索游戏..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-600 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {error && (
                <p className="mt-2 text-red-400 text-sm">搜索失败，请稍后重试</p>
              )}
              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
                {loading && <p className="text-zinc-500 text-sm">搜索中…</p>}
                {!loading && query.trim() && results.length === 0 && (
                  <p className="text-zinc-500 text-sm">无结果</p>
                )}
                {!loading &&
                  results.map((game) => (
                    <motion.div
                      key={game.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 cursor-pointer"
                      onClick={() => handleSelectResult(game)}
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
                    </motion.div>
                  ))}
              </div>
              <button
                type="button"
                onClick={() => { setActiveSlot(null); setQuery(''); }}
                className="mt-3 text-zinc-400 text-sm hover:text-zinc-200"
              >
                取消
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-2">
          {filledCount > 0 && filledCount < SLOT_COUNT && (
            <p className="text-zinc-500 text-sm">再选 {SLOT_COUNT - filledCount} 部即可开始</p>
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
