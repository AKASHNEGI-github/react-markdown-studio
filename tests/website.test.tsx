// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import App from "../website/src/App";
import { FAQ, faqJsonLd } from "../website/src/data/faq";
import { SYNTAX_REFERENCE } from "../src/editor/syntaxReference";

// The website pre-renders to static HTML at build time and then hydrates in the browser.
// These tests guard the two things that go wrong with that: markup that disagrees
// with the client (hydration mismatch) and a document outline that hurts SEO.

afterEach(() => vi.restoreAllMocks());

/**
 * Server-renders the page. jsdom defines `window`, which real Node does not, so React's server renderer
 * emits a harmless "useLayoutEffect does nothing on the server" warning here that never occurs in production
 * (the node-environment tests in ssr.test.tsx run it with no `window` and are silent). Mute only that warning.
 */
function serverRender(): string {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    return renderToString(<App />);
  } finally {
    spy.mockRestore();
  }
}

describe("website pre-rendering", () => {
  it("hydrates the server HTML with no mismatch warnings", async () => {
    const serverHtml = serverRender();
    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.appendChild(container);

    const problems: string[] = [];
    vi.spyOn(console, "error").mockImplementation((...args) => problems.push(args.map(String).join(" ")));
    vi.spyOn(console, "warn").mockImplementation((...args) => problems.push(args.map(String).join(" ")));

    await act(async () => {
      hydrateRoot(container, <App />);
    });

    const hydrationProblems = problems.filter((m) => /hydrat|did not match|server.rendered/i.test(m));
    expect(hydrationProblems).toEqual([]);
    container.remove();
  });

  it("has exactly one h1 and no heading from demo content above h4", () => {
    const container = document.createElement("div");
    container.innerHTML = serverRender();
    expect(container.querySelectorAll("h1").length).toBe(1);
    // Everything between the page's own h2 sections and its h3 card titles is real page structure;
    // rendered demo Markdown must never add an h1 or h2.
    const demoHeadings = container.querySelectorAll(".rmds-root h1, .rmds-root h2, .rmds-root h3");
    expect(demoHeadings.length).toBe(0);
  });

  it("renders every syntax-reference entry and FAQ answer as crawlable text", () => {
    const text = (() => {
      const c = document.createElement("div");
      c.innerHTML = serverRender();
      return c.textContent ?? "";
    })();
    for (const e of SYNTAX_REFERENCE) expect(text).toContain(e.name);
    for (const f of FAQ) {
      expect(text).toContain(f.q);
      expect(text).toContain(f.a.slice(0, 60));
    }
    expect(text).not.toMatch(/#Why teams|#Formatting/); // anchor glyph stays out of heading text
  });

  it("emits valid FAQPage structured data that mirrors the visible FAQ", () => {
    const ld = JSON.parse(faqJsonLd());
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(FAQ.length);
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe(FAQ[0].a);
  });
});
