/** Feature cards. `icon` is an SVG path drawn in a 24x24 box with a 1.8px stroke. */
export interface Feature {
  icon: string;
  title: string;
  text: string;
}

export const FEATURES: Feature[] = [
  {
    icon: "M3 5h18v14H3z M12 5v14",
    title: "Live split preview",
    text: "Write on the left, see the result on the right. Edit, split, preview and HTML-source modes, with synchronised scrolling and a responsive mobile layout.",
  },
  {
    icon: "M3 6h18 M3 12h18 M3 18h12",
    title: "Rich formatting toolbar",
    text: "Bold, italic, headings, lists, links, images, quotes, tables and more, all from the toolbar or the keyboard. Every button is also a plain, tested function you can reuse.",
  },
  {
    icon: "M12 3 2 21h20L12 3z M12 10v5 M12 18v.5",
    title: "GitHub-style alerts",
    text: "NOTE, TIP, IMPORTANT, WARNING and CAUTION callouts with the same syntax GitHub uses, so your documents render identically in both places.",
  },
  {
    icon: "M3 4h18v16H3z M8 10l4 4 4-4",
    title: "Collapsible sections",
    text: "Dropdown details blocks that can contain any Markdown, including lists, tables and code. Add open to start expanded.",
  },
  {
    icon: "M8 8l-4 4 4 4 M16 8l4 4-4 4 M13 6l-2 12",
    title: "Tabbed code groups",
    text: "Show the same snippet for npm, pnpm and yarn as tabs with one block of Markdown. Every code block gets a title bar and a copy button.",
  },
  {
    icon: "M3 4h18v16H3z M3 10h18 M9 4v16 M15 4v16",
    title: "Smart tables",
    text: "Column alignment, and a context toolbar that appears when your cursor is inside a table: insert and delete rows and columns, change alignment.",
  },
  {
    icon: "M4 12l5 5L20 6",
    title: "Interactive task lists",
    text: "Readers can tick checkboxes in the preview and your Markdown source updates automatically. Perfect for notes, plans and issue templates.",
  },
  {
    icon: "M7 8l-4 4 4 4 M17 8l4 4-4 4",
    title: "Built-in syntax highlighting",
    text: "Nineteen languages highlighted by a small built-in engine, so there is no highlight.js or Prism to install, and you can plug in your own highlighter.",
  },
  {
    icon: "M12 3v12 M7 10l5 5 5-5 M4 21h16",
    title: "Export anywhere",
    text: "Print to PDF, download the Markdown, or download a complete standalone HTML page with an embedded stylesheet and working tabs.",
  },
  {
    icon: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z M9 12l2 2 4-4",
    title: "Security-hardened",
    text: "Scheme-allow-listed links, no raw HTML execution, linear-time parsing and depth limits: hostile input cannot hang or crash it. Strict-CSP mode included.",
  },
  {
    icon: "M4 5h16v6H4z M4 13h16v6H4z M8 8h.01 M8 16h.01",
    title: "SSR-safe core",
    text: "The parser and HTML renderer run on the server with no DOM. Render Markdown in Next.js, Remix or plain Node, and hydrate the editor on the client.",
  },
  {
    icon: "M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2.2-.6-1.3.3-2.8 1.8-2.8H18a3 3 0 0 0 3-3c0-5-4-10-9-10z",
    title: "Themeable",
    text: "Light, dark and auto modes out of the box, and every colour is a CSS variable, so matching your brand takes a few lines of CSS.",
  },
  {
    icon: "M3 6h18v12H3z M7 10h.01 M11 10h.01 M15 10h.01 M7 14h10",
    title: "Keyboard-first and accessible",
    text: "Familiar shortcuts, Tab to indent lists, Enter to continue them, and an ARIA toolbar that is a single tab stop with arrow-key navigation.",
  },
  {
    icon: "M3 5h18v14H3z M8 10a1.5 1.5 0 1 0 0 .01 M21 16l-5-5-8 8",
    title: "Paste and drop images",
    text: "Provide an upload function and pasted or dropped images become hosted links with a live placeholder. Without one, nothing is ever embedded or sent.",
  },
  {
    icon: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
    title: "Smart paste",
    text: "Paste a URL over selected text to turn it into a link instantly, and press Enter inside a list or quote to continue it.",
  },
  {
    icon: "M13 2L4 14h7l-1 8 9-12h-7l1-8z",
    title: "Fast on big documents",
    text: "The preview renders off the typing path with deferred updates, and the parser is linear-time, so long documents stay responsive.",
  },
  {
    icon: "M12 3l9 5v8l-9 5-9-5V8l9-5z",
    title: "Zero dependencies",
    text: "Nothing to audit, nothing to keep patched, nothing that can break your install. React is the only peer dependency.",
  },
];
