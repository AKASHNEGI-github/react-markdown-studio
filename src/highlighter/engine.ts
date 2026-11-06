/**
 * A small, dependency-free tokenizer engine. Each language supplies an
 * ordered list of rules (sticky regexes); the first rule that matches at
 * the current position wins. Unmatched characters are merged into "plain"
 * runs. This is a practical approximation, not a full language grammar.
 */

export type TokenType =
  | "plain"
  | "keyword"
  | "type"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "operator"
  | "punctuation"
  | "tag"
  | "attr"
  | "variable"
  | "boolean"
  | "property"
  | "inserted"
  | "deleted"
  | "meta";

export interface Token {
  type: TokenType;
  text: string;
}

export interface LangRule {
  type: TokenType;
  re: RegExp; // must use the sticky ('y') flag
  classify?: (matchedText: string, code: string, matchEndIndex: number) => TokenType;
}

export interface LanguageDef {
  name: string;
  aliases: string[];
  /** Custom tokenizer for languages that don't fit the generic rule model (html, diff, ...). */
  tokenize?: (code: string) => Token[];
  rules?: LangRule[];
}

export function escapeRegExp(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Generic rule-driven tokenizer used by most languages. */
export function tokenizeWithRules(code: string, rules: LangRule[]): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let plainBuf = "";
  const flushPlain = () => {
    if (plainBuf) {
      tokens.push({ type: "plain", text: plainBuf });
      plainBuf = "";
    }
  };

  while (i < code.length) {
    let matched = false;
    for (const rule of rules) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(code);
      if (m && m.index === i && m[0].length > 0) {
        flushPlain();
        const type = rule.classify ? rule.classify(m[0], code, i + m[0].length) : rule.type;
        tokens.push({ type, text: m[0] });
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      plainBuf += code[i];
      i++;
    }
  }
  flushPlain();
  return tokens;
}

export interface CommonRuleOptions {
  lineComment?: string[];
  blockComment?: [string, string][];
  strings?: RegExp[]; // full sticky regexes, each matching one complete string literal
  keywords?: Set<string>;
  types?: Set<string>;
  booleans?: Set<string>;
  /** Case-insensitive keyword matching (e.g. SQL). */
  caseInsensitiveKeywords?: boolean;
  identifierRe?: RegExp; // must be sticky
  extraRules?: LangRule[]; // inserted before the identifier/number rules (e.g. PHP $vars)
}

/** Builds a reasonable rule set for C-like / brace languages from a keyword table. */
export function buildRules(opts: CommonRuleOptions): LangRule[] {
  const rules: LangRule[] = [];

  for (const lc of opts.lineComment ?? []) {
    rules.push({ type: "comment", re: new RegExp(`${escapeRegExp(lc)}[^\\n]*`, "y") });
  }
  for (const [open, close] of opts.blockComment ?? []) {
    rules.push({
      type: "comment",
      re: new RegExp(`${escapeRegExp(open)}[\\s\\S]*?(?:${escapeRegExp(close)}|$)`, "y"),
    });
  }
  for (const s of opts.strings ?? []) rules.push({ type: "string", re: s });
  for (const r of opts.extraRules ?? []) rules.push(r);

  rules.push({ type: "number", re: /0[xX][0-9a-fA-F]+|\d+(\.\d+)?([eE][+-]?\d+)?/y });

  const identifierRe = opts.identifierRe ?? /[A-Za-z_$][A-Za-zA-Z0-9_$]*/y;
  const keywords = opts.keywords ?? new Set<string>();
  const types = opts.types ?? new Set<string>();
  const booleans = opts.booleans ?? new Set<string>();
  const ci = !!opts.caseInsensitiveKeywords;

  rules.push({
    type: "plain",
    re: identifierRe,
    classify: (text, code, end) => {
      const key = ci ? text.toUpperCase() : text;
      if (booleans.has(key)) return "boolean";
      if (keywords.has(key)) return "keyword";
      if (types.has(key)) return "type";
      let j = end;
      while (code[j] === " ") j++;
      if (code[j] === "(") return "function";
      return "plain";
    },
  });

  rules.push({ type: "punctuation", re: /[{}()[\];,.:]/y });
  rules.push({ type: "operator", re: /[+\-*/%=<>!&|^~?]+/y });

  return rules;
}

function upper(words: string[]): Set<string> {
  return new Set(words.map((w) => w.toUpperCase()));
}
export function kwSet(words: string[], caseInsensitive = false): Set<string> {
  return caseInsensitive ? upper(words) : new Set(words);
}
