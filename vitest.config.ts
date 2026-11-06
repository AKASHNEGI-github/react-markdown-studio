import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  // Mirrors website/vite.config.ts so the website's own components can be tested against the library source.
  resolve: {
    alias: [
      { find: /^react-markdown-studio\/styles\.css$/, replacement: here("./src/react/styles.css") },
      { find: /^react-markdown-studio\/core$/, replacement: here("./src/core/index.ts") },
      { find: /^react-markdown-studio$/, replacement: here("./src/index.ts") },
    ],
  },
  define: {
    __PKG_NAME__: JSON.stringify("react-markdown-studio"),
    __PKG_VERSION__: JSON.stringify("0.0.0-test"),
    __PKG_DEPS__: JSON.stringify(0),
    __BUILD_YEAR__: JSON.stringify(2026),
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
