// Adds explicit ".js" extensions to relative import/export specifiers in
// the COMPILED dist/**/*.js and dist/**/*.d.ts output (appending
// "/index.js" for directory imports), verifying each one against the
// actual dist/ filesystem rather than guessing.
//
// Why here and not in src/: Node's native ESM resolver requires an
// explicit extension on a relative specifier, and tsc (module: ESNext)
// emits specifiers exactly as written in src/ — so without this step,
// `import { Toolbar } from "./Toolbar"` in dist/ fails under plain
// `node`, even though it works fine through a bundler (Vite/webpack/
// Next.js), which is why the gap can go unnoticed. The obvious fix would
// be to just write ".js" extensions directly in src/, but that breaks the
// *other* documented way to consume this package: copying src/ straight
// into a host app and letting its own bundler compile the TypeScript.
// Next.js's default webpack config, and webpack5 without
// `resolve.extensionAlias` configured, do NOT resolve a ".js" specifier to
// a local ".ts"/".tsx" file (see https://github.com/vercel/next.js/issues/33056
// and https://github.com/webpack/webpack/issues/13252) — so extensioned
// imports in hand-authored src/ would break that path instead. Rewriting
// only the already-compiled dist/ output (real .js files, unambiguous)
// fixes native-Node resolution for the packaged artifact without touching
// the bundler-friendly src/ convention at all.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(root, "dist", "esm");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".js") || name.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

const files = walk(distDir);
const SPECIFIER_RE = /(from\s+["'])(\.[^"']*)(["'])|(import\(\s*["'])(\.[^"']*)(["']\s*\))/g;

let totalChanges = 0;
const problems = [];

for (const absFile of files) {
  const dir = dirname(absFile);
  const src = readFileSync(absFile, "utf8");

  const next = src.replace(SPECIFIER_RE, (whole, p1, spec1, p3, p4, spec2, p6) => {
    const isFrom = spec1 !== undefined;
    const spec = isFrom ? spec1 : spec2;

    if (/\.(js|jsx|json|mjs|cjs|css)$/.test(spec)) return whole; // already fine

    const target = resolve(dir, spec);
    let resolved;
    if (existsSync(target + ".js")) resolved = spec + ".js";
    else if (existsSync(join(target, "index.js"))) resolved = spec + "/index.js";
    else {
      problems.push(`${absFile}: cannot resolve "${spec}"`);
      return whole;
    }

    totalChanges++;
    return isFrom ? `${p1}${resolved}${p3}` : `${p4}${resolved}${p6}`;
  });

  if (next !== src) writeFileSync(absFile, next, "utf8");
}

console.log(`dist/esm extensions: rewrote ${totalChanges} specifier(s) across ${files.length} files.`);
if (problems.length) {
  console.error("UNRESOLVED dist/ specifiers:");
  for (const p of problems) console.error(" -", p);
  process.exit(1);
}
