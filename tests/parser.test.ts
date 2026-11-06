import { describe, it, expect } from "vitest";
import { parseMarkdown } from "../src/core/parser/index";

describe("headings", () => {
  it("parses ATX headings 1-6 with ids", () => {
    const doc = parseMarkdown("# One\n## Two\n###### Six");
    expect(doc.children).toHaveLength(3);
    expect(doc.children[0]).toMatchObject({ type: "heading", depth: 1, id: "one" });
    expect(doc.children[1]).toMatchObject({ type: "heading", depth: 2, id: "two" });
    expect(doc.children[2]).toMatchObject({ type: "heading", depth: 6, id: "six" });
  });

  it("requires a space after the hashes", () => {
    const doc = parseMarkdown("#nospace");
    expect(doc.children[0].type).toBe("paragraph");
  });

  it("dedupes heading ids", () => {
    const doc = parseMarkdown("# Foo\n\n# Foo");
    expect((doc.children[0] as any).id).toBe("foo");
    expect((doc.children[1] as any).id).toBe("foo-1");
  });

  it("strips a trailing ATX closing sequence", () => {
    const doc = parseMarkdown("# Title ###");
    const h = doc.children[0] as any;
    expect(h.children[0].value).toBe("Title");
  });
});

describe("inline emphasis", () => {
  it("parses bold, italic, and bold+italic", () => {
    const doc = parseMarkdown("**bold** *italic* ***both***");
    const p = doc.children[0] as any;
    expect(p.children[0]).toMatchObject({ type: "strong" });
    expect(p.children[2]).toMatchObject({ type: "emphasis" });
    // CommonMark/GitHub nest triple-delimiter runs as <em><strong>…</strong></em>.
    expect(p.children[4]).toMatchObject({ type: "emphasis" });
    expect(p.children[4].children[0]).toMatchObject({ type: "strong" });
  });

  it("does not treat underscores mid-word as emphasis", () => {
    const doc = parseMarkdown("snake_case_var");
    const p = doc.children[0] as any;
    expect(p.children).toHaveLength(1);
    expect(p.children[0]).toMatchObject({ type: "text", value: "snake_case_var" });
  });

  it("parses strikethrough, underline, sub/sup", () => {
    const doc = parseMarkdown("~~gone~~ <u>under</u> X<sup>2</sup> H<sub>2</sub>O");
    const p = doc.children[0] as any;
    expect(p.children[0]).toMatchObject({ type: "strikethrough" });
    expect(p.children[2]).toMatchObject({ type: "underline" });
    const supNode = p.children.find((n: any) => n.type === "superscript");
    const subNode = p.children.find((n: any) => n.type === "subscript");
    expect(supNode).toBeTruthy();
    expect(subNode).toBeTruthy();
  });

  it("parses inline code without interpreting its contents", () => {
    const doc = parseMarkdown("`**not bold**`");
    const p = doc.children[0] as any;
    expect(p.children[0]).toMatchObject({ type: "inlineCode", value: "**not bold**" });
  });
});

describe("links and images", () => {
  it("parses a link with a title", () => {
    const doc = parseMarkdown('[text](https://example.com "a title")');
    const p = doc.children[0] as any;
    expect(p.children[0]).toMatchObject({ type: "link", url: "https://example.com", title: "a title" });
  });

  it("parses an image", () => {
    const doc = parseMarkdown("![alt text](https://example.com/a.png)");
    const p = doc.children[0] as any;
    expect(p.children[0]).toMatchObject({ type: "image", url: "https://example.com/a.png", alt: "alt text" });
  });
});

describe("lists", () => {
  it("parses a simple unordered list", () => {
    const doc = parseMarkdown("- one\n- two\n- three");
    const list = doc.children[0] as any;
    expect(list.type).toBe("list");
    expect(list.ordered).toBe(false);
    expect(list.items).toHaveLength(3);
    expect(list.tight).toBe(true);
  });

  it("parses an ordered list preserving start number", () => {
    const doc = parseMarkdown("3. three\n4. four");
    const list = doc.children[0] as any;
    expect(list.ordered).toBe(true);
    expect(list.start).toBe(3);
  });

  it("parses nested sublists", () => {
    const doc = parseMarkdown("- a\n  - nested\n- b");
    const list = doc.children[0] as any;
    expect(list.items).toHaveLength(2);
    const nested = list.items[0].children.find((c: any) => c.type === "list");
    expect(nested).toBeTruthy();
    expect(nested.items).toHaveLength(1);
  });

  it("parses checklist items", () => {
    const doc = parseMarkdown("- [ ] todo\n- [x] done");
    const list = doc.children[0] as any;
    expect(list.items[0].checked).toBe(false);
    expect(list.items[1].checked).toBe(true);
  });

  it("marks a list with a blank line between items as loose", () => {
    const doc = parseMarkdown("- one\n\n- two");
    const list = doc.children[0] as any;
    expect(list.tight).toBe(false);
  });
});

