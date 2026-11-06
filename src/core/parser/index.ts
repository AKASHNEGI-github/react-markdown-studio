import type { DocumentNode, ParseOptions } from "../types";
import { parseBlockList } from "./block";

export { parseInline } from "./inline";
export { parseBlockList } from "./block";

const DEFAULT_OPTIONS: Required<ParseOptions> = {
  headingIds: true,
};

/**
 * Parses a markdown string into our AST ("our flavor": practical CommonMark
 * + GFM subset, plus underline/sub/sup via whitelisted HTML, GitHub-style
 * alerts, and explicit ::: code-group blocks). See /docs/SYNTAX.md.
 */
export function parseMarkdown(source: string, options: ParseOptions = {}): DocumentNode {
  // `??` (not spread) so an explicit `undefined` never overrides a default.
  const opts: Required<ParseOptions> = { headingIds: options.headingIds ?? DEFAULT_OPTIONS.headingIds };
  const normalized = source.replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  const slugSeen = new Map<string, number>();
  const children = parseBlockList(lines, slugSeen, opts);
  return { type: "document", children };
}
