import { describe, expect, it } from "vitest";
import { enhanceHtml, markdownToHtml, parseMarkdown, renderToHtml, sanitizeUrl } from "../src/core";
import { elapsed, render } from "./helpers";

const SAFE = new Set(["http:", "https:", "mailto:"]);
const protocolOf = (u: string) => new URL(u === "" ? "x" : u, "https://site.example/").protocol;

describe("sanitizeUrl: matches what a browser's URL parser will do", () => {
  const payloads = [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "java\tscript:alert(1)",
    "vbscript:msgbox(1)",
    "data:text/html,<script>alert(1)</script>",
  ];

  it("neutralises every leading C0 control character or space (regression: \\u0001javascript:)", () => {
    for (let code = 0; code <= 0x20; code++) {
      for (const payload of payloads) {
        const out = sanitizeUrl(String.fromCharCode(code) + payload);
        expect(SAFE.has(protocolOf(out)), `U+${code.toString(16)} + ${payload} -> ${JSON.stringify(out)}`).toBe(true);
      }
    }
  });

  it("neutralises trailing/embedded control characters and unicode whitespace", () => {
    expect(SAFE.has(protocolOf(sanitizeUrl("javascript:alert(1)\u0001")))).toBe(true);
    expect(SAFE.has(protocolOf(sanitizeUrl("\u00a0javascript:alert(1)")))).toBe(true);
    expect(SAFE.has(protocolOf(sanitizeUrl("java\nscript:alert(1)")))).toBe(true);
    expect(SAFE.has(protocolOf(sanitizeUrl("\\\\javascript:alert(1)")))).toBe(true);
  });

  it("keeps legitimate URLs untouched", () => {
    for (const ok of [
      "https://a.com/x?y=1#z",
      "http://localhost:3000",
      "/docs/a",
      "#top",
      "../up",
      "page.html",
      "mailto:a@b.co",
      "?q=1",
    ]) {
      expect(sanitizeUrl(ok)).toBe(ok);
    }
  });

  it("renders a hostile link as an inert anchor", () => {
    const html = markdownToHtml("[click](\u0001javascript:alert(document.domain))");
    expect(html).not.toMatch(/javascript/i);
    expect(html).toContain('href="#"');
  });
});

describe("parser stays fast on hostile input (regression: quadratic blow-ups)", () => {
  const LIMIT_MS = 2000; // measured: tens of milliseconds; old parser: 6 to 20 seconds
  const cases: Record<string, string> = {
    "unclosed [": "[a ".repeat(40_000),
    "unclosed ![": "![a ".repeat(40_000),
    "unclosed <u>": "<u>a ".repeat(40_000),
    "[a]( chain": "[a](".repeat(40_000),
    "title quote chain": '[a](b "'.repeat(40_000),
    "unclosed ~~": "~~a ".repeat(40_000),
    "mixed delimiters": "*a _b ".repeat(40_000),
    "dangling **": "**a *".repeat(40_000),
    "many bare urls": "http://a.b ".repeat(40_000),
  };
  for (const [name, input] of Object.entries(cases)) {
    it(name, () => {
      expect(elapsed(() => markdownToHtml(input))).toBeLessThan(LIMIT_MS);
    });
  }
});

describe("parser never overflows the stack (regression: RangeError on deep nesting)", () => {
  const cases: Record<string, string> = {
    "nested blockquotes": ">".repeat(5000) + " x",
    "nested list items": Array.from({ length: 1500 }, (_, i) => " ".repeat(i * 2) + "- x").join("\n"),
    "nested details": "<details>\n".repeat(3000) + "x\n" + "</details>\n".repeat(3000),
    "nested link labels": "[".repeat(3000) + "x" + "](u)".repeat(3000),
    "nested emphasis": "*a ".repeat(3000) + "x" + " a*".repeat(3000),
    "nested <u> tags": "<u>".repeat(5000) + "x" + "</u>".repeat(5000),
    "nested alerts": "> ".repeat(2000) + "[!NOTE]\n> x",
  };
  for (const [name, input] of Object.entries(cases)) {
    it(name, () => {
      expect(() => markdownToHtml(input)).not.toThrow();
    });
  }

  it("degrades past the limit to readable text instead of dropping content", () => {
    const html = markdownToHtml(">".repeat(100) + " still here");
    expect(html).toContain("still here");
  });
});

describe("CSP-safe rendering", () => {
  const md = ":::code-group\n```js [a.js]\n1\n```\n```py [b.py]\n2\n```\n:::\n\n```ts\nconst x = 1;\n```";

  it("emits inline scripts by default (backwards compatible)", () => {
    expect(markdownToHtml(md)).toContain("<script>");
  });

  it("emits no <script> at all with scripts: false", () => {
    const html = markdownToHtml(md, undefined, { scripts: false });
    expect(html).not.toMatch(/<script/i);
    expect(html).toContain("rmds-code-group-tab");
    expect(html).toContain("data-rmds-copy");
  });

  it("exports the enhanceHtml helper for strict-CSP hosts", () => {
    expect(typeof enhanceHtml).toBe("function");
  });
});

describe("heading id prefix (DOM-clobbering defence)", () => {
  it("prefixes ids and anchors consistently", () => {
    const html = renderToHtml(parseMarkdown("# Config\n"), { headingIdPrefix: "user-content-" });
    expect(html).toContain('id="user-content-config"');
    expect(html).toContain('href="#user-content-config"');
  });
  it("is off by default", () => {
    expect(renderToHtml(parseMarkdown("# Config\n"))).toContain('id="config"');
  });
});

describe("code titles", () => {
  it("shows the title bar on a standalone block", () => {
    expect(render("```js [app.js]\nx\n```")).toContain(">app.js</div>");
  });
  it("does not duplicate the title inside a code group (the tab already shows it)", () => {
    const html = markdownToHtml(":::code-group\n```js [app.js]\nx\n```\n:::", undefined, { scripts: false });
    expect((html.match(/app\.js/g) ?? []).length).toBe(1);
  });
});

describe("parseMarkdown output is plain data", () => {
  it("is JSON-serialisable", () => {
    const doc = parseMarkdown("# a\n\n*b* **c** [d](https://e.f)\n");
    expect(JSON.parse(JSON.stringify(doc))).toEqual(doc);
  });
});

describe("headingOffset in the HTML renderer", () => {
  const offset = (headingOffset: number | undefined) =>
    renderToHtml(parseMarkdown("# T\n\n###### Six\n"), { headingOffset });
  it("shifts tags and clamps at h6", () => {
    expect(offset(1)).toMatch(/<h2[^>]*rmds-h1/);
    expect(offset(1)).toMatch(/<h6[^>]*rmds-h6/);
    expect(offset(5)).toMatch(/<h6[^>]*rmds-h1/);
  });
  it("treats invalid offsets as 0", () => {
    for (const bad of [undefined, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(offset(bad as number)).toMatch(/<h1[^>]*rmds-h1/);
    }
  });
  it("renders the anchor without text content", () => {
    expect(renderToHtml(parseMarkdown("# T"))).toMatch(/rmds-heading-anchor"[^>]*><\/a>/);
  });
});
