// Writes the files a static host needs next to the built site: sitemap.xml,
// robots.txt and .nojekyll (so GitHub Pages serves everything as-is).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(site, "dist");

function envValue(name) {
  if (process.env[name]) return process.env[name];
  const file = join(site, ".env");
  if (!existsSync(file)) return "";
  const line = readFileSync(file, "utf8")
    .split("\n")
    .find((l) => l.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim() : "";
}

// Pre-render: put the real page HTML into index.html so search engines and link-preview bots
// see all the content without running JavaScript. The browser then hydrates it.
const ssrDir = join(site, "dist-ssr");
if (existsSync(join(ssrDir, "entry-server.js"))) {
  const { render } = await import(pathToFileURL(join(ssrDir, "entry-server.js")).href);
  const { html, faqJsonLd } = render();
  const indexPath = join(dist, "index.html");
  let page = readFileSync(indexPath, "utf8");
  if (!page.includes('<div id="root"></div>')) throw new Error("postbuild: expected an empty #root in index.html");
  page = page.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  page = page.replace(
    "</head>",
    `<script type="application/ld+json">${faqJsonLd.replace(/</g, "\\u003c")}</script>\n  </head>`,
  );
  writeFileSync(indexPath, page);
  rmSync(ssrDir, { recursive: true, force: true });
  console.log(`postbuild: pre-rendered ${(html.length / 1024).toFixed(0)} kB of HTML into index.html`);
} else {
  console.warn("postbuild: dist-ssr not found; shipping a client-rendered page (worse for SEO)");
}

let url = envValue("VITE_SITE_URL") || "https://akashnegi-github.github.io/react-markdown-studio/";
if (!url.endsWith("/")) url += "/";

writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n`,
);
writeFileSync(join(dist, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${url}sitemap.xml\n`);
writeFileSync(join(dist, ".nojekyll"), "");
console.log(`postbuild: sitemap.xml, robots.txt and .nojekyll written for ${url}`);
