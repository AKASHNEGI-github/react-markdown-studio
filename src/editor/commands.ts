import type { EditorState } from "./types";
import { expandToLines, getSelectedText, lineBoundsAt, replaceRange } from "./textUtils";

// ---------------------------------------------------------------------------
// Inline wrap/unwrap (bold, italic, strikethrough, underline, sub/sup, code)
// ---------------------------------------------------------------------------

/**
 * Toggles `before`/`after` marks around the selection. If the selection is
 * already wrapped (or the marks sit immediately outside it), the marks are
 * removed instead. With no selection, inserts `before + placeholder + after`
 * and selects the placeholder so the person can type straight over it.
 */
export function toggleInlineWrap(state: EditorState, before: string, after: string, placeholder = "text"): EditorState {
  if (before === after && (before === "*" || before === "**")) {
    return toggleAsteriskMark(state, before.length as 1 | 2, placeholder);
  }
  const { value } = state;
  const { start, end } = state.selection;
  const selected = value.slice(start, end);

  if (selected.length >= before.length + after.length && selected.startsWith(before) && selected.endsWith(after)) {
    const inner = selected.slice(before.length, selected.length - after.length);
    const newValue = value.slice(0, start) + inner + value.slice(end);
    return { value: newValue, selection: { start, end: start + inner.length } };
  }

  const beforeSlice = value.slice(Math.max(0, start - before.length), start);
  const afterSlice = value.slice(end, end + after.length);
  if (beforeSlice === before && afterSlice === after) {
    const newValue = value.slice(0, start - before.length) + selected + value.slice(end + after.length);
    return { value: newValue, selection: { start: start - before.length, end: end - before.length } };
  }

  const content = selected || placeholder;
  const newValue = value.slice(0, start) + before + content + after + value.slice(end);
  const selStart = start + before.length;
  return { value: newValue, selection: { start: selStart, end: selStart + content.length } };
}

function countRun(value: string, from: number, dir: 1 | -1, ch: string): number {
  let n = 0;
  for (let i = dir === 1 ? from : from - 1; i >= 0 && i < value.length && value[i] === ch; i += dir) n++;
  return n;
}

/**
 * Bold (`**`) and italic (`*`) share one character, so a run of asterisks
 * around text encodes both: 1 = italic, 2 = bold, 3 = both. Toggling must add
 * or remove only its own share of the run. Treating the neighbouring `*` as a
 * wrapper would, for example, turn `**bold**` into `*bold*` when you press
 * Ctrl+I, silently dropping the bold. With this logic Ctrl+I on `**bold**`
 * yields `***bold***`, and Ctrl+I again returns to `**bold**`.
 */
function toggleAsteriskMark(state: EditorState, n: 1 | 2, placeholder: string): EditorState {
  const { value } = state;
  const { start, end } = state.selection;
  const selected = value.slice(start, end);
  const marks = "*".repeat(n);
  const isOn = (run: number) => (n === 1 ? run === 1 || run === 3 : run >= 2);

  // Marks sitting just outside the selection.
  const outer = Math.min(countRun(value, start, -1, "*"), countRun(value, end, 1, "*"));
  if (outer > 0 && isOn(outer)) {
    const newValue = value.slice(0, start - n) + selected + value.slice(end + n);
    return { value: newValue, selection: { start: start - n, end: end - n } };
  }

  // Marks included in the selection itself.
  const inner = Math.min(countRun(selected, 0, 1, "*"), countRun(selected, selected.length, -1, "*"));
  if (inner > 0 && selected.length > inner * 2 && isOn(inner)) {
    const stripped = selected.slice(n, selected.length - n);
    return {
      value: value.slice(0, start) + stripped + value.slice(end),
      selection: { start, end: start + stripped.length },
    };
  }

  const content = selected || placeholder;
  const newValue = value.slice(0, start) + marks + content + marks + value.slice(end);
  return { value: newValue, selection: { start: start + n, end: start + n + content.length } };
}

