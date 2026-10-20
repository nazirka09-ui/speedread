/**
 * Improved tokenizer that preserves punctuation and handles common cases.
 */
export function tokenize(text: string): string[] {
  if (!text || !text.trim()) return [];

  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const tokens = normalized.split(/\s+/).filter(Boolean);

  return tokens;
}

export function countWords(text: string): number {
  return tokenize(text).length;
}

export function estimateDuration(words: string[], wpm: number, smartPauses: boolean): number {
  if (!smartPauses) return (words.length * 60000) / wpm;
  let total = 0;
  for (const word of words) {
    let mult = 1;
    if (word.length > 12) mult += 0.2;
    if (/[,;:]/.test(word)) mult += 0.15;
    if (/[.!?]$/.test(word)) mult += 0.4;
    total += (60000 / wpm) * mult;
  }
  return total;
}
