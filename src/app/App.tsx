import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from '../pages/Home';
import Library from '../pages/Library';
import Reader from '../pages/Reader';
import Settings from '../pages/Settings';
import '../styles/global.css';

export default function App() {
  return (
    <BrowserRouter basename="/speedread">
      <nav style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
        <Link to="/">Главная</Link>
        <Link to="/library">Библиотека</Link>
        <Link to="/settings">Настройки</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/reader/:id?" element={<Reader />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
