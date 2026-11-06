import type { LanguageDef } from "../engine";

export const text: LanguageDef = {
  name: "Plain Text",
  aliases: ["text", "txt", "plaintext", "plain", "none"],
  tokenize: (code: string) => [{ type: "plain", text: code }],
};
