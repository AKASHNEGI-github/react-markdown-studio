import type { InlineNode } from "../types";

/** Sentinel character inserted by joinParagraphLines() to mark a hard line break. */
export const HARD_BREAK = "\u0002";

/**
 * Joins the raw lines of a paragraph (or any multi-line inline context) into
 * a single string, turning "line ends with 2+ spaces" or "line ends with a
 * backslash" into a hard-break sentinel, and everything else into a soft
 * break (a single space), matching standard markdown paragraph behavior.
 */
export function joinParagraphLines(lines: string[]): string {
  return lines
    .map((line, idx) => {
      const isLast = idx === lines.length - 1;
      if (isLast) return line;
      if (/ {2,}$/.test(line)) return line.replace(/ +$/, "") + HARD_BREAK;
      if (/\\$/.test(line)) return line.replace(/\\$/, "") + HARD_BREAK;
      return line + " ";
    })
    .join("");
}

/*
 * Robustness limits. Markdown is routinely rendered from untrusted input, so
 * every construct below is bounded: parsing is linear-time in the input
 * length, recursion depth is capped, and URL/title scans have a hard ceiling.
 * Anything beyond a limit degrades to plain text instead of throwing or
 * hanging.
 */
/** Maximum nesting of inline constructs that recurse (link labels, <u>/<sub>/<sup>). */
export const MAX_INLINE_DEPTH = 20;
const MAX_URL_LENGTH = 4096;
const MAX_TITLE_LENGTH = 1024;
/** Maximum nesting of emphasis/strong/strikethrough wrappers; deeper runs stay literal text. */
const MAX_EMPHASIS_DEPTH = 20;

const WHITELISTED_TAGS = {
  u: "underline",
  sub: "subscript",
  sup: "superscript",
} as const;

// Whitespace / punctuation classes used by CommonMark's flanking rules. The
// hard-break sentinel counts as whitespace; start/end of text does too.
// eslint-disable-next-line no-control-regex -- \u0002 is the internal hard-break sentinel
const WS_RE = /[\s\u0002]/;
const PUNCT_RE = /[\p{P}\p{S}]/u;

function isEscapable(ch: string): boolean {
  return /[!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~]/.test(ch);
}

interface Match {
  node: InlineNode;
  end: number;
}

/** Per-call parsing state: lazily-built indexes that keep every lookup O(1)/O(log n). */
interface Ctx {
  text: string;
  depth: number;
  /** True inside link labels, where bare-URL autolinking would nest links. */
  inLink: boolean;
  /** For every `[` index: index of its matching `]` (or -1). Built on first use. */
  brackets: Int32Array | null;
  /** Backtick run start positions grouped by run length. Built on first use. */
  runs: Map<number, number[]> | null;
  /** Smallest search start for which a closing </tag> was proven absent. */
  tagFailedFrom: Record<string, number>;
  /**
   * Characters we may still scan while parsing link/image destinations. Real
   * documents use a tiny fraction of this; hostile input such as "[a](" × N
   * exhausts it, after which further destinations are treated as plain text.
   * This keeps the whole parse linear in the input size.
   */
  urlBudget: number;
}

// ── code spans ────────────────────────────────────────────────────────────

function codeRuns(ctx: Ctx): Map<number, number[]> {
  if (ctx.runs) return ctx.runs;
  const runs = new Map<number, number[]>();
  const { text } = ctx;
  let j = 0;
  while (j < text.length) {
    if (text[j] === "`") {
      const start = j;
      while (text[j] === "`") j++;
      const len = j - start;
      const list = runs.get(len);
      if (list) list.push(start);
      else runs.set(len, [start]);
    } else {
      j++;
    }
  }
  ctx.runs = runs;
  return runs;
}

function tryInlineCode(ctx: Ctx, i: number): Match | null {
  const { text } = ctx;
  let n = 0;
  while (text[i + n] === "`") n++;
  const openEnd = i + n;
  const starts = codeRuns(ctx).get(n);
  if (!starts) return null;
  // First run of the same length that begins at/after the end of the opener.
  let lo = 0;
  let hi = starts.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (starts[mid] >= openEnd) hi = mid;
    else lo = mid + 1;
  }
  if (lo === starts.length) return null;
  const runStart = starts[lo];
  let content = text.slice(openEnd, runStart);
  // CommonMark: strip one leading+trailing space if content has non-space chars.
  if (content.length > 0 && content.startsWith(" ") && content.endsWith(" ") && content.trim() !== "") {
    content = content.slice(1, -1);
  }
  content = content.replace(/\n/g, " ");
  return { node: { type: "inlineCode", value: content }, end: runStart + n };
}

