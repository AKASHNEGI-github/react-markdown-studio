import { describe, it, expect } from "vitest";
import {
  toggleBold,
  toggleItalic,
  setHeading,
  setHeadingLevel,
  toggleUnorderedList,
  toggleOrderedList,
  toggleChecklist,
  toggleBlockquote,
  insertTable,
  insertHorizontalRule,
  insertDetails,
  continueList,
} from "../src/editor/commands";
import { toggleCheckboxInMarkdown } from "../src/editor/checklist";
import { addTableRow, addTableColumn, setTableColumnAlign, findTableAt } from "../src/editor/tableHelpers";
import { parseMarkdown } from "../src/core/parser/index";
import type { EditorState } from "../src/editor/types";

function state(value: string, start: number, end = start): EditorState {
  return { value, selection: { start, end } };
}

describe("inline toggles", () => {
  it("wraps and unwraps bold around a selection", () => {
    const s1 = toggleBold(state("hello world", 0, 5));
    expect(s1.value).toBe("**hello** world");
    const s2 = toggleBold(s1);
    expect(s2.value).toBe("hello world");
  });

  it("inserts a placeholder when nothing is selected", () => {
    const s = toggleItalic(state("", 0));
    expect(s.value).toBe("*italic text*");
    expect(s.selection).toEqual({ start: 1, end: 12 });
  });
});

describe("headings", () => {
  it("sets and toggles off a heading level", () => {
    const s1 = setHeading(state("Title", 0), 2);
    expect(s1.value).toBe("## Title");
    const s2 = setHeading(s1, 2);
    expect(s2.value).toBe("Title");
  });

  it("setHeadingLevel always sets, never toggles off on repeat", () => {
    const s1 = setHeadingLevel(state("Title", 0), 2);
    const s2 = setHeadingLevel(s1, 2);
    expect(s2.value).toBe("## Title");
  });
});

describe("lists", () => {
  it("converts a plain block to an unordered list and back", () => {
    const s1 = toggleUnorderedList(state("a\nb\nc", 0, 5));
    expect(s1.value).toBe("- a\n- b\n- c");
    const s2 = toggleUnorderedList(s1);
    expect(s2.value).toBe("a\nb\nc");
  });

  it("numbers an ordered list sequentially", () => {
    const s1 = toggleOrderedList(state("a\nb\nc", 0, 5));
    expect(s1.value).toBe("1. a\n2. b\n3. c");
  });

  it("switches an unordered list to a checklist", () => {
    const s1 = toggleUnorderedList(state("a\nb", 0, 3));
    const s2 = toggleChecklist(s1);
    expect(s2.value).toBe("- [ ] a\n- [ ] b");
  });
});

describe("blockquote", () => {
  it("quotes and unquotes multiple lines", () => {
    const s1 = toggleBlockquote(state("a\nb", 0, 3));
    expect(s1.value).toBe("> a\n> b");
    const s2 = toggleBlockquote(s1);
    expect(s2.value).toBe("a\nb");
  });
});

describe("horizontal rule", () => {
  it("inserts with a leading blank line, and no trailing newlines at end of document", () => {
    const s = insertHorizontalRule(state("before", 6));
    expect(s.value).toBe("before\n\n---");
  });
});

describe("table insert", () => {
  it("builds a table with the right row/column counts", () => {
    const s = insertTable(state("", 0), 2, 3);
    const lines = s.value.split("\n");
    expect(lines).toHaveLength(4); // header + delimiter + 2 rows
    expect(lines[0].split("|").length - 1).toBe(3 + 1); // 3 cols -> 4 pipe segments incl. outer
  });
});

