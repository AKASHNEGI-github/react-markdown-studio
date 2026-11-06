import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
mkdirSync(dist, { recursive: true });
copyFileSync(join(root, "src/react/styles.css"), join(dist, "styles.css"));

// The package root is "type": "module"; the CommonJS tree needs its own marker
// so Node (and TypeScript) read dist/cjs/*.js and *.d.ts as CommonJS.
writeFileSync(join(dist, "cjs", "package.json"), '{"type":"commonjs"}\n');
writeFileSync(join(dist, "esm", "package.json"), '{"type":"module"}\n');
console.log("Copied styles.css and wrote dist/{cjs,esm}/package.json type markers");
