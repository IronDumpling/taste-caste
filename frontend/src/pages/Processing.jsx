import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { submitResult } from '../api/client';

const RESULT_DELAY_MS = 2500;

export default function Processing() {
  const navigate = useNavigate();
  const { selectedGames, answers } = useGame();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedGames.length < 4 || !answers.length) {
      navigate('/game/select');
      return;
    }
    const gameIds = selectedGames.map((g) => g.id);
    submitResult(gameIds, answers)
      .then((data) => {
        setResult(data);
      })
      .catch((err) => setError(err.message));
  }, [selectedGames, answers, navigate]);

  const { setResult: setResultInContext } = useGame();

  useEffect(() => {
    if (!result) return;
    setResultInContext(result);
    const t = setTimeout(() => navigate('/game/result'), RESULT_DELAY_MS);
    return () => clearTimeout(t);
  }, [result, navigate, setResultInContext]);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <motion.div
        className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden mb-6"
        initial={{ opacity: 1 }}
      >
        <motion.div
          className="h-full bg-violet-500 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      </motion.div>
      <motion.p
        className="text-zinc-400 text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        正在解析你的数字灵魂…
      </motion.p>
    </div>
  );
}
