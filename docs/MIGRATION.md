# Migrating from `akash-negi-markdown-editor`

`akash-negi-markdown-editor` is deprecated in favour of **`react-markdown-studio`**. Version 1.0.0 contains security fixes, so please upgrade.

## 1. Swap the package

```bash
npm uninstall akash-negi-markdown-editor
npm install react-markdown-studio
```

Update imports: `akash-negi-markdown-editor` becomes `react-markdown-studio`, and the stylesheet import becomes `react-markdown-studio/styles.css`. Component names and props are unchanged.

## 2. Rename CSS hooks

If your own CSS or tests reference the library's classes or variables, rename the prefix:

| Before | After |
|---|---|
| `.mde-*` classes | `.rmds-*` |
| `--mde-*` variables | `--rmds-*` |
| `data-mde-copy` | `data-rmds-copy` |

A search-and-replace of `mde-` with `rmds-` is enough. The new prefix no longer collides with `react-mde`.

## 3. Behaviour changes to be aware of

- **Emphasis follows CommonMark.** `2 * 3 * 4` is plain text, `*a **b** c*` nests, and `***x***` renders as `<em><strong>`. Documents that relied on the old, looser matching may change.
- **Setext headings are headings.** A paragraph followed by `---` or `===` is now a heading (as on GitHub) instead of a paragraph plus rule. Put a blank line before `---` for a horizontal rule.
- **Bare URLs become links** (`https://example.com`, `www.example.com`).
- **Code block titles** now appear in the editor preview.
- **The download button is now an Export menu** (PDF, Markdown, HTML). `showDownloadButton` still controls it.
- **A status bar is shown by default.** Pass `showStatusBar={false}` to hide it.
- Link and image URLs are validated more strictly (control characters can no longer hide a `javascript:` scheme).

## 4. New things worth using

`onImageUpload`, `headingOffset`, `syncScroll`, `markdownToHtmlDocument`, `scripts: false` with `enhanceHtml` for strict CSP, and the `react-markdown-studio/core` entry for server-side rendering. See the [API reference](API.md).

## For the package maintainer: deprecating the old name

```bash
npm deprecate akash-negi-markdown-editor@"*" "Renamed to react-markdown-studio. 0.1.x has a link-sanitization vulnerability fixed in 1.0.0: https://github.com/AKASHNEGI-github/react-markdown-studio/blob/main/docs/MIGRATION.md"
```
