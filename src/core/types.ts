/**
 * AST type definitions for "our flavor" of markdown:
 * practical CommonMark + GFM subset, plus a small set of documented
 * extensions (underline/sub/sup via whitelisted HTML, code groups,
 * GitHub-style alerts). See /docs/SYNTAX.md for the full spec.
 */

export type Alignment = "left" | "center" | "right" | null;

export type AlertType = "note" | "tip" | "important" | "warning" | "caution";

// ---------------------------------------------------------------------------
// Inline nodes
// ---------------------------------------------------------------------------

export type InlineNode =
  | TextNode
  | StrongNode
  | EmphasisNode
  | StrikethroughNode
  | UnderlineNode
  | SubscriptNode
  | SuperscriptNode
  | InlineCodeNode
  | LinkNode
  | ImageNode
  | BreakNode;

export interface TextNode {
  type: "text";
  value: string;
}

export interface StrongNode {
  type: "strong";
  children: InlineNode[];
}

export interface EmphasisNode {
  type: "emphasis";
  children: InlineNode[];
}

export interface StrikethroughNode {
  type: "strikethrough";
  children: InlineNode[];
}

export interface UnderlineNode {
  type: "underline";
  children: InlineNode[];
}

export interface SubscriptNode {
  type: "subscript";
  children: InlineNode[];
}

export interface SuperscriptNode {
  type: "superscript";
  children: InlineNode[];
}

export interface InlineCodeNode {
  type: "inlineCode";
  value: string;
}

export interface LinkNode {
  type: "link";
  url: string;
  title?: string;
  children: InlineNode[];
}

export interface ImageNode {
  type: "image";
  url: string;
  alt: string;
  title?: string;
}

/** A hard line break inside a paragraph (two trailing spaces, or a trailing backslash). */
export interface BreakNode {
  type: "break";
}

// ---------------------------------------------------------------------------
// Block nodes
// ---------------------------------------------------------------------------

export type BlockNode =
  | HeadingNode
  | ParagraphNode
  | ThematicBreakNode
  | BlockquoteNode
  | ListNode
  | CodeBlockNode
  | CodeGroupNode
  | TableNode
  | HtmlAlertNode
  | DetailsNode;

export interface HeadingNode {
  type: "heading";
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineNode[];
  /** Auto-generated, GitHub-style anchor id (e.g. "#my-heading"). */
  id: string;
}

export interface ParagraphNode {
  type: "paragraph";
  children: InlineNode[];
}

export interface ThematicBreakNode {
  type: "thematicBreak";
}

/** A plain blockquote. GitHub-style alerts are a distinct node type (HtmlAlertNode). */
export interface BlockquoteNode {
  type: "blockquote";
  children: BlockNode[];
}

/** `> [!NOTE]` style GitHub alert. */
export interface HtmlAlertNode {
  type: "alert";
  alertType: AlertType;
  children: BlockNode[];
}

/**
 * GitHub-style collapsible section:
 *   <details>
 *   <summary>Click to expand</summary>
 *
 *   body...
 *   </details>
 * Only the bare `<details>` / `<details open>` and `<summary>...</summary>`
 * forms are recognized (no other attributes) — this is a block-level
 * extension of the same whitelist philosophy as the inline u/sub/sup tags.
 */
export interface DetailsNode {
  type: "details";
  summary: InlineNode[];
  open: boolean;
  children: BlockNode[];
}

export interface ListItemNode {
  children: BlockNode[];
  /** null/undefined = not a checklist item; true/false = checked state. */
  checked?: boolean | null;
}

export interface ListNode {
  type: "list";
  ordered: boolean;
  start?: number;
  /** Tight lists render item content without wrapping <p> tags. */
  tight: boolean;
  items: ListItemNode[];
}

export interface CodeBlockNode {
  type: "codeBlock";
  lang?: string;
  title?: string;
  code: string;
}

export interface CodeGroupNode {
  type: "codeGroup";
  blocks: CodeBlockNode[];
}

export interface TableNode {
  type: "table";
  align: Alignment[];
  header: InlineNode[][];
  rows: InlineNode[][][];
}

export interface DocumentNode {
  type: "document";
  children: BlockNode[];
}

// ---------------------------------------------------------------------------
// Parser options
// ---------------------------------------------------------------------------

export interface ParseOptions {
  /** Generate GitHub-style heading ids. Default true. */
  headingIds?: boolean;
}
