"use client";
import { Popover } from "./Popover";
import { ChevronDownIcon } from "./Icons";
import { supportedLanguages } from "../../highlighter/index";

const LANGS = supportedLanguages();

export function CodeLangMenu({
  value,
  onChange,
  disabled,
  theme,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  theme?: string;
}) {
  const current = LANGS.find((l) => l.value === value) ?? LANGS[0];

  return (
    <Popover
      ariaLabel="Code block language"
      theme={theme}
      trigger={({ ref, onClick, open }) => (
        <button
          ref={ref}
          type="button"
          className="rmds-toolbar-btn rmds-code-lang-trigger"
          title="Code block language"
          aria-label={`Code block language: ${current.label}`}
          aria-haspopup="true"
          aria-expanded={open}
          disabled={disabled}
          onClick={onClick}
        >
          <span className="rmds-code-lang-trigger-label">{current.label}</span>
          <ChevronDownIcon />
        </button>
      )}
    >
      {(close) => (
        <div className="rmds-menu rmds-lang-menu" role="menu">
          {LANGS.map((l) => (
            <button
              key={l.value}
              type="button"
              role="menuitem"
              className={`rmds-menu-item${l.value === value ? " rmds-menu-item-selected" : ""}`}
              onClick={() => {
                onChange(l.value);
                close();
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}
