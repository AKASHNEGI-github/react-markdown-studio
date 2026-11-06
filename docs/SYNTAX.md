# Markdown syntax guide

<!-- GENERATED FILE: edit src/editor/syntaxReference.ts, then run `npm run docs:syntax`. -->

React Markdown Studio understands a practical subset of CommonMark and GitHub-Flavored Markdown, plus GitHub-style alerts, collapsible sections and tabbed code groups. Every example below is rendered by the real parser in the test suite, so this page is guaranteed to match the editor. See it live with rendered output on the [website](https://akashnegi-github.github.io/react-markdown-studio/#syntax).

On macOS, use ⌘ wherever a shortcut says Ctrl.

## Text

### Bold

Make text stand out. Shortcut: **Ctrl+B**.

```markdown
**bold text**
```

### Italic

Emphasise text. `_underscores_` work too. Shortcut: **Ctrl+I**.

```markdown
*italic text*
```

### Bold and italic

Combine both; toggling one never drops the other.

```markdown
***bold and italic***
```

### Strikethrough

Cross out text. Shortcut: **Ctrl+Shift+X**.

```markdown
~~no longer true~~
```

### Underline

Underline text using the one HTML tag that renders. Shortcut: **Ctrl+U**.

```markdown
<u>underlined</u>
```

### Subscript

Lower the baseline, as in chemical formulas.

```markdown
H<sub>2</sub>O
```

### Superscript

Raise the baseline, as in exponents.

```markdown
E = mc<sup>2</sup>
```

### Inline code

Monospace for identifiers and short snippets. Shortcut: **Ctrl+E**.

```markdown
Run `npm install` first.
```

### Escaping

A backslash shows a special character literally.

```markdown
\*not italic\*
```

### Line break

End a line with two spaces or a backslash to break without starting a new paragraph.

```markdown
first line\
second line
```

## Structure

### Headings

One to six `#` characters set the level. Each heading gets a linkable anchor. Shortcut: **Ctrl+1 / 2 / 3**.

```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Underlined headings

Underline a line with `=` or `-` for a level 1 or 2 heading.

```markdown
Title
=====

Subtitle
--------
```

### Horizontal rule

A thematic break between sections.

```markdown
---
```

### Blockquote

Quote a passage. Press Enter to continue the quote. Shortcut: **Ctrl+Shift+.**.

```markdown
> Simplicity is the ultimate sophistication.
> Leonardo da Vinci
```

### Table

Pipes separate columns; colons in the divider row set alignment. Click inside a table for row and column tools.

```markdown
| Left | Center | Right |
| :--- | :----: | ----: |
| a    |   b    |     c |
| d    |   e    |     f |
```

## Lists

### Bulleted list

Use `-`, `*` or `+`. Tab and Shift+Tab nest and un-nest items; Enter continues the list. Shortcut: **Ctrl+Shift+8**.

```markdown
- First
- Second
  - Nested
```

### Numbered list

Numbers continue automatically, and Tab nests under the correct indentation. Shortcut: **Ctrl+Shift+7**.

```markdown
1. First
2. Second
   1. Nested
```

### Task list

Checkboxes you can click in the preview, which updates your Markdown. Shortcut: **Ctrl+Shift+9**.

```markdown
- [x] Write the docs
- [ ] Ship the release
```

## Code

### Code block

Fence code with three backticks and a language for syntax highlighting. Every block has a copy button.

````markdown
```ts
const answer: number = 42;
```
````

### Code block title

Add a title in square brackets after the language.

````markdown
```ts [greet.ts]
export const greet = (name: string) => `Hello, ${name}!`;
```
````

### Tabbed code group

Show the same snippet for several tools as tabs. Each fence's title becomes its tab.

````markdown
::: code-group
```bash [npm]
npm install react-markdown-studio
```
```bash [pnpm]
pnpm add react-markdown-studio
```
```bash [yarn]
yarn add react-markdown-studio
```
:::
````

## Links & media

### Link

Wrap the text in brackets and the URL in parentheses. Paste a URL over selected text to link it instantly. Shortcut: **Ctrl+K**.

```markdown
[React Markdown Studio](https://github.com/AKASHNEGI-github/react-markdown-studio "Project home")
```

### Automatic links

Bare web addresses become links, with trailing punctuation handled sensibly.

```markdown
Visit https://example.com or www.example.org.
```

### Image

Like a link with a leading `!`. Pass `onImageUpload` to paste or drop images straight into the editor.

```markdown
![Logo](./logo.svg "Optional title")
```

## Callouts & layout

### Alerts

GitHub-style callouts: NOTE, TIP, IMPORTANT, WARNING and CAUTION.

```markdown
> [!NOTE]
> Useful background information.

> [!WARNING]
> Urgent: avoid doing this.
```

### Collapsible section

A dropdown that hides detail until it is opened. Add `open` to start expanded.

```markdown
<details>
<summary>Click to expand</summary>

Hidden until you ask for it.

</details>
```

## Not supported (yet)

These are deliberately out of scope for a zero-dependency core. They are shown as plain text rather than half-rendered:

- Raw HTML, other than `<u>`, `<sub>`, `<sup>`, `<details>` and `<summary>` (this is a security feature)
- Footnotes, reference-style links and definition lists
- Indented (4-space) code blocks. Use fenced blocks
- Math (KaTeX/MathJax) and diagrams (Mermaid)
- Emoji shortcodes such as `:smile:`. Type the emoji directly

## Security notes

- Link and image URLs are limited to `http:`, `https:`, `mailto:` and relative URLs; everything else becomes `#`.
- Parsing is linear-time and depth-limited, so hostile input cannot hang or crash a page or server.
