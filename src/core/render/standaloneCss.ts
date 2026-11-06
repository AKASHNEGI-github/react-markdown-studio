/**
 * Compact stylesheet embedded in standalone HTML exports (`markdownToHtmlDocument`).
 * It styles exactly the `rmds-*` classes that `renderToHtml` emits and follows
 * the reader's OS light/dark preference. The interactive editor and viewer use
 * the full theme in `react-markdown-studio/styles.css` instead.
 */
export const STANDALONE_CSS = `
:root{color-scheme:light dark;--bg:#fff;--fg:#1f2328;--muted:#59636e;--line:#d1d9e0;--soft:#f6f8fa;--link:#0969da;--note:#0969da;--tip:#1a7f37;--important:#8250df;--warning:#9a6700;--caution:#cf222e;--k:#cf222e;--s:#0a3069;--c:#6e7781;--n:#0550ae;--f:#8250df;--t:#953800}
@media(prefers-color-scheme:dark){:root{--bg:#0d1117;--fg:#e6edf3;--muted:#9198a1;--line:#3d444d;--soft:#151b23;--link:#4493f8;--note:#4493f8;--tip:#3fb950;--important:#ab7df8;--warning:#d29922;--caution:#f85149;--k:#ff7b72;--s:#a5d6ff;--c:#8b949e;--n:#79c0ff;--f:#d2a8ff;--t:#ffa657}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-text-size-adjust:100%}
main{max-width:820px;margin:0 auto;padding:40px 20px 96px}
.rmds-content>*:first-child{margin-top:0}
.rmds-heading{margin:1.6em 0 .6em;line-height:1.25;font-weight:650;position:relative}
.rmds-h1{font-size:2em}.rmds-h2{font-size:1.5em}.rmds-h3{font-size:1.25em}.rmds-h4{font-size:1em}.rmds-h5{font-size:.875em}.rmds-h6{font-size:.85em;color:var(--muted)}
.rmds-h1,.rmds-h2{padding-bottom:.3em;border-bottom:1px solid var(--line)}
.rmds-heading-anchor{position:absolute;left:-1.1em;color:var(--muted);text-decoration:none;opacity:0}
.rmds-heading:hover .rmds-heading-anchor{opacity:1}
.rmds-p,.rmds-list,.rmds-blockquote,.rmds-table-wrapper,.rmds-code-block,.rmds-code-group,.rmds-alert,.rmds-details{margin:0 0 1em}
.rmds-link{color:var(--link)}
.rmds-inline-code{font:.875em ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:var(--soft);border:1px solid var(--line);border-radius:6px;padding:.15em .4em}
.rmds-code-block{position:relative;border:1px solid var(--line);border-radius:8px;background:var(--soft);overflow:hidden}
.rmds-code-title{padding:6px 14px;font-size:.8em;color:var(--muted);border-bottom:1px solid var(--line)}
.rmds-pre{margin:0;padding:14px 16px;overflow:auto;font:.875em/1.55 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;tab-size:2}
.rmds-copy-btn{position:absolute;top:6px;right:6px;width:30px;height:30px;display:grid;place-items:center;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--muted);cursor:pointer;opacity:0}
.rmds-code-block:hover .rmds-copy-btn,.rmds-copy-btn:focus-visible{opacity:1}
.rmds-copy-btn svg{width:16px;height:16px}
.rmds-tok-keyword,.rmds-tok-operator,.rmds-tok-deleted{color:var(--k)}.rmds-tok-string,.rmds-tok-inserted{color:var(--s)}.rmds-tok-comment,.rmds-tok-meta{color:var(--c);font-style:italic}.rmds-tok-number,.rmds-tok-boolean,.rmds-tok-property,.rmds-tok-attr{color:var(--n)}.rmds-tok-function{color:var(--f)}.rmds-tok-type,.rmds-tok-tag,.rmds-tok-variable{color:var(--t)}
.rmds-code-group{border:1px solid var(--line);border-radius:8px;overflow:hidden}
.rmds-code-group-tabs{display:flex;gap:2px;padding:0 8px;background:var(--soft);border-bottom:1px solid var(--line);overflow-x:auto}
.rmds-code-group-tab{font:inherit;font-size:.85em;padding:8px 12px;border:0;border-bottom:2px solid transparent;background:none;color:var(--muted);cursor:pointer}
.rmds-code-group-tab.rmds-active{color:var(--fg);border-bottom-color:var(--link)}
.rmds-code-group-panel{display:none}.rmds-code-group-panel.rmds-active{display:block}
.rmds-code-group .rmds-code-block{margin:0;border:0;border-radius:0}
.rmds-list{padding-left:1.6em}.rmds-li{margin:.25em 0}
.rmds-checklist-item{list-style:none;margin-left:-1.4em}.rmds-checkbox{margin:0 .5em 0 0}
.rmds-blockquote{padding:.1em 1em;border-left:4px solid var(--line);color:var(--muted)}
.rmds-alert{padding:.6em 1em;border-left:4px solid var(--note);border-radius:0 8px 8px 0;background:var(--soft)}
.rmds-alert-title{display:flex;align-items:center;gap:.5em;font-weight:650;color:var(--note)}.rmds-alert-title svg{width:1em;height:1em;fill:currentColor}
.rmds-alert-body>*:last-child{margin-bottom:0}
.rmds-alert-tip{border-color:var(--tip)}.rmds-alert-tip .rmds-alert-title{color:var(--tip)}
.rmds-alert-important{border-color:var(--important)}.rmds-alert-important .rmds-alert-title{color:var(--important)}
.rmds-alert-warning{border-color:var(--warning)}.rmds-alert-warning .rmds-alert-title{color:var(--warning)}
.rmds-alert-caution{border-color:var(--caution)}.rmds-alert-caution .rmds-alert-title{color:var(--caution)}
.rmds-details{border:1px solid var(--line);border-radius:8px;padding:.5em 1em}
.rmds-summary{cursor:pointer;font-weight:600}.rmds-details-body{margin-top:.5em}
.rmds-table-wrapper{overflow-x:auto}.rmds-table{border-collapse:collapse;width:100%}
.rmds-table th,.rmds-table td{padding:6px 13px;border:1px solid var(--line)}.rmds-table th{background:var(--soft)}
.rmds-hr{border:0;border-top:1px solid var(--line);margin:2em 0}
.rmds-image{max-width:100%;height:auto;border-radius:6px}
@media print{main{padding:0}.rmds-copy-btn{display:none}.rmds-details:not([open]) .rmds-details-body{display:block}}
`.replace(/\n/g, "");
