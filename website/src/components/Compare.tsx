import facts from "../generated/facts.json";
import { SITE } from "../config";
import { OTHERS } from "../data/compare";
import { Section } from "./ui";

const size = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`);
const month = (iso: string) => new Date(iso).toLocaleString("en", { month: "short", year: "numeric", timeZone: "UTC" });

export function Compare() {
  const rows = [
    {
      name: SITE.npmName,
      kind: "Source + preview",
      deps: SITE.dependencyCount,
      unpackedKB: facts.unpackedKB,
      updated: month(facts.generatedAt),
      mine: true,
    },
    ...OTHERS.map((o) => ({ ...o, mine: false })),
  ];
  return (
    <Section
      id="compare"
      eyebrow="Compare"
      title="How it sits next to the alternatives"
      intro="Different tools suit different jobs. These are measured facts from the npm registry, not a verdict. WYSIWYG editors trade size and dependencies for rich-text editing; this is a source-plus-preview editor, like GitHub's, where you always see and control the Markdown."
    >
      <div className="w-table-wrap">
        <table className="w-table w-compare">
          <thead>
            <tr>
              <th scope="col">Package</th>
              <th scope="col">Editing style</th>
              <th scope="col">Runtime dependencies</th>
              <th scope="col">Unpacked size</th>
              <th scope="col">Last updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className={r.mine ? "w-mine" : undefined}>
                <th scope="row">{r.name}</th>
                <td>{r.kind}</td>
                <td>{r.deps}</td>
                <td>{r.unpackedKB === null ? "n/a" : size(r.unpackedKB)}</td>
                <td>{r.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="w-intro w-intro-sm">
        Snapshot of the public npm registry, 4 November 2026. Sizes are the published tarball unpacked and exclude
        dependencies; this package ships ESM, CommonJS and type definitions.
      </p>
    </Section>
  );
}
