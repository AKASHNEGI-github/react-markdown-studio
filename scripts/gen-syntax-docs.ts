/**
 * Generates docs/SYNTAX.md from the same SYNTAX_REFERENCE data that powers the
 * in-editor help and the website, so the written guide cannot drift from the
 * parser. Run `npm run docs:syntax` to regenerate and `npm run docs:check` in
 * CI to fail if the committed file is stale.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { SYNTAX_REFERENCE, type SyntaxCategory } from "../src/editor/syntaxReference";

const check = process.argv.includes("--check");
const target = new URL("../docs/SYNTAX.md", import.meta.url);

const categories = Array.from(new Set(SYNTAX_REFERENCE.map((e) => e.category))) as SyntaxCategory[];
const fence = (code: string) => {
  const longest = Math.max(2, ...(code.match(/`+/g) ?? []).map((r) => r.length));
  const f = "`".repeat(longest + 1);
  return `${f}markdown\n${code}\n${f}`;
};

let md = `# Markdown syntax guide

<!-- GENERATED FILE: edit src/editor/syntaxReference.ts, then run \`npm run docs:syntax\`. -->

React Markdown Studio understands a practical subset of CommonMark and GitHub-Flavored Markdown, plus GitHub-style alerts, collapsible sections and tabbed code groups. Every example below is rendered by the real parser in the test suite, so this page is guaranteed to match the editor. See it live with rendered output on the [website](https://akashnegi-github.github.io/react-markdown-studio/#syntax).

On macOS, use ⌘ wherever a shortcut says Ctrl.
`;

for (const category of categories) {
  md += `\n## ${category}\n`;
  for (const e of SYNTAX_REFERENCE.filter((x) => x.category === category)) {
    md += `\n### ${e.name}\n\n${e.description}${e.shortcut ? ` Shortcut: **${e.shortcut}**.` : ""}\n\n${fence(e.syntax)}\n`;
  }
}

md += `
## Not supported (yet)

These are deliberately out of scope for a zero-dependency core. They are shown as plain text rather than half-rendered:

- Raw HTML, other than \`<u>\`, \`<sub>\`, \`<sup>\`, \`<details>\` and \`<summary>\` (this is a security feature)
- Footnotes, reference-style links and definition lists
- Indented (4-space) code blocks. Use fenced blocks
- Math (KaTeX/MathJax) and diagrams (Mermaid)
- Emoji shortcodes such as \`:smile:\`. Type the emoji directly

## Security notes

- Link and image URLs are limited to \`http:\`, \`https:\`, \`mailto:\` and relative URLs; everything else becomes \`#\`.
- Parsing is linear-time and depth-limited, so hostile input cannot hang or crash a page or server.
`;

if (check) {
  const current = readFileSync(target, "utf8");
  if (current !== md) {
    console.error("docs/SYNTAX.md is out of date. Run: npm run docs:syntax");
    process.exit(1);
  }
  console.log("docs/SYNTAX.md is up to date");
} else {
  writeFileSync(target, md);
  console.log(`wrote docs/SYNTAX.md (${SYNTAX_REFERENCE.length} entries)`);
}
