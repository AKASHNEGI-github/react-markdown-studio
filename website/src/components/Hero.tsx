import { MarkdownViewer } from "react-markdown-studio";
import { SITE } from "../config";
import type { SiteTheme } from "../lib/useSiteTheme";
import { CopyButton } from "./ui";

const DEMO = `> [!NOTE]
> Everything you type renders live.

## Why teams pick it

- [x] Zero runtime dependencies
- [x] Accessible, keyboard-first toolbar
- [x] Safe to render untrusted Markdown
- [ ] Your next feature here

Use **bold**, *italic* and \`code\` freely.`;

export function Hero({ theme }: { theme: SiteTheme }) {
  const command = `npm install ${SITE.npmName}`;
  return (
    <section className="w-hero" id="top">
      <div className="w-container w-hero-grid">
        <div>
          <p className="w-pill">
            v{SITE.version} · MIT licensed · {SITE.dependencyCount} runtime dependencies
          </p>
          <h1>
            The <span className="w-grad">zero-dependency</span> Markdown editor for React
          </h1>
          <p className="w-lead">{SITE.description}</p>
          <div className="w-install" role="group" aria-label="Install command">
            <code>
              <span aria-hidden="true">$ </span>
              {command}
            </code>
            <CopyButton text={command} />
          </div>
          <div className="w-cta">
            <a className="w-btn w-btn-primary" href="#playground">
              Try the playground
            </a>
            <a className="w-btn" href={SITE.links.github}>
              View on GitHub
            </a>
            <a className="w-btn" href={SITE.links.npm}>
              npm package
            </a>
          </div>
        </div>
        <div className="w-demo" aria-label="Markdown source and its rendered result">
          <div className="w-demo-pane">
            <span className="w-demo-label">You type</span>
            <pre>{DEMO}</pre>
          </div>
          <div className="w-demo-pane w-demo-result">
            <span className="w-demo-label">You get</span>
            <MarkdownViewer value={DEMO} theme={theme} interactiveChecklists={false} headingOffset={4} />
          </div>
        </div>
      </div>
    </section>
  );
}