export const toggleBold = (s: EditorState) => toggleInlineWrap(s, "**", "**", "bold text");
export const toggleItalic = (s: EditorState) => toggleInlineWrap(s, "*", "*", "italic text");
export const toggleStrikethrough = (s: EditorState) => toggleInlineWrap(s, "~~", "~~", "strikethrough text");
export const toggleUnderline = (s: EditorState) => toggleInlineWrap(s, "<u>", "</u>", "underlined text");
export const toggleSubscript = (s: EditorState) => toggleInlineWrap(s, "<sub>", "</sub>", "2");
export const toggleSuperscript = (s: EditorState) => toggleInlineWrap(s, "<sup>", "</sup>", "2");
export const toggleInlineCode = (s: EditorState) => toggleInlineWrap(s, "`", "`", "code");

// ---------------------------------------------------------------------------
// Headings
// ---------------------------------------------------------------------------

const HEADING_LINE_RE = /^(#{1,6})(\s+)/;

/** Always sets the current line's heading level (0 = plain paragraph). Used by the heading dropdown. */
export function setHeadingLevel(state: EditorState, level: 0 | 1 | 2 | 3 | 4 | 5 | 6): EditorState {
  const { value, selection } = state;
  const { start: lineStart, end: lineEnd } = lineBoundsAt(value, selection.start);
  const line = value.slice(lineStart, lineEnd);
  const m = line.match(HEADING_LINE_RE);
  const content = m ? line.slice(m[0].length) : line;
  const newLine = level === 0 ? content : "#".repeat(level) + " " + content;

  const newValue = value.slice(0, lineStart) + newLine + value.slice(lineEnd);
  const delta = newLine.length - line.length;
  const relPos = Math.min(Math.max(selection.start - lineStart, 0), line.length);
  const newPos = lineStart + Math.max(0, Math.min(newLine.length, relPos + delta));
  return { value: newValue, selection: { start: newPos, end: newPos } };
}

export function setHeading(state: EditorState, level: 1 | 2 | 3 | 4 | 5 | 6): EditorState {
  const { value, selection } = state;
  const { start: lineStart, end: lineEnd } = lineBoundsAt(value, selection.start);
  const line = value.slice(lineStart, lineEnd);
  const m = line.match(HEADING_LINE_RE);
  const currentLevel = m ? m[1].length : 0;
  const newLevel = currentLevel === level ? 0 : level;
  return setHeadingLevel(state, newLevel as 0 | 1 | 2 | 3 | 4 | 5 | 6);
}

// ---------------------------------------------------------------------------
// Blockquote
// ---------------------------------------------------------------------------

export function toggleBlockquote(state: EditorState): EditorState {
  const { value, selection } = state;
  const { start, end } = expandToLines(value, selection.start, selection.end);
  const block = value.slice(start, end);
  const lines = block.split("\n");
  const nonEmpty = lines.filter((l) => l.trim() !== "");
  const allQuoted = nonEmpty.length > 0 && nonEmpty.every((l) => /^>\s?/.test(l));
  const newLines = lines.map((l) => {
    if (l.trim() === "") return l;
    return allQuoted ? l.replace(/^>\s?/, "") : "> " + l;
  });
  const newBlock = newLines.join("\n");
  const newValue = value.slice(0, start) + newBlock + value.slice(end);
  const delta = newBlock.length - block.length;
  return { value: newValue, selection: { start, end: Math.max(start, end + delta) } };
}

// ---------------------------------------------------------------------------
// Lists (unordered / ordered / checklist)
// ---------------------------------------------------------------------------

function stripAnyListMarker(content: string): string {
  return content
    .replace(/^[-*+]\s+\[( |x|X)\]\s+/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+[.)]\s+/, "");
}

