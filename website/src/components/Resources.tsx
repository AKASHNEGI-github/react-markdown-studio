import { SITE } from "../config";
import { Section } from "./ui";

const L = SITE.links;
const ITEMS = [
  ["Source code", "Browse, star and fork the repository on GitHub.", L.github],
  ["npm package", "Versions, tarball contents and install stats.", L.npm],
  ["API reference", "Every prop, ref method and render option.", L.apiDocs],
  ["Markdown syntax guide", "Everything the parser understands, in one page.", L.syntaxDocs],
  ["Report a bug", "Found a problem? Open an issue with a reproduction.", L.issues],
  ["Discussions", "Questions, ideas and show-and-tell.", L.discussions],
  ["Changelog", "What changed in each release.", L.changelog],
  ["Security policy", "How to report a vulnerability privately.", L.security],
  ["Contributing", "Set up the repo and send your first pull request.", L.contributing],
  ["MIT License", "Free for personal and commercial use.", L.license],
] as const;

export function Resources() {
  return (
    <Section
      id="links"
      eyebrow="Links"
      title="Docs, code and community"
      intro="Everything you need to adopt it, extend it or help improve it."
    >
      <ul className="w-grid w-links">
        {ITEMS.map(([title, text, href]) => (
          <li key={title}>
            <a className="w-card w-link-card" href={href}>
              <h3>
                {title} <span aria-hidden="true">↗</span>
              </h3>
              <p>{text}</p>
            </a>
          </li>
        ))}
      </ul>
    </Section>
  );
}
