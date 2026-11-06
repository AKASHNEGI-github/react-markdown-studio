import { useEffect, useState } from "react";
import { fetchGithubStars, fetchNpmLastMonth, fetchNpmTotal, fetchSiteVisits } from "./metrics";

export type MetricState = { status: "loading" } | { status: "ok"; value: number } | { status: "unavailable" };

export interface Metrics {
  downloadsTotal: MetricState;
  downloadsMonth: MetricState;
  stars: MetricState;
  visits: MetricState;
}

const loading: MetricState = { status: "loading" };

/** Loads every metric independently, so one failing service never blanks the others. */
export function useMetrics(): Metrics {
  const [metrics, setMetrics] = useState<Metrics>({
    downloadsTotal: loading,
    downloadsMonth: loading,
    stars: loading,
    visits: loading,
  });

  useEffect(() => {
    let cancelled = false;
    const load = (key: keyof Metrics, task: () => Promise<number>) => {
      task().then(
        (value) => !cancelled && setMetrics((m) => ({ ...m, [key]: { status: "ok", value } })),
        () => !cancelled && setMetrics((m) => ({ ...m, [key]: { status: "unavailable" } })),
      );
    };
    load("downloadsTotal", () => fetchNpmTotal());
    load("downloadsMonth", () => fetchNpmLastMonth());
    load("stars", fetchGithubStars);
    load("visits", fetchSiteVisits);
    return () => {
      cancelled = true;
    };
  }, []);

  return metrics;
}
