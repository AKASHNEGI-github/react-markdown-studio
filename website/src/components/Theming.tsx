import { useState } from "react";
import { MarkdownViewer } from "react-markdown-studio";
import type { SiteTheme } from "../lib/useSiteTheme";
import { CopyButton, Section } from "./ui";

interface Preset {
  id: string;
  label: string;
  /** "auto" follows the site theme; the others pin the viewer to light or dark. */
  mode: "auto" | "light" | "dark";
  vars: Record<string, string>;
}

const PRESETS: Preset[] = [
  { id: "default", label: "Default", mode: "auto", vars: {} },
  {
    id: "midnight",
    label: "Midnight",
    mode: "dark",
    vars: {
      "--rmds-bg": "#0f172a",
      "--rmds-bg-subtle": "#111c34",
      "--rmds-bg-inset": "#0b1224",
      "--rmds-code-bg": "#0b1224",
      "--rmds-border": "#26324f",
      "--rmds-border-subtle": "#1c2742",
      "--rmds-text": "#e2e8f0",
      "--rmds-text-muted": "#94a3b8",
      "--rmds-accent": "#38bdf8",
    },
  },
  {
    id: "rose",
    label: "Rose",
    mode: "light",
    vars: {
      "--rmds-bg": "#fff7f9",
      "--rmds-bg-subtle": "#fff0f3",
      "--rmds-bg-inset": "#fff0f3",
      "--rmds-code-bg": "#fff0f3",
      "--rmds-border": "#f4c2cd",
      "--rmds-border-subtle": "#f9dde3",
      "--rmds-text": "#4a1d2a",
      "--rmds-text-muted": "#8c5565",
      "--rmds-accent": "#e11d48",
    },
  },
  {
    id: "forest",
    label: "Forest",
    mode: "light",
    vars: {
      "--rmds-bg": "#f6faf5",
      "--rmds-bg-subtle": "#eaf3e8",
      "--rmds-bg-inset": "#eaf3e8",
      "--rmds-code-bg": "#eaf3e8",
      "--rmds-border": "#c5dcc0",
      "--rmds-border-subtle": "#dbe9d7",
      "--rmds-text": "#1d3a2a",
      "--rmds-text-muted": "#4f6f5c",
      "--rmds-accent": "#15803d",
    },
  },
];

const DEMO = `# Your brand, your colours

Every colour is a CSS variable, so a theme is a handful of lines.

> [!TIP]
> Alerts, code, tables and links all follow the variables below.

| Token | Role |
| :-- | :-- |
| \`--rmds-accent\` | Links and focus |
| \`--rmds-bg\` | Surface |

\`\`\`ts
const theme = "yours";
\`\`\``;

const cssFor = (p: Preset) =>
  `.w-preset-${p.id} .rmds-root.rmds-root{${Object.entries(p.vars)
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}`;

export function Theming({ theme }: { theme: SiteTheme }) {
  const [id, setId] = useState("default");
  const preset = PRESETS.find((p) => p.id === id)!;
  const snippet = Object.keys(preset.vars).length
    ? `.my-editor {\n${Object.entries(preset.vars)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join("\n")}\n}`
    : "/* Defaults follow light/dark automatically.\n   Override any --rmds-* variable to customise. */";
  return (
    <Section
      id="theming"
      eyebrow="Theming"
      title="Make it yours with CSS variables"
      intro="Light, dark and auto are built in. Everything else is a variable on the editor's root, with no build step and no theme object."
    >
      <style>{PRESETS.map(cssFor).join("\n")}</style>
      <div className="w-chips" role="group" aria-label="Theme preset">
        {PRESETS.map((p) => (
          <button key={p.id} type="button" className="w-chip" aria-pressed={id === p.id} onClick={() => setId(p.id)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="w-theming">
        <div className={`w-preset-${preset.id} w-theming-demo`}>
          <MarkdownViewer
            value={DEMO}
            theme={preset.mode === "auto" ? theme : preset.mode}
            interactiveChecklists={false}
            headingOffset={3}
            className="my-editor"
          />
        </div>
        <div className="w-theming-code">
          <div className="w-io-head">
            <span>CSS</span>
            <CopyButton text={snippet} />
          </div>
          <pre className="w-io-code">{snippet}</pre>
        </div>
      </div>
    </Section>
  );
}