function applyListToggle(
  state: EditorState,
  markerRe: RegExp,
  makeLine: (indent: string, content: string, n: number) => string,
): EditorState {
  const { value, selection } = state;
  const { start, end } = expandToLines(value, selection.start, selection.end);
  const block = value.slice(start, end);
  const lines = block.split("\n");
  const nonEmpty = lines.filter((l) => l.trim() !== "");
  const allMarked = nonEmpty.length > 0 && nonEmpty.every((l) => markerRe.test(l));
  let n = 0;
  const newLines = lines.map((l) => {
    if (l.trim() === "") return l;
    const indent = l.match(/^(\s*)/)![1];
    const rest = l.slice(indent.length);
    if (allMarked) return indent + stripAnyListMarker(rest);
    n++;
    return makeLine(indent, stripAnyListMarker(rest), n);
  });
  const newBlock = newLines.join("\n");
  const newValue = value.slice(0, start) + newBlock + value.slice(end);
  const delta = newBlock.length - block.length;
  return { value: newValue, selection: { start, end: Math.max(start, end + delta) } };
}

export const toggleUnorderedList = (s: EditorState) =>
  applyListToggle(s, /^\s*[-*+]\s+(?!\[)/, (indent, content) => `${indent}- ${content}`);

export const toggleOrderedList = (s: EditorState) =>
  applyListToggle(s, /^\s*\d+[.)]\s+/, (indent, content, n) => `${indent}${n}. ${content}`);

export const toggleChecklist = (s: EditorState) =>
  applyListToggle(s, /^\s*[-*+]\s+\[( |x|X)\]\s+/, (indent, content) => `${indent}- [ ] ${content}`);

// ---------------------------------------------------------------------------
// Indent / outdent (Tab / Shift+Tab inside lists)
// ---------------------------------------------------------------------------

const LIST_LINE_RE = /^( *)([-*+]|\d{1,9}[.)])( {1,4})(?=\S|$)/;

interface ListLineInfo {
  indent: number;
  /** Column where the item's text starts: the indentation a nested child needs. */
  contentCol: number;
}

function listLineInfo(line: string): ListLineInfo | null {
  const m = line.match(LIST_LINE_RE);
  if (!m) return null;
  return { indent: m[1].length, contentCol: m[1].length + m[2].length + m[3].length };
}

/** Nearest list item above (searching upward) accepted by `accept`; unindented prose ends the search. */
function findListItemAbove(context: string[], accept: (info: ListLineInfo) => boolean): ListLineInfo | null {
  for (let i = context.length - 1; i >= 0; i--) {
    const line = context[i];
    const info = listLineInfo(line);
    if (info) {
      if (accept(info)) return info;
      continue;
    }
    if (line.trim() !== "" && !/^\s/.test(line)) return null;
  }
  return null;
}

function linesAbove(value: string, start: number): string[] {
  return start === 0 ? [] : value.slice(0, start - 1).split("\n");
}

/**
 * Indents the selected lines. List items nest under their previous sibling by
 * exactly that sibling's marker width, so `1. a` / `2. b` becomes a real child
 * list (3 spaces) while `- a` / `- b` uses 2. A fixed 2-space indent would
 * leave numbered items un-nested, because Markdown needs the child to start
 * at the parent's content column.
 */
export function indentLines(state: EditorState): EditorState {
  const { value, selection } = state;
  const { start, end } = expandToLines(value, selection.start, selection.end);
  const block = value.slice(start, end);
  const lines = block.split("\n");

  let delta = 2;
  const first = listLineInfo(lines[0]);
  if (first) {
    const sibling = findListItemAbove(linesAbove(value, start), (i) => i.indent <= first.indent);
    if (sibling && sibling.indent === first.indent) delta = sibling.contentCol - first.indent;
  }

  const pad = " ".repeat(delta);
  const newBlock = lines.map((l) => (l.length ? pad + l : l)).join("\n");
  const newValue = value.slice(0, start) + newBlock + value.slice(end);
  return { value: newValue, selection: { start, end: end + (newBlock.length - block.length) } };
}

