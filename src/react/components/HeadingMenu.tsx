"use client";
import { Popover } from "./Popover";
import { HeadingIcon, ChevronDownIcon } from "./Icons";

const LEVELS: { level: 0 | 1 | 2 | 3 | 4 | 5 | 6; label: string }[] = [
  { level: 0, label: "Paragraph" },
  { level: 1, label: "Heading 1" },
  { level: 2, label: "Heading 2" },
  { level: 3, label: "Heading 3" },
  { level: 4, label: "Heading 4" },
  { level: 5, label: "Heading 5" },
  { level: 6, label: "Heading 6" },
];

export function HeadingMenu({
  onPick,
  disabled,
  title,
  theme,
}: {
  onPick: (level: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void;
  disabled?: boolean;
  title: string;
  theme?: string;
}) {
  return (
    <Popover
      ariaLabel="Heading level"
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
          <HeadingIcon />
          <ChevronDownIcon />
        </button>
      )}
    >
      {(close) => (
        <div className="rmds-menu" role="menu">
          {LEVELS.map(({ level, label }) => (
            <button
              key={level}
              type="button"
              role="menuitem"
              className={`rmds-menu-item rmds-heading-menu-item${level > 0 ? ` rmds-heading-menu-item-${level}` : ""}`}
              onClick={() => {
                onPick(level);
                close();
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}
