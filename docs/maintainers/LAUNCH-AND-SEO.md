# Launch and SEO playbook (maintainers only)

This file is not published to npm. It lists what is already optimised in the repository, the one-time setup you must do by hand, and an honest distribution plan.

## 1. Already done in the repository

| Area | What is in place |
|---|---|
| npm search | Name matches the query ("react markdown ..."). 32 truthful keywords, a keyword-rich 147-character description, `homepage` pointing at the website, `repository`/`bugs`, `types`, `sideEffects`, ESM + CJS, `engines`. |
| npm quality signals | MIT licence, 1.0.0, README with badges, tests, ESLint, CI, changelog, provenance publishing, TypeScript types, tiny tarball (about 109 kB). |
| README | Primary phrases ("React Markdown editor", "Markdown renderer", "zero-dependency", "live preview", "Next.js", "SSR") in the first screen; install, usage, comparison and FAQ sections for long-tail queries. |
| Website | One `<h1>`, a clean heading outline, pre-rendered HTML (crawlers see all content without JavaScript), `title`, meta description, canonical URL, Open Graph and Twitter cards with a 1200x630 image, `SoftwareSourceCode` and `FAQPage` structured data, `sitemap.xml`, `robots.txt`, a visible FAQ, descriptive link text, fast static hosting. |
| GitHub | Issue and PR templates, security policy, code of conduct, contributing guide, CI badge. |

## 2. One-time setup (about 30 minutes)

### GitHub
1. Create the repository `AKASHNEGI-github/react-markdown-studio` (or rename the old one) and push this code.
2. **About box** (top right of the repo page):
   - Description: `Zero-dependency React Markdown editor with live preview, GitHub-style alerts, tabbed code groups, tables, task lists and syntax highlighting. TypeScript, SSR-safe (Next.js), XSS-hardened. Live playground included.`
   - Website: `https://akashnegi-github.github.io/react-markdown-studio/`
   - Topics (GitHub allows 20): `react`, `react-component`, `markdown`, `markdown-editor`, `react-markdown-editor`, `markdown-renderer`, `markdown-preview`, `live-preview`, `typescript`, `nextjs`, `ssr`, `zero-dependency`, `github-flavored-markdown`, `syntax-highlighting`, `editor`, `accessibility`, `dark-mode`, `npm-package`, `frontend`, `xss`.
3. **Settings > General > Social preview**: upload `website/public/og-image.png` (this is the image shown when the repo link is shared).
4. **Settings > Features**: enable *Discussions*. **Settings > Code security**: enable *Private vulnerability reporting*.
5. **Settings > Pages**: set *Source* to **GitHub Actions**. The `Deploy website` workflow then publishes the site on every push to `main`.
6. (Optional) **Settings > Secrets and variables > Actions > Variables**: add `VITE_SITE_URL` (your final site URL with a trailing slash, if you use a custom domain) and `VITE_GOATCOUNTER_CODE`.

### Visit counter (real numbers)
1. Create a free site at <https://www.goatcounter.com> and note its code (the `xyz` in `xyz.goatcounter.com`).
2. In GoatCounter: **Settings > Site > Allow adding visitor counts on your website** (this is off by default).
3. Put the code in the `VITE_GOATCOUNTER_CODE` repository variable and redeploy. Until then the site shows an em dash, never an invented number.

### npm
1. `npm login` and enable two-factor authentication on your account.
2. Create an **Automation** access token and add it as the repository secret `NPM_TOKEN`.
3. Publish: `git tag v1.0.0 && git push origin v1.0.0`. The `Release` workflow runs every check and publishes with provenance (the badge on the npm page proves the package was built from this repo).
4. Deprecate the old name (see `docs/MIGRATION.md`):
   `npm deprecate akash-negi-markdown-editor@"*" "Renamed to react-markdown-studio. 0.1.x has a link-sanitization vulnerability fixed in 1.0.0."`

### Search engines
1. **Google Search Console**: add a *URL prefix* property for your site, verify (the HTML-file method works: drop the file in `website/public/`), then submit `sitemap.xml`.
2. **Bing Webmaster Tools**: import the property from Search Console.
3. After publishing, request indexing of the home page in Search Console.

## 3. How npm search ranks packages

npm weighs four things: **text match** (name, description, keywords, README), **popularity** (downloads, dependents, stars), **quality** (README, licence, tests, types, CI, linting) and **maintenance** (recent releases, responsiveness). The first and third are done. Popularity comes from adoption, and maintenance from your habits:

- Release small, regular improvements (every few weeks) and keep the changelog current.
- Reply to issues quickly, even with "thanks, looking into it".
- Never stuff keywords or buy stars/downloads. It violates npm and GitHub policy, can get the package removed, and defeats the purpose.

## 4. Getting real users (honest distribution)

Do these in order, and write for people, not search engines:

1. **Make the demo shareable.** The playground's *Copy share link* produces a URL containing the document. Use it in every post.
2. **Write one genuinely useful article** (dev.to or Hashnode) on a concrete problem, for example *"Building a Markdown editor in Next.js with live preview and no dependencies"* or *"A Markdown XSS bug I found by fuzzing control characters"* (the real story behind the 1.0.0 security fixes). Cross-link to the site and repo.
3. **Show it where developers ask.** r/reactjs (Showoff Saturday), r/webdev, Hacker News "Show HN", and X/LinkedIn. Lead with the problem and the live demo, mention it is zero-dependency, be open about trade-offs, and reply to every comment.
4. **Submit to curated lists** (open a PR, following each list's rules): `awesome-react-components`, `awesome-react`, and Markdown-focused lists. Also list it on AlternativeTo.
5. **Be useful in existing conversations.** Answer Stack Overflow and GitHub questions about Markdown editors in React, and disclose that you maintain this package.
6. **Track** weekly downloads, stars, referrers (GoatCounter) and the Search Console *Queries* report, then write the docs and posts that match what people actually search.

## 5. Keep rankings healthy

- Keep one `<h1>` per page and descriptive headings; the website test suite fails if demo Markdown adds a heading to the outline.
- Keep the FAQ honest and current; it feeds the structured data.
- After every release: update `CHANGELOG.md`, tag, and let the workflow publish. Fresh versions improve the npm "maintenance" signal.
