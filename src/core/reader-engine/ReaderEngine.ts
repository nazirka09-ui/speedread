import { tokenize } from '../text-processing/tokenizer';

export interface EngineOptions {
  smartPauses?: boolean;
}

export class ReaderEngine {
  private words: string[] = [];
  private position = 0;
  private isPlaying = false;
  private wpm = 300;
  private smartPauses = true;
  private timer: number | null = null;
  private onWordChange?: (word: string, index: number, total: number) => void;
  private onEnd?: () => void;

  constructor(options: EngineOptions = {}) {
    this.smartPauses = options.smartPauses ?? true;
  }

  setText(text: string) {
    this.words = tokenize(text);
    this.position = 0;
    this.pause();
  }

  setWpm(wpm: number) {
    this.wpm = Math.max(100, Math.min(800, Math.round(wpm)));
  }

  setSmartPauses(enabled: boolean) {
    this.smartPauses = enabled;
  }

  play() {
    if (this.isPlaying || this.position >= this.words.length) return;
    this.isPlaying = true;
    this.scheduleNext();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  next() {
    if (this.position < this.words.length - 1) {
      this.position++;
      this.emit();
    }
  }

  prev() {
    if (this.position > 0) {
      this.position--;
      this.emit();
    }
  }

  seek(index: number) {
    this.position = Math.max(0, Math.min(this.words.length - 1, Math.floor(index)));
    this.emit();
  }

  private getDelay(word: string): number {
    let base = 60000 / this.wpm;
    if (!this.smartPauses) return base;

    if (word.length > 12) base *= 1.15;
    if (/[,;:]/.test(word)) base *= 1.2;
    if (/[.!?]$/.test(word)) base *= 1.5;
    if (word.endsWith('\n') || word.includes('\n')) base *= 1.3;
    return base;
  }

  private scheduleNext() {
    if (!this.isPlaying || this.position >= this.words.length) {
      this.pause();
      if (this.position >= this.words.length && this.onEnd) this.onEnd();
      return;
    }

    const word = this.words[this.position];
    const delay = this.getDelay(word);

    this.timer = window.setTimeout(() => {
      this.position++;
      this.emit();
      this.scheduleNext();
    }, delay);
  }

  private emit() {
    if (this.onWordChange && this.position < this.words.length) {
      this.onWordChange(this.words[this.position], this.position, this.words.length);
    }
  }

  onChange(cb: (word: string, index: number, total: number) => void) {
    this.onWordChange = cb;
  }

  onComplete(cb: () => void) {
    this.onEnd = cb;
  }

  get currentWord(): string {
    return this.words[this.position] ?? '';
  }

  get totalWords(): number {
    return this.words.length;
  }

  get currentIndex(): number {
    return this.position;
  }

  get progress(): number {
    return this.totalWords > 0 ? (this.position / this.totalWords) * 100 : 0;
  }

  destroy() {
    this.pause();
  }
}
