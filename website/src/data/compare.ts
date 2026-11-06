/**
 * Snapshot of public npm registry metadata (4 November 2026). Sizes are the
 * published tarball's unpacked size and exclude dependencies. Numbers for this
 * package are filled in at build time from the real tarball (see facts.json).
 */
export interface CompareRow {
  name: string;
  kind: string;
  deps: number;
  unpackedKB: number | null; // null = use this package's own build-time fact
  updated: string;
}

export const OTHERS: CompareRow[] = [
  { name: "@uiw/react-md-editor", kind: "Source + preview", deps: 4, unpackedKB: 4286, updated: "Nov 2026" },
  { name: "@mdxeditor/editor", kind: "WYSIWYG", deps: 57, unpackedKB: 644, updated: "Nov 2026" },
  { name: "@milkdown/crepe", kind: "WYSIWYG", deps: 17, unpackedKB: 3413, updated: "Oct 2026" },
  { name: "react-markdown-editor-lite", kind: "Source + preview", deps: 3, unpackedKB: 483, updated: "Jan 2026" },
  { name: "react-mde", kind: "Source + preview", deps: 0, unpackedKB: 602, updated: "Jun 2022" },
  { name: "react-simplemde-editor", kind: "Source + preview", deps: 1, unpackedKB: 565, updated: "Oct 2022" },
];
