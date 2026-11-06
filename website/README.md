# Documentation website and playground

A static site (Vite + React) that demonstrates the library: live playground, generated syntax reference, real npm/GitHub/visit statistics, comparison, FAQ and links. It imports the library **from this repository's source**, so it can never lag behind the code.

```bash
npm run dev            # from the repository root: http://localhost:5173
npm run build          # builds the library, then the website into website/dist
npm run preview:website
```

The production build is **pre-rendered**: `website/scripts/postbuild.mjs` renders the page to HTML at build time and injects it into `index.html`, so search engines and link-preview bots see all the content without running JavaScript, and the browser then hydrates it.

## Configuration

Copy `.env.example` to `.env` (or set the variables in your host or CI):

| Variable | Purpose |
|---|---|
| `VITE_SITE_URL` | Final public URL, with a trailing slash. Used for the canonical link, social cards and `sitemap.xml`. |
| `VITE_GOATCOUNTER_CODE` | GoatCounter site code for the live "site visits" counter. Leave empty to show an em dash. |

Names, links and the repository owner live in one file: `src/config.ts`.

## About the statistics

Nothing is hard-coded or invented. Downloads come from npm's public API (assembled from date windows, because the API silently truncates ranges over about 18 months), stars from the GitHub API, and visits from GoatCounter. Each is cached for a few minutes and shows an em dash if its service cannot answer, for example before the package is published.

## Deploying

- **GitHub Pages:** the included `Deploy website` workflow publishes on every push to `main`. Set *Settings > Pages > Source* to **GitHub Actions**.
- **Netlify / Vercel / Cloudflare Pages:** build command `npm run build`, output directory `website/dist`, Node 22. The asset base is relative, so it works at a domain root or in a sub-path.
- **Any static host:** upload the contents of `website/dist`.
