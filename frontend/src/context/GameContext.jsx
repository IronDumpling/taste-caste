import { createContext, useContext, useState } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [selectedGames, setSelectedGames] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  const addGame = (game) => {
    if (selectedGames.some((g) => g.id === game.id)) return;
    if (selectedGames.length >= 5) return;
    setSelectedGames((prev) => [...prev, game]);
  };

  const removeGame = (id) => {
    setSelectedGames((prev) => prev.filter((g) => g.id !== id));
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
