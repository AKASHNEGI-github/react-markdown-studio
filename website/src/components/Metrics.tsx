import { SITE } from "../config";
import facts from "../generated/facts.json";
import { useCountUp } from "../lib/useCountUp";
import { useMetrics, type MetricState } from "../lib/useMetrics";

const fmt = (n: number) =>
  new Intl.NumberFormat("en", { notation: n >= 100_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);

function Stat({
  label,
  hint,
  state,
  unavailable,
}: {
  label: string;
  hint: string;
  state: MetricState;
  unavailable: string;
}) {
  const target = state.status === "ok" ? state.value : null;
  const shown = useCountUp(target);
  return (
    <div className="w-stat" data-status={state.status}>
      <div className="w-stat-value" aria-live="polite">
        {state.status === "loading" ? (
          <span className="w-skeleton" role="img" aria-label="Loading" />
        ) : state.status === "unavailable" ? (
          <span title={unavailable} aria-label={unavailable}>
            —
          </span>
        ) : (
          fmt(shown ?? target ?? 0)
        )}
      </div>
      <div className="w-stat-label">{label}</div>
      <div className="w-stat-hint">{hint}</div>
    </div>
  );
}

export function Metrics() {
  const m = useMetrics();
  const sizeKB = facts.packedKB;
  return (
    <section className="w-metrics" aria-label="Live project statistics">
      <div className="w-container">
        <div className="w-stats">
          <Stat
            label="Total downloads"
            hint="npm, all time"
            state={m.downloadsTotal}
            unavailable="Not available: the package may not be published yet, or npm's API is unreachable."
          />
          <Stat
            label="Downloads, last 30 days"
            hint="npm registry"
            state={m.downloadsMonth}
            unavailable="Not available: the package may not be published yet, or npm's API is unreachable."
          />
          <Stat
            label="GitHub stars"
            hint={`${SITE.owner}/${SITE.repo}`}
            state={m.stars}
            unavailable="Not available: the repository may not exist yet, or GitHub's API is rate-limited."
          />
          <Stat
            label="Site visits"
            hint="page views, no cookies"
            state={m.visits}
            unavailable="Not available: the visit counter is not configured yet (see website/.env.example)."
          />
        </div>
        <ul className="w-facts">
          <li>
            <strong>{SITE.dependencyCount}</strong> runtime dependencies
          </li>
          {facts.tests !== null && (
            <li>
              <strong>{facts.tests}</strong> automated tests
            </li>
          )}
          {sizeKB !== null && (
            <li>
              <strong>{Math.round(sizeKB)} kB</strong> npm tarball (ESM + CJS + types)
            </li>
          )}
          <li>
            <strong>TypeScript</strong> first, SSR-safe core
          </li>
        </ul>
      </div>
    </section>
  );
}
