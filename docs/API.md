# API reference

```ts
import { MarkdownEditor, MarkdownViewer } from "react-markdown-studio";
import { markdownToHtml } from "react-markdown-studio/core";
import "react-markdown-studio/styles.css";
```

Entry points: `react-markdown-studio` (everything), `/core` (parser and renderers, no React), `/editor` (pure editing commands), `/highlighter`, and `/styles.css`.

## `<MarkdownEditor />`

Controlled (`value` + `onChange`) or uncontrolled (`defaultValue`). Every `default*` prop has a controlled counterpart.

### Content and state

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | | Controlled Markdown. |
| `defaultValue` | `string` | `""` | Initial Markdown when uncontrolled. Also what *Reset* restores. |
| `onChange` | `(value: string) => void` | | Called on every edit. |
| `mode` / `defaultMode` / `onModeChange` | `"edit" \| "split" \| "preview" \| "html"` | `"split"` | View mode. |
| `fullscreen` / `defaultFullscreen` / `onFullscreenChange` | `boolean` | `false` | Fullscreen state. |
| `theme` / `defaultTheme` / `onThemeChange` | `"light" \| "dark" \| "auto"` | `"auto"` | Colour theme. |
| `readOnly` | `boolean` | `false` | Prevent edits. |
| `disabled` | `boolean` | `false` | Disable the whole editor. |

### Layout and appearance

| Prop | Type | Default | Description |
|---|---|---|---|
| `height` | `string \| number` | | CSS height of the editor. |
| `minHeight` | `string \| number` | `"320px"` | Minimum CSS height. |
| `className` | `string` | | Class added to the root element (a good hook for theming). |
| `placeholder` | `string` | | Textarea placeholder. |
| `labels` | `ToolbarLabels` | English | Override toolbar tooltip text (keys: `bold`, `italic`, `underline`, `strikethrough`, `subscript`, `superscript`, `inlineCode`, `link`, `image`, `unorderedList`, `orderedList`, `checklist`, `blockquote`, `alert`, `details`, `codeBlock`, `codeGroup`, `table`, `horizontalRule`, `undo`, `redo`, `heading`, `editMode`, `splitMode`, `previewMode`, `htmlMode`, `fullscreen`, `reset`, `theme`, `download`, `help`). |
| `toolbar` | `string[] \| false` | all | Which buttons to show, by id: `alert`, `blockquote`, `bold`, `checklist`, `codeBlock`, `codeGroup`, `details`, `heading`, `horizontalRule`, `image`, `inlineCode`, `italic`, `link`, `orderedList`, `redo`, `strikethrough`, `subscript`, `superscript`, `table`, `underline`, `undo`, `unorderedList`. The layout order is fixed. `false` hides the toolbar. |
| `showModeControls` | `boolean` | `true` | Edit/split/preview/HTML switcher. |
| `showFullscreenControl` | `boolean` | `true` | Fullscreen button. |
| `showThemeToggle` | `boolean` | `true` | Light/dark toggle. |
| `showResetButton` | `boolean` | `true` | Reset-to-original button. |
| `showHtmlView` | `boolean` | `true` | HTML-source mode button. |
| `showDownloadButton` | `boolean` | `true` | Export menu (PDF, Markdown, HTML). |
| `showHelpButton` | `boolean` | `true` | Syntax guide popover. |
| `showLineNumbers` | `boolean` | `true` | Line-number gutter. |
| `showEditorCopyButton` | `boolean` | `true` | Copy-source button over the writing area. |
| `showStatusBar` | `boolean` | `true` | Line/column, words, characters, reading time. |
| `showTableTools` | `boolean` | `true` | Context toolbar when the caret is in a table. |

### Behaviour

| Prop | Type | Default | Description |
|---|---|---|---|
| `syncScroll` | `boolean` | `true` | Keep editor and preview at the same relative scroll position in split mode. |
| `tabIndentation` | `boolean` | `true` | `Tab` / `Shift+Tab` indent and outdent. List items nest by their parent's marker width. When `false`, Tab moves focus. |
| `autoContinueList` | `boolean` | `true` | `Enter` continues lists and blockquotes. |
| `smartPaste` | `boolean` | `true` | Pasting a URL over selected text makes a link. |
| `interactiveChecklists` | `boolean` | `true` | Clicking a preview checkbox updates the Markdown. |
| `onReset` | `() => void` | | Called after *Reset*. |

### Rendering

| Prop | Type | Default | Description |
|---|---|---|---|
| `highlighter` | `Highlighter` | built-in | Custom highlighter, `(code, lang) => Token[]`. |
| `openExternalLinksInNewTab` | `boolean` | `true` | Adds `target="_blank" rel="noopener noreferrer"` to external links. |
| `headingIds` | `boolean` | `true` | Generate ids and hover anchors for headings. |
| `headingIdPrefix` | `string` | `""` | Prefix for heading ids and anchors (for example `"user-content-"`), a defence against DOM clobbering. |
| `headingOffset` | `number` (0 to 5) | `0` | Shift preview heading tags down so the editor fits your page outline. Visual size is unchanged. |

