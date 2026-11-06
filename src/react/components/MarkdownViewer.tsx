"use client";
import { useCallback, useMemo, useState } from "react";
import { parseMarkdown } from "../../core/parser/index";
import { renderToReactElements } from "../../core/render/toReact";
import { toggleCheckboxInMarkdown } from "../../editor/checklist";
import type { Highlighter } from "../../highlighter/index";

export interface MarkdownViewerProps {
  value: string;
  highlighter?: Highlighter;
  openExternalLinksInNewTab?: boolean;
  headingIds?: boolean;
  /** Prefix for heading ids and anchors, e.g. "user-content-" (guards against DOM clobbering). Default "". */
  headingIdPrefix?: string;
  /** Shifts heading tags down this many levels so embedded Markdown fits your page outline (0 to 5). Default 0. */
  headingOffset?: number;
  theme?: "light" | "dark" | "auto";
  className?: string;
  /**
   * Let readers tick / untick task-list checkboxes. Default `true`. Set to
   * `false` for a strictly read-only view. Toggling updates the rendered
   * output immediately and reports the new markdown via `onChange`.
   */
  interactiveChecklists?: boolean;
  /** Called with the updated markdown whenever a checkbox is toggled. Use it to persist the change. */
  onChange?: (value: string) => void;
}

/** Rendering of a markdown string. Read-only apart from (optionally) clickable task-list checkboxes. */
export function MarkdownViewer({
  value,
  highlighter,
  openExternalLinksInNewTab = true,
  headingIds = true,
  headingIdPrefix,
  headingOffset,
  theme = "auto",
  className,
  interactiveChecklists = true,
  onChange,
}: MarkdownViewerProps) {
  // The viewer shows the `value` prop, but keeps a local copy so a toggled
  // checkbox updates even when the parent doesn't feed `onChange` back into
  // `value`. A new `value` from the parent always wins ("derived state" pattern).
  const [source, setSource] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setSource(value);
  }

  const handleToggle = useCallback(
    (index: number, checked: boolean) => {
      const next = toggleCheckboxInMarkdown(source, index, checked);
      if (next === source) return;
      setSource(next);
      onChange?.(next);
    },
    [source, onChange],
  );

  const doc = useMemo(() => parseMarkdown(source, { headingIds }), [source, headingIds]);
  const content = useMemo(
    () =>
      renderToReactElements(doc, {
        highlighter,
        openExternalLinksInNewTab,
        interactiveChecklists,
        onToggleCheckbox: handleToggle,
        headingIdPrefix,
        headingOffset,
      }),
    [doc, highlighter, openExternalLinksInNewTab, interactiveChecklists, handleToggle, headingIdPrefix, headingOffset],
  );
  return (
    <div className={`rmds-root rmds-viewer-root${className ? ` ${className}` : ""}`} data-theme={theme}>
      <div className="rmds-preview">{content}</div>
    </div>
  );
}
