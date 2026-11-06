import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
const pkg = JSON.parse(readFileSync(here("../package.json"), "utf8"));

// The site demos the *current* source of the library through aliases, so the
// playground can never fall behind the code in this repository. (To test the
// published package instead, delete the aliases and `npm i react-markdown-studio`.)
export default defineConfig({
  root: here("."),
  // Relative base: the same build works at a domain root, under /repo-name/ on
  // GitHub Pages, or on any static host, with no configuration.
  base: process.env.VITE_BASE ?? "./",
  plugins: [react()],
  define: {
    __PKG_NAME__: JSON.stringify(pkg.name),
    __PKG_VERSION__: JSON.stringify(pkg.version),
    __PKG_DEPS__: JSON.stringify(Object.keys(pkg.dependencies ?? {}).length),
    __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
  },
  resolve: {
    alias: [
      { find: /^react-markdown-studio\/styles\.css$/, replacement: here("../src/react/styles.css") },
      { find: /^react-markdown-studio\/core$/, replacement: here("../src/core/index.ts") },
      { find: /^react-markdown-studio$/, replacement: here("../src/index.ts") },
    ],
  },
  build: { outDir: "dist", emptyOutDir: true, target: "es2020", chunkSizeWarningLimit: 700 },
});
