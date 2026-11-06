// Fences are built from a variable so the samples can contain code blocks without escaping backticks everywhere.
const F = "```";

export interface Sample {
  id: string;
  label: string;
  text: string;
}

const tour = `# Welcome to React Markdown Studio

This is the **real component**, not a screenshot. Edit anything on the left; the preview updates on the right.

> [!TIP]
> Try \`Ctrl+B\`, press \`Tab\` inside a list, or paste a URL over some selected text.

## Formatting

Write *italic*, **bold**, ~~strikethrough~~, <u>underline</u>, \`inline code\`, H<sub>2</sub>O and E = mc<sup>2</sup>. Bare links such as https://github.com/AKASHNEGI-github/react-markdown-studio become clickable automatically.

## Lists and tasks

1. Install the package
2. Import the editor
   - Nested bullets just work
   - \`Tab\` and \`Shift+Tab\` indent and outdent
3. Ship it

- [x] Live preview
- [x] Clickable task lists (tick one in the preview!)
- [ ] Your idea here

## Tables

| Feature   |  Status  |                 Notes |
| :-------- | :------: | --------------------: |
| Alignment |   Yes    |  left, centre, right  |
| Tools     |   Yes    |  click inside a table |

## Code

::: code-group
${F}bash [npm]
npm install react-markdown-studio
${F}
${F}bash [pnpm]
pnpm add react-markdown-studio
${F}
${F}bash [yarn]
yarn add react-markdown-studio
${F}
:::

${F}tsx [App.tsx]
import { MarkdownEditor } from "react-markdown-studio";
import "react-markdown-studio/styles.css";

export default function App() {
  return <MarkdownEditor defaultValue="# Hello" />;
}
${F}

> [!WARNING]
> Raw HTML is never executed. Only a few safe tags (\`<u>\`, \`<sub>\`, \`<sup>\`, \`<details>\`) are understood.

<details>
<summary>Why is it safe to render untrusted Markdown?</summary>

Link schemes are checked against an allow-list, raw HTML is shown as text, and parsing is linear-time and depth-limited, so hostile input cannot hang or crash the page.

</details>

---

Made by [Akash Negi](https://github.com/AKASHNEGI-github). MIT licensed.
`;

const readme = `# my-project

> A short, friendly description of what this project does.

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](#) [![License](https://img.shields.io/badge/license-MIT-blue)](#)

## Features

- Fast and tiny
- Fully typed
- Works everywhere

## Installation

::: code-group
${F}bash [npm]
npm install my-project
${F}
${F}bash [yarn]
yarn add my-project
${F}
:::

## Usage

${F}ts [index.ts]
import { greet } from "my-project";

console.log(greet("world")); // Hello, world!
${F}

## Options

| Option    | Type      | Default | Description              |
| --------- | --------- | ------- | ------------------------ |
| \`name\`    | \`string\`  | \`""\`    | Who to greet             |
| \`excited\` | \`boolean\` | \`false\` | Adds an exclamation mark |

> [!NOTE]
> Requires Node.js 18 or newer.

## Contributing

Pull requests are welcome. Please open an issue first to discuss what you would like to change.

## License

[MIT](https://opensource.org/licenses/MIT)
`;

const notes = `# Weekly sync: Product

**Date:** 4 November 2026 | **Attendees:** Priya, Marcus, Akash

## Agenda

1. Release status
2. Roadmap questions
3. Open issues

## Decisions

> [!IMPORTANT]
> Feature freeze is **Friday 17:00**. Anything not merged by then moves to the next release.

## Action items

- [x] Publish the release candidate (Marcus)
- [ ] Update the migration guide (Priya)
- [ ] Triage the three open bugs (Akash)
  - [ ] Editor loses focus on mobile
  - [ ] Table tools hidden in fullscreen

## Metrics

| Metric           | Last week | This week |
| ---------------- | --------: | --------: |
| Weekly installs  |     1,200 |     1,950 |
| Open issues      |        14 |         9 |

<details>
<summary>Raw notes</summary>

- Marcus raised the question of server-side rendering support.
- Priya will share the new onboarding flow on Monday.

</details>
`;

export const SAMPLES: Sample[] = [
  { id: "tour", label: "Feature tour", text: tour },
  { id: "readme", label: "README", text: readme },
  { id: "notes", label: "Meeting notes", text: notes },
  { id: "blank", label: "Blank", text: "" },
];
