// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createRef } from "react";
import { MarkdownEditor, MarkdownViewer, type MarkdownEditorHandle } from "../src/react";

const download = vi.hoisted(() => vi.fn());
vi.mock("../src/react/utils/download", () => ({ downloadTextFile: download }));

afterEach(() => {
  cleanup();
  download.mockReset();
});

const source = () => screen.getByLabelText("Markdown source") as HTMLTextAreaElement;
const type = (value: string) => fireEvent.change(source(), { target: { value } });
const select = (start: number, end = start) => {
  source().setSelectionRange(start, end);
  fireEvent.select(source());
};
const previewHtml = (container: HTMLElement) => container.querySelector(".rmds-preview-pane")?.innerHTML ?? "";

describe("editing and preview", () => {
  it("renders typed markdown in the live preview", async () => {
    const { container } = render(<MarkdownEditor defaultValue="" />);
    type("# Hello **world**");
    await waitFor(() => expect(previewHtml(container)).toContain("<strong"));
    expect(container.querySelector(".rmds-preview-pane h1")?.textContent).toContain("Hello world");
  });

  it("Tab nests a numbered list item so the preview shows a real nested list", async () => {
    const { container } = render(<MarkdownEditor defaultValue="" />);
    type("1. a\n2. b");
    select(9);
    fireEvent.keyDown(source(), { key: "Tab" });
    expect(source().value).toBe("1. a\n   2. b");
    await waitFor(() => expect(container.querySelectorAll(".rmds-preview-pane ol ol").length).toBe(1));
  });

  it("Ctrl+Shift+7 makes an ordered list on a US keyboard (e.key is '&')", () => {
    render(<MarkdownEditor defaultValue="item" />);
    select(0, 4);
    fireEvent.keyDown(source(), { key: "&", code: "Digit7", ctrlKey: true, shiftKey: true });
    expect(source().value).toBe("1. item");
  });

  it("Ctrl+I on bold text keeps the bold", () => {
    render(<MarkdownEditor defaultValue="**bold**" />);
    select(2, 6);
    fireEvent.keyDown(source(), { key: "i", ctrlKey: true });
    expect(source().value).toBe("***bold***");
  });
});

describe("status bar", () => {
  it("shows words, characters, reading time and caret position", async () => {
    render(<MarkdownEditor defaultValue="" />);
    type("one two three\nfour");
    select(18);
    const bar = await screen.findByRole("status");
    await waitFor(() => expect(bar.textContent).toContain("4 words"));
    expect(bar.textContent).toContain("18 characters");
    expect(bar.textContent).toContain("Ln 2, Col 5");
    expect(bar.textContent).toContain("1 min read");
  });

  it("can be turned off", () => {
    render(<MarkdownEditor defaultValue="x" showStatusBar={false} />);
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("toolbar keyboard navigation (roving tabindex)", () => {
  it("is a single tab stop, and arrow keys move between controls", async () => {
    render(<MarkdownEditor defaultValue="x" />);
    const toolbar = screen.getByRole("toolbar");
    await waitFor(() => expect(toolbar.querySelectorAll('button[tabindex="0"]').length).toBe(1));
    const stops = Array.from(toolbar.querySelectorAll<HTMLButtonElement>('button[tabindex="-1"]'));
    expect(stops.length).toBeGreaterThan(10);

    const first = toolbar.querySelector<HTMLButtonElement>('button[tabindex="0"]')!;
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    const now = document.activeElement as HTMLElement;
    expect(now).not.toBe(first);
    expect(now.getAttribute("tabindex")).toBe("0");
    expect(first.getAttribute("tabindex")).toBe("-1");

    fireEvent.keyDown(now, { key: "End" });
    const last = document.activeElement as HTMLElement;
    fireEvent.keyDown(last, { key: "ArrowRight" }); // wraps to the start
    expect(document.activeElement).toBe(toolbar.querySelector("button:not([disabled])"));
  });
});

describe("export menu", () => {
  it("offers Markdown and HTML downloads", async () => {
    render(<MarkdownEditor defaultValue="# Title" />);
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /Download Markdown/ }));
    expect(download).toHaveBeenLastCalledWith("document.md", "# Title", "text/markdown");

    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /Download HTML/ }));
    const [name, html, mime] = download.mock.calls[download.mock.calls.length - 1]!;
    expect(name).toBe("document.html");
    expect(mime).toBe("text/html");
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain("<title>Title</title>");
  });
});

