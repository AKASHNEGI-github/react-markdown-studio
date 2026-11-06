export * from "./types";
export { parseMarkdown, parseInline, parseBlockList } from "./parser/index";
export { renderToHtml, type RenderOptions } from "./render/toHtml";
export { enhanceHtml } from "./render/enhance";
export { renderHtmlDocument, markdownToHtmlDocument, type HtmlDocumentOptions } from "./render/document";
export { escapeHtml, sanitizeUrl, slugify, inlineToPlainText } from "./utils";
export { supportedLanguages, isLanguageSupported, type Highlighter, type Token } from "../highlighter/index";

import { parseMarkdown } from "./parser/index";
import { renderToHtml, type RenderOptions } from "./render/toHtml";
import type { ParseOptions } from "./types";

/**
 * Convenience one-shot: markdown source -> HTML string. Equivalent to
 * `renderToHtml(parseMarkdown(source, parseOptions), renderOptions)`.
 * Works in Node (SSR) and the browser; no DOM required.
 */
export function markdownToHtml(source: string, parseOptions?: ParseOptions, renderOptions?: RenderOptions): string {
  return renderToHtml(parseMarkdown(source, parseOptions), renderOptions);
}
