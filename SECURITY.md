# Security policy

## Supported versions

Security fixes are released for the latest minor version of the current major release.

| Version | Supported |
|---|---|
| 1.x | Yes |
| `akash-negi-markdown-editor` 0.1.x | **No.** Deprecated. 0.1.x contains a link-sanitization vulnerability fixed in 1.0.0 |

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Use GitHub's private vulnerability reporting: open the repository's **Security** tab and choose **Report a vulnerability**. Include a minimal Markdown input that reproduces the problem, the version, and the browser or Node version.

You can expect an acknowledgement within a few days, and a fix or mitigation plan once the report is confirmed. Reporters are credited in the release notes unless they prefer otherwise.

## Threat model

React Markdown Studio is designed to render **untrusted Markdown** from users. In scope:

- Script execution (XSS) through rendered output, including URLs, attributes, and heading ids
- Denial of service through crafted input (time or memory growing faster than linearly, stack overflows)
- Behaviour that leaks the host page's content or breaks its printing

Out of scope: what your own application does with the Markdown or the HTML you render (for example, inserting `markdownToHtml()` output into a page that has a weak Content-Security-Policy), custom highlighters you supply, and the contents of images and links an author chooses to include.

## What the library does to help

- URL schemes limited to `http`, `https`, `mailto` and relative URLs, validated with the platform URL parser
- Raw HTML is never executed; only a fixed set of safe tags is recognised
- Linear-time, depth-limited parsing (covered by hostile-input regression tests)
- `scripts: false` for strict Content-Security-Policy; `headingIdPrefix` against DOM clobbering
- No runtime dependencies, so no transitive supply-chain surface
- npm releases are published from CI with provenance

## Advisory history

- **0.1.x (old package name), fixed in 1.0.0:** link sanitization could be bypassed with a leading control character, for example `[x](\u0001javascript:alert(1))`. Also fixed: quadratic-time parsing and stack overflows on deeply nested input.
