import { buildRules, kwSet, type LanguageDef } from "../engine";

export const json: LanguageDef = {
  name: "JSON",
  aliases: ["json", "jsonc"],
  rules: buildRules({
    strings: [/"(?:\\.|[^"\\\n])*"/y],
    keywords: kwSet(["null"]),
    booleans: kwSet(["true", "false"]),
  }),
};
