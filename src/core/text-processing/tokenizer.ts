/**
 * Simple tokenizer for RSVP.
 * Handles basic punctuation and whitespace.
 */
export function tokenize(text: string): string[] {
  if (!text || !text.trim()) return [];
  // Normalize whitespace and split, keeping punctuation attached for now
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export function countWords(text: string): number {
  return tokenize(text).length;
}