/** Outdents the selected lines; a nested list item moves back to its parent's indentation. */
export function outdentLines(state: EditorState): EditorState {
  const { value, selection } = state;
  const { start, end } = expandToLines(value, selection.start, selection.end);
  const block = value.slice(start, end);
  const lines = block.split("\n");

  let remove = 2;
  const first = listLineInfo(lines[0]);
  if (first && first.indent > 0) {
    const parent = findListItemAbove(linesAbove(value, start), (i) => i.indent < first.indent);
    remove = parent ? first.indent - parent.indent : Math.min(first.indent, 2);
  }

  const strip = new RegExp(`^ {1,${remove}}`);
  const newBlock = lines.map((l) => l.replace(strip, "")).join("\n");
  const newValue = value.slice(0, start) + newBlock + value.slice(end);
  return { value: newValue, selection: { start, end: Math.max(start, end + (newBlock.length - block.length)) } };
}

// ---------------------------------------------------------------------------
// Horizontal rule
// ---------------------------------------------------------------------------

function surroundingNewlines(before: string, after: string): { lead: string; trail: string } {
  const lead = before.length === 0 || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const trail = after.length === 0 || after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";
  return { lead, trail };
}

export function insertHorizontalRule(state: EditorState): EditorState {
  const { value, selection } = state;
  const before = value.slice(0, selection.start);
  const after = value.slice(selection.end);
  const { lead, trail } = surroundingNewlines(before, after);
  const insertion = `${lead}---${trail}`;
  const newValue = before + insertion + after;
  const pos = before.length + insertion.length;
  return { value: newValue, selection: { start: pos, end: pos } };
}

// ---------------------------------------------------------------------------
// Code block / code group
// ---------------------------------------------------------------------------

export function insertCodeBlock(state: EditorState, lang = ""): EditorState {
  const { value, selection } = state;
  const selected = getSelectedText(state);
  const before = value.slice(0, selection.start);
  const after = value.slice(selection.end);
  const { lead, trail } = surroundingNewlines(before, after);
  const body = selected;
  const insertion = `${lead}\`\`\`${lang}\n${body}\n\`\`\`${trail}`;
  const newValue = before + insertion + after;
  const codeStart = before.length + lead.length + 3 + lang.length + 1;
  const codeEnd = codeStart + body.length;
  return { value: newValue, selection: { start: codeStart, end: codeEnd } };
}

export function insertCodeGroup(state: EditorState): EditorState {
  const { value, selection } = state;
  const before = value.slice(0, selection.start);
  const after = value.slice(selection.end);
  const { lead, trail } = surroundingNewlines(before, after);
  const firstBlockHeader = "::: code-group\n```js [JavaScript]\n";
  const template = ["::: code-group", "```js [JavaScript]", "", "```", "```python [Python]", "", "```", ":::"].join(
    "\n",
  );
  const insertion = `${lead}${template}${trail}`;
  const newValue = before + insertion + after;
  const pos = before.length + lead.length + firstBlockHeader.length;
  return { value: newValue, selection: { start: pos, end: pos } };
}

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

export function insertTable(state: EditorState, rows: number, cols: number): EditorState {
  const { value, selection } = state;
  const before = value.slice(0, selection.start);
  const after = value.slice(selection.end);
  const { lead, trail } = surroundingNewlines(before, after);
  const c = Math.max(1, cols);
  const r = Math.max(1, rows);
  const header = Array.from({ length: c }, (_, i) => `Header ${i + 1}`).join(" | ");
  const divider = Array.from({ length: c }, () => "---").join(" | ");
  const dataRow = Array.from({ length: c }, () => "Cell").join(" | ");
  const bodyRows = Array.from({ length: r }, () => `| ${dataRow} |`).join("\n");
  const table = `| ${header} |\n| ${divider} |\n${bodyRows}`;
  const insertion = `${lead}${table}${trail}`;
  const newValue = before + insertion + after;
  const pos = before.length + insertion.length;
  return { value: newValue, selection: { start: pos, end: pos } };
}

