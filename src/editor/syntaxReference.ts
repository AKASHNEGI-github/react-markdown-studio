/**
 * The single source of truth for "what can I type?".
 *
 * Both the editor's in-app help popover and the documentation website render
 * from this list, so the guide a user sees can never drift from what the
 * parser actually supports. Every `syntax` example is rendered through the real
 * parser in the test suite, which fails if an example stops doing what its
 * description claims.
 */

export type SyntaxCategory = "Text" | "Structure" | "Lists" | "Code" | "Links & media" | "Callouts & layout";

export interface SyntaxEntry {
  id: string;
  category: SyntaxCategory;
  /** Feature name, e.g. "Bold". */
  name: string;
  /** One sentence on what it does. */
  description: string;
  /** A complete, copy-pasteable example. Rendered live on the website. */
  syntax: string;
  /** Keyboard shortcut, written for Windows/Linux ("Ctrl") with "⌘" on macOS implied. */
  shortcut?: string;
  /** Compact form shown in the in-editor help table. Defaults to the first line of `syntax`. */
  short?: string;
  /** Label shown beside `short` in the help table. Defaults to `name`. */
  helpLabel?: string;
  /** Set to false to keep an advanced entry out of the compact help popover. Default true. */
  inHelp?: boolean;
}

export const SYNTAX_REFERENCE: readonly SyntaxEntry[] = [
  // ── Text ────────────────────────────────────────────────────────────────
  {
    id: "bold",
    category: "Text",
    name: "Bold",
    description: "Make text stand out.",
    syntax: "**bold text**",
    shortcut: "Ctrl+B",
    short: "**bold**",
  },
  {
    id: "italic",
    category: "Text",
    name: "Italic",
    description: "Emphasise text. `_underscores_` work too.",
    syntax: "*italic text*",
    shortcut: "Ctrl+I",
    short: "*italic*",
  },
  {
    id: "bold-italic",
    category: "Text",
    name: "Bold and italic",
    description: "Combine both; toggling one never drops the other.",
    syntax: "***bold and italic***",
    inHelp: false,
  },
  {
    id: "strikethrough",
    category: "Text",
    name: "Strikethrough",
    description: "Cross out text.",
    syntax: "~~no longer true~~",
    shortcut: "Ctrl+Shift+X",
    short: "~~strikethrough~~",
  },
  {
    id: "underline",
    category: "Text",
    name: "Underline",
    description: "Underline text using the one HTML tag that renders.",
    syntax: "<u>underlined</u>",
    shortcut: "Ctrl+U",
  },
  {
    id: "subscript",
    category: "Text",
    name: "Subscript",
    description: "Lower the baseline, as in chemical formulas.",
    syntax: "H<sub>2</sub>O",
    short: "<sub>2</sub>",
  },
  {
    id: "superscript",
    category: "Text",
    name: "Superscript",
    description: "Raise the baseline, as in exponents.",
    syntax: "E = mc<sup>2</sup>",
    short: "<sup>2</sup>",
  },
  {
    id: "inline-code",
    category: "Text",
    name: "Inline code",
    description: "Monospace for identifiers and short snippets.",
    syntax: "Run `npm install` first.",
    shortcut: "Ctrl+E",
    short: "`code`",
  },
  {
    id: "escape",
    category: "Text",
    name: "Escaping",
    description: "A backslash shows a special character literally.",
    syntax: "\\*not italic\\*",
    inHelp: false,
  },
  {
    id: "hard-break",
    category: "Text",
    name: "Line break",
    description: "End a line with two spaces or a backslash to break without starting a new paragraph.",
    syntax: "first line\\\nsecond line",
    inHelp: false,
  },

  // ── Structure ───────────────────────────────────────────────────────────
  {
    id: "headings",
    category: "Structure",
    name: "Headings",
    description: "One to six `#` characters set the level. Each heading gets a linkable anchor.",
    syntax: "# Heading 1\n## Heading 2\n### Heading 3",
    shortcut: "Ctrl+1 / 2 / 3",
    short: "# … ######",
    helpLabel: "Heading 1–6",
  },
  {
    id: "setext",
    category: "Structure",
    name: "Underlined headings",
    description: "Underline a line with `=` or `-` for a level 1 or 2 heading.",
    syntax: "Title\n=====\n\nSubtitle\n--------",
    inHelp: false,
  },
  {
    id: "hr",
    category: "Structure",
    name: "Horizontal rule",
    description: "A thematic break between sections.",
    syntax: "---",
    helpLabel: "Horizontal rule",
  },
  {
    id: "blockquote",
    category: "Structure",
    name: "Blockquote",
    description: "Quote a passage. Press Enter to continue the quote.",
    syntax: "> Simplicity is the ultimate sophistication.\n> Leonardo da Vinci",
    shortcut: "Ctrl+Shift+.",
    short: "> quote",
    helpLabel: "Quote",
  },
  {
    id: "table",
    category: "Structure",
    name: "Table",
    description:
      "Pipes separate columns; colons in the divider row set alignment. Click inside a table for row and column tools.",
    syntax:
      "| Left | Center | Right |\n| :--- | :----: | ----: |\n| a    |   b    |     c |\n| d    |   e    |     f |",
    short: "| a | b |",
  },

  // ── Lists ───────────────────────────────────────────────────────────────
  {
    id: "unordered-list",
    category: "Lists",
    name: "Bulleted list",
    description: "Use `-`, `*` or `+`. Tab and Shift+Tab nest and un-nest items; Enter continues the list.",
    syntax: "- First\n- Second\n  - Nested",
    shortcut: "Ctrl+Shift+8",
    short: "- item",
    helpLabel: "Unordered list",
  },
  {
    id: "ordered-list",
    category: "Lists",
    name: "Numbered list",
    description: "Numbers continue automatically, and Tab nests under the correct indentation.",
    syntax: "1. First\n2. Second\n   1. Nested",
    shortcut: "Ctrl+Shift+7",
    short: "1. item",
    helpLabel: "Ordered list",
  },
  {
    id: "checklist",
    category: "Lists",
    name: "Task list",
    description: "Checkboxes you can click in the preview, which updates your Markdown.",
    syntax: "- [x] Write the docs\n- [ ] Ship the release",
    shortcut: "Ctrl+Shift+9",
    short: "- [ ] item",
    helpLabel: "Checklist",
  },

  // ── Code ────────────────────────────────────────────────────────────────
  {
    id: "code-block",
    category: "Code",
    name: "Code block",
    description:
      "Fence code with three backticks and a language for syntax highlighting. Every block has a copy button.",
    syntax: "```ts\nconst answer: number = 42;\n```",
    short: "```lang",
    helpLabel: "Code block",
  },
  {
    id: "code-title",
    category: "Code",
    name: "Code block title",
    description: "Add a title in square brackets after the language.",
    syntax: "```ts [greet.ts]\nexport const greet = (name: string) => `Hello, ${name}!`;\n```",
    inHelp: false,
  },
  {
    id: "code-group",
    category: "Code",
    name: "Tabbed code group",
    description: "Show the same snippet for several tools as tabs. Each fence's title becomes its tab.",
    syntax:
      "::: code-group\n```bash [npm]\nnpm install react-markdown-studio\n```\n```bash [pnpm]\npnpm add react-markdown-studio\n```\n```bash [yarn]\nyarn add react-markdown-studio\n```\n:::",
    short: "::: code-group",
    helpLabel: "Tabbed code group",
  },

  // ── Links & media ───────────────────────────────────────────────────────
  {
    id: "link",
    category: "Links & media",
    name: "Link",
    description:
      "Wrap the text in brackets and the URL in parentheses. Paste a URL over selected text to link it instantly.",
    syntax: '[React Markdown Studio](https://github.com/AKASHNEGI-github/react-markdown-studio "Project home")',
    shortcut: "Ctrl+K",
    short: "[text](url)",
  },
  {
    id: "autolink",
    category: "Links & media",
    name: "Automatic links",
    description: "Bare web addresses become links, with trailing punctuation handled sensibly.",
    syntax: "Visit https://example.com or www.example.org.",
    inHelp: false,
  },
  {
    id: "image",
    category: "Links & media",
    name: "Image",
    description:
      "Like a link with a leading `!`. Pass `onImageUpload` to paste or drop images straight into the editor.",
    syntax: '![Logo](./logo.svg "Optional title")',
    short: "![alt](url)",
  },

  // ── Callouts & layout ───────────────────────────────────────────────────
  {
    id: "alerts",
    category: "Callouts & layout",
    name: "Alerts",
    description: "GitHub-style callouts: NOTE, TIP, IMPORTANT, WARNING and CAUTION.",
    syntax: "> [!NOTE]\n> Useful background information.\n\n> [!WARNING]\n> Urgent: avoid doing this.",
    short: "> [!NOTE]",
    helpLabel: "Alert (also TIP, IMPORTANT, WARNING, CAUTION)",
  },
  {
    id: "details",
    category: "Callouts & layout",
    name: "Collapsible section",
    description: "A dropdown that hides detail until it is opened. Add `open` to start expanded.",
    syntax: "<details>\n<summary>Click to expand</summary>\n\nHidden until you ask for it.\n\n</details>",
    short: "<details>…</details>",
    helpLabel: "Collapsible section (dropdown)",
  },
];

/** Entries for the compact in-editor help table. */
export function helpEntries(): { syntax: string; label: string }[] {
  return SYNTAX_REFERENCE.filter((e) => e.inHelp !== false).map((e) => ({
    syntax: e.short ?? e.syntax.split("\n")[0],
    label: e.helpLabel ?? e.name,
  }));
}
