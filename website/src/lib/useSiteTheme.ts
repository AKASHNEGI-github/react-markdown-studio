import { useCallback, useEffect, useState } from "react";

export type SiteTheme = "light" | "dark";
const KEY = "rmds-site-theme";

/** Site theme. The initial value is set by an inline script in index.html, before first paint, so there is no flash. */
export function useSiteTheme(): { theme: SiteTheme; toggle: () => void } {
  // The first render must match the server-rendered HTML ("light"), or hydration would mismatch;
  // the effect below then adopts the theme the inline script already applied before first paint.
  const [theme, setTheme] = useState<SiteTheme>("light");

  const apply = useCallback((next: SiteTheme) => {
    document.documentElement.dataset.theme = next;
    setTheme(next);
  }, []);

  const toggle = useCallback(() => {
    const next: SiteTheme = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
    apply(next);
  }, [theme, apply]);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  // Follow the OS setting until the visitor makes an explicit choice.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return; // very old or embedded webviews
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem(KEY)) return;
      } catch {
        /* ignore */
      }
      apply(e.matches ? "dark" : "light");
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [apply]);

  return { theme, toggle };
}
