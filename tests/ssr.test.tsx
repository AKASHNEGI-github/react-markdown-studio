import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { MarkdownEditor, MarkdownViewer } from "../src/react";

// Runs in the default (node) environment: no window, no document.
describe("server-side rendering", () => {
  it("renders the editor without touching browser globals", () => {
    expect(typeof window).toBe("undefined");
    const html = renderToString(<MarkdownEditor defaultValue={"# Hello\n\n- [ ] task"} />);
    expect(html).toContain("rmds-root");
    expect(html).toContain("Hello");
    expect(html).toContain("rmds-statusbar");
  });

  it("renders the viewer", () => {
    const html = renderToString(<MarkdownViewer value={"**bold** and https://example.com"} />);
    expect(html).toContain("<strong");
    expect(html).toContain('href="https://example.com"');
  });
});

describe("heading semantics for embedded Markdown (SEO and screen readers)", () => {
  it("headingOffset shifts the tag but not the visual level", () => {
    const html = renderToString(<MarkdownViewer value="# Title" headingOffset={2} />);
    expect(html).toMatch(/<h3[^>]*class="rmds-heading rmds-h1"/);
    expect(html).not.toContain("<h1");
  });
  it("clamps at h6", () => {
    expect(renderToString(<MarkdownViewer value="### Deep" headingOffset={5} />)).toContain("<h6");
  });
  it("keeps the anchor glyph out of the heading's text content", () => {
    const html = renderToString(<MarkdownViewer value="# Title" />);
    expect(html).toMatch(/<a [^>]*rmds-heading-anchor[^>]*><\/a>/);
    expect(html).not.toMatch(/rmds-heading-anchor[^>]*>#/);
  });
});
