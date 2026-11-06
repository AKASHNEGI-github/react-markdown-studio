/** Single place to edit every link, name and identifier used across the site. */
const owner = "AKASHNEGI-github";
const repo = "react-markdown-studio";
const repoUrl = `https://github.com/${owner}/${repo}`;
const npmName = __PKG_NAME__;

export const SITE = {
  name: "React Markdown Studio",
  tagline: "The zero-dependency Markdown editor for React",
  description:
    "Split-view live preview, GitHub-style alerts, tabbed code groups, smart tables and a security-hardened renderer in one tiny, SSR-safe, TypeScript-first package.",
  npmName,
  version: __PKG_VERSION__,
  dependencyCount: __PKG_DEPS__,
  owner,
  repo,
  author: { name: "Akash Negi", url: `https://github.com/${owner}` },
  url: import.meta.env.VITE_SITE_URL ?? `https://${owner.toLowerCase()}.github.io/${repo}/`,
  goatCounterCode: (import.meta.env.VITE_GOATCOUNTER_CODE ?? "").trim(),
  links: {
    github: repoUrl,
    npm: `https://www.npmjs.com/package/${npmName}`,
    issues: `${repoUrl}/issues`,
    discussions: `${repoUrl}/discussions`,
    changelog: `${repoUrl}/blob/main/CHANGELOG.md`,
    license: `${repoUrl}/blob/main/LICENSE`,
    security: `${repoUrl}/blob/main/SECURITY.md`,
    contributing: `${repoUrl}/blob/main/CONTRIBUTING.md`,
    apiDocs: `${repoUrl}/blob/main/docs/API.md`,
    syntaxDocs: `${repoUrl}/blob/main/docs/SYNTAX.md`,
    migration: `${repoUrl}/blob/main/docs/MIGRATION.md`,
  },
} as const;
