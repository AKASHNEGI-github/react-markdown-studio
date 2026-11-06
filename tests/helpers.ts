import { markdownToHtml } from "../src/core";
import type { EditorState } from "../src/editor/types";

/** Renders markdown and strips presentation-only noise so assertions stay readable. */
export function render(md: string): string {
  return markdownToHtml(md, { headingIds: false }, { scripts: false })
    .replace(/<div class="rmds-content">|<\/div>$/g, "")
    .replace(/ class="[^"]*"/g, "")
    .replace(/ target="_blank" rel="noopener noreferrer"/g, "")
    .trim();
}

/** Renders a single paragraph and returns only its inner HTML. */
export function inline(md: string): string {
  return render(md)
    .replace(/^<p>/, "")
    .replace(/<\/p>$/, "");
}

/** Builds an editor state; `|` marks a collapsed caret, `[` and `]` mark a selection. */
export function state(marked: string): EditorState {
  const caret = marked.indexOf("|");
  if (caret !== -1) {
    return { value: marked.slice(0, caret) + marked.slice(caret + 1), selection: { start: caret, end: caret } };
  }
  const a = marked.indexOf("[");
  const b = marked.indexOf("]") - 1;
  return { value: marked.replace("[", "").replace("]", ""), selection: { start: a, end: b } };
}

export function elapsed(fn: () => void): number {
  const t = performance.now();
  fn();
  return performance.now() - t;
}
