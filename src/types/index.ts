export interface Document {
  id: string;
  title: string;
  content: string;
  format?: string;
  wordCount: number;
  createdAt: Date;
  lastOpenedAt?: Date;
}

export interface ReadingProgress {
  documentId: string;
  position: number;
  updatedAt: Date;
}

export interface ReadingSettings {
  wpm: number;
  fontSize: number;
  theme: 'light' | 'dark';
  smartPauses: boolean;
}
