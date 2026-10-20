import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReaderEngine } from '../core/reader-engine/ReaderEngine';
import { getDocument } from '../services/storage/db';

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const engineRef = useRef<ReaderEngine | null>(null);
  const [text, setText] = useState('Это пример текста для скорочтения. Слова сменяются автоматически с умными паузами.');
  const [currentWord, setCurrentWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [progress, setProgress] = useState(0);
  const [smartPauses, setSmartPauses] = useState(true);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    const engine = new ReaderEngine({ smartPauses });
    engineRef.current = engine;

    const init = async () => {
      let initialText = text;
      if (id) {
        const doc = await getDocument(id);
        if (doc) initialText = doc.content;
        setLoading(false);
      }
      setText(initialText);
      engine.setText(initialText);
      engine.setWpm(wpm);
      engine.onChange((word, index, total) => {
        setCurrentWord(word);
        setProgress(total > 0 ? (index / total) * 100 : 0);
      });
      engine.onComplete(() => setIsPlaying(false));
    };

    init();

    return () => engine.destroy();
  }, [id]);

  useEffect(() => {
    engineRef.current?.setWpm(wpm);
    engineRef.current?.setSmartPauses(smartPauses);
  }, [wpm, smartPauses]);

  const toggle = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isPlaying) {
      engine.pause();
      setIsPlaying(false);
    } else {
      engine.play();
      setIsPlaying(true);
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    engineRef.current?.setText(newText);
    setCurrentWord('');
    setProgress(0);
    setIsPlaying(false);
  };

  if (loading) {
    return <div className="container">Загрузка документа...</div>;
  }

  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <div className="reader-word">{currentWord || 'Вставьте текст и нажмите Старт'}</div>
      <div className="progress-bar" style={{ margin: '1.5rem 0' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="controls">
        <button onClick={() => engineRef.current?.prev()}>←</button>
        <button className="primary" onClick={toggle}>{isPlaying ? 'Пауза' : 'Старт'}</button>
        <button onClick={() => engineRef.current?.next()}>→</button>
      </div>
      <div style={{ marginTop: '1.5rem', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
        <label>Скорость: {wpm} слов/мин</label>
        <input
          type="range"
          min={100}
          max={800}
          step={25}
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
        />
        <label style={{ display: 'block', marginTop: '0.5rem' }}>
          <input type="checkbox" checked={smartPauses} onChange={(e) => setSmartPauses(e.target.checked)} />
          {' '}Умные паузы
        </label>
      </div>
      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        rows={4}
        style={{ marginTop: '1.5rem' }}
        placeholder="Вставьте или введите текст..."
      />
      <button className="secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/')}>
        Назад
      </button>
    </div>
  );
}
