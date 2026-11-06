import { SITE } from "../config";
import type { SiteTheme } from "../lib/useSiteTheme";
import { GithubMark } from "./ui";

const NAV = [
  ["Playground", "#playground"],
  ["Features", "#features"],
  ["Syntax", "#syntax"],
  ["Install", "#install"],
  ["Compare", "#compare"],
  ["FAQ", "#faq"],
  ["Links", "#links"],
] as const;

export function Header({ theme, onToggleTheme }: { theme: SiteTheme; onToggleTheme: () => void }) {
  return (
    <header className="w-header">
      <div className="w-container w-header-inner">
        <a className="w-brand" href="#top" aria-label={`${SITE.name}, back to top`}>
          <img src="./logo.svg" width="30" height="30" alt="" />
          <span>{SITE.name}</span>
        </a>
        <nav className="w-nav" aria-label="Sections">
          {NAV.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="w-header-actions">
          <a className="w-icon-btn" href={SITE.links.github} aria-label="GitHub repository" title="GitHub">
            <GithubMark />
          </a>
          <button
            type="button"
            className="w-icon-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
