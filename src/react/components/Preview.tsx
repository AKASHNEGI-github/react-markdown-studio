"use client";
import { useMemo } from "react";
import { parseMarkdown } from "../../core/parser/index";
import { renderToReactElements } from "../../core/render/toReact";
import type { Highlighter } from "../../highlighter/index";

export interface PreviewProps {
  value: string;
  highlighter?: Highlighter;
  openExternalLinksInNewTab?: boolean;
  interactiveChecklists?: boolean;
  onToggleCheckbox?: (index: number, checked: boolean) => void;
  headingIds?: boolean;
  headingIdPrefix?: string;
  headingOffset?: number;
  className?: string;
}

export function Preview({
  value,
  highlighter,
  openExternalLinksInNewTab,
  interactiveChecklists,
  onToggleCheckbox,
  headingIds,
  headingIdPrefix,
  headingOffset,
  className,
}: PreviewProps) {
  const doc = useMemo(() => parseMarkdown(value, { headingIds }), [value, headingIds]);
  const content = useMemo(
    () =>
      renderToReactElements(doc, {
        highlighter,
        openExternalLinksInNewTab,
        interactiveChecklists,
        onToggleCheckbox,
        headingIdPrefix,
        headingOffset,
      }),
    [
      doc,
      highlighter,
      openExternalLinksInNewTab,
      interactiveChecklists,
      onToggleCheckbox,
      headingIdPrefix,
      headingOffset,
    ],
  );
  return <div className={`rmds-preview${className ? ` ${className}` : ""}`}>{content}</div>;
}