// ── autolinks, whitelisted tags, bare URLs ────────────────────────────────

const AUTOLINK_RE = /<((?:https?:\/\/|mailto:)[^\s<>]+)>/y;
const TAG_RE = /<(u|sub|sup)>/y;

function tryAutolinkOrTag(ctx: Ctx, i: number): Match | null {
  const { text } = ctx;

  AUTOLINK_RE.lastIndex = i;
  const autolink = AUTOLINK_RE.exec(text);
  if (autolink) {
    const url = autolink[1];
    return {
      node: { type: "link", url, children: [{ type: "text", value: url }] },
      end: i + autolink[0].length,
    };
  }

  TAG_RE.lastIndex = i;
  const tagMatch = TAG_RE.exec(text);
  if (tagMatch) {
    const tag = tagMatch[1] as keyof typeof WHITELISTED_TAGS;
    const closeTag = `</${tag}>`;
    const openEnd = i + tagMatch[0].length;
    const failedFrom = ctx.tagFailedFrom[tag];
    if (failedFrom !== undefined && openEnd >= failedFrom) return null;
    const closeIdx = text.indexOf(closeTag, openEnd);
    if (closeIdx === -1) {
      ctx.tagFailedFrom[tag] = openEnd; // any later search would fail too
      return null;
    }
    const inner = text.slice(openEnd, closeIdx);
    return {
      node: {
        type: WHITELISTED_TAGS[tag],
        children: parseInlineCtx(inner, ctx.depth + 1, ctx.inLink),
      } as InlineNode,
      end: closeIdx + closeTag.length,
    };
  }

  return null; // not autolink/whitelisted tag -> '<' falls through as literal text
}

