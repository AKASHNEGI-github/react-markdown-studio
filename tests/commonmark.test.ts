import { describe, expect, it } from "vitest";
import { inline, render } from "./helpers";

describe("emphasis follows CommonMark flanking rules (regression: naive first-closer matching)", () => {
  const cases: [string, string][] = [
    ["2 * 3 * 4", "2 * 3 * 4"],
    ["a * b", "a * b"],
    ["*a **b** c*", "<em>a <strong>b</strong> c</em>"],
    ["**bold *it* more**", "<strong>bold <em>it</em> more</strong>"],
    ["***both***", "<em><strong>both</strong></em>"],
    ["**Hello, *world*!**", "<strong>Hello, <em>world</em>!</strong>"],
    ["_a_ and __b__", "<em>a</em> and <strong>b</strong>"],
    ["snake_case_word", "snake_case_word"],
    ["__init__.py", "<strong>init</strong>.py"],
    ["*foo*bar", "<em>foo</em>bar"],
    ["foo*bar*", "foo<em>bar</em>"],
    ["5*3*2", "5<em>3</em>2"],
    ["*`x`*", "<em><code>x</code></em>"],
    ["~~gone~~", "<del>gone</del>"],
    ["a ~~ b ~~ c", "a ~~ b ~~ c"],
    ["~~a **b** c~~", "<del>a <strong>b</strong> c</del>"],
    ["\\*not em\\*", "*not em*"],
    ["**a**b", "<strong>a</strong>b"],
  ];
  for (const [src, html] of cases) it(JSON.stringify(src), () => expect(inline(src)).toBe(html));

  it("handles emoji and CJK punctuation neighbours", () => {
    expect(inline("**强调**文字")).toBe("<strong>强调</strong>文字");
    expect(inline("😀*x*😀")).toBe("😀<em>x</em>😀");
  });
});

describe("GFM bare-URL autolinks", () => {
  it("links http(s):// and www. URLs", () => {
    expect(inline("see https://example.com now")).toBe('see <a href="https://example.com">https://example.com</a> now');
    expect(inline("www.example.com")).toBe('<a href="http://www.example.com">www.example.com</a>');
  });
  it("excludes trailing punctuation", () => {
    expect(inline("go to https://ex.com.")).toBe('go to <a href="https://ex.com">https://ex.com</a>.');
    expect(inline("(https://ex.com/a)")).toBe('(<a href="https://ex.com/a">https://ex.com/a</a>)');
  });
  it("keeps balanced parentheses that are part of the URL", () => {
    expect(inline("https://en.wikipedia.org/wiki/Foo_(bar)")).toContain(
      'href="https://en.wikipedia.org/wiki/Foo_(bar)"',
    );
  });
  it("does not link inside an explicit link label, code, or mid-word", () => {
    expect((inline("[https://a.com](https://b.com)").match(/<a /g) ?? []).length).toBe(1);
    expect(inline("`https://a.com`")).not.toContain("<a ");
    expect(inline("xhttps://a.com")).not.toContain("<a ");
  });
  it("still routes autolinks through the URL sanitizer", () => {
    expect(inline("<javascript:alert(1)>")).not.toContain("<a ");
  });
});

describe("headings", () => {
  it("parses setext headings", () => {
    expect(render("Title\n=====")).toBe("<h1>Title</h1>");
    expect(render("Title\n-----")).toBe("<h2>Title</h2>");
  });
  it("keeps a horizontal rule after a blank line", () => {
    expect(render("para\n\n---")).toBe("<p>para</p>\n<hr />");
  });
  it("accepts up to three spaces of indentation", () => {
    expect(render("  ## hi")).toBe("<h2>hi</h2>");
    expect(render("    ## hi")).toContain("<p>");
  });
  it("does not treat #hashtag as a heading", () => {
    expect(render("#hashtag")).toBe("<p>#hashtag</p>");
  });
});
