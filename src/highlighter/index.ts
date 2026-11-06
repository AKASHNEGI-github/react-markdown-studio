import type { LanguageDef, Token } from "./engine";
import { tokenizeWithRules } from "./engine";
import { javascript } from "./languages/javascript";
import { typescript } from "./languages/typescript";
import { json } from "./languages/json";
import { html } from "./languages/html";
import { css } from "./languages/css";
import { c } from "./languages/c";
import { cpp } from "./languages/cpp";
import { csharp } from "./languages/csharp";
import { java } from "./languages/java";
import { go } from "./languages/go";
import { rust } from "./languages/rust";
import { php } from "./languages/php";
import { python } from "./languages/python";
import { bash } from "./languages/bash";
import { sql } from "./languages/sql";
import { yaml } from "./languages/yaml";
import { markdown } from "./languages/markdown";
import { diff } from "./languages/diff";
import { text } from "./languages/text";

export type { Token, TokenType, LanguageDef } from "./engine";
export { githubLightTokenColors, githubDarkTokenColors } from "./themes";

const LANGUAGES: LanguageDef[] = [
  javascript,
  typescript,
  json,
  html,
  css,
  c,
  cpp,
  csharp,
  java,
  go,
  rust,
  php,
  python,
  bash,
  sql,
  yaml,
  markdown,
  diff,
  text,
];

const REGISTRY = new Map<string, LanguageDef>();
for (const lang of LANGUAGES) {
  for (const alias of lang.aliases) REGISTRY.set(alias.toLowerCase(), lang);
}

/** The list of built-in language aliases, e.g. for building a "language" dropdown. */
export function supportedLanguages(): { label: string; value: string }[] {
  return LANGUAGES.map((l) => ({ label: l.name, value: l.aliases[0] }));
}

export function isLanguageSupported(lang: string | undefined): boolean {
  return !!lang && REGISTRY.has(lang.toLowerCase());
}

/**
 * A pluggable highlighter function. The editor's default is `highlight`
 * below; a host app may supply its own (e.g. wrapping Shiki) via the
 * `highlighter` prop on MarkdownEditor / MarkdownViewer.
 */
export type Highlighter = (code: string, lang: string | undefined) => Token[];

/** Tokenizes `code` for `lang` using the built-in, dependency-free tokenizer. */
export const highlight: Highlighter = (code, lang) => {
  const def = lang ? REGISTRY.get(lang.toLowerCase()) : undefined;
  if (!def) return [{ type: "plain", text: code }];
  if (def.tokenize) return def.tokenize(code);
  if (def.rules) return tokenizeWithRules(code, def.rules);
  return [{ type: "plain", text: code }];
};
