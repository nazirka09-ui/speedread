import { useState } from 'react';

export default function Settings() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );
  const [smartPauses, setSmartPauses] = useState(true);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  return (
    <div className="container">
      <h1>Настройки</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
        <button className="secondary" onClick={toggleTheme}>
          Тема: {theme === 'light' ? 'Светлая' : 'Тёмная'}
        </button>
        <label>
          <input
            type="checkbox"
            checked={smartPauses}
            onChange={(e) => setSmartPauses(e.target.checked)}
          />
          {' '}Умные паузы
        </label>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Скорость, размер шрифта и другие параметры будут сохраняться.
        </p>
      </div>
    </div>
  );
}
