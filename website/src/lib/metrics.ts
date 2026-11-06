/**
 * Live, real numbers for the site's metrics strip. Nothing here is invented:
 * every value comes from the public API of the service it is labelled with, is
 * cached briefly in localStorage to be polite to those services, and falls back
 * to "unavailable" (rendered as an em dash) when the service cannot answer, for
 * example before the package is published or when the visit counter is not set up.
 */
import { SITE } from "../config";

const TTL_MS = 10 * 60 * 1000;

function cacheGet<T>(key: string, ttl = TTL_MS): T | null {
  try {
    const raw = localStorage.getItem(`rmds:${key}`);
    if (!raw) return null;
    const { v, t } = JSON.parse(raw) as { v: T; t: number };
    return Date.now() - t < ttl ? v : null;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, v: T): void {
  try {
    localStorage.setItem(`rmds:${key}`, JSON.stringify({ v, t: Date.now() }));
  } catch {
    /* storage unavailable (private mode, quota): just skip caching */
  }
}

async function getJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

/** npm's per-package stats begin on this date. */
const NPM_STATS_START = Date.parse("2015-01-10");
/**
 * The downloads API silently truncates any range longer than about 18 months
 * (no error, just a smaller number), so a lifetime total has to be assembled
 * from consecutive windows. 500 days stays safely under the cap.
 */
const MAX_WINDOW_DAYS = 500;

async function packageCreatedAt(pkg: string): Promise<Date | null> {
  const cached = cacheGet<string>(`created:${pkg}`, Infinity); // the creation date never changes
  if (cached) return new Date(cached);
  try {
    const meta = await getJson<{ time?: { created?: string } }>(`https://registry.npmjs.org/${pkg}`);
    if (meta.time?.created) {
      cacheSet(`created:${pkg}`, meta.time.created);
      return new Date(meta.time.created);
    }
  } catch {
    /* fall through to the one-year fallback below */
  }
  return null;
}

/** Lifetime downloads: the sum of consecutive windows from the package's creation date to today. */
export async function fetchNpmTotal(pkg: string = SITE.npmName): Promise<number> {
  const cached = cacheGet<number>(`npm-total:${pkg}`);
  if (cached !== null) return cached;

  const end = new Date();
  const created = await packageCreatedAt(pkg);
  // If the creation date is unknown, a year back covers any package younger than that.
  let cursor = new Date(Math.max((created ?? addDays(end, -365)).getTime(), NPM_STATS_START));

  let total = 0;
  while (cursor <= end) {
    const windowEnd = new Date(Math.min(addDays(cursor, MAX_WINDOW_DAYS - 1).getTime(), end.getTime()));
    const res = await getJson<{ downloads?: number }>(
      `https://api.npmjs.org/downloads/point/${ymd(cursor)}:${ymd(windowEnd)}/${pkg}`,
    );
    total += res.downloads ?? 0;
    cursor = addDays(windowEnd, 1);
  }
  cacheSet(`npm-total:${pkg}`, total);
  return total;
}

export async function fetchNpmLastMonth(pkg: string = SITE.npmName): Promise<number> {
  const cached = cacheGet<number>(`npm-month:${pkg}`);
  if (cached !== null) return cached;
  const res = await getJson<{ downloads?: number }>(`https://api.npmjs.org/downloads/point/last-month/${pkg}`);
  const n = res.downloads ?? 0;
  cacheSet(`npm-month:${pkg}`, n);
  return n;
}

export async function fetchGithubStars(): Promise<number> {
  const cached = cacheGet<number>("gh-stars");
  if (cached !== null) return cached;
  const res = await getJson<{ stargazers_count?: number }>(`https://api.github.com/repos/${SITE.owner}/${SITE.repo}`);
  const n = res.stargazers_count ?? 0;
  cacheSet("gh-stars", n);
  return n;
}

/** Site-wide page views from GoatCounter's public counter endpoint (needs the site code + the "allow visitor counts" setting). */
export async function fetchSiteVisits(): Promise<number> {
  const code = SITE.goatCounterCode;
  if (!code) throw new Error("GoatCounter not configured");
  const cached = cacheGet<number>(`visits:${code}`, 2 * 60 * 1000);
  if (cached !== null) return cached;
  const res = await getJson<{ count?: string }>(`https://${code}.goatcounter.com/counter/TOTAL.json`);
  const n = Number((res.count ?? "").replace(/\D/g, ""));
  if (!Number.isFinite(n)) throw new Error("unexpected counter response");
  cacheSet(`visits:${code}`, n);
  return n;
}

/** Records this page view with GoatCounter (privacy-friendly: no cookies, no personal data). No-op when unconfigured. */
export function recordVisit(): void {
  const code = SITE.goatCounterCode;
  if (!code || document.querySelector("script[data-goatcounter]")) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://gc.zgo.at/count.js";
  script.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  document.head.appendChild(script);
}
