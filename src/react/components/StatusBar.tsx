import type { CaretPosition, TextStats } from "../../editor/stats";

export interface StatusBarProps {
  stats: TextStats;
  caret: CaretPosition;
  /** Number of selected characters (0 when the selection is collapsed). */
  selected: number;
}

/** Words, characters, reading time, and caret position, in a thin bar under the editor. */
export function StatusBar({ stats, caret, selected }: StatusBarProps) {
  const fmt = (n: number) => n.toLocaleString("en-US");
  return (
    <div className="rmds-statusbar" role="status">
      <span>
        Ln {caret.line}, Col {caret.column}
        {selected > 0 ? ` (${fmt(selected)} selected)` : ""}
      </span>
      <span className="rmds-statusbar-spacer" aria-hidden="true" />
      <span>
        {fmt(stats.words)} {stats.words === 1 ? "word" : "words"}
      </span>
      <span>{fmt(stats.characters)} characters</span>
      {stats.readingMinutes > 0 && <span>{stats.readingMinutes} min read</span>}
    </div>
  );
}
