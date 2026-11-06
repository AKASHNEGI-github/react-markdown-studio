import { useState } from "react";
import { MarkdownViewer } from "react-markdown-studio";
import { SITE } from "../config";
import type { SiteTheme } from "../lib/useSiteTheme";
import { CopyButton, Section } from "./ui";

const F = "```";
const n = SITE.npmName;
const MANAGERS = [
  ["npm", `npm install ${n}`],
  ["pnpm", `pnpm add ${n}`],
  ["yarn", `yarn add ${n}`],
  ["bun", `bun add ${n}`],
] as const;

// Rendered by the library itself (tabbed code group + highlighting): the page dogfoods its own feature.
const EXAMPLES = `::: code-group
${F}tsx [Editor]
import { useState } from "react";
import { MarkdownEditor } from "${n}";
import "${n}/styles.css";

export default function Notes() {
  const [markdown, setMarkdown] = useState("# Hello");
  return <MarkdownEditor value={markdown} onChange={setMarkdown} height="480px" />;
}
${F}
${F}tsx [Viewer and SSR]
// Interactive, read-only rendering in a React tree
import { MarkdownViewer } from "${n}";
<MarkdownViewer value={post.body} />;

// On the server: Next.js route, Node script, edge function. No DOM needed.
import { markdownToHtml } from "${n}/core";
const html = markdownToHtml(userInput);
${F}
${F}tsx [Uploads and CSP]
<MarkdownEditor
  // Pasted or dropped images are uploaded by *your* function; without it, nothing is embedded or sent.
  onImageUpload={async (file) => (await uploadToMyCdn(file)).url}
  // Stops author-controlled heading ids from shadowing window globals.
  headingIdPrefix="user-content-"
/>;

// Strict Content-Security-Policy (no inline scripts)?
import { markdownToHtml, enhanceHtml } from "${n}";
const html = markdownToHtml(src, undefined, { scripts: false });
enhanceHtml(document.body); // adds tab + copy behaviour from your own bundle
${F}
:::`;

export function QuickStart({ theme }: { theme: SiteTheme }) {
  const [manager, setManager] = useState<(typeof MANAGERS)[number][0]>("npm");
  const command = MANAGERS.find(([m]) => m === manager)![1];
  return (
    <Section
      id="install"
      eyebrow="Get started"
      title="Install in one line, render in three"
      intro="React 18 and 19 are supported. Import the stylesheet once and you are done."
    >
      <div className="w-install-card">
        <div className="w-tabs" role="tablist" aria-label="Package manager">
          {MANAGERS.map(([m]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={manager === m}
              className="w-tab"
              onClick={() => setManager(m)}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="w-install-row">
          <code>
            <span aria-hidden="true">$ </span>
            {command}
          </code>
          <CopyButton text={command} />
        </div>
      </div>
      <div className="w-examples">
        <MarkdownViewer value={EXAMPLES} theme={theme} headingOffset={3} />
      </div>
      <p className="w-intro w-intro-sm">
        Full prop and method reference in the <a href={SITE.links.apiDocs}>API docs</a>. Upgrading from{" "}
        <code>akash-negi-markdown-editor</code>? See the <a href={SITE.links.migration}>migration guide</a>.
      </p>
    </Section>
  );
}
