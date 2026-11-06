import type { LangRule, LanguageDef } from "../engine";
import { tokenizeWithRules } from "../engine";

const rules: LangRule[] = [
  { type: "comment", re: /\/\*[\s\S]*?(?:\*\/|$)/y },
  { type: "string", re: /"(?:\\.|[^"\\\n])*"/y },
  { type: "string", re: /'(?:\\.|[^'\\\n])*'/y },
  { type: "property", re: /[a-zA-Z-]+(?=\s*:)/y },
  { type: "number", re: /-?\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms|deg|fr)?/y },
  { type: "variable", re: /--[a-zA-Z0-9-]+/y },
  { type: "keyword", re: /@[a-zA-Z-]+/y },
  { type: "tag", re: /#[a-zA-Z0-9_-]+|\.[a-zA-Z0-9_-]+/y },
  { type: "punctuation", re: /[{}();,:]/y },
  { type: "operator", re: /[>~+*]/y },
];

export const css: LanguageDef = {
  name: "CSS",
  aliases: ["css", "scss", "less"],
  tokenize: (code: string) => tokenizeWithRules(code, rules),
};
