import { parseMarkdown } from "../parser";
import type { DocumentNode, ParseOptions } from "../types";
import { escapeHtml, inlineToPlainText } from "../utils";
import { STANDALONE_CSS } from "./standaloneCss";
import { renderToHtml, type RenderOptions } from "./toHtml";

export interface HtmlDocumentOptions extends RenderOptions {
  /** Document `<title>`. Defaults to the text of the first heading, or "Document". */
  title?: string;
  /** `<html lang>` value. Default "en". */
  lang?: string;
  /** Extra CSS appended after the built-in stylesheet (for example, to override colours). */
  css?: string;
}

/**
 * Renders a parsed document as a complete, self-contained HTML page: doctype,
 * metadata, an embedded stylesheet that follows the reader's light/dark
 * preference, and working code-group tabs and copy buttons. Save it as a `.html`
 * file and it opens anywhere with no other files or network access.
 */
export function renderHtmlDocument(doc: DocumentNode, options: HtmlDocumentOptions = {}): string {
  const { title, lang = "en", css = "", ...renderOptions } = options;
  const firstHeading = doc.children.find((b) => b.type === "heading");
  const resolvedTitle =
    title ?? (firstHeading && firstHeading.type === "heading" ? inlineToPlainText(firstHeading.children) : "") ?? "";
  return (
    `<!doctype html>\n<html lang="${escapeHtml(lang)}">\n<head>\n<meta charset="utf-8">\n` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">\n` +
    `<meta name="generator" content="react-markdown-studio">\n` +
    `<title>${escapeHtml(resolvedTitle || "Document")}</title>\n` +
    `<style>${STANDALONE_CSS}${css}</style>\n</head>\n<body>\n<main>\n${renderToHtml(doc, renderOptions)}\n</main>\n</body>\n</html>\n`
  );
}

/** Markdown source in, complete standalone HTML page out. */
export function markdownToHtmlDocument(
  source: string,
  options: HtmlDocumentOptions & Pick<ParseOptions, "headingIds"> = {},
): string {
  const { headingIds, ...rest } = options;
  // Only pass headingIds when set: an explicit `undefined` would override the parser's default.
  return renderHtmlDocument(parseMarkdown(source, headingIds === undefined ? {} : { headingIds }), rest);
}
