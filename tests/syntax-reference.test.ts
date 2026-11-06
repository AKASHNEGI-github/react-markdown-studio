import { describe, expect, it } from "vitest";
import { SYNTAX_REFERENCE, helpEntries } from "../src/editor/syntaxReference";
import { markdownToHtml } from "../src/core";

/**
 * Every example in the documentation is rendered through the real parser and
 * must produce the element its description promises. If someone changes the
 * parser (or an example) so they disagree, this fails, so the docs and the
 * in-editor help can never silently drift from what the editor really does.
 */
const EXPECTED: Record<string, RegExp> = {
  bold: /<strong[^>]*>bold text<\/strong>/,
  italic: /<em[^>]*>italic text<\/em>/,
  "bold-italic": /<em[^>]*><strong[^>]*>bold and italic<\/strong><\/em>/,
  strikethrough: /<del[^>]*>no longer true<\/del>/,
  underline: /<u[^>]*>underlined<\/u>/,
  subscript: /H<sub[^>]*>2<\/sub>O/,
  superscript: /mc<sup[^>]*>2<\/sup>/,
  "inline-code": /<code[^>]*>npm install<\/code>/,
  escape: />\*not italic\*</,
  "hard-break": /first line<br\s*\/?>\s*second line/,
  headings: /<h1[^>]*>.*Heading 1[\s\S]*<h2[^>]*>.*Heading 2[\s\S]*<h3[^>]*>.*Heading 3/,
  setext: /<h1[^>]*>.*Title[\s\S]*<h2[^>]*>.*Subtitle/,
  hr: /<hr/,
  blockquote: /<blockquote[^>]*>[\s\S]*Simplicity/,
  table: /<th[^>]*style="text-align:\s*center"|<th[^>]*align="center"|text-align:\s*center/,
  "unordered-list": /<ul[^>]*>[\s\S]*<ul[^>]*>[\s\S]*Nested/,
  "ordered-list": /<ol[^>]*>[\s\S]*<ol[^>]*>[\s\S]*Nested/,
  checklist: /type="checkbox"[^>]*checked[\s\S]*type="checkbox"(?![^>]*checked)/,
  "code-block": /rmds-code-block[\s\S]*rmds-tok-keyword/,
  "code-title": /rmds-code-title[^>]*>greet\.ts</,
  "code-group": /rmds-code-group-tab[^>]*>npm<[\s\S]*pnpm<[\s\S]*yarn</,
  link: /<a [^>]*href="https:\/\/github\.com\/AKASHNEGI-github\/react-markdown-studio"[^>]*title="Project home"/,
  autolink: /<a [^>]*href="https:\/\/example\.com"[\s\S]*<a [^>]*href="http:\/\/www\.example\.org"/,
  image: /<img [^>]*src="\.\/logo\.svg"/,
  alerts: /rmds-alert-note[\s\S]*rmds-alert-warning/,
  details: /<details[\s\S]*<summary[^>]*>Click to expand/,
};

describe("syntax reference (docs, website and in-editor help share this data)", () => {
  it("has unique ids and an expectation for every entry", () => {
    const ids = SYNTAX_REFERENCE.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.filter((id) => !(id in EXPECTED))).toEqual([]);
    expect(Object.keys(EXPECTED).filter((id) => !ids.includes(id))).toEqual([]);
  });

  for (const entry of SYNTAX_REFERENCE) {
    it(`"${entry.name}" example renders as described`, () => {
      const html = markdownToHtml(entry.syntax, undefined, { scripts: false });
      expect(html).toMatch(EXPECTED[entry.id]);
    });
  }

  it("feeds the compact in-editor help", () => {
    const rows = helpEntries();
    expect(rows.length).toBeGreaterThanOrEqual(18);
    expect(rows.every((r) => r.syntax && r.label)).toBe(true);
    expect(rows.map((r) => r.label)).toContain("Tabbed code group");
  });
});