describe("continueList (Enter key)", () => {
  it("continues an unordered list item", () => {
    const value = "- one";
    const next = continueList(state(value, value.length));
    expect(next?.value).toBe("- one\n- ");
  });

  it("exits the list on an empty item", () => {
    const value = "- one\n- ";
    const next = continueList(state(value, value.length));
    expect(next?.value).toBe("- one\n");
  });

  it("increments ordered list numbers", () => {
    const value = "5. five";
    const next = continueList(state(value, value.length));
    expect(next?.value).toBe("5. five\n6. ");
  });

  it("returns null outside a list line", () => {
    const value = "just text";
    expect(continueList(state(value, value.length))).toBeNull();
  });
});

describe("checklist toggling in raw markdown", () => {
  it("flips the nth checkbox in document order", () => {
    const md = "- [ ] a\n- [x] b\n  - [ ] nested\n- [ ] c";
    const out = toggleCheckboxInMarkdown(md, 2); // "nested" is 3rd checkbox (index 2)
    expect(out).toBe("- [ ] a\n- [x] b\n  - [x] nested\n- [ ] c");
  });

  it("ignores task-looking lines inside fenced code blocks", () => {
    const md = "- [ ] a\n\n```md\n- [ ] not a task\n```\n\n- [ ] b";
    // index 1 is "b", not the line inside the fence
    expect(toggleCheckboxInMarkdown(md, 1)).toBe("- [ ] a\n\n```md\n- [ ] not a task\n```\n\n- [x] b");
  });

  it("ignores tilde fences and handles longer closing fences", () => {
    const md = "~~~\n- [ ] x\n~~~~\n- [ ] real";
    expect(toggleCheckboxInMarkdown(md, 0)).toBe("~~~\n- [ ] x\n~~~~\n- [x] real");
  });

  it("finds checklist items nested in blockquotes", () => {
    const md = "- [ ] a\n> - [ ] quoted\n\n- [ ] c";
    expect(toggleCheckboxInMarkdown(md, 1)).toBe("- [ ] a\n> - [x] quoted\n\n- [ ] c");
  });

  it("respects an explicit checked value", () => {
    expect(toggleCheckboxInMarkdown("- [x] a", 0, true)).toBe("- [x] a");
    expect(toggleCheckboxInMarkdown("- [x] a", 0, false)).toBe("- [ ] a");
  });
});

describe("table helpers", () => {
  const md = "| A | B |\n| --- | --- |\n| 1 | 2 |";

  it("finds a table at a cursor position inside it", () => {
    const loc = findTableAt(md, 5);
    expect(loc).not.toBeNull();
    expect(loc!.header).toEqual(["A", "B"]);
  });

  it("adds a row", () => {
    const s = addTableRow(state(md, 5));
    expect(s.value.split("\n")).toHaveLength(4);
  });

  it("adds a column", () => {
    const s = addTableColumn(state(md, 5));
    const firstLine = s.value.split("\n")[0];
    expect(firstLine).toContain("Header 3");
  });

  it("sets column alignment", () => {
    const s = setTableColumnAlign(state(md, 5), 0, "center");
    expect(s.value.split("\n")[1]).toContain(":");
  });
});

describe("insertDetails (collapsible section)", () => {
  it("wraps a selection in a <details>/<summary> template and selects the summary label", () => {
    const s = insertDetails(state("secret plan", 0, 11));
    expect(s.value).toBe("<details>\n<summary>Click to expand</summary>\n\nsecret plan\n\n</details>");
    const label = s.value.slice(s.selection.start, s.selection.end);
    expect(label).toBe("Click to expand");
  });

  it("falls back to placeholder body text when nothing is selected", () => {
    const s = insertDetails(state("", 0));
    expect(s.value).toContain("Details content goes here.");
  });

  it("adds a leading blank line when inserted after existing text", () => {
    const s = insertDetails(state("before", 6));
    expect(s.value.startsWith("before\n\n<details>")).toBe(true);
  });

  it("round-trips through the parser as a details node", () => {
    const s = insertDetails(state("", 0));
    const doc = parseMarkdown(s.value);
    expect(doc.children[0].type).toBe("details");
  });
});
