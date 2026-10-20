import { describe, it, expect } from 'vitest';
import { tokenize, countWords } from './tokenizer';

describe('tokenizer', () => {
  it('handles empty text', () => {
    expect(tokenize('')).toEqual([]);
    expect(countWords('')).toBe(0);
  });

  it('tokenizes Russian text', () => {
    const words = tokenize('Это пример текста. Слова сменяются.');
    expect(words.length).toBeGreaterThan(3);
    expect(words[0]).toBe('Это');
  });

  it('normalizes whitespace', () => {
    const words = tokenize('слово   слово\n\nслово');
    expect(words).toEqual(['слово', 'слово', 'слово']);
  });

  it('handles punctuation attached', () => {
    const words = tokenize('Привет, мир! Как дела?');
    expect(words).toContain('Привет,');
    expect(words).toContain('мир!');
  });

  it('handles numbers and abbreviations roughly', () => {
    const words = tokenize('Цена 12.5 руб. т. е. пример.');
    expect(words.length).toBeGreaterThan(2);
  });
});
