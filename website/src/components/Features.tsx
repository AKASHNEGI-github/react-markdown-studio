import { FEATURES } from "../data/features";
import { Icon, Section } from "./ui";

export function Features() {
  return (
    <Section
      id="features"
      eyebrow="Features"
      title="Everything a Markdown editor should have"
      intro="A complete writing experience without a pile of plugins. All of it ships in one package with no runtime dependencies."
    >
      <ul className="w-grid">
        {FEATURES.map((f) => (
          <li key={f.title} className="w-card">
            <span className="w-card-icon">
              <Icon d={f.icon} />
            </span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
