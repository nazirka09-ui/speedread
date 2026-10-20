import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getDocuments, saveDocument, deleteDocument } from '../services/storage/db';
import { importFile } from '../core/importers';
import type { Document } from '../types';
import { countWords } from '../core/text-processing/tokenizer';

export default function Library() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const list = await getDocuments();
    setDocs(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { text, format } = await importFile(file);
      const doc: Document = {
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^.]+$/, ''),
        content: text,
        format,
        wordCount: countWords(text),
        createdAt: new Date(),
      };
      await saveDocument(doc);
      await load();
    } catch (err: any) {
      alert(err.message || 'Ошибка импорта');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить документ?')) {
      await deleteDocument(id);
      await load();
    }
  };

  return (
    <div className="container">
      <h1>Библиотека</h1>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
        <label className="secondary" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
          Загрузить файл
          <input type="file" accept=".txt,.docx,.pdf,.epub" onChange={handleFile} style={{ display: 'none' }} />
        </label>
        <Link to="/reader"><button className="primary">Новый текст</button></Link>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : docs.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>Библиотека пуста. Загрузите файл или вставьте текст.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {docs.map((doc) => (
            <li key={doc.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: '0.75rem', background: 'var(--surface)' }}>
              <strong>{doc.title}</strong>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.25rem 0' }}>
                {doc.wordCount} слов · {doc.format?.toUpperCase()} · {new Date(doc.createdAt).toLocaleDateString('ru')}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="primary" onClick={() => navigate(`/reader/${doc.id}`)}>Читать</button>
                <button className="secondary" onClick={() => handleDelete(doc.id)}>Удалить</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
