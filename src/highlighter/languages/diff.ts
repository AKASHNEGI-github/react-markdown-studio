import type { LanguageDef, Token } from "../engine";

export const diff: LanguageDef = {
  name: "Diff",
  aliases: ["diff", "patch"],
  tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    const lines = code.split("\n");
    lines.forEach((line, idx) => {
      if (line.startsWith("+")) tokens.push({ type: "inserted", text: line });
      else if (line.startsWith("-")) tokens.push({ type: "deleted", text: line });
      else if (line.startsWith("@@")) tokens.push({ type: "meta", text: line });
      else tokens.push({ type: "plain", text: line });
      if (idx < lines.length - 1) tokens.push({ type: "plain", text: "\n" });
    });
    return tokens;
  },
};
