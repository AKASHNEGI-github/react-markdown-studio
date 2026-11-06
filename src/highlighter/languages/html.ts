import type { LanguageDef, Token } from "../engine";

const TAG_OPEN_RE = /<\/?[a-zA-Z][a-zA-Z0-9-]*/y;
const COMMENT_RE = /<!--[\s\S]*?(?:-->|$)/y;
const ATTR_RE = /[a-zA-Z-]+(?=\s*=)|[a-zA-Z-]+/y;
const ATTR_VALUE_RE = /=\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/y;

export const html: LanguageDef = {
  name: "HTML",
  aliases: ["html", "xml", "svg", "htm"],
  tokenize(code: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    let plain = "";
    const flush = () => {
      if (plain) {
        tokens.push({ type: "plain", text: plain });
        plain = "";
      }
    };

    while (i < code.length) {
      COMMENT_RE.lastIndex = i;
      const cm = COMMENT_RE.exec(code);
      if (cm && cm.index === i) {
        flush();
        tokens.push({ type: "comment", text: cm[0] });
        i += cm[0].length;
        continue;
      }

      TAG_OPEN_RE.lastIndex = i;
      const tm = TAG_OPEN_RE.exec(code);
      if (tm && tm.index === i) {
        flush();
        tokens.push({ type: "tag", text: tm[0] });
        i += tm[0].length;
        // consume attributes until we hit '>' or '/>'
        while (i < code.length && code[i] !== ">") {
          if (code.startsWith("/>", i)) break;
          if (/\s/.test(code[i])) {
            plain += code[i];
            i++;
            continue;
          }
          ATTR_VALUE_RE.lastIndex = i;
          const avm = ATTR_VALUE_RE.exec(code);
          if (avm && avm.index === i) {
            flush();
            // avm[0] is "=", any whitespace, then the quoted value (avm[1]).
            // Emit the "=" + whitespace prefix as one token instead of a
            // hardcoded "=" so that whitespace (e.g. `attr = "value"`)
            // isn't silently dropped from the highlighted output.
            const prefix = avm[0].slice(0, avm[0].length - avm[1].length);
            tokens.push({ type: "operator", text: prefix });
            tokens.push({ type: "string", text: avm[1] });
            i += avm[0].length;
            continue;
          }
          ATTR_RE.lastIndex = i;
          const am = ATTR_RE.exec(code);
          if (am && am.index === i) {
            flush();
            tokens.push({ type: "attr", text: am[0] });
            i += am[0].length;
            continue;
          }
          plain += code[i];
          i++;
        }
        flush();
        if (code.startsWith("/>", i)) {
          tokens.push({ type: "tag", text: "/>" });
          i += 2;
        } else if (code[i] === ">") {
          tokens.push({ type: "tag", text: ">" });
          i += 1;
        }
        continue;
      }

      plain += code[i];
      i++;
    }
    flush();
    return tokens;
  },
};