describe("imperative handle", () => {
  it("exposes setMarkdown, insertText and the download methods", () => {
    const ref = createRef<MarkdownEditorHandle>();
    render(<MarkdownEditor ref={ref} defaultValue="" />);
    act(() => ref.current!.setMarkdown("abc"));
    expect(ref.current!.getMarkdown()).toBe("abc");
    select(3);
    act(() => ref.current!.insertText("!"));
    expect(ref.current!.getMarkdown()).toBe("abc!");
    act(() => ref.current!.downloadMarkdown("notes.md"));
    expect(download).toHaveBeenCalledWith("notes.md", "abc!", "text/markdown");
  });
});

describe("smart paste", () => {
  const paste = (text: string, files: File[] = []) =>
    fireEvent.paste(source(), { clipboardData: { getData: () => text, files } });

  it("pasting a URL over selected text makes a link", () => {
    render(<MarkdownEditor defaultValue="see docs here" />);
    select(4, 8);
    paste("https://example.com/docs");
    expect(source().value).toBe("see [docs](https://example.com/docs) here");
  });

  it("leaves normal pastes alone", () => {
    render(<MarkdownEditor defaultValue="see docs" />);
    select(4, 8);
    const notPrevented = paste("just words");
    expect(notPrevented).toBe(true);
    expect(source().value).toBe("see docs");
  });

  it("can be disabled", () => {
    render(<MarkdownEditor defaultValue="see docs" smartPaste={false} />);
    select(4, 8);
    expect(paste("https://example.com")).toBe(true);
  });

  it("ignores image files unless onImageUpload is provided (nothing is embedded or sent)", () => {
    render(<MarkdownEditor defaultValue="" />);
    const file = new File(["x"], "photo.png", { type: "image/png" });
    expect(paste("", [file])).toBe(true);
    expect(source().value).toBe("");
  });
});

describe("image upload", () => {
  const file = new File(["x"], "my photo.png", { type: "image/png" });
  const paste = () => fireEvent.paste(source(), { clipboardData: { getData: () => "", files: [file] } });

  it("shows a placeholder, then replaces it with the uploaded image (and escapes the URL)", async () => {
    let finish!: (url: string) => void;
    const onImageUpload = vi.fn(() => new Promise<string>((resolve) => (finish = resolve)));
    render(<MarkdownEditor defaultValue="before " onImageUpload={onImageUpload} />);
    select(7);
    paste();
    expect(source().value).toBe("before *Uploading my photo.png…*");
    expect(onImageUpload).toHaveBeenCalledWith(file);

    type(source().value + " and I kept typing"); // user keeps typing during the upload
    await act(async () => finish("https://cdn.example.com/a b(1).png"));
    await waitFor(() =>
      expect(source().value).toBe("before ![my photo](https://cdn.example.com/a%20b%281%29.png) and I kept typing"),
    );
  });

  it("removes the placeholder and reports failures", async () => {
    const onImageUploadError = vi.fn();
    render(
      <MarkdownEditor
        defaultValue=""
        onImageUpload={() => Promise.reject(new Error("boom"))}
        onImageUploadError={onImageUploadError}
      />,
    );
    paste();
    await waitFor(() => expect(onImageUploadError).toHaveBeenCalledTimes(1));
    expect(source().value).toBe("");
  });

  it("supports { url, alt } results and drag-and-drop", async () => {
    render(
      <MarkdownEditor
        defaultValue=""
        onImageUpload={async () => ({ url: "https://x.test/i.png", alt: "A diagram" })}
      />,
    );
    fireEvent.drop(source(), { dataTransfer: { files: [file], items: [] } });
    await waitFor(() => expect(source().value).toBe("![A diagram](https://x.test/i.png)"));
  });
});