const BARE_URL_RE = /(?:https?:\/\/|www\.)[^\s<]+/y;
// eslint-disable-next-line no-control-regex -- \u0002 is the internal hard-break sentinel
const BARE_URL_PREFIX_OK = /[\s\u0002*_~(>"'[]/;
const WWW_HOST_RE = /^www\.[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+/;

/** GFM "extended autolink": http(s)://… and www.… written without angle brackets. */
function tryBareUrl(ctx: Ctx, i: number): Match | null {
  if (ctx.inLink) return null;
  const { text } = ctx;
  if (i > 0 && !BARE_URL_PREFIX_OK.test(text[i - 1])) return null;
  BARE_URL_RE.lastIndex = i;
  const m = BARE_URL_RE.exec(text);
  if (!m) return null;
  let url = m[0];

  // Trim trailing punctuation that is almost never part of the URL (GFM rules).
  for (;;) {
    const last = url[url.length - 1];
    if (last !== undefined && /[?!.,:*_~'";]/.test(last)) {
      url = url.slice(0, -1);
    } else if (last === ")") {
      let open = 0;
      let close = 0;
      for (const c of url) {
        if (c === "(") open++;
        else if (c === ")") close++;
      }
      if (close > open) url = url.slice(0, -1);
      else break;
    } else {
      break;
    }
  }

  const isWww = url.startsWith("www.");
  if (isWww ? !WWW_HOST_RE.test(url) : !/^https?:\/\/[A-Za-z0-9]/.test(url)) return null;
  return {
    node: {
      type: "link",
      url: isWww ? `http://${url}` : url,
      children: [{ type: "text", value: url }],
    },
    end: i + url.length,
  };
}

// ── links & images ────────────────────────────────────────────────────────

/** Parses `[label](url "title")` starting at `(`. Returns null if malformed or over the size limits. */
function parseUrlTitle(ctx: Ctx, openParenIdx: number): { url: string; title?: string; end: number } | null {
  if (ctx.urlBudget <= 0) return null;
  const { text } = ctx;
  const startedAt = openParenIdx;
  try {
    return scanUrlTitle(text, openParenIdx);
  } finally {
    // Charge the scan to the budget whether it succeeded or not.
    ctx.urlBudget -= Math.min(MAX_URL_LENGTH + MAX_TITLE_LENGTH, text.length - startedAt);
  }
}

function scanUrlTitle(text: string, openParenIdx: number): { url: string; title?: string; end: number } | null {
  let j = openParenIdx + 1;
  while (text[j] === " ") j++;
  let url = "";
  let depth = 0;
  while (j < text.length) {
    if (url.length > MAX_URL_LENGTH) return null;
    const c = text[j];
    if (c === "(") {
      depth++;
      url += c;
      j++;
      continue;
    }
    if (c === ")" && depth > 0) {
      depth--;
      url += c;
      j++;
      continue;
    }
    if (c === ")" && depth === 0) break;
    if (c === " " && depth === 0) break;
    if (c === "\\" && j + 1 < text.length) {
      url += text[j + 1];
      j += 2;
      continue;
    }
    url += c;
    j++;
  }
  while (text[j] === " ") j++;
  let title: string | undefined;
  if (text[j] === '"' || text[j] === "'") {
    const quote = text[j];
    const start = j + 1;
    const rel = text.slice(start, start + MAX_TITLE_LENGTH + 1).indexOf(quote);
    if (rel === -1) return null;
    title = text.slice(start, start + rel);
    j = start + rel + 1;
    while (text[j] === " ") j++;
  }
  if (text[j] !== ")") return null;
  return { url, title, end: j + 1 };
}

/** Maps every `[` to the `]` that closes it (respecting nesting and escapes) in one pass. */
function bracketTable(ctx: Ctx): Int32Array {
  if (ctx.brackets) return ctx.brackets;
  const { text } = ctx;
  const table = new Int32Array(text.length).fill(-1);
  const stack: number[] = [];
  for (let j = 0; j < text.length; j++) {
    const c = text[j];
    if (c === "\\") {
      j++;
      continue;
    }
    if (c === "[") stack.push(j);
    else if (c === "]" && stack.length > 0) table[stack.pop()!] = j;
  }
  ctx.brackets = table;
  return table;
}

function tryImage(ctx: Ctx, i: number): Match | null {
  // text[i] === '!' and text[i+1] === '['
  const { text } = ctx;
  const closeBracket = bracketTable(ctx)[i + 1];
  if (closeBracket === -1 || text[closeBracket + 1] !== "(") return null;
  const parsed = parseUrlTitle(ctx, closeBracket + 1);
  if (!parsed) return null;
  return {
    node: { type: "image", alt: text.slice(i + 2, closeBracket), url: parsed.url, title: parsed.title },
    end: parsed.end,
  };
}

function tryLink(ctx: Ctx, i: number): Match | null {
  const { text } = ctx;
  const closeBracket = bracketTable(ctx)[i];
  if (closeBracket === -1 || text[closeBracket + 1] !== "(") return null;
  const parsed = parseUrlTitle(ctx, closeBracket + 1);
  if (!parsed) return null;
  const label = text.slice(i + 1, closeBracket);
  return {
    node: { type: "link", url: parsed.url, title: parsed.title, children: parseInlineCtx(label, ctx.depth + 1, true) },
    end: parsed.end,
  };
}

// ── emphasis: CommonMark delimiter-run algorithm ──────────────────────────

/** Element of the doubly-linked node list that emphasis processing splices. */
interface El {
  prev: El | null;
  next: El | null;
  node: InlineNode;
  /** Nesting depth of emphasis wrappers rooted at this element (0 for plain nodes). */
  depth: number;
}

/** A run of `*`, `_` or `~~` that may open and/or close emphasis. */
interface Delim {
  ch: string;
  len: number;
  /** Original run length (needed by CommonMark's "rule of 3"). */
  orig: number;
  canOpen: boolean;
  canClose: boolean;
  el: El;
  text: { type: "text"; value: string };
  prev: Delim | null;
  next: Delim | null;
}

function charBefore(text: string, i: number): string {
  if (i <= 0) return "";
  const lo = text.charCodeAt(i - 1);
  if (lo >= 0xdc00 && lo <= 0xdfff && i >= 2) {
    const hi = text.charCodeAt(i - 2);
    if (hi >= 0xd800 && hi <= 0xdbff) return text.slice(i - 2, i);
  }
  return text[i - 1];
}

function charAfter(text: string, i: number): string {
  if (i >= text.length) return "";
  const cp = text.codePointAt(i)!;
  return cp > 0xffff ? String.fromCodePoint(cp) : text[i];
}

/** CommonMark left/right-flanking rules, with the extra `_` intraword restrictions. */
function delimiterFlags(text: string, start: number, len: number, ch: string): { canOpen: boolean; canClose: boolean } {
  const before = charBefore(text, start);
  const after = charAfter(text, start + len);
  const beforeWs = before === "" || WS_RE.test(before);
  const afterWs = after === "" || WS_RE.test(after);
  const beforePunct = before !== "" && PUNCT_RE.test(before);
  const afterPunct = after !== "" && PUNCT_RE.test(after);
  const left = !afterWs && (!afterPunct || beforeWs || beforePunct);
  const right = !beforeWs && (!beforePunct || afterWs || afterPunct);
  if (ch === "_") {
    return { canOpen: left && (!right || beforePunct), canClose: right && (!left || afterPunct) };
  }
  return { canOpen: left, canClose: right };
}

function unlinkDelim(d: Delim): void {
  if (d.prev) d.prev.next = d.next;
  if (d.next) d.next.prev = d.prev;
}

function unlinkEl(el: El): void {
  if (el.prev) el.prev.next = el.next;
  if (el.next) el.next.prev = el.prev;
}

function mergeAdjacentText(nodes: InlineNode[]): InlineNode[] {
  const out: InlineNode[] = [];
  for (const node of nodes) {
    const prev = out[out.length - 1];
    if (node.type === "text" && prev && prev.type === "text") {
      prev.value += node.value;
    } else {
      out.push(node);
    }
  }
  return out;
}

/** Runs the "process emphasis" procedure from the CommonMark spec over the delimiter list. */
function processEmphasis(first: Delim | null): void {
  const bottoms = new Map<string, Delim | null>();
  let closer = first;
  while (closer) {
    if (!closer.canClose) {
      closer = closer.next;
      continue;
    }
    const key = `${closer.ch}${closer.canOpen ? 1 : 0}${closer.orig % 3}`;
    const bottom = bottoms.get(key) ?? null;
    let opener: Delim | null = closer.prev;
    let found: Delim | null = null;
    while (opener && opener !== bottom) {
      if (opener.ch === closer.ch && opener.canOpen) {
        const oddMatch =
          (opener.canClose || closer.canOpen) &&
          (opener.orig + closer.orig) % 3 === 0 &&
          !(opener.orig % 3 === 0 && closer.orig % 3 === 0);
        if (!oddMatch) {
          found = opener;
          break;
        }
      }
      opener = opener.prev;
    }

    if (!found) {
      bottoms.set(key, closer.prev);
      const next: Delim | null = closer.next;
      if (!closer.canOpen) unlinkDelim(closer); // can never match: stays literal text
      closer = next;
      continue;
    }

    const use = closer.ch === "~" ? 2 : found.len >= 2 && closer.len >= 2 ? 2 : 1;
    const children: InlineNode[] = [];
    let childDepth = 0;
    for (let el = found.el.next; el && el !== closer.el; el = el.next) {
      children.push(el.node);
      if (el.depth > childDepth) childDepth = el.depth;
    }
    if (childDepth >= MAX_EMPHASIS_DEPTH) {
      // Too deeply nested to render safely: leave this closer as literal text.
      const next: Delim | null = closer.next;
      unlinkDelim(closer);
      closer = next;
      continue;
    }
    const merged = mergeAdjacentText(children);
    const wrapper: InlineNode =
      closer.ch === "~"
        ? { type: "strikethrough", children: merged }
        : use === 2
          ? { type: "strong", children: merged }
          : { type: "emphasis", children: merged };
    const wrapEl: El = { prev: found.el, next: closer.el, node: wrapper, depth: childDepth + 1 };
    found.el.next = wrapEl;
    closer.el.prev = wrapEl;
    // Delimiters between opener and closer were swallowed into the wrapper as literal text.
    found.next = closer;
    closer.prev = found;

    found.len -= use;
    closer.len -= use;
    found.text.value = found.ch.repeat(found.len);
    closer.text.value = closer.ch.repeat(closer.len);

    if (found.len === 0) {
      unlinkEl(found.el);
      unlinkDelim(found);
    }
    if (closer.len === 0) {
      const next: Delim | null = closer.next;
      unlinkEl(closer.el);
      unlinkDelim(closer);
      closer = next;
    }
  }
}

// ── main loop ─────────────────────────────────────────────────────────────

function parseInlineCtx(text: string, depth: number, inLink: boolean): InlineNode[] {
  if (depth > MAX_INLINE_DEPTH) {
    return [{ type: "text", value: text.split(HARD_BREAK).join(" ") }];
  }

  const ctx: Ctx = {
    text,
    depth,
    inLink,
    brackets: null,
    runs: null,
    tagFailedFrom: {},
    urlBudget: Math.max(50_000, text.length * 8),
  };

  const listHead: El = { prev: null, next: null, node: { type: "text", value: "" }, depth: 0 };
  let listTail = listHead;
  const append = (node: InlineNode): El => {
    const el: El = { prev: listTail, next: null, node, depth: 0 };
    listTail.next = el;
    listTail = el;
    return el;
  };

  let delimFirst: Delim | null = null;
  let delimLast: Delim | null = null;
  let buf = "";
  const flush = () => {
    if (buf) {
      append({ type: "text", value: buf });
      buf = "";
    }
  };
  const emit = (res: Match): number => {
    flush();
    append(res.node);
    return res.end;
  };

  let i = 0;
  while (i < text.length) {
    const ch = text[i];

    if (ch === HARD_BREAK) {
      flush();
      append({ type: "break" });
      i++;
      continue;
    }

    if (ch === "\\" && i + 1 < text.length && isEscapable(text[i + 1])) {
      buf += text[i + 1];
      i += 2;
      continue;
    }

    if (ch === "`") {
      const res = tryInlineCode(ctx, i);
      if (res) {
        i = emit(res);
        continue;
      }
      // No matching closer: the whole backtick run is literal text.
      let n = 0;
      while (text[i + n] === "`") n++;
      buf += "`".repeat(n);
      i += n;
      continue;
    }

    if (ch === "<") {
      const res = tryAutolinkOrTag(ctx, i);
      if (res) {
        i = emit(res);
        continue;
      }
    }

    if (ch === "!" && text[i + 1] === "[") {
      const res = tryImage(ctx, i);
      if (res) {
        i = emit(res);
        continue;
      }
    }

    if (ch === "[") {
      const res = tryLink(ctx, i);
      if (res) {
        i = emit(res);
        continue;
      }
    }

    if (
      (ch === "h" && (text.startsWith("http://", i) || text.startsWith("https://", i))) ||
      (ch === "w" && text.startsWith("www.", i))
    ) {
      const res = tryBareUrl(ctx, i);
      if (res) {
        i = emit(res);
        continue;
      }
    }

    if (ch === "*" || ch === "_" || ch === "~") {
      let len = 1;
      while (text[i + len] === ch) len++;
      // Only `~~` (exactly two) is strikethrough; other tilde runs are literal.
      if (ch !== "~" || len === 2) {
        const { canOpen, canClose } = delimiterFlags(text, i, len, ch);
        flush();
        const textNode = { type: "text" as const, value: ch.repeat(len) };
        const el = append(textNode);
        const d: Delim = { ch, len, orig: len, canOpen, canClose, el, text: textNode, prev: delimLast, next: null };
        if (delimLast) delimLast.next = d;
        else delimFirst = d;
        delimLast = d;
      } else {
        buf += ch.repeat(len);
      }
      i += len;
      continue;
    }

    buf += ch;
    i++;
  }

  flush();
  processEmphasis(delimFirst);

  const out: InlineNode[] = [];
  for (let el = listHead.next; el; el = el.next) out.push(el.node);
  return mergeAdjacentText(out);
}

/** Parses a single logical line (or joined paragraph string) of inline markdown into an AST. */
export function parseInline(text: string): InlineNode[] {
  return parseInlineCtx(text, 0, false);
}
