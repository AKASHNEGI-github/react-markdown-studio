"use client";
import { Popover } from "./Popover";
import { DownloadIcon, ChevronDownIcon } from "./Icons";

export interface ExportMenuProps {
  onPdf?: () => void;
  onMarkdown?: () => void;
  onHtml?: () => void;
  disabled?: boolean;
  title: string;
  theme?: string;
}

/** Toolbar dropdown offering every export format the editor supports. */
export function ExportMenu({ onPdf, onMarkdown, onHtml, disabled, title, theme }: ExportMenuProps) {
  const items: { label: string; hint: string; run?: () => void }[] = [
    { label: "Print / save as PDF", hint: "Opens the print dialog", run: onPdf },
    { label: "Download Markdown", hint: ".md", run: onMarkdown },
    { label: "Download HTML", hint: ".html, standalone page", run: onHtml },
  ];
  return (
    <Popover
      ariaLabel="Export"
      theme={theme}
      trigger={({ ref, onClick, open }) => (
        <button
          ref={ref}
          type="button"
          className="rmds-toolbar-btn"
          title={title}
          aria-label={title}
          aria-haspopup="true"
          aria-expanded={open}
          disabled={disabled}
          onClick={onClick}
        >
          <DownloadIcon />
          <ChevronDownIcon />
        </button>
      )}
    >
      {(close) => (
        <div className="rmds-menu" role="menu">
          {items
            .filter((item) => item.run)
            .map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className="rmds-menu-item rmds-export-item"
                onClick={() => {
                  item.run?.();
                  close();
                }}
              >
                <span>{item.label}</span>
                <span className="rmds-export-hint">{item.hint}</span>
              </button>
            ))}
        </div>
      )}
    </Popover>
  );
}
