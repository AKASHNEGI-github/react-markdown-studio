"use client";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

// useLayoutEffect warns when it runs during SSR (it never actually fires
// there); fall back to useEffect on the server so importing this file in a
// server-rendered tree (e.g. Next.js) never prints that warning.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface PopoverTriggerArgs {
  ref: RefObject<HTMLButtonElement>;
  onClick: () => void;
  open: boolean;
}

export interface PopoverProps {
  trigger: (args: PopoverTriggerArgs) => ReactNode;
  children: (close: () => void) => ReactNode;
  ariaLabel: string;
  /**
   * The editor's current theme ("light" | "dark" | "auto"). Stamped onto the
   * portaled content as `data-theme`, alongside the `.rmds-theme-scope` class
   * that independently re-declares the `--rmds-*` custom properties (see
   * styles.css). The portal escapes `.rmds-root` in the DOM tree, so without
   * this the popover would have no theme variables in scope at all and fall
   * back to transparent/unstyled.
   */
  theme?: string;
  /** Extra class name appended to the portaled panel (e.g. to widen it for content-heavy popovers like the help guide). */
  panelClassName?: string;
}

/**
 * A trigger button + popover that portals its content to document.body and
 * positions it with `position: fixed`, computed from the trigger's own
 * bounding rect. This deliberately escapes every ancestor's `overflow`
 * (including the toolbar's horizontally-scrolling row), so the popover can
 * never be clipped or trigger a spurious scrollbar on a parent container.
 */
export function Popover({ trigger, children, ariaLabel, theme, panelClassName }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const maxLeft = window.innerWidth - 8;
      setPos({ top: r.bottom + 4, left: Math.min(r.left, maxLeft) });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  // Second pass: the first pass above only keeps the anchor's left edge
  // on-screen (computed before the popover has any real size). Once it's
  // actually mounted, clamp its right/bottom edges to the viewport too —
  // needed for wide panels (e.g. the help guide) and triggers sitting near
  // the viewport's right or bottom edge. Guarded by a value comparison so
  // it settles after one correction instead of looping.
  useIsomorphicLayoutEffect(() => {
    if (!open || !pos) return;
    const el = popoverRef.current;
    const anchor = anchorRef.current;
    if (!el || !anchor) return;
    const r = el.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const margin = 8;
    let { top, left } = pos;
    if (left + r.width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - margin - r.width);
    }
    if (top + r.height > window.innerHeight - margin) {
      top = Math.max(margin, anchorRect.top - r.height - 4);
    }
    if (top !== pos.top || left !== pos.left) {
      setPos({ top, left });
    }
  }, [open, pos]);

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <>
      {trigger({ ref: anchorRef, onClick: () => setOpen((o) => !o), open })}
      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            className={`rmds-popover rmds-theme-scope${panelClassName ? ` ${panelClassName}` : ""}`}
            data-theme={theme}
            role="dialog"
            aria-label={ariaLabel}
            style={{ position: "fixed", top: pos.top, left: pos.left }}
          >
            {children(() => setOpen(false))}
          </div>,
          document.body,
        )}
    </>
  );
}
