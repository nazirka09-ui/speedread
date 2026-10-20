import { useState } from 'react';
import { ReaderEngine } from './core/reader-engine/ReaderEngine';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [engine] = useState(() => new ReaderEngine());
  const [currentWord, setCurrentWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);

  const startReading = () => {
    if (!text.trim()) return;
    engine.setText(text);
    engine.setWpm(wpm);
    engine.onChange((word) => setCurrentWord(word));
    engine.play();
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      engine.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="app">
      <h1>SpeedRead</h1>
      <p>Скорочтение методом RSVP</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Вставьте текст для чтения..."
        rows={6}
        style={{ width: '100%', maxWidth: 600 }}
      />

      <div style={{ margin: '1rem 0' }}>
        <label>
          Скорость: {wpm} слов/мин
          <input
            type="range"
            min={100}
            max={800}
            step={25}
            value={wpm}
            onChange={(e) => {
              const v = Number(e.target.value);
              setWpm(v);
              engine.setWpm(v);
            }}
          />
        </label>
      </div>

      <button onClick={startReading}>Начать чтение</button>
      <button onClick={togglePlay}>{isPlaying ? 'Пауза' : 'Продолжить'}</button>
      <button onClick={() => engine.prev()}>←</button>
      <button onClick={() => engine.next()}>→</button>

      <div className="reader" style={{ fontSize: '2.5rem', margin: '2rem 0', minHeight: '4rem', textAlign: 'center' }}>
        {currentWord || 'Готово к чтению'}
      </div>
    </div>
  );
}

export default App;
