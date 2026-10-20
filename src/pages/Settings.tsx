import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/storage/db';
import type { ReadingSettings } from '../types';

const defaultSettings: ReadingSettings = {
  wpm: 300,
  fontSize: 48,
  theme: 'light',
  smartPauses: true,
};

export default function Settings() {
  const [settings, setSettings] = useState<ReadingSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSettings().then((saved) => {
      if (saved) {
        setSettings(saved);
        document.documentElement.setAttribute('data-theme', saved.theme);
      }
      setLoaded(true);
    });
  }, []);

  const update = async (partial: Partial<ReadingSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    await saveSettings(next);
    if (partial.theme) {
      document.documentElement.setAttribute('data-theme', partial.theme);
      localStorage.setItem('theme', partial.theme);
    }
  };

  if (!loaded) return <div className="container">Загрузка настроек...</div>;

  return (
    <div className="container">
      <h1>Настройки</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: 420 }}>
        <div>
          <label>Тема</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              className={settings.theme === 'light' ? 'primary' : 'secondary'}
              onClick={() => update({ theme: 'light' })}
            >
              Светлая
            </button>
            <button
              className={settings.theme === 'dark' ? 'primary' : 'secondary'}
              onClick={() => update({ theme: 'dark' })}
            >
              Тёмная
            </button>
          </div>
        </div>

        <div>
          <label>Скорость по умолчанию: {settings.wpm} слов/мин</label>
          <input
            type="range"
            min={100}
            max={800}
            step={25}
            value={settings.wpm}
            onChange={(e) => update({ wpm: Number(e.target.value) })}
          />
        </div>

        <div>
          <label>Размер шрифта: {settings.fontSize}px</label>
          <input
            type="range"
            min={24}
            max={72}
            step={2}
            value={settings.fontSize}
            onChange={(e) => update({ fontSize: Number(e.target.value) })}
          />
        </div>

        <label>
          <input
            type="checkbox"
            checked={settings.smartPauses}
            onChange={(e) => update({ smartPauses: e.target.checked })}
          />
          {' '}Умные паузы
        </label>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Настройки сохраняются локально в браузере.
        </p>
      </div>
    </div>
  );
}