### Images

| Prop | Type | Description |
|---|---|---|
| `onImageUpload` | `(file: File) => Promise<string \| { url: string; alt?: string }> \| string \| { url: string; alt?: string }` | Enables paste and drag-and-drop of images. An "Uploading…" placeholder is inserted at the caret and replaced by `![alt](url)` when your function resolves; edits made in the meantime are preserved. Without this prop, image files are ignored and nothing is embedded or sent. |
| `onImageUploadError` | `(error: unknown, file: File) => void` | Called if the upload rejects. The placeholder is removed automatically. |

### Ref handle

```tsx
const ref = useRef<MarkdownEditorHandle>(null);
<MarkdownEditor ref={ref} />;
ref.current?.insertText("**hi**");
```

| Method | Description |
|---|---|
| `getMarkdown()` / `getHTML()` | Current source / rendered HTML fragment. |
| `setMarkdown(markdown)` | Replace the document (undoable). |
| `insertText(text)` | Insert at the caret, replacing any selection. |
| `focus()`, `undo()`, `redo()`, `reset()` | |
| `setMode(mode)` | Switch view mode. |
| `downloadMarkdown(filename?)` | Save a `.md` file (default `document.md`). |
| `downloadHtml(filename?)` | Save a standalone `.html` page (default `document.html`). |

## `<MarkdownViewer />`

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | required | Markdown to render. |
| `theme` | `"light" \| "dark" \| "auto"` | `"auto"` | |
| `className` | `string` | | |
| `highlighter`, `openExternalLinksInNewTab`, `headingIds`, `headingIdPrefix`, `headingOffset` | | | Same as the editor. |
| `interactiveChecklists` | `boolean` | `true` | Let readers tick checkboxes. |
| `onChange` | `(value: string) => void` | | Receives updated Markdown when a checkbox is toggled; use it to persist. |

## Core functions (`react-markdown-studio/core`)

No DOM required. Safe on the server.

| Function | Description |
|---|---|
| `parseMarkdown(source, { headingIds? })` | Returns a plain-data AST (`DocumentNode`), JSON-serialisable. |
| `renderToHtml(doc, options?)` | AST to an HTML string. |
| `markdownToHtml(source, parseOptions?, renderOptions?)` | Convenience: parse and render. |
| `renderHtmlDocument(doc, options?)` / `markdownToHtmlDocument(source, options?)` | A complete standalone page: doctype, embedded stylesheet (follows light/dark), working tabs and copy buttons. Options: `title`, `lang`, `css`, plus the render options. |
| `enhanceHtml(root?)` | Adds code-tab and copy-button behaviour to HTML rendered with `scripts: false`. Returns a function that removes the listener. |
| `sanitizeUrl(url)` | The exact URL filter the renderers use. Returns the URL or `"#"`. |
| `inlineToPlainText(nodes)` | Plain text of inline nodes (handy for building a table of contents). |

### Render options

| Option | Type | Default | Description |
|---|---|---|---|
| `highlighter` | `Highlighter` | built-in | |
| `openExternalLinksInNewTab` | `boolean` | `true` | |
| `scripts` | `boolean` | `true` | Emit the inline `<script>` blocks for tabs and copy buttons. Set `false` for strict CSP and call `enhanceHtml()`. |
| `headingIdPrefix` | `string` | `""` | Prefix for heading ids and anchors. If you read `node.id` yourself (for a table of contents), add the prefix. |
| `headingOffset` | `number` (0 to 5) | `0` | |

## Editing commands (`react-markdown-studio/editor`)

Every toolbar action is a pure function `(state: { value; selection }) => state`, so you can build your own UI. Examples: `toggleBold`, `toggleItalic`, `setHeadingLevel`, `toggleOrderedList`, `insertLink`, `insertTable`, `indentLines`, `outdentLines`, `continueList`, `replaceText`, `linkSelection`. Also exported: `HistoryStack` (undo/redo), `matchShortcut` and `SHORTCUTS`, `getTextStats` and `getCaretPosition`, and `SYNTAX_REFERENCE` (the data behind the in-editor help and the website).

## Highlighter (`react-markdown-studio/highlighter`)

`highlight` (the default), `supportedLanguages()`, `isLanguageSupported(lang)`, and the token colour maps `githubLightTokenColors` / `githubDarkTokenColors`. A custom highlighter is a function `(code: string, lang: string | undefined) => Token[]`.

## CSS variables

All colours live on the editor root and are prefixed `--rmds-`: `--rmds-bg`, `--rmds-bg-subtle`, `--rmds-bg-inset`, `--rmds-border`, `--rmds-border-subtle`, `--rmds-text`, `--rmds-text-muted`, `--rmds-accent`, `--rmds-code-bg`, the `--rmds-alert-*` colours and `--rmds-tok-*` syntax colours. Override them in a rule that targets your `className`.
