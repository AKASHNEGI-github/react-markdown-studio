"use client";
import {
  findTableAt,
  addTableRow,
  addTableColumn,
  removeTableRow,
  removeTableColumn,
  setTableColumnAlign,
  formatTable,
  type TableLocation,
} from "../../editor/tableHelpers";
import type { EditorSelection, EditorState } from "../../editor/types";

function currentColumnIndex(value: string, pos: number): number {
  const lineStart = value.lastIndexOf("\n", pos - 1) + 1;
  const before = value.slice(lineStart, pos);
  let count = 0;
  for (let i = 0; i < before.length; i++) {
    if (before[i] === "\\") {
      i++;
      continue;
    }
    if (before[i] === "|") count++;
  }
  return Math.max(0, count - 1);
}

function currentRowIndex(value: string, pos: number, loc: TableLocation): number {
  const block = value.slice(loc.start, loc.end).split("\n");
  let offset = loc.start;
  for (let i = 0; i < block.length; i++) {
    const lineEnd = offset + block[i].length;
    if (pos <= lineEnd) return i - 2; // -2: skip header + delimiter rows
    offset = lineEnd + 1;
  }
  return loc.rows.length - 1;
}

export interface TableToolsProps {
  value: string;
  selection: EditorSelection;
  runCommand: (fn: (s: EditorState) => EditorState) => void;
}

export function TableTools({ value, selection, runCommand }: TableToolsProps) {
  const loc = findTableAt(value, selection.start);
  if (!loc) return null;

  const col = Math.min(Math.max(currentColumnIndex(value, selection.start), 0), loc.header.length - 1);
  const row = currentRowIndex(value, selection.start, loc);

  return (
    <div className="rmds-table-tools" role="toolbar" aria-label="Table tools">
      <span className="rmds-table-tools-label">Table &middot; col {col + 1}</span>
      <button type="button" className="rmds-toolbar-btn rmds-text-btn" onClick={() => runCommand(addTableRow)}>
        + Row
      </button>
      <button type="button" className="rmds-toolbar-btn rmds-text-btn" onClick={() => runCommand(addTableColumn)}>
        + Col
      </button>
      <button
        type="button"
        className="rmds-toolbar-btn rmds-text-btn"
        disabled={loc.rows.length <= 1 || row < 0}
        onClick={() => runCommand((s) => removeTableRow(s, row))}
      >
        &minus; Row
      </button>
      <button
        type="button"
        className="rmds-toolbar-btn rmds-text-btn"
        disabled={loc.header.length <= 1}
        onClick={() => runCommand((s) => removeTableColumn(s, col))}
      >
        &minus; Col
      </button>
      <span className="rmds-table-tools-sep" aria-hidden="true" />
      <button
        type="button"
        className="rmds-toolbar-btn rmds-text-btn"
        onClick={() => runCommand((s) => setTableColumnAlign(s, col, "left"))}
      >
        Left
      </button>
      <button
        type="button"
        className="rmds-toolbar-btn rmds-text-btn"
        onClick={() => runCommand((s) => setTableColumnAlign(s, col, "center"))}
      >
        Center
      </button>
      <button
        type="button"
        className="rmds-toolbar-btn rmds-text-btn"
        onClick={() => runCommand((s) => setTableColumnAlign(s, col, "right"))}
      >
        Right
      </button>
      <span className="rmds-table-tools-sep" aria-hidden="true" />
      <button type="button" className="rmds-toolbar-btn rmds-text-btn" onClick={() => runCommand(formatTable)}>
        Format
      </button>
    </div>
  );
}