// ---------------------------------------------------------------------------
// Link / image
// ---------------------------------------------------------------------------

export function insertLink(state: EditorState): EditorState {
  const { value, selection } = state;
  const selected = getSelectedText(state);
  const text = selected || "link text";
  const url = "https://";
  const insertion = `[${text}](${url})`;
  const newValue = value.slice(0, selection.start) + insertion + value.slice(selection.end);
  const urlStart = selection.start + `[${text}](`.length;
  return { value: newValue, selection: { start: urlStart, end: urlStart + url.length } };
}

export function insertImage(state: EditorState): EditorState {
  const { value, selection } = state;
  const selected = getSelectedText(state);
  const alt = selected || "alt text";
  const url = "https://";
  const insertion = `![${alt}](${url})`;
  const newValue = value.slice(0, selection.start) + insertion + value.slice(selection.end);
  const urlStart = selection.start + `![${alt}](`.length;
  return { value: newValue, selection: { start: urlStart, end: urlStart + url.length } };
}

// ---------------------------------------------------------------------------
// GitHub-style alerts
// ---------------------------------------------------------------------------

export const ALERT_KINDS = ["note", "tip", "important", "warning", "caution"] as const;
export type AlertKind = (typeof ALERT_KINDS)[number];

export function insertAlert(state: EditorState, kind: AlertKind): EditorState {
  const { value, selection } = state;
  const selected = getSelectedText(state) || "Message";
  const before = value.slice(0, selection.start);
  const after = value.slice(selection.end);
  const { lead, trail } = surroundingNewlines(before, after);
  const marker = `> [!${kind.toUpperCase()}]\n`;
  const body = selected
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n");
  const insertion = `${lead}${marker}${body}${trail}`;
  const newValue = before + insertion + after;
  const bodyStart = before.length + lead.length + marker.length + 2; // past "> "
  return { value: newValue, selection: { start: bodyStart, end: bodyStart + selected.length } };
}

// ---------------------------------------------------------------------------
// GitHub-style collapsible section (<details>/<summary>)
// ---------------------------------------------------------------------------

export function insertDetails(state: EditorState): EditorState {
  const { value, selection } = state;
  const selected = getSelectedText(state) || "Details content goes here.";
  const before = value.slice(0, selection.start);
  const after = value.slice(selection.end);
  const { lead, trail } = surroundingNewlines(before, after);
  const summaryLabel = "Click to expand";
  const openTag = "<details>\n";
  const summaryTag = `<summary>${summaryLabel}</summary>\n\n`;
  const body = selected;
  const template = `${openTag}${summaryTag}${body}\n\n</details>`;
  const insertion = `${lead}${template}${trail}`;
  const newValue = before + insertion + after;
  // Select the summary label so the person can immediately type over it.
  const summaryStart = before.length + lead.length + openTag.length + "<summary>".length;
  return { value: newValue, selection: { start: summaryStart, end: summaryStart + summaryLabel.length } };
}

// ---------------------------------------------------------------------------
// Replace-selection convenience (used by e.g. drag/drop or paste handling)
// ---------------------------------------------------------------------------

export function insertText(state: EditorState, text: string): EditorState {
  return replaceRange(state.value, state.selection.start, state.selection.end, text, "collapse-end");
}

// ---------------------------------------------------------------------------
// Enter-to-continue-list (used by the textarea's keydown handler)
// ---------------------------------------------------------------------------

/**
 * If the cursor is at the end of a list-item line, returns a new state with
 * the next line pre-seeded with the same list marker (auto-incrementing
 * ordered lists). Pressing Enter on an *empty* item instead removes the
 * marker and exits the list. Returns null when the cursor isn't in a list
 * line, so the caller can fall back to a plain newline.
 */
