# Changelog

All notable changes are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-11-04

First release under the name **react-markdown-studio**. It succeeds the deprecated `akash-negi-markdown-editor` 0.1.x; see the [migration guide](docs/MIGRATION.md).

### Security
- **Fixed a link-sanitization bypass (XSS).** `[x](\u0001javascript:alert(1))` rendered as a live `javascript:` link, because browsers strip *all* leading control characters from a URL while the filter only handled whitespace. URLs are now normalised exactly as the WHATWG URL parser does and then validated by that parser itself.
- **Fixed denial-of-service through quadratic parsing.** Unclosed `[`, `![`, `<u>` and similar constructs made parse time grow with the square of the input (120 to 200 KB of text froze the parser for 6 to 20 seconds). Parsing is now linear-time, with a total budget for link-destination scanning.
- **Fixed crashes on deeply nested input.** Thousands of nested quotes, lists, `<details>`, link labels or emphasis levels threw a stack overflow. Nesting is now capped and degrades to readable text.
- Added `scripts: false` render option and `enhanceHtml()` for strict Content-Security-Policy hosts, and `headingIdPrefix` against DOM clobbering.
- **Fixed printing the host page.** The print stylesheet hid the entire page for every print, not only the editor's own PDF export, so any app importing the stylesheet printed blank pages. It is now scoped to an export in progress.

### Fixed
- Emphasis follows CommonMark flanking rules: `2 * 3 * 4` is no longer italic and `*a **b** c*` nests correctly. `***x***` now renders as `<em><strong>`, matching GitHub.
- `Tab` in numbered lists nests under the parent's marker width (previously it created a separate list).
- Bold/italic toggling understands runs of asterisks: `Ctrl+I` on `**bold**` gives `***bold***` instead of silently dropping the bold.
- Shortcuts that include Shift and a digit or period (`Ctrl+Shift+7/8/9/.`) now work; they compared `event.key`, which is the shifted symbol. Digits also work on layouts such as AZERTY.
- Code block titles (`` ```js [app.js] ``) show in the editor preview and no longer duplicate the tab label inside code groups.
- Heading anchor glyph moved to CSS so it no longer appears in heading text content.
- An explicit `undefined` parse option no longer overrides defaults.
- Documentation matches the code (props, defaults, test counts).

### Added
- Status bar: line and column, words, characters, reading time.
- Synchronised scrolling in split view (`syncScroll`).
- Smart paste: a URL pasted over selected text becomes a link (`smartPaste`).
- Image paste and drop with `onImageUpload` / `onImageUploadError`.
- Export menu: print to PDF, download Markdown, download a standalone HTML page. New ref methods `downloadMarkdown`, `downloadHtml`, `setMarkdown`, `insertText`; new functions `markdownToHtmlDocument` and `renderHtmlDocument`.
- Syntax: GitHub-style bare-URL autolinks, setext headings, headings indented up to three spaces; `Enter` continues blockquotes.
- `headingOffset` to fit embedded Markdown into a page's heading outline.
- Toolbar is a single tab stop with arrow-key navigation (WAI-ARIA toolbar pattern).
- `showModeControls` and `showFullscreenControl` props (documented previously but missing).
- `deferred` preview rendering so large documents stay responsive while typing.
- Dual ESM and CommonJS build with correct types for both, plus `core`, `editor` and `highlighter` entry points.
- A documentation website with a live playground, generated syntax reference, real npm/GitHub/visit statistics, and static pre-rendering for search engines.
- CI on React 18 and 19, package validation (`publint`, `arethetypeswrong`), size budget, issue and PR templates.

### Changed
- CSS classes and variables use the `rmds-` prefix (was `mde-`), which avoids clashing with `react-mde`.
- Tests grew from 90 to about 240, including component, server-rendering, hydration and hostile-input tests.
