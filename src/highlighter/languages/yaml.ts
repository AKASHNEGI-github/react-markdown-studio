import type { LanguageDef, Token } from "../engine";

const BOOL_RE = /^(true|false|yes|no|null|~)$/i;

export const yaml: LanguageDef = {
  name: "YAML",
  aliases: ["yaml", "yml"],
  tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    const lines = code.split("\n");
    lines.forEach((line, idx) => {
      const commentIdx = line.indexOf("#");
      const codePart = commentIdx === -1 ? line : line.slice(0, commentIdx);
      const commentPart = commentIdx === -1 ? "" : line.slice(commentIdx);

      const kv = codePart.match(/^(\s*(?:-\s*)?)([^:\s][^:]*?)(:)(\s.*|$)/);
      if (kv) {
        tokens.push({ type: "plain", text: kv[1] });
        tokens.push({ type: "property", text: kv[2] });
        tokens.push({ type: "punctuation", text: kv[3] });
        const value = kv[4];
        const trimmedValue = value.trim();
        // Leading whitespace only (value.trimStart(), not value.trim()) —
        // using the combined lead+trail length here, as an earlier version
        // did, cuts into the value itself whenever trailing whitespace is
        // also present (e.g. "key: true " would slice "true" as " t"),
        // corrupting the highlighted text. `trailing` below re-emits
        // whatever's left after the value so no characters are dropped.
        const leadingLen = value.length - value.trimStart().length;
        const leading = value.slice(0, leadingLen);
        const trailing = value.slice(leadingLen + trimmedValue.length);
        const pushValue = (type: "boolean" | "number" | "string") => {
          tokens.push({ type: "plain", text: leading });
          tokens.push({ type, text: trimmedValue });
          if (trailing) tokens.push({ type: "plain", text: trailing });
        };
        if (trimmedValue && BOOL_RE.test(trimmedValue)) {
          pushValue("boolean");
        } else if (trimmedValue && /^-?\d+(\.\d+)?$/.test(trimmedValue)) {
          pushValue("number");
        } else if (trimmedValue.startsWith('"') || trimmedValue.startsWith("'")) {
          pushValue("string");
        } else {
          tokens.push({ type: "plain", text: value });
        }
      } else {
        tokens.push({ type: "plain", text: codePart });
      }
      if (commentPart) tokens.push({ type: "comment", text: commentPart });
      if (idx < lines.length - 1) tokens.push({ type: "plain", text: "\n" });
    });
    return tokens;
  },
};
