import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReaderEngine } from '../core/reader-engine/ReaderEngine';
import { getDocument, saveProgress, getProgress, getSettings } from '../services/storage/db';

export default function Reader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const engineRef = useRef<ReaderEngine | null>(null);
  const [text, setText] = useState('Это пример текста для скорочтения. Слова сменяются автоматически с умными паузами.');
  const [currentWord, setCurrentWord] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [fontSize, setFontSize] = useState(48);
  const [progress, setProgress] = useState(0);
  const [smartPauses, setSmartPauses] = useState(true);
  const [loading, setLoading] = useState(!!id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [finished, setFinished] = useState(false);
  const saveTimeoutRef = useRef<number | null>(null);

  const saveCurrentProgress = useCallback(async (index: number) => {
    if (!id) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(async () => {
      await saveProgress({
        documentId: id,
        position: index,
        updatedAt: new Date(),
      });
    }, 800);
  }, [id]);

  useEffect(() => {
    const engine = new ReaderEngine({ smartPauses });
    engineRef.current = engine;

    const init = async () => {
      const settings = await getSettings();
      if (settings) {
        setWpm(settings.wpm);
        setFontSize(settings.fontSize);
        setSmartPauses(settings.smartPauses);
        engine.setWpm(settings.wpm);
        engine.setSmartPauses(settings.smartPauses);
      }

      let initialText = text;
      let startIndex = 0;
      if (id) {
        const doc = await getDocument(id);
        if (doc) initialText = doc.content;
        const saved = await getProgress(id);
        if (saved) startIndex = saved.position;
        setLoading(false);
      }
      setText(initialText);
      engine.setText(initialText);
      if (startIndex > 0) engine.seek(startIndex);
      setTotalWords(engine.totalWords);
      setCurrentIndex(engine.currentIndex);

      engine.onChange((word, index, total) => {
        setCurrentWord(word);
        setCurrentIndex(index);
        setTotalWords(total);
        setProgress(total > 0 ? (index / total) * 100 : 0);
        if (id) saveCurrentProgress(index);
      });
      engine.onComplete(() => {
        setIsPlaying(false);
        setFinished(true);
      });
    };

    init();

    return () => {
      engine.destroy();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [id, saveCurrentProgress]);

  useEffect(() => {
    engineRef.current?.setWpm(wpm);
    engineRef.current?.setSmartPauses(smartPauses);
  }, [wpm, smartPauses]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      const engine = engineRef.current;
      if (!engine) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          toggle();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          engine.prev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          engine.next();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setWpm((w) => Math.min(800, w + 25));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setWpm((w) => Math.max(100, w - 25));
          break;
        case 'Escape':
          if (document.fullscreenElement) document.exitFullscreen();
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isPlaying]);

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
    setCurrentIndex(0);
    setIsPlaying(false);
    setFinished(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  if (finished) {
    return (
      <div className="container" style={{ textAlign: 'center' }}>
        <h2>Чтение завершено</h2>
        <p>Вы дочитали документ до конца.</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button className="primary" onClick={() => {
            setFinished(false);
            engineRef.current?.seek(0);
            setCurrentIndex(0);
            setProgress(0);
            setCurrentWord('');
          }}>Начать заново</button>
          <button className="secondary" onClick={() => navigate(id ? '/library' : '/')}>
            {id ? 'В библиотеку' : 'На главную'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="container">Загрузка документа...</div>;
  }

  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <div className="reader-word" style={{ fontSize: `${fontSize}px` }}>
        {currentWord || 'Вставьте текст и нажмите Старт'}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {currentIndex + 1} / {totalWords} · {Math.round(progress)}%
      </div>
      <div className="progress-bar" style={{ margin: '1rem 0' }}>
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="controls">
        <button onClick={() => engineRef.current?.prev()}>←</button>
        <button className="primary" onClick={toggle}>{isPlaying ? 'Пауза' : 'Старт'}</button>
        <button onClick={() => engineRef.current?.next()}>→</button>
        <button className="secondary" onClick={toggleFullscreen}>Полный экран</button>
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
      {!id && (
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          rows={4}
          style={{ marginTop: '1.5rem' }}
          placeholder="Вставьте или введите текст..."
        />
      )}
      <button className="secondary" style={{ marginTop: '1rem' }} onClick={() => navigate(id ? '/library' : '/')}>
        {id ? 'В библиотеку' : 'Назад'}
      </button>
    </div>
  );
}
