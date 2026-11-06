import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { faqJsonLd } from "./data/faq";

/** Used at build time to pre-render the page, so crawlers and link previews receive real HTML, not an empty shell. */
export function render(): { html: string; faqJsonLd: string } {
  return {
    html: renderToString(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
    faqJsonLd: faqJsonLd(),
  };
}
