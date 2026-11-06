import { useMemo, useState } from "react";
import { MarkdownViewer, SHORTCUTS, SYNTAX_REFERENCE } from "react-markdown-studio";
import type { SiteTheme } from "../lib/useSiteTheme";
import { CopyButton, Kbd, RichText, Section } from "./ui";

const CATEGORIES = ["All", ...Array.from(new Set(SYNTAX_REFERENCE.map((e) => e.category)))];

const LABELS: Record<string, string> = {
  bold: "Bold",
  italic: "Italic",
  underline: "Underline",
  strikethrough: "Strikethrough",
  inlineCode: "Inline code",
  link: "Insert link",
  undo: "Undo",
  redo: "Redo",
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  orderedList: "Numbered list",
  unorderedList: "Bulleted list",
  checklist: "Task list",
  blockquote: "Blockquote",
};

const pretty = (combo: string) =>
  combo
    .split("+")
    .map((k) => (k === "mod" ? "Ctrl" : k === "shift" ? "Shift" : k.length === 1 ? k.toUpperCase() : k))
    .join("+");

/** The shortcut table is generated from the library's own SHORTCUTS list, so it cannot disagree with the editor. */
function shortcutRows(): { label: string; combos: string[] }[] {
  const byCommand = new Map<string, string[]>();
  for (const s of SHORTCUTS) byCommand.set(s.commandId, [...(byCommand.get(s.commandId) ?? []), pretty(s.combo)]);
  const rows = [...byCommand].map(([id, combos]) => ({ label: LABELS[id] ?? id, combos }));
  rows.push(
    { label: "Indent / nest list item", combos: ["Tab"] },
    { label: "Outdent list item", combos: ["Shift+Tab"] },
    { label: "Continue list or quote", combos: ["Enter"] },
  );
  return rows;
}

export function SyntaxReference({ theme }: { theme: SiteTheme }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const rows = useMemo(shortcutRows, []);

  const entries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SYNTAX_REFERENCE.filter(
      (e) =>
        (category === "All" || e.category === category) &&
        (!q || `${e.name} ${e.description} ${e.syntax}`.toLowerCase().includes(q)),
    );
  }, [category, query]);

  return (
    <Section
      id="syntax"
      eyebrow="Markdown commands"
      title="Every feature, and the Markdown that triggers it"
      intro="Type the syntax, or use the toolbar button and shortcut. Each example below is rendered live by the same parser the editor uses, so what you see is exactly what you get."
    >
      <div className="w-syntax-controls">
        <div className="w-chips" role="group" aria-label="Filter by category">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className="w-chip"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="w-search">
          <span className="w-sr">Search syntax</span>
          <input
            type="search"
            placeholder="Search, e.g. table, alert, bold…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <p className="w-count" role="status">
        {entries.length} {entries.length === 1 ? "feature" : "features"}
      </p>

      <div className="w-syntax-list">
        {entries.map((e) => (
          <article key={e.id} className="w-syntax-card" id={`syntax-${e.id}`}>
            <header>
              <h3>{e.name}</h3>
              {e.shortcut && (
                <span className="w-shortcut" title="On macOS, use ⌘ instead of Ctrl">
                  <Kbd combo={e.shortcut} />
                </span>
              )}
            </header>
            <p>
              <RichText text={e.description} />
            </p>
            <div className="w-syntax-io">
              <div className="w-io-col">
                <div className="w-io-head">
                  <span>You type</span>
                  <CopyButton text={e.syntax} />
                </div>
                <pre className="w-io-code">{e.syntax}</pre>
              </div>
              <div className="w-io-col">
                <div className="w-io-head">
                  <span>You get</span>
                </div>
                <div className="w-io-result">
                  <MarkdownViewer value={e.syntax} theme={theme} interactiveChecklists={false} headingOffset={3} />
                </div>
              </div>
            </div>
          </article>
        ))}
        {entries.length === 0 && <p className="w-empty">No feature matches “{query}”. Try a shorter word.</p>}
      </div>

      <h3 className="w-subhead">Keyboard shortcuts</h3>
      <p className="w-intro w-intro-sm">On macOS, use ⌘ in place of Ctrl.</p>
      <div className="w-table-wrap">
        <table className="w-table">
          <thead>
            <tr>
              <th scope="col">Action</th>
              <th scope="col">Shortcut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td>
                  {r.combos.map((c, i) => (
                    <span key={c}>
                      {i > 0 && <span className="w-or"> or </span>}
                      <Kbd combo={c} />
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
