/** Pure text statistics for the editor's status bar. No DOM, no React: usable anywhere. */

export interface TextStats {
  words: number;
  characters: number;
  lines: number;
  /** Estimated reading time in whole minutes (0 for an empty document). */
  readingMinutes: number;
}

export interface CaretPosition {
  /** 1-based line number. */
  line: number;
  /** 1-based column. */
  column: number;
}

const WORDS_PER_MINUTE = 200;
/** Above this size we skip Intl.Segmenter (accurate but slower) and count whitespace-separated runs. */
const SEGMENTER_LIMIT = 200_000;

interface WordSegmenter {
  segment(input: string): Iterable<{ isWordLike?: boolean }>;
}
type SegmenterCtor = new (locale?: string | string[], options?: { granularity: "word" }) => WordSegmenter;

/**
 * Counts words. Uses Intl.Segmenter where available, so languages written
 * without spaces (Chinese, Japanese, Thai) count correctly, and falls back to
 * whitespace-separated runs.
 */
export function countWords(text: string): number {
  if (!text.trim()) return 0;
  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterCtor }).Segmenter;
  if (Segmenter && text.length <= SEGMENTER_LIMIT) {
    let count = 0;
    for (const part of new Segmenter(undefined, { granularity: "word" }).segment(text)) {
      if (part.isWordLike) count++;
    }
    return count;
  }
  return text.match(/\S+/g)?.length ?? 0;
}

/** Counts user-perceived characters as Unicode code points (an emoji is 1, not 2). */
function countCharacters(text: string): number {
  if (text.length > SEGMENTER_LIMIT) return text.length;
  let n = 0;
  for (const _ of text) n++;
  return n;
}

export function getTextStats(text: string): TextStats {
  const words = countWords(text);
  return {
    words,
    characters: countCharacters(text),
    lines: text === "" ? 1 : text.split("\n").length,
    readingMinutes: words === 0 ? 0 : Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
  };
}

/** Converts a character offset into a 1-based line/column pair. */
export function getCaretPosition(value: string, offset: number): CaretPosition {
  const clamped = Math.max(0, Math.min(offset, value.length));
  let line = 1;
  let lineStart = 0;
  for (let i = value.indexOf("\n"); i !== -1 && i < clamped; i = value.indexOf("\n", i + 1)) {
    line++;
    lineStart = i + 1;
  }
  return { line, column: clamped - lineStart + 1 };
}
