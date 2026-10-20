import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container">
      <h1>SpeedRead</h1>
      <p>Скорочтение методом RSVP — одно слово за раз в фиксированной позиции.</p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <Link to="/reader"><button className="primary">Начать чтение</button></Link>
        <Link to="/library"><button className="secondary">Библиотека</button></Link>
      </div>
      <div style={{ marginTop: '3rem' }}>
        <h2>Как это работает</h2>
        <p>Вставьте текст или загрузите документ (TXT, DOCX, EPUB, PDF). Приложение покажет слова одно за другим с настраиваемой скоростью. Прогресс сохраняется локально.</p>
      </div>
    </div>
  );
}
