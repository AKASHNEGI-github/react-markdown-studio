import { useCallback, useEffect, useRef, useState } from "react";
import { MarkdownEditor, type MarkdownEditorHandle } from "react-markdown-studio";
import { SAMPLES } from "../data/samples";
import { decodeDocument, encodeDocument } from "../lib/share";
import type { SiteTheme } from "../lib/useSiteTheme";
import { Section } from "./ui";

export function Playground({ theme, onToggleTheme }: { theme: SiteTheme; onToggleTheme: () => void }) {
  const editor = useRef<MarkdownEditorHandle>(null);
  const [value, setValue] = useState(SAMPLES[0].text);
  const [active, setActive] = useState<string>(SAMPLES[0].id);
  const [note, setNote] = useState("");

  // A shared link carries its document in ?doc=…, so there is no server and nothing is stored.
  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get("doc");
    if (!encoded) return;
    decodeDocument(encoded).then((text) => {
      if (text === null) return;
      setValue(text);
      setActive("shared");
      document.getElementById("playground")?.scrollIntoView();
    });
  }, []);

  const load = useCallback((id: string) => {
    const sample = SAMPLES.find((s) => s.id === id);
    if (!sample) return;
    setValue(sample.text);
    setActive(id);
    setNote("");
  }, []);

  const share = useCallback(async () => {
    const encoded = await encodeDocument(value);
    if (encoded === null) {
      setNote(
        "This document is too long to share as a link (about 7 kB maximum). Use Export → Download Markdown instead.",
      );
      return;
    }
    const url = `${window.location.origin}${window.location.pathname}?doc=${encoded}#playground`;
    window.history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      setNote("Link copied. Anyone who opens it sees exactly this document.");
    } catch {
      setNote("Link is in your address bar. Copy it from there.");
    }
  }, [value]);

  return (
    <Section
      id="playground"
      eyebrow="Playground"
      title="Try the real editor, right here"
      intro="This is the actual component from the package, not a recording. Type, use the toolbar and shortcuts, tick a task in the preview, switch modes, export a file."
    >
      <div className="w-pg-bar">
        <div className="w-chips" role="group" aria-label="Load an example document">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              className="w-chip"
              aria-pressed={active === s.id}
              onClick={() => load(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="w-pg-actions">
          <button type="button" className="w-btn w-btn-sm" onClick={share}>
            Copy share link
          </button>
        </div>
      </div>
      <MarkdownEditor
        ref={editor}
        value={value}
        onChange={setValue}
        theme={theme}
        onThemeChange={onToggleTheme}
        height="680px"
        headingOffset={3}
        placeholder="Start writing Markdown…"
      />
      <p className="w-pg-note" role="status">
        {note ||
          "Tip: Ctrl+B bolds, Tab nests list items, and pasting a URL over selected text makes a link. Everything runs in your browser; nothing is uploaded."}
      </p>
    </Section>
  );
}