describe("tables", () => {
  it("parses header, alignment, and rows", () => {
    const doc = parseMarkdown("| A | B | C |\n| :-- | :-: | --: |\n| 1 | 2 | 3 |");
    const table = doc.children[0] as any;
    expect(table.type).toBe("table");
    expect(table.align).toEqual(["left", "center", "right"]);
    expect(table.rows).toHaveLength(1);
  });
});

describe("code blocks", () => {
  it("parses a fenced code block with language", () => {
    const doc = parseMarkdown("```js\nconst a = 1;\n```");
    const block = doc.children[0] as any;
    expect(block).toMatchObject({ type: "codeBlock", lang: "js", code: "const a = 1;" });
  });

  it("parses a code block with a title", () => {
    const doc = parseMarkdown("```js [My Title]\ncode();\n```");
    const block = doc.children[0] as any;
    expect(block).toMatchObject({ lang: "js", title: "My Title" });
  });

  it("parses a code group with multiple tabs", () => {
    const doc = parseMarkdown("::: code-group\n```js [JS]\na();\n```\n```py [Py]\nb()\n```\n:::");
    const group = doc.children[0] as any;
    expect(group.type).toBe("codeGroup");
    expect(group.blocks).toHaveLength(2);
    expect(group.blocks[0]).toMatchObject({ lang: "js", title: "JS" });
    expect(group.blocks[1]).toMatchObject({ lang: "py", title: "Py" });
  });
});

describe("alerts", () => {
  it("parses a GitHub-style alert", () => {
    const doc = parseMarkdown("> [!WARNING]\n> Be careful.");
    const alert = doc.children[0] as any;
    expect(alert.type).toBe("alert");
    expect(alert.alertType).toBe("warning");
  });

  it("treats a normal blockquote without the marker as a plain blockquote", () => {
    const doc = parseMarkdown("> just a quote");
    expect(doc.children[0].type).toBe("blockquote");
  });
});

describe("thematic break", () => {
  it("recognizes ---, ***, and ___", () => {
    const doc = parseMarkdown("---\n\n***\n\n___");
    expect(doc.children.every((c) => c.type === "thematicBreak")).toBe(true);
  });
});

describe("hard breaks", () => {
  it("turns two trailing spaces into a break node", () => {
    const doc = parseMarkdown("line one  \nline two");
    const p = doc.children[0] as any;
    expect(p.children.some((n: any) => n.type === "break")).toBe(true);
  });
});

describe("details (collapsible sections)", () => {
  it("parses a closed details block with a summary", () => {
    const doc = parseMarkdown("<details>\n<summary>Click to expand</summary>\n\nHidden body.\n\n</details>");
    expect(doc.children).toHaveLength(1);
    const details = doc.children[0] as any;
    expect(details.type).toBe("details");
    expect(details.open).toBe(false);
    expect(details.summary).toEqual([{ type: "text", value: "Click to expand" }]);
    expect(details.children).toHaveLength(1);
    expect(details.children[0].type).toBe("paragraph");
  });

  it("respects <details open>", () => {
    const doc = parseMarkdown("<details open>\n<summary>Already open</summary>\n\nBody.\n\n</details>");
    const details = doc.children[0] as any;
    expect(details.open).toBe(true);
  });

  it("defaults the summary to 'Details' when none is given", () => {
    const doc = parseMarkdown("<details>\n\nJust body content, no summary tag.\n\n</details>");
    const details = doc.children[0] as any;
    expect(details.summary).toEqual([{ type: "text", value: "Details" }]);
    expect(details.children[0].type).toBe("paragraph");
  });

  it("parses inline markdown inside the summary", () => {
    const doc = parseMarkdown("<details>\n<summary>A **bold** word</summary>\n\nBody.\n\n</details>");
    const details = doc.children[0] as any;
    expect(details.summary.some((n: any) => n.type === "strong")).toBe(true);
  });

  it("supports block content inside, including nested lists and code blocks", () => {
    const md = "<details>\n<summary>Steps</summary>\n\n- one\n- two\n\n```js\nconsole.log(1);\n```\n\n</details>";
    const doc = parseMarkdown(md);
    const details = doc.children[0] as any;
    expect(details.children.map((c: any) => c.type)).toEqual(["list", "codeBlock"]);
  });

  it("supports nested details blocks", () => {
    const md =
      "<details>\n<summary>Outer</summary>\n\n<details>\n<summary>Inner</summary>\n\nInner body.\n\n</details>\n\n</details>";
    const doc = parseMarkdown(md);
    const outer = doc.children[0] as any;
    expect(outer.type).toBe("details");
    const inner = outer.children.find((c: any) => c.type === "details");
    expect(inner).toBeTruthy();
    expect(inner.summary).toEqual([{ type: "text", value: "Inner" }]);
  });

  it("does not treat a <details> tag with extra attributes as a block start", () => {
    const doc = parseMarkdown('<details class="x">\nnot a real block\n</details>');
    // Falls through to an ordinary (escaped) paragraph, consistent with the
    // inline HTML whitelist's "exact match only" rule.
    expect(doc.children[0].type).toBe("paragraph");
  });
});
