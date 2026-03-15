import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import GameSelect from './pages/GameSelect';
import GameTest from './pages/GameTest';
import Processing from './pages/Processing';
import GameResult from './pages/GameResult';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/game/select" element={<GameSelect />} />
      <Route path="/game/test" element={<GameTest />} />
      <Route path="/game/processing" element={<Processing />} />
      <Route path="/game/result" element={<GameResult />} />
    </Routes>
  );
}
