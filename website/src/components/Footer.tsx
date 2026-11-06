import { SITE } from "../config";

export function Footer() {
  return (
    <footer className="w-footer">
      <div className="w-container w-footer-inner">
        <p>
          © {__BUILD_YEAR__} <a href={SITE.author.url}>{SITE.author.name}</a>. Released under the{" "}
          <a href={SITE.links.license}>MIT license</a>.
        </p>
        <p className="w-footer-small">
          {SITE.name} v{SITE.version}.
          {SITE.goatCounterCode ? " Visits are counted with GoatCounter: no cookies, no personal data." : ""}
        </p>
      </div>
    </footer>
  );
}
