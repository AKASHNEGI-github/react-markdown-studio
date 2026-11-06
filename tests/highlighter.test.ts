import { describe, it, expect } from "vitest";
import { highlight, isLanguageSupported, supportedLanguages } from "../src/highlighter/index";

describe("highlighter", () => {
  it("lists a reasonable number of supported languages", () => {
    const langs = supportedLanguages();
    expect(langs.length).toBeGreaterThanOrEqual(15);
    expect(langs.map((l) => l.value)).toContain("js");
    expect(langs.map((l) => l.value)).toContain("py");
  });

  it("recognizes common aliases", () => {
    expect(isLanguageSupported("ts")).toBe(true);
    expect(isLanguageSupported("c++")).toBe(true);
    expect(isLanguageSupported("totally-unknown-lang")).toBe(false);
  });

  it("classifies JS keywords, strings, and comments", () => {
    const tokens = highlight('const a = "hi"; // comment', "js");
    const types = tokens.map((t) => t.type);
    expect(types).toContain("keyword");
    expect(types).toContain("string");
    expect(types).toContain("comment");
  });

  it("classifies a called identifier as a function", () => {
    const tokens = highlight("foo(1)", "js");
    const fn = tokens.find((t) => t.text === "foo");
    expect(fn?.type).toBe("function");
  });

  it("falls back to plain text for an unknown language", () => {
    const tokens = highlight("some code", "not-a-real-lang");
    expect(tokens).toEqual([{ type: "plain", text: "some code" }]);
  });

  it("tokenizes diff lines as inserted/deleted/meta", () => {
    const tokens = highlight("+added\n-removed\n@@ -1,2 +1,2 @@\nctx", "diff");
    const types = tokens.filter((t) => t.text !== "\n").map((t) => t.type);
    expect(types).toEqual(["inserted", "deleted", "meta", "plain"]);
  });

  it("tokenizes HTML tags and attributes", () => {
    const tokens = highlight('<div class="a">hi</div>', "html");
    const tagTokens = tokens.filter((t) => t.type === "tag");
    expect(tagTokens.length).toBeGreaterThan(0);
    expect(tokens.some((t) => t.type === "attr" && t.text === "class")).toBe(true);
  });

  it("never drops or duplicates characters (token text reconstructs the input exactly)", () => {
    // A strong, general invariant: no matter how a tokenizer classifies
    // things, concatenating every token's text must reproduce the input
    // byte-for-byte. This would have caught both the YAML tokenizer's
    // whitespace-slicing bug (leading+trailing whitespace confused for
    // leading-only, corrupting values like "true " into "ttrue") and the
    // HTML tokenizer's dropped whitespace between "=" and a quoted
    // attribute value.
    const samples: [string, string][] = [
      ["yaml", "key:   true   \nother: 42  \nflag:false\nname: plain value  "],
      ["yaml", 'quoted: "hi there"   # trailing comment'],
      ["html", '<input type="text"   name = "x" disabled/>'],
      ["html", '<img src="a.png"/>'],
      ["js", 'const a = "hi"; // comment\nfoo(1, 2);'],
      ["diff", "+added\n-removed\n@@ -1,2 +1,2 @@\ncontext"],
    ];
    for (const [lang, code] of samples) {
      const tokens = highlight(code, lang);
      expect(tokens.map((t) => t.text).join("")).toBe(code);
    }
  });

  it("keeps whitespace around a YAML value that also has trailing whitespace", () => {
    const tokens = highlight("flag:  true  \nother: hi", "yaml");
    expect(tokens.map((t) => t.text).join("")).toBe("flag:  true  \nother: hi");
    const bool = tokens.find((t) => t.type === "boolean");
    expect(bool?.text).toBe("true");
  });

  it("keeps whitespace between = and a quoted HTML attribute value", () => {
    const tokens = highlight('<a href = "x">', "html");
    expect(tokens.map((t) => t.text).join("")).toBe('<a href = "x">');
    const str = tokens.find((t) => t.type === "string");
    expect(str?.text).toBe('"x"');
  });
});
