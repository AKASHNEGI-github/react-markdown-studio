import { CHECK_ICON_SVG, COPY_ICON_SVG } from "./toHtml";

/**
 * Progressive enhancement for HTML produced with `scripts: false`.
 *
 * `renderToHtml(doc, { scripts: false })` emits no inline `<script>` (so it is
 * safe under a strict Content-Security-Policy). The output is still correct
 * and readable, but code-group tabs and copy buttons need a little behaviour.
 * Call `enhanceHtml(container)` once from your own bundle to provide it with a
 * single delegated click listener. It returns a function that removes it.
 *
 * Browser-only: importing this module has no side effects, so it is safe to
 * import during server rendering as long as you only *call* it on the client.
 */
export function enhanceHtml(root: Document | HTMLElement = document): () => void {
  const onClick = (event: Event) => {
    const target = event.target as Element | null;
    if (!target || typeof target.closest !== "function") return;

    const tab = target.closest(".rmds-code-group-tab");
    if (tab) {
      const group = tab.closest(".rmds-code-group");
      if (!group) return;
      const index = tab.getAttribute("data-index");
      group.querySelectorAll(".rmds-code-group-tab").forEach((b) => b.classList.toggle("rmds-active", b === tab));
      group
        .querySelectorAll(".rmds-code-group-panel")
        .forEach((p) => p.classList.toggle("rmds-active", p.getAttribute("data-index") === index));
      return;
    }

    const button = target.closest("[data-rmds-copy]");
    if (!button) return;
    const code = button.closest(".rmds-code-block")?.querySelector(".rmds-code");
    const text = code?.textContent ?? "";
    const done = () => {
      button.classList.add("rmds-copied");
      button.innerHTML = CHECK_ICON_SVG;
      button.setAttribute("aria-label", "Copied");
      button.setAttribute("title", "Copied");
      setTimeout(() => {
        button.classList.remove("rmds-copied");
        button.innerHTML = COPY_ICON_SVG;
        button.setAttribute("aria-label", "Copy code");
        button.setAttribute("title", "Copy code");
      }, 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done, () => {});
    }
  };
  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}
