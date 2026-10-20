import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Document, ReadingProgress, ReadingSettings } from '../../types';

interface SpeedReadDB extends DBSchema {
  documents: {
    key: string;
    value: Document;
    indexes: { 'by-date': Date };
  };
  progress: {
    key: string;
    value: ReadingProgress;
  };
  settings: {
    key: string;
    value: ReadingSettings;
  };
}

let dbPromise: Promise<IDBPDatabase<SpeedReadDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<SpeedReadDB>('speedread-db', 1, {
      upgrade(db) {
        const docs = db.createObjectStore('documents', { keyPath: 'id' });
        docs.createIndex('by-date', 'createdAt');
        db.createObjectStore('progress', { keyPath: 'documentId' });
        db.createObjectStore('settings');
      },
    });
  }
  return dbPromise;
}

export async function saveDocument(doc: Document) {
  const db = await getDB();
  await db.put('documents', doc);
}

export async function getDocuments(): Promise<Document[]> {
  const db = await getDB();
  return db.getAll('documents');
}

export async function getDocument(id: string): Promise<Document | undefined> {
  const db = await getDB();
  return db.get('documents', id);
}

export async function deleteDocument(id: string) {
  const db = await getDB();
  await db.delete('documents', id);
  await db.delete('progress', id);
}

export async function saveProgress(progress: ReadingProgress) {
  const db = await getDB();
  await db.put('progress', progress);
}

export async function getProgress(documentId: string): Promise<ReadingProgress | undefined> {
  const db = await getDB();
  return db.get('progress', documentId);
}

export async function saveSettings(settings: ReadingSettings) {
  const db = await getDB();
  await db.put('settings', settings, 'user');
}

export async function getSettings(): Promise<ReadingSettings | undefined> {
  const db = await getDB();
  return db.get('settings', 'user');
}
