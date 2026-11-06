import { FAQ } from "../data/faq";
import { Section } from "./ui";

export function Faq() {
  return (
    <Section
      id="faq"
      eyebrow="FAQ"
      title="Frequently asked questions"
      intro="Short, honest answers to what people ask before adopting a Markdown editor."
    >
      <div className="w-faq">
        {FAQ.map((item) => (
          <details key={item.q} className="w-faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
