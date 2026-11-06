import { useEffect, type RefObject } from "react";

const ITEM_SELECTOR = "button:not([disabled])";

/**
 * Turns a container of buttons into a single tab stop with arrow-key
 * navigation, as the WAI-ARIA toolbar pattern requires: Tab enters the toolbar
 * once, Left/Right (and Home/End) move between its controls, and Tab leaves.
 * Without this, a 25-button toolbar costs keyboard users 25 Tab presses to
 * cross.
 *
 * It manages only the `tabindex` attribute of the buttons, via the DOM, so it
 * works with any markup and a MutationObserver keeps it correct as controls
 * appear, disappear, or become disabled.
 */
export function useRovingTabindex(containerRef: RefObject<HTMLElement>): void {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let active: HTMLElement | null = null;
    const items = () => Array.from(container.querySelectorAll<HTMLElement>(ITEM_SELECTOR));

    const sync = () => {
      const all = items();
      if (!active || !all.includes(active)) active = all[0] ?? null;
      for (const el of all) el.setAttribute("tabindex", el === active ? "0" : "-1");
    };

    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches?.(ITEM_SELECTOR)) {
        active = target;
        sync();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target.matches?.(ITEM_SELECTOR) || e.ctrlKey || e.metaKey || e.altKey) return;
      const all = items();
      const index = all.indexOf(target);
      if (index === -1) return;
      let next = -1;
      if (e.key === "ArrowRight") next = (index + 1) % all.length;
      else if (e.key === "ArrowLeft") next = (index - 1 + all.length) % all.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = all.length - 1;
      if (next === -1) return;
      e.preventDefault();
      active = all[next];
      sync();
      active.focus();
    };

    sync();
    container.addEventListener("focusin", onFocusIn);
    container.addEventListener("keydown", onKeyDown);
    const observer = new MutationObserver(sync);
    observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });
    return () => {
      container.removeEventListener("focusin", onFocusIn);
      container.removeEventListener("keydown", onKeyDown);
      observer.disconnect();
    };
  }, [containerRef]);
}
