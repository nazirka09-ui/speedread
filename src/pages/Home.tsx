import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container">
      <h1>SpeedRead</h1>
      <p style={{ fontSize: '1.15rem', maxWidth: 560 }}>
        Скорочтение методом RSVP — одно слово за раз в фиксированной позиции экрана.
        Читайте быстрее без движения глаз по строкам.
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        <Link to="/reader"><button className="primary">Начать чтение</button></Link>
        <Link to="/library"><button className="secondary">Библиотека</button></Link>
      </div>
      <div style={{ marginTop: '3rem' }}>
        <h2>Как это работает</h2>
        <ul style={{ lineHeight: 1.7 }}>
          <li>Вставьте текст или загрузите файл (TXT, DOCX, EPUB, PDF)</li>
          <li>Запустите чтение и регулируйте скорость (100–800 слов/мин)</li>
          <li>Используйте пробел и стрелки на клавиатуре</li>
          <li>Прогресс сохраняется локально — продолжайте с того же места</li>
        </ul>
      </div>
    </div>
  );
}
