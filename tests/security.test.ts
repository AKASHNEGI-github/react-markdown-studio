import { describe, it, expect } from "vitest";
import { markdownToHtml, sanitizeUrl } from "../src/core/index";

describe("HTML whitelist", () => {
  it("only allows u, sub, and sup tags through as elements", () => {
    const html = markdownToHtml("<u>ok</u> <sub>ok</sub> <sup>ok</sup>");
    expect(html).toContain("<u>ok</u>");
    expect(html).toContain("<sub>ok</sub>");
    expect(html).toContain("<sup>ok</sup>");
  });

  it("never emits a script tag from user input", () => {
    const html = markdownToHtml("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
  });

  it("escapes disallowed tags like img/onerror as literal text", () => {
    const html = markdownToHtml('<img src=x onerror="alert(1)">');
    expect(html).not.toContain("<img src=x onerror");
    expect(html).toContain("&lt;img");
  });

  it("escapes a raw div from user input (only our own wrapper div is real)", () => {
    const html = markdownToHtml('<div class="x">hi</div>');
    expect(html).not.toContain('<div class="x">');
    expect(html).toContain("&lt;div");
  });
});

describe("URL sanitizing", () => {
  it("blocks javascript: URLs in links", () => {
    const html = markdownToHtml("[click me](javascript:alert(1))");
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('href="#"');
  });

  it("blocks data: URLs in images", () => {
    const html = markdownToHtml("![x](data:text/html;base64,PHNjcmlwdD4=)");
    expect(html).not.toContain('src="data:');
  });

  it("allows https and mailto URLs", () => {
    const html = markdownToHtml("[a](https://example.com) [b](mailto:test@example.com)");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('href="mailto:test@example.com"');
  });

  it("allows relative and anchor URLs", () => {
    const html = markdownToHtml("[a](/path) [b](#section)");
    expect(html).toContain('href="/path"');
    expect(html).toContain('href="#section"');
  });

  it("blocks javascript: URLs obfuscated with an embedded tab, end to end", () => {
    // A literal tab survives markdown's inline URL parsing unmodified
    // (unlike a space, which ends the URL), so this exercises the real
    // link syntax exactly as a person could type or paste it.
    const html = markdownToHtml("[click me](java\tscript:alert(1))");
    expect(html).not.toContain("javascript:");
    expect(html).toContain('href="#"');
  });

  it("sanitizeUrl strips embedded tab/newline/CR before checking the scheme", () => {
    // Browsers strip ASCII tab/newline/CR from a URL — including from the
    // middle of it — before parsing its scheme, so "java\tscript:" still
    // runs as javascript: even though a naive regex wouldn't recognize
    // "java\tscript" as that scheme. Covering each control character, and
    // one split across several of them, directly against sanitizeUrl
    // (rather than only through the full markdown pipeline, where a literal
    // newline would first be collapsed to a space by paragraph joining
    // before it ever reached URL parsing).
    expect(sanitizeUrl("java\tscript:alert(1)")).toBe("#");
    expect(sanitizeUrl("java\nscript:alert(1)")).toBe("#");
    expect(sanitizeUrl("java\rscript:alert(1)")).toBe("#");
    expect(sanitizeUrl("j\na\tv\ra\tscript:alert(1)")).toBe("#");
    // Sanity check: stripping must not itself create a false positive.
    expect(sanitizeUrl("https://example.com/a\tb")).toBe("https://example.com/ab");
  });
});

describe("escaping in text content", () => {
  it("escapes angle brackets and ampersands in plain text", () => {
    const html = markdownToHtml("1 < 2 & 3 > 1");
    expect(html).toContain("&lt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("&gt;");
  });

  it("escapes html-looking content inside code spans", () => {
    const html = markdownToHtml("`<script>`");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });
});

describe("details (collapsible sections)", () => {
  it("renders <details>/<summary> with our classes", () => {
    const html = markdownToHtml("<details>\n<summary>Click to expand</summary>\n\nHidden body.\n\n</details>");
    expect(html).toContain('<details class="rmds-details">');
    expect(html).toContain('<summary class="rmds-summary">Click to expand</summary>');
    expect(html).toContain("Hidden body.");
  });

  it("renders the open attribute for <details open>", () => {
    const html = markdownToHtml("<details open>\n<summary>x</summary>\n\ny\n\n</details>");
    expect(html).toContain('<details class="rmds-details" open>');
  });

  it("escapes disallowed HTML injected into the summary text", () => {
    const html = markdownToHtml("<details>\n<summary><script>alert(1)</script></summary>\n\nbody\n\n</details>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("a bare <details> tag inline in a paragraph is escaped, not rendered", () => {
    const html = markdownToHtml("prefix <details> suffix");
    expect(html).not.toContain("<details class");
    expect(html).toContain("&lt;details&gt;");
  });
});

describe("copy button in the static HTML export", () => {
  it("wires up copy buttons via a single delegated script, never an inline handler", () => {
    const html = markdownToHtml("```js\nconsole.log(1);\n```");
    expect(html).toContain("data-rmds-copy");
    expect(html).not.toContain("onclick=");
    expect(html).toContain("addEventListener('click'");
    expect(html).toContain("__rmdsCopyInit");
  });

  it("does not emit the copy script when there is no code block", () => {
    const html = markdownToHtml("just a paragraph, no code here");
    expect(html).not.toContain("data-rmds-copy");
    expect(html).not.toContain("__rmdsCopyInit");
  });

  it("emits exactly one copy script even with multiple code blocks and a code group", () => {
    const md = "```js\na();\n```\n\n::: code-group\n```js [JS]\nb();\n```\n```c [C]\nc();\n```\n:::";
    const html = markdownToHtml(md);
    // The code-group itself also emits its own small script (for tab
    // switching) — that's expected and unrelated. What must stay singular
    // is the shared copy-button delegation script's one-time init guard.
    const guardMatches = html.match(/if\(window\.__rmdsCopyInit\)return;/g) ?? [];
    expect(guardMatches.length).toBe(1);
    // 3 rendered copy buttons (1 standalone + 2 code-group panels). The
    // script's own `[data-rmds-copy]` selector string also contains the
    // substring "data-rmds-copy", so count button elements, not substrings.
    expect((html.match(/class="rmds-copy-btn" data-rmds-copy/g) ?? []).length).toBe(3);
  });
});