export function continueList(state: EditorState): EditorState | null {
  const { value, selection } = state;
  if (selection.start !== selection.end) return null;
  const lineStart = value.lastIndexOf("\n", selection.start - 1) + 1;
  const linePrefix = value.slice(lineStart, selection.start);

  const checklistMatch = linePrefix.match(/^(\s*)([-*+])\s+\[( |x|X)\]\s*(.*)$/);
  const ulMatch = !checklistMatch ? linePrefix.match(/^(\s*)([-*+])\s+(.*)$/) : null;
  const olMatch = !checklistMatch && !ulMatch ? linePrefix.match(/^(\s*)(\d+)([.)])\s+(.*)$/) : null;

  const quoteMatch = !checklistMatch && !ulMatch && !olMatch ? linePrefix.match(/^( {0,3})((?:>[ \t]?)+)(.*)$/) : null;

  const exitList = (): EditorState => {
    const newValue = value.slice(0, lineStart) + value.slice(selection.start);
    return { value: newValue, selection: { start: lineStart, end: lineStart } };
  };

  if (checklistMatch) {
    const [, indent, bullet, , rest] = checklistMatch;
    if (rest.trim() === "") return exitList();
    const insertion = `\n${indent}${bullet} [ ] `;
    const newValue = value.slice(0, selection.start) + insertion + value.slice(selection.end);
    const pos = selection.start + insertion.length;
    return { value: newValue, selection: { start: pos, end: pos } };
  }

  if (ulMatch) {
    const [, indent, bullet, rest] = ulMatch;
    if (rest.trim() === "") return exitList();
    const insertion = `\n${indent}${bullet} `;
    const newValue = value.slice(0, selection.start) + insertion + value.slice(selection.end);
    const pos = selection.start + insertion.length;
    return { value: newValue, selection: { start: pos, end: pos } };
  }

  if (quoteMatch) {
    const [, indent, marks, rest] = quoteMatch;
    if (rest.trim() === "") return exitList();
    const insertion = `\n${indent}${marks.replace(/\s+$/, "")} `;
    const newValue = value.slice(0, selection.start) + insertion + value.slice(selection.end);
    const pos = selection.start + insertion.length;
    return { value: newValue, selection: { start: pos, end: pos } };
  }

  if (olMatch) {
    const [, indent, num, delim, rest] = olMatch;
    if (rest.trim() === "") return exitList();
    const nextNum = parseInt(num, 10) + 1;
    const insertion = `\n${indent}${nextNum}${delim} `;
    const newValue = value.slice(0, selection.start) + insertion + value.slice(selection.end);
    const pos = selection.start + insertion.length;
    return { value: newValue, selection: { start: pos, end: pos } };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Programmatic edits (used by paste handling and asynchronous image uploads)
// ---------------------------------------------------------------------------

/**
 * Replaces the first occurrence of `search` with `replacement`, keeping the
 * caret where the user expects it. Used to swap an "Uploading…" placeholder
 * for the final image markdown after an async upload finishes, so it must
 * tolerate the user having kept typing in the meantime. If `search` is gone
 * (the user deleted it), the state is returned unchanged.
 */
export function replaceText(state: EditorState, search: string, replacement: string): EditorState {
  const at = state.value.indexOf(search);
  if (at === -1) return state;
  const delta = replacement.length - search.length;
  const shift = (pos: number) =>
    pos >= at + search.length ? pos + delta : pos > at ? Math.min(pos, at + replacement.length) : pos;
  return {
    value: state.value.slice(0, at) + replacement + state.value.slice(at + search.length),
    selection: { start: shift(state.selection.start), end: shift(state.selection.end) },
  };
}

/** Pasting a URL over selected text turns the selection into `[text](url)`. */
export function linkSelection(state: EditorState, url: string): EditorState {
  const { value, selection } = state;
  const label = value.slice(selection.start, selection.end);
  const link = `[${label}](${url})`;
  const pos = selection.start + link.length;
  return {
    value: value.slice(0, selection.start) + link + value.slice(selection.end),
    selection: { start: pos, end: pos },
  };
}
