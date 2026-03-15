import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useGame } from '../context/GameContext';

const CASTE_LABELS = {
  brahmin: '赛博婆罗门',
  kshatriya: '硬核刹帝利',
  vaishya: '消费吠舍',
  shudra: '快乐首陀罗',
};

export default function GameResult() {
  const navigate = useNavigate();
  const { clearAnswers, lastResult } = useGame();
  const result = lastResult;

  if (!result) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">未找到结果</p>
        <button
          type="button"
          onClick={() => navigate('/game/select')}
          className="text-violet-400 hover:underline"
        >
          重新测试
        </button>
      </div>
    );
  }

  const title = CASTE_LABELS[result.caste] || result.title || result.caste;
  const sentences = result.sentences || [];
  const percentile = result.percentile ?? 50;
  const cardRef = useRef(null);

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#18181b',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `tastecaste-${result.caste}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestart = () => {
    clearAnswers();
    navigate('/game/select');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex flex-col items-center">
      <motion.div
        ref={cardRef}
        className="max-w-lg w-full rounded-2xl bg-zinc-900 border border-zinc-700 p-8 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-violet-400 text-center mb-4">
          {title}
        </h1>
        <div className="space-y-3 text-zinc-300 text-center">
          {sentences.map((s, i) => (
            <p key={i}>{s}</p>
          ))}
        </div>
        <p className="mt-6 text-center text-zinc-500 text-sm">
          战胜了全网 {percentile}% 的用户
        </p>
      </motion.div>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={handleSaveImage}
          className="px-6 py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-medium"
        >
          保存图片
        </button>
        <button
          type="button"
          onClick={handleRestart}
          className="px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium"
        >
          再测一次
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="px-6 py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
