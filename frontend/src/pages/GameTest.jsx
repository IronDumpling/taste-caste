import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { getTestQuestions } from '../api/client';

export default function GameTest() {
  const navigate = useNavigate();
  const { selectedGames, setAnswersForTest } = useGame();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const games = selectedGames.filter(Boolean);
    if (games.length < 4) {
      navigate('/game/select');
      return;
    }
    const ids = games.map((g) => g.id);
    getTestQuestions(ids)
      .then((data) => {
        setQuestions(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedGames, navigate]);

  const current = questions[currentIndex];
  const isLast = currentIndex >= questions.length - 1;

  const choose = (choice) => {
    const q = questions[currentIndex];
    if (!q) return;
    const newAnswers = [...answers, { questionId: q.questionId, choice }];
    setAnswers(newAnswers);
    if (isLast) {
      setAnswersForTest(newAnswers);
      navigate('/game/processing');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">加载题目中…</p>
      </div>
    );
  }
  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || '暂无题目'}</p>
        <button
          type="button"
          onClick={() => navigate('/game/select')}
          className="text-violet-400 hover:underline"
        >
          返回选择
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex flex-col items-center justify-center">
      <p className="text-zinc-500 text-sm mb-4">
        第 {currentIndex + 1} / {questions.length} 题
      </p>
      <p className="text-zinc-300 text-center mb-6 max-w-md">
        {current?.prompt || '你更偏爱哪一边？'}
      </p>
      <div className="flex flex-wrap justify-center gap-6 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.button
            key={`left-${current?.questionId}`}
            type="button"
            onClick={() => choose('left')}
            className="flex flex-col items-center gap-2 w-40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {current?.left?.cover ? (
              <img
                src={current.left.cover}
                alt=""
                className="w-full aspect-3/4 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="w-full aspect-3/4 rounded-lg bg-zinc-700" />
            )}
            <span className="text-sm font-medium truncate w-full text-center">
              {current?.left?.name || 'A'}
            </span>
          </motion.button>
          <span className="self-center text-zinc-500">VS</span>
          <motion.button
            key={`right-${current?.questionId}`}
            type="button"
            onClick={() => choose('right')}
            className="flex flex-col items-center gap-2 w-40"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {current?.right?.cover ? (
              <img
                src={current.right.cover}
                alt=""
                className="w-full aspect-3/4 rounded-lg object-cover shadow-lg"
              />
            ) : (
              <div className="w-full aspect-3/4 rounded-lg bg-zinc-700" />
            )}
            <span className="text-sm font-medium truncate w-full text-center">
              {current?.right?.name || 'B'}
            </span>
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  );
}