describe("split-view scroll sync", () => {
  const size = (el: HTMLElement, scrollHeight: number, clientHeight: number) => {
    Object.defineProperty(el, "scrollHeight", { value: scrollHeight, configurable: true });
    Object.defineProperty(el, "clientHeight", { value: clientHeight, configurable: true });
  };

  it("keeps the preview at the same relative position as the editor", () => {
    const { container } = render(<MarkdownEditor defaultValue="x" />);
    const pane = container.querySelector<HTMLElement>(".rmds-preview-pane")!;
    size(source(), 1000, 200);
    size(pane, 2000, 200);
    source().scrollTop = 400; // halfway through the scrollable range
    fireEvent.scroll(source());
    expect(pane.scrollTop).toBe(900);
  });

  it("can be disabled", () => {
    const { container } = render(<MarkdownEditor defaultValue="x" syncScroll={false} />);
    const pane = container.querySelector<HTMLElement>(".rmds-preview-pane")!;
    size(source(), 1000, 200);
    size(pane, 2000, 200);
    source().scrollTop = 400;
    fireEvent.scroll(source());
    expect(pane.scrollTop).toBe(0);
  });
});

describe("rendering details in the React preview", () => {
  it("shows a code block title on a standalone block", () => {
    const { container } = render(<MarkdownViewer value={"```js [app.js]\nx\n```"} />);
    expect(container.querySelector(".rmds-code-title")?.textContent).toBe("app.js");
  });

  it("does not duplicate the title inside a code group (the tab already shows it)", () => {
    const { container } = render(
      <MarkdownViewer value={":::code-group\n```js [app.js]\nx\n```\n```py [b.py]\ny\n```\n:::"} />,
    );
    expect(container.querySelectorAll(".rmds-code-title").length).toBe(0);
    expect(
      within(container)
        .getAllByRole("tab")
        .map((t) => t.textContent),
    ).toEqual(["app.js", "b.py"]);
  });

  it("neutralises javascript: links hidden behind control characters", () => {
    const { container } = render(<MarkdownViewer value={"[click](\u0001javascript:alert(1))"} />);
    expect(container.querySelector("a")?.getAttribute("href")).toBe("#");
  });

  it("autolinks bare URLs", () => {
    const { container } = render(<MarkdownViewer value="docs at https://example.com." />);
    const a = container.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("https://example.com");
    expect(a.textContent).toBe("https://example.com");
  });

  it("applies headingIdPrefix to ids and anchors", () => {
    const { container } = render(<MarkdownViewer value="# Config" headingIdPrefix="user-content-" />);
    expect(container.querySelector("h1")?.id).toBe("user-content-config");
    expect(container.querySelector("h1 a")?.getAttribute("href")).toBe("#user-content-config");
  });
});

beforeEach(() => {
  download.mockReset();
});

describe("printing", () => {
  it("only hides the host page while the editor's own PDF export is running", async () => {
    const printSpy = vi.fn();
    vi.stubGlobal("print", printSpy);
    render(<MarkdownEditor defaultValue="# Doc" />);
    expect(document.body.classList.contains("rmds-printing")).toBe(false);

    // Open the menu with real timers (Testing Library polls with them), then fake only the print delay.
    fireEvent.click(screen.getByRole("button", { name: "Export" }));
    const item = await screen.findByRole("menuitem", { name: /Print/ });
    vi.useFakeTimers();
    fireEvent.click(item);
    await act(async () => {
      vi.advanceTimersByTime(100);
    });
    expect(printSpy).toHaveBeenCalledTimes(1);
    expect(document.body.classList.contains("rmds-printing")).toBe(true);

    await act(async () => {
      window.dispatchEvent(new Event("afterprint"));
    });
    expect(document.body.classList.contains("rmds-printing")).toBe(false);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("the stylesheet scopes the page-hiding print rule to that class", async () => {
    const { readFileSync } = await import("node:fs");
    const css = readFileSync("src/react/styles.css", "utf8");
    expect(css).toMatch(/body\.rmds-printing > \*:not\(\.rmds-print-root\)/);
    expect(css).not.toMatch(/(^|\s)body > \*:not\(\.rmds-print-root\)/m);
  });
});
