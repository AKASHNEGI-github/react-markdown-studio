/** Escape text for safe insertion into an HTML document. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Only allow http(s), mailto, and relative/anchor URLs through.
 * Blocks javascript:, data:, vbscript:, and other script-executing schemes.
 */
export function sanitizeUrl(url: string): string {
  // The URL we emit is handed to a browser, so what matters is how the
  // browser's WHATWG URL parser will read it. That parser (1) strips ALL
  // leading/trailing C0 control characters and spaces (U+0000-U+0020, not
  // just tab/newline) and (2) removes tab/CR/LF from anywhere in the string
  // before it looks for a scheme. Hand-rolled scheme checks that skip either
  // step can be bypassed with input like "\u0001javascript:alert(1)". So we
  // normalize exactly like the parser does, and then ask the parser itself.
  const cleaned = url
    // eslint-disable-next-line no-control-regex -- control characters are the whole point: this mirrors the WHATWG URL parser
    .replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, "")
    .replace(/[\t\n\r]/g, "")
    .trim();
  if (cleaned === "") return "";
  // Anchors and root-relative paths can never carry a scheme.
  if (/^(#|\/(?![/\\])|\.\.?\/|\?)/.test(cleaned)) return cleaned;
  let protocol: string;
  try {
    protocol = new URL(cleaned, "https://relative.invalid/").protocol;
  } catch {
    return "#"; // unparseable: never emit it
  }
  return protocol === "http:" || protocol === "https:" || protocol === "mailto:" ? cleaned : "#";
}

/** GitHub-style heading slug: lowercase, spaces -> hyphens, strip punctuation, dedupe. */
export function slugify(text: string, seen: Map<string, number>): string {
  let base = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
  if (!base) base = "section";
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

/** Plain-text content of a list of inline nodes (used for heading ids, alt text fallback). */
interface PlainTextNode {
  type: string;
  value?: string;
  children?: PlainTextNode[];
}

export function inlineToPlainText(nodes: readonly PlainTextNode[]): string {
  let out = "";
  for (const node of nodes) {
    if (node.type === "text" || node.type === "inlineCode") out += node.value;
    else if (node.children) out += inlineToPlainText(node.children);
  }
  return out;
}
