# SpeedRead

Веб-приложение для скорочтения методом RSVP (Rapid Serial Visual Presentation).

Одно слово за раз в фиксированной позиции. Скорость 100–800 слов/мин, умные паузы, локальное хранение прогресса.

## Возможности

- Вставка текста и загрузка файлов: TXT, DOCX, EPUB, PDF
- Библиотека документов в IndexedDB
- Сохранение прогресса чтения
- Светлая / тёмная тема
- Клавиатурное управление (Пробел, стрелки, Escape)
- Полноэкранный режим
- PWA (manifest + service worker)
- GitHub Actions для публикации на GitHub Pages

## Запуск локально

```bash
git clone https://github.com/nazirka09-ui/speedread.git
cd speedread
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run test:run
```

## Публикация на GitHub Pages

1. В настройках репозитория включите **Pages** → Source: **GitHub Actions**.
2. При пуше в `main` workflow автоматически соберёт и задеплоит сайт.
3. Сайт будет доступен по адресу:  
   `https://nazirka09-ui.github.io/speedread/`

## Стек

- React 19 + TypeScript + Vite
- IndexedDB (`idb`)
- PDF.js, Mammoth.js, JSZip
- Vitest
