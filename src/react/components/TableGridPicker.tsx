"use client";
import { useState } from "react";
import { Popover } from "./Popover";
import { TableIcon, ChevronDownIcon } from "./Icons";

const MAX = 8;

export function TableGridPicker({
  onPick,
  disabled,
  title,
  theme,
}: {
  onPick: (rows: number, cols: number) => void;
  disabled?: boolean;
  title: string;
  theme?: string;
}) {
  const [hover, setHover] = useState({ r: 0, c: 0 });

  return (
    <Popover
      ariaLabel="Insert table"
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
          <TableIcon />
          <ChevronDownIcon />
        </button>
      )}
    >
      {(close) => (
        <div className="rmds-table-picker">
          <div className="rmds-table-picker-grid" role="grid" aria-label="Table size">
            {Array.from({ length: MAX }, (_, r) =>
              Array.from({ length: MAX }, (_, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className={`rmds-table-picker-cell${r <= hover.r && c <= hover.c ? " rmds-active" : ""}`}
                  aria-label={`${r + 1} by ${c + 1} table`}
                  onMouseEnter={() => setHover({ r, c })}
                  onFocus={() => setHover({ r, c })}
                  onClick={() => {
                    // Use this cell's own row/col rather than `hover`: on
                    // touch devices mouseenter may never fire before the
                    // tap, which would otherwise insert whatever size was
                    // last hovered (or the 1x1 default) instead of the size
                    // actually tapped.
                    onPick(r + 1, c + 1);
                    close();
                  }}
                />
              )),
            )}
          </div>
          <div className="rmds-table-picker-label">
            {hover.r + 1} x {hover.c + 1}
          </div>
        </div>
      )}
    </Popover>
  );
}
