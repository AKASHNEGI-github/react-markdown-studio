import type {
  AlertType,
  Alignment,
  BlockNode,
  CodeBlockNode,
  InlineNode,
  ListItemNode,
  ListNode,
  ParseOptions,
} from "../types";
import { parseInline, joinParagraphLines } from "./inline";
import { slugify, inlineToPlainText } from "../utils";

const HEADING_RE = /^ {0,3}(#{1,6})(?:\s+(.*))?$/;
/** Setext underline: a line of only `=` or `-` (2+ characters, so a lone "-" typed on the way to a list stays calm). */
const SETEXT_RE = /^ {0,3}(={2,}|-{2,})[ \t]*$/;

/** Containers (lists, quotes, alerts, details) nested deeper than this degrade to plain text instead of overflowing the stack. */
export const MAX_BLOCK_DEPTH = 32;
const THEMATIC_BREAK_RE = /^ {0,3}([-*_])\1{2,}\s*$/;
const FENCE_OPEN_RE = /^ {0,3}(`{3,}|~{3,})[ \t]*(.*)$/;
const BLOCKQUOTE_RE = /^ {0,3}>( ?)(.*)$/;
const CODE_GROUP_OPEN_RE = /^:::\s*code-group\s*$/i;
const ALERT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i;
// Only the bare opening/closing forms are recognized — no other attributes,
// consistent with the inline HTML whitelist (see /docs/SYNTAX.md).
const DETAILS_OPEN_RE = /^<details(\s+open)?\s*>\s*$/i;
const DETAILS_CLOSE_RE = /^<\/details>\s*$/i;
const SUMMARY_RE = /^<summary>([\s\S]*?)<\/summary>\s*$/i;
const UNORDERED_MARKER_RE = /^( {0,3})([-*+])( +)(.*)$/;
const ORDERED_MARKER_RE = /^( {0,3})(\d{1,9})([.)])( +)(.*)$/;
const CHECKBOX_RE = /^\[( |x|X)\](?: +(.*)|$)/;

function isBlank(line: string): boolean {
  return /^\s*$/.test(line);
}

function leadingSpaces(line: string): number {
  const m = line.match(/^ */);
  return m ? m[0].length : 0;
}

interface MarkerInfo {
  ordered: boolean;
  start?: number;
  indent: number;
  contentStartCol: number;
  firstContent: string;
}

function matchMarker(line: string): MarkerInfo | null {
  let m = line.match(UNORDERED_MARKER_RE);
  if (m) {
    const indent = m[1].length;
    return {
      ordered: false,
      indent,
      contentStartCol: indent + 1 + m[3].length,
      firstContent: m[4],
    };
  }
  m = line.match(ORDERED_MARKER_RE);
  if (m) {
    const indent = m[1].length;
    const markerLen = m[2].length + 1;
    return {
      ordered: true,
      start: parseInt(m[2], 10),
      indent,
      contentStartCol: indent + markerLen + m[4].length,
      firstContent: m[5],
    };
  }
  return null;
}

function isBlockStartLine(line: string): boolean {
  if (HEADING_RE.test(line)) return true;
  if (THEMATIC_BREAK_RE.test(line)) return true;
  if (FENCE_OPEN_RE.test(line)) return true;
  if (BLOCKQUOTE_RE.test(line)) return true;
  if (CODE_GROUP_OPEN_RE.test(line.trim())) return true;
  if (DETAILS_OPEN_RE.test(line.trim())) return true;
  if (matchMarker(line)) return true;
  return false;
}

function splitTableRow(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) {
    // don't strip an escaped trailing pipe
    const before = s.slice(0, -1);
    if (!before.endsWith("\\")) s = before;
  }
  const cells: string[] = [];
  let cur = "";
  for (let k = 0; k < s.length; k++) {
    if (s[k] === "\\" && s[k + 1] === "|") {
      cur += "|";
      k++;
      continue;
    }
    if (s[k] === "|") {
      cells.push(cur.trim());
      cur = "";
      continue;
    }
    cur += s[k];
  }
  cells.push(cur.trim());
  return cells;
}

function isTableDelimiterRow(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes("-") || !trimmed.includes("|")) return false;
  const cells = splitTableRow(trimmed);
  if (cells.length === 0) return false;
  return cells.every((c) => /^:?-+:?$/.test(c));
}

function parseFenceInfo(info: string): { lang?: string; title?: string } {
  const trimmed = info.trim();
  const m = trimmed.match(/^(\S+)?\s*(?:\[([^\]]*)\])?/);
  if (!m) return {};
  return { lang: m[1] || undefined, title: m[2] || undefined };
}

function parseFencedCodeBlock(lines: string[], i: number): { node: CodeBlockNode; next: number } {
  const fm = lines[i].match(FENCE_OPEN_RE)!;
  const fenceChar = fm[1][0];
  const fenceLen = fm[1].length;
  const { lang, title } = parseFenceInfo(fm[2]);
  const closeRe = new RegExp(`^ {0,3}\\${fenceChar}{${fenceLen},}\\s*$`);
  let j = i + 1;
  const codeLines: string[] = [];
  while (j < lines.length && !closeRe.test(lines[j])) {
    codeLines.push(lines[j]);
    j++;
  }
  if (j < lines.length) j++; // consume closing fence
  return { node: { type: "codeBlock", lang, title, code: codeLines.join("\n") }, next: j };
}

/** Parses a run of sibling list items starting at `i` into a single ListNode. */
function parseList(
  lines: string[],
  i: number,
  slugSeen: Map<string, number>,
  options: Required<ParseOptions>,
  nesting: number,
): { node: ListNode; next: number } {
  const first = matchMarker(lines[i])!;
  const ordered = first.ordered;
  const baseIndent = first.indent;
  const items: ListItemNode[] = [];
  let loose = false;
  let idx = i;

  while (idx < lines.length) {
    const marker = matchMarker(lines[idx]);
    if (!marker || marker.ordered !== ordered || marker.indent !== baseIndent) break;

    const contentCol = marker.contentStartCol;
    const itemLines: string[] = [marker.firstContent];
    idx++;
    let itemHasBlank = false;

    while (idx < lines.length) {
      const l = lines[idx];
      if (isBlank(l)) {
        let j = idx;
        while (j < lines.length && isBlank(lines[j])) j++;
        const next = lines[j];
        if (next !== undefined && leadingSpaces(next) >= contentCol) {
          itemLines.push("");
          itemHasBlank = true;
          idx++;
          continue;
        }
        if (next !== undefined) {
          const m = matchMarker(next);
          if (m && m.ordered === ordered && m.indent === baseIndent) {
            itemHasBlank = true; // blank line(s) between sibling items -> loose list
          }
        }
        idx = j; // consume all consecutive blank lines
        break;
      }
      if (leadingSpaces(l) >= contentCol) {
        itemLines.push(l.slice(contentCol));
        idx++;
        continue;
      }
      break; // dedented: sibling marker or end of list
    }

    if (itemHasBlank) loose = true;

    let checked: boolean | null | undefined = undefined;
    if (itemLines.length) {
      const cm = itemLines[0].match(CHECKBOX_RE);
      if (cm) {
        checked = cm[1].toLowerCase() === "x";
        itemLines[0] = cm[2] ?? "";
      }
    }

    const children = parseBlockList(itemLines, slugSeen, options, nesting + 1);
    items.push({ children, checked });
  }

  return {
    node: { type: "list", ordered, start: first.start, tight: !loose, items },
    next: idx,
  };
}

/** Parses a flat sequence of lines (already stripped of any container prefix) into block nodes. */
export function parseBlockList(
  lines: string[],
  slugSeen: Map<string, number>,
  options: Required<ParseOptions>,
  nesting = 0,
): BlockNode[] {
  if (nesting > MAX_BLOCK_DEPTH) {
    const flat = lines.join(" ").trim();
    return flat ? [{ type: "paragraph", children: [{ type: "text", value: flat }] }] : [];
  }
  const blocks: BlockNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i++;
      continue;
    }

    const heading = line.match(HEADING_RE);
    if (heading) {
      const depth = heading[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const text = (heading[2] ?? "").replace(/\s+#+\s*$/, "").trim();
      const children = parseInline(text);
      const id = options.headingIds ? slugify(inlineToPlainText(children), slugSeen) : "";
      blocks.push({ type: "heading", depth, children, id });
      i++;
      continue;
    }

    if (THEMATIC_BREAK_RE.test(line)) {
      blocks.push({ type: "thematicBreak" });
      i++;
      continue;
    }

    if (CODE_GROUP_OPEN_RE.test(line.trim())) {
      i++;
      const innerLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== ":::") {
        innerLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing :::
      const groupBlocks: CodeBlockNode[] = [];
      let k = 0;
      while (k < innerLines.length) {
        if (FENCE_OPEN_RE.test(innerLines[k])) {
          const { node, next } = parseFencedCodeBlock(innerLines, k);
          groupBlocks.push(node);
          k = next;
        } else {
          k++;
        }
      }
      blocks.push({ type: "codeGroup", blocks: groupBlocks });
      continue;
    }

    if (DETAILS_OPEN_RE.test(line.trim())) {
      const openMatch = line.trim().match(DETAILS_OPEN_RE)!;
      const isOpen = !!openMatch[1];
      i++;
      while (i < lines.length && isBlank(lines[i])) i++;

      let summary: InlineNode[];
      const summaryMatch = i < lines.length ? lines[i].match(SUMMARY_RE) : null;
      if (summaryMatch) {
        summary = parseInline(summaryMatch[1].trim());
        i++;
      } else {
        summary = [{ type: "text", value: "Details" }];
      }

      const innerLines: string[] = [];
      let depth = 1;
      while (i < lines.length) {
        const inner = lines[i].trim();
        if (DETAILS_OPEN_RE.test(inner)) {
          depth++;
          innerLines.push(lines[i]);
          i++;
          continue;
        }
        if (DETAILS_CLOSE_RE.test(inner)) {
          depth--;
          if (depth === 0) {
            i++; // consume the matching closing tag
            break;
          }
          innerLines.push(lines[i]);
          i++;
          continue;
        }
        innerLines.push(lines[i]);
        i++;
      }
      const children = parseBlockList(innerLines, slugSeen, options, nesting + 1);
      blocks.push({ type: "details", summary, open: isOpen, children });
      continue;
    }

    if (BLOCKQUOTE_RE.test(line)) {
      const inner: string[] = [];
      while (i < lines.length && BLOCKQUOTE_RE.test(lines[i])) {
        const m = lines[i].match(BLOCKQUOTE_RE)!;
        inner.push(m[2]);
        i++;
      }
      const alertMatch = inner[0] !== undefined ? inner[0].match(ALERT_RE) : null;
      if (alertMatch) {
        const bodyLines = inner.slice(1);
        const children = parseBlockList(bodyLines, slugSeen, options, nesting + 1);
        blocks.push({ type: "alert", alertType: alertMatch[1].toLowerCase() as AlertType, children });
      } else {
        const children = parseBlockList(inner, slugSeen, options, nesting + 1);
        blocks.push({ type: "blockquote", children });
      }
      continue;
    }

    if (FENCE_OPEN_RE.test(line)) {
      const { node, next } = parseFencedCodeBlock(lines, i);
      blocks.push(node);
      i = next;
      continue;
    }

    if (line.includes("|") && lines[i + 1] !== undefined && isTableDelimiterRow(lines[i + 1])) {
      const headerCells = splitTableRow(line);
      const delimCells = splitTableRow(lines[i + 1]);
      const align: Alignment[] = delimCells.map((c) => {
        const left = c.startsWith(":");
        const right = c.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        if (left) return "left";
        return null;
      });
      const header = headerCells.map((c) => parseInline(c));
      let j = i + 2;
      const rows: InlineNode[][][] = [];
      while (j < lines.length && !isBlank(lines[j]) && lines[j].includes("|")) {
        const cells = splitTableRow(lines[j]);
        while (cells.length < headerCells.length) cells.push("");
        rows.push(cells.slice(0, headerCells.length).map((c) => parseInline(c)));
        j++;
      }
      blocks.push({ type: "table", align, header, rows });
      i = j;
      continue;
    }

    if (matchMarker(line)) {
      const { node, next } = parseList(lines, i, slugSeen, options, nesting);
      blocks.push(node);
      i = next;
      continue;
    }

    // Fallback: paragraph. Gather lines until a blank line or a new block-start pattern.
    const paraLines: string[] = [line];
    i++;
    let setextLevel: 1 | 2 | null = null;
    while (i < lines.length && !isBlank(lines[i])) {
      const underline = lines[i].match(SETEXT_RE);
      if (underline) {
        setextLevel = underline[1][0] === "=" ? 1 : 2;
        i++;
        break;
      }
      if (isBlockStartLine(lines[i])) break;
      paraLines.push(lines[i]);
      i++;
    }
    const inlineSource = joinParagraphLines(paraLines);
    if (setextLevel) {
      const children = parseInline(inlineSource.trim());
      const id = options.headingIds ? slugify(inlineToPlainText(children), slugSeen) : "";
      blocks.push({ type: "heading", depth: setextLevel, children, id });
    } else {
      blocks.push({ type: "paragraph", children: parseInline(inlineSource) });
    }
  }

  return blocks;
}
