import { describe, expect, it } from "vitest";
import { continueList, indentLines, outdentLines, toggleBold, toggleItalic } from "../src/editor/commands";
import { matchShortcut } from "../src/editor/shortcuts";
import { render, state } from "./helpers";

describe("bold/italic toggling understands runs of asterisks", () => {
  it("italic on bold text adds italic instead of dropping bold", () => {
    const next = toggleItalic(state("**[bold]**"));
    expect(next.value).toBe("***bold***");
  });
  it("italic on a fully selected bold span", () => {
    expect(toggleItalic(state("[**bold**]")).value).toBe("***bold***");
  });
  it("toggling italic twice round-trips", () => {
    const once = toggleItalic(state("**[bold]**"));
    expect(toggleItalic(once).value).toBe("**bold**");
  });
  it("bold on italic text adds bold", () => {
    expect(toggleBold(state("*[it]*")).value).toBe("***it***");
  });
  it("bold off from bold+italic leaves italic", () => {
    expect(toggleBold(state("***[x]***")).value).toBe("*x*");
  });
  it("plain wrap/unwrap still works", () => {
    expect(toggleBold(state("[x]")).value).toBe("**x**");
    expect(toggleBold(state("**[x]**")).value).toBe("x");
    expect(toggleItalic(state("*[x]*")).value).toBe("x");
    expect(toggleItalic(state("|")).value).toBe("*italic text*");
  });
});

describe("Tab / Shift+Tab in lists", () => {
  it("nests numbered items under the marker width, producing a real nested list", () => {
    const next = indentLines(state("1. a\n2. [b]"));
    expect(next.value).toBe("1. a\n   2. b");
    expect(render(next.value)).toMatch(/<ol[^>]*>.*<ol/s);
  });
  it("nests bullets under 2 spaces", () => {
    expect(indentLines(state("- a\n- [b]")).value).toBe("- a\n  - b");
  });
  it("nests a bullet under a numbered parent with 3 spaces", () => {
    const next = indentLines(state("1. a\n- [b]"));
    expect(next.value).toBe("1. a\n   - b");
    expect(render(next.value)).toMatch(/<ol[^>]*>.*<ul/s);
  });
  it("uses a wider marker for 10+", () => {
    expect(indentLines(state("10. a\n11. [b]")).value).toBe("10. a\n    11. b");
  });
  it("outdent returns a nested item to its parent's indentation", () => {
    expect(outdentLines(state("1. a\n   - [b]")).value).toBe("1. a\n- b");
    expect(outdentLines(state("- a\n  - [b]")).value).toBe("- a\n- b");
  });
  it("indents plain text by two spaces as before", () => {
    expect(indentLines(state("[hello]")).value).toBe("  hello");
  });
  it("applies one shift to every selected line", () => {
    expect(indentLines(state("1. a\n[2. b\n3. c]")).value).toBe("1. a\n   2. b\n   3. c");
  });
});

describe("keyboard shortcuts work with Shift and on any layout (regression: e.key is the shifted symbol)", () => {
  const press = (key: string, code: string, extra = {}) =>
    matchShortcut({ key, code, ctrlKey: true, metaKey: false, shiftKey: true, altKey: false, ...extra });
  it("Ctrl+Shift+7/8/9/. on a US layout", () => {
    expect(press("&", "Digit7")).toBe("orderedList");
    expect(press("*", "Digit8")).toBe("unorderedList");
    expect(press("(", "Digit9")).toBe("checklist");
    expect(press(">", "Period")).toBe("blockquote");
  });
  it("Ctrl+1 on a layout where the digit row needs Shift (AZERTY)", () => {
    expect(press("&", "Digit1", { shiftKey: false })).toBe("heading1");
  });
  it("still matches by key when no code is provided", () => {
    expect(matchShortcut({ key: "b", ctrlKey: true, metaKey: false, shiftKey: false, altKey: false })).toBe("bold");
  });
  it("letters follow the printed key, not the physical one", () => {
    expect(
      matchShortcut({ key: "z", code: "KeyW", ctrlKey: true, metaKey: false, shiftKey: false, altKey: false }),
    ).toBe("undo");
  });
});

describe("Enter continues blockquotes", () => {
  it("continues a quote and exits on an empty one", () => {
    expect(continueList(state("> hello|"))?.value).toBe("> hello\n> ");
    expect(continueList(state("> [!NOTE]|"))?.value).toBe("> [!NOTE]\n> ");
    expect(continueList(state("> > deep|"))?.value).toBe("> > deep\n> > ");
    expect(continueList(state("> |"))?.value).toBe("");
  });
});
