# Contributing

Thank you for helping improve React Markdown Studio. Bug reports, ideas, docs fixes and pull requests are all welcome. By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Please report security issues privately as described in [SECURITY.md](SECURITY.md).

## Setup

Requires Node.js 18 or newer.

```bash
git clone https://github.com/AKASHNEGI-github/react-markdown-studio.git
cd react-markdown-studio
npm install
```

| Command | What it does |
|---|---|
| `npm test` | Unit, component (jsdom), server-rendering and hydration tests |
| `npm run typecheck` | Type-check the library, tests and website |
| `npm run dev` | Website and playground with hot reload (uses the library source directly) |
| `npm run build` | Build the library (ESM + CJS + types) and the website |
| `npm run lint:package` | `publint` and `arethetypeswrong` checks on the packed tarball |
| `npm run docs:syntax` | Regenerate `docs/SYNTAX.md` from `src/editor/syntaxReference.ts` |

## Project layout

```
src/core/         parser (blocks, inline), AST types, HTML and React renderers (no DOM)
src/highlighter/  built-in syntax highlighter engine and language grammars
src/editor/       pure editing commands, history, shortcuts, tables, stats, syntax reference
src/react/        components, hooks, and the stylesheet
website/          documentation site and playground (Vite + React)
tests/            Vitest suites (node and jsdom)
```

## Guidelines

- **Write a test first**, especially for bug fixes. Parser and renderer changes need a case in `tests/commonmark.test.ts`, `tests/hardening.test.ts` or `tests/parser.test.ts`; UI changes need a component test in `tests/editor-ui.test.tsx`.
- **Keep it zero-dependency.** The library must not gain runtime dependencies.
- **Keep the core pure.** `src/core` and `src/editor` must not touch the DOM or React.
- **Docs follow code.** Changing the syntax means editing `src/editor/syntaxReference.ts` (it feeds the in-editor help, the website and `docs/SYNTAX.md`); changing props means updating `docs/API.md`.
- **Mind performance and safety.** Anything in the parser must stay linear-time and bounded for hostile input; `tests/hardening.test.ts` has the pattern.
- Add a line to `CHANGELOG.md` under *Unreleased* for any user-visible change.

## Pull requests

1. Open an issue first for large changes, so we can agree on the approach.
2. Branch from `main`, keep the change focused, and make sure `npm test`, `npm run typecheck` and `npm run build` pass.
3. Describe what changed and why, and link the issue.

## Releasing (maintainers)

Update `CHANGELOG.md` and the version in `package.json`, merge, then push a tag such as `v1.0.1`. The `release` workflow runs the full checks and publishes to npm with provenance.
