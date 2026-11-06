/**
 * Token colors approximating GitHub's light and dark code themes.
 * Consumed as CSS custom properties in styles.css (--rmds-tok-*), so a host
 * app can override individual colors without touching JS.
 */
export const githubLightTokenColors: Record<string, string> = {
  plain: "#24292f",
  keyword: "#cf222e",
  type: "#953800",
  string: "#0a3069",
  comment: "#6e7781",
  number: "#0550ae",
  function: "#8250df",
  operator: "#cf222e",
  punctuation: "#24292f",
  tag: "#116329",
  attr: "#953800",
  variable: "#953800",
  boolean: "#0550ae",
  property: "#0550ae",
  inserted: "#116329",
  deleted: "#82071e",
  meta: "#8250df",
};

export const githubDarkTokenColors: Record<string, string> = {
  plain: "#e6edf3",
  keyword: "#ff7b72",
  type: "#ffa657",
  string: "#a5d6ff",
  comment: "#8b949e",
  number: "#79c0ff",
  function: "#d2a8ff",
  operator: "#ff7b72",
  punctuation: "#e6edf3",
  tag: "#7ee787",
  attr: "#ffa657",
  variable: "#ffa657",
  boolean: "#79c0ff",
  property: "#79c0ff",
  inserted: "#aff5b4",
  deleted: "#ffdcd7",
  meta: "#d2a8ff",
};
