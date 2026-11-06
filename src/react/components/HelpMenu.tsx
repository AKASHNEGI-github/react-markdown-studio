"use client";
import { Popover } from "./Popover";
import { HelpIcon } from "./Icons";
import { helpEntries } from "../../editor/syntaxReference";

const ROWS = helpEntries();

export function HelpMenu({ disabled, title, theme }: { disabled?: boolean; title: string; theme?: string }) {
  return (
    <Popover
      ariaLabel="About and syntax guide"
      theme={theme}
      panelClassName="rmds-help-popover"
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
          <HelpIcon />
        </button>
      )}
    >
      {() => (
        <div className="rmds-help-panel">
          <p className="rmds-help-intro">
            A practical subset of CommonMark + GFM, plus GitHub-style alerts, collapsible sections, and tabbed code
            groups. Only <code>&lt;u&gt;</code>, <code>&lt;sub&gt;</code>, <code>&lt;sup&gt;</code>, and{" "}
            <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code> are recognized as HTML — everything else is shown
            as plain text.
          </p>
          <table className="rmds-help-table">
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label}>
                  <td>
                    <code>{row.syntax}</code>
                  </td>
                  <td>{row.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Popover>
  );
}
