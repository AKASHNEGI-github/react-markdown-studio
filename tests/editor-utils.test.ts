import { describe, expect, it } from "vitest";
import { countWords, getCaretPosition, getTextStats } from "../src/editor/stats";
import { linkSelection, replaceText } from "../src/editor/commands";
import { state } from "./helpers";

describe("text statistics", () => {
  it("counts words, characters, lines and reading time", () => {
    expect(getTextStats("")).toEqual({ words: 0, characters: 0, lines: 1, readingMinutes: 0 });
    const s = getTextStats("one two\nthree");
    expect(s).toMatchObject({ words: 3, characters: 13, lines: 2, readingMinutes: 1 });
    expect(getTextStats("word ".repeat(450)).readingMinutes).toBe(3);
  });
  it("counts emoji as one character and CJK words sensibly", () => {
    expect(getTextStats("😀😀").characters).toBe(2);
    expect(countWords("你好世界，今天天气很好")).toBeGreaterThanOrEqual(4);
  });
  it("ignores markup-free whitespace", () => {
    expect(countWords("   \n\t ")).toBe(0);
  });
  it("computes 1-based caret positions", () => {
    const text = "ab\ncde\n\nf";
    expect(getCaretPosition(text, 0)).toEqual({ line: 1, column: 1 });
    expect(getCaretPosition(text, 2)).toEqual({ line: 1, column: 3 });
    expect(getCaretPosition(text, 3)).toEqual({ line: 2, column: 1 });
    expect(getCaretPosition(text, 6)).toEqual({ line: 2, column: 4 });
    expect(getCaretPosition(text, 7)).toEqual({ line: 3, column: 1 });
    expect(getCaretPosition(text, 99)).toEqual({ line: 4, column: 2 });
  });
});

describe("replaceText (async upload placeholders)", () => {
  it("swaps the placeholder and keeps the caret in place", () => {
    const next = replaceText(state("a *Up*|"), "*Up*", "![x](y)");
    expect(next.value).toBe("a ![x](y)");
    expect(next.selection).toEqual({ start: 9, end: 9 });
  });
  it("keeps a caret that sits before the placeholder untouched", () => {
    const next = replaceText({ value: "a *Up* b", selection: { start: 1, end: 1 } }, "*Up*", "LONGER");
    expect(next.selection).toEqual({ start: 1, end: 1 });
  });
  it("does nothing when the user deleted the placeholder", () => {
    const s = state("hello|");
    expect(replaceText(s, "*Up*", "x")).toBe(s);
  });
  it("can remove a placeholder", () => {
    expect(replaceText(state("a *Up* b|"), "*Up* ", "").value).toBe("a b");
  });
});

describe("linkSelection", () => {
  it("wraps the selection and parks the caret after the link", () => {
    const next = linkSelection(state("see [docs] here"), "https://x.com");
    expect(next.value).toBe("see [docs](https://x.com) here");
    expect(next.selection.start).toBe(next.selection.end);
    expect(next.value.slice(next.selection.start)).toBe(" here");
  });
});
