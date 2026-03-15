import { createContext, useContext, useState } from 'react';

const SLOT_COUNT = 4;

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [selectedGames, setSelectedGames] = useState(() => Array(SLOT_COUNT).fill(null));
  const [answers, setAnswers] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  const setGameAtSlot = (slotIndex, game) => {
    if (slotIndex < 0 || slotIndex >= SLOT_COUNT) return;
    setSelectedGames((prev) => {
      const next = [...prev];
      next[slotIndex] = game;
      return next;
    });
  };

  const removeGameAtSlot = (slotIndex) => {
    if (slotIndex < 0 || slotIndex >= SLOT_COUNT) return;
    setSelectedGames((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const addGame = (game) => {
    const current = selectedGames.filter(Boolean);
    if (current.some((g) => g.id === game.id)) return;
    if (current.length >= SLOT_COUNT) return;
    const emptyIndex = selectedGames.findIndex((g) => !g);
    if (emptyIndex !== -1) setGameAtSlot(emptyIndex, game);
  };

  const removeGame = (id) => {
    setSelectedGames((prev) => prev.map((g) => (g?.id === id ? null : g)));
  };

  const setAnswersForTest = (list) => setAnswers(list);
  const setResult = (data) => setLastResult(data);
  const clearAnswers = () => {
    setAnswers([]);
    setLastResult(null);
  };

  return (
    <GameContext.Provider
      value={{
        selectedGames,
        setGameAtSlot,
        removeGameAtSlot,
        addGame,
        removeGame,
        answers,
        setAnswersForTest,
        setResult,
        lastResult,
        clearAnswers,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
