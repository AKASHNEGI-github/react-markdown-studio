/**
 * Real questions people search for. The same data renders the visible FAQ
 * section and the FAQPage structured data in <head>, so they can never differ.
 */
export interface FaqItem {
  q: string;
  /** Plain text (used verbatim in structured data). */
  a: string;
}

export const FAQ: FaqItem[] = [
  {
    q: "What is React Markdown Studio?",
    a: "React Markdown Studio is a zero-dependency Markdown editor and renderer for React. It gives you a toolbar, keyboard shortcuts, undo and redo, a live split-view preview, GitHub-style alerts, tabbed code groups, tables, task lists and syntax highlighting in a single npm package.",
  },
  {
    q: "How is it different from react-markdown?",
    a: "react-markdown is a renderer: it turns a Markdown string into React elements. React Markdown Studio includes a complete editor interface (toolbar, shortcuts, history, split preview, export) as well as a renderer (the MarkdownViewer component and the markdownToHtml function), with no runtime dependencies. Choose a renderer-only library if you just need to display Markdown and want its plugin ecosystem.",
  },
  {
    q: "Does it work with Next.js and server-side rendering?",
    a: "Yes. The parser and HTML renderer in react-markdown-studio/core need no DOM and run in Node, route handlers, Server Components and edge functions. The editor and viewer are client components marked with the use client directive, and they render safely on the server before hydrating.",
  },
  {
    q: "Is it safe to render Markdown written by users?",
    a: "It is designed for untrusted input: link schemes are limited to http, https and mailto, raw HTML is never executed (only u, sub, sup and details tags are recognised), parsing runs in linear time with depth limits so hostile input cannot hang or crash it, and a strict Content-Security-Policy mode is available. No software can promise absolute security, so please read the security policy and report any issue privately.",
  },
  {
    q: "Which React versions are supported?",
    a: "React 18 and React 19. The full test suite, including component and server-rendering tests, runs against both in continuous integration.",
  },
  {
    q: "Can I use it in a commercial project?",
    a: "Yes. React Markdown Studio is released under the MIT license, which allows personal and commercial use.",
  },
  {
    q: "How do I add image uploads?",
    a: "Pass an onImageUpload function to the editor. When a user pastes or drops an image, the editor shows an uploading placeholder, calls your function with the file, and replaces the placeholder with the Markdown image link you return. Without that prop, images are never embedded or sent anywhere.",
  },
  {
    q: "Can I change the colours and styling?",
    a: "Yes. There are built-in light, dark and auto themes, and every colour is a CSS custom property starting with --rmds-, so matching your brand takes a few lines of CSS with no build step.",
  },
  {
    q: "Which languages does syntax highlighting support?",
    a: "A small built-in engine highlights JavaScript, TypeScript and TSX, Python, Bash, JSON, YAML, HTML, CSS, SQL, Go, Rust, Java, C, C++, C#, PHP, Diff and Markdown, plus plain text. You can also plug in your own highlighter.",
  },
  {
    q: "Is it a WYSIWYG editor?",
    a: "No. It is a source-plus-preview editor, like GitHub's: you write real Markdown on one side and see the rendered result on the other, so you always control exactly what is saved.",
  },
];

export function faqJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  });
}
