import { tokenize } from '../text-processing/tokenizer';

export class ReaderEngine {
  private words: string[] = [];
  private position = 0;
  private isPlaying = false;
  private wpm = 300;
  private timer: number | null = null;
  private onWordChange?: (word: string, index: number) => void;

  setText(text: string) {
    this.words = tokenize(text);
    this.position = 0;
  }

  setWpm(wpm: number) {
    this.wpm = Math.max(100, Math.min(800, wpm));
  }

  play() {
    if (this.isPlaying || this.position >= this.words.length) return;
    this.isPlaying = true;
    this.scheduleNext();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
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
    this.position = Math.max(0, Math.min(this.words.length - 1, index));
    this.emit();
  }

  private scheduleNext() {
    if (!this.isPlaying || this.position >= this.words.length) {
      this.pause();
      return;
    }
    const interval = 60000 / this.wpm;
    this.timer = window.setTimeout(() => {
      this.position++;
      this.emit();
      this.scheduleNext();
    }, interval);
  }

  private emit() {
    if (this.onWordChange && this.words[this.position]) {
      this.onWordChange(this.words[this.position], this.position);
    }
  }

  onChange(cb: (word: string, index: number) => void) {
    this.onWordChange = cb;
  }

  get currentWord() {
    return this.words[this.position] || '';
  }

  get totalWords() {
    return this.words.length;
  }

  get progress() {
    return this.totalWords ? (this.position / this.totalWords) * 100 : 0;
  }
}
