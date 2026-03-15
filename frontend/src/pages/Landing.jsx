import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        TasteCaste
      </motion.h1>
      <motion.p
        className="text-zinc-400 text-center mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        赛博种姓 · 鉴定你的数字灵魂
      </motion.p>
      <motion.div
        className="flex flex-wrap justify-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Link
          to="/game/select"
          className="px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-lg transition-colors"
        >
          游戏
        </Link>
        <button
          type="button"
          className="px-8 py-4 rounded-xl bg-zinc-700 text-zinc-500 cursor-not-allowed"
          disabled
        >
          电影
        </button>
        <button
          type="button"
          className="px-8 py-4 rounded-xl bg-zinc-700 text-zinc-500 cursor-not-allowed"
          disabled
        >
          动漫
        </button>
      </motion.div>
    </div>
  );
}
