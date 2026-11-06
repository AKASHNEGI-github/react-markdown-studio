import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { parseMarkdown } from "../src/core/parser/index";
import { indexChecklistItems, renderToReactElements } from "../src/core/render/toReact";
import { toggleCheckboxInMarkdown } from "../src/editor/checklist";
import type { ListItemNode, ListNode } from "../src/core/types";

const MD = "- [x] one\n- [ ] two\n  - [ ] three\n- [ ] four";

function html(options: Parameters<typeof renderToReactElements>[1]) {
  return renderToStaticMarkup(renderToReactElements(parseMarkdown(MD), options) as never);
}

describe("react checklist rendering", () => {
  it("renders disabled checkboxes unless interactive", () => {
    expect((html({}).match(/<input[^>]*disabled/g) ?? []).length).toBe(4);
    expect((html({ interactiveChecklists: true }).match(/<input[^>]*disabled/g) ?? []).length).toBe(0);
  });
});

describe("indexChecklistItems", () => {
  it("numbers checklist items in document order, including nested ones", () => {
    const doc = parseMarkdown(MD);
    const map = indexChecklistItems(doc.children, new Map<ListItemNode, number>());
    const list = doc.children[0] as ListNode;
    const top = list.items;
    expect(map.get(top[0])).toBe(0);
    expect(map.get(top[1])).toBe(1);
    const nested = (top[1].children.find((c) => c.type === "list") as ListNode).items[0];
    expect(map.get(nested)).toBe(2);
    expect(map.get(top[2])).toBe(3);
    expect(map.size).toBe(4);
  });

  it("is pure: calling it again yields the same numbering (React may render twice)", () => {
    const doc = parseMarkdown(MD);
    const a = [...indexChecklistItems(doc.children, new Map()).values()];
    const b = [...indexChecklistItems(doc.children, new Map()).values()];
    expect(a).toEqual([0, 1, 2, 3]);
    expect(b).toEqual(a);
  });

  it("agrees with toggleCheckboxInMarkdown for items inside blockquotes and around code fences", () => {
    const md = "- [ ] a\n\n```\n- [ ] code\n```\n\n> - [ ] quoted\n\n- [ ] z";
    const doc = parseMarkdown(md);
    const map = indexChecklistItems(doc.children, new Map());
    expect(map.size).toBe(3); // the line inside the fence is not a checklist item
    // Toggling index 1 must edit the quoted item, index 2 the last one.
    expect(toggleCheckboxInMarkdown(md, 1)).toContain("> - [x] quoted");
    expect(toggleCheckboxInMarkdown(md, 2)).toContain("- [x] z");
  });
});
